import type {} from '../../typedef';
export default Font;
export type FontPluginOptions = {
	/**
	 * - Font list
	 */
	items?: Array<string>;
};
/**
 * @typedef {Object} FontPluginOptions
 * @property {Array<string>} [items] - Font list
 */
/**
 * @class
 * @description Text font plugin
 */
declare class Font extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {FontPluginOptions} pluginOptions - plugin options
	 */
	constructor(editor: SunEditor.Core, pluginOptions: FontPluginOptions);
	title: any;
	inner: string;
	currentFont: string;
	fontList: NodeListOf<Element>;
	fontArray: string[];
	active(element?: HTMLElement | null, target?: HTMLElement | null): boolean | void;
	#private;
}
import { PluginDropdown } from '../../interfaces';
