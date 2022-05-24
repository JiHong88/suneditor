import {
    _w
} from './global';

const zwsp = 8203;
const onlyZeroWidthRegExp = new _w.RegExp('^' + _w.String.fromCharCode(zwsp) + '+$');

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
 * @description A method that checks If the text is blank or to see if it contains 'ZERO WIDTH SPACE' or empty (unicode.zeroWidthSpace)
 * @param {string|Node} text String value or Node
 * @returns {boolean}
 */
export function onlyZeroWidthSpace(text) {
    if (text === null || text === undefined) return false;
    if (typeof text !== 'string') text = text.textContent;
    return text === '' || onlyZeroWidthRegExp.test(text);
}

const unicode = {
    zeroWidthSpace: zeroWidthSpace,
    zeroWidthRegExp: zeroWidthRegExp,
    onlyZeroWidthSpace: onlyZeroWidthSpace
}

export default unicode;