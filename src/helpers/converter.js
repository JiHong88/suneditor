/**
 * @description Convert HTML string to HTML Entity
 * @param {String} contents
 * @returns {String} Contents string
 * @private
 */
export function htmlToEntity(contents) {
	const ec = {
		"&": "&amp;",
		"\u00A0": "&nbsp;",
		"'": "&apos;",
		'"': "&quot;",
		"<": "&lt;",
		">": "&gt;"
	};
	return contents.replace(/&|\u00A0|'|"|<|>/g, function (m) {
		return typeof ec[m] === "string" ? ec[m] : m;
	});
}

/**
 * @description Convert HTML Entity to HTML string
 * @param {String} contents Contents string
 * @returns {String}
 */
export function entityToHTML(contents) {
	const ec = {
		"&amp;": "&",
		"&nbsp;": "\u00A0",
		"&apos;": "'",
		"&quot;": '"',
		"&lt;": "<",
		"&gt;": ">"
	};
	return contents.replace(/\&amp;|\&nbsp;|\&apos;|\&quot;|\$lt;|\$gt;/g, function (m) {
		return typeof ec[m] === "string" ? ec[m] : m;
	});
}

/**
 * @description Create whitelist RegExp object.
 * Return RegExp format: new RegExp("<\\/?\\b(?!" + list + ")\\b[^>^<]*+>", "gi")
 * @param {String} list Tags list ("br|p|div|pre...")
 * @returns {RegExp}
 */
export function createTagsWhitelist(list) {
	return new RegExp("<\\/?\\b(?!\\b" + list.replace(/\|/g, "\\b|\\b") + "\\b)[^>]*>", "gi");
}

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

export function _setIframeDocument(frame, options) {
	frame.setAttribute("scrolling", "auto");
	frame.contentDocument.head.innerHTML =
		"" +
		'<meta charset="utf-8" />' +
		'<meta name="viewport" content="width=device-width, initial-scale=1">' +
		__setIframeCssTags(options);
	frame.contentDocument.body.className = options._editableClass;
	frame.contentDocument.body.setAttribute("contenteditable", true);
}

function __setIframeCssTags(options) {
	const linkNames = options.iframeCSSFileName;
	const wRegExp = this._w.RegExp;
	let tagString = "";

	for (let f = 0, len = linkNames.length, path; f < len; f++) {
		path = [];

		if (/(^https?:\/\/)|(^data:text\/css,)/.test(linkNames[f])) {
			path.push(linkNames[f]);
		} else {
			const CSSFileName = new wRegExp("(^|.*[\\/])" + linkNames[f] + "(\\..+)?\\.css(?:\\?.*|;.*)?$", "i");
			for (let c = document.getElementsByTagName("link"), i = 0, len = c.length, styleTag; i < len; i++) {
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
	createTagsWhitelist: createTagsWhitelist,
	_setDefaultOptionStyle: _setDefaultOptionStyle,
	_setIframeDocument: _setIframeDocument
};

export default converter;