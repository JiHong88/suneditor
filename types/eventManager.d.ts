import EditorInterface from "../interface/editor";
class EventManager extends EditorInterface {
	/**
	 * @description Register for an event.
	 * Only events registered with this method are unregistered or re-registered when methods such as "setOptions", "destroy" are called. 
	 * @param target Target element
	 * @param type Event type
	 * @param handler Event handler
	 * @param useCapture Event useCapture option
	 */
	addEvent(target: Element, type: string, handler: Function, useCapture?: boolean): void;
	
	/**
	 * @description Add an event to document.
	 * When created as an Iframe, the same event is added to the document in the Iframe.
	 * @param type Event type
	 * @param listener Event listener
	 * @param useCapture Use event capture
	 */
	addGlobalEvent(type: string, listener: EventListener, useCapture: boolean): void;

	/**
	 * @description Remove events from document.
	 * When created as an Iframe, the event of the document inside the Iframe is also removed.
	 * @param type Event type
	 * @param listener Event listener
	 */
	removeGlobalEvent(type: string, listener: EventListener): void;

	/**
	 * @description Activates the corresponding button with the tags information of the current cursor position, 
	 * such as "bold", "underline", etc., and executes the "active" method of the plugins.  
	 */
	applyTagEffect(): void;
}

export default EventManager;
