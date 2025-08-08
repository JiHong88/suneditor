export default FileBrowser;
export type BrowserFile_fileBrowser = import('../../modules/Browser').BrowserFile;
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
	thumbnail?: string | ((item: BrowserFile_fileBrowser) => string);
	/**
	 * - Additional tag names
	 */
	props?: Array<string>;
};
/**
 * @typedef {import('../../modules/Browser').BrowserFile} BrowserFile_fileBrowser
 */
/**
 * @typedef {Object} FileBrowserPluginOptions
 * @property {Object<string, *>|Array<*>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: BrowserFile_fileBrowser) => string)} [thumbnail] - Default thumbnail
 * @property {Array<string>} [props] - Additional tag names
 */
/**
 * @class
 * @extends EditorInjector
 * @description File browser plugin. Can contain any media type.
 */
declare class FileBrowser extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {FileBrowserPluginOptions} pluginOptions
	 */
	constructor(editor: __se__EditorCore, pluginOptions: FileBrowserPluginOptions);
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
