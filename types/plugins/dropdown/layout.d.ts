import type {} from '../../typedef';
export default Layout;
export type LayoutPluginOptions = {
	/**
	 * - Layout list. Each item defines a named layout template with raw HTML.
	 * ```js
	 * [{ name: 'Two Columns', html: '<div style="display:flex"><div style="flex:1">Left</div><div style="flex:1">Right</div></div>' }]
	 * ```
	 */
	items?: Array<{
		name: string;
		html: string;
	}>;
};
/**
 * @typedef {Object} LayoutPluginOptions
 * @property {Array<{name: string, html: string}>} [items] - Layout list. Each item defines a named layout template with raw HTML.
 * ```js
 * [{ name: 'Two Columns', html: '<div style="display:flex"><div style="flex:1">Left</div><div style="flex:1">Right</div></div>' }]
 * ```
 */
/**
 * @class
 * @description Layout Plugin, Apply layout to the entire editor.
 */
declare class Layout extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {LayoutPluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: LayoutPluginOptions);
	title: any;
	selectedIndex: number;
	items: {
		name: string;
		html: string;
	}[];
}
import { PluginDropdown } from '../../interfaces';
