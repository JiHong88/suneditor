import EditorInjector from '../../injector';
import { domUtils, converter } from '../../helper';

const FontSize = function (editor) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.fontSize;
	this.icon = '<span class="txt">' + this.lang.fontSize + '</span>' + this.icons.arrow_down;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.sizeList = menu.querySelectorAll('li button');
	this.currentSize = '';

	// init
	this.menu.initDropdownTarget(FontSize, menu);
};

FontSize.key = 'fontSize';
FontSize.type = 'dropdown';
FontSize.className = 'se-btn-select se-btn-tool-size';
FontSize.prototype = {
	/**
	 * @override core
	 */
	active: function (element, target) {
		const targetText = target.querySelector('.txt');
		if (!element) {
			domUtils.changeTxt(targetText, this.status.hasFocus ? converter.fontSize(this.options.get('fontSizeUnit'), this.editor.frameContext.get('wwComputedStyle').fontSize) : this.lang.fontSize);
		} else if (element.style && element.style.fontSize.length > 0) {
			domUtils.changeTxt(targetText, converter.fontSize(this.options.get('fontSizeUnit'), element.style.fontSize));
			return true;
		}

		return false;
	},

	/**
	 * @override dropdown
	 */
	on: function (target) {
		const sizeList = this.sizeList;
		const currentSize = target.querySelector('.txt').textContent;

		if (currentSize !== this.currentSize) {
			for (let i = 0, len = sizeList.length; i < len; i++) {
				if (currentSize === sizeList[i].getAttribute('data-value')) {
					domUtils.addClass(sizeList[i], 'active');
				} else {
					domUtils.removeClass(sizeList[i], 'active');
				}
			}

			this.currentSize = currentSize;
		}
	},

	/**
	 * @override
	 * @param {Element} target Target command button
	 */
	action: function (target) {
		const value = target.getAttribute('data-value');
		if (value) {
			const newNode = domUtils.createElement('SPAN', { style: 'font-size: ' + value + ';' });
			this.format.applyTextStyle(newNode, ['font-size'], null, null);
		} else {
			this.format.applyTextStyle(null, ['font-size'], ['span'], true);
		}

		this.menu.dropdownOff();
	},

	constructor: FontSize
};

function CreateHTML(editor) {
	const options = editor.options;
	const lang = editor.lang;
	const sizeList = !options.get('fontSize') ? [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72] : options.get('fontSize');

	let list = '<div class="se-list-inner">' + '<ul class="se-list-basic">' + '<li><button type="button" class="default_value se-btn-list" title="' + lang.default + '" aria-label="' + lang.default + '">(' + lang.default + ')</button></li>';
	for (let i = 0, unit = options.get('fontSizeUnit'), len = sizeList.length, size; i < len; i++) {
		size = sizeList[i];
		list += '<li><button type="button" class="se-btn-list" data-value="' + size + unit + '" title="' + size + unit + '" aria-label="' + size + unit + '" style="font-size:' + size + unit + ';">' + size + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-font-size' }, list);
}

export default FontSize;
