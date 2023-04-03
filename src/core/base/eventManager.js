/**
 * @fileoverview eventManager class
 * @author Yi JiHong.
 */

import CoreDependency from '../../dependency/_core';
import {
	domUtils,
	unicode,
	numbers,
	env,
	converter
} from '../../helper';

const _w = env._w;
const DIRECTION_KEYCODE = new _w.RegExp('^(3[3-9]|40)$');
const SPACE_DEL_DIR_KEYCODE = new _w.RegExp('^(8|13|3[2-9]|40|46)$');
const NON_TEXT_KEYCODE = new _w.RegExp('^(8|13|1[6-9]|20|27|3[3-9]|40|45|46|11[2-9]|12[0-3]|144|145)$');
const HISTORY_IGNORE_KEYCODE = new _w.RegExp('^(1[6-9]|20|27|3[3-9]|40|45|11[2-9]|12[0-3]|144|145)$');
const FRONT_ZEROWIDTH = new _w.RegExp(unicode.zeroWidthSpace + '+', '');

const EventManager = function (editor) {
	CoreDependency.call(this, editor);
	this._events = [];
	this._onButtonsCheck = new _w.RegExp('^(' + _w.Object.keys(editor.options.get('_styleNodeMap')).join('|') + ')$', 'i');
	this._onShortcutKey = false;
	this._IEisComposing = false; // In IE, there is no 'e.isComposing' in the key-up event.
	this._balloonDelay = null;
	this._resizeObserver = null;
	this._toolbarObserver = null;
	this._onMousedownPlugins = editor._onMousedownPlugins;
	this._onKeyDownPlugins = editor._onKeyDownPlugins;
	this._lineBreakerButton = null;
	this._lineBreaker_t = null;
	this._lineBreaker_b = null;
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
	addEvent: function (target, type, listener, useCapture) {
		if (!target) return false;
		if (!numbers.is(target.length) || target.nodeName || (!_w.Array.isArray(target) && target.length < 1)) target = [target];
		if (target.length === 0) return false;

		for (let i = 0, len = target.length; i < len; i++) {
			target[i].addEventListener(type, listener, useCapture);
			this._events.push({
				target: target[i],
				type: type,
				handler: listener,
				useCapture: useCapture
			});
		}

		return true;
	},

	/**
	 * @description Add an event to document.
	 * When created as an Iframe, the same event is added to the document in the Iframe.
	 * @param {string} type Event type
	 * @param {Function} listener Event listener
	 * @param {boolean|undefined} useCapture Use event capture
	 * @return {type, listener, useCapture}
	 */
	addGlobalEvent: function (type, listener, useCapture) {
		if (this.options.get('iframe')) {
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
	removeGlobalEvent: function (type, listener, useCapture) {
		if (typeof type === 'object') {
			listener = type.listener;
			useCapture = type.useCapture;
			type = type.type;
		}
		if (this.options.get('iframe')) {
			this.editor.frameContext.get('_ww').removeEventListener(type, listener, useCapture);
		}
		this._w.removeEventListener(type, listener, useCapture);
	},

	/**
	 * @description Activates the corresponding button with the tags information of the current cursor position,
	 * such as 'bold', 'underline', etc., and executes the 'active' method of the plugins.
	 */
	applyTagEffect: function () {
		let selectionNode = this.selection.getNode();
		if (selectionNode === this.editor.effectNode) return;
		this.editor.effectNode = selectionNode;

		const marginDir = this.options.get('_rtl') ? 'marginRight' : 'marginLeft';
		const plugins = this.plugins;
		const _commandMap = this.editor._commandMap;
		const classOnCheck = this._onButtonsCheck;
		const commandMapNodes = [];
		const currentNodes = [];

		const activePlugins = this.editor.activePlugins;
		const cLen = activePlugins.length;
		let nodeName = '';

		while (selectionNode.firstChild) {
			selectionNode = selectionNode.firstChild;
		}

		for (let element = selectionNode; !domUtils.isWysiwygFrame(element); element = element.parentNode) {
			if (!element) break;
			if (element.nodeType !== 1 || domUtils.isBreak(element)) continue;
			nodeName = element.nodeName.toUpperCase();
			currentNodes.push(nodeName);

			/* Active plugins */
			if (!this.status.isReadOnly) {
				for (let c = 0, name; c < cLen; c++) {
					name = activePlugins[c];
					if (commandMapNodes.indexOf(name) === -1 && _commandMap.get(name) && _commandMap.get(name).filter(function (e) {
							return plugins[name].active(element, e);
						}).length > 0) {
						commandMapNodes.push(name);
					}
				}
			}

			/** indent, outdent */
			if (this.format.isLine(element)) {
				/* Outdent */
				if (commandMapNodes.indexOf('OUTDENT') === -1 && _commandMap.get('OUTDENT') && (domUtils.isListCell(element) || (element.style[marginDir] && numbers.get(element.style[marginDir], 0) > 0))) {
					if (_commandMap.get('OUTDENT').filter(function (e) {
							if (domUtils.isImportantDisabled(e)) return false;
							e.removeAttribute('disabled');
							return true;
						}).length > 0) {
						commandMapNodes.push('OUTDENT');
					}
				}

				/* Indent */
				if (commandMapNodes.indexOf('INDENT') === -1 && _commandMap.get('INDENT')) {
					const indentDisable = domUtils.isListCell(element) && !element.previousElementSibling
					if (_commandMap.get('INDENT').filter(function (e) {
							if (domUtils.isImportantDisabled(e)) return false;
							if (indentDisable) {
								e.setAttribute('disabled', true);
							} else {
								e.removeAttribute('disabled');
							}
							return true;
						}).length > 0) {
						commandMapNodes.push('INDENT');
					}

				}

				continue;
			}

			/** default active buttons [strong, ins, em, del, sub, sup] */
			if (classOnCheck.test(nodeName)) {
				commandMapNodes.push(nodeName);
				domUtils.addClass(_commandMap.get(nodeName), 'active');
			}
		}

		this._setKeyEffect(commandMapNodes, plugins, _commandMap);

		/** save current nodes */
		this.status.currentNodes = currentNodes.reverse();
		this.status.currentNodesMap = commandMapNodes;

		/**  Displays the current node structure to statusbar */
		if (this.editor.frameOptions.get('statusbar_showPathLabel') && this.editor.frameContext.get('navigation')) this.editor.frameContext.get('navigation').textContent = this.status.currentNodes.join(' > ');
	},

	/**
	 * @description remove class, display text.
	 * @param {Array|null} ignoredList Igonred button list
	 * @private
	 */
	_setKeyEffect: function (ignoredList, plugins, _commandMap) {
		const activePlugins = this.editor.activePlugins;

		_commandMap.forEach(
			function (e, k) {
				if (ignoredList.indexOf(k) > -1 || !e || e.length === 0) return;
				e.forEach(function (v) {
					if (activePlugins.indexOf(k) > -1) {
						plugins[k].active(null, v);
					} else if (/^OUTDENT$/i.test(k)) {
						if (!domUtils.isImportantDisabled(v)) v.setAttribute('disabled', true);
					} else if (/^INDENT$/i.test(k)) {
						if (!domUtils.isImportantDisabled(v)) v.removeAttribute('disabled');
					} else {
						domUtils.removeClass(v, 'active');
					}
				});
			}
		);
	},

	_showToolbarBalloonDelay: function () {
		if (this._balloonDelay) {
			_w.clearTimeout(this._balloonDelay);
		}

		this._balloonDelay = _w.setTimeout(
			function () {
				_w.clearTimeout(this._balloonDelay);
				this._balloonDelay = null;
				this.toolbar._showBalloon();
			}.bind(this),
			250
		);
	},

	_toggleToolbarBalloon: function () {
		this.selection._init();
		const range = this.selection.getRange();
		if (this.menu._bindControllersOff || (!this.editor.isBalloonAlways && range.collapsed)) this._hideToolbar();
		else this.toolbar._showBalloon(range);
	},

	_hideToolbar: function () {
		if (!this.editor._notHideToolbar && !this.status.isFullScreen) {
			this.toolbar.hide();
		}
	},

	_isUneditableNode: function (range, isFront) {
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
			return domUtils.isEdgePoint(container, offset, isFront ? 'front' : 'end') && siblingNode && siblingNode.nodeType === 1 && siblingNode.getAttribute('contenteditable') === 'false';
		}
	},

	_isUneditableNode_getSibling: function (selectNode, siblingKey, container) {
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
	_hardDelete: function () {
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
	_setDefaultLine: function (formatName) {
		if (this.editor._fileManager.pluginRegExp.test(this.editor.currentControllerName)) return;

		const range = this.selection.getRange();
		const commonCon = range.commonAncestorContainer;
		const startCon = range.startContainer;
		const rangeEl = this.format.getBlock(commonCon, null);
		let focusNode, offset, format;

		const fileComponent = domUtils.getParentElement(commonCon, this.component.is);
		if (fileComponent && !domUtils.isTable(fileComponent)) {
			return;
		} else if (commonCon.nodeType === 1 && commonCon.getAttribute('data-se-embed') === 'true') {
			let el = commonCon.nextElementSibling;
			if (!this.format.isLine(el)) el = this.format.addLine(commonCon, this.options.get('defaultLineTag'));
			this.selection.setRange(el.firstChild, 0, el.firstChild, 0);
			return;
		}

		if ((this.format.isBlock(startCon) || domUtils.isWysiwygFrame(startCon)) && (this.component.is(startCon.children[range.startOffset]) || this.component.is(startCon.children[range.startOffset - 1]))) return;
		if (domUtils.getParentElement(commonCon, domUtils.isNotCheckingNode)) return null;

		if (rangeEl) {
			format = domUtils.createElement(formatName || this.options.get('defaultLineTag'));
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

		this.editor.execCommand('formatBlock', false, formatName || this.options.get('defaultLineTag'));
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

	_setClipboardComponent: function (e, info, clipboardData) {
		e.preventDefault();
		e.stopPropagation();
		clipboardData.setData('text/html', info.component.outerHTML);
	},

	_setDropLocationSelection: function (e) {
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

	_dataTransferAction: function (type, e, data, rootKey) {
		let plainText, cleanData;
		if (env.isIE) {
			plainText = data.getData('Text');

			const range = this.selection.getRange();
			const tempDiv = domUtils.createElement('DIV');
			const tempRange = {
				sc: range.startContainer,
				so: range.startOffset,
				ec: range.endContainer,
				eo: range.endOffset
			};

			tempDiv.setAttribute('contenteditable', true);
			tempDiv.style.cssText = 'position:absolute; top:0; left:0; width:1px; height:1px; overflow:hidden;';

			this.editor.frameContext.get('container').appendChild(tempDiv);
			tempDiv.focus();

			_w.setTimeout(
				function () {
					cleanData = tempDiv.innerHTML;
					domUtils.removeItem(tempDiv);
					this.selection.setRange(tempRange.sc, tempRange.so, tempRange.ec, tempRange.eo);
					this._setClipboardData(type, e, plainText, cleanData, data, rootKey);
				}.bind(this)
			);

			return true;
		} else {
			plainText = data.getData('text/plain');
			cleanData = data.getData('text/html');
			if (this._setClipboardData(type, e, plainText, cleanData, data, rootKey) === false) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		}
	},

	_setClipboardData: function (type, e, plainText, cleanData, data, rootKey) {
		// MS word, OneNode, Excel
		const MSData = /class=["']*Mso(Normal|List)/i.test(cleanData) || /content=["']*Word.Document/i.test(cleanData) || /content=["']*OneNote.File/i.test(cleanData) || /content=["']*Excel.Sheet/i.test(cleanData);
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
			const value = this.events.onPaste(rootKey, e, cleanData, maxCharCount);
			if (value === false) {
				return false;
			} else if (typeof value === 'string') {
				if (!value) return false;
				cleanData = value;
			}
		}
		// user event - drop
		if (type === 'drop' && typeof this.events.onDrop === 'function') {
			const value = this.events.onDrop(rootKey, e, cleanData, maxCharCount);
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

	_addCommonEvent: function () {
		/** toolbar event */
		const toolbarHandler = ToolbarButtonsHandler.bind(this);
		this.addEvent(this.context.get('toolbar.main'), 'mousedown', toolbarHandler, false);
		this.addEvent(this.context.get('_menuTray'), 'mousedown', toolbarHandler, false);
		this.addEvent(this.context.get('toolbar.main'), 'click', OnClick_toolbar.bind(this), false);

		/** set response toolbar */
		this.toolbar._setResponsive();

		/** responsive toolbar observer */
		if (env.isResizeObserverSupported) this._toolbarObserver = new _w.ResizeObserver(this.toolbar.resetResponsiveToolbar.bind(this.toolbar));

		/** window event */
		this.addEvent(_w, 'resize', OnResize_window.bind(this), false);
		this.addEvent(_w, 'scroll', OnScroll_window.bind(this), false);
	},

	_addEvent: function (frameContext) {
		const eventWysiwyg = this.options.get('iframe') ? frameContext.get('_ww') : frameContext.get('wysiwyg');
		frameContext.set('eventWysiwyg', eventWysiwyg);
		if (env.isResizeObserverSupported) {
			this._resizeObserver = new _w.ResizeObserver(
				function (entries) {
					this.editor.__callResizeFunction(-1, entries[0]);
				}.bind(this)
			);
		}
		const codeArea = frameContext.get('code');

		/** editor area */
		const rootKey = frameContext.get('key');
		const wwMouseDown = OnMouseDown_wysiwyg.bind(this, rootKey);
		this.addEvent(eventWysiwyg, 'mousedown', wwMouseDown, false);
		this.addEvent(eventWysiwyg, 'click', OnClick_wysiwyg.bind(this, rootKey), false);
		this.addEvent(eventWysiwyg, env.isIE ? 'textinput' : 'input', OnInput_wysiwyg.bind(this, rootKey), false);
		this.addEvent(eventWysiwyg, 'keydown', OnKeyDown_wysiwyg.bind(this, rootKey), false);
		this.addEvent(eventWysiwyg, 'keyup', OnKeyUp_wysiwyg.bind(this, rootKey), false);
		this.addEvent(eventWysiwyg, 'paste', OnPaste_wysiwyg.bind(this, rootKey), false);
		this.addEvent(eventWysiwyg, 'copy', OnCopy_wysiwyg.bind(this, rootKey), false);
		this.addEvent(eventWysiwyg, 'cut', OnCut_wysiwyg.bind(this, rootKey), false);
		this.addEvent(eventWysiwyg, 'drop', OnDrop_wysiwyg.bind(this, rootKey), false);
		this.addEvent(eventWysiwyg, 'scroll', OnScroll_wysiwyg.bind(this, rootKey, eventWysiwyg), false);
		this.addEvent(eventWysiwyg, 'focus', OnFocus_wysiwyg.bind(this, rootKey), false);
		this.addEvent(eventWysiwyg, 'blur', OnBlur_wysiwyg.bind(this, rootKey), false);
		this.addEvent(codeArea, 'mousedown', OnFocus_code.bind(this, rootKey), false);

		/** line breaker */
		this.addEvent(eventWysiwyg, 'mousemove', OnMouseMove_wysiwyg.bind(this), false);
		this.addEvent(
			frameContext.get('lineBreaker').querySelector('button'),
			'mousedown',
			function (e) {
				e.preventDefault();
			},
			false
		);
		this.addEvent(frameContext.get('lineBreaker').querySelector('button'), 'click', DisplayLineBreak.bind(this, ''), false);
		this.addEvent(frameContext.get('lineBreaker_t'), 'mousedown', DisplayLineBreak.bind(this, 't'), false);
		this.addEvent(frameContext.get('lineBreaker_b'), 'mousedown', DisplayLineBreak.bind(this, 'b'), false);

		/** Events are registered only when there is a table plugin.  */
		if (this.plugins.table) {
			this.addEvent(eventWysiwyg, 'touchstart', wwMouseDown, {
				passive: true,
				useCapture: false
			});
		}

		/** code view area auto line */
		if (this.editor.frameOptions.get('height') === 'auto' && !this.options.get('hasCodeMirror')) {
			const cvAuthHeight = this.editor._codeViewAutoHeight.bind(this.editor);
			this.addEvent(codeArea, 'keydown', cvAuthHeight, false);
			this.addEvent(codeArea, 'keyup', cvAuthHeight, false);
			this.addEvent(codeArea, 'paste', cvAuthHeight, false);
		}

		/** statusbar */
		if (frameContext.has('statusbar')) {
			if (/\d+/.test(this.editor.frameOptions.get('height')) && this.editor.frameOptions.get('statusbar_resizeEnable')) {
				this.addEvent(frameContext.get('statusbar'), 'mousedown', OnMouseDown_statusbar.bind(this), false);
			} else {
				domUtils.addClass(frameContext.get('statusbar'), 'se-resizing-none');
			}
		}

		const OnScrollAbs = OnScroll_Abs.bind(this);
		let scrollParent = frameContext.get('originElement');
		while ((scrollParent = domUtils.getScrollParent(scrollParent.parentElement))) {
			this.__scrollparents.push(scrollParent);
			this.addEvent(scrollParent, 'scroll', OnScrollAbs, false);
		}
	},

	_removeAllEvents: function () {
		for (let i = 0, len = this._events.length, e; i < len; i++) {
			e = this._events[i];
			e.target.removeEventListener(e.type, e.handler, e.useCapture);
		}

		this._events = [];

		if (this._resizeObserver) {
			this._resizeObserver.unobserve(this.editor.frameContext.get('wysiwygFrame'));
			this._resizeObserver = null;
		}

		if (this._toolbarObserver) {
			this._toolbarObserver.unobserve(this.editor.frameContext.get('_toolbarShadow'));
			this._toolbarObserver = null;
		}
	},

	_moveContainer: function (eventWysiwyg) {
		const y = eventWysiwyg.scrollY || eventWysiwyg.scrollTop || 0;
		const x = eventWysiwyg.scrollX || eventWysiwyg.scrollLeft || 0;

		if (this.editor.isBalloon) {
			this.context.get('toolbar.main').style.top = this.toolbar._balloonOffset.top - y + 'px';
			this.context.get('toolbar.main').style.left = this.toolbar._balloonOffset.left - x + 'px';
		}

		if (this.editor._controllerTargetContext !== this.editor.frameContext.get('topArea')) {
			this.editor._offCurrentController();
		}

		if (this._lineBreaker_t) {
			const t_style = this._lineBreaker_t.style;
			const t_offset = (this._lineBreaker_t.getAttribute('data-offset') || ',').split(',');
			if (t_style.display !== 'none') {
				t_style.top = numbers.get(t_offset[0], 0) - y + 'px';
				t_style.left = numbers.get(t_offset[1], 0) - x + 'px';
			}
		}

		if (this._lineBreaker_b) {
			const b_style = this._lineBreaker_b.style;
			const b_offset = (this._lineBreaker_b.getAttribute('data-offset') || ',').split(',');
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

	_scrollContainer: function () {
		const openCont = this.editor.opendControllers;
		if (!openCont.length) return;
		if (this.__scrollID) _w.clearTimeout(this.__scrollID);

		for (let i = 0; i < openCont.length; i++) {
			if (openCont[i].notInCarrier) continue;
			openCont[i].inst.hide();
		}

		this.__scrollID = _w.setTimeout(
			function () {
				_w.clearTimeout(this.__scrollID);
				this.__scrollID = '';
				for (let i = 0; i < openCont.length; i++) {
					if (openCont[i].notInCarrier) continue;
					openCont[i].inst.show();
				}
			}.bind(this),
			250
		);
	},

	_resetFrameStatus: function () {
		this.editor._offCurrentController();

		if (!env.isResizeObserverSupported) this.toolbar.resetResponsiveToolbar();
		const toolbar = this.context.get('toolbar.main');
		const isToolbarHidden = (toolbar.style.display === 'none' || (this.editor.isInline && !this.toolbar._inlineToolbarAttr.isShow));
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

		this.editor._iframeAutoHeight();

		if (this.toolbar._sticky) {
			this.context.get('toolbar.main').style.width = this.editor.frameContext.get('topArea').offsetWidth - 2 + 'px';
			this.toolbar._resetSticky();
		}
	},

	constructor: EventManager
};

function ToolbarButtonsHandler(e) {
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

		while (!command && !/(se-menu-list|sun-editor-common)/.test(className)) {
			target = target.parentNode;
			command = target.getAttribute('data-command');
			className = target.className;
		}

		if (!this.editor.frameContext.get('isCodeView')) {
			e.preventDefault();
			if (env.isGecko && command) {
				domUtils.addClass(target, '__se__active');
				this.__geckoActiveEvent = this.addGlobalEvent(
					'mouseup',
					function (t) {
						domUtils.removeClass(t, '__se__active');
						this.__geckoActiveEvent = this.removeGlobalEvent(this.__geckoActiveEvent);
					}.bind(this, target)
				);
			}
		}

		if (command === this.menu.currentDropdownName || command === this.editor._containerName) {
			e.stopPropagation();
		}
	}
}

function OnClick_toolbar(e) {
	let target = e.target;
	let type = target.getAttribute('data-type');
	let command = target.getAttribute('data-command');
	let className = target.className;

	while (target.parentNode && !command && !/se-menu-list/.test(className) && !/se-toolbar/.test(className)) {
		target = target.parentNode;
		command = target.getAttribute('data-command');
		type = target.getAttribute('data-type');
		className = target.className;
	}

	if (!command && !type) return;
	if (target.disabled) return;

	this.editor.runPlugin(command, type, target);
}

function OnMouseDown_wysiwyg(rootKey, e) {
	if (this.status.isReadOnly || domUtils.isNonEditable(this.editor.frameContext.get('wysiwyg'))) return;

	// user event
	if (typeof this.events.onMouseDown === 'function' && this.events.onMouseDown(rootKey, e) === false) return;

	const eventPlugins = this.editor._onMousedownPlugins;
	for (let i = 0; i < eventPlugins.length; i++) {
		if (eventPlugins[i](e) === false) return;
	}

	if (this.editor.isBalloon) {
		this._hideToolbar();
	}

	if (/FIGURE/i.test(e.target.nodeName)) e.preventDefault();
}

function OnClick_wysiwyg(rootKey, e) {
	const targetElement = e.target;

	if (this.status.isReadOnly) {
		e.preventDefault();
		if (domUtils.isAnchor(targetElement)) {
			_w.open(targetElement.href, targetElement.target);
		}
		return false;
	}

	if (domUtils.isNonEditable(this.editor.frameContext.get('wysiwyg'))) return;

	// user event
	if (typeof this.events.onClick === 'function' && this.events.onClick(rootKey, e) === false) return;

	const fileComponentInfo = this.component.get(targetElement);
	if (fileComponentInfo) {
		e.preventDefault();
		this.editor.currentControllerTarget = fileComponentInfo.target;
		this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName);
		return;
	} else {
		this.editor.currentControllerTarget = null;
	}

	const figcaption = domUtils.getParentElement(targetElement, 'FIGCAPTION');
	if (figcaption && (domUtils.isNonEditable(figcaption) || !figcaption.getAttribute('contenteditable'))) {
		e.preventDefault();
		figcaption.setAttribute('contenteditable', true);
		figcaption.focus();

		if (this.editor.isInline && !this.toolbar._inlineToolbarAttr.isShow) {
			this.toolbar._showInline();

			const hideToolbar = function () {
				this._hideToolbar();
				figcaption.removeEventListener('blur', hideToolbar);
			};

			figcaption.addEventListener('blur', hideToolbar);
		}
	}

	_w.setTimeout(this.selection._init.bind(this.selection));
	this.selection._init();

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
			} else if (!domUtils.isWysiwygFrame(selectionNode) && !this.component.is(selectionNode) && (!domUtils.isTable(selectionNode) || domUtils.isTableCell(selectionNode)) && this._setDefaultLine(this.format.isBlock(rangeEl) ? 'DIV' : this.options.get('defaultLineTag')) !== null) {
				e.preventDefault();
				this.editor.focus();
			} else {
				this.applyTagEffect();
			}
		}
	} else {
		this.applyTagEffect();
	}

	if (this.editor.isBalloon) _w.setTimeout(this._toggleToolbarBalloon.bind(this));
}

function OnInput_wysiwyg(rootKey, e) {
	if (this.status.isReadOnly || this.status.isDisabled) {
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
	if (typeof this.events.onInput === 'function' && this.events.onInput(rootKey, e) === false) return;

	this.history.push(true);
}

function OnKeyDown_wysiwyg(rootKey, e) {
	const keyCode = e.keyCode;
	const shift = e.shiftKey;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	const alt = e.altKey;
	this._IEisComposing = keyCode === 229;

	if (!ctrl && this.status.isReadOnly && !DIRECTION_KEYCODE.test(keyCode)) {
		e.preventDefault();
		return false;
	}

	this.menu.dropdownOff();

	if (this.editor.isBalloon) {
		this._hideToolbar();
	}

	// user event
	if (typeof this.events.onKeyDown === 'function' && this.events.onKeyDown(rootKey, e) === false) return;

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
	let selectionNode = this.selection.getNode();
	const range = this.selection.getRange();
	const selectRange = !range.collapsed || range.startContainer !== range.endContainer;
	const fileComponentName = this.editor._fileManager.pluginRegExp.test(this.editor.currentControllerName) ? this.editor.currentControllerName : '';
	let formatEl = this.format.getLine(selectionNode, null) || selectionNode;
	let rangeEl = this.format.getBlock(formatEl, null);

	const eventPlugins = this.editor._onKeyDownPlugins;
	for (let i = 0; i < eventPlugins.length; i++) {
		if (eventPlugins[i](e, range, formatEl) === false) return;
	}

	switch (keyCode) {
		case 8 /** backspace key */ :
			if (!selectRange) {
				if (fileComponentName) {
					e.preventDefault();
					e.stopPropagation();
					this.plugins[fileComponentName].destroy();
					this.editor._offCurrentController();
					break;
				}
			}

			if (selectRange && this._hardDelete()) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			if (!this.format.isLine(formatEl) && !this.editor.frameContext.get('wysiwyg').firstElementChild && !this.component.is(selectionNode) && this._setDefaultLine(this.options.get('defaultLineTag')) !== null) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}

			if (!selectRange && !formatEl.previousElementSibling && range.startOffset === 0 && !selectionNode.previousSibling && !domUtils.isListCell(formatEl) && this.format.isLine(formatEl) && (!this.format.isBrLine(formatEl) || this.format.isClosureBrLine(formatEl))) {
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

					if (formatEl.nodeName.toUpperCase() === this.options.get('defaultLineTag').toUpperCase()) {
						formatEl.innerHTML = '<br>';
						const attrs = formatEl.attributes;
						while (attrs[0]) {
							formatEl.removeAttribute(attrs[0].name);
						}
					} else {
						formatEl.parentElement.replaceChild(domUtils.createElement(this.options.get('defaultLineTag'), null, '<br>'), formatEl);
					}

					this.editor._nativeFocus();
					return false;
				}
			}

			// clean remove tag
			if (formatEl && range.startContainer === range.endContainer && selectionNode.nodeType === 3 && !this.format.isLine(selectionNode.parentNode)) {
				if (range.collapsed ? selectionNode.textContent.length === 1 : range.endOffset - range.startOffset === selectionNode.textContent.length) {
					e.preventDefault();

					let offset = null;
					let prev = selectionNode.parentNode.previousSibling;
					const next = selectionNode.parentNode.nextSibling;
					if (!prev) {
						if (!next) {
							prev = domUtils.createElement('BR');
							formatEl.appendChild(prev);
						} else {
							prev = next;
							offset = 0;
						}
					}

					selectionNode.textContent = '';
					this.node.removeAllParents(selectionNode, null, formatEl);
					offset = typeof offset === 'number' ? offset : prev.nodeType === 3 ? prev.textContent.length : 1;
					this.selection.setRange(prev, offset, prev, offset);
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
					(this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null) ? rangeEl.contains(range.startContainer) : range.startOffset === 0 && range.collapsed)
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
						if (this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) this.editor.blur();
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
		case 46 /** delete key */ :
			if (fileComponentName) {
				e.preventDefault();
				e.stopPropagation();
				this.plugins[fileComponentName].destroy();
				this.editor._offCurrentController();
				break;
			}

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
			if ((this.format.isLine(selectionNode) || selectionNode.nextSibling === null || (domUtils.isZeroWith(selectionNode.nextSibling) && selectionNode.nextSibling.nextSibling === null)) && range.startOffset === selectionNode.textContent.length) {
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
						if (this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) this.editor.blur();
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
						(this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null) ? rangeEl.contains(range.endContainer) : range.endOffset === selectionNode.textContent.length && range.collapsed)))
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
		case 9 /** tab key */ :
			if (fileComponentName || this.options.get('tabDisable')) break;
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
					const tabText = domUtils.createTextNode(new _w.Array(this.status.tabSize + 1).join('\u00A0'));
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
		case 13 /** enter key */ :
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
					const newFormat = this.format.addLine(formatEl, this.options.get('defaultLineTag'));

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
				}

				// set format attrs - edge
				if (formatStartEdge || formatEndEdge) {
					e.preventDefault();
					const focusBR = domUtils.createElement('BR');
					const newFormat = domUtils.createElement(formatEl.nodeName, null, focusBR);

					domUtils.copyTagAttributes(newFormat, formatEl, ['id'].concat(this.options.get('lineAttrReset')));

					formatEl.parentNode.insertBefore(newFormat, formatStartEdge ? formatEl : formatEl.nextElementSibling);
					if (formatEndEdge) {
						this.selection.setRange(focusBR, 1, focusBR, 1);
					}

					break;
				} else {
					this._formatAttrsTemp = formatEl.attributes;
				}

				if (this.options.get('lineAttrReset') && formatEl && !domUtils.isListCell(formatEl)) {
					e.preventDefault();
					e.stopPropagation();

					let newEl;
					if (!range.collapsed) {
						const isMultiLine = this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null);
						const r = this.html.remove();
						if (isMultiLine) {
							newEl = this.format.getLine(r.container, null);

							if (!r.prevContainer) {
								const newFormat = formatEl.cloneNode(false);
								newFormat.innerHTML = '<br>';
								newEl.parentNode.insertBefore(newFormat, newEl);
							} else if (newEl !== formatEl && newEl.nextElementSibling === formatEl) {
								newEl = formatEl;
							}
						} else {
							newEl = this.node.split(r.container, r.offset, 0);
						}
					} else {
						if (domUtils.isZeroWith(formatEl)) newEl = this.format.addLine(formatEl, formatEl.cloneNode(false));
						else newEl = this.node.split(range.endContainer, range.endOffset, 0);
					}

					const resetAttr = this.options.get('lineAttrReset');
					const attrs = newEl.attributes;
					let i = 0;
					while (attrs[i]) {
						if (resetAttr && resetAttr.indexOf(attrs[i].name.toLowerCase()) > -1) {
							i++;
							continue;
						}
						newEl.removeAttribute(attrs[i].name);
					}
					this.selection.setRange(newEl.firstChild, 0, newEl.firstChild, 0);

					break;
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
								(!children[offset + 1] || ((!children[offset + 2] || domUtils.isZeroWith(children[offset + 2].textContent)) && children[offset + 1].nodeType === 3 && domUtils.isZeroWith(children[offset + 1].textContent))) &&
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
						const newEl = this.format.addLine(brBlock, this.format.isLine(brBlock.nextElementSibling) && !this.format.isBlock(brBlock.nextElementSibling) ? brBlock.nextElementSibling : null);
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
			}

			if (selectRange) break;

			if (rangeEl && formatEl && !domUtils.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
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

				if ((range.commonAncestorContainer.nodeType === 3 ? !range.commonAncestorContainer.nextElementSibling : true) && domUtils.isZeroWith(formatEl.innerText.trim())) {
					e.preventDefault();
					let newEl = null;

					if (domUtils.isListCell(rangeEl.parentNode)) {
						rangeEl = formatEl.parentNode.parentNode.parentNode;
						newEl = this.node.split(formatEl, null, domUtils.getNodeDepth(formatEl) - 2);
						if (!newEl) {
							const newListCell = domUtils.createElement('LI', null, '<br>');
							rangeEl.insertBefore(newListCell, newEl);
							newEl = newListCell;
						}
					} else {
						const newFormat = domUtils.isTableCell(rangeEl.parentNode) ?
							'DIV' :
							domUtils.isList(rangeEl.parentNode) ?
							'LI' :
							this.format.isLine(rangeEl.nextElementSibling) && !this.format.isBlock(rangeEl.nextElementSibling) ?
							rangeEl.nextElementSibling.nodeName :
							this.format.isLine(rangeEl.previousElementSibling) && !this.format.isBlock(rangeEl.previousElementSibling) ?
							rangeEl.previousElementSibling.nodeName :
							this.options.get('defaultLineTag');

						newEl = domUtils.createElement(newFormat);
						const edge = this.format.removeBlock(rangeEl, [formatEl], null, true, true);
						edge.cc.insertBefore(newEl, edge.ec);
					}

					newEl.innerHTML = '<br>';
					this.node.removeAllParents(formatEl, null, null);
					this.selection.setRange(newEl, 1, newEl, 1);
					break;
				}
			}

			if (rangeEl && domUtils.getParentElement(rangeEl, 'FIGCAPTION') && domUtils.getParentElement(rangeEl, domUtils.isList)) {
				e.preventDefault();
				formatEl = this.format.addLine(formatEl, null);
				this.selection.setRange(formatEl, 0, formatEl, 0);
			}

			if (fileComponentName) {
				e.preventDefault();
				e.stopPropagation();

				const compContext = this.component.get(this.editor.currentControllerTarget);
				const container = compContext.container;
				const sibling = container.previousElementSibling || container.nextElementSibling;

				let newEl = null;
				if (domUtils.isListCell(container.parentNode)) {
					newEl = domUtils.createElement('BR');
				} else {
					newEl = domUtils.createElement(this.format.isLine(sibling) && !this.format.isBlock(sibling) ? sibling.nodeName : this.options.get('defaultLineTag'), null, '<br>');
				}

				container.parentNode.insertBefore(newEl, container);
				if (this.component.select(compContext.target, fileComponentName) === false) this.editor.blur();
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

	if (env.isIE && !ctrl && !alt && !selectRange && !NON_TEXT_KEYCODE.test(keyCode) && domUtils.isBreak(range.commonAncestorContainer)) {
		const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
		this.html.insertNode(zeroWidth, null, true);
		this.selection.setRange(zeroWidth, 1, zeroWidth, 1);
	}
}

function OnKeyUp_wysiwyg(rootKey, e) {
	if (this._onShortcutKey) return;

	this.selection._init();
	const keyCode = e.keyCode;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	const alt = e.altKey;

	if (this.status.isReadOnly) {
		if (!ctrl && SPACE_DEL_DIR_KEYCODE.test(keyCode)) this.applyTagEffect();
		return;
	}

	const range = this.selection.getRange();
	let selectionNode = this.selection.getNode();

	if (this.editor.isBalloon && ((this.editor.isBalloonAlways && keyCode !== 27) || !range.collapsed)) {
		if (this.editor.isBalloonAlways) {
			if (keyCode !== 27) this._showToolbarBalloonDelay();
		} else {
			this.toolbar._showBalloon();
			return;
		}
	}

	/** when format tag deleted */
	if (keyCode === 8 && domUtils.isWysiwygFrame(selectionNode) && selectionNode.textContent === '' && selectionNode.children.length === 0) {
		e.preventDefault();
		e.stopPropagation();

		selectionNode.innerHTML = '';

		const oFormatTag = domUtils.createElement(this.format.isLine(this.status.currentNodes[0]) ? this.status.currentNodes[0] : this.options.get('defaultLineTag'), null, '<br>');
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

	if (!formatEl && range.collapsed && !this.component.is(selectionNode) && !domUtils.isList(selectionNode) && this._setDefaultLine(this.format.isBlock(rangeEl) ? 'DIV' : this.options.get('defaultLineTag')) !== null) {
		selectionNode = this.selection.getNode();
	}

	if (SPACE_DEL_DIR_KEYCODE.test(keyCode)) {
		this.applyTagEffect();
	}

	const textKey = !ctrl && !alt && !NON_TEXT_KEYCODE.test(keyCode);
	if (textKey && selectionNode.nodeType === 3 && unicode.zeroWidthRegExp.test(selectionNode.textContent) && !(e.isComposing !== undefined ? e.isComposing : this._IEisComposing)) {
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
	if (typeof this.events.onKeyUp === 'function' && this.events.onKeyUp(rootKey, e) === false) return;

	if (!ctrl && !alt && !HISTORY_IGNORE_KEYCODE.test(keyCode)) {
		this.history.push(true);
	}
}

function OnPaste_wysiwyg(rootKey, e) {
	const clipboardData = env.isIE ? _w.clipboardData : e.clipboardData;
	if (!clipboardData) return true;
	return this._dataTransferAction('paste', e, clipboardData, rootKey);
}

function OnCopy_wysiwyg(rootKey, e) {
	const clipboardData = env.isIE ? _w.clipboardData : e.clipboardData;

	// user event
	if (typeof this.events.onCopy === 'function' && this.events.onCopy(rootKey, e, clipboardData) === false) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
}

function OnDrop_wysiwyg(rootKey, e) {
	if (this.status.isReadOnly || env.isIE) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const dataTransfer = e.dataTransfer;
	if (!dataTransfer) return true;

	this.html.remove();
	this._setDropLocationSelection(e);
	return this._dataTransferAction('drop', e, dataTransfer, rootKey);
}

function OnCut_wysiwyg(rootKey, e) {
	const clipboardData = env.isIE ? _w.clipboardData : e.clipboardData;

	// user event
	if (typeof this.events.onCut === 'function' && this.events.onCut(rootKey, e, clipboardData) === false) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const info = this.editor.currentFileComponentInfo;
	if (info && !env.isIE) {
		this._setClipboardComponent(e, info, clipboardData);
		domUtils.removeItem(info.component);
		this.editor._offCurrentController();
	}

	_w.setTimeout(function () {
		this.history.push(false);
	});
}

function OnScroll_wysiwyg(rootKey, eventWysiwyg, e) {
	this._moveContainer(eventWysiwyg);
	this._scrollContainer();
	// user event
	if (typeof this.events.onScroll === 'function') this.events.onScroll(rootKey, e);
}

function OnFocus_wysiwyg(rootKey, e) {
	if (this.editor._antiBlur) return;
	this.status.hasFocus = true;

	domUtils.removeClass(this.context.get('buttons.codeView'), 'active');
	domUtils.setDisabled(this.editor._codeViewDisabledButtons, false);

	this.editor.changeFrameContext(rootKey);
	this.history.resetButtons();
	this.applyTagEffect();

	if (this.editor.isInline) this.toolbar._showInline();

	// user event
	if (typeof this.events.onFocus === 'function') this.events.onFocus(rootKey, e);
}

function OnBlur_wysiwyg(rootKey, e) {
	if (this.editor._antiBlur || this.editor.rootTargets.get(rootKey).get('isCodeView')) return;

	this.status.hasFocus = false;
	this.editor.effectNode = null;
	this.editor._offCurrentController();
	if (this.editor.isInline || this.editor.isBalloon) this._hideToolbar();

	this._setKeyEffect([], null, []);

	this.status.currentNodes = [];
	this.status.currentNodesMap = [];

	this.editor.rootTargets.forEach(function (e) {
		if (e.get('navigation')) e.get('navigation').textContent = '';
	});

	this.history.check(rootKey, this.status._range);

	// user event
	if (typeof this.events.onBlur === 'function') this.events.onBlur(rootKey, e, this.editor.frameContext.get('wysiwyg'));
}

function OnMouseMove_wysiwyg(e) {
	if (this.status.isDisabled || this.status.isReadOnly) return false;

	const component = domUtils.getParentElement(e.target, this.component.is);
	const lineBreakerStyle = this.editor.frameContext.get('lineBreaker').style;

	if (component && !this.editor.currentControllerName) {
		const fc = this.editor.frameContext;
		let scrollTop = 0;
		let el = fc.get('wysiwyg');
		do {
			scrollTop += el.scrollTop;
			el = el.parentElement;
		} while (el && !/^(BODY|HTML)$/i.test(el.nodeName));

		const wScroll = fc.get('wysiwyg').scrollTop;
		const offsets = this.offset.getGlobal(fc.get('topArea'));
		const componentTop = this.offset.get(component).top + wScroll;
		const y = e.pageY + scrollTop + (this.options.get('iframe') && !this.options.get('toolbar_container') ? this.context.get('toolbar.main').offsetHeight : 0);
		const c = componentTop + (this.options.get('iframe') ? scrollTop : offsets.top);
		const toolbarH = this.context.get('toolbar.main').offsetHeight;

		const isList = domUtils.isListCell(component.parentNode);
		let dir = '',
			top = '';
		if ((isList ? !component.previousSibling : !this.format.isLine(component.previousElementSibling)) && y < c + toolbarH + 20) {
			top = componentTop - 1;
			dir = 't';
		} else if ((isList ? !component.nextSibling : !this.format.isLine(component.nextElementSibling)) && y > c + component.offsetHeight + toolbarH - 20) {
			top = componentTop + component.offsetHeight - 1;
			dir = 'b';
		} else {
			lineBreakerStyle.display = 'none';
			return;
		}

		this._lineBreakComp = component;
		this._lineBreakDir = dir;
		lineBreakerStyle.top = top - wScroll + 'px';
		this._lineBreakerButton.style.left = this.offset.get(component).left + component.offsetWidth / 2 - 15 + 'px';
		lineBreakerStyle.display = 'block';
	} // off line breaker
	else if (lineBreakerStyle.display !== 'none') {
		lineBreakerStyle.display = 'none';
	}
}

function OnMouseDown_statusbar(e) {
	e.stopPropagation();
	this._resizeClientY = e.clientY;
	this.editor._resizeBackground.style.display = 'block';
	this.editor._resizeBackground.style.cursor = 'ns-resize';
	this.__resize_editor = this.addGlobalEvent('mousemove', __resizeEditor.bind(this));
	this.__close_move = this.addGlobalEvent('mouseup', __closeMove.bind(this));
}

function __resizeEditor(e) {
	const resizeInterval = this.editor.frameContext.get('editorArea').offsetHeight + (e.clientY - this._resizeClientY);
	const h = resizeInterval < this.editor.frameContext.get('_minHeight') ? this.editor.frameContext.get('_minHeight') : resizeInterval;
	this.editor.frameContext.get('wysiwygFrame').style.height = this.editor.frameContext.get('code').style.height = h + 'px';
	this._resizeClientY = e.clientY;
	if (!env.isResizeObserverSupported) this.editor.__callResizeFunction(h, null);
}

function __closeMove() {
	this.editor._resizeBackground.style.display = 'none';
	this.editor._resizeBackground.style.cursor = 'auto';
	if (this.__resize_editor) this.__resize_editor = this.removeGlobalEvent(this.__resize_editor);
	if (this.__close_move) this.__close_move = this.removeGlobalEvent(this.__close_move);
}

function DisplayLineBreak(dir, e) {
	e.preventDefault();

	dir = !dir ? this._lineBreakDir : dir;
	const component = this._lineBreakComp;
	const isList = domUtils.isListCell(component.parentNode);

	const format = domUtils.createElement(isList ? 'BR' : domUtils.isTableCell(component.parentNode) ? 'DIV' : this.options.get('defaultLineTag'));
	if (!isList) format.innerHTML = '<br>';

	if (this.editor.frameOptions.get('charCounter_type') === 'byte-html' && !this.char.check(format.outerHTML)) return;

	component.parentNode.insertBefore(format, dir === 't' ? component : component.nextSibling);
	this.editor.frameContext.get('lineBreaker').style.display = 'none';
	this._lineBreakComp = null;

	const focusEl = isList ? format : format.firstChild;
	this.selection.setRange(focusEl, 1, focusEl, 1);
	this.history.push(false);
}

function OnResize_window() {
	if (this.editor.isBalloon) this.toolbar.hide();
	this._resetFrameStatus();
}

function OnScroll_window() {
	if (this.options.get('toolbar_sticky') > -1) {
		this.toolbar._resetSticky();
	}

	if (this.editor.isBalloon && this.context.get('toolbar.main').style.display === 'block') {
		this.toolbar._setBalloonOffset(this.toolbar._balloonOffset.position === 'top');
	}

	this._scrollContainer();
}

function OnScroll_Abs() {
	this._scrollContainer();
}

function OnFocus_code(rootKey) {
	this.editor.changeFrameContext(rootKey);
	domUtils.addClass(this.context.get('buttons.codeView'), 'active');
	domUtils.setDisabled(this.editor._codeViewDisabledButtons, true);
}

export default EventManager;