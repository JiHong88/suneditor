import { numbers } from '../../helper';

/**
 * @typedef {Object} StoreState
 * @property {*} rootKey - Current root frame key.
 * @property {boolean} hasFocus - Whether the editor has focus.
 * @property {number} tabSize - Tab character space count.
 * @property {number} indentSize - Block indent margin size (px).
 * @property {number} codeIndentSize - Code view indent space count.
 * @property {Array<string>} currentNodes - Selection path tag names (for navigation bar).
 * @property {Array<string>} currentNodesMap - Active command/style names from selection path.
 * @property {number} initViewportHeight - Viewport height at initialization.
 * @property {number} currentViewportHeight - Current visual viewport height.
 * @property {boolean} controlActive - Whether a controller or component is currently active, used to manage blur/focus behavior.
 * @property {(fc: SunEditor.FrameContext) => boolean} isScrollable - Whether the frame content is scrollable (derived from height/maxHeight options).
 * @property {?Node} _lastSelectionNode - Last selection node processed by selectionState.update() (cache for dedup).
 * @property {?Range} _range - Cached selection range.
 * @property {boolean} _mousedown - Whether mouse button is pressed.
 * @property {boolean} _preventBlur - Suppress blur event handling.
 * @property {boolean} _preventFocus - Suppress focus event handling.
 */

/**
 * @typedef {Object} StoreMode - Toolbar display mode flags (immutable after init).
 * @property {boolean} isClassic - Whether the toolbar is in classic (top-fixed) mode.
 * @property {boolean} isInline - Whether the toolbar is in inline mode (appears above the editor on focus).
 * @property {boolean} isBalloon - Whether the toolbar is in balloon mode (appears on text selection).
 * @property {boolean} isBalloonAlways - Whether the toolbar is in balloon-always mode (always visible as floating).
 * @property {boolean} isSubBalloon - Whether the sub-toolbar is in balloon mode.
 * @property {boolean} isSubBalloonAlways - Whether the sub-toolbar is in balloon-always mode.
 */

/**
 * @description Central runtime state management for the editor
 * - Does not store DOM references (kept in frameContext)
 * - Does not store configuration values (kept in options)
 * - Only manages runtime state
 */
class Store {
	/** @type {StoreState} */
	#state;
	#subscribers = new Map();

	/**
	 * @param {import('../section/constructor').ConstructorReturnType} product - Constructor product
	 */
	constructor(product) {
		const options = product.options;
		const mode = options.get('mode');
		const subMode = options.get('_subMode');

		/**
		 * @internal
		 * @description If true, initialize all indexes of image, video information
		 * @type {boolean}
		 */
		this._editorInitFinished = false;

		/** @type {StoreMode} */
		this.mode = {
			isClassic: /classic/i.test(mode),
			isInline: /inline/i.test(mode),
			isBalloon: /balloon/i.test(mode),
			isBalloonAlways: /balloon-always/i.test(mode),
			isSubBalloon: /balloon/i.test(subMode),
			isSubBalloonAlways: /balloon-always/i.test(subMode),
		};

		this.#state = {
			rootKey: product.rootId,
			hasFocus: false,
			tabSize: 4,
			indentSize: 25,
			codeIndentSize: 2,
			currentNodes: [],
			currentNodesMap: [],
			initViewportHeight: 0,
			currentViewportHeight: 0,
			controlActive: false,
			_lastSelectionNode: null,
			isScrollable: (fc) => {
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
			_mousedown: false,
			_preventBlur: false,
			_preventFocus: false,
		};
	}

	/**
	 * @description Get state value (supports underscore notation)
	 * @template {keyof StoreState} K
	 * @param {K} key
	 * @returns {StoreState[K]}
	 */
	get(key) {
		return this.#state[key];
	}

	/**
	 * @description Set state value and notify subscribers
	 * @template {keyof StoreState} K
	 * @param {K} key
	 * @param {StoreState[K]} value - Value to set
	 */
	set(key, value) {
		const oldValue = this.#state[key];
		this.#state[key] = value;

		// Notify subscribers
		this.#notify(key, value, oldValue);
	}

	/**
	 * @description Subscribe to state changes
	 * @template {keyof StoreState} K
	 * @param {K} path - Path to subscribe
	 * @param {(newValue: StoreState[K], oldValue: StoreState[K]) => void} callback
	 * @returns {() => void} Unsubscribe function
	 */
	subscribe(path, callback) {
		if (!this.#subscribers.has(path)) {
			this.#subscribers.set(path, new Set());
		}
		this.#subscribers.get(path).add(callback);

		return () => this.#subscribers.get(path).delete(callback);
	}

	/**
	 * @param {keyof StoreState} path
	 * @param {*} newValue
	 * @param {*} oldValue
	 */
	#notify(path, newValue, oldValue) {
		const subscribers = this.#subscribers.get(path);
		if (!subscribers) return;

		for (const cb of subscribers) {
			try {
				cb(newValue, oldValue);
			} catch (e) {
				console.error(`[Store] Subscriber error for "${path}":`, e);
			}
		}
	}

	// Internal API
	_reset() {
		// Reset to initial state
	}

	_destroy() {
		this.#subscribers.clear();
		this.#state = null;
	}
}

export default Store;
