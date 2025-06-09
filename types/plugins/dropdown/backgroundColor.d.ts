export default BackgroundColor;
/**
 * @class
 * @description Text background color plugin
 */
declare class BackgroundColor extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions
	 * @param {Array<string|{value: string, name: string}>} pluginOptions.items - Color list
	 * @param {number} pluginOptions.splitNum - Number of colors per line
	 * @param {boolean} pluginOptions.disableHEXInput - Disable HEX input
	 */
	constructor(
		editor: __se__EditorCore,
		pluginOptions: {
			items: Array<
				| string
				| {
						value: string;
						name: string;
				  }
			>;
			splitNum: number;
			disableHEXInput: boolean;
		}
	);
	title: any;
	icon: string;
	colorPicker: ColorPicker;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement=} element - Node element where the cursor is currently located
	 * @param {?HTMLElement=} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	active(element?: (HTMLElement | null) | undefined, target?: (HTMLElement | null) | undefined): boolean;
	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's "dropdown" menu is opened.
	 * @param {HTMLElement} target Line element at the current cursor position
	 */
	on(target: HTMLElement): void;
	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's "dropdown" menu is closed.
	 */
	off(): void;
	/**
	 * @editorMethod Modules.ColorPicker
	 * @description Executes the method called when a button of "ColorPicker" module is clicked.
	 * - This plugin is by applying the "ColorPicker" module globally to the "dropdown" menu, the default "action" method is not called.
	 * @param {string} color - Color code (hex)
	 */
	colorPickerAction(color: string): void;
}
import EditorInjector from '../../editorInjector';
import ColorPicker from '../../modules/ColorPicker';
