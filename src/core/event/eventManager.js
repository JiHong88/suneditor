/**
 * @fileoverview eventManager class
 */

import CoreInjector from '../../editorInjector/_core';
import { dom, unicode, numbers, env, converter } from '../../helper';
import { _DragHandle } from '../../modules/utils';

// event handlers
import { ButtonsHandler, OnClick_menuTray, OnClick_toolbar } from './handlers/handler_toolbar';
import { OnMouseDown_wysiwyg, OnMouseUp_wysiwyg, OnClick_wysiwyg, OnMouseMove_wysiwyg, OnMouseLeave_wysiwyg } from './handlers/handler_ww_mouse';
import { OnBeforeInput_wysiwyg, OnInput_wysiwyg } from './handlers/handler_ww_input';
import { OnKeyDown_wysiwyg, OnKeyUp_wysiwyg } from './handlers/handler_ww_key';
import { OnPaste_wysiwyg, OnCopy_wysiwyg, OnCut_wysiwyg } from './handlers/handler_ww_clipboard';
import { OnDragOver_wysiwyg, OnDragEnd_wysiwyg, OnDrop_wysiwyg } from './handlers/handler_ww_dragDrop';

const { _w, _d, isMobile, isTouchDevice } = env;

/**
 * @typedef {Omit<EventManager & Partial<SunEditor.Injector>, 'eventManager'>} EventManagerThis
 */

/**
 * @constructor
 * @this {EventManagerThis}
 * @description Event manager, editor's all event management class
 * @param {SunEditor.Core} editor - The root editor instance
 * @property {SunEditor.Core} editor - The root editor instance
 */
function EventManager(editor) {
	CoreInjector.call(this, editor);

	/**
	 * @description Old browsers: When there is no 'e.isComposing' in the keyup event
	 * @type {boolean}
	 */
	this.isComposing = false;

	/**
	 * @description An array of parent containers that can be scrolled (in descending order)
	 * @type {Array<Element>}
	 */
	this.scrollparents = [];

	/** @type {Array<*>} */
	this._events = [];
	/** @type {RegExp} */
	this._onButtonsCheck = new RegExp(`^(${Object.keys(editor.options.get('_defaultStyleTagMap')).join('|')})$`, 'i');
	/** @type {boolean} */
	this._onShortcutKey = false;
	/** @type {boolean} */
	this._handledInBefore = false;
	/** @type {number} */
	this._balloonDelay = null;
	/** @type {ResizeObserver} */
	this._wwFrameObserver = null;
	/** @type {ResizeObserver} */
	this._toolbarObserver = null;
	/** @type {?Element} */
	this._lineBreakComp = null;
	/** @type {?Object<string, *>} */
	this._formatAttrsTemp = null;
	/** @type {number} */
	this._resizeClientY = 0;
	/** @type {?SunEditor.Event.GlobalInfo} */
	this.__resize_editor = null;
	/** @type {?SunEditor.Event.GlobalInfo} */
	this.__close_move = null;
	/** @type {?SunEditor.Event.GlobalInfo} */
	this.__geckoActiveEvent = null;
	/** @type {Array<Node>} */
	this.__cacheStyleNodes = [];
	/** @type {?SunEditor.Event.GlobalInfo} */
	this.__selectionSyncEvent = null;

	// input plugins
	/** @type {boolean} */
	this._inputFocus = false;
	/** @type {?Object<string, *>} */
	this.__inputPlugin = null;
	/** @type {?SunEditor.Event.Info=} */
	this.__inputBlurEvent = null;
	/** @type {?SunEditor.Event.Info=} */
	this.__inputKeyEvent = null;

	// viewport
	/** @type {HTMLInputElement} */
	this.__focusTemp = this.carrierWrapper.querySelector('.__se__focus__temp__');
	/** @type {number|void} */
	this.__retainTimer = null;
	/** @type {Element} */
	this.__eventDoc = null;
	/** @type {string} */
	this.__secopy = null;
}

EventManager.prototype = {
	/**
	 * @this {EventManagerThis}
	 * @description Register for an event.
	 * - Only events registered with this method are unregistered or re-registered when methods such as 'setOptions', 'destroy' are called.
	 * @param {*} target Target element
	 * @param {string} type Event type
	 * @param {(...args: *) => *} listener Event handler
	 * @param {boolean|AddEventListenerOptions} [useCapture] Event useCapture option
	 * @return {?SunEditor.Event.Info} Registered event information
	 */
	addEvent(target, type, listener, useCapture) {
		if (!target) return null;
		if (target === _w || target === _d || typeof target.length !== 'number' || target.nodeType || (!Array.isArray(target) && target.length < 1)) target = [target];
		if (target.length === 0) return null;

		const len = target.length;
		for (let i = 0; i < len; i++) {
			target[i].addEventListener(type, listener, useCapture);
			this._events.push({
				target: target[i],
				type,
				listener,
				useCapture,
			});
		}

		return {
			target: len > 1 ? target : target[0],
			type,
			listener,
			useCapture,
		};
	},

	/**
	 * @this {EventManagerThis}
	 * @description Remove event
	 * @param {SunEditor.Event.Info} params event info = this.addEvent()
	 * @returns {undefined|null} Success: null, Not found: undefined
	 */
	removeEvent(params) {
		if (!params) return;

		let target = params.target;
		const type = params.type;
		const listener = params.listener;
		const useCapture = params.useCapture;

		if (!target) return;
		if (!numbers.is(target.length) || target.nodeName || (!Array.isArray(target) && target.length < 1)) target = /** @type {Array<Element>} */ ([target]);
		if (target.length === 0) return;

		for (let i = 0, len = target.length; i < len; i++) {
			target[i].removeEventListener(type, listener, useCapture);
		}

		return null;
	},

	/**
	 * @this {EventManagerThis}
	 * @description Add an event to document.
	 * - When created as an Iframe, the same event is added to the document in the Iframe.
	 * @param {string} type Event type
	 * @param {(...args: *) => *} listener Event listener
	 * @param {boolean|AddEventListenerOptions} [useCapture] Use event capture
	 * @return {SunEditor.Event.GlobalInfo} Registered event information
	 */
	addGlobalEvent(type, listener, useCapture) {
		if (this.frameOptions.get('iframe')) {
			this.frameContext.get('_ww').addEventListener(type, listener, useCapture);
		}
		_w.addEventListener(type, listener, useCapture);
		return {
			type,
			listener,
			useCapture,
		};
	},

	/**
	 * @this {EventManagerThis}
	 * @description Remove events from document.
	 * - When created as an Iframe, the event of the document inside the Iframe is also removed.
	 * @param {string|SunEditor.Event.GlobalInfo} type Event type or (Event info = this.addGlobalEvent())
	 * @param {(...args: *) => *} [listener] Event listener
	 * @param {boolean|AddEventListenerOptions} [useCapture] Use event capture
	 * @returns {undefined|null} Success: null, Not found: undefined
	 */
	removeGlobalEvent(type, listener, useCapture) {
		if (!type) return;

		if (typeof type === 'object') {
			listener = type.listener;
			useCapture = type.useCapture;
			type = type.type;
		}
		if (this.frameOptions.get('iframe')) {
			this.frameContext.get('_ww').removeEventListener(type, listener, useCapture);
		}
		_w.removeEventListener(type, listener, useCapture);

		return null;
	},

	/**
	 * @this {EventManagerThis}
	 * @description Activates the corresponding button with the tags information of the current cursor position,
	 * - such as 'bold', 'underline', etc., and executes the 'active' method of the plugins.
	 * @param {?Node} [selectionNode] selectionNode
	 * @returns {Node|undefined} selectionNode
	 */
	applyTagEffect(selectionNode) {
		selectionNode ||= this.selection.getNode();
		if (selectionNode === this.editor.effectNode) return;
		this.editor.effectNode = selectionNode;

		const marginDir = this.options.get('_rtl') ? 'marginRight' : 'marginLeft';
		const plugins = this.plugins;
		const commandTargets = this.editor.commandTargets;
		const classOnCheck = this._onButtonsCheck;
		const styleCommand = this.options.get('_styleCommandMap');
		const commandMapNodes = [];
		const currentNodes = [];

		const styleTags = this.options.get('_textStyleTags');
		const styleNodes = [];

		const ignoreCommands = [];
		const activeCommands = this.editor.activeCommands;
		const cLen = activeCommands.length;
		let nodeName = '';

		if (this.component.is(selectionNode) && !this.component.__selectionSelected) {
			const component = this.component.get(selectionNode);
			if (!component) return;
			this.editor.effectNode = null;
			this.component.select(component.target, component.pluginName);
			return;
		}

		while (selectionNode.firstChild) {
			selectionNode = selectionNode.firstChild;
		}

		const fc = this.frameContext;
		const notReadonly = !fc.get('isReadOnly');
		for (let element = selectionNode; !dom.check.isWysiwygFrame(element); element = element.parentElement) {
			if (!element) break;
			if (element.nodeType !== 1 || dom.check.isBreak(element)) continue;
			if (this._isNonFocusNode(element)) {
				this.editor.blur();
				return;
			}

			nodeName = element.nodeName.toLowerCase();
			currentNodes.push(nodeName);
			if (styleTags.includes(nodeName) && !this.format.isLine(nodeName)) styleNodes.push(element);

			/* Active plugins */
			if (notReadonly) {
				for (let c = 0, name; c < cLen; c++) {
					name = activeCommands[c];
					if (
						!commandMapNodes.includes(name) &&
						!ignoreCommands.includes(name) &&
						commandTargets.get(name) &&
						commandTargets.get(name).filter((e) => {
							const r = plugins[name]?.active(element, e);
							if (r === undefined) {
								ignoreCommands.push(name);
							}
							return r;
						}).length > 0
					) {
						commandMapNodes.push(name);
					}
				}
			}

			/** indent, outdent */
			if (this.format.isLine(element)) {
				/* Outdent */
				if (!commandMapNodes.includes('outdent') && commandTargets.has('outdent') && (dom.check.isListCell(element) || (element.style[marginDir] && numbers.get(element.style[marginDir], 0) > 0))) {
					if (
						commandTargets.get('outdent').filter((e) => {
							if (dom.check.isImportantDisabled(e)) return false;
							e.disabled = false;
							return true;
						}).length > 0
					) {
						commandMapNodes.push('outdent');
					}
				}
				/* Indent */
				if (!commandMapNodes.includes('indent') && commandTargets.has('indent')) {
					const indentDisable = dom.check.isListCell(element) && !element.previousElementSibling;
					if (
						commandTargets.get('indent').filter((e) => {
							if (dom.check.isImportantDisabled(e)) return false;
							e.disabled = indentDisable;
							return true;
						}).length > 0
					) {
						commandMapNodes.push('indent');
					}
				}

				continue;
			}

			/** default active buttons [strong, ins, em, del, sub, sup] */
			if (classOnCheck.test(nodeName)) {
				nodeName = styleCommand[nodeName] || nodeName;
				commandMapNodes.push(nodeName);
				dom.utils.addClass(commandTargets.get(nodeName), 'active');
			}
		}

		this._setKeyEffect(commandMapNodes);

		// cache style nodes
		this.__cacheStyleNodes = styleNodes.reverse();

		/** save current nodes */
		this.status.currentNodes = currentNodes.reverse();
		this.status.currentNodesMap = commandMapNodes;

		/**  Displays the current node structure to statusbar */
		if (this.frameOptions.get('statusbar_showPathLabel') && fc.get('navigation')) {
			fc.get('navigation').textContent = this.options.get('_rtl') ? this.status.currentNodes.reverse().join(' < ') : this.status.currentNodes.join(' > ');
		}

		return selectionNode;
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Gives an active effect when the mouse down event is blocked. (Used when "env.isGecko" is true)
	 * @param {Node} target Target element
	 */
	_injectActiveEvent(target) {
		dom.utils.addClass(target, '__se__active');
		this.__geckoActiveEvent = this.addGlobalEvent('mouseup', () => {
			dom.utils.removeClass(target, '__se__active');
			this.__geckoActiveEvent = this.removeGlobalEvent(this.__geckoActiveEvent);
		});
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description remove class, display text.
	 * @param {Array<string>} ignoredList Igonred button list
	 */
	_setKeyEffect(ignoredList) {
		const activeCommands = this.editor.activeCommands;
		const commandTargets = this.editor.commandTargets;
		const plugins = this.plugins;
		for (let i = 0, len = activeCommands.length, k, c, p; i < len; i++) {
			k = activeCommands[i];
			if (ignoredList.includes(k) || !(c = commandTargets.get(k))) continue;

			p = plugins[k];
			for (let j = 0, jLen = c.length, e; j < jLen; j++) {
				e = c[j];
				if (!e) continue;
				if (p) {
					p.active(null, e);
				} else if (/^outdent$/i.test(k)) {
					if (!dom.check.isImportantDisabled(e)) e.disabled = true;
				} else if (/^indent$/i.test(k)) {
					if (!dom.check.isImportantDisabled(e)) e.disabled = false;
				} else {
					dom.utils.removeClass(e, 'active');
				}
			}
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Show toolbar-balloon with delay.
	 */
	_showToolbarBalloonDelay() {
		if (this._balloonDelay) {
			_w.clearTimeout(this._balloonDelay);
		}

		this._balloonDelay = _w.setTimeout(() => {
			_w.clearTimeout(this._balloonDelay);
			this._balloonDelay = null;
			if (this.editor.isSubBalloon) this.subToolbar._showBalloon();
			else this.toolbar._showBalloon();
		}, 250);
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Show or hide the toolbar-balloon.
	 */
	_toggleToolbarBalloon() {
		this.selection._init();
		const range = this.selection.getRange();
		const hasSubMode = this.options.has('_subMode');

		if (!(hasSubMode ? this.editor.isSubBalloonAlways : this.editor.isBalloonAlways) && range.collapsed) {
			if (hasSubMode) this._hideToolbar_sub();
			else this._hideToolbar();
		} else {
			if (hasSubMode) this.subToolbar._showBalloon(range);
			else this.toolbar._showBalloon(range);
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Hide the toolbar.
	 */
	_hideToolbar() {
		if (!this.editor._notHideToolbar && !this.frameContext.get('isFullScreen')) {
			this.toolbar.hide();
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Hide the Sub-Toolbar.
	 */
	_hideToolbar_sub() {
		if (this.subToolbar && !this.editor._notHideToolbar) {
			this.subToolbar.hide();
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Checks if a node is a non-focusable element(.data-se-non-focus). (e.g. fileUpload.component > span)
	 * @param {Node} node Node to check
	 * @returns {boolean} True if the node is non-focusable, otherwise false
	 */
	_isNonFocusNode(node) {
		return dom.check.isElement(node) && node.getAttribute('data-se-non-focus') === 'true';
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description If there is no default format, add a line and move 'selection'.
	 * @param {?string} formatName Format tag name (default: 'P')
	 */
	_setDefaultLine(formatName) {
		if (!this.options.get('__lineFormatFilter')) return null;
		if (this.editor._fileManager.pluginRegExp.test(this.editor.currentControllerName)) return;

		const range = this.selection.getRange();
		const commonCon = /** @type {HTMLElement} */ (range.commonAncestorContainer);
		const startCon = range.startContainer;
		const endOffset = range.endOffset;
		const rangeEl = this.format.getBlock(commonCon, null);

		/** @type {Node} */
		let focusNode;
		let offset, format;

		if (rangeEl) {
			format = dom.utils.createElement(formatName || this.options.get('defaultLine'));
			format.innerHTML = rangeEl.innerHTML;
			if (format.childNodes.length === 0) format.innerHTML = unicode.zeroWidthSpace;

			rangeEl.innerHTML = format.outerHTML;
			format = rangeEl.firstChild;
			focusNode = format.childNodes[endOffset] || dom.query.getEdgeChildNodes(format, null).sc;

			if (!focusNode) {
				focusNode = dom.utils.createTextNode(unicode.zeroWidthSpace);
				format.insertBefore(focusNode, format.firstChild);
			}

			offset = focusNode.textContent.length;
			this.selection.setRange(focusNode, offset, focusNode, offset);
			return;
		}

		if (commonCon.nodeType === 3 && this.component.is(commonCon.parentElement)) {
			const compInfo = this.component.get(commonCon.parentElement);
			if (!compInfo) return;

			const container = compInfo.container;

			if (commonCon.parentElement === container) {
				const siblingEl = commonCon.nextElementSibling ? container : container.nextElementSibling;
				const el = dom.utils.createElement(this.options.get('defaultLine'), null, commonCon);
				container.parentElement.insertBefore(el, siblingEl);
				this.editor.focusEdge(el);
				return;
			}

			this.component.select(compInfo.target, compInfo.pluginName);
			return null;
		} else if (commonCon.nodeType === 1 && commonCon.getAttribute('data-se-embed') === 'true') {
			let el = commonCon.nextElementSibling;
			if (!this.format.isLine(el)) el = this.format.addLine(commonCon, this.options.get('defaultLine'));
			this.selection.setRange(el.firstChild, 0, el.firstChild, 0);
			return;
		}

		if ((this.format.isBlock(startCon) || dom.check.isWysiwygFrame(startCon)) && (this.component.is(startCon.children[range.startOffset]) || this.component.is(startCon.children[range.startOffset - 1]))) return;
		if (dom.query.getParentElement(commonCon, dom.check.isExcludeFormat)) return null;

		if (this.format.isBlock(commonCon) && commonCon.childNodes.length <= 1) {
			let br = null;
			if (commonCon.childNodes.length === 1 && dom.check.isBreak(commonCon.firstChild)) {
				br = commonCon.firstChild;
			} else {
				br = dom.utils.createTextNode(unicode.zeroWidthSpace);
				commonCon.appendChild(br);
			}

			this.selection.setRange(br, 1, br, 1);
			return;
		}

		try {
			if (commonCon.nodeType === 3) {
				format = dom.utils.createElement(formatName || this.options.get('defaultLine'));
				commonCon.parentNode.insertBefore(format, commonCon);
				format.appendChild(commonCon);
			}

			if (dom.check.isBreak(format.nextSibling)) dom.utils.removeItem(format.nextSibling);
			if (dom.check.isBreak(format.previousSibling)) dom.utils.removeItem(format.previousSibling);
			if (dom.check.isBreak(focusNode)) {
				const zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
				focusNode.parentNode.insertBefore(zeroWidth, focusNode);
				focusNode = zeroWidth;
			}
		} catch {
			this.editor.execCommand('formatBlock', false, formatName || this.options.get('defaultLine'));
			this.editor.effectNode = null;
			this.selection._init();
			return;
		}

		if (format) {
			if (dom.check.isBreak(format.nextSibling)) dom.utils.removeItem(format.nextSibling);
			if (dom.check.isBreak(format.previousSibling)) dom.utils.removeItem(format.previousSibling);
			if (dom.check.isBreak(focusNode)) {
				const zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
				focusNode.parentNode.insertBefore(zeroWidth, focusNode);
				focusNode = zeroWidth;
			}
		}

		this.editor.effectNode = null;
		if (startCon) {
			this.selection.setRange(startCon, 1, startCon, 1);
		} else {
			this.editor._nativeFocus();
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Handles data transfer actions for paste and drop events.
	 * - It processes clipboard data, triggers relevant events, and inserts cleaned data into the editor.
	 * @param {"paste"|"drop"} type The type of event
	 * @param {Event} e The original event object
	 * @param {DataTransfer} clipboardData The clipboard data object
	 * @param {SunEditor.FrameContext} frameContext The frame context
	 * @returns {Promise<boolean>} Resolves to `false` if processing is complete, otherwise allows default behavior
	 */
	async _dataTransferAction(type, e, clipboardData, frameContext) {
		try {
			this.ui.showLoading();
			await this._setClipboardData(type, e, clipboardData, frameContext);
			e.preventDefault();
			e.stopPropagation();
			return false;
		} catch (err) {
			console.warn('[SUNEDITOR.paste.error]', err);
		} finally {
			this.ui.hideLoading();
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Processes clipboard data for paste and drop events, handling text and HTML cleanup.
	 * - Supports specific handling for content from Microsoft Office applications.
	 * @param {"paste"|"drop"} type The type of event
	 * @param {Event} e The original event object
	 * @param {DataTransfer} clipboardData The clipboard data object
	 * @param {SunEditor.FrameContext} frameContext The frame context
	 * @returns {Promise<boolean>} Resolves to `false` if processing is complete, otherwise allows default behavior
	 */
	async _setClipboardData(type, e, clipboardData, frameContext) {
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
			const autoLinkify = this.options.get('autoLinkify');
			if (autoLinkify) {
				const domParser = new DOMParser().parseFromString(cleanData, 'text/html');
				dom.query.getListChildNodes(domParser.body, converter.textToAnchor, null);
				cleanData = domParser.body.innerHTML;
			}
		}

		if (!onlyText) {
			cleanData = this.html.clean(cleanData, { forceFormat: false, whitelist: null, blacklist: null });
		}

		const maxCharCount = this.char.test(this.frameOptions.get('charCounter_type') === 'byte-html' ? cleanData : plainText, false);
		// user event - paste
		if (type === 'paste') {
			const value = await this.triggerEvent('onPaste', { frameContext, event: e, data: cleanData, maxCharCount, from });
			if (value === false) {
				return false;
			} else if (typeof value === 'string') {
				if (!value) return false;
				cleanData = value;
			}
		}
		// user event - drop
		if (type === 'drop') {
			const value = await this.triggerEvent('onDrop', { frameContext, event: e, data: cleanData, maxCharCount, from });
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
				this.html.insert(cleanData, { selectInserted: false, skipCharCount: true, skipCleaning: true });
			}

			// document type
			if (frameContext.has('documentType_use_header')) {
				frameContext.get('documentType').reHeader();
			}
			return false;
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Registers common UI events such as toolbar and menu interactions.
	 * - Adds event listeners for various UI elements, sets up observers, and configures window events.
	 */
	_addCommonEvents() {
		const buttonsHandler = ButtonsHandler.bind(this);
		const toolbarHandler = OnClick_toolbar.bind(this);

		/** menu event */
		this.addEvent(this.context.get('menuTray'), 'mousedown', buttonsHandler, false);
		this.addEvent(this.context.get('menuTray'), 'click', OnClick_menuTray.bind(this), true);

		/** toolbar event */
		this.addEvent(this.context.get('toolbar_main'), 'mousedown', buttonsHandler, false);
		this.addEvent(this.context.get('toolbar_main'), 'click', toolbarHandler, false);
		// subToolbar
		if (this.options.has('_subMode')) {
			this.addEvent(this.context.get('toolbar_sub_main'), 'mousedown', buttonsHandler, false);
			this.addEvent(this.context.get('toolbar_sub_main'), 'click', toolbarHandler, false);
		}

		/** set response toolbar */
		this.toolbar._setResponsive();

		/** observer */
		if (env.isResizeObserverSupported) {
			this._toolbarObserver = new ResizeObserver(() => {
				_w.setTimeout(() => {
					this.toolbar.resetResponsiveToolbar();
				}, 0);
			});
			this._wwFrameObserver = new ResizeObserver((entries) => {
				_w.setTimeout(() => {
					entries.forEach((e) => {
						this.editor.__callResizeFunction(this.frameRoots.get(e.target.getAttribute('data-root-key')), -1, e);
					});
				}, 0);
			});
		}

		/** modal outside click */
		if (this.options.get('closeModalOutsideClick')) {
			this.addEvent(
				this.carrierWrapper.querySelector('.se-modal .se-modal-inner'),
				'click',
				(e) => {
					if (e.target === this.carrierWrapper.querySelector('.se-modal .se-modal-inner')) {
						this.ui._offCurrentModal();
					}
				},
				false,
			);
		}

		/** global event */
		this.addEvent(_w, 'resize', OnResize_window.bind(this), false);
		this.addEvent(_w.visualViewport, 'resize', OnResize_viewport.bind(this), false);
		this.addEvent(_w, 'scroll', OnScroll_window.bind(this), false);
		if (isTouchDevice) {
			this.addEvent(_w.visualViewport, 'scroll', OnMobileScroll_viewport.bind(this), false);
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Registers event listeners for the editor's frame, including text input, selection, and UI interactions.
	 * - Handles events inside an iframe or within the standard wysiwyg editor.
	 * @param {SunEditor.FrameContext} fc The frame context object
	 */
	_addFrameEvents(fc) {
		const isIframe = fc.get('options').get('iframe');
		const eventWysiwyg = isIframe ? fc.get('_ww') : fc.get('wysiwyg');
		fc.set('eventWysiwyg', eventWysiwyg);
		const codeArea = fc.get('code');
		const dragCursor = this.editor.carrierWrapper.querySelector('.se-drag-cursor');

		/** editor area */
		const wwMouseMove = OnMouseMove_wysiwyg.bind(this, fc);
		this.addEvent(eventWysiwyg, 'mousemove', wwMouseMove, false);
		this.addEvent(eventWysiwyg, 'mouseleave', OnMouseLeave_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'mousedown', OnMouseDown_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'mouseup', OnMouseUp_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'click', OnClick_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'beforeinput', OnBeforeInput_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'input', OnInput_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'keydown', OnKeyDown_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'keyup', OnKeyUp_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'paste', OnPaste_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'copy', OnCopy_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'cut', OnCut_wysiwyg.bind(this, fc), false);
		this.addEvent(
			eventWysiwyg,
			'dragover',
			OnDragOver_wysiwyg.bind(this, fc, dragCursor, isIframe ? this.frameContext.get('topArea') : null, !this.options.get('toolbar_container') && !this.editor.isBalloon && !this.editor.isInline),
			false,
		);
		this.addEvent(eventWysiwyg, 'dragend', OnDragEnd_wysiwyg.bind(this, dragCursor), false);
		this.addEvent(eventWysiwyg, 'drop', OnDrop_wysiwyg.bind(this, fc, dragCursor), false);
		this.addEvent(eventWysiwyg, 'scroll', OnScroll_wysiwyg.bind(this, fc, eventWysiwyg), { passive: true, capture: false });
		this.addEvent(eventWysiwyg, 'focus', OnFocus_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'blur', OnBlur_wysiwyg.bind(this, fc), false);
		this.addEvent(codeArea, 'mousedown', OnFocus_code.bind(this, fc), false);

		/** drag handle */
		const dragHandle = fc.get('wrapper').querySelector('.se-drag-handle');
		this.addEvent(
			dragHandle,
			'wheel',
			(event) => {
				event.preventDefault();
				this.component.deselect();
			},
			false,
		);

		/** line breaker */
		this.addEvent(fc.get('lineBreaker_t'), 'pointerdown', DisplayLineBreak.bind(this, 't'), false);
		this.addEvent(fc.get('lineBreaker_b'), 'pointerdown', DisplayLineBreak.bind(this, 'b'), false);

		/** Events are registered mobile. */
		if (isTouchDevice) {
			this.addEvent(eventWysiwyg, 'touchstart', wwMouseMove, {
				passive: true,
				capture: false,
			});
		}

		/** code view area auto line */
		if (!this.options.get('hasCodeMirror')) {
			const codeNumbers = fc.get('codeNumbers');
			const cvAuthHeight = this.viewer._codeViewAutoHeight.bind(this.viewer, fc.get('code'), codeNumbers, this.frameOptions.get('height') === 'auto');

			this.addEvent(codeArea, 'keydown', cvAuthHeight, false);
			this.addEvent(codeArea, 'keyup', cvAuthHeight, false);
			this.addEvent(codeArea, 'paste', cvAuthHeight, false);

			/** code view numbers */
			if (codeNumbers) this.addEvent(codeArea, 'scroll', this.viewer._scrollLineNumbers.bind(codeArea, codeNumbers), false);
		}

		if (fc.has('statusbar')) this.__addStatusbarEvent(fc, fc.get('options'));

		const OnScrollAbs = OnScroll_Abs.bind(this);
		const scrollParents = dom.query.getScrollParents(fc.get('originElement'));
		for (const parent of scrollParents) {
			this.scrollparents.push(parent);
			this.addEvent(parent, 'scroll', OnScrollAbs, false);
		}

		/** focus temp (mobile) */
		this.addEvent(this.__focusTemp, 'focus', (e) => e.preventDefault(), false);

		/** document event */
		if (this.__eventDoc !== fc.get('_wd')) {
			this.__eventDoc = fc.get('_wd');
			this.addEvent(this.__eventDoc, 'selectionchange', OnSelectionchange_document.bind(this, this.__eventDoc), false);
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Adds event listeners for resizing the status bar if resizing is enabled.
	 * - If resizing is not enabled, applies a non-resizable class.
	 * @param {SunEditor.FrameContext} fc The frame context object
	 * @param {SunEditor.FrameOptions} fo The frame options object
	 */
	__addStatusbarEvent(fc, fo) {
		if (/\d+/.test(fo.get('height')) && fo.get('statusbar_resizeEnable')) {
			fo.set('__statusbarEvent', this.addEvent(fc.get('statusbar'), 'mousedown', OnMouseDown_statusbar.bind(this), false));
		} else {
			dom.utils.addClass(fc.get('statusbar'), 'se-resizing-none');
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Removes all registered event listeners from the editor.
	 * - Disconnects observers and clears stored event references.
	 */
	_removeAllEvents() {
		for (let i = 0, len = this._events.length, e; i < len; i++) {
			e = this._events[i];
			e.target.removeEventListener(e.type, e.listener, e.useCapture);
		}

		this._events = [];

		if (this._wwFrameObserver) {
			this._wwFrameObserver.disconnect();
			this._wwFrameObserver = null;
		}

		if (this._toolbarObserver) {
			this._toolbarObserver.disconnect();
			this._toolbarObserver = null;
		}

		// clear timers
		if (this._balloonDelay) {
			_w.clearTimeout(this._balloonDelay);
			this._balloonDelay = null;
		}

		if (this.__retainTimer) {
			_w.clearTimeout(this.__retainTimer);
			this.__retainTimer = null;
		}

		// remove global events
		this.__geckoActiveEvent &&= this.removeGlobalEvent(this.__geckoActiveEvent);
		this.__selectionSyncEvent &&= this.removeGlobalEvent(this.__selectionSyncEvent);
		this.__resize_editor &&= this.removeGlobalEvent(this.__resize_editor);
		this.__close_move &&= this.removeGlobalEvent(this.__close_move);

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
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Adjusts the position of the editor's toolbar, controllers, and other floating elements based on scroll position.
	 * - Ensures UI elements maintain their intended relative positions when scrolling.
	 * @param {*} eventWysiwyg The wysiwyg event object containing scroll data (Window or element)
	 */
	_moveContainer(eventWysiwyg) {
		const y = eventWysiwyg.scrollTop || eventWysiwyg.scrollY || 0;
		const x = eventWysiwyg.scrollLeft || eventWysiwyg.scrollX || 0;

		if (this.editor.isBalloon) {
			this.context.get('toolbar_main').style.top = this.toolbar._balloonOffset.top - y + 'px';
			this.context.get('toolbar_main').style.left = this.toolbar._balloonOffset.left - x + 'px';
		} else if (this.editor.isSubBalloon) {
			this.context.get('toolbar_sub_main').style.top = this.subToolbar._balloonOffset.top - y + 'px';
			this.context.get('toolbar_sub_main').style.left = this.subToolbar._balloonOffset.left - x + 'px';
		}

		if (this.editor._controllerTargetContext !== this.frameContext.get('topArea')) {
			this.ui._offCurrentController();
		}

		if (this.editor._lineBreaker_t) {
			const t_style = this.editor._lineBreaker_t.style;
			if (t_style.display !== 'none') {
				const t_offset = (this.editor._lineBreaker_t.getAttribute('data-offset') || ',').split(',');
				t_style.top = numbers.get(t_style.top, 0) - (y - numbers.get(t_offset[0], 0)) + 'px';
				t_style.left = numbers.get(t_style.left, 0) - (x - numbers.get(t_offset[1], 0)) + 'px';
				this.editor._lineBreaker_t.setAttribute('data-offset', y + ',' + x);
			}
		}

		if (this.editor._lineBreaker_b) {
			const b_style = this.editor._lineBreaker_b.style;
			if (b_style.display !== 'none') {
				const b_offset = (this.editor._lineBreaker_b.getAttribute('data-offset') || ',').split(',');
				b_style.top = numbers.get(b_style.top, 0) - (y - numbers.get(b_offset[0], 0)) + 'px';
				b_style[b_offset[1]] = numbers.get(b_style[b_offset[1]], 0) - (x - numbers.get(b_offset[2], 0)) + 'px';
				this.editor._lineBreaker_b.setAttribute('data-offset', y + ',' + b_offset[1] + ',' + x);
			}
		}

		const openCont = this.editor.opendControllers;
		for (let i = 0; i < openCont.length; i++) {
			if (!openCont[i].notInCarrier) continue;
			openCont[i].form.style.top = openCont[i].inst.__offset.top - y + 'px';
			openCont[i].form.style.left = openCont[i].inst.__offset.left - x + 'px';
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Handles the scrolling of the editor container.
	 * - Repositions open controllers if necessary.
	 */
	_scrollContainer() {
		if (this.menu.currentDropdownActiveButton && this.menu.currentDropdown) {
			this.menu._resetMenuPosition(this.menu.currentDropdownActiveButton, this.menu.currentDropdown);
		}

		const openCont = this.editor.opendControllers;
		if (openCont.length === 0) return;

		this.__rePositionController(openCont);
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Repositions the currently open controllers within the editor.
	 * - Ensures elements are displayed in their correct positions after scrolling.
	 * @param {Array<object>} cont List of controllers to reposition
	 */
	__rePositionController(cont) {
		if (_DragHandle.get('__dragMove')) _DragHandle.get('__dragMove')();
		for (let i = 0; i < cont.length; i++) {
			if (cont[i].notInCarrier) continue;
			cont[i].inst?._scrollReposition();
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Resets the frame status, adjusting toolbar and UI elements based on the current state.
	 * - Handles inline editor adjustments, fullscreen mode, and responsive toolbar updates.
	 */
	_resetFrameStatus() {
		if (!env.isResizeObserverSupported) {
			this.toolbar.resetResponsiveToolbar();
			if (this.options.get('_subMode')) this.subToolbar.resetResponsiveToolbar();
		}

		const toolbar = this.context.get('toolbar_main');
		const isToolbarHidden = toolbar.style.display === 'none' || (this.editor.isInline && !this.toolbar._inlineToolbarAttr.isShow);
		if (toolbar.offsetWidth === 0 && !isToolbarHidden) return;

		const opendBrowser = this.editor.opendBrowser;
		if (opendBrowser && opendBrowser.area.style.display === 'block') {
			opendBrowser.body.style.maxHeight = dom.utils.getClientSize().h - opendBrowser.header.offsetHeight - 50 + 'px';
		}

		if (this.menu.currentDropdownActiveButton && this.menu.currentDropdown) {
			this.menu._resetMenuPosition(this.menu.currentDropdownActiveButton, this.menu.currentDropdown);
		}

		if (this.viewer._resetFullScreenHeight()) return;

		const fc = this.frameContext;
		if (fc.get('isCodeView') && this.editor.isInline) {
			this.toolbar._showInline();
			return;
		}

		this.editor._iframeAutoHeight(fc);

		if (this.toolbar.isSticky) {
			this.context.get('toolbar_main').style.width = fc.get('topArea').offsetWidth - 2 + 'px';
			this.toolbar._resetSticky();
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Synchronizes the selection state by resetting it on mouseup.
	 * - Ensures selection updates correctly across different interactions.
	 */
	_setSelectionSync() {
		this.removeGlobalEvent(this.__selectionSyncEvent);
		this.__selectionSyncEvent = this.addGlobalEvent('mouseup', () => {
			this.selection._init();
			this.removeGlobalEvent(this.__selectionSyncEvent);
		});
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
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

		const { parent, inner } = this.nodeTransform.createNestedNode(_styleNodes, null);
		const zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
		inner.appendChild(zeroWidth);

		formatEl.innerHTML = '';
		formatEl.appendChild(parent);

		this.selection.setRange(zeroWidth, 1, zeroWidth, 1);
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Clears retained style nodes by replacing content with a single line break.
	 * - Resets the selection to the start of the cleared element.
	 * @param {HTMLElement} formatEl The format element where styles should be cleared
	 */
	_clearRetainStyleNodes(formatEl) {
		formatEl.innerHTML = '<br>';
		this.selection.setRange(formatEl, 0, formatEl, 0);
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Calls a registered plugin event and executes associated handlers synchronously (fire-and-forget).
	 * - Use this for performance-critical events like onMouseMove, onScroll
	 * - If any handler returns `false`, the event propagation stops.
	 * @param {string} name The name of the plugin event
	 * @param {{ frameContext: SunEditor.FrameContext, event: Event, data?: string, line?: Node, range?: Range, file?: File, doc?: Document }} e The event object passed to the plugin event handler
	 * @returns {boolean|undefined} Returns `false` if any handler stops the event, otherwise `undefined`
	 */
	_callPluginEvent(name, e) {
		const eventPlugins = this.editor._onPluginEvents.get(name);
		for (let i = 0, r; i < eventPlugins.length; i++) {
			r = eventPlugins[i](e);
			if (typeof r === 'boolean') return r;
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Calls a registered plugin event and executes associated handlers asynchronously.
	 * - Use this for events that need to check return values or ensure completion
	 * - Waits for each handler to complete (including async handlers)
	 * - If any handler returns `false`, the event propagation stops.
	 * @param {string} name The name of the plugin event
	 * @param {{ frameContext: SunEditor.FrameContext, event: Event, data?: string, line?: Node, range?: Range, file?: File, doc?: Document }} e The event object passed to the plugin event handler
	 * @returns {Promise<boolean|undefined>} Returns `false` if any handler stops the event, otherwise `undefined`
	 */
	async _callPluginEventAsync(name, e) {
		const eventPlugins = this.editor._onPluginEvents.get(name);
		for (let i = 0, r; i < eventPlugins.length; i++) {
			r = await eventPlugins[i](e);
			if (typeof r === 'boolean') return r;
		}
	},

	/**
	 * @internal
	 * @this {EventManagerThis}
	 * @description Removes input event listeners and resets input-related properties.
	 */
	__removeInput() {
		this._inputFocus = this.editor._preventBlur = false;
		this.__inputBlurEvent = this.removeEvent(this.__inputBlurEvent);
		this.__inputKeyEvent = this.removeEvent(this.__inputKeyEvent);
		this.__inputPlugin = null;
	},

	/**
	 * @internal
	 * @description Focus Event Postprocessing
	 * @this {EventManagerThis}
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 * @param {FocusEvent} event - Focus event object
	 */
	__postFocusEvent(frameContext, event) {
		if (this.editor.isInline || this.editor.isBalloonAlways) this.toolbar.show();
		if (this.editor.isSubBalloonAlways) this.subToolbar.show();

		// user event
		this.triggerEvent('onFocus', { frameContext, event });
		// plugin event
		this._callPluginEvent('onFocus', { frameContext, event });
	},

	/**
	 * @internal
	 * @description Blur Event Postprocessing
	 * @this {EventManagerThis}
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 * @param {FocusEvent} event - Focus event object
	 */
	__postBlurEvent(frameContext, event) {
		if (this.editor.isInline || this.editor.isBalloon) this._hideToolbar();
		if (this.editor.isSubBalloon) this._hideToolbar_sub();

		// user event
		this.triggerEvent('onBlur', { frameContext, event });
		// plugin event
		this._callPluginEvent('onBlur', { frameContext, event });
	},

	/**
	 * @internal
	 * @description Records the current viewport size.
	 * @this {EventManagerThis}
	 */
	__setViewportSize() {
		this.status.currentViewportHeight = numbers.get(_w.visualViewport.height, 0);
		// dom.utils.setRootCssVar('--se-var-viewport-height', `${this.status.currentViewportHeight}px`);
	},

	constructor: EventManager,
};

/**
 * @this {EventManagerThis}
 * @param {SunEditor.FrameContext} frameContext - frame context object
 * @param {Element|Window} eventWysiwyg - wysiwyg event object
 * @param {Event} e - Event object
 */
function OnScroll_wysiwyg(frameContext, eventWysiwyg, e) {
	this._moveContainer(eventWysiwyg);
	this._scrollContainer();

	// plugin event
	this._callPluginEvent('onScroll', { frameContext, event: e });

	// document type page
	if (frameContext.has('documentType_use_page')) {
		frameContext.get('documentType').scrollPage();
	}

	// user event
	this.triggerEvent('onScroll', { frameContext, event: e });
}

/**
 * @this {EventManagerThis}
 * @param {SunEditor.FrameContext} frameContext - frame context object
 * @param {FocusEvent} e - Focus event object
 */
function OnFocus_wysiwyg(frameContext, e) {
	if (this.selection.__iframeFocus || frameContext.get('isReadOnly') || frameContext.get('isDisabled')) {
		e.preventDefault();
		return false;
	}

	this.status.hasFocus = true;
	this.component.__prevent = false;
	this.triggerEvent('onNativeFocus', { frameContext, event: e });

	const rootKey = frameContext.get('key');

	if (this._inputFocus) {
		if (this.editor.isInline) {
			_w.setTimeout(() => {
				this.toolbar._showInline();
			}, 0);
		}
		return;
	}

	if ((this.status.rootKey === rootKey && this.editor._preventBlur) || this.editor._preventFocus) return;
	this.editor._preventFocus = true;

	dom.utils.removeClass(this.editor.commandTargets.get('codeView'), 'active');
	dom.utils.setDisabled(this.editor._codeViewDisabledButtons, false);

	this.editor.changeFrameContext(rootKey);
	this.history.resetButtons(rootKey, null);

	_w.setTimeout(() => {
		this.__postFocusEvent(frameContext, e);
	}, 0);
}

/**
 * @this {EventManagerThis}
 * @param {SunEditor.FrameContext} frameContext - frame context object
 * @param {FocusEvent} e - Focus event object
 */
function OnBlur_wysiwyg(frameContext, e) {
	if (frameContext.get('isCodeView') || frameContext.get('isReadOnly') || frameContext.get('isDisabled')) return;

	this.status.hasFocus = false;
	this.editor.effectNode = null;
	this.triggerEvent('onNativeBlur', { frameContext, event: e });

	if (this._inputFocus || this.editor._preventBlur) return;
	this.editor._preventFocus = false;

	this._setKeyEffect([]);

	this.status.currentNodes = [];
	this.status.currentNodesMap = [];

	this.ui._offCurrentController();

	this.editor.applyFrameRoots((root) => {
		if (root.get('navigation')) root.get('navigation').textContent = '';
	});

	this.history.check(frameContext.get('key'), this.status._range);

	this.__postBlurEvent(frameContext, e);
}

/**
 * @this {EventManagerThis}
 * @param {MouseEvent} e - Event object
 */
function OnMouseDown_statusbar(e) {
	e.stopPropagation();
	this._resizeClientY = e.clientY;
	this.ui.enableBackWrapper('ns-resize');
	this.__resize_editor = this.addGlobalEvent('mousemove', __resizeEditor.bind(this));
	this.__close_move = this.addGlobalEvent('mouseup', __closeMove.bind(this));
}

/**
 * @this {EventManagerThis}
 * @param {MouseEvent} e - Event object
 */
function __resizeEditor(e) {
	const fc = this.frameContext;
	const resizeInterval = fc.get('wrapper').offsetHeight + (e.clientY - this._resizeClientY);
	const h = resizeInterval < fc.get('_minHeight') ? fc.get('_minHeight') : resizeInterval;
	fc.get('wysiwygFrame').style.height = fc.get('code').style.height = h + 'px';
	this._resizeClientY = e.clientY;
	if (!env.isResizeObserverSupported) this.editor.__callResizeFunction(fc, h, null);
}

/**
 * @this {EventManagerThis}
 */
function __closeMove() {
	this.ui.disableBackWrapper();
	this.__resize_editor &&= this.removeGlobalEvent(this.__resize_editor);
	this.__close_move &&= this.removeGlobalEvent(this.__close_move);
}

/**
 * @this {EventManagerThis}
 * @param {"t"|"b"} dir - Direction
 * @param {PointerEvent} e - Pointer event object
 */
function DisplayLineBreak(dir, e) {
	e.preventDefault();

	const component = this._lineBreakComp;
	if (!component) return;

	const isList = dom.check.isListCell(component.parentElement);
	const format = dom.utils.createElement(isList ? 'BR' : dom.check.isTableCell(component.parentElement) ? 'DIV' : this.options.get('defaultLine'));
	if (!isList) format.innerHTML = '<br>';

	if (this.frameOptions.get('charCounter_type') === 'byte-html' && !this.char.check(format.outerHTML)) return;

	component.parentNode.insertBefore(format, dir === 't' ? component : component.nextSibling);
	this.component.deselect();

	try {
		const focusEl = isList ? format : format.firstChild;
		this.selection.setRange(focusEl, 1, focusEl, 1);
		this.history.push(false);
	} catch (err) {
		console.warn('[SUNEDITOR.lineBreaker.error]', err);
	}
}

/**
 * @this {EventManagerThis}
 */
function OnResize_window() {
	this.status.initViewportHeight = _w.visualViewport.height;

	if (!isMobile) {
		this.ui._offCurrentController();
	}

	if (this.editor.isBalloon) this.toolbar.hide();
	else if (this.editor.isSubBalloon) this.subToolbar.hide();

	this._resetFrameStatus();
}

/**
 * @this {EventManagerThis}
 */
function OnResize_viewport() {
	if (isMobile && this.options.get('toolbar_sticky') > -1) {
		this.toolbar._resetSticky();
		this.editor.menu._restoreMenuPosition();
	}

	this._scrollContainer();
	this.__setViewportSize();
}

/**
 * @this {EventManagerThis}
 */
function OnScroll_window() {
	if (this.options.get('toolbar_sticky') > -1) {
		this.toolbar._resetSticky();
	}

	if (this.editor.isBalloon && this.context.get('toolbar_main').style.display === 'block') {
		this.toolbar._setBalloonOffset(this.toolbar._balloonOffset.position === 'top');
	} else if (this.editor.isSubBalloon && this.context.get('toolbar_sub_main').style.display === 'block') {
		this.subToolbar._setBalloonOffset(this.subToolbar._balloonOffset.position === 'top');
	}

	this._scrollContainer();

	// document type page
	if (this.frameContext.has('documentType_use_page')) {
		this.frameContext.get('documentType').scrollWindow();
	}
}

/**
 * @this {EventManagerThis}
 */
function OnMobileScroll_viewport() {
	if (this.options.get('toolbar_sticky') > -1) {
		this.toolbar._resetSticky();
		this.editor.menu._restoreMenuPosition();
	}
}

/**
 * @this {EventManagerThis}
 * @param {Document} _wd - Wysiwyg document
 */
function OnSelectionchange_document(_wd) {
	if (this.editor._preventSelection) return;

	const selection = _wd.getSelection();
	let anchorNode = selection.anchorNode;

	this.editor.applyFrameRoots((root) => {
		if (anchorNode && root.get('wysiwyg').contains(anchorNode)) {
			if (root.get('isReadOnly') || root.get('isDisabled')) return;

			anchorNode = null;
			this.selection._init();
			this.applyTagEffect();

			// document type
			if (root.has('documentType_use_header')) {
				const el = dom.query.getParentElement(this.selection.selectionNode, this.format.isLine.bind(this.format));
				root.get('documentType').on(el);
			}
		}
	});
}

/**
 * @this {EventManagerThis}
 */
function OnScroll_Abs() {
	this.menu.dropdownOff();
	this._scrollContainer();
}

/**
 * @this {EventManagerThis}
 * @param {SunEditor.FrameContext} frameContext - frame context object
 */
function OnFocus_code(frameContext) {
	this.editor.changeFrameContext(frameContext.get('key'));
	dom.utils.addClass(this.editor.commandTargets.get('codeView'), 'active');
	dom.utils.setDisabled(this.editor._codeViewDisabledButtons, true);
}

export default EventManager;
