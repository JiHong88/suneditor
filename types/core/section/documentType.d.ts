import type {} from '../../typedef';
export default DocumentType;
/**
 * @description DocumentType, page, header management class
 */
declare class DocumentType extends CoreInjector {
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {SunEditor.FrameContext} fc - frame context object
	 */
	constructor(editor: SunEditor.Core, fc: SunEditor.FrameContext);
	useHeader: any;
	usePage: any;
	/**
	 * @description Refresh the document header area
	 */
	reHeader(): void;
	/**
	 * @description Refresh the document page
	 * @param {boolean} force - Whether to force the page to be re-rendered
	 * @returns {Promise<void>}
	 */
	rePage(force: boolean): Promise<void>;
	_getDisplayPage(): any;
	/**
	 * @internal
	 * @description Calculates and compensates for the vertical gap between the rendered content (current page)
	 * - and the mirrored preview page due to differences in width and layout.
	 * @param {number} t - The initial top position value to be adjusted.
	 * @param {HTMLElement[]} chr - The elements array in the current (main) page.
	 * @param {HTMLElement[]} mChr - The elements array in the mirrored page.
	 * @returns {number|null} - The adjusted top value.
	 */
	_calcPageBreakTop(t: number, chr: HTMLElement[], mChr: HTMLElement[]): number | null;
	/**
	 * @internal
	 * @description Initializes the cache for document elements.
	 * @param {Array<HTMLElement>} mChr - List of mirrored elements.
	 */
	_initializeCache(mChr: Array<HTMLElement>): void;
	/**
	 * @internal
	 * @description Retrieves the element at a given position.
	 * @param {number} pageTop - The vertical position to check.
	 * @param {HTMLElement[]} mChr - List of mirrored elements.
	 * @returns {{ci: number, cm: number, ch: number}} The closest element and its related data.
	 * - ci: The index of the closest element.
	 * - cm: The distance between the top of the closest element and the given position.
	 * - ch: The height of the closest element.
	 */
	_getElementAtPosition(
		pageTop: number,
		mChr: HTMLElement[],
	): {
		ci: number;
		cm: number;
		ch: number;
	};
	/**
	 * @description Resizes the document page dynamically.
	 */
	resizePage(): void;
	/**
	 * @description Scrolls the document page.
	 */
	scrollPage(): void;
	/**
	 * @description Scrolls the window to a specific position.
	 */
	scrollWindow(): void;
	/**
	 * @description Retrieves the current page number.
	 * @returns {number} The current page number.
	 */
	getCurrentPageNumber(): number;
	/**
	 * @description Moves to the previous page.
	 */
	pageUp(): void;
	/**
	 * @description Moves to the next page.
	 */
	pageDown(): void;
	/**
	 * @description Moves to a specific page.
	 * @param {number} pageNum - The target page number.
	 */
	pageGo(pageNum: number): void;
	/**
	 * @description Highlights the header of the current line.
	 * @param {Node} line - The "line" element to be highlighted.
	 */
	on(line: Node): void;
	/**
	 * @description Handles text changes in the document.
	 */
	onChangeText(header: any): void;
	/**
	 * @internal
	 * @description Displays the current page number.
	 */
	_displayCurrentPage(): void;
	/**
	 * @internal
	 * @description Retrieves the scroll position in WYSIWYG mode.
	 * @returns {number} The current scroll position.
	 */
	_getWWScrollTop(): number;
	/**
	 * @internal
	 * @description Moves to a specific page and updates the view.
	 * @param {number} pageNum - The target page number.
	 */
	_movePage(pageNum: number, force: any): void;
	/**
	 * @internal
	 * @description Applies smooth scrolling for page navigation.
	 */
	_applyPageScroll(top: any, callback: any): void;
	/**
	 * @internal
	 * @description Retrieves the global top offset of an element.
	 * @returns {number} The top offset of the element.
	 */
	_getGlobalTop(): number;
	/**
	 * @internal
	 * @description Finds an header element of innerHeaders element.
	 * @param {Node} header - H tag element to find.
	 * @returns {HTMLElement|null} The found element, or null if not found.
	 */
	_findItem(header: Node): HTMLElement | null;
	/**
	 * @internal
	 * @description Finds the closest header element from a given line.
	 * @param {Node} line - The "line" to check.
	 * @returns {Node|null} The closest header element, or null if not found.
	 */
	_findLinesHeader(line: Node): Node | null;
	/**
	 * @internal
	 * @description Checks if an element is a header.
	 * @param {Node} element - The element to check.
	 * @returns {boolean} True if the element is a header, otherwise false.
	 */
	_is(element: Node): boolean;
	/**
	 * @internal
	 * @description Retrieves all headers in the document.
	 * @returns {Array<HTMLElement>} An array of header elements.
	 */
	_getHeaders(): Array<HTMLElement>;
	/**
	 * @internal
	 * @description Destroy the DocumentType instance and release memory
	 */
	_destroy(): void;
	#private;
}
import CoreInjector from '../../editorInjector/_core';
