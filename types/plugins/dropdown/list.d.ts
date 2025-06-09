export default List;
/**
 * @class
 * @description List Plugin (OL, UL)
 */
declare class List extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	title: any;
	icon: string;
	listItems: NodeListOf<Element>;
	icons: {
		bulleted: string;
		numbered: string;
	};
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
	 */
	action(target: HTMLElement): void;
}
import EditorInjector from '../../editorInjector';
