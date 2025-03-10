/**
 * @typedef {Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>} EventManagerThis
 */
/**
 * @private
 * @this {EventManagerThis}
 * @param {ClipboardEvent} e - Event object
 */
export function OnPaste_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, frameContext: any, e: ClipboardEvent): true | Promise<boolean>;
/**
 * @private
 * @this {EventManagerThis}
 * @param {ClipboardEvent} e - Event object
 */
export function OnCopy_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, frameContext: any, e: ClipboardEvent): Promise<boolean>;
export class OnCopy_wysiwyg {
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @param {ClipboardEvent} e - Event object
	 */
	private constructor();
	__secopy: any;
}
/**
 * @private
 * @this {EventManagerThis}
 * @param {ClipboardEvent} e - Event object
 */
export function OnCut_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, frameContext: any, e: ClipboardEvent): Promise<boolean>;
export class OnCut_wysiwyg {
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @param {ClipboardEvent} e - Event object
	 */
	private constructor();
	__secopy: any;
}
export type EventManagerThis = Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>;
