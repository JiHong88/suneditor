import type {} from '../../typedef';
export default Selection_;
export type SelectionThis = Omit<Selection_ & Partial<SunEditor.Injector_Core>, 'selection'>;
/**
 * @typedef {Omit<Selection_ & Partial<SunEditor.Injector_Core>, 'selection'>} SelectionThis
 */
/**
 * @constructor
 * @this {SelectionThis}
 * @description Selection, Range related class
 * @param {SunEditor.Core} editor - The root editor instance
 */
declare function Selection_(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>, editor: SunEditor.Core): void;
declare class Selection_ {
	/**
	 * @typedef {Omit<Selection_ & Partial<SunEditor.Injector_Core>, 'selection'>} SelectionThis
	 */
	/**
	 * @constructor
	 * @this {SelectionThis}
	 * @description Selection, Range related class
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	/** @type {Range} */
	range: Range;
	/** @type {HTMLElement|Text} */
	selectionNode: HTMLElement | Text;
	__iframeFocus: boolean;
	__hasScrollParents: boolean;
	_scrollMargin: number;
	/** @internal @type {SunEditor.Core['component']} */
	get component(): SunEditor.Core['component'];
	/** @internal @type {SunEditor.Core['format']} */
	get format(): SunEditor.Core['format'];
	/** @internal @type {SunEditor.Core['html']} */
	get html(): SunEditor.Core['html'];
	/** @internal @type {SunEditor.Core['offset']} */
	get offset(): SunEditor.Core['offset'];
	/** @internal @type {SunEditor.Core['toolbar']} */
	get toolbar(): SunEditor.Core['toolbar'];
	/**
	 * @this {SelectionThis}
	 * @description Get window selection obejct
	 * @returns {Selection}
	 */
	get(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>): Selection;
	/**
	 * @this {SelectionThis}
	 * @description Check if the range object is valid
	 * @param {*} range Range object
	 * @returns {range is Range}
	 */
	isRange(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>, range: any): range is Range;
	/**
	 * @this {SelectionThis}
	 * @description Get current editor's range object
	 * @returns {Range}
	 */
	getRange(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>): Range;
	/**
	 * @this {SelectionThis}
	 * @description Set current editor's range object and return.
	 * @param {Node|Range} startCon Range object or The startContainer property of the selection object
	 * @param {number} [startOff] The startOffset property of the selection object.
	 * @param {Node} [endCon] The endContainer property of the selection object.
	 * @param {number} [endOff] The endOffset property of the selection object.
	 * @returns {Range}
	 * @example
	 * // Set range using container and offset
	 * const textNode = editor.selection.getNode();
	 * editor.selection.setRange(textNode, 0, textNode, 5);
	 *
	 * // Set range using Range object
	 * const range = document.createRange();
	 * range.selectNodeContents(someElement);
	 * editor.selection.setRange(range);
	 *
	 * // Collapse cursor to start of element
	 * editor.selection.setRange(element, 0, element, 0);
	 */
	setRange(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>, startCon: Node | Range, startOff?: number, endCon?: Node, endOff?: number): Range;
	/**
	 * @this {SelectionThis}
	 * @description Remove range object and button effect
	 */
	removeRange(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>): void;
	/**
	 * @this {SelectionThis}
	 * @description Returns the range (container and offset) near the given target node.
	 * - If the target node has a next sibling, it returns the next sibling with an offset of 0.
	 * - If there is no next sibling but a previous sibling exists, it returns the previous sibling with an offset of 1.
	 * @param {Node} target Target node whose neighboring range is to be determined.
	 * @returns {{container: Node, offset: number}|null} An object containing the nearest container node and its offset.
	 */
	getNearRange(
		this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>,
		target: Node,
	): {
		container: Node;
		offset: number;
	} | null;
	/**
	 * @this {SelectionThis}
	 * @description If the "range" object is a non-editable area, add a line at the top of the editor and update the "range" object.
	 * @param {Range} range core.getRange()
	 * @param {?Node} [container] If there is "container" argument, it creates a line in front of the container.
	 * @returns {Range} a new "range" or argument "range".
	 */
	getRangeAndAddLine(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>, range: Range, container?: Node | null): Range;
	/**
	 * @this {SelectionThis}
	 * @description Get current select node
	 * @returns {HTMLElement|Text}
	 */
	getNode(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>): HTMLElement | Text;
	/**
	 * @this {SelectionThis}
	 * @description Get the Rects object.
	 * @param {?(Range|Node)} target Range | Node | null
	 * @param {"start"|"end"} position It is based on the position of the rect object to be returned in case of range selection.
	 * @returns {{rects: import('./offset').RectsInfo, position: "start"|"end", scrollLeft: number, scrollTop: number}}
	 * @example
	 * // Get rects at start of selection
	 * const { rects, position, scrollLeft, scrollTop } = editor.selection.getRects(null, 'start');
	 * console.log(rects.left, rects.top, rects.right, rects.bottom);
	 *
	 * // Get rects for specific node
	 * const node = editor.selection.getNode();
	 * const rectsInfo = editor.selection.getRects(node, 'end');
	 *
	 * // Use rects for positioning UI elements
	 * const { rects } = editor.selection.getRects(null, 'start');
	 * tooltip.style.left = rects.left + 'px';
	 * tooltip.style.top = rects.top + 'px';
	 */
	getRects(
		this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>,
		target: (Range | Node) | null,
		position: 'start' | 'end',
	): {
		rects: import('./offset').RectsInfo;
		position: 'start' | 'end';
		scrollLeft: number;
		scrollTop: number;
	};
	/**
	 * @this {SelectionThis}
	 * @description Get the custom range object of the event.
	 * @param {DragEvent} e Event object
	 * @returns {{sc: Node, so: number, ec: Node, eo: number}} {sc: startContainer, so: startOffset, ec: endContainer, eo: endOffset}
	 */
	getDragEventLocationRange(
		this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>,
		e: DragEvent,
	): {
		sc: Node;
		so: number;
		ec: Node;
		eo: number;
	};
	/**
	 * @this {SelectionThis}
	 * @description Scroll to the corresponding selection or range position.
	 * @param {Selection|Range|Node} ref selection or range object
	 * @param {Object<string, *>} [scrollOption] option of scrollTo
	 * @example
	 * // Scroll to current selection smoothly
	 * editor.selection.scrollTo(editor.selection.get());
	 *
	 * // Scroll to specific node
	 * const targetNode = document.querySelector('.target-element');
	 * editor.selection.scrollTo(targetNode);
	 *
	 * // Scroll with custom options
	 * editor.selection.scrollTo(editor.selection.getRange(), {
	 *   behavior: 'auto',
	 *   block: 'center'
	 * });
	 */
	scrollTo(
		this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>,
		ref: Selection | Range | Node,
		scrollOption?: {
			[x: string]: any;
		},
	): void;
	/**
	 * @internal
	 * @this {SelectionThis}
	 * @description Returns true if there is no valid selection.
	 * @param {Range} range selection.getRange()
	 * @returns {boolean}
	 */
	_isNone(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>, range: Range): boolean;
	/**
	 * @internal
	 * @this {SelectionThis}
	 * @description Return the range object of editor's first child node
	 * @returns {Range}
	 */
	_createDefaultRange(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>): Range;
	/**
	 * @internal
	 * @this {SelectionThis}
	 * @description Set "range" and "selection" info.
	 * @param {Range} range range object.
	 * @param {Selection} selection selection object.
	 */
	_rangeInfo(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>, range: Range, selection: Selection): void;
	/**
	 * @internal
	 * @this {SelectionThis}
	 * @description Saving the range object and the currently selected node of editor
	 */
	_init(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>): HTMLInputElement;
	/**
	 * @internal
	 * @this {SelectionThis}
	 * @description Sets focus to the editor's wysiwyg contenteditable area and restores the last selection range within iframe context.
	 */
	__focus(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>): void;
	/**
	 * @internal
	 * @this {SelectionThis}
	 * @description Normalizes and resets the selection range to properly target text nodes instead of element nodes for accurate text editing.
	 * @returns {boolean} Returns false if there is no valid selection.
	 */
	_resetRangeToTextNode(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>): boolean;
	/**
	 * @internal
	 * @this {SelectionThis}
	 * @description Initialize the scroll information when the editor first loads
	 */
	__init(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>): void;
	/**
	 * @internal
	 * @this {SelectionThis}
	 * @description Destroy the Selection instance and release memory
	 */
	_destroy(this: Omit<Selection_ & Partial<CoreInjector>, 'selection'>): void;
}
import CoreInjector from '../../editorInjector/_core';
