/**
 * @fileoverview eventManager class
 */

import CoreInjector from '../../editorInjector/_core';
import { domUtils, unicode, numbers, env, converter } from '../../helper';
import { _DragHandle } from '../../modules';

// event handlers
import { ButtonsHandler, OnClick_menuTray, OnClick_toolbar } from './eventHandlers/handler_toolbar';
import { OnMouseDown_wysiwyg, OnMouseUp_wysiwyg, OnClick_wysiwyg, OnMouseMove_wysiwyg, OnMouseLeave_wysiwyg } from './eventHandlers/handler_ww_mouse';
import { OnInput_wysiwyg, OnKeyDown_wysiwyg, OnKeyUp_wysiwyg } from './eventHandlers/handler_ww_key_input';
import { OnPaste_wysiwyg, OnCopy_wysiwyg, OnCut_wysiwyg } from './eventHandlers/handler_ww_clipboard';
import { OnDragOver_wysiwyg, OnDragEnd_wysiwyg, OnDrop_wysiwyg } from './eventHandlers/handler_ww_dragDrop';

const { _w, ON_OVER_COMPONENT, isMobile } = env;

const EventManager = function (editor) {
	CoreInjector.call(this, editor);
	this._events = [];
	this._onButtonsCheck = new RegExp(`^(${Object.keys(editor.options.get('_defaultStyleTagMap')).join('|')})$`, 'i');
	this._onShortcutKey = false;
	this.isComposing = false; // Old browsers: When there is no 'e.isComposing' in the keyup event.
	this._balloonDelay = null;
	this._wwFrameObserver = null;
	this._toolbarObserver = null;
	this._lineBreakDir = null;
	this._lineBreakComp = null;
	this._formatAttrsTemp = null;
	this._resizeClientY = 0;
	this.__resize_editor = null;
	this.__close_move = null;
	this.__geckoActiveEvent = null;
	this.__scrollparents = [];
	this.__cacheStyleNodes = [];
	this.__selectionSyncEvent = null;
	// input plugins
	this._inputFocus = false;
	this.__inputPlugin = null;
	this.__inputBlurEvent = null;
	this.__inputKeyEvent = null;
	// viewport
	this.__focusTemp = this.carrierWrapper.querySelector('.__se__focus__temp__');
	this.__retainTimer = null;
	this.__eventDoc = null;
	this.__secopy = null;
};

EventManager.prototype = {
	/**
	 * @description Register for an event.
	 * Only events registered with this method are unregistered or re-registered when methods such as 'setOptions', 'destroy' are called.
	 * @param {Element|Array.<Element>} target Target element
	 * @param {string} type Event type
	 * @param {Function} listener Event handler
	 * @param {boolean|undefined} useCapture Event useCapture option
	 * @return {boolean}
	 */
	addEvent(target, type, listener, useCapture) {
		if (!target) return false;
		if (!numbers.is(target.length) || target.nodeName || (!Array.isArray(target) && target.length < 1)) target = [target];
		if (target.length === 0) return false;

		const len = target.length;
		for (let i = 0; i < len; i++) {
			target[i].addEventListener(type, listener, useCapture);
			this._events.push({
				target: target[i],
				type: type,
				handler: listener,
				useCapture: useCapture
			});
		}

		return {
			target: len > 1 ? target : target[0],
			type: type,
			listener,
			handler: listener,
			useCapture: useCapture
		};
	},

	/**
	 * @description Remove event
	 * @param {object} params { target, type, listener, useCapture } = this.addEvent()
	 * @returns {null}
	 */
	removeEvent(params) {
		if (!params) return;

		let target = params.target;
		const type = params.type;
		const listener = params.listener;
		const useCapture = params.useCapture;

		if (!target) return false;
		if (!numbers.is(target.length) || target.nodeName || (!Array.isArray(target) && target.length < 1)) target = [target];
		if (target.length === 0) return false;

		for (let i = 0, len = target.length; i < len; i++) {
			target[i].removeEventListener(type, listener, useCapture);
		}

		return null;
	},

	/**
	 * @description Add an event to document.
	 * When created as an Iframe, the same event is added to the document in the Iframe.
	 * @param {string} type Event type
	 * @param {Function} listener Event listener
	 * @param {boolean|undefined} useCapture Use event capture
	 * @return {type, listener, useCapture}
	 */
	addGlobalEvent(type, listener, useCapture) {
		if (this.editor.frameOptions.get('iframe')) {
			this.editor.frameContext.get('_ww').addEventListener(type, listener, useCapture);
		}
		this._w.addEventListener(type, listener, useCapture);
		return {
			type: type,
			listener: listener,
			useCapture: useCapture
		};
	},

	/**
	 * @description Remove events from document.
	 * When created as an Iframe, the event of the document inside the Iframe is also removed.
	 * @param {string|object} type Event type
	 * @param {Function} listener Event listener
	 * @param {boolean|undefined} useCapture Use event capture
	 */
	removeGlobalEvent(type, listener, useCapture) {
		if (!type) return;

		if (typeof type === 'object') {
			listener = type.listener;
			useCapture = type.useCapture;
			type = type.type;
		}
		if (this.editor.frameOptions.get('iframe')) {
			this.editor.frameContext.get('_ww').removeEventListener(type, listener, useCapture);
		}
		this._w.removeEventListener(type, listener, useCapture);
	},

	/**
	 * @description Activates the corresponding button with the tags information of the current cursor position,
	 * such as 'bold', 'underline', etc., and executes the 'active' method of the plugins.
	 * @param {Node|null} selectionNode selectionNode
	 * @returns {Node|undefined} selectionNode
	 */
	applyTagEffect(selectionNode) {
		selectionNode = selectionNode || this.selection.getNode();
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

		const activeCommands = this.editor.activeCommands;
		const cLen = activeCommands.length;
		let nodeName = '';

		if (this.component.is(selectionNode) && !this.component.__selectionSelected) {
			const component = this.component.get(selectionNode);
			if (!component) return;
			this.component.select(component.target, component.pluginName, false);
			return;
		}

		while (selectionNode.firstChild) {
			selectionNode = selectionNode.firstChild;
		}

		const fc = this.editor.frameContext;
		const notReadonly = !fc.get('isReadOnly');
		for (let element = selectionNode; !domUtils.isWysiwygFrame(element); element = element.parentNode) {
			if (!element) break;
			if (element.nodeType !== 1 || domUtils.isBreak(element)) continue;
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
						commandTargets.get(name) &&
						commandTargets.get(name).filter((e) => {
							return plugins[name]?.active(element, e);
						}).length > 0
					) {
						commandMapNodes.push(name);
					}
				}
			}

			/** indent, outdent */
			if (this.format.isLine(element)) {
				/* Outdent */
				if (!commandMapNodes.includes('outdent') && commandTargets.has('outdent') && (domUtils.isListCell(element) || (element.style[marginDir] && numbers.get(element.style[marginDir], 0) > 0))) {
					if (
						commandTargets.get('outdent').filter((e) => {
							if (domUtils.isImportantDisabled(e)) return false;
							e.removeAttribute('disabled');
							return true;
						}).length > 0
					) {
						commandMapNodes.push('outdent');
					}
				}
				/* Indent */
				if (!commandMapNodes.includes('indent') && commandTargets.has('indent')) {
					const indentDisable = domUtils.isListCell(element) && !element.previousElementSibling;
					if (
						commandTargets.get('indent').filter((e) => {
							if (domUtils.isImportantDisabled(e)) return false;
							if (indentDisable) {
								e.setAttribute('disabled', true);
							} else {
								e.removeAttribute('disabled');
							}
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
				domUtils.addClass(commandTargets.get(nodeName), 'active');
			}
		}

		this._setKeyEffect(commandMapNodes);

		// cache style nodes
		this.__cacheStyleNodes = styleNodes.reverse();

		/** save current nodes */
		this.status.currentNodes = currentNodes.reverse();
		this.status.currentNodesMap = commandMapNodes;

		/**  Displays the current node structure to statusbar */
		if (this.editor.frameOptions.get('statusbar_showPathLabel') && fc.get('navigation')) {
			fc.get('navigation').textContent = this.options.get('_rtl') ? this.status.currentNodes.reverse().join(' < ') : this.status.currentNodes.join(' > ');
		}

		return selectionNode;
	},

	/**
	 * @description Gives an active effect when the mouse down event is blocked. (Used when "env.isGecko" is true)
	 * @param {Element} target Target element
	 * @private
	 */
	_injectActiveEvent(target) {
		domUtils.addClass(target, '__se__active');
		this.__geckoActiveEvent = this.addGlobalEvent('mouseup', () => {
			domUtils.removeClass(target, '__se__active');
			this.__geckoActiveEvent = this.removeGlobalEvent(this.__geckoActiveEvent);
		});
	},

	/**
	 * @description remove class, display text.
	 * @param {Array} ignoredList Igonred button list
	 * @private
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
				if (!e || e.length === 0) continue;
				if (p) {
					p.active(null, e);
				} else if (/^outdent$/i.test(k)) {
					if (!domUtils.isImportantDisabled(e)) e.setAttribute('disabled', true);
				} else if (/^indent$/i.test(k)) {
					if (!domUtils.isImportantDisabled(e)) e.removeAttribute('disabled');
				} else {
					domUtils.removeClass(e, 'active');
				}
			}
		}
	},

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

	_toggleToolbarBalloon() {
		this.selection._init();
		const range = this.selection.getRange();
		const hasSubMode = this.options.has('_subMode');

		if (this.menu._bindControllersOff || (!(hasSubMode ? this.editor.isSubBalloonAlways : this.editor.isBalloonAlways) && range.collapsed)) {
			if (hasSubMode) this._hideToolbar_sub();
			else this._hideToolbar();
		} else {
			if (hasSubMode) this.subToolbar._showBalloon(range);
			else this.toolbar._showBalloon(range);
		}
	},

	_hideToolbar() {
		if (!this.editor._notHideToolbar && !this.editor.frameContext.get('isFullScreen')) {
			this.toolbar.hide();
		}
	},

	_hideToolbar_sub() {
		if (this.subToolbar && !this.editor._notHideToolbar) {
			this.subToolbar.hide();
		}
	},

	_isNonFocusNode(node) {
		return node.nodeType === 1 && node.getAttribute('data-se-non-focus') === 'true';
	},

	_isUneditableNode(range, isFront) {
		const container = isFront ? range.startContainer : range.endContainer;
		const offset = isFront ? range.startOffset : range.endOffset;
		const siblingKey = isFront ? 'previousSibling' : 'nextSibling';
		const isElement = container.nodeType === 1;
		let siblingNode;

		if (isElement) {
			siblingNode = this._isUneditableNode_getSibling(container.childNodes[offset], siblingKey, container);
			return siblingNode && siblingNode.nodeType === 1 && siblingNode.getAttribute('contenteditable') === 'false' ? siblingNode : null;
		} else {
			siblingNode = this._isUneditableNode_getSibling(container, siblingKey, container);
			return domUtils.isEdgePoint(container, offset, isFront ? 'front' : 'end') && siblingNode && siblingNode.nodeType === 1 && siblingNode.getAttribute('contenteditable') === 'false' ? siblingNode : null;
		}
	},

	_isUneditableNode_getSibling(selectNode, siblingKey, container) {
		if (!selectNode) return null;
		let siblingNode = selectNode[siblingKey];

		if (!siblingNode) {
			siblingNode = this.format.getLine(container);
			siblingNode = siblingNode ? siblingNode[siblingKey] : null;
			if (siblingNode && !this.component.is(siblingNode)) siblingNode = siblingKey === 'previousSibling' ? siblingNode.firstChild : siblingNode.lastChild;
			else return null;
		}

		return siblingNode;
	},

	// FireFox - table delete, Chrome - image, video, audio
	_hardDelete() {
		const range = this.selection.getRange();
		const sc = range.startContainer;
		const ec = range.endContainer;

		// table
		const sCell = this.format.getBlock(sc);
		const eCell = this.format.getBlock(ec);
		const sIsCell = domUtils.isTableCell(sCell);
		const eIsCell = domUtils.isTableCell(eCell);
		const ancestor = range.commonAncestorContainer;
		if (((sIsCell && !sCell.previousElementSibling && !sCell.parentElement.previousElementSibling) || (eIsCell && !eCell.nextElementSibling && !eCell.parentElement.nextElementSibling)) && sCell !== eCell) {
			if (!sIsCell) {
				domUtils.removeItem(domUtils.getParentElement(eCell, (current) => ancestor === current.parentNode));
			} else if (!eIsCell) {
				domUtils.removeItem(domUtils.getParentElement(sCell, (current) => ancestor === current.parentNode));
			} else {
				domUtils.removeItem(domUtils.getParentElement(sCell, (current) => ancestor === current.parentNode));
				this.editor._nativeFocus();
				return true;
			}
		}

		// component
		const sComp = sc.nodeType === 1 ? domUtils.getParentElement(sc, '.se-component') : null;
		const eComp = ec.nodeType === 1 ? domUtils.getParentElement(ec, '.se-component') : null;
		if (sComp) domUtils.removeItem(sComp);
		if (eComp) domUtils.removeItem(eComp);

		return false;
	},

	/**
	 * @description If there is no default format, add a line and move 'selection'.
	 * @param {string|null} formatName Format tag name (default: 'P')
	 * @private
	 */
	_setDefaultLine(formatName) {
		if (!this.options.get('__lineFormatFilter')) return null;
		if (this.editor._fileManager.pluginRegExp.test(this.editor.currentControllerName)) return;

		const range = this.selection.getRange();
		const commonCon = range.commonAncestorContainer;
		const startCon = range.startContainer;
		const rangeEl = this.format.getBlock(commonCon, null);
		let focusNode, offset, format;

		if (rangeEl) {
			format = domUtils.createElement(formatName || this.options.get('defaultLine'));
			format.innerHTML = rangeEl.innerHTML;
			if (format.childNodes.length === 0) format.innerHTML = unicode.zeroWidthSpace;

			rangeEl.innerHTML = format.outerHTML;
			format = rangeEl.firstChild;
			focusNode = domUtils.getEdgeChildNodes(format, null).sc;

			if (!focusNode) {
				focusNode = domUtils.createTextNode(unicode.zeroWidthSpace);
				format.insertBefore(focusNode, format.firstChild);
			}

			offset = focusNode.textContent.length;
			this.selection.setRange(focusNode, offset, focusNode, offset);
			return;
		}

		if (commonCon.nodeType === 3 && this.component.is(commonCon.parentElement)) {
			const compInfo = this.component.get(commonCon.parentElement);
			const container = compInfo.container;

			if (commonCon.parentElement === container) {
				const siblingEl = commonCon.nextElementSibling ? container : container.nextElementSibling;
				const el = domUtils.createElement(this.options.get('defaultLine'), null, commonCon);
				container.parentElement.insertBefore(el, siblingEl);
				this.editor.focusEdge(el);
				return;
			}

			this.component.select(compInfo.target, compInfo.pluginName, false);
			return null;
		} else if (commonCon.nodeType === 1 && commonCon.getAttribute('data-se-embed') === 'true') {
			let el = commonCon.nextElementSibling;
			if (!this.format.isLine(el)) el = this.format.addLine(commonCon, this.options.get('defaultLine'));
			this.selection.setRange(el.firstChild, 0, el.firstChild, 0);
			return;
		}

		if ((this.format.isBlock(startCon) || domUtils.isWysiwygFrame(startCon)) && (this.component.is(startCon.children[range.startOffset]) || this.component.is(startCon.children[range.startOffset - 1]))) return;
		if (domUtils.getParentElement(commonCon, domUtils.isExcludeFormat)) return null;

		if (this.format.isBlock(commonCon) && commonCon.childNodes.length <= 1) {
			let br = null;
			if (commonCon.childNodes.length === 1 && domUtils.isBreak(commonCon.firstChild)) {
				br = commonCon.firstChild;
			} else {
				br = domUtils.createTextNode(unicode.zeroWidthSpace);
				commonCon.appendChild(br);
			}

			this.selection.setRange(br, 1, br, 1);
			return;
		}

		try {
			if (commonCon.nodeType === 3) {
				format = domUtils.createElement(formatName || this.options.get('defaultLine'));
				commonCon.parentNode.insertBefore(format, commonCon);
				format.appendChild(commonCon);
			}

			if (domUtils.isBreak(format.nextSibling)) domUtils.removeItem(format.nextSibling);
			if (domUtils.isBreak(format.previousSibling)) domUtils.removeItem(format.previousSibling);
			if (domUtils.isBreak(focusNode)) {
				const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
				focusNode.parentNode.insertBefore(zeroWidth, focusNode);
				focusNode = zeroWidth;
			}
		} catch (e) {
			this.editor.execCommand('formatBlock', false, formatName || this.options.get('defaultLine'));
			this.selection.removeRange();
			this.selection._init();
			this.editor.effectNode = null;
			return;
		}

		if (format) {
			if (domUtils.isBreak(format.nextSibling)) domUtils.removeItem(format.nextSibling);
			if (domUtils.isBreak(format.previousSibling)) domUtils.removeItem(format.previousSibling);
			if (domUtils.isBreak(focusNode)) {
				const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
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

	async _dataTransferAction(type, e, clipboardData, frameContext) {
		try {
			this.editor.showLoading();
			await this._setClipboardData(type, e, clipboardData, frameContext);
			e.preventDefault();
			e.stopPropagation();
			return false;
		} catch (err) {
			console.warn('[SUNEDITOR.paste.error]', err);
		} finally {
			this.editor.hideLoading();
		}
	},

	async _setClipboardData(type, e, clipboardData, frameContext) {
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
				const dom = new DOMParser().parseFromString(cleanData, 'text/html');
				domUtils.getListChildNodes(dom.body, converter.textToAnchor);
				cleanData = dom.body.innerHTML;
			}
		}

		if (!onlyText) {
			cleanData = this.html.clean(cleanData, { forceFormat: false, whitelist: null, blacklist: null });
		}

		const maxCharCount = this.char.test(this.editor.frameOptions.get('charCounter_type') === 'byte-html' ? cleanData : plainText, false);
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
				this._callPluginEvent('onPastAndDrop', { frameContext, event: e, file: files[i] });
			}

			return false;
		}

		if (!maxCharCount) {
			return false;
		}

		if (cleanData) {
			this.html.insert(cleanData, { selectInserted: false, skipCharCount: true, skipCleaning: true });
			// document type
			if (frameContext.has('documentType-use-header')) {
				frameContext.get('documentType').reHeader();
			}
			return false;
		}
	},

	_addCommonEvents() {
		const buttonsHandler = ButtonsHandler.bind(this);
		const toolbarHandler = OnClick_toolbar.bind(this);

		/** menu event */
		this.addEvent(this.context.get('menuTray'), 'mousedown', buttonsHandler, false);
		this.addEvent(this.context.get('menuTray'), 'click', OnClick_menuTray.bind(this), true);

		/** toolbar event */
		this.addEvent(this.context.get('toolbar.main'), 'mousedown', buttonsHandler, false);
		this.addEvent(this.context.get('toolbar.main'), 'click', toolbarHandler, false);
		// subToolbar
		if (this.options.has('_subMode')) {
			this.addEvent(this.context.get('toolbar.sub.main'), 'mousedown', buttonsHandler, false);
			this.addEvent(this.context.get('toolbar.sub.main'), 'click', toolbarHandler, false);
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
						this.editor.__callResizeFunction(this.editor.frameRoots.get(e.target.getAttribute('data-root-key')), -1, e);
					});
				}, 0);
			});
		}

		/** modal outside click */
		if (this.options.get('closeModalOutsideClick')) {
			this.addEvent(
				this.carrierWrapper.querySelector('.se-modal-inner'),
				'click',
				(e) => {
					if (e.target === this.carrierWrapper.querySelector('.se-modal-inner')) {
						this.editor._offCurrentModal();
					}
				},
				false
			);
		}

		/** window event */
		this.addEvent(_w, 'resize', OnResize_window.bind(this), false);
		this.addEvent(_w, 'scroll', OnScroll_window.bind(this), false);
		if (env.isMobile) {
			this.addEvent(_w.visualViewport, 'scroll', OnScroll_viewport.bind(this), false);
		}
	},

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
		this.addEvent(eventWysiwyg, 'input', OnInput_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'keydown', OnKeyDown_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'keyup', OnKeyUp_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'paste', OnPaste_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'copy', OnCopy_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'cut', OnCut_wysiwyg.bind(this, fc), false);
		this.addEvent(
			eventWysiwyg,
			'dragover',
			OnDragOver_wysiwyg.bind(this, fc, dragCursor, isIframe ? this.editor.frameContext.get('topArea') : null, !this.options.get('toolbar_container') && !this.editor.isBalloon && !this.editor.isInline),
			false
		);
		this.addEvent(eventWysiwyg, 'dragend', OnDragEnd_wysiwyg.bind(this, dragCursor), false);
		this.addEvent(eventWysiwyg, 'drop', OnDrop_wysiwyg.bind(this, fc, dragCursor), false);
		this.addEvent(eventWysiwyg, 'scroll', OnScroll_wysiwyg.bind(this, fc, eventWysiwyg), { passive: true, useCapture: false });
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
			false
		);

		/** line breaker */
		const lineBreakEventName = isMobile ? 'touchstart' : 'mousedown';
		this.addEvent(
			[fc.get('lineBreaker_t'), fc.get('lineBreaker_b')],
			lineBreakEventName,
			(e) => {
				e.preventDefault();
			},
			false
		);
		this.addEvent(fc.get('lineBreaker_t'), lineBreakEventName, DisplayLineBreak.bind(this, 't'), false);
		this.addEvent(fc.get('lineBreaker_b'), lineBreakEventName, DisplayLineBreak.bind(this, 'b'), false);

		/** Events are registered mobile. */
		if (isMobile) {
			this.addEvent(eventWysiwyg, 'touchstart', wwMouseMove, {
				passive: true,
				useCapture: false
			});
		}

		/** code view area auto line */
		if (!this.options.get('hasCodeMirror')) {
			const codeNumbers = fc.get('codeNumbers');
			const cvAuthHeight = this.viewer._codeViewAutoHeight.bind(this.viewer, fc.get('code'), codeNumbers, this.editor.frameOptions.get('height') === 'auto');

			this.addEvent(codeArea, 'keydown', cvAuthHeight, false);
			this.addEvent(codeArea, 'keyup', cvAuthHeight, false);
			this.addEvent(codeArea, 'paste', cvAuthHeight, false);

			/** code view numbers */
			if (codeNumbers) this.addEvent(codeArea, 'scroll', this.viewer._scrollLineNumbers.bind(codeArea, codeNumbers), false);
		}

		if (fc.has('statusbar')) this.__addStatusbarEvent(fc, fc.get('options'));

		const OnScrollAbs = OnScroll_Abs.bind(this);
		let scrollParent = fc.get('originElement');
		while ((scrollParent = domUtils.getScrollParent(scrollParent.parentElement))) {
			this.__scrollparents.push(scrollParent);
			this.addEvent(scrollParent, 'scroll', OnScrollAbs, false);
		}

		/** focus temp (mobile) */
		this.addEvent(this.__focusTemp, 'focus', (e) => e.preventDefault(), false);

		/** document event */
		if (this.__eventDoc !== fc.get('_wd')) {
			this.__eventDoc = fc.get('_wd');
			this.addEvent(this.__eventDoc, 'selectionchange', OnSelectionchange_document.bind(this, this.__eventDoc), false);
		}
	},

	__addStatusbarEvent(fc, fo) {
		if (/\d+/.test(fo.get('height')) && fo.get('statusbar_resizeEnable')) {
			fo.set('__statusbarEvent', this.addEvent(fc.get('statusbar'), 'mousedown', OnMouseDown_statusbar.bind(this), false));
		} else {
			domUtils.addClass(fc.get('statusbar'), 'se-resizing-none');
		}
	},

	_removeAllEvents() {
		for (let i = 0, len = this._events.length, e; i < len; i++) {
			e = this._events[i];
			e.target.removeEventListener(e.type, e.handler, e.useCapture);
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
	},

	_moveContainer(eventWysiwyg) {
		const y = eventWysiwyg.scrollY || eventWysiwyg.scrollTop || 0;
		const x = eventWysiwyg.scrollX || eventWysiwyg.scrollLeft || 0;

		if (this.editor.isBalloon) {
			this.context.get('toolbar.main').style.top = this.toolbar._balloonOffset.top - y + 'px';
			this.context.get('toolbar.main').style.left = this.toolbar._balloonOffset.left - x + 'px';
		} else if (this.editor.isSubBalloon) {
			this.context.get('toolbar.sub.main').style.top = this.subToolbar._balloonOffset.top - y + 'px';
			this.context.get('toolbar.sub.main').style.left = this.subToolbar._balloonOffset.left - x + 'px';
		}

		if (this.editor._controllerTargetContext !== this.editor.frameContext.get('topArea')) {
			this.editor._offCurrentController();
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

	_scrollContainer() {
		const openCont = this.editor.opendControllers;
		if (!openCont.length) return;

		this.__rePositionController(openCont);
	},

	__rePositionController(cont) {
		if (_DragHandle.get('__dragMove')) _DragHandle.get('__dragMove')();
		for (let i = 0; i < cont.length; i++) {
			if (cont[i].notInCarrier) continue;
			cont[i].inst?.show();
		}
	},

	_resetFrameStatus() {
		if (!env.isResizeObserverSupported) {
			this.toolbar.resetResponsiveToolbar();
			if (this.options.get('_subMode')) this.subToolbar.resetResponsiveToolbar();
		}

		const toolbar = this.context.get('toolbar.main');
		const isToolbarHidden = toolbar.style.display === 'none' || (this.editor.isInline && !this.toolbar._inlineToolbarAttr.isShow);
		if (toolbar.offsetWidth === 0 && !isToolbarHidden) return;

		const opendBrowser = this.editor.opendBrowser;
		if (opendBrowser && opendBrowser.area.style.display === 'block') {
			opendBrowser.body.style.maxHeight = domUtils.getClientSize().h - opendBrowser.header.offsetHeight - 50 + 'px';
		}

		if (this.menu.currentDropdownActiveButton && this.menu.currentDropdown) {
			this.menu._setMenuPosition(this.menu.currentDropdownActiveButton, this.menu.currentDropdown);
		}

		if (this.viewer._resetFullScreenHeight()) return;

		const fc = this.editor.frameContext;
		if (fc.get('isCodeView') && this.editor.isInline) {
			this.toolbar._showInline();
			return;
		}

		this.editor._iframeAutoHeight(fc);

		if (this.toolbar._sticky) {
			this.context.get('toolbar.main').style.width = fc.get('topArea').offsetWidth - 2 + 'px';
			this.toolbar._resetSticky();
		}
	},

	_setSelectionSync() {
		this.removeGlobalEvent(this.__selectionSyncEvent);
		this.__selectionSyncEvent = this.addGlobalEvent('mouseup', () => {
			this.selection._init();
			this.removeGlobalEvent(this.__selectionSyncEvent);
		});
	},

	_retainStyleNodes(formatEl, _styleNodes) {
		const el = _styleNodes[0].cloneNode(false);
		let n = el;
		for (let i = 1, len = _styleNodes.length, t; i < len; i++) {
			t = _styleNodes[i].cloneNode(false);
			n.appendChild(t);
			n = t;
		}

		const { parent, inner } = this.nodeTransform.createNestedNode(_styleNodes, null);
		const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
		inner.appendChild(zeroWidth);

		formatEl.innerHTML = '';
		formatEl.appendChild(parent);

		this.selection.setRange(zeroWidth, 1, zeroWidth, 1);
	},

	_clearRetainStyleNodes(formatEl) {
		formatEl.innerHTML = '<br>';
		this.selection.setRange(formatEl, 0, formatEl, 0);
	},

	_callPluginEvent(name, e) {
		const eventPlugins = this.editor._onPluginEvents.get(name);
		for (let i = 0; i < eventPlugins.length; i++) {
			if (eventPlugins[i](e) === false) return false;
		}
	},

	_overComponentSelect(target) {
		const figure = domUtils.getParentElement(target, domUtils.isFigure);
		let info = this.component.get(target);
		if (info || figure) {
			if (!info) info = this.component.get(figure);
			if (info && !domUtils.hasClass(info.container, 'se-component-selected')) {
				this.editor._offCurrentController();
				_DragHandle.set('__overInfo', ON_OVER_COMPONENT);
				this.component.select(info.target, info.pluginName, false);
			}
		} else if (_DragHandle.get('__overInfo') !== null && !domUtils.hasClass(target, 'se-drag-handle')) {
			this.component.__deselect();
			_DragHandle.set('__overInfo', null);
		}
	},

	__removeInput() {
		this._inputFocus = this.editor._preventBlur = false;
		this.__inputBlurEvent = this.removeEvent(this.__inputBlurEvent);
		this.__inputKeyEvent = this.removeEvent(this.__inputKeyEvent);
		this.__inputPlugin = null;
	},

	__enterPrevent(e) {
		e.preventDefault();
		if (!isMobile) return;

		this.__focusTemp.focus();
		this.editor.frameContext.get('wysiwyg').focus();
	},

	constructor: EventManager
};

function OnScroll_wysiwyg(frameContext, eventWysiwyg, e) {
	this._moveContainer(eventWysiwyg);
	this._scrollContainer();

	// plugin event
	this._callPluginEvent('onScroll', { frameContext, event: e });

	// document type page
	if (frameContext.has('documentType-use-page')) {
		frameContext.get('documentType').scrollPage();
	}

	// user event
	this.triggerEvent('onScroll', { frameContext, event: e });
}

function OnFocus_wysiwyg(frameContext, e) {
	if (this.selection.__iframeFocus || frameContext.get('isReadOnly') || frameContext.get('isDisabled')) {
		e.preventDefault();
		return false;
	}

	const rootKey = frameContext.get('key');

	if (this._inputFocus) {
		if (this.editor.isInline) {
			this._w.setTimeout(() => {
				this.toolbar._showInline();
			}, 0);
		}
		return;
	}

	if (this.status.rootKey === rootKey && this.editor._preventBlur) return;

	const onSelected = this.editor.status.onSelected || this.editor.opendModal;
	this.editor._offCurrentController();
	this.status.hasFocus = true;

	domUtils.removeClass(this.editor.commandTargets.get('codeView'), 'active');
	domUtils.setDisabled(this.editor._codeViewDisabledButtons, false);

	this.editor.changeFrameContext(rootKey);
	this.history.resetButtons(rootKey, null);

	if (!onSelected) {
		this.selection.removeRange();
		this.applyTagEffect();
	}

	this._w.setTimeout(() => {
		if (this.editor.isInline) this.toolbar._showInline();

		// user event
		this.triggerEvent('onFocus', { frameContext, event: e });
		// plugin event
		this._callPluginEvent('onFocus', { frameContext, event: e });
	}, 0);
}

function OnBlur_wysiwyg(frameContext, e) {
	if (this._inputFocus || this.editor._preventBlur || frameContext.get('isCodeView') || frameContext.get('isReadOnly') || frameContext.get('isDisabled')) return;

	this.status.hasFocus = false;
	this.editor.effectNode = null;
	if (this.editor.isInline || this.editor.isBalloon) this._hideToolbar();
	if (this.editor.isSubBalloon) this._hideToolbar_sub();

	this._setKeyEffect([]);

	this.status.currentNodes = [];
	this.status.currentNodesMap = [];

	this.editor.applyFrameRoots((root) => {
		if (root.get('navigation')) root.get('navigation').textContent = '';
	});

	this.history.check(frameContext.get('key'), this.status._range);

	// user event
	this.triggerEvent('onBlur', { frameContext, event: e });
	// plugin event
	this._callPluginEvent('onBlur', { frameContext, event: e });
}

function OnMouseDown_statusbar(e) {
	e.stopPropagation();
	this._resizeClientY = e.clientY;
	this.editor.enableBackWrapper('ns-resize');
	this.__resize_editor = this.addGlobalEvent('mousemove', __resizeEditor.bind(this));
	this.__close_move = this.addGlobalEvent('mouseup', __closeMove.bind(this));
}

function __resizeEditor(e) {
	const fc = this.editor.frameContext;
	const resizeInterval = fc.get('wrapper').offsetHeight + (e.clientY - this._resizeClientY);
	const h = resizeInterval < fc.get('_minHeight') ? fc.get('_minHeight') : resizeInterval;
	fc.get('wysiwygFrame').style.height = fc.get('code').style.height = h + 'px';
	this._resizeClientY = e.clientY;
	if (!env.isResizeObserverSupported) this.editor.__callResizeFunction(fc, h, null);
}

function __closeMove() {
	this.editor.disableBackWrapper();
	if (this.__resize_editor) this.__resize_editor = this.removeGlobalEvent(this.__resize_editor);
	if (this.__close_move) this.__close_move = this.removeGlobalEvent(this.__close_move);
}

function DisplayLineBreak(dir, e) {
	e.preventDefault();

	const component = this._lineBreakComp;
	if (!component) return;

	dir = !dir ? this._lineBreakDir : dir;
	const isList = domUtils.isListCell(component.parentNode);
	const format = domUtils.createElement(isList ? 'BR' : domUtils.isTableCell(component.parentNode) ? 'DIV' : this.options.get('defaultLine'));
	if (!isList) format.innerHTML = '<br>';

	if (this.editor.frameOptions.get('charCounter_type') === 'byte-html' && !this.char.check(format.outerHTML)) return;

	component.parentNode.insertBefore(format, dir === 't' ? component : component.nextSibling);
	this.component.deselect();

	try {
		this.editor._preventBlur = true;
		const focusEl = isList ? format : format.firstChild;
		this.selection.setRange(focusEl, 1, focusEl, 1);
		this.history.push(false);
	} finally {
		this.editor._preventBlur = false;
	}
}

function OnResize_window() {
	if (isMobile) {
		this._scrollContainer();
	} else {
		this.editor._offCurrentController();
	}

	if (this.editor.isBalloon) this.toolbar.hide();
	else if (this.editor.isSubBalloon) this.subToolbar.hide();

	this._resetFrameStatus();
}

function OnScroll_window() {
	if (this.options.get('toolbar_sticky') > -1) {
		this.toolbar._resetSticky();
	}

	if (this.editor.isBalloon && this.context.get('toolbar.main').style.display === 'block') {
		this.toolbar._setBalloonOffset(this.toolbar._balloonOffset.position === 'top');
	} else if (this.editor.isSubBalloon && this.context.get('toolbar.sub.main').style.display === 'block') {
		this.subToolbar._setBalloonOffset(this.subToolbar._balloonOffset.position === 'top');
	}

	this._scrollContainer();

	// document type page
	if (this.editor.frameContext.has('documentType-use-page')) {
		this.editor.frameContext.get('documentType').scrollWindow();
	}
}

function OnScroll_viewport() {
	if (this.options.get('toolbar_sticky') > -1) {
		this.toolbar._resetSticky();
	}
}

function OnSelectionchange_document(_wd) {
	const selection = _wd.getSelection();
	let anchorNode = selection.anchorNode;

	this.editor.applyFrameRoots((root) => {
		if (anchorNode && root.get('wysiwyg').contains(anchorNode)) {
			if (root.get('isReadOnly') || root.get('isDisabled')) return;

			anchorNode = null;
			this.selection._init();
			this.applyTagEffect();

			// document type
			if (root.has('documentType-use-header')) {
				const el = domUtils.getParentElement(this.selection.selectionNode, this.format.isLine.bind(this.format));
				root.get('documentType').on(el);
			}
		}
	});
}

function OnScroll_Abs() {
	this._scrollContainer();
}

function OnFocus_code(frameContext) {
	this.editor.changeFrameContext(frameContext.get('key'));
	domUtils.addClass(this.editor.commandTargets.get('codeView'), 'active');
	domUtils.setDisabled(this.editor._codeViewDisabledButtons, true);
}

export default EventManager;
