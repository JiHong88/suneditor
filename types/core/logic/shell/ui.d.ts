import type {} from '../../../typedef';
export default UIManager;
/**
 * @description The UI class is a class that handles operations related to the user interface of SunEditor.
 * - This class sets the editor's style, theme, editor mode, etc., and controls the state of various UI elements.
 */
declare class UIManager {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	alertModal: HTMLElement;
	alertMessage: HTMLSpanElement;
	toastPopup: HTMLElement;
	toastContainer: Element;
	toastMessage: HTMLSpanElement;
	/**
	 * @description Whether "SelectMenu" is open
	 * @type {boolean}
	 */
	selectMenuOn: boolean;
	/**
	 * @description Currently open "Controller" info array
	 * @type {Array<SunEditor.Module.Controller.Info>}
	 */
	opendControllers: Array<SunEditor.Module.Controller.Info>;
	/**
	 * @description Controller target's frame div (editor.frameContext.get('topArea'))
	 * @type {?HTMLElement}
	 */
	controllerTargetContext: HTMLElement | null;
	/**
	 * @internal
	 * @description Current Figure container.
	 * @type {?HTMLElement}
	 */
	_figureContainer: HTMLElement | null;
	/**
	 * @description set editor frame styles.
	 * - Define the style of the edit area
	 * - It can also be defined with the "setOptions" method, but the "setEditorStyle" method does not render the editor again.
	 * @param {string} style Style string
	 * @param {?SunEditor.FrameContext} [fc] Frame context
	 */
	setEditorStyle(style: string, fc?: SunEditor.FrameContext | null): void;
	/**
	 * @description Set the theme to the editor
	 * @param {string} theme Theme name
	 */
	setTheme(theme: string): void;
	/**
	 * @description Set direction to "rtl" or "ltr".
	 * @param {string} dir "rtl" or "ltr"
	 */
	setDir(dir: string): void;
	/**
	 * @description Switch to or off "ReadOnly" mode.
	 * @param {boolean} value "readOnly" boolean value.
	 * @param {string} [rootKey] Root key
	 */
	readOnly(value: boolean, rootKey?: string): void;
	/**
	 * @description Disables the editor.
	 * @param {string} [rootKey] Root key
	 */
	disable(rootKey?: string): void;
	/**
	 * @description Enables the editor.
	 * @param {string} [rootKey] Root key
	 */
	enable(rootKey?: string): void;
	/**
	 * @description Shows the editor interface.
	 * @param {string} [rootKey] Root key
	 */
	show(rootKey?: string): void;
	/**
	 * @description Hides the editor interface.
	 * @param {string} [rootKey] Root key
	 */
	hide(rootKey?: string): void;
	/**
	 * @description Shows the loading spinner.
	 * @param {string} [rootKey] Root key
	 */
	showLoading(rootKey?: string): void;
	/**
	 * @description Hides the loading spinner.
	 * @param {string} [rootKey] Root key
	 */
	hideLoading(rootKey?: string): void;
	/**
	 * @description  Open the alert panel
	 * @param {string} text alert message
	 * @param {""|"error"|"success"} type alert type
	 */
	alertOpen(text: string, type: '' | 'error' | 'success'): void;
	/**
	 * @description  Close the alert panel
	 */
	alertClose(): void;
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
	 * @description This method disables or enables the toolbar buttons when the controller is activated or deactivated.
	 * - When the controller is activated, the toolbar buttons are disabled; when the controller is deactivated, the buttons are enabled.
	 * @param {boolean} active If `true`, the toolbar buttons will be disabled. If `false`, the toolbar buttons will be enabled.
	 * @returns {boolean} The current state of the controller on disabled buttons.
	 */
	setControllerOnDisabledButtons(active: boolean): boolean;
	/**
	 * @description Set the controller target context to the current top area.
	 */
	onControllerContext(): void;
	/**
	 * @description Reset the controller target context.
	 */
	offControllerContext(): void;
	/**
	 * @description Activate the transparent background "div" so that other elements are not affected during resizing.
	 * @param {string} cursor cursor css property
	 */
	enableBackWrapper(cursor: string): void;
	/**
	 * @description Disabled background "div"
	 */
	disableBackWrapper(): void;
	/**
	 * @description Closes the currently active controller by delegating to the component's deselect logic.
	 * Use this method to close a single active controller from external code.
	 * @see _offControllers - For closing all open controllers at once (internal use)
	 */
	offCurrentController(): void;
	/**
	 * @description Closes the currently open modal dialog.
	 */
	offCurrentModal(): void;
	/**
	 * @description Get the current figure container only if it is visible (active).
	 * @returns {?HTMLElement} The active figure element or null.
	 */
	getVisibleFigure(): HTMLElement | null;
	/**
	 * @description Set the active figure element (image, video) being resized.
	 * @param {?HTMLElement} figure
	 */
	setFigureContainer(figure: HTMLElement | null): void;
	preventToolbarHide(allow: any): void;
	get isPreventToolbarHide(): boolean;
	/**
	 * @param {SunEditor.FrameContext} rt Root target[key] FrameContext
	 */
	reset(rt: SunEditor.FrameContext): void;
	/**
	 * @internal
	 * @description Closes all open controllers except those marked as `fixed`.
	 * Iterates through `opendControllers`, calls `controllerClose()` on each non-fixed controller,
	 * hides their forms, and resets the controller state.
	 * @see offCurrentController - Public method for closing a single controller via component deselect
	 */
	_offControllers(): void;
	currentControllerName: string;
	/**
	 * @internal
	 * @description Synchronizes floating UI element positions with the current scroll offset.
	 * Called by eventManager when the wysiwyg area is scrolled.
	 * - Adjusts balloon toolbar position based on scroll offset
	 * - Closes controllers if scroll target changes
	 * - Updates line breaker positions
	 * @param {SunEditor.EventWysiwyg} eventWysiwyg - The scroll event source (Window or element with scroll data)
	 */
	_syncScrollPosition(eventWysiwyg: SunEditor.EventWysiwyg): void;
	/**
	 * @internal
	 * @description Repositions all currently open controllers after scroll.
	 * Called by eventManager during container scroll events.
	 * - Triggers drag handle repositioning if active
	 * - Calls _scrollReposition on each open controller
	 */
	_repositionControllers(): void;
	/**
	 * @internal
	 * @description visible controllers
	 * @param {boolean} value hidden/show
	 * @param {?boolean} [lineBreakShow] Line break hidden/show (default: Follows the value "value".)
	 */
	_visibleControllers(value: boolean, lineBreakShow?: boolean | null): void;
	setCurrentControllerContext: any;
	/**
	 * @internal
	 * @description Set the disabled button list
	 */
	_initToggleButtons(): void;
	/**
	 * @internal
	 * @description Toggle the disabled state of buttons reserved for Code View.
	 * @param {boolean} isCodeView
	 */
	_toggleCodeViewButtons(isCodeView: boolean): void;
	/**
	 * @internal
	 * @description Toggle the disabled state of buttons when a controller is active.
	 * @param {boolean} isOpen
	 */
	_toggleControllerButtons(isOpen: boolean): void;
	/**
	 * @description Check if the button can be executed in the current state (ReadOnly, etc.)
	 * @param {Node} button
	 * @returns {boolean}
	 */
	isButtonDisabled(button: Node): boolean;
	/**
	 * @internal
	 * @description Updates placeholder visibility based on editor state.
	 * Shows placeholder when editor is empty, hides it in code view or when content exists.
	 * @param {SunEditor.FrameContext} [fc] - Frame context (defaults to current frameContext)
	 */
	_updatePlaceholder(fc?: SunEditor.FrameContext): void;
	/**
	 * @internal
	 * @description Synchronizes frame UI state after content changes.
	 * Coordinates iframe height adjustment, placeholder visibility, and document type page sync.
	 * @param {SunEditor.FrameContext} fc - Frame context to synchronize
	 */
	_syncFrameState(fc: SunEditor.FrameContext): void;
	/**
	 * @internal
	 * @description Adjusts iframe height to match content height.
	 * Handles auto-height iframes and manages scrolling based on maxHeight option.
	 * @param {SunEditor.FrameContext} fc - Frame context containing the iframe
	 */
	_iframeAutoHeight(fc: SunEditor.FrameContext): void;
	/**
	 * @internal
	 * @description Emits the onResizeEditor event when editor height changes.
	 * Calculates height from ResizeObserverEntry if not provided directly.
	 * @param {SunEditor.FrameContext} fc - Frame context
	 * @param {number} h - Height value (-1 to calculate from resizeObserverEntry)
	 * @param {ResizeObserverEntry|null} resizeObserverEntry - ResizeObserver entry for height calculation
	 */
	_emitResizeEvent(fc: SunEditor.FrameContext, h: number, resizeObserverEntry: ResizeObserverEntry | null): void;
	init(): void;
	/**
	 * @internal
	 * @description Destroy the UI instance and release memory
	 */
	_destroy(): void;
	opendModal: any;
	opendBrowser: any;
	#private;
}
