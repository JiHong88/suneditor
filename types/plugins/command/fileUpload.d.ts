export default FileUpload;
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
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions - plugin options
	 * @param {string} pluginOptions.uploadUrl - server request url
	 * @param {Object<string, string>=} pluginOptions.uploadHeaders - server request headers
	 * @param {string=} pluginOptions.uploadSizeLimit - upload size limit
	 * @param {string=} pluginOptions.uploadSingleSizeLimit - upload single size limit
	 * @param {boolean=} pluginOptions.allowMultiple - allow multiple files
	 * @param {string=} pluginOptions.acceptedFormats - accepted formats
	 * @param {string=} pluginOptions.as - Whether to use the 'Box' or 'Link' conversion button
	 * @param {Array<string>} pluginOptions.controls - Additional controls to be added to the figure
	 */
	constructor(
		editor: __se__EditorCore,
		pluginOptions: {
			uploadUrl: string;
			uploadHeaders?:
				| {
						[x: string]: string;
				  }
				| undefined;
			uploadSizeLimit?: string | undefined;
			uploadSingleSizeLimit?: string | undefined;
			allowMultiple?: boolean | undefined;
			acceptedFormats?: string | undefined;
			as?: string | undefined;
			controls: Array<string>;
		}
	);
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
	_acceptedCheck: string[];
	as: string;
	input: HTMLElement;
	_element: HTMLElement;
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
	 * @param {__se__FrameContext} params.frameContext Frame context
	 * @param {ClipboardEvent} params.event Event object
	 * @param {File} params.file File object
	 * @returns {boolean} - If return false, the file upload will be canceled
	 */
	onFilePasteAndDrop({ file }: { frameContext: __se__FrameContext; event: ClipboardEvent; file: File }): boolean;
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
	 * @param {boolean} isLast Is last file
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
	/**
	 * @private
	 * @description Processes the server response after file upload.
	 * - Registers the uploaded files in the editor.
	 * @param {Object<string, *>} response - The response object from the server.
	 */
	private _register;
	/**
	 * @private
	 * @description Handles file upload errors.
	 * - Displays an error message if the upload fails.
	 * @param {Object<string, *>} response - The error response from the server.
	 * @returns {Promise<void>}
	 */
	private _error;
	#private;
}
import EditorInjector from '../../editorInjector';
import { Figure } from '../../modules';
import { FileManager } from '../../modules';
import { Controller } from '../../modules';
