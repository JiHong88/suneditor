export default Link;
export type LinkPluginOptions = {
	/**
	 * - Whether to display the link text.
	 */
	textToDisplay?: boolean;
	/**
	 * - Whether to display the link title.
	 */
	title?: boolean;
	/**
	 * - The URL endpoint for file uploads.
	 */
	uploadUrl?: string;
	/**
	 * - Additional headers for file upload requests.
	 */
	uploadHeaders?: {
		[x: string]: string;
	};
	/**
	 * - The total file upload size limit in bytes.
	 */
	uploadSizeLimit?: number;
	/**
	 * - The single file upload size limit in bytes.
	 */
	uploadSingleSizeLimit?: number;
	/**
	 * - Accepted file formats for link uploads.
	 */
	acceptedFormats?: string;
};
/**
 * @typedef {Object} LinkPluginOptions
 * @property {boolean} [textToDisplay=true] - Whether to display the link text.
 * @property {boolean} [title=true] - Whether to display the link title.
 * @property {string} [uploadUrl] - The URL endpoint for file uploads.
 * @property {Object<string, string>} [uploadHeaders] - Additional headers for file upload requests.
 * @property {number} [uploadSizeLimit] - The total file upload size limit in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file upload size limit in bytes.
 * @property {string} [acceptedFormats] - Accepted file formats for link uploads.
 */
/**
 * @class
 * @description Link plugin.
 * - This plugin provides link insertion and editing functionality within the editor.
 * - It also supports file uploads if an upload URL is provided.
 */
declare class Link extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {LinkPluginOptions} pluginOptions
	 */
	constructor(editor: __se__EditorCore, pluginOptions: LinkPluginOptions);
	title: any;
	icon: string;
	isUpdateState: boolean;
	pluginOptions: {
		uploadUrl: string;
		uploadHeaders: {
			[x: string]: string;
		};
		uploadSizeLimit: number;
		uploadSingleSizeLimit: number;
		acceptedFormats: string;
		enableFileUpload: boolean;
		/**
		 * - Whether to display the link text.
		 */
		textToDisplay?: boolean;
		/**
		 * - Whether to display the link title.
		 */
		title?: boolean;
	};
	anchor: ModalAnchorEditor;
	modal: Modal;
	controller: Controller;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement=} element - Node element where the cursor is currently located
	 * @returns {boolean} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	active(element?: (HTMLElement | null) | undefined): boolean;
	/**
	 * @editorMethod Modules.Modal
	 * @description Executes the method that is called when a "Modal" module's is opened.
	 */
	open(): void;
	/**
	 * @editorMethod Modules.Modal
	 * @description Executes the method that is called when a plugin's modal is opened.
	 * @param {boolean} isUpdate "Indicates whether the modal is for editing an existing component (true) or registering a new one (false)."
	 */
	on(isUpdate: boolean): void;
	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called when a form within a modal window is "submit".
	 * @returns {boolean} Success or failure
	 */
	modalAction(): boolean;
	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called before the modal window is opened, but before it is closed.
	 */
	init(): void;
	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method that is called when a button is clicked in the "controller".
	 * @param {HTMLButtonElement} target Target button element
	 */
	controllerAction(target: HTMLButtonElement): void;
	/**
	 * @editorMethod Modules.Controller
	 * @description This function is called before the "controller" before it is closed.
	 */
	close(): void;
}
import EditorInjector from '../../editorInjector';
import { ModalAnchorEditor } from '../../modules';
import { Modal } from '../../modules';
import { Controller } from '../../modules';
