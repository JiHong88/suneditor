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
	insertBehavior?: SunEditor.ComponentInsertBehaviorType;
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
 * @property {SunEditor.ComponentInsertBehaviorType} [insertBehavior] - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */
/**
 * @class
 * @description File upload plugin
 */
declare class FileUpload extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
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
	icon: string;
	uploadUrl: string;
	uploadHeaders: {
		[x: string]: string;
	};
	uploadSizeLimit: number;
	uploadSingleSizeLimit: number;
	allowMultiple: boolean;
	acceptedFormats: string;
	as: string;
	insertBehavior: SunEditor.ComponentInsertBehaviorType;
	input: HTMLElement;
	figure: Figure;
	fileManager: FileManager;
	controller: Controller;
	editInput: HTMLInputElement;
	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - It is executed by clicking a toolbar "command" button or calling an API.
	 */
	action(): void;
	/**
	 * @editorMethod Editor.Component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target Target component element
	 */
	select(target: HTMLElement): boolean;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "paste" or "drop".
	 * @param {Object} params { frameContext, event, file }
	 * @param {SunEditor.FrameContext} params.frameContext Frame context
	 * @param {ClipboardEvent} params.event Event object
	 * @param {File} params.file File object
	 * @returns {boolean} - If return false, the file upload will be canceled
	 */
	onFilePasteAndDrop({ file }: { frameContext: SunEditor.FrameContext; event: ClipboardEvent; file: File }): boolean;
	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method that is called when a target component is edited.
	 * @param {HTMLElement|Text} target Target element
	 */
	edit(target: HTMLElement | Text): void;
	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method that is called when a button is clicked in the "controller".
	 * @param {HTMLButtonElement} target Target button element
	 */
	controllerAction(target: HTMLButtonElement): void;
	/**
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {HTMLElement} target Target element
	 * @returns {Promise<void>}
	 */
	destroy(target: HTMLElement): Promise<void>;
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
		isLast: boolean
	): void;
	#private;
}
import EditorInjector from '../../editorInjector';
import { Figure } from '../../modules';
import { FileManager } from '../../modules';
import { Controller } from '../../modules';
