/**
 * @fileoverview Selection class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";
import {
	domUtils,
	unicode
} from "../../helpers";

const Selection = function (editor) {
	CoreInterface.call(this, editor);
	this.range = null;
	this.selectionNode = null;
};

Selection.prototype = {
	/**
	 * @description Set "range" and "selection" info.
	 * @param {Object} range range object.
	 * @param {Object} selection selection object.
	 */
	_rangeInfo: function (range, selection) {
		let selectionNode = null;
		this.status._range = range;

		if (range.collapsed) {
			if (domUtils.isWysiwygFrame(range.commonAncestorContainer)) selectionNode = range.commonAncestorContainer.children[range.startOffset] || range.commonAncestorContainer;
			else selectionNode = range.commonAncestorContainer;
		} else {
			selectionNode = selection.extentNode || selection.anchorNode;
		}

		this.status._selectionNode = selectionNode;
	},

	/**
	 * @description Return the range object of editor's first child node
	 * @returns {Object}
	 * @private
	 */
	_createDefaultRange: function () {
		const wysiwyg = this.context.element.wysiwyg;
		wysiwyg.focus();
		const range = this._wd.createRange();

		let focusEl = wysiwyg.firstElementChild;
		if (!focusEl) {
			focusEl = domUtils.createElement(this.options.defaultTag, null, "<br>");
			wysiwyg.appendChild(focusEl);
		}

		range.setStart(focusEl, 0);
		range.setEnd(focusEl, 0);

		return range;
	},

	/**
	 * @description Saving the range object and the currently selected node of editor
	 * @private
	 */
	_init: function () {
		const selection = this.get();
		if (!selection) return null;
		let range = null;

		if (selection.rangeCount > 0) {
			range = selection.getRangeAt(0);
		} else {
			range = this._createDefaultRange();
		}

		if (domUtils.isFormatElement(range.endContainer) && range.endOffset === 0) {
			range = this.setRange(range.startContainer, range.startOffset, range.startContainer, range.startContainer.length);
		}

		this._rangeInfo(range, selection);
	},

	/**
	 * @description Focus method
	 * @private
	 */
	__focus: function () {
		const caption = domUtils.getParentElement(this.getNode(), 'figcaption');
		if (caption) {
			caption.focus();
		} else {
			this.context.element.wysiwyg.focus();
		}
	},

	/**
	 * @description Get current editor's range object
	 * @returns {Object}
	 */
	getRange: function () {
		const range = this.status._range || this._createDefaultRange();
		const selection = this.get();
		if (range.collapsed === selection.isCollapsed || !this.context.element.wysiwyg.contains(selection.focusNode))
			return range;

		if (selection.rangeCount > 0) {
			this.status._range = selection.getRangeAt(0);
			return this.status._range;
		} else {
			const sc = selection.anchorNode,
				ec = selection.focusNode,
				so = selection.anchorOffset,
				eo = selection.focusOffset;
			const compareValue = domUtils.compareElements(sc, ec);
			const rightDir =
				compareValue.ancestor &&
				(compareValue.result === 0 ? so <= eo : compareValue.result > 1 ? true : false);
			return this.setRange(rightDir ? sc : ec, rightDir ? so : eo, rightDir ? ec : sc, rightDir ? eo : so);
		}
	},

	/**
	 * @description Set current editor's range object and return.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {number} startOff The startOffset property of the selection object.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {number} endOff The endOffset property of the selection object.
	 * @returns {Object} Range object.
	 */
	setRange: function (startCon, startOff, endCon, endOff) {
		if (!startCon || !endCon) return;
		if (startOff > startCon.textContent.length) startOff = startCon.textContent.length;
		if (endOff > endCon.textContent.length) endOff = endCon.textContent.length;
		if (this.format.isLine(startCon)) {
			startCon = startCon.childNodes[startOff] || startCon;
			startOff = 0;
		}
		if (this.format.isLine(endCon)) {
			endCon = endCon.childNodes[endOff] || endCon;
			endOff = startOff > 1 ? startOff : 0;
		}

		const range = this._wd.createRange();

		try {
			range.setStart(startCon, startOff);
			range.setEnd(endCon, endOff);
		} catch (error) {
			console.warn("[SUNEDITOR.core.focus.error] " + error);
			this.editor.nativeFocus();
			return;
		}

		const selection = this.get();

		if (selection.removeAllRanges) {
			selection.removeAllRanges();
		}

		selection.addRange(range);
		this._rangeInfo(range, this.get());
		if (options.iframe) this.__focus();

		return range;
	},

	/**
	 * @description Remove range object and button effect
	 */
	removeRange: function () {
		this.status._range = null;
		this.status._selectionNode = null;
		if (this.status.hasFocus) this.get().removeAllRanges();
		this.editor.eventManager._setKeyEffect([]);
	},

	/**
	 * @description If the "range" object is a non-editable area, add a line at the top of the editor and update the "range" object.
	 * Returns a new "range" or argument "range".
	 * @param {Object} range core.getRange()
	 * @param {Element|null} container If there is "container" argument, it creates a line in front of the container.
	 * @returns {Object} range
	 */
	getRange_addLine: function (range, container) {
		if (this.isNone(range)) {
			const wysiwyg = this.context.element.wysiwyg;
			const op = domUtils.createElement(this.options.defaultTag, null, "<br>");
			wysiwyg.insertBefore(
				op,
				container && container !== wysiwyg ? container.nextElementSibling : wysiwyg.firstElementChild
			);
			this.setRange(op.firstElementChild, 0, op.firstElementChild, 1);
			range = this.status._range;
		}
		return range;
	},

	/**
	 * @description Get window selection obejct
	 * @returns {Object}
	 */
	get: function () {
		return this._shadowRoot && this._shadowRoot.getSelection ?
			this._shadowRoot.getSelection() :
			this._ww.getSelection();
	},

	/**
	 * @description Get current select node
	 * @returns {Node}
	 */
	getNode: function () {
		if (!this.context.element.wysiwyg.contains(this.status._selectionNode)) this._init();
		if (!this.status._selectionNode) {
			const selectionNode = domUtils.getEdgeChild(
				this.context.element.wysiwyg.firstChild,
				function (current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				false
			);
			if (!selectionNode) {
				this._init();
			} else {
				this.status._selectionNode = selectionNode;
				return selectionNode;
			}
		}
		return this.status._selectionNode;
	},

	/**
	 * @description Returns a "line" array from the currently selected range.
	 * @param {Function|null} validation The validation function. (Replaces the default validation format.isLine(current))
	 * @returns {Array}
	 */
	getLines: function (validation) {
		if (!this._resetRangeToTextNode()) return [];
		let range = this.selection.getRange();

		if (domUtils.isWysiwygFrame(range.startContainer)) {
			const children = this.context.element.wysiwyg.children;
			if (children.length === 0) return [];

			this.setRange(
				children[0],
				0,
				children[children.length - 1],
				children[children.length - 1].textContent.trim().length
			);
			range = this.selection.getRange();
		}

		const startCon = range.startContainer;
		const endCon = range.endContainer;
		const commonCon = range.commonAncestorContainer;

		// get line nodes
		const lineNodes = domUtils.getListChildren(commonCon, function (current) {
			return validation ? validation(current) : this.format.isLine(current);
		}.bind(this));

		if (!domUtils.isWysiwygFrame(commonCon) && !this.format.isBlock(commonCon))
			lineNodes.unshift(this.format.getLine(commonCon, null));
		if (startCon === endCon || lineNodes.length === 1) return lineNodes;

		let startLine = this.format.getLine(startCon, null);
		let endLine = this.format.getLine(endCon, null);
		let startIdx = null;
		let endIdx = null;

		const onlyTable = function (current) {
			return domUtils.isTable(current) ? /^TABLE$/i.test(current.nodeName) : true;
		};

		let startRangeEl = this.format.getBlock(startLine, onlyTable);
		let endRangeEl = this.format.getBlock(endLine, onlyTable);
		if (domUtils.isTable(startRangeEl) && domUtils.isListCell(startRangeEl.parentNode))
			startRangeEl = startRangeEl.parentNode;
		if (domUtils.isTable(endRangeEl) && domUtils.isListCell(endRangeEl.parentNode)) endRangeEl = endRangeEl.parentNode;

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
	 * @description Get lines and components from the selected area. (P, DIV, H[1-6], OL, UL, TABLE..)
	 * If some of the component are included in the selection, get the entire that component.
	 * @param {boolean} removeDuplicate If true, if there is a parent and child tag among the selected elements, the child tag is excluded.
	 * @returns {Array}
	 */
	getLinesAndComponents: function (removeDuplicate) {
		const commonCon = this.selection.getRange().commonAncestorContainer;
		const myComponent = domUtils.getParentElement(commonCon, this.component.is);
		const selectedLines = domUtils.isTable(commonCon) ?
			this.format.getLines(null) :
			this.format.getLines(
				function (current) {
					const component = domUtils.getParentElement(current, this.component.is);
					return (
						(this.format.isLine(current) && (!component || component === myComponent)) ||
						(this.component.is(current) && !this.format.getLine(current))
					);
				}.bind(this)
			);

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
	 * @description Returns true if there is no valid selection.
	 * @param {Object} range selection.getRange()
	 * @returns {boolean}
	 */
	isNone: function (range) {
		const comm = range.commonAncestorContainer;
		return (
			(domUtils.isWysiwygFrame(range.startContainer) && domUtils.isWysiwygFrame(range.endContainer)) ||
			/FIGURE/i.test(comm.nodeName) ||
			this.editor._fileManager.regExp.test(comm.nodeName) ||
			this.component.is(comm)
		);
	},

	/**
	 * @description Delete selected node and insert argument value node and return.
	 * If the "afterNode" exists, it is inserted after the "afterNode"
	 * Inserting a text node merges with both text nodes on both sides and returns a new "{ container, startOffset, endOffset }".
	 * @param {Node} oNode Node to be inserted
	 * @param {Node|null} afterNode If the node exists, it is inserted after the node
	 * @param {boolean} checkCharCount If true, if "options.maxCharCount" is exceeded when "element" is added, null is returned without addition.
	 * @returns {Object|Node|null}
	 */
	insertNode: function (oNode, afterNode, checkCharCount) {
		if (this.editor.isReadOnly || (checkCharCount && !this.editor.char.check(oNode))) {
			return null;
		}

		const brLine = this.format.getBrLine(this.getNode(), null);
		const isFormats =
			(!brLine && (this.format.isLine(oNode) || this.format.isBlock(oNode))) || this.component.is(oNode);

		if (!afterNode && (isFormats || this.component.is(oNode) || domUtils.isMedia(oNode))) {
			const r = this.removeNode();
			if (r.container.nodeType === 3 || domUtils.isBreak(r.container)) {
				const depthFormat = domUtils.getParentElement(
					r.container,
					function (current) {
						return this.format.isBlock(current) || domUtils.isListCell(current);
					}.bind(this)
				);
				afterNode = this.node.split(
					r.container,
					r.offset,
					!depthFormat ? 0 : domUtils.getElementDepth(depthFormat) + 1
				);
				if (afterNode) afterNode = afterNode.previousSibling;
			}
		}

		const range = !afterNode && !isFormats ? this.selection.getRange_addLine(this.selection.getRange(), null) : this.selection.getRange();
		const commonCon = range.commonAncestorContainer;
		const startOff = range.startOffset;
		const endOff = range.endOffset;
		const formatRange = range.startContainer === commonCon && this.format.isLine(commonCon);
		const startCon = formatRange ? commonCon.childNodes[startOff] || commonCon.childNodes[0] || range.startContainer : range.startContainer;
		const endCon = formatRange ?
			commonCon.childNodes[endOff] || commonCon.childNodes[commonCon.childNodes.length - 1] || range.endContainer :
			range.endContainer;
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
						const focusNode =
							c && c.nodeType === 3 && unicode.onlyZeroWidthSpace(c) && domUtils.isBreak(c.nextSibling) ?
							c.nextSibling :
							c;
						if (focusNode) {
							if (!focusNode.nextSibling) {
								parentNode.removeChild(focusNode);
								afterNode = null;
							} else {
								afterNode =
									domUtils.isBreak(focusNode) && !domUtils.isBreak(oNode) ? focusNode : focusNode.nextSibling;
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
						parentNode.innerHTML = "<br>";
					}
				} else {
					const removedTag = this.removeNode();
					const container = removedTag.container;
					const prevContainer = removedTag.prevContainer;
					if (container && container.childNodes.length === 0 && isFormats) {
						if (this.format.isLine(container)) {
							container.innerHTML = "<br>";
						} else if (this.format.isBlock(container)) {
							container.innerHTML = "<" + this.options.defaultTag + "><br></" + this.options.defaultTag + ">";
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
						afterNode = isFormats ?
							endCon :
							container === prevContainer ?
							container.nextSibling :
							container;
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

			if (
				this.format.isLine(oNode) ||
				this.format.isBlock(oNode) ||
				(!domUtils.isListCell(parentNode) && this.component.is(oNode))
			) {
				const oldParent = parentNode;
				if (domUtils.isList(afterNode)) {
					parentNode = afterNode;
					afterNode = null;
				} else if (domUtils.isListCell(afterNode)) {
					parentNode = afterNode.previousElementSibling || afterNode;
				} else if (!originAfter && !afterNode) {
					const r = this.removeNode();
					const container =
						r.container.nodeType === 3 ?
						domUtils.isListCell(this.format.getLine(r.container, null)) ?
						r.container :
						this.format.getLine(r.container, null) || r.container.parentNode :
						r.container;
					const rangeCon = domUtils.isWysiwygFrame(container) || this.format.isBlock(container);
					parentNode = rangeCon ? container : container.parentNode;
					afterNode = rangeCon ? null : container.nextSibling;
				}

				if (oldParent.childNodes.length === 0 && parentNode !== oldParent) domUtils.remove(oldParent);
			}

			if (
				isFormats &&
				!brLine &&
				!this.format.isBlock(parentNode) &&
				!domUtils.isListCell(parentNode) &&
				!domUtils.isWysiwygFrame(parentNode)
			) {
				afterNode = parentNode.nextElementSibling;
				parentNode = parentNode.parentNode;
			}

			if (domUtils.isWysiwygFrame(parentNode) && (oNode.nodeType === 3 || domUtils.isBreak(oNode))) {
				oNode = domUtils.createElement(this.options.defaultTag, null, oNode);
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

			if (brLine && (this.format.isLine(oNode) || this.format.isBlock(oNode))) {
				oNode = this._setIntoFreeFormat(oNode);
			}

			if (!this.component.is(oNode)) {
				let offset = 1;
				if (oNode.nodeType === 3) {
					const previous = oNode.previousSibling;
					const next = oNode.nextSibling;
					const previousText = !previous || previous.nodeType === 1 || unicode.onlyZeroWidthSpace(previous) ?
						"" :
						previous.textContent;
					const nextText = !next || next.nodeType === 1 || unicode.onlyZeroWidthSpace(next) ? "" : next.textContent;

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

					this.setRange(oNode, newRange.startOffset, oNode, newRange.endOffset);

					return newRange;
				} else if (!domUtils.isBreak(oNode) && this.format.isLine(parentNode)) {
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

				this.setRange(oNode, offset, oNode, offset);
			}

			// history stack
			this.history.push(true);

			return oNode;
		}
	},

	/**
	 * @description Inserts an (HTML element / HTML string / plain string) at the current cursor position
	 * @param {Element|String} html HTML Element or HTML string or plain string
	 * @param {boolean} notCleaningData If true, inserts the HTML string without refining it with core.cleanHTML.
	 * @param {boolean} checkCharCount If true, if "options.maxCharCount" is exceeded when "element" is added, null is returned without addition.
	 * @param {boolean} rangeSelection If true, range select the inserted node.
	 */
	insertHTML: function (html, notCleaningData, checkCharCount, rangeSelection) {
		if (typeof html === 'string') {
			if (!notCleaningData) html = core.cleanHTML(html, null, null);
			try {
				const dom = _d.createRange().createContextualFragment(html);
				const domTree = dom.childNodes;

				if (checkCharCount) {
					const type = this.options.charCounterType === 'byte-html' ? 'outerHTML' : 'textContent';
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
					t = core.insertNode(c, a, false);
					a = t.container || t;
					if (!firstCon) firstCon = t;
					prev = c;
				}

				if (prev.nodeType === 3 && a.nodeType === 1) a = prev;
				const offset = a.nodeType === 3 ? (t.endOffset || a.textContent.length) : a.childNodes.length;
				if (rangeSelection) core.setRange(firstCon.container || firstCon, firstCon.startOffset || 0, a, offset);
				else core.setRange(a, offset, a, offset);
			} catch (error) {
				if (this.status.isDisabled || this.status.isReadOnly) return;
				console.warn('[SUNEDITOR.selection.insertHTML.fail] ' + error);
				this.editor.execCommand('insertHTML', false, html);
			}
		} else {
			if (this.component.is(html)) {
				core.component.insert(html, false, checkCharCount, false);
			} else {
				let afterNode = null;
				if (this.format.isLine(html) || domUtils.isMedia(html)) {
					afterNode = this.format.getLine(core.selection.getNode(), null);
				}
				core.insertNode(html, afterNode, checkCharCount);
			}
		}

		core.effectNode = null;
		core.focus();

		// history stack
		core.history.push(false);
	},

	/**
	 * @description Delete the currently selected nodes and reset selection range
	 * Returns {container: "the last element after deletion", offset: "offset", prevContainer: "previousElementSibling Of the deleted area"}
	 * @returns {Object}
	 */
	removeNode: function () {
		this._resetRangeToTextNode();

		const range = this.selection.getRange();
		let container,
			offset = 0;
		let startCon = range.startContainer;
		let endCon = range.endContainer;
		let startOff = range.startOffset;
		let endOff = range.endOffset;
		const commonCon =
			range.commonAncestorContainer.nodeType === 3 &&
			range.commonAncestorContainer.parentNode === startCon.parentNode ?
			startCon.parentNode :
			range.commonAncestorContainer;
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
				if (
					childNodes[i] === startNode.parentNode &&
					childNodes[i].firstChild === startNode &&
					startOff === 0
				) {
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
				if (
					this.format.isLine(commonCon) ||
					this.format.isBlock(commonCon) ||
					domUtils.isWysiwygFrame(commonCon) ||
					domUtils.isBreak(commonCon) ||
					domUtils.isMedia(commonCon)
				) {
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
						beforeNode = domUtils.createTextNode(
							startCon.substringData(0, startOff) + endCon.substringData(endOff, endCon.length - endOff)
						);
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

		container =
			endCon && endCon.parentNode ?
			endCon :
			startCon && startCon.parentNode ?
			startCon :
			range.endContainer || range.startContainer;

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
	 * @description Reset range object to text node selected status.
	 * @returns {boolean} Returns false if there is no valid selection.
	 * @private
	 */
	_resetRangeToTextNode: function () {
		const range = this.selection.getRange();
		if (this.isNone(range)) return false;

		let startCon = range.startContainer;
		let startOff = range.startOffset;
		let endCon = range.endContainer;
		let endOff = range.endOffset;
		let tempCon, tempOffset, tempChild;

		if (this.format.isLine(startCon)) {
			if (!startCon.childNodes[startOff]) {
				startCon = startCon.lastChild || startCon;
				startOff = startCon.textContent.length;
			} else {
				startCon = startCon.childNodes[startOff] || startCon;
				startOff = 0;
			}
			while (startCon && startCon.nodeType === 1 && startCon.firstChild) {
				startCon = startCon.firstChild || startCon;
				startOff = 0;
			}
		}
		if (this.format.isLine(endCon)) {
			endCon = endCon.childNodes[endOff] || endCon.lastChild || endCon;
			while (endCon && endCon.nodeType === 1 && endCon.lastChild) {
				endCon = endCon.lastChild;
			}
			endOff = endCon.textContent.length;
		}

		// startContainer
		tempCon = domUtils.isWysiwygFrame(startCon) ? this.context.element.wysiwyg.firstChild : startCon;
		tempOffset = startOff;

		if (domUtils.isBreak(tempCon) || (tempCon.nodeType === 1 && tempCon.childNodes.length > 0)) {
			const onlyBreak = domUtils.isBreak(tempCon);
			if (!onlyBreak) {
				while (tempCon && !domUtils.isBreak(tempCon) && tempCon.nodeType === 1) {
					tempCon = tempCon.childNodes[tempOffset] || tempCon.nextElementSibling || tempCon.nextSibling;
					tempOffset = 0;
				}

				let format = this.format.getLine(tempCon, null);
				if (format === this.format.getBlock(format, null)) {
					format = domUtils.createElement(
						domUtils.getParentElement(tempCon, domUtils.isTableCell) ? "DIV" : this.options.defaultTag
					);
					tempCon.parentNode.insertBefore(format, tempCon);
					format.appendChild(tempCon);
				}
			}

			if (domUtils.isBreak(tempCon)) {
				const emptyText = domUtils.createTextNode(unicode.zeroWidthSpace);
				tempCon.parentNode.insertBefore(emptyText, tempCon);
				tempCon = emptyText;
				if (onlyBreak) {
					if (startCon === endCon) {
						endCon = tempCon;
						endOff = 1;
					}
				}
			}
		}

		// set startContainer
		startCon = tempCon;
		startOff = tempOffset;

		// endContainer
		tempCon = domUtils.isWysiwygFrame(endCon) ? this.context.element.wysiwyg.lastChild : endCon;
		tempOffset = endOff;

		if (domUtils.isBreak(tempCon) || (tempCon.nodeType === 1 && tempCon.childNodes.length > 0)) {
			const onlyBreak = domUtils.isBreak(tempCon);
			if (!onlyBreak) {
				while (tempCon && !domUtils.isBreak(tempCon) && tempCon.nodeType === 1) {
					tempChild = tempCon.childNodes;
					if (tempChild.length === 0) break;
					tempCon =
						tempChild[tempOffset > 0 ? tempOffset - 1 : tempOffset] ||
						!/FIGURE/i.test(tempChild[0].nodeName) ?
						tempChild[0] :
						tempCon.previousElementSibling || tempCon.previousSibling || startCon;
					tempOffset = tempOffset > 0 ? tempCon.textContent.length : tempOffset;
				}

				let format = this.format.getLine(tempCon, null);
				if (format === this.format.getBlock(format, null)) {
					format = domUtils.createElement(domUtils.isTableCell(format) ? "DIV" : this.options.defaultTag);
					tempCon.parentNode.insertBefore(format, tempCon);
					format.appendChild(tempCon);
				}
			}

			if (domUtils.isBreak(tempCon)) {
				const emptyText = domUtils.createTextNode(unicode.zeroWidthSpace);
				tempCon.parentNode.insertBefore(emptyText, tempCon);
				tempCon = emptyText;
				tempOffset = 1;
				if (onlyBreak && !tempCon.previousSibling) {
					domUtils.remove(endCon);
				}
			}
		}

		// set endContainer
		endCon = tempCon;
		endOff = tempOffset;

		// set Range
		this.setRange(startCon, startOff, endCon, endOff);
		return true;
	},

	/**
	 * @description Recursive function  when used to place a node in "BrLine" in "node.insertNode" 
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
			oNode = domUtils.createElement("BR");
			parentNode.insertBefore(oNode, lastONode.nextSibling);
		}

		return oNode;
	},

	constructor: Selection
};

export default Selection;