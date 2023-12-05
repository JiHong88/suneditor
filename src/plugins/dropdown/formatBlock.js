import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

const FormatBlock = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.formats;
	this.inner = '<span class="txt">' + this.lang.formats + '</span>' + this.icons.arrow_down;

	// create HTML
	const menu = CreateHTML(editor, pluginOptions.items);

	// members
	this.formatList = menu.querySelectorAll('li button');
	this.currentFormat = '';

	// init
	this.menu.initDropdownTarget(FormatBlock, menu);
};

FormatBlock.key = 'formatBlock';
FormatBlock.type = 'dropdown';
FormatBlock.className = 'se-btn-select se-btn-tool-format';
FormatBlock.prototype = {
	/**
	 * @override core
	 */
	active(element, target) {
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
	on(target) {
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
	action(target) {
		// "line"|"br-line"|"block"
		const command = target.getAttribute('data-command');
		const tag = target.firstElementChild;
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

function CreateHTML({ lang }, items) {
	const defaultFormats = ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
	const formatList = !items || items.length === 0 ? defaultFormats : items;

	let list = /*html*/ `
	<div class="se-list-inner">
		<ul class="se-list-basic">`;

	for (let i = 0, len = formatList.length, format, tagName, command, name, h, attrs, className; i < len; i++) {
		format = formatList[i];

		if (typeof format === 'string' && defaultFormats.includes(format)) {
			tagName = format.toLowerCase();
			command = tagName === 'blockquote' ? 'block' : tagName === 'pre' ? 'br-line' : 'line';
			h = /^h/.test(tagName) ? tagName.match(/\d+/)[0] : '';
			name = lang['tag_' + (h ? 'h' : tagName)] + h;
			className = '';
			attrs = '';
		} else {
			tagName = format.tag.toLowerCase();
			command = format.command;
			name = format.name || tagName;
			className = format.class;
			attrs = className ? ' class="' + className + '"' : '';
		}

		list += /*html*/ `
			<li>
				<button type="button" class="se-btn se-btn-list" data-command="${command}" data-value="${tagName}" data-class="${className}" title="${name}" aria-label="${name}">
					<${tagName}${attrs}>${name}</${tagName}>
				</button>
			</li>`;
	}
	list += /*html*/ `
		</ul>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-format' }, list);
}

export default FormatBlock;
