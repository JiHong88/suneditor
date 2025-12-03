import type {} from '../../typedef';
export default Menu;
export type MenuThis = Omit<Menu & Partial<SunEditor.Injector>, 'menu'>;
/**
 * @typedef {Omit<Menu & Partial<SunEditor.Injector>, 'menu'>} MenuThis
 */
/**
 * @constructor
 * @this {MenuThis}
 * @description Dropdown and container menu management class
 * @param {SunEditor.Core} editor - The root editor instance
 */
declare function Menu(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, editor: SunEditor.Core): void;
declare class Menu {
	/**
	 * @typedef {Omit<Menu & Partial<SunEditor.Injector>, 'menu'>} MenuThis
	 */
	/**
	 * @constructor
	 * @this {MenuThis}
	 * @description Dropdown and container menu management class
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	/** @type {Object<string, HTMLElement>} */
	targetMap: {
		[x: string]: HTMLElement;
	};
	index: number;
	menus: any[];
	currentButton: HTMLButtonElement;
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
	_bindClose_dropdown_mouse: SunEditor.Event.GlobalInfo;
	_bindClose_dropdown_key: any;
	_bindClose_cons_mouse: SunEditor.Event.GlobalInfo;
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
			type,
		}: {
			key: string;
			type: string;
		},
		menu: Node,
	): void;
	/**
	 * @this {MenuThis}
	 * @description Opens the dropdown menu for the specified button.
	 * @param {Node} button Dropdown's button element to call
	 */
	dropdownOn(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, button: Node): void;
	/**
	 * @this {MenuThis}
	 * @description Closes the currently open dropdown menu.
	 */
	dropdownOff(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>): void;
	/**
	 * @this {MenuThis}
	 * @description Shows a previously hidden dropdown menu that is still in "on" state.
	 * - Only works when a dropdown is active (currentButton exists)
	 * - Re-displays the dropdown that was hidden by dropdownHide()
	 * - Recalculates menu position by calling dropdownOn() again
	 */
	dropdownShow(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>): void;
	/**
	 * @this {MenuThis}
	 * @description Temporarily hides the currently active dropdown menu without closing it.
	 * - Unlike dropdownOff(), this does not clear the dropdown state or event listeners
	 * - The dropdown remains "on" but visually hidden
	 * - Use dropdownShow() to make it visible again
	 */
	dropdownHide(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>): void;
	/**
	 * @this {MenuThis}
	 * @description Opens the menu container for the specified button.
	 * @param {Node} button Container's button element to call
	 */
	containerOn(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, button: Node): void;
	/**
	 * @this {MenuThis}
	 * @description Closes the currently open menu container.
	 */
	containerOff(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>): void;
	/**
	 * @internal
	 * @this {MenuThis}
	 * @description Set the menu position.
	 * @param {Node} element Button element
	 * @param {HTMLElement} menu Menu element
	 */
	_setMenuPosition(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, element: Node, menu: HTMLElement): void;
	/**
	 * @internal
	 * @this {MenuThis}
	 * @description Reset the menu position.
	 * @param {Node} element Button element
	 * @param {HTMLElement} menu Menu element
	 */
	_resetMenuPosition(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, element: Node, menu: HTMLElement): void;
	/**
	 * @internal
	 * @this {MenuThis}
	 * @description Restore the last menu position using previously stored button and menu elements.
	 */
	_restoreMenuPosition(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>): void;
	/**
	 * @internal
	 * @this {MenuThis}
	 * @description Check if the element is part of a more layer
	 * @param {Node} element The element to check
	 * @returns {HTMLElement|null} The more layer element or null
	 */
	_checkMoreLayer(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, element: Node): HTMLElement | null;
	/**
	 * @internal
	 * @this {MenuThis}
	 * @description Move the selected item in the dropdown menu
	 * @param {number} num Direction and amount to move (-1 for up, 1 for down)
	 */
	_moveItem(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>, num: number): void;
	/**
	 * @internal
	 * @this {MenuThis}
	 * @description Remove global event listeners
	 */
	__removeGlobalEvent(this: Omit<Menu & Partial<import('../../editorInjector').default>, 'menu'>): void;
}
