import type {} from '../../../typedef';
export default Menu;
export type DropdownItem = {
	/**
	 * - `data-command` attribute value
	 */
	command: string;
	/**
	 * - `data-value` attribute value
	 */
	value?: string;
	/**
	 * - Title text (used for `title` and `aria-label`)
	 */
	title: string;
	/**
	 * - Button inner HTML content
	 */
	innerHTML: string;
	/**
	 * - Additional CSS class for the `<button>`
	 */
	className?: string;
	/**
	 * - Extra data attributes (e.g. `{ 'data-class': 'xxx' }`)
	 */
	attrs?: {
		[x: string]: string;
	};
	/**
	 * - Rendered button element (set by `initDropdownTarget`)
	 */
	_element?: HTMLElement;
};
/**
 * @typedef {Object} DropdownItem
 * @property {string} command - `data-command` attribute value
 * @property {string} [value] - `data-value` attribute value
 * @property {string} title - Title text (used for `title` and `aria-label`)
 * @property {string} innerHTML - Button inner HTML content
 * @property {string} [className] - Additional CSS class for the `<button>`
 * @property {Object<string, string>} [attrs] - Extra data attributes (e.g. `{ 'data-class': 'xxx' }`)
 * @property {HTMLElement} [_element] - Rendered button element (set by `initDropdownTarget`)
 */
/**
 * @description Creates a dropdown menu element from standardized item objects.
 * @param {Array<DropdownItem>} items - Menu items
 * @param {Object} [options]
 * @param {string} [options.className] - Additional class for the wrapper `<div>`
 * @param {string} [options.prependHTML] - HTML to prepend inside the `<ul>` (e.g. default value items)
 * @returns {HTMLElement}
 */
export function CreateDropdownMenu(
	items: Array<DropdownItem>,
	options?: {
		className?: string;
		prependHTML?: string;
	},
): HTMLElement;
/**
 * @description Dropdown and container menu management class
 */
declare class Menu {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/** @type {Object<string, HTMLElement>} */
	targetMap: {
		[x: string]: HTMLElement;
	};
	/** @type {Object<string, Array<DropdownItem>>} Structured items keyed by plugin name */
	itemsMap: {
		[x: string]: DropdownItem[];
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
	 * - You must add the `dropdown` element using this method at custom plugin.
	 * @param {{key: string, type: string}} classObj Class object
	 * @param {Node|Array<DropdownItem>} menuOrItems Dropdown element or array of standardized items
	 * @param {Object} [options] Options when passing items array
	 * @param {string} [options.className] Additional CSS class for the wrapper element
	 * @param {string} [options.prependHTML] HTML to prepend inside the `<ul>` (e.g. default/sub-list items)
	 * @returns {HTMLElement} The registered menu element
	 */
	initDropdownTarget(
		{
			key,
			type,
		}: {
			key: string;
			type: string;
		},
		menuOrItems: Node | Array<DropdownItem>,
		options?: {
			className?: string;
			prependHTML?: string;
		},
	): HTMLElement;
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
	 * @description Shows a previously hidden dropdown menu that is still in `on` state.
	 * - Only works when a dropdown is active (`currentButton` exists)
	 * - Re-displays the dropdown that was hidden by `dropdownHide()`
	 * - Recalculates menu position by calling `dropdownOn()` again
	 */
	dropdownShow(): void;
	/**
	 * @description Temporarily hides the currently active dropdown menu without closing it.
	 * - Unlike `dropdownOff()`, this does not clear the dropdown state or event listeners
	 * - The dropdown remains `on` but visually hidden
	 * - Use `dropdownShow()` to make it visible again
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
