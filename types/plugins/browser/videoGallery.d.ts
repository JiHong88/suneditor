import type {} from '../../typedef';
export default VideoGallery;
export type VideoGalleryPluginOptions = {
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
	 * "src": "https://example.com/video.mp4",
	 * "name": "video.mp4",
	 * "thumbnail": "https://example.com/video_thumb.jpg",
	 * "frame": "video",
	 * "tag": ["tutorial"]
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
 * @typedef {Object} VideoGalleryPluginOptions
 * @property {Array<SunEditor.Module.Browser.File>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * - The server must return:
 * ```js
 * {
 *   "result": [
 *     {
 *       "src": "https://example.com/video.mp4",
 *       "name": "video.mp4",
 *       "thumbnail": "https://example.com/video_thumb.jpg",
 *       "frame": "video",
 *       "tag": ["tutorial"]
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
 * @description Video gallery plugin
 */
declare class VideoGallery extends PluginBrowser {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {VideoGalleryPluginOptions} pluginOptions
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: VideoGalleryPluginOptions);
	title: any;
	onSelectfunction: (target: Node) => any;
	browser: Browser;
	width: any;
	height: any;
	#private;
}
import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';
