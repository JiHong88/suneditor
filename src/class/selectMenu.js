'use strict';

import CoreInterface from '../interface/_core';
import { domUtils } from '../helper';

const SelectMenu = function (inst, checkType) {
	// plugin bisic properties
	CoreInterface.call(this, inst.editor);

	// members
	this.form = null;
	this.items = [];
	this.menus = [];
	this.index = -1;
	this.item = null;
	this.checkType = !!checkType;
	this._refer = null;
	this._selectMethod = null;
	this._bindClose_key = null;
	this._bindClose_mousedown = null;
	this._bindClose_click = null;
	this._closeSignal = false;
	this.__events = [];
	this.__eventHandlers = [OnMousedown_list, OnMouseMove_list.bind(this), OnClick_list.bind(this), OnKeyDown_refer.bind(this)];
	this.__globalEventHandlers = [CloseListener_key.bind(this), CloseListener_mousedown.bind(this), CloseListener_click.bind(this)];
};

SelectMenu.prototype = {
	create: function (items, key) {
		let html = '';
		for (let i = 0, len = items.length; i < len; i++) {
			html += '<li class="se-select-item" data-index="' + i + '">' + (key ? items[i][key] : typeof items[i] === 'string' ? items[i] : items[i].outerHTML) + '</li>';
		}

		this.items = items;
		this.form.innerHTML = '<ul class="se-list-basic se-list-checked"">' + html + '</ul>';
		this.menus = this.form.querySelectorAll('li');
	},

	on: function (referElement, selectMethod) {
		this._refer = referElement;
		this._selectMethod = selectMethod;
		this.form = domUtils.createElement('DIV', { class: 'se-select-menu se-list-inner' });
		referElement.parentNode.insertBefore(this.form, referElement);
	},

	open: function (position) {
		this.__addEvents();
		this.__addGlobalEvent();
		this._setPosition(position || 'bottom');
	},

	close: function () {
		if (this.form) this.form.style.display = 'none';
		this._init();
	},

	getItem: function (index) {
		return this.items[index];
	},

	_init: function () {
		this.__removeEvents();
		this.__removeGlobalEvent();
		this.index = -1;
		this.item = null;
	},

	_moveItem: function (num) {
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

	_setPosition: function (position) {
		const form = this.form;
		const target = this._refer;
		form.style.visibility = 'hidden';
		form.style.display = 'block';

		if (position === 'bottom') {
			form.style.top = target.offsetHeight + 1 + 'px';
		} else if (position === 'left') {
			if (!this.options._rtl) form.style.left = target.offsetLeft + target.offsetWidth + 1 + 'px';
			else form.style.left = target.offsetLeft - form.offsetWidth - 1 + 'px';
			form.style.top = target.offsetTop + target.offsetHeight / 2 - form.offsetHeight / 2 + 'px';
		}

		form.style.visibility = '';
	},

	_select: function (index) {
		if (this.checkType) domUtils.toggleClass(this.menus[index], 'se-checked');
		this._selectMethod(this.getItem(index));
	},

	__addEvents: function () {
		this.__removeEvents();
		this.__events = this.__eventHandlers;
		this.form.addEventListener('mousedown', this.__events[0]);
		this.form.addEventListener('mousemove', this.__events[1]);
		this.form.addEventListener('click', this.__events[2]);
		this._refer.addEventListener('keydown', this.__events[3]);
	},

	__removeEvents: function () {
		if (this.__events.length === 0) return;
		this.form.removeEventListener('mousedown', this.__events[0]);
		this.form.removeEventListener('mousemove', this.__events[1]);
		this.form.removeEventListener('click', this.__events[2]);
		this._refer.removeEventListener('keydown', this.__events[3]);
		this.__events = [];
	},

	__addGlobalEvent: function () {
		this.__removeGlobalEvent();
		this._bindClose_key = this.eventManager.addGlobalEvent('keydown', this.__globalEventHandlers[0], true);
		this._bindClose_mousedown = this.eventManager.addGlobalEvent('mousedown', this.__globalEventHandlers[1], true);
	},

	__removeGlobalEvent: function () {
		if (this._bindClose_key) this._bindClose_key = this.eventManager.removeGlobalEvent(this._bindClose_key);
		if (this._bindClose_mousedown) this._bindClose_mousedown = this.eventManager.removeGlobalEvent(this._bindClose_mousedown);
		if (this._bindClose_click) this._bindClose_click = this.eventManager.removeGlobalEvent(this._bindClose_click);
	},

	constructor: SelectMenu
};

function OnKeyDown_refer(e) {
	const keyCode = e.keyCode;
	switch (keyCode) {
		case 38: // up
			e.preventDefault();
			e.stopPropagation();
			this._moveItem(-1);
			break;
		case 40: // down
			e.preventDefault();
			e.stopPropagation();
			this._moveItem(1);
			break;
		case 13: case 32: // enter, space
			if (this.index > -1) {
				e.preventDefault();
				e.stopPropagation();
				this._select(this.index);
			}
			break;
	}
}

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
	let target = e.target;
	let index = null;

	while (!index && !/UL/i.test(target.tagName)) {
		index = target.getAttribute('data-index');
		target = target.parentNode;
	}

	if (!index) return;
	this._select(index * 1);
}

function CloseListener_key(e) {
	if (!/27/.test(e.keyCode)) return;
	this.close();
	e.stopPropagation();
}

function CloseListener_mousedown(e) {
	if (this.form.contains(e.target)) return;
	if (e.target !== this._refer) {
		this.close();
		e.stopPropagation();
	} else if (this.checkType) {
		this._bindClose_click = this.eventManager.addGlobalEvent('click', this.__globalEventHandlers[2], true);
	}
}

function CloseListener_click(e) {
	this.eventManager.removeGlobalEvent(this._bindClose_click);
	if (e.target === this._refer) {
		this.close();
		e.stopPropagation();
	}
}

export default SelectMenu;
