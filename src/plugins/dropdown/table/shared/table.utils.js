import { dom, numbers, env } from '../../../../helper';
import * as Constants from './table.constants';

const { _w } = env;

/** @type {WeakMap<HTMLTableElement, Map<string, {cs: number, ce: number, rs: number, re: number}>>} */
export const refCache = new WeakMap();

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
 * @param {string} nodeName The tag name of the cell (TD or TH).
 * @param {number} cnt The number of cells to create.
 * @returns {string} The created cells.
 */
export function CreateCellsString(nodeName, cnt) {
	nodeName = nodeName.toLowerCase();
	return `<${nodeName}><div><br></div></${nodeName}>`.repeat(cnt);
}

/**
 * @description Creates table cells as element HTML.
 * @param {string} nodeName The tag name of the cell (TD or TH).
 * @returns {HTMLTableCellElement} The created cells.
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
 * @param {number} rowIndex The row index of the cell.
 * @param {number} cellIndex The physical cell index.
 * @returns {number} The logical cell index.
 */
export function GetLogicalCellIndex(table, rowIndex, cellIndex) {
	const rows = table.rows;
	let rowSpanArr = [];
	let spanIndex = [];
	let logicalIndex = 0;

	for (let i = 0, cells, colSpan; i <= rowIndex; i++) {
		cells = rows[i].cells;
		colSpan = 0;

		for (let c = 0, cLen = cells.length, currentCell, cs, rs, logcalIndex; c < cLen; c++) {
			currentCell = cells[c];
			cs = currentCell.colSpan - 1;
			rs = currentCell.rowSpan - 1;
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

			if (i === rowIndex && c === cellIndex) {
				logicalIndex = logcalIndex;
				break;
			}

			if (rs > 0) {
				rowSpanArr.push({
					index: logcalIndex,
					cs: cs + 1,
					rs: rs,
					row: -1,
				});
			}

			colSpan += cs;
		}

		spanIndex = spanIndex.concat(rowSpanArr).sort((a, b) => a.index - b.index);
		rowSpanArr = [];
	}

	return logicalIndex;
}

/**
 * @description Clone a table element and map selected cells to the cloned table
 * @param {HTMLTableElement} table <table> element
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
 * @description Clear table cache
 * @param {HTMLTableElement} table The table element.
 */
export function InvalidateTableCache(table) {
	if (!table) return;
	refCache.delete(table);
}
