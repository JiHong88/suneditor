import type {} from '../../../../typedef';
/**
 * @description Handles table cell operations including merging, splitting,
 * - and multi-cell selection management.
 */
export class TableCellService {
	/**
	 * @param {import('../index').default} main Table index
	 * @param {{
	 * 	mergeButton: HTMLButtonElement,
	 * 	unmergeButton: HTMLButtonElement,
	 * 	splitButton: HTMLButtonElement,
	 * 	openCellMenuFunc: ()=>void,
	 * 	closeCellMenuFunc: ()=>void
	 * 	}} options Options for table service
	 */
	constructor(
		main: import('../index').default,
		{
			mergeButton,
			unmergeButton,
			splitButton,
			openCellMenuFunc,
			closeCellMenuFunc,
		}: {
			mergeButton: HTMLButtonElement;
			unmergeButton: HTMLButtonElement;
			splitButton: HTMLButtonElement;
			openCellMenuFunc: () => void;
			closeCellMenuFunc: () => void;
		},
	);
	mergeButton: HTMLButtonElement;
	unmergeButton: HTMLButtonElement;
	splitButton: HTMLButtonElement;
	selectMenu_split: SelectMenu;
	/**
	 * @description Opens the split menu.
	 */
	openSplitMenu(): void;
	/**
	 * @description Merges the selected table cells into one cell by combining their contents and adjusting their row and column spans.
	 * - This method removes the selected cells, consolidates their contents, and applies the appropriate row and column spans to the merged cell.
	 * @param {HTMLTableCellElement[]} selectedCells Cells array
	 * @param {boolean} [skipPostProcess=false] - If `true`, skips table cloning, cell re-selection, history stack push, and rendering.
	 */
	mergeCells(selectedCells: HTMLTableCellElement[], skipPostProcess?: boolean): void;
	/**
	 * @description Unmerges a table cell that has been merged using rowspan and/or colspan.
	 * @param {HTMLTableCellElement[]} selectedCells - Cells array
	 * @param {boolean} [skipPostProcess=false] - If `true`, skips table cloning, cell re-selection, history stack push, and rendering.
	 */
	unmergeCells(selectedCells: HTMLTableCellElement[], skipPostProcess?: boolean): void;
	/**
	 * @description Find merged cells
	 * @param {HTMLTableCellElement[]} cells - Cells array
	 */
	findMergedCells(cells: HTMLTableCellElement[]): any[];
	/**
	 * @description Sets the merge/split button visibility.
	 */
	setMergeSplitButton(): void;
	/**
	 * @description Sets the unmerge button visibility.
	 */
	setUnMergeButton(): void;
	/**
	 * @internal
	 * @description Splits a table cell either vertically or horizontally.
	 * @param {"vertical"|"horizontal"} direction The direction to split the cell.
	 */
	_OnSplitCells(direction: 'vertical' | 'horizontal'): void;
	#private;
}
export default TableCellService;
import { SelectMenu } from '../../../../modules/ui';
