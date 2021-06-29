export const _w = window;
export const _d = document;

/**
 * @description Gets XMLHttpRequest object
 * @returns {XMLHttpRequest|ActiveXObject}
 */
export function getXMLHttpRequest() {
	/** IE */
	if (this._w.ActiveXObject) {
		try {
			return new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				return new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e1) {
				return null;
			}
		}
	} else if (this._w.XMLHttpRequest) {
		/** netscape */
		return new XMLHttpRequest();
	} else {
		/** fail */
		return null;
	}
}

/**
 * @deprecated
 * @description Returns the CSS text that has been applied to the current page.
 * @param {Document|null} doc To get the CSS text of an document(core._wd). If null get the current document.
 * @returns {String} Styles string
 */
export function getPageStyle(doc) {
	let cssText = "";
	const sheets = (doc || this._d).styleSheets;

	for (let i = 0, len = sheets.length, rules; i < len; i++) {
		try {
			rules = sheets[i].cssRules;
		} catch (e) {
			continue;
		}

		if (rules) {
			for (let c = 0, cLen = rules.length; c < cLen; c++) {
				cssText += rules[c].cssText;
			}
		}
	}

	return cssText;
}

/**
 * @deprecated
 * @description Get the the tag path of the arguments value
 * If not found, return the first found value
 * @param {Array} nameArray File name array
 * @param {String} extension js, css
 * @returns {String}
 */
export function getIncludePath(nameArray, extension) {
	let path = "";
	const pathList = [];
	const tagName = extension === "js" ? "script" : "link";
	const src = extension === "js" ? "src" : "href";

	let fileName = "(?:";
	for (let i = 0, len = nameArray.length; i < len; i++) {
		fileName += nameArray[i] + (i < len - 1 ? "|" : ")");
	}

	const regExp = new this._w.RegExp(
		"(^|.*[\\/])" + fileName + "(\\.[^\\/]+)?." + extension + "(?:\\?.*|;.*)?$",
		"i"
	);
	const extRegExp = new this._w.RegExp(".+\\." + extension + "(?:\\?.*|;.*)?$", "i");

	for (let c = this._d.getElementsByTagName(tagName), i = 0; i < c.length; i++) {
		if (extRegExp.test(c[i][src])) {
			pathList.push(c[i]);
		}
	}

	for (let i = 0; i < pathList.length; i++) {
		let editorTag = pathList[i][src].match(regExp);
		if (editorTag) {
			path = editorTag[0];
			break;
		}
	}

	if (path === "") path = pathList.length > 0 ? pathList[0][src] : "";

	-
	1 === path.indexOf(":/") &&
		"//" !== path.slice(0, 2) &&
		(path =
			0 === path.indexOf("/") ?
			location.href.match(/^.*?:\/\/[^\/]*/)[0] + path :
			location.href.match(/^[^\?]*\/(?:)/)[0] + path);

	if (!path)
		throw (
			"[SUNEDITOR.util.getIncludePath.fail] The SUNEDITOR installation path could not be automatically detected. (name: +" +
			name +
			", extension: " +
			extension +
			")"
		);

	return path;
}

const global = {
	_w: _w,
	_d: _d,
	getXMLHttpRequest: getXMLHttpRequest,
	getPageStyle: getPageStyle,
	getIncludePath: getIncludePath
};

export default global;