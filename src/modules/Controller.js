import EditorInjector from '../editorInjector';
import { dom, env, keyCodeMap } from '../helper';
import { _DragHandle } from '../modules';

const { _w, ON_OVER_COMPONENT } = env;
const INDEX_0 = '2147483645';
const INDEX_1 = '2147483644';

/**
 * @typedef {Object} ControllerInfo
 * @property {*} inst The controller instance
 * @property {string} [position="bottom"] The controller position ("bottom"|"top")
 * @property {HTMLElement} [form=null] The controller element
 * @property {HTMLElement|Range} [target=null] The controller target element
 * @property {boolean} [notInCarrier=false] If the controller is not in the "carrierWrapper", set it to true.
 * @property {boolean} [isRangeTarget=false] If the target is a Range, set it to true.
 * @property {boolean} [fixed=false] If the controller is fixed and should not be closed, set it to true.
 */

/**
 * @typedef {Object} ControllerParams
 * @property {"top"|"bottom"} [position="bottom"] Controller position
 * @property {boolean=} [isWWTarget=true] If the controller is in the WYSIWYG area, set it to true.
 * @property {() => void=} [initMethod=null] Method to be called when the controller is closed.
 * @property {boolean=} [disabled=false] If true, When the "controller" is opened, buttons without the "se-component-enabled" class are disabled.
 * @property {Array<HTMLElement>=} [parents=[]] The parent "controller" array when "controller" is opened nested.
 * @property {boolean=} [parentsHide=false] If true, the parent element is hidden when the controller is opened.
 * @property {boolean=} [isInsideForm=false] If the controller is inside a form, set it to true.
 * @property {boolean=} [isOutsideForm=false] If the controller is outside a form, set it to true.
 */

/**
 * @class
 * @description Controller module class that handles the UI and interaction logic for a specific editor controller element.
 */
class Controller extends EditorInjector {
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {Node} element Controller element
	 * @param {ControllerParams} params Controller options
	 * @param {?string=} _name An optional name for the controller key.
	 */
	constructor(inst, element, params, _name) {
		super(inst.editor);

		// members
		this.kind = _name || inst.constructor.key || inst.constructor.name;
		this.inst = inst;
		this.form = /** @type {HTMLFormElement} */ (element);
		this.isOpen = false;
		this.currentTarget = null;
		this.currentPositionTarget = null;
		this.isWWTarget = params.isWWTarget ?? true;
		this.position = params.position || 'bottom';
		this.disabled = !!params.disabled;
		this.parents = /** @type {Array<HTMLElement>} */ (params.parents || []);
		this.parentsHide = !!params.parentsHide;
		this.isInsideForm = !!params.isInsideForm;
		this.isOutsideForm = !!params.isOutsideForm;
		this._initMethod = typeof params.initMethod === 'function' ? params.initMethod : null;
		this.__globalEventHandlers = { keydown: this.#CloseListener_keydown.bind(this), mousedown: this.#CloseListener_mousedown.bind(this) };
		this._bindClose_key = null;
		this._bindClose_mouse = null;
		/** @type {{left?: number, top?: number, addOfffset?: {left?: number, top?: number}}} */
		this.__offset = {};
		this.__addOffset = { left: 0, top: 0 };
		this.__shadowRootEventForm = null;
		this.__shadowRootEventListener = null;

		// add element
		this.carrierWrapper.appendChild(element);

		// init
		this.eventManager.addEvent(element, 'click', this.#Action.bind(this));
		this.eventManager.addEvent(element, 'mouseenter', this.#MouseEnter.bind(this));
		this.eventManager.addEvent(element, 'mouseleave', this.#MouseLeave.bind(this));
	}

	/**
	 * @description Open a modal plugin
	 * @param {Node|Range} target Target element
	 * @param {Node} [positionTarget] Position target element
	 * @param {Object} [params={}] params
	 * @param {boolean=} params.isWWTarget If the controller is in the WYSIWYG area, set it to true.
	 * @param {() => void=} params.initMethod Method to be called when the controller is closed.
	 * @param {boolean=} params.disabled If true, When the "controller" is opened, buttons without the "se-component-enabled" class are disabled. (default: this.disabled)
	 * @param {{left?: number, top?: number}=} params.addOffset Additional offset values
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

		this.currentPositionTarget = positionTarget || target;
		this.isWWTarget = isWWTarget ?? this.isWWTarget;
		if (typeof initMethod === 'function') this._initMethod = initMethod;
		this.editor.currentControllerName = this.kind;

		if (addOffset) this.__addOffset = { ...this.__addOffset, ...addOffset };

		const parents = this.isOutsideForm ? this.parents : [];
		this.editor.opendControllers?.forEach((e) => {
			if (!parents.includes(e.form)) e.form.style.zIndex = INDEX_1;
		});

		if (this.parentsHide) {
			this.parents.forEach((e) => {
				e.style.display = 'none';
			});
		}

		this.__addGlobalEvent();

		// display controller
		this._setControllerPosition(this.form, this.currentPositionTarget, false);

		const isRangeTarget = target instanceof Range;
		this.currentTarget = isRangeTarget ? null : target;
		this._controllerOn(this.form, target, isRangeTarget);
		this._w.setTimeout(() => _DragHandle.set('__overInfo', false), 0);
	}

	/**
	 * @description Close a modal plugin
	 * - The plugin's "init" method is called.
	 * @param {boolean=} force If true, parent controllers are forcibly closed.
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
	}

	/**
	 * @description Hide controller
	 */
	hide() {
		this.form.style.display = 'none';
	}

	/**
	 * @description Show controller
	 */
	show() {
		this._setControllerPosition(this.form, this.currentPositionTarget, false);
	}

	/**
	 * @description Reset controller position
	 * @param {Node=} target
	 */
	resetPosition(target) {
		this._setControllerPosition(this.form, target || this.currentPositionTarget, true);
	}

	/**
	 * @private
	 * @description Show controller at editor area (controller elements, function, "controller target element(@Required)", "controller name(@Required)", etc..)
	 * @param {HTMLFormElement} form Controller element
	 * @param {Node|Range} target Controller target element
	 * @param {boolean} isRangeTarget If the target is a Range, set it to true.
	 */
	async _controllerOn(form, target, isRangeTarget) {
		/** @type {ControllerInfo} */
		const info = {
			position: this.position,
			inst: this,
			form: /** @type {HTMLElement} */ (form),
			target: /** @type {HTMLElement} */ (target),
			isRangeTarget,
			notInCarrier: !this.carrierWrapper.contains(form)
		};

		if ((await this.triggerEvent('onBeforeShowController', { caller: this.kind, frameContext: this.editor.frameContext, info })) === false) return;

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
	}

	/**
	 * @private
	 * @description Hide controller at editor area (link button, image resize button..)
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
	}

	/**
	 * @private
	 * @description Specify the position of the controller.
	 * @param {HTMLElement} controller Controller element.
	 * @param {Node|Range} refer Element or Range that is the basis of the controller's position.
	 * @param {?boolean=} reload Maintain z-index when repositioning
	 */
	_setControllerPosition(controller, refer, reload) {
		if (!reload) controller.style.zIndex = INDEX_1;
		controller.style.visibility = 'hidden';
		controller.style.display = 'block';

		if (this.selection.isRange(refer)) {
			if (!this.offset.setRangePosition(this.form, /** @type {Range} */ (refer), { position: 'bottom' })) {
				this.hide();
				return;
			}
		} else {
			if (refer && !this.offset.setAbsPosition(controller, /** @type {HTMLElement} */ (refer), { addOffset: this.__addOffset, position: this.position, isWWTarget: this.isWWTarget, inst: this })) {
				this.hide();
				return;
			}
		}

		controller.style.visibility = '';
	}

	/**
	 * @private
	 * @description Adds global event listeners.
	 * - When the controller is opened
	 */
	__addGlobalEvent() {
		this.__removeGlobalEvent();
		this._bindClose_key = this.eventManager.addGlobalEvent('keydown', this.__globalEventHandlers.keydown, true);
		this._bindClose_mouse = this.eventManager.addGlobalEvent('mousedown', this.__globalEventHandlers.mousedown, true);
	}

	/**
	 * @private
	 * @description Removes global event listeners.
	 * - When the ESC key is pressed, the controller is closed.
	 */
	__removeGlobalEvent() {
		this.component.__removeGlobalEvent();
		if (this._bindClose_key) this._bindClose_key = this.eventManager.removeGlobalEvent(this._bindClose_key);
		if (this._bindClose_mouse) this._bindClose_mouse = this.eventManager.removeGlobalEvent(this._bindClose_mouse);
	}

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
	}

	/**
	 * @private
	 * @description Checks if the given target is within a form or controller.
	 * @param {Node} target The target element.
	 * @returns {boolean} True if the target is inside a form or controller.
	 */
	_checkForm(target) {
		if (dom.check.isWysiwygFrame(target)) return false;
		if (dom.utils.hasClass(target, 'se-drag-handle')) return true;

		let isParentForm = false;
		if (this.isInsideForm && this.parents?.length > 0) {
			this.parents.some((e) => {
				if (e.contains(target)) {
					isParentForm = true;
					return true;
				}
			});
		}

		return !isParentForm && (!!dom.query.getParentElement(target, '.se-controller') || target?.contains(this.inst._element));
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#Action(e) {
		const eventTarget = dom.query.getEventTarget(e);
		const target = dom.query.getCommandTarget(eventTarget);
		if (!target) return;

		e.stopPropagation();
		e.preventDefault();

		this.inst.controllerAction(target);
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#MouseEnter(e) {
		this.editor.currentControllerName = this.kind;
		if (this.parents.length > 0 && this.isInsideForm) return;

		const eventTarget = dom.query.getEventTarget(e);
		eventTarget.style.zIndex = INDEX_0;
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#MouseLeave(e) {
		if (this.parents.length > 0 && this.isInsideForm) return;

		const eventTarget = dom.query.getEventTarget(e);
		eventTarget.style.zIndex = INDEX_1;
	}

	/**
	 * @param {KeyboardEvent} e - Event object
	 */
	#CloseListener_keydown(e) {
		if (this._checkFixed()) return;
		const keyCode = e.code;
		const ctrl = keyCodeMap.isCtrl(e);
		if (ctrl || !keyCodeMap.isNonResponseKey(keyCode)) return;

		const eventTarget = dom.query.getEventTarget(e);
		if (this.form.contains(eventTarget) || this._checkForm(eventTarget)) return;
		if (this.editor._fileManager.pluginRegExp.test(this.kind) && !keyCodeMap.isEsc(keyCode)) return;

		this.close();
	}

	/**
	 * @param {KeyboardEvent} e - Event object
	 */
	#CloseListener_mousedown(e) {
		const eventTarget = dom.query.getEventTarget(e);
		if (this.inst?._element?.contains(eventTarget)) {
			this.isOpen = false;
			return;
		}

		this.isOpen = true;
		if (eventTarget === this.inst._element || eventTarget === this.currentTarget || this._checkFixed() || this.form.contains(eventTarget) || this._checkForm(eventTarget)) {
			return;
		}

		this.close(true);
	}
}

export default Controller;
