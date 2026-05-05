import { PluginDropdown } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @typedef {Object} FontPluginOptions
 * @property {Array<string>} [items] - Font list
 */

/**
 * @class
 * @description Text font plugin
 */
class Font extends PluginDropdown {
	static key = 'font';
	static className = 'se-btn-select se-btn-tool-font';

	#defaultValue;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {FontPluginOptions} pluginOptions - plugin options
	 */
	constructor(kernel, pluginOptions) {
		super(kernel);
		// plugin basic properties
		this.title = this.$.lang.font;
		this.inner = '<span class="se-txt">' + this.$.lang.font + '</span>' + this.$.icons.arrow_down;

		// create menu from items
		const fontList = pluginOptions.items || ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'];
		const prependHTML = `<li><button type="button" class="se-btn se-btn-list default_value" data-command="" title="${this.$.lang.default}" aria-label="${this.$.lang.default}">${this.$.lang.default}</button></li><li class="se-btn-list se-sub-list"><span></span></li>`;
		const menu = this.$.menu.initDropdownTarget(Font, CreateItems(fontList), { className: 'se-list-font-family', prependHTML });

		// members
		this.currentFont = '';
		this.fontList = menu.querySelectorAll('ul li button');
		this.fontArray = fontList;

		this.#defaultValue = /** @type {HTMLSpanElement} */ (menu.querySelector('.se-sub-list span'));
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.Active}
	 */
	active(element, target) {
		const targetText = target.querySelector('.se-txt');
		const tooltip = target.parentNode.querySelector('.se-tooltip-text');

		let fontFamily = '';
		if (!element) {
			const font = this.$.store.get('hasFocus') ? this.$.frameContext.get('wwComputedStyle').fontFamily : this.$.lang.font;
			dom.utils.changeTxt(targetText, font);
			dom.utils.changeTxt(tooltip, this.$.store.get('hasFocus') ? this.$.lang.font + (font ? ' (' + font + ')' : '') : font);
		} else if (this.$.format.isLine(element)) {
			return undefined;
		} else if ((fontFamily = dom.utils.getStyle(element, 'fontFamily'))) {
			const selectFont = fontFamily.replace(/["']/g, '');
			dom.utils.changeTxt(targetText, selectFont);
			dom.utils.changeTxt(tooltip, this.$.lang.font + ' (' + selectFont + ')');
			return true;
		}

		return false;
	}

	/**
	 * @override
	 * @type {PluginDropdown['on']}
	 */
	on(target) {
		const fontList = this.fontList;
		const currentFont = target.querySelector('.se-txt').textContent;

		if (currentFont !== this.currentFont) {
			let found = false;
			for (let i = 0, len = fontList.length; i < len; i++) {
				if (currentFont === (fontList[i].getAttribute('data-command') || '').replace(/'|"/g, '')) {
					dom.utils.addClass(fontList[i], 'active');
					found = true;
				} else {
					dom.utils.removeClass(fontList[i], 'active');
				}
			}

			this.currentFont = currentFont;

			if (!found) {
				this.#defaultValue.textContent = currentFont;
				this.#defaultValue.style.display = 'block';
			} else {
				this.#defaultValue.style.display = 'none';
			}
		}
	}

	/**
	 * @override
	 * @type {PluginDropdown['action']}
	 */
	async action(target) {
		let value = target.getAttribute('data-command');
		if (value) {
			if (/[\s\d\W]/.test(value) && !/^['"].*['"]$/.test(value)) {
				value = `"${value}"`;
			}

			// before event
			if ((await this.$.eventManager.triggerEvent('onFontActionBefore', { value })) === false) return;

			const newNode = dom.utils.createElement('SPAN', { style: 'font-family: ' + value + ';' });
			this.$.inline.apply(newNode, { stylesToModify: ['font-family'], nodesToRemove: null, strictRemove: null });
		} else {
			this.$.inline.apply(null, { stylesToModify: ['font-family'], nodesToRemove: ['span'], strictRemove: true });
		}

		this.$.menu.dropdownOff();
	}
}

/**
 * @param {string[]} fontList - Font name list
 * @returns {Array<import('../../core/logic/panel/menu').DropdownItem>}
 */
function CreateItems(fontList) {
	return fontList.map((font) => {
		const text = font.split(',')[0];
		return {
			command: font,
			title: text,
			innerHTML: text,
			attrs: { 'data-txt': text, style: `font-family:${font};` },
		};
	});
}

export default Font;
