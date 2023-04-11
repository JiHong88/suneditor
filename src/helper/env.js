export const _w = window;
export const _d = document;

const userAgent = _w.navigator.userAgent.toLowerCase();

/**
 * @description Object.values
 * @param {Object.<any>} obj Object parameter.
 * @returns {Array.<any>}
 */
export function getValues(obj) {
	return !obj ? [] :
		this._w.Object.keys(obj).map(function (i) {
			return obj[i];
		});
}

/**
 * @description Convert the CamelCase To the KebabCase.
 * @param {string|Array.<string>} param [Camel string]
 */
export function camelToKebabCase(param) {
	if (typeof param === 'string') {
		return param.replace(/[A-Z]/g, function (letter) {
			return '-' + letter.toLowerCase();
		});
	} else {
		return param.map(function (str) {
			return camelToKebabCase(str);
		});
	}
}

/**
 * @description Convert the KebabCase To the CamelCase.
 * @param {String|Array} param [KebabCase string]
 * @returns {String|Array}
 */
export function kebabToCamelCase(param) {
	if (typeof param === 'string') {
		return param.replace(/-[a-zA-Z]/g, function (letter) {
			return letter.replace('-', '').toUpperCase();
		});
	} else {
		return param.map(function (str) {
			return camelToKebabCase(str);
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
			return new _w.ActiveXObject('Msxml2.XMLHTTP');
		} catch (e) {
			try {
				return new _w.ActiveXObject('Microsoft.XMLHTTP');
			} catch (e1) {
				return null;
			}
		}
	} else if (_w.XMLHttpRequest) {
		/** netscape */
		return new _w.XMLHttpRequest();
	} else {
		/** fail */
		return null;
	}
}

/**
 * @deprecated
 * @description Returns the CSS text that has been applied to the current page.
 * @param {Document|null} doc To get the CSS text of an document. If null get the current document.
 * @returns {string} Styles string
 */
export function getPageStyle(doc) {
	let cssText = '';
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
	let path = '';
	const pathList = [];
	const tagName = extension === 'js' ? 'script' : 'link';
	const src = extension === 'js' ? 'src' : 'href';

	let fileName = '(?:';
	for (let i = 0, len = nameArray.length; i < len; i++) {
		fileName += nameArray[i] + (i < len - 1 ? '|' : ')');
	}

	const regExp = new _w.RegExp('(^|.*[\\/])' + fileName + '(\\.[^\\/]+)?.' + extension + '(?:\\?.*|;.*)?$', 'i');
	const extRegExp = new _w.RegExp('.+\\.' + extension + '(?:\\?.*|;.*)?$', 'i');

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

	if (path === '') path = pathList.length > 0 ? pathList[0][src] : '';

	path.indexOf(':/') < 0 && '//' !== path.slice(0, 2) && (path = 0 === path.indexOf('/') ? location.href.match(/^.*?:\/\/[^\/]*/)[0] + path : location.href.match(/^[^\?]*\/(?:)/)[0] + path);

	if (!path) throw '[SUNEDITOR.helper.env.getIncludePath.fail] The SUNEDITOR installation path could not be automatically detected. (name: +' + name + ', extension: ' + extension + ')';

	return path;
}

/** --- Check browser --- */
/**
 * @description Check if support ResizeObserver function
 * @returns {boolean} Whether support ResizeObserver function or not.
 */
function isResizeObserverSupported() {
	return typeof _w.ResizeObserver === 'function';
}

/**
 * @description Check if User Agent is IE
 * @returns {boolean} Whether User Agent is IE or not.
 */
function isIE() {
	return userAgent.indexOf('trident') > -1;
}

/**
 * @description Check if User Agent is Edge
 * @returns {boolean} Whether User Agent is Edge or not.
 */
function isEdge() {
	return navigator.appVersion.indexOf('Edge') > -1;
}

/**
 * @description Check if platform is OSX or IOS
 * @returns {boolean} Whether platform is (OSX || IOS) or not.
 */
function isOSX_IOS() {
	return /(Mac|iPhone|iPod|iPad)/.test(navigator.platform);
}

/**
 * @description Check if User Agent Blink engine.
 * @returns {boolean} Whether User Agent is Blink engine or not.
 */
function isBlink() {
	return userAgent.indexOf('chrome/') > -1 && userAgent.indexOf('edge/') < 0;
}

/**
 * @description Check if User Agent is Firefox (Gecko).
 * @returns {boolean} Whether User Agent is Firefox or not.
 */
function isGecko() {
	return !!userAgent.match(/gecko\/\d+/);
}

/**
 * @description Check if User Agent is Chromium browser.
 * @returns {boolean} Whether User Agent is Chromium browser.
 */
function isChromium() {
	return !!window.chrome;
}

/**
 * @description Check if User Agent is Safari.
 * @returns {boolean} Whether User Agent is Safari or not.
 */
function isSafari() {
	return userAgent.indexOf('applewebkit/') > -1 && userAgent.indexOf('chrome') === -1;
}

/**
 * @description Check if User Agent is Android mobile device.
 * @returns {boolean} Whether User Agent is Android or not.
 */
function isAndroid() {
	return userAgent.indexOf('android') > -1;
}

/**
 * @description Command(Mac) or CTRL(Window) icon.
 */
export const cmdIcon = isOSX_IOS() ? '⌘' : 'CTRL';

/**
 * @description SHIFT(Mac, Window) icon.
 */
export const shiftIcon = isOSX_IOS() ? '⇧' : '+SHIFT';

/** --- editor env --- */
export const _allowedEmptyNodeList = '.se-component, pre, blockquote, hr, li, table, img, iframe, video, audio, canvas, details';
export const KATEX_WEBSITE = 'https://katex.org/docs/supported.html';

const env = {
	_w: _w,
	_d: _d,
	getValues: getValues,
	camelToKebabCase: camelToKebabCase,
	kebabToCamelCase: kebabToCamelCase,
	getXMLHttpRequest: getXMLHttpRequest,
	getPageStyle: getPageStyle,
	getIncludePath: getIncludePath,
	isResizeObserverSupported: isResizeObserverSupported(),
	isIE: isIE(),
	isEdge: isEdge(),
	isBlink: isBlink(),
	isGecko: isGecko(),
	isChromium: isChromium(),
	isSafari: isSafari(),
	isOSX_IOS: isOSX_IOS(),
	isAndroid: isAndroid(),
	cmdIcon: cmdIcon,
	shiftIcon: shiftIcon,
	_allowedEmptyNodeList: _allowedEmptyNodeList
};

export default env;