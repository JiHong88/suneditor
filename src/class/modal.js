'use strict';

import { domUtils } from '../helper';
import CoreInterface from '../interface/_core';

const Modal = function (inst, element) {
	CoreInterface.call(this, inst.editor);

	// members
	this.inst = inst;
	this.kind = inst.constructor.name;
	this.modalForm = element;
	this.modalElement = this.context.element._modal;
	this.focusElement = element.querySelector('[data-focus]');
	this._closeListener = [CloseListener.bind(this), OnClick_dialog.bind(this)];
	this._bindClose = null;
	this._onClickEvent = null;
	this._closeSignal = false;

	// add element
	this.modalElement.inner.appendChild(element);

	// init
	this.eventManager.addEvent(element.querySelector('form'), 'submit', Action.bind(this));
	const closeButton = element.querySelector('[data-command="close"]');
	if (closeButton) {
		this.eventManager.addEvent(closeButton, 'click', this.close.bind(this));
	} else {
		this._closeSignal = true;
	}
};

Modal.prototype = {
	/**
	 * @description Open a modal plugin
	 */
	open: function () {
		if (this._closeSignal) this.modalElement.inner.addEventListener('click', this._closeListener[1]);
		if (this._bindClose) this._bindClose = this.eventManager.removeGlobalEvent(this._bindClose);
		this._bindClose = this.eventManager.addGlobalEvent('keydown', this._closeListener[0]);

		// open
		if (this.options.modallType === 'full') {
			this.modalElement.area.style.position = 'fixed';
		} else {
			this.modalElement.area.style.position = 'absolute';
		}

		if (typeof this.inst.on === 'function') this.inst.on(this.kind === this.editor.currentControllerName);

		this.modalElement.area.style.display = 'block';
		this.modalElement.back.style.display = 'block';
		this.modalElement.inner.style.display = 'block';
		this.modalForm.style.display = 'block';

		if (this.focusElement) this.focusElement.focus();
	},

	/**
	 * @description Close a modal plugin
	 * The plugin's "init" method is called.
	 */
	close: function () {
		if (this._closeSignal) this.modalElement.inner.removeEventListener('click', this._closeListener[1]);
		if (this._bindClose) this._bindClose = this.eventManager.removeGlobalEvent(this._bindClose);

		// close
		this.modalForm.style.display = 'none';
		this.modalElement.back.style.display = 'none';
		this.modalElement.area.style.display = 'none';
		if (typeof this.inst.init === 'function') this.inst.init();
		this.editor.focus();
	},

	constructor: Modal
};

Modal.CreateHTML = function () {
	let html = '';

	return domUtils.createElement('DIV', { class: '' }, html);
};

function Action (e) {
	this.editor.openLoading();

	e.preventDefault();
	e.stopPropagation();

	try {
		if (this.inst.modalAction()) {
			this.close();
			// history stack
			this.history.push(false);
		}
	} catch (e) {
		console.warn('[SUNEDITOR.plugins.' + this.kind + '.warn] ' + e);
		this.close();
	} finally {
		this.editor.closeLoading();
	}

	return false;
}

function OnClick_dialog(e) {
	if (/close/.test(e.target.getAttribute('data-command')) || e.target === this.modalElement.inner) {
		this.close();
	}
}

function CloseListener(e) {
	if (!/27/.test(e.keyCode)) return;
	this.close();
}

export default Modal;
