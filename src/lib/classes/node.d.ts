import CoreInterface from "../../interface/_core";

class Node extends CoreInterface {
	/**
	 * @description Split all tags based on "baseNode"
	 * Returns the last element of the splited tag.
	 * @param baseNode Element or text node on which to base
	 * @param offset Text offset of "baseNode" (Only valid when "baseNode" is a text node)
	 * @param depth The nesting depth of the element being split. (default: 0)
	 * @returns
	 */
	split(baseNode: Node, offset: number | null, depth: number): Element;

	/**
	 * @description Use with "npdePath (util.getNodePath)" to merge the same attributes and tags if they are present and modify the nodepath.
	 * If "offset" has been changed, it will return as much "offset" as it has been modified.
	 * An array containing change offsets is returned in the order of the "nodePathArray" array.
	 * @param element Element
	 * @param nodePathArray Array of NodePath object ([util.getNodePath(), ..])
	 * @param onlyText If true, non-text nodes like 'span', 'strong'.. are ignored.
	 * @returns [offset, ..]
	 */
	mergeSameTags(element: Element, nodePathArray: any[], onlyText: boolean): number[];

	/**
	 * @description Remove nested tags without other child nodes.
	 * @param element Element object
	 * @param validation Validation function / String("tag1|tag2..") / If null, all tags are applicable.
	 */
	mergeNestedTags(element: Element, validation?: string | Function): void;

	/**
	 * @description Delete argumenu value element
	 * @param item Node to be remove
	 */
	removeItem(item: Node): void;

	/**
	 * @description Delete all parent nodes that match the condition.
	 * Returns an {sc: previousSibling, ec: nextSibling}(the deleted node reference) or null.
	 * @param item Node to be remove
	 * @param validation Validation function. default(Deleted if it only have breakLine and blanks)
	 * @param stopParent Stop when the parent node reaches stopParent
	 * @returns
	 */
	removeItemAllParents(item: Node, validation?: Function, stopParent?: Element): Record<string, Node | null> | null;

	/**
	 * @description Delete a empty child node of argument element
	 * @param element Element node
	 * @param notRemoveNode Do not remove node
	 */
	removeEmptyNode(element: Element, notRemoveNode?: Node): void;

	/**
	 * @description It is judged whether it is the component [img, iframe] cover(class="se-component")
	 * @param element The node to check
	 * @returns
	 */
	isNotCheckingNode(element: Node): boolean;

	/**
	 * @description Remove whitespace between tags in HTML string.
	 * @param html HTML string
	 * @returns
	 */
	htmlRemoveWhiteSpace(html: string): string;

	/**
	 * @description It is judged whether it is a node related to the text style.
	 * (strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label)
	 * @param element The node to check
	 * @returns
	 */
	isTextStyleNode(element: Node): boolean;

	/**
	 * @description It is judged whether it is the format element (P, DIV, H[1-6], PRE, LI | class="__se__format__line_xxx")
	 * Format element also contain "free format Element"
	 * @param element The node to check
	 * @returns
	 */
	isFormatElement(element: Node): boolean;

	/**
	 * @description It is judged whether it is the range format element. (BLOCKQUOTE, OL, UL, FIGCAPTION, TABLE, THEAD, TBODY, TR, TH, TD | class="__se__format__range_block_xxx")
	 * * Range format element is wrap the line element
	 * @param element The node to check
	 * @returns
	 */
	isRangeFormatElement(element: Node): boolean;

	/**
	 * @description It is judged whether it is the closure range format element. (TH, TD | class="__se__format__range_block_closure_xxx")
	 * Closure range format elements is included in the range format element.
	 *  - Closure range format element is wrap the "format element" and "component"
	 * ※ You cannot exit this format with the Enter key or Backspace key.
	 * ※ Use it only in special cases. ([ex] format of table cells)
	 * @param element The node to check
	 * @returns
	 */
	isClosureRangeFormatElement(element: Node): boolean;

	/**
	 * @description It is judged whether it is the free format element. (PRE | class="__se__format__br_line_xxx")
	 * Free format elements is included in the format element.
	 * Free format elements's line break is "BR" tag.
	 * ※ Entering the Enter key in the space on the last line ends "Free Format" and appends "Format".
	 * @param element The node to check
	 * @returns
	 */
	isFreeFormatElement(element: Node): boolean;

	/**
	 * @description It is judged whether it is the closure free format element. (class="__se__format__br_line__closure_xxx")
	 * Closure free format elements is included in the free format element.
	 *  - Closure free format elements's line break is "BR" tag.
	 * ※ You cannot exit this format with the Enter key.
	 * ※ Use it only in special cases. ([ex] format of table cells)
	 * @param element The node to check
	 * @returns
	 */
	isClosureFreeFormatElement(element: Node): boolean;

	/**
	 * @description It is judged whether it is the component [img, iframe, video, audio] cover(class="se-component") and table, hr
	 * @param element The node to check
	 * @returns
	 */
	isComponent(element: Node): boolean;
}

export default Node;
