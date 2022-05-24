/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 Yi JiHong.
 * MIT license.
 */
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
	 * @Override core
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
	 * @Override core
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
