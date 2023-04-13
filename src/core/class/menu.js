/**
 * @fileoverview Menu class
 */

import CoreInjector from '../../injector/_core';
import { domUtils, converter } from '../../helper';

const Menu = function (editor) {
	CoreInjector.call(this, editor);

	// members--
	this.targetMap = {};
	this.index = -1;
	this.menus = [];
	// dropdown
	this.currentDropdown = null;
	this.currentDropdownActiveButton = null;
	this.currentDropdownName = '';
	this.currentDropdownType = '';
	// container
	this.currentContainer = null;
	this.currentContainerActiveButton = null;
	// event
	this._dropdownCommands = [];
	this.__globalEventHandler = [this.dropdownOff.bind(this), this.containerOff.bind(this), OnKeyDown_dropdown.bind(this), OnMousemove_dropdown.bind(this), OnMouseout_dropdown.bind(this)];
	this._bindClose_dropdown_mouse = null;
	this._bindClose_dropdown_key = null;
	this._bindClose_cons_mouse = null;
};

Menu.prototype = {
	/**
	 * @description Method for managing dropdown element.
	 * You must add the "dropdown" element using the this method at custom plugin.
	 * @param {Element|string} key Key string
	 * @param {Element} menu Dropdown element
	 */
	initDropdownTarget: function (classObj, menu) {
		const key = classObj.key;
		if (key) {
			if (!/free$/.test(classObj.type)) {
				menu.setAttribute('data-key', key);
				this._dropdownCommands.push(key);
			}
			this.context.get('menuTray').appendChild(menu);
			this.targetMap[key] = menu;
		} else {
			throw Error("[SUNEDITOR.init.fail] The plugin's key is not added.");
		}
	},

	/**
	 * @description On dropdown
	 * @param {Element} button Dropdown's button element to call
	 */
	dropdownOn: function (button) {
		this.__removeGlobalEvent();
		const moreBtn = this._checkMoreLayer(button);
		if (moreBtn) {
			const target = domUtils.getParentElement(moreBtn, '.se-btn-tray').querySelector('[data-command="' + moreBtn.getAttribute('data-ref') + '"]');
			if (target) {
				this.editor.runTarget(target);
				this.dropdownOn(button);
				return;
			}
		}

		const dropdownName = (this.currentDropdownName = button.getAttribute('data-command'));
		this.currentDropdownType = button.getAttribute('data-type');
		const menu = (this.currentDropdown = this.targetMap[dropdownName]);
		this.currentDropdownActiveButton = button;
		this._setMenuPosition(button, menu);
		
		this._bindClose_dropdown_mouse = this.eventManager.addGlobalEvent('mousedown', this.__globalEventHandler[0], false);
		if (this._dropdownCommands.indexOf(dropdownName) > -1) {
			this.menus = converter.nodeListToArray(menu.querySelectorAll('button[data-command]'));
			if (this.menus.length > 0) {
				this._bindClose_dropdown_key = this.eventManager.addGlobalEvent('keydown', this.__globalEventHandler[2], false);
				menu.addEventListener('mousemove', this.__globalEventHandler[3], false);
				menu.addEventListener('mouseout', this.__globalEventHandler[4], false);
			}
		}

		if (this.plugins[dropdownName].on) this.plugins[dropdownName].on(button);
		this.editor._antiBlur = true;
	},

	/**
	 * @description Off dropdown
	 */
	dropdownOff: function () {
		this.__removeGlobalEvent();
		this.index = -1;
		this.menus = [];

		if (this.currentDropdown) {
			this.currentDropdownName = '';
			this.currentDropdownType = '';
			this.currentDropdown.style.display = 'none';
			this.currentDropdown = null;
			domUtils.removeClass(this.currentDropdownActiveButton, 'on');
			this.currentDropdownActiveButton = null;
			this.editor._notHideToolbar = false;
		}

		this.editor._antiBlur = false;
	},

	/**
	 * @description On menu container
	 * @param {Element} button Container's button element to call
	 */
	containerOn: function (button) {
		this.__removeGlobalEvent();

		const containerName = (this._containerName = button.getAttribute('data-command'));
		this.currentContainerActiveButton = button;
		this._setMenuPosition(button, (this.currentContainer = this.targetMap[containerName]));

		this._bindClose_cons_mouse = this.eventManager.addGlobalEvent('mousedown', this.__globalEventHandler[1], false);

		if (this.plugins[containerName].on) this.plugins[containerName].on(button);
		this.editor._antiBlur = true;
	},

	/**
	 * @description Off menu container
	 */
	containerOff: function () {
		this.__removeGlobalEvent();

		if (this.currentContainer) {
			this._containerName = '';
			this.currentContainer.style.display = 'none';
			this.currentContainer = null;
			domUtils.removeClass(this.currentContainerActiveButton, 'on');
			this.currentContainerActiveButton = null;
			this.editor._notHideToolbar = false;
		}

		this.editor._antiBlur = false;
	},

	/**
	 * @description Set the menu position. (dropdown, container)
	 * @param {*} element Button element
	 * @param {*} menu Menu element
	 * @private
	 */
	_setMenuPosition: function (element, menu) {
		menu.style.visibility = 'hidden';
		menu.style.display = 'block';
		menu.style.height = '';
		domUtils.addClass(element, 'on');

		this.offset.setRelPosition(menu, this.editor._carrierWrapper, element.parentElement, domUtils.getParentElement(element, '.se-toolbar'), false);

		menu.style.visibility = '';
	},

	_checkMoreLayer: function (element) {
		const more = domUtils.getParentElement(element, '.se-more-layer');
		if (more && more.style.display !== 'block') {
			return more.getAttribute('data-ref') ? more : null;
		} else {
			return null;
		}
	},

	_moveItem: function (num) {
		domUtils.removeClass(this.currentDropdown, 'se-select-menu-mouse-move');
		domUtils.addClass(this.currentDropdown, 'se-select-menu-key-action');
		num = this.index + num;
		const len = this.menus.length;
		const selectIndex = (this.index = num >= len ? 0 : num < 0 ? len - 1 : num);

		for (let i = 0; i < len; i++) {
			if (i === selectIndex) {
				domUtils.addClass(this.menus[i], 'on');
			} else {
				domUtils.removeClass(this.menus[i], 'on');
			}
		}
	},

	__removeGlobalEvent: function () {
		if (this._bindClose_dropdown_mouse) this._bindClose_dropdown_mouse = this.eventManager.removeGlobalEvent(this._bindClose_dropdown_mouse);
		if (this._bindClose_cons_mouse) this._bindClose_cons_mouse = this.eventManager.removeGlobalEvent(this._bindClose_cons_mouse);
		if (this._bindClose_dropdown_key) {
			this._bindClose_dropdown_key = this.eventManager.removeGlobalEvent(this._bindClose_dropdown_key);
			domUtils.removeClass(this.menus, 'on');
			domUtils.removeClass(this.currentDropdown, 'se-select-menu-key-action');
			domUtils.removeClass(this.currentDropdown, 'se-select-menu-mouse-move');
			this.currentDropdown.removeEventListener('mousemove', this.__globalEventHandler[3], false);
			this.currentDropdown.removeEventListener('mouseout', this.__globalEventHandler[4], false);
		}
	},

	constructor: Menu
};

function OnMouseout_dropdown() {
	this.index = -1;
}

function OnKeyDown_dropdown(e) {
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
			if (this.index < 0) break;

			const target = this.menus[this.index];
			if (!target || typeof this.plugins[this.currentDropdownName].action !== 'function') return;

			e.preventDefault();
			e.stopPropagation();
			this.plugins[this.currentDropdownName].action(target);
			this.dropdownOff();
			break;
	}
}

function OnMousemove_dropdown(e) {
	domUtils.addClass(this.currentDropdown, 'se-select-menu-mouse-move');
	domUtils.removeClass(this.currentDropdown, 'se-select-menu-key-action');

	const index = this.menus.indexOf(e.target);
	if (index === -1) return;
	this.index = index * 1;
}

export default Menu;
