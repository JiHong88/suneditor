import type {} from '../../../../typedef';
/**
 * @description Table clipboard service for handling copy and paste operations within tables.
 */
export class TableClipboardService {
	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main: import('../index').default);
	/**
	 * @description Creates the table properties controller.
	 * @param {ClipboardEvent} e - Event object
	 * @param {HTMLElement} container - The container element
	 * @param {NodeListOf<HTMLTableCellElement>} selectedCells - The selected table cells
	 */
	copySelectedTableCells(e: ClipboardEvent, container: HTMLElement, selectedCells: NodeListOf<HTMLTableCellElement>): void;
	/**
	 * @description Updates the target table's cells with the data from the copied table.
	 * @param {HTMLTableElement} copyTable The table containing the copied data.
	 * @param {HTMLTableCellElement} targetTD The starting cell in the target table where data will be pasted.
	 * @returns {HTMLTableCellElement[]} The array of cells that were updated with pasted data.
	 */
	pasteTableCellMatrix(copyTable: HTMLTableElement, targetTD: HTMLTableCellElement): HTMLTableCellElement[];
	#private;
}
export default TableClipboardService;
