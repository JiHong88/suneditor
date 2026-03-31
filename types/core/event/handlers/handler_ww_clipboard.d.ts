import type {} from '../../../typedef';
/**
 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_ww_clipboard
 */
/**
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export function OnPaste_wysiwyg(this: import('../eventOrchestrator').default, frameContext: any, e: ClipboardEvent): true | Promise<boolean>;
/**
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export function OnCopy_wysiwyg(this: import('../eventOrchestrator').default, frameContext: any, e: ClipboardEvent): Promise<boolean>;
export class OnCopy_wysiwyg {
	/**
	 * @this {EventManagerThis_handler_ww_clipboard}
	 * @param {ClipboardEvent} e - Event object
	 */
	constructor(this: import('../eventOrchestrator').default, frameContext: any, e: ClipboardEvent);
	__secopy: any;
}
/**
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export function OnCut_wysiwyg(this: import('../eventOrchestrator').default, frameContext: any, e: ClipboardEvent): Promise<boolean>;
export class OnCut_wysiwyg {
	/**
	 * @this {EventManagerThis_handler_ww_clipboard}
	 * @param {ClipboardEvent} e - Event object
	 */
	constructor(this: import('../eventOrchestrator').default, frameContext: any, e: ClipboardEvent);
	__secopy: any;
}
export type EventManagerThis_handler_ww_clipboard = import('../eventOrchestrator').default;
