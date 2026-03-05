import { PluginInput } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @class
 * @description PageNavigator Plugin
 * - This plugin provides functionality for navigating between pages within the editor's document.
 * - It features an input field for entering the desired page number and a display element showing
 * - the total number of pages. When the user changes the value in the input field, the plugin triggers
 * - a page navigation event through the editor's document context.
 */
class PageNavigator extends PluginInput {
	static key = 'pageNavigator';
	static className = 'se-btn-input se-btn-tool-pageNavigator';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);

		// create HTML
		this.title = this.$.lang.pageNumber;
		this.inner = CreateInner();
		this.afterItem = dom.utils.createElement('span', { class: 'se-btn se-sub-btn' }, ``);

		// members
		this.pageNum = 1;
		this.totalPages = 1;

		// init
		this.$.eventManager.addEvent(this.inner, 'change', this.#OnChangeInner.bind(this));
	}

	/**
	 * Updates the displayed page number and total pages in the navigator.
	 * @param {number} pageNum - The current page number to display.
	 * @param {number} totalPages - The total number of pages in the document.
	 * @returns {void}
	 */
	display(pageNum, totalPages) {
		// data update
		this.pageNum = pageNum;
		this.totalPages = totalPages;
		// display
		this.inner.value = String(pageNum);
		this.afterItem.textContent = this.inner.max = String(totalPages);
	}

	/**
	 * @description Page number change event handler
	 * @param {InputEvent} e - Event object
	 */
	#OnChangeInner(e) {
		if (!this.$.frameContext.has('documentType_use_page')) return;

		/** @type {HTMLInputElement} */
		const eventTarget = dom.query.getEventTarget(e);

		const value = Number(eventTarget.value) || 1;
		this.$.frameContext.get('documentType').pageGo(value);
	}
}

/**
 * @returns {HTMLInputElement}
 */
function CreateInner() {
	return /** @type {HTMLInputElement} */ (dom.utils.createElement('input', { type: 'number', class: 'se-not-arrow-text', placeholder: '1', value: '1', min: '1' }, null));
}

export default PageNavigator;
