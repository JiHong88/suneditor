// 'use strict';

import EditorInterface from '../interface/editor';
import SelectMenu from './selectMenu';
import { domUtils } from '../helper';

const anchorModalEditor = function (inst, modalForm) {
	// plugin bisic properties
	EditorInterface.call(this, inst.editor);

	// create HTML
	const forms = CreatetModalForm(inst.editor);

	// members
	this.modalForm = modalForm;
	this.selectMenu_bookmark = new SelectMenu(this, forms.querySelector('.__se__bookmark'));
	this.selectMenu_rel = new SelectMenu(this, forms.querySelector('.__se__rel'));
	this.host = (this._w.location.origin + this._w.location.pathname).replace(/\/$/, '');
	this._closeRelMenu = null;
	this.urlInput = forms.querySelector('.se-input-url');
	this.anchorText = forms.querySelector('._se_anchor_text');
	this.newWindowCheck = forms.querySelector('._se_anchor_check');
	this.downloadCheck = forms.querySelector('._se_anchor_download');
	this.download = forms.querySelector('._se_anchor_download_icon');
	this.preview = forms.querySelector('.se-link-preview');
	this.bookmark = forms.querySelector('._se_anchor_bookmark_icon');
	this.bookmarkButton = forms.querySelector('._se_bookmark_button');
	this.linkDefaultRel = this.options.linkRelDefault;
	this.defaultRel = this.options.linkRelDefault.default || '';
	this.currentRel = [];
	this.linkAnchor = null;
	this.linkValue = '';
	this._change = false;
	// members - rel
	if (this.options.linkRel.length > 0) {
		this.relButton = forms.querySelector('.se-anchor-rel-btn');
		this.relList = forms.querySelector('.se-list-layer');
		this.relPreview = forms.querySelector('.se-anchor-rel-preview');
		this.eventManager.addEvent(this.relButton, 'click', OnClick_relButton.bind(this));
		this.eventManager.addEvent(this.relList, 'click', OnClick_relList.bind(this));
	}

	// init
	modalForm.querySelector('.se-anchor-editor').appendChild(forms);
	this.eventManager.addEvent(this.newWindowCheck, 'change', OnChange_newWindowCheck.bind(this));
	this.eventManager.addEvent(this.downloadCheck, 'change', OnChange_downloadCheck.bind(this));
	this.eventManager.addEvent(this.anchorText, 'input', OnChange_anchorText.bind(this));
	this.eventManager.addEvent(this.urlInput, 'input', OnChange_urlInput.bind(this));
	this.eventManager.addEvent(this.urlInput, 'keydown', OnKeyDown_urlInput.bind(this));
	this.eventManager.addEvent(this.urlInput, 'focus', OnFocus_urlInput.bind(this));
	this.eventManager.addEvent(this.urlInput, 'blur', OnBlur_urlInput.bind(this));
	this.eventManager.addEvent(this.bookmarkButton, 'click', OnClick_bookmarkButton.bind(this));
};

anchorModalEditor.prototype = {
	on: function (isUpdate) {
		if (!isUpdate) {
			this.init();
			this.anchorText.value = this.selection.get().toString().trim();
			this.newWindowCheck.checked = this.options.linkTargetNewWindow;
		} else if (this.linkAnchor) {
			const href = this.options.linkNoPrefix ? this.linkAnchor.href.replace(this.linkAnchor.origin + '/', '') : this.linkAnchor.href;
			this.linkValue = this.preview.textContent = this.urlInput.value = this._selfPathBookmark(href) ? href.substr(href.lastIndexOf('#')) : href;
			this.anchorText.value = this.linkAnchor.textContent || this.linkAnchor.getAttribute('alt');
			this.newWindowCheck.checked = /_blank/i.test(this.linkAnchor.target) ? true : false;
			this.downloadCheck.checked = this.linkAnchor.download;
		}

		this._setRel(isUpdate && this.linkAnchor ? this.linkAnchor.rel : this.defaultRel);
		this._setLinkPreview(this.linkValue);
		this.selectMenu_bookmark.on(this._setHeaderBookmark.bind(this));
	},

	create: function (notText) {
		if (this.linkValue.length === 0) return null;

		const url = this.linkValue;
		const anchorText = this.anchorText.value.length === 0 ? url : this.anchorText.value;

		const oA = this.linkAnchor || domUtils.createElement('A');
		this._updateAnchor(oA, url, anchorText, notText);
		this.linkValue = this.preview.textContent = this.urlInput.value = this.anchorText.value = '';

		return oA;
	},

	_updateAnchor: function (anchor, url, alt, notText) {
		// download
		if (!this._selfPathBookmark(url) && this.downloadCheck.checked) {
			anchor.setAttribute('download', alt || url);
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

		// est url, alt
		anchor.href = url;
		anchor.setAttribute('alt', alt);
		if (notText) {
			if (anchor.children.length === 0) anchor.textContent = '';
		} else {
			anchor.textContent = alt;
		}
	},

	init: function () {
		this.linkAnchor = null;
		this.linkValue = this.preview.textContent = this.urlInput.value = '';
		this.anchorText.value = '';
		this.newWindowCheck.checked = false;
		this.downloadCheck.checked = false;
		this._change = false;
		this._setRel(this.defaultRel);
		if (this.relList) {
			this._toggleRelList(false);
		}
		this.selectMenu_bookmark.init();
	},

	_selfPathBookmark: function (path) {
		const href = this._w.location.href.replace(/\/$/, '');
		return path.indexOf('#') === 0 || (path.indexOf(href) === 0 && path.indexOf('#') === (href.indexOf('#') === -1 ? href.length : href.substr(0, href.indexOf('#')).length));
	},

	_toggleRelList: function (show) {
		if (!show) {
			if (this._closeRelMenu) this._closeRelMenu();
		} else {
			const target = this.relButton;
			const relList = this.relList;
			domUtils.addClass(target, 'active');
			relList.style.visibility = 'hidden';
			relList.style.display = 'block';
			if (!this.options._rtl) relList.style.left = target.offsetLeft + target.offsetWidth + 1 + 'px';
			else relList.style.left = target.offsetLeft - relList.offsetWidth - 1 + 'px';
			relList.style.top = target.offsetTop + target.offsetHeight / 2 - relList.offsetHeight / 2 + 'px';
			relList.style.visibility = '';

			this._closeRelMenu = function (e) {
				if (e && (this.relButton.contains(e.target) || this.relList.contains(e.target))) return;
				domUtils.removeClass(this.relButton, 'active');
				this.relList.style.display = 'none';
				this.modalForm.removeEventListener('click', this._closeRelMenu);
				this._closeRelMenu = null;
			}.bind(this);

			this.modalForm.addEventListener('click', this._closeRelMenu);
		}
	},

	_setRel: function (relAttr) {
		const rels = (this.currentRel = !relAttr ? [] : relAttr.split(' '));
		if (!this.relList) return;

		const checkedRel = this.relList.querySelectorAll('button');
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
		const headers = domUtils.getListChildren(this.context.element.wysiwyg, function (current) {
			return /h[1-6]/i.test(current.nodeName);
		});
		if (headers.length === 0) return;

		const valueRegExp = new this._w.RegExp('^' + urlValue.replace(/^#/, ''), 'i');
		const list = [];
		let html = '';
		for (let i = 0, len = headers.length, h; i < len; i++) {
			h = headers[i];
			if (!valueRegExp.test(h.textContent)) continue;
			list.push(h);
			html += '<li class="se-select-item" data-index="' + i + '">' + h.textContent + '</li>';
		}

		if (list.length === 0) {
			this.selectMenu_bookmark.close();
		} else {
			this.selectMenu_bookmark.create(list, html);
			this.selectMenu_bookmark.open(this._setMenuListPosition.bind(this));
		}
	},

	_setMenuListPosition: function (list) {
		list.style.top = this.urlInput.offsetHeight + 1 + 'px';
	},

	_setHeaderBookmark: function (header) {
		const id = header.id || 'h_' + this._w.Math.random().toString().replace(/.+\./, '');
		header.id = id;
		this.urlInput.value = '#' + id;

		if (!this.anchorText.value.trim() || !this._change) {
			this.anchorText.value = header.textContent;
		}

		this._setLinkPreview(this.urlInput.value);
		this.selectMenu_bookmark.close();
		this.urlInput.focus();
	},

	_setLinkPreview: function (value) {
		const preview = this.preview;
		const protocol = this.options.linkProtocol;
		const noPrefix = this.options.linkNoPrefix;
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

	constructor: anchorModalEditor
};

function OnClick_relButton(e) {
	this._toggleRelList(!domUtils.hasClass(e.target, 'active'));
}

function OnClick_relList(e) {
	const target = e.target;
	const cmd = target.getAttribute('data-command');
	if (!cmd) return;

	const current = this.currentRel;
	const checked = domUtils.toggleClass(target, 'se-checked');
	const index = current.indexOf(cmd);
	if (checked) {
		if (index === -1) current.push(cmd);
	} else {
		if (index > -1) current.splice(index, 1);
	}

	this.relPreview.title = this.relPreview.textContent = current.join(' ');
}

function OnKeyDown_urlInput(e) {
	const keyCode = e.keyCode;
	switch (keyCode) {
		case 38: // up
			e.preventDefault();
			e.stopPropagation();
			this.selectMenu_bookmark.moveItem(-1);
			break;
		case 40: // down
			e.preventDefault();
			e.stopPropagation();
			this.selectMenu_bookmark.moveItem(1);
			break;
		case 13: // enter
			if (this.selectMenu_bookmark.index > -1) {
				e.preventDefault();
				e.stopPropagation();
				this._setHeaderBookmark(this.selectMenu_bookmark.getItem(null));
			}
			break;
	}
}

function OnChange_anchorText(e) {
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

function OnBlur_urlInput() {
	this.selectMenu_bookmark.close();
}

function OnClick_bookmarkButton() {
	let url = this.urlInput.value;
	if (this._selfPathBookmark(url)) {
		url = url.substr(1);
		this.bookmark.style.display = 'none';
		domUtils.removeClass(this.bookmarkButton, 'active');
		this.selectMenu_bookmark.close();
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

function CreatetModalForm(editor) {
	const lang = editor.lang;
	const relList = editor.options.linkRel;
	const defaultRel = (editor.options.linkRelDefault.default || '').split(' ');
	const icons = editor.icons;

	let html =
		'<div class="se-modal-body">' +
		'<div class="se-modal-form">' +
		'<label>' +
		lang.modalBox.linkBox.url +
		'</label>' +
		'<div class="se-modal-form-files">' +
		'<input data-focus class="se-input-form se-input-url" type="text" placeholder="' +
		(editor.options.protocol || '') +
		'" />' +
		'<button type="button" class="se-btn se-modal-files-edge-button _se_bookmark_button" title="' +
		lang.modalBox.linkBox.bookmark +
		'" aria-label="' +
		lang.modalBox.linkBox.bookmark +
		'">' +
		icons.bookmark +
		'</button>' +
		'<div class="se-select-menu __se__bookmark"></div>' +
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
		'</div>' +
		'<div class="se-modal-form">' +
		'<label>' +
		lang.modalBox.linkBox.text +
		'</label><input class="se-input-form _se_anchor_text" type="text" />' +
		'</div>' +
		'<div class="se-modal-form-footer">' +
		'<label><input type="checkbox" class="se-modal-btn-check _se_anchor_check" />&nbsp;' +
		lang.modalBox.linkBox.newWindowCheck +
		'</label>' +
		'<label><input type="checkbox" class="se-modal-btn-check _se_anchor_download" />&nbsp;' +
		lang.modalBox.linkBox.downloadLinkCheck +
		'</label>';
	if (relList.length > 0) {
		html +=
			'<div class="se-anchor-rel"><button type="button" class="se-btn se-btn-select se-anchor-rel-btn">&lt;rel&gt;</button>' +
			'<div class="se-anchor-rel-wrapper"><pre class="se-link-preview se-anchor-rel-preview"></pre></div>' +
			'<div class="se-list-layer se-select-menu __se__rel">' +
			'<div class="se-list-inner">' +
			'<ul class="se-list-basic se-list-checked">';
		for (let i = 0, len = relList.length, rel; i < len; i++) {
			rel = relList[i];
			html += '<li><button type="button" class="se-btn-list' + (defaultRel.indexOf(rel) > -1 ? ' se-checked' : '') + '" data-command="' + rel + '" title="' + rel + '" aria-label="' + rel + '"><span class="se-svg">' + icons.checked + '</span>' + rel + '</button></li>';
		}
		html += '</ul></div></div></div>';
	}

	html += '</div></div>';

	return domUtils.createElement('DIV', null, html);
}

export default anchorModalEditor;
