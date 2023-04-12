import { domUtils } from '../helper';
import CoreInjector from '../injector/_core';

/**
 * @description Create a color picker element and register for related events. (this.target)
 * When calling the color selection, "submit", and "remove" buttons, the "action" method of the instance is called with the "color" value as an argument.
 * @param {Object} inst The "this" object of the calling function.
 * @param {string} styles style property ("color", "backgroundColor"..)
 * @param {Array.<string>} colorList color list
 * @param {string} _defaultColor default color
 */
const ColorPicker = function (inst, styles, colorList, _defaultColor) {
	CoreInjector.call(this, inst.editor);
	// members
	this.kind = inst.constructor.key;
	this.inst = inst;
	this.target = CreateHTML(inst.editor, colorList);
	this.inputElement = this.target.querySelector('.se-color-input');
	this.styleProperties = styles;
	this.defaultColor = _defaultColor;
	this.currentColor = '';
	this.colorList = this.target.querySelectorAll('li button') || [];

	// init
	this.eventManager.addEvent(this.inputElement, 'input', OnChangeInput.bind(this));
	this.eventManager.addEvent(this.target.querySelector('._se_color_picker_submit'), 'click', Submit.bind(this));
	this.eventManager.addEvent(this.target.querySelector('._se_color_picker_remove'), 'click', Remove.bind(this));
};

ColorPicker.prototype = {
	/**
	 * @description Displays or resets the currently selected color at color list.
	 * @param {Node} node Current Selected node
	 * @param {string|null} color Color value
	 */
	init: function (node) {
		const computedColor = this.editor.frameContext.get('wwComputedStyle')[this.styleProperties];
		const defaultColor = this.defaultColor || this.isHexColor(computedColor) ? computedColor : this.rgb2hex(computedColor);

		let fillColor = this._getColorInNode(node) || defaultColor;
		fillColor = this.isHexColor(fillColor) ? fillColor : this.rgb2hex(fillColor) || fillColor;

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
	 * @description Function to check hex format color
	 * @param {string} str Color value
	 */
	isHexColor: function (str) {
		return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(str);
	},

	/**
	 * @description Function to convert hex format to a rgb color
	 * @param {string} rgb RGB color format
	 * @returns {string}
	 */
	rgb2hex: function (rgb) {
		const rgbMatch = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
		return rgbMatch && rgbMatch.length === 4 ? '#' + ('0' + this._w.parseInt(rgbMatch[1], 10).toString(16)).slice(-2) + ('0' + this._w.parseInt(rgbMatch[2], 10).toString(16)).slice(-2) + ('0' + this._w.parseInt(rgbMatch[3], 10).toString(16)).slice(-2) : '';
	},

	/**
	 * @description Store color values
	 * @param {string} hexColorStr Hax color value
	 * @private
	 */
	_setCurrentColor: function (hexColorStr) {
		this.currentColor = hexColorStr;
		this.inputElement.style.borderColor = hexColorStr;
	},

	/**
	 * @description Set color at input element
	 * @param {string} hexColorStr Hax color value
	 * @private
	 */
	_setInputText: function (hexColorStr) {
		hexColorStr = /^#/.test(hexColorStr) ? hexColorStr : '#' + hexColorStr;
		this.inputElement.value = hexColorStr;
		this._setCurrentColor.call(this, hexColorStr);
	},

	/**
	 * @description Gets color value at color property of node
	 * @param {Node} node Selected node
	 * @returns {string}
	 * @private
	 */
	_getColorInNode: function (node) {
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
	_colorName2hex: function (colorName) {
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

function Submit() {
	this.inst.action(this.currentColor);
}

function Remove() {
	this.inst.action(null);
}

function OnChangeInput(e) {
	this._setCurrentColor(e.target.value);
}

function CreateHTML(editor, colorList) {
	const lang = editor.lang;
	colorList = colorList || [
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

	let list = '';
	for (let i = 0, len = colorList.length, colorArr = [], color; i < len; i++) {
		color = colorList[i];
		if (!color) continue;

		if (typeof color === 'string') {
			colorArr.push(color);
			if (i < len - 1) continue;
		}
		if (colorArr.length > 0) {
			list += '<div class="se-selector-color">' + _makeColor(colorArr) + '</div>';
			colorArr = [];
		}
		if (typeof color === 'object') {
			list += '<div class="se-selector-color">' + _makeColor(color) + '</div>';
		}
	}
	list +=
		'<form class="se-form-group">' +
		'<input type="text" maxlength="9" class="se-color-input"/>' +
		'<button type="submit" class="se-btn _se_color_picker_submit" title="' +
		lang.submitButton +
		'" aria-label="' +
		lang.submitButton +
		'">' +
		editor.icons.checked +
		'</button>' +
		'<button type="button" class="se-btn _se_color_picker_remove" title="' +
		lang.removeFormat +
		'" aria-label="' +
		lang.removeFormat +
		'">' +
		editor.icons.erase +
		'</button>' +
		'</form>';

	return domUtils.createElement('DIV', { class: 'se-list-inner' }, list);
}

function _makeColor(colorList) {
	let list = '';

	list += '<ul class="se-color-pallet">';
	for (let i = 0, len = colorList.length, color; i < len; i++) {
		color = colorList[i];
		if (typeof color === 'string') {
			list += '<li><button type="button" data-value="' + color + '" title="' + color + '" aria-label="' + color + '" style="background-color:' + color + ';"></button></li>';
		}
	}
	list += '</ul>';

	return list;
}

export default ColorPicker;
