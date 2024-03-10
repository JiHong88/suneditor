export const _w = window;
export const _d = document;

export const NO_EVENT = Symbol('noEventHandler');
export const ON_OVER_COMPONENT = Symbol('onOverComponent');

const userAgent = _w.navigator.userAgent.toLowerCase();

/**
 * @description Object.values
 * @param {Object.<any>} obj Object parameter.
 * @returns {Array.<any>}
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
	return new _w.XMLHttpRequest();
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

	const regExp = new RegExp(`(^|.*[\\/])${fileName}(\\.[^\\/]+)?.${extension}(?:\\?.*|;.*)?$`, 'i');
	const extRegExp = new RegExp(`.+\\.${extension}(?:\\?.*|;.*)?$`, 'i');

	for (let c = _d.getElementsByTagName(tagName), i = 0; i < c.length; i++) {
		if (extRegExp.test(c[i][src])) {
			pathList.push(c[i]);
		}
	}

	for (let i = 0; i < pathList.length; i++) {
		const editorTag = pathList[i][src].match(regExp);
		if (editorTag) {
			path = editorTag[0];
			break;
		}
	}

	if (path === '') path = pathList.length > 0 ? pathList[0][src] : '';

	if (!path.includes(':/') && '//' !== path.slice(0, 2)) {
		path = 0 === path.includes('/') ? location.href.match(/^.*?:\/\/[^/]*/)[0] + path : location.href.match(/^[^?]*\/(?:)/)[0] + path;
	}

	if (!path) {
		throw '[SUNEDITOR.helper.env.getIncludePath.fail] The SUNEDITOR installation path could not be automatically detected. (path: +' + path + ', extension: ' + extension + ')';
	}

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
 * @description Check if User Agent is Edge
 * @returns {boolean} Whether User Agent is Edge or not.
 */
function isEdge() {
	return navigator.appVersion.includes('Edge');
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
	return userAgent.includes('chrome/') && !userAgent.includes('edge/');
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
	return userAgent.includes('applewebkit/') && !userAgent.includes('chrome');
}

/**
 * @description Check if User Agent is Mobile device.
 * @returns {boolean} Whether User Agent is Mobile or not.
 */
function isMobile() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

/**
 * @description Check if User Agent is Android mobile device.
 * @returns {boolean} Whether User Agent is Android or not.
 */
function isAndroid() {
	return userAgent.includes('android');
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
	_w,
	_d,
	NO_EVENT,
	ON_OVER_COMPONENT,
	getValues,
	camelToKebabCase,
	kebabToCamelCase,
	getXMLHttpRequest,
	getPageStyle,
	getIncludePath,
	isResizeObserverSupported: isResizeObserverSupported(),
	isEdge: isEdge(),
	isBlink: isBlink(),
	isGecko: isGecko(),
	isChromium: isChromium(),
	isSafari: isSafari(),
	isOSX_IOS: isOSX_IOS(),
	isAndroid: isAndroid(),
	isMobile: isMobile(),
	cmdIcon,
	shiftIcon,
	_allowedEmptyNodeList
};

export default env;
