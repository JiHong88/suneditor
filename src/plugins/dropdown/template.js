import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

/**
 * @class
 * @description Template Plugin, Apply a template to the selection.
 * @param {EditorCore} editor - The root editor instance
 * @param {Object} pluginOptions
 * @param {Array<{name: string, html: string}>} pluginOptions.items - Template list
 */
function Template(editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.template;
	this.icon = 'template';

	// members
	this.selectedIndex = -1;
	this.items = pluginOptions.items;

	// create HTML
	const menu = CreateHTML(this.items);

	// init
	this.menu.initDropdownTarget(Template, menu);
}

Template.key = 'template';
Template.type = 'dropdown';
Template.className = '';
Template.prototype = {
	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {?Element} target - The plugin's toolbar button element
	 */
	action(target) {
		const index = target.getAttribute('data-value') * 1;
		const temp = this.items[(this.selectedIndex = index)];

		if (temp.html) {
			this.html.insert(temp.html, { selectInserted: false, skipCharCount: false, skipCleaning: false });
		} else {
			this.menu.dropdownOff();
			throw Error('[SUNEDITOR.template.fail] cause : "templates[i].html not found"');
		}

		this.menu.dropdownOff();
	},

	constructor: Template
};

function CreateHTML(templateList) {
	if (!templateList || templateList.length === 0) {
		console.warn('[SUNEDITOR.plugins.template.warn] To use the "template" plugin, please define the "templates" option.');
	}

	let list = '<div class="se-dropdown se-list-inner"><ul class="se-list-basic">';
	for (let i = 0, len = (templateList || []).length, t; i < len; i++) {
		t = templateList[i];
		list += /*html*/ `
		<li>
			<button 
				type="button" 
				class="se-btn se-btn-list" 
				data-value="${i}" 
				title="${t.name}" 
				aria-label="${t.name}"
			>
				${t.name}
			</button>
		</li>`;
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-list-layer' }, list);
}

export default Template;
