import type {} from '../../typedef';
export default BlockStyle;
export type BlockStylePluginOptions = {
	/**
	 * - Format list
	 */
	items?: Array<string>;
};
/**
 * @typedef {Object} BlockStylePluginOptions
 * @property {Array<string>} [items] - Format list
 */
/**
 * @class
 * @description BlockStyle Plugin (P, BLOCKQUOTE, PRE, H1, H2...)
 */
declare class BlockStyle extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {BlockStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: __se__EditorCore, pluginOptions: BlockStylePluginOptions);
	title: any;
	inner: string;
	formatList: NodeListOf<Element>;
	currentFormat: string;
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
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 */
	action(target: HTMLElement): void;
	/**
	 * @description Create a header tag, call by "shortcut" class
	 * - (e.g. shortcuts._h1: ['c+s+49+$~blockStyle.applyHeaderByShortcut', ''])
	 * @param {__se__PluginShortcutInfo} params - Information of the "shortcut" plugin
	 */
	applyHeaderByShortcut({ keyCode }: __se__PluginShortcutInfo): void;
}
import EditorInjector from '../../editorInjector';
