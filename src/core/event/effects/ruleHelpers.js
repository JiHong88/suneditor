/**
 * @file effects/ruleHelpers.js
 *
 * ⚠️ PATTERN COMPROMISE - Rule Helpers with Side Effects
 *
 * These functions are directly called from rules (not via actions/effects).
 * This breaks pure reducer pattern but is necessary because they need to:
 * 1. Perform atomic check + execute operations
 * 2. Return values for rule conditional logic
 *
 * Categories:
 * - QUERY (safe): `isUneditableNode` - reads DOM only
 * - COMMAND (side effect): `hardDelete`, `cleanRemovedTags` - modifies DOM + returns status
 */

import { dom } from '../../../helper';

/**
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 */

/**
 * @description Deletes specific elements such as tables in `Firefox` and media elements (image, video, audio) in `Chrome`.
 * - Handles deletion logic based on selection range and node types.
 * @param {EventPorts} ports - Reducer ports
 * @returns {boolean} Returns `true` if an element was deleted and focus was adjusted, otherwise `false`.
 */
function hardDelete(ports) {
	const range = ports.selection.getRange();
	const sc = range.startContainer;
	const ec = range.endContainer;

	// table
	const sCell = ports.format.getBlock(sc);
	const eCell = ports.format.getBlock(ec);
	const sIsCell = dom.check.isTableCell(sCell);
	const eIsCell = dom.check.isTableCell(eCell);
	if (
		((sIsCell && !sCell.previousElementSibling && !sCell.parentElement.previousElementSibling) ||
			(eIsCell && !eCell.nextElementSibling && !eCell.parentElement.nextElementSibling)) &&
		sCell !== eCell
	) {
		const ancestor =
			dom.query.getParentElement(range.commonAncestorContainer, dom.check.isFigure)?.parentElement ||
			range.commonAncestorContainer;
		if (!sIsCell) {
			dom.utils.removeItem(dom.query.getParentElement(eCell, (current) => ancestor === current.parentNode));
		} else if (!eIsCell) {
			dom.utils.removeItem(dom.query.getParentElement(sCell, (current) => ancestor === current.parentNode));
		} else {
			dom.utils.removeItem(dom.query.getParentElement(sCell, (current) => ancestor === current.parentNode));
			ports.focusManager.nativeFocus();
			return true;
		}
	}

	// component
	const sComp = sc.nodeType === 1 ? dom.query.getParentElement(sc, '.se-component') : null;
	const eComp = ec.nodeType === 1 ? dom.query.getParentElement(ec, '.se-component') : null;
	if (sComp) dom.utils.removeItem(sComp);
	if (eComp) dom.utils.removeItem(eComp);

	return false;
}

/**
 * @description Cleans up removed tags and normalizes DOM structure.
 * Removes orphaned nodes that are outside the format element's valid range.
 * @param {EventPorts} ports - Reducer ports
 * @param {Node} startCon - Starting container node to clean
 * @param {Element} formatEl - Parent format element containing the structure
 * @returns {boolean} Returns `true` if nodes were removed, `undefined` otherwise
 */
function cleanRemovedTags(ports, startCon, formatEl) {
	let prev = startCon.parentNode.previousSibling;
	const next = startCon.parentNode.nextSibling;
	if (!prev) {
		if (!next) {
			prev = dom.utils.createElement('BR');
			formatEl.appendChild(prev);
		} else {
			prev = next;
		}
	}

	let con = startCon;
	while (formatEl.contains(con) && !con.previousSibling) {
		con = con.parentNode;
	}

	if (!formatEl.contains(con)) {
		startCon.textContent = '';
		ports.nodeTransform.removeAllParents(startCon, null, formatEl);
		return true;
	}
}

/**
 * @description Determines if the `range` is within an uneditable node.
 * @param {EventPorts} ports - Reducer ports
 * @param {Range} range The range object
 * @param {boolean} isFront Whether to check the start or end of the range
 * @returns {Node|null} The uneditable node if found, otherwise `null`
 */
function isUneditableNode(ports, range, isFront) {
	const container = isFront ? range.startContainer : range.endContainer;
	const offset = isFront ? range.startOffset : range.endOffset;
	const siblingKey = isFront ? 'previousSibling' : 'nextSibling';
	const isElement = container.nodeType === 1;

	let siblingNode;
	if (isElement) {
		siblingNode = /** @type {HTMLElement} */ (
			_isUneditableNode_getSibling(ports, container.childNodes[offset], siblingKey, container)
		);
		return dom.check.isComponentContainer(siblingNode) || dom.check.isNonEditable(siblingNode) ? siblingNode : null;
	} else {
		siblingNode = /** @type {HTMLElement} */ (
			_isUneditableNode_getSibling(ports, container, siblingKey, container)
		);
		return dom.check.isEdgePoint(container, offset, isFront ? 'front' : 'end') &&
			(dom.check.isComponentContainer(siblingNode) || dom.check.isNonEditable(siblingNode))
			? siblingNode
			: null;
	}
}

/**
 * @description Retrieves the sibling node of a selected node if it is uneditable. || component node.
 * - Used only in `_isUneditableNode`.
 * @param {EventPorts} ports - Reducer ports
 * @param {Node} selectNode The selected node
 * @param {string} siblingKey The key to access the sibling (`previousSibling` or `nextSibling`)
 * @param {Node} container The parent container node
 * @returns {Node|null} The sibling node if found, otherwise `null`
 */
function _isUneditableNode_getSibling(ports, selectNode, siblingKey, container) {
	if (!selectNode) return null;
	let siblingNode = selectNode[siblingKey];

	if (!siblingNode) {
		siblingNode = ports.format.getLine(container);
		siblingNode = siblingNode ? siblingNode[siblingKey] : null;
		if (siblingNode && !ports.component.is(siblingNode))
			siblingNode = siblingKey === 'previousSibling' ? siblingNode.firstChild : siblingNode.lastChild;
		else return null;
	}

	return siblingNode;
}

/**
 * @description Execute `eventManager._setDefaultLine`
 * @param {EventPorts} ports - Reducer ports
 * @param {string} lineTagName - `line` tag name
 * @returns {void}
 */
function setDefaultLine(ports, lineTagName) {
	return ports.setDefaultLine(lineTagName);
}

/**
 * @description Detects if a detected logical edge is incorrect due to bidi text direction mismatch in RTL mode.
 * When LTR text (numbers, Latin) is inside an RTL line, the browser may place the caret at offset 0
 * for the visual end or offset=length for the visual start. This function compares the caret's visual
 * position against the content boundaries to detect such mismatches.
 * @param {Range} range - The current collapsed range
 * @param {HTMLElement} formatEl - The format/line element
 * @param {'front'|'end'} detectedEdge - The edge detected by logical offset check
 * @param {Document} doc - The document object
 * @returns {boolean} true if the detected edge doesn't match the visual position (bidi mismatch)
 */
function isRtlBidiMismatch(range, formatEl, detectedEdge, doc) {
	if (!range.collapsed || !formatEl) return false;

	const caretRect = range.getBoundingClientRect();
	if (caretRect.height <= 0) return false;

	const contentRange = doc.createRange();
	contentRange.selectNodeContents(formatEl);

	const contentRect = contentRange.getBoundingClientRect();
	if (contentRect.width <= 2) return false;

	// In RTL: content left = visual end, content right = visual start
	// 'front' mismatch: logically at front (offset 0) but caret at left = visual end
	// 'end' mismatch: logically at end (offset=length) but caret at right = visual start
	return detectedEdge === 'front' ? caretRect.left <= contentRect.left + 2 : caretRect.left >= contentRect.right - 2;
}

/**
 * @description Whether the caret sits on a bare `<br>` that stands at the front/end edge of its `line`.
 * @param {Range} range - The current range
 * @param {Node} selectionNode - Current selection node
 * @param {'front'|'end'} edge - Edge to test: `front` for Backspace, `end` for Delete
 * @returns {boolean} `true` if the caret is on an edge `<br>`
 */
function isEdgeBreakCaret(range, selectionNode, edge) {
	if (!range.collapsed || !dom.check.isBreak(selectionNode)) return false;

	const key = edge === 'front' ? 'previousSibling' : 'nextSibling';
	let sibling = selectionNode[key];
	while (sibling?.nodeType === 3 && dom.check.isZeroWidth(sibling)) {
		sibling = sibling[key];
	}

	return !sibling || dom.check.isList(sibling);
}

/**
 * @description The previous/next element in document order — crossing in and out of blocks (list, quote).
 * - Out of list-cell ancestors (a nested list), stopping at a closure block (table cell).
 * @param {EventPorts['format']} format - Format module
 * @param {?HTMLElement} line - The caret's `line` element
 * @param {'front'|'end'} edge - `front` for the previous element, `end` for the next one
 * @returns {?HTMLElement} The adjacent element, or `null` at the document edge
 */
function getAdjacentElement(format, line, edge) {
	const siblingKey = edge === 'front' ? 'previousElementSibling' : 'nextElementSibling';
	const childKey = edge === 'front' ? 'lastElementChild' : 'firstElementChild';

	let node = line;
	let adjacent = null;
	while (node && !(adjacent = node[siblingKey])) {
		const parent = node.parentElement;
		if (!parent || format.isClosureBlock(parent) || dom.check.isWysiwygFrame(parent)) return null;

		if (format.isBlock(parent)) {
			node = parent;
		} else if (dom.check.isListCell(parent)) {
			if (edge === 'front') return /** @type {HTMLElement} */ (parent);
			node = parent;
		} else {
			return null; // the editable root
		}
	}

	// step into blocks down to the nearest line
	while (adjacent && format.isBlock(adjacent) && !format.isClosureBlock(adjacent)) {
		adjacent = adjacent[childKey];
	}

	return /** @type {?HTMLElement} */ (adjacent);
}

/**
 * @description The previous/next `line` in document order — {@link getAdjacentElement} filtered to lines.
 * - `null` means either the document edge or a non-`line` neighbour (a component); use
 * {@link getAdjacentElement} when the two must be told apart.
 * @param {EventPorts['format']} format - Format module
 * @param {?HTMLElement} line - The caret's `line` element
 * @param {'front'|'end'} edge - `front` for the previous line, `end` for the next one
 * @returns {?HTMLElement} The adjacent line, or `null`
 */
function getAdjacentLine(format, line, edge) {
	const adjacent = getAdjacentElement(format, line, edge);
	return format.isLine(adjacent) ? /** @type {HTMLElement} */ (adjacent) : null;
}

/**
 * @description The neighbouring `line` an empty line collapses into, or `null` when there is nothing to merge.
 * - A cell owning a nested list belongs to {@link getNestedListTarget} instead.
 * @param {EventPorts['format']} format - Format module
 * @param {?HTMLElement} formatEl - The caret's `line` element
 * @param {'front'|'end'} edge - `front` for Backspace (previous line), `end` for Delete (next line)
 * @returns {?HTMLElement} The neighbouring line to merge into, or `null`
 */
function getEmptyLineMergeTarget(format, formatEl, edge) {
	if (!formatEl || !format.isNormalLine(formatEl) || !dom.check.isEmptyLine(formatEl)) return null;
	if (dom.utils.arrayFind(formatEl.children, dom.check.isList)) return null;

	const neighbor = /** @type {HTMLElement} */ (
		edge === 'front' ? formatEl.previousElementSibling : formatEl.nextElementSibling
	);

	return format.isNormalLine(neighbor) || format.isBrLine(neighbor) ? neighbor : null;
}

/**
 * @description The nested list a list-cell Backspace/Delete would lift, or `null` when there is none.
 * - The rules gate their list branch on it so the branch can't claim the key with nothing to do.
 * @param {HTMLElement} formatEl - The caret's list cell
 * @param {HTMLElement} rangeEl - The list (`UL`/`OL`) the cell belongs to
 * @returns {?HTMLElement} The element carrying the nested list, or `null`
 */
function getNestedListTarget(formatEl, rangeEl) {
	const next = /** @type {HTMLElement} */ (
		dom.utils.arrayFind(formatEl.children, dom.check.isList) ||
			formatEl.nextElementSibling ||
			rangeEl?.parentElement?.nextElementSibling
	);

	if (!next) return null;

	return dom.check.isList(next) || dom.utils.arrayFind(next.children, dom.check.isList) ? next : null;
}

export {
	hardDelete,
	cleanRemovedTags,
	isUneditableNode,
	setDefaultLine,
	isRtlBidiMismatch,
	isEdgeBreakCaret,
	getAdjacentElement,
	getAdjacentLine,
	getEmptyLineMergeTarget,
	getNestedListTarget,
};
