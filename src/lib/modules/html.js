/**
 * @fileoverview Char class
 * @author Yi JiHong.
 */

import env from '../../helper/env';
import { _w } from '../../helper/global';
import { addClass, removeClass, hasClass } from '../../helper/domUtils';
import CoreInterface from '../../class/_core';

const HTML = function (editor) {
	CoreInterface.call(this, editor);
};

HTML.prototype = {
    /**
	 * @description Delete selected node and insert argument value node and return.
	 * If the "afterNode" exists, it is inserted after the "afterNode"
	 * Inserting a text node merges with both text nodes on both sides and returns a new "{ container, startOffset, endOffset }".
	 * @param {Node} oNode Node to be inserted
	 * @param {Node|null} afterNode If the node exists, it is inserted after the node
	 * @param {boolean} checkCharCount If true, if "options.charCounter_max" is exceeded when "element" is added, null is returned without addition.
	 * @returns {Object|Node|null}
	 */
	insertNode: function (oNode, afterNode, checkCharCount) {
		if (this.core.isReadOnly || (checkCharCount && !this.char.check(oNode))) {
			return null;
		}

		const brBlock = this.format.getBrBlock(this.selection.getNode(), null);
		const isFormats = (!brBlock && (this.format.isLine(oNode) || this.format.isBlock(oNode))) || this.component.is(oNode);

		if (!afterNode && (isFormats || this.component.is(oNode) || domUtils.isMedia(oNode))) {
			const r = this.remove();
			if (r.container.nodeType === 3 || domUtils.isBreak(r.container)) {
				const depthFormat = domUtils.getParentElement(
					r.container,
					function (current) {
						return this.format.isBlock(current) || domUtils.isListCell(current);
					}.bind(this)
				);
				afterNode = this.node.split(r.container, r.offset, !depthFormat ? 0 : domUtils.getNodeDepth(depthFormat) + 1);
				if (afterNode) afterNode = afterNode.previousSibling;
			}
		}

		const range = !afterNode && !isFormats ? this.selection.getRangeAndAddLine(this.selection.getRange(), null) : this.selection.getRange();
		const commonCon = range.commonAncestorContainer;
		const startOff = range.startOffset;
		const endOff = range.endOffset;
		const formatRange = range.startContainer === commonCon && this.format.isLine(commonCon);
		const startCon = formatRange ? commonCon.childNodes[startOff] || commonCon.childNodes[0] || range.startContainer : range.startContainer;
		const endCon = formatRange ? commonCon.childNodes[endOff] || commonCon.childNodes[commonCon.childNodes.length - 1] || range.endContainer : range.endContainer;
		let parentNode,
			originAfter = null;

		if (!afterNode) {
			parentNode = startCon;
			if (startCon.nodeType === 3) {
				parentNode = startCon.parentNode;
			}

			/** No Select range node */
			if (range.collapsed) {
				if (commonCon.nodeType === 3) {
					if (commonCon.textContent.length > endOff) afterNode = commonCon.splitText(endOff);
					else afterNode = commonCon.nextSibling;
				} else {
					if (!domUtils.isBreak(parentNode)) {
						let c = parentNode.childNodes[startOff];
						const focusNode = c && c.nodeType === 3 && unicode.onlyZeroWidthSpace(c) && domUtils.isBreak(c.nextSibling) ? c.nextSibling : c;
						if (focusNode) {
							if (!focusNode.nextSibling) {
								parentNode.removeChild(focusNode);
								afterNode = null;
							} else {
								afterNode = domUtils.isBreak(focusNode) && !domUtils.isBreak(oNode) ? focusNode : focusNode.nextSibling;
							}
						} else {
							afterNode = null;
						}
					} else {
						afterNode = parentNode;
						parentNode = parentNode.parentNode;
					}
				}
			} else {
				/** Select range nodes */
				const isSameContainer = startCon === endCon;

				if (isSameContainer) {
					if (domUtils.isEdgePoint(endCon, endOff)) afterNode = endCon.nextSibling;
					else afterNode = endCon.splitText(endOff);

					let removeNode = startCon;
					if (!domUtils.isEdgePoint(startCon, startOff)) removeNode = startCon.splitText(startOff);

					parentNode.removeChild(removeNode);
					if (parentNode.childNodes.length === 0 && isFormats) {
						parentNode.innerHTML = '<br>';
					}
				} else {
					const removedTag = this.remove();
					const container = removedTag.container;
					const prevContainer = removedTag.prevContainer;
					if (container && container.childNodes.length === 0 && isFormats) {
						if (this.format.isLine(container)) {
							container.innerHTML = '<br>';
						} else if (this.format.isBlock(container)) {
							container.innerHTML = '<' + this.options.defaultLineTag + '><br></' + this.options.defaultLineTag + '>';
						}
					}

					if (!isFormats && prevContainer) {
						parentNode = prevContainer.nodeType === 3 ? prevContainer.parentNode : prevContainer;
						if (parentNode.contains(container)) {
							let sameParent = true;
							afterNode = container;
							while (afterNode.parentNode !== parentNode) {
								afterNode = afterNode.parentNode;
								sameParent = false;
							}
							if (sameParent && container === prevContainer) afterNode = afterNode.nextSibling;
						} else {
							afterNode = null;
						}
					} else {
						afterNode = isFormats ? endCon : container === prevContainer ? container.nextSibling : container;
						parentNode = !afterNode || !afterNode.parentNode ? commonCon : afterNode.parentNode;
					}

					while (afterNode && !this.format.isLine(afterNode) && afterNode.parentNode !== commonCon) {
						afterNode = afterNode.parentNode;
					}
				}
			}
		}
		// has afterNode
		else {
			parentNode = afterNode.parentNode;
			afterNode = afterNode.nextSibling;
			originAfter = true;
		}

		// --- insert node ---
		try {
			if (domUtils.isWysiwygFrame(afterNode) || parentNode === this.context.element.wysiwyg.parentNode) {
				parentNode = this.context.element.wysiwyg;
				afterNode = null;
			}

			if (this.format.isLine(oNode) || this.format.isBlock(oNode) || (!domUtils.isListCell(parentNode) && this.component.is(oNode))) {
				const oldParent = parentNode;
				if (domUtils.isList(afterNode)) {
					parentNode = afterNode;
					afterNode = null;
				} else if (domUtils.isListCell(afterNode)) {
					parentNode = afterNode.previousElementSibling || afterNode;
				} else if (!originAfter && !afterNode) {
					const r = this.remove();
					const container = r.container.nodeType === 3 ? (domUtils.isListCell(this.format.getLine(r.container, null)) ? r.container : this.format.getLine(r.container, null) || r.container.parentNode) : r.container;
					const rangeCon = domUtils.isWysiwygFrame(container) || this.format.isBlock(container);
					parentNode = rangeCon ? container : container.parentNode;
					afterNode = rangeCon ? null : container.nextSibling;
				}

				if (oldParent.childNodes.length === 0 && parentNode !== oldParent) domUtils.remove(oldParent);
			}

			if (isFormats && !brBlock && !this.format.isBlock(parentNode) && !domUtils.isListCell(parentNode) && !domUtils.isWysiwygFrame(parentNode)) {
				afterNode = parentNode.nextElementSibling;
				parentNode = parentNode.parentNode;
			}

			if (domUtils.isWysiwygFrame(parentNode) && (oNode.nodeType === 3 || domUtils.isBreak(oNode))) {
				oNode = domUtils.createElement(this.options.defaultLineTag, null, oNode);
			}

			parentNode.insertBefore(oNode, parentNode === afterNode ? parentNode.lastChild : afterNode);
		} catch (e) {
			parentNode.appendChild(oNode);
		} finally {
			if ((this.format.isLine(oNode) || this.component.is(oNode)) && startCon === endCon) {
				const cItem = this.format.getLine(commonCon, null);
				if (cItem && cItem.nodeType === 1 && domUtils.isEmptyLine(cItem)) {
					domUtils.remove(cItem);
				}
			}

			if (brBlock && (this.format.isLine(oNode) || this.format.isBlock(oNode))) {
				oNode = this._setIntoFreeFormat(oNode);
			}

			if (!this.component.is(oNode)) {
				let offset = 1;
				if (oNode.nodeType === 3) {
					const previous = oNode.previousSibling;
					const next = oNode.nextSibling;
					const previousText = !previous || previous.nodeType === 1 || unicode.onlyZeroWidthSpace(previous) ? '' : previous.textContent;
					const nextText = !next || next.nodeType === 1 || unicode.onlyZeroWidthSpace(next) ? '' : next.textContent;

					if (previous && previousText.length > 0) {
						oNode.textContent = previousText + oNode.textContent;
						domUtils.remove(previous);
					}

					if (next && next.length > 0) {
						oNode.textContent += nextText;
						domUtils.remove(next);
					}

					const newRange = {
						container: oNode,
						startOffset: previousText.length,
						endOffset: oNode.textContent.length - nextText.length
					};

					this.selection.setRange(oNode, newRange.startOffset, oNode, newRange.endOffset);

					return newRange;
				} else if (!domUtils.isBreak(oNode) && !domUtils.isListCell(oNode) && this.format.isLine(parentNode)) {
					let zeroWidth = null;
					if (!oNode.previousSibling || domUtils.isBreak(oNode.previousSibling)) {
						zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
						oNode.parentNode.insertBefore(zeroWidth, oNode);
					}

					if (!oNode.nextSibling || domUtils.isBreak(oNode.nextSibling)) {
						zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
						oNode.parentNode.insertBefore(zeroWidth, oNode.nextSibling);
					}

					if (this.format._isIgnoreNodeChange(oNode)) {
						oNode = oNode.nextSibling;
						offset = 0;
					}
				}

				this.selection.setRange(oNode, offset, oNode, offset);
			}

			// history stack
			this.history.push(true);

			return oNode;
		}
	},

	/**
	 * @description Insert an (HTML element / HTML string / plain string) at selection range.
	 * @param {Element|String} html HTML Element or HTML string or plain string
	 * @param {boolean} notCleaningData If true, inserts the HTML string without refining it with core.cleanHTML.
	 * @param {boolean} checkCharCount If true, if "options.charCounter_max" is exceeded when "element" is added, null is returned without addition.
	 * @param {boolean} rangeSelection If true, range select the inserted node.
	 */
	insert: function (html, notCleaningData, checkCharCount, rangeSelection) {
		if (!this.context.element.wysiwygFrame.contains(this.selection.get().focusNode)) this.core.focus();

		if (typeof html === 'string') {
			if (!notCleaningData) html = this.core.cleanHTML(html, null, null);
			try {
				const dom = this._d.createRange().createContextualFragment(html);
				const domTree = dom.childNodes;

				if (checkCharCount) {
					const type = this.options.charCounter_type === 'byte-html' ? 'outerHTML' : 'textContent';
					let checkHTML = '';
					for (let i = 0, len = domTree.length; i < len; i++) {
						checkHTML += domTree[i][type];
					}
					if (!this.char.check(checkHTML)) return;
				}

				let c, a, t, prev, firstCon;
				while ((c = domTree[0])) {
					if (prev && prev.nodeType === 3 && a && a.nodeType === 1 && domUtils.isBreak(c)) {
						prev = c;
						domUtils.remove(c);
						continue;
					}
					t = this.insertNode(c, a, false);
					a = t.container || t;
					if (!firstCon) firstCon = t;
					prev = c;
				}

				if (prev.nodeType === 3 && a.nodeType === 1) a = prev;
				const offset = a.nodeType === 3 ? t.endOffset || a.textContent.length : a.childNodes.length;
				if (rangeSelection) this.selection.setRange(firstCon.container || firstCon, firstCon.startOffset || 0, a, offset);
				else this.selection.setRange(a, offset, a, offset);
			} catch (error) {
				if (this.status.isDisabled || this.status.isReadOnly) return;
				console.warn('[SUNEDITOR.html.insert.fail] ' + error);
				this.core.execCommand('insertHTML', false, html);
			}
		} else {
			if (this.component.is(html)) {
				this.component.insert(html, false, checkCharCount, false);
			} else {
				let afterNode = null;
				if (this.format.isLine(html) || domUtils.isMedia(html)) {
					afterNode = this.format.getLine(this.selection.getNode(), null);
				}
				this.insertNode(html, afterNode, checkCharCount);
			}
		}

		this.core.effectNode = null;
		this.core.focus();

		// history stack
		this.history.push(false);
	},

	/**
	 * @description Delete the selected range.
	 * Returns {container: "the last element after deletion", offset: "offset", prevContainer: "previousElementSibling Of the deleted area"}
	 * @returns {Object}
	 */
	remove: function () {
		this._resetRangeToTextNode();

		const range = this.selection.getRange();
		let container,
			offset = 0;
		let startCon = range.startContainer;
		let endCon = range.endContainer;
		let startOff = range.startOffset;
		let endOff = range.endOffset;
		const commonCon = range.commonAncestorContainer.nodeType === 3 && range.commonAncestorContainer.parentNode === startCon.parentNode ? startCon.parentNode : range.commonAncestorContainer;
		if (commonCon === startCon && commonCon === endCon) {
			startCon = commonCon.children[startOff];
			endCon = commonCon.children[endOff];
			startOff = endOff = 0;
		}

		let beforeNode = null;
		let afterNode = null;

		const childNodes = domUtils.getListChildNodes(commonCon, null);
		let startIndex = domUtils.getArrayIndex(childNodes, startCon);
		let endIndex = domUtils.getArrayIndex(childNodes, endCon);

		if (childNodes.length > 0 && startIndex > -1 && endIndex > -1) {
			for (let i = startIndex + 1, startNode = startCon; i >= 0; i--) {
				if (childNodes[i] === startNode.parentNode && childNodes[i].firstChild === startNode && startOff === 0) {
					startIndex = i;
					startNode = startNode.parentNode;
				}
			}

			for (let i = endIndex - 1, endNode = endCon; i > startIndex; i--) {
				if (childNodes[i] === endNode.parentNode && childNodes[i].nodeType === 1) {
					childNodes.splice(i, 1);
					endNode = endNode.parentNode;
					--endIndex;
				}
			}
		} else {
			if (childNodes.length === 0) {
				if (this.format.isLine(commonCon) || this.format.isBlock(commonCon) || domUtils.isWysiwygFrame(commonCon) || domUtils.isBreak(commonCon) || domUtils.isMedia(commonCon)) {
					return {
						container: commonCon,
						offset: 0
					};
				} else if (commonCon.nodeType === 3) {
					return {
						container: commonCon,
						offset: endOff
					};
				}
				childNodes.push(commonCon);
				startCon = endCon = commonCon;
			} else {
				startCon = endCon = childNodes[0];
				if (domUtils.isBreak(startCon) || unicode.onlyZeroWidthSpace(startCon)) {
					return {
						container: domUtils.isMedia(commonCon) ? commonCon : startCon,
						offset: 0
					};
				}
			}

			startIndex = endIndex = 0;
		}

		const remove = function (item) {
			const format = this.format.getLine(item, null);
			domUtils.remove(item);

			if (domUtils.isListCell(format)) {
				const list = domUtils.getArrayItem(format.children, domUtils.isList, false);
				if (list) {
					const child = list.firstElementChild;
					const children = child.childNodes;
					while (children[0]) {
						format.insertBefore(children[0], list);
					}
					this.node.removeAllParents(child, null, null);
				}
			}
		}.bind(this);

		for (let i = startIndex; i <= endIndex; i++) {
			const item = childNodes[i];

			if (item.length === 0 || (item.nodeType === 3 && item.data === undefined)) {
				remove(item);
				continue;
			}

			if (item === startCon) {
				if (startCon.nodeType === 1) {
					if (this.component.is(startCon)) continue;
					else beforeNode = domUtils.createTextNode(startCon.textContent);
				} else {
					if (item === endCon) {
						beforeNode = domUtils.createTextNode(startCon.substringData(0, startOff) + endCon.substringData(endOff, endCon.length - endOff));
						offset = startOff;
					} else {
						beforeNode = domUtils.createTextNode(startCon.substringData(0, startOff));
					}
				}

				if (beforeNode.length > 0) {
					startCon.data = beforeNode.data;
				} else {
					remove(startCon);
				}

				if (item === endCon) break;
				continue;
			}

			if (item === endCon) {
				if (endCon.nodeType === 1) {
					if (this.component.is(endCon)) continue;
					else afterNode = domUtils.createTextNode(endCon.textContent);
				} else {
					afterNode = domUtils.createTextNode(endCon.substringData(endOff, endCon.length - endOff));
				}

				if (afterNode.length > 0) {
					endCon.data = afterNode.data;
				} else {
					remove(endCon);
				}

				continue;
			}

			remove(item);
		}

		container = endCon && endCon.parentNode ? endCon : startCon && startCon.parentNode ? startCon : range.endContainer || range.startContainer;

		if (!domUtils.isWysiwygFrame(container) && container.childNodes.length === 0) {
			const rc = this.node.removeAllParents(
				container,
				function (current) {
					if (this.component.is(current)) return false;
					const text = current.textContent;
					return text.length === 0 || /^(\n|\u200B)+$/.test(text);
				}.bind(this),
				null
			);

			if (rc) container = rc.sc || rc.ec || this.context.element.wysiwyg;
		}

		// set range
		this.setRange(container, offset, container, offset);
		// history stack
		this.history.push(true);

		return {
			container: container,
			offset: offset,
			prevContainer: startCon && startCon.parentNode ? startCon : null
		};
	},

	/**
	 * @description Recursive function  when used to place a node in "BrBlock" in "html.insertNode"
	 * @param {Node} oNode Node to be inserted
	 * @returns {Node} "oNode"
	 * @private
	 */
	 _setIntoFreeFormat: function (oNode) {
		const parentNode = oNode.parentNode;
		let oNodeChildren, lastONode;

		while (this.format.isLine(oNode) || this.format.isBlock(oNode)) {
			oNodeChildren = oNode.childNodes;
			lastONode = null;

			while (oNodeChildren[0]) {
				lastONode = oNodeChildren[0];
				if (this.format.isLine(lastONode) || this.format.isBlock(lastONode)) {
					this._setIntoFreeFormat(lastONode);
					if (!oNode.parentNode) break;
					oNodeChildren = oNode.childNodes;
					continue;
				}

				parentNode.insertBefore(lastONode, oNode);
			}

			if (oNode.childNodes.length === 0) domUtils.remove(oNode);
			oNode = domUtils.createElement('BR');
			parentNode.insertBefore(oNode, lastONode.nextSibling);
		}

		return oNode;
	},

	constructor: HTML
};

export default HTML;
