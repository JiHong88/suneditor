import { dom, unicode } from '../../../helper';

/**
 * @typedef {Object} EffectContext_keydown
 * @property {SunEditor.EventPorts} ports - Ports for interacting with editor
 * @property {SunEditor.EventKeydownCtx} ctx - Reducer context
 */

/**
 * @typedef {(ctx: EffectContext_keydown, payload?: *) => *} Effect
 */

/** @type {Record<string, Effect>} */
export default {
	// backspace and delete
	/** @action delFormatRemoveAndMove */
	'del.format.removeAndMove': ({ ports }, { container, formatEl }) => {
		const rInfo = ports.html.remove();
		if (rInfo.commonCon !== rInfo.container && formatEl.parentElement) {
			if (formatEl.contains(container)) {
				const focusNode = LineDelete_next(formatEl);
				ports.selection.setRange(focusNode, focusNode.textContent.length, focusNode, focusNode.textContent.length);
			} else {
				const { focusNode, focusOffset } = LineDelete_prev(formatEl);
				ports.selection.setRange(focusNode, focusOffset, focusNode, focusOffset);
			}
		}
	},

	// backspace
	/** @action backspaceFormatMaintain */
	'backspace.format.maintain': ({ ctx }, { formatEl }) => {
		if (formatEl.nodeName.toUpperCase() === ctx.options.get('defaultLine').toUpperCase()) {
			formatEl.innerHTML = '<br>';
			const attrs = formatEl.attributes;
			while (attrs[0]) {
				formatEl.removeAttribute(attrs[0].name);
			}
		} else {
			formatEl.parentNode.replaceChild(dom.utils.createElement(ctx.options.get('defaultLine'), null, '<br>'), formatEl);
		}
	},
	/** @action backspaceComponentSelect */
	'backspace.component.select': ({ ports }, { selectionNode, range, fileComponentInfo }) => {
		let currentZWS = null;
		if (dom.check.isBreak(selectionNode)) dom.utils.removeItem(selectionNode);
		else if (dom.check.isBreak((currentZWS = range.startContainer.childNodes?.[range.startOffset]))) dom.utils.removeItem(currentZWS);

		if (ports.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) ports.editor.blur();
	},
	/** @action backspaceComponentRemove */
	'backspace.component.remove': ({ ports }, { isList, sel, formatEl, fileComponentInfo }) => {
		if (isList) dom.utils.removeItem(sel);
		if (formatEl.textContent.length === 0) dom.utils.removeItem(formatEl);
		if (ports.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) ports.editor.blur();
	},
	/** @action backspaceListMergePrev */
	'backspace.list.mergePrev': ({ ports }, { prev, formatEl, rangeEl }) => {
		let con = prev === rangeEl.parentNode ? rangeEl.previousSibling : prev.lastChild;
		if (!con) {
			con = dom.utils.createTextNode(unicode.zeroWidthSpace);
			rangeEl.parentNode.insertBefore(con, rangeEl.parentNode.firstChild);
		}
		const offset = con.nodeType === 3 ? con.textContent.length : 1;
		const children = formatEl.childNodes;
		let after = con;
		let child = children[0];
		while ((child = children[0])) {
			prev.insertBefore(child, after.nextSibling);
			after = child;
		}

		dom.utils.removeItem(formatEl);
		if (rangeEl.children.length === 0) dom.utils.removeItem(rangeEl);

		ports.selection.setRange(con, offset, con, offset);
	},
	/** @action backspaceListRemoveNested */
	'backspace.list.removeNested': ({ ports }, { range }) => {
		ports.html.remove();
		if (range.startContainer.nodeType === 3) {
			ports.selection.setRange(range.startContainer, range.startContainer.textContent.length, range.startContainer, range.startContainer.textContent.length);
		}
	},

	// delete
	/** @action deleteComponentSelect */
	'delete.component.select': ({ ports }, { formatEl, fileComponentInfo }) => {
		if (dom.check.isListCell(formatEl)) {
			const prev = fileComponentInfo.container.previousSibling;
			if (dom.check.isZeroWidth(prev)) dom.utils.removeItem(prev);
		} else if (dom.check.isZeroWidth(formatEl)) {
			dom.utils.removeItem(formatEl);
		}

		if (ports.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) ports.editor.blur();
	},
	/** @action deleteComponentSelectNext */
	'delete.component.selectNext': ({ ports, ctx }, { formatEl, nextEl }) => {
		if (dom.check.isZeroWidth(formatEl)) {
			dom.utils.removeItem(formatEl);
			// table component
			if (dom.check.isTable(nextEl)) {
				let cell = /** @type {HTMLElement} */ (dom.query.getEdgeChild(nextEl, dom.check.isTableCell, false));
				cell = /** @type {HTMLElement} */ (cell.firstElementChild || cell);

				ports.selection.setRange(cell, 0, cell, 0);
				return;
			}
		}

		// select file component
		const fileComponentInfo = ports.component.get(nextEl);
		if (fileComponentInfo) {
			ctx.e.stopPropagation();
			if (ports.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) ports.editor.blur();
		} else if (ports.component.is(nextEl)) {
			ctx.e.stopPropagation();
			dom.utils.removeItem(nextEl);
		}
	},
	/** @action deleteListRemoveNested */
	'delete.list.removeNested': ({ ports, ctx }, { range, formatEl, rangeEl }) => {
		if (range.startContainer !== range.endContainer) ports.html.remove();

		const next = /** @type {HTMLElement} */ (dom.utils.arrayFind(formatEl.children, dom.check.isList) || formatEl.nextElementSibling || rangeEl.parentElement.nextElementSibling);
		if (next && (dom.check.isList(next) || dom.utils.arrayFind(next.children, dom.check.isList))) {
			ctx.e.preventDefault();

			let con, children;
			if (dom.check.isList(next)) {
				const child = next.firstElementChild;
				children = child.childNodes;
				con = children[0];
				while (children[0]) {
					formatEl.insertBefore(children[0], next);
				}
				dom.utils.removeItem(child);
			} else {
				con = next.firstChild;
				children = next.childNodes;
				while (children[0]) {
					formatEl.appendChild(children[0]);
				}
				dom.utils.removeItem(next);
			}

			ports.selection.setRange(con, 0, con, 0);
			ports.history.push(true);
		}
	},

	// tab
	/** @action tabFormatIndent */
	'tab.format.indent': ({ ports, ctx }, { range, formatEl, shift }) => {
		const selectedFormats = ports.format.getLines(null);

		const cells = [];
		const lines = [];
		const firstCell = dom.check.isListCell(selectedFormats[0]),
			lastCell = dom.check.isListCell(selectedFormats.at(-1));
		let r = {
			sc: range.startContainer,
			so: range.startOffset,
			ec: range.endContainer,
			eo: range.endOffset,
		};
		for (let i = 0, len = selectedFormats.length, f; i < len; i++) {
			f = selectedFormats[i];
			if (dom.check.isListCell(f)) {
				if (!f.previousElementSibling && !shift) {
					continue;
				} else {
					cells.push(f);
				}
			} else {
				lines.push(f);
			}
		}

		// Nested list
		if (cells.length > 0) {
			r = ports.listFormat.applyNested(cells, shift);
		}

		// Lines tab
		if (lines.length > 0) {
			if (!shift) {
				if (lines.length === 1) {
					let tabSize = ctx.status.tabSize + 1;
					if (ctx.options.get('syncTabIndent')) {
						const baseIndex = dom.query.findTextIndexOnLine(formatEl, range.startContainer, range.startOffset, (current) => ports.component.is(current));
						const prevTabEndIndex = ports.format.isLine(formatEl.previousElementSibling) ? dom.query.findTabEndIndex(formatEl.previousElementSibling, baseIndex, 2) : 0;
						if (prevTabEndIndex > baseIndex) {
							tabSize = prevTabEndIndex - baseIndex;
						}
					}

					const tabText = dom.utils.createTextNode(new Array(tabSize).join('\u00A0'));
					if (!ports.html.insertNode(tabText, { afterNode: null, skipCharCount: false })) return false;
					if (!firstCell) {
						r.sc = tabText;
						r.so = tabText.length;
					}
					if (!lastCell) {
						r.ec = tabText;
						r.eo = tabText.length;
					}
				} else {
					const tabText = dom.utils.createTextNode(new Array(ctx.status.tabSize + 1).join('\u00A0'));
					const len = lines.length - 1;
					for (let i = 0, child; i <= len; i++) {
						child = lines[i].firstChild;
						if (!child) continue;

						if (dom.check.isBreak(child)) {
							lines[i].insertBefore(tabText.cloneNode(false), child);
						} else {
							child.textContent = tabText.textContent + child.textContent;
						}
					}

					const firstChild = dom.query.getEdgeChild(lines[0], 'text', false);
					const endChild = dom.query.getEdgeChild(lines[len], 'text', true);
					if (!firstCell && firstChild) {
						r.sc = firstChild;
						r.so = 0;
					}
					if (!lastCell && endChild) {
						r.ec = endChild;
						r.eo = endChild.textContent.length;
					}
				}
			} else {
				const len = lines.length - 1;
				for (let i = 0, line; i <= len; i++) {
					line = lines[i].childNodes;
					for (let c = 0, cLen = line.length, child; c < cLen; c++) {
						child = line[c];
						if (!child) break;
						if (dom.check.isZeroWidth(child)) continue;

						if (/^\s{1,4}$/.test(child.textContent)) {
							dom.utils.removeItem(child);
						} else if (/^\s{1,4}/.test(child.textContent)) {
							child.textContent = child.textContent.replace(/^\s{1,4}/, '');
						}

						break;
					}
				}

				const firstChild = dom.query.getEdgeChild(lines[0], 'text', false);
				const endChild = dom.query.getEdgeChild(lines[len], 'text', true);
				if (!firstCell && firstChild) {
					r.sc = firstChild;
					r.so = 0;
				}
				if (!lastCell && endChild) {
					r.ec = endChild;
					r.eo = endChild.textContent.length;
				}
			}
		}

		ports.selection.setRange(r.sc, r.so, r.ec, r.eo);
	},

	// enter
	/** @action enterScrollTo */
	'enter.scrollTo': ({ ports }, { range }) => {
		ports.enterScrollTo(range);
	},
	/** @action enterLineAddDefault */
	'enter.line.addDefault': ({ ports, ctx }, { formatEl }) => {
		const newFormat = ports.format.addLine(formatEl, ctx.options.get('defaultLine'));
		const temp = newFormat.firstChild;
		if (dom.check.isBreak(temp)) {
			const zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
			temp.parentNode.insertBefore(zeroWidth, temp);
			ports.selection.setRange(zeroWidth, 1, zeroWidth, 1);
		} else {
			ports.selection.setRange(temp, 0, temp, 0);
		}
	},
	/** @action enterListAddItem */
	'enter.list.addItem': ({ ports }, { formatEl, selectionNode }) => {
		const br = dom.utils.createElement('BR');
		const newEl = dom.utils.createElement('LI', null, br);

		formatEl.parentNode.insertBefore(newEl, formatEl.nextElementSibling);
		newEl.appendChild(selectionNode.nextSibling);

		ports.selection.setRange(br, 1, br, 1);
	},
	/** @action enterFormatExitEmpty */
	'enter.format.exitEmpty': ({ ports, ctx }, { formatEl, rangeEl }) => {
		let newEl = null;

		if (dom.check.isListCell(rangeEl.parentElement)) {
			const parentLi = formatEl.parentNode.parentElement;
			rangeEl = parentLi.parentElement;
			const newListCell = dom.utils.createElement('LI');
			newListCell.innerHTML = '<br>';
			dom.utils.copyTagAttributes(newListCell, formatEl, ctx.options.get('lineAttrReset'));
			newEl = newListCell;
			rangeEl.insertBefore(newEl, parentLi.nextElementSibling);
		} else {
			let newFormat;
			if (dom.check.isTableCell(rangeEl.parentElement)) {
				newFormat = 'DIV';
			} else if (dom.check.isList(rangeEl.parentElement)) {
				newFormat = 'LI';
			} else if (ports.format.isLine(rangeEl.nextElementSibling)) {
				newFormat = rangeEl.nextElementSibling.nodeName;
			} else if (ports.format.isLine(rangeEl.previousElementSibling)) {
				newFormat = rangeEl.previousElementSibling.nodeName;
			} else {
				newFormat = ctx.options.get('defaultLine');
			}

			newEl = dom.utils.createElement(newFormat);
			const edge = ports.format.removeBlock(rangeEl, { selectedFormats: [formatEl], newBlockElement: null, shouldDelete: true, skipHistory: true });
			edge.cc.insertBefore(newEl, edge.ec);
		}

		newEl.innerHTML = '<br>';
		ports.nodeTransform.removeAllParents(formatEl, null, null);
		ports.selection.setRange(newEl, 1, newEl, 1);
	},
	/** @action enterFormatCleanBrAndZWS */
	'enter.format.cleanBrAndZWS': ({ ports }, { selectionNode, selectionFormat, brBlock, children, offset }) => {
		if (selectionFormat) dom.utils.removeItem(children[offset - 1]);
		else dom.utils.removeItem(selectionNode);
		const brBlockNext = /** @type {HTMLElement} */ (brBlock).nextElementSibling;
		const newEl = ports.format.addLine(brBlock, ports.format.isLine(brBlockNext) ? brBlockNext : null);
		dom.utils.copyFormatAttributes(newEl, brBlock);
		ports.selection.setRange(newEl, 1, newEl, 1);
	},
	/** @action enterFormatInsertBrHtml */
	'enter.format.insertBrHtml': ({ ports }, { brBlock, range, wSelection, offset }) => {
		ports.html.insert(range.collapsed && dom.check.isBreak(range.startContainer.childNodes[range.startOffset - 1]) ? '<br>' : '<br><br>', { selectInserted: false, skipCharCount: true, skipCleaning: true });

		let focusNode = wSelection.focusNode;
		const wOffset = wSelection.focusOffset;
		if (brBlock === focusNode) {
			focusNode = focusNode.childNodes[wOffset - offset > 1 ? wOffset - 1 : wOffset];
		}

		ports.selection.setRange(focusNode, 1, focusNode, 1);
		ports.setOnShortcutKey(true);
	},
	/** @action enterFormatInsertBrNode */
	'enter.format.insertBrNode': ({ ports }, { wSelection }) => {
		const focusNext = wSelection.focusNode.nextSibling;
		const br = dom.utils.createElement('BR');
		ports.html.insertNode(br, { afterNode: null, skipCharCount: true });

		const brPrev = br.previousSibling,
			brNext = br.nextSibling;
		if (!dom.check.isBreak(focusNext) && !dom.check.isBreak(brPrev) && (!brNext || dom.check.isZeroWidth(brNext))) {
			br.parentNode.insertBefore(br.cloneNode(false), br);
			ports.selection.setRange(br, 1, br, 1);
		} else {
			ports.selection.setRange(brNext, 0, brNext, 0);
		}

		ports.setOnShortcutKey(true);
	},
	/** @action enterFormatBreakAtEdge */
	'enter.format.breakAtEdge': ({ ports, ctx }, { formatEl, selectionNode, formatStartEdge, formatEndEdge }) => {
		const focusBR = dom.utils.createElement('BR');
		const newFormat = dom.utils.createElement(formatEl.nodeName, null, focusBR);

		dom.utils.copyTagAttributes(newFormat, formatEl, ctx.options.get('lineAttrReset'));

		let child = focusBR;
		let sNode = selectionNode;
		do {
			if (!dom.check.isBreak(sNode) && sNode.nodeType === 1) {
				const f = /** @type {HTMLElement} */ (sNode.cloneNode(false));
				f.appendChild(child);
				child = f;
			}
			sNode = sNode.parentElement;
		} while (formatEl !== sNode && formatEl.contains(sNode));

		newFormat.appendChild(child);
		formatEl.parentNode.insertBefore(newFormat, formatStartEdge && !formatEndEdge ? formatEl : formatEl.nextElementSibling);
		if (formatEndEdge) {
			ports.selection.setRange(focusBR, 1, focusBR, 1);
		} else {
			const firstEl = formatEl.firstChild || formatEl;
			ports.selection.setRange(firstEl, 0, firstEl, 0);
		}
	},
	/** @action enterFormatBreakWithSelection */
	'enter.format.breakWithSelection': ({ ports, ctx }, { formatEl, range, formatStartEdge, formatEndEdge }) => {
		const isMultiLine = ports.format.getLine(range.startContainer, null) !== ports.format.getLine(range.endContainer, null);
		const newFormat = /** @type {HTMLElement} */ (formatEl.cloneNode(false));
		newFormat.innerHTML = '<br>';
		const commonCon = /** @type {HTMLElement} */ (range.commonAncestorContainer);
		const rcon =
			commonCon === range.startContainer && commonCon === range.endContainer && dom.check.isZeroWidth(commonCon)
				? { container: commonCon, offset: range.endOffset, prevContainer: commonCon.previousElementSibling, commonCon: commonCon }
				: ports.html.remove();

		let newEl = ports.format.getLine(rcon.container, null);
		let offset = 0;

		if (!newEl) {
			if (dom.check.isWysiwygFrame(rcon.container)) {
				ports.enterPrevent(ctx.e);
				ctx.fc.get('wysiwyg').appendChild(newFormat);
				newEl = newFormat;
				dom.utils.copyTagAttributes(newEl, formatEl, ctx.options.get('lineAttrReset'));
				ports.selection.setRange(newEl, offset, newEl, offset);
			}

			return;
		}

		const innerRange = ports.format.getBlock(rcon.container);
		newEl = newEl.contains(innerRange) ? dom.query.getEdgeChild(innerRange, (current) => Boolean(ports.format.getLine(current)), false) : newEl;
		if (isMultiLine) {
			if (formatEndEdge && !formatStartEdge) {
				newEl.parentNode.insertBefore(newFormat, !rcon.prevContainer || rcon.container === rcon.prevContainer ? newEl.nextElementSibling : newEl);
				newEl = newFormat;
				offset = 0;
			} else {
				offset = rcon.offset;
				if (formatStartEdge) {
					const tempEl = newEl.parentNode.insertBefore(newFormat, newEl);
					if (formatEndEdge) {
						newEl = tempEl;
						offset = 0;
					}
				}
			}
		} else {
			if (formatEndEdge && formatStartEdge) {
				newEl.parentNode.insertBefore(newFormat, rcon.prevContainer && rcon.container === rcon.prevContainer ? newEl.nextElementSibling : newEl);
				newEl = newFormat;
				offset = 0;
			} else if (formatEndEdge) {
				newEl = newEl.parentNode.insertBefore(newFormat, newEl.nextElementSibling);
				newEl = newFormat;
				offset = 0;
			} else {
				newEl = ports.nodeTransform.split(rcon.container, rcon.offset, dom.query.getNodeDepth(formatEl));
			}
		}

		ports.enterPrevent(ctx.e);
		dom.utils.copyTagAttributes(newEl, formatEl, ctx.options.get('lineAttrReset'));
		ports.selection.setRange(newEl, offset, newEl, offset);
	},
	/** @action enterFormatBreakAtCursor */
	'enter.format.breakAtCursor': ({ ports, ctx }, { formatEl, range }) => {
		let newEl = null;

		if (dom.check.isZeroWidth(formatEl)) {
			newEl = ports.format.addLine(formatEl, formatEl.cloneNode(false));
		} else {
			newEl = ports.nodeTransform.split(range.endContainer, range.endOffset, dom.query.getNodeDepth(formatEl));
		}

		ports.enterPrevent(ctx.e);
		dom.utils.copyTagAttributes(newEl, formatEl, ctx.options.get('lineAttrReset'));
		ports.selection.setRange(newEl, 0, newEl, 0);
	},
	/** @action enterFigcaptionExitInList */
	'enter.figcaption.exitInList': ({ ports }, { formatEl }) => {
		const newEl = ports.format.addLine(formatEl, null);
		ports.selection.setRange(newEl, 0, newEl, 0);
	},

	// keydown reducer
	/** @action keydownInputInsertNbsp */
	'keydown.input.insertNbsp': ({ ports }) => {
		const nbsp = ports.html.insertNode(dom.utils.createTextNode('\u00a0'), { afterNode: null, skipCharCount: true });
		if (nbsp) {
			ports.selection.setRange(nbsp, nbsp.length, nbsp, nbsp.length);
		}
	},
	/** @action keydownInputInsertZWS */
	'keydown.input.insertZWS': ({ ports }) => {
		const zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
		ports.html.insertNode(zeroWidth, { afterNode: null, skipCharCount: true });
		ports.selection.setRange(zeroWidth, 1, zeroWidth, 1);
	},
};

/**
 * @param {HTMLElement} formatEl - Format element
 * @returns {Node}
 */
function LineDelete_next(formatEl) {
	const focusNode = formatEl.lastChild;
	const next = formatEl.nextElementSibling;

	if (!next) return focusNode;

	if (dom.check.isZeroWidth(next)) {
		dom.utils.removeItem(next);
		return focusNode;
	}

	const nextChild = next.childNodes;
	while (nextChild[0]) {
		formatEl.appendChild(nextChild[0]);
	}

	dom.utils.removeItem(next);

	return focusNode;
}

/**
 * @param {HTMLElement} formatEl - Format element
 * @returns {{focusNode: Node, focusOffset: number}}
 */
function LineDelete_prev(formatEl) {
	const formatChild = formatEl.childNodes;
	const prev = formatEl.previousElementSibling;
	let focusNode = formatChild[0];
	let focusOffset = 0;

	if (!prev) return { focusNode, focusOffset };

	if (dom.check.isZeroWidth(prev)) {
		dom.utils.removeItem(prev);
		return { focusNode, focusOffset };
	}

	if (formatChild.length > 1 || formatChild[0]?.textContent.length > 0) {
		while (formatChild[0]) {
			prev.appendChild(formatChild[0]);
		}
	} else {
		focusNode = prev.lastChild;
		focusOffset = focusNode.textContent.length;
	}

	dom.utils.removeItem(formatEl);

	return { focusNode, focusOffset };
}

// test export
export { LineDelete_next, LineDelete_prev };
