/**
 * @fileoverview history stack closure
 */

import { _w } from '../../../helper/env';
import { getNodeFromPath, getNodePath } from '../../../helper/dom/domQuery';
import { numbers } from '../../../helper';

/**
 * @description History stack closure
 * @param {SunEditor.Kernel} kernel
 */
export default function History(kernel) {
	const $ = kernel.$;
	const store = kernel.store;

	const contextProvider = $.contextProvider;
	const eventManager = $.eventManager;
	const frameRoots = contextProvider.frameRoots;
	const context = contextProvider.context;
	const frameContext = contextProvider.frameContext;

	let delayTime = $.options.get('historyStackDelayTime');
	let pushDelay = null;
	let stackIndex, stack, rootStack, rootInitContents;
	let waiting = false;
	let waitingTime = null;

	/**
	 * @description Triggers onChange event and updates UI after history state changes.
	 * @param {SunEditor.FrameContext} fc The frame context.
	 * @param {number} index The current history index.
	 * @param {boolean} isSetFocus Whether to apply tag effects if editor has focus.
	 */
	function change(fc, index, isSetFocus) {
		if (isSetFocus && store.get('hasFocus')) kernel._eventOrchestrator.applyTagEffect();
		$.history.resetButtons(fc.get('key'), index);

		// user event
		eventManager.triggerEvent('onChange', { frameContext: fc, data: fc.get('wysiwyg').innerHTML });
		if (context.get('toolbar_main').style.display === 'block') $.toolbar._showBalloon();
		else if (store.mode.isSubBalloon && context.get('toolbar_sub_main').style.display === 'block') $.subToolbar._showBalloon();
	}

	/**
	 * @description Restores content from the history stack and updates the editor state.
	 * @param {number} increase Direction to move in the stack: -1 for undo, +1 for redo.
	 */
	function setContentFromStack(increase) {
		const prevKey = stack[stackIndex];
		const prevRoot = rootStack[prevKey];

		stackIndex += increase;
		const rootKey = increase < 0 && prevKey !== stack[stackIndex] && prevRoot.index > 0 ? prevKey : stack[stackIndex];
		const root = rootStack[rootKey];
		root.index += increase;

		const item = root.value[root.index];
		frameRoots.get(rootKey).get('wysiwyg').innerHTML = item.content;

		if (prevKey !== rootKey && increase < 0 && stackIndex === 1) {
			stackIndex = 0;
		} else if (prevKey !== rootKey && increase > 0 && root.index === 1) {
			stackIndex++;
		} else if ((increase < 0 && root.index < 1) || (increase > 0 && root.index > root.value.length)) {
			stackIndex += increase;
		}

		let focusKey = rootKey;
		let focusItem = item;
		if (increase < 0 && stackIndex > 0 && root.index === 0) {
			const nextKey = stack[stackIndex + increase];
			if (nextKey !== rootKey) {
				const nextRoot = rootStack[nextKey];
				focusKey = nextKey;
				focusItem = nextRoot.value[nextRoot.index];
			}
		}

		$.facade.changeFrameContext(focusKey);
		$.selection.setRange(getNodeFromPath(focusItem.s.path, focusItem.frame), focusItem.s.offset, getNodeFromPath(focusItem.e.path, focusItem.frame), focusItem.e.offset);
		$.focusManager.focus();

		if (stackIndex < 0) stackIndex = 0;
		else if (stackIndex >= stack.length) stackIndex = stack.length - 1;

		$.ui.offCurrentController();
		$.pluginManager.checkFileInfo(false);
		$.char.display();
		$.ui._syncFrameState(frameContext);

		// document type
		if (frameContext.has('documentType_use_header')) {
			frameContext.get('documentType').reHeader();
		}

		// onChange
		change(frameContext, root.index, true);
	}

	/**
	 * @description Saves content and selection to the history stack.
	 * @param {string} content HTML content to save.
	 * @param {Range} range Selection range.
	 * @param {*} rootKey Root frame key.
	 * @param {number} increase Stack index increment.
	 */
	function setStack(content, range, rootKey, increase) {
		let s, e;
		if (!range) {
			s = { path: [0, 0], offset: [0, 0] };
			e = { path: 0, offset: 0 };
		} else {
			s = {
				path: getNodePath(range.startContainer, null, null),
				offset: range.startOffset,
			};
			e = {
				path: getNodePath(range.endContainer, null, null),
				offset: range.endOffset,
			};
		}

		// set root stack
		stackIndex += increase;
		stack[stackIndex] = rootKey;
		const root = rootStack[rootKey];
		root.index += increase;
		root.value[root.index] = {
			content: content,
			s: s,
			e: e,
			frame: frameRoots.get(rootKey).get('wysiwyg'),
		};
	}

	/**
	 * @description Resets a root frame's history stack.
	 * @param {*} rootKey Root frame key.
	 */
	function resetRoot(rootKey) {
		stackIndex++;
		stack[stackIndex] = rootKey;
		const root = rootStack[rootKey];
		root.index = 0;
		root.value[0] = {
			content: rootInitContents[rootKey],
			s: { path: [0, 0], offset: [0, 0] },
			e: { path: 0, offset: 0 },
			frame: frameRoots.get(rootKey).get('wysiwyg'),
		};
	}

	/**
	 * @description Initializes a root frame's history stack.
	 * @param {*} rootKey Root frame key.
	 */
	function initRoot(rootKey) {
		rootStack[rootKey] = { value: [], index: -1 };
		rootInitContents[rootKey] = frameRoots.get(rootKey).get('wysiwyg').innerHTML;
	}

	/**
	 * @description Clears future history and reinitializes deleted roots.
	 * @param {Object} root Root stack object.
	 */
	function refreshRoots(root) {
		const deleteRoot = [];
		for (let i = stackIndex + 1, len = stack.length; i < len; i++) {
			if (deleteRoot.includes(stack[i])) continue;
			deleteRoot.push(stack[i]);
		}

		stack = stack.slice(0, stackIndex + 1);
		root.value.splice(stackIndex + 1);
		$.commandDispatcher.applyTargets('redo', (e) => {
			e.disabled = true;
		});

		for (let i = 0, len = deleteRoot.length; i < len; i++) {
			if (!stack.includes(deleteRoot[i])) initRoot(deleteRoot[i]);
		}
	}

	/**
	 * @description Pushes current content to the history stack.
	 * @param {*} rootKey Root frame key.
	 * @param {Range} range Selection range.
	 */
	function pushStack(rootKey, range) {
		$.pluginManager.checkFileInfo(false);

		const fc = frameRoots.get(rootKey);
		const current = fc.get('wysiwyg').innerHTML;
		const root = rootStack[rootKey];
		if (!current || (root.value[root.index] && current === root.value[root.index].content)) return;
		if (stack.length > stackIndex + 1) refreshRoots(root);
		if (root.value.length === 0) resetRoot(rootKey);

		setStack(current, range, rootKey, 1);

		if (stackIndex === 1) {
			$.commandDispatcher.applyTargets('undo', (e) => {
				e.disabled = false;
			});
		}

		$.char.display();
		change(fc, root.index, false);
	}

	return {
		/**
		 * @description Saving the current status to the history object stack
		 * - If "delay" is true, it will be saved after (options.get('historyStackDelayTime') || 400) milliseconds.
		 * - If the function is called again with the "delay" argument true before it is saved, the delay time is renewed.
		 * - You can specify the delay time by sending a number.
		 * @param {boolean|number} delay If true, add stack without delay time.
		 * @param {*} [rootKey] The key of the root frame to save history for.
		 */
		push(delay, rootKey) {
			if (waiting) return;

			rootKey = rootKey || rootKey === null ? rootKey : store.get('rootKey');
			const range = store.get('_range');

			// Defer frame sync (code view, page mirror) — DOM updates from the current action must complete first
			_w.setTimeout($.ui._syncFrameState.bind($.ui, frameRoots.get(rootKey)), 0);
			const time = typeof delay === 'number' ? (delay > 0 ? delay : 0) : !delay ? 0 : delayTime;

			if (!time || pushDelay) {
				_w.clearTimeout(pushDelay);
				if (!time) {
					pushStack(rootKey, range);
					return;
				}
			}

			// Debounced history save — coalesces rapid edits into a single snapshot (cleared on next push or immediate save)
			pushDelay = _w.setTimeout(() => {
				_w.clearTimeout(pushDelay);
				pushDelay = null;
				pushStack(rootKey, range);
			}, time);
		},

		/**
		 * @description Immediately saves the current state to the history stack if a delayed save is pending.
		 * @param {*} rootKey The key of the root frame.
		 * @param {Range} range The selection range object.
		 */
		check(rootKey, range) {
			if (pushDelay) {
				_w.clearTimeout(pushDelay);
				pushDelay = null;
				pushStack(rootKey, range);
			}
		},

		/**
		 * @description Undo function that restores the previous state from the history stack.
		 */
		undo() {
			if (stackIndex > 0) {
				setContentFromStack(-1);
			}
		},

		/**
		 * @description Redo function that re-applies a previously undone state from the history stack.
		 */
		redo() {
			if (stack.length - 1 > stackIndex) {
				setContentFromStack(1);
			}
		},

		/**
		 * @description Overwrites the current state in the history stack with the latest content.
		 * @param {string} [rootKey] The key of the root frame to overwrite.
		 */
		overwrite(rootKey) {
			setStack(frameRoots.get(rootKey || store.get('rootKey')).get('wysiwyg').innerHTML, null, store.get('rootKey'), 0);
		},

		/**
		 * @description Pauses the history stack, preventing new entries from being added for up to 5 seconds.
		 */
		pause() {
			waiting = true;

			if (waitingTime) {
				_w.clearTimeout(waitingTime);
				waitingTime = null;
			}
			// Safety auto-resume — prevents permanent history freeze if resume() is never called (cleared on resume)
			waitingTime = _w.setTimeout(() => {
				waiting = false;
			}, 5000);
		},

		/**
		 * @description Resumes history tracking by allowing new entries to be added to the stack.
		 */
		resume() {
			if (waitingTime) {
				_w.clearTimeout(waitingTime);
				waitingTime = null;
			}
			waiting = false;
		},

		/**
		 * @description Resets the history stack and disables related UI buttons.
		 */
		reset() {
			$.commandDispatcher.applyTargets('undo', (e) => (e.disabled = true));
			$.commandDispatcher.applyTargets('redo', (e) => (e.disabled = true));
			$.commandDispatcher.applyTargets('save', (e) => (e.disabled = true));

			contextProvider.applyToRoots((e) => e.set('historyIndex', -1));
			contextProvider.applyToRoots((e) => e.set('isChanged', false));

			stackIndex = -1;
			stack = [];
			rootStack = {};
			rootInitContents = {};
			waiting = false;

			const rootKeys = contextProvider.rootKeys;
			for (let i = 0, len = rootKeys.length; i < len; i++) {
				initRoot(rootKeys[i]);
			}
		},

		/**
		 * @description Updates the state of history-related buttons (undo, redo, save) based on the current history stack.
		 * @param {*} rootKey The key of the root frame.
		 * @param {number} [index] The index of the current history state.
		 */
		resetButtons(rootKey, index) {
			const isReset = !numbers.is(index);
			const root = rootStack[rootKey === undefined ? stack[stackIndex] : rootKey];
			index = !isReset ? index : root.index;
			const target = frameRoots.get(rootKey);
			const rootLen = root.value.length - 1;

			$.commandDispatcher.applyTargets('undo', (e) => {
				if (index > 0 && index <= rootLen) e.disabled = false;
				else e.disabled = true;
			});
			$.commandDispatcher.applyTargets('redo', (e) => {
				if (index > -1 && index < rootLen) e.disabled = false;
				else e.disabled = true;
			});

			const savedIndex = target.get('savedIndex');
			const historyIndex = target.get('historyIndex');
			const isChanged = savedIndex > -1 ? savedIndex !== index : isReset ? root.index > 0 : index > 0 && historyIndex !== index;

			target.set('historyIndex', index);
			target.set('isChanged', isChanged);
			$.commandDispatcher.applyTargets('save', (e) => {
				if (isChanged) e.disabled = false;
				else e.disabled = true;
			});

			eventManager.triggerEvent('onResetButtons', { rootKey });
		},

		/**
		 * @description Returns the root stack containing the history of each frame.
		 * @returns {{content: string, s: {path: number|number[], offset: number|number[]}, e: {path: number|number[], offset: number|number[]}, frame: HTMLElement}} The root stack object.
		 * - content: content html string
		 * - s: depth info of the "start" range
		 * - e: depth info of the "end" range
		 * - frame: wysiwyg editable element.
		 */
		getRootStack() {
			return rootStack;
		},

		/**
		 * @description Resets the delay time for saving history.
		 * @param {number} ms The new delay time in milliseconds.
		 */
		resetDelayTime(ms) {
			delayTime = ms;
		},

		/**
		 * @description Clears the entire history stack and cancels any pending save operations.
		 */
		_destroy() {
			if (pushDelay) _w.clearTimeout(pushDelay);
			stackIndex = stack = rootStack = rootInitContents = null;
		},
	};
}
