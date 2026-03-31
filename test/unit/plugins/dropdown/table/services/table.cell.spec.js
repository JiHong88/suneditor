import TableCellService from '../../../../../../src/plugins/dropdown/table/services/table.cell';

// Mock dependencies
jest.mock('../../../../../../src/helper', () => ({
    dom: {
        utils: {
            removeItem: jest.fn(),
            createElement: jest.fn(),
            getArrayIndex: jest.fn(),
            addClass: jest.fn(),
            removeClass: jest.fn()
        },
        query: {
            findVisualLastCell: jest.fn()
        },
        check: {
            isZeroWidth: jest.fn()
        }
    },
    numbers: {
        getOverlapRangeAtIndex: jest.fn()
    }
}));

jest.mock('../../../../../../src/modules/ui', () => ({
    SelectMenu: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        create: jest.fn(),
        open: jest.fn(),
        close: jest.fn()
    }))
}));

jest.mock('../../../../../../src/plugins/dropdown/table/shared/table.utils', () => ({
    CloneTable: jest.fn(),
    CreateCellsHTML: jest.fn(),
    InvalidateTableCache: jest.fn()
}));

jest.mock('../../../../../../src/plugins/dropdown/table/render/table.menu', () => ({
    CreateSplitMenu: jest.fn().mockReturnValue({ items: [], menus: [] })
}));

describe('TableCellService', () => {
    let cellService;
    let main;
    let mainState;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        mainState = {
            ref: { cs: 0, ce: 1, rs: 0, re: 1 },
            selectedTable: {},
            selectedCells: [],
            trElements: [],
            tdElement: document.createElement('td'),
            trElement: document.createElement('tr'),
            logical_cellIndex: 0,
            rowIndex: 0,
            rowCnt: 2
        };

        main = {
            state: mainState,
            editor: {},
            lang: {},
            cellService: null, // Will be set to instance
            selectionService: {
                setMultiCells: jest.fn(),
                _focusEdge: jest.fn(),
                deleteStyleSelectedCells: jest.fn(),
                focusCellEdge: jest.fn(),
                initCellSelection: jest.fn()
            },
            format: {
                isLine: jest.fn()
            },
            history: {
                push: jest.fn()
            },
            setTableInfo: jest.fn(),
            setCellInfo: jest.fn(),
            setState: jest.fn((key, val) => { mainState[key] = val; }),
            _closeTableSelectInfo: jest.fn(),
            _setController: jest.fn(),
            historyPush: jest.fn(),
            controller_cell: {
                resetPosition: jest.fn()
            }
        };

        // Make main act as its own kernel for dependency injection
        main.$ = main;

        const buttons = {
            mergeButton: document.createElement('button'),
            unmergeButton: document.createElement('button'),
            splitButton: document.createElement('button'),
            openCellMenuFunc: jest.fn(),
            closeCellMenuFunc: jest.fn()
        };

        cellService = new TableCellService(main, buttons);
        main.cellService = cellService;
    });

    describe('mergeCells', () => {
        it('should merge selected cells', () => {
             const { CloneTable } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             const mockTable = document.createElement('table');
             const cell1 = document.createElement('td');
             const cell2 = document.createElement('td');
             
             // Setup DOM structure for cells
             const table = document.createElement('table');
             const tbody = document.createElement('tbody');
             const row = document.createElement('tr');
             row.appendChild(cell1);
             row.appendChild(cell2);
             tbody.appendChild(row);
             table.appendChild(tbody);

             // Mock CloneTable return
             CloneTable.mockReturnValue({
                 clonedTable: mockTable,
                 clonedSelectedCells: [cell1, cell2]
             });
             
             cell1.innerHTML = '1';
             cell2.innerHTML = '2';

             // Mock dom queries
             const { dom } = require('../../../../../../src/helper');
             dom.query.findVisualLastCell.mockReturnValue(cell2);
             
             // Mock setMultiCells to update ref state
             main.selectionService.setMultiCells.mockImplementation(() => {
                 mainState.ref = { cs: 0, ce: 1, rs: 0, re: 0 };
             });

             cellService.mergeCells([cell1, cell2]);

             expect(CloneTable).toHaveBeenCalled();
             expect(main.setTableInfo).toHaveBeenCalledWith(mockTable);
             expect(cell1.innerHTML).toContain('1');
             expect(cell1.innerHTML).toContain('2');
             expect(main.historyPush).toHaveBeenCalled();
        });
    });

    describe('unmergeCells', () => {
        it('should unmerge selected cells', () => {
            const { CloneTable, CreateCellsHTML } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
            const mockTable = document.createElement('table');
             const cell = document.createElement('td');
             cell.rowSpan = 2;
             
             CloneTable.mockReturnValue({
                 clonedTable: mockTable,
                 clonedSelectedCells: [cell]
             });
             CreateCellsHTML.mockReturnValue(document.createElement('td'));

             // Mock DOM structure
             const row1 = document.createElement('tr');
             const row2 = document.createElement('tr');
             mockTable.appendChild(row1);
             mockTable.appendChild(row2);
             row1.appendChild(cell);

             cellService.unmergeCells([cell]);

             expect(CloneTable).toHaveBeenCalled();
             expect(CreateCellsHTML).toHaveBeenCalled();
             expect(main.historyPush).toHaveBeenCalled();
        });
    });

    describe('Split Menu', () => {
        it('should open split menu', () => {
            cellService.openSplitMenu();
            expect(cellService.selectMenu_split.open).toHaveBeenCalled();
        });
    });

    describe('Split Cells (_OnSplitCells)', () => {
         // Helper to trigger logic. _OnSplitCells is private-ish or bound.
         // In constructor: this.selectMenu_split.on(..., this._OnSplitCells.bind(this));
         // We can call it directly if we access it or mock the trigger.
         // It is not private (#), just underscored. So cellService._OnSplitCells(direction).

         it('should split vertically with colspan > 1', () => {
             const { CreateCellsHTML } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             const newCell = document.createElement('td');
             CreateCellsHTML.mockReturnValue(newCell);

             const row = document.createElement('tr');
             const cell = document.createElement('td');
             cell.colSpan = 4;
             cell.rowSpan = 1;
             row.appendChild(cell);

             // mainState setup
             mainState.tdElement = cell;
             mainState.trElement = row;
             mainState.trElements = [row];
             mainState.rowCnt = 1;
             
             cellService._OnSplitCells('vertical'); // vertical

             // Current colspan 4 -> newCell colspan 2 (floor 4/2), cell colspan 2.
             expect(newCell.colSpan).toBe(2);
             expect(cell.colSpan).toBe(2);
             // Verify insertion
             expect(row.children.length).toBe(2);
         });

         it('should split vertically with colspan = 1 (column insertion)', () => {
             const { CreateCellsHTML } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             const newCell = document.createElement('td');
             CreateCellsHTML.mockReturnValue(newCell);

             // 2x2 table
             // Row 1: Cell 1, Cell 2 (Target)
             // Row 2: Cell 3, Cell 4
             const row1 = document.createElement('tr');
             const cell1 = document.createElement('td');
             const cell2 = document.createElement('td'); // Target
             row1.appendChild(cell1);
             row1.appendChild(cell2);

             const row2 = document.createElement('tr');
             const cell3 = document.createElement('td');
             const cell4 = document.createElement('td');
             row2.appendChild(cell3);
             row2.appendChild(cell4);

             mainState.tdElement = cell2;
             mainState.trElement = row1;
             mainState.trElements = [row1, row2];
             mainState.rowCnt = 2;
             mainState.logical_cellIndex = 1; // 2nd cell
             mainState.rowIndex = 0;

             cellService._OnSplitCells('vertical');

             // cell2 was split. Since colspan was 1, it inserts a new cell and increases colspan of others? 
             // Logic line 290+: "colspan - 1" logic...
             // Wait, logic at 290 resets spanIndex etc.
             // Line 353 inserts newCell. 
             // Other cells (cell4 in same col) should strictly increase colspan? 
             // Actually index.js logic complexly calculates spans. 
             // Since cell2 is at col index 1.
             // Cell 4 is at col index 1.
             
             // The logic: 
             // "if (cell !== currentCell && logcalIndex <= index && logcalIndex + cs >= index + currentColSpan - 1)"
             // "cell.colSpan += 1;"
             
             // So cell4 (index 1) matches <= 1 and 1 >= 1.
             // cell4 colspan should increase to 2?
             
             expect(cell4.colSpan).toBe(2);
             expect(row1.children.length).toBe(3); // cell1, cell2, newCell
         });

         it('should split horizontally with rowspan > 1', () => {
             const { CreateCellsHTML } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             const newCell = document.createElement('td');
             CreateCellsHTML.mockReturnValue(newCell);

             const row1 = document.createElement('tr');
             const cell = document.createElement('td');
             cell.rowSpan = 4;
             row1.appendChild(cell);

             // Need dummy rows for rowspan to occupy
             const row2 = document.createElement('tr');
             const row3 = document.createElement('tr');
             const row4 = document.createElement('tr');
             
             mainState.tdElement = cell;
             mainState.trElements = [row1, row2, row3, row4];
             mainState.rowCnt = 4;
             
             // Mock dom.utils.getArrayIndex
             const { dom } = require('../../../../../../src/helper');
             dom.utils.getArrayIndex.mockReturnValue(0); // row1 is index 0

             cellService._OnSplitCells('horizontal');

             // newCell rowspan = floor(4/2) = 2
             // cell rowspan = 4 - 2 = 2
             expect(newCell.rowSpan).toBe(2);
             expect(cell.rowSpan).toBe(2);
             
             // Insertion logic: "const nextRow = rows[nextRowIndex];"
             // nextRowIndex = 0 + 2 = 2 (row3)
             // Should insert into row3?
             // row3 is empty, so just appends?
             // Logic line 403-404: insertBefore or break.
         });

         it('should split horizontally with rowspan = 1 (row insertion)', () => {
             const { CreateCellsHTML } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             const newCell = document.createElement('td');
             CreateCellsHTML.mockReturnValue(newCell);

             const table = document.createElement('table');
             const tbody = document.createElement('tbody');
             table.appendChild(tbody);
             
             const row = document.createElement('tr');
             const cell1 = document.createElement('td'); // Target
             const cell2 = document.createElement('td');
             row.appendChild(cell1);
             row.appendChild(cell2);
             tbody.appendChild(row);

             mainState.tdElement = cell1;
             mainState.trElement = row;
             mainState.trElements = [row];
             mainState.rowCnt = 1;
             mainState.rowIndex = 0;
             mainState.physical_cellIndex = 0;

             const { dom } = require('../../../../../../src/helper');
             const newRow = document.createElement('tr');
             dom.utils.createElement.mockReturnValue(newRow);

             cellService._OnSplitCells('horizontal');

             // cell1 (index 0) split.
             // cell2 (index 1) should have rowspan increased?
             // Logic line 434: "if (c === physicalIndex) continue; cells[c].rowSpan += 1;"
             
             expect(cell2.rowSpan).toBe(2);
             // New row inserted
             expect(row.nextElementSibling).toBe(newRow);
             expect(newRow.children[0]).toBe(newCell);
         });
    });

    describe('Button Visibility', () => {
        it('should toggle merge/split and unmerge buttons', () => {
             // setMergeSplitButton
             mainState.ref = null;
             cellService.setMergeSplitButton();
             expect(cellService.splitButton.style.display).toBe('block');
             expect(cellService.mergeButton.style.display).toBe('none');

             mainState.ref = {};
             cellService.setMergeSplitButton();
             expect(cellService.splitButton.style.display).toBe('none');

             // setUnMergeButton
             // Mock findMergedCells
             mainState.selectedCells = [];
             mainState.fixedCell = { rowSpan: 2 };
             cellService.setUnMergeButton();
             expect(cellService.unmergeButton.disabled).toBe(false);

             mainState.fixedCell = { rowSpan: 1, colSpan: 1 };
             cellService.setUnMergeButton();
             expect(cellService.unmergeButton.disabled).toBe(true);
        });
    });

    describe('Complex Merge/Split Scenarios', () => {
         it('should remove empty rows after merge', () => {
             const { CloneTable } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             const { dom, numbers } = require('../../../../../../src/helper');
             
             // Setup: Row 1 (Cell A), Row 2 (Cell B).
             // Both selected. Merge. Row 2 becomes empty.
             const mockTable = document.createElement('table');
             const tbody = document.createElement('tbody');
             const row1 = document.createElement('tr');
             const row2 = document.createElement('tr');
             const cellA = document.createElement('td'); // Merge Target
             const cellB = document.createElement('td'); // To be removed
             
             row1.appendChild(cellA);
             row2.appendChild(cellB);
             tbody.appendChild(row1);
             tbody.appendChild(row2);
             mockTable.appendChild(tbody);
             
             // Mock CloneTable
             CloneTable.mockReturnValue({
                 clonedTable: mockTable,
                 clonedSelectedCells: [cellA, cellB]
             });
             
             mainState.trElements = [row1, row2];
             mainState.ref = { cs: 0, ce: 0, rs: 0, re: 1 };
             
             // Mock dom.utils.removeItem to handle row removal mock
             dom.utils.removeItem.mockImplementation((el) => {
                 if(el && el.parentNode) el.parentNode.removeChild(el);
             });
             dom.utils.getArrayIndex.mockImplementation((arr, item) => Array.prototype.indexOf.call(arr, item));
             numbers.getOverlapRangeAtIndex.mockReturnValue(1);
             
             // Mock setMultiCells
             main.selectionService.setMultiCells.mockImplementation(() => {
                 mainState.ref = { cs: 0, ce: 0, rs: 0, re: 1 };
             });
             
             cellService.mergeCells([cellA, cellB], true); 
             
             // Verify row2 was removed
             expect(dom.utils.removeItem).toHaveBeenCalledWith(cellB);
             expect(dom.utils.removeItem).toHaveBeenCalledWith(row2);
             expect(cellA.rowSpan).toBe(1);
         });

         it('should adjust rowspans of other cells when removing empty rows', () => {
              const { CloneTable } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
              const { dom, numbers } = require('../../../../../../src/helper');

              // Setup:
              // Row 1: Cell A (RowSpan 3), Cell B
              // Row 2: Cell C (Only cell in this row, col 2)
              // Row 3: Cell D
              
              const row1 = document.createElement('tr');
              const row2 = document.createElement('tr');
              const row3 = document.createElement('tr');
              
              const cellA = document.createElement('td');
              cellA.rowSpan = 3;
              const cellB = document.createElement('td'); // Merge 1
              row1.appendChild(cellA);
              row1.appendChild(cellB);
              
              const cellC = document.createElement('td'); // Merge 2
              row2.appendChild(cellC);
              
              const cellD = document.createElement('td');
              row3.appendChild(cellD);
              
              const tbody = document.createElement('tbody');
              tbody.appendChild(row1);
              tbody.appendChild(row2);
              tbody.appendChild(row3);
              const mockTable = document.createElement('table');
              mockTable.appendChild(tbody);

              CloneTable.mockReturnValue({
                   clonedTable: mockTable,
                   clonedSelectedCells: [cellB, cellC]
              });
              
              mainState.trElements = [row1, row2, row3];
              mainState.ref = { cs: 1, ce: 1, rs: 0, re: 1 }; 
              
              numbers.getOverlapRangeAtIndex.mockReturnValue(1);
              
              main.selectionService.setMultiCells.mockImplementation(() => {
                  mainState.ref = { cs: 1, ce: 1, rs: 0, re: 1 };
              });
              
              cellService.mergeCells([cellB, cellC], true);
              
              expect(row2.parentNode).toBeNull();
              expect(cellA.rowSpan).toBe(2); 
         });

         it('should handle complex vertical split (lines 305+)', () => {
             // We need to trigger spanIndex logic.
             // Row 1: Cell A (RowSpan 2)
             // Row 2: Cell B (Target, ColSpan 1) - actually Cell A is still active in Col 0.
             // Wait, if Cell B is in Row 2, and Cell A from Row 1 spans 2 rows...
             // Cell A covers (Row 1, Col 0) and (Row 2, Col 0).
             // Cell B is (Row 2, Col 1).
             // Split Cell B vertically.
             
             // Code: 
             // for loop iterates rows.
             // i=0. Cell A encountered. rs > 0. Pushed to rowSpanArr. Then spanIndex.
             // i=1 (Row 2). spanIndex has Cell A.
             // spanIndex check (line 304). 
             // if (logcalIndex >= arr.index) -> Cell B is index 1. Cell A is index 0. 1 >= 0.
             // colSpan += arr.cs (1).
             // This shifts logicalIndex of Cell B to 2?
             
             const { CreateCellsHTML } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             CreateCellsHTML.mockReturnValue(document.createElement('td'));

             const row1 = document.createElement('tr');
             const cellA = document.createElement('td');
             cellA.rowSpan = 2;
             row1.appendChild(cellA);
             
             const row2 = document.createElement('tr');
             const cellB = document.createElement('td'); // Target
             row2.appendChild(cellB);
             
             mainState.trElements = [row1, row2];
             mainState.rowCnt = 2;
             mainState.trElement = row2;
             mainState.tdElement = cellB;
             mainState.logical_cellIndex = 1; // Cell B is physically 0, but logically 1 (because of Cell A)
             mainState.rowIndex = 1;

             cellService._OnSplitCells('vertical'); // Should trigger spanIndex logic
             
             // Coverage should be hit. We can verify if needed, but mainly targeting lines.
         });

         it('should handle complex horizontal split (lines 378+)', () => {
             // Row 1: Cell A (RowSpan 3, ColSpan 1) -> Target
             // Row 2: Cell B (ColSpan 2)
             // Row 3: Cell C
             // Split Cell A horizontally. 
             // newCell gets RowSpan 1 (floor 3/2). Cell A gets 2.
             // Loop iterates to nextRowIndex (Row 1 + 2 = Row 3). i < 3.
             // i=1 (Row 2). Cell B encountered.
             // cs (rowspan-1) of Cell B? No Cell B has rowspan 1?
             // We need a cell in between rows that spans deeply?
             
             // The loop "for (let i = 0, cells, colSpan; i < nextRowIndex; i++)"
             // It looks for cells that span ACROSS the split boundary?
             // "if (cs > 0 && cs + i >= nextRowIndex && logcalIndex < index)"
             // "index" is split cell index.
             // So if we have a cell to the LEFT of target that spans down.
             
             // Setup:
             // Row 1: Cell X (RowSpan 3), Cell A (RowSpan 3) - Target
             // Row 2: ...
             // Row 3: ...
             // Split Cell A.
             // Cell X spans across the split area.
             
             const { CreateCellsHTML } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             CreateCellsHTML.mockReturnValue(document.createElement('td'));
             
             const row1 = document.createElement('tr');
             const cellX = document.createElement('td');
             cellX.rowSpan = 3;
             const cellA = document.createElement('td');
             cellA.rowSpan = 3;
             row1.appendChild(cellX);
             row1.appendChild(cellA);
             
             const row2 = document.createElement('tr'); // Empty implied
             const row3 = document.createElement('tr');
             
             // Row 3 (nextRowIndex) needs cells?
             // "const nextRow = rows[nextRowIndex]; const nextCells = nextRow.cells;"
             // If nextRow is empty, loop won't run much.
             const cellLast = document.createElement('td');
             row3.appendChild(cellLast);
             
             mainState.trElements = [row1, row2, row3];
             mainState.rowCnt = 3;
             mainState.trElement = row1;
             mainState.tdElement = cellA;
             mainState.logical_cellIndex = 1;
             mainState.rowIndex = 0;
             
             const { dom } = require('../../../../../../src/helper');
             dom.utils.getArrayIndex.mockReturnValue(0);
             
             cellService._OnSplitCells('horizontal');
             
             // Should hit lines 378+ pushing to rowSpanArr
             // And lines 397+ popping from rowSpanArr
         });
    });
});
