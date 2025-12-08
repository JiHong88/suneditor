import type {} from '../../typedef';
export default Component;
/**
 * @description Class for managing components such as images and tables that are not in line format
 */
declare class Component extends CoreInjector {
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
	/** @internal */
	__selectionSelected: boolean;
	/** @internal */
	__prevent: boolean;
	/**
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
	 * @description Handles post-insertion behavior for a newly created component based on the specified mode.
	 * @param {Node} container The inserted component element.
	 * @param {?Node} [oNode] Optional node to use for selection if the component cannot be selected.
	 * @param {SunEditor.ComponentInsertType} [insertBehavior] Behavior mode after component insertion.
	 */
	applyInsertBehavior(container: Node, oNode?: Node | null, insertBehavior?: SunEditor.ComponentInsertType): void;
	/**
	 * @description Gets the file component and that plugin name
	 * - return: {target, component, pluginName} | null
	 * @param {Node} element Target element (figure tag, component div, file tag)
	 * @returns {SunEditor.ComponentInfo|null}
	 */
	get(element: Node): SunEditor.ComponentInfo | null;
	/**
	 * @description The component(media, file component, table, etc) is selected and the resizing module is called.
	 * @param {Node} element Target element
	 * @param {string} pluginName The plugin name for the selected target.
	 * @param {Object} [options] Options
	 * @param {boolean} [options.isInput=false] Whether the target is an input component.(table)
	 */
	select(
		element: Node,
		pluginName: string,
		{
			isInput,
		}?: {
			isInput?: boolean;
		},
	): boolean;
	/**
	 * @description Deselects the selected component.
	 */
	deselect(): void;
	/**
	 * @description Determines if the specified node is a block component (e.g., img, iframe, video, audio, table) with the class "se-component"
	 * - or a direct FIGURE node. This function checks if the node itself is a component
	 * - or if it belongs to any components identified by the component manager.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is a block component or part of it, otherwise false.
	 */
	is(element: Node): boolean;
	/**
	 * @description Checks if the given node is an inline component (class "se-inline-component").
	 * - If the node is a FIGURE, it checks the parent element instead.
	 * - It also verifies whether the node is part of an inline component recognized by the component manager.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is an inline component or part of it, otherwise false.
	 */
	isInline(element: Node): boolean;
	/**
	 * @description Checks if the specified node qualifies as a basic component within the editor.
	 * - This function verifies whether the node is recognized as a component by the `is` function, while also ensuring that it is not an inline component as determined by the `isInline` function.
	 * - This is used to identify block-level elements or standalone components that are not part of the inline component classification.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is a basic (non-inline) component, otherwise false.
	 */
	isBasic(element: Node): boolean;
	/**
	 * @description Copies the specified component node to the clipboard.
	 * - This function is different from the one called when the user presses the "Ctrl + C" key combination.
	 * @param {Node} container The DOM node to check.
	 */
	copy(container: Node): Promise<void>;
	/**
	 * @description Temporarily selects a component without showing its controller.
	 * This is a lightweight selection mode used for:
	 * - Mouse hover: Shows visual selection while hovering, auto-deselects on mouse out
	 * - Table column/row resize: Maintains selection after resize without showing controller
	 *
	 * Key differences from `select()`:
	 * - Does NOT show the component's controller (resize handles, toolbar, etc.)
	 * - Sets `__overInfo` flag so selection is automatically cleared on mouse out
	 * - Calling `select()` afterward will upgrade to full selection with controller
	 *
	 * @param {Element} target The element to hover-select
	 */
	hoverSelect(target: Element): void;
	/**
	 * @internal
	 * @description Deselects the currently selected component, removing any selection effects and associated event listeners.
	 * - This method resets the selection state and hides UI elements related to the component selection.
	 */
	__deselect(): void;
	/**
	 * @internal
	 * @description Set line breaker of component
	 * @param {HTMLElement} element Element tag
	 */
	_setComponentLineBreaker(element: HTMLElement): void;
	/**
	 * @internal
	 * @description Removes global event listeners that were previously added for component interactions.
	 */
	__removeGlobalEvent(): void;
	/**
	 * @internal
	 * @description Removes drag-related events and resets drag-related states.
	 */
	__removeDragEvent(): void;
	/**
	 * @internal
	 * @description Destroy the Component instance and release memory
	 */
	_destroy(): void;
	#private;
}
import CoreInjector from '../../editorInjector/_core';
