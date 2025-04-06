export default FileBrowser;
export type BrowserFile_fileBrowser = import('../../modules/Browser').BrowserFile;
/**
 * @typedef {import('../../modules/Browser').BrowserFile} BrowserFile_fileBrowser
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
	 * @param {Object} pluginOptions
	 * @param {Object<string, *>|Array<*>=} pluginOptions.data - direct data without server calls
	 * @param {string} pluginOptions.url - server request url
	 * @param {Object<string, string>=} pluginOptions.headers - server request headers
	 * @param {string|((item: BrowserFile_fileBrowser) => string)} pluginOptions.thumbnail - default thumbnail
	 * @param {Array<string>} pluginOptions.props - additional tag names
	 */
	constructor(
		editor: __se__EditorCore,
		pluginOptions: {
			data?:
				| (
						| {
								[x: string]: any;
						  }
						| Array<any>
				  )
				| undefined;
			url: string;
			headers?:
				| {
						[x: string]: string;
				  }
				| undefined;
			thumbnail: string | ((item: BrowserFile_fileBrowser) => string);
			props: Array<string>;
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
