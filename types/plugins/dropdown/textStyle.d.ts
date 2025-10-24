import type {} from '../../typedef';
export default TextStyle;
export type TextStylePluginOptions = {
	/**
	 * - Text style item list
	 */
	items: Array<
		| string
		| {
				name: string;
				class: string;
				tag: string;
		  }
	>;
};
/**
 * @typedef {Object} TextStylePluginOptions
 * @property {Array<string|{name: string, class: string, tag: string}>} items - Text style item list
 */
/**
 * @class
 * @description Text style Plugin, Applies a tag that specifies text styles to a selection.
 */
declare class TextStyle extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {TextStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Core, pluginOptions: TextStylePluginOptions);
	title: any;
	icon: string;
	styleList: NodeListOf<Element>;
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
