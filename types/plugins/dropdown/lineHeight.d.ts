import type {} from '../../typedef';
export default LineHeight;
export type LineHeightPluginOptions = {
	/**
	 * - Line height list
	 */
	items?: Array<{
		text: string;
		value: string;
	}>;
};
/**
 * @typedef {Object} LineHeightPluginOptions
 * @property {Array<{text: string, value: string}>} [items] - Line height list
 */
/**
 * @class
 * @description Line height Plugin
 */
declare class LineHeight extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {LineHeightPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Kernel, pluginOptions: LineHeightPluginOptions);
	title: any;
	sizeList: NodeListOf<Element>;
	currentSize: any;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	#private;
}
import { PluginDropdown } from '../../interfaces';
