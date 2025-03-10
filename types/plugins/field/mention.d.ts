export default Mention;
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
	 * @param {Object} pluginOptions
	 * @param {string=} [pluginOptions.triggerText="@"] The character that triggers the mention list. Default is '@'.
	 * @param {number=} [pluginOptions.limitSize=5] The number of items to display in the mention list. Default is 5.
	 * @param {number=} [pluginOptions.searchStartLength=0] The number of characters to start searching for the mention list. Default is 0.
	 * @param {number=} [pluginOptions.delayTime=200] The time to wait before displaying the mention list. Default is 200ms.
	 * @param {Array<{key: string, name: string, url: string}>=} pluginOptions.data Use data without using API.
	 * @param {string=} pluginOptions.apiUrl The URL to call the mention list. Default is ''.
	 * @param {Object<string, string>=} pluginOptions.apiHeaders The headers to send with the API call. Default is {}.
	 * @param {boolean=} [pluginOptions.useCachingData=true] Whether to cache the mention list data. Default is true.
	 * @param {boolean=} [pluginOptions.useCachingFieldData=true] Whether to cache the mention list data in the field. Default is true.
	 */
	constructor(
		editor: __se__EditorCore,
		pluginOptions: {
			triggerText?: string | undefined;
			limitSize?: number | undefined;
			searchStartLength?: number | undefined;
			delayTime?: number | undefined;
			data?:
				| Array<{
						key: string;
						name: string;
						url: string;
				  }>
				| undefined;
			apiUrl?: string | undefined;
			apiHeaders?:
				| {
						[x: string]: string;
				  }
				| undefined;
			useCachingData?: boolean | undefined;
			useCachingFieldData?: boolean | undefined;
		}
	);
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
	_delay: number;
	_lastAtPos: number;
	_anchorOffset: number;
	_anchorNode: Node;
	apiManager: ApiManager;
	cachingData: Map<any, any>;
	cachingFieldData: Map<string, any[]>;
	selectMenu: SelectMenu;
	controller: Controller;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "input".
	 * @returns {Promise<boolean>}
	 */
	onInput(): Promise<boolean>;
	/**
	 * @private
	 * @description Generates the mention list based on user input.
	 * - Fetches data from cache, direct data, or an API.
	 * - Creates and opens the mention dropdown.
	 * - Caches the fetched data for future use.
	 * @param {string} value - The mention query text.
	 * @param {Node} targetNode - The node where the mention is triggered.
	 * @returns {Promise<boolean>} - Returns `true` if the mention list is displayed, `false` otherwise.
	 */
	private _createMentionList;
	/**
	 * @private
	 * @description Constructs the API request URL with the mention query.
	 * @param {string} key - The mention query text.
	 * @returns {string} - The formatted API request URL.
	 */
	private _createUrl;
	#private;
}
import EditorInjector from '../../editorInjector';
import { ApiManager } from '../../modules';
import { SelectMenu } from '../../modules';
import { Controller } from '../../modules';
