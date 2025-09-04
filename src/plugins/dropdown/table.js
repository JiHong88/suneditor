import EditorInjector from '../../editorInjector';
import { dom, numbers, converter, env, keyCodeMap } from '../../helper';
import { Controller, SelectMenu, ColorPicker, Figure, _DragHandle } from '../../modules';

const { _w, ON_OVER_COMPONENT } = env;

const ROW_SELECT_MARGIN = 6;
const CELL_SELECT_MARGIN = 6;
const CELL_DECIMAL_END = 0;

const RESIZE_CELL_CLASS = '.se-table-resize-line';
const RESIZE_CELL_PREV_CLASS = '.se-table-resize-line-prev';
const RESIZE_ROW_CLASS = '.se-table-resize-row';
const RESIZE_ROW_PREV_CLASS = '.se-table-resize-row-prev';

const BORDER_LIST = ['none', 'solid', 'dotted', 'dashed', 'double', 'groove', 'ridge', 'inset', 'outset'];
const BORDER_FORMATS = {
	all: 'border_all',
	inside: 'border_inside',
	horizon: 'border_horizontal',
	vertical: 'border_vertical',
	outside: 'border_outside',
	left: 'border_left',
	top: 'border_top',
	right: 'border_right',
	bottom: 'border_bottom',
	none: 'border_none'
};
const BORDER_FORMAT_INSIDE = ['all', 'inside', 'horizon', 'vertical'];
const BORDER_NS = {
	l: 'borderLeft',
	t: 'borderTop',
	r: 'borderRight',
	b: 'borderBottom'
};
const DEFAULT_BORDER_UNIT = 'px';
const DEFAULT_COLOR_LIST = [
	// row-1
	'#b0dbb0',
	'#efef7e',
	'#f2acac',
	'#dcb0f6',
	'#99bdff',
	// row-2
	'#5dbd5d',
	'#e7c301',
	'#f64444',
	'#e57ff4',
	'#4387f1',
	// row-3
	'#27836a',
	'#f69915',
	'#ba0808',
	'#a90bed',
	'#134299',
	// row-4
	'#e4e4e4',
	'#B3B3B3',
	'#808080',
	'#4D4D4D',
	'#000000'
];

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
class Table extends EditorInjector {
	static key = 'table';
	static type = 'dropdown-free';
	static className = '';
	static options = { isInputComponent: true };
	/**
	 * @this {Table}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		return dom.check.isTable(node) ? node : null;
	}

	/** @type {HTMLElement} */
	#figure;
	/**
	 * @description Same value a "this._selectedTable", but it maintain prev table element
	 * @type {HTMLTableElement}
	 */
	#element;
	/** @type {HTMLTableCellElement} */
	#tdElement;
	/** @type {HTMLTableRowElement} */
	#trElement;
	/** @type {HTMLTableRowElement[]|HTMLCollectionOf<HTMLTableRowElement>} */
	#trElements;
	/** @type {HTMLTableElement} */
	#selectedTable;
	/** @type {HTMLTableCellElement} */
	#fixedCell;
	/** @type {HTMLTableCellElement} */
	#selectedCell;
	/** @type {HTMLTableCellElement[]} */
	#selectedCells;
	#resizing;
	#resizeLine;
	#resizeLinePrev;
	#tableXY;
	#maxWidth;
	#fixedColumn;
	#physical_cellCnt;
	#logical_cellCnt;
	#cellCnt;
	#rowCnt;
	#rowIndex;
	#physical_cellIndex;
	#logical_cellIndex;
	#current_colSpan;
	#current_rowSpan;
	#shift;
	#_s;
	#fixedCellName;
	#ref;
	#bindMultiOn;
	#bindMultiOff;
	#bindShiftOff;
	#bindTouchOff;
	#globalEvents;

	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {TablePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.table;
		this.icon = 'table';

		// pluginOptions options
		this.figureScrollList = ['se-scroll-figure-xy', 'se-scroll-figure-x', 'se-scroll-figure-y'];
		this.figureScroll = typeof pluginOptions.scrollType === 'string' ? pluginOptions.scrollType.toLowerCase() : 'x';
		this.captionPosition = pluginOptions.captionPosition !== 'bottom' ? 'top' : 'bottom';
		this.cellControllerTop = (pluginOptions.cellControllerPosition !== 'cell' ? 'table' : 'cell') === 'table';

		// create HTML
		const menu = CreateHTML();
		const commandArea = menu.querySelector('.se-controller-table-picker');
		const controller_table = CreateHTML_controller_table(editor);
		const controller_cell = CreateHTML_controller_cell(editor, this.cellControllerTop);
		const controller_props = CreateHTML_controller_properties(editor);

		editor.applyFrameRoots((e) => {
			e.get('wrapper').appendChild(dom.utils.createElement('DIV', { class: RESIZE_CELL_CLASS.replace(/^\./, '') }));
			e.get('wrapper').appendChild(dom.utils.createElement('DIV', { class: RESIZE_CELL_PREV_CLASS.replace(/^\./, '') }));
			e.get('wrapper').appendChild(dom.utils.createElement('DIV', { class: RESIZE_ROW_CLASS.replace(/^\./, '') }));
			e.get('wrapper').appendChild(dom.utils.createElement('DIV', { class: RESIZE_ROW_PREV_CLASS.replace(/^\./, '') }));
		});

		// members - Controller
		if (this.cellControllerTop) {
			this.controller_cell = new Controller(this, controller_cell.html, { position: 'top' });
			this.controller_table = new Controller(this, controller_table, { position: 'top' });
			this.controller_cell.sibling = this.controller_table.form;
			this.controller_table.sibling = this.controller_cell.form;
			this.controller_table.siblingMain = true;
		} else {
			this.controller_table = new Controller(this, controller_table, { position: 'top' });
			this.controller_cell = new Controller(this, controller_cell.html, { position: 'bottom' });
		}

		// props
		const propsTargetForms = [this.controller_table.form, this.controller_cell.form];
		this.controller_props = new Controller(this, controller_props.html, { position: 'bottom', parents: propsTargetForms, isInsideForm: true });
		this.controller_props_title = controller_props.controller_props_title;
		// color picker
		const colorForm = dom.utils.createElement('DIV', { class: 'se-controller se-list-layer' }, null);
		this.colorPicker = new ColorPicker(this, '', {
			colorList: pluginOptions.colorList || DEFAULT_COLOR_LIST,
			splitNum: 5,
			disableRemove: true,
			hueSliderOptions: { controllerOptions: { parents: [colorForm], isOutsideForm: true } }
		});

		colorForm.appendChild(this.colorPicker.target);
		this.controller_colorPicker = new Controller(this, colorForm, {
			position: 'bottom',
			parents: [this.controller_props.form].concat(propsTargetForms),
			isInsideForm: true,
			isWWTarget: false,
			initMethod: () => {
				this.colorPicker.hueSlider.close();
				dom.utils.removeClass(this.controller_colorPicker.currentTarget, 'on');
			}
		});

		this.figure = new Figure(this, null, {});

		this.sliderType = '';

		// members - SelectMenu [cells]
		const openCellMenuFunc = _CellFormZIndex.bind(this, true);
		const closeCellMenuFunc = _CellFormZIndex.bind(this, false);
		// members - SelectMenu - split
		const splitMenu = CreateSplitMenu(this.lang);
		this.splitButton = controller_cell.splitButton;
		this.selectMenu_split = new SelectMenu(this, { checkList: false, position: 'bottom-center', openMethod: openCellMenuFunc, closeMethod: closeCellMenuFunc });
		this.selectMenu_split.on(this.splitButton, this.#OnSplitCells.bind(this));
		this.selectMenu_split.create(splitMenu.items, splitMenu.menus);

		// members - SelectMenu - column
		const columnMenu = CreateColumnMenu(this.lang, this.icons);
		const columnButton = controller_cell.columnButton;
		this.selectMenu_column = new SelectMenu(this, { checkList: false, position: 'bottom-center', openMethod: openCellMenuFunc, closeMethod: closeCellMenuFunc });
		this.selectMenu_column.on(columnButton, this.#OnColumnEdit.bind(this));
		this.selectMenu_column.create(columnMenu.items, columnMenu.menus);

		// members - SelectMenu - row
		const rownMenu = CreateRowMenu(this.lang, this.icons);
		const rowButton = controller_cell.rowButton;
		this.selectMenu_row = new SelectMenu(this, { checkList: false, position: 'bottom-center', openMethod: openCellMenuFunc, closeMethod: closeCellMenuFunc });
		this.selectMenu_row.on(rowButton, this.#OnRowEdit.bind(this));
		this.selectMenu_row.create(rownMenu.items, rownMenu.menus);

		// members - SelectMenu - properties - border style
		const borderMenu = CreateBorderMenu();
		const borderButton = controller_props.borderButton;
		this.selectMenu_props_border = new SelectMenu(this, { checkList: false, position: 'bottom-center' });
		this.selectMenu_props_border.on(borderButton, OnPropsBorderEdit.bind(this));
		this.selectMenu_props_border.create(borderMenu.items, borderMenu.menus);

		// members - SelectMenu - properties - border format
		const borderFormatMenu = CreateBorderFormatMenu(this.lang, this.icons, []);
		const borderFormatButton = controller_props.borderFormatButton;
		this.selectMenu_props_border_format = new SelectMenu(this, { checkList: false, position: 'bottom-left', dir: 'ltr', splitNum: 5 });
		this.selectMenu_props_border_format.on(borderFormatButton, OnPropsBorderFormatEdit.bind(this, 'all'));
		this.selectMenu_props_border_format.create(borderFormatMenu.items, borderFormatMenu.menus);

		const borderFormatMenu_oneCell = CreateBorderFormatMenu(this.lang, this.icons, BORDER_FORMAT_INSIDE);
		this.selectMenu_props_border_format_oneCell = new SelectMenu(this, { checkList: false, position: 'bottom-left', dir: 'ltr', splitNum: 6 });
		this.selectMenu_props_border_format_oneCell.on(borderFormatButton, OnPropsBorderFormatEdit.bind(this, 'outside'));
		this.selectMenu_props_border_format_oneCell.create(borderFormatMenu_oneCell.items, borderFormatMenu_oneCell.menus);

		// memberts - elements..
		this.maxText = this.lang.maxSize;
		this.minText = this.lang.minSize;
		this.propTargets = {
			cell_alignment: controller_props.cell_alignment,
			cell_alignment_vertical: controller_props.cell_alignment_vertical,
			cell_alignment_table_text: controller_props.cell_alignment_table_text,
			border_format: borderFormatButton,
			border_style: controller_props.border_style,
			border_color: controller_props.border_color,
			border_width: controller_props.border_width,
			back_color: controller_props.back_color,
			font_color: controller_props.font_color,
			palette_border_button: controller_props.palette_border_button,
			font_bold: controller_props.font_bold,
			font_underline: controller_props.font_underline,
			font_italic: controller_props.font_italic,
			font_strike: controller_props.font_strike
		};
		this._propsCache = [];
		this._currentFontStyles = [];
		this._propsAlignCache = '';
		this._propsVerticalAlignCache = '';
		this._typeCache = '';

		/** @type {HTMLElement} */
		this.tableHighlight = menu.querySelector('.se-table-size-highlighted');
		/** @type {HTMLElement} */
		this.tableUnHighlight = menu.querySelector('.se-table-size-unhighlighted');
		/** @type {HTMLElement} */
		this.tableDisplay = menu.querySelector('.se-table-size-display');
		/** @type {HTMLButtonElement} */
		this.resizeButton = controller_table.querySelector('._se_table_resize');
		/** @type {HTMLSpanElement} */
		this.resizeText = controller_table.querySelector('._se_table_resize > span > span');
		/** @type {HTMLButtonElement} */
		this.columnFixedButton = controller_table.querySelector('._se_table_fixed_column');
		/** @type {HTMLButtonElement} */
		this.headerButton = controller_table.querySelector('._se_table_header');
		/** @type {HTMLButtonElement} */
		this.captionButton = controller_table.querySelector('._se_table_caption');
		/** @type {HTMLButtonElement} */
		this.mergeButton = controller_cell.mergeButton;
		/** @type {HTMLButtonElement} */
		this.unmergeButton = controller_cell.unmergeButton;

		// members - private
		this.#resizing = false;
		this.#resizeLine = null;
		this.#resizeLinePrev = null;
		this.#figure = null;
		this.#element = null;
		this.#tdElement = null;
		this.#trElement = null;
		this.#trElements = null;
		this.#tableXY = [];
		this.#maxWidth = true;
		this.#fixedColumn = false;
		this.#physical_cellCnt = 0;
		this.#logical_cellCnt = 0;
		this.#cellCnt = 0;
		this.#rowCnt = 0;
		this.#rowIndex = 0;
		this.#physical_cellIndex = 0;
		this.#logical_cellIndex = 0;
		this.#current_colSpan = 0;
		this.#current_rowSpan = 0;

		// member - multi selecte
		this.#selectedTable = null;
		this.#fixedCell = null;
		this.#selectedCell = null;
		this.#selectedCells = null;
		this.#shift = false;
		this.#_s = false;
		this.#fixedCellName = null;
		this.#ref = null;

		// member - global events
		this.#bindMultiOn = this.#OnCellMultiSelect.bind(this);
		this.#bindMultiOff = this.#OffCellMultiSelect.bind(this);
		this.#bindShiftOff = this.#OffCellShift.bind(this);
		this.#bindTouchOff = this.#OffCellTouch.bind(this);
		this.#globalEvents = {
			on: null,
			off: null,
			shiftOff: null,
			touchOff: null,
			resize: null,
			resizeStop: null,
			resizeKeyDown: null
		};

		// init
		this.menu.initDropdownTarget(Table, menu);
		this.eventManager.addEvent(commandArea, 'mousemove', this.#OnMouseMoveTablePicker.bind(this));
		this.eventManager.addEvent(commandArea, 'click', this.#OnClickTablePicker.bind(this));
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 */
	action() {
		const oTable = dom.utils.createElement('TABLE');
		const x = this.#tableXY[0];
		const y = this.#tableXY[1];

		const body = `<tbody>${`<tr>${CreateCellsString('td', x)}</tr>`.repeat(y)}</tbody>`;
		const colGroup = `<colgroup>${`<col style="width: ${numbers.get(100 / x, CELL_DECIMAL_END)}%;">`.repeat(x)}</colgroup>`;
		oTable.innerHTML = colGroup + body;

		// scroll
		let scrollTypeClass = '';
		if (this.figureScroll) {
			scrollTypeClass = ` se-scroll-figure-${this.figureScroll}`;
		}

		const figure = dom.utils.createElement('FIGURE', { class: 'se-flex-component se-input-component' + scrollTypeClass, style: 'width: 100%;' });
		figure.appendChild(oTable);
		this.#maxWidth = true;

		if (this.component.insert(figure, { insertBehavior: 'none' })) {
			this._resetTablePicker();
			const target = oTable.querySelector('td div');
			this.selection.setRange(target, 0, target, 0);
		}
	}

	/**
	 * @editorMethod Editor.component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target Target component element
	 */
	select(target) {
		this._figureOpen(target);
		if (!this.#figure) this.setTableInfo(target);

		this.#maxWidth = this.#figure?.style.width === '100%';
		this.#fixedColumn = dom.utils.hasClass(target, 'se-table-layout-fixed') || target.style.tableLayout === 'fixed';
		this.#setTableStyle(this.#maxWidth ? 'width|column' : 'width', true);

		if (_DragHandle.get('__overInfo') === ON_OVER_COMPONENT) return;

		if (!this.#tdElement) return;
		this.setCellInfo(this.#tdElement, true);

		// controller open
		const btnDisabled = this.#selectedCells?.length > 1;
		const figureEl = dom.query.getParentElement(target, dom.check.isFigure);
		this.controller_table.open(figureEl, null, { isWWTarget: false, initMethod: null, addOffset: null, disabled: btnDisabled });

		if (!this.#fixedCell) return;

		this.#setUnMergeButton();
		this.controller_cell.open(this.#tdElement, this.cellControllerTop ? figureEl : null, { isWWTarget: false, initMethod: null, addOffset: null, disabled: btnDisabled });
	}

	/**
	 * @editorMethod Editor.component
	 * @description Executes the method that is called when a component copy is requested.
	 * @param {__se__PluginCopyComponentParams} params
	 * @returns {boolean|void}
	 */
	onCopyComponent({ event, cloneContainer }) {
		/** @type {NodeListOf<HTMLTableCellElement>} */
		const selectedCells = cloneContainer.querySelectorAll('.se-selected-table-cell');
		dom.utils.removeClass(selectedCells, 'se-selected-table-cell|se-selected-cell-focus');

		if (selectedCells.length > 0) {
			SetClipboardSelectedTableCells(event, cloneContainer, selectedCells);
			this.editor.ui.showToast(this.lang.message_copy_success, 550);
		}
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "copy".
	 * @param {__se__PluginPasteParams} params
	 * @returns {boolean|void}
	 */
	onPaste({ event, doc }) {
		/** @type {HTMLTableCellElement} */
		const targetCell = dom.query.getParentElement(dom.query.getEventTarget(event), dom.check.isTableCell);
		if (!targetCell) return;

		const domParserBody = doc.body;
		if (domParserBody.childElementCount !== 1) return;

		const componentInfo = this.component.get(domParserBody.firstElementChild);
		if (componentInfo.pluginName !== Table.key) return;

		const copyTable = /** @type {HTMLTableElement} */ (componentInfo.target);
		this.pasteTableCellMatrix(copyTable, targetCell);

		return true;
	}

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
	retainFormat() {
		return {
			query: 'table',
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
			}
		};
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the method called when the rtl, ltr mode changes. ("editor.setDir")
	 * @param {string} dir Direction ("rtl" or "ltr")
	 */
	setDir(dir) {
		this.tableHighlight.style.left = dir === 'rtl' ? 10 * 18 - 13 + 'px' : '';
		this._resetTablePicker();
		this._resetPropsAlign();
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "mousemove".
	 * @param {__se__PluginMouseEventInfo} params
	 */
	onMouseMove({ event }) {
		if (this.#resizing) return;

		const eventTarget = dom.query.getEventTarget(event);
		const target = dom.query.getParentElement(eventTarget, IsResizeEls);
		if (!target || event.buttons === 1) {
			this.__hideResizeLine();
			return;
		}

		const cellEdge = CheckCellEdge(event, target);
		if (cellEdge.is) {
			if (this.#element) this.#element.style.cursor = '';
			this.__removeGlobalEvents();
			if (this.#resizeLine?.style.display === 'block') this.#resizeLine.style.display = 'none';
			this.#resizeLine = this.frameContext.get('wrapper').querySelector(RESIZE_CELL_CLASS);
			this._setResizeLinePosition(dom.query.getParentElement(target, dom.check.isTable), target, this.#resizeLine, cellEdge.isLeft);
			this.#resizeLine.style.display = 'block';
			return;
		}

		const rowEdge = CheckRowEdge(event, target);
		if (rowEdge.is) {
			this.__removeGlobalEvents();
			this.#element = dom.query.getParentElement(target, dom.check.isTable);
			this.#element.style.cursor = 'ns-resize';
			if (this.#resizeLine?.style.display === 'block') this.#resizeLine.style.display = 'none';
			this.#resizeLine = this.frameContext.get('wrapper').querySelector(RESIZE_ROW_CLASS);
			this._setResizeRowPosition(dom.query.getParentElement(target, dom.check.isTable), target, this.#resizeLine);
			this.#resizeLine.style.display = 'block';
			return;
		}

		if (this.#element) this.#element.style.cursor = '';
		this.__hideResizeLine();
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "scroll".
	 */
	onScroll() {
		if (this.#resizeLine?.style.display !== 'block') return;
		// delete resize line position
		if (this.#element) this.#element.style.cursor = '';
		this.#resizeLine.style.display = 'none';
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "mousedown".
	 * @param {__se__PluginMouseEventInfo} params
	 */
	onMouseDown({ event }) {
		this.#ref = this.#selectedCell = null;
		const eventTarget = dom.query.getEventTarget(event);
		const target = /** @type {HTMLTableCellElement} */ (dom.query.getParentElement(eventTarget, IsResizeEls));
		if (!target) return;

		if (!this.cellControllerTop) {
			this.controller_cell.hide();
		}

		const cellEdge = CheckCellEdge(event, target);
		if (cellEdge.is) {
			try {
				this._deleteStyleSelectedCells();
				this.setCellInfo(target, true);
				const colIndex = this.#logical_cellIndex + this.#current_colSpan - (cellEdge.isLeft ? 1 : 0);

				// ready
				this.ui.enableBackWrapper('ew-resize');
				this.#resizeLine ||= this.frameContext.get('wrapper').querySelector(RESIZE_CELL_CLASS);
				this.#resizeLinePrev = this.frameContext.get('wrapper').querySelector(RESIZE_CELL_PREV_CLASS);

				// select figure
				if (colIndex < 0 || colIndex === this.#logical_cellCnt - 1) {
					this._startFigureResizing(cellEdge.startX, colIndex < 0);
					return;
				}

				const col = this.#element.querySelector('colgroup').querySelectorAll('col')[colIndex < 0 ? 0 : colIndex];
				this._startCellResizing(col, cellEdge.startX, numbers.get(_w.getComputedStyle(col).width, CELL_DECIMAL_END), cellEdge.isLeft);
				this._toggleEditor(false);
			} catch (err) {
				console.warn('[SUNEDITOR.plugins.table.error]', err);
				this.__removeGlobalEvents();
			} finally {
				this.#fixedCell = this.#selectedCell = null;
			}

			return;
		}

		const rowEdge = CheckRowEdge(event, target);
		if (rowEdge.is) {
			try {
				/** @type {HTMLTableRowElement} */
				let row = dom.query.getParentElement(target, dom.check.isTableRow);
				let rowSpan = target.rowSpan;
				if (rowSpan > 1) {
					while (dom.check.isTableRow(row) && rowSpan > 1) {
						row = /** @type {HTMLTableRowElement} */ (row.nextElementSibling);
						--rowSpan;
					}
				}

				this._deleteStyleSelectedCells();
				this.setRowInfo(row);

				// ready
				this.ui.enableBackWrapper('ns-resize');
				this.#resizeLine ||= this.frameContext.get('wrapper').querySelector(RESIZE_ROW_CLASS);
				this.#resizeLinePrev = this.frameContext.get('wrapper').querySelector(RESIZE_ROW_PREV_CLASS);

				this._startRowResizing(row, rowEdge.startY, numbers.get(_w.getComputedStyle(row).height, CELL_DECIMAL_END));
				this._toggleEditor(false);
			} catch (err) {
				console.warn('[SUNEDITOR.plugins.table.error]', err);
				this.__removeGlobalEvents();
			} finally {
				this.#fixedCell = this.#selectedCell = null;
			}

			return;
		}

		if (this.#shift && target !== this.#fixedCell) return;

		this._deleteStyleSelectedCells();
		if (/^TR$/i.test(target.nodeName)) return;

		this.#StyleSelectCells(target, false);
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "mouseup".
	 */
	onMouseUp() {
		this.#shift = false;
		if (!this.cellControllerTop) {
			this.controller_cell.resetPosition(this.#fixedCell);
		}
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "mouseleave".
	 */
	onMouseLeave() {
		this.__hideResizeLine();
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "keydown".
	 * @param {__se__PluginKeyEventInfo} params
	 */
	onKeyDown({ event, range, line }) {
		this.#ref = null;

		const keyCode = event.code;
		const isTab = keyCodeMap.isTab(keyCode);
		if (this.editor.selectMenuOn || this.#resizing || (!isTab && this.#_s) || keyCodeMap.isCtrl(event)) return;

		if (!this.cellControllerTop) {
			this.controller_cell.hide();
		}

		this.#_s = keyCodeMap.isShift(event);

		// table tabkey
		if (isTab) {
			this._deleteStyleSelectedCells();
			const tableCell = dom.query.getParentElement(line, dom.check.isTableCell);
			if (tableCell && range.collapsed && dom.check.isEdgePoint(range.startContainer, range.startOffset)) {
				this._closeController();

				const shift = this.#_s;
				this.#shift = this.#_s = false;

				/** @type {HTMLTableElement} */
				const table = dom.query.getParentElement(tableCell, 'table');
				/** @type {HTMLTableCellElement[]} */
				const cells = dom.query.getListChildren(table, dom.check.isTableCell);
				const idx = shift ? dom.utils.prevIndex(cells, tableCell) : dom.utils.nextIndex(cells, tableCell);

				if (idx === cells.length && !shift) {
					if (!dom.query.getParentElement(tableCell, 'thead')) {
						const rows = table.rows;
						const newRow = this.insertBodyRow(table, rows.length, this.#cellCnt);
						const firstTd = newRow.querySelector('td div');
						this.selection.setRange(firstTd, 0, firstTd, 0);
					}

					event.preventDefault();
					event.stopPropagation();

					return false;
				}

				if (idx === -1 && shift) return false;

				const moveCell = cells[idx];
				if (!moveCell) return;

				const rangeCell = moveCell.firstElementChild || moveCell;
				this.selection.setRange(rangeCell, 0, rangeCell, 0);

				event.preventDefault();
				event.stopPropagation();

				return false;
			}
		}

		let cell = null;
		if (!keyCodeMap.isShift(event)) {
			cell = dom.query.getParentElement(line, dom.check.isTableCell);
			if (!dom.utils.hasClass(cell, 'se-selected-cell-focus')) return;

			this._deleteStyleSelectedCells();
			this._toggleEditor(true);
			this.__removeGlobalEvents();
			this._closeController();

			return;
		}

		if (this.#shift || this.#ref) return;

		cell ||= /** @type {HTMLTableCellElement} */ (dom.query.getParentElement(line, dom.check.isTableCell));
		if (cell) {
			this.#_s = false;
			this.#fixedCell = cell;
			this._closeController();
			this.#StyleSelectCells(cell, event.shiftKey);
			return false;
		}
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "keyup".
	 * @param {__se__PluginKeyEventInfo} params
	 */
	onKeyUp({ line }) {
		this.#_s = false;
		if (this.#shift && dom.query.getParentElement(line, dom.check.isTableCell) === this.#fixedCell) {
			this._deleteStyleSelectedCells();
			this._toggleEditor(true);
			this.__removeGlobalEvents();
		}
		this.#shift = false;
	}

	/**
	 * @editorMethod Modules.ColorPicker
	 * @description Executes the method called when a button of "ColorPicker" module is clicked.
	 * @param {string} color - Color code (hex)
	 */
	colorPickerAction(color) {
		const target = this.propTargets[`${this.sliderType}_color`];
		target.style.borderColor = target.value = color;
		this.controller_colorPicker.close();
	}

	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method that is called when a button is clicked in the "controller".
	 * @param {HTMLButtonElement} target Target button element
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		if (!command) return;

		const { back_color, font_color, border_color } = this.propTargets;
		const value = target.getAttribute('data-value');

		switch (command) {
			case 'header':
				this.toggleHeader();
				this._historyPush();
				break;
			case 'caption':
				this.toggleCaption();
				this._historyPush();
				break;
			case 'onsplit':
				this.selectMenu_split.open();
				break;
			case 'oncolumn':
				this.selectMenu_column.open();
				break;
			case 'onrow':
				this.selectMenu_row.menus[0].style.display = this.selectMenu_row.menus[1].style.display = /^TH$/i.test(this.#tdElement?.nodeName) ? 'none' : '';
				this.selectMenu_row.open();
				break;
			case 'openTableProperties':
				if (this.controller_props.currentTarget === target && this.controller_props.form?.style.display === 'block') {
					this.controller_props.close();
				} else {
					this.controller_props_title.textContent = this.lang.tableProperties;
					this._setCtrlProps('table');
					this.controller_props.open(target, this.controller_table.form, { isWWTarget: false, initMethod: null, addOffset: null });
				}
				break;
			case 'openCellProperties':
				if (this.controller_props.currentTarget === target && this.controller_props.form?.style.display === 'block') {
					this.controller_props.close();
				} else {
					this.controller_props_title.textContent = this.lang.cellProperties;
					this._setCtrlProps('cell');
					this.controller_props.open(target, this.controller_cell.form, { isWWTarget: false, initMethod: null, addOffset: null });
				}
				break;
			case 'props_onborder_format':
				if (this._propsCache.length === 1) {
					this.selectMenu_props_border_format_oneCell.open();
				} else {
					this.selectMenu_props_border_format.open();
				}
				break;
			case 'props_onborder_style':
				this.selectMenu_props_border.open();
				break;
			case 'props_onpalette':
				this._onColorPalette(target, value, value === 'border' ? border_color : value === 'back' ? back_color : font_color);
				break;
			case 'props_font_style':
				dom.utils.toggleClass(this.propTargets[`font_${value}`], 'on');
				break;
			case 'props_submit':
				this._submitProps(target);
				break;
			case 'revert': {
				const propsCache = this._propsCache;
				for (let i = 0, len = propsCache.length; i < len; i++) {
					propsCache[i][0].style.cssText = propsCache[i][1];
				}
				// alignment
				this._setAlignProps(this.propTargets.cell_alignment, this._propsAlignCache, true);
				this._setAlignProps(this.propTargets.cell_alignment_vertical, this._propsVerticalAlignCache, true);
				if (dom.check.isTable(propsCache[0][0]) && this.#figure) {
					this.#figure.style.float = this._propsAlignCache;
				}
				break;
			}
			case 'props_align':
				this._setAlignProps(this.propTargets.cell_alignment, target.getAttribute('data-value'), false);
				break;
			case 'props_align_vertical':
				this._setAlignProps(this.propTargets.cell_alignment_vertical, target.getAttribute('data-value'), false);
				break;
			case 'merge':
				this.mergeCells(this.#selectedCells);
				break;
			case 'unmerge':
				this.unmergeCells(this.#selectedCells);
				break;
			case 'resize':
				this.#maxWidth = !this.#maxWidth;
				this.#setTableStyle('width', false);
				this._historyPush();
				_w.setTimeout(() => {
					this.component.select(this.#element, Table.key, { isInput: true });
				}, 0);
				break;
			case 'layout':
				this.#fixedColumn = !this.#fixedColumn;
				this.#setTableStyle('column', false);
				this._historyPush();
				_w.setTimeout(() => {
					this.component.select(this.#element, Table.key, { isInput: true });
				}, 0);
				break;
			case 'copy':
				this.component.copy(this.#figure);
				break;
			case 'remove': {
				const emptyDiv = this.#figure?.parentNode;
				dom.utils.removeItem(this.#figure);

				this._closeTableSelectInfo();

				if (emptyDiv !== this.frameContext.get('wysiwyg'))
					this.nodeTransform.removeAllParents(
						emptyDiv,
						function (current) {
							return current.childNodes.length === 0;
						},
						null
					);
				this.editor.focus();
				this.history.push(false);
			}
		}

		// [close_props]
		if (!/(^props_|^revert|Properties$)/.test(command)) {
			this.controller_props.close();
			this.controller_colorPicker.close();
		}

		if (!/^(remove|props_|on|open|merge)/.test(command)) {
			this._setCellControllerPosition(this.#tdElement, this.#shift);
		}
	}

	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method called when the "controller" is closed.
	 */
	close() {
		this.__removeGlobalEvents();
		this._deleteStyleSelectedCells();
		this._toggleEditor(true);

		this.#figure = null;
		this.#element = null;
		this.#trElement = null;
		this.#trElements = null;
		this.#tableXY = [];
		this.#maxWidth = false;
		this.#fixedColumn = false;
		this.#physical_cellCnt = 0;
		this.#logical_cellCnt = 0;
		this.#rowCnt = 0;
		this.#rowIndex = 0;
		this.#physical_cellIndex = 0;
		this.#logical_cellIndex = 0;
		this.#current_colSpan = 0;
		this.#current_rowSpan = 0;

		this.#shift = false;
		this.#selectedCells = null;
		this.#selectedTable = null;
		this.#ref = null;

		this.#fixedCell = null;
		this.#selectedCell = null;
		this.#fixedCellName = null;

		const { border_format, border_color, border_style, border_width, back_color, font_color, cell_alignment, cell_alignment_vertical, font_bold, font_underline, font_italic, font_strike } = this.propTargets;
		dom.utils.removeClass([border_format, border_color, border_style, border_width, back_color, font_color, cell_alignment, cell_alignment_vertical, font_bold, font_underline, font_italic, font_strike], 'on');
	}

	/**
	 * @description Selects a group of table cells and sets internal state related to multi-cell selection.
	 * @param {HTMLTableCellElement[]} cells - An array of table cell elements to be selected.
	 */
	selectCells(cells) {
		const firstCell = cells[0];
		const lastCell = dom.query.findVisualLastCell(cells);

		this.#selectedCells = cells;
		this.#fixedCell = firstCell;
		this.#selectedCell = lastCell;
		this.#fixedCellName = firstCell.nodeName;
		this.#selectedTable = dom.query.getParentElement(firstCell, 'TABLE');

		this._setMultiCells(firstCell, lastCell);
	}

	/**
	 * @description Sets the table and figure elements based on the provided cell element, and stores references to them for later use.
	 * @param {Node} element The target table cell (`<td>`) element from which the table info will be extracted.
	 * @returns {HTMLTableElement} The `<table>` element that is the parent of the provided `element`.
	 */
	setTableInfo(element) {
		const table = (this.#element = this.#selectedTable = dom.query.getParentElement(element, 'TABLE'));
		this.#figure = dom.query.getParentElement(table, dom.check.isFigure) || table;
		return /** @type {HTMLTableElement} */ (table);
	}

	/**
	 * @description Sets various table-related information based on the provided table cell element (`<td>`). This includes updating cell, row, and table attributes, handling spanning cells, and adjusting the UI for elements like headers and captions.
	 * @param {HTMLTableCellElement} tdElement The target table cell (`<td>`) element from which table information will be extracted.
	 * @param {boolean} reset A flag indicating whether to reset the cell information. If `true`, the cell information will be reset and recalculated.
	 */
	setCellInfo(tdElement, reset) {
		const table = this.setTableInfo(tdElement);
		if (!table) return;
		this.#fixedCell = tdElement;
		this.#trElement = /** @type {HTMLTableRowElement} */ (tdElement.parentNode);

		// hedaer
		if (table.querySelector('thead')) dom.utils.addClass(this.headerButton, 'active');
		else dom.utils.removeClass(this.headerButton, 'active');

		// caption
		if (table.querySelector('caption')) dom.utils.addClass(this.captionButton, 'active');
		else dom.utils.removeClass(this.captionButton, 'active');

		if (reset || this.#physical_cellCnt === 0) {
			if (this.#tdElement !== tdElement) {
				this.#tdElement = tdElement;
				this.#trElement = /** @type {HTMLTableRowElement} */ (tdElement.parentNode);
			}

			if (!this.#selectedCells?.length) this.#selectedCells = [tdElement];

			const rows = (this.#trElements = table.rows);
			const cellIndex = tdElement.cellIndex;

			let cellCnt = 0;
			for (let i = 0, cells = rows[0].cells, len = rows[0].cells.length; i < len; i++) {
				cellCnt += cells[i].colSpan;
			}

			// row cnt, row index
			const rowIndex = (this.#rowIndex = this.#trElement.rowIndex);
			this.#rowCnt = rows.length;

			// cell cnt, physical cell index
			this.#physical_cellCnt = this.#trElement.cells.length;
			this.#logical_cellCnt = this.#cellCnt = cellCnt;
			this.#physical_cellIndex = cellIndex;

			// span
			this.#current_colSpan = this.#tdElement.colSpan - 1;
			this.#current_rowSpan = this.#trElement.cells[cellIndex].rowSpan - 1;

			// find logcal cell index
			let rowSpanArr = [];
			let spanIndex = [];
			for (let i = 0, cells, colSpan; i <= rowIndex; i++) {
				cells = rows[i].cells;
				colSpan = 0;
				for (let c = 0, cLen = cells.length, cell, cs, rs, logcalIndex; c < cLen; c++) {
					cell = cells[c];
					cs = cell.colSpan - 1;
					rs = cell.rowSpan - 1;
					logcalIndex = c + colSpan;

					if (spanIndex.length > 0) {
						for (let r = 0, arr; r < spanIndex.length; r++) {
							arr = spanIndex[r];
							if (arr.row > i) continue;
							if (logcalIndex >= arr.index) {
								colSpan += arr.cs;
								logcalIndex += arr.cs;
								arr.rs -= 1;
								arr.row = i + 1;
								if (arr.rs < 1) {
									spanIndex.splice(r, 1);
									r--;
								}
							} else if (c === cLen - 1) {
								arr.rs -= 1;
								arr.row = i + 1;
								if (arr.rs < 1) {
									spanIndex.splice(r, 1);
									r--;
								}
							}
						}
					}

					// logcal cell index
					if (i === rowIndex && c === cellIndex) {
						this.#logical_cellIndex = logcalIndex;
						break;
					}

					if (rs > 0) {
						rowSpanArr.push({
							index: logcalIndex,
							cs: cs + 1,
							rs: rs,
							row: -1
						});
					}

					colSpan += cs;
				}

				spanIndex = spanIndex.concat(rowSpanArr).sort(function (a, b) {
					return a.index - b.index;
				});
				rowSpanArr = [];
			}

			rowSpanArr = null;
			spanIndex = null;
		}
	}

	/**
	 * @description Sets row-related information based on the provided table row element (`<tr>`). This includes updating the row count and the index of the selected row.
	 * @param {HTMLTableRowElement} trElement The target table row (`<tr>`) element from which row information will be extracted.
	 */
	setRowInfo(trElement) {
		const table = this.setTableInfo(trElement);
		const rows = (this.#trElements = table.rows);
		this.#rowCnt = rows.length;
		this.#rowIndex = trElement.rowIndex;
	}

	/**
	 * @description Edits the table by adding, removing, or modifying rows and cells, based on the provided options. Supports both single and multi-cell/row editing.
	 * @param {"row"|"cell"} type The type of element to edit ('row' or 'cell').
	 * @param {?"up"|"down"|"left"|"right"} option The action to perform: 'up', 'down', 'left', 'right', or `null` for removing.
	 */
	editTable(type, option) {
		const table = this.#element;
		const isRow = type === 'row';

		if (isRow) {
			const tableAttr = this.#trElement.parentElement;
			if (/^THEAD$/i.test(tableAttr.nodeName)) {
				if (option === 'up') {
					return;
				} else if (!tableAttr.nextElementSibling || !/^TBODY$/i.test(tableAttr.nextElementSibling.nodeName)) {
					if (!option) {
						dom.utils.removeItem(this.#figure);
						this._closeTableSelectInfo();
					} else {
						table.innerHTML += '<tbody><tr>' + CreateCellsString('td', this.#logical_cellCnt) + '</tr></tbody>';
					}
					return;
				}
			}
		}

		// multi
		if (this.#ref) {
			const positionCell = this.#tdElement;
			const selectedCells = this.#selectedCells;
			// multi - row
			if (isRow) {
				// remove row
				if (!option) {
					let row = selectedCells[0].parentNode;
					const removeCells = [selectedCells[0]];

					for (let i = 1, len = selectedCells.length, cell; i < len; i++) {
						cell = selectedCells[i];
						if (row !== cell.parentNode) {
							removeCells.push(cell);
							row = cell.parentNode;
						}
					}

					for (let i = 0, len = removeCells.length; i < len; i++) {
						this.setCellInfo(removeCells[i], true);
						this.editRow(option);
					}
				} else {
					// edit row
					this.setCellInfo(option === 'up' ? selectedCells[0] : selectedCells.at(-1), true);
					this.editRow(option, null, positionCell);
				}
			} else {
				// multi - cell
				const firstRow = selectedCells[0].parentNode;
				// remove cell
				if (!option) {
					const removeCells = [selectedCells[0]];

					for (let i = 1, len = selectedCells.length, cell; i < len; i++) {
						cell = selectedCells[i];
						if (firstRow === cell.parentNode) {
							removeCells.push(cell);
						} else {
							break;
						}
					}

					for (let i = 0, len = removeCells.length; i < len; i++) {
						this.setCellInfo(removeCells[i], true);
						this.editCell(option);
					}
				} else {
					// edit cell
					let rightCell = null;

					for (let i = 0, len = selectedCells.length - 1; i < len; i++) {
						if (firstRow !== selectedCells[i + 1].parentNode) {
							rightCell = selectedCells[i];
							break;
						}
					}

					this.setCellInfo(option === 'left' ? selectedCells[0] : rightCell || selectedCells[0], true);
					this.editCell(option, null, positionCell);
				}
			}

			if (!option) this.close();
		} // one
		else {
			this[isRow ? 'editRow' : 'editCell'](option);
		}

		// after remove
		if (!option) {
			const children = table.children;
			for (let i = 0; i < children.length; i++) {
				if (children[i].children.length === 0) {
					dom.utils.removeItem(children[i]);
					i--;
				}
			}

			if (table.children.length === 0) dom.utils.removeItem(table);
		}
	}

	/**
	 * @description Edits a table row, either adding, removing, the row
	 * @param {?string} option The action to perform on the row ("up"|"down"|null)
	 * - null: to remove the row
	 * - 'up': to insert the row up
	 * - 'down': to insert the row down, or null to remove.
	 * @param {?HTMLTableCellElement=} targetCell Target cell, (default: current selected cell)
	 * @param {?HTMLTableCellElement=} [positionResetElement] The element to reset the position of (optional). This can be the cell that triggered the row edit.
	 */
	editRow(option, targetCell, positionResetElement) {
		this._deleteStyleSelectedCells();
		if (targetCell) this.setCellInfo(targetCell, true);

		const remove = !option;
		const up = option === 'up';
		const originRowIndex = this.#rowIndex;
		const rowIndex = remove || up ? originRowIndex : originRowIndex + this.#current_rowSpan + 1;
		const sign = remove ? -1 : 1;

		const rows = this.#trElements;
		let cellCnt = this.#logical_cellCnt;

		for (let i = 0, len = originRowIndex + (remove ? -1 : 0), cell; i <= len; i++) {
			cell = rows[i].cells;
			if (cell.length === 0) return;

			for (let c = 0, cLen = cell.length, rs, cs; c < cLen; c++) {
				rs = cell[c].rowSpan;
				cs = cell[c].colSpan;
				if (rs < 2 && cs < 2) continue;

				if (rs + i > rowIndex && rowIndex > i) {
					cell[c].rowSpan = rs + sign;
					cellCnt -= cs;
				}
			}
		}

		if (remove) {
			const next = rows[originRowIndex + 1];
			if (next) {
				const spanCells = [];
				let cells = rows[originRowIndex].cells;
				let colSpan = 0;

				for (let i = 0, len = cells.length, cell, logcalIndex; i < len; i++) {
					cell = cells[i];
					logcalIndex = i + colSpan;
					colSpan += cell.colSpan - 1;

					if (cell.rowSpan > 1) {
						cell.rowSpan -= 1;
						spanCells.push({ cell: /** @type {HTMLTableCellElement} */ (cell.cloneNode(false)), index: logcalIndex });
					}
				}

				if (spanCells.length > 0) {
					let spanCell = spanCells.shift();
					cells = next.cells;
					colSpan = 0;

					for (let i = 0, len = cells.length, cell, logcalIndex; i < len; i++) {
						cell = cells[i];
						logcalIndex = i + colSpan;
						colSpan += cell.colSpan - 1;

						if (logcalIndex >= spanCell.index) {
							i--;
							colSpan--;
							colSpan += spanCell.cell.colSpan - 1;
							next.insertBefore(spanCell.cell, cell);
							spanCell = spanCells.shift();
							if (!spanCell) break;
						}
					}

					if (spanCell) {
						next.appendChild(spanCell.cell);
						for (let i = 0, len = spanCells.length; i < len; i++) {
							next.appendChild(spanCells[i].cell);
						}
					}
				}
			}

			this.#element.deleteRow(rowIndex);
		} else {
			this.insertBodyRow(this.#element, rowIndex, cellCnt);
		}

		if (!remove) {
			this._setCellControllerPosition(positionResetElement || this.#tdElement, true);
		} else {
			this._closeController();
		}
	}

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
	editCell(option, targetCell, positionResetElement) {
		if (targetCell) this.setCellInfo(targetCell, true);

		const remove = !option;
		const left = option === 'left';
		const colSpan = this.#current_colSpan;
		const cellIndex = remove || left ? this.#logical_cellIndex : this.#logical_cellIndex + colSpan + 1;

		const rows = this.#trElements;
		let rowSpanArr = [];
		let spanIndex = [];
		let passCell = 0;
		let insertIndex;
		const removeCell = [];
		const removeSpanArr = [];

		for (let i = 0, len = this.#rowCnt, row, cells, newCell, applySpan, cellColSpan; i < len; i++) {
			row = rows[i];
			insertIndex = cellIndex;
			applySpan = false;
			cells = row.cells;
			cellColSpan = 0;

			for (let c = 0, cell, cLen = cells.length, rs, cs, removeIndex; c < cLen; c++) {
				cell = cells[c];
				if (!cell) break;

				rs = cell.rowSpan - 1;
				cs = cell.colSpan - 1;

				if (!remove) {
					if (c >= insertIndex) break;
					if (cs > 0) {
						if (passCell < 1 && cs + c >= insertIndex) {
							cell.colSpan += 1;
							insertIndex = null;
							passCell = rs + 1;
							break;
						}

						insertIndex -= cs;
					}

					if (!applySpan) {
						for (let r = 0, arr; r < spanIndex.length; r++) {
							arr = spanIndex[r];
							insertIndex -= arr.cs;
							arr.rs -= 1;
							if (arr.rs < 1) {
								spanIndex.splice(r, 1);
								r--;
							}
						}
						applySpan = true;
					}
				} else {
					removeIndex = c + cellColSpan;

					if (spanIndex.length > 0) {
						const lastCell = !cells[c + 1];
						for (let r = 0, arr; r < spanIndex.length; r++) {
							arr = spanIndex[r];
							if (arr.row > i) continue;

							if (removeIndex >= arr.index) {
								cellColSpan += arr.cs;
								removeIndex = c + cellColSpan;
								arr.rs -= 1;
								arr.row = i + 1;
								if (arr.rs < 1) {
									spanIndex.splice(r, 1);
									r--;
								}
							} else if (lastCell) {
								arr.rs -= 1;
								arr.row = i + 1;
								if (arr.rs < 1) {
									spanIndex.splice(r, 1);
									r--;
								}
							}
						}
					}

					if (rs > 0) {
						rowSpanArr.push({
							rs: rs,
							cs: cs + 1,
							index: removeIndex,
							row: -1
						});
					}

					if (removeIndex >= insertIndex && removeIndex + cs <= insertIndex + colSpan) {
						removeCell.push(cell);
					} else if (removeIndex <= insertIndex + colSpan && removeIndex + cs >= insertIndex) {
						cell.colSpan -= numbers.getOverlapRangeAtIndex(cellIndex, cellIndex + colSpan, removeIndex, removeIndex + cs);
					} else if (rs > 0 && (removeIndex < insertIndex || removeIndex + cs > insertIndex + colSpan)) {
						removeSpanArr.push({
							cell: cell,
							i: i,
							rs: i + rs
						});
					}

					cellColSpan += cs;
				}
			}

			spanIndex = spanIndex.concat(rowSpanArr).sort(function (a, b) {
				return a.index - b.index;
			});
			rowSpanArr = [];

			if (!remove) {
				if (passCell > 0) {
					passCell -= 1;
					continue;
				}

				if (insertIndex !== null && cells.length > 0) {
					newCell = CreateCellsHTML(cells[0].nodeName);
					newCell = row.insertBefore(newCell, cells[insertIndex]);
				}
			}
		}

		const colgroup = this.#element.querySelector('colgroup');
		if (colgroup) {
			const cols = colgroup.querySelectorAll('col');
			if (remove) {
				dom.utils.removeItem(cols[insertIndex]);
			} else {
				let totalW = 0;
				for (let i = 0, len = cols.length, w; i < len; i++) {
					w = numbers.get(cols[i].style.width);
					w -= Math.round((w * len * 0.1) / 2);
					totalW += w;
					cols[i].style.width = `${w}%`;
				}
				const newCol = dom.utils.createElement('col', { style: `width:${100 - totalW}%` });
				colgroup.insertBefore(newCol, cols[insertIndex]);
			}
		}

		if (remove) {
			let removeFirst, removeEnd;
			for (let r = 0, rLen = removeCell.length, row; r < rLen; r++) {
				row = /** @type {HTMLTableRowElement} */ (removeCell[r].parentNode);
				dom.utils.removeItem(removeCell[r]);
				if (row.cells.length === 0) {
					removeFirst ||= dom.utils.getArrayIndex(rows, row);
					removeEnd = dom.utils.getArrayIndex(rows, row);
					dom.utils.removeItem(row);
				}
			}

			for (let c = 0, cLen = removeSpanArr.length, rowSpanCell; c < cLen; c++) {
				rowSpanCell = removeSpanArr[c];
				rowSpanCell.cell.rowSpan = numbers.getOverlapRangeAtIndex(removeFirst, removeEnd, rowSpanCell.i, rowSpanCell.rs);
			}

			this._closeController();
		} else {
			this._setCellControllerPosition(positionResetElement || this.#tdElement, true);
		}

		return positionResetElement || this.#tdElement;
	}

	/**
	 * @description Updates the target table's cells with the data from the copied table.
	 * @param {HTMLTableElement} copyTable The table containing the copied data.
	 * @param {HTMLTableCellElement} targetTD The starting cell in the target table where data will be pasted.
	 */
	pasteTableCellMatrix(copyTable, targetTD) {
		if (!copyTable || !targetTD) return;

		// --- copy info ---
		const copyRows = copyTable.rows;
		let rowCnt = 0;
		const colIndexMap = [];
		for (let row = 0; row < copyRows.length; row++) {
			const cells = copyRows[row].cells;
			let logicalCol = 0;

			for (let i = 0; i < cells.length; i++) {
				const cell = cells[i];

				while (colIndexMap[row]?.[logicalCol]) {
					logicalCol++;
				}

				const rowspan = cell.rowSpan || 1;
				const colspan = cell.colSpan || 1;

				if (logicalCol === 0) {
					rowCnt += rowspan;
				}

				// rowspan map
				for (let r = 0; r < rowspan; r++) {
					for (let c = 0; c < colspan; c++) {
						if (!colIndexMap[row + r]) colIndexMap[row + r] = [];
						colIndexMap[row + r][logicalCol + c] = true;
					}
				}

				logicalCol += colspan;
			}
		}

		let logicalColCount = 0;
		for (let i = 0, cells = copyRows[0].cells, len = cells.length; i < len; i++) {
			const cell = cells[i];
			logicalColCount += cell.colSpan || 1;
		}

		const copyInfo = {
			rowCnt: rowCnt,
			logicalCellCnt: logicalColCount
		};

		// --- target info ---
		this._deleteStyleSelectedCells();
		const originTable = targetTD.closest('table');
		const { cloneTable, clonedSelectedCells } = this.#cloneTable(originTable, [targetTD]);

		const targetTable = cloneTable;
		targetTD = clonedSelectedCells[0];
		let targetRows = targetTable.rows;
		this.setTableInfo(targetTable);
		this.setCellInfo(targetTD, true);

		const targetInfo = {
			physicalCellCnt: this.#physical_cellCnt,
			logicalCellCnt: this.#logical_cellCnt,
			rowCnt: this.#rowCnt,
			rowInex: this.#rowIndex,
			physicalCellIndex: this.#physical_cellIndex,
			logicalCellIndex: this.#logical_cellIndex,
			currentColSpan: this.#current_colSpan,
			currentRowSpan: this.#current_rowSpan
		};

		// --- [expand] target table ---
		const addRowCnt = copyInfo.rowCnt - (targetInfo.rowCnt - (targetInfo.rowInex + 1)) - 1;
		const addColCnt = copyInfo.logicalCellCnt - (targetInfo.logicalCellCnt - (targetInfo.logicalCellIndex + 1)) - 1;
		targetInfo.rowCnt += addRowCnt;
		targetInfo.logicalCellCnt += addColCnt;
		targetInfo.physicalCellCnt += addColCnt;

		if (addRowCnt > 0 || addColCnt > 0) {
			const lastRow = targetRows[targetRows.length - 1];
			const lastCell = lastRow.cells[lastRow.cells.length - 1];
			for (let i = 0; i < addRowCnt; i++) {
				this.editRow('down', lastCell);
			}
			for (let i = 0; i < addColCnt; i++) {
				this.editCell('right', lastCell);
			}
			targetRows = this.#trElements = targetTable.rows;
		}

		// --- [Un_merge] cells ---
		const startRowIndex = targetInfo.rowInex;
		const cellIndex = targetInfo.logicalCellIndex;
		const cellEndIndex = cellIndex + copyInfo.logicalCellCnt - 1;
		const unmergeCells = [];
		const un_mergeRowSpanMap = [];

		for (let r = 0, len = startRowIndex + copyInfo.rowCnt; r < len; r++) {
			const cells = targetRows[r]?.cells;
			if (!cells) continue;

			let logicalIndex = 0;
			let cellIndexInRow = 0;

			for (let c = 0; c < cells.length; c++) {
				while (un_mergeRowSpanMap[r]?.[logicalIndex]) {
					logicalIndex++;
				}

				const cell = cells[cellIndexInRow++];
				if (!cell) break;

				const cs = cell.colSpan || 1;
				const rs = cell.rowSpan || 1;
				const logicalStart = logicalIndex;
				const logicalEnd = logicalIndex + cs - 1;

				// rowSpan map
				if (rs > 1 || cs > 1) {
					for (let rsOffset = 1; rsOffset < rs; rsOffset++) {
						const rowIndex = r + rsOffset;
						un_mergeRowSpanMap[rowIndex] ||= [];
						for (let csOffset = 0; csOffset < cs; csOffset++) {
							un_mergeRowSpanMap[rowIndex][logicalIndex + csOffset] = true;
						}
					}
				}

				const isOverlap = logicalStart <= cellEndIndex && logicalEnd >= cellIndex;
				if (isOverlap && (cs > 1 || rs > 1)) {
					unmergeCells.push(cell);
				}

				logicalIndex += cs;
			}
		}

		if (unmergeCells.length > 0) {
			this.unmergeCells(unmergeCells, true);
			targetRows = this.#trElements = targetTable.rows;
		}

		// --- [merge] cells ---
		const mergeGroups = [];
		const copyCowSpanMap = [];
		const targetRowSpanMap = [];
		for (let r = 0, len = copyInfo.rowCnt; r < len; r++) {
			const cells = copyRows[r]?.cells;
			if (!cells) break;

			let copyIndex = 0;
			for (let c = 0; c < cells.length; c++) {
				const cell = cells[c];
				const cs = cell.colSpan || 1;
				const rs = cell.rowSpan || 1;

				while (copyCowSpanMap[r]?.[copyIndex]) {
					copyIndex++;
				}

				for (let rsOffset = 1; rsOffset < rs; rsOffset++) {
					const rowIndex = r + rsOffset;
					copyCowSpanMap[rowIndex] ||= [];
					for (let csOffset = 0; csOffset < cs; csOffset++) {
						copyCowSpanMap[rowIndex][copyIndex + csOffset] = true;
					}
				}

				if (cs <= 1 && rs <= 1) {
					copyIndex += cs;
					continue;
				}

				const cStart = copyIndex + targetInfo.logicalCellIndex;
				const cEnd = cStart + cs - 1;
				const mergeCells = [];

				for (let targetR = targetInfo.rowInex + r, tRowCnt = targetR + rs, rowOffset = 0; targetR < tRowCnt; targetR++, rowOffset++) {
					const targetRow = targetRows[targetR];
					const targetCells = targetRow.cells;

					let logicalIndex = 0;
					let targetIndex = 0;

					while (targetIndex < targetCells.length && logicalIndex <= cEnd) {
						while (targetRowSpanMap[targetR]?.[logicalIndex]) {
							logicalIndex++;
						}

						const tCell = targetCells[targetIndex++];
						const tcs = tCell.colSpan || 1;
						const trs = tCell.rowSpan || 1;
						const logicalStart = logicalIndex;
						const logicalEnd = logicalIndex + tcs - 1;

						// rowSpan map
						if (trs > 1) {
							for (let rsOffset = 1; rsOffset < trs; rsOffset++) {
								const rIndex = targetR + rsOffset;
								targetRowSpanMap[rIndex] ||= [];
								for (let i = 0; i < tcs; i++) {
									targetRowSpanMap[rIndex][logicalIndex + i] = true;
								}
							}
						}

						if (logicalEnd >= cStart && logicalStart <= cEnd) {
							mergeCells.push(tCell);
						}

						logicalIndex += tcs;
					}
				}

				if (mergeCells.length > 0) {
					mergeGroups.push(mergeCells);
				}

				copyIndex += cs;
			}
		}

		if (mergeGroups.length > 0) {
			for (const mc of mergeGroups) {
				this.#ref = null;
				this.#trElements = targetTable.rows;
				this.mergeCells(mc, true);
			}
			targetRows = this.#trElements = targetTable.rows;
		}

		// --- [result] paste cell data ---
		const selectedCells = [];
		const rowSpanMap = [];
		for (let r = 0; r < copyInfo.rowCnt; r++) {
			const tr = targetRows[targetInfo.rowInex + r];
			const cr = copyRows[r];
			if (!tr || !cr) break;

			const tCells = tr.cells;
			const cCells = cr.cells;

			let tLogicalIndex = 0;
			let tIndex = 0;
			let cIndex = 0;

			while (tIndex < tCells.length && cIndex < cCells.length && tLogicalIndex <= cellEndIndex) {
				while (rowSpanMap[r]?.[tLogicalIndex]) {
					tLogicalIndex++;
				}

				const tCell = tCells[tIndex++];
				const cCell = cCells[cIndex];
				if (!tCell || !cCell) break;

				const tcs = tCell.colSpan || 1;
				const trs = tCell.rowSpan || 1;

				// rowSpan map
				if (trs > 1) {
					for (let rs = 1; rs < trs; rs++) {
						const rr = r + rs;
						rowSpanMap[rr] ||= [];
						for (let cs = 0; cs < tcs; cs++) {
							rowSpanMap[rr][tLogicalIndex + cs] = true;
						}
					}
				}

				if (tLogicalIndex >= cellIndex && tLogicalIndex + tcs - 1 <= cellEndIndex) {
					tCell.innerHTML = cCell.innerHTML;
					selectedCells.push(tCell);
					cIndex++;
				}

				tLogicalIndex += tcs;
			}
		}

		// replace table
		originTable.replaceWith(targetTable);
		this._closeTableSelectInfo();
		this.setTableInfo(targetTable);

		// select cell
		this.selectCells(selectedCells);
		this.#setMergeSplitButton();
		this.#setUnMergeButton();
		this.#focusEdge(selectedCells[0]);

		// history push
		this._historyPush();
	}

	/**
	 * @description Inserts a new row into the table at the specified index to it.
	 * @param {HTMLTableElement} table The table element to insert the row into.
	 * @param {number} rowIndex The index at which to insert the new row.
	 * @param {number} cellCnt The number of cells to create in the new row.
	 * @returns {HTMLTableRowElement} The newly inserted row element.
	 */
	insertBodyRow(table, rowIndex, cellCnt) {
		const newRow = table.insertRow(rowIndex);
		newRow.innerHTML = CreateCellsString('td', cellCnt);
		return newRow;
	}

	/**
	 * @description Merges the selected table cells into one cell by combining their contents and adjusting their row and column spans.
	 * - This method removes the selected cells, consolidates their contents, and applies the appropriate row and column spans to the merged cell.
	 * @param {HTMLTableCellElement[]} selectedCells Cells array
	 * @param {boolean} [skipPostProcess=false] - If true, skips table cloning, cell re-selection, history stack push, and rendering.
	 */
	mergeCells(selectedCells, skipPostProcess = false) {
		const originTable = selectedCells[0].closest('table');
		const { cloneTable, clonedSelectedCells } = skipPostProcess ? { cloneTable: originTable, clonedSelectedCells: selectedCells } : this.#cloneTable(originTable, selectedCells);

		this.setTableInfo(cloneTable);
		selectedCells = clonedSelectedCells;
		this.#ref = null;
		this._setMultiCells(selectedCells[0], dom.query.findVisualLastCell(selectedCells));

		const ref = this.#ref;
		const mergeCell = selectedCells[0];

		let emptyRowFirst = null;
		let emptyRowLast = null;
		const cs = ref.ce - ref.cs + 1;
		let rs = ref.re - ref.rs + 1;
		let mergeHTML = '';
		let row = null;

		for (let i = 1, len = selectedCells.length, cell, ch; i < len; i++) {
			cell = selectedCells[i];
			if (row !== cell.parentNode) row = /** @type {HTMLTableRowElement} */ (cell.parentNode);

			ch = cell.children;
			for (let c = 0, cLen = ch.length; c < cLen; c++) {
				if (this.format.isLine(ch[c]) && dom.check.isZeroWidth(ch[c].textContent)) {
					dom.utils.removeItem(ch[c]);
				}
			}

			mergeHTML += cell.innerHTML;
			dom.utils.removeItem(cell);

			if (row.cells.length === 0) {
				if (!emptyRowFirst) emptyRowFirst = row;
				else emptyRowLast = row;
				rs -= 1;
			}
		}

		if (emptyRowFirst) {
			const rows = this.#trElements;
			const rowIndexFirst = dom.utils.getArrayIndex(rows, emptyRowFirst);
			const rowIndexLast = dom.utils.getArrayIndex(rows, emptyRowLast || emptyRowFirst);
			const removeRows = [];

			for (let i = 0, cells; i <= rowIndexLast; i++) {
				cells = rows[i].cells;
				if (cells.length === 0) {
					removeRows.push(rows[i]);
					continue;
				}

				for (let c = 0, cLen = cells.length, cell, rs2; c < cLen; c++) {
					cell = cells[c];
					rs2 = cell.rowSpan - 1;
					if (rs2 > 0 && i + rs2 >= rowIndexFirst) {
						cell.rowSpan -= numbers.getOverlapRangeAtIndex(rowIndexFirst, rowIndexLast, i, i + rs2);
					}
				}
			}

			for (let i = 0, len = removeRows.length; i < len; i++) {
				dom.utils.removeItem(removeRows[i]);
			}
		}

		mergeCell.innerHTML += mergeHTML;
		mergeCell.colSpan = cs;
		mergeCell.rowSpan = rs;

		if (skipPostProcess) return;

		// replace table
		originTable.replaceWith(cloneTable);
		this._closeTableSelectInfo();

		this.#setMergeSplitButton();
		this._setController(mergeCell);

		this.#focusEdge(mergeCell);

		// history push
		this._historyPush();
	}

	/**
	 * @description Unmerges a table cell that has been merged using rowspan and/or colspan.
	 * @param {HTMLTableCellElement[]} selectedCells - Cells array
	 * @param {boolean} [skipPostProcess=false] - If true, skips table cloning, cell re-selection, history stack push, and rendering.
	 */
	unmergeCells(selectedCells, skipPostProcess = false) {
		if (!selectedCells?.length) return;

		const originTable = selectedCells[0].closest('table');
		const { cloneTable, clonedSelectedCells } = skipPostProcess ? { cloneTable: originTable, clonedSelectedCells: selectedCells } : this.#cloneTable(originTable, selectedCells);

		this.#ref = null;
		this.setTableInfo(cloneTable);
		selectedCells = clonedSelectedCells;

		let firstCell = selectedCells[0];
		let lastCell = dom.query.findVisualLastCell(selectedCells);
		let newLastCell = null;

		const table = firstCell.closest('table');
		const rows = table.rows;

		for (const cell of selectedCells) {
			const tr = /** @type {HTMLTableRowElement} */ (cell.parentElement);
			const rowIndex = tr.rowIndex;
			const colIndex = cell.cellIndex;
			const rowspan = cell.rowSpan;
			const colspan = cell.colSpan;

			if (rowspan === 1 && colspan === 1) continue;

			this.setCellInfo(cell, true);

			const originalHTML = cell.innerHTML;
			cell.remove();

			for (let r = 0; r < rowspan; r++) {
				const targetRow = rows[rowIndex + r];

				for (let c = 0; c < colspan; c++) {
					const newCell = CreateCellsHTML('td');

					if (r === 0 && c === 0) {
						if (firstCell === cell) firstCell = newCell;
						if (lastCell === cell) lastCell = newCell;
						newCell.innerHTML = originalHTML;
						targetRow.insertBefore(newCell, targetRow.cells[colIndex]);
					} else {
						targetRow.insertBefore(newCell, targetRow.cells[colIndex + c]);
						newLastCell = newCell;
					}
				}
			}
		}

		this.#selectedCells = null;

		if (skipPostProcess) return;

		// replace table
		originTable.replaceWith(cloneTable);
		this._closeTableSelectInfo();
		this.setTableInfo(cloneTable);

		// set info
		if (firstCell !== lastCell) {
			lastCell = !newLastCell || lastCell.closest('tr').rowIndex > newLastCell.closest('tr').rowIndex || lastCell.cellIndex > newLastCell.cellIndex ? lastCell : newLastCell;
			this._setMultiCells(firstCell, lastCell);
			this.#selectedCells = Array.from(table.querySelectorAll('.se-selected-table-cell'));
		} else {
			this.setCellInfo(lastCell, true);
		}

		this.#fixedCell = firstCell;
		this.#selectedCell = lastCell;
		dom.utils.addClass(lastCell, 'se-selected-cell-focus');

		this.#setUnMergeButton();
		this.controller_cell.resetPosition(lastCell);

		// history push
		this._historyPush();
	}

	/**
	 * @description Find merged cells
	 * @param {HTMLTableCellElement[]} cells - Cells array
	 */
	findMergedCells(cells) {
		const mergedCells = [];
		cells?.forEach((cell) => {
			if (cell && (cell.rowSpan > 1 || cell.colSpan > 1)) {
				mergedCells.push(cell);
			}
		});
		return mergedCells;
	}

	/**
	 * @description Toggles the visibility of the table header (`<thead>`). If the header is present, it is removed; if absent, it is added.
	 */
	toggleHeader() {
		const btn = this.headerButton;
		const active = dom.utils.hasClass(btn, 'active');
		const table = this.#element;

		if (!active) {
			const header = dom.utils.createElement('THEAD');
			header.innerHTML = '<tr>' + CreateCellsString('th', this.#logical_cellCnt) + '</tr>';
			table.insertBefore(header, table.firstElementChild);
		} else {
			dom.utils.removeItem(table.querySelector('thead'));
		}

		dom.utils.toggleClass(btn, 'active');

		if (/TH/i.test(this.#tdElement.nodeName)) {
			this._closeController();
		} else {
			this._setCellControllerPosition(this.#tdElement, false);
		}
	}

	/**
	 * @description Toggles the visibility of the table caption (`<caption>`). If the caption is present, it is removed; if absent, it is added.
	 */
	toggleCaption() {
		const btn = this.captionButton;
		const active = dom.utils.hasClass(btn, 'active');
		const table = this.#element;

		if (!active) {
			const caption = dom.utils.createElement('CAPTION', { class: `se-table-caption-${this.captionPosition}` });
			caption.innerHTML = '<div><br></div>';
			table.insertBefore(caption, table.firstElementChild);
		} else {
			dom.utils.removeItem(table.querySelector('caption'));
		}

		dom.utils.toggleClass(btn, 'active');
		this._setCellControllerPosition(this.#tdElement, false);
	}

	/**
	 * @description Updates table styles.
	 * @param {string} styles - Styles to update.
	 * @param {boolean} ondisplay - Whether to update display.
	 */
	#setTableStyle(styles, ondisplay) {
		if (styles.includes('width')) {
			const targets = this.#figure;
			if (!targets) return;

			let sizeIcon, text;
			if (!this.#maxWidth) {
				sizeIcon = this.icons.expansion;
				text = this.maxText;
				if (!ondisplay) targets.style.width = 'max-content';
			} else {
				sizeIcon = this.icons.reduction;
				text = this.minText;
				if (!ondisplay) targets.style.width = '100%';
			}

			dom.utils.changeElement(this.resizeButton.firstElementChild, sizeIcon);
			dom.utils.changeTxt(this.resizeText, text);
		}

		if (styles.includes('column')) {
			if (!this.#fixedColumn) {
				dom.utils.removeClass(this.#element, 'se-table-layout-fixed');
				dom.utils.addClass(this.#element, 'se-table-layout-auto');
				dom.utils.removeClass(this.columnFixedButton, 'active');
			} else {
				dom.utils.removeClass(this.#element, 'se-table-layout-auto');
				dom.utils.addClass(this.#element, 'se-table-layout-fixed');
				dom.utils.addClass(this.columnFixedButton, 'active');
			}
		}
	}

	/**
	 * @description Sets the merge/split button visibility.
	 */
	#setMergeSplitButton() {
		if (!this.#ref) {
			this.splitButton.style.display = 'block';
			this.mergeButton.style.display = 'none';
		} else {
			this.splitButton.style.display = 'none';
			this.mergeButton.style.display = 'block';
		}
	}

	/**
	 * @description Sets the unmerge button visibility.
	 */
	#setUnMergeButton() {
		if (this.findMergedCells(!this.#selectedCells?.length ? [this.#fixedCell] : this.#selectedCells).length > 0) {
			this.unmergeButton.disabled = false;
		} else {
			this.unmergeButton.disabled = true;
		}
	}

	/**
	 * @private
	 * @description Sets the controller position for a cell.
	 * @param {HTMLTableCellElement} tdElement - The target table cell.
	 */
	_setController(tdElement) {
		if (!this.selection.get().isCollapsed && !this.#selectedCell) {
			this._deleteStyleSelectedCells();
			return;
		}

		this.#setUnMergeButton();

		this.#tdElement = tdElement;
		if (this.#fixedCell === tdElement) dom.utils.addClass(tdElement, 'se-selected-cell-focus');
		if (!this.#selectedCells?.length) this.#selectedCells = [tdElement];
		const tableElement = this.#selectedTable || this.#element || dom.query.getParentElement(tdElement, 'TABLE');
		this.component.select(tableElement, Table.key, { isInput: true });
	}

	/**
	 * @private
	 * @description Sets the position of the cell controller.
	 * @param {HTMLTableCellElement} tdElement - The target table cell.
	 * @param {boolean} reset - Whether to reset the controller position.
	 */
	_setCellControllerPosition(tdElement, reset) {
		this.setCellInfo(tdElement, reset);
		if (!this.cellControllerTop) this.controller_cell.resetPosition(tdElement);
	}

	/**
	 * @private
	 * @description Adds a new entry to the history stack.
	 */
	_historyPush() {
		this._deleteStyleSelectedCells();
		this.history.push(false);
		this._recallStyleSelectedCells();
	}

	/**
	 * @private
	 * @description Opens the figure.
	 * @param {Node} target - The target figure element.
	 */
	_figureOpen(target) {
		this.figure.open(target, { nonResizing: true, nonSizeInfo: true, nonBorder: true, figureTarget: true, infoOnly: false });
	}

	/**
	 * @private
	 * @description Converts the width of <col> elements to percentages.
	 * @param {HTMLTableElement} target - The target table element.
	 */
	_resizePercentCol(target) {
		const cols = target.querySelector('colgroup').querySelectorAll('col');
		const tableTotalWidth = target.offsetWidth;

		cols.forEach((col) => {
			const colWidthString = col.style.width;

			if (!colWidthString.endsWith('%')) {
				const pixelWidth = col.offsetWidth || numbers.get(colWidthString, CELL_DECIMAL_END);
				const percentage = (pixelWidth / tableTotalWidth) * 100;
				col.style.width = percentage + '%';
			}
		});
	}

	/**
	 * @private
	 * @description Starts resizing a table cell.
	 * @param {HTMLElement} col The column element.
	 * @param {number} startX The starting X position.
	 * @param {number} startWidth The initial width of the column.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	_startCellResizing(col, startX, startWidth, isLeftEdge) {
		this._resizePercentCol(this.#element);
		this._setResizeLinePosition(this.#figure, this.#tdElement, this.#resizeLinePrev, isLeftEdge);
		this.#resizeLinePrev.style.display = 'block';
		const prevValue = col.style.width;
		const nextCol = /** @type {HTMLElement} */ (col.nextElementSibling);
		const nextColPrevValue = nextCol.style.width;
		const realWidth = dom.utils.hasClass(this.#element, 'se-table-layout-fixed') ? nextColPrevValue : converter.getWidthInPercentage(nextCol || col);

		if (_DragHandle.get('__dragHandler')) _DragHandle.get('__dragHandler').style.display = 'none';
		this._addResizeGlobalEvents(
			this._cellResize.bind(
				this,
				col,
				nextCol,
				this.#figure,
				this.#tdElement,
				this.#resizeLine,
				isLeftEdge,
				startX,
				startWidth,
				numbers.get(prevValue, CELL_DECIMAL_END),
				numbers.get(realWidth, CELL_DECIMAL_END),
				this.#element.offsetWidth
			),
			() => {
				this.__removeGlobalEvents();
				this._resizePercentCol(this.#element);
				this.history.push(true);
				this.component.select(this.#element, Table.key, { isInput: true });
			},
			(e) => {
				this._stopResize(col, prevValue, 'width', e);
				this._stopResize(nextCol, nextColPrevValue, 'width', e);
			}
		);
	}

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
	_cellResize(col, nextCol, figure, tdEl, resizeLine, isLeftEdge, startX, startWidth, prevWidthPercent, nextColWidthPercent, tableWidth, e) {
		const deltaX = e.clientX - startX;
		const newWidthPx = startWidth + deltaX;
		const newWidthPercent = (newWidthPx / tableWidth) * 100;

		if (newWidthPercent > 0) {
			col.style.width = `${newWidthPercent}%`;
			const delta = prevWidthPercent - newWidthPercent;
			nextCol.style.width = `${nextColWidthPercent + delta}%`;
			this._setResizeLinePosition(figure, tdEl, resizeLine, isLeftEdge);
		}
	}

	/**
	 * @private
	 * @description Starts resizing a table row.
	 * @param {HTMLElement} row The table row element.
	 * @param {number} startY The starting Y position.
	 * @param {number} startHeight The initial height of the row.
	 */
	_startRowResizing(row, startY, startHeight) {
		this._setResizeRowPosition(this.#figure, row, this.#resizeLinePrev);
		this.#resizeLinePrev.style.display = 'block';
		const prevValue = row.style.height;

		this._addResizeGlobalEvents(
			this._rowResize.bind(this, row, this.#figure, this.#resizeLine, startY, startHeight),
			() => {
				this.__removeGlobalEvents();
				this.history.push(true);
			},
			this._stopResize.bind(this, row, prevValue, 'height')
		);
	}

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
	_rowResize(row, figure, resizeLine, startY, startHeight, e) {
		const deltaY = e.clientY - startY;
		const newHeightPx = startHeight + deltaY;
		row.style.height = `${newHeightPx}px`;
		this._setResizeRowPosition(figure, row, resizeLine);
	}

	/**
	 * @private
	 * @description Starts resizing the table figure.
	 * @param {number} startX The starting X position.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	_startFigureResizing(startX, isLeftEdge) {
		const figure = this.#figure;
		this._setResizeLinePosition(figure, figure, this.#resizeLinePrev, isLeftEdge);
		this.#resizeLinePrev.style.display = 'block';
		const realWidth = converter.getWidthInPercentage(figure);

		if (_DragHandle.get('__dragHandler')) _DragHandle.get('__dragHandler').style.display = 'none';
		this._addResizeGlobalEvents(
			this._figureResize.bind(this, figure, this.#resizeLine, isLeftEdge, startX, figure.offsetWidth, numbers.get(realWidth, CELL_DECIMAL_END)),
			() => {
				this.__removeGlobalEvents();
				if (numbers.get(figure.style.width, 0) > 100) figure.style.width = '100%';
				// figure reopen
				this.component.select(this.#element, Table.key, { isInput: true });
			},
			this._stopResize.bind(this, figure, figure.style.width, 'width')
		);
	}

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
	_figureResize(figure, resizeLine, isLeftEdge, startX, startWidth, constNum, e) {
		const deltaX = isLeftEdge ? startX - e.clientX : e.clientX - startX;
		const newWidthPx = startWidth + deltaX;
		const newWidthPercent = (newWidthPx / startWidth) * constNum;

		if (newWidthPercent > 0) {
			figure.style.width = `${newWidthPercent}%`;
			this._setResizeLinePosition(figure, figure, resizeLine, isLeftEdge);
		}
	}

	/**
	 * @private
	 * @description Sets the resize line position.
	 * @param {HTMLElement} figure The table figure element.
	 * @param {HTMLElement} target The target element.
	 * @param {HTMLElement} resizeLine The resize line element.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	_setResizeLinePosition(figure, target, resizeLine, isLeftEdge) {
		const tdOffset = this.offset.getLocal(target);
		const tableOffset = this.offset.getLocal(figure);
		resizeLine.style.left = `${tdOffset.left + (isLeftEdge ? 0 : target.offsetWidth)}px`;
		resizeLine.style.top = `${tableOffset.top}px`;
		resizeLine.style.height = `${figure.offsetHeight}px`;
	}

	/**
	 * @private
	 * @description Sets the resize row position.
	 * @param {HTMLElement} figure The table figure element.
	 * @param {HTMLElement} target The target row element.
	 * @param {HTMLElement} resizeLine The resize line element.
	 */
	_setResizeRowPosition(figure, target, resizeLine) {
		const rowOffset = this.offset.getLocal(target);
		const tableOffset = this.offset.getLocal(figure);
		resizeLine.style.top = `${rowOffset.top + target.offsetHeight}px`;
		resizeLine.style.left = `${tableOffset.left}px`;
		resizeLine.style.width = `${figure.offsetWidth}px`;
	}

	/**
	 * @private
	 * @description Stops resizing the table.
	 * @param {HTMLElement} target The target element.
	 * @param {string} prevValue The previous style value.
	 * @param {string} styleProp The CSS property being changed.
	 * @param {KeyboardEvent} e The keyboard event.
	 */
	_stopResize(target, prevValue, styleProp, e) {
		if (!keyCodeMap.isEsc(e.code)) return;
		this.__removeGlobalEvents();
		target.style[styleProp] = prevValue;
		// figure reopen
		if (styleProp === 'width') {
			this.component.select(this.#element, Table.key, { isInput: true });
		}
	}

	/**
	 * @private
	 * @description Deletes styles from selected table cells.
	 */
	_deleteStyleSelectedCells() {
		dom.utils.removeClass([this.#fixedCell, this.#selectedCell], 'se-selected-cell-focus');
		const table = this.#fixedCell?.closest('table');
		if (table) {
			const selectedCells = table.querySelectorAll('.se-selected-table-cell');
			for (let i = 0, len = selectedCells.length; i < len; i++) {
				dom.utils.removeClass(selectedCells[i], 'se-selected-table-cell');
			}
		}
	}

	/**
	 * @private
	 * @description Restores styles for selected table cells.
	 */
	_recallStyleSelectedCells() {
		if (this.#selectedCells) {
			const selectedCells = this.#selectedCells;
			for (let i = 0, len = selectedCells.length; i < len; i++) {
				dom.utils.addClass(selectedCells[i], 'se-selected-table-cell');
			}
		}
	}

	/**
	 * @private
	 * @description Adds global event listeners for resizing.
	 * @param {(...args: *) => void} resizeFn The function handling the resize event.
	 * @param {(...args: *) => void} stopFn The function handling the stop event.
	 * @param {(...args: *) => void} keyDownFn The function handling the keydown event.
	 */
	_addResizeGlobalEvents(resizeFn, stopFn, keyDownFn) {
		this.#globalEvents.resize = this.eventManager.addGlobalEvent('mousemove', resizeFn, false);
		this.#globalEvents.resizeStop = this.eventManager.addGlobalEvent('mouseup', stopFn, false);
		this.#globalEvents.resizeKeyDown = this.eventManager.addGlobalEvent('keydown', keyDownFn, false);
		this.#resizing = true;
	}

	/**
	 * @private
	 * @description Enables or disables editor mode.
	 * @param {boolean} enabled Whether to enable or disable the editor.
	 */
	_toggleEditor(enabled) {
		const wysiwyg = this.frameContext.get('wysiwyg');
		wysiwyg.setAttribute('contenteditable', enabled.toString());
		if (enabled) dom.utils.removeClass(wysiwyg, 'se-disabled');
		else dom.utils.addClass(wysiwyg, 'se-disabled');
	}

	/**
	 * @private
	 * @description Updates control properties.
	 * @param {string} type The type of control property.
	 */
	_setCtrlProps(type) {
		this._typeCache = type;
		const isTable = type === 'table';
		const targets = isTable ? [this.#element] : this.#selectedCells;
		if (!targets || targets.length === 0) return;

		const { border_format, border_color, border_style, border_width, back_color, font_color, cell_alignment, cell_alignment_vertical, cell_alignment_table_text, font_bold, font_underline, font_italic, font_strike } = this.propTargets;
		const { border, backgroundColor, color, textAlign, verticalAlign, fontWeight, textDecoration, fontStyle } = _w.getComputedStyle(targets[0]);
		const cellBorder = this._getBorderStyle(border);

		/** @type {HTMLElement} */ (cell_alignment.querySelector('[data-value="justify"]')).style.display = isTable ? 'none' : '';
		cell_alignment_table_text.style.display = isTable ? '' : 'none';
		if (isTable) cell_alignment_vertical.style.display = 'none';
		else cell_alignment_vertical.style.display = '';

		let b_color = converter.rgb2hex(cellBorder.c),
			b_style = cellBorder.s,
			b_width = cellBorder.w,
			backColor = converter.rgb2hex(backgroundColor),
			fontColor = converter.rgb2hex(color),
			bold = /.+/.test(fontWeight),
			underline = /underline/i.test(textDecoration),
			strike = /line-through/i.test(textDecoration),
			italic = /italic/i.test(fontStyle),
			align = isTable ? this.#figure?.style.float : textAlign,
			align_v = verticalAlign;
		this._propsCache = [];

		const tempColorStyles = _w.getComputedStyle(this.eventManager.__focusTemp);
		for (let i = 0, t, isBreak; (t = targets[i]); i++) {
			// eslint-disable-next-line no-shadow
			const { cssText, border, backgroundColor, color, textAlign, verticalAlign, fontWeight, textDecoration, fontStyle } = t.style;
			this._propsCache.push([t, cssText]);
			if (isBreak) continue;

			const { c, s, w } = this._getBorderStyle(border);

			// colors
			let hexBackColor = backgroundColor;
			let hexColor = color;
			if (hexBackColor) {
				this.eventManager.__focusTemp.style.backgroundColor = hexBackColor;
				hexBackColor = tempColorStyles.backgroundColor;
			}
			if (hexColor) {
				this.eventManager.__focusTemp.style.color = hexColor;
				hexColor = tempColorStyles.color;
			}

			if (b_color && cellBorder.c !== c) b_color = '';
			if (b_style && cellBorder.s !== s) b_style = '';
			if (b_width && cellBorder.w !== w) b_width = '';
			if (backColor !== converter.rgb2hex(hexBackColor)) backColor = '';
			if (fontColor !== converter.rgb2hex(hexColor)) fontColor = '';
			if (align !== (isTable ? this.#figure?.style.float : textAlign)) align = '';
			if (align_v && align_v !== verticalAlign) align_v = '';
			if (bold && bold !== /.+/.test(fontWeight)) bold = false;
			if (underline && underline !== /underline/i.test(textDecoration)) underline = false;
			if (strike && strike !== /line-through/i.test(textDecoration)) strike = false;
			if (italic && italic !== /italic/i.test(fontStyle)) italic = false;
			if (!b_color || !b_style || !b_width || !backColor || !fontColor) {
				isBreak = true;
			}
		}

		// border - format
		border_format.firstElementChild.innerHTML = this.icons[BORDER_FORMATS[targets.length === 1 ? 'outside' : 'all']];
		border_format.setAttribute('se-border-format', 'all');
		dom.utils.removeClass(border_format, 'active');

		// border - styles
		b_style ||= BORDER_LIST[0];
		border_style.textContent = b_style;
		border_color.style.borderColor = border_color.value = b_color;
		border_width.value = b_width;
		this._disableBorderProps(b_style === BORDER_LIST[0]);

		// back, font color
		back_color.value = back_color.style.borderColor = backColor;
		font_color.value = font_color.style.borderColor = fontColor;

		// font style
		if (bold) dom.utils.addClass(font_bold, 'on');
		if (underline) dom.utils.addClass(font_underline, 'on');
		if (strike) dom.utils.addClass(font_strike, 'on');
		if (italic) dom.utils.addClass(font_italic, 'on');

		// align
		this._setAlignProps(cell_alignment, (this._propsAlignCache = align), true);
		this._setAlignProps(cell_alignment_vertical, (this._propsVerticalAlignCache = align_v), true);
	}

	/**
	 * @private
	 * @description Sets text alignment properties.
	 * @param {Element} el The element to apply alignment to.
	 * @param {string} align The alignment value.
	 * @param {boolean} reset Whether to reset the alignment.
	 */
	_setAlignProps(el, align, reset) {
		dom.utils.removeClass(el.querySelectorAll('button'), 'on');

		if (!reset && el.getAttribute('se-cell-align') === align) {
			el.setAttribute('se-cell-align', '');
			return;
		}

		dom.utils.addClass(el.querySelector(`[data-value="${align}"]`), 'on');
		el.setAttribute('se-cell-align', align);
	}

	/**
	 * @private
	 * @description Disables or enables border properties.
	 * @param {boolean} disabled Whether to disable or enable border properties.
	 */
	_disableBorderProps(disabled) {
		const { border_color, border_width, palette_border_button } = this.propTargets;
		if (disabled) {
			border_color.disabled = true;
			border_width.disabled = true;
			palette_border_button.disabled = true;
			border_width.disabled = true;
		} else {
			border_color.disabled = false;
			border_width.disabled = false;
			palette_border_button.disabled = false;
			border_width.disabled = false;
		}
	}

	/**
	 * @private
	 * @description Gets the border style.
	 * @param {string} borderStyle The border style string.
	 * @returns {{w: string, s: string, c: string}} The parsed border style object.
	 * - w: The border width.
	 * - s: The border style.
	 * - c: The border color.
	 */
	_getBorderStyle(borderStyle) {
		const parts = borderStyle.split(/\s(?![^()]*\))/);
		let w = '',
			s = '',
			c = '';

		if (parts.length === 3) {
			w = parts[0];
			s = parts[1];
			c = parts[2];
		} else if (parts.length === 2) {
			if (/\d/.test(parts[0])) {
				w = parts[0];
				s = parts[1];
			} else {
				s = parts[0];
				c = parts[1];
			}
		} else if (parts.length === 1) {
			if (/\d/.test(parts[0])) {
				w = parts[0];
			} else {
				s = parts[0];
			}
		}

		return { w, s, c: converter.rgb2hex(c) };
	}

	/**
	 * @private
	 * @description Applies properties to table cells.
	 * @param {HTMLButtonElement} target The target element.
	 */
	_submitProps(target) {
		try {
			target.disabled = true;

			const isTable = this.controller_table.form.contains(this.controller_props.currentTarget);
			const targets = isTable ? [this.#element] : this.#selectedCells;
			const tr = /** @type {HTMLTableCellElement} */ (targets[0]);
			const trStyles = _w.getComputedStyle(tr);
			const { border_format, border_color, border_style, border_width, back_color, font_color, cell_alignment, cell_alignment_vertical } = this.propTargets;

			const borderFormat = border_format.getAttribute('se-border-format') || '';
			const hasFormat = borderFormat !== 'all';
			const borderStyle = (border_style.textContent === 'none' ? '' : border_style.textContent) || '';
			const isNoneFormat = borderFormat === 'none' || !borderStyle;

			const cellAlignment = cell_alignment.getAttribute('se-cell-align') || '';
			const cellAlignmentVertical = cell_alignment_vertical.getAttribute('se-cell-align') || '';
			const borderColor = isNoneFormat ? '' : border_color.value.trim() || trStyles.borderColor;
			let borderWidth = isNoneFormat ? '' : border_width.value.trim() || trStyles.borderWidth;
			borderWidth = borderWidth + (numbers.is(borderWidth) ? DEFAULT_BORDER_UNIT : '');
			const backColor = back_color.value.trim();
			const fontColor = font_color.value.trim();
			const hasBorder = hasFormat && !isNoneFormat && borderWidth;
			const borderCss = `${borderWidth} ${borderStyle} ${borderColor}`;
			const cells = {
				left: [],
				top: [],
				right: [],
				bottom: [],
				middle: [],
				all: null
			};

			if (!isTable) {
				const trRow = /** @type {HTMLTableRowElement} */ (tr.parentElement);
				// --- target cells roof
				let { rs, re, cs, ce } = this.#ref || {
					rs: trRow.rowIndex || 0,
					re: trRow.rowIndex || 0,
					cs: tr.cellIndex || 0,
					ce: tr.cellIndex || 0
				};
				const mergeInfo = new Array(re - rs + 1).fill(0).map(() => new Array(ce - cs + 1).fill(0));
				const cellStartIndex = cs;
				re -= rs;
				rs -= rs;
				ce -= cs;
				cs -= cs;
				let prevRow = /** @type {HTMLElement} */ (trRow);
				for (let i = 0, cellCnt = 0, len = targets.length, e, es, rowIndex = 0, cellIndex, colspan, rowspan; i < len; i++, cellCnt++) {
					e = /** @type {HTMLTableCellElement} */ (targets[i]);
					colspan = e.colSpan;
					rowspan = e.rowSpan;
					cellIndex = e.cellIndex - cellStartIndex;

					if (prevRow !== e.parentElement) {
						rowIndex++;
						cellCnt = 0;
						prevRow = e.parentElement;
					}

					let c = 0;
					while (c <= cellIndex) {
						cellIndex += mergeInfo[rowIndex][c] || 0;
						c++;
					}

					/* eslint-disable @typescript-eslint/no-unused-vars */
					try {
						if (rowspan > 1) {
							const rowspanNum = rowspan - 1;
							for (let r = rowIndex; r <= rowIndex + rowspanNum; r++) {
								mergeInfo[r][cellIndex] += colspan - (rowIndex === r ? 1 : 0);
							}
						} else if (colspan > 1) {
							mergeInfo[rowIndex][cellIndex] += colspan - 1;
						}
					} catch (err) {
						// ignore error
					}
					/* eslint-disable @typescript-eslint/no-unused-vars */

					const isBottom = rowIndex + rowspan - 1 === re;
					if (rowIndex === rs) cells.top.push(e);
					if (rowIndex === re || isBottom) cells.bottom.push(e);
					if (cellIndex === cs) cells.left.push(e);
					if (cellIndex === ce || cellIndex + colspan - 1 === ce) cells.right.push(e);
					if (!isBottom && rowIndex !== rs && rowIndex !== re && cellIndex !== cs && cellIndex !== ce) cells.middle.push(e);

					// --- set styles
					es = e.style;
					// alignment
					es.textAlign = cellAlignment;
					es.verticalAlign = cellAlignmentVertical;
					// back
					es.backgroundColor = backColor;
					// font
					es.color = fontColor;
					// font style
					this._setFontStyle(es);
					// border
					if (hasBorder) continue;
					// border - all || none
					if (isNoneFormat) {
						es.border = es.borderLeft = es.borderTop = es.borderRight = es.borderBottom = '';
					} else {
						es.border = borderCss;
					}
				}

				if (cells.middle.length === 0) {
					cells.middle = targets;
				}
			} else {
				// -- table styles
				const es = tr.style;
				// alignment
				if (this.#figure) {
					this.#figure.style.float = cellAlignment;
					this.#figure.style.verticalAlign = cellAlignmentVertical;
				}
				// back
				es.backgroundColor = backColor;
				// font
				es.color = fontColor;
				// font style
				this._setFontStyle(es);
				// border
				if (!hasBorder) {
					// border - all || none
					if (isNoneFormat) {
						es.border = es.borderLeft = es.borderTop = es.borderRight = es.borderBottom = '';
					} else {
						es.border = borderCss;
					}
				}

				cells.left = cells.top = cells.right = cells.bottom = targets;
			}

			cells.all = targets;

			// border format
			if (hasBorder) {
				this._setBorderStyles(cells, borderFormat, borderCss);
			}

			this._historyPush();

			// set cells style
			this.controller_props.close();
			if (this.#tdElement) {
				this._recallStyleSelectedCells();
				this.setCellInfo(this.#tdElement, true);
				dom.utils.addClass(this.#tdElement, 'se-selected-cell-focus');
			}
		} catch (err) {
			console.warn('[SUNEDITOR.plugins.table.setProps.error]', err);
		} finally {
			target.disabled = false;
		}
	}

	/**
	 * @private
	 * @description Sets font styles.
	 * @param {CSSStyleDeclaration} styles The style object to modify.
	 */
	_setFontStyle(styles) {
		const { font_bold, font_italic, font_strike, font_underline } = this.propTargets;
		styles.fontWeight = dom.utils.hasClass(font_bold, 'on') ? 'bold' : '';
		styles.fontStyle = dom.utils.hasClass(font_italic, 'on') ? 'italic' : '';
		styles.textDecoration = ((dom.utils.hasClass(font_strike, 'on') ? 'line-through ' : '') + (dom.utils.hasClass(font_underline, 'on') ? 'underline' : '')).trim();
	}

	/**
	 * @private
	 * @description Sets border format and styles.
	 * @param {{left: Node[], top: Node[], right: Node[], bottom: Node[], all: Node[]}} cells The table cells categorized by border positions.
	 * @param {string} borderKey Border style ("all"|"inside"|"horizon"|"vertical"|"outside"|"left"|"top"|"right"|"bottom")
	 * @param {string} s The border style value.
	 */
	_setBorderStyles(cells, borderKey, s) {
		const { left, top, right, bottom, all } = cells;
		switch (borderKey) {
			case 'inside':
				if (all.length === 1) return;
				dom.utils.setStyle(
					all.filter((c) => !bottom.includes(c)),
					BORDER_NS.b,
					s
				);
				dom.utils.setStyle(
					all.filter((c) => !right.includes(c)),
					BORDER_NS.r,
					s
				);
				break;
			case 'horizon':
				if (all.length === 1) return;
				dom.utils.setStyle(
					all.filter((c) => !bottom.includes(c)),
					BORDER_NS.b,
					s
				);
				break;
			case 'vertical':
				if (all.length === 1) return;
				dom.utils.setStyle(
					all.filter((c) => !right.includes(c)),
					BORDER_NS.r,
					s
				);
				break;
			case 'outside':
				dom.utils.setStyle(left, BORDER_NS.l, s);
				dom.utils.setStyle(top, BORDER_NS.t, s);
				dom.utils.setStyle(right, BORDER_NS.r, s);
				dom.utils.setStyle(bottom, BORDER_NS.b, s);
				break;
			case 'left':
				dom.utils.setStyle(left, BORDER_NS.l, s);
				break;
			case 'top':
				dom.utils.setStyle(top, BORDER_NS.t, s);
				break;
			case 'right':
				dom.utils.setStyle(right, BORDER_NS.r, s);
				break;
			case 'bottom':
				dom.utils.setStyle(bottom, BORDER_NS.b, s);
				break;
		}
	}

	/**
	 * @private
	 * @description Selects multiple table cells and applies selection styles.
	 * @param {Node} startCell The first cell in the selection.
	 * @param {Node} endCell The last cell in the selection.
	 */
	_setMultiCells(startCell, endCell) {
		const rows = this.#selectedTable.rows;
		this._deleteStyleSelectedCells();

		dom.utils.addClass(startCell, 'se-selected-table-cell');

		if (startCell === endCell) {
			if (!this.#shift) return;
		}

		let findSelectedCell = true;
		let spanIndex = [];
		let rowSpanArr = [];
		const ref = (this.#ref = { _i: 0, cs: null, ce: null, rs: null, re: null });

		for (let i = 0, len = rows.length, cells, colSpan; i < len; i++) {
			cells = rows[i].cells;
			colSpan = 0;

			for (let c = 0, cLen = cells.length, cell, logcalIndex, cs, rs; c < cLen; c++) {
				cell = cells[c];
				cs = cell.colSpan - 1;
				rs = cell.rowSpan - 1;
				logcalIndex = c + colSpan;

				if (spanIndex.length > 0) {
					for (let r = 0, arr; r < spanIndex.length; r++) {
						arr = spanIndex[r];
						if (arr.row > i) continue;
						if (logcalIndex >= arr.index) {
							colSpan += arr.cs;
							logcalIndex += arr.cs;
							arr.rs -= 1;
							arr.row = i + 1;
							if (arr.rs < 1) {
								spanIndex.splice(r, 1);
								r--;
							}
						} else if (c === cLen - 1) {
							arr.rs -= 1;
							arr.row = i + 1;
							if (arr.rs < 1) {
								spanIndex.splice(r, 1);
								r--;
							}
						}
					}
				}

				if (findSelectedCell) {
					if (cell === startCell || cell === endCell) {
						ref.cs = ref.cs !== null && ref.cs < logcalIndex ? ref.cs : logcalIndex;
						ref.ce = ref.ce !== null && ref.ce > logcalIndex + cs ? ref.ce : logcalIndex + cs;
						ref.rs = ref.rs !== null && ref.rs < i ? ref.rs : i;
						ref.re = ref.re !== null && ref.re > i + rs ? ref.re : i + rs;
						ref._i += 1;
					}

					if (ref._i === 2) {
						findSelectedCell = false;
						spanIndex = [];
						rowSpanArr = [];
						i = -1;
						break;
					}
				} else if (numbers.getOverlapRangeAtIndex(ref.cs, ref.ce, logcalIndex, logcalIndex + cs) && numbers.getOverlapRangeAtIndex(ref.rs, ref.re, i, i + rs)) {
					const newCs = ref.cs < logcalIndex ? ref.cs : logcalIndex;
					const newCe = ref.ce > logcalIndex + cs ? ref.ce : logcalIndex + cs;
					const newRs = ref.rs < i ? ref.rs : i;
					const newRe = ref.re > i + rs ? ref.re : i + rs;

					if (ref.cs !== newCs || ref.ce !== newCe || ref.rs !== newRs || ref.re !== newRe) {
						ref.cs = newCs;
						ref.ce = newCe;
						ref.rs = newRs;
						ref.re = newRe;
						i = -1;

						spanIndex = [];
						rowSpanArr = [];
						break;
					}

					dom.utils.addClass(cell, 'se-selected-table-cell');
				}

				if (rs > 0) {
					rowSpanArr.push({
						index: logcalIndex,
						cs: cs + 1,
						rs: rs,
						row: -1
					});
				}

				colSpan += cell.colSpan - 1;
			}

			spanIndex = spanIndex.concat(rowSpanArr).sort((a, b) => {
				return a.index - b.index;
			});
			rowSpanArr = [];
		}
	}

	/**
	 * @private
	 * @description Resets the table picker display.
	 */
	_resetTablePicker() {
		if (!this.tableHighlight) return;

		const highlight = this.tableHighlight.style;
		const unHighlight = this.tableUnHighlight.style;

		highlight.width = '1em';
		highlight.height = '1em';
		unHighlight.width = '10em';
		unHighlight.height = '10em';

		dom.utils.changeTxt(this.tableDisplay, '1 x 1');
		this.menu.dropdownOff();
	}

	/**
	 * @private
	 * @description Resets the alignment properties for table cells.
	 */
	_resetPropsAlign() {
		const { cell_alignment } = this.propTargets;
		const left = cell_alignment.querySelector('[data-value="left"]');
		const right = cell_alignment.querySelector('[data-value="right"]');
		const l_parent = left.parentElement;
		const r_parent = right.parentElement;
		l_parent.appendChild(right);
		r_parent.appendChild(left);
	}

	/**
	 * @private
	 * @description Handles color selection from the color palette.
	 * @param {Node} button The button triggering the color palette.
	 * @param {string} type The type of color selection.
	 * @param {HTMLInputElement} color Color text input element.
	 */
	_onColorPalette(button, type, color) {
		if (this.controller_colorPicker.isOpen && type === this.sliderType) {
			this.controller_colorPicker.close();
		} else {
			this.sliderType = type;
			dom.utils.addClass(button, 'on');
			this.colorPicker.init(color?.value || '', button);
			this.controller_colorPicker.open(button, null, { isWWTarget: false, initMethod: null, addOffset: null });
		}
	}

	/**
	 * @private
	 * @description Closes table-related controllers.
	 */
	_closeController() {
		this.controller_table.close();
		this.controller_cell.close();
	}

	/**
	 * @private
	 * @description Closes table-related controllers and table figure
	 */
	_closeTableSelectInfo() {
		this.component.deselect();
		this._closeController();
	}

	/**
	 * @private
	 * @description Hides the resize line if it is visible.
	 */
	__hideResizeLine() {
		if (this.#resizeLine) {
			this.#resizeLine.style.display = 'none';
			this.#resizeLine = null;
		}
	}

	/**
	 * @private
	 * @description Removes global event listeners and resets resize-related properties.
	 */
	__removeGlobalEvents() {
		this._toggleEditor(true);
		this.#resizing = false;
		this.ui.disableBackWrapper();
		this.__hideResizeLine();
		if (this.#resizeLinePrev) {
			this.#resizeLinePrev.style.display = 'none';
			this.#resizeLinePrev = null;
		}
		const globalEvents = this.#globalEvents;
		for (const k in globalEvents) {
			globalEvents[k] &&= this.eventManager.removeGlobalEvent(globalEvents[k]);
		}
	}

	/**
	 * @description Clone a table element and map selected cells to the cloned table
	 * @param {HTMLTableElement} table <table> element
	 * @param {HTMLTableCellElement[]} selectedCells Selected cells array
	 * @returns {{ cloneTable: HTMLTableElement, clonedSelectedCells: HTMLTableCellElement[] }}
	 */
	#cloneTable(table, selectedCells) {
		/** @type {HTMLTableElement} */
		const cloneTable = dom.utils.clone(table, true);

		const originalCells = Array.from(table.querySelectorAll('td, th'));
		const clonedCells = Array.from(cloneTable.querySelectorAll('td, th'));

		const clonedSelectedCells = /** @type {HTMLTableCellElement[]} */ (
			selectedCells
				.map((cell) => {
					const index = originalCells.indexOf(cell);
					return index > -1 ? clonedCells[index] : null;
				})
				.filter((cell) => cell !== null)
		);

		return {
			cloneTable,
			clonedSelectedCells
		};
	}

	/**
	 * @description Selects cells in a table, handling single and multi-cell selection, and managing shift key behavior for extended selection.
	 * @param {HTMLTableCellElement} tdElement The target table cell (`<td>`) element that is being selected.
	 * @param {boolean} shift A flag indicating whether the shift key is held down for multi-cell selection.
	 * If `true`, the selection will extend to include adjacent cells, otherwise it selects only the provided cell.
	 */
	#StyleSelectCells(tdElement, shift) {
		this.#_s = shift;
		if (!this.#shift && !this.#ref) this.__removeGlobalEvents();

		this.#shift = shift;
		this.#fixedCell = tdElement;
		if (!this.#selectedCells?.length) this.#selectedCells = [tdElement];
		this.#fixedCellName = tdElement.nodeName;
		this.#selectedTable = dom.query.getParentElement(tdElement, 'TABLE');

		this._deleteStyleSelectedCells();
		dom.utils.addClass(tdElement, 'se-selected-cell-focus');

		if (!shift) {
			this.#globalEvents.on = this.eventManager.addGlobalEvent('mousemove', this.#bindMultiOn, false);
		} else {
			this.#globalEvents.shiftOff = this.eventManager.addGlobalEvent('keyup', this.#bindShiftOff, false);
			this.#globalEvents.on = this.eventManager.addGlobalEvent('mousedown', this.#bindMultiOn, false);
		}

		this.#globalEvents.off = this.eventManager.addGlobalEvent('mouseup', this.#bindMultiOff, false);
		this.#globalEvents.touchOff = this.eventManager.addGlobalEvent('touchmove', this.#bindTouchOff, false);
	}

	/**
	 * @description Splits a table cell either vertically or horizontally.
	 * @param {"vertical"|"horizontal"} direction The direction to split the cell.
	 */
	#OnSplitCells(direction) {
		const vertical = direction === 'vertical';
		const currentCell = this.#tdElement;
		const rows = this.#trElements;
		const currentRow = this.#trElement;
		const index = this.#logical_cellIndex;
		const rowIndex = this.#rowIndex;
		const newCell = CreateCellsHTML(currentCell.nodeName);

		// vertical
		if (vertical) {
			const currentColSpan = currentCell.colSpan;
			newCell.rowSpan = currentCell.rowSpan;

			// colspan > 1
			if (currentColSpan > 1) {
				newCell.colSpan = Math.floor(currentColSpan / 2);
				currentCell.colSpan = currentColSpan - newCell.colSpan;
				currentRow.insertBefore(newCell, currentCell.nextElementSibling);
			} else {
				// colspan - 1
				let rowSpanArr = [];
				let spanIndex = [];

				for (let i = 0, len = this.#rowCnt, cells, colSpan; i < len; i++) {
					cells = rows[i].cells;
					colSpan = 0;
					for (let c = 0, cLen = cells.length, cell, cs, rs, logcalIndex; c < cLen; c++) {
						cell = cells[c];
						cs = cell.colSpan - 1;
						rs = cell.rowSpan - 1;
						logcalIndex = c + colSpan;

						if (spanIndex.length > 0) {
							for (let r = 0, arr; r < spanIndex.length; r++) {
								arr = spanIndex[r];
								if (arr.row > i) continue;
								if (logcalIndex >= arr.index) {
									colSpan += arr.cs;
									logcalIndex += arr.cs;
									arr.rs -= 1;
									arr.row = i + 1;
									if (arr.rs < 1) {
										spanIndex.splice(r, 1);
										r--;
									}
								} else if (c === cLen - 1) {
									arr.rs -= 1;
									arr.row = i + 1;
									if (arr.rs < 1) {
										spanIndex.splice(r, 1);
										r--;
									}
								}
							}
						}

						if (logcalIndex <= index && rs > 0) {
							rowSpanArr.push({
								index: logcalIndex,
								cs: cs + 1,
								rs: rs,
								row: -1
							});
						}

						if (cell !== currentCell && logcalIndex <= index && logcalIndex + cs >= index + currentColSpan - 1) {
							cell.colSpan += 1;
							break;
						}

						if (logcalIndex > index) break;

						colSpan += cs;
					}

					spanIndex = spanIndex.concat(rowSpanArr).sort(function (a, b) {
						return a.index - b.index;
					});
					rowSpanArr = [];
				}

				currentRow.insertBefore(newCell, currentCell.nextElementSibling);
			}
		} else {
			// horizontal
			const currentRowSpan = currentCell.rowSpan;
			newCell.colSpan = currentCell.colSpan;

			// rowspan > 1
			if (currentRowSpan > 1) {
				newCell.rowSpan = Math.floor(currentRowSpan / 2);
				const newRowSpan = currentRowSpan - newCell.rowSpan;

				const rowSpanArr = [];
				const nextRowIndex = dom.utils.getArrayIndex(rows, currentRow) + newRowSpan;

				for (let i = 0, cells, colSpan; i < nextRowIndex; i++) {
					cells = rows[i].cells;
					colSpan = 0;
					for (let c = 0, cLen = cells.length, cell, cs, logcalIndex; c < cLen; c++) {
						logcalIndex = c + colSpan;
						if (logcalIndex >= index) break;

						cell = cells[c];
						cs = cell.rowSpan - 1;
						if (cs > 0 && cs + i >= nextRowIndex && logcalIndex < index) {
							rowSpanArr.push({
								index: logcalIndex,
								cs: cell.colSpan
							});
						}
						colSpan += cell.colSpan - 1;
					}
				}

				const nextRow = rows[nextRowIndex];
				const nextCells = nextRow.cells;
				let rs = rowSpanArr.shift();

				for (let c = 0, cLen = nextCells.length, colSpan = 0, cell, cs, logcalIndex, insertIndex; c < cLen; c++) {
					logcalIndex = c + colSpan;
					cell = nextCells[c];
					cs = cell.colSpan - 1;
					insertIndex = logcalIndex + cs + 1;

					if (rs && insertIndex >= rs.index) {
						colSpan += rs.cs;
						insertIndex += rs.cs;
						rs = rowSpanArr.shift();
					}

					if (insertIndex >= index || c === cLen - 1) {
						nextRow.insertBefore(newCell, cell.nextElementSibling);
						break;
					}

					colSpan += cs;
				}

				currentCell.rowSpan = newRowSpan;
			} else {
				// rowspan - 1
				newCell.rowSpan = currentCell.rowSpan;
				const newRow = dom.utils.createElement('TR');
				newRow.appendChild(newCell);

				for (let i = 0, cells; i < rowIndex; i++) {
					cells = rows[i].cells;
					if (cells.length === 0) return;

					for (let c = 0, cLen = cells.length; c < cLen; c++) {
						if (i + cells[c].rowSpan - 1 >= rowIndex) {
							cells[c].rowSpan += 1;
						}
					}
				}

				const physicalIndex = this.#physical_cellIndex;
				const cells = currentRow.cells;

				for (let c = 0, cLen = cells.length; c < cLen; c++) {
					if (c === physicalIndex) continue;
					cells[c].rowSpan += 1;
				}

				currentRow.parentNode.insertBefore(newRow, currentRow.nextElementSibling);
			}
		}

		this.selectMenu_split.close();
		this.#focusEdge(currentCell);

		this._deleteStyleSelectedCells();
		this.history.push(false);

		this._setController(currentCell);
		this.#selectedCell = this.#fixedCell = currentCell;
		if (!this.#selectedCells?.length) this.#selectedCells = [currentCell];
	}

	/**
	 * @description Handles column operations such as insert and delete.
	 * @param {"insert-left"|"insert-right"|"delete"} command The column operation to perform.
	 */
	#OnColumnEdit(command) {
		switch (command) {
			case 'insert-left':
				this.editTable('cell', 'left');
				break;
			case 'insert-right':
				this.editTable('cell', 'right');
				break;
			case 'delete':
				this.editTable('cell', null);
		}

		this._historyPush();
	}

	/**
	 * @description Handles row operations such as insert and delete.
	 * @param {"insert-above"|"insert-below"|"delete"} command The row operation to perform.
	 */
	#OnRowEdit(command) {
		switch (command) {
			case 'insert-above':
				this.editTable('row', 'up');
				break;
			case 'insert-below':
				this.editTable('row', 'down');
				break;
			case 'delete':
				this.editTable('row', null);
		}

		this._historyPush();
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

		if (this.options.get('_rtl')) {
			this.tableHighlight.style.left = x * 18 - 13 + 'px';
			x = 11 - x;
		}

		this.tableHighlight.style.width = x + 'em';
		this.tableHighlight.style.height = y + 'em';

		const x_u = x < 5 ? 5 : x > 8 ? 10 : x + 2;
		const y_u = y < 5 ? 5 : y > 8 ? 10 : y + 2;
		this.tableUnHighlight.style.width = x_u + 'em';
		this.tableUnHighlight.style.height = y_u + 'em';

		dom.utils.changeTxt(this.tableDisplay, x + ' x ' + y);
		this.#tableXY = [x, y];
	}

	/**
	 * @description Executes the selected action when the table picker is clicked.
	 */
	#OnClickTablePicker() {
		this.action();
	}

	/**
	 * @description Handles multi-selection of table cells.
	 * @param {MouseEvent} e The mouse event.
	 */
	#OnCellMultiSelect(e) {
		this.editor._preventBlur = true;
		const target = /** @type {HTMLTableCellElement} */ (dom.query.getParentElement(dom.query.getEventTarget(e), dom.check.isTableCell));

		if (this.#shift) {
			if (target === this.#fixedCell) {
				this.#shift = false;
				this._deleteStyleSelectedCells();
				this._toggleEditor(true);
				this.__removeGlobalEvents();
				return;
			} else {
				this._toggleEditor(false);
			}
		} else if (!this.#ref) {
			if (target === this.#fixedCell) return;
			else this._toggleEditor(false);
		}

		if (!target || target === this.#selectedCell || this.#fixedCellName !== target.nodeName || this.#selectedTable !== dom.query.getParentElement(target, 'TABLE')) {
			return;
		}

		this._setMultiCells(this.#fixedCell, (this.#selectedCell = target));
	}

	/**
	 * @description Stops multi-selection of table cells.
	 * @param {MouseEvent} e The mouse event.
	 */
	#OffCellMultiSelect(e) {
		e.stopPropagation();

		if (!this.#shift) {
			this._toggleEditor(true);
			this.__removeGlobalEvents();
		} else {
			this.#globalEvents.touchOff &&= this.eventManager.removeGlobalEvent(this.#globalEvents.touchOff);
		}

		if (!this.#fixedCell || !this.#selectedTable) return;

		this.#setMergeSplitButton();
		this.#selectedCells = Array.from(this.#selectedTable.querySelectorAll('.se-selected-table-cell'));

		if (this.#shift) return;

		if (this.#fixedCell && this.#selectedCell) {
			this.#focusEdge(this.#fixedCell);
			if (this.#fixedCell === this.#selectedCell) {
				dom.utils.removeClass(this.#fixedCell, 'se-selected-table-cell');
			}
		}

		const displayCell = this.#selectedCells?.length > 0 ? this.#selectedCell : this.#fixedCell;
		this._setController(displayCell);
	}

	/**
	 * @description Handles the removal of shift-based selection.
	 */
	#OffCellShift() {
		if (!this.#ref) {
			this._closeController();
		} else {
			this.__removeGlobalEvents();
			this._toggleEditor(true);

			this.#focusEdge(this.#fixedCell);

			const displayCell = this.#selectedCells?.length > 0 ? this.#selectedCell : this.#fixedCell;
			this._setController(displayCell);
		}
	}

	/**
	 * @description Handles the removal of touch-based selection.
	 */
	#OffCellTouch() {
		this.close();
	}

	/**
	 * @description Focus cell
	 * @param {HTMLElement} cell Target node
	 */
	#focusEdge(cell) {
		if (!env.isMobile) this.editor.focusEdge(cell);
	}
}

/**
 * @private
 * @description Checks if the given node is a resizable table element.
 * @param {Node} node The DOM node to check.
 * @returns {boolean} True if the node is a table-related resizable element.
 */
function IsResizeEls(node) {
	return /^(TD|TH|TR)$/i.test(node?.nodeName);
}

/**
 * @private
 * @description Checks if a table cell is at its edge based on the mouse event.
 * @param {MouseEvent} event The mouse event.
 * @param {Element} tableCell The table cell to check.
 * @returns {Object} An object containing edge detection details.
 */
function CheckCellEdge(event, tableCell) {
	const startX = event.clientX;
	const startWidth = numbers.get(_w.getComputedStyle(tableCell).width, CELL_DECIMAL_END);
	const rect = tableCell.getBoundingClientRect();
	const offsetX = Math.round(startX - rect.left);
	const isLeft = offsetX <= CELL_SELECT_MARGIN;
	const is = isLeft || startWidth - offsetX <= CELL_SELECT_MARGIN;

	return {
		is,
		isLeft,
		startX
	};
}

/**
 * @private
 * @description Checks if a row is at its edge based on the mouse event.
 * @param {MouseEvent} event The mouse event.
 * @param {Element} tableCell The table row cell to check.
 * @returns {Object} An object containing row edge detection details.
 */
function CheckRowEdge(event, tableCell) {
	const startY = event.clientY;
	const startHeight = numbers.get(_w.getComputedStyle(tableCell).height, CELL_DECIMAL_END);
	const rect = tableCell.getBoundingClientRect();
	const is = Math.ceil(startHeight + rect.top - startY) <= ROW_SELECT_MARGIN;

	return {
		is,
		startY
	};
}

/**
 * @private
 * @description Creates table cells as elements strings.
 * @param {string} nodeName The tag name of the cell (TD or TH).
 * @param {number} cnt The number of cells to create.
 * @returns {string} The created cells.
 */
function CreateCellsString(nodeName, cnt) {
	nodeName = nodeName.toLowerCase();
	return `<${nodeName}><div><br></div></${nodeName}>`.repeat(cnt);
}

/**
 * @private
 * @description Creates table cells as element HTML.
 * @param {string} nodeName The tag name of the cell (TD or TH).
 * @returns {HTMLTableCellElement} The created cells.
 */
function CreateCellsHTML(nodeName) {
	nodeName = nodeName.toLowerCase();
	return /** @type {HTMLTableCellElement} */ (dom.utils.createElement(nodeName, null, '<div><br></div>'));
}

/**
 * @private
 * @description Gets the maximum number of columns in a table.
 * @param {HTMLTableElement} table The table element.
 * @returns {number} The maximum number of columns in the table.
 */
function GetMaxColumns(table) {
	const rows = table.rows;
	let maxColumns = 0;

	for (let i = 0, len = rows.length; i < len; i++) {
		const cells = rows[i].cells;
		let columnCount = 0;

		for (let j = 0, jLen = cells.length; j < jLen; j++) {
			columnCount += cells[j].colSpan;
		}

		maxColumns = Math.max(maxColumns, columnCount);
	}

	return maxColumns;
}

/**
 * @private
 * @description Handles border style changes in table properties.
 * @param {string} command The border style command.
 */
function OnPropsBorderEdit(command) {
	this.propTargets.border_style.textContent = command;
	this._disableBorderProps(command === BORDER_LIST[0]);
	this.selectMenu_props_border.close();
}

/**
 * @private
 * @description Handles border format changes in table properties.
 * @param {string} defaultCommand The default border format command.
 * @param {string} command The new border format command.
 */
function OnPropsBorderFormatEdit(defaultCommand, command) {
	const { border_format } = this.propTargets;

	border_format.setAttribute('se-border-format', command);
	border_format.firstElementChild.innerHTML = this.icons[BORDER_FORMATS[command]];
	if (command !== defaultCommand) dom.utils.addClass(border_format, 'active');
	else dom.utils.removeClass(border_format, 'active');

	this.selectMenu_props_border_format.close();
	this.selectMenu_props_border_format_oneCell.close();
}

/**
 * @description Creates the table properties controller.
 * @param {ClipboardEvent} e - Event object
 * @param {HTMLElement} container - The container element
 * @param {NodeListOf<HTMLTableCellElement>} selectedCells - The selected table cells
 */
function SetClipboardSelectedTableCells(e, container, selectedCells) {
	e.preventDefault();
	e.stopPropagation();

	const originalTable = selectedCells[0].closest('table');
	const tempTable = originalTable.cloneNode(false);
	const tbody = dom.utils.createElement('tbody');
	tempTable.appendChild(tbody);

	const cellPositions = new Map();
	selectedCells.forEach((cell) => {
		cellPositions.set(cell, true);
	});

	const rows = originalTable.rows;
	const rowCount = rows.length;
	const colCount = Array.from(rows[0].cells).reduce((sum, cell) => sum + (cell.colSpan || 1), 0);
	const matrix = Array.from({ length: rowCount }, () => Array(colCount).fill(null));

	// build matrix
	for (let r = 0, realRow = 0; r < rowCount; r++, realRow++) {
		const cells = rows[r].cells;
		for (let c = 0, realCol = 0, cLen = cells.length; c < cLen; c++) {
			while (matrix[realRow][realCol]) realCol++;
			const cell = cells[c];
			const rowspan = cell.rowSpan || 1;
			const colspan = cell.colSpan || 1;
			for (let i = 0; i < rowspan; i++) {
				for (let j = 0; j < colspan; j++) {
					matrix[realRow + i][realCol + j] = cell;
				}
			}
			realCol += colspan;
		}
	}

	// construct new table
	for (let r = 0; r < rowCount; r++) {
		let newRow;
		for (let c = 0; c < colCount; c++) {
			const cell = matrix[r][c];
			if (!cell || !cellPositions.has(cell)) continue;

			if (!newRow) {
				newRow = dom.utils.createElement('tr');
				tbody.appendChild(newRow);
			}

			if (newRow.lastChild && matrix[r][c - 1] === cell) continue;
			if (r > 0 && matrix[r - 1][c] === cell) continue;

			const clonedCell = cell.cloneNode(true);

			// recalculate rowspan and colspan
			let rowspan = 1;
			let colspan = 1;
			while (r + rowspan < rowCount && matrix[r + rowspan][c] === cell) rowspan++;
			while (c + colspan < colCount && matrix[r][c + colspan] === cell) colspan++;

			if (rowspan > 1) clonedCell.rowSpan = rowspan;
			if (colspan > 1) clonedCell.colSpan = colspan;

			newRow.appendChild(clonedCell);
		}
	}

	const figure = dom.utils.createElement('figure');
	figure.className = container.className;
	figure.appendChild(tempTable);

	const htmlContent = `<html><body><!--StartFragment-->${figure.outerHTML}<!--EndFragment--></body></html>`;
	e.clipboardData.setData('text/html', htmlContent);
}

function _CellFormZIndex(value) {
	this.controller_cell.bringToTop(value);
}

/** --------------------- HTML Create --------------------- */
// init element
function CreateSplitMenu(lang) {
	const menus = dom.utils.createElement(
		'DIV',
		null,
		/*html*/ `
		<div title="${lang.verticalSplit}" aria-label="${lang.verticalSplit}">
			${lang.verticalSplit}
		</div>
		<div title="${lang.horizontalSplit}" aria-label="${lang.horizontalSplit}">
			${lang.horizontalSplit}
		</div>`
	);

	return { items: ['vertical', 'horizontal'], menus: menus.querySelectorAll('div') };
}

function CreateColumnMenu(lang, icons) {
	const menus = dom.utils.createElement(
		'DIV',
		null,
		/*html*/ `
		<div title="${lang.insertColumnBefore}" aria-label="${lang.insertColumnBefore}">
			<span class="se-list-icon">${icons.insert_column_left}</span><span class="se-txt">${lang.insertColumnBefore}</span>
		</div>
		<div title="${lang.insertColumnAfter}" aria-label="${lang.insertColumnAfter}">
			<span class="se-list-icon">${icons.insert_column_right}</span><span class="se-txt">${lang.insertColumnAfter}</span>
		</div>
		<div title="${lang.deleteColumn}" aria-label="${lang.deleteColumn}">
			<span class="se-list-icon">${icons.delete_column}</span><span class="se-txt">${lang.deleteColumn}</span>
		</div>`
	);

	return { items: ['insert-left', 'insert-right', 'delete'], menus: menus.querySelectorAll('div') };
}

function CreateRowMenu(lang, icons) {
	const menus = dom.utils.createElement(
		'DIV',
		null,
		/*html*/ `
		<div title="${lang.insertRowAbove}" aria-label="${lang.insertRowAbove}">
			<span class="se-list-icon">${icons.insert_row_above}</span><span class="se-txt">${lang.insertRowAbove}</span>
		</div>
		<div title="${lang.insertRowBelow}" aria-label="${lang.insertRowBelow}">
			<span class="se-list-icon">${icons.insert_row_below}</span><span class="se-txt">${lang.insertRowBelow}</span>
		</div>
		<div title="${lang.deleteRow}" aria-label="${lang.deleteRow}">
			<span class="se-list-icon">${icons.delete_row}</span><span class="se-txt">${lang.deleteRow}</span>
		</div>`
	);

	return { items: ['insert-above', 'insert-below', 'delete'], menus: menus.querySelectorAll('div') };
}

function CreateBorderMenu() {
	let html = '';

	for (let i = 0, len = BORDER_LIST.length, s; i < len; i++) {
		s = BORDER_LIST[i];
		html += /*html*/ `
		<div title="${s}" aria-label="${s}" style="padding: 0 12px;">
			<span class="se-txt">${s}</span>
		</div>`;
	}

	const menus = dom.utils.createElement('DIV', null, html);
	return { items: BORDER_LIST, menus: menus.querySelectorAll('div') };
}

function CreateBorderFormatMenu(langs, icons, indideFormats) {
	const items = [];
	let html = '';

	for (const k in BORDER_FORMATS) {
		if (indideFormats.includes(k)) continue;
		const s = BORDER_FORMATS[k];
		items.push(k);
		html += /*html*/ `
			<button type="button" class="se-btn se-tooltip">
				${icons[s]}
				<span class="se-tooltip-inner">
					<span class="se-tooltip-text">${langs[s]}</span>
				</span>
			</button>`;
	}

	const menus = dom.utils.createElement('DIV', null, html);
	return { items, menus: menus.querySelectorAll('button') };
}

function CreateHTML() {
	const html = /*html*/ `
	<div class="se-table-size">
		<div class="se-table-size-picker se-controller-table-picker"></div>
		<div class="se-table-size-highlighted"></div>
		<div class="se-table-size-unhighlighted"></div>
	</div>
	<div class="se-table-size-display">1 x 1</div>`;

	return dom.utils.createElement('DIV', { class: 'se-dropdown se-selector-table' }, html);
}

function CreateHTML_controller_table({ lang, icons }) {
	const html = /*html*/ `
	<div class="se-arrow se-arrow-down se-visible-hidden"></div>
	<div class="se-btn-group">
		<button type="button" data-command="openTableProperties" class="se-btn se-tooltip">
			${icons.table_properties}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.tableProperties}</span>
			</span>
		</button>
		<button type="button" data-command="layout" class="se-btn se-tooltip _se_table_fixed_column">
			${icons.fixed_column_width}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.fixedColumnWidth}</span>
			</span>
		</button>
		<button type="button" data-command="header" class="se-btn se-tooltip _se_table_header">
			${icons.table_header}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.tableHeader}</span>
			</span>
		</button>
		<button type="button" data-command="caption" class="se-btn se-tooltip _se_table_caption">
			${icons.caption}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.caption}</span>
			</span>
		</button>
		<button type="button" data-command="resize" class="se-btn se-tooltip _se_table_resize">
			${icons.reduction}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.minSize}</span>
			</span>
		</button>
		<button type="button" data-command="copy" class="se-btn se-tooltip">
			${icons.copy}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.copy}</span>
			</span>
		</button>
		<button type="button" data-command="remove" class="se-btn se-tooltip">
			${icons.delete}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.remove}</span>
			</span>
		</button>
	</div>`;

	return dom.utils.createElement('DIV', { class: 'se-controller se-controller-table' }, html);
}

/**
 * @param {__se__EditorCore} editor
 * @returns {{ html: HTMLElement, splitButton: HTMLButtonElement, columnButton: HTMLButtonElement, rowButton: HTMLButtonElement, mergeButton: HTMLButtonElement, unmergeButton: HTMLButtonElement }}
 */
function CreateHTML_controller_cell({ lang, icons }, cellControllerTop) {
	const html = /*html*/ `
	<div class="se-arrow se-arrow-${cellControllerTop ? 'down se-visible-hidden' : 'up'}"></div>
    <div class="se-btn-group">
		<button type="button" data-command="openCellProperties" class="se-btn se-tooltip">
			${icons.cell_properties}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.cellProperties}</span>
			</span>
		</button>
        <button type="button" data-command="oncolumn" class="se-btn se-tooltip">
            ${icons.table_column}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.column}</span>
            </span>
        </button>
        <button type="button" data-command="onrow" class="se-btn se-tooltip">
            ${icons.table_row}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.row}</span>
            </span>
        </button>
        <button type="button" data-command="merge" class="se-btn se-tooltip" style="display: none;">
            ${icons.merge_cell}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.mergeCells}</span>
            </span>
        </button>
        <button type="button" data-command="onsplit" class="se-btn se-tooltip">
            ${icons.split_cell}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.splitCells}</span>
            </span>
        </button>
		<button type="button" data-command="unmerge" class="se-btn se-tooltip">
            ${icons.unmerge_cell}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.unmergeCells}</span>
            </span>
        </button>
    </div>`;

	const content = dom.utils.createElement('DIV', { class: 'se-controller se-controller-table-cell' }, html);

	return {
		html: content,
		splitButton: content.querySelector('[data-command="onsplit"]'),
		columnButton: content.querySelector('[data-command="oncolumn"]'),
		rowButton: content.querySelector('[data-command="onrow"]'),
		mergeButton: content.querySelector('[data-command="merge"]'),
		unmergeButton: content.querySelector('[data-command="unmerge"]')
	};
}

/**
 * @typedef {Object} TableCtrlProps
 * @property {HTMLElement} html
 * @property {HTMLElement} controller_props_title
 * @property {HTMLButtonElement} borderButton
 * @property {HTMLButtonElement} borderFormatButton
 * @property {HTMLElement} cell_alignment
 * @property {HTMLElement} cell_alignment_vertical
 * @property {HTMLElement} cell_alignment_table_text
 * @property {HTMLButtonElement} border_style
 * @property {HTMLInputElement} border_color
 * @property {HTMLInputElement} border_width
 * @property {HTMLInputElement} back_color
 * @property {HTMLInputElement} font_color
 * @property {HTMLButtonElement} palette_border_button
 * @property {HTMLButtonElement} font_bold
 * @property {HTMLButtonElement} font_underline
 * @property {HTMLButtonElement} font_italic
 * @property {HTMLButtonElement} font_strike
 *
 * @param {__se__EditorCore} editor - Editor instance
 * @returns {TableCtrlProps}
 */
function CreateHTML_controller_properties({ lang, icons, options }) {
	const alignItems = options.get('_rtl') ? ['right', 'center', 'left', 'justify'] : ['left', 'center', 'right', 'justify'];
	let alignHtml = '';
	for (let i = 0, item, text; i < alignItems.length; i++) {
		item = alignItems[i];
		text = lang['align' + item.charAt(0).toUpperCase() + item.slice(1)];
		alignHtml += /*html*/ `
		<button type="button" class="se-btn se-tooltip" data-command="props_align" data-value="${item}" title="${text}" aria-label="${text}">
			${icons['align_' + item]}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${text}</span>
			</span>
		</button>`;
	}

	// vertical align html
	const verticalAligns = ['top', 'middle', 'bottom'];
	let verticalAlignHtml = '';
	for (let i = 0, item, text; i < verticalAligns.length; i++) {
		item = verticalAligns[i];
		text = lang['align' + item.charAt(0).toUpperCase() + item.slice(1)];
		verticalAlignHtml += /*html*/ `
		<button type="button" class="se-btn se-tooltip" data-command="props_align_vertical" data-value="${item}" title="${text}" aria-label="${text}">
			${icons['align_' + item]}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${text}</span>
			</span>
		</button>`;
	}

	const html = /*html*/ `
		<div class="se-controller-content">
			<div class="se-controller-header">
				<button type="button" data-command="close_props" class="se-btn se-close-btn close" title="${lang.close}" aria-label="${lang.close}">${icons.cancel}</button>
				<span class="se-controller-title">${lang.tableProperties}</span>
			</div>
			<div class="se-controller-body">

				<label>${lang.border}</label>
				<div class="se-form-group se-form-w0">
					<button type="button" data-command="props_onborder_format" class="se-btn se-tooltip">
						${icons[BORDER_FORMATS.all]}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.border}</span>
						</span>
					</button>
					<button type="button" data-command="props_onborder_style" class="se-btn se-btn-select se-tooltip se-border-style">
						<span class="se-txt"></span>
						${icons.arrow_down}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.border}</span>
						</span>
					</button>
					<input type="text" class="se-color-input __se_border_color" placeholder="${lang.color}" />
					<button type="button" data-command="props_onpalette" data-value="border" class="se-btn se-tooltip">
						${icons.color_palette}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.colorPicker}</span>
						</span>
					</button>
					<input type="text" class="se-input-control __se__border_size" placeholder="${lang.width}" />
				</div>

				<label>${lang.color}</label>
				<div class="se-form-group se-form-w0">
					<button type="button" data-command="props_onpalette" data-value="font" class="se-btn se-tooltip">
						${icons.font_color}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.fontColor}</span>
						</span>
					</button>
					<input type="text" class="se-color-input __se_font_color" placeholder="${lang.fontColor}" />
					<button type="button" data-command="props_onpalette" data-value="back" class="se-btn se-tooltip">
						${icons.background_color}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.backgroundColor}</span>
						</span>
					</button>
					<input type="text" class="se-color-input __se_back_color" placeholder="${lang.backgroundColor}" />
				</div>

				<label>${lang.font}</label>
				<div class="se-form-group se-form-w0">
					<button type="button" data-command="props_font_style" data-value="bold" class="se-btn se-tooltip">
						${icons.bold}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.bold}</span>
						</span>
					</button>
					<button type="button" data-command="props_font_style" data-value="underline" class="se-btn se-tooltip">
						${icons.underline}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.underline}</span>
						</span>
					</button>
					<button type="button" data-command="props_font_style" data-value="italic" class="se-btn se-tooltip">
						${icons.italic}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.italic}</span>
						</span>
					</button>
					<button type="button" data-command="props_font_style" data-value="strike" class="se-btn se-tooltip">
						${icons.strike}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.strike}</span>
						</span>
					</button>
				</div>

				<div class="se-table-props-align">
					<label>${lang.align} <span class="__se__a_table_t">( ${lang.table} )</span></label>
					<div class="se-form-group se-form-w0 se-list-inner">
						<div class="__se__a_h">
							${alignHtml}
						</div>
						<div class="__se__a_v">
							${verticalAlignHtml}
						</div>
					</div>
				</div>
			</div>
			<div class="se-form-group se-form-w0 se-form-flex-btn">
				<button type="button" class="se-btn se-btn-success" data-command="props_submit" title="${lang.submitButton}" aria-label="${lang.submitButton}">${icons.checked}</button>
				<button type="button" class="se-btn se-btn-danger" data-command="revert" title="${lang.revert}" aria-label="${lang.revert}">${icons.revert}</button>
			</div>
		</div>`;

	const content = dom.utils.createElement('DIV', { class: 'se-controller se-table-props' }, html);

	return {
		html: content,
		controller_props_title: content.querySelector('.se-controller-title'),
		borderButton: content.querySelector('[data-command="props_onborder_style"]'),
		borderFormatButton: content.querySelector('[data-command="props_onborder_format"]'),
		cell_alignment: content.querySelector('.se-table-props-align .__se__a_h'),
		cell_alignment_vertical: content.querySelector('.se-table-props-align .__se__a_v'),
		cell_alignment_table_text: content.querySelector('.se-table-props-align .__se__a_table_t'),
		border_style: content.querySelector('[data-command="props_onborder_style"] .se-txt'),
		border_color: content.querySelector('.__se_border_color'),
		border_width: content.querySelector('.__se__border_size'),
		back_color: content.querySelector('.__se_back_color'),
		font_color: content.querySelector('.__se_font_color'),
		palette_border_button: content.querySelector('[data-command="props_onpalette"][data-value="border"]'),
		font_bold: content.querySelector('[data-command="props_font_style"][data-value="bold"]'),
		font_underline: content.querySelector('[data-command="props_font_style"][data-value="underline"]'),
		font_italic: content.querySelector('[data-command="props_font_style"][data-value="italic"]'),
		font_strike: content.querySelector('[data-command="props_font_style"][data-value="strike"]')
	};
}

export default Table;
