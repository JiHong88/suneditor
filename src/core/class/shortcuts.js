/**
 * @fileoverview Shortcuts class
 */

/**
 * @typedef {object} ShortcutInfo
 * @property {boolean} c - Whether the [Ctrl, Command] key is pressed.
 * @property {boolean} s - Whether the [Shift] key is pressed.
 * @property {boolean} space - Whether the [Space] key is pressed.
 * @property {boolean} enter - Whether the Enter key is pressed.
 * @property {string} command - The command key. (e.g. "bold")
 * @property {boolean} edge - Whether the cursor is at the end of the line.
 * @property {?string} key - The key pressed (e.g., "1.").
 * @property {?string} method - A plugin's "shortcut" method that is called instead of the default "editor.run" method.
 * @property {?string} plugin - The plugin name.
 * @property {?string} r - An array of key codes generated with the reverseButtons option, used to reverse the action for a specific key combination.
 * @property {?string} textTrigger - Whether the event was triggered by a text input (e.g., mention like @ab).
 * @property {?string} type - Plugin's type. ("command", "dropdown", "modal", "browser", "input", "field", "popup").
 */

/**
 * @class
 * @description Shortcuts class
 * @param {object} editor - editor core object
 */
function Shortcuts(editor) {
	this.editor = editor;
	this.isDisabled = false;
}

Shortcuts.prototype = {
	/**
	 * @description If there is a shortcut function, run it.
	 * @returns {boolean} Whether to execute shortcuts
	 *
	 */
	command(event, ctrl, shift, keyCode, text, edge, line, range) {
		if (this.isDisabled) return false;

		/**
		 * @type {ShortcutInfo}
		 */
		let info = null;

		if (ctrl) {
			info = this.editor.shortcutsKeyMap.get(keyCode + (shift ? 1000 : 0));
		} else {
			info = this.editor.shortcutsKeyMap.get(text) || this.editor.shortcutsKeyMap.get(text + event.key);
		}

		if (!info || (!shift && info.s) || (info.space && keyCode !== 32) || (info.enter && keyCode !== 13) || (info.textTrigger && !event.key.trim()) || (info.edge && !edge)) return false;

		if (info.plugin) {
			this.editor.plugins[info.plugin][info.method]?.({ range, line, info, event, keyCode });
		} else if (info.method) {
			info.method({ range, line, info, event, keyCode, editor: this.editor });
		} else {
			this.editor.run(info.command, info.type, info.button);
		}

		return true;
	},

	disable() {
		this.isDisabled = true;
	},

	enable() {
		this.isDisabled = false;
	},

	constructor: Shortcuts
};

export default Shortcuts;
