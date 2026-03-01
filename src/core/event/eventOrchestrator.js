import KernelInjector from '../kernel/kernelInjector';
import { dom, unicode, numbers, env, converter } from '../../helper';
import { _DragHandle } from '../../modules/ui';

// event handlers
import { ButtonsHandler, OnClick_menuTray, OnClick_toolbar } from '../event/handlers/handler_toolbar';
import { OnMouseDown_wysiwyg, OnMouseUp_wysiwyg, OnClick_wysiwyg, OnMouseMove_wysiwyg, OnMouseLeave_wysiwyg } from '../event/handlers/handler_ww_mouse';
import { OnBeforeInput_wysiwyg, OnInput_wysiwyg } from '../event/handlers/handler_ww_input';
import { OnKeyDown_wysiwyg, OnKeyUp_wysiwyg } from '../event/handlers/handler_ww_key';
import { OnPaste_wysiwyg, OnCopy_wysiwyg, OnCut_wysiwyg } from '../event/handlers/handler_ww_clipboard';
import { OnDragOver_wysiwyg, OnDragEnd_wysiwyg, OnDrop_wysiwyg } from '../event/handlers/handler_ww_dragDrop';

// logic
import DefaultLineManager from '../event/support/defaultLineManager';
import SelectionState from '../event/support/selectionState';

const { _w, isMobile, isTouchDevice } = env;

/**
 * @description Event orchestrator
 */
class EventOrchestrator extends KernelInjector {
	#store;
	#contextProvider;
	#context;
	#options;
	#eventManager;
	#toolbar;
	#ui;
	#menu;

	/** @type {number} */
	#balloonDelay = null;
	/** @type {?SunEditor.Event.GlobalInfo} */
	#close_move = null;
	/** @type {?SunEditor.Event.GlobalInfo} */
	#selectionSyncEvent = null;
	/**  @type {?SunEditor.Event.GlobalInfo} */
	#resize_editor = null;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel) {
		super(kernel);

		this.#store = this.$.store;
		this.#contextProvider = this.$.contextProvider;
		this.#context = this.$.context;
		this.#options = this.$.options;
		this.#eventManager = this.$.eventManager;
		this.#toolbar = this.$.toolbar;
		this.#ui = this.$.ui;
		this.#menu = this.$.menu;

		/**
		 * @description Old browsers: When there is no `e.isComposing` in the `keyup` event
		 * @type {boolean}
		 */
		this.isComposing = false;

		/**
		 * @description An array of parent containers that can be scrolled (in descending order)
		 * @type {Array<Element>}
		 */
		this.scrollparents = [];

		// logic services (internal - receive EventManager reference)
		this.defaultLineManager = new DefaultLineManager(this);
		this.selectionState = new SelectionState(this);

		// internal members
		/** @internal @type {boolean} */
		this._onShortcutKey = false;
		/** @internal @type {boolean} */
		this._handledInBefore = false;
		/** @internal @type {ResizeObserver} */
		this._wwFrameObserver = null;
		/** @internal @type {ResizeObserver} */
		this._toolbarObserver = null;
		/** @internal @type {?Element} */
		this._lineBreakComp = null;
		/** @internal @type {?Object<string, *>} */
		this._formatAttrsTemp = null;
		/** @internal @type {number} */
		this._resizeClientY = 0;
		/** @internal @type {Array<Node>} */
		this.__cacheStyleNodes = [];
		this.__onDownEv = null;

		// input plugins
		/** @internal @type {boolean} */
		this._inputFocus = false;
		/** @internal @type {?Object<string, *>} */
		this.__inputPlugin = null;
		/** @internal @type {?SunEditor.Event.Info=} */
		this.__inputBlurEvent = null;
		/** @internal @type {?SunEditor.Event.Info=} */
		this.__inputKeyEvent = null;

		// viewport
		/** @type {number|void} */
		this.__retainTimer = null;
		/** @type {Document} */
		this.__eventDoc = null;
		/** @type {string} */
		this.__secopy = null;
	}

	/**
	 * @description Activates the corresponding button with the tags information of the current cursor position,
	 * - such as `bold`, `underline`, etc., and executes the `active` method of the plugins.
	 * @param {?Node} [selectionNode] selectionNode
	 * @returns {Node|undefined} selectionNode
	 */
	applyTagEffect(selectionNode) {
		return this.selectionState.update(selectionNode);
	}

	/**
	 * @internal
	 * @description Show toolbar-balloon with delay.
	 */
	_showToolbarBalloonDelay() {
		if (this.#balloonDelay) {
			_w.clearTimeout(this.#balloonDelay);
		}

		this.#balloonDelay = _w.setTimeout(() => {
			_w.clearTimeout(this.#balloonDelay);
			this.#balloonDelay = null;
			if (this.#store.mode.isSubBalloon) this.$.subToolbar._showBalloon();
			else this.#toolbar._showBalloon();
		}, 250);
	}

	/**
	 * @internal
	 * @description Show or hide the toolbar-balloon.
	 */
	_toggleToolbarBalloon() {
		this.$.selection.init();
		const range = this.$.selection.getRange();
		const hasSubMode = this.#options.has('_subMode');

		if (!(hasSubMode ? this.#store.mode.isSubBalloonAlways : this.#store.mode.isBalloonAlways) && range.collapsed) {
			if (hasSubMode) this._hideToolbar_sub();
			else this._hideToolbar();
		} else {
			if (hasSubMode) this.$.subToolbar._showBalloon(range);
			else this.#toolbar._showBalloon(range);
		}
	}

	/**
	 * @internal
	 * @description Hide the toolbar.
	 */
	_hideToolbar() {
		if (!this.#ui.isPreventToolbarHide && !this.$.frameContext.get('isFullScreen')) {
			this.#toolbar.hide();
		}
	}

	/**
	 * @internal
	 * @description Hide the Sub-Toolbar.
	 */
	_hideToolbar_sub() {
		if (this.$.subToolbar && !this.#ui.isPreventToolbarHide) {
			this.$.subToolbar.hide();
		}
	}

	/**
	 * @internal
	 * @description If there is no default format, add a `line` and move `selection`.
	 * @param {?string} formatName Format tag name (default: `P`)
	 */
	_setDefaultLine(formatName) {
		return this.defaultLineManager.execute(formatName);
	}

	/**
	 * @internal
	 * @description Handles data transfer actions for `paste` and `drop` events.
	 * - It processes clipboard data, triggers relevant events, and inserts cleaned data into the editor.
	 * @param {"paste"|"drop"} type The type of event
	 * @param {Event} e The original event object
	 * @param {DataTransfer} clipboardData The clipboard data object
	 * @param {SunEditor.FrameContext} frameContext The frame context
	 * @returns {Promise<boolean>} Resolves to `false` if processing is complete, otherwise allows default behavior
	 */
	async _dataTransferAction(type, e, clipboardData, frameContext) {
		try {
			this.#ui.showLoading();
			await this.#setClipboardData(type, e, clipboardData, frameContext);
			e.preventDefault();
			e.stopPropagation();
			return false;
		} catch (err) {
			console.warn('[SUNEDITOR.paste.error]', err);
		} finally {
			this.#ui.hideLoading();
		}
	}

	/**
	 * @internal
	 * @description Processes clipboard data for `paste` and `drop` events, handling text and HTML cleanup.
	 * - Supports specific handling for content from Microsoft Office applications.
	 * @param {"paste"|"drop"} type The type of event
	 * @param {Event} e The original event object
	 * @param {DataTransfer} clipboardData The clipboard data object
	 * @param {SunEditor.FrameContext} frameContext The frame context
	 * @returns {Promise<boolean>} Resolves to `false` if processing is complete, otherwise allows default behavior
	 */
	async #setClipboardData(type, e, clipboardData, frameContext) {
		e.preventDefault();
		e.stopPropagation();

		let plainText = clipboardData.getData('text/plain');
		let cleanData = clipboardData.getData('text/html');
		const onlyText = !cleanData;

		// SE copy data
		const SEData = this.__secopy === plainText;
		// MS word, OneNode, Excel
		const MSData = /class=["']*Mso(Normal|List)/i.test(cleanData) || /content=["']*Word.Document/i.test(cleanData) || /content=["']*OneNote.File/i.test(cleanData) || /content=["']*Excel.Sheet/i.test(cleanData);
		// from
		const from = SEData ? 'SE' : MSData ? 'MS' : '';

		if (onlyText) {
			cleanData = converter.htmlToEntity(plainText).replace(/\n/g, '<br>');
		} else {
			cleanData = cleanData.replace(/^<html>\r?\n?<body>\r?\n?\x3C!--StartFragment-->|\x3C!--EndFragment-->\r?\n?<\/body>\r?\n?<\/html>$/g, '');
			if (MSData) {
				cleanData = cleanData.replace(/\n/g, ' ');
				plainText = plainText.replace(/\n/g, ' ');
			}
		}

		if (!SEData) {
			const autoLinkify = this.#options.get('autoLinkify');
			if (autoLinkify) {
				const domParser = new DOMParser().parseFromString(cleanData, 'text/html');
				dom.query.getListChildNodes(domParser.body, converter.textToAnchor, null);
				cleanData = domParser.body.innerHTML;
			}
		}

		if (!onlyText) {
			cleanData = this.$.html.clean(cleanData, { forceFormat: false, whitelist: null, blacklist: null });
		}

		const maxCharCount = this.$.char.test(this.$.frameOptions.get('charCounter_type') === 'byte-html' ? cleanData : plainText, false);
		// user event - paste
		if (type === 'paste') {
			const value = await this.#eventManager.triggerEvent('onPaste', { frameContext, event: e, data: cleanData, maxCharCount, from });
			if (value === false) {
				return false;
			} else if (typeof value === 'string') {
				if (!value) return false;
				cleanData = value;
			}
		}
		// user event - drop
		if (type === 'drop') {
			const value = await this.#eventManager.triggerEvent('onDrop', { frameContext, event: e, data: cleanData, maxCharCount, from });
			if (value === false) {
				return false;
			} else if (typeof value === 'string') {
				if (!value) return false;
				cleanData = value;
			}
		}

		// files
		const files = clipboardData.files;
		if (files.length > 0 && !MSData) {
			for (let i = 0, len = files.length; i < len; i++) {
				await this._callPluginEventAsync('onFilePasteAndDrop', { frameContext, event: e, file: files[i] });
			}

			return false;
		}

		if (!maxCharCount) {
			return false;
		}

		if (cleanData) {
			const domParser = new DOMParser().parseFromString(cleanData, 'text/html');
			if ((await this._callPluginEventAsync('onPaste', { frameContext, event: e, data: cleanData, doc: domParser })) !== false) {
				this.$.html.insert(cleanData, { selectInserted: false, skipCharCount: true, skipCleaning: true });
			}

			// document type
			if (frameContext.has('documentType_use_header')) {
				frameContext.get('documentType').reHeader();
			}
			return false;
		}
	}

	/**
	 * @internal
	 * @description Registers common UI events such as toolbar and menu interactions.
	 * - Adds event listeners for various UI elements, sets up observers, and configures window events.
	 */
	_addCommonEvents() {
		const buttonsHandler = ButtonsHandler.bind(this);
		const toolbarHandler = OnClick_toolbar.bind(this);

		/** menu event */
		this.#eventManager.addEvent(this.#context.get('menuTray'), 'mousedown', buttonsHandler, false);
		this.#eventManager.addEvent(this.#context.get('menuTray'), 'click', OnClick_menuTray.bind(this), true);

		/** toolbar event */
		this.#eventManager.addEvent(this.#context.get('toolbar_main'), 'mousedown', buttonsHandler, false);
		this.#eventManager.addEvent(this.#context.get('toolbar_main'), 'click', toolbarHandler, false);
		// subToolbar
		if (this.#options.has('_subMode')) {
			this.#eventManager.addEvent(this.#context.get('toolbar_sub_main'), 'mousedown', buttonsHandler, false);
			this.#eventManager.addEvent(this.#context.get('toolbar_sub_main'), 'click', toolbarHandler, false);
		}

		/** set response toolbar */
		this.#toolbar._setResponsive();

		/** observer */
		if (env.isResizeObserverSupported) {
			this._toolbarObserver = new ResizeObserver(() => {
				// Defer to avoid ResizeObserver loop limit — layout must settle before recalculating responsive buttons
				_w.setTimeout(() => {
					this.#toolbar.resetResponsiveToolbar();
				}, 0);
			});
			this._wwFrameObserver = new ResizeObserver((entries) => {
				// Defer to avoid ResizeObserver loop limit — measure final height after reflow completes
				_w.setTimeout(() => {
					entries.forEach((e) => {
						this.#ui._emitResizeEvent(this.$.frameRoots.get(e.target.getAttribute('data-root-key')), -1, e);
					});
				}, 0);
			});
		}

		/** modal outside click */
		if (this.#options.get('closeModalOutsideClick')) {
			this.#eventManager.addEvent(
				this.#contextProvider.carrierWrapper.querySelector('.se-modal .se-modal-inner'),
				'click',
				(e) => {
					if (e.target === this.#contextProvider.carrierWrapper.querySelector('.se-modal .se-modal-inner')) {
						this.#ui.offCurrentModal();
					}
				},
				false,
			);
		}

		/** global event */
		this.#eventManager.addEvent(_w, 'resize', this.#OnResize_window.bind(this), false);
		this.#eventManager.addEvent(_w.visualViewport, 'resize', this.#OnResize_viewport.bind(this), false);
		this.#eventManager.addEvent(_w, 'scroll', this.#OnScroll_window.bind(this), false);
		if (isTouchDevice) {
			this.#eventManager.addEvent(_w.visualViewport, 'scroll', this.#OnMobileScroll_viewport.bind(this), false);
		}
	}

	/**
	 * @internal
	 * @description Registers event listeners for the editor's frame, including text `input`, selection, and UI interactions.
	 * - Handles events inside an `iframe` or within the standard wysiwyg editor.
	 * @param {SunEditor.FrameContext} fc The frame context object
	 */
	_addFrameEvents(fc) {
		const isIframe = fc.get('options').get('iframe');
		const eventWysiwyg = isIframe ? fc.get('_ww') : fc.get('wysiwyg');
		fc.set('eventWysiwyg', /** @type {SunEditor.EventWysiwyg} */ (eventWysiwyg));
		const codeArea = fc.get('code');
		const dragCursor = this.#contextProvider.carrierWrapper.querySelector('.se-drag-cursor');

		/** editor area */
		const wwMouseMove = OnMouseMove_wysiwyg.bind(this, fc);
		this.#eventManager.addEvent(eventWysiwyg, 'mousemove', wwMouseMove, false);
		this.#eventManager.addEvent(eventWysiwyg, 'mouseleave', OnMouseLeave_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(eventWysiwyg, 'mousedown', OnMouseDown_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(eventWysiwyg, 'mouseup', OnMouseUp_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(eventWysiwyg, 'click', OnClick_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(eventWysiwyg, 'beforeinput', OnBeforeInput_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(eventWysiwyg, 'input', OnInput_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(eventWysiwyg, 'keydown', OnKeyDown_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(eventWysiwyg, 'keyup', OnKeyUp_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(eventWysiwyg, 'paste', OnPaste_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(eventWysiwyg, 'copy', OnCopy_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(eventWysiwyg, 'cut', OnCut_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(
			eventWysiwyg,
			'dragover',
			OnDragOver_wysiwyg.bind(this, fc, dragCursor, isIframe ? this.$.frameContext.get('topArea') : null, !this.#options.get('toolbar_container') && !this.#store.mode.isBalloon && !this.#store.mode.isInline),
			false,
		);
		this.#eventManager.addEvent(eventWysiwyg, 'dragend', OnDragEnd_wysiwyg.bind(this, dragCursor), false);
		this.#eventManager.addEvent(eventWysiwyg, 'drop', OnDrop_wysiwyg.bind(this, fc, dragCursor), false);
		this.#eventManager.addEvent(eventWysiwyg, 'scroll', this.#OnScroll_wysiwyg.bind(this, fc, eventWysiwyg), { passive: true, capture: false });
		this.#eventManager.addEvent(eventWysiwyg, 'focus', this.#OnFocus_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(eventWysiwyg, 'blur', this.#OnBlur_wysiwyg.bind(this, fc), false);
		this.#eventManager.addEvent(codeArea, 'mousedown', this.#OnFocus_code.bind(this, fc), false);

		/** drag handle */
		const dragHandle = fc.get('wrapper').querySelector('.se-drag-handle');
		this.#eventManager.addEvent(
			dragHandle,
			'wheel',
			(event) => {
				event.preventDefault();
				this.$.component.deselect();
			},
			false,
		);

		/** line breaker */
		this.#eventManager.addEvent(fc.get('lineBreaker_t'), 'pointerdown', this.#DisplayLineBreak.bind(this, 't'), false);
		this.#eventManager.addEvent(fc.get('lineBreaker_b'), 'pointerdown', this.#DisplayLineBreak.bind(this, 'b'), false);

		/** Events are registered mobile. */
		if (isTouchDevice) {
			this.#eventManager.addEvent(eventWysiwyg, 'touchstart', wwMouseMove, {
				passive: true,
				capture: false,
			});
		}

		/** code view area auto line */
		if (!this.#options.get('hasCodeMirror')) {
			const codeNumbers = fc.get('codeNumbers');
			const cvAuthHeight = this.$.viewer._codeViewAutoHeight.bind(this.$.viewer, fc.get('code'), codeNumbers, this.$.frameOptions.get('height') === 'auto');

			this.#eventManager.addEvent(codeArea, 'keydown', cvAuthHeight, false);
			this.#eventManager.addEvent(codeArea, 'keyup', cvAuthHeight, false);
			this.#eventManager.addEvent(codeArea, 'paste', cvAuthHeight, false);

			/** code view numbers */
			if (codeNumbers) this.#eventManager.addEvent(codeArea, 'scroll', this.$.viewer._scrollLineNumbers.bind(codeArea, codeNumbers), false);
		}

		if (fc.has('statusbar')) this.__addStatusbarEvent(fc, fc.get('options'));

		const OnScrollAbs = this.#OnScroll_Abs.bind(this);
		const scrollParents = dom.query.getScrollParents(fc.get('originElement'));
		for (const parent of scrollParents) {
			this.scrollparents.push(parent);
			this.#eventManager.addEvent(parent, 'scroll', OnScrollAbs, false);
		}

		/** focus temp (mobile) */
		this.#eventManager.addEvent(this.__focusTemp, 'focus', (e) => e.preventDefault(), false);

		/** document event */
		if (this.__eventDoc !== fc.get('_wd')) {
			this.__eventDoc = fc.get('_wd');
			this.#eventManager.addEvent(this.__eventDoc, 'selectionchange', this.#OnSelectionchange_document.bind(this, this.__eventDoc), false);
		}
	}

	/**
	 * @internal
	 * @description Adds event listeners for resizing the status bar if resizing is enabled.
	 * - If resizing is not enabled, applies a `se-resizing-none` class.
	 * @param {SunEditor.FrameContext} fc The frame context object
	 * @param {SunEditor.FrameOptions} fo The frame options object
	 */
	__addStatusbarEvent(fc, fo) {
		if (/\d+/.test(fo.get('height')) && fo.get('statusbar_resizeEnable')) {
			fo.set('__statusbarEvent', this.#eventManager.addEvent(fc.get('statusbar'), 'mousedown', this.#OnMouseDown_statusbar.bind(this), false));
		} else {
			dom.utils.addClass(fc.get('statusbar'), 'se-resizing-none');
		}
	}

	/**
	 * @internal
	 * @description Removes all registered event listeners from the editor.
	 * - Disconnects observers and clears stored event references.
	 */
	_removeAllEvents() {
		this.#eventManager._init();

		if (this._wwFrameObserver) {
			this._wwFrameObserver.disconnect();
			this._wwFrameObserver = null;
		}

		if (this._toolbarObserver) {
			this._toolbarObserver.disconnect();
			this._toolbarObserver = null;
		}

		// clear timers
		if (this.#balloonDelay) {
			_w.clearTimeout(this.#balloonDelay);
			this.#balloonDelay = null;
		}

		if (this.__retainTimer) {
			_w.clearTimeout(this.__retainTimer);
			this.__retainTimer = null;
		}

		// remove global events

		this.#selectionSyncEvent &&= this.#eventManager.removeGlobalEvent(this.#selectionSyncEvent);
		this.#resize_editor &&= this.#eventManager.removeGlobalEvent(this.#resize_editor);
		this.#close_move &&= this.#eventManager.removeGlobalEvent(this.#close_move);

		// clear cached references
		this._formatAttrsTemp = null;
		this.__cacheStyleNodes = null;
		this.__inputPlugin = null;
		this.__inputBlurEvent = null;
		this.__inputKeyEvent = null;
		this.__focusTemp = null;
		this.__eventDoc = null;
		this.__secopy = null;
		this._lineBreakComp = null;
		this.scrollparents = null;
	}

	/**
	 * @internal
	 * @description Synchronizes the selection state by resetting it on `mouseup`.
	 * - Ensures selection updates correctly across different interactions.
	 */
	_setSelectionSync() {
		this.#eventManager.removeGlobalEvent(this.#selectionSyncEvent);
		this.#selectionSyncEvent = this.#eventManager.addGlobalEvent('mouseup', () => {
			this.$.selection.init();
			this.#eventManager.removeGlobalEvent(this.#selectionSyncEvent);
		});
	}

	/**
	 * @internal
	 * @description Retains the style nodes for formatting consistency when applying styles.
	 * - Preserves nested styling by cloning and restructuring the style nodes.
	 * @param {HTMLElement} formatEl The format element where styles should be retained
	 * @param {Array<Node>} _styleNodes The list of style nodes to retain
	 */
	_retainStyleNodes(formatEl, _styleNodes) {
		const el = _styleNodes[0].cloneNode(false);
		let n = el;
		for (let i = 1, len = _styleNodes.length, t; i < len; i++) {
			t = _styleNodes[i].cloneNode(false);
			n.appendChild(t);
			n = t;
		}

		const { parent, inner } = this.$.nodeTransform.createNestedNode(_styleNodes, null);
		const zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
		inner.appendChild(zeroWidth);

		formatEl.innerHTML = '';
		formatEl.appendChild(parent);

		this.$.selection.setRange(zeroWidth, 1, zeroWidth, 1);
	}

	/**
	 * @internal
	 * @description Clears retained style nodes by replacing content with a single `line` break.
	 * - Resets the selection to the start of the cleared element.
	 * @param {HTMLElement} formatEl The format element where styles should be cleared
	 */
	_clearRetainStyleNodes(formatEl) {
		formatEl.innerHTML = '<br>';
		this.$.selection.setRange(formatEl, 0, formatEl, 0);
	}

	/**
	 * @internal
	 * @description Calls a registered plugin event synchronously.
	 * @param {string} name The name of the plugin event
	 * @param {SunEditor.EventParams.PluginEvent} e The event payload
	 * @returns {boolean|undefined} Returns `false` if any handler stops the event
	 */
	_callPluginEvent(name, e) {
		return this.$.pluginManager.emitEvent(name, e);
	}

	/**
	 * @internal
	 * @description Calls a registered plugin event asynchronously.
	 * @param {string} name The name of the plugin event
	 * @param {SunEditor.EventParams.PluginEvent} e The event payload
	 * @returns {Promise<boolean|undefined>} Returns `false` if any handler stops the event
	 */
	async _callPluginEventAsync(name, e) {
		return await this.$.pluginManager.emitEventAsync(name, e);
	}

	/**
	 * @internal
	 * @description Removes input event listeners and resets input-related properties.
	 */
	__removeInput() {
		this.#store.set('_preventBlur', false);
		this._inputFocus = false;
		this.__inputBlurEvent = this.#eventManager.removeEvent(this.__inputBlurEvent);
		this.__inputKeyEvent = this.#eventManager.removeEvent(this.__inputKeyEvent);
		this.__inputPlugin = null;
	}

	/**
	 * @internal
	 * @description Focus Event Postprocessing
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 * @param {FocusEvent} event - Focus event object
	 */
	__postFocusEvent(frameContext, event) {
		if (this.#store.mode.isInline || this.#store.mode.isBalloonAlways) this.#toolbar.show();
		if (this.#store.mode.isSubBalloonAlways) this.$.subToolbar.show();

		// user event
		this.#eventManager.triggerEvent('onFocus', { frameContext, event });
		// plugin event
		this._callPluginEvent('onFocus', { frameContext, event });
	}

	/**
	 * @internal
	 * @description Blur Event Postprocessing
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 * @param {FocusEvent} event - Focus event object
	 */
	__postBlurEvent(frameContext, event) {
		if (this.#store.mode.isInline || this.#store.mode.isBalloon) this._hideToolbar();
		if (this.#store.mode.isSubBalloon) this._hideToolbar_sub();

		// user event
		this.#eventManager.triggerEvent('onBlur', { frameContext, event });
		// plugin event
		this._callPluginEvent('onBlur', { frameContext, event });
	}

	/**
	 * @internal
	 * @description Records the current viewport size.
	 */
	__setViewportSize() {
		this.#store.set('currentViewportHeight', numbers.get(_w.visualViewport.height, 0));
	}

	/**
	 * @description Handles the scrolling of the editor container.
	 * - Repositions open controllers if necessary.
	 */
	#scrollContainer() {
		if (this.#menu.currentDropdownActiveButton && this.#menu.currentDropdown) {
			this.#menu.__resetMenuPosition(this.#menu.currentDropdownActiveButton, this.#menu.currentDropdown);
		}

		this.#ui._repositionControllers();
	}

	/**
	 * @description Resets the frame status, adjusting toolbar and UI elements based on the current state.
	 * - Handles `inline` editor adjustments, fullscreen mode, and responsive toolbar updates.
	 */
	#resetFrameStatus() {
		if (!env.isResizeObserverSupported) {
			this.#toolbar.resetResponsiveToolbar();
			if (this.#options.get('_subMode')) this.$.subToolbar.resetResponsiveToolbar();
		}

		const toolbar = this.#context.get('toolbar_main');
		const isToolbarHidden = toolbar.style.display === 'none' || (this.#store.mode.isInline && !this.#toolbar.inlineToolbarAttr.isShow);
		if (toolbar.offsetWidth === 0 && !isToolbarHidden) return;

		const opendBrowser = this.#ui.opendBrowser;
		if (opendBrowser && opendBrowser.area.style.display === 'block') {
			opendBrowser.body.style.maxHeight = dom.utils.getClientSize().h - opendBrowser.header.offsetHeight - 50 + 'px';
		}

		if (this.#menu.currentDropdownActiveButton && this.#menu.currentDropdown) {
			this.#menu.__resetMenuPosition(this.#menu.currentDropdownActiveButton, this.#menu.currentDropdown);
		}

		if (this.$.viewer._resetFullScreenHeight()) return;

		const fc = this.$.frameContext;
		if (fc.get('isCodeView') && this.#store.mode.isInline) {
			this.#toolbar._showInline();
			return;
		}

		this.#ui._iframeAutoHeight(fc);

		if (this.#toolbar.isSticky) {
			this.#context.get('toolbar_main').style.width = fc.get('topArea').offsetWidth - 2 + 'px';
			this.#toolbar._resetSticky();
		}
	}

	/**
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 * @param {SunEditor.EventWysiwyg} eventWysiwyg - wysiwyg event object
	 * @param {Event} e - Event object
	 */
	#OnScroll_wysiwyg(frameContext, eventWysiwyg, e) {
		this.#ui._syncScrollPosition(eventWysiwyg);
		this.#scrollContainer();

		// plugin event
		this._callPluginEvent('onScroll', { frameContext, event: e });

		// document type page
		if (frameContext.has('documentType_use_page')) {
			frameContext.get('documentType').scrollPage();
		}

		// user event
		this.#eventManager.triggerEvent('onScroll', { frameContext, event: e });
	}

	/**
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 * @param {FocusEvent} e - Focus event object
	 */
	#OnFocus_wysiwyg(frameContext, e) {
		if (this.$.selection.__iframeFocus || frameContext.get('isReadOnly') || frameContext.get('isDisabled')) {
			e.preventDefault();
			return false;
		}

		this.#store.set('hasFocus', true);
		this.$.component.__prevent = false;
		this.#eventManager.triggerEvent('onNativeFocus', { frameContext, event: e });

		const rootKey = frameContext.get('key');

		if (this._inputFocus) {
			if (this.#store.mode.isInline) {
				// Defer inline toolbar show — browser focus event fires before selection is finalized
				_w.setTimeout(() => {
					this.#toolbar._showInline();
				}, 0);
			}
			return;
		}

		if ((this.#store.get('rootKey') === rootKey && this.#store.get('_preventBlur')) || this.#store.get('_preventFocus')) return;
		this.#store.set('_preventFocus', true);

		dom.utils.removeClass(this.$.commandDispatcher.targets.get('codeView'), 'active');
		this.#ui._toggleCodeViewButtons(false);

		this.$.facade.changeFrameContext(rootKey);
		this.$.history.resetButtons(rootKey, null);

		// Defer focus event emission — allow blur handler on the previous frame to complete first
		_w.setTimeout(() => {
			this.__postFocusEvent(frameContext, e);
		}, 0);
	}

	/**
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 * @param {FocusEvent} e - Focus event object
	 */
	#OnBlur_wysiwyg(frameContext, e) {
		if (frameContext.get('isCodeView') || frameContext.get('isReadOnly') || frameContext.get('isDisabled')) return;

		this.#store.set('hasFocus', false);
		this.#store.set('_lastSelectionNode', null);
		this.#eventManager.triggerEvent('onNativeBlur', { frameContext, event: e });

		if (this._inputFocus || this.#store.get('_preventBlur')) return;
		this.#store.set('_preventFocus', false);

		this.selectionState.reset();

		this.#store.set('currentNodes', []);
		this.#store.set('currentNodesMap', []);

		this.#ui.offCurrentController();

		this.#contextProvider.applyToRoots((root) => {
			if (root.get('navigation')) root.get('navigation').textContent = '';
		});

		this.$.history.check(frameContext.get('key'), this.#store.get('_range'));

		this.__postBlurEvent(frameContext, e);
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnMouseDown_statusbar(e) {
		e.stopPropagation();
		this._resizeClientY = e.clientY;
		this.#ui.enableBackWrapper('ns-resize');
		this.#resize_editor = this.#eventManager.addGlobalEvent('mousemove', this.#__resizeEditor.bind(this));
		this.#close_move = this.#eventManager.addGlobalEvent('mouseup', this.#__closeMove.bind(this));
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#__resizeEditor(e) {
		const fc = this.$.frameContext;
		const resizeInterval = fc.get('wrapper').offsetHeight + (e.clientY - this._resizeClientY);
		const h = resizeInterval < fc.get('_minHeight') ? fc.get('_minHeight') : resizeInterval;
		fc.get('wysiwygFrame').style.height = fc.get('code').style.height = h + 'px';
		this._resizeClientY = e.clientY;
		if (!env.isResizeObserverSupported) this.#ui._emitResizeEvent(fc, h, null);
	}

	#__closeMove() {
		this.#ui.disableBackWrapper();
		this.#resize_editor &&= this.#eventManager.removeGlobalEvent(this.#resize_editor);
		this.#close_move &&= this.#eventManager.removeGlobalEvent(this.#close_move);
	}

	/**
	 * @param {"t"|"b"} dir - Direction
	 * @param {PointerEvent} e - Pointer event object
	 */
	#DisplayLineBreak(dir, e) {
		e.preventDefault();

		const component = this._lineBreakComp;
		if (!component) return;

		const isList = dom.check.isListCell(component.parentElement);
		const format = dom.utils.createElement(isList ? 'BR' : dom.check.isTableCell(component.parentElement) ? 'DIV' : this.#options.get('defaultLine'));
		if (!isList) format.innerHTML = '<br>';

		if (this.$.frameOptions.get('charCounter_type') === 'byte-html' && !this.$.char.check(format.outerHTML)) return;

		component.parentNode.insertBefore(format, dir === 't' ? component : component.nextSibling);
		this.$.component.deselect();

		try {
			const focusEl = isList ? format : format.firstChild;
			this.$.selection.setRange(focusEl, 1, focusEl, 1);
			this.$.history.push(false);
		} catch (err) {
			console.warn('[SUNEDITOR.lineBreaker.error]', err);
		}
	}

	#OnResize_window() {
		this.#store.set('initViewportHeight', _w.visualViewport.height);

		if (!isMobile) {
			this.#ui.offCurrentController();
		}

		if (this.#store.mode.isBalloon) this.#toolbar.hide();
		else if (this.#store.mode.isSubBalloon) this.$.subToolbar.hide();

		this.#resetFrameStatus();
	}

	#OnResize_viewport() {
		if (isMobile && this.#options.get('toolbar_sticky') > -1) {
			this.#toolbar._resetSticky();
			this.#menu.__restoreMenuPosition();
		}

		this.#scrollContainer();
		this.__setViewportSize();
	}

	#OnScroll_window() {
		if (this.#options.get('toolbar_sticky') > -1) {
			this.#toolbar._resetSticky();
		}

		if (this.#store.mode.isBalloon && this.#context.get('toolbar_main').style.display === 'block') {
			this.#toolbar._setBalloonOffset(this.#toolbar.balloonOffset.position === 'top');
		} else if (this.#store.mode.isSubBalloon && this.#context.get('toolbar_sub_main').style.display === 'block') {
			this.$.subToolbar._setBalloonOffset(this.$.subToolbar.balloonOffset.position === 'top');
		}

		this.#scrollContainer();

		// document type page
		if (this.$.frameContext.has('documentType_use_page')) {
			this.$.frameContext.get('documentType').scrollWindow();
		}
	}

	#OnMobileScroll_viewport() {
		if (this.#options.get('toolbar_sticky') > -1) {
			this.#toolbar._resetSticky();
			this.#menu.__restoreMenuPosition();
		}
	}

	/**
	 * @param {Document} _wd - Wysiwyg document
	 */
	#OnSelectionchange_document(_wd) {
		const selection = _wd.getSelection();
		let anchorNode = selection.anchorNode;

		this.#contextProvider.applyToRoots((root) => {
			if (anchorNode && root.get('wysiwyg').contains(anchorNode)) {
				if (root.get('isReadOnly') || root.get('isDisabled')) return;

				anchorNode = null;
				this.$.selection.init();
				this.applyTagEffect();

				// document type
				if (root.has('documentType_use_header')) {
					const el = dom.query.getParentElement(this.$.selection.selectionNode, this.$.format.isLine.bind(this.$.format));
					root.get('documentType').on(el);
				}
			}
		});
	}

	#OnScroll_Abs() {
		this.#menu.dropdownOff();
		this.#scrollContainer();
	}

	/**
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 */
	#OnFocus_code(frameContext) {
		this.$.facade.changeFrameContext(frameContext.get('key'));
		dom.utils.addClass(this.$.commandDispatcher.targets.get('codeView'), 'active');
		this.#ui._toggleCodeViewButtons(true);
	}
}

export default EventOrchestrator;
