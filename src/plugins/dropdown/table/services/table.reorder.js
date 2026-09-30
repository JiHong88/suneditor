import { GetBand, GetCutLines, GetMaxColumns, GetLogicalCellIndex, InvalidateTableCache } from '../shared/table.utils';

/**
 * @description Moves whole rows or columns within a table.
 * - The unit of movement is a **band**: the range between two legal cut lines (see {@link GetCutLines}).
 * - In a table with no merges a band is one row/column; inside a merged region it widens to the whole merged block.
 * - Every mutation funnels through {@link TableReorderService#move}, which is the only place that touches the DOM.
 * - That one seam owns cache invalidation and the history entry,
 * - so a new caller cannot forget either and leave the logical-index cache stale.
 */
export class TableReorderService {
	#main;

	/**
	 * @constructor
	 * @param {import('../index').default} main Table index
	 */
	constructor(main) {
		this.#main = main;
	}

	/**
	 * @description The band the given row/column index belongs to.
	 * @param {HTMLTableElement} table Target table
	 * @param {number} index Row index, or logical column index
	 * @param {boolean} isRow `true` for a row band
	 * @returns {{start: number, end: number}} Inclusive index range
	 */
	getBand(table, index, isRow) {
		return GetBand(table, index, isRow);
	}

	/**
	 * @description Boundaries the band may be dropped at, with the no-op positions removed.
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band being dragged
	 * @param {boolean} isRow `true` for row boundaries
	 * @returns {number[]} Ascending drop boundaries
	 */
	getDropTargets(table, band, isRow) {
		if (!table || !band) return [];
		return GetCutLines(table, isRow).filter((cut) => cut !== band.start && cut !== band.end + 1);
	}

	/**
	 * @description Moves a band one step towards `direction`, over whatever sits next to it.
	 * - A step is one *band*, not one row: stepping past a merged region jumps the whole region.
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band to move
	 * @param {boolean} isRow `true` to move rows, `false` to move columns
	 * @param {-1|1} direction `-1` for up/left, `1` for down/right
	 * @returns {boolean} `true` when the table changed
	 */
	moveStep(table, band, isRow, direction) {
		const targets = this.getDropTargets(table, band, isRow);
		if (targets.length === 0) return false;

		const cut = direction < 0 ? targets.filter((t) => t < band.start).pop() : targets.find((t) => t > band.end + 1);
		if (cut === undefined) return false;

		return this.move(table, band, cut, isRow);
	}

	/**
	 * @description Moves a band so that it starts at `targetCut`.
	 * - `targetCut` is a boundary index, not a row index: `0` means "before everything", `rowCount` means "after everything".
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band to move
	 * @param {number} targetCut Destination boundary
	 * @param {boolean} isRow `true` to move rows, `false` to move columns
	 * @returns {boolean} `true` when the table changed
	 */
	move(table, band, targetCut, isRow) {
		if (!table || !band) return false;
		if (!this.getDropTargets(table, band, isRow).includes(targetCut)) return false;

		const moved = isRow ? this.#moveRows(table, band, targetCut) : this.#moveColumns(table, band, targetCut);
		if (!moved) return false;

		// The logical-index map is cached per table
		InvalidateTableCache(table);
		this.#main.historyPush();

		return true;
	}

	/**
	 * @description Re-parents the band's `<tr>` elements at the target boundary.
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band to move
	 * @param {number} targetCut Destination boundary
	 * @returns {boolean} `true` when the rows moved
	 */
	#moveRows(table, band, targetCut) {
		const rows = Array.from(table.rows);
		const moving = rows.slice(band.start, band.end + 1);
		if (moving.length === 0) return false;

		const section = moving[0].parentElement;
		if (moving.some((tr) => tr.parentElement !== section)) return false;

		const anchor = rows[targetCut] || null;
		if (anchor && anchor.parentElement !== section) return false;

		for (const tr of moving) {
			section.insertBefore(tr, anchor);
		}

		return true;
	}

	/**
	 * @description Moves the band's cells in every row, plus the matching `<col>` elements.
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band to move
	 * @param {number} targetCut Destination boundary
	 * @returns {boolean} `true` when the cells moved
	 */
	#moveColumns(table, band, targetCut) {
		const rows = table.rows;
		let changed = false;

		for (let r = 0, rLen = rows.length; r < rLen; r++) {
			const row = rows[r];
			const cells = Array.from(row.cells);

			const logical = cells.map((_cell, c) => GetLogicalCellIndex(table, r, c));

			const moving = cells.filter((_, c) => logical[c] >= band.start && logical[c] <= band.end);
			if (moving.length === 0) continue;

			// First cell at or after the target boundary; `null` appends to the row's end.
			const anchorIdx = cells.findIndex((cell, c) => logical[c] >= targetCut && !moving.includes(cell));
			const anchor = anchorIdx === -1 ? null : cells[anchorIdx];

			for (const cell of moving) {
				row.insertBefore(cell, anchor);
			}
			changed = true;
		}

		if (changed) this.#moveColElements(table, band, targetCut);

		return changed;
	}

	/**
	 * @description Keeps `<colgroup>` in step with a column move so the widths follow their columns.
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band that moved
	 * @param {number} targetCut Destination boundary
	 */
	#moveColElements(table, band, targetCut) {
		const colgroup = table.querySelector('colgroup');
		if (!colgroup) return;

		const cols = Array.from(colgroup.children);
		if (cols.length !== GetMaxColumns(table)) return;

		const moving = cols.slice(band.start, band.end + 1);
		const anchor = cols[targetCut] || null;

		for (const col of moving) {
			colgroup.insertBefore(col, anchor);
		}
	}
}

export default TableReorderService;
