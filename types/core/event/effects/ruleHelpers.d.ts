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
export function isRtlBidiMismatch(range: Range, formatEl: HTMLElement, detectedEdge: 'front' | 'end', doc: Document): boolean;
