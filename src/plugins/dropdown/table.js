import EditorInjector from '../../editorInjector';
import { domUtils, numbers } from '../../helper';
import { Controller, SelectMenu } from '../../modules';

const Table = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.table;
	this.icon = 'table';

	// create HTML
	const controllerPosition = typeof pluginOptions.cellControllerPosition === 'string' ? pluginOptions.cellControllerPosition.toLowerCase() : 'cell';
	this.cellControllerTop = controllerPosition === 'top';
	const menu = CreateHTML(editor);
	const commandArea = menu.querySelector('.se-controller-table-picker');
	const controller_table = CreateHTML_controller_table(editor);
	const controller_cell = CreateHTML_controller_cell(editor, this.cellControllerTop);
	const splitMenu = CreateSplitMenu(this.lang);

	// members
	this.controller_table = new Controller(this, controller_table, { position: 'top' });
	this.controller_cell = new Controller(this, controller_cell, { position: this.cellControllerTop ? 'top' : 'bottom' });
	this.splitButton = controller_cell.querySelector('[data-command="onsplit"]');
	this.selectMenu_split = new SelectMenu(this, { checkList: false, position: 'bottom-center' });
	this.selectMenu_split.on(this.splitButton, OnSplitCells.bind(this));
	this.selectMenu_split.create(splitMenu.items, splitMenu.menus);
	this.maxText = this.lang.maxSize;
	this.minText = this.lang.minSize;
	this.tableHighlight = menu.querySelector('.se-table-size-highlighted');
	this.tableUnHighlight = menu.querySelector('.se-table-size-unhighlighted');
	this.tableDisplay = menu.querySelector('.se-table-size-display');
	this.resizeButton = controller_table.querySelector('._se_table_resize');
	this.resizeText = controller_table.querySelector('._se_table_resize > span > span');
	this.columnFixedButton = controller_table.querySelector('._se_table_fixed_column');
	this.headerButton = controller_table.querySelector('._se_table_header');
	this.mergeButton = controller_cell.querySelector('._se_table_merge_button');
	this.insertRowAboveButton = controller_cell.querySelector('._se_table_insert_row_a');
	// members - private
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
	this._bindClose_move = null;
	this._bindClose_key = null;
	this._bindClose_down = null;
	this._bindClose_up = null;
	this._bindClose_touch = null;
	this.__globalEvents = {
		on: OnCellMultiSelect.bind(this),
		off: OffCellMultiSelect.bind(this),
		shiftOff: OffCellShift.bind(this),
		touchOff: OffCellTouch.bind(this)
	};

	// init
	this.menu.initDropdownTarget(Table, menu);
	this.eventManager.addEvent(commandArea, 'mousemove', OnMouseMoveTablePicker.bind(this));
	this.eventManager.addEvent(commandArea, 'click', OnClickTablePicker.bind(this));
};

Table.key = 'table';
Table.type = 'dropdown-free';
Table.className = '';
Table.component = (node) => (/^table$/i.test(node?.nodeName) ? Table.key : '');
Table.prototype = {
	/**
	 * @override core
	 */
	action() {
		const oTable = domUtils.createElement('TABLE');
		const x = this._tableXY[0];
		const y = this._tableXY[1];

		const body = `<tbody>${`<tr>${CreateCells('td', x, false)}</tr>`.repeat(y)}</tbody>`;
		const colGroup = `<colgroup>${`<col style="width: ${numbers.get(100 / x, 4)}%;">`.repeat(x)}</colgroup>`;
		oTable.innerHTML = colGroup + body;

		if (this.component.insert(oTable, false, false)) {
			const firstTd = oTable.querySelector('td div');
			this.selection.setRange(firstTd, 0, firstTd, 0);
			this._resetTablePicker();
			this.setController(domUtils.getParentElement(firstTd, 'TD'));
		}
	},

	/**
	 * @override core
	 */
	maintainPattern() {
		return {
			query: 'table',
			method: (element) => {
				const maxCount = GetMaxColumns(element);

				let colgroup = element.querySelector('colgroup');
				if (!colgroup) {
					//
				}

				const cols = colgroup.querySelector('col');

				if (cols?.length === maxCount) return;

				for (let i = 0, len = maxCount; i < len; i++) {}
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
	},

	/**
	 * @override core
	 * @param {any} event Event object
	 */
	onMousedown(event) {
		const tableCell = domUtils.getParentElement(event.target, domUtils.isTableCell);
		if (!tableCell || !(tableCell !== this._fixedCell && !this._shift)) return;
		this.selectCells(tableCell, false);
	},

	/**
	 * @override core
	 * @param {any} event Event object
	 * @param {any} range range object
	 * @param {Element} line Current line element
	 */
	onKeyDown(event, range, line) {
		// table
		if (event.keyCode === 9) {
			const tableCell = domUtils.getParentElement(line, domUtils.isTableCell);
			if (tableCell && range.collapsed && domUtils.isEdgePoint(range.startContainer, range.startOffset)) {
				const shift = event.shiftKey;
				const table = domUtils.getParentElement(tableCell, 'table');
				const cells = domUtils.getListChildren(table, domUtils.isTableCell);
				let idx = shift ? domUtils.prevIndex(cells, tableCell) : domUtils.nextIndex(cells, tableCell);

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

		if (!event.shiftKey || event.keyCode !== 16) return;

		event.preventDefault();
		event.stopPropagation();

		if (this._shift || this._ref) return;
		const cell = domUtils.getParentElement(line, domUtils.isTableCell);
		if (cell) {
			this.selectCells(cell, true);
			return false;
		}
	},

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
	 */
	controllerAction(target) {
		if (target.getAttribute('disabled')) return;

		const command = target.getAttribute('data-command');
		const value = target.getAttribute('data-value');
		const option = target.getAttribute('data-option');

		switch (command) {
			case 'insert':
			case 'delete':
				this.editTable(value, option);
				break;
			case 'header':
				this.toggleHeader();
				break;
			case 'onsplit':
				this.selectMenu_split.open();
				break;
			case 'merge':
				this.mergeCells();
				break;
			case 'resize':
				this._maxWidth = !this._maxWidth;
				this.setTableStyle('width');
				this.controller_table.resetPosition();
				this.setCellControllerPosition(this._tdElement, this._shift);
				break;
			case 'layout':
				this._fixedColumn = !this._fixedColumn;
				this.setTableStyle('column');
				this.controller_table.resetPosition();
				this.setCellControllerPosition(this._tdElement, this._shift);
				break;
			case 'remove':
				const emptyDiv = this._element.parentNode;
				domUtils.removeItem(this._element);
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
		}

		this.history.push(false);
	},

	/**
	 * @override controller
	 */
	close() {
		this.__removeGlobalEvents();
		this._deleteStyleSelectedCells();
		this._toggleEditor(true);

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

		this._shift = false;
		this._selectedCells = null;
		this._selectedTable = null;
		this._ref = null;

		this._fixedCell = null;
		this._selectedCell = null;
		this._fixedCellName = null;
	},

	selectCells(tdElement, shift) {
		if (!this._shift && !this._ref) this.__removeGlobalEvents();

		this._shift = shift;
		this._fixedCell = tdElement;
		this._fixedCellName = tdElement.nodeName;
		this._selectedTable = domUtils.getParentElement(tdElement, 'TABLE');

		this._deleteStyleSelectedCells();
		domUtils.addClass(tdElement, 'se-table-selected-cell');

		if (!shift) {
			this._bindClose_move = this.eventManager.addGlobalEvent('mousemove', this.__globalEvents.on, false);
		} else {
			this._bindClose_key = this.eventManager.addGlobalEvent('keyup', this.__globalEvents.shiftOff, false);
			this._bindClose_down = this.eventManager.addGlobalEvent('mousedown', this.__globalEvents.on, false);
		}

		this._bindClose_up = this.eventManager.addGlobalEvent('mouseup', this.__globalEvents.off, false);
		this._bindClose_touch = this.eventManager.addGlobalEvent('touchmove', this.__globalEvents.touchOff, false);
	},

	setCellInfo(tdElement, reset) {
		const table = (this._element = this._selectedTable || domUtils.getParentElement(tdElement, 'TABLE'));

		if (/THEAD/i.test(table.firstElementChild.nodeName)) {
			domUtils.addClass(this.headerButton, 'active');
		} else {
			domUtils.removeClass(this.headerButton, 'active');
		}

		if (reset || this._physical_cellCnt === 0) {
			if (this._tdElement !== tdElement) {
				this._tdElement = tdElement;
				this._trElement = tdElement.parentNode;
			}

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
			this._current_rowSpan - this._trElement.cells[cellIndex].rowSpan - 1;

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
						domUtils.removeItem(this._element);
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
							i--, colSpan--;
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
		const removeCell = [];
		const removeSpanArr = [];

		for (let i = 0, len = this._rowCnt, row, insertIndex, cells, newCell, applySpan, cellColSpan; i < len; i++) {
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
		let cs = ref.ce - ref.cs + 1;
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

				for (let c = 0, cLen = cells.length, cell, rs; c < cLen; c++) {
					cell = cells[c];
					rs = cell.rowSpan - 1;
					if (rs > 0 && i + rs >= rowIndexFirst) {
						cell.rowSpan -= numbers.getOverlapRangeAtIndex(rowIndexFirst, rowIndexLast, i, i + rs);
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

		this.setActiveButton(true, false);
		this.setController(mergeCell);

		this.editor.focusEdge(mergeCell);
	},

	toggleHeader() {
		const headerButton = this.headerButton;
		const active = domUtils.hasClass(headerButton, 'active');
		const table = this._element;

		if (!active) {
			const header = domUtils.createElement('THEAD');
			header.innerHTML = '<tr>' + CreateCells('th', this._logical_cellCnt, false) + '</tr>';
			table.insertBefore(header, table.firstElementChild);
		} else {
			domUtils.removeItem(table.querySelector('thead'));
		}

		domUtils.toggleClass(headerButton, 'active');

		if (/TH/i.test(this._tdElement.nodeName)) {
			this._closeController();
		} else {
			this.setCellControllerPosition(this._tdElement, false);
		}
	},

	setTableStyle(styles) {
		if (styles.includes('width')) {
			let sizeIcon, text;
			if (!this._maxWidth) {
				sizeIcon = this.icons.expansion;
				text = this.maxText;
				this.columnFixedButton.style.display = 'none';
				domUtils.removeClass(this._element, 'se-table-size-100');
				domUtils.addClass(this._element, 'se-table-size-auto');
			} else {
				sizeIcon = this.icons.reduction;
				text = this.minText;
				this.columnFixedButton.style.display = 'block';
				domUtils.removeClass(this._element, 'se-table-size-auto');
				domUtils.addClass(this._element, 'se-table-size-100');
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

	setActiveButton(fixedCell, selectedCell) {
		if (/^TH$/i.test(fixedCell.nodeName)) {
			this.insertRowAboveButton.setAttribute('disabled', true);
		} else {
			this.insertRowAboveButton.removeAttribute('disabled');
		}

		if (!selectedCell || fixedCell === selectedCell) {
			this.splitButton.removeAttribute('disabled');
			this.mergeButton.setAttribute('disabled', true);
		} else {
			this.splitButton.setAttribute('disabled', true);
			this.mergeButton.removeAttribute('disabled');
		}
	},

	setController(tdElement) {
		if (!this.selection.get().isCollapsed && !this._selectedCell) {
			this._deleteStyleSelectedCells();
			return;
		}

		const tableElement = this._element || this._selectedTable || domUtils.getParentElement(tdElement, 'TABLE');
		this._maxWidth =
			domUtils.hasClass(tableElement, 'se-table-size-100') ||
			tableElement.style.width === '100%' ||
			(!tableElement.style.width && !domUtils.hasClass(tableElement, 'se-table-size-auto'));
		this._fixedColumn = domUtils.hasClass(tableElement, 'se-table-layout-fixed') || tableElement.style.tableLayout === 'fixed';
		this.setTableStyle(this._maxWidth ? 'width|column' : 'width');

		this.setCellInfo(tdElement, this._shift);
		this.controller_table.open(tableElement, null, this.close.bind(this));
		this.controller_cell.open(tdElement, this.cellControllerTop ? tableElement : null);
		this.component.select(tableElement, Table.key);
	},

	setCellControllerPosition(tdElement, reset) {
		this.setCellInfo(tdElement, reset);
		this.controller_cell.resetPosition(tdElement);
	},

	_deleteStyleSelectedCells() {
		if (this._selectedTable) {
			const selectedCells = this._selectedTable.querySelectorAll('.se-table-selected-cell');
			for (let i = 0, len = selectedCells.length; i < len; i++) {
				domUtils.removeClass(selectedCells[i], 'se-table-selected-cell');
			}
		}
	},

	_toggleEditor(enabled) {
		const wysiwyg = this.editor.frameContext.get('wysiwyg');
		wysiwyg.setAttribute('contenteditable', enabled);
		if (enabled) domUtils.removeClass(wysiwyg, 'se-disabled');
		else domUtils.addClass(wysiwyg, 'se-disabled');
	},

	_setMultiCells(startCell, endCell) {
		const rows = this._selectedTable.rows;
		this._deleteStyleSelectedCells();

		if (startCell === endCell) {
			domUtils.addClass(startCell, 'se-table-selected-cell');
			if (!this._shift) return;
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

					domUtils.addClass(cell, 'se-table-selected-cell');
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

			spanIndex = spanIndex.concat(rowSpanArr).sort(function (a, b) {
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

	_closeController() {
		this.controller_table.close();
		this.controller_cell.close();
	},

	__removeGlobalEvents() {
		if (this._bindClose_touch) this._bindClose_touch = this.eventManager.removeGlobalEvent(this._bindClose_touch);
		if (this._bindClose_move) this._bindClose_move = this.eventManager.removeGlobalEvent(this._bindClose_move);
		if (this._bindClose_key) this._bindClose_key = this.eventManager.removeGlobalEvent(this._bindClose_key);
		if (this._bindClose_down) this._bindClose_down = this.eventManager.removeGlobalEvent(this._bindClose_down);
		if (this._bindClose_up) this._bindClose_up = this.eventManager.removeGlobalEvent(this._bindClose_up);
	},

	constructor: Table
};

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

	this.editor.focusEdge(currentCell);
	this.setCellControllerPosition(currentCell, true);
	this.selectMenu_split.close();
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

	// let x_u = x < 5 ? 5 : (x > 9 ? 10 : x + 1);
	// let y_u = y < 5 ? 5 : (y > 9 ? 10 : y + 1);
	// this.tableUnHighlight.style.width = x_u + 'em';
	// this.tableUnHighlight.style.height = y_u + 'em';

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
		if (target === this._fixedCell) this._toggleEditor(true);
		else this._toggleEditor(false);
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
	} else if (this._bindClose_touch) {
		this._bindClose_touch = this.eventManager.removeGlobalEvent(this._bindClose_touch);
	}

	if (!this._fixedCell || !this._selectedTable) return;

	this.setActiveButton(this._fixedCell, this._selectedCell);
	this.setController(this._selectedCell || this._fixedCell);

	this._selectedCells = this._selectedTable.querySelectorAll('.se-table-selected-cell');
	if (this._selectedCell && this._fixedCell) this.editor.focusEdge(this._selectedCell);

	if (!this._shift) {
		this._fixedCell = null;
		this._selectedCell = null;
		this._fixedCellName = null;
	}
}

function OffCellShift() {
	if (!this._ref) this._closeController();
}

function OffCellTouch() {
	this.close();
}

function GetMaxColumns(table) {
	let maxColumns = 0;

	for (let row of table.rows) {
		let columnCount = 0;
		for (let cell of row.cells) {
			columnCount += cell.colSpan;
		}
		maxColumns = Math.max(maxColumns, columnCount);
	}

	return maxColumns;
}

// init element
function CreateSplitMenu(lang) {
	const menus = domUtils.createElement(
		'DIV',
		null,
		'<div title="' +
			lang.verticalSplit +
			'" aria-label="' +
			lang.verticalSplit +
			'">' +
			lang.verticalSplit +
			'</div>' +
			'<div title="' +
			lang.horizontalSplit +
			'" aria-label="' +
			lang.horizontalSplit +
			'">' +
			lang.horizontalSplit +
			'</div>'
	);

	return { items: ['vertical', 'horizontal'], menus: menus.querySelectorAll('div') };
}

function CreateHTML() {
	const html = `
	<div class="se-table-size">
		<div class="se-table-size-picker se-controller-table-picker"></div>
		<div class="se-table-size-highlighted"></div>
		<div class="se-table-size-unhighlighted"></div>
	</div>
	<div class="se-table-size-display">1 x 1</div>`;

	return domUtils.createElement('DIV', { class: 'se-dropdown se-selector-table' }, html);
}

function CreateHTML_controller_table(editor) {
	const lang = editor.lang;
	const icons = editor.icons;
	const html = `
	<div>
		<div class="se-btn-group">
			<button type="button" data-command="resize" class="se-btn se-tooltip _se_table_resize">
				${icons.expansion}
				<span class="se-tooltip-inner">
					<span class="se-tooltip-text">${lang.maxSize}</span>
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
			<button type="button" data-command="remove" class="se-btn se-tooltip">
				${icons.delete}
				<span class="se-tooltip-inner">
					<span class="se-tooltip-text">${lang.remove}</span>
				</span>
			</button>
		</div>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-table' }, html);
}

function CreateHTML_controller_cell(editor, cellControllerTop) {
	const lang = editor.lang;
	const icons = editor.icons;
	const html = `
    ${cellControllerTop ? '' : '<div class="se-arrow se-arrow-up"></div>'}
    <div class="se-btn-group">
        <button type="button" data-command="insert" data-value="row" data-option="up" class="se-btn se-tooltip _se_table_insert_row_a">
            ${icons.insert_row_above}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.insertRowAbove}</span>
            </span>
        </button>
        <button type="button" data-command="insert" data-value="row" data-option="down" class="se-btn se-tooltip _se_table_insert_row_b">
            ${icons.insert_row_below}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.insertRowBelow}</span>
            </span>
        </button>
        <button type="button" data-command="delete" data-value="row" class="se-btn se-tooltip">
            ${icons.delete_row}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.deleteRow}</span>
            </span>
        </button>
        <button type="button" data-command="merge" class="_se_table_merge_button se-btn se-tooltip" disabled>
            ${icons.merge_cell}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.mergeCells}</span>
            </span>
        </button>
    </div>
    <div class="se-btn-group" style="padding-top: 0;">
        <button type="button" data-command="insert" data-value="cell" data-option="left" class="se-btn se-tooltip">
            ${icons.insert_column_left}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.insertColumnBefore}</span>
            </span>
        </button>
        <button type="button" data-command="insert" data-value="cell" data-option="right" class="se-btn se-tooltip">
            ${icons.insert_column_right}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.insertColumnAfter}</span>
            </span>
        </button>
        <button type="button" data-command="delete" data-value="cell" class="se-btn se-tooltip">
            ${icons.delete_column}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.deleteColumn}</span>
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

export default Table;
