/**
 * @fileoverview Plugin interface definitions for SunEditor.
 * These types define required methods for different plugin types.
 */

import KernelInjector from '../core/kernel/kernelInjector';

/**
 * @abstract
 * Base class for all plugins - contains common properties
 */
class Base extends KernelInjector {
	/** @type {string} - Plugin type ("browser"|"command"|"dropdown"|"field"|"input"|"modal"|"popup") */
	static type = '';

	/** @type {string} - Unique plugin identifier */
	static key = '';
	/** @type {string} - CSS class name for the plugin button */
	static className = '';

	/**
	 * Plugin-specific options
	 * @type {{eventIndex?: number, isInputComponent?: boolean}}
	 * @property {number} [eventIndex=0] - Plugin event handler execution priority (higher = later)
	 * @property {boolean} [isInputComponent=false] - Allow keyboard input inside component (e.g., table cells), prevents auto-selection on arrow keys
	 */
	static options = {};

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 */
	constructor(editor) {
		super(editor);

		// plugin basic properties
		/** @type {string} */
		this.title = '';
		/** @type {string} */
		this.icon = '';

		/** @type {HTMLElement} */
		this.beforeItem = null;
		/** @type {HTMLElement} */
		this.afterItem = null;
		/** @type {HTMLElement} */
		this.replaceButton = null;
	}
}

// =====================================================================================================================================================

/**
 * @abstract
 * @interface
 * Base class for Browser plugins
 * Child classes MUST implement open(), close(), and onSelectFile() methods
 */
export class PluginBrowser extends Base {
	static type = 'browser';

	/**
	 * @abstract
	 * @description Executes the method that is called when a "Browser" module's is opened.
	 * @param {?(target: Node) => *} [onSelectfunction] - Method to be executed after selecting an item in the gallery
	 * @returns {void}
	 */
	open(onSelectfunction) {
		throw new Error(`[${this.constructor.name}] Abstract method 'open()' must be implemented`);
	}

	/**
	 * @abstract
	 * @description Executes the method that is called when a "Browser" module's is closed.
	 * @returns {void}
	 */
	close() {
		throw new Error(`[${this.constructor.name}] Abstract method 'close()' must be implemented`);
	}
}

/**
 * @abstract
 * @interface
 * Base class for Command plugins
 * Child classes MUST implement the action() method
 */
export class PluginCommand extends Base {
	static type = 'command';

	/**
	 * @abstract
	 * @description Executes the main execution method of the plugin.
	 * - It is executed by clicking a toolbar "command" button or calling an API.
	 * - MUST be overridden by child classes
	 * @param {HTMLElement} [target] - The plugin's toolbar button element
	 * @returns {void | Promise<void>}
	 */
	action(target) {
		throw new Error(`[${this.constructor.name}] Abstract method 'action()' must be implemented`);
	}
}

/**
 * @abstract
 * @interface
 * Base class for Dropdown plugins
 * Child classes MUST implement the action() method
 * Child classes MAY optionally implement on() and off() methods
 */
export class PluginDropdown extends Base {
	static type = 'dropdown';

	/**
	 * @optional
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} [target] - The dropdown target element
	 * @returns {void}
	 */
	on(target) {}

	/**
	 * @abstract
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * - MUST be overridden by child classes
	 * @param {HTMLElement} target - The clicked dropdown item element
	 * @returns {void | Promise<void>}
	 */
	action(target) {
		throw new Error(`[${this.constructor.name}] Abstract method 'action()' must be implemented`);
	}
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
	static type = 'dropdown-free';

	/**
	 * @optional
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} [target] - The dropdown target element
	 * @returns {void}
	 */
	on(target) {
		void target;
	}

	/**
	 * @optional
	 * @description Executes the method that is called when a plugin's dropdown menu is closed.
	 * @returns {void}
	 */
	off() {}
}

/**
 * @abstract
 * @interface
 * Base class for Field plugins
 * These plugins typically respond to input events in the wysiwyg area
 *
 * **Commonly used hooks:**
 * - `onInput()` - Responds to input events in the editor (See: mention plugin)
 * - Other event hooks can be used as needed (onKeydown, onClick, etc.)
 *
 * Child classes MAY optionally implement event hook methods
 * @see {Mention} - Example implementation using onInput hook
 */
export class PluginField extends Base {
	static type = 'field';

	/**
	 * @optional
	 * @description Executes when user inputs text in the editor.
	 * - Commonly used in field plugins to detect trigger characters or patterns
	 * @type {SunEditor.Hook.Event.OnInput}
	 * @type {SunEditor.Hook.Event.OnInputAsync}
	 */
	// onInput() {}
}

export class PluginInput extends Base {
	static type = 'input';

	/**
	 * @optional
	 * @description Executes the event function of toolbar's input tag - "keydown".
	 * @param {SunEditor.HookParams.ToolbarInputKeyDown} params - Input event information
	 * @returns {void}
	 */
	toolbarInputKeyDown(params) {
		void params;
	}

	/**
	 * @optional
	 * @description Executes the event function of toolbar's input tag - "change".
	 * @param {SunEditor.HookParams.ToolbarInputChange} params - Input event information
	 * @returns {void}
	 */
	toolbarInputChange(params) {
		void params;
	}
}

export class PluginModal extends Base {
	static type = 'modal';

	/**
	 * @abstract
	 * Opens the modal window (Plugin's public API called by toolbar/external code)
	 * @param {HTMLElement} [target] - The plugin's toolbar button element
	 * @returns {void}
	 */
	open(target) {
		throw new Error(`[${this.constructor.name}] Abstract method 'open()' must be implemented`);
	}
}

export class PluginPopup extends Base {
	static type = 'popup';

	/**
	 * @abstract
	 * Called when a popup is shown
	 * @returns {void}
	 */
	show() {
		throw new Error(`[${this.constructor.name}] Abstract method 'show()' must be implemented`);
	}
}
