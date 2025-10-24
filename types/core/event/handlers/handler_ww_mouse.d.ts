import type {} from '../../../typedef';
/**
 * @typedef {Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>} EventManagerThis_handler_ww_mouse
 */
/**
 * @private
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseDown_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: SunEditor.FrameContext, e: MouseEvent): Promise<void>;
/**
 * @private
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseUp_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: SunEditor.FrameContext, e: MouseEvent): Promise<void>;
/**
 * @private
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnClick_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: SunEditor.FrameContext, e: MouseEvent): Promise<boolean>;
/**
 * @private
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseMove_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: SunEditor.FrameContext, e: MouseEvent): boolean;
/**
 * @private
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseLeave_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: SunEditor.FrameContext, e: MouseEvent): Promise<void>;
export type EventManagerThis_handler_ww_mouse = Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>;
