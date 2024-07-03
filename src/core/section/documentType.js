/**
 * @fileoverview DocumentType class
 */

import { domUtils, numbers } from '../../helper';

const DocumentType = function (editor, fc) {
	// members
	this.editor = editor;
	this.fc = fc;
	this.ww = fc.get('wysiwyg');
	this.innerHeaders = [];
	this.inner = null;
	this.useHeader = editor.options.get('type-options').includes('header');
	this.usePage = editor.options.get('type-options').includes('page');

	// init header
	if (this.useHeader) {
		const headers = this._getHeaders();
		const inner = (this.inner = fc.get('typeDocumentInner'));
		let headerHTML = '';
		for (let i = 0, len = headers.length, h; i < len; i++) {
			h = headers[i];
			headerHTML += `<div class="se-doc-item se-doc-h${numbers.get(h.nodeName)}">${h.textContent}</div>`;
		}
		inner.innerHTML = headerHTML;
		this.innerHeaders = inner.querySelectorAll('div');

		this.editor.eventManager.addEvent(inner, 'click', OnClickHeader.bind(this, this.ww));
	}
};

DocumentType.prototype = {
	reset() {
		if (!this.useHeader) return;

		const headers = this._getHeaders();
		const inner = this.inner;
		const innerHeaders = this.innerHeaders;

		// update or new headers
		for (let i = 0, len = headers.length, h, hClass, innerH; i < len; i++) {
			h = headers[i];
			hClass = `se-doc-h${numbers.get(h.nodeName)}`;
			innerH = innerHeaders[i];

			if (i < innerHeaders.length) {
				if (!innerH.classList.contains(hClass) || innerH.textContent !== h.textContent) {
					innerH.textContent = h.textContent;
					innerH.className = `se-doc-item ${hClass}`;
				}
			} else {
				const newHeader = document.createElement('div');
				newHeader.className = `se-doc-item ${hClass}`;
				newHeader.textContent = h.textContent;
				inner.appendChild(newHeader);
			}
		}

		// remove
		if (innerHeaders.length > headers.length) {
			for (let i = headers.length; i < innerHeaders.length; i++) {
				inner.removeChild(innerHeaders[i]);
			}
		}

		this.innerHeaders = inner.querySelectorAll('div');
	},

	on(line) {
		if (!this.useHeader) return;

		if (!this._is(line)) line = this._findLinesHeader(line);
		if (!line) return;

		const item = this._findItem(line);
		if (!item) return;

		domUtils.removeClass(this.innerHeaders, 'active');
		domUtils.addClass(item, 'active');
	},

	onChangeText(header) {
		if (!this.useHeader) return;

		if (!this._is(header)) return;
		const item = this._findItem(header);
		if (!item) return;
		item.textContent = header.textContent;
	},

	_findItem(header) {
		const headers = this._getHeaders();
		const index = Array.prototype.indexOf.call(headers, header);

		if (index !== -1 && this.innerHeaders[index]) {
			return this.innerHeaders[index];
		}

		return null;
	},

	_findLinesHeader(line) {
		while (line && line !== this.ww) {
			if (this._is(line)) {
				return line;
			}
			line = line.previousElementSibling || line.parentElement;
		}

		return null;
	},

	_is(element) {
		return /^h[1-6]$/i.test(element?.nodeName);
	},

	_getHeaders() {
		return this.ww.querySelectorAll('h1, h2, h3, h4, h5, h6');
	},

	constructor: DocumentType
};

function OnClickHeader(ww, e) {
	e.preventDefault();

	try {
		this.editor._antiBlur = true;
		const clickedHeader = e.target;
		if (domUtils.hasClass(clickedHeader, 'se-doc-item')) {
			const innerIndex = Array.prototype.indexOf.call(this.innerHeaders, clickedHeader);
			if (innerIndex === -1) return;

			const header = this._getHeaders(ww)[innerIndex];
			if (header) {
				this.editor.selection.scrollTo(header);
			}
		}
	} finally {
		this.editor._antiBlur = false;
	}
}

export default DocumentType;
