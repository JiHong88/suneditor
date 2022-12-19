import Helper, { env, converter, domUtils, numbers } from '../helper';
import Constructor, { ResetOptions, UpdateButton } from './constructor';
import Context from './context';

// class dependency
import ClassDependency from '../dependency/_classes';

// base
import History from './base/history';
import EventManager from './base/eventManager';
import Viewer from './base/viewer';

// modules
import Char from './class/char';
import Component from './class/component';
import Format from './class/format';
import HTML from './class/html';
import Menu from './class/menu';
import Node_ from './class/node';
import Notice from './class/notice';
import Offset from './class/offset';
import Selection from './class/selection';
import Shortcuts from './class/shortcuts';
import Toolbar from './class/toolbar';

/**
 * @description SunEditor constructor function.
 * @param {Array.<Element>} multiTargets Target textarea
 * @param {Object} options options
 * @returns {Object}
 */
const Editor = function (multiTargets, options) {
	const _d = multiTargets[0].target.ownerDocument || env._d;
	const _w = _d.defaultView || env._w;
	const product = Constructor(multiTargets, options);
	const context = product.commonContext;
	context.targetElements = product.elementContext;
	context.element = product.elementContext[product.rootId];

	// properties
	this.rootId = product.rootId;
	this.rootKeys = product.rootKeys;

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
	 * @description Editor options
	 * @type {Object.<string, any>}
	 */
	this.options = options;

	/**
	 * @description Plugins
	 * @type {Object.<string, any>}
	 */
	this.plugins = options.plugins || {};

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
	this.lang = options.lang;

	/**
	 * @description History object for undo, redo
	 */
	this.history = null;

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
	 * @property {number} rootKey Current root key
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
		rootKey: product.rootId,
		_range: null,
	};

	/**
	 * @description Is inline mode?
	 */
	this.isInline = null;

	/**
	 * @description Is balloon|balloon-always mode?
	 */
	this.isBalloon = null;

	/**
	 * @description Is balloon-always mode?
	 */
	this.isBalloonAlways = null;

	/**
	 * @description Helper util
	 */
	this.helper = Helper;

	// ----- Properties not shared with core -----
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

	// ----- private properties -----
	/**
	 * @description Plugin buttons
	 * @private
	 */
	this._pluginCallButtons = product.pluginCallButtons;

	/**
	 * @description Plugin call
	 * @private
	 */
	this._onMousedownPlugins = [];
	this._onKeyDownPlugins = [];

	/**
	 * @description Controller, modal relative
	 * @private
	 */
	this.opendModal = null;
	this.opendControllers = [];
	this.currentControllerName = '';
	this.currentControllerTarget = null;
	this._controllerOnDisabledButtons = [];
	this._codeViewDisabledButtons = [];
	this._controllerTargetContext = null;

	/**
	 * @description Button List in Responsive Toolbar.
	 * @private
	 */
	this._responsiveButtons = product.responsiveButtons;

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
	 * @description Style button related to edit area
	 * @property {Element} fullScreen fullScreen button element
	 * @property {Element} showBlocks showBlocks button element
	 * @property {Element} codeView codeView button element
	 * @private
	 */
	this._styleCommandMap = null;

	/**
	 * @description Current Figure container.
	 * @private
	 */
	this._figureContainer = null;

	/**
	 * @description FullScreen and codeView relative status
	 */
	this._transformStatus = {
		bodyOverflow: '',
		editorAreaOriginCssText: '',
		wysiwygOriginCssText: '',
		codeOriginCssText: '',
		fullScreenInnerHeight: 0,
		fullScreenSticky: false,
		fullScreenBalloon: false,
		fullScreenInline: false,
		toolbarParent: null
	};

	/**
	 * @description Parser
	 */
	this._parser = new _w.DOMParser();

	/** ----- Create editor ------------------------------------------------------------ */
	this._editorInit(false);

	const inst = this;
	const els = context.targetElements;
	for (let key in els) {
		const e = els[key];
		const o = e.originElement;
		const t = e.topArea;
		o.style.display = 'none';
		t.style.display = 'block';
		o.parentNode.insertBefore(t, o.nextElementSibling);
		e.editorArea.appendChild(e.wysiwygFrame);

		if (!options.iframe) {
			inst._setEditorParams(e);
			inst._initWysiwygArea(e, false, e.options.value || options.value);
		} else {
			e.wysiwygFrame.addEventListener('load', function () {
				converter._setIframeDocument(this, options);
				inst._setEditorParams(e);
				inst._initWysiwygArea(e, false, e.options.value || options.value);
			});
		}
	}

	this.history.reset();
};

Editor.prototype = {
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
					const layer = this.context.toolbar.main.querySelector('.' + command);
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

			if (this.isReadOnly && domUtils.arrayIncludes(this._controllerOnDisabledButtons, target)) return;
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
				const figcaption = domUtils.getParentElement(this.selection.getNode(), 'FIGCAPTION');
				const selectArea = figcaption || this.context.element.wysiwyg;
				let first =
					domUtils.getEdgeChild(
						selectArea.firstChild,
						function (current) {
							return current.childNodes.length === 0 || current.nodeType === 3;
						},
						false
					) || selectArea.firstChild;
				let last =
					domUtils.getEdgeChild(
						selectArea.lastChild,
						function (current) {
							return current.childNodes.length === 0 || current.nodeType === 3;
						},
						true
					) || selectArea.lastChild;
				if (!first || !last) return;
				if (domUtils.isMedia(first)) {
					const info = this.component.get(first);
					const br = domUtils.createElement('BR');
					const format = domUtils.createElement(this.options.defaultLineTag, null, br);
					first = info ? info.container : first;
					first.parentNode.insertBefore(format, first);
					first = br;
				}
				if (domUtils.isMedia(last)) {
					last = domUtils.createElement('BR');
					selectArea.appendChild(domUtils.createElement(this.options.defaultLineTag, null, last));
				}
				this.toolbar._showBalloon(this.selection.setRange(first, 0, last, last.textContent.length));
				break;
			case 'codeView':
				this.viewer.codeView(!this.status.isCodeView);
				break;
			case 'fullScreen':
				this.viewer.fullScreen(!this.status.isFullScreen);
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
				this.viewer.print();
				break;
			case 'preview':
				this.viewer.preview();
				break;
			case 'showBlocks':
				this.viewer.showBlocks(!this.status.isShowBlocks);
				break;
			case 'dir':
				this.setDir(this.options.textDirection);
				break;
			case 'dir_ltr':
				this.setDir('ltr');
				break;
			case 'dir_rtl':
				this.setDir('rtl');
				break;
			case 'save':
				if (typeof this.options.callBackSave === 'function') {
					this.options.callBackSave(this.getContent(), this.status.isChanged);
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

		// set option
		const ctx = this.context;
		const initHTML = ctx.element.wysiwyg.innerHTML;
		const product = ResetOptions(this.context, mergeOptions);

		if (mergeOptions.iframe) {
			ctx.element.wysiwygFrame.addEventListener('load', function () {
				converter._setIframeDocument(this, mergeOptions);
				this._setOptionsInit(ctx, product, mergeOptions, initHTML);
			});
		}

		ctx.element.editorArea.appendChild(ctx.element.wysiwygFrame);

		if (!mergeOptions.iframe) {
			this._setOptionsInit(ctx, product, mergeOptions, initHTML);
		}
	},

	/**
	 * @description Set direction to "rtl" or "ltr".
	 * @param {string} dir "rtl" or "ltr"
	 */
	setDir: function (dir) {
		const rtl = dir === 'rtl';
		const changeDir = this._prevRtl !== rtl;
		const ctxEl = this.context.element;
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
			domUtils.addClass(ctxEl.topArea, 'se-rtl');
			domUtils.addClass(ctxEl.wysiwygFrame, 'se-rtl');
		} else {
			domUtils.removeClass(ctxEl.topArea, 'se-rtl');
			domUtils.removeClass(ctxEl.wysiwygFrame, 'se-rtl');
		}

		const lineNodes = domUtils.getListChildren(
			ctxEl.wysiwyg,
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
			domUtils.changeTxt(buttons.dir.querySelector('.se-tooltip-text'), this.lang.toolbar[this.options._rtl ? 'dir_ltr' : 'dir_rtl']);
			domUtils.changeElement(buttons.dir.firstElementChild, this.icons[this.options._rtl ? 'dir_ltr' : 'dir_rtl']);
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
	 * @description Change the current root index.
	 * @param {number} rootKey
	 */
	changeContextElement: function (rootKey) {
		if (!rootKey) return;

		this.status.rootKey = rootKey;

		const ctx = this.context;
		const el = (ctx.element = ctx.targetElements[rootKey]);
		this._lineBreakerButton = el.lineBreaker.querySelector('button');
		this._lineBreaker_t = el.lineBreaker_t;
		this._lineBreaker_b = el.lineBreaker_b;
	},

	/**
	 * @description javascript execCommand
	 * @param {string} command javascript execCommand function property
	 * @param {Boolean|undefined} showDefaultUI javascript execCommand function property
	 * @param {string|undefined} value javascript execCommand function property
	 */
	execCommand: function (command, showDefaultUI, value) {
		this.context.element._wd.execCommand(command, showDefaultUI, command === 'formatBlock' ? '<' + value + '>' : value);
		this.history.push(true);
	},

	/**
	 * @description Focus to wysiwyg area
	 * @param {number|undefined} rootKey Root index
	 */
	focus: function (rootKey) {
		if (numbers.is(rootKey)) this.changeContextElement(rootKey);
		if (this.context.element.wysiwygFrame.style.display === 'none') return;

		if (this.options.iframe || !this.context.element.wysiwyg.contains(this.selection.getNode())) {
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
		if (this.isBalloon) this.eventManager._toggleToolbarBalloon();
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
	 * @param {number|Array.<number>|undefined} rootKey Root index
	 */
	setContent: function (html, rootKey) {
		this.selection.removeRange();
		const convertValue = html === null || html === undefined ? '' : this.html.clean(html, true, null, null);

		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!this._w.Array.isArray(rootKey)) rootKey = [rootKey];

		for (let i = 0; i < rootKey.length; i++) {
			this.changeContextElement(rootKey[i]);

			if (!this.status.isCodeView) {
				this.context.element.wysiwyg.innerHTML = convertValue;
			} else {
				const value = this._convertHTMLToCode(convertValue, false);
				this.viewer._setCodeView(value);
			}
		}

		if (!this.status.isCodeView) {
			this._resetComponents();
			this.history.push(false);
		}
	},

	/**
	 * @description Add content to the end of content.
	 * @param {string} content Content to Input
	 * @param {number|Array.<number>|undefined} rootKey Root index
	 */
	addContent: function (content, rootKey) {
		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!this._w.Array.isArray(rootKey)) rootKey = [rootKey];

		for (let i = 0; i < rootKey.length; i++) {
			this.changeContextElement(rootKey[i]);

			const convertValue = this.html.clean(content, true, null, null);
			if (!this.status.isCodeView) {
				const temp = domUtils.createElement('DIV', null, convertValue);
				const children = temp.children;
				for (let i = 0, len = children.length; i < len; i++) {
					if (!children[i]) continue;
					this.context.element.wysiwyg.appendChild(children[i]);
				}
			} else {
				this.viewer._setCodeView(this.viewer._getCodeView() + '\n' + this._convertHTMLToCode(convertValue, false));
			}
		}

		if (!this.status.isCodeView) {
			this.history.push(false);
		}
	},

	/**
	 * @description Sets the content of the iframe's head tag and body tag when using the "iframe" or "iframe_fullPage" option.
	 * @param {Object} ctx { head: HTML string, body: HTML string}
	 * @param {number|Array.<number>|undefined} rootKey Root index
	 */
	setFullPageContent: function (ctx, rootKey) {
		if (!this.options.iframe) return false;

		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!this._w.Array.isArray(rootKey)) rootKey = [rootKey];

		for (let i = 0; i < rootKey.length; i++) {
			this.changeContextElement(rootKey[i]);

			if (ctx.head) this.context.element._wd.head.innerHTML = ctx.head.replace(/<script[\s\S]*>[\s\S]*<\/script>/gi, '');
			if (ctx.body) this.context.element._wd.body.innerHTML = this.html.clean(ctx.body, true, null, null);
		}
	},

	/**
	 * @description Gets the current content
	 * @param {boolean} withFrame Gets the current content with containing parent div.sun-editor-editable (<div class="sun-editor-editable">{content}</div>).
	 * Ignored for options.iframe_fullPage is true.
	 * @param {boolean} includeFullPage Return only the content of the body without headers when the "iframe_fullPage" option is true
	 * @param {number|Array.<number>|undefined} rootKey Root index
	 * @returns {string|Array.<string>}
	 */
	getContent: function (withFrame, includeFullPage, rootKey) {
		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!this._w.Array.isArray(rootKey)) rootKey = [rootKey];

		const prevrootKey = this.status.rootKey;
		const resultValue = {};
		for (let i = 0, len = rootKey.length, r; i < len; i++) {
			this.changeContextElement(rootKey[i]);

			const ctxElement = this.context.element;
			const renderHTML = domUtils.createElement('DIV', null, this._convertHTMLToCode(ctxElement.wysiwyg, true));
			const figcaptions = domUtils.getListChildren(renderHTML, function (current) {
				return /FIGCAPTION/i.test(current.nodeName);
			});

			for (let i = 0, len = figcaptions.length; i < len; i++) {
				figcaptions[i].removeAttribute('contenteditable');
			}

			if (this.options.iframe_fullPage) {
				if (includeFullPage) {
					const attrs = domUtils.getAttributesToString(ctxElement._wd.body, ['contenteditable']);
					r = '<!DOCTYPE html><html>' + ctxElement._wd.head.outerHTML + '<body ' + attrs + '>' + renderHTML.innerHTML + '</body></html>';
				} else {
					r = renderHTML.innerHTML;
				}
			} else {
				r = withFrame ? '<div class="sun-editor-editable' + (this.options._rtl ? ' se-rtl' : '') + '">' + renderHTML.innerHTML + '</div>' : renderHTML.innerHTML;
			}

			resultValue[rootKey[i]] = r;
		}

		this.changeContextElement(prevrootKey);
		return rootKey.length > 1 ? resultValue : resultValue[rootKey[0]];
	},

	/**
	 * @description Gets only the text of the suneditor content
	 * @param {number|Array.<number>|undefined} rootKey Root index
	 * @returns {string|Array.<string>}
	 */
	getText: function (rootKey) {
		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!this._w.Array.isArray(rootKey)) rootKey = [rootKey];

		const prevrootKey = this.status.rootKey;
		const resultValue = {};
		for (let i = 0, len = rootKey.length; i < len; i++) {
			this.changeContextElement(rootKey[i]);
			resultValue[rootKey[i]] = this.context.element.wysiwyg.textContent;
		}

		this.changeContextElement(prevrootKey);
		return rootKey.length > 1 ? resultValue : resultValue[rootKey[0]];
	},

	/**
	 * @description Set "options.editorCSSText" style.
	 * Define the style of the edit area
	 * It can also be defined with the "setOptions" method, but the "setEditorStyle" method does not render the editor again.
	 * @param {string} style Style string
	 */
	setEditorStyle: function (style) {
		const newStyles = (this.options._editorStyles = converter._setDefaultOptionStyle(this.options, style));
		const ctxElement = this.context.element;

		// top area
		ctxElement.topArea.style.cssText = newStyles.top;
		// code view
		ctxElement.code.style.cssText = this.options._editorStyles.frame;
		ctxElement.code.style.display = 'none';
		if (this.options.height === 'auto') {
			ctxElement.code.style.overflow = 'hidden';
		} else {
			ctxElement.code.style.overflow = '';
		}
		// wysiwyg frame
		if (!this.options.iframe) {
			ctxElement.wysiwygFrame.style.cssText = newStyles.frame + newStyles.editor;
		} else {
			ctxElement.wysiwygFrame.style.cssText = newStyles.frame;
			ctxElement.wysiwyg.style.cssText = newStyles.editor;
		}
	},

	/**
	 * @description Switch to or off "ReadOnly" mode.
	 * @param {boolean} value "readOnly" boolean value.
	 * @param {number|Array.<number>|undefined} rootKey Root index
	 */
	readOnly: function (value, rootKey) {
		this.status.isReadOnly = value;
		domUtils.setDisabled(this._controllerOnDisabledButtons, !!value);

		if (value) {
			this._offCurrentController();
			this._offCurrentModal();

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

		if (this.options.hasCodeMirror) {
			this.viewer._codeMirrorEditor('readonly', !!value);
		}
	},

	/**
	 * @description Disable the suneditor
	 */
	disable: function (rootKey) {
		this.toolbar.disable();
		this._offCurrentController();
		this._offCurrentModal();

		if (this.modalForm) this.plugins.modal.close.call(this);

		this.context.element.wysiwyg.setAttribute('contenteditable', false);
		this.isDisabled = true;

		if (this.options.hasCodeMirror) {
			this.viewer._codeMirrorEditor('readonly', true);
		} else {
			this.context.element.code.setAttribute('disabled', 'disabled');
		}
	},

	/**
	 * @description Enable the suneditor
	 */
	enable: function (rootKey) {
		this.toolbar.enable();
		this.context.element.wysiwyg.setAttribute('contenteditable', true);
		this.isDisabled = false;

		if (this.options.hasCodeMirror) {
			this.viewer._codeMirrorEditor('readonly', false);
		} else {
			this.context.element.code.removeAttribute('disabled');
		}
	},

	/**
	 * @description Show the suneditor
	 */
	show: function (rootKey) {
		const topAreaStyle = this.context.element.topArea.style;
		if (topAreaStyle.display === 'none') topAreaStyle.display = 'block';
	},

	/**
	 * @description Hide the suneditor
	 */
	hide: function (rootKey) {
		this.context.element.topArea.style.display = 'none';
	},

	/**
	 * @description Copying the content of the editor to the original textarea and execute onSave callback.
	 */
	save: function () {
		const value = this.getContent();
		this.context.element.originElement.value = value;
		// user event
		if (typeof this.events.onSave === 'function') {
			this.events.onSave(value);
			return;
		}
	},

	/**
	 * @description Destroy the suneditor
	 */
	destroy: function () {
		/** remove element */
		domUtils.removeItem(this.context._carrierWrapper);
		domUtils.removeItem(this.context.toolbar._wrapper);
		const ctxElements = this.context.targetElements;
		for (let k in ctxElements) {
			domUtils.removeItem(ctxElements[k].topArea);
		}

		/** remove history */
		this.history._destroy();

		/** remove event listeners */
		this.eventManager._removeAllEvents();

		/** destory external library */
		if (this.options.codeMirror6Editor) {
			this.options.codeMirror6Editor.destroy();
		}

		/** remove object reference */
		for (let k in this) {
			if (this.hasOwnProperty(k)) delete this[k];
		}
	},

	/** ----- private methods ----------------------------------------------------------------------------------------------------------------------------- */
	/**
	 * @description Off current controllers
	 * @private
	 */
	_offCurrentController: function () {
		const cont = this.opendControllers;
		const fixedCont = [];
		for (let i = 0; i < cont.length; i++) {
			if (cont[i].fixed) {
				fixedCont.push(cont[i]);
				continue;
			}
			if (typeof cont[i].inst.close === 'function') cont[i].inst.close();
			else if (cont[i].form) cont[i].form.style.display = 'none';
		}
		this.opendControllers = fixedCont;
	},

	/**
	 * @description Off current modal
	 * @private
	 */
	_offCurrentModal: function () {
		if (this.opendModal) {
			this.opendModal.close();
		}
	},

	/**
	 * @description Show loading box
	 * @private
	 */
	_openLoading: function () {
		this.context._loading.style.display = 'block';
	},

	/**
	 * @description Close loading box
	 * @private
	 */
	_closeLoading: function () {
		this.context._loading.style.display = 'none';
	},

	/**
	 * @description Focus to wysiwyg area using "native focus function"
	 * @private
	 */
	_nativeFocus: function () {
		this.selection.__focus();
		this.selection._init();
	},

	/**
	 * @description construct wysiwyg area element to html string
	 * @param {Element|String} html WYSIWYG element (context.element.wysiwyg) or HTML string.
	 * @param {Boolean} comp If true, does not line break and indentation of tags.
	 * @returns {string}
	 */
	_convertHTMLToCode: function (html, comp) {
		let returnHTML = '';
		const _w = this._w;
		const wRegExp = _w.RegExp;
		const brReg = new wRegExp('^(BLOCKQUOTE|PRE|TABLE|THEAD|TBODY|TR|TH|TD|OL|UL|IMG|IFRAME|VIDEO|AUDIO|FIGURE|FIGCAPTION|HR|BR|CANVAS|SELECT)$', 'i');
		const wDoc = typeof html === 'string' ? this._d.createRange().createContextualFragment(html) : html;
		const isFormat = function (current) {
			return this.format.isLine(current) || this.component.is(current);
		}.bind(this);
		const brChar = comp ? '' : '\n';

		let indentSize = comp ? 0 : this.status.codeIndentSize * 1;
		indentSize = indentSize > 0 ? new _w.Array(indentSize + 1).join(' ') : '';

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

	_setEditorParams: function (e) {
		const options = this.options;
		const _w = this._w;

		this._charTypeHTML = options.charCounter_type === 'byte-html';
		this.wwComputedStyle = _w.getComputedStyle(e.wysiwyg);
		this._editorHeight = e.wysiwygFrame.offsetHeight;
		this._editorPadding = {
			left: numbers.get(this.wwComputedStyle.getPropertyValue('padding-left')),
			right: numbers.get(this.wwComputedStyle.getPropertyValue('padding-right')),
			top: numbers.get(this.wwComputedStyle.getPropertyValue('padding-top')),
			bottom: numbers.get(this.wwComputedStyle.getPropertyValue('padding-bottom'))
		};
		this._editorHeightPadding = this._editorPadding.top + this._editorPadding.bottom;

		if (!options.iframe && typeof _w.ShadowRoot === 'function') {
			let child = e.wysiwygFrame;
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
		this.isInline = /inline/i.test(options.mode);
		this.isBalloon = /balloon/i.test(options.mode);
		this.isBalloonAlways = /balloon-always/i.test(options.mode);

		// wisywig attributes
		const attr = this.options.frameAttrbutes;
		for (let k in attr) {
			e.wysiwyg.setAttribute(k, attr[k]);
		}

		// init, validate
		e._ww = options.iframe ? e.wysiwygFrame.contentWindow : _w;
		e._wd = this._d;
		if (options.iframe) {
			e._wd = e.wysiwygFrame.contentDocument;
			e.wysiwyg = e._wd.body;
			if (options._editorStyles.editor) e.wysiwyg.style.cssText = options._editorStyles.editor;
			if (options.height === 'auto') this._iframeAuto = e._wd.body;
		}

		// add events
		this.eventManager._addEvent(e);
	},

	_registerClass: function () {
		// base
		this.events = this.options.events;
		this.history = History(this, this._onChange_historyStack.bind(this));
		this.eventManager = new EventManager(this);
		this.viewer = new Viewer(this);

		// util classes
		this.offset = new Offset(this);
		this.shortcuts = new Shortcuts(this);
		this.notice = new Notice(this);

		// main classes
		this.node = new Node_(this);
		this.html = new HTML(this);
		this.component = new Component(this);
		this.format = new Format(this);
		this.toolbar = new Toolbar(this);
		this.selection = new Selection(this);
		this.char = new Char(this);
		this.menu = new Menu(this);

		// register main classes
		ClassDependency.call(this.eventManager, this);
		ClassDependency.call(this.viewer, this);
		ClassDependency.call(this.node, this);
		ClassDependency.call(this.selection, this);
		ClassDependency.call(this.html, this);
		ClassDependency.call(this.component, this);
		ClassDependency.call(this.format, this);
		ClassDependency.call(this.toolbar, this);
		ClassDependency.call(this.char, this);
		ClassDependency.call(this.menu, this);
	},

	/**
	 * @description Save the current buttons states to "allCommandButtons" object
	 * @private
	 */
	_saveButtonStates: function () {
		const currentButtons = this.context.toolbar._buttonTray.querySelectorAll('.se-menu-list button[data-type]');
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
	_recoverButtonStates: function () {
		const currentButtons = this.context.toolbar._buttonTray.querySelectorAll('.se-menu-list button[data-type]');
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
		this._codeViewDisabledButtons = this.context.toolbar._buttonTray.querySelectorAll('.se-menu-list button[data-type]:not([class~="se-code-view-enabled"]):not([data-type="MORE"])');
		this._controllerOnDisabledButtons = this.context.toolbar._buttonTray.querySelectorAll('.se-menu-list button[data-type]:not([class~="se-resizing-enabled"]):not([data-type="MORE"])');

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
	_initWysiwygArea: function (e, reload, _initHTML) {
		e.wysiwyg.innerHTML = (reload ? _initHTML : this.html.clean(typeof _initHTML === 'string' ? _initHTML : e.originElement.value, true, null, null)) || '<' + this.options.defaultLineTag + '><br></' + this.options.defaultLineTag + '>';
		this.context.element = e;
		if (this.options.charCounter && e.charCounter) e.charCounter.textContent = this.char.getLength();
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
		if (this.events.onChange) this.events.onChange(this.getContent());
		if (this.context.toolbar.main.style.display === 'block') this.toolbar._showBalloon();
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
		h = h === -1 ? (resizeObserverEntry.borderBoxSize && resizeObserverEntry.borderBoxSize[0] ? resizeObserverEntry.borderBoxSize[0].blockSize : resizeObserverEntry.contentRect.height + this._editorHeightPadding) : h;
		if (this._editorHeight !== h) {
			if (typeof this.events.onResizeEditor === 'function') this.events.onResizeEditor(h, this._editorHeight, resizeObserverEntry);
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
		let placeholder;
		if ((placeholder = this.context.element.placeholder)) {
			if (this.status.isCodeView) {
				placeholder.style.display = 'none';
				return;
			}

			const wysiwyg = this.context.element.wysiwyg;
			if (!domUtils.isZeroWith(wysiwyg.textContent) || wysiwyg.querySelector(domUtils._allowedEmptyNodeList) || (wysiwyg.innerText.match(/\n/g) || '').length > 1) {
				placeholder.style.display = 'none';
			} else {
				placeholder.style.display = 'block';
			}
		}
	},

	/**
	 * @todo plugin, lang, class사용 option 등 바뀌었을때 클래스 리로드 문제
	 * @description Initialization after "setOptions"
	 * @param {Object} ctx context
	 * @param {string} initHTML Initial html string
	 * @private
	 */
	_setOptionsInit: function (ctx, product, newOptions, initHTML) {
		if (product.callButtons) this._pluginCallButtons = product.callButtons;
		if (ctx.toolbar._menuTray.children.length === 0) this.menu._menuTrayMap = {};

		this.plugins = newOptions.plugins;
		this.options = newOptions;
		this.lang = this.options.lang;
		this._responsiveButtons = product.toolbar.responsiveButtons;
		// this.toolbar._setResponsive();

		this.context = Context(ctx.element.originElement, ctx.toolbar.main, ctx.element.top, ctx.element.wysiwygFrame, ctx.element.code, ctx._carrierWrapper, this.options); //@todo context don't reset
		this._componentsInfoReset = true;
		this._editorInit(true, initHTML);
	},

	/**
	 * @description Initializ editor
	 * @param {boolean} reload Is relooad?
	 * @private
	 */
	_editorInit: function (reload) {
		// initialize core and add event listeners
		this._init();
		this.toolbar._offSticky();
		this.toolbar._resetSticky();

		// toolbar visibility
		this.context.toolbar.main.style.visibility = '';

		this._componentsInfoInit = false;
		this._componentsInfoReset = false;
		this._checkComponents();

		this.eventManager._addCommonEvent();

		this._w.setTimeout(
			function () {
				// observer
				if (this.eventManager._resizeObserver) this.eventManager._resizeObserver.observe(this.context.element.wysiwygFrame);
				if (this.eventManager._toolbarObserver) this.eventManager._toolbarObserver.observe(this.context.element._toolbarShadow);
				// resource state
				this._resourcesStateChange();
				// user event
				if (typeof this.events.onload === 'function') this.events.onload(reload);
			}.bind(this)
		);
	},

	/**
	 * @description Initializ core variable
	 * @private
	 */
	_init: function () {
		this._registerClass();
		this._cachingButtons();

		// file components
		this._fileInfoPluginsCheck = [];
		this._fileInfoPluginsReset = [];

		// text components
		this._MELInfo = {
			query: '',
			map: {}
		};

		// Command and file plugins registration
		this.activePlugins = [];
		this._onMousedownPlugins = [];
		this._onKeyDownPlugins = [];
		this._fileManager.tags = [];
		this._fileManager.pluginMap = {};

		const plugins = this.plugins;
		const isArray = this._w.Array.isArray;
		const managedClass = [];
		let filePluginRegExp = [];
		let plugin;
		for (let key in plugins) {
			if (!plugins.hasOwnProperty(key)) continue;
			this.registerPlugin(key, this._pluginCallButtons[key]);
			plugin = this.plugins[key];

			// Filemanager
			if (typeof plugin.__fileManagement === 'object') {
				const fm = plugin.__fileManagement;
				this._fileInfoPluginsCheck.push(fm._checkInfo.bind(fm));
				this._fileInfoPluginsReset.push(fm._resetInfo.bind(fm));
				if (isArray(fm.tagNames)) {
					const tagNames = fm.tagNames;
					this._fileManager.tags = this._fileManager.tags.concat(tagNames);
					filePluginRegExp.push(key);
					for (let tag = 0, tLen = tagNames.length; tag < tLen; tag++) {
						this._fileManager.pluginMap[tagNames[tag].toLowerCase()] = key;
					}
				}
			}

			if (typeof plugin.onPluginMousedown === 'function') {
				this._onMousedownPlugins.push(plugin.onPluginMousedown.bind(plugin));
			}

			if (typeof plugin.onPluginKeyDown === 'function') {
				this._onKeyDownPlugins.push(plugin.onPluginKeyDown.bind(plugin));
			}

			if (plugin.preservedClass) {
				const info = plugin.preservedClass();
				managedClass.push('.' + info.className);
				this._MELInfo.map[info.className] = info.method;
			}
		}

		this._MELInfo.query = managedClass.toString();
		this._fileManager.queryString = this._fileManager.tags.join(',');
		this._fileManager.regExp = new this._w.RegExp('^(' + (this._fileManager.tags.join('|') || '\\^') + ')$', 'i');
		this._fileManager.pluginRegExp = new this._w.RegExp('^(' + (filePluginRegExp.length === 0 ? '\\^' : filePluginRegExp.join('|')) + ')$', 'i');
	},

	_fixCurrentController: function (fixed) {
		const cont = this.opendControllers;
		for (let i = 0; i < cont.length; i++) {
			cont[i].fixed = fixed;
			cont[i].form.style.display = fixed ? 'none' : 'block';
		}
	},

	Constructor: Editor
};

export default Editor;
