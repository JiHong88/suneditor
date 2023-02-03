import Helper, { env, converter, domUtils, numbers } from '../helper';
import Constructor, { ResetOptions, UpdateButton } from './constructor';
import { UpdateContextMap, CreateContext } from './context';

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

	// properties
	this.rootKeys = product.rootKeys;
	this.rootTargets = product.rootTargets;
	this.context = product.context;
	this.frameContext = new _w.Map();
	this.frameOptions = new _w.Map();

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
	 * @description Controllers carrier
	 */
	this._carrierWrapper = product.carrierWrapper;
	this._loadingBox = product.carrierWrapper.querySelector('.se-loading-box');
	this._resizeBackground = product.carrierWrapper.querySelector('.se-resizing-back');

	/**
	 * @description Editor options
	 * @type {Object.<string, any>}
	 */
	this.options = product.options;

	/**
	 * @description Plugins
	 * @type {Object.<string, any>}
	 */
	this.plugins = product.plugins || {};

	/**
	 * @description Default icons object
	 * @type {Object.<string, string>}
	 */
	this.icons = product.icons;

	/**
	 * @description loaded language
	 * @type {Object.<string, any>}
	 */
	this.lang = product.lang;

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
		_range: null
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
	this.allCommandButtons = new _w.Map();

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
	 * @description Closest ShadowRoot to editor if found
	 * @type {ShadowRoot}
	 * @private
	 */
	this._shadowRoot = null;

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
	this._prevRtl = this.options.get('_rtl');

	/**
	 * @description Property related to editor resizing.
	 * @private
	 */
	this._editorHeight = 0;

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
	this._commandMap = new _w.Map();

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
	const inst = this;
	const rootSize = this.rootTargets.size;
	let rootIndex = 0;
	this.rootTargets.forEach(function (e) {
		const o = e.get('originElement');
		const t = e.get('topArea');
		o.style.display = 'none';
		t.style.display = 'block';
		o.parentNode.insertBefore(t, o.nextElementSibling);
		e.get('editorArea').appendChild(e.get('wysiwygFrame'));

		if (!inst.options.get('iframe')) {
			if (rootSize === ++rootIndex) inst._editorInit();
		} else {
			e.get('wysiwygFrame').addEventListener('load', function () {
				converter._setIframeDocument(this, inst, e.get('options').get('height'));
				if (rootSize === ++rootIndex) inst._editorInit();
			});
		}
	});
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
			UpdateButton(target, plugin, this.icons, this.lang);
			if (typeof plugin.init === 'function') plugin.init();
		}

		if (this.plugins[pluginName].active && !this._commandMap.get(pluginName) && !!target) {
			this._commandMap.set(pluginName, target);
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
					const layer = this.context.get('toolbar.main').querySelector('.' + command);
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
				const selectArea = figcaption || this.frameContext.get('wysiwyg');
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
					const format = domUtils.createElement(this.options.get('defaultLineTag'), null, br);
					first = info ? info.container : first;
					first.parentNode.insertBefore(format, first);
					first = br;
				}
				if (domUtils.isMedia(last)) {
					last = domUtils.createElement('BR');
					selectArea.appendChild(domUtils.createElement(this.options.get('defaultLineTag'), null, last));
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
				this.setDir(this.options.get('textDirection'));
				break;
			case 'dir_ltr':
				this.setDir('ltr');
				break;
			case 'dir_rtl':
				this.setDir('rtl');
				break;
			case 'save':
				if (typeof this.options.get('callBackSave') === 'function') {
					this.options.get('callBackSave')(this.getContent(), this.status.isChanged);
				} else if (this.status.isChanged && typeof this.events.save === 'function') {
					this.events.save();
				} else {
					throw Error('[SUNEDITOR.commandHandler.fail] Please register call back function in creation option. (callBackSave : Function)');
				}

				this.status.isChanged = false;
				if (this.context.has('buttons.save')) this.context.get('buttons.save').setAttribute('disabled', true);
				break;
			default:
				// 'STRONG', 'U', 'EM', 'DEL', 'SUB', 'SUP'..
				command = this.options.get('_defaultCommand')[command.toLowerCase()] || command;
				if (!this._commandMap.get(command)) this._commandMap.set(command, target);

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
		this.viewer.codeView(false);
		this.viewer.showBlocks(false);

		const mergeOptions = [this.options, _options].reduce(function (init, option) {
			for (let key in option) {
				if (key === 'plugins') {
					continue;
				} else {
					init[key] = option[key];
				}
			}
			return init;
		}, {});

		// @todo
		ResetOptions(tc, this.options, mergeOptions);
	},

	/**
	 * @description Set direction to "rtl" or "ltr".
	 * @param {string} dir "rtl" or "ltr"
	 */
	setDir: function (dir) {
		const rtl = dir === 'rtl';
		const changeDir = this._prevRtl !== rtl;
		const fc = this.frameContext;
		const ctx = this.context;
		this.options.set('_rtl', (this._prevRtl = rtl));

		if (changeDir) {
			const plugins = this.plugins;
			for (let k in plugins) {
				if (typeof plugins[k].setDir === 'function') plugins[k].setDir(dir);
			}
			// indent buttons
			if (ctx.has('buttons.indent')) domUtils.changeElement(ctx.get('buttons.indent').firstElementChild, this.icons.indent);
			if (ctx.has('buttons.outdent')) domUtils.changeElement(ctx.get('buttons.outdent').firstElementChild, this.icons.outdent);
		}

		if (rtl) {
			domUtils.addClass(fc.get('topArea'), 'se-rtl');
			domUtils.addClass(fc.get('wysiwygFrame'), 'se-rtl');
		} else {
			domUtils.removeClass(fc.get('topArea'), 'se-rtl');
			domUtils.removeClass(fc.get('wysiwygFrame'), 'se-rtl');
		}

		const lineNodes = domUtils.getListChildren(
			fc.wysiwyg,
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
			domUtils.changeTxt(buttons.dir.querySelector('.se-tooltip-text'), this.lang[this.options.get('_rtl') ? 'dir_ltr' : 'dir_rtl']);
			domUtils.changeElement(buttons.dir.firstElementChild, this.icons[this.options.get('_rtl') ? 'dir_ltr' : 'dir_rtl']);
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
	changeFrameContext: function (rootKey) {
		if (!rootKey) return;

		this.status.rootKey = rootKey;
		this._setFrameInfo(this.rootTargets.get(rootKey));

		this._lineBreakerButton = this.frameContext.get('lineBreaker').querySelector('button');
		this._lineBreaker_t = this.frameContext.get('lineBreaker_t');
		this._lineBreaker_b = this.frameContext.get('lineBreaker_b');

		this.toolbar._resetSticky();
	},

	/**
	 * @description javascript execCommand
	 * @param {string} command javascript execCommand function property
	 * @param {Boolean|undefined} showDefaultUI javascript execCommand function property
	 * @param {string|undefined} value javascript execCommand function property
	 */
	execCommand: function (command, showDefaultUI, value) {
		this.frameContext.get('_wd').execCommand(command, showDefaultUI, command === 'formatBlock' ? '<' + value + '>' : value);
		this.history.push(true);
	},

	/**
	 * @description Focus to wysiwyg area
	 * @param {number|undefined} rootKey Root index
	 */
	focus: function (rootKey) {
		if (numbers.is(rootKey)) this.changeFrameContext(rootKey);
		if (this.frameContext.get('wysiwygFrame').style.display === 'none') return;

		if (this.options.get('iframe') || !this.frameContext.get('wysiwyg').contains(this.selection.getNode())) {
			this._nativeFocus();
		} else {
			try {
				const range = this.selection.getRange();
				if (range.startContainer === range.endContainer && domUtils.isWysiwygFrame(range.startContainer)) {
					const currentNode = range.commonAncestorContainer.children[range.startOffset];
					if (!this.format.isLine(currentNode) && !this.component.is(currentNode)) {
						const br = domUtils.createElement('BR');
						const format = domUtils.createElement(this.options.get('defaultLineTag'), null, br);
						this.frameContext.get('wysiwyg').insertBefore(format, currentNode);
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
		if (!focusEl) focusEl = this.frameContext.get('wysiwyg').lastElementChild;

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
		if (this.options.get('iframe')) {
			this.frameContext.get('wysiwygFrame').blur();
		} else {
			this.frameContext.get('wysiwyg').blur();
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
			this.changeFrameContext(rootKey[i]);

			if (!this.status.isCodeView) {
				this.frameContext.get('wysiwyg').innerHTML = convertValue;
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
			this.changeFrameContext(rootKey[i]);

			const convertValue = this.html.clean(content, true, null, null);
			if (!this.status.isCodeView) {
				const temp = domUtils.createElement('DIV', null, convertValue);
				const children = temp.children;
				for (let i = 0, len = children.length; i < len; i++) {
					if (!children[i]) continue;
					this.frameContext.get('wysiwyg').appendChild(children[i]);
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
		if (!this.options.get('iframe')) return false;

		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!this._w.Array.isArray(rootKey)) rootKey = [rootKey];

		for (let i = 0; i < rootKey.length; i++) {
			this.changeFrameContext(rootKey[i]);

			if (ctx.head) this.frameContext.get('_wd').head.innerHTML = ctx.head.replace(/<script[\s\S]*>[\s\S]*<\/script>/gi, '');
			if (ctx.body) this.frameContext.get('_wd').body.innerHTML = this.html.clean(ctx.body, true, null, null);
		}
	},

	/**
	 * @description Gets the current content
	 * @param {boolean} withFrame Gets the current content with containing parent div.sun-editor-editable (<div class="sun-editor-editable">{content}</div>).
	 * Ignored for options.get('iframe_fullPage') is true.
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
			this.changeFrameContext(rootKey[i]);

			const fc = this.frameContext;
			const renderHTML = domUtils.createElement('DIV', null, this._convertHTMLToCode(fc.get('wysiwyg'), true));
			const figcaptions = domUtils.getListChildren(renderHTML, function (current) {
				return /FIGCAPTION/i.test(current.nodeName);
			});

			for (let i = 0, len = figcaptions.length; i < len; i++) {
				figcaptions[i].removeAttribute('contenteditable');
			}

			const content = this.html.clean(renderHTML.innerHTML, false, null, null);
			if (this.options.get('iframe_fullPage')) {
				if (includeFullPage) {
					const attrs = domUtils.getAttributesToString(fc.get('_wd').body, ['contenteditable']);
					r = '<!DOCTYPE html><html>' + fc.get('_wd').head.outerHTML + '<body ' + attrs + '>' + content + '</body></html>';
				} else {
					r = content;
				}
			} else {
				r = withFrame ? '<div class="sun-editor-editable' + (this.options.get('_rtl') ? ' se-rtl' : '') + '">' + content + '</div>' : renderHTML.innerHTML;
			}

			resultValue[rootKey[i]] = r;
		}

		this.changeFrameContext(prevrootKey);
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
			this.changeFrameContext(rootKey[i]);
			resultValue[rootKey[i]] = this.frameContext.get('wysiwyg').textContent;
		}

		this.changeFrameContext(prevrootKey);
		return rootKey.length > 1 ? resultValue : resultValue[rootKey[0]];
	},

	/**
	 * @description Set "options.get('editorCSSText')" style.
	 * Define the style of the edit area
	 * It can also be defined with the "setOptions" method, but the "setEditorStyle" method does not render the editor again.
	 * @param {string} style Style string
	 */
	setEditorStyle: function (style) {
		const newStyles = converter._setDefaultOptionStyle(this.frameOptions, style);
		this.frameOptions.set('_editorStyles', newStyles);
		const fc = this.frameContext;

		// top area
		fc.get('topArea').style.cssText = newStyles.top;

		// code view
		const code = fc.get('code');
		code.style.cssText = this.frameOptions.get('_editorStyles').frame;
		code.style.display = 'none';
		if (this.frameOptions.get('height') === 'auto') {
			code.style.overflow = 'hidden';
		} else {
			code.style.overflow = '';
		}

		// wysiwyg frame
		if (!this.options.get('iframe')) {
			fc.get('wysiwygFrame').style.cssText = newStyles.frame + newStyles.editor;
		} else {
			fc.get('wysiwygFrame').style.cssText = newStyles.frame;
			fc.get('wysiwyg').style.cssText = newStyles.editor;
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

			this.frameContext.get('code').setAttribute('readOnly', 'true');
			domUtils.addClass(this.frameContext.get('wysiwygFrame'), 'se-read-only');
		} else {
			this.frameContext.get('code').removeAttribute('readOnly');
			domUtils.removeClass(this.frameContext.get('wysiwygFrame'), 'se-read-only');
		}

		if (this.options.get('hasCodeMirror')) {
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

		this.frameContext.get('wysiwyg').setAttribute('contenteditable', false);
		this.isDisabled = true;

		if (this.options.get('hasCodeMirror')) {
			this.viewer._codeMirrorEditor('readonly', true);
		} else {
			this.frameContext.get('code').setAttribute('disabled', 'disabled');
		}
	},

	/**
	 * @description Enable the suneditor
	 */
	enable: function (rootKey) {
		this.toolbar.enable();
		this.frameContext.get('wysiwyg').setAttribute('contenteditable', true);
		this.isDisabled = false;

		if (this.options.get('hasCodeMirror')) {
			this.viewer._codeMirrorEditor('readonly', false);
		} else {
			this.frameContext.get('code').removeAttribute('disabled');
		}
	},

	/**
	 * @description Show the suneditor
	 */
	show: function (rootKey) {
		const topAreaStyle = this.frameContext.get('topArea').style;
		if (topAreaStyle.display === 'none') topAreaStyle.display = 'block';
	},

	/**
	 * @description Hide the suneditor
	 */
	hide: function (rootKey) {
		this.frameContext.get('topArea').style.display = 'none';
	},

	/**
	 * @description Copying the content of the editor to the original textarea and execute onSave callback.
	 */
	save: function () {
		const value = this.getContent();
		this.frameContext.get('originElement').value = value;
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
		domUtils.removeItem(this._carrierWrapper);
		domUtils.removeItem(this.context.get('toolbar._wrapper'));

		this.rootTargets.forEach(function (e) {
			domUtils.removeItem(e.get('topArea'));
		});

		this.rootTargets.clear();
		this.context.clear();
		this.frameContext.clear();

		/** remove history */
		this.history._destroy();

		/** remove event listeners */
		this.eventManager._removeAllEvents();

		/** destory external library */
		if (this.options.get('codeMirror6Editor')) {
			this.options.get('codeMirror6Editor').destroy();
		}

		/** remove object reference */
		for (let k in this) {
			delete this[k];
		}
	},

	/** ----- private methods ----------------------------------------------------------------------------------------------------------------------------- */
	/**
	 * @description Set frameContext, frameOptions
	 * @param {rootTarget} rt
	 */
	_setFrameInfo: function (rt) {
		UpdateContextMap(this.frameContext, rt);
		UpdateContextMap(this.frameOptions, rt.get('options'));
		this._editorHeight = this.frameContext.get('wysiwygFrame').offsetHeight;
	},

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
		this._loadingBox.style.display = 'block';
	},

	/**
	 * @description Close loading box
	 * @private
	 */
	_closeLoading: function () {
		this._loadingBox.style.display = 'none';
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
	 * @param {Element|String} html WYSIWYG element (this.frameContext.get('wysiwyg')) or HTML string.
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
		const frameOptions = e.get('options');
		const _w = this._w;

		e.set('wwComputedStyle', _w.getComputedStyle(e.get('wysiwyg')));

		if (!options.get('iframe') && typeof _w.ShadowRoot === 'function') {
			let child = e.get('wysiwygFrame');
			while (child) {
				if (child.shadowRoot) {
					this._shadowRoot = child.shadowRoot;
					break;
				} else if (child instanceof _w.ShadowRoot) {
					this._shadowRoot = child;
					break;
				}
				child = child.parentNode;
			}
		}

		// wisywig attributes
		const attr = options.get('frameAttrbutes');
		for (let k in attr) {
			e.get('wysiwyg').setAttribute(k, attr[k]);
		}

		// init, validate
		e.set('_ww', options.get('iframe') ? e.get('wysiwygFrame').contentWindow : _w);
		if (options.get('iframe')) {
			e.set('_wd', e.get('wysiwygFrame').contentDocument);
			e.set('wysiwyg', e.get('_wd').body);
			if (frameOptions.get('_editorStyles').editor) e.get('wysiwyg').style.cssText = frameOptions.get('_editorStyles').editor;
			if (frameOptions.get('height') === 'auto') this._iframeAuto = e.get('_wd').body;
		} else {
			e.set('_wd', this._d);
		}
	},

	_registerClass: function () {
		// base
		this.events = this.options.get('events');
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
	 * @description Save the current buttons states to "allCommandButtons" map
	 * @private
	 */
	_saveButtonStates: function () {
		const currentButtons = this.context.get('toolbar._buttonTray').querySelectorAll('.se-menu-list button[data-command]');
		for (let i = 0, element, command; i < currentButtons.length; i++) {
			element = currentButtons[i];
			command = element.getAttribute('data-command');
			this.allCommandButtons.set(command, element);
		}
	},

	/**
	 * @description Recover the current buttons states from "allCommandButtons" map
	 * @private
	 */
	_recoverButtonStates: function () {
		const currentButtons = this.context.get('toolbar._buttonTray').querySelectorAll('.se-menu-list button[data-command]');
		for (let i = 0, button, command, oldButton; i < currentButtons.length; i++) {
			button = currentButtons[i];
			command = button.getAttribute('data-command');

			oldButton = this.allCommandButtons.get(command);
			if (oldButton) {
				button.parentElement.replaceChild(oldButton, button);
				if (this.context.get('buttons.' + command)) this.context.set('buttons.' + command, oldButton);
			}
		}
	},

	/**
	 * @description Caching basic buttons to use
	 * @private
	 */
	_cachingButtons: function () {
		this._codeViewDisabledButtons = this.context.get('toolbar._buttonTray').querySelectorAll('.se-menu-list button[data-command]:not([class~="se-code-view-enabled"]):not([data-type="MORE"])');
		this._controllerOnDisabledButtons = this.context.get('toolbar._buttonTray').querySelectorAll('.se-menu-list button[data-command]:not([class~="se-resizing-enabled"]):not([data-type="MORE"])');

		this._saveButtonStates();

		const tc = this.context;
		const textTags = this.options.get('textTags');
		const commandMap = this._commandMap;
		commandMap.set('OUTDENT', tc.get('buttons.outdent'));
		commandMap.set('INDENT', tc.get('buttons.indent'));
		commandMap.set(textTags.bold.toUpperCase(), tc.get('buttons.bold'));
		commandMap.set(textTags.underline.toUpperCase(), tc.get('buttons.underline'));
		commandMap.set(textTags.italic.toUpperCase(), tc.get('buttons.italic'));
		commandMap.set(textTags.strike.toUpperCase(), tc.get('buttons.strike'));
		commandMap.set(textTags.sub.toUpperCase(), tc.get('buttons.subscript'));
		commandMap.set(textTags.sup.toUpperCase(), tc.get('buttons.superscript'));

		this._styleCommandMap = {
			fullScreen: tc.fullScreen,
			showBlocks: tc.showBlocks,
			codeView: tc.codeView
		};
	},

	/**
	 * @description Initializ wysiwyg area (Only called from core._init)
	 * @param {boolean} reload Is relooad?
	 * @param {string} _initHTML initial html string
	 * @private
	 */
	_initWysiwygArea: function (e, reload, _initHTML) {
		e.get('wysiwyg').innerHTML = (reload ? _initHTML : this.html.clean(typeof _initHTML === 'string' ? _initHTML : e.get('originElement').value, true, null, null)) || '<' + this.options.get('defaultLineTag') + '><br></' + this.options.get('defaultLineTag') + '>';
		if (e.has('charCounter')) e.get('charCounter').textContent = this.char.getLength();
	},

	/**
	 * @description Called when there are changes to tags in the wysiwyg region.
	 * @private
	 */
	_resourcesStateChange: function (fc) {
		this._iframeAutoHeight(fc);
		this._checkPlaceholder(fc);
	},

	/**
	 * @description Modify the height value of the iframe when the height of the iframe is automatic.
	 * @private
	 */
	_iframeAutoHeight: function (fc) {
		fc = fc || this.frameContext;

		if (this._iframeAuto) {
			this._w.setTimeout(
				function () {
					fc.get('wysiwygFrame').style.height = this._iframeAuto.offsetHeight + 'px';
				}.bind(this)
			);
		}

		if (this._iframeAuto) {
			this._w.setTimeout(
				function () {
					const h = this._iframeAuto.offsetHeight;
					fc.get('wysiwygFrame').style.height = h + 'px';
					if (env.isIE) this.__callResizeFunction(h, null);
				}.bind(this)
			);
		} else if (env.isIE) {
			this.__callResizeFunction(fc.get('wysiwygFrame').offsetHeight, null);
		}
	},

	/**
	 * @description Set display property when there is placeholder.
	 * @private
	 */
	_checkPlaceholder: function (fc) {
		fc = fc || this.frameContext;
		const placeholder = fc.get('placeholder');

		if (placeholder) {
			if (this.status.isCodeView) {
				placeholder.style.display = 'none';
				return;
			}

			const wysiwyg = fc.get('wysiwyg');
			if (!domUtils.isZeroWith(wysiwyg.textContent) || wysiwyg.querySelector(domUtils._allowedEmptyNodeList) || (wysiwyg.innerText.match(/\n/g) || '').length > 1) {
				placeholder.style.display = 'none';
			} else {
				placeholder.style.display = 'block';
			}
		}
	},

	/**
	 * @description Called when after execute "history.push"
	 * @private
	 */
	_onChange_historyStack: function () {
		if (this.status.hasFocus) this.eventManager.applyTagEffect();
		this.status.isChanged = true;
		if (this.context.has('buttons.save')) this.context.get('buttons.save').removeAttribute('disabled');
		// user event
		if (this.events.onChange) this.events.onChange(this.getContent());
		if (this.context.get('toolbar.main').style.display === 'block') this.toolbar._showBalloon();
	},

	__callResizeFunction: function (h, resizeObserverEntry) {
		h =
			h === -1
				? resizeObserverEntry.borderBoxSize && resizeObserverEntry.borderBoxSize[0]
					? resizeObserverEntry.borderBoxSize[0].blockSize
					: resizeObserverEntry.contentRect.height + numbers.get(this.frameContext.get('wwComputedStyle').getPropertyValue('padding-left')) + numbers.get(this.frameContext.get('wwComputedStyle').getPropertyValue('padding-right'))
				: h;
		if (this._editorHeight !== h) {
			if (typeof this.events.onResizeEditor === 'function') this.events.onResizeEditor(h, this._editorHeight, resizeObserverEntry);
			this._editorHeight = h;
		}
	},

	_codeViewAutoHeight: function () {
		if (this.status.isFullScreen) return;
		this.frameContext.get('code').style.height = this.frameContext.get('code').scrollHeight + 'px';
	},

	/**
	 * @description Initializ editor
	 * @private
	 */
	_editorInit: function () {
		// set modes
		this.isInline = /inline/i.test(this.options.get('mode'));
		this.isBalloon = /balloon/i.test(this.options.get('mode'));
		this.isBalloonAlways = /balloon-always/i.test(this.options.get('mode'));

		// register class
		this._registerClass();

		this.rootTargets.forEach(
			function (e) {
				this._setEditorParams(e);
				this._initWysiwygArea(e, false, e.get('options').get('value'));
				this.eventManager._addEvent(e);
			}.bind(this)
		);

		// initialize core and add event listeners
		this._setFrameInfo(this.rootTargets.get(this.status.rootKey));
		this._init();
		this.toolbar._offSticky();
		this.toolbar._resetSticky();

		// toolbar visibility
		this.context.get('toolbar.main').style.visibility = '';

		this._componentsInfoInit = false;
		this._componentsInfoReset = false;
		this._checkComponents();

		this.eventManager._addCommonEvent();

		this._w.setTimeout(
			function () {
				// roots
				this.rootTargets.forEach(
					function (e) {
						// observer
						if (this.eventManager._resizeObserver) this.eventManager._resizeObserver.observe(e.get('wysiwygFrame'));
						if (this.eventManager._toolbarObserver) this.eventManager._toolbarObserver.observe(e.get('_toolbarShadow'));
						// resource state
						this._resourcesStateChange(e);
					}.bind(this)
				);
				// history reset
				this.history.reset();
				// user event
				if (typeof this.events.onload === 'function') this.events.onload();
			}.bind(this)
		);
	},

	/**
	 * @description Initializ core variable
	 * @private
	 */
	_init: function () {
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
