import { dom, env, keyCodeMap } from '../../../../helper';
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

	#globalEvents = { move: null, stop: null, keydown: null };
	#moving = false;

	/** Band under the cursor per axis: `{ table, band, boxStart }` */
	#rowCtx = null;
	#colCtx = null;

	/** Live drag state: `{ table, band, isRow, drops, range, chosen }` */
	#drag = null;

	/** Last hovered cell — anchor for repositioning after a figure scroll */
	#lastCell = null;
	#scrollRafId = null;
	/** Pending grace-hide timer id */
	#hideTimer = null;

	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main) {
		this.#main = main;
		this.#$ = main.$;

		const rowClass = Constants.MOVE_HANDLE_ROW_CLASS.replace(/^\./, '');
		const columnClass = Constants.MOVE_HANDLE_COLUMN_CLASS.replace(/^\./, '');

		this.#$.contextProvider.applyToRoots((e) => {
			const wrapper = e.get('wrapper');
			const rowHandle = dom.utils.createElement('DIV', {
				class: `se-table-move-handle ${rowClass}`,
				title: this.#$.lang.moveRow,
				'aria-label': this.#$.lang.moveRow,
			});
			const columnHandle = dom.utils.createElement('DIV', {
				class: `se-table-move-handle ${columnClass}`,
				title: this.#$.lang.moveColumn,
				'aria-label': this.#$.lang.moveColumn,
			});

			wrapper.appendChild(rowHandle);
			wrapper.appendChild(columnHandle);
			wrapper.appendChild(
				dom.utils.createElement('DIV', { class: Constants.MOVE_BAND_SOURCE_CLASS.replace(/^\./, '') }),
			);
			wrapper.appendChild(
				dom.utils.createElement('DIV', { class: Constants.MOVE_BAND_TARGET_CLASS.replace(/^\./, '') }),
			);

			this.#$.eventManager.addEvent(rowHandle, 'mousedown', this.#OnHandleMouseDown.bind(this, true));
			this.#$.eventManager.addEvent(columnHandle, 'mousedown', this.#OnHandleMouseDown.bind(this, false));
			this.#$.eventManager.addEvent(rowHandle, 'mousemove', this.#OnHandleMouseMove.bind(this, true));
			this.#$.eventManager.addEvent(columnHandle, 'mousemove', this.#OnHandleMouseMove.bind(this, false));

			this.#$.eventManager.addEvent(e.get('wysiwyg'), 'scroll', this.#OnFigureScroll.bind(this), {
				passive: true,
				capture: true,
			});
		});
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

		const table = /** @type {HTMLTableElement} */ (dom.query.getParentElement(cell, 'TABLE'));
		const figure = /** @type {HTMLElement} */ (dom.query.getParentElement(table, dom.check.isFigure));
		if (!table || !figure || !dom.utils.hasClass(figure, 'se-component-selected')) {
			this.hide();
			return;
		}

		const rowHandle = this.#element(Constants.MOVE_HANDLE_ROW_CLASS);
		const columnHandle = this.#element(Constants.MOVE_HANDLE_COLUMN_CLASS);
		if (!rowHandle || !columnHandle) return;

		const row = /** @type {HTMLTableRowElement} */ (cell.parentElement);
		const tableOffset = this.#$.offset.getLocal(table);
		const figureOffset = this.#$.offset.getLocal(figure);
		// clientWidth/Height 0 (jsdom, unrendered) means "no viewport", not "empty"
		const viewRight = figure.clientWidth ? figureOffset.left + figure.clientWidth : Infinity;
		const viewBottom = figure.clientHeight ? figureOffset.top + figure.clientHeight : Infinity;

		// the table's visible box inside the figure
		const visTop = Math.max(tableOffset.top, figureOffset.top);
		const visBottom = Math.min(tableOffset.top + table.offsetHeight, viewBottom);
		const visLeft = Math.max(tableOffset.left, figureOffset.left);
		const visRight = Math.min(tableOffset.left + table.offsetWidth, viewRight);
		if (visBottom - visTop <= 0 || visRight - visLeft <= 0) {
			this.hide();
			return;
		}

		const isRtl = !!this.#$.options.get('_rtl');

		// row handle - full-height strip on the left edge (right in RTL)
		rowHandle.style.top = `${visTop}px`;
		rowHandle.style.height = `${visBottom - visTop}px`;
		rowHandle.style.left = `${isRtl ? visRight : visLeft - HANDLE_HIT_SIZE}px`;
		rowHandle.style.display = 'block';
		this.#rowCtx = { table, band: this.#reorder.getBand(table, row.rowIndex, true), boxStart: visTop };
		this.#setGrip(true, this.#rowCtx);

		// column handle - full-width strip on the top edge, extended over the row handle's corner
		const boxLeft = isRtl ? visLeft : visLeft - HANDLE_HIT_SIZE;
		columnHandle.style.left = `${boxLeft}px`;
		columnHandle.style.width = `${(isRtl ? visRight + HANDLE_HIT_SIZE : visRight) - boxLeft}px`;
		columnHandle.style.top = `${visTop - HANDLE_HIT_SIZE}px`;
		columnHandle.style.display = 'block';
		this.#colCtx = {
			table,
			band: this.#reorder.getBand(table, GetLogicalCellIndex(table, row.rowIndex, cell.cellIndex), false),
			boxStart: boxLeft,
		};
		this.#setGrip(false, this.#colCtx);

		this.#lastCell = cell;
		this.#cancelScheduledHide();
	}

	/**
	 * @description Positions the grip pill over the context's band (clipped by the strip).
	 * @param {boolean} isRow `true` for the row handle
	 * @param {{table: HTMLTableElement, band: {start: number, end: number}, boxStart: number}} ctx Handle context
	 */
	#setGrip(isRow, ctx) {
		const handle = this.#element(isRow ? Constants.MOVE_HANDLE_ROW_CLASS : Constants.MOVE_HANDLE_COLUMN_CLASS);
		if (!handle) return;

		const span = this.#bandLocalSpan(ctx.table, ctx.band, isRow);
		if (!span) return;

		handle.style.setProperty('--se-table-grip-start', `${span.start - ctx.boxStart}px`);
		handle.style.setProperty('--se-table-grip-size', `${span.size}px`);
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
			const endRow = rows[band.end];
			const start = this.#$.offset.getLocal(rows[band.start]).top;
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

		const rowHandle = this.#element(Constants.MOVE_HANDLE_ROW_CLASS);
		const columnHandle = this.#element(Constants.MOVE_HANDLE_COLUMN_CLASS);
		if (rowHandle) rowHandle.style.display = 'none';
		if (columnHandle) columnHandle.style.display = 'none';

		this.#rowCtx = null;
		this.#colCtx = null;
		this.#lastCell = null;
	}

	/**
	 * @description Hides the handles on wysiwyg mouseleave, unless the pointer is on/near a strip.
	 * - Geometric check: floating UI (line breaker, controller) can capture the pointer over a strip.
	 * @param {MouseEvent} event The mouseleave event
	 */
	hideOnLeave(event) {
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
	 * @description Service reset — aborts any drag and hides the handles after the grace delay.
	 * - Delayed because a reset can come from an overshoot deselect; returning onto a strip cancels it.
	 */
	init() {
		this.#finishDrag();
		this.#scheduleHide();
	}

	/**
	 * @description Schedules a grace-delayed hide.
	 */
	#scheduleHide() {
		this.#cancelScheduledHide();
		this.#hideTimer = _w.setTimeout(() => {
			this.#hideTimer = null;
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
	 * @description Repositions visible handles after a figure scroll (one update per frame).
	 */
	#OnFigureScroll() {
		if (this.#moving || this.#scrollRafId !== null) return;

		this.#scrollRafId = _w.requestAnimationFrame(() => {
			this.#scrollRafId = null;
			const cell = this.#lastCell;
			if (!cell) return;
			if (!cell.isConnected) {
				this.hide();
				return;
			}
			this.refresh(cell);
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

		const ctx = isRow ? this.#rowCtx : this.#colCtx;
		if (!ctx) return;

		// snap the band to the pressed point
		this.#OnHandleMouseMove(isRow, event);

		const drops = this.#collectDrops(ctx.table, ctx.band, isRow);
		if (drops.length === 0) return;

		const range = this.#bandPixelRange(ctx.table, ctx.band, isRow);
		if (!range) return;

		this.#moving = true;
		this.#drag = { table: ctx.table, band: ctx.band, isRow, drops, range, chosen: null };

		dom.utils.addClass(
			this.#element(isRow ? Constants.MOVE_HANDLE_ROW_CLASS : Constants.MOVE_HANDLE_COLUMN_CLASS),
			'se-dragging',
		);

		const other = this.#element(isRow ? Constants.MOVE_HANDLE_COLUMN_CLASS : Constants.MOVE_HANDLE_ROW_CLASS);
		if (other) other.style.display = 'none';

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
	 * @description Drops the grabbed band on the chosen boundary.
	 */
	#OnDragEnd() {
		const drag = this.#drag;
		this.#finishDrag();

		if (drag && drag.chosen !== null) {
			this.#reorder.move(drag.table, drag.band, drag.chosen, drag.isRow);
		}

		this.hide();
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
		dom.utils.removeClass(
			[this.#element(Constants.MOVE_HANDLE_ROW_CLASS), this.#element(Constants.MOVE_HANDLE_COLUMN_CLASS)],
			'se-dragging',
		);
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
	 * @description The current root's handle/overlay element.
	 * @param {string} selector Class selector from `table.constants`
	 * @returns {?HTMLElement}
	 */
	#element(selector) {
		return this.#$.frameContext.get('wrapper')?.querySelector(selector);
	}
}

export default TableHandleService;
