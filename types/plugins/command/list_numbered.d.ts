export default List_numbered;
export type ShortcutInfo = import('../../core/class/shortcuts').ShortcutInfo;
/**
 * @typedef {import('../../core/class/shortcuts').ShortcutInfo} ShortcutInfo
 */
/**
 * @class
 * @description List numbered plugin, Several types of lists are provided.
 */
declare class List_numbered extends EditorInjector {
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
	 * @param {Object} params - Information of the "shortcut" plugin
	 * @param {Range} params.range - Range object
	 * @param {HTMLElement} params.line - The line element of the current range
	 * @param {ShortcutInfo} params.info - Information of the shortcut
	 * @param {KeyboardEvent} params.event - Key event object
	 * @param {string} params.keyCode - KeyBoardEvent.code
	 * @param {Object} params.editor - The root editor instance
	 */
	shortcut({ range, info }: { range: Range; line: HTMLElement; info: ShortcutInfo; event: KeyboardEvent; keyCode: string; editor: any }): void;
	/**
	 * @description Add a numbered list
	 * @param {string} [type=""] List type
	 */
	submit(type?: string): void;
}
import EditorInjector from '../../editorInjector';
