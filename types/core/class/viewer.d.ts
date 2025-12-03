import type {} from '../../typedef';
export default Viewer;
export type ViewerThis = Omit<Viewer & Partial<SunEditor.Injector>, 'viewer'>;
/**
 * @typedef {Omit<Viewer & Partial<SunEditor.Injector>, 'viewer'>} ViewerThis
 */
/**
 * @constructor
 * @this {ViewerThis}
 * @description Viewer(codeView, fullScreen, showBlocks) class
 * @param {SunEditor.Core} editor - The root editor instance
 */
declare function Viewer(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>, editor: SunEditor.Core): void;
declare class Viewer {
	/**
	 * @typedef {Omit<Viewer & Partial<SunEditor.Injector>, 'viewer'>} ViewerThis
	 */
	/**
	 * @constructor
	 * @this {ViewerThis}
	 * @description Viewer(codeView, fullScreen, showBlocks) class
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	bodyOverflow: string;
	editorAreaOriginCssText: string;
	wysiwygOriginCssText: string;
	codeWrapperOriginCssText: string;
	codeOriginCssText: string;
	codeNumberOriginCssText: string;
	toolbarOriginCssText: string;
	arrowOriginCssText: string;
	fullScreenInnerHeight: number;
	fullScreenSticky: boolean;
	fullScreenBalloon: boolean;
	fullScreenInline: boolean;
	toolbarParent: HTMLElement;
	/**
	 * @this {ViewerThis}
	 * @description Changes to code view or wysiwyg view
	 * @param {boolean} [value] true/false, If undefined toggle the codeView mode.
	 */
	codeView(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>, value?: boolean): void;
	/**
	 * @this {ViewerThis}
	 * @description Changes to full screen or default screen
	 * @param {boolean} [value] true/false, If undefined toggle the codeView mode.
	 */
	fullScreen(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>, value?: boolean): void;
	_originCssText: any;
	/**
	 * @this {ViewerThis}
	 * @description Add or remove the class name of "body" so that the code block is visible
	 * @param {boolean} [value] true/false, If undefined toggle the codeView mode.
	 */
	showBlocks(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>, value?: boolean): void;
	/**
	 * @internal
	 * @this {ViewerThis}
	 * @description Set the active class to the button of the toolbar
	 */
	_setButtonsActive(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>): void;
	/**
	 * @this {ViewerThis}
	 * @description Prints the current content of the editor.
	 * @throws {Error} Throws error if print operation fails.
	 */
	print(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>): void;
	/**
	 * @this {ViewerThis}
	 * @description Open the preview window.
	 */
	preview(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>): void;
	/**
	 * @internal
	 * @this {ViewerThis}
	 * @description Resets the full-screen height of the editor.
	 * - Updates the editor's height dynamically when in full-screen mode.
	 */
	_resetFullScreenHeight(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>): boolean;
	/**
	 * @internal
	 * @this {ViewerThis}
	 * @description Run CodeMirror Editor
	 * @param {"set"|"get"|"readonly"|"refresh"} key method key
	 * @param {*} value CodeMirror params
	 * @param {string} [rootKey] Root key
	 */
	_codeMirrorEditor(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>, key: 'set' | 'get' | 'readonly' | 'refresh', value: any, rootKey?: string): any;
	/**
	 * @internal
	 * @this {ViewerThis}
	 * @description Set method in the code view area
	 * @param {string} value HTML string
	 */
	_setCodeView(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>, value: string): void;
	/**
	 * @internal
	 * @this {ViewerThis}
	 * @description Get method in the code view area
	 */
	_getCodeView(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>): any;
	/**
	 * @internal
	 * @this {ViewerThis}
	 * @description Convert the data of the code view and put it in the WYSIWYG area.
	 */
	_setCodeDataToEditor(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>): void;
	/**
	 * @internal
	 * @this {ViewerThis}
	 * @description Convert the data of the WYSIWYG area and put it in the code view area.
	 */
	_setEditorDataToCodeView(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>): void;
	/**
	 * @internal
	 * @this {ViewerThis}
	 * @description Adjusts the height of the code view area.
	 * - Ensures the code block auto-resizes based on its content.
	 * @param {HTMLElement} code - Code area
	 * @param {HTMLTextAreaElement} codeNumbers - Code numbers area
	 * @param {boolean} isAuto - Auto height option
	 */
	_codeViewAutoHeight(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>, code: HTMLElement, codeNumbers: HTMLTextAreaElement, isAuto: boolean): void;
	/**
	 * @internal
	 * @this {ViewerThis}
	 * @description Updates the line numbers for the code editor.
	 * - Dynamically adjusts line numbers as content grows.
	 * @param {HTMLTextAreaElement} lineNumbers - Code numbers area
	 * @param {HTMLElement} code - Code area
	 */
	_updateLineNumbers(this: Omit<Viewer & Partial<import('../../editorInjector').default>, 'viewer'>, lineNumbers: HTMLTextAreaElement, code: HTMLElement): void;
	/**
	 * @internal
	 * @this {HTMLElement} Code numbers area
	 * @description Synchronizes scrolling of line numbers with the code editor.
	 * - Keeps the line numbers aligned with the text.
	 * @param {HTMLTextAreaElement} codeNumbers - Code numbers textarea
	 */
	_scrollLineNumbers(this: HTMLElement, codeNumbers: HTMLTextAreaElement): void;
}
