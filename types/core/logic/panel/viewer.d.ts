import type {} from '../../../typedef';
export default Viewer;
/**
 * @description Viewer(codeView, fullScreen, showBlocks) class
 */
declare class Viewer {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/**
	 * @description Changes to code view or wysiwyg view
	 * @param {boolean} [value] true/false, If undefined toggle the codeView mode.
	 */
	codeView(value?: boolean): void;
	/**
	 * @description Changes to full screen or default screen
	 * @param {boolean} [value] true/false, If undefined toggle the codeView mode.
	 */
	fullScreen(value?: boolean): void;
	/**
	 * @description Add or remove the class name of "body" so that the code block is visible
	 * @param {boolean} [value] true/false, If undefined toggle the codeView mode.
	 */
	showBlocks(value?: boolean): void;
	/**
	 * @internal
	 * @description Set the active class to the button of the toolbar
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
	 * @description Run CodeMirror Editor
	 * @param {"set"|"get"|"readonly"|"refresh"} key method key
	 * @param {*} value CodeMirror params
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
	 * - Ensures the code block auto-resizes based on its content.
	 * @param {HTMLElement} code - Code area
	 * @param {HTMLTextAreaElement} codeNumbers - Code numbers area
	 * @param {boolean} isAuto - Auto height option
	 */
	_codeViewAutoHeight(code: HTMLElement, codeNumbers: HTMLTextAreaElement, isAuto: boolean): void;
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
	 * @description Destroy the Viewer instance and release memory
	 */
	_destroy(): void;
	#private;
}
