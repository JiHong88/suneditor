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
    InvalidateTableCache: jest.fn()
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
    });
});
