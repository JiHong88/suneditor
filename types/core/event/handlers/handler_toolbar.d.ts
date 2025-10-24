import type {} from '../../../typedef';
/**
 * @typedef {Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>} EventManagerThis_handler_toolbar
 */
/**
 * @private
 * @this {EventManagerThis_handler_toolbar}
 * @param {MouseEvent} e - Event object
 */
export function ButtonsHandler(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, e: MouseEvent): void;
export class ButtonsHandler {
	/**
	 * @typedef {Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>} EventManagerThis_handler_toolbar
	 */
	/**
	 * @private
	 * @this {EventManagerThis_handler_toolbar}
	 * @param {MouseEvent} e - Event object
	 */
	private constructor();
	_inputFocus: boolean;
	__inputPlugin: {
		obj: any;
		target: HTMLInputElement;
		value: string;
	};
	__inputBlurEvent: SunEditor.EventInfo;
	__inputKeyEvent: SunEditor.EventInfo;
}
/**
 * @private
 * @this {EventManagerThis_handler_toolbar}
 * @param {MouseEvent} e - Event object
 */
export function OnClick_menuTray(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, e: MouseEvent): void;
/**
 * @private
 * @this {EventManagerThis_handler_toolbar}
 * @param {MouseEvent} e - Event object
 */
export function OnClick_toolbar(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, e: MouseEvent): void;
export type EventManagerThis_handler_toolbar = Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>;
