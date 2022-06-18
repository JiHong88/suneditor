'use strict';

import { domUtils } from '../helper';
import EditorInterface from '../interface/editor';

const selectMenu = function (editor, forms) {
	// plugin bisic properties
	EditorInterface.call(this, editor);

	// members
	this.form = forms;
	this.items = [];
	this.menus = [];
	this.index = -1;
	this.item = null;
	this._clickMethod = null;
    this._bindClose = null;

	// init
	this.eventManager.addEvent(this.form, 'mousedown', OnMousedown_list);
	this.eventManager.addEvent(this.form, 'mousemove', OnMouseMove_list.bind(this));
	this.eventManager.addEvent(this.form, 'click', OnClick_list.bind(this));
};

selectMenu.prototype = {
	create: function (items, html) {
		this.form.innerHTML = '<ul>' + html + '</ul>';
		this.items = items;
		this.menus = this.form.querySelectorAll('li');
	},

	moveItem: function (num) {
		domUtils.removeClass(this.form, '__se_select-menu-mouse-move');
		num = this.index + num;
		const len = this.menus.length;
		const selectIndex = (this.index = num >= len ? 0 : num < 0 ? len - 1 : num);

		for (let i = 0; i < len; i++) {
			if (i === selectIndex) {
				domUtils.addClass(this.menus[i], 'active');
			} else {
				domUtils.removeClass(this.menus[i], 'active');
			}
		}

		this.item = this.items[selectIndex];
	},

	getItem: function (index) {
		index = !index || index < 0 ? this.index : index;
		return this.items[index];
	},

	on: function (clickMethod) {
		this._clickMethod = clickMethod;
	},

	open: function (positionHandler) {
        if (this._bindClose) {
			this.eventManager.removeGlobalEvent('keydown', this._bindClose);
			this._bindClose = null;
		}
        
        this._bindClose = function (e) {
			if (!/27/.test(e.keyCode)) return;
			e.stopPropagation();
			this.close();
		}.bind(this);
		this.eventManager.addGlobalEvent('keydown', this._bindClose, true);

		const form = this.form;
		form.style.visibility = 'hidden';
		form.style.display = 'block';
		positionHandler(form);
		form.style.visibility = '';
	},

	close: function () {
        if (this._bindClose) {
			this.eventManager.removeGlobalEvent('keydown', this._bindClose);
			this._bindClose = null;
		}

		this.form.style.display = 'none';
		this.init();
	},

	init: function () {
		this.items = [];
		this.menus = [];
		this.index = -1;
		this.item = null;
	},

	constructor: selectMenu
};

function OnMousedown_list(e) {
	e.preventDefault();
	e.stopPropagation();
}

function OnMouseMove_list(e) {
	domUtils.addClass(this.form, '__se_select-menu-mouse-move');
	const index = e.target.getAttribute('data-index');
	if (!index) return;
	this.index = index * 1;
}

function OnClick_list(e) {
	const index = e.target.getAttribute('data-index');
	if (!index) return;
	this._clickMethod(this.items[index]);
}

export default selectMenu;
