import type {} from '../../typedef';
export default Template;
export type TemplatePluginOptions = {
	/**
	 * - Template list
	 */
	items?: Array<{
		name: string;
		html: string;
	}>;
};
/**
 * @typedef {Object} TemplatePluginOptions
 * @property {Array<{name: string, html: string}>} [items] - Template list
 */
/**
 * @class
 * @description Template Plugin, Apply a template to the selection.
 */
declare class Template extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {TemplatePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Kernel, pluginOptions: TemplatePluginOptions);
	title: any;
	selectedIndex: number;
	items: {
		name: string;
		html: string;
	}[];
}
import { PluginDropdown } from '../../interfaces';
