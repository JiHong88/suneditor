import { PluginDropdownFree } from '../../../interfaces';
import { dom, numbers, env, keyCodeMap } from '../../../helper';
import { Controller, Figure } from '../../../modules/contract';
import { _DragHandle } from '../../../modules/ui';

import * as Constants from './shared/table.constants';
import { CreateCellsString, GetMaxColumns, IsResizeEls, IsTableCaption, GetLogicalCellIndex } from './shared/table.utils';
import { CreateHTML, CreateHTML_controller_table, CreateHTML_controller_cell } from './render/table.html';

import TableCellService from './services/table.cell';
import TableClipboardService from './services/table.clipboard';
import TableGridService from './services/table.grid';
import TableResizeService from './services/table.resize';
import TableSelectionService from './services/table.selection';
import TableStyleService from './services/table.style';

const { _w, ON_OVER_COMPONENT } = env;

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
class Table extends PluginDropdownFree {
	static key = 'table';
	static className = '';
	static options = { isInputComponent: true };

	/**
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		return dom.check.isTable(node) ? node : null;
	}

	/** @type {HTMLElement} */
	#tableMenu;
	/** @type {HTMLElement} */
	#tableHighlight;
	/** @type {HTMLElement} */
	#tableUnHighlight;
	/** @type {HTMLElement} */
	#tableDisplay;
	/** @type {number} */
	#prevUnhighlightX;

	/** @type {number[]} */
	#tableXY = [];
	#maxWidth = true;
	#fixedColumn = false;
	#_s = false;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {TablePluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel, pluginOptions) {
		// plugin bisic properties
		super(kernel);
		this.title = this.$.lang.table;
		this.icon = 'table';

		// pluginOptions options
		this.figureScrollList = ['se-scroll-figure-xy', 'se-scroll-figure-x', 'se-scroll-figure-y'];
		this.figureScroll = typeof pluginOptions.scrollType === 'string' ? pluginOptions.scrollType.toLowerCase() : 'x';
		this.captionPosition = pluginOptions.captionPosition !== 'bottom' ? 'top' : 'bottom';
		this.cellControllerTop = (pluginOptions.cellControllerPosition !== 'cell' ? 'table' : 'cell') === 'table';

		// create HTML
		const menu = CreateHTML();
		const commandArea = menu.querySelector('.se-controller-table-picker');
		const controller_table = CreateHTML_controller_table(this.$);
		const controller_cell = CreateHTML_controller_cell(this.$, this.cellControllerTop);

		this.$.contextProvider.applyToRoots((e) => {
			e.get('wrapper').appendChild(dom.utils.createElement('DIV', { class: Constants.RESIZE_CELL_CLASS.replace(/^\./, '') }));
			e.get('wrapper').appendChild(dom.utils.createElement('DIV', { class: Constants.RESIZE_CELL_PREV_CLASS.replace(/^\./, '') }));
			e.get('wrapper').appendChild(dom.utils.createElement('DIV', { class: Constants.RESIZE_ROW_CLASS.replace(/^\./, '') }));
			e.get('wrapper').appendChild(dom.utils.createElement('DIV', { class: Constants.RESIZE_ROW_PREV_CLASS.replace(/^\./, '') }));
		});

		// members - Controller
		if (this.cellControllerTop) {
			this.controller_cell = new Controller(this, this.$, controller_cell.html, { position: 'top' });
			this.controller_table = new Controller(this, this.$, controller_table, { position: 'top' });
			this.controller_cell.sibling = this.controller_table.form;
			this.controller_table.sibling = this.controller_cell.form;
			this.controller_table.siblingMain = true;
		} else {
			this.controller_table = new Controller(this, this.$, controller_table, { position: 'top' });
			this.controller_cell = new Controller(this, this.$, controller_cell.html, { position: 'bottom' });
		}

		this.figure = new Figure(this, this.$, null, {});

		// members
		/**
		 * @description Same value as `this._selectedTable`, but it maintains the prev table element
		 * @type {HTMLTableElement}
		 */
		this._element = null;

		// member - state
		this.state = Constants.INITIAL_STATE;

		// ------------------------------------------------ INIT ------------------------------------------------
		// members - private
		this.#tableMenu = menu;
		this.#tableHighlight = menu.querySelector('.se-table-size-highlighted');
		this.#tableUnHighlight = menu.querySelector('.se-table-size-unhighlighted');
		this.#tableDisplay = menu.querySelector('.se-table-size-display');

		// services
		const openCellMenuFunc = _CellFormZIndex.bind(this, true);
		const closeCellMenuFunc = _CellFormZIndex.bind(this, false);
		const serviceOptions = { ...controller_cell, openCellMenuFunc, closeCellMenuFunc };

		this.cellService = new TableCellService(this, serviceOptions);
		this.clipboardService = new TableClipboardService(this);
		this.gridService = new TableGridService(this, serviceOptions);
		this.resizeService = new TableResizeService(this);
		this.selectionService = new TableSelectionService(this);
		this.styleService = new TableStyleService(this, { pluginOptions, controller_table });

		// init
		this.$.menu.initDropdownTarget(Table, menu);
		this.$.eventManager.addEvent(commandArea, 'mousemove', this.#OnMouseMoveTablePicker.bind(this));
		this.$.eventManager.addEvent(commandArea, 'click', this.#OnClickTablePicker.bind(this));
	}

	/**
	 * @template {keyof import('./shared/table.constants').TableState} K
	 * @param {K} key
	 * @param {import('./shared/table.constants').TableState[K]} value
	 */
	setState(key, value) {
		this.state[key] = value;
	}

	#initState() {
		Object.assign(this.state, Constants.INITIAL_STATE);
	}

	/**
	 * @override
	 * @type {PluginDropdownFree['off']}
	 */
	off() {
		this.#resetTablePicker();
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Select}
	 */
	componentSelect(target) {
		this.#figureOpen(target);
		if (!this.state.figureElement) this.setTableInfo(target);

		this.#maxWidth = this.state.figureElement?.style.width === '100%';
		this.#fixedColumn = dom.utils.hasClass(target, 'se-table-layout-fixed') || target.style.tableLayout === 'fixed';
		this.styleService.setTableLayout(this.#maxWidth ? 'width|column' : 'width', this.#maxWidth, this.#fixedColumn, true);

		if (_DragHandle.get('__overInfo') === ON_OVER_COMPONENT) return;

		if (!this.state.tdElement) return;
		this.setCellInfo(this.state.tdElement, true);

		// controller open
		const btnDisabled = this.state.selectedCells?.length > 1;
		const figureEl = dom.query.getParentElement(target, dom.check.isFigure);
		this.controller_table.open(figureEl, null, { isWWTarget: false, initMethod: null, addOffset: null, disabled: btnDisabled });

		if (!this.state.fixedCell) return;

		this.cellService.setUnMergeButton();
		this.controller_cell.open(this.state.tdElement, this.cellControllerTop ? figureEl : null, { isWWTarget: false, initMethod: null, addOffset: null, disabled: btnDisabled });
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Deselect}
	 */
	componentDeselect() {
		this.resetInfo();
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Destroy}
	 */
	componentDestroy(target) {
		if (!target) return;

		const emptyDiv = target.parentNode;
		dom.utils.removeItem(target);

		this._closeTableSelectInfo();

		if (emptyDiv !== this.$.frameContext.get('wysiwyg'))
			this.$.nodeTransform.removeAllParents(
				emptyDiv,
				function (current) {
					return current.childNodes.length === 0;
				},
				null,
			);
		this.$.focusManager.focus();
		this.$.history.push(false);
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Copy}
	 */
	componentCopy({ event, cloneContainer }) {
		/** @type {NodeListOf<HTMLTableCellElement>} */
		const selectedCells = cloneContainer.querySelectorAll('.se-selected-table-cell');
		dom.utils.removeClass(selectedCells, 'se-selected-table-cell|se-selected-cell-focus');

		if (selectedCells.length > 0) {
			this.clipboardService.copySelectedTableCells(event, cloneContainer, selectedCells);
			this.$.ui.showToast(this.$.lang.message_copy_success, 550);
		}
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnPaste}
	 */
	onPaste({ event, doc }) {
		/** @type {HTMLTableCellElement} */
		const targetCell = dom.query.getParentElement(dom.query.getEventTarget(event), dom.check.isTableCell);
		if (!targetCell) return;

		const domParserBody = doc.body;
		if (domParserBody.childElementCount !== 1) return;

		const componentInfo = this.$.component.get(domParserBody.firstElementChild);
		if (componentInfo.pluginName !== Table.key) return;

		const copyTable = /** @type {HTMLTableElement} */ (componentInfo.target);
		const selectedCells = this.clipboardService.pasteTableCellMatrix(copyTable, targetCell);

		// select cell
		const { fixedCell, selectedCell } = this.selectionService.selectCells(selectedCells);
		this.setState('selectedCells', selectedCells);
		this.setState('fixedCell', fixedCell);
		this.setState('selectedCell', selectedCell);
		this.setState('selectedTable', dom.query.getParentElement(fixedCell, 'TABLE'));

		return false;
	}

	/**
	 * @hook Editor.Core
	 * @type {SunEditor.Hook.Core.RetainFormat}
	 */
	retainFormat() {
		return {
			query: 'table',
			/** @param {HTMLTableElement} element */
			method: (element) => {
				const ColgroupEl = element.querySelector('colgroup');
				let FigureEl = /** @type {HTMLElement} */ (dom.check.isFigure(element.parentNode) ? element.parentNode : null);

				// create colgroup
				if (!ColgroupEl) {
					const rows = element.rows;
					const maxColumnCount = GetMaxColumns(element);
					const colWidths = new Array(maxColumnCount).fill(null);

					for (let r = 0, rLen = rows.length, cellsCount; r < rLen; r++) {
						const cellsInRow = rows[r].cells;
						cellsCount = cellsInRow.length;
						let currentLogicalCol = 0;
						const rowColOccupancy = new Array(maxColumnCount).fill(false);

						for (let c = 0; c < cellsCount; c++) {
							const cell = cellsInRow[c];
							const cellWidth = cell.style.width;
							const colSpan = cell.colSpan || 1;

							while (currentLogicalCol < maxColumnCount && rowColOccupancy[currentLogicalCol]) {
								currentLogicalCol++;
							}

							if (currentLogicalCol >= maxColumnCount) break;
							if (cellWidth && !colWidths[currentLogicalCol]) colWidths[currentLogicalCol] = cellWidth;

							for (let i = 0; i < colSpan; i++) {
								if (currentLogicalCol + i >= maxColumnCount || !cellWidth) continue;

								rowColOccupancy[currentLogicalCol + i] = true;
								const currentPxWidth = parseFloat(cellWidth);

								for (let j = 0; j < colSpan; j++) {
									const targetColIndex = currentLogicalCol + j;
									if (targetColIndex >= maxColumnCount) continue;

									const existingWidth = colWidths[targetColIndex];
									if (existingWidth === null) {
										colWidths[targetColIndex] = `width: ${cellWidth};`;
									} else {
										const existingPxWidth = parseFloat(existingWidth.replace('width: ', '').replace(';', ''));
										if (colSpan === 1 && currentPxWidth !== existingPxWidth) {
											colWidths[targetColIndex] = `width: ${cellWidth};`;
										}
									}
								}
							}
							currentLogicalCol += colSpan;
						}

						if (cellsCount === maxColumnCount) break;
					}

					const colHTML = [];
					for (let i = 0; i < maxColumnCount; i++) {
						const colStyle = colWidths[i] ? ` style="${colWidths[i]}"` : '';
						colHTML.push(`<col${colStyle}>`);
					}

					const colGroup = dom.utils.createElement('colgroup', null, colHTML.join(''));
					element.insertBefore(colGroup, element.firstElementChild);

					for (let r = 0; r < rows.length; r++) {
						const cellsInRow = rows[r].cells;
						for (let c = 0; c < cellsInRow.length; c++) {
							dom.utils.setStyle(cellsInRow[c], 'width', '');
						}
					}
				}

				// figure
				if (!FigureEl) {
					FigureEl = dom.utils.createElement('FIGURE', { class: 'se-flex-component se-input-component' });
					element.parentNode.insertBefore(FigureEl, element);
					FigureEl.appendChild(element);
				} else {
					dom.utils.addClass(FigureEl, 'se-flex-component|se-input-component');
				}

				// table width
				const tableWidth = element.style.width;
				if (tableWidth) {
					FigureEl.style.width = tableWidth === 'auto' ? 'max-content' : tableWidth;
					dom.utils.setStyle(element, 'width', '');
				}

				// scroll
				if (!this.figureScroll) {
					dom.utils.removeClass(FigureEl, this.figureScrollList.join('|'));
				} else {
					const scrollTypeClass = `se-scroll-figure-${this.figureScroll}`;
					dom.utils.addClass(FigureEl, scrollTypeClass);
					dom.utils.removeClass(FigureEl, this.figureScrollList.filter((v) => v !== scrollTypeClass).join('|'));
				}
			},
		};
	}

	/**
	 * @hook Editor.Core
	 * @type {SunEditor.Hook.Core.SetDir}
	 */
	setDir() {
		this.#resetTablePicker();
		this.styleService.resetPropsAlign();
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnMouseMove}
	 */
	onMouseMove({ event }) {
		if (this.resizeService.isResizing()) return;

		const eventTarget = dom.query.getEventTarget(event);
		const target = dom.query.getParentElement(eventTarget, IsResizeEls);
		if (!target || event.buttons === 1) {
			this.resizeService.offResizeGuide();
			return;
		}

		if (this.resizeService.onResizeGuide(event, target) === false) return;

		if (this._element) this._element.style.cursor = '';
		this.resizeService.offResizeGuide();
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnMouseDown}
	 */
	onMouseDown({ event }) {
		this.setState('ref', null);
		this.setState('selectedCell', null);

		const eventTarget = dom.query.getEventTarget(event);

		if (this._element && dom.query.getParentElement(eventTarget, IsTableCaption)) {
			this._closeController();
			return;
		}

		const target = /** @type {HTMLTableCellElement} */ (dom.query.getParentElement(eventTarget, IsResizeEls));
		if (!target) return;

		if (!this.cellControllerTop) {
			this.controller_cell.hide();
		}

		if (this.resizeService.readyResizeFromEdge(event, target) === false) return;

		if (this.state.isShiftPressed && target !== this.state.fixedCell) return;

		this.selectionService.deleteStyleSelectedCells();
		if (/^TR$/i.test(target.nodeName)) return;

		this.#_s = false;
		this.selectionService.startCellSelection(target, false);
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnMouseUp}
	 */
	onMouseUp() {
		this.setState('isShiftPressed', false);
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnMouseLeave}
	 */
	onMouseLeave() {
		this.resizeService.offResizeGuide();
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnKeyDown}
	 */
	onKeyDown({ event, range, line }) {
		this.setState('ref', null);

		const keyCode = event.code;
		const isTab = keyCodeMap.isTab(keyCode);
		if (this.$.ui.selectMenuOn || this.resizeService.isResizing() || (!isTab && this.#_s) || keyCodeMap.isCtrl(event)) return;

		if (!this.cellControllerTop) {
			this.controller_cell.hide();
		}

		this.#_s = keyCodeMap.isShift(event);

		// table tabkey
		if (isTab) {
			this.selectionService.deleteStyleSelectedCells();
			const tableCell = dom.query.getParentElement(line, dom.check.isTableCell);
			if (tableCell && range.collapsed && dom.check.isEdgePoint(range.startContainer, range.startOffset)) {
				this._closeController();

				const shift = this.#_s;
				this.setState('isShiftPressed', (this.#_s = false));

				/** @type {HTMLTableElement} */
				const table = dom.query.getParentElement(tableCell, 'table');
				/** @type {HTMLTableCellElement[]} */
				const cells = dom.query.getListChildren(table, dom.check.isTableCell, null);
				const idx = shift ? dom.utils.prevIndex(cells, tableCell) : dom.utils.nextIndex(cells, tableCell);

				if (idx === cells.length && !shift) {
					if (!dom.query.getParentElement(tableCell, 'thead')) {
						const rows = table.rows;
						const newRow = this.gridService.insertBodyRow(table, rows.length, this.state.cellCnt);
						const firstTd = newRow.querySelector('td div');
						this.$.selection.setRange(firstTd, 0, firstTd, 0);
					}

					event.preventDefault();
					event.stopPropagation();

					return false;
				}

				if (idx === -1 && shift) return false;

				const moveCell = cells[idx];
				if (!moveCell) return;

				const rangeCell = moveCell.firstElementChild || moveCell;
				this.$.selection.setRange(rangeCell, 0, rangeCell, 0);

				event.preventDefault();
				event.stopPropagation();

				return false;
			}
		}

		let cell = null;
		if (!keyCodeMap.isShift(event)) {
			cell = dom.query.getParentElement(line, dom.check.isTableCell);
			if (!dom.utils.hasClass(cell, 'se-selected-cell-focus')) return;

			this.selectionService.deleteStyleSelectedCells();
			this._editorEnable(true);
			this.#initService();
			this._closeController();

			return;
		}

		if (this.state.isShiftPressed || this.state.ref) return;

		cell ||= /** @type {HTMLTableCellElement} */ (dom.query.getParentElement(line, dom.check.isTableCell));
		if (cell) {
			this.#_s = event.shiftKey;
			this.setState('fixedCell', cell);
			this._closeController();
			this.selectionService.startCellSelection(cell, this.#_s);
			return false;
		}
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnKeyUp}
	 */
	onKeyUp({ line }) {
		this.#_s = false;
		if (this.state.isShiftPressed && dom.query.getParentElement(line, dom.check.isTableCell) === this.state.fixedCell) {
			this.selectionService.deleteStyleSelectedCells();
			this._editorEnable(true);
			this.#initService();
		}
		this.setState('isShiftPressed', false);
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnScroll}
	 */
	onScroll() {
		this.resizeService.offResizeGuide();
	}

	/**
	 * @hook Modules.Controller
	 * @type {SunEditor.Hook.Controller.Action}
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		if (!command) return;

		switch (command) {
			case 'header':
				this.styleService.toggleHeader();
				this.historyPush();
				break;
			case 'caption':
				this.styleService.toggleCaption();
				this.historyPush();
				break;
			case 'onsplit':
				this.cellService.openSplitMenu();
				break;
			case 'oncolumn':
				this.gridService.openColumnMenu();
				break;
			case 'onrow':
				this.gridService.openRowMenu();
				break;
			case 'openTableProperties':
				this.styleService.openTableProps(target);
				break;
			case 'openCellProperties':
				this.styleService.openCellProps(target);
				break;
			case 'revert':
				this.styleService.revertProps();
				break;
			case 'merge':
				this.cellService.mergeCells(this.state.selectedCells);
				break;
			case 'unmerge':
				this.cellService.unmergeCells(this.state.selectedCells);
				break;
			case 'resize':
				this.#maxWidth = !this.#maxWidth;
				this.styleService.setTableLayout('width', this.#maxWidth, this.#fixedColumn, false);
				this.historyPush();
				_w.setTimeout(() => {
					this.$.component.select(this._element, Table.key, { isInput: true });
				}, 0);
				break;
			case 'layout':
				this.#fixedColumn = !this.#fixedColumn;
				this.styleService.setTableLayout('column', this.#maxWidth, this.#fixedColumn, false);
				this.historyPush();
				_w.setTimeout(() => {
					this.$.component.select(this._element, Table.key, { isInput: true });
				}, 0);
				break;
			case 'copy':
				this.$.component.copy(this.state.figureElement);
				break;
			case 'remove': {
				this.componentDestroy(this.state.figureElement);
			}
		}

		// [close_props]
		if (!/(^revert|Properties$)/.test(command)) {
			this.styleService.closeProps();
		}

		if (!/^(remove|on|open)/.test(command)) {
			this._setCellControllerPosition(this.state.tdElement, this.state.isShiftPressed);
		}
	}

	/**
	 * @description Sets various table-related information based on the provided table cell element (`<td>`). This includes updating cell, row, and table attributes, handling spanning cells, and adjusting the UI for elements like headers and captions.
	 * @param {HTMLTableCellElement} tdElement The target table cell (`<td>`) element from which table information will be extracted.
	 * @param {boolean} reset A flag indicating whether to reset the cell information. If `true`, the cell information will be reset and recalculated.
	 */
	setCellInfo(tdElement, reset) {
		const table = this.setTableInfo(tdElement);
		if (!table) return;

		this.setState('fixedCell', tdElement);
		this.setState('trElement', /** @type {HTMLTableRowElement} */ (tdElement.parentNode));

		// hedaer
		this.styleService.resetHeaderButton(table);

		// caption
		this.styleService.resetCaptionButton(table);

		// set cell info
		if (reset || this.state.physical_cellCnt === 0) {
			if (this.state.tdElement !== tdElement) {
				this.setState('tdElement', tdElement);
			}

			if (!this.state.selectedCells?.length) this.setState('selectedCells', [tdElement]);

			const rows = table.rows;
			this.setState('trElements', rows);
			const cellIndex = tdElement.cellIndex;

			let cellCnt = 0;
			for (let i = 0, cells = rows[0].cells, len = rows[0].cells.length; i < len; i++) {
				cellCnt += cells[i].colSpan;
			}

			// row cnt, row index
			const rowIndex = this.state.trElement.rowIndex;
			this.setState('rowIndex', rowIndex);
			this.setState('rowCnt', rows.length);

			// cell cnt, physical cell index
			this.setState('physical_cellCnt', this.state.trElement.cells.length);
			this.setState('logical_cellCnt', cellCnt);
			this.setState('cellCnt', cellCnt);
			this.setState('physical_cellIndex', cellIndex);

			// span
			this.setState('current_colSpan', this.state.tdElement.colSpan - 1);
			this.setState('current_rowSpan', this.state.trElement.cells[cellIndex].rowSpan - 1);

			// find logical cell index
			const logicalIndex = GetLogicalCellIndex(table, rowIndex, cellIndex);
			this.setState('logical_cellIndex', logicalIndex);
		}
	}

	/**
	 * @description Sets row-related information based on the provided table row element (`<tr>`). This includes updating the row count and the index of the selected row.
	 * @param {HTMLTableRowElement} trElement The target table row (`<tr>`) element from which row information will be extracted.
	 */
	setRowInfo(trElement) {
		const table = this.setTableInfo(trElement);
		const rows = table.rows;
		this.setState('trElements', rows);
		this.setState('rowCnt', rows.length);
		this.setState('rowIndex', trElement.rowIndex);
	}

	/**
	 * @description Sets the table and figure elements based on the provided cell element, and stores references to them for later use.
	 * @param {Node} element The target table cell (`<td>`) element from which the table info will be extracted.
	 * @returns {HTMLTableElement} The `<table>` element that is the parent of the provided `element`.
	 */
	setTableInfo(element) {
		const table = (this._element = dom.query.getParentElement(element, 'TABLE'));
		this.setState('selectedTable', table);
		this.setState('figureElement', dom.query.getParentElement(table, dom.check.isFigure) || table);
		return /** @type {HTMLTableElement} */ (table);
	}

	/**
	 * @description Resets the internal state related to table cell selection,
	 * - clearing any selected cells and removing associated styles and event listeners.
	 */
	resetInfo() {
		this.#initService();
		this.selectionService.deleteStyleSelectedCells();
		this._editorEnable(true);

		this._element = null;
		this.#initState();

		this.#tableXY = [];
		this.#maxWidth = false;
		this.#fixedColumn = false;
	}

	/**
	 * @description Adds a new entry to the history stack.
	 */
	historyPush() {
		this.selectionService.deleteStyleSelectedCells();
		this.$.history.push(false);
		this.selectionService.recallStyleSelectedCells();
	}

	/**
	 * @internal
	 * @description Sets the controller position for a cell.
	 * @param {HTMLTableCellElement} tdElement - The target table cell.
	 */
	_setController(tdElement) {
		if (!this.$.selection.get().isCollapsed && !this.state.selectedCell) {
			this.selectionService.deleteStyleSelectedCells();
			return;
		}

		this.cellService.setUnMergeButton();

		this.setState('tdElement', tdElement);
		if (this.state.fixedCell === tdElement) dom.utils.addClass(tdElement, 'se-selected-cell-focus');
		if (!this.state.selectedCells?.length) this.setState('selectedCells', [tdElement]);
		const tableElement = this.state.selectedTable || this._element || dom.query.getParentElement(tdElement, 'TABLE');
		this.$.component.select(tableElement, Table.key, { isInput: true });
	}

	/**
	 * @internal
	 * @description Sets the position of the cell controller.
	 * @param {HTMLTableCellElement} tdElement - The target table cell.
	 * @param {boolean} reset - Whether to reset the controller position.
	 */
	_setCellControllerPosition(tdElement, reset) {
		this.setCellInfo(tdElement, reset);
		if (!this.cellControllerTop) this.controller_cell.resetPosition(tdElement);
	}

	/**
	 * @description Enables or disables editor mode.
	 * @param {boolean} enabled Whether to enable or disable the editor.
	 */
	_editorEnable(enabled) {
		const wysiwyg = this.$.frameContext.get('wysiwyg');
		wysiwyg.setAttribute('contenteditable', enabled.toString());
		if (enabled) dom.utils.removeClass(wysiwyg, 'se-disabled');
		else dom.utils.addClass(wysiwyg, 'se-disabled');
	}

	/**
	 * @description Closes table-related controllers.
	 */
	_closeController() {
		this.controller_table.close(true);
		this.controller_cell.close(true);
	}

	/**
	 * @description Closes table-related controllers and table figure
	 */
	_closeTableSelectInfo() {
		this.$.component.deselect();
		this._closeController();
	}

	/**
	 * @description Opens the figure.
	 * @param {Node} target - The target figure element.
	 */
	#figureOpen(target) {
		this.figure.open(target, { nonResizing: true, nonSizeInfo: true, nonBorder: true, figureTarget: true, infoOnly: false });
	}

	/**
	 * @description Resets the table picker display.
	 */
	#resetTablePicker() {
		if (!this.#tableHighlight) return;

		const highlight = this.#tableHighlight.style;
		const unHighlight = this.#tableUnHighlight.style;

		highlight.width = '1em';
		highlight.height = '1em';
		unHighlight.width = '5em';
		unHighlight.height = '5em';

		dom.utils.changeTxt(this.#tableDisplay, '1 x 1');
	}

	/**
	 * @description Handles mouse movement within the table picker.
	 * @param {MouseEvent} e The mouse event.
	 */
	#OnMouseMoveTablePicker(e) {
		e.stopPropagation();

		let x = Math.ceil(e.offsetX / 18);
		let y = Math.ceil(e.offsetY / 18);
		x = x < 1 ? 1 : x;
		y = y < 1 ? 1 : y;

		const isRTL = this.$.options.get('_rtl');
		if (isRTL) {
			x = 11 - x;
		}

		this.#tableHighlight.style.width = x + 'em';
		this.#tableHighlight.style.height = y + 'em';

		const x_u = x < 5 ? 5 : x > 8 ? 10 : x + 2;
		const y_u = y < 5 ? 5 : y > 8 ? 10 : y + 2;
		this.#tableUnHighlight.style.width = x_u + 'em';
		this.#tableUnHighlight.style.height = y_u + 'em';

		// RTL mode - menu's left position based on unhighlight width change
		if (isRTL) {
			const prevX_u = this.#prevUnhighlightX || 5;
			const diff = x_u - prevX_u;
			if (diff !== 0) {
				const currentLeft = numbers.get(this.#tableMenu.style.left);
				this.#tableMenu.style.left = currentLeft - diff * 18 + 'px';
				this.#prevUnhighlightX = x_u;
			}
		}

		dom.utils.changeTxt(this.#tableDisplay, x + ' x ' + y);
		this.#tableXY = [x, y];
	}

	/**
	 * @description Executes the selected action when the table picker is clicked.
	 */
	#OnClickTablePicker() {
		const oTable = dom.utils.createElement('TABLE');
		const x = this.#tableXY[0];
		const y = this.#tableXY[1];

		const body = `<tbody>${`<tr>${CreateCellsString('td', x)}</tr>`.repeat(y)}</tbody>`;
		const colGroup = `<colgroup>${`<col style="width: ${numbers.get(100 / x, Constants.CELL_DECIMAL_END)}%;">`.repeat(x)}</colgroup>`;
		oTable.innerHTML = colGroup + body;

		// scroll
		let scrollTypeClass = '';
		if (this.figureScroll) {
			scrollTypeClass = ` se-scroll-figure-${this.figureScroll}`;
		}

		const figure = dom.utils.createElement('FIGURE', { class: 'se-flex-component se-input-component' + scrollTypeClass, style: 'width: 100%;' });
		figure.appendChild(oTable);
		this.#maxWidth = true;

		if (this.$.component.insert(figure, { insertBehavior: 'none' })) {
			this.#resetTablePicker();
			this.$.menu.dropdownOff();
			const target = oTable.querySelector('td div');
			this.$.selection.setRange(target, 0, target, 0);
		}
	}

	/**
	 * @description Initializes services by calling their init methods.
	 */
	#initService() {
		this.resizeService.init();
		this.selectionService.init();
		this.styleService.init();
	}
}

/**
 * @description Adjusts the z-index of the cell controller form.
 * @param {boolean} value - If `true`, brings to top; otherwise resets.
 */
function _CellFormZIndex(value) {
	this.controller_cell.bringToTop(value);
}

export default Table;
