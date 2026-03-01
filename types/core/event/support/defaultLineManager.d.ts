import type {} from '../../../typedef';
/**
 * @description Service responsible for `line` breaking and default `line` creation logic.
 * - Handles the `Enter` key behavior (`P` vs `BR` vs `DIV`).
 * - Manages the initial `line` creation when the editor is empty.
 */
export default class DefaultLineManager {
	/**
	 * @constructor
	 * @param {import('../eventOrchestrator').default} inst
	 */
	constructor({ $ }: import('../eventOrchestrator').default);
	/**
	 * @description Executes the default `line` creation logic.
	 * - If no `formatName` is provided, it uses the `defaultLine` option (usually `P`).
	 * - Handles creating a new `block` element when the user presses `Enter` or when initializing.
	 * @param {string} [formatName] The tag name to be used for the new `line` (e.g., `P`, `DIV`, `BR`).
	 * @returns {?void}
	 */
	execute(formatName?: string): void | null;
	#private;
}
