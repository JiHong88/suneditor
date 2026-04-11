import type {} from '../../typedef';
export default Autocomplete;
export type AutocompleteTriggerConfig = {
	/**
	 * - Static data array. Each item must have a `key` field. Mutually exclusive with `apiUrl`.
	 * ```js
	 * // data
	 * [{ key: 'john', name: 'John Doe', url: '/users/john' }]
	 * ```
	 */
	data?: Array<{
		key: string;
		[x: string]: any;
	}>;
	/**
	 * - API endpoint URL. Supports `{key}` and `{limitSize}` placeholders. Mutually exclusive with `data`.
	 */
	apiUrl?: string;
	/**
	 * - HTTP headers for the API request.
	 */
	apiHeaders?: {
		[x: string]: string;
	};
	/**
	 * - Transforms parsed JSON response into an array of data items.
	 */
	transformResponse?: (
		arg0: any,
		arg1: XMLHttpRequest,
	) => Array<{
		key: string;
	}>;
	/**
	 * - Override global `limitSize` for this trigger.
	 */
	limitSize?: number;
	/**
	 * - Override global `searchStartLength` for this trigger.
	 */
	searchStartLength?: number;
	/**
	 * - Override global `useCachingData` for this trigger.
	 */
	useCachingData?: boolean;
	/**
	 * - Override global `useCachingFieldData` for this trigger.
	 */
	useCachingFieldData?: boolean;
	/**
	 * - Custom dropdown item renderer. Receives `(item, triggerText)`, returns HTML string.
	 */
	renderItem?: (
		arg0: {
			key: string;
			[x: string]: any;
		},
		arg1: string,
	) => string;
	/**
	 * - Custom selection handler. Returns:
	 * - `string`: inserted as text node
	 * - `Element`: inserted as-is
	 * - `{tag, attrs, text}`: creates element via `dom.utils.createElement`
	 */
	onSelect?: (
		arg0: {
			key: string;
			[x: string]: any;
		},
		arg1: string,
	) =>
		| string
		| Element
		| {
				tag: string;
				attrs?: any;
				text?: string;
		  };
};
export type AutocompletePluginOptions = {
	/**
	 * - Debounce delay in ms before processing input.
	 */
	delayTime?: number;
	/**
	 * - Maximum number of items to display in the dropdown.
	 */
	limitSize?: number;
	/**
	 * - Minimum input length before triggering search.
	 */
	searchStartLength?: number;
	/**
	 * - Whether to cache query responses per trigger.
	 */
	useCachingData?: boolean;
	/**
	 * - Whether to cache selected items for priority display.
	 */
	useCachingFieldData?: boolean;
	/**
	 * - Per-trigger configurations keyed by trigger character.
	 * ```js
	 * // triggers
	 * {
	 * '@': { data: [...], renderItem: (item) => `...` },
	 * '#': { apiUrl: '/api/tags?q={key}' }
	 * }
	 * ```
	 */
	triggers: {
		[x: string]: AutocompleteTriggerConfig;
	};
};
/**
 * @typedef {Object} AutocompleteTriggerConfig
 * @property {Array<{key: string, [x: string]: any}>} [data] - Static data array. Each item must have a `key` field. Mutually exclusive with `apiUrl`.
 * ```js
 * // data
 * [{ key: 'john', name: 'John Doe', url: '/users/john' }]
 * ```
 * @property {string} [apiUrl] - API endpoint URL. Supports `{key}` and `{limitSize}` placeholders. Mutually exclusive with `data`.
 * @property {Object<string, string>} [apiHeaders] - HTTP headers for the API request.
 * @property {function(Object, XMLHttpRequest): Array<{key: string}>} [transformResponse] - Transforms parsed JSON response into an array of data items.
 * @property {number} [limitSize] - Override global `limitSize` for this trigger.
 * @property {number} [searchStartLength] - Override global `searchStartLength` for this trigger.
 * @property {boolean} [useCachingData] - Override global `useCachingData` for this trigger.
 * @property {boolean} [useCachingFieldData] - Override global `useCachingFieldData` for this trigger.
 * @property {function({key: string, [x: string]: any}, string): string} [renderItem] - Custom dropdown item renderer. Receives `(item, triggerText)`, returns HTML string.
 * @property {function({key: string, [x: string]: any}, string): (string|Element|{tag: string, attrs?: Object, text?: string})} [onSelect] - Custom selection handler. Returns:
 *   - `string`: inserted as text node
 *   - `Element`: inserted as-is
 *   - `{tag, attrs, text}`: creates element via `dom.utils.createElement`
 */
/**
 * @typedef {Object} AutocompletePluginOptions
 * @property {number} [delayTime=120] - Debounce delay in ms before processing input.
 * @property {number} [limitSize=5] - Maximum number of items to display in the dropdown.
 * @property {number} [searchStartLength=0] - Minimum input length before triggering search.
 * @property {boolean} [useCachingData=true] - Whether to cache query responses per trigger.
 * @property {boolean} [useCachingFieldData=true] - Whether to cache selected items for priority display.
 * @property {Object<string, AutocompleteTriggerConfig>} triggers - Per-trigger configurations keyed by trigger character.
 * ```js
 * // triggers
 * {
 *   '@': { data: [...], renderItem: (item) => `...` },
 *   '#': { apiUrl: '/api/tags?q={key}' }
 * }
 * ```
 */
/**
 * @class
 * @description Autocomplete Plugin
 * - A generic autocomplete plugin supporting multiple trigger characters.
 * - Each trigger can have its own data source, rendering, and selection behavior.
 * - Supports static data arrays and API-based data fetching.
 * - Uses per-trigger caching for optimized performance.
 */
declare class Autocomplete extends PluginField {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {AutocompletePluginOptions} pluginOptions
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: AutocompletePluginOptions);
	title: any;
	triggerContexts: Map<any, any>;
	sortedTriggers: any[];
	selectMenu: SelectMenu;
	controller: Controller;
	onInput(params: SunEditor.HookParams.InputWithData): Promise<void>;
	#private;
}
import { PluginField } from '../../interfaces';
import { Controller } from '../../modules/contract';
import { SelectMenu } from '../../modules/ui';
