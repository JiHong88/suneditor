import { dom, converter, env } from '../../helper';
import { isElement } from '../../helper/dom/domCheck';
import HueSlider from './HueSlider';

const DEFAULT_COLOR_LIST = [
	// vivid
	'#ef4444',
	'#f97316',
	'#eab308',
	'#22c55e',
	'#06b6d4',
	'#3b82f6',
	'#8b5cf6',
	'#ec4899',
	'#000000',
	// highlighter
	'#fca5a5',
	'#fdba74',
	'#fcd34d',
	'#6ee7b7',
	'#5eead4',
	'#7dd3fc',
	'#c4b5fd',
	'#f9a8d4',
	'#e5e7eb',
	// pastel
	'#fee2e2',
	'#ffedd5',
	'#fef9c3',
	'#dcfce7',
	'#cffafe',
	'#dbeafe',
	'#ede9fe',
	'#fce7f3',
	'#f3f4f6',
	// medium
	'#f87171',
	'#fb923c',
	'#facc15',
	'#4ade80',
	'#22d3ee',
	'#60a5fa',
	'#a78bfa',
	'#f472b6',
	'#9ca3af',
	// deep
	'#b91c1c',
	'#c2410c',
	'#a16207',
	'#15803d',
	'#0e7490',
	'#1d4ed8',
	'#6d28d9',
	'#be185d',
	'#4b5563',
	// dark
	'#7f1d1d',
	'#7c2d12',
	'#713f12',
	'#14532d',
	'#164e63',
	'#1e3a8a',
	'#4c1d95',
	'#831843',
	'#1f2937',
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
class ColorPicker {
	#$;

	/**
	 * @constructor
	 * @param {*} host The instance object that called the constructor.
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {string} styles style property ("color", "backgroundColor"..)
	 * @param {ColorPickerParams} params Color picker options
	 */
	constructor(host, $, styles, params) {
		this.#$ = $;

		// members
		this.kind = host.constructor['key'] || host.constructor.name;
		this.host = host;
		this.form = params.form;
		this.target = CreateHTML(this.#$, params);
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
		const svgDoc = parser.parseFromString(this.#$.icons.color_checked, 'image/svg+xml');
		this.checkedIcon = svgDoc.documentElement;

		// modules - hex, hue slider
		if (!params.disableHEXInput) {
			this.hueSlider = new HueSlider(this, $, params.hueSliderOptions, 'se-dropdown');
			// hue open
			this.#$.eventManager.addEvent(this.target.querySelector('.__se_hue'), 'click', this.#OnColorPalette.bind(this));
			this.#$.eventManager.addEvent(this.inputElement, 'input', this.#OnChangeInput.bind(this));
			this.#$.eventManager.addEvent(this.target.querySelector('form'), 'submit', this.#Submit.bind(this));
		}

		// remove style
		if (!params.disableRemove) {
			this.#$.eventManager.addEvent(this.target.querySelector('.__se_remove'), 'click', this.#Remove.bind(this));
		}

		this.#$.eventManager.addEvent(this.target, 'click', this.#OnClickColor.bind(this));

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
		this.hueSlider.close();
	}

	/**
	 * @hook Modules.HueSlider
	 * @type {SunEditor.Hook.ColorPicker.Action}
	 */
	hueSliderAction(color) {
		this.#setInputText(color.hex);
	}

	/**
	 * @hook Modules.HueSlider
	 * @type {SunEditor.Hook.ColorPicker.HueSliderClose}
	 */
	hueSliderCancelAction() {
		this.form.style.display = 'block';
		this.host.colorPickerHueSliderClose?.();
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
		const colors = env._w
			.getComputedStyle(env._d.body.appendChild(temp))
			.color.match(/\d+/g)
			.map(function (a) {
				return parseInt(a, 10);
			});
		dom.utils.removeItem(temp);
		return colors.length >= 3 ? '#' + ((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substring(1) : '';
	}

	#OnColorPalette() {
		this.hueSlider.open(this.targetButton);
		this.host.colorPickerHueSliderOpen?.();
	}

	/**
	 * @param {SubmitEvent} e Event object
	 */
	#Submit(e) {
		e.preventDefault();
		this.host.colorPickerAction?.(this.currentColor);
	}

	/**
	 * @param {MouseEvent} e Event object
	 */
	#OnClickColor(e) {
		const eventTarget = dom.query.getEventTarget(e);
		const color = eventTarget.getAttribute('data-value');
		if (!color) return;

		this.host.colorPickerAction?.(color);
	}

	#Remove() {
		this.host.colorPickerAction?.(null);
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
 * @description Create a color picker element
 * @param {SunEditor.Deps} param0
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

/**
 * @param {Array<string|{value: string, name?: string}>} colorList - Color list
 * @param {number} splitNum - Number of colors per row
 * @returns {string} HTML string
 */
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
