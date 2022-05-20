/**
 * @fileoverview Toolbar class
 * @author Yi JiHong.
 */

import Context from '../context';
import { domUtils, unicode } from '../../helper';
import { _w, _d } from '../../helper/global';
import CoreInterface from '../../interface/_core';

const Toolbar = function (editor) {
	CoreInterface.call(this, editor);
	this._responsiveCurrentSize = 'default';
	this._responsiveButtons = editor._responsiveButtons;
	this._responsiveButtonSize = null;
	this._sticky = false;
	this._inlineToolbarAttr = {
		top: '',
		width: '',
		isShow: false
	};
};

Toolbar.prototype = {
	/**
	 * @description Disable the toolbar
	 */
	disable: function () {
		/** off menus */
		this.menu.dropdownOff();
		this.menu._moreLayerOff();
		this.menu.containerOff();
		this.context.buttons.cover.style.display = 'block';
	},

	/**
	 * @description Enable the toolbar
	 */
	enable: function () {
		this.context.buttons.cover.style.display = 'none';
	},

	/**
	 * @description Show the toolbar
	 */
	show: function () {
		if (this.editor._isInline) {
			this._showInline();
		} else if (this.editor._isBalloon) {
			this._showBalloon();
		} else {
			this.context.element.toolbar.style.display = '';
			this.context.element._stickyDummy.style.display = '';
		}
	},

	/**
	 * @description Hide the toolbar
	 */
	hide: function () {
		if (this.editor._isInline) {
			this.context.element.toolbar.style.display = 'none';
			this._inlineToolbarAttr.isShow = false;
		} else {
			this.context.element.toolbar.style.display = 'none';
			this.context.element._stickyDummy.style.display = 'none';
		}
	},

	/**
	 * @description Reset the buttons on the toolbar. (Editor is not reloaded)
	 * You cannot set a new plugin for the button.
	 * @param {Array} buttonList Button list
	 */
	setButtons: function (buttonList) {
		this.menu.dropdownOff();
		this.menu.containerOff();
		this.menu._moreLayerOff();

		const newToolbar = Constructor._createToolBar(this._d, buttonList, this.plugins, this.options);
		_responsiveButtons = newToolbar.responsiveButtons;
		this._setResponsive();

		this.context.element.toolbar.replaceChild(newToolbar._buttonTray, this.context.element._buttonTray);
		const newContext = Context(this.context.element.originElement, this.editor._getConstructed(this.context.element), this.options);

		this.context.element = newContext.element;
		this.context.tool = newContext.tool;
		if (this.options.iframe) this.context.element.wysiwyg = this._wd.body;

		this.editor._recoverButtonStates();
		this.editor._cachingButtons();
		this.history._resetCachingButton();

		this.editor.effectNode = null;
		if (core.hasFocus) this.eventMenager.applyTagEffect();
		if (core.isReadOnly) domUtils.setDisabled(true, this.editor.resizingDisabledButtons);
		if (typeof this.events.onSetToolbarButtons === 'function') this.events.onSetToolbarButtons(newToolbar._buttonTray.querySelectorAll('button'), core);
	},

	/**
	 * @description Reset buttons of the responsive toolbar.
	 */
	resetResponsiveToolbar: function () {
		this.menu.containerOff();

		const responsiveSize = this._responsiveButtonSize;
		if (responsiveSize) {
			let w = 0;
			if ((this.editor._isBalloon || this.editor._isInline) && this.options.toolbar_width === 'auto') {
				w = this.context.element.topArea.offsetWidth;
			} else {
				w = this.context.element.toolbar.offsetWidth;
			}

			let responsiveWidth = 'default';
			for (let i = 1, len = responsiveSize.length; i < len; i++) {
				if (w < responsiveSize[i]) {
					responsiveWidth = responsiveSize[i] + '';
					break;
				}
			}

			if (this._responsiveCurrentSize !== responsiveWidth) {
				this._responsiveCurrentSize = responsiveWidth;
				this.setButtons(this._responsiveButtons[responsiveWidth]);
			}
		}
	},

	_resetSticky: function () {
		if (this.status.isFullScreen || this.context.element.toolbar.offsetWidth === 0 || this.options.toolbar_sticky < 0) return;

		const element = this.context.element;
		const editorHeight = element.editorArea.offsetHeight;
		const y = (_w.scrollY || _d.documentElement.scrollTop) + this.options.toolbar_sticky;
		const editorTop = this.offset.getGlobal(this.options.toolbar_container).top - (this.editor._isInline ? element.toolbar.offsetHeight : 0);
		const inlineOffset = this.editor._isInline && y - editorTop > 0 ? y - editorTop - this.context.element.toolbar.offsetHeight : 0;

		if (y < editorTop) {
			this._offSticky();
		} else if (y + this.status._minHeight >= editorHeight + editorTop) {
			if (!this._sticky) this._onSticky(inlineOffset);
			element.toolbar.style.top = inlineOffset + editorHeight + editorTop + this.options.toolbar_sticky - y - this.status._minHeight + 'px';
		} else if (y >= editorTop) {
			this._onSticky(inlineOffset);
		}
	},

	_onSticky: function (inlineOffset) {
		const element = this.context.element;

		if (!this.editor._isInline && !this.options.toolbar_container) {
			element._stickyDummy.style.height = element.toolbar.offsetHeight + 'px';
			element._stickyDummy.style.display = 'block';
		}

		element.toolbar.style.top = this.options.toolbar_sticky + inlineOffset + 'px';
		element.toolbar.style.width = this.editor._isInline ? this._inlineToolbarAttr.width : element.toolbar.offsetWidth + 'px';
		domUtils.addClass(element.toolbar, 'se-toolbar-sticky');
		this._sticky = true;
	},

	_offSticky: function () {
		const element = this.context.element;

		element._stickyDummy.style.display = 'none';
		element.toolbar.style.top = this.editor._isInline ? this._inlineToolbarAttr.top : '';
		element.toolbar.style.width = this.editor._isInline ? this._inlineToolbarAttr.width : '';
		element.editorArea.style.marginTop = '';

		domUtils.removeClass(element.toolbar, 'se-toolbar-sticky');
		this._sticky = false;
	},

	_setResponsive: function () {
		if (this._responsiveButtons && this._responsiveButtons.length === 0) {
			this._responsiveButtons = null;
			return;
		}

		this._responsiveCurrentSize = 'default';
		const sizeArray = (this._responsiveButtonSize = []);
		const buttonsObj = (this._responsiveButtons = {
			default: this._responsiveButtons[0]
		});
		for (let i = 1, len = this._responsiveButtons.length, size, buttonGroup; i < len; i++) {
			buttonGroup = this._responsiveButtons[i];
			size = buttonGroup[0] * 1;
			sizeArray.push(size);
			buttonsObj[size] = buttonGroup[1];
		}

		sizeArray
			.sort(function (a, b) {
				return a - b;
			})
			.unshift('default');
	},

	_showBalloon: function (rangeObj) {
		if (!this.editor._isBalloon) return;

		const range = rangeObj || this.selection.getRange();
		const toolbar = this.context.element.toolbar;
		const topArea = this.context.element.topArea;
		const selection = this.selection.get();

		let isDirTop;
		if (this.editor._isBalloonAlways && range.collapsed) {
			isDirTop = true;
		} else if (selection.focusNode === selection.anchorNode) {
			isDirTop = selection.focusOffset < selection.anchorOffset;
		} else {
			const childNodes = domUtils.getListChildNodes(range.commonAncestorContainer, null);
			isDirTop = domUtils.getArrayIndex(childNodes, selection.focusNode) < domUtils.getArrayIndex(childNodes, selection.anchorNode);
		}

		let rects = range.getClientRects();
		rects = rects[isDirTop ? 0 : rects.length - 1];

		const globalScroll = this.offset.getGlobalScroll();
		let scrollLeft = globalScroll.left;
		let scrollTop = globalScroll.top;

		const editorWidth = topArea.offsetWidth;
		const offsets = this.offset.getGlobal(this.context.element.topArea);
		const stickyTop = offsets.top;
		const editorLeft = offsets.left;

		toolbar.style.top = '-10000px';
		toolbar.style.visibility = 'hidden';
		toolbar.style.display = 'block';

		if (!rects) {
			const node = this.selection.getNode();
			if (this.format.isLine(node)) {
				const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
				this.html.insertNode(zeroWidth, null, false);
				this.selection.setRange(zeroWidth, 1, zeroWidth, 1);
				this.selection._init();
				rects = this.selection.getRange().getClientRects();
				rects = rects[isDirTop ? 0 : rects.length - 1];
			}

			if (!rects) {
				const nodeOffset = this.offset.get(node);
				rects = {
					left: nodeOffset.left,
					top: nodeOffset.top,
					right: nodeOffset.left,
					bottom: nodeOffset.top + node.offsetHeight,
					noText: true
				};
				scrollLeft = 0;
				scrollTop = 0;
			}

			isDirTop = true;
		}

		const arrowMargin = _w.Math.round(this.context.element._arrow.offsetWidth / 2);
		const toolbarWidth = toolbar.offsetWidth;
		const toolbarHeight = toolbar.offsetHeight;
		const iframeRects = /iframe/i.test(this.context.element.wysiwygFrame.nodeName) ? this.context.element.wysiwygFrame.getClientRects()[0] : null;
		if (iframeRects) {
			rects = {
				left: rects.left + iframeRects.left,
				top: rects.top + iframeRects.top,
				right: rects.right + iframeRects.right - iframeRects.width,
				bottom: rects.bottom + iframeRects.bottom - iframeRects.height
			};
		}

		this._setBalloonOffset(isDirTop, rects, toolbar, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop, arrowMargin);
		if (toolbarWidth !== toolbar.offsetWidth || toolbarHeight !== toolbar.offsetHeight) {
			this._setBalloonOffset(isDirTop, rects, toolbar, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop, arrowMargin);
		}

		if (this.options.toolbar_container) {
			const editorParent = topArea.parentElement;

			let container = this.options.toolbar_container;
			let left = container.offsetLeft;
			let top = container.offsetTop;

			while (!container.parentElement.contains(editorParent) || !/^(BODY|HTML)$/i.test(container.parentElement.nodeName)) {
				container = container.offsetParent;
				left += container.offsetLeft;
				top += container.offsetTop;
			}

			toolbar.style.left = toolbar.offsetLeft - left + topArea.offsetLeft + 'px';
			toolbar.style.top = toolbar.offsetTop - top + topArea.offsetTop + 'px';
		}

		toolbar.style.visibility = '';
	},

	_setBalloonOffset: function (isDirTop, rects, toolbarEl, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop, arrowMargin) {
		const padding = 1;
		const toolbarWidth = toolbarEl.offsetWidth;
		const toolbarHeight = rects.noText && !isDirTop ? 0 : toolbarEl.offsetHeight;

		const absoluteLeft = (isDirTop ? rects.left : rects.right) - editorLeft - toolbarWidth / 2 + scrollLeft;
		const overRight = absoluteLeft + toolbarWidth - editorWidth;

		let t = (isDirTop ? rects.top - toolbarHeight - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : stickyTop) + scrollTop;
		let l = absoluteLeft < 0 ? padding : overRight < 0 ? absoluteLeft : absoluteLeft - overRight - padding - 1;

		let resetTop = false;
		const space = t + (isDirTop ? this.offset.getGlobal(this.context.element.topArea).top : toolbarEl.offsetHeight - this.context.element.wysiwyg.offsetHeight);
		if (!isDirTop && space > 0 && this._getPageBottomSpace() < space) {
			isDirTop = true;
			resetTop = true;
		} else if (isDirTop && _d.documentElement.offsetTop > space) {
			isDirTop = false;
			resetTop = true;
		}

		if (resetTop) t = (isDirTop ? rects.top - toolbarHeight - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : stickyTop) + scrollTop;

		toolbarEl.style.left = _w.Math.floor(l) + 'px';
		toolbarEl.style.top = _w.Math.floor(t) + 'px';

		if (isDirTop) {
			domUtils.removeClass(this.context.element._arrow, 'se-arrow-up');
			domUtils.addClass(this.context.element._arrow, 'se-arrow-down');
			this.context.element._arrow.style.top = toolbarHeight + 'px';
		} else {
			domUtils.removeClass(this.context.element._arrow, 'se-arrow-down');
			domUtils.addClass(this.context.element._arrow, 'se-arrow-up');
			this.context.element._arrow.style.top = -arrowMargin + 'px';
		}

		const arrow_left = _w.Math.floor(toolbarWidth / 2 + (absoluteLeft - l));
		this.context.element._arrow.style.left = (arrow_left + arrowMargin > toolbarEl.offsetWidth ? toolbarEl.offsetWidth - arrowMargin : arrow_left < arrowMargin ? arrowMargin : arrow_left) + 'px';
	},

	_getPageBottomSpace: function () {
		return _d.documentElement.scrollHeight - (this.offset.getGlobal(this.context.element.topArea).top + this.context.element.topArea.offsetHeight);
	},

	_showInline: function () {
		if (!this.editor._isInline) return;

		const toolbar = this.context.element.toolbar;
		if (this.options.toolbar_container) toolbar.style.position = 'relative';
		else toolbar.style.position = 'absolute';

		toolbar.style.visibility = 'hidden';
		toolbar.style.display = 'block';
		this._inlineToolbarAttr.width = toolbar.style.width = this.options.toolbar_width;
		this._inlineToolbarAttr.top = toolbar.style.top = (this.options.toolbar_container ? 0 : -1 - toolbar.offsetHeight) + 'px';

		if (typeof this.events.showInline === 'function') this.events.showInline(toolbar, context);

		this._resetSticky();
		this._inlineToolbarAttr.isShow = true;
		toolbar.style.visibility = '';
	},

	constructor: Toolbar
};

export default Toolbar;
