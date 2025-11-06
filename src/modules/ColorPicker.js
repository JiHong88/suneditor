import { dom, converter } from '../helper';
import { isElement } from '../helper/dom/domCheck';
import CoreInjector from '../editorInjector/_core';
import HueSlider from './HueSlider';

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
	'#222222',
];

const DEFAULLT_COLOR_SPLITNUM = 9;

/**
 * @typedef {Object} ColorPickerParams
 * @property {HTMLElement} form The form element to attach the color picker.
 * @property {Array<string|{value: string, name: string}>} [colorList=[]] color list
 * @property {number} [splitNum=0] Number of colors to be displayed in one line
 * @property {string} [defaultColor] Default color
 * @property {boolean} [disableHEXInput=false] Disable HEX input
 * @property {boolean} [disableRemove=false] Disable remove button
 * @property {import('./HueSlider').HueSliderParams} [hueSliderOptions] hue slider options
 */

/**
 * @class
 * @description Create a color picker element and register for related events. (this.target)
 * - When calling the color selection, "submit", and "remove" buttons, the "action" method of the instance is called with the "color" value as an argument.
 */
class ColorPicker extends CoreInjector {
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {string} styles style property ("color", "backgroundColor"..)
	 * @param {ColorPickerParams} params Color picker options
	 */
	constructor(inst, styles, params) {
		const editor = inst.editor;
		super(editor);

		// members
		this.kind = inst.constructor.key || inst.constructor.name;
		this.inst = inst;
		this.form = params.form;
		this.target = CreateHTML(editor, params);
		this.targetButton = null;
		this.inputElement = /** @type {HTMLInputElement} */ (this.target.querySelector('.se-color-input'));
		this.styleProperties = styles;
		this.splitNum = params.splitNum || 0;
		this.defaultColor = params.defaultColor || '';
		this.hueSliderOptions = params.hueSliderOptions;
		this.currentColor = '';
		this.colorList = this.target.querySelectorAll('li button') || [];
		this.hueSlider = null;

		// check icon
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(this.icons.color_checked, 'image/svg+xml');
		this.checkedIcon = svgDoc.documentElement;

		// modules - hex, hue slider
		if (!params.disableHEXInput) {
			this.hueSlider = new HueSlider(this, params.hueSliderOptions, 'se-dropdown');
			// hue open
			this.eventManager.addEvent(this.target.querySelector('.__se_hue'), 'click', this.#OnColorPalette.bind(this));
			this.eventManager.addEvent(this.inputElement, 'input', this.#OnChangeInput.bind(this));
			this.eventManager.addEvent(this.target.querySelector('form'), 'submit', this.#Submit.bind(this));
		}

		// remove style
		if (!params.disableRemove) {
			this.eventManager.addEvent(this.target.querySelector('.__se_remove'), 'click', this.#Remove.bind(this));
		}

		this.eventManager.addEvent(this.target, 'click', this.#OnClickColor.bind(this));

		// append to form
		this.form.appendChild(this.target);
	}

	/**
	 * @description Displays or resets the currently selected color at color list.
	 * @param {Node|string} nodeOrColor Current Selected node
	 * @param {Node} target target
	 * @param {?(current: Node) => boolean} [stopCondition] - A function used to stop traversing parent nodes while finding the color.
	 * - When this function returns true, the traversal ends at that node.
	 * - e.g., `(node) => this.format.isLine(node)` stops at line-level elements like <p>, <div>.
	 */
	init(nodeOrColor, target, stopCondition) {
		this.targetButton = target;
		if (typeof stopCondition !== 'function') stopCondition = () => false;

		let fillColor = (typeof nodeOrColor === 'string' ? nodeOrColor : this.#getColorInNode(nodeOrColor, stopCondition)) || this.defaultColor;
		fillColor = converter.isHexColor(fillColor) ? fillColor : converter.rgb2hex(fillColor) || fillColor || '';

		const colorList = this.colorList;
		for (let i = 0, len = colorList.length, c; i < len; i++) {
			c = colorList[i];
			if (fillColor.toLowerCase() === c.getAttribute('data-value').toLowerCase()) {
				c.appendChild(this.checkedIcon);
				dom.utils.addClass(c, 'active');
			} else {
				dom.utils.removeClass(c, 'active');
				if (c.contains(this.checkedIcon)) dom.utils.removeItem(this.checkedIcon);
			}
		}

		this.#setInputText(this.#colorName2hex(fillColor));
	}

	/**
	 * @description Store color values
	 * @param {string} hexColorStr Hax color value
	 */
	setHexColor(hexColorStr) {
		this.currentColor = hexColorStr;
		this.inputElement.style.borderColor = hexColorStr;
	}

	/**
	 * @description Close hue slider
	 */
	hueSliderClose() {
		this.hueSlider.off();
	}

	/**
	 * @editorMethod Modules.HueSlider
	 * @description This method is called when the color is selected in the hue slider.
	 * @param {SunEditor.Module.HueSlider.Color} color - Color object
	 */
	hueSliderAction(color) {
		this.#setInputText(color.hex);
	}

	/**
	 * @editorMethod Modules.HueSlider
	 * @description This method is called when the hue slider is closed.
	 */
	hueSliderCancelAction() {
		this.inst.colorPickerHueSliderClose?.();
	}

	/**
	 * @description Set color at input element
	 * @param {string} hexColorStr Hax color value
	 */
	#setInputText(hexColorStr) {
		hexColorStr = !hexColorStr || /^#/.test(hexColorStr) ? hexColorStr : '#' + hexColorStr;
		this.inputElement.value = hexColorStr;
		this.setHexColor.call(this, hexColorStr);
	}

	/**
	 * @description Gets color value at color property of node
	 * @param {Node} node Selected node
	 * @param {(current: Node) => boolean} stopCondition - A function used to stop traversing parent nodes while finding the color.
	 * @returns {string}
	 */
	#getColorInNode(node, stopCondition) {
		let findColor = '';
		const sp = this.styleProperties;

		while (node && !stopCondition(node) && !dom.check.isWysiwygFrame(node) && findColor.length === 0) {
			if (isElement(node) && node.style[sp]) findColor = node.style[sp];
			node = node.parentNode;
		}

		return findColor;
	}

	/**
	 * @description Converts color values of other formats to hex color values and returns.
	 * @param {string} colorName Color value
	 * @returns {string}
	 */
	#colorName2hex(colorName) {
		if (!colorName || /^#/.test(colorName)) return colorName;
		const temp = dom.utils.createElement('div', { style: 'display: none; color: ' + colorName });
		const colors = this._w
			.getComputedStyle(this._d.body.appendChild(temp))
			.color.match(/\d+/g)
			.map(function (a) {
				return parseInt(a, 10);
			});
		dom.utils.removeItem(temp);
		return colors.length >= 3 ? '#' + ((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substring(1) : '';
	}

	#OnColorPalette() {
		this.inst.colorPickerHueSliderOpen?.();
		this.hueSlider.open(this.targetButton);
	}

	/**
	 * @param {SubmitEvent} e Event object
	 */
	#Submit(e) {
		e.preventDefault();

		if (typeof this.inst.colorPickerAction !== 'function') return;
		this.inst.colorPickerAction(this.currentColor);
	}

	/**
	 * @param {MouseEvent} e Event object
	 */
	#OnClickColor(e) {
		const eventTarget = dom.query.getEventTarget(e);
		const color = eventTarget.getAttribute('data-value');
		if (!color) return;

		if (typeof this.inst.colorPickerAction !== 'function') return;
		this.inst.colorPickerAction(color);
	}

	#Remove() {
		if (typeof this.inst.colorPickerAction !== 'function') return;
		this.inst.colorPickerAction(null);
	}

	/**
	 * @param {InputEvent} e Event object
	 */
	#OnChangeInput(e) {
		/** @type {HTMLInputElement} */
		const eventTarget = dom.query.getEventTarget(e);
		this.setHexColor(eventTarget.value);
	}
}

/**
 * @private
 * @description Create a color picker element
 * @param {*} param0
 * @param {*} param1
 * @returns
 */
function CreateHTML({ lang, icons }, { colorList, disableHEXInput, disableRemove, splitNum }) {
	colorList ||= DEFAULT_COLOR_LIST;
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
			${disableHEXInput ? '' : `<button type="button" class="se-btn __se_hue" title="${lang.colorPicker}" aria-label="${lang.colorPicker}">${icons.color_palette}</button>`}
			<input type="text" class="se-color-input" ${disableHEXInput ? 'readonly' : ''} placeholder="${lang.color}" />
			${disableHEXInput ? '' : `<button type="submit" class="se-btn se-btn-success" title="${lang.submitButton}" aria-label="${lang.submitButton}">${icons.checked}</button>`}
			${disableRemove ? '' : `<button type="button" class="se-btn __se_remove" title="${lang.remove}" aria-label="${lang.remove}">${icons.remove_color}</button>`}
		</form>`;

	return dom.utils.createElement('DIV', { class: 'se-list-inner' }, list);
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
