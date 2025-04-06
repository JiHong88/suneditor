export default NodeTransform;
export type NodeTransformThis = Omit<NodeTransform & Partial<__se__EditorInjector>, 'nodeTransform'>;
/**
 * @typedef {Omit<NodeTransform & Partial<__se__EditorInjector>, 'nodeTransform'>} NodeTransformThis
 */
/**
 * @constructor
 * @this {NodeTransformThis}
 * @description Node utility class. split, merge, etc.
 * @param {__se__EditorCore} editor - The root editor instance
 */
declare function NodeTransform(this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>, editor: __se__EditorCore): void;
declare class NodeTransform {
	/**
	 * @typedef {Omit<NodeTransform & Partial<__se__EditorInjector>, 'nodeTransform'>} NodeTransformThis
	 */
	/**
	 * @constructor
	 * @this {NodeTransformThis}
	 * @description Node utility class. split, merge, etc.
	 * @param {__se__EditorCore} editor - The root editor instance
	 */
	constructor(editor: __se__EditorCore);
	/**
	 * @this {NodeTransformThis}
	 * @template {HTMLElement} T
	 * @description Split all tags based on "baseNode"
	 * @param {Node} baseNode Element or text node on which to base
	 * @param {?number|Node} offset Text offset of "baseNode" (Only valid when "baseNode" is a text node)
	 * @param {number} [depth=0] The nesting depth of the element being split. (default: 0)
	 * @returns {T} The last element of the splited tag.
	 */
	split<T extends HTMLElement>(this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>, baseNode: Node, offset: (number | Node) | null, depth?: number): T;
	/**
	 * @this {NodeTransformThis}
	 * @description Use with "npdePath (dom-query-GetNodePath)" to merge the same attributes and tags if they are present and modify the nodepath.
	 * - If "offset" has been changed, it will return as much "offset" as it has been modified.
	 * - An array containing change offsets is returned in the order of the "nodePathArray" array.
	 * @param {Node} element Element
	 * @param {?number[][]=} nodePathArray Array of NodePath object ([dom-query-GetNodePath(), ..])
	 * @param {?boolean=} onlyText If true, non-text nodes like 'span', 'strong'.. are ignored.
	 * @returns {Array<number>} [offset, ..]
	 */
	mergeSameTags(this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>, element: Node, nodePathArray?: (number[][] | null) | undefined, onlyText?: (boolean | null) | undefined): Array<number>;
	/**
	 * @this {NodeTransformThis}
	 * @description Remove nested tags without other child nodes.
	 * @param {Node} element Element object
	 * @param {?(current: Node) => boolean|string=} validation Validation function / String("tag1|tag2..") / If null, all tags are applicable.
	 */
	mergeNestedTags(this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>, element: Node, validation?: (((current: Node) => boolean | string) | null) | undefined): void;
	/**
	 * @this {NodeTransformThis}
	 * @description Delete itself and all parent nodes that match the condition.
	 * - Returns an {sc: previousSibling, ec: nextSibling}(the deleted node reference) or null.
	 * @param {Node} item Node to be remove
	 * @param {?(current: Node) => boolean=} validation Validation function. default(Deleted if it only have breakLine and blanks)
	 * @param {?Node=} stopParent Stop when the parent node reaches stopParent
	 * @returns {{sc: Node|null, ec: Node|null}|null} {sc: previousSibling, ec: nextSibling} (the deleted node reference) or null.
	 */
	removeAllParents(
		this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>,
		item: Node,
		validation?: (((current: Node) => boolean) | null) | undefined,
		stopParent?: (Node | null) | undefined
	): {
		sc: Node | null;
		ec: Node | null;
	} | null;
	/**
	 * @this {NodeTransformThis}
	 * @description Delete a empty child node of argument element
	 * @param {Node} element Element node
	 * @param {?Node} notRemoveNode Do not remove node
	 * @param {boolean} forceDelete When all child nodes are deleted, the parent node is also deleted.
	 */
	removeEmptyNode(this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>, element: Node, notRemoveNode: Node | null, forceDelete: boolean): void;
	/**
	 * @this {NodeTransformThis}
	 * @description Creates a nested node structure from the given array of nodes.
	 * @param {__se__NodeCollection} nodeArray An array of nodes to clone. The first node in the array will be the top-level parent.
	 * @param {?(current: Node) => boolean=} validate A validate function.
	 * @returns {{ parent: Node, inner: Node }} An object containing the top-level parent node and the innermost child node.
	 */
	createNestedNode(
		this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>,
		nodeArray: __se__NodeCollection,
		validate?: (((current: Node) => boolean) | null) | undefined
	): {
		parent: Node;
		inner: Node;
	};
}
