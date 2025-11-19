import type {} from '../typedef';
export namespace Browser {
	/**
	 * Executes the method that is called when a "Browser" module's is opened.
	 * @returns {void}
	 */
	function Init(): void;
}
export namespace ColorPicker {
	/**
	 * Executes the method called when a button of "ColorPicker" module is clicked.
	 * - This plugin is by applying the "ColorPicker" module globally to the "dropdown" menu, the default "action" method is not called.
	 * @param {SunEditor.Module.HueSlider.Color} color - Selected color information
	 * @returns {void}
	 */
	function Action(color: SunEditor.Module.HueSlider.Color): void;
	/**
	 * Executes the method called when the "HueSlider" module is opened.
	 * @returns {void}
	 */
	function HueSliderOpen(): void;
	/**
	 * Executes the method called when the "HueSlider" module is closed.
	 * @returns {void}
	 */
	function HueSliderClose(): void;
}
export namespace Controller {
	/**
	 * Executes the method that is called when a button is clicked in the "controller".
	 * @param {HTMLButtonElement} target Action button element
	 * @returns {void}
	 */
	function Action(target: HTMLButtonElement): void;
	/**
	 * This function is called before the "controller" before it is closed.
	 * @returns {void}
	 */
	function Close(): void;
}
export namespace HueSlider {
	/**
	 * This method is called when the color is selected in the hue slider.
	 * @returns {void}
	 */
	function Action(): void;
	/**
	 * This method is called when the hue slider is closed.
	 * @returns {void}
	 */
	function CancelAction(): void;
}
export namespace Modal {
	/**
	 * @description Executes the method that is called when a plugin's modal is opened.
	 * @param {boolean} isUpdate - Indicates whether the modal is for editing an existing component (true) or registering a new one (false).
	 * @returns {void}
	 */
	function On(isUpdate: boolean): void;
	/**
	 * This function is called before the modal window is opened, but before it is closed.
	 * @returns {void}
	 */
	function Init(): void;
	/**
	 * Modal off callback.
	 * @param {boolean} isUpdate - Indicates whether the modal is for editing an existing component (true) or registering a new one (false).
	 * @returns {void}
	 */
	function Off(isUpdate: boolean): void;
	/**
	 * This function is called when a form within a modal window is "submit".
	 * @returns {Promise<boolean>}
	 * - true: modal and loading are closed
	 * - false: only loading is closed
	 * - undefined: only modal is closed
	 */
	function Action(): Promise<boolean>;
	/**
	 * Modal resize callback (optional).
	 * @returns {void}
	 */
	function Resize(): void;
}
