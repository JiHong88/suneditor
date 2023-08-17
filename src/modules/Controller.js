import EditorInjector from '../editorInjector';
import { domUtils } from '../helper';

const NON_RESPONSE_KEYCODE = new RegExp(/^(13|1[7-9]|20|27|40|45|11[2-9]|12[0-3]|144|145)$/);

/**
 *
 * @param {*} inst
 * @param {*} element
 * @param {{position: "top" | "bottom", disabled?: boolean}} params params
 * When using the "top" position, there should not be an arrow on the controller.
 * When using the "bottom" position there should be an arrow on the controller.
 */
const Controller = function (inst, element, params, _name) {
	EditorInjector.call(this, inst.editor);

	// members
	this.kind = _name || inst.constructor.key;
	this.inst = inst;
	this.form = element;
	this.currentTarget = null;
	this.currentPositionTarget = null;
	this.position = params.position || 'bottom';
	this.disabled = !!params.disabled;
	this._initMethod = null;
	this.__globalEventHandlers = [CloseListener_keydown.bind(this), CloseListener_mousedown.bind(this)];
	this._bindClose_key = null;
	this._bindClose_mouse = null;
	this.__offset = {};

	// add element
	this.editor._carrierWrapper.appendChild(element);

	// init
	this.eventManager.addEvent(element, 'click', Action.bind(this));
	this.eventManager.addEvent(element, 'mouseenter', MouseEnter.bind(this));
	this.eventManager.addEvent(element, 'mouseleave', MouseLeave.bind(this));
};

Controller.prototype = {
	/**
	 * @description Open a modal plugin
	 */
	open(target, positionTarget, initMethod) {
		if (this.editor.isBalloon) this.toolbar.hide();
		else if (this.editor.isSubBalloon) this.subToolbar.hide();

		if (this.disabled) domUtils.setDisabled(this.editor._controllerOnDisabledButtons, true);

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
	close() {
		this.__offset = {};
		this.__removeGlobalEvent();
		this._controllerOff();

		if (typeof this._initMethod === 'function') this._initMethod();
	},

	hide() {
		this.form.style.display = 'none';
	},

	show() {
		this._setControllerPosition(this.form, this.currentPositionTarget);
	},

	/**
	 * @description Reset controller position
	 * @param {Element|undefined} target
	 */
	resetPosition(target) {
		this._setControllerPosition(this.form, target || this.currentPositionTarget);
	},

	/**
	 * @description Show controller at editor area (controller elements, function, "controller target element(@Required)", "controller name(@Required)", etc..)
	 * @param {any} arguments controller elements, function..
	 */
	_controllerOn(form, target) {
		form.style.display = 'block';
		if (this._shadowRoot) {
			form.addEventListener('mousedown', function (e) {
				e.preventDefault();
				e.stopPropagation();
			});
		}

		this.editor._controllerTargetContext = this.editor.frameContext.get('topArea');
		this.editor.opendControllers.push({
			position: this.position,
			form: form,
			target: target,
			inst: this
		});

		this.editor._antiBlur = true;
		if (typeof this.events.onShowController === 'function')
			this.events.onShowController({ caller: this.kind, elements: this.editor.opendControllers, frameContext: this.editor.frameContext });
	},

	/**
	 * @description Hide controller at editor area (link button, image resize button..)
	 * @param {KeyboardEvent|MouseEvent|null} e Event object when called from mousedown and keydown events registered in "_controllerOn"
	 * @private
	 */
	_controllerOff() {
		this.form.style.display = 'none';
		if (this.editor.currentControllerName !== this.kind) return;

		if (this.disabled) domUtils.setDisabled(this.editor._controllerOnDisabledButtons, false);
		this.editor.frameContext.get('lineBreaker_t').style.display = this.editor.frameContext.get('lineBreaker_b').style.display = 'none';
		this.editor.effectNode = null;
		this.editor.opendControllers = [];
		this.editor.currentControllerName = '';
		this.editor._antiBlur = false;
		this.editor._controllerTargetContext = null;
		if (typeof this.inst.reset === 'function') this.inst.close();
	},

	/**
	 * @description Specify the position of the controller.
	 * @param {Element} controller Controller element.
	 * @param {Element} referEl Element that is the basis of the controller's position.
	 */
	_setControllerPosition(controller, referEl) {
		const addOffset = { left: 0, top: 0 };
		controller.style.visibility = 'hidden';
		controller.style.display = 'block';

		if (!this.offset.setAbsPosition(controller, referEl, { addOffset: addOffset, position: this.position, inst: this })) {
			this.hide();
			return;
		}

		controller.style.visibility = '';
	},

	__addGlobalEvent() {
		this.__removeGlobalEvent();
		this._bindClose_key = this.eventManager.addGlobalEvent('keydown', this.__globalEventHandlers[0], true);
		this._bindClose_mouse = this.eventManager.addGlobalEvent('mousedown', this.__globalEventHandlers[1], true);
	},

	__removeGlobalEvent() {
		this.component.__removeGlobalEvent();
		if (this._bindClose_key) this._bindClose_key = this.eventManager.removeGlobalEvent(this._bindClose_key);
		if (this._bindClose_mouse) this._bindClose_mouse = this.eventManager.removeGlobalEvent(this._bindClose_mouse);
	},

	_checkFixed() {
		const cont = this.editor.opendControllers;
		for (let i = 0; i < cont.length; i++) {
			if (cont[i].inst === this && cont[i].fixed) {
				return true;
			}
		}
		return false;
	},

	constructor: Controller
};

// @todo
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

function MouseEnter(e) {
	e.target.style.zIndex = 2147483647;
}

function MouseLeave(e) {
	e.target.style.zIndex = 2147483646;
}

function CloseListener_keydown(e) {
	if (this._checkFixed()) return;
	const keyCode = e.keyCode;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	if (ctrl || !NON_RESPONSE_KEYCODE.test(keyCode)) return;

	this.editor.frameContext.get('lineBreaker').style.display = 'none';
	if (this.form.contains(e.target) || domUtils.getParentElement(e.target, '.se-controller')) return;
	if (this.editor._fileManager.pluginRegExp.test(this.kind) && keyCode !== 27) return;
	this.close();
}

function CloseListener_mousedown(e) {
	if (this._checkFixed() || this.form.contains(e.target) || domUtils.getParentElement(e.target, '.se-controller')) {
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	this.close();
}

export default Controller;
