/**
 * @fileoverview Toolbar class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";
import domUtil from "../../helper/dom";

function Toolbar(editor) {
	CoreInterface.call(this, editor);
	this._responsiveCurrentSize = "default";
	this._responsiveButtonSize = null;
	this._responsiveButtons = null;
}

Toolbar.prototype = {
	/**
	 * @description Disable the toolbar
	 */
	disabled: function () {
		context.buttons.cover.style.display = "block";
	},

	/**
	 * @description Enable the toolbar
	 */
	enabled: function () {
		context.buttons.cover.style.display = "none";
	},

	/**
	 * @description Show the toolbar
	 */
	show: function () {
		if (core._isInline) {
			this._showInline();
		} else if (core._isBalloon) {
			this._showBalloon();
		} else {
			context.element.toolbar.style.display = "";
			context.element._stickyDummy.style.display = "";
		}
	},

	/**
	 * @description Hide the toolbar
	 */
	hide: function () {
		if (core._isInline) {
			context.element.toolbar.style.display = "none";
			core._inlineToolbarAttr.isShow = false;
		} else {
			context.element.toolbar.style.display = "none";
			context.element._stickyDummy.style.display = "none";
		}
	},

	/**
	 * @description Reset the buttons on the toolbar. (Editor is not reloaded)
	 * You cannot set a new plugin for the button.
	 * @param {Array} buttonList Button list
	 */
	setButtons: function (buttonList) {
		core.submenuOff();
		core.containerOff();

		const newToolbar = Constructor._createToolBar(_d, buttonList, core.plugins, options);
		_responsiveButtons = newToolbar.responsiveButtons;
		core._moreLayerActiveButton = null;
		this._setResponsive();

		context.element.toolbar.replaceChild(newToolbar._buttonTray, context.element._buttonTray);
		const newContext = Context(context.element.originElement, core._getConstructed(context.element), options);

		context.element = newContext.element;
		context.buttons = newContext.buttons;
		if (options.iframe) context.element.wysiwyg = core._wd.body;
		core._cachingButtons();
		core.history._resetCachingButton();

		core.activePlugins = [];
		const oldCallButtons = pluginCallButtons;
		pluginCallButtons = newToolbar.pluginCallButtons;
		let plugin, button, oldButton;
		for (let key in pluginCallButtons) {
			if (!pluginCallButtons.hasOwnProperty(key)) continue;
			plugin = plugins[key];
			button = pluginCallButtons[key];
			if (plugin.active && button) {
				oldButton = oldCallButtons[key];
				core.callPlugin(key, null, oldButton || button);
				if (oldButton) {
					button.parentElement.replaceChild(oldButton, button);
					pluginCallButtons[key] = oldButton;
				}
			}
		}

		if (core.hasFocus) this.editor.eventManager.applyTagEffect();

		if (core._variable.isCodeView) util.addClass(core._styleCommandMap.codeView, "active");
		if (core._variable.isFullScreen) util.addClass(core._styleCommandMap.fullScreen, "active");
		if (util.hasClass(context.element.wysiwyg, "se-show-block")) util.addClass(core._styleCommandMap.showBlocks, "active");
	},

	resetSticky: function () {
		if (core._variable.isFullScreen || context.element.toolbar.offsetWidth === 0 || options.stickyToolbar < 0) return;

		const element = context.element;
		const editorHeight = element.editorArea.offsetHeight;
		const y = (this.scrollY || _d.documentElement.scrollTop) + options.stickyToolbar;
		const editorTop = domUtil.getGlobalOffset(options.toolbarContainer).top - (core._isInline ? element.toolbar.offsetHeight : 0);
		const inlineOffset = core._isInline && y - editorTop > 0 ? y - editorTop - context.element.toolbar.offsetHeight : 0;

		if (y < editorTop) {
			this._offSticky();
		} else if (y + core._variable.minResizingSize >= editorHeight + editorTop) {
			if (!core._sticky) this._onSticky(inlineOffset);
			element.toolbar.style.top = inlineOffset + editorHeight + editorTop + options.stickyToolbar - y - core._variable.minResizingSize + "px";
		} else if (y >= editorTop) {
			this._onSticky(inlineOffset);
		}
	},

	_onSticky: function (inlineOffset) {
		const element = context.element;

		if (!core._isInline && !options.toolbarContainer) {
			element._stickyDummy.style.height = element.toolbar.offsetHeight + "px";
			element._stickyDummy.style.display = "block";
		}

		element.toolbar.style.top = options.stickyToolbar + inlineOffset + "px";
		element.toolbar.style.width = core._isInline ? core._inlineToolbarAttr.width : element.toolbar.offsetWidth + "px";
		util.addClass(element.toolbar, "se-toolbar-sticky");
		core._sticky = true;
	},

	_offSticky: function () {
		const element = context.element;

		element._stickyDummy.style.display = "none";
		element.toolbar.style.top = core._isInline ? core._inlineToolbarAttr.top : "";
		element.toolbar.style.width = core._isInline ? core._inlineToolbarAttr.width : "";
		element.editorArea.style.marginTop = "";

		util.removeClass(element.toolbar, "se-toolbar-sticky");
		core._sticky = false;
	},

	_setResponsive: function () {
		if (_responsiveButtons.length === 0) {
			_responsiveButtons = null;
			return;
		}

		this._responsiveCurrentSize = "default";
		const sizeArray = (this._responsiveButtonSize = []);
		const buttonsObj = (this._responsiveButtons = { default: _responsiveButtons[0] });
		for (let i = 1, len = _responsiveButtons.length, size, buttonGroup; i < len; i++) {
			buttonGroup = _responsiveButtons[i];
			size = buttonGroup[0] * 1;
			sizeArray.push(size);
			buttonsObj[size] = buttonGroup[1];
		}

		sizeArray
			.sort(function (a, b) {
				return a - b;
			})
			.unshift("default");
	},

	_showBalloon: function (rangeObj) {
		if (!core._isBalloon) return;

		const range = rangeObj || core.getRange();
		const toolbar = context.element.toolbar;
		const topArea = context.element.topArea;
		const selection = core.selection.get();

		let isDirTop;
		if (core._isBalloonAlways && range.collapsed) {
			isDirTop = true;
		} else if (selection.focusNode === selection.anchorNode) {
			isDirTop = selection.focusOffset < selection.anchorOffset;
		} else {
			const childNodes = util.getListChildNodes(range.commonAncestorContainer, null);
			isDirTop = util.getArrayIndex(childNodes, selection.focusNode) < util.getArrayIndex(childNodes, selection.anchorNode);
		}

		let rects = range.getClientRects();
		rects = rects[isDirTop ? 0 : rects.length - 1];

		const globalScroll = core.getGlobalScrollOffset();
		let scrollLeft = globalScroll.left;
		let scrollTop = globalScroll.top;

		const editorWidth = topArea.offsetWidth;
		const offsets = domUtil.getGlobalOffset(context.element.topArea);
		const stickyTop = offsets.top;
		const editorLeft = offsets.left;

		toolbar.style.top = "-10000px";
		toolbar.style.visibility = "hidden";
		toolbar.style.display = "block";

		if (!rects) {
			const node = core.selection.getNode();
			if (util.isFormatElement(node)) {
				const zeroWidth = util.createTextNode(util.zeroWidthSpace);
				core.insertNode(zeroWidth, null, false);
				core.setRange(zeroWidth, 1, zeroWidth, 1);
				core.selection._init();
				rects = core.getRange().getClientRects();
				rects = rects[isDirTop ? 0 : rects.length - 1];
			}

			if (!rects) {
				const nodeOffset = util.getOffset(node, context.element.wysiwygFrame);
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

		const arrowMargin = _w.Math.round(context.element._arrow.offsetWidth / 2);
		const toolbarWidth = toolbar.offsetWidth;
		const toolbarHeight = toolbar.offsetHeight;
		const iframeRects = /iframe/i.test(context.element.wysiwygFrame.nodeName) ? context.element.wysiwygFrame.getClientRects()[0] : null;
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

		if (options.toolbarContainer) {
			const editorParent = topArea.parentElement;

			let container = options.toolbarContainer;
			let left = container.offsetLeft;
			let top = container.offsetTop;

			while (!container.parentElement.contains(editorParent) || !/^(BODY|HTML)$/i.test(container.parentElement.nodeName)) {
				container = container.offsetParent;
				left += container.offsetLeft;
				top += container.offsetTop;
			}

			toolbar.style.left = toolbar.offsetLeft - left + topArea.offsetLeft + "px";
			toolbar.style.top = toolbar.offsetTop - top + topArea.offsetTop + "px";
		}

		toolbar.style.visibility = "";
	},

	_setBalloonOffset: function (isDirTop, rects, toolbar, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop, arrowMargin) {
		const padding = 1;
		const toolbarWidth = toolbar.offsetWidth;
		const toolbarHeight = rects.noText && !isDirTop ? 0 : toolbar.offsetHeight;

		const absoluteLeft = (isDirTop ? rects.left : rects.right) - editorLeft - toolbarWidth / 2 + scrollLeft;
		const overRight = absoluteLeft + toolbarWidth - editorWidth;

		let t = (isDirTop ? rects.top - toolbarHeight - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : stickyTop) + scrollTop;
		let l = absoluteLeft < 0 ? padding : overRight < 0 ? absoluteLeft : absoluteLeft - overRight - padding - 1;

		let resetTop = false;
		const space = t + (isDirTop ? domUtil.getGlobalOffset(context.element.topArea).top : toolbar.offsetHeight - context.element.wysiwyg.offsetHeight);
		if (!isDirTop && space > 0 && event._getPageBottomSpace() < space) {
			isDirTop = true;
			resetTop = true;
		} else if (isDirTop && _d.documentElement.offsetTop > space) {
			isDirTop = false;
			resetTop = true;
		}

		if (resetTop) t = (isDirTop ? rects.top - toolbarHeight - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : stickyTop) + scrollTop;

		toolbar.style.left = _w.Math.floor(l) + "px";
		toolbar.style.top = _w.Math.floor(t) + "px";

		if (isDirTop) {
			util.removeClass(context.element._arrow, "se-arrow-up");
			util.addClass(context.element._arrow, "se-arrow-down");
			context.element._arrow.style.top = toolbarHeight + "px";
		} else {
			util.removeClass(context.element._arrow, "se-arrow-down");
			util.addClass(context.element._arrow, "se-arrow-up");
			context.element._arrow.style.top = -arrowMargin + "px";
		}

		const arrow_left = _w.Math.floor(toolbarWidth / 2 + (absoluteLeft - l));
		context.element._arrow.style.left = (arrow_left + arrowMargin > toolbar.offsetWidth ? toolbar.offsetWidth - arrowMargin : arrow_left < arrowMargin ? arrowMargin : arrow_left) + "px";
	},

	_getPageBottomSpace: function () {
		return _d.documentElement.scrollHeight - (domUtil.getGlobalOffset(context.element.topArea).top + context.element.topArea.offsetHeight);
	},

	_showInline: function () {
		if (!core._isInline) return;

		const toolbar = context.element.toolbar;
		if (options.toolbarContainer) toolbar.style.position = "relative";
		else toolbar.style.position = "absolute";

		toolbar.style.visibility = "hidden";
		toolbar.style.display = "block";
		core._inlineToolbarAttr.width = toolbar.style.width = options.toolbarWidth;
		core._inlineToolbarAttr.top = toolbar.style.top = (options.toolbarContainer ? 0 : -1 - toolbar.offsetHeight) + "px";

		if (typeof this.events.showInline === "function") this.events.showInline(toolbar, context);

		this.resetSticky();
		core._inlineToolbarAttr.isShow = true;
		toolbar.style.visibility = "";
	},

	constructor: Toolbar
};

export default Toolbar;
