import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

const Blockquote = function (editor) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.tag_blockquote;
	this.icon = 'blockquote';

	// members
	this.quoteTag = domUtils.createElement('BLOCKQUOTE');
};

Blockquote.key = 'blockquote';
Blockquote.type = 'command';
Blockquote.className = '';
Blockquote.prototype = {
	/**
	 * @override core
	 */
	active(element, target) {
		if (element && /blockquote/i.test(element.nodeName)) {
			domUtils.addClass(target, 'active');
			return true;
		}

		domUtils.removeClass(target, 'active');
		return false;
	},

	/**
	 * @override core
	 */
	action() {
		const currentBlockquote = domUtils.getParentElement(this.selection.getNode(), 'blockquote');

		if (currentBlockquote) {
			this.format.removeBlock(currentBlockquote, null, null, false, false);
		} else {
			this.format.applyBlock(this.quoteTag.cloneNode(false));
		}
	},

	constructor: Blockquote
};

export default Blockquote;
