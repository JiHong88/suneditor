import type {} from '../typedef';
/**
 * @description Checks whether the HTML content originated from Microsoft Office (Word, Excel, OneNote, Word Online).
 * @param {string} html HTML string
 * @returns {boolean}
 */
export function isMSOffice(html: string): boolean;
/**
 * @description Converts MS Word/Excel/OneNote HTML clipboard data to clean, standards-compliant HTML.
 * @param {string} html Raw HTML string from MS Office clipboard
 * @returns {string} Cleaned HTML string
 */
export function cleanHTML(html: string): string;
declare namespace _default {
	export { isMSOffice };
	export { cleanHTML };
}
export default _default;
