/**
 * @fileoverview Module interface definitions for SunEditor.
 * These types define callback methods that Module instances call on plugin instances.
 */

// ================================================================
// MODULE contracts
// ================================================================

export const Browser = {
	/**
	 * Executes the method that is called when a "Browser" module's is opened.
	 * @returns {void}
	 */
	Init() {},
};

export const ColorPicker = {
	/**
	 * Executes the method called when a button of "ColorPicker" module is clicked.
	 * - This plugin is by applying the "ColorPicker" module globally to the "dropdown" menu, the default "action" method is not called.
	 * @param {SunEditor.Module.HueSlider.Color} color - Selected color information
	 * @returns {void}
	 */
	Action(color) {},

	/**
	 * Executes the method called when the "HueSlider" module is opened.
	 * @returns {void}
	 */
	HueSliderOpen() {},

	/**
	 * Executes the method called when the "HueSlider" module is closed.
	 * @returns {void}
	 */
	HueSliderClose() {},
};

export const Controller = {
	/**
	 * Executes the method that is called when a button is clicked in the "controller".
	 * @param {HTMLButtonElement} target Action button element
	 * @returns {void}
	 */
	Action(target) {},

	/**
	 * This function is called before the "controller" before it is closed.
	 * @returns {void}
	 */
	Close() {},
};

export const HueSlider = {
	/**
	 * This method is called when the color is selected in the hue slider.
	 * @returns {void}
	 */
	Action() {},

	/**
	 * This method is called when the hue slider is closed.
	 * @returns {void}
	 */
	CancelAction() {},
};

export const Modal = {
	/**
	 * @description Executes the method that is called when a plugin's modal is opened.
	 * @param {boolean} isUpdate - Indicates whether the modal is for editing an existing component (true) or registering a new one (false).
	 * @returns {void}
	 */
	On(isUpdate) {},

	/**
	 * This function is called before the modal window is opened, but before it is closed.
	 * @returns {void}
	 */
	Init() {},

	/**
	 * Modal off callback.
	 * @param {boolean} isUpdate - Indicates whether the modal is for editing an existing component (true) or registering a new one (false).
	 * @returns {void}
	 */
	Off(isUpdate) {},

	/**
	 * This function is called when a form within a modal window is "submit".
	 * @returns {Promise<boolean>}
	 * - true: modal and loading are closed
	 * - false: only loading is closed
	 * - undefined: only modal is closed
	 */
	async Action() {
		return true;
	},

	/**
	 * Modal resize callback (optional).
	 * @returns {void}
	 */
	Resize() {},
};

export {};
