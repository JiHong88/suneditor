/**
 * @fileoverview DocumentType class
 */

import { domUtils, numbers, converter, env } from '../../helper';

const { _w } = env;
const A4_HEIGHT_INCHES = 11.7; // A4 height(inches)
const A4_HEIGHT = A4_HEIGHT_INCHES * 96; // 1 inch = 96px

const DocumentType = function (editor, fc) {
	// members
	this.editor = editor;
	this.selection = editor.selection;
	this.offset = editor.offset;
	this.fc = fc;
	this.ww = fc.get('wysiwyg');
	this.wwFrame = fc.get('wysiwygFrame');
	this.wwWidth = -1;
	this.wwHeight = -1;
	this.isAutoHeight = fc.get('options').get('height') === 'auto';
	this.displayPage = this.isAutoHeight ? _w : fc.get('wysiwyg');
	this.innerHeaders = [];
	this._wwHeaders = [];
	this.inner = null;
	this.page = null;
	this.totalPages = 0;
	this.pageNum = 0;
	this.pageHeight = -1;
	this.pages = [];
	this.pages_line = [];
	this.prevScrollTop = 0;
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
		// page navigator
		if (editor.options.get('buttons').has('pageNavigator') || editor.options.get('buttons_sub')?.has('pageNavigator')) {
			//
		}
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

		const height = this.displayPage.scrollHeight ?? this.ww.scrollHeight;
		if (this.pageHeight === height) return;
		this.pageHeight = height;

		const totalPages = Math.ceil(height / A4_HEIGHT);
		const scrollTop = (this.prevScrollTop = this._getWWScrollTop());
		const wwWidth = this.wwFrame.offsetWidth + 1;
		const pageBreaks = this.ww.querySelectorAll('.se-page-break');

		const pages = [];
		const pageTop = this.page.offsetTop;
		for (let i = 0, len = pageBreaks.length; i < len; i++) {
			pages.push({ number: i, top: pageBreaks[i].offsetTop - pageTop + pageBreaks[i].offsetHeight / 2 - scrollTop });
		}

		for (let i = 0, t; i < totalPages; i++) {
			t = i * A4_HEIGHT - scrollTop;
			let inserted = false;
			for (let j = 0, jLen = pages.length; j < jLen; j++) {
				if (t < pages[j].top) {
					pages.splice(j, 0, { number: i + pageBreaks.length, top: t });
					inserted = true;
					break;
				}
			}
			if (!inserted) {
				pages.push({ number: i + pageBreaks.length, top: t });
			}
		}

		// set page number
		this.page.innerHTML = '';
		this.pages = [];
		for (let i = 0, len = pages.length; i < len; i++) {
			const pageNumber = domUtils.createElement('DIV', { style: `top:${pages[i].top}px`, innerHTML: i + 1 }, `<div class="se-document-page-line" style="width: ${wwWidth}px;"></div>${i + 1}`);
			this.page.appendChild(pageNumber);
			this.pages.push(pageNumber);
		}

		this.pages_line = this.page.querySelectorAll('.se-document-page-line');
		this.totalPages = totalPages;
	},

	resizePage() {
		const wwWidth = this.wwFrame.offsetWidth + 1;
		const wwHeight = this.ww.offsetHeight + 1;
		if (wwWidth === this.wwWidth || wwHeight === this.wwHeight) return;

		this.wwWidth = wwWidth;
		this.wwHeight = wwHeight;
		const pages_line = this.pages_line;
		for (let i = 0, len = pages_line.length; i < len; i++) {
			pages_line[i].style.width = `${wwWidth}px`;
		}

		this._displayCurrentPage();
	},

	scrollPage() {
		const prevScrollTop = this.prevScrollTop;
		const scrollTop = this._getWWScrollTop();
		if (prevScrollTop === scrollTop) return;

		const pages = this.pages;
		for (let i = 0, len = pages.length; i < len; i++) {
			pages[i].style.top = `${numbers.get(pages[i].style.top) - (scrollTop - prevScrollTop)}px`;
		}

		this.prevScrollTop = scrollTop;
		this._displayCurrentPage();
	},

	getCurrentPageNumber() {
		if (this.totalPages <= 1) return 1;

		const scrollTop = this.isAutoHeight ? _w.scrollY + this.wwHeight / 2 - this._getGlobalTop() : this._getWWScrollTop() + this.wwHeight / 2;
		const pageNum = Math.floor(scrollTop / A4_HEIGHT);
		return (this.pageNum = pageNum < 1 ? 1 : pageNum > this.pages.length ? this.pages.length : pageNum);
	},

	pageUp() {
		const pageNum = this.pageNum - 1 <= 1 ? 1 : this.pageNum - 1;
		this._movePage(pageNum);
	},

	pageDown() {
		const pageNum = this.pageNum + 1 > this.pages.length ? this.pages.length : this.pageNum + 1;
		this._movePage(pageNum);
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

	scrollWindow() {
		if (!this.isAutoHeight) return;
		this._displayCurrentPage();
	},

	_displayCurrentPage() {
		const pageNum = this.getCurrentPageNumber();
		console.log('pageNum', pageNum);
	},

	_getWWScrollTop() {
		return this.displayPage.scrollTop || 0;
	},

	_movePage(pageNum) {
		if (this.pageNum === pageNum) return;

		const globalTop = this._getGlobalTop();
		const children = converter.nodeListToArray(this.ww.children);
		const pageTop = this.page.offsetTop + numbers.get(this.pages[pageNum - 1].style.top) + this._getWWScrollTop();
		for (let i = 0, len = children.length, c; i < len; i++) {
			c = children[i];
			if (c.offsetTop >= pageTop) {
				this.selection.setRange(c, 0, c, 0);
				const scrollTop = i === 0 && !this.isAutoHeight ? 0 : c.offsetTop - this.page.offsetTop - c.offsetHeight + globalTop;
				this._applyPageScroll(scrollTop, () => {
					if (this.editor.toolbar._sticky) {
						this.displayPage.scrollTo({ top: scrollTop - this.editor.context.get('toolbar.main').offsetHeight, behavior: 'smooth' });
					}
				});

				this.pageNum = pageNum;
				break;
			}
		}
	},

	_applyPageScroll(top, callback) {
		this.displayPage.scrollTo({ top, behavior: 'smooth' });
		const checkScrollEnd = () => {
			if (Math.abs((this.displayPage.scrollY ?? this.displayPage.scrollTop) - top) < 1) {
				callback();
			} else {
				_w.requestAnimationFrame(checkScrollEnd);
			}
		};

		_w.requestAnimationFrame(checkScrollEnd);
	},

	_getGlobalTop() {
		return this.isAutoHeight ? this.offset.getGlobal(this.wwFrame).top : 0;
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
				this.selection.scrollTo(header);
			}
		}
	} finally {
		this.editor._antiBlur = false;
	}
}

export default DocumentType;
