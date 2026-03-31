import { dom, numbers } from '../../../../helper';
import { SelectMenu } from '../../../../modules/ui';

import { CloneTable, CreateCellsHTML, InvalidateTableCache } from '../shared/table.utils';
import { CreateSplitMenu } from '../render/table.menu';

/**
 * @description Handles table cell operations including merging, splitting,
 * - and multi-cell selection management.
 */
export class TableCellService {
	#main;
	#$;
	#state;

	/**
	 * @param {import('../index').default} main Table index
	 * @param {{
	 * 	mergeButton: HTMLButtonElement,
	 * 	unmergeButton: HTMLButtonElement,
	 * 	splitButton: HTMLButtonElement,
	 * 	openCellMenuFunc: ()=>void,
	 * 	closeCellMenuFunc: ()=>void
	 * 	}} options Options for table service
	 */
	constructor(main, { mergeButton, unmergeButton, splitButton, openCellMenuFunc, closeCellMenuFunc }) {
		this.#main = main;
		this.#$ = main.$;
		this.#state = main.state;

		this.mergeButton = mergeButton;
		this.unmergeButton = unmergeButton;
		this.splitButton = splitButton;

		// members - SelectMenu - split
		const splitMenu = CreateSplitMenu(this.#$.lang);
		this.selectMenu_split = new SelectMenu(this.#$, { checkList: false, position: 'bottom-center', openMethod: openCellMenuFunc, closeMethod: closeCellMenuFunc });
		this.selectMenu_split.on(this.splitButton, this._OnSplitCells.bind(this));
		this.selectMenu_split.create(splitMenu.items, splitMenu.menus);
	}

	get #selectionService() {
		return this.#main.selectionService;
	}

	/**
	 * @description Opens the split menu.
	 */
	openSplitMenu() {
		this.selectMenu_split.open();
	}

	/**
	 * @description Merges the selected table cells into one cell by combining their contents and adjusting their row and column spans.
	 * - This method removes the selected cells, consolidates their contents, and applies the appropriate row and column spans to the merged cell.
	 * @param {HTMLTableCellElement[]} selectedCells Cells array
	 * @param {boolean} [skipPostProcess=false] - If `true`, skips table cloning, cell re-selection, history stack push, and rendering.
	 */
	mergeCells(selectedCells, skipPostProcess = false) {
		const originTable = selectedCells[0].closest('table');
		InvalidateTableCache(originTable);
		const { clonedTable, clonedSelectedCells } = skipPostProcess ? { clonedTable: originTable, clonedSelectedCells: selectedCells } : CloneTable(originTable, selectedCells);

		this.#main.setTableInfo(clonedTable);
		selectedCells = clonedSelectedCells;
		this.#main.setState('ref', null);
		this.#selectionService.setMultiCells(selectedCells[0], dom.query.findVisualLastCell(selectedCells));

		const ref = this.#state.ref;
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
				if (this.#$.format.isLine(ch[c]) && dom.check.isZeroWidth(ch[c].textContent)) {
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
			const rows = this.#state.trElements;
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
		originTable.replaceWith(clonedTable);
		this.#main._closeTableSelectInfo();

		this.#main._setController(mergeCell);

		this.#selectionService.focusCellEdge(mergeCell);
		this.#selectionService.initCellSelection(mergeCell);

		this.#main.setState('ref', null);
		this.#main.setState('selectedCells', [mergeCell]);
		this.#main.setCellInfo(mergeCell, true);

		this.setUnMergeButton();
		this.setMergeSplitButton();

		// history push
		this.#main.historyPush();
	}

	/**
	 * @description Unmerges a table cell that has been merged using rowspan and/or colspan.
	 * @param {HTMLTableCellElement[]} selectedCells - Cells array
	 * @param {boolean} [skipPostProcess=false] - If `true`, skips table cloning, cell re-selection, history stack push, and rendering.
	 */
	unmergeCells(selectedCells, skipPostProcess = false) {
		if (!selectedCells?.length) return;

		const originTable = selectedCells[0].closest('table');
		InvalidateTableCache(originTable);
		const { clonedTable, clonedSelectedCells } = skipPostProcess ? { clonedTable: originTable, clonedSelectedCells: selectedCells } : CloneTable(originTable, selectedCells);

		this.#main.setState('ref', null);
		this.#main.setTableInfo(clonedTable);
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

			this.#main.setCellInfo(cell, true);

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

		this.#main.setState('selectedCells', null);

		if (skipPostProcess) return;

		// replace table
		originTable.replaceWith(clonedTable);
		this.#main._closeTableSelectInfo();
		this.#main.setTableInfo(clonedTable);

		// set info
		if (firstCell !== lastCell) {
			lastCell = !newLastCell || lastCell.closest('tr').rowIndex > newLastCell.closest('tr').rowIndex || lastCell.cellIndex > newLastCell.cellIndex ? lastCell : newLastCell;
			this.#selectionService.setMultiCells(firstCell, lastCell);
			this.#main.setState('selectedCells', Array.from(table.querySelectorAll('.se-selected-table-cell')));
		} else {
			this.#main.setCellInfo(lastCell, true);
		}

		this.#selectionService.initCellSelection(firstCell);
		this.#main.setState('selectedCell', lastCell);

		this.setUnMergeButton();
		this.#main.controller_cell.resetPosition(lastCell);

		// history push
		this.#main.historyPush();
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
	 * @description Sets the merge/split button visibility.
	 */
	setMergeSplitButton() {
		if (!this.#state.ref) {
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
	setUnMergeButton() {
		if (this.findMergedCells(!this.#state.selectedCells?.length ? [this.#state.fixedCell] : this.#state.selectedCells).length > 0) {
			this.unmergeButton.disabled = false;
		} else {
			this.unmergeButton.disabled = true;
		}
	}

	/**
	 * @internal
	 * @description Splits a table cell either vertically or horizontally.
	 * @param {"vertical"|"horizontal"} direction The direction to split the cell.
	 */
	_OnSplitCells(direction) {
		InvalidateTableCache(this.#main._element);

		const vertical = direction === 'vertical';
		const currentCell = this.#state.tdElement;
		const rows = this.#state.trElements;
		const currentRow = this.#state.trElement;
		const index = this.#state.logical_cellIndex;
		const rowIndex = this.#state.rowIndex;
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

				for (let i = 0, len = this.#state.rowCnt, cells, colSpan; i < len; i++) {
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
								row: -1,
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
								cs: cell.colSpan,
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

				const physicalIndex = this.#state.physical_cellIndex;
				const cells = currentRow.cells;

				for (let c = 0, cLen = cells.length; c < cLen; c++) {
					if (c === physicalIndex) continue;
					cells[c].rowSpan += 1;
				}

				currentRow.parentNode.insertBefore(newRow, currentRow.nextElementSibling);
			}
		}

		this.selectMenu_split.close();
		this.#selectionService.focusCellEdge(currentCell);

		this.#selectionService.deleteStyleSelectedCells();
		this.#$.history.push(false);

		this.#main._setController(currentCell);
		this.#main.setState('selectedCell', currentCell);
		this.#main.setState('fixedCell', currentCell);
		if (!this.#state.selectedCells?.length) this.#main.setState('selectedCells', [currentCell]);
	}
}

export default TableCellService;
