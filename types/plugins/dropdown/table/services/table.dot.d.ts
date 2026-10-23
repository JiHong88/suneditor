import type {} from '../../../../typedef';
/**
 * @description Dot launchers for the `'dot'` controller positions
 * - `tableControllerPosition: 'dot'`, `cellControllerPosition: 'dot'`.
 */
export class TableDotService {
	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main: import('../index').default);
	/**
	 * @description The cell dot (`null` unless `cellControllerPosition: 'dot'`)
	 * @type {?SunEditor.Module.Controller.Instance}
	 */
	cellDot: SunEditor.Module.Controller.Instance | null;
	/**
	 * @description The table dot (`null` unless `tableControllerPosition: 'dot'`)
	 * @type {?SunEditor.Module.Controller.Instance}
	 */
	tableDot: SunEditor.Module.Controller.Instance | null;
	/**
	 * @description Shows the table dot on the table's top-left corner (top-right in RTL).
	 * - Hidden while the corner is scrolled out of the figure's visible area.
	 * @param {boolean} [_recheck=true] Internal - re-place once on the next tick (the core
	 * positions the line breaker after `componentSelect`, so the first pass may be stale).
	 */
	showTableDot(_recheck?: boolean): void;
	/**
	 * @description Shows the cell dot on the selection's right edge (left in RTL), vertically centered.
	 * - Hidden while the anchor point is scrolled out of the figure's visible area.
	 */
	showCellDot(): void;
	/**
	 * @description Re-places the open dots (clamp-hidden ones re-appear when back in view) and,
	 * - through the controller, the popups opened on them.
	 */
	reposition(): void;
	/**
	 * @description Closes the open controllers launched from the dots (a click elsewhere dismisses them).
	 * - Force close: a click inside the table sets the controller's own prevent-close guard.
	 */
	closeControllers(): void;
	/**
	 * @description Closes the cell dot only — a click inside the table moves the cell UI while the table dot stays,
	 * - like the table controller in the `'table'` mode. The new cell's dot is shown on the selection's mouseup.
	 */
	closeCellDot(): void;
	/**
	 * @description Closes both dots (and the popups opened on them).
	 */
	hide(): void;
	/**
	 * @description Service reset — closes the dots.
	 */
	init(): void;
	#private;
}
export default TableDotService;
