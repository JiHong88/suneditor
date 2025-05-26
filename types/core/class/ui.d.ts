export default UI;
export type UIThis = Omit<UI & Partial<__se__EditorInjector>, 'ui'>;
/**
 * @typedef {Omit<UI & Partial<__se__EditorInjector>, 'ui'>} UIThis
 */
/**
 * @constructor
 * @this {UIThis}
 * @description The UI class is a class that handles operations related to the user interface of SunEditor.
 * - This class sets the editor's style, theme, editor mode, etc., and controls the state of various UI elements.
 * @param {__se__EditorCore} editor - The root editor instance
 */
declare function UI(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, editor: __se__EditorCore): void;
declare class UI {
	/**
	 * @typedef {Omit<UI & Partial<__se__EditorInjector>, 'ui'>} UIThis
	 */
	/**
	 * @constructor
	 * @this {UIThis}
	 * @description The UI class is a class that handles operations related to the user interface of SunEditor.
	 * - This class sets the editor's style, theme, editor mode, etc., and controls the state of various UI elements.
	 * @param {__se__EditorCore} editor - The root editor instance
	 */
	constructor(editor: __se__EditorCore);
	_controllerOnBtnDisabled: boolean;
	alertModal: HTMLElement;
	alertMessage: HTMLSpanElement;
	_alertArea: HTMLElement;
	_alertInner: HTMLElement;
	_closeListener: any[];
	_closeSignal: boolean;
	_bindClose: any;
	_backWrapper: HTMLElement;
	toastPopup: HTMLElement;
	toastContainer: Element;
	toastMessage: HTMLSpanElement;
	_toastToggle: number;
	/**
	 * @this {UIThis}
	 * @description set editor frame styles.
	 * - Define the style of the edit area
	 * - It can also be defined with the "setOptions" method, but the "setEditorStyle" method does not render the editor again.
	 * @param {string} style Style string
	 * @param {__se__FrameContext|null} fc Frame context
	 */
	setEditorStyle(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, style: string, fc: __se__FrameContext | null): void;
	/**
	 * @this {UIThis}
	 * @description Set the theme to the editor
	 * @param {string} theme Theme name
	 */
	setTheme(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, theme: string): void;
	/**
	 * @this {UIThis}
	 * @description Switch to or off "ReadOnly" mode.
	 * @param {boolean} value "readOnly" boolean value.
	 * @param {string|undefined} rootKey Root key
	 */
	readOnly(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, value: boolean, rootKey: string | undefined): void;
	/**
	 * @this {UIThis}
	 * @description Disable the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	disable(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, rootKey: string | undefined): void;
	/**
	 * @this {UIThis}
	 * @description Enable the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	enable(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, rootKey: string | undefined): void;
	/**
	 * @this {UIThis}
	 * @description Show the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	show(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, rootKey: string | undefined): void;
	/**
	 * @this {UIThis}
	 * @description Hide the suneditor
	 * @param {string|undefined} rootKey Root key
	 */
	hide(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, rootKey: string | undefined): void;
	/**
	 * @this {UIThis}
	 * @description Show loading box
	 * @param {string=} rootKey Root key
	 */
	showLoading(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, rootKey?: string | undefined): void;
	/**
	 * @this {UIThis}
	 * @description Hide loading box
	 * @param {string=} rootKey Root key
	 */
	hideLoading(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, rootKey?: string | undefined): void;
	/**
	 * @this {UIThis}
	 * @description This method disables or enables the toolbar buttons when the controller is activated or deactivated.
	 * - When the controller is activated, the toolbar buttons are disabled; when the controller is deactivated, the buttons are enabled.
	 * @param {boolean} active If `true`, the toolbar buttons will be disabled. If `false`, the toolbar buttons will be enabled.
	 */
	setControllerOnDisabledButtons(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, active: boolean): void;
	/**
	 * @this {UIThis}
	 * @description Activate the transparent background "div" so that other elements are not affected during resizing.
	 * @param {string} cursor cursor css property
	 */
	enableBackWrapper(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, cursor: string): void;
	/**
	 * @this {UIThis}
	 * @description Disabled background "div"
	 */
	disableBackWrapper(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>): void;
	/**
	 * @this {UIThis}
	 * @description  Open the alert panel
	 * @param {string} text alert message
	 * @param {""|"error"|"success"} type alert type
	 */
	alertOpen(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, text: string, type: '' | 'error' | 'success'): void;
	/**
	 * @this {UIThis}
	 * @description  Close the alert panel
	 */
	alertClose(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>): void;
	/**
	 * @description Show toast
	 * @param {string} message toast message
	 * @param {number} [duration=1000] duration time(ms)
	 * @param {""|"error"|"success"} [type=""] duration time(ms)
	 */
	showToast(message: string, duration?: number, type?: '' | 'error' | 'success'): void;
	/**
	 * @description Close toast
	 */
	closeToast(): void;
	/**
	 * @private
	 * @this {UIThis}
	 * @description visible controllers
	 * @param {boolean} value hidden/show
	 * @param {?boolean=} lineBreakShow Line break hidden/show (default: Follows the value "value".)
	 */
	_visibleControllers(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>, value: boolean, lineBreakShow?: (boolean | null) | undefined): void;
	/**
	 * @private
	 * @this {UIThis}
	 * @description Off current controllers
	 */
	_offCurrentController(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>): void;
	/**
	 * @private
	 * @this {UIThis}
	 * @description Off controllers
	 */
	__offControllers(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>): void;
	/**
	 * @private
	 * @this {UIThis}
	 * @description Off current modal
	 */
	_offCurrentModal(this: Omit<UI & Partial<import('../../editorInjector').default>, 'ui'>): void;
}
