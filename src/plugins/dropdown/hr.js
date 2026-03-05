import { PluginDropdown } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @typedef {Object} HRPluginOptions
 * @property {Array<{name: string, class: string, style?: string}>} [items] - HR list
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

		// create HTML
		const HRMenus = CreateHTML(this.$, pluginOptions.items);

		// members
		this.list = HRMenus.querySelectorAll('button');

		// init
		this.$.menu.initDropdownTarget(HR, HRMenus);
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
 * @returns {HTMLElement}
 */
function CreateHTML({ lang }, HRItems) {
	const items = HRItems || [
		{
			name: lang.hr_solid,
			class: '__se__solid',
			style: null,
		},
		{
			name: lang.hr_dashed,
			class: '__se__dashed',
			style: null,
		},
		{
			name: lang.hr_dotted,
			class: '__se__dotted',
			style: null,
		},
	];

	let list = '';
	for (let i = 0, len = items.length; i < len; i++) {
		list += /*html*/ `
		<li>
			<button type="button" class="se-btn se-btn-list" data-command="hr" title="${items[i].name}" aria-label="${items[i].name}">
				<hr${items[i].class ? ` class="${items[i].class}"` : ''}${items[i].style ? ` style="${items[i].style}"` : ''}/>
			</button>
		</li>`;
	}

	return dom.utils.createElement(
		'DIV',
		{
			class: 'se-dropdown se-list-layer se-list-line',
		},
		/*html*/ `
		<div class="se-list-inner">
			<ul class="se-list-basic">${list}</ul>
		</div>`,
	);
}

export default HR;
