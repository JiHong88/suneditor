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

const FontSize = function (editor, pluginOptions) {
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
		this.beforeButton = domUtils.createElement(
			'button',
			{ class: 'se-btn se-tooltip se-sub-btn', 'data-command': FontSize.key, 'data-type': 'command', 'data-value': 'dec' },
			`${this.icons.minus}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.decrease}</span></span>`
		);
		this.afterButton = domUtils.createElement(
			'button',
			{ class: 'se-btn se-tooltip se-sub-btn', 'data-command': FontSize.key, 'data-type': 'command', 'data-value': 'inc' },
			`${this.icons.plus}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.increase}</span></span>`
		);
	} else if (!disableInput) {
		this.afterButton = domUtils.createElement(
			'button',
			{ class: `se-btn se-tooltip se-sub-arrow-btn`, 'data-command': FontSize.key, 'data-type': 'dropdown' },
			`${this.icons.arrow_down}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.fontSize}</span></span>`
		);
		this.menu.initDropdownTarget({ key: FontSize.key, type: 'dropdown' }, menu);
	} else if (disableInput && !showIncDec) {
		this.replaceButton = domUtils.createElement(
			'button',
			{ class: `se-btn se-tooltip se-btn-select se-btn-tool-font-size`, 'data-command': FontSize.key, 'data-type': 'dropdown' },
			`<span class="se-txt __se__font_size">${this.lang.fontSize}</span>${this.icons.arrow_down}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.fontSize}</span></span>`
		);
		this.menu.initDropdownTarget({ key: FontSize.key, type: 'dropdown' }, menu);
	}

	// members
	this.currentSize = '';
	this.sizeList = menu.querySelectorAll('li button');
	this.hasInputFocus = false;
	this.__isActive = false; // input target event
	this._disableInput = disableInput;

	// init
	this.menu.initDropdownTarget(FontSize, menu);
};

FontSize.key = 'fontSize';
FontSize.type = 'input';
FontSize.option = 'increase';
FontSize.className = 'se-btn-select se-btn-input se-btn-tool-font-size';
FontSize.prototype = {
	/**
	 * @override core
	 */
	active(element, target) {
		if (!element) {
			this._setSize(target, this._getDefaultSize());
		} else if (element?.style.fontSize.length > 0) {
			this._setSize(target, element.style.fontSize);
			return true;
		}

		return false;
	},

	/**
	 * @override core
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
			this.__isActive = true;

			const newNode = domUtils.createElement('SPAN', { style: 'font-size: ' + this._setSize(target, changeValue + unit) + ';' });
			this.format.applyTextStyle(newNode, ['font-size'], null, null);

			if (keyCode !== 13) target.focus();
		} finally {
			this.__isActive = false;
		}
	},

	/**
	 * @override core
	 */
	onInputChange({ target, value: changeValue, event }) {
		if (this._disableInput) return;

		try {
			this.__isActive = true;

			let { value, unit } = this._getSize(changeValue);
			const { max, min } = this.unitMap[unit];
			value = value > max ? max : value < min ? min : value;

			const newNode = domUtils.createElement('SPAN', { style: 'font-size: ' + this._setSize(target, value + unit) + ';' });
			this.format.applyTextStyle(newNode, ['font-size'], null, null);
		} finally {
			this.__isActive = false;
			event.preventDefault();
			this.editor.focus();
		}
	},

	/**
	 * @override dropdown
	 */
	on(target) {
		const sizeList = this.sizeList;
		const { value, unit } = this._getSize(target);
		const currentSize = value + unit;

		if (currentSize !== this.currentSize) {
			for (let i = 0, len = sizeList.length; i < len; i++) {
				if (currentSize === sizeList[i].getAttribute('data-command')) {
					domUtils.addClass(sizeList[i], 'active');
				} else {
					domUtils.removeClass(sizeList[i], 'active');
				}
			}

			this.currentSize = currentSize;
		}
	},

	/**
	 * @override
	 * @param {Element} target Target command button
	 */
	action(target) {
		const commandValue = target.getAttribute('data-value');

		if (commandValue === FontSize.key) {
			const { value, unit } = this._getSize(target);
			let newSize = value + (target.getAttribute('data-value') === 'inc' ? 1 : -1);
			const { min, max } = this.unitMap[unit];
			newSize = newSize < min ? min : newSize > max ? max : newSize;

			const newNode = domUtils.createElement('SPAN', { style: 'font-size: ' + newSize + unit + ';' });
			this.format.applyTextStyle(newNode, ['font-size'], null, null);
		} else if (commandValue) {
			const newNode = domUtils.createElement('SPAN', { style: 'font-size: ' + commandValue + ';' });
			this.format.applyTextStyle(newNode, ['font-size'], null, null);
		} else {
			this.format.applyTextStyle(null, ['font-size'], ['span'], true);
		}

		this.menu.dropdownOff();
	},

	_getDefaultSize() {
		return this.editor.frameContext.get('wwComputedStyle').fontSize;
	},

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
				<button type="button" class="se-btn se-btn-list${d}" data-command="${t}" data-value="${v}" title="${l}" aria-label="${l}" style="font-size:${v};">${l}</button>
			</li>`;
	}

	list += /*html*/ `
		</ul>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-font-size' }, list);
}

export default FontSize;
