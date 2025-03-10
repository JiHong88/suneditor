export default Template;
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
	 * @param {Object} pluginOptions
	 * @param {Array<{name: string, html: string}>} pluginOptions.items - Template list
	 */
	constructor(
		editor: __se__EditorCore,
		pluginOptions: {
			items: Array<{
				name: string;
				html: string;
			}>;
		}
	);
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
