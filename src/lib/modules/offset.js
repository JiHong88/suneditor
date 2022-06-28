/**
 * @fileoverview Offset class
 * @author Yi JiHong.
 */

import CoreInterface from '../../interface/_core';
import { getParentElement, isWysiwygFrame, hasClass } from '../../helper/domUtils';

const Offset = function (editor) {
	CoreInterface.call(this, editor);
};

Offset.prototype = {
	/**
	 * @description Returns the position of the argument, relative to inside the editor.
	 * @param {Node} node Target node
	 * @returns {Object} {left, top}
	 */
	get: function (node) {
		let offsetLeft = 0;
		let offsetTop = 0;
		let offsetElement = node.nodeType === 3 ? node.parentElement : node;
		const wysiwyg = getParentElement(node, isWysiwygFrame.bind(this));

		while (offsetElement && !hasClass(offsetElement, 'se-container') && offsetElement !== wysiwyg) {
			offsetLeft += offsetElement.offsetLeft;
			offsetTop += offsetElement.offsetTop;
			offsetElement = offsetElement.offsetParent;
		}

		const wFrame = this.context.element.wysiwygFrame;
		const iframe = wFrame && /iframe/i.test(wFrame.nodeName);

		return {
			left: offsetLeft + (iframe ? wFrame.parentElement.offsetLeft : 0),
			top: offsetTop - (wysiwyg ? wysiwyg.scrollTop : 0) + (iframe ? wFrame.parentElement.offsetTop : 0)
		};
	},

	/**
	 * @description Returns the position of the argument, relative to global document. {left:0, top:0, scroll: 0}
	 * @param {Element} container Target element
	 * @returns {Object} {left, top, scroll}
	 */
	getGlobal: function (container) {
		if (!container) container = this.context.element.topArea;
		let t = 0,
			l = 0,
			s = 0;

		while (container) {
			t += container.offsetTop;
			l += container.offsetLeft;
			s += container.scrollTop;
			container = container.offsetParent;
		}

		return {
			top: t,
			left: l,
			scroll: s
		};
	},

	/**
	 * @description Gets the current editor-relative scroll offset.
	 * @returns {Object} {top, left, width, height}
	 */
	getGlobalScroll: function () {
		let t = 0,
			l = 0,
			h = 0,
			w = 0;
		let el = this.context.element.topArea;
		while (el) {
			t += el.scrollTop;
			l += el.scrollLeft;
			h += el.scrollHeight;
			w += el.scrollWidth;
			el = el.parentElement;
		}

		el = this.shadowRoot ? this.shadowRoot.host : null;
		while (el) {
			t += el.scrollTop;
			l += el.scrollLeft;
			h += el.scrollHeight;
			w += el.scrollWidth;
			el = el.parentElement;
		}

		return {
			top: t,
			left: l,
			width: w,
			height: h
		};
	},

	constructor: Offset
};

export default Offset;
