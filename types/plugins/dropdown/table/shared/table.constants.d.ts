import type {} from '../../../../typedef';
export const ROW_SELECT_MARGIN: 6;
export const CELL_SELECT_MARGIN: 6;
export const CELL_DECIMAL_END: 0;
export const RESIZE_CELL_CLASS: '.se-table-resize-line';
export const RESIZE_CELL_PREV_CLASS: '.se-table-resize-line-prev';
export const RESIZE_ROW_CLASS: '.se-table-resize-row';
export const RESIZE_ROW_PREV_CLASS: '.se-table-resize-row-prev';
export const BORDER_LIST: string[];
export namespace BORDER_FORMATS {
	let all: string;
	let inside: string;
	let horizon: string;
	let vertical: string;
	let outside: string;
	let left: string;
	let top: string;
	let right: string;
	let bottom: string;
	let none: string;
}
export const BORDER_FORMAT_INSIDE: string[];
export namespace BORDER_NS {
	let l: string;
	let t: string;
	let r: string;
	let b: string;
}
export const DEFAULT_BORDER_UNIT: 'px';
export const DEFAULT_COLOR_LIST: string[];
/**
 * @typedef {Object} TableState
 * @property {number} physical_cellCnt The number of physical cells in the current row.
 * @property {number} logical_cellCnt The number of logical cells (columns) in the table.
 * @property {number} cellCnt Alias for `logical_cellCnt`.
 * @property {number} rowCnt The total number of rows in the table.
 * @property {number} rowIndex The index of the current row.
 * @property {number} physical_cellIndex The physical index of the current cell.
 * @property {number} logical_cellIndex The logical index of the current cell (taking colspan into account).
 * @property {number} current_colSpan The colspan of the current cell.
 * @property {number} current_rowSpan The rowspan of the current cell.
 * @property {boolean} isShiftPressed Whether the shift key is pressed (multi-selection mode).
 * @property {Object|null} ref Reference object for multi-selection range calculation.
 * @property {HTMLElement|null} figureElement The figure element wrapping the table.
 * @property {HTMLTableElement|null} selectedTable The selected table element.
 * @property {HTMLTableRowElement|null} trElement The currently active row element.
 * @property {HTMLCollectionOf<HTMLTableRowElement>|HTMLTableRowElement[]|null} trElements The collection of rows in the table.
 * @property {HTMLTableCellElement|null} tdElement The currently active cell element.
 * @property {HTMLTableCellElement|null} fixedCell The anchor cell for selection.
 * @property {HTMLTableCellElement|null} selectedCell The last selected cell.
 * @property {HTMLTableCellElement[]|null} selectedCells Array of currently selected cells.
 */
/**
 * @type {TableState}
 */
export const INITIAL_STATE: TableState;
export type TableState = {
	/**
	 * The number of physical cells in the current row.
	 */
	physical_cellCnt: number;
	/**
	 * The number of logical cells (columns) in the table.
	 */
	logical_cellCnt: number;
	/**
	 * Alias for `logical_cellCnt`.
	 */
	cellCnt: number;
	/**
	 * The total number of rows in the table.
	 */
	rowCnt: number;
	/**
	 * The index of the current row.
	 */
	rowIndex: number;
	/**
	 * The physical index of the current cell.
	 */
	physical_cellIndex: number;
	/**
	 * The logical index of the current cell (taking colspan into account).
	 */
	logical_cellIndex: number;
	/**
	 * The colspan of the current cell.
	 */
	current_colSpan: number;
	/**
	 * The rowspan of the current cell.
	 */
	current_rowSpan: number;
	/**
	 * Whether the shift key is pressed (multi-selection mode).
	 */
	isShiftPressed: boolean;
	/**
	 * Reference object for multi-selection range calculation.
	 */
	ref: any | null;
	/**
	 * The figure element wrapping the table.
	 */
	figureElement: HTMLElement | null;
	/**
	 * The selected table element.
	 */
	selectedTable: HTMLTableElement | null;
	/**
	 * The currently active row element.
	 */
	trElement: HTMLTableRowElement | null;
	/**
	 * The collection of rows in the table.
	 */
	trElements: HTMLCollectionOf<HTMLTableRowElement> | HTMLTableRowElement[] | null;
	/**
	 * The currently active cell element.
	 */
	tdElement: HTMLTableCellElement | null;
	/**
	 * The anchor cell for selection.
	 */
	fixedCell: HTMLTableCellElement | null;
	/**
	 * The last selected cell.
	 */
	selectedCell: HTMLTableCellElement | null;
	/**
	 * Array of currently selected cells.
	 */
	selectedCells: HTMLTableCellElement[] | null;
};
