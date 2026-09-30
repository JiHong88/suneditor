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
	 * @description Shows the table dot on the table's top-left corner (top-right in RTL).
	 * - Steps inward along the top edge while the top line breaker holds the corner.
	 * - Hidden when the corner is scrolled out of the figure's visible area.
	 * @param {boolean} [_recheck=true] Internal - re-run once on the next tick (the core
	 * positions the line breaker after `componentSelect`, so the first pass may be stale).
	 */
	showTableDot(_recheck?: boolean): void;
	/**
	 * @description Shows the cell dot on the current cell's right edge (left in RTL), vertically centered.
	 * - Hidden when the anchor point is scrolled out of the figure's visible area.
	 */
	showCellDot(): void;
	/**
	 * @description Repositions the logically shown dots (clamp-hidden ones re-appear when back in view).
	 */
	reposition(): void;
	/**
	 * @description Hides both dots.
	 */
	hide(): void;
	/**
	 * @description Service reset — hides the dots.
	 */
	init(): void;
	#private;
}
export default TableDotService;
