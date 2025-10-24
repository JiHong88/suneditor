import type {} from '../../typedef';
export default Image_;
export type ModalReturns_image = {
	html: HTMLElement;
	alignForm: HTMLElement;
	fileModalWrapper: HTMLElement;
	imgInputFile: HTMLInputElement;
	imgUrlFile: HTMLInputElement;
	altText: HTMLInputElement;
	captionCheckEl: HTMLInputElement;
	previewSrc: HTMLElement;
	tabs: HTMLElement;
	galleryButton: HTMLButtonElement;
	proportion: HTMLInputElement;
	inputX: HTMLInputElement;
	inputY: HTMLInputElement;
	revertBtn: HTMLButtonElement;
	asBlock: HTMLButtonElement;
	asInline: HTMLButtonElement;
	fileRemoveBtn: HTMLButtonElement;
};
export type ImageInfo_image = import('../../events').ImageInfo;
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
	 * - The default width of the image. If a number is provided, "px" will be appended.
	 */
	defaultWidth?: string;
	/**
	 * - The default height of the image. If a number is provided, "px" will be appended.
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
	 */
	createUrlInput?: boolean;
	/**
	 * - The URL endpoint for image file uploads.
	 */
	uploadUrl?: string;
	/**
	 * - Additional headers to include in the file upload request.
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
	 * - Whether to enable format type selection (block or inline).
	 */
	useFormatType?: boolean;
	/**
	 * - The default image format type ("block" or "inline").
	 */
	defaultFormatType?: string;
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
	controls?: import('../../modules/Figure').FigureControls;
	/**
	 * - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
	 * - For inline components: places the cursor near the inserted component or selects it if no nearby range is available.
	 * - For block components: executes behavior based on `selectMode`:
	 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
	 * - `select`: Always select the inserted component.
	 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
	 * - `none`: Do nothing.
	 */
	insertBehavior?: SunEditor.ComponentInsertBehaviorType;
};
/**
 * @typedef {import('../../events').ImageInfo} ImageInfo_image
 */
/**
 * @typedef {Object} ImagePluginOptions
 * @property {boolean} [canResize=true] - Whether the image element can be resized.
 * @property {boolean} [showHeightInput=true] - Whether to display the height input field.
 * @property {string} [defaultWidth="auto"] - The default width of the image. If a number is provided, "px" will be appended.
 * @property {string} [defaultHeight="auto"] - The default height of the image. If a number is provided, "px" will be appended.
 * @property {boolean} [percentageOnlySize=false] - Whether to allow only percentage-based sizing.
 * @property {boolean} [createFileInput=true] - Whether to create a file input element for image uploads.
 * @property {boolean} [createUrlInput=true] - Whether to create a URL input element for image insertion.
 * @property {string} [uploadUrl] - The URL endpoint for image file uploads.
 * @property {Object<string, string>} [uploadHeaders] - Additional headers to include in the file upload request.
 * @property {number} [uploadSizeLimit] - The total upload size limit in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file upload size limit in bytes.
 * @property {boolean} [allowMultiple=false] - Whether multiple image uploads are allowed.
 * @property {string} [acceptedFormats="image/*"] - The accepted file formats for image uploads.
 * @property {boolean} [useFormatType=true] - Whether to enable format type selection (block or inline).
 * @property {string} [defaultFormatType="block"] - The default image format type ("block" or "inline").
 * @property {boolean} [keepFormatType=false] - Whether to retain the chosen format type after image insertion.
 * @property {boolean} [linkEnableFileUpload] - Whether to enable file uploads for linked images.
 * @property {import('../../modules/Figure').FigureControls} [controls] - Figure controls.
 * @property {SunEditor.ComponentInsertBehaviorType} [insertBehavior] - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
 * - For inline components: places the cursor near the inserted component or selects it if no nearby range is available.
 * - For block components: executes behavior based on `selectMode`:
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */
/**
 * @class
 * @description Image plugin.
 * - This plugin provides image insertion functionality within the editor, supporting both file upload and URL input.
 */
declare class Image_ extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @this {Image_}
	 * @param {Element} node - The node to check.
	 * @returns {Element|null} Returns a node if the node is a valid component.
	 */
	static component(this: Image_, node: Element): Element | null;
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {ImagePluginOptions} pluginOptions
	 */
	constructor(editor: SunEditor.Core, pluginOptions: ImagePluginOptions);
	title: any;
	icon: string;
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
		defaultFormatType: string;
		keepFormatType: boolean;
		insertBehavior: SunEditor.ComponentInsertBehaviorType;
	};
	alignForm: HTMLElement;
	anchor: ModalAnchorEditor;
	modal: Modal;
	figure: Figure;
	fileManager: FileManager;
	fileModalWrapper: HTMLElement;
	imgInputFile: HTMLInputElement;
	imgUrlFile: HTMLInputElement;
	focusElement: HTMLInputElement;
	altText: HTMLInputElement;
	captionCheckEl: HTMLInputElement;
	captionEl: HTMLElement;
	previewSrc: HTMLElement;
	sizeUnit: string;
	as: string;
	proportion: HTMLInputElement;
	inputX: HTMLInputElement;
	inputY: HTMLInputElement;
	_base64RenderIndex: number;
	asBlock: HTMLButtonElement;
	asInline: HTMLButtonElement;
	/**
	 * @editorMethod Modules.Modal
	 * @description Executes the method that is called when a "Modal" module's is opened.
	 */
	open(): void;
	/**
	 * @editorMethod Modules.Controller(Figure)
	 * @description Executes the method that is called when a target component is edited.
	 */
	edit(): void;
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
	 * @param {SunEditor.FrameContext} params.frameContext Frame context
	 * @param {ClipboardEvent} params.event Event object
	 * @param {File} params.file File object
	 * @returns {boolean} - If return false, the file upload will be canceled
	 */
	onFilePasteAndDrop({ file }: { frameContext: SunEditor.FrameContext; event: ClipboardEvent; file: File }): boolean;
	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called when a form within a modal window is "submit".
	 * @returns {Promise<boolean>} Success or failure
	 */
	modalAction(): Promise<boolean>;
	/**
	 * @editorMethod Editor.core
	 * @description This method is used to validate and preserve the format of the component within the editor.
	 * - It ensures that the structure and attributes of the element are maintained and secure.
	 * - The method checks if the element is already wrapped in a valid container and updates its attributes if necessary.
	 * - If the element isn't properly contained, a new container is created to retain the format.
	 * @returns {{query: string, method: (element: HTMLImageElement) => void}} The format retention object containing the query and method to process the element.
	 * - query: The selector query to identify the relevant elements (in this case, 'audio').
	 * - method:The function to execute on the element to validate and preserve its format.
	 * - The function takes the element as an argument, checks if it is contained correctly, and applies necessary adjustments.
	 */
	retainFormat(): {
		query: string;
		method: (element: HTMLImageElement) => void;
	};
	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called before the modal window is opened, but before it is closed.
	 */
	init(): void;
	/**
	 * @editorMethod Editor.Component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target Target component element
	 */
	select(target: HTMLElement): void;
	/**
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {HTMLElement} target Target element
	 * @returns {Promise<void>}
	 */
	destroy(target: HTMLElement): Promise<void>;
	/**
	 * @description Create an "image" component using the provided files.
	 * @param {FileList|File[]} fileList File object list
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	submitFile(fileList: FileList | File[]): Promise<boolean>;
	/**
	 * @description Create an "image" component using the provided url.
	 * @param {string} url File url
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
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
		isLast: boolean
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
		isLast: boolean
	): void;
	#private;
}
import EditorInjector from '../../editorInjector';
import { ModalAnchorEditor } from '../../modules';
import { Modal } from '../../modules';
import { Figure } from '../../modules';
import { FileManager } from '../../modules';
