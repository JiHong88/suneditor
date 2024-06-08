import EditorInjector from '../../editorInjector';
import ColorPicker from '../../modules/ColorPicker';
import { domUtils } from '../../helper';

const FontColor = function (editor, pluginOptions) {
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
};

FontColor.key = 'fontColor';
FontColor.type = 'dropdown-free';
FontColor.className = '';
FontColor.prototype = {
	/**
	 * @override core
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
	 * @override dropdown
	 */
	on(target) {
		this.colorPicker.init(this.selection.getNode(), target);
	},

	/**
	 * @Override dropdown
	 */
	onDropdownClose() {
		this.colorPicker.hueSliderClose();
	},

	/**
	 *  @override ColorPicker
	 */
	colorPickerAction(value) {
		this.action(value);
	},

	/**
	 * @override core
	 */
	action(value) {
		if (value) {
			const newNode = domUtils.createElement('SPAN', { style: 'color: ' + value + ';' });
			this.format.applyInlineElement(newNode, ['color'], null, null);
		} else {
			this.format.applyInlineElement(null, ['color'], ['span'], true);
		}

		this.menu.dropdownOff();
	},

	constructor: FontColor
};

function CreateHTML() {
	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, null);
}

export default FontColor;
