/**
 * @fileoverview Offset class
 * @author Yi JiHong.
 */

import CoreInterface from '../../interface/_core';
import { getParentElement, isWysiwygFrame, hasClass, addClass, removeClass, getScrollParent } from '../../helper/domUtils';
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
		const w = element.offsetWidth;
		const h = element.offsetHeight;
		let t = 0,
			l = 0;

		while (element) {
			t += element.offsetTop;
			l += element.offsetLeft;
			element = element.offsetParent;
		}

		return {
			top: t,
			left: l,
			width: w,
			height: h
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
			w = 0,
			x = 0,
			y = 0,
			ow = 0,
			oh = 0,
			owel = null,
			ohel = null,
			el = element || this.context.element.topArea;

		while (el) {
			t += el.scrollTop;
			l += el.scrollLeft;
			h += el.scrollHeight;
			w += el.scrollWidth;
			if (el.scrollTop > 0) {
				y += el.offsetTop;
			}
			if (el.scrollHeight > el.offsetHeight) {
				oh = el.offsetHeight + (ohel ? -ohel.offsetTop : 0);
				ohel = el;
			}
			if (el.scrollLeft > 0) {
				x += el.offsetLeft;
			}
			if (el.scrollWidth > el.offsetWidth) {
				ow = el.offsetWidth + (owel ? -owel.offsetLeft : 0);
				owel = el;
			}
			el = el.parentElement;
		}

		el = this.shadowRoot ? this.shadowRoot.host : null;
		while (el) {
			t += el.scrollTop;
			l += el.scrollLeft;
			h += el.scrollHeight;
			w += el.scrollWidth;
			if (el.scrollTop > 0) {
				y += el.offsetTop;
			}
			if (el.scrollHeight > el.offsetHeight) {
				oh = el.offsetHeight + (ohel ? -ohel.offsetTop : 0);
				ohel = el;
			}
			if (el.scrollLeft > 0) {
				x += el.offsetLeft;
			}
			if (el.scrollWidth > el.offsetWidth) {
				ow = el.offsetWidth + (owel ? -owel.offsetLeft : 0);
				owel = el;
			}
			el = el.parentElement;
		}

		return {
			top: t,
			left: l,
			width: w,
			height: h,
			x: x,
			y: y,
			ow: ow,
			oh: oh
		};
	},

	/**
	 * @description Get the scroll info of the WYSIWYG area.
	 * @returns {{top:boolean, left:boolean}}
	 */
	getWWScroll: function () {
		return {
			top: this.context.element.eventWysiwyg.scrollY || this.context.element.eventWysiwyg.scrollTop || 0,
			left: this.context.element.eventWysiwyg.scrollX || this.context.element.eventWysiwyg.scrollLeft || 0,
			width: this.context.element.eventWysiwyg.scrollWidth || 0,
			height: this.context.element.eventWysiwyg.scrollHeight || 0
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

		if (this.options._rtl) {
			addOffset.left *= -1;
		}

		const frameOffset = this.getGlobal(this.context.element.wysiwygFrame);
		const wwScroll = this.getWWScroll();
		const editorOffset = this.getGlobal();
		const targetRect = target.getBoundingClientRect();
		const targetAbs = this._w.getComputedStyle(target).position === 'absolute';
		const targetOffset = this.getGlobal(target);
		const targetW = targetOffset.width;
		const targetLeft = targetOffset.left;
		const targetScroll = this.getGlobalScroll(target);
		const elW = element.offsetWidth;
		const radius = numbers.get(this._w.getComputedStyle(element).borderRadius) || 0;
		const arrow = hasClass(element.firstElementChild, 'se-arrow') ? element.firstElementChild : null;
		if (arrow) arrow.style.left = '';
		const aw = arrow ? arrow.offsetWidth : 0;
		const awHalf = aw / 2;

		// left ----------------------------------------------------------------------------------------------------
		const editorLeft = editorOffset.left;
		const editorW = this.context.element.topArea.offsetWidth;
		let l = addOffset.left;
		let ml = 0,
			sl = 0;

		if (!this.options._rtl) {
			l += targetRect.left + this._w.scrollX;
			const padding = targetOffset.left - editorLeft + wwScroll.left;
			const paddingMargin = padding - wwScroll.left;
			ml = targetAbs ? editorLeft - targetScroll.left + (paddingMargin < 0 ? 0 : paddingMargin) : targetLeft - editorLeft;
			sl = targetAbs ? (ml < 0 && paddingMargin < 0 ? -1 * (ml + paddingMargin) : ml < 0 ? -1 * (targetScroll.left - targetLeft - wwScroll.left) : paddingMargin < 0 ? wwScroll.left - padding : 0) : this._getLeftScrollMargin(l, ml, targetAbs, editorOffset, wwScroll);

			if (sl >= targetW) {
				this._hideAbsEl(element);
				return;
			}
			element.style.left = l + sl + 'px';

			const overSize = container.offsetWidth - (element.offsetLeft + elW);
			if (overSize < 0) {
				element.style.left = element.offsetLeft + overSize + 'px';
				if (arrow) arrow.style.left = (aw - overSize + awHalf > elW ? elW - awHalf - radius : aw - overSize) + 'px';
			} else if (arrow) {
				arrow.style.left = (targetW <= aw + awHalf ? awHalf + radius : aw) + 'px';
			}
		} else {
			l += targetRect.right - elW + this._w.scrollX;
			const padding = editorLeft + editorW - (targetOffset.left + targetW) - wwScroll.left;
			const paddingMargin = padding + wwScroll.left;
			ml = targetAbs ? targetScroll.ow - (editorLeft + editorW - targetScroll.left) + (paddingMargin < 0 ? 0 : paddingMargin) : editorW + padding - (targetLeft + targetW) - (editorW - (editorLeft + editorW));
			sl = targetAbs ? (ml < 0 && paddingMargin < 0 ? ml + paddingMargin : ml < 0 ? ml + (ml <= -padding ? 0 : -padding) : paddingMargin < 0 ? wwScroll.left + padding : 0) : this._getLeftScrollMargin(l, ml, targetAbs, editorOffset, wwScroll);

			if (-sl >= targetW) {
				this._hideAbsEl(element);
				return;
			}
			element.style.left = l + sl + 'px';

			const overSize = container.offsetLeft - element.offsetLeft;
			if (overSize > 0) {
				element.style.left = frameOffset.left + 'px';
				if (arrow) arrow.style.left = elW - aw * 2 - overSize + 'px';
			} else if (arrow) {
				if (elW - (arrow.offsetLeft + awHalf) >= targetW) {
					arrow.style.left = elW - aw - radius + 'px';
				}
			}
		}

		// top ----------------------------------------------------------------------------------------------------
		const targetRelOffset = this._getRelTargetOffset(target);
		const editorScroll = this.getGlobalScroll();
		const globalTop = editorScroll.top;
		const targetH = target.offsetHeight;
		const offset = this.getGlobal(target);
		const wwH = this.context.element.wysiwygFrame.offsetHeight;
		const arrowH = arrow ? arrow.offsetHeight : 0;
		const elementH = element.offsetHeight;
		const editorTop = editorOffset.top;
		const editorH = this.context.element.topArea.offsetHeight;
		const initialT = getScrollParent(this.context.element.topArea) ? targetScroll.top - this._w.scrollY : 0;
		let wMarginT = 0;
		let hide = false;

		if (targetAbs) {
			if (this._w.scrollY + this._w.innerHeight - offset.top < 0) {
				hide = true;
			} else if (this.editor.toolbar._sticky) {
				let th = this.getGlobal(this.context.toolbar.main).top;
				th = th < 0 ? 0 : th + this.context.toolbar.main.offsetHeight;
				if (offset.top + targetH - (this._w.scrollY + th) < 0) hide = true;
			} else {
				const wwTop = this.getGlobal(this.context.element.wysiwygFrame).top;
				if (offset.top + targetH - wwTop < 1 || wwTop + wwH - offset.top < 1) hide = true;
			}
			wMarginT = globalTop - this._w.scrollY;
		} else {
			const wwScrollTop = this.getWWScroll().top;
			const targetT = target.offsetTop;
			if (targetT + targetH - wwScrollTop < 1 || wwScrollTop + wwH - targetT < 1) hide = true;
		}

		if (hide) {
			this._hideAbsEl(element);
			return;
		}

		let t = targetH + offset.top + (position === 'top' ? -(elementH + targetH + arrowH) : arrowH) + targetRelOffset.top + addOffset.top - initialT;
		let y = 0;

		if (position === 'bottom') {
			this._setArrow(arrow, 'up');
			const padding = this.editor._editorPadding.top;
			const paddingMargin = editorTop + editorH - (targetOffset.top + targetH);
			ml = targetAbs ? targetScroll.oh - (editorTop + editorH + this._w.scrollY - targetScroll.top - targetScroll.y + padding) + (paddingMargin < 0 ? 0 : paddingMargin) : 0;
			sl = targetAbs ? (ml < 0 && paddingMargin < 0 ? ml + paddingMargin : paddingMargin < 0 ? paddingMargin : ml < 0 ? ml + (ml <= -padding ? 0 : -padding) : padding + wwScroll.top >= 0 ? 0 : paddingMargin) : 0;

			y = this._getAbsBottomMargin(t, elementH, targetH, arrowH, editorTop, globalTop);
			if (y < 0) {
				t += y;
				y = this._getAbsTopMargin(t, elementH, targetH, arrowH, editorTop, globalTop);
				if (y > 0) {
					this._setArrow(arrow, '');
					t += elementH + arrowH;
					let overMargin = targetScroll.top - (t + wMarginT);
					if (overMargin > 0) t += overMargin;
					overMargin = this._w.scrollY - (t + wMarginT);
					if (overMargin > 0) t += overMargin;
				} else {
					this._setArrow(arrow, 'down');
				}
			}
		} else {
			this._setArrow(arrow, 'down');
			let y = this._getAbsTopMargin(t, elementH, targetH, arrowH, editorTop, globalTop);
			if (y > 0) {
				t += y;
				y = this._getAbsBottomMargin(t, elementH, targetH, arrowH, editorTop, globalTop);
				if (y < 0) {
					this._setArrow(arrow, '');
					t -= elementH + arrowH;
					let overMargin = targetScroll.top + this.context.element.topArea.offsetHeight - (t + wMarginT + elementH);
					if (overMargin < 0) t += overMargin;
					overMargin = this._w.innerHeight + this._w.scrollY - (t + wMarginT + elementH);
					if (overMargin < 0) t += overMargin;
				} else {
					this._setArrow(arrow, 'up');
				}
			}
		}

		element.style.top = t + 'px';

		inst.__offset = { left: element.offsetLeft + wwScroll.left, top: element.offsetTop + wwScroll.top, addOffset: addOffset, sl: sl, ml: ml, targetAbs: targetAbs };
	},

	_hideAbsEl: function (element) {
		element.style.display = 'none';
	},

	_getLeftScrollMargin: function (l, ml, targetAbs, editorOffset, wwScroll) {
		const rtlConst = this.options._rtl ? -1 : 1;
		let sl = 0;
		if (rtlConst > 0) {
			if (l >= ml) return 0;
			sl = targetAbs ? ml - l : wwScroll.left - ml;
		} else {
			sl = targetAbs ? editorOffset.left + editorOffset.width : 0;
		}
		return rtlConst * sl < 0 ? 0 : rtlConst * sl;
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

	_getAbsBottomMargin: function (elementT, elementH, targetH, arrowH, editorTop, globalTop, targetAbs) {
		const margin_y = editorTop + this.context.element.topArea.offsetHeight - (elementT + (targetAbs ? globalTop - this._w.scrollY : 0) + elementH);
		const margin_y_window = this._w.innerHeight - (elementT - (targetAbs ? globalTop : this._w.scrollY) + elementH);
		if (margin_y < 0 || margin_y_window < 0) {
			return -(arrowH * 2 + targetH + elementH);
		} else {
			return 0;
		}
	},

	_getAbsTopMargin: function (elementT, elementH, targetH, arrowH, editorTop, globalTop, targetAbs) {
		const margin_y = elementT + (targetAbs ? globalTop - this._w.scrollY : 0) - editorTop;
		const margin_y_window = elementT - (targetAbs ? globalTop : this._w.scrollY);
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
