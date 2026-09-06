import type {} from '../typedef';
/**
 * @description Whether the HTML string is a Google Docs clipboard payload.
 * @param {string} html HTML string
 * @returns {boolean}
 */
export function isGoogleDocs(html: string): boolean;
/**
 * @description Removes the Google Docs clipboard wrapper tags, keeping their children.
 * - Only the guid-carrying inline wrappers (`b`/`span`) are unwrapped; real formatting tags inside are untouched.
 * @param {string} html HTML string
 * @returns {string} HTML string
 */
export function cleanHTML(html: string): string;
declare namespace _default {
	export { isGoogleDocs };
	export { cleanHTML };
}
export default _default;
