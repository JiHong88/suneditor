/**
 * @description Checks for numeric (with decimal point).
 * @param {*} text Text string or number
 * @returns {boolean}
 */
export function is(text) {
	return /^-?\d+(\.\d+)?$/.test(text + '');
}

/**
 * @description Get a number.
 * @param {string|number} value Text string or number
 * @param {number} [maxDec=0] Maximum number of decimal places (-1 : Infinity)
 * @returns {number}
 */
export function get(value, maxDec = 0) {
	if (!value) return 0;

	const matched = (value + '').match(/-?\d+(\.\d+)?/);
	if (!matched || !matched[0]) return 0;

	const number = Number(matched[0]);
	return maxDec < 0 ? number : maxDec === 0 ? Math.round(number) : Number(number.toFixed(maxDec));
}

/**
 * @description It compares the start and end indexes of 'a' and 'b' and returns the number of overlapping indexes in the range.
 * - e.g.) 1, 5, 4, 6 => '2' (4,5)
 * @param {number} aStart Start index of 'a'
 * @param {number} aEnd End index of 'a'
 * @param {number} bStart Start index of 'b'
 * @param {number} bEnd Start index of 'b'
 * @returns {number}
 */
export function getOverlapRangeAtIndex(aStart, aEnd, bStart, bEnd) {
	if (aStart <= bEnd ? aEnd < bStart : aEnd > bStart) return 0;

	const overlap = (aStart > bStart ? aStart : bStart) - (aEnd < bEnd ? aEnd : bEnd);
	return (overlap < 0 ? overlap * -1 : overlap) + 1;
}

/**
 * @description Discriminate an even number
 * @param {number} value number
 * @returns {boolean}
 */
export function isEven(value) {
	return (value & 1) === 0;
}

/**
 * @description Discriminate an odd number
 * @param {number} value number
 * @returns {boolean}
 */
export function isOdd(value) {
	return (value & 1) === 1;
}

const numbers = {
	is,
	get,
	getOverlapRangeAtIndex,
	isEven,
	isOdd
};

export default numbers;
