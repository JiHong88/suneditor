import type {} from '../../../typedef';
export default Table;
export type TablePluginOptions = {
	/**
	 * - Scroll type (`x`, `y`, `xy`)
	 */
	scrollType?: 'x' | 'y' | 'xy';
	/**
	 * - Caption position (`top`, `bottom`)
	 */
	captionPosition?: 'top' | 'bottom';
	/**
	 * - Cell controller position (`cell`, `table`)
	 */
	cellControllerPosition?: 'cell' | 'table';
	/**
	 * - Color list, used in cell color picker
	 */
	colorList?: any[];
};
export type TableState = import('./shared/table.constants').TableState;
/**
 * @typedef {Object} TablePluginOptions
 * @property {"x"|"y"|"xy"} [scrollType='x'] - Scroll type (`x`, `y`, `xy`)
 * @property {"top"|"bottom"} [captionPosition='bottom'] - Caption position (`top`, `bottom`)
 * @property {"cell"|"table"} [cellControllerPosition='cell'] - Cell controller position (`cell`, `table`)
 * @property {Array} [colorList] - Color list, used in cell color picker
 */
/**
 * @typedef {import('./shared/table.constants').TableState} TableState
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
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node: HTMLElement): HTMLElement | null;
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {TablePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor: SunEditor.Kernel, pluginOptions: TablePluginOptions);
	title: any;
	figureScrollList: string[];
	figureScroll: string;
	captionPosition: string;
	cellControllerTop: boolean;
	controller_cell: Controller;
	controller_table: Controller;
	figure: Figure;
	/**
	 * @description Same value as `this._selectedTable`, but it maintains the prev table element
	 * @type {HTMLTableElement}
	 */
	_element: HTMLTableElement;
	state: Constants.TableState;
	cellService: TableCellService;
	clipboardService: TableClipboardService;
	gridService: TableGridService;
	resizeService: TableResizeService;
	selectionService: TableSelectionService;
	styleService: TableStyleService;
	/**
	 * @template {keyof import('./shared/table.constants').TableState} K
	 * @param {K} key
	 * @param {import('./shared/table.constants').TableState[K]} value
	 */
	setState<K extends keyof import('./shared/table.constants').TableState>(key: K, value: import('./shared/table.constants').TableState[K]): void;
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
	onMouseDown(params: SunEditor.HookParams.MouseEvent): void | boolean;
	onMouseUp(params: SunEditor.HookParams.MouseEvent): void;
	onMouseLeave(params: SunEditor.HookParams.MouseEvent): void;
	onKeyDown(params: SunEditor.HookParams.KeyEvent): void | boolean;
	onKeyUp(params: SunEditor.HookParams.KeyEvent): void | boolean;
	onScroll(params: SunEditor.HookParams.Scroll): void;
	controllerAction(target: HTMLButtonElement): void;
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
	 * @description Sets the table and figure elements based on the provided cell element, and stores references to them for later use.
	 * @param {Node} element The target table cell (`<td>`) element from which the table info will be extracted.
	 * @returns {HTMLTableElement} The `<table>` element that is the parent of the provided `element`.
	 */
	setTableInfo(element: Node): HTMLTableElement;
	/**
	 * @description Resets the internal state related to table cell selection,
	 * - clearing any selected cells and removing associated styles and event listeners.
	 */
	resetInfo(): void;
	/**
	 * @description Adds a new entry to the history stack.
	 */
	historyPush(): void;
	/**
	 * @internal
	 * @description Sets the controller position for a cell.
	 * @param {HTMLTableCellElement} tdElement - The target table cell.
	 */
	_setController(tdElement: HTMLTableCellElement): void;
	/**
	 * @internal
	 * @description Sets the position of the cell controller.
	 * @param {HTMLTableCellElement} tdElement - The target table cell.
	 * @param {boolean} reset - Whether to reset the controller position.
	 */
	_setCellControllerPosition(tdElement: HTMLTableCellElement, reset: boolean): void;
	/**
	 * @description Enables or disables editor mode.
	 * @param {boolean} enabled Whether to enable or disable the editor.
	 */
	_editorEnable(enabled: boolean): void;
	/**
	 * @description Closes table-related controllers.
	 */
	_closeController(): void;
	/**
	 * @description Closes table-related controllers and table figure
	 */
	_closeTableSelectInfo(): void;
	#private;
}
import { PluginDropdownFree } from '../../../interfaces';
import { Controller } from '../../../modules/contract';
import { Figure } from '../../../modules/contract';
import TableCellService from './services/table.cell';
import TableClipboardService from './services/table.clipboard';
import TableGridService from './services/table.grid';
import TableResizeService from './services/table.resize';
import TableSelectionService from './services/table.selection';
import TableStyleService from './services/table.style';
import * as Constants from './shared/table.constants';
