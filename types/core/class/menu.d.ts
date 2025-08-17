export default Menu;
export type MenuThis = Omit<Menu & Partial<__se__EditorInjector>, 'menu'>;
/**
 * @typedef {Omit<Menu & Partial<__se__EditorInjector>, 'menu'>} MenuThis
 */
/**
 * @constructor
 * @this {MenuThis}
 * @description Dropdown and container menu management class
 * @param {__se__EditorCore} editor - The root editor instance
 */
declare function Menu(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, editor: __se__EditorCore): void;
declare class Menu {
	/**
	 * @typedef {Omit<Menu & Partial<__se__EditorInjector>, 'menu'>} MenuThis
	 */
	/**
	 * @constructor
	 * @this {MenuThis}
	 * @description Dropdown and container menu management class
	 * @param {__se__EditorCore} editor - The root editor instance
	 */
	constructor(editor: __se__EditorCore);
	/** @type {Object<string, HTMLElement>} */
	targetMap: {
		[x: string]: HTMLElement;
	};
	index: number;
	menus: any[];
	currentDropdown: HTMLElement;
	currentDropdownActiveButton: HTMLButtonElement;
	currentDropdownName: string;
	currentDropdownType: string;
	currentContainer: HTMLElement;
	currentContainerActiveButton: HTMLButtonElement;
	currentContainerName: string;
	_dropdownCommands: any[];
	__globalEventHandler: {
		mousedown: any;
		containerDown: any;
		keydown: any;
		mousemove: any;
		mouseout: any;
	};
	_bindClose_dropdown_mouse: __se__GlobalEventInfo;
	_bindClose_dropdown_key: any;
	_bindClose_cons_mouse: __se__GlobalEventInfo;
	currentDropdownPlugin: any;
	__menuBtn: Node;
	__menuContainer: HTMLElement;
	/**
	 * @this {MenuThis}
	 * @description Method for managing dropdown element.
	 * - You must add the "dropdown" element using the this method at custom plugin.
	 * @param {{key: string, type: string}} classObj Class object
	 * @param {Node} menu Dropdown element
	 */
	initDropdownTarget(
		this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>,
		{
			key,
			type
		}: {
			key: string;
			type: string;
		},
		menu: Node
	): void;
	/**
	 * @this {MenuThis}
	 * @description On dropdown
	 * @param {Node} button Dropdown's button element to call
	 */
	dropdownOn(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, button: Node): void;
	/**
	 * @this {MenuThis}
	 * @description Off dropdown
	 */
	dropdownOff(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>): void;
	/**
	 * @this {MenuThis}
	 * @description On menu container
	 * @param {Node} button Container's button element to call
	 */
	containerOn(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, button: Node): void;
	/**
	 * @this {MenuThis}
	 * @description Off menu container
	 */
	containerOff(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>): void;
	/**
	 * @private
	 * @this {MenuThis}
	 * @description Set the menu position.
	 * @param {Node} element Button element
	 * @param {HTMLElement} menu Menu element
	 */
	_setMenuPosition(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, element: Node, menu: HTMLElement): void;
	/**
	 * @private
	 * @this {MenuThis}
	 * @description Reset the menu position.
	 * @param {Node} element Button element
	 * @param {HTMLElement} menu Menu element
	 */
	_resetMenuPosition(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, element: Node, menu: HTMLElement): void;
	/**
	 * @private
	 * @this {MenuThis}
	 * @description Restore the last menu position using previously stored button and menu elements.
	 */
	_restoreMenuPosition(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>): void;
	/**
	 * @private
	 * @this {MenuThis}
	 * @description Check if the element is part of a more layer
	 * @param {Node} element The element to check
	 * @returns {HTMLElement|null} The more layer element or null
	 */
	_checkMoreLayer(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, element: Node): HTMLElement | null;
	/**
	 * @private
	 * @this {MenuThis}
	 * @description Move the selected item in the dropdown menu
	 * @param {number} num Direction and amount to move (-1 for up, 1 for down)
	 */
	_moveItem(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, num: number): void;
	/**
	 * @private
	 * @this {MenuThis}
	 * @description Remove global event listeners
	 */
	__removeGlobalEvent(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>): void;
}
