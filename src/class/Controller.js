/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 Yi JiHong.
 * MIT license.
 */
'use strict';

import EditorInterface from '../interface/editor';
import { domUtils } from '../helper';

/**
 *
 * @param {*} inst
 * @param {*} element
 * @param {string} position Type of position ("top" | "bottom")
 * When using the "top" position, there should not be an arrow on the controller.
 * When using the "bottom" position there should be an arrow on the controller.
 */
const Controller = function (inst, element, position) {
	EditorInterface.call(this, inst.editor);

	// members
	this.kind = inst.constructor.name;
	this.inst = inst;
	this.form = element;
	this.currentTarget = null;
	this.position = position || 'bottom';
	this.__globalEventHandlers = [CloseListener_key.bind(this), CloseListener_mousedown.bind(this)];
	this._bindClose_key = null;
	this._bindClose_mousedown = null;

	// add element
	this.context.element.relative.appendChild(element);

	// init
	this.eventManager.addEvent(element, 'click', Action.bind(this));
};

Controller.prototype = {
	/**
	 * @description Open a modal plugin
	 */
	open: function (target) {
		this.currentTarget = target;
		this.editor.currentControllerName = this.kind;
		this.__addGlobalEvent();
		this._setControllerPosition(this.form, target);
		this._controllerOn(this.form, target);
	},

	/**
	 * @description Close a modal plugin
	 * The plugin's "init" method is called.
	 */
	close: function () {
		this.editor.currentControllerName = null;
		this.__removeGlobalEvent();
		this._controllerOff();
	},

	/**
	 * @description Reset controller position
	 * @param {Element|undefined} target
	 */
	resetPosition: function (target) {
		this._setControllerPosition(this.form, target || this.currentTarget);
	},

	/**
	 * @description Show controller at editor area (controller elements, function, "controller target element(@Required)", "controller name(@Required)", etc..)
	 * @param {any} arguments controller elements, function..
	 */
	_controllerOn: function (form, target) {
		this.editor.currentFileComponentInfo = this.component.get(target);

		form.style.display = 'block';
		if (this.shadowRoot) {
			form.addEventListener('mousedown', function (e) {
				e.preventDefault();
				e.stopPropagation();
			});
		}

		this.editor.openControllers.push({ position: this.position, form: form, target: target, inst: this });
		this.editor._antiBlur = true;

		if (typeof this.events.showController === 'function') this.events.showController(this.kind, this.editor.openControllers);
	},

	/**
	 * @description Hide controller at editor area (link button, image resize button..)
	 * @param {KeyboardEvent|MouseEvent|null} e Event object when called from mousedown and keydown events registered in "_controllerOn"
	 */
	_controllerOff: function () {
		this.form.style.display = 'none';
		this.context.element.lineBreaker_t.style.display = this.context.element.lineBreaker_b.style.display = 'none';
		this.status._lineBreakComp = null;
		this.editor.currentFileComponentInfo = null;
		this.editor.effectNode = null;
		this.editor.openControllers = [];
		this.editor._antiBlur = false;

		if (typeof this.inst.reset === 'function') this.inst.reset();
	},

	/**
	 * @description Specify the position of the controller.
	 * @param {Element} controller Controller element.
	 * @param {Element} referEl Element that is the basis of the controller's position.
	 */
	_setControllerPosition: function (controller, referEl) {
		const addOffset = { left: 0, top: 0 };
		if (this.editor.openControllers.length > 0) {
			const cont = this.editor.openControllers[this.editor.openControllers.length - 1];
			if (cont.position === this.position) addOffset.left = cont.form.offsetWidth;
		}

		if (this.options._rtl) addOffset.left *= -1;

		const offset = this.offset.get(referEl);
		controller.style.visibility = 'hidden';
		controller.style.display = 'block';

		// Height value of the arrow element is 11px
		const topMargin = this.position === 'top' ? -(controller.offsetHeight + 2) : referEl.offsetHeight + 12;
		controller.style.top = offset.top + topMargin + addOffset.top + 'px';

		const l = offset.left - this.context.element.wysiwygFrame.scrollLeft + addOffset.left;
		const controllerW = controller.offsetWidth;
		const referElW = referEl.offsetWidth;

		const allow = domUtils.hasClass(controller.firstElementChild, 'se-arrow') ? controller.firstElementChild : null;

		// rtl (Width value of the arrow element is 22px)
		if (this.options._rtl) {
			const rtlW = controllerW > referElW ? controllerW - referElW : 0;
			const rtlL = rtlW > 0 ? 0 : referElW - controllerW;
			controller.style.left = l - rtlW + rtlL + 'px';

			if (rtlW > 0) {
				if (allow) allow.style.left = (controllerW - 14 < 10 + rtlW ? controllerW - 14 : 10 + rtlW) + 'px';
			}

			const overSize = this.context.element.wysiwygFrame.offsetLeft - controller.offsetLeft;
			if (overSize > 0) {
				controller.style.left = '0px';
				if (allow) allow.style.left = overSize + 'px';
			}
		} else {
			controller.style.left = l + 'px';

			const overSize = this.context.element.wysiwygFrame.offsetWidth - (controller.offsetLeft + controllerW);
			if (overSize < 0) {
				controller.style.left = controller.offsetLeft + overSize + 'px';
				if (allow) allow.style.left = 20 - overSize + 'px';
			} else {
				if (allow) allow.style.left = '20px';
			}
		}

		controller.style.visibility = '';
	},

	__addGlobalEvent: function () {
		this.__removeGlobalEvent();
		this._bindClose_key = this.eventManager.addGlobalEvent('keydown', this.__globalEventHandlers[0], true);
		this._bindClose_mousedown = this.eventManager.addGlobalEvent('mousedown', this.__globalEventHandlers[1], true);
	},

	__removeGlobalEvent: function () {
		if (this._bindClose_key) this._bindClose_key = this.eventManager.removeGlobalEvent(this._bindClose_key);
		if (this._bindClose_mousedown) this._bindClose_mousedown = this.eventManager.removeGlobalEvent(this._bindClose_mousedown);
	},

	constructor: Controller
};

Controller.CreateHTML = function () {
	let html = '';

	return domUtils.createElement('DIV', { class: '' }, html);
};

function Action(e) {
	const target = domUtils.getCommandTarget(e.target);
	if (!target) return;

	e.stopPropagation();
	e.preventDefault();

	this.inst.controllerAction(target);
}

function CloseListener_key(e) {
	this.editor._lineBreaker.style.display = 'none';
	if (this.form.contains(e.target)) return;
	if (this.editor._fileManager.pluginRegExp.test(this.kind) && e.keyCode !== 27) return;
	this.close();
}

function CloseListener_mousedown(e) {
	if (this.form.contains(e.target)) return;
	this.close();
}

export default Controller;
