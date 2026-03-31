import type {} from '../../../typedef';
export default Image_;
export type ImagePluginOptions = {
	/**
	 * - Whether the image element can be resized.
	 */
	canResize?: boolean;
	/**
	 * - Whether to display the height input field.
	 */
	showHeightInput?: boolean;
	/**
	 * - The default width of the image. If a number is provided, `"px"` will be appended.
	 */
	defaultWidth?: string;
	/**
	 * - The default height of the image. If a number is provided, `"px"` will be appended.
	 */
	defaultHeight?: string;
	/**
	 * - Whether to allow only percentage-based sizing.
	 */
	percentageOnlySize?: boolean;
	/**
	 * - Whether to create a file input element for image uploads.
	 */
	createFileInput?: boolean;
	/**
	 * - Whether to create a URL input element for image insertion.
	 * - Defaults to `true`. Always `true` when `createFileInput` is `false`.
	 */
	createUrlInput?: boolean;
	/**
	 * - The URL endpoint for image file uploads.
	 */
	uploadUrl?: string;
	/**
	 * - Additional headers to include in the file upload request.
	 * ```js
	 * { uploadUrl: '/api/upload/image', uploadHeaders: { Authorization: 'Bearer token' } }
	 * ```
	 */
	uploadHeaders?: {
		[x: string]: string;
	};
	/**
	 * - The total upload size limit in bytes.
	 */
	uploadSizeLimit?: number;
	/**
	 * - The single file upload size limit in bytes.
	 */
	uploadSingleSizeLimit?: number;
	/**
	 * - Whether multiple image uploads are allowed.
	 */
	allowMultiple?: boolean;
	/**
	 * - The accepted file formats for image uploads.
	 */
	acceptedFormats?: string;
	/**
	 * - Whether to enable format type selection (`block` or `inline`).
	 */
	useFormatType?: boolean;
	/**
	 * - The default image format type (`"block"` or `"inline"`).
	 */
	defaultFormatType?: 'block' | 'inline';
	/**
	 * - Whether to retain the chosen format type after image insertion.
	 */
	keepFormatType?: boolean;
	/**
	 * - Whether to enable file uploads for linked images.
	 */
	linkEnableFileUpload?: boolean;
	/**
	 * - Figure controls.
	 */
	controls?: SunEditor.Module.Figure.Controls;
	/**
	 * - Component insertion behavior for selection and cursor placement.
	 * - [default: `options.get('componentInsertBehavior')`]
	 * - For inline components: places cursor near the component, or selects if no nearby range.
	 * - For block components: executes behavior based on `selectMode`:
	 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
	 * - `select`: Always select the inserted component.
	 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
	 * - `none`: Do nothing.
	 */
	insertBehavior?: SunEditor.ComponentInsertType;
};
export type ImageState = {
	/**
	 * - Size unit (`'px'` or `'%'`)
	 */
	sizeUnit: string;
	/**
	 * - Whether only percentage sizing is allowed
	 */
	onlyPercentage: boolean;
	/**
	 * - Image production index for batch operations
	 */
	produceIndex: number;
};
/**
 * @typedef {Object} ImagePluginOptions
 * @property {boolean} [canResize=true] - Whether the image element can be resized.
 * @property {boolean} [showHeightInput=true] - Whether to display the height input field.
 * @property {string} [defaultWidth="auto"] - The default width of the image. If a number is provided, `"px"` will be appended.
 * @property {string} [defaultHeight="auto"] - The default height of the image. If a number is provided, `"px"` will be appended.
 * @property {boolean} [percentageOnlySize=false] - Whether to allow only percentage-based sizing.
 * @property {boolean} [createFileInput=true] - Whether to create a file input element for image uploads.
 * @property {boolean} [createUrlInput] - Whether to create a URL input element for image insertion.
 * - Defaults to `true`. Always `true` when `createFileInput` is `false`.
 * @property {string} [uploadUrl] - The URL endpoint for image file uploads.
 * @property {Object<string, string>} [uploadHeaders] - Additional headers to include in the file upload request.
 * ```js
 * { uploadUrl: '/api/upload/image', uploadHeaders: { Authorization: 'Bearer token' } }
 * ```
 * @property {number} [uploadSizeLimit] - The total upload size limit in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file upload size limit in bytes.
 * @property {boolean} [allowMultiple=false] - Whether multiple image uploads are allowed.
 * @property {string} [acceptedFormats="image/*"] - The accepted file formats for image uploads.
 * @property {boolean} [useFormatType=true] - Whether to enable format type selection (`block` or `inline`).
 * @property {'block'|'inline'} [defaultFormatType="block"] - The default image format type (`"block"` or `"inline"`).
 * @property {boolean} [keepFormatType=false] - Whether to retain the chosen format type after image insertion.
 * @property {boolean} [linkEnableFileUpload] - Whether to enable file uploads for linked images.
 * @property {SunEditor.Module.Figure.Controls} [controls] - Figure controls.
 * @property {SunEditor.ComponentInsertType} [insertBehavior] - Component insertion behavior for selection and cursor placement.
 * - [default: `options.get('componentInsertBehavior')`]
 * - For inline components: places cursor near the component, or selects if no nearby range.
 * - For block components: executes behavior based on `selectMode`:
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */
/**
 * @typedef {Object} ImageState
 * @property {string} sizeUnit - Size unit (`'px'` or `'%'`)
 * @property {boolean} onlyPercentage - Whether only percentage sizing is allowed
 * @property {number} produceIndex - Image production index for batch operations
 */
/**
 * @class
 * @description Image plugin.
 * - This plugin provides image insertion functionality within the editor, supporting both file upload and URL input.
 */
declare class Image_ extends PluginModal {
	/**
	 * @param {Element} node - The node to check.
	 * @returns {Element|null} Returns a node if the node is a valid component.
	 */
	static component(node: Element): Element | null;
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {ImagePluginOptions} pluginOptions
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: ImagePluginOptions);
	title: any;
	pluginOptions: {
		canResize: boolean;
		showHeightInput: boolean;
		defaultWidth: string;
		defaultHeight: string;
		percentageOnlySize: boolean;
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
		useFormatType: boolean;
		defaultFormatType: 'block' | 'inline';
		keepFormatType: boolean;
		insertBehavior: SunEditor.ComponentInsertType;
	};
	alignForm: HTMLElement;
	anchor: ModalAnchorEditor;
	modal: Modal;
	figure: Figure;
	fileManager: FileManager;
	/** @type {ImageState} */
	state: ImageState;
	fileModalWrapper: HTMLElement;
	imgInputFile: HTMLInputElement;
	imgUrlFile: HTMLInputElement;
	focusElement: HTMLInputElement;
	altText: HTMLInputElement;
	captionCheckEl: HTMLInputElement;
	captionEl: HTMLElement;
	previewSrc: HTMLElement;
	as: 'block' | 'inline';
	sizeService: ImageSizeService;
	uploadService: ImageUploadService;
	asBlock: HTMLButtonElement;
	asInline: HTMLButtonElement;
	/**
	 * @template {keyof ImageState} K
	 * @param {K} key
	 * @param {ImageState[K]} value
	 */
	setState<K extends keyof ImageState>(key: K, value: ImageState[K]): void;
	retainFormat(): {
		query: string;
		method: (element: HTMLElement) => void;
	};
	onFilePasteAndDrop(params: SunEditor.HookParams.FilePasteDrop): void;
	modalOn(isUpdate: boolean): void;
	modalAction(): Promise<boolean>;
	modalInit(): void;
	componentSelect(target: HTMLElement): void | boolean;
	componentEdit(target: HTMLElement): void;
	componentDestroy(target: HTMLElement): Promise<void>;
	/**
	 * @description Create an `image` component using the provided files.
	 * @param {FileList|File[]} fileList File object list
	 * @returns {Promise<boolean>} If return `false`, the file upload will be canceled
	 */
	submitFile(fileList: FileList | File[]): Promise<boolean>;
	/**
	 * @description Create an `image` component using the provided url.
	 * @param {string} url File url
	 * @returns {Promise<boolean>} If return `false`, the file upload will be canceled
	 */
	submitURL(url: string): Promise<boolean>;
	/**
	 * @description Creates a new image component, wraps it in a figure container with an optional anchor,
	 * - applies size and alignment settings, and inserts it into the editor.
	 * @param {string} src - The URL of the image to be inserted.
	 * @param {?Node} anchor - An optional anchor element to wrap the image. If provided, a clone is used.
	 * @param {string} width - The width value to be applied to the image.
	 * @param {string} height - The height value to be applied to the image.
	 * @param {string} align - The alignment setting for the image (e.g., 'left', 'center', 'right').
	 * @param {{name: string, size: number}} file - File metadata associated with the image
	 * @param {string} alt - The alternative text for the image.
	 * @param {boolean} isLast - Indicates whether this is the last file in the batch (used for scroll and insert actions).
	 */
	create(
		src: string,
		anchor: Node | null,
		width: string,
		height: string,
		align: string,
		file: {
			name: string;
			size: number;
		},
		alt: string,
		isLast: boolean,
	): void;
	/**
	 * @description Creates a new inline image component, wraps it in an inline figure container with an optional anchor,
	 * - applies size settings, and inserts it into the editor.
	 * @param {string} src - The URL of the image to be inserted.
	 * @param {?Node} anchor - An optional anchor element to wrap the image. If provided, a clone is used.
	 * @param {string} width - The width value to be applied to the image.
	 * @param {string} height - The height value to be applied to the image.
	 * @param {{name: string, size: number}} file - File metadata associated with the image
	 * @param {string} alt - The alternative text for the image.
	 * @param {boolean} isLast - Indicates whether this is the last file in the batch (used for scroll and insert actions).
	 */
	createInline(
		src: string,
		anchor: Node | null,
		width: string,
		height: string,
		file: {
			name: string;
			size: number;
		},
		alt: string,
		isLast: boolean,
	): void;
	#private;
}
import { PluginModal } from '../../../interfaces';
import { Modal } from '../../../modules/contract';
import { Figure } from '../../../modules/contract';
import { FileManager } from '../../../modules/manager';
import { ModalAnchorEditor } from '../../../modules/ui';
import ImageSizeService from './services/image.size';
import ImageUploadService from './services/image.upload';
