import { domUtils, converter } from '../helper';
import CoreInjector from '../editorInjector/_core';
import { HueSlider } from '../modules';

const DEFAULT_COLOR_LIST = [
	'#ff0000',
	'#ff5e00',
	'#ffe400',
	'#abf200',
	'#00d8ff',
	'#0055ff',
	'#6600ff',
	'#ff00dd',
	'#000000',
	'#ffd8d8',
	'#fae0d4',
	'#faf4c0',
	'#e4f7ba',
	'#d4f4fa',
	'#d9e5ff',
	'#e8d9ff',
	'#ffd9fa',
	'#f1f1f1',
	'#ffa7a7',
	'#ffc19e',
	'#faed7d',
	'#cef279',
	'#b2ebf4',
	'#b2ccff',
	'#d1b2ff',
	'#ffb2f5',
	'#bdbdbd',
	'#f15f5f',
	'#f29661',
	'#e5d85c',
	'#bce55c',
	'#5cd1e5',
	'#6699ff',
	'#a366ff',
	'#f261df',
	'#8c8c8c',
	'#980000',
	'#993800',
	'#998a00',
	'#6b9900',
	'#008299',
	'#003399',
	'#3d0099',
	'#990085',
	'#353535',
	'#670000',
	'#662500',
	'#665c00',
	'#476600',
	'#005766',
	'#002266',
	'#290066',
	'#660058',
	'#222222'
];

const DEFAULLT_COLOR_SPLITNUM = 9;

/**
 * @description Create a color picker element and register for related events. (this.target)
 * When calling the color selection, "submit", and "remove" buttons, the "action" method of the instance is called with the "color" value as an argument.
 * @param {Object} inst The "this" object of the calling function.
 * @param {string} styles style property ("color", "backgroundColor"..)
 * @param {Array.<string>} colorList color list
 * @param {string} _defaultColor default color
 */
const ColorPicker = function (inst, styles, params) {
	const editor = inst.editor;
	CoreInjector.call(this, editor);

	// members
	this.kind = inst.constructor.key;
	this.inst = inst;
	this.target = CreateHTML(editor, params);
	this.targetButton = null;
	this.inputElement = this.target.querySelector('.se-color-input');
	this.styleProperties = styles;
	this.splitNum = params.splitNum || 0;
	this.defaultColor = params.defaultColor;
	this.hueSliderOptions = params.hueSliderOptions;
	this.parentDisplay = '';
	this.currentColor = '';
	this.parentForm = null;
	this.colorList = this.target.querySelectorAll('li button') || [];
	this.hueSlider = null;

	// modules - hex, hue slider
	if (!params.disableHEXInput) {
		this.hueSlider = new HueSlider(this, params.hueSliderOptions, 'se-dropdown');
		this.parentFormDisplay = [];
		this.parentForm = params.hueSliderOptions?.controllerOptions?.parents?.length > 0 && !params.hueSliderOptions?.controllerOptions?.isInsideForm ? params.hueSliderOptions.controllerOptions.parents : null;
		// hue open
		this.eventManager.addEvent(this.target.querySelector('.se-btn-info'), 'click', OnColorPalette.bind(this));
		this.eventManager.addEvent(this.inputElement, 'input', OnChangeInput.bind(this));
		this.eventManager.addEvent(this.target.querySelector('form'), 'submit', Submit.bind(this));
	}

	// remove style
	if (!params.disableRemove) {
		this.eventManager.addEvent(this.target.querySelector('.__se_remove'), 'click', Remove.bind(this));
	}

	this.eventManager.addEvent(this.target, 'click', OnClickColor.bind(this));
};

ColorPicker.prototype = {
	hueSliderAction(color) {
		this._setInputText(color.hex);
	},

	hueSliderCancelAction() {
		if (this.parentForm?.length > 0) {
			this.parentFormDisplay.forEach((e) => (e[0].style.display = e[1]));
		}
	},

	/**
	 * @description Displays or resets the currently selected color at color list.
	 * @param {Node|String} nodeOrColor Current Selected node
	 * @param {string|null} target target
	 */
	init(nodeOrColor, target) {
		this.targetButton = target;

		const computedColor = this.editor.frameContext.get('wwComputedStyle')[this.styleProperties];
		const defaultColor = this.defaultColor || converter.isHexColor(computedColor) ? computedColor : converter.rgb2hex(computedColor);

		let fillColor = (typeof nodeOrColor === 'string' ? nodeOrColor : this._getColorInNode(nodeOrColor)) || defaultColor;
		fillColor = converter.isHexColor(fillColor) ? fillColor : converter.rgb2hex(fillColor) || fillColor || '';

		const colorList = this.colorList;
		for (let i = 0, len = colorList.length; i < len; i++) {
			if (fillColor.toLowerCase() === colorList[i].getAttribute('data-value').toLowerCase()) {
				domUtils.addClass(colorList[i], 'active');
			} else {
				domUtils.removeClass(colorList[i], 'active');
			}
		}

		this._setInputText(this._colorName2hex(fillColor));
	},

	/**
	 * @description Store color values
	 * @param {string} hexColorStr Hax color value
	 */
	setHexColor(hexColorStr) {
		this.currentColor = hexColorStr;
		this.inputElement.style.borderColor = hexColorStr;
	},

	/**
	 * @description Set color at input element
	 * @param {string} hexColorStr Hax color value
	 * @private
	 */
	_setInputText(hexColorStr) {
		hexColorStr = /^#/.test(hexColorStr) ? hexColorStr : '#' + hexColorStr;
		this.inputElement.value = hexColorStr;
		this.setHexColor.call(this, hexColorStr);
	},

	/**
	 * @description Gets color value at color property of node
	 * @param {Node} node Selected node
	 * @returns {string}
	 * @private
	 */
	_getColorInNode(node) {
		let findColor = '';
		const sp = this.styleProperties;

		while (node && !domUtils.isWysiwygFrame(node) && findColor.length === 0) {
			if (node.nodeType === 1 && node.style[sp]) findColor = node.style[sp];
			node = node.parentNode;
		}

		return findColor;
	},

	/**
	 * @description Converts color values of other formats to hex color values and returns.
	 * @param {string} colorName Color value
	 * @returns {string}
	 */
	_colorName2hex(colorName) {
		if (/^#/.test(colorName)) return colorName;
		const temp = domUtils.createElement('div', { style: 'display: none; color: ' + colorName });
		const colors = this._w
			.getComputedStyle(this._d.body.appendChild(temp))
			.color.match(/\d+/g)
			.map(function (a) {
				return parseInt(a, 10);
			});
		domUtils.removeItem(temp);
		return colors.length >= 3 ? '#' + ((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substr(1) : false;
	},

	constructor: ColorPicker
};

function OnColorPalette() {
	if (this.parentForm?.length > 0) {
		this.parentForm.forEach((e) => {
			this.parentFormDisplay.push([e, e.style.display]);
			e.style.display = 'none';
		});
	}
	this.hueSlider.open(this.targetButton);
}

function Submit(e) {
	e.preventDefault();

	if (typeof this.inst.colorPickerAction !== 'function') return;
	this.inst.colorPickerAction(this.currentColor);
}

function OnClickColor(e) {
	const color = e.target.getAttribute('data-value');
	if (!color) return;

	if (typeof this.inst.colorPickerAction !== 'function') return;
	this.inst.colorPickerAction(color);
}

function Remove() {
	if (typeof this.inst.colorPickerAction !== 'function') return;
	this.inst.colorPickerAction(null);
}

function OnChangeInput(e) {
	this.setHexColor(e.target.value);
}

function CreateHTML({ lang, icons }, { colorList, disableHEXInput, disableRemove, splitNum }) {
	colorList = colorList || DEFAULT_COLOR_LIST;
	splitNum = colorList === DEFAULT_COLOR_LIST ? DEFAULLT_COLOR_SPLITNUM : splitNum;

	let list = '';
	for (let i = 0, len = colorList.length, colorArr = [], color; i < len; i++) {
		color = colorList[i];
		if (!color) continue;

		if (typeof color === 'string' || color.value) {
			colorArr.push(color);
			if (i < len - 1) continue;
		}
		if (colorArr.length > 0) {
			list += `<div class="se-selector-color">${_makeColor(colorArr, splitNum)}</div>`;
			colorArr = [];
		}
		if (typeof color === 'object') {
			list += `<div class="se-selector-color">${_makeColor(color, splitNum)}</div>`;
		}
	}
	list += /*html*/ `
		<form class="se-form-group se-form-w0">
			${disableHEXInput ? '' : `<button type="button" class="se-btn se-btn-info" title="${lang.colorPicker}" aria-label="${lang.colorPicker}">${icons.color_palette}</button>`}
			<input type="text" class="se-color-input" ${disableHEXInput ? 'readonly' : ''} placeholder="${lang.color}" />
			${disableHEXInput ? '' : `<button type="submit" class="se-btn se-btn-success" title="${lang.submitButton}" aria-label="${lang.submitButton}">${icons.checked}</button>`}
			${disableRemove ? '' : `<button type="button" class="se-btn __se_remove" title="${lang.remove}" aria-label="${lang.remove}">${icons.erase}</button>`}
		</form>`;

	return domUtils.createElement('DIV', { class: 'se-list-inner' }, list);
}

function _makeColor(colorList, splitNum) {
	const ulHTML = `<ul class="se-color-pallet${splitNum ? ' se-list-horizontal' : ''}">`;

	let list = ulHTML;
	for (let i = 0, len = colorList.length, color, v, n; i < len; i++) {
		color = colorList[i];
		if (typeof color === 'string') {
			v = color;
			n = color;
		} else if (typeof color === 'object') {
			v = color.value;
			n = color.name || v;
		}

		if (i > 0 && i % splitNum === 0) {
			list += `</ul>${ulHTML}`;
		}

		list += /*html*/ `<li><button type="button" data-value="${v}" title="${n}" aria-label="${n}" style="background-color:${v};"></button></li>`;
	}
	list += '</ul>';

	return list;
}

export default ColorPicker;
