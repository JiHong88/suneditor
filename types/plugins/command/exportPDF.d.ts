import type {} from '../../typedef';
export default ExportPDF;
export type ExportPDFPluginOptions = {
	/**
	 * - Server request URL for PDF generation
	 */
	apiUrl: string;
	/**
	 * - Name of the generated PDF file
	 */
	fileName?: string;
};
/**
 * @typedef ExportPDFPluginOptions
 * @property {string} apiUrl - Server request URL for PDF generation
 * @property {string} [fileName="suneditor-pdf"] - Name of the generated PDF file
 */
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
	 * @param {ExportPDFPluginOptions} pluginOptions - plugin options
	 */
	constructor(editor: __se__EditorCore, pluginOptions: ExportPDFPluginOptions);
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
	#private;
}
import EditorInjector from '../../editorInjector';
import { ApiManager } from '../../modules';
