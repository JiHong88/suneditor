import type {} from '../../typedef';
/**
 * @description Selects all content in the editor.
 * @param {__se__EditorCore} editor - The root editor instance
 */
export function SELECT_ALL(editor: __se__EditorCore): void;
/**
 * @description Toggles direction button active state.
 * @param {__se__EditorCore} editor - The root editor instance
 * @param {boolean} rtl - Whether the text direction is right-to-left.
 */
export function DIR_BTN_ACTIVE(editor: __se__EditorCore, rtl: boolean): void;
/**
 * @description Saves the editor content.
 * @param {__se__EditorCore} editor - The root editor instance
 * @returns {Promise<void>}
 */
export function SAVE(editor: __se__EditorCore): Promise<void>;
/**
 * @description Copies formatting from selected text.
 * @param {__se__EditorCore} editor - The root editor instance
 * @param {Node} button - The button triggering the copy format function.
 */
export function COPY_FORMAT(editor: __se__EditorCore, button: Node): void;
/**
 * @description Applies font styling to selected text.
 * @param {__se__EditorCore} editor - The root editor instance
 * @param {string} command - The font style command (e.g., bold, italic, underline).
 */
export function FONT_STYLE(editor: __se__EditorCore, command: string): void;
/**
 * @description Inserts a page break element into the editor.
 * @param {__se__EditorCore} editor - The root editor instance
 */
export function PAGE_BREAK(editor: __se__EditorCore): void;
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
