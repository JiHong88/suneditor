import type {} from '../../typedef';
export default FileBrowser;
export type FileBrowserPluginOptions = {
	/**
	 * - Direct data without server calls (bypasses URL fetch).
	 */
	data?:
		| {
				[x: string]: any;
		  }
		| Array<any>;
	/**
	 * - Server request URL
	 */
	url?: string;
	/**
	 * - Server request headers
	 */
	headers?: {
		[x: string]: string;
	};
	/**
	 * - Default thumbnail URL or a function that returns a thumbnail URL per item.
	 */
	thumbnail?: string | ((item: SunEditor.Module.Browser.File) => string);
	/**
	 * - Additional tag names
	 * ```js
	 * { url: '/api/files', headers: { Authorization: 'Bearer token' }, thumbnail: (item) => item.thumbUrl }
	 * ```
	 */
	props?: Array<string>;
};
/**
 * @typedef {Object} FileBrowserPluginOptions
 * @property {Object<string, *>|Array<*>} [data] - Direct data without server calls (bypasses URL fetch).
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail URL or a function that returns a thumbnail URL per item.
 * @property {Array<string>} [props] - Additional tag names
 * ```js
 * { url: '/api/files', headers: { Authorization: 'Bearer token' }, thumbnail: (item) => item.thumbUrl }
 * ```
 */
/**
 * @class
 * @description File browser plugin. Can contain any media type.
 */
declare class FileBrowser extends PluginBrowser {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {FileBrowserPluginOptions} pluginOptions
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: FileBrowserPluginOptions);
	title: any;
	onSelectfunction: (target: Node) => any;
	browser: Browser;
	#private;
}
import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';
