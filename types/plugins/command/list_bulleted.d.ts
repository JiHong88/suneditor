import type {} from '../../typedef';
export default List_bulleted;
/**
 * @class
 * @description List bulleted plugin, Several types of lists are provided.
 */
declare class List_bulleted extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	title: any;
	icon: string;
	afterItem: HTMLElement;
	listItems: NodeListOf<Element>;
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
	/**
	 * @editorMethod Editor.core
	 * @description Executes methods called by shortcut keys.
	 * @param {SunEditor.PluginShortcutInfo} params - Information of the "shortcut" plugin
	 */
	shortcut({ range, info }: SunEditor.PluginShortcutInfo): void;
	/**
	 * @description Add a bulleted list
	 * @param {string} [type=""] List type
	 */
	submit(type?: string): void;
}
import EditorInjector from '../../editorInjector';
