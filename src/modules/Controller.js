'use strict';

import EditorInterface from '../interface/editor';
import { domUtils, global } from '../helper';

const NON_TEXT_KEYCODE = new global._w.RegExp('^(8|13|1[6-9]|20|27|3[3-9]|40|45|46|11[2-9]|12[0-3]|144|145)$');

/**
 *
 * @param {*} inst
 * @param {*} element
 * @param {string} position Type of position ("top" | "bottom")
 * When using the "top" position, there should not be an arrow on the controller.
 * When using the "bottom" position there should be an arrow on the controller.
 */
const Controller = function (inst, element, position, _name) {
	EditorInterface.call(this, inst.editor);

	// members
	this.kind = _name || inst.constructor.name;
	this.inst = inst;
	this.form = element;
	this.currentTarget = null;
	this.currentPositionTarget = null;
	this.position = position || 'bottom';
	this._initMethod = null;
	this.__globalEventHandlers = [CloseListener_key.bind(this), CloseListener_mousedown.bind(this)];
	this._bindClose_key = null;
	this._bindClose_mousedown = null;

	// add element
	this.context.element.editorArea.appendChild(element);

	// init
	this.eventManager.addEvent(element, 'click', Action.bind(this));
};

Controller.prototype = {
	/**
	 * @description Open a modal plugin
	 */
	open: function (target, positionTarget, initMethod) {
		this.currentTarget = target;
		this.currentPositionTarget = positionTarget || target;
		this._initMethod = initMethod;
		this.editor.currentControllerName = this.kind;
		this.__addGlobalEvent();
		this._setControllerPosition(this.form, this.currentPositionTarget);
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
		if (typeof this._initMethod === 'function') this._initMethod();
	},

	/**
	 * @description Reset controller position
	 * @param {Element|undefined} target
	 */
	resetPosition: function (target) {
		this._setControllerPosition(this.form, target || this.currentPositionTarget);
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

		this.editor.openControllers.push({
			position: this.position,
			form: form,
			target: target,
			inst: this,
			_offset: { left: form.offsetLeft + (this.context.element.eventWysiwyg.scrollX || this.context.element.eventWysiwyg.scrollLeft || 0), top: form.offsetTop + (this.context.element.eventWysiwyg.scrollY || this.context.element.eventWysiwyg.scrollTop || 0) }
		});
		if (typeof this.events.onShowController === 'function') this.events.onShowController(this.kind, this.editor.openControllers);
	},

	/**
	 * @description Hide controller at editor area (link button, image resize button..)
	 * @param {KeyboardEvent|MouseEvent|null} e Event object when called from mousedown and keydown events registered in "_controllerOn"
	 */
	_controllerOff: function () {
		this.form.style.display = 'none';
		this.context.element.lineBreaker_t.style.display = this.context.element.lineBreaker_b.style.display = 'none';
		this.editor.currentFileComponentInfo = null;
		this.editor.effectNode = null;
		this.editor.openControllers = [];
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
			const openCont = this.editor.openControllers;
			for (let i = 0; i < openCont.length; i++) {
				if (openCont[i].form !== this.form && openCont[i].position === this.position) addOffset.left += openCont[i].form.offsetWidth;
			}
		}

		const globalOffset = { left: 0, top: 0 };
		if (this.options.iframe && this._w.getComputedStyle(referEl).position === 'absolute') {
			globalOffset.left -= this.context.element.wysiwygFrame.parentElement.offsetLeft;
			globalOffset.top -= this.context.element.wysiwygFrame.parentElement.offsetTop;
		}

		if (this.options._rtl) {
			addOffset.left *= -1;
			globalOffset.left *= -1;
		}

		const offset = this.offset.get(referEl);
		controller.style.visibility = 'hidden';
		controller.style.display = 'block';

		// Height value of the arrow element is 11px
		const topMargin = this.position === 'top' ? -(controller.offsetHeight + 2) : referEl.offsetHeight + 12;
		controller.style.top = offset.top + topMargin + addOffset.top + globalOffset.top + 'px';

		const l = offset.left - this.context.element.wysiwygFrame.scrollLeft + addOffset.left + globalOffset.left;
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

	_checkFixed: function () {
		const cont = this.editor.openControllers;
		for (let i = 0; i < cont.length; i++) {
			if (cont[i].inst === this && cont[i].fixed) {
				return true;
			}
		}
		return false;
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
	if (this._checkFixed()) return;
	const keyCode = e.keyCode;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	if (ctrl || NON_TEXT_KEYCODE.test(keyCode)) return;

	this.editor._lineBreaker.style.display = 'none';
	if (this.form.contains(e.target) || domUtils.getParentElement(e.target, '.se-controller')) return;
	if (this.editor._fileManager.pluginRegExp.test(this.kind) && keyCode !== 27) return;

	this.close();
}

function CloseListener_mousedown(e) {
	if (this._checkFixed()) return;
	if (this.form.contains(e.target) || domUtils.getParentElement(e.target, '.se-controller')) return;
	this.close();
}

export default Controller;
