export default Browser;
export type BrowserThis = Browser & Partial<CoreInjector>;
export type BrowserFile = {
	/**
	 * - Source url
	 */
	src?: string;
	/**
	 * - File name | Folder name
	 */
	name?: string;
	/**
	 * - Thumbnail url
	 */
	thumbnail?: string | undefined;
	/**
	 * - Image alt
	 */
	alt?: string | undefined;
	/**
	 * - Tag name list
	 */
	tag?: (Array<string> | string) | undefined;
	/**
	 * - Type (image, video, audio, etc.)
	 */
	type?: string | undefined;
	/**
	 * - Frame name (iframe, video, etc.)
	 */
	frame?: string | undefined;
	/**
	 * - The folder's contents or an API URL.
	 */
	_data?: (BrowserFile | string) | undefined;
	/**
	 * - Whether this folder is the default selection.
	 */
	default?: boolean | undefined;
	/**
	 * - Metadata
	 */
	meta?:
		| {
				[x: string]: any;
		  }
		| undefined;
};
export type BrowserParams = {
	/**
	 * - File browser window title. Required. Can be overridden in browser.
	 */
	title: string;
	/**
	 * - Class name of the file browser. Optional. Default: ''.
	 */
	className?: string | undefined;
	/**
	 * - direct data without server calls
	 */
	data?:
		| (
				| {
						[x: string]: any;
				  }
				| Array<any>
		  )
		| undefined;
	/**
	 * - File server url. Required. Can be overridden in browser.
	 */
	url?: string | undefined;
	/**
	 * - File server http header. Required. Can be overridden in browser.
	 */
	headers?:
		| {
				[x: string]: string;
		  }
		| undefined;
	/**
	 * - Function that actions when an item is clicked. Required. Can be overridden in browser.
	 */
	selectorHandler: (target: Node) => void;
	/**
	 * - Whether to use the search function. Optional. Default: true.
	 */
	useSearch?: boolean | undefined;
	/**
	 * - File server search url. Optional. Can be overridden in browser.
	 */
	searchUrl?: string | undefined;
	/**
	 * - File server search http header. Optional. Can be overridden in browser.
	 */
	searchUrlHeader?:
		| {
				[x: string]: string;
		  }
		| undefined;
	/**
	 * - Class name of list div. Required. Can be overridden in browser.
	 */
	listClass?: string | undefined;
	/**
	 * - Function that defines the HTML of a file item. Required. Can be overridden in browser.
	 */
	drawItemHandler?: ((item: BrowserFile) => string) | undefined;
	/**
	 * - "props" argument to "drawItemHandler" function. Optional. Can be overridden in browser.
	 */
	props?: Array<any> | undefined;
	/**
	 * - Number of "div.se-file-item-column" to be created. Optional. Can be overridden in browser. Default: 4.
	 */
	columnSize?: number | undefined;
	/**
	 * - Default thumbnail
	 */
	thumbnail?: ((item: BrowserFile) => string) | undefined;
};
/**
 * @typedef {Browser & Partial<CoreInjector>} BrowserThis
 */
/**
 * @typedef {Object} BrowserFile
 * @property {string} [src=""] - Source url
 * @property {string} [name=""] - File name | Folder name
 * @property {string=} thumbnail - Thumbnail url
 * @property {string=} alt - Image alt
 * @property {Array<string>|string=} tag - Tag name list
 * @property {string=} type - Type (image, video, audio, etc.)
 * @property {string=} frame - Frame name (iframe, video, etc.)
 * @property {BrowserFile | string=} _data - The folder's contents or an API URL.
 * @property {boolean=} default - Whether this folder is the default selection.
 * @property {Object<string, *>=} meta - Metadata
 */
/**
 * @typedef BrowserParams
 * @property {string} title - File browser window title. Required. Can be overridden in browser.
 * @property {string=} className - Class name of the file browser. Optional. Default: ''.
 * @property {Object<string, *>|Array<*>=} data - direct data without server calls
 * @property {string=} url - File server url. Required. Can be overridden in browser.
 * @property {Object<string, string>=} headers - File server http header. Required. Can be overridden in browser.
 * @property {(target: Node) => void} selectorHandler - Function that actions when an item is clicked. Required. Can be overridden in browser.
 * @property {boolean=} useSearch - Whether to use the search function. Optional. Default: true.
 * @property {string=} searchUrl - File server search url. Optional. Can be overridden in browser.
 * @property {Object<string, string>=} searchUrlHeader - File server search http header. Optional. Can be overridden in browser.
 * @property {string=} listClass - Class name of list div. Required. Can be overridden in browser.
 * @property {(item: BrowserFile) => string=} drawItemHandler - Function that defines the HTML of a file item. Required. Can be overridden in browser.
 * @property {Array<*>=} props - "props" argument to "drawItemHandler" function. Optional. Can be overridden in browser.
 * @property {number=} columnSize - Number of "div.se-file-item-column" to be created. Optional. Can be overridden in browser. Default: 4.
 * @property {((item: BrowserFile) => string)=} thumbnail - Default thumbnail
 */
/**
 * @constructor
 * @this {BrowserThis}
 * @param {*} inst The instance object that called the constructor.
 * @param {BrowserParams} params Browser options
 */
declare function Browser(this: BrowserThis, inst: any, params: BrowserParams): void;
declare class Browser {
	/**
	 * @typedef {Browser & Partial<CoreInjector>} BrowserThis
	 */
	/**
	 * @typedef {Object} BrowserFile
	 * @property {string} [src=""] - Source url
	 * @property {string} [name=""] - File name | Folder name
	 * @property {string=} thumbnail - Thumbnail url
	 * @property {string=} alt - Image alt
	 * @property {Array<string>|string=} tag - Tag name list
	 * @property {string=} type - Type (image, video, audio, etc.)
	 * @property {string=} frame - Frame name (iframe, video, etc.)
	 * @property {BrowserFile | string=} _data - The folder's contents or an API URL.
	 * @property {boolean=} default - Whether this folder is the default selection.
	 * @property {Object<string, *>=} meta - Metadata
	 */
	/**
	 * @typedef BrowserParams
	 * @property {string} title - File browser window title. Required. Can be overridden in browser.
	 * @property {string=} className - Class name of the file browser. Optional. Default: ''.
	 * @property {Object<string, *>|Array<*>=} data - direct data without server calls
	 * @property {string=} url - File server url. Required. Can be overridden in browser.
	 * @property {Object<string, string>=} headers - File server http header. Required. Can be overridden in browser.
	 * @property {(target: Node) => void} selectorHandler - Function that actions when an item is clicked. Required. Can be overridden in browser.
	 * @property {boolean=} useSearch - Whether to use the search function. Optional. Default: true.
	 * @property {string=} searchUrl - File server search url. Optional. Can be overridden in browser.
	 * @property {Object<string, string>=} searchUrlHeader - File server search http header. Optional. Can be overridden in browser.
	 * @property {string=} listClass - Class name of list div. Required. Can be overridden in browser.
	 * @property {(item: BrowserFile) => string=} drawItemHandler - Function that defines the HTML of a file item. Required. Can be overridden in browser.
	 * @property {Array<*>=} props - "props" argument to "drawItemHandler" function. Optional. Can be overridden in browser.
	 * @property {number=} columnSize - Number of "div.se-file-item-column" to be created. Optional. Can be overridden in browser. Default: 4.
	 * @property {((item: BrowserFile) => string)=} thumbnail - Default thumbnail
	 */
	/**
	 * @constructor
	 * @this {BrowserThis}
	 * @param {*} inst The instance object that called the constructor.
	 * @param {BrowserParams} params Browser options
	 */
	constructor(inst: any, params: BrowserParams);
	useSearch: boolean;
	kind: any;
	inst: any;
	area: HTMLElement;
	header: HTMLElement;
	titleArea: HTMLElement;
	tagArea: HTMLElement;
	body: HTMLElement;
	list: HTMLElement;
	side: HTMLElement;
	wrapper: HTMLElement;
	_loading: HTMLElement;
	title: string;
	listClass: string;
	directData:
		| any[]
		| {
				[x: string]: any;
		  };
	url: string;
	urlHeader: {
		[x: string]: string;
	};
	searchUrl: string;
	searchUrlHeader: {
		[x: string]: string;
	};
	drawItemHandler: any;
	selectorHandler: (target: Node) => void;
	columnSize: number;
	folderDefaultPath: string;
	closeArrow: string;
	openArrow: string;
	icon_folder: string;
	icon_folder_item: string;
	icon_item: string;
	/**
	 * @type {Array<BrowserFile>}
	 */
	items: Array<BrowserFile>;
	/**
	 * @type {Object<string, {name: string, meta: Object<string, *>}>}
	 */
	folders: {
		[x: string]: {
			name: string;
			meta: {
				[x: string]: any;
			};
		};
	};
	/**
	 * @type {Object<string, {key?: string, name?: string, children?: *}>}
	 */
	tree: {
		[x: string]: {
			key?: string;
			name?: string;
			children?: any;
		};
	};
	/**
	 * @type {BrowserFile}
	 */
	data: BrowserFile;
	selectedTags: any[];
	keyword: string;
	sideInner: any;
	_closeSignal: boolean;
	_bindClose: any;
	__globalEventHandler: (e: any) => void;
	apiManager: ApiManager;
	sideOpenBtn: HTMLButtonElement;
	/**
	 * @this {BrowserThis}
	 * @description Open a file browser plugin
	 * @param {Object} [params={}]
	 * @param {string=} params.listClass - Class name of list div. If not, use "this.listClass".
	 * @param {string=} params.title - File browser window title. If not, use "this.title".
	 * @param {string=} params.url - File server url. If not, use "this.url".
	 * @param {Object<string, string>=} params.urlHeader - File server http header. If not, use "this.urlHeader".
	 */
	open(
		this: BrowserThis,
		params?: {
			listClass?: string | undefined;
			title?: string | undefined;
			url?: string | undefined;
			urlHeader?:
				| {
						[x: string]: string;
				  }
				| undefined;
		}
	): void;
	/**
	 * @this {BrowserThis}
	 * @description Close a browser plugin
	 * - The plugin's "init" method is called.
	 */
	close(this: BrowserThis): void;
	/**
	 * @this {BrowserThis}
	 * @description Search files
	 * @param {string} keyword - Search keyword
	 */
	search(this: BrowserThis, keyword: string): void;
	/**
	 * @this {BrowserThis}
	 * @description Filter items by tag
	 * @param {Array<BrowserFile>} items - Items to filter
	 * @returns {Array<BrowserFile>}
	 */
	tagfilter(this: BrowserThis, items: Array<BrowserFile>): Array<BrowserFile>;
	/**
	 * @this {BrowserThis}
	 * @description Show file browser loading box
	 */
	showBrowserLoading(this: BrowserThis): void;
	/**
	 * @this {BrowserThis}
	 * @description Close file browser loading box
	 */
	closeBrowserLoading(this: BrowserThis): void;
	/**
	 * @private
	 * @this {BrowserThis}
	 * @description Fetches the file list from the server.
	 * @param {string} url - The file server URL.
	 * @param {Object<string, string>} urlHeader - The HTTP headers for the request.
	 * @param {boolean} pageLoading - Indicates if this is a paginated request.
	 */
	_drawFileList(
		this: BrowserThis,
		url: string,
		urlHeader: {
			[x: string]: string;
		},
		pageLoading: boolean
	): void;
	/**
	 * @private
	 * @this {BrowserThis}
	 * @description Updates the displayed list of file items.
	 * @param {Array<BrowserFile>} items - The file items to display.
	 * @param {boolean} update - Whether to update the tags.
	 */
	_drawListItem(this: BrowserThis, items: Array<BrowserFile>, update: boolean): void;
	/**
	 * @private
	 * @this {BrowserThis}
	 * @description Adds a global event listener for closing the browser.
	 */
	__addGlobalEvent(this: BrowserThis): void;
	/**
	 * @private
	 * @this {BrowserThis}
	 * @description Removes the global event listener for closing the browser.
	 */
	__removeGlobalEvent(this: BrowserThis): void;
	/**
	 * @private
	 * @this {BrowserThis}
	 * @description Renders the file items or folder structure from data.
	 * @param {BrowserFile[]|BrowserFile} data - The data representing the file structure.
	 * @returns {boolean} True if rendering was successful, false otherwise.
	 */
	__drowItems(this: BrowserThis, data: BrowserFile[] | BrowserFile): boolean;
	/**
	 * @private
	 * @this {BrowserThis}
	 * @description Parses folder data into a structured format.
	 * @param {BrowserFile} data - The folder data.
	 * @param {string} [path] - The current path in the folder hierarchy.
	 */
	__parseFolderData(this: BrowserThis, data: BrowserFile, path?: string): void;
	/**
	 * @private
	 * @this {BrowserThis}
	 * @description Creates a nested folder list from parsed data.
	 * @param {BrowserFile[]|BrowserFile} folderData - The structured folder data.
	 * @param {HTMLElement} parentElement - The parent element to append folder structure to.
	 */
	__createFolderList(this: BrowserThis, folderData: BrowserFile[] | BrowserFile, parentElement: HTMLElement): void;
}
import CoreInjector from '../editorInjector/_core';
import ApiManager from './ApiManager';
