import EditorInjector from '../../injector';
import { domUtils } from '../../helper';

const Layout = function (editor) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.layout;
	this.icon = 'layout';

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.selectedIndex = -1;

	// init
	this.menu.initDropdownTarget(Layout, menu);
};

Layout.key = 'layout';
Layout.type = 'dropdown';
Layout.className = '';
Layout.prototype = {
	/**
	 * @override core
	 * @param {Element} target Target command button
	 */
	action: function (target) {
		const index = target.getAttribute('data-value') * 1;
		const temp = this.options.get('layouts')[(this.selectedIndex = index)];

		if (temp.html) {
			this.html.set(temp.html);
		} else {
			this.menu.dropdownOff();
			throw Error('[SUNEDITOR.layout.fail] cause : "layouts[i].html not found"');
		}

		this.menu.dropdownOff();
	},

	constructor: Layout
};

function CreateHTML(editor) {
	const layoutList = editor.options.get('layouts');
	if (!layoutList || layoutList.length === 0) {
		console.warn('[SUNEDITOR.plugins.layout.warn] To use the "layout" plugin, please define the "layouts" option.');
	}

	let list = '<div class="se-dropdown se-list-inner"><ul class="se-list-basic">';
	for (let i = 0, len = (layoutList || []).length, t; i < len; i++) {
		t = layoutList[i];
		list += '<li><button type="button" class="se-btn se-btn-list" data-value="' + i + '" title="' + t.name + '" aria-label="' + t.name + '">' + t.name + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-list-layer' }, list);
}

export default Layout;
