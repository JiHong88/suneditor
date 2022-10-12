import EditorInterface from '../../interface';
import ColorPicker from '../../modules/ColorPicker';
import { domUtils } from '../../helper';

const FontColor = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin basic properties
	this.target = target;
	this.title = this.lang.toolbar.fontColor;
	this.icon = this.icons.font_color;

	// members
	this.colorPicker = new ColorPicker(this, 'color', '#333333', this.options.colorList_font);

	// create HTML
	const menu = CreateHTML(this.colorPicker.target);

	// itit
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu, 'click', OnClickMenu.bind(this));
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
	 * @param {string} value color
	 */
	action: function (value) {
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
	e.preventDefault();
	e.stopPropagation();

	const color = e.target.getAttribute('data-value');
	if (!color) return;

	this.action(color);
}

function CreateHTML(colorList) {
	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, colorList);
}

export default FontColor;
