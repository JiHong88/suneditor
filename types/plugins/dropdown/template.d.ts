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
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {TemplatePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Core, pluginOptions: TemplatePluginOptions);
	title: any;
	selectedIndex: number;
	items: {
		name: string;
		html: string;
	}[];
}
import { PluginDropdown } from '../../interfaces';
