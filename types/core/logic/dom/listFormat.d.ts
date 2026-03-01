import type {} from '../../../typedef';
export default ListFormat;
/**
 * @description Classes related to editor formats such as `list` (ol, ul, li)
 * - `list` is a special `line`, `block` format.
 */
declare class ListFormat {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/**
	 * @description Append all selected `line` element to the list and insert.
	 * @param {string} type List type. (ol | ul):[listStyleType]
	 * @param {Array<Node>} selectedCells `line` elements or list cells.
	 * @param {boolean} nested If `true`, indenting existing list cells.
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
	 * @description `selectedCells` array are detached from the list element.
	 * - The return value is applied when the first and last lines of `selectedFormats` are `LI` respectively.
	 * @param {Array<Node>} selectedCells Array of [`line`, `li`] elements(LI, P...) to remove.
	 * @param {boolean} shouldDelete If `true`, It does not just remove the list, it deletes the content.
	 * @returns {{sc: Node, ec: Node}} Node information after deletion
	 * - sc: Start container node
	 * - ec: End container node
	 */
	remove(
		selectedCells: Array<Node>,
		shouldDelete: boolean,
	): {
		sc: Node;
		ec: Node;
	};
	/**
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
		selectedCells: Array<HTMLElement>,
		nested: boolean,
	): {
		sc: Node;
		so: number;
		ec: Node;
		eo: number;
	};
	/**
	 * @description Detach Nested all nested lists under the `baseNode`.
	 * - Returns a list with nested removed.
	 * @param {HTMLElement} baseNode Element on which to base.
	 * @param {boolean} all If `true`, it also detach all nested lists of a returned list.
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
	removeNested(baseNode: HTMLElement, all: boolean): Node;
	#private;
}
