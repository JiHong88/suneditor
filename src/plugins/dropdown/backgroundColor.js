import EditorInjector from '../../editorInjector';
import ColorPicker from '../../modules/ColorPicker';
import { domUtils } from '../../helper';

const BackgroundColor = function (editor, pluginOptions) {
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
};

BackgroundColor.key = 'backgroundColor';
BackgroundColor.type = 'dropdown-free';
BackgroundColor.className = '';
BackgroundColor.prototype = {
	/**
	 * @override core
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
	 * @override dropdown
	 */
	on(target) {
		this.colorPicker.init(this.selection.getNode(), target);
	},

	/**
	 * @Override dropdown
	 */
	off() {
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
			const newNode = domUtils.createElement('SPAN', { style: 'background-color: ' + value + ';' });
			this.format.applyInlineElement(newNode, ['background-color'], null, null);
		} else {
			this.format.applyInlineElement(null, ['background-color'], ['span'], true);
		}

		this.menu.dropdownOff();
	},

	constructor: BackgroundColor
};

function CreateHTML() {
	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, null);
}

export default BackgroundColor;
