import EditorInterface from '../../interface/editor';
import { domUtils } from '../../helper';

const ParagraphStyle = function (editor, target) {
	// plugin bisic properties
	EditorInterface.call(this, editor);
	this.target = target;
	this.title = this.lang.toolbar.paragraphStyle;
	this.icon = this.icons.paragraph_style;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.classList = menu.querySelectorAll('li button');

	// init
	this.menu.initTarget(target, menu);
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

		// history stack
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
	const option = editor.options;
	const menuLang = editor.lang.menu;
	const defaultList = {
		spaced: {
			name: menuLang.spaced,
			class: '__se__p-spaced',
			_class: ''
		},
		bordered: {
			name: menuLang.bordered,
			class: '__se__p-bordered',
			_class: ''
		},
		neon: {
			name: menuLang.neon,
			class: '__se__p-neon',
			_class: ''
		}
	};
	const paragraphStyles = !option.paragraphStyles || option.paragraphStyles.length === 0 ? ['spaced', 'bordered', 'neon'] : option.paragraphStyles;

	let list = '<div class="se-list-inner"><ul class="se-list-basic">';
	for (let i = 0, len = paragraphStyles.length, p, name, attrs, _class; i < len; i++) {
		p = paragraphStyles[i];

		if (typeof p === 'string') {
			const editorCSSText = defaultList[p.toLowerCase()];
			if (!editorCSSText) continue;
			p = editorCSSText;
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
