const zwsp = 8203;

/**
 * @description Unicode Character 'ZERO WIDTH SPACE' (\u200B)
 * @type string
 */
export const zeroWidthSpace = String.fromCharCode(zwsp);

/**
 * @description Regular expression to find 'zero width space' (/\u200B/g)
 * @type RegExp
 */
export const zeroWidthRegExp = new RegExp(String.fromCharCode(zwsp), 'g');

/**
 * @description Regular expression to find only 'zero width space' (/\u200B/g)
 * @type RegExp
 */
export const onlyZeroWidthRegExp = new RegExp('^' + String.fromCharCode(zwsp) + '+$');

/**
 * @description Escape a string for safe use in regular expressions.
 * @param {String} string String to escape
 * @returns {String}
 */
export function escapeStringRegexp(string) {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	// Escape characters with special meaning either inside or outside character sets.
	// Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
	return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}

const unicode = {
	zeroWidthSpace,
	zeroWidthRegExp,
	onlyZeroWidthRegExp,
	escapeStringRegexp
};

export default unicode;
