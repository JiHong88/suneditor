'use strict';

import EditorInterface from '../../interface/editor';
import { domUtils } from '../../helper';

const fontSize = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin basic properties
	this.target = target;
	this.title = this.lang.toolbar.fontSize;
	this.icon = '<span class="txt">' + this.lang.toolbar.fontSize + '</span>' + this.icons.arrow_down;

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

fontSize.type = 'dropdown';
fontSize.className = 'se-btn-select se-btn-tool-size';
fontSize.prototype = {
	/**
	 * @override core
	 */
	active: function (element) {
		if (!element) {
			domUtils.changeTxt(this.targetText, this.status.hasFocus ? this.options.__defaultFontSize || this.wwComputedStyle.fontSize : this.lang.toolbar.fontSize);
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

	constructor: fontSize
};

function OnClickMenu(e) {
	if (!/^BUTTON$/i.test(e.target.tagName)) return false;

	e.preventDefault();
	e.stopPropagation();

	this.action(e.target.getAttribute('data-value'));
}

function CreateHTML(editor) {
	const option = editor.options;
	const lang = editor.lang;
	const sizeList = !option.fontSize ? [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72] : option.fontSize;

	let list = '<div class="se-list-inner">' + '<ul class="se-list-basic">' + '<li><button type="button" class="default_value se-btn-list" title="' + lang.toolbar.default + '" aria-label="' + lang.toolbar.default + '">(' + lang.toolbar.default + ')</button></li>';
	for (let i = 0, unit = option.fontSizeUnit, len = sizeList.length, size; i < len; i++) {
		size = sizeList[i];
		list += '<li><button type="button" class="se-btn-list" data-value="' + size + unit + '" title="' + size + unit + '" aria-label="' + size + unit + '" style="font-size:' + size + unit + ';">' + size + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-font-size' }, list);
}

export default fontSize;
