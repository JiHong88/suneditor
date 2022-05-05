import {
	_d,
	_w
} from "./global";

/**
 * @description Convert HTML string to HTML Entity
 * @param {string} content
 * @returns {string} Content string
 * @private
 */
export function htmlToEntity(content) {
	const ec = {
		"&": "&amp;",
		"\u00A0": "&nbsp;",
		"'": "&apos;",
		'"': "&quot;",
		"<": "&lt;",
		">": "&gt;"
	};
	return content.replace(/&|\u00A0|'|"|<|>/g, function (m) {
		return typeof ec[m] === "string" ? ec[m] : m;
	});
}

/**
 * @description Convert HTML Entity to HTML string
 * @param {string} content Content string
 * @returns {string}
 */
export function entityToHTML(content) {
	const ec = {
		"&amp;": "&",
		"&nbsp;": "\u00A0",
		"&apos;": "'",
		"&quot;": '"',
		"&lt;": "<",
		"&gt;": ">"
	};
	return content.replace(/\&amp;|\&nbsp;|\&apos;|\&quot;|\$lt;|\$gt;/g, function (m) {
		return typeof ec[m] === "string" ? ec[m] : m;
	});
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
 * @param {Object.<string, any>} options Options
 * @param {string} defaultStyle Style string
 * @returns {{top: string, frame: string, editor: string}}
 * @private
 */
export function _setDefaultOptionStyle(options, defaultStyle) {
	let optionStyle = "";
	if (options.height) optionStyle += "height:" + options.height + ";";
	if (options.minHeight) optionStyle += "min-height:" + options.minHeight + ";";
	if (options.maxHeight) optionStyle += "max-height:" + options.maxHeight + ";";
	if (options.position) optionStyle += "position:" + options.position + ";";
	if (options.width) optionStyle += "width:" + options.width + ";";
	if (options.minWidth) optionStyle += "min-width:" + options.minWidth + ";";
	if (options.maxWidth) optionStyle += "max-width:" + options.maxWidth + ";";

	let top = "",
		frame = "",
		editor = "";
	defaultStyle = optionStyle + defaultStyle;
	const styleArr = defaultStyle.split(";");
	for (let i = 0, len = styleArr.length, s; i < len; i++) {
		s = styleArr[i].trim();
		if (!s) continue;
		if (/^(min-|max-)?width\s*:/.test(s) || /^(z-index|position)\s*:/.test(s)) {
			top += s + ";";
			continue;
		}
		if (/^(min-|max-)?height\s*:/.test(s)) {
			if (/^height/.test(s) && s.split(":")[1].trim() === "auto") {
				options.height = "auto";
			}
			frame += s + ";";
			continue;
		}
		editor += s + ";";
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
 * @param {Object.<string, any>} options Options
 * @private
 */
export function _setIframeDocument(frame, options) {
	frame.setAttribute("scrolling", "auto");
	frame.contentDocument.head.innerHTML =
		"" +
		'<meta charset="utf-8" />' +
		'<meta name="viewport" content="width=device-width, initial-scale=1">' +
		_setIframeCssTags(options);
	frame.contentDocument.body.className = options._editableClass;
	frame.contentDocument.body.setAttribute("contenteditable", true);
}

/**
 * @description Set default style tag of the iframe
 * @param {Object.<string, any>} options Options
 * @returns {string} "<style>...</style>"
 */
export function _setIframeCssTags(options) {
	const linkNames = options.iframeCSSFileName;
	const wRegExp = _w.RegExp;
	let tagString = "";

	for (let f = 0, len = linkNames.length, path; f < len; f++) {
		path = [];

		if (/(^https?:\/\/)|(^data:text\/css,)/.test(linkNames[f])) {
			path.push(linkNames[f]);
		} else {
			const CSSFileName = new wRegExp("(^|.*[\\/])" + linkNames[f] + "(\\..+)?\\.css(?:\\?.*|;.*)?$", "i");
			for (let c = _d.getElementsByTagName("link"), i = 0, len = c.length, styleTag; i < len; i++) {
				styleTag = c[i].href.match(CSSFileName);
				if (styleTag) path.push(styleTag[0]);
			}
		}

		if (!path || path.length === 0)
			throw '[SUNEDITOR.constructor.iframe.fail] The suneditor CSS files installation path could not be automatically detected. Please set the option property "iframeCSSFileName" before creating editor instances.';

		for (let i = 0, len = path.length; i < len; i++) {
			tagString += '<link href="' + path[i] + '" rel="stylesheet">';
		}
	}

	return (
		tagString +
		(options.height === "auto" ?
			"<style>\n/** Iframe height auto */\nbody{height: min-content; overflow: hidden;}\n</style>" :
			"")
	);
}

const converter = {
	htmlToEntity: htmlToEntity,
	entityToHTML: entityToHTML,
	createElementWhitelist: createElementWhitelist,
	createElementBlacklist: createElementBlacklist,
	_setDefaultOptionStyle: _setDefaultOptionStyle,
	_setIframeDocument: _setIframeDocument,
	_setIframeCssTags: _setIframeCssTags
};

export default converter;