import { _d, _w } from './env';

const _RE_HTML_CHARS = /&|\u00A0|'|"|<|>/g;
const _RE_HTML_ENTITIES = /&amp;|&nbsp;|&apos;|&quot;|&lt;|&gt;/g;
const _HTML_TO_ENTITY = { '&': '&amp;', '\u00A0': '&nbsp;', "'": '&apos;', '"': '&quot;', '<': '&lt;', '>': '&gt;' };
const _ENTITY_TO_HTML = { '&amp;': '&', '&nbsp;': '\u00A0', '&apos;': "'", '&quot;': '"', '&lt;': '<', '&gt;': '>' };
const _RE_UPPER_CASE = /[A-Z]/g;
const _RE_KEBAB_CHAR = /-[a-zA-Z]/g;

const FONT_VALUES_MAP = {
	'xx-small': 0.5625,
	'x-small': 0.625,
	small: 0.8333,
	medium: 1,
	large: 1.125,
	'x-large': 1.5,
	'xx-large': 2,
	'xxx-large': 2.5,
};

function NodeToJson(node) {
	// text
	if (node.nodeType === 3) {
		const text = node.nodeValue.trim();
		if (text) return { type: 'text', content: text };
		return null;
	}

	// element
	if (node.nodeType === 1) {
		const jsonNode = {
			type: 'element',
			tag: node.tagName.toLowerCase(),
			attributes: {},
			children: [],
		};

		// get attribute
		for (const attr of node.attributes) {
			jsonNode.attributes[attr.name] = attr.value;
		}

		// children
		for (const child of node.childNodes) {
			const childJson = NodeToJson(child);
			if (childJson) jsonNode.children.push(childJson);
		}

		return jsonNode;
	}

	return null;
}

/**
 * @description Parses an HTML string into a DOM tree, then recursively traverses the nodes to convert them into a structured JSON representation.
 * -Each element includes its tag name, attributes, and children.
 * -Text nodes are represented as { type: 'text', content: '...' }.
 * @param {string} content HTML string
 * @returns {Object<string, *>} JSON data
 */
export function htmlToJson(content) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(content, 'text/html');
	return NodeToJson(doc.body);
}

/**
 * @description Takes a JSON structure representing HTML elements and recursively serializes it into a valid HTML string.
 * -It rebuilds each tag with attributes and inner content.
 * Text content and attributes are safely escaped to prevent parsing issues or XSS.
 * Useful for restoring dynamic HTML from a data format.
 * @param {Object<string, *>} jsonData
 * @returns {string} HTML string
 */
export function jsonToHtml(jsonData) {
	if (!jsonData) return '';

	if (jsonData.type === 'text') {
		return htmlToEntity(jsonData.content || '');
	}

	if (jsonData.type === 'element') {
		const { tag, attributes = {}, children = [] } = jsonData;

		// 속성 문자열 구성
		const attrString = Object.entries(attributes)
			.map(([key, value]) => `${key}="${htmlToEntity(value)}"`)
			.join(' ');

		const openTag = attrString ? `<${tag} ${attrString}>` : `<${tag}>`;
		const closeTag = `</${tag}>`;

		const childrenHtml = children.map(jsonToHtml).join('');

		return `${openTag}${childrenHtml}${closeTag}`;
	}

	return '';
}

/**
 * @description Convert HTML string to HTML Entity
 * @param {string} content
 * @returns {string} Content string
 */
export function htmlToEntity(content) {
	return content.replace(_RE_HTML_CHARS, (m) => {
		return _HTML_TO_ENTITY[m] || m;
	});
}

/**
 * @description Convert HTML Entity to HTML string
 * @param {string} content Content string
 * @returns {string}
 */
export function entityToHTML(content) {
	return content.replace(_RE_HTML_ENTITIES, (m) => {
		return _ENTITY_TO_HTML[m] || m;
	});
}

/**
 * @description Debounce function
 * @param {(...args: *) => void} func function
 * @param {number} wait delay ms
 * @returns {*} executedFunction
 */
export function debounce(func, wait) {
	let timeout;

	return function executedFunction(...args) {
		const later = () => {
			_w.clearTimeout(timeout);
			func(...args);
		};

		_w.clearTimeout(timeout);
		timeout = _w.setTimeout(later, wait);
	};
}

/**
 * @description Synchronizes two Map objects by updating the first Map with the values from the second,
 * - and deleting any keys in the first Map that are not present in the second.
 * @param {Map<*, *>} targetMap The Map to update (target).
 * @param {Map<*, *>} referenceMap The Map providing the reference values (source).
 */
export function syncMaps(targetMap, referenceMap) {
	referenceMap.forEach((value, key) => {
		targetMap.set(key, value);
	});

	targetMap.forEach((_value, key) => {
		if (!referenceMap.has(key)) {
			targetMap.delete(key);
		}
	});
}

/**
 * @description Merges multiple Map objects into a new Map using spread syntax.
 * - Entries from later maps in the arguments list will overwrite entries from earlier maps if keys conflict.
 * - The original maps are not modified.
 * @param {...Map<*, *>} mapsToMerge - An arbitrary number of Map objects to merge.
 * @returns {Map<*, *>} A new Map containing all entries from the input maps.
 */
export function mergeMaps(...mapsToMerge) {
	const validMaps = mapsToMerge.filter((m) => {
		if (!(m instanceof Map)) {
			return false;
		}
		return true;
	});

	const allEntries = validMaps.flatMap((map) => [...map]);

	return new Map(allEntries);
}

/**
 * @description Object.values
 * @param {Object<*, *>} obj Object parameter.
 * @returns {Array<*>}
 */
export function getValues(obj) {
	return !obj
		? []
		: Object.keys(obj).map(function (i) {
				return obj[i];
			});
}

/**
 * @description Convert the CamelCase To the KebabCase.
 * @param {string|Array<string>} param [Camel string]
 */
export function camelToKebabCase(param) {
	if (typeof param === 'string') {
		return param.replace(_RE_UPPER_CASE, (letter) => '-' + letter.toLowerCase());
	} else {
		return param.map(function (str) {
			return camelToKebabCase(str);
		});
	}
}

/**
 * @overload
 * @param {string} param - Kebab-case string.
 * @returns {string} CamelCase string.
 */
/**
 * @overload
 * @param {Array<string>} param - Array of Kebab-case strings.
 * @returns {Array<string>} Array of CamelCase strings.
 */
export function kebabToCamelCase(param) {
	if (typeof param === 'string') {
		return param.replace(_RE_KEBAB_CHAR, (letter) => letter.replace('-', '').toUpperCase());
	} else {
		return param.map(function (str) {
			return kebabToCamelCase(str);
		});
	}
}

/**
 *
 * @param {"em"|"rem"|"%"|"pt"|"px"} to Size units to be converted
 * @param {string} size siSize to convert with units (ex: "15rem")
 * @returns {string}
 */
export function toFontUnit(to, size) {
	const value = size.match(/(\d+(?:\.\d+)?)(.+)/);
	const sizeNum = value ? Number(value[1]) : FONT_VALUES_MAP[size];
	const from = value ? value[2] : 'rem';
	let pxSize = sizeNum;

	if (/em/.test(from)) {
		pxSize = Math.round(sizeNum / 0.0625);
	} else if (from === 'pt') {
		pxSize = Math.round(sizeNum * 1.333);
	} else if (from === '%') {
		pxSize = sizeNum / 100;
	}

	switch (to) {
		case 'em':
		case 'rem':
			return (pxSize * 0.0625).toFixed(2) + to;
		case '%':
			return Number((pxSize * 0.0625).toFixed(2)) * 100 + to;
		case 'pt':
			return Math.round(pxSize / 1.333) + to;
		default:
			// px
			return pxSize + to;
	}
}

/**
 * @description Convert the node list to an array. If not, returns an empty array.
 * @param {?SunEditor.NodeCollection} [nodeList]
 * @returns Array
 */
export function nodeListToArray(nodeList) {
	if (!nodeList) return [];
	return Array.prototype.slice.call(nodeList);
}

/**
 * @description Returns a new object with keys and values swapped.
 * @param {Object<*, *>} obj object
 * @returns {Object<*, *>}
 */
export function swapKeyValue(obj) {
	const swappedObj = {};

	const hasOwn = Object.prototype.hasOwnProperty;
	for (const key in obj) {
		if (hasOwn.call(obj, key)) {
			swappedObj[obj[key]] = key;
		}
	}

	return swappedObj;
}

/**
 * @description Create whitelist RegExp object.
 * @param {string} list Tags list ("br|p|div|pre...")
 * @returns {RegExp} Return RegExp format: new RegExp("<\\/?\\b(?!" + list + ")\\b[^>^<]*+>", "gi")
 */
export function createElementWhitelist(list) {
	return new RegExp(`<\\/?\\b(?!\\b${(list || '').replace(/\|/g, '\\b|\\b')}\\b)[^>]*>`, 'gi');
}

/**
 * @description Create blacklist RegExp object.
 * @param {string} list Tags list ("br|p|div|pre...")
 * @returns {RegExp} Return RegExp format: new RegExp("<\\/?\\b(?:" + list + ")\\b[^>^<]*+>", "gi")
 */
export function createElementBlacklist(list) {
	return new RegExp(`<\\/?\\b(?:\\b${(list || '^').replace(/\|/g, '\\b|\\b')}\\b)[^>]*>`, 'gi');
}

/**
 * @description Function to check hex format color
 * @param {string} str Color value
 */
export function isHexColor(str) {
	return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(str);
}

/**
 * @description Function to convert hex format to a rgb color
 * @param {string} rgba RGBA color format
 * @returns {string}
 */
export function rgb2hex(rgba) {
	if (isHexColor(rgba) || !rgba) return rgba;

	const rgbaMatch = rgba.match(/^rgba?[\s+]?\(([\d]+)[\s+]?,[\s+]?([\d]+)[\s+]?,[\s+]?([\d]+)[\s+]?/i);

	if (rgbaMatch && rgbaMatch.length >= 4) {
		const r = ('0' + parseInt(rgbaMatch[1], 10).toString(16)).slice(-2);
		const g = ('0' + parseInt(rgbaMatch[2], 10).toString(16)).slice(-2);
		const b = ('0' + parseInt(rgbaMatch[3], 10).toString(16)).slice(-2);

		let a = '';
		if (rgba.includes('rgba')) {
			const alphaMatch = rgba.match(/,\s*([\d]+\.?[\d]*)\s*\)/);
			if (alphaMatch) {
				a = ('0' + Math.round(parseFloat(alphaMatch[1]) * 255).toString(16)).slice(-2);
			}
		}

		return `#${r}${g}${b}${a}`;
	} else {
		return rgba;
	}
}

/**
 * @description Computes the width as a percentage of the parent's width, and returns this value rounded to two decimal places.
 * @param {HTMLElement} target The target element for which to calculate the width percentage.
 * @param {?HTMLElement} [parentTarget] The parent element to use as the reference for the width calculation. If not provided, the target's parent element is used.
 * @returns {number}
 */
export function getWidthInPercentage(target, parentTarget) {
	const parent = /** @type {HTMLElement} */ (parentTarget || target.parentElement);
	const parentStyle = _w.getComputedStyle(parent);
	const parentPaddingLeft = parseFloat(parentStyle.paddingLeft);
	const parentPaddingRight = parseFloat(parentStyle.paddingRight);
	const scrollbarWidth = parent.offsetWidth - parent.clientWidth;
	const parentWidth = parent.offsetWidth - parentPaddingLeft - parentPaddingRight - scrollbarWidth;
	const widthInPercentage = (target.offsetWidth / parentWidth) * 100;
	return widthInPercentage;
}

/**
 * @description Convert url pattern text node to anchor node
 * @param {Node} node Text node
 * @returns {boolean} Return true if the text node is converted to an anchor node
 */
export function textToAnchor(node) {
	const URLPattern = /https?:\/\/[^\s]+/g;

	if (node.nodeType === 3 && URLPattern.test(node.textContent) && !/^A$/i.test(node.parentNode?.nodeName)) {
		const textContent = node.textContent;
		const fragment = _d.createDocumentFragment();

		let lastIndex = 0;
		textContent.replace(URLPattern, (match, offset) => {
			if (offset > lastIndex) {
				fragment.appendChild(_d.createTextNode(textContent.slice(lastIndex, offset)));
			}
			const anchor = _d.createElement('a');
			anchor.href = match;
			anchor.target = '_blank';
			anchor.textContent = match;
			fragment.appendChild(anchor);
			lastIndex = offset + match.length;
			return match;
		});

		if (lastIndex < textContent.length) {
			fragment.appendChild(_d.createTextNode(textContent.slice(lastIndex)));
		}

		node.parentNode.replaceChild(fragment, node);
		return true;
	}

	return false;
}

/**
 * Converts styles within a <span> tag to corresponding HTML tags (e.g., <strong>, <em>, <u>, <s>).
 * Maintains the original <span> tag and wraps its content with the new tags.
 * @param {{ regex: RegExp, tag: string }} styleToTag An object mapping style properties to HTML tags. ex) {bold: { regex: /font-weight\s*:\s*bold/i, tag: 'strong' },}
 * @param {Node} node Node
 */
export function spanToStyleNode(styleToTag, node) {
	if (node.nodeType === 1 && /^SPAN$/i.test(node.nodeName) && /** @type {HTMLElement} */ (node).hasAttribute('style')) {
		const style = /** @type {HTMLElement} */ (node).getAttribute('style');
		const tags = [];
		Object.keys(styleToTag).forEach((key) => {
			if (styleToTag[key].regex.test(style)) {
				const tag = _d.createElement(styleToTag[key].tag);
				tags.push(tag);
			}
		});

		if (tags.length > 0) {
			const temp = _d.createElement('span');
			let currentNode = node.firstChild;

			tags.forEach((tag, index) => {
				if (index === 0) {
					temp.appendChild(tag);
				} else {
					tags[index - 1].appendChild(tag);
				}
			});

			const parent = tags[tags.length - 1];
			while (currentNode) {
				const nextNode = currentNode.nextSibling;
				parent.appendChild(currentNode);
				currentNode = nextNode;
			}

			node.appendChild(temp);
		}
	}
}

/**
 * Adds a query string to a URL. If the URL already contains a query string, the new query is appended to the existing one.
 * @param {string} url The original URL to which the query string will be added.
 * @param {string} query The query string to be added to the URL.
 * @returns {string} The updated URL with the query string appended.
 */
export function addUrlQuery(url, query) {
	if (query.length > 0) {
		if (/\?/.test(url)) {
			const splitUrl = url.split('?');
			url = splitUrl[0] + '?' + query + '&' + splitUrl[1];
		} else {
			url += '?' + query;
		}
	}
	return url;
}

/**
 * @typedef {import('../core/schema/options').OptionStyleResult} OptionStyleResult_converter
 */

/**
 * @description Converts options-related styles and returns them for each frame.
 * @param {SunEditor.FrameOptions} fo editor.frameOptions
 * @param {string} cssText Style string
 * @returns {OptionStyleResult_converter}
 */
export function _setDefaultOptionStyle(fo, cssText) {
	let optionStyle = '';
	if (fo.get('height')) optionStyle += 'height:' + fo.get('height') + ';';
	if (fo.get('minHeight')) optionStyle += 'min-height:' + fo.get('minHeight') + ';';
	if (fo.get('maxHeight')) optionStyle += 'max-height:' + fo.get('maxHeight') + ';';
	if (fo.get('width')) optionStyle += 'width:' + fo.get('width') + ';';
	if (fo.get('minWidth')) optionStyle += 'min-width:' + fo.get('minWidth') + ';';
	if (fo.get('maxWidth')) optionStyle += 'max-width:' + fo.get('maxWidth') + ';';

	let top = '',
		frame = '',
		editor = '';
	cssText = optionStyle + cssText;
	const styleArr = cssText.split(';');
	for (let i = 0, len = styleArr.length, s; i < len; i++) {
		s = styleArr[i].trim();
		if (!s) continue;
		if (/^(min-|max-)?width\s*:/.test(s) || /^(z-index|position|display)\s*:/.test(s)) {
			top += s + ';';
			continue;
		}
		if (/^(min-|max-)?height\s*:/.test(s)) {
			if (/^height/.test(s) && s.split(':')[1].trim() === 'auto') {
				fo.set('height', 'auto');
			}
			frame += s + ';';
			continue;
		}
		editor += s + ';';
	}

	return {
		top: top,
		frame: frame,
		editor: editor,
	};
}

/**
 * @description Set default style tag of the iframe
 * @param {Array<string>} linkNames link names array of CSS files or '*' for all stylesheets
 * @returns {string} "<link rel="stylesheet" href=".." />.."
 */
export function _setIframeStyleLinks(linkNames) {
	let tagString = '';

	if (linkNames) {
		const allLinks = _d.getElementsByTagName('link');

		for (let f = 0, len = linkNames.length, path; f < len; f++) {
			path = [];
			const linkName = linkNames[f];

			// Wildcard: include all stylesheets
			if (linkName === '*') {
				for (let i = 0, cLen = allLinks.length; i < cLen; i++) {
					if (allLinks[i].rel === 'stylesheet' && allLinks[i].href) {
						path.push(allLinks[i].href);
					}
				}
			}
			// Absolute URL or data URL
			else if (/(^https?:\/\/)|(^data:text\/css,)/.test(linkName)) {
				path.push(linkName);
			}
			// String pattern (convert to regex)
			else {
				const CSSFileName = new RegExp(`(^|.*[\\/])${linkName}(\\..+)?.css((\\??.+?)|\\b)$`, 'i');
				for (let i = 0, cLen = allLinks.length, styleTag; i < cLen; i++) {
					styleTag = allLinks[i].href.match(CSSFileName);
					if (styleTag) path.push(styleTag[0]);
				}
			}

			if (!path || path.length === 0) {
				throw new Error('[SUNEDITOR.constructor.iframe.fail] The suneditor CSS files installation path could not be automatically detected. Please set the option property "iframe_cssFileName" before creating editor instances.');
			}

			for (let i = 0, pLen = path.length; i < pLen; i++) {
				tagString += '<link href="' + path[i] + '" rel="stylesheet">';
			}
		}
	}

	return tagString;
}

/**
 * @description When iframe height options is "auto" return "<style>" tag that required.
 * @param {string|number} frameHeight height
 * @returns {string} "<style>...</style>"
 */
export function _setAutoHeightStyle(frameHeight) {
	return frameHeight === 'auto' ? '<style>\n/** Iframe height auto */\nbody{height: min-content; overflow: hidden;}\n</style>' : '';
}

const converter = {
	htmlToJson,
	jsonToHtml,
	htmlToEntity,
	entityToHTML,
	debounce,
	syncMaps,
	mergeMaps,
	getValues,
	camelToKebabCase,
	kebabToCamelCase,
	toFontUnit,
	nodeListToArray,
	swapKeyValue,
	createElementWhitelist,
	createElementBlacklist,
	isHexColor,
	rgb2hex,
	getWidthInPercentage,
	textToAnchor,
	spanToStyleNode,
	addUrlQuery,
	_setDefaultOptionStyle,
	_setIframeStyleLinks,
	_setAutoHeightStyle,
};

export default converter;
