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
	 * @description Returns the position of the argument, "context.element.editorArea" to inside the editor.Returns the position of the element in "context.element.editorArea".
	 * @param {Node} node Target node
	 * @returns {Object} {left, top}
	 */
	get: function (node) {
		let offsetLeft = 0;
		let offsetTop = 0;
		let offsetElement = node.nodeType === 3 ? node.parentElement : node;
		const wysiwyg = getParentElement(node, isWysiwygFrame.bind(this));

		while (offsetElement && !hasClass(offsetElement, 'se-wrapper') && offsetElement !== wysiwyg) {
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
	 * @param {Element} element Target element
	 * @returns {Object} {left, top, scroll}
	 */
	getGlobal: function (element) {
		if (!element) element = this.context.element.topArea;
		let t = 0,
			l = 0,
			s = 0;

		while (element) {
			t += element.offsetTop;
			l += element.offsetLeft;
			s += element.scrollTop;
			element = element.offsetParent;
		}

		return {
			top: t,
			left: l,
			scroll: s
		};
	},

	/**
	 * @description Gets the current editor-relative scroll offset.
	 * @param {Element} element Target element
	 * @returns {Object} {top, left, width, height}
	 */
	getGlobalScroll: function (element) {
		let t = 0,
			l = 0,
			h = 0,
			w = 0;
		let el = element || this.context.element.topArea;
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

	setAbsPosition: function (element, target, container) {
		const elW = element.offsetWidth;
		const targetL = target.offsetLeft;

		// left
		if (this.options._rtl) {
			const elementW = target.offsetWidth;
			const rtlW = elW > elementW ? elW - elementW : 0;
			const rtlL = rtlW > 0 ? 0 : elementW - elW;
			element.style.left = targetL - rtlW + rtlL + 'px';
			if (this.getGlobal(container).left > this.getGlobal(element).left) {
				element.style.left = '0px';
			}
		} else {
			const cw = container.offsetWidth;
			const overLeft = cw <= elW ? 0 : cw - (targetL + elW);
			if (overLeft < 0) element.style.left = targetL + overLeft + 'px';
			else element.style.left = targetL + 'px';
		}

		// top
		const containerTop = this.getGlobal(container).top;
		const elHeight = element.offsetHeight;
		const scrollTop = this.getGlobalScroll().top;
		let bt = 0;
		let offsetEl = target;
		while (offsetEl && offsetEl !== container) {
			bt += offsetEl.offsetTop;
			offsetEl = offsetEl.offsetParent;
		}

		const menuHeight_bottom = this._w.innerHeight - (containerTop - scrollTop + bt + target.offsetHeight);
		if (menuHeight_bottom < elHeight) {
			let menuTop = -1 * (elHeight - bt + 3);
			const insTop = containerTop - scrollTop + menuTop;
			const menuHeight_top = elHeight + (insTop < 0 ? insTop : 0);

			if (menuHeight_top > menuHeight_bottom) {
				element.style.height = menuHeight_top + 'px';
				menuTop = -1 * (menuHeight_top - bt + 3);
			} else {
				element.style.height = menuHeight_bottom + 'px';
				menuTop = bt + target.offsetHeight;
			}

			element.style.top = menuTop + 'px';
		} else {
			element.style.top = bt + target.offsetHeight + 'px';
		}
	},

	constructor: Offset
};

export default Offset;
