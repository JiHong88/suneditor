/**
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
	 * @type {EditorInstance['history']}
	 */
	this.history = editor.history;
	/**
	 * @description The events instance.
	 * @type {EditorInstance['events']}
	 */
	this.events = editor.events;
	/**
	 * @description The function to trigger an event.
	 * @type {EditorInstance['triggerEvent']}
	 */
	this.triggerEvent = editor.triggerEvent;
	/**
	 * @description The wrapper element for carrying elements.
	 * @type {EditorInstance['carrierWrapper']}
	 */
	this.carrierWrapper = editor.carrierWrapper;

	// environment variables
	/**
	 * @description The plugins used by the editor.
	 * @type {EditorInstance['plugins']}
	 */
	this.plugins = editor.plugins;
	/**
	 * @description The status of the editor.
	 * @type {EditorStatus}
	 */
	this.status = editor.status;
	/**
	 * @description The editor's context map.
	 * @type {EditorInstance['context']}
	 */
	this.context = editor.context;
	/**
	 * @description The editor's options map.
	 * @type {EditorInstance['options']}
	 */
	this.options = editor.options;
	/**
	 * @description The editor's icons.
	 * @type {EditorInstance['icons']}
	 */
	this.icons = editor.icons;
	/**
	 * @description The language settings.
	 * @type {EditorInstance['lang']}
	 */
	this.lang = editor.lang;
	/**
	 * @description editor.frameRoots map.
	 * @type {EditorInstance['frameRoots']}
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
	 * @type {EditorInstance['_shadowRoot']}
	 */
	this._shadowRoot = editor._shadowRoot;
}
