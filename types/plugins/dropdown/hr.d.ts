import type {} from '../../typedef';
export default HR;
export type HRPluginOptions = {
	/**
	 * - HR list.
	 * `style` is applied to the inserted `hr`. Allow its properties with the `tagStyles` option
	 * (e.g. `tagStyles: { hr: 'border-top' }`) so they survive content cleaning.
	 * ```js
	 * [
	 * { name: 'Solid', class: '__se__solid', style: 'border-top: 1px solid #000;' },
	 * { name: 'Dashed', class: '__se__dashed' }
	 * ]
	 * ```
	 */
	items?: Array<{
		name: string;
		class: string;
		style?: string;
	}>;
};
/**
 * @typedef {Object} HRPluginOptions
 * @property {Array<{name: string, class: string, style?: string}>} [items] - HR list.
 * `style` is applied to the inserted `hr`. Allow its properties with the `tagStyles` option
 * (e.g. `tagStyles: { hr: 'border-top' }`) so they survive content cleaning.
 * ```js
 * [
 *   { name: 'Solid', class: '__se__solid', style: 'border-top: 1px solid #000;' },
 *   { name: 'Dashed', class: '__se__dashed' }
 * ]
 * ```
 */
/**
 * @class
 * @description HR Plugin
 */
declare class HR extends PluginDropdown {
	/**
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node: HTMLElement): HTMLElement | null;
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {HRPluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: HRPluginOptions);
	title: any;
	list: NodeListOf<HTMLButtonElement>;
	componentSelect(target: HTMLElement): void | boolean;
	componentDeselect(target: HTMLElement): void;
	componentDestroy(target: HTMLElement): Promise<void>;
	shortcut(params: SunEditor.HookParams.Shortcut): void;
	/**
	 * @description Add a `hr` element
	 * @param {string} className HR class name
	 * @param {?string} [style] HR inline style
	 */
	submit(className: string, style?: string | null): HTMLElement;
}
import { PluginDropdown } from '../../interfaces';
