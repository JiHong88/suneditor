import type {} from '../../typedef';
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
 * @property {() => IterableIterator<[keyof ConfigAllBaseOptions, *]>} entries - Returns an iterator of [key, value] pairs.
 * @property {() => IterableIterator<keyof ConfigAllBaseOptions>} keys - Returns an iterator of keys.
 * @property {() => IterableIterator<*>} values - Returns an iterator of values.
 * @property {(callbackfn: (value: *, key: string, map: Map<string, *>) => void) => void} forEach - Executes a function for each entry.
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
 * @property {() => IterableIterator<[keyof ConfigAllFrameOptions, *]>} entries - Returns an iterator of [key, value] pairs.
 * @property {() => IterableIterator<keyof ConfigAllFrameOptions>} keys - Returns an iterator of keys.
 * @property {() => IterableIterator<*>} values - Returns an iterator of values.
 * @property {(callbackfn: (value: *, key: string, map: Map<string, *>) => void) => void} forEach - Executes a function for each entry.
 */
/**
 * @description Provides Map-based access to editor options (base and per-frame).
 */
export default class OptionProvider {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 * @param {import('../section/constructor').ConstructorReturnType} product
	 */
	constructor(kernel: SunEditor.Kernel, product: import('../section/constructor').ConstructorReturnType, options: any);
	/**
	 * @return {BaseOptionsMap}
	 */
	get options(): BaseOptionsMap;
	get frameOptions(): FrameOptionsMap;
	/**
	 * @description Add or reset option property (Editor is reloaded)
	 * @param {SunEditor.InitOptions} newOptions Options
	 */
	reset(newOptions: SunEditor.InitOptions): void;
	/**
	 * @description Add or reset frame option property (Editor is reloaded)
	 * @param {SunEditor.FrameOptions} newOptions Options
	 */
	resetFrame(newOptions: SunEditor.FrameOptions): void;
	_destroy(): void;
	#private;
}
export type ConfigAllBaseOptions = import('../schema/options').ProcessedBaseOptions;
export type ConfigAllFrameOptions = import('../schema/options').ProcessedFrameOptions;
/**
 * - A Map containing all processed editor base options.
 * - This Map contains all keys from {@link ConfigAllBaseOptions}, where:
 * - Keys are option names (string)
 * - Values depend on the specific option (see {@link ConfigAllBaseOptions} for details)
 */
export type BaseOptionsMap = {
	/**
	 * - Retrieves the value of a specific option.
	 */
	get: <K extends keyof ConfigAllBaseOptions>(k: K) => ConfigAllBaseOptions[K];
	/**
	 * - Sets the value of a specific option.
	 */
	set: <K extends keyof ConfigAllBaseOptions>(k: K, v: ConfigAllBaseOptions[K]) => void;
	/**
	 * - Checks if a specific option exists.
	 */
	has: <K extends keyof ConfigAllBaseOptions>(k: K) => boolean;
	/**
	 * - Retrieves all options as an object.
	 */
	getAll: () => any;
	/**
	 * - Sets multiple options at once.
	 */
	setMany: (options: Map<any, any>) => void;
	/**
	 * - Replaces all options with a new Map.
	 */
	reset: (newMap: SunEditor.InitOptions) => void;
	/**
	 * - Get option size
	 */
	size: () => number;
	/**
	 * - Clears all stored options.
	 */
	clear: () => void;
	/**
	 * - Returns an iterator of [key, value] pairs.
	 */
	entries: () => IterableIterator<[keyof ConfigAllBaseOptions, any]>;
	/**
	 * - Returns an iterator of keys.
	 */
	keys: () => IterableIterator<keyof ConfigAllBaseOptions>;
	/**
	 * - Returns an iterator of values.
	 */
	values: () => IterableIterator<any>;
	/**
	 * - Executes a function for each entry.
	 */
	forEach: (callbackfn: (value: any, key: string, map: Map<string, any>) => void) => void;
};
/**
 * - A Map containing all processed frame-level options.
 * - This Map contains all keys from {@link ConfigAllFrameOptions}, where:
 * - Keys are option names (string)
 * - Values depend on the specific option (see {@link ConfigAllFrameOptions} for details)
 */
export type FrameOptionsMap = {
	/**
	 * - Retrieves the value of a specific option.
	 */
	get: <K extends keyof ConfigAllFrameOptions>(k: K) => ConfigAllFrameOptions[K];
	/**
	 * - Sets the value of a specific option.
	 */
	set: <K extends keyof ConfigAllFrameOptions>(k: K, v: ConfigAllFrameOptions[K]) => void;
	/**
	 * - Checks if a specific option exists.
	 */
	has: <K extends keyof ConfigAllFrameOptions>(k: K) => boolean;
	/**
	 * - Retrieves all options as an object.
	 */
	getAll: () => any;
	/**
	 * - Sets multiple options at once.
	 */
	setMany: (options: Map<any, any>) => void;
	/**
	 * - Replaces all options with a new Map.
	 */
	reset: (newMap: SunEditor.FrameOptions) => void;
	/**
	 * - Get option size
	 */
	size: () => number;
	/**
	 * - Clears all stored options.
	 */
	clear: () => void;
	/**
	 * - Returns an iterator of [key, value] pairs.
	 */
	entries: () => IterableIterator<[keyof ConfigAllFrameOptions, any]>;
	/**
	 * - Returns an iterator of keys.
	 */
	keys: () => IterableIterator<keyof ConfigAllFrameOptions>;
	/**
	 * - Returns an iterator of values.
	 */
	values: () => IterableIterator<any>;
	/**
	 * - Executes a function for each entry.
	 */
	forEach: (callbackfn: (value: any, key: string, map: Map<string, any>) => void) => void;
};
