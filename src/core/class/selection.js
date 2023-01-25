/**
 * @fileoverview Selection class
 * @author Yi JiHong.
 */

import CoreDependency from '../../dependency/_core';
import { domUtils, unicode } from '../../helper';

const Selection = function (editor) {
	CoreDependency.call(this, editor);
	this.range = null;
	this.selectionNode = null;
};

Selection.prototype = {
	/**
	 * @description Get window selection obejct
	 * @returns {Object}
	 */
	get: function () {
		return this._shadowRoot && this._shadowRoot.getSelection ? this._shadowRoot.getSelection() : this.frameContext.get('_ww').getSelection();
	},

	/**
	 * @description Get current editor's range object
	 * @returns {Object}
	 */
	getRange: function () {
		const range = this.status._range || this._createDefaultRange();
		const selection = this.get();
		if (range.collapsed === selection.isCollapsed || !this.frameContext.get('wysiwyg').contains(selection.focusNode)) return range;

		if (selection.rangeCount > 0) {
			this.status._range = selection.getRangeAt(0);
			return this.status._range;
		} else {
			const sc = selection.anchorNode,
				ec = selection.focusNode,
				so = selection.anchorOffset,
				eo = selection.focusOffset;
			const compareValue = domUtils.compareElements(sc, ec);
			const rightDir = compareValue.ancestor && (compareValue.result === 0 ? so <= eo : compareValue.result > 1 ? true : false);
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
			startCon = startCon.childNodes[startOff] || startCon.childNodes[startOff - 1] || startCon;
			startOff = startOff > 0 ? (startCon.nodeType === 1 ? 1 : startCon.textContent ? startCon.textContent.length : 0) : 0;
		}
		if (this.format.isLine(endCon)) {
			endCon = endCon.childNodes[endOff] || endCon.childNodes[endOff - 1] || endCon;
			endOff = endOff > 0 ? (endCon.nodeType === 1 ? 1 : endCon.textContent ? endCon.textContent.length : 0) : 0;
		}

		const range = this.frameContext.get('_wd').createRange();

		try {
			range.setStart(startCon, startOff);
			range.setEnd(endCon, endOff);
		} catch (error) {
			console.warn('[SUNEDITOR.selection.focus.warn] ' + error.message);
			this.editor._nativeFocus();
			return;
		}

		const selection = this.get();

		if (selection.removeAllRanges) {
			selection.removeAllRanges();
		}

		selection.addRange(range);
		this._rangeInfo(range, this.get());
		if (this.options.get('iframe')) this.__focus();

		return range;
	},

	/**
	 * @description Remove range object and button effect
	 */
	removeRange: function () {
		this.status._range = null;
		this.selectionNode = null;
		if (this.status.hasFocus) this.get().removeAllRanges();
		this.eventManager._setKeyEffect([]);
	},

	/**
	 * @description If the "range" object is a non-editable area, add a line at the top of the editor and update the "range" object.
	 * Returns a new "range" or argument "range".
	 * @param {Object} range core.getRange()
	 * @param {Element|null} container If there is "container" argument, it creates a line in front of the container.
	 * @returns {Object} range
	 */
	getRangeAndAddLine: function (range, container) {
		if (this._isNone(range)) {
			const wysiwyg = this.frameContext.get('wysiwyg');
			const op = domUtils.createElement(this.options.get('defaultLineTag'), null, '<br>');
			wysiwyg.insertBefore(op, container && container !== wysiwyg ? container.nextElementSibling : wysiwyg.firstElementChild);
			this.setRange(op.firstElementChild, 0, op.firstElementChild, 1);
			range = this.status._range;
		}
		return range;
	},

	/**
	 * @description Get current select node
	 * @returns {Node}
	 */
	getNode: function () {
		if (!this.frameContext.get('wysiwyg').contains(this.selectionNode)) this._init();
		if (!this.selectionNode) {
			const selectionNode = domUtils.getEdgeChild(
				this.frameContext.get('wysiwyg').firstChild,
				function (current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				false
			);
			if (!selectionNode) {
				this._init();
			} else {
				this.selectionNode = selectionNode;
				return selectionNode;
			}
		}
		return this.selectionNode;
	},

	/**
	 * @description  Get hte clientRects object.
	 * @param {Range|null} range Range object
	 * @param {"start"|"end"} position It is based on the position of the rect object to be returned in case of range selection.
	 * @returns
	 */
	getRects: function (range, position) {
		range = range || this.getRange();
		const globalScroll = this.offset.getGlobalScroll();
		let isStartPosition = position === 'start';
		let scrollLeft = globalScroll.left;
		let scrollTop = globalScroll.top;

		let rects = range.getClientRects();
		rects = rects[isStartPosition ? 0 : rects.length - 1];

		if (!rects) {
			const node = this.getNode();
			if (this.format.isLine(node)) {
				const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
				this.html.insertNode(zeroWidth, null, true);
				this.setRange(zeroWidth, 1, zeroWidth, 1);
				this._init();
				rects = this.getRange().getClientRects();
				rects = rects[isStartPosition ? 0 : rects.length - 1];
			}

			if (!rects) {
				const nodeOffset = this.offset.get(node);
				rects = {
					left: nodeOffset.left,
					top: nodeOffset.top,
					right: nodeOffset.left,
					bottom: nodeOffset.top + node.offsetHeight,
					noText: true
				};
				scrollLeft = 0;
				scrollTop = 0;
			}

			isStartPosition = true;
		}

		const iframeRects = /iframe/i.test(this.frameContext.get('wysiwygFrame').nodeName) ? this.frameContext.get('wysiwygFrame').getClientRects()[0] : null;
		if (iframeRects) {
			rects = {
				left: rects.left + iframeRects.left,
				top: rects.top + iframeRects.top,
				right: rects.right + iframeRects.right - iframeRects.width,
				bottom: rects.bottom + iframeRects.bottom - iframeRects.height
			};
		}

		return {
			rects: rects,
			position: isStartPosition ? 'start' : 'end',
			scrollLeft: scrollLeft,
			scrollTop: scrollTop
		};
	},

	/**
	 * @description Returns true if there is no valid selection.
	 * @param {Object} range selection.getRange()
	 * @returns {boolean}
	 */
	_isNone: function (range) {
		const comm = range.commonAncestorContainer;
		return (domUtils.isWysiwygFrame(range.startContainer) && domUtils.isWysiwygFrame(range.endContainer)) || /FIGURE/i.test(comm.nodeName) || this.editor._fileManager.regExp.test(comm.nodeName) || this.component.is(comm);
	},

	/**
	 * @description Return the range object of editor's first child node
	 * @returns {Object}
	 * @private
	 */
	_createDefaultRange: function () {
		const wysiwyg = this.frameContext.get('wysiwyg');
		wysiwyg.focus();
		const range = this.frameContext.get('_wd').createRange();

		let focusEl = wysiwyg.firstElementChild;
		if (!focusEl) {
			focusEl = domUtils.createElement(this.options.get('defaultLineTag'), null, '<br>');
			wysiwyg.appendChild(focusEl);
		}

		range.setStart(focusEl, 0);
		range.setEnd(focusEl, 0);

		return range;
	},

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

		this.selectionNode = selectionNode;
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

		if (this.format.isLine(range.endContainer) && range.endOffset === 0) {
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
			this.frameContext.get('wysiwyg').focus();
		}
	},

	/**
	 * @description Reset range object to text node selected status.
	 * @returns {boolean} Returns false if there is no valid selection.
	 * @private
	 */
	_resetRangeToTextNode: function () {
		const range = this.getRange();
		if (this._isNone(range)) return false;

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
		tempCon = domUtils.isWysiwygFrame(startCon) ? this.frameContext.get('wysiwyg').firstChild : startCon;
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
					format = domUtils.createElement(domUtils.getParentElement(tempCon, domUtils.isTableCell) ? 'DIV' : this.options.get('defaultLineTag'));
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
		tempCon = domUtils.isWysiwygFrame(endCon) ? this.frameContext.get('wysiwyg').lastChild : endCon;
		tempOffset = endOff;

		if (domUtils.isBreak(tempCon) || (tempCon.nodeType === 1 && tempCon.childNodes.length > 0)) {
			const onlyBreak = domUtils.isBreak(tempCon);
			if (!onlyBreak) {
				while (tempCon && !domUtils.isBreak(tempCon) && tempCon.nodeType === 1) {
					tempChild = tempCon.childNodes;
					if (tempChild.length === 0) break;
					tempCon = tempChild[tempOffset > 0 ? tempOffset - 1 : tempOffset] || !/FIGURE/i.test(tempChild[0].nodeName) ? tempChild[0] : tempCon.previousElementSibling || tempCon.previousSibling || startCon;
					tempOffset = tempOffset > 0 ? tempCon.textContent.length : tempOffset;
				}

				let format = this.format.getLine(tempCon, null);
				if (format === this.format.getBlock(format, null)) {
					format = domUtils.createElement(domUtils.isTableCell(format) ? 'DIV' : this.options.get('defaultLineTag'));
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
					domUtils.removeItem(endCon);
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

	constructor: Selection
};

export default Selection;
