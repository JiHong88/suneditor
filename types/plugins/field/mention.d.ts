import type {} from '../../typedef';
export default Mention;
export type MentionPluginOptions = {
	/**
	 * - The character that triggers the mention list
	 */
	triggerText?: string;
	/**
	 * - The number of items to display in the mention list
	 */
	limitSize?: number;
	/**
	 * - The number of characters to start searching for the mention list
	 */
	searchStartLength?: number;
	/**
	 * - The time to wait before displaying the mention list
	 */
	delayTime?: number;
	/**
	 * - Use data without using API
	 */
	data?: Array<{
		key: string;
		name: string;
		url: string;
	}>;
	/**
	 * - The URL to call the mention list
	 */
	apiUrl?: string;
	/**
	 * - The headers to send with the API call
	 */
	apiHeaders?: {
		[x: string]: string;
	};
	/**
	 * - Whether to cache the mention list data
	 */
	useCachingData?: boolean;
	/**
	 * - Whether to cache the mention list data in the field
	 */
	useCachingFieldData?: boolean;
};
/**
 * @typedef {Object} MentionPluginOptions
 * @property {string} [triggerText="@"] - The character that triggers the mention list
 * @property {number} [limitSize=5] - The number of items to display in the mention list
 * @property {number} [searchStartLength=0] - The number of characters to start searching for the mention list
 * @property {number} [delayTime=200] - The time to wait before displaying the mention list
 * @property {Array<{key: string, name: string, url: string}>} [data] - Use data without using API
 * @property {string} [apiUrl] - The URL to call the mention list
 * @property {Object<string, string>} [apiHeaders] - The headers to send with the API call
 * @property {boolean} [useCachingData=true] - Whether to cache the mention list data
 * @property {boolean} [useCachingFieldData=true] - Whether to cache the mention list data in the field
 */
/**
 * @class
 * @description Mention Plugin
 * - A plugin that provides a mention feature using `@` or a custom trigger character.
 * - Displays a mention list when the trigger character is typed.
 * - Supports fetching mention data from an API or a predefined data array.
 * - Uses caching for optimized performance.
 */
declare class Mention extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {MentionPluginOptions} pluginOptions
	 */
	constructor(editor: __se__EditorCore, pluginOptions: MentionPluginOptions);
	title: any;
	icon: string;
	triggerText: string;
	limitSize: number;
	searchStartLength: number;
	delayTime: number;
	directData: {
		key: string;
		name: string;
		url: string;
	}[];
	apiUrl: string;
	apiManager: ApiManager;
	cachingData: Map<any, any>;
	cachingFieldData: any[];
	selectMenu: SelectMenu;
	controller: Controller;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "input".
	 * @returns {Promise<boolean>}
	 */
	onInput(): Promise<boolean>;
	#private;
}
import EditorInjector from '../../editorInjector';
import { ApiManager } from '../../modules';
import { SelectMenu } from '../../modules';
import { Controller } from '../../modules';
