import type {} from '../../../typedef';
/**
 * @description Deletes specific elements such as tables in "Firefox" and media elements (image, video, audio) in "Chrome".
 * - Handles deletion logic based on selection range and node types.
 * @param {SunEditor.EventPorts} ports - Reducer ports
 * @returns {boolean} Returns `true` if an element was deleted and focus was adjusted, otherwise `false`.
 */
export function hardDelete(ports: SunEditor.EventPorts): boolean;
/**
 * @description Cleans up removed tags and normalizes DOM structure.
 * Removes orphaned nodes that are outside the format element's valid range.
 * @param {SunEditor.EventPorts} ports - Reducer ports
 * @param {Node} startCon - Starting container node to clean
 * @param {Element} formatEl - Parent format element containing the structure
 * @returns {boolean|undefined} Returns true if nodes were removed, undefined otherwise
 */
export function cleanRemovedTags(ports: SunEditor.EventPorts, startCon: Node, formatEl: Element): boolean | undefined;
/**
 * @description Determines if the "range" is within an uneditable node.
 * @param {SunEditor.EventPorts} ports - Reducer ports
 * @param {Range} range The range object
 * @param {boolean} isFront Whether to check the start or end of the range
 * @returns {Node|null} The uneditable node if found, otherwise null
 */
export function isUneditableNode(ports: SunEditor.EventPorts, range: Range, isFront: boolean): Node | null;
/**
 * @description Excute eventManager._setDefaultLine
 * @param {SunEditor.EventPorts} ports - Reducer ports
 * @param {string} lineTagName - line tag name
 * @returns {void|null}
 */
export function setDefaultLine(ports: SunEditor.EventPorts, lineTagName: string): void | null;
