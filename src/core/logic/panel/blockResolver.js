/**
 * @fileoverview Stateless block boundary resolver for block handle positioning.
 * Maps any DOM node inside the editor to its owning block-level element.
 */

import { isWysiwygFrame, isTableCell, isComponentContainer } from '../../../helper/dom/domCheck';

/**
 * @typedef {Object} BlockInfo
 * @property {HTMLElement} element - The resolved block-level DOM element
 * @property {string} type - Block type: 'p', 'heading', 'list', 'blockquote', 'pre', 'figure', 'table', 'div'
 * @property {number} depth - Nesting level from wysiwyg root (0 = top-level)
 * @property {HTMLElement|null} parent - Parent block element, or null if top-level
 * @property {{ prev: HTMLElement|null, next: HTMLElement|null }} siblings - Adjacent blocks at same depth
 * @property {DOMRect} rect - getBoundingClientRect() of the element (caller handles scroll/iframe offset)
 */

/**
 * @typedef {Object} FormatAPI
 * @property {(node: Node, validation?: (current: *) => boolean) => HTMLElement|null} getLine
 * @property {(element: Node, validation?: (current: *) => boolean) => HTMLElement|null} getBlock
 * @property {(element: Node) => boolean} isLine
 * @property {(element: Node) => boolean} isBlock
 */

const HEADING_RE = /^H[1-6]$/;
const LIST_RE = /^(UL|OL)$/;
const LIST_ITEM_RE = /^LI$/;
const TABLE_INNER_RE = /^(THEAD|TBODY|TR|TD|TH)$/;

/**
 * @description Classify the block type from a resolved element.
 * @param {HTMLElement} el
 * @returns {string}
 */
function classifyType(el) {
	const tag = el.nodeName;
	if (tag === 'P' || tag === 'DIV') return 'p';
	if (HEADING_RE.test(tag)) return 'heading';
	if (tag === 'LI') return 'list-item';
	if (LIST_RE.test(tag)) return 'list';
	if (tag === 'BLOCKQUOTE') return 'blockquote';
	if (tag === 'PRE') return 'pre';
	if (tag === 'FIGURE') return 'figure';
	if (tag === 'TABLE') return 'table';
	return 'p'; // fallback for custom format elements
}

/**
 * @description Walk up from a table-internal node (td, th, tr, thead, tbody) to the table element.
 * @param {Node} node
 * @returns {HTMLElement|null}
 */
function resolveToTable(node) {
	let el = node;
	while (el && !isWysiwygFrame(el)) {
		if (el.nodeName === 'TABLE') return /** @type {HTMLElement} */ (el);
		el = el.parentNode;
	}
	return null;
}

/**
 * @description Check if the node is inside or is a component (.se-component, .se-flex-component)
 * @param {Node} node
 * @returns {boolean}
 */
function isInsideComponent(node) {
	let el = node;
	while (el && !isWysiwygFrame(el)) {
		if (el.nodeType === 1 && isComponentContainer(/** @type {Element} */ (el))) return true;
		el = el.parentNode;
	}
	return false;
}

/**
 * @description Count block-level ancestors between element and wysiwyg root.
 * @param {HTMLElement} element
 * @param {FormatAPI} format
 * @returns {{ depth: number, parent: HTMLElement|null }}
 */
function computeDepth(element, format) {
	let depth = 0;
	let parent = null;
	let node = element.parentNode;

	while (node && !isWysiwygFrame(node)) {
		if (node.nodeType === 1 && (format.isBlock(node) || format.isLine(node))) {
			if (!parent) parent = /** @type {HTMLElement} */ (node);
			depth++;
		}
		node = node.parentNode;
	}

	return { depth, parent };
}

/**
 * @description Find the previous and next sibling block elements at the same level.
 * @param {HTMLElement} element
 * @returns {{ prev: HTMLElement|null, next: HTMLElement|null }}
 */
function computeSiblings(element) {
	const prev = element.previousElementSibling;
	const next = element.nextElementSibling;
	return {
		prev: /** @type {HTMLElement|null} */ (prev),
		next: /** @type {HTMLElement|null} */ (next),
	};
}

/**
 * @description For a UL/OL, find the closest direct child LI by mouse Y.
 * Recurses into the matched LI for deeper nesting.
 * @param {HTMLElement} list - UL or OL element
 * @param {number} mouseY
 * @returns {HTMLElement|null}
 */
function resolveListChildLI(list, mouseY) {
	const children = list.children;
	let closest = null;
	let closestDist = Infinity;
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (!LIST_ITEM_RE.test(child.nodeName)) continue;
		const r = child.getBoundingClientRect();
		if (mouseY >= r.top && mouseY <= r.bottom) {
			// Exact hit — recurse for deeper nesting
			return resolveNestedLI(/** @type {HTMLElement} */ (child), mouseY) || /** @type {HTMLElement} */ (child);
		}
		const dist = Math.min(Math.abs(mouseY - r.top), Math.abs(mouseY - r.bottom));
		if (dist < closestDist) {
			closestDist = dist;
			closest = /** @type {HTMLElement} */ (child);
		}
	}
	return closest;
}

/**
 * @description For an LI with nested sub-lists, find the closest child LI by mouse Y.
 * Only resolves to a child when mouseY falls within the nested list region.
 * @param {HTMLElement} li
 * @param {number} mouseY
 * @returns {HTMLElement|null}
 */
function resolveNestedLI(li, mouseY) {
	const nestedList = li.querySelector(':scope > ul, :scope > ol');
	if (!nestedList) return null;

	const nestedRect = nestedList.getBoundingClientRect();
	// Mouse is above the nested list → stays on parent LI's own content
	if (mouseY < nestedRect.top) return null;

	const childLIs = nestedList.children;
	let closest = null;
	let closestDist = Infinity;
	for (let i = 0; i < childLIs.length; i++) {
		const child = childLIs[i];
		if (!LIST_ITEM_RE.test(child.nodeName)) continue;
		const r = child.getBoundingClientRect();
		if (mouseY >= r.top && mouseY <= r.bottom) {
			// Exact hit — recurse for deeper nesting
			return resolveNestedLI(/** @type {HTMLElement} */ (child), mouseY) || /** @type {HTMLElement} */ (child);
		}
		const dist = Math.min(Math.abs(mouseY - r.top), Math.abs(mouseY - r.bottom));
		if (dist < closestDist) {
			closestDist = dist;
			closest = /** @type {HTMLElement} */ (child);
		}
	}
	return closest;
}

/**
 * @description Resolve any DOM node inside the editor to its owning block-level element.
 * @param {Node|null} node - Any DOM node inside the editor
 * @param {FormatAPI} format - Injected format methods (getLine, getBlock, isLine, isBlock)
 * @param {HTMLElement} wysiwygFrame - The wysiwyg root element
 * @param {number} [mouseY] - Mouse clientY for nested list resolution
 * @returns {BlockInfo|null} Block information, or null if node is outside editable area
 */
export function resolveBlock(node, format, wysiwygFrame, mouseY) {
	if (!node || !wysiwygFrame) return null;

	// Text node → use parent element
	if (node.nodeType === 3) {
		node = node.parentNode;
		if (!node) return null;
	}

	// Already at wysiwyg root
	if (isWysiwygFrame(node)) return null;

	// Skip components (images, videos, etc.) — they have their own interaction
	if (isInsideComponent(node)) return null;

	let resolved = null;

	// Table cell or table-internal → resolve to TABLE
	if (TABLE_INNER_RE.test(node.nodeName)) {
		resolved = resolveToTable(node);
	}
	// List container (UL/OL) → keep as-is, resolveListChildLI will pick the right LI
	else if (LIST_RE.test(node.nodeName)) {
		resolved = /** @type {HTMLElement} */ (node);
	}
	// List item → resolve to LI itself (each list item gets its own handle)
	else if (LIST_ITEM_RE.test(node.nodeName)) {
		resolved = /** @type {HTMLElement} */ (node);
	}
	// Check if inside a table cell — walk up to table
	else if (isTableCell(node.parentNode)) {
		resolved = resolveToTable(node);
	} else {
		// Try getLine first (finds P, H1-H6, PRE, LI, etc.)
		const line = format.getLine(node, null);
		if (line) {
			resolved = line;
		}

		// If no line found, try getBlock (finds BLOCKQUOTE, UL, OL, TABLE, etc.)
		if (!resolved) {
			const block = format.getBlock(node, null);
			if (block) {
				// For table internals, resolve up to TABLE
				if (TABLE_INNER_RE.test(block.nodeName)) {
					resolved = resolveToTable(block);
				} else {
					resolved = block;
				}
			}
		}
	}

	// If nothing resolved, try walking up manually to find any block-level element
	if (!resolved) {
		let el = /** @type {Node} */ (node);
		while (el && !isWysiwygFrame(el)) {
			if (el.nodeType === 1 && el.parentNode && isWysiwygFrame(el.parentNode)) {
				resolved = /** @type {HTMLElement} */ (el);
				break;
			}
			el = el.parentNode;
		}
	}

	if (!resolved) return null;

	// Final component check on resolved element
	if (isInsideComponent(resolved)) return null;

	// For UL/OL, resolve to the closest child LI by mouse Y.
	// For LI with nested sub-lists, find the deepest child LI.
	if (mouseY !== undefined) {
		if (LIST_RE.test(resolved.nodeName)) {
			const childLI = resolveListChildLI(/** @type {HTMLElement} */ (resolved), mouseY);
			if (childLI) resolved = childLI;
		} else if (LIST_ITEM_RE.test(resolved.nodeName)) {
			const nested = resolveNestedLI(/** @type {HTMLElement} */ (resolved), mouseY);
			if (nested) resolved = nested;
		}
	}

	const { depth, parent } = computeDepth(resolved, format);
	const siblings = computeSiblings(resolved);
	const type = classifyType(resolved);

	return {
		element: resolved,
		type,
		depth,
		parent,
		siblings,
		rect: resolved.getBoundingClientRect(),
	};
}
