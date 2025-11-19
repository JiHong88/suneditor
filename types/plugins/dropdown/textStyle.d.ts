import type {} from '../../typedef';
export default TextStyle;
export type TextStylePluginOptions = {
	/**
	 * - Text style item list
	 */
	items: Array<
		| string
		| {
				name: string;
				class: string;
				tag: string;
		  }
	>;
};
/**
 * @typedef {Object} TextStylePluginOptions
 * @property {Array<string|{name: string, class: string, tag: string}>} items - Text style item list
 */
/**
 * @class
 * @description Text style Plugin, Applies a tag that specifies text styles to a selection.
 */
declare class TextStyle extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {TextStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Core, pluginOptions: TextStylePluginOptions);
	title: any;
	styleList: NodeListOf<Element>;
}
import { PluginDropdown } from '../../interfaces';
