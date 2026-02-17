/**
 * @fileoverview eventManager class
 */

import { dom, numbers, env } from '../../helper';
import { _DragHandle } from '../../modules/ui';

const { _w, _d, NO_EVENT } = env;

/**
 * @description Event manager, editor's all event management class
 */
class EventManager {
	#$;
	#frameContext;
	#frameOptions;

	/** @type {?SunEditor.Event.GlobalInfo} */
	#geckoActiveEvent = null;

	/** @type {Array<*>} */
	#events = [];

	/**
	 * @constructor
	 * @param {import('./contextProvider').default} contextProvider
	 * @param {import('./optionProvider').default} optionProvider
	 * @param {import('../kernel/coreKernel').Deps} $
	 */
	constructor(contextProvider, optionProvider, $) {
		this.#$ = $;
		this.#frameContext = contextProvider.frameContext;
		this.#frameOptions = optionProvider.frameOptions;

		/**
		 * @description Events object, call by triggerEvent function
		 * @type {SunEditor.Event.Handlers}
		 */
		this.events = optionProvider.options.get('events') || {};

		/**
		 * @description Call the event function by injecting self: this.
		 * @type {(eventName: string, ...args: *) => Promise<*>}
		 */
		this.triggerEvent = async (eventName, eventData) => {
			// [iframe] wysiwyg is disabled, the event is not called.
			if (dom.check.isNonEditable(eventData?.frameContext?.get('wysiwyg'))) return false;

			const eventHandler = this.events[eventName];
			if (typeof eventHandler === 'function') {
				try {
					return await eventHandler({ $: this.#$, ...eventData });
				} catch (error) {
					console.error(`[SUNEDITOR.triggerEvent.${eventName}]`, error);
					return false;
				}
			}

			return NO_EVENT;
		};

		/** @type {HTMLInputElement} */
		this.__focusTemp = contextProvider.carrierWrapper.querySelector('.__se__focus__temp__');
	}

	/**
	 * @description Register for an event.
	 * - Only events registered with this method are unregistered or re-registered when methods such as 'setOptions', 'destroy' are called.
	 * @param {*} target Target element
	 * @param {string} type Event type
	 * @param {EventListenerOrEventListenerObject} listener Event handler
	 * @param {boolean|AddEventListenerOptions} [useCapture] Event useCapture option
	 * @return {?SunEditor.Event.Info} Registered event information
	 */
	addEvent(target, type, listener, useCapture) {
		if (!target) return null;
		if (target === _w || target === _d || typeof target.length !== 'number' || target.nodeType || (!Array.isArray(target) && target.length < 1)) target = [target];
		if (target.length === 0) return null;

		const len = target.length;
		for (let i = 0; i < len; i++) {
			target[i].addEventListener(type, listener, useCapture);
			this.#events.push({
				target: target[i],
				type,
				listener,
				useCapture,
			});
		}

		return {
			target: len > 1 ? target : target[0],
			type,
			listener,
			useCapture,
		};
	}

	/**
	 * @description Remove event
	 * @param {SunEditor.Event.Info} params event info = this.addEvent()
	 * @returns {undefined|null} Success: null, Not found: undefined
	 */
	removeEvent(params) {
		if (!params) return;

		let target = params.target;
		const type = params.type;
		const listener = params.listener;
		const useCapture = params.useCapture;

		if (!target) return;
		if (!numbers.is(target.length) || target.nodeName || (!Array.isArray(target) && target.length < 1)) target = /** @type {Array<Element>} */ ([target]);
		if (target.length === 0) return;

		for (let i = 0, len = target.length; i < len; i++) {
			target[i].removeEventListener(type, listener, useCapture);
		}

		return null;
	}

	/**
	 * @description Add an event to document.
	 * - When created as an Iframe, the same event is added to the document in the Iframe.
	 * @param {string} type Event type
	 * @param {(...args: *) => *} listener Event listener
	 * @param {boolean|AddEventListenerOptions} [useCapture] Use event capture
	 * @return {SunEditor.Event.GlobalInfo} Registered event information
	 */
	addGlobalEvent(type, listener, useCapture) {
		if (this.#frameOptions.get('iframe')) {
			this.#frameContext.get('_ww').addEventListener(type, listener, useCapture);
		}
		_w.addEventListener(type, listener, useCapture);
		return {
			type,
			listener,
			useCapture,
		};
	}

	/**
	 * @description Remove events from document.
	 * - When created as an Iframe, the event of the document inside the Iframe is also removed.
	 * @param {string|SunEditor.Event.GlobalInfo} type Event type or (Event info = this.addGlobalEvent())
	 * @param {(...args: *) => *} [listener] Event listener
	 * @param {boolean|AddEventListenerOptions} [useCapture] Use event capture
	 * @returns {undefined|null} Success: null, Not found: undefined
	 */
	removeGlobalEvent(type, listener, useCapture) {
		if (!type) return;

		if (typeof type === 'object') {
			listener = type.listener;
			useCapture = type.useCapture;
			type = type.type;
		}
		if (this.#frameOptions.get('iframe')) {
			this.#frameContext.get('_ww').removeEventListener(type, listener, useCapture);
		}
		_w.removeEventListener(type, listener, useCapture);

		return null;
	}

	/**
	 * @internal
	 * @description Gives an active effect when the mouse down event is blocked. (Used when "env.isGecko" is true)
	 * @param {Node} target Target element
	 */
	_injectActiveEvent(target) {
		dom.utils.addClass(target, '__se__active');
		this.#geckoActiveEvent = this.addGlobalEvent('mouseup', () => {
			dom.utils.removeClass(target, '__se__active');
			this.#geckoActiveEvent = this.removeGlobalEvent(this.#geckoActiveEvent);
		});
	}

	_init() {
		for (let i = 0, len = this.#events.length, e; i < len; i++) {
			e = this.#events[i];
			e.target.removeEventListener(e.type, e.listener, e.useCapture);
		}

		this.#events = null;

		this.#geckoActiveEvent &&= this.removeGlobalEvent(this.#geckoActiveEvent);
	}
}

export default EventManager;
