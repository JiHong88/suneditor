/**
 * @fileoverview history stack closure
 * @author JiHong Lee.
 */
"use strict";

import { window } from "../helper/global";
import { getNodeFromPath, getNodePath } from "../helper/dom";

export default function (core, change) {
	const delayTime = core.options.historyStackDelayTime;
	let editor = core.context.element;
	let undo = core.context.buttons.undo;
	let redo = core.context.buttons.redo;

	let pushDelay = null;
	let stackIndex = 0;
	let stack = [];

	function setContentsFromStack() {
		const item = stack[stackIndex];
		editor.wysiwyg.innerHTML = item.contents;

		core.setRange(getNodeFromPath(item.s.path, editor.wysiwyg), item.s.offset, getNodeFromPath(item.e.path, editor.wysiwyg), item.e.offset);
		core.focus();

		if (stack.length <= 1) {
			if (undo) undo.setAttribute("disabled", true);
			if (redo) redo.setAttribute("disabled", true);
		} else {
			if (stackIndex === 0) {
				if (undo) undo.setAttribute("disabled", true);
				if (redo) redo.removeAttribute("disabled");
			} else if (stackIndex === stack.length - 1) {
				if (undo) undo.removeAttribute("disabled");
				if (redo) redo.setAttribute("disabled", true);
			} else {
				if (undo) undo.removeAttribute("disabled");
				if (redo) redo.removeAttribute("disabled");
			}
		}

		core.controllersOff();
		core._checkComponents();
		core.char.display();
		core._resourcesStateChange();

		// onChange
		change();
	}

	function pushStack() {
		core._checkComponents();
		const current = core.getContents(true);
		if (!current || (!!stack[stackIndex] && current === stack[stackIndex].contents)) return;

		stackIndex++;
		const range = core._variable._range;

		if (stack.length > stackIndex) {
			stack = stack.slice(0, stackIndex);
			if (redo) redo.setAttribute("disabled", true);
		}

		if (!range) {
			stack[stackIndex] = {
				contents: current,
				s: { path: [0, 0], offset: [0, 0] },
				e: { path: 0, offset: 0 }
			};
		} else {
			stack[stackIndex] = {
				contents: current,
				s: {
					path: getNodePath(range.startContainer, null, null),
					offset: range.startOffset
				},
				e: {
					path: getNodePath(range.endContainer, null, null),
					offset: range.endOffset
				}
			};
		}

		if (stackIndex === 1 && undo) undo.removeAttribute("disabled");

		core.char.display();
		// onChange
		change();
	}

	return {
		/**
		 * @description History stack
		 */
		stack: stack,

		/**
		 * @description Saving the current status to the history object stack
		 * If "delay" is true, it will be saved after (options.historyStackDelayTime || 400) miliseconds
		 * If the function is called again with the "delay" argument true before it is saved, the delay time is renewal
		 * You can specify the delay time by sending a number.
		 * @param {Boolean|Number} delay If true, Add stack without delay time.
		 */
		push: function (delay) {
			window.setTimeout(core._resourcesStateChange.bind(core));
			const time = typeof delay === "number" ? (delay > 0 ? delay : 0) : !delay ? 0 : delayTime;

			if (!time || pushDelay) {
				window.clearTimeout(pushDelay);
				if (!time) {
					pushStack();
					return;
				}
			}

			pushDelay = window.setTimeout(function () {
				window.clearTimeout(pushDelay);
				pushDelay = null;
				pushStack();
			}, time);
		},

		/**
		 * @description Undo function
		 */
		undo: function () {
			if (stackIndex > 0) {
				stackIndex--;
				setContentsFromStack();
			}
		},

		/**
		 * @description Redo function
		 */
		redo: function () {
			if (stack.length - 1 > stackIndex) {
				stackIndex++;
				setContentsFromStack();
			}
		},

		/**
		 * @description Go to the history stack for that index.
		 * If "index" is -1, go to the last stack
		 * @param {Number} index Stack index
		 */
		go: function (index) {
			stackIndex = index < 0 ? stack.length - 1 : index;
			setContentsFromStack();
		},

		/**
		 * @description Get the current history stack index.
		 * @returns {Number} Current Stack index
		 */
		getCurrentIndex: function () {
			return stackIndex;
		},

		/**
		 * @description Reset the history object
		 */
		reset: function (ignoreChangeEvent) {
			if (undo) undo.setAttribute("disabled", true);
			if (redo) redo.setAttribute("disabled", true);
			core._variable.isChanged = false;
			if (core.context.buttons.save) core.context.buttons.save.setAttribute("disabled", true);

			stack.splice(0);
			stackIndex = 0;

			// pushStack
			stack[stackIndex] = {
				contents: core.getContents(true),
				s: {
					path: [0, 0],
					offset: 0
				},
				e: {
					path: [0, 0],
					offset: 0
				}
			};

			if (!ignoreChangeEvent) change();
		},

		/**
		 * @description Reset the disabled state of the buttons to fit the current stack.
		 * @private
		 */
		_resetCachingButton: function () {
			editor = core.context.element;
			undo = core.context.buttons.undo;
			redo = core.context.buttons.redo;

			if (stackIndex === 0) {
				if (undo) undo.setAttribute("disabled", true);
				if (redo && stackIndex === stack.length - 1) redo.setAttribute("disabled", true);
				core._variable.isChanged = false;
				if (core.context.buttons.save) core.context.buttons.save.setAttribute("disabled", true);
			} else if (stackIndex === stack.length - 1) {
				if (redo) redo.setAttribute("disabled", true);
			}
		},

		/**
		 * @description Remove all stacks and remove the timeout function.
		 * @private
		 */
		_destroy: function () {
			if (pushDelay) window.clearTimeout(pushDelay);
			stack = null;
		}
	};
}
