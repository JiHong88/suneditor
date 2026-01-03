import type {} from '../../typedef';
/**
 * @description Selects all content in the editor.
 * @param {SunEditor.Core} editor - The root editor instance
 */
export function SELECT_ALL(editor: SunEditor.Core): void;
/**
 * @description Toggles direction button active state.
 * @param {SunEditor.Core} editor - The root editor instance
 * @param {boolean} rtl - Whether the text direction is right-to-left.
 */
export function DIR_BTN_ACTIVE(editor: SunEditor.Core, rtl: boolean): void;
/**
 * @description Saves the editor content.
 * @param {SunEditor.Core} editor - The root editor instance
 * @returns {Promise<void>}
 */
export function SAVE(editor: SunEditor.Core): Promise<void>;
/**
 * @description Copies formatting from selected text.
 * @param {SunEditor.Core} editor - The root editor instance
 * @param {Node} button - The button triggering the copy format function.
 */
export function COPY_FORMAT(editor: SunEditor.Core, button: Node): void;
/**
 * @description Applies font styling to selected text.
 * @param {SunEditor.Core} editor - The root editor instance
 * @param {string} command - The font style command (e.g., bold, italic, underline).
 */
export function FONT_STYLE(editor: SunEditor.Core, command: string): void;
/**
 * @description Inserts a page break element into the editor.
 * @param {SunEditor.Core} editor - The root editor instance
 */
export function PAGE_BREAK(editor: SunEditor.Core): void;
/**
 * @description List of commands that trigger active event handling in the editor.
 * - These commands typically apply inline formatting or structural changes.
 * @constant {string[]}
 */
export const ACTIVE_EVENT_COMMANDS: string[];
/**
 * @description List of basic editor commands, including active event commands and additional actions
 * - such as undo, redo, saving, full-screen toggle, and text direction commands.
 * @constant {string[]}
 */
export const BASIC_COMMANDS: string[];
