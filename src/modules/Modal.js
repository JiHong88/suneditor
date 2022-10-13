import { domUtils } from '../helper';
import CoreInterface from '../interface/_core';

const Modal = function (inst, element) {
	CoreInterface.call(this, inst.editor);

	// members
	this.inst = inst;
	this.kind = inst.constructor.key;
	this.form = element;
	this.focusElement = element.querySelector('[data-focus]');
	this.isUpdate = false;
	this._modalArea = this.context.element.container.querySelector('.se-modal'),
	this._modalBack = this.context.element.container.querySelector('.se-modal-back'),
	this._modalInner = this.context.element.container.querySelector('.se-modal-inner')
	this._closeListener = [CloseListener.bind(this), OnClick_dialog.bind(this)];
	this._bindClose = null;
	this._onClickEvent = null;
	this._closeSignal = false;

	// add element
	this._modalInner.appendChild(element);

	// init
	this.eventManager.addEvent(element.querySelector('form'), 'submit', Action.bind(this));
	const closeButton = element.querySelector('[data-command="close"]');
	if (closeButton) {
		this.eventManager.addEvent(closeButton, 'click', this.close.bind(this));
	} else {
		this._closeSignal = true;
	}
};

Modal.CreateBasic = function () {
	let html = '';

	return domUtils.createElement('DIV', { class: '' }, html);
};

Modal.prototype = {
	/**
	 * @description Open a modal plugin
	 */
	open: function () {
		this.editor._fixCurrentController(true);
		if (this._closeSignal) this._modalInner.addEventListener('click', this._closeListener[1]);
		if (this._bindClose) this._bindClose = this.eventManager.removeGlobalEvent(this._bindClose);
		this._bindClose = this.eventManager.addGlobalEvent('keydown', this._closeListener[0]);
		this.isUpdate = this.kind === this.editor.currentControllerName;
		
		if (typeof this.inst.on === 'function') this.inst.on(this.isUpdate);

		this._modalArea.style.display = 'block';
		this._modalBack.style.display = 'block';
		this._modalInner.style.display = 'block';
		this.form.style.display = 'block';

		if (this.focusElement) this.focusElement.focus();
	},

	/**
	 * @description Close a modal plugin
	 * The plugin's "init" method is called.
	 */
	close: function () {
		this.editor._fixCurrentController(false);
		if (this._closeSignal) this._modalInner.removeEventListener('click', this._closeListener[1]);
		if (this._bindClose) this._bindClose = this.eventManager.removeGlobalEvent(this._bindClose);
		// close
		this.form.style.display = 'none';
		this._modalBack.style.display = 'none';
		this._modalArea.style.display = 'none';
		if (typeof this.inst.init === 'function' && !this.isUpdate) this.inst.init();
		this.editor.focus();
	},

	constructor: Modal
};

/**
 * The loading bar is executed before "modalAction" is executed.
 * return type -
 * true : the loading bar and modal window are closed.
 * false : only the loading bar is closed.
 * undefined : only the modal window is closed.
 * -
 * exception occurs : the modal window and loading bar are closed.
 */
function Action(e) {
	e.preventDefault();
	e.stopPropagation();

	this.editor.openLoading();

	try {
		const result = this.inst.modalAction();
		if (result === false) {
			this.editor.closeLoading();
		} else if (result === undefined) {
			this.close();
		} else {
			this.close();
			this.editor.closeLoading();
		}
	} catch (error) {
		this.close();
		this.editor.closeLoading();
		throw Error('[SUNEDITOR.Modal[' + this.kind + '].warn] ' + error.message);
	}
}

function OnClick_dialog(e) {
	if (/close/.test(e.target.getAttribute('data-command')) || e.target === this._modalInner) {
		this.close();
	}
}

function CloseListener(e) {
	if (!/27/.test(e.keyCode)) return;
	this.close();
}

export default Modal;
