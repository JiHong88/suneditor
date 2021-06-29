class converter {
	/**
	 * @description Convert HTML string to HTML Entity
	 * @param contents HTML or Text string
	 * @returns
	 */
	htmlToEntity(contents: string): string;

	 /**
		* @description Convert HTML Entity to HTML string
		* @param contents HTML or Text string
		* @returns
		*/
	entityToHTML(contents: string): string;

	/**
	 * @description Create whitelist RegExp object.
	 * Return RegExp format: new RegExp("<\\/?\\b(?!" + list + ")\\b[^>^<]*+>", "gi")
	 * @param list Tags list ("br|p|div|pre...")
	 * @returns
	 */
	 createTagsWhitelist(list: string): RegExp;
}

export default converter;