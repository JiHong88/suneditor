import type {} from '../../typedef';
export default LineHeight;
export type LineHeightPluginOptions = {
	/**
	 * - Line height list
	 * ```js
	 * [{ text: 'Single', value: '1' }, { text: '1.5', value: '1.5' }, { text: 'Double', value: '2' }]
	 * ```
	 */
	items?: Array<{
		text: string;
		value: string;
	}>;
};
/**
 * @typedef {Object} LineHeightPluginOptions
 * @property {Array<{text: string, value: string}>} [items] - Line height list
 * ```js
 * [{ text: 'Single', value: '1' }, { text: '1.5', value: '1.5' }, { text: 'Double', value: '2' }]
 * ```
 */
/**
 * @class
 * @description Line height Plugin
 */
declare class LineHeight extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {LineHeightPluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: LineHeightPluginOptions);
	title: any;
	sizeList: NodeListOf<Element>;
	currentSize: any;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	#private;
}
import { PluginDropdown } from '../../interfaces';
