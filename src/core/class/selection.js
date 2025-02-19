/**
 * @fileoverview Selection class
 */

import CoreInjector from '../../editorInjector/_core';
import { domUtils, unicode, env } from '../../helper';

/**
 * @typedef {Omit<Selection_ & Partial<EditorInjector>, 'selection'>} SelectionThis
 */

/**
 * @typedef {import('./offset').RectsInfo} RectsInfo
 */

/**
 * @constructor
 * @this {SelectionThis}
 * @description Selection, Range related class
 * @param {EditorCore} editor - The root editor instance
 */
function Selection_(editor) {
	CoreInjector.call(this, editor);

	// members
	this.range = null;
	this.selectionNode = null;
	this.__iframeFocus = false;
}

Selection_.prototype = {
	/**
	 * @this {SelectionThis}
	 * @description Get window selection obejct
	 * @returns {Selection}
	 */
	get() {
		const selection = this._shadowRoot ? this._shadowRoot?.getComposedRanges() || this._shadowRoot?.getSelection() : this.editor.frameContext.get('_ww').getSelection();
		if (!selection) return null;
		if (!this.status._range && !this.editor.frameContext.get('wysiwyg').contains(selection.focusNode)) {
			selection.removeAllRanges();
			selection.addRange(this._createDefaultRange());
		}
		return selection;
	},

	/**
	 * @this {SelectionThis}
	 * @description Check if the range object is valid
	 * @param {*} range Range object
	 * @returns {boolean}
	 */
	isRange(range) {
		// return /Range/.test(Object.prototype.toString.call(range?.__proto__));
		return range instanceof Range;
	},

	/**
	 * @this {SelectionThis}
	 * @description Get current editor's range object
	 * @returns {Range}
	 */
	getRange() {
		const range = this.status._range || this._createDefaultRange();
		const selection = this.get();
		if (range.collapsed === selection.isCollapsed || !this.editor.frameContext.get('wysiwyg').contains(selection.focusNode)) {
			if (this.component.is(range.startContainer)) {
				const compInfo = this.component.get(range.startContainer);
				const container = compInfo?.container;
				if (!container) return range;
				return this.setRange(container, 0, container, 1);
			}

			return range;
		}

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
	 * @this {SelectionThis}
	 * @description Set current editor's range object and return.
	 * @param {Node|Range} startCon Range object or The startContainer property of the selection object
	 * @param {number} [startOff] The startOffset property of the selection object.
	 * @param {Node} [endCon] The endContainer property of the selection object.
	 * @param {number} [endOff] The endOffset property of the selection object.
	 * @returns {Range}
	 */
	setRange(startCon, startOff, endCon, endOff) {
		/** @type {Node} */
		let sc;
		/** @type {number} */
		let so;
		/** @type {Node} */
		let ec;
		/** @type {number} */
		let eo;

		if (this.isRange(sc)) {
			const r = /** @type {Range} */ (startCon);
			sc = r.startContainer;
			so = r.startOffset;
			ec = r.endContainer;
			eo = r.endOffset;
		} else {
			sc = /** @type {Node} */ (startCon);
			so = startOff;
			ec = endCon;
			eo = endOff;
		}

		if (!sc || !ec) return;
		if ((domUtils.isBreak(sc) || sc.nodeType === 3) && so > sc.textContent.length) so = sc.textContent.length;
		if ((domUtils.isBreak(ec) || ec.nodeType === 3) && eo > ec.textContent.length) eo = ec.textContent.length;
		if (this.format.isLine(sc)) {
			sc = sc.childNodes[so > 0 ? sc.childNodes.length - 1 : 0] || sc;
			so = so > 0 ? (sc.nodeType === 1 && !domUtils.isBreak(sc) ? 1 : sc.textContent ? sc.textContent.length : 0) : 0;
		}
		if (this.format.isLine(ec)) {
			ec = ec.childNodes[eo > 0 ? ec.childNodes.length - 1 : 0] || ec;
			eo = eo > 0 ? (ec.nodeType === 1 && !domUtils.isBreak(ec) ? 1 : ec.textContent ? ec.textContent.length : 0) : 0;
		}

		const range = this.editor.frameContext.get('_wd').createRange();

		try {
			range.setStart(sc, so);
			range.setEnd(ec, eo);
		} catch (error) {
			console.warn('[SUNEDITOR.selection.focus.warn]', error.message);
			this.editor._nativeFocus();
			return;
		}

		const selection = this.get();

		if (selection.removeAllRanges) {
			selection.removeAllRanges();
		}

		selection.addRange(range);
		this.status._range = range;
		this._rangeInfo(range, this.get());

		if (this.editor.frameOptions.get('iframe')) this.__focus();

		return range;
	},

	/**
	 * @this {SelectionThis}
	 * @description Remove range object and button effect
	 */
	removeRange() {
		this.status._range = null;
		this.selectionNode = null;
		this.editor.effectNode = null;
		if (this.status.hasFocus) this.get().removeAllRanges();
		this.eventManager._setKeyEffect([]);
	},

	/**
	 * @this {SelectionThis}
	 * @description Returns the range (container and offset) near the given target node.
	 * - If the target node has a next sibling, it returns the next sibling with an offset of 0.
	 * - If there is no next sibling but a previous sibling exists, it returns the previous sibling with an offset of 1.
	 * @param {Node} target Target node whose neighboring range is to be determined.
	 * @returns {{container: Node, offset: number}|null} An object containing the nearest container node and its offset.
	 */
	getNearRange(target) {
		const next = target.nextSibling;
		const prev = target.previousSibling;
		if (next) {
			return {
				container: next,
				offset: 0
			};
		} else if (prev) {
			return {
				container: prev,
				offset: 1
			};
		}

		return null;
	},

	/**
	 * @this {SelectionThis}
	 * @description If the "range" object is a non-editable area, add a line at the top of the editor and update the "range" object.
	 * @param {Range} range core.getRange()
	 * @param {?Node=} container If there is "container" argument, it creates a line in front of the container.
	 * @returns {Range} a new "range" or argument "range".
	 */
	getRangeAndAddLine(range, container) {
		if (this._isNone(range)) {
			const parent = container?.parentElement || this.editor.frameContext.get('wysiwyg');
			const op = domUtils.createElement(this.options.get('defaultLine'), null, '<br>');
			parent.insertBefore(op, container && container !== parent ? (!container.previousElementSibling ? container : container.nextElementSibling) : parent.firstElementChild);
			this.setRange(op.firstElementChild, 0, op.firstElementChild, 1);
			range = this.status._range;
		}
		return range;
	},

	/**
	 * @this {SelectionThis}
	 * @description Get current select node
	 * @returns {Node}
	 */
	getNode() {
		if (!this.editor.frameContext.get('wysiwyg').contains(this.selectionNode)) this._init();
		if (!this.selectionNode) {
			const selectionNode = domUtils.getEdgeChild(
				this.editor.frameContext.get('wysiwyg').firstChild,
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
	 * @this {SelectionThis}
	 * @description Get the Rects object.
	 * @param {?Range|Node} ref Range | Node | null
	 * @param {"start"|"end"} position It is based on the position of the rect object to be returned in case of range selection.
	 * @returns {{rects: RectsInfo, position: "start"|"end", scrollLeft: number, scrollTop: number}}
	 */
	getRects(ref, position) {
		const range = /** @type {Range} */ (!ref || !this.isRange(ref) ? this.getRange() : ref);
		const globalScroll = this.offset.getGlobalScroll();
		let isStartPosition = position === 'start';
		let scrollLeft = globalScroll.left;
		let scrollTop = globalScroll.top;

		const cr = range.getClientRects();
		let rects = /** @type {RectsInfo} */ (cr[isStartPosition ? 0 : cr.length - 1]);

		if (!rects) {
			const node = this.getNode();
			if (this.format.isLine(node)) {
				const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
				this.html.insertNode(zeroWidth, { afterNode: null, skipCharCount: true });
				this.setRange(zeroWidth, 1, zeroWidth, 1);
				this._init();
				const lcr = this.getRange().getClientRects();
				rects = lcr[isStartPosition ? 0 : lcr.length - 1];
			}

			if (!rects) {
				const nodeOffset = this.offset.get(node);
				rects = {
					left: nodeOffset.left,
					top: nodeOffset.top,
					right: nodeOffset.left + node.offsetWidth,
					bottom: nodeOffset.top + node.offsetHeight,
					noText: true
				};
				scrollLeft = 0;
				scrollTop = 0;
			}

			isStartPosition = true;
		}

		const iframeRects = /^iframe$/i.test(this.editor.frameContext.get('wysiwygFrame').nodeName) ? this.editor.frameContext.get('wysiwygFrame').getClientRects()[0] : null;
		const targetAbs = ref instanceof Node && ref.nodeType === 1 && this._w.getComputedStyle(ref).position === 'absolute';
		if (!targetAbs && iframeRects) {
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
	 * @this {SelectionThis}
	 * @description Get the custom range object of the event.
	 * @param {DragEvent} e Event object
	 * @returns {{sc: Node, so: number, ec: Node, eo: number}} {sc: startContainer, so: startOffset, ec: endContainer, eo: endOffset}
	 */
	getDragEventLocationRange(e) {
		const wd = this.editor.frameContext.get('_wd');
		let r, sc, so, ec, eo;

		if (wd.caretPositionFromPoint) {
			r = wd.caretPositionFromPoint(e.clientX, e.clientY);
			sc = r.offsetNode;
			so = r.offset;
			ec = r.offsetNode;
			eo = r.offset;
		} else if (wd.caretRangeFromPoint) {
			r = wd.caretRangeFromPoint(e.clientX, e.clientY);
			sc = r.startContainer;
			so = r.startOffset;
			ec = r.endContainer;
			eo = r.endOffset;
		}

		if (!r) {
			r = this.getRange();
			sc = r.startContainer;
			so = r.startOffset;
			ec = r.endContainer;
			eo = r.endOffset;
		}

		return {
			sc,
			so,
			ec,
			eo
		};
	},

	/**
	 * @this {SelectionThis}
	 * @description Scroll to the corresponding selection or range position.
	 * @param {Selection|Range|Node} ref selection or range object
	 * @param {?Object<string, *>=} scrollOption option of scrollTo
	 */
	scrollTo(ref, scrollOption) {
		if (ref instanceof Selection) {
			ref = ref.getRangeAt(0);
		} else if (ref instanceof Node) {
			ref = this.setRange(ref, 1, ref, 1);
		} else if (typeof ref?.startContainer === 'undefined') {
			console.warn('[SUNEDITOR.html.scrollTo.warn] "selectionRange" must be Selection or Range or Node object.', ref);
		}

		const rect = ref.getBoundingClientRect();
		const isVisible = rect.top >= 0 && rect.bottom <= this.editor.frameContext.get('wysiwygFrame').innerHeight;

		if (isVisible) return;

		const el = domUtils.getParentElement(ref.startContainer, (current) => current.nodeType === 1);
		el?.scrollIntoView?.(scrollOption || this.options.get('scrollToOptions'));
	},

	/**
	 * @private
	 * @this {SelectionThis}
	 * @description Returns true if there is no valid selection.
	 * @param {Range} range selection.getRange()
	 * @returns {boolean}
	 */
	_isNone(range) {
		const comm = range.commonAncestorContainer;
		return (
			(domUtils.isWysiwygFrame(range.startContainer) && domUtils.isWysiwygFrame(range.endContainer)) ||
			/FIGURE/i.test(comm.nodeName) ||
			(this.editor._fileManager.regExp.test(comm.nodeName) && (!this.editor._fileManager.tagAttrs[comm.nodeName] || this.editor._fileManager.tagAttrs[comm.nodeName]?.every((v) => comm.hasAttribute(v)))) ||
			this.component.is(comm)
		);
	},

	/**
	 * @private
	 * @this {SelectionThis}
	 * @description Return the range object of editor's first child node
	 * @returns {Range}
	 */
	_createDefaultRange() {
		const wysiwyg = this.editor.frameContext.get('wysiwyg');
		const range = this.editor.frameContext.get('_wd').createRange();

		let firstFormat = wysiwyg.firstElementChild;
		let focusEl = null;
		if (!firstFormat) {
			focusEl = domUtils.createElement('BR');
			firstFormat = domUtils.createElement(this.options.get('defaultLine'), null, focusEl);
			wysiwyg.appendChild(firstFormat);
		} else {
			focusEl = firstFormat.firstChild;
			if (!focusEl) {
				focusEl = domUtils.createElement('BR');
				firstFormat.appendChild(focusEl);
			}
		}

		range.setStart(focusEl, 0);
		range.setEnd(focusEl, 0);

		return range;
	},

	/**
	 * @private
	 * @this {SelectionThis}
	 * @description Set "range" and "selection" info.
	 * @param {Range} range range object.
	 * @param {Selection} selection selection object.
	 */
	_rangeInfo(range, selection) {
		let selectionNode = null;
		this.status._range = range;

		if (range.collapsed) {
			if (domUtils.isWysiwygFrame(range.commonAncestorContainer)) selectionNode = range.commonAncestorContainer.children[range.startOffset] || range.commonAncestorContainer;
			else selectionNode = range.commonAncestorContainer;
		} else {
			selectionNode = selection.anchorNode;
		}

		this.selectionNode = selectionNode;
	},

	/**
	 * @private
	 * @this {SelectionThis}
	 * @description Saving the range object and the currently selected node of editor
	 */
	_init() {
		const activeEl = this.editor.frameContext.get('_wd').activeElement;
		if (domUtils.isInputElement(activeEl)) {
			this.selectionNode = activeEl;
			return activeEl;
		}

		const selection = this.get();

		if (!selection) return null;
		let range = null;

		if (selection.rangeCount > 0) {
			range = selection.getRangeAt(0);
		} else {
			range = this._createDefaultRange();
		}

		this._rangeInfo(range, selection);
	},

	/**
	 * @private
	 * @this {SelectionThis}
	 * @description Focus method
	 */
	__focus() {
		try {
			this.__iframeFocus = true;
			const caption = domUtils.getParentElement(this.getNode(), 'figcaption');
			if (caption) {
				caption.focus();
			} else {
				this.editor.frameContext.get('wysiwyg').focus();
			}
		} finally {
			env._w.setTimeout(() => (this.__iframeFocus = false), 0);
		}
	},

	/**
	 * @private
	 * @this {SelectionThis}
	 * @description Reset range object to text node selected status.
	 * @returns {boolean} Returns false if there is no valid selection.
	 */
	_resetRangeToTextNode() {
		let rangeObj = this.getRange();
		if (this._isNone(rangeObj)) {
			if (!domUtils.isWysiwygFrame(rangeObj.startContainer) || !domUtils.isWysiwygFrame(rangeObj.endContainer)) return false;
			const ww = rangeObj.commonAncestorContainer;
			const first = ww.children[rangeObj.startOffset];
			const end = ww.children[rangeObj.endOffset];
			if (!(rangeObj = this.setRange(first, 0, end, first === end ? 0 : 1))) return false;
		}

		const range = rangeObj;
		const collapsed = range.collapsed;
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
			while (startCon?.nodeType === 1 && startCon.firstChild) {
				startCon = startCon.firstChild || startCon;
				startOff = 0;
			}
		}
		if (this.format.isLine(endCon)) {
			endCon = endCon.childNodes[endOff] || endCon.lastChild || endCon;
			while (endCon?.nodeType === 1 && endCon.lastChild) {
				endCon = endCon.lastChild;
			}
			if (collapsed) endOff = 0;
			else if (endOff > 0) endOff = endCon.textContent.length;
		}

		// startContainer
		tempCon = domUtils.isWysiwygFrame(startCon) ? this.editor.frameContext.get('wysiwyg').firstChild : startCon;
		tempOffset = startOff;

		if (domUtils.isBreak(tempCon) || (tempCon.nodeType === 1 && tempCon.childNodes.length > 0)) {
			const onlyBreak = domUtils.isBreak(tempCon);
			if (!onlyBreak) {
				const tempConCache = tempCon;
				while (tempCon && !domUtils.isBreak(tempCon) && tempCon.nodeType === 1) {
					tempChild = tempCon.childNodes;
					if (tempChild.length === 0) break;
					tempCon = tempChild[tempOffset > 0 ? tempOffset - 1 : tempOffset] || !/FIGURE/i.test(tempChild[0].nodeName) ? tempChild[0] : tempCon.previousElementSibling || tempCon.previousSibling || startCon;
					tempOffset = tempOffset > 0 ? tempCon.textContent.length : tempOffset;
				}

				let format = this.format.getLine(tempCon, null);
				if (format === this.format.getBlock(format, null)) {
					tempCon = tempCon || tempConCache;
					format = domUtils.createElement(domUtils.getParentElement(tempCon, domUtils.isTableCell) ? 'DIV' : this.options.get('defaultLine'));
					tempCon.parentNode.insertBefore(format, tempCon);
					if (tempCon !== tempConCache) format.appendChild(tempCon);
				}
			}

			if (domUtils.isBreak(tempCon) || this.component.is(tempCon)) {
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
		tempCon = domUtils.isWysiwygFrame(endCon) ? this.editor.frameContext.get('wysiwyg').lastChild : endCon;
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
					format = domUtils.createElement(domUtils.isTableCell(format) ? 'DIV' : this.options.get('defaultLine'));
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

	constructor: Selection_
};

export default Selection_;
