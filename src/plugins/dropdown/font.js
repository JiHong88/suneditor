import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

/**
 * @class
 * @description Text font plugin
 * @param {object} editor editor core object
 * @param {object} pluginOptions
 * @param {Array.<string>} pluginOptions.items - Font list
 * @param {number} pluginOptions.splitNum - Number of colors per line
 * @param {boolean} pluginOptions.disableHEXInput - Disable HEX input
 */
const Font = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.font;
	this.inner = '<span class="se-txt">' + this.lang.font + '</span>' + this.icons.arrow_down;

	// create HTML
	const fontList = pluginOptions.items || ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'];
	const menu = CreateHTML(editor, fontList);

	// members
	this.currentFont = '';
	this.fontList = menu.querySelectorAll('ul li button');
	this.fontArray = fontList;

	// init
	this.menu.initDropdownTarget(Font, menu);
};

Font.key = 'font';
Font.type = 'dropdown';
Font.className = 'se-btn-select se-btn-tool-font';
Font.prototype = {
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?Element} element - Node element where the cursor is currently located
	 * @param {?Element} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 */
	active(element, target) {
		const targetText = target.querySelector('.se-txt');
		const tooltip = target.parentNode.querySelector('.se-tooltip-text');

		if (!element) {
			const font = this.status.hasFocus ? this.editor.frameContext.get('wwComputedStyle').fontFamily : this.lang.font;
			domUtils.changeTxt(targetText, font);
			domUtils.changeTxt(tooltip, this.status.hasFocus ? this.lang.font + (font ? ' (' + font + ')' : '') : font);
		} else if (element?.style.fontFamily.length > 0) {
			const selectFont = element.style.fontFamily.replace(/["']/g, '');
			domUtils.changeTxt(targetText, selectFont);
			domUtils.changeTxt(tooltip, this.lang.font + ' (' + selectFont + ')');
			return true;
		}

		return false;
	},

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {Element} target Line element at the current cursor position
	 */
	on(target) {
		const fontList = this.fontList;
		const currentFont = target.querySelector('.se-txt').textContent;

		if (currentFont !== this.currentFont) {
			for (let i = 0, len = fontList.length; i < len; i++) {
				if (currentFont === (fontList[i].getAttribute('data-command') || '').replace(/'|"/g, '')) {
					domUtils.addClass(fontList[i], 'active');
				} else {
					domUtils.removeClass(fontList[i], 'active');
				}
			}

			this.currentFont = currentFont;
		}
	},

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * Called when an item in the "dropdown" menu is clicked.
	 * @param {?Element} target - The plugin's toolbar button element
	 */
	async action(target) {
		let value = target.getAttribute('data-command');
		if (value) {
			if (/[\s\d\W]/.test(value) && !/^['"].*['"]$/.test(value)) {
				value = `"${value}"`;
			}

			// before event
			if ((await this.triggerEvent('onFontActionBefore', { value })) === false) return;

			const newNode = domUtils.createElement('SPAN', { style: 'font-family: ' + value + ';' });
			this.format.applyInlineElement(newNode, { stylesToModify: ['font-family'], nodesToRemove: null, strictRemove: null });
		} else {
			this.format.applyInlineElement(null, { stylesToModify: ['font-family'], nodesToRemove: ['span'], strictRemove: true });
		}

		this.menu.dropdownOff();
	},

	constructor: Font
};

function CreateHTML({ lang }, fontList) {
	let list = /*html*/ `
	<div class="se-list-inner">
		<ul class="se-list-basic">
			<li>
				<button type="button" class="se-btn se-btn-list default_value" data-command="" title="${lang.default}" aria-label="${lang.default}">(${lang.default})</button>
			</li>`;

	for (let i = 0, len = fontList.length, font, text; i < len; i++) {
		font = fontList[i];
		text = font.split(',')[0];
		list += /*html*/ `
			<li>
				<button type="button" class="se-btn se-btn-list" data-command="${font}" data-txt="${text}" title="${text}" aria-label="${text}" style="font-family:${font};">${text}</button>
			</li>`;
	}
	list += /*html*/ `
		</ul>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-font-family' }, list);
}

export default Font;
