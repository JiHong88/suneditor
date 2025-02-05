import { domUtils, env, unicode } from '../../../helper';

const { _w, isOSX_IOS } = env;
const DIR_KEYCODE = /^(3[7-9]|40)$/;
const DELETE_KEYCODE = /^(8|46)$/;
const NON_TEXT_KEYCODE = /^(8|9|13|1[6-9]|20|27|3[3-9]|40|45|46|11[2-9]|12[0-3]|144|145|229)$/;
const HISTORY_IGNORE_KEYCODE = /^(1[6-9]|20|27|3[3-9]|40|45|11[2-9]|12[0-3]|144|145|229)$/;
const DOCUMENT_TYPE_OBSERVER_KEYCODE = /^(8|13|46)$/;
const FRONT_ZEROWIDTH = new RegExp(unicode.zeroWidthSpace + '+', '');
let _styleNodes = null;

function LineDelete_next(formatEl) {
	const focusNode = formatEl.lastChild;
	const next = formatEl.nextElementSibling;

	if (!next) return focusNode;

	if (domUtils.isZeroWidth(next)) {
		domUtils.removeItem(next);
		return focusNode;
	}

	const nextChild = next.childNodes;
	while (nextChild[0]) {
		formatEl.appendChild(nextChild[0]);
	}

	domUtils.removeItem(next);

	return focusNode;
}

function LineDelete_prev(formatEl) {
	const formatChild = formatEl.childNodes;
	const prev = formatEl.previousElementSibling;
	let focusNode = formatChild[0];
	let focusOffset = 0;

	if (!prev) return focusNode;

	if (domUtils.isZeroWidth(prev)) {
		domUtils.removeItem(prev);
		return focusNode;
	}

	if (formatChild.length > 1 || formatChild[0]?.textContent.length > 0) {
		while (formatChild[0]) {
			prev.appendChild(formatChild[0]);
		}
	} else {
		focusNode = prev.lastChild;
		focusOffset = focusNode.textContent.length;
	}

	domUtils.removeItem(formatEl);

	return { focusNode, focusOffset };
}

export function OnInput_wysiwyg(frameContext, e) {
	if (frameContext.get('isReadOnly') || frameContext.get('isDisabled')) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const range = this.selection.getRange();
	const selectionNode = this.selection.getNode();
	const formatEl = this.format.getLine(selectionNode, null);
	if (!formatEl && range.collapsed && !this.component.is(selectionNode) && !domUtils.isList(selectionNode)) {
		const rangeEl = this.format.getBlock(selectionNode, null);
		this._setDefaultLine(this.format.isBlock(rangeEl) ? 'DIV' : this.options.get('defaultLine'));
	}

	this.selection._init();

	const data = (e.data === null ? '' : e.data === undefined ? ' ' : e.data) || '';
	if (!this.char.test(data, true)) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	// user event
	if (this.triggerEvent('onInput', { frameContext, event: e, data }) === false) return;
	// plugin event
	if (this._callPluginEvent('onInput', { frameContext, event: e, data }) === false) return;

	this.history.push(true);
}

export function OnKeyDown_wysiwyg(frameContext, e) {
	if (this.editor.selectMenuOn || !e.isTrusted) return;

	let selectionNode = this.selection.getNode();
	if (domUtils.isInputElement(selectionNode)) return;
	if (this.menu.currentDropdownName) return;

	const keyCode = e.keyCode;
	const shift = e.shiftKey;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	const alt = e.altKey;
	this.isComposing = keyCode === 229;

	if (!ctrl && frameContext.get('isReadOnly') && !DIR_KEYCODE.test(keyCode)) {
		e.preventDefault();
		return false;
	}

	this.menu.dropdownOff();

	if (this.editor.isBalloon) {
		this._hideToolbar();
	} else if (this.editor.isSubBalloon) {
		this._hideToolbar_sub();
	}

	// user event
	if (this.triggerEvent('onKeyDown', { frameContext, event: e }) === false) return;

	/** default key action */
	if (keyCode === 13 && this.format.isLine(this.selection.getRange()?.startContainer)) {
		this.selection._resetRangeToTextNode();
		selectionNode = this.selection.getNode();
	}

	const range = this.selection.getRange();
	const selectRange = !range.collapsed || range.startContainer !== range.endContainer;
	let formatEl = this.format.getLine(selectionNode, null) || selectionNode;
	let rangeEl = this.format.getBlock(formatEl, null);

	/** Shortcuts */
	if (ctrl && !NON_TEXT_KEYCODE.test(keyCode) && this.shortcuts.command(e, ctrl, shift, keyCode, '', false, null, null)) {
		this._onShortcutKey = true;
		e.preventDefault();
		e.stopPropagation();
		return false;
	} else if (!ctrl && !NON_TEXT_KEYCODE.test(keyCode) && this.format.isLine(formatEl) && range.collapsed && domUtils.isEdgePoint(range.startContainer, 0, 'front')) {
		const keyword = range.startContainer?.substringData?.(0, range.startOffset);
		if (keyword && this.shortcuts.command(e, false, shift, keyCode, keyword, true, formatEl, range)) {
			this._onShortcutKey = true;
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	} else if (this._onShortcutKey) {
		this._onShortcutKey = false;
	}

	// plugin event
	if (this._callPluginEvent('onKeyDown', { frameContext, event: e, range, line: formatEl }) === false) return;

	switch (keyCode) {
		case 8 /** backspace key */: {
			this.component.deselect();
			_styleNodes = this.__cacheStyleNodes;
			if (selectRange && this._hardDelete()) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			if (!this.format.isLine(formatEl) && !frameContext.get('wysiwyg').firstElementChild && !this.component.is(selectionNode) && this._setDefaultLine(this.options.get('defaultLine')) !== null) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}

			// line delete
			if (this.format.isLine(formatEl) && (!range.collapsed || domUtils.isEdgePoint(range.endContainer, range.endOffset, 'front')) && !range.endContainer.previousSibling && this.format.isLine(formatEl.previousElementSibling)) {
				e.preventDefault();
				e.stopPropagation();

				let focusNode;
				if (!range.collapsed) {
					const rInfo = this.html.remove();
					if (rInfo.commonCon !== rInfo.container && formatEl.parentElement) {
						if (formatEl.contains(range.startContainer)) {
							focusNode = LineDelete_next(formatEl);
							this.selection.setRange(focusNode, focusNode.textContent.length, focusNode, focusNode.textContent.length);
						} else {
							const prevInfo = LineDelete_prev(formatEl);
							this.selection.setRange(prevInfo.focusNode, prevInfo.focusOffset, prevInfo.focusNode, prevInfo.focusOffset);
						}
					}
					this.history.push(true);
					return;
				}

				const prevInfo = LineDelete_prev(formatEl);
				this.selection.setRange(prevInfo.focusNode, prevInfo.focusOffset, prevInfo.focusNode, prevInfo.focusOffset);
				this.history.push(true);

				return;
			}

			if (
				!selectRange &&
				!formatEl.previousElementSibling &&
				range.startOffset === 0 &&
				!selectionNode.previousSibling &&
				!domUtils.isListCell(formatEl) &&
				this.format.isLine(formatEl) &&
				(!this.format.isBrLine(formatEl) || this.format.isClosureBrLine(formatEl))
			) {
				// closure range
				if (this.format.isClosureBlock(formatEl.parentNode)) {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
				// maintain default format
				if (domUtils.isWysiwygFrame(formatEl.parentNode) && formatEl.childNodes.length <= 1 && (!formatEl.firstChild || domUtils.isZeroWidth(formatEl.textContent))) {
					e.preventDefault();
					e.stopPropagation();

					if (formatEl.nodeName.toUpperCase() === this.options.get('defaultLine').toUpperCase()) {
						formatEl.innerHTML = '<br>';
						const attrs = formatEl.attributes;
						while (attrs[0]) {
							formatEl.removeAttribute(attrs[0].name);
						}
					} else {
						formatEl.parentElement.replaceChild(domUtils.createElement(this.options.get('defaultLine'), null, '<br>'), formatEl);
					}

					this.editor._nativeFocus();
					return false;
				}
			}

			// clean remove tag
			const startCon = range.startContainer;
			if (formatEl && !formatEl.previousElementSibling && range.startOffset === 0 && startCon.nodeType === 3 && domUtils.isZeroWidth(startCon)) {
				let prev = startCon.parentNode.previousSibling;
				const next = startCon.parentNode.nextSibling;
				if (!prev) {
					if (!next) {
						prev = domUtils.createElement('BR');
						formatEl.appendChild(prev);
					} else {
						prev = next;
					}
				}

				let con = startCon;
				while (formatEl.contains(con) && !con.previousSibling) {
					con = con.parentNode;
				}

				if (!formatEl.contains(con)) {
					startCon.textContent = '';
					this.nodeTransform.removeAllParents(startCon, null, formatEl);
					break;
				}
			}

			// line component
			if (!selectRange && formatEl && (range.startOffset === 0 || selectionNode === formatEl)) {
				const sel = selectionNode === formatEl ? this._isUneditableNode(range, true) : domUtils.isEdgePoint(range.startContainer, range.startOffset) ? domUtils.getPreviousDeepestNode(range.startContainer) : null;
				if (this.component.is(sel)) {
					const fileComponentInfo = this.component.get(sel);
					if (fileComponentInfo) {
						e.preventDefault();
						e.stopPropagation();
						if (this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName, false) === false) this.editor.blur();
						break;
					}
				}
			}

			// tag[contenteditable='false']
			if (this._isUneditableNode(range, true)) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			// format attributes
			if (!selectRange && this.format.isEdgeLine(range.startContainer, range.startOffset, 'front')) {
				if (this.format.isLine(formatEl.previousElementSibling)) {
					this._formatAttrsTemp = formatEl.previousElementSibling.attributes;
				}
			}

			// nested list
			const commonCon = range.commonAncestorContainer;
			formatEl = this.format.getLine(range.startContainer, null);
			rangeEl = this.format.getBlock(formatEl, null);
			if (rangeEl && formatEl && !domUtils.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
				if (
					domUtils.isListCell(formatEl) &&
					domUtils.isList(rangeEl) &&
					(domUtils.isListCell(rangeEl.parentNode) || formatEl.previousElementSibling) &&
					(selectionNode === formatEl || (selectionNode.nodeType === 3 && (!selectionNode.previousSibling || domUtils.isList(selectionNode.previousSibling)))) &&
					(this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null) ? rangeEl.contains(range.startContainer) : range.startOffset === 0 && range.collapsed)
				) {
					if (range.startContainer !== range.endContainer) {
						e.preventDefault();

						this.html.remove();
						if (range.startContainer.nodeType === 3) {
							this.selection.setRange(range.startContainer, range.startContainer.textContent.length, range.startContainer, range.startContainer.textContent.length);
						}

						this.history.push(true);
					} else {
						let prev = formatEl.previousElementSibling || rangeEl.parentNode;
						if (domUtils.isListCell(prev)) {
							e.preventDefault();

							let prevLast = prev;
							if (!prev.contains(formatEl) && domUtils.isListCell(prevLast) && domUtils.isList(prevLast.lastElementChild)) {
								prevLast = prevLast.lastElementChild.lastElementChild;
								while (domUtils.isListCell(prevLast) && domUtils.isList(prevLast.lastElementChild)) {
									prevLast = prevLast.lastElementChild && prevLast.lastElementChild.lastElementChild;
								}
								prev = prevLast;
							}

							let con = prev === rangeEl.parentNode ? rangeEl.previousSibling : prev.lastChild;
							if (!con) {
								con = domUtils.createTextNode(unicode.zeroWidthSpace);
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

							domUtils.removeItem(formatEl);
							if (rangeEl.children.length === 0) domUtils.removeItem(rangeEl);

							this.selection.setRange(con, offset, con, offset);
							this.history.push(true);
						}
					}

					break;
				}

				// detach range
				if (!selectRange && range.startOffset === 0) {
					let detach = true;
					let comm = commonCon;
					while (comm && comm !== rangeEl && !domUtils.isWysiwygFrame(comm)) {
						if (comm.previousSibling) {
							if (comm.previousSibling.nodeType === 1 || !domUtils.isZeroWidth(comm.previousSibling.textContent.trim())) {
								detach = false;
								break;
							}
						}
						comm = comm.parentNode;
					}

					if (detach && rangeEl.parentNode) {
						e.preventDefault();
						this.format.removeBlock(rangeEl, { selectedFormats: domUtils.isListCell(formatEl) ? [formatEl] : null, newBlockElement: null, shouldDelete: false, skipHistory: false });
						this.history.push(true);
						break;
					}
				}
			}

			// component
			if (!selectRange && formatEl && (range.startOffset === 0 || (selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : false))) {
				const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : selectionNode;
				const prev = formatEl.previousSibling;
				// select file component
				const ignoreZWS = (commonCon.nodeType === 3 || domUtils.isBreak(commonCon)) && !commonCon.previousSibling && range.startOffset === 0;
				if (sel && !sel.previousSibling && ((commonCon && this.component.is(commonCon.previousSibling)) || (ignoreZWS && this.component.is(prev)))) {
					const fileComponentInfo = this.component.get(prev);
					if (fileComponentInfo) {
						e.preventDefault();
						e.stopPropagation();
						if (formatEl.textContent.length === 0) domUtils.removeItem(formatEl);
						if (this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName, false) === false) this.editor.blur();
					} else if (this.component.is(prev)) {
						e.preventDefault();
						e.stopPropagation();
						domUtils.removeItem(prev);
					}
					break;
				}
				// delete nonEditable
				if (sel && domUtils.isNonEditable(sel.previousSibling)) {
					e.preventDefault();
					e.stopPropagation();
					domUtils.removeItem(sel.previousSibling);
					break;
				}
			}

			break;
		}
		case 46 /** delete key */: {
			this.component.deselect();
			_styleNodes = this.__cacheStyleNodes;
			if (selectRange && this._hardDelete()) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			if (!selectRange && this.format.isEdgeLine(range.endContainer, range.endOffset, 'end') && !formatEl.nextSibling) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}

			// line delete
			if (this.format.isLine(formatEl) && (!range.collapsed || domUtils.isEdgePoint(range.startContainer, range.endOffset, 'end')) && !range.startContainer.nextSibling && this.format.isLine(formatEl.nextElementSibling)) {
				e.preventDefault();
				e.stopPropagation();

				let focusNode;
				if (!range.collapsed) {
					const rInfo = this.html.remove();
					if (rInfo.commonCon !== rInfo.container && formatEl.parentElement) {
						if (formatEl.contains(range.startContainer)) {
							focusNode = LineDelete_next(formatEl);
							this.selection.setRange(focusNode, focusNode.textContent.length, focusNode, focusNode.textContent.length);
						} else {
							const prevInfo = LineDelete_prev(formatEl);
							this.selection.setRange(prevInfo.focusNode, prevInfo.focusOffset, prevInfo.focusNode, prevInfo.focusOffset);
						}
					}
					this.history.push(true);
					return;
				}

				LineDelete_next(formatEl);
				this.history.push(true);

				return;
			}

			// line component
			if (!selectRange && formatEl && (range.endOffset === range.endContainer.textContent.length || selectionNode === formatEl)) {
				const sel = selectionNode === formatEl ? this._isUneditableNode(range, false) : domUtils.isEdgePoint(range.endContainer, range.endOffset) ? domUtils.getNextDeepestNode(range.endContainer, null) : null;
				if (this.component.is(sel)) {
					const fileComponentInfo = this.component.get(sel);
					if (fileComponentInfo) {
						e.preventDefault();
						e.stopPropagation();
						if (domUtils.isZeroWidth(formatEl.textContent)) domUtils.removeItem(formatEl);
						if (this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName, false) === false) this.editor.blur();
						break;
					}
				}
			}

			// tag[contenteditable='false']
			if (this._isUneditableNode(range, false)) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			// component
			if (
				(this.format.isLine(selectionNode) || selectionNode.nextSibling === null || (domUtils.isZeroWidth(selectionNode.nextSibling) && selectionNode.nextSibling.nextSibling === null)) &&
				range.startOffset === selectionNode.textContent.length
			) {
				const nextEl = formatEl.nextElementSibling;
				if (!nextEl) break;
				if (this.component.is(nextEl)) {
					e.preventDefault();

					if (domUtils.isZeroWidth(formatEl)) {
						domUtils.removeItem(formatEl);
						// table component
						if (domUtils.isTable(nextEl)) {
							let cell = domUtils.getEdgeChild(nextEl, domUtils.isTableCell, false);
							cell = cell.firstElementChild || cell;
							this.selection.setRange(cell, 0, cell, 0);
							break;
						}
					}

					// select file component
					const fileComponentInfo = this.component.get(nextEl);
					if (fileComponentInfo) {
						e.stopPropagation();
						if (this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName, false) === false) this.editor.blur();
					} else if (this.component.is(nextEl)) {
						e.stopPropagation();
						domUtils.removeItem(nextEl);
					}

					break;
				}
			}

			if (!selectRange && (domUtils.isEdgePoint(range.endContainer, range.endOffset) || (selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : false))) {
				const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] || selectionNode : selectionNode;
				// delete nonEditable
				if (sel && domUtils.isNonEditable(sel.nextSibling)) {
					e.preventDefault();
					e.stopPropagation();
					domUtils.removeItem(sel.nextSibling);
					break;
				} else if (this.component.is(sel)) {
					e.preventDefault();
					e.stopPropagation();
					domUtils.removeItem(sel);
					break;
				}
			}

			// format attributes
			if (!selectRange && this.format.isEdgeLine(range.endContainer, range.endOffset, 'end')) {
				if (this.format.isLine(formatEl.nextElementSibling)) {
					this._formatAttrsTemp = formatEl.attributes;
				}
			}

			// nested list
			formatEl = this.format.getLine(range.startContainer, null);
			rangeEl = this.format.getBlock(formatEl, null);
			if (
				domUtils.isListCell(formatEl) &&
				domUtils.isList(rangeEl) &&
				(selectionNode === formatEl ||
					(selectionNode.nodeType === 3 &&
						(!selectionNode.nextSibling || domUtils.isList(selectionNode.nextSibling)) &&
						(this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null) ? rangeEl.contains(range.endContainer) : range.endOffset === selectionNode.textContent.length && range.collapsed)))
			) {
				if (range.startContainer !== range.endContainer) this.html.remove();

				let next = domUtils.getArrayItem(formatEl.children, domUtils.isList, false);
				next = next || formatEl.nextElementSibling || rangeEl.parentNode.nextElementSibling;
				if (next && (domUtils.isList(next) || domUtils.getArrayItem(next.children, domUtils.isList, false))) {
					e.preventDefault();

					let con, children;
					if (domUtils.isList(next)) {
						const child = next.firstElementChild;
						children = child.childNodes;
						con = children[0];
						while (children[0]) {
							formatEl.insertBefore(children[0], next);
						}
						domUtils.removeItem(child);
					} else {
						con = next.firstChild;
						children = next.childNodes;
						while (children[0]) {
							formatEl.appendChild(children[0]);
						}
						domUtils.removeItem(next);
					}
					this.selection.setRange(con, 0, con, 0);
					this.history.push(true);
				}
				break;
			}

			break;
		}
		case 9 /** tab key */: {
			if (this.options.get('tabDisable')) break;
			e.preventDefault();
			if (ctrl || alt || domUtils.isWysiwygFrame(selectionNode)) break;

			const isEdge = !range.collapsed || domUtils.isEdgePoint(range.startContainer, range.startOffset);
			const selectedFormats = this.format.getLines(null);
			selectionNode = this.selection.getNode();
			const cells = [];
			const lines = [];
			const fc = domUtils.isListCell(selectedFormats[0]),
				lc = domUtils.isListCell(selectedFormats[selectedFormats.length - 1]);
			let r = {
				sc: range.startContainer,
				so: range.startOffset,
				ec: range.endContainer,
				eo: range.endOffset
			};
			for (let i = 0, len = selectedFormats.length, f; i < len; i++) {
				f = selectedFormats[i];
				if (domUtils.isListCell(f)) {
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
			if (cells.length > 0 && isEdge) {
				r = this.format._applyNestedList(cells, shift);
			}

			// Lines tab
			if (lines.length > 0) {
				if (!shift) {
					if (lines.length === 1) {
						let tabSize = this.status.tabSize + 1;
						if (this.options.get('syncTabIndent')) {
							const baseIndex = domUtils.findTextIndexOnLine(formatEl, range.startContainer, range.startOffset, this.component.is.bind(this.component));
							const prevTabEndIndex = this.format.isLine(formatEl.previousElementSibling) ? domUtils.findTabEndIndex(formatEl.previousElementSibling, baseIndex, 2) : 0;
							if (prevTabEndIndex > baseIndex) {
								tabSize = prevTabEndIndex - baseIndex + 1;
							}
						}

						const tabText = domUtils.createTextNode(new Array(tabSize).join('\u00A0'));
						if (!this.html.insertNode(tabText, { afterNode: null, skipCharCount: false })) return false;
						if (!fc) {
							r.sc = tabText;
							r.so = tabText.length;
						}
						if (!lc) {
							r.ec = tabText;
							r.eo = tabText.length;
						}
					} else {
						const tabText = domUtils.createTextNode(new Array(this.status.tabSize + 1).join('\u00A0'));
						const len = lines.length - 1;
						for (let i = 0, child; i <= len; i++) {
							child = lines[i].firstChild;
							if (!child) continue;

							if (domUtils.isBreak(child)) {
								lines[i].insertBefore(tabText.cloneNode(false), child);
							} else {
								child.textContent = tabText.textContent + child.textContent;
							}
						}

						const firstChild = domUtils.getEdgeChild(lines[0], 'text', false);
						const endChild = domUtils.getEdgeChild(lines[len], 'text', true);
						if (!fc && firstChild) {
							r.sc = firstChild;
							r.so = 0;
						}
						if (!lc && endChild) {
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
							if (domUtils.isZeroWidth(child)) continue;

							if (/^\s{1,4}$/.test(child.textContent)) {
								domUtils.removeItem(child);
							} else if (/^\s{1,4}/.test(child.textContent)) {
								child.textContent = child.textContent.replace(/^\s{1,4}/, '');
							}

							break;
						}
					}

					const firstChild = domUtils.getEdgeChild(lines[0], 'text', false);
					const endChild = domUtils.getEdgeChild(lines[len], 'text', true);
					if (!fc && firstChild) {
						r.sc = firstChild;
						r.so = 0;
					}
					if (!lc && endChild) {
						r.ec = endChild;
						r.eo = endChild.textContent.length;
					}
				}
			}

			this.selection.setRange(r.sc, r.so, r.ec, r.eo);
			this.history.push(false);

			break;
		}
		case 13 /** enter key */: {
			this.component.deselect();
			const brBlock = this.format.getBrLine(selectionNode, null);

			if (this.editor.frameOptions.get('charCounter_type') === 'byte-html') {
				let enterHTML = '';
				if ((!shift && brBlock) || shift) {
					enterHTML = '<br>';
				} else {
					enterHTML = '<' + formatEl.nodeName + '><br></' + formatEl.nodeName + '>';
				}

				if (!this.char.check(enterHTML)) {
					e.preventDefault();
					return false;
				}
			}

			if (!shift) {
				const formatEndEdge = !range.endContainer.nextSibling && this.format.isEdgeLine(range.endContainer, range.endOffset, 'end');
				const formatStartEdge = !range.startContainer.previousSibling && this.format.isEdgeLine(range.startContainer, range.startOffset, 'front');

				// add default format line
				if (formatEndEdge && (/^H[1-6]$/i.test(formatEl.nodeName) || /^HR$/i.test(formatEl.nodeName))) {
					this.__enterPrevent(e);
					let temp = null;
					const newFormat = this.format.addLine(formatEl, this.options.get('defaultLine'));

					if (formatEndEdge && formatEndEdge.length > 0) {
						temp = formatEndEdge.pop();
						const innerNode = temp;
						while (formatEndEdge.length > 0) {
							temp = temp.appendChild(formatEndEdge.pop());
						}
						newFormat.appendChild(innerNode);
					}

					temp = !temp ? newFormat.firstChild : temp.appendChild(newFormat.firstChild);
					if (domUtils.isBreak(temp)) {
						const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
						temp.parentNode.insertBefore(zeroWidth, temp);
						this.selection.setRange(zeroWidth, 1, zeroWidth, 1);
					} else {
						this.selection.setRange(temp, 0, temp, 0);
					}

					// enter scroll
					this.selection.scrollTo(range);
					break;
				} else if (rangeEl && formatEl && !domUtils.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
					const rangeEnt = this.selection.getRange();
					if (domUtils.isEdgePoint(rangeEnt.endContainer, rangeEnt.endOffset) && domUtils.isList(selectionNode.nextSibling)) {
						this.__enterPrevent(e);
						const br = domUtils.createElement('BR');
						const newEl = domUtils.createElement('LI', null, br);

						formatEl.parentNode.insertBefore(newEl, formatEl.nextElementSibling);
						newEl.appendChild(selectionNode.nextSibling);

						this.selection.setRange(br, 1, br, 1);

						// enter scroll
						this.selection.scrollTo(range);
						break;
					}

					if (
						(rangeEnt.commonAncestorContainer.nodeType === 3 ? !rangeEnt.commonAncestorContainer.nextElementSibling : true) &&
						domUtils.isZeroWidth(formatEl.innerText.trim()) &&
						!domUtils.isListCell(formatEl.nextElementSibling)
					) {
						this.__enterPrevent(e);
						let newEl = null;

						if (domUtils.isListCell(rangeEl.parentNode)) {
							const parentLi = formatEl.parentNode.parentNode;
							rangeEl = parentLi.parentNode;
							const newListCell = domUtils.createElement('LI');
							newListCell.innerHTML = '<br>';
							domUtils.copyTagAttributes(newListCell, formatEl, this.options.get('lineAttrReset'));
							newEl = newListCell;
							rangeEl.insertBefore(newEl, parentLi.nextElementSibling);
						} else {
							let newFormat;
							if (domUtils.isTableCell(rangeEl.parentNode)) {
								newFormat = 'DIV';
							} else if (domUtils.isList(rangeEl.parentNode)) {
								newFormat = 'LI';
							} else if (this.format.isLine(rangeEl.nextElementSibling) && !this.format.isBlock(rangeEl.nextElementSibling)) {
								newFormat = rangeEl.nextElementSibling.nodeName;
							} else if (this.format.isLine(rangeEl.previousElementSibling) && !this.format.isBlock(rangeEl.previousElementSibling)) {
								newFormat = rangeEl.previousElementSibling.nodeName;
							} else {
								newFormat = this.options.get('defaultLine');
							}

							newEl = domUtils.createElement(newFormat);
							const edge = this.format.removeBlock(rangeEl, { selectedFormats: [formatEl], newBlockElement: null, shouldDelete: true, skipHistory: true });
							edge.cc.insertBefore(newEl, edge.ec);
						}

						newEl.innerHTML = '<br>';
						this.nodeTransform.removeAllParents(formatEl, null, null);
						this.selection.setRange(newEl, 1, newEl, 1);
						break;
					}
				}

				if (brBlock) {
					this.__enterPrevent(e);
					const selectionFormat = selectionNode === brBlock;
					const wSelection = this.selection.get();
					const children = selectionNode.childNodes,
						offset = wSelection.focusOffset,
						prev = selectionNode.previousElementSibling,
						next = selectionNode.nextSibling;

					if (
						!this.format.isClosureBrLine(brBlock) &&
						children &&
						((selectionFormat &&
							range.collapsed &&
							children.length - 1 <= offset + 1 &&
							domUtils.isBreak(children[offset]) &&
							(!children[offset + 1] || ((!children[offset + 2] || domUtils.isZeroWidth(children[offset + 2].textContent)) && children[offset + 1].nodeType === 3 && domUtils.isZeroWidth(children[offset + 1].textContent))) &&
							offset > 0 &&
							domUtils.isBreak(children[offset - 1])) ||
							(!selectionFormat &&
								domUtils.isZeroWidth(selectionNode.textContent) &&
								domUtils.isBreak(prev) &&
								(domUtils.isBreak(prev.previousSibling) || !domUtils.isZeroWidth(prev.previousSibling.textContent)) &&
								(!next || (!domUtils.isBreak(next) && domUtils.isZeroWidth(next.textContent)))))
					) {
						if (selectionFormat) domUtils.removeItem(children[offset - 1]);
						else domUtils.removeItem(selectionNode);
						const newEl = this.format.addLine(brBlock, this.format.isLine(brBlock.nextElementSibling) && !this.format.isBlock(brBlock.nextElementSibling) ? brBlock.nextElementSibling : null);
						domUtils.copyFormatAttributes(newEl, brBlock);
						this.selection.setRange(newEl, 1, newEl, 1);

						// enter scroll
						this.selection.scrollTo(range);
						break;
					}

					if (selectionFormat) {
						this.html.insert(range.collapsed && domUtils.isBreak(range.startContainer.childNodes[range.startOffset - 1]) ? '<br>' : '<br><br>', { selectInserted: false, skipCharCount: true, skipCleaning: true });

						let focusNode = wSelection.focusNode;
						const wOffset = wSelection.focusOffset;
						if (brBlock === focusNode) {
							focusNode = focusNode.childNodes[wOffset - offset > 1 ? wOffset - 1 : wOffset];
						}

						this.selection.setRange(focusNode, 1, focusNode, 1);
					} else {
						const focusNext = wSelection.focusNode.nextSibling;
						const br = domUtils.createElement('BR');
						this.html.insertNode(br, { afterNode: null, skipCharCount: true });

						const brPrev = br.previousSibling,
							brNext = br.nextSibling;
						if (!domUtils.isBreak(focusNext) && !domUtils.isBreak(brPrev) && (!brNext || domUtils.isZeroWidth(brNext))) {
							br.parentNode.insertBefore(br.cloneNode(false), br);
							this.selection.setRange(br, 1, br, 1);
						} else {
							this.selection.setRange(brNext, 0, brNext, 0);
						}
					}

					this._onShortcutKey = true;

					// enter scroll
					this.selection.scrollTo(range);
					break;
				}

				// set format attrs - edge
				if (range.collapsed && (formatStartEdge || formatEndEdge)) {
					this.__enterPrevent(e);
					const focusBR = domUtils.createElement('BR');
					const newFormat = domUtils.createElement(formatEl.nodeName, null, focusBR);

					domUtils.copyTagAttributes(newFormat, formatEl, this.options.get('lineAttrReset'));

					let child = focusBR;
					do {
						if (!domUtils.isBreak(selectionNode) && selectionNode.nodeType === 1) {
							const f = selectionNode.cloneNode(false);
							f.appendChild(child);
							child = f;
						}
						selectionNode = selectionNode.parentNode;
					} while (formatEl !== selectionNode && formatEl.contains(selectionNode));

					newFormat.appendChild(child);
					formatEl.parentNode.insertBefore(newFormat, formatStartEdge && !formatEndEdge ? formatEl : formatEl.nextElementSibling);
					if (formatEndEdge) {
						this.selection.setRange(focusBR, 1, focusBR, 1);
					} else {
						const firstEl = formatEl.firstChild || formatEl;
						this.selection.setRange(firstEl, 0, firstEl, 0);
					}

					// enter scroll
					this.selection.scrollTo(range);
					break;
				}

				if (formatEl) {
					e.stopPropagation();

					let newEl;
					let offset = 0;
					if (!range.collapsed) {
						const isMultiLine = this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null);
						const newFormat = formatEl.cloneNode(false);
						newFormat.innerHTML = '<br>';
						const commonCon = range.commonAncestorContainer;
						const rcon = commonCon === range.startContainer && commonCon === range.endContainer && domUtils.isZeroWidth(commonCon) ? range : this.html.remove();
						newEl = this.format.getLine(rcon.container, null);
						if (!newEl) {
							if (domUtils.isWysiwygFrame(rcon.container)) {
								this.__enterPrevent(e);
								frameContext.get('wysiwyg').appendChild(newFormat);
								newEl = newFormat;
								domUtils.copyTagAttributes(newEl, formatEl, this.options.get('lineAttrReset'));
								this.selection.setRange(newEl, offset, newEl, offset);
							}

							// enter scroll
							this.selection.scrollTo(range);
							break;
						}

						const innerRange = this.format.getBlock(rcon.container);
						newEl = newEl.contains(innerRange) ? domUtils.getEdgeChild(innerRange, this.format.getLine.bind(this.format)) : newEl;
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
							} else {
								newEl = this.nodeTransform.split(rcon.container, rcon.offset, domUtils.getNodeDepth(formatEl));
							}
						}
					} else {
						if (domUtils.isZeroWidth(formatEl)) {
							newEl = this.format.addLine(formatEl, formatEl.cloneNode(false));
						} else {
							newEl = this.nodeTransform.split(range.endContainer, range.endOffset, domUtils.getNodeDepth(formatEl));
						}
					}

					this.__enterPrevent(e);
					domUtils.copyTagAttributes(newEl, formatEl, this.options.get('lineAttrReset'));
					this.selection.setRange(newEl, offset, newEl, offset);

					// enter scroll
					this.selection.scrollTo(range);
					break;
				}
			}

			if (selectRange) {
				// enter scroll
				this.selection.scrollTo(range);
				break;
			}

			if (rangeEl && domUtils.getParentElement(rangeEl, 'FIGCAPTION') && domUtils.getParentElement(rangeEl, domUtils.isList)) {
				this.__enterPrevent(e);
				formatEl = this.format.addLine(formatEl, null);
				this.selection.setRange(formatEl, 0, formatEl, 0);

				// enter scroll
				this.selection.scrollTo(range);
			}

			break;
		}
	}

	if (shift && (isOSX_IOS ? alt : ctrl) && keyCode === 32) {
		e.preventDefault();
		e.stopPropagation();
		const nbsp = this.html.insertNode(domUtils.createTextNode('\u00a0'), { afterNode: null, skipCharCount: true });
		if (nbsp) {
			this.selection.setRange(nbsp, nbsp.length, nbsp, nbsp.length);
			return;
		}
	}

	if (!ctrl && !alt && !selectRange && !NON_TEXT_KEYCODE.test(keyCode) && domUtils.isBreak(range.commonAncestorContainer)) {
		const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
		this.html.insertNode(zeroWidth, { afterNode: null, skipCharCount: true });
		this.selection.setRange(zeroWidth, 1, zeroWidth, 1);
	}

	// document type
	if (frameContext.has('documentType-use-header') && !range.collapsed && !ctrl && !alt && !shift && !DIR_KEYCODE.test(keyCode)) {
		_w.setTimeout(() => {
			frameContext.get('documentType').reHeader();
		}, 0);
		return;
	}

	// next component
	let cmponentInfo = null;
	switch (keyCode) {
		case 38 /** up key */:
			if (this.component.is(formatEl.previousElementSibling)) {
				cmponentInfo = this.component.get(formatEl.previousElementSibling);
			}
			break;
		case 37 /** left key */:
			if (domUtils.isEdgePoint(selectionNode, range.startOffset, 'front')) {
				const prevEl = selectionNode.previousElementSibling || domUtils.getPreviousDeepestNode(selectionNode);
				if (prevEl) {
					if (this.component.is(prevEl)) cmponentInfo = this.component.get(prevEl);
				} else if (this.component.is(formatEl.previousElementSibling)) {
					cmponentInfo = this.component.get(formatEl.previousElementSibling);
				}
			}
			break;
		case 40 /** down key */:
			if (this.component.is(formatEl.nextElementSibling)) {
				cmponentInfo = this.component.get(formatEl.nextElementSibling);
			}
			break;
		case 39 /** right key */:
			if (domUtils.isEdgePoint(selectionNode, range.endOffset, 'end')) {
				const nextEl = selectionNode.nextElementSibling || domUtils.getNextDeepestNode(selectionNode);
				if (nextEl) {
					if (this.component.is(nextEl)) cmponentInfo = this.component.get(nextEl);
				} else if (this.component.is(formatEl.nextElementSibling)) {
					cmponentInfo = this.component.get(formatEl.nextElementSibling);
				}
			}
			break;
	}

	if (cmponentInfo && !cmponentInfo.options?.isInputComponent) {
		e.preventDefault();
		if (this.component.select(cmponentInfo.target, cmponentInfo.pluginName, false) === false) this.editor.blur();
	}
}

export function OnKeyUp_wysiwyg(frameContext, e) {
	if (this._onShortcutKey || this.menu.currentDropdownName) return;

	const keyCode = e.keyCode;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	const alt = e.altKey;

	if (frameContext.get('isReadOnly')) return;

	const range = this.selection.getRange();
	let selectionNode = this.selection.getNode();

	if ((this.editor.isBalloon || this.editor.isSubBalloon) && (((this.editor.isBalloonAlways || this.editor.isSubBalloonAlways) && keyCode !== 27) || !range.collapsed)) {
		if (this.editor.isBalloonAlways || this.editor.isSubBalloonAlways) {
			if (keyCode !== 27) this._showToolbarBalloonDelay();
		} else {
			if (this.editor.isSubBalloon) this.subToolbar._showBalloon();
			else this.toolbar._showBalloon();
			return;
		}
	}

	/** when format tag deleted */
	if (keyCode === 8 && domUtils.isWysiwygFrame(selectionNode) && selectionNode.textContent === '' && selectionNode.children.length === 0) {
		e.preventDefault();
		e.stopPropagation();

		selectionNode.innerHTML = '';

		const oFormatTag = domUtils.createElement(this.format.isLine(this.status.currentNodes[0]) && !domUtils.isListCell(this.status.currentNodes[0]) ? this.status.currentNodes[0] : this.options.get('defaultLine'), null, '<br>');
		selectionNode.appendChild(oFormatTag);
		this.selection.setRange(oFormatTag, 0, oFormatTag, 0);
		this.applyTagEffect();

		this.history.push(false);

		// document type
		if (frameContext.has('documentType-use-header')) {
			if (DOCUMENT_TYPE_OBSERVER_KEYCODE.test(keyCode)) {
				frameContext.get('documentType').reHeader();
			}
		}

		return;
	}

	const formatEl = this.format.getLine(selectionNode, null);
	const rangeEl = this.format.getBlock(selectionNode, null);
	const attrs = this._formatAttrsTemp;

	if (formatEl && attrs) {
		for (let i = 0, len = attrs.length; i < len; i++) {
			if (keyCode === 13 && /^id$/i.test(attrs[i].name)) {
				formatEl.removeAttribute('id');
				continue;
			}
			formatEl.setAttribute(attrs[i].name, attrs[i].value);
		}
		this._formatAttrsTemp = null;
	}

	if (!formatEl && range.collapsed && !this.component.is(selectionNode) && !domUtils.isList(selectionNode) && this._setDefaultLine(this.format.isBlock(rangeEl) ? 'DIV' : this.options.get('defaultLine')) !== null) {
		selectionNode = this.selection.getNode();
	}

	const textKey = !ctrl && !alt && !NON_TEXT_KEYCODE.test(keyCode);
	if (textKey && selectionNode.nodeType === 3 && unicode.zeroWidthRegExp.test(selectionNode.textContent) && !(e.isComposing !== undefined ? e.isComposing : this.isComposing)) {
		let so = range.startOffset,
			eo = range.endOffset;
		const frontZeroWidthCnt = (selectionNode.textContent.substring(0, eo).match(FRONT_ZEROWIDTH) || '').length;
		so = range.startOffset - frontZeroWidthCnt;
		eo = range.endOffset - frontZeroWidthCnt;
		selectionNode.textContent = selectionNode.textContent.replace(unicode.zeroWidthRegExp, '');
		this.selection.setRange(selectionNode, so < 0 ? 0 : so, selectionNode, eo < 0 ? 0 : eo);
	}

	if (DELETE_KEYCODE.test(keyCode) && domUtils.isZeroWidth(formatEl?.textContent) && !formatEl.previousElementSibling) {
		const rsMode = this.options.get('retainStyleMode');
		if (rsMode !== 'none' && _styleNodes?.length > 0) {
			if (rsMode === 'repeat') {
				if (this.__retainTimer) {
					this.__retainTimer = _w.clearTimeout(this.__retainTimer);
					this._clearRetainStyleNodes(formatEl);
				} else {
					this.__retainTimer = _w.setTimeout(() => {
						this.__retainTimer = null;
					}, 0);
					this._retainStyleNodes(formatEl, _styleNodes);
				}
			} else {
				this.__retainTimer = null;
				this._retainStyleNodes(formatEl, _styleNodes);
			}
		} else {
			this._clearRetainStyleNodes(formatEl);
		}
	}

	this.char.test('', false);

	// document type
	if (frameContext.has('documentType-use-header')) {
		if (DOCUMENT_TYPE_OBSERVER_KEYCODE.test(keyCode)) {
			frameContext.get('documentType').reHeader();
			const el = domUtils.getParentElement(this.selection.selectionNode, this.format.isLine.bind(this.format));
			frameContext.get('documentType').on(el);
		} else {
			const el = domUtils.getParentElement(selectionNode, (current) => current.nodeType === 1);
			frameContext.get('documentType').onChangeText(el);
		}
	}

	// user event
	if (this.triggerEvent('onKeyUp', { frameContext, event: e }) === false) return;
	// plugin event
	if (this._callPluginEvent('onKeyUp', { frameContext, event: e, range, line: formatEl }) === false) return;

	if (!ctrl && !alt && !HISTORY_IGNORE_KEYCODE.test(keyCode)) {
		this.history.push(true);
	}
}
