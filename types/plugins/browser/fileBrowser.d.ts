import type {} from '../../typedef';
export default FileBrowser;
export type FileBrowserPluginOptions = {
	/**
	 * - Direct data without server calls
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
	 * - Default thumbnail
	 */
	thumbnail?: string | ((item: SunEditor.Module.Browser.File) => string);
	/**
	 * - Additional tag names
	 */
	props?: Array<string>;
};
/**
 * @typedef {Object} FileBrowserPluginOptions
 * @property {Object<string, *>|Array<*>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail
 * @property {Array<string>} [props] - Additional tag names
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
