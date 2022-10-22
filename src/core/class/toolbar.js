/**
 * @fileoverview Toolbar class
 * @author Yi JiHong.
 */

import { domUtils } from '../../helper';
import CoreInterface from '../../interface/_core';
import { CreateToolBar } from '../constructor';

const Toolbar = function (editor) {
	CoreInterface.call(this, editor);
	this._responsiveCurrentSize = 'default';
	this._rButtonArray = editor._responsiveButtons;
	this._rButtonsize = null;
	this._sticky = false;
	this._inlineToolbarAttr = {
		top: '',
		width: '',
		isShow: false
	};
	this._balloonOffset = {
		top: 0,
		left: 0
	};

	this._setResponsive();
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
		domUtils.setDisabled(this.context.toolbar._buttonTray.querySelectorAll('.se-menu-list button[data-type]'), true);
	},

	/**
	 * @description Enable the toolbar
	 */
	enable: function () {
		domUtils.setDisabled(this.context.toolbar._buttonTray.querySelectorAll('.se-menu-list button[data-type]'), false);
	},

	/**
	 * @description Show the toolbar
	 */
	show: function () {
		if (this.editor.isInline) {
			this._showInline();
		} else if (this.editor.isBalloon) {
			this._showBalloon();
		} else {
			this.context.toolbar.main.style.display = '';
			this.context.element._stickyDummy.style.display = '';
		}
	},

	/**
	 * @description Hide the toolbar
	 */
	hide: function () {
		if (this.editor.isInline) {
			this.context.toolbar.main.style.display = 'none';
			this.context.toolbar.main.style.top = '0px';
			this._inlineToolbarAttr.isShow = false;
		} else {
			this.context.toolbar.main.style.display = 'none';
			this.context.element._stickyDummy.style.display = 'none';
			if (this.editorisBalloon) {
				this._balloonOffset = { top: 0, left: 0 };
			}
		}
	},

	/**
	 * @description Reset buttons of the responsive toolbar.
	 */
	resetResponsiveToolbar: function () {
		this.menu.containerOff();

		const responsiveSize = this._rButtonsize;
		if (responsiveSize) {
			let w = 0;
			if ((this.editor.isBalloon || this.editor.isInline) && this.options.toolbar_width === 'auto') {
				w = this.context.element.topArea.offsetWidth;
			} else {
				w = this.context.toolbar.main.offsetWidth;
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
				this.setButtons(this._rButtonArray[responsiveWidth]);
			}
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

		const newToolbar = CreateToolBar(buttonList, this.options._init_plugins, this.options);
		this.context.toolbar.main.replaceChild(newToolbar._buttonTray, this.context.toolbar._buttonTray);
		this.context.toolbar._buttonTray = newToolbar._buttonTray;

		this.editor._recoverButtonStates();
		this.editor._cachingButtons();
		this.history._resetCachingButton();
		this._resetSticky();

		this.editor.effectNode = null;
		if (this.status.hasFocus) this.eventManager.applyTagEffect();
		if (this.status.isReadOnly) domUtils.setDisabled(this.editor._controllerOnDisabledButtons, true);
		if (typeof this.events.onSetToolbarButtons === 'function') this.events.onSetToolbarButtons(newToolbar._buttonTray.querySelectorAll('button'));
	},

	_resetSticky: function () {
		if (this.status.isFullScreen || this.context.toolbar.main.offsetWidth === 0 || this.options.toolbar_sticky < 0) return;

		const toolbar = this.context.toolbar.main;
		const minHeight = this.context.element._minHeight;
		const editorHeight = this.context.element.editorArea.offsetHeight;
		const editorOffset = this.offset.getGlobal(this.context.element.topArea);
		const y = (this._w.scrollY || this._d.documentElement.scrollTop) + this.options.toolbar_sticky;
		const t = (this.editor.isBalloon || this.editor.isInline ? editorOffset.top : this.offset.getGlobal(this.options.toolbar_container).top) - (this.editor.isInline ? toolbar.offsetHeight : 0);
		const inlineOffset = 1;

		const offSticky = !this.options.toolbar_container ? editorHeight + t + this.options.toolbar_sticky - y - minHeight : editorOffset.top - this._w.scrollY + editorHeight - minHeight - this.options.toolbar_sticky - toolbar.offsetHeight;
		if (y < t) {
			this._offSticky();
		} else if (offSticky < 0) {
			if (!this._sticky) this._onSticky(inlineOffset);
			toolbar.style.top = inlineOffset + offSticky + 'px';
		} else {
			this._onSticky(inlineOffset);
		}
	},

	_onSticky: function (inlineOffset) {
		const toolbar = this.context.toolbar.main;

		if (!this.editor.isInline && !this.options.toolbar_container) {
			this.context.element._stickyDummy.style.height = toolbar.offsetHeight + 'px';
			this.context.element._stickyDummy.style.display = 'block';
		}

		toolbar.style.top = this.options.toolbar_sticky + inlineOffset + 'px';
		toolbar.style.width = this.editor.isInline ? this._inlineToolbarAttr.width : toolbar.offsetWidth + 'px';
		domUtils.addClass(toolbar, 'se-toolbar-sticky');
		this._sticky = true;
	},

	_offSticky: function () {
		const toolbar = this.context.toolbar.main;

		this.context.element._stickyDummy.style.display = 'none';
		toolbar.style.top = this.editor.isInline ? this._inlineToolbarAttr.top : '';
		toolbar.style.width = this.editor.isInline ? this._inlineToolbarAttr.width : '';
		this.context.element.editorArea.style.marginTop = '';

		domUtils.removeClass(toolbar, 'se-toolbar-sticky');
		this._sticky = false;
	},

	_setResponsive: function () {
		if (this._rButtonArray && this._rButtonArray.length === 0) {
			this._rButtonArray = null;
			return;
		}

		this._responsiveCurrentSize = 'default';
		const sizeArray = (this._rButtonsize = []);
		const _responsiveButtons = this.editor._responsiveButtons;
		const buttonsObj = (this._rButtonArray = {
			default: _responsiveButtons[0]
		});
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
			.unshift('default');
	},

	_showBalloon: function (rangeObj) {
		if (!this.editor.isBalloon || this.editor.opendControllers.length > 0) {
			return;
		}

		const range = rangeObj || this.selection.getRange();
		const toolbar = this.context.toolbar.main;
		const selection = this.selection.get();

		let isDirTop;
		if (this.editor.isBalloonAlways && range.collapsed) {
			isDirTop = true;
		} else if (selection.focusNode === selection.anchorNode) {
			isDirTop = selection.focusOffset < selection.anchorOffset;
		} else {
			const childNodes = domUtils.getListChildNodes(range.commonAncestorContainer, null);
			isDirTop = domUtils.getArrayIndex(childNodes, selection.focusNode) < domUtils.getArrayIndex(childNodes, selection.anchorNode);
		}

		toolbar.style.top = '-10000px';
		if (toolbar.style.display !== 'block') {
			toolbar.style.visibility = 'hidden';
			toolbar.style.display = 'block';
		}

		this._setBalloonOffset(isDirTop, range);

		this._w.setTimeout(function () {
			toolbar.style.visibility = '';
		});
	},

	_setBalloonOffset: function (positionTop, range) {
		range = range || this.selection.getRange();
		const rectsObj = this.selection.getRects(range, positionTop ? 'start' : 'end');
		positionTop = rectsObj.position === 'start';
		const toolbar = this.context.toolbar.main;
		const topArea = this.context.element.topArea;
		const rects = rectsObj.rects;
		const scrollLeft = rectsObj.scrollLeft;
		const scrollTop = rectsObj.scrollTop;
		const editorWidth = topArea.offsetWidth;
		const offsets = this.offset.getGlobal(topArea);
		const stickyTop = offsets.top;
		const editorLeft = offsets.left;
		const toolbarWidth = toolbar.offsetWidth;
		const toolbarHeight = toolbar.offsetHeight;

		this._setBalloonPosition(positionTop, rects, toolbar, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop);
		if (toolbarWidth !== toolbar.offsetWidth || toolbarHeight !== toolbar.offsetHeight) {
			this._setBalloonPosition(positionTop, rects, toolbar, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop);
		}

		if (this.options.toolbar_container) {
			const editorParent = this.context.element.topArea.parentElement;

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

		const wwScroll = this.offset.getWWScroll();
		this._balloonOffset = {
			top: toolbar.offsetTop + wwScroll.top,
			left: toolbar.offsetLeft + wwScroll.left,
			position: positionTop ? 'top' : 'bottom'
		};
	},

	_setBalloonPosition: function (isDirTop, rects, toolbarEl, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop) {
		const padding = 1;
		const arrow = this.context.toolbar._arrow;
		const arrowMargin = this._w.Math.round(arrow.offsetWidth / 2);
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
		} else if (isDirTop && this._d.documentElement.offsetTop > space) {
			isDirTop = false;
			resetTop = true;
		}

		if (resetTop) t = (isDirTop ? rects.top - toolbarHeight - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : stickyTop) + scrollTop;

		toolbarEl.style.left = this._w.Math.floor(l) + 'px';
		toolbarEl.style.top = this._w.Math.floor(t) + 'px';

		if (isDirTop) {
			domUtils.removeClass(arrow, 'se-arrow-up');
			domUtils.addClass(arrow, 'se-arrow-down');
			arrow.style.top = toolbarHeight - 1 + 'px';
		} else {
			domUtils.removeClass(arrow, 'se-arrow-down');
			domUtils.addClass(arrow, 'se-arrow-up');
			arrow.style.top = -arrowMargin - 1 + 'px';
		}

		const arrow_left = this._w.Math.floor(toolbarWidth / 2 + (absoluteLeft - l));
		arrow.style.left = (arrow_left + arrowMargin > toolbarEl.offsetWidth ? toolbarEl.offsetWidth - arrowMargin : arrow_left < arrowMargin ? arrowMargin : arrow_left) + 'px';
	},

	_getPageBottomSpace: function () {
		return this._d.documentElement.scrollHeight - (this.offset.getGlobal(this.context.element.topArea).top + this.context.element.topArea.offsetHeight);
	},

	_showInline: function () {
		if (!this.editor.isInline) return;

		const toolbar = this.context.toolbar.main;
		toolbar.style.visibility = 'hidden';
		toolbar.style.display = 'block';
		toolbar.style.top = '0px';
		this._inlineToolbarAttr.width = toolbar.style.width = this.options.toolbar_width;
		this._inlineToolbarAttr.top = toolbar.style.top = (this.options.toolbar_container ? -1 + (this.offset.getGlobal(this.context.element.topArea).top - this.offset.getGlobal(toolbar).top - toolbar.offsetHeight) : -1 - toolbar.offsetHeight) + 'px';

		if (typeof this.events.onShowInline === 'function') this.events.onShowInline(toolbar);

		this._resetSticky();
		this._inlineToolbarAttr.isShow = true;
		toolbar.style.visibility = '';
	},

	constructor: Toolbar
};

export default Toolbar;
