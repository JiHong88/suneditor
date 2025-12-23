import type {} from '../../../../typedef';
export class TableResizeService {
	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main: import('../index').default);
	/**
	 * @description Checks if the table is currently being resized.
	 * @returns {boolean}
	 */
	isResizing(): boolean;
	onResizeGuide(event: any, target: any): boolean;
	offResizeGuide(): void;
	readyResizeFromEdge(event: any, target: any): boolean;
	/**
	 * @internal
	 * @description Starts resizing a table cell.
	 * @param {HTMLElement} col The column element.
	 * @param {number} startX The starting X position.
	 * @param {number} startWidth The initial width of the column.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	_startCellResizing(col: HTMLElement, startX: number, startWidth: number, isLeftEdge: boolean): void;
	/**
	 * @internal
	 * @description Starts resizing a table row.
	 * @param {HTMLElement} row The table row element.
	 * @param {number} startY The starting Y position.
	 * @param {number} startHeight The initial height of the row.
	 */
	_startRowResizing(row: HTMLElement, startY: number, startHeight: number): void;
	/**
	 * @internal
	 * @description Starts resizing the table figure.
	 * @param {number} startX The starting X position.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	_startFigureResizing(startX: number, isLeftEdge: boolean): void;
	/**
	 * @internal
	 * @description Stops resizing the table.
	 * @param {HTMLElement} target The target element.
	 * @param {string} prevValue The previous style value.
	 * @param {string} styleProp The CSS property being changed.
	 * @param {KeyboardEvent} e The keyboard event.
	 */
	_stopResize(target: HTMLElement, prevValue: string, styleProp: string, e: KeyboardEvent): void;
	init(): void;
	#private;
}
export default TableResizeService;
