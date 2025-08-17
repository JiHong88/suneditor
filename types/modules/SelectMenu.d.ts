export default SelectMenu;
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
 * @typedef {Object} SelectMenuParams
 * @property {string} position Position of the select menu, specified as "[left|right]-[middle|top|bottom]" or "[top|bottom]-[center|left|right]"
 * @property {boolean} [checkList=false] Flag to determine if the checklist is enabled (true or false)
 * @property {"rtl" | "ltr"} [dir="ltr"] Optional text direction: "rtl" for right-to-left, "ltr" for left-to-right
 * @property {number} [splitNum=0] Optional split number for horizontal positioning; defines how many items per row
 * @property {() => void=} openMethod Optional method to call when the menu is opened
 * @property {() => void=} closeMethod Optional method to call when the menu is closed
 */
/**
 * @class
 * @description Creates a select menu
 */
declare class SelectMenu extends CoreInjector {
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {SelectMenuParams} params Select menu options
	 */
	constructor(inst: any, params: SelectMenuParams);
	kink: any;
	inst: any;
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
	_dirPosition: string;
	_dirSubPosition: string;
	_textDirDiff: boolean;
	splitNum: number;
	horizontal: boolean;
	openMethod: () => void;
	closeMethod: () => void;
	_refer: HTMLElement;
	_keydownTarget: any;
	_selectMethod: (command: string) => void;
	_bindClose_key: __se__GlobalEventInfo;
	_bindClose_mousedown: __se__GlobalEventInfo;
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
	 * @description Creates the select menu items.
	 * @param {Array<string>|__se__NodeCollection} items - Command list of selectable items.
	 * @param {Array<string>|__se__NodeCollection} [menus] - Optional list of menu display elements; defaults to `items`.
	 */
	create(items: Array<string> | __se__NodeCollection, menus?: Array<string> | __se__NodeCollection): void;
	/**
	 * @description Initializes the select menu and attaches it to a reference element.
	 * @param {Node} referElement - The element that triggers the select menu.
	 * @param {(command: string) => void} selectMethod - The function to execute when an item is selected.
	 * @param {{class?: string, style?: string}} [attr={}] - Additional attributes for the select menu container.
	 */
	on(
		referElement: Node,
		selectMethod: (command: string) => void,
		attr?: {
			class?: string;
			style?: string;
		}
	): void;
	/**
	 * @description Select menu open
	 * @param {?string=} position "[left|right]-[middle|top|bottom] | [top|bottom]-[center|left|right]"
	 * @param {?string=} onItemQuerySelector The querySelector string of the menu to be activated
	 */
	open(position?: (string | null) | undefined, onItemQuerySelector?: (string | null) | undefined): void;
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
	/**
	 * @private
	 * @description Appends a formatted list of items to the menu.
	 * @param {string} html - The HTML string representing the menu items.
	 */
	private _createFormat;
	/**
	 * @private
	 * @description Resets the menu state and removes event listeners.
	 */
	private _init;
	_onItem: Element;
	/**
	 * @private
	 * @description Moves the selection up or down by a specified number of items.
	 * @param {number} num - The number of items to move (negative for up, positive for down).
	 */
	private _moveItem;
	/**
	 * @private
	 * @description Highlights and selects an item by index.
	 * @param {number} selectIndex - The index of the item to select.
	 */
	private _selectItem;
	/**
	 * @private
	 * @description Sets the position of the select menu relative to the reference element.
	 * @param {string} position Menu position ("left"|"right") | ("top"|"bottom")
	 * @param {string} subPosition Sub position ("middle"|"top"|"bottom") | ("center"|"left"|"right")
	 * @param {string} [onItemQuerySelector] - A query selector string to highlight a specific item.
	 * @param {boolean} [_re=false] - Whether this is a retry after adjusting the position.
	 */
	private _setPosition;
	/**
	 * @private
	 * @description Selects an item and triggers the callback function.
	 * @param {number} index - The index of the item to select.
	 */
	private _select;
	/**
	 * @private
	 * @description Adds event listeners for menu interactions.
	 */
	private __addEvents;
	/**
	 * @private
	 * @description Removes event listeners for menu interactions.
	 */
	private __removeEvents;
	/**
	 * @private
	 * @description Adds global event listeners for closing the menu.
	 */
	private __addGlobalEvent;
	/**
	 * @private
	 * @description Removes global event listeners for closing the menu.
	 */
	private __removeGlobalEvent;
	#private;
}
import CoreInjector from '../editorInjector/_core';
