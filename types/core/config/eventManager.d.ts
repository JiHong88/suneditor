import type {} from '../../typedef';
export default EventManager;
/**
 * @description Event manager, editor's all event management class
 */
declare class EventManager {
	/**
	 * @constructor
	 * @param {import('./contextProvider').default} contextProvider
	 * @param {import('./optionProvider').default} optionProvider
	 * @param {import('../kernel/coreKernel').Deps} $
	 */
	constructor(
		contextProvider: import('./contextProvider').default,
		optionProvider: import('./optionProvider').default,
		$: import('../kernel/coreKernel').Deps,
	);
	/**
	 * @description Events object, call by triggerEvent function
	 * @type {SunEditor.Event.Handlers}
	 */
	events: SunEditor.Event.Handlers;
	/**
	 * @description Call the event function by injecting self: this.
	 * @type {(eventName: string, ...args: *) => Promise<*>}
	 */
	triggerEvent: (eventName: string, ...args: any) => Promise<any>;
	/**
	 * @internal
	 * @description Bind the EventOrchestrator once it is constructed. Invoked by `coreKernel`
	 * immediately after orchestrator creation so the public `applyTagEffect` method below can delegate.
	 * @param {import('../event/eventOrchestrator').default} orchestrator
	 */
	_bindOrchestrator(orchestrator: import('../event/eventOrchestrator').default): void;
	/**
	 * @description Re-run the toolbar/menu active-state pass against the given selection node (or the
	 * current selection if `null`). Thin pass-through to {@link EventOrchestrator#applyTagEffect};
	 * exposed on `$.eventManager` so modules/plugins can request an immediate sync after they mutate
	 * `commandDispatcher.targets` (e.g. CommandMenu pushing newly-rendered rows).
	 * @param {?Node} [selectionNode]
	 * @returns {Node | undefined}
	 */
	applyTagEffect(selectionNode?: Node | null): Node | undefined;
	/**
	 * @description Register for an event.
	 * - Only events registered with this method are unregistered or re-registered when methods such as 'setOptions', 'destroy' are called.
	 * @param {*} target Target element
	 * @param {string} type Event type
	 * @param {*} listener Event handler
	 * @param {boolean|AddEventListenerOptions} [useCapture] Event useCapture option
	 * @return {?SunEditor.Event.Info} Registered event information
	 */
	addEvent(
		target: any,
		type: string,
		listener: any,
		useCapture?: boolean | AddEventListenerOptions,
	): SunEditor.Event.Info | null;
	/**
	 * @description Remove event
	 * @param {SunEditor.Event.Info} params event info = this.addEvent()
	 * @returns {undefined|null} Success: `null`, Not found: `undefined`
	 */
	removeEvent(params: SunEditor.Event.Info): undefined | null;
	/**
	 * @description Add an event to document.
	 * - When created as an Iframe, the same event is added to the document in the Iframe.
	 * @param {string} type Event type
	 * @param {*} listener Event listener
	 * @param {boolean|AddEventListenerOptions} [useCapture] Use event capture
	 * @return {SunEditor.Event.GlobalInfo} Registered event information
	 */
	addGlobalEvent(
		type: string,
		listener: any,
		useCapture?: boolean | AddEventListenerOptions,
	): SunEditor.Event.GlobalInfo;
	/**
	 * @description Remove events from document.
	 * - When created as an Iframe, the event of the document inside the Iframe is also removed.
	 * @param {string|SunEditor.Event.GlobalInfo} type Event type or (Event info = this.addGlobalEvent())
	 * @param {*} [listener] Event listener
	 * @param {boolean|AddEventListenerOptions} [useCapture] Use event capture
	 * @returns {undefined|null} Success: `null`, Not found: `undefined`
	 */
	removeGlobalEvent(
		type: string | SunEditor.Event.GlobalInfo,
		listener?: any,
		useCapture?: boolean | AddEventListenerOptions,
	): undefined | null;
	/**
	 * @internal
	 * @description Gives an active effect when the mouse down event is blocked. (Used when "env.isGecko" is `true`)
	 * @param {Node} target Target element
	 */
	_injectActiveEvent(target: Node): void;
	_init(): void;
	#private;
}
