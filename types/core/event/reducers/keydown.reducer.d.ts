import type {} from '../../../typedef';
/**
 * @description Routing decision for Enter. Auto-repeat (held key) fires `keydown` but not `beforeinput`,
 * so a repeat must stay on `keydown` or only the first line break would land.
 * @param {SunEditor.Store} store - Editor store object
 * @param {KeyboardEvent|InputEvent} [e] - Source event; a `repeat` flag forces the `keydown` path.
 * @returns {boolean} `true` to route Enter through `beforeinput`, `false` to keep it on `keydown`.
 */
export function useEnterFromBeforeInput(store: SunEditor.Store, e?: KeyboardEvent | InputEvent): boolean;
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
 * @description Master switch for processing Enter from the `beforeinput` event (post-IME-commit) instead
 * of `keydown`, to avoid trapping iOS/mobile IME marked-text when `keydown` mutates the DOM (see
 * `handler_ww_input.js`).
 *
 * This is only the compile-time master; the effective per-environment decision is
 * {@link useEnterFromBeforeInput}, which additionally requires that this environment actually delivers
 * `beforeinput` at runtime (some corporate security SW / DLP / VDI drop it).
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
