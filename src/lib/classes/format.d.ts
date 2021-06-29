import CoreInterface from "../../interface/_core";

class Format extends CoreInterface {
	/**
	 * @description Append format element to sibling node of argument element.
	 * If the "formatNodeName" argument value is present, the tag of that argument value is inserted,
	 * If not, the currently selected format tag is inserted.
	 * @param element Insert as siblings of that element
	 * @param formatNode Node name or node obejct to be inserted
	 * @returns
	 */
	appendLine(element: Element, formatNode?: string | Element): Element;

	/**
	 * @description Copy and apply attributes of format tag that should be maintained. (style, class) Ignore "__se__format__" class
	 * @param originEl Origin element
	 * @param copyEl Element to copy
	 */
	copyAttributes(originEl: Element, copyEl: Element): void;

	/**
	 * @description Appended all selected format Element to the argument element and insert
	 * @param rangeElement Element of wrap the arguments (BLOCKQUOTE...)
	 */
	applyRangeBlock(rangeElement: Element): void;

	/**
	 * @description The elements of the "selectedFormats" array are detached from the "rangeElement" element. ("LI" tags are converted to "P" tags)
	 * When "selectedFormats" is null, all elements are detached and return {cc: parentNode, sc: nextSibling, ec: previousSibling, removeArray: [Array of removed elements]}.
	 * @param rangeElement Range format element (PRE, BLOCKQUOTE, OL, UL...)
	 * @param selectedFormats Array of format elements (P, DIV, LI...) to remove.
	 * If null, Applies to all elements and return {cc: parentNode, sc: nextSibling, ec: previousSibling}
	 * @param newRangeElement The node(rangeElement) to replace the currently wrapped node.
	 * @param remove If true, deleted without detached.
	 * @param notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
	 * @returns
	 */
	removeRangeBlock(
		rangeElement: Element,
		selectedFormats: Element[] | null,
		newRangeElement: Element | null,
		remove: boolean,
		notHistoryPush: boolean
	): { cc: Node; sc: Node; ec: Node; removeArray: Element[] };

	/**
	 * @description Append all selected format Element to the list and insert.
	 * @param type List type. (bullet | numbered):[listStyleType]
	 * @param selectedCells Format elements or list cells.
	 * @param nested If true, indenting existing list cells.
	 */
	applyList(type: string, selectedCells: Element[], nested: boolean);

	/**
	 * @description "selectedCells" array are detached from the list element.
	 * The return value is applied when the first and last lines of "selectedFormats" are "LI" respectively.
	 * @param selectedCells Array of format elements (LI, P...) to remove.
	 * @param remove If true, It does not just remove the list, it deletes the contents.
	 * @returns {sc: <LI>, ec: <LI>}.
	 */
	removeList(selectedCells: Element[], remove: boolean): { sc: Element; ec: Element };

	/**
	 * @description Nest list cells or cancel nested cells.
	 * @param selectedCells List cells.
	 * @param nested Nested or cancel nested.
	 * @private
	 */
	_applyNestedList(selectedCells: Element[], nested: boolean): void;

	/**
	 * @description Detach Nested all nested lists under the "baseNode".
	 * Returns a list with nested removed.
	 * @param baseNode Element on which to base.
	 * @param all If true, it also detach all nested lists of a returned list.
	 * @returns
	 * @private
	 */
	_removeNestedList(baseNode: Node, all: boolean): Element;

	/**
	 * @description Indent more the selected lines.
	 * margin size - "_variable.indentSize"px
	 */
	indent(): void;

	/**
	 * @description Indent less the selected lines.
	 * margin size - "_variable.indentSize"px
	 */
	outdent(): void;

	/**
	 * @description Add, update, and delete style node from selected text. (a, span, strong, ect.)
	 * 1. If there is a node in the "styleNode" argument, a node with the same tags and attributes as "styleNode" is added to the selection text.
	 * 2. If it is in the same tag, only the tag's attributes are changed without adding a tag.
	 * 3. If the "styleNode" argument is null, the node of the selection is update or remove without adding a new node.
	 * 4. The same style as the style attribute of the "styleArray" argument is deleted.
	 *    (Styles should be put with attribute names from css. ["background-color"])
	 * 5. The same class name as the class attribute of the "styleArray" argument is deleted.
	 *    (The class name is preceded by "." [".className"])
	 * 6. Use a list of styles and classes of "styleNode" in "styleArray" to avoid duplicate property values.
	 * 7. If a node with all styles and classes removed has the same tag name as "styleNode" or "removeNodeArray", or "styleNode" is null, that node is deleted.
	 * 8. Regardless of the style and class of the node, the tag with the same name as the "removeNodeArray" argument value is deleted.
	 * 9. If the "strictRemove" argument is true, only nodes with all styles and classes removed from the nodes of "removeNodeArray" are removed.
	 * 10. It won't work if the parent node has the same class and same value style.
	 *    However, if there is a value in "removeNodeArray", it works and the text node is separated even if there is no node to replace.
	 * @param styleNode The element to be added to the selection. If it is null, only delete the node.
	 * @param styleArray The style or className attribute name Array to check (['font-size'], ['.className'], ['font-family', 'color', '.className']...])
	 * @param removeNodeArray An array of node names to remove types from, remove all formats when "styleNode" is null and there is an empty array or null value. (['span'], ['strong', 'em'] ...])
	 * @param strictRemove If true, only nodes with all styles and classes removed from the nodes of "removeNodeArray" are removed.
	 */
	applyStyleNode(
		styleNode?: Element,
		styleArray?: string[],
		removeNodeArray?: string[],
		strictRemove?: boolean
	): void;

	/**
	 * @description Remove format of the currently selected text
	 */
	removeStyleNode(): void;

	/**
	 * @description If a parent node that contains an argument node finds a line element, it returns that node.
	 * @param element Reference node.
	 * @param validation Additional validation function.
	 * @returns
	 */
	getLine(element: Node, validation?: Function): Element | null;

	/**
	 * @description If a parent node that contains an argument node finds a format node (util.isRangeFormatElement), it returns that node.
	 * @param element Reference node.
	 * @param validation Additional validation function.
	 * @returns
	 */
	getRangeBlock(element: Node, validation?: Function): Element | null;

	/**
	 * @description If a parent node that contains an argument node finds a free format node (util.isFreeFormatElement), it returns that node.
	 * @param element Reference node.
	 * @param validation Additional validation function.
	 * @returns
	 */
	getBrLine(element: Node, validation?: Function): Element | null;

	/**
	 * @description Check if the container and offset values are the edges of the "line"
	 * @param container The container property of the selection object.
	 * @param offset The offset property of the selection object.
	 * @param dir Select check point - "front": Front edge, "end": End edge, undefined: Both edge.
	 * @returns
	 */
	isEdgeFormat(container: Node, offset: number, dir: "front" | "end"): boolean;
}

export default Format;
