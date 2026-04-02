import { dom, env } from '../../../helper';

const { _d, _w } = env;

/**
 * @description Find/Replace feature
 */
class Finder {
	#$;
	#store;

	// DOM
	#panel;
	#findInput;
	#replaceInput;
	#countDisplay;
	#replaceRow;

	// option buttons
	#btnCase;
	#btnWord;
	#btnRegex;

	// nav buttons
	#btnPrev;
	#btnNext;
	#btnReplace;
	#btnReplaceAll;

	// State
	#isOpen = false;
	#isReplaceMode = true;
	#matches = [];
	#currentIndex = -1;
	#searchTerm = '';
	#opts = { matchCase: false, wholeWord: false, regex: false };

	// Highlight
	#useNativeHighlight;
	#markElements = [];
	#highlightDoc = null;

	// Debounce, observer
	#searchTimer = null;
	#resizeObserver = null;
	#bindCloseKey = null;
	#contentObserver = null;
	#internalUpdate = false;

	/** @description Inject ::highlight() styles at runtime (avoids PostCSS parse errors). */
	static #highlightStyleInjected = false;
	static #injectHighlightStyles() {
		if (Finder.#highlightStyleInjected) return;
		Finder.#highlightStyleInjected = true;
		const style = _d.createElement('style');
		style.textContent =
			'::highlight(se-find-match){background-color:var(--se-find-match-color,rgba(255,213,0,.4));color:inherit}' + '::highlight(se-find-current){background-color:var(--se-find-current-color,rgba(255,150,50,.7));color:inherit}';
		_d.head.appendChild(style);
	}

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel) {
		this.#$ = kernel.$;
		this.#store = kernel.store;
		this.#useNativeHighlight = !!_w.Highlight && !!CSS?.highlights;

		// Panel UI — only when finder_panel option is enabled
		if (this.#$.options.get('finder_panel')) {
			const panelEl = CreateHTML(this.#$);

			this.#panel = panelEl.panel;
			this.#findInput = panelEl.findInput;
			this.#replaceInput = panelEl.replaceInput;
			this.#countDisplay = panelEl.countDisplay;
			this.#replaceRow = panelEl.replaceRow;
			this.#btnCase = panelEl.btnCase;
			this.#btnWord = panelEl.btnWord;
			this.#btnRegex = panelEl.btnRegex;
			this.#btnPrev = panelEl.btnPrev;
			this.#btnNext = panelEl.btnNext;
			this.#btnReplace = panelEl.btnReplace;
			this.#btnReplaceAll = panelEl.btnReplaceAll;

			this.#bindEvents();

			// Append panel to root container (between toolbar and wrapper)
			const rootFc = this.#$.frameRoots.values().next().value;
			const container = rootFc.get('container');
			if (this.#store.mode.isBottom) {
				const toolbar = this.#$.context.get('toolbar_main');
				container.insertBefore(this.#panel, toolbar);
			} else {
				const wrapper = container.querySelector('.se-wrapper');
				container.insertBefore(this.#panel, wrapper);
			}

			// Update sticky top (responsive resize, more layer, etc.)
			if (env.isResizeObserverSupported) {
				this.#resizeObserver = new ResizeObserver(() => this.#updateStickyTop()).observe(this.#$.context.get('toolbar_main'));
			}
		}
	}

	/**
	 * @description Whether the panel is open.
	 * @returns {boolean}
	 */
	get isOpen() {
		return this.#isOpen;
	}

	/**
	 * @description Opens the finder. With panel: shows UI. Without panel: activates search state only.
	 * @param {boolean} [replaceMode=true] Whether to show replace row
	 */
	open(replaceMode = true) {
		const fc = this.#$.frameContext;
		if (fc.get('isCodeView') || fc.get('isMarkdownView')) return;

		this.#isOpen = true;

		// Listen for wysiwyg content changes to refresh highlights
		this.#addContentInputListener();

		if (this.#panel) {
			this.#btnPrev.disabled = true;
			this.#btnNext.disabled = true;
			this.#btnReplace.disabled = true;
			this.#btnReplaceAll.disabled = true;

			this.#updateStickyTop();

			const sel = this.#$.selection.get();
			const selectedText = sel && !sel.isCollapsed ? sel.toString().trim() : '';
			dom.utils.addClass(this.#panel, 'se-find-replace-open');
			this.#store.set('_preventBlur', true);
			this.#addGlobalCloseEvent();

			if (replaceMode) this.#toggleReplace(replaceMode);
			if (selectedText) this.#findInput.value = selectedText;

			this.#findInput.focus();
			this.#findInput.select();

			if (this.#findInput.value) this.#doSearch();
		}
	}

	/**
	 * @description Updates the finder panel's sticky top position based on toolbar height.
	 */
	#updateStickyTop() {
		if (!this.#isOpen || !this.#panel) return;
		const stickyTop = this.#$.options.get('_toolbar_sticky');
		if (this.#store.mode.isBottom) {
			this.#panel.style.top = 'auto';
			this.#panel.style.bottom = stickyTop >= 0 ? stickyTop + this.#$.context.get('toolbar_main').offsetHeight + 'px' : '0px';
		} else {
			this.#panel.style.top = stickyTop >= 0 ? stickyTop + this.#$.context.get('toolbar_main').offsetHeight + 'px' : '0px';
		}
	}

	/**
	 * @description Closes the finder and clears highlights.
	 */
	close() {
		if (!this.#isOpen) return;

		this.#isOpen = false;
		this.#clearHighlights();
		this.#matches = [];
		this.#currentIndex = -1;
		this.#updateCount();
		this.#removeContentInputListener();

		if (this.#panel) {
			dom.utils.removeClass(this.#panel, 'se-find-replace-open');
			this.#removeGlobalCloseEvent();
			this.#store.set('_preventBlur', false);
			this.#$.focusManager.nativeFocus();
		}
	}

	// ──────────────────────────────────────────────────
	// [[ PUBLIC API ]]
	// ──────────────────────────────────────────────────

	/**
	 * @description Navigate to next match (public for shortcut binding).
	 */
	findNext() {
		if (!this.#isOpen || this.#matches.length === 0) return;
		this.#currentIndex = (this.#currentIndex + 1) % this.#matches.length;
		this.#goToMatch();
	}

	/**
	 * @description Navigate to previous match (public for shortcut binding).
	 */
	findPrev() {
		if (!this.#isOpen || this.#matches.length === 0) return;
		this.#currentIndex = (this.#currentIndex - 1 + this.#matches.length) % this.#matches.length;
		this.#goToMatch();
	}

	/**
	 * @description Search for a term in the editor content (headless API).
	 * @param {string} term Search term
	 * @param {Object} [options] Search options
	 * @param {boolean} [options.matchCase=false] Case-sensitive search
	 * @param {boolean} [options.wholeWord=false] Whole word search
	 * @param {boolean} [options.regex=false] Regex search
	 * @returns {number} Number of matches found
	 */
	search(term, { matchCase, wholeWord, regex } = {}) {
		if (!this.#isOpen) this.open();
		if (matchCase !== undefined) this.#opts.matchCase = matchCase;
		if (wholeWord !== undefined) this.#opts.wholeWord = wholeWord;
		if (regex !== undefined) this.#opts.regex = regex;
		this.#searchTerm = term || '';
		if (this.#findInput) this.#findInput.value = this.#searchTerm;
		this.#doSearch();
		return this.#matches.length;
	}

	/**
	 * @description Replace the current match (headless API).
	 * @param {string} replaceText Replacement text
	 */
	replace(replaceText) {
		this.#replaceOne(replaceText);
	}

	/**
	 * @description Replace all matches (headless API).
	 * @param {string} replaceText Replacement text
	 */
	replaceAll(replaceText) {
		this.#replaceAll(replaceText);
	}

	/**
	 * @description Current match count and index.
	 * @returns {{ current: number, total: number }}
	 */
	get matchInfo() {
		return { current: this.#currentIndex + 1, total: this.#matches.length };
	}

	/**
	 * @description Re-run search with current term (debounced 300ms). Called on wysiwyg content change.
	 */
	refresh() {
		if (!this.#isOpen || !this.#searchTerm || this.#internalUpdate) return;
		this.#internalUpdate = true;
		this.#removeMarkElements();
		this.#markElements = [];
		this.#internalUpdate = false;
		clearTimeout(this.#searchTimer);
		this.#searchTimer = setTimeout(() => this.#doSearch(), 300);
	}

	// ──────────────────────────────────────────────────
	// Global events (ESC close, content change)
	// ──────────────────────────────────────────────────

	/** @description Register global ESC keydown (capture) to close finder. */
	#addGlobalCloseEvent() {
		this.#removeGlobalCloseEvent();
		this.#bindCloseKey = this.#$.eventManager.addGlobalEvent(
			'keydown',
			(e) => {
				if (e.key === 'Escape') {
					e.preventDefault();
					e.stopPropagation();
					this.close();
				}
			},
			true,
		);
	}

	#removeGlobalCloseEvent() {
		this.#bindCloseKey &&= this.#$.eventManager.removeGlobalEvent(this.#bindCloseKey);
	}

	/** @description Listen for wysiwyg edits to auto-refresh highlights. */
	#addContentInputListener() {
		this.#removeContentInputListener();
		const wysiwyg = this.#$.frameContext.get('wysiwyg');
		this.#contentObserver = new MutationObserver(() => this.refresh());
		this.#contentObserver.observe(wysiwyg, { childList: true, subtree: true, characterData: true });
	}

	#removeContentInputListener() {
		if (this.#contentObserver) {
			this.#contentObserver.disconnect();
			this.#contentObserver = null;
		}
	}

	/** @description Bind panel UI events (input, click delegation, tab navigation, blur prevention). Panel-only. */
	#bindEvents() {
		const em = this.#$.eventManager;

		// find input
		em.addEvent(this.#findInput, 'input', this.#OnFindInput.bind(this));
		em.addEvent(this.#findInput, 'keydown', this.#OnFindKeydown.bind(this));

		// replace input
		em.addEvent(this.#replaceInput, 'keydown', this.#OnReplaceKeydown.bind(this));

		// panel click
		em.addEvent(this.#panel, 'click', this.#OnPanelAction.bind(this));

		// prevent blur on panel interaction + Gecko :active fix
		if (env.isGecko) {
			em.addEvent(this.#panel, 'mousedown', (e) => {
				if (e.target.tagName === 'BUTTON') {
					e.preventDefault();
					const btn = dom.query.getCommandTarget(e.target);
					if (btn) this.#$.eventManager._injectActiveEvent(btn);
				}
				this.#store.set('_preventBlur', true);
			});
		}
	}

	/** @description Debounced search triggered on find input typing. */
	#OnFindInput() {
		if (!this.#$.options.get('finder_liveSearch')) return;
		clearTimeout(this.#searchTimer);
		this.#searchTimer = setTimeout(() => this.#doSearch(), 120);
	}

	/**
	 * @description Find input keydown — ESC to close, Enter/Shift+Enter to navigate.
	 * When liveSearch is off, Enter triggers initial search; subsequent Enter navigates.
	 * @param {KeyboardEvent} e
	 */
	#OnFindKeydown(e) {
		if (e.key === 'Escape') {
			e.preventDefault();
			this.close();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (!this.#$.options.get('finder_liveSearch') && this.#findInput.value !== this.#searchTerm) {
				this.#doSearch();
			} else if (e.shiftKey) {
				this.findPrev();
			} else {
				this.findNext();
			}
		}
	}

	#OnReplaceKeydown(e) {
		if (e.key === 'Escape') {
			e.preventDefault();
			this.close();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			this.#replaceOne();
		}
	}

	/**
	 * @description Panel action function
	 * @param {MouseEvent} e event
	 * @returns
	 */
	#OnPanelAction(e) {
		const eventTarget = dom.query.getEventTarget(e);
		const btn = dom.query.getCommandTarget(eventTarget);
		if (!btn) return;

		e.preventDefault();
		const command = btn.getAttribute('data-command');

		switch (command) {
			case 'prev':
				this.findPrev();
				break;
			case 'next':
				this.findNext();
				break;
			case 'toggle-replace':
				this.#toggleReplace(!this.#isReplaceMode);
				break;
			case 'close':
				this.close();
				break;
			case 'replace':
				this.#replaceOne();
				break;
			case 'replace-all':
				this.#replaceAll();
				break;
			case 'opt-case':
				this.#opts.matchCase = !this.#opts.matchCase;
				dom.utils.toggleClass(this.#btnCase, 'on', this.#opts.matchCase);
				this.#doSearch();
				break;
			case 'opt-word':
				this.#opts.wholeWord = !this.#opts.wholeWord;
				dom.utils.toggleClass(this.#btnWord, 'on', this.#opts.wholeWord);
				this.#doSearch();
				break;
			case 'opt-regex':
				this.#opts.regex = !this.#opts.regex;
				dom.utils.toggleClass(this.#btnRegex, 'on', this.#opts.regex);
				this.#doSearch();
				break;
		}
	}

	/**
	 * @description Toggle replace row visibility. Panel-only.
	 * @param {boolean} show
	 */
	#toggleReplace(show) {
		this.#isReplaceMode = show;
		this.#replaceRow.style.display = show ? '' : 'none';
		dom.utils.toggleClass(this.#panel.querySelector('.se-find-toggle-replace'), 'on', show);
		if (show) {
			this.#replaceInput.focus();
		}
	}

	/**
	 * ──────────────────────────────────────────────────
	 * [ Functions ]
	 * ──────────────────────────────────────────────────
	 */

	/** @description Core search — clear previous, find matches, highlight, update count. */
	#doSearch() {
		const term = this.#findInput ? this.#findInput.value : this.#searchTerm;
		this.#internalUpdate = true;
		this.#clearHighlights();
		this.#matches = [];
		this.#currentIndex = -1;

		if (!term) {
			this.#searchTerm = '';
			this.#updateCount();
			dom.utils.removeClass(this.#findInput, 'se-find-no-match');
			return;
		}

		this.#searchTerm = term;
		const wysiwyg = this.#$.frameContext.get('wysiwyg');
		this.#highlightDoc = this.#getDocument();
		this.#matches = this.#findAllMatches(term, wysiwyg);

		if (this.#matches.length > 0) {
			this.#currentIndex = 0;
			this.#highlightAll();
			this.#goToMatch();
			dom.utils.removeClass(this.#findInput, 'se-find-no-match');
		} else if (this.#findInput) {
			dom.utils.toggleClass(this.#findInput, 'se-find-no-match', term.length > 0);
		}

		this.#updateCount();
		this.#internalUpdate = false;
	}

	/**
	 * @description Find all text matches. Text nodes are concatenated with `\n` between
	 * different line elements to prevent cross-line matching. Single regex execution.
	 * @param {string} term Search term
	 * @param {HTMLElement} root Root element to search within
	 * @returns {Range[]} Array of Range objects
	 */
	#findAllMatches(term, root) {
		const matches = [];
		if (!term || !root) return matches;

		// Build regex
		const flags = this.#opts.matchCase ? 'g' : 'gi';
		let pattern;
		if (this.#opts.regex) {
			try {
				pattern = new RegExp(term, flags);
			} catch {
				return matches;
			}
		} else {
			const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			pattern = this.#opts.wholeWord ? new RegExp(`\\b${escaped}\\b`, flags) : new RegExp(escaped, flags);
		}

		const doc = this.#highlightDoc;
		const format = this.#$.format;

		// Collect text nodes, insert \n between different lines
		const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
		/** @type {Array<{node: Text, start: number}>} */
		const textNodes = [];
		let fullText = '';
		let prevLine = null;
		let tn;

		while ((tn = walker.nextNode())) {
			const line = format.getLine(tn, null) || root;
			if (prevLine && line !== prevLine) fullText += '\n';
			prevLine = line;
			textNodes.push({ node: tn, start: fullText.length });
			fullText += tn.textContent.replace(/\u00A0/g, ' ');
		}

		if (!fullText) return matches;

		// regex search
		pattern.lastIndex = 0;
		let match;
		let nodeIdx = 0;
		while ((match = pattern.exec(fullText)) !== null) {
			if (match[0].length === 0) {
				pattern.lastIndex++;
				continue;
			}

			const mStart = match.index;
			const mEnd = mStart + match[0].length;

			const range = doc.createRange();
			let startSet = false;

			for (let i = nodeIdx; i < textNodes.length; i++) {
				const t = textNodes[i];
				const tEnd = t.start + t.node.textContent.length;

				if (!startSet && mStart >= t.start && mStart < tEnd) {
					range.setStart(t.node, mStart - t.start);
					startSet = true;
					nodeIdx = i;
				}
				if (startSet && mEnd > t.start && mEnd <= tEnd) {
					range.setEnd(t.node, mEnd - t.start);
					break;
				}
			}

			if (startSet) matches.push(range);
		}

		return matches;
	}

	/** @description Apply highlights to all matches (native API or mark fallback). */
	#highlightAll() {
		if (this.#matches.length === 0) return;

		const isIframe = this.#$.frameContext.get('options').get('iframe');

		// CSS Custom Highlight API doesn't work cross-document (iframe).
		if (this.#useNativeHighlight && !isIframe) {
			this.#applyNativeHighlight();
		} else {
			this.#applyMarkFallback();
		}
	}

	/** @description Apply CSS Custom Highlight API highlights. */
	#applyNativeHighlight() {
		Finder.#injectHighlightStyles();
		// eslint-disable-next-line
		const allRanges = new Highlight(...this.#matches);
		CSS.highlights.set('se-find-match', allRanges);
		this.#updateCurrentNativeHighlight();
	}

	/** @description Update the "current match" native highlight. */
	#updateCurrentNativeHighlight() {
		if (this.#currentIndex >= 0 && this.#currentIndex < this.#matches.length) {
			const current = new Highlight(this.#matches[this.#currentIndex]);
			CSS.highlights.set('se-find-current', current);
		} else {
			CSS.highlights.delete('se-find-current');
		}
	}

	/** @description Fallback: wrap matches with `<mark>` elements. */
	#applyMarkFallback() {
		this.#removeMarkElements();

		const doc = this.#highlightDoc;

		// Process matches in reverse to preserve earlier Range positions
		for (let i = this.#matches.length - 1; i >= 0; i--) {
			const range = this.#matches[i];
			const marks = this.#wrapRangeTextNodes(doc, range, i);
			for (let m = 0; m < marks.length; m++) {
				this.#markElements.push(marks[m]);
			}
		}

		this.#markElements.reverse();
		this.#updateCurrentMarkHighlight();
	}

	/**
	 * @description Wrap each text node segment within a Range with a `<mark>`, without extractContents.
	 * @param {Document} doc
	 * @param {Range} range
	 * @param {number} idx - match index
	 * @returns {HTMLElement[]} created mark elements
	 */
	#wrapRangeTextNodes(doc, range, idx) {
		const sc = /** @type {Text} */ (range.startContainer);
		const ec = /** @type {Text} */ (range.endContainer);
		const marks = [];

		if (sc === ec) {
			// Single text node — most common case
			marks.push(this.#wrapTextSegment(doc, sc, range.startOffset, range.endOffset, idx));
		} else {
			// Cross-node: collect text nodes between start and end containers
			const textNodes = [sc];
			let node = sc;
			while (node && node !== ec) {
				node = this.#nextTextNode(node, range.commonAncestorContainer);
				if (node) textNodes.push(node);
			}

			// Wrap in reverse to preserve offsets
			for (let i = textNodes.length - 1; i >= 0; i--) {
				const tn = textNodes[i];
				const start = tn === sc ? range.startOffset : 0;
				const end = tn === ec ? range.endOffset : tn.textContent.length;
				if (start >= end) continue;
				marks.push(this.#wrapTextSegment(doc, tn, start, end, idx));
			}
		}

		return marks;
	}

	/**
	 * @description Wrap a portion of a text node with a `<mark>`.
	 * @param {Document} doc
	 * @param {Text} textNode
	 * @param {number} start
	 * @param {number} end
	 * @param {number} idx
	 * @returns {HTMLElement}
	 */
	#wrapTextSegment(doc, textNode, start, end, idx) {
		const matchNode = start > 0 ? textNode.splitText(start) : textNode;
		if (end - start < matchNode.textContent.length) {
			matchNode.splitText(end - start);
		}

		const mark = doc.createElement('mark');
		mark.className = 'se-find-mark';
		mark.setAttribute('data-se-find-idx', String(idx));
		matchNode.parentNode.insertBefore(mark, matchNode);
		mark.appendChild(matchNode);
		return mark;
	}

	/**
	 * @description Get the next text node in document order within a boundary.
	 * @param {Node} node
	 * @param {Node} boundary
	 * @returns {Text|null}
	 */
	#nextTextNode(node, boundary) {
		let n = node;
		while (n) {
			if (n.firstChild) {
				n = n.firstChild;
			} else {
				while (n && !n.nextSibling) {
					n = n.parentNode;
					if (n === boundary) return null;
				}
				if (!n) return null;
				n = n.nextSibling;
			}
			if (n.nodeType === 3) return /** @type {Text} */ (n);
		}
		return null;
	}

	/** @description Update the "current match" mark element class. */
	#updateCurrentMarkHighlight() {
		for (const m of this.#markElements) {
			dom.utils.removeClass(m, 'se-find-current');
		}
		if (this.#currentIndex >= 0) {
			for (const m of this.#markElements) {
				if (m.getAttribute('data-se-find-idx') === String(this.#currentIndex)) {
					dom.utils.addClass(m, 'se-find-current');
				}
			}
		}
	}

	/** @description Remove all highlights (native + mark). */
	#clearHighlights() {
		const isIframe = this.#$.frameContext.get('options').get('iframe');

		if (this.#useNativeHighlight && !isIframe) {
			CSS.highlights.delete('se-find-match');
			CSS.highlights.delete('se-find-current');
		}

		this.#removeMarkElements();
	}

	/** @description Unwrap all `<mark>` elements and normalize text nodes. */
	#removeMarkElements() {
		const wysiwyg = this.#$.frameContext.get('wysiwyg');
		const marks = wysiwyg.querySelectorAll('mark.se-find-mark');
		if (marks.length === 0) return;

		for (const mark of marks) {
			const parent = mark.parentNode;
			if (!parent) continue;
			while (mark.firstChild) {
				parent.insertBefore(mark.firstChild, mark);
			}
			parent.removeChild(mark);
			parent.normalize();
		}

		this.#markElements = [];
	}

	// ──────────────────────────────────────────────────
	// Navigation
	// ──────────────────────────────────────────────────

	/** @description Scroll to current match and update active highlight. */
	#goToMatch() {
		if (this.#currentIndex < 0 || this.#currentIndex >= this.#matches.length) return;

		const isIframe = this.#$.frameContext.get('options').get('iframe');

		if (this.#useNativeHighlight && !isIframe) {
			// Native highlight: update current highlight and scroll
			this.#updateCurrentNativeHighlight();

			const range = this.#matches[this.#currentIndex];
			this.#$.selection.scrollTo(range, { behavior: 'auto' });
		} else {
			// Mark fallback: update active mark
			this.#updateCurrentMarkHighlight();

			const currentMark = this.#markElements.find((m) => m.getAttribute('data-se-find-idx') === String(this.#currentIndex));
			if (currentMark) {
				this.#$.selection.scrollTo(currentMark, { behavior: 'auto', noFocus: true });
			}
		}

		this.#updateCount();
	}

	// ──────────────────────────────────────────────────
	// Replace
	// ──────────────────────────────────────────────────

	/**
	 * @description Replace current match, then re-search.
	 * @param {string} [replaceText] Falls back to replace input value if omitted.
	 */
	#replaceOne(replaceText) {
		if (this.#currentIndex < 0 || this.#matches.length === 0) return;

		this.#clearHighlights();

		// Re-search to get fresh ranges
		const wysiwyg = this.#$.frameContext.get('wysiwyg');
		const freshMatches = this.#findAllMatches(this.#searchTerm, wysiwyg);
		if (this.#currentIndex >= freshMatches.length) return;

		this.#replaceRange(freshMatches[this.#currentIndex], replaceText ?? (this.#replaceInput ? this.#replaceInput.value : ''));
		this.#$.history.push(false);

		// Re-search
		this.#doSearch();
		if (this.#currentIndex >= this.#matches.length && this.#matches.length > 0) {
			this.#currentIndex = 0;
			this.#goToMatch();
		}
	}

	/**
	 * @description Replace all matches in reverse order, then re-search.
	 * @param {string} [replaceText] Falls back to replace input value if omitted.
	 */
	#replaceAll(replaceText) {
		if (this.#matches.length === 0) return;

		this.#clearHighlights();

		const wysiwyg = this.#$.frameContext.get('wysiwyg');
		const freshMatches = this.#findAllMatches(this.#searchTerm, wysiwyg);
		if (freshMatches.length === 0) return;

		replaceText = replaceText ?? (this.#replaceInput ? this.#replaceInput.value : '');

		// Replace in reverse order to preserve earlier positions
		for (let i = freshMatches.length - 1; i >= 0; i--) {
			this.#replaceRange(freshMatches[i], replaceText);
		}

		wysiwyg.normalize();
		this.#$.history.push(false);

		// Re-search (should find 0)
		this.#doSearch();
	}

	/**
	 * @description Replace a range's content with text.
	 * For cross-node ranges (e.g. `<b>1</b>23` matching "123"), the replacement text
	 * is inserted at the start node position, and the matched content across all spanned
	 * nodes is removed cleanly.
	 * @param {Range} range The range to replace
	 * @param {string} replaceText Replacement string
	 */
	#replaceRange(range, replaceText) {
		const startNode = range.startContainer;
		const doc = this.#highlightDoc;
		const textNode = doc.createTextNode(replaceText);

		if (startNode === range.endContainer) {
			// Simple case: same text node
			range.deleteContents();
			range.insertNode(textNode);
			startNode.parentNode?.normalize();
			return;
		}

		// Cross-node range: replace based on start node position
		// 1. Delete matched content
		range.deleteContents();

		// 2. Insert replacement text at start position
		if (startNode.nodeType === 3) {
			// Insert after the remaining text in the start node
			if (startNode.parentNode) {
				startNode.parentNode.insertBefore(textNode, startNode.nextSibling);
				startNode.parentNode.normalize();
			}
		} else {
			range.insertNode(textNode);
			textNode.parentNode?.normalize();
		}
	}

	// ──────────────────────────────────────────────────
	// Helpers
	// ──────────────────────────────────────────────────

	/** @description Update match count display and prev/next button state. Panel-only. */
	#updateCount() {
		if (!this.#panel) return;
		const hasMatches = this.#matches.length > 0;
		if (hasMatches) {
			this.#countDisplay.textContent = `${this.#currentIndex + 1}/${this.#matches.length}`;
		} else {
			this.#countDisplay.textContent = this.#searchTerm ? '0' : '';
		}

		this.#btnPrev.disabled = !hasMatches;
		this.#btnNext.disabled = !hasMatches;
		this.#btnReplace.disabled = !hasMatches;
		this.#btnReplaceAll.disabled = !hasMatches;
	}

	/**
	 * @description Get the document object for the current frame (iframe or main document).
	 * @returns {Document}
	 */
	#getDocument() {
		const fc = this.#$.frameContext;
		return fc.get('options').get('iframe') ? fc.get('_wd') : _d;
	}

	/** @internal */
	_destroy() {
		this.#removeGlobalCloseEvent();
		this.#removeContentInputListener();
		this.#resizeObserver &&= this.#resizeObserver.disconnect();
		clearTimeout(this.#searchTimer);
	}
}

/**
 * @description Creates the FindFa/Replace panel HTML.
 * @param {SunEditor.Deps} $ editor deps
 * @returns {{
 * 	panel: HTMLElement,
 * 	findInput: HTMLInputElement,
 * 	replaceInput: HTMLInputElement,
 * 	countDisplay: HTMLElement,
 * 	replaceRow: HTMLElement,
 * 	btnCase: HTMLButtonElement,
 * 	btnWord: HTMLButtonElement,
 * 	btnRegex: HTMLButtonElement,
 * 	btnPrev: HTMLButtonElement,
 * 	btnNext: HTMLButtonElement
 * 	btnReplace: HTMLButtonElement
 * 	btnReplaceAll: HTMLButtonElement
 * }}
 */
function CreateHTML({ lang, icons }) {
	const html = /*html*/ `
	<div class="se-find-replace-row">
		<div class="se-find-input-wrapper">
			<input class="se-find-replace-input" type="text" placeholder="${lang.find || 'Find'}" spellcheck="false" autocomplete="off" />
			<div class="se-find-replace-toggle">
				<div class="se-find-replace-info">
					<span class="se-find-replace-count"></span>
				</div>
				<button class="se-btn se-find-replace-btn se-find-opt-case" type="button" data-command="opt-case" title="${lang.finder_matchCase}">
					${icons.match_case}
				</button>
				<button class="se-btn se-find-replace-btn se-find-opt-word" type="button" data-command="opt-word" title="${lang.finder_wholeWord}">
					${icons.whole_word}
				</button>
				<button class="se-btn se-find-replace-btn se-find-opt-regex" type="button" data-command="opt-regex" title="${lang.finder_regex}">
					${icons.regex}
				</button>
			</div>
		</div>
		<div class="se-find-replace-buttons">
			<button class="se-btn se-find-replace-btn" type="button" data-command="prev" title="${lang.finder_prev}\n(${env.shiftIcon} + Enter)">
				${icons.arrow_up_small}
			</button>
			<button class="se-btn se-find-replace-btn" type="button" data-command="next" title="${lang.finder_next}\n(Enter)">
				${icons.arrow_down_small}
			</button>
			<button class="se-btn se-find-replace-btn se-find-toggle-replace" type="button" data-command="toggle-replace" title="${lang.replace}">
				${icons.swap_vert}
			</button>
			<button class="se-btn se-find-replace-btn" type="button" data-command="close" title="${lang.close}">
				${icons.cancel}
			</button>
		</div>
	</div>
	<div class="se-find-replace-row se-find-replace-row-replace">
		<div class="se-find-input-wrapper">
			<input class="se-find-replace-input se-replace-input" type="text" placeholder="${lang.replace}" spellcheck="false" autocomplete="off" />
		</div>
		<div class="se-find-replace-buttons">
			<button class="se-btn se-find-replace-btn" type="button" data-command="replace" title="${lang.replace}\n(Enter)">
				${icons.replaceText}
			</button>
			<button class="se-btn se-find-replace-btn" type="button" data-command="replace-all" title="${lang.replaceAll}">
				${icons.relaceTextAll}
			</button>
		</div>
	</div>`;

	const panel = dom.utils.createElement('DIV', { class: 'se-find-replace' }, html);

	return {
		panel,
		findInput: panel.querySelector('.se-find-replace-input'),
		replaceInput: panel.querySelector('.se-replace-input'),
		countDisplay: panel.querySelector('.se-find-replace-count'),
		replaceRow: panel.querySelector('.se-find-replace-row-replace'),
		btnCase: panel.querySelector('.se-find-opt-case'),
		btnWord: panel.querySelector('.se-find-opt-word'),
		btnRegex: panel.querySelector('.se-find-opt-regex'),
		btnPrev: panel.querySelector('[data-command="prev"]'),
		btnNext: panel.querySelector('[data-command="next"]'),
		btnReplace: panel.querySelector('[data-command="replace"]'),
		btnReplaceAll: panel.querySelector('[data-command="replace-all"]'),
	};
}

export default Finder;
