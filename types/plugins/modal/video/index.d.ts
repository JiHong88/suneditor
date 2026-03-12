import type {} from '../../../typedef';
export default Video;
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
	 * - The default width of the video element. If a number is provided, `"px"` will be appended.
	 */
	defaultWidth?: string;
	/**
	 * - The default height of the video element. If a number is provided, `"px"` will be appended.
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
	 * - Accepted file formats for video uploads (`"video/*"`).
	 */
	acceptedFormats?: string;
	/**
	 * - The default aspect ratio for the video (height/width, e.g. 16:9 → `9/16 = 0.5625`).
	 */
	defaultRatio?: number;
	/**
	 * - Whether to display the ratio option in the modal.
	 */
	showRatioOption?: boolean;
	/**
	 * - Custom ratio options for video resizing (value = height/width).
	 * ```js
	 * // ratioOptions
	 * [{ name: '16:9', value: 0.5625 }, { name: '4:3', value: 0.75 }]
	 * ```
	 */
	ratioOptions?: Array<{
		name: string;
		value: number;
	}>;
	/**
	 * - Additional attributes to set on the `VIDEO` tag.
	 * ```js
	 * { videoTagAttributes: { controls: 'true', muted: 'true', playsinline: '' } }
	 * ```
	 */
	videoTagAttributes?: {
		[x: string]: string;
	};
	/**
	 * - Additional attributes to set on the `IFRAME` tag.
	 * ```js
	 * { iframeTagAttributes: { allowfullscreen: 'true', loading: 'lazy' } }
	 * ```
	 */
	iframeTagAttributes?: {
		[x: string]: string;
	};
	/**
	 * - Additional query parameters for YouTube embedding.
	 * ```js
	 * { query_youtube: 'autoplay=1&mute=1' }
	 * ```
	 */
	query_youtube?: string;
	/**
	 * - Additional query parameters for Vimeo embedding.
	 * ```js
	 * { query_vimeo: 'autoplay=1' }
	 * ```
	 */
	query_vimeo?: string;
	/**
	 * - Custom embed service definitions (see `EmbedPluginOptions.embedQuery`).
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
	controls?: SunEditor.Module.Figure.Controls;
	/**
	 * - Component insertion behavior for selection and cursor placement.
	 * - [default: `options.get('componentInsertBehavior')`]
	 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
	 * - `select`: Always select the inserted component.
	 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
	 * - `none`: Do nothing.
	 */
	insertBehavior?: SunEditor.ComponentInsertType;
};
export type VideoState = {
	sizeUnit: string;
	onlyPercentage: boolean;
	defaultRatio: string;
};
/**
 * @typedef {Object} VideoPluginOptions
 * @property {boolean} [canResize=true] - Whether the video element can be resized.
 * @property {boolean} [showHeightInput=true] - Whether to display the height input field.
 * @property {string} [defaultWidth] - The default width of the video element. If a number is provided, `"px"` will be appended.
 * @property {string} [defaultHeight] - The default height of the video element. If a number is provided, `"px"` will be appended.
 * @property {boolean} [percentageOnlySize=false] - Whether to allow only percentage-based sizing.
 * @property {boolean} [createFileInput=false] - Whether to create a file input element for video uploads.
 * @property {boolean} [createUrlInput=true] - Whether to create a URL input element for video embedding.
 * @property {string} [uploadUrl] - The URL endpoint for video file uploads.
 * @property {Object<string, string>} [uploadHeaders] - Additional headers to include in the video upload request.
 * @property {number} [uploadSizeLimit] - The total upload size limit for videos in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file upload size limit for videos in bytes.
 * @property {boolean} [allowMultiple=false] - Whether multiple video uploads are allowed.
 * @property {string} [acceptedFormats="video/*"] - Accepted file formats for video uploads (`"video/*"`).
 * @property {number} [defaultRatio=0.5625] - The default aspect ratio for the video (height/width, e.g. 16:9 → `9/16 = 0.5625`).
 * @property {boolean} [showRatioOption=true] - Whether to display the ratio option in the modal.
 * @property {Array<{name: string, value: number}>} [ratioOptions] - Custom ratio options for video resizing (value = height/width).
 * ```js
 * // ratioOptions
 * [{ name: '16:9', value: 0.5625 }, { name: '4:3', value: 0.75 }]
 * ```
 * @property {Object<string, string>} [videoTagAttributes] - Additional attributes to set on the `VIDEO` tag.
 * ```js
 * { videoTagAttributes: { controls: 'true', muted: 'true', playsinline: '' } }
 * ```
 * @property {Object<string, string>} [iframeTagAttributes] - Additional attributes to set on the `IFRAME` tag.
 * ```js
 * { iframeTagAttributes: { allowfullscreen: 'true', loading: 'lazy' } }
 * ```
 * @property {string} [query_youtube=""] - Additional query parameters for YouTube embedding.
 * ```js
 * { query_youtube: 'autoplay=1&mute=1' }
 * ```
 * @property {string} [query_vimeo=""] - Additional query parameters for Vimeo embedding.
 * ```js
 * { query_vimeo: 'autoplay=1' }
 * ```
 * @property {Object<string, {pattern: RegExp, action: (url: string) => string, tag: string}>} [embedQuery] - Custom embed service definitions (see `EmbedPluginOptions.embedQuery`).
 * @property {Array<RegExp>} [urlPatterns] - Additional URL patterns for video embedding.
 * @property {Array<string>} [extensions] - Additional file extensions to be recognized for video uploads.
 * @property {SunEditor.Module.Figure.Controls} [controls] - Figure controls.
 * @property {SunEditor.ComponentInsertType} [insertBehavior] - Component insertion behavior for selection and cursor placement.
 * - [default: `options.get('componentInsertBehavior')`]
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */
/**
 * @typedef {Object} VideoState
 * @property {string} sizeUnit
 * @property {boolean} onlyPercentage
 * @property {string} defaultRatio
 */
/**
 * @class
 * @description Video plugin.
 * - This plugin provides video embedding functionality within the editor.
 * - It also supports embedding from popular video services
 */
declare class Video extends PluginModal {
	/**
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node: HTMLElement): HTMLElement | null;
	/**
	 * @description Checks if the given URL matches any of the defined URL patterns.
	 * @param {string} url - The URL to check.
	 * @returns {boolean} `true` if the URL matches a known pattern; otherwise, `false`.
	 */
	static #checkContentType(url: string): boolean;
	static #extensions: string[];
	static #urlPatterns: RegExp[];
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {VideoPluginOptions} pluginOptions
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: VideoPluginOptions);
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
		defaultRatio: number;
		showRatioOption: boolean;
		ratioOptions: {
			name: string;
			value: number;
		}[];
		videoTagAttributes: {
			[x: string]: string;
		};
		iframeTagAttributes: {
			[x: string]: string;
		};
		query_youtube: string;
		query_vimeo: string;
		insertBehavior: SunEditor.ComponentInsertType;
	};
	modal: Modal;
	figure: Figure;
	fileManager: FileManager;
	fileModalWrapper: HTMLElement;
	videoInputFile: HTMLInputElement;
	videoUrlFile: HTMLInputElement;
	focusElement: HTMLInputElement;
	previewSrc: HTMLElement;
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
	/** @type {VideoState} */
	state: VideoState;
	sizeService: VideoSizeService;
	uploadService: VideoUploadService;
	/**
	 * @template {keyof VideoState} K
	 * @param {K} key
	 * @param {VideoState[K]} value
	 */
	setState<K extends keyof VideoState>(key: K, value: VideoState[K]): void;
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
	 * @description Finds and processes the URL for video by matching it against known service patterns.
	 * @param {string} url - The original URL.
	 * @returns {{origin: string, url: string, tag: string}|null} An object containing the original URL, the processed URL, and the tag type (e.g., `iframe`),
	 * or `null` if no matching pattern is found.
	 */
	findProcessUrl(url: string): {
		origin: string;
		url: string;
		tag: string;
	} | null;
	/**
	 * @description Converts a YouTube URL into an embeddable URL.
	 * - If the URL does not start with `"http"`, it prepends `"https://"`.
	 * - It also replaces `"watch?v="` with the embed path.
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
	 * - If the URL already contains a query string, the provided query is appended with an `"&"`.
	 * @param {string} url - The original URL.
	 * @param {string} query - The query string to append.
	 * @returns {string} The URL with the appended query parameters.
	 */
	addQuery(url: string, query: string): string;
	/**
	 * @description Creates or updates a video embed component.
	 * - When updating, it replaces the existing element if necessary
	 * - and applies the new source, size, and alignment.
	 * - When creating, it wraps the provided element in a figure container.
	 * @param {HTMLIFrameElement|HTMLVideoElement} oFrame - The existing video element (for update) or a newly created one.
	 * @param {string} src - The source URL for the video.
	 * @param {string} width - The desired width for the video element.
	 * @param {string} height - The desired height for the video element.
	 * @param {string} align - The alignment to apply to the video element (e.g., 'left', 'center', 'right').
	 * @param {boolean} isUpdate - Indicates whether this is an update to an existing component (`true`) or a new creation (`false`).
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
		isLast: boolean,
	): void;
	/**
	 * @description Creates a new `IFRAME` element for video embedding.
	 * - Applies any additional properties provided and sets the necessary attributes for embedding.
	 * @param {Object<string, string>} [props] - An optional object containing properties to assign to the `IFRAME`.
	 * @returns {HTMLIFrameElement} The newly created `IFRAME` element.
	 */
	createIframeTag(props?: { [x: string]: string }): HTMLIFrameElement;
	/**
	 * @description Creates a new `VIDEO` element for video embedding.
	 * - Applies any additional properties provided and sets the necessary attributes.
	 * @param {Object<string, string>} [props] - An optional object containing properties to assign to the `VIDEO` element.
	 * @returns {HTMLVideoElement} The newly created `VIDEO` element.
	 */
	createVideoTag(props?: { [x: string]: string }): HTMLVideoElement;
	/**
	 * @description Create a `video` component using the provided files.
	 * @param {FileList|File[]} fileList File object list
	 * @returns {Promise<boolean>} If return `false`, the file upload will be canceled
	 */
	submitFile(fileList: FileList | File[]): Promise<boolean>;
	/**
	 * @description Create a `video` component using the provided url.
	 * @param {string} url File url
	 * @returns {Promise<boolean>} If return `false`, the file upload will be canceled
	 */
	submitURL(url: string): Promise<boolean>;
	#private;
}
import { PluginModal } from '../../../interfaces';
import { Modal } from '../../../modules/contract';
import { Figure } from '../../../modules/contract';
import { FileManager } from '../../../modules/manager';
import VideoSizeService from './services/video.size';
import VideoUploadService from './services/video.upload';
