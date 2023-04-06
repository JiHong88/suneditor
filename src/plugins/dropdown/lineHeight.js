import EditorDependency from '../../dependency';
import { domUtils } from '../../helper';

const LineHeight = function (editor) {
	// plugin bisic properties
	EditorDependency.call(this, editor);
	this.title = this.lang.lineHeight;
	this.icon = 'line_height';

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.sizeList = menu.querySelectorAll('li button');
	this.currentSize = -1;

	// init
	this.menu.initDropdownTarget(LineHeight.key, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

LineHeight.key = 'lineHeight';
LineHeight.type = 'dropdown';
LineHeight.className = '';
LineHeight.prototype = {
	/**
	 * @override core
	 */
	active: function (element, target) {
		if (element && element.style && element.style.lineHeight.length > 0) {
			domUtils.addClass(target, 'active');
			return true;
		}

		domUtils.removeClass(target, 'active');
		return false;
	},

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

		this.editor.effectNode = null;
		this.history.push(false);
	},

	constructor: LineHeight
};

function OnClickMenu(e) {
	if (!/^BUTTON$/i.test(e.target.tagName)) return false;

	e.preventDefault();
	e.stopPropagation();

	this.action(e.target.getAttribute('data-value') || '');
}

function CreateHTML(editor) {
	const options = editor.options;
	const lang = editor.lang;
	const sizeList = !options.get('lineHeights')
		? [
				{ text: '1', value: 1 },
				{ text: '1.15', value: 1.15 },
				{ text: '1.5', value: 1.5 },
				{ text: '2', value: 2 }
		  ]
		: options.get('lineHeights');

	let list = '<div class="se-list-inner">' + '<ul class="se-list-basic">' + '<li><button type="button" class="default_value se-btn-list" title="' + lang.default + '" aria-label="' + lang.default + '">(' + lang.default + ')</button></li>';
	for (let i = 0, len = sizeList.length, size; i < len; i++) {
		size = sizeList[i];
		list += '<li><button type="button" class="se-btn-list" data-value="' + size.value + '" title="' + size.text + '" aria-label="' + size.text + '">' + size.text + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, list);
}

export default LineHeight;
