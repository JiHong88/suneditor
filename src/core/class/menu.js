/**
 * @fileoverview Toolbar Menu class
 */

import CoreInjector from '../../editorInjector/_core';
import { dom, converter } from '../../helper';

/**
 * @typedef {Omit<Menu & Partial<SunEditor.Injector_Core>, 'menu'>} MenuThis
 */

/**
 * @description Dropdown and container menu management class
 */
class Menu extends CoreInjector {
	#dropdownCommands;
	#globalEventHandler;
	#bindClose_dropdown_mouse;
	#bindClose_dropdown_key;
	#bindClose_cons_mouse;
	#menuBtn;
	#menuContainer;

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor) {
		super(editor);

		// members
		/** @type {Object<string, HTMLElement>} */
		this.targetMap = {};
		this.index = -1;
		this.menus = [];
		// dropdown
		this.currentButton = null;
		this.currentDropdown = null;
		this.currentDropdownActiveButton = null;
		this.currentDropdownName = '';
		this.currentDropdownType = '';
		// container
		this.currentContainer = null;
		this.currentContainerActiveButton = null;
		this.currentContainerName = '';
		this.currentDropdownPlugin = null;

		// event
		this.#dropdownCommands = [];
		this.#globalEventHandler = {
			mousedown: this.#OnMouseDown_dropdown.bind(this),
			containerDown: this.containerOff.bind(this),
			keydown: this.#OnKeyDown_dropdown.bind(this),
			mousemove: this.#OnMousemove_dropdown.bind(this),
			mouseout: this.#OnMouseout_dropdown.bind(this),
		};
		this.#bindClose_dropdown_mouse = null;
		this.#bindClose_dropdown_key = null;
		this.#bindClose_cons_mouse = null;

		// eventManager member (viewport)
		this.#menuBtn = null;
		this.#menuContainer = null;
	}

	/** @type {SunEditor.Core['offset']} */
	get #offset() {
		return this.editor.offset;
	}

	/**
	 * @description Method for managing dropdown element.
	 * - You must add the "dropdown" element using the this method at custom plugin.
	 * @param {{key: string, type: string}} classObj Class object
	 * @param {Node} menu Dropdown element
	 */
	initDropdownTarget({ key, type }, menu) {
		if (key) {
			if (!IsFree(type)) {
				/** @type {HTMLElement} */ (menu).setAttribute('data-key', key);
				this.#dropdownCommands.push(key);
			}
			this.context.get('menuTray').appendChild(menu);
			this.targetMap[key] = /** @type {HTMLElement} */ (menu);
		} else {
			throw Error("[SUNEDITOR.init.fail] The plugin's key is not added.");
		}
	}

	/**
	 * @description Opens the dropdown menu for the specified button.
	 * @param {Node} button Dropdown's button element to call
	 */
	dropdownOn(button) {
		this.#removeGlobalEvent();
		const moreBtn = this.#checkMoreLayer(button);
		if (moreBtn) {
			const target = dom.query.getParentElement(moreBtn, '.se-btn-tray').querySelector('[data-command="' + moreBtn.getAttribute('data-ref') + '"]');
			if (target) {
				this.editor.runFromTarget(target);
				this.dropdownOn(button);
				return;
			}
		}

		const btnEl = (this.currentButton = /** @type {HTMLButtonElement} */ (button));
		const dropdownName = (this.currentDropdownName = btnEl.getAttribute('data-command'));
		this.currentDropdownType = btnEl.getAttribute('data-type');
		const menu = (this.currentDropdown = this.targetMap[dropdownName]);
		this.currentDropdownActiveButton = btnEl;
		this.#setMenuPosition(btnEl, menu);

		this.#bindClose_dropdown_mouse = this.eventManager.addGlobalEvent('mousedown', this.#globalEventHandler.mousedown, false);
		if (this.#dropdownCommands.includes(dropdownName)) {
			this.menus = converter.nodeListToArray(menu.querySelectorAll('[data-command]'));
			if (this.menus.length > 0) {
				this.#bindClose_dropdown_key = this.eventManager.addGlobalEvent('keydown', this.#globalEventHandler.keydown, false);
				menu.addEventListener('mousemove', this.#globalEventHandler.mousemove, false);
				menu.addEventListener('mouseout', this.#globalEventHandler.mouseout, false);
			}
		}

		this.currentDropdownPlugin = this.plugins[dropdownName];
		this.currentDropdownPlugin?.on(btnEl);

		this.editor._preventBlur = true;
	}

	/**
	 * @description Closes the currently open dropdown menu.
	 */
	dropdownOff() {
		this.#removeGlobalEvent();
		if (IsFree(this.currentDropdownType)) this.currentDropdownPlugin?.off?.();

		this.index = -1;
		this.menus = [];
		this.#menuBtn = null;
		this.#menuContainer = null;
		this.currentButton = null;

		if (this.currentDropdown) {
			this.currentDropdownName = '';
			this.currentDropdownType = '';
			this.currentDropdown.style.display = 'none';
			this.currentDropdown = null;
			if (this.currentDropdownActiveButton) {
				dom.utils.removeClass(this.currentDropdownActiveButton.parentElement.children, 'on');
			}
			this.currentDropdownActiveButton = null;
			this.editor._notHideToolbar = false;
		}

		this.editor._preventBlur = false;
		this.currentDropdownPlugin = null;
	}

	/**
	 * @description Shows a previously hidden dropdown menu that is still in "on" state.
	 * - Only works when a dropdown is active (currentButton exists)
	 * - Re-displays the dropdown that was hidden by dropdownHide()
	 * - Recalculates menu position by calling dropdownOn() again
	 */
	dropdownShow() {
		if (this.currentButton) {
			this.dropdownOn(this.currentButton);
		}
	}

	/**
	 * @description Temporarily hides the currently active dropdown menu without closing it.
	 * - Unlike dropdownOff(), this does not clear the dropdown state or event listeners
	 * - The dropdown remains "on" but visually hidden
	 * - Use dropdownShow() to make it visible again
	 */
	dropdownHide() {
		if (this.currentDropdown) {
			this.currentDropdown.style.display = 'none';
		}
	}

	/**
	 * @description Opens the menu container for the specified button.
	 * @param {Node} button Container's button element to call
	 */
	containerOn(button) {
		this.#removeGlobalEvent();

		this.currentContainerActiveButton = /** @type {HTMLButtonElement} */ (button);
		const containerName = (this.currentContainerName = this.currentContainerActiveButton.getAttribute('data-command'));
		this.#setMenuPosition(button, (this.currentContainer = this.targetMap[containerName]));

		this.#bindClose_cons_mouse = this.eventManager.addGlobalEvent('mousedown', this.#globalEventHandler.containerDown, false);

		if (this.plugins[containerName].on) this.plugins[containerName].on(button);
		this.editor._preventBlur = true;
	}

	/**
	 * @description Closes the currently open menu container.
	 */
	containerOff() {
		this.#removeGlobalEvent();

		if (this.currentContainer) {
			this.currentContainerName = '';
			this.currentContainer.style.display = 'none';
			this.currentContainer = null;
			dom.utils.removeClass(this.currentContainerActiveButton, 'on');
			this.currentContainerActiveButton = null;
			this.editor._notHideToolbar = false;
		}

		this.editor._preventBlur = false;
	}

	/**
	 * @internal
	 * @description Reset the menu position.
	 * @param {Node} element Button element
	 * @param {HTMLElement} menu Menu element
	 */
	__resetMenuPosition(element, menu) {
		this.#offset.setRelPosition(menu, this.carrierWrapper, element.parentElement, dom.query.getParentElement(element, '.se-toolbar'));
	}

	/**
	 * @internal
	 * @description Restore the last menu position using previously stored button and menu elements.
	 */
	__restoreMenuPosition() {
		if (!this.#menuBtn || !this.#menuContainer) return;
		this.#setMenuPosition(this.#menuBtn, this.#menuContainer);
	}

	/**
	 * @description Set the menu position.
	 * @param {Node} element Button element
	 * @param {HTMLElement} menu Menu element
	 */
	#setMenuPosition(element, menu) {
		menu.style.visibility = 'hidden';
		menu.style.display = 'block';
		menu.style.height = '';
		dom.utils.addClass(element.parentElement.children, 'on');

		this.#offset.setRelPosition(menu, this.carrierWrapper, element.parentElement, dom.query.getParentElement(element, '.se-toolbar'));

		menu.style.visibility = '';

		this.#menuBtn = element;
		this.#menuContainer = menu;
	}

	/**
	 * @description Check if the element is part of a more layer
	 * @param {Node} element The element to check
	 * @returns {HTMLElement|null} The more layer element or null
	 */
	#checkMoreLayer(element) {
		const more = dom.query.getParentElement(element, '.se-more-layer');
		if (more && more.style.display !== 'block') {
			return more.getAttribute('data-ref') ? more : null;
		} else {
			return null;
		}
	}

	/**
	 * @description Move the selected item in the dropdown menu
	 * @param {number} num Direction and amount to move (-1 for up, 1 for down)
	 */
	#moveItem(num) {
		dom.utils.removeClass(this.currentDropdown, 'se-select-menu-mouse-move');
		dom.utils.addClass(this.currentDropdown, 'se-select-menu-key-action');
		num = this.index + num;
		const len = this.menus.length;
		const selectIndex = (this.index = num >= len ? 0 : num < 0 ? len - 1 : num);

		for (let i = 0; i < len; i++) {
			if (i === selectIndex) {
				dom.utils.addClass(this.menus[i], 'on');
			} else {
				dom.utils.removeClass(this.menus[i], 'on');
			}
		}
	}

	/**
	 * @description Remove global event listeners
	 */
	#removeGlobalEvent() {
		this.#bindClose_dropdown_mouse &&= this.eventManager.removeGlobalEvent(this.#bindClose_dropdown_mouse);
		this.#bindClose_cons_mouse &&= this.eventManager.removeGlobalEvent(this.#bindClose_cons_mouse);
		if (this.#bindClose_dropdown_key) {
			this.#bindClose_dropdown_key = this.eventManager.removeGlobalEvent(this.#bindClose_dropdown_key);
			dom.utils.removeClass(this.menus, 'on');
			dom.utils.removeClass(this.currentDropdown, 'se-select-menu-key-action|se-select-menu-mouse-move');
			this.currentDropdown.removeEventListener('mousemove', this.#globalEventHandler.mousemove, false);
			this.currentDropdown.removeEventListener('mouseout', this.#globalEventHandler.mouseout, false);
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnMouseDown_dropdown(e) {
		const eventTarget = dom.query.getEventTarget(e);
		if (dom.query.getParentElement(eventTarget, '.se-dropdown')) return;
		this.dropdownOff();
	}

	/**
	 */
	#OnMouseout_dropdown() {
		this.index = -1;
	}

	/**
	 * @param {KeyboardEvent} e - Event object
	 */
	#OnKeyDown_dropdown(e) {
		const keyCode = e.code;
		switch (keyCode) {
			case 'ArrowUp': // up
				e.preventDefault();
				e.stopPropagation();
				this.#moveItem(-1);
				break;
			case 'ArrowDown': // down
				e.preventDefault();
				e.stopPropagation();
				this.#moveItem(1);
				break;
			case 'ArrowLeft': // left
				e.preventDefault();
				e.stopPropagation();
				this.#moveItem(-1);
				break;
			case 'ArrowRight': //right
				e.preventDefault();
				e.stopPropagation();
				this.#moveItem(1);
				break;
			case 'Enter':
			case 'Space': /* enter, space */ {
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
	 * @param {MouseEvent} e - Event object
	 */
	#OnMousemove_dropdown(e) {
		dom.utils.addClass(this.currentDropdown, 'se-select-menu-mouse-move');
		dom.utils.removeClass(this.currentDropdown, 'se-select-menu-key-action');

		const index = this.menus.indexOf(e.target);
		if (index === -1) return;
		this.index = index * 1;
	}

	/**
	 * @internal
	 * @description Destroy the Menu instance and release memory
	 */
	_destroy() {
		this.#removeGlobalEvent();
	}
}

/**
 * @param {string} type Type
 * @returns {boolean}
 */
function IsFree(type) {
	return /free$/.test(type);
}

export default Menu;
