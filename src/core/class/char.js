/**
 * @fileoverview Char class
 */

import CoreInjector from '../../editorInjector/_core';
import { _w, isEdge } from '../../helper/env';
import { addClass, removeClass, hasClass } from '../../helper/domUtils';

/**
 * @typedef {Omit<Char & Partial<EditorInjector>, 'char'>} CharThis
 */

/**
 * @constructor
 * @this {CharThis}
 * @description character count, character limit, etc. management class
 * @param {EditorInstance} editor - The root editor instance
 */
function Char(editor) {
	CoreInjector.call(this, editor);
}

Char.prototype = {
	/**
	 * @this {CharThis}
	 * @description Returns false if char count is greater than "frameOptions.get('charCounter_max')" when "html" is added to the current editor.
	 * @param {Node|string} html Element node or String.
	 * @returns {boolean}
	 */
	check(html) {
		const maxCharCount = this.editor.frameOptions.get('charCounter_max');
		if (maxCharCount) {
			const length = this.getLength(typeof html === 'string' ? html : this.editor.frameOptions.get('charCounter_type') === 'byte-html' && html.nodeType === 1 ? /** @type {Element} */ (html).outerHTML : html.textContent);
			if (length > 0 && length + this.getLength() > maxCharCount) {
				CounterBlink(this.editor.frameContext.get('charWrapper'));
				return false;
			}
		}
		return true;
	},

	/**
	 * @this {CharThis}
	 * @description Get the [content]'s number of characters or binary data size. (frameOptions.get('charCounter_type'))
	 * - If [content] is undefined, get the current editor's number of characters or binary data size.
	 * @param {string=} content Content to count. (defalut: this.editor.frameContext.get('wysiwyg'))
	 * @returns {number}
	 */
	getLength(content) {
		if (typeof content !== 'string') {
			content = this.editor.frameOptions.get('charCounter_type') === 'byte-html' ? this.editor.frameContext.get('wysiwyg').innerHTML : this.editor.frameContext.get('wysiwyg').textContent;
		}
		return /byte/.test(this.editor.frameOptions.get('charCounter_type')) ? this.getByteLength(content) : content.length;
	},

	/**
	 * @this {CharThis}
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
			cl = new TextEncoder().encode(text).length;
			cr = 0;

			if (encodeURIComponent(text).match(/(%0A|%0D)/gi) !== null) {
				cr = encodeURIComponent(text).match(/(%0A|%0D)/gi).length;
			}

			return cl + cr;
		}
	},

	/**
	 * @this {CharThis}
	 * @description Set the char count to charCounter element textContent.
	 */
	display() {
		const charCounter = this.editor.frameContext.get('charCounter');
		if (charCounter) {
			_w.setTimeout(() => {
				charCounter.textContent = this.getLength();
			}, 0);
		}
	},

	/**
	 * @this {CharThis}
	 * @description Returns false if char count is greater than "frameOptions.get('charCounter_max')" when "inputText" is added to the current editor.
	 * - If the current number of characters is greater than "charCounter_max", the excess characters are removed.
	 * And call the char.display()
	 * @param {string} inputText Text added.
	 * @returns {boolean}
	 */
	test(inputText, _fromInputEvent) {
		let nextCharCount = 0;
		if (inputText) nextCharCount = this.getLength(inputText);

		this.display();

		const maxCharCount = this.editor.frameOptions.get('charCounter_max');
		if (maxCharCount > 0) {
			let over = false;
			const count = this.getLength();

			if (count > maxCharCount) {
				over = true;
				if (nextCharCount > 0 && _fromInputEvent) {
					this.selection._init();
					const range = this.selection.getRange();
					const endOff = range.endOffset - 1;
					const text = this.selection.getNode().textContent;
					const slicePosition = range.endOffset - 1; // (count - maxCharCount);

					this.selection.getNode().textContent = text.slice(0, slicePosition < 0 ? 0 : slicePosition) + text.slice(range.endOffset, text.length);
					this.selection.setRange(range.endContainer, endOff, range.endContainer, endOff);
				}
			} else if (count + nextCharCount > maxCharCount) {
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
 * @private
 * @description The character counter blinks.
 * @param charWrapper {Element} this.editor.frameContext.get('charWrapper')
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
