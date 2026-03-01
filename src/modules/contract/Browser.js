import { dom, keyCodeMap } from '../../helper';
import { _w } from '../../helper/env';
import ApiManager from '../manager/ApiManager';

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
 * @property {Object<string, string>} [searchUrlHeader] - File server search http header. Optional. Can be overridden in browser.
 * @property {string} [listClass] - Class name of list div. Required. Can be overridden in browser.
 * @property {(item: BrowserFile) => string} [drawItemHandler] - Function that defines the HTML of a file item. Required. Can be overridden in browser.
 * @property {Array<*>} [props] - `props` argument to `drawItemHandler` function. Optional. Can be overridden in browser.
 * @property {number} [columnSize] - Number of `div.se-file-item-column` to be created. Optional. Can be overridden in browser. Default: 4.
 * @property {((item: BrowserFile) => string)} [thumbnail] - Default thumbnail
 */

/**
 * @class
 * @description File browser plugin
 */
class Browser {
	#$;

	#loading;
	#globalEventHandler;

	#closeSignal = false;
	#bindClose = null;

	/**
	 * @constructor
	 * @param {*} host The instance object that called the constructor.
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {BrowserParams} params Browser options
	 */
	constructor(host, $, params) {
		this.#$ = $;

		// create HTML
		this.useSearch = params.useSearch ?? true;
		const browserFrame = dom.utils.createElement('DIV', { class: 'se-browser sun-editor-common' + (params.className ? ` ${params.className}` : '') });
		const contentHTML = CreateHTMLInfos(this.#$, this.useSearch);
		const content = contentHTML.html;

		// members
		this.kind = host.constructor['key'] || host.constructor.name;
		this.host = host;
		this.area = browserFrame;
		this.header = contentHTML.header;
		this.titleArea = contentHTML.titleArea;
		this.tagArea = contentHTML.tagArea;
		this.body = contentHTML.body;
		this.list = contentHTML.list;
		this.side = contentHTML.side;
		this.wrapper = contentHTML.wrapper;
		this.#loading = contentHTML._loading;

		this.title = params.title;
		this.listClass = params.listClass || 'se-preview-list';
		this.directData = params.data;
		this.url = params.url;
		this.urlHeader = params.headers;
		this.searchUrl = params.searchUrl;
		this.searchUrlHeader = params.searchUrlHeader;
		this.drawItemHandler = (params.drawItemHandler || DrawItems).bind({ thumbnail: params.thumbnail, props: params.props || [] });
		this.selectorHandler = params.selectorHandler;
		this.columnSize = params.columnSize || 4;
		this.folderDefaultPath = '';
		this.closeArrow = this.#$.icons.menu_arrow_right;
		this.openArrow = this.#$.icons.menu_arrow_down;
		this.icon_folder = this.#$.icons.side_menu_folder_item;
		this.icon_folder_item = this.#$.icons.side_menu_folder;
		this.icon_item = this.#$.icons.side_menu_item;

		/** @type {Array<BrowserFile>} */
		this.items = [];
		/** @type {Object<string, {name: string, meta: Object<string, *>}>} */
		this.folders = {};
		/** @type {Object<string, {key?: string, name?: string, children?: *}>} */
		this.tree = {};
		/** @type {BrowserFile} */
		this.data = {};
		this.selectedTags = [];
		this.keyword = '';
		this.sideInner = null;

		// api manager
		this.apiManager = new ApiManager(this, $, { method: 'GET' });

		this.#globalEventHandler = (e) => {
			if (!keyCodeMap.isEsc(e.code)) return;
			this.close();
		};

		// init
		browserFrame.appendChild(dom.utils.createElement('DIV', { class: 'se-browser-back' }));
		browserFrame.appendChild(content);
		this.#$.contextProvider.carrierWrapper.appendChild(browserFrame);

		this.#$.eventManager.addEvent(this.tagArea, 'click', this.#OnClickTag.bind(this));
		this.#$.eventManager.addEvent(this.list, 'click', this.#OnClickFile.bind(this));
		this.#$.eventManager.addEvent(this.side, 'click', this.#OnClickSide.bind(this));
		this.#$.eventManager.addEvent(content, 'mousedown', this.#OnMouseDown_browser.bind(this));
		this.#$.eventManager.addEvent(content, 'click', this.#OnClick_browser.bind(this));
		this.#$.eventManager.addEvent(browserFrame.querySelector('form.se-browser-search-form'), 'submit', this.#Search.bind(this));
		this.#$.eventManager.addEvent((this.sideOpenBtn = /** @type {HTMLButtonElement} */ (browserFrame.querySelector('.se-side-open-btn'))), 'click', this.#SideOpen.bind(this));
		this.#$.eventManager.addEvent([this.header, browserFrame.querySelector('.se-browser-main')], 'mousedown', this.#SideClose.bind(this));
	}

	/**
	 * @description Open a file browser plugin
	 * @param {Object} [params={}]
	 * @param {string} [params.listClass] - Class name of list div. If not, use `this.listClass`.
	 * @param {string} [params.title] - File browser window title. If not, use `this.title`.
	 * @param {string} [params.url] - File server url. If not, use `this.url`.
	 * @param {Object<string, string>} [params.urlHeader] - File server http header. If not, use `this.urlHeader`.
	 */
	open(params = {}) {
		this.#addGlobalEvent();

		const listClassName = params.listClass || this.listClass;
		if (!dom.utils.hasClass(this.list, listClassName)) {
			this.list.className = 'se-browser-list ' + listClassName;
		}

		this.titleArea.textContent = params.title || this.title;
		this.area.style.display = 'block';
		this.#$.ui.opendBrowser = this;
		this.closeArrow = this.#$.options.get('_rtl') ? this.#$.icons.menu_arrow_left : this.#$.icons.menu_arrow_right;

		if (this.directData) {
			this.#drowItems(this.directData);
		} else {
			this.#drawFileList(params.url || this.url, params.urlHeader || this.urlHeader, false);
		}

		this.body.style.maxHeight = dom.utils.getClientSize().h - (this.#$.offset.getGlobal(this.body).top - _w.scrollY) - 20 + 'px';
	}

	/**
	 * @description Close a browser plugin
	 * - The plugin's `init` method is called.
	 */
	close() {
		this.#removeGlobalEvent();
		this.apiManager.cancel();

		this.area.style.display = 'none';
		this.selectedTags = [];
		this.items = [];
		this.folders = {};
		this.tree = {};
		this.data = {};
		this.keyword = '';
		this.list.innerHTML = this.tagArea.innerHTML = this.titleArea.textContent = '';
		this.#$.ui.opendBrowser = null;
		this.sideInner = null;

		this.host.browserInit?.();
	}

	/**
	 * @description Search files
	 * @param {string} keyword - Search keyword
	 */
	search(keyword) {
		if (this.searchUrl) {
			this.keyword = keyword;
			this.#drawFileList(this.searchUrl + '?keyword=' + keyword, this.searchUrlHeader, false);
		} else {
			this.keyword = keyword.toLowerCase();
			this.#drawListItem(this.items, false);
		}
	}

	/**
	 * @description Filter items by tag
	 * @param {Array<BrowserFile>} items - Items to filter
	 * @returns {Array<BrowserFile>}
	 */
	tagfilter(items) {
		const selectedTags = this.selectedTags;
		return selectedTags.length === 0 ? items : items.filter((item) => !Array.isArray(item.tag) || item.tag.some((tag) => selectedTags.includes(tag)));
	}

	/**
	 * @description Show file browser loading box
	 */
	showBrowserLoading() {
		this.#loading.style.display = 'block';
	}

	/**
	 * @description Close file browser loading box
	 */
	closeBrowserLoading() {
		this.#loading.style.display = 'none';
	}

	/**
	 * @description Fetches the file list from the server.
	 * @param {string} url - The file server URL.
	 * @param {Object<string, string>} urlHeader - The HTTP headers for the request.
	 * @param {boolean} pageLoading - Indicates if this is a paginated request.
	 */
	#drawFileList(url, urlHeader, pageLoading) {
		this.apiManager.call({ method: 'GET', url, headers: urlHeader, callBack: this.#CallBackGet.bind(this), errorCallBack: this.#CallBackError.bind(this) });
		if (!pageLoading) {
			this.sideOpenBtn.style.display = 'none';
			this.showBrowserLoading();
		}
	}

	/**
	 * @description Updates the displayed list of file items.
	 * @param {Array<BrowserFile>} items - The file items to display.
	 * @param {boolean} update - Whether to update the tags.
	 */
	#drawListItem(items, update) {
		const keyword = this.keyword;
		items = this.tagfilter(items).filter((item) => item.name.toLowerCase().indexOf(keyword) > -1);

		const _tags = [];
		const len = items.length;
		const columnSize = this.columnSize;
		const splitSize = columnSize <= 1 ? 1 : Math.round(len / columnSize) || 1;
		const drawItemHandler = this.drawItemHandler;

		let tagsHTML = '';
		let listHTML = '<div class="se-file-item-column">';
		let columns = 1;
		for (let i = 0, item, tags; i < len; i++) {
			item = items[i];
			tags = !item.tag ? [] : typeof item.tag === 'string' ? item.tag.split(',') : item.tag;
			tags = item.tag = tags.map((v) => v.trim());
			listHTML += drawItemHandler(item);

			if ((i + 1) % splitSize === 0 && columns < columnSize && i + 1 < len) {
				columns++;
				listHTML += '</div><div class="se-file-item-column">';
			}

			if (update && tags.length > 0) {
				for (let t = 0, tLen = tags.length, tag; t < tLen; t++) {
					tag = tags[t];
					if (tag && !_tags.includes(tag)) {
						_tags.push(tag);
						tagsHTML += `<a title="${tag}" aria-label="${tag}">${tag}</a>`;
					}
				}
			}
		}
		listHTML += '</div>';

		this.list.innerHTML = listHTML;

		if (update) {
			this.items = items;
			this.tagArea.innerHTML = tagsHTML;
		}
	}

	/**
	 * @description Adds a global event listener for closing the browser.
	 */
	#addGlobalEvent() {
		this.#removeGlobalEvent();
		this.#bindClose = this.#$.eventManager.addGlobalEvent('keydown', this.#globalEventHandler, true);
	}

	/**
	 * @description Removes the global event listener for closing the browser.
	 */
	#removeGlobalEvent() {
		this.#bindClose &&= this.#$.eventManager.removeGlobalEvent(this.#bindClose);
	}

	/**
	 * @description Renders the file items or folder structure from data.
	 * @param {BrowserFile[]|BrowserFile} data - The data representing the file structure.
	 * @returns {boolean} `true` if rendering was successful, `false` otherwise.
	 */
	#drowItems(data) {
		if (Array.isArray(data)) {
			if (data.length > 0) {
				this.#drawListItem(data, true);
			}
			return true;
		} else if (typeof data === 'object') {
			this.sideOpenBtn.style.display = '';
			this.#parseFolderData(data);

			this.side.innerHTML = '';
			const sideInner = (this.sideInner = dom.utils.createElement('div', null));
			this.#createFolderList(this.tree, sideInner);
			this.side.appendChild(sideInner);

			if (this.folderDefaultPath) {
				const openFolder = /** @type {HTMLButtonElement} */ (sideInner.querySelector(`[data-command="${this.folderDefaultPath}"]`));
				openFolder.click();
				if (this.folderDefaultPath.includes('/')) {
					dom.utils.removeClass(openFolder.parentElement, 'se-menu-hidden');
					openFolder.parentElement.previousElementSibling.querySelector('button').innerHTML = this.openArrow;
				}
			}

			return true;
		}
		return false;
	}

	/**
	 * @description Parses folder data into a structured format.
	 * @param {BrowserFile} data - The folder data.
	 * @param {string} [path] - The current path in the folder hierarchy.
	 */
	#parseFolderData(data, path) {
		let current = this.tree;

		// _data
		if (data._data) {
			this.data[path] = data._data;
			if (!this.folderDefaultPath || data.default) {
				this.folderDefaultPath = path;
			}

			const parts = path.split('/');
			const len = parts.length - 1;
			parts.forEach((part, index) => {
				current[part] ||= { children: {} };

				if (index === len) {
					current[part].key = path;
					current[part].name = this.folders[path].name;
				} else {
					current = current[part].children;
				}
			});
		} else if (path) {
			current[path] = { name: this.folders[path].name, children: {} };
		}

		// create folders, file path
		Object.entries(data).forEach(([key, value]) => {
			if (key === '_data' || !value || typeof value !== 'object') return;

			const v = /** @type {BrowserFile} */ (value);
			const currentPath = path ? `${path}/${key}` : key;

			this.folders[currentPath] = {
				name: v.name || key,
				meta: v.meta || {},
			};

			this.#parseFolderData(v, currentPath);
		});
	}

	/**
	 * @description Creates a nested folder list from parsed data.
	 * @param {BrowserFile[]|BrowserFile} folderData - The structured folder data.
	 * @param {HTMLElement} parentElement - The parent element to append folder structure to.
	 */
	#createFolderList(folderData, parentElement) {
		for (const key in folderData) {
			const item = folderData[key];
			if (!item) continue;

			if (Object.keys(item.children).length > 0) {
				const folderLabel = dom.utils.createElement(
					'div',
					item.key ? { 'data-command': item.key, 'aria-label': item.name } : null,
					`<span class="se-menu-icon">${item.key ? this.icon_folder : this.icon_folder_item}</span><span>${item.name}</span>`,
				);
				const folderDiv = dom.utils.createElement('div', { class: 'se-menu-folder' }, folderLabel);

				folderLabel.insertBefore(dom.utils.createElement('button', null, this.closeArrow), folderLabel.firstElementChild);
				const childContainer = document.createElement('div');
				dom.utils.addClass(childContainer, 'se-menu-child|se-menu-hidden');
				this.#createFolderList(item.children, childContainer);
				folderDiv.appendChild(childContainer);

				parentElement.appendChild(folderDiv);
			} else {
				const folderLabel = dom.utils.createElement('div', { 'data-command': item.key, 'aria-label': item.name, class: 'se-menu-folder-item' }, `<span class="se-menu-icon">${this.icon_item}</span><span>${item.name}</span>`);
				if (parentElement === this.sideInner) {
					const folderDiv = dom.utils.createElement('div', { class: 'se-menu-folder' }, folderLabel);
					parentElement.appendChild(folderDiv);
				} else {
					parentElement.appendChild(folderLabel);
				}
			}
		}
	}

	/**
	 * @param {XMLHttpRequest} xmlHttp - XMLHttpRequest object.
	 */
	#CallBackGet(xmlHttp) {
		try {
			const res = JSON.parse(xmlHttp.responseText);
			const data = res.result;
			if (this.#drowItems(data)) return;

			if (res.nullMessage) {
				this.list.innerHTML = res.nullMessage;
			}
		} catch (e) {
			throw Error(`[SUNEDITOR.browser.drawList.fail] cause: "${e.message}"`);
		} finally {
			this.closeBrowserLoading();
		}
	}

	/**
	 * @param {*} res - response data.
	 * @param {XMLHttpRequest} xmlHttp - XMLHttpRequest object.
	 */
	#CallBackError(res, xmlHttp) {
		this.closeBrowserLoading();
		throw Error(`[SUNEDITOR.browser.get.serverException] status: ${xmlHttp.status}, response: ${res.errorMessage || xmlHttp.responseText}`);
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnClickTag(e) {
		const eventTarget = dom.query.getEventTarget(e);
		if (!dom.check.isAnchor(eventTarget)) return;

		const tagName = eventTarget.textContent;
		const selectTag = this.tagArea.querySelector('a[title="' + tagName + '"]');
		const sTagIndex = this.selectedTags.indexOf(tagName);

		if (sTagIndex > -1) {
			this.selectedTags.splice(sTagIndex, 1);
			dom.utils.removeClass(selectTag, 'on');
		} else {
			this.selectedTags.push(tagName);
			dom.utils.addClass(selectTag, 'on');
		}

		this.#drawListItem(this.items, false);
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnClickFile(e) {
		const eventTarget = dom.query.getEventTarget(e);

		e.preventDefault();
		e.stopPropagation();

		if (eventTarget === this.list) return;

		const target = dom.query.getCommandTarget(eventTarget);
		if (!target) return;

		this.close();
		this.selectorHandler(target);
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnClickSide(e) {
		const eventTarget = dom.query.getEventTarget(e);
		e.stopPropagation();

		if (/^button$/i.test(eventTarget.nodeName)) {
			const childContainer = eventTarget.parentElement.parentElement.querySelector('.se-menu-child');
			if (dom.utils.hasClass(childContainer, 'se-menu-hidden')) {
				dom.utils.removeClass(childContainer, 'se-menu-hidden');
				eventTarget.innerHTML = this.openArrow;
			} else {
				dom.utils.addClass(childContainer, 'se-menu-hidden');
				eventTarget.innerHTML = this.closeArrow;
			}
			return;
		}

		const cmdTarget = dom.query.getCommandTarget(eventTarget);
		if (!cmdTarget || dom.utils.hasClass(cmdTarget, 'active')) return;

		const data = this.data[cmdTarget.getAttribute('data-command')];

		dom.utils.removeClass(this.side.querySelectorAll('.active'), 'active');
		dom.utils.addClass([cmdTarget, dom.query.getParentElement(cmdTarget, '.se-menu-folder')], 'active');
		this.tagArea.innerHTML = '';

		if (typeof data === 'string') {
			this.#drawFileList(data, this.urlHeader, true);
		} else {
			this.#drawListItem(data, false);
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnMouseDown_browser(e) {
		const eventTarget = dom.query.getEventTarget(e);
		if (/se-browser-inner/.test(eventTarget.className)) {
			this.#closeSignal = true;
		} else {
			this.#closeSignal = false;
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnClick_browser(e) {
		const eventTarget = dom.query.getEventTarget(e);
		e.stopPropagation();

		if (/close/.test(eventTarget.getAttribute('data-command')) || this.#closeSignal) {
			this.close();
		}
	}

	/**
	 * @param {SubmitEvent} e - Event object
	 */
	#Search(e) {
		const eventTarget = /** @type {HTMLElement} */ (e.currentTarget);
		e.preventDefault();
		this.search(/** @type {HTMLInputElement} */ (eventTarget.querySelector('input[type="text"]')).value);
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#SideOpen(e) {
		const eventTarget = dom.query.getEventTarget(e);
		if (dom.utils.hasClass(eventTarget, 'active')) {
			dom.utils.removeClass(this.side, 'se-side-show');
			dom.utils.removeClass(eventTarget, 'active');
		} else {
			dom.utils.addClass(this.side, 'se-side-show');
			dom.utils.addClass(eventTarget, 'active');
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#SideClose({ target }) {
		if (target === this.sideOpenBtn) return;
		if (dom.utils.hasClass(this.sideOpenBtn, 'active')) {
			dom.utils.removeClass(this.side, 'se-side-show');
			dom.utils.removeClass(this.sideOpenBtn, 'active');
		}
	}
}

/**
 * @param {SunEditor.Deps} $ - editor instance
 * @param {boolean} useSearch - Whether to use the search function
 * @returns {{ html: HTMLElement, header: HTMLElement, titleArea: HTMLElement, tagArea: HTMLElement, body: HTMLElement, list: HTMLElement, side: HTMLElement, wrapper: HTMLElement, _loading: HTMLElement }} HTML
 */
function CreateHTMLInfos($, useSearch) {
	const lang = $.lang;
	const icons = $.icons;
	const htmlString = /*html*/ `
		<div class="se-browser-content">
			<div class="se-browser-header">
				<button type="button" data-command="close" class="se-btn se-browser-close" class="close" title="${lang.close}" aria-label="${lang.close}">
					${icons.cancel}
				</button>
				<span class="se-browser-title"></span>
			</div>
			<div class="se-browser-wrapper">
				<div class="se-browser-side"></div>
				<div class="se-browser-main"> 
					<div class="se-browser-bar">
						<div class="se-browser-search">
							<button class="se-btn se-side-open-btn">${icons.side_menu_hamburger}</button>
							${
								useSearch
									? /*html*/ `
										<form class="se-browser-search-form">
											<input type="text" class="se-input-form" placeholder="${lang.search}" aria-label="${lang.search}">
											<button type="submit" class="se-btn" title="${lang.search}" aria-label="${lang.search}">${icons.search}</button>
										</form>`
									: ''
							}
						</div>
					</div>
					<div class="se-browser-body">
						<div class="se-browser-tags"></div>
						<div class="se-loading-box sun-editor-common"><div class="se-loading-effect"></div></div>
						<div class="se-browser-menus"></div>
						<div class="se-browser-list"></div>
					</div>
				</div>
			</div>
		</div>`;

	const content = dom.utils.createElement('DIV', { class: 'se-browser-inner' }, htmlString);

	return {
		html: content,
		header: content.querySelector('.se-browser-header'),
		titleArea: content.querySelector('.se-browser-title'),
		tagArea: content.querySelector('.se-browser-tags'),
		body: content.querySelector('.se-browser-body'),
		list: content.querySelector('.se-browser-list'),
		side: content.querySelector('.se-browser-side'),
		wrapper: content.querySelector('.se-browser-wrapper'),
		_loading: content.querySelector('.se-loading-box'),
	};
}

/**
 * @this {{ thumbnail: ((...args: *) => *), props: Array<*> }}
 * @description Define the HTML of the item to be put in `div.se-file-item-column`.
 * - Format: `[ { src: "image src", name: "name(@option)", alt: "image alt(@option)", tag: "tag name(@option)" } ]`
 * @param {BrowserFile} item Item of the response data's array
 */
function DrawItems(item) {
	const srcName = item.src.split('/').pop();
	const thumbnail = item.thumbnail || '';
	const src = thumbnail || item.src;
	const customProps = this.props?.map((v) => `data-${v}="${item[v]}"`).join(' ') || '';
	const attrs = `data-type="${item.type}" data-command="${item.src}" data-name="${item.name || srcName}" data-thumbnail="${thumbnail}" data-extension="${item.src.split('.').pop()}" ${customProps}`;
	const props = `class="${thumbnail || 'se-browser-empty-image'}" src="${src}" alt="${item.alt || srcName}" ${attrs}`;
	return /*html*/ `
		<div class="se-file-item-img">
			${this.thumbnail && !thumbnail && item.type !== 'image' ? `<div class="se-browser-empty-thumbnail" ${props}>${this.thumbnail(item)}</div>` : `<img class="${thumbnail || 'se-browser-empty-image'}" ${props}>`}
			<div class="se-file-name-image se-file-name-back"></div>
			<div class="se-file-name-image">${item.name || srcName}</div>
		</div>`;
}

export default Browser;
