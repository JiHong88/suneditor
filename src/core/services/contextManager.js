import { dom } from '../../helper';

/**
 * @typedef {import('../config/frameContext').FrameContextStore} ConfigFrameContextStore
 * @typedef {import('../config/context').ContextStore} ConfigContextStore
 */

/**
 * @typedef {Object} ContextMap
 * @property {(k: keyof ConfigContextStore) => HTMLElement|null} get - Get a DOM element from the context by key.
 * @property {(k: keyof ConfigContextStore, v: HTMLElement) => void} set - Set a DOM element in the context by key.
 * @property {(k: keyof ConfigContextStore) => boolean} has - Check if a key exists in the context.
 * @property {(k: keyof ConfigContextStore) => boolean} delete - Delete a key from the context.
 * @property {() => Object<keyof ConfigContextStore, HTMLElement|null>} [getAll] - Get all DOM elements in the context as an object.
 * @property {() => number} size - Get context size
 * @property {() => void} clear - Clear all elements in the context.
 */

/**
 * @typedef {Object} FrameContextMap
 * @property {<K extends keyof ConfigFrameContextStore>(k: K) => ConfigFrameContextStore[K]} get - Get a DOM element from the context by key.
 * @property {<K extends keyof ConfigFrameContextStore>(k: K, v: ConfigFrameContextStore[K]) => void} set - Set a DOM element in the context by key.
 * @property {<K extends keyof ConfigFrameContextStore>(k: K) => boolean} has - Check if a key exists in the context.
 * @property {<K extends keyof ConfigFrameContextStore>(k: K) => boolean} delete - Delete a key from the context.
 * @property {() => Object<keyof ConfigFrameContextStore, *>} [getAll] - Get all DOM elements in the context as an object.
 * @property {(newMap: *) => void} [reset] - Reset the context with a new Map.
 * @property {() => number} size - Get context size
 * @property {() => void} clear - Clear all elements in the context.
 */

export default class ContextManager {
	#editor;

	/**
	 * @description Frame root map
	 * @type {Map<*, SunEditor.FrameContext>}
	 */
	#frameRoots;

	/**
	 * @description Utility object that manages the editor's runtime context.
	 * Provides methods to get, set, and inspect internal context.
	 * @type {ContextMap}
	 */
	#contextMap;

	/**
	 * @description Utility object that manages the editor's runtime [frame] context.
	 * Provides methods to get, set, and inspect internal context.
	 * @type {FrameContextMap}
	 */
	#frameContextMap;

	/**
	 * @constructor
	 * @param {SunEditor.Instance} editor
	 */
	constructor(editor, product) {
		this.#editor = editor;

		this.#frameRoots = product.frameRoots;
		this.#contextMap = this.#CreateContextMap(product.context);
		this.#frameContextMap = this.#CreateFrameContextMap({ value: new Map() });
	}

	get frameRoots() {
		return this.#frameRoots;
	}

	get context() {
		return this.#contextMap;
	}

	get frameContext() {
		return this.#frameContextMap;
	}

	init() {
		this.applyToRoots((e) => {
			this.#setEditorParams(e);
		});
	}

	/**
	 * @param {SunEditor.FrameContext} rt Root target[key] FrameContext
	 */
	reset(rt) {
		this.#frameContextMap.reset(rt);
	}

	/**
	 * @description Execute a function by traversing all root targets.
	 * @param {(...args: *) => *} f Function
	 */
	applyToRoots(f) {
		this.#frameRoots.forEach(f);
	}

	/**
	 * @description Set the FrameContext parameters and options
	 * @param {SunEditor.FrameContext} e - Frame context object
	 */
	#setEditorParams(e) {
		const frameOptions = e.get('options');
		const _w = this.#editor._w;

		e.set('wwComputedStyle', _w.getComputedStyle(e.get('wysiwyg')));

		if (!frameOptions.get('iframe') && typeof ShadowRoot === 'function') {
			let child = e.get('wysiwygFrame');
			while (child) {
				if (child.shadowRoot) {
					this.#editor.shadowRoot = child.shadowRoot;
					break;
				} else if (child instanceof ShadowRoot) {
					this.#editor.shadowRoot = child;
					break;
				}
				child = /** @type {SunEditor.WysiwygFrame} */ (child.parentNode);
			}
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
			e.set('_wd', this.#editor._d);
		}

		// wisywig attributes
		const attr = frameOptions.get('editableFrameAttributes');
		for (const k in attr) {
			e.get('wysiwyg').setAttribute(k, attr[k]);
		}
	}

	/**
	 * @description Creates a utility wrapper for editor base options.
	 * - Provides get, set, has, getAll, and setMany methods with internal Map support.
	 * @param {Map} _context - Origin options object
	 * @returns {ContextMap}
	 */
	#CreateContextMap(_context) {
		const store = _context;

		return {
			get(k) {
				return store.get(k);
			},
			set(k, v) {
				return store.set(k, v);
			},
			has(k) {
				return store.has(k);
			},
			delete(k) {
				return store.delete(k);
			},
			getAll() {
				return Object.fromEntries(store.entries());
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
	 * @description Creates a utility wrapper for editor base options.
	 * - Provides get, set, has, getAll, and setMany methods with internal Map support.
	 * @param {{value: Map}} _frameContext - The editor instance
	 * @returns {FrameContextMap}
	 */
	#CreateFrameContextMap(_frameContext) {
		let store = _frameContext.value;

		return {
			/**
			 * @template {keyof ConfigFrameContextStore} K
			 * @param {K} k
			 * @returns {ConfigFrameContextStore[K]}
			 */
			get(k) {
				return store.get(k);
			},
			/**
			 * @template {keyof ConfigFrameContextStore} K
			 * @param {K} k
			 * @param {ConfigFrameContextStore[K]} v
			 */
			set(k, v) {
				return store.set(k, v);
			},
			/**
			 * @template {keyof ConfigFrameContextStore} K
			 * @param {K} k
			 * @returns {boolean}
			 */
			has(k) {
				return store.has(k);
			},
			/**
			 * @template {keyof ConfigFrameContextStore} K
			 * @param {K} k
			 * @returns {boolean}
			 */
			delete(k) {
				return store.delete(k);
			},
			getAll() {
				return Object.fromEntries(store.entries());
			},
			/** @param {*} newMap */
			reset(newMap) {
				store = _frameContext.value = newMap;
			},
			size() {
				return store.size;
			},
			clear() {
				store.clear();
			},
		};
	}

	destroy() {
		/** clear frame roots */
		this.applyToRoots((e) => {
			// destroy documentType instance
			const docType = e.get('documentType');
			if (docType) {
				docType._destroy();
				docType.editor = null;
			}
			dom.utils.removeItem(e.get('topArea'));
			e.get('options').clear();
			e.clear();
		});

		this.#contextMap.clear();
		this.#frameContextMap.clear();
		this.#frameRoots.clear();
	}
}
