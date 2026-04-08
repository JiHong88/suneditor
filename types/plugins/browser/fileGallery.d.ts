import type {} from '../../typedef';
export default FileGallery;
export type FileGalleryPluginOptions = {
	/**
	 * - Direct data without server calls
	 */
	data?: Array<SunEditor.Module.Browser.File>;
	/**
	 * - Server request URL
	 * - The server must return:
	 * ```js
	 * {
	 * "result": [
	 * {
	 * "src": "https://example.com/doc.pdf",
	 * "name": "doc.pdf",
	 * "thumbnail": "https://example.com/pdf_icon.png",
	 * "type": "file", // video, image ..[plugin name]
	 * "tag": ["document"]
	 * }
	 * ]
	 * }
	 * ```
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
};
/**
 * @typedef {Object} FileGalleryPluginOptions
 * @property {Array<SunEditor.Module.Browser.File>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * - The server must return:
 * ```js
 * {
 *   "result": [
 *     {
 *       "src": "https://example.com/doc.pdf",
 *       "name": "doc.pdf",
 *       "thumbnail": "https://example.com/pdf_icon.png",
 *       "type": "file", // video, image ..[plugin name]
 *       "tag": ["document"]
 *     }
 *   ]
 * }
 * ```
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail
 */
/**
 * @class
 * @description File gallery plugin
 */
declare class FileGallery extends PluginBrowser {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {FileGalleryPluginOptions} pluginOptions
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: FileGalleryPluginOptions);
	title: any;
	onSelectfunction: (target: Node) => any;
	browser: Browser;
	#private;
}
import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';
