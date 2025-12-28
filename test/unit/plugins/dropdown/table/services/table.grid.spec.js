import TableGridService from '../../../../../../src/plugins/dropdown/table/services/table.grid';

jest.mock('../../../../../../src/helper', () => ({
    dom: {
        utils: {
            removeItem: jest.fn(),
            getArrayIndex: jest.fn(),
            createElement: jest.fn((tag) => ({
                style: {},
                appendChild: jest.fn(),
                innerHTML: '',
                children: [] 
            }))
        }
    },
    numbers: {
        getOverlapRangeAtIndex: jest.fn(),
        get: jest.fn()
    },
    env: {
        _w: {
            getComputedStyle: jest.fn().mockReturnValue({ width: '0px' })
        }
    }
}));

jest.mock('../../../../../../src/modules/ui', () => ({
    SelectMenu: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        create: jest.fn(),
        open: jest.fn(),
        close: jest.fn(),
        menus: [{ style: {} }, { style: {} }]
    }))
}));

jest.mock('../../../../../../src/plugins/dropdown/table/shared/table.utils', () => ({
    CreateCellsHTML: jest.fn().mockReturnValue({ nodeName: 'TD' }),
    CreateCellsString: jest.fn().mockReturnValue('<td></td>'),
    InvalidateTableCache: jest.fn()
}));

jest.mock('../../../../../../src/plugins/dropdown/table/render/table.menu', () => ({
    CreateColumnMenu: jest.fn().mockReturnValue({ items: [], menus: [] }),
    CreateRowMenu: jest.fn().mockReturnValue({ items: [], menus: [] })
}));

describe('TableGridService', () => {
    let gridService;
    let main;
    let mainState;
    let mockTable;

    beforeEach(() => {
        jest.clearAllMocks();

        mockTable = document.createElement('table');
        const tbody = document.createElement('tbody');
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        row.appendChild(cell);
        tbody.appendChild(row);
        mockTable.appendChild(tbody);

        mainState = {
            trElement: row,
            tdElement: cell,
            logical_cellCnt: 1,
            rowCnt: 1,
            rowIndex: 0,
            trElements: [row],
            current_colSpan: 0,
            logical_cellIndex: 0
        };

        main = {
            state: mainState,
            _element: mockTable,
            editor: {},
            lang: {},
            icons: {},
            selectionService: {
                deleteStyleSelectedCells: jest.fn()
            },
            setCellInfo: jest.fn(),
            resetInfo: jest.fn(),
            _closeTableSelectInfo: jest.fn(),
            _setCellControllerPosition: jest.fn(),
            _closeController: jest.fn(),
            historyPush: jest.fn()
        };

        const buttons = {
            columnButton: document.createElement('button'),
            rowButton: document.createElement('button'),
            openCellMenuFunc: jest.fn(),
            closeCellMenuFunc: jest.fn()
        };

        // Override mock implementation to return real DOM node
        const { CreateCellsHTML } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
        CreateCellsHTML.mockImplementation((tag, count) => document.createElement('td'));

        // Use real DOM creation for better structure testing
        const { dom } = require('../../../../../../src/helper');
        dom.utils.createElement.mockImplementation((tag) => document.createElement(tag));
        dom.utils.getArrayIndex.mockImplementation((arr, item) => Array.prototype.indexOf.call(arr, item));
        dom.utils.removeItem.mockImplementation((el) => {
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });

        gridService = new TableGridService(main, buttons);
    });

    describe('insertBodyRow', () => {
        it('should insert a new row into the table', () => {
             const index = 1;
             const cellCount = 1;
             
             // insertBodyRow(table, index, cellCnt)
             const newRow = gridService.insertBodyRow(mockTable, index, cellCount);
             
             expect(newRow.nodeName).toBe('TR');
             expect(mockTable.rows.length).toBeGreaterThan(1);
        });
    });

    describe('editColumn', () => {
        it('should insert cells to the right', () => {
            mainState.trElements = [mainState.trElement];
            mainState.rowCnt = 1;
            mainState.logical_cellCnt = 1;
            mainState.logical_cellIndex = 0;
            mainState.current_colSpan = 0;
            
            const row = mainState.trElement;
            gridService.editColumn('right');
            expect(row.cells.length).toBe(2);
        });
        
        it('should insert cells to the left', () => {
             mainState.trElements = [mainState.trElement];
             mainState.rowCnt = 1;
             mainState.logical_cellCnt = 1;
             mainState.logical_cellIndex = 0;
             mainState.current_colSpan = 0;
             
             const row = mainState.trElement;
             gridService.editColumn('left');
             expect(row.cells.length).toBe(2);
        });

        it('should increase colspan if inserting inside a merged cell', () => {
             const row = document.createElement('tr');
             const cell = document.createElement('td');
             cell.colSpan = 2;
             row.appendChild(cell);
             
             mainState.trElements = [row];
             mainState.rowCnt = 1;
             mainState.logical_cellCnt = 2;
             
             mainState.logical_cellIndex = 1; 
             mainState.current_colSpan = 0;
             
             gridService.editColumn('left');
             
             expect(cell.colSpan).toBe(3);
        });

        it('should delete a column', () => {
             mainState.trElements = [mainState.trElement];
             mainState.rowCnt = 1;
             mainState.logical_cellCnt = 1;
             
             gridService.editColumn(null);
             
             expect(mainState.trElement.cells.length).toBe(0);
        });
        
        it('should update colgroup when inserting', () => {
             const colgroup = document.createElement('colgroup');
             const col = document.createElement('col');
             col.style.width = '100%';
             colgroup.appendChild(col);
             mockTable.insertBefore(colgroup, mockTable.firstChild);
             
             mainState.trElements = [mainState.trElement];
             mainState.logical_cellCnt = 1;
             mainState.logical_cellIndex = 0;
             mainState.current_colSpan = 0;
             
             const { numbers } = require('../../../../../../src/helper');
             numbers.get.mockReturnValue(100);
             
             gridService.editColumn('right');
             
             expect(colgroup.children.length).toBe(2);
        });

        it('should update colgroup when deleting', () => {
             const colgroup = document.createElement('colgroup');
             const col = document.createElement('col');
             colgroup.appendChild(col);
             mockTable.insertBefore(colgroup, mockTable.firstChild);
             
             mainState.trElements = [mainState.trElement];
             mainState.logical_cellCnt = 1;
             
             gridService.editColumn(null);
             
             const { dom } = require('../../../../../../src/helper');
             expect(dom.utils.removeItem).toHaveBeenCalledWith(col);
        });
        
        it('should handle rowspans during deletion', () => {
             const row1 = document.createElement('tr');
             const cell1 = document.createElement('td');
             cell1.rowSpan = 2;
             row1.appendChild(cell1);
             
             const row2 = document.createElement('tr');
             
             mainState.trElements = [row1, row2];
             mainState.rowCnt = 2;
             mainState.logical_cellCnt = 1;
             mainState.logical_cellIndex = 0;
             mainState.current_colSpan = 0;
             
             gridService.editColumn(null);
             
             const { dom } = require('../../../../../../src/helper');
             expect(dom.utils.removeItem).toHaveBeenCalledWith(cell1);
        });
        
        it('should handle partial overlapping colspan deletion', () => {
             const row = document.createElement('tr');
             const cell = document.createElement('td');
             cell.colSpan = 3;
             row.appendChild(cell);
             
             mainState.trElements = [row];
             mainState.rowCnt = 1;
             mainState.logical_cellCnt = 3;
             mainState.logical_cellIndex = 1; 
             mainState.current_colSpan = 0;
             
             const { numbers } = require('../../../../../../src/helper');
             numbers.getOverlapRangeAtIndex.mockReturnValue(1); 
             
             gridService.editColumn(null);
             
             expect(numbers.getOverlapRangeAtIndex).toHaveBeenCalled();
             expect(cell.colSpan).toBe(2);
        });
    });

    describe('editRow', () => {
        it('should insert row down', () => {
            const spyInsertBodyRow = jest.spyOn(gridService, 'insertBodyRow');
            gridService.editRow('down');
            expect(spyInsertBodyRow).toHaveBeenCalled();
        });

        it('should insert row up', () => {
            const spyInsertBodyRow = jest.spyOn(gridService, 'insertBodyRow');
            gridService.editRow('up');
            expect(spyInsertBodyRow).toHaveBeenCalled();
        });

        it('should delete row', () => {
            const spyDeleteRow = jest.spyOn(mockTable, 'deleteRow');
            
            mainState.rowIndex = 0;
            mainState.trElements = [mainState.trElement];
            
            gridService.editRow(null); 
            
            expect(spyDeleteRow).toHaveBeenCalled();
            expect(mockTable.rows.length).toBe(0);
        });

        it('should handle rowspans when inserting row (bridging)', () => {
             const row1 = document.createElement('tr');
             const cell1 = document.createElement('td');
             cell1.rowSpan = 2;
             const cell2 = document.createElement('td');
             row1.appendChild(cell1);
             row1.appendChild(cell2);
             
             const row2 = document.createElement('tr');
             const cell3 = document.createElement('td');
             row2.appendChild(cell3);
             
             const tbody = mockTable.querySelector('tbody');
             tbody.innerHTML = '';
             tbody.appendChild(row1);
             tbody.appendChild(row2);
             
             mainState.trElements = [row1, row2];
             mainState.rowCnt = 2;
             mainState.rowIndex = 1; 
             mainState.logical_cellCnt = 2;
             
             gridService.editRow('up');
             
             expect(cell1.rowSpan).toBe(3);
             
             const newRow = tbody.rows[1];
             expect(newRow.cells.length).toBe(1);
        });
        
        it('should handle deleting row with rowspans', () => {
             const row1 = document.createElement('tr');
             const cell1 = document.createElement('td');
             cell1.rowSpan = 2;
             cell1.textContent = 'Preserved Content';
             cell1.className = 'test-class';
             const cell2 = document.createElement('td');
             row1.appendChild(cell1);
             row1.appendChild(cell2);
             
             const row2 = document.createElement('tr');
             const cell3 = document.createElement('td');
             row2.appendChild(cell3);
             
             const tbody = mockTable.querySelector('tbody');
             tbody.innerHTML = '';
             tbody.appendChild(row1);
             tbody.appendChild(row2);
             
             mainState.trElements = [row1, row2];
             mainState.rowCnt = 2;
             mainState.rowIndex = 0; 
             
             gridService.editRow(null);
             
             expect(tbody.rows.length).toBe(1);
             const newRow1 = tbody.rows[0];
             expect(newRow1).toBe(row2);
             
             // cell1 is cloned/moved. It should be a different object but have correct props.
             const newCell = newRow1.cells[0];
             expect(newCell).not.toBe(cell1);
             expect(newCell.rowSpan).toBe(1);
             expect(newCell.textContent).toBe('Preserved Content');
             expect(newCell.className).toBe('test-class');
             expect(newRow1.cells[1]).toBe(cell3);
        });
    });

    describe('editTable', () => {
        it('should handle multi-row deletion', () => {
            // Setup 2 rows selected
            const row1 = document.createElement('tr');
            const row2 = document.createElement('tr');
            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            row1.appendChild(cell1);
            row2.appendChild(cell2);
            mockTable.appendChild(row1);
            mockTable.appendChild(row2);
            
            mainState.ref = {}; // Enable multi-selection logic
            mainState.selectedCells = [cell1, cell2];
            mainState.tdElement = cell1;
            
            const spyEditRow = jest.spyOn(gridService, 'editRow');
            spyEditRow.mockImplementation(() => {});
            
            gridService.editTable('row', null);
            
            // Should call editRow twice
            expect(spyEditRow).toHaveBeenCalledTimes(2);
        });
        
        it('should handle multi-column deletion', () => {
            const row = document.createElement('tr');
            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            row.appendChild(cell1);
            row.appendChild(cell2);
            
            mainState.ref = {};
            mainState.selectedCells = [cell1, cell2];
            mainState.tdElement = cell1;
            
            const spyEditColumn = jest.spyOn(gridService, 'editColumn');
            spyEditColumn.mockImplementation(() => {});
            
            gridService.editTable('cell', null);
            
            expect(spyEditColumn).toHaveBeenCalledTimes(2);
        });
        
        it('should clean up empty table parts', () => {
            const tbody = document.createElement('tbody');
            mockTable.appendChild(tbody);
            // editTable(..., null) triggers cleanup lines 147+
            
            const { dom } = require('../../../../../../src/helper');
            
            gridService.editTable('row', null);
            
            expect(dom.utils.removeItem).toHaveBeenCalledWith(tbody);
        });

        it('should remove table if empty', () => {
            const { dom } = require('../../../../../../src/helper');
            
            gridService.editTable('row', null);
            
            expect(dom.utils.removeItem).toHaveBeenCalledWith(mockTable);
        });

        it('should not move up if in THEAD', () => {
             const thread = document.createElement('thead');
             const row = document.createElement('tr');
             thread.appendChild(row);
             mockTable.appendChild(thread);
             
             mainState.trElement = row;
             
             const spyEditRow = jest.spyOn(gridService, 'editRow');
             
             gridService.editTable('row', 'up');
             
             expect(spyEditRow).not.toHaveBeenCalled();
        });
    describe('Menu Actions', () => {
         it('should match column menu actions', () => {
             const call = gridService.selectMenu_column.on.mock.calls[0];
             const callback = call[1];
             
             const spyEditTable = jest.spyOn(gridService, 'editTable');
             spyEditTable.mockImplementation(() => {});
             
             const spyPush = jest.spyOn(main, 'historyPush');

             callback('insert-left');
             expect(spyEditTable).toHaveBeenCalledWith('cell', 'left');
             expect(spyPush).toHaveBeenCalled();
             
             callback('insert-right');
             expect(spyEditTable).toHaveBeenCalledWith('cell', 'right');
             
             callback('delete');
             expect(spyEditTable).toHaveBeenCalledWith('cell', null);
         });
         
         it('should match row menu actions', () => {
             const call = gridService.selectMenu_row.on.mock.calls[0];
             const callback = call[1];
             
             const spyEditTable = jest.spyOn(gridService, 'editTable');
             spyEditTable.mockImplementation(() => {});
             
             const spyPush = jest.spyOn(main, 'historyPush');
             
             callback('insert-above');
             expect(spyEditTable).toHaveBeenCalledWith('row', 'up');
             expect(spyPush).toHaveBeenCalled();
             
             callback('insert-below');
             expect(spyEditTable).toHaveBeenCalledWith('row', 'down');
             
             callback('delete');
             expect(spyEditTable).toHaveBeenCalledWith('row', null);
         });
    });

    describe('Open Menus', () => {
         it('should open column menu', () => {
             gridService.openColumnMenu();
             expect(gridService.selectMenu_column.open).toHaveBeenCalled();
         });
         
         it('should open row menu', () => {
             // Mock selectMenu_row.menus style
             gridService.selectMenu_row.menus = [{ style: {} }, { style: {} }];
             mainState.tdElement = { nodeName: 'TD' };
             
             gridService.openRowMenu();
             
             expect(gridService.selectMenu_row.open).toHaveBeenCalled();
             expect(gridService.selectMenu_row.menus[0].style.display).toBe('');
         });
         
         it('should hide insert options in row menu if TH', () => {
             gridService.selectMenu_row.menus = [{ style: {} }, { style: {} }];
             mainState.tdElement = { nodeName: 'TH' };
             
             gridService.openRowMenu();
                          
              expect(gridService.selectMenu_row.menus[0].style.display).toBe('none');
         });
    });

    describe('editTable Header Logic', () => {
         it('should handle editTable in THEAD', () => {
              const thead = document.createElement('thead');
              const row = document.createElement('tr');
              thead.appendChild(row);
              mockTable.appendChild(thead);
              
              mainState.trElement = row;
              
              gridService.editTable('row', 'up'); 
              
              const { dom } = require('../../../../../../src/helper');
              gridService.editTable('row', null);
              expect(dom.utils.removeItem).toHaveBeenCalledWith(mainState.figureElement);
              
              gridService.editTable('row', 'down');
              expect(mockTable.innerHTML).toContain('tbody');
         });
    });

    describe('Complex editRow/editColumn', () => {
         it('should append moved cells to next row if next row is short', () => {
             const row1 = document.createElement('tr');
             const cell1 = document.createElement('td');
             cell1.rowSpan = 2;
             row1.appendChild(cell1);
             const row2 = document.createElement('tr');
             const tbody = document.createElement('tbody');
             tbody.appendChild(row1);
             tbody.appendChild(row2);
             mockTable.appendChild(tbody);
             
             mainState.trElements = [row1, row2];
             mainState.rowIndex = 0;
             mainState.logical_cellCnt = 1;
             mainState.rowCnt = 2;
             mainState.current_rowSpan = 0; // Initialize
             
             // Mock tdElement for editRow return value
             mainState.tdElement = cell1;
             
             gridService.editRow(null); 
             // cell1 moved to row2
             expect(row2.cells.length).toBe(1);
         });

         it('should handle editColumn with overlapping rowspans', () => {
              const row1 = document.createElement('tr');
              const cell1 = document.createElement('td');
              cell1.rowSpan = 3;
              row1.appendChild(cell1);
              
              const row2 = document.createElement('tr');
              const cell2 = document.createElement('td');
              row2.appendChild(cell2);
              
              const row3 = document.createElement('tr');
              const cell3 = document.createElement('td');
              row3.appendChild(cell3);
              
              const tbody = document.createElement('tbody');
              tbody.appendChild(row1);
              tbody.appendChild(row2);
              tbody.appendChild(row3);
              mockTable.appendChild(tbody);
              
              mainState.trElements = [row1, row2, row3];
              mainState.rowIndex = 1;
              mainState.logical_cellIndex = 1; 
              mainState.trElement = row2;
              
              gridService.editColumn('left');
         });
         it('should handle editColumn with overlapping rowspans ending', () => {
              // Row 1: Cell 1 (rowspan=2), Cell 2
              // Row 2: Cell 3
              // Row 3: Cell 4
              
              const row1 = document.createElement('tr');
              const cell1 = document.createElement('td');
              cell1.rowSpan = 2;
              const cell2 = document.createElement('td');
              row1.appendChild(cell1);
              row1.appendChild(cell2);
              
              const row2 = document.createElement('tr');
              const cell3 = document.createElement('td');
              row2.appendChild(cell3);
              
              const row3 = document.createElement('tr');
              const cell4 = document.createElement('td');
              row3.appendChild(cell4);
              
              const tbody = document.createElement('tbody');
              tbody.appendChild(row1);
              tbody.appendChild(row2);
              tbody.appendChild(row3);
              mockTable.appendChild(tbody);
              
              mainState.trElements = [row1, row2, row3];
              // Target second column (cell 3 in row 2 is effectively column 1)
              // Cell 1 is col 0. Can we insert right of Cell 1?
              // Select Cell 2 (Row 1, Col 1). Insert Left?
              
              mainState.trElement = row1;
              mainState.tdElement = cell2;
              mainState.logical_cellIndex = 1;
              
              // Mock getOverlapRangeAtIndex if needed, but spanIndex logic should trigger
              gridService.editColumn('left');
         });
    });
});
});
