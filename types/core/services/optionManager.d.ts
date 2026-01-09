import type {} from '../../typedef';
/**
 * @typedef {import('../config/options').AllBaseOptions} ConfigAllBaseOptions
 * @typedef {import('../config/options').AllFrameOptions} ConfigAllFrameOptions
 */
/**
 * @typedef {Object} BaseOptionsMap
 * @description A Map containing all processed editor base options.
 * - This Map contains all keys from {@link ConfigAllBaseOptions}, where:
 * - Keys are option names (string)
 * - Values depend on the specific option (see {@link ConfigAllBaseOptions} for details)
 *
 * @property {<K extends keyof ConfigAllFrameOptions>(k: K) => ConfigAllFrameOptions[K]} get - Retrieves the value of a specific option.
 * @property {<K extends keyof ConfigAllFrameOptions>(k: K, v: ConfigAllFrameOptions[K]) => void} set - Sets the value of a specific option.
 * @property {<K extends keyof ConfigAllFrameOptions>(k: K) => boolean} has - Checks if a specific option exists.
 * @property {() => Object<keyof ConfigAllFrameOptions, *>} getAll - Retrieves all options as an object.
 * @property {(options: Partial<ConfigAllFrameOptions>) => void} setMany - Sets multiple options at once.
 * @property {(newMap: Map<string, *>) => void} reset - Replaces all options with a new Map.
 * @property {() => number} size - Get option size
 * @property {() => void} clear - Clears all stored options.
 */
/**
 * @typedef {Object} FrameOptionsMap
 * @description A Map containing all processed frame-level options.
 * - This Map contains all keys from {@link ConfigAllFrameOptions}, where:
 * - Keys are option names (string)
 * - Values depend on the specific option (see {@link ConfigAllFrameOptions} for details)
 *
 * @property {<K extends keyof ConfigAllFrameOptions>(k: K) => ConfigAllFrameOptions[K]} get - Retrieves the value of a specific option.
 * @property {<K extends keyof ConfigAllFrameOptions>(k: K, v: ConfigAllFrameOptions[K]) => void} set - Sets the value of a specific option.
 * @property {<K extends keyof ConfigAllFrameOptions>(k: K) => boolean} has - Checks if a specific option exists.
 * @property {() => Object<keyof ConfigAllFrameOptions, *>} getAll - Retrieves all options as an object.
 * @property {(options: Partial<ConfigAllFrameOptions>) => void} setMany - Sets multiple options at once.
 * @property {(newMap: Map<string, *>) => void} reset - Replaces all options with a new Map.
 * @property {() => number} size - Get option size
 * @property {() => void} clear - Clears all stored options.
 */
export default class OptionManager {
	/**
	 * @constructor
	 * @param {SunEditor.Instance} editor
	 */
	constructor(editor: SunEditor.Instance, product: any, options: any);
	get options(): any;
	get frameOptions(): any;
	/**
	 * @description Add or reset option property (Editor is reloaded)
	 * @param {SunEditor.InitOptions} newOptions Options
	 */
	reset(newOptions: SunEditor.InitOptions): void;
	/**
	 * @description Add or reset frame option property (Editor is reloaded)
	 * @param {SunEditor.InitFrameOptions} newOptions Options
	 */
	resetFrame(newOptions: SunEditor.InitFrameOptions): void;
	destroy(): void;
	#private;
}
export type ConfigAllBaseOptions = import('../config/options').AllBaseOptions;
export type ConfigAllFrameOptions = import('../config/options').AllFrameOptions;
export type BaseOptionsMap = any;
export type FrameOptionsMap = any;
