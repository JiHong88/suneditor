/**
 * @description Parses an HTML string into a DOM tree, then recursively traverses the nodes to convert them into a structured JSON representation.
 * -Each element includes its tag name, attributes, and children.
 * -Text nodes are represented as { type: 'text', content: '...' }.
 * @param {string} content HTML string
 * @returns {Object<string, *>} JSON data
 */
export function htmlToJson(content: string): {
	[x: string]: any;
};
/**
 * @description Takes a JSON structure representing HTML elements and recursively serializes it into a valid HTML string.
 * -It rebuilds each tag with attributes and inner content.
 * Text content and attributes are safely escaped to prevent parsing issues or XSS.
 * Useful for restoring dynamic HTML from a data format.
 * @param {Object<string, *>} jsonData
 * @returns {string} HTML string
 */
export function jsonToHtml(jsonData: { [x: string]: any }): string;
/**
 * @description Convert HTML string to HTML Entity
 * @param {string} content
 * @returns {string} Content string
 * @private
 */
export function htmlToEntity(content: string): string;
/**
 * @description Convert HTML Entity to HTML string
 * @param {string} content Content string
 * @returns {string}
 */
export function entityToHTML(content: string): string;
/**
 * @description Debounce function
 * @param {(...args: *) => void} func function
 * @param {number} wait delay ms
 * @returns {*} executedFunction
 */
export function debounce(func: (...args: any) => void, wait: number): any;
/**
 * @description Synchronizes two Map objects by updating the first Map with the values from the second,
 * - and deleting any keys in the first Map that are not present in the second.
 * @param {Map<*, *>} targetMap The Map to update (target).
 * @param {Map<*, *>} referenceMap The Map providing the reference values (source).
 */
export function syncMaps(targetMap: Map<any, any>, referenceMap: Map<any, any>): void;
/**
 * @description Merges multiple Map objects into a new Map using spread syntax.
 * - Entries from later maps in the arguments list will overwrite entries from earlier maps if keys conflict.
 * - The original maps are not modified.
 * @param {...Map<*, *>} mapsToMerge - An arbitrary number of Map objects to merge.
 * @returns {Map<*, *>} A new Map containing all entries from the input maps.
 */
export function mergeMaps(...mapsToMerge: Map<any, any>[]): Map<any, any>;
/**
 * @description Object.values
 * @param {Object<*, *>} obj Object parameter.
 * @returns {Array<*>}
 */
export function getValues(obj: any): Array<any>;
/**
 * @description Convert the CamelCase To the KebabCase.
 * @param {string|Array<string>} param [Camel string]
 */
export function camelToKebabCase(param: string | Array<string>): any;
/**
 * @overload
 * @param {string} param - Kebab-case string.
 * @returns {string} CamelCase string.
 */
export function kebabToCamelCase(param: string): string;
/**
 * @overload
 * @param {Array<string>} param - Array of Kebab-case strings.
 * @returns {Array<string>} Array of CamelCase strings.
 */
export function kebabToCamelCase(param: Array<string>): Array<string>;
/**
 *
 * @param {"em"|"rem"|"%"|"pt"|"px"} to Size units to be converted
 * @param {string} size siSize to convert with units (ex: "15rem")
 * @returns {string}
 */
export function toFontUnit(to: 'em' | 'rem' | '%' | 'pt' | 'px', size: string): string;
/**
 * @description Convert the node list to an array. If not, returns an empty array.
 * @param {?__se__NodeCollection} nodeList
 * @returns Array
 */
export function nodeListToArray(nodeList: __se__NodeCollection | null): any;
/**
 * @description Returns a new object with keys and values swapped.
 * @param {Object<*, *>} obj object
 * @returns {Object<*, *>}
 */
export function swapKeyValue(obj: any): any;
/**
 * @description Create whitelist RegExp object.
 * @param {string} list Tags list ("br|p|div|pre...")
 * @returns {RegExp} Return RegExp format: new RegExp("<\\/?\\b(?!" + list + ")\\b[^>^<]*+>", "gi")
 */
export function createElementWhitelist(list: string): RegExp;
/**
 * @description Create blacklist RegExp object.
 * @param {string} list Tags list ("br|p|div|pre...")
 * @returns {RegExp} Return RegExp format: new RegExp("<\\/?\\b(?:" + list + ")\\b[^>^<]*+>", "gi")
 */
export function createElementBlacklist(list: string): RegExp;
/**
 * @description Function to check hex format color
 * @param {string} str Color value
 */
export function isHexColor(str: string): boolean;
/**
 * @description Function to convert hex format to a rgb color
 * @param {string} rgba RGBA color format
 * @returns {string}
 */
export function rgb2hex(rgba: string): string;
/**
 * @description Computes the width as a percentage of the parent's width, and returns this value rounded to two decimal places.
 * @param {HTMLElement} target The target element for which to calculate the width percentage.
 * @param {?HTMLElement=} parentTarget The parent element to use as the reference for the width calculation. If not provided, the target's parent element is used.
 * @returns {number}
 */
export function getWidthInPercentage(target: HTMLElement, parentTarget?: (HTMLElement | null) | undefined): number;
/**
 * @description Convert url pattern text node to anchor node
 * @param {Node} node Text node
 * @returns {boolean} Return true if the text node is converted to an anchor node
 */
export function textToAnchor(node: Node): boolean;
/**
 * Converts styles within a <span> tag to corresponding HTML tags (e.g., <strong>, <em>, <u>, <s>).
 * Maintains the original <span> tag and wraps its content with the new tags.
 * @param {{ regex: RegExp, tag: string }} styleToTag An object mapping style properties to HTML tags. ex) {bold: { regex: /font-weight\s*:\s*bold/i, tag: 'strong' },}
 * @param {Node} node Node
 */
export function spanToStyleNode(
	styleToTag: {
		regex: RegExp;
		tag: string;
	},
	node: Node
): void;
/**
 * Adds a query string to a URL. If the URL already contains a query string, the new query is appended to the existing one.
 * @param {string} url The original URL to which the query string will be added.
 * @param {string} query The query string to be added to the URL.
 * @returns {string} The updated URL with the query string appended.
 */
export function addUrlQuery(url: string, query: string): string;
/**
 * @typedef {Object} OptionStyleResult
 * @property {string} top - Styles applied to the top container (e.g. width, z-index, etc).
 * @property {string} frame - Styles applied to the iframe container (e.g. height, min-height).
 * @property {string} editor - Styles applied to the editable content area.
 */
/**
 * @description Converts options-related styles and returns them for each frame.
 * @param {Map<string, *>} fo editor.frameOptions
 * @param {string} cssText Style string
 * @returns {OptionStyleResult}
 * @private
 */
export function _setDefaultOptionStyle(fo: Map<string, any>, cssText: string): OptionStyleResult;
/**
 * @description Set default style tag of the iframe
 * @param {Array<string>} linkNames link names array of CSS files
 * @returns {string} "<link rel="stylesheet" href=".." />.."
 */
export function _setIframeStyleLinks(linkNames: Array<string>): string;
/**
 * @description When iframe height options is "auto" return "<style>" tag that required.
 * @param {string} frameHeight height
 * @returns {string} "<style>...</style>"
 */
export function _setAutoHeightStyle(frameHeight: string): string;
export default converter;
export type OptionStyleResult = {
	/**
	 * - Styles applied to the top container (e.g. width, z-index, etc).
	 */
	top: string;
	/**
	 * - Styles applied to the iframe container (e.g. height, min-height).
	 */
	frame: string;
	/**
	 * - Styles applied to the editable content area.
	 */
	editor: string;
};
declare namespace converter {
	export { htmlToJson };
	export { jsonToHtml };
	export { htmlToEntity };
	export { entityToHTML };
	export { debounce };
	export { syncMaps };
	export { mergeMaps };
	export { getValues };
	export { camelToKebabCase };
	export { kebabToCamelCase };
	export { toFontUnit };
	export { nodeListToArray };
	export { swapKeyValue };
	export { createElementWhitelist };
	export { createElementBlacklist };
	export { isHexColor };
	export { rgb2hex };
	export { getWidthInPercentage };
	export { textToAnchor };
	export { spanToStyleNode };
	export { addUrlQuery };
	export { _setDefaultOptionStyle };
	export { _setIframeStyleLinks };
	export { _setAutoHeightStyle };
}
