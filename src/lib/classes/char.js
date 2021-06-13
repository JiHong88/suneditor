/**
 * @fileoverview Char class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";
import env from "../../helper/env";
import { window } from "../../helper/global";
import { addClass, removeClass, hasClass } from "../../helper/dom";

const Char = function (editor) {
	CoreInterface.call(this, editor);
	this.selection = editor.selection;
};

Char.prototype = {
	/**
	 * @description Returns false if char count is greater than "options.maxCharCount" when "html" is added to the current editor.
	 * @param {Node|String} html Element node or String.
	 * @returns {Boolean}
	 */
	check: function (html) {
		if (this.options.maxCharCount) {
			const length = this.getLength(typeof html === "string" ? html : this.options.charCounterType === "byte-html" && html.nodeType === 1 ? html.outerHTML : html.textContent);
			if (length > 0 && length + this.getLength() > this.options.maxCharCount) {
				CounterBlink(this.context.element.charWrapper);
				return false;
			}
		}
		return true;
	},

	/**
	 * @description Get the [content]'s number of characters or binary data size. (options.charCounterType)
	 * If [content] is undefined, get the current editor's number of characters or binary data size.
	 * @param {String|undefined} content Content to count. (defalut: this.context.element.wysiwyg)
	 * @returns {Number}
	 */
	getLength: function (content) {
		if (typeof content !== "string") {
			content = this.options.charCounterType === "byte-html" ? this.context.element.wysiwyg.innerHTML : this.context.element.wysiwyg.textContent;
		}
		return /byte/.test(this.options.charCounterType) ? GetByteLength(content) : content.length;
	},

	/**
	 * @description Set the char count to charCounter element textContent.
	 */
	display: function () {
		if (context.element.charCounter) {
			window.setTimeout(
				function () {
					this.context.element.charCounter.textContent = this.getLength();
				}.bind(this)
			);
		}
	},

	/**
	 * @description Returns false if char count is greater than "options.maxCharCount" when "inputText" is added to the current editor.
	 * If the current number of characters is greater than "maxCharCount", the excess characters are removed.
	 * And call the char.display()
	 * @param {String} inputText Text added.
	 * @returns {Boolean}
	 */
	test: function (inputText) {
		const maxCharCount = this.options.maxCharCount;
		let nextCharCount = 0;
		if (!!inputText) nextCharCount = this.getLength(inputText);

		this.display();

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
					const slicePosition = range.endOffset - (count - maxCharCount);

					this.selection.getNode().textContent = text.slice(0, slicePosition < 0 ? 0 : slicePosition) + text.slice(range.endOffset, text.length);
					this.selection.setRange(range.endContainer, endOff, range.endContainer, endOff);
				}
			} else if (count + nextCharCount > maxCharCount) {
				over = true;
			}

			if (over) {
				CounterBlink(this.context.element.charWrapper);
				if (nextCharCount > 0) return false;
			}
		}

		return true;
	},

	constructor: Char
};

/**
 * @description The character counter blinks.
 * @param charWrapper {Element} context.element.charWrapper
 * @private
 */
function CounterBlink(charWrapper) {
	if (charWrapper && !hasClass(charWrapper, "se-blink")) {
		addClass(charWrapper, "se-blink");
		window.setTimeout(function () {
			removeClass(charWrapper, "se-blink");
		}, 600);
	}
}

/**
 * @descriptionGets Get the length in bytes of a string.
 * referencing code: "https://github.com/shaan1974/myrdin/blob/master/expressions/string.js#L11"
 * @param {String} text String text
 * @returns {Number}
 */
function GetByteLength(text) {
	if (!text || !text.toString) return 0;
	text = text.toString();

	const encoder = window.encodeURIComponent;
	let cr, cl;
	if (env.isIE || env.isEdge) {
		cl = window.unescape(encoder(text)).length;
		cr = 0;

		if (encoder(text).match(/(%0A|%0D)/gi) !== null) {
			cr = encoder(text).match(/(%0A|%0D)/gi).length;
		}

		return cl + cr;
	} else {
		cl = new window.TextEncoder("utf-8").encode(text).length;
		cr = 0;

		if (encoder(text).match(/(%0A|%0D)/gi) !== null) {
			cr = encoder(text).match(/(%0A|%0D)/gi).length;
		}

		return cl + cr;
	}
}

export default Char;
