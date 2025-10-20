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
	 * - A list of font size options for rendering math expressions.
	 */
	fontSizeList?: Array<object>;
	/**
	 * - A callback function to handle paste events in the math input area.
	 */
	onPaste?: (...args: any) => any;
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
 * @property {Array<object>} [fontSizeList] - A list of font size options for rendering math expressions.
 * @property {(...args: *) => *} [onPaste] - A callback function to handle paste events in the math input area.
 * @property {Object} [formSize={}] - An object specifying the dimensions for the math modal.
 * @property {string} [formSize.width="460px"] - The default width of the math modal.
 * @property {string} [formSize.height="14em"] - The default height of the math modal.
 * @property {string} [formSize.maxWidth] - The maximum width of the math modal.
 * @property {string} [formSize.maxHeight] - The maximum height of the math modal.
 * @property {string} [formSize.minWidth="400px"] - The minimum width of the math modal.
 * @property {string} [formSize.minHeight="40px"] - The minimum height of the math modal.
 */
/**
 * @class
 * @description Math plugin.
 * - This plugin provides support for rendering mathematical expressions using either the KaTeX or MathJax libraries.
 * - If external library is provided, a warning is issued.
 */
declare class Math_ extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @this {Math_}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(this: Math_, node: HTMLElement): HTMLElement | null;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {MathPluginOptions} pluginOptions
	 */
	constructor(editor: __se__EditorCore, pluginOptions: MathPluginOptions);
	title: any;
	icon: string;
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
		fontSizeList: any[];
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
	/**
	 * @editorMethod Editor.component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target Target component element
	 */
	select(target: HTMLElement): void;
	/**
	 * @editorMethod Modules.Controller
	 * @description This function is called before the "controller" before it is closed.
	 */
	close(): void;
	/**
	 * @editorMethod Editor.core
	 * @description This method is used to validate and preserve the format of the component within the editor.
	 * - It ensures that the structure and attributes of the element are maintained and secure.
	 * - The method checks if the element is already wrapped in a valid container and updates its attributes if necessary.
	 * - If the element isn't properly contained, a new container is created to retain the format.
	 * @returns {{query: string, method: (element: HTMLElement) => void}} The format retention object containing the query and method to process the element.
	 * - query: The selector query to identify the relevant elements (in this case, 'audio').
	 * - method:The function to execute on the element to validate and preserve its format.
	 * - The function takes the element as an argument, checks if it is contained correctly, and applies necessary adjustments.
	 */
	retainFormat(): {
		query: string;
		method: (element: HTMLElement) => void;
	};
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
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {Node} target Target element
	 */
	destroy(target: Node): void;
	#private;
}
import EditorInjector from '../../editorInjector';
import { Modal } from '../../modules';
import { Controller } from '../../modules';
