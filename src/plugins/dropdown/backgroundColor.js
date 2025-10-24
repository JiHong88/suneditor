import EditorInjector from '../../editorInjector';
import ColorPicker from '../../modules/ColorPicker';
import { dom } from '../../helper';

/**
 * @typedef {Object} BackgroundColorPluginOptions
 * @property {Array<string|{value: string, name: string}>} [items] - Color list
 * @property {number} [splitNum] - Number of colors per line
 * @property {boolean} [disableHEXInput] - Disable HEX input
 */

/**
 * @class
 * @description Text background color plugin
 */
class BackgroundColor extends EditorInjector {
	static key = 'backgroundColor';
	static type = 'dropdown-free';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {BackgroundColorPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor, pluginOptions) {
		super(editor);
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

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement=} element - Node element where the cursor is currently located
	 * @param {?HTMLElement=} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	active(element, target) {
		const colorHelper = /** @type {SVGPathElement} */ (target.querySelector('path.se-svg-color-helper'));
		if (!colorHelper) return undefined;

		let color = '';
		if (!element) {
			colorHelper.style.color = color;
		} else if (this.format.isLine(element)) {
			return undefined;
		} else if ((color = dom.utils.getStyle(element, 'backgroundColor'))) {
			colorHelper.style.color = color;
			return true;
		}

		return false;
	}

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's "dropdown" menu is opened.
	 * @param {HTMLElement} target Line element at the current cursor position
	 */
	on(target) {
		this.colorPicker.init(this.selection.getNode(), target, (current) => this.format.isLine(current));
	}

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's "dropdown" menu is closed.
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
			const newNode = dom.utils.createElement('SPAN', { style: 'background-color: ' + color + ';' });
			this.inline.apply(newNode, { stylesToModify: ['background-color'], nodesToRemove: null, strictRemove: null });
		} else {
			this.inline.apply(null, { stylesToModify: ['background-color'], nodesToRemove: ['span'], strictRemove: true });
		}

		this.menu.dropdownOff();
	}
}

function CreateHTML() {
	return dom.utils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, null);
}

export default BackgroundColor;
