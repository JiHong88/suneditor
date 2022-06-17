/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 Yi JiHong.
 * MIT license.
 */
'use strict';

import CoreInterface from '../interface/_core';

const modal = function (inst, element) {
	CoreInterface.call(this, inst.editor);

	// members
	this.kind = inst.constructor.name;
	this.modalForm = element;
	this.modalElement = this.context.element._modal;
	this.focusElement = element.querySelector('[data-focus]');
	this._bindClose = null;
	this._onClickEvent = null;
	this._closeSignal = false;

	// add element
	this.modalElement.inner.appendChild(element);

	// init
	const closeButton = element.querySelector('[data-command="close"]');
	if (closeButton) {
		this.eventManager.addEvent(closeButton, 'click', this.close.bind(this));
	} else {
		this._closeSignal = true;
	}
};

modal.prototype = {
	/**
	 * @description Open a modal plugin
	 */
	open: function () {
		if (this._bindClose) {
			this.eventManager.removeGlobalEvent('keydown', this._bindClose);
			this._bindClose = null;
		}

		this._bindClose = function (e) {
			if (!/27/.test(e.keyCode)) return;
			this.close();
		}.bind(this);
		this.eventManager.addGlobalEvent('keydown', this._bindClose);

		if (this._closeSignal) {
			this._onClickEvent = OnClick_dialog.bind(this);
			this.modalElement.inner.addEventListener('click', this._onClickEvent);
		}

		// open
		if (this.options.modallType === 'full') {
			this.modalElement.area.style.position = 'fixed';
		} else {
			this.modalElement.area.style.position = 'absolute';
		}

		if (typeof this.plugins[this.kind].on === 'function') this.plugins[this.kind].on(this.kind === this.editor.menu.currentControllerName);

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
		if (this._bindClose) {
			this.eventManager.removeGlobalEvent('keydown', this._bindClose);
			this._bindClose = null;
		}
		if (this._onClickEvent) {
			this.modalElement.inner.removeEventListener('click', this._onClickEvent);
			this._onClickEvent = null;
		}

		// close
		this.modalForm.style.display = 'none';
		this.modalElement.back.style.display = 'none';
		this.modalElement.area.style.display = 'none';
		if (typeof this.plugins[this.kind].init === 'function') this.plugins[this.kind].init();
		this.editor.focus();
	},

	constructor: modal
};

function OnClick_dialog(e) {
	if (/close/.test(e.target.getAttribute('data-command')) || e.target === this.modalElement.inner) {
		this.close();
	}
}

export default modal;
