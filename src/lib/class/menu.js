/**
 * @fileoverview Menu class
 * @author Yi JiHong.
 */

import CoreInterface from '../../interface/_core';
import { domUtils } from '../../helper';

const Menu = function (editor) {
	CoreInterface.call(this, editor);
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
	 * @param {Element|null} target Target button
	 * @param {Element} menu Dropdown element
	 */
	initTarget: function (target, menu) {
		if (target) {
			this.context.element._menuTray.appendChild(menu);
			this._menuTrayMap[target.getAttribute('data-command')] = menu;
		}
	},

	/**
	 * @description Enable dropdown
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
	 * @description Disable dropdown
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
			this._notHideToolbar = false;
		}

		this.editor._antiBlur = false;
	},

	/**
	 * @description Enabled container
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
	 * @description Disable container
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
			this._notHideToolbar = false;
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

		const toolbar = this.context.element.toolbar;
		const toolbarW = toolbar.offsetWidth;
		const toolbarOffset = this.offset.getGlobal(this.context.element.toolbar);
		const menuW = menu.offsetWidth;
		const l = element.parentElement.offsetLeft + 3;

		// rtl
		if (this.options._rtl) {
			const elementW = element.offsetWidth;
			const rtlW = menuW > elementW ? menuW - elementW : 0;
			const rtlL = rtlW > 0 ? 0 : elementW - menuW;
			menu.style.left = l - rtlW + rtlL + 'px';
			if (toolbarOffset.left > this.offset.getGlobal(menu).left) {
				menu.style.left = '0px';
			}
		} else {
			const overLeft = toolbarW <= menuW ? 0 : toolbarW - (l + menuW);
			if (overLeft < 0) menu.style.left = l + overLeft + 'px';
			else menu.style.left = l + 'px';
		}

		// get element top
		let t = 0;
		let offsetEl = element;
		while (offsetEl && offsetEl !== toolbar) {
			t += offsetEl.offsetTop;
			offsetEl = offsetEl.offsetParent;
		}

		const bt = t;
		if (this._isBalloon) {
			t += toolbar.offsetTop + element.offsetHeight;
		} else {
			t -= element.offsetHeight;
		}

		// set menu position
		const toolbarTop = toolbarOffset.top;
		const menuHeight = menu.offsetHeight;
		const scrollTop = this.offset.getGlobalScroll().top;

		const menuHeight_bottom = this._w.innerHeight - (toolbarTop - scrollTop + bt + element.parentElement.offsetHeight);
		if (menuHeight_bottom < menuHeight) {
			let menuTop = -1 * (menuHeight - bt + 3);
			const insTop = toolbarTop - scrollTop + menuTop;
			const menuHeight_top = menuHeight + (insTop < 0 ? insTop : 0);

			if (menuHeight_top > menuHeight_bottom) {
				menu.style.height = menuHeight_top + 'px';
				menuTop = -1 * (menuHeight_top - bt + 3);
			} else {
				menu.style.height = menuHeight_bottom + 'px';
				menuTop = bt + element.parentElement.offsetHeight;
			}

			menu.style.top = menuTop + 'px';
		} else {
			menu.style.top = bt + element.parentElement.offsetHeight + 'px';
		}

		menu.style.visibility = '';
	},

	_moreLayerOn: function (button, layer) {
		this._moreLayerOff();
		this.menu.currentMoreLayerActiveButton = button;
		layer.style.display = 'block';
	},

	/**
	 * @description Disable more layer
	 */
	_moreLayerOff: function () {
		if (this.currentMoreLayerActiveButton) {
			const layer = this.context.element.toolbar.querySelector('.' + this.currentMoreLayerActiveButton.getAttribute('data-command'));
			layer.style.display = 'none';
			domUtils.removeClass(this.currentMoreLayerActiveButton, 'on');
			this.currentMoreLayerActiveButton = null;
		}
	}
};

export default Menu;
