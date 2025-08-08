export default LineHeight;
export type LineHeightPluginOptions = {
	/**
	 * - Line height list
	 */
	items?: Array<{
		text: string;
		value: number;
	}>;
};
/**
 * @typedef {Object} LineHeightPluginOptions
 * @property {Array<{text: string, value: number}>} [items] - Line height list
 */
/**
 * @class
 * @description Line height Plugin
 */
declare class LineHeight extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {LineHeightPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: __se__EditorCore, pluginOptions: LineHeightPluginOptions);
	title: any;
	icon: string;
	sizeList: NodeListOf<Element>;
	currentSize: any;
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
	 */
	on(): void;
	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 */
	action(target: HTMLElement): void;
}
import EditorInjector from '../../editorInjector';
