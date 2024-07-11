/**
 * @fileoverview DocumentType class
 */

import { domUtils, numbers, env } from '../../helper';

const A4_HEIGHT_INCHES = 11.7; // A4 height(inches)
const A4_HEIGHT = A4_HEIGHT_INCHES * env.DPI * 96; // 1 inch = 96px

const DocumentType = function (editor, fc) {
	// members
	this.editor = editor;
	this.fc = fc;
	this.ww = fc.get('wysiwyg');
	this.wwFrame = fc.get('wysiwygFrame');
	this.wwWidth = -1;
	this.innerHeaders = [];
	this._wwHeaders = [];
	this.inner = null;
	this.page = null;
	this.pageHeight = -1;
	this.pages = [];
	this.pages_line = [];
	this.useHeader = editor.options.get('type-options').includes('header');
	this.usePage = editor.options.get('type-options').includes('page');

	// init header
	if (this.useHeader) {
		const headers = this._getHeaders();
		const inner = (this.inner = fc.get('documentTypeInner').querySelector('.se-document-lines-inner'));
		let headerHTML = '';
		for (let i = 0, len = headers.length, h; i < len; i++) {
			h = headers[i];
			headerHTML += `<div class="se-doc-item se-doc-h${numbers.get(h.nodeName)}">${h.textContent}</div>`;
		}
		inner.innerHTML = headerHTML;
		this.innerHeaders = inner.querySelectorAll('div');

		this.editor.eventManager.addEvent(inner, 'click', OnClickHeader.bind(this, this.ww));
	}

	// init page
	if (this.usePage) {
		this.page = fc.get('documentTypePage');
	}
};

DocumentType.prototype = {
	reHeader() {
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

	rePage() {
		if (!this.page) return;

		const height = this.wwFrame.scrollHeight;
		if (this.pageHeight === height) return;
		this.pageHeight = height;

		const page = this.page;
		const scrollTop = this.ww.scrollTop;
		const wwWidth = this.wwFrame.offsetWidth + 1;
		const totalPages = Math.ceil(height / A4_HEIGHT);

		this.page.innerHTML = '';
		this.pages = [];
		for (let i = 0; i < totalPages; i++) {
			const pageNumber = domUtils.createElement('DIV', { style: `top:${i * A4_HEIGHT + scrollTop}px`, innerHTML: i + 1 }, `<div class="se-document-page-line" style="width: ${wwWidth}px;"></div>${i + 1}`);
			page.appendChild(pageNumber);
			this.pages.push(pageNumber);
		}

		this.pages_line = this.page.querySelectorAll('.se-document-page-line');
	},

	scrollPage() {
		const scrollTop = this.wwFrame.scrollTop;
		const pages = this.pages;
		for (let i = 0, len = pages.length; i < len; i++) {
			pages[i].style.top = `${i * A4_HEIGHT - scrollTop}px`;
		}
	},

	resizePage() {
		const wwWidth = this.wwFrame.offsetWidth + 1;
		if (wwWidth === this.wwWidth) return;

		this.wwWidth = wwWidth;
		const pages_line = this.pages_line;
		for (let i = 0, len = pages_line.length; i < len; i++) {
			pages_line[i].style.width = `${wwWidth}px`;
		}
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
		const headers = this._wwHeaders;
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
		return (this._wwHeaders = this.ww.querySelectorAll('h1, h2, h3, h4, h5, h6'));
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

			const header = this._wwHeaders[innerIndex];
			if (header) {
				this.editor.selection.scrollTo(header);
			}
		}
	} finally {
		this.editor._antiBlur = false;
	}
}

export default DocumentType;
