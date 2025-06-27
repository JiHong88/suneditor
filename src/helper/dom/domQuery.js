/**
 * @fileoverview Implements Helper for querying the DOM.
 */

import { _w } from '../env';
import { zeroWidthRegExp } from '../unicode';
import domUtils from './domUtils';
import domCheck from './domCheck';

/**
 * @description Returns the index compared to other sibling nodes.
 * @param {Node} node The Node to find index
 * @returns {number}
 */
export function getPositionIndex(node) {
	let idx = 0;
	while ((node = node.previousSibling)) {
		idx += 1;
	}
	return idx;
}

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
export function getNodePath(node, parentNode, _newOffsets) {
	const path = [];
	let finds = true;

	getParentElement(node, (el) => {
		if (el === parentNode) finds = false;
		if (finds && !domCheck.isWysiwygFrame(el)) {
			// merge text nodes
			if (_newOffsets && el.nodeType === 3) {
				let temp = null,
					tempText = null;
				_newOffsets.s = _newOffsets.e = 0;

				let previous = el.previousSibling;
				while (previous?.nodeType === 3) {
					tempText = previous.textContent.replace(zeroWidthRegExp, '');
					_newOffsets.s += tempText.length;
					el.textContent = tempText + el.textContent;
					temp = previous;
					previous = previous.previousSibling;
					domUtils.removeItem(temp);
				}

				let next = el.nextSibling;
				while (next?.nodeType === 3) {
					tempText = next.textContent.replace(zeroWidthRegExp, '');
					_newOffsets.e += tempText.length;
					el.textContent += tempText;
					temp = next;
					next = next.nextSibling;
					domUtils.removeItem(temp);
				}
			}

			// index push
			path.push(el);
		}
		return false;
	});

	return path.map(getPositionIndex).reverse();
}

/**
 * @template {Node} T
 * @description Returns the node in the location of the path array obtained from "helper.dom.getNodePath".
 * @param {Array<number>} offsets Position array, array obtained from "helper.dom.getNodePath"
 * @param {Node} parentNode Base parent element
 * @returns {T}
 */
export function getNodeFromPath(offsets, parentNode) {
	let current = parentNode;
	let nodes;

	for (let i = 0, len = offsets.length; i < len; i++) {
		nodes = current.childNodes;
		if (nodes.length === 0) break;
		if (nodes.length <= offsets[i]) {
			current = nodes[nodes.length - 1];
		} else {
			current = nodes[offsets[i]];
		}
	}

	return /** @type {T} */ (current);
}

/**
 * @template {HTMLElement} T
 * @description Get all "children" of the argument value element (Without text nodes)
 * @param {Node} element element to get child node
 * @param {?(current: *) => boolean} validation Conditional function
 * @returns {Array<T>}
 */
export function getListChildren(element, validation) {
	/** @type {Array<T>} */
	const children = [];
	if (!element) return children;

	const el = /** @type {Element} */ (element);
	if (!el.children || el.children.length === 0) return children;

	validation =
		validation ||
		function () {
			return true;
		};

	(function recursionFunc(current) {
		if (el !== current && validation(current)) {
			children.push(/** @type {T} */ (current));
		}

		if (current.children) {
			for (let i = 0, len = current.children.length; i < len; i++) {
				recursionFunc(current.children[i]);
			}
		}
	})(el);

	return /** @type {Array<T>} */ (children);
}

/**
 * @template {Node} T
 * @description Get all "childNodes" of the argument value element (Include text nodes)
 * @param {Node} element element to get child node
 * @param {?(current: *) => boolean} validation Conditional function
 * @returns {Array<T>}
 */
export function getListChildNodes(element, validation) {
	const children = [];
	if (!element || element.childNodes.length === 0) return children;

	validation =
		validation ||
		function () {
			return true;
		};

	(function recursionFunc(current) {
		if (element !== current && validation(current)) {
			children.push(current);
		}

		for (let i = 0, len = current.childNodes.length; i < len; i++) {
			recursionFunc(current.childNodes[i]);
		}
	})(element);

	return /** @type {Array<T>} */ (children);
}

/**
 * @description Returns the number of parents nodes.
 * - "0" when the parent node is the WYSIWYG area.
 * - '-1' when the element argument is the WYSIWYG area.
 * @param {Node} node The element to check
 * @returns {number}
 */
export function getNodeDepth(node) {
	if (!node || domCheck.isWysiwygFrame(node)) return -1;

	let depth = 0;
	node = node.parentNode;

	while (node && !domCheck.isWysiwygFrame(node)) {
		depth += 1;
		node = node.parentNode;
	}

	return depth;
}

/**
 * @description Sort a node array by depth of element.
 * @param {Array<Node>} array Node array
 * @param {boolean} des true: descending order / false: ascending order
 */
export function sortNodeByDepth(array, des) {
	const t = !des ? -1 : 1;
	const f = t * -1;

	array.sort(function (a, b) {
		if (!domCheck.isListCell(a) || !domCheck.isListCell(b)) return 0;
		const a_i = getNodeDepth(a);
		const b_i = getNodeDepth(b);
		return a_i > b_i ? t : a_i < b_i ? f : 0;
	});
}

/**
 * @description Compares two elements to find a common ancestor, and returns the order of the two elements.
 * @param {Node} a Node to compare.
 * @param {Node} b Node to compare.
 * @returns {{ancestor: HTMLElement|null, a: Node, b: Node, result: number}} { ancesstor, a, b, result: (a > b ? 1 : a < b ? -1 : 0) };
 */
export function compareElements(a, b) {
	let aNode = a,
		bNode = b;
	while (aNode && bNode && aNode.parentElement !== bNode.parentElement) {
		aNode = aNode.parentElement;
		bNode = bNode.parentElement;
	}

	if (!aNode || !bNode)
		return {
			ancestor: null,
			a: a,
			b: b,
			result: 0
		};

	const children = aNode.parentNode.childNodes;
	const aIndex = domUtils.getArrayIndex(children, aNode);
	const bIndex = domUtils.getArrayIndex(children, bNode);

	return {
		ancestor: aNode.parentElement,
		a: aNode,
		b: bNode,
		result: aIndex > bIndex ? 1 : aIndex < bIndex ? -1 : 0
	};
}

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
export function getParentElement(element, query, depth) {
	let valid;

	if (typeof query === 'function') {
		valid = query;
	} else if (typeof query === 'object') {
		/** @param {Node} current */
		valid = (current) => current === query;
	} else {
		let attr;
		if (/^\./.test(query)) {
			attr = 'className';
			query = '(\\s|^)' + query.split('.')[1] + '(\\s|$)';
		} else if (/^#/.test(query)) {
			attr = 'id';
			query = '^' + query.split('#')[1] + '$';
		} else if (/^:/.test(query)) {
			attr = 'name';
			query = '^' + query.split(':')[1] + '$';
		} else {
			attr = 'nodeName';
			query = '^' + query + '$';
		}

		const regExp = new RegExp(query, 'i');
		/** @param {Node} el */
		valid = (el) => regExp.test(el[attr]);
	}

	if (!depth) depth = Infinity;
	let index = 0;
	while (element && !valid(element)) {
		if (index >= depth || domCheck.isWysiwygFrame(element)) {
			return null;
		}
		element = element.parentElement;
		index++;
	}

	return /** @type {T} */ (element);
}

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
export function getParentElements(element, query, depth) {
	let valid;

	if (typeof query === 'function') {
		valid = query;
	} else if (typeof query === 'object') {
		/** @param {Node} current */
		valid = (current) => current === query;
	} else {
		let attr;
		if (/^\./.test(query)) {
			attr = 'className';
			query = '(\\s|^)' + query.split('.')[1] + '(\\s|$)';
		} else if (/^#/.test(query)) {
			attr = 'id';
			query = '^' + query.split('#')[1] + '$';
		} else if (/^:/.test(query)) {
			attr = 'name';
			query = '^' + query.split(':')[1] + '$';
		} else {
			attr = 'nodeName';
			query = '^' + query + '$';
		}

		const regExp = new RegExp(query, 'i');
		/** @param {Node} el */
		valid = (el) => regExp.test(el[attr]);
	}

	const elementList = [];
	if (!depth) depth = Infinity;
	let index = 0;
	while (index <= depth && element && !domCheck.isWysiwygFrame(element)) {
		if (valid(element)) {
			elementList.push(element);
		}
		element = element.parentElement;
		index++;
	}

	return /** @type {Array<T>} */ (elementList);
}

/**
 * @template {HTMLElement} T
 * @description Gets the element with "data-command" attribute among the parent elements.
 * @param {Node} target Target element
 * @returns {T|null}
 */
export function getCommandTarget(target) {
	let n = /** @type {HTMLElement} */ (target);
	while (n && !/^(UL)$/i.test(n.nodeName) && !domUtils.hasClass(n, 'sun-editor')) {
		if (n.hasAttribute('data-command')) return /** @type {T} */ (n);
		n = n.parentElement;
	}

	return null;
}

/**
 * @template {HTMLElement} T
 * @description Get the event.target element.
 * @param {Event} event Event object
 * @returns {T|null}
 */
export function getEventTarget(event) {
	return /** @type {T} */ (event.target);
}

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
export function getEdgeChild(node, query, last) {
	let valid;

	if (typeof query === 'function') {
		valid = query;
	} else if (typeof query === 'object') {
		valid = function (current) {
			return current === query;
		};
	} else {
		let attr;
		if (/^\./.test(query)) {
			attr = 'className';
			query = '(\\s|^)' + query.split('.')[1] + '(\\s|$)';
		} else if (/^#/.test(query)) {
			attr = 'id';
			query = '^' + query.split('#')[1] + '$';
		} else if (/^:/.test(query)) {
			attr = 'name';
			query = '^' + query.split(':')[1] + '$';
		} else {
			attr = 'nodeName';
			query = '^' + (query === 'text' ? '#' + query : query) + '$';
		}

		const regExp = new RegExp(query, 'i');
		valid = function (el) {
			return regExp.test(el[attr]);
		};
	}

	const childList = getListChildNodes(node, (current) => valid(current));

	return /** @type {T} */ (childList[last ? childList.length - 1 : 0]);
}

/**
 * @description Get edge child nodes of the argument value.
 * - 1. The first node of all the child nodes of the "first" element is returned.
 * - 2. The last node of all the child nodes of the "last" element is returned.
 * - 3. When there is no "last" element, the first and last nodes of all the children of the "first" element are returned.
 * @param {Node} first First element
 * @param {Node|null} last Last element
 * @returns {{sc: Node, ec: Node}} { sc: "first", ec: "last" }
 */
export function getEdgeChildNodes(first, last) {
	if (!first) return;
	if (!last) last = first;

	while (first && first.nodeType === 1 && first.childNodes.length > 0 && !domCheck.isBreak(first)) first = first.firstChild;
	while (last && last.nodeType === 1 && last.childNodes.length > 0 && !domCheck.isBreak(last)) last = last.lastChild;

	return {
		sc: first,
		ec: last || first
	};
}

/**
 * @template {Node} T
 * @description Gets the previous sibling last child. If there is no sibling, then it'll take it from the closest ancestor with child
 * @param {Node} node Reference element
 * @param {?Node=} ceiling Highest boundary allowed
 * @returns {T|null} Not found: null
 */
export function getPreviousDeepestNode(node, ceiling) {
	let previousNode = node.previousSibling;
	if (!previousNode) {
		for (let parentNode = node.parentNode; parentNode; parentNode = parentNode.parentNode) {
			if (parentNode === ceiling) return null;
			if (parentNode.previousSibling) {
				previousNode = parentNode.previousSibling;
				break;
			}
		}
		if (!previousNode) return null;
	}

	if (domCheck.isNonEditable(previousNode)) return /** @type {T} */ (/** @type {unknown} */ (previousNode));

	while (previousNode.lastChild) previousNode = previousNode.lastChild;

	return /** @type {T} */ (/** @type {unknown} */ (previousNode));
}

/**
 * @template {Node} T
 * @description Gets the next sibling first child. If there is no sibling, then it'll take it from the closest ancestor with child
 * @param {Node} node Reference element
 * @param {?Node=} ceiling Highest boundary allowed
 * @returns {T|null} Not found: null
 */
export function getNextDeepestNode(node, ceiling) {
	let nextNode = node.nextSibling;
	if (!nextNode) {
		for (let parentNode = node.parentNode; parentNode; parentNode = parentNode.parentNode) {
			if (parentNode === ceiling) return null;
			if (parentNode.nextSibling) {
				nextNode = parentNode.nextSibling;
				break;
			}
		}
		if (!nextNode) return null;
	}

	if (domCheck.isNonEditable(nextNode)) return /** @type {T} */ (/** @type {unknown} */ (nextNode));

	while (nextNode.firstChild) nextNode = nextNode.firstChild;

	return /** @type {T} */ (/** @type {unknown} */ (nextNode));
}

/**
 * @description Find the index of the text node in the line element.
 * @param {Node} line Line element (p, div, etc.)
 * @param {Node} offsetContainer Base node to start searching
 * @param {number} offset Base offset to start searching
 * @param {?(current: *) => boolean=} validate Validation function
 * @returns {number}
 */
export function findTextIndexOnLine(line, offsetContainer, offset, validate) {
	if (!line) return 0;
	if (!validate) validate = () => true;

	let index = 0;
	let found = false;

	(function recursionFunc(node) {
		if (found || node.nodeType === 8) return;
		if (validate(node)) return; //  component.is

		if (node.nodeType === 3) {
			if (node === offsetContainer) {
				index += offset;
				found = true;
				return;
			}
			index += node.textContent.length;
		} else if (node.nodeType === 1) {
			const childNodes = node.childNodes;
			for (let i = 0, len = childNodes.length; i < len; i++) {
				recursionFunc(childNodes[i]);
				if (found) return;
			}
		}
	})(line);

	return index;
}

/**
 * @description Find the end index of a sequence of at least minTabSize consecutive non-breaking spaces or spaces
 * - which are interpreted as a tab key, occurring after a given base index in a text string.
 * @param {Node} line Line element (p, div, etc.)
 * @param {number} baseIndex Base index to start searching
 * @param {number} minTabSize Minimum number of consecutive spaces to consider as a tab
 * @returns {number} The adjusted index within the line element accounting for non-space characters
 */
export function findTabEndIndex(line, baseIndex, minTabSize) {
	if (!line) return 0;
	const innerText = line.textContent;
	const regex = new RegExp(`((\\u00A0|\\s){${minTabSize},})`, 'g');
	let match;

	regex.lastIndex = baseIndex;

	while ((match = regex.exec(innerText)) !== null) {
		if (match.index >= baseIndex) {
			const spaceEndIndex = match.index + match[0].length - 1;
			const precedingText = innerText.slice(0, spaceEndIndex + 1);
			const nonSpaceCharCount = (precedingText.match(/[^\u00A0\s]/g) || []).length;
			return spaceEndIndex + nonSpaceCharCount + minTabSize;
		}
	}

	return 0;
}

/**
 * @description Finds the table cell that appears visually at the bottom-right position,
 * considering both rowSpan and colSpan, even if smaller cells are placed after large merged cells.
 *
 * @param {HTMLTableCellElement[]} cells
 * @returns {HTMLTableCellElement|null}
 */
export function findVisualLastCell(cells) {
	if (!cells || cells.length === 0) return null;

	/**
	 * @description visibility col index
	 * @type {Object<number, boolean[]>}
	 */
	const occupied = {};

	let target = null;
	let maxRowEnd = -1;
	let maxColEnd = -1;

	for (const cell of cells) {
		const row = /** @type {HTMLTableRowElement} */ (cell.parentElement);
		const rowIndex = row.rowIndex;
		const rowSpan = cell.rowSpan || 1;
		const colSpan = cell.colSpan || 1;

		// 현재 행에서 visual column index 찾기
		if (!occupied[rowIndex]) occupied[rowIndex] = [];

		let colIndex = 0;
		const rowOcc = occupied[rowIndex];
		while (rowOcc[colIndex]) colIndex++;

		for (let i = 0; i < colSpan; i++) {
			rowOcc[colIndex + i] = true;
		}

		for (let r = 1; r < rowSpan; r++) {
			const nextRow = rowIndex + r;
			if (!occupied[nextRow]) occupied[nextRow] = [];
			for (let i = 0; i < colSpan; i++) {
				occupied[nextRow][colIndex + i] = true;
			}
		}

		const visualRowEnd = rowIndex + rowSpan - 1;
		const visualColEnd = colIndex + colSpan - 1;

		// right-bottom
		if (visualRowEnd > maxRowEnd || (visualRowEnd === maxRowEnd && visualColEnd > maxColEnd)) {
			maxRowEnd = visualRowEnd;
			maxColEnd = visualColEnd;
			target = cell;
		}
	}

	return target;
}

/**
 * @description Finds and returns parent containers that are scrollable.
 * @param {HTMLElement} element - Element to start with
 * @returns {HTMLElement[]} - Array (in descending order)
 */
export function getScrollParents(element) {
	const scrollable = [];
	let parent = element?.parentElement;

	while (parent && !/^(body|html)$/i.test(parent.nodeName)) {
		const style = _w.getComputedStyle(parent);
		const { overflow, overflowX, overflowY } = style;

		const canScroll = [overflow, overflowX, overflowY].some((prop) => ['auto', 'scroll', 'overlay'].includes(prop));

		if (canScroll) {
			scrollable.push(parent);
		}

		parent = parent.parentElement;
	}

	return scrollable;
}

/**
 * @description Get the argument iframe's document object if use the "iframe" or "fullPage" options
 * @param {HTMLIFrameElement} iframe Iframe element (this.editor.frameContext.get('wysiwygFrame'))
 * @returns {Document}
 */
export function getIframeDocument(iframe) {
	return iframe.contentWindow?.document || iframe.contentDocument;
}

const query = {
	getPositionIndex,
	getNodePath,
	getNodeFromPath,
	getListChildren,
	getListChildNodes,
	getNodeDepth,
	sortNodeByDepth,
	compareElements,
	getParentElement,
	getParentElements,
	getCommandTarget,
	getEventTarget,
	getEdgeChild,
	getEdgeChildNodes,
	getPreviousDeepestNode,
	getNextDeepestNode,
	findTextIndexOnLine,
	findTabEndIndex,
	findVisualLastCell,
	getScrollParents,
	getIframeDocument
};

export default query;
