import type {} from '../../typedef';
export default BackgroundColor;
export type BackgroundColorPluginOptions = {
	/**
	 * - Color list
	 */
	items?: Array<
		| string
		| {
				value: string;
				name: string;
		  }
	>;
	/**
	 * - Number of colors per line
	 */
	splitNum?: number;
	/**
	 * - Disable HEX input
	 */
	disableHEXInput?: boolean;
};
/**
 * @typedef {Object} BackgroundColorPluginOptions
 * @property {Array<string|{value: string, name: string}>} [items] - Color list
 * @property {number} [splitNum] - Number of colors per line
 * @property {boolean} [disableHEXInput] - Disable HEX input
 */
/**
 * @class
 * @description Text background color plugin
 */
declare class BackgroundColor extends PluginDropdownFree {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {BackgroundColorPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Kernel, pluginOptions: BackgroundColorPluginOptions);
	title: any;
	colorPicker: ColorPicker;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	colorPickerAction(color: SunEditor.Module.HueSlider.Color): void;
}
import { PluginDropdownFree } from '../../interfaces';
import { ColorPicker } from '../../modules/contract';
