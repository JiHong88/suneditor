export default Modal;
export type ModalThis = Modal & Partial<__se__EditorInjector>;
export type OffsetGlobalInfo = import('../core/class/offset').OffsetGlobalInfo;
/**
 * @typedef {Modal & Partial<__se__EditorInjector>} ModalThis
 */
/**
 * @typedef {import('../core/class/offset').OffsetGlobalInfo} OffsetGlobalInfo
 */
/**
 * @constructor
 * @this {ModalThis}
 * @description Modal window module
 * @param {* & {editor: __se__EditorCore}} inst The instance object that called the constructor.
 * @param {Element} element Modal element
 */
declare function Modal(
	this: ModalThis,
	inst: any & {
		editor: __se__EditorCore;
	},
	element: Element
): void;
declare class Modal {
	/**
	 * @typedef {Modal & Partial<__se__EditorInjector>} ModalThis
	 */
	/**
	 * @typedef {import('../core/class/offset').OffsetGlobalInfo} OffsetGlobalInfo
	 */
	/**
	 * @constructor
	 * @this {ModalThis}
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
	offset: any;
	ui: any;
	inst: any;
	kind: any;
	form: HTMLElement;
	isUpdate: boolean;
	/** @type {HTMLInputElement} */
	focusElement: HTMLInputElement;
	/** @type {HTMLElement} */
	_modalArea: HTMLElement;
	/** @type {HTMLElement} */
	_modalBack: HTMLElement;
	/** @type {HTMLElement} */
	_modalInner: HTMLElement;
	_closeListener: any[];
	_bindClose: any;
	_onClickEvent: any;
	_closeSignal: boolean;
	/** @type {HTMLElement} */
	_resizeBody: HTMLElement;
	_currentHandle: any;
	__resizeDir: string;
	__offetTop: number;
	__offetLeft: number;
	__globalEventHandlers: {
		mousemove: any;
		mouseup: any;
	};
	_bindClose_mousemove: any;
	_bindClose_mouseup: any;
	/**
	 * @this {ModalThis}
	 * @description Open a modal plugin
	 * - The plugin's "init" method is called.
	 */
	open(this: ModalThis): void;
	/**
	 * @this {ModalThis}
	 * @description Close a modal plugin
	 * - The plugin's "init" and "off" method is called.
	 */
	close(this: ModalThis): void;
	/**
	 * @private
	 * @this {ModalThis}
	 * @description Fixes the current controller's display state when the modal is opened or closed.
	 * @param {boolean} fixed - Whether to fix or unfix the controller.
	 */
	_fixCurrentController(this: ModalThis, fixed: boolean): void;
	/**
	 * @private
	 * @this {ModalThis}
	 * @description Saves the current offset position of the modal for resizing calculations.
	 * @returns {OffsetGlobalInfo} Offset values including top and left positions. (offset.getGlobal)
	 */
	_saveOffset(this: ModalThis): OffsetGlobalInfo;
	/**
	 * @private
	 * @this {ModalThis}
	 * @description Adds global event listeners for resizing the modal.
	 * @param {string} dir - The direction in which resizing is occurring.
	 */
	__addGlobalEvent(this: ModalThis, dir: string): void;
	/**
	 * @private
	 * @this {ModalThis}
	 * @description Removes global event listeners related to modal resizing.
	 */
	__removeGlobalEvent(this: ModalThis): void;
}
declare namespace Modal {
	export { CreateFileInput, OnChangeFile };
}
/**
 * @description Create a file input tag in the modal window.
 * @param {{icons: __se__EditorCore['icons'], lang: __se__EditorCore['lang']}} param0 - icons and language object
 * @param {{acceptedFormats: string, allowMultiple}} param1 - options
 * - acceptedFormats: "image/*, video/*, audio/*", etc.
 * - allowMultiple: true or false
 * @returns {string} HTML string
 */
declare function CreateFileInput(
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
declare function OnChangeFile(wrapper: Element, files: FileList | File[]): void;
