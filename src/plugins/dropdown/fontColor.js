import EditorInjector from '../../editorInjector';
import ColorPicker from '../../modules/ColorPicker';
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
class FontColor extends EditorInjector {
	static key = 'fontColor';
	static type = 'dropdown-free';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {FontColorPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor, pluginOptions) {
		super(editor);
		// plugin basic properties
		this.title = this.lang.fontColor;
		this.icon = 'font_color';

		// create HTML
		const menu = CreateHTML();

		// members
		this.colorPicker = new ColorPicker(this, 'color', {
			colorList: pluginOptions.items,
			splitNum: pluginOptions.splitNum,
			disableHEXInput: pluginOptions.disableHEXInput,
			hueSliderOptions: { controllerOptions: { parents: [menu], isOutsideForm: true } }
		});

		// itit
		menu.appendChild(this.colorPicker.target);
		this.menu.initDropdownTarget(FontColor, menu);
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
		/** @type {HTMLElement} */
		const colorHelper = target.querySelector('.se-svg-color-helper');
		if (!colorHelper) return undefined;

		let color = '';
		if (!element) {
			colorHelper.style.color = color;
		} else if (this.format.isLine(element)) {
			return undefined;
		} else if ((color = dom.utils.getStyle(element, 'color'))) {
			colorHelper.style.color = color;
			return true;
		}

		return false;
	}

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} target Line element at the current cursor position
	 */
	on(target) {
		this.colorPicker.init(this.selection.getNode(), target, (current) => this.format.isLine(current));
	}

	/**
	 * @editorMethod Modules.Dropdown
	 * @Override Executes the method that is called when a plugin's dropdown menu is closed.
	 */
	off() {
		this.colorPicker.hueSliderClose();
	}

	/**
	 * @editorMethod Modules.ColorPicker
	 * @description Executes the method called when a button of "ColorPicker" module is clicked.
	 * - This plugin is by applying the "ColorPicker" module globally to the "dropdown" menu, the default "action" method is not called.
	 * @param {string} color - Color code (hex)
	 */
	colorPickerAction(color) {
		if (color) {
			const newNode = dom.utils.createElement('SPAN', { style: 'color: ' + color + ';' });
			this.inline.apply(newNode, { stylesToModify: ['color'], nodesToRemove: null, strictRemove: null });
		} else {
			this.inline.apply(null, { stylesToModify: ['color'], nodesToRemove: ['span'], strictRemove: true });
		}

		this.menu.dropdownOff();
	}
}

function CreateHTML() {
	return dom.utils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, null);
}

export default FontColor;
