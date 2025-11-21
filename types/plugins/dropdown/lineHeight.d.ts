import type {} from '../../typedef';
export default LineHeight;
export type LineHeightPluginOptions = {
	/**
	 * - Line height list
	 */
	items?: Array<{
		text: string;
		value: number;
	}>;
};
/**
 * @typedef {Object} LineHeightPluginOptions
 * @property {Array<{text: string, value: number}>} [items] - Line height list
 */
/**
 * @class
 * @description Line height Plugin
 */
declare class LineHeight extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {LineHeightPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Core, pluginOptions: LineHeightPluginOptions);
	title: any;
	sizeList: NodeListOf<Element>;
	currentSize: any;
	active(element?: HTMLElement | null, target?: HTMLElement | null): boolean | void;
	#private;
}
import { PluginDropdown } from '../../interfaces';
