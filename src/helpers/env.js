const userAgent = navigator.userAgent.toLowerCase();

/**
 * Checks if User Agent is IE
 * @returns {Boolean} Whether User Agent is IE or not.
 */
export function isIE() {
	return userAgent.indexOf("trident") > -1;
}

/**
 * Checks if User Agent is Edge
 * @returns {Boolean} Whether User Agent is Edge or not.
 */
export function isEdge() {
	return navigator.appVersion.indexOf("Edge") > -1;
}

/**
 * Checks if platform is OSX or IOS
 * @returns {Boolean} Whether platform is (OSX || IOS) or not.
 */
export function isOSX_IOS() {
	return /(Mac|iPhone|iPod|iPad)/.test(navigator.platform);
}

/**
 * Checks if User Agent Blink engine.
 * @returns {Boolean} Whether User Agent is Blink engine or not.
 */
export function isBlink() {
	return userAgent.indexOf("chrome/") > -1 && userAgent.indexOf("edge/") < 0;
}

/**
 * Checks if User Agent is Firefox (Gecko).
 * @returns {Boolean} Whether User Agent is Firefox or not.
 */
export function isGecko() {
	return !!userAgent.match(/gecko\/\d+/);
}

/**
 * Checks if User Agent is Safari.
 * @returns {Boolean} Whether User Agent is Safari or not.
 */
export function isSafari() {
	return userAgent.indexOf(" applewebkit/") > -1 && userAgent.indexOf("chrome") === -1;
}

/**
 * Checks if User Agent is Android mobile device.
 * @returns {Boolean} Whether User Agent is Android or not.
 */
export function isAndroid() {
	return userAgent.indexOf("android") > -1;
}

export const _allowedEmptyNodeList = '.se-component, pre, blockquote, hr, li, table, img, iframe, video, audio, canvas, details';

const env = {
	isIE: isIE(),
	isEdge: isEdge(),
	isBlink: isBlink(),
	isGecko: isGecko(),
	isSafari: isSafari(),
	isOSX_IOS: isOSX_IOS(),
	isAndroid: isAndroid(),
	_allowedEmptyNodeList: _allowedEmptyNodeList
};

export default env;
