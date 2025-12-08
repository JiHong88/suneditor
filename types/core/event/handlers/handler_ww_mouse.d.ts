import type {} from '../../../typedef';
/**
 * @typedef {import('../eventManager').default} EventManagerThis_handler_ww_mouse
 */
/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseDown_wysiwyg(this: import('../eventManager').default, fc: SunEditor.FrameContext, e: MouseEvent): Promise<void>;
/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseUp_wysiwyg(this: import('../eventManager').default, fc: SunEditor.FrameContext, e: MouseEvent): Promise<void>;
/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnClick_wysiwyg(this: import('../eventManager').default, fc: SunEditor.FrameContext, e: MouseEvent): Promise<boolean>;
/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseMove_wysiwyg(this: import('../eventManager').default, fc: SunEditor.FrameContext, e: MouseEvent): boolean;
/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseLeave_wysiwyg(this: import('../eventManager').default, fc: SunEditor.FrameContext, e: MouseEvent): Promise<void>;
export type EventManagerThis_handler_ww_mouse = import('../eventManager').default;
