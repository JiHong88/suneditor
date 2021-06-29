import CoreInterface from "../../interface/_core";
class Char extends CoreInterface {
  /**
   * @description Returns false if char count is greater than "options.maxCharCount" when "html" is added to the current editor.
   * @param element Element node or String.
   */
  check(html: Node | string): boolean;

  /**
   * @description Get the [content]'s number of characters or binary data size. (options.charCounterType)
	 * If [content] is undefined, get the current editor's number of characters or binary data size.
	 * @param content Content to count. (defalut: this.context.element.wysiwyg)
   */
  getLength(content?: string): number;

  /**
	 * @description Set the char count to charCounter element textContent.
	 */
  display(): void;

  /**
	 * @description Returns false if char count is greater than "options.maxCharCount" when "inputText" is added to the current editor.
	 * If the current number of characters is greater than "maxCharCount", the excess characters are removed.
	 * And call the char.display()
	 * @param inputText Text added.
	 * @returns
	 */
  test(inputText: string): boolean;
}

export default Char;