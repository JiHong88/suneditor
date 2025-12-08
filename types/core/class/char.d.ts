import type {} from '../../typedef';
export default Char;
/**
 * @description character count, character limit, etc. management class
 */
declare class Char extends CoreInjector {
	/**
	 * @description Returns false if char count is greater than "frameOptions.get('charCounter_max')" when "html" is added to the current editor.
	 * @param {Node|string} html Element node or String.
	 * @returns {boolean}
	 */
	check(html: Node | string): boolean;
	/**
	 * @description Get the [content]'s number of characters or binary data size. (frameOptions.get('charCounter_type'))
	 * - If [content] is undefined, get the current editor's number of characters or binary data size.
	 * @param {string} [content] Content to count. (defalut: this.frameContext.get('wysiwyg'))
	 * @returns {number}
	 */
	getLength(content?: string): number;
	/**
	 * @descriptionGets Get the length in bytes of a string.
	 * @param {string} text String text
	 * @returns {number}
	 */
	getByteLength(text: string): number;
	/**
	 * @description Set the char count to charCounter element textContent.
	 * @param {?SunEditor.FrameContext} [fc] Frame context
	 */
	display(fc?: SunEditor.FrameContext | null): void;
	/**
	 * @description Returns false if char count is greater than "frameOptions.get('charCounter_max')" when "inputText" is added to the current editor.
	 * - If the current number of characters is greater than "charCounter_max", the excess characters are removed.
	 * And call the char.display()
	 * @param {string} inputText Text added.
	 * @param {boolean} _fromInputEvent Whether the test is triggered from an input event.
	 * @returns {boolean}
	 */
	test(inputText: string, _fromInputEvent: boolean): boolean;
	/**
	 * @internal
	 * @description Destroy the Char instance and release memory
	 */
	_destroy(): void;
	#private;
}
import CoreInjector from '../../editorInjector/_core';
