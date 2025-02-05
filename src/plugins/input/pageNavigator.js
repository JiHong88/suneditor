import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

/**
 * @class
 * @description PageNavigator Plugin
 * This plugin provides functionality for navigating between pages within the editor's document.
 * It features an input field for entering the desired page number and a display element showing
 * the total number of pages. When the user changes the value in the input field, the plugin triggers
 * a page navigation event through the editor's document context.
 * @param {object} editor editor core object
 */
function PageNavigator(editor) {
	EditorInjector.call(this, editor);

	// create HTML
	this.title = this.lang.pageNumber;
	this.inner = CreateInner();
	this.afterItem = domUtils.createElement('span', { class: 'se-btn se-sub-btn' }, ``);

	// members
	this.pageNum = 1;
	this.totalPages = 1;

	// init
	this.eventManager.addEvent(this.inner, 'change', OnChangeInner.bind(this));
}

PageNavigator.key = 'pageNavigator';
PageNavigator.type = 'input';
PageNavigator.className = 'se-btn-input se-btn-tool-pageNavigator';
PageNavigator.prototype = {
	/**
	 * @editorMethod Editor.documentType
	 * @description Updates the displayed page number and total pages in the navigator.
	 * @param {number} pageNum - The current page number to display.
	 * @param {number} totalPages - The total number of pages in the document.
	 */
	display(pageNum, totalPages) {
		this.inner.value = this.pageNum = pageNum;
		this.afterItem.textContent = this.totalPages = totalPages;
		this.inner.max = totalPages;
	},

	constructor: PageNavigator
};

function OnChangeInner({ target }) {
	if (!this.editor.frameContext.has('documentType-use-page')) return;

	const value = target.value || 1;
	this.editor.frameContext.get('documentType').pageGo(value);
}

function CreateInner() {
	return domUtils.createElement('input', { type: 'number', class: 'se-not-arrow-text', placeholder: '1', value: '1', min: '1' }, null);
}

export default PageNavigator;
