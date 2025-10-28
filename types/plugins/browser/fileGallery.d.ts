import type {} from '../../typedef';
export default FileGallery;
export type FileGalleryPluginOptions = {
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
 * @typedef {Object} FileGalleryPluginOptions
 * @property {Array<SunEditor.Module.Browser.File>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail
 */
/**
 * @class
 * @extends EditorInjector
 * @description File gallery plugin
 */
declare class FileGallery extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {FileGalleryPluginOptions} pluginOptions
	 */
	constructor(editor: SunEditor.Core, pluginOptions: FileGalleryPluginOptions);
	title: any;
	icon: string;
	onSelectfunction: (targe: Node) => any;
	browser: Browser;
	/**
	 * @editorMethod Modules.Browser
	 * @description Executes the method that is called when a "Browser" module's is opened.
	 * @param {?(targe: Node) => *} [onSelectfunction] method to be executed after selecting an item in the gallery
	 */
	open(onSelectfunction?: ((targe: Node) => any) | null): void;
	/**
	 * @editorMethod Modules.Browser
	 * @description Executes the method that is called when a "Browser" module's is closed.
	 */
	close(): void;
	#private;
}
import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';
