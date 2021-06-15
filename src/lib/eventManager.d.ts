export class eventManager {
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
}

export default eventManager;
