import type {} from '../../typedef';
export default TextStyle;
export type TextStylePluginOptions = {
	/**
	 * - Text style item list.
	 * Use string shortcuts for built-in styles (e.g., `'shadow'`), or objects for custom styles.
	 * ```js
	 * ['shadow', { name: 'Highlight', class: 'my-highlight', tag: 'mark' }]
	 * ```
	 */
	items?: Array<
		| string
		| {
				name: string;
				class: string;
				tag?: string;
		  }
	>;
};
/**
 * @typedef {Object} TextStylePluginOptions
 * @property {Array<string|{name: string, class: string, tag?: string}>} [items] - Text style item list.
 * Use string shortcuts for built-in styles (e.g., `'shadow'`), or objects for custom styles.
 * ```js
 * ['shadow', { name: 'Highlight', class: 'my-highlight', tag: 'mark' }]
 * ```
 */
/**
 * @class
 * @description Text style Plugin, Applies a tag that specifies text styles to a selection.
 */
declare class TextStyle extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {TextStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: TextStylePluginOptions);
	title: any;
	styleList: NodeListOf<Element>;
}
import { PluginDropdown } from '../../interfaces';
