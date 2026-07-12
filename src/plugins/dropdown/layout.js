import { PluginDropdown } from '../../interfaces';

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

		// create menu from items
		this.$.menu.initDropdownTarget(Layout, CreateItems(this.items));
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
 * @returns {Array<import('../../core/logic/panel/menu').DropdownItem>}
 */
function CreateItems(layoutList) {
	if (!layoutList || layoutList.length === 0) {
		console.warn('[SUNEDITOR.plugins.layout.warn] To use the "layout" plugin, please define the "layouts" option.');
	}

	return (layoutList || []).map((t, i) => ({
		command: 'layout',
		value: String(i),
		title: t.name,
		innerHTML: t.name,
	}));
}

export default Layout;
