export default AudioGallery;
export type BrowserFile_audioGallery = import('../../modules/Browser').BrowserFile;
/**
 * @typedef {import('../../modules/Browser').BrowserFile} BrowserFile_audioGallery
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
	 * @param {Object} pluginOptions
	 * @param {Array<*>=} pluginOptions.data - direct data without server calls
	 * @param {string} pluginOptions.url - server request url
	 * @param {Object<string, string>=} pluginOptions.headers - server request headers
	 * @param {string|((item: BrowserFile_audioGallery) => string)} pluginOptions.thumbnail - default thumbnail
	 */
	constructor(
		editor: __se__EditorCore,
		pluginOptions: {
			data?: Array<any> | undefined;
			url: string;
			headers?:
				| {
						[x: string]: string;
				  }
				| undefined;
			thumbnail: string | ((item: BrowserFile_audioGallery) => string);
		}
	);
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
