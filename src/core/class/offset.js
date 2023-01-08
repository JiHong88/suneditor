/**
 * @fileoverview Offset class
 * @author Yi JiHong.
 */

import CoreDependency from '../../dependency/_core';
import { getParentElement, isWysiwygFrame, hasClass, addClass, removeClass } from '../../helper/domUtils';
import { numbers } from '../../helper';

const Offset = function (editor) {
	CoreDependency.call(this, editor);
};

Offset.prototype = {
	/**
	 * @description Returns the position of the argument, "this.editor.frameContext.get('editorArea')" to inside the editor.Returns the position of the element in "this.editor.frameContext.get('editorArea')".
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

		const wFrame = this.editor.frameContext.get('wysiwygFrame');
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
		if (!element) element = this.editor.frameContext.get('topArea');
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
		const topArea = this.editor.frameContext.get('topArea');
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
			el = element || topArea;

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

		el = this.shadowRoot ? this.shadowRoot.host : null;
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

		const heightEditorRefer = topArea.contains(ohOffsetEl);
		const widthEditorRefer = topArea.contains(owOffsetEl);
		ohOffsetEl = heightEditorRefer ? topArea : ohOffsetEl;
		owOffsetEl = widthEditorRefer ? topArea : owOffsetEl;
		const ts = !ohOffsetEl ? 0 : ohOffsetEl.getBoundingClientRect().top + (!ohOffsetEl.parentElement || /^html$/i.test(ohOffsetEl.parentElement.nodeName) ? this._w.scrollY : 0);
		const ls = !owOffsetEl ? 0 : owOffsetEl.getBoundingClientRect().left + (!owOffsetEl.parentElement || /^html$/i.test(owOffsetEl.parentElement.nodeName) ? this._w.scrollX : 0);

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
	getWWScroll: function () {
		const eventWysiwyg = this.editor.frameContext.get('eventWysiwyg');
		return {
			top: eventWysiwyg.scrollY || eventWysiwyg.scrollTop || 0,
			left: eventWysiwyg.scrollX || eventWysiwyg.scrollLeft || 0,
			width: eventWysiwyg.scrollWidth || 0,
			height: eventWysiwyg.scrollHeight || 0
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

		const targetAbs = this._w.getComputedStyle(target).position === 'absolute';
		const wwScroll = this.getWWScroll();
		const editorOffset = this.getGlobal();
		const editorScroll = this.getGlobalScroll();
		const targetRect = target.getBoundingClientRect();
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
		const tmbw = this._w.innerHeight - targetRect.bottom;
		let toolbarH = !this.editor.toolbar._sticky && (this.editor.isBalloon || this.editor.isInline || this.options.toolbar_container) ? 0 : this.editor.toolContext.get('toolbar.main').offsetHeight;
		let rmt, rmb;
		if (this.status.isFullScreen) {
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
			rmt = (etmt < tmtw ? etmt : tmtw) - ((this.editor.toolbar._sticky && emt < this.editor.toolContext.get('toolbar.main').getBoundingClientRect().bottom) || toolbarH);
			rmb = etmb < tmbw ? etmb : tmbw;
		}

		if (rmb + targetH <= 0 || rmt + targetH <= 0) return;

		let t = addOffset.top;
		let y = 0;
		let arrowDir = '';
		if (position === 'bottom') {
			arrowDir = 'up';
			t += targetRect.bottom + ah + this._w.scrollY;
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
			t += targetRect.top - elH - ah + this._w.scrollY;
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
		element.style.top = t + 'px';

		// left ----------------------------------------------------------------------------------------------------
		const editorW = this.editor.frameContext.get('topArea').offsetWidth;
		const radius = numbers.get(this._w.getComputedStyle(element).borderRadius) || 0;
		const targetW = targetOffset.width;
		const elW = element.offsetWidth;
		const aw = arrow ? arrow.offsetWidth : 0;
		// margin
		const tmlw = targetRect.left;
		const tmrw = this._w.innerWidth - targetRect.right;
		let rml, rmr;
		if (this.status.isFullScreen) {
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
			rml = etml < tmlw ? etml : tmlw;
			rmr = etmr < tmrw ? etmr : tmrw;
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
		if (!this.options._rtl) {
			l += targetRect.left + this._w.scrollX - (rml < 0 ? rml : 0);
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
			l += targetRect.right - elW + this._w.scrollX + (rmr < 0 ? rmr : 0);
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

		element.style.left = l + 'px';
		inst.__offset = { left: element.offsetLeft + wwScroll.left, top: element.offsetTop + wwScroll.top, addOffset: addOffset };

		return true;
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
