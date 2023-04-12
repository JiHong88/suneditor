import EditorInjector from '../../injector';
import { domUtils } from '../../helper';

const FormatBlock = function (editor) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.formats;
	this.icon = '<span class="txt">' + this.lang.formats + '</span>' + this.icons.arrow_down;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.formatList = menu.querySelectorAll('li button');
	this.currentFormat = '';

	// init
	this.menu.initDropdownTarget(FormatBlock.key, menu);
};

FormatBlock.key = 'formatBlock';
FormatBlock.type = 'dropdown';
FormatBlock.className = 'se-btn-select se-btn-tool-format';
FormatBlock.prototype = {
	/**
	 * @override core
	 */
	active: function (element, target) {
		let formatTitle = this.lang.formats;
		const targetText = target.querySelector('.txt');

		if (!element) {
			domUtils.changeTxt(targetText, formatTitle);
		} else if (this.format.isLine(element)) {
			const formatList = this.formatList;
			const nodeName = element.nodeName.toLowerCase();
			const className = (element.className.match(/(\s|^)__se__format__[^\s]+/) || [''])[0].trim();

			for (let i = 0, len = formatList.length, f; i < len; i++) {
				f = formatList[i];
				if (nodeName === f.getAttribute('data-value') && className === f.getAttribute('data-class')) {
					formatTitle = f.title;
					break;
				}
			}

			domUtils.changeTxt(targetText, formatTitle);
			targetText.setAttribute('data-value', nodeName);
			targetText.setAttribute('data-class', className);

			return true;
		}

		return false;
	},

	/**
	 * @override dropdown
	 */
	on: function (target) {
		const formatList = this.formatList;
		const targetText = target.querySelector('.txt');
		const currentFormat = (targetText.getAttribute('data-value') || '') + (targetText.getAttribute('data-class') || '');

		if (currentFormat !== this.currentFormat) {
			for (let i = 0, len = formatList.length, f; i < len; i++) {
				f = formatList[i];
				if (currentFormat === f.getAttribute('data-value') + f.getAttribute('data-class')) {
					domUtils.addClass(f, 'active');
				} else {
					domUtils.removeClass(f, 'active');
				}
			}

			this.currentFormat = currentFormat;
		}
	},

	/**
	 * @override core
	 * @param {Element} target Target command button
	 */
	action: function (target) {
		// "line"|"br-line"|"block"
		const command = target.getAttribute('data-command');
		const tag = target.firstChild;
		if (command === 'block') {
			this.format.applyBlock(tag);
		} else if (command === 'br-line') {
			this.format.setBrLine(tag);
		} else {
			this.format.setLine(tag);
		}

		this.menu.dropdownOff();
	},

	constructor: FormatBlock
};

function CreateHTML(editor) {
	const options = editor.options;
	const defaultFormats = ['p', 'div', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
	const formatList = !options.get('formats') || options.get('formats').length === 0 ? defaultFormats : options.get('formats');

	let list = '<div class="se-list-inner"><ul class="se-list-basic">';
	for (let i = 0, len = formatList.length, format, tagName, command, name, h, attrs, className; i < len; i++) {
		format = formatList[i];

		if (typeof format === 'string' && defaultFormats.indexOf(format) > -1) {
			tagName = format.toLowerCase();
			command = tagName === 'blockquote' ? 'block' : tagName === 'pre' ? 'br-line' : 'line';
			h = /^h/.test(tagName) ? tagName.match(/\d+/)[0] : '';
			name = editor.lang['tag_' + (h ? 'h' : tagName)] + h;
			className = '';
			attrs = '';
		} else {
			tagName = format.tag.toLowerCase();
			command = format.command;
			name = format.name || tagName;
			className = format.class;
			attrs = className ? ' class="' + className + '"' : '';
		}

		list += '<li>' + '<button type="button" class="se-btn-list" data-command="' + command + '" data-value="' + tagName + '" data-class="' + className + '" title="' + name + '" aria-label="' + name + '">' + '<' + tagName + attrs + '>' + name + '</' + tagName + '>' + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-format' }, list);
}

export default FormatBlock;
