import type {} from '../../../../typedef';
/**
 * @description Manages table grid operations including row and column insertion, deletion, and header toggling.
 */
export class TableGridService {
	/**
	 * @param {import('../index').default} main Table index
	 * @param {{
	 * 	columnButton: HTMLButtonElement,
	 * 	rowButton: HTMLButtonElement,
	 * 	openCellMenuFunc: ()=>void,
	 * 	closeCellMenuFunc: ()=>void
	 * 	}} options Options for table service
	 */
	constructor(
		main: import('../index').default,
		{
			columnButton,
			rowButton,
			openCellMenuFunc,
			closeCellMenuFunc,
		}: {
			columnButton: HTMLButtonElement;
			rowButton: HTMLButtonElement;
			openCellMenuFunc: () => void;
			closeCellMenuFunc: () => void;
		},
	);
	selectMenu_column: SelectMenu;
	selectMenu_row: SelectMenu;
	selectMenu_column_handle: SelectMenu;
	selectMenu_row_handle: SelectMenu;
	/**
	 * @description Opens the column menu from the cell controller button.
	 */
	openColumnMenu(): void;
	/**
	 * @description Opens the row menu from the cell controller button.
	 */
	openRowMenu(): void;
	/**
	 * @description Opens the column menu on a move handle's grip, with the cell-context items.
	 * @param {{left: number, top: number, width: number, height: number}} rect Grip rect (viewport coords)
	 */
	openColumnMenuForHandle(rect: { left: number; top: number; width: number; height: number }): void;
	/**
	 * @description Opens the row menu on a move handle's grip, with the cell-context items.
	 * @param {{left: number, top: number, width: number, height: number}} rect Grip rect (viewport coords)
	 */
	openRowMenuForHandle(rect: { left: number; top: number; width: number; height: number }): void;
	/**
	 * @description Closes the handle menus (e.g. when a handle pin is released).
	 */
	closeMenus(): void;
	/**
	 * @description Edits the table by adding, removing, or modifying rows and cells, based on the provided options. Supports both single and multi-cell/row editing.
	 * @param {"row"|"cell"} type The type of element to edit (`row` or `cell`).
	 * @param {?"up"|"down"|"left"|"right"} option The action to perform: `up`, `down`, `left`, `right`, or `null` for removing.
	 */
	editTable(type: 'row' | 'cell', option: ('up' | 'down' | 'left' | 'right') | null): void;
	/**
	 * @description Edits a table cell(column), either adding, removing, or modifying the cell based on the provided option.
	 * @param {?string} option The action to perform on the cell (`left`|`right`|`null`)
	 * - `null`: to remove the cell
	 * - `left`: to insert a new cell to the left
	 * - `right`: to insert a new cell to the right
	 * @param {?HTMLTableCellElement} [targetCell] Target cell, (default: current selected cell)
	 * @param {?HTMLTableCellElement} [positionResetElement] The element to reset the position of (optional). This can be the cell that triggered the column edit.
	 * @returns {HTMLTableCellElement} Target table cell
	 */
	editColumn(
		option: string | null,
		targetCell?: HTMLTableCellElement | null,
		positionResetElement?: HTMLTableCellElement | null,
	): HTMLTableCellElement;
	/**
	 * @description Edits a table row, either adding, removing, the row
	 * @param {?string} option The action to perform on the row (`up`|`down`|`null`)
	 * - `null`: to remove the row
	 * - `up`: to insert the row up
	 * - `down`: to insert the row down, or `null` to remove.
	 * @param {?HTMLTableCellElement} [targetCell] Target cell, (default: current selected cell)
	 * @param {?HTMLTableCellElement} [positionResetElement] The element to reset the position of (optional). This can be the cell that triggered the row edit.
	 */
	editRow(
		option: string | null,
		targetCell?: HTMLTableCellElement | null,
		positionResetElement?: HTMLTableCellElement | null,
	): void;
	/**
	 * @description Inserts a new row into the table at the specified index to it.
	 * @param {HTMLTableElement} table The table element to insert the row into.
	 * @param {number} rowIndex The index at which to insert the new row.
	 * @param {number} cellCnt The number of cells to create in the new row.
	 * @returns {HTMLTableRowElement} The newly inserted row element.
	 */
	insertBodyRow(table: HTMLTableElement, rowIndex: number, cellCnt: number): HTMLTableRowElement;
	#private;
}
export default TableGridService;
import { SelectMenu } from '../../../../modules/ui';
