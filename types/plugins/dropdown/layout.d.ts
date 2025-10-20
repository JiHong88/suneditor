import type {} from '../../typedef';
export default Layout;
export type LayoutPluginOptions = {
	/**
	 * - Layout list
	 */
	items?: Array<{
		name: string;
		html: string;
	}>;
};
/**
 * @typedef {Object} LayoutPluginOptions
 * @property {Array<{name: string, html: string}>} [items] - Layout list
 */
/**
 * @class
 * @description Layout Plugin, Apply layout to the entire editor.
 */
declare class Layout extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {LayoutPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: __se__EditorCore, pluginOptions: LayoutPluginOptions);
	title: any;
	icon: string;
	selectedIndex: number;
	items: {
		name: string;
		html: string;
	}[];
	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 * @throws {Error} Throws error if layout HTML is not found.
	 */
	action(target: HTMLElement): void;
}
import EditorInjector from '../../editorInjector';
