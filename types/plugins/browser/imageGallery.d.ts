import type {} from '../../typedef';
export default ImageGallery;
export type ImageGalleryPluginOptions = {
	/**
	 * - Direct data without server calls
	 */
	data?: Array<any>;
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
};
/**
 * @typedef ImageGalleryPluginOptions
 * @property {Array<*>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 */
/**
 * @class
 * @description Image gallery plugin
 */
declare class ImageGallery extends PluginBrowser {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {ImageGalleryPluginOptions} pluginOptions
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: ImageGalleryPluginOptions);
	title: any;
	onSelectfunction: (target: Node) => any;
	browser: Browser;
	width: any;
	height: any;
	#private;
}
import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';
