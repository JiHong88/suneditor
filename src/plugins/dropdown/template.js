import EditorDependency from '../../dependency';
import { domUtils } from '../../helper';

const Template = function (editor, target) {
	// plugin bisic properties
	EditorDependency.call(this, editor);
	this.target = target;
	this.title = this.lang.toolbar.template;
	this.icon = this.icons.template;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.selectedIndex = -1;

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

Template.key = 'template';
Template.type = 'dropdown';
Template.className = '';
Template.prototype = {
	/**
	 * @override core
	 * @param {number} index template menu index
	 */
	action: function (index) {
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

function OnClickMenu(e) {
	if (!/^BUTTON$/i.test(e.target.tagName)) return false;

	e.preventDefault();
	e.stopPropagation();

	this.action(e.target.getAttribute('data-value') * 1);
}

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
