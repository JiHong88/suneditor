import type {} from '../../typedef';
export default Inline;
export type InlineThis = Omit<Inline & Partial<SunEditor.Injector_Core>, 'inline'>;
export type NodeStyleContainerType = {
	ancestor?: Node | null;
	offset?: number | null;
	container?: Node | null;
	endContainer?: Node | null;
};
/**
 * @typedef {Omit<Inline & Partial<SunEditor.Injector_Core>, 'inline'>} InlineThis
 */
/**
 * @typedef {Object} NodeStyleContainerType
 * @property {?Node} [ancestor]
 * @property {?number} [offset]
 * @property {?Node} [container]
 * @property {?Node} [endContainer]
 */
/**
 * @constructor
 * @this {InlineThis}
 * @description Classes related to editor inline formats such as style node like strong, span, etc.
 * @param {SunEditor.Core} editor - The root editor instance
 */
declare function Inline(this: Omit<Inline & Partial<CoreInjector>, 'inline'>, editor: SunEditor.Core): void;
declare class Inline {
	/**
	 * @typedef {Omit<Inline & Partial<SunEditor.Injector_Core>, 'inline'>} InlineThis
	 */
	/**
	 * @typedef {Object} NodeStyleContainerType
	 * @property {?Node} [ancestor]
	 * @property {?number} [offset]
	 * @property {?Node} [container]
	 * @property {?Node} [endContainer]
	 */
	/**
	 * @constructor
	 * @this {InlineThis}
	 * @description Classes related to editor inline formats such as style node like strong, span, etc.
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	_listCamel: any;
	_listKebab: any;
	/** @internal @type {SunEditor.Core['selection']} */
	get selection(): SunEditor.Core['selection'];
	/** @internal @type {SunEditor.Core['format']} */
	get format(): SunEditor.Core['format'];
	/** @internal @type {SunEditor.Core['component']} */
	get component(): SunEditor.Core['component'];
	/** @internal @type {SunEditor.Core['ui']} */
	get ui(): SunEditor.Core['ui'];
	/** @internal @type {SunEditor.Core['nodeTransform']} */
	get nodeTransform(): SunEditor.Core['nodeTransform'];
	/**
	 * @this {InlineThis}
	 * @description Adds, updates, or deletes style nodes from selected text (a, span, strong, etc.).
	 * - 1. If styleNode is provided, a node with the same tags and attributes is added to the selected text.
	 * - 2. If the same tag already exists, only its attributes are updated.
	 * - 3. If styleNode is null, existing nodes are updated or removed without adding new ones.
	 * - 4. Styles matching those in stylesToModify are removed. (Use CSS attribute names, e.g., "background-color")
	 * - 5. Classes matching those in stylesToModify (prefixed with ".") are removed.
	 * - 6. stylesToModify is used to avoid duplicate property values from styleNode.
	 * - 7. Nodes with all styles and classes removed are deleted if they match styleNode, are in nodesToRemove, or if styleNode is null.
	 * - 8. Tags matching names in nodesToRemove are deleted regardless of their style and class.
	 * - 9. If strictRemove is true, nodes in nodesToRemove are only removed if all their styles and classes are removed.
	 * - 10. The function won't modify nodes if the parent has the same class and style values.
	 * - However, if nodesToRemove has values, it will work and separate text nodes even if there's no node to replace.
	 * @param {?Node} styleNode The element to be added to the selection. If null, only existing nodes are modified or removed.
	 * @param {Object} [options] Options
	 * @param {Array<string>} [options.stylesToModify=null] Array of style or class names to check and modify.
	 *        (e.g., ['font-size'], ['.className'], ['font-family', 'color', '.className'])
	 * @param {Array<string>} [options.nodesToRemove=null] Array of node names to remove.
	 *        If empty array or null when styleNode is null, all formats are removed.
	 *        (e.g., ['span'], ['strong', 'em'])
	 * @param {boolean} [options.strictRemove=false] If true, only removes nodes from nodesToRemove if all styles and classes are removed.
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
		this: Omit<Inline & Partial<CoreInjector>, 'inline'>,
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
	 * @this {InlineThis}
	 * @description Remove all inline formats (styles and tags) from the currently selected text.
	 * - This is a convenience method that calls apply() with null parameters to strip all formatting.
	 * - Removes all inline style nodes (span, strong, em, a, etc.)
	 * - Preserves only the plain text content
	 * - Works on the current selection or collapsed cursor position
	 */
	remove(this: Omit<Inline & Partial<CoreInjector>, 'inline'>): void;
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Nodes that must remain undetached when changing text nodes (A, Label, Code, Span:font-size)
	 * @param {Node|string} element Element to check
	 * @returns {boolean}
	 */
	_isNonSplitNode(this: Omit<Inline & Partial<CoreInjector>, 'inline'>, element: Node | string): boolean;
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Nodes that need to be added without modification when changing text nodes
	 * @param {Node} element Element to check
	 * @returns {boolean}
	 */
	_isIgnoreNodeChange(this: Omit<Inline & Partial<CoreInjector>, 'inline'>, element: Node): boolean;
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description wraps text nodes of line selected text.
	 * @param {Node} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {number} startOff The startOffset property of the selection object.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {number} endOff The endOffset property of the selection object.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {boolean} collapsed range.collapsed
	 * @param {Object} _removeCheck Object with "v" property tracking removal state.
	 * @param {(element: Node) => Node|null} _getMaintainedNode Function to get maintained parent node.
	 * @param {(element: Node) => boolean} _isMaintainedNode Function to check if node should be maintained.
	 * @returns {{ancestor: *, startContainer: *, startOffset: *, endContainer: *, endOffset: *}}
	 */
	_setNode_oneLine(
		this: Omit<Inline & Partial<CoreInjector>, 'inline'>,
		element: Node,
		newInnerNode: Node,
		validation: (current: Node) => Node | null,
		startCon: Node,
		startOff: number,
		endCon: Node,
		endOff: number,
		isRemoveFormat: boolean,
		isRemoveNode: boolean,
		collapsed: boolean,
		_removeCheck: any,
		_getMaintainedNode: (element: Node) => Node | null,
		_isMaintainedNode: (element: Node) => boolean,
	): {
		ancestor: any;
		startContainer: any;
		startOffset: any;
		endContainer: any;
		endOffset: any;
	};
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description wraps first line selected text.
	 * @param {Node} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {number} startOff The startOffset property of the selection object.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {Object} _removeCheck Object tracking removal state.
	 * @param {(element: Node) => Node|null} _getMaintainedNode Function to get maintained parent node.
	 * @param {(element: Node) => boolean} _isMaintainedNode Function to check if node should be maintained.
	 * @param {Node} _endContainer End container node.
	 * @returns {NodeStyleContainerType} { ancestor, container, offset, endContainer }
	 */
	_setNode_startLine(
		this: Omit<Inline & Partial<CoreInjector>, 'inline'>,
		element: Node,
		newInnerNode: Node,
		validation: (current: Node) => Node | null,
		startCon: Node,
		startOff: number,
		isRemoveFormat: boolean,
		isRemoveNode: boolean,
		_removeCheck: any,
		_getMaintainedNode: (element: Node) => Node | null,
		_isMaintainedNode: (element: Node) => boolean,
		_endContainer: Node,
	): NodeStyleContainerType;
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description wraps mid lines selected text.
	 * @param {HTMLElement} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {Object} _removeCheck Object tracking removal state.
	 * @param {Node} _endContainer Offset node of last line already modified (end.container)
	 * @returns {NodeStyleContainerType} { ancestor, endContainer: "If end container is renewed, returned renewed node" }
	 */
	_setNode_middleLine(
		this: Omit<Inline & Partial<CoreInjector>, 'inline'>,
		element: HTMLElement,
		newInnerNode: Node,
		validation: (current: Node) => Node | null,
		isRemoveFormat: boolean,
		isRemoveNode: boolean,
		_removeCheck: any,
		_endContainer: Node,
	): NodeStyleContainerType;
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description wraps last line selected text.
	 * @param {Node} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {number} endOff The endOffset property of the selection object.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {Object} _removeCheck Object tracking removal state.
	 * @param {(element: Node) => Node|null} _getMaintainedNode Function to get maintained parent node.
	 * @param {(element: Node) => boolean} _isMaintainedNode Function to check if node should be maintained.
	 * @returns {NodeStyleContainerType} { ancestor, container, offset }
	 */
	_setNode_endLine(
		this: Omit<Inline & Partial<CoreInjector>, 'inline'>,
		element: Node,
		newInnerNode: Node,
		validation: (current: Node) => Node | null,
		endCon: Node,
		endOff: number,
		isRemoveFormat: boolean,
		isRemoveNode: boolean,
		_removeCheck: any,
		_getMaintainedNode: (element: Node) => Node | null,
		_isMaintainedNode: (element: Node) => boolean,
	): NodeStyleContainerType;
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Node with font-size style
	 * @param {Node} element Element to check
	 * @returns {boolean}
	 */
	_sn_isSizeNode(this: Omit<Inline & Partial<CoreInjector>, 'inline'>, element: Node): boolean;
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Return the parent maintained tag. (bind and use a util object)
	 * @param {boolean} _isRemove is remove anchor
	 * @param {boolean} _isSizeNode is size span node
	 * @param {Node} element Element
	 * @returns {Node|null}
	 */
	_sn_getMaintainedNode(this: Omit<Inline & Partial<CoreInjector>, 'inline'>, _isRemove: boolean, _isSizeNode: boolean, element: Node): Node | null;
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Check if element is a tag that should be persisted. (bind and use a util object)
	 * @param {boolean} _isRemove is remove anchor
	 * @param {boolean} _isSizeNode is size span node
	 * @param {Node} element Element
	 * @returns {boolean}
	 */
	_sn_isMaintainedNode(this: Omit<Inline & Partial<CoreInjector>, 'inline'>, _isRemove: boolean, _isSizeNode: boolean, element: Node): boolean;
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description If certain styles are applied to all child nodes of the list cell, the style of the list cell is also changed. (bold, color, size)
	 * @param {Node} el List cell element. <li>
	 * @param {?Node} child Variable for recursive call. ("null" on the first call)
	 */
	_sn_setCommonListStyle(this: Omit<Inline & Partial<CoreInjector>, 'inline'>, el: Node, child: Node | null): void;
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Watch the applied text nodes and adjust the common styles of the list.
	 * @param {Node} el "LI" element
	 * @param {?Array} styleArray Refer style array
	 */
	_sn_resetCommonListCell(this: Omit<Inline & Partial<CoreInjector>, 'inline'>, el: Node, styleArray: any[] | null): boolean;
	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Destroy the Inline instance and release memory
	 */
	_destroy(this: Omit<Inline & Partial<CoreInjector>, 'inline'>): void;
}
import CoreInjector from '../../editorInjector/_core';
