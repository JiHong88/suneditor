import EditorInjector from '../../editorInjector';
import { domUtils, numbers, converter, env } from '../../helper';
import { Controller, SelectMenu, ColorPicker, Figure, _DragHandle } from '../../modules';

const { _w, ON_OVER_COMPONENT } = env;

const ROW_SELECT_MARGIN = 5;
const CELL_SELECT_MARGIN = 2;
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

const Table = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.table;
	this.icon = 'table';

	// pluginOptions options
	this.figureScrollList = ['se-scroll-figure-xy', 'se-scroll-figure-x', 'se-scroll-figure-y'];
	this.figureScroll = typeof pluginOptions.scrollType === 'string' ? pluginOptions.scrollType.toLowerCase() : 'x';
	this.captionPosition = pluginOptions.captionPosition !== 'bottom' ? 'top' : 'bottom';
	this.cellControllerTop = (pluginOptions.cellControllerPosition !== 'cell' ? 'table' : 'cell') === 'table';

	// create HTML
	const menu = CreateHTML(editor);
	const commandArea = menu.querySelector('.se-controller-table-picker');
	const controller_table = CreateHTML_controller_table(editor);
	const controller_cell = CreateHTML_controller_cell(editor, this.cellControllerTop);
	const controller_props = CreateHTML_controller_properties(editor);

	editor.applyFrameRoots((e) => {
		e.get('wrapper').appendChild(domUtils.createElement('DIV', { class: RESIZE_CELL_CLASS.replace(/^\./, '') }));
		e.get('wrapper').appendChild(domUtils.createElement('DIV', { class: RESIZE_CELL_PREV_CLASS.replace(/^\./, '') }));
		e.get('wrapper').appendChild(domUtils.createElement('DIV', { class: RESIZE_ROW_CLASS.replace(/^\./, '') }));
		e.get('wrapper').appendChild(domUtils.createElement('DIV', { class: RESIZE_ROW_PREV_CLASS.replace(/^\./, '') }));
	});

	// members - Controller
	this.controller_table = new Controller(this, controller_table, { position: 'top' });
	this.controller_cell = new Controller(this, controller_cell, { position: this.cellControllerTop ? 'top' : 'bottom' });
	// props
	const propsTargetForms = [this.controller_table.form, this.controller_cell.form];
	this.controller_props = new Controller(this, controller_props, { position: 'bottom', parents: propsTargetForms, isInsideForm: true });
	this.controller_props_title = controller_props.querySelector('.se-controller-title');
	// color picker
	const colorForm = domUtils.createElement('DIV', { class: 'se-controller se-list-layer' }, null);
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
			domUtils.removeClass(this.controller_colorPicker.currentTarget, 'on');
		}
	});

	this.figure = new Figure(this, null, {});

	this.sliderType = '';

	// members - SelectMenu - split
	const splitMenu = CreateSplitMenu(this.lang);
	this.splitButton = controller_cell.querySelector('[data-command="onsplit"]');
	this.selectMenu_split = new SelectMenu(this, { checkList: false, position: 'bottom-center' });
	this.selectMenu_split.on(this.splitButton, OnSplitCells.bind(this));
	this.selectMenu_split.create(splitMenu.items, splitMenu.menus);

	// members - SelectMenu - column
	const columnMenu = CreateColumnMenu(this.lang, this.icons);
	const columnButton = controller_cell.querySelector('[data-command="oncolumn"]');
	this.selectMenu_column = new SelectMenu(this, { checkList: false, position: 'bottom-center' });
	this.selectMenu_column.on(columnButton, OnColumnEdit.bind(this));
	this.selectMenu_column.create(columnMenu.items, columnMenu.menus);

	// members - SelectMenu - row
	const rownMenu = CreateRowMenu(this.lang, this.icons);
	const rowButton = controller_cell.querySelector('[data-command="onrow"]');
	this.selectMenu_row = new SelectMenu(this, { checkList: false, position: 'bottom-center' });
	this.selectMenu_row.on(rowButton, OnRowEdit.bind(this));
	this.selectMenu_row.create(rownMenu.items, rownMenu.menus);

	// members - SelectMenu - properties - border style
	const borderMenu = CreateBorderMenu();
	const borderButton = controller_props.querySelector('[data-command="props_onborder_style"]');
	this.selectMenu_props_border = new SelectMenu(this, { checkList: false, position: 'bottom-center' });
	this.selectMenu_props_border.on(borderButton, OnPropsBorderEdit.bind(this));
	this.selectMenu_props_border.create(borderMenu.items, borderMenu.menus);

	// members - SelectMenu - properties - border format
	const borderFormatMenu = CreateBorderFormatMenu(this.lang, this.icons, []);
	const borderFormatButton = controller_props.querySelector('[data-command="props_onborder_format"]');
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
		cell_alignment: controller_props.querySelector('.se-table-props-align .__se__a_h'),
		cell_alignment_vertical: controller_props.querySelector('.se-table-props-align .__se__a_v'),
		border_format: borderFormatButton,
		border_style: controller_props.querySelector('[data-command="props_onborder_style"] .se-txt'),
		border_color: controller_props.querySelector('.__se_border_color'),
		border_width: controller_props.querySelector('.__se__border_size'),
		back_color: controller_props.querySelector('.__se_back_color'),
		font_color: controller_props.querySelector('.__se_font_color'),
		palette_border_button: controller_props.querySelector('[data-command="props_onpalette"][data-value="border"]'),
		font_bold: controller_props.querySelector('[data-command="props_font_style"][data-value="bold"]'),
		font_underline: controller_props.querySelector('[data-command="props_font_style"][data-value="underline"]'),
		font_italic: controller_props.querySelector('[data-command="props_font_style"][data-value="italic"]'),
		font_strike: controller_props.querySelector('[data-command="props_font_style"][data-value="strike"]')
	};
	this._propsCache = [];
	this._currentFontStyles = [];
	this._propsAlignCache = '';
	this._propsVerticalAlignCache = '';
	this._typeCache = '';
	this.tableHighlight = menu.querySelector('.se-table-size-highlighted');
	this.tableUnHighlight = menu.querySelector('.se-table-size-unhighlighted');
	this.tableDisplay = menu.querySelector('.se-table-size-display');
	this.resizeButton = controller_table.querySelector('._se_table_resize');
	this.resizeText = controller_table.querySelector('._se_table_resize > span > span');
	this.columnFixedButton = controller_table.querySelector('._se_table_fixed_column');
	this.headerButton = controller_table.querySelector('._se_table_header');
	this.captionButton = controller_table.querySelector('._se_table_caption');
	this.mergeButton = controller_cell.querySelector('[data-command="merge"]');

	// members - private
	this._resizing = false;
	this._resizeLine = null;
	this._resizeLinePrev = null;
	this._figure = null;
	this._element = null;
	this._tdElement = null;
	this._trElement = null;
	this._trElements = null;
	this._tableXY = [];
	this._maxWidth = true;
	this._fixedColumn = false;
	this._physical_cellCnt = 0;
	this._logical_cellCnt = 0;
	this._rowCnt = 0;
	this._rowIndex = 0;
	this._physical_cellIndex = 0;
	this._logical_cellIndex = 0;
	this._current_colSpan = 0;
	this._current_rowSpan = 0;

	// member - multi selecte
	this._selectedCells = null;
	this._shift = false;
	this._fixedCell = null;
	this._fixedCellName = null;
	this._selectedCell = null;
	this._selectedTable = null;
	this._ref = null;

	// member - global events
	this._bindMultiOn = OnCellMultiSelect.bind(this);
	this._bindMultiOff = OffCellMultiSelect.bind(this);
	this._bindShiftOff = OffCellShift.bind(this);
	this._bindTouchOff = OffCellTouch.bind(this);
	this.__globalEvents = {
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
	this.eventManager.addEvent(commandArea, 'mousemove', OnMouseMoveTablePicker.bind(this));
	this.eventManager.addEvent(commandArea, 'click', OnClickTablePicker.bind(this));
};

Table.key = 'table';
Table.type = 'dropdown-free';
Table.className = '';
Table.component = function (node) {
	return domUtils.isTable(node) ? node : null;
};
Table.options = { isInputComponent: true };
Table.prototype = {
	/**
	 * @override core
	 */
	action() {
		const oTable = domUtils.createElement('TABLE');
		const x = this._tableXY[0];
		const y = this._tableXY[1];

		const body = `<tbody>${`<tr>${CreateCells('td', x, false)}</tr>`.repeat(y)}</tbody>`;
		const colGroup = `<colgroup>${`<col style="width: ${numbers.get(100 / x, CELL_DECIMAL_END)}%;">`.repeat(x)}</colgroup>`;
		oTable.innerHTML = colGroup + body;

		// scroll
		let scrollTypeClass = '';
		if (this.figureScroll) {
			scrollTypeClass = ` se-scroll-figure-${this.figureScroll}`;
		}

		const figure = domUtils.createElement('FIGURE', { class: 'se-flex-component se-input-component' + scrollTypeClass });
		figure.appendChild(oTable);

		if (this.component.insert(figure, false, false)) {
			this._resetTablePicker();
			const target = oTable.querySelector('td div');
			this.selection.setRange(target, 0, target, 0);
		}
	},

	/**
	 * @override core
	 */
	retainFormat() {
		return {
			query: 'table',
			method: (element) => {
				const ColgroupEl = element.querySelector('colgroup');
				let FigureEl = domUtils.isFigure(element.parentNode) ? element.parentNode : null;
				if (ColgroupEl && FigureEl) return;

				// create colgroup
				if (!ColgroupEl) {
					const maxCount = GetMaxColumns(element);
					const colGroup = domUtils.createElement('colgroup', null, `<col style="width: ${numbers.get(100 / maxCount, CELL_DECIMAL_END)}%;">`.repeat(maxCount));
					element.insertBefore(colGroup, element.firstElementChild);
				}

				// figure
				if (!FigureEl) {
					FigureEl = domUtils.createElement('FIGURE', { class: 'se-flex-component se-input-component' });
					element.parentNode.insertBefore(FigureEl, element);
					FigureEl.appendChild(element);
				} else {
					domUtils.addClass(FigureEl, 'se-flex-component|se-input-component');
				}

				// scroll
				if (!this.figureScroll) {
					domUtils.removeClass(FigureEl, this.figureScrollList.join('|'));
				} else {
					const scrollTypeClass = `se-scroll-figure-${this.figureScroll}`;
					domUtils.addClass(FigureEl, scrollTypeClass);
					domUtils.removeClass(FigureEl, this.figureScrollList.filter((v) => v !== scrollTypeClass).join('|'));
				}
			}
		};
	},

	/**
	 * @override core
	 * @param {"rtl"|"ltr"} dir Direction
	 */
	setDir(dir) {
		this.tableHighlight.style.left = dir === 'rtl' ? 10 * 18 - 13 + 'px' : '';
		this._resetTablePicker();
		this._resetPropsAlign(dir === 'rtl');
	},

	onMouseMove({ event }) {
		if (this._resizing) return;
		const target = domUtils.getParentElement(event.target, IsResizeEls);
		if (!target || this._fixedCell) {
			this.__hideResizeLine();
			return;
		}

		const cellEdge = CheckCellEdge(event, target);
		if (cellEdge.is) {
			if (this._element) this._element.style.cursor = '';
			this.__removeGlobalEvents();
			if (this._resizeLine?.style.display === 'block') this._resizeLine.style.display = 'none';
			this._resizeLine = this.editor.frameContext.get('wrapper').querySelector(RESIZE_CELL_CLASS);
			this._setResizeLinePosition(domUtils.getParentElement(target, domUtils.isTable), target, this._resizeLine, cellEdge.isLeft);
			this._resizeLine.style.display = 'block';
			return;
		}

		const rowEdge = CheckRowEdge(event, target);
		if (rowEdge.is) {
			this.__removeGlobalEvents();
			this._element = domUtils.getParentElement(target, domUtils.isTable);
			this._element.style.cursor = 'ns-resize';
			if (this._resizeLine?.style.display === 'block') this._resizeLine.style.display = 'none';
			this._resizeLine = this.editor.frameContext.get('wrapper').querySelector(RESIZE_ROW_CLASS);
			this._setResizeRowPosition(domUtils.getParentElement(target, domUtils.isTable), target, this._resizeLine);
			this._resizeLine.style.display = 'block';
			return;
		}

		if (this._element) this._element.style.cursor = '';
		this.__hideResizeLine();
	},

	onScroll() {
		if (this._resizeLine?.style.display !== 'block') return;
		// delete resize line position
		if (this._element) this._element.style.cursor = '';
		this._resizeLine.style.display = 'none';
	},

	/**
	 * @override core
	 * @param {any} event Event object
	 */
	onMouseDown({ event }) {
		this._ref = null;
		const target = domUtils.getParentElement(event.target, IsResizeEls);
		if (!target) return;

		const cellEdge = CheckCellEdge(event, target);
		if (cellEdge.is) {
			try {
				this._deleteStyleSelectedCells();
				this.setCellInfo(target, true);
				const colIndex = this._logical_cellIndex - (cellEdge.isLeft ? 1 : 0);

				// ready
				this.editor.enableBackWrapper('ew-resize');
				if (!this._resizeLine) this._resizeLine = this.editor.frameContext.get('wrapper').querySelector(RESIZE_CELL_CLASS);
				this._resizeLinePrev = this.editor.frameContext.get('wrapper').querySelector(RESIZE_CELL_PREV_CLASS);

				// select figure
				if (colIndex < 0 || colIndex === this._logical_cellCnt - 1) {
					this._startFigureResizing(cellEdge.startX, colIndex < 0);
					return;
				}

				const col = this._element.querySelector('colgroup').querySelectorAll('col')[colIndex < 0 ? 0 : colIndex];
				this._startCellResizing(col, cellEdge.startX, numbers.get(_w.getComputedStyle(col).width, CELL_DECIMAL_END), cellEdge.isLeft);
			} catch (err) {
				console.warn('[SUNEDITOR.plugins.table.error]', err);
				this.__removeGlobalEvents();
			}

			return;
		}

		const rowEdge = CheckRowEdge(event, target);
		if (rowEdge.is) {
			try {
				let row = domUtils.getParentElement(target, domUtils.isTableRow);
				let rowSpan = target.rowSpan;
				if (rowSpan > 1) {
					while (domUtils.isTableRow(row) && rowSpan > 1) {
						row = row.nextElementSibling;
						--rowSpan;
					}
				}

				this._deleteStyleSelectedCells();
				this.setRowInfo(row);

				// ready
				this.editor.enableBackWrapper('ns-resize');
				if (!this._resizeLine) this._resizeLine = this.editor.frameContext.get('wrapper').querySelector(RESIZE_ROW_CLASS);
				this._resizeLinePrev = this.editor.frameContext.get('wrapper').querySelector(RESIZE_ROW_PREV_CLASS);

				this._startRowResizing(row, rowEdge.startY, numbers.get(_w.getComputedStyle(row).height, CELL_DECIMAL_END));
			} catch (err) {
				console.warn('[SUNEDITOR.plugins.table.error]', err);
				this.__removeGlobalEvents();
			}

			return;
		}

		if (this._shift && target !== this._fixedCell) return;

		this._deleteStyleSelectedCells();
		if (/^TR$/i.test(target.nodeName)) return;

		this.selectCells(target, false);
	},

	/**
	 * @override core
	 */
	onMouseUp() {
		this._shift = false;
	},

	/**
	 * @override core
	 */
	onMouseLeave() {
		this.__hideResizeLine();
	},

	/**
	 * @override core
	 * @param {any} event Event object
	 * @param {any} range range object
	 * @param {Element} line Current line element
	 */
	onKeyDown({ event, range, line }) {
		this._ref = null;
		if (this.editor.selectMenuOn || this._resizing) return;

		const keyCode = event.keyCode;
		// table tabkey
		if (keyCode === 9) {
			const tableCell = domUtils.getParentElement(line, domUtils.isTableCell);
			if (tableCell && range.collapsed && domUtils.isEdgePoint(range.startContainer, range.startOffset)) {
				this._closeController();

				const shift = event.shiftKey;
				const table = domUtils.getParentElement(tableCell, 'table');
				const cells = domUtils.getListChildren(table, domUtils.isTableCell);
				const idx = shift ? domUtils.prevIndex(cells, tableCell) : domUtils.nextIndex(cells, tableCell);

				if (idx === cells.length && !shift) {
					if (!domUtils.getParentElement(tableCell, 'thead')) {
						const rows = table.rows;
						const newRow = this.insertBodyRow(table, rows.length, rows[rows.length - 1].cells.length);
						const firstTd = newRow.querySelector('td div');
						this.selection.setRange(firstTd, 0, firstTd, 0);
					}

					event.preventDefault();
					event.stopPropagation();

					return false;
				}

				if (idx === -1 && shift) return;

				let moveCell = cells[idx];
				if (!moveCell) return;

				moveCell = moveCell.firstElementChild || moveCell;
				this.selection.setRange(moveCell, 0, moveCell, 0);

				event.preventDefault();
				event.stopPropagation();

				return false;
			}
		}

		let cell = null;
		if (!event.shiftKey || keyCode !== 16) {
			cell = domUtils.getParentElement(line, domUtils.isTableCell);
			if (!domUtils.hasClass(cell, 'se-selected-cell-focus')) return;

			this._deleteStyleSelectedCells();
			this._toggleEditor(true);
			this.__removeGlobalEvents();
			this._closeController();

			return;
		}

		if (this._shift || this._ref) return;

		cell = cell || domUtils.getParentElement(line, domUtils.isTableCell);
		if (cell) {
			this._fixedCell = cell;
			this._closeController();
			this.selectCells(cell, event.shiftKey);
			return false;
		}
	},

	/**
	 * @override core
	 * @param {any} event Event object
	 * @param {any} range range object
	 * @param {Element} line Current line element
	 */
	onKeyUp({ line }) {
		if (this._shift && domUtils.getParentElement(line, domUtils.isTableCell) === this._fixedCell) {
			this._deleteStyleSelectedCells();
			this._toggleEditor(true);
			this.__removeGlobalEvents();
		}
		this._shift = false;
	},

	/**
	 * @override ColorPicker
	 */
	colorPickerAction(color) {
		const target = this.propTargets[`${this.sliderType}_color`];
		target.style.borderColor = target.value = color;
		this.controller_colorPicker.close();
	},

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
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
				this.selectMenu_row.menus[0].style.display = this.selectMenu_row.menus[1].style.display = /^TH$/i.test(this._tdElement?.nodeName) ? 'none' : '';
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
				domUtils.toggleClass(this.propTargets[`font_${value}`], 'on');
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
				if (domUtils.isTable(propsCache[0][0]) && this._figure) {
					this._figure.style.float = this._propsAlignCache;
				}
				break;
			}
			case 'close_props':
				this.controller_props.close();
				break;
			case 'props_align':
				this._setAlignProps(this.propTargets.cell_alignment, target.getAttribute('data-value'), false);
				break;
			case 'props_align_vertical':
				this._setAlignProps(this.propTargets.cell_alignment_vertical, target.getAttribute('data-value'), false);
				break;
			case 'merge':
				this.mergeCells();
				break;
			case 'resize':
				this._maxWidth = !this._maxWidth;
				this.setTableStyle('width', false);
				this._historyPush();
				this.component.select(this._element, Table.key, true);
				break;
			case 'layout':
				this._fixedColumn = !this._fixedColumn;
				this.setTableStyle('column', false);
				this._historyPush();
				this.component.select(this._element, Table.key, true);
				break;
			case 'remove': {
				const emptyDiv = this._figure?.parentNode;
				domUtils.removeItem(this._figure);
				this._closeController();

				if (emptyDiv !== this.editor.frameContext.get('wysiwyg'))
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

		if (!/(^props_|^revert|Properties$)/.test(command)) {
			this.controller_props.close();
			this.controller_colorPicker.close();
		}

		if (!/^(remove|props_|on|open|merge)/.test(command)) {
			this.setCellControllerPosition(this._tdElement, this._shift);
		}
	},

	/**
	 * @override controller
	 */
	close() {
		this.__removeGlobalEvents();
		this._deleteStyleSelectedCells();
		this._toggleEditor(true);

		this._figure = null;
		this._element = null;
		// this._tdElement = null;
		this._trElement = null;
		this._trElements = null;
		this._tableXY = [];
		this._maxWidth = false;
		this._fixedColumn = false;
		this._physical_cellCnt = 0;
		this._logical_cellCnt = 0;
		this._rowCnt = 0;
		this._rowIndex = 0;
		this._physical_cellIndex = 0;
		this._logical_cellIndex = 0;
		this._current_colSpan = 0;
		this._current_rowSpan = 0;

		this._shift = false;
		this._selectedCells = null;
		this._selectedTable = null;
		this._ref = null;

		this._fixedCell = null;
		this._selectedCell = null;
		this._fixedCellName = null;

		const { border_format, border_color, border_style, border_width, back_color, font_color, cell_alignment, cell_alignment_vertical, font_bold, font_underline, font_italic, font_strike } = this.propTargets;
		domUtils.removeClass([border_format, border_color, border_style, border_width, back_color, font_color, cell_alignment, cell_alignment_vertical, font_bold, font_underline, font_italic, font_strike], 'on');
	},

	selectCells(tdElement, shift) {
		if (!this._shift && !this._ref) this.__removeGlobalEvents();

		this._shift = shift;
		this._fixedCell = tdElement;
		this._fixedCellName = tdElement.nodeName;
		this._selectedTable = domUtils.getParentElement(tdElement, 'TABLE');

		this._deleteStyleSelectedCells();
		domUtils.addClass(tdElement, 'se-selected-cell-focus');

		if (!shift) {
			this.__globalEvents.on = this.eventManager.addGlobalEvent('mousemove', this._bindMultiOn, false);
		} else {
			this.__globalEvents.shiftOff = this.eventManager.addGlobalEvent('keyup', this._bindShiftOff, false);
			this.__globalEvents.on = this.eventManager.addGlobalEvent('mousedown', this._bindMultiOn, false);
		}

		this.__globalEvents.off = this.eventManager.addGlobalEvent('mouseup', this._bindMultiOff, false);
		this.__globalEvents.touchOff = this.eventManager.addGlobalEvent('touchmove', this._bindTouchOff, false);
	},

	seTableInfo(element) {
		const table = (this._element = this._selectedTable || domUtils.getParentElement(element, 'TABLE'));
		this._figure = domUtils.getParentElement(table, domUtils.isFigure) || table;
		return table;
	},

	setCellInfo(tdElement, reset) {
		const table = this.seTableInfo(tdElement);
		this._trElement = tdElement.parentNode;

		// hedaer
		if (table.querySelector('thead')) domUtils.addClass(this.headerButton, 'active');
		else domUtils.removeClass(this.headerButton, 'active');

		// caption
		if (table.querySelector('caption')) domUtils.addClass(this.captionButton, 'active');
		else domUtils.removeClass(this.captionButton, 'active');

		if (reset || this._physical_cellCnt === 0) {
			if (this._tdElement !== tdElement) {
				this._tdElement = tdElement;
				this._trElement = tdElement.parentNode;
			}

			if (!this._selectedCells || this._selectedCells.length === 0) this._selectedCells = [tdElement];

			const rows = (this._trElements = table.rows);
			const cellIndex = tdElement.cellIndex;

			let cellCnt = 0;
			for (let i = 0, cells = rows[0].cells, len = rows[0].cells.length; i < len; i++) {
				cellCnt += cells[i].colSpan;
			}

			// row cnt, row index
			const rowIndex = (this._rowIndex = this._trElement.rowIndex);
			this._rowCnt = rows.length;

			// cell cnt, physical cell index
			this._physical_cellCnt = this._trElement.cells.length;
			this._logical_cellCnt = cellCnt;
			this._physical_cellIndex = cellIndex;

			// span
			this._current_colSpan = this._tdElement.colSpan - 1;
			this._current_rowSpan = this._trElement.cells[cellIndex].rowSpan - 1;

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
						this._logical_cellIndex = logcalIndex;
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
	},

	setRowInfo(trElement) {
		const table = this.seTableInfo(trElement);
		const rows = (this._trElements = table.rows);
		this._rowCnt = rows.length;
		this._rowIndex = trElement.rowIndex;
	},

	editTable(type, option) {
		const table = this._element;
		const isRow = type === 'row';

		if (isRow) {
			const tableAttr = this._trElement.parentNode;
			if (/^THEAD$/i.test(tableAttr.nodeName)) {
				if (option === 'up') {
					return;
				} else if (!tableAttr.nextElementSibling || !/^TBODY$/i.test(tableAttr.nextElementSibling.nodeName)) {
					if (!option) {
						domUtils.removeItem(this._figure);
						this._closeController();
					} else {
						table.innerHTML += '<tbody><tr>' + CreateCells('td', this._logical_cellCnt, false) + '</tr></tbody>';
					}
					return;
				}
			}
		}

		// multi
		if (this._ref) {
			const positionCell = this._tdElement;
			const selectedCells = this._selectedCells;
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
					this.setCellInfo(option === 'up' ? selectedCells[0] : selectedCells[selectedCells.length - 1], true);
					this.editRow(option, positionCell);
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
					this.editCell(option, positionCell);
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
					domUtils.removeItem(children[i]);
					i--;
				}
			}

			if (table.children.length === 0) domUtils.removeItem(table);
		}
	},

	editRow(option, positionResetElement) {
		const remove = !option;
		const up = option === 'up';
		const originRowIndex = this._rowIndex;
		const rowIndex = remove || up ? originRowIndex : originRowIndex + this._current_rowSpan + 1;
		const sign = remove ? -1 : 1;

		const rows = this._trElements;
		let cellCnt = this._logical_cellCnt;

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
						spanCells.push({ cell: cell.cloneNode(false), index: logcalIndex });
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

			this._element.deleteRow(rowIndex);
		} else {
			this.insertBodyRow(this._element, rowIndex, cellCnt);
		}

		if (!remove) {
			this.setCellControllerPosition(positionResetElement || this._tdElement, true);
		} else {
			this._closeController();
		}
	},

	editCell(option, positionResetElement) {
		const remove = !option;
		const left = option === 'left';
		const colSpan = this._current_colSpan;
		const cellIndex = remove || left ? this._logical_cellIndex : this._logical_cellIndex + colSpan + 1;

		const rows = this._trElements;
		let rowSpanArr = [];
		let spanIndex = [];
		let passCell = 0;
		let insertIndex;
		const removeCell = [];
		const removeSpanArr = [];

		for (let i = 0, len = this._rowCnt, row, cells, newCell, applySpan, cellColSpan; i < len; i++) {
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
					newCell = CreateCells(cells[0].nodeName, 0, true);
					newCell = row.insertBefore(newCell, cells[insertIndex]);
				}
			}
		}

		const colgroup = this._element.querySelector('colgroup');
		if (colgroup) {
			const cols = colgroup.querySelectorAll('col');
			if (remove) {
				domUtils.removeItem(cols[insertIndex]);
			} else {
				let totalW = 0;
				for (let i = 0, len = cols.length, w; i < len; i++) {
					w = numbers.get(cols[i].style.width);
					w -= Math.round((w * len * 0.1) / 2, CELL_DECIMAL_END);
					totalW += w;
					cols[i].style.width = `${w}%`;
				}
				const newCol = domUtils.createElement('col', { style: `width:${100 - totalW}%` });
				colgroup.insertBefore(newCol, cols[insertIndex]);
			}
		}

		if (remove) {
			let removeFirst, removeEnd;
			for (let r = 0, rLen = removeCell.length, row; r < rLen; r++) {
				row = removeCell[r].parentNode;
				domUtils.removeItem(removeCell[r]);
				if (row.cells.length === 0) {
					if (!removeFirst) removeFirst = domUtils.getArrayIndex(rows, row);
					removeEnd = domUtils.getArrayIndex(rows, row);
					domUtils.removeItem(row);
				}
			}

			for (let c = 0, cLen = removeSpanArr.length, rowSpanCell; c < cLen; c++) {
				rowSpanCell = removeSpanArr[c];
				rowSpanCell.cell.rowSpan = numbers.getOverlapRangeAtIndex(removeFirst, removeEnd, rowSpanCell.i, rowSpanCell.rs);
			}

			this._closeController();
		} else {
			this.setCellControllerPosition(positionResetElement || this._tdElement, true);
		}
	},

	insertBodyRow(table, rowIndex, cellCnt) {
		const newRow = table.insertRow(rowIndex);
		newRow.innerHTML = CreateCells('td', cellCnt, false);
		return newRow;
	},

	mergeCells() {
		const ref = this._ref;
		const selectedCells = this._selectedCells;
		const mergeCell = selectedCells[0];

		let emptyRowFirst = null;
		let emptyRowLast = null;
		const cs = ref.ce - ref.cs + 1;
		let rs = ref.re - ref.rs + 1;
		let mergeHTML = '';
		let row = null;

		for (let i = 1, len = selectedCells.length, cell, ch; i < len; i++) {
			cell = selectedCells[i];
			if (row !== cell.parentNode) row = cell.parentNode;

			ch = cell.children;
			for (let c = 0, cLen = ch.length; c < cLen; c++) {
				if (this.format.isLine(ch[c]) && domUtils.isZeroWith(ch[c].textContent)) {
					domUtils.removeItem(ch[c]);
				}
			}

			mergeHTML += cell.innerHTML;
			domUtils.removeItem(cell);

			if (row.cells.length === 0) {
				if (!emptyRowFirst) emptyRowFirst = row;
				else emptyRowLast = row;
				rs -= 1;
			}
		}

		if (emptyRowFirst) {
			const rows = this._trElements;
			const rowIndexFirst = domUtils.getArrayIndex(rows, emptyRowFirst);
			const rowIndexLast = domUtils.getArrayIndex(rows, emptyRowLast || emptyRowFirst);
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
				domUtils.removeItem(removeRows[i]);
			}
		}

		mergeCell.innerHTML += mergeHTML;
		mergeCell.colSpan = cs;
		mergeCell.rowSpan = rs;

		this.setMergeSplitButton(true, false);
		this.setController(mergeCell);

		this.editor.focusEdge(mergeCell);
		this._historyPush();
	},

	toggleHeader() {
		const btn = this.headerButton;
		const active = domUtils.hasClass(btn, 'active');
		const table = this._element;

		if (!active) {
			const header = domUtils.createElement('THEAD');
			header.innerHTML = '<tr>' + CreateCells('th', this._logical_cellCnt, false) + '</tr>';
			table.insertBefore(header, table.firstElementChild);
		} else {
			domUtils.removeItem(table.querySelector('thead'));
		}

		domUtils.toggleClass(btn, 'active');

		if (/TH/i.test(this._tdElement.nodeName)) {
			this._closeController();
		} else {
			this.setCellControllerPosition(this._tdElement, false);
		}
	},

	toggleCaption() {
		const btn = this.captionButton;
		const active = domUtils.hasClass(btn, 'active');
		const table = this._element;

		if (!active) {
			const caption = domUtils.createElement('CAPTION', { class: `se-table-caption-${this.captionPosition}` });
			caption.innerHTML = '<div><br></div>';
			table.insertBefore(caption, table.firstElementChild);
		} else {
			domUtils.removeItem(table.querySelector('caption'));
		}

		domUtils.toggleClass(btn, 'active');
		this.setCellControllerPosition(this._tdElement, false);
	},

	setTableStyle(styles, ondisplay) {
		if (styles.includes('width')) {
			const targets = this._figure;
			if (!targets) return;

			let sizeIcon, text;
			if (!this._maxWidth) {
				sizeIcon = this.icons.expansion;
				text = this.maxText;
				if (!ondisplay) targets.style.width = 'min-content';
			} else {
				sizeIcon = this.icons.reduction;
				text = this.minText;
				if (!ondisplay) targets.style.width = '100%';
			}

			domUtils.changeElement(this.resizeButton.firstElementChild, sizeIcon);
			domUtils.changeTxt(this.resizeText, text);
		}

		if (styles.includes('column')) {
			if (!this._fixedColumn) {
				domUtils.removeClass(this._element, 'se-table-layout-fixed');
				domUtils.addClass(this._element, 'se-table-layout-auto');
				domUtils.removeClass(this.columnFixedButton, 'active');
			} else {
				domUtils.removeClass(this._element, 'se-table-layout-auto');
				domUtils.addClass(this._element, 'se-table-layout-fixed');
				domUtils.addClass(this.columnFixedButton, 'active');
			}
		}
	},

	setMergeSplitButton(fixedCell, selectedCell) {
		if (!selectedCell || !selectedCell || fixedCell === selectedCell) {
			this.splitButton.style.display = 'block';
			this.mergeButton.style.display = 'none';
		} else {
			this.splitButton.style.display = 'none';
			this.mergeButton.style.display = 'block';
		}
	},

	/**
	 * @override component
	 * @param {Element} target Target element
	 */
	select(target) {
		this._figureOpen(target);

		const targetWidth = this._figure?.style.width || '100%';
		this._maxWidth = targetWidth === '100%';
		this._fixedColumn = domUtils.hasClass(target, 'se-table-layout-fixed') || target.style.tableLayout === 'fixed';
		this.setTableStyle(this._maxWidth ? 'width|column' : 'width', true);

		if (_DragHandle.get('__overInfo') === ON_OVER_COMPONENT) return;

		if (!this._tdElement) return;
		this.setCellInfo(this._tdElement, true);

		// controller open
		const figureEl = domUtils.getParentElement(target, domUtils.isFigure);
		this.controller_table.open(figureEl, null, { isWWTarget: false, initMethod: null, addOffset: null });

		const addOffset = !this.cellControllerTop ? null : this.controller_table.form.style.display === 'block' ? { left: this.controller_table.form.offsetWidth + 2 } : null;
		this.controller_cell.open(this._tdElement, this.cellControllerTop ? figureEl : null, { isWWTarget: false, initMethod: null, addOffset: addOffset });
	},

	setController(tdElement) {
		if (!this.selection.get().isCollapsed && !this._selectedCell) {
			this._deleteStyleSelectedCells();
			return;
		}

		this._tdElement = tdElement;
		domUtils.addClass(tdElement, 'se-selected-cell-focus');
		const tableElement = this._element || this._selectedTable || domUtils.getParentElement(tdElement, 'TABLE');
		this.component.select(tableElement, Table.key, true);
	},

	setCellControllerPosition(tdElement, reset) {
		this.setCellInfo(tdElement, reset);
		this.controller_cell.resetPosition(this.cellControllerTop ? domUtils.getParentElement(tdElement, domUtils.isTable) : tdElement);
	},

	_historyPush() {
		this._deleteStyleSelectedCells();
		this.history.push(false);
		this._recallStyleSelectedCells();
	},

	_figureOpen(target) {
		this.figure.open(target, { nonResizing: true, nonSizeInfo: true, nonBorder: true, figureTarget: true, __fileManagerInfo: false });
	},

	_startCellResizing(col, startX, startWidth, isLeftEdge) {
		this._setResizeLinePosition(this._figure, this._tdElement, this._resizeLinePrev, isLeftEdge);
		this._resizeLinePrev.style.display = 'block';
		const prevValue = col.style.width;
		const nextCol = col.nextElementSibling;
		const nextColPrevValue = nextCol.style.width;
		const realWidth = domUtils.hasClass(this._element, 'se-table-layout-fixed') ? nextColPrevValue : converter.getWidthInPercentage(col);

		if (_DragHandle.get('__dragHandler')) _DragHandle.get('__dragHandler').style.display = 'none';
		this._addResizeGlobalEvents(
			this._cellResize.bind(
				this,
				col,
				nextCol,
				this._figure,
				this._tdElement,
				this._resizeLine,
				isLeftEdge,
				startX,
				startWidth,
				numbers.get(prevValue, CELL_DECIMAL_END),
				numbers.get(realWidth, CELL_DECIMAL_END),
				this._element.offsetWidth
			),
			() => {
				this.__removeGlobalEvents();
				this.history.push(true);
				// figure reopen
				this.component.select(this._element, Table.key, true);
			},
			(e) => {
				this._stopResize(col, prevValue, 'width', e);
				this._stopResize(nextCol, nextColPrevValue, 'width', e);
			}
		);
	},

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
	},

	_startRowResizing(row, startY, startHeight) {
		this._setResizeRowPosition(this._figure, row, this._resizeLinePrev);
		this._resizeLinePrev.style.display = 'block';
		const prevValue = row.style.height;

		this._addResizeGlobalEvents(
			this._rowResize.bind(this, row, this._figure, this._resizeLine, startY, startHeight),
			() => {
				this.__removeGlobalEvents(this);
				this.history.push(true);
			},
			this._stopResize.bind(this, row, prevValue, 'height')
		);
	},

	_rowResize(row, figure, resizeLine, startY, startHeight, e) {
		const deltaY = e.clientY - startY;
		const newHeightPx = startHeight + deltaY;
		row.style.height = `${newHeightPx}px`;
		this._setResizeRowPosition(figure, row, resizeLine);
	},

	_startFigureResizing(startX, isLeftEdge) {
		const figure = this._figure;
		this._setResizeLinePosition(figure, figure, this._resizeLinePrev, isLeftEdge);
		this._resizeLinePrev.style.display = 'block';
		const realWidth = converter.getWidthInPercentage(figure);

		if (_DragHandle.get('__dragHandler')) _DragHandle.get('__dragHandler').style.display = 'none';
		this._addResizeGlobalEvents(
			this._figureResize.bind(this, figure, this._resizeLine, isLeftEdge, startX, figure.offsetWidth, numbers.get(realWidth, CELL_DECIMAL_END)),
			() => {
				this.__removeGlobalEvents();
				// figure reopen
				this.component.select(this._element, Table.key, true);
			},
			this._stopResize.bind(this, figure, figure.style.width, 'width')
		);
	},

	_figureResize(figure, resizeLine, isLeftEdge, startX, startWidth, constNum, e) {
		const deltaX = isLeftEdge ? startX - e.clientX : e.clientX - startX;
		const newWidthPx = startWidth + deltaX;
		const newWidthPercent = (newWidthPx / startWidth) * constNum;

		if (newWidthPercent > 0) {
			figure.style.width = `${newWidthPercent}%`;
			this._setResizeLinePosition(figure, figure, resizeLine, isLeftEdge);
		}
	},

	_setResizeLinePosition(figure, target, resizeLine, isLeftEdge) {
		const tdOffset = this.offset.getLocal(target);
		const tableOffset = this.offset.getLocal(figure);
		resizeLine.style.left = `${tdOffset.left + (isLeftEdge ? 0 : target.offsetWidth)}px`;
		resizeLine.style.top = `${tableOffset.top}px`;
		resizeLine.style.height = `${figure.offsetHeight}px`;
	},

	_setResizeRowPosition(figure, target, resizeLine) {
		const rowOffset = this.offset.getLocal(target);
		const tableOffset = this.offset.getLocal(figure);
		resizeLine.style.top = `${rowOffset.top + target.offsetHeight}px`;
		resizeLine.style.left = `${tableOffset.left}px`;
		resizeLine.style.width = `${figure.offsetWidth}px`;
	},

	_stopResize(target, prevValue, styleProp, e) {
		if (e.keyCode !== 27) return;
		this.__removeGlobalEvents();
		target.style[styleProp] = prevValue;
		// figure reopen
		if (styleProp === 'width') {
			this.component.select(this._element, Table.key, true);
		}
	},

	_deleteStyleSelectedCells() {
		domUtils.removeClass([this._fixedCell, this._selectedCell], 'se-selected-cell-focus');
		if (this._selectedTable) {
			const selectedCells = this._selectedTable.querySelectorAll('.se-selected-table-cell');
			for (let i = 0, len = selectedCells.length; i < len; i++) {
				domUtils.removeClass(selectedCells[i], 'se-selected-table-cell');
			}
		}
	},

	_recallStyleSelectedCells() {
		if (this._selectedCells) {
			const selectedCells = this._selectedCells;
			for (let i = 0, len = selectedCells.length; i < len; i++) {
				domUtils.addClass(selectedCells[i], 'se-selected-table-cell');
			}
		}
	},

	_addResizeGlobalEvents(resizeFn, stopFn, keyDownFn) {
		this.__globalEvents.resize = this.eventManager.addGlobalEvent('mousemove', resizeFn, false);
		this.__globalEvents.resizeStop = this.eventManager.addGlobalEvent('mouseup', stopFn, false);
		this.__globalEvents.resizeKeyDown = this.eventManager.addGlobalEvent('keydown', keyDownFn, false);
		this._resizing = true;
	},

	_toggleEditor(enabled) {
		const wysiwyg = this.editor.frameContext.get('wysiwyg');
		if (enabled) domUtils.removeClass(wysiwyg, 'se-disabled');
		else domUtils.addClass(wysiwyg, 'se-disabled');
	},

	_setCtrlProps(type) {
		this._typeCache = type;
		const isTable = type === 'table';
		const targets = isTable ? [this._element] : this._selectedCells;
		if (!targets || targets.length === 0) return;

		const { border_format, border_color, border_style, border_width, back_color, font_color, cell_alignment, cell_alignment_vertical, font_bold, font_underline, font_italic, font_strike } = this.propTargets;
		const { border, backgroundColor, color, textAlign, verticalAlign, fontWeight, textDecoration, fontStyle } = _w.getComputedStyle(targets[0]);
		const cellBorder = this._getBorderStyle(border);

		cell_alignment.querySelector('[data-value="justify"]').style.display = isTable ? 'none' : '';
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
			align = isTable ? this._figure?.style.float : textAlign,
			align_v = verticalAlign;
		this._propsCache = [];

		for (let i = 0, t, isBreak; (t = targets[i]); i++) {
			// eslint-disable-next-line no-shadow
			const { cssText, border, backgroundColor, color, textAlign, verticalAlign, fontWeight, textDecoration, fontStyle } = t.style;
			this._propsCache.push([t, cssText]);
			if (isBreak) continue;

			const { c, s, w } = this._getBorderStyle(border);

			if (b_color && cellBorder.c !== c) b_color = '';
			if (b_style && cellBorder.s !== s) b_style = '';
			if (b_width && cellBorder.w !== w) b_width = '';
			if (backColor !== converter.rgb2hex(backgroundColor)) backColor = '';
			if (fontColor !== converter.rgb2hex(color)) fontColor = '';
			if (align !== (isTable ? this._figure?.style.float : textAlign)) align = '';
			if (align_v && align_v !== verticalAlign) align_v = '';
			if (bold && bold !== /.+/.test(fontWeight)) bold = '';
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
		domUtils.removeClass(border_format, 'active');

		// border - styles
		b_style = b_style || BORDER_LIST[0];
		border_style.textContent = b_style;
		border_color.style.borderColor = border_color.value = b_color;
		border_width.value = b_width;
		this._disableBorderProps(b_style === BORDER_LIST[0]);

		// back, font color
		back_color.value = back_color.style.borderColor = backColor;
		font_color.value = font_color.style.borderColor = fontColor;

		// font style
		if (bold) domUtils.addClass(font_bold, 'on');
		if (underline) domUtils.addClass(font_underline, 'on');
		if (strike) domUtils.addClass(font_strike, 'on');
		if (italic) domUtils.addClass(font_italic, 'on');

		// align
		this._setAlignProps(cell_alignment, (this._propsAlignCache = align), true);
		this._setAlignProps(cell_alignment_vertical, (this._propsVerticalAlignCache = align_v), true);
	},

	_setAlignProps(el, align, reset) {
		domUtils.removeClass(el.querySelectorAll('button'), 'on');

		if (!reset && el.getAttribute('se-cell-align') === align) {
			el.setAttribute('se-cell-align', '');
			return;
		}

		domUtils.addClass(el.querySelector(`[data-value="${align}"]`), 'on');
		el.setAttribute('se-cell-align', align);
	},

	_disableBorderProps(disabled) {
		const { border_color, border_width, palette_border_button } = this.propTargets;
		if (disabled) {
			border_color.setAttribute('disabled', true);
			border_width.setAttribute('disabled', true);
			palette_border_button.setAttribute('disabled', true);
			border_width.setAttribute('disabled', true);
		} else {
			border_color.removeAttribute('disabled');
			border_width.removeAttribute('disabled');
			palette_border_button.removeAttribute('disabled');
			border_width.removeAttribute('disabled');
		}
	},

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
	},

	_submitProps(target) {
		try {
			target.setAttribute('disabled', true);

			const isTable = this.controller_table.form.contains(this.controller_props.currentTarget);
			const targets = isTable ? [this._element] : this._selectedCells;
			const tr = targets[0];
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
				middle: []
			};

			if (!isTable) {
				// --- target cells roof
				let { rs, re, cs, ce } = this._ref || {
					rs: tr.parentElement.rowIndex || 0,
					re: tr.parentElement.rowIndex || 0,
					cs: tr.cellIndex || 0,
					ce: tr.cellIndex || 0
				};
				const mergeInfo = new Array(re - rs + 1).fill(0).map(() => new Array(ce - cs + 1).fill(0));
				const cellStartIndex = cs;
				re -= rs;
				rs -= rs;
				ce -= cs;
				cs -= cs;
				let prevRow = tr.parentNode;
				for (let i = 0, cellCnt = 0, len = targets.length, e, es, rowIndex = 0, cellIndex, colspan, rowspan; i < len; i++, cellCnt++) {
					e = targets[i];
					colspan = e.colSpan;
					rowspan = e.rowSpan;
					cellIndex = e.cellIndex - cellStartIndex;

					if (prevRow !== e.parentNode) {
						rowIndex++;
						cellCnt = 0;
						prevRow = e.parentNode;
					}

					let c = 0;
					while (c <= cellIndex) {
						cellIndex += mergeInfo[rowIndex][c] || 0;
						c++;
					}

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
				if (this._figure) {
					this._figure.style.float = cellAlignment;
					this._figure.style.verticalAlign = cellAlignmentVertical;
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
			if (this._tdElement) {
				this._recallStyleSelectedCells();
				this.setCellInfo(this._tdElement, true);
				domUtils.addClass(this._tdElement, 'se-selected-cell-focus');
			}
		} catch (err) {
			console.warn('[SUNEDITOR.plugins.table.setProps.error]', err);
		} finally {
			target.removeAttribute('disabled');
		}
	},

	_setFontStyle(styles) {
		const { font_bold, font_italic, font_strike, font_underline } = this.propTargets;
		styles.fontWeight = domUtils.hasClass(font_bold, 'on') ? 'bold' : '';
		styles.fontStyle = domUtils.hasClass(font_italic, 'on') ? 'italic' : '';
		styles.textDecoration = ((domUtils.hasClass(font_strike, 'on') ? 'line-through ' : '') + (domUtils.hasClass(font_underline, 'on') ? 'underline' : '')).trim();
	},

	/**
	 * @private
	 * @description Set border format
	 * @param {Element[]} cells Target elements
	 * @param {"all"|"inside"|"horizon"|"vertical"|"outside"|"left"|"top"|"right"|"bottom"} borderKey Border style
	 * @param {number} s Border style
	 * @param {boolean} isTable table selected
	 */
	_setBorderStyles(cells, borderKey, s) {
		const { left, top, right, bottom, all } = cells;
		switch (borderKey) {
			case 'inside':
				if (cells.length === 1) return;
				domUtils.setStyle(
					all.filter((c) => !bottom.includes(c)),
					BORDER_NS.b,
					s
				);
				domUtils.setStyle(
					all.filter((c) => !right.includes(c)),
					BORDER_NS.r,
					s
				);
				break;
			case 'horizon':
				if (cells.length === 1) return;
				domUtils.setStyle(
					all.filter((c) => !bottom.includes(c)),
					BORDER_NS.b,
					s
				);
				break;
			case 'vertical':
				if (cells.length === 1) return;
				domUtils.setStyle(
					all.filter((c) => !right.includes(c)),
					BORDER_NS.r,
					s
				);
				break;
			case 'outside':
				domUtils.setStyle(left, BORDER_NS.l, s);
				domUtils.setStyle(top, BORDER_NS.t, s);
				domUtils.setStyle(right, BORDER_NS.r, s);
				domUtils.setStyle(bottom, BORDER_NS.b, s);
				break;
			case 'left':
				domUtils.setStyle(left, BORDER_NS.l, s);
				break;
			case 'top':
				domUtils.setStyle(top, BORDER_NS.t, s);
				break;
			case 'right':
				domUtils.setStyle(right, BORDER_NS.r, s);
				break;
			case 'bottom':
				domUtils.setStyle(bottom, BORDER_NS.b, s);
				break;
		}
	},

	_setMultiCells(startCell, endCell) {
		const rows = this._selectedTable.rows;
		this._deleteStyleSelectedCells();

		if (startCell === endCell) {
			if (!this._shift) return;
		} else {
			domUtils.addClass(startCell, 'se-selected-table-cell');
		}

		let findSelectedCell = true;
		let spanIndex = [];
		let rowSpanArr = [];
		const ref = (this._ref = { _i: 0, cs: null, ce: null, rs: null, re: null });

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

					domUtils.addClass(cell, 'se-selected-table-cell');
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
	},

	_resetTablePicker() {
		if (!this.tableHighlight) return;

		const highlight = this.tableHighlight.style;
		const unHighlight = this.tableUnHighlight.style;

		highlight.width = '1em';
		highlight.height = '1em';
		unHighlight.width = '10em';
		unHighlight.height = '10em';

		domUtils.changeTxt(this.tableDisplay, '1 x 1');
		this.menu.dropdownOff();
	},

	_resetPropsAlign() {
		const { cell_alignment } = this.propTargets;
		const left = cell_alignment.querySelector('[data-value="left"]');
		const right = cell_alignment.querySelector('[data-value="right"]');
		const l_parent = left.parentElement;
		const r_parent = right.parentElement;
		l_parent.appendChild(right);
		r_parent.appendChild(left);
	},

	_onColorPalette(button, type, color) {
		if (this.controller_colorPicker.isOpen && type === this.sliderType) {
			this.controller_colorPicker.close();
		} else {
			this.sliderType = type;
			domUtils.addClass(button, 'on');
			this.colorPicker.init(color?.value || '', button);
			this.controller_colorPicker.open(button, null, { isWWTarget: false, initMethod: null, addOffset: null });
		}
	},

	_closeController() {
		this.component.deselect();
		this.controller_table.close();
		this.controller_cell.close();
	},

	__hideResizeLine() {
		if (this._resizeLine) {
			this._resizeLine.style.display = 'none';
			this._resizeLine = null;
		}
	},

	__removeGlobalEvents() {
		this._resizing = false;
		this.editor.disableBackWrapper();
		this.__hideResizeLine();
		if (this._resizeLinePrev) {
			this._resizeLinePrev.style.display = 'none';
			this._resizeLinePrev = null;
		}
		const globalEvents = this.__globalEvents;
		for (const k in globalEvents) {
			if (globalEvents[k]) globalEvents[k] = this.eventManager.removeGlobalEvent(globalEvents[k]);
		}
	},

	constructor: Table
};

function IsResizeEls(node) {
	return /^(TD|TH|TR)$/i.test(node?.nodeName);
}

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

function OnSplitCells(direction) {
	const vertical = direction === 'vertical';
	const currentCell = this._tdElement;
	const rows = this._trElements;
	const currentRow = this._trElement;
	const index = this._logical_cellIndex;
	const rowIndex = this._rowIndex;
	const newCell = CreateCells(currentCell.nodeName, 0, true);

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

			for (let i = 0, len = this._rowCnt, cells, colSpan; i < len; i++) {
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
			const nextRowIndex = domUtils.getArrayIndex(rows, currentRow) + newRowSpan;

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
			const newRow = domUtils.createElement('TR');
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

			const physicalIndex = this._physical_cellIndex;
			const cells = currentRow.cells;

			for (let c = 0, cLen = cells.length; c < cLen; c++) {
				if (c === physicalIndex) continue;
				cells[c].rowSpan += 1;
			}

			currentRow.parentNode.insertBefore(newRow, currentRow.nextElementSibling);
		}
	}

	this.selectMenu_split.close();
	this.editor.focusEdge(currentCell);

	this._deleteStyleSelectedCells();
	this.history.push(false);

	this.setController(currentCell);
	this._selectedCell = this._fixedCell = currentCell;
}

function OnColumnEdit(command) {
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

function OnRowEdit(command) {
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

function OnMouseMoveTablePicker(e) {
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

	domUtils.changeTxt(this.tableDisplay, x + ' x ' + y);
	this._tableXY = [x, y];
}

function OnClickTablePicker() {
	this.action();
}

function CreateCells(nodeName, cnt, returnElement) {
	nodeName = nodeName.toLowerCase();

	if (!returnElement) {
		return `<${nodeName}><div><br></div></${nodeName}>`.repeat(cnt);
	} else {
		return domUtils.createElement(nodeName, null, '<div><br></div>');
	}
}

function OnCellMultiSelect(e) {
	this.editor._antiBlur = true;
	const target = domUtils.getParentElement(e.target, domUtils.isTableCell);

	if (this._shift) {
		if (target === this._fixedCell) {
			this._shift = false;
			this._deleteStyleSelectedCells();
			this._toggleEditor(true);
			this.__removeGlobalEvents();
			return;
		} else {
			this._toggleEditor(false);
		}
	} else if (!this._ref) {
		if (target === this._fixedCell) return;
		else this._toggleEditor(false);
	}

	if (!target || target === this._selectedCell || this._fixedCellName !== target.nodeName || this._selectedTable !== domUtils.getParentElement(target, 'TABLE')) {
		return;
	}

	this._selectedCell = target;
	this._setMultiCells(this._fixedCell, target);
}

function OffCellMultiSelect(e) {
	e.stopPropagation();

	if (!this._shift) {
		this.__removeGlobalEvents();
		this._toggleEditor(true);
	} else if (this.__globalEvents.touchOff) {
		this.__globalEvents.touchOff = this.eventManager.removeGlobalEvent(this.__globalEvents.touchOff);
	}

	if (!this._fixedCell || !this._selectedTable) return;

	this.setMergeSplitButton(this._fixedCell, this._selectedCell);
	this._selectedCells = Array.from(this._selectedTable.querySelectorAll('.se-selected-table-cell'));

	const focusCell = this._selectedCells?.length > 0 ? this._selectedCell : this._fixedCell;
	this.setController(focusCell);
}

function OffCellShift() {
	if (!this._ref) this._closeController();
}

function OffCellTouch() {
	this.close();
}

function GetMaxColumns(table) {
	let maxColumns = 0;

	for (const row of table.rows) {
		let columnCount = 0;
		for (const cell of row.cells) {
			columnCount += cell.colSpan;
		}
		maxColumns = Math.max(maxColumns, columnCount);
	}

	return maxColumns;
}

function OnPropsBorderEdit(command) {
	this.propTargets.border_style.textContent = command;
	this._disableBorderProps(command === BORDER_LIST[0]);
	this.selectMenu_props_border.close();
}

function OnPropsBorderFormatEdit(defaultCommand, command) {
	const { border_format } = this.propTargets;

	border_format.setAttribute('se-border-format', command);
	border_format.firstElementChild.innerHTML = this.icons[BORDER_FORMATS[command]];
	if (command !== defaultCommand) domUtils.addClass(border_format, 'active');
	else domUtils.removeClass(border_format, 'active');

	this.selectMenu_props_border_format.close();
	this.selectMenu_props_border_format_oneCell.close();
}

// init element
function CreateSplitMenu(lang) {
	const menus = domUtils.createElement(
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
	const menus = domUtils.createElement(
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
	const menus = domUtils.createElement(
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

	const menus = domUtils.createElement('DIV', null, html);
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

	const menus = domUtils.createElement('DIV', null, html);
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

	return domUtils.createElement('DIV', { class: 'se-dropdown se-selector-table' }, html);
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
		<button type="button" data-command="remove" class="se-btn se-tooltip">
			${icons.delete}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.remove}</span>
			</span>
		</button>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-table' }, html);
}

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
    </div>`;

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-table-cell' }, html);
}

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
					<label>${lang.align}</label>
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

	return domUtils.createElement('DIV', { class: 'se-controller se-table-props' }, html);
}

export default Table;
