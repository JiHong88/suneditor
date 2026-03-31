import type {} from '../../../../typedef';
/** ================================================================================================================================ */
/**
 * @description Checks if the given node is a resizable table element.
 * @param {Node} node The DOM node to check.
 * @returns {boolean} True if the node is a table-related resizable element.
 */
export function IsResizeEls(node: Node): boolean;
/**
 * @description Check table caption
 * @param {Node} node The DOM node to check.
 * @returns {boolean}
 */
export function IsTableCaption(node: Node): boolean;
/**
 * @description Checks if a table cell is at its edge based on the mouse event.
 * @param {MouseEvent} event The mouse event.
 * @param {Element} tableCell The table cell to check.
 * @returns {Object} An object containing edge detection details.
 */
export function CheckCellEdge(event: MouseEvent, tableCell: Element): any;
/**
 * @description Checks if a row is at its edge based on the mouse event.
 * @param {MouseEvent} event The mouse event.
 * @param {Element} tableCell The table row cell to check.
 * @returns {Object} An object containing row edge detection details.
 */
export function CheckRowEdge(event: MouseEvent, tableCell: Element): any;
/**
 * @description Creates table cells as elements strings.
 * @param {string} nodeName The tag name of the cell (`TD` or `TH`).
 * @param {number} cnt The number of cells to create.
 * @returns {string} The created cells string.
 */
export function CreateCellsString(nodeName: string, cnt: number): string;
/**
 * @description Creates table cells as element HTML.
 * @param {string} nodeName The tag name of the cell (`TD` or `TH`).
 * @returns {HTMLTableCellElement} The created cell element.
 */
export function CreateCellsHTML(nodeName: string): HTMLTableCellElement;
/**
 * @description Gets the maximum number of columns in a table.
 * @param {HTMLTableElement} table The table element.
 * @returns {number} The maximum number of columns in the table.
 */
export function GetMaxColumns(table: HTMLTableElement): number;
/**
 * @description Gets the logical cell index for a cell in a table.
 * @param {HTMLTableElement} table The table element.
 * @param {number} rowIndex The physical row index.
 * @param {number} cellIndex The physical cell index.
 * @returns {number} The logical cell index.
 */
export function GetLogicalCellIndex(table: HTMLTableElement, rowIndex: number, cellIndex: number): number;
/**
 * @description Clone a table element and map selected cells to the cloned table
 * @param {HTMLTableElement} table `<table>` element
 * @param {HTMLTableCellElement[]} selectedCells Selected cells array
 * @returns {{ clonedTable: HTMLTableElement, clonedSelectedCells: HTMLTableCellElement[] }}
 */
export function CloneTable(
	table: HTMLTableElement,
	selectedCells: HTMLTableCellElement[],
): {
	clonedTable: HTMLTableElement;
	clonedSelectedCells: HTMLTableCellElement[];
};
/**
 * @description Clear table cache
 * @param {HTMLTableElement} table The table element.
 */
export function InvalidateTableCache(table: HTMLTableElement): void;
/**
 * @description Cache for selected cell range references. (Use drag cells)
 * - Stores the calculated logical start/end positions (row, col) for a given selection.
 * @type {WeakMap<HTMLTableElement, Map<string, {cs: number, ce: number, rs: number, re: number, _i: number}>>}
 */
export const refCache: WeakMap<
	HTMLTableElement,
	Map<
		string,
		{
			cs: number;
			ce: number;
			rs: number;
			re: number;
			_i: number;
		}
	>
>;
