import { dom, converter } from '../../helper';
import { InitOptions, CreateStatusbar } from '../section/constructor';
import { OPTION_FRAME_FIXED_FLAG, OPTION_FIXED_FLAG } from '../schema/options';
import { UpdateStatusbarContext } from '../schema/frameContext';

/**
 * @typedef {import('../schema/options').ProcessedBaseOptions} ConfigAllBaseOptions
 * @typedef {import('../schema/options').ProcessedFrameOptions} ConfigAllFrameOptions
 */

/**
 * @typedef {Object} BaseOptionsMap
 * - A Map containing all processed editor base options.
 * - This Map contains all keys from {@link ConfigAllBaseOptions}, where:
 * - Keys are option names (string)
 * - Values depend on the specific option (see {@link ConfigAllBaseOptions} for details)
 *
 * @property {<K extends keyof ConfigAllBaseOptions>(k: K) => ConfigAllBaseOptions[K]} get - Retrieves the value of a specific option.
 * @property {<K extends keyof ConfigAllBaseOptions>(k: K, v: ConfigAllBaseOptions[K]) => void} set - Sets the value of a specific option.
 * @property {<K extends keyof ConfigAllBaseOptions>(k: K) => boolean} has - Checks if a specific option exists.
 * @property {() => Object<keyof ConfigAllBaseOptions, *>} getAll - Retrieves all options as an object.
 * @property {(options: Map<*, *>) => void} setMany - Sets multiple options at once.
 * @property {(newMap: SunEditor.InitOptions) => void} reset - Replaces all options with a new Map.
 * @property {() => number} size - Get option size
 * @property {() => void} clear - Clears all stored options.
 */

/**
 * @typedef {Object} FrameOptionsMap
 * - A Map containing all processed frame-level options.
 * - This Map contains all keys from {@link ConfigAllFrameOptions}, where:
 * - Keys are option names (string)
 * - Values depend on the specific option (see {@link ConfigAllFrameOptions} for details)
 *
 * @property {<K extends keyof ConfigAllFrameOptions>(k: K) => ConfigAllFrameOptions[K]} get - Retrieves the value of a specific option.
 * @property {<K extends keyof ConfigAllFrameOptions>(k: K, v: ConfigAllFrameOptions[K]) => void} set - Sets the value of a specific option.
 * @property {<K extends keyof ConfigAllFrameOptions>(k: K) => boolean} has - Checks if a specific option exists.
 * @property {() => Object<keyof ConfigAllFrameOptions, *>} getAll - Retrieves all options as an object.
 * @property {(options: Map<*, *>) => void} setMany - Sets multiple options at once.
 * @property {(newMap: SunEditor.FrameOptions) => void} reset - Replaces all options with a new Map.
 * @property {() => number} size - Get option size
 * @property {() => void} clear - Clears all stored options.
 */

/**
 * @description Provides Map-based access to editor options (base and per-frame).
 */
export default class OptionProvider {
	#kernel;

	/**
	 * @description Origin options
	 * @type {SunEditor.InitOptions}
	 */
	#originOptions;

	/**
	 * @description Utility object that manages the editor's runtime options.
	 * Provides methods to get, set, and inspect internal editor options.
	 * @type {BaseOptionsMap}
	 */
	#optionsMap;

	/**
	 * @description Utility object that manages the editor's runtime [frame] options.
	 * Provides methods to get, set, and inspect internal [frame] options.
	 * @type {FrameOptionsMap}
	 */
	#frameOptionsMap;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 * @param {import('../section/constructor').ConstructorReturnType} product
	 */
	constructor(kernel, product, options) {
		this.#kernel = kernel;

		this.#originOptions = options;

		this.#optionsMap = this.#CreateOptionsMap({ value: product.options });
		this.#frameOptionsMap = this.#CreateFrameOptionsMap({ value: new Map() });
	}

	/**
	 * @return {BaseOptionsMap}
	 */
	get options() {
		return this.#optionsMap;
	}

	get frameOptions() {
		return this.#frameOptionsMap;
	}

	/**
	 * @description Add or reset option property (Editor is reloaded)
	 * @param {SunEditor.InitOptions} newOptions Options
	 */
	reset(newOptions) {
		const { $ } = this.#kernel;

		// use kernel
		const frameRoots = $.frameRoots;
		const context = $.context;
		const eventManager = $.eventManager;
		const format = $.format;
		const html = $.html;
		const char = $.char;
		const viewer = $.viewer;
		const plugins = $.plugins;
		const history = $.history;
		const ui = $.ui;

		const eventOrchestrator = this.#kernel._eventOrchestrator;

		viewer.codeView(false);
		viewer.showBlocks(false);

		const rootDiff = new Map();
		const newRoots = [];
		const newRootKeys = new Map();

		// frame roots
		const nRoot = {};
		for (const k in newOptions) {
			if (OPTION_FRAME_FIXED_FLAG[k] === undefined) continue;
			nRoot[k] = newOptions[k];
			delete newOptions[k];
		}
		for (const rootKey of frameRoots.keys()) {
			newOptions[rootKey || ''] = { ...nRoot, ...newOptions[rootKey || ''] };
		}

		// check reoption validation
		const newOptionKeys = Object.keys(newOptions);
		this.#CheckResetKeys(newOptionKeys, plugins, '');
		if (newOptionKeys.length === 0) return;

		if (frameRoots.size === 1) {
			newOptionKeys.unshift(null);
		}

		// option merge
		const _originOptions = [this.#originOptions, newOptions].reduce((init, option) => {
			for (const key in option) {
				if (frameRoots.has(key || null)) {
					this.#RestoreFrameOptions(key, option, frameRoots, rootDiff, newRootKeys, newRoots);
				} else {
					init[key] = option[key];
				}
			}
			return init;
		}, /** @type {SunEditor.InitOptions} */ ({}));

		// init options
		const options = this.#optionsMap;
		const newO = InitOptions(_originOptions, newRoots, plugins);

		const newOptionMap = newO.o;
		const newFrameMap = newO.frameMap;
		/** --------- [root start] --------- */
		for (let i = 0, len = newOptionKeys.length, k; i < len; i++) {
			k = /** @type {keyof ConfigAllBaseOptions} */ (newOptionKeys[i] || null);

			if (newRootKeys.has(k)) {
				const diff = rootDiff.get(k);
				const fc = frameRoots.get(k);
				const originOptions = fc.get('options');
				const newRootOptions = newFrameMap.get(k);

				// --- set options : fc ---
				fc.set('options', newRootOptions);

				// statusbar-changed
				if (diff.has('statusbar-changed')) {
					// statusbar
					dom.utils.removeItem(fc.get('statusbar'));
					if (newRootOptions.get('statusbar')) {
						const statusbar = CreateStatusbar(newRootOptions, null).statusbar;
						fc.get('container').appendChild(statusbar);
						UpdateStatusbarContext(statusbar, fc);
						eventOrchestrator.__addStatusbarEvent(fc, newRootOptions);
					} else {
						eventManager.removeEvent(originOptions.get('__statusbarEvent'));
						newRootOptions.set('__statusbarEvent', null);
						UpdateStatusbarContext(null, fc);
					}
					// charCounter
					if (fc.get('statusbar')) {
						char.display(fc);
					}
				}

				// iframe's options
				if (diff.has('iframe_attributes')) {
					const frame = fc.get('wysiwygFrame');
					const originAttr = originOptions.get('iframe_attributes');
					const newAttr = newRootOptions.get('iframe_attributes');
					for (const origin_k in originAttr) frame.removeAttribute(origin_k);
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

				if (diff.has('placeholder')) {
					fc.get('placeholder').textContent = newRootOptions.get('placeholder');
				}

				// frame styles
				ui.setEditorStyle(newRootOptions.get('editorStyle'), fc);

				// frame attributes
				const frame = fc.get('wysiwyg');
				const originAttr = originOptions.get('editableFrameAttributes');
				const newAttr = newRootOptions.get('editableFrameAttributes');
				for (const origin_k in originAttr) frame.removeAttribute(origin_k);
				for (const new_k in newAttr) frame.setAttribute(new_k, newAttr[new_k]);

				continue;
			}
			/** --------- [root end] --------- */

			/** Options that require a function call */
			switch (k) {
				case 'theme': {
					ui.setTheme(newOptionMap.get('theme'));
					break;
				}
				case 'events': {
					const events = newOptionMap.get('events');
					for (const name in events) {
						eventManager.events[name] = events[name];
					}
					break;
				}
				case 'autoStyleify': {
					html.__resetAutoStyleify(newOptionMap.get('autoStyleify'));
					break;
				}
				case 'textDirection': {
					ui.setDir(newOptionMap.get('textDirection') === 'rtl' ? 'rtl' : 'ltr');
					break;
				}
				case 'historyStackDelayTime': {
					history.resetDelayTime(newOptionMap.get('historyStackDelayTime'));
					break;
				}
				case 'defaultLineBreakFormat': {
					format.__resetBrLineBreak(newOptionMap.get('defaultLineBreakFormat'));
				}
			}
		}

		//  --- set options ---
		options.setMany(newOptionMap);

		/** apply options */
		// _origin
		this.#originOptions = _originOptions;

		// --- [toolbar] ---
		const toolbar = context.get('toolbar_main');
		// width
		if (/inline|balloon/i.test(options.get('mode')) && newOptionKeys.includes('toolbar_width')) {
			toolbar.style.width = options.get('toolbar_width');
		}
		// hide
		if (options.get('toolbar_hide')) {
			toolbar.style.display = 'none';
		} else {
			toolbar.style.display = '';
		}
		// shortcuts hint
		if (options.get('shortcutsHint')) {
			dom.utils.removeClass(toolbar, 'se-shortcut-hide');
		} else {
			dom.utils.addClass(toolbar, 'se-shortcut-hide');
		}
	}

	/**
	 * @description Add or reset frame option property (Editor is reloaded)
	 * @param {SunEditor.FrameOptions} newOptions Options
	 */
	resetFrame(newOptions) {
		this.#frameOptionsMap.reset(newOptions);
	}

	#RestoreFrameOptions(key, option, frameRoots, rootDiff, newRootKeys, newRoots) {
		const nro = option[key];
		const newKeys = Object.keys(nro);
		this.#CheckResetKeys(newKeys, null, key + '.');
		if (newKeys.length === 0) return false;

		const rootKey = key || null;
		rootDiff.set(rootKey, new Map());

		const o = frameRoots.get(rootKey).get('options').get('_origin');
		const no = {};
		const hasOwn = Object.prototype.hasOwnProperty;
		for (const rk in nro) {
			if (!hasOwn.call(OPTION_FRAME_FIXED_FLAG, rk)) continue;
			const roV = nro[rk];
			if (!newKeys.includes(rk) || o[rk] === roV) continue;
			rootDiff.get(rootKey).set(this.#GetResetDiffKey(rk), true);
			no[rk] = roV;
		}

		const newO = { ...o, ...no };
		newRootKeys.set(rootKey, new Map(Object.entries(newO)));
		newRoots.push({ key: rootKey, options: newO });
	}

	#GetResetDiffKey(key) {
		if (/^statusbar|^charCounter/.test(key)) return 'statusbar-changed';
		return key;
	}

	#CheckResetKeys(keys, plugins, root) {
		for (let i = 0, len = keys.length, k; i < len; i++) {
			k = keys[i];
			if (OPTION_FIXED_FLAG[k] === 'fixed' || OPTION_FRAME_FIXED_FLAG[k] === 'fixed' || (plugins && plugins[k])) {
				console.warn(`[SUNEDITOR.warn.resetOptions] The "[${root + k}]" option cannot be changed after the editor is created.`);
				keys.splice(i--, 1);
				len--;
			}
		}
	}

	/**
	 * @description Creates a utility wrapper for editor base options.
	 * - Provides get, set, has, getAll, and setMany methods with internal Map support.
	 * @param {*} _options - Origin options object
	 * @returns {BaseOptionsMap}
	 */
	#CreateOptionsMap(_options) {
		let store = _options.value;

		return {
			/**
			 * @template {keyof ConfigAllBaseOptions} K
			 * @param {K} k
			 * @returns {ConfigAllBaseOptions[K]}
			 */
			get(k) {
				return store.get(k);
			},
			/**
			 * @template {keyof ConfigAllBaseOptions} K
			 * @param {K} k
			 * @param {ConfigAllBaseOptions[K]} v
			 */
			set(k, v) {
				return store.set(k, v);
			},
			/**
			 * @template {keyof ConfigAllBaseOptions} K
			 * @param {K} k
			 * @returns {boolean}
			 */
			has(k) {
				return store.has(k);
			},
			getAll() {
				return Object.fromEntries(store.entries());
			},
			/** @param {Map<*, *>} obj */
			setMany(obj) {
				obj.forEach((v, k) => store.set(k, v));
			},
			/** @param {SunEditor.InitOptions} newMap */
			reset(newMap) {
				store = _options.value = newMap;
			},
			size() {
				return store.size;
			},
			clear() {
				store.clear();
			},
		};
	}

	/**
	 * @description Creates a utility wrapper for editor frame options.
	 * Provides get, set, has, getAll, and setMany methods with internal Map support.
	 * @param {*} _options - Origin options object
	 * @returns {FrameOptionsMap}
	 */
	#CreateFrameOptionsMap(_options) {
		let store = _options.value;

		return {
			/**
			 * @template {keyof ConfigAllFrameOptions} K
			 * @param {K} k
			 * @returns {ConfigAllFrameOptions[K]}
			 */
			get(k) {
				return store.get(k);
			},
			/**
			 * @template {keyof ConfigAllFrameOptions} K
			 * @param {K} k
			 * @param {ConfigAllFrameOptions[K]} v
			 */
			set(k, v) {
				return store.set(k, v);
			},
			/**
			 * @template {keyof ConfigAllFrameOptions} K
			 * @param {K} k
			 * @returns {boolean}
			 */
			has(k) {
				return store.has(k);
			},
			getAll() {
				return Object.fromEntries(store.entries());
			},
			/** @param {Map<*, *>} obj */
			setMany(obj) {
				obj.forEach((v, k) => store.set(k, v));
			},
			/** @param {SunEditor.FrameOptions} newMap */
			reset(newMap) {
				store = _options.value = newMap;
			},
			size() {
				return store.size;
			},
			clear() {
				store.clear();
			},
		};
	}

	_destroy() {
		this.#originOptions = null;
		this.#optionsMap.clear();
		this.#frameOptionsMap.clear();
	}
}
