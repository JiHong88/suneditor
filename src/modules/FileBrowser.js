import CoreInjector from '../editorInjector/_core';
import { domUtils, env } from '../helper';

/**
 * @param {*} inst
 * @param {Object} params
 * @param {string} params.title - File browser window title. Required. Can be overridden in fileBrowser.
 * @param {string} params.url - File server url. Required. Can be overridden in fileBrowser.
 * @param {Object} params.headers - File server http header. Required. Can be overridden in fileBrowser.
 * @param {string} params.listClass - Class name of list div. Required. Can be overridden in fileBrowser.
 * @param {function} params.drawItemHandler - Function that defines the HTML of a file item. Required. Can be overridden in fileBrowser.
 * @param {function} params.selectorHandler - Function that actions when an item is clicked. Required. Can be overridden in fileBrowser.
 * @param {number} params.columnSize - Number of "div.se-file-item-column" to be created. Optional. Can be overridden in fileBrowser. Default: 4.
 */
const FileBrowser = function (inst, params) {
	CoreInjector.call(this, inst.editor);

	// create HTML
	const browserFrame = domUtils.createElement('DIV', { class: 'se-file-browser sun-editor-common' });
	const content = domUtils.createElement('DIV', { class: 'se-file-browser-inner' }, CreateHTML(inst.editor));

	// members
	this.inst = inst;
	this.area = browserFrame;
	this.header = content.querySelector('.se-file-browser-header');
	this.titleArea = content.querySelector('.se-file-browser-title');
	this.tagArea = content.querySelector('.se-file-browser-tags');
	this.body = content.querySelector('.se-file-browser-body');
	this.list = content.querySelector('.se-file-browser-list');
	this._loading = content.querySelector('.se-loading-box');

	this.title = params.title;
	this.listClass = params.listClass;
	this.url = params.url;
	this.urlHeader = params.headers;
	this.drawItemHandler = params.drawItemHandler;
	this.selectorHandler = params.selectorHandler;
	this.columnSize = params.columnSize || 4;

	this.items = [];
	this.selectedTags = [];
	this._xhr = null;
	this._closeSignal = false;
	this._bindClose = null;
	this.__globalEventHandler = (e) => {
		if (!/27/.test(e.keyCode)) return;
		this.close();
	};

	// init
	browserFrame.appendChild(domUtils.createElement('DIV', { class: 'se-file-browser-back' }));
	browserFrame.appendChild(content);
	this.carrierWrapper.appendChild(browserFrame);

	this.eventManager.addEvent(this.tagArea, 'click', OnClickTag.bind(this));
	this.eventManager.addEvent(this.list, 'click', OnClickFile.bind(this));
	this.eventManager.addEvent(content, 'mousedown', OnMouseDown_browser.bind(this));
	this.eventManager.addEvent(content, 'click', OnClick_browser.bind(this));
};

FileBrowser.prototype = {
	/**
	 * @description Open a file browser plugin
	 * @param {Object|null} params {
	 * 	selectorHandler: When the function comes as an argument value, it substitutes "context.selectorHandler".
	 * }
	 */
	open(params) {
		if (!params) params = {};
		this.__addGlobalEvent();

		const listClassName = params.listClass || this.listClass;
		if (!domUtils.hasClass(this.list, listClassName)) {
			this.list.className = 'se-file-browser-list ' + listClassName;
		}
		this.titleArea.textContent = params.title || this.title;
		this.area.style.display = 'block';

		this._drawFileList(params.url || this.url, params.urlHeader || this.urlHeader);
	},

	/**
	 * @description Close a fileBrowser plugin
	 * The plugin's "init" method is called.
	 */
	close() {
		this.__removeGlobalEvent();
		if (this._xhr) this._xhr.abort();

		this.area.style.display = 'none';
		this.selectedTags = [];
		this.items = [];
		this.list.innerHTML = this.tagArea.innerHTML = this.titleArea.textContent = '';

		if (typeof this.inst.init === 'function') this.inst.init();
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

	_drawFileList(url, urlHeader) {
		const xhr = (this._xhr = env.getXMLHttpRequest());

		xhr.onreadystatechange = CallBackGet.bind(this, xhr);
		xhr.open('get', url, true);
		if (urlHeader !== null && typeof urlHeader === 'object' && Object.keys(urlHeader).length > 0) {
			for (let key in urlHeader) {
				xhr.setRequestHeader(key, urlHeader[key]);
			}
		}
		xhr.send(null);

		this.showBrowserLoading();
	},

	_drawListItem(items, update) {
		const _tags = [];
		const len = items.length;
		const columnSize = this.columnSize;
		const splitSize = columnSize <= 1 ? 1 : this._w.Math.round(len / columnSize) || 1;
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

	constructor: FileBrowser
};

function CallBackGet(xmlHttp) {
	if (xmlHttp.readyState === 4) {
		this._xhr = null;
		if (xmlHttp.status === 200) {
			try {
				const res = JSON.parse(xmlHttp.responseText);
				if (res.result.length > 0) {
					this._drawListItem(res.result, true);
				} else if (res.nullMessage) {
					this.list.innerHTML = res.nullMessage;
				}
			} catch (e) {
				throw Error(`[SUNEDITOR.fileBrowser.drawList.fail] cause: "${e.message}"`);
			} finally {
				this.closeBrowserLoading();
				this.body.style.maxHeight = this._w.innerHeight - this.header.offsetHeight - 50 + 'px';
			}
		} else {
			// exception
			this.closeBrowserLoading();
			if (xmlHttp.status !== 0) {
				const res = !xmlHttp.responseText ? xmlHttp : JSON.parse(xmlHttp.responseText);
				throw Error(`[SUNEDITOR.fileBrowser.get.serverException] status: ${xmlHttp.status}, response: ${res.errorMessage || xmlHttp.responseText}`);
			}
		}
	}
}

function OnClickTag(e) {
	const target = e.target;
	if (!domUtils.isAnchor(target)) return;

	const tagName = target.textContent;
	const selectTag = this.tagArea.querySelector('a[title="' + tagName + '"]');
	const selectedTags = this.selectedTags;
	const sTagIndex = selectedTags.indexOf(tagName);

	if (sTagIndex > -1) {
		selectedTags.splice(sTagIndex, 1);
		domUtils.removeClass(selectTag, 'on');
	} else {
		selectedTags.push(tagName);
		domUtils.addClass(selectTag, 'on');
	}

	this._drawListItem(
		selectedTags.length === 0
			? this.items
			: this.items.filter(function (item) {
					return item.tag.some(function (tag) {
						return selectedTags.includes(tag);
					});
			  }),
		false
	);
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

function OnMouseDown_browser(e) {
	if (/se-file-browser-inner/.test(e.target.className)) {
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

function CreateHTML({ lang, icons }) {
	return /*html*/ `
		<div class="se-file-browser-content">
			<div class="se-file-browser-header">
				<button type="button" data-command="close" class="se-btn se-file-browser-close" class="close" title="${lang.close}" aria-label="${lang.close}">
					${icons.cancel}
				</button>
				<span class="se-file-browser-title"></span>
				<div class="se-file-browser-tags"></div>
			</div>
			<div class="se-file-browser-body">
				<div class="se-loading-box sun-editor-common"><div class="se-loading-effect"></div></div>
				<div class="se-file-browser-list"></div>
			</div>
		</div>`;
}

export default FileBrowser;
