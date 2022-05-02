export const _w = window;
export const _d = document;

/**
 * @description Object.values
 * @param {Object.<any>} obj Object parameter.
 * @returns {Array.<any>}
 */
export function getValues(obj) {
	return !obj ? [] : this._w.Object.keys(obj).map(function (i) {
		return obj[i];
	});
}

/**
 * @description Convert the CamelCase To the KebabCase.
 * @param {string|Array.<string>} param [Camel string]
 */
export function camelToKebabCase(param) {
	if (typeof param === "string") {
		return param.replace(/[A-Z]/g, function (letter) {
			return "-" + letter.toLowerCase();
		});
	} else {
		return param.map(function (str) {
			return util.camelToKebabCase(str);
		});
	}
}

/**
 * @description Gets XMLHttpRequest object
 * @returns {XMLHttpRequest|ActiveXObject}
 */
export function getXMLHttpRequest() {
	/** IE */
	if (_w.ActiveXObject) {
		try {
			return new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				return new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e1) {
				return null;
			}
		}
	} else if (_w.XMLHttpRequest) {
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
 * @returns {string} Styles string
 */
export function getPageStyle(doc) {
	let cssText = "";
	const sheets = (doc || _d).styleSheets;

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
 * @param {Array.<string>} nameArray File name array
 * @param {string} extension js, css
 * @returns {string}
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

	const regExp = new _w.RegExp(
		"(^|.*[\\/])" + fileName + "(\\.[^\\/]+)?." + extension + "(?:\\?.*|;.*)?$",
		"i"
	);
	const extRegExp = new _w.RegExp(".+\\." + extension + "(?:\\?.*|;.*)?$", "i");

	for (let c = _d.getElementsByTagName(tagName), i = 0; i < c.length; i++) {
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
	getValues: getValues,
	camelToKebabCase: camelToKebabCase,
	getXMLHttpRequest: getXMLHttpRequest,
	getPageStyle: getPageStyle,
	getIncludePath: getIncludePath
};

export default global;