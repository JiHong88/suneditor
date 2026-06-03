import { PluginDropdown } from '../../interfaces';

/**
 * @typedef {Object} TemplatePluginOptions
 * @property {Array<{name: string, html: string}>} [items] - Template list
 * ```js
 * [{ name: 'Greeting', html: '<p>Hello! Thank you for contacting us.</p>' }]
 * ```
 */

/**
 * @class
 * @description Template Plugin, Apply a template to the selection.
 */
class Template extends PluginDropdown {
	static key = 'template';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {TemplatePluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel, pluginOptions) {
		// plugin bisic properties
		super(kernel);
		this.title = this.$.lang.template;
		this.icon = 'template';

		// members
		this.selectedIndex = -1;
		this.items = pluginOptions.items;

		// create menu from items
		this.$.menu.initDropdownTarget(Template, CreateItems(this.items));
	}

	/**
	 * @override
	 * @type {PluginDropdown['action']}
	 */
	action(target) {
		const index = Number(target.getAttribute('data-value'));
		const temp = this.items[(this.selectedIndex = index)];

		if (temp.html) {
			this.$.html.insert(temp.html, { selectInserted: false, skipCharCount: false, skipCleaning: false });
		} else {
			this.$.menu.dropdownOff();
			throw Error('[SUNEDITOR.template.fail] cause : "templates[i].html not found"');
		}

		this.$.menu.dropdownOff();
	}
}

/**
 * @param {Array<{name: string, html: string}>} templateList - Template items
 * @returns {Array<import('../../core/logic/panel/menu').DropdownItem>}
 */
function CreateItems(templateList) {
	if (!templateList || templateList.length === 0) {
		console.warn(
			'[SUNEDITOR.plugins.template.warn] To use the "template" plugin, please define the "templates" option.',
		);
	}

	return (templateList || []).map((t, i) => ({
		command: 'template',
		value: String(i),
		title: t.name,
		innerHTML: t.name,
	}));
}

export default Template;
