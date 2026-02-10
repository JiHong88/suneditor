import { PluginDropdown } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @typedef {Object} TextStylePluginOptions
 * @property {Array<string|{name: string, class: string, tag?: string}>} [items] - Text style item list
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
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {TextStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.$.lang.textStyle;
		this.icon = 'text_style';

		// create HTML
		const menu = CreateHTML(this.$, pluginOptions.items);

		// members
		this.styleList = menu.querySelectorAll('li button');

		// init
		this.$.menu.initDropdownTarget(TextStyle, menu);
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
 * @returns {HTMLElement}
 */
function CreateHTML({ lang }, items) {
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

	let list = '<div class="se-list-inner"><ul class="se-list-basic">';
	for (let i = 0, len = styleList.length, t, tag, name, attrs, command, value; i < len; i++) {
		t = styleList[i];
		attrs = '';
		value = '';
		command = [];

		if (typeof t === 'string') {
			const cssText = defaultList[t.toLowerCase()];
			if (!cssText) continue;
			t = cssText;
		}

		name = t.name;
		tag = t.tag || 'span';

		attrs += ` class="${t.class}"`;
		value += `.${t.class.trim().replace(/\s+/g, ',.')}`;
		command.push('class');

		value = value.replace(/,$/, '');

		list += `
		<li>
			<button 
				type="button" 
				class="se-btn se-btn-list" 
				data-command="${tag}" 
				data-value="${value}" 
				title="${name}" 
				aria-label="${name}"
			>
				<${tag}${attrs}>${name}</${tag}>
			</button>
		</li>`;
	}
	list += '</ul></div>';

	return dom.utils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-format' }, list);
}

export default TextStyle;
