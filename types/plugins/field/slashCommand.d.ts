import type {} from '../../typedef';
export default SlashCommand;
export type SlashCommandItem = {
	/**
	 * - Unique identifier for the item.
	 */
	key: string;
	/**
	 * - Display label.
	 */
	title: string;
	/**
	 * - Icon key from `$.icons` (e.g. `'h1'`) or a raw HTML string (e.g. `'<svg>...</svg>'`).
	 */
	icon?: string;
	/**
	 * - Extra search terms used in addition to the title.
	 */
	keywords?: string[];
	/**
	 * - Invoked when the item is selected.
	 * The trigger string (e.g. `/hea`) is already removed from the editor and the caret restored to that position before `action` runs.
	 * The action owns its history entry — calling an L3 wrapper (`$.html.*`, `$.format.*`, `$.inline.apply`) auto-pushes; otherwise call `$.history.push(false)` manually.
	 */
	action: (arg0: SunEditor.Deps, arg1: SlashCommandActionContext) => void | Promise<void>;
};
export type SlashCommandActionContext = {
	/**
	 * - The configured trigger character (e.g. `'/'`).
	 */
	triggerChar: string;
	/**
	 * - The text the user typed after the trigger (e.g. `'hea'`).
	 */
	query: string;
	/**
	 * - The selected item.
	 */
	item: SlashCommandItem;
};
export type SlashCommandPluginOptions = {
	/**
	 * - Character that opens the command menu. Single character recommended.
	 */
	triggerChar?: string;
	/**
	 * - Menu entries. Strings resolve via `ResolveButton`
	 * (plugin names, built-in commands like `'bold'`); objects are custom items with their own `action`.
	 * Required.
	 */
	items: Array<SlashCommandItem | string>;
	/**
	 * - Debounce delay (ms) before the input is inspected for the trigger.
	 */
	delayTime?: number;
	/**
	 * - Maximum number of items shown in the dropdown.
	 */
	limitSize?: number;
	/**
	 * - Message shown when no items match the query. If unset, the menu closes on no match.
	 */
	emptyMessage?: string;
	/**
	 * - Custom item HTML renderer.
	 * Applied only to custom item objects; plugin-name entries always render with the canonical BlockHandle row.
	 * ```js
	 * SUNEDITOR.create('#editor', {
	 * plugins: [slashCommand],
	 * slashCommand: {
	 * triggerChar: '/',
	 * items: [
	 * {
	 * key: 'h1',
	 * title: 'Heading 1',
	 * icon: 'h1',
	 * keywords: ['header', 'title'],
	 * // A line-level tag (H1-H6, P): `setLine` CHANGES the current line's tag → `<h1>…</h1>`.
	 * // Do NOT use `applyBlock` here — it WRAPS (`<h1><p>…</p></h1>`) and traps Enter inside.
	 * action: ($) => $.format.setLine(document.createElement('H1')),
	 * },
	 * {
	 * key: 'code',
	 * title: 'Code block',
	 * keywords: ['pre'],
	 * // A br-line block (PRE): `setBrLine` converts the line to a `<br>`-separated code block.
	 * action: ($) => $.format.setBrLine(document.createElement('PRE')),
	 * },
	 * {
	 * key: 'quote',
	 * title: 'Quote',
	 * keywords: ['blockquote'],
	 * // A container block (BLOCKQUOTE, DIV…): `applyBlock` WRAPS the selected lines → `<blockquote>…</blockquote>`.
	 * action: ($) => $.format.applyBlock(document.createElement('BLOCKQUOTE')),
	 * },
	 * 'bold',
	 * 'image',
	 * 'blockStyle',
	 * ],
	 * },
	 * });
	 * ```
	 */
	renderItem?: (
		arg0: SlashCommandItem,
		arg1: {
			icons: any;
		},
	) => string;
};
/**
 * @typedef {Object} SlashCommandItem
 * @property {string} key - Unique identifier for the item.
 * @property {string} title - Display label.
 * @property {string} [icon] - Icon key from `$.icons` (e.g. `'h1'`) or a raw HTML string (e.g. `'<svg>...</svg>'`).
 * @property {string[]} [keywords] - Extra search terms used in addition to the title.
 * @property {function(SunEditor.Deps, SlashCommandActionContext): void | Promise<void>} action - Invoked when the item is selected.
 *   The trigger string (e.g. `/hea`) is already removed from the editor and the caret restored to that position before `action` runs.
 *   The action owns its history entry — calling an L3 wrapper (`$.html.*`, `$.format.*`, `$.inline.apply`) auto-pushes; otherwise call `$.history.push(false)` manually.
 */
/**
 * @typedef {Object} SlashCommandActionContext
 * @property {string} triggerChar - The configured trigger character (e.g. `'/'`).
 * @property {string} query - The text the user typed after the trigger (e.g. `'hea'`).
 * @property {SlashCommandItem} item - The selected item.
 */
/**
 * @typedef {Object} SlashCommandPluginOptions
 * @property {string} [triggerChar='/'] - Character that opens the command menu. Single character recommended.
 * @property {Array<SlashCommandItem | string>} items - Menu entries. Strings resolve via `ResolveButton`
 *   (plugin names, built-in commands like `'bold'`); objects are custom items with their own `action`.
 *   Required.
 * @property {number} [delayTime=120] - Debounce delay (ms) before the input is inspected for the trigger.
 * @property {number} [limitSize=10] - Maximum number of items shown in the dropdown.
 * @property {string} [emptyMessage] - Message shown when no items match the query. If unset, the menu closes on no match.
 * @property {function(SlashCommandItem, { icons: Object }): string} [renderItem] - Custom item HTML renderer.
 *   Applied only to custom item objects; plugin-name entries always render with the canonical BlockHandle row.
 * ```js
 * SUNEDITOR.create('#editor', {
 *   plugins: [slashCommand],
 *   slashCommand: {
 *     triggerChar: '/',
 *     items: [
 *       {
 *         key: 'h1',
 *         title: 'Heading 1',
 *         icon: 'h1',
 *         keywords: ['header', 'title'],
 *         // A line-level tag (H1-H6, P): `setLine` CHANGES the current line's tag → `<h1>…</h1>`.
 *         // Do NOT use `applyBlock` here — it WRAPS (`<h1><p>…</p></h1>`) and traps Enter inside.
 *         action: ($) => $.format.setLine(document.createElement('H1')),
 *       },
 *       {
 *         key: 'code',
 *         title: 'Code block',
 *         keywords: ['pre'],
 *         // A br-line block (PRE): `setBrLine` converts the line to a `<br>`-separated code block.
 *         action: ($) => $.format.setBrLine(document.createElement('PRE')),
 *       },
 *       {
 *         key: 'quote',
 *         title: 'Quote',
 *         keywords: ['blockquote'],
 *         // A container block (BLOCKQUOTE, DIV…): `applyBlock` WRAPS the selected lines → `<blockquote>…</blockquote>`.
 *         action: ($) => $.format.applyBlock(document.createElement('BLOCKQUOTE')),
 *       },
 *       'bold',
 *       'image',
 *       'blockStyle',
 *     ],
 *   },
 * });
 * ```
 */
/**
 * @class
 * @description Slash Command plugin
 * - Notion / Tiptap style "/" command menu. Triggered by the configured character (default `'/'`).
 * - Menu rendering + dispatch is delegated to {@link CommandMenu}, which is also used by BlockHandle's
 *   action menu — both menus share the exact same row HTML and dispatch behavior.
 * - SlashCommand-specific concerns kept here: input watching, debounce, trigger detection,
 *   trigger text deletion before dispatch, empty-state row.
 */
declare class SlashCommand extends PluginField {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 * @param {SlashCommandPluginOptions} pluginOptions
	 */
	constructor(kernel: SunEditor.Kernel, pluginOptions: SlashCommandPluginOptions);
	controller: Controller;
	onInput(params: SunEditor.HookParams.InputWithData): void;
	onKeyDown(params: SunEditor.HookParams.KeyEvent): void | boolean;
	#private;
}
import { PluginField } from '../../interfaces';
import { Controller } from '../../modules/contract';
