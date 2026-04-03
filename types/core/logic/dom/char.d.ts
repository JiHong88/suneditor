import type {} from '../../../typedef';
export default Char;
/**
 * @description character count, character limit, etc. management class
 */
declare class Char {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/**
	 * @description Returns `false` if char count is greater than "frameOptions.get('charCounter_max')" when "html" is added to the current editor.
	 * @param {Node|string} html Element node or String.
	 * @returns {boolean}
	 * @example
	 * const canInsert = editor.$.char.check('<strong>new text</strong>');
	 */
	check(html: Node | string): boolean;
	/**
	 * @description Get the [content]'s number of characters or binary data size. (frameOptions.get('charCounter_type'))
	 * - If [content] is `undefined`, get the current editor's number of characters or binary data size.
	 * @param {string} [content] Content to count. (defalut: this.#frameContext.get('wysiwyg'))
	 * @returns {number}
	 * @example
	 * const currentLength = editor.$.char.getLength();
	 * const textLength = editor.$.char.getLength('Hello World');
	 */
	getLength(content?: string): number;
	/**
	 * @descriptionGets Get the length in bytes of a string.
	 * @param {string} text String text
	 * @returns {number}
	 * @example
	 * const bytes = editor.$.char.getByteLength('Hello 世界'); // 12
	 */
	getByteLength(text: string): number;
	/**
	 * @description Get the number of words in the content.
	 * - If [content] is `undefined`, get the current editor's word count.
	 * @param {string} [content] Content to count. (default: wysiwyg textContent)
	 * @returns {number}
	 * const currentWords = editor.$.char.getWordCount();
	 * const textWords = editor.$.char.getWordCount('Hello World');
	 */
	getWordCount(content?: string): number;
	/**
	 * @description Set the char count and word count to counter element textContent.
	 * @param {?SunEditor.FrameContext} [fc] Frame context
	 */
	display(fc?: SunEditor.FrameContext | null): void;
	/**
	 * @description Returns `false` if char count is greater than "frameOptions.get('charCounter_max')" when "inputText" is added to the current editor.
	 * - If the current number of characters is greater than "charCounter_max", the excess characters are removed.
	 * And call the char.display()
	 * @param {string} inputText Text added.
	 * @param {boolean} _fromInputEvent Whether the test is triggered from an input event.
	 * @returns {boolean}
	 * @example
	 * if (!editor.$.char.test(inputData, true)) {
	 *   e.preventDefault();
	 * }
	 */
	test(inputText: string, _fromInputEvent: boolean): boolean;
	#private;
}
