import EditorInjector from '../../editorInjector';
import { dom } from '../../helper';

/**
 * @typedef {Object} ParagraphStylePluginOptions
 * @property {Array<string|{name: string, class: string, _class: string}>} [items] - Paragraph item list
 * @example
 * use default paragraph styles
 * ['spaced', 'bordered', 'neon']
 * custom paragraph styles
 * [
 *   { name: 'spaced', class: '__se__p-spaced', _class: '' },
 *   { name: 'bordered', class: '__se__p-bordered', _class: '' },
 *   { name: 'neon', class: '__se__p-neon', _class: '' }
 * ]
 */

/**
 * @class
 * @description A plugin to style lines using classes.
 */
class ParagraphStyle extends EditorInjector {
	static key = 'paragraphStyle';
	static type = 'dropdown';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {ParagraphStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.paragraphStyle;
		this.icon = 'paragraph_style';

		// create HTML
		const menu = CreateHTML(editor, pluginOptions.items);

		// members
		this.classList = menu.querySelectorAll('li button');

		// init
		this.menu.initDropdownTarget(ParagraphStyle, menu);
	}

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 */
	on() {
		const paragraphList = this.classList;
		const currentFormat = this.format.getLine(this.selection.getNode());

		for (let i = 0, len = paragraphList.length; i < len; i++) {
			if (dom.utils.hasClass(currentFormat, paragraphList[i].getAttribute('data-command'))) {
				dom.utils.addClass(paragraphList[i], 'active');
			} else {
				dom.utils.removeClass(paragraphList[i], 'active');
			}
		}
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 */
	action(target) {
		const value = target.getAttribute('data-command');
		let selectedFormsts = this.format.getLines();
		if (selectedFormsts.length === 0) {
			this.selection.getRangeAndAddLine(this.selection.getRange(), null);
			selectedFormsts = this.format.getLines();
			if (selectedFormsts.length === 0) return;
		}

		// change format class
		const toggleClass = dom.utils.hasClass(target, 'active') ? dom.utils.removeClass : dom.utils.addClass;
		for (let i = 0, len = selectedFormsts.length; i < len; i++) {
			toggleClass(selectedFormsts[i], value);
		}

		this.menu.dropdownOff();
		this.history.push(false);
	}
}

function CreateHTML({ lang }, items) {
	const defaultList = {
		spaced: {
			name: lang.menu_spaced,
			class: '__se__p-spaced',
			_class: '',
		},
		bordered: {
			name: lang.menu_bordered,
			class: '__se__p-bordered',
			_class: '',
		},
		neon: {
			name: lang.menu_neon,
			class: '__se__p-neon',
			_class: '',
		},
	};
	const paragraphStyles = !items || items.length === 0 ? ['spaced', 'bordered', 'neon'] : items;

	let list = /*html*/ `
	<div class="se-list-inner">
		<ul class="se-list-basic">`;

	for (let i = 0, len = paragraphStyles.length, p, name, attrs, _class; i < len; i++) {
		p = paragraphStyles[i];

		if (typeof p === 'string') {
			const cssText = defaultList[p.toLowerCase()];
			if (!cssText) continue;
			p = cssText;
		}

		name = p.name;
		attrs = p.class ? ` class="${p.class}"` : '';
		_class = p._class;

		list += /*html*/ `
			<li>
				<button type="button" class="se-btn se-btn-list${_class ? ' ' + _class : ''}" data-command="${p.class}" title="${name}" aria-label="${name}">
					<div${attrs}>${name}</div>
				</button>
			</li>`;
	}
	list += /*html*/ `
		</ul>
	</div>`;

	return dom.utils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-format' }, list);
}

export default ParagraphStyle;
