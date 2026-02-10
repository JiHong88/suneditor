import type {} from '../../typedef';
export default Layout;
export type LayoutPluginOptions = {
	/**
	 * - Layout list
	 */
	items?: Array<{
		name: string;
		html: string;
	}>;
};
/**
 * @typedef {Object} LayoutPluginOptions
 * @property {Array<{name: string, html: string}>} [items] - Layout list
 */
/**
 * @class
 * @description Layout Plugin, Apply layout to the entire editor.
 */
declare class Layout extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {LayoutPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Kernel, pluginOptions: LayoutPluginOptions);
	title: any;
	selectedIndex: number;
	items: {
		name: string;
		html: string;
	}[];
}
import { PluginDropdown } from '../../interfaces';
