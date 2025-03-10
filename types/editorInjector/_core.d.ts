/**
 * @description Add default properties to the editor core object.
 * @param {__se__EditorCore} editor - The root editor instance
 */
export default function CoreInjector(editor: __se__EditorCore): void;
export default class CoreInjector {
	/**
	 * @description Add default properties to the editor core object.
	 * @param {__se__EditorCore} editor - The root editor instance
	 */
	constructor(editor: __se__EditorCore);
	/**
	 * @description The root editor instance.
	 * @type {__se__EditorCore}
	 */
	editor: __se__EditorCore;
	/**
	 * @description The event manager instance.
	 * @type {import('../core/base/eventManager').default}
	 */
	eventManager: import('../core/base/eventManager').default;
	/**
	 * @description The history manager instance.
	 * @type {__se__EditorCore['history']}
	 */
	history: __se__EditorCore['history'];
	/**
	 * @description The events instance.
	 * @type {__se__EditorCore['events']}
	 */
	events: __se__EditorCore['events'];
	/**
	 * @description The function to trigger an event.
	 * @type {__se__EditorCore['triggerEvent']}
	 */
	triggerEvent: __se__EditorCore['triggerEvent'];
	/**
	 * @description The wrapper element for carrying elements.
	 * @type {__se__EditorCore['carrierWrapper']}
	 */
	carrierWrapper: __se__EditorCore['carrierWrapper'];
	/**
	 * @description The plugins used by the editor.
	 * @type {__se__EditorCore['plugins']}
	 */
	plugins: __se__EditorCore['plugins'];
	/**
	 * @description The status of the editor.
	 * @type {__se__EditorStatus}
	 */
	status: __se__EditorStatus;
	/**
	 * @description The editor's context map.
	 * @type {__se__EditorCore['context']}
	 */
	context: __se__EditorCore['context'];
	/**
	 * @description The editor's options map.
	 * @type {__se__EditorCore['options']}
	 */
	options: __se__EditorCore['options'];
	/**
	 * @description The editor's icons.
	 * @type {__se__EditorCore['icons']}
	 */
	icons: __se__EditorCore['icons'];
	/**
	 * @description The language settings.
	 * @type {__se__EditorCore['lang']}
	 */
	lang: __se__EditorCore['lang'];
	/**
	 * @description editor.frameRoots map.
	 * @type {__se__EditorCore['frameRoots']}
	 */
	frameRoots: __se__EditorCore['frameRoots'];
	/**
	 * @description The window object.
	 * @type {Window}
	 */
	_w: Window;
	/**
	 * @description The document object.
	 * @type {Document}
	 */
	_d: Document;
	/**
	 * @description The shadow root object (if any).
	 * @type {__se__EditorCore['_shadowRoot']}
	 */
	_shadowRoot: __se__EditorCore['_shadowRoot'];
}
