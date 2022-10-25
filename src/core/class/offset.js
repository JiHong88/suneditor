/**
 * @fileoverview Offset class
 * @author Yi JiHong.
 */

import CoreInterface from '../../interface/_core';
import { getParentElement, isWysiwygFrame, hasClass, addClass, removeClass } from '../../helper/domUtils';
import { numbers } from '../../helper';

const Offset = function (editor) {
	CoreInterface.call(this, editor);
};

Offset.prototype = {
	/**
	 * @description Returns the position of the argument, "context.element.editorArea" to inside the editor.Returns the position of the element in "context.element.editorArea".
	 * @param {Node} node Target node
	 * @returns {{top:boolean, left:boolean}}
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
	 * @returns {{top:boolean, left:boolean}}
	 */
	getGlobal: function (element) {
		if (!element) element = this.context.element.topArea;
		let t = 0,
			l = 0,
			s = 0;

		while (element) {
			t += element.offsetTop;
			l += element.offsetLeft;
			element = element.offsetParent;
		}

		return {
			top: t,
			left: l
		};
	},

	/**
	 * @description Gets the current editor-relative scroll offset.
	 * @param {Element} element Target element
	 * @returns {{top:boolean, left:boolean, width:boolean, height:boolean}}
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

	/**
	 * @description Get the scroll info of the WYSIWYG area.
	 * @returns {{top:boolean, left:boolean}}
	 */
	getWWScroll: function () {
		return {
			top: this.context.element.eventWysiwyg.scrollY || this.context.element.eventWysiwyg.scrollTop || 0,
			left: this.context.element.eventWysiwyg.scrollX || this.context.element.eventWysiwyg.scrollLeft || 0
		};
	},

	setRelPosition: function (element, target, container) {
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

	setAbsPosition: function (element, target, container, params) {
		const addOffset = params.addOffset || { left: 0, top: 0 };
		const position = params.position || 'bottom';
		const inst = params.inst;
		const targetOffset = this._getRelTargetOffset(target);
		const frameOffset = this.getGlobal(this.context.element.wysiwygFrame);

		if (this.options._rtl) {
			addOffset.left *= -1;
		}

		const targetAbs = this._w.getComputedStyle(target).position === 'absolute';
		const offset = this.getGlobal(target);
		const elW = element.offsetWidth;
		const radius = numbers.get(this._w.getComputedStyle(element).borderRadius) || 0;
		const arrow = hasClass(element.firstElementChild, 'se-arrow') ? element.firstElementChild : null;
		const aw = arrow ? arrow.offsetWidth : 0;
		const awHalf = aw / 2;

		// top
		element.style.top = this._getAbsMargin(position, element, target, arrow, targetOffset.top + addOffset.top, targetAbs) + 'px';

		// left
		const wwScroll = this.getWWScroll();
		const l = offset.left + targetOffset.left + addOffset.left;
		const referElW = target.offsetWidth;
		const ml = this.getGlobal(this.context.element.topArea).left + this.editor._editorPadding.left;
		const sl = this._getLeftSceollMargin(ml);
		// left margin
		if (this.options._rtl) {
			const rtlW = elW > referElW ? elW - referElW : 0;
			const rtlL = rtlW > 0 ? 0 : referElW - elW;
			element.style.left = l - rtlW + rtlL + sl + 'px';

			if (rtlW > 0) {
				if (arrow) arrow.style.left = (elW - awHalf < awHalf + rtlW ? elW - awHalf - radius : awHalf - radius + rtlW) + 'px';
			}

			const overSize = container.offsetLeft - element.offsetLeft;
			if (overSize > 0) {
				element.style.left = frameOffset.left + 'px';
				if (arrow) arrow.style.left = overSize + 'px';
			}
		} else {
			element.style.left = l + sl + 'px';

			const overSize = container.offsetWidth - (element.offsetLeft + elW);
			if (overSize < 0) {
				element.style.left = element.offsetLeft + overSize + 'px';
				if (arrow) arrow.style.left = aw - overSize + 'px';
			} else {
				if (arrow) arrow.style.left = (target.offsetWidth <= aw + awHalf ? awHalf + radius : aw) + 'px';
			}
		}

		inst.__offset = { left: element.offsetLeft + wwScroll.left, top: element.offsetTop + wwScroll.top, addOffset: addOffset, sl: sl, ml: ml, targetAbs: targetAbs };
	},

	_resetControllerOffset: function (cont) {
		if (cont.notInCarrier) return;

		const arrow = hasClass(cont.form.firstElementChild, 'se-arrow') ? cont.form.firstElementChild : null;
		const element = cont.form;
		const __offset = cont.inst.__offset;
		const y = this._getAbsMargin(cont.position, element, cont.target, arrow, (__offset.addOffset.top || 0) + this._getRelTargetOffset(cont.target).top, __offset.targetAbs);
		if (element.offsetTop !== y) {
			element.style.top = y + 'px';
		}
		const sl = this._getLeftSceollMargin(__offset.ml);
		if (sl - __offset.sl !== 0) {
			element.style.left = element.offsetLeft + (sl - __offset.sl) + 'px';
		}
	},

	_getAbsMargin: function (position, element, target, arrow, addTop, targetAbs) {
		const targetH = target.offsetHeight;
		const offset = this.getGlobal(target);
		const targetScroll = this.getGlobalScroll(target);
		const wMarginT = this.getGlobalScroll().top - this._w.scrollY;
		const wwH = this.context.element.wysiwygFrame.offsetHeight;

		if (targetAbs) {
			if (this._w.scrollY + this._w.innerHeight - offset.top < 0) return -10000;
			if (this.editor.toolbar._sticky) {
				let th = this.getGlobal(this.context.toolbar.main).top;
				th = th < 0 ? 0 : th + this.context.toolbar.main.offsetHeight;
				if (offset.top + targetH - (this._w.scrollY + th) < 0) return -10000;
			} else {
				const wwTop = this.getGlobal(this.context.element.wysiwygFrame).top;
				if (offset.top + targetH - wwTop < 1 || wwTop + wwH - offset.top < 1) return -10000;
			}
		} else {
			const wwScrollTop = this.getWWScroll().top;
			const targetT = target.offsetTop;
			if (targetT + targetH - wwScrollTop < 1 || wwScrollTop + wwH - targetT < 1) return -10000;
		}

		const arrowH = arrow ? arrow.offsetHeight : 0;
		const elementH = element.offsetHeight;
		const editorTop = this.getGlobal().top;
		const globalTop = this.getGlobalScroll().top;
		let elementT = targetH + offset.top + (position === 'top' ? -(elementH + targetH + arrowH) : arrowH) + addTop - (targetScroll.top - this._w.scrollY);
		let y = 0;

		if (position === 'bottom') {
			this._setArrow(arrow, 'up');
			y = this._getAbsBottomMargin(elementT, elementH, targetH, arrowH, editorTop, globalTop);
			if (y < 0) {
				elementT += y;
				y = this._getAbsTopMargin(elementT, elementH, targetH, arrowH, editorTop, globalTop);
				if (y > 0) {
					this._setArrow(arrow, '');
					elementT += elementH + arrowH;
					let overMargin = targetScroll.top - (elementT + wMarginT);
					if (overMargin > 0) elementT += overMargin;
					overMargin = this._w.scrollY - (elementT + wMarginT);
					if (overMargin > 0) elementT += overMargin;
				} else {
					this._setArrow(arrow, 'down');
				}
			}
		} else {
			this._setArrow(arrow, 'down');
			let y = this._getAbsTopMargin(elementT, elementH, targetH, arrowH, editorTop, globalTop);
			if (y > 0) {
				elementT += y;
				y = this._getAbsBottomMargin(elementT, elementH, targetH, arrowH, editorTop, globalTop);
				if (y < 0) {
					this._setArrow(arrow, '');
					elementT -= elementH + arrowH;
					let overMargin = targetScroll.top + this.context.element.topArea.offsetHeight - (elementT + wMarginT + elementH);
					if (overMargin < 0) elementT += overMargin;
					overMargin = this._w.innerHeight + this._w.scrollY - (elementT + wMarginT + elementH);
					if (overMargin < 0) elementT += overMargin;
				} else {
					this._setArrow(arrow, 'up');
				}
			}
		}

		return elementT;
	},

	_getLeftSceollMargin: function (ml) {
		const sl = (this.options._rtl ? -1 : 1) * this.getWWScroll().left - ml;
		return sl < 0 ? 0 : (this.options._rtl ? -1 : 1) * sl;
	},

	_getRelTargetOffset: function (target) {
		if (this._w.getComputedStyle(target).position === 'absolute') return { top: 0, left: 0 };

		const eventWysiwyg = this.context.element.eventWysiwyg;
		const wwScrollY = eventWysiwyg.scrollY || eventWysiwyg.scrollTop || 0;
		const wwScrollX = eventWysiwyg.scrollX || eventWysiwyg.scrollLeft || 0;
		let gt = 0;
		let gl = 0;

		if (this.options.iframe) {
			const frameOffset = this.getGlobal(this.context.element.wysiwygFrame);
			gt += this._w.scrollY - wwScrollY + frameOffset.top - this._w.scrollY;
			gl += this._w.scrollX - wwScrollX + frameOffset.left - this._w.scrollX;
		} else {
			gt -= wwScrollY;
			gl -= wwScrollX;
		}

		return {
			top: gt,
			left: gl
		};
	},

	_getAbsBottomMargin: function (elementT, elementH, targetH, arrowH, editorTop, globalTop) {
		const margin_y = editorTop + this.context.element.topArea.offsetHeight - (elementT + (globalTop - this._w.scrollY) + elementH);
		const margin_y_window = this._w.innerHeight - (elementT - globalTop + elementH);
		if (margin_y < 0 || margin_y_window < 0) {
			return -(arrowH * 2 + targetH + elementH);
		} else {
			return 0;
		}
	},

	_getAbsTopMargin: function (elementT, elementH, targetH, arrowH, editorTop, globalTop) {
		const margin_y = elementT + (globalTop - this._w.scrollY) - editorTop;
		const margin_y_window = elementT - globalTop;
		if (margin_y < 0 || margin_y_window < 0) {
			return arrowH * 2 + targetH + elementH;
		} else {
			return 0;
		}
	},

	_setArrow: function (arrow, key) {
		if (key === 'up') {
			if (arrow) arrow.style.visibility = '';
			addClass(arrow, 'se-arrow-up');
			removeClass(arrow, 'se-arrow-down');
		} else if (key === 'down') {
			if (arrow) arrow.style.visibility = '';
			addClass(arrow, 'se-arrow-down');
			removeClass(arrow, 'se-arrow-up');
		} else {
			if (arrow) arrow.style.visibility = 'hidden';
		}
	},

	constructor: Offset
};

export default Offset;
