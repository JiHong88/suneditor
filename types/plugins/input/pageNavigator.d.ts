import type {} from '../../typedef';
export default PageNavigator;
/**
 * @class
 * @description PageNavigator Plugin
 * - This plugin provides functionality for navigating between pages within the editor's document.
 * - It features an input field for entering the desired page number and a display element showing
 * - the total number of pages. When the user changes the value in the input field, the plugin triggers
 * - a page navigation event through the editor's document context.
 */
declare class PageNavigator extends PluginInput {
	title: any;
	inner: HTMLInputElement;
	pageNum: number;
	totalPages: number;
	/**
	 * Updates the displayed page number and total pages in the navigator.
	 * @param {number} pageNum - The current page number to display.
	 * @param {number} totalPages - The total number of pages in the document.
	 * @returns {void}
	 */
	display(pageNum: number, totalPages: number): void;
	#private;
}
import { PluginInput } from '../../interfaces';
