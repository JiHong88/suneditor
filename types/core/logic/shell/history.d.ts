import type {} from '../../../typedef';
/**
 * @description History stack closure
 * @param {SunEditor.Kernel} kernel
 */
export default function History(kernel: SunEditor.Kernel): {
	/**
	 * @description Saving the current status to the history object stack
	 * - If `delay` is `true`, it will be saved after (`options.get('historyStackDelayTime')` || 400) milliseconds.
	 * - If the function is called again with the `delay` argument `true` before it is saved, the delay time is renewed.
	 * - You can specify the delay time by sending a number.
	 * @param {boolean|number} delay If `true`, add stack without delay time.
	 * @param {*} [rootKey] The key of the root frame to save history for.
	 */
	push(delay: boolean | number, rootKey?: any): void;
	/**
	 * @description Immediately saves the current state to the history stack if a delayed save is pending.
	 * @param {*} rootKey The key of the root frame.
	 * @param {Range} range The selection range object.
	 */
	check(rootKey: any, range: Range): void;
	/**
	 * @description Undo function that restores the previous state from the history stack.
	 */
	undo(): void;
	/**
	 * @description Redo function that re-applies a previously undone state from the history stack.
	 */
	redo(): void;
	/**
	 * @description Overwrites the current state in the history stack with the latest content.
	 * @param {string} [rootKey] The key of the root frame to overwrite.
	 */
	overwrite(rootKey?: string): void;
	/**
	 * @description Pauses the history stack, preventing new entries from being added for up to 5 seconds.
	 */
	pause(): void;
	/**
	 * @description Resumes history tracking by allowing new entries to be added to the stack.
	 */
	resume(): void;
	/**
	 * @description Resets the history stack and disables related UI buttons.
	 */
	reset(): void;
	/**
	 * @description Updates the state of history-related buttons (undo, redo, save) based on the current history stack.
	 * @param {*} rootKey The key of the root frame.
	 * @param {number} [index] The index of the current history state.
	 */
	resetButtons(rootKey: any, index?: number): void;
	/**
	 * @description Returns the root stack containing the history of each frame.
	 * @returns {{content: string, s: {path: number|number[], offset: number|number[]}, e: {path: number|number[], offset: number|number[]}, frame: HTMLElement}} The root stack object.
	 * - content: content html string
	 * - s: depth info of the `start` range
	 * - e: depth info of the `end` range
	 * - frame: wysiwyg editable element.
	 */
	getRootStack(): {
		content: string;
		s: {
			path: number | number[];
			offset: number | number[];
		};
		e: {
			path: number | number[];
			offset: number | number[];
		};
		frame: HTMLElement;
	};
	/**
	 * @description Resets the delay time for saving history.
	 * @param {number} ms The new delay time in milliseconds.
	 */
	resetDelayTime(ms: number): void;
	/**
	 * @description Clears the entire history stack and cancels any pending save operations.
	 */
	_destroy(): void;
};
