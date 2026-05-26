import { dom, env } from '../../../helper';
import { resolveBlock } from './blockResolver';
import { ResolveButton } from '../../section/constructor';
import SelectMenu from '../../../modules/ui/SelectMenu.js';

const { _w } = env;

/**
 * @class
 * @description Block handle UI — appears in the left gutter on block hover.
 */
class BlockHandle {
	#$;

	#area;
	#handle;
	#plusBtn;
	#dragBtn;
	#menuConfig;

	/** @type {SelectMenu|null} */
	#actionMenu = null;
	/** @type {HTMLElement|null} */
	#currentBlock = null;
	/** @type {number|null} */
	#rafId = null;
	/** @type {Node|null} */
	#pendingTarget = null;
	/** @type {number|undefined} */
	#pendingMouseY = undefined;
	/** @type {number|null} */
	#hideTimer = null;
	/** @type {HTMLElement[]} */
	#hoverLines = [];

	// Drag state
	/** @type {boolean} */
	#isDragging = false;
	/** @type {{x: number, y: number}|null} */
	#dragStartPos = null;
	/** @type {HTMLElement|null} */
	#dragIndicator = null;
	/** @type {HTMLElement|null} */
	#dragTarget = null;
	/** @type {{element: HTMLElement, position: 'before'|'after'}|null} */
	#dropTarget = null;

	// Free dropdown (table, fontColor, etc.) — opened as a flyout next to the action menu
	/** @type {{ dropdown: HTMLElement, plugin: Object|null, originalParent: Node|null, anchorLi: HTMLElement|null, onClick: (e: Event) => void }|null} */
	#freeDropdownState = null;

	// Bound handlers for cleanup
	#boundPlusClick = null;
	#boundDragClick = null;
	#boundAreaMouseMove = null;
	#boundAreaMouseLeave = null;
	#boundWrapperMouseLeave = null;
	#boundDragMouseDown = null;
	#boundHandleMouseDown = null;
	#boundWrapperKeyDown = null;

	/**
	 * @constructor
	 * @param {SunEditor.Deps} $ - Kernel dependencies
	 * @param {HTMLElement} blockHandleArea - Container (.se-block-handle-area)
	 * @param {HTMLElement} blockHandle - Handle group (.se-block-handle)
	 * @param {HTMLElement} blockHandlePlus - Plus button
	 * @param {HTMLElement} blockHandleDrag - Drag button
	 * @param {Array<string>|null} menuConfig - Array of plugin names (like buttonList), or null
	 */
	constructor($, blockHandleArea, blockHandle, blockHandlePlus, blockHandleDrag, menuConfig) {
		this.#$ = $;
		this.#area = blockHandleArea;
		this.#handle = blockHandle;
		this.#plusBtn = blockHandlePlus;
		this.#dragBtn = blockHandleDrag;
		this.#menuConfig = menuConfig || null;

		// Bind events
		this.#boundPlusClick = this.#onPlusClick.bind(this);
		this.#boundDragClick = this.#onDragClick.bind(this);
		this.#boundDragMouseDown = this.#onDragMouseDown.bind(this);
		this.#boundAreaMouseMove = this.#onAreaMouseMove.bind(this);
		this.#boundAreaMouseLeave = this.#onAreaMouseLeave.bind(this);
		this.#boundWrapperMouseLeave = this.#onWrapperMouseLeave.bind(this);
		this.#boundHandleMouseDown = this.#onHandleMouseDown.bind(this);
		this.#boundWrapperKeyDown = this.#onWrapperKeyDown.bind(this);

		// Prevent editor blur on handle interaction — preserves selection range (same as toolbar)
		this.#handle.addEventListener('mousedown', this.#boundHandleMouseDown);

		// Create drag indicator
		this.#dragIndicator = dom.utils.createElement('DIV', { class: 'se-block-drag-indicator' });
		this.#dragIndicator.style.display = 'none';
		this.#area.parentElement?.appendChild(this.#dragIndicator);

		this.#plusBtn.addEventListener('click', this.#boundPlusClick);
		this.#dragBtn.addEventListener('mousedown', this.#boundDragMouseDown);
		this.#dragBtn.addEventListener('click', this.#boundDragClick);
		this.#area.addEventListener('mousemove', this.#boundAreaMouseMove);
		this.#area.addEventListener('mouseleave', this.#boundAreaMouseLeave);

		// Wrapper (parent of area + wysiwyg) — catches mouse leaving the entire editor zone
		const wrapper = this.#area.parentElement;
		if (wrapper) {
			wrapper.addEventListener('mouseleave', this.#boundWrapperMouseLeave);
			wrapper.addEventListener('keydown', this.#boundWrapperKeyDown, true);
		}
	}

	/**
	 * @description Position the block handle for the given mouse target. Uses rAF throttle.
	 * Called from wysiwyg mousemove.
	 * @param {Node} eventTarget - The element under the mouse cursor
	 * @param {number} [mouseY] - Mouse clientY for nested list resolution
	 */
	positionForTarget(eventTarget, mouseY) {
		this.#cancelHide();
		// Lock handle while action menu is open or dragging
		if (this.#actionMenu?.isOpen || this.#isDragging) return;
		this.#pendingTarget = eventTarget;
		this.#pendingMouseY = mouseY;
		if (this.#rafId) return;
		this.#rafId = _w.requestAnimationFrame(() => {
			this.#rafId = null;
			if (this.#pendingTarget) {
				this.#doPosition(this.#pendingTarget, this.#pendingMouseY);
			}
		});
	}

	/**
	 * @description Schedule hiding the block handle with a short delay.
	 * Called from wysiwyg mouseleave — the area mousemove will cancel the hide
	 * if the mouse is crossing into the handle area.
	 * @param {MouseEvent} e - Mouse event
	 */
	hide(e) {
		if (this.#actionMenu?.isOpen) return;
		const related = e?.relatedTarget;
		// Mouse moved into the handle area or its children — don't hide
		if (related && this.#area.contains(/** @type {Node} */ (related))) return;
		this.#scheduleHide();
	}

	/**
	 * @description Immediately hide the block handle (no delay).
	 */
	hideNow() {
		this.#cancelHide();
		this.#handle.style.display = 'none';
		this.#actionMenu?.close();
		this.#setCurrentBlock(null);
	}

	/**
	 * @description Sync handle position on editor scroll. Closes menu if open.
	 */
	syncScroll() {
		if (!this.#currentBlock) return;
		// Close menu on scroll to prevent stale positioning
		if (this.#actionMenu?.isOpen) {
			this.#actionMenu.close();
		}
		// Skip transition during scroll — handle should track scroll instantly
		dom.utils.addClass(this.#handle, 'se-no-transition');
		this.#updatePosition(this.#currentBlock);
		void this.#handle.offsetHeight;
		dom.utils.removeClass(this.#handle, 'se-no-transition');
	}

	/**
	 * @description Cleanup — remove listeners, destroy menus, null references.
	 */
	destroy() {
		if (this.#rafId) {
			_w.cancelAnimationFrame(this.#rafId);
			this.#rafId = null;
		}
		this.#cancelHide();
		this.#closeFreeDropdown();
		this.#handle?.removeEventListener('mousedown', this.#boundHandleMouseDown);
		this.#plusBtn?.removeEventListener('click', this.#boundPlusClick);
		this.#dragBtn?.removeEventListener('mousedown', this.#boundDragMouseDown);
		this.#dragBtn?.removeEventListener('click', this.#boundDragClick);
		this.#dragIndicator?.remove();
		this.#area?.removeEventListener('mousemove', this.#boundAreaMouseMove);
		this.#area?.removeEventListener('mouseleave', this.#boundAreaMouseLeave);
		const wrapper = this.#area?.parentElement;
		if (wrapper) {
			wrapper.removeEventListener('mouseleave', this.#boundWrapperMouseLeave);
			wrapper.removeEventListener('keydown', this.#boundWrapperKeyDown, true);
		}
		this.#actionMenu?.close();
		this.#actionMenu = null;
		this.#setCurrentBlock(null);
		this.#pendingTarget = null;
		this.#pendingMouseY = undefined;
		this.#$ = null;
		this.#area = null;
		this.#handle = null;
		this.#plusBtn = null;
		this.#dragBtn = null;
	}

	#setCurrentBlock(block) {
		this.#clearHoverLines();
		this.#currentBlock = block;
		if (!block) return;

		// If a non-collapsed selection covers multiple lines including this block,
		// highlight all lines in the selection (action menu will affect all of them).
		const rangeLines = this.#getSelectionLinesContaining(block);
		if (rangeLines) {
			this.#hoverLines = rangeLines;
			for (let i = 0; i < rangeLines.length; i++) dom.utils.addClass(rangeLines[i], 'se-block-hover');
		} else {
			dom.utils.addClass(block, 'se-block-hover');
		}
	}

	/**
	 * @description Return all lines covered by the current selection if it spans
	 * multiple lines and includes `block`. Otherwise null.
	 * @param {HTMLElement} block
	 * @returns {?Array<HTMLElement>}
	 */
	#getSelectionLinesContaining(block) {
		try {
			const range = this.#$.selection.getRange();
			if (!range || range.collapsed) return null;
			const startLine = this.#$.format.getLine(range.startContainer, null);
			const endLine = this.#$.format.getLine(range.endContainer, null);
			if (!startLine || !endLine || startLine === endLine) return null;
			// Non-mutating line collection — `format.getLines` calls `resetRangeToTextNode` which
			// mutates the selection and breaks bottom-to-top drag selection (every mousemove
			// re-normalizes endpoints to document order, killing the user's anchor).
			const all = dom.query.getListChildren(range.commonAncestorContainer, (n) => this.#$.format.isLine(n), null);
			const sIdx = all.indexOf(startLine);
			const eIdx = all.indexOf(endLine);
			if (sIdx === -1 || eIdx === -1) return null;
			const lines = all.slice(Math.min(sIdx, eIdx), Math.max(sIdx, eIdx) + 1);
			if (lines.indexOf(block) === -1) return null;
			return lines;
		} catch (_) {
			// No valid selection — treat as no multi-line range
		}
		return null;
	}

	#setHoverLines(lines) {
		this.#clearHoverLines();
		this.#hoverLines = lines || [];
		for (let i = 0; i < this.#hoverLines.length; i++) {
			dom.utils.addClass(this.#hoverLines[i], 'se-block-hover');
		}
	}

	#clearHoverLines() {
		if (this.#currentBlock) dom.utils.removeClass(this.#currentBlock, 'se-block-hover');
		for (let i = 0; i < this.#hoverLines.length; i++) {
			dom.utils.removeClass(this.#hoverLines[i], 'se-block-hover');
		}
		this.#hoverLines = [];
	}

	#scheduleHide() {
		if (this.#hideTimer) return;
		this.#hideTimer = _w.setTimeout(() => {
			this.#hideTimer = null;
			this.#handle.style.display = 'none';
			this.#actionMenu?.close();
			this.#setCurrentBlock(null);
		}, 200);
	}

	#cancelHide() {
		if (this.#hideTimer) {
			_w.clearTimeout(this.#hideTimer);
			this.#hideTimer = null;
		}
	}

	/**
	 * @description Mouse moves inside the block handle area.
	 * Probes the wysiwyg at the same Y level to find which block to show the handle for.
	 * This keeps the handle alive when the mouse is in the gutter, and enables
	 * repositioning as the mouse moves vertically within the area.
	 * @param {MouseEvent} e
	 */
	#onAreaMouseMove(e) {
		if (!this.#$) return;
		this.#cancelHide();

		// Don't reposition while action menu is open
		if (this.#actionMenu?.isOpen) return;

		const wysiwygEl = this.#$.frameContext.get('wysiwyg');
		if (!wysiwygEl) return;

		const frameEl = this.#$.frameContext.get('wysiwygFrame');
		const isIframe = frameEl && frameEl.nodeName === 'IFRAME';

		let target;
		if (isIframe) {
			// iframe mode: convert to iframe-local coordinates
			const iframeRect = frameEl.getBoundingClientRect();
			const doc = /** @type {HTMLIFrameElement} */ (frameEl).contentDocument;
			if (doc) target = doc.elementFromPoint(iframeRect.width / 2, e.clientY - iframeRect.top);
		} else {
			// Normal mode: probe the wysiwyg center at the mouse's Y
			const rect = wysiwygEl.getBoundingClientRect();
			target = document.elementFromPoint(rect.left + rect.width / 2, e.clientY);
		}

		if (target && wysiwygEl.contains(target)) {
			this.#doPosition(target, e.clientY);
		}
	}

	/**
	 * @description Mouse leaves the block handle area.
	 * If mouse moves into the wysiwyg, positionForTarget will take over.
	 * If mouse moves outside the wrapper, wrapperMouseLeave handles it.
	 * Schedule hide as a safety net.
	 */
	#onAreaMouseLeave() {
		this.#scheduleHide();
	}

	/**
	 * @description Mouse leaves the entire wrapper (area + wysiwyg).
	 * Hides the handle immediately — mouse is completely outside the editor zone.
	 */
	#onWrapperMouseLeave() {
		if (this.#actionMenu?.isOpen) return;
		this.#cancelHide();
		this.#handle.style.display = 'none';
		this.#setCurrentBlock(null);
	}

	/**
	 * @param {Node} eventTarget
	 * @param {number} [mouseY]
	 */
	#doPosition(eventTarget, mouseY) {
		if (!this.#$) return; // destroyed

		const format = this.#$.format;
		const wysiwygFrame = this.#$.frameContext.get('wysiwyg');
		if (!wysiwygFrame) return;

		// If target is the wysiwyg itself (padding area), probe center to find the actual block
		let target = eventTarget;
		if (target === wysiwygFrame && mouseY !== undefined) {
			const rect = wysiwygFrame.getBoundingClientRect();
			const probed = document.elementFromPoint(rect.left + rect.width / 2, mouseY);
			if (probed && wysiwygFrame.contains(probed) && probed !== wysiwygFrame) {
				target = probed;
			}
		}

		const block = resolveBlock(
			target,
			{
				getLine: (node, validation) => format.getLine(node, validation),
				getBlock: (el, validation) => format.getBlock(el, validation),
				isLine: (el) => format.isLine(el),
				isBlock: (el) => format.isBlock(el),
			},
			wysiwygFrame,
			mouseY,
		);

		if (!block) {
			this.#scheduleHide();
			return;
		}

		// Same block and handle already visible — skip
		if (block.element === this.#currentBlock && this.#handle.style.display === 'flex') return;

		// Sticky: keep current block when mouseY is within current block's bounds.
		// - Ancestor resolved (parent padding crossed): sticky if still in child's Y range
		// - Sibling resolved (gap between items): sticky if still in current's Y range
		// - Descendant resolved (parent→child): always allow switch
		if (this.#currentBlock?.isConnected && this.#handle.style.display === 'flex' && mouseY !== undefined) {
			if (!this.#currentBlock.contains(block.element)) {
				const r = this.#currentBlock.getBoundingClientRect();
				if (mouseY >= r.top && mouseY <= r.bottom) return;
			}
		}

		this.#setCurrentBlock(block.element);
		this.#updatePosition(block.element);
	}

	/**
	 * @param {HTMLElement} blockElement
	 */
	#updatePosition(blockElement) {
		if (!blockElement.isConnected) {
			this.hide(null);
			return;
		}

		const blockRect = blockElement.getBoundingClientRect();
		const areaRect = this.#area.getBoundingClientRect();
		const top = blockRect.top - areaRect.top;
		const handleW = this.#handle.offsetWidth || 49;
		const areaW = areaRect.width;

		// Handle left offset: based only on the block's own margin/padding indent.
		// For LI, account for parent UL/OL padding (marker space).
		const indent = this.#getBlockIndent(blockElement);
		const left = indent > 0 ? indent + 'px' : '';

		// First appearance after being hidden — skip transition so it doesn't slide in
		// from the previous block's position.
		const wasHidden = this.#handle.style.display !== 'flex';
		if (wasHidden) dom.utils.addClass(this.#handle, 'se-no-transition');

		this.#handle.style.top = top + 'px';
		this.#handle.style.left = left;
		this.#handle.style.display = 'flex';

		if (wasHidden) {
			void this.#handle.offsetHeight;
			dom.utils.removeClass(this.#handle, 'se-no-transition');
		}
	}

	/**
	 * @description Calculate the handle's left indent.
	 * Walks from the block up to the wysiwyg, summing padding-left and margin-left
	 * of all ancestor block elements (format.isBlock). Also includes the block's own margin-left.
	 * @param {HTMLElement} blockElement
	 * @returns {number} Indent in pixels (0 = default gutter position)
	 */
	#getBlockIndent(blockElement) {
		const wysiwyg = this.#$.frameContext.get('wysiwyg');
		if (!wysiwyg) return 0;

		const format = this.#$.format;
		let indent = 0;

		// Block's own margin-left
		indent += parseFloat(_w.getComputedStyle(blockElement).marginLeft) || 0;

		// Walk ancestors: sum padding-left + margin-left of block elements
		let el = blockElement.parentElement;
		while (el && el !== wysiwyg) {
			if (format.isBlock(el)) {
				const s = _w.getComputedStyle(el);
				indent += (parseFloat(s.paddingLeft) || 0) + (parseFloat(s.marginLeft) || 0);
			}
			el = el.parentElement;
		}

		return indent;
	}

	/**
	 * @description Expand the selection range so it covers full lines.
	 * - If a non-collapsed range covers multiple lines including `currentBlock`,
	 *   keep that line set but extend the start to the first line's beginning and
	 *   the end to the last line's end (line element start/end, inline content included).
	 * - Otherwise, select the entire `currentBlock` line (start to end of its content).
	 */
	#expandRangeToFullLines() {
		if (!this.#currentBlock) return;
		const block = this.#currentBlock;

		const rangeLines = this.#getSelectionLinesContaining(block);
		const firstLine = rangeLines ? rangeLines[0] : block;
		const lastLine = rangeLines ? rangeLines[rangeLines.length - 1] : block;

		this.#$.selection.setRange(firstLine, 0, lastLine, lastLine.childNodes.length);
	}

	/**
	 * @description Plus button click — insert new line after current block.
	 * Mirrors Enter-at-end-of-line behavior from keydown.rule.enter.
	 * @param {MouseEvent} e
	 */
	#onPlusClick(e) {
		e.preventDefault();
		e.stopPropagation();

		if (!this.#currentBlock) return;

		const newLine = this.#$.format.addLineAfter(this.#currentBlock);
		if (newLine) {
			this.#$.selection.setRange(newLine, 1, newLine, 1);
			this.#$.history.push(false);
		}
	}

	/**
	 * @description Drag button mousedown — start tracking for drag vs click.
	 * @param {MouseEvent} e
	 */
	#onHandleMouseDown(e) {
		if (!env.isMobile) {
			e.preventDefault();
		} else {
			this.#$.store.set('_preventBlur', true);
		}
	}

	/**
	 * @description Editor keyboard activity (typing, Enter, etc.) means the user moved
	 * focus into editing — strip the hover styling so it doesn't get cloned into new
	 * lines on Enter (`formatEl.cloneNode(false)` and `copyTagAttributes` would otherwise
	 * carry `se-block-hover` to the new element). `currentBlock` is preserved so the
	 * handle keeps tracking; mousemove will re-apply hover when the user goes back to it.
	 */
	#onWrapperKeyDown() {
		this.#clearHoverLines();
	}

	#onDragMouseDown(e) {
		if (e.button !== 0 || !this.#currentBlock) return;
		this.#dragStartPos = { x: e.clientX, y: e.clientY };
		this.#dragTarget = this.#currentBlock;

		// rAF-coalesced indicator update — caps work at display refresh rate (~60Hz)
		// regardless of native mousemove rate (1000Hz on gaming mice).
		let pendingY = null;
		let dragRafId = null;

		const onMove = (me) => {
			const dx = me.clientX - this.#dragStartPos.x;
			const dy = me.clientY - this.#dragStartPos.y;
			if (!this.#isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
				this.#isDragging = true;
				this.#actionMenu?.close();
				dom.utils.addClass(this.#dragTarget, 'se-block-dragging');
			}
			if (this.#isDragging) {
				pendingY = me.clientY;
				if (dragRafId === null) {
					dragRafId = _w.requestAnimationFrame(() => {
						dragRafId = null;
						if (pendingY !== null) this.#updateDragIndicator(pendingY);
					});
				}
			}
		};

		const onUp = () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
			if (dragRafId !== null) {
				_w.cancelAnimationFrame(dragRafId);
				dragRafId = null;
			}
			if (this.#isDragging) {
				this.#executeDrop();
			}
			this.#isDragging = false;
			this.#dragStartPos = null;
		};

		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	}

	/**
	 * @description Update drag indicator position based on mouse Y.
	 * @param {number} clientY
	 */
	#updateDragIndicator(clientY) {
		if (!this.#$ || !this.#dragTarget) return;

		const wysiwygEl = this.#$.frameContext.get('wysiwyg');
		if (!wysiwygEl) return;

		const wysiwygRect = wysiwygEl.getBoundingClientRect();
		const wrapperRect = this.#area.parentElement.getBoundingClientRect();
		const children = wysiwygEl.children;

		let closest = null;

		/** @type {"after"|"before"} */
		let closestPos = 'after';
		let closestY = 0;
		let minDist = Infinity;

		for (let i = 0; i < children.length; i++) {
			const child = /** @type {HTMLElement} */ (children[i]);
			const r = child.getBoundingClientRect();

			// Check top edge
			const topDist = Math.abs(clientY - r.top);
			if (topDist < minDist) {
				minDist = topDist;
				closest = child;
				closestPos = 'before';
				closestY = r.top;
			}
			// Check bottom edge
			const bottomDist = Math.abs(clientY - r.bottom);
			if (bottomDist < minDist) {
				minDist = bottomDist;
				closest = child;
				closestPos = 'after';
				closestY = r.bottom;
			}
		}

		if (closest && closest !== this.#dragTarget) {
			this.#dropTarget = { element: closest, position: closestPos };
			const ind = this.#dragIndicator;
			ind.style.display = 'block';
			ind.style.top = closestY - wrapperRect.top + 'px';
			ind.style.left = wysiwygRect.left - wrapperRect.left + 'px';
			ind.style.width = wysiwygRect.width + 'px';
		} else {
			this.#dropTarget = null;
			this.#dragIndicator.style.display = 'none';
		}
	}

	/**
	 * @description Execute the drop — move the dragged block to the drop position.
	 */
	#executeDrop() {
		const target = this.#dragTarget;
		const drop = this.#dropTarget;

		dom.utils.removeClass(target, 'se-block-dragging');
		this.#dragIndicator.style.display = 'none';

		if (!target || !drop || drop.element === target) {
			this.#dropTarget = null;
			this.#dragTarget = null;
			return;
		}

		const parent = target.parentNode;
		if (!parent) return;

		if (drop.position === 'before') {
			drop.element.parentNode.insertBefore(target, drop.element);
		} else {
			drop.element.parentNode.insertBefore(target, drop.element.nextSibling);
		}

		// Update handle position and push history
		this.#setCurrentBlock(target);
		this.#updatePosition(target);
		this.#$.history.push(false);

		this.#dropTarget = null;
		this.#dragTarget = null;
	}

	/**
	 * @description Drag button click — open action menu.
	 * @param {MouseEvent} e
	 */
	#onDragClick(e) {
		e.preventDefault();
		e.stopPropagation();

		// Skip if this click was actually a drag
		if (this.#isDragging) return;

		if (!this.#menuConfig) return;

		// Lazy build — plugins are not yet instantiated when BlockHandle is constructed
		if (!this.#actionMenu) {
			this.#actionMenu = this.#buildActionMenu();
		}

		if (this.#actionMenu.isOpen) {
			this.#actionMenu.close();
		} else {
			// Expand selection to full lines:
			// - multi-line range containing currentBlock → first/last lines extended to line bounds
			// - else → currentBlock selected as a full line
			this.#expandRangeToFullLines();

			// Highlight selected range lines
			const lines = this.#$.format.getLines(null);
			if (lines.length > 0) {
				this.#setHoverLines(lines);
			}

			// Choose open direction based on available space
			const btnGlobal = this.#$.offset.getGlobal(this.#dragBtn);
			const spaceBelow = dom.utils.getClientSize().h - (btnGlobal.top - _w.scrollY + btnGlobal.height);
			const spaceAbove = btnGlobal.top - _w.scrollY;
			const dir = spaceBelow >= spaceAbove ? 'left-bottom' : 'left-top';
			this.#actionMenu.open(dir);
		}
	}

	/**
	 * @description Build the action SelectMenu from menuConfig (plugin names / basic commands).
	 * @returns {SelectMenu}
	 */
	#buildActionMenu() {
		const menu = new SelectMenu(this.#$, {
			position: 'left-top',
			dir: this.#$.options.get('_rtl') ? 'rtl' : 'ltr',
			minWidth: '200px',
			closeMethod: () => {
				dom.utils.removeClass(this.#dragBtn, 'on');
				this.#closeFreeDropdown();
				this.#clearHoverLines();
			},
			openMethod: () => {
				dom.utils.addClass(this.#dragBtn, 'on');
			},
		});

		menu.on(this.#dragBtn, this.#onActionSelect.bind(this), { class: 'se-block-action-menu' });

		// Prevent blur on menu interaction — preserve selection range
		menu.form.addEventListener('mousedown', (e) => {
			if (!env.isMobile) {
				e.preventDefault();
			} else {
				this.#$.store.set('_preventBlur', true);
			}
		});

		const items = [];
		const menus = [];

		for (const name of this.#menuConfig) {
			const resolved = ResolveButton(name, this.#$.plugins, this.#$.options, this.#$.icons, this.#$.lang);
			if (!resolved) continue;

			const menuHTML = resolved.icon
				? `<span class="se-block-menu-icon">${resolved.icon}</span><span class="se-block-menu-label">${resolved.title}</span>`
				: `<span class="se-block-menu-label se-block-menu-label-full">${resolved.title}</span>`;
			const type = resolved.type;

			if (/dropdown-free/.test(type)) {
				// Free dropdowns (table, fontColor, etc.) build their own complex UI. Render with the
				// same submenu arrow as regular dropdowns; click opens the plugin's dropdown as a flyout.
				items.push({ pluginName: name, type });
				menus.push(`${menuHTML}<span class="se-submenu-arrow">${this.#$.icons.menu_arrow_right}</span>`);
			} else if (/dropdown/.test(type)) {
				const menuItems = this.#$.menu?.itemsMap?.[name] || [];

				const childItems = menuItems.map((item) => ({ pluginName: name, element: item._element }));
				const childMenus = menuItems.map((item) => {
					const iconEl = item._element?.querySelector('.se-list-icon') || item._element?.querySelector('svg');
					const icon = iconEl ? iconEl.outerHTML : '';
					const label = icon ? `${icon}<span>${item.title}</span>` : item.title;
					return `<span class="se-block-submenu-item">${label}</span>`;
				});

				items.push({ children: childItems, childMenus });
				menus.push(menuHTML);
			} else if (/modal/.test(type) || /browser/.test(type) || /command/.test(type) || /popup/.test(type)) {
				items.push({ pluginName: name, type });
				menus.push(menuHTML);
			} else {
				items.push({ command: resolved.command });
				menus.push(menuHTML);
			}
		}

		menu.create(items, menus);
		this.#installFreeDropdownHover(items, menu);
		return menu;
	}

	/**
	 * @description Hover-to-open for dropdown-free items. Mirrors the native dropdown submenu UX —
	 * moving the mouse over a dropdown-free LI opens its flyout immediately; moving to another LI
	 * (or another part of the form outside the open dropdown) closes it.
	 * @param {Array<*>} items
	 * @param {SelectMenu} menu
	 */
	#installFreeDropdownHover(items, menu) {
		const freeMap = new Map();
		for (let i = 0; i < items.length; i++) {
			const it = items[i];
			if (it && /dropdown-free/.test(it.type)) {
				freeMap.set(i, { pluginName: it.pluginName, plugin: this.#$.plugins[it.pluginName], li: menu.menus[i] });
			}
		}
		if (freeMap.size === 0) return;

		menu.form.addEventListener('mousemove', (e) => {
			const target = /** @type {HTMLElement} */ (e.target);
			// Inside the currently open free dropdown — keep open
			if (this.#freeDropdownState?.dropdown?.contains(target)) return;

			const li = target.closest?.('li[data-index]');
			if (!li) return;

			const idx = Number(li.getAttribute('data-index'));
			const free = freeMap.get(idx);
			if (free) {
				if (this.#freeDropdownState?.plugin !== free.plugin) {
					this.#openFreeDropdown(free.pluginName, free.plugin, free.li);
				}
			} else if (this.#freeDropdownState) {
				this.#closeFreeDropdown();
			}
		});
	}

	/**
	 * @description Open a dropdown-free plugin's dropdown (table, fontColor, etc.) as a flyout
	 * next to the anchor LI. The plugin's dropdown DOM is borrowed from the menuTray, positioned
	 * next to the LI, and restored on close. A click anywhere inside the dropdown closes the flyout —
	 * plugin actions (cell pick, color pick) all complete via click, so this is sufficient.
	 * @param {string} pluginName
	 * @param {Object} plugin
	 * @param {HTMLElement} anchorLi
	 */
	#openFreeDropdown(pluginName, plugin, anchorLi) {
		if (this.#freeDropdownState) this.#closeFreeDropdown();
		const dropdown = this.#$.menu?.targetMap?.[pluginName];
		if (!dropdown || !this.#actionMenu) return;

		const originalParent = dropdown.parentNode;
		this.#actionMenu.form.appendChild(dropdown);
		this.#positionFlyout(dropdown, anchorLi, this.#actionMenu.form);

		dom.utils.addClass(anchorLi, 'se-submenu-open');
		plugin.on?.(anchorLi);

		const onClick = () =>
			_w.setTimeout(() => {
				this.#closeFreeDropdown();
				this.#actionMenu?.close();
			}, 0);
		dropdown.addEventListener('click', onClick);

		this.#freeDropdownState = { dropdown, plugin, originalParent, anchorLi, onClick };
	}

	#closeFreeDropdown() {
		const s = this.#freeDropdownState;
		if (!s) return;
		this.#freeDropdownState = null;

		s.dropdown.removeEventListener('click', s.onClick);
		s.dropdown.style.cssText = '';
		s.dropdown.style.display = 'none';

		if (s.anchorLi) dom.utils.removeClass(s.anchorLi, 'se-submenu-open');

		// Restore dropdown DOM to its original parent (menuTray)
		if (s.originalParent && s.originalParent !== s.dropdown.parentNode) {
			s.originalParent.appendChild(s.dropdown);
		}

		s.plugin?.off?.();
	}

	/**
	 * @description Place `el` to the right of `anchor`, coordinates relative to `container`.
	 * Mirrors `SelectMenu.#openSubmenu`: opens right by default, flips to left if overflowing
	 * the right edge, flips up if overflowing the bottom, then clamps into the viewport.
	 * @param {HTMLElement} el
	 * @param {HTMLElement} anchor
	 * @param {HTMLElement} container
	 */
	#positionFlyout(el, anchor, container) {
		const a = anchor.getBoundingClientRect();
		const c = container.getBoundingClientRect();
		el.style.position = 'absolute';
		el.style.top = a.top - c.top + 'px';
		el.style.left = a.right - c.left + 4 + 'px';
		el.style.right = '';
		el.style.display = 'block';

		// Horizontal: flip right→left if overflowing right; clamp into viewport otherwise.
		let rect = el.getBoundingClientRect();
		if (rect.right > _w.innerWidth) {
			el.style.left = a.left - c.left - el.offsetWidth - 4 + 'px';
			rect = el.getBoundingClientRect();
		}
		if (rect.left < 0) {
			el.style.left = parseFloat(el.style.left) - rect.left + 4 + 'px';
			rect = el.getBoundingClientRect();
		}

		// Vertical: flip top-anchor → bottom-anchor if overflowing bottom; clamp top otherwise.
		if (rect.bottom > _w.innerHeight) {
			el.style.top = a.bottom - c.top - el.offsetHeight + 'px';
			rect = el.getBoundingClientRect();
		}
		if (rect.top < 0) {
			el.style.top = parseFloat(el.style.top) - rect.top + 4 + 'px';
		}
	}

	/**
	 * @description Handle action menu item selection.
	 * @param {Object} item - The selected item value
	 */
	#onActionSelect(item) {
		if (!this.#currentBlock || !this.#$ || !item) return;

		if (item.element) {
			const plugin = this.#$.plugins[item.pluginName];
			plugin?.action?.(item.element);
			this.#$.history.push(false);
		} else if (item.pluginName) {
			const plugin = this.#$.plugins[item.pluginName];
			if (plugin) {
				if (/dropdown-free/.test(item.type)) {
					// Open as flyout next to the action menu — toggle if already open for this plugin
					if (this.#freeDropdownState?.plugin === plugin) {
						this.#closeFreeDropdown();
					} else {
						const idx = this.#actionMenu.items.indexOf(item);
						const anchorLi = this.#actionMenu.menus[idx];
						this.#openFreeDropdown(item.pluginName, plugin, anchorLi);
					}
					return;
				}
				if (/modal/.test(item.type)) {
					plugin.open?.();
				} else if (/browser/.test(item.type)) {
					plugin.open?.(null);
				} else {
					plugin.action?.(dom.utils.createElement('BUTTON', { 'data-command': item.pluginName }));
				}
				this.#$.history.push(false);
			}
		} else if (item.command) {
			this.#$.commandDispatcher.run(item.command, null, null);
		}

		this.#actionMenu?.close();
	}
}

export default BlockHandle;
