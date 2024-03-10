class env {
	_w: Window;
	_d: Document;

	/**
	 * @description Gets XMLHttpRequest object
	 * @returns
	 */
	getXMLHttpRequest(): XMLHttpRequest | ActiveXObject;

	/**
	 * @description Returns the CSS text that has been applied to the current page.
	 * @param doc To get the CSS text of an document(core._wd). If null get the current document.
	 * @returns Styles string
	 */
	getPageStyle(doc?: Document): string;

	/**
	 * @description Get the the tag path of the arguments value
	 * If not found, return the first found value
	 * @param nameArray File name array
	 * @param extension js, css
	 * @returns
	 */
	getIncludePath(nameArray: string[], extension: string): string;

	/**
	 * Checks if User Agent is Edge
	 * @returns
	 */
	isEdge(): boolean;

	/**
	 * Checks if platform is OSX or IOS
	 * @returns
	 */
	isOSX_IOS(): boolean;

	/**
	 * Checks if User Agent Blink engine.
	 * @returns
	 */
	isBlink(): boolean;

	/**
	 * Checks if User Agent is Firefox (Gecko).
	 * @returns
	 */
	isGecko(): boolean;

	/**
	 * Checks if User Agent is Chromium browser.
	 * @returns
	 */
	isChromium(): boolean;

	/**
	 * Checks if User Agent is Safari.
	 * @returns
	 */
	isSafari(): boolean;

	/**
	 * Checks if User Agent is Android mobile device.
	 * @returns
	 */
	isAndroid(): boolean;
}

export default env;
