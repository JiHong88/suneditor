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

const unicode = {
	zeroWidthSpace,
	zeroWidthRegExp,
	onlyZeroWidthRegExp
};

export default unicode;
