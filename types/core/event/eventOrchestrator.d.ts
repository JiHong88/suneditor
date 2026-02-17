import type {} from '../../typedef';
export default EventOrchestrator;
/**
 * @description Event orchestrator
 */
declare class EventOrchestrator extends KernelInjector {
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
	defaultLineManager: DefaultLineManager;
	selectionState: SelectionState;
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
	__onDownEv: any;
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
	/** @type {number|void} */
	__retainTimer: number | void;
	/** @type {Document} */
	__eventDoc: Document;
	/** @type {string} */
	__secopy: string;
	/**
	 * @description Activates the corresponding button with the tags information of the current cursor position,
	 * - such as 'bold', 'underline', etc., and executes the 'active' method of the plugins.
	 * @param {?Node} [selectionNode] selectionNode
	 * @returns {Node|undefined} selectionNode
	 */
	applyTagEffect(selectionNode?: Node | null): Node | undefined;
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
	_setDefaultLine(formatName: string | null): void;
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
	__focusTemp: any;
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
	 * @description Calls a registered plugin event synchronously.
	 * @param {string} name The name of the plugin event
	 * @param {SunEditor.EventParams.PluginEvent} e The event payload
	 * @returns {boolean|undefined} Returns `false` if any handler stops the event
	 */
	_callPluginEvent(name: string, e: SunEditor.EventParams.PluginEvent): boolean | undefined;
	/**
	 * @internal
	 * @description Calls a registered plugin event asynchronously.
	 * @param {string} name The name of the plugin event
	 * @param {SunEditor.EventParams.PluginEvent} e The event payload
	 * @returns {Promise<boolean|undefined>} Returns `false` if any handler stops the event
	 */
	_callPluginEventAsync(name: string, e: SunEditor.EventParams.PluginEvent): Promise<boolean | undefined>;
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
import DefaultLineManager from '../event/support/defaultLineManager';
import SelectionState from '../event/support/selectionState';
import KernelInjector from '../kernel/kernelInjector';
