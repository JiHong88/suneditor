export default Component;
export type ComponentThis = Omit<Component & Partial<__se__EditorInjector>, 'component'>;
export type ComponentInfo = {
	/**
	 * - The target element associated with the component.
	 */
	target: HTMLElement;
	/**
	 * - The name of the plugin related to the component.
	 */
	pluginName: string;
	/**
	 * - Options related to the component.
	 */
	options: {
		[x: string]: any;
	};
	/**
	 * - The main container element for the component.
	 */
	container: HTMLElement;
	/**
	 * - The cover element, if applicable.
	 */
	cover: HTMLElement | null;
	/**
	 * - The inline cover element, if applicable.
	 */
	inlineCover: HTMLElement | null;
	/**
	 * - The caption element, if applicable.
	 */
	caption: HTMLElement | null;
	/**
	 * - Whether the component is a file-related component.
	 */
	isFile: boolean;
	/**
	 * - The element that triggered the component, if applicable.
	 */
	launcher: HTMLElement | null;
};
/**
 * @typedef {Omit<Component & Partial<__se__EditorInjector>, 'component'>} ComponentThis
 */
/**
 * @typedef {Object} ComponentInfo
 * @property {HTMLElement} target - The target element associated with the component.
 * @property {string} pluginName - The name of the plugin related to the component.
 * @property {Object<string, *>} options - Options related to the component.
 * @property {HTMLElement} container - The main container element for the component.
 * @property {?HTMLElement} cover - The cover element, if applicable.
 * @property {?HTMLElement} inlineCover - The inline cover element, if applicable.
 * @property {?HTMLElement} caption - The caption element, if applicable.
 * @property {boolean} isFile - Whether the component is a file-related component.
 * @property {?HTMLElement} launcher - The element that triggered the component, if applicable.
 */
/**
 * @constructor
 * @this {ComponentThis}
 * @description Class for managing components such as images and tables that are not in line format
 * @param {__se__EditorCore} editor - The root editor instance
 */
declare function Component(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, editor: __se__EditorCore): void;
declare class Component {
	/**
	 * @typedef {Omit<Component & Partial<__se__EditorInjector>, 'component'>} ComponentThis
	 */
	/**
	 * @typedef {Object} ComponentInfo
	 * @property {HTMLElement} target - The target element associated with the component.
	 * @property {string} pluginName - The name of the plugin related to the component.
	 * @property {Object<string, *>} options - Options related to the component.
	 * @property {HTMLElement} container - The main container element for the component.
	 * @property {?HTMLElement} cover - The cover element, if applicable.
	 * @property {?HTMLElement} inlineCover - The inline cover element, if applicable.
	 * @property {?HTMLElement} caption - The caption element, if applicable.
	 * @property {boolean} isFile - Whether the component is a file-related component.
	 * @property {?HTMLElement} launcher - The element that triggered the component, if applicable.
	 */
	/**
	 * @constructor
	 * @this {ComponentThis}
	 * @description Class for managing components such as images and tables that are not in line format
	 * @param {__se__EditorCore} editor - The root editor instance
	 */
	constructor(editor: __se__EditorCore);
	/**
	 * @description The current component information, used copy, cut, and keydown events
	 * @type {ComponentInfo}
	 */
	info: ComponentInfo;
	/**
	 * @description Component is selected
	 * @type {boolean}
	 */
	isSelected: boolean;
	/**
	 * @description Currently selected component target
	 * @type {Node|null}
	 */
	currentTarget: Node | null;
	/**
	 * @description Currently selected component plugin instance
	 * @type {*}
	 */
	currentPlugin: any;
	/**
	 * @description Currently selected component plugin name
	 * @type {*}
	 */
	currentPluginName: any;
	/**
	 * @description Currently selected component information
	 * @type {ComponentInfo|null}
	 */
	currentInfo: ComponentInfo | null;
	/** @type {Object<string, (...args: *) => *>} */
	__globalEvents: {
		[x: string]: (...args: any) => any;
	};
	/** @type {__se__GlobalEventInfo|void} */
	_bindClose_copy: __se__GlobalEventInfo | void;
	/** @type {__se__GlobalEventInfo|void} */
	_bindClose_cut: __se__GlobalEventInfo | void;
	/** @type {__se__GlobalEventInfo|void} */
	_bindClose_keydown: __se__GlobalEventInfo | void;
	/** @type {__se__GlobalEventInfo|void} */
	_bindClose_mousedown: __se__GlobalEventInfo | void;
	/** @type {__se__GlobalEventInfo|void} */
	_bindClose_touchstart: __se__GlobalEventInfo | void;
	/** @type {boolean} */
	__selectionSelected: boolean;
	/**
	 * @this {ComponentThis}
	 * @description Inserts an element and returns it. (Used for elements: table, hr, image, video)
	 * - If "element" is "HR", inserts and returns the new line.
	 * @param {Node} element Element to be inserted
	 * @param {Object} [options] Options
	 * @param {boolean} [options.skipCharCount=false] If true, it will be inserted even if "frameOptions.get('charCounter_max')" is exceeded.
	 * @param {boolean} [options.skipSelection=false] If true, do not automatically select the inserted component.
	 * @param {boolean} [options.skipHistory=false] If true, do not push to history.
	 * @returns {HTMLElement} The inserted element or new line (for HR)
	 */
	insert(
		this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>,
		element: Node,
		{
			skipCharCount,
			skipSelection,
			skipHistory
		}?: {
			skipCharCount?: boolean;
			skipSelection?: boolean;
			skipHistory?: boolean;
		}
	): HTMLElement;
	/**
	 * @this {ComponentThis}
	 * @description Gets the file component and that plugin name
	 * - return: {target, component, pluginName} | null
	 * @param {Node} element Target element (figure tag, component div, file tag)
	 * @returns {ComponentInfo|null}
	 */
	get(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, element: Node): ComponentInfo | null;
	/**
	 * @this {ComponentThis}
	 * @description The component(media, file component, table, etc) is selected and the resizing module is called.
	 * @param {Node} element Target element
	 * @param {string} pluginName The plugin name for the selected target.
	 * @param {boolean=} isInput Whether the target is an input component.(table)
	 */
	select(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, element: Node, pluginName: string, isInput?: boolean | undefined): boolean;
	/**
	 * @this {ComponentThis}
	 * @description Deselects the selected component.
	 */
	deselect(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>): void;
	/**
	 * @this {ComponentThis}
	 * @description Determines if the specified node is a block component (e.g., img, iframe, video, audio, table) with the class "se-component"
	 * - or a direct FIGURE node. This function checks if the node itself is a component
	 * - or if it belongs to any components identified by the component manager.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is a block component or part of it, otherwise false.
	 */
	is(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, element: Node): boolean;
	/**
	 * @this {ComponentThis}
	 * @description Checks if the given node is an inline component (class "se-inline-component").
	 * - If the node is a FIGURE, it checks the parent element instead.
	 * - It also verifies whether the node is part of an inline component recognized by the component manager.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is an inline component or part of it, otherwise false.
	 */
	isInline(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, element: Node): boolean;
	/**
	 * @this {ComponentThis}
	 * @description Checks if the specified node qualifies as a basic component within the editor.
	 * - This function verifies whether the node is recognized as a component by the `is` function, while also ensuring that it is not an inline component as determined by the `isInline` function.
	 * - This is used to identify block-level elements or standalone components that are not part of the inline component classification.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is a basic (non-inline) component, otherwise false.
	 */
	isBasic(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, element: Node): boolean;
	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Checks if the given element is a file component by matching its tag name against the file manager's regular expressions.
	 * - It also verifies whether the element has the required attributes based on the tag type.
	 * @param {Node} element The element to check.
	 * @returns {boolean} Returns true if the element is a file component, otherwise false.
	 */
	__isFiles(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, element: Node): boolean;
	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Deselects the currently selected component, removing any selection effects and associated event listeners.
	 * - This method resets the selection state and hides UI elements related to the component selection.
	 */
	__deselect(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>): void;
	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Set line breaker of component
	 * @param {HTMLElement} element Element tag
	 */
	_setComponentLineBreaker(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, element: HTMLElement): void;
	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Adds global event listeners for component interactions such as copy, cut, and keydown events.
	 */
	__addGlobalEvent(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>): void;
	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Removes global event listeners that were previously added for component interactions.
	 */
	__removeGlobalEvent(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>): void;
	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Adds global event listeners for non-file-related interactions such as mouse and touch events.
	 */
	__addNotFileGlobalEvent(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>): void;
	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Removes global event listeners related to non-file interactions.
	 */
	__removeNotFileGlobalEvent(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>): void;
	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Removes drag-related events and resets drag-related states.
	 */
	_removeDragEvent(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>): void;
}
