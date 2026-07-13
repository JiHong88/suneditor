import type {} from '../../../typedef';
/**
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 */
/**
 * @typedef {Object} KeydownReducerCtx - Keydown Reducer Context object
 * @property {KeyboardEvent|InputEvent} ctx.e - The keyboard event (or the `beforeinput` InputEvent when Enter is dispatched from `beforeinput`)
 * @property {SunEditor.FrameContext} ctx.fc - Frame context object
 * @property {SunEditor.Store} ctx.store - Editor store object
 * @property {SunEditor.Options} ctx.options - Options object
 * @property {SunEditor.FrameOptions} ctx.frameOptions - Frame options object
 * @property {Range} ctx.range - Current selection range
 * @property {HTMLElement|Text} ctx.selectionNode - Current selection node
 * @property {HTMLElement} ctx.formatEl - Current format element
 * @property {string} ctx.keyCode - Key code
 * @property {boolean} ctx.ctrl - Whether the `ctrl` key is pressed
 * @property {boolean} ctx.alt - Whether the `alt` key is pressed
 * @property {boolean} ctx.shift - Whether the `shift` key is pressed
 */
/**
 * @typedef {import('../actions').Action[]} EventActions
 */
/**
 * @description Keydown event reducer
 * @param {EventPorts} ports - Ports for interacting with editor
 * @param {KeydownReducerCtx} ctx - Context object
 * @returns {Promise<EventActions>} Action list
 */
export function reduceKeydown(ports: EventPorts, ctx: KeydownReducerCtx): Promise<EventActions>;
/**
 * @description Enter is processed from the `beforeinput` event (post-IME-commit) instead of `keydown`,
 * to avoid trapping iOS/mobile IME marked-text when `keydown` mutates the DOM (see `handler_ww_input.js`).
 * Flip to `false` to instantly restore the legacy synchronous `keydown` Enter path — no other file needs
 * touching for rollback (the `keydown` Enter gate, the `handler_ww_key` normalization guard, and the
 * `beforeinput` dispatch all key off this single flag).
 * @type {boolean}
 */
export const ENTER_FROM_BEFOREINPUT: boolean;
export type EventPorts = import('../ports').EventReducerPorts;
/**
 * - Keydown Reducer Context object
 */
export type KeydownReducerCtx = {
	/**
	 * - The keyboard event (or the `beforeinput` InputEvent when Enter is dispatched from `beforeinput`)
	 */
	e: KeyboardEvent | InputEvent;
	/**
	 * - Frame context object
	 */
	fc: SunEditor.FrameContext;
	/**
	 * - Editor store object
	 */
	store: SunEditor.Store;
	/**
	 * - Options object
	 */
	options: SunEditor.Options;
	/**
	 * - Frame options object
	 */
	frameOptions: SunEditor.FrameOptions;
	/**
	 * - Current selection range
	 */
	range: Range;
	/**
	 * - Current selection node
	 */
	selectionNode: HTMLElement | Text;
	/**
	 * - Current format element
	 */
	formatEl: HTMLElement;
	/**
	 * - Key code
	 */
	keyCode: string;
	/**
	 * - Whether the `ctrl` key is pressed
	 */
	ctrl: boolean;
	/**
	 * - Whether the `alt` key is pressed
	 */
	alt: boolean;
	/**
	 * - Whether the `shift` key is pressed
	 */
	shift: boolean;
};
export type EventActions = import('../actions').Action[];
