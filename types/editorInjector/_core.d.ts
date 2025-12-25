import type {} from '../typedef';
/**
 * @description Add default properties to the editor core object.
 * @param {SunEditor.Core} editor - The root editor instance
 */
export default function CoreInjector(editor: SunEditor.Core): void;
export default class CoreInjector {
	/**
	 * @description Add default properties to the editor core object.
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	/**
	 * @description The root editor instance.
	 * @type {SunEditor.Core}
	 */
	editor: SunEditor.Core;
	/**
	 * @description The event manager instance.
	 * @type {SunEditor.Core['eventManager']}
	 */
	eventManager: SunEditor.Core['eventManager'];
	/**
	 * @description The util/instanceCheck instance.
	 * @type {SunEditor.Core['instanceCheck']}
	 */
	instanceCheck: SunEditor.Core['instanceCheck'];
	/**
	 * @description The history manager instance.
	 * @type {SunEditor.Core['history']}
	 */
	history: SunEditor.Core['history'];
	/**
	 * @description The events instance.
	 * @type {SunEditor.Core['events']}
	 */
	events: SunEditor.Core['events'];
	/**
	 * @description The function to trigger an event.
	 * @type {SunEditor.Core['triggerEvent']}
	 */
	triggerEvent: SunEditor.Core['triggerEvent'];
	/**
	 * @description The wrapper element for carrying elements.
	 * @type {SunEditor.Core['carrierWrapper']}
	 */
	carrierWrapper: SunEditor.Core['carrierWrapper'];
	/**
	 * @description The plugins used by the editor.
	 * @type {SunEditor.Core['plugins']}
	 */
	plugins: SunEditor.Core['plugins'];
	/**
	 * @description The status of the editor.
	 * @type {SunEditor.Status}
	 */
	status: SunEditor.Status;
	/**
	 * @description The editor's [frame] context utility object.
	 * @type {SunEditor.Core['frameContext']}
	 */
	frameContext: SunEditor.Core['frameContext'];
	/**
	 * @description The editor's [frame] options utility object.
	 * @type {SunEditor.Core['frameOptions']}
	 */
	frameOptions: SunEditor.Core['frameOptions'];
	/**
	 * @description The editor's context utility object.
	 * @type {SunEditor.Core['context']}
	 */
	context: SunEditor.Core['context'];
	/**
	 * @description The editor's options utility object.
	 * @type {SunEditor.Core['options']}
	 */
	options: SunEditor.Core['options'];
	/**
	 * @description The editor's icons.
	 * @type {SunEditor.Core['icons']}
	 */
	icons: SunEditor.Core['icons'];
	/**
	 * @description The language settings.
	 * @type {SunEditor.Core['lang']}
	 */
	lang: SunEditor.Core['lang'];
	/**
	 * @description editor.frameRoots map.
	 * @type {SunEditor.Core['frameRoots']}
	 */
	frameRoots: SunEditor.Core['frameRoots'];
	/**
	 * @description The window object.
	 * @type {SunEditor.GlobalWindow}
	 */
	_w: SunEditor.GlobalWindow;
	/**
	 * @description The document object.
	 * @type {Document}
	 */
	_d: Document;
}
