import type {} from '../../typedef';
export default BlockStyle;
export type BlockStyleItem = {
	tag: string;
	command: 'line' | 'br-line' | 'block';
	name?: string;
	class?: string;
};
export type BlockStylePluginOptions = {
	/**
	 * - Format list
	 */
	items?: Array<'p' | 'div' | 'blockquote' | 'pre' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | string | BlockStyleItem>;
};
/**
 * @typedef {{tag: string, command: "line"|"br-line"|"block", name?: string, class?: string}} BlockStyleItem
 */
/**
 * @typedef {Object} BlockStylePluginOptions
 * @property {Array<"p"|"div"|"blockquote"|"pre"|"h1"|"h2"|"h3"|"h4"|"h5"|"h6"|string|BlockStyleItem>} [items] - Format list
 */
/**
 * @class
 * @description BlockStyle Plugin (`P`, `BLOCKQUOTE`, `PRE`, `H1`, `H2`...)
 */
declare class BlockStyle extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {BlockStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Kernel, pluginOptions: BlockStylePluginOptions);
	title: any;
	inner: string;
	formatList: NodeListOf<Element>;
	currentFormat: string;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	/**
	 * @description Create a header tag, call by `shortcut` class
	 * - (e.g. shortcuts._h1: ['c+s+49+$~blockStyle.applyHeaderByShortcut', ''])
	 * @param {SunEditor.HookParams.Shortcut} params - Information of the `shortcut` plugin
	 */
	applyHeaderByShortcut({ keyCode }: SunEditor.HookParams.Shortcut): void;
}
import { PluginDropdown } from '../../interfaces';
