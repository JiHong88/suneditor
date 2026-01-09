/**
 * @description Add default properties to the editor core object.
 * @param {SunEditor.Core} editor - The root editor instance
 */
export default function CoreInjector(editor) {
	/**
	 * @description The root editor instance.
	 * @type {SunEditor.Core}
	 */
	this.editor = editor;

	// services
	/**
	 * @description The context manager instance.
	 * @type {SunEditor.Core['contextManager']}
	 */
	this.contextManager = editor.contextManager;
	/**
	 * @description The instanceCheck instance.
	 * @type {SunEditor.Core['instanceCheck']}
	 */
	this.instanceCheck = editor.instanceCheck;
	/**
	 * @description The plugin manager instance
	 * @type {SunEditor.Core['pluginManager']}
	 */
	this.pluginManager = editor.pluginManager;
	/**
	 * @description The focus manager instance
	 * @type {SunEditor.Core['focusManager']}
	 */
	this.focusManager = editor.focusManager;
	/**
	 * @description The command dispatcher instance
	 * @type {SunEditor.Core['commandDispatcher']}
	 */
	this.commandDispatcher = editor.commandDispatcher;
	/**
	 * @description The history manager instance.
	 * @type {SunEditor.Core['history']}
	 */
	this.history = editor.history;
	/**
	 * @description The event manager instance.
	 * @type {SunEditor.Core['eventManager']}
	 */
	this.eventManager = editor.eventManager;
	/**
	 * @description The ui manager instance.
	 * @type {SunEditor.Core['uiManager']}
	 */
	this.uiManager = editor.uiManager;

	// base
	/**
	 * @description The events instance.
	 * @type {SunEditor.Core['events']}
	 */
	this.events = editor.events;
	/**
	 * @description The function to trigger an event.
	 * @type {SunEditor.Core['triggerEvent']}
	 */
	this.triggerEvent = editor.triggerEvent;
	/**
	 * @description The wrapper element for carrying elements.
	 * @type {SunEditor.Core['carrierWrapper']}
	 */
	this.carrierWrapper = editor.carrierWrapper;

	// environment variables
	/**
	 * @description The plugins used by the editor.
	 * @type {SunEditor.Core['plugins']}
	 */
	this.plugins = editor.plugins;
	/**
	 * @description The status of the editor.
	 * @type {SunEditor.Status}
	 */
	this.status = editor.status;
	/**
	 * @description The editor's [frame] context utility object.
	 * @type {SunEditor.Core['frameContext']}
	 */
	this.frameContext = editor.frameContext;
	/**
	 * @description The editor's [frame] options utility object.
	 * @type {SunEditor.Core['frameOptions']}
	 */
	this.frameOptions = editor.frameOptions;
	/**
	 * @description The editor's context utility object.
	 * @type {SunEditor.Core['context']}
	 */
	this.context = editor.context;
	/**
	 * @description The editor's options utility object.
	 * @type {SunEditor.Core['options']}
	 */
	this.options = editor.options;
	/**
	 * @description The editor's icons.
	 * @type {SunEditor.Core['icons']}
	 */
	this.icons = editor.icons;
	/**
	 * @description The language settings.
	 * @type {SunEditor.Core['lang']}
	 */
	this.lang = editor.lang;
	/**
	 * @description editor.frameRoots map.
	 * @type {SunEditor.Core['frameRoots']}
	 */
	this.frameRoots = editor.frameRoots;

	// window, document, shadowRoot
	/**
	 * @description The window object.
	 * @type {SunEditor.GlobalWindow}
	 */
	this._w = /** @type {SunEditor.GlobalWindow} */ (editor._w);
	/**
	 * @description The document object.
	 * @type {Document}
	 */
	this._d = editor._d;
}
