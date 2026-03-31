import type {} from '../typedef';
/**
 * @description Converts a JSON tree (from htmlToJson) to a Markdown string.
 * @param {Object} jsonNode JSON node from htmlToJson
 * @returns {string} Markdown string
 * @example
 * const json = htmlToJson('<p><strong>Hello</strong> World</p>');
 * const md = jsonToMarkdown(json);
 * // '**Hello** World\n\n'
 */
export function jsonToMarkdown(jsonNode: any): string;
/**
 * @description Parses a Markdown string into an HTML string.
 * - HTML tags in the markdown are passed through as-is (for fallback elements).
 * @param {string} md Markdown string
 * @param {string} [defaultLine='p'] Default block element tag
 * @returns {string} HTML string
 * @example
 * markdownToHtml('# Hello\n\n**bold** text');
 * // '<h1>Hello</h1><p><strong>bold</strong> text</p>'
 */
export function markdownToHtml(md: string, defaultLine?: string): string;
export default markdown;
declare namespace markdown {
	export { jsonToMarkdown };
	export { markdownToHtml };
}
