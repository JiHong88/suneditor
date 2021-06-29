import {
    _w
} from "./global";

const zwsp = 8203;

/**
 * @description Unicode Character 'ZERO WIDTH SPACE' (\u200B)
 */
export const zeroWidthSpace = _w.String.fromCharCode(zwsp);

/**
 * @description Regular expression to find 'zero width space' (/\u200B/g)
 */
export const zeroWidthRegExp = new _w.RegExp(String.fromCharCode(zwsp), "g");


/**
 * @description Regular expression to find only 'zero width space' (/^\u200B+$/)
 */
export const onlyZeroWidthRegExp = new _w.RegExp("^" + String.fromCharCode(zwsp) + "+$");

/**
 * @description A method that checks If the text is blank or to see if it contains 'ZERO WIDTH SPACE' or empty (util.zeroWidthSpace)
 * @param {String|Node} text String value or Node
 * @returns {Boolean}
 */
export function onlyZeroWidthSpace(text) {
    if (typeof text !== "string") text = text.textContent;
    return text === "" || this.onlyZeroWidthRegExp.test(text);
}

const unicode = {
    zeroWidthSpace: zeroWidthSpace,
    zeroWidthRegExp: zeroWidthRegExp,
    onlyZeroWidthRegExp: onlyZeroWidthRegExp,
    onlyZeroWidthSpace: onlyZeroWidthSpace
}

export default unicode;