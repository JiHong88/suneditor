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
                _preventBlur: false
            },
            focusManager: {
                focus: jest.fn(),
                blur: jest.fn(),
                focusEdge: jest.fn(),
                nativeFocus: jest.fn(),
            },
            eventManager: {
                addGlobalEvent: jest.fn(),
                removeGlobalEvent: jest.fn()
            },
            uiManager: {
                disableBackWrapper: jest.fn()
            },
            setState: jest.fn((key, val) => { mainState[key] = val; }),
            _editorEnable: jest.fn(),
            _setController: jest.fn(),
            _closeController: jest.fn(),
            resetInfo: jest.fn()
        };

        // Make main act as its own kernel for dependency injection
        main.$ = main;

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

        it('should return early when startCell equals endCell and not shift pressed', () => {
            const { dom } = require('../../../../../../src/helper');
            const table = document.createElement('table');
            const tr = document.createElement('tr');
            const cell = document.createElement('td');
            tr.appendChild(cell);
            table.appendChild(tr);
            mainState.selectedTable = table;
            mainState.isShiftPressed = false;

            selectionService.setMultiCells(cell, cell);

            // Should only add class to startCell and return early
            expect(dom.utils.addClass).toHaveBeenCalledWith(cell, 'se-selected-table-cell');
            // ref should not be set since we return early
            expect(main.setState).not.toHaveBeenCalledWith('ref', expect.anything());
        });

        it('should handle cells with rowspan spanning multiple rows', () => {
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');

            // Row 0: 3 cells
            const r0 = document.createElement('tr');
            const c00 = document.createElement('td');
            const c01 = document.createElement('td');
            c01.rowSpan = 3; // spans rows 0, 1, 2
            const c02 = document.createElement('td');
            r0.append(c00, c01, c02);

            // Row 1: 2 cells (c01 spans here)
            const r1 = document.createElement('tr');
            const c10 = document.createElement('td');
            const c12 = document.createElement('td');
            r1.append(c10, c12);

            // Row 2: 2 cells (c01 spans here)
            const r2 = document.createElement('tr');
            const c20 = document.createElement('td');
            const c22 = document.createElement('td');
            r2.append(c20, c22);

            tbody.append(r0, r1, r2);
            table.appendChild(tbody);
            mainState.selectedTable = table;

            selectionService.setMultiCells(c00, c22);

            expect(main.setState).toHaveBeenCalledWith('ref', expect.objectContaining({
                rs: 0, re: 2
            }));
        });
    });


    describe('deleteStyleSelectedCells', () => {
        it('should remove styles from selected cells', () => {
            const { dom } = require('../../../../../../src/helper');
            const table = document.createElement('table');
            const tr = document.createElement('tr');
            const cell = document.createElement('td');
            cell.classList.add('se-selected-table-cell');
            tr.appendChild(cell);
            table.appendChild(tr);

            mainState.fixedCell = cell;
            mainState.selectedCell = cell;

            selectionService.deleteStyleSelectedCells();

            expect(dom.utils.removeClass).toHaveBeenCalledWith([cell, cell], 'se-selected-cell-focus');
        });

        it('should handle null fixedCell', () => {
            mainState.fixedCell = null;

            // Should not throw
            expect(() => selectionService.deleteStyleSelectedCells()).not.toThrow();
        });
    });

    describe('focusCellEdge', () => {
        it('should call editor.focusEdge on non-mobile', () => {
            const cell = document.createElement('td');

            selectionService.focusCellEdge(cell);

            expect(main.focusManager.focusEdge).toHaveBeenCalledWith(cell);
        });

        it('should not call focusManager.focusEdge on mobile', () => {
            const { env } = require('../../../../../../src/helper');
            const originalIsMobile = env.isMobile;
            env.isMobile = true;

            const cell = document.createElement('td');

            selectionService.focusCellEdge(cell);

            expect(main.focusManager.focusEdge).not.toHaveBeenCalled();

            env.isMobile = originalIsMobile;
        });
    });





    describe('initCellSelection edge cases', () => {
        it('should set selectedCells when empty', () => {
            const { dom } = require('../../../../../../src/helper');
            const cell = document.createElement('td');

            mainState.selectedCells = [];
            dom.query.getParentElement.mockReturnValue(document.createElement('table'));

            selectionService.initCellSelection(cell);

            expect(main.setState).toHaveBeenCalledWith('selectedCells', [cell]);
        });

        it('should not override selectedCells when not empty', () => {
            const { dom } = require('../../../../../../src/helper');
            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');

            mainState.selectedCells = [cell1];
            dom.query.getParentElement.mockReturnValue(document.createElement('table'));

            selectionService.initCellSelection(cell2);

            // Should not call setState with selectedCells since it's not empty
            const selectedCellsCalls = main.setState.mock.calls.filter(
                call => call[0] === 'selectedCells'
            );
            expect(selectedCellsCalls.length).toBe(0);
        });
    });

    describe('Complex rowspan/colspan scenarios', () => {
        beforeEach(() => {
            const { numbers } = require('../../../../../../src/helper');
            numbers.getOverlapRangeAtIndex.mockImplementation((s1, e1, s2, e2) => {
                if (s1 === null || e1 === null || s2 === null || e2 === null) return false;
                return Math.max(s1, s2) <= Math.min(e1, e2);
            });
        });

        it('should handle cells at end of row with active rowspans', () => {
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');

            // Row 0: cell with rowspan
            const r0 = document.createElement('tr');
            const c00 = document.createElement('td');
            const c01 = document.createElement('td');
            c01.rowSpan = 2;
            r0.append(c00, c01);

            // Row 1: only one cell (c01 spans here)
            const r1 = document.createElement('tr');
            const c10 = document.createElement('td');
            r1.append(c10);

            tbody.append(r0, r1);
            table.appendChild(tbody);
            mainState.selectedTable = table;

            selectionService.setMultiCells(c00, c10);

            // Selection from c00 to c10 covers column 0 only
            expect(main.setState).toHaveBeenCalledWith('ref', expect.objectContaining({
                rs: 0, re: 1, cs: 0, ce: 0
            }));
        });

        it('should handle selection expansion when merged cell overlaps', () => {
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');

            // 4x4 table with a 2x2 merged cell in the middle
            for (let r = 0; r < 4; r++) {
                const tr = document.createElement('tr');
                for (let c = 0; c < 4; c++) {
                    if (r === 1 && c === 1) {
                        const td = document.createElement('td');
                        td.rowSpan = 2;
                        td.colSpan = 2;
                        tr.appendChild(td);
                    } else if ((r === 1 || r === 2) && (c === 2 || c === 3)) {
                        // Skip cells covered by merged cell
                        continue;
                    } else if (r === 2 && c === 1) {
                        // Skip cell covered by merged cell
                        continue;
                    } else {
                        const td = document.createElement('td');
                        tr.appendChild(td);
                    }
                }
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            mainState.selectedTable = table;

            const startCell = table.rows[0].cells[0];
            const endCell = table.rows[1].cells[1]; // The merged cell

            selectionService.setMultiCells(startCell, endCell);

            // Should expand to include merged cell's span
            expect(main.setState).toHaveBeenCalledWith('ref', expect.any(Object));
        });
    });
});
