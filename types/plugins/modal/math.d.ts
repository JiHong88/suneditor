import type {} from '../../typedef';
export default Math_;
export type MathPluginOptions = {
	/**
	 * - Whether the math modal can be resized.
	 */
	canResize?: boolean;
	/**
	 * - Whether to automatically adjust the height of the modal.
	 */
	autoHeight?: boolean;
	/**
	 * - A list of font size options for the math expression size selector.
	 * ```js
	 * // fontSizeList
	 * [{ text: '1', value: '1em', default: true }, { text: '1.5', value: '1.5em' }, { text: '2', value: '2em' }]
	 * ```
	 */
	fontSizeList?: Array<{
		text: string;
		value: string;
		default?: true;
	}>;
	/**
	 * - A callback function to handle paste events in the math input area.
	 */
	onPaste?: ((...args: any) => any) | null;
	/**
	 * - An object specifying the dimensions for the math modal.
	 */
	formSize?: {
		width?: string;
		height?: string;
		maxWidth?: string;
		maxHeight?: string;
		minWidth?: string;
		minHeight?: string;
	};
};
/**
 * @typedef {Object} MathPluginOptions
 * @property {boolean} [canResize=true] - Whether the math modal can be resized.
 * @property {boolean} [autoHeight=false] - Whether to automatically adjust the height of the modal.
 * @property {Array<{text: string, value: string, default?: true}>} [fontSizeList] - A list of font size options for the math expression size selector.
 * ```js
 * // fontSizeList
 * [{ text: '1', value: '1em', default: true }, { text: '1.5', value: '1.5em' }, { text: '2', value: '2em' }]
 * ```
 * @property {?(...args: *) => *} [onPaste] - A callback function to handle paste events in the math input area.
 * @property {Object} [formSize={}] - An object specifying the dimensions for the math modal.
 * @property {string} [formSize.width="460px"] - The default width of the math modal.
 * @property {string} [formSize.height] - The default height of the math modal.
 * - Defaults to `"14em"`. When `autoHeight` is `true`, defaults to `formSize.minHeight`.
 * @property {string} [formSize.maxWidth] - The maximum width of the math modal.
 * @property {string} [formSize.maxHeight] - The maximum height of the math modal.
 * @property {string} [formSize.minWidth="400px"] - The minimum width of the math modal.
 * @property {string} [formSize.minHeight="40px"] - The minimum height of the math modal.
 */
/**
 * @class
 * @description Math plugin.
 * - This plugin provides support for rendering mathematical expressions using either the `KaTeX` or `MathJax` libraries.
 * - If external library is provided, a warning is issued.
 */
declare class Math_ extends PluginModal {
	/**
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node: HTMLElement): HTMLElement | null;
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {MathPluginOptions} pluginOptions
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: MathPluginOptions);
	title: any;
	katex: any;
	mathjax: any;
	pluginOptions: {
		formSize: {
			/**
			 * - The default width of the math modal.
			 */
			width: string;
			/**
			 * - The default height of the math modal.
			 * - Defaults to `"14em"`. When `autoHeight` is `true`, defaults to `formSize.minHeight`.
			 */
			height: string;
			/**
			 * - The maximum width of the math modal.
			 */
			maxWidth: string;
			/**
			 * - The maximum height of the math modal.
			 */
			maxHeight: string;
			/**
			 * - The minimum width of the math modal.
			 */
			minWidth: string;
			/**
			 * - The minimum height of the math modal.
			 */
			minHeight: string;
		};
		canResize: boolean;
		autoHeight: boolean;
		fontSizeList: {
			text: string;
			value: string;
			default?: true;
		}[];
		onPaste: (...args: any) => any;
	};
	defaultFontSize: any;
	modal: Modal;
	controller: Controller;
	/** @type {HTMLTextAreaElement} */
	textArea: HTMLTextAreaElement;
	/** @type {HTMLPreElement} */
	previewElement: HTMLPreElement;
	/** @type {HTMLSelectElement} */
	fontSizeElement: HTMLSelectElement;
	isUpdateState: boolean;
	retainFormat(): {
		query: string;
		method: (element: HTMLElement) => void;
	};
	modalOn(isUpdate: boolean): void;
	modalAction(): Promise<boolean>;
	modalInit(): void;
	controllerAction(target: HTMLButtonElement): void;
	controllerClose(): void;
	componentSelect(target: HTMLElement): void | boolean;
	componentDestroy(target: HTMLElement): Promise<void>;
	#private;
}
import { PluginModal } from '../../interfaces';
import { Modal } from '../../modules/contract';
import { Controller } from '../../modules/contract';
