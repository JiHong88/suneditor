import { PluginDropdownFree } from '../../interfaces';
import { ColorPicker } from '../../modules/contract';
import { dom } from '../../helper';

/**
 * @typedef {Object} BackgroundColorPluginOptions
 * @property {Array<string|{value: string, name: string}>} [items] - Color list.
 * Use HEX strings or objects with `value`/`name` for labeled colors.
 * @property {number} [splitNum] - Number of colors per line
 * @property {boolean} [disableHEXInput] - Disable HEX input
 * ```js
 * { items: ['#ff0000', '#00ff00', { value: '#0000ff', name: 'Blue' }], splitNum: 6 }
 * ```
 */

/**
 * @class
 * @description Text background color plugin
 */
class BackgroundColor extends PluginDropdownFree {
	static key = 'backgroundColor';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {BackgroundColorPluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel, pluginOptions) {
		super(kernel);
		// plugin basic properties
		this.title = this.$.lang.backgroundColor;
		this.icon = 'background_color';

		// create HTML
		const menu = CreateHTML();

		// members
		this.colorPicker = new ColorPicker(this, this.$, 'backgroundColor', {
			form: menu,
			colorList: pluginOptions.items,
			splitNum: pluginOptions.splitNum,
			disableHEXInput: pluginOptions.disableHEXInput,
			hueSliderOptions: { controllerOptions: { isOutsideForm: true } },
		});

		// init
		this.$.menu.initDropdownTarget(BackgroundColor, menu);
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.Active}
	 */
	active(element, target) {
		const colorHelper = /** @type {SVGPathElement} */ (target.querySelector('path.se-svg-color-helper'));
		if (!colorHelper) return undefined;

		let color = '';
		if (!element) {
			colorHelper.style.color = color;
		} else if (this.$.format.isLine(element)) {
			return undefined;
		} else if ((color = dom.utils.getStyle(element, 'backgroundColor'))) {
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
			const newNode = dom.utils.createElement('SPAN', { style: 'background-color: ' + color + ';' });
			this.$.inline.apply(newNode, { stylesToModify: ['background-color'], nodesToRemove: null, strictRemove: null });
		} else {
			this.$.inline.apply(null, { stylesToModify: ['background-color'], nodesToRemove: ['span'], strictRemove: true });
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

export default BackgroundColor;
