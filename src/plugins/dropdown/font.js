/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 Yi JiHong.
 * MIT license.
 */
'use strict';

import domUtils from '../../helper/domUtils';
import EditorInterface from '../../interface/editor';

const font = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin basic properties
	this.target = target;
	this.title = this.lang.toolbar.font;
	this.icon = '<span class="txt">' + this.lang.toolbar.font + '</span>' + this.icons.arrow_down;

	// create HTML
	const menu = CreateHTML(editor);
	const commandArea = menu.querySelector('.se-list-inner');

	// members
	this.targetText = null;
	this.targetTooltip = null;
	this.currentFont = '';
	this.fontList = menu.querySelectorAll('ul li button');

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(commandArea, 'click', OnClickMenu.bind(this));
};

font.type = 'dropdown';
font.className = 'se-btn-select se-btn-tool-font';
font.prototype = {
	/**
	 * @Override core
	 */
	active: function (element) {
		const target = this.targetText;
		const tooltip = this.targetTooltip;

		if (!element) {
			const font = this.status.hasFocus ? this.wwComputedStyle.fontFamily : this.lang.toolbar.font;
			domUtils.changeTxt(target, font);
			domUtils.changeTxt(tooltip, this.status.hasFocus ? this.lang.toolbar.font + (font ? ' (' + font + ')' : '') : font);
		} else if (element.style && element.style.fontFamily.length > 0) {
			const selectFont = element.style.fontFamily.replace(/["']/g, '');
			domUtils.changeTxt(target, selectFont);
			domUtils.changeTxt(tooltip, this.lang.toolbar.font + ' (' + selectFont + ')');
			return true;
		}

		return false;
	},

	/**
	 * @Override dropdown
	 */
	on: function () {
		const fontList = this.fontList;
		const currentFont = this.targetText.textContent;

		if (currentFont !== this.currentFont) {
			for (let i = 0, len = fontList.length; i < len; i++) {
				if (currentFont === fontList[i].getAttribute('data-value')) {
					domUtils.addClass(fontList[i], 'active');
				} else {
					domUtils.removeClass(fontList[i], 'active');
				}
			}

			this.currentFont = currentFont;
		}
	},

	/**
	 * @override core
	 * @param {string} value font
	 */
	action: function (value) {
		if (value) {
			const newNode = domUtils.createElement('SPAN', { style: 'font-family: ' + value + ';' });
			this.format.applyTextStyle(newNode, ['font-family'], null, null);
		} else {
			this.format.applyTextStyle(null, ['font-family'], ['span'], true);
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

	constructor: font
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
	const fontList = !option.font ? ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'] : option.font;

	let list = '<div class="se-list-inner">' + '<ul class="se-list-basic">' + '<li><button type="button" class="default_value se-btn-list" title="' + lang.toolbar.default + '" aria-label="' + lang.toolbar.default + '">(' + lang.toolbar.default + ')</button></li>';
	for (let i = 0, len = fontList.length, font, text; i < len; i++) {
		font = fontList[i];
		text = font.split(',')[0];
		list += '<li><button type="button" class="se-btn-list" data-value="' + font + '" data-txt="' + text + '" title="' + text + '" aria-label="' + text + '" style="font-family:' + font + ';">' + text + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-font-family' }, list);
}

export default font;
