import EditorInjector from '../../editorInjector';
// import { domUtils } from '../../helper';

const Mention = function (editor) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.mention;
	this.icon = 'mention';

	// members
};

Mention.key = 'mention';
Mention.type = 'command';
Mention.className = '';
Mention.prototype = {
	constructor: Mention
};

export default Mention;
