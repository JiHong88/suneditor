import type {} from '../../typedef';
/**
 * @typedef {import('../schema/frameContext').FrameContextStore} ConfigFrameContextStore
 * @typedef {import('../schema/context').ContextStore} ConfigContextStore
 */
/**
 * @typedef {Object} ContextMap
 * @property {(k: keyof ConfigContextStore) => HTMLElement|null} get - Get a DOM element from the context by key.
 * @property {(k: keyof ConfigContextStore, v: HTMLElement) => void} set - Set a DOM element in the context by key.
 * @property {(k: keyof ConfigContextStore) => boolean} has - Check if a key exists in the context.
 * @property {(k: keyof ConfigContextStore) => boolean} delete - Delete a key from the context.
 * @property {() => Object<keyof ConfigContextStore, HTMLElement|null>} [getAll] - Get all DOM elements in the context as an object.
 * @property {number} size - Get context size
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
 * @property {number} size - Get context size
 * @property {() => void} clear - Clear all elements in the context.
 */
export default class ContextProvider {
	/**
	 * @constructor
	 * @param {import('../section/constructor').ConstructorReturnType} product
	 */
	constructor(product: import('../section/constructor').ConstructorReturnType);
	/**
	 * @description Frame root key array
	 * @type {Array<*>}
	 */
	rootKeys: Array<any>;
	/**
	 * @description Controllers carrier
	 * @type {HTMLElement}
	 */
	carrierWrapper: HTMLElement;
	/**
	 * @description Default icons object
	 * @type {Object<string, string>}
	 */
	icons: {
		[x: string]: string;
	};
	/**
	 * @description loaded language
	 * @type {Object<string, *>}
	 */
	lang: {
		[x: string]: any;
	};
	/**
	 * @description Closest ShadowRoot to editor if found
	 * @type {ShadowRoot & { getSelection?: () => Selection }} - Chromium-based browsers (Chrome, Edge, etc.) has a getSelection method on the ShadowRoot
	 */
	shadowRoot: ShadowRoot & {
		getSelection?: () => Selection;
	};
	get frameRoots(): Map<string, import('../schema/frameContext').FrameContexType>;
	get context(): ContextMap;
	get frameContext(): FrameContextMap;
	init(): void;
	/**
	 * @param {SunEditor.FrameContext} rt Root target[key] FrameContext
	 */
	reset(rt: SunEditor.FrameContext): void;
	/**
	 * @description Execute a function by traversing all root targets.
	 * @param {(frameContext: SunEditor.FrameContext, rootKey: string|null, frameRoots: Map<string|null, SunEditor.FrameContext>) => void} f Callback function
	 */
	applyToRoots(f: (frameContext: SunEditor.FrameContext, rootKey: string | null, frameRoots: Map<string | null, SunEditor.FrameContext>) => void): void;
	_destroy(): void;
	#private;
}
export type ConfigFrameContextStore = import('../schema/frameContext').FrameContextStore;
export type ConfigContextStore = import('../schema/context').ContextStore;
export type ContextMap = {
	/**
	 * - Get a DOM element from the context by key.
	 */
	get: (k: keyof ConfigContextStore) => HTMLElement | null;
	/**
	 * - Set a DOM element in the context by key.
	 */
	set: (k: keyof ConfigContextStore, v: HTMLElement) => void;
	/**
	 * - Check if a key exists in the context.
	 */
	has: (k: keyof ConfigContextStore) => boolean;
	/**
	 * - Delete a key from the context.
	 */
	delete: (k: keyof ConfigContextStore) => boolean;
	/**
	 * - Get all DOM elements in the context as an object.
	 */
	getAll?: () => any;
	/**
	 * - Get context size
	 */
	size: number;
	/**
	 * - Clear all elements in the context.
	 */
	clear: () => void;
};
export type FrameContextMap = {
	/**
	 * - Get a DOM element from the context by key.
	 */
	get: <K extends keyof ConfigFrameContextStore>(k: K) => ConfigFrameContextStore[K];
	/**
	 * - Set a DOM element in the context by key.
	 */
	set: <K extends keyof ConfigFrameContextStore>(k: K, v: ConfigFrameContextStore[K]) => void;
	/**
	 * - Check if a key exists in the context.
	 */
	has: <K extends keyof ConfigFrameContextStore>(k: K) => boolean;
	/**
	 * - Delete a key from the context.
	 */
	delete: <K extends keyof ConfigFrameContextStore>(k: K) => boolean;
	/**
	 * - Get all DOM elements in the context as an object.
	 */
	getAll?: () => any;
	/**
	 * - Reset the context with a new Map.
	 */
	reset?: (newMap: any) => void;
	/**
	 * - Get context size
	 */
	size: number;
	/**
	 * - Clear all elements in the context.
	 */
	clear: () => void;
};
