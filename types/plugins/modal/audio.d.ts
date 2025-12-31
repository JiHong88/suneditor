import type {} from '../../typedef';
export default Audio_;
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
	insertBehavior?: SunEditor.ComponentInsertType;
};
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
 * @property {SunEditor.ComponentInsertType} [insertBehavior] - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */
/**
 * @class
 * @description Audio modal plugin.
 */
declare class Audio_ extends PluginModal {
	/**
	 * @this {Audio_}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(this: Audio_, node: HTMLElement): HTMLElement | null;
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {AudioPluginOptions} pluginOptions
	 */
	constructor(editor: SunEditor.Core, pluginOptions: AudioPluginOptions);
	title: any;
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
		insertBehavior: SunEditor.ComponentInsertType;
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
	retainFormat(): {
		query: string;
		method: (element: HTMLElement) => void;
	};
	onFilePasteAndDrop(params: SunEditor.HookParams.FilePasteDrop): void;
	modalOn(isUpdate: boolean): void;
	modalAction(): Promise<boolean>;
	modalInit(): void;
	controllerAction(target: HTMLButtonElement): void;
	componentSelect(target: HTMLElement): void | boolean;
	componentDestroy(target: HTMLElement): Promise<void>;
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
		isLast: boolean,
	): void;
	#private;
}
import { PluginModal } from '../../interfaces';
import { Modal } from '../../modules/contract';
import { Controller } from '../../modules/contract';
import { Figure } from '../../modules/contract';
import { FileManager } from '../../modules/manager';
