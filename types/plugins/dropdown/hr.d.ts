import type {} from '../../typedef';
export default HR;
export type HRPluginOptions = {
	/**
	 * - HR list
	 */
	items?: Array<{
		name: string;
		class: string;
		style?: string;
	}>;
};
/**
 * @typedef {Object} HRPluginOptions
 * @property {Array<{name: string, class: string, style?: string}>} [items] - HR list
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
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {HRPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Kernel, pluginOptions: HRPluginOptions);
	title: any;
	list: NodeListOf<HTMLButtonElement>;
	componentSelect(target: HTMLElement): void | boolean;
	componentDeselect(target: HTMLElement): void;
	componentDestroy(target: HTMLElement): Promise<void>;
	shortcut(params: SunEditor.HookParams.Shortcut): void;
	/**
	 * @description Add a `hr` element
	 * @param {string} className HR class name
	 */
	submit(className: string): HTMLElement;
}
import { PluginDropdown } from '../../interfaces';
