/**
 * ================================================================================================================================
 * === Frame context
 * =================================================================================================================================
 */
/**
 * @description Elements and variables you should have
 * @param {{target: Element, key: *, options: __se__FrameOptions}} editorTarget Target textarea
 * @param {HTMLElement} top Editor top area
 * @param {HTMLElement} wwFrame Editor wysiwyg frame
 * @param {HTMLElement} codeWrapper Editor code view wrapper
 * @param {HTMLElement} codeFrame Editor code view frame
 * @param {{inner: HTMLElement, page: HTMLElement, pageMirror: HTMLElement}} documentTypeInner Document type elements
 * @param {?HTMLElement} statusbar Editor statusbar
 * @param {*} key root key
 * @returns {__se__FrameContext}
 */
export function CreateFrameContext(
	editorTarget: {
		target: Element;
		key: any;
		options: __se__FrameOptions;
	},
	top: HTMLElement,
	wwFrame: HTMLElement,
	codeWrapper: HTMLElement,
	codeFrame: HTMLElement,
	statusbar: HTMLElement | null,
	documentTypeInner: {
		inner: HTMLElement;
		page: HTMLElement;
		pageMirror: HTMLElement;
	},
	key: any
): __se__FrameContext;
/**
 * @description Update statusbar context
 * @param {HTMLElement} statusbar Statusbar element
 * @param {__se__FrameContext} mapper FrameContext map
 */
export function UpdateStatusbarContext(statusbar: HTMLElement, mapper: __se__FrameContext): void;
/**
 * ================================================================================================================================
 * === Context
 * =================================================================================================================================
 */
/**
 * @description Common elements and variables you should have
 * @param {HTMLElement} toolbar Toolbar frame
 * @param {HTMLElement|null} toolbarContainer Toolbar container
 * @param {HTMLElement} menuTray menu tray
 * @param {HTMLElement|null} subbar sub toolbar
 * @returns {__se__Context}
 */
export function CreateContext(toolbar: HTMLElement, toolbarContainer: HTMLElement | null, menuTray: HTMLElement, subbar: HTMLElement | null, statusbarContainer: any): __se__Context;
/**
 * ================================================================================================================================
 * === Create context utility
 * =================================================================================================================================
 */
export function CreateEditorContext(editor: any): {
	get(k: any): any;
	set(k: any, v: any): any;
	getAll(): {
		[k: string]: any;
	};
};
