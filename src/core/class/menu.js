/**
 * @fileoverview Menu class
 * @author Yi JiHong.
 */

import CoreDependency from '../../dependency/_core';
import { domUtils } from '../../helper';

const Menu = function (editor) {
	CoreDependency.call(this, editor);
	this._menuTrayMap = {};
	// dropdown
	this.currentDropdown = null;
	this.currentDropdownActiveButton = null;
	this.currentDropdownName = '';
	this._bindedDropdownOff = null;
	// container
	this.currentContainer = null;
	this.currentContainerActiveButton = null;
	this._bindedContainerOff = null;
	// more layer
	this.currentMoreLayerActiveButton = null;
};

Menu.prototype = {
	/**
	 * @description Method for managing dropdown element.
	 * You must add the "dropdown" element using the this method at custom plugin.
	 * @param {Element|string} target Target button
	 * @param {Element} menu Dropdown element
	 */
	initDropdownTarget: function (target, menu) {
		if (target) {
			this.context.get('toolbar._menuTray').appendChild(menu);
			this._menuTrayMap[typeof target === 'string' ? target : target.getAttribute('data-command')] = menu;
		} else {
			throw Error("[SUNEDITOR.init.fail] The plugin's button is not added.");
		}
	},

	/**
	 * @description On dropdown
	 * @param {Element} button Dropdown's button element to call
	 */
	dropdownOn: function (button) {
		if (this._bindedDropdownOff) this._bindedDropdownOff();

		const dropdownName = (this.currentDropdownName = button.getAttribute('data-command'));
		const menu = (this.currentDropdown = this._menuTrayMap[dropdownName]);
		this.currentDropdownActiveButton = button;
		this._setMenuPosition(button, menu);

		this._bindedDropdownOff = this.dropdownOff.bind(this);
		this.eventManager.addGlobalEvent('mousedown', this._bindedDropdownOff, false);

		if (this.plugins[dropdownName].on) this.plugins[dropdownName].on();
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
		const menu = (this.currentContainer = this._menuTrayMap[containerName]);
		this.currentContainerActiveButton = button;
		this._setMenuPosition(button, menu);

		this._bindedContainerOff = this.containerOff.bind(this);
		this.eventManager.addGlobalEvent('mousedown', this._bindedContainerOff, false);

		if (this.plugins[containerName].on) this.plugins[containerName].on();
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

		this.offset.setRelPosition(menu, element.parentElement, this.context.get('toolbar.main'));

		menu.style.visibility = '';
	},

	_moreLayerOn: function (button, layer) {
		this._moreLayerOff();
		this.currentMoreLayerActiveButton = button;
		layer.style.display = 'block';
	},

	/**
	 * @description Disable more layer
	 */
	_moreLayerOff: function () {
		if (this.currentMoreLayerActiveButton) {
			const layer = this.context.get('toolbar.main').querySelector('.' + this.currentMoreLayerActiveButton.getAttribute('data-command'));
			layer.style.display = 'none';
			domUtils.removeClass(this.currentMoreLayerActiveButton, 'on');
			this.currentMoreLayerActiveButton = null;
		}
	}
};

export default Menu;
