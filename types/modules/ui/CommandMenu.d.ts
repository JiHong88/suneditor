import type {} from '../../typedef';
/**
 * @description Resolve an icon spec to an HTML string. Accepts a key from `$.icons`,
 * a raw HTML snippet (anything starting with `<`), or empty.
 * @param {string} icon
 * @param {Object} icons
 * @returns {string}
 */
export function resolveIconHTML(icon: string, icons: any): string;
/**
 * @description Build the canonical command-menu row HTML. Single source of truth for the
 * BlockHandle action menu and the SlashCommand menu, so they look identical.
 * @param {string} label
 * @param {string} iconHTML
 * @returns {string}
 */
export function buildRowHTML(label: string, iconHTML: string): string;
export default CommandMenu;
export type CommandMenuItem = {
	/**
	 * - Optional identifier.
	 */
	key?: string;
	/**
	 * - Display label.
	 */
	title: string;
	/**
	 * - `$.icons` key or raw HTML snippet.
	 */
	icon?: string;
	/**
	 * - Extra search terms (used by the filter).
	 */
	keywords?: string[];
	/**
	 * - Custom callback. The second
	 * argument is the host-supplied context (e.g. `{block}` for BlockHandle, `{triggerChar, query}` for SlashCommand).
	 */
	action: (arg0: SunEditor.Deps, arg1: any) => void | Promise<void>;
};
export type SubmenuChild = {
	/**
	 * - Owning plugin key.
	 */
	pluginName: string;
	/**
	 * - The original toolbar dropdown button element. Passed to `plugin.action(element)` on click.
	 */
	element: HTMLElement;
};
export type ResolvedItem = {
	kind: 'custom' | 'plugin' | 'submenu' | 'dropdownFree';
	title: string;
	iconHTML: string;
	/**
	 * - Lower-cased haystack for substring filtering.
	 */
	search: string;
	raw?: CommandMenuItem;
	/**
	 * - Plugin key.
	 */
	name?: string;
	/**
	 * - Plugin type (`'modal'`, `'command'`, etc.).
	 */
	type?: string;
	command?: string;
	/**
	 * - For `kind: 'submenu'` — clickable child rows (one per dropdown item).
	 */
	children?: SubmenuChild[];
	/**
	 * - For `kind: 'submenu'` — HTML for each child row.
	 */
	childMenus?: string[];
};
export type CommandMenuParams = {
	/**
	 * - Raw menu entries.
	 */
	items: Array<string | CommandMenuItem>;
	/**
	 *   Caller-provided plugin/button resolver. Inject `ResolveButton` from `core/section/constructor`.
	 *   Injected (not imported) because this module lives under `src/modules/` and cannot import from `src/core/*`.
	 */
	resolveButton: (
		arg0: string,
		arg1: any,
		arg2: any,
		arg3: any,
		arg4: any,
	) => {
		title: string;
		icon: string;
		type: string;
		command: string;
	} | null;
	/**
	 * - Base SelectMenu params (`position`, `minWidth`, `keydownTarget`, etc.).
	 */
	selectMenuParams: any;
	/**
	 * - Optional renderer
	 * applied to custom (object) items only. Plugin-string items always render with `buildRowHTML`.
	 */
	renderCustomItem?: (
		arg0: CommandMenuItem,
		arg1: {
			icons: any;
		},
	) => string;
};
/**
 * @typedef {Object} CommandMenuItem
 * @property {string} [key] - Optional identifier.
 * @property {string} title - Display label.
 * @property {string} [icon] - `$.icons` key or raw HTML snippet.
 * @property {string[]} [keywords] - Extra search terms (used by the filter).
 * @property {function(SunEditor.Deps, *): void | Promise<void>} action - Custom callback. The second
 *   argument is the host-supplied context (e.g. `{block}` for BlockHandle, `{triggerChar, query}` for SlashCommand).
 */
/**
 * @typedef {Object} SubmenuChild
 * @property {string} pluginName - Owning plugin key.
 * @property {HTMLElement} element - The original toolbar dropdown button element. Passed to `plugin.action(element)` on click.
 */
/**
 * @typedef {Object} ResolvedItem
 * @property {'custom'|'plugin'|'submenu'|'dropdownFree'} kind
 * @property {string} title
 * @property {string} iconHTML
 * @property {string} search   - Lower-cased haystack for substring filtering.
 * @property {CommandMenuItem} [raw]
 * @property {string} [name]   - Plugin key.
 * @property {string} [type]   - Plugin type (`'modal'`, `'command'`, etc.).
 * @property {string} [command]
 * @property {SubmenuChild[]} [children]   - For `kind: 'submenu'` — clickable child rows (one per dropdown item).
 * @property {string[]} [childMenus]       - For `kind: 'submenu'` — HTML for each child row.
 */
/**
 * @typedef {Object} CommandMenuParams
 * @property {Array<string | CommandMenuItem>} items - Raw menu entries.
 * @property {function(string, Object, *, Object, Object): ({title: string, icon: string, type: string, command: string} | null)} resolveButton
 *   Caller-provided plugin/button resolver. Inject `ResolveButton` from `core/section/constructor`.
 *   Injected (not imported) because this module lives under `src/modules/` and cannot import from `src/core/*`.
 * @property {Object} selectMenuParams - Base SelectMenu params (`position`, `minWidth`, `keydownTarget`, etc.).
 * @property {function(CommandMenuItem, { icons: Object }): string} [renderCustomItem] - Optional renderer
 *   applied to custom (object) items only. Plugin-string items always render with `buildRowHTML`.
 */
/**
 * @class
 * @description Shared command-menu module used by BlockHandle and SlashCommand.
 * - Owns the underlying `SelectMenu`, renders rows with the canonical BlockHandle row HTML.
 * - Supports four item kinds:
 *   - `'custom'` — user-defined `{title, icon?, action}` invoked with `($, hostContext)`.
 *   - `'plugin'` — plain plugin (modal/browser/command/popup) dispatched via `plugin.open/show/action`.
 *   - `'submenu'` — dropdown plugin auto-expanded inline (children come from `$.menu.itemsMap`).
 *   - `'dropdownFree'` — dropdown-free plugin (e.g. `fontColor`, `table`) shown with a submenu arrow
 *     and an attached hover flyout that reuses the plugin's toolbar dropdown DOM.
 * - Handles blur prevention on mousedown, hover flyout lifecycle, and click-to-toggle for dropdown-free.
 *
 * Host responsibilities (kept outside this module):
 * - Pre-dispatch side effects (BlockHandle: `expandRangeToFullLines`; SlashCommand: delete trigger text).
 * - Anchor element selection (BlockHandle anchors to the drag button; SlashCommand to a Controller wrapper).
 * - Context object for custom-item actions.
 */
declare class CommandMenu {
	/**
	 * @constructor
	 * @param {*} _host - Reserved for future host-aware behavior (kept for API symmetry with `Modal`/`Controller`).
	 * @param {SunEditor.Deps} $ - Deps bag.
	 * @param {CommandMenuParams} params
	 */
	constructor(_host: any, $: SunEditor.Deps, params: CommandMenuParams);
	/** @type {SelectMenu} */
	selectMenu: SelectMenu;
	/**
	 * @description Bind the menu to a reference element and register the click handler.
	 * @param {HTMLElement} referElement
	 * @param {(item: ResolvedItem|null) => void} onSelect - Called with the resolved item picked by the user.
	 *   Hosts run their pre-dispatch hook here (delete trigger, etc.) and then call `dispatch(item, ctx)`.
	 * @param {{ class?: string, style?: string }} [attr]
	 */
	attach(
		referElement: HTMLElement,
		onSelect: (item: ResolvedItem | null) => void,
		attr?: {
			class?: string;
			style?: string;
		},
	): void;
	/**
	 * @description Replace the items list (e.g. when host options change). Invalidates the resolved cache.
	 * @param {Array<string | CommandMenuItem>} items
	 */
	setItems(items: Array<string | CommandMenuItem>): void;
	/**
	 * @description Lazily normalize raw items. Lazy because plugin instances (`$.plugins`) may not
	 * be available during the host's constructor.
	 * @returns {ResolvedItem[]}
	 */
	getItems(): ResolvedItem[];
	/**
	 * @description Case-insensitive substring filter on `title + keywords + plugin name`.
	 * Empty query returns all items (up to `limit`).
	 * @param {string} query
	 * @param {number} [limit=Infinity]
	 * @returns {ResolvedItem[]}
	 */
	filter(query: string, limit?: number): ResolvedItem[];
	/**
	 * @description Build row HTML for a list of resolved items.
	 * @param {ResolvedItem[]} items
	 * @returns {string[]}
	 */
	renderRows(items: ResolvedItem[]): string[];
	/**
	 * @description Populate the SelectMenu rows.
	 * @param {ResolvedItem[]} items
	 */
	createRows(items: ResolvedItem[]): void;
	/**
	 * @description Open the SelectMenu. Lazily (re-)registers menu rows into
	 * `commandDispatcher.targets` so `selectionState.update` paints the `active` class on them through
	 * @param {string} [position]
	 */
	open(position?: string): void;
	/**
	 * @description Close the SelectMenu. Also unregisters menu rows from `commandDispatcher.targets`
	 */
	close(): void;
	/**
	 * @description Highlight a row.
	 * @param {number} index
	 */
	setItem(index: number): void;
	/**
	 * @description Soft-hide / soft-show without changing open state. Pass-through.
	 * @param {boolean} hidden
	 */
	setHidden(hidden: boolean): void;
	get isOpen(): boolean;
	/**
	 * @description Dispatch a resolved item. For custom items, calls `raw.action($, ctx)`. For plugin
	 * items, routes to `plugin.open/show/action` or `commandDispatcher.run` (built-ins). For dropdown-free
	 * items, toggles the hover flyout
	 * @param {ResolvedItem | SubmenuChild | null} item
	 * @param {*} [ctx] - Context passed to custom-item `action` (host-specific shape).
	 * @returns {boolean} `true` if a plugin was dispatched
	 */
	dispatch(item: ResolvedItem | SubmenuChild | null, ctx?: any): boolean;
	#private;
}
import SelectMenu from './SelectMenu.js';
