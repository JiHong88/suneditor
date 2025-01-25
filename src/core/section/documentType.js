/**
 * @fileoverview DocumentType class
 */

import { domUtils, numbers, converter, env } from '../../helper';

const { _w } = env;

// A4 constants in points (72 dpi - PDF standard)
const MM_TO_POINTS = 2.83465; // 1mm = 2.83465pt
const POINTS_TO_PIXELS = 96 / 72; // convert PDF points to screen pixels
const A4_HEIGHT_MM = 297;
const A4_PAGE_HEIGHT = Math.floor(A4_HEIGHT_MM * MM_TO_POINTS * POINTS_TO_PIXELS);

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
	this.documentTypeInner = fc.get('documentTypeInner');
	this.inner = null;
	this.page = null;
	this.totalPages = 0;
	this.pageNum = 0;
	this.pageHeight = -1;
	this.pageBreaksCnt = 0;
	this.pages = [];
	this.pages_line = [];
	this.prevScrollTop = 0;
	this.useHeader = editor.options.get('type-options').includes('header');
	this.usePage = editor.options.get('type-options').includes('page');
	this.navigatorButtons = [];
	this.pageNavigator = null;
	this._mirror = fc.get('documentTypePageMirror');
	this._mirrorCache = 0;
	this._positionCache = new Map();
	this._rePageTimeout = null;

	const mirrorStyles = _w.getComputedStyle(this._mirror);
	this._paddingTop = numbers.get(mirrorStyles.paddingTop);
	this._paddingBottom = numbers.get(mirrorStyles.paddingBottom);

	// init header
	if (this.useHeader) {
		const headers = this._getHeaders();
		const inner = (this.inner = this.documentTypeInner.querySelector('.se-document-lines-inner'));
		let headerHTML = '';
		for (let i = 0, len = headers.length, h; i < len; i++) {
			h = headers[i];
			headerHTML += `<div class="se-doc-item se-doc-h${numbers.get(h.nodeName)}" title="${h.textContent}">${h.textContent}</div>`;
		}
		inner.innerHTML = headerHTML;
		this.innerHeaders = inner.querySelectorAll('div');

		this.editor.eventManager.addEvent(inner, 'click', OnClickHeader.bind(this, this.ww));
	}

	// init page
	if (this.usePage) {
		this.page = fc.get('documentTypePage');
		this.pageNavigator = editor.plugins.pageNavigator;
	}
};

DocumentType.prototype = {
	/**
	 * @description Refresh the document header area
	 */
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
					innerH.textContent = innerH.title = h.textContent;
					innerH.className = `se-doc-item ${hClass}`;
				}
			} else {
				const newHeader = document.createElement('div');
				newHeader.className = `se-doc-item ${hClass}`;
				newHeader.textContent = newHeader.title = h.textContent;
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

	/**
	 * @description Refresh the document page
	 * @param {boolean} force - Whether to force the page to be re-rendered
	 */
	async rePage(force) {
		if (!this.page) return;
		if (this._rePageTimeout) clearTimeout(this._rePageTimeout);

		this._rePageTimeout = setTimeout(async () => {
			await domUtils.waitForMediaLoad(this._mirror, 1500);

			const mirrorHeight = this._mirror.scrollHeight;
			const pageBreaks = this._mirror.querySelectorAll('.se-page-break');
			if (!force && this.pageHeight === mirrorHeight && this.pageBreaksCnt === pageBreaks.length) return;
			this.pageHeight = mirrorHeight;
			this.pageBreaksCnt = pageBreaks.length;

			// page break
			let pageBreakHeight = 0;
			let lastBreakPosition = 0;
			let additionalPages = 0;
			if (pageBreaks.length > 0) {
				pageBreakHeight = pageBreaks[0].offsetHeight;
				for (let i = 0; i < pageBreaks.length; i++) {
					const breakPosition = pageBreaks[i].offsetTop;
					const sectionHeight = breakPosition - lastBreakPosition;

					if (sectionHeight % A4_PAGE_HEIGHT !== 0) {
						additionalPages++;
					}

					lastBreakPosition = breakPosition;
				}

				const lastSectionHeight = mirrorHeight - lastBreakPosition;
				if (lastSectionHeight > 0 && lastSectionHeight % A4_PAGE_HEIGHT !== 0) {
					additionalPages++;
				}
			}

			const scrollTop = this.isAutoHeight ? 0 : this._getWWScrollTop();
			const totalPages = Math.ceil(mirrorHeight / A4_PAGE_HEIGHT) + additionalPages;
			const wwWidth = this.wwFrame.offsetWidth + 1;
			const pages = [];

			for (let i = 0; i < pageBreaks.length; i++) {
				pages.push({ number: i, top: pageBreaks[i].offsetTop + pageBreakHeight - scrollTop });
			}

			// A4 position
			this._mirrorCache = 0;
			const chr = this.ww.children;
			const mChr = this._mirror.children;
			this._initializeCache(mChr);
			pages.push({ number: 0, top: 0 });
			for (let i = 1, t = 0; i < totalPages; i++) {
				t += A4_PAGE_HEIGHT + (i === 1 ? this._paddingTop + this._paddingBottom : this._paddingTop);
				if (!pages.some((p) => Math.abs(p.top - t) < 1)) {
					const { ci, cm, ch } = this._getElementAtPosition(t, mChr);
					const el = chr[ci];
					if (!el) break;

					if (chr[this._mirrorCache]) {
						t += numbers.get(_w.getComputedStyle(chr[this._mirrorCache]).marginBottom);
					}

					const elBottom = el.offsetTop + el.offsetHeight;
					const top = elBottom + cm + (el.offsetHeight - ch);
					pages.push({ number: i, top });
				}
			}

			if (pages.length === 0) {
				this.pages_line = [];
				this.totalPages = 1;
				this._displayCurrentPage();
				return;
			}

			// numbering
			pages.sort((a, b) => a.top - b.top);
			this.page.innerHTML = '';
			this.pages = [];
			for (let i = 0, t; i < totalPages; i++) {
				if (!pages[i]) continue;
				t = pages[i].top;
				if (mirrorHeight < t) break;
				const pageNumber = domUtils.createElement('DIV', { style: `top:${t - scrollTop}px`, innerHTML: i + 1 }, `<div class="se-document-page-line" style="width: ${wwWidth}px;"></div>${i + 1}`);
				this.page.appendChild(pageNumber);
				this.pages.push(pageNumber);
			}

			this.pages_line = this.page.querySelectorAll('.se-document-page-line');
			this.totalPages = this.pages.length;
			this._displayCurrentPage();
		}, 400);
	},

	_initializeCache(mChr) {
		this._positionCache.clear();
		for (let i = 0, len = mChr.length; i < len; i++) {
			const element = mChr[i];
			const top = element.offsetTop;
			const height = element.offsetHeight;
			const bottom = top + height;

			this._positionCache.set(i, {
				top,
				height,
				bottom: bottom
			});
		}
	},

	_getElementAtPosition(pageTop, mChr) {
		let start = this._mirrorCache;
		let end = mChr.length - 1;

		while (start <= end) {
			const mid = Math.floor((start + end) / 2);
			const { top, height, bottom } = this._positionCache.get(mid);

			if (pageTop >= top && pageTop <= bottom) {
				this._mirrorCache = mid;
				return { ci: mid, cm: pageTop - bottom, ch: height };
			}

			if (pageTop < top) {
				end = mid - 1;
			} else {
				start = mid + 1;
			}
		}

		const closestIndex = mChr[start] ? start : end;
		this._mirrorCache = closestIndex;
		const iElement = this._positionCache.get(closestIndex);
		return { ci: closestIndex, cm: pageTop - iElement.bottom, ch: iElement.height };
	},

	resizePage() {
		const wwWidth = this.wwFrame.offsetWidth + 1;
		const wwHeight = this.wwFrame.offsetHeight + 1;
		let rh = false;
		if (wwWidth === this.wwWidth && (rh = wwHeight === this.wwHeight)) return;

		if (wwWidth > 800) {
			domUtils.removeClass(this.documentTypeInner, 'se-document-responsible');
		} else {
			domUtils.addClass(this.documentTypeInner, 'se-document-responsible');
		}

		this.wwWidth = wwWidth;
		this.wwHeight = wwHeight;
		const pages_line = this.pages_line;
		for (let i = 0, len = pages_line.length; i < len; i++) {
			pages_line[i].style.width = `${wwWidth}px`;
		}

		if (!rh) this.rePage(true);
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

	scrollWindow() {
		if (!this.isAutoHeight) return;
		this._displayCurrentPage();
	},

	getCurrentPageNumber() {
		if (this.totalPages <= 1) return 1;

		let targetPosition = 0;
		if (this.isAutoHeight) {
			const globalTop = this._getGlobalTop();
			targetPosition = _w.scrollY - globalTop + A4_PAGE_HEIGHT / 2;
			if (targetPosition <= 0) return 1;
		} else {
			targetPosition = this.wwHeight / 2;
		}

		const pages = this.pages;
		for (let i = 0, len = pages.length; i < len; i++) {
			if (pages[i].offsetTop >= targetPosition) {
				return (this.pageNum = i);
			}
		}

		return (this.pageNum = this.totalPages);
	},

	pageUp() {
		const pageNum = this.pageNum - 1 <= 1 ? 1 : this.pageNum - 1;
		this._movePage(pageNum, false);
	},

	pageDown() {
		const pageNum = this.pageNum + 1 > this.pages.length ? this.pages.length : this.pageNum + 1;
		this._movePage(pageNum, false);
	},

	pageGo(pageNum) {
		if (pageNum < 1) pageNum = 1;
		else if (pageNum > this.pages.length) pageNum = this.pages.length;

		this._movePage(pageNum, true);
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

	_displayCurrentPage() {
		const pageNum = this.getCurrentPageNumber();
		this.pageNavigator?.display(pageNum, this.totalPages);
	},

	_getWWScrollTop() {
		return this.displayPage.scrollTop || this.displayPage.scrollY || 0;
	},

	_movePage(pageNum, force) {
		const globalTop = this._getGlobalTop();
		const children = converter.nodeListToArray(this.ww.children);
		const pageTop = this.page.offsetTop + numbers.get(this.pages[pageNum - 1].style.top) + (this.isAutoHeight ? 0 : this._getWWScrollTop());
		for (let i = 0, len = children.length, c; i < len; i++) {
			c = children[i];
			if (c.offsetTop >= pageTop) {
				if (!force) this.selection.setRange(c, 0, c, 0);
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
		this.editor._preventBlur = true;
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
		this.editor._preventBlur = false;
	}
}

export default DocumentType;
