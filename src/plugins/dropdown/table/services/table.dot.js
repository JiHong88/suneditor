import { dom, env } from '../../../../helper';
import { Controller } from '../../../../modules/contract';
import * as Constants from '../shared/table.constants';

const { _w } = env;

/** Cell dot button diameter. (.sun-editor .se-table-dot) */
const DOT_SIZE = 14;

/** Table dot button diameter. (.sun-editor .se-table-dot-table) */
const TABLE_DOT_SIZE = 16;

/** Table dot's inward offset from the corner along the top edge */
const TABLE_DOT_INSET = 24;

/**
 * @description Dot launchers for the `'dot'` controller positions
 * - `tableControllerPosition: 'dot'`, `cellControllerPosition: 'dot'`.
 */
export class TableDotService {
	#main;
	#$;

	#scrollRafId = null;

	/**
	 * @description The cell dot (`null` unless `cellControllerPosition: 'dot'`)
	 * @type {?SunEditor.Module.Controller.Instance}
	 */
	cellDot = null;

	/**
	 * @description The table dot (`null` unless `tableControllerPosition: 'dot'`)
	 * @type {?SunEditor.Module.Controller.Instance}
	 */
	tableDot = null;

	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main) {
		this.#main = main;
		this.#$ = main.$;

		if (main.cellControllerPosition === 'dot') {
			this.cellDot = this.#createDot(
				Constants.DOT_CELL_CLASS,
				this.#$.lang.cellMenu,
				this.#OnCellDotClick.bind(this),
				this.#placeCellDot.bind(this),
			);
		}

		if (main.tableControllerPosition === 'dot') {
			this.tableDot = this.#createDot(
				Constants.DOT_TABLE_CLASS,
				this.#$.lang.tableMenu,
				this.#OnTableDotClick.bind(this),
				this.#placeTableDot.bind(this),
			);
		}

		if (!this.cellDot && !this.tableDot) return;

		this.#$.contextProvider.applyToRoots((e) => {
			const wysiwyg = e.get('wysiwyg');
			this.#$.eventManager.addEvent(wysiwyg, 'scroll', (event) => this.#OnScroll(event, wysiwyg), {
				passive: true,
				capture: true,
			});
		});
	}

	/**
	 * @description Creates a dot button and its in-editor controller.
	 * @param {string} selector Dot class selector from `table.constants`
	 * @param {string} label Button title
	 * @param {(e: MouseEvent) => void} onClick Click handler
	 * @param {() => ?{left: number, top: number}} place Placement
	 * @returns {SunEditor.Module.Controller.Instance}
	 */
	#createDot(selector, label, onClick, place) {
		const button = dom.utils.createElement('BUTTON', {
			type: 'button',
			class: `se-table-dot ${selector.replace(/^\./, '')}`,
			title: label,
			'aria-label': label,
		});
		this.#$.eventManager.addEvent(button, 'mousedown', OnDotMouseDown);
		this.#$.eventManager.addEvent(button, 'click', onClick);

		return new Controller(this, this.#$, button, { container: 'wrapper', selection: true, place });
	}

	/**
	 * @description Shows the table dot on the table's top-left corner (top-right in RTL).
	 * - Hidden while the corner is scrolled out of the figure's visible area.
	 * @param {boolean} [_recheck=true] Internal - re-place once on the next tick (the core
	 * positions the line breaker after `componentSelect`, so the first pass may be stale).
	 */
	showTableDot(_recheck = true) {
		if (!this.tableDot) return;

		const table = this.#main.state.selectedTable || this.#main._element;
		if (!table?.isConnected) {
			this.tableDot.close();
			return;
		}

		this.tableDot.open(table);

		if (_recheck) {
			_w.setTimeout(() => {
				if (this.tableDot.isOpen) this.tableDot.resetPosition();
			}, 0);
		}
	}

	/**
	 * @description Shows the cell dot on the selection's right edge (left in RTL), vertically centered.
	 * - Hidden while the anchor point is scrolled out of the figure's visible area.
	 */
	showCellDot() {
		if (!this.cellDot) return;

		const cell = this.#cellDotAnchor(!!this.#$.options.get('_rtl'));
		if (!cell?.isConnected) {
			this.cellDot.close();
			return;
		}

		this.cellDot.open(cell);
	}

	/**
	 * @description Re-places the open dots (clamp-hidden ones re-appear when back in view) and,
	 * - through the controller, the popups opened on them.
	 */
	reposition() {
		if (this.cellDot?.isOpen) this.cellDot.resetPosition();
		if (this.tableDot?.isOpen) this.tableDot.resetPosition();
	}

	/**
	 * @description Closes the open controllers launched from the dots (a click elsewhere dismisses them).
	 * - Force close: a click inside the table sets the controller's own prevent-close guard.
	 */
	closeControllers() {
		if (this.cellDot && this.#main.controller_cell.isOpen) this.#main.controller_cell.close(true);
		if (this.tableDot && this.#main.controller_table.isOpen) this.#main.controller_table.close(true);
	}

	/**
	 * @description Closes the cell dot only — a click inside the table moves the cell UI while the table dot stays,
	 * - like the table controller in the `'table'` mode. The new cell's dot is shown on the selection's mouseup.
	 */
	closeCellDot() {
		this.cellDot?.close();
	}

	/**
	 * @description Closes both dots (and the popups opened on them).
	 */
	hide() {
		if (!this.cellDot && !this.tableDot) return;

		this.cellDot?.close();
		this.tableDot?.close();
	}

	/**
	 * @description Service reset — closes the dots.
	 */
	init() {
		this.hide();
	}

	/**
	 * @description `place` of the cell dot — centered on the anchor cell's right edge (left in RTL).
	 * @returns {?{left: number, top: number}} Wrapper-local position, `null` while out of the figure's visible area
	 */
	#placeCellDot() {
		const isRtl = !!this.#$.options.get('_rtl');
		const cell = this.#cellDotAnchor(isRtl);
		if (!cell?.isConnected) return null;

		const box = this.#visibleBox(dom.query.getParentElement(cell, 'TABLE'));
		if (!box) return null;

		const cellOffset = this.#$.offset.getLocal(cell);
		const x = isRtl ? cellOffset.left : cellOffset.left + cell.offsetWidth;
		const y = cellOffset.top + cell.offsetHeight / 2;
		if (x < box.left - 1 || x > box.right + 1 || y < box.top - 1 || y > box.bottom + 1) return null;

		return { left: x - DOT_SIZE / 2, top: y - DOT_SIZE / 2 };
	}

	/**
	 * @description `place` of the table dot — centered on the table's top-left corner (top-right in RTL).
	 * - Steps inward along the top edge while the top line breaker holds the corner.
	 * @returns {?{left: number, top: number}} Wrapper-local position, `null` while out of the figure's visible area
	 */
	#placeTableDot() {
		const box = this.#visibleBox(this.#main.state.selectedTable || this.#main._element);
		if (!box) return null;

		const isRtl = !!this.#$.options.get('_rtl');
		const corner = isRtl ? box.right : box.left;
		const x = this.#breakerOnCorner(corner, box.top)
			? isRtl
				? corner - TABLE_DOT_INSET
				: corner + TABLE_DOT_INSET
			: corner;

		return { left: x - TABLE_DOT_SIZE / 2, top: box.top - TABLE_DOT_SIZE / 2 };
	}

	/**
	 * @description Whether the top line breaker is visible on the given corner point.
	 * @param {number} x Wrapper-local corner x
	 * @param {number} y Wrapper-local corner y
	 * @returns {boolean}
	 */
	#breakerOnCorner(x, y) {
		const breaker = this.#$.frameContext.get('lineBreaker_t');
		if (!breaker || breaker.style.display !== 'block') return false;

		const breakerX = breaker.offsetLeft + breaker.offsetWidth / 2;
		const breakerY = breaker.offsetTop + breaker.offsetHeight / 2;
		return (
			Math.abs(breakerX - x) < (breaker.offsetWidth + TABLE_DOT_SIZE) / 2 &&
			Math.abs(breakerY - y) < (breaker.offsetHeight + TABLE_DOT_SIZE) / 2
		);
	}

	/**
	 * @description The cell the cell dot anchors to: the middle cell of the region's (right|left) edge.
	 * @param {boolean} isRtl RTL mode
	 * @returns {?HTMLTableCellElement}
	 */
	#cellDotAnchor(isRtl) {
		const edge = this.#main.selectionService.getEdgeCells(isRtl ? 'l' : 'r');
		if (edge.length > 0) return edge[(edge.length - 1) >> 1];
		return this.#main.state.tdElement;
	}

	/**
	 * @description The table's visible box inside its figure (wrapper-local).
	 * @param {?HTMLTableElement} table Target table
	 * @returns {?{top: number, bottom: number, left: number, right: number}}
	 */
	#visibleBox(table) {
		const figure = /** @type {HTMLElement} */ (dom.query.getParentElement(table, dom.check.isFigure));
		if (!table || !table.isConnected || !figure) return null;

		const tableOffset = this.#$.offset.getLocal(table);
		const figureOffset = this.#$.offset.getLocal(figure);
		const viewRight = figure.clientWidth ? figureOffset.left + figure.clientWidth : Infinity;
		const viewBottom = figure.clientHeight ? figureOffset.top + figure.clientHeight : Infinity;

		const box = {
			top: Math.max(tableOffset.top, figureOffset.top),
			bottom: Math.min(tableOffset.top + table.offsetHeight, viewBottom),
			left: Math.max(tableOffset.left, figureOffset.left),
			right: Math.min(tableOffset.left + table.offsetWidth, viewRight),
		};

		if (box.bottom - box.top <= 0 || box.right - box.left <= 0) return null;

		return box;
	}

	/**
	 * @description Opens the cell controller anchored to the cell dot, or closes it when already showing.
	 * @param {MouseEvent} event The click event
	 */
	#OnCellDotClick(event) {
		event.preventDefault();
		event.stopPropagation();

		const main = this.#main;
		const cell = main.state.tdElement;
		if (!cell || !cell.isConnected) return;

		const controller = main.controller_cell;
		if (controller.isOpen && controller.form.style.display === 'block') {
			controller.close(true);
			return;
		}

		main.cellService.setUnMergeButton();
		controller.open(cell, this.cellDot.form, {
			isWWTarget: false,
			initMethod: null,
			addOffset: null,
			disabled: main.state.selectedCells?.length > 1,
		});
	}

	/**
	 * @description Opens the table controller anchored to the table dot, or closes it when already showing.
	 * @param {MouseEvent} event The click event
	 */
	#OnTableDotClick(event) {
		event.preventDefault();
		event.stopPropagation();

		const main = this.#main;
		const figureEl = main.state.figureElement;
		if (!figureEl || !figureEl.isConnected) return;

		const controller = main.controller_table;
		if (controller.isOpen && controller.form.style.display === 'block') {
			controller.close(true);
			return;
		}

		controller.open(figureEl, this.tableDot.form, {
			isWWTarget: false,
			initMethod: null,
			addOffset: null,
			disabled: main.state.selectedCells?.length > 1,
		});
	}

	/**
	 * @description Re-places the dots after a scroll inside the content (one update per frame).
	 * @param {Event} event The scroll event
	 * @param {HTMLElement} wysiwyg The wysiwyg of the root the listener belongs to
	 */
	#OnScroll(event, wysiwyg) {
		if (this.#scrollRafId !== null) return;
		if (dom.query.getEventTarget(event) === wysiwyg || wysiwyg !== this.#$.frameContext.get('wysiwyg')) return;

		this.#scrollRafId = _w.requestAnimationFrame(() => {
			this.#scrollRafId = null;
			this.reposition();
		});
	}
}

/**
 * @description Keeps the editor selection and open UI alive under the pressed dot.
 * @param {MouseEvent} event The mousedown event
 */
function OnDotMouseDown(event) {
	if (event.button !== 0) return;
	event.preventDefault();
	event.stopPropagation();
}

export default TableDotService;
