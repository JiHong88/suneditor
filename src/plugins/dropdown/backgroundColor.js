import EditorInjector from '../../injector';
import ColorPicker from '../../modules/ColorPicker';
import { domUtils } from '../../helper';

const BackgroundColor = function (editor) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.backgroundColor;
	this.icon = 'background_color';

	// members
	this.colorPicker = new ColorPicker(this, 'backgroundColor', this.options.get('colorList_background'));

	// create HTML
	const menu = CreateHTML(this.colorPicker.target);

	// itit
	this.menu.initDropdownTarget(BackgroundColor.key, menu);
	this.eventManager.addEvent(menu, 'click', OnClickMenu.bind(this));
};

BackgroundColor.key = 'backgroundColor';
BackgroundColor.type = 'dropdown';
BackgroundColor.className = '';
BackgroundColor.prototype = {
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
			const newNode = domUtils.createElement('SPAN', { style: 'background-color: ' + value + ';' });
			this.format.applyTextStyle(newNode, ['background-color'], null, null);
		} else {
			this.format.applyTextStyle(null, ['background-color'], ['span'], true);
		}

		this.menu.dropdownOff();
	},

	constructor: BackgroundColor
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

export default BackgroundColor;
