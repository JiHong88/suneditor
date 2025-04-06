/**
 * @typedef {Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>} EventManagerThis_handler_ww_clipboard
 */
/**
 * @private
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export function OnPaste_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, frameContext: any, e: ClipboardEvent): true | Promise<boolean>;
/**
 * @private
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export function OnCopy_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, frameContext: any, e: ClipboardEvent): Promise<boolean>;
export class OnCopy_wysiwyg {
	/**
	 * @private
	 * @this {EventManagerThis_handler_ww_clipboard}
	 * @param {ClipboardEvent} e - Event object
	 */
	private constructor();
	__secopy: any;
}
/**
 * @private
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export function OnCut_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, frameContext: any, e: ClipboardEvent): Promise<boolean>;
export class OnCut_wysiwyg {
	/**
	 * @private
	 * @this {EventManagerThis_handler_ww_clipboard}
	 * @param {ClipboardEvent} e - Event object
	 */
	private constructor();
	__secopy: any;
}
export type EventManagerThis_handler_ww_clipboard = Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>;
