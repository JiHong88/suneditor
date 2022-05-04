class converter {
	/**
	 * @description Convert HTML string to HTML Entity
	 * @param content HTML or Text string
	 * @returns
	 */
	htmlToEntity(content: string): string;

	/**
	 * @description Convert HTML Entity to HTML string
	 * @param content HTML or Text string
	 * @returns
	 */
	entityToHTML(content: string): string;

	/**
	 * @description Create whitelist RegExp object.
	 * Return RegExp format: new RegExp("<\\/?\\b(?!" + list + ")\\b[^>^<]*+>", "gi")
	 * @param list Tags list ("br|p|div|pre...")
	 * @returns
	 */
	createTagsWhitelist(list: string): RegExp;

	/**
	 * @description Create blacklist RegExp object.
	 * Return RegExp format: new RegExp("<\\/?\\b(?:" + list + ")\\b[^>^<]*+>", "gi")
	 * @param list Tags list ("br|p|div|pre...")
	 * @returns
	 */
	createTagsBlacklist(list: string): RegExp;
}

export default converter;
