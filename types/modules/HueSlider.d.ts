import type {} from '../typedef';
export default HueSlider;
export type ControllerParams_hueSlider = import('../modules/Controller').ControllerParams;
export type HueSliderColor = {
	/**
	 * - HEX color
	 */
	hex: string;
	/**
	 * - Red color value
	 */
	r: number;
	/**
	 * - Green color value
	 */
	g: number;
	/**
	 * - Blue color value
	 */
	b: number;
	/**
	 * - Hue color value
	 */
	h: number;
	/**
	 * - Saturation color value
	 */
	s: number;
	/**
	 * - Lightness color value
	 */
	l: number;
};
export type HueSliderParams = {
	/**
	 * The form element to attach the hue slider.
	 */
	form?: Node;
	/**
	 * Whether to create a new form element.
	 */
	isNewForm?: boolean;
	/**
	 * Controller options
	 */
	controllerOptions?: ControllerParams_hueSlider;
};
export function CreateSliderCtx(): {
	slider: HTMLElement;
	offscreenCanvas: HTMLCanvasElement;
	offscreenCtx: CanvasRenderingContext2D;
	wheel: HTMLCanvasElement;
	wheelCtx: CanvasRenderingContext2D;
	wheelPointer: HTMLElement;
	gradientBar: HTMLCanvasElement;
	gradientPointer: HTMLElement;
	fanalColorHex: HTMLElement;
	fanalColorBackground: HTMLElement;
};
/**
 * @typedef {import('../modules/Controller').ControllerParams} ControllerParams_hueSlider
 */
/**
 * @typedef {Object} HueSliderColor
 * @property {string} hex - HEX color
 * @property {number} r - Red color value
 * @property {number} g - Green color value
 * @property {number} b - Blue color value
 * @property {number} h - Hue color value
 * @property {number} s - Saturation color value
 * @property {number} l - Lightness color value
 */
/**
 * @typedef {Object} HueSliderParams
 * @property {Node} [form] The form element to attach the hue slider.
 * @property {boolean} [isNewForm] Whether to create a new form element.
 * @property {ControllerParams_hueSlider} [controllerOptions] Controller options
 */
/**
 * @class
 * @description Create a Hue slider. (only create one at a time)
 * - When you call the .attach() method, the hue slider is appended to the form element.
 * It must be called every time it is used.
 */
declare class HueSlider extends CoreInjector {
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {HueSliderParams} [params={}] Hue slider options
	 * @param {string} [className=""] The class name of the hue slider.
	 */
	constructor(inst: any, params?: HueSliderParams, className?: string);
	inst: any;
	form: Node;
	ctx: {
		wheelX: number;
		wheelY: number;
		lightness: number;
		wheelPointerX: string;
		wheelPointerY: string;
		gradientPointerX: string;
		color: {
			hex: string;
			r: number;
			g: number;
			b: number;
			h: number;
			s: number;
			l: number;
		};
	};
	isOpen: boolean;
	controlle: any;
	controller: Controller;
	/**
	 * @description Get the current color information.
	 * @returns {HueSliderColor} color information
	 */
	get(): HueSliderColor;
	/**
	 * @description Open the hue slider.
	 * @param {Node} target The element to attach the hue slider.
	 */
	open(target: Node): void;
	/**
	 * @description Reset information and close the hue slider.
	 */
	off(): void;
	/**
	 * @description Close the hue slider. (include off method)
	 * - Call the instance's hueSliderCancelAction method.
	 */
	close(): void;
	/**
	 * @description Attach the hue slider to the form element.
	 * @param {?Node=} form The element to attach the hue slider.
	 */
	attach(form?: (Node | null) | undefined): void;
	/**
	 * @description Initialize the hue slider information.
	 */
	init(): void;
	#private;
}
import CoreInjector from '../editorInjector/_core';
import Controller from './Controller';
