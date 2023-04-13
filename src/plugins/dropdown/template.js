import EditorInjector from '../../injector';
import { domUtils } from '../../helper';

const Template = function (editor) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.template;
	this.icon = 'template';

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.selectedIndex = -1;

	// init
	this.menu.initDropdownTarget(Template, menu);
};

Template.key = 'template';
Template.type = 'dropdown';
Template.className = '';
Template.prototype = {
	/**
	 * @override core
	 */
	action: function (target) {
		const index = target.getAttribute('data-value') * 1;
		const temp = this.options.get('templates')[(this.selectedIndex = index)];

		if (temp.html) {
			this.html.insert(temp.html);
		} else {
			this.menu.dropdownOff();
			throw Error('[SUNEDITOR.template.fail] cause : "templates[i].html not found"');
		}

		this.menu.dropdownOff();
	},

	constructor: Template
};

function CreateHTML(editor) {
	const templateList = editor.options.get('templates');
	if (!templateList || templateList.length === 0) {
		console.warn('[SUNEDITOR.plugins.template.warn] To use the "template" plugin, please define the "templates" option.');
	}

	let list = '<div class="se-dropdown se-list-inner"><ul class="se-list-basic">';
	for (let i = 0, len = (templateList || []).length, t; i < len; i++) {
		t = templateList[i];
		list += '<li><button type="button" class="se-btn-list" data-value="' + i + '" title="' + t.name + '" aria-label="' + t.name + '">' + t.name + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-list-layer' }, list);
}

export default Template;
