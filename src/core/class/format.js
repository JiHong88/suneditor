/**
 * @fileoverview Format class
 */

import CoreInjector from '../../editorInjector/_core';
import { dom, unicode, numbers } from '../../helper';

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
		this.editor.effectNode = null;

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
			const childEdge = dom.query.getEdgeChildNodes(firstNode, lastNode?.parentNode ? firstNode : lastNode);
			if (!childEdge) {
				this.editor.focus();
			} else {
				edge = {
					cc: (childEdge.sc || childEdge.ec).parentNode,
					sc: childEdge.sc,
					so: so,
					ec: childEdge.ec,
					eo: eo,
					removeArray: null
				};
			}
		}

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
				if (fTag.childNodes.length === 0 && !this.inline._isIgnoreNodeChange(fTag)) {
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

export default Format;
