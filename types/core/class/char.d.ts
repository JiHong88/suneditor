import type {} from '../../typedef';
export default Char;
export type CharThis = Omit<Char & Partial<SunEditor.Injector>, 'char'>;
/**
 * @typedef {Omit<Char & Partial<SunEditor.Injector>, 'char'>} CharThis
 */
/**
 * @constructor
 * @this {CharThis}
 * @description character count, character limit, etc. management class
 * @param {SunEditor.Core} editor - The root editor instance
 */
declare function Char(this: Omit<Char & Partial<import('../../editorInjector').default>, 'char'>, editor: SunEditor.Core): void;
declare class Char {
	/**
	 * @typedef {Omit<Char & Partial<SunEditor.Injector>, 'char'>} CharThis
	 */
	/**
	 * @constructor
	 * @this {CharThis}
	 * @description character count, character limit, etc. management class
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	/**
	 * @this {CharThis}
	 * @description Returns false if char count is greater than "frameOptions.get('charCounter_max')" when "html" is added to the current editor.
	 * @param {Node|string} html Element node or String.
	 * @returns {boolean}
	 */
	check(this: Omit<Char & Partial<import('../../editorInjector').default>, 'char'>, html: Node | string): boolean;
	/**
	 * @this {CharThis}
	 * @description Get the [content]'s number of characters or binary data size. (frameOptions.get('charCounter_type'))
	 * - If [content] is undefined, get the current editor's number of characters or binary data size.
	 * @param {string} [content] Content to count. (defalut: this.frameContext.get('wysiwyg'))
	 * @returns {number}
	 */
	getLength(this: Omit<Char & Partial<import('../../editorInjector').default>, 'char'>, content?: string): number;
	/**
	 * @this {CharThis}
	 * @descriptionGets Get the length in bytes of a string.
	 * @param {string} text String text
	 * @returns {number}
	 */
	getByteLength(this: Omit<Char & Partial<import('../../editorInjector').default>, 'char'>, text: string): number;
	/**
	 * @this {CharThis}
	 * @description Set the char count to charCounter element textContent.
	 * @param {SunEditor.FrameContext|null} [fc] Frame context
	 */
	display(this: Omit<Char & Partial<import('../../editorInjector').default>, 'char'>, fc?: SunEditor.FrameContext | null): void;
	/**
	 * @this {CharThis}
	 * @description Returns false if char count is greater than "frameOptions.get('charCounter_max')" when "inputText" is added to the current editor.
	 * - If the current number of characters is greater than "charCounter_max", the excess characters are removed.
	 * And call the char.display()
	 * @param {string} inputText Text added.
	 * @param {boolean} _fromInputEvent Whether the test is triggered from an input event.
	 * @returns {boolean}
	 */
	test(this: Omit<Char & Partial<import('../../editorInjector').default>, 'char'>, inputText: string, _fromInputEvent: boolean): boolean;
}
