class env {
  /**
	 * Checks if User Agent is IE
	 * @returns
	 */
	isIE(): boolean;

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