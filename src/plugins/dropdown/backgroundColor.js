'use strict';

import EditorInterface from '../../interface/editor';
import ColorPicker from '../../modules/ColorPicker';
import { domUtils } from '../../helper';

const backgroundColor = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin basic properties
	this.target = target;
	this.title = this.lang.toolbar.backgroundColor;
	this.icon = this.icons.background_color;

	// members
	this.colorPicker = new ColorPicker(this, 'backgroundColor', '#ffffff', this.options.colorList_background);

	// create HTML
	const menu = CreateHTML(this.colorPicker.target);

	// itit
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu, 'click', OnClickMenu.bind(this));
};

backgroundColor.type = 'dropdown';
backgroundColor.className = '';
backgroundColor.prototype = {
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

	constructor: backgroundColor
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

export default backgroundColor;
