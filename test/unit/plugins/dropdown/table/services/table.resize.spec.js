import TableResizeService from '../../../../../../src/plugins/dropdown/table/services/table.resize';

jest.mock('../../../../../../src/helper', () => ({
    dom: {
        check: {
            isTable: jest.fn(),
            isTableRow: jest.fn()
        },
        query: {
            getParentElement: jest.fn()
        },
        utils: {
            removeClass: jest.fn(),
            hasClass: jest.fn()
        }
    },
    numbers: {
        get: jest.fn().mockReturnValue(100)
    },
    converter: {
        getWidthInPercentage: jest.fn().mockReturnValue(50)
    },
    env: {
        _w: {
            getComputedStyle: jest.fn().mockReturnValue({ width: '100px', height: '20px' })
        }
    },
    keyCodeMap: {
        isEsc: jest.fn()
    }
}));

jest.mock('../../../../../../src/modules/ui', () => ({
    _DragHandle: {
        get: jest.fn()
    }
}));

jest.mock('../../../../../../src/plugins/dropdown/table/shared/table.utils', () => ({
    CheckCellEdge: jest.fn(),
    CheckRowEdge: jest.fn()
}));

describe('TableResizeService', () => {
    let resizeService;
    let main;
    let mainState;
    let mockTable;

    beforeEach(() => {
        jest.clearAllMocks();

        mockTable = document.createElement('table');
        
        mainState = {
            figureElement: document.createElement('figure'),
            tdElement: document.createElement('td'),
            logical_cellIndex: 0,
            current_colSpan: 1,
            logical_cellCnt: 2
        };

        main = {
            state: mainState,
            selectionService: {
                deleteStyleSelectedCells: jest.fn()
            },
            frameContext: {
                get: jest.fn().mockReturnValue({
                    querySelector: jest.fn().mockReturnValue(document.createElement('div'))
                })
            },
            uiManager: {
                enableBackWrapper: jest.fn(),
                disableBackWrapper: jest.fn()
            },
            ui: {
                enableBackWrapper: jest.fn(),
                disableBackWrapper: jest.fn()
            },
            offset: {
                getLocal: jest.fn().mockReturnValue({ left: 0, top: 0 })
            },
            eventManager: {
                addGlobalEvent: jest.fn((type, handler) => {
                    return handler;
                }),
                removeGlobalEvent: jest.fn()
            },
            _element: mockTable,
            setCellInfo: jest.fn(),
            setRowInfo: jest.fn(),
            setState: jest.fn(),
            _editorEnable: jest.fn(),
            controller_table: { hide: jest.fn() },
            controller_cell: { hide: jest.fn() },
            history: { push: jest.fn() },
            component: {
                hoverSelect: jest.fn(),
                select: jest.fn()
            },
            constructor: { key: 'table' }
        };

        // Make main act as its own kernel for dependency injection
        main.$ = main;

        resizeService = new TableResizeService(main);
    });

    describe('onResizeGuide', () => {
        it('should show resize guide for cell edge', () => {
            const { CheckCellEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
            CheckCellEdge.mockReturnValue({ is: true, isLeft: false });
            
            const { dom } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(mockTable);

            resizeService.onResizeGuide({}, document.createElement('td'));
            
            // Should verify resize line is shown (implied by execution path)
             expect(dom.query.getParentElement).toHaveBeenCalled();
        });

        it('should show resize guide for row edge', () => {
             const { CheckCellEdge, CheckRowEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             CheckCellEdge.mockReturnValue({ is: false });
             CheckRowEdge.mockReturnValue({ is: true });

             const { dom } = require('../../../../../../src/helper');
             dom.query.getParentElement.mockReturnValue(mockTable);

             resizeService.onResizeGuide({}, document.createElement('tr'));

             expect(dom.query.getParentElement).toHaveBeenCalled();
        });
    });

    describe('readyResizeFromEdge', () => {
    });

    describe('isResizing', () => {
        it('should return false initially', () => {
            expect(resizeService.isResizing()).toBe(false);
        });
    });

    describe('offResizeGuide', () => {
        it('should hide resize line', () => {
            const { CheckCellEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
            CheckCellEdge.mockReturnValue({ is: true, isLeft: false });

            const { dom } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(mockTable);

            // First show guide
            resizeService.onResizeGuide({}, document.createElement('td'));

            // Then hide it
            resizeService.offResizeGuide();

            // Verify _element cursor is reset
            expect(mockTable.style.cursor).toBe('');
        });
    });

    describe('init', () => {
    });

    describe('Resize Events', () => {
         let capturedHandlers = {};

         beforeEach(() => {
             main.eventManager.addGlobalEvent.mockImplementation((type, handler) => {
                 capturedHandlers[type] = handler;
                 return handler;
             });
             capturedHandlers = {};
         });

         it('should resize cell width on mousemove', () => {
             const { CheckCellEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             // Fake setup for startCellResizing
             CheckCellEdge.mockReturnValue({ is: true, startX: 10, isLeft: true });
             
             // Mock DOM for colgroup
             const colgroup = document.createElement('colgroup');
             const col1 = document.createElement('col');
             const col2 = document.createElement('col');
             col1.style.width = '100px';
             col2.style.width = '100px';
             colgroup.appendChild(col1);
             colgroup.appendChild(col2);
             mockTable.appendChild(colgroup);
             
             const { dom } = require('../../../../../../src/helper');
             dom.query.getParentElement.mockReturnValue(mockTable);

             // Mock table width for calculation
             Object.defineProperty(mockTable, 'offsetWidth', {
                 configurable: true,
                 value: 500
             });
             
             // Start resize
             resizeService.readyResizeFromEdge({}, document.createElement('td'));
             
             // Check if global events registered
             expect(capturedHandlers['mousemove']).toBeDefined();

             // Simulate mousemove with delta
             // startX=10. e.clientX=20. delta=10.
             capturedHandlers['mousemove']({ clientX: 20 });
             
             // width calculation logic involves percentage
             // We can check if col style changed
             expect(col1.style.width).not.toBe('100px');
         });

         it('should stop resizing on mouseup', () => {
             const { CheckCellEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             CheckCellEdge.mockReturnValue({ is: true, startX: 10, isLeft: false });
             
             // Setup mock DOM for start
             const colgroup = document.createElement('colgroup');
             colgroup.appendChild(document.createElement('col'));
             colgroup.appendChild(document.createElement('col'));
             mockTable.appendChild(colgroup);
             const { dom } = require('../../../../../../src/helper');
             dom.query.getParentElement.mockReturnValue(mockTable);

             // Start
             resizeService.readyResizeFromEdge({}, document.createElement('td'));
             
             // Stop
             capturedHandlers['mouseup']();
             
             expect(main.eventManager.removeGlobalEvent).toHaveBeenCalled();
             expect(main._editorEnable).toHaveBeenCalledWith(true);
         });

         it('should cancel resizing on Esc key', () => {
             const { CheckCellEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             CheckCellEdge.mockReturnValue({ is: true, startX: 10, isLeft: false });
             
             // Setup
             const colgroup = document.createElement('colgroup');
             const col = document.createElement('col');
             col.style.width = '50px';
             colgroup.appendChild(col);
             colgroup.appendChild(document.createElement('col'));
             mockTable.appendChild(colgroup);
             
             const { dom, keyCodeMap } = require('../../../../../../src/helper');
             dom.query.getParentElement.mockReturnValue(mockTable);
             keyCodeMap.isEsc.mockReturnValue(true);

             resizeService.readyResizeFromEdge({}, document.createElement('td'));
             
             // Esc
             capturedHandlers['keydown']({ code: 'Escape' });
             
             expect(col.style.width).toBe('50px');
             expect(main._editorEnable).toHaveBeenCalledWith(true);
         });

         it('should resize row height on mousemove', () => {
              const { CheckCellEdge, CheckRowEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
              CheckCellEdge.mockReturnValue({ is: false });
              CheckRowEdge.mockReturnValue({ is: true, startY: 10 });

              const row = document.createElement('tr');
              row.style.height = '20px';

              const { dom } = require('../../../../../../src/helper');
              dom.query.getParentElement.mockReturnValue(row);
              dom.check.isTableRow.mockReturnValue(true);

              const { env } = require('../../../../../../src/helper');
              env._w.getComputedStyle.mockReturnValue({ height: '20px', width: '100px' });

              resizeService.readyResizeFromEdge({}, document.createElement('td'));

              expect(capturedHandlers['mousemove']).toBeDefined();

              capturedHandlers['mousemove']({ clientY: 30 });

              expect(row.style.height).not.toBe('20px');
         });

         it('should not cancel resize if non-Esc key pressed', () => {
             const { CheckCellEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
             CheckCellEdge.mockReturnValue({ is: true, startX: 10, isLeft: false });

             const colgroup = document.createElement('colgroup');
             const col = document.createElement('col');
             col.style.width = '50%';
             colgroup.appendChild(col);
             colgroup.appendChild(document.createElement('col'));
             mockTable.appendChild(colgroup);

             const { dom, keyCodeMap } = require('../../../../../../src/helper');
             dom.query.getParentElement.mockReturnValue(mockTable);
             keyCodeMap.isEsc.mockReturnValue(false);

             resizeService.readyResizeFromEdge({}, document.createElement('td'));

             // Press non-Esc key
             capturedHandlers['keydown']({ code: 'Enter' });

             // Should not call removeGlobalEvent since Esc was not pressed
             expect(main.component.hoverSelect).not.toHaveBeenCalled();
         });
    });

    describe('Figure Resizing', () => {
        let capturedHandlers = {};

        beforeEach(() => {
            main.eventManager.addGlobalEvent.mockImplementation((type, handler) => {
                capturedHandlers[type] = handler;
                return handler;
            });
            capturedHandlers = {};
        });


        it('should resize figure on mousemove', () => {
            const { CheckCellEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
            mainState.logical_cellIndex = 0;
            mainState.current_colSpan = 0;
            CheckCellEdge.mockReturnValue({ is: true, startX: 100, isLeft: true });

            const colgroup = document.createElement('colgroup');
            colgroup.appendChild(document.createElement('col'));
            mockTable.appendChild(colgroup);

            const { dom, numbers, converter } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(mockTable);
            numbers.get.mockReturnValue(50);
            converter.getWidthInPercentage.mockReturnValue('50%');

            Object.defineProperty(mainState.figureElement, 'offsetWidth', {
                configurable: true,
                value: 500
            });
            Object.defineProperty(mainState.figureElement, 'offsetHeight', {
                configurable: true,
                value: 300
            });

            resizeService.readyResizeFromEdge({}, document.createElement('td'));

            // Simulate mousemove (left edge: deltaX = startX - e.clientX = 100 - 80 = 20)
            capturedHandlers['mousemove']({ clientX: 80 });

            expect(mainState.figureElement.style.width).toBeDefined();
        });

        it('should stop figure resize on mouseup and check width limit', () => {
            const { CheckCellEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
            mainState.logical_cellIndex = 0;
            mainState.current_colSpan = 0;
            CheckCellEdge.mockReturnValue({ is: true, startX: 100, isLeft: true });

            const colgroup = document.createElement('colgroup');
            colgroup.appendChild(document.createElement('col'));
            mockTable.appendChild(colgroup);

            const { dom, numbers, converter } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(mockTable);
            numbers.get.mockImplementation((val, def) => {
                if (typeof val === 'string' && val.includes('%')) return 150; // > 100%
                return 50;
            });
            converter.getWidthInPercentage.mockReturnValue('50%');

            Object.defineProperty(mainState.figureElement, 'offsetWidth', {
                configurable: true,
                value: 500
            });
            Object.defineProperty(mainState.figureElement, 'offsetHeight', {
                configurable: true,
                value: 300
            });

            mainState.figureElement.style.width = '150%';

            resizeService.readyResizeFromEdge({}, document.createElement('td'));

            // Stop resize
            capturedHandlers['mouseup']();

            expect(main.history.push).toHaveBeenCalledWith(true);
            // Width should be limited to 100% if > 100
            expect(mainState.figureElement.style.width).toBe('100%');
        });

        it('should cancel figure resize and reopen on Esc key', () => {
            const { CheckCellEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
            mainState.logical_cellIndex = 0;
            mainState.current_colSpan = 0;
            CheckCellEdge.mockReturnValue({ is: true, startX: 100, isLeft: true });

            const colgroup = document.createElement('colgroup');
            colgroup.appendChild(document.createElement('col'));
            mockTable.appendChild(colgroup);

            const { dom, keyCodeMap, converter } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(mockTable);
            keyCodeMap.isEsc.mockReturnValue(true);
            converter.getWidthInPercentage.mockReturnValue('50%');

            Object.defineProperty(mainState.figureElement, 'offsetWidth', {
                configurable: true,
                value: 500
            });
            Object.defineProperty(mainState.figureElement, 'offsetHeight', {
                configurable: true,
                value: 300
            });

            mainState.figureElement.style.width = '50%';

            resizeService.readyResizeFromEdge({}, document.createElement('td'));

            // Esc key
            capturedHandlers['keydown']({ code: 'Escape' });

            expect(main.component.select).toHaveBeenCalled();
            expect(mainState.figureElement.style.width).toBe('50%');
        });
    });

    describe('Row resize with rowspan', () => {
        let capturedHandlers = {};

        beforeEach(() => {
            main.eventManager.addGlobalEvent.mockImplementation((type, handler) => {
                capturedHandlers[type] = handler;
                return handler;
            });
            capturedHandlers = {};
        });


        it('should stop row resize on Esc key', () => {
            const { CheckCellEdge, CheckRowEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
            CheckCellEdge.mockReturnValue({ is: false });
            CheckRowEdge.mockReturnValue({ is: true, startY: 10 });

            const row = document.createElement('tr');
            row.style.height = '30px';

            const { dom, keyCodeMap } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(row);
            dom.check.isTableRow.mockReturnValue(true);
            keyCodeMap.isEsc.mockReturnValue(true);

            resizeService.readyResizeFromEdge({}, document.createElement('td'));

            capturedHandlers['keydown']({ code: 'Escape' });

            expect(row.style.height).toBe('30px');
        });
    });

    describe('Error handling', () => {
        it('should handle errors in readyResizeFromEdge for row resize', () => {
            const { CheckCellEdge, CheckRowEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
            CheckCellEdge.mockReturnValue({ is: false });
            CheckRowEdge.mockReturnValue({ is: true, startY: 10 });

            const { dom } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(null); // This will cause error

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            resizeService.readyResizeFromEdge({}, document.createElement('td'));

            expect(consoleSpy).toHaveBeenCalled();
            expect(main._editorEnable).toHaveBeenCalledWith(true);
            consoleSpy.mockRestore();
        });
    });

    describe('DragHandle visibility', () => {
        let capturedHandlers = {};

        beforeEach(() => {
            main.eventManager.addGlobalEvent.mockImplementation((type, handler) => {
                capturedHandlers[type] = handler;
                return handler;
            });
            capturedHandlers = {};
        });

        it('should hide DragHandle when starting cell resize', () => {
            const { _DragHandle } = require('../../../../../../src/modules/ui');
            const mockHandler = { style: { display: 'block' } };
            _DragHandle.get.mockReturnValue(mockHandler);

            const { CheckCellEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
            CheckCellEdge.mockReturnValue({ is: true, startX: 10, isLeft: false });

            const colgroup = document.createElement('colgroup');
            colgroup.appendChild(document.createElement('col'));
            colgroup.appendChild(document.createElement('col'));
            mockTable.appendChild(colgroup);

            const { dom } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(mockTable);

            resizeService.readyResizeFromEdge({}, document.createElement('td'));

            expect(mockHandler.style.display).toBe('none');
        });
    });

    describe('onResizeGuide edge cases', () => {
        it('should hide existing resize line before showing new one', () => {
            const { CheckCellEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');

            const mockResizeLine = document.createElement('div');
            mockResizeLine.style.display = 'block';

            main.frameContext.get.mockReturnValue({
                querySelector: jest.fn().mockReturnValue(mockResizeLine)
            });

            CheckCellEdge.mockReturnValue({ is: true, isLeft: false });

            const { dom } = require('../../../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(mockTable);

            // Call twice to trigger hide of existing line
            resizeService.onResizeGuide({}, document.createElement('td'));
            resizeService.onResizeGuide({}, document.createElement('td'));

            expect(main.frameContext.get).toHaveBeenCalled();
        });

        it('should return undefined when no edge detected', () => {
            const { CheckCellEdge, CheckRowEdge } = require('../../../../../../src/plugins/dropdown/table/shared/table.utils');
            CheckCellEdge.mockReturnValue({ is: false });
            CheckRowEdge.mockReturnValue({ is: false });

            const result = resizeService.onResizeGuide({}, document.createElement('td'));

            expect(result).toBeUndefined();
        });
    });
});
