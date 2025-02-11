/**
 * @typedef {import('../core/editor').default} EditorInstance
 */

/**
 * @typedef {import('../core/editor').EditorStatus} EditorStatus
 */

/**
 * @typedef {import('../core/section/context').Context} Context
 */

/**
 * @typedef {import('../core/section/context').FrameContext} FrameContext
 */

/**
 * @constructor
 * @description Add default properties to the editor core object.
 * @param {EditorInstance} editor - The root editor instance
 */
export default function CoreInjector(editor) {
	/**
	 * @description The root editor instance.
	 * @type {EditorInstance}
	 */
	this.editor = editor;

	// base
	/**
	 * @description The event manager instance.
	 * @type {import('../core/base/eventManager').default}
	 */
	this.eventManager = editor.eventManager;
	/**
	 * @description The history manager instance.
	 * @type {import('../core/base/history').default}
	 */
	this.history = editor.history;
	/**
	 * @description The events instance.
	 * @type {import('../core/base/events').default}
	 */
	this.events = editor.events;
	/**
	 * @description The function to trigger an event.
	 * @type {(eventName: string, ...args: *) => *}
	 */
	this.triggerEvent = editor.triggerEvent;
	/**
	 * @description The wrapper element for carrying elements.
	 * @type {HTMLElement}
	 */
	this.carrierWrapper = editor.carrierWrapper;

	// environment variables
	/**
	 * @description The plugins used by the editor.
	 * @type {Object.<string, *>}
	 */
	this.plugins = editor.plugins;
	/**
	 * @description The status of the editor.
	 * @type {EditorStatus}
	 */
	this.status = editor.status;
	/**
	 * @description The editor's context object.
	 * @type {Context}
	 */
	this.context = editor.context;
	/**
	 * @description The editor's options object.
	 * @type {Object.<string, *>}
	 */
	this.options = editor.options;
	/**
	 * @description The editor's icons.
	 * @type {Object.<string, string>}
	 */
	this.icons = editor.icons;
	/**
	 * @description The language settings.
	 * @type {Object.<string, string>}
	 */
	this.lang = editor.lang;
	/**
	 * @description editor.frameRoots map.
	 * @type {Map<string, FrameContext>}
	 */
	this.frameRoots = editor.frameRoots;

	// window, document, shadowRoot
	/**
	 * @description The window object.
	 * @type {Window}
	 */
	this._w = editor._w;
	/**
	 * @description The document object.
	 * @type {Document}
	 */
	this._d = editor._d;
	/**
	 * @description The shadow root object (if any).
	 * @type {ShadowRoot|null}
	 */
	this._shadowRoot = editor._shadowRoot;
}
