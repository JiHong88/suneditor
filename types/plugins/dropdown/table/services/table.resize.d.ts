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
	/**
	 * @description Display a guide line during resize operations logic.
	 * @param {MouseEvent} event - Mouse event
	 * @param {HTMLElement} target - Target element (table cell or row)
	 * @returns {boolean|undefined} Returns false if resizing started, otherwise undefined.
	 */
	onResizeGuide(event: MouseEvent, target: HTMLElement): boolean | undefined;
	/**
	 * @description Hides the resize guide line.
	 */
	offResizeGuide(): void;
	/**
	 * @description Prepares for resizing from the edge of a cell or row.
	 * @param {MouseEvent} event - Mouse event
	 * @param {HTMLTableCellElement} target - Target element
	 * @returns {boolean|undefined} Returns false if resizing started.
	 */
	readyResizeFromEdge(event: MouseEvent, target: HTMLTableCellElement): boolean | undefined;
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
	/**
	 * @description Initialize the resize service (remove global events).
	 */
	init(): void;
	#private;
}
export default TableResizeService;
