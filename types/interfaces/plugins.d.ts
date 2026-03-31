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
	 * @description Executes the method that is called when a `Browser` module is opened.
	 * @param {?(target: Node) => *} [onSelectfunction] - Method to be executed after selecting an item in the gallery
	 * @returns {void}
	 */
	open(onSelectfunction?: ((target: Node) => any) | null): void;
	/**
	 * @abstract
	 * @description Executes the method that is called when a `Browser` module is closed.
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
	 * - It is executed by clicking a toolbar `command` button or calling an API.
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
	on?(target?: HTMLElement): void;
	/**
	 * @abstract
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the `dropdown` menu is clicked.
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
	on?(target?: HTMLElement): void;
	/**
	 * @optional
	 * @description Executes the method that is called when a plugin's dropdown menu is closed.
	 * @returns {void}
	 */
	off?(): void;
}
/**
 * @abstract
 * @interface
 * Base class for Field plugins
 * These plugins typically respond to input events in the wysiwyg area
 *
 * **Commonly used hooks:**
 * - `onInput()` - Responds to input events in the editor (See: `mention` plugin)
 * - Other event hooks can be used as needed (`onKeydown`, `onClick`, etc.)
 *
 * Child classes MAY optionally implement event hook methods
 * @see {Mention} - Example implementation using onInput hook
 */
export class PluginField extends Base {}
export class PluginInput extends Base {
	/**
	 * @optional
	 * @description Executes the event function of toolbar's input tag - `keydown`.
	 * @param {SunEditor.HookParams.ToolbarInputKeyDown} params - Input event information
	 * @returns {void}
	 */
	toolbarInputKeyDown?(params: SunEditor.HookParams.ToolbarInputKeyDown): void;
	/**
	 * @optional
	 * @description Executes the event function of toolbar's input tag - `change`.
	 * @param {SunEditor.HookParams.ToolbarInputChange} params - Input event information
	 * @returns {void}
	 */
	toolbarInputChange?(params: SunEditor.HookParams.ToolbarInputChange): void;
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
declare class Base extends KernelInjector {
	/** @type {string} - Plugin type (`browser`|`command`|`dropdown`|`field`|`input`|`modal`|`popup`) */
	static type: string;
	/** @type {string} - Unique plugin identifier */
	static key: string;
	/** @type {string} - CSS class name for the plugin button */
	static className: string;
	/**
	 * Plugin-specific options
	 * @type {{eventIndex?: number, isInputComponent?: boolean}}
	 * @property {number} [eventIndex=0] - Plugin event handler execution priority (higher = later)
	 * @property {boolean} [isInputComponent=false] - Allow keyboard input inside component (e.g., table cells).
	 * - Prevents auto-selection on arrow keys.
	 */
	static options: {
		eventIndex?: number;
		isInputComponent?: boolean;
	};
	/** @type {string}Toolbar button tooltip text (e.g., `this.$.lang.font`) */
	title: string;
	/** @type {string} - Toolbar button icon HTML string (e.g., `this.$.icons.bold`) */
	icon: string;
	/** @type {string|HTMLElement|boolean|null} - Inner content of the toolbar button. HTML string for dropdown text labels, HTMLElement for input fields, or `false` to hide. */
	inner: string | HTMLElement | boolean | null;
	/** @type {HTMLElement} - Element inserted before the main toolbar button (e.g., decrease button in fontSize) */
	beforeItem: HTMLElement;
	/** @type {HTMLElement} - Element inserted after the main toolbar button (e.g., dropdown arrow, increase button) */
	afterItem: HTMLElement;
	/** @type {HTMLElement} - Replaces the entire default toolbar button with a custom element */
	replaceButton: HTMLElement;
}
import KernelInjector from '../core/kernel/kernelInjector';
export {};
