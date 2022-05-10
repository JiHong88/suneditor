/**
 * @fileoverview Shortcuts class
 * @author Yi JiHong.
 */

import CoreInterface from '../../class/_core';

const Shortcuts = function (editor) {
	CoreInterface.call(this, editor);
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
		let command = null;
		const keyStr = this._keyCodeShortcut[keyCode];
		const options = this.options;

		switch (keyCode) {
			case 65: // A
				command = 'selectAll';
				break;
			case 66: // B
				if (options.shortcutsDisable.indexOf('bold') === -1) {
					command = 'bold';
				}
				break;
			case 83: // S
				if (shift && options.shortcutsDisable.indexOf('strike') === -1) {
					command = 'strike';
				} else if (!shift && options.shortcutsDisable.indexOf('save') === -1) {
					command = 'save';
				}
				break;
			case 85: // U
				if (options.shortcutsDisable.indexOf('underline') === -1) {
					command = 'underline';
				}
				break;
			case 73: // I
				if (options.shortcutsDisable.indexOf('italic') === -1) {
					command = 'italic';
				}
				break;
			case 90: // Z
				if (options.shortcutsDisable.indexOf('undo') === -1) {
					if (shift) {
						command = 'redo';
					} else {
						command = 'undo';
					}
				}
				break;
			case 89: // Y
				if (options.shortcutsDisable.indexOf('undo') === -1) {
					command = 'redo';
				}
				break;
			case 219: // [
				if (options.shortcutsDisable.indexOf('indent') === -1) {
					command = options._rtl ? 'indent' : 'outdent';
				}
				break;
			case 221: // ]
				if (options.shortcutsDisable.indexOf('indent') === -1) {
					command = options._rtl ? 'outdent' : 'indent';
				}
				break;
		}

		if (!command) return keyStr === 'B'; // chromium - bold disabled

		this.core.commandHandler(command, this.core._commandMap[command]);
		return true;
	},

	constructor: Shortcuts
};

export default Shortcuts;
