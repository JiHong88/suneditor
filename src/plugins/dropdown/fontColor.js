import { PluginDropdownFree } from '../../interfaces';
import { ColorPicker } from '../../modules/contract';
import { dom } from '../../helper';

/**
 * @typedef {Object} FontColorPluginOptions
 * @property {Array<string|{value: string, name: string}>} [items] - Color list
 * @property {number} [splitNum] - Number of colors per line
 * @property {boolean} [disableHEXInput] - Disable HEX input
 */

/**
 * @class
 * @description Font color plugin
 */
class FontColor extends PluginDropdownFree {
	static key = 'fontColor';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {FontColorPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor, pluginOptions) {
		super(editor);
		// plugin basic properties
		this.title = this.$.lang.fontColor;
		this.icon = 'font_color';

		// create HTML
		const menu = CreateHTML();

		// members
		this.colorPicker = new ColorPicker(this, this.$, 'color', {
			form: menu,
			colorList: pluginOptions.items,
			splitNum: pluginOptions.splitNum,
			disableHEXInput: pluginOptions.disableHEXInput,
			hueSliderOptions: { controllerOptions: { isOutsideForm: true } },
		});

		// init
		this.$.menu.initDropdownTarget(FontColor, menu);
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.Active}
	 */
	active(element, target) {
		/** @type {HTMLElement} */
		const colorHelper = target.querySelector('.se-svg-color-helper');
		if (!colorHelper) return undefined;

		let color = '';
		if (!element) {
			colorHelper.style.color = color;
		} else if (this.$.format.isLine(element)) {
			return undefined;
		} else if ((color = dom.utils.getStyle(element, 'color'))) {
			colorHelper.style.color = color;
			return true;
		}

		return false;
	}

	/**
	 * @override
	 * @type {PluginDropdownFree['on']}
	 */
	on(target) {
		this.colorPicker.init(this.$.selection.getNode(), target, (current) => this.$.format.isLine(current));
	}

	/**
	 * @override
	 * @type {PluginDropdownFree['off']}
	 */
	off() {
		this.colorPicker.hueSliderClose();
	}

	/**
	 * @hook Modules.ColorPicker
	 * @type {SunEditor.Hook.ColorPicker.Action}
	 */
	colorPickerAction(color) {
		if (color) {
			const newNode = dom.utils.createElement('SPAN', { style: 'color: ' + color + ';' });
			this.$.inline.apply(newNode, { stylesToModify: ['color'], nodesToRemove: null, strictRemove: null });
		} else {
			this.$.inline.apply(null, { stylesToModify: ['color'], nodesToRemove: ['span'], strictRemove: true });
		}

		this.$.menu.dropdownOff();
	}
}

/**
 * @returns {HTMLElement}
 */
function CreateHTML() {
	return dom.utils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, null);
}

export default FontColor;
