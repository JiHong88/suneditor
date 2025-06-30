/**
 * @description Gets XMLHttpRequest object
 * @returns {XMLHttpRequest}
 */
export function getXMLHttpRequest(): XMLHttpRequest;
/**
 * @deprecated
 * @description Returns the CSS text that has been applied to the current page.
 * @param {Document|null} doc To get the CSS text of an document. If null get the current document.
 * @returns {string} Styles string
 */
export function getPageStyle(doc: Document | null): string;
/**
 * @deprecated
 * @description Get the the tag path of the arguments value
 * @param {Array<string>} nameArray File name array
 * @param {string} extension js, css
 * @returns {string} If not found, return the first found value
 */
export function getIncludePath(nameArray: Array<string>, extension: string): string;
/**
 * @fileoverview Environment  helper functions
 */
/** @type {Window} */
export const _w: Window;
/** @type {Document} */
export const _d: Document;
/**
 * @description No event symbol
 * @type {Symbol}
 */
export const NO_EVENT: symbol;
/**
 * @description On over component symbol
 * @type {Symbol}
 */
export const ON_OVER_COMPONENT: symbol;
/** --- Check browser --- */
/**
 * @description Check if support ResizeObserver function
 * @returns {boolean} Whether support ResizeObserver function or not.
 */
export const isResizeObserverSupported: boolean;
/**
 * @description Check if support navigator.clipboard
 * @returns {boolean} Whether support navigator.clipboard or not.
 */
export const isClipboardSupported: boolean;
/**
 * @description Check if User Agent is Edge
 * @returns {boolean} Whether User Agent is Edge or not.
 */
export const isEdge: boolean;
/**
 * @description Check if User Agent is OSX or IOS
 * @type {boolean}
 */
export const isOSX_IOS: boolean;
/**
 * @description Check if User Agent Blink engine.
 * @type {boolean}
 */
export const isBlink: boolean;
/**
 * @description Check if User Agent is Firefox (Gecko).
 * @type {boolean}
 */
export const isGecko: boolean;
/**
 * @description Check if User Agent is Chromium browser.
 * @type {boolean}
 */
export const isChromium: boolean;
/**
 * @description Check if User Agent is Safari.
 * @type {boolean}
 */
export const isSafari: boolean;
/**
 * @description Check if User Agent is Mobile device.
 * @type {boolean}
 */
export const isMobile: boolean;
/**
 * @description Check if the device is touchable.
 * @type {boolean}
 */
export const isTouchDevice: boolean;
/**
 * @description Check if User Agent is Android mobile device.
 * @type {boolean}
 */
export const isAndroid: boolean;
/**
 * @description Command(Mac) or CTRL(Window) icon.
 * @type {string}
 */
export const cmdIcon: string;
/**
 * @description SHIFT(Mac, Window) icon.
 * @type {string}
 */
export const shiftIcon: string;
/**
 * @description Device pixel ratio
 * @type {number}
 */
export const DPI: number;
/** --- editor env --- */
export const KATEX_WEBSITE: 'https://katex.org/docs/supported.html';
export const MATHJAX_WEBSITE: 'https://www.mathjax.org/';
export default env;
declare namespace env {
	export { _w };
	export { _d };
	export { NO_EVENT };
	export { ON_OVER_COMPONENT };
	export { getXMLHttpRequest };
	export { getPageStyle };
	export { getIncludePath };
	export { isResizeObserverSupported };
	export { isClipboardSupported };
	export { isEdge };
	export { isBlink };
	export { isGecko };
	export { isChromium };
	export { isSafari };
	export { isOSX_IOS };
	export { isAndroid };
	export { isMobile };
	export { isTouchDevice };
	export { cmdIcon };
	export { shiftIcon };
	export { DPI };
	export { KATEX_WEBSITE };
	export { MATHJAX_WEBSITE };
}
