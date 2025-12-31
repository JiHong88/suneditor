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
	setMultiCells(startCell: Node, endCell: Node): void;
	/**
	 * @description Initializes cell selection state and applies visual styles.
	 * Sets up the fixed cell, selected cells array, and table reference.
	 * @param {HTMLTableCellElement} tdElement The target table cell element.
	 */
	initCellSelection(tdElement: HTMLTableCellElement): void;
	/**
	 * @description Starts cell selection with global event listeners for drag/shift selection.
	 * **WARNING**: Registers global events (mousemove/mousedown, mouseup, touchmove).
	 * These events are auto-removed on mouseup/touchmove, or call `#removeGlobalEvents()` manually.
	 * @param {HTMLTableCellElement} tdElement The target table cell element.
	 * @param {boolean} shift If true, enables shift+click range selection mode.
	 */
	startCellSelection(tdElement: HTMLTableCellElement, shift: boolean): void;
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
	focusCellEdge(cell: HTMLElement): void;
	/**
	 * @description Initialize the selection service (remove global events).
	 */
	init(): void;
	#private;
}
export default TableSelectionService;
