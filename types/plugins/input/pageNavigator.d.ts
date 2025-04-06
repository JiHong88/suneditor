export default PageNavigator;
/**
 * @class
 * @description PageNavigator Plugin
 * - This plugin provides functionality for navigating between pages within the editor's document.
 * - It features an input field for entering the desired page number and a display element showing
 * - the total number of pages. When the user changes the value in the input field, the plugin triggers
 * - a page navigation event through the editor's document context.
 */
declare class PageNavigator extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	title: any;
	inner: HTMLInputElement;
	afterItem: HTMLElement;
	pageNum: number;
	totalPages: number;
	/**
	 * @editorMethod Editor.documentType
	 * @description Updates the displayed page number and total pages in the navigator.
	 * @param {number} pageNum - The current page number to display.
	 * @param {number} totalPages - The total number of pages in the document.
	 */
	display(pageNum: number, totalPages: number): void;
	#private;
}
import EditorInjector from '../../editorInjector';
