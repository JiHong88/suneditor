import EditorDependency from '../../dependency';
import { domUtils } from '../../helper';

const FontSize = function (editor, target) {
	EditorDependency.call(this, editor);
	// plugin basic properties
	this.target = target;
	this.title = this.lang.fontSize;
	this.icon = '<span class="txt">' + this.lang.fontSize + '</span>' + this.icons.arrow_down;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.targetText = null;
	this.sizeList = menu.querySelectorAll('li button');
	this.currentSize = '';

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

FontSize.key = 'fontSize';
FontSize.type = 'dropdown';
FontSize.className = 'se-btn-select se-btn-tool-size';
FontSize.prototype = {
	/**
	 * @override core
	 */
	active: function (element) {
		if (!element) {
			domUtils.changeTxt(this.targetText, this.status.hasFocus ? this.options.get('__defaultFontSize') || this.editor.wwComputedStyle.fontSize : this.lang.fontSize);
		} else if (element.style && element.style.fontSize.length > 0) {
			domUtils.changeTxt(this.targetText, element.style.fontSize);
			return true;
		}

		return false;
	},

	/**
	 * @override dropdown
	 */
	on: function () {
		const sizeList = this.sizeList;
		const currentSize = this.targetText.textContent;

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
	 * @param {string} value font-size
	 */
	action: function (value) {
		if (value) {
			const newNode = domUtils.createElement('SPAN', { style: 'font-size: ' + value + ';' });
			this.format.applyTextStyle(newNode, ['font-size'], null, null);
		} else {
			this.format.applyTextStyle(null, ['font-size'], ['span'], true);
		}

		this.menu.dropdownOff();
	},

	/**
	 * @override core
	 */
	init: function () {
		this.targetText = this.target.querySelector('.txt');
	},

	constructor: FontSize
};

function OnClickMenu(e) {
	if (!/^BUTTON$/i.test(e.target.tagName)) return false;

	e.preventDefault();
	e.stopPropagation();

	this.action(e.target.getAttribute('data-value'));
}

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
