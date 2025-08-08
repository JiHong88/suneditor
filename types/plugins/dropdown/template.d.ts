export default Template;
export type TemplatePluginOptions = {
	/**
	 * - Template list
	 */
	items?: Array<{
		name: string;
		html: string;
	}>;
};
/**
 * @typedef {Object} TemplatePluginOptions
 * @property {Array<{name: string, html: string}>} [items] - Template list
 */
/**
 * @class
 * @description Template Plugin, Apply a template to the selection.
 */
declare class Template extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {TemplatePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: __se__EditorCore, pluginOptions: TemplatePluginOptions);
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
	 */
	action(target: HTMLElement): void;
}
import EditorInjector from '../../editorInjector';
