/**
 * @fileoverview Toolbar Menu class
 */

import CoreInjector from '../../editorInjector/_core';
import { domUtils, converter } from '../../helper';

/**
 * @typedef {Omit<Menu & Partial<EditorInjector>, 'menu'>} MenuThis
 */

/**
 * @constructor
 * @this {MenuThis}
 * @description Dropdown and container menu management class
 * @param {EditorCore} editor - The root editor instance
 */
function Menu(editor) {
	CoreInjector.call(this, editor);

	// members
	/**
	 * @type {Object.<string, Node>}
	 */
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
	this.currentContainerName = '';
	// event
	this._dropdownCommands = [];
	this.__globalEventHandler = {
		mousedown: OnMouseDown_dropdown.bind(this),
		containerDown: this.containerOff.bind(this),
		keydown: OnKeyDown_dropdown.bind(this),
		mousemove: OnMousemove_dropdown.bind(this),
		mouseout: OnMouseout_dropdown.bind(this)
	};
	this._bindClose_dropdown_mouse = null;
	this._bindClose_dropdown_key = null;
	this._bindClose_cons_mouse = null;
	this.currentDropdownPlugin = null;
}

Menu.prototype = {
	/**
	 * @this {MenuThis}
	 * @description Method for managing dropdown element.
	 * - You must add the "dropdown" element using the this method at custom plugin.
	 * @param {{key: string, type: string}} classObj Class object
	 * @param {Node} menu Dropdown element
	 */
	initDropdownTarget({ key, type }, menu) {
		if (key) {
			if (!/free$/.test(type)) {
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
	 * @this {MenuThis}
	 * @description On dropdown
	 * @param {Node} button Dropdown's button element to call
	 */
	dropdownOn(button) {
		this.__removeGlobalEvent();
		const moreBtn = this._checkMoreLayer(button);
		if (moreBtn) {
			const target = domUtils.getParentElement(moreBtn, '.se-btn-tray').querySelector('[data-command="' + moreBtn.getAttribute('data-ref') + '"]');
			if (target) {
				this.editor.runFromTarget(target);
				this.dropdownOn(button);
				return;
			}
		}

		const dropdownName = (this.currentDropdownName = button.getAttribute('data-command'));
		this.currentDropdownType = button.getAttribute('data-type');
		const menu = (this.currentDropdown = this.targetMap[dropdownName]);
		this.currentDropdownActiveButton = button;
		this._setMenuPosition(button, menu);

		this._bindClose_dropdown_mouse = this.eventManager.addGlobalEvent('mousedown', this.__globalEventHandler.mousedown, false);
		if (this._dropdownCommands.includes(dropdownName)) {
			this.menus = converter.nodeListToArray(menu.querySelectorAll('[data-command]'));
			if (this.menus.length > 0) {
				this._bindClose_dropdown_key = this.eventManager.addGlobalEvent('keydown', this.__globalEventHandler.keydown, false);
				menu.addEventListener('mousemove', this.__globalEventHandler.mousemove, false);
				menu.addEventListener('mouseout', this.__globalEventHandler.mouseout, false);
			}
		}

		this.currentDropdownPlugin = this.plugins[dropdownName];
		if (typeof this.currentDropdownPlugin?.on === 'function') this.currentDropdownPlugin.on(button);
		this.editor._preventBlur = true;
	},

	/**
	 * @this {MenuThis}
	 * @description Off dropdown
	 */
	dropdownOff() {
		this.__removeGlobalEvent();
		this.index = -1;
		this.menus = [];

		if (this.currentDropdown) {
			this.currentDropdownName = '';
			this.currentDropdownType = '';
			this.currentDropdown.style.display = 'none';
			this.currentDropdown = null;
			if (this.currentDropdownActiveButton) {
				domUtils.removeClass(this.currentDropdownActiveButton.parentElement.children, 'on');
			}
			this.currentDropdownActiveButton = null;
			this.editor._notHideToolbar = false;
		}

		this.editor._preventBlur = false;

		if (typeof this.currentDropdownPlugin?.off === 'function') this.currentDropdownPlugin.off();
		this.currentDropdownPlugin = null;
	},

	/**
	 * @this {MenuThis}
	 * @description On menu container
	 * @param {Node} button Container's button element to call
	 */
	containerOn(button) {
		this.__removeGlobalEvent();

		const containerName = (this.currentContainerName = button.getAttribute('data-command'));
		this.currentContainerActiveButton = button;
		this._setMenuPosition(button, (this.currentContainer = this.targetMap[containerName]));

		this._bindClose_cons_mouse = this.eventManager.addGlobalEvent('mousedown', this.__globalEventHandler.containerDown, false);

		if (this.plugins[containerName].on) this.plugins[containerName].on(button);
		this.editor._preventBlur = true;
	},

	/**
	 * @this {MenuThis}
	 * @description Off menu container
	 */
	containerOff() {
		this.__removeGlobalEvent();

		if (this.currentContainer) {
			this.currentContainerName = '';
			this.currentContainer.style.display = 'none';
			this.currentContainer = null;
			domUtils.removeClass(this.currentContainerActiveButton, 'on');
			this.currentContainerActiveButton = null;
			this.editor._notHideToolbar = false;
		}

		this.editor._preventBlur = false;
	},

	/**
	 * @private
	 * @this {MenuThis}
	 * @description Set the menu position.
	 * @param {Node} element Button element
	 * @param {Node} menu Menu element
	 */
	_setMenuPosition(element, menu) {
		menu.style.visibility = 'hidden';
		menu.style.display = 'block';
		menu.style.height = '';
		domUtils.addClass(element.parentElement.children, 'on');

		this.offset.setRelPosition(menu, this.carrierWrapper, element.parentElement, domUtils.getParentElement(element, '.se-toolbar'), false);

		menu.style.visibility = '';
	},

	/**
	 * @private
	 * @this {MenuThis}
	 * @description Check if the element is part of a more layer
	 * @param {Node} element The element to check
	 * @returns {Node|null} The more layer element or null
	 */
	_checkMoreLayer(element) {
		const more = domUtils.getParentElement(element, '.se-more-layer');
		if (more && more.style.display !== 'block') {
			return more.getAttribute('data-ref') ? more : null;
		} else {
			return null;
		}
	},

	/**
	 * @private
	 * @this {MenuThis}
	 * @description Move the selected item in the dropdown menu
	 * @param {number} num Direction and amount to move (-1 for up, 1 for down)
	 */
	_moveItem(num) {
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

	/**
	 * @private
	 * @this {MenuThis}
	 * @description Remove global event listeners
	 */
	__removeGlobalEvent() {
		if (this._bindClose_dropdown_mouse) this._bindClose_dropdown_mouse = this.eventManager.removeGlobalEvent(this._bindClose_dropdown_mouse);
		if (this._bindClose_cons_mouse) this._bindClose_cons_mouse = this.eventManager.removeGlobalEvent(this._bindClose_cons_mouse);
		if (this._bindClose_dropdown_key) {
			this._bindClose_dropdown_key = this.eventManager.removeGlobalEvent(this._bindClose_dropdown_key);
			domUtils.removeClass(this.menus, 'on');
			domUtils.removeClass(this.currentDropdown, 'se-select-menu-key-action|se-select-menu-mouse-move');
			this.currentDropdown.removeEventListener('mousemove', this.__globalEventHandler.mousemove, false);
			this.currentDropdown.removeEventListener('mouseout', this.__globalEventHandler.mouseout, false);
		}
	},

	constructor: Menu
};

/**
 * @private
 * @this {MenuThis}
 * @param {MouseEvent} e - Event object
 */
function OnMouseDown_dropdown(e) {
	const eventTarget = domUtils.getEventTarget(e);
	if (domUtils.getParentElement(eventTarget, '.se-dropdown')) return;
	this.dropdownOff();
}

/**
 * @private
 * @this {MenuThis}
 */
function OnMouseout_dropdown() {
	this.index = -1;
}

/**
 * @private
 * @this {MenuThis}
 * @param {KeyboardEvent} e - Event object
 */
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
		case 37: // left
			e.preventDefault();
			e.stopPropagation();
			this._moveItem(-1);
			break;
		case 39: //right
			e.preventDefault();
			e.stopPropagation();
			this._moveItem(1);
			break;
		case 13:
		case /* enter, space */ 32: {
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
}

/**
 * @private
 * @this {MenuThis}
 * @param {MouseEvent} e - Event object
 */
function OnMousemove_dropdown(e) {
	domUtils.addClass(this.currentDropdown, 'se-select-menu-mouse-move');
	domUtils.removeClass(this.currentDropdown, 'se-select-menu-key-action');

	const index = this.menus.indexOf(e.target);
	if (index === -1) return;
	this.index = index * 1;
}

export default Menu;
