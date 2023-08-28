/**
 * @fileoverview eventManager class
 */

import CoreInjector from '../../editorInjector/_core';
import { domUtils, unicode, numbers, env, converter } from '../../helper';

const _w = env._w;
const DIRECTION_KEYCODE = new RegExp(/^(8|3[2-9]|40|46)$/);
const SPACE_DEL_DIR_KEYCODE = new RegExp(/^(8|13|3[2-9]|40|46)$/);
const NON_TEXT_KEYCODE = new RegExp(/^(8|13|1[6-9]|20|27|3[3-9]|40|45|46|11[2-9]|12[0-3]|144|145)$/);
const HISTORY_IGNORE_KEYCODE = new RegExp(/^(1[6-9]|20|27|3[3-9]|40|45|11[2-9]|12[0-3]|144|145)$/);
const FRONT_ZEROWIDTH = new RegExp(unicode.zeroWidthSpace + '+', '');

const EventManager = function (editor) {
	CoreInjector.call(this, editor);
	this._events = [];
	this._onButtonsCheck = new RegExp(`^(${Object.keys(editor.options.get('_defaultStyleTagMap')).join('|')})$`, 'i');
	this._onShortcutKey = false;
	this.isComposing = false; // Old browsers: When there is no 'e.isComposing' in the keyup event.
	this._balloonDelay = null;
	this._resizeObserver = null;
	this._toolbarObserver = null;
	this._lineBreakDir = null;
	this._lineBreakComp = null;
	this._formatAttrsTemp = null;
	this._resizeClientY = 0;
	this.__resize_editor = null;
	this.__close_move = null;
	this.__geckoActiveEvent = null;
	this.__scrollparents = [];
	this.__scrollID = '';
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
			handler: listener,
			useCapture: useCapture
		};
	},

	/**
	 * @description Remove event
	 * @param {object} params { target, type, listener, useCapture } = this.addEvent()
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

		const activeCommands = this.editor.activeCommands;
		const cLen = activeCommands.length;
		let nodeName = '';

		while (selectionNode.firstChild) {
			selectionNode = selectionNode.firstChild;
		}

		if (this.component.is(selectionNode)) {
			const component = this.component.get(selectionNode);
			this.component.select(component.target, component.pluginName, false);
			return;
		}

		const fc = this.editor.frameContext;
		const notReadonly = !fc.get('isReadOnly');
		this.editor._antiBlur = false;
		for (let element = selectionNode; !domUtils.isWysiwygFrame(element); element = element.parentNode) {
			if (!element) break;
			if (element.nodeType !== 1 || domUtils.isBreak(element)) continue;
			nodeName = element.nodeName.toLowerCase();
			currentNodes.push(nodeName);

			/* Active plugins */
			if (notReadonly) {
				for (let c = 0, name; c < cLen; c++) {
					name = activeCommands[c];
					if (
						!commandMapNodes.includes(name) &&
						commandTargets.get(name) &&
						commandTargets.get(name).filter(function (e) {
							return plugins[name] ? plugins[name].active(element, e) : false;
						}).length > 0
					) {
						commandMapNodes.push(name);
					}
				}
			}

			/** indent, outdent */
			if (this.format.isLine(element)) {
				/* Outdent */
				if (
					!commandMapNodes.includes('outdent') &&
					commandTargets.has('outdent') &&
					(domUtils.isListCell(element) || (element.style[marginDir] && numbers.get(element.style[marginDir], 0) > 0))
				) {
					if (
						commandTargets.get('outdent').filter(function (e) {
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
						commandTargets.get('indent').filter(function (e) {
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
	 * @param {Array|null} ignoredList Igonred button list
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
		if (this.subToolbar && !this.editor._notHideToolbar && !this.editor.frameContext.get('isFullScreen')) {
			this.subToolbar.hide();
		}
	},

	_isUneditableNode(range, isFront) {
		const container = isFront ? range.startContainer : range.endContainer;
		const offset = isFront ? range.startOffset : range.endOffset;
		const siblingKey = isFront ? 'previousSibling' : 'nextSibling';
		const isElement = container.nodeType === 1;
		let siblingNode;

		if (isElement) {
			siblingNode = this._isUneditableNode_getSibling(container.childNodes[offset], siblingKey, container);
			return siblingNode && siblingNode.nodeType === 1 && siblingNode.getAttribute('contenteditable') === 'false';
		} else {
			siblingNode = this._isUneditableNode_getSibling(container, siblingKey, container);
			return (
				domUtils.isEdgePoint(container, offset, isFront ? 'front' : 'end') &&
				siblingNode &&
				siblingNode.nodeType === 1 &&
				siblingNode.getAttribute('contenteditable') === 'false'
			);
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
		if (
			((sIsCell && !sCell.previousElementSibling && !sCell.parentElement.previousElementSibling) ||
				(eIsCell && !eCell.nextElementSibling && !eCell.parentElement.nextElementSibling)) &&
			sCell !== eCell
		) {
			if (!sIsCell) {
				domUtils.removeItem(
					domUtils.getParentElement(eCell, function (current) {
						return ancestor === current.parentNode;
					})
				);
			} else if (!eIsCell) {
				domUtils.removeItem(
					domUtils.getParentElement(sCell, function (current) {
						return ancestor === current.parentNode;
					})
				);
			} else {
				domUtils.removeItem(
					domUtils.getParentElement(sCell, function (current) {
						return ancestor === current.parentNode;
					})
				);
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
		if (this.editor._fileManager.pluginRegExp.test(this.editor.currentControllerName)) return;

		const range = this.selection.getRange();
		const commonCon = range.commonAncestorContainer;
		const startCon = range.startContainer;
		const rangeEl = this.format.getBlock(commonCon, null);
		let focusNode, offset, format;

		const fileComponent = domUtils.getParentElement(commonCon, this.component.is.bind(this.component));
		if (fileComponent && !domUtils.isTable(fileComponent)) {
			return;
		} else if (commonCon.nodeType === 1 && commonCon.getAttribute('data-se-embed') === 'true') {
			let el = commonCon.nextElementSibling;
			if (!this.format.isLine(el)) el = this.format.addLine(commonCon, this.options.get('defaultLine'));
			this.selection.setRange(el.firstChild, 0, el.firstChild, 0);
			return;
		}

		if (
			(this.format.isBlock(startCon) || domUtils.isWysiwygFrame(startCon)) &&
			(this.component.is(startCon.children[range.startOffset]) || this.component.is(startCon.children[range.startOffset - 1]))
		)
			return;
		if (domUtils.getParentElement(commonCon, domUtils.isExcludeFormat)) return null;

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

		this.editor.execCommand('formatBlock', false, formatName || this.options.get('defaultLine'));
		focusNode = domUtils.getEdgeChildNodes(commonCon, commonCon);
		focusNode = focusNode ? focusNode.ec : commonCon;

		format = this.format.getLine(focusNode, null);
		if (!format) {
			this.selection.removeRange();
			this.selection._init();
			return;
		}

		if (domUtils.isBreak(format.nextSibling)) domUtils.removeItem(format.nextSibling);
		if (domUtils.isBreak(format.previousSibling)) domUtils.removeItem(format.previousSibling);
		if (domUtils.isBreak(focusNode)) {
			const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
			focusNode.parentNode.insertBefore(zeroWidth, focusNode);
			focusNode = zeroWidth;
		}

		this.editor.effectNode = null;
		this.editor._nativeFocus();
	},

	_setDropLocationSelection(e) {
		if (e.rangeParent) {
			this.selection.setRange(e.rangeParent, e.rangeOffset, e.rangeParent, e.rangeOffset);
		} else if (this.editor.frameContext.get('_wd').caretRangeFromPoint) {
			const r = this.editor.frameContext.get('_wd').caretRangeFromPoint(e.clientX, e.clientY);
			this.selection.setRange(r.startContainer, r.startOffset, r.endContainer, r.endOffset);
		} else {
			const r = this.selection.getRange();
			this.selection.setRange(r.startContainer, r.startOffset, r.endContainer, r.endOffset);
		}
	},

	_dataTransferAction(type, e, data, frameContext) {
		let plainText, cleanData;
		plainText = data.getData('text/plain');
		cleanData = data.getData('text/html');
		try {
			this._setClipboardData(type, e, plainText, cleanData, data, frameContext);
			e.preventDefault();
			e.stopPropagation();
			return false;
		} catch (err) {
			console.warn('[SUNEDITOR.paste.error]', err);
		}
	},

	async _setClipboardData(type, e, plainText, cleanData, data, frameContext) {
		// MS word, OneNode, Excel
		const MSData =
			/class=["']*Mso(Normal|List)/i.test(cleanData) ||
			/content=["']*Word.Document/i.test(cleanData) ||
			/content=["']*OneNote.File/i.test(cleanData) ||
			/content=["']*Excel.Sheet/i.test(cleanData);
		const onlyText = !cleanData;

		if (!onlyText) {
			cleanData = cleanData.replace(/^<html>\r?\n?<body>\r?\n?\x3C!--StartFragment--\>|\x3C!--EndFragment-->\r?\n?<\/body\>\r?\n?<\/html>$/g, '');
			if (MSData) {
				cleanData = cleanData.replace(/\n/g, ' ');
				plainText = plainText.replace(/\n/g, ' ');
			}
			cleanData = this.html.clean(cleanData, false, null, null);
		} else {
			cleanData = converter.htmlToEntity(plainText).replace(/\n/g, '<br>');
		}

		const maxCharCount = this.char.test(this.editor.frameOptions.get('charCounter_type') === 'byte-html' ? cleanData : plainText);
		// user event - paste
		if (type === 'paste' && typeof this.events.onPaste === 'function') {
			const value = await this.events.onPaste({ frameContext, event: e, cleanData, maxCharCount });
			if (value === false) {
				return false;
			} else if (typeof value === 'string') {
				if (!value) return false;
				cleanData = value;
			}
			console.log('cleanData', cleanData);
		}
		// user event - drop
		if (type === 'drop' && typeof this.events.onDrop === 'function') {
			const value = await this.events.onDrop({ frameContext, event: e, cleanData, maxCharCount });
			if (value === false) {
				return false;
			} else if (typeof value === 'string') {
				if (!value) return false;
				cleanData = value;
			}
		}

		// files
		const files = data.files;
		if (files.length > 0 && !MSData) {
			if (/^image/.test(files[0].type) && this.plugins.image) {
				this.plugins.image.submitAction(files);
				this.editor.focus();
			}
			return false;
		}

		if (!maxCharCount) {
			return false;
		}

		if (cleanData) {
			this.html.insert(cleanData, false, true, true);
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
			this._toolbarObserver = new _w.ResizeObserver(() => {
				this.toolbar.resetResponsiveToolbar();
			});
			this._resizeObserver = new _w.ResizeObserver((entries) => {
				entries.forEach((e) => {
					this.editor.__callResizeFunction(this.editor.frameRoots.get(e.target.getAttribute('data-root-key')), -1, e);
				});
			});
		}

		/** window event */
		this.addEvent(_w, 'resize', OnResize_window.bind(this), false);
		this.addEvent(_w, 'scroll', OnScroll_window.bind(this), false);
	},

	_addFrameEvents(fc) {
		const eventWysiwyg = fc.get('options').get('iframe') ? fc.get('_ww') : fc.get('wysiwyg');
		fc.set('eventWysiwyg', eventWysiwyg);
		const codeArea = fc.get('code');

		/** editor area */
		const wwMouseDown = OnMouseDown_wysiwyg.bind(this, fc);
		const wwClickEvent = OnClick_wysiwyg.bind(this, fc);
		this.addEvent(eventWysiwyg, 'mousedown', wwMouseDown, false);
		this.addEvent(eventWysiwyg, 'click', wwClickEvent, false);
		this.addEvent(eventWysiwyg, 'input', OnInput_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'keydown', OnKeyDown_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'keyup', OnKeyUp_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'paste', OnPaste_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'copy', OnCopy_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'cut', OnCut_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'drop', OnDrop_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'scroll', OnScroll_wysiwyg.bind(this, fc, eventWysiwyg), false);
		this.addEvent(eventWysiwyg, 'focus', OnFocus_wysiwyg.bind(this, fc), false);
		this.addEvent(eventWysiwyg, 'blur', OnBlur_wysiwyg.bind(this, fc), false);
		this.addEvent(codeArea, 'mousedown', OnFocus_code.bind(this, fc), false);

		/** line breaker */
		this.addEvent(eventWysiwyg, 'mousemove', OnMouseMove_wysiwyg.bind(this, fc), false);
		this.addEvent(
			[fc.get('lineBreaker').querySelector('button'), fc.get('lineBreaker_t'), fc.get('lineBreaker_b')],
			'mousedown',
			function (e) {
				e.preventDefault();
			},
			false
		);
		this.addEvent(fc.get('lineBreaker').querySelector('button'), 'click', DisplayLineBreak.bind(this, ''), false);
		this.addEvent(fc.get('lineBreaker_t'), 'mousedown', DisplayLineBreak.bind(this, 't'), false);
		this.addEvent(fc.get('lineBreaker_b'), 'mousedown', DisplayLineBreak.bind(this, 'b'), false);

		/** Events are registered mobile. */
		this.addEvent(eventWysiwyg, 'touchstart', wwMouseDown, {
			passive: true,
			useCapture: false
		});
		this.addEvent(eventWysiwyg, 'touchend', wwClickEvent, {
			passive: true,
			useCapture: false
		});

		/** code view area auto line */
		if (this.editor.frameOptions.get('height') === 'auto' && !this.options.get('hasCodeMirror')) {
			const cvAuthHeight = this.editor._codeViewAutoHeight.bind(this.editor);
			this.addEvent(codeArea, 'keydown', cvAuthHeight, false);
			this.addEvent(codeArea, 'keyup', cvAuthHeight, false);
			this.addEvent(codeArea, 'paste', cvAuthHeight, false);
		}

		if (fc.has('statusbar')) this.__addStatusbarEvent(fc, fc.get('options'));

		const OnScrollAbs = OnScroll_Abs.bind(this);
		let scrollParent = fc.get('originElement');
		while ((scrollParent = domUtils.getScrollParent(scrollParent.parentElement))) {
			this.__scrollparents.push(scrollParent);
			this.addEvent(scrollParent, 'scroll', OnScrollAbs, false);
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

		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
			this._resizeObserver = null;
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
			const t_offset = (this.editor._lineBreaker_t.getAttribute('data-offset') || ',').split(',');
			if (t_style.display !== 'none') {
				t_style.top = numbers.get(t_offset[0], 0) - y + 'px';
				t_style.left = numbers.get(t_offset[1], 0) - x + 'px';
			}
		}

		if (this.editor._lineBreaker_b) {
			const b_style = this.editor._lineBreaker_b.style;
			const b_offset = (this.editor._lineBreaker_b.getAttribute('data-offset') || ',').split(',');
			if (b_style.display !== 'none') {
				b_style.top = numbers.get(b_offset[0], 0) - y + 'px';
				b_style.left = numbers.get(b_offset[1], 0) - x + 'px';
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
		if (this.__scrollID) _w.clearTimeout(this.__scrollID);

		for (let i = 0; i < openCont.length; i++) {
			if (openCont[i].notInCarrier) continue;
			openCont[i].inst.hide();
		}

		this.__scrollID = _w.setTimeout(() => {
			_w.clearTimeout(this.__scrollID);
			this.__scrollID = '';
			for (let i = 0; i < openCont.length; i++) {
				if (openCont[i].notInCarrier) continue;
				openCont[i].inst.show();
			}
		}, 250);
	},

	_resetFrameStatus() {
		if (!env.isResizeObserverSupported) {
			this.toolbar.resetResponsiveToolbar();
			if (this.options.get('_subMode')) this.subToolbar.resetResponsiveToolbar();
		}

		const toolbar = this.context.get('toolbar.main');
		const isToolbarHidden = toolbar.style.display === 'none' || (this.editor.isInline && !this.toolbar._inlineToolbarAttr.isShow);
		if (toolbar.offsetWidth === 0 && !isToolbarHidden) return;

		const fileBrowser = this.editor.frameContext.get('fileBrowser');
		if (fileBrowser && fileBrowser.area.style.display === 'block') {
			fileBrowser.body.style.maxHeight = _w.innerHeight - fileBrowser.header.offsetHeight - 50 + 'px';
		}

		if (this.menu.currentDropdownActiveButton && this.menu.currentDropdown) {
			this.menu._setMenuPosition(this.menu.currentDropdownActiveButton, this.menu.currentDropdown);
		}

		if (this.viewer._resetFullScreenHeight()) return;

		if (this.editor.frameContext.get('isCodeView') && this.editor.isInline) {
			this.toolbar._showInline();
			return;
		}

		this.editor._iframeAutoHeight(this.editor.frameContext);

		if (this.toolbar._sticky) {
			this.context.get('toolbar.main').style.width = this.editor.frameContext.get('topArea').offsetWidth - 2 + 'px';
			this.toolbar._resetSticky();
		}
	},

	_callPluginEvent(name, e) {
		const eventPlugins = this.editor._onPluginEvents.get(name);
		for (let i = 0; i < eventPlugins.length; i++) {
			if (eventPlugins[i](e) === false) return false;
		}
	},

	constructor: EventManager
};

function ButtonsHandler(e) {
	let target = e.target;
	if (this.menu._bindControllersOff) e.stopPropagation();

	if (/^(input|textarea|select|option)$/i.test(target.nodeName)) {
		this.editor._antiBlur = false;
	} else if (!this.editor.frameContext.get('wysiwyg').contains(this.selection.getNode())) {
		this.editor.focus();
	}

	if (domUtils.getParentElement(target, '.se-dropdown')) {
		e.stopPropagation();
		this.editor._notHideToolbar = true;
	} else {
		let command = target.getAttribute('data-command');
		let className = target.className;

		while (target && !command && !/(se-menu-list|sun-editor-common|se-menu-tray)/.test(className)) {
			target = target.parentNode;
			command = target.getAttribute('data-command');
			className = target.className;
		}

		if (!this.editor.frameContext.get('isCodeView')) {
			e.preventDefault();
			if (env.isGecko && command) {
				this._injectActiveEvent(target);
			}
		}

		if (command === this.menu.currentDropdownName || command === this.editor._containerName) {
			e.stopPropagation();
		}
	}
}

function OnClick_menuTray(e) {
	const target = domUtils.getCommandTarget(e.target);
	if (!target) return;

	let t = target;
	let k = '';
	while (t && !/se-menu-tray/.test(t.className) && !k) {
		t = t.parentElement;
		k = t.getAttribute('data-key');
	}
	if (!k) return;

	const plugin = this.plugins[k];
	if (!plugin || typeof plugin.action !== 'function') return;

	e.preventDefault();
	e.stopPropagation();
	plugin.action(target);
}

function OnClick_toolbar(e) {
	this.editor.runFromTarget(e.target);
}

function OnMouseDown_wysiwyg(frameContext, e) {
	if (frameContext.get('isReadOnly') || domUtils.isNonEditable(frameContext.get('wysiwyg'))) return;
	if (this.format._isExcludeSelectionElement(e.target)) {
		e.preventDefault();
		return;
	}

	setTimeout(this.selection._init.bind(this.selection));

	// user event
	if (typeof this.events.onMouseDown === 'function' && this.events.onMouseDown({ frameContext, event: e }) === false) return;

	// plugin event
	if (this._callPluginEvent('onMouseDown', { event: e }) === false) return;

	if (this.editor.isBalloon) {
		this._hideToolbar();
	} else if (this.editor.isSubBalloon) {
		this._hideToolbar_sub();
	}

	if (/FIGURE/i.test(e.target.nodeName)) e.preventDefault();
}

function OnClick_wysiwyg(frameContext, e) {
	const targetElement = e.target;

	if (frameContext.get('isReadOnly')) {
		e.preventDefault();
		if (domUtils.isAnchor(targetElement)) {
			_w.open(targetElement.href, targetElement.target);
		}
		return false;
	}

	if (domUtils.isNonEditable(this.editor.frameContext.get('wysiwyg'))) return;

	// user event
	if (typeof this.events.onClick === 'function' && this.events.onClick({ frameContext, event: e }) === false) return;
	// plugin event
	if (this._callPluginEvent('onClick', { event: e }) === false) return;

	const fileComponentInfo = this.component.get(targetElement);
	if (fileComponentInfo) {
		e.preventDefault();
		this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName, false);
		return;
	} else {
		this.component.currentTarget = null;
	}

	this.selection._init();

	if (e.detail === 3) {
		let range = this.selection.getRange();
		if (this.format.isLine(range.endContainer) && range.endOffset === 0) {
			range = this.selection.setRange(range.startContainer, range.startOffset, range.startContainer, range.startContainer.length);
			this.selection._rangeInfo(range, this.selection.get());
		}
	}

	const selectionNode = this.selection.getNode();
	const formatEl = this.format.getLine(selectionNode, null);
	const rangeEl = this.format.getBlock(selectionNode, null);
	if (!formatEl && !domUtils.isNonEditable(targetElement) && !domUtils.isList(rangeEl)) {
		const range = this.selection.getRange();
		if (this.format.getLine(range.startContainer) === this.format.getLine(range.endContainer)) {
			if (domUtils.isList(rangeEl)) {
				e.preventDefault();
				const prevLi = selectionNode.nextElementSibling;
				const oLi = domUtils.createElement('LI', null, selectionNode);
				rangeEl.insertBefore(oLi, prevLi);
				this.editor.focus();
			} else if (
				!domUtils.isWysiwygFrame(selectionNode) &&
				!this.component.is(selectionNode) &&
				(!domUtils.isTableElements(selectionNode) || domUtils.isTableCell(selectionNode)) &&
				this._setDefaultLine(this.format.isBlock(rangeEl) ? 'DIV' : this.options.get('defaultLine')) !== null
			) {
				e.preventDefault();
				this.editor.focus();
			} else {
				this.applyTagEffect();
			}
		}
	} else {
		this.applyTagEffect();
	}

	if (this.editor.isBalloon || this.editor.isSubBalloon) setTimeout(this._toggleToolbarBalloon.bind(this));
}

function OnInput_wysiwyg(frameContext, e) {
	if (frameContext.get('isReadOnly') || frameContext.get('isDisabled')) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	this.selection._init();

	const data = (e.data === null ? '' : e.data === undefined ? ' ' : e.data) || '';
	if (!this.char.test(data)) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	// user event
	if (typeof this.events.onInput === 'function' && this.events.onInput({ frameContext, event: e, data }) === false) return;
	// plugin event
	if (this._callPluginEvent('onInput', { event: e, data }) === false) return;

	this.history.push(true);
}

function OnKeyDown_wysiwyg(frameContext, e) {
	let selectionNode = this.selection.getNode();
	if (domUtils.isInputElement(selectionNode)) return;
	if (this.menu.currentDropdownName) return;

	const keyCode = e.keyCode;
	const shift = e.shiftKey;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	const alt = e.altKey;
	this.isComposing = keyCode === 229;

	if (!ctrl && frameContext.get('isReadOnly') && !DIRECTION_KEYCODE.test(keyCode)) {
		e.preventDefault();
		return false;
	}

	this.menu.dropdownOff();

	if (this.editor.isBalloon) {
		this._hideToolbar();
	} else if (this.editor.isSubBalloon) {
		this._hideToolbar_sub();
	}

	// user event
	if (typeof this.events.onKeyDown === 'function' && this.events.onKeyDown({ frameContext, event: e }) === false) return;

	/** Shortcuts */
	if (ctrl && this.shortcuts.command(keyCode, shift)) {
		this._onShortcutKey = true;
		e.preventDefault();
		e.stopPropagation();
		return false;
	} else if (this._onShortcutKey) {
		this._onShortcutKey = false;
	}

	/** default key action */
	const range = this.selection.getRange();
	const selectRange = !range.collapsed || range.startContainer !== range.endContainer;
	let formatEl = this.format.getLine(selectionNode, null) || selectionNode;
	let rangeEl = this.format.getBlock(formatEl, null);

	// plugin event
	if (this._callPluginEvent('onKeyDown', { event: e, range, line: formatEl }) === false) return;

	switch (keyCode) {
		case 8 /** backspace key */:
			if (selectRange && this._hardDelete()) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			if (
				!this.format.isLine(formatEl) &&
				!this.editor.frameContext.get('wysiwyg').firstElementChild &&
				!this.component.is(selectionNode) &&
				this._setDefaultLine(this.options.get('defaultLine')) !== null
			) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}

			if (
				!selectRange &&
				!formatEl.previousElementSibling &&
				range.startOffset === 0 &&
				!selectionNode.previousSibling &&
				!domUtils.isListCell(formatEl) &&
				this.format.isLine(formatEl) &&
				(!this.format.isBrLine(formatEl) || this.format.isClosureBrLine(formatEl))
			) {
				// closure range
				if (this.format.isClosureBlock(formatEl.parentNode)) {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
				// maintain default format
				if (domUtils.isWysiwygFrame(formatEl.parentNode) && formatEl.childNodes.length <= 1 && (!formatEl.firstChild || domUtils.isZeroWith(formatEl.textContent))) {
					e.preventDefault();
					e.stopPropagation();

					if (formatEl.nodeName.toUpperCase() === this.options.get('defaultLine').toUpperCase()) {
						formatEl.innerHTML = '<br>';
						const attrs = formatEl.attributes;
						while (attrs[0]) {
							formatEl.removeAttribute(attrs[0].name);
						}
					} else {
						formatEl.parentElement.replaceChild(domUtils.createElement(this.options.get('defaultLine'), null, '<br>'), formatEl);
					}

					this.editor._nativeFocus();
					return false;
				}
			}

			// clean remove tag
			const startCon = range.startContainer;
			if (formatEl && !formatEl.previousElementSibling && range.startOffset === 0 && startCon.nodeType === 3 && !this.format.isLine(startCon.parentNode)) {
				let prev = startCon.parentNode.previousSibling;
				const next = startCon.parentNode.nextSibling;
				if (!prev) {
					if (!next) {
						prev = domUtils.createElement('BR');
						formatEl.appendChild(prev);
					} else {
						prev = next;
					}
				}

				let con = startCon;
				while (formatEl.contains(con) && !con.previousSibling) {
					con = con.parentNode;
				}

				if (!formatEl.contains(con)) {
					startCon.textContent = '';
					this.nodeTransform.removeAllParents(startCon, null, formatEl);
					break;
				}
			}

			// tag[contenteditable='false']
			if (this._isUneditableNode(range, true)) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			// format attributes
			if (!selectRange && this.format.isEdgeLine(range.startContainer, range.startOffset, 'start')) {
				if (this.format.isLine(formatEl.previousElementSibling)) {
					this._formatAttrsTemp = formatEl.previousElementSibling.attributes;
				}
			}

			// nested list
			const commonCon = range.commonAncestorContainer;
			formatEl = this.format.getLine(range.startContainer, null);
			rangeEl = this.format.getBlock(formatEl, null);
			if (rangeEl && formatEl && !domUtils.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
				if (
					domUtils.isListCell(formatEl) &&
					domUtils.isList(rangeEl) &&
					(domUtils.isListCell(rangeEl.parentNode) || formatEl.previousElementSibling) &&
					(selectionNode === formatEl || (selectionNode.nodeType === 3 && (!selectionNode.previousSibling || domUtils.isList(selectionNode.previousSibling)))) &&
					(this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null)
						? rangeEl.contains(range.startContainer)
						: range.startOffset === 0 && range.collapsed)
				) {
					if (range.startContainer !== range.endContainer) {
						e.preventDefault();

						this.html.remove();
						if (range.startContainer.nodeType === 3) {
							this.selection.setRange(range.startContainer, range.startContainer.textContent.length, range.startContainer, range.startContainer.textContent.length);
						}

						this.history.push(true);
					} else {
						let prev = formatEl.previousElementSibling || rangeEl.parentNode;
						if (domUtils.isListCell(prev)) {
							e.preventDefault();

							let prevLast = prev;
							if (!prev.contains(formatEl) && domUtils.isListCell(prevLast) && domUtils.isList(prevLast.lastElementChild)) {
								prevLast = prevLast.lastElementChild.lastElementChild;
								while (domUtils.isListCell(prevLast) && domUtils.isList(prevLast.lastElementChild)) {
									prevLast = prevLast.lastElementChild && prevLast.lastElementChild.lastElementChild;
								}
								prev = prevLast;
							}

							let con = prev === rangeEl.parentNode ? rangeEl.previousSibling : prev.lastChild;
							if (!con) {
								con = domUtils.createTextNode(unicode.zeroWidthSpace);
								rangeEl.parentNode.insertBefore(con, rangeEl.parentNode.firstChild);
							}
							const offset = con.nodeType === 3 ? con.textContent.length : 1;
							const children = formatEl.childNodes;
							let after = con;
							let child = children[0];
							while ((child = children[0])) {
								prev.insertBefore(child, after.nextSibling);
								after = child;
							}

							domUtils.removeItem(formatEl);
							if (rangeEl.children.length === 0) domUtils.removeItem(rangeEl);

							this.selection.setRange(con, offset, con, offset);
							this.history.push(true);
						}
					}

					break;
				}

				// detach range
				if (!selectRange && range.startOffset === 0) {
					let detach = true;
					let comm = commonCon;
					while (comm && comm !== rangeEl && !domUtils.isWysiwygFrame(comm)) {
						if (comm.previousSibling) {
							if (comm.previousSibling.nodeType === 1 || !domUtils.isZeroWith(comm.previousSibling.textContent.trim())) {
								detach = false;
								break;
							}
						}
						comm = comm.parentNode;
					}

					if (detach && rangeEl.parentNode) {
						e.preventDefault();
						this.format.removeBlock(rangeEl, domUtils.isListCell(formatEl) ? [formatEl] : null, null, false, false);
						this.history.push(true);
						break;
					}
				}
			}

			// component
			if (!selectRange && formatEl && (range.startOffset === 0 || (selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : false))) {
				const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : selectionNode;
				const prev = formatEl.previousSibling;
				// select file component
				const ignoreZWS = (commonCon.nodeType === 3 || domUtils.isBreak(commonCon)) && !commonCon.previousSibling && range.startOffset === 0;
				if (sel && !sel.previousSibling && ((commonCon && this.component.is(commonCon.previousSibling)) || (ignoreZWS && this.component.is(prev)))) {
					const fileComponentInfo = this.component.get(prev);
					if (fileComponentInfo) {
						e.preventDefault();
						e.stopPropagation();
						if (formatEl.textContent.length === 0) domUtils.removeItem(formatEl);
						if (this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName, false) === false) this.editor.blur();
					} else if (this.component.is(prev)) {
						e.preventDefault();
						e.stopPropagation();
						domUtils.removeItem(prev);
					}
					break;
				}
				// delete nonEditable
				if (sel && domUtils.isNonEditable(sel.previousSibling)) {
					e.preventDefault();
					e.stopPropagation();
					domUtils.removeItem(sel.previousSibling);
					break;
				}
			}

			break;
		case 46 /** delete key */:
			if (selectRange && this._hardDelete()) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			// tag[contenteditable='false']
			if (this._isUneditableNode(range, false)) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			// component
			if (
				(this.format.isLine(selectionNode) ||
					selectionNode.nextSibling === null ||
					(domUtils.isZeroWith(selectionNode.nextSibling) && selectionNode.nextSibling.nextSibling === null)) &&
				range.startOffset === selectionNode.textContent.length
			) {
				const nextEl = formatEl.nextElementSibling;
				if (!nextEl) break;
				if (this.component.is(nextEl)) {
					e.preventDefault();

					if (domUtils.isZeroWith(formatEl)) {
						domUtils.removeItem(formatEl);
						// table component
						if (domUtils.isTable(nextEl)) {
							let cell = domUtils.getEdgeChild(nextEl, domUtils.isTableCell, false);
							cell = cell.firstElementChild || cell;
							this.selection.setRange(cell, 0, cell, 0);
							break;
						}
					}

					// select file component
					const fileComponentInfo = this.component.get(nextEl);
					if (fileComponentInfo) {
						e.stopPropagation();
						if (this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName, false) === false) this.editor.blur();
					} else if (this.component.is(nextEl)) {
						e.stopPropagation();
						domUtils.removeItem(nextEl);
					}

					break;
				}
			}

			if (!selectRange && (domUtils.isEdgePoint(range.endContainer, range.endOffset) || (selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : false))) {
				const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] || selectionNode : selectionNode;
				// delete nonEditable
				if (sel && domUtils.isNonEditable(sel.nextSibling)) {
					e.preventDefault();
					e.stopPropagation();
					domUtils.removeItem(sel.nextSibling);
					break;
				} else if (this.component.is(sel)) {
					e.preventDefault();
					e.stopPropagation();
					domUtils.removeItem(sel);
					break;
				}
			}

			// format attributes
			if (!selectRange && this.format.isEdgeLine(range.endContainer, range.endOffset, 'end')) {
				if (this.format.isLine(formatEl.nextElementSibling)) {
					this._formatAttrsTemp = formatEl.attributes;
				}
			}

			// nested list
			formatEl = this.format.getLine(range.startContainer, null);
			rangeEl = this.format.getBlock(formatEl, null);
			if (
				domUtils.isListCell(formatEl) &&
				domUtils.isList(rangeEl) &&
				(selectionNode === formatEl ||
					(selectionNode.nodeType === 3 &&
						(!selectionNode.nextSibling || domUtils.isList(selectionNode.nextSibling)) &&
						(this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null)
							? rangeEl.contains(range.endContainer)
							: range.endOffset === selectionNode.textContent.length && range.collapsed)))
			) {
				if (range.startContainer !== range.endContainer) this.html.remove();

				let next = domUtils.getArrayItem(formatEl.children, domUtils.isList, false);
				next = next || formatEl.nextElementSibling || rangeEl.parentNode.nextElementSibling;
				if (next && (domUtils.isList(next) || domUtils.getArrayItem(next.children, domUtils.isList, false))) {
					e.preventDefault();

					let con, children;
					if (domUtils.isList(next)) {
						const child = next.firstElementChild;
						children = child.childNodes;
						con = children[0];
						while (children[0]) {
							formatEl.insertBefore(children[0], next);
						}
						domUtils.removeItem(child);
					} else {
						con = next.firstChild;
						children = next.childNodes;
						while (children[0]) {
							formatEl.appendChild(children[0]);
						}
						domUtils.removeItem(next);
					}
					this.selection.setRange(con, 0, con, 0);
					this.history.push(true);
				}
				break;
			}

			break;
		case 9 /** tab key */:
			if (this.options.get('tabDisable')) break;
			e.preventDefault();
			if (ctrl || alt || domUtils.isWysiwygFrame(selectionNode)) break;

			const isEdge = !range.collapsed || domUtils.isEdgePoint(range.startContainer, range.startOffset);
			const selectedFormats = this.format.getLines(null);
			selectionNode = this.selection.getNode();
			const cells = [];
			let lines = [];
			let fc = domUtils.isListCell(selectedFormats[0]),
				lc = domUtils.isListCell(selectedFormats[selectedFormats.length - 1]);
			let r = {
				sc: range.startContainer,
				so: range.startOffset,
				ec: range.endContainer,
				eo: range.endOffset
			};
			for (let i = 0, len = selectedFormats.length, f; i < len; i++) {
				f = selectedFormats[i];
				if (domUtils.isListCell(f)) {
					if (!f.previousElementSibling && !shift) {
						continue;
					} else {
						cells.push(f);
					}
				} else {
					lines.push(f);
				}
			}

			// Nested list
			if (cells.length > 0 && isEdge) {
				r = this.format._applyNestedList(cells, shift);
			}

			// Lines tab(4)
			if (lines.length > 0) {
				if (!shift) {
					const tabText = domUtils.createTextNode(new Array(this.status.tabSize + 1).join('\u00A0'));
					if (lines.length === 1) {
						const textRange = this.html.insertNode(tabText, null, false);
						if (!textRange) return false;
						if (!fc) {
							r.sc = tabText;
							r.so = textRange.endOffset;
						}
						if (!lc) {
							r.ec = tabText;
							r.eo = textRange.endOffset;
						}
					} else {
						const len = lines.length - 1;
						for (let i = 0, child; i <= len; i++) {
							child = lines[i].firstChild;
							if (!child) continue;

							if (domUtils.isBreak(child)) {
								lines[i].insertBefore(tabText.cloneNode(false), child);
							} else {
								child.textContent = tabText.textContent + child.textContent;
							}
						}

						const firstChild = domUtils.getEdgeChild(lines[0], 'text', false);
						const endChild = domUtils.getEdgeChild(lines[len], 'text', true);
						if (!fc && firstChild) {
							r.sc = firstChild;
							r.so = 0;
						}
						if (!lc && endChild) {
							r.ec = endChild;
							r.eo = endChild.textContent.length;
						}
					}
				} else {
					const len = lines.length - 1;
					for (let i = 0, line; i <= len; i++) {
						line = lines[i].childNodes;
						for (let c = 0, cLen = line.length, child; c < cLen; c++) {
							child = line[c];
							if (!child) break;
							if (domUtils.isZeroWith(child)) continue;

							if (/^\s{1,4}$/.test(child.textContent)) {
								domUtils.removeItem(child);
							} else if (/^\s{1,4}/.test(child.textContent)) {
								child.textContent = child.textContent.replace(/^\s{1,4}/, '');
							}

							break;
						}
					}

					const firstChild = domUtils.getEdgeChild(lines[0], 'text', false);
					const endChild = domUtils.getEdgeChild(lines[len], 'text', true);
					if (!fc && firstChild) {
						r.sc = firstChild;
						r.so = 0;
					}
					if (!lc && endChild) {
						r.ec = endChild;
						r.eo = endChild.textContent.length;
					}
				}
			}

			this.selection.setRange(r.sc, r.so, r.ec, r.eo);
			this.history.push(false);

			break;
		case 13 /** enter key */:
			const brBlock = this.format.getBrLine(selectionNode, null);

			if (this.editor.frameOptions.get('charCounter_type') === 'byte-html') {
				let enterHTML = '';
				if ((!shift && brBlock) || shift) {
					enterHTML = '<br>';
				} else {
					enterHTML = '<' + formatEl.nodeName + '><br></' + formatEl.nodeName + '>';
				}

				if (!this.char.check(enterHTML)) {
					e.preventDefault();
					return false;
				}
			}

			if (!shift) {
				const formatEndEdge = this.format.isEdgeLine(range.endContainer, range.endOffset, 'end');
				const formatStartEdge = this.format.isEdgeLine(range.startContainer, range.startOffset, 'start');

				// add default format line
				if (formatEndEdge && (/^H[1-6]$/i.test(formatEl.nodeName) || /^HR$/i.test(formatEl.nodeName))) {
					e.preventDefault();
					let temp = null;
					const newFormat = this.format.addLine(formatEl, this.options.get('defaultLine'));

					if (formatEndEdge && formatEndEdge.length > 0) {
						temp = formatEndEdge.pop();
						const innerNode = temp;
						while (formatEndEdge.length > 0) {
							temp = temp.appendChild(formatEndEdge.pop());
						}
						newFormat.appendChild(innerNode);
					}

					temp = !temp ? newFormat.firstChild : temp.appendChild(newFormat.firstChild);
					this.selection.setRange(temp, 0, temp, 0);
					break;
				} else if (rangeEl && formatEl && !domUtils.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
					const range = this.selection.getRange();
					if (domUtils.isEdgePoint(range.endContainer, range.endOffset) && domUtils.isList(selectionNode.nextSibling)) {
						e.preventDefault();
						const br = domUtils.createElement('BR');
						const newEl = domUtils.createElement('LI', null, br);

						formatEl.parentNode.insertBefore(newEl, formatEl.nextElementSibling);
						newEl.appendChild(selectionNode.nextSibling);

						this.selection.setRange(br, 1, br, 1);
						break;
					}

					if (
						(range.commonAncestorContainer.nodeType === 3 ? !range.commonAncestorContainer.nextElementSibling : true) &&
						domUtils.isZeroWith(formatEl.innerText.trim()) &&
						!domUtils.isListCell(formatEl.nextElementSibling)
					) {
						e.preventDefault();
						let newEl = null;

						if (domUtils.isListCell(rangeEl.parentNode)) {
							rangeEl = formatEl.parentNode.parentNode.parentNode;
							newEl = this.nodeTransform.split(formatEl, null, domUtils.getNodeDepth(formatEl) - 2);
							if (!newEl) {
								const newListCell = domUtils.createElement('LI', null, '<br>');
								rangeEl.insertBefore(newListCell, newEl);
								newEl = newListCell;
							}
						} else {
							const newFormat = domUtils.isTableCell(rangeEl.parentNode)
								? 'DIV'
								: domUtils.isList(rangeEl.parentNode)
								? 'LI'
								: this.format.isLine(rangeEl.nextElementSibling) && !this.format.isBlock(rangeEl.nextElementSibling)
								? rangeEl.nextElementSibling.nodeName
								: this.format.isLine(rangeEl.previousElementSibling) && !this.format.isBlock(rangeEl.previousElementSibling)
								? rangeEl.previousElementSibling.nodeName
								: this.options.get('defaultLine');

							newEl = domUtils.createElement(newFormat);
							const edge = this.format.removeBlock(rangeEl, [formatEl], null, true, true);
							edge.cc.insertBefore(newEl, edge.ec);
						}

						newEl.innerHTML = '<br>';
						this.nodeTransform.removeAllParents(formatEl, null, null);
						this.selection.setRange(newEl, 1, newEl, 1);
						break;
					}
				}

				if (brBlock) {
					e.preventDefault();
					const selectionFormat = selectionNode === brBlock;
					const wSelection = this.selection.get();
					const children = selectionNode.childNodes,
						offset = wSelection.focusOffset,
						prev = selectionNode.previousElementSibling,
						next = selectionNode.nextSibling;

					if (
						!this.format.isClosureBrLine(brBlock) &&
						children &&
						((selectionFormat &&
							range.collapsed &&
							children.length - 1 <= offset + 1 &&
							domUtils.isBreak(children[offset]) &&
							(!children[offset + 1] ||
								((!children[offset + 2] || domUtils.isZeroWith(children[offset + 2].textContent)) &&
									children[offset + 1].nodeType === 3 &&
									domUtils.isZeroWith(children[offset + 1].textContent))) &&
							offset > 0 &&
							domUtils.isBreak(children[offset - 1])) ||
							(!selectionFormat &&
								domUtils.isZeroWith(selectionNode.textContent) &&
								domUtils.isBreak(prev) &&
								(domUtils.isBreak(prev.previousSibling) || !domUtils.isZeroWith(prev.previousSibling.textContent)) &&
								(!next || (!domUtils.isBreak(next) && domUtils.isZeroWith(next.textContent)))))
					) {
						if (selectionFormat) domUtils.removeItem(children[offset - 1]);
						else domUtils.removeItem(selectionNode);
						const newEl = this.format.addLine(
							brBlock,
							this.format.isLine(brBlock.nextElementSibling) && !this.format.isBlock(brBlock.nextElementSibling) ? brBlock.nextElementSibling : null
						);
						domUtils.copyFormatAttributes(newEl, brBlock);
						this.selection.setRange(newEl, 1, newEl, 1);
						break;
					}

					if (selectionFormat) {
						this.html.insert(range.collapsed && domUtils.isBreak(range.startContainer.childNodes[range.startOffset - 1]) ? '<br>' : '<br><br>', false, true, true);

						let focusNode = wSelection.focusNode;
						const wOffset = wSelection.focusOffset;
						if (brBlock === focusNode) {
							focusNode = focusNode.childNodes[wOffset - offset > 1 ? wOffset - 1 : wOffset];
						}

						this.selection.setRange(focusNode, 1, focusNode, 1);
					} else {
						const focusNext = wSelection.focusNode.nextSibling;
						const br = domUtils.createElement('BR');
						this.html.insertNode(br, null, true);

						const brPrev = br.previousSibling,
							brNext = br.nextSibling;
						if (!domUtils.isBreak(focusNext) && !domUtils.isBreak(brPrev) && (!brNext || domUtils.isZeroWith(brNext))) {
							br.parentNode.insertBefore(br.cloneNode(false), br);
							this.selection.setRange(br, 1, br, 1);
						} else {
							this.selection.setRange(brNext, 0, brNext, 0);
						}
					}

					this._onShortcutKey = true;
					break;
				}

				// set format attrs - edge
				if (range.collapsed && (formatStartEdge || formatEndEdge)) {
					e.preventDefault();
					const focusBR = domUtils.createElement('BR');
					const newFormat = domUtils.createElement(formatEl.nodeName, null, focusBR);

					domUtils.copyTagAttributes(newFormat, formatEl, this.options.get('lineAttrReset'));

					let child = focusBR;
					do {
						if (!domUtils.isBreak(selectionNode) && selectionNode.nodeType === 1) {
							const f = selectionNode.cloneNode(false);
							f.appendChild(child);
							child = f;
						}
						selectionNode = selectionNode.parentNode;
					} while (formatEl !== selectionNode && formatEl.contains(selectionNode));

					newFormat.appendChild(child);
					formatEl.parentNode.insertBefore(newFormat, formatStartEdge && !formatEndEdge ? formatEl : formatEl.nextElementSibling);
					if (formatEndEdge) {
						this.selection.setRange(focusBR, 1, focusBR, 1);
					}

					break;
				}

				if (formatEl) {
					e.stopPropagation();

					let newEl;
					let offset = 0;
					if (!range.collapsed) {
						const isMultiLine = this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null);
						const newFormat = formatEl.cloneNode(false);
						newFormat.innerHTML = '<br>';
						const r = this.html.remove();
						newEl = this.format.getLine(r.container, null);
						if (!newEl) {
							if (domUtils.isWysiwygFrame(r.container)) {
								e.preventDefault();
								this.editor.frameContext.get('wysiwyg').appendChild(newFormat);
								newEl = newFormat;
								domUtils.copyTagAttributes(newEl, formatEl, this.options.get('lineAttrReset'));
								this.selection.setRange(newEl, offset, newEl, offset);
							}
							break;
						}

						const innerRange = this.format.getBlock(r.container);
						newEl = newEl.contains(innerRange) ? domUtils.getEdgeChild(innerRange, this.format.getLine.bind(this.format)) : newEl;
						if (isMultiLine) {
							if (formatEndEdge && !formatStartEdge) {
								newEl.parentNode.insertBefore(newFormat, !r.prevContainer || r.container === r.prevContainer ? newEl.nextElementSibling : newEl);
								newEl = newFormat;
								offset = 0;
							} else {
								offset = r.offset;
								if (formatStartEdge) {
									const tempEl = newEl.parentNode.insertBefore(newFormat, newEl);
									if (formatEndEdge) {
										newEl = tempEl;
										offset = 0;
									}
								}
							}
						} else {
							if (formatEndEdge && formatStartEdge) {
								newEl.parentNode.insertBefore(newFormat, r.prevContainer && r.container === r.prevContainer ? newEl.nextElementSibling : newEl);
								newEl = newFormat;
								offset = 0;
							} else {
								newEl = this.nodeTransform.split(r.container, r.offset, domUtils.getNodeDepth(formatEl));
							}
						}
					} else {
						if (domUtils.isZeroWith(formatEl)) {
							newEl = this.format.addLine(formatEl, formatEl.cloneNode(false));
						} else {
							newEl = this.nodeTransform.split(range.endContainer, range.endOffset, domUtils.getNodeDepth(formatEl));
						}
					}

					e.preventDefault();
					domUtils.copyTagAttributes(newEl, formatEl, this.options.get('lineAttrReset'));
					this.selection.setRange(newEl, offset, newEl, offset);

					break;
				}
			}

			if (selectRange) break;

			if (rangeEl && domUtils.getParentElement(rangeEl, 'FIGCAPTION') && domUtils.getParentElement(rangeEl, domUtils.isList)) {
				e.preventDefault();
				formatEl = this.format.addLine(formatEl, null);
				this.selection.setRange(formatEl, 0, formatEl, 0);
			}

			break;
	}

	if (shift && (env.isOSX_IOS ? alt : ctrl) && keyCode === 32) {
		e.preventDefault();
		e.stopPropagation();
		const nbsp = this.html.insertNode(domUtils.createTextNode('\u00a0'), null, true);
		if (nbsp && nbsp.container) {
			this.selection.setRange(nbsp.container, nbsp.endOffset, nbsp.container, nbsp.endOffset);
			return;
		}
	}

	if (!ctrl && !alt && !selectRange && !NON_TEXT_KEYCODE.test(keyCode) && domUtils.isBreak(range.commonAncestorContainer)) {
		const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
		this.html.insertNode(zeroWidth, null, true);
		this.selection.setRange(zeroWidth, 1, zeroWidth, 1);
	}

	if (SPACE_DEL_DIR_KEYCODE.test(keyCode)) {
		this.selection._init();
		this.applyTagEffect();
	}
}

function OnKeyUp_wysiwyg(frameContext, e) {
	if (this._onShortcutKey || this.menu.currentDropdownName) return;

	this.selection._init();
	const keyCode = e.keyCode;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	const alt = e.altKey;

	if (!ctrl && DIRECTION_KEYCODE.test(keyCode)) {
		this.selection._init();
		this.applyTagEffect();
	}

	if (frameContext.get('isReadOnly')) return;

	const range = this.selection.getRange();
	let selectionNode = this.selection.getNode();

	if ((this.editor.isBalloon || this.editor.isSubBalloon) && (((this.editor.isBalloonAlways || this.editor.isSubBalloonAlways) && keyCode !== 27) || !range.collapsed)) {
		if (this.editor.isBalloonAlways || this.editor.isSubBalloonAlways) {
			if (keyCode !== 27) this._showToolbarBalloonDelay();
		} else {
			if (this.editor.isSubBalloon) this.subToolbar._showBalloon();
			else this.toolbar._showBalloon();
			return;
		}
	}

	/** when format tag deleted */
	if (keyCode === 8 && domUtils.isWysiwygFrame(selectionNode) && selectionNode.textContent === '' && selectionNode.children.length === 0) {
		e.preventDefault();
		e.stopPropagation();

		selectionNode.innerHTML = '';

		const oFormatTag = domUtils.createElement(this.format.isLine(this.status.currentNodes[0]) ? this.status.currentNodes[0] : this.options.get('defaultLine'), null, '<br>');
		selectionNode.appendChild(oFormatTag);
		this.selection.setRange(oFormatTag, 0, oFormatTag, 0);
		this.applyTagEffect();

		this.history.push(false);
		return;
	}

	const formatEl = this.format.getLine(selectionNode, null);
	const rangeEl = this.format.getBlock(selectionNode, null);
	const attrs = this._formatAttrsTemp;

	if (formatEl && attrs) {
		for (let i = 0, len = attrs.length; i < len; i++) {
			if (keyCode === 13 && /^id$/i.test(attrs[i].name)) {
				formatEl.removeAttribute('id');
				continue;
			}
			formatEl.setAttribute(attrs[i].name, attrs[i].value);
		}
		this._formatAttrsTemp = null;
	}

	if (
		!formatEl &&
		range.collapsed &&
		!this.component.is(selectionNode) &&
		!domUtils.isList(selectionNode) &&
		this._setDefaultLine(this.format.isBlock(rangeEl) ? 'DIV' : this.options.get('defaultLine')) !== null
	) {
		selectionNode = this.selection.getNode();
	}

	const textKey = !ctrl && !alt && !NON_TEXT_KEYCODE.test(keyCode);
	if (textKey && selectionNode.nodeType === 3 && unicode.zeroWidthRegExp.test(selectionNode.textContent) && !(e.isComposing !== undefined ? e.isComposing : this.isComposing)) {
		let so = range.startOffset,
			eo = range.endOffset;
		const frontZeroWidthCnt = (selectionNode.textContent.substring(0, eo).match(FRONT_ZEROWIDTH) || '').length;
		so = range.startOffset - frontZeroWidthCnt;
		eo = range.endOffset - frontZeroWidthCnt;
		selectionNode.textContent = selectionNode.textContent.replace(unicode.zeroWidthRegExp, '');
		this.selection.setRange(selectionNode, so < 0 ? 0 : so, selectionNode, eo < 0 ? 0 : eo);
	}

	this.char.test('');

	// user event
	if (typeof this.events.onKeyUp === 'function' && this.events.onKeyUp({ frameContext, event: e }) === false) return;
	// plugin event
	if (this._callPluginEvent('onKeyUp', { event: e, range, line: formatEl }) === false) return;

	if (!ctrl && !alt && !HISTORY_IGNORE_KEYCODE.test(keyCode)) {
		this.history.push(true);
	}
}

function OnPaste_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;
	if (!clipboardData) return true;
	return this._dataTransferAction('paste', e, clipboardData, frameContext);
}

function OnCopy_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;

	// user event
	if (typeof this.events.onCopy === 'function' && this.events.onCopy({ frameContext, event: e, clipboardData }) === false) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
}

function OnDrop_wysiwyg(frameContext, e) {
	if (frameContext.get('isReadOnly')) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const dataTransfer = e.dataTransfer;
	if (!dataTransfer) return true;

	this.html.remove();
	this._setDropLocationSelection(e);
	return this._dataTransferAction('drop', e, dataTransfer, frameContext);
}

function OnCut_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;

	// user event
	if (typeof this.events.onCut === 'function' && this.events.onCut({ frameContext, event: e, clipboardData }) === false) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	setTimeout(() => {
		this.history.push(false);
	});
}

function OnScroll_wysiwyg(frameContext, eventWysiwyg, e) {
	this._moveContainer(eventWysiwyg);
	this._scrollContainer();
	// user event
	if (typeof this.events.onScroll === 'function') this.events.onScroll({ frameContext, event: e });
}

function OnFocus_wysiwyg(frameContext, e) {
	const rootKey = frameContext.get('key');
	if (this.status.rootKey === rootKey && this.editor._antiBlur) return;
	this.editor._offCurrentController();
	this.status.hasFocus = true;

	domUtils.removeClass(this.editor.commandTargets.get('codeView'), 'active');
	domUtils.setDisabled(this.editor._codeViewDisabledButtons, false);

	this.editor.changeFrameContext(rootKey);
	this.history.resetButtons(rootKey, null);

	setTimeout(() => {
		this.applyTagEffect();

		if (this.editor.isInline) this.toolbar._showInline();

		// user event
		if (typeof this.events.onFocus === 'function') this.events.onFocus({ frameContext, event: e });
		// plugin event
		this._callPluginEvent('onFocus', { event: e });
	});
}

function OnBlur_wysiwyg(frameContext, e) {
	if (this.editor._antiBlur || frameContext.get('isCodeView')) return;

	this.status.hasFocus = false;
	this.editor.effectNode = null;
	this.editor._offCurrentController();
	if (this.editor.isInline || this.editor.isBalloon) this._hideToolbar();
	if (this.editor.isSubBalloon) this._hideToolbar_sub();

	this._setKeyEffect([]);

	this.status.currentNodes = [];
	this.status.currentNodesMap = [];

	this.editor.applyFrameRoots((e) => {
		if (e.get('navigation')) e.get('navigation').textContent = '';
	});

	this.history.check(frameContext.get('key'), this.status._range);

	// user event
	if (typeof this.events.onBlur === 'function') this.events.onBlur({ frameContext, event: e });
	// plugin event
	this._callPluginEvent('onBlur', { event: e });
}

function OnMouseMove_wysiwyg(frameContext, e) {
	if (frameContext.get('isReadOnly') || frameContext.get('isDisabled')) return false;

	const info = this.component.get(e.target);
	if (info && !domUtils.hasClass(info.cover, 'se-non-select-figure')) {
		const container = info.container;
		const lineBreakerStyle = frameContext.get('lineBreaker').style;

		if (container && !this.editor.currentControllerName) {
			const fc = this.editor.frameContext;
			let scrollTop = 0;
			let el = fc.get('wysiwyg');
			do {
				scrollTop += el.scrollTop;
				el = el.parentElement;
			} while (el && !/^(BODY|HTML)$/i.test(el.nodeName));

			const toolbarH = this.editor.isClassic && !this.options.get('toolbar_container') ? this.context.get('toolbar.main').offsetHeight : 0;
			const wScroll = fc.get('wysiwyg').scrollTop;
			const offsets = this.offset.getGlobal(fc.get('topArea'));
			const componentTop = this.offset.get(container).top + wScroll - toolbarH;
			const y = e.pageY + scrollTop + (this.editor.frameOptions.get('iframe') && !this.options.get('toolbar_container') ? this.context.get('toolbar.main').offsetHeight : 0);
			const c = componentTop + (this.editor.frameOptions.get('iframe') ? scrollTop : offsets.top);

			const isList = domUtils.isListCell(container.parentNode);
			let dir = '',
				top = '';
			if ((isList ? !container.previousSibling : !this.format.isLine(container.previousElementSibling)) && y < c + toolbarH + 20) {
				top = componentTop - 1;
				dir = 't';
			} else if ((isList ? !container.nextSibling : !this.format.isLine(container.nextElementSibling)) && y > c + container.offsetHeight + toolbarH - 20) {
				top = componentTop + container.offsetHeight - 1;
				dir = 'b';
			} else {
				lineBreakerStyle.display = 'none';
				return;
			}

			this._lineBreakComp = container;
			this._lineBreakDir = dir;
			lineBreakerStyle.top = top - wScroll + 'px';
			this.editor._lineBreakerButton.style.left = this.offset.get(container).left + container.offsetWidth / 2 - 15 + 'px';
			lineBreakerStyle.display = 'block';

			return;
		} else if (lineBreakerStyle.display !== 'none') {
			lineBreakerStyle.display = 'none';
		}
	}

	this._callPluginEvent('onMouseMove', { event: e });
}

function OnMouseDown_statusbar(e) {
	e.stopPropagation();
	this._resizeClientY = e.clientY;
	this.editor.enableBackWrapper('ns-resize');
	this.__resize_editor = this.addGlobalEvent('mousemove', __resizeEditor.bind(this));
	this.__close_move = this.addGlobalEvent('mouseup', __closeMove.bind(this));
}

function __resizeEditor(e) {
	const resizeInterval = this.editor.frameContext.get('wrapper').offsetHeight + (e.clientY - this._resizeClientY);
	const h = resizeInterval < this.editor.frameContext.get('_minHeight') ? this.editor.frameContext.get('_minHeight') : resizeInterval;
	this.editor.frameContext.get('wysiwygFrame').style.height = this.editor.frameContext.get('code').style.height = h + 'px';
	this._resizeClientY = e.clientY;
	if (!env.isResizeObserverSupported) this.editor.__callResizeFunction(h, null);
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
	this.editor.frameContext.get('lineBreaker').style.display = 'none';

	this.component.close();

	const focusEl = isList ? format : format.firstChild;
	this.selection.setRange(focusEl, 1, focusEl, 1);
	this.history.push(false);
}

function OnResize_window() {
	this.editor._offCurrentController();
	if (this.editor.isBalloon) this.toolbar.hide();
	else if (this.editor.isSubBalloon) this.subToolbar.hide();
	else this._resetFrameStatus();
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