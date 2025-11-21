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
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {AlignPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Core, pluginOptions: AlignPluginOptions);
	title: any;
	_itemMenu: HTMLUListElement;
	defaultDir: string;
	alignIcons: {
		justify: string;
		left: string;
		right: string;
		center: string;
	};
	alignList: NodeListOf<Element>;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	setDir(dir: string): void;
	init(): void;
	#private;
}
import { PluginDropdown } from '../../interfaces';
