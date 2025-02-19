/**
 * @description Add default properties to the editor core object.
 * @param {EditorCore} editor - The root editor instance
 */
export default function CoreInjector(editor) {
	/**
	 * @description The root editor instance.
	 * @type {EditorCore}
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
	 * @type {EditorCore['history']}
	 */
	this.history = editor.history;
	/**
	 * @description The events instance.
	 * @type {EditorCore['events']}
	 */
	this.events = editor.events;
	/**
	 * @description The function to trigger an event.
	 * @type {EditorCore['triggerEvent']}
	 */
	this.triggerEvent = editor.triggerEvent;
	/**
	 * @description The wrapper element for carrying elements.
	 * @type {EditorCore['carrierWrapper']}
	 */
	this.carrierWrapper = editor.carrierWrapper;

	// environment variables
	/**
	 * @description The plugins used by the editor.
	 * @type {EditorCore['plugins']}
	 */
	this.plugins = editor.plugins;
	/**
	 * @description The status of the editor.
	 * @type {EditorStatus}
	 */
	this.status = editor.status;
	/**
	 * @description The editor's context map.
	 * @type {EditorCore['context']}
	 */
	this.context = editor.context;
	/**
	 * @description The editor's options map.
	 * @type {EditorCore['options']}
	 */
	this.options = editor.options;
	/**
	 * @description The editor's icons.
	 * @type {EditorCore['icons']}
	 */
	this.icons = editor.icons;
	/**
	 * @description The language settings.
	 * @type {EditorCore['lang']}
	 */
	this.lang = editor.lang;
	/**
	 * @description editor.frameRoots map.
	 * @type {EditorCore['frameRoots']}
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
	 * @type {EditorCore['_shadowRoot']}
	 */
	this._shadowRoot = editor._shadowRoot;
}
