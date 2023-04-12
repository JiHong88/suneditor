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
	 */
	action: function (target) {
		const value = typeof target === 'string' ? target : target.getAttribute('data-command');
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

function CreateHTML(colorList) {
	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, colorList);
}

export default BackgroundColor;
