import { dom } from '../../../../helper';
import { CloneTable, InvalidateTableCache } from '../shared/table.utils';

/**
 * @description Table clipboard service for handling copy and paste operations within tables.
 */
export class TableClipboardService {
	#main;
	#state;

	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main) {
		this.#main = main;
		this.#state = main.state;
	}

	get #selectionService() {
		return this.#main.selectionService;
	}

	get #gridService() {
		return this.#main.gridService;
	}

	get #cellService() {
		return this.#main.cellService;
	}

	/**
	 * @description Creates the table properties controller.
	 * @param {ClipboardEvent} e - Event object
	 * @param {HTMLElement} container - The container element
	 * @param {NodeListOf<HTMLTableCellElement>} selectedCells - The selected table cells
	 */
	copySelectedTableCells(e, container, selectedCells) {
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

	/**
	 * @description Updates the target table's cells with the data from the copied table.
	 * @param {HTMLTableElement} copyTable The table containing the copied data.
	 * @param {HTMLTableCellElement} targetTD The starting cell in the target table where data will be pasted.
	 * @returns {HTMLTableCellElement[]} The array of cells that were updated with pasted data.
	 */
	pasteTableCellMatrix(copyTable, targetTD) {
		if (!copyTable || !targetTD) return;

		InvalidateTableCache(targetTD.closest('table'));

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
			logicalCellCnt: logicalColCount,
		};

		// --- target info ---
		this.#selectionService.deleteStyleSelectedCells();
		const originTable = targetTD.closest('table');
		const { clonedTable, clonedSelectedCells } = CloneTable(originTable, [targetTD]);

		const targetTable = clonedTable;
		targetTD = clonedSelectedCells[0];
		let targetRows = targetTable.rows;
		this.#main.setTableInfo(targetTable);
		this.#main.setCellInfo(targetTD, true);

		const targetInfo = {
			physicalCellCnt: this.#state.physical_cellCnt,
			logicalCellCnt: this.#state.logical_cellCnt,
			rowCnt: this.#state.rowCnt,
			rowIndex: this.#state.rowIndex,
			physicalCellIndex: this.#state.physical_cellIndex,
			logicalCellIndex: this.#state.logical_cellIndex,
			currentColSpan: this.#state.current_colSpan,
			currentRowSpan: this.#state.current_rowSpan,
		};

		// --- [expand] target table ---
		const addRowCnt = copyInfo.rowCnt - (targetInfo.rowCnt - (targetInfo.rowIndex + 1)) - 1;
		const addColCnt = copyInfo.logicalCellCnt - (targetInfo.logicalCellCnt - (targetInfo.logicalCellIndex + 1)) - 1;
		targetInfo.rowCnt += addRowCnt;
		targetInfo.logicalCellCnt += addColCnt;
		targetInfo.physicalCellCnt += addColCnt;

		if (addRowCnt > 0 || addColCnt > 0) {
			const lastRow = targetRows[targetRows.length - 1];
			const lastCell = lastRow.cells[lastRow.cells.length - 1];
			for (let i = 0; i < addRowCnt; i++) {
				this.#gridService.editRow('down', lastCell);
			}
			for (let i = 0; i < addColCnt; i++) {
				this.#gridService.editColumn('right', lastCell);
			}

			this.#main.setState('trElements', (targetRows = targetTable.rows));
		}

		// --- [Un_merge] cells ---
		const startRowIndex = targetInfo.rowIndex;
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
			this.#cellService.unmergeCells(unmergeCells, true);
			this.#main.setState('trElements', (targetRows = targetTable.rows));
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

				for (let targetR = targetInfo.rowIndex + r, tRowCnt = targetR + rs, rowOffset = 0; targetR < tRowCnt; targetR++, rowOffset++) {
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
				this.#main.setState('ref', null);
				this.#main.setState('trElements', targetTable.rows);
				this.#cellService.mergeCells(mc, true);
			}
			this.#main.setState('trElements', (targetRows = targetTable.rows));
		}

		// --- [result] paste cell data ---
		const selectedCells = [];
		const rowSpanMap = [];
		for (let r = 0; r < copyInfo.rowCnt; r++) {
			const tr = targetRows[targetInfo.rowIndex + r];
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
		this.#main._closeTableSelectInfo();
		this.#main.setTableInfo(targetTable);

		// update button state
		this.#cellService.setMergeSplitButton();
		this.#cellService.setUnMergeButton();
		this.#selectionService.focusCellEdge(selectedCells[0]);

		// history push
		this.#main.historyPush();

		return selectedCells;
	}
}

export default TableClipboardService;
