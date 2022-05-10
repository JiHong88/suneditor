import EditorClass from "../../interface/editor";

class Node extends EditorClass {
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
	 * @description Delete all parent nodes that match the condition.
	 * Returns an {sc: previousSibling, ec: nextSibling}(the deleted node reference) or null.
	 * @param item Node to be remove
	 * @param validation Validation function. default(Deleted if it only have breakLine and blanks)
	 * @param stopParent Stop when the parent node reaches stopParent
	 * @returns
	 */
	removeAllParents(item: Node, validation?: Function, stopParent?: Element): Record<string, Node | null> | null;

	/**
	 * @description Delete a empty child node of argument element
	 * @param element Element node
	 * @param notRemoveNode Do not remove node
	 */
	removeEmptyNode(element: Element, notRemoveNode?: Node): void;

	/**
	 * @description Remove whitespace between tags in HTML string.
	 * @param html HTML string
	 * @returns
	 */
	removeWhiteSpace(html: string): string;
}

export default Node;
