import EditorInjector from '../../editorInjector';
import { dom } from '../../helper';

/**
 * @typedef {Object} FontPluginOptions
 * @property {Array<string>} [items] - Font list
 */

/**
 * @class
 * @description Text font plugin
 */
class Font extends EditorInjector {
	static key = 'font';
	static type = 'dropdown';
	static className = 'se-btn-select se-btn-tool-font';

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {FontPluginOptions} pluginOptions - plugin options
	 */
	constructor(editor, pluginOptions) {
		super(editor);
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
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement} [element] - Node element where the cursor is currently located
	 * @param {?HTMLElement} [target] - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	active(element, target) {
		const targetText = target.querySelector('.se-txt');
		const tooltip = target.parentNode.querySelector('.se-tooltip-text');

		let fontFamily = '';
		if (!element) {
			const font = this.status.hasFocus ? this.frameContext.get('wwComputedStyle').fontFamily : this.lang.font;
			dom.utils.changeTxt(targetText, font);
			dom.utils.changeTxt(tooltip, this.status.hasFocus ? this.lang.font + (font ? ' (' + font + ')' : '') : font);
		} else if (this.format.isLine(element)) {
			return undefined;
		} else if ((fontFamily = dom.utils.getStyle(element, 'fontFamily'))) {
			const selectFont = fontFamily.replace(/["']/g, '');
			dom.utils.changeTxt(targetText, selectFont);
			dom.utils.changeTxt(tooltip, this.lang.font + ' (' + selectFont + ')');
			return true;
		}

		return false;
	}

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} target Line element at the current cursor position
	 */
	on(target) {
		const fontList = this.fontList;
		const currentFont = target.querySelector('.se-txt').textContent;

		if (currentFont !== this.currentFont) {
			for (let i = 0, len = fontList.length; i < len; i++) {
				if (currentFont === (fontList[i].getAttribute('data-command') || '').replace(/'|"/g, '')) {
					dom.utils.addClass(fontList[i], 'active');
				} else {
					dom.utils.removeClass(fontList[i], 'active');
				}
			}

			this.currentFont = currentFont;
		}
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 * @returns {Promise<void>}
	 */
	async action(target) {
		let value = target.getAttribute('data-command');
		if (value) {
			if (/[\s\d\W]/.test(value) && !/^['"].*['"]$/.test(value)) {
				value = `"${value}"`;
			}

			// before event
			if ((await this.triggerEvent('onFontActionBefore', { value })) === false) return;

			const newNode = dom.utils.createElement('SPAN', { style: 'font-family: ' + value + ';' });
			this.inline.apply(newNode, { stylesToModify: ['font-family'], nodesToRemove: null, strictRemove: null });
		} else {
			this.inline.apply(null, { stylesToModify: ['font-family'], nodesToRemove: ['span'], strictRemove: true });
		}

		this.menu.dropdownOff();
	}
}

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

	return dom.utils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-font-family' }, list);
}

export default Font;
