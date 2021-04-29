import Editor from "../../interface/editor";

const Char = function(editor) {
	Editor.call(this, editor);
	this.selection = editor.selection;
};

Char.prototype = {
	/**
	 * @description The current number of characters is counted and displayed.
	 * @param {String} inputText Text added.
	 * @returns {Boolean}
	 * @private
	 */
	_charCount: function(inputText) {
		const maxCharCount = options.maxCharCount;
		const countType = options.charCounterType;
		let nextCharCount = 0;
		if (!!inputText) nextCharCount = this.getCharLength(inputText, countType);

		this._setCharCount();

		if (maxCharCount > 0) {
			let over = false;
			const count = functions.getCharCount(countType);

			if (count > maxCharCount) {
				over = true;
				if (nextCharCount > 0) {
					this._editorRange();
					const range = this.getRange();
					const endOff = range.endOffset - 1;
					const text = this.getSelectionNode().textContent;
					const slicePosition = range.endOffset - (count - maxCharCount);

					this.getSelectionNode().textContent =
						text.slice(0, slicePosition < 0 ? 0 : slicePosition) + text.slice(range.endOffset, text.length);
					this.setRange(range.endContainer, endOff, range.endContainer, endOff);
				}
			} else if (count + nextCharCount > maxCharCount) {
				over = true;
			}

			if (over) {
				this._callCounterBlink();
				if (nextCharCount > 0) return false;
			}
		}

		return true;
	},

	/**
	 * @description When "element" is added, if it is greater than "options.maxCharCount", false is returned.
	 * @param {Node|String} element Element node or String.
	 * @param {String|null} charCounterType charCounterType. If it is null, the options.charCounterType
	 * @returns {Boolean}
	 */
	checkCharCount: function(element, charCounterType) {
		if (options.maxCharCount) {
			const countType = charCounterType || options.charCounterType;
			const length = this.getCharLength(
				typeof element === "string"
					? element
					: this._charTypeHTML && element.nodeType === 1
					? element.outerHTML
					: element.textContent,
				countType
			);
			if (length > 0 && length + functions.getCharCount(countType) > options.maxCharCount) {
				this._callCounterBlink();
				return false;
			}
		}
		return true;
	},

	/**
	 * @description Get the length of the content.
	 * Depending on the option, the length of the character is taken. (charCounterType)
	 * @param {String} content Content to count
	 * @param {String} charCounterType options.charCounterType
	 * @returns {Number}
	 */
	getCharLength: function(content, charCounterType) {
		return /byte/.test(charCounterType) ? util.getByteLength(content) : content.length;
	},

	/**
	 * @description Set the char count to charCounter element textContent.
	 * @private
	 */
	_setCharCount: function() {
		if (context.element.charCounter) {
			_w.setTimeout(function() {
				context.element.charCounter.textContent = functions.getCharCount(options.charCounterType);
			});
		}
	},

	/**
	 * @description The character counter blinks.
	 * @private
	 */
	_callCounterBlink: function() {
		const charWrapper = context.element.charWrapper;
		if (charWrapper && !util.hasClass(charWrapper, "se-blink")) {
			util.addClass(charWrapper, "se-blink");
			_w.setTimeout(function() {
				util.removeClass(charWrapper, "se-blink");
			}, 600);
		}
	},

	/**
	 * @description Get the editor's number of characters or binary data size.
	 * You can use the "charCounterType" option format.
	 * @param {String|null} charCounterType options - charCounterType ('char', 'byte', 'byte-html')
	 * If argument is no value, the currently set "charCounterType" option is used.
	 * @returns {Number}
	 */
	getCharCount: function(charCounterType) {
		charCounterType = typeof charCounterType === "string" ? charCounterType : options.charCounterType;
		return core.getCharLength(
			core._charTypeHTML ? context.element.wysiwyg.innerHTML : context.element.wysiwyg.textContent,
			charCounterType
		);
	},

	/**
	 * @descriptionGets Get the length in bytes of a string.
	 * referencing code: "https://github.com/shaan1974/myrdin/blob/master/expressions/string.js#L11"
	 * @param {String} text String text
	 * @returns {Number}
	 */
	getByteLength: function(text) {
		if (!text || !text.toString) return 0;
		text = text.toString();

		const encoder = this._w.encodeURIComponent;
		let cr, cl;
		if (this.isIE || this.isEdge) {
			cl = this._w.unescape(encoder(text)).length;
			cr = 0;

			if (encoder(text).match(/(%0A|%0D)/gi) !== null) {
				cr = encoder(text).match(/(%0A|%0D)/gi).length;
			}

			return cl + cr;
		} else {
			cl = new this._w.TextEncoder("utf-8").encode(text).length;
			cr = 0;

			if (encoder(text).match(/(%0A|%0D)/gi) !== null) {
				cr = encoder(text).match(/(%0A|%0D)/gi).length;
			}

			return cl + cr;
		}
	},

	constructor: Char
};

export default Char;
