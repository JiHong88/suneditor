import CoreInjector from '../editorInjector/_core';
import { domUtils, env } from '../helper';

const MENU_MIN_HEIGHT = 38;

/**
 * @typedef {Object} SelectMenuParams
 * @property {string} position Position of the select menu, specified as "[left|right]-[middle|top|bottom]" or "[top|bottom]-[center|left|right]"
 * @property {boolean=} checkList Flag to determine if the checklist is enabled (true or false)
 * @property {"rtl" | "ltr"} [dir="ltr"] Optional text direction: "rtl" for right-to-left, "ltr" for left-to-right
 * @property {number=} [splitNum=0] Optional split number for horizontal positioning; defines how many items per row
 * @property {() => void=} [openMethod] Optional method to call when the menu is opened
 * @property {() => void=} [closeMethod] Optional method to call when the menu is closed
 */

/**
 *
 * @param {*} inst The instance object that called the constructor.
 * @param {SelectMenuParams} params Select menu options
 */
function SelectMenu(inst, params) {
	// plugin bisic properties
	CoreInjector.call(this, inst.editor);

	// members
	this.kink = inst.constructor.key || inst.constructor.name;
	this.inst = inst;
	const positionItems = params.position.split('-');
	this.form = null;
	this.items = [];
	this.menus = [];
	this.menuLen = 0;
	this.index = -1;
	this.item = null;
	this.isOpen = false;
	this.checkList = !!params.checkList;
	this.position = positionItems[0];
	this.subPosition = positionItems[1];
	this._dirPosition = /^(left|right)$/.test(this.position) ? (this.position === 'left' ? 'right' : 'left') : this.position;
	this._dirSubPosition = /^(left|right)$/.test(this.subPosition) ? (this.subPosition === 'left' ? 'right' : 'left') : this.subPosition;
	this._textDirDiff = params.dir === 'ltr' ? false : params.dir === 'rtl' ? true : null;
	this.splitNum = params.splitNum || 0;
	this.horizontal = !!this.splitNum;
	this.openMethod = params.openMethod;
	this.closeMethod = params.closeMethod;
	this._refer = null;
	this._keydownTarget = null;
	this._selectMethod = null;
	this._bindClose_key = null;
	this._bindClose_mousedown = null;
	this._bindClose_click = null;
	this._closeSignal = false;
	this.__events = [];
	this.__eventHandlers = {
		mousedown: OnMousedown_list.bind(this.eventManager),
		mousemove: OnMouseMove_list.bind(this),
		click: OnClick_list.bind(this),
		keydown: OnKeyDown_refer.bind(this)
	};
	this.__globalEventHandlers = { keydown: CloseListener_key.bind(this), mousedown: CloseListener_mousedown.bind(this), click: CloseListener_click.bind(this) };
}

SelectMenu.prototype = {
	/**
	 * @description Creates the select menu items.
	 * @param {Array.<string>} items - Command list of selectable items.
	 * @param {Array.<Element>} [menus] - Optional list of menu display elements; defaults to `items`.
	 */
	create(items, menus) {
		this.form.firstElementChild.innerHTML = '';
		menus = menus || items;
		let html = '';
		for (let i = 0, len = menus.length; i < len; i++) {
			if (i > 0 && i % this.splitNum === 0) {
				this._createFormat(html);
				html = '';
			}
			html += `<li class="se-select-item" data-index="${i}">${typeof menus[i] === 'string' ? menus[i] : menus[i].outerHTML}</li>`;
		}
		this._createFormat(html);

		this.items = items;
		this.menus = this.form.querySelectorAll('li');
		this.menuLen = this.menus.length;
	},

	/**
	 * @description Initializes the select menu and attaches it to a reference element.
	 * @param {Element} referElement - The element that triggers the select menu.
	 * @param {(command: string) => void} selectMethod - The function to execute when an item is selected.
	 * @param {{class: string, style: string}} [attr={}] - Additional attributes for the select menu container.
	 */
	on(referElement, selectMethod, attr) {
		if (!attr) attr = {};
		this._refer = referElement;
		this._keydownTarget = domUtils.isInputElement(referElement) ? referElement : this._w;
		this._selectMethod = selectMethod;
		this.form = domUtils.createElement(
			'DIV',
			{
				class: 'se-select-menu' + (attr.class ? ' ' + attr.class : ''),
				style: attr.style || ''
			},
			'<div class="se-list-inner"></div>'
		);
		referElement.parentNode.insertBefore(this.form, referElement);
	},

	/**
	 * @description Select menu open
	 * @param {?string=} position "[left|right]-[middle|top|bottom] | [top|bottom]-[center|left|right]"
	 * @param {?string=} onItemQuerySelector The querySelector string of the menu to be activated
	 */
	open(position, onItemQuerySelector) {
		this.editor.selectMenuOn = true;
		if (typeof this.openMethod === 'function') this.openMethod();
		this.__addEvents();
		this.__addGlobalEvent();
		const positionItems = position ? position.split('-') : [];
		const mainPosition = positionItems[0] || (this._textDirDiff !== null && this._textDirDiff !== this.options.get('_rtl') ? this._dirPosition : this.position);
		const subPosition = positionItems[1] || (this._textDirDiff !== null && this._textDirDiff !== this.options.get('_rtl') ? this._dirSubPosition : this.subPosition);
		this._setPosition(mainPosition, subPosition, onItemQuerySelector);
		this.isOpen = true;
	},

	/**
	 * @description Select menu close
	 */
	close() {
		this.editor.selectMenuOn = false;
		domUtils.removeClass(this._refer, 'on');
		this._init();
		if (this.form) this.form.style.cssText = '';
		this.isOpen = false;
		if (typeof this.closeMethod === 'function') this.closeMethod();
	},

	/**
	 * @description Get the index of the selected item
	 * @param {number} index Item index
	 * @returns
	 */
	getItem(index) {
		return this.items[index];
	},

	/**
	 * @description Set the index of the selected item
	 * @param {number} index Item index
	 */
	setItem(index) {
		this._selectItem(index);
	},

	/**
	 * @private
	 * @description Appends a formatted list of items to the menu.
	 * @param {string} html - The HTML string representing the menu items.
	 */
	_createFormat(html) {
		this.form.firstElementChild.innerHTML += `<ul class="se-list-basic se-list-checked${this.horizontal ? ' se-list-horizontal' : ''}">${html}</ul>`;
	},

	/**
	 * @private
	 * @description Resets the menu state and removes event listeners.
	 */
	_init() {
		this.__removeEvents();
		this.__removeGlobalEvent();
		this.index = -1;
		this.item = null;
		if (this._onItem) {
			domUtils.removeClass(this._onItem, 'se-select-on');
			this._onItem = null;
		}
	},

	/**
	 * @private
	 * @description Moves the selection up or down by a specified number of items.
	 * @param {number} num - The number of items to move (negative for up, positive for down).
	 */
	_moveItem(num) {
		num = this.index + num;
		const len = this.menuLen;
		const selectIndex = (this.index = num >= len ? 0 : num < 0 ? len - 1 : num);

		this._selectItem(selectIndex);
	},

	/**
	 * @private
	 * @description Highlights and selects an item by index.
	 * @param {number} selectIndex - The index of the item to select.
	 */
	_selectItem(selectIndex) {
		domUtils.removeClass(this.form, 'se-select-menu-mouse-move');

		const len = this.menuLen;
		for (let i = 0; i < len; i++) {
			if (i === selectIndex) {
				domUtils.addClass(this.menus[i], 'active');
			} else {
				domUtils.removeClass(this.menus[i], 'active');
			}
		}

		this.index = selectIndex;
		this.item = this.items[selectIndex];
	},

	/**
	 * @private
	 * @description Sets the position of the select menu relative to the reference element.
	 * @param {["left"|"right"] | ["top"|"bottom"]} position Menu position
	 * @param {["middle"|"top"|"bottom"] | ["center"|"left"|"right"]} subPosition Sub position
	 * @param {string} [onItemQuerySelector] - A query selector string to highlight a specific item.
	 * @param {boolean} [_re=false] - Whether this is a retry after adjusting the position.
	 */
	_setPosition(position, subPosition, onItemQuerySelector, _re) {
		const originP = position;
		const form = this.form;
		const target = this._refer;
		form.style.visibility = 'hidden';
		form.style.display = 'block';
		domUtils.removeClass(form, 'se-select-menu-scroll');
		domUtils.addClass(target, 'on');

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
		const globalTarget = this.editor.offset.get(target);
		const targetOffsetTop = target.offsetTop;
		const targetGlobalTop = globalTarget.top;
		const targetHeight = target.offsetHeight;
		const wbottom = domUtils.getClientSize().h - (targetGlobalTop - this._w.scrollY + targetHeight);
		const sideAddH = side ? targetHeight : 0;
		let overH = 10000;
		switch (position) {
			case 'middle': {
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
			}
			case 'top':
				if (targetGlobalTop < form.offsetHeight - sideAddH) {
					if (!_re) {
						overH = 0;
						break;
					}
					overH = targetGlobalTop - 4 + sideAddH;
					if (overH >= MENU_MIN_HEIGHT) form.style.height = overH + 'px';
				}
				t = targetOffsetTop - form.offsetHeight + sideAddH;
				break;
			case 'bottom':
				if (wbottom < form.offsetHeight + sideAddH) {
					if (!_re) {
						overH = 0;
						break;
					}
					overH = wbottom - 4 + sideAddH;
					if (overH >= MENU_MIN_HEIGHT) form.style.height = overH + 'px';
				}
				t = targetOffsetTop + (side ? 0 : targetHeight);
				break;
		}

		if (overH < MENU_MIN_HEIGHT && !_re && position !== 'middle') {
			this._setPosition(position === 'top' ? 'bottpm' : 'top', subPosition, onItemQuerySelector, true);
			return;
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
		const fl = this.editor.offset.getGlobal(form).left;
		let overW = 0;
		switch (side + '-' + (side ? originP : subPosition)) {
			case 'true-left':
				overW = globalTarget.left - this._w.scrollX + fl;
				if (overW < 0) l = l = targetL + targetW + 1;
				break;
			case 'true-right':
				overW = this._w.innerWidth - (fl + formW);
				if (overW < 0) l = targetL - formW - 1;
				break;
			case 'false-center': {
				overW = this._w.innerWidth - (fl + formW);
				if (overW < 0) l += overW - 4;
				form.style.left = l + 'px';
				const centerfl = this.editor.offset.getGlobal(form).left;
				if (centerfl < 0) l -= centerfl - 4;
				break;
			}
			case 'false-left':
				overW = this._w.innerWidth - (globalTarget.left - this._w.scrollX + formW);
				if (overW < 0) l += overW - 4;
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

	/**
	 * @private
	 * @description Selects an item and triggers the callback function.
	 * @param {number} index - The index of the item to select.
	 */
	_select(index) {
		if (this.checkList) domUtils.toggleClass(this.menus[index], 'se-checked');
		this._selectMethod(this.getItem(index));
	},

	/**
	 * @private
	 * @description Adds event listeners for menu interactions.
	 */
	__addEvents() {
		this.__removeEvents();
		this.__events = this.__eventHandlers;
		this.form.addEventListener('mousedown', this.__events.mousedown);
		this.form.addEventListener('mousemove', this.__events.mousemove);
		this.form.addEventListener('click', this.__events.click);
		this._keydownTarget.addEventListener('keydown', this.__events.keydown);
	},

	/**
	 * @private
	 * @description Removes event listeners for menu interactions.
	 */
	__removeEvents() {
		if (this.__events.length === 0) return;
		this.form.removeEventListener('mousedown', this.__events.mousedown);
		this.form.removeEventListener('mousemove', this.__events.mousemove);
		this.form.removeEventListener('click', this.__events.click);
		this._keydownTarget.removeEventListener('keydown', this.__events.keydown);
		this.__events = [];
	},

	/**
	 * @private
	 * @description Adds global event listeners for closing the menu.
	 */
	__addGlobalEvent() {
		this.__removeGlobalEvent();
		this._bindClose_key = this.eventManager.addGlobalEvent('keydown', this.__globalEventHandlers.keydown, true);
		this._bindClose_mousedown = this.eventManager.addGlobalEvent('mousedown', this.__globalEventHandlers.mousedown, true);
	},

	/**
	 * @private
	 * @description Removes global event listeners for closing the menu.
	 */
	__removeGlobalEvent() {
		if (this._bindClose_key) this._bindClose_key = this.eventManager.removeGlobalEvent(this._bindClose_key);
		if (this._bindClose_mousedown) this._bindClose_mousedown = this.eventManager.removeGlobalEvent(this._bindClose_mousedown);
		if (this._bindClose_click) this._bindClose_click = this.eventManager.removeGlobalEvent(this._bindClose_click);
	},

	constructor: SelectMenu
};

function OnKeyDown_refer(e) {
	let moveIndex;
	switch (e.keyCode) {
		case 38: // up
			e.preventDefault();
			e.stopPropagation();
			if (this.horizontal && this.index > -1) {
				const num = this.splitNum;
				moveIndex = this.index - num < 0 ? num : -num;
			} else {
				moveIndex = -1;
			}
			break;
		case 40: // down
			e.preventDefault();
			e.stopPropagation();
			if (this.horizontal && this.index > -1) {
				const num = this.splitNum;
				moveIndex = this.index + num > this.menuLen ? -num : num;
			} else {
				moveIndex = 1;
			}
			break;
		case 37: // left
			e.preventDefault();
			e.stopPropagation();
			moveIndex = -1;
			break;
		case 39: //right
			e.preventDefault();
			e.stopPropagation();
			moveIndex = 1;
			break;
		case 13:
		case 32: // enter, space
			if (this.index > -1) {
				e.preventDefault();
				e.stopPropagation();
				this._select(this.index);
			} else {
				this.close();
			}
			break;
	}

	if (moveIndex) this._moveItem(moveIndex);
}

function OnMousedown_list(e) {
	if (env.isGecko) {
		const target = domUtils.getParentElement(e.target, '.se-select-item');
		if (target) this._injectActiveEvent(target);
	}
}

function OnMouseMove_list(e) {
	domUtils.addClass(this.form, 'se-select-menu-mouse-move');
	const index = e.target.getAttribute('data-index');
	if (!index) return;
	this.index = index * 1;
}

function OnClick_list(e) {
	let target = e.target;
	let index = null;

	while (!index && !/UL/i.test(target.tagName) && !domUtils.hasClass(target, 'se-select-menu')) {
		index = target.getAttribute('data-index');
		target = target.parentNode;
	}

	if (!index) return;
	this._select(index * 1);
}

function CloseListener_key(e) {
	if (!/27/.test(e.keyCode)) return;
	this.close();
}

function CloseListener_mousedown(e) {
	if (this.form.contains(e.target)) return;
	if (e.target !== this._refer) {
		this.close();
	} else if (!domUtils.isInputElement(e.target)) {
		this._bindClose_click = this.eventManager.addGlobalEvent('click', this.__globalEventHandlers.click, true);
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
