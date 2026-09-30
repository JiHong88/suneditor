import type {} from '../../../../typedef';
/**
 * @description Moves whole rows or columns within a table.
 * - The unit of movement is a **band**: the range between two legal cut lines (see {@link GetCutLines}).
 * - In a table with no merges a band is one row/column; inside a merged region it widens to the whole merged block.
 * - Every mutation funnels through {@link TableReorderService#move}, which is the only place that touches the DOM.
 * - That one seam owns cache invalidation and the history entry,
 * - so a new caller cannot forget either and leave the logical-index cache stale.
 */
export class TableReorderService {
	/**
	 * @constructor
	 * @param {import('../index').default} main Table index
	 */
	constructor(main: import('../index').default);
	/**
	 * @description The band the given row/column index belongs to.
	 * @param {HTMLTableElement} table Target table
	 * @param {number} index Row index, or logical column index
	 * @param {boolean} isRow `true` for a row band
	 * @returns {{start: number, end: number}} Inclusive index range
	 */
	getBand(
		table: HTMLTableElement,
		index: number,
		isRow: boolean,
	): {
		start: number;
		end: number;
	};
	/**
	 * @description Boundaries the band may be dropped at, with the no-op positions removed.
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band being dragged
	 * @param {boolean} isRow `true` for row boundaries
	 * @returns {number[]} Ascending drop boundaries
	 */
	getDropTargets(
		table: HTMLTableElement,
		band: {
			start: number;
			end: number;
		},
		isRow: boolean,
	): number[];
	/**
	 * @description Moves a band one step towards `direction`, over whatever sits next to it.
	 * - A step is one *band*, not one row: stepping past a merged region jumps the whole region.
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band to move
	 * @param {boolean} isRow `true` to move rows, `false` to move columns
	 * @param {-1|1} direction `-1` for up/left, `1` for down/right
	 * @returns {boolean} `true` when the table changed
	 */
	moveStep(
		table: HTMLTableElement,
		band: {
			start: number;
			end: number;
		},
		isRow: boolean,
		direction: -1 | 1,
	): boolean;
	/**
	 * @description Moves a band so that it starts at `targetCut`.
	 * - `targetCut` is a boundary index, not a row index: `0` means "before everything", `rowCount` means "after everything".
	 * @param {HTMLTableElement} table Target table
	 * @param {{start: number, end: number}} band Band to move
	 * @param {number} targetCut Destination boundary
	 * @param {boolean} isRow `true` to move rows, `false` to move columns
	 * @returns {boolean} `true` when the table changed
	 */
	move(
		table: HTMLTableElement,
		band: {
			start: number;
			end: number;
		},
		targetCut: number,
		isRow: boolean,
	): boolean;
	#private;
}
export default TableReorderService;
