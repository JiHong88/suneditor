import type {} from '../../typedef';
export default ColorPicker;
export type ColorPickerParams = {
	/**
	 * The form element to attach the color picker.
	 */
	form: HTMLElement;
	/**
	 * color list
	 */
	colorList?: Array<
		| string
		| {
				value: string;
				name: string;
		  }
	>;
	/**
	 * Number of colors to be displayed in one line
	 */
	splitNum?: number;
	/**
	 * Default color
	 */
	defaultColor?: string;
	/**
	 * Disable HEX input
	 */
	disableHEXInput?: boolean;
	/**
	 * Disable remove button
	 */
	disableRemove?: boolean;
	/**
	 * hue slider options
	 */
	hueSliderOptions?: import('./HueSlider').HueSliderParams;
};
/**
 * @typedef {Object} ColorPickerParams
 * @property {HTMLElement} form The form element to attach the color picker.
 * @property {Array<string|{value: string, name: string}>} [colorList=[]] color list
 * @property {number} [splitNum=0] Number of colors to be displayed in one line
 * @property {string} [defaultColor] Default color
 * @property {boolean} [disableHEXInput=false] Disable HEX input
 * @property {boolean} [disableRemove=false] Disable remove button
 * @property {import('./HueSlider').HueSliderParams} [hueSliderOptions] hue slider options
 */
/**
 * @class
 * @description Create a color picker element and register for related events. (`this.target`)
 * - When calling the color selection, `submit`, and `remove` buttons, the `action` method of the instance is called with the `color` value as an argument.
 */
declare class ColorPicker {
	/**
	 * @constructor
	 * @param {*} host The instance object that called the constructor.
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {string} styles style property (`"color"`, `"backgroundColor"`..)
	 * @param {ColorPickerParams} params Color picker options
	 */
	constructor(host: any, $: SunEditor.Deps, styles: string, params: ColorPickerParams);
	kind: any;
	host: any;
	form: HTMLElement;
	target: HTMLElement;
	targetButton: Node;
	inputElement: HTMLInputElement;
	styleProperties: string;
	splitNum: number;
	defaultColor: string;
	hueSliderOptions: import('./HueSlider').HueSliderParams;
	currentColor: string;
	colorList: any[] | NodeListOf<Element>;
	hueSlider: HueSlider;
	checkedIcon: HTMLElement;
	/**
	 * @description Displays or resets the currently selected color at color list.
	 * @param {Node|string} nodeOrColor Current Selected node
	 * @param {Node} target target
	 * @param {?(current: Node) => boolean} [stopCondition] - A function used to stop traversing parent nodes while finding the color.
	 * - When this function returns `true`, the traversal ends at that node.
	 * - e.g., `(node) => this.format.isLine(node)` stops at line-level elements like <p>, <div>.
	 * @example
	 * // Initialize with a selected node and stop traversal at line-level elements
	 * this.colorPicker.init(this.$.selection.getNode(), target, (current) => this.$.format.isLine(current));
	 *
	 * // Initialize with a color string directly (e.g., from a table cell style)
	 * this.colorPicker.init(color?.value || '', button);
	 */
	init(nodeOrColor: Node | string, target: Node, stopCondition?: ((current: Node) => boolean) | null): void;
	/**
	 * @description Store color values
	 * @param {string} hexColorStr Hax color value
	 */
	setHexColor(hexColorStr: string): void;
	/**
	 * @description Close hue slider
	 */
	hueSliderClose(): void;
	hueSliderAction(color: SunEditor.Module.HueSlider.Color): void;
	hueSliderCancelAction(): void;
	#private;
}
import HueSlider from './HueSlider';
