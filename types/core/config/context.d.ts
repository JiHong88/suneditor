/**
 * ================================================================================================================================
 * === CONTEXT TYPES : Store
 * =================================================================================================================================
 */
/**
 * ================================================================================================================================
 * @typedef {Object} ContextStore
 *
 * This object stores **global editor-level UI references** for a SunEditor instance.
 *
 * - Primarily manages **toolbar, menu tray, and status bar containers**.
 * - Used by the editor to control **sticky behavior, sub-toolbars, and global layout**.
 * - Shared across all frames in a multi-frame editor (unlike FrameContextStore which is per-frame).
 * -----------------
 *
 * === Main UI Containers ===
 * @property {HTMLElement} menuTray - The **top menu tray** that holds buttons, dropdowns, or custom menus.
 * @property {HTMLElement} toolbar_main - The **main toolbar** element containing editor actions.
 * @property {HTMLElement} toolbar_buttonTray - The **container for main toolbar buttons**.
 * @property {HTMLElement} toolbar_arrow - The **arrow indicator** in the toolbar (used for dropdown/tool menu navigation).
 * @property {HTMLElement} [toolbar_wrapper] - The **wrapper for the main toolbar and editor frame** (groups UI together).
 *
 * === Sub-Toolbar (Contextual/Balloon) ===
 * @property {HTMLElement} [toolbar_sub_main] - The **sub-toolbar** element (used for contextual or balloon toolbars).
 * @property {HTMLElement} [toolbar_sub_buttonTray] - The **container for sub-toolbar buttons**.
 * @property {HTMLElement} [toolbar_sub_arrow] - The **arrow indicator** in the sub-toolbar.
 * @property {HTMLElement} [toolbar_sub_wrapper] - The **wrapper for the sub-toolbar**, containing its structure.
 *
 * === Status Bar ===
 * @property {HTMLElement} [statusbar_wrapper] - The **wrapper for the status bar** (footer area for resize handles, info, etc.).
 *
 * === Sticky Mode Helpers ===
 * @property {HTMLElement} [_stickyDummy] - A **dummy placeholder** used when the toolbar is in sticky mode (to prevent layout shift).
 * ================================================================================================================================
 */
/** --+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+-- */
/**
 * ================================================================================================================================
 * === UTILITIES : Manage Context Map
 * =================================================================================================================================
 */
/**
 * @description Creates a context map of commonly accessed DOM elements for the editor.
 * @param {Element} toolbar - Main toolbar element.
 * @param {Element|null} toolbarContainer - Container element for the toolbar.
 * @param {Element} menuTray - Main menu tray element.
 * @param {Element|null} subbar - Sub-toolbar element.
 * @param {Element|null} statusbarContainer - Status bar container element.
 * @returns {__se__Context} - A map of key DOM nodes used throughout the editor.
 */
export function CreateContext(toolbar: Element, toolbarContainer: Element | null, menuTray: Element, subbar: Element | null, statusbarContainer: Element | null): __se__Context;
/**
 * @typedef {Object} ContextUtil
 * @property {(k: keyof ContextStore) => HTMLElement|null} get - Get a DOM element from the context by key.
 * @property {(k: keyof ContextStore, v: HTMLElement) => void} set - Set a DOM element in the context by key.
 * @property {(k: keyof ContextStore) => boolean} has - Check if a key exists in the context.
 * @property {(k: keyof ContextStore) => boolean} delete - Delete a key from the context.
 * @property {() => Object<keyof ContextStore, HTMLElement|null>} [getAll] - Get all DOM elements in the context as an object.
 * @property {() => void} clear - Clear all elements in the context.
 */
/**
 * @description Creates a utility wrapper for editor base options.
 * - Provides get, set, has, getAll, and setMany methods with internal Map support.
 * @param {*} editor - The editor instance
 * @returns {ContextUtil}
 */
export function ContextUtil(editor: any): ContextUtil;
export type ContextUtil = {
	/**
	 * - Get a DOM element from the context by key.
	 */
	get: (k: keyof ContextStore) => HTMLElement | null;
	/**
	 * - Set a DOM element in the context by key.
	 */
	set: (k: keyof ContextStore, v: HTMLElement) => void;
	/**
	 * - Check if a key exists in the context.
	 */
	has: (k: keyof ContextStore) => boolean;
	/**
	 * - Delete a key from the context.
	 */
	delete: (k: keyof ContextStore) => boolean;
	/**
	 * - Get all DOM elements in the context as an object.
	 */
	getAll?: () => any;
	/**
	 * - Clear all elements in the context.
	 */
	clear: () => void;
};
/**
 * This object stores **global editor-level UI references** for a SunEditor instance.
 *
 * - Primarily manages **toolbar, menu tray, and status bar containers**.
 * - Used by the editor to control **sticky behavior, sub-toolbars, and global layout**.
 * - Shared across all frames in a multi-frame editor (unlike FrameContextStore which is per-frame).
 * -----------------
 *
 * === Main UI Containers ===
 */
export type ContextStore = {
	/**
	 * - The **top menu tray** that holds buttons, dropdowns, or custom menus.
	 */
	menuTray: HTMLElement;
	/**
	 * - The **main toolbar** element containing editor actions.
	 */
	toolbar_main: HTMLElement;
	/**
	 * - The **container for main toolbar buttons**.
	 */
	toolbar_buttonTray: HTMLElement;
	/**
	 * - The **arrow indicator** in the toolbar (used for dropdown/tool menu navigation).
	 */
	toolbar_arrow: HTMLElement;
	/**
	 * - The **wrapper for the main toolbar and editor frame** (groups UI together).
	 *
	 * === Sub-Toolbar (Contextual/Balloon) ===
	 */
	toolbar_wrapper?: HTMLElement;
	/**
	 * - The **sub-toolbar** element (used for contextual or balloon toolbars).
	 */
	toolbar_sub_main?: HTMLElement;
	/**
	 * - The **container for sub-toolbar buttons**.
	 */
	toolbar_sub_buttonTray?: HTMLElement;
	/**
	 * - The **arrow indicator** in the sub-toolbar.
	 */
	toolbar_sub_arrow?: HTMLElement;
	/**
	 * - The **wrapper for the sub-toolbar**, containing its structure.
	 *
	 * === Status Bar ===
	 */
	toolbar_sub_wrapper?: HTMLElement;
	/**
	 * - The **wrapper for the status bar** (footer area for resize handles, info, etc.).
	 *
	 * === Sticky Mode Helpers ===
	 */
	statusbar_wrapper?: HTMLElement;
	/**
	 * - A **dummy placeholder** used when the toolbar is in sticky mode (to prevent layout shift).
	 * ================================================================================================================================
	 */
	_stickyDummy?: HTMLElement;
};
