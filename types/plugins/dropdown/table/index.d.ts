import type {} from '../../../typedef';
export default Table;
export type TableCtrlProps = {
	html: HTMLElement;
	controller_props_title: HTMLElement;
	borderButton: HTMLButtonElement;
	borderFormatButton: HTMLButtonElement;
	cell_alignment: HTMLElement;
	cell_alignment_vertical: HTMLElement;
	cell_alignment_table_text: HTMLElement;
	border_style: HTMLButtonElement;
	border_color: HTMLInputElement;
	border_width: HTMLInputElement;
	back_color: HTMLInputElement;
	font_color: HTMLInputElement;
	palette_border_button: HTMLButtonElement;
	font_bold: HTMLButtonElement;
	font_underline: HTMLButtonElement;
	font_italic: HTMLButtonElement;
	font_strike: HTMLButtonElement;
};
export type TablePluginOptions = {
	/**
	 * - Scroll type ('x', 'y', 'xy')
	 */
	scrollType?: 'x' | 'y' | 'xy';
	/**
	 * - Caption position ('top', 'bottom')
	 */
	captionPosition?: 'top' | 'bottom';
	/**
	 * - Cell controller position ('cell', 'table')
	 */
	cellControllerPosition?: 'cell' | 'table';
	/**
	 * - Color list, used in cell color picker
	 */
	colorList?: any[];
};
/**
 * @typedef {Object} TablePluginOptions
 * @property {"x"|"y"|"xy"} [scrollType='x'] - Scroll type ('x', 'y', 'xy')
 * @property {"top"|"bottom"} [captionPosition='bottom'] - Caption position ('top', 'bottom')
 * @property {"cell"|"table"} [cellControllerPosition='cell'] - Cell controller position ('cell', 'table')
 * @property {Array} [colorList] - Color list, used in cell color picker
 */
/**
 * @class
 * @description Table Plugin
 */
declare class Table extends PluginDropdownFree {
	static options: {
		isInputComponent: boolean;
	};
	/**
	 * @this {Table}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(this: Table, node: HTMLElement): HTMLElement | null;
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {TablePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Core, pluginOptions: TablePluginOptions);
	title: any;
	figureScrollList: string[];
	figureScroll: string;
	captionPosition: string;
	cellControllerTop: boolean;
	controller_cell: Controller;
	controller_table: Controller;
	controller_props: Controller;
	controller_props_title: HTMLElement;
	controller_colorPicker: Controller;
	colorPicker: ColorPicker;
	figure: Figure;
	sliderType: string;
	splitButton: HTMLButtonElement;
	selectMenu_split: SelectMenu;
	selectMenu_column: SelectMenu;
	selectMenu_row: SelectMenu;
	selectMenu_props_border: SelectMenu;
	selectMenu_props_border_format: SelectMenu;
	selectMenu_props_border_format_oneCell: SelectMenu;
	maxText: any;
	minText: any;
	propTargets: {
		cell_alignment: HTMLElement;
		cell_alignment_vertical: HTMLElement;
		cell_alignment_table_text: HTMLElement;
		border_format: HTMLButtonElement;
		border_style: HTMLButtonElement;
		border_color: HTMLInputElement;
		border_width: HTMLInputElement;
		back_color: HTMLInputElement;
		font_color: HTMLInputElement;
		palette_border_button: HTMLButtonElement;
		font_bold: HTMLButtonElement;
		font_underline: HTMLButtonElement;
		font_italic: HTMLButtonElement;
		font_strike: HTMLButtonElement;
	};
	_propsCache: any[];
	_currentFontStyles: any[];
	_propsAlignCache: string;
	_propsVerticalAlignCache: string;
	_typeCache: string;
	/** @type {HTMLElement} */
	tableMenu: HTMLElement;
	/** @type {HTMLElement} */
	tableHighlight: HTMLElement;
	/** @type {HTMLElement} */
	tableUnHighlight: HTMLElement;
	/** @type {HTMLElement} */
	tableDisplay: HTMLElement;
	/** @type {HTMLButtonElement} */
	resizeButton: HTMLButtonElement;
	/** @type {HTMLSpanElement} */
	resizeText: HTMLSpanElement;
	/** @type {HTMLButtonElement} */
	columnFixedButton: HTMLButtonElement;
	/** @type {HTMLButtonElement} */
	headerButton: HTMLButtonElement;
	/** @type {HTMLButtonElement} */
	captionButton: HTMLButtonElement;
	/** @type {HTMLButtonElement} */
	mergeButton: HTMLButtonElement;
	/** @type {HTMLButtonElement} */
	unmergeButton: HTMLButtonElement;
	/**
	 * @description Same value a "this._selectedTable", but it maintain prev table element
	 * @type {HTMLTableElement}
	 */
	_element: HTMLTableElement;
	componentSelect(target: HTMLElement): void | boolean;
	componentDeselect(target: HTMLElement): void;
	componentDestroy(target: HTMLElement): Promise<void>;
	componentCopy(params: SunEditor.HookParams.CopyComponent): boolean | void;
	onPaste(params: SunEditor.HookParams.Paste): void | boolean;
	retainFormat(): {
		query: string;
		method: (element: HTMLElement) => void;
	};
	setDir(dir: string): void;
	onMouseMove(params: SunEditor.HookParams.MouseEvent): void;
	onScroll(params: SunEditor.HookParams.Scroll): void;
	onMouseDown(params: SunEditor.HookParams.MouseEvent): void | boolean;
	onMouseUp(params: SunEditor.HookParams.MouseEvent): void;
	onMouseLeave(params: SunEditor.HookParams.MouseEvent): void;
	onKeyDown(params: SunEditor.HookParams.KeyEvent): void | boolean;
	onKeyUp(params: SunEditor.HookParams.KeyEvent): void | boolean;
	colorPickerAction(color: SunEditor.Module.HueSlider.Color): void;
	controllerAction(target: HTMLButtonElement): void;
	/**
	 * @description Resets the internal state related to table cell selection,
	 * - clearing any selected cells and removing associated styles and event listeners.
	 */
	resetSelectInfo(): void;
	/**
	 * @description Selects a group of table cells and sets internal state related to multi-cell selection.
	 * @param {HTMLTableCellElement[]} cells - An array of table cell elements to be selected.
	 */
	selectCells(cells: HTMLTableCellElement[]): void;
	/**
	 * @description Sets the table and figure elements based on the provided cell element, and stores references to them for later use.
	 * @param {Node} element The target table cell (`<td>`) element from which the table info will be extracted.
	 * @returns {HTMLTableElement} The `<table>` element that is the parent of the provided `element`.
	 */
	setTableInfo(element: Node): HTMLTableElement;
	/**
	 * @description Sets various table-related information based on the provided table cell element (`<td>`). This includes updating cell, row, and table attributes, handling spanning cells, and adjusting the UI for elements like headers and captions.
	 * @param {HTMLTableCellElement} tdElement The target table cell (`<td>`) element from which table information will be extracted.
	 * @param {boolean} reset A flag indicating whether to reset the cell information. If `true`, the cell information will be reset and recalculated.
	 */
	setCellInfo(tdElement: HTMLTableCellElement, reset: boolean): void;
	/**
	 * @description Sets row-related information based on the provided table row element (`<tr>`). This includes updating the row count and the index of the selected row.
	 * @param {HTMLTableRowElement} trElement The target table row (`<tr>`) element from which row information will be extracted.
	 */
	setRowInfo(trElement: HTMLTableRowElement): void;
	/**
	 * @description Edits the table by adding, removing, or modifying rows and cells, based on the provided options. Supports both single and multi-cell/row editing.
	 * @param {"row"|"cell"} type The type of element to edit ('row' or 'cell').
	 * @param {?"up"|"down"|"left"|"right"} option The action to perform: 'up', 'down', 'left', 'right', or `null` for removing.
	 */
	editTable(type: 'row' | 'cell', option: ('up' | 'down' | 'left' | 'right') | null): void;
	/**
	 * @description Edits a table row, either adding, removing, the row
	 * @param {?string} option The action to perform on the row ("up"|"down"|null)
	 * - null: to remove the row
	 * - 'up': to insert the row up
	 * - 'down': to insert the row down, or null to remove.
	 * @param {?HTMLTableCellElement} [targetCell] Target cell, (default: current selected cell)
	 * @param {?HTMLTableCellElement} [positionResetElement] The element to reset the position of (optional). This can be the cell that triggered the row edit.
	 */
	editRow(option: string | null, targetCell?: HTMLTableCellElement | null, positionResetElement?: HTMLTableCellElement | null): void;
	/**
	 * @description Edits a table cell(column), either adding, removing, or modifying the cell based on the provided option.
	 * @param {?string} option The action to perform on the cell ("left"|"right"|null)
	 * - null: to remove the cell
	 * - left: to insert a new cell to the left
	 * - right: to insert a new cell to the right
	 * @param {?HTMLTableCellElement} [targetCell] Target cell, (default: current selected cell)
	 * @param {?HTMLTableCellElement} [positionResetElement] The element to reset the position of (optional). This can be the cell that triggered the column edit.
	 * @returns {HTMLTableCellElement} Target table cell
	 */
	editCell(option: string | null, targetCell?: HTMLTableCellElement | null, positionResetElement?: HTMLTableCellElement | null): HTMLTableCellElement;
	/**
	 * @description Updates the target table's cells with the data from the copied table.
	 * @param {HTMLTableElement} copyTable The table containing the copied data.
	 * @param {HTMLTableCellElement} targetTD The starting cell in the target table where data will be pasted.
	 */
	pasteTableCellMatrix(copyTable: HTMLTableElement, targetTD: HTMLTableCellElement): void;
	/**
	 * @description Inserts a new row into the table at the specified index to it.
	 * @param {HTMLTableElement} table The table element to insert the row into.
	 * @param {number} rowIndex The index at which to insert the new row.
	 * @param {number} cellCnt The number of cells to create in the new row.
	 * @returns {HTMLTableRowElement} The newly inserted row element.
	 */
	insertBodyRow(table: HTMLTableElement, rowIndex: number, cellCnt: number): HTMLTableRowElement;
	/**
	 * @description Merges the selected table cells into one cell by combining their contents and adjusting their row and column spans.
	 * - This method removes the selected cells, consolidates their contents, and applies the appropriate row and column spans to the merged cell.
	 * @param {HTMLTableCellElement[]} selectedCells Cells array
	 * @param {boolean} [skipPostProcess=false] - If true, skips table cloning, cell re-selection, history stack push, and rendering.
	 */
	mergeCells(selectedCells: HTMLTableCellElement[], skipPostProcess?: boolean): void;
	/**
	 * @description Unmerges a table cell that has been merged using rowspan and/or colspan.
	 * @param {HTMLTableCellElement[]} selectedCells - Cells array
	 * @param {boolean} [skipPostProcess=false] - If true, skips table cloning, cell re-selection, history stack push, and rendering.
	 */
	unmergeCells(selectedCells: HTMLTableCellElement[], skipPostProcess?: boolean): void;
	/**
	 * @description Find merged cells
	 * @param {HTMLTableCellElement[]} cells - Cells array
	 */
	findMergedCells(cells: HTMLTableCellElement[]): any[];
	/**
	 * @description Toggles the visibility of the table header (`<thead>`). If the header is present, it is removed; if absent, it is added.
	 */
	toggleHeader(): void;
	/**
	 * @description Toggles the visibility of the table caption (`<caption>`). If the caption is present, it is removed; if absent, it is added.
	 */
	toggleCaption(): void;
	/**
	 * @private
	 * @description Sets the controller position for a cell.
	 * @param {HTMLTableCellElement} tdElement - The target table cell.
	 */
	private _setController;
	/**
	 * @private
	 * @description Sets the position of the cell controller.
	 * @param {HTMLTableCellElement} tdElement - The target table cell.
	 * @param {boolean} reset - Whether to reset the controller position.
	 */
	private _setCellControllerPosition;
	/**
	 * @private
	 * @description Adds a new entry to the history stack.
	 */
	private _historyPush;
	/**
	 * @private
	 * @description Starts resizing a table cell.
	 * @param {HTMLElement} col The column element.
	 * @param {number} startX The starting X position.
	 * @param {number} startWidth The initial width of the column.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	private _startCellResizing;
	/**
	 * @private
	 * @description Starts resizing a table row.
	 * @param {HTMLElement} row The table row element.
	 * @param {number} startY The starting Y position.
	 * @param {number} startHeight The initial height of the row.
	 */
	private _startRowResizing;
	/**
	 * @private
	 * @description Starts resizing the table figure.
	 * @param {number} startX The starting X position.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	private _startFigureResizing;
	/**
	 * @private
	 * @description Stops resizing the table.
	 * @param {HTMLElement} target The target element.
	 * @param {string} prevValue The previous style value.
	 * @param {string} styleProp The CSS property being changed.
	 * @param {KeyboardEvent} e The keyboard event.
	 */
	private _stopResize;
	/**
	 * @private
	 * @description Disables or enables border properties.
	 * @param {boolean} disabled Whether to disable or enable border properties.
	 */
	private _disableBorderProps;
	/**
	 * @private
	 * @description Applies properties to table cells.
	 * @param {HTMLButtonElement} target The target element.
	 */
	private _submitProps;
	/**
	 * @private
	 * @description Selects multiple table cells and applies selection styles.
	 * @param {Node} startCell The first cell in the selection.
	 * @param {Node} endCell The last cell in the selection.
	 */
	private _setMultiCells;
	/**
	 * @private
	 * @description Clone a table element and map selected cells to the cloned table
	 * @param {HTMLTableElement} table <table> element
	 * @param {HTMLTableCellElement[]} selectedCells Selected cells array
	 * @returns {{ cloneTable: HTMLTableElement, clonedSelectedCells: HTMLTableCellElement[] }}
	 */
	private _cloneTable;
	/**
	 * @private
	 * @description Splits a table cell either vertically or horizontally.
	 * @param {"vertical"|"horizontal"} direction The direction to split the cell.
	 */
	private _OnSplitCells;
	/**
	 * @private
	 * @description Handles column operations such as insert and delete.
	 * @param {"insert-left"|"insert-right"|"delete"} command The column operation to perform.
	 */
	private _OnColumnEdit;
	/**
	 * @private
	 * @description Handles row operations such as insert and delete.
	 * @param {"insert-above"|"insert-below"|"delete"} command The row operation to perform.
	 */
	private _OnRowEdit;
	#private;
}
import { PluginDropdownFree } from '../../../interfaces';
import { Controller } from '../../../modules/contracts';
import { ColorPicker } from '../../../modules/contracts';
import { Figure } from '../../../modules/contracts';
import { SelectMenu } from '../../../modules/utils';
