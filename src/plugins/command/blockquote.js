'use strict';

import { domUtils } from '../../helper';
import EditorInterface from '../../interface/editor';

const blockquote = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin basic properties
	this.target = target;
	this.title = this.lang.toolbar.tag_blockquote;
	this.icon = this.icons.blockquote;

	// members
	this.quoteTag = domUtils.createElement('BLOCKQUOTE');
};

blockquote.type = 'command';
blockquote.className = '';
blockquote.prototype = {
	/**
	 * @override core
	 */
	active: function (element) {
		if (!element) {
			domUtils.removeClass(this.target, 'active');
		} else if (/blockquote/i.test(element.nodeName)) {
			domUtils.addClass(this.target, 'active');
			return true;
		}

		return false;
	},

	/**
	 * @override core
	 */
	action: function () {
		const currentBlockquote = domUtils.getParentElement(this.selection.getNode(), 'blockquote');

		if (currentBlockquote) {
			this.format.removeBlock(currentBlockquote, null, null, false, false);
		} else {
			this.format.applyBlock(this.quoteTag.cloneNode(false));
		}
	},

	constructor: blockquote
};

export default blockquote;
