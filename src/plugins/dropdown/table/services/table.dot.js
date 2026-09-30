import { dom, env } from '../../../../helper';
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

	#cellEnabled = false;
	#tableEnabled = false;
	#scrollRafId = null;

	#cellDotOn = false;
	#tableDotOn = false;

	/** @type {WeakMap<HTMLElement, {[selector: string]: HTMLElement}>} */
	#dots = new WeakMap();

	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main) {
		this.#main = main;
		this.#$ = main.$;
		this.#cellEnabled = main.cellControllerPosition === 'dot';
		this.#tableEnabled = main.tableControllerPosition === 'dot';
		if (!this.#cellEnabled && !this.#tableEnabled) return;

		const cellClass = Constants.DOT_CELL_CLASS.replace(/^\./, '');
		const tableClass = Constants.DOT_TABLE_CLASS.replace(/^\./, '');

		this.#$.contextProvider.applyToRoots((e) => {
			const wrapper = e.get('wrapper');
			const dots = /** @type {{[selector: string]: HTMLElement}} */ ({});
			this.#dots.set(wrapper, dots);

			if (this.#cellEnabled) {
				const cellDot = (dots[Constants.DOT_CELL_CLASS] = dom.utils.createElement('BUTTON', {
					type: 'button',
					class: `se-table-dot se-controller-trigger ${cellClass}`,
					title: this.#$.lang.cellMenu,
					'aria-label': this.#$.lang.cellMenu,
				}));
				wrapper.appendChild(cellDot);
				this.#$.eventManager.addEvent(cellDot, 'mousedown', OnDotMouseDown);
				this.#$.eventManager.addEvent(cellDot, 'click', this.#OnCellDotClick.bind(this));
			}

			if (this.#tableEnabled) {
				const tableDot = (dots[Constants.DOT_TABLE_CLASS] = dom.utils.createElement('BUTTON', {
					type: 'button',
					class: `se-table-dot se-controller-trigger ${tableClass}`,
					title: this.#$.lang.tableMenu,
					'aria-label': this.#$.lang.tableMenu,
				}));
				wrapper.appendChild(tableDot);
				this.#$.eventManager.addEvent(tableDot, 'mousedown', OnDotMouseDown);
				this.#$.eventManager.addEvent(tableDot, 'click', this.#OnTableDotClick.bind(this));
			}

			this.#$.eventManager.addEvent(e.get('wysiwyg'), 'scroll', this.#OnScroll.bind(this), {
				passive: true,
				capture: true,
			});
		});
	}

	/**
	 * @description Shows the table dot on the table's top-left corner (top-right in RTL).
	 * - Steps inward along the top edge while the top line breaker holds the corner.
	 * - Hidden when the corner is scrolled out of the figure's visible area.
	 * @param {boolean} [_recheck=true] Internal - re-run once on the next tick (the core
	 * positions the line breaker after `componentSelect`, so the first pass may be stale).
	 */
	showTableDot(_recheck = true) {
		if (!this.#tableEnabled) return;

		const dot = this.#element(Constants.DOT_TABLE_CLASS);
		if (!dot) return;

		const table = this.#main.state.selectedTable || this.#main._element;
		const box = this.#visibleBox(table);
		if (!box) {
			dot.style.display = 'none';
			this.#tableDotOn = !!table?.isConnected;
			return;
		}

		this.#tableDotOn = true;
		const isRtl = !!this.#$.options.get('_rtl');
		const corner = isRtl ? box.right : box.left;
		const x = this.#breakerOnCorner(corner, box.top)
			? isRtl
				? corner - TABLE_DOT_INSET
				: corner + TABLE_DOT_INSET
			: corner;
		this.#place(dot, x, box.top, TABLE_DOT_SIZE);

		if (_recheck) {
			_w.setTimeout(() => {
				if (dot.style.display === 'block') this.showTableDot(false);
			}, 0);
		}
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
	 * @description Shows the cell dot on the current cell's right edge (left in RTL), vertically centered.
	 * - Hidden when the anchor point is scrolled out of the figure's visible area.
	 */
	showCellDot() {
		if (!this.#cellEnabled) return;

		const dot = this.#element(Constants.DOT_CELL_CLASS);
		if (!dot) return;

		const cell = this.#main.state.tdElement;
		if (!cell || !cell.isConnected) {
			dot.style.display = 'none';
			this.#cellDotOn = false;
			return;
		}

		this.#cellDotOn = true;
		const box = this.#visibleBox(dom.query.getParentElement(cell, 'TABLE'));
		const cellOffset = box && this.#$.offset.getLocal(cell);
		const x = cellOffset && (this.#$.options.get('_rtl') ? cellOffset.left : cellOffset.left + cell.offsetWidth);
		const y = cellOffset && cellOffset.top + cell.offsetHeight / 2;
		if (!box || x < box.left - 1 || x > box.right + 1 || y < box.top - 1 || y > box.bottom + 1) {
			dot.style.display = 'none';
			return;
		}

		this.#place(dot, x, y);
	}

	/**
	 * @description Repositions the logically shown dots (clamp-hidden ones re-appear when back in view).
	 */
	reposition() {
		if (!this.#cellEnabled && !this.#tableEnabled) return;

		if (this.#cellDotOn) this.showCellDot();
		if (this.#tableDotOn) this.showTableDot();
	}

	/**
	 * @description Hides both dots.
	 */
	hide() {
		if (!this.#cellEnabled && !this.#tableEnabled) return;

		this.#cellDotOn = false;
		this.#tableDotOn = false;

		const cellDot = this.#element(Constants.DOT_CELL_CLASS);
		if (cellDot) cellDot.style.display = 'none';

		const tableDot = this.#element(Constants.DOT_TABLE_CLASS);
		if (tableDot) tableDot.style.display = 'none';
	}

	/**
	 * @description Service reset — hides the dots.
	 */
	init() {
		this.hide();
	}

	/**
	 * @description Centers a dot on a wrapper-local point and shows it.
	 * @param {HTMLElement} dot Dot element
	 * @param {number} x Wrapper-local x of the anchor point
	 * @param {number} y Wrapper-local y of the anchor point
	 * @param {number} [size=DOT_SIZE] Dot diameter
	 */
	#place(dot, x, y, size = DOT_SIZE) {
		dot.style.left = `${x - size / 2}px`;
		dot.style.top = `${y - size / 2}px`;
		dot.style.display = 'block';
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
	 * @description Opens the cell controller anchored to the cell dot, or hides it when already showing.
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
			controller.hide();
			return;
		}

		main.cellService.setUnMergeButton();
		controller.open(cell, this.#element(Constants.DOT_CELL_CLASS), {
			isWWTarget: false,
			initMethod: null,
			addOffset: null,
			disabled: main.state.selectedCells?.length > 1,
		});
	}

	/**
	 * @description Opens the table controller anchored to the table dot, or hides it when already showing.
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
			controller.hide();
			return;
		}

		controller.open(figureEl, this.#element(Constants.DOT_TABLE_CLASS), {
			isWWTarget: false,
			initMethod: null,
			addOffset: null,
			disabled: main.state.selectedCells?.length > 1,
		});
	}

	/**
	 * @description Repositions the dots and their open controllers after a wysiwyg/figure scroll
	 * (one update per frame). The outer-document scroll is handled by the core.
	 */
	#OnScroll() {
		if (this.#scrollRafId !== null) return;

		this.#scrollRafId = _w.requestAnimationFrame(() => {
			this.#scrollRafId = null;
			this.reposition();
			if (this.#cellEnabled) this.#followDot(this.#main.controller_cell, Constants.DOT_CELL_CLASS);
			if (this.#tableEnabled) this.#followDot(this.#main.controller_table, Constants.DOT_TABLE_CLASS);
		});
	}

	/**
	 * @description Re-anchors an open controller onto its (just repositioned) dot.
	 * - Hidden along with a clamp-hidden dot; re-shown when the dot scrolls back into view.
	 * @param {SunEditor.Module.Controller.Instance} controller Target controller
	 * @param {string} selector Dot class selector from `table.constants`
	 */
	#followDot(controller, selector) {
		if (!controller.isOpen) return;

		const dot = this.#element(selector);
		if (!dot || controller.currentPositionTarget !== dot) return;

		if (dot.style.display !== 'block') {
			if (controller.form.style.display === 'block') controller.hide();
			return;
		}

		controller.resetPosition();
	}

	/**
	 * @description The current root's dot element.
	 * @param {string} selector Class selector from `table.constants`
	 * @returns {?HTMLElement}
	 */
	#element(selector) {
		return this.#dots.get(this.#$.frameContext.get('wrapper'))?.[selector] || null;
	}
}

/**
 * @description Keeps the editor selection and open UI alive under the pressed dot.
 * - `se-controller-trigger` is additionally whitelisted in the component/controller
 * global close listeners (capture phase, where this `stopPropagation` cannot reach).
 * @param {MouseEvent} event The mousedown event
 */
function OnDotMouseDown(event) {
	if (event.button !== 0) return;
	event.preventDefault();
	event.stopPropagation();
}

export default TableDotService;
