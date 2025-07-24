/**
 * @description Add default properties to the editor core object.
 * @param {__se__EditorCore} editor - The root editor instance
 */
export default function CoreInjector(editor) {
	/**
	 * @description The root editor instance.
	 * @type {__se__EditorCore}
	 */
	this.editor = editor;

	// base
	/**
	 * @description The event manager instance.
	 * @type {__se__EditorCore['eventManager']}
	 */
	this.eventManager = editor.eventManager;
	/**
	 * @description The util/instanceCheck instance.
	 * @type {__se__EditorCore['instanceCheck']}
	 */
	this.instanceCheck = editor.instanceCheck;
	/**
	 * @description The history manager instance.
	 * @type {__se__EditorCore['history']}
	 */
	this.history = editor.history;
	/**
	 * @description The events instance.
	 * @type {__se__EditorCore['events']}
	 */
	this.events = editor.events;
	/**
	 * @description The function to trigger an event.
	 * @type {__se__EditorCore['triggerEvent']}
	 */
	this.triggerEvent = editor.triggerEvent;
	/**
	 * @description The wrapper element for carrying elements.
	 * @type {__se__EditorCore['carrierWrapper']}
	 */
	this.carrierWrapper = editor.carrierWrapper;

	// environment variables
	/**
	 * @description The plugins used by the editor.
	 * @type {__se__EditorCore['plugins']}
	 */
	this.plugins = editor.plugins;
	/**
	 * @description The status of the editor.
	 * @type {__se__EditorStatus}
	 */
	this.status = editor.status;
	/**
	 * @description The editor's [frame] context utility object.
	 * @type {__se__EditorCore['frameContext']}
	 */
	this.frameContext = editor.frameContext;
	/**
	 * @description The editor's [frame] options utility object.
	 * @type {__se__EditorCore['frameOptions']}
	 */
	this.frameOptions = editor.frameOptions;
	/**
	 * @description The editor's context utility object.
	 * @type {__se__EditorCore['context']}
	 */
	this.context = editor.context;
	/**
	 * @description The editor's options utility object.
	 * @type {__se__EditorCore['options']}
	 */
	this.options = editor.options;
	/**
	 * @description The editor's icons.
	 * @type {__se__EditorCore['icons']}
	 */
	this.icons = editor.icons;
	/**
	 * @description The language settings.
	 * @type {__se__EditorCore['lang']}
	 */
	this.lang = editor.lang;
	/**
	 * @description editor.frameRoots map.
	 * @type {__se__EditorCore['frameRoots']}
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
}
