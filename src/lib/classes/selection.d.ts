import CoreInterface from "../../interface/_core";

class Selection extends CoreInterface {
	/**
	 * @description Get current editor's range object
	 * @returns
	 */
	getRange(): Range;

	/**
	 * @description Set current editor's range object and return.
	 * @param startCon The startContainer property of the selection object.
	 * @param startOff The startOffset property of the selection object.
	 * @param endCon The endContainer property of the selection object.
	 * @param endOff The endOffset property of the selection object.
	 * @returns
	 */
	setRange(startCon: Node, startOff: number, endCon: Node, endOff: number): Range;

	/**
	 * @description Remove range object and button effect
	 */
	removeRange(): void;

	/**
	 * @description If the "range" object is a non-editable area, add a line at the top of the editor and update the "range" object.
	 * Returns a new "range" or argument "range".
	 * @param range core.getRange()
	 * @param container If there is "container" argument, it creates a line in front of the container.
	 */
	getRange_addLine(range: Range, container?: Element): Range;

	/**
	 * @description Get window selection obejct
	 * @returns
	 */
	get(): Selection;

	/**
	 * @description Get current select node
	 * @returns
	 */
	getNode(): Node;

	/**
	 * @description Returns a "line" array from the currently selected range.
	 * @param validation The validation function. (Replaces the default validation format.isLine(current))
	 * @returns
	 */
	getLines(validation?: Function): Node[];

	/**
	 * @description Get lines and components from the selected area. (P, DIV, H[1-6], OL, UL, TABLE..)
	 * If some of the component are included in the selection, get the entire that component.
	 * @param removeDuplicate If true, if there is a parent and child tag among the selected elements, the child tag is excluded.
	 * @returns
	 */
	getLinesAndComponents(removeDuplicate: boolean): Node[];

	/**
	 * @description Returns true if there is no valid selection.
	 * @param range selection.getRange()
	 * @returns
	 */
	isNone(range: Range): boolean;
}

export default Selection;
