import type {} from '../../../typedef';
export default Viewer;
/**
 * @description Viewer (`codeView`, `fullScreen`, `showBlocks`) class
 */
declare class Viewer {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/**
	 * @description Changes to code view or wysiwyg view
	 * @param {boolean} [value] `true`/`false`, If `undefined` toggle the `codeView` mode.
	 */
	codeView(value?: boolean): void;
	/**
	 * @description Changes to markdown view or wysiwyg view
	 * @param {boolean} [value] `true`/`false`, If `undefined` toggle the `markdownView` mode.
	 */
	markdownView(value?: boolean): void;
	/**
	 * @description Changes to full screen or default screen
	 * @param {boolean} [value] `true`/`false`, If `undefined` toggle the `fullScreen` mode.
	 */
	fullScreen(value?: boolean): void;
	/**
	 * @description Add or remove the class name of `body` so that the code block is visible
	 * @param {boolean} [value] `true`/`false`, If `undefined` toggle the `showBlocks` mode.
	 */
	showBlocks(value?: boolean): void;
	/**
	 * @internal
	 * @description Set the `active` class to the button of the toolbar
	 */
	_setButtonsActive(): void;
	/**
	 * @description Prints the current content of the editor.
	 * @throws {Error} Throws error if print operation fails.
	 */
	print(): void;
	/**
	 * @description Open the preview window.
	 */
	preview(): void;
	/**
	 * @internal
	 * @description Resets the full-screen height of the editor.
	 * - Updates the editor's height dynamically when in full-screen mode.
	 */
	_resetFullScreenHeight(): boolean;
	/**
	 * @internal
	 * @description Run `CodeMirror` Editor
	 * @param {"set"|"get"|"readonly"|"refresh"} key Method key
	 * @param {*} value `CodeMirror` params
	 * @param {string} [rootKey] Root key
	 */
	_codeMirrorEditor(key: 'set' | 'get' | 'readonly' | 'refresh', value: any, rootKey?: string): any;
	/**
	 * @internal
	 * @description Set method in the code view area
	 * @param {string} value HTML string
	 */
	_setCodeView(value: string): void;
	/**
	 * @internal
	 * @description Get method in the code view area
	 */
	_getCodeView(): any;
	/**
	 * @internal
	 * @description Adjusts the height of the code view area.
	 * - Ensures the code block `auto`-resizes based on its content.
	 * @param {HTMLTextAreaElement} code - Code area
	 * @param {HTMLTextAreaElement} codeNumbers - Code numbers area
	 * @param {boolean} isAuto - `auto` height option
	 */
	_codeViewAutoHeight(code: HTMLTextAreaElement, codeNumbers: HTMLTextAreaElement, isAuto: boolean): void;
	/**
	 * @internal
	 * @this {HTMLElement} Code numbers area
	 * @description Synchronizes scrolling of line numbers with the code editor.
	 * - Keeps the line numbers aligned with the text.
	 * @param {HTMLTextAreaElement} codeNumbers - Code numbers textarea
	 */
	_scrollLineNumbers(this: HTMLElement, codeNumbers: HTMLTextAreaElement): void;
	/**
	 * @internal
	 * @description Adjusts the height of the markdown view area.
	 * @param {HTMLTextAreaElement} md - Markdown area
	 * @param {HTMLTextAreaElement} mdNumbers - Markdown numbers area
	 * @param {boolean} isAuto - `auto` height option
	 */
	_markdownViewAutoHeight(md: HTMLTextAreaElement, mdNumbers: HTMLTextAreaElement, isAuto: boolean): void;
	/**
	 * @internal
	 * @this {HTMLElement} Markdown numbers area
	 * @description Synchronizes scrolling of line numbers with the markdown editor.
	 * @param {HTMLTextAreaElement} mdNumbers - Markdown numbers textarea
	 */
	_scrollMarkdownLineNumbers(this: HTMLElement, mdNumbers: HTMLTextAreaElement): void;
	/**
	 * @internal
	 * @description Destroy the Viewer instance and release memory
	 */
	_destroy(): void;
	#private;
}
