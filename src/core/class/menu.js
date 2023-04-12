/**
 * @fileoverview Menu class
 */

import CoreInjector from '../../injector/_core';
import { domUtils } from '../../helper';

const Menu = function (editor) {
	CoreInjector.call(this, editor);

	// members--
	this.targetMap = {};
	// dropdown
	this.currentDropdown = null;
	this.currentDropdownActiveButton = null;
	this.currentDropdownName = '';
	this._bindedDropdownOff = null;
	// container
	this.currentContainer = null;
	this.currentContainerActiveButton = null;
	this._bindedContainerOff = null;
};

Menu.prototype = {
	/**
	 * @description Method for managing dropdown element.
	 * You must add the "dropdown" element using the this method at custom plugin.
	 * @param {Element|string} key Key string
	 * @param {Element} menu Dropdown element
	 */
	initDropdownTarget: function (key, menu) {
		if (key) {
			this.context.get('_menuTray').appendChild(menu);
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
		if (this._bindedDropdownOff) this._bindedDropdownOff();
		const moreBtn = this._checkMoreLayer(button);
		if (moreBtn) {
			const target = domUtils.getParentElement(moreBtn, '.se-btn-tray').querySelector('[data-command="' + moreBtn.getAttribute('data-ref') + '"]');
			if (target) {
				this.editor.run(target.getAttribute('data-command'), target.getAttribute('data-type'), target);
				this.dropdownOn(button);
				return;
			}
		}

		const dropdownName = (this.currentDropdownName = button.getAttribute('data-command'));
		const menu = (this.currentDropdown = this.targetMap[dropdownName]);
		this.currentDropdownActiveButton = button;
		this._setMenuPosition(button, menu);

		this._bindedDropdownOff = this.dropdownOff.bind(this);
		this.eventManager.addGlobalEvent('mousedown', this._bindedDropdownOff, false);

		if (this.plugins[dropdownName].on) this.plugins[dropdownName].on(button);
		this.editor._antiBlur = true;
	},

	/**
	 * @description Off dropdown
	 */
	dropdownOff: function () {
		this.eventManager.removeGlobalEvent('mousedown', this._bindedDropdownOff, false);
		this._bindedDropdownOff = null;

		if (this.currentDropdown) {
			this.currentDropdownName = '';
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
		if (this._bindedContainerOff) this._bindedContainerOff();

		const containerName = (this._containerName = button.getAttribute('data-command'));
		const menu = (this.currentContainer = this.targetMap[containerName]);
		this.currentContainerActiveButton = button;
		this._setMenuPosition(button, menu);

		this._bindedContainerOff = this.containerOff.bind(this);
		this.eventManager.addGlobalEvent('mousedown', this._bindedContainerOff, false);

		if (this.plugins[containerName].on) this.plugins[containerName].on(button);
		this.editor._antiBlur = true;
	},

	/**
	 * @description Off menu container
	 */
	containerOff: function () {
		this.eventManager.removeGlobalEvent('mousedown', this._bindedContainerOff, false);
		this._bindedContainerOff = null;

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

		this.offset.setRelPosition(menu, this.editor._carrierWrapper, element.parentElement, domUtils.getParentElement(element, '.se-toolbar'));

		menu.style.visibility = '';
	},

	_checkMoreLayer: function (element) {
		const more = domUtils.getParentElement(element, '.se-more-layer');
		if (more && more.style.display !== 'block') {
			return more.getAttribute('data-ref') ? more : null;
		} else {
			return null;
		}
	}
};

export default Menu;
