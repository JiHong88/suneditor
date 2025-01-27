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
	 * @description Override the function called when the carat moves
	 */
	active(element, target) {
		if (/blockquote/i.test(element?.nodeName)) {
			domUtils.addClass(target, 'active');
			return true;
		}

		domUtils.removeClass(target, 'active');
		return false;
	},

	/**
	 * @description Override the function that the plugin calls.
	 */
	action() {
		const currentBlockquote = domUtils.getParentElement(this.selection.getNode(), 'blockquote');

		if (currentBlockquote) {
			this.format.removeBlock(currentBlockquote, { selectedFormats: null, newBlockElement: null, shouldDelete: false, skipHistory: false });
		} else {
			this.format.applyBlock(this.quoteTag.cloneNode(false));
		}
	},

	constructor: Blockquote
};

export default Blockquote;
