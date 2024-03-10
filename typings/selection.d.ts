import EditorInterface from '../../interface/editor';

class Selection extends EditorInterface {
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
	getRangeAndAddLine(range: Range, container?: Element): Range;

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
	 * @description Returns a "line" array from selected range.
	 * @param validation The validation function. (Replaces the default validation format.isLine(current))
	 * @returns
	 */
	getLines(validation?: Function): Node[];

	/**
	 * @description Get lines and components from the selected range. (P, DIV, H[1-6], OL, UL, TABLE..)
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

	/**
	 * @description Delete selected node and insert argument value node and return.
	 * If the "afterNode" exists, it is inserted after the "afterNode"
	 * Inserting a text node merges with both text nodes on both sides and returns a new "{ container, startOffset, endOffset }".
	 * @param oNode Node to be inserted
	 * @param afterNode If the node exists, it is inserted after the node
	 * @returns
	 */
	insertNode(oNode: Node, afterNode?: Node, checkCharCount?: boolean): { startOffset: Node; endOffset: number } | Node | null;

	/**
	 * @description Insert an (HTML element / HTML string / plain string) at selection range.
	 * @param html HTML Element or HTML string or plain string
	 * @param notCleaningData If true, inserts the HTML string without refining it with core.cleanHTML.
	 * @param checkCharCount If true, if "options.charCounter_max" is exceeded when "element" is added, null is returned without addition.
	 * @param rangeSelection If true, range select the inserted node.
	 */
	insertHTML(html: Element | string, notCleaningData?: boolean, checkCharCount?: boolean, rangeSelection?: boolean): void;

	/**
	 * @description Delete the selected range.
	 * Returns {container: "the last element after deletion", offset: "offset", prevContainer: "previousElementSibling Of the deleted area"}
	 * @returns
	 */
	removeNode(): { container: Node; offset: number; prevContainer?: Node };
}

export default Selection;
