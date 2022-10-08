import { domUtils } from '../../helper';
import EditorInterface from '../../interface/editor';

const mention = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin basic properties
	this.target = target;
	this.title = this.lang.toolbar.mention;
	this.icon = this.icons.mention;

	// members
};

mention.type = 'command';
mention.className = '';
mention.prototype = {
	constructor: mention
};

export default mention;
