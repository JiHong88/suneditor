import { _w } from './env';

const zwsp = 8203;

/**
 * @description Unicode Character 'ZERO WIDTH SPACE' (\u200B)
 * @type string
 */
export const zeroWidthSpace = _w.String.fromCharCode(zwsp);

/**
 * @description Regular expression to find 'zero width space' (/\u200B/g)
 * @type RegExp
 */
export const zeroWidthRegExp = new _w.RegExp(String.fromCharCode(zwsp), 'g');

/**
 * @description Regular expression to find only 'zero width space' (/\u200B/g)
 * @type RegExp
 */
export const onlyZeroWidthRegExp = new _w.RegExp('^' + _w.String.fromCharCode(zwsp) + '+$');

const unicode = {
	zeroWidthSpace,
	zeroWidthRegExp,
	onlyZeroWidthRegExp
};

export default unicode;
