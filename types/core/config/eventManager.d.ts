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
	constructor(contextProvider: import('./contextProvider').default, optionProvider: import('./optionProvider').default, $: import('../kernel/coreKernel').Deps);
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
	 * @description Register for an event.
	 * - Only events registered with this method are unregistered or re-registered when methods such as 'setOptions', 'destroy' are called.
	 * @param {*} target Target element
	 * @param {string} type Event type
	 * @param {EventListenerOrEventListenerObject} listener Event handler
	 * @param {boolean|AddEventListenerOptions} [useCapture] Event useCapture option
	 * @return {?SunEditor.Event.Info} Registered event information
	 */
	addEvent(target: any, type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean | AddEventListenerOptions): SunEditor.Event.Info | null;
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
	 * @returns {undefined|null} Success: `null`, Not found: `undefined`
	 */
	removeGlobalEvent(type: string | SunEditor.Event.GlobalInfo, listener?: (...args: any) => any, useCapture?: boolean | AddEventListenerOptions): undefined | null;
	/**
	 * @internal
	 * @description Gives an active effect when the mouse down event is blocked. (Used when "env.isGecko" is `true`)
	 * @param {Node} target Target element
	 */
	_injectActiveEvent(target: Node): void;
	_init(): void;
	#private;
}
