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
 * @returns {SunEditor.Context} - A map of key DOM nodes used throughout the editor.
 */
export function CreateContext(toolbar, toolbarContainer, menuTray, subbar, statusbarContainer) {
	const m = new Map([
		['menuTray', menuTray],
		['toolbar_main', toolbar],
		['toolbar_buttonTray', toolbar.querySelector('.se-btn-tray')],
		['toolbar_arrow', toolbar.querySelector('.se-arrow')]
	]);

	if (subbar) {
		m.set('toolbar_sub_main', subbar);
		m.set('toolbar_sub_buttonTray', subbar.querySelector('.se-btn-tray'));
		m.set('toolbar_sub_arrow', subbar.querySelector('.se-arrow'));
		m.set('toolbar_sub_wrapper', subbar.parentElement.parentElement);
	}

	if (toolbarContainer) {
		m.set('toolbar_wrapper', toolbarContainer.querySelector('.sun-editor'));
		m.set('_stickyDummy', toolbarContainer.querySelector('.se-toolbar-sticky-dummy'));
	}

	if (statusbarContainer) {
		m.set('statusbar_wrapper', statusbarContainer.querySelector('.sun-editor'));
	}

	return /** @type {SunEditor.Context} */ (m);
}

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
export function ContextUtil(editor) {
	const store = editor.__context;

	return {
		get(k) {
			return store.get(k);
		},
		set(k, v) {
			return store.set(k, v);
		},
		has(k) {
			return store.has(k);
		},
		delete(k) {
			return store.delete(k);
		},
		getAll() {
			return Object.fromEntries(store.entries());
		},
		clear() {
			store.clear();
		}
	};
}
