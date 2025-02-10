import { env, converter, domUtils, numbers } from '../helper';
import Constructor, { InitOptions, UpdateButton, CreateShortcuts, CreateStatusbar, RO_UNAVAILABD } from './section/constructor';
import { UpdateStatusbarContext } from './section/context';
import { BASIC_COMMANDS, ACTIVE_EVENT_COMMANDS, SELECT_ALL, DIR_BTN_ACTIVE, SAVE, COPY_FORMAT, FONT_STYLE, PAGE_BREAK } from './section/actives';
import History from './base/history';
import EventManager from './base/eventManager';
import Events from './base/events';
import DocumentType from './section/documentType';

// class injector
import ClassInjector from '../editorInjector/_classes';

// classes
import Char from './class/char';
import Component from './class/component';
import Format from './class/format';
import HTML from './class/html';
import Menu from './class/menu';
import NodeTransform from './class/nodeTransform';
import Offset from './class/offset';
import Selection from './class/selection';
import Shortcuts from './class/shortcuts';
import Toolbar from './class/toolbar';
import UI from './class/ui';
import Viewer from './class/viewer';

const COMMAND_BUTTONS = '.se-menu-list .se-toolbar-btn[data-command]';
const DISABLE_BUTTONS_CODEVIEW = `${COMMAND_BUTTONS}:not([class~="se-code-view-enabled"]):not([data-type="MORE"])`;
const DISABLE_BUTTONS_CONTROLLER = `${COMMAND_BUTTONS}:not([class~="se-component-enabled"]):not([data-type="MORE"])`;

/**
 * @typedef {import('./section/constructor').EditorInitOptions} EditorInitOptions
 */

/**
 * @typedef {import('./section/context').Context} Context
 */

/**
 * @typedef {import('./section/context').FrameContext} FrameContext
 */

/**
 * @typedef {import('./section/context').FrameOptions} FrameOptions
 */

/**
 * @typedef {import('../modules/Controller').ControllerInfo} ControllerInfo
 */

/**
 * @typedef {Object} EditorStatus
 * @property {boolean} hasFocus Boolean value of whether the editor has focus
 * @property {number} tabSize Indent size of tab (4)
 * @property {number} indentSize Indent size (25)px
 * @property {number} codeIndentSize Indent size of Code view mode (2)
 * @property {Array.<Node>} currentNodes  An element array of the current cursor's node structure
 * @property {Array.<string>} currentNodesMap  An element name array of the current cursor's node structure
 * @property {boolean} onSelected Boolean value of whether component is selected
 * @property {number} rootKey Current root key
 * @property {Range} _range Current range object
 * @property {boolean} _onMousedown Mouse down event status
 */

/**
 * @class
 * @description SunEditor constructor function.
 * @param {Array.<Element>} multiTargets Target element
 * @param {EditorInitOptions} options options
 * @returns {Editor}
 */
function Editor(multiTargets, options) {
	const _d = multiTargets[0].target.ownerDocument || env._d;
	const _w = _d.defaultView || env._w;
	const product = Constructor(multiTargets, options);

	/**
	 * @description Frame root key array
	 * @type {Array.<*>}
	 */
	this.rootKeys = product.rootKeys;

	/**
	 * @description Frame root map
	 * @type {Map.<*, FrameContext>}
	 */
	this.frameRoots = product.frameRoots;

	/**
	 * @description Editor context object
	 * @type {Context}
	 */
	this.context = product.context;

	/**
	 * @description Current focusing frame context
	 * @type {FrameContext}
	 */
	this.frameContext = new Map();

	/**
	 * @description Current focusing frame context options
	 * @type {FrameOptions}
	 */
	this.frameOptions = new Map();

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
	 * @type {Element}
	 */
	this.carrierWrapper = product.carrierWrapper;

	/**
	 * @description Editor options
	 * @type {Object.<string, *>}
	 */
	this.options = product.options;

	/**
	 * @description Plugins
	 * @type {Object.<string, *>}
	 */
	this.plugins = product.plugins || {};

	/**
	 * @description Events object, call by triggerEvent function
	 * @type {Object.<string, *>}
	 */
	this.events = null;

	/**
	 * @description Call the event function by injecting self: this.
	 * @type {(eventName: string, ...args: *) => void}
	 */
	this.triggerEvent = null;

	/**
	 * @description Default icons object
	 * @type {Object.<string, string>}
	 */
	this.icons = product.icons;

	/**
	 * @description loaded language
	 * @type {Object.<string, *>}
	 */
	this.lang = product.lang;

	/**
	 * @description Variables used internally in editor operation
	 * @type {EditorStatus}
	 */
	this.status = {
		hasFocus: false,
		tabSize: 4,
		indentSize: 25,
		codeIndentSize: 2,
		currentNodes: [],
		currentNodesMap: [],
		onSelected: false,
		rootKey: product.rootId,
		_range: null,
		_onMousedown: false
	};

	/**
	 * @description Is classic mode?
	 * @type {boolean}
	 */
	this.isClassic = false;

	/**
	 * @description Is inline mode?
	 * @type {boolean}
	 */
	this.isInline = false;

	/**
	 * @description Is balloon|balloon-always mode?
	 * @type {boolean}
	 */
	this.isBalloon = false;

	/**
	 * @description Is balloon-always mode?
	 * @type {boolean}
	 */
	this.isBalloonAlways = false;

	/**
	 * @description Is subToolbar balloon|balloon-always mode?
	 * @type {boolean}
	 */
	this.isSubBalloon = false;

	/**
	 * @description Is subToolbar balloon-always mode?
	 * @type {boolean}
	 */
	this.isSubBalloonAlways = false;

	/**
	 * @description All command buttons map
	 * @type {Map.<string, Element>}
	 */
	this.allCommandButtons = new Map();

	/**
	 * @description All command buttons map
	 * @type {Map.<string, Element>}
	 */
	this.subAllCommandButtons = new Map();

	/**
	 * @description Shoutcuts key map
	 * @type {Map.<string, *>}
	 */
	this.shortcutsKeyMap = new Map();

	/**
	 * @description Shoutcuts reverse key array
	 * - An array of key codes generated with the reverseButtons option, used to reverse the action for a specific key combination.
	 * @type {Array.<string>}
	 */
	this.reverseKeys = [];

	/**
	 * @description A map with the plugin's buttons having an "active" method and the default command buttons with an "active" action.
	 * - Each button is contained in an array.
	 * @type {Map.<string, Array.<Element>>}
	 */
	this.commandTargets = new Map();

	/**
	 * @description Plugins array with "active" method.
	 * - "activeCommands" runs the "add" method when creating the editor.
	 * @type {Array.<string>}
	 */
	this.activeCommands = null;

	/**
	 * @description The selection node (selection.getNode()) to which the effect was last applied
	 * @type {Node|null}
	 */
	this.effectNode = null;

	/**
	 * @description Currently open "Modal" instance
	 * @type {*}
	 */
	this.opendModal = null;

	/**
	 * @description Currently open "Controller" info array
	 * @type {Array.<ControllerInfo>}
	 */
	this.opendControllers = [];

	/**
	 * @description Currently open "Controller" caller plugin name
	 */
	this.currentControllerName = '';

	/**
	 * @description Currently open "Browser" instance
	 * @type {*}
	 */
	this.opendBrowser = null;

	/**
	 * @description Whether "SelectMenu" is open
	 * @type {boolean}
	 */
	this.selectMenuOn = false;

	// ------ class ------
	/** @description History class instance @type {History} */
	this.history = null;
	/** @description EventManager class instance @type {EventManager} */
	this.eventManager = null;
	/** @description Toolbar class instance @type {Toolbar} */
	this.toolbar = null;
	/** @description SubToolbar class instance @type {Toolbar|null} */
	this.subToolbar = null;
	/** @description Shortcuts class instance @type {Shortcuts} */
	this.selection = new Selection(this);
	/** @description HTML class instance @type {HTML} */
	this.html = new HTML(this);
	/** @description Offset class instance @type {Offset} */
	this.nodeTransform = new NodeTransform(this);
	/** @description Component class instance @type {Component} */
	this.component = new Component(this);
	/** @description Format class instance @type {Format} */
	this.format = new Format(this);
	/** @description Menu class instance @type {Menu} */
	this.menu = new Menu(this);
	/** @description Char class instance @type {Char} */
	this.char = new Char(this);
	/** @description UI class instance @type {UI} */
	this.ui = new UI(this);
	/** @description Viewer class instance @type {Viewer} */
	this.viewer = new Viewer(this);

	// ------------------------------------------------------- private properties -------------------------------------------------------
	/**
	 * @private
	 * @description Line breaker (top)
	 * @type {Element}
	 */
	this._lineBreaker_t = null;

	/**
	 * @private
	 * @description Line breaker (bottom)
	 * @type {Element}
	 */
	this._lineBreaker_b = null;

	/**
	 * @private
	 * @description Closest ShadowRoot to editor if found
	 * @type {ShadowRoot}
	 */
	this._shadowRoot = null;

	/**
	 * @private
	 * @description Plugin call event map
	 * @type {Map.<string, Array.<Function>>}
	 */
	this._onPluginEvents = null;

	/**
	 * @private
	 * @description Copy format info
	 * - eventManager.__cacheStyleNodes copied
	 * @type {Array.<Element>|null}
	 */
	this._onCopyFormatInfo = null;

	/**
	 * @private
	 * @description Copy format init method
	 * @type {Function|null}
	 */
	this._onCopyFormatInitMethod = null;

	/**
	 * @private
	 * @description Controller target's frame div (editor.frameContext.get('topArea'))
	 * @type {Element|null}
	 */
	this._controllerTargetContext = null;

	/**
	 * @private
	 * @description List of buttons that are disabled when "controller" is opened
	 * @type {Array.<Element>}
	 */
	this._controllerOnDisabledButtons = [];

	/**
	 * @private
	 * @description List of buttons that are disabled when "codeView" mode opened
	 * @type {Array.<Element>}
	 */
	this._codeViewDisabledButtons = [];

	/**
	 * @private
	 * @description List of buttons to run plugins in the toolbar
	 * @type {Array.<Element>}
	 */
	this._pluginCallButtons = product.pluginCallButtons;

	/**
	 * @private
	 * @description List of buttons to run plugins in the Sub-Toolbar
	 * @type {Array.<Element>}
	 */
	this._pluginCallButtons_sub = product.pluginCallButtons_sub;

	/**
	 * @private
	 * @description Responsive Toolbar Button Structure array
	 * @type {Array.<*>}
	 */
	this._responsiveButtons = product.responsiveButtons;

	/**
	 * @private
	 * @description Responsive Sub-Toolbar Button Structure array
	 * @type {Array.<*>}
	 */
	this._responsiveButtons_sub = product.responsiveButtons_sub;

	/**
	 * @private
	 * @description Variable that controls the "blur" event in the editor of inline or balloon mode when the focus is moved to dropdown
	 * @type {boolean}
	 */
	this._notHideToolbar = false;

	/**
	 * @private
	 * @description Variables for controlling focus and blur events
	 * @type {boolean}
	 */
	this._preventBlur = false;

	/**
	 * @private
	 * @description If true, initialize all indexes of image, video information
	 * @type {boolean}
	 */
	this._componentsInfoInit = true;

	/**
	 * @private
	 * @description If true, reset all indexes of image, video information
	 * @type {boolean}
	 */
	this._componentsInfoReset = false;

	/**
	 * @private
	 * @description plugin retainFormat info Map()
	 * @type {Map.<string, Function>}
	 */
	this._MELInfo = null;

	/**
	 * @private
	 * @description Properties for managing files in the "FileManager" module
	 * @type {Array.<*>}
	 */
	this._fileInfoPluginsCheck = null;

	/**
	 * @private
	 * @description Properties for managing files in the "FileManager" module
	 * @type {Array.<*>}
	 */
	this._fileInfoPluginsReset = null;

	/**
	 * @private
	 * @description Variables for file component management
	 * @type {Object.<string, *>}
	 */
	this._fileManager = {
		tags: null,
		regExp: null,
		pluginRegExp: null,
		pluginMap: null
	};

	/**
	 * @private
	 * @description Variables for managing the components
	 * @type {Array.<*>}
	 */
	this._componentManager = [];

	/**
	 * @private
	 * @description Current Figure container.
	 * @type {Element|null}
	 */
	this._figureContainer = null;

	/**
	 * @private
	 * @description Origin options
	 * @type {EditorInitOptions}
	 */
	this._originOptions = options;

	/** ----- Create editor ------------------------------------------------------------ */
	this.__Create(options);
}

Editor.prototype = {
	/**
	 * @description If the plugin is not added, add the plugin and call the 'add' function.
	 * - If the plugin is added call callBack function.
	 * @param {string} pluginName The name of the plugin to call
	 * @param {?Array.<Element>} targets Plugin target button (This is not necessary if you have a button list when creating the editor)
	 * @param {?Object.<string, *>} pluginOptions Plugin's options
	 * @param {?Array.<string>} shortcuts this.options.get('shortcuts')[key]
	 */
	registerPlugin(pluginName, targets, pluginOptions, shortcuts) {
		let plugin = this.plugins[pluginName];
		if (!plugin) {
			throw Error(`[SUNEDITOR.registerPlugin.fail] The called plugin does not exist or is in an invalid format. (pluginName: "${pluginName}")`);
		} else if (typeof this.plugins[pluginName] === 'function') {
			plugin = this.plugins[pluginName] = new this.plugins[pluginName](this, pluginOptions || {});
			if (typeof plugin.init === 'function') plugin.init();
		}

		if (targets) {
			for (let i = 0, len = targets.length; i < len; i++) {
				UpdateButton(targets[i], plugin, this.icons, this.lang, shortcuts);
			}

			if (!this.activeCommands.includes(pluginName) && typeof this.plugins[pluginName].active === 'function') {
				this.activeCommands.push(pluginName);
			}
		}
	},

	/**
	 * @description Run plugin calls and basic commands.
	 * @param {string} command Command string
	 * @param {string} type Display type string ('command', 'dropdown', 'modal', 'container')
	 * @param {?Element} button The element of command button
	 */
	run(command, type, button) {
		if (type) {
			if (/more/i.test(type)) {
				const toolbar = domUtils.getParentElement(button, '.se-toolbar');
				const toolInst = domUtils.hasClass(toolbar, 'se-toolbar-sub') ? this.subToolbar : this.toolbar;
				if (button !== toolInst.currentMoreLayerActiveButton) {
					const layer = toolbar.querySelector('.' + command);
					if (layer) {
						toolInst._moreLayerOn(button, layer);
						toolInst._showBalloon();
						toolInst._showInline();
					}
					domUtils.addClass(button, 'on');
				} else if (toolInst.currentMoreLayerActiveButton) {
					toolInst._moreLayerOff();
					toolInst._showBalloon();
					toolInst._showInline();
				}

				this.viewer._resetFullScreenHeight();
				return;
			}

			if (/container/.test(type) && (this.menu.targetMap[command] === null || button !== this.menu.currentContainerActiveButton)) {
				this.menu.containerOn(button);
				return;
			}

			if (this.frameContext.get('isReadOnly') && domUtils.arrayIncludes(this._controllerOnDisabledButtons, button)) return;
			if (/dropdown/.test(type) && (this.menu.targetMap[command] === null || button !== this.menu.currentDropdownActiveButton)) {
				this.menu.dropdownOn(button);
				return;
			} else if (/modal/.test(type)) {
				this.plugins[command].open(button);
				return;
			} else if (/command/.test(type)) {
				this.plugins[command].action(button);
			} else if (/browser/.test(type)) {
				this.plugins[command].open(null);
			} else if (/popup/.test(type)) {
				this.plugins[command].show();
			}
		} else if (command) {
			this.commandHandler(command, button);
		}

		if (/dropdown/.test(type)) {
			this.menu.dropdownOff();
		} else if (!/command/.test(type)) {
			this.menu.dropdownOff();
			this.menu.containerOff();
		}
	},

	/**
	 * @description Execute default command of command button
	 * - (selectAll, codeView, fullScreen, indent, outdent, undo, redo, removeFormat, print, preview, showBlocks, save, bold, underline, italic, strike, subscript, superscript, copy, cut, paste)
	 * @param {string} command Property of command button (data-value)
	 * @param {Element} button Command button
	 * @returns {Promise<void>}
	 */
	async commandHandler(command, button) {
		if (this.frameContext.get('isReadOnly') && !/copy|cut|selectAll|codeView|fullScreen|print|preview|showBlocks/.test(command)) return;

		switch (command) {
			case 'selectAll':
				SELECT_ALL(this);
				break;
			case 'newDocument':
				this.html.set(`<${this.options.get('defaultLine')}><br></${this.options.get('defaultLine')}>`);
				this.focus();
				this.history.push(false);
				break;
			case 'codeView':
				this.viewer.codeView(!this.frameContext.get('isCodeView'));
				break;
			case 'fullScreen':
				this.viewer.fullScreen(!this.frameContext.get('isFullScreen'));
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
				this.format.removeInlineElement();
				this.focus();
				break;
			case 'print':
				this.viewer.print();
				break;
			case 'preview':
				this.viewer.preview();
				break;
			case 'showBlocks':
				this.viewer.showBlocks(!this.frameContext.get('isShowBlocks'));
				break;
			case 'dir':
				this.setDir(this.options.get('_rtl') ? 'ltr' : 'rtl');
				break;
			case 'dir_ltr':
				this.setDir('ltr');
				break;
			case 'dir_rtl':
				this.setDir('rtl');
				break;
			case 'save':
				await SAVE(this);
				break;
			case 'copyFormat':
				COPY_FORMAT(this, button);
				break;
			case 'pageBreak':
				PAGE_BREAK(this);
				break;
			case 'pageUp':
				this.frameContext.get('documentType').pageUp();
				break;
			case 'pageDown':
				this.frameContext.get('documentType').pageDown();
				break;
			default:
				FONT_STYLE(this, command);
		}
	},

	/**
	 * @description Execute "editor.run" with command button.
	 * @param {Element} target Command target
	 */
	runFromTarget(target) {
		const isInput = domUtils.isInputElement(target);
		if (isInput || !(target = domUtils.getCommandTarget(target))) return;

		const command = target.getAttribute('data-command');
		const type = target.getAttribute('data-type');

		if (!command && !type) return;
		if (target.disabled) return;

		this.run(command, type, target);
	},

	/**
	 * @description It is executed by inserting the button of commandTargets as the argument value of the "f" function.
	 * - "func" is called as long as the button array's length.
	 * @param {string} cmd data-command
	 * @param {(...args: *) => *} func Function.
	 */
	applyCommandTargets(cmd, func) {
		if (this.commandTargets.has(cmd)) {
			this.commandTargets.get(cmd).forEach(func);
		}
	},

	/**
	 * @description Execute a function by traversing all root targets.
	 * @param {(...args: *) => *} f Function
	 */
	applyFrameRoots(f) {
		this.frameRoots.forEach(f);
	},

	/**
	 * @description Checks if the content of the editor is empty.
	 * - Display criteria for "placeholder".
	 * @param {?FrameContext=} fc Frame context, if not present, currently selected frame context.
	 * @returns {boolean}
	 */
	isEmpty(fc) {
		fc = fc || this.frameContext;
		const wysiwyg = fc.get('wysiwyg');
		return domUtils.isZeroWidth(wysiwyg.textContent) && !wysiwyg.querySelector(this.options.get('allowedEmptyTags')) && (wysiwyg.innerText.match(/\n/g) || '').length <= 1;
	},

	/**
	 * @description Set direction to "rtl" or "ltr".
	 * @param {"rtl"|"ltr"} dir "rtl" or "ltr"
	 */
	setDir(dir) {
		const rtl = dir === 'rtl';
		if (this.options.get('_rtl') === rtl) return;

		try {
			this.options.set('_rtl', rtl);
			this.ui._offCurrentController();

			const fc = this.frameContext;
			const plugins = this.plugins;
			for (const k in plugins) {
				if (typeof plugins[k].setDir === 'function') plugins[k].setDir(dir);
			}

			const toolbarWrapper = this.context.get('toolbar._wrapper');
			const statusbarWrapper = this.context.get('statusbar._wrapper');
			if (rtl) {
				this.applyFrameRoots((e) => {
					domUtils.addClass([e.get('topArea'), e.get('wysiwyg'), e.get('documentTypePageMirror')], 'se-rtl');
				});
				domUtils.addClass([this.carrierWrapper, toolbarWrapper, statusbarWrapper], 'se-rtl');
			} else {
				this.applyFrameRoots((e) => {
					domUtils.removeClass([e.get('topArea'), e.get('wysiwyg'), e.get('documentTypePageMirror')], 'se-rtl');
				});
				domUtils.removeClass([this.carrierWrapper, toolbarWrapper, statusbarWrapper], 'se-rtl');
			}

			const lineNodes = domUtils.getListChildren(fc.get('wysiwyg'), (current) => {
				return this.format.isLine(current) && (current.style.marginRight || current.style.marginLeft || current.style.textAlign);
			});

			for (let i = 0, n, l, r; (n = lineNodes[i]); i++) {
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

			DIR_BTN_ACTIVE(this, rtl);

			// document type
			if (fc.has('documentType-use-header')) {
				if (rtl) fc.get('wrapper').appendChild(fc.get('documentTypeInner'));
				else fc.get('wrapper').insertBefore(fc.get('documentTypeInner'), fc.get('wysiwygFrame'));
			}
			if (fc.has('documentType-use-page')) {
				if (rtl) fc.get('wrapper').insertBefore(fc.get('documentTypePage'), fc.get('wysiwygFrame'));
				else fc.get('wrapper').appendChild(fc.get('documentTypePage'));
			}

			if (this.isBalloon) this.toolbar._showBalloon();
			else if (this.isSubBalloon) this.subToolbar._showBalloon();
		} catch (e) {
			this.options.set('_rtl', !rtl);
			console.warn(`[SUNEDITOR.setDir.fail] ${e.toString()}`);
		}

		this.effectNode = null;
		this.eventManager.applyTagEffect();
	},

	/**
	 * @description Add or reset option property (Editor is reloaded)
	 * @param {EditorInitOptions} newOptions Options
	 */
	resetOptions(newOptions) {
		const _keys = Object.keys;
		this.viewer.codeView(false);
		this.viewer.showBlocks(false);

		const newOptionKeys = _keys(newOptions);
		CheckResetKeys(newOptionKeys, this.plugins, '');
		if (newOptionKeys.length === 0) return;

		// option merge
		const rootDiff = {};
		const rootKeys = this.rootKeys;
		const frameRoots = this.frameRoots;
		const newRoots = [];
		const newRootKeys = {};
		this._originOptions = [newOptions, this._originOptions].reduce(function (init, option) {
			for (const key in option) {
				if (rootKeys.includes(key) && option[key]) {
					const nro = option[key];
					const newKeys = _keys(nro);
					CheckResetKeys(newKeys, null, key + '.');
					if (newKeys.length === 0) continue;

					rootDiff[key] = new Map();
					const o = frameRoots.get(key).get('options').get('_origin');
					for (const rk in nro) {
						const roV = nro[rk];
						if (!newKeys.includes(rk) || o[rk] === roV) continue;
						rootDiff[key].set(GetResetDiffKey(rk), true);
						o[rk] = roV;
					}
					newRoots.push((newRootKeys[key] = { options: o }));
				} else {
					init[key] = option[key];
				}
			}
			return init;
		}, {});

		// init options
		const options = this.options;
		const newMap = InitOptions(this._originOptions, newRoots, this.plugins).o;
		/** --------- root start --------- */
		for (let i = 0, k; (k = newOptionKeys[i]); i++) {
			if (newRootKeys[k]) {
				const diff = rootDiff[k];
				const fc = frameRoots.get(k);
				const originOptions = fc.get('options');
				const newRootOptions = newRootKeys[k].options;

				// statusbar
				if (diff.has('statusbar')) {
					domUtils.removeItem(fc.get('statusbar'));
					if (newRootOptions.get('statusbar')) {
						const statusbar = CreateStatusbar(newRootOptions, null).statusbar;
						fc.get('container').appendChild(statusbar);
						UpdateStatusbarContext(statusbar, fc);
						this.eventManager.__addStatusbarEvent(fc, newRootOptions);
					} else {
						this.eventManager.removeEvent(originOptions.get('__statusbarEvent'));
						newRootOptions.set('__statusbarEvent', null);
						UpdateStatusbarContext(null, fc);
					}
				}

				// iframe's options
				if (diff.has('iframe_attributes')) {
					const frame = fc.get('wysiwygFrame');
					const originAttr = originOptions.get('iframe_attributes');
					const newAttr = newRootOptions.get('iframe_attributes');
					for (const origin_k in originAttr) frame.removeAttribute(origin_k, originAttr[origin_k]);
					for (const new_k in newAttr) frame.setAttribute(new_k, newAttr[new_k]);
				}
				if (diff.has('iframe_cssFileName')) {
					const docHead = fc.get('_wd').head;
					const links = docHead.getElementsByTagName('link');
					while (links[0]) docHead.removeChild(links[0]);
					const parseDocument = new DOMParser().parseFromString(converter._setIframeStyleLinks(newRootOptions.get('iframe_cssFileName')), 'text/html');
					const newLinks = parseDocument.head.children;
					const sTag = docHead.querySelector('style');
					while (newLinks[0]) docHead.insertBefore(newLinks[0], sTag);
				}

				// --- options set ---
				fc.set('options', newRootOptions);

				// frame styles
				this.ui.setEditorStyle(newRootOptions.get('_defaultStyles'), fc);

				// frame attributes
				const frame = fc.get('wysiwyg');
				const originAttr = originOptions.get('editableFrameAttributes');
				const newAttr = newRootOptions.get('editableFrameAttributes');
				for (const origin_k in originAttr) frame.removeAttribute(origin_k, originAttr[origin_k]);
				for (const new_k in newAttr) frame.setAttribute(new_k, newAttr[new_k]);

				continue;
			}
			/** --------- root end --------- */

			options.set(k, newMap.get(k));

			/** apply option */
			// history delay time
			if (k === 'historyStackDelayTime') {
				this.history.resetDelayTime(options.get('historyStackDelayTime'));
				continue;
			}
			// set dir
			if (k === 'textDirection') {
				this.setDir(options.get('_rtl') ? 'ltr' : 'rtl');
				continue;
			}
		}

		/** apply options */
		// toolbar
		const toolbar = this.context.get('toolbar.main');
		// width
		if (/inline|balloon/i.test(options.get('mode')) && newOptionKeys.includes('toolbar_width')) {
			toolbar.style.width = options.get('toolbar_width');
		}
		// hide
		if (options.get('toolbar_hide')) {
			toolbar.style.display = 'none';
		}
		// shortcuts hint
		if (options.get('shortcutsHint')) {
			domUtils.removeClass(toolbar, 'se-shortcut-hide');
		} else {
			domUtils.addClass(toolbar, 'se-shortcut-hide');
		}

		// theme
		if (this._originOptions.theme !== (newOptions.theme ?? this._originOptions.theme)) {
			this.ui.setTheme(newOptions.theme);
		}

		this.effectNode = null;
		this._setFrameInfo(this.frameRoots.get(this.status.rootKey));
	},

	/**
	 * @description Change the current root index.
	 * @param {*} rootKey
	 */
	changeFrameContext(rootKey) {
		if (rootKey === this.status.rootKey) return;

		this.status.rootKey = rootKey;
		this._setFrameInfo(this.frameRoots.get(rootKey));
		this.toolbar._resetSticky();
	},

	/**
	 * @description javascript execCommand
	 * @param {string} command javascript execCommand function property
	 * @param {boolean=} showDefaultUI javascript execCommand function property
	 * @param {string=} value javascript execCommand function property
	 */
	execCommand(command, showDefaultUI, value) {
		this.frameContext.get('_wd').execCommand(command, showDefaultUI, command === 'formatBlock' ? '<' + value + '>' : value);
		this.history.push(true);
	},

	/**
	 * @description Focus to wysiwyg area
	 * @param {*} rootKey Root index
	 */
	focus(rootKey) {
		if (rootKey) this.changeFrameContext(rootKey);
		if (this.frameContext.get('wysiwygFrame').style.display === 'none') return;
		this._preventBlur = false;

		if (this.frameOptions.get('iframe') || !this.frameContext.get('wysiwyg').contains(this.selection.getNode())) {
			this._nativeFocus();
		} else {
			try {
				const range = this.selection.getRange();
				if (range.startContainer === range.endContainer && domUtils.isWysiwygFrame(range.startContainer)) {
					const currentNode = range.commonAncestorContainer.children[range.startOffset];
					if (!this.format.isLine(currentNode) && !this.component.is(currentNode)) {
						const br = domUtils.createElement('BR');
						const format = domUtils.createElement(this.options.get('defaultLine'), null, br);
						this.frameContext.get('wysiwyg').insertBefore(format, currentNode);
						this.selection.setRange(br, 0, br, 0);
						return;
					}
				}
				this.selection.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
			} catch (e) {
				console.warn('[SUNEDITOR.focus.warn] ', e);
				this._nativeFocus();
			}
		}

		if (this.isBalloon) this.eventManager._toggleToolbarBalloon();
	},

	/**
	 * @description If "focusEl" is a component, then that component is selected; if it is a format element, the last text is selected
	 * - If "focusEdge" is null, then selected last element
	 * @param {?Element=} focusEl Focus element
	 */
	focusEdge(focusEl) {
		this._preventBlur = false;
		if (!focusEl) focusEl = this.frameContext.get('wysiwyg').lastElementChild;

		const fileComponentInfo = this.component.get(focusEl);
		if (fileComponentInfo) {
			this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName, false);
		} else if (focusEl) {
			if (focusEl.nodeType !== 3) {
				focusEl = domUtils.getEdgeChild(
					focusEl,
					function (current) {
						return current.childNodes.length === 0 || current.nodeType === 3;
					},
					true
				);
			}
			if (!focusEl) this._nativeFocus();
			else this.selection.setRange(focusEl, focusEl.textContent.length, focusEl, focusEl.textContent.length);
		} else {
			this.focus();
		}
	},

	/**
	 * @description Focusout to wysiwyg area (.blur())
	 */
	blur() {
		if (this.frameOptions.get('iframe')) {
			this.frameContext.get('wysiwygFrame').blur();
		} else {
			this.frameContext.get('wysiwyg').blur();
		}
	},

	/**
	 * @description Destroy the suneditor
	 */
	destroy() {
		/** remove history */
		this.history.destroy();

		/** remove event listeners */
		this.eventManager._removeAllEvents();

		/** destroy external library */
		if (this.options.get('codeMirror6Editor')) {
			this.options.get('codeMirror6Editor').destroy();
		}

		/** remove element */
		domUtils.removeItem(this.carrierWrapper);
		domUtils.removeItem(this.context.get('toolbar._wrapper'));
		domUtils.removeItem(this.context.get('toolbar.sub._wrapper'));
		domUtils.removeItem(this.context.get('statusbar._wrapper'));
		this.applyFrameRoots((e) => {
			domUtils.removeItem(e.get('topArea'));
			e.get('options').clear();
			e.clear();
		});

		/** remove object reference */
		this.options.clear();
		this.context.clear();

		let obj = this.plugins;
		for (const k in obj) {
			const p = obj[k];
			if (typeof p._destroy === 'function') p._destroy();
			for (const pk in p) {
				delete p[pk];
			}
			delete obj[k];
		}
		obj = this.events;
		for (const k in obj) {
			delete obj[k];
		}

		obj = ['eventManager', 'char', 'component', 'format', 'html', 'menu', 'nodeTransform', 'offset', 'selection', 'shortcuts', 'toolbar', 'ui', 'viewer'];
		for (let i = 0, len = obj.length, c; i < len; i++) {
			c = this[obj[i]];
			for (const k in c) {
				delete c[k];
			}
		}
		obj = this.subToolbar;
		if (obj) {
			for (const k in obj) {
				delete obj[k];
			}
		}

		obj = null;
		for (const k in this) {
			delete this[k];
		}

		return null;
	},

	/** ----- private methods ----------------------------------------------------------------------------------------------------------------------------- */
	/**
	 * @private
	 * @description Set frameContext, frameOptions
	 * @param {FrameContext} rt Root target[key] FrameContext
	 */
	_setFrameInfo(rt) {
		this.frameContext = rt;
		this.frameOptions = rt.get('options');
		rt.set('_editorHeight', rt.get('wysiwygFrame').offsetHeight);
		this._lineBreaker_t = rt.get('lineBreaker_t');
		this._lineBreaker_b = rt.get('lineBreaker_b');
	},

	/**
	 * @private
	 * @description Focus to wysiwyg area using "native focus function"
	 */
	_nativeFocus() {
		this.selection.__focus();
		this.selection._init();
	},

	/**
	 * @private
	 * @description Check the components such as image and video and modify them according to the format.
	 * @param {boolean} loaded If true, the component is loaded.
	 */
	_checkComponents(loaded) {
		for (let i = 0, len = this._fileInfoPluginsCheck.length; i < len; i++) {
			this._fileInfoPluginsCheck[i](loaded);
		}
	},

	/**
	 * @private
	 * @description Initialize the information of the components.
	 */
	_resetComponents() {
		for (let i = 0, len = this._fileInfoPluginsReset.length; i < len; i++) {
			this._fileInfoPluginsReset[i]();
		}
	},

	/**
	 * @private
	 * @description Initializ wysiwyg area (Only called from core._init)
	 * @param {FrameContext} e frameContext
	 * @param {string} value initial html string
	 */
	_initWysiwygArea(e, value) {
		// set content
		e.get('wysiwyg').innerHTML =
			this.html.clean(typeof value === 'string' ? value : (/^TEXTAREA$/i.test(e.get('originElement').nodeName) ? e.get('originElement').value : e.get('originElement').innerHTML) || '', {
				forceFormat: true,
				whitelist: null,
				blacklist: null,
				_freeCodeViewMode: this.options.get('freeCodeViewMode')
			}) || '<' + this.options.get('defaultLine') + '><br></' + this.options.get('defaultLine') + '>';

		// char counter
		if (e.has('charCounter')) e.get('charCounter').textContent = this.char.getLength();

		// document type init
		if (this.options.get('type') === 'document') {
			e.set('documentType', new DocumentType(this, e));
			if (e.get('documentType').useHeader) {
				e.set('documentType-use-header', true);
			}
			if (e.get('documentType').usePage) {
				e.set('documentType-use-page', true);
				e.get('documentTypePageMirror').innerHTML = e.get('wysiwyg').innerHTML;
			}
		}
	},

	/**
	 * @private
	 * @description Called when there are changes to tags in the wysiwyg region.
	 * @param {FrameContext} fc - Frame context object
	 */
	_resourcesStateChange(fc) {
		this._iframeAutoHeight(fc);
		this._checkPlaceholder(fc);
		if (this.options.get('type') === 'document' && fc.get('documentType').usePage) {
			fc.get('documentTypePageMirror').innerHTML = fc.get('wysiwyg').innerHTML;
		}
	},

	/**
	 * @private
	 * @description Modify the height value of the iframe when the height of the iframe is automatic.
	 * @param {FrameContext} fc - Frame context object
	 */
	_iframeAutoHeight(fc) {
		const autoFrame = fc.get('_iframeAuto');

		if (autoFrame) {
			this._w.setTimeout(() => {
				const h = autoFrame.offsetHeight;
				fc.get('wysiwygFrame').style.height = h + 'px';
				if (!env.isResizeObserverSupported) this.__callResizeFunction(fc, h, null);
			}, 0);
		} else if (!env.isResizeObserverSupported) {
			this.__callResizeFunction(fc, fc.get('wysiwygFrame').offsetHeight, null);
		}
	},

	/**
	 * @private
	 * @description Call the "onResizeEditor" event
	 * @param {FrameContext} fc - Frame context object
	 * @param {number} h - Height value
	 * @param {ResizeObserverEntry} resizeObserverEntry - ResizeObserverEntry object
	 */
	__callResizeFunction(fc, h, resizeObserverEntry) {
		h =
			h === -1
				? resizeObserverEntry?.borderBoxSize && resizeObserverEntry.borderBoxSize[0]
					? resizeObserverEntry.borderBoxSize[0].blockSize
					: resizeObserverEntry.contentRect.height + numbers.get(fc.get('wwComputedStyle').getPropertyValue('padding-left')) + numbers.get(fc.get('wwComputedStyle').getPropertyValue('padding-right'))
				: h;
		if (fc.get('_editorHeight') !== h) {
			this.triggerEvent('onResizeEditor', { height: h, prevHeight: fc.get('_editorHeight'), frameContext: fc, observerEntry: resizeObserverEntry });
			fc.set('_editorHeight', h);
		}

		// document type page
		if (fc.has('documentType-use-page')) {
			fc.get('documentType').resizePage();
		}
	},

	/**
	 * @private
	 * @description Set display property when there is placeholder.
	 * @param {FrameContext} fc - Frame context object
	 */
	_checkPlaceholder(fc) {
		fc = fc || this.frameContext;
		const placeholder = fc.get('placeholder');

		if (placeholder) {
			if (fc.get('isCodeView')) {
				placeholder.style.display = 'none';
				return;
			}

			if (this.isEmpty(fc)) {
				placeholder.style.display = 'block';
			} else {
				placeholder.style.display = 'none';
			}
		}
	},

	/**
	 * @private
	 * @description Initializ editor
	 * @param {EditorInitOptions} options Options
	 */
	__editorInit(options) {
		this.applyFrameRoots((e) => {
			this.__setEditorParams(e);
		});

		// initialize core and add event listeners
		this._setFrameInfo(this.frameRoots.get(this.status.rootKey));
		this.__init(options);
		for (const v of this._onPluginEvents.values()) {
			v.sort((a, b) => a.index - b.index);
		}

		this.applyFrameRoots((e) => {
			this.eventManager._addFrameEvents(e);
			this._initWysiwygArea(e, e.get('options').get('value'));
		});

		this.eventManager.__eventDoc = null;
		this._componentsInfoInit = false;
		this._componentsInfoReset = false;
		this._checkComponents(true);

		this._w.setTimeout(() => {
			// toolbar visibility
			this.context.get('toolbar.main').style.visibility = '';
			// roots
			this.applyFrameRoots((e) => {
				if (typeof this._resourcesStateChange !== 'function') return;
				// observer
				if (this.eventManager._wwFrameObserver) this.eventManager._wwFrameObserver.observe(e.get('wysiwygFrame'));
				if (this.eventManager._toolbarObserver) this.eventManager._toolbarObserver.observe(e.get('_toolbarShadow'));
				// resource state
				this._resourcesStateChange(e);
			});
			// history reset
			this.history.reset();
			// user event
			this.triggerEvent('onload', {});
		}, 0);
	},

	/**
	 * @private
	 * @description Initializ core variable
	 * @param {EditorInitOptions} options Options
	 */
	__init(options) {
		// file components
		this._fileInfoPluginsCheck = [];
		this._fileInfoPluginsReset = [];

		// text components
		this._MELInfo = new Map();

		// Command and file plugins registration
		this.activeCommands = ACTIVE_EVENT_COMMANDS;
		this._onPluginEvents = new Map([
			['onMouseMove', []],
			['onMouseLeave', []],
			['onMouseDown', []],
			['onMouseUp', []],
			['onScroll', []],
			['onClick', []],
			['onInput', []],
			['onKeyDown', []],
			['onKeyUp', []],
			['onFocus', []],
			['onBlur', []],
			['onPastAndDrop', []]
		]);
		this._fileManager.tags = [];
		this._fileManager.pluginMap = {};
		this._fileManager.tagAttrs = {};

		const plugins = this.plugins;
		const isArray = Array.isArray;
		const shortcuts = this.options.get('shortcuts');
		const filePluginRegExp = [];
		let plugin;
		for (const key in plugins) {
			this.registerPlugin(key, this._pluginCallButtons[key], options[key], shortcuts[key]);
			this.registerPlugin(key, this._pluginCallButtons_sub[key], options[key], shortcuts[key]);
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
					for (let tag = 0, tLen = tagNames.length, t; tag < tLen; tag++) {
						t = tagNames[tag].toLowerCase();
						this._fileManager.pluginMap[t] = key;
						if (fm.tagAttrs) {
							this._fileManager.tagAttrs[t] = fm.tagAttrs;
						}
					}
				}
			}

			// Not file component
			if (typeof plugin.constructor.component === 'function') {
				this._componentManager.push(
					function (launcher, element) {
						if (!element || !(element = launcher.component?.call(this, element))) return null;
						return {
							target: element,
							pluginName: launcher.key,
							options: launcher.options
						};
					}.bind(plugin, plugin.constructor)
				);
			}

			// plugin event
			const pluginOptions = plugin.constructor.options || {};
			this._onPluginEvents.forEach((v, k) => {
				if (typeof plugin[k] === 'function') {
					const f = plugin[k].bind(plugin);
					f.index = pluginOptions[`eventIndex_${k}`] || pluginOptions.eventIndex || 0;
					v.push(f);
				}
			});

			// plugin maintain
			if (plugin.retainFormat) {
				const info = plugin.retainFormat();
				this._MELInfo.set(info.query, info.method);
			}
		}

		if (this.options.get('buttons').has('pageBreak') || this.options.get('buttons_sub')?.has('pageBreak')) {
			this._componentManager.push((element) => {
				if (!element || !domUtils.hasClass(element, 'se-page-break')) return null;
				return {
					target: element,
					launcher: {
						destroy: (target) => {
							const focusEl = target.previousElementSibling || target.nextElementSibling;
							domUtils.removeItem(target);
							// focus
							this.focusEdge(focusEl);
							this.history.push(false);
						}
					}
				};
			});
		}

		this._fileManager.regExp = new RegExp(`^(${this._fileManager.tags.join('|') || '\\^'})$`, 'i');
		this._fileManager.pluginRegExp = new RegExp(`^(${filePluginRegExp.length === 0 ? '\\^' : filePluginRegExp.join('|')})$`, 'i');

		delete this._pluginCallButtons;
		delete this._pluginCallButtons_sub;

		this.__cachingButtons();
		this.__cachingShortcuts();
	},

	/**
	 * @private
	 * @description Caching basic buttons to use
	 */
	__cachingButtons() {
		const ctx = this.context;
		this.__setDisabledButtons();
		this.__saveCommandButtons(this.allCommandButtons, ctx.get('toolbar.buttonTray'));
		if (this.options.has('_subMode')) {
			this.__saveCommandButtons(this.subAllCommandButtons, ctx.get('toolbar.sub.buttonTray'));
		}
	},

	/**
	 * @private
	 * @description Set the disabled button list
	 * - this._codeViewDisabledButtons, this._controllerOnDisabledButtons
	 */
	__setDisabledButtons() {
		const ctx = this.context;

		this._codeViewDisabledButtons = converter.nodeListToArray(ctx.get('toolbar.buttonTray').querySelectorAll(DISABLE_BUTTONS_CODEVIEW));
		this._controllerOnDisabledButtons = converter.nodeListToArray(ctx.get('toolbar.buttonTray').querySelectorAll(DISABLE_BUTTONS_CONTROLLER));

		if (this.options.has('_subMode')) {
			this._codeViewDisabledButtons = this._codeViewDisabledButtons.concat(converter.nodeListToArray(ctx.get('toolbar.sub.buttonTray').querySelectorAll(DISABLE_BUTTONS_CODEVIEW)));
			this._controllerOnDisabledButtons = this._controllerOnDisabledButtons.concat(converter.nodeListToArray(ctx.get('toolbar.sub.buttonTray').querySelectorAll(DISABLE_BUTTONS_CONTROLLER)));
		}
	},

	/**
	 * @private
	 * @description Save the current buttons
	 * @param {Map<string, Element>} cmdButtons Command button map
	 * @param {Element} tray Button tray
	 */
	__saveCommandButtons(cmdButtons, tray) {
		const currentButtons = tray.querySelectorAll(COMMAND_BUTTONS);
		const shortcuts = this.options.get('shortcuts');
		const reverseCommandArray = this.options.get('_reverseCommandArray');
		const keyMap = this.shortcutsKeyMap;
		const reverseKeys = this.reverseKeys;

		for (let i = 0, len = currentButtons.length, e, c; i < len; i++) {
			e = currentButtons[i];
			c = e.getAttribute('data-command');
			// command set
			cmdButtons.set(c, e);
			this.__setCommandTargets(c, e);
			// shortcuts
			CreateShortcuts(c, e, shortcuts[c], keyMap, reverseCommandArray, reverseKeys);
		}
	},

	/**
	 * @private
	 * @description Caches shortcut keys for commands.
	 */
	__cachingShortcuts() {
		const shortcuts = this.options.get('shortcuts');
		const reverseCommandArray = this.options.get('_reverseCommandArray');
		const keyMap = this.shortcutsKeyMap;
		const reverseKeys = this.reverseKeys;
		for (const key of Object.keys(shortcuts)) {
			if (!key.startsWith('_')) continue;
			CreateShortcuts('', null, shortcuts[key], keyMap, reverseCommandArray, reverseKeys);
		}
	},

	/**
	 * @private
	 * @description Sets command target elements.
	 * @param {string} cmd - The command identifier.
	 * @param {Element} target - The associated command button.
	 */
	__setCommandTargets(cmd, target) {
		if (!cmd || !target) return;

		const isBasicCmd = BASIC_COMMANDS.includes(cmd);
		if (!isBasicCmd && !this.plugins[cmd]) return;

		if (!this.commandTargets.get(cmd)) {
			this.commandTargets.set(cmd, [target]);
		} else if (!this.commandTargets.get(cmd).includes(target)) {
			this.commandTargets.get(cmd).push(target);
		}
	},

	/**
	 * @private
	 * @description Configures the document properties of an iframe editor.
	 * @param {HTMLIFrameElement} frame - The editor iframe.
	 * @param {Map<string, *>} originOptions - The original options.
	 * @param {FrameOptions} targetOptions - The new options.
	 */
	__setIframeDocument(frame, originOptions, targetOptions) {
		frame.setAttribute('scrolling', 'auto');
		frame.contentDocument.head.innerHTML =
			'<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">' +
			converter._setIframeStyleLinks(targetOptions.get('iframe_cssFileName')) +
			converter._setAutoHeightStyle(targetOptions.get('height'));
		frame.contentDocument.body.className = originOptions.get('_editableClass');
		frame.contentDocument.body.setAttribute('contenteditable', true);
	},

	/**
	 * @private
	 * @description Set the FrameContext parameters and options
	 * @param {FrameContext} e - Frame context object
	 */
	__setEditorParams(e) {
		const frameOptions = e.get('options');
		const _w = this._w;

		e.set('wwComputedStyle', _w.getComputedStyle(e.get('wysiwyg')));

		if (!frameOptions.get('iframe') && typeof ShadowRoot === 'function') {
			let child = e.get('wysiwygFrame');
			while (child) {
				if (child.shadowRoot) {
					this._shadowRoot = child.shadowRoot;
					break;
				} else if (child instanceof ShadowRoot) {
					this._shadowRoot = child;
					break;
				}
				child = child.parentNode;
			}
		}

		// wisywig attributes
		const attr = frameOptions.get('editableFrameAttributes');
		for (const k in attr) {
			e.get('wysiwyg').setAttribute(k, attr[k]);
		}

		// init, validate
		if (frameOptions.get('iframe')) {
			e.set('_ww', e.get('wysiwygFrame').contentWindow);
			e.set('_wd', e.get('wysiwygFrame').contentDocument);
			e.set('wysiwyg', e.get('_wd').body);
			// e.get('wysiwyg').className += ' ' + options.get('_editableClass');
			if (frameOptions.get('_defaultStyles').editor) e.get('wysiwyg').style.cssText = frameOptions.get('_defaultStyles').editor;
			if (frameOptions.get('height') === 'auto') e.set('_iframeAuto', e.get('_wd').body);
		} else {
			e.set('_ww', _w);
			e.set('_wd', this._d);
		}
	},

	/**
	 * @private
	 * @description Registers and initializes editor classes.
	 */
	__registerClass() {
		// use events
		this.events = { ...Events(), ...this.options.get('events') };
		this.triggerEvent = async (eventName, eventData) => {
			// [iframe] wysiwyg is disabled, the event is not called.
			if (eventData?.frameContext?.get('wysiwyg').getAttribute('contenteditable') === 'false') return false;
			const eventHandler = this.events[eventName];
			if (typeof eventHandler === 'function') {
				return await eventHandler({ editor: this, ...eventData });
			}
			return env.NO_EVENT;
		};

		// history function
		this.history = History(this);

		// eventManager
		this.eventManager = new EventManager(this);

		// util classes
		this.offset = new Offset(this);
		this.shortcuts = new Shortcuts(this);
		// main classes
		this.toolbar = new Toolbar(this, { keyName: 'toolbar', balloon: this.isBalloon, balloonAlways: this.isBalloonAlways, inline: this.isInline, res: this._responsiveButtons });
		if (this.options.has('_subMode')) {
			this.subToolbar = new Toolbar(this, {
				keyName: 'toolbar.sub',
				balloon: this.isSubBalloon,
				balloonAlways: this.isSubBalloonAlways,
				inline: false,
				res: this._responsiveButtons_sub
			});
		}
		this.selection = new Selection(this);
		this.html = new HTML(this);
		this.nodeTransform = new NodeTransform(this);
		this.component = new Component(this);
		this.format = new Format(this);
		this.menu = new Menu(this);
		this.char = new Char(this);
		this.ui = new UI(this);
		this.viewer = new Viewer(this);

		// register classes to the eventManager
		ClassInjector.call(this.eventManager, this);
		// register main classes
		ClassInjector.call(this.char, this);
		ClassInjector.call(this.component, this);
		ClassInjector.call(this.format, this);
		ClassInjector.call(this.html, this);
		ClassInjector.call(this.menu, this);
		ClassInjector.call(this.nodeTransform, this);
		ClassInjector.call(this.offset, this);
		ClassInjector.call(this.selection, this);
		ClassInjector.call(this.toolbar, this);
		ClassInjector.call(this.ui, this);
		ClassInjector.call(this.viewer, this);
		if (this.options.has('_subMode')) ClassInjector.call(this.subToolbar, this);

		// delete self reference
		delete this.char.char;
		delete this.component.component;
		delete this.format.format;
		delete this.html.html;
		delete this.menu.menu;
		delete this.nodeTransform.nodeTransform;
		delete this.offset.offset;
		delete this.selection.selection;
		delete this.toolbar.toolbar;
		delete this.viewer.viewer;
		if (this.subToolbar) delete this.subToolbar.subToolbar;

		this._responsiveButtons = this._responsiveButtons_sub = null;
	},

	/**
	 * @private
	 * @description Creates the editor instance and initializes components.
	 * @param {EditorInitOptions} originOptions - The initial editor options.
	 * @returns {Promise<void>}
	 */
	async __Create(originOptions) {
		// set modes
		this.isInline = /inline/i.test(this.options.get('mode'));
		this.isBalloon = /balloon/i.test(this.options.get('mode'));
		this.isBalloonAlways = /balloon-always/i.test(this.options.get('mode'));
		this.isClassic = /classic/i.test(this.options.get('mode'));
		// set subToolbar modes
		this.isSubBalloon = /balloon/i.test(this.options.get('_subMode'));
		this.isSubBalloonAlways = /balloon-always/i.test(this.options.get('_subMode'));

		// register class
		this.__registerClass();

		// common events
		this.eventManager._addCommonEvents();

		// init
		const iframePromises = [];
		this.applyFrameRoots((e) => {
			const o = e.get('originElement');
			const t = e.get('topArea');
			o.style.display = 'none';
			t.style.display = 'block';
			o.parentNode.insertBefore(t, o.nextElementSibling);

			if (e.get('options').get('iframe')) {
				const iframeLoaded = new Promise((resolve) => {
					this.eventManager.addEvent(e.get('wysiwygFrame'), 'load', ({ target }) => {
						this.__setIframeDocument(target, this.options, e.get('options'));
						resolve();
					});
				});
				iframePromises.push(iframeLoaded);
			}
		});

		this.applyFrameRoots((e) => {
			e.get('wrapper').appendChild(e.get('wysiwygFrame'));

			// document type
			if (e.get('documentTypeInner')) {
				if (this.options.get('_rtl')) e.get('wrapper').appendChild(e.get('documentTypeInner'));
				else e.get('wrapper').insertBefore(e.get('documentTypeInner'), e.get('wysiwygFrame'));
			}
			if (e.get('documentTypePage')) {
				if (this.options.get('_rtl')) e.get('wrapper').insertBefore(e.get('documentTypePage'), e.get('wysiwygFrame'));
				else e.get('wrapper').appendChild(e.get('documentTypePage'));
				// page mirror
				e.get('wrapper').appendChild(e.get('documentTypePageMirror'));
			}
		});

		if (iframePromises.length > 0) {
			await Promise.all(iframePromises);
		}

		this.__editorInit(originOptions);
	},

	Constructor: Editor
};

function GetResetDiffKey(key) {
	if (/^statusbar/i.test(key)) return 'statusbar';
	return key;
}

function CheckResetKeys(keys, plugins, root) {
	for (let i = 0, len = keys.length, k; i < len; i++) {
		k = keys[i];
		if (RO_UNAVAILABD.includes(k) || (plugins && plugins[k])) {
			console.warn(`[SUNEDITOR.warn.resetOptions] "[${root + k}]" options not available in resetOptions have no effect.`);
			keys.splice(i--, 1);
			len--;
		}
	}
}

export default Editor;
