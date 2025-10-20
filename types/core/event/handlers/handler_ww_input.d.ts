import type {} from '../../../typedef';
/**
 * @typedef {Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>} EventManagerThis_handler_ww_input
 */
/**
 * @private
 * @this {EventManagerThis_handler_ww_input}
 * @param {__se__FrameContext} fc - Frame context object
 * @param {InputEvent} e - Event object
 */
export function OnBeforeInput_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: __se__FrameContext, e: InputEvent): Promise<boolean>;
export class OnBeforeInput_wysiwyg {
	/**
	 * @typedef {Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>} EventManagerThis_handler_ww_input
	 */
	/**
	 * @private
	 * @this {EventManagerThis_handler_ww_input}
	 * @param {__se__FrameContext} fc - Frame context object
	 * @param {InputEvent} e - Event object
	 */
	private constructor();
	_handledInBefore: boolean;
}
/**
 * @private
 * @this {EventManagerThis_handler_ww_input}
 * @param {__se__FrameContext} fc - Frame context object
 * @param {InputEvent} e - Event object
 */
export function OnInput_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: __se__FrameContext, e: InputEvent): Promise<boolean>;
export class OnInput_wysiwyg {
	/**
	 * @private
	 * @this {EventManagerThis_handler_ww_input}
	 * @param {__se__FrameContext} fc - Frame context object
	 * @param {InputEvent} e - Event object
	 */
	private constructor();
	_handledInBefore: boolean;
}
export type EventManagerThis_handler_ww_input = Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>;
