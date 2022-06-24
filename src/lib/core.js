import Helper, { global, env, converter, unicode, domUtils, numbers } from '../helper';
import { ResetOptions, UpdateButton } from './constructor';
import Context from './context';

// interface
import ModuleInterface from '../interface/_module';

// base
import history from './base/history';
import Events from './base/events';
import EventManager from './base/eventManager';

// modules
import Char from './modules/char';
import Component from './modules/component';
import Format from './modules/format';
import HTML from './modules/html';
import Menu from './modules/menu';
import Node from './modules/node';
import Notice from './modules/notice';
import Offset from './modules/offset';
import Selection from './modules/selection';
import Shortcuts from './modules/shortcuts';
import Toolbar from './modules/toolbar';

/**
 * @description SunEditor constructor function.
 * @param {Object} context
 * @param {Object} pluginCallButtons
 * @param {Object} plugins
 * @param {Object} lang
 * @param {Object} options
 * @param {Object} _responsiveButtons
 * @returns {Object} functions Object
 */
const Core = function (context, pluginCallButtons, plugins, lang, options, _responsiveButtons) {
	const _d = context.element.originElement.ownerDocument || global._d;
	const _w = _d.defaultView || global._w;

	/**
	 * @description Document object
	 * @type {Document}
	 */
	this._d = _d;

	/**
	 * @description Window object
	 * @type {Window}
	 */
	this._w = _w;

	/**
	 * @description Document object of the iframe if created as an iframe || _d
	 * @type {Document}
	 */
	this._wd = null;

	/**
	 * @description Window object of the iframe if created as an iframe || _w
	 * @type {Window}
	 */
	this._ww = null;

	/**
	 * @description Editor options
	 * @type {Object.<string, any>}
	 */
	this.options = options;

	/**
	 * @description Loaded plugins
	 * @type {Object.<string, any>}
	 */
	this.plugins = plugins || {};

	/**
	 * @description Elements and user options parameters of the suneditor
	 */
	this.context = context;

	/**
	 * @description Default icons object
	 * @type {Object.<string, string>}
	 */
	this.icons = options.icons;

	/**
	 * @description loaded language
	 * @type {Object.<string, any>}
	 */
	this.lang = lang;

	/**
	 * @description History object for undo, redo
	 */
	this.history = null;

	/**
	 * @description Helper util
	 */
	this.helper = Helper;

	/**
	 * @description Closest ShadowRoot to editor if found
	 * @type {ShadowRoot}
	 */
	this.shadowRoot = null;

	/**
	 * @description Computed style of the wysiwyg area (window.getComputedStyle(context.element.wysiwyg))
	 */
	this.wwComputedStyle = null;

	/**
	 * @description Variables used internally in editor operation
	 * @property {boolean} hasFocus Boolean value of whether the editor has focus
	 * @property {boolean} isDisabled Boolean value of whether the editor is disabled
	 * @property {boolean} isReadOnly Boolean value of whether the editor is readOnly
	 * @property {boolean} isCodeView State of code view
	 * @property {boolean} isFullScreen State of full screen
	 * @property {boolean} isShowBlocks State of show blocks
	 * @property {number} tabSize Indent size of tab (4)
	 * @property {number} indentSize Indent size (25)px
	 * @property {number} codeIndentSize Indent size of Code view mode (2)
	 * @property {Array} currentNodes  An element array of the current cursor's node structure
	 * @property {Array} currentNodesMap  An element name array of the current cursor's node structure
	 */
	this.status = {
		hasFocus: false,
		isDisabled: false,
		isReadOnly: false,
		isChanged: false,
		isCodeView: false,
		isFullScreen: false,
		isShowBlocks: false,
		indentSize: 25,
		tabSize: 4,
		codeIndentSize: 2,
		currentNodes: [],
		currentNodesMap: [],
		_range: null,
		_selectionNode: null,
		_minHeight: numbers.get(context.element.wysiwygFrame.style.minHeight || '65', 0),
		_resizeClientY: 0,
		_lineBreakComp: null,
		_lineBreakDir: ''
	};

	// ----- Properties not shared with coreInterface -----
	/**
	 * @description Command button map
	 */
	this.allCommandButtons = {};

	/**
	 * @description Plugins array with "active" method.
	 * "activePlugins" runs the "add" method when creating the editor.
	 */
	this.activePlugins = null;

	/**
	 * @description The selection node (selection.getNode()) to which the effect was last applied
	 */
	this.effectNode = null;

	/**
	 * @description The file component object of current selected file tag (component.get)
	 */
	this.currentFileComponentInfo = null;

	/**
	 * @description An array of buttons whose class name is not "se-code-view-enabled"
	 */
	this.codeViewDisabledButtons = [];

	/**
	 * @description An array of buttons whose class name is not "se-resizing-enabled"
	 */
	this.resizingDisabledButtons = [];

	// ----- private properties -----
	/**
	 * @description Plugin buttons
	 * @private
	 */
	this._pluginCallButtons = pluginCallButtons;

	/**
	 * @description Plugin call
	 * @private
	 */
	this._onSelectPlugins = [];
	this._onKeyDownPlugins = [];

	/**
	 * @description Controller relative
	 * @private
	 */
	this.openControllers = [];
	this.currentControllerName = '';

	/**
	 * @description Button List in Responsive Toolbar.
	 * @private
	 */
	this._responsiveButtons = _responsiveButtons;

	/**
	 * @description Property related to rtl and ltr conversions.
	 * @private
	 */
	this._prevRtl = options._rtl;

	/**
	 * @description Property related to editor resizing.
	 * @private
	 */
	this._editorHeight = 0;
	this._editorHeightPadding = 0;

	/**
	 * @description Is inline mode?
	 * @private
	 */
	this._isInline = null;

	/**
	 * @description Is balloon|balloon-always mode?
	 * @private
	 */
	this._isBalloon = null;

	/**
	 * @description Is balloon-always mode?
	 * @private
	 */
	this._isBalloonAlways = null;

	/**
	 * @description Variable that controls the "blur" event in the editor of inline or balloon mode when the focus is moved to dropdown
	 * @private
	 */
	this._notHideToolbar = false;

	/**
	 * @description Variables for controlling focus and blur events
	 * @private
	 */
	this._antiBlur = false;

	/**
	 * @description Component line breaker element
	 * @private
	 */
	this._lineBreaker = null;

	/**
	 * @description If true, (initialize, reset) all indexes of image, video information
	 * @private
	 */
	this._componentsInfoInit = true;
	this._componentsInfoReset = false;

	/**
	 * @description Information of tags that should maintain HTML structure, style, class name, etc. (In use by "math" plugin)
	 * When inserting "html" such as paste, it is executed on the "html" to be inserted. (html.clean)
	 * Basic Editor Actions:
	 * 1. All classes not starting with "__se__" or "se-" in the editor are removed.
	 * 2. The style of all tags except the "span" tag is removed from the editor.
	 * "_MELInfo" structure ex:
	 * _MELInfo: {
	 *   query: ".__se__xxx, se-xxx"
	 *   map: {
	 *     "__se__xxx": method.bind(core),
	 *     "se-xxx": method.bind(core),
	 *   }
	 * }
	 * @example
	 * Define in the following return format in the "_MELInfo" function of the plugin.
	 * _MELInfo() => {
	 *  return {
	 *    className: "string", // Class name to identify the tag. ("__se__xxx", "se-xxx")
	 *    // Change the html of the "element". ("element" is the element found with "className".)
	 *    // "method" is executed by binding "core".
	 *    method: function (element) {
	 *      // this === core
	 *      element.innerHTML = // (rendered html);
	 *    }
	 *  }
	 * }
	 * @private
	 */
	this._MELInfo = null;

	/**
	 * @description Array of "checkFileInfo" functions with the core bound
	 * (Plugins with "checkFileInfo" and "resetFileInfo" methods)
	 * "fileInfoPlugins" runs the "add" method when creating the editor.
	 * "checkFileInfo" method is always call just before the "change" event.
	 * @private
	 */
	this._fileInfoPluginsCheck = null;

	/**
	 * @description Array of "resetFileInfo" functions with the core bound
	 * (Plugins with "checkFileInfo" and "resetFileInfo" methods)
	 * "checkFileInfo" method is always call just before the "editorInstance.setOptions" method.
	 * @private
	 */
	this._fileInfoPluginsReset = null;

	/**
	 * @description Variables for file component management
	 * @private
	 */
	this._fileManager = {
		tags: null,
		regExp: null,
		queryString: null,
		pluginRegExp: null,
		pluginMap: null
	};

	/**
	 * @description Elements that need to change text or className for each selection change
	 * After creating the editor, "activePlugins" are added.
	 * @property {Element} STRONG bold button
	 * @property {Element} U underline button
	 * @property {Element} EM italic button
	 * @property {Element} DEL strike button
	 * @property {Element} SUB subscript button
	 * @property {Element} SUP superscript button
	 * @property {Element} OUTDENT outdent button
	 * @property {Element} INDENT indent button
	 * @private
	 */
	this._commandMap = null;

	/**
	 * @description Style button related to edit area
	 * @property {Element} fullScreen fullScreen button element
	 * @property {Element} showBlocks showBlocks button element
	 * @property {Element} codeView codeView button element
	 * @private
	 */
	this._styleCommandMap = null;

	/**
	 * @description CSS properties related to style tags
	 * @private
	 */
	this._commandMapStyles = {
		STRONG: ['font-weight'],
		U: ['text-decoration'],
		EM: ['font-style'],
		DEL: ['text-decoration']
	};

	/**
	 * @description FullScreen and codeView relative status
	 */
	this._transformStatus = {
		editorOriginCssText: context.element.topArea.style.cssText,
		bodyOverflow: '',
		editorAreaOriginCssText: '',
		wysiwygOriginCssText: '',
		codeOriginCssText: '',
		fullScreenInnerHeight: 0,
		fullScreenSticky: false,
		fullScreenBalloon: false,
		fullScreenInline: false
	};

	/**
	 * @description Parser
	 */
	this._parser = new global._w.DOMParser();

	// ----- Core init -----
	// Create to sibling node
	const contextEl = context.element;
	const originEl = contextEl.originElement;
	const topEl = contextEl.topArea;
	originEl.style.display = 'none';
	topEl.style.display = 'block';

	// insert editor element
	if (typeof originEl.nextElementSibling === 'object') {
		originEl.parentNode.insertBefore(topEl, originEl.nextElementSibling);
	} else {
		originEl.parentNode.appendChild(topEl);
	}

	contextEl.editorArea.appendChild(contextEl.wysiwygFrame);

	// init
	if (!options.iframe) {
		this._editorInit(false, options.value);
	} else {
		const inst = this;
		contextEl.wysiwygFrame.addEventListener('load', function () {
			converter._setIframeDocument(this, options);
			inst._editorInit(false, options.value);
		});
	}
};

Core.prototype = {
	/**
	 * @description If the plugin is not added, add the plugin and call the 'add' function.
	 * If the plugin is added call callBack function.
	 * @param {string} pluginName The name of the plugin to call
	 * @param {Element|null} target Plugin target button (This is not necessary if you have a button list when creating the editor)
	 */
	registerPlugin: function (pluginName, target) {
		target = target || this._pluginCallButtons[pluginName];

		if (!this.plugins[pluginName]) {
			throw Error('[SUNEDITOR.registerPlugin.fail] The called plugin does not exist or is in an invalid format. (pluginName: "' + pluginName + '")');
		} else {
			const plugin = (this.plugins[pluginName] = new this.plugins[pluginName](this, target));
			UpdateButton(target, plugin);
			if (typeof plugin.init === 'function') plugin.init();
		}

		if (this.plugins[pluginName].active && !this._commandMap[pluginName] && !!target) {
			this._commandMap[pluginName] = target;
			this.activePlugins.push(pluginName);
		}
	},

	/**
	 * @description Run plugin calls and basic commands.
	 * @param {string} command Command string
	 * @param {string} type Display type string ('command', 'dropdown', 'modal', 'container')
	 * @param {Element} target The element of command button
	 */
	runPlugin: function (command, type, target) {
		if (type) {
			if (/more/i.test(type)) {
				if (target !== this.menu.currentMoreLayerActiveButton) {
					const layer = this.context.element.toolbar.querySelector('.' + command);
					if (layer) {
						this.menu._moreLayerOn(target, layer);
						this.toolbar._showBalloon();
						this.toolbar._showInline();
					}
					domUtils.addClass(target, 'on');
				} else if (this.menu.currentMoreLayerActiveButton) {
					this.menu._moreLayerOff();
					this.toolbar._showBalloon();
					this.toolbar._showInline();
				}
				return;
			}

			if (/container/.test(type) && (this.menu._menuTrayMap[command] === null || target !== this.menu.currentContainerActiveButton)) {
				this.menu.containerOn(target);
				return;
			}

			if (this.isReadOnly && domUtils.arrayIncludes(this.resizingDisabledButtons, target)) return;
			if (/dropdown/.test(type) && (this.menu._menuTrayMap[command] === null || target !== this.menu.currentDropdownActiveButton)) {
				this.menu.dropdownOn(target);
				return;
			} else if (/modal/.test(type)) {
				this.plugins[command].open();
				return;
			} else if (/command/.test(type)) {
				this.plugins[command].action();
			} else if (/fileBrowser/.test(type)) {
				this.plugins[command].open(null);
			}
		} else if (command) {
			this.commandHandler(command, target);
		}

		if (/dropdown/.test(type)) {
			this.menu.dropdownOff();
		} else if (!/command/.test(type)) {
			this.menu.dropdownOff();
			this.menu.containerOff();
		}
	},

	/**
	 * @description Execute command of command button(All Buttons except dropdown and modal)
	 * (selectAll, codeView, fullScreen, indent, outdent, undo, redo, removeFormat, print, preview, showBlocks, save, bold, underline, italic, strike, subscript, superscript, copy, cut, paste)
	 * @param {string} command Property of command button (data-value)
	 * @param {Element|null} target The element of command button
	 */
	commandHandler: function (command, target) {
		if (this.status.isReadOnly && !/copy|cut|selectAll|codeView|fullScreen|print|preview|showBlocks/.test(command)) return;

		switch (command) {
			case 'copy':
			case 'cut':
				this.execCommand(command);
				break;
			case 'paste':
				// @todo
				break;
			case 'selectAll':
				this._offCurrentController();
				this.menu.containerOff();
				const wysiwyg = this.context.element.wysiwyg;
				let first =
					domUtils.getEdgeChild(
						wysiwyg.firstChild,
						function (current) {
							return current.childNodes.length === 0 || current.nodeType === 3;
						},
						false
					) || wysiwyg.firstChild;
				let last =
					domUtils.getEdgeChild(
						wysiwyg.lastChild,
						function (current) {
							return current.childNodes.length === 0 || current.nodeType === 3;
						},
						true
					) || wysiwyg.lastChild;
				if (!first || !last) return;
				if (domUtils.isMedia(first)) {
					const info = this.component.get(first);
					const br = domUtils.createElement('BR');
					const format = domUtils.createElement(this.options.defaultLineTag, null, br);
					first = info ? info.component : first;
					first.parentNode.insertBefore(format, first);
					first = br;
				}
				if (domUtils.isMedia(last)) {
					last = domUtils.createElement('BR');
					wysiwyg.appendChild(domUtils.createElement(this.options.defaultLineTag, null, last));
				}
				this.toolbar._showBalloon(this.selection.setRange(first, 0, last, last.textContent.length));
				break;
			case 'codeView':
				this.codeView(!this.status.isCodeView);
				break;
			case 'fullScreen':
				this.fullScreen(!this.status.isFullScreen);
				break;
			case 'indent':
				this.format.indent();
				break;
			case 'outdent':
				this.format.outdent();
				break;
			case 'undo':
				this.history.undo();
				break;
			case 'redo':
				this.history.redo();
				break;
			case 'removeFormat':
				this.format.removeTextStyle();
				this.focus();
				break;
			case 'print':
				this.print();
				break;
			case 'preview':
				this.preview();
				break;
			case 'showBlocks':
				this.showBlocks(!this.status.isShowBlocks);
				break;
			case 'dir':
				this.setDir(options.textDirection);
				break;
			case 'dir_ltr':
				this.setDir('ltr');
				break;
			case 'dir_rtl':
				this.setDir('rtl');
				break;
			case 'save':
				if (typeof this.options.callBackSave === 'function') {
					this.options.callBackSave(this.getContent(false), this.status.isChanged);
				} else if (this.status.isChanged && typeof this.events.save === 'function') {
					this.events.save();
				} else {
					throw Error('[SUNEDITOR.commandHandler.fail] Please register call back function in creation option. (callBackSave : Function)');
				}

				this.status.isChanged = false;
				if (this.context.buttons.save) this.context.buttons.save.setAttribute('disabled', true);
				break;
			default:
				// 'STRONG', 'U', 'EM', 'DEL', 'SUB', 'SUP'..
				command = this.options._defaultCommand[command.toLowerCase()] || command;
				if (!this._commandMap[command]) this._commandMap[command] = target;

				const nodesMap = this.status.currentNodesMap;
				const cmd = nodesMap.indexOf(command) > -1 ? null : domUtils.createElement(command);
				let removeNode = command;

				if (/^SUB$/i.test(command) && nodesMap.indexOf('SUP') > -1) {
					removeNode = 'SUP';
				} else if (/^SUP$/i.test(command) && nodesMap.indexOf('SUB') > -1) {
					removeNode = 'SUB';
				}

				this.format.applyTextStyle(cmd, this._commandMapStyles[command] || null, [removeNode], false);
				this.focus();
		}
	},

	/**
	 * @description javascript execCommand
	 * @param {string} command javascript execCommand function property
	 * @param {Boolean|undefined} showDefaultUI javascript execCommand function property
	 * @param {string|undefined} value javascript execCommand function property
	 */
	execCommand: function (command, showDefaultUI, value) {
		this._wd.execCommand(command, showDefaultUI, command === 'formatBlock' ? '<' + value + '>' : value);
		// history stack
		this.history.push(true);
	},

	/**
	 * @description Focus to wysiwyg area
	 */
	focus: function () {
		if (this.context.element.wysiwygFrame.style.display === 'none') return;

		if (this.options.iframe) {
			this._nativeFocus();
		} else {
			try {
				const range = this.selection.getRange();
				if (range.startContainer === range.endContainer && domUtils.isWysiwygFrame(range.startContainer)) {
					const currentNode = range.commonAncestorContainer.children[range.startOffset];
					if (!this.format.isLine(currentNode) && !this.component.is(currentNode)) {
						const br = domUtils.createElement('BR');
						const format = domUtils.createElement(this.options.defaultLineTag, null, br);
						this.context.element.wysiwyg.insertBefore(format, currentNode);
						this.selection.setRange(br, 0, br, 0);
						return;
					}
				}
				this.selection.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
			} catch (e) {
				console.warn('[SUNEDITOR.focus.warn] ' + e);
				this._nativeFocus();
			}
		}

		this.eventManager.applyTagEffect();
		if (this._isBalloon) this.eventManager._toggleToolbarBalloon();
	},

	/**
	 * @description If "focusEl" is a component, then that component is selected; if it is a format element, the last text is selected
	 * If "focusEdge" is null, then selected last element
	 * @param {Element|null} focusEl Focus element
	 */
	focusEdge: function (focusEl) {
		if (!focusEl) focusEl = this.context.element.wysiwyg.lastElementChild;

		const fileComponentInfo = this.component.get(focusEl);
		if (fileComponentInfo) {
			this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName);
		} else if (focusEl) {
			focusEl = domUtils.getEdgeChild(
				focusEl,
				function (current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				true
			);
			if (!focusEl) this._nativeFocus();
			else this.selection.setRange(focusEl, focusEl.textContent.length, focusEl, focusEl.textContent.length);
		} else {
			this.focus();
		}
	},

	/**
	 * @description Focusout to wysiwyg area (.blur())
	 */
	blur: function () {
		if (this.options.iframe) {
			this.context.element.wysiwygFrame.blur();
		} else {
			this.context.element.wysiwyg.blur();
		}
	},

	/**
	 * @description Sets the HTML string
	 * @param {string|undefined} html HTML string
	 */
	setContent: function (html) {
		this.selection.removeRange();

		const convertValue = html === null || html === undefined ? '' : this.html.clean(html, true, null, null);
		this._resetComponents();

		if (!this.status.isCodeView) {
			this.context.element.wysiwyg.innerHTML = convertValue;
			// history stack
			this.history.push(false);
		} else {
			const value = this._convertHTMLForCodeView(convertValue, false);
			this._setCodeView(value);
		}
	},

	/**
	 * @description Add content to the end of content.
	 * @param {string} content Content to Input
	 */
	addContent: function (content) {
		const convertValue = this.html.clean(content, true, null, null);

		if (!this.status.isCodeView) {
			const temp = domUtils.createElement('DIV', null, convertValue);
			const wysiwyg = this.context.element.wysiwyg;
			const children = temp.children;
			for (let i = 0, len = children.length; i < len; i++) {
				if (children[i]) {
					wysiwyg.appendChild(children[i]);
				}
			}
		} else {
			this._setCodeView(this._getCodeView() + '\n' + this._convertHTMLForCodeView(convertValue, false));
		}

		// history stack
		this.history.push(false);
	},

	/**
	 * @description Sets the content of the iframe's head tag and body tag when using the "iframe" or "iframe_fullPage" option.
	 * @param {Object} ctx { head: HTML string, body: HTML string}
	 */
	setFullPageContent: function (ctx) {
		if (!this.options.iframe) return false;
		if (ctx.head) this._wd.head.innerHTML = ctx.head.replace(/<script[\s\S]*>[\s\S]*<\/script>/gi, '');
		if (ctx.body) this._wd.body.innerHTML = this.html.clean(ctx.body, true, null, null);
	},

	/**
	 * @description Gets the current content
	 * @param {boolean} withFrame Gets the current content with containing parent div.sun-editor-editable (<div class="sun-editor-editable">{content}</div>).
	 * Ignored for options.iframe_fullPage is true.
	 * @param {boolean} includeFullPage Return only the content of the body without headers when the "iframe_fullPage" option is true
	 * @returns {Object}
	 */
	getContent: function (withFrame, includeFullPage) {
		const renderHTML = domUtils.createElement('DIV', null, this._convertHTMLForCodeView(this.context.element.wysiwyg, true));
		const figcaptions = domUtils.getListChildren(renderHTML, function (current) {
			return /FIGCAPTION/i.test(current.nodeName);
		});

		for (let i = 0, len = figcaptions.length; i < len; i++) {
			figcaptions[i].removeAttribute('contenteditable');
		}

		if (this.options.iframe_fullPage) {
			if (includeFullPage) {
				const attrs = domUtils.getAttributesToString(this._wd.body, ['contenteditable']);
				return '<!DOCTYPE html><html>' + this._wd.head.outerHTML + '<body ' + attrs + '>' + renderHTML.innerHTML + '</body></html>';
			} else {
				return renderHTML.innerHTML;
			}
		} else {
			return withFrame ? '<div class="sun-editor-editable' + (this.options._rtl ? ' se-rtl' : '') + '">' + renderHTML.innerHTML + '</div>' : renderHTML.innerHTML;
		}
	},

	/**
	 * @description Gets only the text of the suneditor content
	 * @returns {string}
	 */
	getText: function () {
		return this.context.element.wysiwyg.textContent;
	},

	/**
	 * @description Gets uploaded files(plugin using fileManager) information list.
	 * image: [img], video: [video, iframe], audio: [audio]
	 * - index: data index
	 * - name: file name
	 * - size: file size
	 * - select: select function
	 * - delete: delete function
	 * - element: target element
	 * - src: src attribute of tag
	 * @param {string} pluginName Plugin name (image, video, audio)
	 * @returns {Array}
	 */
	getFilesInfo: function (pluginName) {
		return this.context[pluginName] ? this.context[pluginName]._infoList : [];
	},

	/**
	 * @description Add or reset option property (Editor is reloaded)
	 * @param {Object} _options Options
	 */
	setOptions: function (_options) {
		this.eventManager._removeAllEvents();
		this._resetComponents();

		domUtils.removeClass(this._styleCommandMap.showBlocks, 'active');
		domUtils.removeClass(this._styleCommandMap.codeView, 'active');
		this.status.isCodeView = false;
		this._iframeAuto = null;

		this.plugins = _options.plugins || this.plugins; //@todo plugins don't reset
		const mergeOptions = [this.options, _options].reduce(function (init, option) {
			for (let key in option) {
				if (!option.hasOwnProperty(key)) continue;
				if (key === 'plugins' && option[key] && init[key]) {
					let i = init[key],
						o = option[key];
					i = i.length
						? i
						: this._w.Object.keys(i).map(function (name) {
								return i[name];
						  });
					o = o.length
						? o
						: this._w.Object.keys(o).map(function (name) {
								return o[name];
						  });
					init[key] = o
						.filter(function (val) {
							return i.indexOf(val) === -1;
						})
						.concat(i);
				} else {
					init[key] = option[key];
				}
			}
			return init;
		}, {});

		const el = this.context.element;
		const _initHTML = el.wysiwyg.innerHTML;

		// set option
		const cons = ResetOptions(mergeOptions, this.context, this.options);

		if (cons.callButtons) {
			this._pluginCallButtons = cons.callButtons;
		}

		if (cons.plugins) {
			this.plugins = cons.plugins;
		}

		// reset context
		if (el._menuTray.children.length === 0) this.menu._menuTrayMap = {};
		this._responsiveButtons = this.toolbar._responsiveButtons = cons.toolbar.responsiveButtons;
		this.options = mergeOptions; //@todo option, lang.. dont't reset
		this.lang = this.options.lang;

		if (this.options.iframe) {
			el.wysiwygFrame.addEventListener('load', function () {
				converter._setIframeDocument(this, this.options);
				this._setOptionsInit(el, _initHTML);
			});
		}

		el.editorArea.appendChild(el.wysiwygFrame);

		if (!this.options.iframe) {
			this._setOptionsInit(el, _initHTML);
		}
	},

	/**
	 * @description Set "options.editorCSSText" style.
	 * Define the style of the edit area
	 * It can also be defined with the "setOptions" method, but the "setEditorCSSText" method does not render the editor again.
	 * @param {string} style Style string
	 */
	setEditorCSSText: function (style) {
		const newStyles = (this.options._editorStyles = converter._setDefaultOptionStyle(this.options, style));
		const el = this.context.element;

		// top area
		el.topArea.style.cssText = newStyles.top;
		// code view
		el.code.style.cssText = this.options._editorStyles.frame;
		el.code.style.display = 'none';
		if (this.options.height === 'auto') {
			el.code.style.overflow = 'hidden';
		} else {
			el.code.style.overflow = '';
		}
		// wysiwyg frame
		if (!this.options.iframe) {
			el.wysiwygFrame.style.cssText = newStyles.frame + newStyles.editor;
		} else {
			el.wysiwygFrame.style.cssText = newStyles.frame;
			el.wysiwyg.style.cssText = newStyles.editor;
		}
	},

	/**
	 * @description Set direction to "rtl" or "ltr".
	 * @param {string} dir "rtl" or "ltr"
	 */
	setDir: function (dir) {
		const rtl = dir === 'rtl';
		const changeDir = this._prevRtl !== rtl;
		const el = this.context.element;
		const buttons = this.context.buttons;
		this._prevRtl = this.options._rtl = rtl;

		if (changeDir) {
			const plugins = this.plugins;
			for (let k in plugins) {
				if (typeof plugins[k].setDir === 'function') plugins[k].setDir(dir);
			}
			// indent buttons
			if (buttons.indent) domUtils.changeElement(buttons.indent.firstElementChild, this.icons.indent);
			if (buttons.outdent) domUtils.changeElement(buttons.outdent.firstElementChild, this.icons.outdent);
		}

		if (rtl) {
			domUtils.addClass(el.topArea, 'se-rtl');
			domUtils.addClass(el.wysiwygFrame, 'se-rtl');
		} else {
			domUtils.removeClass(el.topArea, 'se-rtl');
			domUtils.removeClass(el.wysiwygFrame, 'se-rtl');
		}

		const lineNodes = domUtils.getListChildren(
			el.wysiwyg,
			function (current) {
				return this.format.isLine(current) && (current.style.marginRight || current.style.marginLeft || current.style.textAlign);
			}.bind(this)
		);

		for (let i = 0, len = lineNodes.length, n, l, r; i < len; i++) {
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

		if (buttons.dir) {
			domUtils.changeTxt(buttons.dir.querySelector('.se-tooltip-text'), this.lang.toolbar[options._rtl ? 'dir_ltr' : 'dir_rtl']);
			domUtils.changeElement(buttons.dir.firstElementChild, icons[this.options._rtl ? 'dir_ltr' : 'dir_rtl']);
		}

		if (buttons.dir_ltr) {
			if (rtl) domUtils.removeClass(buttons.dir_ltr, 'active');
			else domUtils.addClass(buttons.dir_ltr, 'active');
		}

		if (buttons.dir_rtl) {
			if (rtl) domUtils.addClass(buttons.dir_rtl, 'active');
			else domUtils.removeClass(buttons.dir_rtl, 'active');
		}
	},

	/**
	 * @description Changes to code view or wysiwyg view
	 * @param {boolean|undefined} value true/false, If undefined toggle the codeView mode.
	 */
	codeView: function (value) {
		if (value === undefined) value = !this.status.isCodeView;
		this._offCurrentController();
		domUtils.setDisabled(value, this.codeViewDisabledButtons);
		const _var = this._transformStatus;

		if (!value) {
			if (!domUtils.isNonEditable(this.context.element.wysiwygFrame)) this._setCodeDataToEditor();
			this.context.element.wysiwygFrame.scrollTop = 0;
			this.context.element.code.style.display = 'none';
			this.context.element.wysiwygFrame.style.display = 'block';

			_var.codeOriginCssText = _var.codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');
			_var.wysiwygOriginCssText = _var.wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');

			if (this.options.height === 'auto' && !this.options.codeMirrorEditor) this.context.element.code.style.height = '0px';

			this.status.isCodeView = false;

			if (!this.status.isFullScreen) {
				this._notHideToolbar = false;
				if (/balloon|balloon-always/i.test(this.options.mode)) {
					this.context.element._arrow.style.display = '';
					this._isInline = false;
					this._isBalloon = true;
					this.eventManager._hideToolbar();
				}
			}

			this._nativeFocus();
			domUtils.removeClass(this._styleCommandMap.codeView, 'active');

			// history stack
			if (!domUtils.isNonEditable(this.context.element.wysiwygFrame)) {
				this.history.push(false);
				this.history._resetCachingButton();
			}
		} else {
			this._setEditorDataToCodeView();
			_var.codeOriginCssText = _var.codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');
			_var.wysiwygOriginCssText = _var.wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');

			if (this.status.isFullScreen) this.context.element.code.style.height = '100%';
			else if (this.options.height === 'auto' && !this.options.codeMirrorEditor) this.context.element.code.style.height = this.context.element.code.scrollHeight > 0 ? this.context.element.code.scrollHeight + 'px' : 'auto';

			if (this.options.codeMirrorEditor) this.options.codeMirrorEditor.refresh();

			this.status.isCodeView = true;

			if (!this.status.isFullScreen) {
				this._notHideToolbar = true;
				if (this._isBalloon) {
					this.context.element._arrow.style.display = 'none';
					this.context.element.toolbar.style.left = '';
					this._isInline = true;
					this._isBalloon = false;
					this.toolbar._showInline();
				}
			}

			this.status._range = null;
			this.context.element.code.focus();
			domUtils.addClass(this._styleCommandMap.codeView, 'active');
		}

		this._checkPlaceholder();
		if (this.status.isReadOnly) domUtils.setDisabled(true, this.resizingDisabledButtons);

		// user event
		if (typeof this.events.onToggleCodeView === 'function') this.events.onToggleCodeView(this.status.isCodeView);
	},

	/**
	 * @description Changes to full screen or default screen
	 * @param {boolean|undefined} value true/false, If undefined toggle the codeView mode.
	 */
	fullScreen: function (value) {
		if (value === undefined) value = !this.status.isCodeView;
		const topArea = this.context.element.topArea;
		const toolbar = this.context.element.toolbar;
		const editorArea = this.context.element.editorArea;
		const wysiwygFrame = this.context.element.wysiwygFrame;
		const code = this.context.element.code;
		const _var = this._transformStatus;

		this._offCurrentController();
		const wasToolbarHidden = toolbar.style.display === 'none' || (this._isInline && !this.toolbar._inlineToolbarAttr.isShow);

		if (value) {
			this.status.isFullScreen = true;

			_var.fullScreenInline = this._isInline;
			_var.fullScreenBalloon = this._isBalloon;

			if (this._isInline || this._isBalloon) {
				this._isInline = false;
				this._isBalloon = false;
			}

			if (!!this.options.toolbar_container) this.context.element.relative.insertBefore(toolbar, editorArea);

			topArea.style.position = 'fixed';
			topArea.style.top = '0';
			topArea.style.left = '0';
			topArea.style.width = '100%';
			topArea.style.maxWidth = '100%';
			topArea.style.height = '100%';
			topArea.style.zIndex = '2147483647';

			if (this.context.element._stickyDummy.style.display !== ('none' && '')) {
				_var.fullScreenSticky = true;
				this.context.element._stickyDummy.style.display = 'none';
				domUtils.removeClass(toolbar, 'se-toolbar-sticky');
			}

			_var.bodyOverflow = this._d.body.style.overflow;
			this._d.body.style.overflow = 'hidden';

			_var.editorAreaOriginCssText = editorArea.style.cssText;
			_var.wysiwygOriginCssText = wysiwygFrame.style.cssText;
			_var.codeOriginCssText = code.style.cssText;

			editorArea.style.cssText = toolbar.style.cssText = '';
			wysiwygFrame.style.cssText = (wysiwygFrame.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0];
			code.style.cssText = (code.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0];
			toolbar.style.width = wysiwygFrame.style.height = code.style.height = '100%';
			toolbar.style.position = 'relative';
			toolbar.style.display = 'block';

			_var.fullScreenInnerHeight = this._w.innerHeight - toolbar.offsetHeight;
			editorArea.style.height = _var.fullScreenInnerHeight - this.options.fullScreenOffset + 'px';

			if (this.options.iframe && this.options.height === 'auto') {
				editorArea.style.overflow = 'auto';
				this._iframeAutoHeight();
			}

			this.context.element.topArea.style.marginTop = this.options.fullScreenOffset + 'px';

			if (this._styleCommandMap.fullScreen) {
				domUtils.changeElement(this._styleCommandMap.fullScreen.firstElementChild, this.icons.reduction);
				domUtils.addClass(this._styleCommandMap.fullScreen, 'active');
			}
		} else {
			this.status.isFullScreen = false;

			wysiwygFrame.style.cssText = _var.wysiwygOriginCssText;
			code.style.cssText = _var.codeOriginCssText;
			toolbar.style.cssText = '';
			editorArea.style.cssText = _var.editorAreaOriginCssText;
			topArea.style.cssText = _var.editorOriginCssText;
			this._d.body.style.overflow = _var.bodyOverflow;

			if (this.options.height === 'auto' && !this.options.codeMirrorEditor) this._codeViewAutoHeight();

			if (!!this.options.toolbar_container) this.options.toolbar_container.appendChild(toolbar);

			if (this.options.toolbar_sticky > -1) {
				domUtils.removeClass(toolbar, 'se-toolbar-sticky');
			}

			if (_var.fullScreenSticky && !this.options.toolbar_container) {
				_var.fullScreenSticky = false;
				this.context.element._stickyDummy.style.display = 'block';
				domUtils.addClass(toolbar, 'se-toolbar-sticky');
			}

			this._isInline = _var.fullScreenInline;
			this._isBalloon = _var.fullScreenBalloon;
			this.toolbar._showInline();
			if (!!this.options.toolbar_container) domUtils.removeClass(toolbar, 'se-toolbar-balloon');

			this.toolbar._resetSticky();
			this.context.element.topArea.style.marginTop = '';

			if (this._styleCommandMap.fullScreen) {
				domUtils.changeElement(this._styleCommandMap.fullScreen.firstElementChild, this.icons.expansion);
				domUtils.removeClass(this._styleCommandMap.fullScreen, 'active');
			}
		}

		if (wasToolbarHidden) functions.toolbar.hide();

		// user event
		if (typeof this.events.onToggleFullScreen === 'function') this.events.onToggleFullScreen(this.status.isFullScreen);
	},

	/**
	 * @description Add or remove the class name of "body" so that the code block is visible
	 * @param {boolean|undefined} value true/false, If undefined toggle the codeView mode.
	 */
	showBlocks: function (value) {
		if (value === undefined) value = !this.status.isShowBlocks;

		if (value) {
			domUtils.addClass(this.context.element.wysiwyg, 'se-show-block');
			domUtils.addClass(this._styleCommandMap.showBlocks, 'active');
		} else {
			domUtils.removeClass(this.context.element.wysiwyg, 'se-show-block');
			domUtils.removeClass(this._styleCommandMap.showBlocks, 'active');
		}
		this._resourcesStateChange();
	},

	/**
	 * @description Prints the current content of the editor.
	 */
	print: function () {
		const iframe = domUtils.createElement('IFRAME', {
			style: 'display: none;'
		});
		this._d.body.appendChild(iframe);

		const contentHTML = this.options.printTemplate ? this.options.printTemplate.replace(/\{\{\s*content\s*\}\}/i, this.getContent(true)) : this.getContent(true);
		const printDocument = domUtils.getIframeDocument(iframe);
		const wDoc = this._wd;

		if (this.options.iframe) {
			const arrts = this.options._printClass !== null ? 'class="' + this.options._printClass + '"' : this.options.iframe_fullPage ? domUtils.getAttributesToString(wDoc.body, ['contenteditable']) : 'class="' + this.options._editableClass + '"';

			printDocument.write('' + '<!DOCTYPE html><html>' + '<head>' + wDoc.head.innerHTML + '</head>' + '<body ' + arrts + '>' + contentHTML + '</body>' + '</html>');
		} else {
			const links = this._d.head.getElementsByTagName('link');
			const styles = this._d.head.getElementsByTagName('style');
			let linkHTML = '';
			for (let i = 0, len = links.length; i < len; i++) {
				linkHTML += links[i].outerHTML;
			}
			for (let i = 0, len = styles.length; i < len; i++) {
				linkHTML += styles[i].outerHTML;
			}

			printDocument.write('' + '<!DOCTYPE html><html>' + '<head>' + linkHTML + '</head>' + '<body class="' + (this.options._printClass !== null ? this.options._printClass : this.options._editableClass) + '">' + contentHTML + '</body>' + '</html>');
		}

		this.openLoading();
		this._w.setTimeout(
			function () {
				try {
					iframe.focus();
					// IE or Edge, Chromium
					if (env.isIE || env.isEdge || env.isChromium || !!this._d.documentMode || !!this._w.StyleMedia) {
						try {
							iframe.contentWindow.document.execCommand('print', false, null);
						} catch (e) {
							console.warn('[SUNEDITOR.print.warn] ' + e);
							iframe.contentWindow.print();
						}
					} else {
						// Other browsers
						iframe.contentWindow.print();
					}
				} catch (error) {
					throw Error('[SUNEDITOR.print.fail] error: ' + error);
				} finally {
					this.closeLoading();
					domUtils.removeItem(iframe);
				}
			}.bind(this),
			1000
		);
	},

	/**
	 * @description Open the preview window.
	 */
	preview: function () {
		this.menu.dropdownOff();
		this.menu.containerOff();
		this._offCurrentController();

		const contentHTML = this.options.previewTemplate ? this.options.previewTemplate.replace(/\{\{\s*content\s*\}\}/i, this.getContent(true)) : this.getContent(true);
		const windowObject = this._w.open('', '_blank');
		windowObject.mimeType = 'text/html';
		const wDoc = this._wd;

		if (this.options.iframe) {
			const arrts = this.options._printClass !== null ? 'class="' + this.options._printClass + '"' : this.options.iframe_fullPage ? domUtils.getAttributesToString(wDoc.body, ['contenteditable']) : 'class="' + this.options._editableClass + '"';

			windowObject.document.write(
				'' + '<!DOCTYPE html><html>' + '<head>' + wDoc.head.innerHTML + '<style>body {overflow:auto !important; margin: 10px auto !important; height:auto !important; outline:1px dashed #ccc;}</style>' + '</head>' + '<body ' + arrts + '>' + contentHTML + '</body>' + '</html>'
			);
		} else {
			const links = this._d.head.getElementsByTagName('link');
			const styles = this._d.head.getElementsByTagName('style');
			let linkHTML = '';
			for (let i = 0, len = links.length; i < len; i++) {
				linkHTML += links[i].outerHTML;
			}
			for (let i = 0, len = styles.length; i < len; i++) {
				linkHTML += styles[i].outerHTML;
			}

			windowObject.document.write(
				'' +
					'<!DOCTYPE html><html>' +
					'<head>' +
					'<meta charset="utf-8" />' +
					'<meta name="viewport" content="width=device-width, initial-scale=1">' +
					'<title>' +
					this.lang.toolbar.preview +
					'</title>' +
					linkHTML +
					'</head>' +
					'<body class="' +
					(this.options._printClass !== null ? this.options._printClass : this.options._editableClass) +
					'" style="margin:10px auto !important; height:auto !important; outline:1px dashed #ccc;">' +
					contentHTML +
					'</body>' +
					'</html>'
			);
		}
	},

	/**
	 * @description Copying the content of the editor to the original textarea and execute onSave callback.
	 */
	save: function () {
		this.context.element.originElement.value = this.getContent(false);
		// user event
		if (typeof this.events.onSave === 'function') {
			this.events.onSave(content, core);
			return;
		}
	},

	/**
	 * @description Switch to or off "ReadOnly" mode.
	 * @param {boolean} value "readOnly" boolean value.
	 */
	readOnly: function (value) {
		this.status.isReadOnly = value;
		domUtils.setDisabled(!!value, this.resizingDisabledButtons);

		if (value) {
			this._offCurrentController();
			if (this.menu.currentDropdownActiveButton && this.menu.currentDropdownActiveButton.disabled) this.menu.dropdownOff();
			if (this.menu.currentMoreLayerActiveButton && this.menu.currentMoreLayerActiveButton.disabled) this.menu.moreLayerOff();
			if (this.menu.currentContainerActiveButton && this.menu.currentContainerActiveButton.disabled) this.menu.containerOff();
			if (this.modalForm) this.plugins.modal.close.call(this);

			this.context.element.code.setAttribute('readOnly', 'true');
			domUtils.addClass(this.context.element.wysiwygFrame, 'se-read-only');
		} else {
			this.context.element.code.removeAttribute('readOnly');
			domUtils.removeClass(this.context.element.wysiwygFrame, 'se-read-only');
		}

		if (this.options.codeMirrorEditor) this.options.codeMirrorEditor.setOption('readOnly', !!value);
	},

	/**
	 * @description Disable the suneditor
	 */
	disable: function () {
		this.toolbar.disable();
		this._offCurrentController();
		if (this.modalForm) this.plugins.modal.close.call(this);

		this.context.element.wysiwyg.setAttribute('contenteditable', false);
		this.isDisabled = true;

		if (this.options.codeMirrorEditor) {
			this.options.codeMirrorEditor.setOption('readOnly', true);
		} else {
			this.context.element.code.setAttribute('disabled', 'disabled');
		}
	},

	/**
	 * @description Enable the suneditor
	 */
	enable: function () {
		this.toolbar.enable();
		this.context.element.wysiwyg.setAttribute('contenteditable', true);
		this.isDisabled = false;

		if (this.options.codeMirrorEditor) {
			this.options.codeMirrorEditor.setOption('readOnly', false);
		} else {
			this.context.element.code.removeAttribute('disabled');
		}
	},

	/**
	 * @description Show the suneditor
	 */
	show: function () {
		const topAreaStyle = this.context.element.topArea.style;
		if (topAreaStyle.display === 'none') topAreaStyle.display = 'block';
	},

	/**
	 * @description Hide the suneditor
	 */
	hide: function () {
		this.context.element.topArea.style.display = 'none';
	},

	/**
	 * @description Destroy the suneditor
	 */
	destroy: function () {
		/** remove history */
		this.history._destroy();

		/** remove event listeners */
		this.eventManager._removeAllEvents();

		/** remove element */
		domUtils.removeItem(this.context.element.toolbar);
		domUtils.removeItem(this.context.element.topArea);

		/** remove object reference */
		for (let k in this.context) {
			if (this.context.hasOwnProperty(k)) delete this.context[k];
		}

		/** remove user object */
		for (let k in this) {
			if (this.hasOwnProperty(k)) delete this[k];
		}
	},

	/**
	 * @description Show loading box
	 */
	openLoading: function () {
		this.context.element.loading.style.display = 'block';
	},

	/**
	 * @description Close loading box
	 */
	closeLoading: function () {
		this.context.element.loading.style.display = 'none';
	},

	/**
	 * @description Focus to wysiwyg area using "native focus function"
	 */
	_nativeFocus: function () {
		this.selection.__focus();
		this.selection._init();
	},

	/**
	 * @description Converts wysiwyg area element into a format that can be placed in an editor of code view mode
	 * @param {Element|String} html WYSIWYG element (context.element.wysiwyg) or HTML string.
	 * @param {Boolean} comp If true, does not line break and indentation of tags.
	 * @returns {string}
	 */
	_convertHTMLForCodeView: function (html, comp) {
		let returnHTML = '';
		const wRegExp = this._w.RegExp;
		const brReg = new wRegExp('^(BLOCKQUOTE|PRE|TABLE|THEAD|TBODY|TR|TH|TD|OL|UL|IMG|IFRAME|VIDEO|AUDIO|FIGURE|FIGCAPTION|HR|BR|CANVAS|SELECT)$', 'i');
		const wDoc = typeof html === 'string' ? this._d.createRange().createContextualFragment(html) : html;
		const isFormat = function (current) {
			return this.format.isLine(current) || this.component.is(current);
		}.bind(this);
		const brChar = comp ? '' : '\n';

		let indentSize = comp ? 0 : this.status.codeIndent * 1;
		indentSize = indentSize > 0 ? new this._w.Array(indentSize + 1).join(' ') : '';

		(function recursionFunc(element, indent) {
			const children = element.childNodes;
			const elementRegTest = brReg.test(element.nodeName);
			const elementIndent = elementRegTest ? indent : '';

			for (let i = 0, len = children.length, node, br, lineBR, nodeRegTest, tag, tagIndent; i < len; i++) {
				node = children[i];
				nodeRegTest = brReg.test(node.nodeName);
				br = nodeRegTest ? brChar : '';
				lineBR = isFormat(node) && !elementRegTest && !/^(TH|TD)$/i.test(element.nodeName) ? brChar : '';

				if (node.nodeType === 8) {
					returnHTML += '\n<!-- ' + node.textContent.trim() + ' -->' + br;
					continue;
				}
				if (node.nodeType === 3) {
					if (!domUtils.isList(node.parentElement)) returnHTML += converter.htmlToEntity(/^\n+$/.test(node.data) ? '' : node.data);
					continue;
				}
				if (node.childNodes.length === 0) {
					returnHTML += (/^HR$/i.test(node.nodeName) ? brChar : '') + (/^PRE$/i.test(node.parentElement.nodeName) && /^BR$/i.test(node.nodeName) ? '' : elementIndent) + node.outerHTML + br;
					continue;
				}

				if (!node.outerHTML) {
					// IE
					returnHTML += new _w.XMLSerializer().serializeToString(node);
				} else {
					tag = node.nodeName.toLowerCase();
					tagIndent = elementIndent || nodeRegTest ? indent : '';
					returnHTML += (lineBR || (elementRegTest ? '' : br)) + tagIndent + node.outerHTML.match(wRegExp('<' + tag + '[^>]*>', 'i'))[0] + br;
					recursionFunc(node, indent + indentSize, '');
					returnHTML += (/\n$/.test(returnHTML) ? tagIndent : '') + '</' + tag + '>' + (lineBR || br || elementRegTest ? brChar : '' || /^(TH|TD)$/i.test(node.nodeName) ? brChar : '');
				}
			}
		})(wDoc, '');

		return returnHTML.trim() + brChar;
	},

	/**
	 * @description Convert the data of the code view and put it in the WYSIWYG area.
	 * @private
	 */
	_setCodeDataToEditor: function () {
		const code_html = this._getCodeView();

		if (this.options.iframe_fullPage) {
			const parseDocument = this._parser.parseFromString(code_html, 'text/html');
			const headChildren = parseDocument.head.children;

			for (let i = 0, len = headChildren.length; i < len; i++) {
				if (/^script$/i.test(headChildren[i].tagName)) {
					parseDocument.head.removeChild(headChildren[i]);
					i--, len--;
				}
			}

			let headers = parseDocument.head.innerHTML;
			if (!parseDocument.head.querySelector('link[rel="stylesheet"]') || (this.options.height === 'auto' && !parseDocument.head.querySelector('style'))) {
				headers += converter._setIframeCssTags(this.options);
			}

			this._wd.head.innerHTML = headers;
			this._wd.body.innerHTML = this.html.clean(parseDocument.body.innerHTML, true, null, null);

			const attrs = parseDocument.body.attributes;
			for (let i = 0, len = attrs.length; i < len; i++) {
				if (attrs[i].name === 'contenteditable') continue;
				this._wd.body.setAttribute(attrs[i].name, attrs[i].value);
			}
			if (!domUtils.hasClass(this._wd.body, 'sun-editor-editable')) {
				const editableClasses = this.options._editableClass.split(' ');
				for (let i = 0; i < editableClasses.length; i++) {
					domUtils.addClass(this._wd.body, this.options._editableClass[i]);
				}
			}
		} else {
			this.context.element.wysiwyg.innerHTML = code_html.length > 0 ? this.html.clean(code_html, true, null, null) : '<' + this.options.defaultLineTag + '><br></' + this.options.defaultLineTag + '>';
		}
	},

	/**
	 * @description Convert the data of the WYSIWYG area and put it in the code view area.
	 * @private
	 */
	_setEditorDataToCodeView: function () {
		const codeContent = this._convertHTMLForCodeView(this.context.element.wysiwyg, false);
		let codeValue = '';

		if (this.options.iframe_fullPage) {
			const attrs = domUtils.getAttributesToString(this._wd.body, null);
			codeValue = '<!DOCTYPE html>\n<html>\n' + this._wd.head.outerHTML.replace(/>(?!\n)/g, '>\n') + '<body ' + attrs + '>\n' + codeContent + '</body>\n</html>';
		} else {
			codeValue = codeContent;
		}

		this.context.element.code.style.display = 'block';
		this.context.element.wysiwygFrame.style.display = 'none';

		this._setCodeView(codeValue);
	},

	// ----- private methods -----
	/**
	 * @description Check the components such as image and video and modify them according to the format.
	 * @private
	 */
	_checkComponents: function () {
		for (let i = 0, len = this._fileInfoPluginsCheck.length; i < len; i++) {
			this._fileInfoPluginsCheck[i]();
		}
	},

	/**
	 * @description Initialize the information of the components.
	 * @private
	 */
	_resetComponents: function () {
		for (let i = 0, len = this._fileInfoPluginsReset.length; i < len; i++) {
			this._fileInfoPluginsReset[i]();
		}
	},

	/**
	 * @description Set method in the code view area
	 * @param {string} value HTML string
	 * @private
	 */
	_setCodeView: function (value) {
		if (this.options.codeMirrorEditor) {
			this.options.codeMirrorEditor.getDoc().setValue(value);
		} else {
			this.context.element.code.value = value;
		}
	},

	/**
	 * @description Get method in the code view area
	 * @private
	 */
	_getCodeView: function () {
		return this.options.codeMirrorEditor ? this.options.codeMirrorEditor.getDoc().getValue() : this.context.element.code.value;
	},

	/**
	 * @description Initializ core variable
	 * @param {boolean} reload Is relooad?
	 * @param {string} _initHTML initial html string
	 * @private
	 */
	_init: function (reload, _initHTML) {
		const _w = this._w;
		const wRegExp = _w.RegExp;
		const options = this.options;
		const context = this.context;
		const plugins = this.plugins;

		this._ww = options.iframe ? context.element.wysiwygFrame.contentWindow : _w;
		this._wd = this._d;
		this._charTypeHTML = options.charCounter_type === 'byte-html';
		this.wwComputedStyle = _w.getComputedStyle(context.element.wysiwyg);
		this._editorHeight = context.element.wysiwygFrame.offsetHeight;
		this._editorHeightPadding = numbers.get(this.wwComputedStyle.getPropertyValue('padding-top')) + numbers.get(this.wwComputedStyle.getPropertyValue('padding-bottom'));
		this.openControllers = [];

		if (!options.iframe && typeof _w.ShadowRoot === 'function') {
			let child = context.element.wysiwygFrame;
			while (child) {
				if (child.shadowRoot) {
					this.shadowRoot = child.shadowRoot;
					break;
				} else if (child instanceof _w.ShadowRoot) {
					this.shadowRoot = child;
					break;
				}
				child = child.parentNode;
			}
		}

		// set modes
		this._isInline = /inline/i.test(options.mode);
		this._isBalloon = /balloon|balloon-always/i.test(options.mode);
		this._isBalloonAlways = /balloon-always/i.test(options.mode);

		// caching buttons
		this._cachingButtons();

		// cache editor's element
		this._transformStatus.editorOriginCssText = context.element.topArea.style.cssText;
		this._placeholder = context.element.placeholder;
		this._lineBreaker = context.element.lineBreaker;

		// Init, validate
		if (options.iframe) {
			this._wd = context.element.wysiwygFrame.contentDocument;
			context.element.wysiwyg = this._wd.body;
			if (options._editorStyles.editor) context.element.wysiwyg.style.cssText = options._editorStyles.editor;
			if (options.height === 'auto') this._iframeAuto = this._wd.body;
		}

		// base
		this.events = Events();
		this.history = history(this, this._onChange_historyStack.bind(this));
		this.eventManager = new EventManager(this);

		// util classes
		this.offset = new Offset(this);
		this.notice = new Notice(this);
		this.shortcuts = new Shortcuts(this);
		// main classes
		this.node = new Node(this);
		this.html = new HTML(this);
		this.component = new Component(this);
		this.format = new Format(this);
		this.toolbar = new Toolbar(this);
		this.selection = new Selection(this);
		this.char = new Char(this);
		this.menu = new Menu(this);

		// register modules
		ModuleInterface.call(this.eventManager, this);
		ModuleInterface.call(this.node, this);
		ModuleInterface.call(this.selection, this);
		ModuleInterface.call(this.html, this);
		ModuleInterface.call(this.component, this);
		ModuleInterface.call(this.format, this);
		ModuleInterface.call(this.toolbar, this);
		ModuleInterface.call(this.char, this);
		ModuleInterface.call(this.menu, this);

		// file components
		this._fileInfoPluginsCheck = [];
		this._fileInfoPluginsReset = [];

		// text components
		this._MELInfo = {
			query: '',
			map: {}
		};

		// plugins install
		// Command and file plugins registration
		this.activePlugins = [];
		this._onSelectPlugins = [];
		this._onKeyDownPlugins = [];
		this._fileManager.tags = [];
		this._fileManager.pluginMap = {};

		const managedClass = [];
		let filePluginRegExp = [];
		let plugin;
		for (let key in plugins) {
			if (!plugins.hasOwnProperty(key)) continue;
			this.registerPlugin(key, this._pluginCallButtons[key]);
			plugin = this.plugins[key];

			if (typeof plugin.checkFileInfo === 'function' && typeof plugin.resetFileInfo === 'function') {
				this._fileInfoPluginsCheck.push(plugin.checkFileInfo.bind(this));
				this._fileInfoPluginsReset.push(plugin.resetFileInfo.bind(this));
			}

			if (_w.Array.isArray(plugin.fileTags)) {
				const fileTags = plugin.fileTags;
				this._fileManager.tags = this._fileManager.tags.concat(fileTags);
				filePluginRegExp.push(key);
				for (let tag = 0, tLen = fileTags.length; tag < tLen; tag++) {
					this._fileManager.pluginMap[fileTags[tag].toLowerCase()] = key;
				}
			}

			if (typeof plugin.onPluginMousedown === 'function') {
				this._onSelectPlugins.push(plugin.onPluginMousedown.bind(plugin));
			}

			if (typeof plugin.onPluginKeyDown === 'function') {
				this._onKeyDownPlugins.push(plugin.onPluginKeyDown.bind(plugin));
			}

			if (plugin.managedElement) {
				const info = plugin.managedElement();
				managedClass.push('.' + info.className);
				this._MELInfo.map[info.className] = info.method;
			}
		}

		this._MELInfo.query = managedClass.toString();
		this._fileManager.queryString = this._fileManager.tags.join(',');
		this._fileManager.regExp = new wRegExp('^(' + (this._fileManager.tags.join('|') || '\\^') + ')$', 'i');
		this._fileManager.pluginRegExp = new wRegExp('^(' + (filePluginRegExp.length === 0 ? '\\^' : filePluginRegExp.join('|')) + ')$', 'i');

		// init content
		this._initWysiwygArea(reload, _initHTML);
		this.setDir(options.textDirection);
	},

	/**
	 * @description Save the current buttons states to "allCommandButtons" object
	 * @private
	 */
	_saveButtonStates() {
		const currentButtons = this.context.element._buttonTray.querySelectorAll('.se-menu-list button[data-type]');
		for (let i = 0, element, command; i < currentButtons.length; i++) {
			element = currentButtons[i];
			command = element.getAttribute('data-command');

			this.allCommandButtons[command] = element;
		}
	},

	/**
	 * @description Recover the current buttons states from "allCommandButtons" object
	 * @private
	 */
	_recoverButtonStates() {
		const currentButtons = this.context.element._buttonTray.querySelectorAll('.se-menu-list button[data-type]');
		for (let i = 0, button, command, oldButton; i < currentButtons.length; i++) {
			button = currentButtons[i];
			command = button.getAttribute('data-command');

			oldButton = this.allCommandButtons[command];
			if (oldButton) {
				button.parentElement.replaceChild(oldButton, button);
				if (this.context.buttons[command]) this.context.buttons[command] = oldButton;
			}
		}
	},

	/**
	 * @description Caching basic buttons to use
	 * @private
	 */
	_cachingButtons: function () {
		this.codeViewDisabledButtons = this.context.element._buttonTray.querySelectorAll('.se-menu-list button[data-type]:not([class~="se-code-view-enabled"]):not([data-type="MORE"])');
		this.resizingDisabledButtons = this.context.element._buttonTray.querySelectorAll('.se-menu-list button[data-type]:not([class~="se-resizing-enabled"]):not([data-type="MORE"])');

		this._saveButtonStates();

		const buttons = this.context.buttons;
		const textTags = this.options.textTags;
		this._commandMap = {
			OUTDENT: buttons.outdent,
			INDENT: buttons.indent
		};
		this._commandMap[textTags.bold.toUpperCase()] = buttons.bold;
		this._commandMap[textTags.underline.toUpperCase()] = buttons.underline;
		this._commandMap[textTags.italic.toUpperCase()] = buttons.italic;
		this._commandMap[textTags.strike.toUpperCase()] = buttons.strike;
		this._commandMap[textTags.sub.toUpperCase()] = buttons.subscript;
		this._commandMap[textTags.sup.toUpperCase()] = buttons.superscript;

		this._styleCommandMap = {
			fullScreen: buttons.fullScreen,
			showBlocks: buttons.showBlocks,
			codeView: buttons.codeView
		};
	},

	/**
	 * @description Initializ wysiwyg area (Only called from core._init)
	 * @param {boolean} reload Is relooad?
	 * @param {string} _initHTML initial html string
	 * @private
	 */
	_initWysiwygArea: function (reload, _initHTML) {
		this.context.element.wysiwyg.innerHTML = reload ? _initHTML : this.html.clean(typeof _initHTML === 'string' ? _initHTML : this.context.element.originElement.value, true, null, null);
	},

	/**
	 * @description Called when there are changes to tags in the wysiwyg region.
	 * @private
	 */
	_resourcesStateChange: function () {
		this._iframeAutoHeight();
		this._checkPlaceholder();
	},

	/**
	 * @description Called when after execute "history.push"
	 * @private
	 */
	_onChange_historyStack: function () {
		if (this.status.hasFocus) this.eventManager.applyTagEffect();
		this.status.isChanged = true;
		if (this.context.buttons.save) this.context.buttons.save.removeAttribute('disabled');
		// user event
		if (this.events.onChange) this.events.onChange(this.getContent(true));
		if (this.context.element.toolbar.style.display === 'block') this.toolbar._showBalloon();
	},

	/**
	 * @description Modify the height value of the iframe when the height of the iframe is automatic.
	 * @private
	 */
	_iframeAutoHeight: function () {
		if (this._iframeAuto) {
			this._w.setTimeout(
				function () {
					this.context.element.wysiwygFrame.style.height = this._iframeAuto.offsetHeight + 'px';
				}.bind(this)
			);
		}

		if (this._iframeAuto) {
			this._w.setTimeout(
				function () {
					const h = this._iframeAuto.offsetHeight;
					this.context.element.wysiwygFrame.style.height = h + 'px';
					if (env.isIE) this.__callResizeFunction(h, null);
				}.bind(this)
			);
		} else if (env.isIE) {
			this.__callResizeFunction(this.context.element.wysiwygFrame.offsetHeight, null);
		}
	},

	__callResizeFunction: function (h, resizeObserverEntry) {
		h = h === -1 ? (resizeObserverEntry.borderBoxSize ? resizeObserverEntry.borderBoxSize[0].blockSize : resizeObserverEntry.contentRect.height + this._editorHeightPadding) : h;
		if (this._editorHeight !== h) {
			if (typeof this.events.onResizeEditor === 'function') this.events.onResizeEditor(h, this._editorHeight, core, resizeObserverEntry);
			this._editorHeight = h;
		}
	},

	_codeViewAutoHeight: function () {
		if (this.status.isFullScreen) return;
		this.context.element.code.style.height = this.context.element.code.scrollHeight + 'px';
	},

	/**
	 * @description Set display property when there is placeholder.
	 * @private
	 */
	_checkPlaceholder: function () {
		if (this._placeholder) {
			if (this.status.isCodeView) {
				this._placeholder.style.display = 'none';
				return;
			}

			const wysiwyg = this.context.element.wysiwyg;
			if (!domUtils.isZeroWith(wysiwyg.textContent) || wysiwyg.querySelector(domUtils._allowedEmptyNodeList) || (wysiwyg.innerText.match(/\n/g) || '').length > 1) {
				this._placeholder.style.display = 'none';
			} else {
				this._placeholder.style.display = 'block';
			}
		}
	},

	/**
	 * @description Initialization after "setOptions"
	 * @param {Object} el context.element
	 * @param {string} _initHTML Initial html string
	 * @private
	 */
	_setOptionsInit: function (el, _initHTML) {
		this.context = Context(el.originElement, el.top, el.wysiwygFrame, el.code, this.options); //@todo context don't reset
		this._componentsInfoReset = true;
		this._editorInit(true, _initHTML);
	},

	/**
	 * @description Initializ editor
	 * @param {boolean} reload Is relooad?
	 * @param {string} _initHTML initial html string
	 * @private
	 */
	_editorInit: function (reload, _initHTML) {
		// initialize core and add event listeners
		this._init(reload, _initHTML);
		this.eventManager._addEvent();
		this.char.display();
		this.toolbar._offSticky();
		this.toolbar._resetSticky();

		// toolbar visibility
		this.context.element.toolbar.style.visibility = '';

		this._checkComponents();
		this._componentsInfoInit = false;
		this._componentsInfoReset = false;

		this.history.reset(true);
		this._resourcesStateChange();

		this._w.setTimeout(
			function () {
				// observer
				if (this.eventManager._resizeObserver) this.eventManager._resizeObserver.observe(this.context.element.wysiwygFrame);
				if (this.eventManager._toolbarObserver) this.eventManager._toolbarObserver.observe(this.context.element._toolbarShadow);
				// user event
				if (typeof this.events.onload === 'function') this.events.onload(reload);
			}.bind(this)
		);
	},

	_offCurrentController: function () {
		const cont = this.openControllers;
		for (let i = 0; i < cont.length; i++) {
			cont[i].inst.close();
		}
	},

	Constructor: Core
};

export default Core;
