import type {} from '../../typedef';
export default SelectMenu;
export type SelectMenuParams = {
	/**
	 * Position of the select menu, specified as `"[left|right]-[middle|top|bottom]"` or `"[top|bottom]-[center|left|right]"`.
	 * ```js
	 * // position
	 * 'left-bottom' // menu appears below, aligned to the left
	 * 'top-center'  // menu appears above, centered
	 * ```
	 */
	position: string;
	/**
	 * Flag to determine if the checklist is enabled (`true` or `false`)
	 */
	checkList?: boolean;
	/**
	 * Optional text direction: `"rtl"` for right-to-left, `"ltr"` for left-to-right
	 */
	dir?: 'rtl' | 'ltr';
	/**
	 * Optional split number for horizontal positioning; defines how many items per row
	 */
	splitNum?: number;
	/**
	 * Optional method to call when the menu is opened
	 */
	openMethod?: () => void;
	/**
	 * Optional method to call when the menu is closed
	 */
	closeMethod?: () => void;
	/**
	 * Optional max-height CSS value (e.g. `"200px"`). Enables scrolling when items exceed this height.
	 */
	maxHeight?: string;
	/**
	 * Optional min-width CSS value (e.g. `"130px"`).
	 */
	minWidth?: string;
	/**
	 * Optional override for the keyboard navigation target. By default `on()` listens
	 * - on the iframe `contentWindow` (`_ww`) when the refer isn't an input — appropriate when the
	 * - refer is inside the wysiwyg. Set this to `window` (parent) for menus whose refer lives in
	 * - the parent doc (e.g. BlockHandle's dragBtn in `carrierWrapper`). Also avoids
	 * - cross-origin/sandboxed iframe `addEventListener` errors.
	 */
	keydownTarget?: any;
};
/**
 * @typedef {Object} SelectMenuParams
 * @property {string} position Position of the select menu, specified as `"[left|right]-[middle|top|bottom]"` or `"[top|bottom]-[center|left|right]"`.
 * ```js
 * // position
 * 'left-bottom' // menu appears below, aligned to the left
 * 'top-center'  // menu appears above, centered
 * ```
 * @property {boolean} [checkList=false] Flag to determine if the checklist is enabled (`true` or `false`)
 * @property {"rtl" | "ltr"} [dir="ltr"] Optional text direction: `"rtl"` for right-to-left, `"ltr"` for left-to-right
 * @property {number} [splitNum=0] Optional split number for horizontal positioning; defines how many items per row
 * @property {() => void} [openMethod] Optional method to call when the menu is opened
 * @property {() => void} [closeMethod] Optional method to call when the menu is closed
 * @property {string} [maxHeight] Optional max-height CSS value (e.g. `"200px"`). Enables scrolling when items exceed this height.
 * @property {string} [minWidth] Optional min-width CSS value (e.g. `"130px"`).
 * @property {*} [keydownTarget]  Optional override for the keyboard navigation target. By default `on()` listens
 * - on the iframe `contentWindow` (`_ww`) when the refer isn't an input — appropriate when the
 * - refer is inside the wysiwyg. Set this to `window` (parent) for menus whose refer lives in
 * - the parent doc (e.g. BlockHandle's dragBtn in `carrierWrapper`). Also avoids
 * - cross-origin/sandboxed iframe `addEventListener` errors.
 */
/**
 * @class
 * @description Creates a select menu
 */
declare class SelectMenu {
	/**
	 * @constructor
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {SelectMenuParams} params SelectMenu options
	 */
	constructor($: SunEditor.Deps, params: SelectMenuParams);
	form: HTMLElement;
	items: any[];
	/** @type {HTMLLIElement[]} */
	menus: HTMLLIElement[];
	menuLen: number;
	index: number;
	item: any;
	isOpen: boolean;
	checkList: boolean;
	position: string;
	subPosition: string;
	splitNum: number;
	horizontal: boolean;
	openMethod: () => void;
	closeMethod: () => void;
	maxHeight: string;
	minWidth: string;
	/**
	 * @description Creates the select menu items.
	 * @param {Array<*>} items - Selectable items.
	 * - Plain entry: any value (string/object); passed to the `selectMethod` callback when picked.
	 * - Submenu entry: `{ children: Array<*>, childMenus?: Array<string|HTMLElement> }` —
	 *   `children` are the child values delivered to `selectMethod` on selection; `childMenus`
	 *   is the optional display content for each child (HTML string or `HTMLElement`). When
	 *   omitted, `children` doubles as the display content.
	 * @param {Array<string>|SunEditor.NodeCollection} [menus] - Optional list of display elements
	 * (HTML strings or nodes) for the top-level rows. Defaults to `items`. For submenu entries
	 * this controls the parent row's content; child rows use `childMenus` (or `children`).
	 * @example
	 * // Submenu — "List" opens a hover submenu of UL/OL options
	 * selectMenu.create(
	 *   [{ children: ['ul', 'ol'], childMenus: ['<i>•</i> Bulleted', '<i>1.</i> Numbered'] }],
	 *   ['List']
	 * );
	 */
	create(items: Array<any>, menus?: Array<string> | SunEditor.NodeCollection): void;
	/**
	 * @description Initializes the select menu and attaches it to a reference element.
	 * @param {Node} referElement - The element that triggers the select menu.
	 * @param {(command: string) => void} selectMethod - The function to execute when an item is selected.
	 * @param {{class?: string, style?: string}} [attr={}] - Additional attributes for the select menu container.
	 * @example
	 * // Basic: attach menu to a button with a selection callback
	 * selectMenu.on(this.alignButton, this.onAlignSelect.bind(this));
	 *
	 * // With custom attributes for styling
	 * selectMenu.on(this.alignButton, this.onAlignSelect.bind(this), { class: 'se-figure-select-list' });
	 */
	on(
		referElement: Node,
		selectMethod: (command: string) => void,
		attr?: {
			class?: string;
			style?: string;
		},
	): void;
	/**
	 * @description Select menu open
	 * @param {?string} [position] `"[left|right]-[middle|top|bottom] | [top|bottom]-[center|left|right]"`
	 * Always specify in LTR orientation. In RTL environments, left/right are automatically swapped.
	 * @param {?string} [onItemQuerySelector] The querySelector string of the menu to be activated
	 * @example
	 * // Open with default position (uses constructor's position param)
	 * selectMenu.open();
	 *
	 * // Open at a specific position (always use LTR basis; RTL is auto-mirrored)
	 * selectMenu.open('bottom-left');
	 *
	 * // Open with an active item highlighted via querySelector
	 * selectMenu.open('', '[data-command="' + this.align + '"]');
	 */
	open(position?: string | null, onItemQuerySelector?: string | null): void;
	/**
	 * @description Re-runs positioning using the same direction the menu was opened with.
	 * Use when the reference element has moved (e.g. scroll repositioned the trigger) but
	 * the menu should stay open and follow.
	 */
	reposition(): void;
	/**
	 * @description Soft-hide / soft-show without changing open state.
	 * close listeners (outside click, ESC) keep working, but is visually hidden until the trigger comes back.
	 */
	setHidden(hidden: any): void;
	/**
	 * @description Select menu close
	 */
	close(): void;
	/**
	 * @description Get the index of the selected item
	 * @param {number} index Item index
	 * @returns
	 */
	getItem(index: number): any;
	/**
	 * @description Set the index of the selected item
	 * @param {number} index Item index
	 */
	setItem(index: number): void;
	_onItem: Element;
	#private;
}
