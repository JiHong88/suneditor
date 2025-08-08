export default ParagraphStyle;
export type ParagraphStylePluginOptions = {
	/**
	 * - Paragraph item list
	 */
	items?: Array<
		| string
		| {
				name: string;
				class: string;
				_class: string;
		  }
	>;
};
/**
 * @typedef {Object} ParagraphStylePluginOptions
 * @property {Array<string|{name: string, class: string, _class: string}>} [items] - Paragraph item list
 * @example
 * use default paragraph styles
 * ['spaced', 'bordered', 'neon']
 * custom paragraph styles
 * [
 *   { name: 'spaced', class: '__se__p-spaced', _class: '' },
 *   { name: 'bordered', class: '__se__p-bordered', _class: '' },
 *   { name: 'neon', class: '__se__p-neon', _class: '' }
 * ]
 */
/**
 * @class
 * @description A plugin to style lines using classes.
 */
declare class ParagraphStyle extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {ParagraphStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: __se__EditorCore, pluginOptions: ParagraphStylePluginOptions);
	title: any;
	icon: string;
	classList: NodeListOf<Element>;
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
