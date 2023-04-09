/**
 * @fileoverview Shortcuts class
 */

import CoreDependency from '../../dependency/_core';

const Shortcuts = function (editor) {
	CoreDependency.call(this, editor);

	// members
	this.isDisabled = false;
};

Shortcuts.prototype = {
	/**
	 * @description If there is a shortcut function, run it.
	 * @param {number} keyCode event.keyCode
	 * @param {boolean} shift Whether to press shift key
	 * @returns {boolean} Whether to execute shortcuts
	 */
	command: function (keyCode, shift) {
		if (this.isDisabled) return false;

		const info = this.editor.shortcutsKeyMap.get(keyCode + (shift ? 1000 : 0));
		if (!info || (!shift && info.s)) return false;

		this.editor.run((this.options.get('_rtl') ? info.r : info.c) || info.c, info.t, info.e);
		return true;
	},

	disable: function () {
		this.isDisabled = true;
	},

	enable: function () {
		this.isDisabled = false;
	},

	constructor: Shortcuts
};

export default Shortcuts;
