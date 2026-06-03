import { PluginDropdown } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @typedef {Object} HRPluginOptions
 * @property {Array<{name: string, class: string, style?: string}>} [items] - HR list
 * ```js
 * [
 *   { name: 'Solid', class: '__se__solid', style: 'border-top: 1px solid #000;' },
 *   { name: 'Dashed', class: '__se__dashed' }
 * ]
 * ```
 */

/**
 * @class
 * @description HR Plugin
 */
class HR extends PluginDropdown {
	static key = 'hr';
	static className = '';

	/**
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		return /^hr$/i.test(node?.nodeName) ? node : null;
	}

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {HRPluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel, pluginOptions) {
		// plugin bisic properties
		super(kernel);
		this.title = this.$.lang.horizontalLine;
		this.icon = 'horizontal_line';

		// create menu from items
		const menu = this.$.menu.initDropdownTarget(HR, CreateItems(this.$, pluginOptions.items), {
			className: 'se-list-line',
		});

		// members
		this.list = menu.querySelectorAll('button');
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Select}
	 */
	componentSelect(target) {
		dom.utils.addClass(target, 'on');
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Deselect}
	 */
	componentDeselect(element) {
		dom.utils.removeClass(element, 'on');
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Destroy}
	 */
	componentDestroy(target) {
		if (!target) return;

		const focusEl = target.previousElementSibling || target.nextElementSibling;
		dom.utils.removeItem(target);

		// focus
		this.$.focusManager.focusEdge(focusEl);
		this.$.history.push(false);
	}

	/**
	 * @hook Editor.Core
	 * @type {SunEditor.Hook.Core.Shortcut}
	 */
	shortcut({ line, range }) {
		const newLine = this.$.nodeTransform.split(range.endContainer, range.endOffset, 0);
		this.submit('__se__solid');
		dom.utils.removeItem(line);
		this.$.selection.setRange(newLine, 0, newLine, 0);
	}

	/**
	 * @override
	 * @type {PluginDropdown['action']}
	 */
	action(target) {
		const hr = this.submit(target.firstElementChild.className);
		const line = this.$.format.addLine(hr);
		this.$.selection.setRange(line, 1, line, 1);
		this.$.menu.dropdownOff();
	}

	/**
	 * @description Add a `hr` element
	 * @param {string} className HR class name
	 */
	submit(className) {
		const hr = dom.utils.createElement('hr', { class: className });
		this.$.focusManager.focus();
		this.$.component.insert(hr, { insertBehavior: 'line' });
		return hr;
	}
}

/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @param {Array<{name: string, class: string, style?: string}>} [HRItems] - HR style items
 * @returns {Array<import('../../core/logic/panel/menu').DropdownItem>}
 */
function CreateItems({ lang }, HRItems) {
	const items = HRItems || [
		{ name: lang.hr_solid, class: '__se__solid', style: null },
		{ name: lang.hr_dashed, class: '__se__dashed', style: null },
		{ name: lang.hr_dotted, class: '__se__dotted', style: null },
	];

	return items.map((item) => ({
		command: 'hr',
		title: item.name,
		innerHTML: `<hr${item.class ? ` class="${item.class}"` : ''}${item.style ? ` style="${item.style}"` : ''}/>`,
	}));
}

export default HR;
