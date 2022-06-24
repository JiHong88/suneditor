/**
 * @fileoverview history stack closure
 * @author Yi JiHong.
 */

import { _w } from '../../helper/global';
import { getNodeFromPath, getNodePath } from '../../helper/domUtils';

export default function (editor, change) {
	const delayTime = editor.options.historyStackDelayTime;
	let elements = editor.context.element;
	let undo = editor.context.buttons.undo;
	let redo = editor.context.buttons.redo;

	let pushDelay = null;
	let stackIndex = 0;
	let stack = [];

	function setContentFromStack() {
		const item = stack[stackIndex];
		elements.wysiwyg.innerHTML = item.content;

		editor.selection.setRange(getNodeFromPath(item.s.path, elements.wysiwyg), item.s.offset, getNodeFromPath(item.e.path, elements.wysiwyg), item.e.offset);
		editor.focus();

		if (stack.length <= 1) {
			if (undo) undo.setAttribute('disabled', true);
			if (redo) redo.setAttribute('disabled', true);
		} else {
			if (stackIndex === 0) {
				if (undo) undo.setAttribute('disabled', true);
				if (redo) redo.removeAttribute('disabled');
			} else if (stackIndex === stack.length - 1) {
				if (undo) undo.removeAttribute('disabled');
				if (redo) redo.setAttribute('disabled', true);
			} else {
				if (undo) undo.removeAttribute('disabled');
				if (redo) redo.removeAttribute('disabled');
			}
		}

		editor._offCurrentController();
		editor._checkComponents();
		editor.char.display();
		editor._resourcesStateChange();

		// onChange
		change();
	}

	function pushStack() {
		editor._checkComponents();
		const current = editor.getContent(true);
		if (!current || (!!stack[stackIndex] && current === stack[stackIndex].content)) return;

		stackIndex++;
		const range = editor.status._range;

		if (stack.length > stackIndex) {
			stack = stack.slice(0, stackIndex);
			if (redo) redo.setAttribute('disabled', true);
		}

		if (!range) {
			stack[stackIndex] = {
				content: current,
				s: { path: [0, 0], offset: [0, 0] },
				e: { path: 0, offset: 0 }
			};
		} else {
			stack[stackIndex] = {
				content: current,
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

		if (stackIndex === 1 && undo) undo.removeAttribute('disabled');

		editor.char.display();
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
			_w.setTimeout(editor._resourcesStateChange.bind(editor));
			const time = typeof delay === 'number' ? (delay > 0 ? delay : 0) : !delay ? 0 : delayTime;

			if (!time || pushDelay) {
				_w.clearTimeout(pushDelay);
				if (!time) {
					pushStack();
					return;
				}
			}

			pushDelay = _w.setTimeout(function () {
				_w.clearTimeout(pushDelay);
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
				setContentFromStack();
			}
		},

		/**
		 * @description Redo function
		 */
		redo: function () {
			if (stack.length - 1 > stackIndex) {
				stackIndex++;
				setContentFromStack();
			}
		},

		/**
		 * @description Go to the history stack for that index.
		 * If "index" is -1, go to the last stack
		 * @param {number} index Stack index
		 */
		go: function (index) {
			stackIndex = index < 0 ? stack.length - 1 : index;
			setContentFromStack();
		},

		/**
		 * @description Get the current history stack index.
		 * @returns {number} Current Stack index
		 */
		getCurrentIndex: function () {
			return stackIndex;
		},

		/**
		 * @description Reset the history object
		 */
		reset: function (ignoreChangeEvent) {
			if (undo) undo.setAttribute('disabled', true);
			if (redo) redo.setAttribute('disabled', true);
			editor.status.isChanged = false;
			if (editor.context.buttons.save) editor.context.buttons.save.setAttribute('disabled', true);

			stack.splice(0);
			stackIndex = 0;

			// pushStack
			stack[stackIndex] = {
				content: editor.getContent(true),
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
			elements = editor.context.element;
			undo = editor.context.buttons.undo;
			redo = editor.context.buttons.redo;

			if (stackIndex === 0) {
				if (undo) undo.setAttribute('disabled', true);
				if (redo && stackIndex === stack.length - 1) redo.setAttribute('disabled', true);
				editor.status.isChanged = false;
				if (editor.context.buttons.save) editor.context.buttons.save.setAttribute('disabled', true);
			} else if (stackIndex === stack.length - 1) {
				if (redo) redo.setAttribute('disabled', true);
			}
		},

		/**
		 * @description Remove all stacks and remove the timeout function.
		 * @private
		 */
		_destroy: function () {
			if (pushDelay) _w.clearTimeout(pushDelay);
			stack = null;
		}
	};
}
