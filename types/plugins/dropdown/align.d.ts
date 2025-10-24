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
declare class Align extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {AlignPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Core, pluginOptions: AlignPluginOptions);
	title: any;
	icon: string;
	_itemMenu: HTMLUListElement;
	defaultDir: string;
	alignIcons: {
		justify: string;
		left: string;
		right: string;
		center: string;
	};
	alignList: NodeListOf<Element>;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement=} element - Node element where the cursor is currently located
	 * @param {?HTMLElement=} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	active(element?: (HTMLElement | null) | undefined, target?: (HTMLElement | null) | undefined): boolean;
	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} target Line element at the current cursor position
	 */
	on(target: HTMLElement): void;
	/**
	 * @editorMethod Editor.core
	 * @description Executes the method called when the rtl, ltr mode changes. ("editor.setDir")
	 * @param {string} dir Direction ("rtl" or "ltr")
	 */
	setDir(dir: string): void;
	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 */
	action(target: HTMLElement): void;
}
import EditorInjector from '../../editorInjector';
