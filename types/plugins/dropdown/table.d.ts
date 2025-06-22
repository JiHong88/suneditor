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
/**
 * @class
 * @description Table Plugin
 */
declare class Table extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
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
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions
	 * @param {"x"|"y"|"xy"} [pluginOptions.scrollType='x'] - Scroll type ('x', 'y', 'xy')
	 * @param {"top"|"bottom"} [pluginOptions.captionPosition='bottom'] - Caption position ('top', 'bottom')
	 * @param {"cell"|"table"} [pluginOptions.cellControllerPosition='cell'] - Cell controller position ('cell', 'table')
	 * @param {Array} [pluginOptions.colorList] - Color list, used in cell color picker
	 */
	constructor(
		editor: __se__EditorCore,
		pluginOptions: {
			scrollType?: 'x' | 'y' | 'xy';
			captionPosition?: 'top' | 'bottom';
			cellControllerPosition?: 'cell' | 'table';
			colorList?: any[];
		}
	);
	title: any;
	icon: string;
	figureScrollList: string[];
	figureScroll: string;
	captionPosition: string;
	cellControllerTop: boolean;
	controller_table: Controller;
	controller_cell: Controller;
	controller_props: Controller;
	controller_props_title: HTMLElement;
	colorPicker: ColorPicker;
	controller_colorPicker: Controller;
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
	_resizing: boolean;
	_resizeLine: any;
	_resizeLinePrev: any;
	/** @type {HTMLElement} */
	_figure: HTMLElement;
	/**
	 * @description Same value a "this._selectedTable", but it maintain prev table element
	 * @type {HTMLTableElement}
	 */
	_element: HTMLTableElement;
	/** @type {HTMLTableCellElement} */
	_tdElement: HTMLTableCellElement;
	/** @type {HTMLTableRowElement} */
	_trElement: HTMLTableRowElement;
	/** @type {HTMLTableRowElement[]|HTMLCollectionOf<HTMLTableRowElement>} */
	_trElements: HTMLTableRowElement[] | HTMLCollectionOf<HTMLTableRowElement>;
	_tableXY: any[];
	_maxWidth: boolean;
	_fixedColumn: boolean;
	_physical_cellCnt: number;
	_logical_cellCnt: number;
	_cellCnt: number;
	_rowCnt: number;
	_rowIndex: number;
	_physical_cellIndex: number;
	_logical_cellIndex: number;
	_current_colSpan: number;
	_current_rowSpan: number;
	/** @type {HTMLTableElement} */
	_selectedTable: HTMLTableElement;
	/** @type {HTMLTableCellElement} */
	_fixedCell: HTMLTableCellElement;
	/** @type {HTMLTableCellElement} */
	_selectedCell: HTMLTableCellElement;
	/** @type {HTMLTableCellElement[]} */
	_selectedCells: HTMLTableCellElement[];
	_shift: boolean;
	__s: boolean;
	_fixedCellName: string;
	_ref: {
		_i: number;
		cs: any;
		ce: any;
		rs: any;
		re: any;
	};
	_bindMultiOn: any;
	_bindMultiOff: any;
	_bindShiftOff: any;
	_bindTouchOff: any;
	__globalEvents: {
		on: any;
		off: any;
		shiftOff: any;
		touchOff: any;
		resize: any;
		resizeStop: any;
		resizeKeyDown: any;
	};
	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 */
	action(): void;
	/**
	 * @editorMethod Editor.component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target Target component element
	 */
	select(target: HTMLElement): void;
	/**
	 * @editorMethod Editor.component
	 * @description Executes the method that is called when a component copy is requested.
	 * @param {__se__PluginCopyComponentParams} params
	 * @returns {boolean|void}
	 */
	onCopyComponent({ event, cloneContainer }: __se__PluginCopyComponentParams): boolean | void;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "copy".
	 * @param {__se__PluginPasteParams} params
	 * @returns {boolean|void}
	 */
	onPaste({ event, doc }: __se__PluginPasteParams): boolean | void;
	/**
	 * @editorMethod Editor.core
	 * @description This method is used to validate and preserve the format of the component within the editor.
	 * - It ensures that the structure and attributes of the element are maintained and secure.
	 * - The method checks if the element is already wrapped in a valid container and updates its attributes if necessary.
	 * - If the element isn't properly contained, a new container is created to retain the format.
	 * @returns {{query: string, method: (element: HTMLTableElement) => void}} The format retention object containing the query and method to process the element.
	 * - query: The selector query to identify the relevant elements (in this case, 'audio').
	 * - method:The function to execute on the element to validate and preserve its format.
	 * - The function takes the element as an argument, checks if it is contained correctly, and applies necessary adjustments.
	 */
	retainFormat(): {
		query: string;
		method: (element: HTMLTableElement) => void;
	};
	/**
	 * @editorMethod Editor.core
	 * @description Executes the method called when the rtl, ltr mode changes. ("editor.setDir")
	 * @param {string} dir Direction ("rtl" or "ltr")
	 */
	setDir(dir: string): void;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "mousemove".
	 * @param {__se__PluginMouseEventInfo} params
	 */
	onMouseMove({ event }: __se__PluginMouseEventInfo): void;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "scroll".
	 */
	onScroll(): void;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "mousedown".
	 * @param {__se__PluginMouseEventInfo} params
	 */
	onMouseDown({ event }: __se__PluginMouseEventInfo): void;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "mouseup".
	 */
	onMouseUp(): void;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "mouseleave".
	 */
	onMouseLeave(): void;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "keydown".
	 * @param {__se__PluginKeyEventInfo} params
	 */
	onKeyDown({ event, range, line }: __se__PluginKeyEventInfo): boolean;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "keyup".
	 * @param {__se__PluginKeyEventInfo} params
	 */
	onKeyUp({ line }: __se__PluginKeyEventInfo): void;
	/**
	 * @editorMethod Modules.ColorPicker
	 * @description Executes the method called when a button of "ColorPicker" module is clicked.
	 * @param {string} color - Color code (hex)
	 */
	colorPickerAction(color: string): void;
	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method that is called when a button is clicked in the "controller".
	 * @param {HTMLButtonElement} target Target button element
	 */
	controllerAction(target: HTMLButtonElement): void;
	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method called when the "controller" is closed.
	 */
	close(): void;
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
	 * @param {?HTMLTableCellElement=} targetCell Target cell, (default: current selected cell)
	 * @param {?HTMLTableCellElement=} [positionResetElement] The element to reset the position of (optional). This can be the cell that triggered the row edit.
	 */
	editRow(option: string | null, targetCell?: (HTMLTableCellElement | null) | undefined, positionResetElement?: (HTMLTableCellElement | null) | undefined): void;
	/**
	 * @description Edits a table cell(column), either adding, removing, or modifying the cell based on the provided option.
	 * @param {?string} option The action to perform on the cell ("left"|"right"|null)
	 * - null: to remove the cell
	 * - left: to insert a new cell to the left
	 * - right: to insert a new cell to the right
	 * @param {?HTMLTableCellElement=} targetCell Target cell, (default: current selected cell)
	 * @param {?HTMLTableCellElement=} positionResetElement The element to reset the position of (optional). This can be the cell that triggered the column edit.
	 * @returns {HTMLTableCellElement} Target table cell
	 */
	editCell(option: string | null, targetCell?: (HTMLTableCellElement | null) | undefined, positionResetElement?: (HTMLTableCellElement | null) | undefined): HTMLTableCellElement;
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
	 * @description Updates table styles.
	 * @param {string} styles - Styles to update.
	 * @param {boolean} ondisplay - Whether to update display.
	 */
	private _setTableStyle;
	/**
	 * @private
	 * @description Sets the merge/split button visibility.
	 */
	private _setMergeSplitButton;
	/**
	 * @private
	 * @description Sets the unmerge button visibility.
	 */
	private _setUnMergeButton;
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
	 * @description Opens the figure.
	 * @param {Node} target - The target figure element.
	 */
	private _figureOpen;
	/**
	 * @private
	 * @description Converts the width of <col> elements to percentages.
	 * @param {HTMLTableElement} target - The target table element.
	 */
	private _resizePercentCol;
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
	 * @description Resizes a table cell.
	 * @param {HTMLElement} col The column element.
	 * @param {HTMLElement} nextCol The next column element.
	 * @param {HTMLElement} figure The table figure element.
	 * @param {HTMLElement} tdEl The table cell element.
	 * @param {HTMLElement} resizeLine The resize line element.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 * @param {number} startX The starting X position.
	 * @param {number} startWidth The initial width of the column.
	 * @param {number} prevWidthPercent The previous width percentage.
	 * @param {number} nextColWidthPercent The next column's width percentage.
	 * @param {number} tableWidth The total width of the table.
	 * @param {MouseEvent} e The mouse event.
	 */
	private _cellResize;
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
	 * @description Resizes a table row.
	 * @param {HTMLElement} row The table row element.
	 * @param {HTMLElement} figure The table figure element.
	 * @param {HTMLElement} resizeLine The resize line element.
	 * @param {number} startY The starting Y position.
	 * @param {number} startHeight The initial height of the row.
	 * @param {MouseEvent} e The mouse event.
	 */
	private _rowResize;
	/**
	 * @private
	 * @description Starts resizing the table figure.
	 * @param {number} startX The starting X position.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	private _startFigureResizing;
	/**
	 * @private
	 * @description Resizes the table figure.
	 * @param {HTMLElement} figure The table figure element.
	 * @param {HTMLElement} resizeLine The resize line element.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 * @param {number} startX The starting X position.
	 * @param {number} startWidth The initial width of the figure.
	 * @param {number} constNum A constant number used for width calculation.
	 * @param {MouseEvent} e The mouse event.
	 */
	private _figureResize;
	/**
	 * @private
	 * @description Sets the resize line position.
	 * @param {HTMLElement} figure The table figure element.
	 * @param {HTMLElement} target The target element.
	 * @param {HTMLElement} resizeLine The resize line element.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	private _setResizeLinePosition;
	/**
	 * @private
	 * @description Sets the resize row position.
	 * @param {HTMLElement} figure The table figure element.
	 * @param {HTMLElement} target The target row element.
	 * @param {HTMLElement} resizeLine The resize line element.
	 */
	private _setResizeRowPosition;
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
	 * @description Deletes styles from selected table cells.
	 */
	private _deleteStyleSelectedCells;
	/**
	 * @private
	 * @description Restores styles for selected table cells.
	 */
	private _recallStyleSelectedCells;
	/**
	 * @private
	 * @description Adds global event listeners for resizing.
	 * @param {(...args: *) => void} resizeFn The function handling the resize event.
	 * @param {(...args: *) => void} stopFn The function handling the stop event.
	 * @param {(...args: *) => void} keyDownFn The function handling the keydown event.
	 */
	private _addResizeGlobalEvents;
	/**
	 * @private
	 * @description Enables or disables editor mode.
	 * @param {boolean} enabled Whether to enable or disable the editor.
	 */
	private _toggleEditor;
	/**
	 * @private
	 * @description Updates control properties.
	 * @param {string} type The type of control property.
	 */
	private _setCtrlProps;
	/**
	 * @private
	 * @description Sets text alignment properties.
	 * @param {Element} el The element to apply alignment to.
	 * @param {string} align The alignment value.
	 * @param {boolean} reset Whether to reset the alignment.
	 */
	private _setAlignProps;
	/**
	 * @private
	 * @description Disables or enables border properties.
	 * @param {boolean} disabled Whether to disable or enable border properties.
	 */
	private _disableBorderProps;
	/**
	 * @private
	 * @description Gets the border style.
	 * @param {string} borderStyle The border style string.
	 * @returns {{w: string, s: string, c: string}} The parsed border style object.
	 * - w: The border width.
	 * - s: The border style.
	 * - c: The border color.
	 */
	private _getBorderStyle;
	/**
	 * @private
	 * @description Applies properties to table cells.
	 * @param {HTMLButtonElement} target The target element.
	 */
	private _submitProps;
	/**
	 * @private
	 * @description Sets font styles.
	 * @param {CSSStyleDeclaration} styles The style object to modify.
	 */
	private _setFontStyle;
	/**
	 * @private
	 * @description Sets border format and styles.
	 * @param {{left: Node[], top: Node[], right: Node[], bottom: Node[], all: Node[]}} cells The table cells categorized by border positions.
	 * @param {string} borderKey Border style ("all"|"inside"|"horizon"|"vertical"|"outside"|"left"|"top"|"right"|"bottom")
	 * @param {string} s The border style value.
	 */
	private _setBorderStyles;
	/**
	 * @private
	 * @description Selects multiple table cells and applies selection styles.
	 * @param {Node} startCell The first cell in the selection.
	 * @param {Node} endCell The last cell in the selection.
	 */
	private _setMultiCells;
	/**
	 * @private
	 * @description Resets the table picker display.
	 */
	private _resetTablePicker;
	/**
	 * @private
	 * @description Resets the alignment properties for table cells.
	 */
	private _resetPropsAlign;
	/**
	 * @private
	 * @description Handles color selection from the color palette.
	 * @param {Node} button The button triggering the color palette.
	 * @param {string} type The type of color selection.
	 * @param {HTMLInputElement} color Color text input element.
	 */
	private _onColorPalette;
	/**
	 * @private
	 * @description Closes table-related controllers.
	 */
	private _closeController;
	/**
	 * @private
	 * @description Closes table-related controllers and table figure
	 */
	private _closeTableSelectInfo;
	/**
	 * @private
	 * @description Hides the resize line if it is visible.
	 */
	private __hideResizeLine;
	/**
	 * @private
	 * @description Removes global event listeners and resets resize-related properties.
	 */
	private __removeGlobalEvents;
	#private;
}
import EditorInjector from '../../editorInjector';
import { Controller } from '../../modules';
import { ColorPicker } from '../../modules';
import { Figure } from '../../modules';
import { SelectMenu } from '../../modules';
