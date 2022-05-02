/**
 * @fileoverview eventManager class
 * @author JiHong Lee.
 */

import EditorInterface from "../../interface/editor";
import {
	domUtils,
	unicode,
	numbers,
	env,
	converter
} from "../../helper";
import {
	_w,
	_d
} from "../../helper/global";

function EventManager(__core) {
	EditorInterface.call(this, __core);
	this._events = [];
	this._onButtonsCheck = new _w.RegExp("^(" + _w.Object.keys(__core.options._textTagsMap).join("|") + ")$", "i");
	this._onShortcutKey = false;
	this._IEisComposing = false; // In IE, there is no "e.isComposing" in the key-up event.
	this._directionKeyCode = new _w.RegExp("^(8|13|3[2-9]|40|46)$");
	this._nonTextKeyCode = new _w.RegExp("^(8|13|1[6-9]|20|27|3[3-9]|40|45|46|11[2-9]|12[0-3]|144|145)$");
	this._historyIgnoreKeyCode = new _w.RegExp("^(1[6-9]|20|27|3[3-9]|40|45|11[2-9]|12[0-3]|144|145)$");
	this._frontZeroWidthReg = new _w.RegExp(unicode.zeroWidthSpace + "+", "");
	this._lineBreakerButton = __core._lineBreaker.querySelector('button');
	this._balloonDelay = null;
	this._resizeObserver = null;
    this._toolbarObserver = null;
}

EventManager.prototype = {
	/**
	 * @description Register for an event.
	 * Only events registered with this method are unregistered or re-registered when methods such as "setOptions", "destroy" are called. 
	 * @param {Element} target Target element
	 * @param {string} type Event type
	 * @param {Function} handler Event handler
	 * @param {boolean|undefined} useCapture Event useCapture option
	 */
	addEvent: function (target, type, handler, useCapture) {
		target.addEventListener(type, handler, useCapture);
		this._events.push({
			target: target,
			type: type,
			handler: handler
		});
	},

	/**
	 * @description Add an event to document.
	 * When created as an Iframe, the same event is added to the document in the Iframe.
	 * @param {string} type Event type
	 * @param {Function} listener Event listener
	 * @param {boolean} useCapture Use event capture
	 */
	addGlobalEvent: function (type, listener, useCapture) {
		_d.addEventListener(type, listener, useCapture);
		if (this.options.iframe) {
			this._wd.addEventListener(type, listener);
		}
	},

	/**
	 * @description Remove events from document.
	 * When created as an Iframe, the event of the document inside the Iframe is also removed.
	 * @param {string} type Event type
	 * @param {Function} listener Event listener
	 */
	removeGlobalEvent: function (type, listener) {
		_d.removeEventListener(type, listener);
		if (this.options.iframe) {
			this._wd.removeEventListener(type, listener);
		}
	},

	/**
	 * @description Activates the corresponding button with the tags information of the current cursor position, 
	 * such as "bold", "underline", etc., and executes the "active" method of the plugins.  
	 */
	applyTagEffect: function () {
		let selectionNode = this.selection.getNode();
		if (selectionNode === this.__core.effectNode) return;
		this.__core.effectNode = selectionNode;

		const marginDir = this.options.rtl ? "marginRight" : "marginLeft";
		const commandMap = this.__core.commandMap;
		const classOnCheck = this._onButtonsCheck;
		const commandMapNodes = [];
		const currentNodes = [];

		const activePlugins = this.__core.activePlugins;
		const cLen = activePlugins.length;
		let nodeName = "";

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
					if (commandMapNodes.indexOf(name) === -1 && this.plugins[name].active(element)) {
						commandMapNodes.push(name);
					}
				}
			}

			if (this.format.isLine(element)) {
				/* Outdent */
				if (commandMapNodes.indexOf("OUTDENT") === -1 && commandMap.OUTDENT && !domUtils.isImportantDisabled(commandMap.OUTDENT)) {
					if (domUtils.isListCell(element) || (element.style[marginDir] && numbers.get(element.style[marginDir], 0) > 0)) {
						commandMapNodes.push("OUTDENT");
						commandMap.OUTDENT.removeAttribute("disabled");
					}
				}

				/* Indent */
				if (commandMapNodes.indexOf("INDENT") === -1 && commandMap.INDENT && !domUtils.isImportantDisabled(commandMap.INDENT)) {
					commandMapNodes.push("INDENT");
					if (domUtils.isListCell(element) && !element.previousElementSibling) {
						commandMap.INDENT.setAttribute("disabled", true);
					} else {
						commandMap.INDENT.removeAttribute("disabled");
					}
				}

				continue;
			}

			/** default active buttons [strong, ins, em, del, sub, sup] */
			if (classOnCheck && classOnCheck.test(nodeName)) {
				commandMapNodes.push(nodeName);
				domUtils.addClass(commandMap[nodeName], "active");
			}
		}

		this._setKeyEffect(commandMapNodes);

		/** save current nodes */
		this.status.currentNodes = currentNodes.reverse();
		this.status.currentNodesMap = commandMapNodes;

		/**  Displays the current node structure to resizingBar */
		if (this.options.showPathLabel) this.context.element.navigation.textContent = this.status.currentNodes.join(" > ");
	},

	/**
	 * @description remove class, display text.
	 * @param {Array|null} ignoredList Igonred button list
	 * @private
	 */
	_setKeyEffect: function (ignoredList) {
		const commandMap = this.__core.commandMap;
		const activePlugins = this.__core.activePlugins;

		for (let key in commandMap) {
			if (ignoredList.indexOf(key) > -1 || !commandMap.hasOwnProperty(key)) continue;
			if (activePlugins.indexOf(key) > -1) {
				this.plugins[key].active(null);
			} else if (commandMap.OUTDENT && /^OUTDENT$/i.test(key)) {
				if (!domUtils.isImportantDisabled(commandMap.OUTDENT)) commandMap.OUTDENT.setAttribute('disabled', true);
			} else if (commandMap.INDENT && /^INDENT$/i.test(key)) {
				if (!domUtils.isImportantDisabled(commandMap.INDENT)) commandMap.INDENT.removeAttribute('disabled');
			} else {
				domUtils.removeClass(commandMap[key], 'active');
			}
		}
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
			350
		);
	},

	_toggleToolbarBalloon: function () {
		this.selection._init();
		const range = this.selection.getRange();
		if (this.menu._bindControllersOff || (!this.__core._isBalloonAlways && range.collapsed)) this._hideToolbar();
		else this.toolbar._showBalloon(range);
	},

	_hideToolbar: function () {
		if (!this.__core._notHideToolbar && !this.status.isFullScreen) {
			this.toolbar.hide();
		}
	},

	_isUneditableNode: function (range, isFront) {
		const container = isFront ? range.startContainer : range.endContainer;
		const offset = isFront ? range.startOffset : range.endOffset;
		const siblingKey = isFront ? "previousSibling" : "nextSibling";
		const isElement = container.nodeType === 1;
		let siblingNode;

		if (isElement) {
			siblingNode = this._isUneditableNode_getSibling(container.childNodes[offset], siblingKey, container);
			return siblingNode && siblingNode.nodeType === 1 && siblingNode.getAttribute("contenteditable") === "false";
		} else {
			siblingNode = this._isUneditableNode_getSibling(container, siblingKey, container);
			return domUtils.isEdgePoint(container, offset, isFront ? "front" : "end") && siblingNode && siblingNode.nodeType === 1 && siblingNode.getAttribute("contenteditable") === "false";
		}
	},

	_isUneditableNode_getSibling: function (selectNode, siblingKey, container) {
		if (!selectNode) return null;
		let siblingNode = selectNode[siblingKey];

		if (!siblingNode) {
			siblingNode = this.format.getLine(container);
			siblingNode = siblingNode ? siblingNode[siblingKey] : null;
			if (siblingNode && !this.component.is(siblingNode)) siblingNode = siblingKey === "previousSibling" ? siblingNode.firstElementChild : siblingNode.lastElementChild;
			else return null;
		}

		return siblingNode;
	},

	_resize_editor: function (e) {
		const resizeInterval = this.context.element.editorArea.offsetHeight + (e.clientY - this.status.resizeClientY);
		const h = (resizeInterval < this.status.minResizingSize ? this.status.minResizingSize : resizeInterval);
		this.context.element.wysiwygFrame.style.height = this.context.element.code.style.height = h + 'px';
		this.status.resizeClientY = e.clientY;
		if (env.isIE) this.__core.__callResizeFunction(h, null);
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
				domUtils.remove(domUtils.getParentElement(eCell, function (current) {
					return ancestor === current.parentNode;
				}));
			} else if (!eIsCell) {
				domUtils.remove(domUtils.getParentElement(sCell, function (current) {
					return ancestor === current.parentNode;
				}));
			} else {
				domUtils.remove(domUtils.getParentElement(sCell, function (current) {
					return ancestor === current.parentNode;
				}));
				this.__core.nativeFocus();
				return true;
			}
		}

		// component
		const sComp = sc.nodeType === 1 ? domUtils.getParentElement(sc, ".se-component") : null;
		const eComp = ec.nodeType === 1 ? domUtils.getParentElement(ec, ".se-component") : null;
		if (sComp) domUtils.remove(sComp);
		if (eComp) domUtils.remove(eComp);

		return false;
	},

	/**
	 * @description If there is no default format, add a line and move "selection".
	 * @param {string|null} formatName Format tag name (default: 'P')
	 * @private
	 */
	_setDefaultLine: function (formatName) {
		if (this.__core._fileManager.pluginRegExp.test(this.__core.currentControllerName)) return;

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
			if (!this.format.isLine(el)) el = this.format.appendLine(commonCon, options.defaultTag);
			this.selection.setRange(el.firstChild, 0, el.firstChild, 0);
			return;
		}

		if ((this.format.isBlock(startCon) || domUtils.isWysiwygFrame(startCon)) && (this.component.is(startCon.children[range.startOffset]) || this.component.is(startCon.children[range.startOffset - 1]))) return;
		if (domUtils.getParentElement(commonCon, this.format._isNotCheckingNode)) return null;

		if (rangeEl) {
			format = domUtils.createElement(formatName || this.options.defaultTag);
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

		this.__core.execCommand("formatBlock", false, formatName || this.options.defaultTag);
		focusNode = domUtils.getEdgeChildNodes(commonCon, commonCon);
		focusNode = focusNode ? focusNode.ec : commonCon;

		format = this.format.getLine(focusNode, null);
		if (!format) {
			this.selection.removeRange();
			this.selection._init();
			return;
		}

		if (domUtils.isBreak(format.nextSibling)) domUtils.remove(format.nextSibling);
		if (domUtils.isBreak(format.previousSibling)) domUtils.remove(format.previousSibling);
		if (domUtils.isBreak(focusNode)) {
			const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
			focusNode.parentNode.insertBefore(zeroWidth, focusNode);
			focusNode = zeroWidth;
		}

		this.__core.effectNode = null;
		this.__core.nativeFocus();
	},

	_setClipboardComponent: function (e, info, clipboardData) {
		e.preventDefault();
		e.stopPropagation();
		clipboardData.setData("text/html", info.component.outerHTML);
	},

	_setDropLocationSelection: function (e) {
		if (e.rangeParent) {
			this.selection.setRange(e.rangeParent, e.rangeOffset, e.rangeParent, e.rangeOffset);
		} else if (this._wd.caretRangeFromPoint) {
			const r = this._wd.caretRangeFromPoint(e.clientX, e.clientY);
			this.selection.setRange(r.startContainer, r.startOffset, r.endContainer, r.endOffset);
		} else {
			const r = this.selection.getRange();
			this.selection.setRange(r.startContainer, r.startOffset, r.endContainer, r.endOffset);
		}
	},

	_dataTransferAction: function (type, e, data) {
		let plainText, cleanData;
		if (env.isIE) {
			plainText = data.getData("Text");

			const range = this.selection.getRange();
			const tempDiv = domUtils.createElement("DIV");
			const tempRange = {
				sc: range.startContainer,
				so: range.startOffset,
				ec: range.endContainer,
				eo: range.endOffset
			};

			tempDiv.setAttribute("contenteditable", true);
			tempDiv.style.cssText = "position:absolute; top:0; left:0; width:1px; height:1px; overflow:hidden;";

			this.context.element.relative.appendChild(tempDiv);
			tempDiv.focus();

			_w.setTimeout(function () {
				cleanData = tempDiv.innerHTML;
				domUtils.remove(tempDiv);
				this.selection.setRange(tempRange.sc, tempRange.so, tempRange.ec, tempRange.eo);
				this._setClipboardData(type, e, plainText, cleanData, data);
			}.bind(this));

			return true;
		} else {
			plainText = data.getData("text/plain");
			cleanData = data.getData("text/html");
			if (this._setClipboardData(type, e, plainText, cleanData, data) === false) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		}
	},

	_setClipboardData: function (type, e, plainText, cleanData, data) {
		// MS word, OneNode, Excel
		const MSData = /class=["']*Mso(Normal|List)/i.test(cleanData) || /content=["']*Word.Document/i.test(cleanData) || /content=["']*OneNote.File/i.test(cleanData) || /content=["']*Excel.Sheet/i.test(cleanData);
		const onlyText = !cleanData;

		if (!onlyText) {
			if (MSData) {
				cleanData = cleanData.replace(/\n/g, " ");
				plainText = plainText.replace(/\n/g, " ");
			} else {
				cleanData = (plainText === cleanData ? plainText : cleanData).replace(/\n/g, "<br>");
			}
			cleanData = this.__core.cleanHTML(cleanData, this.__core.pasteTagsWhitelistRegExp, this.__core.pasteTagsBlacklistRegExp);
		} else {
			cleanData = converter.htmlToEntity(plainText).replace(/\n/g, "<br>");
		}

		const maxCharCount = this.char.test(this.options.charCounterType === "byte-html" ? cleanData : plainText);
		// user event - paste
		if (type === "paste" && typeof this.events.onPaste === "function") {
			const value = this.events.onPaste(e, cleanData, maxCharCount);
			if (!value) return false;
			if (typeof value === "string") cleanData = value;
		}
		// user event - drop
		if (type === "drop" && typeof this.events.onDrop === "function") {
			const value = this.events.onDrop(e, cleanData, maxCharCount);
			if (!value) return false;
			if (typeof value === "string") cleanData = value;
		}

		// files
		const files = data.files;
		if (files.length > 0 && !MSData) {
			if (/^image/.test(files[0].type) && this.plugins.image) {
				this.plugins.image.submitAction(files);
				this.__core.focus();
			}
			return false;
		}

		if (!maxCharCount) {
			return false;
		}

		if (cleanData) {
			if (domUtils.isListCell(util.getFormatElement(core.getSelectionNode(), null))) {
				const dom = (_d.createRange().createContextualFragment(cleanData));
				if (dom.childNodes[0].nodeType === 1) {
					cleanData = ConvertListCell(dom);
				}
			}

			this.selection.insertHTML(cleanData, true, false);
			return false;
		}
	},

	_addEvent: function () {
		const eventWysiwyg = this.options.iframe ? this._ww : this.context.element.wysiwyg;
		if (!env.isIE) {
			this._resizeObserver = new this._w.ResizeObserver(function(entries) {
				this.__core.__callResizeFunction(-1, entries[0]);
			}.bind(this));
		}

		/** toolbar event */
		const toolbarHandler = ToolbarButtonsHandler.bind(this);
		this.addEvent(this.context.element.toolbar, "mousedown", toolbarHandler, false);
		this.addEvent(this.context.element._menuTray, "mousedown", toolbarHandler, false);
		this.addEvent(this.context.element.toolbar, "click", OnClick_toolbar.bind(this), false);

		/** editor area */
		const wwMouseDown = OnMouseDown_wysiwyg.bind(this);
		this.addEvent(eventWysiwyg, "mousedown", wwMouseDown, false);
		this.addEvent(eventWysiwyg, "click", OnClick_wysiwyg.bind(this), false);
		this.addEvent(eventWysiwyg, env.isIE ? "textinput" : "input", OnInput_wysiwyg.bind(this), false);
		this.addEvent(eventWysiwyg, "keydown", OnKeyDown_wysiwyg.bind(this), false);
		this.addEvent(eventWysiwyg, "keyup", OnKeyUp_wysiwyg.bind(this), false);
		this.addEvent(eventWysiwyg, "paste", OnPaste_wysiwyg.bind(this), false);
		this.addEvent(eventWysiwyg, "copy", OnCopy_wysiwyg.bind(this), false);
		this.addEvent(eventWysiwyg, "cut", OnCut_wysiwyg.bind(this), false);
		this.addEvent(eventWysiwyg, "drop", OnDrop_wysiwyg.bind(this), false);
		this.addEvent(eventWysiwyg, "scroll", OnScroll_wysiwyg.bind(this), false);
		this.addEvent(eventWysiwyg, "focus", OnFocus_wysiwyg.bind(this), false);
		this.addEvent(eventWysiwyg, "blur", OnBlur_wysiwyg.bind(this), false);

		/** line breaker */
		this.addEvent(eventWysiwyg, "mousemove", OnMouseMove_wysiwyg.bind(this), false);
		this.addEvent(
			this._lineBreakerButton,
			"mousedown",
			function (e) {
				e.preventDefault();
			},
			false
		);
		this.addEvent(this._lineBreakerButton, "click", DisplayLineBreak.bind(this, ""), false);
		this.addEvent(this.context.element.lineBreaker_t, "mousedown", DisplayLineBreak.bind(this, "t"), false);
		this.addEvent(this.context.element.lineBreaker_b, "mousedown", DisplayLineBreak.bind(this, "b"), false);

		/** Events are registered only when there is a table plugin.  */
		if (this.plugins.table) {
			this.addEvent(eventWysiwyg, "touchstart", wwMouseDown, {
				passive: true,
				useCapture: false
			});
		}

		/** code view area auto line */
		if (this.options.height === "auto" && !this.options.codeMirrorEditor) {
			const cvAuthHeight = this.__core._codeViewAutoHeight.bind(this.editor);
			this.addEvent(this.context.element.code, "keydown", cvAuthHeight, false);
			this.addEvent(this.context.element.code, "keyup", cvAuthHeight, false);
			this.addEvent(this.context.element.code, "paste", cvAuthHeight, false);
		}

		/** resizingBar */
		if (this.context.element.resizingBar) {
			if (/\d+/.test(this.options.height) && this.options.resizeEnable) {
				this.addEvent(this.context.element.resizingBar, "mousedown", OnMouseDown_resizingBar.bind(this), false);
			} else {
				domUtils.addClass(this.context.element.resizingBar, "se-resizing-none");
			}
		}

		/** set response toolbar */
		this.toolbar._setResponsive();

		/** responsive toolbar observer */
		if (!env.isIE) this._toolbarObserver = new _w.ResizeObserver(this.toolbar.resetResponsiveToolbar.bind(this.toolbar));

		/** window event */
		this.addEvent(_w, "resize", OnResize_window.bind(this), false);
		if (this.options.stickyToolbar > -1) {
			this.addEvent(_w, "scroll", this.toolbar._resetSticky.bind(this.toolbar), false);
		}
	},

	_removeAllEvents: function () {
		for (let i = 0, len = this._events.length, e; i < len; i++) {
			e = this._events[i];
			e.target.removeEventListener(e.type, e.handler);
		}
		
		this._events = [];

		if (this._resizeObserver) {
			this._resizeObserver.unobserve(this.context.element.wysiwygFrame);
			this._resizeObserver = null;
		}

		if (this._toolbarObserver) {
			this._toolbarObserver.unobserve(this.context.element._toolbarShadow);
			this._toolbarObserver = null;
		}
	},

	constructor: EventManager
};

function ToolbarButtonsHandler(e) {
	let target = e.target;
	if (this.menu._bindControllersOff) e.stopPropagation();

	if (/^(input|textarea|select|option)$/i.test(target.nodeName)) {
		this.__core._antiBlur = false;
	} else {
		e.preventDefault();
	}

	if (domUtils.getParentElement(target, ".se-dropdown")) {
		e.stopPropagation();
		this.__core._notHideToolbar = true;
	} else {
		let command = target.getAttribute("data-command");
		let className = target.className;

		while (!command && !/se-menu-list/.test(className) && !/sun-editor-common/.test(className)) {
			target = target.parentNode;
			command = target.getAttribute("data-command");
			className = target.className;
		}

		if (command === this.menu._dropdownName || command === this.__core._containerName) {
			e.stopPropagation();
		}
	}
}

function OnClick_toolbar(e) {
	let target = e.target;
	let display = target.getAttribute("data-display");
	let command = target.getAttribute("data-command");
	let className = target.className;
	this.__core.controllerOff();

	while (target.parentNode && !command && !/se-menu-list/.test(className) && !/se-toolbar/.test(className)) {
		target = target.parentNode;
		command = target.getAttribute("data-command");
		display = target.getAttribute("data-display");
		className = target.className;
	}

	if (!command && !display) return;
	if (target.disabled) return;
	if (!this.status.isReadOnly && !this.status.hasFocus) this.__core.nativeFocus();
	if (!this.status.isReadOnly && !this.status.isCodeView) this.selection._init();

	this.__core.actionCall(command, display, target);
}

function OnMouseDown_wysiwyg(e) {
	if (this.status.isReadOnly || domUtils.isNonEditable(this.context.element.wysiwyg)) return;
	this.selection._init();

	// user event
	if (typeof this.events.onMouseDown === "function" && this.events.onMouseDown(e) === false) return;

	const tableCell = domUtils.getParentElement(e.target, domUtils.isTableCell);
	if (tableCell) {
		const tablePlugin = this.plugins.table;
		if (tablePlugin && tableCell !== tablePlugin._fixedCell && !tablePlugin._shift) {
			tablePlugin.onTableCellMultiSelect(tableCell, false);
		}
	}

	if (this.__core._isBalloon) {
		this._hideToolbar();
	}

	if (/FIGURE/i.test(e.target.nodeName)) e.preventDefault();
}

function OnClick_wysiwyg(e) {
	const targetElement = e.target;

	if (this.status.isReadOnly) {
		e.preventDefault();
		if (domUtils.isAnchor(targetElement)) {
			_w.open(targetElement.href, targetElement.target);
		}
		return false;
	}

	if (domUtils.isNonEditable(this.context.element.wysiwyg)) return;

	// user event
	if (typeof this.events.onClick === "function" && this.events.onClick(e) === false) return;

	const fileComponentInfo = this.component.get(targetElement);
	if (fileComponentInfo) {
		e.preventDefault();
		this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName);
		return;
	}

	const figcaption = domUtils.getParentElement(targetElement, "FIGCAPTION");
	if (figcaption && (domUtils.isNonEditable(figcaption) || !figcaption.getAttribute("contenteditable"))) {
		e.preventDefault();
		figcaption.setAttribute("contenteditable", true);
		figcaption.focus();

		if (this.__core._isInline && !this.toolbar._inlineToolbarAttr.isShow) {
			this.toolbar._showInline();

			const hideToolbar = function () {
				this._hideToolbar();
				figcaption.removeEventListener("blur", hideToolbar);
			};

			figcaption.addEventListener("blur", hideToolbar);
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
				const oLi = domUtils.createElement("LI", null, selectionNode);
				rangeEl.insertBefore(oLi, prevLi);
				this.__core.focus();
			} else if (!domUtils.isWysiwygFrame(selectionNode) && !this.component.is(selectionNode) && (!domUtils.isTable(selectionNode) || domUtils.isTableCell(selectionNode)) && this._setDefaultLine(this.format.isBlock(rangeEl) ? "DIV" : this.options.defaultTag) !== null) {
				e.preventDefault();
				this.__core.focus();
			} else {
				this.applyTagEffect();
			}
		}
	} else {
		this.applyTagEffect();
	}

	if (this.__core._isBalloon) _w.setTimeout(this._toggleToolbarBalloon.bind(this));
}

function OnInput_wysiwyg(e) {
	if (this.status.isReadOnly || this.status.isDisabled) {
		e.preventDefault();
		e.stopPropagation();
		this.history.go(this.history.getCurrentIndex());
		return false;
	}

	this.selection._init();

	// user event
	if (typeof this.events.onInput === "function" && this.events.onInput(e) === false) return;

	const data = (e.data === null ? "" : e.data === undefined ? " " : e.data) || "";
	if (!this.char.test(data)) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	// history stack
	this.history.push(true);
}

function OnKeyDown_wysiwyg(e) {
	const keyCode = e.keyCode;
	const shift = e.shiftKey;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	const alt = e.altKey;
	this._IEisComposing = keyCode === 229;

	if (!ctrl && this.status.isReadOnly && !this._directionKeyCode.test(keyCode)) {
		e.preventDefault();
		return false;
	}

	this.__core.dropdownOff();

	if (this.__core._isBalloon) {
		this._hideToolbar();
	}

	// user event
	if (typeof this.events.onKeyDown === "function" && this.events.onKeyDown(e) === false) return;

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
	const fileComponentName = this.__core._fileManager.pluginRegExp.test(this.__core.currentControllerName) ? this.__core.currentControllerName : "";
	let formatEl = this.format.getLine(selectionNode, null) || selectionNode;
	let rangeEl = this.format.getBlock(formatEl, null);

	switch (keyCode) {
		case 8 /** backspace key */ :
			if (!selectRange) {
				if (fileComponentName) {
					e.preventDefault();
					e.stopPropagation();
					this.plugins[fileComponentName].destroy();
					break;
				}
			}

			if (selectRange && this._hardDelete()) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			if (!this.format.isLine(formatEl) && !this.context.element.wysiwyg.firstElementChild && !this.component.is(selectionNode) && this._setDefaultLine(this.options.defaultTag) !== null) {
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
				if (domUtils.isWysiwygFrame(formatEl.parentNode) && formatEl.childNodes.length <= 1 && (!formatEl.firstChild || unicode.onlyZeroWidthSpace(formatEl.textContent))) {
					e.preventDefault();
					e.stopPropagation();

					if (formatEl.nodeName.toUpperCase() === this.options.defaultTag.toUpperCase()) {
						formatEl.innerHTML = "<br>";
						const attrs = formatEl.attributes;
						while (attrs[0]) {
							formatEl.removeAttribute(attrs[0].name);
						}
					} else {
						formatEl.parentElement.replaceChild(domUtils.createElement(this.options.defaultTag, null, "<br>"), formatEl);
					}

					this.__core.nativeFocus();
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
							prev = domUtils.createElement("BR");
							formatEl.appendChild(prev);
						} else {
							prev = next;
							offset = 0;
						}
					}

					selectionNode.textContent = "";
					this.node.removeAllParents(selectionNode, null, formatEl);
					offset = typeof offset === "number" ? offset : prev.nodeType === 3 ? prev.textContent.length : 1;
					this.selection.setRange(prev, offset, prev, offset);
					break;
				}
			}

			// tag[contenteditable="false"]
			if (this._isUneditableNode(range, true)) {
				e.preventDefault();
				e.stopPropagation();
				break;
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

						this.selection.removeNode();
						if (range.startContainer.nodeType === 3) {
							this.selection.setRange(range.startContainer, range.startContainer.textContent.length, range.startContainer, range.startContainer.textContent.length);
						}
						// history stack
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

							domUtils.remove(formatEl);
							if (rangeEl.children.length === 0) domUtils.remove(rangeEl);

							this.selection.setRange(con, offset, con, offset);
							// history stack
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
							if (comm.previousSibling.nodeType === 1 || !unicode.onlyZeroWidthSpace(comm.previousSibling.textContent.trim())) {
								detach = false;
								break;
							}
						}
						comm = comm.parentNode;
					}

					if (detach && rangeEl.parentNode) {
						e.preventDefault();
						this.format.removeBlock(rangeEl, domUtils.isListCell(formatEl) ? [formatEl] : null, null, false, false);
						// history stack
						this.history.push(true);
						break;
					}
				}
			}

			// component
			if (!selectRange && formatEl && (range.startOffset === 0 || (selectionNode === formatEl ? !!formatEl.childNodes[range.startOffset] : false))) {
				const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : selectionNode;
				const prev = formatEl.previousSibling;
				// select file component
				const ignoreZWS = (commonCon.nodeType === 3 || domUtils.isBreak(commonCon)) && !commonCon.previousSibling && range.startOffset === 0;
				if (!sel.previousSibling && (this.component.is(commonCon.previousSibling) || (ignoreZWS && this.component.is(prev)))) {
					const fileComponentInfo = this.component.get(prev);
					if (fileComponentInfo) {
						e.preventDefault();
						e.stopPropagation();
						if (formatEl.textContent.length === 0) domUtils.remove(formatEl);
						if (this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) this.__core.blur();
					} else if (this.component.is(prev)) {
						e.preventDefault();
						e.stopPropagation();
						domUtils.remove(prev);
					}
					break;
				}
				// delete nonEditable
				if (domUtils.isNonEditable(sel.previousSibling)) {
					e.preventDefault();
					e.stopPropagation();
					domUtils.remove(sel.previousSibling);
					break;
				}
			}

			break;
		case 46 /** delete key */ :
			if (fileComponentName) {
				e.preventDefault();
				e.stopPropagation();
				this.plugins[fileComponentName].destroy();
				break;
			}

			if (selectRange && this._hardDelete()) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			// tag[contenteditable="false"]
			if (this._isUneditableNode(range, false)) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			// component
			if ((this.format.isLine(selectionNode) || selectionNode.nextSibling === null || (unicode.onlyZeroWidthSpace(selectionNode.nextSibling) && selectionNode.nextSibling.nextSibling === null)) && range.startOffset === selectionNode.textContent.length) {
				const nextEl = formatEl.nextElementSibling;
				if (!nextEl) break;
				if (this.component.is(nextEl)) {
					e.preventDefault();

					if (unicode.onlyZeroWidthSpace(formatEl)) {
						domUtils.remove(formatEl);
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
						if (this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) this.__core.blur();
					} else if (this.component.is(nextEl)) {
						e.stopPropagation();
						domUtils.remove(nextEl);
					}

					break;
				}
			}

			if (!selectRange && (domUtils.isEdgePoint(range.endContainer, range.endOffset) || (selectionNode === formatEl ? !!formatEl.childNodes[range.startOffset] : false))) {
				const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] || selectionNode : selectionNode;
				// delete nonEditable
				if (sel && domUtils.isNonEditable(sel.nextSibling)) {
					e.preventDefault();
					e.stopPropagation();
					domUtils.remove(sel.nextSibling);
					break;
				} else if (this.component.is(sel)) {
					e.preventDefault();
					e.stopPropagation();
					domUtils.remove(sel);
					break;
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
				if (range.startContainer !== range.endContainer) this.selection.removeNode();

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
						domUtils.remove(child);
					} else {
						con = next.firstChild;
						children = next.childNodes;
						while (children[0]) {
							formatEl.appendChild(children[0]);
						}
						domUtils.remove(next);
					}
					this.selection.setRange(con, 0, con, 0);
					// history stack
					this.history.push(true);
				}
				break;
			}

			break;
		case 9 /** tab key */ :
			if (fileComponentName || this.options.tabDisable) break;
			e.preventDefault();
			if (ctrl || alt || domUtils.isWysiwygFrame(selectionNode)) break;

			const isEdge = !range.collapsed || domUtils.isEdgePoint(range.startContainer, range.startOffset);
			const selectedFormats = this.selection.getLines(null);
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
			} else {
				// table
				const tableCell = domUtils.getParentElement(selectionNode, domUtils.isTableCell);
				if (tableCell && isEdge) {
					const table = domUtils.getParentElement(tableCell, "table");
					const cells = domUtils.getListChildren(table, domUtils.isTableCell);
					let idx = shift ? domUtils.prevIndex(cells, tableCell) : domUtils.nextIndex(cells, tableCell);

					if (idx === cells.length && !shift) idx = 0;
					if (idx === -1 && shift) idx = cells.length - 1;

					let moveCell = cells[idx];
					if (!moveCell) break;
					moveCell = moveCell.firstElementChild || moveCell;
					this.__core.setRange(moveCell, 0, moveCell, 0);
					break;
				}

				lines = lines.concat(cells);
				fc = lc = null;
			}

			// Lines tab(4)
			if (lines.length > 0) {
				if (!shift) {
					const tabText = domUtils.createTextNode(new _w.Array(this.status.tabSize + 1).join("\u00A0"));
					if (lines.length === 1) {
						const textRange = this.selection.insertNode(tabText, null, true);
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

						const firstChild = domUtils.getEdgeChild(lines[0], "text", false);
						const endChild = domUtils.getEdgeChild(lines[len], "text", true);
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
							if (unicode.onlyZeroWidthSpace(child)) continue;

							if (/^\s{1,4}$/.test(child.textContent)) {
								domUtils.remove(child);
							} else if (/^\s{1,4}/.test(child.textContent)) {
								child.textContent = child.textContent.replace(/^\s{1,4}/, "");
							}

							break;
						}
					}

					const firstChild = domUtils.getEdgeChild(lines[0], "text", false);
					const endChild = domUtils.getEdgeChild(lines[len], "text", true);
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
			// history stack
			this.history.push(false);

			break;
		case 13 /** enter key */ :
			const brLine = this.format.getBrLine(selectionNode, null);

			if (this.options.charCounterType === "byte-html") {
				let enterHTML = "";
				if ((!shift && brLine) || shift) {
					enterHTML = "<br>";
				} else {
					enterHTML = "<" + formatEl.nodeName + "><br></" + formatEl.nodeName + ">";
				}

				if (!this.char.check(enterHTML)) {
					e.preventDefault();
					return false;
				}
			}

			if (!shift) {
				const formatInners = this.format.isEdgeLine(range.endContainer, range.endOffset, "end");
				if ((formatInners && /^H[1-6]$/i.test(formatEl.nodeName)) || /^HR$/i.test(formatEl.nodeName)) {
					e.preventDefault();
					let temp = null;
					const newFormat = this.format.appendLine(formatEl, this.options.defaultTag);

					if (formatInners && formatInners.length > 0) {
						temp = formatInners.pop();
						const innerNode = temp;
						while (formatInners.length > 0) {
							temp = temp.appendChild(formatInners.pop());
						}
						newFormat.appendChild(innerNode);
					}

					temp = !temp ? newFormat.firstChild : temp.appendChild(newFormat.firstChild);
					this.selection.setRange(temp, 0, temp, 0);
					break;
				} else if (this.options.lineAttrReset && formatEl && !domUtils.isListCell(formatEl)) {
					e.preventDefault();
					e.stopPropagation();

					let newEl;
					if (!range.collapsed) {
						const isMultiLine = domUtils.getFormatElement(range.startContainer, null) !== domUtils.getFormatElement(range.endContainer, null);
						const r = this.selection.removeNode();
						if (isMultiLine) {
							newEl = domUtils.getFormatElement(r.container, null);

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
						if (domUtils.onlyZeroWidthSpace(formatEl)) newEl = this.format.appendLine(formatEl, formatEl.cloneNode(false));
						else newEl = this.node.split(range.endContainer, range.endOffset, 0);
					}

					const resetAttr = options.lineAttrReset === '*' ? null : options.lineAttrReset;
					const attrs = newEl.attributes;
					let i = 0;
					while (attrs[i]) {
						if (resetAttr && resetAttr.test(attrs[i].name)) {
							i++;
							continue;
						}
						newEl.removeAttribute(attrs[i].name);
					}
					this.selection.setRange(newEl.firstChild, 0, newEl.firstChild, 0);

					break;
				}

				if (brLine) {
					e.preventDefault();
					const selectionFormat = selectionNode === brLine;
					const wSelection = this.selection.get();
					const children = selectionNode.childNodes,
						offset = wSelection.focusOffset,
						prev = selectionNode.previousElementSibling,
						next = selectionNode.nextSibling;

					if (
						!this.format.isClosureBrLine(brLine) &&
						!!children &&
						((selectionFormat &&
								range.collapsed &&
								children.length - 1 <= offset + 1 &&
								domUtils.isBreak(children[offset]) &&
								(!children[offset + 1] || ((!children[offset + 2] || unicode.onlyZeroWidthSpace(children[offset + 2].textContent)) && children[offset + 1].nodeType === 3 && unicode.onlyZeroWidthSpace(children[offset + 1].textContent))) &&
								offset > 0 &&
								domUtils.isBreak(children[offset - 1])) ||
							(!selectionFormat && unicode.onlyZeroWidthSpace(selectionNode.textContent) && domUtils.isBreak(prev) && (domUtils.isBreak(prev.previousSibling) || !unicode.onlyZeroWidthSpace(prev.previousSibling.textContent)) && (!next || (!domUtils.isBreak(next) && unicode.onlyZeroWidthSpace(next.textContent)))))
					) {
						if (selectionFormat) domUtils.remove(children[offset - 1]);
						else domUtils.remove(selectionNode);
						const newEl = this.format.appendLine(brLine, this.format.isLine(brLine.nextElementSibling) && !this.format.isBlock(brLine.nextElementSibling) ? brLine.nextElementSibling : null);
						this.format.copyAttributes(newEl, brLine);
						this.selection.setRange(newEl, 1, newEl, 1);
						break;
					}

					if (selectionFormat) {
						this.selection.insertHTML(range.collapsed && domUtils.isBreak(range.startContainer.childNodes[range.startOffset - 1]) ? "<br>" : "<br><br>", true, false);

						let focusNode = wSelection.focusNode;
						const wOffset = wSelection.focusOffset;
						if (brLine === focusNode) {
							focusNode = focusNode.childNodes[wOffset - offset > 1 ? wOffset - 1 : wOffset];
						}

						this.selection.setRange(focusNode, 1, focusNode, 1);
					} else {
						const focusNext = wSelection.focusNode.nextSibling;
						const br = domUtils.createElement("BR");
						this.selection.insertNode(br, null, false);

						const brPrev = br.previousSibling,
							brNext = br.nextSibling;
						if (!domUtils.isBreak(focusNext) && !domUtils.isBreak(brPrev) && (!brNext || unicode.onlyZeroWidthSpace(brNext))) {
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
					const br = domUtils.createElement("BR");
					const newEl = domUtils.createElement("LI", null, br);

					formatEl.parentNode.insertBefore(newEl, formatEl.nextElementSibling);
					newEl.appendChild(selectionNode.nextSibling);

					this.selection.setRange(br, 1, br, 1);
					break;
				}

				if ((range.commonAncestorContainer.nodeType === 3 ? !range.commonAncestorContainer.nextElementSibling : true) && unicode.onlyZeroWidthSpace(formatEl.innerText.trim())) {
					e.preventDefault();
					let newEl = null;

					if (domUtils.isListCell(rangeEl.parentNode)) {
						rangeEl = formatEl.parentNode.parentNode.parentNode;
						newEl = this.node.split(formatEl, null, domUtils.getNodeDepth(formatEl) - 2);
						if (!newEl) {
							const newListCell = domUtils.createElement("LI", null, "<br>");
							rangeEl.insertBefore(newListCell, newEl);
							newEl = newListCell;
						}
					} else {
						const newFormat = domUtils.isTableCell(rangeEl.parentNode) ?
							"DIV" :
							domUtils.isList(rangeEl.parentNode) ?
							"LI" :
							this.format.isLine(rangeEl.nextElementSibling) && !this.format.isBlock(rangeEl.nextElementSibling) ?
							rangeEl.nextElementSibling.nodeName :
							this.format.isLine(rangeEl.previousElementSibling) && !this.format.isBlock(rangeEl.previousElementSibling) ?
							rangeEl.previousElementSibling.nodeName :
							this.options.defaultTag;

						newEl = domUtils.createElement(newFormat);
						const edge = this.format.removeBlock(rangeEl, [formatEl], null, true, true);
						edge.cc.insertBefore(newEl, edge.ec);
					}

					newEl.innerHTML = "<br>";
					this.node.removeAllParents(formatEl, null, null);
					this.selection.setRange(newEl, 1, newEl, 1);
					break;
				}
			}

			if (rangeEl && domUtils.getParentElement(rangeEl, "FIGCAPTION") && domUtils.getParentElement(rangeEl, domUtils.isList)) {
				e.preventDefault();
				formatEl = this.format.appendLine(formatEl, null);
				this.selection.setRange(formatEl, 0, formatEl, 0);
			}

			if (fileComponentName) {
				e.preventDefault();
				e.stopPropagation();
				const compContext = context[fileComponentName];
				const container = compContext._container;
				const sibling = container.previousElementSibling || container.nextElementSibling;

				let newEl = null;
				if (domUtils.isListCell(container.parentNode)) {
					newEl = domUtils.createElement("BR");
				} else {
					newEl = domUtils.createElement((this.format.isLine(sibling) && !this.format.isBlock(sibling)) ? sibling.nodeName : this.options.defaultTag, null, "<br>");
				}

				container.parentNode.insertBefore(newEl, container);
				if (this.component.select(compContext._element, fileComponentName) === false) this.__core.blur();
			}

			break;
		case 27:
			if (fileComponentName) {
				e.preventDefault();
				e.stopPropagation();
				this.__core.controllerOff();
				return false;
			}
			break;
	}

	if (shift && keyCode === 16) {
		e.preventDefault();
		e.stopPropagation();
		const tablePlugin = this.plugins.table;
		if (tablePlugin && !tablePlugin._shift && !tablePlugin._ref) {
			const cell = domUtils.getParentElement(formatEl, domUtils.isTableCell);
			if (cell) {
				tablePlugin.onTableCellMultiSelect(cell, true);
				return;
			}
		}
	} else if (shift && (env.isOSX_IOS ? alt : ctrl) && keyCode === 32) {
		e.preventDefault();
		e.stopPropagation();
		const nbsp = this.selection.insertNode(domUtils.createTextNode("\u00a0"));
		if (nbsp && nbsp.container) {
			this.selection.setRange(nbsp.container, nbsp.endOffset, nbsp.container, nbsp.endOffset);
			return;
		}
	}

	const textKey = !ctrl && !alt && !selectRange && !this._nonTextKeyCode.test(keyCode);
	if (textKey && range.collapsed && range.startContainer === range.endContainer && domUtils.isBreak(range.commonAncestorContainer)) {
		const zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
		this.selection.insertNode(zeroWidth, null, false);
		this.selection.setRange(zeroWidth, 1, zeroWidth, 1);
	}
}

function OnKeyUp_wysiwyg(e) {
	if (this._onShortcutKey) return;

	this.selection._init();
	const keyCode = e.keyCode;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	const alt = e.altKey;

	if (this.status.isReadOnly) {
		if (!ctrl && this._directionKeyCode.test(keyCode)) this.applyTagEffect();
		return;
	}

	const range = this.selection.getRange();
	let selectionNode = this.selection.getNode();

	if (this.__core._isBalloon && ((this.__core._isBalloonAlways && keyCode !== 27) || !range.collapsed)) {
		if (this.__core._isBalloonAlways) {
			if (keyCode !== 27) this._showToolbarBalloonDelay();
		} else {
			this.toolbar._showBalloon();
			return;
		}
	}

	/** when format tag deleted */
	if (keyCode === 8 && domUtils.isWysiwygFrame(selectionNode) && selectionNode.textContent === "" && selectionNode.children.length === 0) {
		e.preventDefault();
		e.stopPropagation();

		selectionNode.innerHTML = "";

		const oFormatTag = domUtils.createElement(this.format.isLine(this.status.currentNodes[0]) ? this.status.currentNodes[0] : this.options.defaultTag, null, "<br>");
		selectionNode.appendChild(oFormatTag);
		this.selection.setRange(oFormatTag, 0, oFormatTag, 0);
		this.applyTagEffect();

		this.history.push(false);
		return;
	}

	const formatEl = this.format.getLine(selectionNode, null);
	const rangeEl = this.format.getBlock(selectionNode, null);
	if (!formatEl && range.collapsed && !this.component.is(selectionNode) && !domUtils.isList(selectionNode) && this._setDefaultLine(this.format.isBlock(rangeEl) ? 'DIV' : this.options.defaultTag) !== null) {
		selectionNode = this.selection.getNode();
	}

	if (this._directionKeyCode.test(keyCode)) {
		this.applyTagEffect();
	}

	const textKey = !ctrl && !alt && !this._nonTextKeyCode.test(keyCode);
	if (textKey && selectionNode.nodeType === 3 && unicode.zeroWidthRegExp.test(selectionNode.textContent) && !(e.isComposing !== undefined ? e.isComposing : this._IEisComposing)) {
		let so = range.startOffset,
			eo = range.endOffset;
		const frontZeroWidthCnt = (selectionNode.textContent.substring(0, eo).match(this._frontZeroWidthReg) || "").length;
		so = range.startOffset - frontZeroWidthCnt;
		eo = range.endOffset - frontZeroWidthCnt;
		selectionNode.textContent = selectionNode.textContent.replace(unicode.zeroWidthRegExp, "");
		this.selection.setRange(selectionNode, so < 0 ? 0 : so, selectionNode, eo < 0 ? 0 : eo);
	}

	this.char.test("");

	// user event
	if (typeof this.events.onKeyUp === "function" && this.events.onKeyUp(e) === false) return;

	// history stack
	if (!ctrl && !alt && !this._historyIgnoreKeyCode.test(keyCode)) {
		this.history.push(true);
	}
}

function OnPaste_wysiwyg(e) {
	const clipboardData = env.isIE ? _w.clipboardData : e.clipboardData;
	if (!clipboardData) return true;
	return this._dataTransferAction("paste", e, clipboardData);
}

function OnCopy_wysiwyg(e) {
	const clipboardData = env.isIE ? _w.clipboardData : e.clipboardData;

	// user event
	if (typeof this.events.onCopy === "function" && !this.events.onCopy(e, clipboardData)) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const info = this.__core.currentFileComponentInfo;
	if (info && !env.isIE) {
		this._setClipboardComponent(e, info, clipboardData);
		domUtils.addClass(info.component, "se-component-copy");
		// copy effect
		_w.setTimeout(function () {
			domUtils.removeClass(info.component, "se-component-copy");
		}, 150);
	}
}

function OnDrop_wysiwyg(e) {
	if (this.status.isReadOnly || env.isIE) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const dataTransfer = e.dataTransfer;
	if (!dataTransfer) return true;

	this.selection.removeNode();
	this._setDropLocationSelection(e);
	return this._dataTransferAction("drop", e, dataTransfer);
}

function OnCut_wysiwyg(e) {
	const clipboardData = env.isIE ? _w.clipboardData : e.clipboardData;

	// user event
	if (typeof this.events.onCut === "function" && !this.events.onCut(e, clipboardData)) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const info = this.__core.currentFileComponentInfo;
	if (info && !env.isIE) {
		this._setClipboardComponent(e, info, clipboardData);
		domUtils.remove(info.component);
		this.__core.controllerOff();
	}

	_w.setTimeout(function () {
		// history stack
		this.history.push(false);
	});
}

function OnScroll_wysiwyg(e) {
	this.__core.controllerOff();
	if (this.__core._isBalloon) this._hideToolbar();

	// user event
	if (typeof this.events.onScroll === "function") this.events.onScroll(e);
}

function OnFocus_wysiwyg(e) {
	if (this.__core._antiBlur) return;
	this.status.hasFocus = true;
	this._w.setTimeout(this.applyTagEffect.bind(this));

	if (this.__core._isInline) this.toolbar._showInline();

	// user event
	if (typeof this.events.onFocus === "function") this.events.onFocus(e);
}

function OnBlur_wysiwyg(e) {
	if (this.__core._antiBlur || this.status.isCodeView) return;
	this.status.hasFocus = false;
	this.__core.controllerOff();
	if (this.__core._isInline || this.__core._isBalloon) this._hideToolbar();

	this._setKeyEffect([]);

	this.status.currentNodes = [];
	this.status.currentNodesMap = [];
	if (this.options.showPathLabel) this.context.element.navigation.textContent = "";

	// user event
	if (typeof this.events.onBlur === "function") this.events.onBlur(e);
}

function OnMouseMove_wysiwyg(e) {
	if (this.status.isDisabled || this.status.isReadOnly) return false;

	const component = domUtils.getParentElement(e.target, this.component.is);
	const lineBreakerStyle = this.__core._lineBreaker.style;

	if (component && !this.__core.currentControllerName) {
		const ctxEl = this.context.element;
		let scrollTop = 0;
		let el = ctxEl.wysiwyg;
		do {
			scrollTop += el.scrollTop;
			el = el.parentElement;
		} while (el && !/^(BODY|HTML)$/i.test(el.nodeName));

		const wScroll = ctxEl.wysiwyg.scrollTop;
		const offsets = this.offset.getGlobal(this.context.element.topArea);
		const componentTop = this.offset.get(component).top + wScroll;
		const y = e.pageY + scrollTop + (this.options.iframe && !this.options.toolbarContainer ? ctxEl.toolbar.offsetHeight : 0);
		const c = componentTop + (this.options.iframe ? scrollTop : offsets.top);

		const isList = domUtils.isListCell(component.parentNode);
		let dir = "",
			top = "";
		if ((isList ? !component.previousSibling : !this.format.isLine(component.previousElementSibling)) && y < c + 20) {
			top = componentTop;
			dir = "t";
		} else if ((isList ? !component.nextSibling : !this.format.isLine(component.nextElementSibling)) && y > c + component.offsetHeight - 20) {
			top = componentTop + component.offsetHeight;
			dir = "b";
		} else {
			lineBreakerStyle.display = "none";
			return;
		}

		this.status._lineBreakComp = component;
		this.status._lineBreakDir = dir;
		lineBreakerStyle.top = top - wScroll + "px";
		this._lineBreakerButton.style.left = this.offset.get(component).left + component.offsetWidth / 2 - 15 + "px";
		lineBreakerStyle.display = "block";
	} // off line breaker
	else if (lineBreakerStyle.display !== "none") {
		lineBreakerStyle.display = "none";
	}
}

function OnMouseDown_resizingBar(e) {
	e.stopPropagation();

	this.__core.dropdownOff();
	this.__core.controllerOff();

	this.status.resizeClientY = e.clientY;
	this.context.element.resizeBackground.style.display = "block";

	function closureFunc() {
		this.context.element.resizeBackground.style.display = "none";
		_d.removeEventListener("mousemove", this._resize_editor.bind(this));
		_d.removeEventListener("mouseup", closureFunc);
	}

	_d.addEventListener("mousemove", this._resize_editor.bind(this));
	_d.addEventListener("mouseup", closureFunc);
}

function DisplayLineBreak(dir, e) {
	e.preventDefault();

	dir = !dir ? this.status._lineBreakDir : dir;
	const component = this.status._lineBreakComp;
	const isList = domUtils.isListCell(component.parentNode);

	const format = domUtils.createElement(isList ? "BR" : domUtils.isTableCell(component.parentNode) ? "DIV" : this.options.defaultTag);
	if (!isList) format.innerHTML = "<br>";

	if (this.options.charCounterType === "byte-html" && !this.char.check(format.outerHTML)) return;

	component.parentNode.insertBefore(format, dir === "t" ? component : component.nextSibling);
	this.__core._lineBreaker.style.display = "none";
	this.status._lineBreakComp = null;

	const focusEl = isList ? format : format.firstChild;
	this.selection.setRange(focusEl, 1, focusEl, 1);
	// history stack
	this.history.push(false);
}

function OnResize_window() {
	this.__core.controllerOff();

	if (env.isIE) this.toolbar.resetResponsiveToolbar();

	if (this.context.element.toolbar.offsetWidth === 0) return;

	if (this.context.fileBrowser && this.context.fileBrowser.area.style.display === "block") {
		this.context.fileBrowser.body.style.maxHeight = _w.innerHeight - this.context.fileBrowser.header.offsetHeight - 50 + "px";
	}

	if (this.menu.dropdownActiveButton && this.menu.dropdownMenu) {
		this.__core._setMenuPosition(this.menu.dropdownActiveButton, this.menu.dropdownMenu);
	}

	if (this.status.isFullScreen) {
		this.status.innerHeight_fullScreen += _w.innerHeight - this.context.element.toolbar.offsetHeight - this.status.innerHeight_fullScreen;
		this.context.element.editorArea.style.height = this.status.innerHeight_fullScreen + "px";
		return;
	}

	if (this.status.isCodeView && this.__core._isInline) {
		this.toolbar._showInline();
		return;
	}

	this.__core._iframeAutoHeight();

	if (this.toolbar._sticky) {
		this.context.element.toolbar.style.width = this.context.element.topArea.offsetWidth - 2 + "px";
		this.toolbar._resetSticky();
	}
}

function ConvertListCell(dom) {
	const domTree = dom.childNodes;
	let html = '';

	for (let i = 0, len = domTree.length, node; i < len; i++) {
		node = domTree[i];
		if (node.nodeType === 1) {
			if (util.isFormatElement(node)) {
				html += '<li>' +(node.innerHTML.trim() || '<br>') + '</li>';
			} else if (util.isRangeFormatElement(node) && !util.isTable(node)) {
				html += ConvertListCell(node);
			} else {
				html += '<li>' + node.outerHTML + '</li>';
			}
		} else {
			html += '<li>' + (node.textContent || '<br>') + '</li>';
		}
	}

	return html;
}

export default EventManager;