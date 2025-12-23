import { dom, numbers, env } from '../../../../helper';

export class TableSelectionService {
	#main;

	#bindMultiOn;
	#bindMultiOff;
	#bindShiftOff;
	#bindTouchOff;
	#globalEvents;

	#fixedCellName = null;

	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main) {
		this.#main = main;

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
			resizeKeyDown: null,
		};
	}

	get #cellService() {
		return this.#main.cellService;
	}

	/**
	 * @description Selects a group of table cells and sets internal state related to multi-cell selection.
	 * @param {HTMLTableCellElement[]} cells - An array of table cell elements to be selected.
	 * @returns {{ fixedCell: HTMLTableCellElement, selectedCell: HTMLTableCellElement }} The fixed and selected cells.
	 */
	selectCells(cells) {
		const firstCell = cells[0];
		const lastCell = dom.query.findVisualLastCell(cells);

		this.#fixedCellName = firstCell.nodeName;

		this._setMultiCells(firstCell, lastCell);

		return {
			fixedCell: firstCell,
			selectedCell: lastCell,
		};
	}

	/**
	 * @internal
	 * @description Selects multiple table cells and applies selection styles.
	 * @param {Node} startCell The first cell in the selection.
	 * @param {Node} endCell The last cell in the selection.
	 */
	_setMultiCells(startCell, endCell) {
		const rows = this.#main.selectedTable.rows;
		this.deleteStyleSelectedCells();

		dom.utils.addClass(startCell, 'se-selected-table-cell');

		if (startCell === endCell && !this.#main._shiftKey) {
			return;
		}

		let findSelectedCell = true;
		let spanIndex = [];
		let rowSpanArr = [];
		const ref = (this.#main._ref = { _i: 0, cs: null, ce: null, rs: null, re: null });

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
						row: -1,
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
	 * @description Selects cells in a table, handling single and multi-cell selection, and managing shift key behavior for extended selection.
	 * @param {HTMLTableCellElement} tdElement The target table cell (`<td>`) element that is being selected.
	 * @param {boolean} shift A flag indicating whether the shift key is held down for multi-cell selection.
	 * If `true`, the selection will extend to include adjacent cells, otherwise it selects only the provided cell.
	 */
	initCellSelection(tdElement, shift) {
		if (!this.#main._shiftKey && !this.#main._ref) this.#removeGlobalEvents();

		this.#main._shiftKey = shift;
		this.#main.fixedCell = tdElement;
		if (!this.#main.selectedCells?.length) this.#main.selectedCells = [tdElement];
		this.#fixedCellName = tdElement.nodeName;
		this.#main.selectedTable = dom.query.getParentElement(tdElement, 'TABLE');

		this.deleteStyleSelectedCells();
		dom.utils.addClass(tdElement, 'se-selected-cell-focus');

		if (!shift) {
			this.#globalEvents.on = this.#main.eventManager.addGlobalEvent('mousemove', this.#bindMultiOn, false);
		} else {
			this.#globalEvents.shiftOff = this.#main.eventManager.addGlobalEvent('keyup', this.#bindShiftOff, false);
			this.#globalEvents.on = this.#main.eventManager.addGlobalEvent('mousedown', this.#bindMultiOn, false);
		}

		this.#globalEvents.off = this.#main.eventManager.addGlobalEvent('mouseup', this.#bindMultiOff, false);
		this.#globalEvents.touchOff = this.#main.eventManager.addGlobalEvent('touchmove', this.#bindTouchOff, false);
	}

	/**
	 * @description Deletes styles from selected table cells.
	 */
	deleteStyleSelectedCells() {
		dom.utils.removeClass([this.#main.fixedCell, this.#main.selectedCell], 'se-selected-cell-focus');
		const table = this.#main.fixedCell?.closest('table');
		if (table) {
			const selectedCells = table.querySelectorAll('.se-selected-table-cell');
			for (let i = 0, len = selectedCells.length; i < len; i++) {
				dom.utils.removeClass(selectedCells[i], 'se-selected-table-cell');
			}
		}
	}

	/**
	 * @description Restores styles for selected table cells.
	 */
	recallStyleSelectedCells() {
		if (this.#main.selectedCells) {
			const selectedCells = this.#main.selectedCells;
			for (let i = 0, len = selectedCells.length; i < len; i++) {
				dom.utils.addClass(selectedCells[i], 'se-selected-table-cell');
			}
		}
	}

	/**
	 * @description Focus cell
	 * @param {HTMLElement} cell Target node
	 */
	_focusEdge(cell) {
		if (!env.isMobile) this.#main.editor.focusEdge(cell);
	}

	/**
	 * @description Handles multi-selection of table cells.
	 * @param {MouseEvent} e The mouse event.
	 */
	#OnCellMultiSelect(e) {
		this.#main.editor._preventBlur = true;
		const target = /** @type {HTMLTableCellElement} */ (dom.query.getParentElement(dom.query.getEventTarget(e), dom.check.isTableCell));

		if (this.#main._shiftKey) {
			if (target === this.#main.fixedCell) {
				this.#main._shiftKey = false;
				this.deleteStyleSelectedCells();
				this.#main._editorEnable(true);
				this.#removeGlobalEvents();
				return;
			} else {
				this.#main._editorEnable(false);
			}
		} else if (!this.#main._ref) {
			if (target === this.#main.fixedCell) return;
			else this.#main._editorEnable(false);
		}

		if (!target || target === this.#main.selectedCell || this.#fixedCellName !== target.nodeName || this.#main.selectedTable !== dom.query.getParentElement(target, 'TABLE')) {
			return;
		}

		this._setMultiCells(this.#main.fixedCell, (this.#main.selectedCell = target));
	}

	/**
	 * @description Stops multi-selection of table cells.
	 * @param {MouseEvent} e The mouse event.
	 */
	#OffCellMultiSelect(e) {
		e.stopPropagation();

		if (!this.#main._shiftKey) {
			this.#main._editorEnable(true);
			this.#removeGlobalEvents();
		} else {
			this.#globalEvents.touchOff &&= this.#main.eventManager.removeGlobalEvent(this.#globalEvents.touchOff);
		}

		if (!this.#main.fixedCell || !this.#main.selectedTable) return;

		this.#cellService.setMergeSplitButton();
		this.#main.selectedCells = Array.from(this.#main.selectedTable.querySelectorAll('.se-selected-table-cell'));

		if (this.#main._shiftKey) return;

		if (this.#main.fixedCell && this.#main.selectedCell) {
			this._focusEdge(this.#main.fixedCell);
			if (this.#main.fixedCell === this.#main.selectedCell) {
				dom.utils.removeClass(this.#main.fixedCell, 'se-selected-table-cell');
			}
		}

		const displayCell = this.#main.selectedCells?.length > 0 ? this.#main.selectedCell : this.#main.fixedCell;
		this.#main._setController(displayCell);
	}

	/**
	 * @description Handles the removal of shift-based selection.
	 */
	#OffCellShift() {
		if (!this.#main._ref) {
			this.#main._closeController();
		} else {
			this.#removeGlobalEvents();
			this.#main._editorEnable(true);

			this._focusEdge(this.#main.fixedCell);

			const displayCell = this.#main.selectedCells?.length > 0 ? this.#main.selectedCell : this.#main.fixedCell;
			this.#main._setController(displayCell);
		}
	}

	/**
	 * @description Handles the removal of touch-based selection.
	 */
	#OffCellTouch() {
		this.#main.resetInfo();
	}

	/**
	 * @description Removes global event listeners and resets resize-related properties.
	 */
	#removeGlobalEvents() {
		this.#main.ui.disableBackWrapper();
		const globalEvents = this.#globalEvents;
		for (const k in globalEvents) {
			globalEvents[k] &&= this.#main.eventManager.removeGlobalEvent(globalEvents[k]);
		}
	}

	init() {
		this.#removeGlobalEvents();
	}
}

export default TableSelectionService;
