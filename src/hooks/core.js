/**
 * @fileoverview Editor interface definitions for SunEditor.
 * These types define callback methods that Editor core calls on plugin instances.
 */

// ================================================================
// EDITOR METHOD TYPES - Methods called by Editor core on plugins
// ================================================================

export const Event = {
	/**
	 * Executes the method that is called whenever the cursor position changes.
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement} element - Node element where the cursor is currently located
	 * @param {?HTMLElement} target - The plugin's toolbar button element
	 * @returns {boolean|void} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	Active(element, target) {},

	/**
	 * Executes the event function of "focus".
	 * @param {SunEditor.HookParams.FocusBlur} params - Event parameters
	 * @returns {void}
	 */
	OnFocus(params) {},

	/**
	 * Executes the event function of "blur".
	 * @param {SunEditor.HookParams.FocusBlur} params - Event parameters
	 * @returns {void}
	 */
	OnBlur(params) {},

	/**
	 * Executes the event function of "mousemove".
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {void}
	 */
	OnMouseMove(params) {},

	/**
	 * Executes the event function of "scroll".
	 * @param {SunEditor.HookParams.Scroll} params - Event parameters
	 * @returns {void}
	 */
	OnScroll(params) {},

	// ====== Sync / Async Event Methods ======

	// ------- Interruptible events (returning boolean stops event processing) ---

	/**
	 * Executes the event function of "keydown" (sync).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.KeyEvent} params - Key event information
	 * @returns {void|boolean} - Return false to prevent the editor's keydown processing (shortcuts, actions)
	 */
	OnKeyDown(params) {},

	/**
	 * Executes the event function of "keydown" (async).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.KeyEvent} params - Key event information
	 * @returns {Promise<void|boolean>} - Return false to prevent the editor's keydown processing (shortcuts, actions)
	 */
	async OnKeyDownAsync(params) {
		return;
	},

	/**
	 * Executes the event function of "keyup" (sync).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.KeyEvent} params - Key event information
	 * @returns {void|boolean} - Return false to prevent adding to history
	 */
	OnKeyUp(params) {},

	/**
	 * Executes the event function of "keyup" (async).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.KeyEvent} params - Key event information
	 * @returns {Promise<void|boolean>} - Return false to prevent adding to history
	 */
	async OnKeyUpAsync(params) {
		return;
	},

	/**
	 * Executes the event function of "mousedown" (sync).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {void|boolean} - Return false to prevent the editor's mousedown processing
	 */
	OnMouseDown(params) {},

	/**
	 * Executes the event function of "mousedown" (async).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {Promise<void|boolean>} - Return false to prevent the editor's mousedown processing
	 */
	async OnMouseDownAsync(params) {
		return;
	},

	/**
	 * Executes the event function of "click" (sync).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {void|boolean} - Return false to prevent the editor's click processing (component selection)
	 */
	OnClick(params) {},

	/**
	 * Executes the event function of "click" (async).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {Promise<void|boolean>} - Return false to prevent the editor's click processing (component selection)
	 */
	async OnClickAsync(params) {
		return;
	},

	/**
	 * Executes the event function of "paste" (sync).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * Returning false will stop event propagation and cancel the paste.
	 * @param {SunEditor.HookParams.Paste} params - Paste event information
	 * @returns {void|boolean}
	 */
	OnPaste(params) {},

	/**
	 * Executes the event function of "paste" (async).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * Returning false will stop event propagation and cancel the paste.
	 * @param {SunEditor.HookParams.Paste} params - Paste event information
	 * @returns {Promise<void|boolean>}
	 */
	async OnPasteAsync(params) {
		return;
	},

	// ------- Observation events (non-interruptible) ------

	/**
	 * Executes the event function of "beforeinput" (sync).
	 * Called after validation but before the input is processed.
	 * @param {SunEditor.HookParams.InputWithData} params - Event parameters
	 * @returns {void}
	 */
	OnBeforeInput(params) {},

	/**
	 * Executes the event function of "beforeinput" (async).
	 * Called after validation but before the input is processed.
	 * @param {SunEditor.HookParams.InputWithData} params - Event parameters
	 * @returns {Promise<void>}
	 */
	async OnBeforeInputAsync(params) {
		return;
	},

	/**
	 * Executes the event function of "input" (sync).
	 * Called after the input has been processed.
	 * @param {SunEditor.HookParams.InputWithData} params - Event parameters
	 * @returns {void}
	 */
	OnInput(params) {},

	/**
	 * Executes the event function of "input" (async).
	 * Called after the input has been processed.
	 * @param {SunEditor.HookParams.InputWithData} params - Event parameters
	 * @returns {Promise<void>}
	 */
	async OnInputAsync(params) {
		return;
	},

	/**
	 * Executes the event function of "mouseup" (sync).
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {void}
	 */
	OnMouseUp(params) {},

	/**
	 * Executes the event function of "mouseup" (async).
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {Promise<void>}
	 */
	async OnMouseUpAsync(params) {
		return;
	},

	/**
	 * Executes the event function of "mouseleave" (sync).
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {void}
	 */
	OnMouseLeave(params) {},

	/**
	 * Executes the event function of "mouseleave" (async).
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {Promise<void>}
	 */
	async OnMouseLeaveAsync(params) {
		return;
	},

	/**
	 * Executes when files are pasted or dropped into the editor (sync).
	 * This event is called for each file. The paste/drop process is automatically stopped after processing all files.
	 * @param {SunEditor.HookParams.FilePasteDrop} params - File paste/drop event information
	 * @returns {void}
	 */
	OnFilePasteAndDrop(params) {},

	/**
	 * Executes when files are pasted or dropped into the editor (async).
	 * This event is called for each file. The paste/drop process is automatically stopped after processing all files.
	 * @param {SunEditor.HookParams.FilePasteDrop} params - File paste/drop event information
	 * @returns {Promise<void>}
	 */
	async OnFilePasteAndDropAsync(params) {
		return;
	},
};

export const Component = {
	/**
	 * Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target - Target component element
	 * @returns {void|boolean} - If return true, Special components that are not wrapping as "figure"
	 */
	Select(target) {},

	/**
	 * Called when a container is deselected.
	 * @param {HTMLElement} target Target element
	 * @returns {void}
	 */
	Deselect(target) {},

	/**
	 * Executes the method that is called when a component is being edited.
	 * @param {HTMLElement} target - Target element
	 * @returns {void}
	 */
	Edit(target) {},

	/**
	 * Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {HTMLElement} target - Target element
	 * @returns {Promise<void>}
	 */
	async Destroy(target) {
		return;
	},

	/**
	 * Executes the method that is called when a component copy is requested.
	 * @param {SunEditor.HookParams.CopyComponent} params - Copy component event information
	 * @returns {boolean | void} - If return false, the copy will be canceled
	 */
	Copy(params) {},
};

export const Core = {
	/**
	 * This method is used to validate and preserve the format of the component within the editor.
	 * - It ensures that the structure and attributes of the element are maintained and secure.
	 * - The method checks if the element is already wrapped in a valid container and updates its attributes if necessary.
	 * - If the element isn't properly contained, a new container is created to retain the format.
	 * @returns {{query: string, method: (element: HTMLElement) => void}} The format retention object containing the query and method to process the element.
	 * - query: The selector query to identify the relevant elements.
	 * - method: The function to execute on the element to validate and preserve its format.
	 */
	RetainFormat() {
		return { query: '', method: () => {} };
	},

	/**
	 * Executes methods called by shortcut keys.
	 * @param {SunEditor.HookParams.Shortcut} params - Information of the "shortcut" plugin
	 * @returns {void}
	 */
	Shortcut(params) {},

	/**
	 * Executes the method called when the rtl, ltr mode changes. ("editor.setDir")
	 * @param {string} dir - Direction ("rtl" or "ltr")
	 * @returns {void}
	 */
	SetDir(dir) {},

	/**
	 * Executes when the editor or plugin is initialized.
	 * Called during editor initialization and when resetOptions is called.
	 * @returns {void}
	 */
	Init() {},
};
