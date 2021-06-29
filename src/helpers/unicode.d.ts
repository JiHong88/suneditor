class unicode {
  /**
	 * @description Unicode Character 'ZERO WIDTH SPACE' (\u200B)
	 */
	zeroWidthSpace: string;

	/**
	 * @description Regular expression to find 'zero width space' (/\u200B/g)
	 */
	zeroWidthRegExp: RegExp;

	/**
	 * @description Regular expression to find only 'zero width space' (/^\u200B+$/)
	 */
	onlyZeroWidthRegExp: RegExp;

	/**
	 * @description A method that checks If the text is blank or to see if it contains 'ZERO WIDTH SPACE' or empty (util.zeroWidthSpace)
	 * @param text String value or Node
	 * @returns
	 */
	onlyZeroWidthSpace(text: string | Node): boolean;
}

export default unicode;