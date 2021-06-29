/**
 * @fileoverview eventManager class
 * @author JiHong Lee.
 */
"use strict";

import EditorInterface from "../interface/editor";
import domUtil from "../helpers/dom";

function eventManager(editor) {
	EditorInterface.call(this, editor);
	this._events = [];
	this._onShortcutKey = false;
	this._IEisComposing = false; // In IE, there is no "e.isComposing" in the key-up event.
	this._directionKeyCode = new this._w.RegExp("^(8|13|3[2-9]|40|46)$");
	this._nonTextKeyCode = new this._w.RegExp("^(8|13|1[6-9]|20|27|3[3-9]|40|45|46|11[2-9]|12[0-3]|144|145)$");
	this._historyIgnoreKeyCode = new this._w.RegExp("^(1[6-9]|20|27|3[3-9]|40|45|11[2-9]|12[0-3]|144|145)$");
	this._frontZeroWidthReg = new this._w.RegExp(util.zeroWidthSpace + "+", "");
	this._balloonDelay = null;
}

eventManager.prototype = {
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
	 * @param {String} type Event type
	 * @param {Function} listener Event listener
	 * @param {Boolean} useCapture Use event capture
	 */
	addGlobalEvent: function (type, listener, useCapture) {
		_d.addEventListener(type, listener, useCapture);
		if (options.iframe) {
			this._wd.addEventListener(type, listener);
		}
	},

	/**
	 * @description Remove events from document.
	 * When created as an Iframe, the event of the document inside the Iframe is also removed.
	 * @param {String} type Event type
	 * @param {Function} listener Event listener
	 */
	removeGlobalEvent: function (type, listener) {
		_d.removeEventListener(type, listener);
		if (options.iframe) {
			this._wd.removeEventListener(type, listener);
		}
	},

	applyTagEffect: function () {
		let selectionNode = core.selection.getNode();
		if (selectionNode === core.effectNode) return;
		core.effectNode = selectionNode;

		const marginDir = options.rtl ? "marginRight" : "marginLeft";
		const commandMap = core.commandMap;
		const classOnCheck = this._onButtonsCheck;
		const commandMapNodes = [];
		const currentNodes = [];

		const activePlugins = core.activePlugins;
		const cLen = activePlugins.length;
		let nodeName = "";

		while (selectionNode.firstChild) {
			selectionNode = selectionNode.firstChild;
		}

		for (let element = selectionNode; !util.isWysiwygDiv(element); element = element.parentNode) {
			if (!element) break;
			if (element.nodeType !== 1 || util.isBreak(element)) continue;
			nodeName = element.nodeName.toUpperCase();
			currentNodes.push(nodeName);

			/* Active plugins */
			if (!core.isReadOnly) {
				for (let c = 0, name; c < cLen; c++) {
					name = activePlugins[c];
					if (commandMapNodes.indexOf(name) === -1 && plugins[name].active.call(core, element)) {
						commandMapNodes.push(name);
					}
				}
			}

			if (!core.isReadOnly && util.isFormatElement(element)) {
				/* Outdent */
				if (commandMapNodes.indexOf("OUTDENT") === -1 && commandMap.OUTDENT) {
					if (util.isListCell(element) || (element.style[marginDir] && util.getNumber(element.style[marginDir], 0) > 0)) {
						commandMapNodes.push("OUTDENT");
						commandMap.OUTDENT.removeAttribute("disabled");
					}
				}

				/* Indent */
				if (commandMapNodes.indexOf("INDENT") === -1 && commandMap.INDENT) {
					commandMapNodes.push("INDENT");
					if (util.isListCell(element) && !element.previousElementSibling) {
						commandMap.INDENT.setAttribute("disabled", true);
					} else {
						commandMap.INDENT.removeAttribute("disabled");
					}
				}

				continue;
			}

			/** default active buttons [strong, ins, em, del, sub, sup] */
			if (classOnCheck.test(nodeName)) {
				commandMapNodes.push(nodeName);
				util.addClass(commandMap[nodeName], "active");
			}
		}

		core._setKeyEffect(commandMapNodes);

		/** save current nodes */
		core._variable.currentNodes = currentNodes.reverse();
		core._variable.currentNodesMap = commandMapNodes;

		/**  Displays the current node structure to resizingBar */
		if (options.showPathLabel) context.element.navigation.textContent = core._variable.currentNodes.join(" > ");
	},

	/**
	 * @description remove class, display text.
	 * @param {Array|null} ignoredList Igonred button list
	 */
	_setKeyEffect: function (ignoredList) {
		const commandMap = this.commandMap;
		const activePlugins = this.activePlugins;

		for (let key in commandMap) {
			if (ignoredList.indexOf(key) > -1 || !util.hasOwn(commandMap, key)) continue;
			if (activePlugins.indexOf(key) > -1) {
				plugins[key].active.call(this, null);
			} else if (commandMap.OUTDENT && /^OUTDENT$/i.test(key)) {
				if (!this.isReadOnly) commandMap.OUTDENT.setAttribute('disabled', true);
			} else if (commandMap.INDENT && /^INDENT$/i.test(key)) {
				if (!this.isReadOnly) commandMap.INDENT.removeAttribute('disabled');
			} else {
				util.removeClass(commandMap[key], 'active');
			}
		}
	},

	_showToolbarBalloonDelay: function () {
		if (this._balloonDelay) {
			this._w.clearTimeout(this._balloonDelay);
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
		core.selection._init();
		const range = core.getRange();
		if (core._bindControllersOff || (!core._isBalloonAlways && range.collapsed)) this._hideToolbar();
		else this.toolbar._showBalloon(range);
	},

	_hideToolbar: function () {
		if (!core._notHideToolbar && !core._variable.isFullScreen) {
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
			siblingNode = event._isUneditableNode_getSibling(container.childNodes[offset], siblingKey, container);
			return siblingNode && siblingNode.nodeType === 1 && siblingNode.getAttribute("contenteditable") === "false";
		} else {
			siblingNode = event._isUneditableNode_getSibling(container, siblingKey, container);
			return core.isEdgePoint(container, offset, isFront ? "front" : "end") && siblingNode && siblingNode.nodeType === 1 && siblingNode.getAttribute("contenteditable") === "false";
		}
	},

	_isUneditableNode_getSibling: function (selectNode, siblingKey, container) {
		if (!selectNode) return null;
		let siblingNode = selectNode[siblingKey];

		if (!siblingNode) {
			siblingNode = this.format.getLine(container);
			siblingNode = siblingNode ? siblingNode[siblingKey] : null;
			if (siblingNode && !this.node.isComponent(siblingNode)) siblingNode = siblingKey === "previousSibling" ? siblingNode.firstElementChild : siblingNode.lastElementChild;
			else return null;
		}

		return siblingNode;
	},

	_resize_editor: function (e) {
		const resizeInterval = context.element.editorArea.offsetHeight + (e.clientY - core._variable.resizeClientY);
		context.element.wysiwygFrame.style.height = context.element.code.style.height = (resizeInterval < core._variable.minResizingSize ? core._variable.minResizingSize : resizeInterval) + "px";
		core._variable.resizeClientY = e.clientY;
	},

	// FireFox - table delete, Chrome - image, video, audio
	_hardDelete: function () {
		const range = core.getRange();
		const sc = range.startContainer;
		const ec = range.endContainer;

		// table
		const sCell = this.format.getRangeBlock(sc);
		const eCell = this.format.getRangeBlock(ec);
		const sIsCell = util.isTableCell(sCell);
		const eIsCell = util.isTableCell(eCell);
		const ancestor = range.commonAncestorContainer;
		if (((sIsCell && !sCell.previousElementSibling && !sCell.parentElement.previousElementSibling) || (eIsCell && !eCell.nextElementSibling && !eCell.parentElement.nextElementSibling)) && sCell !== eCell) {
			if (!sIsCell) {
				util.removeItem(util.getParentElement(eCell, function(current) {return ancestor === current.parentNode;}));
			} else if (!eIsCell) {
				util.removeItem(util.getParentElement(sCell, function(current) {return ancestor === current.parentNode;}));
			} else {
				util.removeItem(util.getParentElement(sCell, function(current) {return ancestor === current.parentNode;}));
				core.nativeFocus();
				return true;
			}
		}

		// component
		const sComp = sc.nodeType === 1 ? util.getParentElement(sc, ".se-component") : null;
		const eComp = ec.nodeType === 1 ? util.getParentElement(ec, ".se-component") : null;
		if (sComp) util.removeItem(sComp);
		if (eComp) util.removeItem(eComp);

		return false;
	},

	/**
	 * @description If there is no default format, add a line and move "selection".
	 * @param {String|null} formatName Format tag name (default: 'P')
	 * @private
	 */
	_setDefaultLine: function (formatName) {
		if (this._fileManager.pluginRegExp.test(this.currentControllerName)) return;

		const range = this.getRange();
		const commonCon = range.commonAncestorContainer;
		const startCon = range.startContainer;
		const rangeEl = this.format.getRangeBlock(commonCon, null);
		let focusNode, offset, format;

		const fileComponent = util.getParentElement(commonCon, this.node.isComponent);
		if (fileComponent && !util.isTable(fileComponent)) return;
		if ((util.isRangeFormatElement(startCon) || util.isWysiwygDiv(startCon)) && (this.node.isComponent(startCon.children[range.startOffset]) || this.node.isComponent(startCon.children[range.startOffset - 1]))) return;
		if (util.getParentElement(commonCon, util.isNotCheckingNode)) return null;

		if (rangeEl) {
			format = util.createElement(formatName || options.defaultTag);
			format.innerHTML = rangeEl.innerHTML;
			if (format.childNodes.length === 0) format.innerHTML = util.zeroWidthSpace;

			rangeEl.innerHTML = format.outerHTML;
			format = rangeEl.firstChild;
			focusNode = util.getEdgeChildNodes(format, null).sc;

			if (!focusNode) {
				focusNode = util.createTextNode(util.zeroWidthSpace);
				format.insertBefore(focusNode, format.firstChild);
			}

			offset = focusNode.textContent.length;
			this.setRange(focusNode, offset, focusNode, offset);
			return;
		}

		if (util.isRangeFormatElement(commonCon) && commonCon.childNodes.length <= 1) {
			let br = null;
			if (commonCon.childNodes.length === 1 && util.isBreak(commonCon.firstChild)) {
				br = commonCon.firstChild;
			} else {
				br = util.createTextNode(util.zeroWidthSpace);
				commonCon.appendChild(br);
			}

			this.setRange(br, 1, br, 1);
			return;
		}

		this.execCommand("formatBlock", false, formatName || options.defaultTag);
		focusNode = util.getEdgeChildNodes(commonCon, commonCon);
		focusNode = focusNode ? focusNode.ec : commonCon;

		format = this.format.getLine(focusNode, null);
		if (!format) {
			this.removeRange();
			this.selection._init();
			return;
		}

		if (util.isBreak(format.nextSibling)) util.removeItem(format.nextSibling);
		if (util.isBreak(format.previousSibling)) util.removeItem(format.previousSibling);
		if (util.isBreak(focusNode)) {
			const zeroWidth = util.createTextNode(util.zeroWidthSpace);
			focusNode.parentNode.insertBefore(zeroWidth, focusNode);
			focusNode = zeroWidth;
		}

		this.effectNode = null;
		this.nativeFocus();
	},

	_setClipboardComponent: function (e, info, clipboardData) {
		e.preventDefault();
		e.stopPropagation();
		clipboardData.setData("text/html", info.component.outerHTML);
	},

	_setDropLocationSelection: function (e) {
		if (e.rangeParent) {
			core.setRange(e.rangeParent, e.rangeOffset, e.rangeParent, e.rangeOffset);
		} else if (core._wd.caretRangeFromPoint) {
			const r = core._wd.caretRangeFromPoint(e.clientX, e.clientY);
			core.setRange(r.startContainer, r.startOffset, r.endContainer, r.endOffset);
		} else {
			const r = core.getRange();
			core.setRange(r.startContainer, r.startOffset, r.endContainer, r.endOffset);
		}
	},

	_dataTransferAction: function (type, e, data) {
		let plainText, cleanData;
		if (util.isIE) {
			plainText = data.getData("Text");

			const range = core.getRange();
			const tempDiv = util.createElement("DIV");
			const tempRange = {
				sc: range.startContainer,
				so: range.startOffset,
				ec: range.endContainer,
				eo: range.endOffset
			};

			tempDiv.setAttribute("contenteditable", true);
			tempDiv.style.cssText = "position:absolute; top:0; left:0; width:1px; height:1px; overflow:hidden;";

			context.element.relative.appendChild(tempDiv);
			tempDiv.focus();

			_w.setTimeout(function () {
				cleanData = tempDiv.innerHTML;
				util.removeItem(tempDiv);
				core.setRange(tempRange.sc, tempRange.so, tempRange.ec, tempRange.eo);
				event._setClipboardData(type, e, plainText, cleanData, data);
			});

			return true;
		} else {
			plainText = data.getData("text/plain");
			cleanData = data.getData("text/html");
			if (event._setClipboardData(type, e, plainText, cleanData, data) === false) {
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
			cleanData = core.cleanHTML(cleanData, core.pasteTagsWhitelistRegExp);
		} else {
			cleanData = util.htmlToEntity(plainText).replace(/\n/g, "<br>");
		}

		const maxCharCount = core.char.test(options.charCounterType === "byte-html" ? cleanData : plainText);
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
			if (/^image/.test(files[0].type) && core.plugins.image) {
				if (!core.initPlugins.image) core.callPlugin("image", core.plugins.image.submitAction.bind(core, files), null);
				else core.plugins.image.submitAction.call(core, files);
				core.focus();
			}
			return false;
		}

		if (!maxCharCount) {
			return false;
		}

		if (cleanData) {
			core.insertHTML(cleanData, true, false);
			return false;
		}
	},

	_addEvent: function () {
		const eventWysiwyg = options.iframe ? core._ww : context.element.wysiwyg;

		/** toolbar event */
		const toolbarHandler = ToolbarButtonsHandler.bind(this);
		this.addEvent(context.element.toolbar, "mousedown", toolbarHandler, false);
		this.addEvent(context.element._menuTray, "mousedown", toolbarHandler, false);
		this.addEvent(context.element.toolbar, "click", OnClick_toolbar.bind(this), false);

		/** editor area */
		const wwMouseDown = OnMouseDown_wysiwyg.bind(this);
		this.addEvent(eventWysiwyg, "mousedown", wwMouseDown, false);
		this.addEvent(eventWysiwyg, "click", OnClick_wysiwyg.bind(this), false);
		this.addEvent(eventWysiwyg, util.isIE ? "textinput" : "input", OnInput_wysiwyg.bind(this), false);
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
			core._lineBreakerButton,
			"mousedown",
			function (e) {
				e.preventDefault();
			},
			false
		);
		this.addEvent(core._lineBreakerButton, "click", DisplayLineBreak.bind(this, ""), false);
		this.addEvent(context.element.lineBreaker_t, "mousedown", DisplayLineBreak.bind(this, "t"), false);
		this.addEvent(context.element.lineBreaker_b, "mousedown", DisplayLineBreak.bind(this, "b"), false);

		/** Events are registered only when there is a table plugin.  */
		if (core.plugins.table) {
			this.addEvent(eventWysiwyg, "touchstart", wwMouseDown, {
				passive: true,
				useCapture: false
			});
		}

		/** code view area auto line */
		if (options.height === "auto" && !options.codeMirrorEditor) {
			const cvAuthHeight = CodeViewAutoHeight.bind(this);
			this.addEvent(context.element.code, "keydown", cvAuthHeight, false);
			this.addEvent(context.element.code, "keyup", cvAuthHeight, false);
			this.addEvent(context.element.code, "paste", cvAuthHeight, false);
		}

		/** resizingBar */
		if (context.element.resizingBar) {
			if (/\d+/.test(options.height)) {
				this.addEvent(context.element.resizingBar, "mousedown", OnMouseDown_resizingBar.bind(this), false);
			} else {
				util.addClass(context.element.resizingBar, "se-resizing-none");
			}
		}

		/** window event */
		this.toolbar._setResponsive();
		this.addEvent(this._w, "resize", OnResize_window.bind(this), false);
		if (options.stickyToolbar > -1) {
			this.addEvent(this._w, "scroll", this.toolbar.resetSticky.bind(this), false);
		}
	},

	_removeAllEvents: function () {
		for (let i = 0, len = this._events.length, e; i < len; i++) {
			e = this._events[i];
			e.target.removeEventListener(e.type, e.handler);
		}
		this._events = [];
	},

	constructor: eventManager
};

function ToolbarButtonsHandler(e) {
	let target = e.target;
	if (core._bindControllersOff) e.stopPropagation();

	if (/^(input|textarea|select|option)$/i.test(target.nodeName)) {
		core._antiBlur = false;
	} else {
		e.preventDefault();
	}

	if (util.getParentElement(target, ".se-submenu")) {
		e.stopPropagation();
		core._notHideToolbar = true;
	} else {
		let command = target.getAttribute("data-command");
		let className = target.className;

		while (!command && !/se-menu-list/.test(className) && !/sun-editor-common/.test(className)) {
			target = target.parentNode;
			command = target.getAttribute("data-command");
			className = target.className;
		}

		if (command === core._submenuName || command === core._containerName) {
			e.stopPropagation();
		}
	}
}

function OnClick_toolbar(e) {
	let target = e.target;
	let display = target.getAttribute("data-display");
	let command = target.getAttribute("data-command");
	let className = target.className;
	core.controllersOff();

	while (target.parentNode && !command && !/se-menu-list/.test(className) && !/se-toolbar/.test(className)) {
		target = target.parentNode;
		command = target.getAttribute("data-command");
		display = target.getAttribute("data-display");
		className = target.className;
	}

	if (!command && !display) return;
	if (target.disabled) return;
	if (!core.isReadOnly && !core.hasFocus) core.nativeFocus();
	if (!core.isReadOnly && !core._variable.isCodeView) core._editorRange();

	core.actionCall(command, display, target);
}

function OnMouseDown_wysiwyg(e) {
	if (core.isReadOnly || util.isNonEditable(context.element.wysiwyg)) return;

	// user event
	if (typeof this.events.onMouseDown === "function" && this.events.onMouseDown(e) === false) return;

	const tableCell = util.getParentElement(e.target, util.isTableCell);
	if (tableCell) {
		const tablePlugin = core.plugins.table;
		if (tablePlugin && tableCell !== tablePlugin._fixedCell && !tablePlugin._shift) {
			core.callPlugin(
				"table",
				function () {
					tablePlugin.onTableCellMultiSelect.call(core, tableCell, false);
				},
				null
			);
		}
	}

	if (core._isBalloon) {
		this._hideToolbar();
	}

	if (/FIGURE/i.test(e.target.nodeName)) e.preventDefault();
}

function OnClick_wysiwyg(e) {
	const targetElement = e.target;

	if (core.isReadOnly) {
		e.preventDefault();
		if (util.isAnchor(targetElement)){
			_w.open(targetElement.href, targetElement.target);
		}
		return false;
	}

	if (util.isNonEditable(context.element.wysiwyg)) return;

	// user event
	if (typeof this.events.onClick === "function" && this.events.onClick(e) === false) return;

	const fileComponentInfo = core.component.get(targetElement);
	if (fileComponentInfo) {
		e.preventDefault();
		core.component.select(fileComponentInfo.target, fileComponentInfo.pluginName);
		return;
	}

	const figcaption = util.getParentElement(targetElement, "FIGCAPTION");
	if (util.isNonEditable(figcaption)) {
		e.preventDefault();
		figcaption.setAttribute("contenteditable", true);
		figcaption.focus();

		if (core._isInline && !core._inlineToolbarAttr.isShow) {
			this.toolbar._showInline();

			const hideToolbar = function () {
				this._hideToolbar();
				figcaption.removeEventListener("blur", hideToolbar);
			};

			figcaption.addEventListener("blur", hideToolbar);
		}
	}

	_w.setTimeout(core.selection._init.bind(core));
	core.selection._init();

	const selectionNode = core.selection.getNode();
	const formatEl = this.format.getLine(selectionNode, null);
	const rangeEl = this.format.getRangeBlock(selectionNode, null);
	if (!formatEl && !util.isNonEditable(targetElement) && !util.isList(rangeEl)) {
		const range = core.getRange();
		if (this.format.getLine(range.startContainer) === this.format.getLine(range.endContainer)) {
			if (util.isList(rangeEl)) {
				e.preventDefault();
				const oLi = util.createElement("LI");
				const prevLi = selectionNode.nextElementSibling;
				oLi.appendChild(selectionNode);
				rangeEl.insertBefore(oLi, prevLi);
				core.focus();
			} else if (!util.isWysiwygDiv(selectionNode) && !this.node.isComponent(selectionNode) && (!util.isTable(selectionNode) || util.isTableCell(selectionNode)) && this._setDefaultFormat(util.isRangeFormatElement(rangeEl) ? "DIV" : options.defaultTag) !== null) {
				e.preventDefault();
				core.focus();
			} else {
				this.applyTagEffect();
			}
		}
	} else {
		this.applyTagEffect();
	}

	if (core._isBalloon) _w.setTimeout(this._toggleToolbarBalloon.bind(this));
}

function OnInput_wysiwyg(e) {
	if (core.isReadOnly || core.isDisabled) {
		e.preventDefault();
		e.stopPropagation();
		core.history.go(core.history.getCurrentIndex());
		return false;
	}

	core.selection._init();

	// user event
	if (typeof this.events.onInput === "function" && this.events.onInput(e) === false) return;

	const data = (e.data === null ? "" : e.data === undefined ? " " : e.data) || "";
	if (!core.char.test(data)) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	// history stack
	core.history.push(true);
}

function OnKeyDown_wysiwyg(e) {
	const keyCode = e.keyCode;
	const shift = e.shiftKey;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	const alt = e.altKey;
	this._IEisComposing = keyCode === 229;

	if (!ctrl && core.isReadOnly && !this._directionKeyCode.test(keyCode)) {
		e.preventDefault();
		return false;
	}

	core.submenuOff();

	if (core._isBalloon) {
		this._hideToolbar();
	}

	// user event
	if (typeof this.events.onKeyDown === "function" && this.events.onKeyDown(e) === false) return;

	/** Shortcuts */
	if (ctrl && this.shortcuts.command(keyCode, shift)) {
		event._onShortcutKey = true;
		e.preventDefault();
		e.stopPropagation();
		return false;
	} else if (event._onShortcutKey) {
		event._onShortcutKey = false;
	}

	/** default key action */
	let selectionNode = core.selection.getNode();
	const range = core.getRange();
	const selectRange = !range.collapsed || range.startContainer !== range.endContainer;
	const fileComponentName = core._fileManager.pluginRegExp.test(core.currentControllerName) ? core.currentControllerName : "";
	let formatEl = this.format.getLine(selectionNode, null) || selectionNode;
	let rangeEl = this.format.getRangeBlock(formatEl, null);

	switch (keyCode) {
		case 8 /** backspace key */ :
			if (!selectRange) {
				if (fileComponentName) {
					e.preventDefault();
					e.stopPropagation();
					core.plugins[fileComponentName].destroy.call(core);
					break;
				}
			}

			if (selectRange && event._hardDelete()) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			if (!util.isFormatElement(formatEl) && !context.element.wysiwyg.firstElementChild && !this.node.isComponent(selectionNode) && core._setDefaultFormat(options.defaultTag) !== null) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}

			if (!selectRange && !formatEl.previousElementSibling && range.startOffset === 0 && !selectionNode.previousSibling && !util.isListCell(formatEl) && util.isFormatElement(formatEl) && (!util.isFreeFormatElement(formatEl) || util.isClosureFreeFormatElement(formatEl))) {
				// closure range
				if (util.isClosureRangeFormatElement(formatEl.parentNode)) {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
				// maintain default format
				if (util.isWysiwygDiv(formatEl.parentNode) && formatEl.childNodes.length <= 1 && (!formatEl.firstChild || util.onlyZeroWidthSpace(formatEl.textContent))) {
					e.preventDefault();
					e.stopPropagation();

					if (formatEl.nodeName.toUpperCase() === options.defaultTag.toUpperCase()) {
						formatEl.innerHTML = "<br>";
						const attrs = formatEl.attributes;
						while (attrs[0]) {
							formatEl.removeAttribute(attrs[0].name);
						}
					} else {
						const defaultFormat = util.createElement(options.defaultTag);
						defaultFormat.innerHTML = "<br>";
						formatEl.parentElement.replaceChild(defaultFormat, formatEl);
					}

					core.nativeFocus();
					return false;
				}
			}

			// clean remove tag
			if (formatEl && range.startContainer === range.endContainer && selectionNode.nodeType === 3 && !util.isFormatElement(selectionNode.parentNode)) {
				if (range.collapsed ? selectionNode.textContent.length === 1 : range.endOffset - range.startOffset === selectionNode.textContent.length) {
					e.preventDefault();

					let offset = null;
					let prev = selectionNode.parentNode.previousSibling;
					const next = selectionNode.parentNode.nextSibling;
					if (!prev) {
						if (!next) {
							prev = util.createElement("BR");
							formatEl.appendChild(prev);
						} else {
							prev = next;
							offset = 0;
						}
					}

					selectionNode.textContent = "";
					util.removeItemAllParents(selectionNode, null, formatEl);
					offset = typeof offset === "number" ? offset : prev.nodeType === 3 ? prev.textContent.length : 1;
					core.setRange(prev, offset, prev, offset);
					break;
				}
			}

			// tag[contenteditable="false"]
			if (event._isUneditableNode(range, true)) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			// nested list
			const commonCon = range.commonAncestorContainer;
			formatEl = this.format.getLine(range.startContainer, null);
			rangeEl = this.format.getRangeBlock(formatEl, null);
			if (rangeEl && formatEl && !util.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
				if (
					util.isListCell(formatEl) &&
					util.isList(rangeEl) &&
					(util.isListCell(rangeEl.parentNode) || formatEl.previousElementSibling) &&
					(selectionNode === formatEl || (selectionNode.nodeType === 3 && (!selectionNode.previousSibling || util.isList(selectionNode.previousSibling)))) &&
					(this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null) ? rangeEl.contains(range.startContainer) : range.startOffset === 0 && range.collapsed)
				) {
					if (range.startContainer !== range.endContainer) {
						e.preventDefault();

						core.removeNode();
						if (range.startContainer.nodeType === 3) {
							core.setRange(range.startContainer, range.startContainer.textContent.length, range.startContainer, range.startContainer.textContent.length);
						}
						// history stack
						core.history.push(true);
					} else {
						let prev = formatEl.previousElementSibling || rangeEl.parentNode;
						if (util.isListCell(prev)) {
							e.preventDefault();

							let prevLast = prev;
							if (!prev.contains(formatEl) && util.isListCell(prevLast) && util.isList(prevLast.lastElementChild)) {
								prevLast = prevLast.lastElementChild.lastElementChild;
								while (util.isListCell(prevLast) && util.isList(prevLast.lastElementChild)) {
									prevLast = prevLast.lastElementChild && prevLast.lastElementChild.lastElementChild;
								}
								prev = prevLast;
							}

							let con = prev === rangeEl.parentNode ? rangeEl.previousSibling : prev.lastChild;
							if (!con) {
								con = util.createTextNode(util.zeroWidthSpace);
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

							util.removeItem(formatEl);
							if (rangeEl.children.length === 0) util.removeItem(rangeEl);

							core.setRange(con, offset, con, offset);
							// history stack
							core.history.push(true);
						}
					}

					break;
				}

				// detach range
				if (!selectRange && range.startOffset === 0) {
					let detach = true;
					let comm = commonCon;
					while (comm && comm !== rangeEl && !util.isWysiwygDiv(comm)) {
						if (comm.previousSibling) {
							if (comm.previousSibling.nodeType === 1 || !util.onlyZeroWidthSpace(comm.previousSibling.textContent.trim())) {
								detach = false;
								break;
							}
						}
						comm = comm.parentNode;
					}

					if (detach && rangeEl.parentNode) {
						e.preventDefault();
						core.format.removeRangeBlock(rangeEl, util.isListCell(formatEl) ? [formatEl] : null, null, false, false);
						// history stack
						core.history.push(true);
						break;
					}
				}
			}

			// component
			if (!selectRange && formatEl && (range.startOffset === 0 || (selectionNode === formatEl ? !!formatEl.childNodes[range.startOffset] : false))) {
				const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : selectionNode;
				const prev = formatEl.previousSibling;
				// select file component
				const ignoreZWS = (commonCon.nodeType === 3 || util.isBreak(commonCon)) && !commonCon.previousSibling && range.startOffset === 0;
				if (!sel.previousSibling && (this.node.isComponent(commonCon.previousSibling) || (ignoreZWS && this.node.isComponent(prev)))) {
					const fileComponentInfo = core.component.get(prev);
					if (fileComponentInfo) {
						e.preventDefault();
						e.stopPropagation();
						if (formatEl.textContent.length === 0) util.removeItem(formatEl);
						if (core.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) core.blur();
					} else if (this.node.isComponent(prev)) {
						e.preventDefault();
						e.stopPropagation();
						util.removeItem(prev);
					}
					break;
				}
				// delete nonEditable
				if (util.isNonEditable(sel.previousSibling)) {
					e.preventDefault();
					e.stopPropagation();
					util.removeItem(sel.previousSibling);
					break;
				}
			}

			break;
		case 46 /** delete key */ :
			if (fileComponentName) {
				e.preventDefault();
				e.stopPropagation();
				core.plugins[fileComponentName].destroy.call(core);
				break;
			}

			if (selectRange && event._hardDelete()) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			// tag[contenteditable="false"]
			if (event._isUneditableNode(range, false)) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}

			// component
			if ((util.isFormatElement(selectionNode) || selectionNode.nextSibling === null || (util.onlyZeroWidthSpace(selectionNode.nextSibling) && selectionNode.nextSibling.nextSibling === null)) && range.startOffset === selectionNode.textContent.length) {
				const nextEl = formatEl.nextElementSibling;
				if (!nextEl) break;
				if (this.node.isComponent(nextEl)) {
					e.preventDefault();

					if (util.onlyZeroWidthSpace(formatEl)) {
						util.removeItem(formatEl);
						// table component
						if (util.isTable(nextEl)) {
							let cell = util.getEdgeChild(nextEl, util.isTableCell, false);
							cell = cell.firstElementChild || cell;
							core.setRange(cell, 0, cell, 0);
							break;
						}
					}

					// select file component
					const fileComponentInfo = core.component.get(nextEl);
					if (fileComponentInfo) {
						e.stopPropagation();
						if (core.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) core.blur();
					} else if (this.node.isComponent(nextEl)) {
						e.stopPropagation();
						util.removeItem(nextEl);
					}

					break;
				}
			}

			if (!selectRange && (core.isEdgePoint(range.endContainer, range.endOffset) || (selectionNode === formatEl ? !!formatEl.childNodes[range.startOffset] : false))) {
				const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] || selectionNode : selectionNode;
				// delete nonEditable
				if (sel && util.isNonEditable(sel.nextSibling)) {
					e.preventDefault();
					e.stopPropagation();
					util.removeItem(sel.nextSibling);
					break;
				} else if (this.node.isComponent(sel)) {
					e.preventDefault();
					e.stopPropagation();
					util.removeItem(sel);
					break;
				}
			}

			// nested list
			formatEl = this.format.getLine(range.startContainer, null);
			rangeEl = this.format.getRangeBlock(formatEl, null);
			if (
				util.isListCell(formatEl) &&
				util.isList(rangeEl) &&
				(selectionNode === formatEl ||
					(selectionNode.nodeType === 3 &&
						(!selectionNode.nextSibling || util.isList(selectionNode.nextSibling)) &&
						(this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null) ? rangeEl.contains(range.endContainer) : range.endOffset === selectionNode.textContent.length && range.collapsed)))
			) {
				if (range.startContainer !== range.endContainer) core.removeNode();

				let next = util.getArrayItem(formatEl.children, util.isList, false);
				next = next || formatEl.nextElementSibling || rangeEl.parentNode.nextElementSibling;
				if (next && (util.isList(next) || util.getArrayItem(next.children, util.isList, false))) {
					e.preventDefault();

					let con, children;
					if (util.isList(next)) {
						const child = next.firstElementChild;
						children = child.childNodes;
						con = children[0];
						while (children[0]) {
							formatEl.insertBefore(children[0], next);
						}
						util.removeItem(child);
					} else {
						con = next.firstChild;
						children = next.childNodes;
						while (children[0]) {
							formatEl.appendChild(children[0]);
						}
						util.removeItem(next);
					}
					core.setRange(con, 0, con, 0);
					// history stack
					core.history.push(true);
				}
				break;
			}

			break;
		case 9 /** tab key */ :
			if (fileComponentName || options.tabDisable) break;
			e.preventDefault();
			if (ctrl || alt || util.isWysiwygDiv(selectionNode)) break;

			const isEdge = !range.collapsed || core.isEdgePoint(range.startContainer, range.startOffset);
			const selectedFormats = core.selection.getLines(null);
			selectionNode = core.selection.getNode();
			const cells = [];
			let lines = [];
			let fc = util.isListCell(selectedFormats[0]),
				lc = util.isListCell(selectedFormats[selectedFormats.length - 1]);
			let r = {
				sc: range.startContainer,
				so: range.startOffset,
				ec: range.endContainer,
				eo: range.endOffset
			};
			for (let i = 0, len = selectedFormats.length, f; i < len; i++) {
				f = selectedFormats[i];
				if (util.isListCell(f)) {
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
				r = core.format._applyNestedList(cells, shift);
			} else {
				// table
				const tableCell = util.getParentElement(selectionNode, util.isTableCell);
				if (tableCell && isEdge) {
					const table = util.getParentElement(tableCell, "table");
					const cells = util.getListChildren(table, util.isTableCell);
					let idx = shift ? util.prevIndex(cells, tableCell) : util.nextIndex(cells, tableCell);

					if (idx === cells.length && !shift) idx = 0;
					if (idx === -1 && shift) idx = cells.length - 1;

					let moveCell = cells[idx];
					if (!moveCell) break;
					moveCell = moveCell.firstElementChild || moveCell;
					core.setRange(moveCell, 0, moveCell, 0);
					break;
				}

				lines = lines.concat(cells);
				fc = lc = null;
			}

			// Lines tab(4)
			if (lines.length > 0) {
				if (!shift) {
					const tabText = util.createTextNode(new _w.Array(core._variable.tabSize + 1).join("\u00A0"));
					if (lines.length === 1) {
						const textRange = core.insertNode(tabText, null, true);
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

							if (util.isBreak(child)) {
								lines[i].insertBefore(tabText.cloneNode(false), child);
							} else {
								child.textContent = tabText.textContent + child.textContent;
							}
						}

						const firstChild = util.getEdgeChild(lines[0], "text", false);
						const endChild = util.getEdgeChild(lines[len], "text", true);
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
							if (util.onlyZeroWidthSpace(child)) continue;

							if (/^\s{1,4}$/.test(child.textContent)) {
								util.removeItem(child);
							} else if (/^\s{1,4}/.test(child.textContent)) {
								child.textContent = child.textContent.replace(/^\s{1,4}/, "");
							}

							break;
						}
					}

					const firstChild = util.getEdgeChild(lines[0], "text", false);
					const endChild = util.getEdgeChild(lines[len], "text", true);
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

			core.setRange(r.sc, r.so, r.ec, r.eo);
			// history stack
			core.history.push(false);

			break;
		case 13 /** enter key */ :
			const brLine = this.format.getBrLine(selectionNode, null);

			if (options.charCounterType === "byte-html") {
				let enterHTML = "";
				if ((!shift && brLine) || shift) {
					enterHTML = "<br>";
				} else {
					enterHTML = "<" + formatEl.nodeName + "><br></" + formatEl.nodeName + ">";
				}

				if (!core.this.char.check(enterHTML)) {
					e.preventDefault();
					return false;
				}
			}

			if (!shift) {
				const formatInners = core.format.isEdgeLine(range.endContainer, range.endOffset, "end");
				if ((formatInners && /^H[1-6]$/i.test(formatEl.nodeName)) || /^HR$/i.test(formatEl.nodeName)) {
					e.preventDefault();
					let temp = null;
					const newFormat = core.format.appendLine(formatEl, options.defaultTag);

					if (formatInners && formatInners.length > 0) {
						temp = formatInners.pop();
						const innerNode = temp;
						while (formatInners.length > 0) {
							temp = temp.appendChild(formatInners.pop());
						}
						newFormat.appendChild(innerNode);
					}

					temp = !temp ? newFormat.firstChild : temp.appendChild(newFormat.firstChild);
					core.setRange(temp, 0, temp, 0);
					break;
				}

				if (brLine) {
					e.preventDefault();
					const selectionFormat = selectionNode === brLine;
					const wSelection = core.selection.get();
					const children = selectionNode.childNodes,
						offset = wSelection.focusOffset,
						prev = selectionNode.previousElementSibling,
						next = selectionNode.nextSibling;

					if (
						!util.isClosureFreeFormatElement(brLine) &&
						!!children &&
						((selectionFormat &&
								range.collapsed &&
								children.length - 1 <= offset + 1 &&
								util.isBreak(children[offset]) &&
								(!children[offset + 1] || ((!children[offset + 2] || util.onlyZeroWidthSpace(children[offset + 2].textContent)) && children[offset + 1].nodeType === 3 && util.onlyZeroWidthSpace(children[offset + 1].textContent))) &&
								offset > 0 &&
								util.isBreak(children[offset - 1])) ||
							(!selectionFormat && util.onlyZeroWidthSpace(selectionNode.textContent) && util.isBreak(prev) && (util.isBreak(prev.previousSibling) || !util.onlyZeroWidthSpace(prev.previousSibling.textContent)) && (!next || (!util.isBreak(next) && util.onlyZeroWidthSpace(next.textContent)))))
					) {
						if (selectionFormat) util.removeItem(children[offset - 1]);
						else util.removeItem(selectionNode);
						const newEl = core.format.appendLine(brLine, util.isFormatElement(brLine.nextElementSibling) && !util.isRangeFormatElement(brLine.nextElementSibling) ? brLine.nextElementSibling : null);
						this.format.copyAttributes(newEl, brLine);
						core.setRange(newEl, 1, newEl, 1);
						break;
					}

					if (selectionFormat) {
						core.insertHTML(range.collapsed && util.isBreak(range.startContainer.childNodes[range.startOffset - 1]) ? "<br>" : "<br><br>", true, false);

						let focusNode = wSelection.focusNode;
						const wOffset = wSelection.focusOffset;
						if (brLine === focusNode) {
							focusNode = focusNode.childNodes[wOffset - offset > 1 ? wOffset - 1 : wOffset];
						}

						core.setRange(focusNode, 1, focusNode, 1);
					} else {
						const focusNext = wSelection.focusNode.nextSibling;
						const br = util.createElement("BR");
						core.insertNode(br, null, false);

						const brPrev = br.previousSibling,
							brNext = br.nextSibling;
						if (!util.isBreak(focusNext) && !util.isBreak(brPrev) && (!brNext || util.onlyZeroWidthSpace(brNext))) {
							br.parentNode.insertBefore(br.cloneNode(false), br);
							core.setRange(br, 1, br, 1);
						} else {
							core.setRange(brNext, 0, brNext, 0);
						}
					}

					event._onShortcutKey = true;
					break;
				}
			}

			if (selectRange) break;

			if (rangeEl && formatEl && !util.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
				const range = core.getRange();
				if (core.isEdgePoint(range.endContainer, range.endOffset) && util.isList(selectionNode.nextSibling)) {
					e.preventDefault();
					const newEl = util.createElement("LI");
					const br = util.createElement("BR");
					newEl.appendChild(br);

					formatEl.parentNode.insertBefore(newEl, formatEl.nextElementSibling);
					newEl.appendChild(selectionNode.nextSibling);

					core.setRange(br, 1, br, 1);
					break;
				}

				if ((range.commonAncestorContainer.nodeType === 3 ? !range.commonAncestorContainer.nextElementSibling : true) && util.onlyZeroWidthSpace(formatEl.innerText.trim())) {
					e.preventDefault();
					let newEl = null;

					if (util.isListCell(rangeEl.parentNode)) {
						rangeEl = formatEl.parentNode.parentNode.parentNode;
						newEl = this.node.split(formatEl, null, util.getElementDepth(formatEl) - 2);
						if (!newEl) {
							const newListCell = util.createElement("LI");
							newListCell.innerHTML = "<br>";
							rangeEl.insertBefore(newListCell, newEl);
							newEl = newListCell;
						}
					} else {
						const newFormat = util.isTableCell(rangeEl.parentNode) ?
							"DIV" :
							util.isList(rangeEl.parentNode) ?
							"LI" :
							util.isFormatElement(rangeEl.nextElementSibling) && !util.isRangeFormatElement(rangeEl.nextElementSibling) ?
							rangeEl.nextElementSibling.nodeName :
							util.isFormatElement(rangeEl.previousElementSibling) && !util.isRangeFormatElement(rangeEl.previousElementSibling) ?
							rangeEl.previousElementSibling.nodeName :
							options.defaultTag;

						newEl = util.createElement(newFormat);
						const edge = core.format.removeRangeBlock(rangeEl, [formatEl], null, true, true);
						edge.cc.insertBefore(newEl, edge.ec);
					}

					newEl.innerHTML = "<br>";
					util.removeItemAllParents(formatEl, null, null);
					core.setRange(newEl, 1, newEl, 1);
					break;
				}
			}

			if (rangeEl && util.getParentElement(rangeEl, "FIGCAPTION") && util.getParentElement(rangeEl, util.isList)) {
				e.preventDefault();
				formatEl = core.format.appendLine(formatEl, null);
				core.setRange(formatEl, 0, formatEl, 0);
			}

			if (fileComponentName) {
				e.preventDefault();
				e.stopPropagation();
				const compContext = context[fileComponentName];
				const container = compContext._container;
				const sibling = container.previousElementSibling || container.nextElementSibling;

				let newEl = null;
				if (util.isListCell(container.parentNode)) {
					newEl = util.createElement("BR");
				} else {
					newEl = util.createElement((util.isFormatElement(sibling) && !util.isRangeFormatElement(sibling)) ? sibling.nodeName : options.defaultTag);
					newEl.innerHTML = "<br>";
				}

				container.parentNode.insertBefore(newEl, container);

				core.callPlugin(
					fileComponentName,
					function () {
						if (core.component.select(compContext._element, fileComponentName) === false) core.blur();
					},
					null
				);
			}

			break;
		case 27:
			if (fileComponentName) {
				e.preventDefault();
				e.stopPropagation();
				core.controllersOff();
				return false;
			}
			break;
	}

	if (shift && keyCode === 16) {
		e.preventDefault();
		e.stopPropagation();
		const tablePlugin = core.plugins.table;
		if (tablePlugin && !tablePlugin._shift && !tablePlugin._ref) {
			const cell = util.getParentElement(formatEl, util.isTableCell);
			if (cell) {
				tablePlugin.onTableCellMultiSelect.call(core, cell, true);
				return;
			}
		}
	} else if (shift && (util.isOSX_IOS ? alt : ctrl) && keyCode === 32) {
		e.preventDefault();
		e.stopPropagation();
		const nbsp = core.insertNode(util.createTextNode("\u00a0"));
		if (nbsp && nbsp.container) {
			core.setRange(nbsp.container, nbsp.endOffset, nbsp.container, nbsp.endOffset);
			return;
		}
	}

	const textKey = !ctrl && !alt && !selectRange && !this._nonTextKeyCode.test(keyCode);
	if (textKey && range.collapsed && range.startContainer === range.endContainer && util.isBreak(range.commonAncestorContainer)) {
		const zeroWidth = util.createTextNode(util.zeroWidthSpace);
		core.insertNode(zeroWidth, null, false);
		core.setRange(zeroWidth, 1, zeroWidth, 1);
	}
}

function OnKeyUp_wysiwyg(e) {
	if (event._onShortcutKey) return;

	core.selection._init();
	const keyCode = e.keyCode;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	const alt = e.altKey;

	if (core.isReadOnly) {
		if (!ctrl && this._directionKeyCode.test(keyCode)) this.applyTagEffect();
		return;
	}

	const range = core.getRange();
	let selectionNode = core.selection.getNode();

	if (core._isBalloon && ((core._isBalloonAlways && keyCode !== 27) || !range.collapsed)) {
		if (core._isBalloonAlways) {
			if (keyCode !== 27) event._showToolbarBalloonDelay();
		} else {
			this.toolbar._showBalloon();
			return;
		}
	}

	/** when format tag deleted */
	if (keyCode === 8 && util.isWysiwygDiv(selectionNode) && selectionNode.textContent === "" && selectionNode.children.length === 0) {
		e.preventDefault();
		e.stopPropagation();

		selectionNode.innerHTML = "";

		const oFormatTag = util.createElement(util.isFormatElement(core._variable.currentNodes[0]) ? core._variable.currentNodes[0] : options.defaultTag);
		oFormatTag.innerHTML = "<br>";

		selectionNode.appendChild(oFormatTag);
		core.setRange(oFormatTag, 0, oFormatTag, 0);
		this.applyTagEffect();

		core.history.push(false);
		return;
	}

	const formatEl = this.format.getLine(selectionNode, null);
	const rangeEl = this.format.getRangeBlock(selectionNode, null);
	if (!formatEl && range.collapsed && !this.node.isComponent(selectionNode) && !util.isList(selectionNode) && core._setDefaultFormat(util.isRangeFormatElement(rangeEl) ? 'DIV' : options.defaultTag) !== null) {
		selectionNode = core.selection.getNode();
	}

	if (this._directionKeyCode.test(keyCode)) {
		this.applyTagEffect();
	}

	const textKey = !ctrl && !alt && !this._nonTextKeyCode.test(keyCode);
	if (textKey && selectionNode.nodeType === 3 && util.zeroWidthRegExp.test(selectionNode.textContent) && !(e.isComposing !== undefined ? e.isComposing : this._IEisComposing)) {
		let so = range.startOffset,
			eo = range.endOffset;
		const frontZeroWidthCnt = (selectionNode.textContent.substring(0, eo).match(this._frontZeroWidthReg) || "").length;
		so = range.startOffset - frontZeroWidthCnt;
		eo = range.endOffset - frontZeroWidthCnt;
		selectionNode.textContent = selectionNode.textContent.replace(util.zeroWidthRegExp, "");
		core.setRange(selectionNode, so < 0 ? 0 : so, selectionNode, eo < 0 ? 0 : eo);
	}

	core.char.test("");

	// user event
	if (typeof this.events.onKeyUp === "function" && this.events.onKeyUp(e) === false) return;

	// history stack
	if (!ctrl && !alt && !this._historyIgnoreKeyCode.test(keyCode)) {
		core.history.push(true);
	}
}

function OnPaste_wysiwyg(e) {
	const clipboardData = util.isIE ? _w.clipboardData : e.clipboardData;
	if (!clipboardData) return true;
	return event._dataTransferAction("paste", e, clipboardData);
}

function OnCopy_wysiwyg(e) {
	const clipboardData = util.isIE ? _w.clipboardData : e.clipboardData;

	// user event
	if (typeof this.events.onCopy === "function" && !this.events.onCopy(e, clipboardData)) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const info = core.currentFileComponentInfo;
	if (info && !util.isIE) {
		event._setClipboardComponent(e, info, clipboardData);
		util.addClass(info.component, "se-component-copy");
		// copy effect
		_w.setTimeout(function () {
			util.removeClass(info.component, "se-component-copy");
		}, 150);
	}
}

function OnDrop_wysiwyg(e) {
	if (core.isReadOnly || util.isIE) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const dataTransfer = e.dataTransfer;
	if (!dataTransfer) return true;

	core.removeNode();
	event._setDropLocationSelection(e);
	return event._dataTransferAction("drop", e, dataTransfer);
}

function OnCut_wysiwyg(e) {
	const clipboardData = util.isIE ? _w.clipboardData : e.clipboardData;

	// user event
	if (typeof this.events.onCut === "function" && !this.events.onCut(e, clipboardData)) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const info = core.currentFileComponentInfo;
	if (info && !util.isIE) {
		event._setClipboardComponent(e, info, clipboardData);
		util.removeItem(info.component);
		core.controllersOff();
	}

	_w.setTimeout(function () {
		// history stack
		core.history.push(false);
	});
}

function OnScroll_wysiwyg(e) {
	core.controllersOff();
	if (core._isBalloon) this._hideToolbar();

	// user event
	if (typeof this.events.onScroll === "function") this.events.onScroll(e);
}

function OnFocus_wysiwyg(e) {
	if (core._antiBlur) return;
	core.hasFocus = true;

	this.applyTagEffect();
	this.toolbar._showInline();

	// user event
	if (typeof this.events.onFocus === "function") this.events.onFocus(e);
}

function OnBlur_wysiwyg(e) {
	if (core._antiBlur || core._variable.isCodeView) return;
	core.hasFocus = false;
	core.controllersOff();
	if (core._isInline || core._isBalloon) this._hideToolbar();

	this._setKeyEffect([]);

	core._variable.currentNodes = [];
	core._variable.currentNodesMap = [];
	if (options.showPathLabel) context.element.navigation.textContent = "";

	// user event
	if (typeof this.events.onBlur === "function") this.events.onBlur(e);
}

function OnMouseMove_wysiwyg(e) {
	if (core.isDisabled || core.isReadOnly) return false;

	const component = util.getParentElement(e.target, this.node.isComponent);
	const lineBreakerStyle = core._lineBreaker.style;

	if (component && !core.currentControllerName) {
		const ctxEl = context.element;
		let scrollTop = 0;
		let el = ctxEl.wysiwyg;
		do {
			scrollTop += el.scrollTop;
			el = el.parentElement;
		} while (el && !/^(BODY|HTML)$/i.test(el.nodeName));

		const wScroll = ctxEl.wysiwyg.scrollTop;
		const offsets = domUtil.getGlobalOffset(context.element.topArea);
		const componentTop = domUtil.getOffset(component, ctxEl.wysiwygFrame).top + wScroll;
		const y = e.pageY + scrollTop + (options.iframe && !options.toolbarContainer ? ctxEl.toolbar.offsetHeight : 0);
		const c = componentTop + (options.iframe ? scrollTop : offsets.top);

		const isList = util.isListCell(component.parentNode);
		let dir = "",
			top = "";
		if ((isList ? !component.previousSibling : !util.isFormatElement(component.previousElementSibling)) && y < c + 20) {
			top = componentTop;
			dir = "t";
		} else if ((isList ? !component.nextSibling : !util.isFormatElement(component.nextElementSibling)) && y > c + component.offsetHeight - 20) {
			top = componentTop + component.offsetHeight;
			dir = "b";
		} else {
			lineBreakerStyle.display = "none";
			return;
		}

		core._variable._lineBreakComp = component;
		core._variable._lineBreakDir = dir;
		lineBreakerStyle.top = top - wScroll + "px";
		core._lineBreakerButton.style.left = domUtil.getOffset(component).left + component.offsetWidth / 2 - 15 + "px";
		lineBreakerStyle.display = "block";
	} // off line breaker
	else if (lineBreakerStyle.display !== "none") {
		lineBreakerStyle.display = "none";
	}
}

function OnMouseDown_resizingBar(e) {
	e.stopPropagation();

	core.submenuOff();
	core.controllersOff();

	const prevHeight = util.getNumber(context.element.wysiwygFrame.style.height, 0);
	core._variable.resizeClientY = e.clientY;
	context.element.resizeBackground.style.display = "block";

	function closureFunc() {
		context.element.resizeBackground.style.display = "none";
		_d.removeEventListener("mousemove", event._resize_editor);
		_d.removeEventListener("mouseup", closureFunc);
		if (typeof this.events.onResizeEditor === "function") this.events.onResizeEditor(util.getNumber(context.element.wysiwygFrame.style.height, 0), prevHeight);
	}

	_d.addEventListener("mousemove", event._resize_editor);
	_d.addEventListener("mouseup", closureFunc);
}

function DisplayLineBreak(dir, e) {
	e.preventDefault();

	const component = core._variable._lineBreakComp;
	const dir = !dir ? core._variable._lineBreakDir : dir;
	const isList = util.isListCell(component.parentNode);

	const format = util.createElement(isList ? "BR" : util.isTableCell(component.parentNode) ? "DIV" : options.defaultTag);
	if (!isList) format.innerHTML = "<br>";

	if (options.charCounterType === "byte-html" && !this.char.check(format.outerHTML)) return;

	component.parentNode.insertBefore(format, dir === "t" ? component : component.nextSibling);
	core._lineBreaker.style.display = "none";
	core._variable._lineBreakComp = null;

	const focusEl = isList ? format : format.firstChild;
	core.setRange(focusEl, 1, focusEl, 1);
	// history stack
	core.history.push(false);
}

function CodeViewAutoHeight() {
	context.element.code.style.height = context.element.code.scrollHeight + "px";
}

function OnResize_window() {
	core.controllersOff();

	const responsiveSize = this.toolbar._responsiveButtonSize;
	if (responsiveSize) {
		let w = 0;
		if ((core._isBalloon || core._isInline) && options.toolbarWidth === "auto") {
			w = context.element.topArea.offsetWidth;
		} else {
			w = context.element.toolbar.offsetWidth;
		}

		let responsiveWidth = "default";
		for (let i = 1, len = responsiveSize.length; i < len; i++) {
			if (w < responsiveSize[i]) {
				responsiveWidth = responsiveSize[i] + "";
				break;
			}
		}

		if (this.toolbar._responsiveCurrentSize !== responsiveWidth) {
			this.toolbar._responsiveCurrentSize = responsiveWidth;
			core.toolbar.setButtons(this.toolbar._responsiveButtons[responsiveWidth]);
		}
	}

	if (context.element.toolbar.offsetWidth === 0) return;

	if (context.fileBrowser && context.fileBrowser.area.style.display === "block") {
		context.fileBrowser.body.style.maxHeight = _w.innerHeight - context.fileBrowser.header.offsetHeight - 50 + "px";
	}

	if (core.submenuActiveButton && core.submenu) {
		core._setMenuPosition(core.submenuActiveButton, core.submenu);
	}

	if (core._variable.isFullScreen) {
		core._variable.innerHeight_fullScreen += _w.innerHeight - context.element.toolbar.offsetHeight - core._variable.innerHeight_fullScreen;
		context.element.editorArea.style.height = core._variable.innerHeight_fullScreen + "px";
		return;
	}

	if (core._variable.isCodeView && core._isInline) {
		this.toolbar._showInline();
		return;
	}

	core._iframeAutoHeight();

	if (core._sticky) {
		context.element.toolbar.style.width = context.element.topArea.offsetWidth - 2 + "px";
		this.toolbar.resetSticky();
	}
}

export default eventManager;