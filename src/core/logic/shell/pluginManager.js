import { dom } from '../../../helper';
import { UpdateButton } from '../../section/constructor';

/**
 * @typedef {Object} PluginEventParam
 * @property {SunEditor.FrameContext} frameContext
 * @property {Event} event
 * @property {string} [data]
 * @property {Node} [line]
 * @property {Range} [range]
 * @property {File} [file]
 * @property {Document} [doc]
 */

/**
 * @typedef {(element: Node | null) => * } ComponentChecker
 */

/**
 * @description Manages plugin registration and state.
 * Extracts "plugin" related responsibilities from the monolithic Editor class.
 */
class PluginManager {
	#kernel;
	#$;

	#plugins;
	#contextProvider;
	#options;

	#pluginCallButtons;
	#pluginCallButtons_sub;

	/**
	 * @description Properties for managing files in the "FileManager" module
	 * @type {Array<*>}
	 */
	#fileInfoPluginsCheck = [];

	/**
	 * @description Properties for managing files in the "FileManager" module
	 * @type {Array<*>}
	 */
	#fileInfoPluginsReset = [];

	/**
	 * @description Variables for file component management
	 * @type {Object<string, *>}
	 */
	#fileInfo = {
		tags: null,
		regExp: null,
		pluginRegExp: null,
		pluginMap: null,
	};

	/**
	 * @description Variables for managing the components
	 * @type {Array<ComponentChecker>}
	 */
	#componentCheckers = [];

	/**
	 * @internal
	 * @description plugin retainFormat info Map()
	 * @type {Map<string, { key: string, method: (...args: *) => * }>}
	 */
	#retainFormatCheckers = new Map();

	/**
	 * @description Plugin call event map
	 * @type {Map<string, Array<((...args: *) => *) & { index: number }>>}
	 */
	#onPluginEvents = new Map([
		['onMouseMove', []],
		['onMouseLeave', []],
		['onMouseDown', []],
		['onMouseUp', []],
		['onScroll', []],
		['onClick', []],
		['onBeforeInput', []],
		['onInput', []],
		['onKeyDown', []],
		['onKeyUp', []],
		['onFocus', []],
		['onBlur', []],
		['onPaste', []],
		['onFilePasteAndDrop', []],
	]);

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 * @param {import('../../section/constructor').ConstructorReturnType} [product] - Initial editor context
	 */
	constructor(kernel, product) {
		this.#kernel = kernel;
		this.#$ = kernel.$;

		this.#plugins = product.plugins || {};
		this.#contextProvider = this.#$.contextProvider;
		this.#options = this.#$.options;

		/**
		 * @description List of buttons to run plugins in the toolbar
		 * @type {Object<string, Array<HTMLElement>>}
		 */
		this.#pluginCallButtons = product.pluginCallButtons;

		/**
		 * @description List of buttons to run plugins in the Sub-Toolbar
		 * @type {Object<string, Array<HTMLElement>>|[]}
		 */
		this.#pluginCallButtons_sub = product.pluginCallButtons_sub;
	}

	/**
	 * @description Returns the plugins object.
	 * @returns {Object<string, *>}
	 */
	get plugins() {
		return this.#plugins;
	}

	/**
	 * @description Returns the file component management object.
	 * @returns {Object<string, *>}
	 */
	get fileInfo() {
		return this.#fileInfo;
	}

	/**
	 * @description Finds component information for the given element.
	 * @param {Node} element The DOM element to check.
	 * @returns {SunEditor.ComponentInfo|null}
	 */
	findComponentInfo(element) {
		for (const checker of this.#componentCheckers) {
			const result = checker(element);
			if (result) return result;
		}
		return null;
	}

	/**
	 * @description Apply retain format rules from plugins to the parsed DOM
	 * @param {DocumentFragment|Document} domParser
	 */
	applyRetainFormat(domParser) {
		let retainFilter;
		if ((retainFilter = this.#options.get('__pluginRetainFilter'))) {
			this.#retainFormatCheckers.forEach((plugin, query) => {
				const infoLst = domParser.querySelectorAll(query);
				for (let i = 0, len = infoLst.length; i < len; i++) {
					if (retainFilter === true || retainFilter[plugin.key] !== false) plugin.method(infoLst[i]);
				}
			});
		}
	}

	/**
	 * @description Dispatches an event to all registered plugin handlers synchronously.
	 * @param {string} name The event name (e.g., 'onMouseMove', 'onFocus')
	 * @param {PluginEventParam} e The event payload
	 * @returns {boolean|undefined} Returns false if any handler cancels the event
	 */
	emitEvent(name, e) {
		const eventPlugins = this.#onPluginEvents.get(name);
		for (let i = 0, r; i < eventPlugins.length; i++) {
			r = eventPlugins[i](e);
			if (typeof r === 'boolean') return r;
		}
	}

	/**
	 * @description Dispatches an event to all registered plugin handlers asynchronously.
	 * @param {string} name The event name (e.g., 'onKeyDown', 'onPaste')
	 * @param {PluginEventParam} e The event payload
	 * @returns {Promise<boolean|undefined>} Returns false if any handler cancels the event
	 */
	async emitEventAsync(name, e) {
		const eventPlugins = this.#onPluginEvents.get(name);
		for (let i = 0, r; i < eventPlugins.length; i++) {
			r = await eventPlugins[i](e);
			if (typeof r === 'boolean') return r;
		}
	}

	/**
	 * @description Check the components such as image and video and modify them according to the format.
	 * @param {boolean} loaded If true, the component is loaded.
	 */
	checkFileInfo(loaded) {
		for (let i = 0, len = this.#fileInfoPluginsCheck.length; i < len; i++) {
			this.#fileInfoPluginsCheck[i](loaded);
		}
	}

	/**
	 * @description Initialize the information of the components.
	 */
	resetFileInfo() {
		for (let i = 0, len = this.#fileInfoPluginsReset.length; i < len; i++) {
			this.#fileInfoPluginsReset[i]();
		}
	}

	/**
	 * @description If the plugin is not added, add the plugin and call the 'add' function.
	 * - If the plugin is added call callBack function.
	 * @param {string} pluginName The name of the plugin to call
	 * @param {?Array<HTMLElement>} targets Plugin target button
	 * @param {?Object<string, *>} pluginOptions Plugin's options
	 */
	register(pluginName, targets, pluginOptions) {
		let plugin = this.#plugins[pluginName];
		if (!plugin) {
			throw Error(`[SUNEDITOR.registerPlugin.fail] The called plugin does not exist or is in an invalid format. (pluginName: "${pluginName}")`);
		} else if (typeof this.#plugins[pluginName] === 'function') {
			plugin = this.#plugins[pluginName] = new this.#plugins[pluginName](this.#kernel, pluginOptions || {});
		}

		if (targets) {
			const { icons, lang } = this.#contextProvider;
			for (let i = 0, len = targets.length; i < len; i++) {
				UpdateButton(targets[i], plugin, icons, lang);
			}

			if (!this.#$.commandDispatcher.activeCommands.includes(pluginName) && typeof this.#plugins[pluginName].active === 'function') {
				this.#$.commandDispatcher.activeCommands.push(pluginName);
			}
		}
	}

	/**
	 * @description Initialize the plugin manager and register plugins.
	 * @param {SunEditor.InitOptions} options
	 */
	init(options) {
		this.#fileInfo.tags = [];
		this.#fileInfo.pluginMap = {};
		this.#fileInfo.tagAttrs = {};

		const plugins = this.#plugins;
		const filePluginRegExp = [];
		let plugin;
		for (const key in plugins) {
			this.register(key, this.#pluginCallButtons[key], options[key]);
			this.register(key, this.#pluginCallButtons_sub[key], options[key]);
			plugin = this.#plugins[key];

			// Filemanager
			if (typeof plugin.__fileManagement === 'object') {
				const fm = plugin.__fileManagement;
				this.#fileInfoPluginsCheck.push(fm._checkInfo.bind(fm));
				this.#fileInfoPluginsReset.push(fm._resetInfo.bind(fm));
				if (Array.isArray(fm.tagNames)) {
					const tagNames = fm.tagNames;
					this.#fileInfo.tags = this.#fileInfo.tags.concat(tagNames);
					filePluginRegExp.push(key);
					for (let tag = 0, tLen = tagNames.length, t; tag < tLen; tag++) {
						t = tagNames[tag].toLowerCase();
						this.#fileInfo.pluginMap[t] = key;
						if (fm.tagAttrs) {
							this.#fileInfo.tagAttrs[t] = fm.tagAttrs;
						}
					}
				}
			}

			// Not file component
			if (typeof plugin.constructor.component === 'function') {
				this.#componentCheckers.push(
					function (launcher, element) {
						if (!element || !(element = launcher.component?.(element))) return null;
						return {
							target: element,
							pluginName: launcher.key,
							options: launcher.options,
						};
					}.bind(null, plugin.constructor),
				);
			}

			// plugin event
			const pluginOptions = plugin.constructor.options || {};
			this.#onPluginEvents.forEach((v, k) => {
				if (typeof plugin[k] === 'function') {
					const f = plugin[k].bind(plugin);
					f.index = pluginOptions[`eventIndex_${k}`] || pluginOptions.eventIndex || 0;
					v.push(f);
				}
			});

			// plugin maintain
			if (plugin.retainFormat) {
				const info = plugin.retainFormat();
				this.#retainFormatCheckers.set(info.query, { key: plugin.constructor.key, method: info.method });
			}
		}

		for (const v of this.#onPluginEvents.values()) {
			v.sort((a, b) => a.index - b.index);
		}

		if (this.#options.get('buttons').has('pageBreak') || this.#options.get('buttons_sub')?.has('pageBreak')) {
			this.#componentCheckers.push(
				function (focusManager, history, element) {
					if (!element || !dom.utils.hasClass(element, 'se-page-break')) return null;
					return {
						target: element,
						launcher: {
							destroy: (target) => {
								const focusEl = target.previousElementSibling || target.nextElementSibling;
								dom.utils.removeItem(target);
								// focus
								focusManager.focusEdge(focusEl);
								history.push(false);
							},
						},
					};
				}.bind(null, this.#$.focusManager, this.#$.history),
			);
		}

		this.#fileInfo.regExp = new RegExp(`^(${this.#fileInfo.tags.join('|') || '\\^'})$`, 'i');
		this.#fileInfo.pluginRegExp = new RegExp(`^(${filePluginRegExp.length === 0 ? '\\^' : filePluginRegExp.join('|')})$`, 'i');

		this.#pluginCallButtons = null;
		this.#pluginCallButtons_sub = null;
	}

	/**
	 * @description Get a specific plugin instance
	 * @param {string} name
	 * @returns {*}
	 */
	get(name) {
		return this.#plugins[name];
	}

	/**
	 * @description Destroy the plugin manager
	 */
	_destroy() {
		/** destroy plugins first (they may use editor references) */
		for (const k in this.#plugins) {
			const p = this.#plugins[k];
			p._destroy?.();
			// break circular reference: plugin.editor
			p.editor = null;
		}

		this.#plugins = null;
		this.#fileInfo = null;
		this.#componentCheckers = null;
		this.#onPluginEvents?.clear();
		this.#retainFormatCheckers?.clear();
	}
}

export default PluginManager;
