import { dom, converter, keyCodeMap, env, numbers } from '../../../helper';
import { _DragHandle } from '../../../modules/ui';
import { COMMAND_BUTTONS } from './commandDispatcher';

const DISABLE_BUTTONS_CODEVIEW = `${COMMAND_BUTTONS}:not([class~="se-code-view-enabled"]):not([data-type="MORE"])`;
const DISABLE_BUTTONS_CONTROLLER = `${COMMAND_BUTTONS}:not([class~="se-component-enabled"]):not([data-type="MORE"])`;

const { _w } = env;

/**
 * @description The UI class is a class that handles operations related to the user interface of SunEditor.
 * - This class sets the editor's style, theme, editor mode, etc., and controls the state of various UI elements.
 */
class UIManager {
	#kernel;
	#$;
	#store;

	#contextProvider;
	#carrierWrapper;
	#options;
	#context;
	#frameRoots;
	#frameContext;
	#eventManager;

	#alertArea;
	#alertInner;
	#closeListener;
	#closeSignal;
	#backWrapper;

	#controllerOnBtnDisabled = false;
	#bindClose = null;
	#toastToggle = null;

	/**
	 * @description List of buttons that are disabled when `controller` is opened
	 * @type {Array<HTMLButtonElement|HTMLInputElement>}
	 */
	#controllerOnDisabledButtons = [];

	/**
	 * @description List of buttons that are disabled when `codeView` mode opened
	 * @type {Array<HTMLButtonElement|HTMLInputElement>}
	 */
	#codeViewDisabledButtons = [];

	/**
	 * @description Variable that controls the `blur` event in the editor of `inline` or `balloon` mode when the focus is moved to dropdown
	 * @type {boolean}
	 */
	#notHideToolbar = false;

	/**
	 * @description Line breaker (top)
	 * @type {HTMLElement}
	 */
	#lineBreaker_t = null;

	/**
	 * @description Line breaker (bottom)
	 * @type {HTMLElement}
	 */
	#lineBreaker_b = null;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel) {
		this.#kernel = kernel;
		this.#$ = kernel.$;
		this.#store = kernel.store;

		this.#contextProvider = this.#$.contextProvider;
		this.#carrierWrapper = this.#contextProvider.carrierWrapper;
		this.#options = this.#$.options;
		this.#context = this.#$.context;
		this.#frameRoots = this.#$.frameRoots;
		this.#frameContext = this.#$.frameContext;
		this.#eventManager = this.#$.eventManager;

		// alert
		const alertModal = CreateAlertHTML(this.#contextProvider);
		this.alertModal = alertModal;
		this.alertMessage = alertModal.querySelector('span');

		// toast
		const toastPopup = CreateToastHTML();
		this.toastPopup = toastPopup;
		this.toastContainer = toastPopup.querySelector('.se-toast-container');
		this.toastMessage = toastPopup.querySelector('span');
		this.#carrierWrapper.appendChild(toastPopup);

		// init
		this.#alertArea = /** @type {HTMLElement} */ (this.#carrierWrapper.querySelector('.se-alert'));
		this.#alertInner = /** @type {HTMLElement} */ (this.#carrierWrapper.querySelector('.se-alert .se-modal-inner'));
		this.#alertInner.appendChild(alertModal);
		this.#closeListener = [CloseListener.bind(this), OnClick_alert.bind(this)];
		this.#closeSignal = false;
		this.#backWrapper = /** @type {HTMLElement} */ (this.#carrierWrapper.querySelector('.se-back-wrapper'));

		/**
		 * @description Whether `SelectMenu` is open
		 * @type {boolean}
		 */
		this.selectMenuOn = false;

		/**
		 * @description Currently open `Controller` info array
		 * @type {Array<SunEditor.Module.Controller.Info>}
		 */
		this.opendControllers = [];

		/**
		 * @description Controller target's frame div (`editor.frameContext.get('topArea')`)
		 * @type {?HTMLElement}
		 */
		this.controllerTargetContext = null;

		/**
		 * @internal
		 * @description Current Figure container.
		 * @type {?HTMLElement}
		 */
		this._figureContainer = null;
	}

	/**
	 * @description Set editor frame styles.
	 * - Define the style of the edit area
	 * - It can also be defined with the `setOptions` method, but the `setEditorStyle` method does not render the editor again.
	 * @param {string} style Style string
	 * @param {?SunEditor.FrameContext} [fc] Frame context
	 */
	setEditorStyle(style, fc) {
		fc ||= this.#frameContext;

		const fo = fc.get('options');
		fo.set('editorStyle', style);

		const newStyles = converter._setDefaultOptionStyle(fo, style);
		fo.set('_defaultStyles', newStyles);

		// top area
		fc.get('topArea').style.cssText = newStyles.top;

		// code view
		const code = fc.get('code');
		if (this.#options.get('hasCodeMirror')) {
			const frameStyleArr = fo.get('_defaultStyles').frame.split(';');
			for (let i = 0, len = frameStyleArr.length, s; i < len; i++) {
				s = frameStyleArr[i].trim();
				if (!s) continue;
				const [prop, val] = s.split(':');
				code.style.setProperty(prop.trim(), val.trim());
			}
		} else {
			code.style.cssText = fo.get('_defaultStyles').frame;
		}

		// wysiwyg frame
		if (!fo.get('iframe')) {
			fc.get('wysiwygFrame').style.cssText = newStyles.frame + newStyles.editor;
		} else {
			fc.get('wysiwygFrame').style.cssText = newStyles.frame;
			fc.get('wysiwyg').style.cssText = newStyles.editor;
		}
	}

	/**
	 * @description Set the theme to the editor
	 * @param {string} theme Theme name
	 */
	setTheme(theme) {
		if (typeof theme !== 'string') return;
		const o = this.#options;
		const prevTheme = o.get('_themeClass').trim();
		o.set('theme', theme || '');
		o.set('_themeClass', theme ? ` se-theme-${theme}` : '');
		theme = o.get('_themeClass').trim();

		const applyTheme = (target) => {
			if (!target) return;
			if (prevTheme) dom.utils.removeClass(target, prevTheme);
			if (theme) dom.utils.addClass(target, theme);
		};

		applyTheme(this.#carrierWrapper);
		this.#contextProvider.applyToRoots((e) => {
			applyTheme(e.get('topArea'));
			applyTheme(e.get('wysiwyg'));
		});

		applyTheme(this.#context.get('statusbar_wrapper'));
		applyTheme(this.#context.get('toolbar_wrapper'));
	}

	/**
	 * @description Set direction to `rtl` or `ltr`.
	 * @param {string} dir `rtl` or `ltr`
	 */
	setDir(dir) {
		const rtl = dir === 'rtl';
		if (this.#options.get('_rtl') === rtl) return;

		try {
			this.#options.set('_rtl', rtl);
			this.offCurrentController();

			const fc = this.#frameContext;
			const plugins = this.#$.pluginManager.plugins;
			for (const k in plugins) {
				plugins[k].setDir?.(dir);
			}

			const toolbarWrapper = this.#context.get('toolbar_wrapper');
			const statusbarWrapper = this.#context.get('statusbar_wrapper');
			if (rtl) {
				this.#contextProvider.applyToRoots((e) => {
					dom.utils.addClass([e.get('topArea'), e.get('wysiwyg'), e.get('documentTypePageMirror')], 'se-rtl');
				});
				dom.utils.addClass([this.#carrierWrapper, toolbarWrapper, statusbarWrapper], 'se-rtl');
			} else {
				this.#contextProvider.applyToRoots((e) => {
					dom.utils.removeClass([e.get('topArea'), e.get('wysiwyg'), e.get('documentTypePageMirror')], 'se-rtl');
				});
				dom.utils.removeClass([this.#carrierWrapper, toolbarWrapper, statusbarWrapper], 'se-rtl');
			}

			const lineNodes = dom.query.getListChildren(
				fc.get('wysiwyg'),
				(current) => {
					return this.#$.format.isLine(current) && !!(current.style.marginRight || current.style.marginLeft || current.style.textAlign);
				},
				null,
			);

			for (let i = 0, n, l, r; (n = lineNodes[i]); i++) {
				n = lineNodes[i];
				// indent margin
				r = n.style.marginRight;
				l = n.style.marginLeft;
				if (r || l) {
					n.style.marginRight = l;
					n.style.marginLeft = r;
				}
				// text align
				r = n.style.textAlign;
				if (r === 'left') n.style.textAlign = 'right';
				else if (r === 'right') n.style.textAlign = 'left';
			}

			this.#activeDirBtn(rtl);

			// document type
			if (fc.has('documentType_use_header')) {
				if (rtl) fc.get('wrapper').appendChild(fc.get('documentTypeInner'));
				else fc.get('wrapper').insertBefore(fc.get('documentTypeInner'), fc.get('wysiwygFrame'));
			}
			if (fc.has('documentType_use_page')) {
				if (rtl) fc.get('wrapper').insertBefore(fc.get('documentTypePage'), fc.get('wysiwygFrame'));
				else fc.get('wrapper').appendChild(fc.get('documentTypePage'));
			}

			if (this.#store.mode.isBalloon) this.#$.toolbar._showBalloon();
			else if (this.#store.mode.isSubBalloon) this.#$.subToolbar._showBalloon();
		} catch (e) {
			this.#options.set('_rtl', !rtl);
			console.warn(`[SUNEDITOR.ui.setDir.fail] ${e.toString()}`);
		}

		this.#store.set('_lastSelectionNode', null);
		this.#kernel._eventOrchestrator.applyTagEffect();
	}

	/**
	 * @description Switch to or off `ReadOnly` mode.
	 * @param {boolean} value `readOnly` boolean value.
	 * @param {string} [rootKey] Root key
	 */
	readOnly(value, rootKey) {
		const fc = rootKey ? this.#frameRoots.get(rootKey) : this.#frameContext;

		fc.set('isReadOnly', !!value);

		this._toggleControllerButtons(!!value);

		if (value) {
			this.offCurrentController();
			this.offCurrentModal();

			if (this.#$.toolbar?.currentMoreLayerActiveButton?.disabled) this.#$.toolbar._moreLayerOff();
			if (this.#$.subToolbar?.currentMoreLayerActiveButton?.disabled) this.#$.subToolbar._moreLayerOff();
			if (this.#$.menu?.currentDropdownActiveButton?.disabled) this.#$.menu.dropdownOff();
			if (this.#$.menu?.currentContainerActiveButton?.disabled) this.#$.menu.containerOff();

			fc.get('code').setAttribute('readOnly', 'true');
			dom.utils.addClass(fc.get('wysiwyg'), 'se-read-only');
		} else {
			fc.get('code').removeAttribute('readOnly');
			dom.utils.removeClass(fc.get('wysiwyg'), 'se-read-only');
		}

		if (this.#options.get('hasCodeMirror')) {
			this.#$.viewer._codeMirrorEditor('readonly', !!value, rootKey);
		}
	}

	/**
	 * @description Disables the editor.
	 * @param {string} [rootKey] Root key
	 */
	disable(rootKey) {
		const fc = rootKey ? this.#frameRoots.get(rootKey) : this.#frameContext;

		this.#$.toolbar.disable();
		this.offCurrentController();
		this.offCurrentModal();

		fc.get('wysiwyg').setAttribute('contenteditable', 'false');
		fc.set('isDisabled', true);

		if (this.#options.get('hasCodeMirror')) {
			this.#$.viewer._codeMirrorEditor('readonly', true, rootKey);
		} else {
			fc.get('code').disabled = true;
		}
	}

	/**
	 * @description Enables the editor.
	 * @param {string} [rootKey] Root key
	 */
	enable(rootKey) {
		const fc = rootKey ? this.#frameRoots.get(rootKey) : this.#frameContext;

		this.#$.toolbar.enable();
		fc.get('wysiwyg').setAttribute('contenteditable', 'true');
		fc.set('isDisabled', false);

		if (this.#options.get('hasCodeMirror')) {
			this.#$.viewer._codeMirrorEditor('readonly', false, rootKey);
		} else {
			fc.get('code').disabled = false;
		}
	}

	/**
	 * @description Shows the editor interface.
	 * @param {string} [rootKey] Root key
	 */
	show(rootKey) {
		const fc = rootKey ? this.#frameRoots.get(rootKey) : this.#frameContext;
		const topAreaStyle = fc.get('topArea').style;
		if (topAreaStyle.display === 'none') topAreaStyle.display = 'block';
	}

	/**
	 * @description Hides the editor interface.
	 * @param {string} [rootKey] Root key
	 */
	hide(rootKey) {
		const fc = rootKey ? this.#frameRoots.get(rootKey) : this.#frameContext;
		fc.get('topArea').style.display = 'none';
	}

	/**
	 * @description Shows the loading spinner.
	 * @param {string} [rootKey] Root key
	 */
	showLoading(rootKey) {
		/** @type {HTMLElement} */ ((rootKey ? this.#frameRoots.get(rootKey).get('container') : this.#carrierWrapper).querySelector('.se-loading-box')).style.display = 'block';
	}

	/**
	 * @description Hides the loading spinner.
	 * @param {string} [rootKey] Root key
	 */
	hideLoading(rootKey) {
		/** @type {HTMLElement} */ ((rootKey ? this.#frameRoots.get(rootKey).get('container') : this.#carrierWrapper).querySelector('.se-loading-box')).style.display = 'none';
	}

	/**
	 * @description  Open the alert panel
	 * @param {string} text alert message
	 * @param {""|"error"|"success"} type alert type
	 */
	alertOpen(text, type) {
		this.alertMessage.textContent = text;

		dom.utils.removeClass(this.alertModal, 'se-alert-error|se-alert-success');
		if (type) dom.utils.addClass(this.alertModal, `se-alert-${type}`);

		if (this.#closeSignal) this.#alertInner.addEventListener('click', this.#closeListener[1]);
		this.#bindClose &&= this.#eventManager.removeGlobalEvent(this.#bindClose);
		this.#bindClose = this.#eventManager.addGlobalEvent('keydown', this.#closeListener[0]);

		this.#alertArea.style.display = 'block';
		dom.utils.addClass(this.alertModal, 'se-modal-show');
	}

	/**
	 * @description  Close the alert panel
	 */
	alertClose() {
		dom.utils.removeClass(this.alertModal, 'se-modal-show');
		dom.utils.removeClass(this.alertModal, 'se-alert-*');
		this.#alertArea.style.display = 'none';
		if (this.#closeSignal) this.#alertInner.removeEventListener('click', this.#closeListener[1]);
		this.#bindClose &&= this.#eventManager.removeGlobalEvent(this.#bindClose);
	}

	/**
	 * @description Show toast
	 * @param {string} message toast message
	 * @param {number} [duration=1000] duration time(ms)
	 * @param {""|"error"|"success"} [type=""] duration time(ms)
	 */
	showToast(message, duration = 1000, type) {
		if (dom.utils.hasClass(this.toastContainer, 'se-toast-show')) {
			this.closeToast();
		}

		dom.utils.removeClass(this.toastPopup, 'se-toast-error|se-toast-success');
		if (type) dom.utils.addClass(this.toastPopup, `se-toast-${type}`);

		this.toastPopup.style.display = 'block';
		this.toastMessage.textContent = message;
		dom.utils.addClass(this.toastContainer, 'se-toast-show');

		// Auto-dismiss toast after display duration (cleared if toast is manually closed)
		this.#toastToggle = _w.setTimeout(() => {
			this.closeToast();
		}, duration);
	}

	/**
	 * @description Close toast
	 */
	closeToast() {
		if (this.#toastToggle) _w.clearTimeout(this.#toastToggle);
		this.#toastToggle = null;
		dom.utils.removeClass(this.toastContainer, 'se-toast-show');
		this.toastPopup.style.display = 'none';
	}

	/**
	 * @description This method disables or enables the toolbar buttons when the `controller` is activated or deactivated.
	 * - When the `controller` is activated, the toolbar buttons are disabled; when the `controller` is deactivated, the buttons are enabled.
	 * @param {boolean} active If `true`, the toolbar buttons will be disabled. If `false`, the toolbar buttons will be enabled.
	 * @returns {boolean} The current state of the controller on disabled buttons.
	 */
	setControllerOnDisabledButtons(active) {
		if (active && !this.#controllerOnBtnDisabled) {
			this._toggleControllerButtons(true);
			this.#controllerOnBtnDisabled = true;
		} else if (!active && this.#controllerOnBtnDisabled) {
			this._toggleControllerButtons(false);
			this.#controllerOnBtnDisabled = false;
		}
		return this.#controllerOnBtnDisabled;
	}

	/**
	 * @description Set the controller target context to the current top area.
	 */
	onControllerContext() {
		this.controllerTargetContext = this.#frameContext.get('topArea');
	}

	/**
	 * @description Reset the controller target context.
	 */
	offControllerContext() {
		this.controllerTargetContext = null;
	}

	/**
	 * @description Activate the transparent background `div` so that other elements are not affected during resizing.
	 * @param {string} cursor cursor css property
	 */
	enableBackWrapper(cursor) {
		this.#backWrapper.style.cursor = cursor;
		this.#backWrapper.style.display = 'block';
	}

	/**
	 * @description Disabled background `div`
	 */
	disableBackWrapper() {
		this.#backWrapper.style.display = 'none';
		this.#backWrapper.style.cursor = 'default';
	}

	/**
	 * @description Closes the currently active controller by delegating to the component's deselect logic.
	 * Use this method to close a single active controller from external code.
	 * @see _offControllers - For closing all open controllers at once (internal use)
	 */
	offCurrentController() {
		this.#$.component.__deselect();
	}

	/**
	 * @description Closes the currently open modal dialog.
	 */
	offCurrentModal() {
		this.opendModal?.close();
	}

	/**
	 * @description Get the current figure container only if it is visible (active).
	 * @returns {?HTMLElement} The active figure element or `null`.
	 */
	getVisibleFigure() {
		return this._figureContainer?.style.display === 'block' ? this._figureContainer : null;
	}

	/**
	 * @description Set the active figure element (image, video) being resized.
	 * @param {?HTMLElement} figure
	 */
	setFigureContainer(figure) {
		this._figureContainer = figure;
	}

	preventToolbarHide(allow) {
		this.#notHideToolbar = allow;
	}

	get isPreventToolbarHide() {
		return this.#notHideToolbar;
	}

	/**
	 * @param {SunEditor.FrameContext} rt Root target[key] FrameContext
	 */
	reset(rt) {
		rt.set('_editorHeight', rt.get('wysiwygFrame').offsetHeight);
		this.#lineBreaker_t = rt.get('lineBreaker_t');
		this.#lineBreaker_b = rt.get('lineBreaker_b');
	}

	/**
	 * @internal
	 * @description Closes all open controllers except those marked as `fixed`.
	 * Iterates through `opendControllers`, calls `controllerClose` on each non-fixed controller,
	 * hides their forms, and resets the controller state.
	 * @see offCurrentController - Public method for closing a single controller via component deselect
	 */
	_offControllers() {
		const cont = this.opendControllers;
		const fixedCont = [];
		for (let i = 0, c; i < cont.length; i++) {
			c = cont[i];
			if (c.fixed) {
				fixedCont.push(c);
				continue;
			}
			c.inst.controllerClose?.();
			if (c.form) c.form.style.display = 'none';
		}
		this.opendControllers = fixedCont;
		this.currentControllerName = '';
		this.#store.set('_preventBlur', false);
	}

	/**
	 * @internal
	 * @description Synchronizes floating UI element positions with the current scroll offset.
	 * Called by eventManager when the wysiwyg area is scrolled.
	 * - Adjusts balloon toolbar position based on scroll offset
	 * - Closes controllers if scroll target changes
	 * - Updates line breaker positions
	 * @param {SunEditor.EventWysiwyg} eventWysiwyg - The scroll event source (Window or element with scroll data)
	 */
	_syncScrollPosition(eventWysiwyg) {
		const y = eventWysiwyg.scrollTop || eventWysiwyg.scrollY || 0;
		const x = eventWysiwyg.scrollLeft || eventWysiwyg.scrollX || 0;

		if (this.#store.mode.isBalloon) {
			this.#context.get('toolbar_main').style.top = this.#$.toolbar.balloonOffset.top - y + 'px';
			this.#context.get('toolbar_main').style.left = this.#$.toolbar.balloonOffset.left - x + 'px';
		} else if (this.#store.mode.isSubBalloon) {
			this.#context.get('toolbar_sub_main').style.top = this.#$.subToolbar.balloonOffset.top - y + 'px';
			this.#context.get('toolbar_sub_main').style.left = this.#$.subToolbar.balloonOffset.left - x + 'px';
		}

		if (this.controllerTargetContext !== this.#frameContext.get('topArea')) {
			this.offCurrentController();
		}

		this.#resetLineBreaker(x, y);
	}

	/**
	 * @internal
	 * @description Repositions all currently open controllers after scroll.
	 * Called by eventManager during container scroll events.
	 * - Triggers drag handle repositioning if active
	 * - Calls _scrollReposition on each open controller
	 */
	_repositionControllers() {
		const openCont = this.opendControllers;
		if (openCont.length === 0) return;

		if (_DragHandle.get('__dragMove')) _DragHandle.get('__dragMove')();
		for (let i = 0; i < openCont.length; i++) {
			if (openCont[i].notInCarrier) continue;
			openCont[i].inst?._scrollReposition();
		}
	}

	/**
	 *
	 * @param {number} x
	 * @param {number} y
	 */
	#resetLineBreaker(x, y) {
		if (this.#lineBreaker_t) {
			const t_style = this.#lineBreaker_t.style;
			if (t_style.display !== 'none') {
				const t_offset = (this.#lineBreaker_t.getAttribute('data-offset') || ',').split(',');
				t_style.top = numbers.get(t_style.top, 0) - (y - numbers.get(t_offset[0], 0)) + 'px';
				t_style.left = numbers.get(t_style.left, 0) - (x - numbers.get(t_offset[1], 0)) + 'px';
				this.#lineBreaker_t.setAttribute('data-offset', y + ',' + x);
			}
		}

		if (this.#lineBreaker_b) {
			const b_style = this.#lineBreaker_b.style;
			if (b_style.display !== 'none') {
				const b_offset = (this.#lineBreaker_b.getAttribute('data-offset') || ',').split(',');
				b_style.top = numbers.get(b_style.top, 0) - (y - numbers.get(b_offset[0], 0)) + 'px';
				b_style[b_offset[1]] = numbers.get(b_style[b_offset[1]], 0) - (x - numbers.get(b_offset[2], 0)) + 'px';
				this.#lineBreaker_b.setAttribute('data-offset', y + ',' + b_offset[1] + ',' + x);
			}
		}

		const openCont = this.opendControllers;
		for (let i = 0; i < openCont.length; i++) {
			if (!openCont[i].notInCarrier) continue;
			openCont[i].form.style.top = openCont[i].inst.__offset.top - y + 'px';
			openCont[i].form.style.left = openCont[i].inst.__offset.left - x + 'px';
		}
	}

	/**
	 * @internal
	 * @description Visible controllers
	 * @param {boolean} value hidden/show
	 * @param {?boolean} [lineBreakShow] Line break hidden/show (default: Follows the value `value`.)
	 */
	_visibleControllers(value, lineBreakShow) {
		const visible = value ? '' : 'hidden';
		const breakerVisible = (lineBreakShow ?? visible) ? '' : 'hidden';

		const cont = this.opendControllers;
		for (let i = 0, c; i < cont.length; i++) {
			c = cont[i];
			if (c.form) c.form.style.visibility = visible;
		}

		this.#lineBreaker_t.style.visibility = breakerVisible;
		this.#lineBreaker_b.style.visibility = breakerVisible;
	}

	setCurrentControllerContext;

	/**
	 * @description Toggles direction button active state.
	 * @param {boolean} rtl - Whether the text direction is right-to-left.
	 */
	#activeDirBtn(rtl) {
		const icons = this.#contextProvider.icons;
		const commandTargets = this.#$.commandDispatcher?.targets;
		if (!commandTargets) return;
		const shortcutsKeyMap = this.#$.shortcuts?.keyMap;

		// change reverse shortcuts key
		this.#$.shortcuts?.reverseKeys?.forEach((e) => {
			const info = shortcutsKeyMap?.get(e);
			if (!info) return;
			[info.command, info.r] = [info.r, info.command];
		});

		// change dir buttons
		this.#$.commandDispatcher.applyTargets('dir', (e) => {
			dom.utils.changeTxt(e.querySelector('.se-tooltip-text'), this.#contextProvider.lang[rtl ? 'dir_ltr' : 'dir_rtl']);
			dom.utils.changeElement(e.firstElementChild, icons[rtl ? 'dir_ltr' : 'dir_rtl']);
		});

		if (rtl) {
			dom.utils.addClass(commandTargets.get('dir_rtl'), 'active');
			dom.utils.removeClass(commandTargets.get('dir_ltr'), 'active');
		} else {
			dom.utils.addClass(commandTargets.get('dir_ltr'), 'active');
			dom.utils.removeClass(commandTargets.get('dir_rtl'), 'active');
		}
	}

	/**
	 * @internal
	 * @description Set the disabled button list
	 */
	_initToggleButtons() {
		const ctx = this.#context;

		this.#codeViewDisabledButtons = converter.nodeListToArray(ctx.get('toolbar_buttonTray').querySelectorAll(DISABLE_BUTTONS_CODEVIEW));
		this.#controllerOnDisabledButtons = converter.nodeListToArray(ctx.get('toolbar_buttonTray').querySelectorAll(DISABLE_BUTTONS_CONTROLLER));

		if (this.#options.has('_subMode')) {
			this.#codeViewDisabledButtons = this.#codeViewDisabledButtons.concat(converter.nodeListToArray(ctx.get('toolbar_sub_buttonTray').querySelectorAll(DISABLE_BUTTONS_CODEVIEW)));
			this.#controllerOnDisabledButtons = this.#controllerOnDisabledButtons.concat(converter.nodeListToArray(ctx.get('toolbar_sub_buttonTray').querySelectorAll(DISABLE_BUTTONS_CONTROLLER)));
		}
	}

	/**
	 * @internal
	 * @description Toggle the disabled state of buttons reserved for Code View.
	 * @param {boolean} isCodeView
	 */
	_toggleCodeViewButtons(isCodeView) {
		dom.utils.setDisabled(this.#codeViewDisabledButtons, isCodeView);
	}
	/**
	 * @internal
	 * @description Toggle the disabled state of buttons when a controller is active.
	 * @param {boolean} isOpen
	 */
	_toggleControllerButtons(isOpen) {
		dom.utils.setDisabled(this.#controllerOnDisabledButtons, isOpen);
	}

	/**
	 * @description Check if the button can be executed in the current state (ReadOnly, etc.)
	 * @param {Node} button
	 * @returns {boolean}
	 */
	isButtonDisabled(button) {
		if (this.#frameContext.get('isReadOnly') && dom.utils.arrayIncludes(this.#controllerOnDisabledButtons, button)) {
			return true;
		}
		return false;
	}

	/**
	 * @internal
	 * @description Updates `placeholder` visibility based on editor state.
	 * Shows `placeholder` when editor is empty, hides it in code view or when content exists.
	 * @param {SunEditor.FrameContext} [fc] - Frame context (defaults to current frameContext)
	 */
	_updatePlaceholder(fc) {
		fc ||= this.#frameContext;
		const placeholder = fc.get('placeholder');

		if (placeholder) {
			if (fc.get('isCodeView')) {
				placeholder.style.display = 'none';
				return;
			}

			if (this.#$.facade.isEmpty(fc)) {
				placeholder.style.display = 'block';
			} else {
				placeholder.style.display = 'none';
			}
		}
	}

	/**
	 * @internal
	 * @description Synchronizes frame UI state after content changes.
	 * Coordinates `iframe` height adjustment, `placeholder` visibility, and document type page sync.
	 * @param {SunEditor.FrameContext} fc - Frame context to synchronize
	 */
	_syncFrameState(fc) {
		if (!fc) return;
		this._iframeAutoHeight(fc);
		this._updatePlaceholder(fc);
		// document type page
		if (fc.has('documentType_use_page')) {
			fc.get('documentTypePageMirror').innerHTML = fc.get('wysiwyg').innerHTML;
			fc.get('documentType').rePage(true);
		}
	}

	/**
	 * @internal
	 * @description Adjusts `iframe` height to match content height.
	 * Handles `auto`-height `iframe`s and manages scrolling based on `maxHeight` option.
	 * @param {SunEditor.FrameContext} fc - Frame context containing the `iframe`
	 */
	_iframeAutoHeight(fc) {
		if (!fc) return;
		const autoFrame = fc.get('_iframeAuto');

		if (autoFrame) {
			// Defer iframe height measurement — content must render/reflow before measuring offsetHeight
			_w.setTimeout(() => {
				const h = autoFrame.offsetHeight;
				const wysiwygFrame = fc.get('wysiwygFrame');
				if (!wysiwygFrame) return;
				wysiwygFrame.style.height = h + 'px';

				// maxHeight
				const fo = fc.get('options');
				if (fo?.get('iframe')) {
					const maxHeight = fo.get('maxHeight');
					if (maxHeight) {
						wysiwygFrame.setAttribute('scrolling', h > numbers.get(maxHeight) ? 'auto' : 'no');
					}
				}

				if (!env.isResizeObserverSupported) this._emitResizeEvent(fc, h, null);
			}, 0);
		} else if (!env.isResizeObserverSupported) {
			const wysiwygFrame = fc.get('wysiwygFrame');
			if (wysiwygFrame) {
				this._emitResizeEvent(fc, wysiwygFrame.offsetHeight, null);
			}
		}
	}

	/**
	 * @internal
	 * @description Emits the `onResizeEditor` event when editor height changes.
	 * Calculates height from `ResizeObserverEntry` if not provided directly.
	 * @param {SunEditor.FrameContext} fc - Frame context
	 * @param {number} h - Height value (`-1` to calculate from `resizeObserverEntry`)
	 * @param {ResizeObserverEntry|null} resizeObserverEntry - `ResizeObserver` entry for height calculation
	 */
	_emitResizeEvent(fc, h, resizeObserverEntry) {
		h =
			h === -1
				? resizeObserverEntry?.borderBoxSize && resizeObserverEntry.borderBoxSize[0]
					? resizeObserverEntry.borderBoxSize[0].blockSize
					: resizeObserverEntry.contentRect.height + numbers.get(fc.get('wwComputedStyle').getPropertyValue('padding-left')) + numbers.get(fc.get('wwComputedStyle').getPropertyValue('padding-right'))
				: h;
		if (fc.get('_editorHeight') !== h) {
			this.#eventManager.triggerEvent('onResizeEditor', { height: h, prevHeight: fc.get('_editorHeight'), frameContext: fc, observerEntry: resizeObserverEntry });
			fc.set('_editorHeight', h);
		}

		// document type page
		if (fc.has('documentType_use_page')) {
			fc.get('documentType').resizePage();
		}
	}

	init() {
		this.#closeSignal = !this.#eventManager.addEvent(this.alertModal.querySelector('[data-command="close"]'), 'click', this.alertClose.bind(this));
		this._initToggleButtons();
	}

	/**
	 * @internal
	 * @description Destroy the UI instance and release memory
	 */
	_destroy() {
		// Clear timer
		if (this.#toastToggle) {
			_w.clearTimeout(this.#toastToggle);
		}

		// Remove global event
		this.#bindClose &&= this.#eventManager.removeGlobalEvent(this.#bindClose);

		// Remove alert click event listener
		if (this.#closeSignal && this.#alertInner) {
			this.#alertInner.removeEventListener('click', this.#closeListener[1]);
		}

		this.opendModal = null;
		this.opendBrowser = null;
		this.#lineBreaker_t = null;
		this.#lineBreaker_b = null;
		this.#controllerOnDisabledButtons = null;
		this.#codeViewDisabledButtons = null;
	}
}

/**
 * @param {MouseEvent} e - Event object
 */
function OnClick_alert(e) {
	const eventTarget = dom.query.getEventTarget(e);
	if (/close/.test(eventTarget.getAttribute('data-command')) || eventTarget === this._alertInner) {
		this.alertClose();
	}
}

/**
 * @param {KeyboardEvent} e - Event object
 */
function CloseListener(e) {
	if (!keyCodeMap.isEsc(e.code)) return;
	this.alertClose();
}

function CreateAlertHTML({ lang, icons }) {
	const html = '<div><button class="close" data-command="close" title="' + lang.close + '">' + icons.cancel + '</button></div><div><span></span></div>';
	return dom.utils.createElement('DIV', { class: 'se-alert-content' }, html);
}

function CreateToastHTML() {
	const html = '<div class="se-toast-container"><span></span></div>';
	return dom.utils.createElement('DIV', { class: 'se-toast' }, html);
}

export default UIManager;
