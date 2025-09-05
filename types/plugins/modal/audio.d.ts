export default Audio_;
export type AudioInfo_audio = import('../../events').AudioInfo;
export type AudioPluginOptions = {
	/**
	 * - The default width of the audio tag (e.g., "300px").
	 */
	defaultWidth?: string;
	/**
	 * - The default height of the audio tag (e.g., "150px").
	 */
	defaultHeight?: string;
	/**
	 * - Whether to create a file input element.
	 */
	createFileInput?: boolean;
	/**
	 * - Whether to create a URL input element (default is true if file input is not created).
	 */
	createUrlInput?: boolean;
	/**
	 * - The URL to which files will be uploaded.
	 */
	uploadUrl?: string;
	/**
	 * - Headers to include in the file upload request.
	 */
	uploadHeaders?: {
		[x: string]: string;
	};
	/**
	 * - The total upload size limit in bytes.
	 */
	uploadSizeLimit?: number;
	/**
	 * - The single file size limit in bytes.
	 */
	uploadSingleSizeLimit?: number;
	/**
	 * - Whether to allow multiple file uploads.
	 */
	allowMultiple?: boolean;
	/**
	 * - Accepted file formats (default is "audio/*").
	 */
	acceptedFormats?: string;
	/**
	 * - Additional attributes to set on the audio tag.
	 */
	audioTagAttributes?: {
		[x: string]: string;
	};
	/**
	 * - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
	 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
	 * - `select`: Always select the inserted component.
	 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
	 * - `none`: Do nothing.
	 */
	insertBehavior?: __se__ComponentInsertBehaviorType;
};
/**
 * @typedef {import('../../events').AudioInfo} AudioInfo_audio
 */
/**
 * @typedef {Object} AudioPluginOptions
 * @property {string} [defaultWidth="300px"] - The default width of the audio tag (e.g., "300px").
 * @property {string} [defaultHeight="150px"] - The default height of the audio tag (e.g., "150px").
 * @property {boolean} [createFileInput] - Whether to create a file input element.
 * @property {boolean} [createUrlInput] - Whether to create a URL input element (default is true if file input is not created).
 * @property {string} [uploadUrl] - The URL to which files will be uploaded.
 * @property {Object<string, string>} [uploadHeaders] - Headers to include in the file upload request.
 * @property {number} [uploadSizeLimit] - The total upload size limit in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file size limit in bytes.
 * @property {boolean} [allowMultiple] - Whether to allow multiple file uploads.
 * @property {string} [acceptedFormats="audio/*"] - Accepted file formats (default is "audio/*").
 * @property {Object<string, string>} [audioTagAttributes] - Additional attributes to set on the audio tag.
 * @property {__se__ComponentInsertBehaviorType} [insertBehavior] - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */
/**
 * @class
 * @description Audio modal plugin.
 */
declare class Audio_ extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @this {Audio_}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(this: Audio_, node: HTMLElement): HTMLElement | null;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {AudioPluginOptions} pluginOptions
	 */
	constructor(editor: __se__EditorCore, pluginOptions: AudioPluginOptions);
	title: any;
	icon: string;
	pluginOptions: {
		defaultWidth: string;
		defaultHeight: string;
		createFileInput: boolean;
		createUrlInput: boolean;
		uploadUrl: string;
		uploadHeaders: {
			[x: string]: string;
		};
		uploadSizeLimit: number;
		uploadSingleSizeLimit: number;
		allowMultiple: boolean;
		acceptedFormats: string;
		audioTagAttributes: {
			[x: string]: string;
		};
		insertBehavior: __se__ComponentInsertBehaviorType;
	};
	modal: Modal;
	controller: Controller;
	fileManager: FileManager;
	figure: Figure;
	/** @type {HTMLElement} */
	fileModalWrapper: HTMLElement;
	/** @type {HTMLInputElement} */
	audioInputFile: HTMLInputElement;
	/** @type {HTMLInputElement} */
	audioUrlFile: HTMLInputElement;
	/** @type {HTMLElement} */
	preview: HTMLElement;
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
	 * @editorMethod Modules.Modal
	 * @description This function is called when a form within a modal window is "submit".
	 * @returns {Promise<boolean>} Success or failure
	 */
	modalAction(): Promise<boolean>;
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
	 * @editorMethod Editor.core
	 * @description This method is used to validate and preserve the format of the component within the editor.
	 * - It ensures that the structure and attributes of the element are maintained and secure.
	 * - The method checks if the element is already wrapped in a valid container and updates its attributes if necessary.
	 * - If the element isn't properly contained, a new container is created to retain the format.
	 * @returns {{query: string, method: (element: HTMLAudioElement) => void}} The format retention object containing the query and method to process the element.
	 * - query: The selector query to identify the relevant elements (in this case, 'audio').
	 * - method:The function to execute on the element to validate and preserve its format.
	 * - The function takes the element as an argument, checks if it is contained correctly, and applies necessary adjustments.
	 */
	retainFormat(): {
		query: string;
		method: (element: HTMLAudioElement) => void;
	};
	/**
	 * @editorMethod Editor.Component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target Target component element
	 */
	select(target: HTMLElement): void;
	/**
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {HTMLElement=} target Target element, if null current selected element
	 * @returns {Promise<void>}
	 */
	destroy(target?: HTMLElement | undefined): Promise<void>;
	/**
	 * @description Create an "audio" component using the provided files.
	 * @param {FileList|File[]} fileList File object list
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	submitFile(fileList: FileList | File[]): Promise<boolean>;
	/**
	 * @description Create an "audio" component using the provided url.
	 * @param {string} url File url
	 * @returns {Promise<boolean>}
	 */
	submitURL(url: string): Promise<boolean>;
	/**
	 * @description Creates or updates an audio component within the editor.
	 * - If `isUpdate` is `true`, updates the existing element's `src`.
	 * - Otherwise, inserts a new audio component with the given file.
	 * @param {HTMLAudioElement} element - The target audio element.
	 * @param {string} src - The source URL of the audio file.
	 * @param {{name: string, size: number}} file - The file metadata (name, size).
	 * @param {boolean} isUpdate - Whether to update an existing element.
	 * @param {boolean} isLast - Indicates whether this is the last file in the batch (used for scroll and insert actions).
	 */
	create(
		element: HTMLAudioElement,
		src: string,
		file: {
			name: string;
			size: number;
		},
		isUpdate: boolean,
		isLast: boolean
	): void;
	#private;
}
import EditorInjector from '../../editorInjector';
import { Modal } from '../../modules';
import { Controller } from '../../modules';
import { FileManager } from '../../modules';
import { Figure } from '../../modules';
