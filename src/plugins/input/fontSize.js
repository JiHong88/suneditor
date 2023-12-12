import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

const DEFAULT_ENABLE_UNITS = ['px', 'pt', 'em', 'rem'];
const DEFAULT_UNIT_MAP = {
	px: {
		inc: 1,
		min: 8,
		max: 72,
		list: [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]
	},
	pt: {
		inc: 1,
		min: 6,
		max: 72,
		list: [6, 8, 10, 12, 14, 18, 22, 26, 30, 34, 38, 42, 48, 54, 60, 66, 72]
	},
	em: {
		inc: 0.1,
		min: 0.5,
		max: 5,
		list: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5]
	},
	rem: {
		inc: 0.1,
		min: 0.5,
		max: 5,
		list: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5]
	},
	vw: {
		inc: 0.1,
		min: 0.5,
		max: 10,
		list: [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	},
	vh: {
		inc: 0.1,
		min: 0.5,
		max: 10,
		list: [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	},
	'%': {
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
	const unitMap = this.unitMap[this.options.get('fontSizeUnit')];
	const menu = CreateHTML(editor, pluginOptions.items || unitMap.list);

	// plugin basic properties
	const showIncDec = pluginOptions.showIncDecControls ?? false;
	const disableInput = pluginOptions.disableInput ?? false;

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
	this.enableUnits = pluginOptions.enableUnits || DEFAULT_ENABLE_UNITS;
	this.sizeUnit = pluginOptions.sizeUnit || this.options.get('fontSizeUnit');
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
			this._setSize(target, this.editor.frameContext.get('wwComputedStyle').fontSize);
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
		const commandValue = target.getAttribute('data-command');

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

	_getSize(target) {
		target = typeof target === 'string' ? target : target.parentElement.querySelector('.__se__font_size');
		if (!target)
			return {
				unit: this.sizeUnit || this.options.get('fontSizeUnit'),
				value: 0
			};

		const value = typeof target === 'string' ? target : /^INPUT$/i.test(target.nodeName) ? target.value : target.textContent;
		const splitValue = value.split(/(\d+)/);

		let unit = (splitValue.pop() || '').trim().toLowerCase();
		unit = this.enableUnits.includes(unit) ? unit : this.sizeUnit || this.options.get('fontSizeUnit');

		return {
			unit,
			value: (splitValue.pop() || 0) * 1
		};
	},

	_setSize(target, value) {
		target = target.parentElement.querySelector('.__se__font_size');
		if (!target) return 0;

		if (/^INPUT$/i.test(target.nodeName)) {
			return (target.value = value);
		} else {
			return (target.textContent = value);
		}
	},

	constructor: FontSize
};

function CreateHTML({ lang, options }, sizeList) {
	let list = /*html*/ `
	<div class="se-list-inner">
		<ul class="se-list-basic">
			<li>
				<button type="button" class="se-btn se-btn-list default_value" title="${lang.default}" aria-label="${lang.default}">(${lang.default})</button>
			</li>`;

	for (let i = 0, unit = options.get('fontSizeUnit'), len = sizeList.length, size; i < len; i++) {
		size = sizeList[i];
		list += /*html*/ `
			<li>
				<button type="button" class="se-btn se-btn-list" data-command="${size + unit}" title="${size + unit}" aria-label="${size + unit}" style="font-size:${size + unit};">${size}</button>
			</li>`;
	}
	list += /*html*/ `
		</ul>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-font-size' }, list);
}

export default FontSize;
