import type {} from '../../../typedef';
/**
 * @typedef {Object} KeydownReducerCtx - Keydown Reducer Context object
 * @property {KeyboardEvent} ctx.e - The keyboard event
 * @property {SunEditor.FrameContext} ctx.fc - Frame context object
 * @property {SunEditor.Status} ctx.status - Editor status object
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
 * @description Keydown event reducer
 * @param {SunEditor.EventPorts} ports - Ports for interacting with editor
 * @param {KeydownReducerCtx} ctx - Context object
 * @returns {Promise<SunEditor.EventActions>} Action list
 */
export function reduceKeydown(ports: SunEditor.EventPorts, ctx: KeydownReducerCtx): Promise<SunEditor.EventActions>;
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
	 * - Editor status object
	 */
	status: SunEditor.Status;
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
