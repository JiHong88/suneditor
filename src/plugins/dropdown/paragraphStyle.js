import { PluginDropdown } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @typedef {Object} ParagraphStylePluginOptions
 * @property {Array<string|{name: string, class: string, _class: string}>} [items] - Paragraph item list
 * ```js
 * // use default paragraph styles
 * ['spaced', 'bordered', 'neon']
 * // custom paragraph styles
 * [
 *   { name: 'spaced', class: '__se__p-spaced', _class: '' },
 *   { name: 'bordered', class: '__se__p-bordered', _class: '' },
 *   { name: 'neon', class: '__se__p-neon', _class: '' }
 * ]
 * ```
 */

/**
 * @class
 * @description A plugin to style lines using classes.
 */
class ParagraphStyle extends PluginDropdown {
	static key = 'paragraphStyle';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {ParagraphStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel, pluginOptions) {
		// plugin bisic properties
		super(kernel);
		this.title = this.$.lang.paragraphStyle;
		this.icon = 'paragraph_style';

		// create menu from items
		const menu = this.$.menu.initDropdownTarget(ParagraphStyle, CreateItems(this.$, pluginOptions.items), {
			className: 'se-list-format',
		});

		// members
		this.classList = menu.querySelectorAll('li button');
	}

	/**
	 * @override
	 * @type {PluginDropdown['on']}
	 */
	on() {
		const paragraphList = this.classList;
		const currentFormat = this.$.format.getLine(this.$.selection.getNode());

		for (let i = 0, len = paragraphList.length; i < len; i++) {
			if (dom.utils.hasClass(currentFormat, paragraphList[i].getAttribute('data-command'))) {
				dom.utils.addClass(paragraphList[i], 'active');
			} else {
				dom.utils.removeClass(paragraphList[i], 'active');
			}
		}
	}

	/**
	 * @override
	 * @type {PluginDropdown['action']}
	 */
	action(target) {
		const value = target.getAttribute('data-command');
		let selectedFormsts = this.$.format.getLines();
		if (selectedFormsts.length === 0) {
			this.$.selection.getRangeAndAddLine(this.$.selection.getRange(), null);
			selectedFormsts = this.$.format.getLines();
			if (selectedFormsts.length === 0) return;
		}

		// change format class
		for (let i = 0, len = selectedFormsts.length; i < len; i++) {
			dom.utils.toggleClass(selectedFormsts[i], value);
		}

		this.$.menu.dropdownOff();
		this.$.history.push(false);
	}
}

/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @param {Array<string|{name: string, class: string, _class?: string}>} [items] - Paragraph style items
 * @returns {Array<import('../../core/logic/panel/menu').DropdownItem>}
 */
function CreateItems({ lang }, items) {
	const defaultList = {
		spaced: {
			name: lang.menu_spaced,
			class: '__se__p-spaced',
			_class: '',
		},
		bordered: {
			name: lang.menu_bordered,
			class: '__se__p-bordered',
			_class: '',
		},
		neon: {
			name: lang.menu_neon,
			class: '__se__p-neon',
			_class: '',
		},
	};
	const paragraphStyles = !items || items.length === 0 ? ['spaced', 'bordered', 'neon'] : items;
	const result = [];

	for (let i = 0, len = paragraphStyles.length, p, name, attrs; i < len; i++) {
		p = paragraphStyles[i];

		if (typeof p === 'string') {
			const cssText = defaultList[p.toLowerCase()];
			if (!cssText) continue;
			p = cssText;
		}

		name = p.name;
		attrs = p.class ? ` class="${p.class}"` : '';

		result.push({
			command: p.class,
			title: name,
			innerHTML: `<div${attrs}>${name}</div>`,
			className: p._class || undefined,
		});
	}

	return result;
}

export default ParagraphStyle;
