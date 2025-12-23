import type {} from '../../../../typedef';
/**
 * @description Checks if the given node is a resizable table element.
 * @param {Node} node The DOM node to check.
 * @returns {boolean} True if the node is a table-related resizable element.
 */
export function IsResizeEls(node: Node): boolean;
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
 * @param {string} nodeName The tag name of the cell (TD or TH).
 * @param {number} cnt The number of cells to create.
 * @returns {string} The created cells.
 */
export function CreateCellsString(nodeName: string, cnt: number): string;
/**
 * @description Creates table cells as element HTML.
 * @param {string} nodeName The tag name of the cell (TD or TH).
 * @returns {HTMLTableCellElement} The created cells.
 */
export function CreateCellsHTML(nodeName: string): HTMLTableCellElement;
/**
 * @description Gets the maximum number of columns in a table.
 * @param {HTMLTableElement} table The table element.
 * @returns {number} The maximum number of columns in the table.
 */
export function GetMaxColumns(table: HTMLTableElement): number;
/**
 * @description Clone a table element and map selected cells to the cloned table
 * @param {HTMLTableElement} table <table> element
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
