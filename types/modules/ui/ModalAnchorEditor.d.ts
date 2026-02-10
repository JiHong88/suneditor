import type {} from '../../typedef';
export default ModalAnchorEditor;
export type ModalAnchorEditorParams = {
	/**
	 * - Modal title display.
	 */
	title?: boolean;
	/**
	 * - Create Text to display input.
	 */
	textToDisplay?: boolean;
	/**
	 * - Default checked value of the "Open in new window" checkbox.
	 */
	openNewWindow?: boolean;
	/**
	 * - If true, disables the automatic prefixing of the host URL to the value of the link.
	 */
	noAutoPrefix?: boolean;
	/**
	 * - The "rel" attribute list of anchor tag.
	 */
	relList?: Array<string>;
	/**
	 * - Default "rel" attributes of anchor tag.
	 */
	defaultRel?: {
		default?: string;
		check_new_window?: string;
		check_bookmark?: string;
	};
	/**
	 * - File upload URL.
	 */
	uploadUrl?: string;
	/**
	 * - File upload headers.
	 */
	uploadHeaders?: {
		[x: string]: string;
	};
	/**
	 * - File upload size limit.
	 */
	uploadSizeLimit?: number;
	/**
	 * - File upload single size limit.
	 */
	uploadSingleSizeLimit?: number;
	/**
	 * - File upload accepted formats.
	 */
	acceptedFormats?: string;
	/**
	 * - If true, enables file upload.
	 */
	enableFileUpload?: boolean;
};
/**
 * @typedef {Object} ModalAnchorEditorParams
 * @property {boolean} [title=false] - Modal title display.
 * @property {boolean} [textToDisplay=''] - Create Text to display input.
 * @property {boolean} [openNewWindow=false] - Default checked value of the "Open in new window" checkbox.
 * @property {boolean} [noAutoPrefix=false] - If true, disables the automatic prefixing of the host URL to the value of the link.
 * @property {Array<string>} [relList=[]] - The "rel" attribute list of anchor tag.
 * @property {{default?: string, check_new_window?: string, check_bookmark?: string}} [defaultRel={}] - Default "rel" attributes of anchor tag.
 * @property {string} [uploadUrl] - File upload URL.
 * @property {Object<string, string>} [uploadHeaders] - File upload headers.
 * @property {number} [uploadSizeLimit] - File upload size limit.
 * @property {number} [uploadSingleSizeLimit] - File upload single size limit.
 * @property {string} [acceptedFormats] - File upload accepted formats.
 * @property {boolean} [enableFileUpload] - If true, enables file upload.
 */
/**
 * @class
 * @description Modal form Anchor tag editor
 * - Use it by inserting it into Modal in a plugin that uses Modal.
 */
declare class ModalAnchorEditor {
	/**
	 * @constructor
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {HTMLElement} modalForm Modal <form>
	 * @param {ModalAnchorEditorParams} params ModalAnchorEditor options
	 */
	constructor($: SunEditor.Deps, modalForm: HTMLElement, params: ModalAnchorEditorParams);
	openNewWindow: boolean;
	relList: string[];
	defaultRel: {
		default?: string;
		check_new_window?: string;
		check_bookmark?: string;
	};
	noAutoPrefix: boolean;
	uploadUrl: string;
	uploadHeaders: {
		[x: string]: string;
	};
	uploadSizeLimit: number;
	uploadSingleSizeLimit: number;
	input: HTMLElement;
	fileManager: FileManager;
	host: string;
	/** @type {HTMLInputElement} */
	urlInput: HTMLInputElement;
	/** @type {HTMLInputElement} */
	displayInput: HTMLInputElement;
	/** @type {HTMLInputElement} */
	titleInput: HTMLInputElement;
	/** @type {HTMLInputElement} */
	newWindowCheck: HTMLInputElement;
	/** @type {HTMLInputElement} */
	downloadCheck: HTMLInputElement;
	/** @type {HTMLElement} */
	download: HTMLElement;
	/** @type {HTMLElement} */
	preview: HTMLElement;
	/** @type {HTMLElement} */
	bookmark: HTMLElement;
	/** @type {HTMLButtonElement} */
	bookmarkButton: HTMLButtonElement;
	currentRel: any[];
	currentTarget: HTMLAnchorElement;
	linkValue: string;
	/** @type {HTMLButtonElement} */
	relButton: HTMLButtonElement;
	/** @type {HTMLElement} */
	relPreview: HTMLElement;
	/**
	 * @description Initialize.
	 * - Sets the current anchor element to be edited.
	 * @param {Node} element Modal target element
	 */
	set(element: Node): void;
	/**
	 * @description Opens the anchor editor modal and populates it with data.
	 * @param {boolean} isUpdate - Indicates whether an existing anchor is being updated (`true`) or a new one is being created (`false`).
	 */
	on(isUpdate: boolean): void;
	/**
	 * @description Creates an anchor (`<a>`) element with the specified attributes.
	 * @param {boolean} notText - If `true`, the anchor will not contain text content.
	 * @returns {HTMLElement|null} - The newly created anchor element, or `null` if the URL is empty.
	 */
	create(notText: boolean): HTMLElement | null;
	/**
	 * @description Resets the ModalAnchorEditor to its initial state.
	 */
	init(): void;
	#private;
}
import FileManager from '../manager/FileManager';
