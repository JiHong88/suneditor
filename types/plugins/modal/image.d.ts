export default Image_;
export type ModalReturns = {
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
export type ImageInfo = import('../../core/base/events').ImageInfo;
export type FigureControls = import('../../modules/Figure').FigureControls;
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
	controls?: FigureControls;
};
/**
 * @typedef {import('../../core/base/events').ImageInfo} ImageInfo
 */
/**
 * @typedef {import('../../modules/Figure').FigureControls} FigureControls
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
 * @property {FigureControls} [controls] - Figure controls.
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
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {ImagePluginOptions} pluginOptions
	 */
	constructor(editor: __se__EditorCore, pluginOptions: ImagePluginOptions);
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
	_linkElement: any;
	_linkValue: string;
	_align: string;
	_svgDefaultSize: string;
	_base64RenderIndex: number;
	_element: any;
	_cover: any;
	_container: any;
	_caption: HTMLElement;
	_ratio: {
		w: number;
		h: number;
	};
	_origin_w: string;
	_origin_h: string;
	_resizing: boolean;
	_onlyPercentage: boolean;
	_nonResizing: boolean;
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
	 * @param {__se__FrameContext} params.frameContext Frame context
	 * @param {ClipboardEvent} params.event Event object
	 * @param {File} params.file File object
	 * @returns {boolean} - If return false, the file upload will be canceled
	 */
	onPastAndDrop({ file }: { frameContext: __se__FrameContext; event: ClipboardEvent; file: File }): boolean;
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
	 * @private
	 * @description Prepares the component for selection.
	 * - Ensures that the controller is properly positioned and initialized.
	 * - Prevents duplicate event handling if the component is already selected.
	 * @param {HTMLElement} target - The selected element.
	 */
	private _ready;
	/**
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {HTMLElement} target Target element
	 * @returns {Promise<void>}
	 */
	destroy(target: HTMLElement): Promise<void>;
	/**
	 * @private
	 * @description Retrieves the current image information.
	 * @returns {*} - The image data.
	 */
	private _getInfo;
	/**
	 * @private
	 * @description Toggles between block and inline image format.
	 * @param {boolean} isInline - Whether the image should be inline.
	 */
	private _activeAsInline;
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
	 * @private
	 * @description Updates the selected image size, alt text, and caption.
	 * @param {string} width - New image width.
	 * @param {string} height - New image height.
	 */
	private _update;
	/**
	 * @private
	 * @description Validates the image size and applies necessary transformations.
	 * @param {string} width - The width of the image.
	 * @param {string} height - The height of the image.
	 */
	private _fileCheck;
	/**
	 * @private
	 * @description Creates a new image component based on provided parameters.
	 * @param {string} src - The image source URL.
	 * @param {?Node} anchor - Optional anchor wrapping the image.
	 * @param {string} width - Image width.
	 * @param {string} height - Image height.
	 * @param {string} align - Image alignment.
	 * @param {{name: string, size: number}} file - File metadata.
	 * @param {string} alt - Alternative text.
	 */
	private _produce;
	/**
	 * @private
	 * @description Applies the specified width and height to the image.
	 * @param {string} w - Image width.
	 * @param {string} h - Image height.
	 */
	private _applySize;
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
		alt: string
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
		alt: string
	): void;
	/**
	 * @private
	 * @description Updates the image source URL.
	 * @param {string} src - The new image source.
	 * @param {HTMLImageElement} element - The image element.
	 * @param {{ name: string, size: number }} file - File metadata.
	 */
	private _updateSrc;
	/**
	 * @private
	 * @description Registers the uploaded image and inserts it into the editor.
	 * @param {ImageInfo} info - Image info.
	 * @param {Object<string, *>} response - Server response data.
	 */
	private _register;
	/**
	 * @private
	 * @description Uploads the image to the server.
	 * @param {ImageInfo} info - Image upload info.
	 * @param {FileList} files - List of image files.
	 */
	private _serverUpload;
	/**
	 * @private
	 * @description Converts an image file to Base64 and inserts it into the editor.
	 * @param {FileList|File[]} files - List of image files.
	 * @param {?Node} anchor - Optional anchor wrapping the image.
	 * @param {string} width - Image width.
	 * @param {string} height - Image height.
	 * @param {string} align - Image alignment.
	 * @param {string} alt - Alternative text.
	 * @param {boolean} isUpdate - Whether the image is being updated.
	 */
	private _setBase64;
	/**
	 * @private
	 * @description Inserts an image using a Base64-encoded string.
	 * @param {boolean} update - Whether the image is being updated.
	 * @param {Array<{result: string, file: { name: string, size: number }}>} filesStack - Stack of Base64-encoded files.
	 * - result: Image url or Base64-encoded string
	 * - file: File metadata ({ name: string, size: number })
	 * @param {HTMLImageElement} updateElement - The image element being updated.
	 * @param {?HTMLAnchorElement} anchor - Optional anchor wrapping the image.
	 * @param {string} width - Image width.
	 * @param {string} height - Image height.
	 * @param {string} align - Image alignment.
	 * @param {string} alt - Alternative text.
	 */
	private _onRenderBase64;
	/**
	 * @private
	 * @description Wraps an image element with an anchor if provided.
	 * @param {Node} imgTag - The image element to be wrapped.
	 * @param {?Node} anchor - The anchor element to wrap around the image. If null, returns the image itself.
	 * @returns {Node} - The wrapped image inside the anchor or the original image element.
	 */
	private _setAnchor;
	/**
	 * @private
	 * @description Handles errors during image upload and displays appropriate messages.
	 * @param {Object<string, *>} response - The error response from the server.
	 * @returns {Promise<void>}
	 */
	private _error;
	#private;
}
import EditorInjector from '../../editorInjector';
import { ModalAnchorEditor } from '../../modules';
import { Modal } from '../../modules';
import { Figure } from '../../modules';
import { FileManager } from '../../modules';
