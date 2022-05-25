/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 Yi JiHong.
 * MIT license.
 */
'use strict';

import EditorInterface from '../../interface/editor';
import { domUtils } from '../../helper';

const list = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin bisic properties
	this.target = target;
	this.title = this.lang.toolbar.list;
	this.icon = this.icons.list_number;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.listItems = menu.querySelectorAll('li button');
	this.currentList = '';
	this.icons = {
		bullets: editor.icons.list_bullets,
		number: editor.icons.list_number
	};

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

list.type = 'dropdown';
list.className = '';
list.prototype = {
	/**
	 * @Override core
	 */
	active: function (element) {
		const icon = this.target.firstElementChild;

		if (domUtils.isList(element)) {
			const nodeName = element.nodeName;
			this.target.setAttribute('data-focus', nodeName);
			domUtils.addClass(this.target, 'active');

			if (/UL/i.test(nodeName)) {
				domUtils.changeElement(icon, this.icons.bullets);
			} else {
				domUtils.changeElement(icon, this.icons.number);
			}

			return true;
		} else {
			this.target.removeAttribute('data-focus');
			domUtils.changeElement(icon, this.icons.number);
			domUtils.removeClass(this.target, 'active');
		}

		return false;
	},

	/**
	 * @override dropdown
	 */
	on: function () {
		const currentList = this.target.getAttribute('data-focus') || '';

		if (currentList !== this.currentList) {
			const list = this.listItems;
			for (let i = 0, len = list.length; i < len; i++) {
				if (currentList === list[i].getAttribute('data-command')) {
					domUtils.addClass(list[i], 'active');
				} else {
					domUtils.removeClass(list[i], 'active');
				}
			}

			this.currentList = currentList;
		}
	},

	/**
	 * @override core
	 * @param {"bullet"|"numbered"} command List type
	 */
	action: function (command, type) {
		const range = this.format.applyList(command + ':' + type, null, false);
		if (range) this.selection.setRange(range.sc, range.so, range.ec, range.eo);

		this.menu.dropdownOff();

		// history stack
		this.history.push(false);
	},

	constructor: list
};

function OnClickMenu(e) {
	e.preventDefault();
	e.stopPropagation();

	let target = e.target;
	let command, value;

	while (!command && !/^UL$/i.test(target.tagName)) {
		command = target.getAttribute('data-command');
		value = target.getAttribute('data-value');
		target = target.parentNode;
	}

	if (!command) return;

	this.action(command, value || '');
}

function CreateHTML(editor) {
	const lang = editor.lang;
	const html =
		'<div class="se-list-inner">' +
		'<ul class="se-list-basic">' +
		'<li><button type="button" class="se-btn-list se-tooltip" data-command="bullet" title="' +
		lang.toolbar.orderList +
		'" aria-label="' +
		lang.toolbar.orderList +
		'">' +
		editor.icons.list_number +
		'</button></li>' +
		'<li><button type="button" class="se-btn-list se-tooltip" data-command="numbered" title="' +
		lang.toolbar.unorderList +
		'" aria-label="' +
		lang.toolbar.unorderList +
		'">' +
		editor.icons.list_bullets +
		'</button></li>' +
		'</ul>' +
		'</div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, html);
}

export default list;
