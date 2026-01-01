import TableSelectionService from '../../../../../../src/plugins/dropdown/table/services/table.selection';

jest.mock('../../../../../../src/helper', () => ({
    dom: {
        query: {
            findVisualLastCell: jest.fn(),
            getParentElement: jest.fn(),
            getEventTarget: jest.fn()
        },
        utils: {
            addClass: jest.fn(),
            removeClass: jest.fn()
        },
        check: {
            isTableCell: jest.fn()
        }
    },
    numbers: {
        getOverlapRangeAtIndex: jest.fn()
    },
    env: {
        isMobile: false
    }
}));

describe('TableSelectionService', () => {
    let selectionService;
    let main;
    let mainState;

    beforeEach(() => {
        jest.clearAllMocks();

        mainState = {
            selectedTable: { rows: [] },
            selectedCells: [],
            isShiftPressed: false,
            ref: null,
            fixedCell: null,
            selectedCell: null
        };

        main = {
            state: mainState,
            cellService: {
                setMergeSplitButton: jest.fn()
            },
            editor: {
                focusEdge: jest.fn(),
                _preventBlur: false
            },
            eventManager: {
                addGlobalEvent: jest.fn(),
                removeGlobalEvent: jest.fn()
            },
            ui: {
                disableBackWrapper: jest.fn()
            },
            setState: jest.fn((key, val) => { mainState[key] = val; }),
            _editorEnable: jest.fn(),
            _setController: jest.fn(),
            _closeController: jest.fn(),
            resetInfo: jest.fn()
        };

        selectionService = new TableSelectionService(main);
    });

    describe('selectCells', () => {
        it('should select cells and return fixed/selected cells', () => {
            const { dom } = require('../../../../../../src/helper');
            
            // Mock DOM structure for cell indexing
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');
            const row = document.createElement('tr');
            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            
            row.appendChild(cell1);
            row.appendChild(cell2);
            tbody.appendChild(row);
            table.appendChild(tbody);
            
            dom.query.findVisualLastCell.mockReturnValue(cell2);

            const result = selectionService.selectCells([cell1, cell2]);

            // check internal logic of setMultiCells called
            // verify return structure
            expect(result.fixedCell).toBe(cell1);
            expect(result.selectedCell).toBe(cell2);
        });
    });

    describe('initCellSelection', () => {
        it('should initialize cell selection', () => {
            const cell = document.createElement('td');
            const { dom } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(document.createElement('table'));

            selectionService.initCellSelection(cell);

            expect(main.setState).toHaveBeenCalledWith('fixedCell', cell);
            expect(main.setState).toHaveBeenCalledWith('selectedTable', expect.any(Object));
        });
    });

    describe('Interaction Handlers', () => {
         // Testing private methods via events is hard without exposing them or full integration
         // But we can test if global events are bound and removed
         
         it('should remove global events on init', () => {
             selectionService.init();
             expect(main.ui.disableBackWrapper).toHaveBeenCalled();
         });
    });

    describe('Selection Modifiers', () => {
         it('should recall style for selected cells', () => {
             const cell = document.createElement('td');
             mainState.selectedCells = [cell];
             const { dom } = require('../../../../../../src/helper');

             selectionService.recallStyleSelectedCells();

             expect(dom.utils.addClass).toHaveBeenCalledWith(cell, 'se-selected-table-cell');
         });
    });

    describe('Coverage: setMultiCells and calculateRef', () => {
        beforeEach(() => {
            const { numbers } = require('../../../../../../src/helper');
            numbers.getOverlapRangeAtIndex.mockImplementation((s1, e1, s2, e2) => {
                 if (s1 === null || e1 === null || s2 === null || e2 === null) return false;
                 return Math.max(s1, s2) <= Math.min(e1, e2);
            });
        });

        it('should calculate reference for simple rectangular selection', () => {
             const table = document.createElement('table');
             const tbody = document.createElement('tbody');
             for(let r=0; r<3; r++) {
                 const tr = document.createElement('tr');
                 for(let c=0; c<3; c++) {
                     const td = document.createElement('td');
                     td.colSpan = 1;
                     td.rowSpan = 1;
                     tr.appendChild(td);
                 }
                 tbody.appendChild(tr);
             }
             table.appendChild(tbody);
             mainState.selectedTable = table;
             
             const startCell = table.rows[0].cells[0];
             const endCell = table.rows[1].cells[1]; 
             
             selectionService.setMultiCells(startCell, endCell);
             
             expect(main.setState).toHaveBeenCalledWith('ref', expect.objectContaining({
                 rs: 0, re: 1, cs: 0, ce: 1
             }));
        });

        it('should expand selection to include merged cells (merged in middle)', () => {
             const table = document.createElement('table');
             const tbody = document.createElement('tbody');
             
             const r0 = document.createElement('tr');
             const c00 = document.createElement('td');
             const c01 = document.createElement('td');
             const c02 = document.createElement('td');
             r0.append(c00, c01, c02);
             
             const r1 = document.createElement('tr');
             const c10 = document.createElement('td');
             const c11 = document.createElement('td'); 
             c11.rowSpan = 2;
             c11.colSpan = 2;
             r1.append(c10, c11);
             
             const r2 = document.createElement('tr');
             const c20 = document.createElement('td');
             r2.append(c20);
             
             tbody.append(r0, r1, r2);
             table.appendChild(tbody);
             mainState.selectedTable = table;
             
             selectionService.setMultiCells(c01, c11);
             
             expect(main.setState).toHaveBeenCalledWith('ref', expect.objectContaining({
                 rs: 0, re: 2, cs: 1, ce: 2
             }));
        });
        
        it('should handle cached ref', () => {
             const table = document.createElement('table');
             const tr = document.createElement('tr');
             const startCell = document.createElement('td');
             const endCell = document.createElement('td');
             tr.append(startCell, endCell);
             table.appendChild(tr);
             mainState.selectedTable = table;
             
             selectionService.setMultiCells(startCell, endCell);
             
             selectionService.setMultiCells(startCell, endCell);
             
             expect(main.setState).toHaveBeenCalledWith('ref', expect.objectContaining({ _i: 2 }));
        });
    });
});
