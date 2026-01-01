import TableClipboardService from '../../../../../../src/plugins/dropdown/table/services/table.clipboard';

jest.mock('../../../../../../src/helper', () => ({
    dom: {
        utils: {
            createElement: jest.fn((tag) => ({
                getElementsByTagName: jest.fn().mockReturnValue([]),
                querySelectorAll: jest.fn().mockReturnValue([]),
                appendChild: jest.fn(),
                cloneNode: jest.fn().mockReturnThis(),
                lastChild: null,
                style: {}
            }))
        }
    }
}));

jest.mock('../../../../../../src/plugins/dropdown/table/shared/table.utils', () => ({
    CloneTable: jest.fn(),
    InvalidateTableCache: jest.fn(),
    GetLogicalCellIndex: jest.fn().mockReturnValue(0)
}));

describe('TableClipboardService', () => {
    let clipboardService;
    let main;
    let mainState;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        mainState = {
            physical_cellCnt: 2,
            logical_cellCnt: 2,
            rowCnt: 2,
            rowIndex: 0,
            physical_cellIndex: 0,
            logical_cellIndex: 0,
            current_colSpan: 0,
            current_rowSpan: 0
        };

        main = {
            state: mainState,
            selectionService: {
                deleteStyleSelectedCells: jest.fn(),
                getSelection: jest.fn(),
                setMultiCells: jest.fn(),
                toggleStyleSelectedCells: jest.fn(),
                focusCellEdge: jest.fn()
            },
            gridService: {
                editRow: jest.fn(),
                editColumn: jest.fn()
            },
            cellService: {
                unmergeCells: jest.fn(),
                mergeCells: jest.fn(),
                setMergeSplitButton: jest.fn(),
                setUnMergeButton: jest.fn()
            },
            setTableInfo: jest.fn(),
            setCellInfo: jest.fn(),
            setState: jest.fn((key, val) => { mainState[key] = val; }),
            _closeTableSelectInfo: jest.fn(),
            historyPush: jest.fn(),
            _setController: jest.fn()
        };

        // Override mock to return real nodes
        const { dom } = require('../../../../../../src/helper');
        dom.utils.createElement.mockImplementation((tag) => {
             const el = document.createElement(tag);
             el.getElementsByTagName = (t) => el.querySelectorAll(t);
             return el;
        });

        clipboardService = new TableClipboardService(main);
    });

    describe('copySelectedTableCells', () => {
        it('should perform copy operation', () => {
            const mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                clipboardData: {
                    setData: jest.fn()
                }
            };
            const container = document.createElement('div');
            container.className = 'test-container';

            const table = document.createElement('table');
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.rowSpan = 1;
            cell.colSpan = 1;

            row.appendChild(cell);
            table.appendChild(row);

            clipboardService.copySelectedTableCells(mockEvent, container, [cell]);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.clipboardData.setData).toHaveBeenCalledWith('text/html', expect.stringContaining('test-container'));
        });
    });

    describe('pasteTableCellMatrix', () => {
        it('should paste cells and expand table if necessary', () => {
            const { CloneTable } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');

            // Source table (Copy from)
            const copyTable = document.createElement('table');
            const copyRow = document.createElement('tr');
            const copyCell = document.createElement('td');
            copyCell.innerHTML = 'copied';
            copyRow.appendChild(copyCell);
            copyTable.appendChild(copyRow);

            // Target table (Paste into)
            const targetTable = document.createElement('table');
            const targetRow = document.createElement('tr');
            const targetCell = document.createElement('td');
            targetRow.appendChild(targetCell);
            targetTable.appendChild(targetRow);

            CloneTable.mockReturnValue({
                clonedTable: targetTable,
                clonedSelectedCells: [targetCell]
            });

            clipboardService.pasteTableCellMatrix(copyTable, targetCell);

            expect(CloneTable).toHaveBeenCalled();
            expect(main.setTableInfo).toHaveBeenCalled();
            expect(targetCell.innerHTML).toBe('copied');
            expect(main.historyPush).toHaveBeenCalled();
        });

        it('should return early when copyTable or targetTD is null', () => {
            expect(clipboardService.pasteTableCellMatrix(null, null)).toBeUndefined();
            expect(clipboardService.pasteTableCellMatrix(document.createElement('table'), null)).toBeUndefined();
        });

        it('should expand table when copy data exceeds target size', () => {
            const { CloneTable } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');

            // Source table (3x3)
            const copyTable = document.createElement('table');
            for (let r = 0; r < 3; r++) {
                const row = document.createElement('tr');
                for (let c = 0; c < 3; c++) {
                    const cell = document.createElement('td');
                    cell.innerHTML = `cell-${r}-${c}`;
                    row.appendChild(cell);
                }
                copyTable.appendChild(row);
            }

            // Target table (1x1)
            const targetTable = document.createElement('table');
            const targetRow = document.createElement('tr');
            const targetCell = document.createElement('td');
            targetRow.appendChild(targetCell);
            targetTable.appendChild(targetRow);

            CloneTable.mockReturnValue({
                clonedTable: targetTable,
                clonedSelectedCells: [targetCell]
            });

            // Mock state for small target
            mainState.rowCnt = 1;
            mainState.logical_cellCnt = 1;
            mainState.rowIndex = 0;
            mainState.logical_cellIndex = 0;

            clipboardService.pasteTableCellMatrix(copyTable, targetCell);

            // Should call editRow and editColumn to expand
            expect(main.gridService.editRow).toHaveBeenCalled();
            expect(main.gridService.editColumn).toHaveBeenCalled();
        });

        it('should unmerge overlapping cells in target table', () => {
            const { CloneTable } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');

            // Source table (2x2)
            const copyTable = document.createElement('table');
            for (let r = 0; r < 2; r++) {
                const row = document.createElement('tr');
                for (let c = 0; c < 2; c++) {
                    const cell = document.createElement('td');
                    cell.innerHTML = `copy-${r}-${c}`;
                    row.appendChild(cell);
                }
                copyTable.appendChild(row);
            }

            // Target table with merged cell
            const targetTable = document.createElement('table');
            const targetRow1 = document.createElement('tr');
            const mergedCell = document.createElement('td');
            mergedCell.colSpan = 2;
            mergedCell.rowSpan = 2;
            targetRow1.appendChild(mergedCell);
            targetTable.appendChild(targetRow1);

            const targetRow2 = document.createElement('tr');
            targetTable.appendChild(targetRow2);

            CloneTable.mockReturnValue({
                clonedTable: targetTable,
                clonedSelectedCells: [mergedCell]
            });

            mainState.rowCnt = 2;
            mainState.logical_cellCnt = 2;
            mainState.rowIndex = 0;
            mainState.logical_cellIndex = 0;

            clipboardService.pasteTableCellMatrix(copyTable, mergedCell);

            expect(main.cellService.unmergeCells).toHaveBeenCalled();
        });

        it('should handle source table with merged cells', () => {
            const { CloneTable } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');

            // Source table with merged cell
            const copyTable = document.createElement('table');
            const copyRow1 = document.createElement('tr');
            const mergedCopyCell = document.createElement('td');
            mergedCopyCell.colSpan = 2;
            mergedCopyCell.rowSpan = 2;
            mergedCopyCell.innerHTML = 'merged-copy';
            copyRow1.appendChild(mergedCopyCell);
            copyTable.appendChild(copyRow1);

            const copyRow2 = document.createElement('tr');
            copyTable.appendChild(copyRow2);

            // Target table (2x2)
            const targetTable = document.createElement('table');
            for (let r = 0; r < 2; r++) {
                const row = document.createElement('tr');
                for (let c = 0; c < 2; c++) {
                    const cell = document.createElement('td');
                    row.appendChild(cell);
                }
                targetTable.appendChild(row);
            }

            const targetCell = targetTable.rows[0].cells[0];

            CloneTable.mockReturnValue({
                clonedTable: targetTable,
                clonedSelectedCells: [targetCell]
            });

            mainState.rowCnt = 2;
            mainState.logical_cellCnt = 2;

            clipboardService.pasteTableCellMatrix(copyTable, targetCell);

            expect(main.setTableInfo).toHaveBeenCalled();
        });

        it('should handle paste at non-zero position', () => {
            const { CloneTable } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');

            // Source table (1x1)
            const copyTable = document.createElement('table');
            const copyRow = document.createElement('tr');
            const copyCell = document.createElement('td');
            copyCell.innerHTML = 'pasted';
            copyRow.appendChild(copyCell);
            copyTable.appendChild(copyRow);

            // Target table (3x3)
            const targetTable = document.createElement('table');
            for (let r = 0; r < 3; r++) {
                const row = document.createElement('tr');
                for (let c = 0; c < 3; c++) {
                    const cell = document.createElement('td');
                    cell.innerHTML = `original-${r}-${c}`;
                    row.appendChild(cell);
                }
                targetTable.appendChild(row);
            }

            // Paste at row 1, col 1
            const targetCell = targetTable.rows[1].cells[1];

            CloneTable.mockReturnValue({
                clonedTable: targetTable,
                clonedSelectedCells: [targetCell]
            });

            mainState.rowCnt = 3;
            mainState.logical_cellCnt = 3;
            mainState.rowIndex = 1;
            mainState.logical_cellIndex = 1;

            clipboardService.pasteTableCellMatrix(copyTable, targetCell);

            expect(targetCell.innerHTML).toBe('pasted');
        });
    });

    describe('copySelectedTableCells - edge cases', () => {
        it('should handle multiple selected cells', () => {
            const { GetLogicalCellIndex } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');

            const mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                clipboardData: {
                    setData: jest.fn()
                }
            };
            const container = document.createElement('div');

            const table = document.createElement('table');
            const row = document.createElement('tr');
            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            cell1.innerHTML = 'Cell 1';
            cell2.innerHTML = 'Cell 2';
            row.appendChild(cell1);
            row.appendChild(cell2);
            table.appendChild(row);

            GetLogicalCellIndex.mockImplementation((t, r, c) => c);

            clipboardService.copySelectedTableCells(mockEvent, container, [cell1, cell2]);

            expect(mockEvent.clipboardData.setData).toHaveBeenCalledWith(
                'text/html',
                expect.stringContaining('Cell 1')
            );
            expect(mockEvent.clipboardData.setData).toHaveBeenCalledWith(
                'text/html',
                expect.stringContaining('Cell 2')
            );
        });

        it('should handle cells with rowspan and colspan', () => {
            const { GetLogicalCellIndex } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');

            const mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                clipboardData: {
                    setData: jest.fn()
                }
            };
            const container = document.createElement('div');

            const table = document.createElement('table');
            const row1 = document.createElement('tr');
            const mergedCell = document.createElement('td');
            mergedCell.rowSpan = 2;
            mergedCell.colSpan = 2;
            mergedCell.innerHTML = 'Merged';
            row1.appendChild(mergedCell);
            table.appendChild(row1);

            const row2 = document.createElement('tr');
            table.appendChild(row2);

            GetLogicalCellIndex.mockReturnValue(0);

            clipboardService.copySelectedTableCells(mockEvent, container, [mergedCell]);

            expect(mockEvent.clipboardData.setData).toHaveBeenCalled();
        });

        it('should handle non-rectangular selection', () => {
            const { GetLogicalCellIndex } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');

            const mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                clipboardData: {
                    setData: jest.fn()
                }
            };
            const container = document.createElement('div');

            const table = document.createElement('table');
            for (let r = 0; r < 3; r++) {
                const row = document.createElement('tr');
                for (let c = 0; c < 3; c++) {
                    const cell = document.createElement('td');
                    cell.innerHTML = `${r}-${c}`;
                    row.appendChild(cell);
                }
                table.appendChild(row);
            }

            // Select diagonal cells
            const selectedCells = [
                table.rows[0].cells[0],
                table.rows[1].cells[1],
                table.rows[2].cells[2]
            ];

            GetLogicalCellIndex.mockImplementation((t, r, c) => c);

            clipboardService.copySelectedTableCells(mockEvent, container, selectedCells);

            expect(mockEvent.clipboardData.setData).toHaveBeenCalled();
        });
    });

    describe('pasteTableCellMatrix - complex scenarios', () => {
        it('should handle rowspan map correctly during unmerge phase', () => {
            const { CloneTable } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');

            // Source table (2x2)
            const copyTable = document.createElement('table');
            for (let r = 0; r < 2; r++) {
                const row = document.createElement('tr');
                for (let c = 0; c < 2; c++) {
                    const cell = document.createElement('td');
                    cell.innerHTML = `copy-${r}-${c}`;
                    row.appendChild(cell);
                }
                copyTable.appendChild(row);
            }

            // Target table with complex rowspan
            const targetTable = document.createElement('table');
            const tr1 = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.rowSpan = 2;
            const td2 = document.createElement('td');
            tr1.append(td1, td2);
            targetTable.appendChild(tr1);

            const tr2 = document.createElement('tr');
            const td3 = document.createElement('td');
            tr2.appendChild(td3);
            targetTable.appendChild(tr2);

            CloneTable.mockReturnValue({
                clonedTable: targetTable,
                clonedSelectedCells: [td1]
            });

            mainState.rowCnt = 2;
            mainState.logical_cellCnt = 2;
            mainState.rowIndex = 0;
            mainState.logical_cellIndex = 0;

            clipboardService.pasteTableCellMatrix(copyTable, td1);

            expect(main.cellService.unmergeCells).toHaveBeenCalled();
        });

        it('should handle missing rows gracefully', () => {
            const { CloneTable } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');

            // Source table (5x1) - more rows than target
            const copyTable = document.createElement('table');
            for (let r = 0; r < 5; r++) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.innerHTML = `row-${r}`;
                row.appendChild(cell);
                copyTable.appendChild(row);
            }

            // Target table (2x1)
            const targetTable = document.createElement('table');
            for (let r = 0; r < 2; r++) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                row.appendChild(cell);
                targetTable.appendChild(row);
            }

            const targetCell = targetTable.rows[0].cells[0];

            CloneTable.mockReturnValue({
                clonedTable: targetTable,
                clonedSelectedCells: [targetCell]
            });

            mainState.rowCnt = 2;
            mainState.logical_cellCnt = 1;
            mainState.rowIndex = 0;
            mainState.logical_cellIndex = 0;

            clipboardService.pasteTableCellMatrix(copyTable, targetCell);

            // Should call editRow to add more rows
            expect(main.gridService.editRow).toHaveBeenCalled();
        });
    });
});
