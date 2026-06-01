import type {} from '../../typedef';
export default AudioGallery;
export type AudioGalleryPluginOptions = {
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
	 * "src": "https://example.com/audio.mp3",
	 * "name": "audio.mp3",
	 * "thumbnail": "https://example.com/audio_icon.png",
	 * "tag": ["music"]
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
	 * - Default thumbnail
	 */
	thumbnail?: string | ((item: SunEditor.Module.Browser.File) => string);
};
/**
 * @typedef {Object} AudioGalleryPluginOptions
 * @property {Array<SunEditor.Module.Browser.File>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * - The server must return:
 * ```js
 * {
 *   "result": [
 *     {
 *       "src": "https://example.com/audio.mp3",
 *       "name": "audio.mp3",
 *       "thumbnail": "https://example.com/audio_icon.png",
 *       "tag": ["music"]
 *     }
 *   ]
 * }
 * ```
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string} [searchUrl] - Server-side search URL. When set, the keyword is sent to this URL
 * as `?keyword=<value>` and the server response replaces the list. When not set, search filters the
 * already-loaded items locally.
 * @property {Object<string, string>} [searchHeaders] - Server-side search request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail
 */
/**
 * @class
 * @description Audio gallery plugin
 */
declare class AudioGallery extends PluginBrowser {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {AudioGalleryPluginOptions} pluginOptions
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: AudioGalleryPluginOptions);
	title: any;
	onSelectfunction: (target: Node) => any;
	browser: Browser;
	#private;
}
import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';
