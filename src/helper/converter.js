/**
 * @description Convert HTML string to HTML Entity
 * @param {String} contents
 * @returns {String} Contents string
 * @private
 */
export function HTMLToEntity(contents) {
	const ec = { "&": "&amp;", "\u00A0": "&nbsp;", "'": "&apos;", '"': "&quot;", "<": "&lt;", ">": "&gt;" };
	return contents.replace(/&|\u00A0|'|"|<|>/g, function(m) {
		return typeof ec[m] === "string" ? ec[m] : m;
	});
}
/**
 * @description Convert HTML Entity to HTML string
 * @param {String} contents Contents string
 * @returns {String}
 */
export function entityToHTML(contents) {
	const ec = { "&amp;": "&", "&nbsp;": "\u00A0", "&apos;": "'", "&quot;": '"', "&lt;": "<", "&gt;": ">" };
	return contents.replace(/\&amp;|\&nbsp;|\&apos;|\&quot;|\$lt;|\$gt;/g, function(m) {
		return typeof ec[m] === "string" ? ec[m] : m;
	});
}

const converter = {
	HTMLToEntity: HTMLToEntity,
	entityToHTML: entityToHTML
};

export default converter;
