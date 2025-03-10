export default HR;
export type ShortcutInfo = import('../../core/class/shortcuts').ShortcutInfo;
/**
 * @typedef {import('../../core/class/shortcuts').ShortcutInfo} ShortcutInfo
 */
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
	 * @param {Object} params - Information of the "shortcut" plugin
	 * @param {Range} params.range - Range object
	 * @param {HTMLElement} params.line - The line element of the current range
	 * @param {ShortcutInfo} params.info - Information of the shortcut
	 * @param {KeyboardEvent} params.event - Key event object
	 * @param {string} params.keyCode - KeyBoardEvent.code
	 * @param {__se__EditorCore} params.editor - The root editor instance
	 */
	shortcut({ line, range }: { range: Range; line: HTMLElement; info: ShortcutInfo; event: KeyboardEvent; keyCode: string; editor: __se__EditorCore }): void;
	/**
	 * @description Add a hr element
	 * @param {string} className HR class name
	 */
	submit(className: string): HTMLElement;
}
import EditorInjector from '../../editorInjector';
