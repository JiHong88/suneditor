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
declare class ExportPDF extends PluginCommand {
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {ExportPDFPluginOptions} pluginOptions - plugin options
	 */
	constructor(editor: SunEditor.Core, pluginOptions: ExportPDFPluginOptions);
	title: any;
	apiUrl: string;
	fileName: string;
	apiManager: ApiManager;
	#private;
}
import { PluginCommand } from '../../interfaces';
import { ApiManager } from '../../modules/manager';
