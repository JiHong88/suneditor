import { dom, env, keyCodeMap, numbers } from '../../../../helper';
import { Controller } from '../../../../modules/contract';
import * as Constants from '../shared/table.constants';
import { GetLogicalCellIndex } from '../shared/table.utils';

const { _w } = env;

/** Strip thickness. (.sun-editor .se-table-move-handle-column/.sun-editor .se-table-move-handle-row) */
const HANDLE_HIT_SIZE = 24;

/** Grace delay before a reset hides the strips */
const HIDE_GRACE_MS = 250;

/** Overshoot margin past a strip where `hideOutside` defers to the grace timer instead of hiding. */
const OVERSHOOT_MARGIN = 20;

/**
 * @description Drag-move handles for whole rows/columns (band = merged block unit).
 * - The DOM mutation goes through `TableReorderService.move` (owns cache/history)
 * — this service is view/gesture only.
 */
export class TableHandleService {
	#main;
	#$;

	#globalEvents = { move: null, stop: null, keydown: null, pinUp: null };
	#moving = false;

	/** Band under the cursor per axis: `{ table, band, boxStart }` */
	#rowCtx = null;
	#colCtx = null;

	/** Live drag state: `{ table, band, isRow, drops, range, chosen }` */
	#drag = null;

	/** Last hovered cell — anchor for repositioning after a figure scroll */
	#lastCell = null;
	#scrollRafId = null;
	/** `refresh`'s visible box of the table, shared by both strips' `place` within that call */
	#refreshBox = null;
	/** Pending grace-hide timer id */
	#hideTimer = null;
	/** Global keydown while pinned — Esc releases the pin */
	#pinKeydownEvent = null;

	/** @type {WeakMap<HTMLElement, {[selector: string]: HTMLElement}>} Per-root drag overlays (band source/target) */
	#els = new WeakMap();

	/**
	 * @description The row strip
	 * @type {SunEditor.Module.Controller.Instance}
	 */
	rowStrip;

	/**
	 * @description The column strip
	 * @type {SunEditor.Module.Controller.Instance}
	 */
	columnStrip;

	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main) {
		this.#main = main;
		this.#$ = main.$;

		this.rowStrip = this.#createStrip(true);
		this.columnStrip = this.#createStrip(false);

		this.#$.contextProvider.applyToRoots((e) => {
			const wrapper = e.get('wrapper');
			const els = /** @type {{[selector: string]: HTMLElement}} */ ({});
			this.#els.set(wrapper, els);

			els[Constants.MOVE_BAND_SOURCE_CLASS] = dom.utils.createElement('DIV', {
				class: Constants.MOVE_BAND_SOURCE_CLASS.replace(/^\./, ''),
			});
			els[Constants.MOVE_BAND_TARGET_CLASS] = dom.utils.createElement('DIV', {
				class: Constants.MOVE_BAND_TARGET_CLASS.replace(/^\./, ''),
			});
			wrapper.appendChild(els[Constants.MOVE_BAND_SOURCE_CLASS]);
			wrapper.appendChild(els[Constants.MOVE_BAND_TARGET_CLASS]);

			// scrolls inside the content (e.g. a scrolled figure) — the wysiwyg's own scroll is the core's
			const wysiwyg = e.get('wysiwyg');
			this.#$.eventManager.addEvent(wysiwyg, 'scroll', (event) => this.#OnFigureScroll(event, wysiwyg), {
				passive: true,
				capture: true,
			});
		});
	}

	/**
	 * @description Creates a strip (with its grip band box) and its in-editor controller.
	 * - Hosted by the current root's wrapper until an `open` moves it to the active root.
	 * @param {boolean} isRow `true` for the row strip
	 * @returns {SunEditor.Module.Controller.Instance}
	 */
	#createStrip(isRow) {
		const selector = isRow ? Constants.MOVE_HANDLE_ROW_CLASS : Constants.MOVE_HANDLE_COLUMN_CLASS;
		const label = isRow ? this.#$.lang.moveRow : this.#$.lang.moveColumn;
		const strip = dom.utils.createElement('DIV', {
			class: `se-table-move-handle ${selector.replace(/^\./, '')}`,
			title: label,
			'aria-label': label,
		});
		// the grip's band box — a real element so the handle menu (a Controller) can anchor to it
		strip.appendChild(dom.utils.createElement('DIV', { class: Constants.MOVE_GRIP_CLASS.replace(/^\./, '') }));
		this.#$.frameContext.get('wrapper').appendChild(strip);

		this.#$.eventManager.addEvent(strip, 'mousedown', this.#OnHandleMouseDown.bind(this, isRow));
		this.#$.eventManager.addEvent(strip, 'mousemove', this.#OnHandleMouseMove.bind(this, isRow));

		return new Controller(this, this.#$, strip, {
			container: 'wrapper',
			selection: true,
			place: () => this.#placeStrip(isRow),
		});
	}

	/**
	 * @description `place` of a strip — Sizes the strip and moves the grip onto the context's band.
	 * @param {boolean} isRow `true` for the row strip
	 * @returns {?{left: number, top: number}} Wrapper-local position, `null` while the table is out of its figure's view
	 */
	#placeStrip(isRow) {
		const ctx = isRow ? this.#rowCtx : this.#colCtx;
		const table = ctx?.table;
		const box = this.#refreshBox?.table === table ? this.#refreshBox.box : this.#visibleBox(table);
		if (!box) return null;

		const { top: visTop, bottom: visBottom, left: visLeft, right: visRight } = box;
		const isRtl = !!this.#$.options.get('_rtl');
		const strip = (isRow ? this.rowStrip : this.columnStrip).form;

		if (isRow) {
			strip.style.height = `${visBottom - visTop}px`;
			ctx.boxStart = visTop;
			this.#setGrip(true, ctx);
			return { left: isRtl ? visRight : visLeft - HANDLE_HIT_SIZE, top: visTop };
		}

		const boxLeft = isRtl ? visLeft : visLeft - HANDLE_HIT_SIZE;
		strip.style.width = `${(isRtl ? visRight + HANDLE_HIT_SIZE : visRight) - boxLeft}px`;
		ctx.boxStart = boxLeft;
		this.#setGrip(false, ctx);
		return { left: boxLeft, top: visTop - HANDLE_HIT_SIZE };
	}

	/**
	 * @description The table's visible box inside its figure (wrapper-local).
	 * @param {?HTMLTableElement} table Target table
	 * @returns {?{top: number, bottom: number, left: number, right: number}} `null` while out of the figure's view
	 */
	#visibleBox(table) {
		const figure = /** @type {HTMLElement} */ (dom.query.getParentElement(table, dom.check.isFigure));
		if (!table?.isConnected || !figure) return null;

		const tableOffset = this.#$.offset.getLocal(table);
		const figureOffset = this.#$.offset.getLocal(figure);
		// clientWidth/Height 0 (jsdom, unrendered) means "no viewport", not "empty"
		const viewRight = figure.clientWidth ? figureOffset.left + figure.clientWidth : Infinity;
		const viewBottom = figure.clientHeight ? figureOffset.top + figure.clientHeight : Infinity;

		const top = Math.max(tableOffset.top, figureOffset.top);
		const bottom = Math.min(tableOffset.top + table.offsetHeight, viewBottom);
		const left = Math.max(tableOffset.left, figureOffset.left);
		const right = Math.min(tableOffset.left + table.offsetWidth, viewRight);
		if (bottom - top <= 0 || right - left <= 0) return null;

		return { top, bottom, left, right };
	}

	/**
	 * @description Shows (opens on the cell) or hides (closes) a strip.
	 * @param {boolean} isRow `true` for the row strip
	 * @param {HTMLTableCellElement} cell The hovered cell
	 * @param {boolean} visible Whether to show it
	 */
	#toggleStrip(isRow, cell, visible) {
		const strip = isRow ? this.rowStrip : this.columnStrip;
		if (visible) strip.open(cell);
		else strip.close();
	}

	get #reorder() {
		return this.#main.reorderService;
	}

	/**
	 * @description Whether a handle drag is in progress.
	 * @returns {boolean}
	 */
	isMoving() {
		return this.#moving;
	}

	/**
	 * @description Repositions both handles for the hovered cell. Shown only while the figure is selected.
	 * - Positions clamp to the figure's visible area (scrolled figures).
	 * @param {?HTMLTableCellElement} cell The hovered table cell (non-cells are ignored).
	 */
	refresh(cell) {
		if (this.#moving || !dom.check.isTableCell(cell)) return;

		if (
			this.#isControllerVisible(this.#main.controller_table) ||
			this.#isControllerVisible(this.#main.controller_cell)
		) {
			this.hide();
			return;
		}

		const table = /** @type {HTMLTableElement} */ (dom.query.getParentElement(cell, 'TABLE'));
		const figure = /** @type {HTMLElement} */ (dom.query.getParentElement(table, dom.check.isFigure));

		const pinnedHere = this.#isPinned() && (this.#rowCtx || this.#colCtx)?.table === table;
		if (!table || !figure || (!dom.utils.hasClass(figure, 'se-component-selected') && !pinnedHere)) {
			if (!this.#isPinned()) this.hide();
			return;
		}

		const rowHandle = this.rowStrip.form;
		const columnHandle = this.columnStrip.form;

		const row = /** @type {HTMLTableRowElement} */ (cell.parentElement);
		const pinned = this.#pinHolds(table, rowHandle, columnHandle);
		const rowActive = dom.utils.hasClass(rowHandle, 'active');

		this.#rowCtx = {
			table,
			band: pinned && this.#rowCtx ? this.#rowCtx.band : this.#reorder.getBand(table, row.rowIndex, true),
			boxStart: this.#rowCtx?.boxStart ?? 0,
		};
		this.#colCtx = {
			table,
			band:
				pinned && this.#colCtx
					? this.#colCtx.band
					: this.#reorder.getBand(table, GetLogicalCellIndex(table, row.rowIndex, cell.cellIndex), false),
			boxStart: this.#colCtx?.boxStart ?? 0,
		};

		this.#refreshBox = { table, box: this.#visibleBox(table) };
		try {
			this.#toggleStrip(true, cell, !(pinned && !rowActive));
			this.#toggleStrip(false, cell, !(pinned && rowActive));
		} finally {
			this.#refreshBox = null;
		}

		this.#lastCell = cell;
		this.#cancelScheduledHide();
	}

	/**
	 * @description Whether the pin holds for `table` — both grips freeze while pinned.
	 * - A pin left on another table is released (selection included).
	 * @param {HTMLTableElement} table Current table
	 * @param {HTMLElement} rowHandle Row handle element
	 * @param {HTMLElement} columnHandle Column handle element
	 * @returns {boolean}
	 */
	#pinHolds(table, rowHandle, columnHandle) {
		if (!this.#isPinned()) return false;
		if ((this.#rowCtx || this.#colCtx)?.table === table) return true;

		dom.utils.removeClass([rowHandle, columnHandle], 'active');
		this.#removePinKeydown();
		this.#main.gridService.closeMenus();
		this.#clearBandSelection();
		return false;
	}

	/**
	 * @description Whether a handle is pinned (`active`) on a still-connected table.
	 * @returns {boolean}
	 */
	isPinned() {
		return this.#isPinned();
	}

	/**
	 * @description Whether a handle is pinned (`active`) on a still-connected table.
	 * - Pointer-driven hides are ignored while pinned; explicit hides (click) are not.
	 * - A scroll repositions the pinned strips (and the menu on the grip) instead of hiding them.
	 * @returns {boolean}
	 */
	#isPinned() {
		const table = (this.#rowCtx || this.#colCtx)?.table;
		if (!table || !table.isConnected) return false;

		return this.#pinnedAxis() !== null;
	}

	/**
	 * @description Positions the grip pill over the context's band (clipped by the strip).
	 * - The grip's band box is hidden while it lies entirely outside the strip.
	 * @param {boolean} isRow `true` for the row handle
	 * @param {{table: HTMLTableElement, band: {start: number, end: number}, boxStart: number}} ctx Handle context
	 */
	#setGrip(isRow, ctx) {
		const handle = this.#strip(isRow).form;
		const span = this.#bandLocalSpan(ctx.table, ctx.band, isRow);
		if (!span) return;

		const start = span.start - ctx.boxStart;
		handle.style.setProperty('--se-table-grip-start', `${start}px`);
		handle.style.setProperty('--se-table-grip-size', `${span.size}px`);

		const stripSize = numbers.get(isRow ? handle.style.height : handle.style.width, 0);
		this.#grip(isRow).style.display = start + span.size > 0 && start < stripSize ? '' : 'none';
	}

	/**
	 * @description The grip band box of a handle.
	 * @param {boolean} isRow `true` for the row handle
	 * @returns {HTMLElement}
	 */
	#grip(isRow) {
		return this.#strip(isRow).form.querySelector(Constants.MOVE_GRIP_CLASS);
	}

	/**
	 * @description The band's wrapper-local start/size on the given axis.
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Target band
	 * @param {boolean} isRow `true` for the row axis
	 * @returns {?{start: number, size: number}}
	 */
	#bandLocalSpan(table, band, isRow) {
		if (isRow) {
			const rows = table.rows;
			const startRow = rows[band.start];
			const endRow = rows[band.end];
			if (!startRow || !endRow) return null;

			const start = this.#$.offset.getLocal(startRow).top;
			return { start, size: this.#$.offset.getLocal(endRow).top + endRow.offsetHeight - start };
		}

		const edges = this.#findBandEdgeCells(table, band);
		if (!edges) return null;

		const startOffset = this.#$.offset.getLocal(edges.start);
		const endOffset = this.#$.offset.getLocal(edges.end);
		const start = Math.min(startOffset.left, endOffset.left);
		return {
			start,
			size: Math.max(startOffset.left + edges.start.offsetWidth, endOffset.left + edges.end.offsetWidth) - start,
		};
	}

	/**
	 * @description Finds the band under a viewport coordinate.
	 * @param {HTMLTableElement} table Target table
	 * @param {number} coord `clientY` for rows, `clientX` for columns
	 * @param {boolean} isRow `true` for a row band
	 * @returns {?{start: number, end: number}}
	 */
	#bandFromPoint(table, coord, isRow) {
		const rows = table.rows;
		for (let r = 0, rLen = rows.length; r < rLen; r++) {
			// row loop
			if (isRow) {
				const rect = rows[r].getBoundingClientRect();
				if (coord >= rect.top && coord <= rect.bottom) return this.#reorder.getBand(table, r, true);
				continue;
			}

			// column loop
			const cells = rows[r].cells;
			for (let c = 0, cLen = cells.length; c < cLen; c++) {
				const rect = cells[c].getBoundingClientRect();
				if (coord >= rect.left && coord <= rect.right)
					return this.#reorder.getBand(table, GetLogicalCellIndex(table, r, c), false);
			}
		}

		return null;
	}

	/**
	 * @description Slides the grip to the band under the pointer on the strip.
	 * @param {boolean} isRow `true` for the row handle
	 * @param {MouseEvent} event The mousemove event
	 */
	#OnHandleMouseMove(isRow, event) {
		if (this.#moving) return;

		this.#cancelScheduledHide();

		const ctx = isRow ? this.#rowCtx : this.#colCtx;
		if (!ctx) return;

		if (this.#isPinned()) return;

		const point = this.#toFrameCoords(event.clientX, event.clientY);
		const band = this.#bandFromPoint(ctx.table, isRow ? point.y : point.x, isRow);
		if (!band || (band.start === ctx.band.start && band.end === ctx.band.end)) return;

		ctx.band = band;
		this.#setGrip(isRow, ctx);
	}

	/**
	 * @description Converts outer-document client coords to wysiwyg-frame coords.
	 * - Handle/drag events fire in the outer document, but cell rects are iframe-relative.
	 * @param {number} x `clientX`
	 * @param {number} y `clientY`
	 * @returns {{x: number, y: number}}
	 */
	#toFrameCoords(x, y) {
		const frame = this.#$.frameContext.get('wysiwygFrame');
		if (!frame || !/^iframe$/i.test(frame.nodeName)) return { x, y };

		const rect = frame.getBoundingClientRect();
		return { x: x - rect.left, y: y - rect.top };
	}

	/**
	 * @description Hides both handles. No-op while a drag is in progress.
	 */
	hide() {
		if (this.#moving) return;
		this.#cancelScheduledHide();

		// unpinning always drops the pinned band selection with it
		const wasPinned = this.#pinnedAxis() !== null;

		this.rowStrip.close();
		this.columnStrip.close();
		dom.utils.removeClass([this.rowStrip.form, this.columnStrip.form], 'active');

		this.#rowCtx = null;
		this.#colCtx = null;
		this.#lastCell = null;

		if (wasPinned) {
			this.#removePinKeydown();
			this.#main.gridService.closeMenus();
			this.#clearBandSelection();
		}
	}

	/**
	 * @description Hides the handles on wysiwyg mouseleave, unless the pointer is on/near a strip.
	 * - Geometric check: floating UI (line breaker, controller) can capture the pointer over a strip.
	 * @param {MouseEvent} event The mouseleave event
	 */
	hideOnLeave(event) {
		if (this.#isPinned()) return;
		const related = /** @type {?Element} */ (event?.relatedTarget);
		if (related && dom.utils.hasClass(related, 'se-table-move-handle')) return;
		if (event && this.#pointNearTable(event.clientX, event.clientY)) return;
		this.hide();
	}

	/**
	 * @description Whether a viewport point is on the table or its strips (table rect expanded on the strip sides).
	 * @param {number} x `clientX`
	 * @param {number} y `clientY`
	 * @param {number} [extra=0] Additional margin
	 * @returns {boolean}
	 */
	#pointNearTable(x, y, extra = 0) {
		const table = (this.#rowCtx || this.#colCtx)?.table;
		if (!table) return false;

		const isRtl = !!this.#$.options.get('_rtl');
		const rect = table.getBoundingClientRect();
		return (
			x >= rect.left - (isRtl ? 1 : HANDLE_HIT_SIZE + 1) - extra &&
			x <= rect.right + (isRtl ? HANDLE_HIT_SIZE + 1 : 1) + extra &&
			y >= rect.top - HANDLE_HIT_SIZE - 1 - extra &&
			y <= rect.bottom + 1 + extra
		);
	}

	/**
	 * @description Hides the handles unless the pointer is still inside the handles' figure
	 * or within the overshoot margin (the grace timer hides there instead).
	 * @param {?Node} target The hovered node
	 * @param {MouseEvent} [event] The mousemove event
	 */
	hideOutside(target, event) {
		if (this.#isPinned()) return;
		const table = (this.#rowCtx || this.#colCtx)?.table;
		if (
			table &&
			target &&
			dom.query.getParentElement(target, dom.check.isFigure) ===
				dom.query.getParentElement(table, dom.check.isFigure)
		)
			return;
		if (event && this.#pointNearTable(event.clientX, event.clientY, OVERSHOOT_MARGIN)) return;
		this.hide();
	}

	/**
	 * @description Whether a controller is open AND actually showing.
	 * @param {?SunEditor.Module.Controller.Instance} controller Controller
	 * @returns {boolean}
	 */
	#isControllerVisible(controller) {
		return !!controller?.isOpen && controller.form?.style.display !== 'none';
	}

	/**
	 * @description The pinned axis: `true` = row, `false` = column, `null` = not pinned.
	 * @returns {?boolean}
	 */
	#pinnedAxis() {
		if (dom.utils.hasClass(this.rowStrip.form, 'active')) return true;
		if (dom.utils.hasClass(this.columnStrip.form, 'active')) return false;
		return null;
	}

	/**
	 * @description Moves the pin onto the band a handle-menu insert just created.
	 * - An insert-before lands at the old band's start (the old band shifts away);
	 * an insert-after lands right past its end.
	 * @param {boolean} isBefore `true` for insert above/left
	 */
	repinAfterInsert(isBefore) {
		const isRow = this.#pinnedAxis();
		if (isRow === null) return;

		const ctx = isRow ? this.#rowCtx : this.#colCtx;
		if (!ctx || !ctx.table.isConnected) return;

		const band = this.#reorder.getBand(ctx.table, isBefore ? ctx.band.start : ctx.band.end + 1, isRow);
		ctx.band = band;

		const cells = this.#selectBandCells(ctx.table, band, isRow);
		if (cells) this.refresh(cells[0]);
	}

	/**
	 * @description Re-aims the pin after a handle-menu action changed the table structure.
	 * - The selected cells' element references survive moves/inserts, so the band is
	 * re-derived from them; a deleted band (references disconnected) releases the pin.
	 */
	repinFromSelection() {
		const isRow = this.#pinnedAxis();
		if (isRow === null) return;

		const cell = this.#main.state.selectedCells?.[0];
		if (!cell || !cell.isConnected) {
			this.#removePinKeydown();
			dom.utils.removeClass([this.rowStrip.form, this.columnStrip.form], 'active');
			this.#clearBandSelection();
			this.hide();
			this.#main.dotService.showTableDot();
			return;
		}

		const table = /** @type {HTMLTableElement} */ (dom.query.getParentElement(cell, 'TABLE'));
		const row = /** @type {HTMLTableRowElement} */ (cell.parentElement);
		const band = isRow
			? this.#reorder.getBand(table, row.rowIndex, true)
			: this.#reorder.getBand(table, GetLogicalCellIndex(table, row.rowIndex, cell.cellIndex), false);

		const ctx = isRow ? this.#rowCtx : this.#colCtx;
		if (ctx) {
			ctx.table = table;
			ctx.band = band;
		}

		// reposition strips and grip for the (possibly resized) table
		this.refresh(cell);
	}

	/**
	 * @description Service reset — aborts any drag and hides the handles after the grace delay.
	 * - Delayed because a reset can come from an overshoot deselect; returning onto a strip cancels it.
	 */
	init() {
		this.#finishDrag();
		this.#scheduleHide();
		this.#restorePinnedSelection();
	}

	/**
	 * @description Re-applies the pinned band's selection after a component deselect wiped it.
	 * - Deferred: the core's deselect strips the selection classes in its own 0ms timeout,
	 * so the restore must be queued behind it.
	 */
	#restorePinnedSelection() {
		if (!this.#isPinned()) return;

		_w.setTimeout(() => {
			if (!this.#isPinned()) return;

			const isRow = this.#pinnedAxis() === true;
			const ctx = isRow ? this.#rowCtx : this.#colCtx;
			if (ctx) this.#selectBandCells(ctx.table, ctx.band, isRow);
		}, 0);
	}

	/**
	 * @description Schedules a grace-delayed hide.
	 */
	#scheduleHide() {
		this.#cancelScheduledHide();
		this.#hideTimer = _w.setTimeout(() => {
			this.#hideTimer = null;
			if (this.#isPinned()) return;
			this.hide();
		}, HIDE_GRACE_MS);
	}

	/**
	 * @description Cancels the pending grace hide.
	 */
	#cancelScheduledHide() {
		if (this.#hideTimer === null) return;
		_w.clearTimeout(this.#hideTimer);
		this.#hideTimer = null;
	}

	/**
	 * @description Re-places the strips after a scroll inside the content (one update per frame)
	 * @param {Event} event The scroll event
	 * @param {HTMLElement} wysiwyg The wysiwyg of the root the listener belongs to
	 */
	#OnFigureScroll(event, wysiwyg) {
		if (this.#moving || this.#scrollRafId !== null) return;
		if (dom.query.getEventTarget(event) === wysiwyg || wysiwyg !== this.#$.frameContext.get('wysiwyg')) return;

		this.#scrollRafId = _w.requestAnimationFrame(() => {
			this.#scrollRafId = null;
			const cell = this.#lastCell;
			if (!cell) return;
			if (!cell.isConnected) {
				this.hide();
				return;
			}
			if (this.rowStrip.isOpen) this.rowStrip.resetPosition();
			if (this.columnStrip.isOpen) this.columnStrip.resetPosition();
		});
	}

	/**
	 * @description Starts a band drag from a handle.
	 * @param {boolean} isRow `true` when the row handle was grabbed
	 * @param {MouseEvent} event The mousedown event
	 */
	#OnHandleMouseDown(isRow, event) {
		if (event.button !== 0 || this.#moving) return;

		event.preventDefault();
		event.stopPropagation();

		this.#cancelScheduledHide();
		this.#main.dotService.hide();

		const ctx = isRow ? this.#rowCtx : this.#colCtx;
		if (!ctx) return;

		const pressed = this.#strip(isRow).form;
		const sibling = this.#strip(!isRow).form;

		// snap the band to the pressed point (hover-follow is off while pinned)
		const point = this.#toFrameCoords(event.clientX, event.clientY);
		const band = this.#bandFromPoint(ctx.table, isRow ? point.y : point.x, isRow);
		// pressing the already-pinned band again releases the pin (on mouseup, unless dragged)
		const toggleOff =
			dom.utils.hasClass(pressed, 'active') &&
			(!band || (band.start === ctx.band.start && band.end === ctx.band.end));
		if (band) {
			ctx.band = band;
			this.#setGrip(isRow, ctx);
		}

		this.#selectBandCells(ctx.table, ctx.band, isRow);
		dom.utils.removeClass(sibling, 'active');
		this.#strip(!isRow).close();
		dom.utils.addClass(pressed, 'active');
		this.#pinKeydownEvent ??= this.#$.eventManager.addGlobalEvent('keydown', this.#OnPinKeyDown.bind(this), false);

		const drops = this.#collectDrops(ctx.table, ctx.band, isRow);
		if (drops.length === 0) {
			// not draggable — one-shot for this press; also removed by #releaseActive (Esc while held)
			this.#removePinUp();
			this.#globalEvents.pinUp = this.#$.eventManager.addGlobalEvent(
				'mouseup',
				() => {
					this.#removePinUp();
					if (toggleOff) this.#releaseActive(isRow);
					else this.#openPinMenu(isRow);
				},
				false,
			);
			return;
		}

		const range = this.#bandPixelRange(ctx.table, ctx.band, isRow);
		if (!range) return;

		this.#moving = true;
		this.#drag = { table: ctx.table, band: ctx.band, isRow, drops, range, chosen: null, toggleOff };

		dom.utils.addClass(this.#strip(isRow).form, 'se-dragging');

		// yellow overlay on the grabbed band
		const source = this.#element(Constants.MOVE_BAND_SOURCE_CLASS);
		if (source) {
			const tableOffset = this.#$.offset.getLocal(ctx.table);
			if (isRow) {
				source.style.top = `${range.localStart}px`;
				source.style.height = `${range.localEnd - range.localStart}px`;
				source.style.left = `${tableOffset.left}px`;
				source.style.width = `${ctx.table.offsetWidth}px`;
			} else {
				source.style.left = `${range.localStart}px`;
				source.style.width = `${range.localEnd - range.localStart}px`;
				source.style.top = `${tableOffset.top}px`;
				source.style.height = `${ctx.table.offsetHeight}px`;
			}
			source.style.display = 'block';
		}

		this.#main.resizeService.offResizeGuide();
		this.#$.store.set('_preventBlur', true);
		this.#main._editorEnable(false);
		this.#$.ui.enableBackWrapper('grabbing');

		this.#globalEvents.move = this.#$.eventManager.addGlobalEvent('mousemove', this.#OnDragMove.bind(this), false);
		this.#globalEvents.stop = this.#$.eventManager.addGlobalEvent('mouseup', this.#OnDragEnd.bind(this), false);
		this.#globalEvents.keydown = this.#$.eventManager.addGlobalEvent(
			'keydown',
			this.#OnDragKeyDown.bind(this),
			false,
		);

		this.#OnDragMove(event);
	}

	/**
	 * @description Tracks the pointer during a drag — the band under the pointer becomes the
	 * drop target (highlighted whole); the grabbed band will land on its far side.
	 * @param {MouseEvent} event The mousemove event
	 */
	#OnDragMove(event) {
		const drag = this.#drag;
		if (!drag) return;

		const point = this.#toFrameCoords(event.clientX, event.clientY);
		const coord = drag.isRow ? point.y : point.x;
		const range = drag.range;

		let chosen = null;
		let overBand = null;
		if (coord < range.clientStart || coord > range.clientEnd) {
			const rect = drag.table.getBoundingClientRect();
			const [min, max] = drag.isRow ? [rect.top, rect.bottom] : [rect.left, rect.right];
			overBand = this.#bandFromPoint(drag.table, Math.min(Math.max(coord, min + 1), max - 1), drag.isRow);

			if (overBand && !(overBand.start === drag.band.start && overBand.end === drag.band.end)) {
				// far side of the target band (logical order - RTL-safe)
				const cut = overBand.start > drag.band.end ? overBand.end + 1 : overBand.start;
				if (drag.drops.includes(cut)) chosen = cut;
				else overBand = null;
			} else {
				overBand = null;
			}
		}
		drag.chosen = chosen;

		const target = this.#element(Constants.MOVE_BAND_TARGET_CLASS);
		if (!target) return;

		const span = overBand && this.#bandLocalSpan(drag.table, overBand, drag.isRow);
		if (!span) {
			target.style.display = 'none';
			return;
		}

		const tableOffset = this.#$.offset.getLocal(drag.table);
		if (drag.isRow) {
			target.style.top = `${span.start}px`;
			target.style.height = `${span.size}px`;
			target.style.left = `${tableOffset.left}px`;
			target.style.width = `${drag.table.offsetWidth}px`;
		} else {
			target.style.left = `${span.start}px`;
			target.style.width = `${span.size}px`;
			target.style.top = `${tableOffset.top}px`;
			target.style.height = `${drag.table.offsetHeight}px`;
		}

		target.style.display = 'block';
	}

	/**
	 * @description Drops the grabbed band on the chosen boundary and selects it at its new position.
	 */
	#OnDragEnd() {
		const drag = this.#drag;
		this.#finishDrag();

		if (!drag) return;

		if (drag.chosen === null) {
			if (drag.toggleOff) this.#releaseActive(drag.isRow);
			else this.#openPinMenu(drag.isRow);
			return;
		}

		if (this.#reorder.move(drag.table, drag.band, drag.chosen, drag.isRow)) {
			this.#releaseActive(drag.isRow, true);
			const newBand = this.#selectMovedBand(drag.table, drag.band, drag.chosen, drag.isRow);
			const ctx = drag.isRow ? this.#rowCtx : this.#colCtx;
			if (ctx) {
				ctx.band = newBand;
				this.#setGrip(drag.isRow, ctx);
			}
			this.#main.cellService.setMergeSplitButton();
			this.#main.selectionService.showSelection();
		}
	}

	/**
	 * @description Applies the multi-cell selection to the moved band so the result stays visible.
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band BEFORE the move
	 * @param {number} cut The boundary it was dropped on
	 * @param {boolean} isRow `true` for a row move
	 */
	#selectMovedBand(table, band, cut, isRow) {
		const size = band.end - band.start + 1;
		const start = cut < band.start ? cut : cut - size;
		const newBand = { start, end: start + size - 1 };
		this.#selectBandCells(table, newBand, isRow);
		return newBand;
	}

	/**
	 * @description Applies the multi-cell selection to a band.
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Target band
	 * @param {boolean} isRow `true` for a row band
	 */
	#selectBandCells(table, band, isRow) {
		const cells = [];
		const rows = table.rows;

		if (isRow) {
			for (let r = band.start; r <= band.end; r++) cells.push(...rows[r].cells);
		} else {
			for (let r = 0, rLen = rows.length; r < rLen; r++) {
				const rowCells = rows[r].cells;
				for (let c = 0, cLen = rowCells.length; c < cLen; c++) {
					const from = GetLogicalCellIndex(table, r, c);
					if (from <= band.end && from + rowCells[c].colSpan - 1 >= band.start) cells.push(rowCells[c]);
				}
			}
		}

		if (cells.length === 0) return null;

		this.#main.setState('selectedTable', table);
		const { fixedCell, selectedCell } = this.#main.selectionService.selectCells(cells);
		this.#main.setState('selectedCells', cells);
		this.#main.setState('fixedCell', fixedCell);
		this.#main.setState('selectedCell', selectedCell);
		this.#main.setCellInfo(cells[0], true);
		return cells;
	}

	/**
	 * @description Releases the pinned state — active class off, band selection cleared.
	 * @param {boolean} isRow `true` for the row handle
	 * @param {boolean} [keepSelection=false] Keep the band selection (the caller shows it as a cell selection)
	 */
	#releaseActive(isRow, keepSelection = false) {
		this.#removePinKeydown();
		this.#removePinUp();
		this.#main.gridService.closeMenus();

		dom.utils.removeClass(this.#strip(isRow).form, 'active');

		if (this.#lastCell && this.#rowCtx && this.#colCtx) this.#toggleStrip(!isRow, this.#lastCell, true);
		if (keepSelection) return;

		this.#clearBandSelection();
		this.#main.dotService.showTableDot();
	}

	/**
	 * @description Opens the row/column menu anchored on the pinned grip.
	 * - Safe against the pin click itself: SelectMenu closes on outside MOUSEDOWN, and this
	 * runs at mouseup.
	 * @param {boolean} isRow `true` for the row handle
	 */
	#openPinMenu(isRow) {
		const ctx = isRow ? this.#rowCtx : this.#colCtx;
		if (!ctx) return;

		this.#main.gridService[isRow ? 'openRowMenuForHandle' : 'openColumnMenuForHandle'](this.#grip(isRow));
	}

	/**
	 * @description Releases the pin on Escape, like the other controllers.
	 * @param {KeyboardEvent} event The keydown event
	 */
	#OnPinKeyDown(event) {
		if (this.#moving || !keyCodeMap.isEsc(event.code)) return;

		this.#releaseActive(this.#pinnedAxis() === true);
	}

	/**
	 * @description Removes the pin's global keydown listener.
	 */
	#removePinKeydown() {
		this.#pinKeydownEvent &&= this.#$.eventManager.removeGlobalEvent(this.#pinKeydownEvent);
	}

	/**
	 * @description Removes the pending pin mouseup listener.
	 */
	#removePinUp() {
		this.#globalEvents.pinUp &&= this.#$.eventManager.removeGlobalEvent(this.#globalEvents.pinUp);
	}

	/**
	 * @description Clears the band selection — styles and the selection state.
	 */
	#clearBandSelection() {
		this.#main.selectionService.deleteStyleSelectedCells();
		this.#main.setState('selectedCells', null);
		this.#main.setState('fixedCell', null);
		this.#main.setState('selectedCell', null);
	}

	/**
	 * @description Cancels the drag on Escape.
	 * @param {KeyboardEvent} event The keydown event
	 */
	#OnDragKeyDown(event) {
		if (!keyCodeMap.isEsc(event.code)) return;
		this.#finishDrag();
		this.hide();
	}

	/**
	 * @description Removes drag state, global events, and drag-only UI.
	 */
	#finishDrag() {
		const wasMoving = this.#moving;
		this.#moving = false;
		this.#drag = null;

		const globalEvents = this.#globalEvents;
		for (const k in globalEvents) {
			globalEvents[k] &&= this.#$.eventManager.removeGlobalEvent(globalEvents[k]);
		}

		if (!wasMoving) return;

		this.#$.ui.disableBackWrapper();
		this.#main._editorEnable(true);

		const source = this.#element(Constants.MOVE_BAND_SOURCE_CLASS);
		if (source) source.style.display = 'none';
		const target = this.#element(Constants.MOVE_BAND_TARGET_CLASS);
		if (target) target.style.display = 'none';
		dom.utils.removeClass([this.rowStrip.form, this.columnStrip.form], 'se-dragging');
	}

	/**
	 * @description The band's pixel span on the drag axis (`client*` for pointer checks, `local*` for drawing).
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band being dragged
	 * @param {boolean} isRow `true` for a row drag
	 * @returns {?{clientStart: number, clientEnd: number, localStart: number, localEnd: number}}
	 */
	#bandPixelRange(table, band, isRow) {
		if (isRow) {
			const rows = table.rows;
			const startRow = rows[band.start];
			const endRow = rows[band.end];
			return {
				clientStart: startRow.getBoundingClientRect().top,
				clientEnd: endRow.getBoundingClientRect().bottom,
				localStart: this.#$.offset.getLocal(startRow).top,
				localEnd: this.#$.offset.getLocal(endRow).top + endRow.offsetHeight,
			};
		}

		const edges = this.#findBandEdgeCells(table, band);
		if (!edges) return null;

		const startRect = edges.start.getBoundingClientRect();
		const endRect = edges.end.getBoundingClientRect();
		const startLocal = this.#$.offset.getLocal(edges.start).left;
		const endLocal = this.#$.offset.getLocal(edges.end).left;
		return {
			clientStart: Math.min(startRect.left, endRect.left),
			clientEnd: Math.max(startRect.right, endRect.right),
			localStart: Math.min(startLocal, endLocal),
			localEnd: Math.max(startLocal + edges.start.offsetWidth, endLocal + edges.end.offsetWidth),
		};
	}

	/**
	 * @description The legal drop boundaries (row cuts in another `thead`/`tbody` section are skipped).
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band being dragged
	 * @param {boolean} isRow `true` for a row drag
	 * @returns {number[]} Ascending boundary indices
	 */
	#collectDrops(table, band, isRow) {
		const cuts = this.#reorder.getDropTargets(table, band, isRow);
		if (!isRow) return cuts;

		const rows = table.rows;
		const section = rows[band.start].parentElement;
		const lastRow = rows[rows.length - 1];
		return cuts.filter((cut) => {
			const anchor = rows[cut];
			return anchor ? anchor.parentElement === section : lastRow.parentElement === section;
		});
	}

	/**
	 * @description Finds the cells forming a column band's left/right edges.
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Column band
	 * @returns {?{start: HTMLTableCellElement, end: HTMLTableCellElement}}
	 */
	#findBandEdgeCells(table, band) {
		let start = null;
		let end = null;
		const rows = table.rows;
		for (let r = 0, rLen = rows.length; r < rLen && (!start || !end); r++) {
			const cells = rows[r].cells;
			for (let c = 0, cLen = cells.length; c < cLen; c++) {
				const from = GetLogicalCellIndex(table, r, c);
				if (!start && from === band.start) start = cells[c];
				if (!end && from + cells[c].colSpan - 1 === band.end) end = cells[c];
			}
		}
		return start && end ? { start, end } : null;
	}

	/**
	 * @description A move-handle strip (one per editor).
	 * @param {boolean} isRow `true` for the row strip
	 * @returns {SunEditor.Module.Controller.Instance}
	 */
	#strip(isRow) {
		return isRow ? this.rowStrip : this.columnStrip;
	}

	/**
	 * @description The current root's band overlay element.
	 * @param {string} selector `MOVE_BAND_SOURCE_CLASS` / `MOVE_BAND_TARGET_CLASS` from `table.constants`
	 * @returns {?HTMLElement}
	 */
	#element(selector) {
		return this.#els.get(this.#$.frameContext.get('wrapper'))?.[selector] || null;
	}
}

export default TableHandleService;
