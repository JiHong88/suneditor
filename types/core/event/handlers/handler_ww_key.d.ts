import type {} from '../../../typedef';
/**
 * @typedef {Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>} EventManagerThis_handler_ww_key_input
 */
/**
 * @this {EventManagerThis_handler_ww_key_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {KeyboardEvent} e - Event object
 */
export function OnKeyDown_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: SunEditor.FrameContext, e: KeyboardEvent): Promise<boolean>;
export class OnKeyDown_wysiwyg {
	/**
	 * @typedef {Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>} EventManagerThis_handler_ww_key_input
	 */
	/**
	 * @this {EventManagerThis_handler_ww_key_input}
	 * @param {SunEditor.FrameContext} fc - Frame context object
	 * @param {KeyboardEvent} e - Event object
	 */
	constructor(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: SunEditor.FrameContext, e: KeyboardEvent);
	isComposing: boolean;
	_onShortcutKey: boolean;
}
/**
 * @this {EventManagerThis_handler_ww_key_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {KeyboardEvent} e - Event object
 */
export function OnKeyUp_wysiwyg(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: SunEditor.FrameContext, e: KeyboardEvent): Promise<void>;
export class OnKeyUp_wysiwyg {
	/**
	 * @this {EventManagerThis_handler_ww_key_input}
	 * @param {SunEditor.FrameContext} fc - Frame context object
	 * @param {KeyboardEvent} e - Event object
	 */
	constructor(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, fc: SunEditor.FrameContext, e: KeyboardEvent);
	_formatAttrsTemp: any;
	__retainTimer: number | void;
}
export type EventManagerThis_handler_ww_key_input = Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>;
