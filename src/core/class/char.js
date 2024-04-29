/**
 * @fileoverview Char class
 */

import CoreInjector from '../../editorInjector/_core';
import { _w, isEdge } from '../../helper/env';
import { addClass, removeClass, hasClass } from '../../helper/domUtils';

const Char = function (editor) {
	CoreInjector.call(this, editor);
};

Char.prototype = {
	/**
	 * @description Returns false if char count is greater than "frameOptions.get('charCounter_max')" when "html" is added to the current editor.
	 * @param {Node|String} html Element node or String.
	 * @returns {boolean}
	 */
	check(html) {
		const maxCharCount = this.editor.frameOptions.get('charCounter_max');
		if (maxCharCount) {
			const length = this.getLength(typeof html === 'string' ? html : this.editor.frameOptions.get('charCounter_type') === 'byte-html' && html.nodeType === 1 ? html.outerHTML : html.textContent);
			if (length > 0 && length + this.getLength() > maxCharCount) {
				CounterBlink(this.editor.frameContext.get('charWrapper'));
				return false;
			}
		}
		return true;
	},

	/**
	 * @description Get the [content]'s number of characters or binary data size. (frameOptions.get('charCounter_type'))
	 * If [content] is undefined, get the current editor's number of characters or binary data size.
	 * @param {string|undefined} content Content to count. (defalut: this.editor.frameContext.get('wysiwyg'))
	 * @returns {number}
	 */
	getLength(content) {
		if (typeof content !== 'string') {
			content = this.editor.frameOptions.get('charCounter_type') === 'byte-html' ? this.editor.frameContext.get('wysiwyg').innerHTML : this.editor.frameContext.get('wysiwyg').textContent;
		}
		return /byte/.test(this.editor.frameOptions.get('charCounter_type')) ? this.getByteLength(content) : content.length;
	},

	/**
	 * @descriptionGets Get the length in bytes of a string.
	 * @param {string} text String text
	 * @returns {number}
	 */
	getByteLength(text) {
		if (!text || !text.toString) return 0;
		text = text.toString();

		let cr, cl;
		if (isEdge) {
			cl = decodeURIComponent(encodeURIComponent(text)).length;
			cr = 0;

			if (encodeURIComponent(text).match(/(%0A|%0D)/gi) !== null) {
				cr = encodeURIComponent(text).match(/(%0A|%0D)/gi).length;
			}

			return cl + cr;
		} else {
			cl = new TextEncoder('utf-8').encode(text).length;
			cr = 0;

			if (encodeURIComponent(text).match(/(%0A|%0D)/gi) !== null) {
				cr = encodeURIComponent(text).match(/(%0A|%0D)/gi).length;
			}

			return cl + cr;
		}
	},

	/**
	 * @description Set the char count to charCounter element textContent.
	 */
	display() {
		if (this.editor.frameContext.has('charCounter')) {
			_w.setTimeout(() => {
				this.editor.frameContext.get('charCounter').textContent = this.getLength();
			}, 0);
		}
	},

	/**
	 * @description Returns false if char count is greater than "frameOptions.get('charCounter_max')" when "inputText" is added to the current editor.
	 * If the current number of characters is greater than "charCounter_max", the excess characters are removed.
	 * And call the char.display()
	 * @param {string} inputText Text added.
	 * @returns {boolean}
	 */
	test(inputText) {
		let nextCharCount = 0;
		if (inputText) nextCharCount = this.getLength(inputText);

		this.display();

		const maxCharCount = this.editor.frameOptions.get('charCounter_max');
		if (maxCharCount > 0) {
			let over = false;
			const count = this.getLength();

			if (count > maxCharCount) {
				over = true;
				if (nextCharCount > 0) {
					this.selection._init();
					const range = this.selection.getRange();
					const endOff = range.endOffset - 1;
					const text = this.selection.getNode().textContent;
					const slicePosition = range.endOffset - (this.options.get('forceCharClean') ? count - maxCharCount : 1);

					this.selection.getNode().textContent = text.slice(0, slicePosition < 0 ? 0 : slicePosition) + text.slice(range.endOffset, text.length);
					this.selection.setRange(range.endContainer, endOff, range.endContainer, endOff);
				}
			} else if (count + nextCharCount > this.maxCharCount) {
				over = true;
			}

			if (over) {
				CounterBlink(this.editor.frameContext.get('charWrapper'));
				if (nextCharCount > 0) return false;
			}
		}

		return true;
	},

	constructor: Char
};

/**
 * @description The character counter blinks.
 * @param charWrapper {Element} this.editor.frameContext.get('charWrapper')
 * @private
 */
function CounterBlink(charWrapper) {
	if (charWrapper && !hasClass(charWrapper, 'se-blink')) {
		addClass(charWrapper, 'se-blink');
		_w.setTimeout(() => {
			removeClass(charWrapper, 'se-blink');
		}, 600);
	}
}

export default Char;
