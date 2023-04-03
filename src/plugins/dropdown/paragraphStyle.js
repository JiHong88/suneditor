import EditorDependency from '../../dependency';
import { domUtils } from '../../helper';

const ParagraphStyle = function (editor) {
	// plugin bisic properties
	EditorDependency.call(this, editor);
	this.title = this.lang.paragraphStyle;
	this.icon = this.icons.paragraph_style;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.classList = menu.querySelectorAll('li button');

	// init
	this.menu.initDropdownTarget(ParagraphStyle.key, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

ParagraphStyle.key = 'paragraphStyle';
ParagraphStyle.type = 'dropdown';
ParagraphStyle.className = '';
ParagraphStyle.prototype = {
	/**
	 * @override dropdown
	 */
	on: function () {
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
	 * @override core
	 * @param {string} value paragraph className
	 * @param {Element} targetElement current menu target
	 */
	action: function (value, targetElement) {
		let selectedFormsts = this.format.getLines();
		if (selectedFormsts.length === 0) {
			this.selection.getRangeAndAddLine(this.selection.getRange(), null);
			selectedFormsts = this.format.getLines();
			if (selectedFormsts.length === 0) return;
		}

		// change format class
		const toggleClass = domUtils.hasClass(targetElement, 'active') ? domUtils.removeClass : domUtils.addClass;
		for (let i = 0, len = selectedFormsts.length; i < len; i++) {
			toggleClass(selectedFormsts[i], value);
		}

		this.menu.dropdownOff();
		this.history.push(false);
	},

	constructor: ParagraphStyle
};

function OnClickMenu(e) {
	e.preventDefault();
	e.stopPropagation();

	const target = domUtils.getCommandTarget(e.target);
	if (!target) return;

	this.action(target.getAttribute('data-command'), target);
}

function CreateHTML(editor) {
	const options = editor.options;
	const defaultList = {
		spaced: {
			name: editor.lang.menu_spaced,
			class: '__se__p-spaced',
			_class: ''
		},
		bordered: {
			name: editor.lang.menu_bordered,
			class: '__se__p-bordered',
			_class: ''
		},
		neon: {
			name: editor.lang.menu_neon,
			class: '__se__p-neon',
			_class: ''
		}
	};
	const paragraphStyles = !options.get('paragraphStyles') || options.get('paragraphStyles').length === 0 ? ['spaced', 'bordered', 'neon'] : options.get('paragraphStyles');

	let list = '<div class="se-list-inner"><ul class="se-list-basic">';
	for (let i = 0, len = paragraphStyles.length, p, name, attrs, _class; i < len; i++) {
		p = paragraphStyles[i];

		if (typeof p === 'string') {
			const cssText = defaultList[p.toLowerCase()];
			if (!cssText) continue;
			p = cssText;
		}

		name = p.name;
		attrs = p.class ? ' class="' + p.class + '"' : '';
		_class = p._class;

		list += '<li>' + '<button type="button" class="se-btn-list' + (_class ? ' ' + _class : '') + '" data-command="' + p.class + '" title="' + name + '" aria-label="' + name + '">' + '<div' + attrs + '>' + name + '</div>' + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-format' }, list);
}

export default ParagraphStyle;
