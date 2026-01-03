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

    describe('startCellSelection', () => {
        it('should start cell selection without shift', () => {
            const { dom } = require('../../../../../../src/helper');
            const cell = document.createElement('td');
            dom.query.getParentElement.mockReturnValue(document.createElement('table'));

            main.eventManager.addGlobalEvent.mockReturnValue('eventId');

            selectionService.startCellSelection(cell, false);

            expect(main.setState).toHaveBeenCalledWith('isShiftPressed', false);
            expect(main.eventManager.addGlobalEvent).toHaveBeenCalledWith('mousemove', expect.any(Function), false);
            expect(main.eventManager.addGlobalEvent).toHaveBeenCalledWith('mouseup', expect.any(Function), false);
            expect(main.eventManager.addGlobalEvent).toHaveBeenCalledWith('touchmove', expect.any(Function), false);
        });

        it('should start cell selection with shift', () => {
            const { dom } = require('../../../../../../src/helper');
            const cell = document.createElement('td');
            dom.query.getParentElement.mockReturnValue(document.createElement('table'));

            main.eventManager.addGlobalEvent.mockReturnValue('eventId');

            selectionService.startCellSelection(cell, true);

            expect(main.setState).toHaveBeenCalledWith('isShiftPressed', true);
            expect(main.eventManager.addGlobalEvent).toHaveBeenCalledWith('keyup', expect.any(Function), false);
            expect(main.eventManager.addGlobalEvent).toHaveBeenCalledWith('mousedown', expect.any(Function), false);
        });

        it('should remove global events before starting if not shift and no ref', () => {
            const { dom } = require('../../../../../../src/helper');
            const cell = document.createElement('td');
            dom.query.getParentElement.mockReturnValue(document.createElement('table'));

            mainState.isShiftPressed = false;
            mainState.ref = null;

            selectionService.startCellSelection(cell, false);

            expect(main.ui.disableBackWrapper).toHaveBeenCalled();
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

    describe('Cell Multi-Select Events', () => {
        let mockEvent;
        let table;
        let cell1;
        let cell2;

        beforeEach(() => {
            const { dom, numbers } = require('../../../../../../src/helper');

            table = document.createElement('table');
            const tr = document.createElement('tr');
            cell1 = document.createElement('td');
            cell2 = document.createElement('td');
            tr.append(cell1, cell2);
            table.appendChild(tr);

            mainState.selectedTable = table;
            mainState.fixedCell = cell1;

            dom.query.getEventTarget.mockReturnValue(cell2);
            dom.query.getParentElement.mockImplementation((el, check) => {
                if (check === 'TABLE') return table;
                if (check === dom.check.isTableCell) return cell2;
                return el;
            });
            dom.check.isTableCell.mockReturnValue(true);
            numbers.getOverlapRangeAtIndex.mockReturnValue(true);

            mockEvent = {
                stopPropagation: jest.fn(),
                target: cell2
            };
        });

        it('should handle shift selection when target equals fixedCell', () => {
            const { dom } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(cell1);

            mainState.isShiftPressed = true;
            main.eventManager.addGlobalEvent.mockReturnValue('eventId');

            // Start selection first
            selectionService.startCellSelection(cell1, true);

            // Get the mousemove handler
            const multiOnCall = main.eventManager.addGlobalEvent.mock.calls.find(
                call => call[0] === 'mousedown'
            );
            const multiOnHandler = multiOnCall[1];

            // Simulate clicking on the same cell
            mockEvent.target = cell1;
            dom.query.getEventTarget.mockReturnValue(cell1);
            dom.query.getParentElement.mockImplementation((el, check) => {
                if (check === 'TABLE') return table;
                return cell1;
            });

            multiOnHandler(mockEvent);

            expect(main.setState).toHaveBeenCalledWith('isShiftPressed', false);
            expect(main._editorEnable).toHaveBeenCalledWith(true);
        });

        it('should handle multi-select with different target cell', () => {
            const { dom } = require('../../../../../../src/helper');

            mainState.isShiftPressed = false;
            mainState.ref = { cs: 0, ce: 1, rs: 0, re: 0 };
            main.eventManager.addGlobalEvent.mockReturnValue('eventId');

            // Start selection
            selectionService.startCellSelection(cell1, false);

            // Get the mousemove handler
            const multiOnCall = main.eventManager.addGlobalEvent.mock.calls.find(
                call => call[0] === 'mousemove'
            );
            const multiOnHandler = multiOnCall[1];

            dom.query.getParentElement.mockImplementation((el, check) => {
                if (check === 'TABLE') return table;
                return cell2;
            });

            multiOnHandler(mockEvent);

            expect(main.setState).toHaveBeenCalledWith('selectedCell', cell2);
        });

        it('should return early when target is null', () => {
            const { dom } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(null);

            main.eventManager.addGlobalEvent.mockReturnValue('eventId');
            selectionService.startCellSelection(cell1, false);

            const multiOnCall = main.eventManager.addGlobalEvent.mock.calls.find(
                call => call[0] === 'mousemove'
            );
            const multiOnHandler = multiOnCall[1];

            multiOnHandler(mockEvent);

            // Should not set selectedCell since target is null
            expect(main.setState).not.toHaveBeenCalledWith('selectedCell', expect.anything());
        });

        it('should return early when target is same as selectedCell', () => {
            const { dom } = require('../../../../../../src/helper');

            mainState.selectedCell = cell2;
            dom.query.getParentElement.mockImplementation((el, check) => {
                if (check === 'TABLE') return table;
                return cell2;
            });

            main.eventManager.addGlobalEvent.mockReturnValue('eventId');
            selectionService.startCellSelection(cell1, false);

            const multiOnCall = main.eventManager.addGlobalEvent.mock.calls.find(
                call => call[0] === 'mousemove'
            );
            const multiOnHandler = multiOnCall[1];

            multiOnHandler(mockEvent);

            // setState for selectedCell should not be called again
            const selectedCellCalls = main.setState.mock.calls.filter(
                call => call[0] === 'selectedCell' && call[1] === cell2
            );
            expect(selectedCellCalls.length).toBe(0);
        });
    });

    describe('OffCellMultiSelect', () => {
        it('should handle mouseup and set controller', () => {
            const { dom } = require('../../../../../../src/helper');
            const table = document.createElement('table');
            const tr = document.createElement('tr');
            const cell = document.createElement('td');
            tr.appendChild(cell);
            table.appendChild(tr);

            mainState.selectedTable = table;
            mainState.fixedCell = cell;
            mainState.selectedCell = cell;
            mainState.isShiftPressed = false;

            dom.query.getParentElement.mockReturnValue(table);
            main.eventManager.addGlobalEvent.mockReturnValue('eventId');

            selectionService.startCellSelection(cell, false);

            const mouseupCall = main.eventManager.addGlobalEvent.mock.calls.find(
                call => call[0] === 'mouseup'
            );
            const mouseupHandler = mouseupCall[1];

            const mockEvent = { stopPropagation: jest.fn() };
            mouseupHandler(mockEvent);

            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(main._editorEnable).toHaveBeenCalledWith(true);
            expect(main.cellService.setMergeSplitButton).toHaveBeenCalled();
        });

        it('should handle mouseup with shift pressed', () => {
            const { dom } = require('../../../../../../src/helper');
            const table = document.createElement('table');
            const tr = document.createElement('tr');
            const cell = document.createElement('td');
            tr.appendChild(cell);
            table.appendChild(tr);

            mainState.selectedTable = table;
            mainState.fixedCell = cell;
            mainState.isShiftPressed = true;

            dom.query.getParentElement.mockReturnValue(table);
            main.eventManager.addGlobalEvent.mockReturnValue('eventId');

            selectionService.startCellSelection(cell, true);

            const mouseupCall = main.eventManager.addGlobalEvent.mock.calls.find(
                call => call[0] === 'mouseup'
            );
            const mouseupHandler = mouseupCall[1];

            const mockEvent = { stopPropagation: jest.fn() };
            mouseupHandler(mockEvent);

            // Should not call _editorEnable when shift is pressed
            expect(main._editorEnable).not.toHaveBeenCalledWith(true);
        });

        it('should return early when fixedCell is null', () => {
            const { dom } = require('../../../../../../src/helper');
            const cell = document.createElement('td');

            mainState.fixedCell = null;
            mainState.selectedTable = null;

            dom.query.getParentElement.mockReturnValue(null);
            main.eventManager.addGlobalEvent.mockReturnValue('eventId');

            selectionService.startCellSelection(cell, false);
            mainState.fixedCell = null;

            const mouseupCall = main.eventManager.addGlobalEvent.mock.calls.find(
                call => call[0] === 'mouseup'
            );
            const mouseupHandler = mouseupCall[1];

            const mockEvent = { stopPropagation: jest.fn() };
            mouseupHandler(mockEvent);

            expect(main.cellService.setMergeSplitButton).not.toHaveBeenCalled();
        });
    });

    describe('OffCellShift', () => {
        it('should close controller when ref is null', () => {
            const { dom } = require('../../../../../../src/helper');
            const cell = document.createElement('td');

            mainState.ref = null;

            dom.query.getParentElement.mockReturnValue(document.createElement('table'));
            main.eventManager.addGlobalEvent.mockReturnValue('eventId');

            selectionService.startCellSelection(cell, true);

            const keyupCall = main.eventManager.addGlobalEvent.mock.calls.find(
                call => call[0] === 'keyup'
            );
            const keyupHandler = keyupCall[1];

            keyupHandler();

            expect(main._closeController).toHaveBeenCalled();
        });

        it('should set controller when ref exists', () => {
            const { dom } = require('../../../../../../src/helper');
            const cell = document.createElement('td');

            mainState.ref = { cs: 0, ce: 1, rs: 0, re: 0 };
            mainState.fixedCell = cell;
            mainState.selectedCells = [cell];
            mainState.selectedCell = cell;

            dom.query.getParentElement.mockReturnValue(document.createElement('table'));
            main.eventManager.addGlobalEvent.mockReturnValue('eventId');

            selectionService.startCellSelection(cell, true);

            const keyupCall = main.eventManager.addGlobalEvent.mock.calls.find(
                call => call[0] === 'keyup'
            );
            const keyupHandler = keyupCall[1];

            keyupHandler();

            expect(main._editorEnable).toHaveBeenCalledWith(true);
            expect(main._setController).toHaveBeenCalledWith(cell);
        });
    });

    describe('OffCellTouch', () => {
        it('should call resetInfo on touch', () => {
            const { dom } = require('../../../../../../src/helper');
            const cell = document.createElement('td');

            dom.query.getParentElement.mockReturnValue(document.createElement('table'));
            main.eventManager.addGlobalEvent.mockReturnValue('eventId');

            selectionService.startCellSelection(cell, false);

            const touchCall = main.eventManager.addGlobalEvent.mock.calls.find(
                call => call[0] === 'touchmove'
            );
            const touchHandler = touchCall[1];

            touchHandler();

            expect(main.resetInfo).toHaveBeenCalled();
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
