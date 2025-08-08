export default Font;
export type FontPluginOptions = {
	/**
	 * - Font list
	 */
	items?: Array<string>;
};
/**
 * @typedef {Object} FontPluginOptions
 * @property {Array<string>} [items] - Font list
 */
/**
 * @class
 * @description Text font plugin
 */
declare class Font extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {FontPluginOptions} pluginOptions - plugin options
	 */
	constructor(editor: __se__EditorCore, pluginOptions: FontPluginOptions);
	title: any;
	inner: string;
	currentFont: string;
	fontList: NodeListOf<Element>;
	fontArray: string[];
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement=} element - Node element where the cursor is currently located
	 * @param {?HTMLElement=} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	active(element?: (HTMLElement | null) | undefined, target?: (HTMLElement | null) | undefined): boolean;
	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} target Line element at the current cursor position
	 */
	on(target: HTMLElement): void;
	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 * @returns {Promise<void>}
	 */
	action(target: HTMLElement): Promise<void>;
}
import EditorInjector from '../../editorInjector';
