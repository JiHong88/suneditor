import { dom, env, keyCodeMap } from '../../helper';

const { _w } = env;
const MENU_MIN_HEIGHT = 38;

/**
 * @typedef {Object} SelectMenuParams
 * @property {string} position Position of the select menu, specified as `"[left|right]-[middle|top|bottom]"` or `"[top|bottom]-[center|left|right]"`.
 * ```js
 * // position
 * 'left-bottom' // menu appears below, aligned to the left
 * 'top-center'  // menu appears above, centered
 * ```
 * @property {boolean} [checkList=false] Flag to determine if the checklist is enabled (`true` or `false`)
 * @property {"rtl" | "ltr"} [dir="ltr"] Optional text direction: `"rtl"` for right-to-left, `"ltr"` for left-to-right
 * @property {number} [splitNum=0] Optional split number for horizontal positioning; defines how many items per row
 * @property {() => void} [openMethod] Optional method to call when the menu is opened
 * @property {() => void} [closeMethod] Optional method to call when the menu is closed
 * @property {string} [maxHeight] Optional max-height CSS value (e.g. `"200px"`). Enables scrolling when items exceed this height.
 * @property {string} [minWidth] Optional min-width CSS value (e.g. `"130px"`).
 * @property {*} [keydownTarget]  Optional override for the keyboard navigation target. By default `on()` listens
 * - on the iframe `contentWindow` (`_ww`) when the refer isn't an input — appropriate when the
 * - refer is inside the wysiwyg. Set this to `window` (parent) for menus whose refer lives in
 * - the parent doc (e.g. BlockHandle's dragBtn in `carrierWrapper`). Also avoids
 * - cross-origin/sandboxed iframe `addEventListener` errors.
 */

/**
 * @class
 * @description Creates a select menu
 */
class SelectMenu {
	#$;

	#dirPosition;
	#dirSubPosition;
	#textDirDiff;
	#eventHandlers;
	#globalEventHandlers;

	#refer = null;
	#keydownTarget = null;
	#keydownTargetOverride = null;
	#selectMethod = null;
	#bindClose_key = null;
	#bindClose_mousedown = null;
	#bindClose_click = null;
	#bindSubmenuReposition = null;
	#events = null;
	#lastMainPosition = null;
	#lastSubPosition = null;

	// submenu
	#submenuData = new Map();
	#activeSubmenuIndex = -1;
	#submenuItemIndex = -1;
	#inSubmenu = false;
	#submenuHoverTimer = null;

	/**
	 * @constructor
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {SelectMenuParams} params SelectMenu options
	 */
	constructor($, params) {
		this.#$ = $;

		// members
		const positionItems = params.position.split('-');
		this.form = null;
		this.items = [];
		/** @type {HTMLLIElement[]} */
		this.menus = null;
		this.menuLen = 0;
		this.index = -1;
		this.item = null;
		this.isOpen = false;
		this.checkList = !!params.checkList;
		this.position = positionItems[0];
		this.subPosition = positionItems[1];
		this.splitNum = params.splitNum || 0;
		this.horizontal = !!this.splitNum;
		this.openMethod = params.openMethod;
		this.closeMethod = params.closeMethod;
		this.maxHeight = params.maxHeight || '';
		this.minWidth = params.minWidth || '';
		this.#keydownTargetOverride = params.keydownTarget || null;

		this.#dirPosition = /^(left|right)$/.test(this.position) ? (this.position === 'left' ? 'right' : 'left') : this.position;
		this.#dirSubPosition = /^(left|right)$/.test(this.subPosition) ? (this.subPosition === 'left' ? 'right' : 'left') : this.subPosition;
		this.#textDirDiff = params.dir === 'ltr' ? false : params.dir === 'rtl' ? true : null;

		this.#eventHandlers = {
			mousedown: this.#OnMousedown_list.bind(this),
			mousemove: this.#OnMouseMove_list.bind(this),
			click: this.#OnClick_list.bind(this),
			keydown: this.#OnKeyDown_refer.bind(this),
		};
		this.#globalEventHandlers = {
			keydown: this.#CloseListener_key.bind(this),
			mousedown: this.#CloseListener_mousedown.bind(this),
			click: this.#CloseListener_click.bind(this),
			submenuReposition: this.#OnSubmenuReposition.bind(this),
		};
	}

	/**
	 * @description Creates the select menu items.
	 * @param {Array<*>} items - Selectable items.
	 * - Plain entry: any value (string/object); passed to the `selectMethod` callback when picked.
	 * - Submenu entry: `{ children: Array<*>, childMenus?: Array<string|HTMLElement> }` —
	 *   `children` are the child values delivered to `selectMethod` on selection; `childMenus`
	 *   is the optional display content for each child (HTML string or `HTMLElement`). When
	 *   omitted, `children` doubles as the display content.
	 * @param {Array<string>|SunEditor.NodeCollection} [menus] - Optional list of display elements
	 * (HTML strings or nodes) for the top-level rows. Defaults to `items`. For submenu entries
	 * this controls the parent row's content; child rows use `childMenus` (or `children`).
	 * @example
	 * // Submenu — "List" opens a hover submenu of UL/OL options
	 * selectMenu.create(
	 *   [{ children: ['ul', 'ol'], childMenus: ['<i>•</i> Bulleted', '<i>1.</i> Numbered'] }],
	 *   ['List']
	 * );
	 */
	create(items, menus) {
		this.form.firstElementChild.innerHTML = '';

		// remove existing submenu elements from form
		for (const [, data] of this.#submenuData) {
			data.element?.remove();
		}
		this.#submenuData.clear();

		menus ||= items;
		let html = '';
		for (let i = 0, len = menus.length; i < len; i++) {
			if (i > 0 && i % this.splitNum === 0) {
				this.#createFormat(html);
				html = '';
			}

			const item = items[i];
			const menuContent = typeof menus[i] === 'string' ? menus[i] : /** @type {HTMLElement} */ (menus[i]).outerHTML;
			const itemObj = /** @type {{children?: Array, childMenus?: Array}} */ (item && typeof item === 'object' ? item : {});
			const hasChildren = itemObj.children?.length > 0;

			if (hasChildren) {
				let subHtml = '';
				const childMenus = itemObj.childMenus || itemObj.children;
				for (let c = 0; c < childMenus.length; c++) {
					subHtml += `<li class="se-select-item" data-parent-index="${i}" data-child-index="${c}">${typeof childMenus[c] === 'string' ? childMenus[c] : childMenus[c].outerHTML}</li>`;
				}
				html += `<li class="se-select-item se-has-submenu" data-index="${i}">${menuContent}` + `<span class="se-submenu-arrow">${this.#$.icons.menu_arrow_right}</span></li>`;

				// `popover: manual` lifts the submenu into the top layer so it escapes any
				// `overflow: hidden` on the form's ancestors (toolbar, dropdown panels, ...).
				const subEl = dom.utils.createElement('DIV', { class: 'se-select-submenu', popover: 'manual', 'data-parent-index': String(i) }, `<ul class="se-list-basic se-list-checked">${subHtml}</ul>`);
				this.#submenuData.set(i, { items: itemObj.children, menus: childMenus, element: subEl });
			} else {
				html += `<li class="se-select-item" data-index="${i}">${menuContent}</li>`;
			}
		}
		this.#createFormat(html);

		// append submenu elements to form (outside se-list-inner)
		for (const [, data] of this.#submenuData) {
			this.form.appendChild(data.element);
		}

		this.items = /** @type {Array<string|Node>} */ (items);
		this.menus = Array.from(this.form.querySelectorAll('li[data-index]'));
		this.menuLen = this.menus.length;
	}

	/**
	 * @description Initializes the select menu and attaches it to a reference element.
	 * @param {Node} referElement - The element that triggers the select menu.
	 * @param {(command: string) => void} selectMethod - The function to execute when an item is selected.
	 * @param {{class?: string, style?: string}} [attr={}] - Additional attributes for the select menu container.
	 * @example
	 * // Basic: attach menu to a button with a selection callback
	 * selectMenu.on(this.alignButton, this.onAlignSelect.bind(this));
	 *
	 * // With custom attributes for styling
	 * selectMenu.on(this.alignButton, this.onAlignSelect.bind(this), { class: 'se-figure-select-list' });
	 */
	on(referElement, selectMethod, attr = {}) {
		this.#refer = /** @type {HTMLElement} */ (referElement);
		this.#keydownTarget = this.#keydownTargetOverride || (dom.check.isInputElement(referElement) ? referElement : this.#$.frameContext.get('_ww'));
		this.#selectMethod = selectMethod;

		let innerStyle = '';
		if (this.maxHeight) innerStyle += 'max-height:' + this.maxHeight + ';overflow-y:auto;';
		if (this.minWidth) innerStyle += 'min-width:' + this.minWidth + ';';

		this.form = dom.utils.createElement(
			'DIV',
			{
				class: 'se-select-menu' + (this.#textDirDiff === true ? ' se-rtl' : '') + (attr.class ? ' ' + attr.class : ''),
				style: attr.style || '',
			},
			'<div class="se-list-inner"' + (innerStyle ? ' style="' + innerStyle + '"' : '') + '></div>',
		);

		referElement.parentNode.insertBefore(this.form, referElement);
	}

	/**
	 * @description Select menu open
	 * @param {?string} [position] `"[left|right]-[middle|top|bottom] | [top|bottom]-[center|left|right]"`
	 * Always specify in LTR orientation. In RTL environments, left/right are automatically swapped.
	 * @param {?string} [onItemQuerySelector] The querySelector string of the menu to be activated
	 * @example
	 * // Open with default position (uses constructor's position param)
	 * selectMenu.open();
	 *
	 * // Open at a specific position (always use LTR basis; RTL is auto-mirrored)
	 * selectMenu.open('bottom-left');
	 *
	 * // Open with an active item highlighted via querySelector
	 * selectMenu.open('', '[data-command="' + this.align + '"]');
	 */
	open(position, onItemQuerySelector) {
		this.#$.ui.selectMenuOn = true;

		this.openMethod?.();

		this.#addEvents();
		this.#addGlobalEvent();
		const positionItems = position ? position.split('-') : [];
		const mainPosition = positionItems[0] || (this.#textDirDiff !== null && this.#textDirDiff !== this.#$.options.get('_rtl') ? this.#dirPosition : this.position);
		const subPosition = positionItems[1] || (this.#textDirDiff !== null && this.#textDirDiff !== this.#$.options.get('_rtl') ? this.#dirSubPosition : this.subPosition);
		this.#lastMainPosition = mainPosition;
		this.#lastSubPosition = subPosition;
		this.#setPosition(mainPosition, subPosition, onItemQuerySelector);
		this.isOpen = true;
	}

	/**
	 * @description Re-runs positioning using the same direction the menu was opened with.
	 * Use when the reference element has moved (e.g. scroll repositioned the trigger) but
	 * the menu should stay open and follow.
	 */
	reposition() {
		if (!this.isOpen || !this.#lastMainPosition) return;
		this.#setPosition(this.#lastMainPosition, this.#lastSubPosition);
	}

	/**
	 * @description Soft-hide / soft-show without changing open state.
	 * close listeners (outside click, ESC) keep working, but is visually hidden until the trigger comes back.
	 */
	setHidden(hidden) {
		if (!this.isOpen) return;
		if (hidden) {
			this.#closeSubmenu();
			this.form.style.display = 'none';
		} else {
			this.reposition();
		}
	}

	/**
	 * @description Select menu close
	 */
	close() {
		this.#$.ui.selectMenuOn = false;
		dom.utils.removeClass(this.#refer, 'on');
		this.#init();
		this.form?.removeAttribute('style');
		this.isOpen = false;

		this.closeMethod?.();
	}

	/**
	 * @description Get the index of the selected item
	 * @param {number} index Item index
	 * @returns
	 */
	getItem(index) {
		return this.items[index];
	}

	/**
	 * @description Set the index of the selected item
	 * @param {number} index Item index
	 */
	setItem(index) {
		this.#selectItem(index);
	}

	/**
	 * @description Opens the submenu for the given parent index.
	 * @param {number} parentIndex
	 */
	#openSubmenu(parentIndex) {
		if (this.#activeSubmenuIndex === parentIndex) return;
		this.#closeSubmenu();

		const parentLi = this.menus[parentIndex];
		if (!parentLi || !dom.utils.hasClass(parentLi, 'se-has-submenu')) return;

		dom.utils.addClass(parentLi, 'se-submenu-open');
		this.#activeSubmenuIndex = parentIndex;
		this.#submenuItemIndex = -1;
		this.#inSubmenu = false;

		const data = this.#submenuData.get(parentIndex);
		const sub = data?.element;
		if (sub) {
			// Show first so the top-layer containing block (viewport) is in effect when we
			const supportsPopover = typeof sub.showPopover === 'function';
			sub.style.visibility = 'hidden';

			if (supportsPopover) {
				if (!sub.matches(':popover-open')) sub.showPopover();
			} else {
				sub.style.display = 'block';
			}

			this.#positionSubmenu(parentLi, sub, supportsPopover);
			sub.style.visibility = '';

			// Submenu is top-layer popover (viewport-fixed), but the parent form is in document
			// flow (absolute) and scrolls with the page/container. Re-run positioning on scroll
			// so the submenu stays anchored to the parent LI as it moves.
			this.#bindSubmenuReposition = this.#$.eventManager.addGlobalEvent('scroll', this.#globalEventHandlers.submenuReposition, true);
		}
	}

	/**
	 * @description Position the submenu element next to the parent menu
	 * @param {HTMLElement} parentLi
	 * @param {HTMLElement} sub
	 * @param {boolean} supportsPopover
	 */
	#positionSubmenu(parentLi, sub, supportsPopover) {
		// In the top layer the containing block is the viewport; otherwise it's the form.
		const formRect = supportsPopover ? { top: 0, left: 0 } : this.form.getBoundingClientRect();

		const parentRect = parentLi.getBoundingClientRect();
		const subW = sub.offsetWidth;
		const subH = sub.offsetHeight;
		const vpW = _w.innerWidth;
		const vpH = _w.innerHeight;

		// Horizontal: open in the arrow's direction — RTL prefers left of parent, LTR prefers
		// right. Flip to the opposite side if the preferred side overflows; if both overflow,
		// keep the smaller-overflow side and shift inward by exactly that amount.
		const rightVP = parentRect.right;
		const leftVP = parentRect.left - subW;
		const rightOverflow = Math.max(0, rightVP + subW - vpW);
		const leftOverflow = Math.max(0, -leftVP);
		const preferLeft = this.#textDirDiff === true;

		let leftPx;
		if (preferLeft) {
			if (leftOverflow === 0) leftPx = leftVP;
			else if (rightOverflow === 0) leftPx = rightVP;
			else if (leftOverflow <= rightOverflow) leftPx = leftVP + leftOverflow;
			else leftPx = rightVP - rightOverflow;
		} else {
			if (rightOverflow === 0) leftPx = rightVP;
			else if (leftOverflow === 0) leftPx = leftVP;
			else if (rightOverflow <= leftOverflow) leftPx = rightVP - rightOverflow;
			else leftPx = leftVP + leftOverflow;
		}

		sub.style.left = leftPx - formRect.left + 'px';
		sub.style.right = '';

		// Vertical: try top-aligned with parent; flip to bottom-anchored if it overflows
		// downward; if both directions overflow (submenu taller than viewport), keep the
		// side with the smaller overflow and shift inward by exactly that amount.
		const topVP = parentRect.top;
		const bottomVP = parentRect.bottom - subH;
		const downOverflow = Math.max(0, topVP + subH - vpH);
		const upOverflow = Math.max(0, -bottomVP);

		let topPx;
		if (downOverflow === 0) {
			topPx = topVP;
		} else if (upOverflow === 0) {
			topPx = bottomVP;
		} else if (downOverflow <= upOverflow) {
			topPx = topVP - downOverflow;
		} else {
			topPx = bottomVP + upOverflow;
		}

		sub.style.top = topPx - formRect.top + 'px';
	}

	/**
	 * @description Scroll/resize callback while submenu is open — re-runs positioning so the
	 * top-layer popover follows the parent LI which scrolls with the document.
	 */
	#OnSubmenuReposition() {
		if (this.#activeSubmenuIndex < 0) return;
		const data = this.#submenuData.get(this.#activeSubmenuIndex);
		const sub = data?.element;
		const parentLi = this.menus[this.#activeSubmenuIndex];
		if (!sub || !parentLi) return;
		this.#positionSubmenu(parentLi, sub, typeof sub.showPopover === 'function');
	}

	/**
	 * @description Closes any open submenu.
	 */
	#closeSubmenu() {
		if (this.#submenuHoverTimer) {
			_w.clearTimeout(this.#submenuHoverTimer);
			this.#submenuHoverTimer = null;
		}
		this.#bindSubmenuReposition &&= this.#$.eventManager.removeGlobalEvent(this.#bindSubmenuReposition);
		if (this.#activeSubmenuIndex > -1) {
			const parentLi = this.menus[this.#activeSubmenuIndex];
			if (parentLi) dom.utils.removeClass(parentLi, 'se-submenu-open');

			const data = this.#submenuData.get(this.#activeSubmenuIndex);
			if (data?.element) {
				if (typeof data.element.hidePopover === 'function') {
					if (data.element.matches(':popover-open')) data.element.hidePopover();
				} else {
					data.element.style.display = '';
				}
				dom.utils.removeClass(data.element.querySelectorAll('.se-select-item'), 'active');
			}
		}
		this.#activeSubmenuIndex = -1;
		this.#submenuItemIndex = -1;
		this.#inSubmenu = false;
	}

	/**
	 * @description Selects a child item from an open submenu.
	 * @param {number} parentIndex
	 * @param {number} childIndex
	 */
	#selectChild(parentIndex, childIndex) {
		const data = this.#submenuData.get(parentIndex);
		if (!data) return;
		if (this.checkList) {
			const childLi = data.element?.querySelectorAll('.se-select-item')[childIndex];
			if (childLi) dom.utils.toggleClass(childLi, 'se-checked');
		}
		this.#selectMethod(data.items[childIndex]);
	}

	/**
	 * @description Moves selection within an open submenu.
	 * @param {number} num Direction (-1 up, +1 down)
	 */
	#moveSubmenuItem(num) {
		const data = this.#submenuData.get(this.#activeSubmenuIndex);
		if (!data?.element) return;
		const items = data.element.querySelectorAll('.se-select-item');
		const len = items.length;
		if (!len) return;

		num = this.#submenuItemIndex + num;
		const idx = (this.#submenuItemIndex = num >= len ? 0 : num < 0 ? len - 1 : num);

		dom.utils.removeClass(this.form, 'se-select-menu-mouse-move');
		for (let i = 0; i < len; i++) {
			if (i === idx) dom.utils.addClass(items[i], 'active');
			else dom.utils.removeClass(items[i], 'active');
		}
	}

	/**
	 * @description Appends a formatted list of items to the menu.
	 * @param {string} html - The HTML string representing the menu items.
	 */
	#createFormat(html) {
		this.form.firstElementChild.innerHTML += `<ul class="se-list-basic se-list-checked${this.horizontal ? ' se-list-horizontal' : ''}">${html}</ul>`;
	}

	/**
	 * @description Resets the menu state and removes event listeners.
	 */
	#init() {
		this.#removeEvents();
		this.#removeGlobalEvent();
		this.#closeSubmenu();
		this.index = -1;
		this.item = null;
		if (this._onItem) {
			dom.utils.removeClass(this._onItem, 'se-select-on');
			this._onItem = null;
		}
	}

	/**
	 * @description Moves the selection up or down by a specified number of items.
	 * @param {number} num - The number of items to move (negative for up, positive for down).
	 */
	#moveItem(num) {
		num = this.index + num;
		const len = this.menuLen;
		const selectIndex = (this.index = num >= len ? 0 : num < 0 ? len - 1 : num);

		this.#selectItem(selectIndex);
	}

	/**
	 * @description Highlights and selects an item by index.
	 * @param {number} selectIndex - The index of the item to select.
	 */
	#selectItem(selectIndex) {
		dom.utils.removeClass(this.form, 'se-select-menu-mouse-move');

		const len = this.menuLen;
		for (let i = 0; i < len; i++) {
			if (i === selectIndex) {
				dom.utils.addClass(this.menus[i], 'active');
			} else {
				dom.utils.removeClass(this.menus[i], 'active');
			}
		}

		this.index = selectIndex;
		this.item = this.items[selectIndex];
	}

	/**
	 * @description Sets the position of the select menu relative to the reference element.
	 * @param {string} position Menu position (`"left"`|`"right"`) | (`"top"`|`"bottom"`)
	 * @param {string} subPosition Sub position (`"middle"`|`"top"`|`"bottom"`) | (`"center"`|`"left"`|`"right"`)
	 * @param {string} [onItemQuerySelector] - A query selector string to highlight a specific item.
	 * @param {boolean} [_re=false] - Whether this is a retry after adjusting the position.
	 */
	#setPosition(position, subPosition, onItemQuerySelector, _re) {
		const originP = position;
		const form = this.form;
		const target = this.#refer;
		form.style.visibility = 'hidden';
		form.style.display = 'block';
		dom.utils.removeClass(form, 'se-select-menu-scroll');
		dom.utils.addClass(target, 'on');

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
		const globalTarget = this.#$.offset.get(target);
		const targetOffsetTop = target.offsetTop;
		const targetGlobalTop = globalTarget.top;
		const targetHeight = target.offsetHeight;
		const wbottom = dom.utils.getClientSize().h - (targetGlobalTop - _w.scrollY + targetHeight);
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
				let formT = this.#$.offset.getGlobal(form).top;
				const modH = h - (targetGlobalTop - formT) - wbottom - targetHeight;
				if (modH > 0) {
					t -= modH + 4;
					form.style.top = t + 'px';
				}
				// over height
				formT = this.#$.offset.getGlobal(form).top;
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
			this.#setPosition(position === 'top' ? 'bottom' : 'top', subPosition, onItemQuerySelector, true);
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
		let fixedLeft = this.#$.offset.getGlobal(form).fixedLeft;
		let overW = 0;
		switch (side + '-' + (side ? originP : subPosition)) {
			case 'true-left':
				if (fixedLeft < 0) l = targetL + targetW + 1;
				break;
			case 'true-right':
				if (fixedLeft + formW > _w.innerWidth) l = targetL - formW - 1;
				break;
			case 'false-center':
				overW = _w.innerWidth - (fixedLeft + formW);
				if (overW < 0) l += overW - 4;
				form.style.left = l + 'px';
				fixedLeft = this.#$.offset.getGlobal(form).fixedLeft;
				if (fixedLeft < 0) l -= fixedLeft - 4;
				break;
			case 'false-left':
				overW = _w.innerWidth - (fixedLeft + formW);
				if (overW < 0) l += overW - 4;
				break;
			case 'false-right':
				if (fixedLeft < 0) l -= fixedLeft - 4;
				break;
		}

		if (onItemQuerySelector) {
			const item = form.firstElementChild.querySelector(onItemQuerySelector);
			if (item) {
				this._onItem = item;
				dom.utils.addClass(item, 'se-select-on');
			}
		}

		form.style.left = l + 'px';
		form.style.top = t + 'px';
		form.style.visibility = '';
	}

	/**
	 * @description Selects an item and triggers the callback function.
	 * @param {number} index - The index of the item to select.
	 */
	#select(index) {
		if (this.checkList) dom.utils.toggleClass(this.menus[index], 'se-checked');
		this.#selectMethod(this.getItem(index));
	}

	/**
	 * @description Adds event listeners for menu interactions.
	 */
	#addEvents() {
		this.#removeEvents();
		this.#events = {
			mousedown: this.#$.eventManager.addEvent(this.form, 'mousedown', this.#eventHandlers.mousedown),
			mousemove: this.#$.eventManager.addEvent(this.form, 'mousemove', this.#eventHandlers.mousemove),
			click: this.#$.eventManager.addEvent(this.form, 'click', this.#eventHandlers.click),
			keydown: this.#$.eventManager.addEvent(this.#keydownTarget, 'keydown', this.#eventHandlers.keydown),
		};
	}

	/**
	 * @description Removes event listeners for menu interactions.
	 */
	#removeEvents() {
		if (!this.#events) return;
		this.#$.eventManager.removeEvent(this.#events.mousedown);
		this.#$.eventManager.removeEvent(this.#events.mousemove);
		this.#$.eventManager.removeEvent(this.#events.click);
		this.#$.eventManager.removeEvent(this.#events.keydown);
		this.#events = null;
	}

	/**
	 * @description Adds global event listeners for closing the menu.
	 */
	#addGlobalEvent() {
		this.#removeGlobalEvent();
		this.#bindClose_key = this.#$.eventManager.addGlobalEvent('keydown', this.#globalEventHandlers.keydown, true);
		this.#bindClose_mousedown = this.#$.eventManager.addGlobalEvent('mousedown', this.#globalEventHandlers.mousedown, true);
	}

	/**
	 * @description Removes global event listeners for closing the menu.
	 */
	#removeGlobalEvent() {
		this.#bindClose_key &&= this.#$.eventManager.removeGlobalEvent(this.#bindClose_key);
		this.#bindClose_mousedown &&= this.#$.eventManager.removeGlobalEvent(this.#bindClose_mousedown);
		this.#bindClose_click &&= this.#$.eventManager.removeGlobalEvent(this.#bindClose_click);
	}

	/**
	 * @param {KeyboardEvent} e - Event object
	 */
	#OnKeyDown_refer(e) {
		// submenu keyboard navigation
		if (this.#inSubmenu) {
			switch (e.code) {
				case 'ArrowUp':
					e.preventDefault();
					e.stopPropagation();
					this.#moveSubmenuItem(-1);
					return;
				case 'ArrowDown':
					e.preventDefault();
					e.stopPropagation();
					this.#moveSubmenuItem(1);
					return;
				case 'ArrowLeft':
					e.preventDefault();
					e.stopPropagation();
					// exit submenu back to parent
					this.#inSubmenu = false;
					this.#submenuItemIndex = -1;
					{
						const subData = this.#submenuData.get(this.#activeSubmenuIndex);
						if (subData?.element) dom.utils.removeClass(subData.element.querySelectorAll('.se-select-item'), 'active');
					}
					return;
				case 'Enter':
				case 'Space':
					if (this.#submenuItemIndex > -1) {
						e.preventDefault();
						e.stopPropagation();
						this.#selectChild(this.#activeSubmenuIndex, this.#submenuItemIndex);
					}
					return;
			}
		}

		let moveIndex;
		switch (e.code) {
			case 'ArrowUp': // up
				e.preventDefault();
				e.stopPropagation();
				if (this.horizontal && this.index > -1) {
					const num = this.splitNum;
					moveIndex = this.index - num < 0 ? num : -num;
				} else {
					moveIndex = -1;
				}
				break;
			case 'ArrowDown': // down
				e.preventDefault();
				e.stopPropagation();
				if (this.horizontal && this.index > -1) {
					const num = this.splitNum;
					moveIndex = this.index + num > this.menuLen ? -num : num;
				} else {
					moveIndex = 1;
				}
				break;
			case 'ArrowLeft': // left
				e.preventDefault();
				e.stopPropagation();
				moveIndex = -1;
				break;
			case 'ArrowRight': // right — enter submenu if available
				e.preventDefault();
				e.stopPropagation();
				if (this.index > -1 && this.#submenuData.has(this.index)) {
					this.#openSubmenu(this.index);
					this.#inSubmenu = true;
					this.#moveSubmenuItem(1);
					return;
				}
				moveIndex = 1;
				break;
			case 'Enter':
			case 'Space': // enter, space
				if (this.index > -1) {
					e.preventDefault();
					e.stopPropagation();
					if (this.#submenuData.has(this.index)) {
						this.#openSubmenu(this.index);
						this.#inSubmenu = true;
						this.#moveSubmenuItem(1);
					} else {
						this.#select(this.index);
					}
				} else {
					this.close();
				}
				break;
		}

		if (moveIndex) {
			this.#closeSubmenu();
			this.#moveItem(moveIndex);
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnMousedown_list(e) {
		if (env.isGecko) {
			const eventTarget = dom.query.getEventTarget(e);
			const target = dom.query.getParentElement(eventTarget, '.se-select-item');
			if (target) this.#$.eventManager._injectActiveEvent(target);
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnMouseMove_list(e) {
		const eventTarget = dom.query.getEventTarget(e);
		dom.utils.addClass(this.form, 'se-select-menu-mouse-move');

		// hovering inside a submenu
		const childIndex = eventTarget.getAttribute('data-child-index');
		if (childIndex !== null) {
			this.#submenuItemIndex = Number(childIndex);
			const subData = this.#submenuData.get(this.#activeSubmenuIndex);
			if (subData?.element) {
				const items = subData.element.querySelectorAll('.se-select-item');
				dom.utils.removeClass(items, 'active');
				dom.utils.addClass(items[this.#submenuItemIndex], 'active');
			}
			return;
		}

		const index = eventTarget.getAttribute('data-index');
		if (!index) return;
		const numIndex = Number(index);
		this.index = numIndex;

		// submenu hover logic
		if (this.#submenuData.has(numIndex)) {
			if (this.#submenuHoverTimer) _w.clearTimeout(this.#submenuHoverTimer);
			this.#openSubmenu(numIndex);
		} else if (this.#activeSubmenuIndex > -1) {
			// check if mouse is inside the active submenu
			const activeData = this.#submenuData.get(this.#activeSubmenuIndex);
			if (!activeData?.element?.contains(eventTarget)) {
				this.#closeSubmenu();
			}
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnClick_list(e) {
		let target = dom.query.getEventTarget(e);
		let index = null;
		let childIndex = null;

		while (!index && !childIndex && !/UL/i.test(target.tagName) && !dom.utils.hasClass(target, 'se-select-menu')) {
			childIndex = target.getAttribute('data-child-index');
			if (!childIndex) index = target.getAttribute('data-index');
			target = target.parentElement;
		}

		// child item click
		if (childIndex !== null) {
			let parentTarget = target;
			let parentIndex = null;
			while (!parentIndex && parentTarget) {
				parentIndex = parentTarget.getAttribute('data-parent-index') || parentTarget.getAttribute('data-index');
				parentTarget = parentTarget.parentElement;
			}
			if (parentIndex !== null) this.#selectChild(Number(parentIndex), Number(childIndex));
			return;
		}

		if (!index) return;
		const numIndex = Number(index);

		// parent with children — toggle submenu instead of selecting
		if (this.#submenuData.has(numIndex)) {
			if (this.#activeSubmenuIndex === numIndex) this.#closeSubmenu();
			else this.#openSubmenu(numIndex);
			return;
		}

		this.#select(numIndex);
	}

	/**
	 * @param {KeyboardEvent} e - Event object
	 */
	#CloseListener_key(e) {
		if (!keyCodeMap.isEsc(e.code)) return;
		this.close();
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#CloseListener_mousedown(e) {
		const eventTarget = dom.query.getEventTarget(e);
		if (this.form.contains(eventTarget)) return;
		if (!this.#refer.contains(eventTarget)) {
			this.close();
		} else if (!dom.check.isInputElement(eventTarget)) {
			this.#bindClose_click = this.#$.eventManager.addGlobalEvent('click', this.#globalEventHandlers.click, true);
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#CloseListener_click(e) {
		this.#bindClose_click = this.#$.eventManager.removeGlobalEvent(this.#bindClose_click);
		if (e.target === this.#refer) {
			e.stopPropagation();
			this.close();
		}
	}
}

export default SelectMenu;
