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
	 * - Format list.
	 * Use string shortcuts for built-in tags, or `BlockStyleItem` objects for custom block styles.
	 * - `command` — `"line"`: single line block, `"br-line"`: br-separated block, `"block"`: container block.
	 * - `class` — must use the format prefix that matches `command`: `__se__format__line_xxx`, `__se__format__br_line_xxx`
	 * or `__se__format__block_xxx`. Only that class is used to identify the style (other classes are not recognized).
	 * ```js
	 * // string shortcuts + custom item
	 * ['p', 'h1', 'h2', 'blockquote', { tag: 'div', command: 'block', name: 'Custom Block', class: '__se__format__block_custom' }]
	 * ```
	 */
	items?: Array<
		'p' | 'div' | 'blockquote' | 'pre' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | string | BlockStyleItem
	>;
};
/**
 * @typedef {{tag: string, command: "line"|"br-line"|"block", name?: string, class?: string}} BlockStyleItem
 */
/**
 * @typedef {Object} BlockStylePluginOptions
 * @property {Array<"p"|"div"|"blockquote"|"pre"|"h1"|"h2"|"h3"|"h4"|"h5"|"h6"|string|BlockStyleItem>} [items] - Format list.
 * Use string shortcuts for built-in tags, or `BlockStyleItem` objects for custom block styles.
 * - `command` — `"line"`: single line block, `"br-line"`: br-separated block, `"block"`: container block.
 * - `class` — must use the format prefix that matches `command`: `__se__format__line_xxx`, `__se__format__br_line_xxx`
 *   or `__se__format__block_xxx`. Only that class is used to identify the style (other classes are not recognized).
 * ```js
 * // string shortcuts + custom item
 * ['p', 'h1', 'h2', 'blockquote', { tag: 'div', command: 'block', name: 'Custom Block', class: '__se__format__block_custom' }]
 * ```
 */
/**
 * @class
 * @description BlockStyle Plugin (`P`, `BLOCKQUOTE`, `PRE`, `H1`, `H2`...)
 */
declare class BlockStyle extends PluginDropdown {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {BlockStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: BlockStylePluginOptions);
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
