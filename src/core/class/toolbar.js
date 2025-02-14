/**
 * @fileoverview Toolbar class
 */

import { domUtils, env } from '../../helper';
import CoreInjector from '../../editorInjector/_core';
import { CreateToolBar, UpdateButton } from '../section/constructor';

const { _w } = env;

/**
 * @constructor
 * @description Toolbar class
 * @param {EditorInstance} editor - The root editor instance
 * @param {Object} options - toolbar options
 * @param {String} options.keyName - toolbar key name
 * @param {Boolean} options.balloon - balloon toolbar
 * @param {Boolean} options.inline - inline toolbar
 * @param {Boolean} options.balloonAlways - balloon toolbar always show
 * @param {Array} options.res - responsive toolbar button list
 */
function Toolbar(editor, { keyName, balloon, inline, balloonAlways, res }) {
	CoreInjector.call(this, editor);

	// members
	this.keyName = keyName;
	this.isSub = /sub/.test(keyName);
	this.currentMoreLayerActiveButton = null;
	this._isBalloon = balloon;
	this._isInline = inline;
	this._isBalloonAlways = balloonAlways;
	this._responsiveCurrentSize = 'default';
	this._originRes = res;
	this._rButtonArray = res;
	this._rButtonsize = null;
	this._sticky = false;
	this._isViewPortSize = 'visualViewport' in _w;
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
}

Toolbar.prototype = {
	/**
	 * @description Disable the toolbar
	 */
	disable() {
		/** off menus */
		this._moreLayerOff();
		this.menu.dropdownOff();
		this.menu.containerOff();
		domUtils.setDisabled(this.context.get(this.keyName + '.buttonTray').querySelectorAll('.se-menu-list .se-toolbar-btn[data-type]'), true);
	},

	/**
	 * @description Enable the toolbar
	 */
	enable() {
		domUtils.setDisabled(this.context.get(this.keyName + '.buttonTray').querySelectorAll('.se-menu-list .se-toolbar-btn[data-type]'), false);
	},

	/**
	 * @description Show the toolbar
	 */
	show() {
		if (this._isInline) {
			this._showInline();
		} else if (this._isBalloon) {
			this._showBalloon();
		} else {
			this.context.get(this.keyName + '.main').style.display = '';
			if (!this.isSub) this.editor.frameContext.get('_stickyDummy').style.display = '';
		}

		if (!this.isSub) this.resetResponsiveToolbar();
	},

	/**
	 * @description Hide the toolbar
	 */
	hide() {
		if (this._isInline) {
			this.context.get(this.keyName + '.main').style.display = 'none';
			this.context.get(this.keyName + '.main').style.top = '0px';
			this._inlineToolbarAttr.isShow = false;
		} else {
			this.context.get(this.keyName + '.main').style.display = 'none';
			if (!this.isSub) this.editor.frameContext.get('_stickyDummy').style.display = 'none';
			if (this.editorisBalloon) {
				this._balloonOffset = {
					top: 0,
					left: 0
				};
			}
		}
	},

	/**
	 * @description Reset buttons of the responsive toolbar.
	 */
	resetResponsiveToolbar() {
		this.menu.containerOff();

		const responsiveSize = this._rButtonsize;
		if (responsiveSize) {
			let w = 0;
			if (((this._isBalloon || this._isInline) && this.options.get('toolbar_width') === 'auto') || (this._isSubBalloon && this.options.get('toolbar.sub_width') === 'auto')) {
				w = this.editor.frameContext.get('topArea').offsetWidth;
			} else {
				w = this.context.get(this.keyName + '.main').offsetWidth;
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
				// this.viewer._resetFullScreenHeight();
			}
		}
	},

	/**
	 * @description Reset the buttons on the toolbar. (Editor is not reloaded)
	 * - You cannot set a new plugin for the button.
	 * @param {Array} buttonList Button list
	 */
	setButtons(buttonList) {
		this._moreLayerOff();
		this.menu.dropdownOff();
		this.menu.containerOff();

		const { options, icons, lang, isSub } = this;
		const newToolbar = CreateToolBar(buttonList, this.plugins, options, icons, lang, true);

		const shortcutss = options.get('shortcuts');
		newToolbar.updateButtons.forEach((v) => UpdateButton(v.button, v.plugin, this.icons, this.lang, shortcutss[v.key]));

		let cmdButtons;
		if (isSub) cmdButtons = this.editor.subAllCommandButtons = new Map();
		else cmdButtons = this.editor.allCommandButtons = new Map();
		this.editor.commandTargets = new Map();
		this.editor.__saveCommandButtons(cmdButtons, newToolbar.buttonTray);

		this.context.get(this.keyName + '.main').replaceChild(newToolbar.buttonTray, this.context.get(this.keyName + '.buttonTray'));
		this.context.set(this.keyName + '.buttonTray', newToolbar.buttonTray);

		this.editor.__setDisabledButtons();

		this.history.resetButtons(this.editor.frameContext.get('key'), null);
		this._resetSticky();

		this.editor.effectNode = null;
		this.viewer._setButtonsActive();
		if (this.status.hasFocus) this.eventManager.applyTagEffect();
		if (this.editor.frameContext.get('isReadOnly')) this.ui.setControllerOnDisabledButtons(true);

		this.triggerEvent('onSetToolbarButtons', { buttonTray: newToolbar.buttonTray, frameContext: this.editor.frameContext });
	},

	/**
	 * @description Reset the sticky toolbar position based on the editor state.
	 */
	_resetSticky() {
		const wrapper = this.editor.frameContext.get('wrapper');
		if (!wrapper) return;

		const toolbar = this.context.get(this.keyName + '.main');
		if (this.editor.frameContext.get('isFullScreen') || toolbar.offsetWidth === 0 || this.options.get('toolbar_sticky') < 0) return;

		const currentScrollY = this._isViewPortSize ? _w.visualViewport.pageTop : _w.scrollY;

		const minHeight = this.editor.frameContext.get('_minHeight');
		const editorHeight = wrapper.offsetHeight;
		const editorOffset = this.offset.getGlobal(this.editor.frameContext.get('topArea'));
		const y = currentScrollY + this.options.get('toolbar_sticky');
		const t = (this._isBalloon || this._isInline ? editorOffset.top : this.offset.getGlobal(this.options.get('toolbar_container')).top) - (this._isInline ? toolbar.offsetHeight : 0);
		const inlineOffset = 1;

		const offSticky = !this.options.get('toolbar_container')
			? editorHeight + t + this.options.get('toolbar_sticky') - y - minHeight
			: editorOffset.top - currentScrollY + editorHeight - minHeight - this.options.get('toolbar_sticky') - toolbar.offsetHeight;
		if (y < t) {
			this._offSticky();
		} else if (offSticky < 0) {
			if (!this._sticky) this._onSticky(inlineOffset);
			toolbar.style.top = inlineOffset + offSticky + this.__getViewportTop() + 'px';
		} else {
			this._onSticky(inlineOffset);
		}
	},

	/**
	 * @description Enable sticky toolbar mode and adjust position.
	 */
	_onSticky(inlineOffset) {
		const toolbar = this.context.get(this.keyName + '.main');

		if (!this._isInline) {
			const stickyDummy = !this.options.get('toolbar_container') ? this.editor.frameContext.get('_stickyDummy') : this.context.get('_stickyDummy');
			stickyDummy.style.height = toolbar.offsetHeight + 'px';
			stickyDummy.style.display = 'block';
		}

		const toolbarTopPosition = this.options.get('toolbar_sticky') + inlineOffset + this.__getViewportTop();
		toolbar.style.top = `${toolbarTopPosition}px`;
		toolbar.style.width = this._isInline ? this._inlineToolbarAttr.width : toolbar.offsetWidth + 'px';
		domUtils.addClass(toolbar, 'se-toolbar-sticky');
		this._sticky = true;
	},

	/**
	 * @description Get the viewport's top offset.
	 * @returns {number}
	 */
	__getViewportTop() {
		if (this._isViewPortSize) {
			return _w.visualViewport.offsetTop;
		}
		return 0;
	},

	/**
	 * @description Disable sticky toolbar mode.
	 */
	_offSticky() {
		const stickyDummy = !this.options.get('toolbar_container') ? this.editor.frameContext.get('_stickyDummy') : this.context.get('_stickyDummy');
		stickyDummy.style.display = 'none';

		const toolbar = this.context.get(this.keyName + '.main');
		toolbar.style.top = this._isInline ? this._inlineToolbarAttr.top : '';
		toolbar.style.width = this._isInline ? this._inlineToolbarAttr.width : '';
		this.editor.frameContext.get('wrapper').style.marginTop = '';

		domUtils.removeClass(toolbar, 'se-toolbar-sticky');
		this._sticky = false;
	},

	/**
	 * @description Set up responsive behavior for the toolbar buttons.
	 */
	_setResponsive() {
		if (this._rButtonArray?.length === 0) {
			this._rButtonArray = null;
			return;
		}

		this._responsiveCurrentSize = 'default';
		const _rButtonsize = (this._rButtonsize = []);
		const _responsiveButtons = this._originRes;
		const buttonsObj = (this._rButtonArray = {
			default: _responsiveButtons[0]
		});

		for (let i = 1, len = _responsiveButtons.length, size, buttonGroup; i < len; i++) {
			buttonGroup = _responsiveButtons[i];
			size = buttonGroup[0] * 1;
			_rButtonsize.push(size);
			buttonsObj[size] = buttonGroup[1];
		}

		_rButtonsize.sort((a, b) => a - b).unshift('default');
	},

	/**
	 * @description Show the balloon toolbar based on the current selection.
	 */
	_showBalloon(rangeObj) {
		if (!this._isBalloon || this.editor.opendControllers.length > 0) {
			return;
		}
		if (this.isSub) this.resetResponsiveToolbar();

		const range = rangeObj || this.selection.getRange();
		const toolbar = this.context.get(this.keyName + '.main');
		const selection = this.selection.get();

		let isDirTop;
		if (this._isBalloonAlways && range.collapsed) {
			isDirTop = true;
		} else if (selection.focusNode === selection.anchorNode) {
			isDirTop = selection.focusOffset < selection.anchorOffset;
		} else {
			const childNodes = domUtils.getListChildNodes(range.commonAncestorContainer, null);
			isDirTop = domUtils.getArrayIndex(childNodes, selection.focusNode) < domUtils.getArrayIndex(childNodes, selection.anchorNode);
		}

		this._setBalloonOffset(isDirTop, range);

		this.triggerEvent('onShowToolbar', { toolbar, mode: 'balloon', frameContext: this.editor.frameContext });
	},

	/**
	 * @description Adjust the balloon toolbar's position.
	 */
	_setBalloonOffset(positionTop, range) {
		const toolbar = this.context.get(this.keyName + '.main');
		const topArea = this.editor.frameContext.get('topArea');
		const offsets = this.offset.getGlobal(topArea);
		const stickyTop = offsets.top;

		if (!this.offset.setRangePosition(toolbar, range, { position: positionTop ? 'top' : 'bottom', addTop: stickyTop })) {
			this.hide();
			return;
		}

		if (this.options.get('toolbar_container')) {
			const editorParent = topArea.parentElement;

			let container = this.options.get('toolbar_container');
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

	/**
	 * @description Show the inline toolbar mode.
	 */
	_showInline() {
		if (!this._isInline) return;

		const toolbar = this.context.get(this.keyName + '.main');
		toolbar.style.visibility = 'hidden';
		this._offSticky();

		toolbar.style.display = 'block';
		toolbar.style.top = '0px';
		this._inlineToolbarAttr.width = toolbar.style.width = this.options.get(this.keyName + '_width');
		this._inlineToolbarAttr.top = toolbar.style.top = -1 + (this.offset.getGlobal(this.editor.frameContext.get('topArea')).top - this.offset.getGlobal(toolbar).top - toolbar.offsetHeight) + 'px';

		this._resetSticky();
		this._inlineToolbarAttr.isShow = true;

		this.triggerEvent('onShowToolbar', { toolbar, mode: 'inline' });

		toolbar.style.visibility = '';
	},

	/**
	 * @description Show a more options layer for toolbar buttons.
	 */
	_moreLayerOn(button, layer) {
		this._moreLayerOff();
		this.currentMoreLayerActiveButton = button;
		layer.style.display = 'block';
	},

	/**
	 * @description Hide the currently active more options layer.
	 */
	_moreLayerOff() {
		if (this.currentMoreLayerActiveButton) {
			const layer = this.context.get(this.keyName + '.main').querySelector('.' + this.currentMoreLayerActiveButton.getAttribute('data-command'));
			layer.style.display = 'none';
			domUtils.removeClass(this.currentMoreLayerActiveButton, 'on');
			this.currentMoreLayerActiveButton = null;
		}
	},

	constructor: Toolbar
};

export default Toolbar;
