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
import Notice from './class/notice';
import Offset from './class/offset';
import Selection from './class/selection';
import Shortcuts from './class/shortcuts';
import Toolbar from './class/toolbar';
import Viewer from './class/viewer';

const COMMAND_BUTTONS = '.se-menu-list .se-toolbar-btn[data-command]';
const DISABLE_BUTTONS_CODEVIEW = `${COMMAND_BUTTONS}:not([class~="se-code-view-enabled"]):not([data-type="MORE"])`;
const DISABLE_BUTTONS_CONTROLLER = `${COMMAND_BUTTONS}:not([class~="se-component-enabled"]):not([data-type="MORE"])`;

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
	this.frameRoots = product.frameRoots;
	this.context = product.context;
	this.frameContext = new Map();
	this.frameOptions = new Map();
	this._lineBreaker_t = null;
	this._lineBreaker_b = null;

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
	this.carrierWrapper = product.carrierWrapper;

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
	 * @description Events object, call by triggerEvent function
	 * @type {Object.<string, any>}
	 */
	this.events = null;

	/**
	 * @description Call the event function by injecting self: this.
	 * @type {Function}
	 */
	this.triggerEvent = null;

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
	 * @property {number} tabSize Indent size of tab (4)
	 * @property {number} indentSize Indent size (25)px
	 * @property {number} codeIndentSize Indent size of Code view mode (2)
	 * @property {Array} currentNodes  An element array of the current cursor's node structure
	 * @property {Array} currentNodesMap  An element name array of the current cursor's node structure
	 * @property {boolean} onSelected Boolean value of whether component is selected
	 * @property {number} rootKey Current root key
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
	 */
	this.isClassic = null;

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
	 * @description Is subToolbar balloon|balloon-always mode?
	 */
	this.isSubBalloon = null;

	/**
	 * @description Is subToolbar balloon-always mode?
	 */
	this.isSubBalloonAlways = null;

	// ----- Properties not shared with _core -----
	/**
	 * @description All command buttons map
	 */
	this.allCommandButtons = new Map();
	this.subAllCommandButtons = new Map();

	/**
	 * @description Shoutcuts key map
	 */
	this.shortcutsKeyMap = new Map();
	this.reverseKeys = [];

	/**
	 * @description A map with the plugin's buttons having an "active" method and the default command buttons with an "active" action.
	 * Each button is contained in an array.
	 */
	this.commandTargets = new Map();

	/**
	 * @description Plugins array with "active" method.
	 * "activeCommands" runs the "add" method when creating the editor.
	 */
	this.activeCommands = null;

	/**
	 * @description The selection node (selection.getNode()) to which the effect was last applied
	 */
	this.effectNode = null;

	// ------------------------------------------------------- private properties -------------------------------------------------------
	/**
	 * @description Closest ShadowRoot to editor if found
	 * @type {ShadowRoot}
	 * @private
	 */
	this._shadowRoot = null;

	/**
	 * @description Plugin call event map
	 * @private
	 */
	this._onPluginEvents = null;

	/**
	 * @description Copy format info
	 * @private
	 */
	this._onCopyFormatInfo = null;
	this._onCopyFormatInitMethod = null;

	/**
	 * @description Controller, modal relative
	 * @private
	 */
	this.opendModal = null;
	this.opendControllers = [];
	this.currentControllerName = '';
	this._controllerTargetContext = null;
	this.selectMenuOn = false;
	this._backWrapper = product.carrierWrapper.querySelector('.se-back-wrapper');

	this._controllerOnDisabledButtons = [];
	this._codeViewDisabledButtons = [];

	/**
	 * @description Button List in Responsive Toolbar.
	 * @private
	 */
	this._pluginCallButtons = product.pluginCallButtons;
	this._pluginCallButtons_sub = product.pluginCallButtons_sub;
	this._responsiveButtons = product.responsiveButtons;
	this._responsiveButtons_sub = product.responsiveButtons_sub;

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
	 * @description plugin retainFormat info Map()
	 * @private
	 */
	this._MELInfo = null;

	/**
	 * @description Properties for managing files in the "FileManager" module
	 * @private
	 */
	this._fileInfoPluginsCheck = null;

	/**
	 * @description Properties for managing files in the "FileManager" module
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
		pluginRegExp: null,
		pluginMap: null
	};
	this._componentManager = [];

	/**
	 * @description Current Figure container.
	 * @private
	 */
	this._figureContainer = null;

	/**
	 * @description Origin options
	 * @private
	 */
	this._originOptions = options;

	/** ----- Create editor ------------------------------------------------------------ */
	this.__Create(options);
};

Editor.prototype = {
	/**
	 * @description If the plugin is not added, add the plugin and call the 'add' function.
	 * If the plugin is added call callBack function.
	 * @param {string} pluginName The name of the plugin to call
	 * @param {Array.<Element>|null} targets Plugin target button (This is not necessary if you have a button list when creating the editor)
	 * @param {object|null} pluginOptions Plugin's options
	 * @param {object} shortcuts this.options.get('shortcuts')
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
	 * @param {Element|null} button The element of command button
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
			} else if (/fileBrowser/.test(type)) {
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
	 * (selectAll, codeView, fullScreen, indent, outdent, undo, redo, removeFormat, print, preview, showBlocks, save, bold, underline, italic, strike, subscript, superscript, copy, cut, paste)
	 * @param {string} command Property of command button (data-value)
	 * @param {Element} button Command button
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
	 * "f" is called as long as the button array's length.
	 * @param {string} cmd data-command
	 * @param {Function} f Function.
	 */
	applyCommandTargets(cmd, f) {
		if (this.commandTargets.has(cmd)) {
			this.commandTargets.get(cmd).forEach(f);
		}
	},

	/**
	 * @description Executes a function by traversing all root targets.
	 * @param {Function} f Function
	 */
	applyFrameRoots(f) {
		this.frameRoots.forEach(f);
	},

	/**
	 * @description Checks if the content of the editor is empty.
	 * Display criteria for "placeholder".
	 * @param {frameContext|null} fc Frame context, if not present, currently selected frame context.
	 * @returns {boolean}
	 */
	isEmpty(fc) {
		fc = fc || this.frameContext;
		const wysiwyg = fc.get('wysiwyg');
		return domUtils.isZeroWith(wysiwyg.textContent) && !wysiwyg.querySelector(this.options.get('allowedEmptyTags')) && (wysiwyg.innerText.match(/\n/g) || '').length <= 1;
	},

	/**
	 * @description Set direction to "rtl" or "ltr".
	 * @param {string} dir "rtl" or "ltr"
	 */
	setDir(dir) {
		const rtl = dir === 'rtl';
		if (this.options.get('_rtl') === rtl) return;

		try {
			this.options.set('_rtl', rtl);
			this._offCurrentController();

			const fc = this.frameContext;
			const plugins = this.plugins;
			for (const k in plugins) {
				if (typeof plugins[k].setDir === 'function') plugins[k].setDir(dir);
			}

			const toolbarWrapper = this.context.get('toolbar._wrapper');
			const statusbarWrapper = this.context.get('statusbar._wrapper');
			if (rtl) {
				this.applyFrameRoots((e) => {
					domUtils.addClass([e.get('topArea'), e.get('wysiwyg')], 'se-rtl');
				});
				domUtils.addClass([this.carrierWrapper, toolbarWrapper, statusbarWrapper], 'se-rtl');
			} else {
				this.applyFrameRoots((e) => {
					domUtils.removeClass([e.get('topArea'), e.get('wysiwyg')], 'se-rtl');
				});
				domUtils.removeClass([this.carrierWrapper, toolbarWrapper, statusbarWrapper], 'se-rtl');
			}

			const lineNodes = domUtils.getListChildren(fc.wysiwyg, (current) => {
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
	 * @param {Object} newOptions Options
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
				this.setEditorStyle(newRootOptions.get('_defaultStyles'), fc);

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
			this.setTheme(newOptions.theme);
		}

		this.effectNode = null;
		this._setFrameInfo(this.frameRoots.get(this.status.rootKey));
	},

	/**
	 * @description Set the theme to the editor
	 * @param {string} theme Theme name
	 */
	setTheme(theme) {
		if (typeof theme !== 'string') return;
		const o = this.options;
		const prevTheme = o.get('_themeClass').trim();
		o.set('theme', theme || '');
		o.set('_themeClass', theme ? ` se-theme-${theme}` : '');
		theme = o.get('_themeClass').trim();

		const applyTheme = (target) => {
			if (!target) return;
			if (prevTheme) domUtils.removeClass(target, prevTheme);
			if (theme) domUtils.addClass(target, theme);
		};

		applyTheme(this.carrierWrapper);
		this.applyFrameRoots((e) => {
			applyTheme(e.get('topArea'));
			applyTheme(e.get('wysiwyg'));
		});

		applyTheme(this.context.get('statusbar._wrapper'));
		applyTheme(this.context.get('toolbar._wrapper'));
	},

	/**
	 * @description Change the current root index.
	 * @param {number} rootKey
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
	 * @param {Boolean|undefined} showDefaultUI javascript execCommand function property
	 * @param {string|undefined} value javascript execCommand function property
	 */
	execCommand(command, showDefaultUI, value) {
		this.frameContext.get('_wd').execCommand(command, showDefaultUI, command === 'formatBlock' ? '<' + value + '>' : value);
		this.history.push(true);
	},

	/**
	 * @description Focus to wysiwyg area
	 * @param {number|undefined} rootKey Root index
	 */
	focus(rootKey) {
		if (rootKey) this.changeFrameContext(rootKey);
		if (this.frameContext.get('wysiwygFrame').style.display === 'none') return;
		this._antiBlur = false;

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
	 * If "focusEdge" is null, then selected last element
	 * @param {Element|null} focusEl Focus element
	 */
	focusEdge(focusEl) {
		this._antiBlur = false;
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
	 * @description Set "options.get('editorStyle')" style.
	 * Define the style of the edit area
	 * It can also be defined with the "setOptions" method, but the "setEditorStyle" method does not render the editor again.
	 * @param {string} style Style string
	 * @param {FrameContext|null} fc Frame context
	 */
	setEditorStyle(style, fc) {
		fc = fc || this.frameContext;
		const fo = fc.get('options');

		const newStyles = converter._setDefaultOptionStyle(fo, style);
		fo.set('_defaultStyles', newStyles);

		// top area
		fc.get('topArea').style.cssText = newStyles.top;

		// code view
		const code = fc.get('code');
		code.style.cssText = fo.get('_defaultStyles').frame;
		code.style.display = 'none';

		// wysiwyg frame
		if (!fo.get('iframe')) {
			fc.get('wysiwygFrame').style.cssText = newStyles.frame + newStyles.editor;
		} else {
			fc.get('wysiwygFrame').style.cssText = newStyles.frame;
			fc.get('wysiwyg').style.cssText = newStyles.editor;
		}
	},

	/**
	 * @description Switch to or off "ReadOnly" mode.
	 * @param {boolean} value "readOnly" boolean value.
	 * @param {string|undefined} rootKey Root key
	 */
	readOnly(value, rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.frameContext;

		fc.set('isReadOnly', !!value);
		domUtils.setDisabled(this._controllerOnDisabledButtons, !!value);

		if (value) {
			this._offCurrentController();
			this._offCurrentModal();

			if (this.toolbar?.currentMoreLayerActiveButton?.disabled) this.toolbar.moreLayerOff();
			if (this.subToolbar?.currentMoreLayerActiveButton?.disabled) this.subToolbar.moreLayerOff();
			if (this.menu?.currentDropdownActiveButton?.disabled) this.menu.dropdownOff();
			if (this.menu?.currentContainerActiveButton?.disabled) this.menu.containerOff();
			if (this.modalForm) this.plugins.modal.close.call(this);

			fc.get('code').setAttribute('readOnly', 'true');
			domUtils.addClass(fc.get('wysiwyg'), 'se-read-only');
		} else {
			fc.get('code').removeAttribute('readOnly');
			domUtils.removeClass(fc.get('wysiwyg'), 'se-read-only');
		}

		if (this.options.get('hasCodeMirror')) {
			this.viewer._codeMirrorEditor('readonly', !!value, rootKey);
		}
	},

	/**
	 * @description Disable the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	disable(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.frameContext;

		this.toolbar.disable();
		this._offCurrentController();
		this._offCurrentModal();

		if (this.modalForm) this.plugins.modal.close.call(this);

		fc.get('wysiwyg').setAttribute('contenteditable', false);
		fc.set('isDisabled', true);

		if (this.options.get('hasCodeMirror')) {
			this.viewer._codeMirrorEditor('readonly', true, rootKey);
		} else {
			fc.get('code').setAttribute('disabled', true);
		}
	},

	/**
	 * @description Enable the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	enable(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.frameContext;

		this.toolbar.enable();
		fc.get('wysiwyg').setAttribute('contenteditable', true);
		fc.set('isDisabled', false);

		if (this.options.get('hasCodeMirror')) {
			this.viewer._codeMirrorEditor('readonly', false, rootKey);
		} else {
			fc.get('code').removeAttribute('disabled');
		}
	},

	/**
	 * @description Show the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	show(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.frameContext;
		const topAreaStyle = fc.get('topArea').style;
		if (topAreaStyle.display === 'none') topAreaStyle.display = 'block';
	},

	/**
	 * @description Hide the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	hide(rootKey) {
		const fc = rootKey ? this.frameRoots.get(rootKey) : this.frameContext;
		fc.get('topArea').style.display = 'none';
	},

	/**
	 * @description Show loading box
	 * @param {string|undefined} rootKey Root key
	 */
	showLoading(rootKey) {
		(rootKey ? this.frameRoots.get(rootKey).get('container') : this.carrierWrapper).querySelector('.se-loading-box').style.display = 'block';
	},

	/**
	 * @description Hide loading box
	 * @param {string|undefined} rootKey Root key
	 */
	hideLoading(rootKey) {
		(rootKey ? this.frameRoots.get(rootKey).get('container') : this.carrierWrapper).querySelector('.se-loading-box').style.display = 'none';
	},

	/**
	 * @description Activate the transparent background "div" so that other elements are not affected during resizing.
	 * @param {cursor} cursor cursor css property
	 */
	enableBackWrapper(cursor) {
		this._backWrapper.style.cursor = cursor;
		this._backWrapper.style.display = 'block';
	},

	/**
	 * @description Disabled background "div"
	 */
	disableBackWrapper() {
		this._backWrapper.style.display = 'none';
		this._backWrapper.style.cursor = 'default';
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

		obj = ['eventManager', 'char', 'component', 'format', 'html', 'menu', 'nodeTransform', 'notice', 'offset', 'selection', 'shortcuts', 'toolbar', 'viewer'];
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
	 * @description Set frameContext, frameOptions
	 * @param {rootTarget} rt Root target
	 */
	_setFrameInfo(rt) {
		this.frameContext = rt;
		this.frameOptions = rt.get('options');
		rt.set('_editorHeight', rt.get('wysiwygFrame').offsetHeight);
		this._lineBreaker_t = rt.get('lineBreaker_t');
		this._lineBreaker_b = rt.get('lineBreaker_b');
	},

	/**
	 * @description visible controllers
	 * @param {boolean} value hidden/show
	 * @param {boolean?} lineBreakShow Line break hidden/show (default: Follows the value "value".)
	 * @private
	 */
	_visibleControllers(value, lineBreakShow) {
		const visible = value ? '' : 'hidden';
		const breakerVisible = lineBreakShow ?? visible ? '' : 'hidden';

		const cont = this.opendControllers;
		for (let i = 0, c; i < cont.length; i++) {
			c = cont[i];
			if (c.form) c.form.style.visibility = visible;
		}

		this._lineBreaker_t.style.visibility = breakerVisible;
		this._lineBreaker_b.style.visibility = breakerVisible;
	},

	/**
	 * @description Off current controllers
	 * @private
	 */
	_offCurrentController() {
		this.component.__deselect();
	},

	/**
	 * @description Off controllers
	 * @private
	 */
	__offControllers() {
		const cont = this.opendControllers;
		const fixedCont = [];
		for (let i = 0, c; i < cont.length; i++) {
			c = cont[i];
			if (c.fixed) {
				fixedCont.push(c);
				continue;
			}
			if (typeof c.inst.close === 'function') c.inst.close();
			if (c.form) c.form.style.display = 'none';
		}
		this.opendControllers = fixedCont;
		this.currentControllerName = '';
		this._antiBlur = false;
	},

	/**
	 * @description Off current modal
	 * @private
	 */
	_offCurrentModal() {
		if (this.opendModal) {
			this.opendModal.close();
		}
	},

	/**
	 * @description Focus to wysiwyg area using "native focus function"
	 * @private
	 */
	_nativeFocus() {
		this.selection.__focus();
		this.selection._init();
	},

	/**
	 * @description Check the components such as image and video and modify them according to the format.
	 * @private
	 */
	_checkComponents(loaded) {
		for (let i = 0, len = this._fileInfoPluginsCheck.length; i < len; i++) {
			this._fileInfoPluginsCheck[i](loaded);
		}
	},

	/**
	 * @description Initialize the information of the components.
	 * @private
	 */
	_resetComponents() {
		for (let i = 0, len = this._fileInfoPluginsReset.length; i < len; i++) {
			this._fileInfoPluginsReset[i]();
		}
	},

	/**
	 * @description Initializ wysiwyg area (Only called from core._init)
	 * @param {Map} e frameContext
	 * @param {string} value initial html string
	 * @private
	 */
	_initWysiwygArea(e, value) {
		// set content
		e.get('wysiwyg').innerHTML =
			this.html.clean(typeof value === 'string' ? value : (/^TEXTAREA$/i.test(e.get('originElement').nodeName) ? e.get('originElement').value : e.get('originElement').innerHTML) || '', true, null, null) ||
			'<' + this.options.get('defaultLine') + '><br></' + this.options.get('defaultLine') + '>';

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
	 * @description Called when there are changes to tags in the wysiwyg region.
	 * @private
	 */
	_resourcesStateChange(fc) {
		this._iframeAutoHeight(fc);
		this._checkPlaceholder(fc);
		if (fc.get('documentType').usePage) {
			fc.get('documentTypePageMirror').innerHTML = fc.get('wysiwyg').innerHTML;
		}
	},

	/**
	 * @description Modify the height value of the iframe when the height of the iframe is automatic.
	 * @private
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

		// document type page
		if (fc.has('documentType-use-page')) {
			fc.get('documentType').rePage(false);
		}
	},

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
	 * @description Set display property when there is placeholder.
	 * @private
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
	 * @description Initializ editor
	 * @private
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
	 * @description Initializ core variable
	 * @private
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
	 * @description Caching basic buttons to use
	 * @private
	 */
	__cachingButtons() {
		const ctx = this.context;
		this.__setDisabledButtons();
		this.__saveCommandButtons(this.allCommandButtons, ctx.get('toolbar.buttonTray'));
		if (this.options.has('_subMode')) {
			this.__saveCommandButtons(this.subAllCommandButtons, ctx.get('toolbar.sub.buttonTray'));
		}
	},

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
	 * @description Save the current buttons
	 * @private
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

	__setIframeDocument(frame, originOptions, targetOptions) {
		frame.setAttribute('scrolling', 'auto');
		frame.contentDocument.head.innerHTML =
			'<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">' +
			converter._setIframeStyleLinks(targetOptions.get('iframe_cssFileName')) +
			converter._setAutoHeightStyle(targetOptions.get('height'));
		frame.contentDocument.body.className = originOptions.get('_editableClass');
		frame.contentDocument.body.setAttribute('contenteditable', true);
	},

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
		this.notice = new Notice(this);
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

		this._responsiveButtons = this._responsiveButtons_res = null;
	},

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
