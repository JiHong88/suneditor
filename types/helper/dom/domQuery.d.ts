import type {} from '../../typedef';
/**
 * @description Returns the index compared to other sibling nodes.
 * @param {Node} node The Node to find index
 * @returns {number}
 */
export function getPositionIndex(node: Node): number;
/**
 * @description Returns the position of the "node" in the "parentNode" in a numerical array.
 * - e.g.) <p><span>aa</span><span>bb</span></p> : getNodePath(node: "bb", parentNode: "<P>") -> [1, 0]
 * @param {Node} node The Node to find position path
 * @param {?Node} parentNode Parent node. If null, wysiwyg div area
 * @param {?{s: number, e: number}=} _newOffsets If you send an object of the form "{s: 0, e: 0}", the text nodes that are attached together are merged into one, centered on the "node" argument.
 * "_newOffsets.s" stores the length of the combined characters after "node" and "_newOffsets.e" stores the length of the combined characters before "node".
 * Do not use unless absolutely necessary.
 * @returns {Array<number>}
 */
export function getNodePath(
	node: Node,
	parentNode: Node | null,
	_newOffsets?:
		| ({
				s: number;
				e: number;
		  } | null)
		| undefined,
): Array<number>;
/**
 * @template {Node} T
 * @description Returns the node in the location of the path array obtained from "helper.dom.getNodePath".
 * @param {Array<number>} offsets Position array, array obtained from "helper.dom.getNodePath"
 * @param {Node} parentNode Base parent element
 * @returns {T}
 */
export function getNodeFromPath<T extends Node>(offsets: Array<number>, parentNode: Node): T;
/**
 * @template {HTMLElement} T
 * @description Get all "child node" of the argument value element
 * @param {Node} element element to get child node
 * @param {?(current: *) => boolean} validation Conditional function
 * @returns {T|null}
 */
export function getChildNode<T extends HTMLElement>(element: Node, validation: ((current: any) => boolean) | null): T | null;
/**
 * @template {HTMLElement} T
 * @description Get all "children" of the argument value element (Without text nodes)
 * @param {Node} element element to get child node
 * @param {?(current: *) => boolean} validation Conditional function
 * @param {?number} depth Number of child levels to depth.
 * @returns {Array<T>}
 */
export function getListChildren<T extends HTMLElement>(element: Node, validation: ((current: any) => boolean) | null, depth: number | null): Array<T>;
/**
 * @template {Node} T
 * @description Get all "childNodes" of the argument value element (Include text nodes)
 * @param {Node} element element to get child node
 * @param {?(current: *) => boolean} validation Conditional function
 * @param {?number} depth Number of child levels to depth.
 * @returns {Array<T>}
 */
export function getListChildNodes<T extends Node>(element: Node, validation: ((current: any) => boolean) | null, depth: number | null): Array<T>;
/**
 * @description Returns the number of parents nodes.
 * - "0" when the parent node is the WYSIWYG area.
 * - '-1' when the element argument is the WYSIWYG area.
 * @param {Node} node The element to check
 * @returns {number}
 */
export function getNodeDepth(node: Node): number;
/**
 * @description Sort a node array by depth of element.
 * @param {Array<Node>} array Node array
 * @param {boolean} des true: descending order / false: ascending order
 */
export function sortNodeByDepth(array: Array<Node>, des: boolean): void;
/**
 * @description Compares two elements to find a common ancestor, and returns the order of the two elements.
 * @param {Node} a Node to compare.
 * @param {Node} b Node to compare.
 * @returns {{ancestor: HTMLElement|null, a: Node, b: Node, result: number}} { ancesstor, a, b, result: (a > b ? 1 : a < b ? -1 : 0) };
 */
export function compareElements(
	a: Node,
	b: Node,
): {
	ancestor: HTMLElement | null;
	a: Node;
	b: Node;
	result: number;
};
/**
 * @template {HTMLElement} T
 * @description Get the parent element of the argument value.
 * - A tag that satisfies the query condition is imported.
 * @param {Node} element Reference element
 * @param {string|((current: *) => boolean)|Node} query Query String (nodeName, .className, #ID, :name) or validation function.
 * - Not use it like jquery.
 * - Only one condition can be entered at a time.
 * @param {?number=} depth Number of parent levels to depth.
 * @returns {T|null} Not found: null
 */
export function getParentElement<T extends HTMLElement>(element: Node, query: string | ((current: any) => boolean) | Node, depth?: (number | null) | undefined): T | null;
/**
 * @template {HTMLElement} T
 * @description Gets all ancestors of the argument value.
 * - Get all tags that satisfy the query condition.
 * @param {Node} element Reference element
 * @param {string|((current: *) => boolean)|Node} query Query String (nodeName, .className, #ID, :name) or validation function.
 * Not use it like jquery.
 * Only one condition can be entered at a time.
 * @param {?number=} depth Number of parent levels to depth.
 * @returns {Array<T>} Returned in an array in order.
 */
export function getParentElements<T extends HTMLElement>(element: Node, query: string | ((current: any) => boolean) | Node, depth?: (number | null) | undefined): Array<T>;
/**
 * @template {HTMLElement} T
 * @description Gets the element with "data-command" attribute among the parent elements.
 * @param {Node} target Target element
 * @returns {T|null}
 */
export function getCommandTarget<T extends HTMLElement>(target: Node): T | null;
/**
 * @template {HTMLElement} T
 * @description Get the event.target element.
 * @param {Event} event Event object
 * @returns {T|null}
 */
export function getEventTarget<T extends HTMLElement>(event: Event): T | null;
/**
 * @template {Node} T
 * @description Get the child element of the argument value.
 * - A tag that satisfies the query condition is imported.
 * @param {Node} node Reference element
 * @param {string|((current: *) => boolean)|Node} query Query String (nodeName, .className, #ID, :name) or validation function.
 * @param {boolean} last If true returns the last node among the found child nodes. (default: first node)
 * Not use it like jquery.
 * Only one condition can be entered at a time.
 * @returns {T|null} Not found: null
 */
export function getEdgeChild<T extends Node>(node: Node, query: string | ((current: any) => boolean) | Node, last: boolean): T | null;
/**
 * @description Get edge child nodes of the argument value.
 * - 1. The first node of all the child nodes of the "first" element is returned.
 * - 2. The last node of all the child nodes of the "last" element is returned.
 * - 3. When there is no "last" element, the first and last nodes of all the children of the "first" element are returned.
 * @param {Node} first First element
 * @param {Node|null} last Last element
 * @returns {{sc: Node, ec: Node}} { sc: "first", ec: "last" }
 */
export function getEdgeChildNodes(
	first: Node,
	last: Node | null,
): {
	sc: Node;
	ec: Node;
};
/**
 * @template {Node} T
 * @description Gets the previous sibling last child. If there is no sibling, then it'll take it from the closest ancestor with child
 * @param {Node} node Reference element
 * @param {?Node=} ceiling Highest boundary allowed
 * @returns {T|null} Not found: null
 */
export function getPreviousDeepestNode<T extends Node>(node: Node, ceiling?: (Node | null) | undefined): T | null;
/**
 * @template {Node} T
 * @description Gets the next sibling first child. If there is no sibling, then it'll take it from the closest ancestor with child
 * @param {Node} node Reference element
 * @param {?Node=} ceiling Highest boundary allowed
 * @returns {T|null} Not found: null
 */
export function getNextDeepestNode<T extends Node>(node: Node, ceiling?: (Node | null) | undefined): T | null;
/**
 * @description Find the index of the text node in the line element.
 * @param {Node} line Line element (p, div, etc.)
 * @param {Node} offsetContainer Base node to start searching
 * @param {number} offset Base offset to start searching
 * @param {?(current: *) => boolean=} validate Validation function
 * @returns {number}
 */
export function findTextIndexOnLine(line: Node, offsetContainer: Node, offset: number, validate?: (((current: any) => boolean) | null) | undefined): number;
/**
 * @description Find the end index of a sequence of at least minTabSize consecutive non-breaking spaces or spaces
 * - which are interpreted as a tab key, occurring after a given base index in a text string.
 * @param {Node} line Line element (p, div, etc.)
 * @param {number} baseIndex Base index to start searching
 * @param {number} minTabSize Minimum number of consecutive spaces to consider as a tab
 * @returns {number} The adjusted index within the line element accounting for non-space characters
 */
export function findTabEndIndex(line: Node, baseIndex: number, minTabSize: number): number;
/**
 * @description Finds the table cell that appears visually at the bottom-right position,
 * considering both rowSpan and colSpan, even if smaller cells are placed after large merged cells.
 *
 * @param {HTMLTableCellElement[]} cells
 * @returns {HTMLTableCellElement|null}
 */
export function findVisualLastCell(cells: HTMLTableCellElement[]): HTMLTableCellElement | null;
/**
 * @description Finds and returns parent containers that are scrollable.
 * @param {HTMLElement} element - Element to start with
 * @returns {HTMLElement[]} - Array (in descending order)
 */
export function getScrollParents(element: HTMLElement): HTMLElement[];
/**
 * @description Get the argument iframe's document object if use the "iframe" or "fullPage" options
 * @param {HTMLIFrameElement} iframe Iframe element (this.frameContext.get('wysiwygFrame'))
 * @returns {Document}
 */
export function getIframeDocument(iframe: HTMLIFrameElement): Document;
export default query;
declare namespace query {
	export { getPositionIndex };
	export { getNodePath };
	export { getNodeFromPath };
	export { getChildNode };
	export { getListChildren };
	export { getListChildNodes };
	export { getNodeDepth };
	export { sortNodeByDepth };
	export { compareElements };
	export { getParentElement };
	export { getParentElements };
	export { getCommandTarget };
	export { getEventTarget };
	export { getEdgeChild };
	export { getEdgeChildNodes };
	export { getPreviousDeepestNode };
	export { getNextDeepestNode };
	export { findTextIndexOnLine };
	export { findTabEndIndex };
	export { findVisualLastCell };
	export { getScrollParents };
	export { getIframeDocument };
}
