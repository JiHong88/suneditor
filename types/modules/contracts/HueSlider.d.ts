import type {} from '../../typedef';
export default HueSlider;
/**
 * HueSlider color information object
 */
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
	 * Whether to create a new form element.
	 */
	isNewForm?: boolean;
	/**
	 * Parent elements for controller positioning.
	 */
	parents?: Array<HTMLElement>;
	/**
	 * Controller options (excluding 'parents')
	 */
	controllerOptions?: import('./Controller').ControllerParams;
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
 * HueSlider color information object
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
 * @property {boolean} [isNewForm] Whether to create a new form element.
 * @property {Array<HTMLElement>} [parents] Parent elements for controller positioning.
 * @property {import('./Controller').ControllerParams} [controllerOptions] Controller options (excluding 'parents')
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
	 * @param {import('./ColorPicker').default} inst The instance object that called the constructor.
	 * @param {HueSliderParams} [params={}] Hue slider options
	 * @param {string} [className=""] The class name of the hue slider.
	 */
	constructor(inst: import('./ColorPicker').default, params?: HueSliderParams, className?: string);
	inst: import('./ColorPicker').default;
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
	circle: Element;
	controller: Controller;
	controllerAction(target: HTMLButtonElement): void;
	controllerClose(): void;
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
	 * @description Close the hue slider.
	 * - Call the instance's hueSliderCancelAction method.
	 */
	close(): void;
	/**
	 * @description Attach the hue slider to the form element.
	 * @param {?Node} [form] The element to attach the hue slider.
	 */
	attach(form?: Node | null): void;
	/**
	 * @description Initialize the hue slider information.
	 */
	init(): void;
	#private;
}
import CoreInjector from '../../editorInjector/_core';
import Controller from './Controller';
