import type {} from '../../typedef';
export default ListFormat;
export type ListFormatThis = Omit<ListFormat & Partial<SunEditor.Injector>, 'ListFormat'>;
/**
 * @typedef {Omit<ListFormat & Partial<SunEditor.Injector>, 'ListFormat'>} ListFormatThis
 */
/**
 * @constructor
 * @this {ListFormatThis}
 * @description Classes related to editor formats such as "list" (ol, ul, li)
 * - "list" is a special "line", "block" format.
 * @param {SunEditor.Core} editor - The root editor instance
 */
declare function ListFormat(this: Omit<ListFormat & Partial<import('../../editorInjector').default>, 'ListFormat'>, editor: SunEditor.Core): void;
declare class ListFormat {
	/**
	 * @typedef {Omit<ListFormat & Partial<SunEditor.Injector>, 'ListFormat'>} ListFormatThis
	 */
	/**
	 * @constructor
	 * @this {ListFormatThis}
	 * @description Classes related to editor formats such as "list" (ol, ul, li)
	 * - "list" is a special "line", "block" format.
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	/**
	 * @this {ListFormatThis}
	 * @description Append all selected "line" element to the list and insert.
	 * @param {string} type List type. (ol | ul):[listStyleType]
	 * @param {Array<Node>} selectedCells "line" elements or list cells.
	 * @param {boolean} nested If true, indenting existing list cells.
	 * @example
	 * // Create ordered list from selected lines
	 * const lines = editor.format.getLines();
	 * editor.listFormat.apply('ol', lines, false);
	 *
	 * // Create unordered list with custom style
	 * editor.listFormat.apply('ul:circle', selectedElements, false);
	 *
	 * // Indent existing list items
	 * const listItems = [li1, li2, li3];
	 * editor.listFormat.apply('ul', listItems, true);
	 */
	apply(
		this: Omit<ListFormat & Partial<import('../../editorInjector').default>, 'ListFormat'>,
		type: string,
		selectedCells: Array<Node>,
		nested: boolean,
	): {
		sc: Node;
		so: number;
		ec: Node;
		eo: number;
	};
	/**
	 * @this {ListFormatThis}
	 * @description "selectedCells" array are detached from the list element.
	 * - The return value is applied when the first and last lines of "selectedFormats" are "LI" respectively.
	 * @param {Array<Node>} selectedCells Array of ["line", li] elements(LI, P...) to remove.
	 * @param {boolean} shouldDelete If true, It does not just remove the list, it deletes the content.
	 * @returns {{sc: Node, ec: Node}} Node information after deletion
	 * - sc: Start container node
	 * - ec: End container node
	 */
	remove(
		this: Omit<ListFormat & Partial<import('../../editorInjector').default>, 'ListFormat'>,
		selectedCells: Array<Node>,
		shouldDelete: boolean,
	): {
		sc: Node;
		ec: Node;
	};
	/**
	 * @this {ListFormatThis}
	 * @description Nest list cells or cancel nested cells.
	 * @param {Array<HTMLElement>} selectedCells List cells.
	 * @param {boolean} nested Nested or cancel nested.
	 * @example
	 * // Indent list items (increase nesting)
	 * const selectedItems = [liElement1, liElement2];
	 * editor.listFormat.applyNested(selectedItems, true);
	 *
	 * // Outdent list items (decrease nesting)
	 * editor.listFormat.applyNested(selectedItems, false);
	 *
	 * // Get current list cells and nest them
	 * const cells = editor.format.getLines().filter(el => el.tagName === 'LI');
	 * editor.listFormat.applyNested(cells, true);
	 */
	applyNested(
		this: Omit<ListFormat & Partial<import('../../editorInjector').default>, 'ListFormat'>,
		selectedCells: Array<HTMLElement>,
		nested: boolean,
	): {
		sc: Node;
		so: number;
		ec: Node;
		eo: number;
	};
	/**
	 * @this {ListFormatThis}
	 * @description Detach Nested all nested lists under the "baseNode".
	 * - Returns a list with nested removed.
	 * @param {HTMLElement} baseNode Element on which to base.
	 * @param {boolean} all If true, it also detach all nested lists of a returned list.
	 * @returns {Node} Result element
	 * @example
	 * // Remove first level of nesting
	 * const listItem = document.querySelector('li');
	 * editor.listFormat.removeNested(listItem, false);
	 *
	 * // Flatten all nested lists completely
	 * editor.listFormat.removeNested(listItem, true);
	 *
	 * // Remove nesting and get result
	 * const result = editor.listFormat.removeNested(nestedLi, false);
	 * console.log(result); // parent list element
	 */
	removeNested(this: Omit<ListFormat & Partial<import('../../editorInjector').default>, 'ListFormat'>, baseNode: HTMLElement, all: boolean): Node;
	/**
	 * @internal
	 * @this {ListFormatThis}
	 * @description Attaches a nested list structure by merging adjacent lists if applicable.
	 * - Ensures that the nested list is placed correctly in the document structure.
	 * @param {Element} originList The original list element where the nested list is inserted.
	 * @param {Element} innerList The nested list element.
	 * @param {Element} prev The previous sibling element.
	 * @param {Element} next The next sibling element.
	 * @param {{s: Array<number> | null, e: Array<number> | null, sl: Node | null, el: Node | null}} nodePath Object storing the start and end node paths.
	 * - s : Start node path.
	 * - e : End node path.
	 * - sl : Start node's parent element.
	 * - el : End node's parent element.
	 * @returns {Node} The attached inner list.
	 */
	_attachNested(
		this: Omit<ListFormat & Partial<import('../../editorInjector').default>, 'ListFormat'>,
		originList: Element,
		innerList: Element,
		prev: Element,
		next: Element,
		nodePath: {
			s: Array<number> | null;
			e: Array<number> | null;
			sl: Node | null;
			el: Node | null;
		},
	): Node;
	/**
	 * @internal
	 * @this {ListFormatThis}
	 * @description Detaches a nested list structure by extracting list items from their parent list.
	 * - Ensures proper restructuring of the list elements.
	 * @param {Array<HTMLElement>} cells The list items to be detached.
	 * @returns {{cc: Node, sc: Node, ec: Node}} An object containing reference nodes for repositioning.
	 * - cc : The parent node of the first list item.
	 * - sc : The first list item.
	 * - ec : The last list item.
	 */
	_detachNested(
		this: Omit<ListFormat & Partial<import('../../editorInjector').default>, 'ListFormat'>,
		cells: Array<HTMLElement>,
	): {
		cc: Node;
		sc: Node;
		ec: Node;
	};
	/**
	 * @internal
	 * @this {ListFormatThis}
	 * @description Destroy the ListFormat instance and release memory
	 */
	_destroy(this: Omit<ListFormat & Partial<import('../../editorInjector').default>, 'ListFormat'>): void;
}
