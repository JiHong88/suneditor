import CoreInjector from '../editorInjector/_core';
import { domUtils } from '../helper';
import ApiManager from './ApiManager';

/**
 * @param {*} inst
 * @param {object} params
 * @param {string} params.title - File browser window title. Required. Can be overridden in browser.
 * @param {string} params.url - File server url. Required. Can be overridden in browser.
 * @param {object} params.headers - File server http header. Required. Can be overridden in browser.
 * @param {function} params.selectorHandler - Function that actions when an item is clicked. Required. Can be overridden in browser.
 * @param {boolean=} params.useSearch - Whether to use the search function. Optional. Default: true.
 * @param {string=} params.searchUrl - File server search url. Optional. Can be overridden in browser.
 * @param {object=} params.searchUrlHeader - File server search http header. Optional. Can be overridden in browser.
 * @param {string=} params.listClass - Class name of list div. Required. Can be overridden in browser.
 * @param {function=} params.drawItemHandler - Function that defines the HTML of a file item. Required. Can be overridden in browser.
 * @param {number=} params.columnSize - Number of "div.se-file-item-column" to be created. Optional. Can be overridden in browser. Default: 4.
 */
const Browser = function (inst, params) {
	CoreInjector.call(this, inst.editor);

	// create HTML
	this.useSearch = params.useSearch ?? true;
	const browserFrame = domUtils.createElement('DIV', { class: 'se-browser sun-editor-common' + (params.className ? ` ${params.className}` : '') });
	const content = domUtils.createElement('DIV', { class: 'se-browser-inner' }, CreateHTML(inst.editor, this.useSearch));

	// members
	this.kind = inst.constructor.key || inst.constructor.name;
	this.inst = inst;
	this.area = browserFrame;
	this.header = content.querySelector('.se-browser-header');
	this.titleArea = content.querySelector('.se-browser-title');
	this.tagArea = content.querySelector('.se-browser-tags');
	this.body = content.querySelector('.se-browser-body');
	this.list = content.querySelector('.se-browser-list');
	this.side = content.querySelector('.se-browser-side');
	this.wrapper = content.querySelector('.se-browser-wrapper');
	this._loading = content.querySelector('.se-loading-box');

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
	this.closeArrow = this.icons.menu_arrow_right;
	this.openArrow = this.icons.menu_arrow_down;
	this.icon_folder = this.icons.side_menu_folder_item;
	this.icon_folder_item = this.icons.side_menu_folder;
	this.icon_item = this.icons.side_menu_item;

	this.items = [];
	this.folders = {};
	this.tree = {};
	this.data = {};
	this.selectedTags = [];
	this.keyword = '';
	this.sideInner = null;
	this._closeSignal = false;
	this._bindClose = null;
	this.__globalEventHandler = (e) => {
		if (!/27/.test(e.keyCode)) return;
		this.close();
	};
	// api manager
	this.apiManager = new ApiManager(this, { method: 'GET' });

	// init
	browserFrame.appendChild(domUtils.createElement('DIV', { class: 'se-browser-back' }));
	browserFrame.appendChild(content);
	this.carrierWrapper.appendChild(browserFrame);

	this.eventManager.addEvent(this.tagArea, 'click', OnClickTag.bind(this));
	this.eventManager.addEvent(this.list, 'click', OnClickFile.bind(this));
	this.eventManager.addEvent(this.side, 'click', OnClickSide.bind(this));
	this.eventManager.addEvent(content, 'mousedown', OnMouseDown_browser.bind(this));
	this.eventManager.addEvent(content, 'click', OnClick_browser.bind(this));
	this.eventManager.addEvent(browserFrame.querySelector('form.se-browser-search-form'), 'submit', Search.bind(this));
	this.eventManager.addEvent((this.sideOpenBtn = browserFrame.querySelector('.se-side-open-btn')), 'click', SideOpen.bind(this));
	this.eventManager.addEvent([this.header, browserFrame.querySelector('.se-browser-main')], 'mousedown', SideClose.bind(this));
};

Browser.prototype = {
	/**
	 * @description Open a file browser plugin
	 * @param {object=} params
	 * @param {string=} params.listClass - Class name of list div. If not, use "this.listClass".
	 * @param {string=} params.title - File browser window title. If not, use "this.title".
	 * @param {string=} params.url - File server url. If not, use "this.url".
	 * @param {object} params.urlHeader - File server http header. If not, use "this.urlHeader".
	 */
	open(params) {
		if (!params) params = {};
		this.__addGlobalEvent();

		const listClassName = params.listClass || this.listClass;
		if (!domUtils.hasClass(this.list, listClassName)) {
			this.list.className = 'se-browser-list ' + listClassName;
		}

		this.titleArea.textContent = params.title || this.title;
		this.area.style.display = 'block';
		this.editor.opendBrowser = this;
		this.closeArrow = this.options.get('_rtl') ? this.icons.menu_arrow_left : this.icons.menu_arrow_right;

		if (this.directData) {
			this.__drowItems(this.directData);
		} else {
			this._drawFileList(params.url || this.url, params.urlHeader || this.urlHeader, false);
		}
	},

	/**
	 * @description Close a browser plugin
	 * The plugin's "init" method is called.
	 */
	close() {
		this.__removeGlobalEvent();
		this.apiManager.cancel();

		this.area.style.display = 'none';
		this.selectedTags = [];
		this.items = [];
		this.folders = {};
		this.tree = {};
		this.data = {};
		this.keyword = '';
		this.list.innerHTML = this.tagArea.innerHTML = this.titleArea.textContent = '';
		this.editor.opendBrowser = null;
		this.sideInner = null;

		if (typeof this.inst.init === 'function') this.inst.init();
	},

	/**
	 * @description Search files
	 * @param {string} keyword - Search keyword
	 */
	search(keyword) {
		if (this.searchUrl) {
			this.keyword = keyword;
			this._drawFileList(this.searchUrl + '?keyword=' + keyword, this.searchUrlHeader, false);
		} else {
			this.keyword = keyword.toLowerCase();
			this._drawListItem(this.items, false);
		}
	},

	/**
	 * @description Filter items by tag
	 * @param {Array.<string>} items - Items to filter
	 * @returns {Array.<string>}
	 */
	tagfilter(items) {
		const selectedTags = this.selectedTags;
		return selectedTags.length === 0 ? items : items.filter((item) => !item.tag.some || item.tag.some((tag) => selectedTags.includes(tag)));
	},

	/**
	 * @description Show file browser loading box
	 */
	showBrowserLoading() {
		this._loading.style.display = 'block';
	},

	/**
	 * @description Close file browser loading box
	 */
	closeBrowserLoading() {
		this._loading.style.display = 'none';
	},

	_drawFileList(url, urlHeader, pageLoading) {
		this.apiManager.call({ method: 'GET', url, headers: urlHeader, callBack: CallBackGet.bind(this), errorCallBack: CallBackError.bind(this) });
		if (!pageLoading) {
			this.sideOpenBtn.style.display = 'none';
			this.showBrowserLoading();
		}
	},

	_drawListItem(items, update) {
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
			tags = item.tag = tags.map(function (v) {
				return v.trim();
			});
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
	},

	__addGlobalEvent() {
		this.__removeGlobalEvent();
		this._bindClose = this.eventManager.addGlobalEvent('keydown', this.__globalEventHandler, true);
	},

	__removeGlobalEvent() {
		if (this._bindClose) this._bindClose = this.eventManager.removeGlobalEvent(this._bindClose);
	},

	__drowItems(data) {
		if (Array.isArray(data)) {
			if (data.length > 0) {
				this._drawListItem(data, true);
			}
			return true;
		} else if (typeof data === 'object') {
			this.sideOpenBtn.style.display = '';
			this.__parseFolderData(data);

			this.side.innerHTML = '';
			const sideInner = (this.sideInner = domUtils.createElement('div', null));
			this.__createFolderList(this.tree, sideInner);
			this.side.appendChild(sideInner);

			if (this.folderDefaultPath) {
				const openFolder = sideInner.querySelector(`[data-command="${this.folderDefaultPath}"]`);
				openFolder.click();
				if (this.folderDefaultPath.includes('/')) {
					domUtils.removeClass(openFolder.parentElement, 'se-menu-hidden');
					openFolder.parentElement.previousElementSibling.querySelector('button').innerHTML = this.openArrow;
				}
			}

			return true;
		}
		return false;
	},

	__parseFolderData(data, path) {
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
				if (!current[part]) {
					current[part] = { children: {} };
				}

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

			const currentPath = path ? `${path}/${key}` : key;

			this.folders[currentPath] = {
				name: value.name || key,
				meta: value.meta || {}
			};

			this.__parseFolderData(value, currentPath);
		});
	},

	__createFolderList(folderData, parentElement) {
		for (const key in folderData) {
			const item = folderData[key];
			if (!item) continue;

			if (Object.keys(item.children).length > 0) {
				const folderLabel = domUtils.createElement(
					'div',
					item.key ? { 'data-command': item.key, 'aria-label': item.name } : null,
					`<span class="se-menu-icon">${item.key ? this.icon_folder : this.icon_folder_item}</span><span>${item.name}</span>`
				);
				const folderDiv = domUtils.createElement('div', { class: 'se-menu-folder' }, folderLabel);

				folderLabel.insertBefore(domUtils.createElement('button', null, this.closeArrow), folderLabel.firstElementChild);
				const childContainer = document.createElement('div');
				domUtils.addClass(childContainer, 'se-menu-child|se-menu-hidden');
				this.__createFolderList(item.children, childContainer);
				folderDiv.appendChild(childContainer);

				parentElement.appendChild(folderDiv);
			} else {
				const folderLabel = domUtils.createElement('div', { 'data-command': item.key, 'aria-label': item.name, class: 'se-menu-folder-item' }, `<span class="se-menu-icon">${this.icon_item}</span><span>${item.name}</span>`);
				if (parentElement === this.sideInner) {
					const folderDiv = domUtils.createElement('div', { class: 'se-menu-folder' }, folderLabel);
					parentElement.appendChild(folderDiv);
				} else {
					parentElement.appendChild(folderLabel);
				}
			}
		}
	},

	constructor: Browser
};

function CallBackGet(xmlHttp) {
	try {
		const res = JSON.parse(xmlHttp.responseText);
		const data = res.result;
		if (this.__drowItems(data)) return;

		if (res.nullMessage) {
			this.list.innerHTML = res.nullMessage;
		}
	} catch (e) {
		throw Error(`[SUNEDITOR.browser.drawList.fail] cause: "${e.message}"`);
	} finally {
		this.closeBrowserLoading();
		this.body.style.maxHeight = domUtils.getClientSize().h - this.header.offsetHeight - 50 + 'px';
	}
}

function CallBackError(res, xmlHttp) {
	this.closeBrowserLoading();
	throw Error(`[SUNEDITOR.browser.get.serverException] status: ${xmlHttp.status}, response: ${res.errorMessage || xmlHttp.responseText}`);
}

function OnClickTag(e) {
	const target = e.target;
	if (!domUtils.isAnchor(target)) return;

	const tagName = target.textContent;
	const selectTag = this.tagArea.querySelector('a[title="' + tagName + '"]');
	const sTagIndex = this.selectedTags.indexOf(tagName);

	if (sTagIndex > -1) {
		this.selectedTags.splice(sTagIndex, 1);
		domUtils.removeClass(selectTag, 'on');
	} else {
		this.selectedTags.push(tagName);
		domUtils.addClass(selectTag, 'on');
	}

	this._drawListItem(this.items, false);
}

function OnClickFile(e) {
	e.preventDefault();
	e.stopPropagation();

	if (e.target === this.list) return;

	const target = domUtils.getCommandTarget(e.target);
	if (!target) return;

	this.close();
	this.selectorHandler(target);
}

function OnClickSide(e) {
	const { target } = e;
	e.stopPropagation();

	if (/^button$/i.test(target.nodeName)) {
		const childContainer = target.parentElement.parentElement.querySelector('.se-menu-child');
		if (domUtils.hasClass(childContainer, 'se-menu-hidden')) {
			domUtils.removeClass(childContainer, 'se-menu-hidden');
			target.innerHTML = this.openArrow;
		} else {
			domUtils.addClass(childContainer, 'se-menu-hidden');
			target.innerHTML = this.closeArrow;
		}
		return;
	}

	const cmdTarget = domUtils.getCommandTarget(target);
	if (!cmdTarget || domUtils.hasClass(cmdTarget, 'active')) return;

	const data = this.data[cmdTarget.getAttribute('data-command')];

	domUtils.removeClass(this.side.querySelectorAll('.active'), 'active');
	domUtils.addClass([cmdTarget, domUtils.getParentElement(cmdTarget, '.se-menu-folder')], 'active');
	this.tagArea.innerHTML = '';

	if (typeof data === 'string') {
		this._drawFileList(data, this.urlHeader, true);
	} else {
		this._drawListItem(data, false);
	}
}

function OnMouseDown_browser(e) {
	if (/se-browser-inner/.test(e.target.className)) {
		this._closeSignal = true;
	} else {
		this._closeSignal = false;
	}
}

function OnClick_browser(e) {
	e.stopPropagation();

	if (/close/.test(e.target.getAttribute('data-command')) || this._closeSignal) {
		this.close();
	}
}

function Search(e) {
	e.preventDefault();
	this.search(e.currentTarget.querySelector('input[type="text"]').value);
}

function SideOpen({ target }) {
	if (domUtils.hasClass(target, 'active')) {
		domUtils.removeClass(this.side, 'se-side-show');
		domUtils.removeClass(target, 'active');
	} else {
		domUtils.addClass(this.side, 'se-side-show');
		domUtils.addClass(target, 'active');
	}
}

function SideClose({ target }) {
	if (target === this.sideOpenBtn) return;
	if (domUtils.hasClass(this.sideOpenBtn, 'active')) {
		domUtils.removeClass(this.side, 'se-side-show');
		domUtils.removeClass(this.sideOpenBtn, 'active');
	}
}

function CreateHTML({ lang, icons }, useSearch) {
	return /*html*/ `
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
}

/**
 * @Required @override browser
 * @description Define the HTML of the item to be put in "div.se-file-item-column".
 * Format: [
 *      { src: "image src", name: "name(@option)", alt: "image alt(@option)", tag: "tag name(@option)" }
 * ]
 * @param {object} item Item of the response data's array
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
