import { dom, env } from '../../../helper';
import { resolveBlock } from './blockResolver';
import { ResolveButton } from '../../section/constructor';
import CommandMenu from '../../../modules/ui/CommandMenu.js';

const { _w, _d } = env;

/**
 * @description Resolve a CSS length value (`px`, `em`, `rem`, or unitless) to pixels.
 * Falls back to `0` when the value is empty or unparseable.
 * @param {string} value Raw CSS length string (e.g. `"1.5em"`)
 * @param {CSSStyleDeclaration} contextStyle Computed style of the element using the value (for `em`)
 * @returns {number} Resolved pixel length
 */
function _resolveLengthPx(value, contextStyle) {
	const trimmed = (value || '').trim();
	const num = parseFloat(trimmed);
	if (!num) return 0;
	if (/rem$/.test(trimmed)) {
		return num * (parseFloat(_w.getComputedStyle(_d.documentElement).fontSize) || 16);
	}
	if (/em$/.test(trimmed)) {
		return num * (parseFloat(contextStyle.fontSize) || 16);
	}
	return num;
}

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

	/** @type {CommandMenu|null} */
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
	/** @type {HTMLElement|null} */
	#dragIndicator = null;
	/** @type {HTMLElement|null} */
	#dragTarget = null;
	/** @type {{element: HTMLElement, position: 'before'|'after'}|null} */
	#dropTarget = null;
	/** @type {HTMLElement|null} */
	#dragWysiwyg = null;
	/** @type {HTMLElement[]|null} */
	#dragChildren = null;

	/**
	 * @constructor
	 * @param {SunEditor.Deps} $ - Kernel dependencies
	 * @param {HTMLElement} blockHandleArea - Container (.se-block-handle-area)
	 * @param {HTMLElement} blockHandle - Handle group (.se-block-handle)
	 * @param {HTMLElement} blockHandlePlus - Plus button
	 * @param {HTMLElement} blockHandleDrag - Drag button
	 * @param {Array<string | { title: string, icon?: string, action: function(SunEditor.Deps, { block: HTMLElement }): void }>|null} menuConfig
	 *   Menu entries. Strings resolve via `ResolveButton` (plugin names, built-in commands). Objects
	 *   define a custom row whose `action` is invoked with the Deps bag and the current block element.
	 */
	constructor($, blockHandleArea, blockHandle, blockHandlePlus, blockHandleDrag, menuConfig) {
		this.#$ = $;
		this.#area = blockHandleArea;
		this.#handle = blockHandle;
		this.#plusBtn = blockHandlePlus;
		this.#dragBtn = blockHandleDrag;
		this.#menuConfig = menuConfig || null;

		this.#$.contextProvider.carrierWrapper.appendChild(this.#handle);

		const em = this.#$.eventManager;

		// Prevent editor blur on handle interaction — preserves selection range (same as toolbar)
		em.addEvent(this.#handle, 'mousedown', this.#onHandleMouseDown.bind(this));

		// Create drag indicator
		this.#dragIndicator = dom.utils.createElement('DIV', { class: 'se-block-drag-indicator' });
		this.#dragIndicator.style.display = 'none';
		this.#area.parentElement?.appendChild(this.#dragIndicator);

		em.addEvent(this.#plusBtn, 'click', this.#onPlusClick.bind(this));
		// HTML5 drag-and-drop: native drag image, native event flow.
		this.#dragBtn.draggable = true;
		em.addEvent(this.#dragBtn, 'dragstart', this.#onDragStart.bind(this));
		em.addEvent(this.#dragBtn, 'dragend', this.#onDragEnd.bind(this));
		em.addEvent(this.#dragBtn, 'click', this.#onDragClick.bind(this));
		em.addEvent(this.#area, 'mousemove', this.#onAreaMouseMove.bind(this));
		em.addEvent(this.#area, 'mouseleave', this.#onAreaMouseLeave.bind(this));

		// Wrapper (parent of area + wysiwyg) — catches mouse leaving the entire editor
		// zone, plus the dragover/drop targets for the in-flight HTML5 drag.
		const wrapper = this.#area.parentElement;
		if (wrapper) {
			em.addEvent(wrapper, 'mouseleave', this.#onWrapperMouseLeave.bind(this));
			em.addEvent(wrapper, 'dragover', this.#onDragOver.bind(this));
			em.addEvent(wrapper, 'drop', this.#onDrop.bind(this));
		}

		em.addEvent(this.#$.frameContext.get('eventWysiwyg'), 'keydown', this.#onWrapperKeyDown.bind(this), true);
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
	 * @param {MouseEvent} e - Mouse event
	 */
	hide(e) {
		if (this.#actionMenu?.isOpen) return;
		const related = /** @type {Node} */ (e?.relatedTarget);
		if (related && (this.#area.contains(related) || this.#handle?.contains(related))) return;
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
		// Skip transition during scroll — handle should track scroll instantly
		dom.utils.addClass(this.#handle, 'se-no-transition');
		this.#updatePosition(this.#currentBlock);
		void this.#handle.offsetHeight;
		dom.utils.removeClass(this.#handle, 'se-no-transition');

		if (this.#actionMenu?.isOpen) {
			this.#actionMenu.setHidden(this.#handle.style.display === 'none');
		}
	}

	/**
	 * @description Cleanup — remove listeners, destroy menus, null references.
	 */
	destroy() {
		if (this.#rafId) {
			_w.cancelAnimationFrame(this.#rafId);
			this.#rafId = null;
		}
		this.#isDragging = false;
		this.#cancelHide();

		if (this.#dragBtn) this.#dragBtn.draggable = false;
		this.#dragIndicator?.remove();
		this.#handle?.remove();
		// CommandMenu's closeMethod tears down its own flyout when the menu closes.
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

			const all = dom.query.getListChildren(range.commonAncestorContainer, (n) => this.#$.format.isLine(n), null);
			const sIdx = all.indexOf(startLine);
			const eIdx = all.indexOf(endLine);
			if (sIdx === -1 || eIdx === -1) return null;
			const lines = all.slice(Math.min(sIdx, eIdx), Math.max(sIdx, eIdx) + 1);
			if (lines.indexOf(block) === -1) return null;
			return lines;
		} catch {
			// No valid selection
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
	 * @param {MouseEvent} e
	 */
	#onAreaMouseMove(e) {
		if (!this.#$) return;
		if (this.#isDragging) return;

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
	 * @param {MouseEvent} e
	 */
	#onAreaMouseLeave(e) {
		if (this.#actionMenu?.isOpen) return;

		const related = /** @type {Node} */ (e?.relatedTarget);
		if (related && this.#handle?.contains(related)) return;

		this.#scheduleHide();
	}

	/**
	 * @description Mouse leaves the entire wrapper (area + wysiwyg).
	 */
	#onWrapperMouseLeave(e) {
		if (this.#actionMenu?.isOpen) return;
		const related = /** @type {Node} */ (e?.relatedTarget);
		if (related && this.#handle?.contains(related)) return;
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
			this.hideNow();
			return;
		}

		const blockRect = blockElement.getBoundingClientRect();
		const areaRect = this.#area.getBoundingClientRect();

		const wysiwygFrameEl = this.#$.frameContext.get('wysiwygFrame');
		const isIframe = /^iframe$/i.test(wysiwygFrameEl.nodeName);
		const iframeRect = isIframe ? wysiwygFrameEl.getBoundingClientRect() : null;

		if (isIframe) {
			const iframeH = wysiwygFrameEl.clientHeight || 0;
			if (blockRect.bottom <= 0 || blockRect.top >= iframeH) {
				this.#handle.style.display = 'none';
				return;
			}
		} else {
			const wwFrameRect = wysiwygFrameEl.getBoundingClientRect();
			if (blockRect.bottom <= wwFrameRect.top || blockRect.top >= wwFrameRect.bottom) {
				this.#handle.style.display = 'none';
				return;
			}
		}

		const scrollX = _w.scrollX;
		const scrollY = _w.scrollY;

		// parent-viewport top to convert to parent coordinates
		const blockTopVP = isIframe ? blockRect.top + iframeRect.top : blockRect.top;
		const top = blockTopVP + scrollY;

		// Handle inline offset
		const isRtl = !!this.#$.options.get('_rtl');
		const indent = this.#getBlockIndent(blockElement, isRtl);

		// innerWidth
		let centeringExtra = 0;
		if (this.#$.frameOptions.get('innerWidth')) {
			const wysiwygFrame = this.#$.frameContext.get('wysiwyg');
			if (wysiwygFrame) {
				const cs = _w.getComputedStyle(wysiwygFrame);
				const padStart = parseFloat(isRtl ? cs.paddingRight : cs.paddingLeft) || 0;
				const baseline = _resolveLengthPx(cs.getPropertyValue('--se-edit-inner-padding'), cs);
				centeringExtra = Math.max(0, padStart - baseline);
			}
		}

		const totalOffset = indent + centeringExtra;

		// First appearance after being hidden — skip transition
		const wasHidden = this.#handle.style.display !== 'flex';
		if (wasHidden) dom.utils.addClass(this.#handle, 'se-no-transition');

		this.#handle.style.top = top + 'px';
		if (isRtl) {
			this.#handle.style.left = '';
			this.#handle.style.right = _w.innerWidth - areaRect.right - scrollX + totalOffset + 'px';
		} else {
			this.#handle.style.right = '';
			this.#handle.style.left = areaRect.left + scrollX + totalOffset + 'px';
		}
		this.#handle.style.display = 'flex';

		if (wasHidden) {
			void this.#handle.offsetHeight;
			dom.utils.removeClass(this.#handle, 'se-no-transition');
		}
	}

	/**
	 * @description Calculate the handle's inline indent.
	 * @param {HTMLElement} blockElement
	 * @param {boolean} isRtl
	 * @returns {number} Indent in pixels (0 = default gutter position)
	 */
	#getBlockIndent(blockElement, isRtl) {
		const wysiwyg = this.#$.frameContext.get('wysiwyg');
		if (!wysiwyg) return 0;

		const format = this.#$.format;
		const marginKey = isRtl ? 'marginRight' : 'marginLeft';
		const paddingKey = isRtl ? 'paddingRight' : 'paddingLeft';
		let indent = 0;

		indent += parseFloat(_w.getComputedStyle(blockElement)[marginKey]) || 0;

		let el = blockElement.parentElement;
		while (el && el !== wysiwyg) {
			if (format.isBlock(el)) {
				const s = _w.getComputedStyle(el);
				indent += (parseFloat(s[paddingKey]) || 0) + (parseFloat(s[marginKey]) || 0);
			}
			el = el.parentElement;
		}

		return indent;
	}

	/**
	 * @description Expand the selection range so it covers full lines.
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
	 * @description Handle group mousedown — prevents editor blur on click so the selection survives.
	 * @param {MouseEvent} e
	 */
	#onHandleMouseDown(e) {
		const onDragBtn =
			this.#dragBtn && (e.target === this.#dragBtn || this.#dragBtn.contains(/** @type {Node} */ (e.target)));
		if (env.isMobile) {
			this.#$.store.set('_preventBlur', true);
			return;
		}
		if (!onDragBtn) e.preventDefault();
	}

	/**
	 * @description Editor keyboard activity (typing, Enter, etc.)
	 */
	#onWrapperKeyDown() {
		this.#clearHoverLines();
	}

	/**
	 * @description Dragstart on the drag handle.
	 * @param {DragEvent} e
	 */
	#onDragStart(e) {
		if (!this.#currentBlock) {
			e.preventDefault();
			return;
		}
		this.#dragTarget = this.#currentBlock;
		this.#isDragging = true;
		this.#actionMenu?.close();
		dom.utils.addClass(this.#dragTarget, 'se-block-dragging');

		// Cache wysiwyg + children for the duration of the drag — DOM is stable until drop.
		const wysiwygEl = /** @type {HTMLElement} */ (this.#$.frameContext.get('wysiwyg'));
		this.#dragWysiwyg = wysiwygEl || null;
		this.#dragChildren = wysiwygEl ? /** @type {HTMLElement[]} */ (Array.from(wysiwygEl.children)) : null;

		const isRtl = !!this.#$.options.get('_rtl');
		const cover = /** @type {HTMLElement} */ (this.#dragTarget);

		e.dataTransfer.setDragImage(cover, isRtl ? cover.offsetWidth : -5, -5);
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('application/x-suneditor-block-drag', '1');
	}

	/**
	 * @description Dragover on the wrapper.
	 * @param {DragEvent} e
	 */
	#onDragOver(e) {
		if (!this.#isDragging) return;
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = 'move';
		this.#updateDragIndicator(e.clientY);
	}

	/**
	 * @description Native HTML5 drop on the wrapper. Commits the move.
	 * @param {DragEvent} e
	 */
	#onDrop(e) {
		if (!this.#isDragging) return;
		e.preventDefault();
		e.stopPropagation();
		this.#executeDrop();
	}

	/**
	 * @description Dragend on the drag handle.
	 */
	#onDragEnd() {
		if (this.#dragTarget) dom.utils.removeClass(this.#dragTarget, 'se-block-dragging');
		this.#dragIndicator.style.display = 'none';
		this.#isDragging = false;
		this.#dragTarget = null;
		this.#dropTarget = null;
		this.#dragWysiwyg = null;
		this.#dragChildren = null;

		if (this.#dragBtn?.parentNode) {
			const parent = this.#dragBtn.parentNode;
			const next = this.#dragBtn.nextSibling;
			parent.removeChild(this.#dragBtn);
			parent.insertBefore(this.#dragBtn, next);
		}
	}

	/**
	 * @description Update drag indicator position based on mouse Y.
	 * @param {number} clientY
	 */
	#updateDragIndicator(clientY) {
		if (!this.#$ || !this.#dragTarget) return;

		const wysiwygEl = this.#dragWysiwyg;
		const children = this.#dragChildren;
		if (!wysiwygEl || !children) return;

		const wysiwygRect = wysiwygEl.getBoundingClientRect();
		const wrapperRect = this.#area.parentElement.getBoundingClientRect();

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

		if (!target || !drop || drop.element === target) {
			return;
		}

		const parent = target.parentNode;
		if (!parent) return;

		if (drop.position === 'before') {
			drop.element.parentNode.insertBefore(target, drop.element);
		} else {
			drop.element.parentNode.insertBefore(target, drop.element.nextSibling);
		}

		this.#setCurrentBlock(target);
		this.#updatePosition(target);
		this.#$.history.push(false);
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
			this.#expandRangeToFullLines();

			// Highlight selected range lines
			const lines = this.#$.format.getLines(null);
			if (lines.length > 0) {
				this.#setHoverLines(lines);
			}

			// Choose open direction based on available space.
			const btnGlobal = this.#$.offset.getGlobal(this.#dragBtn);
			const spaceBelow = dom.utils.getClientSize().h - (btnGlobal.top - _w.scrollY + btnGlobal.height);
			const spaceAbove = btnGlobal.top - _w.scrollY;
			const horiz = this.#$.options.get('_rtl') ? 'left' : 'right';
			const dir = `${horiz}-${spaceBelow >= spaceAbove ? 'bottom' : 'top'}`;
			this.#actionMenu.open(dir);
		}
	}

	/**
	 * @description Build the action menu via {@link CommandMenu}.
	 * @returns {CommandMenu}
	 */
	#buildActionMenu() {
		const menu = new CommandMenu(this, this.#$, {
			items: this.#menuConfig,
			resolveButton: ResolveButton,
			selectMenuParams: {
				position: 'right-top',
				dir: this.#$.options.get('_rtl') ? 'rtl' : 'ltr',
				minWidth: '200px',
				keydownTarget: _w,
				closeMethod: () => {
					dom.utils.removeClass(this.#dragBtn, 'on');
					this.#clearHoverLines();
				},
				openMethod: () => {
					dom.utils.addClass(this.#dragBtn, 'on');
				},
			},
		});

		menu.attach(this.#dragBtn, this.#onActionSelect.bind(this), { class: 'se-block-action-menu' });
		menu.createRows(menu.getItems());
		return menu;
	}

	/**
	 * @description Action menu click — delegates to CommandMenu.dispatch with `{block}` as the
	 * custom-action context. CommandMenu handles plugin dispatch (modal/browser/popup/command,
	 * built-ins via commandDispatcher) and dropdown-free toggling internally.
	 * @param {*} item
	 */
	#onActionSelect(item) {
		if (!this.#currentBlock || !this.#$ || !item) return;
		this.#actionMenu?.dispatch(item, { block: this.#currentBlock });
		// Dropdown-free items keep the menu open (the flyout is the actual UI); other dispatches close.
		if (item.kind !== 'dropdownFree') this.#actionMenu?.close();
	}
}

export default BlockHandle;
