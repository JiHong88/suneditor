import EditorInterface from '../../interface/editor';
import { domUtils } from '../../helper';

const lineHeight = function (editor, target) {
	// plugin bisic properties
	EditorInterface.call(this, editor);
	this.target = target;
	this.title = this.lang.toolbar.lineHeight;
	this.icon = this.icons.line_height;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.sizeList = menu.querySelectorAll('li button');
	this.currentSize = -1;

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

lineHeight.type = 'dropdown';
lineHeight.className = '';
lineHeight.prototype = {
	/**
	 * @override dropdown
	 */
	on: function () {
		const format = this.format.getLine(this.selection.getNode());
		const currentSize = !format ? '' : format.style.lineHeight + '';

		if (currentSize !== this.currentSize) {
			const sizeList = this.sizeList;
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
	 * @override core
	 * @param {string} value line height value
	 */
	action: function (value) {
		const formats = this.format.getLines();

		for (let i = 0, len = formats.length; i < len; i++) {
			formats[i].style.lineHeight = value;
		}

		this.menu.dropdownOff();

		// history stack
		this.history.push(false);
	},

	constructor: lineHeight
};

function OnClickMenu(e) {
	if (!/^BUTTON$/i.test(e.target.tagName)) return false;

	e.preventDefault();
	e.stopPropagation();

	this.action(e.target.getAttribute('data-value') || '');
}

function CreateHTML(editor) {
	const option = editor.options;
	const lang = editor.lang;
	const sizeList = !option.lineHeights
		? [
				{ text: '1', value: 1 },
				{ text: '1.15', value: 1.15 },
				{ text: '1.5', value: 1.5 },
				{ text: '2', value: 2 }
		  ]
		: option.lineHeights;

	let list = '<div class="se-list-inner">' + '<ul class="se-list-basic">' + '<li><button type="button" class="default_value se-btn-list" title="' + lang.toolbar.default + '" aria-label="' + lang.toolbar.default + '">(' + lang.toolbar.default + ')</button></li>';
	for (let i = 0, len = sizeList.length, size; i < len; i++) {
		size = sizeList[i];
		list += '<li><button type="button" class="se-btn-list" data-value="' + size.value + '" title="' + size.text + '" aria-label="' + size.text + '">' + size.text + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, list);
}

export default lineHeight;
