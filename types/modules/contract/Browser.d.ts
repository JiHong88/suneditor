import type {} from '../../typedef';
export default Browser;
/**
 * Browser file item structure
 */
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
	thumbnail?: string;
	/**
	 * - Image alt
	 */
	alt?: string;
	/**
	 * - Tag name list
	 */
	tag?: Array<string> | string;
	/**
	 * - Type (image, video, audio, etc.)
	 */
	type?: string;
	/**
	 * - Frame name (iframe, video, etc.)
	 */
	frame?: string;
	/**
	 * - Whether this folder is the default selection.
	 */
	default?: boolean;
	/**
	 * - Metadata
	 */
	meta?: {
		[x: string]: any;
	};
	/**
	 * - Internal: The folder's contents or an API URL (⚠️ DO NOT USE directly)
	 */
	_data?: BrowserFile | string;
};
export type BrowserParams = {
	/**
	 * - File browser window title. Required. Can be overridden in browser.
	 */
	title: string;
	/**
	 * - Class name of the file browser. Optional. Default: ''.
	 */
	className?: string;
	/**
	 * - direct data without server calls
	 */
	data?:
		| {
				[x: string]: any;
		  }
		| Array<any>;
	/**
	 * - File server url. Required. Can be overridden in browser.
	 */
	url?: string;
	/**
	 * - File server http header. Required. Can be overridden in browser.
	 */
	headers?: {
		[x: string]: string;
	};
	/**
	 * - Function that actions when an item is clicked. Required. Can be overridden in browser.
	 */
	selectorHandler: (target: Node) => void;
	/**
	 * - Whether to use the search function. Optional. Default: `true`.
	 */
	useSearch?: boolean;
	/**
	 * - File server search url. Optional. Can be overridden in browser.
	 * - Requested as `searchUrl + '?keyword=' + keyword`. The server must return:
	 * ```js
	 * {
	 * "result": [
	 * {
	 * "src": "https://example.com/file.jpg",
	 * "name": "file.jpg",
	 * "thumbnail": "https://example.com/file_thumb.jpg",
	 * "tag": ["photo"]
	 * }
	 * ]
	 * }
	 * ```
	 */
	searchUrl?: string;
	/**
	 * - File server search http header. Optional. Can be overridden in browser.
	 */
	searchUrlHeader?: {
		[x: string]: string;
	};
	/**
	 * - Class name of list div. Required. Can be overridden in browser.
	 */
	listClass?: string;
	/**
	 * - Function that returns HTML string for rendering each file item. Required. Can be overridden in browser.
	 * ```js
	 * // drawItemHandler
	 * (item) => `<div><img src="${item.thumbnail}"><span>${item.name}</span></div>`
	 * ```
	 */
	drawItemHandler?: (item: BrowserFile) => string;
	/**
	 * - `props` argument to `drawItemHandler` function. Optional. Can be overridden in browser.
	 */
	props?: Array<any>;
	/**
	 * - Number of `div.se-file-item-column` to be created.
	 * - Optional. Can be overridden in browser. Default: 4.
	 */
	columnSize?: number;
	/**
	 * - Initial folder expand depth. `1` expands the first level, `Infinity` expands all. Default: `1`.
	 */
	expand?: number;
	/**
	 * - Default thumbnail
	 */
	thumbnail?: (item: BrowserFile) => string;
};
/**
 * Browser file item structure
 * @typedef {Object} BrowserFile
 * @property {string} [src=""] - Source url
 * @property {string} [name=""] - File name | Folder name
 * @property {string} [thumbnail] - Thumbnail url
 * @property {string} [alt] - Image alt
 * @property {Array<string>|string} [tag] - Tag name list
 * @property {string} [type] - Type (image, video, audio, etc.)
 * @property {string} [frame] - Frame name (iframe, video, etc.)
 * @property {boolean} [default] - Whether this folder is the default selection.
 * @property {Object<string, *>} [meta] - Metadata
 * @property {BrowserFile | string} [_data] - Internal: The folder's contents or an API URL (⚠️ DO NOT USE directly)
 */
/**
 * @typedef BrowserParams
 * @property {string} title - File browser window title. Required. Can be overridden in browser.
 * @property {string} [className] - Class name of the file browser. Optional. Default: ''.
 * @property {Object<string, *>|Array<*>} [data] - direct data without server calls
 * @property {string} [url] - File server url. Required. Can be overridden in browser.
 * @property {Object<string, string>} [headers] - File server http header. Required. Can be overridden in browser.
 * @property {(target: Node) => void} selectorHandler - Function that actions when an item is clicked. Required. Can be overridden in browser.
 * @property {boolean} [useSearch] - Whether to use the search function. Optional. Default: `true`.
 * @property {string} [searchUrl] - File server search url. Optional. Can be overridden in browser.
 * - Requested as `searchUrl + '?keyword=' + keyword`. The server must return:
 * ```js
 * {
 *   "result": [
 *     {
 *       "src": "https://example.com/file.jpg",
 *       "name": "file.jpg",
 *       "thumbnail": "https://example.com/file_thumb.jpg",
 *       "tag": ["photo"]
 *     }
 *   ]
 * }
 * ```
 * @property {Object<string, string>} [searchUrlHeader] - File server search http header. Optional. Can be overridden in browser.
 * @property {string} [listClass] - Class name of list div. Required. Can be overridden in browser.
 * @property {(item: BrowserFile) => string} [drawItemHandler] - Function that returns HTML string for rendering each file item. Required. Can be overridden in browser.
 * ```js
 * // drawItemHandler
 * (item) => `<div><img src="${item.thumbnail}"><span>${item.name}</span></div>`
 * ```
 * @property {Array<*>} [props] - `props` argument to `drawItemHandler` function. Optional. Can be overridden in browser.
 * @property {number} [columnSize] - Number of `div.se-file-item-column` to be created.
 * - Optional. Can be overridden in browser. Default: 4.
 * @property {number} [expand=1] - Initial folder expand depth. `1` expands the first level, `Infinity` expands all. Default: `1`.
 * @property {((item: BrowserFile) => string)} [thumbnail] - Default thumbnail
 */
/**
 * @class
 * @description File browser plugin
 */
declare class Browser {
	/**
	 * @constructor
	 * @param {*} host The instance object that called the constructor.
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {BrowserParams} params Browser options
	 * @example
	 * // Inside a PluginBrowser constructor:
	 * this.browser = new Browser(this, this.$, {
	 *   title: this.$.lang.imageGallery,
	 *   data: pluginOptions.data,
	 *   url: pluginOptions.url,
	 *   headers: pluginOptions.headers,
	 *   selectorHandler: this.#OnSelect.bind(this),
	 *   columnSize: 4,
	 *   className: 'se-image-gallery',
	 * });
	 */
	constructor(host: any, $: SunEditor.Deps, params: BrowserParams);
	useSearch: boolean;
	kind: any;
	host: any;
	area: HTMLElement;
	header: HTMLElement;
	titleArea: HTMLElement;
	tagArea: HTMLElement;
	body: HTMLElement;
	list: HTMLElement;
	side: HTMLElement;
	wrapper: HTMLElement;
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
	expand: number;
	folderDefaultPath: string;
	closeArrow: any;
	openArrow: any;
	icon_folder: any;
	icon_folder_item: any;
	icon_item: any;
	/** @type {Array<BrowserFile>} */
	items: Array<BrowserFile>;
	/** @type {Object<string, {name: string, meta: Object<string, *>}>} */
	folders: {
		[x: string]: {
			name: string;
			meta: {
				[x: string]: any;
			};
		};
	};
	/** @type {Object<string, {key?: string, name?: string, children?: *}>} */
	tree: {
		[x: string]: {
			key?: string;
			name?: string;
			children?: any;
		};
	};
	/** @type {BrowserFile} */
	data: BrowserFile;
	selectedTags: any[];
	keyword: string;
	sideInner: HTMLElement;
	apiManager: ApiManager;
	sideOpenBtn: HTMLButtonElement;
	/**
	 * @description Open a file browser plugin
	 * @param {Object} [params={}]
	 * @param {string} [params.listClass] - Class name of list div. If not, use `this.listClass`.
	 * @param {string} [params.title] - File browser window title. If not, use `this.title`.
	 * @param {string} [params.url] - File server url. If not, use `this.url`.
	 * @param {Object<string, string>} [params.urlHeader] - File server http header. If not, use `this.urlHeader`.
	 * @example
	 * // Open with default settings (configured at construction):
	 * this.browser.open();
	 *
	 * // Open with runtime overrides:
	 * this.browser.open({
	 *   title: 'Select a video',
	 *   url: '/api/videos',
	 *   urlHeader: { Authorization: 'Bearer token' },
	 * });
	 */
	open(params?: {
		listClass?: string;
		title?: string;
		url?: string;
		urlHeader?: {
			[x: string]: string;
		};
	}): void;
	/**
	 * @description Close a browser plugin
	 * - The plugin's `init` method is called.
	 */
	close(): void;
	/**
	 * @description Search files
	 * @param {string} keyword - Search keyword
	 */
	search(keyword: string): void;
	/**
	 * @description Filter items by tag
	 * @param {Array<BrowserFile>} items - Items to filter
	 * @returns {Array<BrowserFile>}
	 * @example
	 * // Filter items by currently selected tags:
	 * browser.selectedTags = ['photo', 'landscape'];
	 * const filtered = browser.tagfilter(items);
	 * // Returns only items whose `tag` array includes 'photo' or 'landscape'
	 */
	tagfilter(items: Array<BrowserFile>): Array<BrowserFile>;
	/**
	 * @description Show file browser loading box
	 */
	showBrowserLoading(): void;
	/**
	 * @description Close file browser loading box
	 */
	closeBrowserLoading(): void;
	#private;
}
import ApiManager from '../manager/ApiManager';
