import type {} from '../../typedef';
export default NodeTransform;
export type NodeTransformThis = Omit<NodeTransform & Partial<SunEditor.Injector>, 'nodeTransform'>;
/**
 * @typedef {Omit<NodeTransform & Partial<SunEditor.Injector>, 'nodeTransform'>} NodeTransformThis
 */
/**
 * @constructor
 * @this {NodeTransformThis}
 * @description Node utility class. split, merge, etc.
 * @param {SunEditor.Core} editor - The root editor instance
 */
declare function NodeTransform(this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>, editor: SunEditor.Core): void;
declare class NodeTransform {
	/**
	 * @typedef {Omit<NodeTransform & Partial<SunEditor.Injector>, 'nodeTransform'>} NodeTransformThis
	 */
	/**
	 * @constructor
	 * @this {NodeTransformThis}
	 * @description Node utility class. split, merge, etc.
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	/**
	 * @this {NodeTransformThis}
	 * @template {HTMLElement} T
	 * @description Split all tags based on "baseNode"
	 * @param {Node} baseNode Element or text node on which to base
	 * @param {?(number|Node)} offset Text offset of "baseNode" (Only valid when "baseNode" is a text node)
	 * @param {number} [depth=0] The nesting depth of the element being split. (default: 0)
	 * @returns {T} The last element of the splited tag.
	 * @example
	 * // Split at text offset
	 * const textNode = editor.selection.getNode();
	 * const newElement = editor.nodeTransform.split(textNode, 5, 0);
	 *
	 * // Split at specific depth to preserve parent structure
	 * const paragraph = editor.selection.getNode().closest('p');
	 * editor.nodeTransform.split(textNode, 10, 2);
	 *
	 * // Split by node reference
	 * const splitResult = editor.nodeTransform.split(parentNode, childNode, 1);
	 */
	split<T extends HTMLElement>(this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>, baseNode: Node, offset: (number | Node) | null, depth?: number): T;
	/**
	 * @this {NodeTransformThis}
	 * @description Use with "npdePath (dom-query-GetNodePath)" to merge the same attributes and tags if they are present and modify the nodepath.
	 * - If "offset" has been changed, it will return as much "offset" as it has been modified.
	 * - An array containing change offsets is returned in the order of the "nodePathArray" array.
	 * @param {Node} element Element
	 * @param {?number[][]} [nodePathArray] Array of NodePath object ([dom-query-GetNodePath(), ..])
	 * @param {?boolean} [onlyText] If true, non-text nodes like 'span', 'strong'.. are ignored.
	 * @returns {Array<number>} [offset, ..]
	 * @example
	 * // Merge adjacent tags with same attributes
	 * const container = editor.selection.getNode().closest('div');
	 * editor.nodeTransform.mergeSameTags(container, null, false);
	 *
	 * // Merge with path tracking
	 * const startPath = [0, 1, 2];
	 * const endPath = [0, 2, 1];
	 * const offsets = editor.nodeTransform.mergeSameTags(element, [startPath, endPath], false);
	 *
	 * // Merge only text nodes
	 * editor.nodeTransform.mergeSameTags(paragraph, null, true);
	 */
	mergeSameTags(this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>, element: Node, nodePathArray?: number[][] | null, onlyText?: boolean | null): Array<number>;
	/**
	 * @this {NodeTransformThis}
	 * @description Remove nested tags without other child nodes.
	 * @param {Node} element Element object
	 * @param {?(((current: Node) => boolean)|string)} [validation] Validation function / String("tag1|tag2..") / If null, all tags are applicable.
	 */
	mergeNestedTags(this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>, element: Node, validation?: (((current: Node) => boolean) | string) | null): void;
	/**
	 * @this {NodeTransformThis}
	 * @description Delete itself and all parent nodes that match the condition.
	 * - Returns an {sc: previousSibling, ec: nextSibling}(the deleted node reference) or null.
	 * @param {Node} item Node to be remove
	 * @param {?(current: Node) => boolean} [validation] Validation function. default(Deleted if it only have breakLine and blanks)
	 * @param {?Node} [stopParent] Stop when the parent node reaches stopParent
	 * @returns {{sc: Node|null, ec: Node|null}|null} {sc: previousSibling, ec: nextSibling} (the deleted node reference) or null.
	 * @example
	 * // Remove empty parent elements recursively
	 * const emptySpan = document.querySelector('span:empty');
	 * const result = editor.nodeTransform.removeAllParents(emptySpan, null, null);
	 *
	 * // Remove with custom validation
	 * editor.nodeTransform.removeAllParents(node, (current) => {
	 *   return current.textContent.trim().length === 0;
	 * }, null);
	 *
	 * // Remove up to specific parent
	 * const stopAt = editor.selection.getNode().closest('.container');
	 * editor.nodeTransform.removeAllParents(childNode, null, stopAt);
	 */
	removeAllParents(
		this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>,
		item: Node,
		validation?: ((current: Node) => boolean) | null,
		stopParent?: Node | null,
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
	 * @param {SunEditor.NodeCollection} nodeArray An array of nodes to clone. The first node in the array will be the top-level parent.
	 * @param {?(current: Node) => boolean} [validate] A validate function.
	 * @returns {{ parent: Node, inner: Node }} An object containing the top-level parent node and the innermost child node.
	 */
	createNestedNode(
		this: Omit<NodeTransform & Partial<import('../../editorInjector').default>, 'nodeTransform'>,
		nodeArray: SunEditor.NodeCollection,
		validate?: ((current: Node) => boolean) | null,
	): {
		parent: Node;
		inner: Node;
	};
}
