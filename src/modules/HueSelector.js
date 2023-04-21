import CoreInjector from '../editorInjector/_core';

const HueSelector = function (editor, params) {
	CoreInjector.call(this, editor);

	// members
	this.editRGB = params.rgb;
	this.editHex = params.hex;
};

export default HueSelector;
