import type {} from '../../typedef';
export default SelectMenu;
export type SelectMenuParams = {
	/**
	 * Position of the select menu, specified as `"[left|right]-[middle|top|bottom]"` or `"[top|bottom]-[center|left|right]"`
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
};
/**
 * @typedef {Object} SelectMenuParams
 * @property {string} position Position of the select menu, specified as `"[left|right]-[middle|top|bottom]"` or `"[top|bottom]-[center|left|right]"`
 * @property {boolean} [checkList=false] Flag to determine if the checklist is enabled (`true` or `false`)
 * @property {"rtl" | "ltr"} [dir="ltr"] Optional text direction: `"rtl"` for right-to-left, `"ltr"` for left-to-right
 * @property {number} [splitNum=0] Optional split number for horizontal positioning; defines how many items per row
 * @property {() => void} [openMethod] Optional method to call when the menu is opened
 * @property {() => void} [closeMethod] Optional method to call when the menu is closed
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
	/**
	 * @description Creates the select menu items.
	 * @param {Array<string>|SunEditor.NodeCollection} items - Command list of selectable items.
	 * @param {Array<string>|SunEditor.NodeCollection} [menus] - Optional list of menu display elements; defaults to `items`.
	 */
	create(items: Array<string> | SunEditor.NodeCollection, menus?: Array<string> | SunEditor.NodeCollection): void;
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
