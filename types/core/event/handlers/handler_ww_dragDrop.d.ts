import type {} from '../../../typedef';
/**
 * @typedef {Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>} EventManagerThis_handler_ww_dragDrop
 */
/**
 * @private
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @param {__se__FrameContext} fc - Frame context object
 * @param {HTMLElement} dragCursor - Drag cursor element
 * @param {?HTMLElement} _iframeTopArea - Iframe top area element
 * @param {?HTMLElement} _innerToolbar - Inner toolbar element
 * @param {DragEvent} e - Event object
 */
export function OnDragOver_wysiwyg(
	this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>,
	fc: __se__FrameContext,
	dragCursor: HTMLElement,
	_iframeTopArea: HTMLElement | null,
	_innerToolbar: HTMLElement | null,
	e: DragEvent
): void;
/**
 * @private
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @param {HTMLElement} dragCursor - Drag cursor element
 */
export function OnDragEnd_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, dragCursor: HTMLElement): void;
/**
 * @private
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @param {__se__FrameContext} fc - Frame context object
 * @param {HTMLElement} dragCursor - Drag cursor element
 * @param {DragEvent} e - Event object
 */
export function OnDrop_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: __se__FrameContext, dragCursor: HTMLElement, e: DragEvent): boolean | Promise<boolean>;
export type EventManagerThis_handler_ww_dragDrop = Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>;
