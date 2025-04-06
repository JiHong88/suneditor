export default HR;
/**
 * @class
 * @description HR Plugin
 */
declare class HR extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @this {HR}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(this: HR, node: HTMLElement): HTMLElement | null;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions
	 * @param {Array<{name: string, class: string}>} pluginOptions.items - HR list
	 */
	constructor(
		editor: __se__EditorCore,
		pluginOptions: {
			items: Array<{
				name: string;
				class: string;
			}>;
		}
	);
	title: any;
	icon: string;
	list: NodeListOf<HTMLButtonElement>;
	/**
	 * @editorMethod Editor.Component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target Target component element
	 */
	select(target: HTMLElement): void;
	/**
	 * @editorMethod Editor.Component
	 * @description Called when a container is deselected.
	 * @param {HTMLElement} element Target element
	 */
	deselect(element: HTMLElement): void;
	/**
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {HTMLElement} target Target element
	 */
	destroy(target: HTMLElement): void;
	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 */
	action(target: HTMLElement): void;
	/**
	 * @editorMethod Editor.core
	 * @description Executes methods called by shortcut keys.
	 * @param {__se__PluginShortcutInfo} params - Information of the "shortcut" plugin
	 */
	shortcut({ line, range }: __se__PluginShortcutInfo): void;
	/**
	 * @description Add a hr element
	 * @param {string} className HR class name
	 */
	submit(className: string): HTMLElement;
}
import EditorInjector from '../../editorInjector';
