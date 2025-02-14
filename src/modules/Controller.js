import EditorInjector from '../editorInjector';
import { domUtils, env } from '../helper';
import { _DragHandle } from '../modules';

const { _w, ON_OVER_COMPONENT } = env;
const NON_RESPONSE_KEYCODE = /^(1[7-9]|20|27|45|11[2-9]|12[0-3]|144|145)$/;
const INDEX_0 = 2147483647;
const INDEX_1 = 2147483646;
const INDEX_2 = 2147483645;

/**
 * @typedef {Object} ControllerInfo
 * @property {string} name The controller name
 * @property {string} position The controller position
 * @property {*} inst The controller instance
 * @property {Element} form The controller element
 * @property {Element} target The controller target element
 * @property {boolean} isRangeTarget If the target is a Range, set it to true.
 * @property {boolean} notInCarrier If the controller is not in the "carrierWrapper", set it to true.
 */

/**
 * @typedef {Object} ControllerParams
 * @property {"top"|"bottom"} position Controller position
 * @property {boolean=} isWWTarget If the controller is in the WYSIWYG area, set it to true.
 * @property {() => void=} initMethod Method to be called when the controller is closed.
 * @property {boolean=} disabled If true, When the "controller" is opened, buttons without the "se-component-enabled" class are disabled.
 * @property {Array<Element>=} parents The parent "controller" array when "controller" is opened nested.
 * @property {boolean=} parentsHide If true, the parent element is hidden when the controller is opened.
 * @property {boolean=} isInsideForm If the controller is inside a form, set it to true.
 * @property {boolean=} isOutsideForm If the controller is outside a form, set it to true.
 */

/**
 * @constructor
 * @description Controller module class that handles the UI and interaction logic for a specific editor controller element.
 * @param {*} inst The instance object that called the constructor.
 * @param {Element} element Controller element
 * @param {ControllerParams} params Controller options
 * @param {?string=} _name An optional name for the controller key.
 */
function Controller(inst, element, params, _name) {
	EditorInjector.call(this, inst.editor);

	// members
	this.kind = _name || inst.constructor.key || inst.constructor.name;
	this.inst = inst;
	this.form = element;
	this.isOpen = false;
	this.currentTarget = null;
	this.currentPositionTarget = null;
	this.isWWTarget = params.isWWTarget ?? true;
	this.position = params.position;
	this.disabled = !!params.disabled;
	this.parents = params.parents || [];
	this.parentsHide = !!params.parentsHide;
	this.isInsideForm = !!params.isInsideForm;
	this.isOutsideForm = !!params.isOutsideForm;
	this._initMethod = typeof params.initMethod === 'function' ? params.initMethod : null;
	this.__globalEventHandlers = { keydown: CloseListener_keydown.bind(this), mousedown: CloseListener_mousedown.bind(this) };
	this._bindClose_key = null;
	this._bindClose_mouse = null;
	this.__offset = {};
	this.__addOffset = { left: 0, top: 0 };
	this.__shadowRootEventForm = null;
	this.__shadowRootEventListener = null;

	// add element
	this.carrierWrapper.appendChild(element);

	// init
	this.eventManager.addEvent(element, 'click', Action.bind(this));
	this.eventManager.addEvent(element, 'mouseenter', MouseEnter.bind(this));
	this.eventManager.addEvent(element, 'mouseleave', MouseLeave.bind(this));
}

Controller.prototype = {
	/**
	 * @description Open a modal plugin
	 * @param {Element} target Target element
	 * @param {Element} positionTarget Position target element
	 * @param {Object} [params={}] params
	 * @param {boolean=} params.isWWTarget If the controller is in the WYSIWYG area, set it to true.
	 * @param {() => void=} params.initMethod Method to be called when the controller is closed.
	 * @param {boolean=} params.disabled If true, When the "controller" is opened, buttons without the "se-component-enabled" class are disabled. (default: this.disabled)
	 * @param {{left: number, top: number}=} params.addOffset Additional offset values
	 */
	open(target, positionTarget, { isWWTarget, initMethod, disabled, addOffset } = {}) {
		if (_DragHandle.get('__overInfo') === ON_OVER_COMPONENT) {
			return;
		}

		if (!target) {
			console.warn('[SUNEDITOR.Controller.open.fail] The target element is required.');
			return;
		}

		if (this.editor.isBalloon) this.toolbar.hide();
		else if (this.editor.isSubBalloon) this.subToolbar.hide();

		if (disabled ?? this.disabled) {
			this.ui.setControllerOnDisabledButtons(true);
		} else {
			this.ui.setControllerOnDisabledButtons(false);
		}

		this.currentTarget = target;
		this.currentPositionTarget = positionTarget || target;
		this.isWWTarget = isWWTarget ?? this.isWWTarget;
		if (typeof initMethod === 'function') this._initMethod = initMethod;
		this.editor.currentControllerName = this.kind;

		if (addOffset) this.__addOffset = { ...this.__addOffset, ...addOffset };

		const parents = this.isOutsideForm ? this.parents : [];
		this.editor.opendControllers?.forEach((e) => {
			if (!parents.includes(e.form)) e.form.style.zIndex = INDEX_2;
		});

		if (this.parentsHide) {
			this.parents.forEach((e) => {
				e.style.display = 'none';
			});
		}

		this.__addGlobalEvent();

		// display controller
		this._setControllerPosition(this.form, this.currentPositionTarget);

		const isRangeTarget = this.selection.isRange(target);
		this._controllerOn(this.form, target, isRangeTarget);
		this._w.setTimeout(() => _DragHandle.set('__overInfo', false), 0);
	},

	/**
	 * @description Close a modal plugin
	 * - The plugin's "init" method is called.
	 * @param {boolean} force If true, parent controllers are forcibly closed.
	 */
	close(force) {
		if (!this.isOpen) return;

		this.isOpen = false;
		this.__offset = {};
		this.__addOffset = { left: 0, top: 0 };

		this.__removeGlobalEvent();

		if (typeof this._initMethod === 'function') this._initMethod();
		this._controllerOff();

		if (this.parentsHide && !force) {
			this.parents.forEach((e) => {
				e.style.display = 'block';
			});
		}

		if (this.parents.length > 0) return;
		if (typeof this.inst.close === 'function') this.inst.close();
		this.component.deselect();
	},

	/**
	 * @description Hide controller
	 */
	hide() {
		this.form.style.display = 'none';
	},

	/**
	 * @description Show controller
	 */
	show() {
		this._setControllerPosition(this.form, this.currentPositionTarget);
	},

	/**
	 * @description Reset controller position
	 * @param {Element=} target
	 */
	resetPosition(target) {
		this._setControllerPosition(this.form, target || this.currentPositionTarget);
	},

	/**
	 * @private
	 * @description Show controller at editor area (controller elements, function, "controller target element(@Required)", "controller name(@Required)", etc..)
	 * @param {Element} form Controller element
	 * @param {Element|Range} target Controller target element
	 * @param {boolean} isRangeTarget If the target is a Range, set it to true.
	 */
	_controllerOn(form, target, isRangeTarget) {
		/** @type {ControllerInfo} */
		const info = {
			position: this.position,
			inst: this,
			form,
			target,
			isRangeTarget,
			notInCarrier: !this.carrierWrapper.contains(form)
		};

		if (this.triggerEvent('onBeforeShowController', { caller: this.kind, frameContext: this.editor.frameContext, info }) === false) return;

		form.style.display = 'block';
		if (this._shadowRoot) {
			this.__shadowRootEventForm = form;
			this.__shadowRootEventListener = (e) => e.stopPropagation();
			form.addEventListener('mousedown', this.__shadowRootEventListener);
		}

		this.editor._controllerTargetContext = this.editor.frameContext.get('topArea');

		if (!this.isOpen) {
			this.editor.opendControllers.push(info);
		}

		this.isOpen = true;
		this.editor._preventBlur = true;
		this.editor.status.onSelected = true;
		this.triggerEvent('onShowController', { caller: this.kind, frameContext: this.editor.frameContext, info });
	},

	/**
	 * @private
	 * @description Hide controller at editor area (link button, image resize button..)
	 * @param {KeyboardEvent|MouseEvent|null} e Event object when called from mousedown and keydown events registered in "_controllerOn"
	 */
	_controllerOff() {
		this.form.style.display = 'none';
		this.editor.opendControllers = this.editor.opendControllers.filter((v) => v.form !== this.form);
		if (this.editor.currentControllerName !== this.kind && this.editor.opendControllers.length > 0) return;

		this.ui.setControllerOnDisabledButtons(false);

		this.editor.frameContext.get('lineBreaker_t').style.display = this.editor.frameContext.get('lineBreaker_b').style.display = 'none';
		this.editor.effectNode = null;
		this.editor.currentControllerName = '';
		this.editor._preventBlur = false;
		this.editor._controllerTargetContext = null;
		_w.setTimeout(() => {
			this.editor.status.onSelected = false;
		}, 0);
		if (this.__shadowRootEventForm) {
			this.__shadowRootEventForm.removeEventListener('mousedown', this.__shadowRootEventListener);
			this.__shadowRootEventForm = this.__shadowRootEventListener = null;
		}
		if (typeof this.inst.reset === 'function') this.inst.reset();
	},

	/**
	 * @private
	 * @description Specify the position of the controller.
	 * @param {Element} controller Controller element.
	 * @param {Element|Range} refer Element or Range that is the basis of the controller's position.
	 */
	_setControllerPosition(controller, refer) {
		controller.style.zIndex = INDEX_1;
		controller.style.visibility = 'hidden';
		controller.style.display = 'block';

		if (this.selection.isRange(refer)) {
			if (!this.offset.setRangePosition(this.form, refer, { position: 'bottom' })) {
				this.hide();
				return;
			}
		} else {
			if (refer && !this.offset.setAbsPosition(controller, refer, { addOffset: this.__addOffset, position: this.position, isWWTarget: this.isWWTarget, inst: this })) {
				this.hide();
				return;
			}
		}

		controller.style.visibility = '';
	},

	/**
	 * @private
	 * @description Adds global event listeners.
	 * - When the controller is opened
	 */
	__addGlobalEvent() {
		this.__removeGlobalEvent();
		this._bindClose_key = this.eventManager.addGlobalEvent('keydown', this.__globalEventHandlers.keydown, true);
		this._bindClose_mouse = this.eventManager.addGlobalEvent('mousedown', this.__globalEventHandlers.mousedown, true);
	},

	/**
	 * @private
	 * @description Removes global event listeners.
	 * - When the ESC key is pressed, the controller is closed.
	 */
	__removeGlobalEvent() {
		this.component.__removeGlobalEvent();
		if (this._bindClose_key) this._bindClose_key = this.eventManager.removeGlobalEvent(this._bindClose_key);
		if (this._bindClose_mouse) this._bindClose_mouse = this.eventManager.removeGlobalEvent(this._bindClose_mouse);
	},

	/**
	 * @private
	 * @description Checks if the controller is fixed and should not be closed.
	 * @returns {boolean} True if the controller is fixed.
	 */
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

	/**
	 * @private
	 * @description Checks if the given target is within a form or controller.
	 * @param {Element} target The target element.
	 * @returns {boolean} True if the target is inside a form or controller.
	 */
	_checkForm(target) {
		if (domUtils.isWysiwygFrame(target)) return false;
		if (domUtils.hasClass(target, 'se-drag-handle')) return true;

		let isParentForm = false;
		if (this.isInsideForm && this.parents?.length > 0) {
			this.parents.some((e) => {
				if (e.contains(target)) {
					isParentForm = true;
					return true;
				}
			});
		}

		return !isParentForm && (domUtils.getParentElement(target, '.se-controller') || target?.contains(this.inst._element));
	},

	constructor: Controller
};

function Action(e) {
	const target = domUtils.getCommandTarget(e.target);
	if (!target) return;

	e.stopPropagation();
	e.preventDefault();

	this.inst.controllerAction(target);
}

function MouseEnter(e) {
	this.editor.currentControllerName = this.kind;
	if (this.parents.length > 0 && this.isInsideForm) return;
	e.target.style.zIndex = INDEX_0;
}

function MouseLeave(e) {
	if (this.parents.length > 0 && this.isInsideForm) return;
	e.target.style.zIndex = INDEX_2;
}

function CloseListener_keydown(e) {
	if (this._checkFixed()) return;
	const keyCode = e.keyCode;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	if (ctrl || !NON_RESPONSE_KEYCODE.test(keyCode)) return;

	if (this.form.contains(e.target) || this._checkForm(e.target)) return;
	if (this.editor._fileManager.pluginRegExp.test(this.kind) && keyCode !== 27) return;

	this.close();
}

function CloseListener_mousedown({ target }) {
	if (this.inst?._element?.contains(target)) {
		this.isOpen = false;
		return;
	}

	this.isOpen = true;
	if (target === this.inst._element || target === this.currentTarget || this._checkFixed() || this.form.contains(target) || this._checkForm(target)) {
		return;
	}

	this.close(true);
}

export default Controller;
