import EditorInjector from '../../editorInjector';
import ColorPicker from '../../modules/ColorPicker';
import { domUtils } from '../../helper';

/**
 * @class
 * @description Text background color plugin
 * @param {object} editor editor core object
 * @param {object} pluginOptions
 * @param {Array.<string|{value: string, name: string}>} pluginOptions.items - Color list
 * @param {number} pluginOptions.splitNum - Number of colors per line
 * @param {boolean} pluginOptions.disableHEXInput - Disable HEX input
 */
function BackgroundColor(editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.backgroundColor;
	this.icon = 'background_color';

	// create HTML
	const menu = CreateHTML();

	// members
	this.colorPicker = new ColorPicker(this, 'backgroundColor', {
		colorList: pluginOptions.items,
		splitNum: pluginOptions.splitNum,
		disableHEXInput: pluginOptions.disableHEXInput,
		hueSliderOptions: { controllerOptions: { parents: [menu], isOutsideForm: true } }
	});

	// itit
	menu.appendChild(this.colorPicker.target);
	this.menu.initDropdownTarget(BackgroundColor, menu);
}

BackgroundColor.key = 'backgroundColor';
BackgroundColor.type = 'dropdown-free';
BackgroundColor.className = '';
BackgroundColor.prototype = {
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
		} else if (element?.style.backgroundColor.length > 0) {
			colorHelper.style.color = element.style.backgroundColor;
			return true;
		}

		return false;
	},

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's "dropdown" menu is opened.
	 * @param {Element} target Line element at the current cursor position
	 */
	on(target) {
		this.colorPicker.init(this.selection.getNode(), target);
	},

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's "dropdown" menu is closed.
	 */
	off() {
		this.colorPicker._hueSliderClose();
	},

	/**
	 * @editorMethod Modules.ColorPicker
	 * @description Executes the method called when a button of "ColorPicker" module is clicked.
	 * This plugin is by applying the "ColorPicker" module globally to the "dropdown" menu, the default "action" method is not called.
	 * @param {string} color - Color code (hex)
	 */
	colorPickerAction(color) {
		if (color) {
			const newNode = domUtils.createElement('SPAN', { style: 'background-color: ' + color + ';' });
			this.format.applyInlineElement(newNode, { stylesToModify: ['background-color'], nodesToRemove: null, strictRemove: null });
		} else {
			this.format.applyInlineElement(null, { stylesToModify: ['background-color'], nodesToRemove: ['span'], strictRemove: true });
		}

		this.menu.dropdownOff();
	},

	constructor: BackgroundColor
};

function CreateHTML() {
	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, null);
}

export default BackgroundColor;
