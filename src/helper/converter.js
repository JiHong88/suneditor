import { _d, _w } from './env';

const FONT_VALUES_MAP = {
	'xx-small': 1,
	'x-small': 2,
	'small': 3,
	'medium': 4,
	'large': 5,
	'x-large': 6,
	'xx-large': 7
};

/**
 * @description Convert HTML string to HTML Entity
 * @param {string} content
 * @returns {string} Content string
 * @private
 */
export function htmlToEntity(content) {
	const ec = {
		'&': '&amp;',
		'\u00A0': '&nbsp;',
		"'": '&apos;',
		'"': '&quot;',
		'<': '&lt;',
		'>': '&gt;'
	};
	return content.replace(/&|\u00A0|'|"|<|>/g, function (m) {
		return typeof ec[m] === 'string' ? ec[m] : m;
	});
}

/**
 * @description Convert HTML Entity to HTML string
 * @param {string} content Content string
 * @returns {string}
 */
export function entityToHTML(content) {
	const ec = {
		'&amp;': '&',
		'&nbsp;': '\u00A0',
		'&apos;': "'",
		'&quot;': '"',
		'&lt;': '<',
		'&gt;': '>'
	};
	return content.replace(/\&amp;|\&nbsp;|\&apos;|\&quot;|\$lt;|\$gt;/g, function (m) {
		return typeof ec[m] === 'string' ? ec[m] : m;
	});
}

/**
 * 
 * @param {"em"|"rem"|"%"|"pt"|"px"} to Size units to be converted
 * @param {string} size siSize to convert with units (ex: "15rem")
 * @returns {string}
 */
export function fontSize(to, size) {
	const math = _w.Math;
	const value = size.match(/(\d+(?:\.\d+)?)(.+)/);
	const sizeNum = value ? value[1] * 1 : FONT_VALUES_MAP[size];
	const from = value ? value[2] : 'rem';
	let pxSize = sizeNum;

	if (/em/.test(from)) {
		pxSize = math.round(sizeNum / 0.0625);
	} else if (from === 'pt') {
		pxSize = math.round(sizeNum * 1.333);
	} else if (from === '%') {
		pxSize = sizeNum / 100;
	}

	switch (to) {
		case 'em':
		case 'rem':
		case '%':
			return (pxSize * 0.0625).toFixed(2) + to;
		case 'pt':
			return math.floor(pxSize / 1.333) + to;
		default:
			// px
			return pxSize + to;
	}
}

/**
 * @description Convert the node list to an array. If not, returns an empty array.
 * @param {NodeList|null} nodeList 
 * @returns Array
 */
export function nodeListToArray(nodeList) {
	if (!nodeList) return [];
	return _w.Array.prototype.slice.call(nodeList);
}

/**
 * @description Create whitelist RegExp object.
 * Return RegExp format: new RegExp("<\\/?\\b(?!" + list + ")\\b[^>^<]*+>", "gi")
 * @param {string} list Tags list ("br|p|div|pre...")
 * @returns {RegExp}
 */
export function createElementWhitelist(list) {
	return new RegExp('<\\/?\\b(?!\\b' + (list || '').replace(/\|/g, '\\b|\\b') + '\\b)[^>]*>', 'gi');
}

/**
 * @description Create blacklist RegExp object.
 * Return RegExp format: new RegExp("<\\/?\\b(?:" + list + ")\\b[^>^<]*+>", "gi")
 * @param {string} list Tags list ("br|p|div|pre...")
 * @returns {RegExp}
 */
export function createElementBlacklist(list) {
	return new RegExp('<\\/?\\b(?:\\b' + (list || '^').replace(/\|/g, '\\b|\\b') + '\\b)[^>]*>', 'gi');
}

/**
 * @description Converts options-related styles and returns them for each frame.
 * @param {Object.<string, any>} fo frameOptions
 * @param {string} cssText Style string
 * @returns {{top: string, frame: string, editor: string}}
 * @private
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
		editor: editor
	};
}

/**
 * @description Set default attribute of the iframe
 * @param {HTMLIFrameElement} frame iframe
 * @param {Object.<string, any>} originOptions Options
 * @private
 */
export function _setIframeDocument(frame, originOptions, frameHeight) {
	frame.setAttribute('scrolling', 'auto');
	frame.contentDocument.head.innerHTML = '<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">' + _setIframeCssTags(originOptions.get('iframe_cssFileName'), frameHeight);
	frame.contentDocument.body.className = originOptions.get('_editableClass');
	frame.contentDocument.body.setAttribute('contenteditable', true);
}

/**
 * @description Set default style tag of the iframe
 * @param {Object.<string, any>} options Options
 * @returns {string} "<style>...</style>"
 */
export function _setIframeCssTags(linkNames, frameHeight) {
	const wRegExp = _w.RegExp;
	let tagString = '';

	if (linkNames) {
		for (let f = 0, len = linkNames.length, path; f < len; f++) {
			path = [];
	
			if (/(^https?:\/\/)|(^data:text\/css,)/.test(linkNames[f])) {
				path.push(linkNames[f]);
			} else {
				const CSSFileName = new wRegExp('(^|.*[\\/])' + linkNames[f] + '(\\..+)?\\.css(?:\\?.*|;.*)?$', 'i');
				for (let c = _d.getElementsByTagName('link'), i = 0, len = c.length, styleTag; i < len; i++) {
					styleTag = c[i].href.match(CSSFileName);
					if (styleTag) path.push(styleTag[0]);
				}
			}
	
			if (!path || path.length === 0) throw '[SUNEDITOR.constructor.iframe.fail] The suneditor CSS files installation path could not be automatically detected. Please set the option property "iframe_cssFileName" before creating editor instances.';
	
			for (let i = 0, len = path.length; i < len; i++) {
				tagString += '<link href="' + path[i] + '" rel="stylesheet">';
			}
		}
	}

	return tagString + (frameHeight === 'auto' ? '<style>\n/** Iframe height auto */\nbody{height: min-content; overflow: hidden;}\n</style>' : '');
}

const converter = {
	htmlToEntity: htmlToEntity,
	entityToHTML: entityToHTML,
	fontSize: fontSize,
	nodeListToArray: nodeListToArray,
	createElementWhitelist: createElementWhitelist,
	createElementBlacklist: createElementBlacklist,
	_setDefaultOptionStyle: _setDefaultOptionStyle,
	_setIframeDocument: _setIframeDocument,
	_setIframeCssTags: _setIframeCssTags
};

export default converter;
