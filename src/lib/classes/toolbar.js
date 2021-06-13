/**
 * @fileoverview Toolbar class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";

function Toolbar(editor) {
	CoreInterface.call(this, editor);
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
			event._showToolbarInline();
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
			event._hideToolbar();
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
			if (!util.hasOwn(pluginCallButtons, key)) continue;
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

		if (core.hasFocus) this.editor.applyTagEffect();

		if (core._variable.isCodeView) util.addClass(core._styleCommandMap.codeView, "active");
		if (core._variable.isFullScreen) util.addClass(core._styleCommandMap.fullScreen, "active");
		if (util.hasClass(context.element.wysiwyg, "se-show-block")) util.addClass(core._styleCommandMap.showBlocks, "active");
	},

	_setResponsive: function () {
		if (_responsiveButtons.length === 0) {
			_responsiveButtons = null;
			return;
		}

		event._responsiveCurrentSize = "default";
		const sizeArray = (event._responsiveButtonSize = []);
		const buttonsObj = (event._responsiveButtons = { default: _responsiveButtons[0] });
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

	constructor: Toolbar
};

export default Toolbar;
