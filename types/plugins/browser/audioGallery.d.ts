import type {} from '../../typedef';
export default AudioGallery;
export type AudioGalleryPluginOptions = {
	/**
	 * - Direct data without server calls
	 */
	data?: Array<SunEditor.Module.Browser.File>;
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
};
/**
 * @typedef {Object} AudioGalleryPluginOptions
 * @property {Array<SunEditor.Module.Browser.File>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail
 */
/**
 * @class
 * @description Audio gallery plugin
 */
declare class AudioGallery extends PluginBrowser {
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {AudioGalleryPluginOptions} pluginOptions
	 */
	constructor(editor: SunEditor.Core, pluginOptions: AudioGalleryPluginOptions);
	title: any;
	onSelectfunction: (target: Node) => any;
	browser: Browser;
	#private;
}
import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contracts';
