import EditorInjector from '../../editorInjector';
import ColorPicker from '../../modules/ColorPicker';
import { domUtils } from '../../helper';

const FontColor = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.fontColor;
	this.icon = 'font_color';

	// members
	this.colorPicker = new ColorPicker(this, 'color', { colorList: pluginOptions.items, disableHEXInput: pluginOptions.disableHEXInput ?? true });

	// create HTML
	const menu = CreateHTML(this.colorPicker.target);

	// itit
	this.menu.initDropdownTarget(FontColor, menu);

	// dropdown-free : register event
	this.eventManager.addEvent(menu, 'click', OnClickMenu.bind(this));
};

FontColor.key = 'fontColor';
FontColor.type = 'dropdown-free';
FontColor.className = '';
FontColor.prototype = {
	/**
	 * @override dropdown
	 */
	on(target) {
		this.colorPicker.init(this.selection.getNode(), target);
	},

	/**
	 * @override core
	 */
	action(value) {
		if (value) {
			const newNode = domUtils.createElement('SPAN', { style: 'color: ' + value + ';' });
			this.format.applyTextStyle(newNode, ['color'], null, null);
		} else {
			this.format.applyTextStyle(null, ['color'], ['span'], true);
		}

		this.menu.dropdownOff();
	},

	constructor: FontColor
};

function OnClickMenu(e) {
	const color = e.target.getAttribute('data-value');
	if (!color) return;

	this.action(color);
}

function CreateHTML(colorList) {
	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, colorList);
}

export default FontColor;
