export default AudioGallery;
export type BrowserFile_audioGallery = import('../../modules/Browser').BrowserFile;
export type AudioGalleryPluginOptions = {
	/**
	 * - Direct data without server calls
	 */
	data?: Array<BrowserFile_audioGallery>;
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
	thumbnail?: string | ((item: BrowserFile_audioGallery) => string);
};
/**
 * @typedef {import('../../modules/Browser').BrowserFile} BrowserFile_audioGallery
 */
/**
 * @typedef {Object} AudioGalleryPluginOptions
 * @property {Array<BrowserFile_audioGallery>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: BrowserFile_audioGallery) => string)} [thumbnail] - Default thumbnail
 */
/**
 * @class
 * @extends EditorInjector
 * @description Audio gallery plugin
 */
declare class AudioGallery extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {AudioGalleryPluginOptions} pluginOptions
	 */
	constructor(editor: __se__EditorCore, pluginOptions: AudioGalleryPluginOptions);
	title: any;
	icon: string;
	onSelectfunction: (targe: Node) => any;
	browser: Browser;
	/**
	 * @editorMethod Modules.Browser
	 * @description Executes the method that is called when a "Browser" module's is opened.
	 * @param {?(targe: Node) => *=} onSelectfunction method to be executed after selecting an item in the gallery
	 */
	open(onSelectfunction?: (((targe: Node) => any) | null) | undefined): void;
	/**
	 * @editorMethod Modules.Browser
	 * @description Executes the method that is called when a "Browser" module's is closed.
	 */
	close(): void;
	#private;
}
import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';
