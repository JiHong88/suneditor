import type {} from '../../typedef';
export default Menu;
export type MenuThis = Omit<Menu & Partial<SunEditor.Injector_Core>, 'menu'>;
/**
 * @typedef {Omit<Menu & Partial<SunEditor.Injector_Core>, 'menu'>} MenuThis
 */
/**
 * @description Dropdown and container menu management class
 */
declare class Menu extends CoreInjector {
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
	currentDropdownPlugin: any;
	/**
	 * @description Method for managing dropdown element.
	 * - You must add the "dropdown" element using the this method at custom plugin.
	 * @param {{key: string, type: string}} classObj Class object
	 * @param {Node} menu Dropdown element
	 */
	initDropdownTarget(
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
	 * @description Opens the dropdown menu for the specified button.
	 * @param {Node} button Dropdown's button element to call
	 */
	dropdownOn(button: Node): void;
	/**
	 * @description Closes the currently open dropdown menu.
	 */
	dropdownOff(): void;
	/**
	 * @description Shows a previously hidden dropdown menu that is still in "on" state.
	 * - Only works when a dropdown is active (currentButton exists)
	 * - Re-displays the dropdown that was hidden by dropdownHide()
	 * - Recalculates menu position by calling dropdownOn() again
	 */
	dropdownShow(): void;
	/**
	 * @description Temporarily hides the currently active dropdown menu without closing it.
	 * - Unlike dropdownOff(), this does not clear the dropdown state or event listeners
	 * - The dropdown remains "on" but visually hidden
	 * - Use dropdownShow() to make it visible again
	 */
	dropdownHide(): void;
	/**
	 * @description Opens the menu container for the specified button.
	 * @param {Node} button Container's button element to call
	 */
	containerOn(button: Node): void;
	/**
	 * @description Closes the currently open menu container.
	 */
	containerOff(): void;
	/**
	 * @internal
	 * @description Reset the menu position.
	 * @param {Node} element Button element
	 * @param {HTMLElement} menu Menu element
	 */
	__resetMenuPosition(element: Node, menu: HTMLElement): void;
	/**
	 * @internal
	 * @description Restore the last menu position using previously stored button and menu elements.
	 */
	__restoreMenuPosition(): void;
	/**
	 * @internal
	 * @description Destroy the Menu instance and release memory
	 */
	_destroy(): void;
	#private;
}
import CoreInjector from '../../editorInjector/_core';
