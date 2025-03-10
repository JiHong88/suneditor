/**
 * @description Escape a string for safe use in regular expressions.
 * @param {string} string String to escape
 * @returns {string}
 */
export function escapeStringRegexp(string: string): string;
/**
 * @description Unicode Character 'ZERO WIDTH SPACE' (\u200B)
 * @type {string}
 */
export const zeroWidthSpace: string;
/**
 * @description Regular expression to find 'zero width space' (/\u200B/g)
 * @type {RegExp}
 */
export const zeroWidthRegExp: RegExp;
/**
 * @description Regular expression to find only 'zero width space' (/\u200B/g)
 * @type {RegExp}
 */
export const onlyZeroWidthRegExp: RegExp;
export default unicode;
declare namespace unicode {
	export { zeroWidthSpace };
	export { zeroWidthRegExp };
	export { onlyZeroWidthRegExp };
	export { escapeStringRegexp };
}
