/**
 * @private
 * @this {EventManagerThis_handler_ww_key_input}
 * @param {__se__FrameContext} fc - Frame context object
 * @param {InputEvent} e - Event object
 */
export function OnBeforeInput_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: __se__FrameContext, e: InputEvent): Promise<boolean>;
export class OnBeforeInput_wysiwyg {
	/**
	 * @private
	 * @this {EventManagerThis_handler_ww_key_input}
	 * @param {__se__FrameContext} fc - Frame context object
	 * @param {InputEvent} e - Event object
	 */
	private constructor();
	_handledInBefore: boolean;
}
/**
 * @private
 * @this {EventManagerThis_handler_ww_key_input}
 * @param {__se__FrameContext} fc - Frame context object
 * @param {InputEvent} e - Event object
 */
export function OnInput_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: __se__FrameContext, e: InputEvent): Promise<boolean>;
export class OnInput_wysiwyg {
	/**
	 * @private
	 * @this {EventManagerThis_handler_ww_key_input}
	 * @param {__se__FrameContext} fc - Frame context object
	 * @param {InputEvent} e - Event object
	 */
	private constructor();
	_handledInBefore: boolean;
}
/**
 * @private
 * @this {EventManagerThis_handler_ww_key_input}
 * @param {__se__FrameContext} fc - Frame context object
 * @param {KeyboardEvent} e - Event object
 */
export function OnKeyDown_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: __se__FrameContext, e: KeyboardEvent): Promise<boolean>;
export class OnKeyDown_wysiwyg {
	/**
	 * @private
	 * @this {EventManagerThis_handler_ww_key_input}
	 * @param {__se__FrameContext} fc - Frame context object
	 * @param {KeyboardEvent} e - Event object
	 */
	private constructor();
	isComposing: boolean;
	_onShortcutKey: boolean;
	_formatAttrsTemp: NamedNodeMap;
}
/**
 * @private
 * @this {EventManagerThis_handler_ww_key_input}
 * @param {__se__FrameContext} fc - Frame context object
 * @param {KeyboardEvent} e - Event object
 */
export function OnKeyUp_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: __se__FrameContext, e: KeyboardEvent): Promise<void>;
export class OnKeyUp_wysiwyg {
	/**
	 * @private
	 * @this {EventManagerThis_handler_ww_key_input}
	 * @param {__se__FrameContext} fc - Frame context object
	 * @param {KeyboardEvent} e - Event object
	 */
	private constructor();
	_formatAttrsTemp: any;
	__retainTimer: number | void;
}
export type EventManagerThis_handler_ww_key_input = Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>;
