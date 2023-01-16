import CoreDependency from '../dependency/_core';
import { domUtils, env } from '../helper';

const FileBrowser = function (inst, params) {
	CoreDependency.call(this, inst.editor);

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
	this.urlHeader = params.header;
	this.drawItemHandler = params.drawItemHandler;
	this.selectorHandler = params.selectorHandler;
	this.columnSize = params.columnSize || 4;

	this.items = [];
	this.selectedTags = [];
	this._closeSignal = false;
	this._xmlHttp = null;
	this._bindClose = null;
	this.__globalEventHandler = function (e) {
		if (!/27/.test(e.keyCode)) return;
		this.close();
	}.bind(this);

	// init
	browserFrame.appendChild(domUtils.createElement('DIV', { class: 'se-file-browser-back' }));
	browserFrame.appendChild(content);
	this.editor._carrierWrapper.appendChild(browserFrame);

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
	open: function (params) {
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
	close: function () {
		this.__removeGlobalEvent();
		if (this._xmlHttp) this._xmlHttp.abort();

		this.area.style.display = 'none';
		this.selectedTags = [];
		this.items = [];
		this.list.innerHTML = this.tagArea.innerHTML = this.titleArea.textContent = '';

		if (typeof this.inst.init === 'function') this.inst.init();
	},

	/**
	 * @description Show file browser loading box
	 */
	showBrowserLoading: function () {
		this._loading.style.display = 'block';
	},

	/**
	 * @description Close file browser loading box
	 */
	closeBrowserLoading: function () {
		this._loading.style.display = 'none';
	},

	_drawFileList: function (url, urlHeader) {
		const xmlHttp = (this._xmlHttp = env.getXMLHttpRequest());

		xmlHttp.onreadystatechange = CallBackGet.bind(this, xmlHttp);
		xmlHttp.open('get', url, true);
		if (urlHeader !== null && typeof urlHeader === 'object' && this._w.Object.keys(urlHeader).length > 0) {
			for (let key in urlHeader) {
				xmlHttp.setRequestHeader(key, urlHeader[key]);
			}
		}
		xmlHttp.send(null);

		this.showBrowserLoading();
	},

	_drawListItem: function (items, update) {
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
					if (tag && _tags.indexOf(tag) === -1) {
						_tags.push(tag);
						tagsHTML += '<a title="' + tag + '" aria-label="' + tag + '">' + tag + '</a>';
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

	__addGlobalEvent: function () {
		this.__removeGlobalEvent();
		this._bindClose = this.eventManager.addGlobalEvent('keydown', this.__globalEventHandler, true);
	},

	__removeGlobalEvent: function () {
		if (this._bindClose) this._bindClose = this.eventManager.removeGlobalEvent(this._bindClose);
	},

	constructor: FileBrowser
};

function CallBackGet(xmlHttp) {
	if (xmlHttp.readyState === 4) {
		this._xmlHttp = null;
		if (xmlHttp.status === 200) {
			try {
				const res = this._w.JSON.parse(xmlHttp.responseText);
				if (res.result.length > 0) {
					this._drawListItem(res.result, true);
				} else if (res.nullMessage) {
					this.list.innerHTML = res.nullMessage;
				}
			} catch (e) {
				throw Error('[SUNEDITOR.fileBrowser.drawList.fail] cause : "' + e.message + '"');
			} finally {
				this.closeBrowserLoading();
				this.body.style.maxHeight = this._w.innerHeight - this.header.offsetHeight - 50 + 'px';
			}
		} else {
			// exception
			this.closeBrowserLoading();
			if (xmlHttp.status !== 0) {
				const res = !xmlHttp.responseText ? xmlHttp : JSON.parse(xmlHttp.responseText);
				const err = '[SUNEDITOR.fileBrowser.get.serverException] status: ' + xmlHttp.status + ', response: ' + (res.errorMessage || xmlHttp.responseText);
				throw Error(err);
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
						return selectedTags.indexOf(tag) > -1;
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

function CreateHTML(editor) {
	const lang = editor.lang;
	return (
		'<div class="se-file-browser-content">' +
		'<div class="se-file-browser-header">' +
		'<button type="button" data-command="close" class="se-btn se-file-browser-close" class="close" title="' +
		lang.modalBox.close +
		'" aria-label="' +
		lang.modalBox.close +
		'">' +
		editor.icons.cancel +
		'</button>' +
		'<span class="se-file-browser-title"></span>' +
		'<div class="se-file-browser-tags"></div>' +
		'</div>' +
		'<div class="se-file-browser-body">' +
		'<div class="se-loading-box sun-editor-common"><div class="se-loading-effect"></div></div>' +
		'<div class="se-file-browser-list"></div>' +
		'</div>' +
		'</div>'
	);
}

export default FileBrowser;
