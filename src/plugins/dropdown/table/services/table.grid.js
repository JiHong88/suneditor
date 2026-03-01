import { dom, numbers } from '../../../../helper';
import { SelectMenu } from '../../../../modules/ui';

import { CreateCellsHTML, CreateCellsString, InvalidateTableCache } from '../shared/table.utils';
import { CreateColumnMenu, CreateRowMenu } from '../render/table.menu';

/**
 * @description Manages table grid operations including row and column insertion, deletion, and header toggling.
 */
export class TableGridService {
	#main;
	#$;
	#state;

	/**
	 * @param {import('../index').default} main Table index
	 * @param {{
	 * 	columnButton: HTMLButtonElement,
	 * 	rowButton: HTMLButtonElement,
	 * 	openCellMenuFunc: ()=>void,
	 * 	closeCellMenuFunc: ()=>void
	 * 	}} options Options for table service
	 */
	constructor(main, { columnButton, rowButton, openCellMenuFunc, closeCellMenuFunc }) {
		this.#main = main;
		this.#$ = main.$;
		this.#state = main.state;

		// members - SelectMenu - column
		const columnMenu = CreateColumnMenu(this.#$.lang, this.#$.icons);
		this.selectMenu_column = new SelectMenu(this.#$, { checkList: false, position: 'bottom-center', openMethod: openCellMenuFunc, closeMethod: closeCellMenuFunc });
		this.selectMenu_column.on(columnButton, this.#OnColumnEdit.bind(this));
		this.selectMenu_column.create(columnMenu.items, columnMenu.menus);

		// members - SelectMenu - row
		const rownMenu = CreateRowMenu(this.#$.lang, this.#$.icons);
		this.selectMenu_row = new SelectMenu(this.#$, { checkList: false, position: 'bottom-center', openMethod: openCellMenuFunc, closeMethod: closeCellMenuFunc });
		this.selectMenu_row.on(rowButton, this.#OnRowEdit.bind(this));
		this.selectMenu_row.create(rownMenu.items, rownMenu.menus);
	}

	get #selectionService() {
		return this.#main.selectionService;
	}

	/**
	 * @description Opens the column menu.
	 */
	openColumnMenu() {
		this.selectMenu_column.open();
	}

	/**
	 * @description Opens the row menu.
	 */
	openRowMenu() {
		this.selectMenu_row.menus[0].style.display = this.selectMenu_row.menus[1].style.display = /^TH$/i.test(this.#state.tdElement?.nodeName) ? 'none' : '';
		this.selectMenu_row.open();
	}

	/**
	 * @description Edits the table by adding, removing, or modifying rows and cells, based on the provided options. Supports both single and multi-cell/row editing.
	 * @param {"row"|"cell"} type The type of element to edit (`row` or `cell`).
	 * @param {?"up"|"down"|"left"|"right"} option The action to perform: `up`, `down`, `left`, `right`, or `null` for removing.
	 */
	editTable(type, option) {
		const table = this.#main._element;
		const isRow = type === 'row';

		if (isRow) {
			const tableAttr = this.#state.trElement.parentElement;
			if (/^THEAD$/i.test(tableAttr.nodeName)) {
				if (option === 'up') {
					return;
				} else if (!tableAttr.nextElementSibling || !/^TBODY$/i.test(tableAttr.nextElementSibling.nodeName)) {
					if (!option) {
						dom.utils.removeItem(this.#state.figureElement);
						this.#main._closeTableSelectInfo();
					} else {
						table.innerHTML += '<tbody><tr>' + CreateCellsString('td', this.#state.logical_cellCnt) + '</tr></tbody>';
					}
					return;
				}
			}
		}

		// multi
		if (this.#state.ref) {
			const positionCell = this.#state.tdElement;
			const selectedCells = this.#state.selectedCells;
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
						this.#main.setCellInfo(removeCells[i], true);
						this.editRow(option);
					}
				} else {
					// edit row
					this.#main.setCellInfo(option === 'up' ? selectedCells[0] : selectedCells.at(-1), true);
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
						this.#main.setCellInfo(removeCells[i], true);
						this.editColumn(option);
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

					this.#main.setCellInfo(option === 'left' ? selectedCells[0] : rightCell || selectedCells[0], true);
					this.editColumn(option, null, positionCell);
				}
			}

			if (!option) this.#main.resetInfo();
		} // one
		else {
			this[isRow ? 'editRow' : 'editColumn'](option);
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
	 * @description Edits a table cell(column), either adding, removing, or modifying the cell based on the provided option.
	 * @param {?string} option The action to perform on the cell (`left`|`right`|`null`)
	 * - `null`: to remove the cell
	 * - `left`: to insert a new cell to the left
	 * - `right`: to insert a new cell to the right
	 * @param {?HTMLTableCellElement} [targetCell] Target cell, (default: current selected cell)
	 * @param {?HTMLTableCellElement} [positionResetElement] The element to reset the position of (optional). This can be the cell that triggered the column edit.
	 * @returns {HTMLTableCellElement} Target table cell
	 */
	editColumn(option, targetCell, positionResetElement) {
		if (targetCell) this.#main.setCellInfo(targetCell, true);

		const remove = !option;
		const left = option === 'left';
		const colSpan = this.#state.current_colSpan;
		const cellIndex = this.#state.logical_cellIndex + (remove || left ? 0 : colSpan + 1);

		const rows = this.#state.trElements;
		let rowSpanArr = [];
		let spanIndex = [];
		let passCell = 0;
		let insertIndex;
		const removeCell = [];
		const removeSpanArr = [];

		for (let i = 0, len = this.#state.rowCnt, row, cells, newCell, applySpan, cellColSpan; i < len; i++) {
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
							row: -1,
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
							rs: i + rs,
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

		const colgroup = this.#main._element.querySelector('colgroup');
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

			this.#main._closeController();
		} else {
			this.#main._setCellControllerPosition(positionResetElement || this.#state.tdElement, true);
		}

		return positionResetElement || this.#state.tdElement;
	}

	/**
	 * @description Edits a table row, either adding, removing, the row
	 * @param {?string} option The action to perform on the row (`up`|`down`|`null`)
	 * - `null`: to remove the row
	 * - `up`: to insert the row up
	 * - `down`: to insert the row down, or `null` to remove.
	 * @param {?HTMLTableCellElement} [targetCell] Target cell, (default: current selected cell)
	 * @param {?HTMLTableCellElement} [positionResetElement] The element to reset the position of (optional). This can be the cell that triggered the row edit.
	 */
	editRow(option, targetCell, positionResetElement) {
		this.#selectionService.deleteStyleSelectedCells();
		if (targetCell) this.#main.setCellInfo(targetCell, true);

		const remove = !option;
		const up = option === 'up';
		const originRowIndex = this.#state.rowIndex;
		const rowIndex = remove || up ? originRowIndex : originRowIndex + this.#state.current_rowSpan + 1;
		const sign = remove ? -1 : 1;

		const rows = this.#state.trElements;
		let cellCnt = this.#state.logical_cellCnt;

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
						spanCells.push({ cell: /** @type {HTMLTableCellElement} */ (cell.cloneNode(true)), index: logcalIndex });
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

			this.#main._element.deleteRow(rowIndex);
		} else {
			this.insertBodyRow(this.#main._element, rowIndex, cellCnt);
		}

		if (!remove) {
			this.#main._setCellControllerPosition(positionResetElement || this.#state.tdElement, true);
		} else {
			this.#main._closeController();
		}
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
	 * @description Handles column operations such as insert and delete.
	 * @param {"insert-left"|"insert-right"|"delete"} command The column operation to perform.
	 */
	#OnColumnEdit(command) {
		InvalidateTableCache(this.#main._element);

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

		this.#main.historyPush();
	}

	/**
	 * @description Handles row operations such as insert and delete.
	 * @param {"insert-above"|"insert-below"|"delete"} command The row operation to perform.
	 */
	#OnRowEdit(command) {
		InvalidateTableCache(this.#main._element);

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

		this.#main.historyPush();
	}
}

export default TableGridService;
