import type {} from '../../../typedef';
/**
 * @description Resolve any DOM node inside the editor to its owning block-level element.
 * @param {Node|null} node - Any DOM node inside the editor
 * @param {FormatAPI} format - Injected format methods (getLine, getBlock, isLine, isBlock)
 * @param {HTMLElement} wysiwygFrame - The wysiwyg root element
 * @param {number} [mouseY] - Mouse clientY for nested list resolution
 * @returns {BlockInfo|null} Block information, or null if node is outside editable area
 */
export function resolveBlock(node: Node | null, format: FormatAPI, wysiwygFrame: HTMLElement, mouseY?: number): BlockInfo | null;
export type BlockInfo = {
	/**
	 * - The resolved block-level DOM element
	 */
	element: HTMLElement;
	/**
	 * - Block type: 'p', 'heading', 'list', 'blockquote', 'pre', 'figure', 'table', 'div'
	 */
	type: string;
	/**
	 * - Nesting level from wysiwyg root (0 = top-level)
	 */
	depth: number;
	/**
	 * - Parent block element, or null if top-level
	 */
	parent: HTMLElement | null;
	/**
	 * - Adjacent blocks at same depth
	 */
	siblings: {
		prev: HTMLElement | null;
		next: HTMLElement | null;
	};
	/**
	 * - getBoundingClientRect() of the element (caller handles scroll/iframe offset)
	 */
	rect: DOMRect;
};
export type FormatAPI = {
	getLine: (node: Node, validation?: (current: any) => boolean) => HTMLElement | null;
	getBlock: (element: Node, validation?: (current: any) => boolean) => HTMLElement | null;
	isLine: (element: Node) => boolean;
	isBlock: (element: Node) => boolean;
};
