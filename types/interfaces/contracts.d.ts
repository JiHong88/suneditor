import type {} from '../typedef';
/**
 * @fileoverview Contract interfaces for SunEditor plugins.
 * These interfaces define callback methods that modules and editor core call on plugin instances.
 * Use `@implements` to get type hints for these hooks in your plugin.
 */
/**
 * Modal plugin hook methods interface.
 * `modalAction` is required, other methods are optional.
 * @interface
 */
export interface ModuleModal {
	/**
	 * @abstract
	 * This function is called when a form within a modal window is "submit".
	 * @returns {Promise<boolean>}
	 * - true: modal and loading are closed
	 * - false: only loading is closed
	 * - undefined: only modal is closed
	 */
	modalAction(): Promise<boolean>;
	/**
	 * @optional
	 * Executes the method that is called when a plugin's modal is opened.
	 * @param {boolean} isUpdate - Indicates whether the modal is for editing an existing component (true) or registering a new one (false).
	 * @returns {void}
	 */
	modalOn?(isUpdate: boolean): void;
	/**
	 * @optional
	 * This function is called before the modal window is opened, but before it is closed.
	 * @returns {void}
	 */
	modalInit?(): void;
	/**
	 * @optional
	 * Modal off callback.
	 * @param {boolean} isUpdate - Indicates whether the modal is for editing an existing component (true) or registering a new one (false).
	 * @returns {void}
	 */
	modalOff?(isUpdate: boolean): void;
	/**
	 * @optional
	 * Modal resize callback (optional).
	 * @returns {void}
	 */
	modalResize?(): void;
}
/**
 * Controller plugin hook methods interface.
 * `controllerAction` is required, other methods are optional.
 * @interface
 */
export interface ModuleController {
	/**
	 * @abstract
	 * Executes the method that is called when a button is clicked in the "controller".
	 * @param {HTMLButtonElement} target Action button element
	 * @returns {void}
	 */
	controllerAction(target: HTMLButtonElement): void;
	/**
	 * @optional
	 * This function is called after the "controller" is opened.
	 * @param {HTMLFormElement} form Controller form element
	 * @param {Node|Range} target Controller target element
	 * @returns {void}
	 */
	controllerOn?(form: HTMLFormElement, target: Node | Range): void;
	/**
	 * @optional
	 * This function is called before the "controller" is closed.
	 * @returns {void}
	 */
	controllerClose?(): void;
}
/**
 * Browser plugin hook methods interface.
 * All methods are optional - implement only what you need.
 * @interface
 */
export interface ModuleBrowser {
	/**
	 * @optional
	 * Executes the method that is called when a "Browser" module's is opened.
	 * @returns {void}
	 */
	browserInit?(): void;
}
/**
 * ColorPicker plugin hook methods interface.
 * All methods are optional - implement only what you need.
 * @interface
 */
export interface ModuleColorPicker {
	/**
	 * @optional
	 * Executes the method called when a button of "ColorPicker" module is clicked.
	 * - This plugin is by applying the "ColorPicker" module globally to the "dropdown" menu, the default "action" method is not called.
	 * @param {SunEditor.Module.HueSlider.Color} color - Selected color information
	 * @returns {void}
	 */
	colorPickerAction?(color: SunEditor.Module.HueSlider.Color): void;
	/**
	 * @optional
	 * Executes the method called when the "HueSlider" module is opened.
	 * @returns {void}
	 */
	colorPickerHueSliderOpen?(): void;
	/**
	 * @optional
	 * Executes the method called when the "HueSlider" module is closed.
	 * @returns {void}
	 */
	colorPickerHueSliderClose?(): void;
}
/**
 * HueSlider plugin hook methods interface.
 * All methods are optional - implement only what you need.
 * @interface
 */
export interface ModuleHueSlider {
	/**
	 * @abstract
	 * This method is called when the color is selected in the hue slider.
	 * @returns {void}
	 */
	hueSliderAction(): void;
	/**
	 * @optional
	 * This method is called when the hue slider is closed.
	 * @returns {void}
	 */
	hueSliderCancelAction?(): void;
}
/**
 * Component plugin hook methods interface.
 * `componentSelect` is required, other methods are optional.
 *
 * **`inst._element` Requirement:**
 * Plugins with `static component` method must define a public `_element` property
 * that references the currently controlled DOM element.
 * - Used to detect clicks on the target element and prevent accidental controller closure.
 *
 * @interface
 */
export interface EditorComponent {
	/**
	 * @abstract
	 * Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target - Target component element
	 * @returns {void|boolean} - If return true, Special components that are not wrapping as "figure"
	 */
	componentSelect(target: HTMLElement): void | boolean;
	/**
	 * @optional
	 * Called when a container is deselected.
	 * @param {HTMLElement} target - Target element
	 * @returns {void}
	 */
	componentDeselect?(target: HTMLElement): void;
	/**
	 * @optional
	 * Executes the method that is called when a component is being edited.
	 * @param {HTMLElement} target - Target element
	 * @returns {void}
	 */
	componentEdit?(target: HTMLElement): void;
	/**
	 * @optional
	 * Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {HTMLElement} target - Target element
	 * @returns {Promise<void>}
	 */
	componentDestroy?(target: HTMLElement): Promise<void>;
	/**
	 * @optional
	 * Executes the method that is called when a component copy is requested.
	 * @param {SunEditor.HookParams.CopyComponent} params - Copy component event information
	 * @returns {boolean|void} - If return false, the copy will be canceled
	 */
	componentCopy?(params: SunEditor.HookParams.CopyComponent): boolean | void;
}
