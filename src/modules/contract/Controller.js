import { dom, env, keyCodeMap } from '../../helper';
import { _DragHandle } from '../ui/_DragHandle';

const { _w, isMobile, ON_OVER_COMPONENT } = env;
const INDEX_00 = '2147483646';
const INDEX_0 = '2147483645';
const INDEX_S_1 = '2147483642';
const INDEX_1 = '2147483641';
const ADD_OFFSET_VALUE = { left: 0, right: 0, top: 0 };

/**
 * @type {?Controller}
 */
let _topHoverController = null;

/**
 * Controller information object
 * @typedef {Object} ControllerInfo
 * @property {*} inst - The controller instance
 * @property {string} [position="bottom"] - The controller position (`"bottom"`|`"top"`)
 * @property {HTMLElement} [form=null] - The controller element
 * @property {HTMLElement|Range} [target=null] - The controller target element
 * @property {boolean} [notInCarrier=false] - If the controller is not in the `carrierWrapper`, set it to `true`.
 * @property {boolean} [inWrapper=false] - An in-editor `wrapper` controller (`container: 'wrapper'`), not a floating one.
 * - Floating-controller bookkeeping skips it: `z-index` stacking, the close-time state reset, "click inside another controller" checks and modal hiding.
 * @property {boolean} [isRangeTarget=false] - If the target is a `Range`, set it to `true`.
 * @property {boolean} [fixed=false] - If the controller is fixed and should not be closed, set it to `true`.
 * @property {boolean} [passive=false] - Opened without touching the editor state (hover UI, in-editor controllers).
 * @property {?HTMLElement} [topArea=null] - The root (`frameContext.get('topArea')`) it was opened in.
 */

/**
 * @typedef {Object} ControllerParams
 * @property {"top"|"bottom"} [position="bottom"] Controller position
 * @property {boolean} [isWWTarget=true] If the controller is in the WYSIWYG area, set it to `true`.
 * @property {() => void} [initMethod=null] Method to be called when the controller is closed.
 * @property {() => boolean} [escGuard=null] Called on ESC before the controller closes. Return `true`
 * to keep it open (e.g. when an inner sub-panel should absorb the ESC instead).
 * @property {boolean} [disabled=false] If `true`, When the `controller` is opened, buttons without the `se-component-enabled` class are disabled.
 * @property {Array<Controller|HTMLElement>} [parents=[]] The parent `controller` instance array when `controller` is opened nested.
 * @property {boolean} [parentsHide=false] If `true`, the parent element is hidden when the controller is opened.
 * @property {HTMLElement} [sibling=null] The related sibling controller element that this controller is positioned relative to.
 * - e.g.) table plugin :: 118
 * @property {boolean} [siblingMain=false] If `true`, This sibling controller is the main controller.
 * - You must specify this option, if use `sibling`
 * @property {boolean} [isInsideForm=false] If the controller is inside a form, set it to `true`.
 * @property {boolean} [isOutsideForm=false] If the controller is outside a form, set it to `true`.
 * @property {"carrier"|"wrapper"} [container="carrier"] Where the controller lives.
 * - `carrier`: a floating controller in the `carrierWrapper` (popover top layer), placed against its target by `position`.
 * - `wrapper`: an in-editor controller inside the current root's `.se-wrapper` (moved there on `open`), placed by `place`.
 * 			  - It keeps the controller contract — `open`/`close`/`hide`/`show`/`resetPosition`, `parents`
 * 			  - Its owner drives its lifecycle: no auto-close listeners, no deselect on close, no editor-state changes.
 * 			  - Scrolls inside the content (e.g. a scrolled table figure) are the owner's: call `resetPosition()`.
 * @property {boolean} [selection=false] If `true`, this controller is the selected component's UI (e.g. an image toolbar).
 * - The component keeps its selection and its key/click handling while it is open.
 * - Closing a base one (no `parents`) deselects the component; closing a child keeps it.
 * - Inherited from `parents`. Leave it `false` for standalone controllers (e.g. link preview).
 * @property {"level"|"all"} [escape="level"] What Esc does when this controller handles it:
 * - `level`: closes this level only (and consumes the Esc) — a child popup closes, its parent stays.
 * 			- A base selection UI controller leaves the Esc to the component, which ends the selection.
 * - `all`: closes every open controller at once and ends the selection (`ui.closeAllControllers`).
 * @property {(form: HTMLElement, target: Node) => ?{left: number, top: number}} [place] `container: 'wrapper'` only:
 * - the form's wrapper-local position (`$.offset.getLocal` space), or `null` to hide it. It may also size the form;
 * - the controller writes the position, the display and the scroll baseline.
 */

/**
 * @class
 * @description Controller module class that handles the UI and interaction logic for a specific editor controller element.
 * @see EditorComponent for `inst._element` requirement
 */
class Controller {
	#$;

	#initMethod;
	#escGuard;
	#globalEventHandlers;

	#addOffset = ADD_OFFSET_VALUE;
	#reserveIndex = false;
	#preventClose = false;
	#bindShadowRootEvent = null;
	#bindClose_key = null;
	#bindClose_mouse = null;

	/** @type {?(form: HTMLElement, target: Node) => ?{left: number, top: number}} `wrapper` placement */
	#place = null;
	/** Declared a selection UI controller */
	#selection = false;

	/**
	 * @type {Array<Controller>}
	 * @description Child controllers opened by this controller
	 */
	#__childrenControllers__ = [];
	/**
	 * @type {Map<Controller, boolean>}
	 * @description Track each parent's desired visibility state: `true` = wants hidden, `false` = wants visible
	 */
	#__hiddenByParents__ = new Map();

	/**
	 * @constructor
	 * @param {*} host The instance object that called the constructor.
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {Node} element Controller element
	 * @param {ControllerParams} params Controller options
	 * @param {?string} [_name] An optional name for the controller key.
	 */
	constructor(host, $, element, params, _name) {
		this.#$ = $;

		// members
		this.kind = _name || host.constructor['key'] || host.constructor.name;
		this.host = host;
		this.form = /** @type {HTMLFormElement} */ (element);
		this.isOpen = false;
		this.currentTarget = null;
		this.currentPositionTarget = null;
		this.isWWTarget = params.isWWTarget ?? true;
		this.position = params.position || 'bottom';
		this.disabled = !!params.disabled;
		this.parents = params.parents || [];
		this.parentsForm = [];
		this.parentsHide = !!params.parentsHide;
		this.sibling = /** @type {HTMLElement} */ (params.sibling || null);
		this.siblingMain = !!params.siblingMain;
		this.isInsideForm = !!params.isInsideForm;
		this.isOutsideForm = !!params.isOutsideForm;
		/** @type {"carrier"|"wrapper"} */
		this.container = params.container === 'wrapper' ? 'wrapper' : 'carrier';
		/** @type {"level"|"all"} */
		this.escape = params.escape === 'all' ? 'all' : 'level';
		this.#selection = !!params.selection;
		this.toTop = false;
		/** @type {{left?: number, top?: number, addOfffset?: {left?: number, top?: number}}} */
		this.__offset = {};

		this.#initMethod = typeof params.initMethod === 'function' ? params.initMethod : null;
		this.#escGuard = typeof params.escGuard === 'function' ? params.escGuard : null;
		this.#globalEventHandlers = {
			keydown: this.#CloseListener_keydown.bind(this),
			mousedown: this.#CloseListener_mousedown.bind(this),
		};

		for (const parent of this.parents) {
			if (dom.check.isElement(parent)) {
				this.parentsForm.push(parent);
				continue;
			}
			parent.#__childrenControllers__.push(this);
			this.parentsForm.push(parent.form);
		}

		if (this.container === 'wrapper') {
			this.#place = typeof params.place === 'function' ? params.place : null;
			if (!this.#place) {
				console.warn('[SUNEDITOR.Controller.constructor.warn] A `wrapper` controller requires `place`.');
			}
			this.#$.eventManager.addEvent(element, 'click', this.#Action.bind(this));
			return;
		}

		// add element
		this.form.setAttribute('popover', 'manual');
		this.#$.contextProvider.carrierWrapper.appendChild(element);

		// init
		this.#$.eventManager.addEvent(element, 'click', this.#Action.bind(this));
		this.#$.eventManager.addEvent(element, 'mouseenter', this.#MouseEnter.bind(this));
		this.#$.eventManager.addEvent(element, 'mouseleave', this.#MouseLeave.bind(this));
	}

	/**
	 * @description Open a modal plugin
	 * @param {Node|Range} target Target element
	 * @param {Node} [positionTarget] Position target element
	 * @param {Object} [params={}] params
	 * @param {boolean} [params.isWWTarget] If the controller is in the WYSIWYG area, set it to `true`.
	 * @param {boolean} [params.passive] If `true`, opens the controller visually without affecting editor state
	 * - (`_preventBlur`, `controlActive`, `currentControllerName`, balloon toolbar hiding); it is still registered in `opendControllers`.
	 * - Used for lightweight, non-intrusive display such as hover-triggered UI (e.g., codeLang selector on `<pre>` hover).
	 * - Automatically set to `true` when opened during component hover selection (`ON_OVER_COMPONENT`).
	 * @param {() => void} [params.initMethod] Method to be called when the controller is closed.
	 * @param {boolean} [params.disabled] If `true`, When the `controller` is opened, buttons without the `se-component-enabled` class are disabled. (default: `this.disabled`)
	 * @param {{left?: number, right?:number, top?: number}} [params.addOffset] Additional offset values
	 * @example
	 * // Open controller on a target element with default options
	 * this.controller.open(target);
	 *
	 * // Open with explicit options and additional offset
	 * this.controller.open(target, null, { isWWTarget: false, initMethod: null, addOffset: null });
	 *
	 * // Open on a Range target (e.g., text selection)
	 * this.controller.open(this.$.selection.getRange());
	 */
	open(target, positionTarget, { isWWTarget, passive, initMethod, disabled, addOffset } = {}) {
		if (this.container === 'wrapper') {
			this.#openInWrapper(/** @type {Node} */ (target), positionTarget);
			return;
		}

		if (_DragHandle.get('__overInfo') === ON_OVER_COMPONENT) {
			passive = true;
		}

		if (!target) {
			console.warn('[SUNEDITOR.Controller.open.fail] The target element is required.');
			return;
		}

		this.form.removeAttribute('data-se-hidden-by-parent');
		this.form.removeAttribute('data-se-hidden-by-children');
		this.#__hiddenByParents__.clear();

		if (!passive) {
			if (this.#$.store.mode.isBalloon) this.#$.toolbar.hide();
			else if (this.#$.store.mode.isSubBalloon) this.#$.subToolbar.hide();

			if (!this.#$.store.get('hasFocus')) {
				if (disabled ?? this.disabled) {
					this.#$.ui.setControllerOnDisabledButtons(true);
				} else {
					this.#$.ui.setControllerOnDisabledButtons(false);
				}
			}
		}

		this.currentPositionTarget = positionTarget || target;
		this.isWWTarget = isWWTarget ?? this.isWWTarget;
		if (typeof initMethod === 'function') this.#initMethod = initMethod;
		if (!passive) this.#$.ui.currentControllerName = this.kind;

		this.#addOffset = { left: 0, right: 0, top: 0, ...addOffset };

		if (!passive) {
			const parents = this.isOutsideForm ? this.parentsForm : [];
			this.#$.ui.opendControllers?.forEach((e) => {
				if (!e.inWrapper && !parents.includes(e.form)) e.form.style.zIndex = INDEX_1;
			});

			if (this.parentsHide) {
				this.parentsForm.forEach((e) => {
					e.style.display = 'none';
					e.setAttribute('data-se-hidden-by-children', '1');
				});
			}
		}

		this.#addGlobalEvent();

		// display controller
		this.#setControllerPosition(this.form, this.currentPositionTarget, false);

		const isRangeTarget = this.#$.instanceCheck.isRange(target);
		this.currentTarget = /** @type {HTMLElement} */ (isRangeTarget ? null : target);
		this.#controllerOn(this.form, target, isRangeTarget, passive);
		_w.setTimeout(() => _DragHandle.set('__overInfo', false), 0);
	}

	/**
	 * @description Close a modal plugin
	 * - The plugin's `init` method is called.
	 * @param {boolean} [force] If `true`, parent controllers are forcibly closed.
	 * @example
	 * // Close the controller (skips if not open or preventClose is set)
	 * this.controller.close();
	 *
	 * // Force close, also closing parent controllers in the hierarchy
	 * this.controller.close(true);
	 */
	close(force) {
		if (!force && (!this.isOpen || this.#preventClose)) return;

		this.form.removeAttribute('data-se-hidden-by-parent');
		this.form.removeAttribute('data-se-hidden-by-children');
		this.#__hiddenByParents__.clear();
		this.#childrenSync('close');

		this.toTop = false;
		this.isOpen = false;
		this.#preventClose = false;
		this.__offset = {};
		this.#addOffset = ADD_OFFSET_VALUE;

		if (this.container !== 'wrapper') this.#removeGlobalEvent();

		this.#initMethod?.();
		this.#controllerOff();

		if (this.parentsHide && !force) {
			this.parentsForm.forEach((e) => {
				e.style.display = 'block';
				e.removeAttribute('data-se-hidden-by-children');
			});
		}

		this.host.controllerClose?.();

		if (this.container === 'wrapper' || this.parentsForm.length > 0) return;

		this.#$.component.deselect();
	}

	/**
	 * @description Whether this controller is the selected component's UI — set by `selection` or inherited from `parents`.
	 * @returns {boolean}
	 */
	get isSelectionUI() {
		if (this.#selection) return true;
		return this.parents.some((parent) => {
			if (!dom.check.isElement(parent)) return /** @type {Controller} */ (parent).isSelectionUI;
			const owner = this.#$.ui.getControllerAt(/** @type {Node} */ (parent))?.inst;
			return owner !== this && !!owner?.isSelectionUI;
		});
	}

	/**
	 * @description Hide controller
	 */
	hide() {
		this.#childrenSync('hide');
		this.form.style.display = 'none';
	}

	/**
	 * @description Show controller
	 */
	show() {
		this.#setControllerPosition(this.form, this.currentPositionTarget, false);
	}

	/**
	 * @description Sets whether the element (form) should be brought to the top based on `z-index`.
	 * @param {boolean} value - `true`: `'2147483646'`, `false`: `'2147483645'`.
	 * @example
	 * // Bring controller to the highest z-index layer (2147483646)
	 * this.controller_cell.bringToTop(true);
	 *
	 * // Restore to the default top z-index (2147483645)
	 * this.controller_cell.bringToTop(false);
	 */
	bringToTop(value) {
		this.toTop = value;
		this.form.style.zIndex = value ? INDEX_00 : INDEX_0;
	}

	/**
	 * @description Reset controller position
	 * @param {Node} [target]
	 * @example
	 * // Reposition using a new target element
	 * this.controller_cell.resetPosition(tdElement);
	 *
	 * // Reposition using the previously set target
	 * this.controller.resetPosition();
	 */
	resetPosition(target) {
		this.#setControllerPosition(this.form, target || this.currentPositionTarget, true);
	}

	/**
	 * @description Reposition controller on scroll event
	 */
	_scrollReposition() {
		if (this.form.hasAttribute('data-se-hidden-by-parent') || this.form.hasAttribute('data-se-hidden-by-children'))
			return;
		if (this.#setControllerPosition(this.form, this.currentPositionTarget, false)) {
			_w.setTimeout(() => {
				this.#childrenSync('show');
			}, 0);
		}
	}

	/**
	 * @description Synchronously all child controllers.
	 * @param {"show"|"hide"|"close"} state - State to apply to child controllers.
	 */
	#childrenSync(state) {
		for (const children of this.#__childrenControllers__) {
			if (state === 'hide' && children.form.style.display !== 'none') {
				const wasHidden = this.#calculateShouldBeHidden(children);
				children.#__hiddenByParents__.set(this, true);
				const shouldBeHidden = this.#calculateShouldBeHidden(children);

				// Only hide if state changed from visible to hidden
				if (!wasHidden && shouldBeHidden) {
					children.form.setAttribute('data-se-hidden-by-parent', '1');
					children.hide();
				}
			} else if (state === 'show') {
				if (children.form.hasAttribute('data-se-hidden-by-children')) {
					children.#childrenSync('show');
					continue;
				}

				const wasHidden = this.#calculateShouldBeHidden(children);
				children.#__hiddenByParents__.set(this, false);
				const shouldBeHidden = this.#calculateShouldBeHidden(children);

				// Only show if state changed from hidden to visible
				if (wasHidden && !shouldBeHidden) {
					children.form.removeAttribute('data-se-hidden-by-parent');
					children.show();
				}
			} else {
				children[state]?.(true);
			}
		}
	}

	/**
	 * @description Calculate if a child controller should be hidden based on all parent states
	 * @param {Controller} children - The child controller
	 * @returns {boolean} `true` if any parent wants it hidden
	 */
	#calculateShouldBeHidden(children) {
		for (const wantsHidden of children.#__hiddenByParents__.values()) {
			if (wantsHidden === true) return true;
		}
		return false;
	}

	/**
	 * @description Opens a `wrapper` controller — moves its form into the current root's wrapper,
	 * - registers it as an in-editor controller and places it.
	 * - Registered `fixed`: the core's deselect sweep (`_offControllers`) leaves it to its owner.
	 * @param {Node} target Target node
	 * @param {Node} [positionTarget] Position target node (`place`'s second argument)
	 */
	#openInWrapper(target, positionTarget) {
		if (!target) {
			console.warn('[SUNEDITOR.Controller.open.fail] The target element is required.');
			return;
		}

		this.currentTarget = /** @type {HTMLElement} */ (target);
		this.currentPositionTarget = positionTarget || target;

		const wrapper = this.#$.frameContext.get('wrapper');
		if (this.form.parentNode !== wrapper) wrapper.appendChild(this.form);

		const cont = this.#$.ui.opendControllers;
		if (!cont.some((v) => v.form === this.form)) {
			cont.push({
				position: 'none',
				inst: this,
				form: this.form,
				target: /** @type {HTMLElement} */ (target),
				notInCarrier: true,
				inWrapper: true,
				fixed: true,
				passive: true,
				topArea: this.#$.frameContext.get('topArea'),
			});
		}

		this.isOpen = true;
		this.#placeInWrapper(false);
	}

	/**
	 * @description Places a `wrapper` controller through its `place` callback.
	 * - `null` hides it (its children with it, and the controllers anchored on it).
	 * - Records the scroll baseline the core moves it from on the wysiwyg's inner scroll (`ui._syncScrollPosition`).
	 * @param {boolean} reanchor Re-anchor the controllers positioned on this one even when it stayed visible
	 * (`resetPosition`/`show`); an `open` re-place only does it when coming back from hidden.
	 * @returns {boolean} Whether it is shown
	 */
	#placeInWrapper(reanchor) {
		const pos = this.#place?.(this.form, /** @type {Node} */ (this.currentPositionTarget));
		if (!pos) {
			if (this.form.style.display !== 'none') this.hide();
			this.#syncAnchored(false);
			return false;
		}

		const wasHidden = this.form.style.display !== 'block';
		this.form.style.left = `${pos.left}px`;
		this.form.style.top = `${pos.top}px`;
		this.form.style.display = 'block';

		const ww = this.#$.frameContext.get('eventWysiwyg');
		this.__offset = {
			left: pos.left + (ww.scrollLeft || ww.scrollX || 0),
			top: pos.top + (ww.scrollTop || ww.scrollY || 0),
		};

		if (wasHidden) this.#childrenSync('show');
		if (wasHidden || reanchor) this.#syncAnchored(true);
		return true;
	}

	/**
	 * @description Keeps the floating controllers positioned on an element inside this `wrapper` controller (its
	 * child popups, or e.g. a properties panel opened on it) with it: re-anchored when it moved, hidden while it —
	 * or the anchor element inside it — is not rendered.
	 * @param {boolean} visible Whether this controller is shown
	 */
	#syncAnchored(visible) {
		for (const { inst, inWrapper } of this.#$.ui.opendControllers) {
			const anchor = inst?.currentPositionTarget;
			if (inWrapper || inst === this || !anchor?.nodeType || !this.form.contains(anchor)) continue;

			if (!visible || anchor.getClientRects().length === 0) {
				if (inst.form.style.display !== 'none') inst.hide();
			} else if (!inst.form.hasAttribute('data-se-hidden-by-parent')) {
				inst.resetPosition();
			}
		}
	}

	/**
	 * @description Show controller at editor area (controller elements, function, `controller target element(@Required)`, `controller name(@Required)`, etc..)
	 * @param {HTMLFormElement} form Controller element
	 * @param {Node|Range} target Controller target element
	 * @param {boolean} isRangeTarget If the target is a `Range`, set it to `true`.
	 * @param {boolean} [passive=false] If `true`, opens without affecting editor state (_preventBlur, controlActive, etc.)
	 */
	async #controllerOn(form, target, isRangeTarget, passive) {
		/** @type {ControllerInfo} */
		const info = {
			position: this.position,
			inst: this,
			form: /** @type {HTMLElement} */ (form),
			target: /** @type {HTMLElement} */ (target),
			isRangeTarget,
			notInCarrier: !this.#$.contextProvider.carrierWrapper.contains(form),
			passive: !!passive,
			topArea: this.#$.frameContext.get('topArea'),
		};

		if (
			(await this.#$.eventManager.triggerEvent('onBeforeShowController', {
				caller: this.kind,
				frameContext: this.#$.frameContext,
				info,
			})) === false
		)
			return;

		form.style.display = 'block';
		if (this.#$.contextProvider.shadowRoot) {
			this.#bindShadowRootEvent = this.#$.eventManager.addEvent(form, 'mousedown', (e) => e.stopPropagation());
		}

		if (!passive) {
			this.#$.store.set('controlActive', true);
			this.#$.store.set('_preventBlur', true);
		}

		if (!this.isOpen) {
			this.#$.ui.opendControllers.push(info);
		}

		this.isOpen = true;

		this.host.controllerOn?.(form, target);
		this.#$.eventManager.triggerEvent('onShowController', {
			caller: this.kind,
			frameContext: this.#$.frameContext,
			info,
		});
	}

	/**
	 * @description Hide controller at editor area (link button, image resize button..)
	 */
	#controllerOff() {
		if (this.container === 'wrapper') {
			this.form.style.display = 'none';
			this.#$.ui.opendControllers = this.#$.ui.opendControllers.filter((v) => v.form !== this.form);
			return;
		}

		if (_topHoverController === this) _topHoverController = null;
		this.form.hidePopover?.();
		this.form.style.display = 'none';
		this.#$.ui.opendControllers = this.#$.ui.opendControllers.filter((v) => v.form !== this.form);
		if (this.#$.ui.currentControllerName !== this.kind && this.#$.ui.hasFloatingController()) return;

		this.#$.ui.setControllerOnDisabledButtons(false);

		if (!this.isSelectionUI || !this.#$.component.isSelected) {
			this.#$.frameContext.get('lineBreaker_t').style.display = this.#$.frameContext.get(
				'lineBreaker_b',
			).style.display = 'none';
		}
		this.#$.store.set('_lastSelectionNode', null);
		this.#$.ui.currentControllerName = '';
		this.#$.store.set('_preventBlur', false);

		_w.setTimeout(() => {
			this.#$.store.set('controlActive', false);
		}, 0);
		this.#bindShadowRootEvent &&= this.#$.eventManager.removeEvent(this.#bindShadowRootEvent);
	}

	/**
	 * @description Specify the position of the controller.
	 * @param {HTMLElement} controller Controller element.
	 * @param {Node|Range} refer Element or `Range` that is the basis of the controller's position.
	 * @param {boolean} [skipAutoReposition=false] If `true`, skips scroll/resize-based automatic positioning logic.
	 * @returns {boolean} - view : `true` || hide : `false`
	 */
	#setControllerPosition(controller, refer, skipAutoReposition) {
		if (this.container === 'wrapper') {
			if (refer) this.currentPositionTarget = refer;
			return this.#placeInWrapper(true);
		}

		if (!refer) return false;

		controller.style.visibility = 'hidden';
		controller.style.display = 'block';

		if (this.sibling && this.sibling.style.display !== 'block') {
			this.sibling.style.visibility = 'hidden';
			this.sibling.style.display = 'block';
		}

		if (this.#$.selection.isRange(refer)) {
			if (!this.#$.offset.setRangePosition(this.form, /** @type {Range} */ (refer), { position: 'bottom' })) {
				this.hide();
				return false;
			}
		} else {
			const positionResult = this.#$.offset.setAbsPosition(controller, /** @type {HTMLElement} */ (refer), {
				addOffset: this.#addOffset,
				position: this.position,
				isWWTarget: this.isWWTarget,
				inst: this,
				sibling: this.sibling,
			});
			if (!positionResult) {
				this.hide();
				return false;
			}

			if (!skipAutoReposition && this.sibling && !this.siblingMain) {
				const resetPosition = controller.offsetTop - this.#addOffset.top;
				if (positionResult.position === 'bottom') {
					this.#reserveIndex = true;
					controller.style.top = resetPosition + this.sibling.offsetHeight - 1 + 'px';
				} else {
					this.#reserveIndex = false;
					controller.style.top = resetPosition - this.sibling.offsetHeight + 2 + 'px';
				}
			} else {
				this.#reserveIndex = false;
			}
		}

		controller.style.zIndex = this.toTop ? INDEX_0 : this.#reserveIndex ? INDEX_S_1 : INDEX_1;
		controller.style.visibility = '';
		controller.showPopover?.();
		return true;
	}

	/**
	 * @description Adds global event listeners.
	 * - When the controller is opened
	 */
	#addGlobalEvent() {
		this.#removeGlobalEvent();
		this.#bindClose_key = this.#$.eventManager.addGlobalEvent('keydown', this.#globalEventHandlers.keydown, true);
		this.#bindClose_mouse = this.#$.eventManager.addGlobalEvent(
			isMobile ? 'click' : 'mousedown',
			this.#globalEventHandlers.mousedown,
			true,
		);
	}

	/**
	 * @description Removes global event listeners.
	 * - When the ESC key is pressed, the controller is closed.
	 */
	#removeGlobalEvent() {
		if (!this.isSelectionUI) this.#$.component.__removeGlobalEvent();
		this.#bindClose_key &&= this.#$.eventManager.removeGlobalEvent(this.#bindClose_key);
		this.#bindClose_mouse &&= this.#$.eventManager.removeGlobalEvent(this.#bindClose_mouse);
	}

	/**
	 * @description Checks if the controller is fixed and should not be closed.
	 * @returns {boolean} `true` if the controller is fixed.
	 */
	#checkFixed() {
		if (this.#$.ui.selectMenuOn) return true;

		const cont = this.#$.ui.opendControllers;
		for (let i = 0; i < cont.length; i++) {
			if (cont[i].inst === this && cont[i].fixed) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @description Checks if the given target is within a form or controller.
	 * @param {Element} target The target element.
	 * @returns {boolean} `true` if the target is inside a form or controller.
	 */
	#checkForm(target) {
		if (dom.check.isWysiwygFrame(target) || target.contains(this.form)) return false;
		if (dom.utils.hasClass(target, 'se-drag-handle')) return true;

		let isParentForm = false;
		if (this.isInsideForm && this.parentsForm?.length > 0) {
			this.parentsForm.some((e) => {
				if (e.contains(target)) {
					isParentForm = true;
					return true;
				}
			});
		}

		const _element = this.host._element;
		return (
			!isParentForm &&
			(this.#$.ui.isInsideController(target) ||
				!!dom.query.getParentElement(target, '.se-controller') ||
				(this.#$.component.isInline(_element) ? target === _element : target?.contains(_element)))
		);
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

		if (target.getAttribute('data-command') === 'close') {
			this.close();
			return;
		}

		this.host.controllerAction(target);
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#MouseEnter(e) {
		this.#$.ui.currentControllerName = this.kind;
		if (this.parentsForm.length > 0 && this.isInsideForm) return;

		const eventTarget = dom.query.getEventTarget(e);
		eventTarget.style.zIndex = this.toTop ? INDEX_00 : INDEX_0;

		// The z-index above governs only the no-popover fallback. In the popover top layer, stacking follows
		// show order — so to lift the hovered controller (and its tooltips) above an overlapping sibling, re-show it.
		if (this.sibling && _topHoverController !== this && this.form.matches?.(':popover-open')) {
			_topHoverController = this;
			this.form.hidePopover();
			this.form.showPopover();
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#MouseLeave(e) {
		if (this.parentsForm.length > 0 && this.isInsideForm) return;

		const eventTarget = dom.query.getEventTarget(e);
		eventTarget.style.zIndex = this.toTop ? INDEX_0 : this.#reserveIndex ? INDEX_S_1 : INDEX_1;
	}

	/**
	 * @param {KeyboardEvent} e - Event object
	 */
	#CloseListener_keydown(e) {
		if (this.#checkFixed()) return;
		const keyCode = e.code;
		const ctrl = keyCodeMap.isCtrl(e);
		if (ctrl || !keyCodeMap.isNonResponseKey(keyCode)) return;

		const eventTarget = dom.query.getEventTarget(e);
		if (!keyCodeMap.isEsc(keyCode)) {
			if (this.form.contains(eventTarget) || this.#checkForm(eventTarget)) return;
			if (this.#$.pluginManager.fileInfo.pluginRegExp.test(this.kind)) return;
		} else {
			if (this.#__childrenControllers__.some(({ isOpen }) => isOpen)) return;
			if (this.#escGuard?.()) return;

			if (this.escape === 'all') {
				e.preventDefault();
				e.stopPropagation();
				this.#PostCloseEvent(eventTarget);
				this.#$.ui.closeAllControllers();
				return;
			}

			if (this.isSelectionUI && this.parentsForm.length === 0) {
				this.#PostCloseEvent(eventTarget);
				return;
			}

			e.preventDefault();
			e.stopPropagation();
		}

		this.#PostCloseEvent(eventTarget);
		this.close();
	}

	/**
	 * @param {KeyboardEvent} e - Event object
	 */
	#CloseListener_mousedown(e) {
		const eventTarget = dom.query.getEventTarget(e);
		if (this.host?._element?.contains(eventTarget)) {
			this.#preventClose = true;
			return;
		}

		this.#preventClose = false;
		if (
			eventTarget === this.host._element ||
			eventTarget === this.currentTarget ||
			this.#checkFixed() ||
			this.form.contains(eventTarget) ||
			this.#checkForm(eventTarget) ||
			dom.query.getParentElement(eventTarget, '.se-line-breaker-component')
		) {
			return;
		}

		this.#PostCloseEvent(eventTarget);
		this.close(true);
	}

	/**
	 * @param {HTMLElement} eventTarget - The target element that triggered the event.
	 */
	#PostCloseEvent(eventTarget) {
		if (!this.#$.frameContext.get('wysiwyg').contains(eventTarget)) {
			this.#$.component.__prevent = false;
		}
	}
}

export default Controller;
