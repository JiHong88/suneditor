export default ColorPicker;
export type ColorPickerThis = ColorPicker & Partial<CoreInjector>;
export type HueSliderParams = import('./HueSlider').HueSliderParams;
export type HueSliderColor = import('./HueSlider').HueSliderColor;
export type ColorPickerParams = {
	/**
	 * color list
	 */
	colorList?:
		| Array<
				| string
				| {
						value: string;
						name: string;
				  }
		  >
		| undefined;
	/**
	 * Number of colors to be displayed in one line
	 */
	splitNum?: number | undefined;
	/**
	 * Default color
	 */
	defaultColor?: string | undefined;
	/**
	 * Disable HEX input
	 */
	disableHEXInput?: boolean | undefined;
	/**
	 * Disable remove button
	 */
	disableRemove?: boolean | undefined;
	/**
	 * hue slider options
	 */
	hueSliderOptions?: HueSliderParams | undefined;
};
/**
 * @typedef {ColorPicker & Partial<CoreInjector>} ColorPickerThis
 */
/**
 * @typedef {import('./HueSlider').HueSliderParams} HueSliderParams
 */
/**
 * @typedef {import('./HueSlider').HueSliderColor} HueSliderColor
 */
/**
 * @typedef {Object} ColorPickerParams
 * @property {Array<string|{value: string, name: string}>=} [colorList=[]] color list
 * @property {number=} [splitNum=0] Number of colors to be displayed in one line
 * @property {string=} [defaultColor] Default color
 * @property {boolean=} [disableHEXInput=false] Disable HEX input
 * @property {boolean=} [disableRemove=false] Disable remove button
 * @property {HueSliderParams=} [hueSliderOptions] hue slider options
 */
/**
 * @constructor
 * @this {ColorPickerThis}
 * @description Create a color picker element and register for related events. (this.target)
 * - When calling the color selection, "submit", and "remove" buttons, the "action" method of the instance is called with the "color" value as an argument.
 * @param {*} inst The instance object that called the constructor.
 * @param {string} styles style property ("color", "backgroundColor"..)
 * @param {ColorPickerParams} params Color picker options
 */
declare function ColorPicker(this: ColorPickerThis, inst: any, styles: string, params: ColorPickerParams): void;
declare class ColorPicker {
	/**
	 * @typedef {ColorPicker & Partial<CoreInjector>} ColorPickerThis
	 */
	/**
	 * @typedef {import('./HueSlider').HueSliderParams} HueSliderParams
	 */
	/**
	 * @typedef {import('./HueSlider').HueSliderColor} HueSliderColor
	 */
	/**
	 * @typedef {Object} ColorPickerParams
	 * @property {Array<string|{value: string, name: string}>=} [colorList=[]] color list
	 * @property {number=} [splitNum=0] Number of colors to be displayed in one line
	 * @property {string=} [defaultColor] Default color
	 * @property {boolean=} [disableHEXInput=false] Disable HEX input
	 * @property {boolean=} [disableRemove=false] Disable remove button
	 * @property {HueSliderParams=} [hueSliderOptions] hue slider options
	 */
	/**
	 * @constructor
	 * @this {ColorPickerThis}
	 * @description Create a color picker element and register for related events. (this.target)
	 * - When calling the color selection, "submit", and "remove" buttons, the "action" method of the instance is called with the "color" value as an argument.
	 * @param {*} inst The instance object that called the constructor.
	 * @param {string} styles style property ("color", "backgroundColor"..)
	 * @param {ColorPickerParams} params Color picker options
	 */
	constructor(inst: any, styles: string, params: ColorPickerParams);
	kind: any;
	inst: any;
	target: HTMLElement;
	targetButton: Node;
	inputElement: HTMLInputElement;
	styleProperties: string;
	splitNum: number;
	defaultColor: string;
	hueSliderOptions: import('./HueSlider').HueSliderParams;
	parentDisplay: string;
	currentColor: string;
	parentForm: Node[];
	colorList: any[] | NodeListOf<Element>;
	hueSlider: HueSlider;
	checkedIcon: HTMLElement;
	parentFormDisplay: any[];
	/**
	 * @this {ColorPickerThis}
	 * @description Displays or resets the currently selected color at color list.
	 * @param {Node|string} nodeOrColor Current Selected node
	 * @param {Node} target target
	 */
	init(this: ColorPickerThis, nodeOrColor: Node | string, target: Node): void;
	/**
	 * @this {ColorPickerThis}
	 * @description Store color values
	 * @param {string} hexColorStr Hax color value
	 */
	setHexColor(this: ColorPickerThis, hexColorStr: string): void;
	/**
	 * @this {ColorPickerThis}
	 * @description Close hue slider
	 */
	hueSliderClose(this: ColorPickerThis): void;
	/**
	 * @private
	 * @this {ColorPickerThis}
	 * @description Set color at input element
	 * @param {string} hexColorStr Hax color value
	 */
	_setInputText(this: ColorPickerThis, hexColorStr: string): void;
	/**
	 * @private
	 * @this {ColorPickerThis}
	 * @description Gets color value at color property of node
	 * @param {Node} node Selected node
	 * @returns {string}
	 */
	_getColorInNode(this: ColorPickerThis, node: Node): string;
	/**
	 * @private
	 * @this {ColorPickerThis}
	 * @description Converts color values of other formats to hex color values and returns.
	 * @param {string} colorName Color value
	 * @returns {string}
	 */
	_colorName2hex(this: ColorPickerThis, colorName: string): string;
	/**
	 * @editorMethod Modules.HueSlider
	 * @this {ColorPickerThis}
	 * @description This method is called when the color is selected in the hue slider.
	 * @param {HueSliderColor} color - Color object
	 */
	hueSliderAction(this: ColorPickerThis, color: HueSliderColor): void;
	/**
	 * @editorMethod Modules.HueSlider
	 * @this {ColorPickerThis}
	 * @description This method is called when the hue slider is closed.
	 */
	hueSliderCancelAction(this: ColorPickerThis): void;
}
import CoreInjector from '../editorInjector/_core';
import { HueSlider } from '../modules';
