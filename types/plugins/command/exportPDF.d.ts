export default ExportPDF;
/**
 * @class
 * @description Export PDF plugin
 */
declare class ExportPDF extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions - plugin options
	 * @param {string} pluginOptions.apiUrl - server request url
	 * @param {string} pluginOptions.fileName - file name
	 */
	constructor(
		editor: __se__EditorCore,
		pluginOptions: {
			apiUrl: string;
			fileName: string;
		}
	);
	title: any;
	icon: string;
	apiUrl: string;
	fileName: string;
	apiManager: ApiManager;
	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - It is executed by clicking a toolbar "command" button or calling an API.
	 * @returns {Promise<void>}
	 */
	action(): Promise<void>;
	/**
	 * @private
	 * @description Sends the editor content to the server for PDF generation.
	 * @param {HTMLElement} ww - A temporary container holding the formatted editor content.
	 * @returns {Promise<void>} Resolves when the PDF file is successfully downloaded.
	 * @throws {Error} Throws an error if the server response indicates a failure.
	 */
	private _createByServer;
}
import EditorInjector from '../../editorInjector';
import { ApiManager } from '../../modules';
