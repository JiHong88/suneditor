export default ColorPicker;
export type HueSliderParams_colorPicker = import('./HueSlider').HueSliderParams;
export type HueSliderColor_colorPicker = import('./HueSlider').HueSliderColor;
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
	hueSliderOptions?: HueSliderParams_colorPicker | undefined;
};
/**
 * @typedef {import('./HueSlider').HueSliderParams} HueSliderParams_colorPicker
 */
/**
 * @typedef {import('./HueSlider').HueSliderColor} HueSliderColor_colorPicker
 */
/**
 * @typedef {Object} ColorPickerParams
 * @property {Array<string|{value: string, name: string}>=} [colorList=[]] color list
 * @property {number=} [splitNum=0] Number of colors to be displayed in one line
 * @property {string=} [defaultColor] Default color
 * @property {boolean=} [disableHEXInput=false] Disable HEX input
 * @property {boolean=} [disableRemove=false] Disable remove button
 * @property {HueSliderParams_colorPicker=} [hueSliderOptions] hue slider options
 */
/**
 * @class
 * @description Create a color picker element and register for related events. (this.target)
 * - When calling the color selection, "submit", and "remove" buttons, the "action" method of the instance is called with the "color" value as an argument.
 */
declare class ColorPicker extends CoreInjector {
	/**
	 * @constructor
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
	parentForm: HTMLElement[];
	colorList: any[] | NodeListOf<Element>;
	hueSlider: HueSlider;
	checkedIcon: HTMLElement;
	parentFormDisplay: any[];
	/**
	 * @description Displays or resets the currently selected color at color list.
	 * @param {Node|string} nodeOrColor Current Selected node
	 * @param {Node} target target
	 * @param {?((current: Node) => boolean)=} stopCondition - A function used to stop traversing parent nodes while finding the color.
	 * - When this function returns true, the traversal ends at that node.
	 * - e.g., `(node) => this.format.isLine(node)` stops at line-level elements like <p>, <div>.
	 */
	init(nodeOrColor: Node | string, target: Node, stopCondition?: (((current: Node) => boolean) | null) | undefined): void;
	/**
	 * @description Store color values
	 * @param {string} hexColorStr Hax color value
	 */
	setHexColor(hexColorStr: string): void;
	/**
	 * @description Close hue slider
	 */
	hueSliderClose(): void;
	/**
	 * @private
	 * @description Set color at input element
	 * @param {string} hexColorStr Hax color value
	 */
	private _setInputText;
	/**
	 * @private
	 * @description Gets color value at color property of node
	 * @param {Node} node Selected node
	 * @param {(current: Node) => boolean} stopCondition - A function used to stop traversing parent nodes while finding the color.
	 * @returns {string}
	 */
	private _getColorInNode;
	/**
	 * @private
	 * @description Converts color values of other formats to hex color values and returns.
	 * @param {string} colorName Color value
	 * @returns {string}
	 */
	private _colorName2hex;
	/**
	 * @editorMethod Modules.HueSlider
	 * @description This method is called when the color is selected in the hue slider.
	 * @param {HueSliderColor_colorPicker} color - Color object
	 */
	hueSliderAction(color: HueSliderColor_colorPicker): void;
	/**
	 * @editorMethod Modules.HueSlider
	 * @description This method is called when the hue slider is closed.
	 */
	hueSliderCancelAction(): void;
	#private;
}
import CoreInjector from '../editorInjector/_core';
import { HueSlider } from '../modules';
