export default ModalAnchorEditor;
export type RELAttr = {
	default?: string;
	check_new_window?: string;
	check_bookmark?: string;
};
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
	defaultRel?: RELAttr;
	/**
	 * - File upload URL.
	 */
	uploadUrl?: string | undefined;
	/**
	 * - File upload headers.
	 */
	uploadHeaders?:
		| {
				[x: string]: string;
		  }
		| undefined;
	/**
	 * - File upload size limit.
	 */
	uploadSizeLimit?: number | undefined;
	/**
	 * - File upload single size limit.
	 */
	uploadSingleSizeLimit?: number | undefined;
	/**
	 * - File upload accepted formats.
	 */
	acceptedFormats?: string | undefined;
	/**
	 * - If true, enables file upload.
	 */
	enableFileUpload?: boolean | undefined;
};
/**
 * @typedef {{default?: string, check_new_window?: string, check_bookmark?: string}} RELAttr
 */
/**
 * @typedef {Object} ModalAnchorEditorParams
 * @property {boolean} [title=false] - Modal title display.
 * @property {boolean} [textToDisplay=''] - Create Text to display input.
 * @property {boolean} [openNewWindow=false] - Default checked value of the "Open in new window" checkbox.
 * @property {boolean} [noAutoPrefix=false] - If true, disables the automatic prefixing of the host URL to the value of the link.
 * @property {Array<string>} [relList=[]] - The "rel" attribute list of anchor tag.
 * @property {RELAttr} [defaultRel={}] - Default "rel" attributes of anchor tag.
 * @property {string=} uploadUrl - File upload URL.
 * @property {Object<string, string>=} uploadHeaders - File upload headers.
 * @property {number=} uploadSizeLimit - File upload size limit.
 * @property {number=} uploadSingleSizeLimit - File upload single size limit.
 * @property {string=} acceptedFormats - File upload accepted formats.
 * @property {boolean=} enableFileUpload - If true, enables file upload.
 * @example "REL" structure
    {
        default: 'nofollow', // Default rel
        check_new_window: 'noreferrer noopener', // When "open new window" is checked
        check_bookmark: 'bookmark' // When "bookmark" is checked
    }
    If true, disables the automatic prefixing of the host URL to the value of the link.
 */
/**
 * @class
 * @description Modal form Anchor tag editor
 * - Use it by inserting it into Modal in a plugin that uses Modal.
 */
declare class ModalAnchorEditor extends EditorInjector {
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {Node} modalForm The modal form element
	 * @param {ModalAnchorEditorParams} params ModalAnchorEditor options
	 */
	constructor(inst: any, modalForm: Node, params: ModalAnchorEditorParams);
	openNewWindow: boolean;
	relList: string[];
	defaultRel: RELAttr;
	noAutoPrefix: boolean;
	uploadUrl: string;
	uploadHeaders: {
		[x: string]: string;
	};
	uploadSizeLimit: number;
	uploadSingleSizeLimit: number;
	input: HTMLElement;
	fileManager: FileManager;
	kink: any;
	inst: any;
	modalForm: HTMLElement;
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
	_change: boolean;
	_isRel: boolean;
	/** @type {HTMLButtonElement} */
	relButton: HTMLButtonElement;
	/** @type {HTMLElement} */
	relPreview: HTMLElement;
	selectMenu_rel: SelectMenu;
	selectMenu_bookmark: SelectMenu;
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
	/**
	 * @private
	 * @description Updates the anchor element with new attributes.
	 * @param {HTMLAnchorElement} anchor - The anchor (`<a>`) element to update.
	 * @param {string} url - The URL for the anchor's `href` attribute.
	 * @param {string} displayText - The text to be displayed inside the anchor.
	 * @param {string} title - The tooltip text (title attribute).
	 * @param {boolean} notText - If `true`, the anchor will not contain text content.
	 */
	private _updateAnchor;
	/**
	 * @private
	 * @description Checks if the given path is an internal bookmark.
	 * @param {string} path - The URL or anchor link.
	 * @returns {boolean} - `true` if the path is an internal bookmark, otherwise `false`.
	 */
	private _selfPathBookmark;
	/**
	 * @private
	 * @description Updates the `rel` attribute list in the modal and preview.
	 * @param {string} relAttr - The `rel` attribute string to set.
	 */
	private _setRel;
	/**
	 * @private
	 * @description Generates a list of bookmark headers within the editor.
	 * @param {string} urlValue - The current URL input value.
	 */
	private _createBookmarkList;
	/**
	 * @private
	 * @description Updates the preview of the anchor link.
	 * @param {string} value - The current URL value.
	 */
	private _setLinkPreview;
	/**
	 * @private
	 * @description Merges the given `rel` attribute value with the current list.
	 * @param {string} relAttr - The `rel` attribute to merge.
	 * @returns {string} - The updated `rel` attribute string.
	 */
	private _relMerge;
	/**
	 * @private
	 * @description Removes the specified `rel` attribute from the current list.
	 * @param {string} relAttr - The `rel` attribute to remove.
	 * @returns {string} - The updated `rel` attribute string.
	 */
	private _relDelete;
	/**
	 * @private
	 * @description Registers a newly uploaded file and sets its URL in the modal form.
	 * @param {Object<string, *>} response - The response object from the file upload request.
	 */
	private _register;
	/**
	 * @private
	 * @description Handles file upload errors.
	 * @param {Object<string, *>} response - The error response object.
	 * @returns {Promise<void>}
	 */
	private _error;
	/**
	 * @description Handles the callback after a file upload completes.
	 * @param {XMLHttpRequest} xmlHttp - The XMLHttpRequest object containing the response.
	 */
	_uploadCallBack(xmlHttp: XMLHttpRequest): void;
	#private;
}
import EditorInjector from '../editorInjector';
import FileManager from './FileManager';
import SelectMenu from './SelectMenu';
