import type {} from '../../typedef';
export default Component;
export type ComponentThis = Omit<Component & Partial<SunEditor.Injector>, 'component'>;
/**
 * @typedef {Omit<Component & Partial<SunEditor.Injector>, 'component'>} ComponentThis
 */
/**
 * @constructor
 * @this {ComponentThis}
 * @description Class for managing components such as images and tables that are not in line format
 * @param {SunEditor.Core} editor - The root editor instance
 */
declare function Component(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, editor: SunEditor.Core): void;
declare class Component {
	/**
	 * @typedef {Omit<Component & Partial<SunEditor.Injector>, 'component'>} ComponentThis
	 */
	/**
	 * @constructor
	 * @this {ComponentThis}
	 * @description Class for managing components such as images and tables that are not in line format
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	/**
	 * @description The current component information, used copy, cut, and keydown events
	 * @type {SunEditor.ComponentInfo}
	 */
	info: SunEditor.ComponentInfo;
	/**
	 * @description Component is selected
	 * @type {boolean}
	 */
	isSelected: boolean;
	/**
	 * @description Currently selected component target
	 * @type {?Node}
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
	 * @type {?SunEditor.ComponentInfo}
	 */
	currentInfo: SunEditor.ComponentInfo | null;
	/** @type {Object<string, (...args: *) => *>} */
	__globalEvents: {
		[x: string]: (...args: any) => any;
	};
	/** @type {?SunEditor.Event.GlobalInfo} */
	_bindClose_copy: SunEditor.Event.GlobalInfo | null;
	/** @type {?SunEditor.Event.GlobalInfo} */
	_bindClose_cut: SunEditor.Event.GlobalInfo | null;
	/** @type {?SunEditor.Event.GlobalInfo} */
	_bindClose_keydown: SunEditor.Event.GlobalInfo | null;
	/** @type {?SunEditor.Event.GlobalInfo} */
	_bindClose_mousedown: SunEditor.Event.GlobalInfo | null;
	/** @type {boolean} */
	__selectionSelected: boolean;
	__prevent: boolean;
	/**
	 * @this {ComponentThis}
	 * @description Inserts an element and returns it. (Used for elements: table, hr, image, video)
	 * - If "element" is "HR", inserts and returns the new line.
	 * @param {Node} element Element to be inserted
	 * @param {Object} [options] Options
	 * @param {boolean} [options.skipCharCount=false] If true, it will be inserted even if "frameOptions.get('charCounter_max')" is exceeded.
	 * @param {boolean} [options.skipHistory=false] If true, do not push to history.
	 * @param {boolean} [options.scrollTo=true] true : Scroll to the inserted element, false : Do not scroll.
	 * @param {SunEditor.ComponentInsertType} [options.insertBehavior] If true, do not automatically select the inserted component. [default: options.get('componentInsertBehavior')]
	 * - If null, noting action is performed after insertion.
	 * @returns {HTMLElement} The inserted element or new line (for HR)
	 */
	insert(
		this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>,
		element: Node,
		{
			skipCharCount,
			skipHistory,
			scrollTo,
			insertBehavior,
		}?: {
			skipCharCount?: boolean;
			skipHistory?: boolean;
			scrollTo?: boolean;
			insertBehavior?: SunEditor.ComponentInsertType;
		},
	): HTMLElement;
	/**
	 * @this {ComponentThis}
	 * @description Handles post-insertion behavior for a newly created component based on the specified mode.
	 * @param {Node} container The inserted component element.
	 * @param {?Node} [oNode] Optional node to use for selection if the component cannot be selected.
	 * @param {SunEditor.ComponentInsertType} [insertBehavior] Behavior mode after component insertion.
	 */
	applyInsertBehavior(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, container: Node, oNode?: Node | null, insertBehavior?: SunEditor.ComponentInsertType): void;
	/**
	 * @this {ComponentThis}
	 * @description Gets the file component and that plugin name
	 * - return: {target, component, pluginName} | null
	 * @param {Node} element Target element (figure tag, component div, file tag)
	 * @returns {SunEditor.ComponentInfo|null}
	 */
	get(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, element: Node): SunEditor.ComponentInfo | null;
	/**
	 * @this {ComponentThis}
	 * @description The component(media, file component, table, etc) is selected and the resizing module is called.
	 * @param {Node} element Target element
	 * @param {string} pluginName The plugin name for the selected target.
	 * @param {Object} [options] Options
	 * @param {boolean} [options.isInput=false] Whether the target is an input component.(table)
	 */
	select(
		this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>,
		element: Node,
		pluginName: string,
		{
			isInput,
		}?: {
			isInput?: boolean;
		},
	): boolean;
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
	 * @this {ComponentThis}
	 * @description Copies the specified component node to the clipboard.
	 * - This function is different from the one called when the user presses the "Ctrl + C" key combination.
	 * @param {Node} container The DOM node to check.
	 */
	copy(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, container: Node): Promise<void>;
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
	 * @description
	 * Attempts to move the cursor to a valid line after the given container.
	 * - If a valid next sibling line exists, moves the selection there.
	 * - If no next sibling exists, creates a new line after the container and moves the selection there.
	 * - If the next sibling exists but is not a valid line element and cannot create a new line, returns false.
	 * @param {Node} container The component container element.
	 * @returns {boolean} Returns true if the selection moved to a line (existing or newly created), otherwise false.
	 */
	__moveToNextLineOrAdd(this: Omit<Component & Partial<import('../../editorInjector').default>, 'component'>, container: Node): boolean;
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
