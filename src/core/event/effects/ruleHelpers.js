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
	if (((sIsCell && !sCell.previousElementSibling && !sCell.parentElement.previousElementSibling) || (eIsCell && !eCell.nextElementSibling && !eCell.parentElement.nextElementSibling)) && sCell !== eCell) {
		const ancestor = dom.query.getParentElement(range.commonAncestorContainer, dom.check.isFigure)?.parentElement || range.commonAncestorContainer;
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
		siblingNode = /** @type {HTMLElement} */ (_isUneditableNode_getSibling(ports, container.childNodes[offset], siblingKey, container));
		return dom.check.isComponentContainer(siblingNode) || dom.check.isNonEditable(siblingNode) ? siblingNode : null;
	} else {
		siblingNode = /** @type {HTMLElement} */ (_isUneditableNode_getSibling(ports, container, siblingKey, container));
		return dom.check.isEdgePoint(container, offset, isFront ? 'front' : 'end') && (dom.check.isComponentContainer(siblingNode) || dom.check.isNonEditable(siblingNode)) ? siblingNode : null;
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
		if (siblingNode && !ports.component.is(siblingNode)) siblingNode = siblingKey === 'previousSibling' ? siblingNode.firstChild : siblingNode.lastChild;
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

export { hardDelete, cleanRemovedTags, isUneditableNode, setDefaultLine };
