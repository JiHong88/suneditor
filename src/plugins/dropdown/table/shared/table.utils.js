import { dom, numbers, env } from '../../../../helper';
import { _DragHandle } from '../../../../modules/utils';
import * as Constants from './table.constants';

const { _w } = env;

/**
 * @description Checks if the given node is a resizable table element.
 * @param {Node} node The DOM node to check.
 * @returns {boolean} True if the node is a table-related resizable element.
 */
export function IsResizeEls(node) {
	return /^(TD|TH|TR)$/i.test(node?.nodeName);
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
