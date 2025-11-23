/**
 * @fileoverview Contract interfaces for SunEditor plugins.
 * These interfaces define callback methods that modules and editor core call on plugin instances.
 * Use `@implements` to get type hints for these hooks in your plugin.
 */

// =====================================================================================================================================================
// Modal Module Hooks
// =====================================================================================================================================================

/**
 * Modal plugin hook methods interface.
 * `modalAction` is required, other methods are optional.
 * @interface
 */
export class ModuleModal {
	/**
	 * @abstract
	 * This function is called when a form within a modal window is "submit".
	 * @returns {Promise<boolean>}
	 * - true: modal and loading are closed
	 * - false: only loading is closed
	 * - undefined: only modal is closed
	 */
	async modalAction() {
		return true;
	}

	/**
	 * @optional
	 * Executes the method that is called when a plugin's modal is opened.
	 * @param {boolean} isUpdate - Indicates whether the modal is for editing an existing component (true) or registering a new one (false).
	 * @returns {void}
	 */
	modalOn(isUpdate) {}

	/**
	 * @optional
	 * This function is called before the modal window is opened, but before it is closed.
	 * @returns {void}
	 */
	modalInit() {}

	/**
	 * @optional
	 * Modal off callback.
	 * @param {boolean} isUpdate - Indicates whether the modal is for editing an existing component (true) or registering a new one (false).
	 * @returns {void}
	 */
	modalOff(isUpdate) {}

	/**
	 * @optional
	 * Modal resize callback (optional).
	 * @returns {void}
	 */
	modalResize() {}
}

// =====================================================================================================================================================
// Controller Module Hooks
// =====================================================================================================================================================

/**
 * Controller plugin hook methods interface.
 * `controllerAction` is required, `controllerClose` is optional.
 * @interface
 */
export class ModuleController {
	/**
	 * @abstract
	 * Executes the method that is called when a button is clicked in the "controller".
	 * @param {HTMLButtonElement} target Action button element
	 * @returns {void}
	 */
	controllerAction(target) {}

	/**
	 * @optional
	 * This function is called before the "controller" before it is closed.
	 * @returns {void}
	 */
	controllerClose() {}
}

// =====================================================================================================================================================
// Browser Module Hooks
// =====================================================================================================================================================

/**
 * Browser plugin hook methods interface.
 * All methods are optional - implement only what you need.
 * @interface
 */
export class ModuleBrowser {
	/**
	 * @optional
	 * Executes the method that is called when a "Browser" module's is opened.
	 * @returns {void}
	 */
	browserInit() {}
}

// =====================================================================================================================================================
// ColorPicker Module Hooks
// =====================================================================================================================================================

/**
 * ColorPicker plugin hook methods interface.
 * All methods are optional - implement only what you need.
 * @interface
 */
export class ModuleColorPicker {
	/**
	 * @optional
	 * Executes the method called when a button of "ColorPicker" module is clicked.
	 * - This plugin is by applying the "ColorPicker" module globally to the "dropdown" menu, the default "action" method is not called.
	 * @param {SunEditor.Module.HueSlider.Color} color - Selected color information
	 * @returns {void}
	 */
	colorPickerAction(color) {}

	/**
	 * @optional
	 * Executes the method called when the "HueSlider" module is opened.
	 * @returns {void}
	 */
	colorPickerHueSliderOpen() {}

	/**
	 * @optional
	 * Executes the method called when the "HueSlider" module is closed.
	 * @returns {void}
	 */
	colorPickerHueSliderClose() {}
}

// =====================================================================================================================================================
// HueSlider Module Hooks
// =====================================================================================================================================================

/**
 * HueSlider plugin hook methods interface.
 * All methods are optional - implement only what you need.
 * @interface
 */
export class ModuleHueSlider {
	/**
	 * @abstract
	 * This method is called when the color is selected in the hue slider.
	 * @returns {void}
	 */
	hueSliderAction() {}

	/**
	 * @optional
	 * This method is called when the hue slider is closed.
	 * @returns {void}
	 */
	hueSliderCancelAction() {}
}

// =====================================================================================================================================================
// Editor Component Hooks
// =====================================================================================================================================================

/**
 * Component plugin hook methods interface.
 * `componentSelect` is required, other methods are optional.
 * @interface
 */
export class EditorComponent {
	/**
	 * @abstract
	 * Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target - Target component element
	 * @returns {void|boolean} - If return true, Special components that are not wrapping as "figure"
	 */
	componentSelect(target) {}

	/**
	 * @optional
	 * Called when a container is deselected.
	 * @param {HTMLElement} target - Target element
	 * @returns {void}
	 */
	componentDeselect(target) {}

	/**
	 * @optional
	 * Executes the method that is called when a component is being edited.
	 * @param {HTMLElement} target - Target element
	 * @returns {void}
	 */
	componentEdit(target) {}

	/**
	 * @optional
	 * Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {HTMLElement} target - Target element
	 * @returns {Promise<void>}
	 */
	async componentDestroy(target) {}

	/**
	 * @optional
	 * Executes the method that is called when a component copy is requested.
	 * @param {SunEditor.HookParams.CopyComponent} params - Copy component event information
	 * @returns {boolean|void} - If return false, the copy will be canceled
	 */
	componentCopy(params) {}
}
