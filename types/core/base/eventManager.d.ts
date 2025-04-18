export default EventManager;
export type EventManagerThis = Omit<EventManager & Partial<__se__EditorInjector>, 'eventManager'>;
/**
 * @typedef {Omit<EventManager & Partial<__se__EditorInjector>, 'eventManager'>} EventManagerThis
 */
/**
 * @constructor
 * @this {EventManagerThis}
 * @description Event manager, editor's all event management class
 * @param {__se__EditorCore} editor - The root editor instance
 * @property {__se__EditorCore} editor - The root editor instance
 */
declare function EventManager(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, editor: __se__EditorCore): void;
declare class EventManager {
	/**
	 * @typedef {Omit<EventManager & Partial<__se__EditorInjector>, 'eventManager'>} EventManagerThis
	 */
	/**
	 * @constructor
	 * @this {EventManagerThis}
	 * @description Event manager, editor's all event management class
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @property {__se__EditorCore} editor - The root editor instance
	 */
	constructor(editor: __se__EditorCore);
	/**
	 * @description Old browsers: When there is no 'e.isComposing' in the keyup event
	 * @type {boolean}
	 */
	isComposing: boolean;
	/** @type {Array<*>} */
	_events: Array<any>;
	/** @type {RegExp} */
	_onButtonsCheck: RegExp;
	/** @type {boolean} */
	_onShortcutKey: boolean;
	/** @type {number} */
	_balloonDelay: number;
	/** @type {ResizeObserver} */
	_wwFrameObserver: ResizeObserver;
	/** @type {ResizeObserver} */
	_toolbarObserver: ResizeObserver;
	/** @type {Element|null} */
	_lineBreakComp: Element | null;
	/** @type {Object<string, *>|null} */
	_formatAttrsTemp: {
		[x: string]: any;
	} | null;
	/** @type {number} */
	_resizeClientY: number;
	/** @type {__se__GlobalEventInfo|null} */
	__resize_editor: __se__GlobalEventInfo | null;
	/** @type {__se__GlobalEventInfo|null} */
	__close_move: __se__GlobalEventInfo | null;
	/** @type {__se__GlobalEventInfo|null} */
	__geckoActiveEvent: __se__GlobalEventInfo | null;
	/** @type {Array<Element>} */
	__scrollparents: Array<Element>;
	/** @type {Array<Node>} */
	__cacheStyleNodes: Array<Node>;
	/** @type {__se__GlobalEventInfo|null} */
	__selectionSyncEvent: __se__GlobalEventInfo | null;
	/** @type {boolean} */
	_inputFocus: boolean;
	/** @type {Object<string, *>|null} */
	__inputPlugin: {
		[x: string]: any;
	} | null;
	/** @type {?__se__EventInfo=} */
	__inputBlurEvent: (__se__EventInfo | null) | undefined;
	/** @type {?__se__EventInfo=} */
	__inputKeyEvent: (__se__EventInfo | null) | undefined;
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
	 * @param {boolean|AddEventListenerOptions=} useCapture Event useCapture option
	 * @return {__se__EventInfo|null} Registered event information
	 */
	addEvent(
		this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>,
		target: any,
		type: string,
		listener: (...args: any) => any,
		useCapture?: (boolean | AddEventListenerOptions) | undefined
	): __se__EventInfo | null;
	/**
	 * @this {EventManagerThis}
	 * @description Remove event
	 * @param {__se__EventInfo} params event info = this.addEvent()
	 * @returns {undefined|null} Success: null, Not found: undefined
	 */
	removeEvent(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, params: __se__EventInfo): undefined | null;
	/**
	 * @this {EventManagerThis}
	 * @description Add an event to document.
	 * - When created as an Iframe, the same event is added to the document in the Iframe.
	 * @param {string} type Event type
	 * @param {(...args: *) => *} listener Event listener
	 * @param {boolean|AddEventListenerOptions=} useCapture Use event capture
	 * @return {__se__GlobalEventInfo} Registered event information
	 */
	addGlobalEvent(
		this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>,
		type: string,
		listener: (...args: any) => any,
		useCapture?: (boolean | AddEventListenerOptions) | undefined
	): __se__GlobalEventInfo;
	/**
	 * @this {EventManagerThis}
	 * @description Remove events from document.
	 * - When created as an Iframe, the event of the document inside the Iframe is also removed.
	 * @param {string|__se__GlobalEventInfo} type Event type or (Event info = this.addGlobalEvent())
	 * @param {(...args: *) => *=} listener Event listener
	 * @param {boolean|AddEventListenerOptions=} useCapture Use event capture
	 * @returns {undefined|null} Success: null, Not found: undefined
	 */
	removeGlobalEvent(
		this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>,
		type: string | __se__GlobalEventInfo,
		listener?: ((...args: any) => any) | undefined,
		useCapture?: (boolean | AddEventListenerOptions) | undefined
	): undefined | null;
	/**
	 * @this {EventManagerThis}
	 * @description Activates the corresponding button with the tags information of the current cursor position,
	 * - such as 'bold', 'underline', etc., and executes the 'active' method of the plugins.
	 * @param {?Node=} selectionNode selectionNode
	 * @returns {Node|undefined} selectionNode
	 */
	applyTagEffect(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, selectionNode?: (Node | null) | undefined): Node | undefined;
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
	 * @description Determines if the "range" is within an uneditable node.
	 * @param {Range} range The range object
	 * @param {boolean} isFront Whether to check the start or end of the range
	 * @returns {Node|null} The uneditable node if found, otherwise null
	 */
	_isUneditableNode(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, range: Range, isFront: boolean): Node | null;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Retrieves the sibling node of a selected node if it is uneditable.
	 * - Used only in `_isUneditableNode`.
	 * @param {Node} selectNode The selected node
	 * @param {string} siblingKey The key to access the sibling (`previousSibling` or `nextSibling`)
	 * @param {Node} container The parent container node
	 * @returns {Node|null} The sibling node if found, otherwise null
	 */
	_isUneditableNode_getSibling(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, selectNode: Node, siblingKey: string, container: Node): Node | null;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Deletes specific elements such as tables in "Firefox" and media elements (image, video, audio) in "Chrome".
	 * - Handles deletion logic based on selection range and node types.
	 * @returns {boolean} Returns `true` if an element was deleted and focus was adjusted, otherwise `false`.
	 */
	_hardDelete(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>): boolean;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description If there is no default format, add a line and move 'selection'.
	 * @param {string|null} formatName Format tag name (default: 'P')
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
	 * @param {__se__FrameContext} frameContext The frame context
	 * @returns {Promise<boolean>} Resolves to `false` if processing is complete, otherwise allows default behavior
	 */
	_dataTransferAction(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, type: 'paste' | 'drop', e: Event, clipboardData: DataTransfer, frameContext: __se__FrameContext): Promise<boolean>;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Processes clipboard data for paste and drop events, handling text and HTML cleanup.
	 * - Supports specific handling for content from Microsoft Office applications.
	 * @param {"paste"|"drop"} type The type of event
	 * @param {Event} e The original event object
	 * @param {DataTransfer} clipboardData The clipboard data object
	 * @param {__se__FrameContext} frameContext The frame context
	 * @returns {Promise<boolean>} Resolves to `false` if processing is complete, otherwise allows default behavior
	 */
	_setClipboardData(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, type: 'paste' | 'drop', e: Event, clipboardData: DataTransfer, frameContext: __se__FrameContext): Promise<boolean>;
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
	 * @param {__se__FrameContext} fc The frame context object
	 */
	_addFrameEvents(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, fc: __se__FrameContext): void;
	/**
	 * @private
	 * @this {EventManagerThis}
	 * @description Adds event listeners for resizing the status bar if resizing is enabled.
	 * - If resizing is not enabled, applies a non-resizable class.
	 * @param {__se__FrameContext} fc The frame context object
	 * @param {__se__FrameOptions} fo The frame options object
	 */
	__addStatusbarEvent(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, fc: __se__FrameContext, fo: __se__FrameOptions): void;
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
	 * @param {Element} eventWysiwyg The wysiwyg event object containing scroll data
	 */
	_moveContainer(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, eventWysiwyg: Element): void;
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
	 * @description Calls a registered plugin event and executes associated handlers.
	 * - If any handler returns `false`, the event propagation stops.
	 * @param {string} name The name of the plugin event
	 * @param {{ frameContext: __se__FrameContext, event: Event, data?: string, line?: Node, range?: Range, file?: File, doc?: Document }} e The event object passed to the plugin event handler
	 * @returns {boolean|undefined} Returns `false` if any handler stops the event, otherwise `undefined`
	 */
	_callPluginEvent(
		this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>,
		name: string,
		e: {
			frameContext: __se__FrameContext;
			event: Event;
			data?: string;
			line?: Node;
			range?: Range;
			file?: File;
			doc?: Document;
		}
	): boolean | undefined;
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
	 * @this {EventManagerThis}
	 * @description Prevents the default behavior of the Enter key and refocuses the editor.
	 * @param {Event} e The keyboard event
	 */
	__enterPrevent(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, e: Event): void;
	/**
	 * @private
	 * @description Scrolls the editor view to the caret position after pressing Enter. (Ignored on mobile devices)
	 * @this {EventManagerThis}
	 * @param {*} range Range object
	 */
	__enterScrollTo(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, range: any): void;
	/**
	 * @private
	 * @description Focus Event Postprocessing
	 * @this {EventManagerThis}
	 * @param {__se__FrameContext} frameContext - frame context object
	 * @param {Event} event - Event object
	 */
	__postFocusEvent(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, frameContext: __se__FrameContext, event: Event): void;
	/**
	 * @private
	 * @description Blur Event Postprocessing
	 * @this {EventManagerThis}
	 * @param {__se__FrameContext} frameContext - frame context object
	 * @param {Event} event - Event object
	 */
	__postBlurEvent(this: Omit<EventManager & Partial<import('../../editorInjector').default>, 'eventManager'>, frameContext: __se__FrameContext, event: Event): void;
}
