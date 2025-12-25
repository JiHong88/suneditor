import type {} from '../../typedef';
export default EventManager;
/**
 * @description Event manager, editor's all event management class
 */
declare class EventManager extends CoreInjector {
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
	/** @internal @type {boolean} */
	_onShortcutKey: boolean;
	/** @internal @type {boolean} */
	_handledInBefore: boolean;
	/** @internal @type {ResizeObserver} */
	_wwFrameObserver: ResizeObserver;
	/** @internal @type {ResizeObserver} */
	_toolbarObserver: ResizeObserver;
	/** @internal @type {?Element} */
	_lineBreakComp: Element | null;
	/** @internal @type {?Object<string, *>} */
	_formatAttrsTemp: {
		[x: string]: any;
	} | null;
	/** @internal @type {number} */
	_resizeClientY: number;
	/** @internal @type {Array<Node>} */
	__cacheStyleNodes: Array<Node>;
	/** @internal @type {boolean} */
	_inputFocus: boolean;
	/** @internal @type {?Object<string, *>} */
	__inputPlugin: {
		[x: string]: any;
	} | null;
	/** @internal @type {?SunEditor.Event.Info=} */
	__inputBlurEvent: (SunEditor.Event.Info | null) | undefined;
	/** @internal @type {?SunEditor.Event.Info=} */
	__inputKeyEvent: (SunEditor.Event.Info | null) | undefined;
	/** @type {HTMLInputElement} */
	__focusTemp: HTMLInputElement;
	/** @type {number|void} */
	__retainTimer: number | void;
	/** @type {Document} */
	__eventDoc: Document;
	/** @type {string} */
	__secopy: string;
	/** @internal @type {SunEditor.Core['char']} */
	get char(): SunEditor.Core['char'];
	/** @internal @type {SunEditor.Core['component']} */
	get component(): SunEditor.Core['component'];
	/** @internal @type {SunEditor.Core['format']} */
	get format(): SunEditor.Core['format'];
	/** @internal @type {SunEditor.Core['listFormat']} */
	get listFormat(): SunEditor.Core['listFormat'];
	/** @internal @type {SunEditor.Core['html']} */
	get html(): SunEditor.Core['html'];
	/** @internal @type {SunEditor.Core['inline']} */
	get inline(): SunEditor.Core['inline'];
	/** @internal @type {SunEditor.Core['menu']} */
	get menu(): SunEditor.Core['menu'];
	/** @internal @type {SunEditor.Core['nodeTransform']} */
	get nodeTransform(): SunEditor.Core['nodeTransform'];
	/** @internal @type {SunEditor.Core['offset']} */
	get offset(): SunEditor.Core['offset'];
	/** @internal @type {SunEditor.Core['selection']} */
	get selection(): SunEditor.Core['selection'];
	/** @internal @type {SunEditor.Core['shortcuts']} */
	get shortcuts(): SunEditor.Core['shortcuts'];
	/** @internal @type {SunEditor.Core['subToolbar']} */
	get subToolbar(): SunEditor.Core['subToolbar'];
	/** @internal @type {SunEditor.Core['toolbar']} */
	get toolbar(): SunEditor.Core['toolbar'];
	/** @internal @type {SunEditor.Core['ui']} */
	get ui(): SunEditor.Core['ui'];
	/** @internal @type {SunEditor.Core['viewer']} */
	get viewer(): SunEditor.Core['viewer'];
	/**
	 * @description Register for an event.
	 * - Only events registered with this method are unregistered or re-registered when methods such as 'setOptions', 'destroy' are called.
	 * @param {*} target Target element
	 * @param {string} type Event type
	 * @param {(...args: *) => *} listener Event handler
	 * @param {boolean|AddEventListenerOptions} [useCapture] Event useCapture option
	 * @return {?SunEditor.Event.Info} Registered event information
	 */
	addEvent(target: any, type: string, listener: (...args: any) => any, useCapture?: boolean | AddEventListenerOptions): SunEditor.Event.Info | null;
	/**
	 * @description Remove event
	 * @param {SunEditor.Event.Info} params event info = this.addEvent()
	 * @returns {undefined|null} Success: null, Not found: undefined
	 */
	removeEvent(params: SunEditor.Event.Info): undefined | null;
	/**
	 * @description Add an event to document.
	 * - When created as an Iframe, the same event is added to the document in the Iframe.
	 * @param {string} type Event type
	 * @param {(...args: *) => *} listener Event listener
	 * @param {boolean|AddEventListenerOptions} [useCapture] Use event capture
	 * @return {SunEditor.Event.GlobalInfo} Registered event information
	 */
	addGlobalEvent(type: string, listener: (...args: any) => any, useCapture?: boolean | AddEventListenerOptions): SunEditor.Event.GlobalInfo;
	/**
	 * @description Remove events from document.
	 * - When created as an Iframe, the event of the document inside the Iframe is also removed.
	 * @param {string|SunEditor.Event.GlobalInfo} type Event type or (Event info = this.addGlobalEvent())
	 * @param {(...args: *) => *} [listener] Event listener
	 * @param {boolean|AddEventListenerOptions} [useCapture] Use event capture
	 * @returns {undefined|null} Success: null, Not found: undefined
	 */
	removeGlobalEvent(type: string | SunEditor.Event.GlobalInfo, listener?: (...args: any) => any, useCapture?: boolean | AddEventListenerOptions): undefined | null;
	/**
	 * @description Activates the corresponding button with the tags information of the current cursor position,
	 * - such as 'bold', 'underline', etc., and executes the 'active' method of the plugins.
	 * @param {?Node} [selectionNode] selectionNode
	 * @returns {Node|undefined} selectionNode
	 */
	applyTagEffect(selectionNode?: Node | null): Node | undefined;
	/**
	 * @internal
	 * @description Gives an active effect when the mouse down event is blocked. (Used when "env.isGecko" is true)
	 * @param {Node} target Target element
	 */
	_injectActiveEvent(target: Node): void;
	/**
	 * @internal
	 * @description remove class, display text.
	 * @param {Array<string>} ignoredList Igonred button list
	 */
	_setKeyEffect(ignoredList: Array<string>): void;
	/**
	 * @internal
	 * @description Show toolbar-balloon with delay.
	 */
	_showToolbarBalloonDelay(): void;
	/**
	 * @internal
	 * @description Show or hide the toolbar-balloon.
	 */
	_toggleToolbarBalloon(): void;
	/**
	 * @internal
	 * @description Hide the toolbar.
	 */
	_hideToolbar(): void;
	/**
	 * @internal
	 * @description Hide the Sub-Toolbar.
	 */
	_hideToolbar_sub(): void;
	/**
	 * @internal
	 * @description If there is no default format, add a line and move 'selection'.
	 * @param {?string} formatName Format tag name (default: 'P')
	 */
	_setDefaultLine(formatName: string | null): any;
	/**
	 * @internal
	 * @description Handles data transfer actions for paste and drop events.
	 * - It processes clipboard data, triggers relevant events, and inserts cleaned data into the editor.
	 * @param {"paste"|"drop"} type The type of event
	 * @param {Event} e The original event object
	 * @param {DataTransfer} clipboardData The clipboard data object
	 * @param {SunEditor.FrameContext} frameContext The frame context
	 * @returns {Promise<boolean>} Resolves to `false` if processing is complete, otherwise allows default behavior
	 */
	_dataTransferAction(type: 'paste' | 'drop', e: Event, clipboardData: DataTransfer, frameContext: SunEditor.FrameContext): Promise<boolean>;
	/**
	 * @internal
	 * @description Registers common UI events such as toolbar and menu interactions.
	 * - Adds event listeners for various UI elements, sets up observers, and configures window events.
	 */
	_addCommonEvents(): void;
	/**
	 * @internal
	 * @description Registers event listeners for the editor's frame, including text input, selection, and UI interactions.
	 * - Handles events inside an iframe or within the standard wysiwyg editor.
	 * @param {SunEditor.FrameContext} fc The frame context object
	 */
	_addFrameEvents(fc: SunEditor.FrameContext): void;
	/**
	 * @internal
	 * @description Adds event listeners for resizing the status bar if resizing is enabled.
	 * - If resizing is not enabled, applies a non-resizable class.
	 * @param {SunEditor.FrameContext} fc The frame context object
	 * @param {SunEditor.FrameOptions} fo The frame options object
	 */
	__addStatusbarEvent(fc: SunEditor.FrameContext, fo: SunEditor.FrameOptions): void;
	/**
	 * @internal
	 * @description Removes all registered event listeners from the editor.
	 * - Disconnects observers and clears stored event references.
	 */
	_removeAllEvents(): void;
	/**
	 * @internal
	 * @description Synchronizes the selection state by resetting it on mouseup.
	 * - Ensures selection updates correctly across different interactions.
	 */
	_setSelectionSync(): void;
	/**
	 * @internal
	 * @description Retains the style nodes for formatting consistency when applying styles.
	 * - Preserves nested styling by cloning and restructuring the style nodes.
	 * @param {HTMLElement} formatEl The format element where styles should be retained
	 * @param {Array<Node>} _styleNodes The list of style nodes to retain
	 */
	_retainStyleNodes(formatEl: HTMLElement, _styleNodes: Array<Node>): void;
	/**
	 * @internal
	 * @description Clears retained style nodes by replacing content with a single line break.
	 * - Resets the selection to the start of the cleared element.
	 * @param {HTMLElement} formatEl The format element where styles should be cleared
	 */
	_clearRetainStyleNodes(formatEl: HTMLElement): void;
	/**
	 * @internal
	 * @description Calls a registered plugin event and executes associated handlers synchronously (fire-and-forget).
	 * - Use this for performance-critical events like onMouseMove, onScroll
	 * - If any handler returns `false`, the event propagation stops.
	 * @param {string} name The name of the plugin event
	 * @param {{ frameContext: SunEditor.FrameContext, event: Event, data?: string, line?: Node, range?: Range, file?: File, doc?: Document }} e The event object passed to the plugin event handler
	 * @returns {boolean|undefined} Returns `false` if any handler stops the event, otherwise `undefined`
	 */
	_callPluginEvent(
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
	 * @internal
	 * @description Calls a registered plugin event and executes associated handlers asynchronously.
	 * - Use this for events that need to check return values or ensure completion
	 * - Waits for each handler to complete (including async handlers)
	 * - If any handler returns `false`, the event propagation stops.
	 * @param {string} name The name of the plugin event
	 * @param {{ frameContext: SunEditor.FrameContext, event: Event, data?: string, line?: Node, range?: Range, file?: File, doc?: Document }} e The event object passed to the plugin event handler
	 * @returns {Promise<boolean|undefined>} Returns `false` if any handler stops the event, otherwise `undefined`
	 */
	_callPluginEventAsync(
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
	 * @internal
	 * @description Removes input event listeners and resets input-related properties.
	 */
	__removeInput(): void;
	/**
	 * @internal
	 * @description Focus Event Postprocessing
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 * @param {FocusEvent} event - Focus event object
	 */
	__postFocusEvent(frameContext: SunEditor.FrameContext, event: FocusEvent): void;
	/**
	 * @internal
	 * @description Blur Event Postprocessing
	 * @param {SunEditor.FrameContext} frameContext - frame context object
	 * @param {FocusEvent} event - Focus event object
	 */
	__postBlurEvent(frameContext: SunEditor.FrameContext, event: FocusEvent): void;
	/**
	 * @internal
	 * @description Records the current viewport size.
	 */
	__setViewportSize(): void;
	#private;
}
import CoreInjector from '../../editorInjector/_core';
