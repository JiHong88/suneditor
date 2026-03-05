import type {} from '../../typedef';
export default FontSize;
export type FontSizePluginOptions = {
	/**
	 * - The unit for the font size.
	 * - Accepted values include: `'px'`, `'pt'`, `'em'`, `'rem'`, `'vw'`, `'vh'`, `'%'` or `'text'`.
	 * - If `'text'` is used, a text-based font size list is applied.
	 */
	sizeUnit?: string;
	/**
	 * - Determines whether the default size label is displayed in the dropdown menu.
	 */
	showDefaultSizeLabel?: boolean;
	/**
	 * - When `true`, displays increase and decrease buttons for font size adjustments.
	 */
	showIncDecControls?: boolean;
	/**
	 * - When `true`, disables the direct font size input box.
	 */
	disableInput?: boolean;
	/**
	 * - Optional object to override or extend the default unit mapping for font sizes.
	 */
	unitMap?: {
		[x: string]: {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: Array<number>;
		};
	};
};
/**
 * @typedef {Object} FontSizePluginOptions
 * @property {string} [sizeUnit='px'] - The unit for the font size.
 * - Accepted values include: `'px'`, `'pt'`, `'em'`, `'rem'`, `'vw'`, `'vh'`, `'%'` or `'text'`.
 * - If `'text'` is used, a text-based font size list is applied.
 * @property {boolean} [showDefaultSizeLabel=true] - Determines whether the default size label is displayed in the dropdown menu.
 * @property {boolean} [showIncDecControls=false] - When `true`, displays increase and decrease buttons for font size adjustments.
 * @property {boolean} [disableInput=true] - When `true`, disables the direct font size input box.
 * @property {Object<string, {default: number, inc: number, min: number, max: number, list: Array<number>}>} [unitMap={}] - Optional object to override or extend the default unit mapping for font sizes.
 */
/**
 * @class
 * @implements {PluginCommand}
 * @implements {PluginDropdown}
 * @description FontSize Plugin
 * - This plugin enables users to modify the font size of selected text within the editor.
 * - It supports various measurement units (e.g., 'px', 'pt', 'em', 'rem', 'vw', 'vh', '%') and
 * - provides multiple interfaces: dropdown menus, direct input, and optional increment/decrement buttons.
 */
declare class FontSize extends PluginInput implements PluginCommand, PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {FontSizePluginOptions} pluginOptions - Configuration options for the FontSize plugin.
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: FontSizePluginOptions);
	unitMap: {
		text: {
			default: string;
			list: {
				title: string;
				size: string;
			}[];
		};
		px: {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		pt: {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		em: {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		rem: {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		vw: {
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		vh: {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		'%': {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
	};
	sizeUnit: string;
	title: any;
	inner: string | boolean;
	currentSize: string;
	sizeList: NodeListOf<Element>;
	hasInputFocus: boolean;
	isInputActive: boolean;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	on(target?: HTMLElement): void;
	action(target?: HTMLElement): void | Promise<void>;
	#private;
}
import { PluginCommand } from '../../interfaces';
import { PluginDropdown } from '../../interfaces';
import { PluginInput } from '../../interfaces';
