/**
 * @fileoverview Format class
 */

import CoreInjector from '../../editorInjector/_core';
import { dom, unicode, numbers, converter } from '../../helper';

/**
 * @typedef {Omit<Format & Partial<__se__EditorInjector>, 'format'>} FormatThis
 */

/**
 * @typedef {Object} NodeStyleContainerType
 * @property {?Node=} ancestor
 * @property {?number=} offset
 * @property {?Node=} container
 * @property {?Node=} endContainer
 */

/**
 * @constructor
 * @this {FormatThis}
 * @description Classes related to editor formats such as line creation, line retrieval from selected range, etc.
 * @param {__se__EditorCore} editor - The root editor instance
 */
function Format(editor) {
	CoreInjector.call(this, editor);

	// members
	this._listCamel = this.options.get('__listCommonStyle');
	this._listKebab = converter.camelToKebabCase(this.options.get('__listCommonStyle'));
	this._formatLineCheck = this.options.get('formatLine').reg;
	this._formatBrLineCheck = this.options.get('formatBrLine').reg;
	this._formatBlockCheck = this.options.get('formatBlock').reg;
	this._formatClosureBlockCheck = this.options.get('formatClosureBlock').reg;
	this._formatClosureBrLineCheck = this.options.get('formatClosureBrLine').reg;
	this._textStyleTagsCheck = new RegExp('^(' + this.options.get('textStyleTags') + ')$', 'i');

	this._brLineBreak = null;
	this.__resetBrLineBreak(this.options.get('defaultLineBreakFormat'));
}

Format.prototype = {
	/**
	 * @this {FormatThis}
	 * @description Replace the line tag of the current selection.
	 * @param {Node} element Line element (P, DIV..)
	 */
	setLine(element) {
		if (!this.isLine(element)) {
			throw new Error('[SUNEDITOR.format.setLine.fail] The "element" must satisfy "format.isLine()".');
		}

		const info = this._lineWork();
		const lines = info.lines;
		const className = element.className;
		const value = element.nodeName;
		let first = info.firstNode;
		let last = info.lastNode;

		for (let i = 0, len = lines.length, node, newFormat; i < len; i++) {
			node = lines[i];

			if ((node.nodeName !== value || (node.className.match(/(\s|^)__se__format__[^\s]+/) || [''])[0].trim() !== className) && !this.component.is(node)) {
				newFormat = /** @type {HTMLElement} */ (element.cloneNode(false));
				dom.utils.copyFormatAttributes(newFormat, node);
				newFormat.innerHTML = node.innerHTML;

				node.parentNode.replaceChild(newFormat, node);
			}

			if (i === 0) first = newFormat || node;
			if (i === len - 1) last = newFormat || node;
			newFormat = null;
		}

		this.selection.setRange(dom.query.getNodeFromPath(info.firstPath, first), info.startOffset, dom.query.getNodeFromPath(info.lastPath, last), info.endOffset);
		this.history.push(false);

		// document type
		if (this.frameContext.has('documentType_use_header')) {
			this.frameContext.get('documentType').reHeader();
		}
	},

	/**
	 * @this {FormatThis}
	 * @description If a parent node that contains an argument node finds a format node (format.isLine), it returns that node.
	 * @param {Node} node Reference node.
	 * @param {?(current: Node) => boolean=} validation Additional validation function.
	 * @returns {HTMLElement|null}
	 */
	getLine(node, validation) {
		if (!node) return null;

		validation ||= () => true;

		while (node) {
			if (dom.check.isWysiwygFrame(node)) return null;

			if (this.isBlock(node)) {
				if (this.isLine(node.firstElementChild)) {
					return /** @type {HTMLElement} */ (node.firstElementChild);
				}
				if (this.isLine(node)) {
					return /** @type {HTMLElement} */ (node);
				}
			}

			if (this.isLine(node) && validation(node)) {
				return /** @type {HTMLElement} */ (node);
			}

			node = node.parentNode;
		}

		return null;
	},

	/**
	 * @this {FormatThis}
	 * @description Replace the br-line tag of the current selection.
	 * @param {Node} element BR-Line element (PRE..)
	 */
	setBrLine(element) {
		if (!this.isBrLine(element)) {
			throw new Error('[SUNEDITOR.format.setBrLine.fail] The "element" must satisfy "format.isBrLine()".');
		}

		const lines = this._lineWork().lines;
		const len = lines.length - 1;
		let parentNode = lines[len].parentNode;
		let freeElement = /** @type {HTMLElement} */ (element.cloneNode(false));
		const focusElement = freeElement;

		for (let i = len, f, html, before, next, inner, isComp, first = true; i >= 0; i--) {
			f = lines[i];
			if (f === (!lines[i + 1] ? null : lines[i + 1].parentNode)) continue;

			isComp = this.component.is(f);
			html = isComp ? '' : f.innerHTML.replace(/(?!>)\s+(?=<)|\n/g, ' ');
			before = dom.query.getParentElement(f, (current) => current.parentNode === parentNode);

			if (parentNode !== f.parentNode || isComp) {
				if (this.isLine(parentNode)) {
					parentNode.parentNode.insertBefore(freeElement, parentNode.nextSibling);
					parentNode = parentNode.parentNode;
				} else {
					parentNode.insertBefore(freeElement, before ? before.nextSibling : null);
					parentNode = f.parentNode;
				}

				next = /** @type {HTMLElement} */ (freeElement.nextSibling);
				if (next && freeElement.nodeName === next.nodeName && dom.check.isSameAttributes(freeElement, next)) {
					freeElement.innerHTML += '<BR>' + next.innerHTML;
					dom.utils.removeItem(next);
				}

				freeElement = /** @type {HTMLElement} */ (element.cloneNode(false));
				first = true;
			}

			inner = freeElement.innerHTML;
			freeElement.innerHTML = (first || !html || !inner || /<br>$/i.test(html) ? html : html + '<BR>') + inner;

			if (i === 0) {
				parentNode.insertBefore(freeElement, f);
				next = /** @type {HTMLElement} */ (f.nextSibling);
				if (next && freeElement.nodeName === next.nodeName && dom.check.isSameAttributes(freeElement, next)) {
					freeElement.innerHTML += '<BR>' + next.innerHTML;
					dom.utils.removeItem(next);
				}

				const prev = /** @type {HTMLElement} */ (freeElement.previousSibling);
				if (prev && freeElement.nodeName === prev.nodeName && dom.check.isSameAttributes(freeElement, prev)) {
					prev.innerHTML += '<BR>' + freeElement.innerHTML;
					dom.utils.removeItem(freeElement);
				}
			}

			if (!isComp) dom.utils.removeItem(f);
			if (html) first = false;
		}

		this.selection.setRange(focusElement, 0, focusElement, 0);
		this.history.push(false);
	},

	/**
	 * @this {FormatThis}
	 * @description If a parent node that contains an argument node finds a "brLine" (format.isBrLine), it returns that node.
	 * @param {Node} element Reference node.
	 * @param {?(current: Node) => boolean=} validation Additional validation function.
	 * @returns {HTMLBRElement|null}
	 */
	getBrLine(element, validation) {
		if (!element) return null;

		validation ||= () => true;

		while (element) {
			if (dom.check.isWysiwygFrame(element)) return null;
			if (this.isBrLine(element) && validation(element)) return /** @type {HTMLBRElement} */ (element);

			element = element.parentNode;
		}

		return null;
	},

	/**
	 * @this {FormatThis}
	 * @description Append "line" element to sibling node of argument element.
	 * - If the "lineNode" argument value is present, the tag of that argument value is inserted,
	 * - If not, the currently selected format tag is inserted.
	 * @param {Node} element Insert as siblings of that element
	 * @param {?string|Node=} lineNode Node name or node obejct to be inserted
	 * @returns {HTMLElement}
	 */
	addLine(element, lineNode) {
		if (!element || !element.parentNode) return null;

		const currentFormatEl = this.getLine(this.selection.getNode(), null);
		let oFormat = null;
		if (!this.isBrLine(element) && this.isBrLine(currentFormatEl || element.parentNode) && !this.component.is(element)) {
			oFormat = dom.utils.createElement('BR');
		} else {
			const oFormatName = lineNode ? (typeof lineNode === 'string' ? lineNode : lineNode.nodeName) : this.isNormalLine(currentFormatEl) ? currentFormatEl.nodeName : this.options.get('defaultLine');
			oFormat = dom.utils.createElement(oFormatName, null, '<br>');
			if ((lineNode && typeof lineNode !== 'string') || (!lineNode && this.isLine(currentFormatEl))) {
				dom.utils.copyTagAttributes(oFormat, /** @type {Node} */ (lineNode || currentFormatEl), ['id']);
			}
		}

		if (dom.check.isTableCell(element)) element.insertBefore(oFormat, element.nextElementSibling);
		else element.parentNode.insertBefore(oFormat, /** @type {HTMLElement} */ (element).nextElementSibling);

		return oFormat;
	},

	/**
	 * @this {FormatThis}
	 * @description If a parent node that contains an argument node finds a format node (format.isBlock), it returns that node.
	 * @param {Node} element Reference node.
	 * @param {?(current: Node) => boolean=} validation Additional validation function.
	 * @returns {HTMLElement|null}
	 */
	getBlock(element, validation) {
		if (!element) return null;

		validation ||= () => true;

		while (element) {
			if (dom.check.isWysiwygFrame(element)) return null;
			if (this.isBlock(element) && !/^(THEAD|TBODY|TR)$/i.test(element.nodeName) && validation(element)) return element;
			element = element.parentNode;
		}

		return null;
	},

	/**
	 * @this {FormatThis}
	 * @description Appended all selected "line" element to the argument element("block") and insert
	 * @param {Node} blockElement Element of wrap the arguments (BLOCKQUOTE...)
	 */
	applyBlock(blockElement) {
		this.selection.getRangeAndAddLine(this.selection.getRange(), null);
		const rangeLines = /** @type {Element[]} */ (this.getLinesAndComponents(false));
		if (!rangeLines || rangeLines.length === 0) return;

		linesLoop: for (let i = 0, len = rangeLines.length, line, nested, fEl, lEl, f, l; i < len; i++) {
			line = rangeLines[i];
			if (!dom.check.isListCell(line)) continue;

			nested = line.lastElementChild;
			if (nested && dom.check.isListCell(line.nextElementSibling) && rangeLines.includes(line.nextElementSibling)) {
				lEl = nested.lastElementChild;
				if (rangeLines.includes(lEl)) {
					let list = null;
					while ((list = lEl.lastElementChild)) {
						if (dom.check.isList(list)) {
							if (rangeLines.includes(list.lastElementChild)) {
								lEl = list.lastElementChild;
							} else {
								continue linesLoop;
							}
						}
					}

					fEl = nested.firstElementChild;
					f = rangeLines.indexOf(fEl);
					l = rangeLines.indexOf(lEl);
					rangeLines.splice(f, l - f + 1);
					len = rangeLines.length;
					continue;
				}
			}
		}

		const last = rangeLines.at(-1);
		let standTag, beforeTag, pElement;

		if (this.isBlock(last) || this.isLine(last)) {
			standTag = last;
		} else {
			standTag = this.getBlock(last, null) || this.getLine(last, null);
		}

		if (dom.check.isTableCell(standTag)) {
			beforeTag = null;
			pElement = standTag;
		} else {
			beforeTag = standTag.nextSibling;
			pElement = standTag.parentNode;
		}

		const block = /** @type {HTMLElement} */ (blockElement.cloneNode(false));
		let parentDepth = dom.query.getNodeDepth(standTag);
		let listParent = null;
		const lineArr = [];
		const removeItems = (parent, origin, before) => {
			let cc = null;
			if (parent !== origin && !dom.check.isTableElements(origin)) {
				if (origin && dom.query.getNodeDepth(parent) === dom.query.getNodeDepth(origin)) return before;
				cc = this.nodeTransform.removeAllParents(origin, null, parent);
			}

			return cc ? cc.ec : before;
		};

		for (let i = 0, len = rangeLines.length, line, originParent, depth, before, nextLine, nextList, nested; i < len; i++) {
			line = rangeLines[i];
			originParent = line.parentNode;
			if (!originParent || block.contains(originParent)) continue;

			depth = dom.query.getNodeDepth(line);

			if (dom.check.isList(originParent)) {
				if (listParent === null) {
					if (nextList) {
						listParent = nextList;
						nested = true;
						nextList = null;
					} else {
						listParent = originParent.cloneNode(false);
					}
				}

				lineArr.push(line);
				nextLine = rangeLines[i + 1];

				if (i === len - 1 || nextLine?.parentNode !== originParent) {
					// nested list
					if (line.contains(nextLine?.parentNode)) {
						nextList = nextLine.parentNode.cloneNode(false);
					}

					let list = originParent.parentNode,
						p;
					while (dom.check.isList(list)) {
						p = dom.utils.createElement(list.nodeName);
						p.appendChild(listParent);
						listParent = p;
						list = list.parentNode;
					}

					const edge = this.removeBlock(originParent, { selectedFormats: lineArr, newBlockElement: null, shouldDelete: true, skipHistory: true });

					if (parentDepth >= depth) {
						parentDepth = depth;
						pElement = edge.cc;
						beforeTag = removeItems(pElement, originParent, edge.ec);
						if (beforeTag) pElement = beforeTag.parentNode;
					} else if (pElement === edge.cc) {
						beforeTag = edge.ec;
					}

					if (pElement !== edge.cc) {
						before = removeItems(pElement, edge.cc, before);
						if (before !== undefined) beforeTag = before;
						else beforeTag = edge.cc;
					}

					for (let c = 0, cLen = edge.removeArray.length; c < cLen; c++) {
						listParent.appendChild(edge.removeArray[c]);
					}

					if (!nested) block.appendChild(listParent);
					if (nextList) edge.removeArray.at(-1).appendChild(nextList);
					listParent = null;
					nested = false;
				}
			} else {
				if (parentDepth >= depth) {
					parentDepth = depth;
					pElement = originParent;
					beforeTag = line.nextSibling;
				}

				block.appendChild(line);

				if (pElement !== originParent) {
					before = removeItems(pElement, originParent);
					if (before !== undefined) beforeTag = before;
				}
			}
		}

		this.editor.effectNode = null;
		this.nodeTransform.mergeSameTags(block, null, false);
		this.nodeTransform.mergeNestedTags(block, (current) => dom.check.isList(current));

		// Nested list
		if (beforeTag && dom.query.getNodeDepth(beforeTag) > 0 && (dom.check.isList(beforeTag.parentNode) || dom.check.isList(beforeTag.parentNode.parentNode))) {
			const depthFormat = dom.query.getParentElement(beforeTag, (current) => this.isBlock(current) && !dom.check.isList(current));
			const splitRange = this.nodeTransform.split(beforeTag, null, !depthFormat ? 0 : dom.query.getNodeDepth(depthFormat) + 1);
			splitRange.parentNode.insertBefore(block, splitRange);
		} else {
			// basic
			pElement.insertBefore(block, beforeTag);
			removeItems(block, beforeTag);
		}

		const edge = dom.query.getEdgeChildNodes(block.firstElementChild, block.lastElementChild);
		if (rangeLines.length > 1) {
			this.selection.setRange(edge.sc, 0, edge.ec, edge.ec.textContent.length);
		} else {
			this.selection.setRange(edge.ec, edge.ec.textContent.length, edge.ec, edge.ec.textContent.length);
		}

		this.history.push(false);
	},

	/**
	 * @this {FormatThis}
	 * @description The elements of the "selectedFormats" array are detached from the "blockElement" element. ("LI" tags are converted to "P" tags)
	 * - When "selectedFormats" is null, all elements are detached and return {cc: parentNode, sc: nextSibling, ec: previousSibling, removeArray: [Array of removed elements]}.
	 * @param {Node} blockElement "block" element (PRE, BLOCKQUOTE, OL, UL...)
	 * @param {Object} [options] Options
	 * @param {Array<Node>} [options.selectedFormats=null] Array of "line" elements (P, DIV, LI...) to remove.
	 * - If null, Applies to all elements and return {cc: parentNode, sc: nextSibling, ec: previousSibling}
	 * @param {Node} [options.newBlockElement=null] The node(blockElement) to replace the currently wrapped node.
	 * @param {boolean} [options.shouldDelete=false] If true, deleted without detached.
	 * @param {boolean} [options.skipHistory=false] When true, it does not update the history stack and the selection object and return EdgeNodes (dom-query-GetEdgeChildNodes)
	 * @returns {{cc: Node, sc: Node, so: number, ec: Node, eo: number, removeArray: Array<Node>|null}} Node information after deletion
	 * - cc: Common parent container node
	 * - sc: Start container node
	 * - so: Start offset
	 * - ec: End container node
	 * - eo: End offset
	 * - removeArray: Array of removed elements
	 */
	removeBlock(blockElement, { selectedFormats, newBlockElement, shouldDelete, skipHistory } = {}) {
		const range = this.selection.getRange();
		let so = range.startOffset;
		let eo = range.endOffset;

		let children = dom.query.getListChildNodes(blockElement, null, 1);
		let parent = blockElement.parentNode;
		let firstNode = null;
		let lastNode = null;
		let rangeEl = /** @type {HTMLElement} */ (blockElement.cloneNode(false));

		const removeArray = [];
		const newList = dom.check.isList(newBlockElement);
		let insertedNew = false;
		let reset = false;
		let moveComplete = false;

		const appendNode = (parentEl, insNode, sibling, originNode) => {
			if (insNode.childNodes.length === 1 && dom.check.isZeroWidth(insNode)) {
				insNode.innerHTML = unicode.zeroWidthSpace;
				so = eo = 1;
			}

			if (insNode.nodeType === 3) {
				parentEl.insertBefore(insNode, sibling);
				return insNode;
			}

			const insChildren = (moveComplete ? insNode : originNode).childNodes;
			let format = insNode.cloneNode(false);
			let first = null;
			let c = null;

			while (insChildren[0]) {
				c = insChildren[0];
				if (this._notTextNode(c) && !dom.check.isBreak(c) && !dom.check.isListCell(format)) {
					if (format.childNodes.length > 0) {
						first ||= format;
						parentEl.insertBefore(format, sibling);
						format = insNode.cloneNode(false);
					}
					parentEl.insertBefore(c, sibling);
					first ||= c;
				} else {
					format.appendChild(c);
				}
			}

			if (format.childNodes.length > 0) {
				if (dom.check.isListCell(parentEl) && dom.check.isListCell(format) && dom.check.isList(sibling)) {
					if (newList) {
						first = sibling;
						while (sibling) {
							format.appendChild(sibling);
							sibling = sibling.nextSibling;
						}
						parentEl.parentNode.insertBefore(format, parentEl.nextElementSibling);
					} else {
						const originNext = originNode.nextElementSibling;
						const detachRange = this._removeNestedList(originNode, false);
						if (blockElement !== detachRange || originNext !== originNode.nextElementSibling) {
							const fChildren = format.childNodes;
							while (fChildren[0]) {
								originNode.appendChild(fChildren[0]);
							}

							blockElement = detachRange;
							reset = true;
						}
					}
				} else {
					parentEl.insertBefore(format, sibling);
				}

				first ||= format;
			}

			return first;
		};

		// detach loop
		for (let i = 0, len = children.length, insNode, lineIndex, next; i < len; i++) {
			insNode = children[i];
			if (insNode.nodeType === 3 && dom.check.isList(rangeEl)) continue;

			moveComplete = false;
			if (shouldDelete && i === 0) {
				if (!selectedFormats || selectedFormats.length === len || selectedFormats[0] === insNode) {
					firstNode = blockElement.previousSibling;
				} else {
					firstNode = rangeEl;
				}
			}

			if (selectedFormats) lineIndex = selectedFormats.indexOf(insNode);
			if (selectedFormats && lineIndex === -1) {
				rangeEl ||= /** @type {HTMLElement} */ (blockElement.cloneNode(false));
				rangeEl.appendChild(insNode);
			} else {
				if (selectedFormats) next = selectedFormats[lineIndex + 1];
				if (rangeEl && rangeEl.children.length > 0) {
					parent.insertBefore(rangeEl, blockElement);
					rangeEl = null;
				}

				if (!newList && dom.check.isListCell(insNode)) {
					if (next && dom.query.getNodeDepth(insNode) !== dom.query.getNodeDepth(next) && (dom.check.isListCell(parent) || dom.utils.arrayFind(insNode.children, dom.check.isList))) {
						const insNext = insNode.nextElementSibling;
						const detachRange = this._removeNestedList(insNode, false);
						if (blockElement !== detachRange || insNext !== insNode.nextElementSibling) {
							blockElement = detachRange;
							reset = true;
						}
					} else {
						const inner = insNode;
						insNode = dom.utils.createElement(
							shouldDelete
								? inner.nodeName
								: dom.check.isList(blockElement.parentNode) || dom.check.isListCell(blockElement.parentNode)
								? 'LI'
								: dom.check.isTableCell(blockElement.parentNode)
								? 'DIV'
								: this.options.get('defaultLine')
						);
						const isCell = dom.check.isListCell(insNode);
						const innerChildren = inner.childNodes;
						while (innerChildren[0]) {
							if (dom.check.isList(innerChildren[0]) && !isCell) break;
							insNode.appendChild(innerChildren[0]);
						}
						dom.utils.copyFormatAttributes(insNode, inner);
						moveComplete = true;
					}
				} else {
					insNode = insNode.cloneNode(false);
				}

				if (!reset) {
					if (!shouldDelete) {
						if (newBlockElement) {
							if (!insertedNew) {
								parent.insertBefore(newBlockElement, blockElement);
								insertedNew = true;
							}
							insNode = appendNode(newBlockElement, insNode, null, children[i]);
						} else {
							insNode = appendNode(parent, insNode, blockElement, children[i]);
						}

						if (!reset) {
							if (selectedFormats) {
								lastNode = insNode;
								firstNode ||= insNode;
							} else if (!firstNode) {
								firstNode = lastNode = insNode;
							}
						}
					} else {
						removeArray.push(insNode);
						dom.utils.removeItem(children[i]);
					}

					if (reset) {
						reset = moveComplete = false;
						children = dom.query.getListChildNodes(blockElement, null, 1);
						rangeEl = /** @type {HTMLElement} */ (blockElement.cloneNode(false));
						parent = blockElement.parentNode;
						i = -1;
						len = children.length;
						continue;
					}
				}
			}
		}

		const rangeParent = blockElement.parentNode;
		let rangeRight = blockElement.nextSibling;
		if (rangeEl?.children.length > 0) {
			rangeParent.insertBefore(rangeEl, rangeRight);
		}

		if (newBlockElement) firstNode = newBlockElement.previousSibling;
		else firstNode ||= blockElement.previousSibling;
		rangeRight = blockElement.nextSibling !== rangeEl ? blockElement.nextSibling : rangeEl ? rangeEl.nextSibling : null;

		if (/** @type {HTMLElement} */ (blockElement).children.length === 0 || blockElement.textContent.length === 0) {
			dom.utils.removeItem(blockElement);
		} else {
			this.nodeTransform.removeEmptyNode(blockElement, null, false);
		}

		let edge = null;
		if (shouldDelete) {
			edge = {
				cc: rangeParent,
				sc: firstNode,
				so: so,
				ec: rangeRight,
				eo: eo,
				removeArray: removeArray
			};
		} else {
			firstNode ||= lastNode;
			lastNode ||= firstNode;
			const childEdge = dom.query.getEdgeChildNodes(firstNode, lastNode.parentNode ? firstNode : lastNode);
			edge = {
				cc: (childEdge.sc || childEdge.ec).parentNode,
				sc: childEdge.sc,
				so: so,
				ec: childEdge.ec,
				eo: eo,
				removeArray: null
			};
		}

		this.editor.effectNode = null;
		if (skipHistory) return edge;

		if (!shouldDelete && edge) {
			if (!selectedFormats) {
				this.selection.setRange(edge.sc, 0, edge.sc, 0);
			} else {
				this.selection.setRange(edge.sc, so, edge.ec, eo);
			}
		}

		this.history.push(false);
	},

	/**
	 * @this {FormatThis}
	 * @description Append all selected "line" element to the list and insert.
	 * @param {string} type List type. (ol | ul):[listStyleType]
	 * @param {Array<Node>} selectedCells "line" elements or list cells.
	 * @param {boolean} nested If true, indenting existing list cells.
	 */
	applyList(type, selectedCells, nested) {
		const listTag = (type.split(':')[0] || 'ol').toUpperCase();
		const listStyle = type.split(':')[1] || '';

		let range = this.selection.getRange();
		let selectedFormats = /** @type {Array<HTMLElement>} */ (!selectedCells ? this.getLinesAndComponents(false) : selectedCells);

		if (selectedFormats.length === 0) {
			if (selectedCells) return;
			range = this.selection.getRangeAndAddLine(range, null);
			selectedFormats = this.getLinesAndComponents(false);
			if (selectedFormats.length === 0) return;
		}

		dom.query.sortNodeByDepth(selectedFormats, true);

		// merge
		const firstSel = selectedFormats[0];
		const lastSel = selectedFormats.at(-1);
		let topEl = (dom.check.isListCell(firstSel) || this.component.is(firstSel)) && !firstSel.previousElementSibling ? firstSel.parentElement.previousElementSibling : firstSel.previousElementSibling;
		let bottomEl = (dom.check.isListCell(lastSel) || this.component.is(lastSel)) && !lastSel.nextElementSibling ? lastSel.parentElement.nextElementSibling : lastSel.nextElementSibling;

		const isCollapsed = range.collapsed;
		const originRange = {
			sc: range.startContainer,
			so: range.startContainer === range.endContainer && dom.check.isZeroWidth(range.startContainer) && range.startOffset === 0 && range.endOffset === 1 ? range.endOffset : range.startOffset,
			ec: range.endContainer,
			eo: range.endOffset
		};
		let afterRange = null;
		let isRemove = true;

		for (let i = 0, len = selectedFormats.length; i < len; i++) {
			if (!dom.check.isList(this.getBlock(selectedFormats[i], (current) => this.getBlock(current) && current !== selectedFormats[i]))) {
				isRemove = false;
				break;
			}
		}

		if (isRemove && (!topEl || firstSel.tagName !== topEl.tagName || listTag !== topEl.tagName.toUpperCase()) && (!bottomEl || lastSel.tagName !== bottomEl.tagName || listTag !== bottomEl.tagName.toUpperCase())) {
			if (nested) {
				for (let i = 0, len = selectedFormats.length; i < len; i++) {
					for (let j = i - 1; j >= 0; j--) {
						if (selectedFormats[j].contains(selectedFormats[i])) {
							selectedFormats.splice(i, 1);
							i--;
							len--;
							break;
						}
					}
				}
			}

			const currentFormat = this.getBlock(firstSel);
			const cancel = currentFormat?.tagName === listTag;
			let rangeArr, tempList;
			const passComponent = (current) => {
				return !dom.check.isComponentContainer(current);
			};

			if (!cancel) {
				tempList = dom.utils.createElement(listTag, { style: 'list-style-type: ' + listStyle });
			}

			for (let i = 0, len = selectedFormats.length, r, o; i < len; i++) {
				o = this.getBlock(selectedFormats[i], passComponent);
				if (!o || !dom.check.isList(o)) continue;

				if (!r) {
					r = o;
					rangeArr = {
						r: r,
						f: [dom.query.getParentElement(selectedFormats[i], 'LI')]
					};
				} else {
					if (r !== o) {
						if (nested && dom.check.isListCell(o.parentNode)) {
							this._detachNested(rangeArr.f);
						} else {
							afterRange = this.removeBlock(rangeArr.f[0].parentElement, { selectedFormats: rangeArr.f, newBlockElement: tempList, shouldDelete: false, skipHistory: true });
						}

						o = selectedFormats[i].parentNode;
						if (!cancel) {
							tempList = dom.utils.createElement(listTag, { style: 'list-style-type: ' + listStyle });
						}

						r = o;
						rangeArr = {
							r: r,
							f: [dom.query.getParentElement(selectedFormats[i], 'LI')]
						};
					} else {
						rangeArr.f.push(dom.query.getParentElement(selectedFormats[i], 'LI'));
					}
				}

				if (i === len - 1) {
					if (nested && dom.check.isListCell(o.parentNode)) {
						this._detachNested(rangeArr.f);
					} else {
						afterRange = this.removeBlock(rangeArr.f[0].parentElement, { selectedFormats: rangeArr.f, newBlockElement: tempList, shouldDelete: false, skipHistory: true });
					}
				}
			}
		} else {
			const topElParent = topEl ? topEl.parentNode : topEl;
			const bottomElParent = bottomEl ? bottomEl.parentNode : bottomEl;
			topEl = /** @type {HTMLElement} */ (topElParent && !dom.check.isWysiwygFrame(topElParent) && topElParent.nodeName === listTag ? topElParent : topEl);
			bottomEl = /** @type {HTMLElement} */ (bottomElParent && !dom.check.isWysiwygFrame(bottomElParent) && bottomElParent.nodeName === listTag ? bottomElParent : bottomEl);

			const mergeTop = topEl?.tagName === listTag;
			const mergeBottom = bottomEl?.tagName === listTag;

			let list = mergeTop ? topEl : dom.utils.createElement(listTag, { style: 'list-style-type: ' + listStyle });
			let firstList = null;
			let topNumber = null;
			// let lastList = null;
			// let bottomNumber = null;

			const passComponent = (current) => {
				return !dom.check.isComponentContainer(current) && !dom.check.isList(current);
			};

			for (let i = 0, len = selectedFormats.length, newCell, fTag, isCell, next, originParent, nextParent, parentTag, siblingTag, rangeTag; i < len; i++) {
				fTag = selectedFormats[i];
				if (fTag.childNodes.length === 0 && !this._isIgnoreNodeChange(fTag)) {
					dom.utils.removeItem(fTag);
					continue;
				}
				next = selectedFormats[i + 1];
				originParent = fTag.parentNode;
				nextParent = next ? next.parentNode : null;
				isCell = dom.check.isListCell(fTag);
				rangeTag = this.isBlock(originParent) ? originParent : null;
				parentTag = isCell && !dom.check.isWysiwygFrame(originParent) ? originParent.parentNode : originParent;
				siblingTag = isCell && !dom.check.isWysiwygFrame(originParent) ? (!next || dom.check.isListCell(parentTag) ? originParent : originParent.nextSibling) : fTag.nextSibling;

				newCell = dom.utils.createElement('LI');

				if (this.component.is(fTag)) {
					const isHR = /^HR$/i.test(fTag.nodeName);
					if (!isHR) newCell.innerHTML = '<br>';
					newCell.innerHTML += fTag.outerHTML;
					if (isHR) newCell.innerHTML += '<br>';
				} else {
					dom.utils.copyFormatAttributes(newCell, fTag);
					const fChildren = fTag.childNodes;
					while (fChildren[0]) {
						newCell.appendChild(fChildren[0]);
					}
				}
				list.appendChild(newCell);

				// if (!next) lastList = list;
				if (!next || parentTag !== nextParent || this.isBlock(siblingTag)) {
					firstList ||= list;
					if ((!mergeTop || !next || parentTag !== nextParent) && !(next && dom.check.isList(nextParent) && nextParent === originParent)) {
						if (list.parentNode !== parentTag) parentTag.insertBefore(list, siblingTag);
					}
				}

				dom.utils.removeItem(fTag);
				if (mergeTop && topNumber === null) topNumber = list.children.length - 1;
				if (
					next &&
					(this.getBlock(nextParent, passComponent) !== this.getBlock(originParent, passComponent) ||
						(dom.check.isList(nextParent) && dom.check.isList(originParent) && dom.query.getNodeDepth(nextParent) !== dom.query.getNodeDepth(originParent)))
				) {
					list = dom.utils.createElement(listTag, { style: 'list-style-type: ' + listStyle });
				}

				if (rangeTag?.children.length === 0) dom.utils.removeItem(rangeTag);
			}

			if (topNumber) {
				firstList = firstList.children[topNumber];
			}

			if (mergeBottom) {
				// bottomNumber = list.children.length - 1;
				list.innerHTML += bottomEl.innerHTML;
				// lastList = list.children[bottomNumber] || lastList;
				dom.utils.removeItem(bottomEl);
			}
		}

		this.editor.effectNode = null;
		return !isRemove || !isCollapsed ? originRange : afterRange || originRange;
	},

	/**
	 * @this {FormatThis}
	 * @description "selectedCells" array are detached from the list element.
	 * - The return value is applied when the first and last lines of "selectedFormats" are "LI" respectively.
	 * @param {Array<Node>} selectedCells Array of ["line", li] elements(LI, P...) to remove.
	 * @param {boolean} shouldDelete If true, It does not just remove the list, it deletes the content.
	 * @returns {{sc: Node, ec: Node}} Node information after deletion
	 * - sc: Start container node
	 * - ec: End container node
	 */
	removeList(selectedCells, shouldDelete) {
		let rangeArr = {};
		let listFirst = false;
		let listLast = false;
		let first = null;
		let last = null;
		const passComponent = (current) => {
			return !dom.check.isComponentContainer(current);
		};

		for (let i = 0, len = selectedCells.length, r, o, lastIndex, isList; i < len; i++) {
			lastIndex = i === len - 1;
			o = this.getBlock(selectedCells[i], passComponent);
			isList = dom.check.isList(o);
			if (!r && isList) {
				r = o;
				rangeArr = {
					r: r,
					f: [dom.query.getParentElement(selectedCells[i], 'LI')]
				};
				if (i === 0) listFirst = true;
			} else if (r && isList) {
				if (r !== o) {
					const edge = this.removeBlock(rangeArr.f[0].parentNode, { selectedFormats: rangeArr.f, newBlockElement: null, shouldDelete, skipHistory: true });
					o = selectedCells[i].parentNode;
					if (listFirst) {
						first = edge.sc;
						listFirst = false;
					}
					if (lastIndex) last = edge.ec;

					if (isList) {
						r = o;
						rangeArr = {
							r: r,
							f: [dom.query.getParentElement(selectedCells[i], 'LI')]
						};
						if (lastIndex) listLast = true;
					} else {
						r = null;
					}
				} else {
					rangeArr.f.push(dom.query.getParentElement(selectedCells[i], 'LI'));
					if (lastIndex) listLast = true;
				}
			}

			if (lastIndex && dom.check.isList(r)) {
				const edge = this.removeBlock(rangeArr.f[0].parentNode, { selectedFormats: rangeArr.f, newBlockElement: null, shouldDelete, skipHistory: true });
				if (listLast || len === 1) last = edge.ec;
				if (listFirst) first = edge.sc || last;
			}
		}

		return {
			sc: first,
			ec: last
		};
	},

	/**
	 * @this {FormatThis}
	 * @description Indent more the selected lines.
	 * - margin size : 'status.indentSize'px
	 */
	indent() {
		const range = this.selection.getRange();
		const sc = range.startContainer;
		const ec = range.endContainer;
		const so = range.startOffset;
		const eo = range.endOffset;

		const lines = this.getLines(null);
		const cells = SetLineMargin(lines, this.status.indentSize, this.options.get('_rtl') ? 'marginRight' : 'marginLeft');

		// list cells
		if (cells.length > 0) {
			this._applyNestedList(cells, false);
		}

		this.editor.effectNode = null;
		this.selection.setRange(sc, so, ec, eo);
		this.history.push(false);
	},

	/**
	 * @this {FormatThis}
	 * @description Indent less the selected lines.
	 * - margin size - "status.indentSize"px
	 */
	outdent() {
		const range = this.selection.getRange();
		const sc = range.startContainer;
		const ec = range.endContainer;
		const so = range.startOffset;
		const eo = range.endOffset;

		const lines = this.getLines(null);
		const cells = SetLineMargin(lines, this.status.indentSize * -1, this.options.get('_rtl') ? 'marginRight' : 'marginLeft');

		// list cells
		if (cells.length > 0) {
			this._applyNestedList(cells, true);
		}

		this.editor.effectNode = null;
		this.selection.setRange(sc, so, ec, eo);
		this.history.push(false);
	},

	/**
	 * @this {FormatThis}
	 * @description Adds, updates, or deletes style nodes from selected text (a, span, strong, etc.).
	 * @param {?Node} styleNode The element to be added to the selection. If null, only existing nodes are modified or removed.
	 * @param {Object} [options] Options
	 * @param {Array<string>} [options.stylesToModify=null] Array of style or class names to check and modify.
	 *        (e.g., ['font-size'], ['.className'], ['font-family', 'color', '.className'])
	 * @param {Array<string>} [options.nodesToRemove=null] Array of node names to remove.
	 *        If empty array or null when styleNode is null, all formats are removed.
	 *        (e.g., ['span'], ['strong', 'em'])
	 * @param {boolean} [options.strictRemove=false] If true, only removes nodes from nodesToRemove if all styles and classes are removed.
	 * @returns {HTMLElement} The element that was added to or modified in the selection.
	 *
	 * @details
	 * 1. If styleNode is provided, a node with the same tags and attributes is added to the selected text.
	 * 2. If the same tag already exists, only its attributes are updated.
	 * 3. If styleNode is null, existing nodes are updated or removed without adding new ones.
	 * 4. Styles matching those in stylesToModify are removed. (Use CSS attribute names, e.g., "background-color")
	 * 5. Classes matching those in stylesToModify (prefixed with ".") are removed.
	 * 6. stylesToModify is used to avoid duplicate property values from styleNode.
	 * 7. Nodes with all styles and classes removed are deleted if they match styleNode, are in nodesToRemove, or if styleNode is null.
	 * 8. Tags matching names in nodesToRemove are deleted regardless of their style and class.
	 * 9. If strictRemove is true, nodes in nodesToRemove are only removed if all their styles and classes are removed.
	 * 10. The function won't modify nodes if the parent has the same class and style values.
	 * - However, if nodesToRemove has values, it will work and separate text nodes even if there's no node to replace.
	 */
	applyInlineElement(styleNode, { stylesToModify, nodesToRemove, strictRemove } = {}) {
		if (dom.query.getParentElement(this.selection.getNode(), dom.check.isNonEditable)) return;

		this.selection._resetRangeToTextNode();
		let range = this.selection.getRangeAndAddLine(this.selection.getRange(), null);
		stylesToModify = stylesToModify?.length > 0 ? stylesToModify : null;
		nodesToRemove = nodesToRemove?.length > 0 ? nodesToRemove : null;

		const isRemoveNode = !styleNode;
		const isRemoveFormat = isRemoveNode && !nodesToRemove && !stylesToModify;
		let startCon = range.startContainer;
		let startOff = range.startOffset;
		let endCon = range.endContainer;
		let endOff = range.endOffset;

		if ((isRemoveFormat && range.collapsed && this.isLine(startCon.parentNode) && this.isLine(endCon.parentNode)) || (startCon === endCon && startCon.nodeType === 1 && dom.check.isNonEditable(startCon))) {
			const format = startCon.parentNode;
			if (
				!dom.check.isListCell(format) ||
				!converter.getValues(format.style).some((k) => {
					return this._listKebab.includes(k);
				})
			)
				return;
			return;
		}

		if (range.collapsed && !isRemoveFormat) {
			if (startCon.nodeType === 1 && !dom.check.isBreak(startCon) && !this.component.is(startCon)) {
				let afterNode = null;
				const focusNode = startCon.childNodes[startOff];

				if (focusNode) {
					if (!focusNode.nextSibling) {
						afterNode = null;
					} else {
						afterNode = dom.check.isBreak(focusNode) ? focusNode : focusNode.nextSibling;
					}
				}

				const zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
				startCon.insertBefore(zeroWidth, afterNode);
				this.selection.setRange(zeroWidth, 1, zeroWidth, 1);

				range = this.selection.getRange();
				startCon = range.startContainer;
				startOff = range.startOffset;
				endCon = range.endContainer;
				endOff = range.endOffset;
			}
		}

		if (this.isLine(startCon)) {
			startCon = startCon.childNodes[startOff] || startCon.firstChild;
			startOff = 0;
		}
		if (this.isLine(endCon)) {
			endCon = endCon.childNodes[endOff] || endCon.lastChild;
			endOff = endCon.textContent.length;
		}

		if (isRemoveNode) {
			styleNode = dom.utils.createElement('DIV');
		}

		const wRegExp = RegExp;
		const newNodeName = styleNode.nodeName;

		/* checked same style property */
		if (!isRemoveFormat && startCon === endCon && !nodesToRemove && styleNode) {
			let sNode = startCon;
			let checkCnt = 0;
			const checkAttrs = [];

			const checkStyles = /** @type {HTMLElement} */ (styleNode).style;
			for (let i = 0, len = checkStyles.length; i < len; i++) {
				checkAttrs.push(checkStyles[i]);
			}

			const checkClassName = /** @type {HTMLElement} */ (styleNode).className;
			const ckeckClasses = /** @type {HTMLElement} */ (styleNode).classList;
			for (let i = 0, len = ckeckClasses.length; i < len; i++) {
				checkAttrs.push('.' + ckeckClasses[i]);
			}

			if (checkAttrs.length > 0) {
				while (!this.isLine(sNode) && !dom.check.isWysiwygFrame(sNode)) {
					for (let i = 0; i < checkAttrs.length; i++) {
						if (sNode.nodeType === 1) {
							const s = checkAttrs[i];
							const classReg = /^\./.test(s) ? new wRegExp('\\s*' + s.replace(/^\./, '') + '(\\s+|$)', 'ig') : false;
							const sNodeStyle = /** @type {HTMLElement} */ (sNode).style;
							const sNodeClassName = /** @type {HTMLElement} */ (sNode).className;

							const styleCheck = isRemoveNode ? !!sNodeStyle[s] : !!sNodeStyle[s] && !!checkStyles[s] && sNodeStyle[s] === checkStyles[s];
							const classCheck = classReg === false ? false : isRemoveNode ? !!sNodeClassName.match(classReg) : !!sNodeClassName.match(classReg) && !!checkClassName.match(classReg);
							if (styleCheck || classCheck) {
								checkCnt++;
							}
						}
					}
					sNode = sNode.parentNode;
				}

				if (checkCnt >= checkAttrs.length) return;
			}
		}

		let newNode;
		/** @type {NodeStyleContainerType} */
		let start = {};
		/** @type {NodeStyleContainerType} */
		let end = {};

		/** @type {string|RegExp} */
		let styleRegExp = '';
		/** @type {string|RegExp} */
		let classRegExp = '';
		/** @type {string|RegExp} */
		let removeNodeRegExp;

		if (stylesToModify) {
			for (let i = 0, len = stylesToModify.length, s; i < len; i++) {
				s = stylesToModify[i];
				if (/^\./.test(s)) {
					classRegExp += (classRegExp ? '|' : '\\s*(?:') + s.replace(/^\./, '');
				} else {
					styleRegExp += (styleRegExp ? '|' : '(?:;|^|\\s)(?:') + s;
				}
			}

			if (styleRegExp) {
				styleRegExp += ')\\s*:[^;]*\\s*(?:;|$)';
				styleRegExp = new wRegExp(styleRegExp, 'ig');
			}

			if (classRegExp) {
				classRegExp += ')(?=\\s+|$)';
				classRegExp = new wRegExp(classRegExp, 'ig');
			}
		}

		if (nodesToRemove) {
			removeNodeRegExp = '^(?:' + nodesToRemove[0];
			for (let i = 1; i < nodesToRemove.length; i++) {
				removeNodeRegExp += '|' + nodesToRemove[i];
			}
			removeNodeRegExp += ')$';
			removeNodeRegExp = new wRegExp(removeNodeRegExp, 'i');
		}

		/** validation check function*/
		const _removeCheck = {
			v: false
		};
		const validation = function (checkNode) {
			const vNode = checkNode.cloneNode(false);

			// all path
			if (vNode.nodeType === 3 || dom.check.isBreak(vNode)) return vNode;
			// all remove
			if (isRemoveFormat) return null;

			// remove node check
			const tagRemove = (!removeNodeRegExp && isRemoveNode) || /** @type {RegExp} */ (removeNodeRegExp)?.test(vNode.nodeName);

			// tag remove
			if (tagRemove && !strictRemove) {
				_removeCheck.v = true;
				return null;
			}

			// style regexp
			const originStyle = vNode.style.cssText;
			let style = '';
			if (styleRegExp && originStyle.length > 0) {
				style = originStyle.replace(styleRegExp, '').trim();
				if (style !== originStyle) _removeCheck.v = true;
			}

			// class check
			const originClasses = vNode.className;
			let classes = '';
			if (classRegExp && originClasses.length > 0) {
				classes = originClasses.replace(classRegExp, '').trim();
				if (classes !== originClasses) _removeCheck.v = true;
			}

			// remove only
			if (isRemoveNode) {
				if ((classRegExp || !originClasses) && (styleRegExp || !originStyle) && !style && !classes && tagRemove) {
					_removeCheck.v = true;
					return null;
				}
			}

			// change
			if (style || classes || vNode.nodeName !== newNodeName || Boolean(styleRegExp) !== Boolean(originStyle) || Boolean(classRegExp) !== Boolean(originClasses)) {
				if (styleRegExp && originStyle.length > 0) vNode.style.cssText = style;
				if (!vNode.style.cssText) {
					vNode.removeAttribute('style');
				}

				if (classRegExp && originClasses.length > 0) vNode.className = classes.trim();
				if (!vNode.className.trim()) {
					vNode.removeAttribute('class');
				}

				if (!vNode.style.cssText && !vNode.className && (vNode.nodeName === newNodeName || tagRemove)) {
					_removeCheck.v = true;
					return null;
				}

				return vNode;
			}

			_removeCheck.v = true;
			return null;
		};

		// get line nodes
		const lineNodes = this.getLines(null);
		if (lineNodes.length === 0) {
			console.warn('[SUNEDITOR.format.applyInlineElement.warn] There is no line to apply.');
			return;
		}

		range = this.selection.getRange();
		startCon = range.startContainer;
		startOff = range.startOffset;
		endCon = range.endContainer;
		endOff = range.endOffset;

		if (!this.getLine(startCon, null)) {
			startCon = dom.query.getEdgeChild(
				lineNodes[0],
				function (current) {
					return current.nodeType === 3;
				},
				false
			);
			startOff = 0;
		}

		if (!this.getLine(endCon, null)) {
			endCon = dom.query.getEdgeChild(
				lineNodes.at(-1),
				function (current) {
					return current.nodeType === 3;
				},
				false
			);
			endOff = endCon.textContent.length;
		}

		const oneLine = this.getLine(startCon, null) === this.getLine(endCon, null);
		const endLength = lineNodes.length - (oneLine ? 0 : 1);

		// node Changes
		newNode = styleNode.cloneNode(false);

		const isRemoveAnchor =
			isRemoveFormat ||
			(isRemoveNode &&
				(function (inst, arr) {
					for (let n = 0, len = arr.length; n < len; n++) {
						if (inst._isNonSplitNode(arr[n])) return true;
					}
					return false;
				})(this, nodesToRemove));

		const isSizeNode = isRemoveNode || this._sn_isSizeNode(newNode);
		const _getMaintainedNode = this._sn_getMaintainedNode.bind(this, isRemoveAnchor, isSizeNode);
		const _isMaintainedNode = this._sn_isMaintainedNode.bind(this, isRemoveAnchor, isSizeNode);

		// one line
		if (oneLine) {
			if (this._sn_resetCommonListCell(lineNodes[0], stylesToModify)) range = this.selection.setRange(startCon, startOff, endCon, endOff);

			const newRange = this._setNode_oneLine(lineNodes[0], newNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, isRemoveNode, range.collapsed, _removeCheck, _getMaintainedNode, _isMaintainedNode);
			start.container = newRange.startContainer;
			start.offset = newRange.startOffset;
			end.container = newRange.endContainer;
			end.offset = newRange.endOffset;

			if (start.container === end.container && dom.check.isZeroWidth(start.container)) {
				start.offset = end.offset = 1;
			}
			this._sn_setCommonListStyle(newRange.ancestor, null);
		} else {
			// multi line
			let appliedCommonList = false;
			if (endLength > 0 && this._sn_resetCommonListCell(lineNodes[endLength], stylesToModify)) appliedCommonList = true;
			if (this._sn_resetCommonListCell(lineNodes[0], stylesToModify)) appliedCommonList = true;
			if (appliedCommonList) this.selection.setRange(startCon, startOff, endCon, endOff);

			// end
			if (endLength > 0) {
				newNode = styleNode.cloneNode(false);
				end = this._setNode_endLine(lineNodes[endLength], newNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode);
			}

			// mid
			for (let i = endLength - 1, newRange; i > 0; i--) {
				this._sn_resetCommonListCell(lineNodes[i], stylesToModify);
				newNode = styleNode.cloneNode(false);
				newRange = this._setNode_middleLine(lineNodes[i], newNode, validation, isRemoveFormat, isRemoveNode, _removeCheck, end.container);
				if (newRange.endContainer && newRange.ancestor.contains(newRange.endContainer)) {
					end.ancestor = null;
					end.container = newRange.endContainer;
				}
				this._sn_setCommonListStyle(newRange.ancestor, null);
			}

			// start
			newNode = styleNode.cloneNode(false);
			start = this._setNode_startLine(lineNodes[0], newNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode, end.container);

			if (start.endContainer) {
				end.ancestor = null;
				end.container = start.endContainer;
			}

			if (endLength <= 0) {
				end = start;
			} else if (!end.container) {
				end.ancestor = null;
				end.container = start.container;
				end.offset = start.container.textContent.length;
			}

			this._sn_setCommonListStyle(start.ancestor, null);
			this._sn_setCommonListStyle(end.ancestor || this.getLine(end.container), null);
		}

		// set range
		this.ui._offCurrentController();
		this.selection.setRange(start.container, start.offset, end.container, end.offset);
		this.history.push(false);

		return /** @type {HTMLElement} */ (newNode);
	},

	/**
	 * @this {FormatThis}
	 * @description Remove format of the currently selected text.
	 */
	removeInlineElement() {
		this.applyInlineElement(null, { stylesToModify: null, nodesToRemove: null, strictRemove: null });
	},

	/**
	 * @this {FormatThis}
	 * @description Check if the container and offset values are the edges of the "line"
	 * @param {Node} node The node of the selection object. (range.startContainer..)
	 * @param {number} offset The offset of the selection object. (selection.getRange().startOffset...)
	 * @param {"front"|"end"} dir Select check point - "front": Front edge, "end": End edge, undefined: Both edge.
	 * @returns {node is HTMLElement}
	 */
	isEdgeLine(node, offset, dir) {
		if (!dom.check.isEdgePoint(node, offset, dir)) return false;

		let result = false;
		const siblingType = dir === 'front' ? 'previousSibling' : 'nextSibling';
		while (node && !this.isLine(node) && !dom.check.isWysiwygFrame(node)) {
			if (!node[siblingType] || (dom.check.isBreak(node[siblingType]) && !node[siblingType][siblingType])) {
				result = true;
				node = node.parentNode;
			} else {
				return false;
			}
		}

		return result;
	},

	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is a node related to the text style.
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isTextStyleNode(element) {
		return typeof element === 'string' ? this._textStyleTagsCheck.test(element) : element && element.nodeType === 1 && this._textStyleTagsCheck.test(element.nodeName);
	},

	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the "line" element.
	 * - (P, DIV, H[1-6], PRE, LI | class="__se__format__line_xxx")
	 * - "line" element also contain "brLine" element
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isLine(element) {
		return typeof element === 'string'
			? this._formatLineCheck.test(element)
			: element && element.nodeType === 1 && (this._formatLineCheck.test(element.nodeName) || dom.utils.hasClass(element, '__se__format__line_.+|__se__format__br_line_.+')) && !this._nonFormat(element);
	},

	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the only "line" element.
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isNormalLine(element) {
		return this.isLine(element) && (this._brLineBreak || !this.isBrLine(element)) && !this.isBlock(element);
	},

	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the "brLine" element.
	 * - (PRE | class="__se__format__br_line_xxx")
	 * - "brLine" elements is included in the "line" element.
	 * - "brLine" elements's line break is "BR" tag.
	 * ※ Entering the Enter key in the space on the last line ends "brLine" and appends "line".
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isBrLine(element) {
		return (
			(this._brLineBreak && this.isLine(element)) ||
			(typeof element === 'string'
				? this._formatBrLineCheck.test(element)
				: element && element.nodeType === 1 && (this._formatBrLineCheck.test(element.nodeName) || dom.utils.hasClass(element, '__se__format__br_line_.+')) && !this._nonFormat(element))
		);
	},

	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the "block" element.
	 * - (BLOCKQUOTE, OL, UL, FIGCAPTION, TABLE, THEAD, TBODY, TR, TH, TD | class="__se__format__block_xxx")
	 * - "block" is wrap the "line" and "component"
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isBlock(element) {
		return typeof element === 'string'
			? this._formatBlockCheck.test(element)
			: element && element.nodeType === 1 && (this._formatBlockCheck.test(element.nodeName) || dom.utils.hasClass(element, '__se__format__block_.+')) && !this._nonFormat(element);
	},

	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the "closureBlock" element.
	 * - (TH, TD | class="__se__format__block_closure_xxx")
	 * - "closureBlock" elements is included in the "block".
	 * - "closureBlock" element is wrap the "line" and "component"
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. ([ex] format of table cells)
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isClosureBlock(element) {
		return typeof element === 'string'
			? this._formatClosureBlockCheck.test(element)
			: element && element.nodeType === 1 && (this._formatClosureBlockCheck.test(element.nodeName) || dom.utils.hasClass(element, '__se__format__block_closure_.+')) && !this._nonFormat(element);
	},

	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the "closureBrLine" element.
	 * - (class="__se__format__br_line__closure_xxx")
	 * - "closureBrLine" elements is included in the "brLine".
	 * - "closureBrLine" elements's line break is "BR" tag.
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. ([ex] format of table cells)
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isClosureBrLine(element) {
		return typeof element === 'string'
			? this._formatClosureBrLineCheck.test(element)
			: element && element.nodeType === 1 && (this._formatClosureBrLineCheck.test(element.nodeName) || dom.utils.hasClass(element, '__se__format__br_line__closure_.+')) && !this._nonFormat(element);
	},

	/**
	 * @this {FormatThis}
	 * @description Returns a "line" array from selected range.
	 * @param {?(current: Node) => boolean=} validation The validation function. (Replaces the default validation format.isLine(current))
	 * @returns {Array<HTMLElement>}
	 */
	getLines(validation) {
		if (!this.selection._resetRangeToTextNode()) return [];
		let range = this.selection.getRange();

		if (dom.check.isWysiwygFrame(range.startContainer)) {
			const children = this.frameContext.get('wysiwyg').children;
			if (children.length === 0) return [];

			this.selection.setRange(children[0], 0, children.at(-1), children.at(-1).textContent.trim().length);
			range = this.selection.getRange();
		}

		const startCon = range.startContainer;
		const endCon = range.endContainer;
		const commonCon = range.commonAncestorContainer;

		// get line nodes
		validation ||= this.isLine.bind(this);
		const lineNodes = dom.query.getListChildren(commonCon, (current) => validation(current), null);

		if (commonCon.nodeType === 3 || (!dom.check.isWysiwygFrame(commonCon) && !this.isBlock(commonCon))) lineNodes.unshift(this.getLine(commonCon, null));
		if (startCon === endCon || lineNodes.length === 1) return lineNodes;

		const startLine = this.getLine(startCon, null);
		const endLine = this.getLine(endCon, null);
		let startIdx = null;
		let endIdx = null;

		const onlyTable = function (current) {
			return dom.check.isTableElements(current) ? /^TABLE$/i.test(current.nodeName) : true;
		};

		let startRangeEl = this.getBlock(startLine, onlyTable);
		let endRangeEl = this.getBlock(endLine, onlyTable);
		if (dom.check.isTableElements(startRangeEl) && dom.check.isListCell(startRangeEl.parentNode)) startRangeEl = startRangeEl.parentNode;
		if (dom.check.isTableElements(endRangeEl) && dom.check.isListCell(endRangeEl.parentNode)) endRangeEl = endRangeEl.parentNode;

		const sameRange = startRangeEl === endRangeEl;
		for (let i = 0, len = lineNodes.length, line; i < len; i++) {
			line = lineNodes[i];

			if (startLine === line || (!sameRange && line === startRangeEl)) {
				startIdx = i;
				continue;
			}

			if (endLine === line || (!sameRange && line === endRangeEl)) {
				endIdx = i;
				break;
			}
		}

		if (startIdx === null) startIdx = 0;
		if (endIdx === null) endIdx = lineNodes.length - 1;

		return lineNodes.slice(startIdx, endIdx + 1);
	},

	/**
	 * @this {FormatThis}
	 * @description Get lines and components from the selected range. (P, DIV, H[1-6], OL, UL, TABLE..)
	 * - If some of the component are included in the selection, get the entire that component.
	 * @param {boolean} removeDuplicate If true, if there is a parent and child tag among the selected elements, the child tag is excluded.
	 * @returns {Array<HTMLElement>}
	 */
	getLinesAndComponents(removeDuplicate) {
		const commonCon = this.selection.getRange().commonAncestorContainer;
		const myComponent = dom.query.getParentElement(commonCon, this.component.is.bind(this.component));
		const selectedLines = dom.check.isTableElements(commonCon)
			? this.getLines(null)
			: this.getLines((current) => {
					const component = dom.query.getParentElement(current, this.component.is.bind(this.component));
					return (this.isLine(current) && (!component || component === myComponent)) || (dom.check.isComponentContainer(current) && !this.getLine(current));
			  });

		if (removeDuplicate) {
			for (let i = 0, len = selectedLines.length; i < len; i++) {
				for (let j = i - 1; j >= 0; j--) {
					if (selectedLines[j].contains(selectedLines[i])) {
						selectedLines.splice(i, 1);
						i--;
						len--;
						break;
					}
				}
			}
		}

		return selectedLines;
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description A function that distinguishes areas where "selection" should not be placed
	 * @param {Node} element Element
	 * @returns {boolean}
	 */
	_isExcludeSelectionElement(element) {
		return !/FIGCAPTION/i.test(element.nodeName) && (this.component.is(element) || /FIGURE/i.test(element.nodeName));
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description A function that distinguishes non-formatting HTML elements or tags from formatting ones.
	 * @param {Node} element Element
	 * @returns {boolean}
	 */
	_nonFormat(element) {
		return dom.check.isExcludeFormat(element) || this.component.is(element) || dom.check.isWysiwygFrame(element);
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Nodes that must remain undetached when changing text nodes (A, Label, Code, Span:font-size)
	 * @param {Node|string} element Element to check
	 * @returns {boolean}
	 */
	_isNonSplitNode(element) {
		if (!element) return false;
		const checkRegExp = /^(a|label|code|summary)$/i;
		if (typeof element === 'string') return checkRegExp.test(element);
		return element.nodeType === 1 && checkRegExp.test(element.nodeName);
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Nodes without text
	 * @param {Node|string} element Element to check
	 * @returns {boolean}
	 */
	_notTextNode(element) {
		if (!element) return false;
		const checkRegExp = /^(br|input|select|canvas|img|iframe|audio|video)$/i;
		if (typeof element === 'string') return checkRegExp.test(element);
		return element.nodeType === 1 && (this.component.is(element) || checkRegExp.test(element.nodeName));
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Nodes that need to be added without modification when changing text nodes
	 * @param {Node} element Element to check
	 * @returns {boolean}
	 */
	_isIgnoreNodeChange(element) {
		return element && element.nodeType === 1 && (dom.check.isNonEditable(element) || !this.isTextStyleNode(element) || this.component.is(element));
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Get current selected lines and selected node info.
	 * @returns {{lines: Array<HTMLElement>, firstNode: Node,  lastNode: Node, firstPath: Array<number>, lastPath: Array<number>, startOffset: number, endOffset: number}}
	 */
	_lineWork() {
		let range = this.selection.getRange();
		let selectedFormsts = this.getLinesAndComponents(false);

		if (selectedFormsts.length === 0) {
			range = this.selection.getRangeAndAddLine(range, null);
			selectedFormsts = this.getLinesAndComponents(false);
			if (selectedFormsts.length === 0) return;
		}

		const startOffset = range.startOffset;
		const endOffset = range.endOffset;

		let first = /** @type {Node} */ (selectedFormsts[0]);
		let last = /** @type {Node} */ (selectedFormsts.at(-1));
		const firstPath = dom.query.getNodePath(range.startContainer, first, null);
		const lastPath = dom.query.getNodePath(range.endContainer, last, null);

		// remove selected list
		const rlist = this.removeList(selectedFormsts, false);
		if (rlist.sc) first = rlist.sc;
		if (rlist.ec) last = rlist.ec;

		// change format tag
		this.selection.setRange(dom.query.getNodeFromPath(firstPath, first), startOffset, dom.query.getNodeFromPath(lastPath, last), endOffset);

		return {
			lines: this.getLinesAndComponents(false),
			firstNode: first,
			lastNode: last,
			firstPath: firstPath,
			lastPath: lastPath,
			startOffset: startOffset,
			endOffset: endOffset
		};
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Attaches a nested list structure by merging adjacent lists if applicable.
	 * - Ensures that the nested list is placed correctly in the document structure.
	 * @param {Element} originList The original list element where the nested list is inserted.
	 * @param {Element} innerList The nested list element.
	 * @param {Element} prev The previous sibling element.
	 * @param {Element} next The next sibling element.
	 * @param {{s: Array<number> | null, e: Array<number> | null, sl: Node | null, el: Node | null}} nodePath Object storing the start and end node paths.
	 * - s : Start node path.
	 * - e : End node path.
	 * - sl : Start node's parent element.
	 * - el : End node's parent element.
	 * @returns {Node} The attached inner list.
	 */
	_attachNested(originList, innerList, prev, next, nodePath) {
		let insertPrev = false;

		if (innerList.tagName === prev?.tagName) {
			const children = innerList.children;
			while (children[0]) {
				prev.appendChild(children[0]);
			}

			innerList = prev;
			insertPrev = true;
		}

		if (innerList.tagName === next?.tagName) {
			const children = next.children;
			while (children[0]) {
				innerList.appendChild(children[0]);
			}

			const temp = next.nextElementSibling;
			next.parentNode.removeChild(next);
			next = temp;
		}

		if (!insertPrev) {
			if (dom.check.isListCell(prev)) {
				originList = prev;
				next = null;
			}

			originList.insertBefore(innerList, next);

			if (!nodePath.s) {
				nodePath.s = dom.query.getNodePath(innerList.firstElementChild.firstChild, originList, null);
				nodePath.sl = originList;
			}

			const slPath = originList.contains(nodePath.sl) ? dom.query.getNodePath(nodePath.sl, originList) : null;
			nodePath.e = dom.query.getNodePath(innerList.lastElementChild.firstChild, originList, null);
			nodePath.el = originList;

			this.nodeTransform.mergeSameTags(originList, [nodePath.s, nodePath.e, slPath], false);
			this.nodeTransform.mergeNestedTags(originList);
			if (slPath) nodePath.sl = dom.query.getNodeFromPath(slPath, originList);
		}

		return innerList;
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Detaches a nested list structure by extracting list items from their parent list.
	 * - Ensures proper restructuring of the list elements.
	 * @param {Array<HTMLElement>} cells The list items to be detached.
	 * @returns {{cc: Node, sc: Node, ec: Node}} An object containing reference nodes for repositioning.
	 * - cc : The parent node of the first list item.
	 * - sc : The first list item.
	 * - ec : The last list item.
	 */
	_detachNested(cells) {
		const first = cells[0];
		const last = cells.at(-1);
		const next = last.nextElementSibling;
		const originList = first.parentElement;
		const sibling = originList.parentElement.nextElementSibling;
		const parentNode = originList.parentElement.parentElement;

		for (let c = 0, cLen = cells.length; c < cLen; c++) {
			parentNode.insertBefore(cells[c], sibling);
		}

		if (next && originList.children.length > 0) {
			const newList = originList.cloneNode(false);
			const children = originList.childNodes;
			const index = dom.query.getPositionIndex(next);
			while (children[index]) {
				newList.appendChild(children[index]);
			}
			last.appendChild(newList);
		}

		if (originList.children.length === 0) dom.utils.removeItem(originList);
		this.nodeTransform.mergeSameTags(parentNode);

		const edge = dom.query.getEdgeChildNodes(first, last);

		return {
			cc: first.parentNode,
			sc: edge.sc,
			ec: edge.ec
		};
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Nest list cells or cancel nested cells.
	 * @param {Array<HTMLElement>} selectedCells List cells.
	 * @param {boolean} nested Nested or cancel nested.
	 */
	_applyNestedList(selectedCells, nested) {
		selectedCells = !selectedCells
			? this.getLines().filter(function (el) {
					return dom.check.isListCell(el);
			  })
			: selectedCells;
		const cellsLen = selectedCells.length;
		if (cellsLen === 0 || (!nested && !dom.check.isListCell(selectedCells[0].previousElementSibling) && !dom.check.isListCell(selectedCells.at(-1).nextElementSibling))) {
			return {
				sc: selectedCells[0],
				so: 0,
				ec: selectedCells.at(-1),
				eo: 1
			};
		}

		let originList = selectedCells[0].parentElement;
		let lastCell = selectedCells.at(-1);
		let range = null;

		if (nested) {
			if (originList !== lastCell.parentElement && dom.check.isList(lastCell.parentElement.parentElement) && lastCell.nextElementSibling) {
				lastCell = /** @type {HTMLElement} */ (lastCell.nextElementSibling);
				while (lastCell) {
					selectedCells.push(lastCell);
					lastCell = /** @type {HTMLElement} */ (lastCell.nextElementSibling);
				}
			}
			range = this.applyList(originList.nodeName + ':' + originList.style.listStyleType, selectedCells, true);
		} else {
			let innerList = dom.utils.createElement(originList.nodeName);
			let prev = selectedCells[0].previousElementSibling;
			let next = lastCell.nextElementSibling;
			const nodePath = {
				s: null,
				e: null,
				sl: originList,
				el: originList
			};

			const { startContainer, startOffset, endContainer, endOffset } = this.selection.getRange();
			for (let i = 0, len = cellsLen, c; i < len; i++) {
				c = selectedCells[i];
				if (c.parentElement !== originList) {
					this._attachNested(originList, innerList, prev, next, nodePath);
					originList = c.parentElement;
					innerList = dom.utils.createElement(originList.nodeName);
				}

				prev = c.previousElementSibling;
				next = c.nextElementSibling;
				innerList.appendChild(c);
			}

			this._attachNested(originList, innerList, prev, next, nodePath);

			if (cellsLen > 1) {
				const sc = dom.query.getNodeFromPath(nodePath.s, nodePath.sl);
				const ec = dom.query.getNodeFromPath(nodePath.e, nodePath.el);
				range = {
					sc: sc,
					so: 0,
					ec: ec,
					eo: ec.textContent.length
				};
			} else {
				range = {
					sc: startContainer,
					so: startOffset,
					ec: endContainer,
					eo: endOffset
				};
			}
		}

		return range;
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Detach Nested all nested lists under the "baseNode".
	 * - Returns a list with nested removed.
	 * @param {HTMLElement} baseNode Element on which to base.
	 * @param {boolean} all If true, it also detach all nested lists of a returned list.
	 * @returns {Node} Result element
	 */
	_removeNestedList(baseNode, all) {
		const rNode = DeleteNestedList(baseNode);
		let rangeElement, cNodes;

		if (rNode) {
			rangeElement = rNode.cloneNode(false);
			cNodes = rNode.childNodes;
			const index = dom.query.getPositionIndex(baseNode);
			while (cNodes[index]) {
				rangeElement.appendChild(cNodes[index]);
			}
		} else {
			rangeElement = baseNode;
		}

		let rChildren;
		if (!all) {
			const depth = dom.query.getNodeDepth(baseNode) + 2;
			rChildren = dom.query.getListChildren(
				baseNode,
				(current) => {
					return dom.check.isListCell(current) && !current.previousElementSibling && dom.query.getNodeDepth(current) === depth;
				},
				null
			);
		} else {
			rChildren = dom.query.getListChildren(
				rangeElement,
				(current) => {
					return dom.check.isListCell(current) && !current.previousElementSibling;
				},
				null
			);
		}

		for (let i = 0, len = rChildren.length; i < len; i++) {
			DeleteNestedList(rChildren[i]);
		}

		if (rNode) {
			rNode.parentNode.insertBefore(rangeElement, rNode.nextSibling);
			if (cNodes?.length === 0) dom.utils.removeItem(rNode);
		}

		return rangeElement === baseNode ? rangeElement.parentNode : rangeElement;
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description wraps text nodes of line selected text.
	 * @param {Node} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {number} startOff The startOffset property of the selection object.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {number} endOff The endOffset property of the selection object.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {boolean} collapsed range.collapsed
	 * @returns {{ancestor: *, startContainer: *, startOffset: *, endContainer: *, endOffset: *}}
	 */
	_setNode_oneLine(element, newInnerNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, isRemoveNode, collapsed, _removeCheck, _getMaintainedNode, _isMaintainedNode) {
		// not add tag
		let parentCon = startCon.parentNode;
		while (!parentCon.nextSibling && !parentCon.previousSibling && !this.isLine(parentCon.parentNode) && !dom.check.isWysiwygFrame(parentCon.parentNode)) {
			if (parentCon.nodeName === newInnerNode.nodeName) break;
			parentCon = parentCon.parentNode;
		}

		if (!isRemoveNode && parentCon === endCon.parentNode && parentCon.nodeName === newInnerNode.nodeName) {
			if (dom.check.isZeroWidth(startCon.textContent.slice(0, startOff)) && dom.check.isZeroWidth(endCon.textContent.slice(endOff))) {
				const children = parentCon.childNodes;
				let sameTag = false;

				for (let i = 0, len = children.length, c, s, e, z; i < len; i++) {
					c = children[i];
					z = !dom.check.isZeroWidth(c);
					if (c === startCon) {
						s = true;
						continue;
					}
					if (c === endCon) {
						e = true;
						continue;
					}
					if ((!s && z) || (s && e && z)) {
						sameTag = false;
						break;
					}
				}

				if (sameTag) {
					dom.utils.copyTagAttributes(parentCon, newInnerNode);

					return {
						ancestor: element,
						startContainer: startCon,
						startOffset: startOff,
						endContainer: endCon,
						endOffset: endOff
					};
				}
			}
		}

		// add tag
		_removeCheck.v = false;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const inst = this;
		const el = element;
		const nNodeArray = [newInnerNode];
		const pNode = element.cloneNode(false);
		const isSameNode = startCon === endCon;
		let startContainer = startCon;
		let startOffset = startOff;
		let endContainer = endCon;
		let endOffset = endOff;
		let startPass = false;
		let endPass = false;
		let pCurrent, newNode, appendNode, cssText, anchorNode;

		const wRegExp = RegExp;
		function checkCss(vNode) {
			const regExp = new wRegExp('(?:;|^|\\s)(?:' + cssText + 'null)\\s*:[^;]*\\s*(?:;|$)', 'ig');
			let style = false;

			if (regExp && vNode.style.cssText.length > 0) {
				style = regExp.test(vNode.style.cssText);
			}

			return !style;
		}

		(function recursionFunc(current, ancestor) {
			const childNodes = current.childNodes;

			for (let i = 0, len = childNodes.length, vNode; i < len; i++) {
				const child = childNodes[i];
				if (!child) continue;
				let coverNode = ancestor;
				let cloneNode;

				// startContainer
				if (!startPass && child === startContainer) {
					let line = pNode;
					anchorNode = _getMaintainedNode(child);

					let _prevText = '';
					let _nextText = '';
					if (startContainer.nodeType === 3) {
						const sText = /** @type {Text} */ (startContainer);
						_prevText = sText.substringData(0, startOffset);
						_nextText = sText.substringData(startOffset, isSameNode ? (endOffset >= startOffset ? endOffset - startOffset : sText.data.length - startOffset) : sText.data.length - startOffset);
					}

					const prevNode = dom.utils.createTextNode(_prevText);
					const textNode = dom.utils.createTextNode(_nextText);

					if (anchorNode) {
						const a = _getMaintainedNode(ancestor);
						if (a.parentNode !== line) {
							let m = a;
							let p = null;
							while (m.parentNode !== line) {
								ancestor = p = m.parentNode.cloneNode(false);
								while (m.childNodes[0]) {
									p.appendChild(m.childNodes[0]);
								}
								m.appendChild(p);
								m = m.parentNode;
							}
							m.parentNode.appendChild(a);
						}
						anchorNode = anchorNode.cloneNode(false);
					}

					if (!dom.check.isZeroWidth(prevNode)) {
						ancestor.appendChild(prevNode);
					}

					const prevAnchorNode = _getMaintainedNode(ancestor);
					if (prevAnchorNode) anchorNode = prevAnchorNode;
					if (anchorNode) line = anchorNode;

					newNode = /** @type {HTMLElement} */ (child);
					pCurrent = [];
					cssText = '';
					while (newNode !== line && newNode !== el && newNode !== null) {
						vNode = _isMaintainedNode(newNode) ? null : validation(newNode);
						if (vNode && newNode.nodeType === 1 && checkCss(newNode)) {
							pCurrent.push(vNode);
							cssText += newNode.style.cssText.substring(0, newNode.style.cssText.indexOf(':')) + '|';
						}
						newNode = newNode.parentElement;
					}

					const childNode = pCurrent.pop() || textNode;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					newInnerNode.appendChild(childNode);
					line.appendChild(newInnerNode);

					if (anchorNode && !_getMaintainedNode(endContainer)) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.appendChild(newInnerNode);
						nNodeArray.push(newInnerNode);
					}

					startContainer = textNode;
					startOffset = 0;
					startPass = true;

					if (newNode !== textNode) newNode.appendChild(startContainer);
					if (!isSameNode) continue;
				}

				// endContainer
				if (!endPass && child === endContainer) {
					anchorNode = _getMaintainedNode(child);

					let _prevText = '';
					let _nextText = '';
					if (endContainer.nodeType === 3) {
						const eText = /** @type {Text} */ (endContainer);
						_prevText = eText.substringData(endOffset, eText.length - endOffset);
						_nextText = isSameNode ? '' : eText.substringData(0, endOffset);
					}

					const afterNode = dom.utils.createTextNode(_prevText);
					const textNode = dom.utils.createTextNode(_nextText);

					if (anchorNode) {
						anchorNode = anchorNode.cloneNode(false);
					} else if (_isMaintainedNode(newInnerNode.parentNode) && !anchorNode) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.appendChild(newInnerNode);
						nNodeArray.push(newInnerNode);
					}

					if (!dom.check.isZeroWidth(afterNode)) {
						newNode = /** @type {HTMLElement} */ (child);
						cssText = '';
						pCurrent = [];
						const anchors = [];
						while (newNode !== pNode && newNode !== el && newNode !== null) {
							if (newNode.nodeType === 1 && checkCss(newNode)) {
								if (_isMaintainedNode(newNode)) anchors.push(newNode.cloneNode(false));
								else pCurrent.push(newNode.cloneNode(false));
								cssText += newNode.style.cssText.substring(0, newNode.style.cssText.indexOf(':')) + '|';
							}
							newNode = newNode.parentElement;
						}
						pCurrent = pCurrent.concat(anchors);

						cloneNode = appendNode = newNode = pCurrent.pop() || afterNode;
						while (pCurrent.length > 0) {
							newNode = pCurrent.pop();
							appendNode.appendChild(newNode);
							appendNode = newNode;
						}

						pNode.appendChild(cloneNode);
						newNode.textContent = afterNode.data;
					}

					if (anchorNode && cloneNode) {
						const afterAnchorNode = _getMaintainedNode(cloneNode);
						if (afterAnchorNode) {
							anchorNode = afterAnchorNode;
						}
					}

					newNode = /** @type {HTMLElement} */ (child);
					pCurrent = [];
					cssText = '';
					while (newNode !== pNode && newNode !== el && newNode !== null) {
						vNode = _isMaintainedNode(newNode) ? null : validation(newNode);
						if (vNode && newNode.nodeType === 1 && checkCss(newNode)) {
							pCurrent.push(vNode);
							cssText += newNode.style.cssText.substring(0, newNode.style.cssText.indexOf(':')) + '|';
						}
						newNode = newNode.parentElement;
					}

					const childNode = pCurrent.pop() || textNode;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (anchorNode) {
						newInnerNode = newInnerNode.cloneNode(false);
						newInnerNode.appendChild(childNode);
						anchorNode.insertBefore(newInnerNode, anchorNode.firstChild);
						pNode.appendChild(anchorNode);
						nNodeArray.push(newInnerNode);
						anchorNode = null;
					} else {
						newInnerNode.appendChild(childNode);
					}

					endContainer = textNode;
					endOffset = textNode.data.length;
					endPass = true;

					if (!isRemoveFormat && collapsed) {
						newInnerNode = textNode;
						textNode.textContent = unicode.zeroWidthSpace;
					}

					if (newNode !== textNode) newNode.appendChild(endContainer);
					continue;
				}

				// other
				if (startPass) {
					if (child.nodeType === 1 && !dom.check.isBreak(child)) {
						if (inst._isIgnoreNodeChange(child)) {
							pNode.appendChild(child.cloneNode(true));
							if (!collapsed) {
								newInnerNode = newInnerNode.cloneNode(false);
								pNode.appendChild(newInnerNode);
								nNodeArray.push(newInnerNode);
							}
						} else {
							recursionFunc(child, child);
						}
						continue;
					}

					newNode = /** @type {HTMLElement} */ (child);
					pCurrent = [];
					cssText = '';
					const anchors = [];
					while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
						vNode = endPass ? newNode.cloneNode(false) : validation(newNode);
						if (newNode.nodeType === 1 && !dom.check.isBreak(child) && vNode && checkCss(newNode)) {
							if (_isMaintainedNode(newNode)) {
								if (!anchorNode) anchors.push(vNode);
							} else {
								pCurrent.push(vNode);
							}
							cssText += newNode.style.cssText.substring(0, newNode.style.cssText.indexOf(':')) + '|';
						}
						newNode = newNode.parentElement;
					}
					pCurrent = pCurrent.concat(anchors);

					const childNode = pCurrent.pop() || child;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (_isMaintainedNode(newInnerNode.parentNode) && !_isMaintainedNode(childNode) && !dom.check.isZeroWidth(newInnerNode)) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.appendChild(newInnerNode);
						nNodeArray.push(newInnerNode);
					}

					if (!endPass && !anchorNode && _isMaintainedNode(childNode)) {
						newInnerNode = newInnerNode.cloneNode(false);
						const aChildren = childNode.childNodes;
						for (let a = 0, aLen = aChildren.length; a < aLen; a++) {
							newInnerNode.appendChild(aChildren[a]);
						}
						childNode.appendChild(newInnerNode);
						pNode.appendChild(childNode);
						nNodeArray.push(newInnerNode);
						if (/** @type {HTMLElement} */ (newInnerNode).children.length > 0) ancestor = newNode;
						else ancestor = newInnerNode;
					} else if (childNode === child) {
						if (!endPass) ancestor = newInnerNode;
						else ancestor = pNode;
					} else if (endPass) {
						pNode.appendChild(childNode);
						ancestor = newNode;
					} else {
						newInnerNode.appendChild(childNode);
						ancestor = newNode;
					}

					if (anchorNode && child.nodeType === 3) {
						if (_getMaintainedNode(child)) {
							const ancestorAnchorNode = dom.query.getParentElement(ancestor, (c) => {
								return inst._isNonSplitNode(c.parentNode) || c.parentNode === pNode;
							});
							anchorNode.appendChild(ancestorAnchorNode);
							newInnerNode = ancestorAnchorNode.cloneNode(false);
							nNodeArray.push(newInnerNode);
							pNode.appendChild(newInnerNode);
						} else {
							anchorNode = null;
						}
					}
				}

				cloneNode = child.cloneNode(false);
				ancestor.appendChild(cloneNode);
				if (child.nodeType === 1 && !dom.check.isBreak(child)) coverNode = cloneNode;

				recursionFunc(child, coverNode);
			}
		})(element, pNode);

		// not remove tag
		if (isRemoveNode && !isRemoveFormat && !_removeCheck.v) {
			return {
				ancestor: element,
				startContainer: startCon,
				startOffset: startOff,
				endContainer: endCon,
				endOffset: endOff
			};
		}

		isRemoveFormat &&= isRemoveNode;

		if (isRemoveFormat) {
			for (let i = 0; i < nNodeArray.length; i++) {
				const removeNode = nNodeArray[i];
				let textNode, textNode_s, textNode_e;

				if (collapsed) {
					textNode = dom.utils.createTextNode(unicode.zeroWidthSpace);
					pNode.replaceChild(textNode, removeNode);
				} else {
					const rChildren = removeNode.childNodes;
					textNode_s = rChildren[0];
					while (rChildren[0]) {
						textNode_e = rChildren[0];
						pNode.insertBefore(textNode_e, removeNode);
					}
					dom.utils.removeItem(removeNode);
				}

				if (i === 0) {
					if (collapsed) {
						startContainer = endContainer = textNode;
					} else {
						startContainer = textNode_s;
						endContainer = textNode_e;
					}
				}
			}
		} else {
			if (isRemoveNode) {
				for (let i = 0; i < nNodeArray.length; i++) {
					SN_StripRemoveNode(nNodeArray[i]);
				}
			}

			if (collapsed) {
				startContainer = endContainer = newInnerNode;
			}
		}

		this.nodeTransform.removeEmptyNode(pNode, newInnerNode, false);

		if (collapsed) {
			startOffset = startContainer.textContent.length;
			endOffset = endContainer.textContent.length;
		}

		// endContainer reset
		const endConReset = isRemoveFormat || endContainer.textContent.length === 0;

		if (!dom.check.isBreak(endContainer) && endContainer.textContent.length === 0) {
			dom.utils.removeItem(endContainer);
			endContainer = startContainer;
		}
		endOffset = endConReset ? endContainer.textContent.length : endOffset;

		// node change
		const newStartOffset = {
			s: 0,
			e: 0
		};
		const startPath = dom.query.getNodePath(startContainer, pNode, newStartOffset);

		const mergeEndCon = !endContainer.parentNode;
		if (mergeEndCon) endContainer = startContainer;
		const newEndOffset = {
			s: 0,
			e: 0
		};
		const endPath = dom.query.getNodePath(endContainer, pNode, !mergeEndCon && !endConReset ? newEndOffset : null);

		startOffset += newStartOffset.s;
		endOffset = collapsed ? startOffset : mergeEndCon ? startContainer.textContent.length : endConReset ? endOffset + newStartOffset.s : endOffset + newEndOffset.s;

		// tag merge
		const newOffsets = this.nodeTransform.mergeSameTags(pNode, [startPath, endPath], true);

		element.parentNode.replaceChild(pNode, element);

		startContainer = dom.query.getNodeFromPath(startPath, pNode);
		endContainer = dom.query.getNodeFromPath(endPath, pNode);

		return {
			ancestor: pNode,
			startContainer: startContainer,
			startOffset: startOffset + newOffsets[0],
			endContainer: endContainer,
			endOffset: endOffset + newOffsets[1]
		};
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description wraps first line selected text.
	 * @param {Node} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {number} startOff The startOffset property of the selection object.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @returns {NodeStyleContainerType} { ancestor, container, offset, endContainer }
	 */
	_setNode_startLine(element, newInnerNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode, _endContainer) {
		// not add tag
		let parentCon = startCon.parentNode;
		while (!parentCon.nextSibling && !parentCon.previousSibling && !this.isLine(parentCon.parentNode) && !dom.check.isWysiwygFrame(parentCon.parentNode)) {
			if (parentCon.nodeName === newInnerNode.nodeName) break;
			parentCon = parentCon.parentNode;
		}

		if (!isRemoveNode && parentCon.nodeName === newInnerNode.nodeName && !this.isLine(parentCon) && !parentCon.nextSibling && dom.check.isZeroWidth(startCon.textContent.slice(0, startOff))) {
			let sameTag = false;
			let s = startCon.previousSibling;
			while (s) {
				if (!dom.check.isZeroWidth(s)) {
					sameTag = false;
					break;
				}
				s = s.previousSibling;
			}

			if (sameTag) {
				dom.utils.copyTagAttributes(parentCon, newInnerNode);

				return {
					ancestor: element,
					container: startCon,
					offset: startOff
				};
			}
		}

		// add tag
		_removeCheck.v = false;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const inst = this;
		const el = element;
		const nNodeArray = [newInnerNode];
		const pNode = element.cloneNode(false);

		let container = startCon;
		let offset = startOff;
		let passNode = false;
		let pCurrent, newNode, appendNode, anchorNode;

		(function recursionFunc(current, ancestor) {
			const childNodes = current.childNodes;

			for (let i = 0, len = childNodes.length, vNode, cloneChild; i < len; i++) {
				const child = /** @type {HTMLElement} */ (childNodes[i]);
				if (!child) continue;
				let coverNode = ancestor;

				if (passNode && !dom.check.isBreak(child)) {
					if (child.nodeType === 1) {
						if (inst._isIgnoreNodeChange(child)) {
							newInnerNode = newInnerNode.cloneNode(false);
							cloneChild = child.cloneNode(true);
							pNode.appendChild(cloneChild);
							pNode.appendChild(newInnerNode);
							nNodeArray.push(newInnerNode);

							// end container
							if (_endContainer && child.contains(_endContainer)) {
								const endPath = dom.query.getNodePath(_endContainer, child);
								_endContainer = dom.query.getNodeFromPath(endPath, cloneChild);
							}
						} else {
							recursionFunc(child, child);
						}
						continue;
					}

					newNode = child;
					pCurrent = [];
					const anchors = [];
					while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
						vNode = validation(newNode);
						if (newNode.nodeType === 1 && vNode) {
							if (_isMaintainedNode(newNode)) {
								if (!anchorNode) anchors.push(vNode);
							} else {
								pCurrent.push(vNode);
							}
						}
						newNode = newNode.parentNode;
					}
					pCurrent = pCurrent.concat(anchors);

					const isTopNode = pCurrent.length > 0;
					const childNode = pCurrent.pop() || child;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (_isMaintainedNode(newInnerNode.parentNode) && !_isMaintainedNode(childNode)) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.appendChild(newInnerNode);
						nNodeArray.push(newInnerNode);
					}

					if (!anchorNode && _isMaintainedNode(childNode)) {
						newInnerNode = newInnerNode.cloneNode(false);
						const aChildren = childNode.childNodes;
						for (let a = 0, aLen = aChildren.length; a < aLen; a++) {
							newInnerNode.appendChild(aChildren[a]);
						}
						childNode.appendChild(newInnerNode);
						pNode.appendChild(childNode);
						ancestor = !_isMaintainedNode(newNode) ? newNode : newInnerNode;
						nNodeArray.push(newInnerNode);
					} else if (isTopNode) {
						newInnerNode.appendChild(childNode);
						ancestor = newNode;
					} else {
						ancestor = newInnerNode;
					}

					if (anchorNode && child.nodeType === 3) {
						if (_getMaintainedNode(child)) {
							const ancestorAnchorNode = dom.query.getParentElement(ancestor, (c) => {
								return inst._isNonSplitNode(c.parentNode) || c.parentNode === pNode;
							});
							anchorNode.appendChild(ancestorAnchorNode);
							newInnerNode = ancestorAnchorNode.cloneNode(false);
							nNodeArray.push(newInnerNode);
							pNode.appendChild(newInnerNode);
						} else {
							anchorNode = null;
						}
					}
				}

				// startContainer
				if (!passNode && child === container) {
					let line = pNode;
					anchorNode = _getMaintainedNode(child);

					let _prevText = '';
					let _nextText = '';
					if (container.nodeType === 3) {
						const cText = /** @type {Text} */ (container);
						_prevText = cText.substringData(0, offset);
						_nextText = cText.substringData(offset, cText.length - offset);
					}

					const prevNode = dom.utils.createTextNode(_prevText);
					const textNode = dom.utils.createTextNode(_nextText);

					if (anchorNode) {
						const a = _getMaintainedNode(ancestor);
						if (a && a.parentNode !== line) {
							let m = a;
							let p = null;
							while (m.parentNode !== line) {
								ancestor = p = m.parentNode.cloneNode(false);
								while (m.childNodes[0]) {
									p.appendChild(m.childNodes[0]);
								}
								m.appendChild(p);
								m = m.parentNode;
							}
							m.parentNode.appendChild(a);
						}
						anchorNode = anchorNode.cloneNode(false);
					}

					if (!dom.check.isZeroWidth(prevNode)) {
						ancestor.appendChild(prevNode);
					}

					const prevAnchorNode = _getMaintainedNode(ancestor);
					if (prevAnchorNode) anchorNode = prevAnchorNode;
					if (anchorNode) line = anchorNode;

					newNode = ancestor;
					pCurrent = [];
					while (newNode !== line && newNode !== null) {
						vNode = validation(newNode);
						if (newNode.nodeType === 1 && vNode) {
							pCurrent.push(vNode);
						}
						newNode = newNode.parentNode;
					}

					const childNode = pCurrent.pop() || ancestor;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (childNode !== ancestor) {
						newInnerNode.appendChild(childNode);
						ancestor = newNode;
					} else {
						ancestor = newInnerNode;
					}

					if (dom.check.isBreak(child)) newInnerNode.appendChild(child.cloneNode(false));
					line.appendChild(newInnerNode);

					container = textNode;
					offset = 0;
					passNode = true;

					ancestor.appendChild(container);
					continue;
				}

				vNode = !passNode ? child.cloneNode(false) : validation(child);
				if (vNode) {
					ancestor.appendChild(vNode);
					if (child.nodeType === 1 && !dom.check.isBreak(child)) coverNode = vNode;
				}

				recursionFunc(child, coverNode);
			}
		})(element, pNode);

		// not remove tag
		if (isRemoveNode && !isRemoveFormat && !_removeCheck.v) {
			return {
				ancestor: element,
				container: startCon,
				offset: startOff,
				endContainer: _endContainer
			};
		}

		isRemoveFormat &&= isRemoveNode;

		if (isRemoveFormat) {
			for (let i = 0; i < nNodeArray.length; i++) {
				const removeNode = nNodeArray[i];

				const rChildren = removeNode.childNodes;
				const textNode = rChildren[0];
				while (rChildren[0]) {
					pNode.insertBefore(rChildren[0], removeNode);
				}
				dom.utils.removeItem(removeNode);

				if (i === 0) container = textNode;
			}
		} else if (isRemoveNode) {
			newInnerNode = newInnerNode.firstChild;
			for (let i = 0; i < nNodeArray.length; i++) {
				SN_StripRemoveNode(nNodeArray[i]);
			}
		}

		if (!isRemoveFormat && pNode.childNodes.length === 0) {
			if (element.childNodes) {
				container = element.childNodes[0];
			} else {
				container = dom.utils.createTextNode(unicode.zeroWidthSpace);
				element.appendChild(container);
			}
		} else {
			this.nodeTransform.removeEmptyNode(pNode, newInnerNode, false);

			if (dom.check.isZeroWidth(pNode.textContent)) {
				container = pNode.firstChild;
				offset = 0;
			}

			// node change
			const offsets = {
				s: 0,
				e: 0
			};
			const path = dom.query.getNodePath(container, pNode, offsets);
			offset += offsets.s;

			// tag merge
			const newOffsets = this.nodeTransform.mergeSameTags(pNode, [path], true);

			element.parentNode.replaceChild(pNode, element);

			container = dom.query.getNodeFromPath(path, pNode);
			offset += newOffsets[0];
		}

		return {
			ancestor: pNode,
			container: container,
			offset: offset,
			endContainer: _endContainer
		};
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description wraps mid lines selected text.
	 * @param {HTMLElement} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {Node} _endContainer Offset node of last line already modified (end.container)
	 * @returns {NodeStyleContainerType} { ancestor, endContainer: "If end container is renewed, returned renewed node" }
	 */
	_setNode_middleLine(element, newInnerNode, validation, isRemoveFormat, isRemoveNode, _removeCheck, _endContainer) {
		// not add tag
		if (!isRemoveNode) {
			// end container path
			let endPath = null;
			if (_endContainer && element.contains(_endContainer)) endPath = dom.query.getNodePath(_endContainer, element);

			const tempNode = element.cloneNode(true);
			const newNodeName = /** @type {HTMLElement} */ (newInnerNode).nodeName;
			const newCssText = /** @type {HTMLElement} */ (newInnerNode).style.cssText;
			const newClass = /** @type {HTMLElement} */ (newInnerNode).className;

			let children = tempNode.childNodes;
			let i = 0,
				len = children.length;
			for (let child; i < len; i++) {
				child = /** @type {HTMLElement} */ (children[i]);
				if (child.nodeType === 3) break;
				if (child.nodeName === newNodeName) {
					child.style.cssText += newCssText;
					dom.utils.addClass(child, newClass);
				} else if (!dom.check.isBreak(child) && this._isIgnoreNodeChange(child)) {
					continue;
				} else if (len === 1) {
					children = child.childNodes;
					len = children.length;
					i = -1;
					continue;
				} else {
					break;
				}
			}

			if (len > 0 && i === len) {
				element.innerHTML = /** @type {HTMLElement} */ (tempNode).innerHTML;
				return {
					ancestor: element,
					endContainer: endPath ? dom.query.getNodeFromPath(endPath, element) : null
				};
			}
		}

		// add tag
		_removeCheck.v = false;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const inst = this;
		const pNode = element.cloneNode(false);
		const nNodeArray = [newInnerNode];
		let noneChange = true;

		(function recursionFunc(current, ancestor) {
			const childNodes = current.childNodes;

			for (let i = 0, len = childNodes.length, vNode, cloneChild; i < len; i++) {
				const child = /** @type {HTMLElement} */ (childNodes[i]);
				if (!child) continue;
				let coverNode = ancestor;

				if (!dom.check.isBreak(child) && inst._isIgnoreNodeChange(child)) {
					if (newInnerNode.childNodes.length > 0) {
						pNode.appendChild(newInnerNode);
						newInnerNode = newInnerNode.cloneNode(false);
					}

					cloneChild = child.cloneNode(true);
					pNode.appendChild(cloneChild);
					pNode.appendChild(newInnerNode);
					nNodeArray.push(newInnerNode);
					ancestor = newInnerNode;

					// end container
					if (_endContainer && child.contains(_endContainer)) {
						const endPath = dom.query.getNodePath(_endContainer, child);
						_endContainer = dom.query.getNodeFromPath(endPath, cloneChild);
					}

					continue;
				} else {
					vNode = validation(child);
					if (vNode) {
						noneChange = false;
						ancestor.appendChild(vNode);
						if (child.nodeType === 1) coverNode = vNode;
					}
				}

				if (!dom.check.isBreak(child)) recursionFunc(child, coverNode);
			}
		})(element, newInnerNode);

		// not remove tag
		if (noneChange || (isRemoveNode && !isRemoveFormat && !_removeCheck.v))
			return {
				ancestor: element,
				endContainer: _endContainer
			};

		pNode.appendChild(newInnerNode);

		if (isRemoveFormat && isRemoveNode) {
			for (let i = 0; i < nNodeArray.length; i++) {
				const removeNode = nNodeArray[i];

				const rChildren = removeNode.childNodes;
				while (rChildren[0]) {
					pNode.insertBefore(rChildren[0], removeNode);
				}
				dom.utils.removeItem(removeNode);
			}
		} else if (isRemoveNode) {
			newInnerNode = newInnerNode.firstChild;
			for (let i = 0; i < nNodeArray.length; i++) {
				SN_StripRemoveNode(nNodeArray[i]);
			}
		}

		this.nodeTransform.removeEmptyNode(pNode, newInnerNode, false);
		this.nodeTransform.mergeSameTags(pNode, null, true);

		// node change
		element.parentNode.replaceChild(pNode, element);
		return {
			ancestor: pNode,
			endContainer: _endContainer
		};
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description wraps last line selected text.
	 * @param {Node} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {number} endOff The endOffset property of the selection object.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @returns {NodeStyleContainerType} { ancestor, container, offset }
	 */
	_setNode_endLine(element, newInnerNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode) {
		// not add tag
		let parentCon = endCon.parentNode;
		while (!parentCon.nextSibling && !parentCon.previousSibling && !this.isLine(parentCon.parentNode) && !dom.check.isWysiwygFrame(parentCon.parentNode)) {
			if (parentCon.nodeName === newInnerNode.nodeName) break;
			parentCon = parentCon.parentNode;
		}

		if (!isRemoveNode && parentCon.nodeName === newInnerNode.nodeName && !this.isLine(parentCon) && !parentCon.previousSibling && dom.check.isZeroWidth(endCon.textContent.slice(endOff))) {
			let sameTag = false;
			let e = endCon.nextSibling;
			while (e) {
				if (!dom.check.isZeroWidth(e)) {
					sameTag = false;
					break;
				}
				e = e.nextSibling;
			}

			if (sameTag) {
				dom.utils.copyTagAttributes(parentCon, newInnerNode);

				return {
					ancestor: element,
					container: endCon,
					offset: endOff
				};
			}
		}

		// add tag
		_removeCheck.v = false;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const inst = this;
		const el = element;
		const nNodeArray = [newInnerNode];
		const pNode = element.cloneNode(false);

		let container = endCon;
		let offset = endOff;
		let passNode = false;
		let pCurrent, newNode, appendNode, anchorNode;

		(function recursionFunc(current, ancestor) {
			const childNodes = current.childNodes;

			for (let i = childNodes.length - 1, vNode; 0 <= i; i--) {
				const child = childNodes[i];
				if (!child) continue;
				let coverNode = ancestor;

				if (passNode && !dom.check.isBreak(child)) {
					if (child.nodeType === 1) {
						if (inst._isIgnoreNodeChange(child)) {
							newInnerNode = newInnerNode.cloneNode(false);
							const cloneChild = child.cloneNode(true);
							pNode.insertBefore(cloneChild, ancestor);
							pNode.insertBefore(newInnerNode, cloneChild);
							nNodeArray.push(newInnerNode);
						} else {
							recursionFunc(child, child);
						}
						continue;
					}

					newNode = child;
					pCurrent = [];
					const anchors = [];
					while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
						vNode = validation(newNode);
						if (vNode && newNode.nodeType === 1) {
							if (_isMaintainedNode(newNode)) {
								if (!anchorNode) anchors.push(vNode);
							} else {
								pCurrent.push(vNode);
							}
						}
						newNode = newNode.parentNode;
					}
					pCurrent = pCurrent.concat(anchors);

					const isTopNode = pCurrent.length > 0;
					const childNode = pCurrent.pop() || child;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (_isMaintainedNode(newInnerNode.parentNode) && !_isMaintainedNode(childNode)) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.insertBefore(newInnerNode, pNode.firstChild);
						nNodeArray.push(newInnerNode);
					}

					if (!anchorNode && _isMaintainedNode(childNode)) {
						newInnerNode = newInnerNode.cloneNode(false);
						const aChildren = childNode.childNodes;
						for (let a = 0, aLen = aChildren.length; a < aLen; a++) {
							newInnerNode.appendChild(aChildren[a]);
						}
						childNode.appendChild(newInnerNode);
						pNode.insertBefore(childNode, pNode.firstChild);
						nNodeArray.push(newInnerNode);
						if (/** @type {HTMLElement} */ (newInnerNode).children.length > 0) ancestor = newNode;
						else ancestor = newInnerNode;
					} else if (isTopNode) {
						newInnerNode.insertBefore(childNode, newInnerNode.firstChild);
						ancestor = newNode;
					} else {
						ancestor = newInnerNode;
					}

					if (anchorNode && child.nodeType === 3) {
						if (_getMaintainedNode(child)) {
							const ancestorAnchorNode = dom.query.getParentElement(ancestor, (c) => {
								return inst._isNonSplitNode(c.parentNode) || c.parentNode === pNode;
							});
							anchorNode.appendChild(ancestorAnchorNode);
							newInnerNode = ancestorAnchorNode.cloneNode(false);
							nNodeArray.push(newInnerNode);
							pNode.insertBefore(newInnerNode, pNode.firstChild);
						} else {
							anchorNode = null;
						}
					}
				}

				// endContainer
				if (!passNode && child === container) {
					anchorNode = _getMaintainedNode(child);

					let _prevText = '';
					let _nextText = '';
					if (container.nodeType === 3) {
						const cText = /** @type {Text} */ (container);
						_prevText = cText.substringData(offset, cText.length - offset);
						_nextText = cText.substringData(0, offset);
					}

					const afterNode = dom.utils.createTextNode(_prevText);
					const textNode = dom.utils.createTextNode(_nextText);

					if (anchorNode) {
						anchorNode = anchorNode.cloneNode(false);
						const a = _getMaintainedNode(ancestor);
						if (a.parentNode !== pNode) {
							let m = a;
							let p = null;
							while (m.parentNode !== pNode) {
								ancestor = p = m.parentNode.cloneNode(false);
								while (m.childNodes[0]) {
									p.appendChild(m.childNodes[0]);
								}
								m.appendChild(p);
								m = m.parentNode;
							}
							m.parentNode.insertBefore(a, m.parentNode.firstChild);
						}
						anchorNode = anchorNode.cloneNode(false);
					} else if (_isMaintainedNode(newInnerNode.parentNode) && !anchorNode) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.appendChild(newInnerNode);
						nNodeArray.push(newInnerNode);
					}

					if (!dom.check.isZeroWidth(afterNode)) {
						ancestor.insertBefore(afterNode, ancestor.firstChild);
					}

					newNode = ancestor;
					pCurrent = [];
					while (newNode !== pNode && newNode !== null) {
						vNode = _isMaintainedNode(newNode) ? null : validation(newNode);
						if (vNode && newNode.nodeType === 1) {
							pCurrent.push(vNode);
						}
						newNode = newNode.parentNode;
					}

					const childNode = pCurrent.pop() || ancestor;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (childNode !== ancestor) {
						newInnerNode.insertBefore(childNode, newInnerNode.firstChild);
						ancestor = newNode;
					} else {
						ancestor = newInnerNode;
					}

					if (dom.check.isBreak(child)) newInnerNode.appendChild(child.cloneNode(false));

					if (anchorNode) {
						anchorNode.insertBefore(newInnerNode, anchorNode.firstChild);
						pNode.insertBefore(anchorNode, pNode.firstChild);
						anchorNode = null;
					} else {
						pNode.insertBefore(newInnerNode, pNode.firstChild);
					}

					container = textNode;
					offset = textNode.data.length;
					passNode = true;

					ancestor.insertBefore(container, ancestor.firstChild);
					continue;
				}

				vNode = !passNode ? child.cloneNode(false) : validation(child);
				if (vNode) {
					ancestor.insertBefore(vNode, ancestor.firstChild);
					if (child.nodeType === 1 && !dom.check.isBreak(child)) coverNode = vNode;
				}

				recursionFunc(child, coverNode);
			}
		})(element, pNode);

		// not remove tag
		if (isRemoveNode && !isRemoveFormat && !_removeCheck.v) {
			return {
				ancestor: element,
				container: endCon,
				offset: endOff
			};
		}

		isRemoveFormat &&= isRemoveNode;

		if (isRemoveFormat) {
			for (let i = 0; i < nNodeArray.length; i++) {
				const removeNode = nNodeArray[i];

				const rChildren = removeNode.childNodes;
				let textNode = null;
				while (rChildren[0]) {
					textNode = rChildren[0];
					pNode.insertBefore(textNode, removeNode);
				}
				dom.utils.removeItem(removeNode);

				if (i === nNodeArray.length - 1) {
					container = textNode;
					offset = textNode.textContent.length;
				}
			}
		} else if (isRemoveNode) {
			newInnerNode = newInnerNode.firstChild;
			for (let i = 0; i < nNodeArray.length; i++) {
				SN_StripRemoveNode(nNodeArray[i]);
			}
		}

		if (!isRemoveFormat && pNode.childNodes.length === 0) {
			if (element.childNodes) {
				container = element.childNodes[0];
			} else {
				container = dom.utils.createTextNode(unicode.zeroWidthSpace);
				element.appendChild(container);
			}
		} else {
			if (!isRemoveNode && newInnerNode.textContent.length === 0) {
				this.nodeTransform.removeEmptyNode(pNode, null, false);
				return {
					ancestor: null,
					container: null,
					offset: 0
				};
			}

			this.nodeTransform.removeEmptyNode(pNode, newInnerNode, false);

			if (dom.check.isZeroWidth(pNode.textContent)) {
				container = pNode.firstChild;
				offset = container.textContent.length;
			} else if (dom.check.isZeroWidth(container)) {
				container = newInnerNode;
				offset = 1;
			}

			// node change
			const offsets = {
				s: 0,
				e: 0
			};
			const path = dom.query.getNodePath(container, pNode, offsets);
			offset += offsets.s;

			// tag merge
			const newOffsets = this.nodeTransform.mergeSameTags(pNode, [path], true);

			element.parentNode.replaceChild(pNode, element);

			container = dom.query.getNodeFromPath(path, pNode);
			offset += newOffsets[0];
		}

		return {
			ancestor: pNode,
			container: container,
			offset: container.nodeType === 1 && offset === 1 ? container.childNodes.length : offset
		};
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Node with font-size style
	 * @param {Node} element Element to check
	 * @returns {boolean}
	 */
	_sn_isSizeNode(element) {
		return element && typeof element !== 'string' && element.nodeType !== 3 && this.isTextStyleNode(element) && !!element.style.fontSize;
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Return the parent maintained tag. (bind and use a util object)
	 * @param {boolean} _isRemove is remove anchor
	 * @param {boolean} _isSizeNode is size span node
	 * @param {Node} element Element
	 * @returns {Node|null}
	 */
	_sn_getMaintainedNode(_isRemove, _isSizeNode, element) {
		if (!element || _isRemove) return null;
		return dom.query.getParentElement(element, this._isNonSplitNode.bind(this)) || (!_isSizeNode ? dom.query.getParentElement(element, this._sn_isSizeNode.bind(this)) : null);
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Check if element is a tag that should be persisted. (bind and use a util object)
	 * @param {boolean} _isRemove is remove anchor
	 * @param {boolean} _isSizeNode is size span node
	 * @param {Node} element Element
	 * @returns {boolean}
	 */
	_sn_isMaintainedNode(_isRemove, _isSizeNode, element) {
		if (!element || _isRemove || element.nodeType !== 1) return false;
		const anchor = this._isNonSplitNode(element);
		return dom.query.getParentElement(element, this._isNonSplitNode.bind(this)) ? anchor : anchor || (!_isSizeNode ? this._sn_isSizeNode(element) : false);
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description If certain styles are applied to all child nodes of the list cell, the style of the list cell is also changed. (bold, color, size)
	 * @param {Node} el List cell element. <li>
	 * @param {?Node} child Variable for recursive call. ("null" on the first call)
	 */
	_sn_setCommonListStyle(el, child) {
		if (!dom.check.isListCell(el)) return;

		const children = dom.utils.arrayFilter((child || el).childNodes, (current) => !dom.check.isBreak(current));
		child = children[0];

		if (!dom.check.isElement(child) || children.length > 1) return;

		// set cell style---
		const childStyle = child.style;
		const elStyle = el.style;
		const nodeName = child.nodeName.toLowerCase();
		let appliedEl = false;

		// bold, italic
		if (this.options.get('_defaultStyleTagMap')[nodeName] === this.options.get('_defaultTagCommand').bold.toLowerCase()) elStyle.fontWeight = 'bold';
		if (this.options.get('_defaultStyleTagMap')[nodeName] === this.options.get('_defaultTagCommand').italic.toLowerCase()) elStyle.fontStyle = 'italic';

		// styles
		const cKeys = converter.getValues(childStyle);
		if (cKeys.length > 0) {
			for (let i = 0, len = this._listCamel.length; i < len; i++) {
				if (cKeys.includes(this._listKebab[i])) {
					elStyle[this._listCamel[i]] = childStyle[this._listCamel[i]];
					childStyle.removeProperty(this._listKebab[i]);
					appliedEl = true;
				}
			}
		}

		this._sn_setCommonListStyle(el, child);
		if (!appliedEl) return;

		// common style
		if (!childStyle.length) {
			const ch = child.childNodes;
			const p = child.parentNode;
			const n = child.nextSibling;
			while (ch.length > 0) {
				p.insertBefore(ch[0], n);
			}
			dom.utils.removeItem(child);
		}
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Watch the applied text nodes and adjust the common styles of the list.
	 * @param {Node} el "LI" element
	 * @param {Array|null} styleArray Refer style array
	 */
	_sn_resetCommonListCell(el, styleArray) {
		if (!dom.check.isListCell(el)) return;
		styleArray ||= this._listKebab;

		const children = dom.utils.arrayFilter(el.childNodes, (current) => !dom.check.isBreak(current));
		const elStyles = el.style;

		const ec = [],
			ek = [],
			elKeys = converter.getValues(elStyles);
		for (let i = 0, len = this._listKebab.length; i < len; i++) {
			if (elKeys.includes(this._listKebab[i]) && styleArray.includes(this._listKebab[i])) {
				ec.push(this._listCamel[i]);
				ek.push(this._listKebab[i]);
			}
		}

		if (!ec.length) return;

		// reset cell style---
		const refer = dom.utils.createElement('SPAN');
		for (let i = 0, len = ec.length; i < len; i++) {
			refer.style[ec[i]] = elStyles[ek[i]];
			elStyles.removeProperty(ek[i]);
		}

		let sel = refer.cloneNode(false);
		let r = null,
			appliedEl = false;
		for (let i = 0, len = children.length, c, s; i < len; i++) {
			c = /** @type {HTMLElement} */ (children[i]);
			if (this.options.get('_defaultStyleTagMap')[c.nodeName.toLowerCase()]) continue;

			s = converter.getValues(c.style);
			if (
				s.length === 0 ||
				(ec.some(function (k) {
					return !s.includes(k);
				}) &&
					s.some(function (k) {
						ec.includes(k);
					}))
			) {
				r = c.nextSibling;
				sel.appendChild(c);
			} else if (sel.childNodes.length > 0) {
				el.insertBefore(sel, r);
				sel = refer.cloneNode(false);
				r = null;
				appliedEl = true;
			}
		}

		if (sel.childNodes.length > 0) {
			el.insertBefore(sel, r);
			appliedEl = true;
		}
		if (!elStyles.length) {
			el.removeAttribute('style');
		}

		return appliedEl;
	},

	/**
	 * @private
	 * @this {FormatThis}
	 * @description Reset the line break format.
	 * @param {"line"|"br"} breakFormat options.get('defaultLineBreakFormat')
	 */
	__resetBrLineBreak(breakFormat) {
		this._brLineBreak = breakFormat === 'br';
	},

	constructor: Format
};

/**
 * @private
 * @param {Node} baseNode Node
 */
function DeleteNestedList(baseNode) {
	const baseParent = baseNode.parentNode;
	let parent = baseParent.parentNode;
	let siblingNode = /** @type {*} */ (baseParent);
	let liSibling, liParent, child, index, c;

	while (dom.check.isListCell(parent)) {
		index = dom.query.getPositionIndex(baseNode);
		liSibling = parent.nextElementSibling;
		liParent = parent.parentNode;
		child = siblingNode;

		while (child) {
			siblingNode = siblingNode.nextSibling;
			if (dom.check.isList(child)) {
				c = child.childNodes;
				while (c[index]) {
					liParent.insertBefore(c[index], liSibling);
				}
				if (c.length === 0) dom.utils.removeItem(child);
			} else {
				liParent.appendChild(child);
			}
			child = siblingNode;
		}

		parent = liParent.parentNode;
	}

	if (baseParent.children.length === 0) dom.utils.removeItem(baseParent);

	return liParent;
}

/**
 * @private
 * @param {Array<HTMLElement>} lines - Line elements
 * @param {number} size - Margin size
 * @param {string} dir - Direction
 * @returns
 */
function SetLineMargin(lines, size, dir) {
	const cells = [];

	for (let i = 0, len = lines.length, f, margin; i < len; i++) {
		f = lines[i];
		if (!dom.check.isListCell(f)) {
			margin = /\d+/.test(f.style[dir]) ? numbers.get(f.style[dir], 0) : 0;
			margin += size;
			dom.utils.setStyle(f, dir, margin <= 0 ? '' : margin + 'px');
		} else {
			if (size < 0 || f.previousElementSibling) {
				cells.push(f);
			}
		}
	}

	return cells;
}

/**
 * @private
 * @description Strip remove node
 * @param {Node} removeNode The remove node
 * @private
 */
function SN_StripRemoveNode(removeNode) {
	const element = removeNode.parentNode;
	if (!removeNode || removeNode.nodeType === 3 || !element) return;

	const children = removeNode.childNodes;
	while (children[0]) {
		element.insertBefore(children[0], removeNode);
	}

	element.removeChild(removeNode);
}

export default Format;
