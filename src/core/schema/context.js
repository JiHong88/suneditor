/**
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

/**
 * @description Creates a context map of commonly accessed DOM elements for the editor.
 * @param {Element} toolbar - Main toolbar element.
 * @param {?Element} toolbarContainer - Container element for the toolbar.
 * @param {Element} menuTray - Main menu tray element.
 * @param {?Element} subbar - Sub-toolbar element.
 * @param {?Element} statusbarContainer - Status bar container element.
 * @returns {SunEditor.Context} - A map of key DOM nodes used throughout the editor.
 */
export function CreateContext(toolbar, toolbarContainer, menuTray, subbar, statusbarContainer) {
	const m = new Map([
		['menuTray', menuTray],
		['toolbar_main', toolbar],
		['toolbar_buttonTray', toolbar.querySelector('.se-btn-tray')],
		['toolbar_arrow', toolbar.querySelector('.se-arrow')],
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

	return /** @type {SunEditor.Context} */ (/** @type {unknown} */ (m));
}
