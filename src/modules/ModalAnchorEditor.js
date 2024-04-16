import EditorInjector from '../editorInjector';
import SelectMenu from './SelectMenu';
import FileManager from './FileManager';
import { domUtils, numbers, env, unicode } from '../helper';
const { NO_EVENT, _w } = env;

/**
 * @param {*} inst
 * @param {Element} modalForm
 * @param {object} params
 * @param {boolean} params.textToDisplay - Create Text to display input.
 * @param {string} params.title - Modal title
 * @param {boolean} params.openNewWindow - Default checked value of the "Open in new window" checkbox.
 * @param {boolean} params.relList - The "rel" attribute list of anchor tag.
 * @param {object} params.defaultRel - Default "rel" attributes of anchor tag.
 * @param {boolean} params.noAutoPrefix - If true, disables the automatic prefixing of the host URL to the value of the link.
	Example:
	{
		default: 'nofollow', // Default rel
		check_new_window: 'noreferrer noopener', // When "open new window" is checked
		check_bookmark: 'bookmark' // When "bookmark" is checked
	}
 * @param {boolean} params.noAutoPrefix - If true, disables the automatic prefixing of the host URL to the value of the link.
 */
const ModalAnchorEditor = function (inst, modalForm, params) {
	// plugin bisic properties
	EditorInjector.call(this, inst.editor);

	// params
	this.openNewWindow = !!params.openNewWindow;
	this.relList = Array.isArray(params.relList) ? params.relList : [];
	this.defaultRel = params.defaultRel || {};
	this.noAutoPrefix = !!params.noAutoPrefix;
	// file upload
	if (params.enableFileUpload) {
		this.uploadUrl = typeof params.uploadUrl === 'string' ? params.uploadUrl : null;
		this.uploadHeaders = params.uploadHeaders || null;
		this.uploadSizeLimit = /\d+/.test(params.uploadSizeLimit) ? numbers.get(params.uploadSizeLimit, 0) : null;
		this.input = domUtils.createElement('input', { type: 'file', accept: params.acceptedFormats || '*' });
		this.eventManager.addEvent(this.input, 'change', OnChangeFile.bind(this));
		// file manager
		this.fileManager = new FileManager(this, {
			tagNames: ['a'],
			tagAttrs: ['download', ':not(data-se-file-download)'],
			loadHandler: this.events.onFileLoad,
			eventHandler: this.events.onFileAction
		});
	}

	// create HTML
	const forms = CreatetModalForm(inst.editor, params, this.relList);

	// members
	this.kink = inst.constructor.key;
	this.inst = inst;
	this.modalForm = modalForm;
	this.host = (this._w.location.origin + this._w.location.pathname).replace(/\/$/, '');
	this.urlInput = forms.querySelector('.se-input-url');
	this.displayInput = forms.querySelector('._se_display_text');
	this.titleInput = forms.querySelector('._se_title');
	this.newWindowCheck = forms.querySelector('._se_anchor_check');
	this.downloadCheck = forms.querySelector('._se_anchor_download');
	this.download = forms.querySelector('._se_anchor_download_icon');
	this.preview = forms.querySelector('.se-link-preview');
	this.bookmark = forms.querySelector('._se_anchor_bookmark_icon');
	this.bookmarkButton = forms.querySelector('._se_bookmark_button');
	this.currentRel = [];
	this.currentTarget = null;
	this.linkValue = '';
	this._change = false;
	this._isRel = this.relList.length > 0;
	// members - rel
	if (this._isRel) {
		this.relButton = forms.querySelector('.se-anchor-rel-btn');
		this.relPreview = forms.querySelector('.se-anchor-rel-preview');
		const relList = this.relList;
		const defaultRel = (this.defaultRel.default || '').split(' ');
		const list = [];
		for (let i = 0, len = relList.length, rel; i < len; i++) {
			rel = relList[i];
			list.push(
				domUtils.createElement(
					'BUTTON',
					{
						type: 'button',
						class: 'se-btn se-btn-list' + (defaultRel.includes(rel) ? ' se-checked' : ''),
						'data-command': rel,
						title: rel,
						'aria-label': rel
					},
					rel + '<span class="se-svg">' + this.icons.checked + '</span>'
				)
			);
		}
		this.selectMenu_rel = new SelectMenu(this, { checkList: true, position: 'right-middle', dir: 'ltr' });
		this.selectMenu_rel.on(this.relButton, SetRelItem.bind(this));
		this.selectMenu_rel.create(list);
		this.eventManager.addEvent(this.relButton, 'click', OnClick_relbutton.bind(this));
	}

	// init
	modalForm.querySelector('.se-anchor-editor').appendChild(forms);
	this.selectMenu_bookmark = new SelectMenu(this, { checkList: false, position: 'bottom-left', dir: 'ltr' });
	this.selectMenu_bookmark.on(this.urlInput, SetHeaderBookmark.bind(this));
	this.eventManager.addEvent(this.newWindowCheck, 'change', OnChange_newWindowCheck.bind(this));
	this.eventManager.addEvent(this.downloadCheck, 'change', OnChange_downloadCheck.bind(this));
	this.eventManager.addEvent(this.displayInput, 'input', OnChange_displayInput.bind(this));
	this.eventManager.addEvent(this.urlInput, 'input', OnChange_urlInput.bind(this));
	this.eventManager.addEvent(this.urlInput, 'focus', OnFocus_urlInput.bind(this));
	this.eventManager.addEvent(this.bookmarkButton, 'click', OnClick_bookmarkButton.bind(this));
	this.eventManager.addEvent(forms.querySelector('._se_upload_button'), 'click', () => this.input.click());
};

ModalAnchorEditor.prototype = {
	set(element) {
		this.currentTarget = element;
	},

	on(isUpdate) {
		if (!isUpdate) {
			this.init();
			this.displayInput.value = this.selection.get().toString().trim();
			this.newWindowCheck.checked = this.openNewWindow;
			this.titleInput.value = '';
		} else if (this.currentTarget) {
			const href = this.currentTarget.getAttribute('href');
			this.linkValue = this.preview.textContent = this.urlInput.value = this._selfPathBookmark(href) ? href.substr(href.lastIndexOf('#')) : href;
			this.displayInput.value = this.currentTarget.textContent;
			this.titleInput.value = this.currentTarget.title;
			this.newWindowCheck.checked = /_blank/i.test(this.currentTarget.target) ? true : false;
			this.downloadCheck.checked = this.currentTarget.download;
		}

		this._setRel(isUpdate && this.currentTarget ? this.currentTarget.rel : this.defaultRel.default || '');
		this._setLinkPreview(this.linkValue);
	},

	create(notText) {
		if (this.linkValue.length === 0) return null;

		const url = this.linkValue;
		const displayText = this.displayInput.value.length === 0 ? url : this.displayInput.value;

		const oA = this.currentTarget || domUtils.createElement('A');
		this._updateAnchor(oA, url, displayText, this.titleInput.value, notText);
		this.linkValue = this.preview.textContent = this.urlInput.value = this.displayInput.value = '';

		return oA;
	},

	init() {
		this.currentTarget = null;
		this.linkValue = this.preview.textContent = this.urlInput.value = '';
		this.displayInput.value = '';
		this.newWindowCheck.checked = false;
		this.downloadCheck.checked = false;
		this._change = false;
		this._setRel(this.defaultRel.default || '');
	},

	_updateAnchor(anchor, url, displayText, title, notText) {
		// download
		if (!this._selfPathBookmark(url) && this.downloadCheck.checked) {
			anchor.setAttribute('download', displayText || url);
		} else {
			anchor.removeAttribute('download');
		}

		// new window
		if (this.newWindowCheck.checked) anchor.target = '_blank';
		else anchor.removeAttribute('target');

		// rel
		const rel = this.currentRel.join(' ');
		if (!rel) anchor.removeAttribute('rel');
		else anchor.rel = rel;

		// set url
		anchor.href = url;
		if (title) anchor.title = title;
		else anchor.removeAttribute('title');

		if (notText) {
			if (anchor.children.length === 0) anchor.textContent = '';
		} else {
			anchor.textContent = displayText;
		}
	},

	_selfPathBookmark(path) {
		const href = this._w.location.href.replace(/\/$/, '');
		return path.indexOf('#') === 0 || (path.indexOf(href) === 0 && path.indexOf('#') === (!href.includes('#') ? href.length : href.substr(0, href.indexOf('#')).length));
	},

	_setRel(relAttr) {
		if (!this._isRel) return;

		const rels = (this.currentRel = !relAttr ? [] : relAttr.split(' '));
		const checkedRel = this.selectMenu_rel.form.querySelectorAll('button');
		for (let i = 0, len = checkedRel.length, cmd; i < len; i++) {
			cmd = checkedRel[i].getAttribute('data-command');
			if (rels.includes(cmd)) {
				domUtils.addClass(checkedRel[i], 'se-checked');
			} else {
				domUtils.removeClass(checkedRel[i], 'se-checked');
			}
		}

		this.relPreview.title = this.relPreview.textContent = rels.join(' ');
	},

	_createHeaderList(urlValue) {
		const headers = domUtils.getListChildren(this.editor.frameContext.get('wysiwyg'), function (current) {
			return /h[1-6]/i.test(current.nodeName);
		});
		if (headers.length === 0) return;

		const valueRegExp = new _w.RegExp(`^${urlValue.replace(/^#/, '')}`, 'i');
		const list = [];
		const menus = [];
		for (let i = 0, len = headers.length, v; i < len; i++) {
			v = headers[i];
			if (!valueRegExp.test(v.textContent)) continue;
			list.push(v);
			menus.push('<div style="' + v.style.cssText + '">' + v.textContent + '</div>');
		}

		if (list.length === 0) {
			this.selectMenu_bookmark.close();
		} else {
			this.selectMenu_bookmark.create(list, menus);
			this.selectMenu_bookmark.open(this.options.get('_rtl') ? 'bottom-right' : '');
		}
	},

	_setLinkPreview(value) {
		const preview = this.preview;
		const protocol = this.options.get('defaultUrlProtocol');
		const noPrefix = this.noAutoPrefix;
		const reservedProtocol = /^(mailto:|tel:|sms:|https*:\/\/|#)/.test(value) || value.indexOf(protocol) === 0;
		const sameProtocol = !protocol ? false : _w.RegExp('^' + unicode.escapeStringRegexp(value.substr(0, protocol.length))).test(protocol);

		value =
			this.linkValue =
			preview.textContent =
				!value ? '' : noPrefix ? value : protocol && !reservedProtocol && !sameProtocol ? protocol + value : reservedProtocol ? value : /^www\./.test(value) ? 'http://' + value : this.host + (/^\//.test(value) ? '' : '/') + value;

		if (this._selfPathBookmark(value)) {
			this.bookmark.style.display = 'block';
			domUtils.addClass(this.bookmarkButton, 'active');
		} else {
			this.bookmark.style.display = 'none';
			domUtils.removeClass(this.bookmarkButton, 'active');
		}

		if (!this._selfPathBookmark(value) && this.downloadCheck.checked) {
			this.download.style.display = 'block';
		} else {
			this.download.style.display = 'none';
		}
	},

	_relMerge(relAttr) {
		const current = this.currentRel;
		if (!relAttr) return current.join(' ');

		if (/^only:/.test(relAttr)) {
			relAttr = relAttr.replace(/^only:/, '').trim();
			this.currentRel = relAttr.split(' ');
			return relAttr;
		}

		const rels = relAttr.split(' ');
		for (let i = 0, len = rels.length; i < len; i++) {
			if (!current.includes(rels[i])) current.push(rels[i]);
		}

		return current.join(' ');
	},

	_relDelete(relAttr) {
		if (!relAttr) return this.currentRel.join(' ');
		if (/^only:/.test(relAttr)) relAttr = relAttr.replace(/^only:/, '').trim();

		const rels = this.currentRel.join(' ').replace(_w.RegExp(relAttr + '\\s*'), '');
		this.currentRel = rels.split(' ');
		return rels;
	},

	_register(response) {
		const file = response.result[0];
		this.linkValue = this.preview.textContent = this.urlInput.value = file.url;
		this.displayInput.value = file.name;
		this.downloadCheck.checked = true;
		this.download.style.display = 'block';
	},

	async _error(response) {
		const message = await this.triggerEvent('onFileUploadError', { error: response });
		if (message === false) return;
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.notice.open(err);
		console.error('[SUNEDITOR.plugin.fileUpload.error]', err);
	},

	_uploadCallBack(xmlHttp) {
		const response = JSON.parse(xmlHttp.responseText);
		if (response.errorMessage) {
			this._error(response);
		} else {
			this._register(response);
		}
	},

	constructor: ModalAnchorEditor
};

async function OnChangeFile(e) {
	const files = e.target.files;
	if (!files[0]) return;

	const fileInfo = {
		url: this.uploadUrl,
		uploadHeaders: this.uploadHeaders,
		files
	};

	const handler = async function (infos, newInfos) {
		infos = newInfos || infos;
		const xmlHttp = await this.fileManager.asyncUpload(infos.url, infos.uploadHeaders, infos.files);
		this._uploadCallBack(xmlHttp);
	}.bind(this, fileInfo);

	const result = await this.triggerEvent('onFileUploadBefore', {
		...fileInfo,
		handler
	});

	if (result === undefined) return true;
	if (result === false) return false;
	if (result !== null && typeof result === 'object') handler(result);

	if (result === true || result === NO_EVENT) handler(null);
}

function OnClick_relbutton() {
	this.selectMenu_rel.open(this.options.get('_rtl') ? 'left-middle' : '');
}

function SetHeaderBookmark(item) {
	const id = item.id || 'h_' + this._w.Math.random().toString().replace(/.+\./, '');
	item.id = id;
	this.urlInput.value = '#' + id;

	if (!this.displayText.value.trim() || !this._change) {
		this.displayText.value = item.textContent;
	}

	this._setLinkPreview(this.urlInput.value);
	this.selectMenu_bookmark.close();
	this.urlInput.focus();
}

function SetRelItem(item) {
	const cmd = item.getAttribute('data-command');
	if (!cmd) return;

	const current = this.currentRel;
	const index = current.indexOf(cmd);
	if (index === -1) current.push(cmd);
	else current.splice(index, 1);

	this.relPreview.title = this.relPreview.textContent = current.join(', ');
}

function OnChange_displayInput(e) {
	this._change = !!e.target.value.trim();
}

function OnChange_urlInput(e) {
	const value = e.target.value.trim();
	this._setLinkPreview(value);
	if (this._selfPathBookmark(value)) this._createHeaderList(value);
	else this.selectMenu_bookmark.close();
}

function OnFocus_urlInput() {
	const value = this.urlInput.value;
	if (this._selfPathBookmark(value)) this._createHeaderList(value);
}

function OnClick_bookmarkButton() {
	let url = this.urlInput.value;
	if (this._selfPathBookmark(url)) {
		url = url.substr(1);
		this.bookmark.style.display = 'none';
		domUtils.removeClass(this.bookmarkButton, 'active');
	} else {
		url = '#' + url;
		this.bookmark.style.display = 'block';
		domUtils.addClass(this.bookmarkButton, 'active');
		this.downloadCheck.checked = false;
		this.download.style.display = 'none';
		this._createHeaderList(url);
	}

	this.urlInput.value = url;
	this._setLinkPreview(url);
	this.urlInput.focus();
}

function OnChange_newWindowCheck(e) {
	if (typeof this.defaultRel.check_new_window !== 'string') return;
	if (e.target.checked) {
		this._setRel(this._relMerge(this.defaultRel.check_new_window));
	} else {
		this._setRel(this._relDelete(this.defaultRel.check_new_window));
	}
}

function OnChange_downloadCheck(e) {
	if (e.target.checked) {
		this.download.style.display = 'block';
		this.bookmark.style.display = 'none';
		domUtils.removeClass(this.bookmarkButton, 'active');
		this.linkValue = this.preview.textContent = this.urlInput.value = this.urlInput.value.replace(/^#+/, '');
		if (typeof this.defaultRel.check_bookmark === 'string') {
			this._setRel(this._relMerge(this.defaultRel.check_bookmark));
		}
	} else {
		this.download.style.display = 'none';
		if (typeof this.defaultRel.check_bookmark === 'string') {
			this._setRel(this._relDelete(this.defaultRel.check_bookmark));
		}
	}
}

function CreatetModalForm(editor, params, relList) {
	const lang = editor.lang;
	const icons = editor.icons;
	const textDisplayShow = params.textToDisplay ? '' : 'style="display: none;"';
	const titleShow = params.title ? '' : 'style="display: none;"';

	let html = /*html*/ `
		<div class="se-modal-body">
			<div class="se-modal-form">
				<label>${lang.link_modal_url}</label>
				<div class="se-modal-form-files">
					<input data-focus class="se-input-form se-input-url" type="text" placeholder="${editor.options.get('protocol') || ''}" />
					${
						params.enableFileUpload
							? `<button type="button" class="se-btn se-modal-files-edge-button _se_upload_button" title="${lang.fileUpload}" aria-label="${lang.fileUpload}">
									${icons.file_upload}
								</button>`
							: ''
					}
					<button type="button" class="se-btn se-modal-files-edge-button _se_bookmark_button" title="${lang.link_modal_bookmark}" aria-label="${lang.link_modal_bookmark}">
						${icons.bookmark}
					</button>
				</div>
				<div class="se-anchor-preview-form">
					<span class="se-svg se-anchor-preview-icon _se_anchor_bookmark_icon">${icons.bookmark}</span>
					<span class="se-svg se-anchor-preview-icon _se_anchor_download_icon">${icons.download}</span>
					<pre class="se-link-preview"></pre>
				</div>
				<label ${textDisplayShow}>${lang.link_modal_text}</label>
				<input class="se-input-form _se_display_text" type="text" ${textDisplayShow} />
				<label ${titleShow}>${lang.title}</label>
				<input class="se-input-form _se_title" type="text" ${titleShow} />
			</div>
			<div class="se-modal-form-footer">
				<label><input type="checkbox" class="se-modal-btn-check _se_anchor_check" />&nbsp;${lang.link_modal_newWindowCheck}</label>
				<label><input type="checkbox" class="se-modal-btn-check _se_anchor_download" />&nbsp;${lang.link_modal_downloadLinkCheck}</label>`;

	if (relList.length > 0) {
		html += /*html*/ `
			<div class="se-anchor-rel">
				<button type="button" class="se-btn se-btn-select se-anchor-rel-btn">&lt;rel&gt;</button>
				<div class="se-anchor-rel-wrapper"><pre class="se-link-preview se-anchor-rel-preview"></pre></div>
			</div>
		</div>`;
	}

	html += '</div></div>';

	return domUtils.createElement('DIV', null, html);
}

export default ModalAnchorEditor;
