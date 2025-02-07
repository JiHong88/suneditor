import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

const DEFAULT_UNIT_MAP = {
	text: {
		default: '13px',
		list: [
			{
				title: 'XX-Small',
				size: '8px'
			},
			{
				title: 'X-Small',
				size: '10px'
			},
			{
				title: 'Small',
				size: '13px'
			},
			{
				title: 'Medium',
				size: '16px'
			},
			{
				title: 'Large',
				size: '18px'
			},
			{
				title: 'X-Large',
				size: '24px'
			},
			{
				title: 'XX-Large',
				size: '32px'
			}
		]
	},
	px: {
		default: 13,
		inc: 1,
		min: 8,
		max: 72,
		list: [8, 10, 13, 15, 18, 20, 22, 26, 28, 36, 48, 72]
	},
	pt: {
		default: 10,
		inc: 1,
		min: 6,
		max: 72,
		list: [6, 8, 10, 12, 14, 18, 22, 26, 32]
	},
	em: {
		default: 1,
		inc: 0.1,
		min: 0.5,
		max: 5,
		list: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]
	},
	rem: {
		default: 1,
		inc: 0.1,
		min: 0.5,
		max: 5,
		list: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]
	},
	vw: {
		inc: 0.1,
		min: 0.5,
		max: 10,
		list: [2, 3.5, 4, 4.5, 6, 8]
	},
	vh: {
		default: 1.5,
		inc: 0.1,
		min: 0.5,
		max: 10,
		list: [1, 1.5, 2, 2.5, 3, 3.5, 4]
	},
	'%': {
		default: 100,
		inc: 1,
		min: 50,
		max: 200,
		list: [50, 70, 90, 100, 120, 140, 160, 180, 200]
	}
};

/**
 * @typedef {import('../../core/base/eventManager').PluginToolbarInputKeyEventInfo} PluginToolbarInputKeyEventInfo
 */

/**
 * @typedef {import('../../core/base/eventManager').PluginToolbarInputChangeEventInfo} PluginToolbarInputChangeEventInfo
 */

/**
 * @class
 * @description FontSize Plugin
 * - This plugin enables users to modify the font size of selected text within the editor.
 * - It supports various measurement units (e.g., 'px', 'pt', 'em', 'rem', 'vw', 'vh', '%') and
 * - provides multiple interfaces: dropdown menus, direct input, and optional increment/decrement buttons.
 * @param {object} editor - The root editor instance
 * @param {object} pluginOptions - Configuration options for the FontSize plugin.
 * @param {string=} [pluginOptions.sizeUnit='px'] - The unit for the font size.
 * - Accepted values include: 'px', 'pt', 'em', 'rem', 'vw', 'vh', '%' or 'text'.
 * - If 'text' is used, a text-based font size list is applied.
 * @param {boolean=} [pluginOptions.showDefaultSizeLabel=true] - Determines whether the default size label is displayed in the dropdown menu.
 * @param {boolean=} [pluginOptions.showIncDecControls=false] - When true, displays increase and decrease buttons for font size adjustments.
 * @param {boolean=} [pluginOptions.disableInput=true] - When true, disables the direct font size input box.
 * @param {object=} [pluginOptions.unitMap={}] - Optional object to override or extend the default unit mapping for font sizes.
 */
function FontSize(editor, pluginOptions) {
	EditorInjector.call(this, editor);

	// create HTML
	this.unitMap = { ...DEFAULT_UNIT_MAP, ...(pluginOptions.unitMap || {}) };
	this.sizeUnit = /text/.test(pluginOptions.sizeUnit) ? '' : pluginOptions.sizeUnit || this.options.get('fontSizeUnits')[0];

	const unitMap = this.unitMap[this.sizeUnit || 'text'];
	const menu = CreateHTML(editor, unitMap, this.sizeUnit, pluginOptions.showDefaultSizeLabel);

	// plugin basic properties
	const showIncDec = this.sizeUnit ? pluginOptions.showIncDecControls ?? false : false;
	const disableInput = this.sizeUnit ? pluginOptions.disableInput ?? false : true;

	this.title = this.lang.fontSize;
	this.inner =
		disableInput && !showIncDec
			? false
			: disableInput
			? `<span class="se-txt se-not-arrow-text __se__font_size">${this.lang.fontSize}</span>`
			: `<input type="text" class="__se__font_size se-not-arrow-text" placeholder="${this.lang.fontSize}" />`;

	// increase, decrease buttons
	if (showIncDec) {
		this.beforeItem = domUtils.createElement(
			'button',
			{ class: 'se-btn se-tooltip se-sub-btn', 'data-command': FontSize.key, 'data-type': 'command', 'data-value': 'dec' },
			`${this.icons.minus}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.decrease}</span></span>`
		);
		this.afterItem = domUtils.createElement(
			'button',
			{ class: 'se-btn se-tooltip se-sub-btn', 'data-command': FontSize.key, 'data-type': 'command', 'data-value': 'inc' },
			`${this.icons.plus}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.increase}</span></span>`
		);
	} else if (!disableInput) {
		this.afterItem = domUtils.createElement(
			'button',
			{ class: 'se-btn se-tooltip se-sub-arrow-btn', 'data-command': FontSize.key, 'data-type': 'dropdown' },
			`${this.icons.arrow_down}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.fontSize}</span></span>`
		);
		this.menu.initDropdownTarget({ key: FontSize.key, type: 'dropdown' }, menu);
	} else if (disableInput && !showIncDec) {
		this.replaceButton = domUtils.createElement(
			'button',
			{ class: 'se-btn se-tooltip se-btn-select se-btn-tool-font-size', 'data-command': FontSize.key, 'data-type': 'dropdown' },
			`<span class="se-txt __se__font_size">${this.lang.fontSize}</span>${this.icons.arrow_down}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.fontSize}</span></span>`
		);
		this.menu.initDropdownTarget({ key: FontSize.key, type: 'dropdown' }, menu);
	}

	// members
	this.currentSize = '';
	this.sizeList = menu.querySelectorAll('li button');
	this.hasInputFocus = false;
	this.isInputActive = false; // input target event
	this._disableInput = disableInput;

	// init
	this.menu.initDropdownTarget(FontSize, menu);
}

FontSize.key = 'fontSize';
FontSize.type = 'input';
FontSize.className = 'se-btn-select se-btn-input se-btn-tool-font-size';
FontSize.prototype = {
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?Element} element - Node element where the cursor is currently located
	 * @param {?Element} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 */
	active(element, target) {
		if (!domUtils.hasClass(target, '__se__font_size')) return false;

		if (!element) {
			this._setSize(target, this._getDefaultSize());
		} else if (element?.style.fontSize.length > 0) {
			this._setSize(target, element.style.fontSize);
			return true;
		}

		return false;
	},

	/**
	 * @editorMethod Editor.Toolbar
	 * @description Executes the event function of toolbar's input tag - "keydown".
	 * @param {PluginToolbarInputKeyEventInfo} params
	 */
	onInputKeyDown({ target, event }) {
		const keyCode = event.keyCode;

		if (this._disableInput || keyCode === 32) {
			event.preventDefault();
			return;
		}

		if (!/^(38|40|13)$/.test(keyCode)) return;

		const { value, unit } = this._getSize(target);
		if (!value) return;

		const unitMap = this.unitMap[unit];
		let changeValue = value;
		switch (keyCode) {
			case 38: //up
				changeValue += unitMap.inc;
				if (changeValue > unitMap.max) changeValue = value;
				break;
			case 40: //down
				changeValue -= unitMap.inc;
				if (changeValue < unitMap.min) changeValue = value;
		}

		event.preventDefault();

		try {
			this.isInputActive = true;
			const size = this._setSize(target, changeValue + unit);
			if (this._disableInput) return;

			const newNode = domUtils.createElement('SPAN', { style: 'font-size: ' + size + ';' });
			this.format.applyInlineElement(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });

			if (keyCode !== 13) target.focus();
		} finally {
			this.isInputActive = false;
		}
	},

	/**
	 * @editorMethod Editor.Toolbar
	 * @description Executes the event function of toolbar's input tag - "change".
	 * @param {PluginToolbarInputChangeEventInfo} params
	 */
	onInputChange({ target, value: changeValue, event }) {
		if (this._disableInput) return;

		try {
			this.isInputActive = true;

			// eslint-disable-next-line prefer-const
			let { value, unit } = this._getSize(changeValue);
			const { max, min } = this.unitMap[unit];
			value = value > max ? max : value < min ? min : value;

			const newNode = domUtils.createElement('SPAN', { style: 'font-size: ' + this._setSize(target, value + unit) + ';' });
			this.format.applyInlineElement(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });
		} finally {
			this.isInputActive = false;
			event.preventDefault();
			this.editor.focus();
		}
	},

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {Element} target Line element at the current cursor position
	 */
	on(target) {
		const { value, unit } = this._getSize(target);
		const currentSize = value + unit;

		if (currentSize === this.currentSize) return;

		const sizeList = this.sizeList;
		for (let i = 0, len = sizeList.length; i < len; i++) {
			if (currentSize === sizeList[i].getAttribute('data-value')) {
				domUtils.addClass(sizeList[i], 'active');
			} else {
				domUtils.removeClass(sizeList[i], 'active');
			}
		}

		this.currentSize = currentSize;
	},

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {?Element} target - The plugin's toolbar button element
	 */
	action(target) {
		const commandValue = target.getAttribute('data-command');

		if (commandValue === FontSize.key) {
			const { value, unit } = this._getSize(target);
			let newSize = value + (target.getAttribute('data-value') === 'inc' ? 1 : -1);
			const { min, max } = this.unitMap[unit];
			newSize = newSize < min ? min : newSize > max ? max : newSize;

			const newNode = domUtils.createElement('SPAN', { style: 'font-size: ' + newSize + unit + ';' });
			this.format.applyInlineElement(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });
		} else if (commandValue) {
			const newNode = domUtils.createElement('SPAN', { style: 'font-size: ' + commandValue + ';' });
			this.format.applyInlineElement(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });
		} else {
			this.format.applyInlineElement(null, { stylesToModify: ['font-size'], nodesToRemove: ['span'], strictRemove: true });
		}

		this.menu.dropdownOff();
	},

	/**
	 * @private
	 * @description Retrieves the default font size of the editor.
	 * @returns {string} - The computed font size from the editor.
	 */
	_getDefaultSize() {
		return this.editor.frameContext.get('wwComputedStyle').fontSize;
	},

	/**
	 * @private
	 * @description Extracts the font size and unit from the given element or input value.
	 * @param {string|Element} target - The target input or element.
	 * @returns {{ unit: string, value: number|string }} - An object containing:
	 * - `unit` (string): The detected font size unit.
	 * - `value` (number|string): The numeric font size value or text-based size.
	 */
	_getSize(target) {
		target = typeof target === 'string' ? target : target.parentElement.querySelector('.__se__font_size');
		if (!target)
			return {
				unit: this.sizeUnit,
				value: this.sizeUnit ? 0 : ''
			};

		const size = typeof target === 'string' ? target : /^INPUT$/i.test(target.nodeName) ? target.value : target.textContent;
		const splitValue = this.sizeUnit ? size.split(/(\d+)/) : [size, ''];

		let unit = (splitValue.pop() || '').trim().toLowerCase();
		unit = this.options.get('fontSizeUnits').includes(unit) ? unit : this.sizeUnit;

		let value = splitValue.pop();
		value = unit ? value * 1 : value;

		return {
			unit,
			value
		};
	},

	/**
	 * @private
	 * @description Sets the font size in the toolbar input field or button label.
	 * @param {Element} target - The target element in the toolbar.
	 * @param {string|number} value - The font size value.
	 * @returns {string|number} - The applied font size.
	 */
	_setSize(target, value) {
		target = target.parentElement.querySelector('.__se__font_size');
		if (!target) return 0;

		if (/^INPUT$/i.test(target.nodeName)) {
			return (target.value = value);
		} else {
			return (target.textContent = this.sizeUnit ? value : this.unitMap.text.list.find((v) => v.size === value)?.title || value);
		}
	},

	constructor: FontSize
};

function CreateHTML({ lang }, unitMap, sizeUnit, showDefaultSizeLabel) {
	const sizeList = unitMap.list;
	const defaultSize = unitMap.default;
	const defaultLang = showDefaultSizeLabel ? lang.default : '';

	let list = /*html*/ `
	<div class="se-list-inner">
		<ul class="se-list-basic">`;

	for (let i = 0, len = sizeList.length, size, t, v, d, l; i < len; i++) {
		size = sizeList[i];

		if (typeof size === 'object') {
			t = size.title;
			v = size.size;
		} else {
			t = v = size + sizeUnit;
		}

		d = defaultSize === v ? ' default_value' : '';
		l = d ? defaultLang || t : t;
		list += /*html*/ `
			<li>
				<button type="button" class="se-btn se-btn-list${d}" data-command="${v}" data-value="${t}" title="${l}" aria-label="${l}" style="font-size:${v};">${l}</button>
			</li>`;
	}

	list += /*html*/ `
		</ul>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-font-size' }, list);
}

export default FontSize;
