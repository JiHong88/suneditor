import type {} from '../../typedef';
export default FontColor;
export type FontColorPluginOptions = {
	/**
	 * - Color list.
	 * Use HEX strings or objects with `value`/`name` for labeled colors.
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
	 * ```js
	 * { items: ['#ff0000', '#00ff00', { value: '#0000ff', name: 'Blue' }], splitNum: 6 }
	 * ```
	 */
	disableHEXInput?: boolean;
};
/**
 * @typedef {Object} FontColorPluginOptions
 * @property {Array<string|{value: string, name: string}>} [items] - Color list.
 * Use HEX strings or objects with `value`/`name` for labeled colors.
 * @property {number} [splitNum] - Number of colors per line
 * @property {boolean} [disableHEXInput] - Disable HEX input
 * ```js
 * { items: ['#ff0000', '#00ff00', { value: '#0000ff', name: 'Blue' }], splitNum: 6 }
 * ```
 */
/**
 * @class
 * @description Font color plugin
 */
declare class FontColor extends PluginDropdownFree {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {FontColorPluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: FontColorPluginOptions);
	title: any;
	colorPicker: ColorPicker;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	colorPickerAction(color: SunEditor.Module.HueSlider.Color): void;
}
import { PluginDropdownFree } from '../../interfaces';
import { ColorPicker } from '../../modules/contract';
