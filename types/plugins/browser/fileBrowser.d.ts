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
	 * - The server must return a nested folder structure.
	 * - `_data`: array (inline) or string URL (lazy-loaded on folder click).
	 * - `"default": true` sets the initially selected folder.
	 * ```js
	 * {
	 * "result": {
	 * "root": {
	 * "name": "Root",
	 * "default": true,
	 * "_data": [
	 * { "src": "https://example.com/file1.pdf", "name": "file1.pdf" }
	 * ],
	 * "documents": {
	 * "name": "Documents",
	 * "_data": "https://api.example.com/files/documents"
	 * }
	 * }
	 * }
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
	 * - Server-side search URL. When set, the keyword is sent to this URL
	 * as `?keyword=<value>` and the server response replaces the list. When not set, search filters the
	 * already-loaded items locally.
	 */
	searchUrl?: string;
	/**
	 * - Server-side search request headers
	 */
	searchHeaders?: {
		[x: string]: string;
	};
	/**
	 * - Default thumbnail HTML (e.g. an SVG icon or `<img>` markup),
	 * or a function that returns it per item. Used for non-image items without their own `thumbnail` URL.
	 * - The markup is inserted as HTML: do not interpolate unescaped server data into it.
	 * Default: a built-in icon per item `type`.
	 */
	thumbnail?: string | ((item: SunEditor.Module.Browser.File) => string);
	/**
	 * - Initial folder expand depth. `1` expands the first level, `Infinity` expands all. Default: `1`.
	 */
	expand?: number;
	/**
	 * - Additional tag names
	 * ```js
	 * { url: '/api/files', headers: { Authorization: 'Bearer token' }, thumbnail: (item) => (item.type === 'pdf' ? pdfIconSvg : fileIconSvg) }
	 * ```
	 */
	props?: Array<string>;
};
/**
 * @typedef {Object} FileBrowserPluginOptions
 * @property {Object<string, *>|Array<*>} [data] - Direct data without server calls (bypasses URL fetch).
 * @property {string} [url] - Server request URL
 * - The server must return a nested folder structure.
 * - `_data`: array (inline) or string URL (lazy-loaded on folder click).
 * - `"default": true` sets the initially selected folder.
 * ```js
 * {
 *   "result": {
 *     "root": {
 *       "name": "Root",
 *       "default": true,
 *       "_data": [
 *         { "src": "https://example.com/file1.pdf", "name": "file1.pdf" }
 *       ],
 *       "documents": {
 *         "name": "Documents",
 *         "_data": "https://api.example.com/files/documents"
 *       }
 *     }
 *   }
 * }
 * ```
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string} [searchUrl] - Server-side search URL. When set, the keyword is sent to this URL
 * as `?keyword=<value>` and the server response replaces the list. When not set, search filters the
 * already-loaded items locally.
 * @property {Object<string, string>} [searchHeaders] - Server-side search request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail HTML (e.g. an SVG icon or `<img>` markup),
 * or a function that returns it per item. Used for non-image items without their own `thumbnail` URL.
 * - The markup is inserted as HTML: do not interpolate unescaped server data into it.
 * Default: a built-in icon per item `type`.
 * @property {number} [expand=1] - Initial folder expand depth. `1` expands the first level, `Infinity` expands all. Default: `1`.
 * @property {Array<string>} [props] - Additional tag names
 * ```js
 * { url: '/api/files', headers: { Authorization: 'Bearer token' }, thumbnail: (item) => (item.type === 'pdf' ? pdfIconSvg : fileIconSvg) }
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
	onSelectfunction: (target: any) => any;
	browser: Browser;
	#private;
}
import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';
