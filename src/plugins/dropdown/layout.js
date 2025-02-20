import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

/**
 * @class
 * @description Layout Plugin, Apply layout to the entire editor.
 */
class Layout extends EditorInjector {
	static key = 'layout';
	static type = 'dropdown';
	static className = '';

	/**
	 * @constructor
	 * @param {EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions
	 * @param {Array<{name: string, html: string}>} pluginOptions.items - Layout list
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.layout;
		this.icon = 'layout';

		// members
		this.selectedIndex = -1;
		this.items = pluginOptions.items;

		// create HTML
		const menu = CreateHTML(this.items);

		// init
		this.menu.initDropdownTarget(Layout, menu);
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {?HTMLElement} target - The plugin's toolbar button element
	 */
	action(target) {
		const index = Number(target.getAttribute('data-value'));
		const temp = this.items[(this.selectedIndex = index)];

		if (temp.html) {
			this.html.set(temp.html);
		} else {
			this.menu.dropdownOff();
			throw Error('[SUNEDITOR.layout.fail] cause : "layouts[i].html not found"');
		}

		this.menu.dropdownOff();
	}
}

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
				<button type="button" class="se-btn se-btn-list" data-value="${i}" title="${t.name}" aria-label="${t.name}">
					${t.name}
				</button>
			</li>`;
	}

	list += /*html*/ `
		</ul>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-list-layer' }, list);
}

export default Layout;
