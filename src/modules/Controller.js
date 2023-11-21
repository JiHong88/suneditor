import EditorInjector from '../editorInjector';
import { domUtils } from '../helper';

const NON_RESPONSE_KEYCODE = new RegExp(/^(13|1[7-9]|20|27|40|45|11[2-9]|12[0-3]|144|145)$/);
const INDEX_0 = 2147483647;
const INDEX_1 = 2147483646;
const INDEX_2 = 2147483645;

/**
 *
 * @param {*} inst
 * @param {*} element
 * @param {{position: "top" | "bottom" | "position", disabled?: boolean}} params params
 * When using the "top" position, there should not be an arrow on the controller.
 * When using the "bottom" position there should be an arrow on the controller.
 */
const Controller = function (inst, element, params, _name) {
	EditorInjector.call(this, inst.editor);

	// members
	this.kind = _name || inst.constructor.key;
	this.inst = inst;
	this.form = element;
	this.isOpen = false;
	this.currentTarget = null;
	this.currentPositionTarget = null;
	this.position = params.position;
	this.disabled = !!params.disabled;
	this.parents = params.parents || [];
	this.parentsHide = !!params.parentsHide;
	this.parentsInside = !!params.parentsInside;
	this._initMethod = null;
	this.__globalEventHandlers = [CloseListener_keydown.bind(this), CloseListener_mousedown.bind(this)];
	this._bindClose_key = null;
	this._bindClose_mouse = null;
	this.__offset = {};
	this.__addOffset = { left: 0, top: 0 };

	// add element
	this.carrierWrapper.appendChild(element);

	// init
	this.eventManager.addEvent(element, 'click', Action.bind(this));
	this.eventManager.addEvent(element, 'mouseenter', MouseEnter.bind(this));
	this.eventManager.addEvent(element, 'mouseleave', MouseLeave.bind(this));
};

Controller.prototype = {
	/**
	 * @description Open a modal plugin
	 */
	open(target, positionTarget, initMethod, addOffset) {
		if (this.editor.isBalloon) this.toolbar.hide();
		else if (this.editor.isSubBalloon) this.subToolbar.hide();

		if (this.disabled) domUtils.setDisabled(this.editor._controllerOnDisabledButtons, true);

		this.currentTarget = target;
		this.currentPositionTarget = positionTarget || target;
		this._initMethod = initMethod;
		this.editor.currentControllerName = this.kind;

		if (addOffset) this.__addOffset = { ...this.__addOffset, ...addOffset };

		this.editor.opendControllers?.forEach((e) => {
			e.form.style.zIndex = INDEX_2;
		});

		if (this.parentsHide) {
			this.parents.forEach((e) => {
				e.style.display = 'none';
			});
		}

		this.__addGlobalEvent();
		this._setControllerPosition(this.form, this.currentPositionTarget);
		this._controllerOn(this.form, target);
		this.isOpen = true;
		this.editor._antiBlur = true;
	},

	/**
	 * @description Close a modal plugin
	 * The plugin's "init" method is called.
	 */
	close(force) {
		if (!this.isOpen) return;
		this.isOpen = false;
		this.editor._antiBlur = false;
		this.__offset = {};
		this.__addOffset = { left: 0, top: 0 };

		this.__removeGlobalEvent();
		this._controllerOff();

		if (this.parentsHide && !force) {
			this.parents.forEach((e) => {
				e.style.display = 'block';
			});
		}

		if (this.parents.length > 0) return;

		if (typeof this._initMethod === 'function') this._initMethod();
		else if (typeof this.inst.close === 'function') this.inst.close();
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
				e.stopPropagation();
			});
		}

		this.editor._controllerTargetContext = this.editor.frameContext.get('topArea');

		if (!this.isOpen) {
			this.editor.opendControllers.push({
				position: this.position,
				form: form,
				target: target,
				inst: this
			});
		}

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
		this.editor.opendControllers = this.editor.opendControllers.filter((v) => v.form !== this.form);
		if (this.editor.currentControllerName !== this.kind || this.editor.opendControllers.length > 0) return;

		if (this.disabled) domUtils.setDisabled(this.editor._controllerOnDisabledButtons, false);
		this.editor.frameContext.get('lineBreaker_t').style.display = this.editor.frameContext.get('lineBreaker_b').style.display = 'none';
		this.editor.effectNode = null;
		this.editor.currentControllerName = '';
		this.editor._antiBlur = false;
		this.editor._controllerTargetContext = null;
		if (typeof this.inst.reset === 'function') this.inst.reset();
	},

	/**
	 * @description Specify the position of the controller.
	 * @param {Element} controller Controller element.
	 * @param {Element} referEl Element that is the basis of the controller's position.
	 */
	_setControllerPosition(controller, referEl) {
		controller.style.zIndex = INDEX_0;
		controller.style.visibility = 'hidden';
		controller.style.display = 'block';

		if (!this.offset.setAbsPosition(controller, referEl, { addOffset: this.__addOffset, position: this.position, inst: this })) {
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
		if (this.editor.selectMenuOn) return true;

		const cont = this.editor.opendControllers;
		for (let i = 0; i < cont.length; i++) {
			if (cont[i].inst === this && cont[i].fixed) {
				return true;
			}
		}
		return false;
	},

	_checkForm(target) {
		return domUtils.getParentElement(target, '.se-controller');
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
	e.target.style.zIndex = INDEX_1;
}

function MouseLeave(e) {
	if (this.parents.length > 0 && this.parentsInside) return;
	e.target.style.zIndex = INDEX_2;
}

function CloseListener_keydown(e) {
	if (this._checkFixed()) return;
	const keyCode = e.keyCode;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	if (ctrl || !NON_RESPONSE_KEYCODE.test(keyCode)) return;

	this.editor.frameContext.get('lineBreaker').style.display = 'none';
	if (this.form.contains(e.target) || this._checkForm(e.target)) return;
	if (this.editor._fileManager.pluginRegExp.test(this.kind) && keyCode !== 27) return;
	this.close();
}

function CloseListener_mousedown(e) {
	if (this._checkFixed() || this.form.contains(e.target) || this._checkForm(e.target)) {
		e.stopPropagation();
		return;
	}
	this.close(true);
}

export default Controller;
