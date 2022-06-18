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

const textStyle = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin bisic properties
	this.target = target;
	this.title = this.lang.toolbar.textStyle;
	this.icon = this.icons.text_style;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.styleList = menu.querySelectorAll('li button');

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

textStyle.type = 'dropdown';
textStyle.className = '';
textStyle.prototype = {
	/**
	 * @Override dropdown
	 */
	on: function () {
		const styleButtonList = this.styleList;
		const selectionNode = this.selection.getNode();

		for (let i = 0, len = styleButtonList.length, btn, data, active; i < len; i++) {
			btn = styleButtonList[i];
			data = btn.getAttribute('data-value').split(',');

			for (let v = 0, node, value; v < data.length; v++) {
				node = selectionNode;
				active = false;

				while (node && !this.format.isLine(node) && !this.component.is(node)) {
					if (node.nodeName.toLowerCase() === btn.getAttribute('data-command').toLowerCase()) {
						value = data[v];
						if (/^\./.test(value) ? domUtils.hasClass(node, value.replace(/^\./, '')) : !!node.style[value]) {
							active = true;
							break;
						}
					}
					node = node.parentNode;
				}

				if (!active) break;
			}

			active ? domUtils.addClass(btn, 'active') : domUtils.removeClass(btn, 'active');
		}
	},

	/**
	 * @override core
	 * @param {Element} tempElement text style template element
	 * @param {Element} targetElement current menu target
	 */
	action: function (tempElement, targetElement) {
		const checkStyles = tempElement.style.cssText.replace(/:.+(;|$)/g, ',').split(',');
		checkStyles.pop();

		const classes = tempElement.classList;
		for (let i = 0, len = classes.length; i < len; i++) {
			checkStyles.push('.' + classes[i]);
		}

		const newNode = domUtils.hasClass(targetElement, 'active') ? null : tempElement.cloneNode(false);
		const removeNodes = newNode ? null : [tempElement.nodeName];
		this.format.applyTextStyle(newNode, checkStyles, removeNodes, true);

		this.menu.dropdownOff();
	},

	constructor: textStyle
};

function OnClickMenu(e) {
	e.preventDefault();
	e.stopPropagation();

	let target = e.target;
	let command = null,
		tag = null;

	while (!command && !/UL/i.test(target.tagName)) {
		command = target.getAttribute('data-command');
		if (command) {
			tag = target.firstChild;
			break;
		}
		target = target.parentNode;
	}

	if (!command) return;

	this.action(tag, target);
}

function CreateHTML(editor) {
	const option = editor.options;
	const defaultList = {
		code: {
			name: editor.lang.menu.code,
			class: '__se__t-code',
			tag: 'code'
		},
		shadow: {
			name: editor.lang.menu.shadow,
			class: '__se__t-shadow',
			tag: 'span'
		}
	};
	const styleList = !option.textStyles ? editor._w.Object.keys(defaultList) : option.textStyles;

	let list = '<div class="se-list-inner"><ul class="se-list-basic">';
	for (let i = 0, len = styleList.length, t, tag, name, attrs, command, value, _class; i < len; i++) {
		t = styleList[i];
		(attrs = ''), (value = ''), (command = []);

		if (typeof t === 'string') {
			const editorCSSText = defaultList[t.toLowerCase()];
			if (!editorCSSText) continue;
			t = editorCSSText;
		}

		name = t.name;
		tag = t.tag || 'span';
		_class = t.class;

		attrs += ' class="' + t.class + '"';
		value += '.' + t.class.trim().replace(/\s+/g, ',.');
		command.push('class');

		value = value.replace(/,$/, '');

		list += '<li>' + '<button type="button" class="se-btn-list' + (_class ? ' ' + _class : '') + '" data-command="' + tag + '" data-value="' + value + '" title="' + name + '" aria-label="' + name + '">' + '<' + tag + attrs + '>' + name + '</' + tag + '>' + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-format' }, list);
}

export default textStyle;
