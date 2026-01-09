import { env, converter, dom, numbers } from '../helper';
import Constructor from './section/constructor';

// type
import DocumentType from './section/documentType';

// services
import EventManager from './event/eventManager';
import History from './services/history';
import InstanceCheck from './services/instanceCheck';
import PluginManager from './services/pluginManager';
import FocusManager from './services/focusManager';
import CommandDispatcher from './services/commandDispatcher';
import ContextManager from './services/contextManager';
import OptionManager from './services/optionManager';
import UIManager from './services/uiManager';

// class injector
import { _getClassInjectorKeys } from '../editorInjector/_classes';

// classes
import Char from './class/char';
import Component from './class/component';
import Format from './class/format';
import HTML from './class/html';
import Inline from './class/inline';
import ListFormat from './class/listFormat';
import Menu from './class/menu';
import NodeTransform from './class/nodeTransform';
import Offset from './class/offset';
import Selection_ from './class/selection';
import Shortcuts from './class/shortcuts';
import Toolbar from './class/toolbar';
import Viewer from './class/viewer';

/**
 * @description Class instance keys that need circular reference cleanup in destroy().
 * @type {readonly string[]}
 */
const EDITOR_CLASS_KEYS = Object.freeze([..._getClassInjectorKeys()]);

/**
 * @description SunEditor class.
 */
class Editor {
	/**
	 * @constructor
	 * @description SunEditor constructor function.
	 * @param {Array<{target: Element, key: *, options: SunEditor.InitFrameOptions}>} multiTargets Target element
	 * @param {SunEditor.InitOptions} options options
	 */
	constructor(multiTargets, options) {
		const _d = multiTargets[0].target.ownerDocument || env._d;
		const _w = _d.defaultView || env._w;
		const product = Constructor(multiTargets, options);

		/**
		 * @description Frame root key array
		 * @type {Array<*>}
		 */
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
		 * @description Controllers carrier
		 * @type {HTMLElement}
		 */
		this.carrierWrapper = product.carrierWrapper;

		/**
		 * @description Events object, call by triggerEvent function
		 * @type {SunEditor.Event.Handlers}
		 */
		this.events = null;

		/**
		 * @description Call the event function by injecting self: this.
		 * @type {(eventName: string, ...args: *) => Promise<*>}
		 */
		this.triggerEvent = null;

		/**
		 * @description Default icons object
		 * @type {Object<string, string>}
		 */
		this.icons = product.icons;

		/**
		 * @description loaded language
		 * @type {Object<string, *>}
		 */
		this.lang = product.lang;

		/**
		 * @description Variables used internally in editor operation
		 * @type {SunEditor.Status}
		 */
		this.status = {
			hasFocus: false,
			tabSize: 4,
			indentSize: 25,
			codeIndentSize: 2,
			currentNodes: [],
			currentNodesMap: [],
			initViewportHeight: 0,
			currentViewportHeight: 0,
			onSelected: false,
			rootKey: product.rootId,
			isScrollable: (fc) => {
				fc ||= this.frameContext;
				const fo = fc.get('options');
				const height = fo.get('height');
				const maxHeight = fo.get('maxHeight');

				if (height !== 'auto') {
					return true;
				}

				if (!maxHeight) {
					return false;
				}

				// height === 'auto' && maxHeight
				return fc.get('wysiwyg').offsetHeight >= numbers.get(maxHeight);
			},
			_range: null,
			_onMousedown: false,
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
		 * @description The selection node (selection.getNode()) to which the effect was last applied
		 * @type {?Node}
		 */
		this.effectNode = null;

		// ------ services ------
		/** @description Context manager class @type {import('./services/contextManager').default} */
		this.contextManager = new ContextManager(this, product);
		/** @description Context option manager class @type {import('./services/optionManager').default} */
		this.optionManager = new OptionManager(this, product, options);
		/** @description iframe-safe instanceof check utility class @type {import('./services/instanceCheck').default} */
		this.instanceCheck = new InstanceCheck(this.frameContext);
		/** @description Plugin Manager */
		this.pluginManager = new PluginManager(this, product);
		/** @description Focus Manager */
		this.focusManager = new FocusManager(this);
		/** @description UI manager class instance @type {import('./services/uiManager').default} */
		this.uiManager = new UIManager(this);
		/** @description Command Dispatcher */
		this.commandDispatcher = new CommandDispatcher(this);
		/** @description History class instance @type {ReturnType<typeof import('./services/history').default>} */
		this.history = History(this);
		/** @description EventManager class instance @type {import('./event/eventManager').default} */
		this.eventManager = null;

		// ------ class ------
		/** @description Toolbar class instance @type {import('./class/toolbar').default} */
		this.toolbar = null;
		/** @description Sub-Toolbar class instance @type {?import('./class/toolbar').default} */
		this.subToolbar = null;
		/** @description Char class instance @type {import('./class/char').default} */
		this.char = null;
		/** @description Component class instance @type {import('./class/component').default} */
		this.component = null;
		/** @description Format class instance @type {import('./class/format').default} */
		this.format = null;
		/** @description HTML class instance @type {import('./class/html').default} */
		this.html = null;
		/** @description Inline format class instance @type {import('./class/inline').default} */
		this.inline = null;
		/** @description List format class instance @type {import('./class/listFormat').default} */
		this.listFormat = null;
		/** @description Menu class instance @type {import('./class/menu').default} */
		this.menu = null;
		/** @description NodeTransform class instance @type {import('./class/nodeTransform').default} */
		this.nodeTransform = null;
		/** @description Offset class instance @type {import('./class/offset').default} */
		this.offset = null;
		/** @description Selection class instance @type {import('./class/selection').default} */
		this.selection = null;
		/** @description Shortcuts class instance @type {import('./class/shortcuts').default} */
		this.shortcuts = null;
		/** @description Viewer class instance @type {import('./class/viewer').default} */
		this.viewer = null;

		/**
		 * @description Closest ShadowRoot to editor if found
		 * @type {ShadowRoot & { getSelection?: () => Selection }} - Chromium-based browsers (Chrome, Edge, etc.) has a getSelection method on the ShadowRoot
		 */
		this.shadowRoot = null;

		/**
		 * @description Variables for controlling blur events
		 * @type {boolean}
		 */
		this._preventBlur = false;

		/**
		 * @description Variables for controlling focus events
		 * @type {boolean}
		 */
		this._preventFocus = false;

		/**
		 * @description Variables for controlling selection change events
		 */
		this._preventSelection = false;

		// ------------------------------------------------------- internal properties -------------------------------------------------------

		/**
		 * @internal
		 * @description Copy format info
		 * - eventManager.__cacheStyleNodes copied
		 * @type {?Array<Node>}
		 */
		this._onCopyFormatInfo = null;

		/**
		 * @internal
		 * @description Copy format init method
		 * @type {?(...args: *) => *}
		 */
		this._onCopyFormatInitMethod = null;

		/**
		 * @internal
		 * @description If true, initialize all indexes of image, video information
		 * @type {boolean}
		 */
		this._componentsInfoInit = true;

		/**
		 * @internal
		 * @description If true, reset all indexes of image, video information
		 * @type {boolean}
		 */
		this._componentsInfoReset = false;

		/** ----- Create editor ------------------------------------------------------------ */
		try {
			this.#Create(options, product);
		} catch (e) {
			console.error('[SUNEDITOR:E_CREATE_FAIL] Failed to create editor instance.', e);
			throw e;
		}
	}

	/**
	 * @description Context
	 * @type {Map<*, SunEditor.FrameContext>}
	 */
	get frameRoots() {
		return this.contextManager.frameRoots;
	}

	/**
	 * @description Context
	 * @type {SunEditor.Context}
	 */
	get context() {
		return this.contextManager.context;
	}

	/**
	 * @description Options
	 * @type {SunEditor.Options}
	 */
	get options() {
		return this.optionManager.options;
	}

	/**
	 * @description Frame context
	 * @type {SunEditor.FrameContext}
	 */
	get frameContext() {
		return this.contextManager.frameContext;
	}

	/**
	 * @description Frame options
	 * @type {SunEditor.FrameOptions}
	 */
	get frameOptions() {
		return this.optionManager.frameOptions;
	}

	/**
	 * @description Plugins
	 * @type {Object<string, *>}
	 */
	get plugins() {
		return this.pluginManager.plugins;
	}

	/**
	 * @description Plugins array with "active" method.
	 * - "activeCommands" runs the "add" method when creating the editor.
	 * @type {Array<string>}
	 */
	get activeCommands() {
		return this.pluginManager.activeCommands;
	}

	/**
	 * @description Checks if the content of the editor is empty.
	 * - Display criteria for "placeholder".
	 * @param {?SunEditor.FrameContext} [fc] Frame context, if not present, currently selected frame context.
	 * @returns {boolean}
	 */
	isEmpty(fc) {
		const wysiwyg = (fc || this.frameContext).get('wysiwyg');
		return dom.check.isZeroWidth(wysiwyg.textContent) && !wysiwyg.querySelector(this.options.get('allowedEmptyTags')) && (wysiwyg.innerText.match(/\n/g) || '').length <= 1;
	}

	/**
	 * @description Add or reset option property (Editor is reloaded)
	 * @param {SunEditor.InitOptions} newOptions Options
	 */
	resetOptions(newOptions) {
		this.optionManager.reset(newOptions);

		this.effectNode = null;
		this.#setFrameInfo(this.frameRoots.get(this.status.rootKey));

		// plugin hook
		for (const plugin of Object.values(this.plugins)) {
			plugin.init?.();
		}
	}

	/**
	 * @description Change the current root index.
	 * @param {*} rootKey Root frame key.
	 */
	changeFrameContext(rootKey) {
		if (rootKey === this.status.rootKey) return;

		this.status.rootKey = rootKey;
		this.#setFrameInfo(this.frameRoots.get(rootKey));
		this.toolbar._resetSticky();
	}

	/**
	 * @description Destroy the suneditor
	 */
	destroy() {
		this.uiManager.destroy();
		this.commandDispatcher.destroy();
		this.pluginManager.destroy();
		this.history.destroy();

		/** remove event listeners */
		this.eventManager._removeAllEvents();

		/** destroy external library */
		if (this.options.get('codeMirror6Editor')) {
			this.options.get('codeMirror6Editor').destroy();
		}

		/** remove DOM elements */
		dom.utils.removeItem(this.carrierWrapper);
		dom.utils.removeItem(this.context.get('toolbar_wrapper'));
		dom.utils.removeItem(this.context.get('toolbar_sub_wrapper'));
		dom.utils.removeItem(this.context.get('statusbar_wrapper'));

		/** clear events */
		for (const k in this.events) {
			this.events[k] = null;
		}
		this.events = null;

		for (let i = 0; i < EDITOR_CLASS_KEYS.length; i++) {
			const key = EDITOR_CLASS_KEYS[i];
			const instance = this[key];
			if (instance) {
				instance._destroy?.();
				this[key] = null;
			}
		}

		/** clear status object */
		if (this.status) {
			this.status.currentNodes = null;
			this.status.currentNodesMap = null;
			this.status._range = null;
			this.status = null;
		}

		this.optionManager.destroy();
		this.contextManager.destroy();

		/** clear remaining references */
		this.carrierWrapper = null;
		this.history = null;
		this.focusManager = null;
		this.rootKeys = null;
		this.effectNode = null;
		this.shadowRoot = null;
		this._onCopyFormatInfo = null;
		this._onCopyFormatInitMethod = null;

		return null;
	}

	/**
	 * @description Set frameContext, frameOptions
	 * @param {SunEditor.FrameContext} rt Root target[key] FrameContext
	 */
	#setFrameInfo(rt) {
		this.contextManager.reset(rt);
		this.optionManager.resetFrame(rt.get('options'));
		this.uiManager.reset(rt);
	}

	/**
	 * @description Initializ editor
	 * @param {SunEditor.InitOptions} options Options
	 */
	#editorInit(options) {
		this.status.initViewportHeight = this._w.visualViewport.height;
		this.eventManager.__setViewportSize();

		this.contextManager.init();

		// initialize core and add event listeners
		this.#setFrameInfo(this.frameRoots.get(this.status.rootKey));
		this.#init(options);

		this.contextManager.applyToRoots((e) => {
			this.eventManager._addFrameEvents(e);
			this.#initWysiwygArea(e, e.get('options').get('value'));
			if (e.get('options').get('iframe') && e.get('options').get('height') === 'auto') {
				this.uiManager._emitResizeEvent(e, e.get('wysiwygFrame').offsetHeight, null);
			}
		});

		this.eventManager.__eventDoc = null;
		this._componentsInfoInit = false;
		this._componentsInfoReset = false;
		this.pluginManager.checkFileInfo(true);

		this._w.setTimeout(() => {
			// Check if instance was destroyed (e.g., in SSR with dynamic imports mistake)
			if (!this.context?.size()) {
				console.warn('[SUNEDITOR:E_INIT_FAIL] Editor instance was destroyed before initialization completed. Check if destroy() was called.');
				return;
			}

			// toolbar visibility
			this.context.get('toolbar_main').style.visibility = '';
			// roots
			this.contextManager.applyToRoots((e) => {
				// observer
				if (this.eventManager._wwFrameObserver) this.eventManager._wwFrameObserver.observe(e.get('wysiwygFrame'));
				if (this.eventManager._toolbarObserver) this.eventManager._toolbarObserver.observe(e.get('_toolbarShadow'));
				// resource state
				this.uiManager._syncFrameState(e);
			});

			// history reset
			this.history.reset();
			// plugin hook
			for (const plugin of Object.values(this.plugins)) {
				plugin.init?.();
			}
			// class init
			this.selection.__init();

			// user event
			this.triggerEvent('onload', {});
		}, 0);
	}

	/**
	 * @description Initializ wysiwyg area (Only called from core._init)
	 * @param {SunEditor.FrameContext} e frameContext
	 * @param {string} value initial html string
	 */
	#initWysiwygArea(e, value) {
		// set content
		e.get('wysiwyg').innerHTML =
			this.html.clean(typeof value === 'string' ? value : (/^TEXTAREA$/i.test(e.get('originElement').nodeName) ? e.get('originElement').value : e.get('originElement').innerHTML) || '', {
				forceFormat: true,
				whitelist: null,
				blacklist: null,
				_freeCodeViewMode: this.options.get('freeCodeViewMode'),
			}) || '<' + this.options.get('defaultLine') + '><br></' + this.options.get('defaultLine') + '>';

		// char counter
		if (e.has('charCounter')) e.get('charCounter').textContent = String(this.char.getLength());

		// document type init
		if (this.options.get('type') === 'document') {
			e.set('documentType', new DocumentType(this, e));
			if (e.get('documentType').useHeader) {
				e.set('documentType_use_header', true);
			}
			if (e.get('documentType').usePage) {
				e.set('documentType_use_page', true);
				e.get('documentTypePageMirror').innerHTML = e.get('wysiwyg').innerHTML;
			}
		}
	}

	/**
	 * @description Initializ core variable
	 * @param {SunEditor.InitOptions} options Options
	 */
	#init(options) {
		this.pluginManager.init(options);
		this.commandDispatcher._initCommandButtons();
		this.shortcuts._registerCustomShortcuts();
		this.uiManager.init();
	}

	/**
	 * @description Configures the document properties of an iframe editor.
	 * @param {HTMLIFrameElement} frame - The editor iframe.
	 * @param {Map<string, *>} originOptions - The original options.
	 * @param {SunEditor.FrameOptions} targetOptions - The new options.
	 */
	#setIframeDocument(frame, originOptions, targetOptions) {
		frame.contentDocument.documentElement.className = 'sun-editor';
		frame.contentDocument.head.innerHTML =
			'<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">' +
			converter._setIframeStyleLinks(targetOptions.get('iframe_cssFileName')) +
			converter._setAutoHeightStyle(targetOptions.get('height'));
		frame.contentDocument.body.className = originOptions.get('_editableClass');
		frame.contentDocument.body.setAttribute('contenteditable', 'true');
	}

	/**
	 * @description Registers and initializes editor classes.
	 * @param {import('./section/constructor').ConstructorReturnType} product - The initial product object.
	 */
	#registerClass(product) {
		// use events
		this.events = this.options.get('events') || {};
		this.triggerEvent = async (eventName, eventData) => {
			// [iframe] wysiwyg is disabled, the event is not called.
			if (dom.check.isNonEditable(eventData?.frameContext?.get('wysiwyg'))) return false;
			const eventHandler = this.events[eventName];
			if (typeof eventHandler === 'function') {
				return await eventHandler({ editor: this, ...eventData });
			}
			return env.NO_EVENT;
		};

		// eventManager
		this.eventManager = new EventManager(this);

		// ----- [core classes : editorInector/_classes] -------------------------------------
		this.offset = new Offset(this);
		this.shortcuts = new Shortcuts(this);
		this.toolbar = new Toolbar(this, { keyName: 'toolbar', balloon: this.isBalloon, balloonAlways: this.isBalloonAlways, inline: this.isInline, res: product.responsiveButtons });
		if (this.options.has('_subMode')) {
			this.subToolbar = new Toolbar(this, {
				keyName: 'toolbar_sub',
				balloon: this.isSubBalloon,
				balloonAlways: this.isSubBalloonAlways,
				inline: false,
				res: product.responsiveButtons_sub,
			});
		}
		this.selection = new Selection_(this);
		this.html = new HTML(this);
		this.nodeTransform = new NodeTransform(this);
		this.component = new Component(this);
		this.format = new Format(this);
		this.inline = new Inline(this);
		this.listFormat = new ListFormat(this);
		this.menu = new Menu(this);
		this.char = new Char(this);
		this.viewer = new Viewer(this);
	}

	/**
	 * @description Creates the editor instance and initializes components.
	 * @param {SunEditor.InitOptions} originOptions - The initial editor options.
	 * @param {import('./section/constructor').ConstructorReturnType} product - The initial product object.
	 * @returns {Promise<void>}
	 */
	async #Create(originOptions, product) {
		// set modes
		this.isInline = /inline/i.test(this.options.get('mode'));
		this.isBalloon = /balloon/i.test(this.options.get('mode'));
		this.isBalloonAlways = /balloon-always/i.test(this.options.get('mode'));
		this.isClassic = /classic/i.test(this.options.get('mode'));
		// set subToolbar modes
		this.isSubBalloon = /balloon/i.test(this.options.get('_subMode'));
		this.isSubBalloonAlways = /balloon-always/i.test(this.options.get('_subMode'));

		// register class
		this.#registerClass(product);

		// common events
		this.eventManager._addCommonEvents();

		// init
		const iframePromises = [];
		this.contextManager.applyToRoots((e) => {
			const o = e.get('originElement');
			const t = e.get('topArea');
			o.style.display = 'none';
			t.style.display = 'block';
			o.parentNode.insertBefore(t, o.nextElementSibling);

			if (e.get('options').get('iframe')) {
				const iframeLoaded = new Promise((resolve) => {
					this.eventManager.addEvent(e.get('wysiwygFrame'), 'load', ({ target }) => {
						this.#setIframeDocument(target, this.options, e.get('options'));
						resolve();
					});
				});
				iframePromises.push(iframeLoaded);
			}
		});

		this.contextManager.applyToRoots((e) => {
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

		this.#editorInit(originOptions);
	}
}

export default Editor;
