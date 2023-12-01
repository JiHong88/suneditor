import EditorDependency from "../src/editorInjector";

class Char extends EditorDependency {
	/**
	 * @description Returns false if char count is greater than "options.charCounter_max" when "html" is added to the current editor.
	 * @param element Element node or String.
	 */
	check(html: Node | string): boolean;

	/**
	 * @description Get the [content]'s number of characters or binary data size. (options.charCounter_type)
	 * If [content] is undefined, get the current editor's number of characters or binary data size.
	 * @param content Content to count. (defalut: this.editor.frameContext.get('wysiwyg'))
	 */
	getLength(content?: string): number;

	/**
	 * @descriptionGets Get the length in bytes of a string.
	 * @param text String text
	 * @returns
	 */
	getByteLength(text: string): number;

	/**
	 * @description Set the char count to charCounter element textContent.
	 */
	display(): void;

	/**
	 * @description Returns false if char count is greater than "options.charCounter_max" when "inputText" is added to the current editor.
	 * If the current number of characters is greater than "charCounter_max", the excess characters are removed.
	 * And call the char.display()
	 * @param inputText Text added.
	 * @returns
	 */
	test(inputText: string): boolean;
}

export default Char;