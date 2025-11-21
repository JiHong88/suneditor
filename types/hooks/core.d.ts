import type {} from '../typedef';
export namespace Event {
	/**
	 * Executes the method that is called whenever the cursor position changes.
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement} element - Node element where the cursor is currently located
	 * @param {?HTMLElement} target - The plugin's toolbar button element
	 * @returns {boolean|void} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	function Active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	/**
	 * Executes the event function of "focus".
	 * @param {SunEditor.HookParams.FocusBlur} params - Event parameters
	 * @returns {void}
	 */
	function OnFocus(params: SunEditor.HookParams.FocusBlur): void;
	/**
	 * Executes the event function of "blur".
	 * @param {SunEditor.HookParams.FocusBlur} params - Event parameters
	 * @returns {void}
	 */
	function OnBlur(params: SunEditor.HookParams.FocusBlur): void;
	/**
	 * Executes the event function of "mousemove".
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {void}
	 */
	function OnMouseMove(params: SunEditor.HookParams.MouseEvent): void;
	/**
	 * Executes the event function of "scroll".
	 * @param {SunEditor.HookParams.Scroll} params - Event parameters
	 * @returns {void}
	 */
	function OnScroll(params: SunEditor.HookParams.Scroll): void;
	/**
	 * Executes the event function of "keydown" (sync).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.KeyEvent} params - Key event information
	 * @returns {void|boolean} - Return false to prevent the editor's keydown processing (shortcuts, actions)
	 */
	function OnKeyDown(params: SunEditor.HookParams.KeyEvent): void | boolean;
	/**
	 * Executes the event function of "keydown" (async).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.KeyEvent} params - Key event information
	 * @returns {Promise<void|boolean>} - Return false to prevent the editor's keydown processing (shortcuts, actions)
	 */
	function OnKeyDownAsync(params: SunEditor.HookParams.KeyEvent): Promise<void | boolean>;
	/**
	 * Executes the event function of "keyup" (sync).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.KeyEvent} params - Key event information
	 * @returns {void|boolean} - Return false to prevent adding to history
	 */
	function OnKeyUp(params: SunEditor.HookParams.KeyEvent): void | boolean;
	/**
	 * Executes the event function of "keyup" (async).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.KeyEvent} params - Key event information
	 * @returns {Promise<void|boolean>} - Return false to prevent adding to history
	 */
	function OnKeyUpAsync(params: SunEditor.HookParams.KeyEvent): Promise<void | boolean>;
	/**
	 * Executes the event function of "mousedown" (sync).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {void|boolean} - Return false to prevent the editor's mousedown processing
	 */
	function OnMouseDown(params: SunEditor.HookParams.MouseEvent): void | boolean;
	/**
	 * Executes the event function of "mousedown" (async).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {Promise<void|boolean>} - Return false to prevent the editor's mousedown processing
	 */
	function OnMouseDownAsync(params: SunEditor.HookParams.MouseEvent): Promise<void | boolean>;
	/**
	 * Executes the event function of "click" (sync).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {void|boolean} - Return false to prevent the editor's click processing (component selection)
	 */
	function OnClick(params: SunEditor.HookParams.MouseEvent): void | boolean;
	/**
	 * Executes the event function of "click" (async).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {Promise<void|boolean>} - Return false to prevent the editor's click processing (component selection)
	 */
	function OnClickAsync(params: SunEditor.HookParams.MouseEvent): Promise<void | boolean>;
	/**
	 * Executes the event function of "paste" (sync).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * Returning false will stop event propagation and cancel the paste.
	 * @param {SunEditor.HookParams.Paste} params - Paste event information
	 * @returns {void|boolean}
	 */
	function OnPaste(params: SunEditor.HookParams.Paste): void | boolean;
	/**
	 * Executes the event function of "paste" (async).
	 * Called sequentially on all plugins. Returning a boolean stops the loop.
	 * Returning false will stop event propagation and cancel the paste.
	 * @param {SunEditor.HookParams.Paste} params - Paste event information
	 * @returns {Promise<void|boolean>}
	 */
	function OnPasteAsync(params: SunEditor.HookParams.Paste): Promise<void | boolean>;
	/**
	 * Executes the event function of "beforeinput" (sync).
	 * Called after validation but before the input is processed.
	 * @param {SunEditor.HookParams.InputWithData} params - Event parameters
	 * @returns {void}
	 */
	function OnBeforeInput(params: SunEditor.HookParams.InputWithData): void;
	/**
	 * Executes the event function of "beforeinput" (async).
	 * Called after validation but before the input is processed.
	 * @param {SunEditor.HookParams.InputWithData} params - Event parameters
	 * @returns {Promise<void>}
	 */
	function OnBeforeInputAsync(params: SunEditor.HookParams.InputWithData): Promise<void>;
	/**
	 * Executes the event function of "input" (sync).
	 * Called after the input has been processed.
	 * @param {SunEditor.HookParams.InputWithData} params - Event parameters
	 * @returns {void}
	 */
	function OnInput(params: SunEditor.HookParams.InputWithData): void;
	/**
	 * Executes the event function of "input" (async).
	 * Called after the input has been processed.
	 * @param {SunEditor.HookParams.InputWithData} params - Event parameters
	 * @returns {Promise<void>}
	 */
	function OnInputAsync(params: SunEditor.HookParams.InputWithData): Promise<void>;
	/**
	 * Executes the event function of "mouseup" (sync).
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {void}
	 */
	function OnMouseUp(params: SunEditor.HookParams.MouseEvent): void;
	/**
	 * Executes the event function of "mouseup" (async).
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {Promise<void>}
	 */
	function OnMouseUpAsync(params: SunEditor.HookParams.MouseEvent): Promise<void>;
	/**
	 * Executes the event function of "mouseleave" (sync).
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {void}
	 */
	function OnMouseLeave(params: SunEditor.HookParams.MouseEvent): void;
	/**
	 * Executes the event function of "mouseleave" (async).
	 * @param {SunEditor.HookParams.MouseEvent} params - Mouse event information
	 * @returns {Promise<void>}
	 */
	function OnMouseLeaveAsync(params: SunEditor.HookParams.MouseEvent): Promise<void>;
	/**
	 * Executes when files are pasted or dropped into the editor (sync).
	 * This event is called for each file. The paste/drop process is automatically stopped after processing all files.
	 * @param {SunEditor.HookParams.FilePasteDrop} params - File paste/drop event information
	 * @returns {void}
	 */
	function OnFilePasteAndDrop(params: SunEditor.HookParams.FilePasteDrop): void;
	/**
	 * Executes when files are pasted or dropped into the editor (async).
	 * This event is called for each file. The paste/drop process is automatically stopped after processing all files.
	 * @param {SunEditor.HookParams.FilePasteDrop} params - File paste/drop event information
	 * @returns {Promise<void>}
	 */
	function OnFilePasteAndDropAsync(params: SunEditor.HookParams.FilePasteDrop): Promise<void>;
}
export namespace Component {
	/**
	 * Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target - Target component element
	 * @returns {void|boolean} - If return true, Special components that are not wrapping as "figure"
	 */
	function Select(target: HTMLElement): void | boolean;
	/**
	 * Called when a container is deselected.
	 * @param {HTMLElement} target Target element
	 * @returns {void}
	 */
	function Deselect(target: HTMLElement): void;
	/**
	 * Executes the method that is called when a component is being edited.
	 * @param {HTMLElement} target - Target element
	 * @returns {void}
	 */
	function Edit(target: HTMLElement): void;
	/**
	 * Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {HTMLElement} target - Target element
	 * @returns {Promise<void>}
	 */
	function Destroy(target: HTMLElement): Promise<void>;
	/**
	 * Executes the method that is called when a component copy is requested.
	 * @param {SunEditor.HookParams.CopyComponent} params - Copy component event information
	 * @returns {boolean | void} - If return false, the copy will be canceled
	 */
	function Copy(params: SunEditor.HookParams.CopyComponent): boolean | void;
}
export namespace Core {
	/**
	 * This method is used to validate and preserve the format of the component within the editor.
	 * - It ensures that the structure and attributes of the element are maintained and secure.
	 * - The method checks if the element is already wrapped in a valid container and updates its attributes if necessary.
	 * - If the element isn't properly contained, a new container is created to retain the format.
	 * @returns {{query: string, method: (element: HTMLElement) => void}} The format retention object containing the query and method to process the element.
	 * - query: The selector query to identify the relevant elements.
	 * - method: The function to execute on the element to validate and preserve its format.
	 */
	function RetainFormat(): {
		query: string;
		method: (element: HTMLElement) => void;
	};
	/**
	 * Executes methods called by shortcut keys.
	 * @param {SunEditor.HookParams.Shortcut} params - Information of the "shortcut" plugin
	 * @returns {void}
	 */
	function Shortcut(params: SunEditor.HookParams.Shortcut): void;
	/**
	 * Executes the method called when the rtl, ltr mode changes. ("editor.setDir")
	 * @param {string} dir - Direction ("rtl" or "ltr")
	 * @returns {void}
	 */
	function SetDir(dir: string): void;
	/**
	 * Executes when the editor or plugin is initialized.
	 * Called during editor initialization and when resetOptions is called.
	 * @returns {void}
	 */
	function Init(): void;
}
