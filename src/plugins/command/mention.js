import EditorDependency from '../../dependency';
import { domUtils } from '../../helper';

const Mention = function (editor, target) {
	EditorDependency.call(this, editor);
	// plugin basic properties
	this.target = target;
	this.title = this.lang.toolbar.mention;
	this.icon = this.icons.mention;

	// members
};

Mention.key = 'mention';
Mention.type = 'command';
Mention.className = '';
Mention.prototype = {
	constructor: Mention
};

export default Mention;
