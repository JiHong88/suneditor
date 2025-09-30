import EditorInjector from '../../editorInjector';
import { dom, numbers, keyCodeMap } from '../../helper';

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
 * @typedef {Object} FontSizePluginOptions
 * @property {string} [sizeUnit='px'] - The unit for the font size.
 * - Accepted values include: 'px', 'pt', 'em', 'rem', 'vw', 'vh', '%' or 'text'.
 * - If 'text' is used, a text-based font size list is applied.
 * @property {boolean} [showDefaultSizeLabel=true] - Determines whether the default size label is displayed in the dropdown menu.
 * @property {boolean} [showIncDecControls=false] - When true, displays increase and decrease buttons for font size adjustments.
 * @property {boolean} [disableInput=true] - When true, disables the direct font size input box.
 * @property {Object<string, {default: number, inc: number, min: number, max: number, list: Array<number>}>} [unitMap={}] - Optional object to override or extend the default unit mapping for font sizes.
 */

/**
 * @class
 * @description FontSize Plugin
 * - This plugin enables users to modify the font size of selected text within the editor.
 * - It supports various measurement units (e.g., 'px', 'pt', 'em', 'rem', 'vw', 'vh', '%') and
 * - provides multiple interfaces: dropdown menus, direct input, and optional increment/decrement buttons.
 */
class FontSize extends EditorInjector {
	static key = 'fontSize';
	static type = 'input';
	static className = 'se-btn-select se-btn-input se-btn-tool-font-size';

	#disableInput;

	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {FontSizePluginOptions} pluginOptions - Configuration options for the FontSize plugin.
	 */
	constructor(editor, pluginOptions) {
		super(editor);

		// create HTML
		this.unitMap = { ...DEFAULT_UNIT_MAP, ...(pluginOptions.unitMap || {}) };
		this.sizeUnit = /text/.test(pluginOptions.sizeUnit) ? '' : pluginOptions.sizeUnit || this.options.get('fontSizeUnits')[0];

		const unitMap = this.unitMap[this.sizeUnit || 'text'];
		const menu = CreateHTML(editor, unitMap, this.sizeUnit, pluginOptions.showDefaultSizeLabel);

		// plugin basic properties
		const showIncDec = this.sizeUnit ? (pluginOptions.showIncDecControls ?? false) : false;
		const disableInput = this.sizeUnit ? (pluginOptions.disableInput ?? false) : true;

		this.title = this.lang.fontSize;
		this.inner =
			disableInput && !showIncDec
				? false
				: disableInput
					? `<span class="se-txt se-not-arrow-text __se__font_size">${this.lang.fontSize}</span>`
					: `<input type="text" class="__se__font_size se-not-arrow-text" placeholder="${this.lang.fontSize}" />`;

		// increase, decrease buttons
		if (showIncDec) {
			this.beforeItem = dom.utils.createElement(
				'button',
				{ class: 'se-btn se-tooltip se-sub-btn', 'data-command': FontSize.key, 'data-type': 'command', 'data-value': 'dec' },
				`${this.icons.minus}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.decrease}</span></span>`
			);
			this.afterItem = dom.utils.createElement(
				'button',
				{ class: 'se-btn se-tooltip se-sub-btn', 'data-command': FontSize.key, 'data-type': 'command', 'data-value': 'inc' },
				`${this.icons.plus}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.increase}</span></span>`
			);
		} else if (!disableInput) {
			this.afterItem = dom.utils.createElement(
				'button',
				{ class: 'se-btn se-tooltip se-sub-arrow-btn', 'data-command': FontSize.key, 'data-type': 'dropdown' },
				`${this.icons.arrow_down}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.fontSize}</span></span>`
			);
			this.menu.initDropdownTarget({ key: FontSize.key, type: 'dropdown' }, menu);
		} else if (disableInput && !showIncDec) {
			this.replaceButton = dom.utils.createElement(
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
		this.#disableInput = disableInput;

		// init
		this.menu.initDropdownTarget(FontSize, menu);
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement=} element - Node element where the cursor is currently located
	 * @param {?HTMLElement=} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	active(element, target) {
		if (!dom.utils.hasClass(target, '__se__font_size')) return false;

		let fontSize = '';
		if (!element) {
			this.#setSize(target, this.#getDefaultSize());
		} else if (this.format.isLine(element)) {
			return undefined;
		} else if ((fontSize = dom.utils.getStyle(element, 'fontSize'))) {
			this.#setSize(target, fontSize);
			return true;
		}

		return false;
	}

	/**
	 * @editorMethod Editor.Toolbar
	 * @description Executes the event function of toolbar's input tag - "keydown".
	 * @param {Object} params
	 * @param {HTMLElement} params.target Input element
	 * @param {KeyboardEvent} params.event Event object
	 */
	onInputKeyDown({ target, event }) {
		const keyCode = event.code;

		if (this.#disableInput || keyCodeMap.isSpace(keyCode)) {
			event.preventDefault();
			return;
		}

		if (!/^(38|40|13)$/.test(keyCode)) return;

		const { value, unit } = this.#getSize(target);
		if (!value) return;

		const numValue = numbers.get(value);
		const unitMap = this.unitMap[unit];
		let changeValue = numValue;
		switch (keyCode) {
			case 'ArrowUp': //up
				changeValue += unitMap.inc;
				if (changeValue > unitMap.max) changeValue = numValue;
				break;
			case 'ArrowDown': //down
				changeValue -= unitMap.inc;
				if (changeValue < unitMap.min) changeValue = numValue;
		}

		event.preventDefault();

		try {
			this.isInputActive = true;
			const size = this.#setSize(target, changeValue + unit);
			if (this.#disableInput) return;

			const newNode = dom.utils.createElement('SPAN', { style: 'font-size: ' + size + ';' });
			this.inline.apply(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });

			if (!keyCodeMap.isEnter(keyCode)) target.focus();
		} finally {
			this.isInputActive = false;
		}
	}

	/**
	 * @editorMethod Editor.Toolbar
	 * @description Executes the event function of toolbar's input tag - "change".
	 * @param {__se__PluginToolbarInputChangeEventInfo} params
	 */
	onInputChange({ target, value: changeValue, event }) {
		if (this.#disableInput) return;

		try {
			this.isInputActive = true;

			// eslint-disable-next-line prefer-const
			let { value, unit } = this.#getSize(changeValue);
			const { max, min } = this.unitMap[unit];
			value = value > max ? max : value < min ? min : value;

			const newNode = dom.utils.createElement('SPAN', { style: 'font-size: ' + this.#setSize(target, value + unit) + ';' });
			this.inline.apply(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });
		} finally {
			this.isInputActive = false;
			event.preventDefault();
			this.editor.focus();
		}
	}

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} target Line element at the current cursor position
	 */
	on(target) {
		const { value, unit } = this.#getSize(target);
		const currentSize = value + unit;

		if (currentSize === this.currentSize) return;

		const sizeList = this.sizeList;
		for (let i = 0, len = sizeList.length; i < len; i++) {
			if (currentSize === sizeList[i].getAttribute('data-value')) {
				dom.utils.addClass(sizeList[i], 'active');
			} else {
				dom.utils.removeClass(sizeList[i], 'active');
			}
		}

		this.currentSize = currentSize;
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 */
	action(target) {
		const commandValue = target.getAttribute('data-command');

		if (commandValue === FontSize.key) {
			const { value, unit } = this.#getSize(target);
			let newSize = numbers.get(value) + (target.getAttribute('data-value') === 'inc' ? 1 : -1);
			const { min, max } = this.unitMap[unit];
			newSize = newSize < min ? min : newSize > max ? max : newSize;

			const newNode = dom.utils.createElement('SPAN', { style: 'font-size: ' + newSize + unit + ';' });
			this.inline.apply(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });
		} else if (commandValue) {
			const newNode = dom.utils.createElement('SPAN', { style: 'font-size: ' + commandValue + ';' });
			this.inline.apply(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });
		} else {
			this.inline.apply(null, { stylesToModify: ['font-size'], nodesToRemove: ['span'], strictRemove: true });
		}

		this.menu.dropdownOff();
	}

	/**
	 * @description Retrieves the default font size of the editor.
	 * @returns {string} - The computed font size from the editor.
	 */
	#getDefaultSize() {
		return this.frameContext.get('wwComputedStyle').fontSize;
	}

	/**
	 * @description Extracts the font size and unit from the given element or input value.
	 * @param {string|Element} target - The target input or element.
	 * @returns {{ unit: string, value: number|string }} - An object containing:
	 * - `unit` (string): The detected font size unit.
	 * - `value` (number|string): The numeric font size value or text-based size.
	 */
	#getSize(target) {
		target = typeof target === 'string' ? target : target.parentElement.querySelector('.__se__font_size');
		if (!target)
			return {
				unit: this.sizeUnit,
				value: this.sizeUnit ? 0 : ''
			};

		const size = typeof target === 'string' ? target : dom.check.isInputElement(target) ? target.value : target.textContent;
		const splitValue = this.sizeUnit ? size.split(/(\d+)/) : [size, ''];

		let unit = (splitValue.pop() || '').trim().toLowerCase();
		unit = this.options.get('fontSizeUnits').includes(unit) ? unit : this.sizeUnit;

		const tempValue = splitValue.pop();
		const value = unit ? Number(tempValue) : tempValue;

		return {
			unit,
			value
		};
	}

	/**
	 * @description Sets the font size in the toolbar input field or button label.
	 * @param {HTMLElement} target - The target element in the toolbar.
	 * @param {string|number} value - The font size value.
	 * @returns {string|number} - The applied font size.
	 */
	#setSize(target, value) {
		target = target.parentElement.querySelector('.__se__font_size');
		if (!target) return 0;

		if (dom.check.isInputElement(target)) {
			return (target.value = String(value));
		} else {
			return (target.textContent = String(this.sizeUnit ? value : this.unitMap.text.list.find((v) => v.size === value)?.title || value));
		}
	}
}

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

	return dom.utils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-font-size' }, list);
}

export default FontSize;
