import type {} from '../../typedef';
export default ParagraphStyle;
export type ParagraphStylePluginOptions = {
	/**
	 * - Paragraph item list
	 * ```js
	 * // use default paragraph styles
	 * ['spaced', 'bordered', 'neon']
	 * // custom paragraph styles
	 * [
	 * { name: 'spaced', class: '__se__p-spaced', _class: '' },
	 * { name: 'bordered', class: '__se__p-bordered', _class: '' },
	 * { name: 'neon', class: '__se__p-neon', _class: '' }
	 * ]
	 * ```
	 */
	items?: Array<
		| string
		| {
				name: string;
				class: string;
				_class: string;
		  }
	>;
};
/**
 * @typedef {Object} ParagraphStylePluginOptions
 * @property {Array<string|{name: string, class: string, _class: string}>} [items] - Paragraph item list
 * ```js
 * // use default paragraph styles
 * ['spaced', 'bordered', 'neon']
 * // custom paragraph styles
 * [
 *   { name: 'spaced', class: '__se__p-spaced', _class: '' },
 *   { name: 'bordered', class: '__se__p-bordered', _class: '' },
 *   { name: 'neon', class: '__se__p-neon', _class: '' }
 * ]
 * ```
 */
/**
 * @class
 * @description A plugin to style lines using classes.
 */
declare class ParagraphStyle extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {ParagraphStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: ParagraphStylePluginOptions);
	title: any;
	classList: NodeListOf<Element>;
}
import { PluginDropdown } from '../../interfaces';
