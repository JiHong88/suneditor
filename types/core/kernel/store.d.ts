import type {} from '../../typedef';
export default Store;
export type StoreState = {
	/**
	 * - Current root frame key.
	 */
	rootKey: any;
	/**
	 * - Whether the editor has focus.
	 */
	hasFocus: boolean;
	/**
	 * - Tab character space count.
	 */
	tabSize: number;
	/**
	 * - `block` indent margin size (px).
	 */
	indentSize: number;
	/**
	 * - Code view indent space count.
	 */
	codeIndentSize: number;
	/**
	 * - Selection path tag names (for navigation bar).
	 */
	currentNodes: Array<string>;
	/**
	 * - Active command/style names from selection path.
	 */
	currentNodesMap: Array<string>;
	/**
	 * - Viewport height at initialization.
	 */
	initViewportHeight: number;
	/**
	 * - Current visual viewport height.
	 */
	currentViewportHeight: number;
	/**
	 * - Whether a controller or component is currently active, used to manage `blur`/`focus` behavior.
	 */
	controlActive: boolean;
	/**
	 * - Whether the frame content is scrollable (derived from `height`/`maxHeight` options).
	 */
	isScrollable: (fc: SunEditor.FrameContext) => boolean;
	/**
	 * - Last selection node processed by `selectionState.update()` (cache for dedup).
	 */
	_lastSelectionNode: Node | null;
	/**
	 * - Cached selection range.
	 */
	_range: Range | null;
	/**
	 * - Whether `mousedown` is pressed.
	 */
	_mousedown: boolean;
	/**
	 * - Suppress `blur` event handling.
	 */
	_preventBlur: boolean;
	/**
	 * - Suppress `focus` event handling.
	 */
	_preventFocus: boolean;
};
/**
 * - Toolbar display mode flags (immutable after init).
 */
export type StoreMode = {
	/**
	 * - Whether the toolbar is in classic (top-fixed) mode.
	 */
	isClassic: boolean;
	/**
	 * - Whether the toolbar is in `inline` mode (appears above the editor on focus).
	 */
	isInline: boolean;
	/**
	 * - Whether the toolbar is in `balloon` mode (appears on text selection).
	 */
	isBalloon: boolean;
	/**
	 * - Whether the toolbar is in `balloon-always` mode (always visible as floating).
	 */
	isBalloonAlways: boolean;
	/**
	 * - Whether the sub-toolbar is in `balloon` mode.
	 */
	isSubBalloon: boolean;
	/**
	 * - Whether the sub-toolbar is in `balloon-always` mode.
	 */
	isSubBalloonAlways: boolean;
};
/**
 * @typedef {Object} StoreState
 * @property {*} rootKey - Current root frame key.
 * @property {boolean} hasFocus - Whether the editor has focus.
 * @property {number} tabSize - Tab character space count.
 * @property {number} indentSize - `block` indent margin size (px).
 * @property {number} codeIndentSize - Code view indent space count.
 * @property {Array<string>} currentNodes - Selection path tag names (for navigation bar).
 * @property {Array<string>} currentNodesMap - Active command/style names from selection path.
 * @property {number} initViewportHeight - Viewport height at initialization.
 * @property {number} currentViewportHeight - Current visual viewport height.
 * @property {boolean} controlActive - Whether a controller or component is currently active, used to manage `blur`/`focus` behavior.
 * @property {(fc: SunEditor.FrameContext) => boolean} isScrollable - Whether the frame content is scrollable (derived from `height`/`maxHeight` options).
 * @property {?Node} _lastSelectionNode - Last selection node processed by `selectionState.update()` (cache for dedup).
 * @property {?Range} _range - Cached selection range.
 * @property {boolean} _mousedown - Whether `mousedown` is pressed.
 * @property {boolean} _preventBlur - Suppress `blur` event handling.
 * @property {boolean} _preventFocus - Suppress `focus` event handling.
 */
/**
 * @typedef {Object} StoreMode - Toolbar display mode flags (immutable after init).
 * @property {boolean} isClassic - Whether the toolbar is in classic (top-fixed) mode.
 * @property {boolean} isInline - Whether the toolbar is in `inline` mode (appears above the editor on focus).
 * @property {boolean} isBalloon - Whether the toolbar is in `balloon` mode (appears on text selection).
 * @property {boolean} isBalloonAlways - Whether the toolbar is in `balloon-always` mode (always visible as floating).
 * @property {boolean} isSubBalloon - Whether the sub-toolbar is in `balloon` mode.
 * @property {boolean} isSubBalloonAlways - Whether the sub-toolbar is in `balloon-always` mode.
 */
/**
 * @description Central runtime state management for the editor.
 * - Does not store DOM references (kept in `frameContext`).
 * - Does not store configuration values (kept in `options`).
 * - Only manages runtime state.
 */
declare class Store {
	/**
	 * @param {import('../section/constructor').ConstructorReturnType} product - Constructor product
	 */
	constructor(product: import('../section/constructor').ConstructorReturnType);
	/**
	 * @internal
	 * @description If `true`, initialize all indexes of image, video information
	 * @type {boolean}
	 */
	_editorInitFinished: boolean;
	/** @type {StoreMode} */
	mode: StoreMode;
	/**
	 * @description Get state value (supports underscore notation)
	 * @template {keyof StoreState} K
	 * @param {K} key
	 * @returns {StoreState[K]}
	 */
	get<K extends keyof StoreState>(key: K): StoreState[K];
	/**
	 * @description Set state value and notify subscribers
	 * @template {keyof StoreState} K
	 * @param {K} key
	 * @param {StoreState[K]} value - Value to set
	 */
	set<K extends keyof StoreState>(key: K, value: StoreState[K]): void;
	/**
	 * @description Subscribe to state changes
	 * @template {keyof StoreState} K
	 * @param {K} path - Path to subscribe
	 * @param {(newValue: StoreState[K], oldValue: StoreState[K]) => void} callback
	 * @returns {() => void} Unsubscribe function
	 */
	subscribe<K extends keyof StoreState>(path: K, callback: (newValue: StoreState[K], oldValue: StoreState[K]) => void): () => void;
	_reset(): void;
	_destroy(): void;
	#private;
}
