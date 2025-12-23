import { dom, numbers, converter, env, keyCodeMap } from '../../../../helper';
import { _DragHandle } from '../../../../modules/utils';

import * as Constants from '../shared/table.constants';
import { CheckCellEdge, CheckRowEdge } from '../shared/table.utils';

const { _w } = env;

export class TableResizeService {
	#main;
	#state;

	#globalEvents;

	#resizing = false;
	#resizeLine = null;
	#resizeLinePrev = null;

	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main) {
		this.#main = main;
		this.#state = main.state;

		// member - global events
		this.#globalEvents = {
			resize: null,
			resizeStop: null,
			resizeKeyDown: null,
		};
	}

	get #selectionService() {
		return this.#main.selectionService;
	}

	/**
	 * @description Checks if the table is currently being resized.
	 * @returns {boolean}
	 */
	isResizing() {
		return this.#resizing;
	}

	onResizeGuide(event, target) {
		const cellEdge = CheckCellEdge(event, target);
		if (cellEdge.is) {
			if (this.#main._element) this.#main._element.style.cursor = '';
			this.#removeGlobalEvents();
			if (this.#resizeLine?.style.display === 'block') this.#resizeLine.style.display = 'none';
			this.#resizeLine = this.#main.frameContext.get('wrapper').querySelector(Constants.RESIZE_CELL_CLASS);
			this.#setResizeLinePosition(dom.query.getParentElement(target, dom.check.isTable), target, this.#resizeLine, cellEdge.isLeft);
			this.#resizeLine.style.display = 'block';
			return false;
		}

		const rowEdge = CheckRowEdge(event, target);
		if (rowEdge.is) {
			this.#removeGlobalEvents();
			this.#main._element = dom.query.getParentElement(target, dom.check.isTable);
			this.#main._element.style.cursor = 'ns-resize';
			if (this.#resizeLine?.style.display === 'block') this.#resizeLine.style.display = 'none';
			this.#resizeLine = this.#main.frameContext.get('wrapper').querySelector(Constants.RESIZE_ROW_CLASS);
			this.#setResizeRowPosition(dom.query.getParentElement(target, dom.check.isTable), target, this.#resizeLine);
			this.#resizeLine.style.display = 'block';
			return false;
		}
	}

	offResizeGuide() {
		this.#hideResizeLine();
	}

	readyResizeFromEdge(event, target) {
		const cellEdge = CheckCellEdge(event, target);
		if (cellEdge.is) {
			try {
				this.#selectionService.deleteStyleSelectedCells();
				this.#main.setCellInfo(target, true);
				const colIndex = this.#state.logical_cellIndex + this.#state.current_colSpan - (cellEdge.isLeft ? 1 : 0);

				// ready
				this.#main.ui.enableBackWrapper('ew-resize');
				this.#resizeLine ||= this.#main.frameContext.get('wrapper').querySelector(Constants.RESIZE_CELL_CLASS);
				this.#resizeLinePrev = this.#main.frameContext.get('wrapper').querySelector(Constants.RESIZE_CELL_PREV_CLASS);

				// select figure
				if (colIndex < 0 || colIndex === this.#state.logical_cellCnt - 1) {
					this._startFigureResizing(cellEdge.startX, colIndex < 0);
					this.#main._editorEnable(false);
					return false;
				}

				const col = this.#main._element.querySelector('colgroup').querySelectorAll('col')[colIndex < 0 ? 0 : colIndex];
				this._startCellResizing(col, cellEdge.startX, numbers.get(_w.getComputedStyle(col).width, Constants.CELL_DECIMAL_END), cellEdge.isLeft);
				this.#main._editorEnable(false);
			} catch (err) {
				console.warn('[SUNEDITOR.plugins.table.error]', err);
				this.#main._editorEnable(true);
				this.#removeGlobalEvents();
			} finally {
				this.#main.setState('fixedCell', null);
				this.#main.setState('selectedCell', null);
				this.#main.controller_table.hide();
				this.#main.controller_cell.hide();
			}

			return false;
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

				this.#selectionService.deleteStyleSelectedCells();
				this.#main.setRowInfo(row);

				// ready
				this.#main.ui.enableBackWrapper('ns-resize');
				this.#resizeLine ||= this.#main.frameContext.get('wrapper').querySelector(Constants.RESIZE_ROW_CLASS);
				this.#resizeLinePrev = this.#main.frameContext.get('wrapper').querySelector(Constants.RESIZE_ROW_PREV_CLASS);

				this._startRowResizing(row, rowEdge.startY, numbers.get(_w.getComputedStyle(row).height, Constants.CELL_DECIMAL_END));
				this.#main._editorEnable(false);
			} catch (err) {
				console.warn('[SUNEDITOR.plugins.table.error]', err);
				this.#main._editorEnable(true);
				this.#removeGlobalEvents();
			} finally {
				this.#main.setState('fixedCell', null);
				this.#main.setState('selectedCell', null);
				this.#main.controller_table.hide();
				this.#main.controller_cell.hide();
			}

			return false;
		}
	}

	/**
	 * @description Converts the width of <col> elements to percentages.
	 * @param {HTMLTableElement} target - The target table element.
	 */
	#resizePercentCol(target) {
		const cols = target.querySelector('colgroup').querySelectorAll('col');
		const tableTotalWidth = target.offsetWidth;

		cols.forEach((col) => {
			const colWidthString = col.style.width;

			if (!colWidthString.endsWith('%')) {
				const pixelWidth = col.offsetWidth || numbers.get(colWidthString, Constants.CELL_DECIMAL_END);
				const percentage = (pixelWidth / tableTotalWidth) * 100;
				col.style.width = percentage + '%';
			}
		});
	}

	/**
	 * @internal
	 * @description Starts resizing a table cell.
	 * @param {HTMLElement} col The column element.
	 * @param {number} startX The starting X position.
	 * @param {number} startWidth The initial width of the column.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	_startCellResizing(col, startX, startWidth, isLeftEdge) {
		const figureElement = this.#state.figureElement;
		dom.utils.removeClass(figureElement, 'se-component-selected');

		this.#resizePercentCol(this.#main._element);
		this.#setResizeLinePosition(figureElement, this.#state.tdElement, this.#resizeLinePrev, isLeftEdge);
		this.#resizeLinePrev.style.display = 'block';
		const prevValue = col.style.width;
		const nextCol = /** @type {HTMLElement} */ (col.nextElementSibling);
		const nextColPrevValue = nextCol.style.width;
		const realWidth = dom.utils.hasClass(this.#main._element, 'se-table-layout-fixed') ? nextColPrevValue : converter.getWidthInPercentage(nextCol || col);

		if (_DragHandle.get('__dragHandler')) _DragHandle.get('__dragHandler').style.display = 'none';
		this.#addResizeGlobalEvents(
			this.#cellResize.bind(
				this,
				col,
				nextCol,
				figureElement,
				this.#state.tdElement,
				this.#resizeLine,
				isLeftEdge,
				startX,
				startWidth,
				numbers.get(prevValue, Constants.CELL_DECIMAL_END),
				numbers.get(realWidth, Constants.CELL_DECIMAL_END),
				this.#main._element.offsetWidth,
			),
			() => {
				this.#removeGlobalEvents();
				this.#resizePercentCol(this.#main._element);
				this.#main.history.push(true);
				this.#main.component.hoverSelect(this.#main._element);
				this.#main._editorEnable(true);
			},
			(e) => {
				this._stopResize(col, prevValue, 'width', e);
				this._stopResize(nextCol, nextColPrevValue, 'width', e);
			},
		);
	}

	/**
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
	#cellResize(col, nextCol, figure, tdEl, resizeLine, isLeftEdge, startX, startWidth, prevWidthPercent, nextColWidthPercent, tableWidth, e) {
		const deltaX = e.clientX - startX;
		const newWidthPx = startWidth + deltaX;
		const newWidthPercent = (newWidthPx / tableWidth) * 100;

		if (newWidthPercent > 0) {
			col.style.width = `${newWidthPercent}%`;
			const delta = prevWidthPercent - newWidthPercent;
			nextCol.style.width = `${nextColWidthPercent + delta}%`;
			this.#setResizeLinePosition(figure, tdEl, resizeLine, isLeftEdge);
		}
	}

	/**
	 * @internal
	 * @description Starts resizing a table row.
	 * @param {HTMLElement} row The table row element.
	 * @param {number} startY The starting Y position.
	 * @param {number} startHeight The initial height of the row.
	 */
	_startRowResizing(row, startY, startHeight) {
		const figureElement = this.#state.figureElement;
		dom.utils.removeClass(figureElement, 'se-component-selected');

		this.#setResizeRowPosition(figureElement, row, this.#resizeLinePrev);
		this.#resizeLinePrev.style.display = 'block';
		const prevValue = row.style.height;

		if (_DragHandle.get('__dragHandler')) _DragHandle.get('__dragHandler').style.display = 'none';
		this.#addResizeGlobalEvents(
			this.#rowResize.bind(this, row, figureElement, this.#resizeLine, startY, startHeight),
			() => {
				this.#removeGlobalEvents();
				this.#main.history.push(true);
				this.#main.component.hoverSelect(this.#main._element);
				this.#main._editorEnable(true);
			},
			this._stopResize.bind(this, row, prevValue, 'height'),
		);
	}

	/**
	 * @description Resizes a table row.
	 * @param {HTMLElement} row The table row element.
	 * @param {HTMLElement} figure The table figure element.
	 * @param {HTMLElement} resizeLine The resize line element.
	 * @param {number} startY The starting Y position.
	 * @param {number} startHeight The initial height of the row.
	 * @param {MouseEvent} e The mouse event.
	 */
	#rowResize(row, figure, resizeLine, startY, startHeight, e) {
		const deltaY = e.clientY - startY;
		const newHeightPx = startHeight + deltaY;
		row.style.height = `${newHeightPx}px`;
		this.#setResizeRowPosition(figure, row, resizeLine);
	}

	/**
	 * @internal
	 * @description Starts resizing the table figure.
	 * @param {number} startX The starting X position.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	_startFigureResizing(startX, isLeftEdge) {
		const figure = this.#state.figureElement;
		dom.utils.removeClass(figure, 'se-component-selected');

		this.#setResizeLinePosition(figure, figure, this.#resizeLinePrev, isLeftEdge);
		this.#resizeLinePrev.style.display = 'block';
		const realWidth = converter.getWidthInPercentage(figure);

		if (_DragHandle.get('__dragHandler')) _DragHandle.get('__dragHandler').style.display = 'none';
		this.#addResizeGlobalEvents(
			this.#figureResize.bind(this, figure, this.#resizeLine, isLeftEdge, startX, figure.offsetWidth, numbers.get(realWidth, Constants.CELL_DECIMAL_END)),
			() => {
				this.#removeGlobalEvents();
				if (numbers.get(figure.style.width, 0) > 100) figure.style.width = '100%';
				this.#main.history.push(true);
				this.#main.component.hoverSelect(this.#main._element);
				this.#main._editorEnable(true);
			},
			this._stopResize.bind(this, figure, figure.style.width, 'width'),
		);
	}

	/**
	 * @description Resizes the table figure.
	 * @param {HTMLElement} figure The table figure element.
	 * @param {HTMLElement} resizeLine The resize line element.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 * @param {number} startX The starting X position.
	 * @param {number} startWidth The initial width of the figure.
	 * @param {number} constNum A constant number used for width calculation.
	 * @param {MouseEvent} e The mouse event.
	 */
	#figureResize(figure, resizeLine, isLeftEdge, startX, startWidth, constNum, e) {
		const deltaX = isLeftEdge ? startX - e.clientX : e.clientX - startX;
		const newWidthPx = startWidth + deltaX;
		const newWidthPercent = (newWidthPx / startWidth) * constNum;

		if (newWidthPercent > 0) {
			figure.style.width = `${newWidthPercent}%`;
			this.#setResizeLinePosition(figure, figure, resizeLine, isLeftEdge);
		}
	}

	/**
	 * @description Sets the resize line position.
	 * @param {HTMLElement} figure The table figure element.
	 * @param {HTMLElement} target The target element.
	 * @param {HTMLElement} resizeLine The resize line element.
	 * @param {boolean} isLeftEdge Whether the resizing is on the left edge.
	 */
	#setResizeLinePosition(figure, target, resizeLine, isLeftEdge) {
		const tdOffset = this.#main.offset.getLocal(target);
		const tableOffset = this.#main.offset.getLocal(figure);
		resizeLine.style.left = `${tdOffset.left + (isLeftEdge ? 0 : target.offsetWidth)}px`;
		resizeLine.style.top = `${tableOffset.top}px`;
		resizeLine.style.height = `${figure.offsetHeight}px`;
	}

	/**
	 * @description Sets the resize row position.
	 * @param {HTMLElement} figure The table figure element.
	 * @param {HTMLElement} target The target row element.
	 * @param {HTMLElement} resizeLine The resize line element.
	 */
	#setResizeRowPosition(figure, target, resizeLine) {
		const rowOffset = this.#main.offset.getLocal(target);
		const tableOffset = this.#main.offset.getLocal(figure);
		resizeLine.style.top = `${rowOffset.top + target.offsetHeight}px`;
		resizeLine.style.left = `${tableOffset.left}px`;
		resizeLine.style.width = `${figure.offsetWidth}px`;
	}

	/**
	 * @internal
	 * @description Stops resizing the table.
	 * @param {HTMLElement} target The target element.
	 * @param {string} prevValue The previous style value.
	 * @param {string} styleProp The CSS property being changed.
	 * @param {KeyboardEvent} e The keyboard event.
	 */
	_stopResize(target, prevValue, styleProp, e) {
		if (!keyCodeMap.isEsc(e.code)) return;
		this.#removeGlobalEvents();
		this.#main.component.hoverSelect(this.#main._element);
		this.#main._editorEnable(true);
		target.style[styleProp] = prevValue;
		// figure reopen
		if (styleProp === 'width') {
			this.#main.component.select(this.#main._element, this.#main.constructor['key'], { isInput: true });
		}
	}

	/**
	 * @description Adds global event listeners for resizing.
	 * @param {(...args: *) => void} resizeFn The function handling the resize event.
	 * @param {(...args: *) => void} stopFn The function handling the stop event.
	 * @param {(...args: *) => void} keyDownFn The function handling the keydown event.
	 */
	#addResizeGlobalEvents(resizeFn, stopFn, keyDownFn) {
		this.#globalEvents.resize = this.#main.eventManager.addGlobalEvent('mousemove', resizeFn, false);
		this.#globalEvents.resizeStop = this.#main.eventManager.addGlobalEvent('mouseup', stopFn, false);
		this.#globalEvents.resizeKeyDown = this.#main.eventManager.addGlobalEvent('keydown', keyDownFn, false);
		this.#resizing = true;
	}

	/**
	 * @description Removes global event listeners and resets resize-related properties.
	 */
	#removeGlobalEvents() {
		this.#resizing = false;
		this.#main.ui.disableBackWrapper();
		this.#hideResizeLine();
		if (this.#resizeLinePrev) {
			this.#resizeLinePrev.style.display = 'none';
			this.#resizeLinePrev = null;
		}
		const globalEvents = this.#globalEvents;
		for (const k in globalEvents) {
			globalEvents[k] &&= this.#main.eventManager.removeGlobalEvent(globalEvents[k]);
		}

		this.#resizing = false;
		this.#resizeLine = null;
	}

	/**
	 * @description Hides the resize line if it is visible.
	 */
	#hideResizeLine() {
		if (this.#resizeLine) {
			this.#resizeLine.style.display = 'none';
			this.#resizeLine = null;
		}
		if (this.#main._element) {
			this.#main._element.style.cursor = '';
		}
	}

	init() {
		this.#removeGlobalEvents();
	}
}

export default TableResizeService;
