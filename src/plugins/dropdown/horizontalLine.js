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

const horizontalLine = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin bisic properties
	this.target = target;
	this.title = this.lang.toolbar.horizontalLine;
	this.icon = this.icons.horizontal_line;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.currentHR = null;

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

horizontalLine.type = 'dropdown';
horizontalLine.className = '';
horizontalLine.prototype = {
	/**
	 * @override core
	 */
	active: function (element) {
		if (!element) {
			if (domUtils.hasClass(this.currentHR, 'on')) {
				this.menu.controllerOff();
			}
		} else if (/HR/i.test(element.nodeName)) {
			this.currentHR = element;
			if (!domUtils.hasClass(element, 'on')) {
				domUtils.addClass(element, 'on');
				this.menu.controllerOn('hr', domUtils.removeClass.bind(domUtils, element, 'on'));
			}
			return true;
		}

		return false;
	},

	/**
	 * @override core
	 * @param {Element} referNode HR element
	 */
	action: function (referNode) {
		this.editor.focus();
		const oNode = this.component.insert(referNode.cloneNode(false), false, true, false);

		if (oNode) {
			this.selection.setRange(oNode, 0, oNode, 0);
			this.menu.dropdownOff();
		}
	},

	constructor: horizontalLine
};

function OnClickMenu(e) {
	e.preventDefault();
	e.stopPropagation();

	let target = e.target;
	let command = target.getAttribute('data-command');

	while (!command && !/UL/i.test(target.tagName)) {
		target = target.parentNode;
		command = target.getAttribute('data-command');
	}

	if (!command) return;

	this.action(target.firstElementChild);
}

function CreateHTML(editor) {
	const lang = editor.lang;
	const items = editor.options.hrItems || [
		{ name: lang.toolbar.hr_solid, class: '__se__solid' },
		{ name: lang.toolbar.hr_dashed, class: '__se__dashed' },
		{ name: lang.toolbar.hr_dotted, class: '__se__dotted' }
	];

	let list = '';
	for (let i = 0, len = items.length; i < len; i++) {
		list +=
			'<li>' +
			'<button type="button" class="se-btn-list" data-command="horizontalLine" data-value="' +
			items[i].class +
			'" title="' +
			items[i].name +
			'" aria-label="' +
			items[i].name +
			'">' +
			'<hr' +
			(items[i].class ? ' class="' + items[i].class + '"' : '') +
			(items[i].style ? ' style="' + items[i].style + '"' : '') +
			'/>' +
			'</button>' +
			'</li>';
	}

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-line' }, '<div class="se-list-inner">' + '<ul class="se-list-basic">' + list + '</ul>' + '</div>');
}

export default horizontalLine;
