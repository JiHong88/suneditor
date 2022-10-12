import EditorInterface from '../../interface';
import { domUtils } from '../../helper';

const FormatBlock = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin basic properties
	this.target = target;
	this.title = this.lang.toolbar.formats;
	this.icon = '<span class="txt">' + this.lang.toolbar.formats + '</span>' + this.icons.arrow_down;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.targetText = null;
	this.targetTooltip = null;
	this.formatList = menu.querySelectorAll('li button');
	this.currentFormat = '';

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

FormatBlock.key = 'formatBlock';
FormatBlock.type = 'dropdown';
FormatBlock.className = 'se-btn-select se-btn-tool-format';
FormatBlock.prototype = {
	/**
	 * @override core
	 */
	active: function (element) {
		let formatTitle = this.lang.toolbar.formats;
		const target = this.targetText;

		if (!element) {
			domUtils.changeTxt(target, formatTitle);
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

			domUtils.changeTxt(target, formatTitle);
			target.setAttribute('data-value', nodeName);
			target.setAttribute('data-class', className);

			return true;
		}

		return false;
	},

	/**
	 * @override dropdown
	 */
	on: function () {
		const formatList = this.formatList;
		const target = this.targetText;
		const currentFormat = (target.getAttribute('data-value') || '') + (target.getAttribute('data-class') || '');

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
	 * @param {"line"|"br-line"|"block"} command Format block command
	 * @param {Element} tag Command element
	 */
	action: function (command, tag) {
		if (command === 'block') {
			this.format.applyBlock(tag);
		} else if (command === 'br-line') {
			this.format.setBrLine(tag);
		} else {
			this.format.setLine(tag);
		}

		this.menu.dropdownOff();
	},

	/**
	 * @override core
	 */
	init: function () {
		this.targetText = this.target.querySelector('.txt');
		this.targetTooltip = this.target.parentNode.querySelector('.se-tooltip-text');
	},

	constructor: FormatBlock
};

function OnClickMenu(e) {
	e.preventDefault();
	e.stopPropagation();

	const target = domUtils.getCommandTarget(e.target);
	if (!target) return;

	this.action(target.getAttribute('data-command'), target.firstChild);
}

function CreateHTML(editor) {
	const option = editor.options;
	const lang_toolbar = editor.lang.toolbar;
	const defaultFormats = ['p', 'div', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
	const formatList = !option.formats || option.formats.length === 0 ? defaultFormats : option.formats;

	let list = '<div class="se-list-inner"><ul class="se-list-basic">';
	for (let i = 0, len = formatList.length, format, tagName, command, name, h, attrs, className; i < len; i++) {
		format = formatList[i];

		if (typeof format === 'string' && defaultFormats.indexOf(format) > -1) {
			tagName = format.toLowerCase();
			command = tagName === 'blockquote' ? 'block' : tagName === 'pre' ? 'br-line' : 'line';
			h = /^h/.test(tagName) ? tagName.match(/\d+/)[0] : '';
			name = lang_toolbar['tag_' + (h ? 'h' : tagName)] + h;
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
