import type {} from '../../../typedef';
/**
 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_toolbar
 */
/**
 * @this {EventManagerThis_handler_toolbar}
 * @param {MouseEvent} e - Event object
 */
export function ButtonsHandler(this: import('../eventOrchestrator').default, e: MouseEvent): void;
export class ButtonsHandler {
	/**
	 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_toolbar
	 */
	/**
	 * @this {EventManagerThis_handler_toolbar}
	 * @param {MouseEvent} e - Event object
	 */
	constructor(this: import('../eventOrchestrator').default, e: MouseEvent);
	_inputFocus: boolean;
	__inputPlugin: {
		obj: any;
		target: HTMLInputElement;
		value: string;
	};
	__inputBlurEvent: SunEditor.Event.Info;
	__inputKeyEvent: SunEditor.Event.Info;
}
/**
 * @this {EventManagerThis_handler_toolbar}
 * @param {MouseEvent} e - Event object
 */
export function OnClick_menuTray(this: import('../eventOrchestrator').default, e: MouseEvent): void;
/**
 * @this {EventManagerThis_handler_toolbar}
 * @param {MouseEvent} e - Event object
 */
export function OnClick_toolbar(this: import('../eventOrchestrator').default, e: MouseEvent): void;
export type EventManagerThis_handler_toolbar = import('../eventOrchestrator').default;
