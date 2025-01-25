/**
 * @fileoverview Shortcuts class
 */

/**
 * @constructor
 * @description Shortcuts class
 * @param {Object} editor - editor core object
 */
const Shortcuts = function (editor) {
	this.editor = editor;
	this.isDisabled = false;
};

Shortcuts.prototype = {
	/**
	 * @description If there is a shortcut function, run it.
	 * @returns {boolean} Whether to execute shortcuts
	 */
	command(event, ctrl, shift, keyCode, text, edge, line, range) {
		if (this.isDisabled) return false;

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
