import type {} from '../../../typedef';
/**
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 */
/**
 * @typedef {Object} KeydownReducerCtx - Keydown Reducer Context object
 * @property {KeyboardEvent} ctx.e - The keyboard event
 * @property {SunEditor.FrameContext} ctx.fc - Frame context object
 * @property {SunEditor.Store} ctx.store - Editor store object
 * @property {SunEditor.Options} ctx.options - Options object
 * @property {SunEditor.FrameOptions} ctx.frameOptions - Frame options object
 * @property {Range} ctx.range - Current selection range
 * @property {HTMLElement|Text} ctx.selectionNode - Current selection node
 * @property {HTMLElement} ctx.formatEl - Current format element
 * @property {string} ctx.keyCode - Key code
 * @property {boolean} ctx.ctrl - Whether the ctrl key is pressed
 * @property {boolean} ctx.alt - Whether the alt key is pressed
 * @property {boolean} ctx.shift - Whether the shift key is pressed
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
export type EventPorts = import('../ports').EventReducerPorts;
/**
 * - Keydown Reducer Context object
 */
export type KeydownReducerCtx = {
	/**
	 * - The keyboard event
	 */
	e: KeyboardEvent;
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
	 * - Whether the ctrl key is pressed
	 */
	ctrl: boolean;
	/**
	 * - Whether the alt key is pressed
	 */
	alt: boolean;
	/**
	 * - Whether the shift key is pressed
	 */
	shift: boolean;
};
export type EventActions = import('../actions').Action[];
