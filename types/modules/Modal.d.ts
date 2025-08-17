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
	offset: import('../core/class/offset').default;
	ui: import('../core/class/ui').default;
	inst: any;
	kind: any;
	form: HTMLElement;
	isUpdate: boolean;
	/** @type {HTMLInputElement} */
	focusElement: HTMLInputElement;
	/** @type {HTMLElement} */
	_modalArea: HTMLElement;
	/** @type {HTMLElement} */
	_modalInner: HTMLElement;
	_closeListener: any[];
	_bindClose: __se__GlobalEventInfo;
	_onClickEvent: any;
	_closeSignal: boolean;
	/** @type {HTMLElement} */
	_resizeBody: HTMLElement;
	_currentHandle: HTMLElement;
	__resizeDir: string;
	__offetTop: number;
	__offetLeft: number;
	__globalEventHandlers: {
		mousemove: any;
		mouseup: any;
	};
	_bindClose_mousemove: __se__GlobalEventInfo;
	_bindClose_mouseup: __se__GlobalEventInfo;
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
	/**
	 * @private
	 * @description Fixes the current controller's display state when the modal is opened or closed.
	 * @param {boolean} fixed - Whether to fix or unfix the controller.
	 */
	private _fixCurrentController;
	/**
	 * @private
	 * @description Saves the current offset position of the modal for resizing calculations.
	 * @returns {__se__Class_OffsetGlobalInfo} The offset position of the modal.
	 */
	private _saveOffset;
	/**
	 * @private
	 * @description Adds global event listeners for resizing the modal.
	 * @param {string} dir - The direction in which resizing is occurring.
	 */
	private __addGlobalEvent;
	/**
	 * @private
	 * @description Removes global event listeners related to modal resizing.
	 */
	private __removeGlobalEvent;
	#private;
}
import CoreInjector from '../editorInjector/_core';
