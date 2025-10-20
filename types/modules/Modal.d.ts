import type {} from '../typedef';
export default Modal;
/**
 * @class
 * @description Modal window module
 */
declare class Modal extends CoreInjector {
	/**
	 * @description Create a file input tag in the modal window.
	 * @param {{icons: __se__EditorCore['icons'], lang: __se__EditorCore['lang']}} param0 - icons and language object
	 * @param {{acceptedFormats: string, allowMultiple}} param1 - options
	 * - acceptedFormats: "image/*, video/*, audio/*", etc.
	 * - allowMultiple: true or false
	 * @returns {string} HTML string
	 */
	static CreateFileInput(
		{
			icons,
			lang
		}: {
			icons: __se__EditorCore['icons'];
			lang: __se__EditorCore['lang'];
		},
		{
			acceptedFormats,
			allowMultiple
		}: {
			acceptedFormats: string;
			allowMultiple: any;
		}
	): string;
	/**
	 * @description A function called when the contents of "input" have changed and you want to adjust the style.
	 * @param {Element} wrapper - Modal file input wrapper(.se-flex-input-wrapper)
	 * @param {FileList|File[]} files - FileList object
	 */
	static OnChangeFile(wrapper: Element, files: FileList | File[]): void;
	/**
	 * @description Modal window module
	 * @param {* & {editor: __se__EditorCore}} inst The instance object that called the constructor.
	 * @param {Element} element Modal element
	 */
	constructor(
		inst: any & {
			editor: __se__EditorCore;
		},
		element: Element
	);
	ui: import('../core/class/ui').default;
	offset: import('../core/class/offset').default;
	inst: any;
	kind: any;
	form: HTMLElement;
	isUpdate: boolean;
	/** @type {HTMLInputElement} */
	focusElement: HTMLInputElement;
	/**
	 * @description Open a modal plugin
	 * - The plugin's "init" method is called.
	 */
	open(): void;
	/**
	 * @description Close a modal plugin
	 * - The plugin's "init" and "off" method is called.
	 */
	close(): void;
	#private;
}
import CoreInjector from '../editorInjector/_core';
