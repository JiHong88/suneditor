import { dom, unicode, env, numbers } from '../../../helper';
const { _w } = env;

/**
 * @description Selection, Range related class
 */
class Selection_ {
	#kernel;
	#$;
	#store;

	#shadowRoot;
	#instanceCheck;
	#context;
	#frameContext;
	#options;
	#frameOptions;

	#scrollMargin = 0;
	#hasScrollParents = false;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel) {
		this.#kernel = kernel;
		this.#$ = kernel.$;
		this.#store = kernel.store;

		this.#shadowRoot = this.#$.contextProvider.shadowRoot;
		this.#instanceCheck = this.#$.instanceCheck;
		this.#context = this.#$.context;
		this.#frameContext = this.#$.frameContext;
		this.#options = this.#$.options;
		this.#frameOptions = this.#$.frameOptions;

		// members
		/** @type {Range} */
		this.range = null;
		/** @type {HTMLElement|Text} */
		this.selectionNode = null;

		/** @internal */
		this.__iframeFocus = false;
	}

	/**
	 * @description Get window selection obejct
	 * @returns {Selection}
	 */
	get() {
		let selection = null;

		if (typeof this.#shadowRoot?.getSelection === 'function') {
			selection = this.#shadowRoot.getSelection();
		} else {
			selection = this.#frameContext.get('_ww').getSelection();
		}

		if (!selection) return null;
		if (!this.#store.get('_range') && !this.#frameContext.get('wysiwyg').contains(selection.focusNode)) {
			selection.removeAllRanges();
			selection.addRange(this.#createDefaultRange());
		}
		return selection;
	}

	/**
	 * @description Check if the range object is valid
	 * @param {*} range Range object
	 * @returns {range is Range}
	 */
	isRange(range) {
		// return /Range/.test(Object.prototype.toString.call(range?.__proto__));
		return this.#instanceCheck.isRange(range);
	}

	/**
	 * @description Get current editor's range object
	 * @returns {Range}
	 */
	getRange() {
		const range = this.#store.get('_range') || this.#createDefaultRange();
		const selection = this.get();
		if (range.collapsed === selection.isCollapsed || !this.#frameContext.get('wysiwyg').contains(selection.focusNode)) {
			if (this.#$.component.is(range.startContainer)) {
				const compInfo = this.#$.component.get(range.startContainer);
				const container = compInfo?.container;
				if (!container) return range;
				return this.setRange(container, 0, container, 1);
			}

			return range;
		}

		if (selection.rangeCount > 0) {
			const selectionRange = selection.getRangeAt(0);
			this.#store.set('_range', selectionRange);
			return selectionRange;
		} else {
			const sc = selection.anchorNode,
				ec = selection.focusNode,
				so = selection.anchorOffset,
				eo = selection.focusOffset;
			const compareValue = dom.query.compareElements(sc, ec);
			const rightDir = compareValue.ancestor && (compareValue.result === 0 ? so <= eo : compareValue.result > 1 ? true : false);
			return this.setRange(rightDir ? sc : ec, rightDir ? so : eo, rightDir ? ec : sc, rightDir ? eo : so);
		}
	}

	/**
	 * @description Set current editor's range object and return.
	 * @param {Node|Range} startCon Range object or The `startContainer` property of the selection object
	 * @param {number} [startOff] The `startOffset` property of the selection object.
	 * @param {Node} [endCon] The `endContainer` property of the selection object.
	 * @param {number} [endOff] The `endOffset` property of the selection object.
	 * @returns {Range}
	 * @example
	 * // Set range using container and offset
	 * const textNode = editor.selection.getNode();
	 * editor.selection.setRange(textNode, 0, textNode, 5);
	 *
	 * // Set range using Range object
	 * const range = document.createRange();
	 * range.selectNodeContents(someElement);
	 * editor.selection.setRange(range);
	 *
	 * // Collapse cursor to start of element
	 * editor.selection.setRange(element, 0, element, 0);
	 */
	setRange(startCon, startOff, endCon, endOff) {
		/** @type {Node} */
		let sc;
		/** @type {number} */
		let so;
		/** @type {Node} */
		let ec;
		/** @type {number} */
		let eo;

		if (this.isRange(startCon)) {
			const r = /** @type {Range} */ (startCon);
			sc = r.startContainer;
			so = r.startOffset;
			ec = r.endContainer;
			eo = r.endOffset;
		} else {
			sc = /** @type {Node} */ (startCon);
			so = startOff;
			ec = endCon;
			eo = endOff;
		}

		if (!sc || !ec) return;
		if ((dom.check.isBreak(sc) || sc.nodeType === 3) && so > sc.textContent.length) so = sc.textContent.length;
		if ((dom.check.isBreak(ec) || ec.nodeType === 3) && eo > ec.textContent.length) eo = ec.textContent.length;
		if (this.#$.format.isLine(sc)) {
			sc = sc.childNodes[so > 0 ? sc.childNodes.length - 1 : 0] || sc;
			so = so > 0 ? (sc.nodeType === 1 && !dom.check.isBreak(sc) ? 1 : sc.textContent ? sc.textContent.length : 0) : 0;
		}
		if (this.#$.format.isLine(ec)) {
			ec = ec.childNodes[eo > 0 ? ec.childNodes.length - 1 : 0] || ec;
			eo = eo > 0 ? (ec.nodeType === 1 && !dom.check.isBreak(ec) ? 1 : ec.textContent ? ec.textContent.length : 0) : 0;
		}

		const range = this.#frameContext.get('_wd').createRange();

		try {
			so = Math.min(so, sc.textContent?.length || 0);
			eo = eo > 0 && (ec.textContent?.length || 0) === 0 && ec.nodeType === 1 ? 1 : Math.min(Math.max(eo, 0), ec.textContent?.length || 0);
			range.setStart(sc, so);
			range.setEnd(ec, eo);
			this.#store.set('hasFocus', true);
		} catch (error) {
			console.warn('[SUNEDITOR.selection.focus.warn]', error.message);
			this.#$.focusManager.nativeFocus();
			return;
		}

		const selection = this.get();

		if (selection.removeAllRanges) {
			selection.removeAllRanges();
		}

		selection.addRange(range);
		this.#store.set('_range', range);
		this.#rangeInfo(range, this.get());

		if (this.#frameOptions.get('iframe')) this.__focus();

		return range;
	}

	/**
	 * @description Remove range object and button effect
	 */
	removeRange() {
		this.#store.set('_range', null);
		this.#store.set('_lastSelectionNode', null);
		this.selectionNode = null;
		if (this.#store.get('hasFocus')) this.get().removeAllRanges();
		this.#kernel._eventOrchestrator.selectionState.reset();
	}

	/**
	 * @description Returns the range (container and offset) near the given target node.
	 * - If the target node has a next sibling, it returns the next sibling with an offset of 0.
	 * - If there is no next sibling but a previous sibling exists, it returns the previous sibling with an offset of 1.
	 * @param {Node} target Target node whose neighboring range is to be determined.
	 * @returns {{container: Node, offset: number}|null} An object containing the nearest container node and its offset.
	 */
	getNearRange(target) {
		const next = target.nextSibling;
		const prev = target.previousSibling;
		if (next) {
			return {
				container: next,
				offset: 0,
			};
		} else if (prev) {
			return {
				container: prev,
				offset: 1,
			};
		}

		return null;
	}

	/**
	 * @description If the `range` object is a non-editable area, add a line at the top of the editor and update the `range` object.
	 * @param {Range} range core.getRange()
	 * @param {?Node} [container] If there is `container` argument, it creates a line in front of the container.
	 * @returns {Range} a new `range` or argument `range`.
	 */
	getRangeAndAddLine(range, container) {
		if (this.#isNone(range)) {
			const parent = container?.parentElement || this.#frameContext.get('wysiwyg');
			const op = dom.utils.createElement(this.#options.get('defaultLine'), null, '<br>');
			parent.insertBefore(op, container && container !== parent ? (!(/** @type {HTMLElement} */ (container).previousElementSibling) ? container : /** @type {HTMLElement} */ (container).nextElementSibling) : parent.firstElementChild);
			this.setRange(op.firstElementChild, 0, op.firstElementChild, 1);
			range = this.#store.get('_range');
		}
		return range;
	}

	/**
	 * @description Get current select node
	 * @returns {HTMLElement|Text}
	 */
	getNode() {
		if (!this.#frameContext.get('wysiwyg').contains(this.selectionNode)) this.init();
		if (!this.selectionNode) {
			const selectionNode = /** @type {HTMLElement|Text} */ (dom.query.getEdgeChild(this.#frameContext.get('wysiwyg').firstChild, (current) => current.childNodes.length === 0 || current.nodeType === 3, false));
			if (!selectionNode) {
				this.init();
			} else {
				this.selectionNode = selectionNode;
				return selectionNode;
			}
		}
		return this.selectionNode;
	}

	/**
	 * @description Get the Rects object.
	 * @param {?(Range|Node)} target `Range` | `Node` | `null`
	 * @param {"start"|"end"} position It is based on the position of the rect object to be returned in case of range selection.
	 * @returns {{rects: import('./offset').RectsInfo, position: "start"|"end", scrollLeft: number, scrollTop: number}}
	 * @example
	 * // Get rects at start of selection
	 * const { rects, position, scrollLeft, scrollTop } = editor.selection.getRects(null, 'start');
	 * console.log(rects.left, rects.top, rects.right, rects.bottom);
	 *
	 * // Get rects for specific node
	 * const node = editor.selection.getNode();
	 * const rectsInfo = editor.selection.getRects(node, 'end');
	 *
	 * // Use rects for positioning UI elements
	 * const { rects } = editor.selection.getRects(null, 'start');
	 * tooltip.style.left = rects.left + 'px';
	 * tooltip.style.top = rects.top + 'px';
	 */
	getRects(target, position) {
		const targetAbs = dom.check.isElement(/** @type {Node} */ (target)) ? _w.getComputedStyle(target).position === 'absolute' : false;
		target = /** @type {Range} */ (!target || dom.check.isText(/** @type {Node} */ (target)) ? this.getRange() : target);
		let isStartPosition = position === 'start';
		let scrollLeft = _w.scrollX;
		let scrollTop = _w.scrollY;

		let rects = /** @type {*} */ (target).getClientRects();
		rects = rects[isStartPosition ? 0 : rects.length - 1];

		if (!rects) {
			const node = this.getNode();
			if (this.#$.format.isLine(node)) {
				const zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
				this.#$.html.insertNode(zeroWidth, { afterNode: null, skipCharCount: true });
				this.setRange(zeroWidth, 1, zeroWidth, 1);
				this.init();
				rects = this.getRange().getClientRects();
				rects = rects[isStartPosition ? 0 : rects.length - 1];
			}

			if (!rects) {
				const nodeOffset = this.#$.offset.get(node);
				rects = {
					left: nodeOffset.left,
					top: nodeOffset.top,
					right: nodeOffset.left + /** @type {HTMLElement} */ (node).offsetWidth,
					bottom: nodeOffset.top + /** @type {HTMLElement} */ (node).offsetHeight,
					noText: true,
				};
				scrollLeft = 0;
				scrollTop = 0;
			}

			isStartPosition = true;
		}

		const iframeRects = /^iframe$/i.test(this.#frameContext.get('wysiwygFrame').nodeName) ? this.#frameContext.get('wysiwygFrame').getClientRects()[0] : null;
		if (!targetAbs && iframeRects) {
			rects = {
				left: rects.left + iframeRects.left,
				top: rects.top + iframeRects.top,
				right: rects.right + iframeRects.right - iframeRects.width,
				bottom: rects.bottom + iframeRects.bottom - iframeRects.height,
			};
		}

		return {
			rects: rects,
			position: isStartPosition ? 'start' : 'end',
			scrollLeft: scrollLeft,
			scrollTop: scrollTop,
		};
	}

	/**
	 * @description Get the custom range object of the event.
	 * @param {DragEvent} e Event object
	 * @returns {{sc: Node, so: number, ec: Node, eo: number}} {sc: `startContainer`, so: `startOffset`, ec: `endContainer`, eo: `endOffset`}
	 */
	getDragEventLocationRange(e) {
		const wd = this.#frameContext.get('_wd');
		let r, sc, so, ec, eo;

		if (wd.caretPositionFromPoint) {
			r = wd.caretPositionFromPoint(e.clientX, e.clientY);
			sc = r.offsetNode;
			so = r.offset;
			ec = r.offsetNode;
			eo = r.offset;
		} else if (wd.caretRangeFromPoint) {
			r = wd.caretRangeFromPoint(e.clientX, e.clientY);
			sc = r.startContainer;
			so = r.startOffset;
			ec = r.endContainer;
			eo = r.endOffset;
		}

		return {
			sc,
			so,
			ec,
			eo,
		};
	}

	/**
	 * @description Scroll to the corresponding selection or range position.
	 * @param {Selection|Range|Node} ref selection or range object
	 * @param {Object<string, *>} [scrollOption] option of scrollTo
	 * @example
	 * // Scroll to current selection smoothly
	 * editor.selection.scrollTo(editor.selection.get());
	 *
	 * // Scroll to specific node
	 * const targetNode = document.querySelector('.target-element');
	 * editor.selection.scrollTo(targetNode);
	 *
	 * // Scroll with custom options
	 * editor.selection.scrollTo(editor.selection.getRange(), {
	 *   behavior: 'auto',
	 *   block: 'center'
	 * });
	 */
	scrollTo(ref, scrollOption) {
		if (this.#instanceCheck.isSelection(ref)) {
			ref = ref.getRangeAt(0);
		} else if (this.#instanceCheck.isNode(ref)) {
			ref = this.setRange(ref, 1, ref, 1);
		} else if (typeof ref?.startContainer === 'undefined') {
			console.warn('[SUNEDITOR.html.scrollTo.warn] "selectionRange" must be Selection or Range or Node object.', ref);
		}

		const el = dom.query.getParentElement(ref?.startContainer, (current) => current.nodeType === 1);
		if (!el) return;

		scrollOption = { behavior: 'smooth', block: 'nearest', inline: 'nearest', ...scrollOption };

		const ww = this.#frameContext.get('_ww');
		const wwFrame = this.#frameContext.get('wysiwygFrame');
		const isIframe = this.#frameOptions.get('iframe');
		const isAutoHeight = !this.#store.get('isScrollable')(this.#frameContext);
		const viewportHeight = this.#store.get('currentViewportHeight');
		const scrollY = isAutoHeight ? _w.scrollY : isIframe ? ww.scrollY : wwFrame.scrollTop;
		const realToolbarHeight = this.#context.get('toolbar_main').offsetHeight;
		const toolbarHeight = this.#$.toolbar.isSticky ? realToolbarHeight : 0;
		const positionToolbarHeight = this.#$.toolbar.isSticky ? toolbarHeight + this.#options.get('toolbar_sticky') : toolbarHeight;
		const statusbarHeight = this.#frameContext.get('statusbar')?.offsetHeight || 0;

		if (this.#hasScrollParents) {
			el?.scrollIntoView(scrollOption);

			if (scrollOption?.behavior === 'auto' && scrollY !== _w.scrollY) {
				if (positionToolbarHeight && scrollY > _w.scrollY) {
					_w.scrollBy(0, -positionToolbarHeight);
				} else if (isAutoHeight) {
					_w.scrollBy(0, statusbarHeight);
				}
			}

			return;
		}

		// --- When there is no upper scroll and it is an iframe ---
		const PADDING = this.#scrollMargin;
		const viewHeight = isAutoHeight ? viewportHeight : wwFrame.offsetHeight;
		const elH = el.offsetHeight || 0;

		const behavior = scrollOption?.behavior;
		if (isAutoHeight) {
			if (isIframe) {
				const rect = this.getRects(ref, 'end').rects;
				const topMargin = rect.top + elH - positionToolbarHeight;
				const bottomMargin = viewHeight - PADDING - (rect.top + elH);
				if (topMargin >= 0 && bottomMargin >= 0) return;

				const newScrollTop = scrollY - (topMargin < 0 ? -(topMargin - PADDING) : bottomMargin);
				_w.scrollTo({
					top: newScrollTop < scrollY ? newScrollTop - positionToolbarHeight : newScrollTop,
					behavior,
				});
			} else {
				const rect = this.#$.offset.getGlobal(el);
				const scrollMargin = viewHeight + scrollY - rect.top - elH;

				if (scrollMargin - PADDING > 0 && viewHeight > scrollMargin + PADDING + positionToolbarHeight) return;

				const newScrollTop = scrollMargin <= PADDING ? scrollY - scrollMargin + PADDING + statusbarHeight : scrollY - scrollMargin + (viewHeight - elH - PADDING);
				_w.scrollTo({
					top: newScrollTop < scrollY ? newScrollTop - positionToolbarHeight : newScrollTop,
					behavior,
				});
			}
		} else {
			// local scroll
			const { rects } = this.getRects(el, 'start');
			const { top } = this.#$.offset.getLocal(el);
			const innerTop = top < 0 && rects.top < 0 ? top : rects.top;

			const keepLocalScroll = innerTop - PADDING > 0 && innerTop + PADDING <= viewHeight;
			const rectScroll = innerTop - PADDING > 0 ? innerTop + PADDING - viewHeight : innerTop - (toolbarHeight + elH);
			let newScrollTop = scrollY + rectScroll;

			// frame scroll
			const gy = _w.scrollY;
			const globalRect = this.#$.offset.getGlobal();
			const topMargin = gy - globalRect.top + realToolbarHeight;
			const bottomMargin = globalRect.top + globalRect.height - (gy + viewportHeight) + realToolbarHeight;

			// set frame scroll
			if (topMargin > 0) {
				const newFrameY = (keepLocalScroll ? innerTop : innerTop + scrollY - newScrollTop) - elH - PADDING - topMargin;
				if (newFrameY < 0) {
					newScrollTop += realToolbarHeight;
					_w.scrollTo({
						top: gy + newFrameY,
						behavior: 'smooth',
					});
				}
			}
			if (bottomMargin > 0) {
				const newFrameY = (keepLocalScroll ? innerTop : innerTop + scrollY - newScrollTop) + elH + PADDING - (globalRect.height - bottomMargin);
				if (newFrameY > 0) {
					newScrollTop += statusbarHeight;
					_w.scrollTo({
						top: gy + newFrameY,
						behavior: 'smooth',
					});
				}
			}

			// set local scroll
			if (!keepLocalScroll) {
				(isIframe ? ww : wwFrame).scrollTo({
					top: newScrollTop,
					behavior,
				});
			}
		}
	}

	/**
	 * @description Normalizes and resets the selection range to properly target text nodes instead of element nodes for accurate text editing.
	 * @returns {boolean} Returns `false` if there is no valid selection.
	 */
	resetRangeToTextNode() {
		let rangeObj = this.getRange();
		if (this.#isNone(rangeObj)) {
			if (!dom.check.isWysiwygFrame(rangeObj.startContainer) || !dom.check.isWysiwygFrame(rangeObj.endContainer)) return false;
			const ww = /** @type {HTMLElement} */ (rangeObj.commonAncestorContainer);
			const first = ww.children[rangeObj.startOffset];
			const end = ww.children[rangeObj.endOffset];
			if (!(rangeObj = this.setRange(first, 0, end, first === end ? 0 : 1))) return false;
		}

		const range = rangeObj;
		const collapsed = range.collapsed;
		let startCon = range.startContainer;
		let startOff = range.startOffset;
		let endCon = range.endContainer;
		let endOff = range.endOffset;
		let tempCon, tempOffset, tempChild;

		if (this.#$.format.isLine(startCon)) {
			if (!startCon.childNodes[startOff]) {
				startCon = startCon.lastChild || startCon;
				startOff = startCon.textContent.length;
			} else {
				startCon = startCon.childNodes[startOff] || startCon;
				startOff = 0;
			}
			while (startCon?.nodeType === 1 && startCon.firstChild) {
				startCon = startCon.firstChild || startCon;
				startOff = 0;
			}
		}
		if (this.#$.format.isLine(endCon)) {
			endCon = endCon.childNodes[endOff] || endCon.lastChild || endCon;
			while (endCon?.nodeType === 1 && endCon.lastChild) {
				endCon = endCon.lastChild;
			}
			if (collapsed) endOff = 0;
			else if (endOff > 0) endOff = endCon.textContent.length;
		}

		// startContainer
		tempCon = dom.check.isWysiwygFrame(startCon) ? this.#frameContext.get('wysiwyg').firstChild : startCon;
		tempOffset = startOff;

		if (dom.check.isBreak(tempCon) || (tempCon.nodeType === 1 && tempCon.childNodes.length > 0)) {
			const onlyBreak = dom.check.isBreak(tempCon);
			if (!onlyBreak) {
				const tempConCache = tempCon;
				while (tempCon && !dom.check.isBreak(tempCon) && tempCon.nodeType === 1) {
					tempChild = tempCon.childNodes;
					if (tempChild.length === 0) break;
					tempCon =
						tempChild[tempOffset > 0 ? tempOffset - 1 : tempOffset] || !/FIGURE/i.test(tempChild[0].nodeName) ? tempChild[0] : /** @type {HTMLElement} */ (tempCon).previousElementSibling || tempCon.previousSibling || startCon;
					tempOffset = tempOffset > 0 ? tempCon.textContent.length : tempOffset;
				}

				let format = this.#$.format.getLine(tempCon, null);
				if (format === this.#$.format.getBlock(format, null)) {
					tempCon ||= tempConCache;
					format = dom.utils.createElement(dom.query.getParentElement(tempCon, dom.check.isTableCell) ? 'DIV' : this.#options.get('defaultLine'));
					tempCon.parentNode.insertBefore(format, tempCon);
					if (tempCon !== tempConCache) format.appendChild(tempCon);
				}
			}

			if (dom.check.isBreak(tempCon) || this.#$.component.is(tempCon)) {
				const emptyText = dom.utils.createTextNode(unicode.zeroWidthSpace);
				tempCon.parentNode.insertBefore(emptyText, tempCon);
				tempCon = emptyText;
				if (onlyBreak) {
					if (startCon === endCon) {
						endCon = tempCon;
						endOff = 1;
					}
				}
			}
		}

		// set startContainer
		startCon = tempCon;
		startOff = tempOffset;

		// endContainer
		tempCon = dom.check.isWysiwygFrame(endCon) ? this.#frameContext.get('wysiwyg').lastChild : endCon;
		tempOffset = endOff;

		if (dom.check.isBreak(tempCon) || (tempCon.nodeType === 1 && tempCon.childNodes.length > 0)) {
			const onlyBreak = dom.check.isBreak(tempCon);
			if (!onlyBreak) {
				while (tempCon && !dom.check.isBreak(tempCon) && tempCon.nodeType === 1) {
					tempChild = tempCon.childNodes;
					if (tempChild.length === 0) break;
					tempCon =
						tempChild[tempOffset > 0 ? tempOffset - 1 : tempOffset] || !/FIGURE/i.test(tempChild[0].nodeName) ? tempChild[0] : /** @type {HTMLElement} */ (tempCon).previousElementSibling || tempCon.previousSibling || startCon;
					tempOffset = tempOffset > 0 ? tempCon.textContent.length : tempOffset;
				}

				let format = this.#$.format.getLine(tempCon, null);
				if (format === this.#$.format.getBlock(format, null)) {
					format = dom.utils.createElement(dom.check.isTableCell(format) ? 'DIV' : this.#options.get('defaultLine'));
					tempCon.parentNode.insertBefore(format, tempCon);
					format.appendChild(tempCon);
				}
			}

			if (dom.check.isBreak(tempCon)) {
				const emptyText = dom.utils.createTextNode(unicode.zeroWidthSpace);
				tempCon.parentNode.insertBefore(emptyText, tempCon);
				tempCon = emptyText;
				tempOffset = 1;
				if (onlyBreak && !tempCon.previousSibling) {
					dom.utils.removeItem(endCon);
				}
			}
		}

		// set endContainer
		endCon = tempCon;
		endOff = tempOffset;

		// set Range
		this.setRange(startCon, startOff, endCon, endOff);
		return true;
	}

	/**
	 * @description Saving the range object and the currently selected node of editor
	 */
	init() {
		const activeEl = this.#frameContext.get('_wd').activeElement;
		if (dom.check.isInputElement(activeEl)) {
			this.selectionNode = activeEl;
			return activeEl;
		}

		const selection = this.get();

		if (!selection) return null;
		let range = null;

		if (selection.rangeCount > 0) {
			range = selection.getRangeAt(0);
		} else {
			range = this.#createDefaultRange();
		}

		this.#rangeInfo(range, selection);
	}

	/**
Ï	 * @description Set `range` and `selection` info.
	 * @param {Range} range range object.
	 * @param {Selection} selection selection object.
	 */
	#rangeInfo(range, selection) {
		let selectionNode = null;
		this.#store.set('_range', range);

		if (range.collapsed) {
			if (dom.check.isWysiwygFrame(range.commonAncestorContainer)) selectionNode = range.commonAncestorContainer.children[range.startOffset] || range.commonAncestorContainer;
			else selectionNode = range.commonAncestorContainer;
		} else {
			selectionNode = selection.anchorNode;
		}

		this.selectionNode = /** @type {HTMLElement|Text} */ (selectionNode);
	}

	/**
	 * @description Returns `true` if there is no valid selection.
	 * @param {Range} range selection.getRange()
	 * @returns {boolean}
	 */
	#isNone(range) {
		const comm = /** @type {HTMLElement} */ (range.commonAncestorContainer);
		return (
			(dom.check.isWysiwygFrame(range.startContainer) && dom.check.isWysiwygFrame(range.endContainer)) ||
			/FIGURE/i.test(comm.nodeName) ||
			(this.#$.pluginManager.fileInfo.regExp.test(comm.nodeName) && (!this.#$.pluginManager.fileInfo.tagAttrs[comm.nodeName] || this.#$.pluginManager.fileInfo.tagAttrs[comm.nodeName]?.every((v) => comm.hasAttribute(v)))) ||
			this.#$.component.is(comm)
		);
	}

	/**
	 * @description Return the range object of editor's first child node
	 * @returns {Range}
	 */
	#createDefaultRange() {
		const wysiwyg = this.#frameContext.get('wysiwyg');
		const range = this.#frameContext.get('_wd').createRange();

		let firstFormat = wysiwyg.firstElementChild;
		let focusEl = null;
		if (!firstFormat) {
			focusEl = dom.utils.createElement('BR');
			firstFormat = dom.utils.createElement(this.#options.get('defaultLine'), null, focusEl);
			wysiwyg.appendChild(firstFormat);
		} else {
			focusEl = firstFormat.firstChild;
			if (!focusEl) {
				focusEl = dom.utils.createElement('BR');
				firstFormat.appendChild(focusEl);
			}
		}

		range.setStart(focusEl, 0);
		range.setEnd(focusEl, 0);

		return range;
	}

	/**
	 * @internal
	 * @description Sets focus to the editor's wysiwyg contenteditable area and restores the last selection range within iframe context.
	 */
	__focus() {
		try {
			this.__iframeFocus = true;
			const caption = dom.query.getParentElement(this.getNode(), 'figcaption');
			if (caption) {
				caption.focus();
			} else {
				this.#frameContext.get('wysiwyg').focus();
			}
		} finally {
			// Defer flag reset — iframe.focus() triggers synchronous focus/blur events that check this flag
			_w.setTimeout(() => (this.__iframeFocus = false), 0);
		}
	}

	/**
	 * @internal
	 * @description Initialize the scroll information when the editor first loads
	 */
	__init() {
		this.#hasScrollParents = this.#kernel._eventOrchestrator.scrollparents?.length > 0;
		this.#scrollMargin = !this.#frameContext?.get('wysiwyg')
			? 40
			: (numbers.get(_w.getComputedStyle(this.#frameContext.get('wysiwyg')).scrollMargin, 0) || 40) + numbers.get(_w.getComputedStyle(this.#frameContext.get('wrapper')).paddingBottom, 0);
	}
}

export default Selection_;
