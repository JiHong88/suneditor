import type {} from '../../typedef';
export default Align;
export type AlignPluginOptions = {
	/**
	 * - Align items
	 */
	items?: Array<'right' | 'center' | 'left' | 'justify'>;
};
/**
 * @typedef {Object} AlignPluginOptions
 * @property {Array.<"right"|"center"|"left"|"justify">} [items] - Align items
 */
/**
 * @class
 * @description Align plugin
 */
declare class Align extends PluginDropdown {
	/**
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {AlignPluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: AlignPluginOptions);
	title: any;
	_itemMenu: HTMLUListElement;
	defaultDir: string;
	alignIcons: {
		justify: any;
		left: any;
		right: any;
		center: any;
	};
	alignList: NodeListOf<Element>;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	setDir(dir: string): void;
	init(): void;
	#private;
}
import { PluginDropdown } from '../../interfaces';
