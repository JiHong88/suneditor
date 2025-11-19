import type {} from '../../typedef';
export default EventManager;
export type EventManagerThis = Omit<EventManager & Partial<SunEditor.Injector>, 'eventManager'>;
/**
 * @typedef {Omit<EventManager & Partial<SunEditor.Injector>, 'eventManager'>} EventManagerThis
 */
/**
 * @constructor
 * @this {EventManagerThis}
 * @description Event manager, editor's all event management class
 * @param {SunEditor.Core} editor - The root editor instance
 * @property {SunEditor.Core} editor - The root editor instance
 */
declare function EventManager(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, editor: SunEditor.Core): void;
declare class EventManager {
	/**
	 * @typedef {Omit<EventManager & Partial<SunEditor.Injector>, 'eventManager'>} EventManagerThis
	 */
	/**
	 * @constructor
	 * @this {EventManagerThis}
	 * @description Event manager, editor's all event management class
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @property {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	/**
	 * @description Old browsers: When there is no 'e.isComposing' in the keyup event
	 * @type {boolean}
	 */
	isComposing: boolean;
	/**
	 * @description An array of parent containers that can be scrolled (in descending order)
	 * @type {Array<Element>}
	 */
	scrollparents: Array<Element>;
	/** @type {Array<*>} */
	_events: Array<any>;
	/** @type {RegExp} */
	_onButtonsCheck: RegExp;
	/** @type {boolean} */
	_onShortcutKey: boolean;
	/** @type {boolean} */
	_handledInBefore: boolean;
	/** @type {number} */
	_balloonDelay: number;
	/** @type {ResizeObserver} */
	_wwFrameObserver: ResizeObserver;
	/** @type {ResizeObserver} */
	_toolbarObserver: ResizeObserver;
	/** @type {?Element} */
	_lineBreakComp: Element | null;
	/** @type {?Object<string, *>} */
	_formatAttrsTemp: {
		[x: string]: any;
	} | null;
	/** @type {number} */
	_resizeClientY: number;
	/** @type {?SunEditor.Event.GlobalInfo} */
	__resize_editor: SunEditor.Event.GlobalInfo | null;
	/** @type {?SunEditor.Event.GlobalInfo} */
	__close_move: SunEditor.Event.GlobalInfo | null;
	/** @type {?SunEditor.Event.GlobalInfo} */
	__geckoActiveEvent: SunEditor.Event.GlobalInfo | null;
	/** @type {Array<Node>} */
	__cacheStyleNodes: Array<Node>;
	/** @type {?SunEditor.Event.GlobalInfo} */
	__selectionSyncEvent: SunEditor.Event.GlobalInfo | null;
	/** @type {boolean} */
	_inputFocus: boolean;
	/** @type {?Object<string, *>} */
	__inputPlugin: {
		[x: string]: any;
	} | null;
	/** @type {?SunEditor.Event.Info=} */
	__inputBlurEvent: (SunEditor.Event.Info | null) | undefined;
	/** @type {?SunEditor.Event.Info=} */
	__inputKeyEvent: (SunEditor.Event.Info | null) | undefined;
	/** @type {HTMLInputElement} */
	__focusTemp: HTMLInputElement;
	/** @type {number|void} */
	__retainTimer: number | void;
	/** @type {Element} */
	__eventDoc: Element;
	/** @type {string} */
	__secopy: string;
	/**
	 * @this {EventManagerThis}
	 * @description Register for an event.
	 * - Only events registered with this method are unregistered or re-registered when methods such as 'setOptions', 'destroy' are called.
	 * @param {*} target Target element
	 * @param {string} type Event type
	 * @param {(...args: *) => *} listener Event handler
	 * @param {boolean|AddEventListenerOptions} [useCapture] Event useCapture option
	 * @return {?SunEditor.Event.Info} Registered event information
	 */
	addEvent(
		this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>,
		target: any,
		type: string,
		listener: (...args: any) => any,
		useCapture?: boolean | AddEventListenerOptions,
	): SunEditor.Event.Info | null;
	/**
	 * @this {EventManagerThis}
	 * @description Remove event
	 * @param {SunEditor.Event.Info} params event info = this.addEvent()
	 * @returns {undefined|null} Success: null, Not found: undefined
	 */
	removeEvent(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, params: SunEditor.Event.Info): undefined | null;
	/**
	 * @this {EventManagerThis}
	 * @description Add an event to document.
	 * - When created as an Iframe, the same event is added to the document in the Iframe.
	 * @param {string} type Event type
	 * @param {(...args: *) => *} listener Event listener
	 * @param {boolean|AddEventListenerOptions} [useCapture] Use event capture
	 * @return {SunEditor.Event.GlobalInfo} Registered event information
	 */
	addGlobalEvent(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, type: string, listener: (...args: any) => any, useCapture?: boolean | AddEventListenerOptions): SunEditor.Event.GlobalInfo;
	/**
	 * @this {EventManagerThis}
	 * @description Remove events from document.
	 * - When created as an Iframe, the event of the document inside the Iframe is also removed.
	 * @param {string|SunEditor.Event.GlobalInfo} type Event type or (Event info = this.addGlobalEvent())
	 * @param {(...args: *) => *} [listener] Event listener
	 * @param {boolean|AddEventListenerOptions} [useCapture] Use event capture
	 * @returns {undefined|null} Success: null, Not found: undefined
	 */
	removeGlobalEvent(
		this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>,
		type: string | SunEditor.Event.GlobalInfo,
		listener?: (...args: any) => any,
		useCapture?: boolean | AddEventListenerOptions,
	): undefined | null;
	/**
	 * @this {EventManagerThis}
	 * @description Activates the corresponding button with the tags information of the current cursor position,
	 * - such as 'bold', 'underline', etc., and executes the 'active' method of the plugins.
	 * @param {?Node} [selectionNode] selectionNode
	 * @returns {Node|undefined} selectionNode
	 */
	applyTagEffect(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, selectionNode?: Node | null): Node | undefined;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Gives an active effect when the mouse down event is blocked. (Used when "env.isGecko" is true)
	 * @param {Node} target Target element
	 * @private
	 */
	_injectActiveEvent(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, target: Node): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description remove class, display text.
	 * @param {Array<string>} ignoredList Igonred button list
	 * @private
	 */
	_setKeyEffect(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, ignoredList: Array<string>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Show toolbar-balloon with delay.
	 */
	_showToolbarBalloonDelay(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Show or hide the toolbar-balloon.
	 */
	_toggleToolbarBalloon(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Hide the toolbar.
	 */
	_hideToolbar(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Hide the Sub-Toolbar.
	 */
	_hideToolbar_sub(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Checks if a node is a non-focusable element(.data-se-non-focus). (e.g. fileUpload.component > span)
	 * @param {Node} node Node to check
	 * @returns {boolean} True if the node is non-focusable, otherwise false
	 */
	_isNonFocusNode(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, node: Node): boolean;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description If there is no default format, add a line and move 'selection'.
	 * @param {?string} formatName Format tag name (default: 'P')
	 */
	_setDefaultLine(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, formatName: string | null): any;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Handles data transfer actions for paste and drop events.
	 * - It processes clipboard data, triggers relevant events, and inserts cleaned data into the editor.
	 * @param {"paste"|"drop"} type The type of event
	 * @param {Event} e The original event object
	 * @param {DataTransfer} clipboardData The clipboard data object
	 * @param {SunEditor.FrameContext} frameContext The frame context
	 * @returns {Promise<boolean>} Resolves to `false` if processing is complete, otherwise allows default behavior
	 */
	_dataTransferAction(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, type: 'paste' | 'drop', e: Event, clipboardData: DataTransfer, frameContext: SunEditor.FrameContext): Promise<boolean>;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Processes clipboard data for paste and drop events, handling text and HTML cleanup.
	 * - Supports specific handling for content from Microsoft Office applications.
	 * @param {"paste"|"drop"} type The type of event
	 * @param {Event} e The original event object
	 * @param {DataTransfer} clipboardData The clipboard data object
	 * @param {SunEditor.FrameContext} frameContext The frame context
	 * @returns {Promise<boolean>} Resolves to `false` if processing is complete, otherwise allows default behavior
	 */
	_setClipboardData(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, type: 'paste' | 'drop', e: Event, clipboardData: DataTransfer, frameContext: SunEditor.FrameContext): Promise<boolean>;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Registers common UI events such as toolbar and menu interactions.
	 * - Adds event listeners for various UI elements, sets up observers, and configures window events.
	 */
	_addCommonEvents(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Registers event listeners for the editor's frame, including text input, selection, and UI interactions.
	 * - Handles events inside an iframe or within the standard wysiwyg editor.
	 * @param {SunEditor.FrameContext} fc The frame context object
	 */
	_addFrameEvents(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, fc: SunEditor.FrameContext): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Adds event listeners for resizing the status bar if resizing is enabled.
	 * - If resizing is not enabled, applies a non-resizable class.
	 * @param {SunEditor.FrameContext} fc The frame context object
	 * @param {SunEditor.FrameOptions} fo The frame options object
	 */
	__addStatusbarEvent(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, fc: SunEditor.FrameContext, fo: SunEditor.FrameOptions): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Removes all registered event listeners from the editor.
	 * - Disconnects observers and clears stored event references.
	 */
	_removeAllEvents(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Adjusts the position of the editor's toolbar, controllers, and other floating elements based on scroll position.
	 * - Ensures UI elements maintain their intended relative positions when scrolling.
	 * @param {*} eventWysiwyg The wysiwyg event object containing scroll data (Window or element)
	 */
	_moveContainer(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, eventWysiwyg: any): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Handles the scrolling of the editor container.
	 * - Repositions open controllers if necessary.
	 */
	_scrollContainer(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Repositions the currently open controllers within the editor.
	 * - Ensures elements are displayed in their correct positions after scrolling.
	 * @param {Array<object>} cont List of controllers to reposition
	 */
	__rePositionController(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, cont: Array<object>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Resets the frame status, adjusting toolbar and UI elements based on the current state.
	 * - Handles inline editor adjustments, fullscreen mode, and responsive toolbar updates.
	 */
	_resetFrameStatus(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Synchronizes the selection state by resetting it on mouseup.
	 * - Ensures selection updates correctly across different interactions.
	 */
	_setSelectionSync(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Retains the style nodes for formatting consistency when applying styles.
	 * - Preserves nested styling by cloning and restructuring the style nodes.
	 * @param {HTMLElement} formatEl The format element where styles should be retained
	 * @param {Array<Node>} _styleNodes The list of style nodes to retain
	 */
	_retainStyleNodes(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, formatEl: HTMLElement, _styleNodes: Array<Node>): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Clears retained style nodes by replacing content with a single line break.
	 * - Resets the selection to the start of the cleared element.
	 * @param {HTMLElement} formatEl The format element where styles should be cleared
	 */
	_clearRetainStyleNodes(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, formatEl: HTMLElement): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Calls a registered plugin event and executes associated handlers synchronously (fire-and-forget).
	 * - Use this for performance-critical events like onMouseMove, onScroll
	 * - If any handler returns `false`, the event propagation stops.
	 * @param {string} name The name of the plugin event
	 * @param {{ frameContext: SunEditor.FrameContext, event: Event, data?: string, line?: Node, range?: Range, file?: File, doc?: Document }} e The event object passed to the plugin event handler
	 * @returns {boolean|undefined} Returns `false` if any handler stops the event, otherwise `undefined`
	 */
	_callPluginEvent(
		this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>,
		name: string,
		e: {
			frameContext: SunEditor.FrameContext;
			event: Event;
			data?: string;
			line?: Node;
			range?: Range;
			file?: File;
			doc?: Document;
		},
	): boolean | undefined;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Calls a registered plugin event and executes associated handlers asynchronously.
	 * - Use this for events that need to check return values or ensure completion
	 * - Waits for each handler to complete (including async handlers)
	 * - If any handler returns `false`, the event propagation stops.
	 * @param {string} name The name of the plugin event
	 * @param {{ frameContext: SunEditor.FrameContext, event: Event, data?: string, line?: Node, range?: Range, file?: File, doc?: Document }} e The event object passed to the plugin event handler
	 * @returns {Promise<boolean|undefined>} Returns `false` if any handler stops the event, otherwise `undefined`
	 */
	_callPluginEventAsync(
		this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>,
		name: string,
		e: {
			frameContext: SunEditor.FrameContext;
			event: Event;
			data?: string;
			line?: Node;
			range?: Range;
			file?: File;
			doc?: Document;
		},
	): Promise<boolean | undefined>;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Handles the selection of a component when hovering over it.
	 * - If the target is a component, it ensures that the component is selected properly.
	 * @param {Element} target The element being hovered over
	 */
	_overComponentSelect(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, target: Element): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Removes input event listeners and resets input-related properties.
	 */
	__removeInput(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): void;
	/**
	 * @private
	 * @description Focus Event Postprocessing
	 * @this {EventManagerThis}
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 * @param {FocusEvent} event - Focus event object
	 */
	__postFocusEvent(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, frameContext: SunEditor.FrameContext, event: FocusEvent): void;
	/**
	 * @private
	 * @description Blur Event Postprocessing
	 * @this {EventManagerThis}
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 * @param {FocusEvent} event - Focus event object
	 */
	__postBlurEvent(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, frameContext: SunEditor.FrameContext, event: FocusEvent): void;
	/**
	 * @private
	 * @description Records the current viewport size.
	 * @this {EventManagerThis}
	 */
	__setViewportSize(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): void;
}
