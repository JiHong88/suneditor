import type {} from '../../../typedef';
/**
 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_ww_mouse
 */
/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseDown_wysiwyg(this: import('../eventOrchestrator').default, fc: SunEditor.FrameContext, e: MouseEvent): Promise<void>;
export class OnMouseDown_wysiwyg {
	/**
	 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_ww_mouse
	 */
	/**
	 * @this {EventManagerThis_handler_ww_mouse}
	 * @param {SunEditor.FrameContext} fc - Frame context object
	 * @param {MouseEvent} e - Event object
	 */
	constructor(this: import('../eventOrchestrator').default, fc: SunEditor.FrameContext, e: MouseEvent);
	__onDownEv: SunEditor.Event.GlobalInfo;
}
/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseUp_wysiwyg(this: import('../eventOrchestrator').default, fc: SunEditor.FrameContext, e: MouseEvent): Promise<void>;
/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnClick_wysiwyg(this: import('../eventOrchestrator').default, fc: SunEditor.FrameContext, e: MouseEvent): Promise<boolean>;
/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseMove_wysiwyg(this: import('../eventOrchestrator').default, fc: SunEditor.FrameContext, e: MouseEvent): boolean;
/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseLeave_wysiwyg(this: import('../eventOrchestrator').default, fc: SunEditor.FrameContext, e: MouseEvent): Promise<void>;
export type EventManagerThis_handler_ww_mouse = import('../eventOrchestrator').default;
