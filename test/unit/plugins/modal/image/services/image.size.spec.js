
import ImageSizeService from '../../../../../../src/plugins/modal/image/services/image.size';
import { Figure } from '../../../../../../src/modules/contract';

// Mock Figure static methods
jest.mock('../../../../../../src/modules/contract', () => ({
    Figure: {
        CalcRatio: jest.fn(),
        GetRatio: jest.fn()
    }
}));

// Mock helper
jest.mock('../../../../../../src/helper', () => ({
    keyCodeMap: {
        isSpace: jest.fn()
    },
    numbers: jest.requireActual('../../../../../../src/helper').numbers
}));

import { keyCodeMap } from '../../../../../../src/helper';

describe('ImageSizeService', () => {
    let service;
    let mockMain;
    let mockModalEl;
    let mockProportion;
    let mockInputX;
    let mockInputY;
    let mockRevertBtn;

    beforeEach(() => {
        mockProportion = { checked: true, disabled: false };
        mockInputX = { value: '', disabled: false };
        mockInputY = { value: '', disabled: false };
        mockRevertBtn = {};

        mockModalEl = {
            proportion: mockProportion,
            inputX: mockInputX,
            inputY: mockInputY,
            revertBtn: mockRevertBtn
        };

        mockMain = {
            state: { onlyPercentage: false, sizeUnit: 'px' },
            pluginOptions: {
                defaultWidth: '300px',
                defaultHeight: '150px',
                canResize: true
            },
            resizing: true,
            eventManager: {
                addEvent: jest.fn()
            },
            figure: {
                setSize: jest.fn(),
                isVertical: false
            }
        };

        // Make mockMain act as its own kernel for dependency injection
        mockMain.$ = mockMain;

        // Reset static mocks
        Figure.CalcRatio.mockReset();
        Figure.GetRatio.mockReset();
    });

    describe('Constructor', () => {
        it('should initialize input values from options', () => {
            service = new ImageSizeService(mockMain, mockModalEl);
            expect(mockInputX.value).toBe('300px');
            expect(mockInputY.value).toBe('150px');
            expect(mockMain.eventManager.addEvent).toHaveBeenCalledTimes(6);
        });

        it('should not initialize inputs if resizing is false', () => {
            mockMain.pluginOptions.canResize = false;
            service = new ImageSizeService(mockMain, mockModalEl);
             // Should not add events
             expect(mockMain.eventManager.addEvent).not.toHaveBeenCalled();
        });
    });

    describe('setInputSize', () => {
        beforeEach(() => {
            service = new ImageSizeService(mockMain, mockModalEl);
        });

        it('should set input values correctly', () => {
            service.setInputSize('500px', '200px');
            expect(mockInputX.value).toBe('500px');
            expect(mockInputY.value).toBe('200px');
        });

        it('should handle "auto" values', () => {
            service.setInputSize('auto', 'auto');
            expect(mockInputX.value).toBe('');
            expect(mockInputY.value).toBe('');
        });

        it('should show only the number of a percentage width and clear Y if onlyPercentage is true', () => {
            mockMain.state.onlyPercentage = true;
            mockInputY.value = '200px';
            service.setInputSize('50%', '120px');
            expect(mockInputX.value).toBe('50');
            expect(mockInputY.value).toBe('');
        });

        it('should leave X empty for a non-percentage width if onlyPercentage is true', () => {
            mockMain.state.onlyPercentage = true;
            service.setInputSize('300px', '150px');
            expect(mockInputX.value).toBe('');
            service.setInputSize('auto', 'auto');
            expect(mockInputX.value).toBe('');
        });
    });

    describe('applySize', () => {
        beforeEach(() => {
            service = new ImageSizeService(mockMain, mockModalEl);
        });

        it('should call figure.setSize with input values', () => {
            mockInputX.value = '100px';
            mockInputY.value = '50px';
            service.applySize();
            expect(mockMain.figure.setSize).toHaveBeenCalledWith('100px', '50px');
        });

        it('should use default values if inputs are empty', () => {
            mockInputX.value = '';
            mockInputY.value = ''; // default mockMain defaults are 300px, 150px
            service.applySize();
            expect(mockMain.figure.setSize).toHaveBeenCalledWith('300px', '150px');
        });

        it('should append percentage unit if missing when onlyPercentage is true', () => {
            mockMain.state.onlyPercentage = true;
            mockInputX.value = '50';
            service.applySize();
            expect(mockMain.figure.setSize).toHaveBeenCalledWith('50%', 'auto');
        });

        it('should not append percentage unit if present when onlyPercentage is true', () => {
            mockMain.state.onlyPercentage = true;
            mockInputX.value = '50%';
            service.applySize();
            expect(mockMain.figure.setSize).toHaveBeenCalledWith('50%', 'auto');
        });

        it('should ignore any height (typed or default) and use 100% for an empty width when onlyPercentage is true', () => {
            mockMain.state.onlyPercentage = true;
            mockMain.pluginOptions.defaultWidth = '';
            mockInputX.value = '';
            mockInputY.value = '300px';
            service.applySize();
            expect(mockMain.figure.setSize).toHaveBeenCalledWith('100%', 'auto');
        });
    });

    describe('ready', () => {
        beforeEach(() => {
            service = new ImageSizeService(mockMain, mockModalEl);
        });

        it('should calculate ratio if proportion is checked', () => {
             const figureInfo = { ratio: { w: 2, h: 1 } };
             service.ready(figureInfo, '400px', '200px');
             
             // Checking internal state via behavior if we cannot access #ratio directly
             // But we can check if inputs are enabled/disabled
             expect(mockInputX.disabled).toBe(false);
        });

        it('should disable inputs if percentage rotation logic applies', () => {
            mockMain.state.onlyPercentage = true;
            mockMain.figure.isVertical = true;
            const figureInfo = { ratio: { w: 1, h: 1 } };
            
            service.ready(figureInfo, '100px', '100px');
            
            expect(mockInputX.disabled).toBe(true);
            expect(mockInputY.disabled).toBe(true);
        });
    });

    describe('Interactions (private methods exposed via events)', () => {
        beforeEach(() => {
            service = new ImageSizeService(mockMain, mockModalEl);
        });

        it('should recalculate size on input change when proportion is checked', () => {
            // Simulate input x change logic (internal #OnInputSize)
            // We can't access private method directly, but we can call the bound function if we stored it?
            // Actually, we can just trigger the event if we had a real DOM or simulate it by mocking addEvent to store the cb.
            
            // Hack: access the callback passed to addEvent
            // addEvent calls: (target, type, callback)
            // 2nd call: inputX, keyup, callback
            const keyupXCallback = mockMain.eventManager.addEvent.mock.calls[0][2];
            
            mockInputX.value = '600'; // Double the default 300
            Figure.CalcRatio.mockReturnValue({ w: 600, h: 300 });
            
            // Trigger keyup on X
            keyupXCallback({ code: 'Digit6', target: mockInputX, preventDefault: jest.fn() });
            
            expect(Figure.CalcRatio).toHaveBeenCalled();
            // Y should be updated
            expect(mockInputY.value).toBe('300');
        });

        it('should revert options when revert button clicked', () => {
            const revertCallback = mockMain.eventManager.addEvent.mock.calls[5][2];
            
            // change values
            mockInputX.value = '999px';
            mockInputY.value = '999px';
            
            // set origin
            service.setOriginSize('300px', '150px');
            
            revertCallback();
            
            expect(mockInputX.value).toBe('300px');
            expect(mockInputY.value).toBe('150px');
        });

        it.each([
            ['40%', '40'],
            ['150%', '100'],
            ['300px', '100'],
            ['', '100'],
        ])('should revert to a 1-100 number when onlyPercentage is true (origin %s -> %s)', (origin, expected) => {
            mockMain.state.onlyPercentage = true;
            service = new ImageSizeService(mockMain, mockModalEl);
            const revertCallback = mockMain.eventManager.addEvent.mock.calls.filter((c) => c[1] === 'click').pop()[2];

            service.setOriginSize(origin, '150px');
            mockInputX.value = '10';
            revertCallback();

            expect(mockInputX.value).toBe(expected);
        });
    });
});
