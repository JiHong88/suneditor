import type {} from '../typedef';
/**
 * @description Converts MS Word/Excel/OneNote HTML clipboard data to clean, standards-compliant HTML.
 * @param {string} html Raw HTML string from MS Office clipboard
 * @returns {string} Cleaned HTML string
 */
export function cleanHTML(html: string): string;
declare namespace _default {
	export { cleanHTML };
}
export default _default;
