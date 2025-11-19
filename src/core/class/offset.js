/**
 * @fileoverview Offset class
 */

import CoreInjector from '../../editorInjector/_core';
import { getParentElement } from '../../helper/dom/domQuery';
import { isWysiwygFrame, isElement } from '../../helper/dom/domCheck';
import { hasClass, addClass, removeClass, getClientSize } from '../../helper/dom/domUtils';
import { numbers } from '../../helper';
import { _w, _d } from '../../helper/env';

/**
 * @typedef {Omit<Offset & Partial<SunEditor.Injector>, 'offset'>} OffsetThis
 */

/**
 * @typedef {Object} RectsInfo Bounding rectangle information of the selection range.
 * @property {number} rects.left - The left position of the selection.
 * @property {number} rects.right - The right position of the selection.
 * @property {number} rects.top - The top position of the selection.
 * @property {number} rects.bottom - The bottom position of the selection.
 * @property {boolean} [rects.noText] - Whether the selection contains text.
 * @property {number} [rects.width] - The width of the selection.
 * @property {number} [rects.height] - The height of the selection.
 */

/**
 * @typedef {Object} OffsetInfo
 * @property {number} top - The top position of the node relative to the entire document, including iframe offsets.
 * @property {number} left - The left position of the node relative to the entire document, including iframe offsets.
 */

/**
 * @typedef {Object} OffsetLocalInfo
 * @property {number} top - The top position of the node relative to the WYSIWYG editor.
 * @property {number} left - The left position of the node relative to the WYSIWYG editor.
 * @property {number} right - The right position of the node relative to the WYSIWYG editor.
 * @property {number} scrollX - The horizontal scroll offset inside the WYSIWYG editor.
 * @property {number} scrollY - The vertical scroll offset inside the WYSIWYG editor.
 * @property {number} scrollH - The vertical scroll height inside the WYSIWYG editor.
 */

/**
 * @typedef {Object} OffsetGlobalInfo
 * @property {number} top - The top position of the element relative to the entire document.
 * @property {number} left - The left position of the element relative to the entire document.
 * @property {number} fixedTop - The top position within the current viewport, without taking scrolling into account.
 * @property {number} fixedLeft - The left position within the current viewport, without taking scrolling into account.
 * @property {number} width - The total width of the element, including its content, padding, and border.
 * @property {number} height - The total height of the element, including its content, padding, and border.
 */

/**
 * @typedef {Object} OffsetGlobalScrollInfo
 * @property {number} top - Total top scroll distance
 * @property {number} left - Total left scroll distance
 * @property {number} width - Total width including scrollable area
 * @property {number} height - Total height including scrollable area
 * @property {number} x - Horizontal offset from the top reference element
 * @property {number} y - Vertical offset from the top reference element
 * @property {HTMLElement|Window|null} ohOffsetEl - Element or window used as the vertical scroll reference
 * @property {HTMLElement|Window|null} owOffsetEl - Element or window used as the horizontal scroll reference
 * @property {number} oh - Height of the vertical scrollable area (clientHeight)
 * @property {number} ow - Width of the horizontal scrollable area (clientWidth)
 * @property {boolean} heightEditorRefer - Indicates if the vertical scroll reference is the editor area
 * @property {boolean} widthEditorRefer - Indicates if the horizontal scroll reference is the editor area
 * @property {number} ts - Top position of the height offset element relative to the viewport
 * @property {number} ls - Left position of the width offset element relative to the viewport
 */

/**
 * @typedef {Object} OffsetWWScrollInfo
 * @property {number} top - The top scroll offset inside the WYSIWYG editor.
 * @property {number} left - The left scroll offset inside the WYSIWYG editor.
 * @property {number} width - The total width of the WYSIWYG editor's scrollable area.
 * @property {number} height - The total height of the WYSIWYG editor's scrollable area.
 * @property {number} bottom - The sum of `top` and `height`, representing the bottom-most scrollable position.
 */

/**
 * @constructor
 * @this {OffsetThis}
 * @description Offset class, get the position of the element
 * @param {SunEditor.Core} editor - The root editor instance
 */
function Offset(editor) {
	CoreInjector.call(this, editor);
}

Offset.prototype = {
	/**
	 * @this {OffsetThis}
	 * @description Gets the position just outside the argument's internal editor (wysiwygFrame).
	 * @param {Node} node Target node.
	 * @returns {OffsetInfo} Position relative to the editor frame.
	 */
	get(node) {
		const wFrame = this.frameContext.get('wysiwygFrame');
		const iframe = /iframe/i.test(wFrame?.nodeName);
		const off = this.getLocal(node);

		return {
			left: off.left + (iframe ? wFrame.parentElement.offsetLeft : 0),
			top: off.top + (iframe ? wFrame.parentElement.offsetTop : 0),
		};
	},

	/**
	 * @this {OffsetThis}
	 * @description Gets the position inside the internal editor of the argument.
	 * @param {Node} node Target node.
	 * @returns {OffsetLocalInfo} Position relative to the WYSIWYG editor.
	 */
	getLocal(node) {
		const target = /** @type {HTMLElement} */ (node);
		let offsetLeft = 0;
		let offsetTop = 0;
		let l = 0;
		let t = 0;
		let r = 0;
		let offsetElement = target.nodeType === 3 ? target.parentElement : target;
		const targetWidth = target.offsetWidth;
		const wysiwyg = getParentElement(target, isWysiwygFrame.bind(this));
		const self = offsetElement;

		while (offsetElement && !hasClass(offsetElement, 'se-wrapper') && offsetElement !== wysiwyg) {
			offsetLeft += offsetElement.offsetLeft - (self !== offsetElement ? offsetElement.scrollLeft : 0);
			offsetTop += offsetElement.offsetTop + (self !== offsetElement ? offsetElement.scrollTop : 0);
			offsetElement = /** @type {HTMLElement} */ (offsetElement.offsetParent);
		}

		const wwFrame = this.frameContext.get('wysiwygFrame');
		if (this.frameContext.get('wysiwyg').contains(target)) {
			l = wwFrame.offsetLeft;
			t = wwFrame.offsetTop;
			r = wwFrame.parentElement.offsetWidth - (wwFrame.offsetLeft + wwFrame.offsetWidth);
		}

		const eventWysiwyg = this.frameContext.get('eventWysiwyg');
		offsetLeft += l - (wysiwyg ? wysiwyg.scrollLeft : 0);
		offsetTop += t - (wysiwyg ? wysiwyg.scrollTop : 0);
		return {
			left: offsetLeft,
			top: offsetTop,
			right: offsetElement?.offsetWidth ? offsetElement.offsetWidth - (offsetLeft - l + targetWidth) + r : 0,
			scrollX: eventWysiwyg.scrollLeft || eventWysiwyg.scrollX || 0,
			scrollY: eventWysiwyg.scrollTop || eventWysiwyg.scrollY || 0,
			scrollH: this.frameContext.get('wysiwyg').scrollHeight || 0,
		};
	},

	/**
	 * @this {OffsetThis}
	 * @description Returns the position of the argument relative to the global document.
	 * This is a refactored version using getBoundingClientRect for better performance and accuracy.
	 * @param {?Node} [node] Target element.
	 * @returns {OffsetGlobalInfo} Global position and scroll values.
	 */
	getGlobal(node) {
		const topArea = this.frameContext.get('topArea');
		const wFrame = this.frameContext.get('wysiwygFrame');

		node ||= topArea;

		if (!isElement(node)) {
			return { top: 0, left: 0, fixedTop: 0, fixedLeft: 0, width: 0, height: 0 };
		}

		const element = /** @type {HTMLElement} */ (node);

		const rect = element.getBoundingClientRect();

		let top = rect.top;
		let left = rect.left;

		const isIframe = /^iframe$/i.test(wFrame.nodeName);
		if (isIframe && wFrame.contentDocument.contains(element)) {
			const iframeRect = wFrame.getBoundingClientRect();
			top += iframeRect.top;
			left += iframeRect.left;
		}

		let wy = 0;
		let wx = 0;
		if (!this.frameContext.get('isFullScreen')) {
			wy += _w.scrollY;
			wx += _w.scrollX;
		}

		return {
			top: top + wy,
			left: left + wx,
			fixedTop: top,
			fixedLeft: left,
			width: element.offsetWidth,
			height: element.offsetHeight,
		};
	},

	/**
	 * @this {OffsetThis}
	 * @description Gets the current editor-relative scroll offset.
	 * @param {?Node} [node] Target element.
	 * @returns {OffsetGlobalScrollInfo} Global scroll information.
	 */
	getGlobalScroll(node) {
		const topArea = this.frameContext.get('topArea');
		let isTop = false;
		let targetAbs = false;
		node ||= topArea;
		if (node === topArea) isTop = true;
		if (!isTop && isElement(node)) {
			targetAbs = _w.getComputedStyle(node).position === 'absolute';
		}

		const element = /** @type {HTMLElement} */ (node);
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
			if (el.scrollHeight >= el.clientHeight) {
				oh = /^html$/i.test(el.nodeName) ? oh || el.clientHeight : el.clientHeight + (ohel ? -ohel.clientTop : 0);
				ohOffsetEl = ohel || ohOffsetEl || el;
				ohel = el;
			}
			if (el.scrollLeft > 0) {
				x += el.offsetLeft;
			}
			if (el.scrollWidth >= el.clientWidth) {
				ow = /^html$/i.test(el.nodeName) ? ow || el.clientWidth : el.clientWidth + (owel ? -owel.clientLeft : 0);
				owOffsetEl = owel || owOffsetEl || el;
				owel = el;
			}
			el = el.parentElement;
		}

		if (!targetAbs && !isTop && /^iframe$/i.test(this.frameContext.get('wysiwygFrame').nodeName)) {
			el = this.frameContext.get('wrapper');
			ohOffsetEl = owOffsetEl = topArea;
			while (el) {
				t += el.scrollTop;
				l += el.scrollLeft;
				h += el.scrollHeight;
				w += el.scrollWidth;
				if (el.scrollTop > 0) {
					y += el.offsetTop;
				}
				if (el.scrollHeight >= el.clientHeight) {
					oh = /^html$/i.test(el.nodeName) ? oh || el.clientHeight : el.clientHeight + (ohel ? -ohel.clientTop : 0);
					ohel = el;
				}
				if (el.scrollLeft > 0) {
					x += el.offsetLeft;
				}
				if (el.scrollWidth >= el.clientWidth) {
					ow = /^html$/i.test(el.nodeName) ? ow || el.clientWidth : el.clientWidth + (owel ? -owel.clientLeft : 0);
					owel = el;
				}
				el = el.parentElement;
			}
		}

		el = /** @type {HTMLElement} */ (this.editor._shadowRoot?.host);
		if (el) ohOffsetEl = owOffsetEl = topArea;
		while (el) {
			t += el.scrollTop;
			l += el.scrollLeft;
			h += el.scrollHeight;
			w += el.scrollWidth;
			if (el.scrollTop > 0) {
				y += el.offsetTop;
			}
			if (el.scrollHeight >= el.clientHeight) {
				oh = /^html$/i.test(el.nodeName) ? oh || el.clientHeight : el.clientHeight + (ohel ? -ohel.clientTop : 0);
				ohel = el;
			}
			if (el.scrollLeft > 0) {
				x += el.offsetLeft;
			}
			if (el.scrollWidth >= el.clientWidth) {
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

		const clientSize = getClientSize(this.frameContext.get('_wd'));
		return {
			top: t,
			left: l,
			ts: ts,
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
			widthEditorRefer: widthEditorRefer,
		};
	},

	/**
	 * @this {OffsetThis}
	 * @description Get the scroll info of the WYSIWYG area.
	 * @returns {OffsetWWScrollInfo} Scroll information within the editor.
	 */
	getWWScroll() {
		const eventWysiwyg = this.frameContext.get('wysiwyg');
		const top = eventWysiwyg.scrollTop || eventWysiwyg.scrollY || 0;
		const height = eventWysiwyg.scrollHeight || eventWysiwyg.document?.documentElement.scrollHeight || 0;

		return {
			top,
			left: eventWysiwyg.scrollLeft || eventWysiwyg.scrollX || 0,
			width: eventWysiwyg.scrollWidth || eventWysiwyg.document?.documentElement.scrollWidth || 0,
			height,
			bottom: top + height,
		};
	},

	/**
	 * @this {OffsetThis}
	 * @description Sets the relative position of an element
	 * @param {HTMLElement} element Element to position
	 * @param {HTMLElement} e_container Element's root container
	 * @param {HTMLElement} target Target element to position against
	 * @param {HTMLElement} t_container Target's root container
	 */
	setRelPosition(element, e_container, target, t_container) {
		const isFixedContainer = /^fixed$/i.test(_w.getComputedStyle(t_container).position);
		const tGlobal = this.getGlobal(target);

		// top
		if (isFixedContainer) {
			element.style.position = 'fixed';
			element.style.top = `${tGlobal.fixedTop + tGlobal.height}px`;
		} else {
			element.style.position = '';

			const isSameContainer = t_container.contains(element);
			const containerTop = isSameContainer ? this.getGlobal(e_container).top : 0;
			const elHeight = element.offsetHeight;
			const scrollTop = this.getGlobalScroll().top;
			const bt = tGlobal.top;

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
		}

		// left
		const ew = element.offsetWidth;
		const tw = target.offsetWidth;
		const tl = tGlobal.left;
		const tcleft = this.getGlobal(t_container).left;

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
	},

	/**
	 * @this {OffsetThis}
	 * @description Sets the absolute position of an element
	 * @param {HTMLElement} element Element to position
	 * @param {HTMLElement} target Target element
	 * @param {Object} params Position parameters
	 * @param {boolean} [params.isWWTarget=false] Whether the target is within the editor's WYSIWYG area
	 * @param {{left:number, top:number}} [params.addOffset={left:0, top:0}] Additional offset
	 * @param {"bottom"|"top"} [params.position="bottom"] Position ('bottom'|'top')
	 * @param {*} params.inst Instance object of caller
	 * @param {HTMLElement} [params.sibling=null] The sibling controller element
	 * @param {boolean} [params.isWWScroll=false] Indicates if the scroll event is from the wysiwyg area
	 * @returns {{position: "top" | "bottom"} | undefined} Success -> {position: current position}
	 */
	setAbsPosition(element, target, params) {
		const addOffset = {
			left: 0,
			top: 0,
			...params.addOffset,
		};
		const position = params.position || 'bottom';
		const inst = params.inst;
		const isLTR = !this.options.get('_rtl');

		if (!isLTR) {
			addOffset.left *= -1;
		}

		const isIframe = this.frameOptions.get('iframe');
		const isWWTarget = this.frameContext.get('wrapper').contains(target) || params.isWWTarget || (isIframe ? this.frameContext.get('wysiwyg').contains(target) : false);
		const isToolbarTarget = Boolean(getParentElement(target, '.se-toolbar'));
		const isElTarget = target.nodeType === 1;

		const isTextSelection = isWWTarget && !isElTarget;
		const isInlineTarget = isElTarget && /inline/.test(_w.getComputedStyle(target).display);
		const clientSize = getClientSize(_d);
		const wwScroll = isTextSelection ? this.getWWScroll() : this._getWindowScroll();
		const targetRect = !isWWTarget || (!isIframe && isElTarget) ? target.getBoundingClientRect() : this.selection.getRects(target, 'start').rects;
		const targetOffset = this.getGlobal(target);
		const arrow = /** @type {HTMLElement} */ (hasClass(element.firstElementChild, 'se-arrow') ? element.firstElementChild : null);

		// top ----------------------------------------------------------------------------------------------------
		const siblingH = params.sibling?.offsetHeight || 0;
		const ah = arrow ? arrow.offsetHeight : 0;
		const elH = element.offsetHeight;
		const targetH = target.offsetHeight;
		// margin
		const tmtw = targetRect.top;
		const tmbw = clientSize.h - targetRect.bottom;
		const globalTop = this.getGlobal(this.frameContext.get('topArea')).top;
		const wScrollY = _w.scrollY;
		const th = this.context.get('toolbar_main').offsetHeight;
		const containerToolbar = this.options.get('toolbar_container');
		const headLess = this.editor.isBalloon || this.editor.isInline || containerToolbar;
		const toolbarH = (containerToolbar && globalTop - wScrollY - th > 0) || (!this.editor.toolbar.isSticky && headLess) ? 0 : th + (this.editor.toolbar.isSticky ? this.options.get('toolbar_sticky') : 0);

		// check margin
		const { rmt, rmb, bMargin, rt } = this._getVMargin(tmtw, tmbw, toolbarH, clientSize, targetRect, isTextSelection, params.isWWScroll, isToolbarTarget);
		if ((isWWTarget && ((rmb > 0 ? bMargin : rmb) + targetH <= 0 || rmt + rt + targetH - (this.editor.toolbar.isSticky && isInlineTarget ? toolbarH : 0) <= 0)) || rmt + targetH < 0) return;

		const isSticky = this.editor.toolbar.isSticky && this.context.get('toolbar_main').style.display !== 'none' && (!headLess || this.frameContext.get('topArea').getBoundingClientRect().top <= th);
		const statusBarH = this.frameContext.get('statusbar')?.offsetHeight || 0;
		let t = addOffset.top;
		let y = 0;
		let arrowDir = '';

		// [bottom] position
		if (position === 'bottom') {
			let trmt = rmt - (isSticky && globalTop - wScrollY <= toolbarH ? toolbarH : 0);
			if (isSticky && trmt + toolbarH < 0) trmt += toolbarH;
			arrowDir = 'up';
			t += targetRect.bottom + ah + wScrollY;
			y = rmb - (elH + ah) - statusBarH;
			// change to <top> position
			if (y - siblingH < 0) {
				arrowDir = 'down';
				t -= targetH + elH + ah * 2;
				y = trmt - (elH + ah);
				// sticky the <top> position
				if (y - siblingH < 0) {
					arrowDir = '';
					t -= y - siblingH - Math.max(1, y + elH + ah) + (!isSticky && trmt < 0 ? toolbarH : 0) - (isSticky ? this.context.get('toolbar_main').offsetTop : 0);
				}
			}
		}
		// <top> position
		else {
			arrowDir = 'down';
			t += targetRect.top - elH - ah + wScrollY;
			y = (isSticky ? targetRect.top - toolbarH : rmt) - elH - ah;
			// change to [bottom] position
			if (y - siblingH < 0) {
				arrowDir = 'up';
				t += targetH + elH + ah * 2;
				y = (rmb > 0 ? bMargin : rmb) - (elH + ah) - statusBarH;
				// sticky the [bottom] position
				if (y - siblingH < 0) {
					arrowDir = '';
					t += y - 2;
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
		if (this.frameContext.get('isFullScreen')) {
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
			addOffset: addOffset,
		};

		return { position: arrowDir === 'up' ? 'bottom' : 'top' };
	},

	/**
	 * @this {OffsetThis}
	 * @description Sets the position of an element relative to a range
	 * @param {HTMLElement} element Element to position
	 * @param {?Range} range Range to position against.
	 * - if null, the current selection range is used
	 * @param {Object} [options={}] Position options
	 * @param {"bottom"|"top"} [options.position="bottom"] Position ('bottom'|'top')
	 * @param {number} [options.addTop=0] Additional top offset
	 * @returns {boolean} Success / Failure
	 */
	setRangePosition(element, range, { position, addTop } = {}) {
		element.style.top = '-10000px';
		element.style.visibility = 'hidden';
		element.style.display = 'block';

		let positionTop = position === 'top';
		range ||= this.selection.getRange();
		const rectsObj = this.selection.getRects(range, positionTop ? 'start' : 'end');
		positionTop = rectsObj.position === 'start';

		const isFullScreen = this.frameContext.get('isFullScreen');
		const topArea = this.frameContext.get('topArea');
		const rects = rectsObj.rects;
		const scrollLeft = isFullScreen ? 0 : rectsObj.scrollLeft;
		const scrollTop = isFullScreen ? 0 : rectsObj.scrollTop;
		const editorWidth = topArea.offsetWidth;
		const offsets = this.getGlobal(topArea);
		const editorLeft = offsets.left;
		const toolbarWidth = element.offsetWidth;
		const toolbarHeight = element.offsetHeight;

		this._setOffsetOnRange(positionTop, rects, element, editorLeft, editorWidth, scrollLeft, scrollTop, addTop);
		if (this.getGlobal(element).top - offsets.top < 0) {
			positionTop = !positionTop;
			this._setOffsetOnRange(positionTop, rects, element, editorLeft, editorWidth, scrollLeft, scrollTop, addTop);
		}

		if (toolbarWidth !== element.offsetWidth || toolbarHeight !== element.offsetHeight) {
			this._setOffsetOnRange(positionTop, rects, element, editorLeft, editorWidth, scrollLeft, scrollTop, addTop);
		}

		// check margin
		const isTextSelection = !this.carrierWrapper.contains(element);
		const clientSize = getClientSize(_d);
		const targetH = rects.height;
		const tmtw = rects.top;
		const tmbw = clientSize.h - rects.bottom;
		const toolbarH = !this.editor.toolbar.isSticky && (this.editor.isBalloon || this.editor.isInline) ? 0 : this.context.get('toolbar_main').offsetHeight;

		const { rmt, rmb, rt } = this._getVMargin(tmtw, tmbw, toolbarH, clientSize, rects, isTextSelection, false, false);
		if (rmb + targetH <= 0 || rmt + rt + targetH <= 0) return;

		element.style.visibility = '';

		return true;
	},

	/**
	 * @private
	 * @this {OffsetThis}
	 * @description Sets the position of an element relative to the selection range in the editor.
	 * - This method calculates the top and left offsets for the element, ensuring it
	 * - does not overflow the editor boundaries and adjusts the arrow positioning accordingly.
	 * @param {boolean} isDirTop - Determines whether the element should be positioned above (`true`) or below (`false`) the target.
	 * @param {RectsInfo} rects - Bounding rectangle information of the selection range.
	 * @param {HTMLElement} element - The element to be positioned.
	 * @param {number} editorLeft - The left position of the editor.
	 * @param {number} editorWidth - The width of the editor.
	 * @param {number} scrollLeft - The horizontal scroll offset.
	 * @param {number} scrollTop - The vertical scroll offset.
	 * @param {number} [addTop=0] - Additional top margin adjustment.
	 */
	_setOffsetOnRange(isDirTop, rects, element, editorLeft, editorWidth, scrollLeft, scrollTop, addTop = 0) {
		const padding = 1;
		const arrow = /** @type  {HTMLElement} */ (element.querySelector('.se-arrow '));
		const arrowMargin = Math.round(arrow.offsetWidth / 2);
		const elW = element.offsetWidth;
		const elH = rects.noText && !isDirTop ? 0 : element.offsetHeight;

		const absoluteLeft = (isDirTop ? rects.left : rects.right) - editorLeft - elW / 2 + scrollLeft;
		const overRight = absoluteLeft + elW - editorWidth;

		let t = (isDirTop ? rects.top - elH - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : addTop) + scrollTop;
		const l = absoluteLeft < 0 ? padding : overRight < 0 ? absoluteLeft : absoluteLeft - overRight - padding - 1;

		let resetTop = false;
		const space = t + (isDirTop ? this.getGlobal(this.frameContext.get('topArea')).top : element.offsetHeight - this.frameContext.get('wysiwyg').offsetHeight);
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
			removeClass(arrow, 'se-arrow-up');
			addClass(arrow, 'se-arrow-down');
		} else {
			removeClass(arrow, 'se-arrow-down');
			addClass(arrow, 'se-arrow-up');
		}

		const arrow_left = Math.floor(elW / 2 + (absoluteLeft - l));
		arrow.style.left = (arrow_left + arrowMargin > element.offsetWidth ? element.offsetWidth - arrowMargin : arrow_left < arrowMargin ? arrowMargin : arrow_left) + 'px';
	},

	/**
	 * @private
	 * @this {OffsetThis}
	 * @description Get available space from page bottom
	 * @returns {number} Available space
	 */
	_getPageBottomSpace() {
		const topArea = this.frameContext.get('topArea');
		return _d.documentElement.scrollHeight - (this.getGlobal(topArea).top + topArea.offsetHeight);
	},

	/**
	 * @private
	 * @this {OffsetThis}
	 * @description Calculates the vertical margin offsets for the target element relative to the editor frame.
	 * - This method determines the top and bottom margins based on various conditions such as
	 * - fullscreen mode, iframe usage, toolbar height, and scroll positions.
	 * @param {number} tmtw Top margin to window
	 * @param {number} tmbw Bottom margin to window
	 * @param {number} toolbarH Toolbar height
	 * @param {{w: number, h: number}} clientSize documentElement.clientWidth, documentElement.clientHeight
	 * @param {RectsInfo} targetRect Target rect object
	 * @param {boolean} isTextSelection Is text selection or Range
	 * @param {boolean} isWWScroll Indicates if the scroll event is from the wysiwyg area
	 * @param {boolean} isToolbarTarget Indicates if the target is a toolbar element
	 * @returns {{rmt:number, rmb:number, rt:number, tMargin:number, bMargin:number}} Margin values
	 * - rmt: top margin to frame
	 * - rmb: bottom margin to frame
	 * - rt: Toolbar height offset adjustment
	 * - tMargin: top margin
	 * - bMargin: bottom margin
	 */
	_getVMargin(tmtw, tmbw, toolbarH, clientSize, targetRect, isTextSelection, isWWScroll, isToolbarTarget) {
		const isScrollable = this.status.isScrollable();
		const wwRects = this.selection.getRects(this.frameContext.get('wysiwyg'), 'start').rects;

		let rmt = 0;
		let rmb = 0;
		let rt = 0;
		let tMargin = 0;
		let bMargin = 0;

		if (this.frameContext.get('isFullScreen')) {
			rmt = tmtw - toolbarH;
			rmb = tmbw;
		} else {
			const isIframe = this.frameOptions.get('iframe');
			tMargin = targetRect.top;
			bMargin = clientSize.h - targetRect.bottom;
			const editorOffset = this.getGlobal();
			const editorScroll = this.getGlobalScroll();
			const statusBarH = this.frameContext.get('statusbar')?.offsetHeight || 0;

			if (!isTextSelection) {
				const emt = !isToolbarTarget ? editorOffset.top - editorScroll.top - editorScroll.ts : 0;
				const editorH = this.frameContext.get('topArea').offsetHeight;
				rt = !isToolbarTarget && (this.editor.toolbar.isSticky || (isScrollable && !this.toolbar._isBalloon)) ? toolbarH : 0;
				rmt = targetRect.top - (targetRect.top < 0 && emt < 0 ? 0 : emt) - rt;
				rmb = bMargin - (isWWScroll ? editorScroll.oh - (editorH + emt) : 0) - statusBarH;
			} else {
				rt = !isToolbarTarget && !this.editor.toolbar.isSticky && !this.options.get('toolbar_container') ? toolbarH : 0;
				const wst = !isIframe ? editorOffset.top - _w.scrollY + rt : 0;
				const wsb = !isIframe ? this.status.currentViewportHeight - (editorOffset.top + editorOffset.height - _w.scrollY) : 0;
				let st = wst;
				if (toolbarH > wst) {
					if (this.editor.toolbar.isSticky) {
						st = toolbarH;
					} else {
						st = wst + toolbarH;
					}
				} else if (this.options.get('toolbar_container') && !this.editor.toolbar.isSticky) {
					toolbarH = 0;
				} else {
					st = wst + toolbarH;
				}

				rmt = targetRect.top - wwRects.top - st + toolbarH;
				rmb = wwRects.bottom - targetRect.bottom - wsb;
				// display margin
				rmt = rmt > 0 ? rmt : rmt - toolbarH;
			}
		}

		return {
			rmt,
			rmb,
			rt,
			tMargin,
			bMargin,
		};
	},

	/**
	 * @private
	 * @this {OffsetThis}
	 * @description Sets the visibility and direction of the arrow element.
	 * - This method applies the appropriate class (`se-arrow-up` or `se-arrow-down`)
	 * - based on the specified direction key and adjusts the visibility of the arrow.
	 * @param {HTMLElement} arrow - The arrow element to be updated.
	 * @param {string} key - The direction of the arrow. ("up"|"down"|"")
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
	 * @this {OffsetThis}
	 * @description Retrieves the current window scroll position and viewport size.
	 * - Returns an object containing the scroll offsets, viewport dimensions, and boundary rects.
	 * @returns {{
	 *   top: number,
	 *   left: number,
	 *   width: number,
	 *   height: number,
	 *   bottom: number,
	 *   rects: RectsInfo
	 * }} An object with scroll and viewport information.
	 */
	_getWindowScroll() {
		const viewPort = getClientSize(_d);
		return {
			top: _w.scrollY,
			left: _w.scrollX,
			width: viewPort.w,
			height: viewPort.h,
			bottom: _w.scrollY + viewPort.h,
			rects: {
				left: 0,
				top: 0,
				right: _w.innerWidth,
				bottom: this.status.currentViewportHeight || _w.innerHeight,
				noText: true,
			},
		};
	},

	constructor: Offset,
};

export default Offset;
