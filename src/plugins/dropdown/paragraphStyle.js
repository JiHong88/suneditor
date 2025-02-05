import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

/**
 * @class
 * @description A plugin to style lines using classes.
 * @param {object} editor editor core object
 * @param {object} pluginOptions
 * @param {Array.<string|{name: string, class: string, _class: string}>} pluginOptions.items - Paragraph item list
 * @example
 * use default paragraph styles
 * ['spaced', 'bordered', 'neon']
 * custom paragraph styles
 * [
  		{
			name: 'spaced',
			class: '__se__p-spaced',
			_class: ''
		},
		{
			name: 'bordered',
			class: '__se__p-bordered',
			_class: ''
		},
		 {
			name: 'neon',
			class: '__se__p-neon',
			_class: ''
		}
	]
 */
function ParagraphStyle(editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.paragraphStyle;
	this.icon = 'paragraph_style';

	// create HTML
	const menu = CreateHTML(editor, pluginOptions.items);

	// members
	this.classList = menu.querySelectorAll('li button');

	// init
	this.menu.initDropdownTarget(ParagraphStyle, menu);
}

ParagraphStyle.key = 'paragraphStyle';
ParagraphStyle.type = 'dropdown';
ParagraphStyle.className = '';
ParagraphStyle.prototype = {
	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 */
	on() {
		const paragraphList = this.classList;
		const currentFormat = this.format.getLine(this.selection.getNode());

		for (let i = 0, len = paragraphList.length; i < len; i++) {
			if (domUtils.hasClass(currentFormat, paragraphList[i].getAttribute('data-command'))) {
				domUtils.addClass(paragraphList[i], 'active');
			} else {
				domUtils.removeClass(paragraphList[i], 'active');
			}
		}
	},

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * Called when an item in the "dropdown" menu is clicked.
	 * @param {?Element} target - The plugin's toolbar button element
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
		const toggleClass = domUtils.hasClass(target, 'active') ? domUtils.removeClass : domUtils.addClass;
		for (let i = 0, len = selectedFormsts.length; i < len; i++) {
			toggleClass(selectedFormsts[i], value);
		}

		this.menu.dropdownOff();
		this.history.push(false);
	},

	constructor: ParagraphStyle
};

function CreateHTML({ lang }, items) {
	const defaultList = {
		spaced: {
			name: lang.menu_spaced,
			class: '__se__p-spaced',
			_class: ''
		},
		bordered: {
			name: lang.menu_bordered,
			class: '__se__p-bordered',
			_class: ''
		},
		neon: {
			name: lang.menu_neon,
			class: '__se__p-neon',
			_class: ''
		}
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

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-format' }, list);
}

export default ParagraphStyle;
