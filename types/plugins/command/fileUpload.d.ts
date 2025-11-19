import type {} from '../../typedef';
export default FileUpload;
export type FileUploadPluginOptions = {
	/**
	 * - Server request URL for file upload
	 */
	uploadUrl: string;
	/**
	 * - Server request headers
	 */
	uploadHeaders?: {
		[x: string]: string;
	};
	/**
	 * - Total upload size limit in bytes
	 */
	uploadSizeLimit?: string;
	/**
	 * - Single file size limit in bytes
	 */
	uploadSingleSizeLimit?: string;
	/**
	 * - Allow multiple file uploads
	 */
	allowMultiple?: boolean;
	/**
	 * - Accepted file formats (e.g., 'image/*, .pdf')
	 */
	acceptedFormats?: string;
	/**
	 * - Specify the default form of the file component as 'box' or 'link'
	 */
	as?: string;
	/**
	 * - Additional controls to be added to the figure
	 */
	controls?: Array<string>;
	/**
	 * - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
	 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
	 * - `select`: Always select the inserted component.
	 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
	 * - `none`: Do nothing.
	 */
	insertBehavior?: SunEditor.ComponentInsertType;
};
/**
 * @typedef FileUploadPluginOptions
 * @property {string} uploadUrl - Server request URL for file upload
 * @property {Object<string, string>} [uploadHeaders] - Server request headers
 * @property {string} [uploadSizeLimit] - Total upload size limit in bytes
 * @property {string} [uploadSingleSizeLimit] - Single file size limit in bytes
 * @property {boolean} [allowMultiple=false] - Allow multiple file uploads
 * @property {string} [acceptedFormats="*"] - Accepted file formats (e.g., 'image/*, .pdf')
 * @property {string} [as="box"] - Specify the default form of the file component as 'box' or 'link'
 * @property {Array<string>} [controls] - Additional controls to be added to the figure
 * @property {SunEditor.ComponentInsertType} [insertBehavior] - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */
/**
 * @class
 * @description File upload plugin
 */
declare class FileUpload extends PluginCommand {
	static options: {
		eventIndex: number;
	};
	/**
	 * @this {FileUpload}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(this: FileUpload, node: HTMLElement): HTMLElement | null;
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {FileUploadPluginOptions} pluginOptions - plugin options
	 */
	constructor(editor: SunEditor.Core, pluginOptions: FileUploadPluginOptions);
	title: any;
	uploadUrl: string;
	uploadHeaders: {
		[x: string]: string;
	};
	uploadSizeLimit: number;
	uploadSingleSizeLimit: number;
	allowMultiple: boolean;
	acceptedFormats: string;
	as: string;
	insertBehavior: SunEditor.ComponentInsertType;
	input: HTMLElement;
	figure: Figure;
	fileManager: FileManager;
	controller: Controller;
	editInput: HTMLInputElement;
	onFilePasteAndDrop(params: SunEditor.HookParams.FilePasteDrop): void;
	controllerAction(target: HTMLButtonElement): void;
	componentSelect(target: HTMLElement): void | boolean;
	componentEdit(target: HTMLElement): void;
	componentDestroy(target: HTMLElement): Promise<void>;
	/**
	 * @description Create an "file" component using the provided files.
	 * @param {File[]|FileList} fileList File object list
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	submitFile(fileList: File[] | FileList): Promise<boolean>;
	/**
	 * @description Convert format to link or block
	 * @param {HTMLElement} target Target element
	 * @param {string} value 'link' or 'block'
	 */
	convertFormat(target: HTMLElement, value: string): void;
	/**
	 * @description Create file element
	 * @param {string} url File URL
	 * @param {File|{name: string, size: number}} file File object
	 * @param {boolean} isLast Indicates whether this is the last file in the batch (used for scroll and insert actions).
	 */
	create(
		url: string,
		file:
			| File
			| {
					name: string;
					size: number;
			  },
		isLast: boolean,
	): void;
	#private;
}
import { PluginCommand } from '../../interfaces';
import { Figure } from '../../modules/contracts';
import { Controller } from '../../modules/contracts';
import { FileManager } from '../../modules/utils';
