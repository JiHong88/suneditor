/**
 * @fileoverview DocumentType class
 */

import EditorInjector from '../../editorInjector';
import { domUtils, numbers } from '../../helper';

const DocumentType = function (editor) {
	EditorInjector.call(this, editor);

	// members
	this.ww = null;
	this.innerHeaders = [];
};

DocumentType.prototype = {
	init(fc) {
		this.ww = fc.get('wysiwyg');
		const headers = this._getHeaders();
		const inner = fc.get('typeDocumentInner');
		let headerHTML = '';
		for (let i = 0, len = headers.length, h; i < len; i++) {
			h = headers[i];
			headerHTML += `<div class="se-doc-item se-doc-h${numbers.get(h.nodeName)}">${h.textContent}</div>`;
		}
		inner.innerHTML = headerHTML;
		this.innerHeaders = inner.querySelectorAll('div');

		// Event
		this.eventManager.addEvent(inner, 'click', OnClickHeader.bind(this, this.ww));
	},

	reset(fc) {
		const headers = this._getHeaders();
		const inner = fc.get('typeDocumentInner');

		// update or new headers
		for (let i = 0, len = headers.length, h; i < len; i++) {
			h = headers[i];
			const headerClass = `se-doc-h${numbers.get(h.nodeName)}`;

			if (i < this.innerHeaders.length) {
				if (!this.innerHeaders[i].classList.contains(headerClass) || this.innerHeaders[i].textContent !== h.textContent) {
					this.innerHeaders[i].textContent = h.textContent;
					this.innerHeaders[i].className = headerClass;
				}
			} else {
				const newHeader = document.createElement('div');
				newHeader.className = headerClass;
				newHeader.textContent = h.textContent;
				inner.appendChild(newHeader);
			}
		}

		// remove
		if (this.innerHeaders.length > headers.length) {
			for (let i = headers.length; i < this.innerHeaders.length; i++) {
				inner.removeChild(this.innerHeaders[i]);
			}
		}

		this.innerHeaders = inner.querySelectorAll('div');
	},

	on(line) {
		if (!this._is(line)) line = this._findLinesHeader(line);
		if (!line) return;

		const item = this.findItem(line);
		if (!item) return;

		domUtils.removeClass(this.innerHeaders, 'active');
		domUtils.addClass(item, 'active');
	},

	onChangeText(header) {
		if (!this._is(header)) return;
		const item = this.findItem(header);
		if (!item) return;
		item.textContent = header.textContent;
	},

	findItem(header) {
		const headers = this._getHeaders();
		const index = Array.prototype.indexOf.call(headers, header);

		if (index !== -1 && this.innerHeaders[index]) {
			return this.innerHeaders[index];
		}

		return null;
	},

	_findLinesHeader(line) {
		while (line) {
			if (this._is(line)) {
				return line;
			}
			line = line.previousElementSibling;
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
