import type {} from '../../../typedef';
export default Inline;
export type NodeStyleContainerType = {
	ancestor?: Node | null;
	offset?: number | null;
	container?: Node | null;
	endContainer?: Node | null;
};
/**
 * @typedef {Object} NodeStyleContainerType
 * @property {?Node} [ancestor]
 * @property {?number} [offset]
 * @property {?Node} [container]
 * @property {?Node} [endContainer]
 */
/**
 * @description Classes related to editor inline formats such as style node like strong, span, etc.
 */
declare class Inline {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/**
	 * @description Adds, updates, or deletes style nodes from selected text (a, span, strong, etc.).
	 * - 1. If `styleNode` is provided, a node with the same tags and attributes is added to the selected text.
	 * - 2. If the same tag already exists, only its attributes are updated.
	 * - 3. If `styleNode` is `null`, existing nodes are updated or removed without adding new ones.
	 * - 4. Styles matching those in `stylesToModify` are removed. (Use CSS attribute names, e.g., `background-color`)
	 * - 5. Classes matching those in `stylesToModify` (prefixed with `"."`) are removed.
	 * - 6. `stylesToModify` is used to avoid duplicate property values from `styleNode`.
	 * - 7. Nodes with all styles and classes removed are deleted if they match `styleNode`, are in `nodesToRemove`, or if `styleNode` is `null`.
	 * - 8. Tags matching names in `nodesToRemove` are deleted regardless of their style and class.
	 * - 9. If `strictRemove` is `true`, nodes in `nodesToRemove` are only removed if all their styles and classes are removed.
	 * - 10. The function won't modify nodes if the parent has the same class and style values.
	 * - However, if `nodesToRemove` has values, it will work and separate text nodes even if there's no node to replace.
	 * @param {?Node} styleNode The element to be added to the selection. If `null`, only existing nodes are modified or removed.
	 * @param {Object} [options] Options
	 * @param {Array<string>} [options.stylesToModify=null] Array of style or class names to check and modify.
	 *        (e.g., ['font-size'], ['.className'], ['font-family', 'color', '.className'])
	 * @param {Array<string>} [options.nodesToRemove=null] Array of node names to remove.
	 *        If empty array or `null` when `styleNode` is `null`, all formats are removed.
	 *        (e.g., ['span'], ['strong', 'em'])
	 * @param {boolean} [options.strictRemove=false] If `true`, only removes nodes from `nodesToRemove` if all styles and classes are removed.
	 * @returns {HTMLElement} The element that was added to or modified in the selection.
	 * @example
	 * // Apply bold formatting
	 * const bold = dom.utils.createElement('STRONG');
	 * editor.inline.apply(bold);
	 *
	 * // Remove specific styles
	 * editor.inline.apply(null, { stylesToModify: ['font-size'] });
	 *
	 * // Remove specific tags
	 * editor.inline.apply(null, { nodesToRemove: ['span'] });
	 */
	apply(
		styleNode: Node | null,
		{
			stylesToModify,
			nodesToRemove,
			strictRemove,
		}?: {
			stylesToModify?: Array<string>;
			nodesToRemove?: Array<string>;
			strictRemove?: boolean;
		},
	): HTMLElement;
	/**
	 * @description Remove all inline formats (styles and tags) from the currently selected text.
	 * - This is a convenience method that calls `apply()` with `null` parameters to strip all formatting.
	 * - Removes all inline style nodes (span, strong, em, a, etc.)
	 * - Preserves only the plain text content
	 * - Works on the current selection or collapsed cursor position
	 */
	remove(): void;
	/**
	 * @internal
	 * @description Nodes that must remain undetached when changing text nodes (A, Label, Code, Span:font-size)
	 * @param {Node|string} element Element to check
	 * @returns {boolean}
	 */
	_isNonSplitNode(element: Node | string): boolean;
	/**
	 * @internal
	 * @description Nodes that need to be added without modification when changing text nodes
	 * @param {Node} element Element to check
	 * @returns {boolean}
	 */
	_isIgnoreNodeChange(element: Node): boolean;
	#private;
}
