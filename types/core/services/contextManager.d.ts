import type {} from '../../typedef';
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
	/**
	 * @constructor
	 * @param {SunEditor.Instance} editor
	 */
	constructor(editor: SunEditor.Instance, product: any);
	get frameRoots(): Map<any, FrameContextMap>;
	get context(): ContextMap;
	get frameContext(): FrameContextMap;
	init(): void;
	/**
	 * @param {SunEditor.FrameContext} rt Root target[key] FrameContext
	 */
	reset(rt: SunEditor.FrameContext): void;
	/**
	 * @description Execute a function by traversing all root targets.
	 * @param {(...args: *) => *} f Function
	 */
	applyToRoots(f: (...args: any) => any): void;
	destroy(): void;
	#private;
}
export type ConfigFrameContextStore = import('../config/frameContext').FrameContextStore;
export type ConfigContextStore = import('../config/context').ContextStore;
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
	size: () => number;
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
	size: () => number;
	/**
	 * - Clear all elements in the context.
	 */
	clear: () => void;
};
