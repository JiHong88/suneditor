/**
 * @fileoverview Offset class
 */

import { getParentElement, isWysiwygFrame, hasClass, addClass, removeClass } from '../../helper/domUtils';
import { numbers } from '../../helper';

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

		while (offsetElement && !hasClass(offsetElement, 'se-wrapper') && offsetElement !== wysiwyg) {
			offsetLeft += offsetElement.offsetLeft - offsetElement.scrollLeft;
			offsetTop += offsetElement.offsetTop - offsetElement.scrollTop;
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
		if (!isTop) {
			targetAbs = window.getComputedStyle(element).position === 'absolute';
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
		if (!isTop) {
			targetAbs = window.getComputedStyle(element).position === 'absolute';
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

		el = this._shadowRoot ? this._shadowRoot.host : null;
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
		const ts = !ohOffsetEl ? 0 : ohOffsetEl.getBoundingClientRect().top + (!ohOffsetEl.parentElement || /^html$/i.test(ohOffsetEl.parentElement.nodeName) ? window.scrollY : 0);
		const ls = !owOffsetEl
			? 0
			: owOffsetEl.getBoundingClientRect().left + (!owOffsetEl.parentElement || /^html$/i.test(owOffsetEl.parentElement.nodeName) ? window.scrollX : 0);

		return {
			top: t,
			ts: ts,
			left: l,
			ls: ls,
			width: w,
			height: h,
			x: x,
			y: y,
			ohOffsetEl: ohOffsetEl,
			owOffsetEl: owOffsetEl,
			oh: heightEditorRefer ? topArea.clientHeight : oh,
			ow: widthEditorRefer ? topArea.clientWidth : ow,
			heightEditorRefer: heightEditorRefer,
			widthEditorRefer: widthEditorRefer
		};
	},

	/**
	 * @description Get the scroll info of the WYSIWYG area.
	 * @returns {{top:boolean, left:boolean}}
	 */
	getWWScroll() {
		const eventWysiwyg = this.editor.frameContext.get('eventWysiwyg');
		return {
			top: eventWysiwyg.scrollY || eventWysiwyg.scrollTop || 0,
			left: eventWysiwyg.scrollX || eventWysiwyg.scrollLeft || 0,
			width: eventWysiwyg.scrollWidth || 0,
			height: eventWysiwyg.scrollHeight || 0
		};
	},

	setRelPosition(element, e_container, target, t_container, _reload) {
		if (!_reload) {
			this.__removeGlobalEvent();
			this._scrollEvent = this.editor.eventManager.addGlobalEvent('scroll', FixedScroll.bind(this, element, e_container, target, t_container), false);
		}

		this._scrollY = window.scrollY;
		let wy = 0;
		if ((this._isFixed = /^fixed$/i.test(window.getComputedStyle(t_container).position))) {
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

		const menuHeight_bottom = window.innerHeight - (containerTop - scrollTop + bt + target.offsetHeight);
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

		if (/^fixed$/i.test(window.getComputedStyle(t_container).position)) {
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

		const targetAbs = window.getComputedStyle(target).position === 'absolute';
		const wwScroll = this.getWWScroll();
		const editorOffset = this.getGlobal();
		const editorScroll = this.getGlobalScroll();
		const targetRect = this.editor.selection.getRects(target, 'start').rects;
		const targetOffset = this.getGlobal(target);
		const targetScroll = this.getGlobalScroll(target);
		const arrow = hasClass(element.firstElementChild, 'se-arrow') ? element.firstElementChild : null;

		// top ----------------------------------------------------------------------------------------------------
		const editorH = this.editor.frameContext.get('topArea').offsetHeight;
		const ah = arrow ? arrow.offsetHeight : 0;
		const elH = element.offsetHeight;
		const targetH = target.offsetHeight;
		// margin
		const tmtw = targetRect.top;
		const tmbw = window.innerHeight - targetRect.bottom;
		let toolbarH =
			!this.editor.toolbar._sticky && (this.editor.isBalloon || this.editor.isInline || this.options.get('toolbar_container'))
				? 0
				: this.context.get('toolbar.main').offsetHeight;
		let rmt, rmb;
		if (this.editor.frameContext.get('isFullScreen')) {
			rmt = tmtw - toolbarH;
			rmb = tmbw;
		} else {
			// top margin
			const emt = editorOffset.top - editorScroll.top - editorScroll.ts;
			const tmt = targetOffset.top - targetScroll.top - targetScroll.ts;
			const vt = target.offsetTop;
			let etmt = tmt < 0 || emt < 0 || targetScroll.heightEditorRefer || (tmt >= 0 && emt >= 0 && emt > tmt) ? tmt : tmt - emt;
			etmt = vt < 0 && vt < etmt ? vt : etmt;
			// bottom margin
			toolbarH = editorH + emt <= 0 ? toolbarH : 0;
			const emb = editorScroll.oh - (editorH + emt);
			const tmb = targetScroll.oh - (targetH + tmt);
			const vb = editorH - (target.offsetTop + targetH + toolbarH) + (targetAbs ? 0 : wwScroll.top);
			let etmb = tmb < 0 || emb < 0 || targetScroll.heightEditorRefer || (tmb >= 0 && emb >= 0 && emb > tmb) ? tmb : tmb - emb;
			etmb = vb < 0 && vb < etmb ? vb : etmb;
			// marging result
			rmt =
				(etmt < tmtw ? etmt : tmtw) -
				((this.editor.toolbar._sticky && emt < this.context.get('toolbar.main').getBoundingClientRect().bottom) || toolbarH) +
				(!isLTR ? -targetOffset.scrollTop : 0);
			rmb = (etmb < tmbw ? etmb : tmbw) + (isLTR ? targetOffset.scrollTop : 0);
		}

		if (rmb + targetH <= 0 || rmt + targetH <= 0) return;

		let t = addOffset.top;
		let y = 0;
		let arrowDir = '';
		if (position === 'bottom') {
			arrowDir = 'up';
			t += targetRect.bottom + ah + window.scrollY;
			y = rmb - (elH + ah);
			if (y < 0) {
				arrowDir = 'down';
				t -= targetH + elH + ah * 2;
				y = rmt - (elH + ah);
				if (y < 0) {
					arrowDir = '';
					t -= y + (rmt < 0 ? 0 : -rmt);
				}
			}
		} else {
			arrowDir = 'down';
			t += targetRect.top - elH - ah + window.scrollY;
			y = rmt - (elH + ah);
			if (y < 0) {
				arrowDir = 'up';
				t += targetH + elH + ah * 2;
				y = rmb - (elH + ah);
				if (y < 0) {
					arrowDir = '';
					t += y + (rmb < 0 ? 0 : -rmb);
				}
			}
		}

		this._setArrow(arrow, arrowDir);
		element.style.top = `${t}px`;

		// left ----------------------------------------------------------------------------------------------------
		const editorW = this.editor.frameContext.get('topArea').offsetWidth;
		const radius = numbers.get(window.getComputedStyle(element).borderRadius) || 0;
		const targetW = targetOffset.width;
		const elW = element.offsetWidth;
		const aw = arrow ? arrow.offsetWidth : 0;
		// margin
		const tmlw = targetRect.left;
		const tmrw = window.innerWidth - targetRect.right;
		let rml, rmr;
		if (this.editor.frameContext.get('isFullScreen')) {
			rml = tmlw;
			rmr = tmrw;
		} else {
			// left margin
			const eml = editorOffset.left - editorScroll.left - editorScroll.ls;
			const tml = targetOffset.left - targetScroll.left - targetScroll.ls;
			const vl = target.offsetLeft - wwScroll.left;
			let etml = eml < 0 || tml < 0 || targetScroll.widthEditorRefer || (tml >= 0 && eml >= 0 && eml < tml) ? tml : tml - eml;
			etml = vl < 0 && vl < etml ? vl : etml;
			// right margin
			const emr = editorScroll.ow - (editorW + eml);
			const tmr = targetScroll.ow - (targetW + tml);
			const vr = editorW - (target.offsetLeft + targetW) + (targetAbs ? 0 : wwScroll.left);
			let etmr = emr < 0 || tmr < 0 || targetScroll.widthEditorRefer || (tmr >= 0 && emr >= 0 && emr > tmr) ? tmr : tmr - emr;
			etmr = vr < 0 && vr < etmr ? vr : etmr;
			// margin result
			rml = (etml < tmlw ? etml : tmlw) + (!isLTR ? -targetOffset.scrollLeft : 0);
			rmr = (etmr < tmrw ? etmr : tmrw) + (isLTR ? targetOffset.scrollLeft : 0);
		}

		if (rml + targetW <= 0 || rmr + targetW <= 0) return;
		if (arrow) {
			arrow.style.left = '';
			arrow.style.right = '';
		}

		let l = addOffset.left;
		let x = 0;
		let ax = 0;
		let awLimit = 0;
		if (isLTR) {
			l += targetRect.left + window.scrollX - (rml < 0 ? rml : 0);
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
			l += targetRect.right - elW + window.scrollX + (rmr < 0 ? rmr : 0);
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
	const isFixed = /^fixed$/i.test(window.getComputedStyle(t_container).position);
	if (!this._isFixed) {
		if (isFixed) {
			this.setRelPosition(element, e_container, target, t_container, true);
		}
		return;
	} else if (!isFixed) {
		this.setRelPosition(element, e_container, target, t_container, true);
		return;
	}

	element.style.top = `${this._elTop - (this._scrollY - window.scrollY - t_container.offsetTop)}px`;
}

export default Offset;
