import type {} from '../../typedef';
export default Shortcuts;
export type ShortcutsThis = Omit<Shortcuts & Partial<SunEditor.Injector>, 'shortcuts'>;
export type ShortcutInfo = {
	/**
	 * - Whether the [Ctrl, Command] key is pressed.
	 */
	c: boolean;
	/**
	 * - Whether the [Shift] key is pressed.
	 */
	s: boolean;
	/**
	 * - Whether the [Space] key is pressed.
	 */
	space: boolean;
	/**
	 * - Whether the Enter key is pressed.
	 */
	enter: boolean;
	/**
	 * - The command key. (e.g. "bold")
	 */
	command: string;
	/**
	 * - Whether the cursor is at the end of the line.
	 */
	edge: boolean;
	/**
	 * - The key pressed (e.g., "1.").
	 */
	key?: string;
	/**
	 * - The keyEvent.code.
	 */
	keyCode?: string;
	/**
	 * - A plugin's "shortcut" method that is called instead of the default "editor.run" method.
	 */
	method?: string | ((...args: any) => any);
	/**
	 * - The plugin name.
	 */
	plugin: string;
	/**
	 * - Plugin's type. ("command", "dropdown", "modal", "browser", "input", "field", "popup").
	 */
	type: string;
	/**
	 * - The plugin command button.
	 */
	button: Node;
	/**
	 * - An array of key codes generated with the reverseButtons option, used to reverse the action for a specific key combination.
	 */
	r: Array<string>;
	/**
	 * - Whether the event was triggered by a text input (e.g., mention like
	 */
	textTrigger: string;
};
/**
 * @typedef {Omit<Shortcuts & Partial<SunEditor.Injector>, 'shortcuts'>} ShortcutsThis
 */
/**
 * @typedef {Object} ShortcutInfo
 * @property {boolean} c - Whether the [Ctrl, Command] key is pressed.
 * @property {boolean} s - Whether the [Shift] key is pressed.
 * @property {boolean} space - Whether the [Space] key is pressed.
 * @property {boolean} enter - Whether the Enter key is pressed.
 * @property {string} command - The command key. (e.g. "bold")
 * @property {boolean} edge - Whether the cursor is at the end of the line.
 * @property {string} [key] - The key pressed (e.g., "1.").
 * @property {string} [keyCode] - The keyEvent.code.
 * @property {string|((...args: *) => *)} [method] - A plugin's "shortcut" method that is called instead of the default "editor.run" method.
 * @property {string} plugin - The plugin name.
 * @property {string} type - Plugin's type. ("command", "dropdown", "modal", "browser", "input", "field", "popup").
 * @property {Node} button - The plugin command button.
 * @property {Array<string>} r - An array of key codes generated with the reverseButtons option, used to reverse the action for a specific key combination.
 * @property {string} textTrigger - Whether the event was triggered by a text input (e.g., mention like @ab).
 */
/**
 * @constructor
 * @this {ShortcutsThis}
 * @description Shortcuts class
 * @param {SunEditor.Core} editor - The root editor instance
 */
declare function Shortcuts(this: Omit<Shortcuts & Partial<import('../../editorInjector').default>, 'shortcuts'>, editor: SunEditor.Core): void;
declare class Shortcuts {
	/**
	 * @typedef {Omit<Shortcuts & Partial<SunEditor.Injector>, 'shortcuts'>} ShortcutsThis
	 */
	/**
	 * @typedef {Object} ShortcutInfo
	 * @property {boolean} c - Whether the [Ctrl, Command] key is pressed.
	 * @property {boolean} s - Whether the [Shift] key is pressed.
	 * @property {boolean} space - Whether the [Space] key is pressed.
	 * @property {boolean} enter - Whether the Enter key is pressed.
	 * @property {string} command - The command key. (e.g. "bold")
	 * @property {boolean} edge - Whether the cursor is at the end of the line.
	 * @property {string} [key] - The key pressed (e.g., "1.").
	 * @property {string} [keyCode] - The keyEvent.code.
	 * @property {string|((...args: *) => *)} [method] - A plugin's "shortcut" method that is called instead of the default "editor.run" method.
	 * @property {string} plugin - The plugin name.
	 * @property {string} type - Plugin's type. ("command", "dropdown", "modal", "browser", "input", "field", "popup").
	 * @property {Node} button - The plugin command button.
	 * @property {Array<string>} r - An array of key codes generated with the reverseButtons option, used to reverse the action for a specific key combination.
	 * @property {string} textTrigger - Whether the event was triggered by a text input (e.g., mention like @ab).
	 */
	/**
	 * @constructor
	 * @this {ShortcutsThis}
	 * @description Shortcuts class
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	editor: import('../editor').default;
	isDisabled: boolean;
	/**
	 * @this {ShortcutsThis}
	 * @description If there is a shortcut function, run it.
	 * @param {KeyboardEvent} event Keyboard event object
	 * @param {boolean} ctrl Whether the Ctrl key is pressed
	 * @param {boolean} shift Whether the Shift key is pressed
	 * @param {string} keyCode The keyEvent.code.
	 * @param {string} text The text content of the key
	 * @param {boolean} edge Whether the cursor is at the end of the line
	 * @param {HTMLElement} line The current line node
	 * @param {Range} range The current range object
	 * @returns {boolean} Whether to execute shortcuts
	 */
	command(this: Omit<Shortcuts & Partial<import('../../editorInjector').default>, 'shortcuts'>, event: KeyboardEvent, ctrl: boolean, shift: boolean, keyCode: string, text: string, edge: boolean, line: HTMLElement, range: Range): boolean;
	/**
	 * @this {ShortcutsThis}
	 * @description Disable the shortcut activation.
	 */
	disable(this: Omit<Shortcuts & Partial<import('../../editorInjector').default>, 'shortcuts'>): void;
	/**
	 * @this {ShortcutsThis}
	 * @description Enable the shortcut activation.
	 */
	enable(this: Omit<Shortcuts & Partial<import('../../editorInjector').default>, 'shortcuts'>): void;
	/**
	 * @internal
	 * @this {ShortcutsThis}
	 * @description Destroy the Shortcuts instance and release memory
	 */
	_destroy(this: Omit<Shortcuts & Partial<import('../../editorInjector').default>, 'shortcuts'>): void;
}
