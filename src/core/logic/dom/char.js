/**
 * @fileoverview Char class
 */

import { _w, isEdge } from '../../../helper/env';
import { addClass, removeClass, hasClass } from '../../../helper/dom/domUtils';

/**
 * @description character count, character limit, etc. management class
 */
class Char {
	#$;
	#frameContext;
	#frameOptions;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel) {
		this.#$ = kernel.$;
		this.#frameContext = this.#$.frameContext;
		this.#frameOptions = this.#$.frameOptions;
	}

	/**
	 * @description Returns `false` if char count is greater than "frameOptions.get('charCounter_max')" when "html" is added to the current editor.
	 * @param {Node|string} html Element node or String.
	 * @returns {boolean}
	 */
	check(html) {
		const maxCharCount = this.#frameOptions.get('charCounter_max');
		if (maxCharCount) {
			const length = this.getLength(typeof html === 'string' ? html : this.#frameOptions.get('charCounter_type') === 'byte-html' && html.nodeType === 1 ? /** @type {HTMLElement} */ (html).outerHTML : html.textContent);
			if (length > 0 && length + this.getLength() > maxCharCount) {
				CounterBlink(this.#frameContext.get('charWrapper'));
				return false;
			}
		}
		return true;
	}

	/**
	 * @description Get the [content]'s number of characters or binary data size. (frameOptions.get('charCounter_type'))
	 * - If [content] is `undefined`, get the current editor's number of characters or binary data size.
	 * @param {string} [content] Content to count. (defalut: this.#frameContext.get('wysiwyg'))
	 * @returns {number}
	 */
	getLength(content) {
		if (typeof content !== 'string') {
			content = this.#frameOptions.get('charCounter_type') === 'byte-html' ? this.#frameContext.get('wysiwyg').innerHTML : this.#frameContext.get('wysiwyg').textContent;
		}
		return /byte/.test(this.#frameOptions.get('charCounter_type')) ? this.getByteLength(content) : content.length;
	}

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
			cl = new TextEncoder().encode(text).length;
			cr = 0;

			if (encodeURIComponent(text).match(/(%0A|%0D)/gi) !== null) {
				cr = encodeURIComponent(text).match(/(%0A|%0D)/gi).length;
			}

			return cl + cr;
		}
	}

	/**
	 * @description Set the char count to charCounter element textContent.
	 * @param {?SunEditor.FrameContext} [fc] Frame context
	 */
	display(fc) {
		const charCounter = (fc || this.#frameContext).get('charCounter');
		if (charCounter) {
			// Defer count update — DOM content may still be mutating from the current input/paste action
			_w.setTimeout(() => {
				charCounter.textContent = String(this.getLength());
			}, 0);
		}
	}

	/**
	 * @description Returns `false` if char count is greater than "frameOptions.get('charCounter_max')" when "inputText" is added to the current editor.
	 * - If the current number of characters is greater than "charCounter_max", the excess characters are removed.
	 * And call the char.display()
	 * @param {string} inputText Text added.
	 * @param {boolean} _fromInputEvent Whether the test is triggered from an input event.
	 * @returns {boolean}
	 */
	test(inputText, _fromInputEvent) {
		let nextCharCount = 0;
		if (inputText) nextCharCount = this.getLength(inputText);

		this.display();

		const maxCharCount = this.#frameOptions.get('charCounter_max');
		if (maxCharCount > 0) {
			let over = false;
			const count = this.getLength();

			if (count > maxCharCount) {
				over = true;
				if (nextCharCount > 0 && _fromInputEvent) {
					this.#$.selection.init();
					const range = this.#$.selection.getRange();
					const endOff = range.endOffset - 1;
					const text = this.#$.selection.getNode().textContent;
					const slicePosition = range.endOffset - 1; // (count - maxCharCount);

					this.#$.selection.getNode().textContent = text.slice(0, slicePosition < 0 ? 0 : slicePosition) + text.slice(range.endOffset, text.length);
					this.#$.selection.setRange(range.endContainer, endOff, range.endContainer, endOff);
				}
			} else if (count + nextCharCount > maxCharCount) {
				over = true;
			}

			if (over) {
				CounterBlink(this.#frameContext.get('charWrapper'));
				if (nextCharCount > 0) return false;
			}
		}

		return true;
	}
}

/**
 * @description The character counter blinks.
 * @param {Element} charWrapper this.#frameContext.get('charWrapper')
 */
function CounterBlink(charWrapper) {
	if (charWrapper && !hasClass(charWrapper, 'se-blink')) {
		addClass(charWrapper, 'se-blink');
		// Remove blink CSS class after animation completes (600ms matches the CSS animation duration)
		_w.setTimeout(() => {
			removeClass(charWrapper, 'se-blink');
		}, 600);
	}
}

export default Char;
