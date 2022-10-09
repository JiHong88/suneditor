import CoreInterface from '../interface/_core';
import { domUtils } from '../helper';

/**
 *
 * @param {*} inst
 * @param {boolean} checkList
 * @param {string} position "[left|right]-[middle|top|bottom] | [top|bottom]-[center|left|right]"
 */
const SelectMenu = function (inst, checkList, position) {
	// plugin bisic properties
	CoreInterface.call(this, inst.editor);

	// members
	this.kink = inst.constructor.key;
	this.inst = inst;
	const positionItems = position.split('-');
	this.form = null;
	this.items = [];
	this.menus = [];
	this.index = -1;
	this.item = null;
	this.checkList = !!checkList;
	this.position = positionItems[0];
	this.subPosition = positionItems[1];
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
	create: function (items, menus) {
		menus = menus || items;
		let html = '';
		for (let i = 0, len = menus.length; i < len; i++) {
			html += '<li class="se-select-item" data-index="' + i + '">' + (typeof menus[i] === 'string' ? menus[i] : menus[i].outerHTML) + '</li>';
		}

		this.items = items;
		this.form.firstElementChild.innerHTML = '<ul class="se-list-basic se-list-checked">' + html + '</ul>';
		this.menus = this.form.querySelectorAll('li');
	},

	on: function (referElement, selectMethod, attr) {
		if (!attr) attr = {};
		this._refer = referElement;
		this._selectMethod = selectMethod;
		this.form = domUtils.createElement('DIV', { class: 'se-select-menu ' + (attr.class || ''), style: attr.style || '' }, '<div class="se-list-inner"></div>');
		referElement.parentNode.insertBefore(this.form, referElement);
	},

	/**
	 * @description Select menu open
	 * @param {string} position "[left|right]-[middle|top|bottom] | [top|bottom]-[center|left|right]"
	 * @param {string|null|undefined} onItemQuerySelector The querySelector string of the menu to be activated
	 */
	open: function (position, onItemQuerySelector) {
		this.__addEvents();
		this.__addGlobalEvent();
		const positionItems = position ? position.split('-') : [];
		this._setPosition(positionItems[0] || this.position, positionItems[1] || this.subPosition, onItemQuerySelector);
	},

	close: function () {
		this._init();
		if (this.form) this.form.style.cssText = '';
	},

	getItem: function (index) {
		return this.items[index];
	},

	_init: function () {
		this.__removeEvents();
		this.__removeGlobalEvent();
		this.index = -1;
		this.item = null;
		if (this._onItem) {
			domUtils.removeClass(this._onItem, 'se-select-on');
			this._onItem = null;
		}
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

	/**
	 * @description Menu open
	 * @param {["left"|"right"] | ["top"|"bottom"]} position Menu position
	 * @param {["middle"|"top"|"bottom"] | ["center"|"left"|"right"]} subPosition Sub position
	 * @private
	 */
	_setPosition: function (position, subPosition, onItemQuerySelector) {
		const originP = position;
		const form = this.form;
		const target = this._refer;
		form.style.visibility = 'hidden';
		form.style.display = 'block';

		const formW = form.offsetWidth;
		const targetW = target.offsetWidth;
		const targetL = target.offsetLeft;
		let side = false;
		let l = 0,
			t = 0;

		if (position === 'left') {
			l = targetL - formW - 1;
			position = subPosition;
			side = true;
		} else if (position === 'right') {
			l = targetL + targetW + 1;
			position = subPosition;
			side = true;
		}

		// set top position
		const globalTarget = this.editor.offset.getGlobal(target);
		const targetOffsetTop = target.offsetTop;
		const targetGlobalTop = globalTarget.top;
		const targetHeight = target.offsetHeight;
		const wbottom = this._w.innerHeight - (targetGlobalTop + targetHeight);
		const sideAddH = side ? targetHeight : 0;
		switch (position) {
			case 'middle':
				let h = form.offsetHeight;
				const th = targetHeight / 2;
				t = targetOffsetTop - h / 2 + th;
				// over top
				if (targetGlobalTop < h / 2) {
					t += h / 2 - targetGlobalTop - th + 4;
					form.style.top = t + 'px';
				}
				// over bottom
				let formT = this.editor.offset.getGlobal(form).top;
				const modH = h - (targetGlobalTop - formT) - wbottom - targetHeight;
				if (modH > 0) {
					t -= modH + 4;
					form.style.top = t + 'px';
				}
				// over height
				formT = this.editor.offset.getGlobal(form).top;
				if (formT < 0) {
					h += formT - 4;
					t -= formT - 4;
				}
				form.style.height = h + 'px';
				break;
			case 'top':
				if (targetGlobalTop < form.offsetHeight - sideAddH) {
					form.style.height = targetGlobalTop - 4 + sideAddH + 'px';
				}
				t = targetOffsetTop - form.offsetHeight + sideAddH;
				break;
			case 'bottom':
				if (wbottom < form.offsetHeight + sideAddH) {
					form.style.height = wbottom - 4 + sideAddH + 'px';
				}
				t = targetOffsetTop + (side ? 0 : targetHeight);
				break;
		}

		if (!side) {
			switch (subPosition) {
				case 'center':
					l = targetL + targetW / 2 - formW / 2;
					break;
				case 'left':
					l = targetL;
					break;
				case 'right':
					l = targetL - (formW - targetW);
					break;
			}
		}

		form.style.left = l + 'px';
		let fl = this.editor.offset.getGlobal(form).left;
		let over = 0;
		switch (side + '-' + (side ? originP : subPosition)) {
			case 'true-left':
				over = globalTarget.left + fl;
				if (over < 0) l = l = targetL + targetW + 1;
				break;
			case 'true-right':
				over = this._w.innerWidth - (fl + formW);
				if (over < 0) l = targetL - formW - 1;
				break;
			case 'false-center':
				over = this._w.innerWidth - (fl + formW);
				if (over < 0) l += over - 4;
				form.style.left = l + 'px';
				fl = this.editor.offset.getGlobal(form).left;
				if (fl < 0) l -= fl - 4;
				break;
			case 'false-left':
				over = this._w.innerWidth - (globalTarget.left + formW);
				if (over < 0) l += over - 4;
				break;
			case 'false-right':
				if (fl < 0) l -= fl - 4;
				break;
		}

		if (onItemQuerySelector) {
			const item = form.firstElementChild.querySelector(onItemQuerySelector);
			if (item) {
				this._onItem = item;
				domUtils.addClass(item, 'se-select-on');
			}
		}

		form.style.left = l + 'px';
		form.style.top = t + 'px';
		form.style.visibility = '';
	},

	_select: function (index) {
		if (this.checkList) domUtils.toggleClass(this.menus[index], 'se-checked');
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
		case 13:
		case 32: // enter, space
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

	while (!index && !/UL/i.test(target.tagName) && !domUtils.hasClass(target, 'se-container')) {
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
	} else if (!/input|textarea/i.test(e.target.tagName)) {
		this._bindClose_click = this.eventManager.addGlobalEvent('click', this.__globalEventHandlers[2], true);
	}
}

function CloseListener_click(e) {
	this._bindClose_click = this.eventManager.removeGlobalEvent(this._bindClose_click);
	if (e.target === this._refer) {
		e.stopPropagation();
		this.close();
	}
}

export default SelectMenu;
