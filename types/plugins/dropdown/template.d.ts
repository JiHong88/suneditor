import type {} from '../../typedef';
export default Template;
export type TemplatePluginOptions = {
	/**
	 * - Template list
	 * ```js
	 * [{ name: 'Greeting', html: '<p>Hello! Thank you for contacting us.</p>' }]
	 * ```
	 */
	items?: Array<{
		name: string;
		html: string;
	}>;
};
/**
 * @typedef {Object} TemplatePluginOptions
 * @property {Array<{name: string, html: string}>} [items] - Template list
 * ```js
 * [{ name: 'Greeting', html: '<p>Hello! Thank you for contacting us.</p>' }]
 * ```
 */
/**
 * @class
 * @description Template Plugin, Apply a template to the selection.
 */
declare class Template extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {TemplatePluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: TemplatePluginOptions);
	title: any;
	selectedIndex: number;
	items: {
		name: string;
		html: string;
	}[];
}
import { PluginDropdown } from '../../interfaces';
