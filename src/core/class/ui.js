/**
 * @fileoverview UI class
 */

import CoreInjector from '../../editorInjector/_core';
import { dom, converter, keyCodeMap, env } from '../../helper';
const { _w } = env;

/**
 * @typedef {Omit<UI & Partial<SunEditor.Injector_Core>, 'ui'>} UIThis
 */

/**
 * @constructor
 * @this {UIThis}
 * @description The UI class is a class that handles operations related to the user interface of SunEditor.
 * - This class sets the editor's style, theme, editor mode, etc., and controls the state of various UI elements.
 * @param {SunEditor.Core} editor - The root editor instance
 */
function UI(editor) {
	CoreInjector.call(this, editor);

	// members
	this._controllerOnBtnDisabled = false;

	// members - modal
	const alertModal = CreateAlertHTML(editor);
	this.alertModal = alertModal;
	this.alertMessage = alertModal.querySelector('span');
	this._alertArea = /** @type {HTMLElement} */ (this.carrierWrapper.querySelector('.se-alert'));
	this._alertInner = /** @type {HTMLElement} */ (this.carrierWrapper.querySelector('.se-alert .se-modal-inner'));
	this._alertInner.appendChild(alertModal);

	this._closeListener = [CloseListener.bind(this), OnClick_alert.bind(this)];
	this._closeSignal = !this.eventManager.addEvent(alertModal.querySelector('[data-command="close"]'), 'click', this.alertClose.bind(this));
	this._bindClose = null;
	this._backWrapper = /** @type {HTMLElement} */ (this.carrierWrapper.querySelector('.se-back-wrapper'));

	// members - toast
	const toastPopup = CreateToastHTML();
	this.toastPopup = toastPopup;
	this.toastContainer = toastPopup.querySelector('.se-toast-container');
	this.toastMessage = toastPopup.querySelector('span');
	this.carrierWrapper.appendChild(toastPopup);
	this._toastToggle = null;
}

UI.prototype = {
	/** @internal @type {SunEditor.Core['toolbar']} */
	get toolbar() {
		return this.editor.toolbar;
	},
	/** @internal @type {SunEditor.Core['subToolbar']} */
	get subToolbar() {
		return this.editor.subToolbar;
	},
	/** @internal @type {SunEditor.Core['menu']} */
	get menu() {
		return this.editor.menu;
	},
	/** @internal @type {SunEditor.Core['component']} */
	get component() {
		return this.editor.component;
	},
	/** @internal @type {SunEditor.Core['viewer']} */
	get viewer() {
		return this.editor.viewer;
	},

	/**
	 * @this {UIThis}
	 * @description set editor frame styles.
	 * - Define the style of the edit area
	 * - It can also be defined with the "setOptions" method, but the "setEditorStyle" method does not render the editor again.
	 * @param {string} style Style string
	 * @param {?SunEditor.FrameContext} [fc] Frame context
	 */
	setEditorStyle(style, fc) {
		fc ||= this.frameContext;

		const fo = fc.get('options');
		fo.set('editorStyle', style);

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
	 * @this {UIThis}
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
			if (prevTheme) dom.utils.removeClass(target, prevTheme);
			if (theme) dom.utils.addClass(target, theme);
		};

		applyTheme(this.carrierWrapper);
		this.editor.applyFrameRoots((e) => {
			applyTheme(e.get('topArea'));
			applyTheme(e.get('wysiwyg'));
		});

		applyTheme(this.context.get('statusbar_wrapper'));
		applyTheme(this.context.get('toolbar_wrapper'));
	},

	/**
	 * @this {UIThis}
	 * @description Switch to or off "ReadOnly" mode.
	 * @param {boolean} value "readOnly" boolean value.
	 * @param {string} [rootKey] Root key
	 */
	readOnly(value, rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.frameContext;

		fc.set('isReadOnly', !!value);
		dom.utils.setDisabled(this.editor._controllerOnDisabledButtons, !!value);

		if (value) {
			this._offCurrentController();
			this._offCurrentModal();

			if (this.toolbar?.currentMoreLayerActiveButton?.disabled) this.toolbar._moreLayerOff();
			if (this.subToolbar?.currentMoreLayerActiveButton?.disabled) this.subToolbar._moreLayerOff();
			if (this.menu?.currentDropdownActiveButton?.disabled) this.menu.dropdownOff();
			if (this.menu?.currentContainerActiveButton?.disabled) this.menu.containerOff();

			fc.get('code').setAttribute('readOnly', 'true');
			dom.utils.addClass(fc.get('wysiwyg'), 'se-read-only');
		} else {
			fc.get('code').removeAttribute('readOnly');
			dom.utils.removeClass(fc.get('wysiwyg'), 'se-read-only');
		}

		if (this.options.get('hasCodeMirror')) {
			this.viewer._codeMirrorEditor('readonly', !!value, rootKey);
		}
	},

	/**
	 * @this {UIThis}
	 * @description Disables the editor.
	 * @param {string} [rootKey] Root key
	 */
	disable(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.frameContext;

		this.toolbar.disable();
		this._offCurrentController();
		this._offCurrentModal();

		fc.get('wysiwyg').setAttribute('contenteditable', false);
		fc.set('isDisabled', true);

		if (this.options.get('hasCodeMirror')) {
			this.viewer._codeMirrorEditor('readonly', true, rootKey);
		} else {
			fc.get('code').disabled = true;
		}
	},

	/**
	 * @this {UIThis}
	 * @description Enables the editor.
	 * @param {string} [rootKey] Root key
	 */
	enable(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.frameContext;

		this.toolbar.enable();
		fc.get('wysiwyg').setAttribute('contenteditable', true);
		fc.set('isDisabled', false);

		if (this.options.get('hasCodeMirror')) {
			this.viewer._codeMirrorEditor('readonly', false, rootKey);
		} else {
			fc.get('code').disabled = false;
		}
	},

	/**
	 * @this {UIThis}
	 * @description Shows the editor interface.
	 * @param {string} [rootKey] Root key
	 */
	show(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.frameContext;
		const topAreaStyle = fc.get('topArea').style;
		if (topAreaStyle.display === 'none') topAreaStyle.display = 'block';
	},

	/**
	 * @this {UIThis}
	 * @description Hides the editor interface.
	 * @param {string} [rootKey] Root key
	 */
	hide(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.frameContext;
		fc.get('topArea').style.display = 'none';
	},

	/**
	 * @this {UIThis}
	 * @description Shows the loading spinner.
	 * @param {string} [rootKey] Root key
	 */
	showLoading(rootKey) {
		(rootKey ? this.frameRoots.get(rootKey).get('container') : this.carrierWrapper).querySelector('.se-loading-box').style.display = 'block';
	},

	/**
	 * @this {UIThis}
	 * @description Hides the loading spinner.
	 * @param {string} [rootKey] Root key
	 */
	hideLoading(rootKey) {
		(rootKey ? this.frameRoots.get(rootKey).get('container') : this.carrierWrapper).querySelector('.se-loading-box').style.display = 'none';
	},

	/**
	 * @this {UIThis}
	 * @description This method disables or enables the toolbar buttons when the controller is activated or deactivated.
	 * - When the controller is activated, the toolbar buttons are disabled; when the controller is deactivated, the buttons are enabled.
	 * @param {boolean} active If `true`, the toolbar buttons will be disabled. If `false`, the toolbar buttons will be enabled.
	 */
	setControllerOnDisabledButtons(active) {
		if (active && !this._controllerOnBtnDisabled) {
			dom.utils.setDisabled(this.editor._controllerOnDisabledButtons, true);
			this._controllerOnBtnDisabled = true;
		} else if (!active && this._controllerOnBtnDisabled) {
			dom.utils.setDisabled(this.editor._controllerOnDisabledButtons, false);
			this._controllerOnBtnDisabled = false;
		}
	},

	/**
	 * @this {UIThis}
	 * @description Activate the transparent background "div" so that other elements are not affected during resizing.
	 * @param {string} cursor cursor css property
	 */
	enableBackWrapper(cursor) {
		this._backWrapper.style.cursor = cursor;
		this._backWrapper.style.display = 'block';
	},

	/**
	 * @this {UIThis}
	 * @description Disabled background "div"
	 */
	disableBackWrapper() {
		this._backWrapper.style.display = 'none';
		this._backWrapper.style.cursor = 'default';
	},

	/**
	 * @this {UIThis}
	 * @description  Open the alert panel
	 * @param {string} text alert message
	 * @param {""|"error"|"success"} type alert type
	 */
	alertOpen(text, type) {
		this.alertMessage.textContent = text;

		dom.utils.removeClass(this.alertModal, 'se-alert-error|se-alert-success');
		if (type) dom.utils.addClass(this.alertModal, `se-alert-${type}`);

		if (this._closeSignal) this._alertInner.addEventListener('click', this._closeListener[1]);
		this._bindClose &&= this.eventManager.removeGlobalEvent(this._bindClose);
		this._bindClose = this.eventManager.addGlobalEvent('keydown', this._closeListener[0]);

		this._alertArea.style.display = 'block';
		dom.utils.addClass(this.alertModal, 'se-modal-show');
	},

	/**
	 * @this {UIThis}
	 * @description  Close the alert panel
	 */
	alertClose() {
		dom.utils.removeClass(this.alertModal, 'se-modal-show');
		dom.utils.removeClass(this.alertModal, 'se-alert-*');
		this._alertArea.style.display = 'none';
		if (this._closeSignal) this._alertInner.removeEventListener('click', this._closeListener[1]);
		this._bindClose &&= this.eventManager.removeGlobalEvent(this._bindClose);
	},

	/**
	 * @description Show toast
	 * @param {string} message toast message
	 * @param {number} [duration=1000] duration time(ms)
	 * @param {""|"error"|"success"} [type=""] duration time(ms)
	 */
	showToast(message, duration = 1000, type) {
		if (dom.utils.hasClass(this.toastContainer, 'se-toast-show')) {
			this.closeToast();
		}

		dom.utils.removeClass(this.toastPopup, 'se-toast-error|se-toast-success');
		if (type) dom.utils.addClass(this.toastPopup, `se-toast-${type}`);

		this.toastPopup.style.display = 'block';
		this.toastMessage.textContent = message;
		dom.utils.addClass(this.toastContainer, 'se-toast-show');

		// remove after animation
		this._toastToggle = _w.setTimeout(() => {
			this.closeToast();
		}, duration);
	},

	/**
	 * @description Close toast
	 */
	closeToast() {
		if (this._toastToggle) _w.clearTimeout(this._toastToggle);
		this._toastToggle = null;
		dom.utils.removeClass(this.toastContainer, 'se-toast-show');
		this.toastPopup.style.display = 'none';
	},

	/**
	 * @internal
	 * @this {UIThis}
	 * @description visible controllers
	 * @param {boolean} value hidden/show
	 * @param {?boolean} [lineBreakShow] Line break hidden/show (default: Follows the value "value".)
	 */
	_visibleControllers(value, lineBreakShow) {
		const visible = value ? '' : 'hidden';
		const breakerVisible = (lineBreakShow ?? visible) ? '' : 'hidden';

		const cont = this.editor.opendControllers;
		for (let i = 0, c; i < cont.length; i++) {
			c = cont[i];
			if (c.form) c.form.style.visibility = visible;
		}

		this.editor._lineBreaker_t.style.visibility = breakerVisible;
		this.editor._lineBreaker_b.style.visibility = breakerVisible;
	},

	/**
	 * @internal
	 * @this {UIThis}
	 * @description Off current controllers
	 */
	_offCurrentController() {
		this.component.__deselect();
	},

	/**
	 * @internal
	 * @this {UIThis}
	 * @description Off controllers
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
			c.inst.controllerClose?.();
			if (c.form) c.form.style.display = 'none';
		}
		this.editor.opendControllers = fixedCont;
		this.editor.currentControllerName = '';
		this.editor._preventBlur = false;
	},

	/**
	 * @internal
	 * @this {UIThis}
	 * @description Off current modal
	 */
	_offCurrentModal() {
		if (this.editor.opendModal) {
			this.editor.opendModal.close();
		}
	},

	/**
	 * @internal
	 * @this {UIThis}
	 * @description Destroy the UI instance and release memory
	 */
	_destroy() {
		// Clear timer
		if (this._toastToggle) {
			_w.clearTimeout(this._toastToggle);
		}

		// Remove global event
		this._bindClose &&= this.eventManager.removeGlobalEvent(this._bindClose);

		// Remove alert click event listener
		if (this._closeSignal && this._alertInner) {
			this._alertInner.removeEventListener('click', this._closeListener[1]);
		}
	},

	constructor: UI,
};

/**
 * @this {UIThis}
 * @param {MouseEvent} e - Event object
 */
function OnClick_alert(e) {
	const eventTarget = dom.query.getEventTarget(e);
	if (/close/.test(eventTarget.getAttribute('data-command')) || eventTarget === this._alertInner) {
		this.alertClose();
	}
}

/**
 * @this {UIThis}
 * @param {KeyboardEvent} e - Event object
 */
function CloseListener(e) {
	if (!keyCodeMap.isEsc(e.code)) return;
	this.alertClose();
}

function CreateAlertHTML({ lang, icons }) {
	const html = '<div><button class="close" data-command="close" title="' + lang.close + '">' + icons.cancel + '</button></div><div><span></span></div>';
	return dom.utils.createElement('DIV', { class: 'se-alert-content' }, html);
}

function CreateToastHTML() {
	const html = '<div class="se-toast-container"><span></span></div>';
	return dom.utils.createElement('DIV', { class: 'se-toast' }, html);
}

export default UI;
