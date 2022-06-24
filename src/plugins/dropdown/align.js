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

const align = function (editor, target) {
	// plugin bisic properties
	EditorInterface.call(this, editor);
	this.target = target;
	this.title = this.lang.toolbar.align;
	this.icon = this.options._rtl ? this.icons.align_right : this.icons.align_left;

	// create HTML
	const menu = CreateHTML(editor, !editor.options._rtl);
	const commandArea = (this._itemMenu = menu.querySelector('ul'));

	// members
	this.currentAlign = '';
	this.defaultDir = editor.options._rtl ? 'right' : 'left';
	this.alignIcons = {
		justify: editor.icons.align_justify,
		left: editor.icons.align_left,
		right: editor.icons.align_right,
		center: editor.icons.align_center
	};
	this.alignList = commandArea.querySelectorAll('li button');

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(commandArea, 'click', OnClickMenu.bind(this));
};

align.type = 'dropdown';
align.className = '';
align.prototype = {
	/**
	 * @override core
	 * @param {Node} element Selection node.
	 * @returns {boolean}
	 */
	active: function (element) {
		const targetButton = this.target;
		const target = targetButton.firstElementChild;

		if (!element) {
			domUtils.changeElement(target, this.alignIcons[this.defaultDir]);
			targetButton.removeAttribute('data-focus');
		} else if (this.format.isLine(element)) {
			const textAlign = element.style.textAlign;
			if (textAlign) {
				domUtils.changeElement(target, this.alignIcons[textAlign] || this.alignIcons[this.defaultDir]);
				targetButton.setAttribute('data-focus', textAlign);
				return true;
			}
		}

		return false;
	},

	/**
	 * @override dropdown
	 */
	on: function () {
		const alignList = this.alignList;
		const currentAlign = this.target.getAttribute('data-focus') || this.defaultDir;

		if (currentAlign !== this.currentAlign) {
			for (let i = 0, len = alignList.length; i < len; i++) {
				if (currentAlign === alignList[i].getAttribute('data-command')) {
					domUtils.addClass(alignList[i], 'active');
				} else {
					domUtils.removeClass(alignList[i], 'active');
				}
			}

			this.currentAlign = currentAlign;
		}
	},

	/**
	 * @override core
	 * @param {"rtl"|"ltr"} dir Direction
	 */
	setDir: function (dir) {
		const _dir = dir === 'rtl' ? 'right' : 'left';
		if (this.defaultDir === _dir) return;

		this.defaultDir = _dir;
		const leftBtn = this._itemMenu.querySelector('[data-command="left"]');
		const rightBtn = this._itemMenu.querySelector('[data-command="right"]');
		if (leftBtn && rightBtn) {
			const lp = leftBtn.parentElement;
			const rp = rightBtn.parentElement;
			lp.appendChild(rightBtn);
			rp.appendChild(leftBtn);
		}
	},

	/**
	 * @override core
	 * @param {"left"|"right"|"center"|"justify"} value
	 * @returns
	 */
	action: function (value) {
		if (!value) return;

		const defaultDir = this.defaultDir;
		const selectedFormsts = this.format.getLines();
		for (let i = 0, len = selectedFormsts.length; i < len; i++) {
			domUtils.setStyle(selectedFormsts[i], 'textAlign', value === defaultDir ? '' : value);
		}

		this.editor.effectNode = null;
		this.menu.dropdownOff();
		this.editor.focus();

		// history stack
		this.history.push(false);
	},

	constructor: align
};

function OnClickMenu(e) {
	e.preventDefault();
	e.stopPropagation();

	const target = domUtils.getCommandTarget(e.target);
	if (!target) return;

	this.action(target.getAttribute('data-command'));
}

function CreateHTML(core) {
	const lang = core.lang;
	const icons = core.icons;
	const alignItems = core.options.alignItems;

	let html = '';
	for (let i = 0, item, text; i < alignItems.length; i++) {
		item = alignItems[i];
		text = lang.toolbar['align' + item.charAt(0).toUpperCase() + item.slice(1)];
		html += '<li>' + '<button type="button" class="se-btn-list" data-command="' + item + '" title="' + text + '" aria-label="' + text + '">' + '<span class="se-list-icon">' + icons['align_' + item] + '</span>' + text + '</button>' + '</li>';
	}

	return domUtils.createElement(
		'div',
		{
			class: 'se-dropdown se-list-layer se-list-align'
		},
		'<div class="se-list-inner">' + '<ul class="se-list-basic">' + html + '</ul>' + '</div>'
	);
}

export default align;
