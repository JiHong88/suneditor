import type {} from '../../typedef';
export default FontColor;
export type FontColorPluginOptions = {
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
 * @typedef {Object} FontColorPluginOptions
 * @property {Array<string|{value: string, name: string}>} [items] - Color list
 * @property {number} [splitNum] - Number of colors per line
 * @property {boolean} [disableHEXInput] - Disable HEX input
 */
/**
 * @class
 * @description Font color plugin
 */
declare class FontColor extends PluginDropdownFree {
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {FontColorPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Core, pluginOptions: FontColorPluginOptions);
	title: any;
	colorPicker: ColorPicker;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	colorPickerAction(color: SunEditor.Module.HueSlider.Color): void;
}
import { PluginDropdownFree } from '../../interfaces';
import { ColorPicker } from '../../modules/contracts';
