import { dom, numbers, env } from '../../../../helper';
import { refCache } from '../shared/table.utils';

/**
 * @param {HTMLTableCellElement} startCell
 * @param {HTMLTableCellElement} endCell
 * @returns {string}
 */
function getCacheKey(startCell, endCell) {
	const startRow = /** @type {HTMLTableRowElement} */ (startCell.parentNode);
	const endRow = /** @type {HTMLTableRowElement} */ (endCell.parentNode);
	return `${startRow.rowIndex},${startCell.cellIndex}-${endRow.rowIndex},${endCell.cellIndex}`;
}

/**
 * @description Manages table cell selection including multi-cell range selection with keyboard and mouse events.
 */
export class TableSelectionService {
	#main;
	#$;
	#state;

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
		this.#$ = main.$;
		this.#state = main.state;

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

		this.setMultiCells(firstCell, lastCell);

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
	setMultiCells(startCell, endCell) {
		const table = this.#state.selectedTable;
		const rows = table.rows;
		this.deleteStyleSelectedCells();

		dom.utils.addClass(startCell, 'se-selected-table-cell');

		if (startCell === endCell && !this.#state.isShiftPressed) {
			return;
		}

		// try cache
		const cacheKey = getCacheKey(/** @type {HTMLTableCellElement} */ (startCell), /** @type {HTMLTableCellElement} */ (endCell));
		let tableCache = refCache.get(table);
		const cachedRef = tableCache?.get(cacheKey);

		if (cachedRef) {
			this.#main.setState('ref', cachedRef);
			this.#applySelectionStyles(rows, cachedRef);
			return;
		}

		// calculate ref
		const ref = this.#calculateRef(rows, startCell, endCell);
		this.#main.setState('ref', ref);

		// cache ref
		if (!tableCache) {
			tableCache = new Map();
			refCache.set(table, tableCache);
		}
		tableCache.set(cacheKey, ref);

		// apply styles
		this.#applySelectionStyles(rows, ref);
	}

	/**
	 * @param {HTMLCollectionOf<HTMLTableRowElement>} rows
	 * @param {Node} startCell
	 * @param {Node} endCell
	 * @returns {{_i: number, cs: number|null, ce: number|null, rs: number|null, re: number|null}}
	 */
	#calculateRef(rows, startCell, endCell) {
		let findSelectedCell = true;
		let spanIndex = [];
		let rowSpanArr = [];
		const ref = { _i: 0, cs: null, ce: null, rs: null, re: null };

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
				} else {
					const newCs = ref.cs < logcalIndex ? ref.cs : logcalIndex;
					const newCe = ref.ce > logcalIndex + cs ? ref.ce : logcalIndex + cs;
					const newRs = ref.rs < i ? ref.rs : i;
					const newRe = ref.re > i + rs ? ref.re : i + rs;

					if (numbers.getOverlapRangeAtIndex(ref.cs, ref.ce, logcalIndex, logcalIndex + cs) && numbers.getOverlapRangeAtIndex(ref.rs, ref.re, i, i + rs)) {
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
					}
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

			spanIndex = spanIndex.concat(rowSpanArr).sort((a, b) => a.index - b.index);
			rowSpanArr = [];
		}

		return ref;
	}

	/**
	 * @param {HTMLCollectionOf<HTMLTableRowElement>} rows
	 * @param {{cs: number|null, ce: number|null, rs: number|null, re: number|null}} ref
	 */
	#applySelectionStyles(rows, ref) {
		let spanIndex = [];
		let rowSpanArr = [];

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

				if (numbers.getOverlapRangeAtIndex(ref.cs, ref.ce, logcalIndex, logcalIndex + cs) && numbers.getOverlapRangeAtIndex(ref.rs, ref.re, i, i + rs)) {
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

			spanIndex = spanIndex.concat(rowSpanArr).sort((a, b) => a.index - b.index);
			rowSpanArr = [];
		}
	}

	/**
	 * @description Initializes cell selection state and applies visual styles.
	 * Sets up the fixed cell, selected cells array, and table reference.
	 * @param {HTMLTableCellElement} tdElement The target table cell element.
	 */
	initCellSelection(tdElement) {
		this.#main.setState('fixedCell', tdElement);
		if (!this.#state.selectedCells?.length) this.#main.setState('selectedCells', [tdElement]);
		this.#fixedCellName = tdElement.nodeName;
		this.#main.setState('selectedTable', dom.query.getParentElement(tdElement, 'TABLE'));

		this.deleteStyleSelectedCells();
		dom.utils.addClass(tdElement, 'se-selected-cell-focus');
	}

	/**
	 * @description Starts cell selection with global event listeners for drag/shift selection.
	 * **WARNING**: Registers global events (mousemove/mousedown, mouseup, touchmove).
	 * These events are auto-removed on mouseup/touchmove, or call `#removeGlobalEvents()` manually.
	 * @param {HTMLTableCellElement} tdElement The target table cell element.
	 * @param {boolean} shift If `true`, enables shift+click range selection mode.
	 */
	startCellSelection(tdElement, shift) {
		if (!this.#state.isShiftPressed && !this.#state.ref) this.#removeGlobalEvents();

		this.#main.setState('isShiftPressed', shift);
		this.initCellSelection(tdElement);

		if (!shift) {
			this.#globalEvents.on = this.#$.eventManager.addGlobalEvent('mousemove', this.#bindMultiOn, false);
		} else {
			this.#globalEvents.shiftOff = this.#$.eventManager.addGlobalEvent('keyup', this.#bindShiftOff, false);
			this.#globalEvents.on = this.#$.eventManager.addGlobalEvent('mousedown', this.#bindMultiOn, false);
		}

		this.#globalEvents.off = this.#$.eventManager.addGlobalEvent('mouseup', this.#bindMultiOff, false);
		this.#globalEvents.touchOff = this.#$.eventManager.addGlobalEvent('touchmove', this.#bindTouchOff, false);
	}

	/**
	 * @description Deletes styles from selected table cells.
	 */
	deleteStyleSelectedCells() {
		dom.utils.removeClass([this.#state.fixedCell, this.#state.selectedCell], 'se-selected-cell-focus');
		const table = this.#state.fixedCell?.closest('table');
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
		if (this.#state.selectedCells) {
			const selectedCells = this.#state.selectedCells;
			for (let i = 0, len = selectedCells.length; i < len; i++) {
				dom.utils.addClass(selectedCells[i], 'se-selected-table-cell');
			}
		}
	}

	/**
	 * @description Focus cell
	 * @param {HTMLElement} cell Target node
	 */
	focusCellEdge(cell) {
		if (!env.isMobile) this.#$.focusManager.focusEdge(cell);
	}

	/**
	 * @description Handles multi-selection of table cells.
	 * @param {MouseEvent} e The mouse event.
	 */
	#OnCellMultiSelect(e) {
		this.#$.store.set('_preventBlur', true);
		const target = /** @type {HTMLTableCellElement} */ (dom.query.getParentElement(dom.query.getEventTarget(e), dom.check.isTableCell));

		if (this.#state.isShiftPressed) {
			if (target === this.#state.fixedCell) {
				this.#main.setState('isShiftPressed', false);
				this.deleteStyleSelectedCells();
				this.#main._editorEnable(true);
				this.#removeGlobalEvents();
				return;
			} else {
				this.#main._editorEnable(false);
			}
		} else if (!this.#state.ref) {
			if (target === this.#state.fixedCell) return;
			else this.#main._editorEnable(false);
		}

		if (!target || target === this.#state.selectedCell || this.#fixedCellName !== target.nodeName || this.#state.selectedTable !== dom.query.getParentElement(target, 'TABLE')) {
			return;
		}

		this.#main.setState('selectedCell', target);
		this.setMultiCells(this.#state.fixedCell, this.#state.selectedCell);
	}

	/**
	 * @description Stops multi-selection of table cells.
	 * @param {MouseEvent} e The mouse event.
	 */
	#OffCellMultiSelect(e) {
		e.stopPropagation();

		if (!this.#state.isShiftPressed) {
			this.#main._editorEnable(true);
			this.#removeGlobalEvents();
		} else {
			this.#globalEvents.touchOff &&= this.#$.eventManager.removeGlobalEvent(this.#globalEvents.touchOff);
		}

		const fixedCell = this.#state.fixedCell;
		if (!fixedCell || !this.#state.selectedTable) return;

		this.#cellService.setMergeSplitButton();
		this.#main.setState('selectedCells', Array.from(this.#state.selectedTable.querySelectorAll('.se-selected-table-cell')));

		if (this.#state.isShiftPressed) return;

		if (fixedCell && this.#state.selectedCell) {
			this.focusCellEdge(fixedCell);
			if (fixedCell === this.#state.selectedCell) {
				dom.utils.removeClass(fixedCell, 'se-selected-table-cell');
			}
		}

		const displayCell = this.#state.selectedCells?.length > 0 ? this.#state.selectedCell : fixedCell;
		this.#main._setController(displayCell);
	}

	/**
	 * @description Handles the removal of shift-based selection.
	 */
	#OffCellShift() {
		if (!this.#state.ref) {
			this.#main._closeController();
		} else {
			this.#removeGlobalEvents();
			this.#main._editorEnable(true);

			this.focusCellEdge(this.#state.fixedCell);

			const displayCell = this.#state.selectedCells?.length > 0 ? this.#state.selectedCell : this.#state.fixedCell;
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
		this.#$.ui.disableBackWrapper();
		const globalEvents = this.#globalEvents;
		for (const k in globalEvents) {
			globalEvents[k] &&= this.#$.eventManager.removeGlobalEvent(globalEvents[k]);
		}
	}

	/**
	 * @description Initialize the selection service (remove global events).
	 */
	init() {
		this.#removeGlobalEvents();
	}
}

export default TableSelectionService;
