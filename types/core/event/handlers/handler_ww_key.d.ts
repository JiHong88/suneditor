import type {} from '../../../typedef';
/**
 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_ww_key_input
 */
/**
 * @this {EventManagerThis_handler_ww_key_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {KeyboardEvent} e - Event object
 */
export function OnKeyDown_wysiwyg(this: import('../eventOrchestrator').default, fc: SunEditor.FrameContext, e: KeyboardEvent): Promise<boolean>;
export class OnKeyDown_wysiwyg {
	/**
	 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_ww_key_input
	 */
	/**
	 * @this {EventManagerThis_handler_ww_key_input}
	 * @param {SunEditor.FrameContext} fc - Frame context object
	 * @param {KeyboardEvent} e - Event object
	 */
	constructor(this: import('../eventOrchestrator').default, fc: SunEditor.FrameContext, e: KeyboardEvent);
	isComposing: boolean;
	_onShortcutKey: boolean;
}
/**
 * @this {EventManagerThis_handler_ww_key_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {KeyboardEvent} e - Event object
 */
export function OnKeyUp_wysiwyg(this: import('../eventOrchestrator').default, fc: SunEditor.FrameContext, e: KeyboardEvent): Promise<void>;
export class OnKeyUp_wysiwyg {
	/**
	 * @this {EventManagerThis_handler_ww_key_input}
	 * @param {SunEditor.FrameContext} fc - Frame context object
	 * @param {KeyboardEvent} e - Event object
	 */
	constructor(this: import('../eventOrchestrator').default, fc: SunEditor.FrameContext, e: KeyboardEvent);
	_formatAttrsTemp: any;
	__retainTimer: number | void;
}
export type EventManagerThis_handler_ww_key_input = import('../eventOrchestrator').default;
