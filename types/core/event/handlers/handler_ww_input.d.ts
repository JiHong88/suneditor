import type {} from '../../../typedef';
/**
 * @typedef {import('../eventManager').default} EventManagerThis_handler_ww_input
 */
/**
 * @this {EventManagerThis_handler_ww_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {InputEvent} e - Event object
 */
export function OnBeforeInput_wysiwyg(this: import('../eventManager').default, fc: SunEditor.FrameContext, e: InputEvent): Promise<boolean>;
export class OnBeforeInput_wysiwyg {
	/**
	 * @typedef {import('../eventManager').default} EventManagerThis_handler_ww_input
	 */
	/**
	 * @this {EventManagerThis_handler_ww_input}
	 * @param {SunEditor.FrameContext} fc - Frame context object
	 * @param {InputEvent} e - Event object
	 */
	constructor(this: import('../eventManager').default, fc: SunEditor.FrameContext, e: InputEvent);
	_handledInBefore: boolean;
}
/**
 * @this {EventManagerThis_handler_ww_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {InputEvent} e - Event object
 */
export function OnInput_wysiwyg(this: import('../eventManager').default, fc: SunEditor.FrameContext, e: InputEvent): Promise<boolean>;
export class OnInput_wysiwyg {
	/**
	 * @this {EventManagerThis_handler_ww_input}
	 * @param {SunEditor.FrameContext} fc - Frame context object
	 * @param {InputEvent} e - Event object
	 */
	constructor(this: import('../eventManager').default, fc: SunEditor.FrameContext, e: InputEvent);
	_handledInBefore: boolean;
}
export type EventManagerThis_handler_ww_input = import('../eventManager').default;
