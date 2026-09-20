import type {} from '../../../../typedef';
/**
 * @description Drag-move handles for whole rows/columns (band = merged block unit).
 * - The DOM mutation goes through `TableReorderService.move` (owns cache/history)
 * — this service is view/gesture only.
 */
export class TableHandleService {
	/**
	 * @param {import('../index').default} main Table index
	 */
	constructor(main: import('../index').default);
	/**
	 * @description Whether a handle drag is in progress.
	 * @returns {boolean}
	 */
	isMoving(): boolean;
	/**
	 * @description Repositions both handles for the hovered cell. Shown only while the figure is selected.
	 * - Positions clamp to the figure's visible area (scrolled figures).
	 * @param {?HTMLTableCellElement} cell The hovered table cell (non-cells are ignored).
	 */
	refresh(cell: HTMLTableCellElement | null): void;
	/**
	 * @description Hides both handles. No-op while a drag is in progress.
	 */
	hide(): void;
	/**
	 * @description Hides the handles on wysiwyg mouseleave, unless the pointer is on/near a strip.
	 * - Geometric check: floating UI (line breaker, controller) can capture the pointer over a strip.
	 * @param {MouseEvent} event The mouseleave event
	 */
	hideOnLeave(event: MouseEvent): void;
	/**
	 * @description Hides the handles unless the pointer is still inside the handles' figure
	 * or within the overshoot margin (the grace timer hides there instead).
	 * @param {?Node} target The hovered node
	 * @param {MouseEvent} [event] The mousemove event
	 */
	hideOutside(target: Node | null, event?: MouseEvent): void;
	/**
	 * @description Service reset — aborts any drag and hides the handles after the grace delay.
	 * - Delayed because a reset can come from an overshoot deselect; returning onto a strip cancels it.
	 */
	init(): void;
	#private;
}
export default TableHandleService;
