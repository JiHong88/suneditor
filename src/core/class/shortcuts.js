/**
 * @fileoverview Shortcuts class
 * @author Yi JiHong.
 */

import CoreDependency from '../../dependency/_core';

const Shortcuts = function (editor) {
	CoreDependency.call(this, editor);
	this.isDisabled = false;
	this._keyCodeShortcut = {
		65: 'A',
		66: 'B',
		83: 'S',
		85: 'U',
		73: 'I',
		89: 'Y',
		90: 'Z',
		219: '[',
		221: ']'
	};
};

Shortcuts.prototype = {
	/**
	 * @description If there is a shortcut function, run it.
	 * @param {number} keyCode event.keyCode
	 * @param {boolean} shift Whether to press shift key
	 * @returns {boolean} Whether to execute shortcuts
	 */
	command: function (keyCode, shift) {
		if (this.isDisabled) return true;

		let command = '';
		switch (keyCode) {
			case 65: // A
				command = 'selectAll';
				break;
			case 66: // B
				if (this.options.shortcutsDisable.indexOf('bold') === -1) {
					command = 'bold';
				}
				break;
			case 83: // S
				if (shift && this.options.shortcutsDisable.indexOf('strike') === -1) {
					command = 'strike';
				} else if (!shift && this.options.shortcutsDisable.indexOf('save') === -1) {
					command = 'save';
				}
				break;
			case 85: // U
				if (this.options.shortcutsDisable.indexOf('underline') === -1) {
					command = 'underline';
				}
				break;
			case 73: // I
				if (this.options.shortcutsDisable.indexOf('italic') === -1) {
					command = 'italic';
				}
				break;
			case 90: // Z
				if (this.options.shortcutsDisable.indexOf('undo') === -1) {
					if (shift) {
						command = 'redo';
					} else {
						command = 'undo';
					}
				}
				break;
			case 89: // Y
				if (this.options.shortcutsDisable.indexOf('undo') === -1) {
					command = 'redo';
				}
				break;
			case 219: // [
				if (this.options.shortcutsDisable.indexOf('indent') === -1) {
					command = this.options._rtl ? 'indent' : 'outdent';
				}
				break;
			case 221: // ]
				if (this.options.shortcutsDisable.indexOf('indent') === -1) {
					command = this.options._rtl ? 'outdent' : 'indent';
				}
				break;
		}

		if (!command) return !!this._keyCodeShortcut[keyCode];

		this.editor.commandHandler(command, this.editor._commandMap[command]);
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
