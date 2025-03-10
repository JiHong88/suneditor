/**
 * @typedef {Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>} EventManagerThis
 */
/**
 * @private
 * @this {EventManagerThis}
 * @param {MouseEvent} e - Event object
 */
export function ButtonsHandler(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, e: MouseEvent): void;
export class ButtonsHandler {
	/**
	 * @typedef {Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>} EventManagerThis
	 */
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @param {MouseEvent} e - Event object
	 */
	private constructor();
	_inputFocus: boolean;
	__inputPlugin: {
		obj: any;
		target: HTMLInputElement;
		value: string;
	};
	__inputBlurEvent: __se__EventInfo;
	__inputKeyEvent: __se__EventInfo;
}
/**
 * @private
 * @this {EventManagerThis}
 * @param {MouseEvent} e - Event object
 */
export function OnClick_menuTray(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, e: MouseEvent): void;
/**
 * @private
 * @this {EventManagerThis}
 * @param {MouseEvent} e - Event object
 */
export function OnClick_toolbar(this: Omit<import('../eventManager').default & Partial<import('../../../editorInjector').default>, 'eventManager'>, e: MouseEvent): void;
export type EventManagerThis = Omit<import('../eventManager').default & Partial<__se__EditorInjector>, 'eventManager'>;
