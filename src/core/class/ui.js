/**
 * @fileoverview UI class
 */

import CoreInjector from '../../editorInjector/_core';
import Modal from '../../modules/Modal';
import { domUtils, converter } from '../../helper';

/**
 * @constructor
 * @description The UI class is a class that handles operations related to the user interface of SunEditor.
 * This class sets the editor's style, theme, editor mode, etc., and controls the state of various UI elements.
 * @param {object} editor - editor core object
 */
const UI = function (editor) {
	CoreInjector.call(this, editor);

	// members
	const noticeModal = CreateNoticeHTML(editor);
	this.noticeModal = new Modal(this, noticeModal);
	this.noticeMessage = noticeModal.querySelector('span');
	this._backWrapper = this.carrierWrapper.querySelector('.se-back-wrapper');
	this._controllerOnBtnDisabled = false;
};

UI.prototype = {
	/**
	 * @description Set "options.get('editorStyle')" style.
	 * Define the style of the edit area
	 * It can also be defined with the "setOptions" method, but the "setEditorStyle" method does not render the editor again.
	 * @param {string} style Style string
	 * @param {FrameContext|null} fc Frame context
	 */
	setEditorStyle(style, fc) {
		fc = fc || this.editor.frameContext;
		const fo = fc.get('options');

		const newStyles = converter._setDefaultOptionStyle(fo, style);
		fo.set('_defaultStyles', newStyles);

		// top area
		fc.get('topArea').style.cssText = newStyles.top;

		// code view
		const code = fc.get('code');
		code.style.cssText = fo.get('_defaultStyles').frame;
		code.style.display = 'none';

		// wysiwyg frame
		if (!fo.get('iframe')) {
			fc.get('wysiwygFrame').style.cssText = newStyles.frame + newStyles.editor;
		} else {
			fc.get('wysiwygFrame').style.cssText = newStyles.frame;
			fc.get('wysiwyg').style.cssText = newStyles.editor;
		}
	},

	/**
	 * @description Set the theme to the editor
	 * @param {string} theme Theme name
	 */
	setTheme(theme) {
		if (typeof theme !== 'string') return;
		const o = this.options;
		const prevTheme = o.get('_themeClass').trim();
		o.set('theme', theme || '');
		o.set('_themeClass', theme ? ` se-theme-${theme}` : '');
		theme = o.get('_themeClass').trim();

		const applyTheme = (target) => {
			if (!target) return;
			if (prevTheme) domUtils.removeClass(target, prevTheme);
			if (theme) domUtils.addClass(target, theme);
		};

		applyTheme(this.carrierWrapper);
		this.editor.applyFrameRoots((e) => {
			applyTheme(e.get('topArea'));
			applyTheme(e.get('wysiwyg'));
		});

		applyTheme(this.context.get('statusbar._wrapper'));
		applyTheme(this.context.get('toolbar._wrapper'));
	},

	/**
	 * @description Switch to or off "ReadOnly" mode.
	 * @param {boolean} value "readOnly" boolean value.
	 * @param {string|undefined} rootKey Root key
	 */
	readOnly(value, rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.editor.frameContext;

		fc.set('isReadOnly', !!value);
		domUtils.setDisabled(this.editor._controllerOnDisabledButtons, !!value);

		if (value) {
			this._offCurrentController();
			this._offCurrentModal();

			if (this.toolbar?.currentMoreLayerActiveButton?.disabled) this.toolbar.moreLayerOff();
			if (this.subToolbar?.currentMoreLayerActiveButton?.disabled) this.subToolbar.moreLayerOff();
			if (this.menu?.currentDropdownActiveButton?.disabled) this.menu.dropdownOff();
			if (this.menu?.currentContainerActiveButton?.disabled) this.menu.containerOff();

			fc.get('code').setAttribute('readOnly', 'true');
			domUtils.addClass(fc.get('wysiwyg'), 'se-read-only');
		} else {
			fc.get('code').removeAttribute('readOnly');
			domUtils.removeClass(fc.get('wysiwyg'), 'se-read-only');
		}

		if (this.options.get('hasCodeMirror')) {
			this.viewer._codeMirrorEditor('readonly', !!value, rootKey);
		}
	},

	/**
	 * @description Disable the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	disable(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.editor.frameContext;

		this.toolbar.disable();
		this._offCurrentController();
		this._offCurrentModal();

		fc.get('wysiwyg').setAttribute('contenteditable', false);
		fc.set('isDisabled', true);

		if (this.options.get('hasCodeMirror')) {
			this.viewer._codeMirrorEditor('readonly', true, rootKey);
		} else {
			fc.get('code').setAttribute('disabled', true);
		}
	},

	/**
	 * @description Enable the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	enable(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.editor.frameContext;

		this.toolbar.enable();
		fc.get('wysiwyg').setAttribute('contenteditable', true);
		fc.set('isDisabled', false);

		if (this.options.get('hasCodeMirror')) {
			this.viewer._codeMirrorEditor('readonly', false, rootKey);
		} else {
			fc.get('code').removeAttribute('disabled');
		}
	},

	/**
	 * @description Show the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	show(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.editor.frameContext;
		const topAreaStyle = fc.get('topArea').style;
		if (topAreaStyle.display === 'none') topAreaStyle.display = 'block';
	},

	/**
	 * @description Hide the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	hide(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.editor.frameContext;
		fc.get('topArea').style.display = 'none';
	},

	/**
	 * @description Show loading box
	 * @param {string|undefined} rootKey Root key
	 */
	showLoading(rootKey) {
		(rootKey ? this.frameRoots.get(rootKey).get('container') : this.carrierWrapper).querySelector('.se-loading-box').style.display = 'block';
	},

	/**
	 * @description Hide loading box
	 * @param {string|undefined} rootKey Root key
	 */
	hideLoading(rootKey) {
		(rootKey ? this.frameRoots.get(rootKey).get('container') : this.carrierWrapper).querySelector('.se-loading-box').style.display = 'none';
	},

	/**
	 * @description This method disables or enables the toolbar buttons when the controller is activated or deactivated.
	 *              When the controller is activated, the toolbar buttons are disabled; when the controller is deactivated, the buttons are enabled.
	 * @param {boolean} active If `true`, the toolbar buttons will be disabled. If `false`, the toolbar buttons will be enabled.
	 */
	setControllerOnDisabledButtons(active) {
		if (active && !this._controllerOnBtnDisabled) {
			domUtils.setDisabled(this.editor._controllerOnDisabledButtons, true);
			this._controllerOnBtnDisabled = true;
		} else if (!active && this._controllerOnBtnDisabled) {
			domUtils.setDisabled(this.editor._controllerOnDisabledButtons, false);
			this._controllerOnBtnDisabled = false;
		}
	},

	/**
	 * @description Activate the transparent background "div" so that other elements are not affected during resizing.
	 * @param {cursor} cursor cursor css property
	 */
	enableBackWrapper(cursor) {
		this._backWrapper.style.cursor = cursor;
		this._backWrapper.style.display = 'block';
	},

	/**
	 * @description Disabled background "div"
	 */
	disableBackWrapper() {
		this._backWrapper.style.display = 'none';
		this._backWrapper.style.cursor = 'default';
	},

	/**
	 * @description  Open the notice panel
	 * @param {string} text Notice message
	 */
	noticeOpen(text) {
		this.noticeMessage.textContent = text;
		this.noticeModal.open();
	},

	/**
	 * @description  Close the notice panel
	 */
	noticeClose() {
		this.noticeModal.close();
	},

	/**
	 * @description visible controllers
	 * @param {boolean} value hidden/show
	 * @param {boolean?} lineBreakShow Line break hidden/show (default: Follows the value "value".)
	 * @private
	 */
	_visibleControllers(value, lineBreakShow) {
		const visible = value ? '' : 'hidden';
		const breakerVisible = lineBreakShow ?? visible ? '' : 'hidden';

		const cont = this.editor.opendControllers;
		for (let i = 0, c; i < cont.length; i++) {
			c = cont[i];
			if (c.form) c.form.style.visibility = visible;
		}

		this.editor._lineBreaker_t.style.visibility = breakerVisible;
		this.editor._lineBreaker_b.style.visibility = breakerVisible;
	},

	/**
	 * @description Off current controllers
	 * @private
	 */
	_offCurrentController() {
		this.component.__deselect();
	},

	/**
	 * @description Off controllers
	 * @private
	 */
	__offControllers() {
		const cont = this.editor.opendControllers;
		const fixedCont = [];
		for (let i = 0, c; i < cont.length; i++) {
			c = cont[i];
			if (c.fixed) {
				fixedCont.push(c);
				continue;
			}
			if (typeof c.inst.close === 'function') c.inst.close();
			if (c.form) c.form.style.display = 'none';
		}
		this.editor.opendControllers = fixedCont;
		this.editor.currentControllerName = '';
		this.editor._preventBlur = false;
	},

	/**
	 * @description Off current modal
	 * @private
	 */
	_offCurrentModal() {
		if (this.opendModal) {
			this.opendModal.close();
		}
	},

	constructor: UI
};

function CreateNoticeHTML({ lang, icons }) {
	const html = '<div><button class="close" data-command="close" title="' + lang.close + '">' + icons.cancel + '</button></div><div><span></span></div>';
	return domUtils.createElement('DIV', { class: 'se-notice' }, html);
}

export default UI;
