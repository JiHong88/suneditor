import type {} from '../../../typedef';
/**
 * @typedef {Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>} EventManagerThis_handler_ww_clipboard
 */
/**
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export function OnPaste_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, frameContext: any, e: ClipboardEvent): true | Promise<boolean>;
/**
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export function OnCopy_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, frameContext: any, e: ClipboardEvent): Promise<boolean>;
export class OnCopy_wysiwyg {
	/**
	 * @this {EventManagerThis_handler_ww_clipboard}
	 * @param {ClipboardEvent} e - Event object
	 */
	constructor(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, frameContext: any, e: ClipboardEvent);
	__secopy: any;
}
/**
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export function OnCut_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, frameContext: any, e: ClipboardEvent): Promise<boolean>;
export class OnCut_wysiwyg {
	/**
	 * @this {EventManagerThis_handler_ww_clipboard}
	 * @param {ClipboardEvent} e - Event object
	 */
	constructor(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, frameContext: any, e: ClipboardEvent);
	__secopy: any;
}
export type EventManagerThis_handler_ww_clipboard = Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>;
