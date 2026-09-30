import { dom, numbers, env } from '../../../../helper';
import * as Constants from './table.constants';

const { _w } = env;

/**
 * @description Cache for selected cell range references. (Use drag cells)
 * - Stores the calculated logical start/end positions (row, col) for a given selection.
 * @type {WeakMap<HTMLTableElement, Map<string, {cs: number, ce: number, rs: number, re: number, _i: number}>>}
 */
export const refCache = new WeakMap();

/**
 * @description Cache for mapping a table’s physical coordinates (row, cellIndex) to a logical column index
 * @type {WeakMap<HTMLTableElement, number[][]>}
 */
const logicalIndexMapCache = new WeakMap();

/**
 * @description Builds a matrix of logical indices for the table.
 * @param {HTMLTableElement} table The table element.
 * @returns {number[][]} A 2D array where matrix[row][cell] = logicalColumnIndex.
 */
function BuildMatrix(table) {
	const matrix = [];

	const rows = table.rows;
	const rowSpanMap = [];
	for (let r = 0, rLen = rows.length; r < rLen; r++) {
		const cells = rows[r].cells;
		matrix[r] = [];

		let logicalCol = 0;
		for (let c = 0, cLen = cells.length; c < cLen; c++) {
			while (rowSpanMap[r]?.[logicalCol]) {
				logicalCol++;
			}

			matrix[r][c] = logicalCol;

			// span calc
			const cell = cells[c];
			const colspan = cell.colSpan || 1;
			const rowspan = cell.rowSpan || 1;

			if (rowspan > 1) {
				for (let rs = 1; rs < rowspan; rs++) {
					if (!rowSpanMap[r + rs]) rowSpanMap[r + rs] = [];
					for (let cs = 0; cs < colspan; cs++) {
						rowSpanMap[r + rs][logicalCol + cs] = true;
					}
				}
			}

			logicalCol += colspan;
		}
	}

	return matrix;
}

/** ================================================================================================================================ */

/**
 * @description Expands a two-cell selection into the smallest logical rectangle that cuts no merged cell.
 * - Shared by cell multi-selection and row/column reordering, so both treat a merged region as one block.
 * @param {HTMLCollectionOf<HTMLTableRowElement>} rows
 * @param {Node} startCell
 * @param {Node} endCell
 * @returns {{_i: number, cs: number|null, ce: number|null, rs: number|null, re: number|null}}
 */
export function CalculateCellRef(rows, startCell, endCell) {
	let findSelectedCell = true;
	let spanIndex = [];
	let rowSpanArr = [];
	const ref = { _i: 0, cs: null, ce: null, rs: null, re: null };

	for (let i = 0, len = rows.length, cells, colSpan; i < len; i++) {
		cells = rows[i].cells;
		colSpan = 0;

		for (let c = 0, cLen = cells.length, cell, logcalIndex, cs, rs; c < cLen; c++) {
			cell = cells[c];
			cs = cell.colSpan - 1;
			rs = cell.rowSpan - 1;
			logcalIndex = c + colSpan;

			if (spanIndex.length > 0) {
				for (let r = 0, arr; r < spanIndex.length; r++) {
					arr = spanIndex[r];
					if (arr.row > i) continue;
					if (logcalIndex >= arr.index) {
						colSpan += arr.cs;
						logcalIndex += arr.cs;
						arr.rs -= 1;
						arr.row = i + 1;
						if (arr.rs < 1) {
							spanIndex.splice(r, 1);
							r--;
						}
					} else if (c === cLen - 1) {
						arr.rs -= 1;
						arr.row = i + 1;
						if (arr.rs < 1) {
							spanIndex.splice(r, 1);
							r--;
						}
					}
				}
			}

			if (findSelectedCell) {
				if (cell === startCell || cell === endCell) {
					ref.cs = ref.cs !== null && ref.cs < logcalIndex ? ref.cs : logcalIndex;
					ref.ce = ref.ce !== null && ref.ce > logcalIndex + cs ? ref.ce : logcalIndex + cs;
					ref.rs = ref.rs !== null && ref.rs < i ? ref.rs : i;
					ref.re = ref.re !== null && ref.re > i + rs ? ref.re : i + rs;
					ref._i += 1;
				}

				if (ref._i === 2) {
					findSelectedCell = false;
					spanIndex = [];
					rowSpanArr = [];
					i = -1;
					break;
				}
			} else {
				const newCs = ref.cs < logcalIndex ? ref.cs : logcalIndex;
				const newCe = ref.ce > logcalIndex + cs ? ref.ce : logcalIndex + cs;
				const newRs = ref.rs < i ? ref.rs : i;
				const newRe = ref.re > i + rs ? ref.re : i + rs;

				if (
					numbers.getOverlapRangeAtIndex(ref.cs, ref.ce, logcalIndex, logcalIndex + cs) &&
					numbers.getOverlapRangeAtIndex(ref.rs, ref.re, i, i + rs)
				) {
					if (ref.cs !== newCs || ref.ce !== newCe || ref.rs !== newRs || ref.re !== newRe) {
						ref.cs = newCs;
						ref.ce = newCe;
						ref.rs = newRs;
						ref.re = newRe;
						i = -1;

						spanIndex = [];
						rowSpanArr = [];
						break;
					}
				}
			}

			if (rs > 0) {
				rowSpanArr.push({
					index: logcalIndex,
					cs: cs + 1,
					rs: rs,
					row: -1,
				});
			}

			colSpan += cell.colSpan - 1;
		}

		spanIndex = spanIndex.concat(rowSpanArr).sort((a, b) => a.index - b.index);
		rowSpanArr = [];
	}

	return ref;
}

/**
 * @description Checks if the given node is a resizable table element.
 * @param {Node} node The DOM node to check.
 * @returns {boolean} True if the node is a table-related resizable element.
 */
export function IsResizeEls(node) {
	return /^(TD|TH|TR)$/i.test(node?.nodeName);
}

/**
 * @description Check table caption
 * @param {Node} node The DOM node to check.
 * @returns {boolean}
 */
export function IsTableCaption(node) {
	return /^CAPTION$/i.test(node.nodeName);
}

/**
 * @description Checks if a table cell is at its edge based on the mouse event.
 * @param {MouseEvent} event The mouse event.
 * @param {Element} tableCell The table cell to check.
 * @returns {Object} An object containing edge detection details.
 */
export function CheckCellEdge(event, tableCell) {
	const startX = event.clientX;
	const startWidth = numbers.get(_w.getComputedStyle(tableCell).width, Constants.CELL_DECIMAL_END);
	const rect = tableCell.getBoundingClientRect();
	const offsetX = Math.round(startX - rect.left);
	const isLeft = offsetX <= Constants.CELL_SELECT_MARGIN;
	const is = isLeft || startWidth - offsetX <= Constants.CELL_SELECT_MARGIN;

	return {
		is,
		isLeft,
		startX,
	};
}

/**
 * @description Checks if a row is at its edge based on the mouse event.
 * @param {MouseEvent} event The mouse event.
 * @param {Element} tableCell The table row cell to check.
 * @returns {Object} An object containing row edge detection details.
 */
export function CheckRowEdge(event, tableCell) {
	const startY = event.clientY;
	const startHeight = numbers.get(_w.getComputedStyle(tableCell).height, Constants.CELL_DECIMAL_END);
	const rect = tableCell.getBoundingClientRect();
	const is = Math.ceil(startHeight + rect.top - startY) <= Constants.ROW_SELECT_MARGIN;

	return {
		is,
		startY,
	};
}

/**
 * @description Creates table cells as elements strings.
 * @param {string} nodeName The tag name of the cell (`TD` or `TH`).
 * @param {number} cnt The number of cells to create.
 * @returns {string} The created cells string.
 */
export function CreateCellsString(nodeName, cnt) {
	nodeName = nodeName.toLowerCase();
	return `<${nodeName}><div><br></div></${nodeName}>`.repeat(cnt);
}

/**
 * @description Creates table cells as element HTML.
 * @param {string} nodeName The tag name of the cell (`TD` or `TH`).
 * @returns {HTMLTableCellElement} The created cell element.
 */
export function CreateCellsHTML(nodeName) {
	nodeName = nodeName.toLowerCase();
	return /** @type {HTMLTableCellElement} */ (dom.utils.createElement(nodeName, null, '<div><br></div>'));
}

/**
 * @description Gets the maximum number of columns in a table.
 * @param {HTMLTableElement} table The table element.
 * @returns {number} The maximum number of columns in the table.
 */
export function GetMaxColumns(table) {
	const rows = table.rows;
	let maxColumns = 0;

	for (let i = 0, len = rows.length; i < len; i++) {
		const cells = rows[i].cells;
		let columnCount = 0;

		for (let j = 0, jLen = cells.length; j < jLen; j++) {
			columnCount += cells[j].colSpan;
		}

		maxColumns = Math.max(maxColumns, columnCount);
	}

	return maxColumns;
}

/**
 * @description Gets the logical cell index for a cell in a table.
 * @param {HTMLTableElement} table The table element.
 * @param {number} rowIndex The physical row index.
 * @param {number} cellIndex The physical cell index.
 * @returns {number} The logical cell index.
 */
export function GetLogicalCellIndex(table, rowIndex, cellIndex) {
	let indexMap = logicalIndexMapCache.get(table);

	if (!indexMap) {
		indexMap = BuildMatrix(table);
		logicalIndexMapCache.set(table, indexMap);
	}

	return indexMap[rowIndex]?.[cellIndex] ?? 0;
}

/**
 * @description Clone a table element and map selected cells to the cloned table
 * @param {HTMLTableElement} table `<table>` element
 * @param {HTMLTableCellElement[]} selectedCells Selected cells array
 * @returns {{ clonedTable: HTMLTableElement, clonedSelectedCells: HTMLTableCellElement[] }}
 */
export function CloneTable(table, selectedCells) {
	/** @type {HTMLTableElement} */
	const clonedTable = dom.utils.clone(table, true);

	const originalCells = Array.from(table.querySelectorAll('td, th'));
	const clonedCells = Array.from(clonedTable.querySelectorAll('td, th'));

	const clonedSelectedCells = /** @type {HTMLTableCellElement[]} */ (
		selectedCells
			.map((cell) => {
				const index = originalCells.indexOf(cell);
				return index > -1 ? clonedCells[index] : null;
			})
			.filter((cell) => cell !== null)
	);

	return {
		clonedTable,
		clonedSelectedCells,
	};
}

/**
 * @description The row (or column) boundaries a reorder is allowed to cut at.
 * @param {HTMLTableElement} table The table element.
 * @param {boolean} isRow `true` for row boundaries, `false` for logical column boundaries.
 * @returns {number[]} Ascending legal cut indices.
 */
export function GetCutLines(table, isRow) {
	if (!table) return [];

	const rows = table.rows;
	const total = isRow ? rows.length : GetMaxColumns(table);
	if (total < 1) return [0];

	const crossed = new Array(total + 1).fill(false);

	for (let r = 0, rLen = rows.length; r < rLen; r++) {
		const cells = rows[r].cells;
		for (let c = 0, cLen = cells.length; c < cLen; c++) {
			const cell = cells[c];
			const span = (isRow ? cell.rowSpan : cell.colSpan) || 1;
			if (span < 2) continue;

			const start = isRow ? r : GetLogicalCellIndex(table, r, c);
			for (let k = start + 1; k < start + span; k++) {
				if (k > 0 && k < total) crossed[k] = true;
			}
		}
	}

	const cuts = [];
	for (let k = 0; k <= total; k++) {
		if (!crossed[k]) cuts.push(k);
	}

	return cuts;
}

/**
 * @description The band containing `index` — the smallest range between two legal cut lines.
 * - For a table with no merges every band is a single row/column, so the handle covers one row.
 * - Inside a merged region the band widens to the whole merged block,
 * - which is what the drag handle sizes itself to and what a move carries as a unit.
 * @param {HTMLTableElement} table The table element.
 * @param {number} index Row index, or logical column index.
 * @param {boolean} isRow `true` for a row band, `false` for a column band.
 * @returns {{start: number, end: number}} Inclusive index range.
 */
export function GetBand(table, index, isRow) {
	const total = isRow ? table?.rows.length || 0 : GetMaxColumns(table);
	const cuts = GetCutLines(table, isRow);

	let start = 0;
	for (let i = 0, len = cuts.length; i < len; i++) {
		if (cuts[i] <= index) start = cuts[i];
		else return { start, end: cuts[i] - 1 };
	}

	return { start, end: total - 1 };
}

/**
 * @description Clear table cache
 * @param {HTMLTableElement} table The table element.
 */
export function InvalidateTableCache(table) {
	if (!table) return;
	refCache.delete(table);
	logicalIndexMapCache.delete(table);
}
