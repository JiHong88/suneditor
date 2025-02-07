/**
 * @fileoverview Offset class
 */

import CoreInjector from '../../editorInjector/_core';
import { getParentElement, isWysiwygFrame, hasClass, addClass, removeClass, getClientSize } from '../../helper/domUtils';
import { domUtils, numbers } from '../../helper';
import { _w, _d } from '../../helper/env';

/**
 * @typedef {object} RectsInfo
 * @property {object} rects - Bounding rectangle information of the selection range.
 * @property {number} rects.left - The left position of the selection.
 * @property {number} rects.right - The right position of the selection.
 * @property {number} rects.top - The top position of the selection.
 * @property {number} rects.bottom - The bottom position of the selection.
 * @property {boolean} rects.noText - Whether the selection contains text.
 */

/**
 * @typedef {object} OffsetInfo
 * @property {number} top - The vertical position of the node relative to the entire document, including iframe offsets.
 * @property {number} left - The horizontal position of the node relative to the entire document, including iframe offsets.
 */

/**
 * @typedef {object} OffsetLocalInfo
 * @property {number} top - The vertical position of the node relative to the WYSIWYG editor.
 * @property {number} left - The horizontal position of the node relative to the WYSIWYG editor.
 * @property {number} scrollX - The horizontal scroll offset inside the WYSIWYG editor.
 * @property {number} scrollY - The vertical scroll offset inside the WYSIWYG editor.
 */

/**
 * @typedef {object} OffsetGlobalInfo
 * @property {number} top - The vertical position of the element relative to the entire document.
 * @property {number} left - The horizontal position of the element relative to the entire document.
 * @property {number} width - The total width of the element, including its content, padding, and border.
 * @property {number} height - The total height of the element, including its content, padding, and border.
 * @property {number} scrollTop - The amount of vertical scrolling applied to the element.
 * @property {number} scrollLeft - The amount of horizontal scrolling applied to the element.
 */

/**
 * @typedef {object} OffsetGlobalScrollInfo
 * @property {number} top - The vertical scroll offset, representing the distance from the top of the document to the current scroll position (in pixels).
 * @property {number} left - The horizontal scroll offset, representing the distance from the left side of the document to the current scroll position (in pixels).
 * @property {number} width - The total scrollable width of the document, including content outside the viewport.
 * @property {number} height - The total scrollable height of the document, including content outside the viewport.
 * @property {number} x - The horizontal position of the scrollable area relative to the entire document.
 * @property {number} y - The vertical position of the scrollable area relative to the entire document.
 * @property {number} oh - The height of the visible viewport, representing the portion of the document currently displayed on the screen.
 * @property {number} ow - The width of the visible viewport, representing the portion of the document currently displayed on the screen.
 */

/**
 * @typedef {object} OffsetWWScrollInfo
 * @property {number} top - The vertical scroll offset inside the WYSIWYG editor.
 * @property {number} left - The horizontal scroll offset inside the WYSIWYG editor.
 * @property {number} width - The total width of the WYSIWYG editor's scrollable area.
 * @property {number} height - The total height of the WYSIWYG editor's scrollable area.
 * @property {number} bottom - The sum of `top` and `height`, representing the bottom-most scrollable position.
 * @property {RectsInfo} rects - The bounding rectangle of the editor's visible area.
 */

/**
 * @class
 * @description Offset class, get the position of the element
 * @param {object} editor - The root editor instance
 */
function Offset(editor) {
	CoreInjector.call(this, editor);

	// members
	this._scrollEvent = null;
	this._elTop = 0;
	this._scrollY = 0;
	this._isFixed = false;
}

Offset.prototype = {
	/**
	 * @description Gets the position just outside the argument's internal editor (wysiwygFrame).
	 * @param {Node} node Target node.
	 * @returns {OffsetInfo} Position relative to the editor frame.
	 */
	get(node) {
		const wFrame = this.editor.frameContext.get('wysiwygFrame');
		const iframe = /iframe/i.test(wFrame?.nodeName);
		const off = this.getLocal(node);

		return {
			left: off.left + (iframe ? wFrame.parentElement.offsetLeft : 0),
			top: off.top + (iframe ? wFrame.parentElement.offsetTop : 0)
		};
	},

	/**
	 * @description Gets the position inside the internal editor of the argument.
	 * @param {Node} node Target node.
	 * @returns {OffsetLocalInfo} Position relative to the WYSIWYG editor.
	 */
	getLocal(node) {
		let offsetLeft = 0;
		let offsetTop = 0;
		let l = 0;
		let t = 0;
		let offsetElement = node.nodeType === 3 ? node.parentElement : node;
		const wysiwyg = getParentElement(node, isWysiwygFrame.bind(this));
		const self = offsetElement;

		while (offsetElement && !hasClass(offsetElement, 'se-wrapper') && offsetElement !== wysiwyg) {
			offsetLeft += offsetElement.offsetLeft - (self !== offsetElement ? offsetElement.scrollLeft : 0);
			offsetTop += offsetElement.offsetTop + (self !== offsetElement ? offsetElement.scrollTop : 0);
			offsetElement = offsetElement.offsetParent;
		}

		const wwFrame = this.editor.frameContext.get('wysiwygFrame');
		if (this.editor.frameContext.get('wysiwyg').contains(node)) {
			l = wwFrame.offsetLeft;
			t = wwFrame.offsetTop;
		}

		const eventWysiwyg = this.editor.frameContext.get('eventWysiwyg');
		return {
			left: offsetLeft + l,
			top: offsetTop + t - (wysiwyg ? wysiwyg.scrollTop : 0),
			scrollX: eventWysiwyg.scrollX || eventWysiwyg.scrollLeft || 0,
			scrollY: eventWysiwyg.scrollY || eventWysiwyg.scrollTop || 0
		};
	},

	/**
	 * @description Returns the position of the argument relative to the global document.
	 * @param {Element} element Target element.
	 * @returns {OffsetGlobalInfo} Global position and scroll values.
	 */
	getGlobal(element) {
		const topArea = this.editor.frameContext.get('topArea');
		const wFrame = this.editor.frameContext.get('wysiwygFrame');

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

		if (!targetAbs && !isTop && /^iframe$/i.test(wFrame.nodeName) && this.editor.frameContext.get('wysiwyg').contains(element)) {
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
	 * @param {Element} element Target element.
	 * @returns {OffsetGlobalScrollInfo} Global scroll information.
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

		const clientSize = getClientSize(this.editor.frameContext.get('_wd'));
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
			oh: targetAbs ? clientSize.h : oh,
			ow: targetAbs ? clientSize.w : ow,
			heightEditorRefer: heightEditorRefer,
			widthEditorRefer: widthEditorRefer
		};
	},

	/**
	 * @description Get the scroll info of the WYSIWYG area.
	 * @returns {{top: number, left: number, width: number, height: number, bottom: number, rects: DOMRect[]}} Scroll information within the editor.
	 */
	getWWScroll() {
		const eventWysiwyg = this.editor.frameContext.get('wysiwyg');
		const rects = this.selection.getRects(eventWysiwyg, 'start').rects;
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

	/**
	 * @description Sets the relative position of an element
	 * @param {Element} element Element to position
	 * @param {Element} e_container Element's root container
	 * @param {Element} target Target element to position against
	 * @param {Element} t_container Target's root container
	 * @param {boolean} _reload Whether to reload position
	 */
	setRelPosition(element, e_container, target, t_container, _reload) {
		this._scrollY = _w.scrollY;
		let wy = 0;
		let tCon = t_container;
		do {
			if ((this._isFixed = /^fixed$/i.test(_w.getComputedStyle(tCon).position))) {
				wy += this._scrollY;
				break;
			}
		} while (!domUtils.hasClass(tCon, 'sun-editor') && (tCon = tCon.parentElement));

		if (!_reload) {
			this.__removeGlobalEvent();
			this._scrollEvent = this.editor.eventManager.addGlobalEvent('scroll', FixedScroll.bind(this, element, e_container, target, t_container), false);
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
			const cw = t_container.offsetWidth + tcleft;
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

		const menuHeight_bottom = getClientSize(_d).h - (containerTop - scrollTop + bt + target.offsetHeight);
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

		if (this._isFixed) {
			this._elTop = element.offsetTop;
		}
	},

	/**
	 * @description Sets the absolute position of an element
	 * @param {Element} element Element to position
	 * @param {Element} target Target element
	 * @param {object} params Position parameters
	 * @param {{left:number, top:number}} [params.addOffset={left:0, top:0}] Additional offset
	 * @param {"bottom"|"top"} [params.position="bottom"] Position ('bottom'|'top')
	 * @param {object} params.inst Instance object of caller
	 * @returns {boolean} Success / Failure
	 */
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
		const isTargetAbs = isWWTarget && !isCtrlTarget;
		const clientSize = getClientSize(_d);
		const wwScroll = isTargetAbs ? this.getWWScroll() : this._getWindowScroll();
		const targetRect = isCtrlTarget ? target.getBoundingClientRect() : this.selection.getRects(target, 'start').rects;
		const targetOffset = this.getGlobal(target);
		const arrow = hasClass(element.firstElementChild, 'se-arrow') ? element.firstElementChild : null;

		// top ----------------------------------------------------------------------------------------------------
		const ah = arrow ? arrow.offsetHeight : 0;
		const elH = element.offsetHeight;
		const targetH = target.offsetHeight;
		// margin
		const tmtw = targetRect.top;
		const tmbw = clientSize.h - targetRect.bottom;
		const toolbarH = !this.editor.toolbar._sticky && (this.editor.isBalloon || this.editor.isInline) ? 0 : this.context.get('toolbar.main').offsetHeight;

		// check margin
		const { rmt, rmb, rt } = this._getVMargin(tmtw, tmbw, toolbarH, clientSize, targetRect, isTargetAbs, wwScroll);
		if (isWWTarget && (rmb + targetH <= 0 || rmt + rt + targetH <= 0)) return;

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
				y = toolbarH + rmt - (elH + ah);
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
		const tmrw = clientSize.w - targetRect.right;
		let rml, rmr;
		if (this.editor.frameContext.get('isFullScreen')) {
			rml = tmlw;
			rmr = tmrw;
		} else {
			rml = targetRect.left;
			rmr = clientSize.w - targetRect.right;
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

	/**
	 * @description Sets the position of an element relative to a range
	 * @param {Element} element Element to position
	 * @param {Range} range Range to position against
	 * @param {object} [options={}] Position options
	 * @param {"bottom"|"top"} [options.position="bottom"] Position ('bottom'|'top')
	 * @param {number} [options.addTop=0] Additional top offset
	 * @returns {boolean} Success / Failure
	 */
	setRangePosition(element, range, { position, addTop } = {}) {
		element.style.top = '-10000px';
		element.style.visibility = 'hidden';
		element.style.display = 'block';

		let positionTop = position === 'top';
		range = range || this.selection.getRange();
		const rectsObj = this.selection.getRects(range, positionTop ? 'start' : 'end');
		positionTop = rectsObj.position === 'start';

		const isFullScreen = this.editor.frameContext.get('isFullScreen');
		const topArea = this.editor.frameContext.get('topArea');
		const rects = rectsObj.rects;
		const scrollLeft = isFullScreen ? 0 : rectsObj.scrollLeft;
		const scrollTop = isFullScreen ? 0 : rectsObj.scrollTop;
		const editorWidth = topArea.offsetWidth;
		const offsets = this.getGlobal(topArea);
		const editorLeft = offsets.left;
		const toolbarWidth = element.offsetWidth;
		const toolbarHeight = element.offsetHeight;

		this._setOffsetOnRange(positionTop, rects, element, editorLeft, editorWidth, scrollLeft, scrollTop, addTop);
		if (this.isSub && this.getGlobal(element).top - offsets.top < 0) {
			positionTop = !positionTop;
			this._setOffsetOnRange(positionTop, rects, element, editorLeft, editorWidth, scrollLeft, scrollTop, addTop);
		}

		if (toolbarWidth !== element.offsetWidth || toolbarHeight !== element.offsetHeight) {
			this._setOffsetOnRange(positionTop, rects, element, editorLeft, editorWidth, scrollLeft, scrollTop, addTop);
		}

		// check margin
		const isTargetAbs = !this.carrierWrapper.contains(element);
		const clientSize = getClientSize(_d);
		const wwScroll = isTargetAbs ? this.getWWScroll() : this._getWindowScroll();
		const targetH = rects.height;
		const tmtw = rects.top;
		const tmbw = clientSize.h - rects.bottom;
		const toolbarH = !this.editor.toolbar._sticky && (this.editor.isBalloon || this.editor.isInline) ? 0 : this.context.get('toolbar.main').offsetHeight;

		const { rmt, rmb, rt } = this._getVMargin(tmtw, tmbw, toolbarH, clientSize, rects, isTargetAbs, wwScroll);
		if (rmb + targetH <= 0 || rmt + rt + targetH <= 0) return;

		_w.setTimeout(() => {
			element.style.visibility = '';
		}, 0);

		return true;
	},

	/**
	 * @private
	 * @description Sets the position of an element relative to the selection range in the editor.
	 * - This method calculates the top and left offsets for the element, ensuring it
	 * - does not overflow the editor boundaries and adjusts the arrow positioning accordingly.
	 * @param {boolean} isDirTop - Determines whether the element should be positioned above (`true`) or below (`false`) the target.
	 * @param {RectsInfo} rects - Bounding rectangle information of the selection range.
	 * @param {Element} element - The element to be positioned.
	 * @param {number} editorLeft - The left position of the editor.
	 * @param {number} editorWidth - The width of the editor.
	 * @param {number} scrollLeft - The horizontal scroll offset.
	 * @param {number} scrollTop - The vertical scroll offset.
	 * @param {number} [addTop=0] - Additional top margin adjustment.
	 */
	_setOffsetOnRange(isDirTop, rects, element, editorLeft, editorWidth, scrollLeft, scrollTop, addTop = 0) {
		const padding = 1;
		const arrow = element.querySelector('.se-arrow ');
		const arrowMargin = Math.round(arrow.offsetWidth / 2);
		const elW = element.offsetWidth;
		const elH = rects.noText && !isDirTop ? 0 : element.offsetHeight;

		const absoluteLeft = (isDirTop ? rects.left : rects.right) - editorLeft - elW / 2 + scrollLeft;
		const overRight = absoluteLeft + elW - editorWidth;

		let t = (isDirTop ? rects.top - elH - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : addTop) + scrollTop;
		const l = absoluteLeft < 0 ? padding : overRight < 0 ? absoluteLeft : absoluteLeft - overRight - padding - 1;

		let resetTop = false;
		const space = t + (isDirTop ? this.getGlobal(this.editor.frameContext.get('topArea')).top : element.offsetHeight - this.editor.frameContext.get('wysiwyg').offsetHeight);
		if (!isDirTop && space > 0 && this._getPageBottomSpace() < space) {
			isDirTop = true;
			resetTop = true;
		} else if (isDirTop && _d.documentElement.offsetTop > space) {
			isDirTop = false;
			resetTop = true;
		}

		if (resetTop) t = (isDirTop ? rects.top - elH - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : addTop) + scrollTop;

		element.style.left = Math.floor(l) + 'px';
		element.style.top = Math.floor(t) + 'px';

		if (isDirTop) {
			domUtils.removeClass(arrow, 'se-arrow-up');
			domUtils.addClass(arrow, 'se-arrow-down');
		} else {
			domUtils.removeClass(arrow, 'se-arrow-down');
			domUtils.addClass(arrow, 'se-arrow-up');
		}

		const arrow_left = Math.floor(elW / 2 + (absoluteLeft - l));
		arrow.style.left = (arrow_left + arrowMargin > element.offsetWidth ? element.offsetWidth - arrowMargin : arrow_left < arrowMargin ? arrowMargin : arrow_left) + 'px';
	},

	/**
	 * @private
	 * @description Get available space from page bottom
	 * @returns {number} Available space
	 */
	_getPageBottomSpace() {
		const topArea = this.editor.frameContext.get('topArea');
		return _d.documentElement.scrollHeight - (this.getGlobal(topArea).top + topArea.offsetHeight);
	},

	/**
	 * @private
	 * @description Calculates the vertical margin offsets for the target element relative to the editor frame.
	 * - This method determines the top and bottom margins based on various conditions such as
	 * - fullscreen mode, iframe usage, toolbar height, and scroll positions.
	 * @param {number} tmtw Top margin to window
	 * @param {number} tmbw Bottom margin to window
	 * @param {number} toolbarH Toolbar height
	 * @param {object} clientSize Client size object
	 * @param {object} targetRect Target rect object
	 * @param {boolean} isTargetAbs Is target absolute position
	 * @param {object} wwScroll WYSIWYG scroll info
	 * @returns {{rmt:number, rmb:number, rt:number}} Margin values (rmt: top margin, rmb: bottom margin, rt: Toolbar height offset adjustment)
	 */
	_getVMargin(tmtw, tmbw, toolbarH, clientSize, targetRect, isTargetAbs, wwScroll) {
		let rmt = 0;
		let rmb = 0;
		let rt = 0;
		if (this.editor.frameContext.get('isFullScreen')) {
			rmt = tmtw - toolbarH;
			rmb = tmbw;
		} else {
			const isIframe = isTargetAbs && this.editor.frameOptions.get('iframe');
			const tMargin = targetRect.top;
			const bMargin = clientSize.h - targetRect.bottom;
			const editorOffset = this.getGlobal();
			const editorScroll = this.getGlobalScroll();
			const statusBarH = this.editor.frameContext.get('statusbar')?.offsetHeight || 0;

			if (isIframe) {
				const emt = editorOffset.top - editorScroll.top - editorScroll.ts;
				const editorH = this.editor.frameContext.get('topArea').offsetHeight;
				rmt = targetRect.top - emt;
				rmb = bMargin - (editorScroll.oh - (editorH + emt) + statusBarH);
			} else {
				rt = !this.editor.toolbar._sticky && !this.options.get('toolbar_container') ? toolbarH : 0;
				const wst = !isTargetAbs && /\d+/.test(this.editor.frameOptions.get('height')) ? editorOffset.top - _w.scrollY + rt : 0;
				const wsb = !isTargetAbs && /\d+/.test(this.editor.frameOptions.get('height')) ? _w.innerHeight - (editorOffset.top + editorOffset.height - _w.scrollY) : 0;
				let st = wst;
				if (toolbarH > wst) {
					if (this.editor.toolbar._sticky) {
						st = toolbarH;
						toolbarH = 0;
					} else {
						st = wst + toolbarH;
					}
				} else if (this.options.get('toolbar_container')) {
					toolbarH = 0;
				} else {
					st = wst + (this.editor.toolbar._sticky ? toolbarH : 0);
				}

				rmt = targetRect.top - st;
				rmb = wwScroll.rects.bottom - targetRect.bottom - wsb - statusBarH;
			}

			// display margin
			rmt = (rmt > 0 ? tMargin : rmt) - toolbarH;
			rmb = rmb > 0 ? bMargin : rmb;
		}

		return {
			rmt,
			rmb,
			rt
		};
	},

	/**
	 * @private
	 * @description Sets the visibility and direction of the arrow element.
	 * - This method applies the appropriate class (`se-arrow-up` or `se-arrow-down`)
	 * - based on the specified direction key and adjusts the visibility of the arrow.
	 * @param {HTMLElement} arrow - The arrow element to be updated.
	 * @param {"up"|"down"|""} key - The direction of the arrow.
	 * - Accepts `'up'` for an upward arrow, `'down'` for a downward arrow,
	 * - or any other value to hide the arrow.
	 */
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

	/**
	 * @private
	 * @description Retrieves the current window scroll position and viewport size.
	 * - Returns an object containing the scroll offsets, viewport dimensions, and boundary rects.
	 * @returns {object} An object with scroll and viewport information.
	 * @returns {number} return.top - The vertical scroll position of the window.
	 * @returns {number} return.left - The horizontal scroll position of the window.
	 * @returns {number} return.width - The width of the viewport.
	 * @returns {number} return.height - The height of the viewport.
	 * @returns {object} return.rects - An object containing the boundary rects.
	 * @returns {number} return.rects.left - The left boundary of the viewport.
	 * @returns {number} return.rects.top - The top boundary of the viewport.
	 * @returns {number} return.rects.right - The right boundary of the viewport.
	 * @returns {number} return.rects.bottom - The bottom boundary of the viewport.
	 * @returns {boolean} return.rects.noText - Indicates whether there is text in the viewport.
	 */
	_getWindowScroll() {
		const viewPort = domUtils.getClientSize(_d);
		return {
			top: _w.scrollY,
			left: _w.scrollX,
			width: viewPort.w,
			height: viewPort.h,
			rects: {
				left: 0,
				top: 0,
				right: _w.innerWidth,
				bottom: _w.innerHeight,
				noText: true
			}
		};
	},

	/**
	 * @private
	 * @description Removes the global scroll event listener from the editor.
	 * - Resets related scroll tracking properties.
	 */
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
