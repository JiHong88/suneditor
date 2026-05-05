import { PluginDropdown } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @typedef {Object} TextStylePluginOptions
 * @property {Array<string|{name: string, class: string, tag?: string}>} [items] - Text style item list.
 * Use string shortcuts for built-in styles (e.g., `'shadow'`), or objects for custom styles.
 * ```js
 * ['shadow', { name: 'Highlight', class: 'my-highlight', tag: 'mark' }]
 * ```
 */

/**
 * @class
 * @description Text style Plugin, Applies a tag that specifies text styles to a selection.
 */
class TextStyle extends PluginDropdown {
	static key = 'textStyle';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {TextStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel, pluginOptions) {
		// plugin bisic properties
		super(kernel);
		this.title = this.$.lang.textStyle;
		this.icon = 'text_style';

		// create menu from items
		const menu = this.$.menu.initDropdownTarget(TextStyle, CreateItems(this.$, pluginOptions.items), { className: 'se-list-format' });

		// members
		this.styleList = menu.querySelectorAll('li button');
	}

	/**
	 * @override
	 * @type {PluginDropdown['on']}
	 */
	on() {
		const styleButtonList = this.styleList;
		const selectionNode = this.$.selection.getNode();

		for (let i = 0, len = styleButtonList.length, btn, data, active; i < len; i++) {
			btn = styleButtonList[i];
			data = btn.getAttribute('data-value').split(',');

			for (let v = 0, node, value; v < data.length; v++) {
				node = selectionNode;
				active = false;

				while (node && !this.$.format.isLine(node) && !this.$.component.is(node)) {
					if (node.nodeName.toLowerCase() === btn.getAttribute('data-command').toLowerCase()) {
						value = data[v];
						if (/^\./.test(value) ? dom.utils.hasClass(node, value.replace(/^\./, '')) : /** @type {HTMLElement} */ (node).style[value]) {
							active = true;
							break;
						}
					}
					node = node.parentNode;
				}

				if (!active) break;
			}

			active ? dom.utils.addClass(btn, 'active') : dom.utils.removeClass(btn, 'active');
		}
	}

	/**
	 * @override
	 * @type {PluginDropdown['action']}
	 */
	action(target) {
		const tempElement = /** @type {HTMLElement} */ (target.firstElementChild);
		const checkStyles = tempElement.style.cssText.replace(/:.+(;|$)/g, ',').split(',');
		checkStyles.pop();

		const classes = tempElement.classList;
		for (let i = 0, len = classes.length; i < len; i++) {
			checkStyles.push('.' + classes[i]);
		}

		const newNode = dom.utils.hasClass(target, 'active') ? null : tempElement.cloneNode(false);
		const removeNodes = newNode ? null : [tempElement.nodeName];
		this.$.inline.apply(newNode, { stylesToModify: checkStyles, nodesToRemove: removeNodes, strictRemove: true });

		this.$.menu.dropdownOff();
	}
}

/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @param {Array<string|{name: string, class: string, tag?: string}>} [items] - Text style items
 * @returns {Array<import('../../core/logic/panel/menu').DropdownItem>}
 */
function CreateItems({ lang }, items) {
	const defaultList = {
		code: {
			name: lang.menu_code,
			class: '__se__t-code',
			tag: 'code',
		},
		shadow: {
			name: lang.menu_shadow,
			class: '__se__t-shadow',
			tag: 'span',
		},
	};
	const styleList = items || Object.keys(defaultList);
	const result = [];

	for (let i = 0, len = styleList.length, t, tag, name, value; i < len; i++) {
		t = styleList[i];

		if (typeof t === 'string') {
			const cssText = defaultList[t.toLowerCase()];
			if (!cssText) continue;
			t = cssText;
		}

		name = t.name;
		tag = t.tag || 'span';
		value = `.${t.class.trim().replace(/\s+/g, ',.')}`.replace(/,$/, '');

		result.push({
			command: tag,
			value,
			title: name,
			innerHTML: `<${tag} class="${t.class}">${name}</${tag}>`,
		});
	}

	return result;
}

export default TextStyle;
