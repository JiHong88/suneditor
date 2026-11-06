import type {} from '../../../typedef';
/**
 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_ww_dragDrop
 */
/**
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {HTMLElement} dragCursor - Drag cursor element
 * @param {?HTMLElement} _iframeTopArea - Iframe top area element
 * @param {?HTMLElement} _innerToolbar - Inner toolbar element
 * @param {DragEvent} e - Event object
 */
export function OnDragOver_wysiwyg(
	this: import('../eventOrchestrator').default,
	fc: SunEditor.FrameContext,
	dragCursor: HTMLElement,
	_iframeTopArea: HTMLElement | null,
	_innerToolbar: HTMLElement | null,
	e: DragEvent,
): void;
/**
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @description Indicates that a drag operation has begun within the editor body.
 */
export function OnDragStart_wysiwyg(this: import('../eventOrchestrator').default): void;
export class OnDragStart_wysiwyg {
	_dragFromWysiwyg: boolean;
}
/**
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @param {HTMLElement} dragCursor - Drag cursor element
 */
export function OnDragEnd_wysiwyg(this: import('../eventOrchestrator').default, dragCursor: HTMLElement): void;
export class OnDragEnd_wysiwyg {
	/**
	 * @this {EventManagerThis_handler_ww_dragDrop}
	 * @param {HTMLElement} dragCursor - Drag cursor element
	 */
	constructor(this: import('../eventOrchestrator').default, dragCursor: HTMLElement);
	_dragFromWysiwyg: boolean;
}
/**
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {HTMLElement} dragCursor - Drag cursor element
 * @param {DragEvent} e - Event object
 */
export function OnDrop_wysiwyg(
	this: import('../eventOrchestrator').default,
	fc: SunEditor.FrameContext,
	dragCursor: HTMLElement,
	e: DragEvent,
): boolean | Promise<boolean>;
export class OnDrop_wysiwyg {
	/**
	 * @this {EventManagerThis_handler_ww_dragDrop}
	 * @param {SunEditor.FrameContext} fc - Frame context object
	 * @param {HTMLElement} dragCursor - Drag cursor element
	 * @param {DragEvent} e - Event object
	 */
	constructor(
		this: import('../eventOrchestrator').default,
		fc: SunEditor.FrameContext,
		dragCursor: HTMLElement,
		e: DragEvent,
	);
	_dragFromWysiwyg: boolean;
}
export type EventManagerThis_handler_ww_dragDrop = import('../eventOrchestrator').default;
