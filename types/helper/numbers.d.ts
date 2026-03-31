import type {} from '../typedef';
/**
 * @description Checks for numeric (with decimal point).
 * @param {*} text Text string or number
 * @returns {boolean}
 */
export function is(text: any): boolean;
/**
 * @description Get a number.
 * @param {string|number} value Text string or number
 * @param {number} [maxDec=0] Maximum number of decimal places (`-1` : `Infinity`)
 * @returns {number}
 */
export function get(value: string | number, maxDec?: number): number;
/**
 * @description It compares the start and end indexes of `a` and `b` and returns the number of overlapping indexes in the range.
 * - e.g.) 1, 5, 4, 6 => `2` (4,5)
 * @param {number} aStart Start index of 'a'
 * @param {number} aEnd End index of 'a'
 * @param {number} bStart Start index of 'b'
 * @param {number} bEnd Start index of 'b'
 * @returns {number}
 */
export function getOverlapRangeAtIndex(aStart: number, aEnd: number, bStart: number, bEnd: number): number;
/**
 * @description Discriminate an even number
 * @param {number} value number
 * @returns {boolean}
 */
export function isEven(value: number): boolean;
/**
 * @description Discriminate an odd number
 * @param {number} value number
 * @returns {boolean}
 */
export function isOdd(value: number): boolean;
export default numbers;
declare namespace numbers {
	export { is };
	export { get };
	export { getOverlapRangeAtIndex };
	export { isEven };
	export { isOdd };
}
