import type {} from '../../typedef';
export default UI;
/**
 * @description The UI class is a class that handles operations related to the user interface of SunEditor.
 * - This class sets the editor's style, theme, editor mode, etc., and controls the state of various UI elements.
 */
declare class UI extends CoreInjector {
	alertModal: HTMLElement;
	alertMessage: HTMLSpanElement;
	toastPopup: HTMLElement;
	toastContainer: Element;
	toastMessage: HTMLSpanElement;
	/**
	 * @description set editor frame styles.
	 * - Define the style of the edit area
	 * - It can also be defined with the "setOptions" method, but the "setEditorStyle" method does not render the editor again.
	 * @param {string} style Style string
	 * @param {?SunEditor.FrameContext} [fc] Frame context
	 */
	setEditorStyle(style: string, fc?: SunEditor.FrameContext | null): void;
	/**
	 * @description Set the theme to the editor
	 * @param {string} theme Theme name
	 */
	setTheme(theme: string): void;
	/**
	 * @description Switch to or off "ReadOnly" mode.
	 * @param {boolean} value "readOnly" boolean value.
	 * @param {string} [rootKey] Root key
	 */
	readOnly(value: boolean, rootKey?: string): void;
	/**
	 * @description Disables the editor.
	 * @param {string} [rootKey] Root key
	 */
	disable(rootKey?: string): void;
	/**
	 * @description Enables the editor.
	 * @param {string} [rootKey] Root key
	 */
	enable(rootKey?: string): void;
	/**
	 * @description Shows the editor interface.
	 * @param {string} [rootKey] Root key
	 */
	show(rootKey?: string): void;
	/**
	 * @description Hides the editor interface.
	 * @param {string} [rootKey] Root key
	 */
	hide(rootKey?: string): void;
	/**
	 * @description Shows the loading spinner.
	 * @param {string} [rootKey] Root key
	 */
	showLoading(rootKey?: string): void;
	/**
	 * @description Hides the loading spinner.
	 * @param {string} [rootKey] Root key
	 */
	hideLoading(rootKey?: string): void;
	/**
	 * @description This method disables or enables the toolbar buttons when the controller is activated or deactivated.
	 * - When the controller is activated, the toolbar buttons are disabled; when the controller is deactivated, the buttons are enabled.
	 * @param {boolean} active If `true`, the toolbar buttons will be disabled. If `false`, the toolbar buttons will be enabled.
	 * @returns {boolean} The current state of the controller on disabled buttons.
	 */
	setControllerOnDisabledButtons(active: boolean): boolean;
	/**
	 * @description Activate the transparent background "div" so that other elements are not affected during resizing.
	 * @param {string} cursor cursor css property
	 */
	enableBackWrapper(cursor: string): void;
	/**
	 * @description Disabled background "div"
	 */
	disableBackWrapper(): void;
	/**
	 * @description  Open the alert panel
	 * @param {string} text alert message
	 * @param {""|"error"|"success"} type alert type
	 */
	alertOpen(text: string, type: '' | 'error' | 'success'): void;
	/**
	 * @description  Close the alert panel
	 */
	alertClose(): void;
	/**
	 * @description Show toast
	 * @param {string} message toast message
	 * @param {number} [duration=1000] duration time(ms)
	 * @param {""|"error"|"success"} [type=""] duration time(ms)
	 */
	showToast(message: string, duration?: number, type?: '' | 'error' | 'success'): void;
	/**
	 * @description Close toast
	 */
	closeToast(): void;
	/**
	 * @description Off current controllers
	 */
	offCurrentController(): void;
	/**
	 * @description Off current modal
	 */
	offCurrentModal(): void;
	/**
	 * @internal
	 * @description visible controllers
	 * @param {boolean} value hidden/show
	 * @param {?boolean} [lineBreakShow] Line break hidden/show (default: Follows the value "value".)
	 */
	_visibleControllers(value: boolean, lineBreakShow?: boolean | null): void;
	/**
	 * @internal
	 * @description Off controllers
	 */
	__offControllers(): void;
	/**
	 * @internal
	 * @description Destroy the UI instance and release memory
	 */
	_destroy(): void;
	#private;
}
import CoreInjector from '../../editorInjector/_core';
