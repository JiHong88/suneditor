/**
 * @fileoverview Environment  helper functions
 */

/** @type {Window} */
export const _w = window;
/** @type {Document} */
export const _d = document;

/**
 * @description No event symbol
 * @type {Symbol}
 */
export const NO_EVENT = Symbol('noEventHandler');

/**
 * @description On over component symbol
 * @type {Symbol}
 */
export const ON_OVER_COMPONENT = Symbol('onOverComponent');

const userAgent = navigator.userAgent.toLowerCase();

/**
 * @description Gets XMLHttpRequest object
 * @returns {XMLHttpRequest}
 */
export function getXMLHttpRequest() {
	return new XMLHttpRequest();
}

/**
 * @deprecated
 * @description Returns the CSS text that has been applied to the current page.
 * @param {?Document} doc To get the CSS text of an document. If null get the current document.
 * @returns {string} Styles string
 */
export function getPageStyle(doc) {
	let cssText = '';
	const sheets = (doc || _d).styleSheets;

	for (let i = 0, len = sheets.length, rules; i < len; i++) {
		try {
			rules = sheets[i].cssRules;
		} catch {
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
 * @param {Array<string>} nameArray File name array
 * @param {string} extension js, css
 * @returns {string} If not found, return the first found value
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
		path = false === path.includes('/') ? location.href.match(/^.*?:\/\/[^/]*/)[0] + path : location.href.match(/^[^?]*\/(?:)/)[0] + path;
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
export const isResizeObserverSupported = (() => {
	return typeof ResizeObserver === 'function';
})();

/**
 * @description Check if support navigator.clipboard
 * @returns {boolean} Whether support navigator.clipboard or not.
 */
export const isClipboardSupported = (() => {
	return typeof navigator.clipboard?.write === 'function';
})();

/**
 * @description Check if User Agent is Edge
 * @returns {boolean} Whether User Agent is Edge or not.
 */
export const isEdge = (() => {
	return /Edg/.test(navigator.userAgent);
})();

/**
 * @description Check if User Agent is OSX or IOS
 * @type {boolean}
 */
export const isOSX_IOS = (() => {
	return /(Mac|iPhone|iPod|iPad)/.test(navigator.userAgent);
})();

/**
 * @description Check if User Agent Blink engine.
 * @type {boolean}
 */
export const isBlink = (() => {
	return userAgent.includes('chrome/') && !userAgent.includes('edge/');
})();

/**
 * @description Check if User Agent is Firefox (Gecko).
 * @type {boolean}
 */
export const isGecko = (() => {
	return !!userAgent.match(/gecko\/\d+/);
})();

/**
 * @description Check if User Agent is Chromium browser.
 * @type {boolean}
 */
export const isChromium = (() => {
	return !!(/** @type {Window & { chrome: any }} */ (_w).chrome);
})();

/**
 * @description Check if User Agent is Safari.
 * @type {boolean}
 */
export const isSafari = (() => {
	return userAgent.includes('applewebkit/') && !userAgent.includes('chrome');
})();

/**
 * @description Check if User Agent is Mobile device.
 * @type {boolean}
 */
export const isMobile = (() => {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
})();

/**
 * @description Check if the device is touchable.
 * @type {boolean}
 */
export const isTouchDevice = (() => {
	return navigator.maxTouchPoints > 0 && 'ontouchstart' in _w;
})();

/**
 * @description Check if User Agent is Android mobile device.
 * @type {boolean}
 */
export const isAndroid = (() => {
	return userAgent.includes('android');
})();

/**
 * @description Command(Mac) or CTRL(Window) icon.
 * @type {string}
 */
export const cmdIcon = isOSX_IOS ? '⌘' : 'CTRL';

/**
 * @description SHIFT(Mac, Window) icon.
 * @type {string}
 */
export const shiftIcon = isOSX_IOS ? '⇧' : '+SHIFT';

/**
 * @description Device pixel ratio
 * @type {number}
 */
export const DPI = _w.devicePixelRatio;

/** --- editor env --- */
export const KATEX_WEBSITE = 'https://katex.org/docs/supported.html';
export const MATHJAX_WEBSITE = 'https://www.mathjax.org/';

const env = {
	_w,
	_d,
	NO_EVENT,
	ON_OVER_COMPONENT,
	getXMLHttpRequest,
	getPageStyle,
	getIncludePath,
	isResizeObserverSupported,
	isClipboardSupported,
	isEdge,
	isBlink,
	isGecko,
	isChromium,
	isSafari,
	isOSX_IOS,
	isAndroid,
	isMobile,
	isTouchDevice,
	cmdIcon,
	shiftIcon,
	DPI,
	KATEX_WEBSITE,
	MATHJAX_WEBSITE,
};

export default env;
