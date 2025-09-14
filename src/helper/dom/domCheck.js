/**
 * @fileoverview Implements Helper for checking the node type and attributes.
 */

import { onlyZeroWidthRegExp } from '../unicode';
import domUtils from './domUtils';

/**
 * @description A method that checks If the text is blank or to see if it contains 'ZERO WIDTH SPACE' or empty (unicode.zeroWidthSpace)
 * @param {string|Node} text String value or Node
 * @returns {boolean}
 */
export function isZeroWidth(text) {
	if (text === null || text === undefined) return false;
	if (typeof text !== 'string') {
		if (isElement(text)) {
			const children = text.children;
			for (let i = 0, len = children.length; i < len; i++) {
				const child = children[i];
				if (!isContentLess(child)) return false;
			}
		}
		text = text.textContent;
	}
	return text === '' || onlyZeroWidthRegExp.test(text);
}

/**
 * @description Determine if this offset is the edge offset of container
 * @param {Node} container The node of the selection object. (range.startContainer..)
 * @param {number} offset The offset of the selection object. (core.getRange().startOffset...)
 * @param {?"front"|"end"=} dir Select check point - Both edge, Front edge or End edge. ("front": Front edge, "end": End edge, undefined: Both edge)
 * @returns {boolean}
 */
export function isEdgePoint(container, offset, dir) {
	return (dir !== 'end' && offset === 0) || ((!dir || dir !== 'front') && !container.nodeValue && offset <= 1) || ((!dir || dir === 'end') && container.nodeValue && offset >= container.nodeValue.length);
}

/**
 * @description Check the node is a text node.
 * @param {?Node} node The node to check
 * @returns {node is Text}
 */
export function isText(node) {
	return node?.nodeType === 3;
}

/**
 * @description Check the node is an HTMLElement node.
 * @param {?Node} node The node to check
 * @returns {node is HTMLElement}
 */
export function isElement(node) {
	return node?.nodeType === 1;
}

/**
 * @description It is judged whether it is the input element (INPUT, TEXTAREA)
 * @param {?Node} node The node to check
 * @returns {node is HTMLInputElement}
 */
export function isInputElement(node) {
	return isElement(node) && /^(INPUT|TEXTAREA|SELECT|OPTION)$/i.test(node.nodeName);
}

/**
 * @description It is judged whether it is the button element
 * @param {?Node} node The node to check
 * @returns {node is HTMLButtonElement}
 */
export function isButtonElement(node) {
	return isElement(node) && /^(BUTTON)$/i.test(node.nodeName);
}

/**
 * @description Check the node is a list (ol, ul)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLOListElement|HTMLUListElement}
 */
export function isList(node) {
	return /^(OL|UL)$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a list cell (li)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLLIElement}
 */
export function isListCell(node) {
	return /^LI$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a table
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLTableElement}
 */
export function isTable(node) {
	return /^TABLE$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a table elements. (table, thead, tbody, tr, th, td)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLTableElement|HTMLTableSectionElement|HTMLTableRowElement|HTMLTableCellElement|HTMLTableColElement|HTMLTableColElement}
 */
export function isTableElements(node) {
	return /^(TABLE|THEAD|TBODY|TR|TH|TD|COL)$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a table cell (td, th)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLTableCellElement|HTMLTableColElement}
 */
export function isTableCell(node) {
	return /^(TD|TH)$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a table row (tr)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLTableRowElement}
 */
export function isTableRow(node) {
	return /^TR$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a break node (BR)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLBRElement}
 */
export function isBreak(node) {
	return /^BR$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a anchor node (A)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLAnchorElement}
 */
export function isAnchor(node) {
	return /^A$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a media node (img, iframe, audio, video, canvas)
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLImageElement|HTMLIFrameElement|HTMLAudioElement|HTMLVideoElement|HTMLCanvasElement}
 */
export function isMedia(node) {
	return /^(IMG|IFRAME|AUDIO|VIDEO|CANVAS)$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a iframe tag
 * @param {?Node|string} node The element or element name to check
 * @returns {node is HTMLIFrameElement}
 */
export function isIFrame(node) {
	return /^IFRAME$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a figure tag
 * @param {?Node|string} node The element or element name to check
 * @returns {boolean}
 */
export function isFigure(node) {
	return /^FIGURE$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Checks whether the given node is a content-less (void) HTML tag
 * @param {?Node|string} node The element or element name to check
 * @returns {boolean}
 */
export function isContentLess(node) {
	return /^(BR|COLGROUP|COL|THEAD|TBODY|TFOOT|TR|AREA|BASE|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the line element is empty.
 * @param {Node} node "line" element node
 * @returns {boolean}
 */
export function isEmptyLine(node) {
	if (!node?.parentNode) return true;
	const el = /** @type {HTMLElement} */ (node);
	return !el.querySelector('IMG, IFRAME, AUDIO, VIDEO, CANVAS, TABLE') && (el.children.length <= 1 || isBreak(el.firstElementChild)) && isZeroWidth(el.textContent);
}

/**
 * @description Checks if the given node is a container component (class "se-component-container").
 * @param {Node} element
 * @returns {boolean} True if the node is a container component, otherwise false.
 */
export function isComponentContainer(element) {
	return domUtils.hasClass(element, 'se-component|se-flex-component');
}

/**
 * @description It is judged whether it is the edit region top div element or iframe's body tag.
 * @param {?Node} node The node to check
 * @returns {node is HTMLElement}
 */
export function isWysiwygFrame(node) {
	return node?.nodeType === 1 && (domUtils.hasClass(node, 'se-wrapper-wysiwyg|sun-editor-carrier-wrapper|se-wrapper') || /^BODY$/i.test(node.nodeName));
}

/**
 * @description It is judged whether it is the contenteditable property is false.
 * @param {?Node} node The node to check
 * @returns {node is HTMLElement}
 */
export function isNonEditable(node) {
	return node?.nodeType === 1 && /** @type {HTMLElement} */ (node).getAttribute('contenteditable') === 'false';
}

/**
 * @description Check the span's attributes are empty.
 * @param {?Node} node Element node
 * @returns {boolean}
 */
export function isSpanWithoutAttr(node) {
	if (node?.nodeType !== 1) return false;
	const el = /** @type {HTMLElement} */ (node);
	return /^SPAN$/i.test(el.nodeName) && !el.className && !el.style.cssText;
}

/**
 * @description Compares the style and class for equal values.
 * @param {Node} a Node to compare
 * @param {Node} b Node to compare
 * @returns {boolean} Returns true if both are text nodes.
 */
export function isSameAttributes(a, b) {
	if (a.nodeType === 3 && b.nodeType === 3) return true;
	if (a.nodeType === 3 || b.nodeType === 3) return false;

	const aEl = /** @type {HTMLElement} */ (a);
	const bEl = /** @type {HTMLElement} */ (b);

	const style_a = aEl.style;
	const style_b = bEl.style;
	let compStyle = 0;

	for (let i = 0, len = style_a.length; i < len; i++) {
		if (style_a[style_a[i]] === style_b[style_a[i]]) compStyle++;
	}

	const class_a = aEl.classList;
	const class_b = bEl.classList;
	const wRegExp = RegExp;
	let compClass = 0;

	for (let i = 0, len = class_a.length; i < len; i++) {
		if (wRegExp('(s|^)' + class_a[i] + '(s|$)').test(class_b.value)) compClass++;
	}

	return compStyle === style_b.length && compStyle === style_a.length && compClass === class_b.length && compClass === class_a.length;
}

/**
 * @description It is judged whether it is the not checking node. (class="katex", "MathJax", "se-exclude-format")
 * @param {Node} node The node to check
 * @returns {node is HTMLElement}
 */
export function isExcludeFormat(node) {
	return /(\s|^)(katex|MathJax|se-exclude-format)(\s|$)/.test(/** @type {HTMLElement} */ (node)?.className);
}

/**
 * @description Checks for "__se__uneditable" in the class list.
 * - Components with class "__se__uneditable" cannot be modified.
 * @param {Node} node The element to check
 * @returns {boolean}
 */
export function isUneditable(node) {
	return domUtils.hasClass(node, '__se__uneditable');
}

/**
 * @description Checks if element can't be easily enabled
 * @param {Node} node Element to check for
 * @returns {boolean}
 */
export function isImportantDisabled(node) {
	return /** @type {HTMLElement} */ (node).hasAttribute('data-important-disabled');
}

const check = {
	isZeroWidth,
	isEdgePoint,
	isText,
	isElement,
	isInputElement,
	isButtonElement,
	isList,
	isListCell,
	isTable,
	isTableElements,
	isTableCell,
	isTableRow,
	isBreak,
	isAnchor,
	isMedia,
	isIFrame,
	isFigure,
	isContentLess,
	isEmptyLine,
	isComponentContainer,
	isWysiwygFrame,
	isNonEditable,
	isSpanWithoutAttr,
	isSameAttributes,
	isExcludeFormat,
	isUneditable,
	isImportantDisabled
};

export default check;
