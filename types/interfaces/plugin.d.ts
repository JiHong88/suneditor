import type {} from '../typedef';
/**
 * @abstract
 * @interface
 * Base class for Browser plugins
 * Child classes MUST implement open(), close(), and onSelectFile() methods
 */
export class PluginBrowser extends Base {
	/**
	 * @abstract
	 * @description Executes the method that is called when a "Browser" module's is opened.
	 * @param {?(target: Node) => *} [onSelectfunction] - Method to be executed after selecting an item in the gallery
	 * @returns {void}
	 */
	open(onSelectfunction?: ((target: Node) => any) | null): void;
	/**
	 * @abstract
	 * @description Executes the method that is called when a "Browser" module's is closed.
	 * @returns {void}
	 */
	close(): void;
}
/**
 * @abstract
 * @interface
 * Base class for Command plugins
 * Child classes MUST implement the action() method
 */
export class PluginCommand extends Base {
	/**
	 * @abstract
	 * @description Executes the main execution method of the plugin.
	 * - It is executed by clicking a toolbar "command" button or calling an API.
	 * - MUST be overridden by child classes
	 * @param {HTMLElement} [target] - The plugin's toolbar button element
	 * @returns {void | Promise<void>}
	 */
	action(target?: HTMLElement): void | Promise<void>;
}
/**
 * @abstract
 * @interface
 * Base class for Dropdown plugins
 * Child classes MUST implement the action() method
 * Child classes MAY optionally implement on() and off() methods
 */
export class PluginDropdown extends Base {
	/**
	 * @optional
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} [target] - The dropdown target element
	 * @returns {void}
	 */
	on(target?: HTMLElement): void;
	/**
	 * @optional
	 * @description Executes the method that is called when a plugin's dropdown menu is closed.
	 * @returns {void}
	 */
	off(): void;
	/**
	 * @abstract
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * - MUST be overridden by child classes
	 * @param {HTMLElement} target - The clicked dropdown item element
	 * @returns {void | Promise<void>}
	 */
	action(target: HTMLElement): void | Promise<void>;
}
/**
 * @abstract
 * @interface
 * Base class for Dropdown-Free plugins
 * These plugins handle their own event logic without automatic action() calls
 * Typically used for complex UI components like ColorPicker or Table
 * Child classes MAY optionally implement on() and off() methods
 */
export class PluginDropdownFree extends Base {
	/**
	 * @optional
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} [target] - The dropdown target element
	 * @returns {void}
	 */
	on(target?: HTMLElement): void;
	/**
	 * @optional
	 * @description Executes the method that is called when a plugin's dropdown menu is closed.
	 * @returns {void}
	 */
	off(): void;
}
export class PluginField extends Base {}
export class PluginInput extends Base {
	/**
	 * @optional
	 * @description Executes the event function of toolbar's input tag - "keydown".
	 * @param {Object} params - Input event information
	 * @param {HTMLElement} params.target - The input element
	 * @param {KeyboardEvent} params.event - The keyboard event
	 * @param {string} params.value - The input value
	 * @returns {void}
	 */
	toolbarInputKeyDown(params: { target: HTMLElement; event: KeyboardEvent; value: string }): void;
	/**
	 * @optional
	 * @description Executes the event function of toolbar's input tag - "change".
	 * @param {Object} params - Input event information
	 * @param {HTMLElement} params.target - The input element
	 * @param {FocusEvent | MouseEvent} params.event - The change event
	 * @param {string} params.value - The input value
	 * @returns {void}
	 */
	toolbarInputChange(params: { target: HTMLElement; event: FocusEvent | MouseEvent; value: string }): void;
}
export class PluginModal extends Base {
	/**
	 * @abstract
	 * Opens the modal window (Plugin's public API called by toolbar/external code)
	 * @param {HTMLElement} [target] - The plugin's toolbar button element
	 * @returns {void}
	 */
	open(target?: HTMLElement): void;
}
export class PluginPopup extends Base {
	/**
	 * @abstract
	 * Called when a popup is shown
	 * @returns {void}
	 */
	show(): void;
}
/**
 * @abstract
 * Base class for all plugins - contains common properties
 */
declare class Base extends EditorInjector {
	/** @type {string} - Plugin type ("browser"|"command"|"dropdown"|"field"|"input"|"modal"|"popup") */
	static type: string;
	/** @type {string} - Unique plugin identifier */
	static key: string;
	/** @type {string} - CSS class name for the plugin button */
	static className: string;
	/**
	 * Plugin-specific options
	 * @type {{eventIndex?: number, isInputComponent?: boolean}}
	 * @property {number} [eventIndex=0] - Plugin event handler execution priority (higher = later)
	 * @property {boolean} [isInputComponent=false] - Allow keyboard input inside component (e.g., table cells), prevents auto-selection on arrow keys
	 */
	static options: {
		eventIndex?: number;
		isInputComponent?: boolean;
	};
	/** @type {string} */
	title: string;
	/** @type {string} */
	icon: string;
	/** @type {HTMLElement} */
	beforeItem: HTMLElement;
	/** @type {HTMLElement} */
	afterItem: HTMLElement;
	/** @type {HTMLElement} */
	replaceButton: HTMLElement;
}
import EditorInjector from '../editorInjector';
export {};
