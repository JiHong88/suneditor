import type {} from '../../../typedef';
export type EventPorts = import('../ports').EventReducerPorts;
/**
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 */
/**
 * @description Deletes specific elements such as tables in `Firefox` and media elements (image, video, audio) in `Chrome`.
 * - Handles deletion logic based on selection range and node types.
 * @param {EventPorts} ports - Reducer ports
 * @returns {boolean} Returns `true` if an element was deleted and focus was adjusted, otherwise `false`.
 */
export function hardDelete(ports: EventPorts): boolean;
/**
 * @description Cleans up removed tags and normalizes DOM structure.
 * Removes orphaned nodes that are outside the format element's valid range.
 * @param {EventPorts} ports - Reducer ports
 * @param {Node} startCon - Starting container node to clean
 * @param {Element} formatEl - Parent format element containing the structure
 * @returns {boolean} Returns `true` if nodes were removed, `undefined` otherwise
 */
export function cleanRemovedTags(ports: EventPorts, startCon: Node, formatEl: Element): boolean;
/**
 * @description Determines if the `range` is within an uneditable node.
 * @param {EventPorts} ports - Reducer ports
 * @param {Range} range The range object
 * @param {boolean} isFront Whether to check the start or end of the range
 * @returns {Node|null} The uneditable node if found, otherwise `null`
 */
export function isUneditableNode(ports: EventPorts, range: Range, isFront: boolean): Node | null;
/**
 * @description Execute `eventManager._setDefaultLine`
 * @param {EventPorts} ports - Reducer ports
 * @param {string} lineTagName - `line` tag name
 * @returns {void}
 */
export function setDefaultLine(ports: EventPorts, lineTagName: string): void;
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
export function isRtlBidiMismatch(
	range: Range,
	formatEl: HTMLElement,
	detectedEdge: 'front' | 'end',
	doc: Document,
): boolean;
/**
 * @description Whether the caret sits on a bare `<br>` that stands at the front/end edge of its `line`.
 * @param {Range} range - The current range
 * @param {Node} selectionNode - Current selection node
 * @param {'front'|'end'} edge - Edge to test: `front` for Backspace, `end` for Delete
 * @returns {boolean} `true` if the caret is on an edge `<br>`
 */
export function isEdgeBreakCaret(range: Range, selectionNode: Node, edge: 'front' | 'end'): boolean;
/**
 * @description The previous/next element in document order — crossing in and out of blocks (list, quote).
 * - Out of list-cell ancestors (a nested list), stopping at a closure block (table cell).
 * @param {EventPorts['format']} format - Format module
 * @param {?HTMLElement} line - The caret's `line` element
 * @param {'front'|'end'} edge - `front` for the previous element, `end` for the next one
 * @returns {?HTMLElement} The adjacent element, or `null` at the document edge
 */
export function getAdjacentElement(
	format: EventPorts['format'],
	line: HTMLElement | null,
	edge: 'front' | 'end',
): HTMLElement | null;
/**
 * @description The previous/next `line` in document order — {@link getAdjacentElement} filtered to lines.
 * - `null` means either the document edge or a non-`line` neighbour (a component); use
 * {@link getAdjacentElement} when the two must be told apart.
 * @param {EventPorts['format']} format - Format module
 * @param {?HTMLElement} line - The caret's `line` element
 * @param {'front'|'end'} edge - `front` for the previous line, `end` for the next one
 * @returns {?HTMLElement} The adjacent line, or `null`
 */
export function getAdjacentLine(
	format: EventPorts['format'],
	line: HTMLElement | null,
	edge: 'front' | 'end',
): HTMLElement | null;
/**
 * @description The neighbouring `line` an empty line collapses into, or `null` when there is nothing to merge.
 * - A cell owning a nested list belongs to {@link getNestedListTarget} instead.
 * @param {EventPorts['format']} format - Format module
 * @param {?HTMLElement} formatEl - The caret's `line` element
 * @param {'front'|'end'} edge - `front` for Backspace (previous line), `end` for Delete (next line)
 * @returns {?HTMLElement} The neighbouring line to merge into, or `null`
 */
export function getEmptyLineMergeTarget(
	format: EventPorts['format'],
	formatEl: HTMLElement | null,
	edge: 'front' | 'end',
): HTMLElement | null;
/**
 * @description The nested list a list-cell Backspace/Delete would lift, or `null` when there is none.
 * - The rules gate their list branch on it so the branch can't claim the key with nothing to do.
 * @param {HTMLElement} formatEl - The caret's list cell
 * @param {HTMLElement} rangeEl - The list (`UL`/`OL`) the cell belongs to
 * @returns {?HTMLElement} The element carrying the nested list, or `null`
 */
export function getNestedListTarget(formatEl: HTMLElement, rangeEl: HTMLElement): HTMLElement | null;
