import { dom, numbers, converter, env } from '../../helper';

const { _w } = env;

// A4 constants in points (72 dpi - PDF standard)
const MM_TO_POINTS = 2.83465; // 1mm = 2.83465pt
const POINTS_TO_PIXELS = 96 / 72; // convert PDF points to screen pixels
const A4_HEIGHT_MM = 297;
const A4_PAGE_HEIGHT = Math.floor(A4_HEIGHT_MM * MM_TO_POINTS * POINTS_TO_PIXELS);

/**
 * @description DocumentType, page, header management class
 */
class DocumentType {
	#store;
	#context;
	#isScrollable;

	#offset;
	#selection;
	#toolbar;

	#fc;
	#ww;
	#wwFrame;
	#documentTypeInner;
	#inner;
	#page;
	#pageNavigator;
	#mirror;
	#paddingTop;
	#paddingBottom;

	#wwWidth = -1;
	#wwHeight = -1;
	#innerHeaders = null;
	#wwHeaders = null;
	#totalPages = 0;
	#pageNum = 0;
	#pageHeight = -1;
	#pageBreaksCnt = 0;
	#pages = [];
	#pagesLine = null;
	#prevScrollTop = 0;
	#mirrorCache = 0;
	#positionCache = new Map();
	#rePageTimeout = null;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 * @param {SunEditor.FrameContext} fc - Frame context object
	 */
	constructor(kernel, fc) {
		const $ = kernel.$;

		this.#store = $.store;
		this.#context = $.context;
		this.#isScrollable = this.#store.get('isScrollable');

		this.#offset = $.offset;
		this.#selection = $.selection;
		this.#toolbar = $.toolbar;

		// members
		this.useHeader = $.options.get('_type_options').includes('header');
		this.usePage = $.options.get('_type_options').includes('page');

		this.#fc = fc;
		this.#ww = fc.get('wysiwyg');
		this.#wwFrame = fc.get('wysiwygFrame');
		this.#documentTypeInner = fc.get('documentTypeInner');
		this.#mirror = fc.get('documentTypePageMirror');

		if (this.#mirror) {
			const mirrorStyles = _w.getComputedStyle(this.#mirror);
			this.#paddingTop = numbers.get(mirrorStyles.paddingTop);
			this.#paddingBottom = numbers.get(mirrorStyles.paddingBottom);
		}

		// init header
		if (this.useHeader) {
			const headers = this._getHeaders();
			const inner = (this.#inner = this.#documentTypeInner.querySelector('.se-document-lines-inner'));
			let headerHTML = '';
			for (let i = 0, len = headers.length, h; i < len; i++) {
				h = headers[i];
				headerHTML += `<div class="se-doc-item se-doc-h${numbers.get(h.nodeName)}" title="${h.textContent}">${h.textContent}</div>`;
			}
			inner.innerHTML = headerHTML;
			this.#innerHeaders = inner.querySelectorAll('div');

			$.eventManager.addEvent(inner, 'click', this.#OnClickHeader.bind(this, this.#ww));
		}

		// init page
		if (this.usePage) {
			this.#page = fc.get('documentTypePage');
			this.#pageNavigator = $.plugins.pageNavigator;
		}
	}

	/**
	 * @description Refresh the document header area
	 */
	reHeader() {
		if (!this.useHeader) return;

		const headers = this._getHeaders();
		const inner = this.#inner;
		const innerHeaders = this.#innerHeaders;

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

		this.#innerHeaders = inner.querySelectorAll('div');
	}

	/**
	 * @description Refresh the document page
	 * @param {boolean} force - Whether to force the page to be re-rendered
	 * @returns {Promise<void>}
	 */
	async rePage(force) {
		if (!this.#page) return;
		if (this.#rePageTimeout) _w.clearTimeout(this.#rePageTimeout);

		// Debounced page re-render — waits for media to load and coalesces rapid calls (cleared on next rePage)
		this.#rePageTimeout = _w.setTimeout(async () => {
			await dom.utils.waitForMediaLoad(this.#mirror, 1500);

			const heightGap = this.#ww.scrollHeight > this.#mirror.scrollHeight ? this.#ww.scrollHeight - this.#mirror.scrollHeight : 0;
			const mirrorHeight = this.#mirror.scrollHeight + heightGap;
			const pageBreaks = /** @type { NodeListOf<HTMLElement>} */ (this.#ww.querySelectorAll('.se-page-break'));
			if (!force && this.#pageHeight === mirrorHeight && this.#pageBreaksCnt === pageBreaks.length) return;

			this.#pageHeight = mirrorHeight;
			this.#pageBreaksCnt = pageBreaks.length;

			// page break
			let pageBreakHeight = 0;
			let lastBreakPosition = 0;
			let additionalPages = 0;
			if (pageBreaks.length > 0) {
				pageBreakHeight = pageBreaks[0].offsetHeight;
				for (let i = 0; i < pageBreaks.length; i++) {
					const breakPosition = pageBreaks[i].offsetTop;
					const sectionHeight = breakPosition - lastBreakPosition;
					if (sectionHeight % A4_PAGE_HEIGHT !== 0) additionalPages++;
					lastBreakPosition = breakPosition;
				}

				const lastSectionHeight = mirrorHeight - lastBreakPosition;
				if (lastSectionHeight > 0 && lastSectionHeight % A4_PAGE_HEIGHT !== 0) additionalPages++;
			}

			const scrollTop = !this.#isScrollable(this.#fc) ? 0 : this._getWWScrollTop();
			const totalPages = Math.ceil(mirrorHeight / A4_PAGE_HEIGHT) + additionalPages;
			const wwWidth = this.#wwFrame.offsetWidth + 1;
			const pages = [];

			for (let i = 0; i < pageBreaks.length; i++) {
				pages.push({ number: i, top: pageBreaks[i].offsetTop + pageBreakHeight / 2 });
			}

			this.#mirrorCache = 0;
			const chr = this.#ww.children;
			const mChr = this.#mirror.children;
			this._initializeCache(mChr);

			pages.push({ number: 0, top: 0 });

			for (let i = 1, t = 0; i < totalPages; i++) {
				t += A4_PAGE_HEIGHT + (i === 1 ? this.#paddingTop + this.#paddingBottom : this.#paddingTop);
				if (!pages.some((p) => Math.abs(p.top - t) < 3)) {
					const top = this._calcPageBreakTop(t, chr, mChr);
					if (top === null) break;
					pages.push({ number: i, top });
				}
			}

			if (pages.length === 0) {
				this.#pagesLine = null;
				this.#totalPages = 1;
				this._displayCurrentPage();
				return;
			}

			// numbering
			pages.sort((a, b) => a.top - b.top);
			this.#page.innerHTML = '';
			this.#pages = [];

			for (let i = 0, t; i < totalPages; i++) {
				if (!pages[i]) continue;
				t = pages[i].top;
				if (mirrorHeight < t) break;

				const pageNumber = dom.utils.createElement(
					'DIV',
					{
						style: `top:${t - scrollTop}px`,
						innerHTML: String(i + 1),
					},
					`<div class="se-document-page-line" style="width: ${wwWidth}px;"></div>${i + 1}`,
				);

				this.#page.appendChild(pageNumber);
				this.#pages.push(pageNumber);
			}

			this.#pagesLine = this.#page.querySelectorAll('.se-document-page-line');
			this.#totalPages = this.#pages.length;
			this._displayCurrentPage();
		}, 400);
	}

	_getDisplayPage() {
		return /** @type {SunEditor.EventWysiwyg} */ (!this.#isScrollable(this.#fc) ? _w : this.#fc.get('wysiwyg'));
	}

	/**
	 * @internal
	 * @description Calculates and compensates for the vertical gap between the rendered content (current page)
	 * - and the mirrored preview page due to differences in width and layout.
	 * @param {number} t - The initial top position value to be adjusted.
	 * @param {HTMLCollection} chr - The elements array in the current (main) page.
	 * @param {HTMLCollection} mChr - The elements array in the mirrored page.
	 * @returns {number|null} The adjusted top value.
	 */
	_calcPageBreakTop(t, chr, mChr) {
		const { ci } = this._getElementAtPosition(t, mChr);
		const mel = /** @type {HTMLElement} */ (mChr[ci]);
		const el = /** @type {HTMLElement} */ (chr[ci]);
		if (!mel || !el) return null;

		const offsetDiff = el.offsetTop - mel.offsetTop;
		const heightDiff = el.offsetHeight - mel.offsetHeight;

		const top = t + offsetDiff + heightDiff / 2;
		return Math.round(top);
	}

	/**
	 * @internal
	 * @description Initializes the cache for document elements.
	 * @param {HTMLCollection} mChr - List of mirrored elements.
	 */
	_initializeCache(mChr) {
		this.#positionCache.clear();
		for (let i = 0, len = mChr.length; i < len; i++) {
			const element = /** @type {HTMLElement} */ (mChr[i]);
			const top = element.offsetTop;
			const height = element.offsetHeight;
			const bottom = top + height;

			this.#positionCache.set(i, {
				top,
				height,
				bottom: bottom,
			});
		}
	}

	/**
	 * @internal
	 * @description Retrieves the element at a given position.
	 * @param {number} pageTop - The vertical position to check.
	 * @param {HTMLCollection} mChr - List of mirrored elements.
	 * @returns {{ci: number, cm: number, ch: number}} The closest element and its related data.
	 * - ci: The index of the closest element.
	 * - cm: The distance between the top of the closest element and the given position.
	 * - ch: The height of the closest element.
	 */
	_getElementAtPosition(pageTop, mChr) {
		let start = this.#mirrorCache;
		let end = mChr.length - 1;

		while (start <= end) {
			const mid = Math.floor((start + end) / 2);
			const { top, height, bottom } = this.#positionCache.get(mid);

			if (pageTop >= top && pageTop <= bottom) {
				this.#mirrorCache = mid;
				return { ci: mid, cm: pageTop - bottom, ch: height };
			}

			if (pageTop < top) {
				end = mid - 1;
			} else {
				start = mid + 1;
			}
		}

		const closestIndex = mChr[start] ? start : end;
		this.#mirrorCache = closestIndex;
		const iElement = this.#positionCache.get(closestIndex);
		return { ci: closestIndex, cm: pageTop - iElement.bottom, ch: iElement.height };
	}

	/**
	 * @description Resizes the document page dynamically.
	 */
	resizePage() {
		const wwWidth = this.#wwFrame.offsetWidth + 1;
		const wwHeight = this.#wwFrame.offsetHeight + 1;
		let rh = false;
		if (wwWidth === this.#wwWidth && (rh = wwHeight === this.#wwHeight)) return;

		if (wwWidth > 800) {
			dom.utils.removeClass(this.#documentTypeInner, 'se-document-responsible');
		} else {
			dom.utils.addClass(this.#documentTypeInner, 'se-document-responsible');
		}

		this.#wwWidth = wwWidth;
		this.#wwHeight = wwHeight;
		const pages_line = this.#pagesLine;
		for (let i = 0, len = pages_line?.length; i < len; i++) {
			pages_line[i].style.width = `${wwWidth}px`;
		}

		if (!rh) this.rePage(true);
		this._displayCurrentPage();
	}

	/**
	 * @description Scrolls the document page.
	 */
	scrollPage() {
		const prevScrollTop = this.#prevScrollTop;
		const scrollTop = this._getWWScrollTop();
		if (prevScrollTop === scrollTop) return;

		const pages = this.#pages;
		for (let i = 0, len = pages.length; i < len; i++) {
			pages[i].style.top = `${numbers.get(pages[i].style.top) - (scrollTop - prevScrollTop)}px`;
		}

		this.#prevScrollTop = scrollTop;
		this._displayCurrentPage();
	}

	/**
	 * @description Scrolls the window to a specific position.
	 */
	scrollWindow() {
		if (this.#isScrollable(this.#fc)) return;
		this._displayCurrentPage();
	}

	/**
	 * @description Retrieves the current page number.
	 * @returns {number} The current page number.
	 */
	getCurrentPageNumber() {
		if (this.#totalPages <= 1) return 1;

		let targetPosition = 0;
		if (!this.#isScrollable(this.#fc)) {
			const globalTop = this._getGlobalTop();
			targetPosition = _w.scrollY - globalTop + A4_PAGE_HEIGHT / 2;
			if (targetPosition <= 0) return 1;
		} else {
			targetPosition = this.#wwHeight / 2;
		}

		const pages = this.#pages;
		for (let i = 0, len = pages.length; i < len; i++) {
			if (pages[i].offsetTop >= targetPosition) {
				return (this.#pageNum = i);
			}
		}

		return (this.#pageNum = this.#totalPages);
	}

	/**
	 * @description Moves to the previous page.
	 */
	pageUp() {
		const pageNum = this.#pageNum - 1 <= 1 ? 1 : this.#pageNum - 1;
		this._movePage(pageNum, false);
	}

	/**
	 * @description Moves to the next page.
	 */
	pageDown() {
		const pageNum = this.#pageNum + 1 > this.#pages.length ? this.#pages.length : this.#pageNum + 1;
		this._movePage(pageNum, false);
	}

	/**
	 * @description Moves to a specific page.
	 * @param {number} pageNum - The target page number.
	 */
	pageGo(pageNum) {
		if (pageNum < 1) pageNum = 1;
		else if (pageNum > this.#pages.length) pageNum = this.#pages.length;

		this._movePage(pageNum, true);
	}

	/**
	 * @description Highlights the header of the current line.
	 * @param {Node} line - The `line` element to be highlighted.
	 */
	on(line) {
		if (!this.useHeader) return;

		if (!this._is(line)) line = this._findLinesHeader(line);
		if (!line) return;

		const item = this._findItem(line);
		if (!item) return;

		dom.utils.removeClass(this.#innerHeaders, 'active');
		dom.utils.addClass(item, 'active');
	}

	/**
	 * @description Handles text changes in the document.
	 */
	onChangeText(header) {
		if (!this.useHeader) return;

		if (!this._is(header)) return;
		const item = this._findItem(header);
		if (!item) return;
		item.textContent = header.textContent;
	}

	/**
	 * @internal
	 * @description Displays the current page number.
	 */
	_displayCurrentPage() {
		const pageNum = this.getCurrentPageNumber();
		this.#pageNavigator?.display(pageNum, this.#totalPages);
	}

	/**
	 * @internal
	 * @description Retrieves the scroll position in WYSIWYG mode.
	 * @returns {number} The current scroll position.
	 */
	_getWWScrollTop() {
		const displayPage = this._getDisplayPage();
		return displayPage.scrollTop || displayPage.scrollY || 0;
	}

	/**
	 * @internal
	 * @description Moves to a specific page and updates the view.
	 * @param {number} pageNum - The target page number.
	 */
	_movePage(pageNum, force) {
		const globalTop = this._getGlobalTop();
		const isScrollable = this.#isScrollable(this.#fc);
		const children = converter.nodeListToArray(this.#ww.children);
		const pageTop = this.#page.offsetTop + numbers.get(this.#pages[pageNum - 1].style.top) + (!isScrollable ? 0 : this._getWWScrollTop());
		for (let i = 0, len = children.length, c; i < len; i++) {
			c = children[i];
			if (c.offsetTop >= pageTop) {
				if (!force) this.#selection.setRange(c, 0, c, 0);
				const scrollTop = i === 0 && isScrollable ? 0 : c.offsetTop - this.#page.offsetTop - c.offsetHeight + globalTop;
				this._applyPageScroll(scrollTop, () => {
					if (this.#toolbar.isSticky && !this.#store.mode.isBottom) {
						this._getDisplayPage().scrollTo({ top: scrollTop - this.#context.get('toolbar_main').offsetHeight, behavior: 'smooth' });
					}
				});

				this.#pageNum = pageNum;
				break;
			}
		}
	}

	/**
	 * @internal
	 * @description Applies smooth scrolling for page navigation.
	 */
	_applyPageScroll(top, callback) {
		const displayPage = this._getDisplayPage();

		displayPage.scrollTo({ top, behavior: 'smooth' });
		const checkScrollEnd = () => {
			if (Math.abs((displayPage.scrollY ?? displayPage.scrollTop) - top) < 1) {
				callback();
			} else {
				_w.requestAnimationFrame(checkScrollEnd);
			}
		};

		_w.requestAnimationFrame(checkScrollEnd);
	}

	/**
	 * @internal
	 * @description Retrieves the global top offset of an element.
	 * @returns {number} The top offset of the element.
	 */
	_getGlobalTop() {
		return !this.#isScrollable(this.#fc) ? this.#offset.getGlobal(this.#wwFrame).top : 0;
	}

	/**
	 * @internal
	 * @description Finds an header element of innerHeaders element.
	 * @param {Node} header - H tag element to find.
	 * @returns {HTMLElement|null} The found element, or `null` if not found.
	 */
	_findItem(header) {
		const headers = this.#wwHeaders;
		const index = Array.prototype.indexOf.call(headers, header);

		if (index !== -1 && this.#innerHeaders[index]) {
			return this.#innerHeaders[index];
		}

		return null;
	}

	/**
	 * @internal
	 * @description Finds the closest header element from a given line.
	 * @param {Node} line - The `line` to check.
	 * @returns {Node|null} The closest header element, or `null` if not found.
	 */
	_findLinesHeader(line) {
		while (line && line !== this.#ww) {
			if (this._is(line)) {
				return line;
			}
			line = /** @type {HTMLElement} */ (line).previousElementSibling || line.parentElement;
		}

		return null;
	}

	/**
	 * @internal
	 * @description Checks if an element is a header.
	 * @param {Node} element - The element to check.
	 * @returns {boolean} `true` if the element is a header, otherwise `false`.
	 */
	_is(element) {
		return /^h[1-6]$/i.test(element?.nodeName);
	}

	/**
	 * @internal
	 * @description Retrieves all headers in the document.
	 * @returns {NodeListOf<Element>} An array of header elements.
	 */
	_getHeaders() {
		return (this.#wwHeaders = this.#ww.querySelectorAll('h1, h2, h3, h4, h5, h6'));
	}

	/**
	 * @param {HTMLElement} ww WYSIWYG element
	 * @param {Event} e Event object
	 */
	#OnClickHeader(ww, e) {
		e.preventDefault();

		try {
			this.#store.set('_preventBlur', true);
			const clickedHeader = dom.query.getEventTarget(e);
			if (dom.utils.hasClass(clickedHeader, 'se-doc-item')) {
				const innerIndex = Array.prototype.indexOf.call(this.#innerHeaders, clickedHeader);
				if (innerIndex === -1) return;

				const header = this.#wwHeaders[innerIndex];
				if (header) {
					this.#selection.scrollTo(header);
				}
			}
		} finally {
			this.#store.set('_preventBlur', false);
		}
	}

	/**
	 * @internal
	 * @description Destroy the DocumentType instance and release memory
	 */
	_destroy() {
		if (this.#rePageTimeout) {
			_w.clearTimeout(this.#rePageTimeout);
			this.#rePageTimeout = null;
		}

		if (this.#positionCache) {
			this.#positionCache.clear();
			this.#positionCache = null;
		}

		this.#fc = null;
		this.#ww = null;
		this.#wwFrame = null;
		this.#documentTypeInner = null;
		this.#inner = null;
		this.#page = null;
		this.#pages = null;
		this.#pagesLine = null;
		this.#innerHeaders = null;
		this.#wwHeaders = null;
		this.#pageNavigator = null;
		this.#mirror = null;
	}
}

export default DocumentType;
