import { PluginDropdown } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @typedef {Object} LayoutPluginOptions
 * @property {Array<{name: string, html: string}>} [items] - Layout list. Each item defines a named layout template with raw HTML.
 * ```js
 * [{ name: 'Two Columns', html: '<div style="display:flex"><div style="flex:1">Left</div><div style="flex:1">Right</div></div>' }]
 * ```
 */

/**
 * @class
 * @description Layout Plugin, Apply layout to the entire editor.
 */
class Layout extends PluginDropdown {
	static key = 'layout';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {LayoutPluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel, pluginOptions) {
		// plugin bisic properties
		super(kernel);
		this.title = this.$.lang.layout;
		this.icon = 'layout';

		// members
		this.selectedIndex = -1;
		this.items = pluginOptions.items;

		// create HTML
		const menu = CreateHTML(this.items);

		// init
		this.$.menu.initDropdownTarget(Layout, menu);
	}

	/**
	 * @override
	 * @type {PluginDropdown['action']}
	 */
	action(target) {
		const index = Number(target.getAttribute('data-value'));
		const temp = this.items[(this.selectedIndex = index)];

		if (temp.html) {
			this.$.html.set(temp.html);
		} else {
			this.$.menu.dropdownOff();
			throw Error('[SUNEDITOR.layout.fail] cause : "layouts[i].html not found"');
		}

		this.$.menu.dropdownOff();
	}
}

/**
 * @param {Array<{name: string, html: string}>} layoutList - Layout items
 * @returns {HTMLElement}
 */
function CreateHTML(layoutList) {
	if (!layoutList || layoutList.length === 0) {
		console.warn('[SUNEDITOR.plugins.layout.warn] To use the "layout" plugin, please define the "layouts" option.');
	}

	let list = /*html*/ `
	<div class="se-dropdown se-list-inner">
		<ul class="se-list-basic">`;

	for (let i = 0, len = (layoutList || []).length, t; i < len; i++) {
		t = layoutList[i];
		list += /*html*/ `
			<li>
				<button type="button" class="se-btn se-btn-list" data-command="layout" data-value="${i}" title="${t.name}" aria-label="${t.name}">
					${t.name}
				</button>
			</li>`;
	}

	list += /*html*/ `
		</ul>
	</div>`;

	return dom.utils.createElement('DIV', { class: 'se-list-layer' }, list);
}

export default Layout;
