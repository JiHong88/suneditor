/**
 * @fileoverview Offset class
 */

import { getParentElement, isWysiwygFrame, hasClass, addClass, removeClass, getViewportSize } from '../../helper/domUtils';
import { domUtils, numbers } from '../../helper';
import { _w, _d } from '../../helper/env';

const Offset = function (editor) {
	this.editor = editor;
	this.options = editor.options;
	this.context = editor.context;
	this._scrollEvent = null;
	this._elTop = 0;
	this._scrollY = 0;
	this._isFixed = false;
};

Offset.prototype = {
	/**
	 * @description Returns the position of the argument, "this.editor.frameContext.get('wrapper')" to inside the editor.Returns the position of the element in "this.editor.frameContext.get('wrapper')".
	 * @param {Node} node Target node
	 * @returns {{top:boolean, left:boolean}}
	 */
	get(node) {
		let offsetLeft = 0;
		let offsetTop = 0;
		let offsetElement = node.nodeType === 3 ? node.parentElement : node;
		const wysiwyg = getParentElement(node, isWysiwygFrame.bind(this));
		const self = offsetElement;

		while (offsetElement && !hasClass(offsetElement, 'se-wrapper') && offsetElement !== wysiwyg) {
			offsetLeft += offsetElement.offsetLeft - (self !== offsetElement ? offsetElement.scrollLeft : 0);
			offsetTop += offsetElement.offsetTop + (self !== offsetElement ? offsetElement.scrollTop : 0);
			offsetElement = offsetElement.offsetParent;
		}

		const wFrame = this.editor.frameContext.get('wysiwygFrame');
		const iframe = /iframe/i.test(wFrame?.nodeName);

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
	getGlobal(element) {
		const topArea = this.editor.frameContext.get('topArea');
		let isTop = false;
		let targetAbs = false;
		if (!element) element = topArea;
		if (element === topArea) isTop = true;
		if (!isTop && element.nodeType === 1) {
			targetAbs = _w.getComputedStyle(element).position === 'absolute';
		}

		const w = element.offsetWidth;
		const h = element.offsetHeight;
		let t = 0,
			l = 0,
			st = 0,
			sl = 0;

		while (element) {
			t += element.offsetTop;
			l += element.offsetLeft;
			st += element.scrollTop;
			sl += element.scrollLeft;
			element = element.offsetParent;
		}

		if (!targetAbs && !isTop && /^iframe$/i.test(this.editor.frameContext.get('wysiwygFrame').nodeName)) {
			element = this.editor.frameContext.get('wrapper');
			while (element) {
				t += element.offsetTop;
				l += element.offsetLeft;
				element = element.offsetParent;
			}
		}

		return {
			top: t + st,
			left: l + sl,
			width: w,
			height: h,
			scrollTop: st,
			scrollLeft: sl
		};
	},

	/**
	 * @description Gets the current editor-relative scroll offset.
	 * @param {Element} element Target element
	 * @returns {{top:boolean, left:boolean, width:boolean, height:boolean}}
	 */
	getGlobalScroll(element) {
		const topArea = this.editor.frameContext.get('topArea');
		let isTop = false;
		let targetAbs = false;
		if (!element) element = topArea;
		if (element === topArea) isTop = true;
		if (!isTop && element.nodeType === 1) {
			targetAbs = _w.getComputedStyle(element).position === 'absolute';
		}

		let t = 0,
			l = 0,
			h = 0,
			w = 0,
			x = 0,
			y = 0,
			oh = 0,
			ow = 0,
			ohOffsetEl = null,
			owOffsetEl = null,
			ohel = null,
			owel = null,
			el = element;

		while (el) {
			t += el.scrollTop;
			l += el.scrollLeft;
			h += el.scrollHeight;
			w += el.scrollWidth;
			if (el.scrollTop > 0) {
				y += el.offsetTop;
			}
			if (el.scrollHeight > el.clientHeight) {
				oh = /^html$/i.test(el.nodeName) ? oh || el.clientHeight : el.clientHeight + (ohel ? -ohel.clientTop : 0);
				ohOffsetEl = ohel || ohOffsetEl || el;
				ohel = el;
			}
			if (el.scrollLeft > 0) {
				x += el.offsetLeft;
			}
			if (el.scrollWidth > el.clientWidth) {
				ow = /^html$/i.test(el.nodeName) ? ow || el.clientWidth : el.clientWidth + (owel ? -owel.clientLeft : 0);
				owOffsetEl = owel || owOffsetEl || el;
				owel = el;
			}
			el = el.parentElement;
		}

		if (!targetAbs && !isTop && /^iframe$/i.test(this.editor.frameContext.get('wysiwygFrame').nodeName)) {
			el = this.editor.frameContext.get('wrapper');
			ohOffsetEl = owOffsetEl = topArea;
			while (el) {
				t += el.scrollTop;
				l += el.scrollLeft;
				h += el.scrollHeight;
				w += el.scrollWidth;
				if (el.scrollTop > 0) {
					y += el.offsetTop;
				}
				if (el.scrollHeight > el.clientHeight) {
					oh = /^html$/i.test(el.nodeName) ? oh || el.clientHeight : el.clientHeight + (ohel ? -ohel.clientTop : 0);
					ohel = el;
				}
				if (el.scrollLeft > 0) {
					x += el.offsetLeft;
				}
				if (el.scrollWidth > el.clientWidth) {
					ow = /^html$/i.test(el.nodeName) ? ow || el.clientWidth : el.clientWidth + (owel ? -owel.clientLeft : 0);
					owel = el;
				}
				el = el.parentElement;
			}
		}

		el = this._shadowRoot?.host;
		if (el) ohOffsetEl = owOffsetEl = topArea;
		while (el) {
			t += el.scrollTop;
			l += el.scrollLeft;
			h += el.scrollHeight;
			w += el.scrollWidth;
			if (el.scrollTop > 0) {
				y += el.offsetTop;
			}
			if (el.scrollHeight > el.clientHeight) {
				oh = /^html$/i.test(el.nodeName) ? oh || el.clientHeight : el.clientHeight + (ohel ? -ohel.clientTop : 0);
				ohel = el;
			}
			if (el.scrollLeft > 0) {
				x += el.offsetLeft;
			}
			if (el.scrollWidth > el.clientWidth) {
				ow = /^html$/i.test(el.nodeName) ? ow || el.clientWidth : el.clientWidth + (owel ? -owel.clientLeft : 0);
				owel = el;
			}
			el = el.parentElement;
		}

		const heightEditorRefer = topArea.contains(ohOffsetEl);
		const widthEditorRefer = topArea.contains(owOffsetEl);
		ohOffsetEl = heightEditorRefer ? topArea : ohOffsetEl;
		owOffsetEl = widthEditorRefer ? topArea : owOffsetEl;
		const ts = !ohOffsetEl ? 0 : ohOffsetEl.getBoundingClientRect().top + (!ohOffsetEl.parentElement || /^html$/i.test(ohOffsetEl.parentElement.nodeName) ? _w.scrollY : 0);
		const ls = !owOffsetEl ? 0 : owOffsetEl.getBoundingClientRect().left + (!owOffsetEl.parentElement || /^html$/i.test(owOffsetEl.parentElement.nodeName) ? _w.scrollX : 0);

		oh = heightEditorRefer ? topArea.clientHeight : oh;
		ow = widthEditorRefer ? topArea.clientWidth : ow;

		const viewportSize = getViewportSize(this.editor.frameContext.get('_wd'));
		return {
			top: t,
			ts: ts,
			left: l,
			ls: ls,
			width: w,
			height: h,
			x: x,
			y: y,
			ohOffsetEl: targetAbs ? window : ohOffsetEl,
			owOffsetEl: targetAbs ? window : owOffsetEl,
			oh: targetAbs ? viewportSize.h : oh,
			ow: targetAbs ? viewportSize.w : ow,
			heightEditorRefer: heightEditorRefer,
			widthEditorRefer: widthEditorRefer
		};
	},

	/**
	 * @description Get the scroll info of the WYSIWYG area.
	 * @returns {{top:boolean, left:boolean}}
	 */
	getWWScroll() {
		const eventWysiwyg = this.editor.frameContext.get('wysiwyg');
		const rects = this.editor.selection.getRects(eventWysiwyg, 'start').rects;
		const top = eventWysiwyg.scrollY || eventWysiwyg.scrollTop || 0;
		const height = eventWysiwyg.scrollHeight || 0;

		return {
			top,
			left: eventWysiwyg.scrollX || eventWysiwyg.scrollLeft || 0,
			width: eventWysiwyg.scrollWidth || 0,
			height,
			bottom: top + height,
			rects
		};
	},

	setRelPosition(element, e_container, target, t_container, _reload) {
		if (!_reload) {
			this.__removeGlobalEvent();
			this._scrollEvent = this.editor.eventManager.addGlobalEvent('scroll', FixedScroll.bind(this, element, e_container, target, t_container), false);
		}

		this._scrollY = _w.scrollY;
		let wy = 0;
		if ((this._isFixed = /^fixed$/i.test(_w.getComputedStyle(t_container).position))) {
			wy += this._scrollY;
		}

		const ew = element.offsetWidth;
		const tw = target.offsetWidth;
		const tl = this.getGlobal(target).left;
		const tcleft = this.getGlobal(t_container).left;

		// left
		if (this.options.get('_rtl')) {
			const rtlW = ew > tw ? ew - tw : 0;
			const rtlL = rtlW > 0 ? 0 : tw - ew;
			element.style.left = `${tl - rtlW + rtlL + tcleft}px`;
			if (tcleft > this.getGlobal(element).left) {
				element.style.left = tcleft + 'px';
			}
		} else {
			const cw = t_container.offsetWidth;
			const overLeft = cw <= ew ? 0 : cw - (tl + ew);
			if (overLeft < 0) element.style.left = `${tl + overLeft + tcleft}px`;
			else element.style.left = `${tl}px`;
		}

		// top
		const isSameContainer = t_container.contains(element);
		const containerTop = isSameContainer ? this.getGlobal(e_container).top : 0;
		const elHeight = element.offsetHeight;
		const scrollTop = this.getGlobalScroll().top;
		let bt = wy;
		let offsetEl = target;
		while (offsetEl && offsetEl !== e_container) {
			bt += offsetEl.offsetTop;
			offsetEl = offsetEl.offsetParent;
		}

		const menuHeight_bottom = getViewportSize(this.editor.frameContext.get('_wd')).h - (containerTop - scrollTop + bt + target.offsetHeight);
		if (menuHeight_bottom < elHeight) {
			let menuTop = -1 * (elHeight - bt + 3);
			const insTop = containerTop - scrollTop + menuTop;
			const menuHeight_top = elHeight + (insTop < 0 ? insTop : 0);

			if (menuHeight_top > menuHeight_bottom) {
				element.style.height = `${menuHeight_top}px`;
				menuTop = -1 * (menuHeight_top - bt + 3);
			} else {
				element.style.height = `${menuHeight_bottom}px`;
				menuTop = bt + target.offsetHeight;
			}

			element.style.top = `${menuTop}px`;
		} else {
			element.style.top = `${bt + target.offsetHeight}px`;
		}

		if (/^fixed$/i.test(_w.getComputedStyle(t_container).position)) {
			this._elTop = element.offsetTop;
		}
	},

	setAbsPosition(element, target, params) {
		const addOffset = params.addOffset || {
			left: 0,
			top: 0
		};
		const position = params.position || 'bottom';
		const inst = params.inst;
		const isLTR = !this.options.get('_rtl');

		if (!isLTR) {
			addOffset.left *= -1;
		}

		const isWWTarget = this.editor.frameContext.get('wrapper').contains(target) || params.isWWTarget;
		const isCtrlTarget = domUtils.getParentElement(target, '.se-controller');
		const viewportSize = getViewportSize(_d);
		const wwScroll = isWWTarget && !isCtrlTarget ? this.getWWScroll() : this._getWindowScroll();
		const targetRect = isCtrlTarget ? target.getBoundingClientRect() : this.editor.selection.getRects(target, 'start').rects;
		const targetOffset = this.getGlobal(target);
		const arrow = hasClass(element.firstElementChild, 'se-arrow') ? element.firstElementChild : null;
		const isIframe = isWWTarget && !isCtrlTarget && this.editor.frameOptions.get('iframe');

		// top ----------------------------------------------------------------------------------------------------
		const ah = arrow ? arrow.offsetHeight : 0;
		const elH = element.offsetHeight;
		const targetH = target.offsetHeight;
		// margin
		const tmtw = targetRect.top;
		const tmbw = viewportSize.h - targetRect.bottom;
		const toolbarH = !this.editor.toolbar._sticky && (this.editor.isBalloon || this.editor.isInline) ? 0 : this.context.get('toolbar.main').offsetHeight;
		let rmt, rmb;
		if (this.editor.frameContext.get('isFullScreen')) {
			rmt = tmtw - toolbarH;
			rmb = tmbw;
		} else {
			const tMargin = targetRect.top;
			const bMargin = viewportSize.h - targetRect.bottom;

			if (isIframe) {
				const editorOffset = this.getGlobal();
				const editorScroll = this.getGlobalScroll();
				const emt = editorOffset.top - editorScroll.top - editorScroll.ts;
				const editorH = this.editor.frameContext.get('topArea').offsetHeight;
				rmt = targetRect.top - emt;
				rmb = bMargin - (editorScroll.oh - (editorH + emt) + (this.editor.frameContext.get('statusbar')?.offsetHeight || 0));
			} else {
				rmt = targetRect.top - wwScroll.rects.top;
				rmb = wwScroll.rects.bottom - targetRect.bottom;
			}

			// display margin
			rmt = (rmt > 0 ? tMargin : rmt) - toolbarH;
			rmb = rmb > 0 ? bMargin : rmb;
		}

		if (isWWTarget && (rmb + targetH <= 0 || rmt + targetH <= 0)) return;

		let t = addOffset.top;
		let y = 0;
		let arrowDir = '';
		if (position === 'bottom') {
			arrowDir = 'up';
			t += targetRect.bottom + ah + _w.scrollY;
			y = rmb - (elH + ah);
			if (y < 0) {
				arrowDir = 'down';
				t -= targetH + elH + ah * 2;
				y = rmt - (elH + ah);
				if (y < 0) {
					arrowDir = '';
					t -= y;
				}
			}
		} else {
			arrowDir = 'down';
			t += targetRect.top - elH - ah + _w.scrollY;
			y = rmt - (elH + ah);
			if (y < 0) {
				arrowDir = 'up';
				t += targetH + elH + ah * 2;
				y = rmb - (elH + ah);
				if (y < 0) {
					arrowDir = '';
					t += y;
				}
			}
		}

		this._setArrow(arrow, arrowDir);
		element.style.top = `${t}px`;

		// left ----------------------------------------------------------------------------------------------------
		const radius = (element.nodeType === 1 ? numbers.get(_w.getComputedStyle(element).borderRadius) : 0) || 0;
		const targetW = targetOffset.width;
		const elW = element.offsetWidth;
		const aw = arrow ? arrow.offsetWidth : 0;
		// margin
		const tmlw = targetRect.left;
		const tmrw = viewportSize.w - targetRect.right;
		let rml, rmr;
		if (this.editor.frameContext.get('isFullScreen')) {
			rml = tmlw;
			rmr = tmrw;
		} else {
			rml = targetRect.left;
			rmr = viewportSize.w - targetRect.right;
		}

		if (isWWTarget && (rml + targetW <= 0 || rmr + targetW <= 0)) return;
		if (arrow) {
			arrow.style.left = '';
			arrow.style.right = '';
		}

		let l = addOffset.left;
		let x = 0;
		let ax = 0;
		let awLimit = 0;
		if (isLTR) {
			l += targetRect.left + _w.scrollX - (rml < 0 ? rml : 0);
			x = targetW + rml;
			if (x < aw) {
				awLimit = aw / 2 - 1 + (radius <= 2 ? 0 : radius - 2);
				ax = awLimit;
			}
			x = targetW + rmr - elW;
			if (x < 0) {
				l += x;
				awLimit = elW - 1 - (aw / 2 + (radius <= 2 ? 0 : radius - 2));
				ax = -(x - aw / 2);
				ax = ax > awLimit ? awLimit : ax;
			}
			if (arrow && ax > 0) arrow.style.left = ax + 'px';
		} else {
			l += targetRect.right - elW + _w.scrollX + (rmr < 0 ? rmr : 0);
			x = targetW + rmr;
			if (x < aw) {
				awLimit = aw / 2 - 1 + (radius <= 2 ? 0 : radius - 2);
				ax = awLimit;
			}
			x = targetW + rml - elW;
			if (x < 0) {
				l -= x;
				awLimit = aw / 2 - 1 + (radius <= 2 ? 0 : radius - 2);
				ax = -(x - aw / 2);
				ax = ax < awLimit ? awLimit : ax > elW - awLimit ? elW - awLimit : ax;
			}
			if (arrow && ax > 0) arrow.style.right = ax + 'px';
		}

		element.style.left = `${l}px`;
		inst.__offset = {
			left: element.offsetLeft + wwScroll.left,
			top: element.offsetTop + wwScroll.top,
			addOffset: addOffset
		};

		return true;
	},

	_setArrow(arrow, key) {
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

	_getWindowScroll() {
		return {
			top: _w.scrollY,
			left: _w.scrollX,
			width: _w.innerWidth,
			height: _w.innerHeight,
			rects: {
				left: 0,
				top: 0,
				right: _w.innerWidth,
				bottom: _w.innerHeight,
				noText: true
			}
		};
	},

	__removeGlobalEvent() {
		if (this._scrollEvent) {
			this._scrollEvent = this.editor.eventManager.removeGlobalEvent(this._scrollEvent);
			this._scrollY = 0;
			this._elTop = null;
		}
	},

	constructor: Offset
};

function FixedScroll(element, e_container, target, t_container) {
	const isFixed = /^fixed$/i.test(_w.getComputedStyle(t_container).position);
	if (!this._isFixed) {
		if (isFixed) {
			this.setRelPosition(element, e_container, target, t_container, true);
		}
		return;
	} else if (!isFixed) {
		this.setRelPosition(element, e_container, target, t_container, true);
		return;
	}

	element.style.top = `${this._elTop - (this._scrollY - _w.scrollY - t_container.offsetTop)}px`;
}

export default Offset;
