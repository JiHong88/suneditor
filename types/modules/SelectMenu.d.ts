export default SelectMenu;
export type SelectMenuThis = SelectMenu & Partial<CoreInjector>;
export type SelectMenuParams = {
	/**
	 * Position of the select menu, specified as "[left|right]-[middle|top|bottom]" or "[top|bottom]-[center|left|right]"
	 */
	position: string;
	/**
	 * Flag to determine if the checklist is enabled (true or false)
	 */
	checkList?: boolean;
	/**
	 * Optional text direction: "rtl" for right-to-left, "ltr" for left-to-right
	 */
	dir?: 'rtl' | 'ltr';
	/**
	 * Optional split number for horizontal positioning; defines how many items per row
	 */
	splitNum?: number;
	/**
	 * Optional method to call when the menu is opened
	 */
	openMethod?: (() => void) | undefined;
	/**
	 * Optional method to call when the menu is closed
	 */
	closeMethod?: (() => void) | undefined;
};
/**
 * @typedef {SelectMenu & Partial<CoreInjector>} SelectMenuThis
 */
/**
 * @typedef {Object} SelectMenuParams
 * @property {string} position Position of the select menu, specified as "[left|right]-[middle|top|bottom]" or "[top|bottom]-[center|left|right]"
 * @property {boolean} [checkList=false] Flag to determine if the checklist is enabled (true or false)
 * @property {"rtl" | "ltr"} [dir="ltr"] Optional text direction: "rtl" for right-to-left, "ltr" for left-to-right
 * @property {number} [splitNum=0] Optional split number for horizontal positioning; defines how many items per row
 * @property {() => void=} openMethod Optional method to call when the menu is opened
 * @property {() => void=} closeMethod Optional method to call when the menu is closed
 */
/**
 * @constructor
 * @this {SelectMenuThis}
 * @param {*} inst The instance object that called the constructor.
 * @param {SelectMenuParams} params Select menu options
 */
declare function SelectMenu(this: SelectMenuThis, inst: any, params: SelectMenuParams): void;
declare class SelectMenu {
	/**
	 * @typedef {SelectMenu & Partial<CoreInjector>} SelectMenuThis
	 */
	/**
	 * @typedef {Object} SelectMenuParams
	 * @property {string} position Position of the select menu, specified as "[left|right]-[middle|top|bottom]" or "[top|bottom]-[center|left|right]"
	 * @property {boolean} [checkList=false] Flag to determine if the checklist is enabled (true or false)
	 * @property {"rtl" | "ltr"} [dir="ltr"] Optional text direction: "rtl" for right-to-left, "ltr" for left-to-right
	 * @property {number} [splitNum=0] Optional split number for horizontal positioning; defines how many items per row
	 * @property {() => void=} openMethod Optional method to call when the menu is opened
	 * @property {() => void=} closeMethod Optional method to call when the menu is closed
	 */
	/**
	 * @constructor
	 * @this {SelectMenuThis}
	 * @param {*} inst The instance object that called the constructor.
	 * @param {SelectMenuParams} params Select menu options
	 */
	constructor(inst: any, params: SelectMenuParams);
	kink: any;
	inst: any;
	form: any;
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
	_dirPosition: string;
	_dirSubPosition: string;
	_textDirDiff: boolean;
	splitNum: number;
	horizontal: boolean;
	openMethod: () => void;
	closeMethod: () => void;
	_refer: HTMLElement;
	_keydownTarget: Window | HTMLInputElement;
	_selectMethod: (command: string) => void;
	_bindClose_key: any;
	_bindClose_mousedown: any;
	_bindClose_click: any;
	_closeSignal: boolean;
	__events: {
		mousedown: any;
		mousemove: any;
		click: any;
		keydown: any;
	};
	__eventHandlers: {
		mousedown: any;
		mousemove: any;
		click: any;
		keydown: any;
	};
	__globalEventHandlers: {
		keydown: any;
		mousedown: any;
		click: any;
	};
	/**
	 * @this {SelectMenuThis}
	 * @description Creates the select menu items.
	 * @param {Array<string>|__se__NodeCollection} items - Command list of selectable items.
	 * @param {Array<string>|__se__NodeCollection} [menus] - Optional list of menu display elements; defaults to `items`.
	 */
	create(this: SelectMenuThis, items: Array<string> | __se__NodeCollection, menus?: Array<string> | __se__NodeCollection): void;
	/**
	 * @this {SelectMenuThis}
	 * @description Initializes the select menu and attaches it to a reference element.
	 * @param {Node} referElement - The element that triggers the select menu.
	 * @param {(command: string) => void} selectMethod - The function to execute when an item is selected.
	 * @param {{class?: string, style?: string}} [attr={}] - Additional attributes for the select menu container.
	 */
	on(
		this: SelectMenuThis,
		referElement: Node,
		selectMethod: (command: string) => void,
		attr?: {
			class?: string;
			style?: string;
		}
	): void;
	/**
	 * @this {SelectMenuThis}
	 * @description Select menu open
	 * @param {?string=} position "[left|right]-[middle|top|bottom] | [top|bottom]-[center|left|right]"
	 * @param {?string=} onItemQuerySelector The querySelector string of the menu to be activated
	 */
	open(this: SelectMenuThis, position?: (string | null) | undefined, onItemQuerySelector?: (string | null) | undefined): void;
	/**
	 * @this {SelectMenuThis}
	 * @description Select menu close
	 */
	close(this: SelectMenuThis): void;
	/**
	 * @this {SelectMenuThis}
	 * @description Get the index of the selected item
	 * @param {number} index Item index
	 * @returns
	 */
	getItem(this: SelectMenuThis, index: number): any;
	/**
	 * @this {SelectMenuThis}
	 * @description Set the index of the selected item
	 * @param {number} index Item index
	 */
	setItem(this: SelectMenuThis, index: number): void;
	/**
	 * @private
	 * @this {SelectMenuThis}
	 * @description Appends a formatted list of items to the menu.
	 * @param {string} html - The HTML string representing the menu items.
	 */
	_createFormat(this: SelectMenuThis, html: string): void;
	/**
	 * @private
	 * @this {SelectMenuThis}
	 * @description Resets the menu state and removes event listeners.
	 */
	_init(this: SelectMenuThis): void;
	_onItem: Element;
	/**
	 * @private
	 * @this {SelectMenuThis}
	 * @description Moves the selection up or down by a specified number of items.
	 * @param {number} num - The number of items to move (negative for up, positive for down).
	 */
	_moveItem(this: SelectMenuThis, num: number): void;
	/**
	 * @private
	 * @this {SelectMenuThis}
	 * @description Highlights and selects an item by index.
	 * @param {number} selectIndex - The index of the item to select.
	 */
	_selectItem(this: SelectMenuThis, selectIndex: number): void;
	/**
	 * @private
	 * @this {SelectMenuThis}
	 * @description Sets the position of the select menu relative to the reference element.
	 * @param {string} position Menu position ("left"|"right") | ("top"|"bottom")
	 * @param {string} subPosition Sub position ("middle"|"top"|"bottom") | ("center"|"left"|"right")
	 * @param {string} [onItemQuerySelector] - A query selector string to highlight a specific item.
	 * @param {boolean} [_re=false] - Whether this is a retry after adjusting the position.
	 */
	_setPosition(this: SelectMenuThis, position: string, subPosition: string, onItemQuerySelector?: string, _re?: boolean): void;
	/**
	 * @private
	 * @this {SelectMenuThis}
	 * @description Selects an item and triggers the callback function.
	 * @param {number} index - The index of the item to select.
	 */
	_select(this: SelectMenuThis, index: number): void;
	/**
	 * @private
	 * @this {SelectMenuThis}
	 * @description Adds event listeners for menu interactions.
	 */
	__addEvents(this: SelectMenuThis): void;
	/**
	 * @private
	 * @this {SelectMenuThis}
	 * @description Removes event listeners for menu interactions.
	 */
	__removeEvents(this: SelectMenuThis): void;
	/**
	 * @private
	 * @this {SelectMenuThis}
	 * @description Adds global event listeners for closing the menu.
	 */
	__addGlobalEvent(this: SelectMenuThis): void;
	/**
	 * @private
	 * @this {SelectMenuThis}
	 * @description Removes global event listeners for closing the menu.
	 */
	__removeGlobalEvent(this: SelectMenuThis): void;
}
import CoreInjector from '../editorInjector/_core';
