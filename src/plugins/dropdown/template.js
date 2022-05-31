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

const template = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin bisic properties
	this.target = target;
	this.title = this.lang.toolbar.template;
	this.icon = this.icons.template;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.selectedIndex = -1;

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

template.type = 'dropdown';
template.className = '';
template.prototype = {
	/**
	 * @override core
	 * @param {number} index template menu index
	 */
	action: function (index) {
		const temp = this.options.templates[(this.selectedIndex = index)];

		if (temp.html) {
			this.editor.setContent(temp.html);
		} else {
			this.menu.dropdownOff();
			throw Error('[SUNEDITOR.template.fail] cause : "templates[i].html not found"');
		}

		this.menu.dropdownOff();
	},

	constructor: template
};

function OnClickMenu(e) {
	if (!/^BUTTON$/i.test(e.target.tagName)) return false;

	e.preventDefault();
	e.stopPropagation();

	this.action(e.target.getAttribute('data-value') * 1);
}

function CreateHTML(editor) {
	const templateList = editor.options.templates;
	if (!templateList || templateList.length === 0) {
		throw Error('[SUNEDITOR.plugins.template.fail] To use the "template" plugin, please define the "templates" option.');
	}

	let list = '<div class="se-dropdown se-list-inner">' + '<ul class="se-list-basic">';
	for (let i = 0, len = templateList.length, t; i < len; i++) {
		t = templateList[i];
		list += '<li><button type="button" class="se-btn-list" data-value="' + i + '" title="' + t.name + '" aria-label="' + t.name + '">' + t.name + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-list-layer' }, list);
}

export default template;
