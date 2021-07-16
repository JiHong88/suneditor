import { _w } from "./global";

/**
 * @description Checks for numeric (with decimal point).
 * @param {String|Number} text Text string or number
 * @returns {boolean}
 */
export function isNumber(text) {
    return !!text && /^-?\d+(\.\d+)?$/.test(text + "");
}

/**
 * @description Get a number.
 * @param {String|Number} text Text string or number
 * @param {number} maxDec Maximum number of decimal places (-1 : Infinity)
 * @returns {number}
 */
export function getNumber(text, maxDec) {
    if (!text) return 0;

    let number = (text + "").match(/-?\d+(\.\d+)?/);
    if (!number || !number[0]) return 0;

    number = number[0];
    return maxDec < 0 ?
        number * 1 :
        maxDec === 0 ?
        _w.Math.round(number * 1) :
        (number * 1).toFixed(maxDec) * 1;
}

/**
 * @description It compares the start and end indexes of "a" and "b" and returns the number of overlapping indexes in the range.
 * ex) 1, 5, 4, 6 => "2" (4,5)
 * @param {number} aStart Start index of "a"
 * @param {number} aEnd End index of "a"
 * @param {number} bStart Start index of "b"
 * @param {number} bEnd Start index of "b"
 * @returns {number}
 */
export function getOverlapRangeAtIndex(aStart, aEnd, bStart, bEnd) {
    if (aStart <= bEnd ? aEnd < bStart : aEnd > bStart) return 0;

    const overlap = (aStart > bStart ? aStart : bStart) - (aEnd < bEnd ? aEnd : bEnd);
    return (overlap < 0 ? overlap * -1 : overlap) + 1;
}

const numbers = {
    isNumber: isNumber,
    getNumber: getNumber,
    getOverlapRangeAtIndex: getOverlapRangeAtIndex
}

export default numbers;