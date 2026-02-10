import type {} from '../../../typedef';
export default PluginManager;
export type PluginEventParam = {
	frameContext: SunEditor.FrameContext;
	event: Event;
	data?: string;
	line?: Node;
	range?: Range;
	file?: File;
	doc?: Document;
};
export type ComponentChecker = (element: Node | null) => any;
/**
 * @typedef {Object} PluginEventParam
 * @property {SunEditor.FrameContext} frameContext
 * @property {Event} event
 * @property {string} [data]
 * @property {Node} [line]
 * @property {Range} [range]
 * @property {File} [file]
 * @property {Document} [doc]
 */
/**
 * @typedef {(element: Node | null) => * } ComponentChecker
 */
/**
 * @description Manages plugin registration and state.
 * Extracts "plugin" related responsibilities from the monolithic Editor class.
 */
declare class PluginManager {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 * @param {import('../../section/constructor').ConstructorReturnType} [product] - Initial editor context
	 */
	constructor(kernel: SunEditor.Kernel, product?: import('../../section/constructor').ConstructorReturnType);
	/**
	 * @description Returns the plugins object.
	 * @returns {Object<string, *>}
	 */
	get plugins(): {
		[x: string]: any;
	};
	/**
	 * @description Returns the file component management object.
	 * @returns {Object<string, *>}
	 */
	get fileInfo(): {
		[x: string]: any;
	};
	/**
	 * @description Finds component information for the given element.
	 * @param {Node} element The DOM element to check.
	 * @returns {SunEditor.ComponentInfo|null}
	 */
	findComponentInfo(element: Node): SunEditor.ComponentInfo | null;
	/**
	 * @description Apply retain format rules from plugins to the parsed DOM
	 * @param {DocumentFragment|Document} domParser
	 */
	applyRetainFormat(domParser: DocumentFragment | Document): void;
	/**
	 * @description Dispatches an event to all registered plugin handlers synchronously.
	 * @param {string} name The event name (e.g., 'onMouseMove', 'onFocus')
	 * @param {PluginEventParam} e The event payload
	 * @returns {boolean|undefined} Returns false if any handler cancels the event
	 */
	emitEvent(name: string, e: PluginEventParam): boolean | undefined;
	/**
	 * @description Dispatches an event to all registered plugin handlers asynchronously.
	 * @param {string} name The event name (e.g., 'onKeyDown', 'onPaste')
	 * @param {PluginEventParam} e The event payload
	 * @returns {Promise<boolean|undefined>} Returns false if any handler cancels the event
	 */
	emitEventAsync(name: string, e: PluginEventParam): Promise<boolean | undefined>;
	/**
	 * @description Check the components such as image and video and modify them according to the format.
	 * @param {boolean} loaded If true, the component is loaded.
	 */
	checkFileInfo(loaded: boolean): void;
	/**
	 * @description Initialize the information of the components.
	 */
	resetFileInfo(): void;
	/**
	 * @description If the plugin is not added, add the plugin and call the 'add' function.
	 * - If the plugin is added call callBack function.
	 * @param {string} pluginName The name of the plugin to call
	 * @param {?Array<HTMLElement>} targets Plugin target button
	 * @param {?Object<string, *>} pluginOptions Plugin's options
	 */
	register(
		pluginName: string,
		targets: Array<HTMLElement> | null,
		pluginOptions: {
			[x: string]: any;
		} | null,
	): void;
	/**
	 * @description Initialize the plugin manager and register plugins.
	 * @param {SunEditor.InitOptions} options
	 */
	init(options: SunEditor.InitOptions): void;
	/**
	 * @description Get a specific plugin instance
	 * @param {string} name
	 * @returns {*}
	 */
	get(name: string): any;
	/**
	 * @description Destroy the plugin manager
	 */
	_destroy(): void;
	#private;
}
