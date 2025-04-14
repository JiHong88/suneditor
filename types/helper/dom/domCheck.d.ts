/**
 * @description A method that checks If the text is blank or to see if it contains 'ZERO WIDTH SPACE' or empty (unicode.zeroWidthSpace)
 * @param {string|Node} text String value or Node
 * @returns {boolean}
 */
export function isZeroWidth(text: string | Node): boolean;
/**
 * @description Determine if this offset is the edge offset of container
 * @param {Node} container The node of the selection object. (range.startContainer..)
 * @param {number} offset The offset of the selection object. (core.getRange().startOffset...)
 * @param {?"front"|"end"=} dir Select check point - Both edge, Front edge or End edge. ("front": Front edge, "end": End edge, undefined: Both edge)
 * @returns {boolean}
 */
export function isEdgePoint(container: Node, offset: number, dir?: (('front' | 'end') | null) | undefined): boolean;
/**
 * @description Check the node is a text node.
 * @param {?Node} node The node to check
 * @returns {node is Text}
 */
export function isText(node: Node | null): node is Text;
/**
 * @description Check the node is an HTMLElement node.
 * @param {?Node} node The node to check
 * @returns {node is HTMLElement}
 */
export function isElement(node: Node | null): node is HTMLElement;
/**
 * @description It is judged whether it is the input element (INPUT, TEXTAREA)
 * @param {?Node} node The node to check
 * @returns {node is HTMLInputElement}
 */
export function isInputElement(node: Node | null): node is HTMLInputElement;
/**
 * @description It is judged whether it is the button element
 * @param {?Node} node The node to check
 * @returns {node is HTMLButtonElement}
 */
export function isButtonElement(node: Node | null): node is HTMLButtonElement;
/**
 * @description Check the node is a list (ol, ul)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLOListElement|HTMLUListElement}
 */
export function isList(node: (Node | string) | null): node is HTMLOListElement | HTMLUListElement;
/**
 * @description Check the node is a list cell (li)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLLIElement}
 */
export function isListCell(node: (Node | string) | null): node is HTMLLIElement;
/**
 * @description Check the node is a table
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLTableElement}
 */
export function isTable(node: (Node | string) | null): node is HTMLTableElement;
/**
 * @description Check the node is a table elements. (table, thead, tbody, tr, th, td)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLTableElement|HTMLTableSectionElement|HTMLTableRowElement|HTMLTableCellElement|HTMLTableColElement|HTMLTableColElement}
 */
export function isTableElements(node: (Node | string) | null): node is HTMLTableElement | HTMLTableSectionElement | HTMLTableRowElement | HTMLTableCellElement | HTMLTableColElement | HTMLTableColElement;
/**
 * @description Check the node is a table cell (td, th)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLTableCellElement|HTMLTableColElement}
 */
export function isTableCell(node: (Node | string) | null): node is HTMLTableCellElement | HTMLTableColElement;
/**
 * @description Check the node is a table row (tr)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLTableRowElement}
 */
export function isTableRow(node: (Node | string) | null): node is HTMLTableRowElement;
/**
 * @description Check the node is a break node (BR)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLBRElement}
 */
export function isBreak(node: (Node | string) | null): node is HTMLBRElement;
/**
 * @description Check the node is a anchor node (A)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLAnchorElement}
 */
export function isAnchor(node: (Node | string) | null): node is HTMLAnchorElement;
/**
 * @description Check the node is a media node (img, iframe, audio, video, canvas)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLImageElement|HTMLIFrameElement|HTMLAudioElement|HTMLVideoElement|HTMLCanvasElement}
 */
export function isMedia(node: (Node | string) | null): node is HTMLImageElement | HTMLIFrameElement | HTMLAudioElement | HTMLVideoElement | HTMLCanvasElement;
/**
 * @description Check the node is a iframe tag
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLIFrameElement}
 */
export function isIFrame(node: (Node | string) | null): node is HTMLIFrameElement;
/**
 * @description Check the node is a figure tag
 * @param {?Node|string} node The element or element name to check
 * @returns {boolean}
 */
export function isFigure(node: (Node | string) | null): boolean;
/**
 * @description Checks whether the given node is a content-less (void) HTML tag
 * @param {?Node|string} node The element or element name to check
 * @returns {boolean}
 */
export function isContentLess(node: (Node | string) | null): boolean;
/**
 * @description Check the line element is empty.
 * @param {Node} node "line" element node
 * @returns {boolean}
 */
export function isEmptyLine(node: Node): boolean;
/**
 * @description It is judged whether it is the edit region top div element or iframe's body tag.
 * @param {?Node} node The node to check
 * @returns {node is HTMLElement}
 */
export function isWysiwygFrame(node: Node | null): node is HTMLElement;
/**
 * @description It is judged whether it is the contenteditable property is false.
 * @param {?Node} node The node to check
 * @returns {node is HTMLElement}
 */
export function isNonEditable(node: Node | null): node is HTMLElement;
/**
 * @description Check the span's attributes are empty.
 * @param {?Node} node Element node
 * @returns {boolean}
 */
export function isSpanWithoutAttr(node: Node | null): boolean;
/**
 * @description Compares the style and class for equal values.
 * @param {Node} a Node to compare
 * @param {Node} b Node to compare
 * @returns {boolean} Returns true if both are text nodes.
 */
export function isSameAttributes(a: Node, b: Node): boolean;
/**
 * @description It is judged whether it is the not checking node. (class="katex", "MathJax", "se-exclude-format")
 * @param {Node} node The node to check
 * @returns {node is HTMLElement}
 */
export function isExcludeFormat(node: Node): node is HTMLElement;
/**
 * @description Checks for "__se__uneditable" in the class list.
 * - Components with class "__se__uneditable" cannot be modified.
 * @param {Node} node The element to check
 * @returns {boolean}
 */
export function isUneditable(node: Node): boolean;
/**
 * @description Checks if element can't be easily enabled
 * @param {Node} node Element to check for
 * @returns {boolean}
 */
export function isImportantDisabled(node: Node): boolean;
export default check;
declare namespace check {
	export { isZeroWidth };
	export { isEdgePoint };
	export { isText };
	export { isElement };
	export { isInputElement };
	export { isButtonElement };
	export { isList };
	export { isListCell };
	export { isTable };
	export { isTableElements };
	export { isTableCell };
	export { isTableRow };
	export { isBreak };
	export { isAnchor };
	export { isMedia };
	export { isIFrame };
	export { isFigure };
	export { isContentLess };
	export { isEmptyLine };
	export { isWysiwygFrame };
	export { isNonEditable };
	export { isSpanWithoutAttr };
	export { isSameAttributes };
	export { isExcludeFormat };
	export { isUneditable };
	export { isImportantDisabled };
}
