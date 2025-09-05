export default Video;
export type ModalReturns_video = {
	html: HTMLElement;
	alignForm: HTMLElement;
	fileModalWrapper: HTMLElement;
	videoInputFile: HTMLInputElement;
	videoUrlFile: HTMLInputElement;
	previewSrc: HTMLElement;
	galleryButton: HTMLButtonElement;
	proportion: HTMLInputElement;
	frameRatioOption: HTMLSelectElement;
	inputX: HTMLInputElement;
	inputY: HTMLInputElement;
	revertBtn: HTMLButtonElement;
	fileRemoveBtn: HTMLButtonElement;
};
export type VideoInfo_video = import('../../events').VideoInfo;
export type FigureControls_video = import('../../modules/Figure').FigureControls;
export type VideoPluginOptions = {
	/**
	 * - Whether the video element can be resized.
	 */
	canResize?: boolean;
	/**
	 * - Whether to display the height input field.
	 */
	showHeightInput?: boolean;
	/**
	 * - The default width of the video element. If a number is provided, "px" will be appended.
	 */
	defaultWidth?: string;
	/**
	 * - The default height of the video element. If a number is provided, "px" will be appended.
	 */
	defaultHeight?: string;
	/**
	 * - Whether to allow only percentage-based sizing.
	 */
	percentageOnlySize?: boolean;
	/**
	 * - Whether to create a file input element for video uploads.
	 */
	createFileInput?: boolean;
	/**
	 * - Whether to create a URL input element for video embedding.
	 */
	createUrlInput?: boolean;
	/**
	 * - The URL endpoint for video file uploads.
	 */
	uploadUrl?: string;
	/**
	 * - Additional headers to include in the video upload request.
	 */
	uploadHeaders?: {
		[x: string]: string;
	};
	/**
	 * - The total upload size limit for videos in bytes.
	 */
	uploadSizeLimit?: number;
	/**
	 * - The single file upload size limit for videos in bytes.
	 */
	uploadSingleSizeLimit?: number;
	/**
	 * - Whether multiple video uploads are allowed.
	 */
	allowMultiple?: boolean;
	/**
	 * - Accepted file formats for video uploads.
	 */
	acceptedFormats?: string;
	/**
	 * - The default aspect ratio for the video (e.g., 16:9 is 0.5625).
	 */
	defaultRatio?: number;
	/**
	 * - Whether to display the ratio option in the modal.
	 */
	showRatioOption?: boolean;
	/**
	 * - Custom ratio options for video resizing.
	 */
	ratioOptions?: any[];
	/**
	 * - Additional attributes to set on the video tag.
	 */
	videoTagAttributes?: {
		[x: string]: string;
	};
	/**
	 * - Additional attributes to set on the iframe tag.
	 */
	iframeTagAttributes?: {
		[x: string]: string;
	};
	/**
	 * - Additional query parameters for YouTube embedding.
	 */
	query_youtube?: string;
	/**
	 * - Additional query parameters for Vimeo embedding.
	 */
	query_vimeo?: string;
	/**
	 * - Custom query objects for additional embedding services.
	 */
	embedQuery?: {
		[x: string]: {
			pattern: RegExp;
			action: (url: string) => string;
			tag: string;
		};
	};
	/**
	 * - Additional URL patterns for video embedding.
	 */
	urlPatterns?: Array<RegExp>;
	/**
	 * - Additional file extensions to be recognized for video uploads.
	 */
	extensions?: Array<string>;
	/**
	 * - Figure controls.
	 */
	controls?: FigureControls_video;
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
 * @typedef {import('../../events').VideoInfo} VideoInfo_video
 */
/**
 * @typedef {import('../../modules/Figure').FigureControls} FigureControls_video
 */
/**
 * @typedef {Object} VideoPluginOptions
 * @property {boolean} [canResize=true] - Whether the video element can be resized.
 * @property {boolean} [showHeightInput=true] - Whether to display the height input field.
 * @property {string} [defaultWidth] - The default width of the video element. If a number is provided, "px" will be appended.
 * @property {string} [defaultHeight] - The default height of the video element. If a number is provided, "px" will be appended.
 * @property {boolean} [percentageOnlySize=false] - Whether to allow only percentage-based sizing.
 * @property {boolean} [createFileInput=false] - Whether to create a file input element for video uploads.
 * @property {boolean} [createUrlInput=true] - Whether to create a URL input element for video embedding.
 * @property {string} [uploadUrl] - The URL endpoint for video file uploads.
 * @property {Object<string, string>} [uploadHeaders] - Additional headers to include in the video upload request.
 * @property {number} [uploadSizeLimit] - The total upload size limit for videos in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file upload size limit for videos in bytes.
 * @property {boolean} [allowMultiple=false] - Whether multiple video uploads are allowed.
 * @property {string} [acceptedFormats="video/*"] - Accepted file formats for video uploads.
 * @property {number} [defaultRatio=0.5625] - The default aspect ratio for the video (e.g., 16:9 is 0.5625).
 * @property {boolean} [showRatioOption=true] - Whether to display the ratio option in the modal.
 * @property {Array} [ratioOptions] - Custom ratio options for video resizing.
 * @property {Object<string, string>} [videoTagAttributes] - Additional attributes to set on the video tag.
 * @property {Object<string, string>} [iframeTagAttributes] - Additional attributes to set on the iframe tag.
 * @property {string} [query_youtube=""] - Additional query parameters for YouTube embedding.
 * @property {string} [query_vimeo=""] - Additional query parameters for Vimeo embedding.
 * @property {Object<string, {pattern: RegExp, action: (url: string) => string, tag: string}>} [embedQuery] - Custom query objects for additional embedding services.
 * @property {Array<RegExp>} [urlPatterns] - Additional URL patterns for video embedding.
 * @property {Array<string>} [extensions] - Additional file extensions to be recognized for video uploads.
 * @property {FigureControls_video} [controls] - Figure controls.
 * @property {__se__ComponentInsertBehaviorType} [insertBehavior] - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */
/**
 * @class
 * @description Video plugin.
 * - This plugin provides video embedding functionality within the editor.
 * - It also supports embedding from popular video services
 */
declare class Video extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @this {Video}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(this: Video, node: HTMLElement): HTMLElement | null;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {VideoPluginOptions} pluginOptions
	 */
	constructor(editor: __se__EditorCore, pluginOptions: VideoPluginOptions);
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
		defaultRatio: number;
		showRatioOption: boolean;
		ratioOptions: any[];
		videoTagAttributes: {
			[x: string]: string;
		};
		iframeTagAttributes: {
			[x: string]: string;
		};
		query_youtube: string;
		query_vimeo: string;
		insertBehavior: __se__ComponentInsertBehaviorType;
	};
	modal: Modal;
	figure: Figure;
	fileManager: FileManager;
	fileModalWrapper: HTMLElement;
	videoInputFile: HTMLInputElement;
	videoUrlFile: HTMLInputElement;
	focusElement: HTMLInputElement;
	previewSrc: HTMLElement;
	sizeUnit: string;
	proportion: HTMLInputElement;
	frameRatioOption: HTMLSelectElement;
	inputX: HTMLInputElement;
	inputY: HTMLInputElement;
	query: {
		youtube: {
			pattern: RegExp;
			action: (url: any) => string;
			tag: string;
		};
		vimeo: {
			pattern: RegExp;
			action: (url: any) => string;
			tag: string;
		};
	};
	extensions: string[];
	urlPatterns: RegExp[];
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
	onFilePasteAndDrop({ file }: { frameContext: __se__FrameContext; event: ClipboardEvent; file: File }): boolean;
	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called when a form within a modal window is "submit".
	 * @returns {Promise<boolean>} Success / failure
	 */
	modalAction(): Promise<boolean>;
	/**
	 * @editorMethod Editor.core
	 * @description This method is used to validate and preserve the format of the component within the editor.
	 * - It ensures that the structure and attributes of the element are maintained and secure.
	 * - The method checks if the element is already wrapped in a valid container and updates its attributes if necessary.
	 * - If the element isn't properly contained, a new container is created to retain the format.
	 * @returns {{query: string, method: (element: HTMLIFrameElement|HTMLVideoElement) => void}} The format retention object containing the query and method to process the element.
	 * - query: The selector query to identify the relevant elements (in this case, 'audio').
	 * - method:The function to execute on the element to validate and preserve its format.
	 * - The function takes the element as an argument, checks if it is contained correctly, and applies necessary adjustments.
	 */
	retainFormat(): {
		query: string;
		method: (element: HTMLIFrameElement | HTMLVideoElement) => void;
	};
	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called before the modal window is opened, but before it is closed.
	 */
	init(): void;
	/**
	 * @editorMethod Editor.component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLIFrameElement|HTMLVideoElement} target Target component element
	 */
	select(target: HTMLIFrameElement | HTMLVideoElement): void;
	/**
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {HTMLElement} target Target element
	 * @returns {Promise<void>}
	 */
	destroy(target: HTMLElement): Promise<void>;
	/**
	 * @description Checks if the given URL matches any of the defined URL patterns.
	 * @param {string} url - The URL to check.
	 * @returns {boolean} True if the URL matches a known pattern; otherwise, false.
	 */
	checkContentType(url: string): boolean;
	/**
	 * @description Finds and processes the URL for video by matching it against known service patterns.
	 * @param {string} url - The original URL.
	 * @returns {{origin: string, url: string, tag: string}|null} An object containing the original URL, the processed URL, and the tag type (e.g., 'iframe'),
	 * or null if no matching pattern is found.
	 */
	findProcessUrl(url: string): {
		origin: string;
		url: string;
		tag: string;
	} | null;
	/**
	 * @description Converts a YouTube URL into an embeddable URL.
	 * - If the URL does not start with "http", it prepends "https://". It also replaces "watch?v=" with the embed path.
	 * @param {string} url - The original YouTube URL.
	 * @returns {string} The converted YouTube embed URL.
	 */
	convertUrlYoutube(url: string): string;
	/**
	 * @description Converts a Vimeo URL into an embeddable URL.
	 * - Removes any trailing slash and extracts the video ID from the URL.
	 * @param {string} url - The original Vimeo URL.
	 * @returns {string} The converted Vimeo embed URL.
	 */
	convertUrlVimeo(url: string): string;
	/**
	 * @description Adds query parameters to a URL.
	 * - If the URL already contains a query string, the provided query is appended with an "&".
	 * @param {string} url - The original URL.
	 * @param {string} query - The query string to append.
	 * @returns {string} The URL with the appended query parameters.
	 */
	addQuery(url: string, query: string): string;
	/**
	 * @description Creates or updates a video embed component.
	 * - When updating, it replaces the existing element if necessary and applies the new source, size, and alignment.
	 * - When creating, it wraps the provided element in a figure container.
	 * @param {HTMLIFrameElement|HTMLVideoElement} oFrame - The existing video element (for update) or a newly created one.
	 * @param {string} src - The source URL for the video.
	 * @param {string} width - The desired width for the video element.
	 * @param {string} height - The desired height for the video element.
	 * @param {string} align - The alignment to apply to the video element (e.g., 'left', 'center', 'right').
	 * @param {boolean} isUpdate - Indicates whether this is an update to an existing component (true) or a new creation (false).
	 * @param {{name: string, size: number}} file - File metadata associated with the video
	 * @param {boolean} isLast - Indicates whether this is the last file in the batch (used for scroll and insert actions).
	 */
	create(
		oFrame: HTMLIFrameElement | HTMLVideoElement,
		src: string,
		width: string,
		height: string,
		align: string,
		isUpdate: boolean,
		file: {
			name: string;
			size: number;
		},
		isLast: boolean
	): void;
	/**
	 * @description Creates a new iframe element for video embedding.
	 * - Applies any additional properties provided and sets the necessary attributes for embedding.
	 * @param {Object<string, string>} [props] - An optional object containing properties to assign to the iframe.
	 * @returns {HTMLIFrameElement} The newly created iframe element.
	 */
	createIframeTag(props?: { [x: string]: string }): HTMLIFrameElement;
	/**
	 * @description Creates a new video element for video embedding.
	 * - Applies any additional properties provided and sets the necessary attributes.
	 * @param {Object<string, string>} [props] - An optional object containing properties to assign to the video element.
	 * @returns {HTMLVideoElement} The newly created video element.
	 */
	createVideoTag(props?: { [x: string]: string }): HTMLVideoElement;
	/**
	 * @description Create an "video" component using the provided files.
	 * @param {FileList|File[]} fileList File object list
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	submitFile(fileList: FileList | File[]): Promise<boolean>;
	/**
	 * @description Create an "video" component using the provided url.
	 * @param {string} url File url
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	submitURL(url: string): Promise<boolean>;
	#private;
}
import EditorInjector from '../../editorInjector';
import { Modal } from '../../modules';
import { Figure } from '../../modules';
import { FileManager } from '../../modules';
