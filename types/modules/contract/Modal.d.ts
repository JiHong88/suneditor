import type {} from '../../typedef';
export default Modal;
/**
 * @class
 * @description Modal window module
 */
declare class Modal {
	/**
	 * @description Create a file input tag in the modal window.
	 * @param {{icons: SunEditor.Deps['icons'], lang: SunEditor.Deps['lang']}} param0 - icons and language object
	 * @param {{acceptedFormats?: string, allowMultiple?: boolean}} param1 - options
	 * - acceptedFormats: "image/*, video/*, audio/*", etc.
	 * - allowMultiple: true or false
	 * @returns {string} HTML string
	 */
	static CreateFileInput(
		{
			icons,
			lang,
		}: {
			icons: SunEditor.Deps['icons'];
			lang: SunEditor.Deps['lang'];
		},
		{
			acceptedFormats,
			allowMultiple,
		}: {
			acceptedFormats?: string;
			allowMultiple?: boolean;
		},
	): string;
	/**
	 * @description A function called when the contents of "input" have changed and you want to adjust the style.
	 * @param {Element} wrapper - Modal file input wrapper(.se-flex-input-wrapper)
	 * @param {FileList|File[]} files - FileList object
	 */
	static OnChangeFile(wrapper: Element, files: FileList | File[]): void;
	/**
	 * @description Modal window module
	 * @param {*} inst The instance object that called the constructor.
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {Element} element Modal element
	 */
	constructor(inst: any, $: SunEditor.Deps, element: Element);
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
	 * - The plugin's "init" and "modalOff" method is called.
	 */
	close(): void;
	#private;
}
