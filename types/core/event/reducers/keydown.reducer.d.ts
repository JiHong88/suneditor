/**
 * @typedef {Object} KeydownReducerCtx - Keydown Reducer Context object
 * @property {KeyboardEvent} ctx.e - The keyboard event
 * @property {__se__FrameContext} ctx.fc - Frame context object
 * @property {__se__EditorStatus} ctx.status - Editor status object
 * @property {__se__BaseOptions} ctx.options - Options object
 * @property {__se__FrameOptions} ctx.frameOptions - Frame options object
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
 * @param {__se__EventPorts} ports - Ports for interacting with editor
 * @param {KeydownReducerCtx} ctx - Context object
 * @returns {Promise<__se__EventActions>} Action list
 */
export function reduceKeydown(ports: __se__EventPorts, ctx: KeydownReducerCtx): Promise<__se__EventActions>;
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
	fc: __se__FrameContext;
	/**
	 * - Editor status object
	 */
	status: __se__EditorStatus;
	/**
	 * - Options object
	 */
	options: __se__BaseOptions;
	/**
	 * - Frame options object
	 */
	frameOptions: __se__FrameOptions;
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
