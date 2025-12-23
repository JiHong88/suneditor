import type {} from '../../../../typedef';
export class TableSelectionService {
	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main: import('../index').default);
	/**
	 * @description Selects a group of table cells and sets internal state related to multi-cell selection.
	 * @param {HTMLTableCellElement[]} cells - An array of table cell elements to be selected.
	 * @returns {{ fixedCell: HTMLTableCellElement, selectedCell: HTMLTableCellElement }} The fixed and selected cells.
	 */
	selectCells(cells: HTMLTableCellElement[]): {
		fixedCell: HTMLTableCellElement;
		selectedCell: HTMLTableCellElement;
	};
	/**
	 * @internal
	 * @description Selects multiple table cells and applies selection styles.
	 * @param {Node} startCell The first cell in the selection.
	 * @param {Node} endCell The last cell in the selection.
	 */
	_setMultiCells(startCell: Node, endCell: Node): void;
	/**
	 * @description Selects cells in a table, handling single and multi-cell selection, and managing shift key behavior for extended selection.
	 * @param {HTMLTableCellElement} tdElement The target table cell (`<td>`) element that is being selected.
	 * @param {boolean} shift A flag indicating whether the shift key is held down for multi-cell selection.
	 * If `true`, the selection will extend to include adjacent cells, otherwise it selects only the provided cell.
	 */
	initCellSelection(tdElement: HTMLTableCellElement, shift: boolean): void;
	/**
	 * @description Deletes styles from selected table cells.
	 */
	deleteStyleSelectedCells(): void;
	/**
	 * @description Restores styles for selected table cells.
	 */
	recallStyleSelectedCells(): void;
	/**
	 * @description Focus cell
	 * @param {HTMLElement} cell Target node
	 */
	_focusEdge(cell: HTMLElement): void;
	init(): void;
	#private;
}
export default TableSelectionService;
