export const ROW_SELECT_MARGIN = 6;
export const CELL_SELECT_MARGIN = 6;
export const CELL_DECIMAL_END = 0;

export const RESIZE_CELL_CLASS = '.se-table-resize-line';
export const RESIZE_CELL_PREV_CLASS = '.se-table-resize-line-prev';
export const RESIZE_ROW_CLASS = '.se-table-resize-row';
export const RESIZE_ROW_PREV_CLASS = '.se-table-resize-row-prev';

export const BORDER_LIST = ['none', 'solid', 'dotted', 'dashed', 'double', 'groove', 'ridge', 'inset', 'outset'];

export const BORDER_FORMATS = {
	all: 'border_all',
	inside: 'border_inside',
	horizon: 'border_horizontal',
	vertical: 'border_vertical',
	outside: 'border_outside',
	left: 'border_left',
	top: 'border_top',
	right: 'border_right',
	bottom: 'border_bottom',
	none: 'border_none',
};

export const BORDER_FORMAT_INSIDE = ['all', 'inside', 'horizon', 'vertical'];

export const BORDER_NS = {
	l: 'borderLeft',
	t: 'borderTop',
	r: 'borderRight',
	b: 'borderBottom',
};

export const DEFAULT_BORDER_UNIT = 'px';

export const DEFAULT_COLOR_LIST = [
	// row-1 (light)
	'#bbf7d0',
	'#fde68a',
	'#fecaca',
	'#e9d5ff',
	'#bfdbfe',
	// row-2 (vivid)
	'#22c55e',
	'#eab308',
	'#ef4444',
	'#a855f7',
	'#3b82f6',
	// row-3 (deep)
	'#15803d',
	'#ca8a04',
	'#b91c1c',
	'#7e22ce',
	'#1d4ed8',
	// row-4 (gray)
	'#e5e7eb',
	'#9ca3af',
	'#6b7280',
	'#374151',
	'#000000',
];

/**
 * @typedef {Object} TableState
 * @property {number} physical_cellCnt The number of physical cells in the current row.
 * @property {number} logical_cellCnt The number of logical cells (columns) in the table.
 * @property {number} cellCnt Alias for logical_cellCnt.
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
export const INITIAL_STATE = {
	physical_cellCnt: 0,
	logical_cellCnt: 0,
	cellCnt: 0,
	rowCnt: 0,
	rowIndex: 0,
	physical_cellIndex: 0,
	logical_cellIndex: 0,
	current_colSpan: 0,
	current_rowSpan: 0,
	isShiftPressed: false,
	ref: null,
	figureElement: null,
	selectedTable: null,
	trElement: null,
	trElements: null,
	tdElement: null,
	fixedCell: null,
	selectedCell: null,
	selectedCells: null,
};
