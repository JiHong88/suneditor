import EditorInjector from '../../editorInjector';
import ColorPicker from '../../modules/ColorPicker';
import { domUtils } from '../../helper';

/**
 * @typedef {import('../../core/editor').default} EditorInstance
 */

/**
 * @class
 * @description Font color plugin
 * @param {EditorInstance} editor - The root editor instance
 * @param {Object} pluginOptions
 * @param {Array.<string|{value: string, name: string}>} pluginOptions.items - Color list
 * @param {number} pluginOptions.splitNum - Number of colors per line
 * @param {boolean} pluginOptions.disableHEXInput - Disable HEX input
 * @returns {FontColor}
 */
function FontColor(editor, pluginOptions) {
	EditorInjector.call(this, editor);
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

FontColor.key = 'fontColor';
FontColor.type = 'dropdown-free';
FontColor.className = '';
FontColor.prototype = {
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?Element} element - Node element where the cursor is currently located
	 * @param {?Element} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 */
	active(element, target) {
		const colorHelper = target.querySelector('.se-svg-color-helper');
		if (!colorHelper) return false;

		if (!element) {
			colorHelper.style.color = '';
		} else if (element?.style.color.length > 0) {
			colorHelper.style.color = element.style.color;
			return true;
		}

		return false;
	},

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {Element} target Line element at the current cursor position
	 */
	on(target) {
		this.colorPicker.init(this.selection.getNode(), target);
	},

	/**
	 * @editorMethod Modules.Dropdown
	 * @Override Executes the method that is called when a plugin's dropdown menu is closed.
	 */
	off() {
		this.colorPicker.hueSliderClose();
	},

	/**
	 * @editorMethod Modules.ColorPicker
	 * @description Executes the method called when a button of "ColorPicker" module is clicked.
	 * - This plugin is by applying the "ColorPicker" module globally to the "dropdown" menu, the default "action" method is not called.
	 * @param {string} color - Color code (hex)
	 */
	colorPickerAction(color) {
		if (color) {
			const newNode = domUtils.createElement('SPAN', { style: 'color: ' + color + ';' });
			this.format.applyInlineElement(newNode, { stylesToModify: ['color'], nodesToRemove: null, strictRemove: null });
		} else {
			this.format.applyInlineElement(null, { stylesToModify: ['color'], nodesToRemove: ['span'], strictRemove: true });
		}

		this.menu.dropdownOff();
	},

	constructor: FontColor
};

function CreateHTML() {
	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, null);
}

export default FontColor;
