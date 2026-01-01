import type {} from '../../typedef';
export default Embed;
export type EmbedPluginOptions = {
	/**
	 * - Whether the embed element can be resized.
	 */
	canResize?: boolean;
	/**
	 * - Whether to display the height input field.
	 */
	showHeightInput?: boolean;
	/**
	 * - The default width of the embed element (numeric value or with unit).
	 */
	defaultWidth?: string;
	/**
	 * - The default height of the embed element (numeric value or with unit).
	 */
	defaultHeight?: string;
	/**
	 * - Whether to allow only percentage-based sizing.
	 */
	percentageOnlySize?: boolean;
	/**
	 * - The URL for file uploads.
	 */
	uploadUrl?: string;
	/**
	 * - Headers to include in file upload requests.
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
	 * - Additional attributes to set on the iframe tag.
	 */
	iframeTagAttributes?: {
		[x: string]: string;
	};
	/**
	 * - YouTube query parameter.
	 */
	query_youtube?: string;
	/**
	 * - Vimeo query parameter.
	 */
	query_vimeo?: string;
	/**
	 * - Additional URL patterns for embed.
	 */
	urlPatterns?: Array<RegExp>;
	/**
	 * - Custom query objects for additional embedding services.
	 * Example :
	 * {
	 * facebook: {
	 * pattern: /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com)\/(.+)/i,
	 * action: (url) => {
	 * return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`;
	 * },
	 * tag: 'iframe'
	 * },
	 * twitter: {
	 * pattern: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com)\/(status|embed)\/(.+)/i,
	 * action: (url) => {
	 * return `https://platform.twitter.com/embed/Tweet.html?url=${encodeURIComponent(url)}`;
	 * },
	 * tag: 'iframe'
	 * },
	 * // Additional services...
	 * }
	 */
	embedQuery?: {
		[x: string]: {
			pattern: RegExp;
			action: (url: string) => string;
			tag: string;
		};
	};
	/**
	 * - Figure controls.
	 */
	controls?: SunEditor.Module.Figure.Controls;
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
 * @typedef {Object} EmbedPluginOptions
 * @property {boolean} [canResize=true] - Whether the embed element can be resized.
 * @property {boolean} [showHeightInput=true] - Whether to display the height input field.
 * @property {string} [defaultWidth] - The default width of the embed element (numeric value or with unit).
 * @property {string} [defaultHeight] - The default height of the embed element (numeric value or with unit).
 * @property {boolean} [percentageOnlySize=false] - Whether to allow only percentage-based sizing.
 * @property {string} [uploadUrl] - The URL for file uploads.
 * @property {Object<string, string>} [uploadHeaders] - Headers to include in file upload requests.
 * @property {number} [uploadSizeLimit] - The total file upload size limit in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file upload size limit in bytes.
 * @property {Object<string, string>} [iframeTagAttributes] - Additional attributes to set on the iframe tag.
 * @property {string} [query_youtube] - YouTube query parameter.
 * @property {string} [query_vimeo] - Vimeo query parameter.
 * @property {Array<RegExp>} [urlPatterns] - Additional URL patterns for embed.
 * @property {Object<string, {pattern: RegExp, action: (url: string) => string, tag: string}>} [embedQuery] - Custom query objects for additional embedding services.
 * Example :
 * {
 *   facebook: {
 *     pattern: /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com)\/(.+)/i,
 *     action: (url) => {
 *       return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`;
 *     },
 *     tag: 'iframe'
 *   },
 *   twitter: {
 *     pattern: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com)\/(status|embed)\/(.+)/i,
 *     action: (url) => {
 *       return `https://platform.twitter.com/embed/Tweet.html?url=${encodeURIComponent(url)}`;
 *     },
 *     tag: 'iframe'
 *   },
 *   // Additional services...
 * }
 * @property {SunEditor.Module.Figure.Controls} [controls] - Figure controls.
 * @property {SunEditor.ComponentInsertType} [insertBehavior] - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */
/**
 * @class
 * @description Embed modal plugin.
 * - This plugin provides a modal interface for embedding external content (e.g., videos, iframes) into the editor.
 */
declare class Embed extends PluginModal {
	/**
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node: HTMLElement): HTMLElement | null;
	/**
	 * @description Checks if the given URL matches any of the defined URL patterns.
	 * @param {string} url - The URL to check.
	 * @returns {boolean} True if the URL matches a known pattern; otherwise, false.
	 */
	static #checkContentType(url: string): boolean;
	/** @type {Array<RegExp>} */
	static #urlPatterns: Array<RegExp>;
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {EmbedPluginOptions} pluginOptions
	 */
	constructor(editor: SunEditor.Core, pluginOptions: EmbedPluginOptions);
	title: any;
	pluginOptions: {
		canResize: boolean;
		showHeightInput: boolean;
		defaultWidth: string;
		defaultHeight: string;
		percentageOnlySize: boolean;
		uploadUrl: string;
		uploadHeaders: {
			[x: string]: string;
		};
		uploadSizeLimit: number;
		uploadSingleSizeLimit: number;
		iframeTagAttributes: {
			[x: string]: string;
		};
		query_youtube: string;
		query_vimeo: string;
		insertBehavior: SunEditor.ComponentInsertType;
	};
	modal: Modal;
	figure: Figure;
	fileModalWrapper: HTMLElement;
	embedInput: HTMLInputElement;
	focusElement: HTMLInputElement;
	previewSrc: HTMLElement;
	sizeUnit: string;
	proportion: HTMLInputElement;
	inputX: HTMLInputElement;
	inputY: HTMLInputElement;
	query: {
		facebook: {
			pattern: RegExp;
			action: (url: any) => string;
			tag: string;
		};
		twitter: {
			pattern: RegExp;
			action: (url: any) => string;
			tag: string;
		};
		instagram: {
			pattern: RegExp;
			action: (url: any) => string;
			tag: string;
		};
		linkedin: {
			pattern: RegExp;
			action: (url: any) => string;
			tag: string;
		};
		pinterest: {
			pattern: RegExp;
			action: (url: any) => string;
			tag: string;
		};
		spotify: {
			pattern: RegExp;
			action: (url: any) => string;
			tag: string;
		};
		codepen: {
			pattern: RegExp;
			action: (url: any) => string;
			tag: string;
		};
	};
	retainFormat(): {
		query: string;
		method: (element: HTMLElement) => void;
	};
	modalOn(isUpdate: boolean): void;
	modalAction(): Promise<boolean>;
	modalInit(): void;
	componentSelect(target: HTMLElement): void | boolean;
	componentEdit(target: HTMLElement): void;
	componentDestroy(target: HTMLElement): Promise<void>;
	/**
	 * @description Finds and processes the URL for embedding by matching it against known service patterns.
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
	 * @description Processes the provided source (URL or embed code) and submits it for embedding.
	 * - It parses the input, triggers any necessary events, and creates or updates the embed component.
	 * @param {string} [src] - The embed source. If not provided, uses the internally stored link value.
	 * @returns {Promise<boolean>} A promise that resolves to true on success or false on failure.
	 */
	submitSRC(src?: string): Promise<boolean>;
	_caption: HTMLElement;
	#private;
}
import { PluginModal } from '../../interfaces';
import { Modal } from '../../modules/contract';
import { Figure } from '../../modules/contract';
