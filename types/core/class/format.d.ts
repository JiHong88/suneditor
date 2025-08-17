export default Format;
export type FormatThis = Omit<Format & Partial<__se__EditorInjector>, 'format'>;
export type NodeStyleContainerType = {
	ancestor?: (Node | null) | undefined;
	offset?: (number | null) | undefined;
	container?: (Node | null) | undefined;
	endContainer?: (Node | null) | undefined;
};
/**
 * @typedef {Omit<Format & Partial<__se__EditorInjector>, 'format'>} FormatThis
 */
/**
 * @typedef {Object} NodeStyleContainerType
 * @property {?Node=} ancestor
 * @property {?number=} offset
 * @property {?Node=} container
 * @property {?Node=} endContainer
 */
/**
 * @constructor
 * @this {FormatThis}
 * @description Classes related to editor formats such as line creation, line retrieval from selected range, etc.
 * @param {__se__EditorCore} editor - The root editor instance
 */
declare function Format(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, editor: __se__EditorCore): void;
declare class Format {
	/**
	 * @typedef {Omit<Format & Partial<__se__EditorInjector>, 'format'>} FormatThis
	 */
	/**
	 * @typedef {Object} NodeStyleContainerType
	 * @property {?Node=} ancestor
	 * @property {?number=} offset
	 * @property {?Node=} container
	 * @property {?Node=} endContainer
	 */
	/**
	 * @constructor
	 * @this {FormatThis}
	 * @description Classes related to editor formats such as line creation, line retrieval from selected range, etc.
	 * @param {__se__EditorCore} editor - The root editor instance
	 */
	constructor(editor: __se__EditorCore);
	_listCamel: any;
	_listKebab: any;
	_formatLineCheck: any;
	_formatBrLineCheck: any;
	_formatBlockCheck: any;
	_formatClosureBlockCheck: any;
	_formatClosureBrLineCheck: any;
	_textStyleTagsCheck: RegExp;
	_brLineBreak: boolean;
	/**
	 * @this {FormatThis}
	 * @description Replace the line tag of the current selection.
	 * @param {Node} element Line element (P, DIV..)
	 */
	setLine(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node): void;
	/**
	 * @this {FormatThis}
	 * @description If a parent node that contains an argument node finds a format node (format.isLine), it returns that node.
	 * @param {Node} node Reference node.
	 * @param {?(current: Node) => boolean=} validation Additional validation function.
	 * @returns {HTMLElement|null}
	 */
	getLine(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, node: Node, validation?: (((current: Node) => boolean) | null) | undefined): HTMLElement | null;
	/**
	 * @this {FormatThis}
	 * @description Replace the br-line tag of the current selection.
	 * @param {Node} element BR-Line element (PRE..)
	 */
	setBrLine(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node): void;
	/**
	 * @this {FormatThis}
	 * @description If a parent node that contains an argument node finds a "brLine" (format.isBrLine), it returns that node.
	 * @param {Node} element Reference node.
	 * @param {?(current: Node) => boolean=} validation Additional validation function.
	 * @returns {HTMLBRElement|null}
	 */
	getBrLine(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node, validation?: (((current: Node) => boolean) | null) | undefined): HTMLBRElement | null;
	/**
	 * @this {FormatThis}
	 * @description Append "line" element to sibling node of argument element.
	 * - If the "lineNode" argument value is present, the tag of that argument value is inserted,
	 * - If not, the currently selected format tag is inserted.
	 * @param {Node} element Insert as siblings of that element
	 * @param {?string|Node=} lineNode Node name or node obejct to be inserted
	 * @returns {HTMLElement}
	 */
	addLine(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node, lineNode?: ((string | Node) | null) | undefined): HTMLElement;
	/**
	 * @this {FormatThis}
	 * @description If a parent node that contains an argument node finds a format node (format.isBlock), it returns that node.
	 * @param {Node} element Reference node.
	 * @param {?(current: Node) => boolean=} validation Additional validation function.
	 * @returns {HTMLElement|null}
	 */
	getBlock(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node, validation?: (((current: Node) => boolean) | null) | undefined): HTMLElement | null;
	/**
	 * @this {FormatThis}
	 * @description Appended all selected "line" element to the argument element("block") and insert
	 * @param {Node} blockElement Element of wrap the arguments (BLOCKQUOTE...)
	 */
	applyBlock(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, blockElement: Node): void;
	/**
	 * @this {FormatThis}
	 * @description The elements of the "selectedFormats" array are detached from the "blockElement" element. ("LI" tags are converted to "P" tags)
	 * - When "selectedFormats" is null, all elements are detached and return {cc: parentNode, sc: nextSibling, ec: previousSibling, removeArray: [Array of removed elements]}.
	 * @param {Node} blockElement "block" element (PRE, BLOCKQUOTE, OL, UL...)
	 * @param {Object} [options] Options
	 * @param {Array<Node>} [options.selectedFormats=null] Array of "line" elements (P, DIV, LI...) to remove.
	 * - If null, Applies to all elements and return {cc: parentNode, sc: nextSibling, ec: previousSibling}
	 * @param {Node} [options.newBlockElement=null] The node(blockElement) to replace the currently wrapped node.
	 * @param {boolean} [options.shouldDelete=false] If true, deleted without detached.
	 * @param {boolean} [options.skipHistory=false] When true, it does not update the history stack and the selection object and return EdgeNodes (dom-query-GetEdgeChildNodes)
	 * @returns {{cc: Node, sc: Node, so: number, ec: Node, eo: number, removeArray: Array<Node>|null}} Node information after deletion
	 * - cc: Common parent container node
	 * - sc: Start container node
	 * - so: Start offset
	 * - ec: End container node
	 * - eo: End offset
	 * - removeArray: Array of removed elements
	 */
	removeBlock(
		this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>,
		blockElement: Node,
		{
			selectedFormats,
			newBlockElement,
			shouldDelete,
			skipHistory
		}?: {
			selectedFormats?: Array<Node>;
			newBlockElement?: Node;
			shouldDelete?: boolean;
			skipHistory?: boolean;
		}
	): {
		cc: Node;
		sc: Node;
		so: number;
		ec: Node;
		eo: number;
		removeArray: Array<Node> | null;
	};
	/**
	 * @this {FormatThis}
	 * @description Append all selected "line" element to the list and insert.
	 * @param {string} type List type. (ol | ul):[listStyleType]
	 * @param {Array<Node>} selectedCells "line" elements or list cells.
	 * @param {boolean} nested If true, indenting existing list cells.
	 */
	applyList(
		this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>,
		type: string,
		selectedCells: Array<Node>,
		nested: boolean
	): {
		sc: Node;
		so: number;
		ec: Node;
		eo: number;
	};
	/**
	 * @this {FormatThis}
	 * @description "selectedCells" array are detached from the list element.
	 * - The return value is applied when the first and last lines of "selectedFormats" are "LI" respectively.
	 * @param {Array<Node>} selectedCells Array of ["line", li] elements(LI, P...) to remove.
	 * @param {boolean} shouldDelete If true, It does not just remove the list, it deletes the content.
	 * @returns {{sc: Node, ec: Node}} Node information after deletion
	 * - sc: Start container node
	 * - ec: End container node
	 */
	removeList(
		this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>,
		selectedCells: Array<Node>,
		shouldDelete: boolean
	): {
		sc: Node;
		ec: Node;
	};
	/**
	 * @this {FormatThis}
	 * @description Indent more the selected lines.
	 * - margin size : 'status.indentSize'px
	 */
	indent(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>): void;
	/**
	 * @this {FormatThis}
	 * @description Indent less the selected lines.
	 * - margin size - "status.indentSize"px
	 */
	outdent(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>): void;
	/**
	 * @this {FormatThis}
	 * @description Adds, updates, or deletes style nodes from selected text (a, span, strong, etc.).
	 * @param {?Node} styleNode The element to be added to the selection. If null, only existing nodes are modified or removed.
	 * @param {Object} [options] Options
	 * @param {Array<string>} [options.stylesToModify=null] Array of style or class names to check and modify.
	 *        (e.g., ['font-size'], ['.className'], ['font-family', 'color', '.className'])
	 * @param {Array<string>} [options.nodesToRemove=null] Array of node names to remove.
	 *        If empty array or null when styleNode is null, all formats are removed.
	 *        (e.g., ['span'], ['strong', 'em'])
	 * @param {boolean} [options.strictRemove=false] If true, only removes nodes from nodesToRemove if all styles and classes are removed.
	 * @returns {HTMLElement} The element that was added to or modified in the selection.
	 *
	 * @details
	 * 1. If styleNode is provided, a node with the same tags and attributes is added to the selected text.
	 * 2. If the same tag already exists, only its attributes are updated.
	 * 3. If styleNode is null, existing nodes are updated or removed without adding new ones.
	 * 4. Styles matching those in stylesToModify are removed. (Use CSS attribute names, e.g., "background-color")
	 * 5. Classes matching those in stylesToModify (prefixed with ".") are removed.
	 * 6. stylesToModify is used to avoid duplicate property values from styleNode.
	 * 7. Nodes with all styles and classes removed are deleted if they match styleNode, are in nodesToRemove, or if styleNode is null.
	 * 8. Tags matching names in nodesToRemove are deleted regardless of their style and class.
	 * 9. If strictRemove is true, nodes in nodesToRemove are only removed if all their styles and classes are removed.
	 * 10. The function won't modify nodes if the parent has the same class and style values.
	 * - However, if nodesToRemove has values, it will work and separate text nodes even if there's no node to replace.
	 */
	applyInlineElement(
		this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>,
		styleNode: Node | null,
		{
			stylesToModify,
			nodesToRemove,
			strictRemove
		}?: {
			stylesToModify?: Array<string>;
			nodesToRemove?: Array<string>;
			strictRemove?: boolean;
		}
	): HTMLElement;
	/**
	 * @this {FormatThis}
	 * @description Remove format of the currently selected text.
	 */
	removeInlineElement(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>): void;
	/**
	 * @this {FormatThis}
	 * @description Check if the container and offset values are the edges of the "line"
	 * @param {Node} node The node of the selection object. (range.startContainer..)
	 * @param {number} offset The offset of the selection object. (selection.getRange().startOffset...)
	 * @param {"front"|"end"} dir Select check point - "front": Front edge, "end": End edge, undefined: Both edge.
	 * @returns {node is HTMLElement}
	 */
	isEdgeLine(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, node: Node, offset: number, dir: 'front' | 'end'): node is HTMLElement;
	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is a node related to the text style.
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isTextStyleNode(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node | string): element is HTMLElement;
	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the "line" element.
	 * - (P, DIV, H[1-6], PRE, LI | class="__se__format__line_xxx")
	 * - "line" element also contain "brLine" element
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isLine(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node | string): element is HTMLElement;
	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the only "line" element, not "brLine".
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isLineOnly(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node | string): element is HTMLElement;
	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the "brLine" element.
	 * - (PRE | class="__se__format__br_line_xxx")
	 * - "brLine" elements is included in the "line" element.
	 * - "brLine" elements's line break is "BR" tag.
	 * ※ Entering the Enter key in the space on the last line ends "brLine" and appends "line".
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isBrLine(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node | string): element is HTMLElement;
	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the "block" element.
	 * - (BLOCKQUOTE, OL, UL, FIGCAPTION, TABLE, THEAD, TBODY, TR, TH, TD | class="__se__format__block_xxx")
	 * - "block" is wrap the "line" and "component"
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isBlock(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node | string): element is HTMLElement;
	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the "closureBlock" element.
	 * - (TH, TD | class="__se__format__block_closure_xxx")
	 * - "closureBlock" elements is included in the "block".
	 * - "closureBlock" element is wrap the "line" and "component"
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. ([ex] format of table cells)
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isClosureBlock(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node | string): element is HTMLElement;
	/**
	 * @this {FormatThis}
	 * @description It is judged whether it is the "closureBrLine" element.
	 * - (class="__se__format__br_line__closure_xxx")
	 * - "closureBrLine" elements is included in the "brLine".
	 * - "closureBrLine" elements's line break is "BR" tag.
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. ([ex] format of table cells)
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isClosureBrLine(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node | string): element is HTMLElement;
	/**
	 * @this {FormatThis}
	 * @description Returns a "line" array from selected range.
	 * @param {?(current: Node) => boolean=} validation The validation function. (Replaces the default validation format.isLine(current))
	 * @returns {Array<HTMLElement>}
	 */
	getLines(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, validation?: (((current: Node) => boolean) | null) | undefined): Array<HTMLElement>;
	/**
	 * @this {FormatThis}
	 * @description Get lines and components from the selected range. (P, DIV, H[1-6], OL, UL, TABLE..)
	 * - If some of the component are included in the selection, get the entire that component.
	 * @param {boolean} removeDuplicate If true, if there is a parent and child tag among the selected elements, the child tag is excluded.
	 * @returns {Array<HTMLElement>}
	 */
	getLinesAndComponents(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, removeDuplicate: boolean): Array<HTMLElement>;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description A function that distinguishes areas where "selection" should not be placed
	 * @param {Node} element Element
	 * @returns {boolean}
	 */
	_isExcludeSelectionElement(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node): boolean;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description A function that distinguishes non-formatting HTML elements or tags from formatting ones.
	 * @param {Node} element Element
	 * @returns {boolean}
	 */
	_nonFormat(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node): boolean;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Nodes that must remain undetached when changing text nodes (A, Label, Code, Span:font-size)
	 * @param {Node|string} element Element to check
	 * @returns {boolean}
	 */
	_isNonSplitNode(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node | string): boolean;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Nodes without text
	 * @param {Node|string} element Element to check
	 * @returns {boolean}
	 */
	_notTextNode(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node | string): boolean;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Nodes that need to be added without modification when changing text nodes
	 * @param {Node} element Element to check
	 * @returns {boolean}
	 */
	_isIgnoreNodeChange(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node): boolean;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Get current selected lines and selected node info.
	 * @returns {{lines: Array<HTMLElement>, firstNode: Node,  lastNode: Node, firstPath: Array<number>, lastPath: Array<number>, startOffset: number, endOffset: number}}
	 */
	_lineWork(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>): {
		lines: Array<HTMLElement>;
		firstNode: Node;
		lastNode: Node;
		firstPath: Array<number>;
		lastPath: Array<number>;
		startOffset: number;
		endOffset: number;
	};
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Attaches a nested list structure by merging adjacent lists if applicable.
	 * - Ensures that the nested list is placed correctly in the document structure.
	 * @param {Element} originList The original list element where the nested list is inserted.
	 * @param {Element} innerList The nested list element.
	 * @param {Element} prev The previous sibling element.
	 * @param {Element} next The next sibling element.
	 * @param {{s: Array<number> | null, e: Array<number> | null, sl: Node | null, el: Node | null}} nodePath Object storing the start and end node paths.
	 * - s : Start node path.
	 * - e : End node path.
	 * - sl : Start node's parent element.
	 * - el : End node's parent element.
	 * @returns {Node} The attached inner list.
	 */
	_attachNested(
		this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>,
		originList: Element,
		innerList: Element,
		prev: Element,
		next: Element,
		nodePath: {
			s: Array<number> | null;
			e: Array<number> | null;
			sl: Node | null;
			el: Node | null;
		}
	): Node;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Detaches a nested list structure by extracting list items from their parent list.
	 * - Ensures proper restructuring of the list elements.
	 * @param {Array<HTMLElement>} cells The list items to be detached.
	 * @returns {{cc: Node, sc: Node, ec: Node}} An object containing reference nodes for repositioning.
	 * - cc : The parent node of the first list item.
	 * - sc : The first list item.
	 * - ec : The last list item.
	 */
	_detachNested(
		this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>,
		cells: Array<HTMLElement>
	): {
		cc: Node;
		sc: Node;
		ec: Node;
	};
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Nest list cells or cancel nested cells.
	 * @param {Array<HTMLElement>} selectedCells List cells.
	 * @param {boolean} nested Nested or cancel nested.
	 */
	_applyNestedList(
		this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>,
		selectedCells: Array<HTMLElement>,
		nested: boolean
	): {
		sc: Node;
		so: number;
		ec: Node;
		eo: number;
	};
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Detach Nested all nested lists under the "baseNode".
	 * - Returns a list with nested removed.
	 * @param {HTMLElement} baseNode Element on which to base.
	 * @param {boolean} all If true, it also detach all nested lists of a returned list.
	 * @returns {Node} Result element
	 */
	_removeNestedList(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, baseNode: HTMLElement, all: boolean): Node;
	/**
	 * @private
	 * @this {FormatThis}
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
	 * @returns {{ancestor: *, startContainer: *, startOffset: *, endContainer: *, endOffset: *}}
	 */
	_setNode_oneLine(
		this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>,
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
		_getMaintainedNode: any,
		_isMaintainedNode: any
	): {
		ancestor: any;
		startContainer: any;
		startOffset: any;
		endContainer: any;
		endOffset: any;
	};
	/**
	 * @private
	 * @this {FormatThis}
	 * @description wraps first line selected text.
	 * @param {Node} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {number} startOff The startOffset property of the selection object.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @returns {NodeStyleContainerType} { ancestor, container, offset, endContainer }
	 */
	_setNode_startLine(
		this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>,
		element: Node,
		newInnerNode: Node,
		validation: (current: Node) => Node | null,
		startCon: Node,
		startOff: number,
		isRemoveFormat: boolean,
		isRemoveNode: boolean,
		_removeCheck: any,
		_getMaintainedNode: any,
		_isMaintainedNode: any,
		_endContainer: any
	): NodeStyleContainerType;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description wraps mid lines selected text.
	 * @param {HTMLElement} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {Node} _endContainer Offset node of last line already modified (end.container)
	 * @returns {NodeStyleContainerType} { ancestor, endContainer: "If end container is renewed, returned renewed node" }
	 */
	_setNode_middleLine(
		this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>,
		element: HTMLElement,
		newInnerNode: Node,
		validation: (current: Node) => Node | null,
		isRemoveFormat: boolean,
		isRemoveNode: boolean,
		_removeCheck: any,
		_endContainer: Node
	): NodeStyleContainerType;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description wraps last line selected text.
	 * @param {Node} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {number} endOff The endOffset property of the selection object.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @returns {NodeStyleContainerType} { ancestor, container, offset }
	 */
	_setNode_endLine(
		this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>,
		element: Node,
		newInnerNode: Node,
		validation: (current: Node) => Node | null,
		endCon: Node,
		endOff: number,
		isRemoveFormat: boolean,
		isRemoveNode: boolean,
		_removeCheck: any,
		_getMaintainedNode: any,
		_isMaintainedNode: any
	): NodeStyleContainerType;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Node with font-size style
	 * @param {Node} element Element to check
	 * @returns {boolean}
	 */
	_sn_isSizeNode(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, element: Node): boolean;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Return the parent maintained tag. (bind and use a util object)
	 * @param {boolean} _isRemove is remove anchor
	 * @param {boolean} _isSizeNode is size span node
	 * @param {Node} element Element
	 * @returns {Node|null}
	 */
	_sn_getMaintainedNode(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, _isRemove: boolean, _isSizeNode: boolean, element: Node): Node | null;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Check if element is a tag that should be persisted. (bind and use a util object)
	 * @param {boolean} _isRemove is remove anchor
	 * @param {boolean} _isSizeNode is size span node
	 * @param {Node} element Element
	 * @returns {boolean}
	 */
	_sn_isMaintainedNode(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, _isRemove: boolean, _isSizeNode: boolean, element: Node): boolean;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description If certain styles are applied to all child nodes of the list cell, the style of the list cell is also changed. (bold, color, size)
	 * @param {Node} el List cell element. <li>
	 * @param {?Node} child Variable for recursive call. ("null" on the first call)
	 */
	_sn_setCommonListStyle(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, el: Node, child: Node | null): void;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Watch the applied text nodes and adjust the common styles of the list.
	 * @param {Node} el "LI" element
	 * @param {Array|null} styleArray Refer style array
	 */
	_sn_resetCommonListCell(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, el: Node, styleArray: any[] | null): boolean;
	/**
	 * @private
	 * @this {FormatThis}
	 * @description Reset the line break format.
	 * @param {"line"|"br"} breakFormat options.get('defaultLineBreakFormat')
	 */
	__resetBrLineBreak(this: Omit<Format & Partial<import('../../editorInjector').default>, 'format'>, breakFormat: 'line' | 'br'): void;
}
