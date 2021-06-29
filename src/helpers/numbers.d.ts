class numbers {
  /**
	 * @description Checks for numeric (with decimal point).
	 * @param text Text string or number
	 * @returns
	 */
	isNumber(text: string | number): boolean;

	/**
	 * @description Get a number.
	 * @param text Text string or number
	 * @param maxDec Maximum number of decimal places (-1 : Infinity)
	 * @returns
	 */
	getNumber(text: string | number, maxDec: number): number;

	/**
	 * @description It compares the start and end indexes of "a" and "b" and returns the number of overlapping indexes in the range.
	 * ex) 1, 5, 4, 6 => "2" (4 ~ 5)
	 * @param aStart Start index of "a"
	 * @param aEnd End index of "a"
	 * @param bStart Start index of "b"
	 * @param bEnd Start index of "b"
	 * @returns
	 */
	getOverlapRangeAtIndex(aStart: number, aEnd: number, bStart: number, bEnd: number): number;
}

export default numbers;