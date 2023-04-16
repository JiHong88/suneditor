import EditorInjector from '../injector';
import SelectMenu from './SelectMenu';
import { domUtils } from '../helper';

const ModalAnchorEditor = function (inst, modalForm, params) {
	// plugin bisic properties
	EditorInjector.call(this, inst.editor);

	// create HTML
	const forms = CreatetModalForm(inst.editor, params);

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
	this.linkDefaultRel = this.options.get('linkRelDefault');
	this.defaultRel = this.options.get('linkRelDefault').default || '';
	this.currentRel = [];
	this.currentTarget = null;
	this.linkValue = '';
	this._change = false;
	this._isRel = this.options.get('linkRel').length > 0;
	// members - rel
	if (this._isRel) {
		this.relButton = forms.querySelector('.se-anchor-rel-btn');
		this.relPreview = forms.querySelector('.se-anchor-rel-preview');
		const relList = this.options.get('linkRel');
		const defaultRel = (this.linkDefaultRel.default || '').split(' ');
		const list = [];
		for (let i = 0, len = relList.length, rel; i < len; i++) {
			rel = relList[i];
			list.push(
				domUtils.createElement(
					'BUTTON',
					{
						type: 'button',
						class: 'se-btn se-btn-list' + (defaultRel.indexOf(rel) > -1 ? ' se-checked' : ''),
						'data-command': rel,
						title: rel,
						'aria-label': rel
					},
					rel + '<span class="se-svg">' + this.icons.checked + '</span>'
				)
			);
		}
		this.selectMenu_rel = new SelectMenu(this, true, 'right-middle');
		this.selectMenu_rel.on(this.relButton, SetRelItem.bind(this));
		this.selectMenu_rel.create(list);
		this.eventManager.addEvent(this.relButton, 'click', OnClick_relbutton.bind(this));
	}

	// init
	modalForm.querySelector('.se-anchor-editor').appendChild(forms);
	this.selectMenu_bookmark = new SelectMenu(this, false, 'bottom-left');
	this.selectMenu_bookmark.on(this.urlInput, SetHeaderBookmark.bind(this));
	this.eventManager.addEvent(this.newWindowCheck, 'change', OnChange_newWindowCheck.bind(this));
	this.eventManager.addEvent(this.downloadCheck, 'change', OnChange_downloadCheck.bind(this));
	this.eventManager.addEvent(this.displayInput, 'input', OnChange_displayInput.bind(this));
	this.eventManager.addEvent(this.urlInput, 'input', OnChange_urlInput.bind(this));
	this.eventManager.addEvent(this.urlInput, 'focus', OnFocus_urlInput.bind(this));
	this.eventManager.addEvent(this.bookmarkButton, 'click', OnClick_bookmarkButton.bind(this));
};

ModalAnchorEditor.prototype = {
	set: function (element) {
		this.currentTarget = element;
	},

	on: function (isUpdate) {
		if (!isUpdate) {
			this.init();
			this.displayInput.value = this.selection.get().toString().trim();
			this.newWindowCheck.checked = this.options.get('linkTargetNewWindow');
			this.titleInput.value = '';
		} else if (this.currentTarget) {
			const href = this.currentTarget.getAttribute('href');
			this.linkValue = this.preview.textContent = this.urlInput.value = this._selfPathBookmark(href) ? href.substr(href.lastIndexOf('#')) : href;
			this.displayInput.value = this.currentTarget.textContent;
			this.titleInput.value = this.currentTarget.title;
			this.newWindowCheck.checked = /_blank/i.test(this.currentTarget.target) ? true : false;
			this.downloadCheck.checked = this.currentTarget.download;
		}

		this._setRel(isUpdate && this.currentTarget ? this.currentTarget.rel : this.defaultRel);
		this._setLinkPreview(this.linkValue);
	},

	create: function (notText) {
		if (this.linkValue.length === 0) return null;

		const url = this.linkValue;
		const displayText = this.displayInput.value.length === 0 ? url : this.displayInput.value;

		const oA = this.currentTarget || domUtils.createElement('A');
		this._updateAnchor(oA, url, displayText, this.titleInput.value, notText);
		this.linkValue = this.preview.textContent = this.urlInput.value = this.displayInput.value = '';

		return oA;
	},

	init: function () {
		this.currentTarget = null;
		this.linkValue = this.preview.textContent = this.urlInput.value = '';
		this.displayInput.value = '';
		this.newWindowCheck.checked = false;
		this.downloadCheck.checked = false;
		this._change = false;
		this._setRel(this.defaultRel);
	},

	_updateAnchor: function (anchor, url, displayText, title, notText) {
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

	_selfPathBookmark: function (path) {
		const href = this._w.location.href.replace(/\/$/, '');
		return path.indexOf('#') === 0 || (path.indexOf(href) === 0 && path.indexOf('#') === (href.indexOf('#') === -1 ? href.length : href.substr(0, href.indexOf('#')).length));
	},

	_setRel: function (relAttr) {
		if (!this._isRel) return;

		const rels = (this.currentRel = !relAttr ? [] : relAttr.split(' '));
		const checkedRel = this.selectMenu_rel.form.querySelectorAll('button');
		for (let i = 0, len = checkedRel.length, cmd; i < len; i++) {
			cmd = checkedRel[i].getAttribute('data-command');
			if (rels.indexOf(cmd) > -1) {
				domUtils.addClass(checkedRel[i], 'se-checked');
			} else {
				domUtils.removeClass(checkedRel[i], 'se-checked');
			}
		}

		this.relPreview.title = this.relPreview.textContent = rels.join(' ');
	},

	_createHeaderList: function (urlValue) {
		const headers = domUtils.getListChildren(this.editor.frameContext.get('wysiwyg'), function (current) {
			return /h[1-6]/i.test(current.nodeName);
		});
		if (headers.length === 0) return;

		const valueRegExp = new this._w.RegExp('^' + urlValue.replace(/^#/, ''), 'i');
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

	_setLinkPreview: function (value) {
		const preview = this.preview;
		const protocol = this.options.get('linkProtocol');
		const noPrefix = this.options.get('linkNoPrefix');
		const reservedProtocol = /^(mailto\:|tel\:|sms\:|https*\:\/\/|#)/.test(value);
		const sameProtocol = !protocol ? false : this._w.RegExp('^' + value.substr(0, protocol.length)).test(protocol);
		value = this.linkValue = preview.textContent = !value ? '' : noPrefix ? value : protocol && !reservedProtocol && !sameProtocol ? protocol + value : reservedProtocol ? value : /^www\./.test(value) ? 'http://' + value : this.host + (/^\//.test(value) ? '' : '/') + value;

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

	_relMerge: function (relAttr) {
		const current = this.currentRel;
		if (!relAttr) return current.join(' ');

		if (/^only\:/.test(relAttr)) {
			relAttr = relAttr.replace(/^only\:/, '').trim();
			this.currentRel = relAttr.split(' ');
			return relAttr;
		}

		const rels = relAttr.split(' ');
		for (let i = 0, len = rels.length, index; i < len; i++) {
			index = current.indexOf(rels[i]);
			if (index === -1) current.push(rels[i]);
		}

		return current.join(' ');
	},

	_relDelete: function (relAttr) {
		if (!relAttr) return this.currentRel.join(' ');
		if (/^only\:/.test(relAttr)) relAttr = relAttr.replace(/^only\:/, '').trim();

		const rels = this.currentRel.join(' ').replace(this._w.RegExp(relAttr + '\\s*'), '');
		this.currentRel = rels.split(' ');
		return rels;
	},

	constructor: ModalAnchorEditor
};

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
	if (typeof this.linkDefaultRel.check_new_window !== 'string') return;
	if (e.target.checked) {
		this._setRel(this._relMerge(this.linkDefaultRel.check_new_window));
	} else {
		this._setRel(this._relDelete(this.linkDefaultRel.check_new_window));
	}
}

function OnChange_downloadCheck(e) {
	if (e.target.checked) {
		this.download.style.display = 'block';
		this.bookmark.style.display = 'none';
		domUtils.removeClass(this.bookmarkButton, 'active');
		this.linkValue = this.preview.textContent = this.urlInput.value = this.urlInput.value.replace(/^\#+/, '');
		if (typeof this.linkDefaultRel.check_bookmark === 'string') {
			this._setRel(this._relMerge(this.linkDefaultRel.check_bookmark));
		}
	} else {
		this.download.style.display = 'none';
		if (typeof this.linkDefaultRel.check_bookmark === 'string') {
			this._setRel(this._relDelete(this.linkDefaultRel.check_bookmark));
		}
	}
}

function CreatetModalForm(editor, params) {
	const lang = editor.lang;
	const icons = editor.icons;
	const textDisplayShow = params.textToDisplay ? '' : ' style="display: none;"';
	const titleShow = params.title ? '' : ' style="display: none;"';

	let html =
		'<div class="se-modal-body">' +
		'<div class="se-modal-form">' +
		'<label>' +
		lang.link_modal_url +
		'</label>' +
		'<div class="se-modal-form-files">' +
		'<input data-focus class="se-input-form se-input-url" type="text" placeholder="' +
		(editor.options.get('protocol') || '') +
		'" />' +
		'<button type="button" class="se-btn se-modal-files-edge-button _se_bookmark_button" title="' +
		lang.link_modal_bookmark +
		'" aria-label="' +
		lang.link_modal_bookmark +
		'">' +
		icons.bookmark +
		'</button>' +
		'</div>' +
		'<div class="se-anchor-preview-form">' +
		'<span class="se-svg se-anchor-preview-icon _se_anchor_bookmark_icon">' +
		icons.bookmark +
		'</span>' +
		'<span class="se-svg se-anchor-preview-icon _se_anchor_download_icon">' +
		icons.download +
		'</span>' +
		'<pre class="se-link-preview"></pre>' +
		'</div>' +
		'<label' +
		textDisplayShow +
		'>' +
		lang.link_modal_text +
		'</label><input class="se-input-form _se_display_text" type="text"' +
		textDisplayShow +
		' />' +
		'<label' +
		titleShow +
		'>' +
		lang.title +
		'</label><input class="se-input-form _se_title" type="text"' +
		titleShow +
		' />' +
		'</div>' +
		'<div class="se-modal-form-footer">' +
		'<label><input type="checkbox" class="se-modal-btn-check _se_anchor_check" />&nbsp;' +
		lang.link_modal_newWindowCheck +
		'</label>' +
		'<label><input type="checkbox" class="se-modal-btn-check _se_anchor_download" />&nbsp;' +
		lang.link_modal_downloadLinkCheck +
		'</label>';
	if (editor.options.get('linkRel').length > 0) {
		html += '<div class="se-anchor-rel"><button type="button" class="se-btn se-btn-select se-anchor-rel-btn">&lt;rel&gt;</button>' + '<div class="se-anchor-rel-wrapper"><pre class="se-link-preview se-anchor-rel-preview"></pre></div>' + '</div></div>';
	}

	html += '</div></div>';

	return domUtils.createElement('DIV', null, html);
}

export default ModalAnchorEditor;
