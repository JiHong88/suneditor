import EditorInjector from '../../injector';
import ColorPicker from '../../modules/ColorPicker';
import { domUtils } from '../../helper';

const FontColor = function (editor) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.fontColor;
	this.icon = 'font_color';

	// members
	this.colorPicker = new ColorPicker(this, 'color', this.options.get('colorList_font'));

	// create HTML
	const menu = CreateHTML(this.colorPicker.target);

	// itit
	this.menu.initDropdownTarget(FontColor.key, menu);
};

FontColor.key = 'fontColor';
FontColor.type = 'dropdown';
FontColor.className = '';
FontColor.prototype = {
	/**
	 * @override dropdown
	 */
	on: function () {
		this.colorPicker.init(this.selection.getNode());
	},

	/**
	 * @override core
	 */
	action: function (target) {
		const value = typeof target === 'string' ? target : target.getAttribute('data-command');
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

function CreateHTML(colorList) {
	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, colorList);
}

export default FontColor;
