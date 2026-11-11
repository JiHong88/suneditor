import type {} from '../../../typedef';
export default Finder;
/**
 * @description Find/Replace feature
 */
declare class Finder {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/**
	 * @description Whether the panel is open.
	 * @returns {boolean}
	 */
	get isOpen(): boolean;
	/**
	 * @description Opens the finder. With panel: shows UI. Without panel: activates search state only.
	 * @param {boolean} [replaceMode=true] Whether to show replace row
	 */
	open(replaceMode?: boolean): void;
	/**
	 * @description Closes the finder and clears highlights.
	 */
	close(): void;
	/**
	 * @description Navigate to next match (public for shortcut binding).
	 */
	findNext(): void;
	/**
	 * @description Navigate to previous match (public for shortcut binding).
	 */
	findPrev(): void;
	/**
	 * @description Search for a term in the editor content (headless API).
	 * @param {string} term Search term
	 * @param {Object} [options] Search options
	 * @param {boolean} [options.matchCase=false] Case-sensitive search
	 * @param {boolean} [options.wholeWord=false] Whole word search
	 * @param {boolean} [options.regex=false] Regex search
	 * @returns {number} Number of matches found
	 */
	search(
		term: string,
		{
			matchCase,
			wholeWord,
			regex,
		}?: {
			matchCase?: boolean;
			wholeWord?: boolean;
			regex?: boolean;
		},
	): number;
	/**
	 * @description Replace the current match (headless API).
	 * @param {string} replaceText Replacement text
	 */
	replace(replaceText: string): void;
	/**
	 * @description Replace all matches (headless API).
	 * @param {string} replaceText Replacement text
	 */
	replaceAll(replaceText: string): void;
	/**
	 * @description Current match count and index.
	 * @returns {{ current: number, total: number }}
	 */
	get matchInfo(): {
		current: number;
		total: number;
	};
	/**
	 * @description Re-run search with current term (debounced 300ms). Called on wysiwyg content change.
	 */
	refresh(): void;
	/** @internal */
	_destroy(): void;
	#private;
}
