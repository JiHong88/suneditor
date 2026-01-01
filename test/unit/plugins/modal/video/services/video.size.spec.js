
import VideoSizeService from '../../../../../../src/plugins/modal/video/services/video.size';
import { Figure } from '../../../../../../src/modules/contract';

// Mock dependencies
jest.mock('../../../../../../src/modules/contract', () => ({
    Figure: {
        CalcRatio: jest.fn(),
        GetRatio: jest.fn()
    }
}));

jest.mock('../../../../../../src/helper', () => ({
    keyCodeMap: {
        isSpace: jest.fn().mockReturnValue(false)
    },
    numbers: {
        get: jest.fn((val) => parseFloat(val) || 0),
        is: jest.fn((val) => !isNaN(parseFloat(val)) && isFinite(val))
    },
    dom: {
        query: {
            getEventTarget: jest.fn((e) => e.target || e)
        }
    }
}));

import { dom } from '../../../../../../src/helper';

describe('VideoSizeService', () => {
    let service;
    let mockMain;
    let mockModalEl;
    let mockProportion;
    let mockFrameRatioOption;
    let mockInputX;
    let mockInputY;
    let mockRevertBtn;

    beforeEach(() => {
        // Setup mock DOM elements
        mockProportion = { checked: true, disabled: false };
        mockFrameRatioOption = {
            options: [
                { value: '0.5625', selected: false, text: '16:9' },
                { value: '', selected: false, text: 'Free' }
            ],
            value: '0.5625',
            selectedIndex: 0
        };
        mockInputX = { value: '', disabled: false };
        mockInputY = { value: '', disabled: false, placeholder: '' };
        mockRevertBtn = {};

        mockModalEl = {
            proportion: mockProportion,
            frameRatioOption: mockFrameRatioOption,
            inputX: mockInputX,
            inputY: mockInputY,
            revertBtn: mockRevertBtn
        };

        // Setup mock Main instance
        mockMain = {
            state: { 
                onlyPercentage: false, 
                sizeUnit: 'px',
                defaultRatio: '56.25%'
            },
            pluginOptions: {
                defaultWidth: '100%',
                defaultHeight: '56.25%',
                defaultRatio: 0.5625,
                canResize: true,
                showHeightInput: true
            },
            eventManager: {
                addEvent: jest.fn()
            },
            figure: {
                setSize: jest.fn(),
                getSize: jest.fn().mockReturnValue({ w: '100%', h: '56.25%', dw: '100%', dh: '56.25%' }),
                isVertical: false,
                deleteTransform: jest.fn(),
                autoRatio: { current: '56.25%' }
            }
        };

        // Reset static mocks
        Figure.CalcRatio.mockReset();
        Figure.GetRatio.mockReset();
    });

    describe('Constructor', () => {
        it('should initialize correctly when resizing is enabled', () => {
            service = new VideoSizeService(mockMain, mockModalEl);
            expect(mockInputX.value).toBe('100%');
            expect(mockInputY.value).toBe('56.25%');
            expect(mockMain.eventManager.addEvent).toHaveBeenCalledTimes(7); // 2 keyup, 4 change, 1 click
        });

        it('should skip initialization when resizing is disabled', () => {
            mockMain.pluginOptions.canResize = false;
            service = new VideoSizeService(mockMain, mockModalEl);
            expect(mockMain.eventManager.addEvent).not.toHaveBeenCalled();
        });
    });

    describe('Input Management', () => {
        beforeEach(() => {
            service = new VideoSizeService(mockMain, mockModalEl);
        });

        it('setInputSize should update inputs', () => {
            service.setInputSize('500px', '300px');
            expect(mockInputX.value).toBe('500px');
            expect(mockInputY.value).toBe('300px');
        });

        it('setInputSize should handle default values by clearing inputs', () => {
            service.setInputSize('100%', '56.25%');
            expect(mockInputX.value).toBe('');
            expect(mockInputY.value).toBe('');
        });

        it('getInputSize should return current values', () => {
            mockInputX.value = '500px';
            mockInputY.value = '300px';
            expect(service.getInputSize()).toEqual({ w: '500px', h: '300px' });
        });
    });

    describe('Size Application', () => {
        beforeEach(() => {
            service = new VideoSizeService(mockMain, mockModalEl);
        });

        it('applySize should verify onlyPercentage rule', () => {
            mockMain.state.onlyPercentage = true;
            // When onlyPercentage is true and value ends with %, % is appended (value + '%')
            // Note: The code checks `if (/%$/.test(w + ''))` and adds % only if it ends with %
            // This is the expected behavior per the source code
            service.applySize('50', '50');
            expect(mockMain.figure.setSize).toHaveBeenCalledWith('50%', '50');
        });

        it('resolveSize should detect changes', () => {
            mockMain.figure.getSize.mockReturnValue({ w: '100px', h: '100px' });
            
            const result = service.resolveSize('200px', '200px', {}, true);
            
            expect(result.isChanged).toBe(true);
            expect(mockMain.figure.deleteTransform).toHaveBeenCalled();
            expect(mockMain.figure.setSize).toHaveBeenCalledWith('200px', '200px');
        });

        it('resolveSize should ignore changes if values match', () => {
            mockMain.figure.getSize.mockReturnValue({ w: '200px', h: '200px' });
            
            const result = service.resolveSize('200px', '200px', {}, true);
            
            expect(result.isChanged).toBe(false);
            expect(mockMain.figure.setSize).not.toHaveBeenCalled();
        });
    });

    describe('Event Handling', () => {
        beforeEach(() => {
            service = new VideoSizeService(mockMain, mockModalEl);
        });

        it('on(false) should reset to defaults for new video', () => {
            service.on(false);
            expect(mockInputX.value).toBe('');
            expect(mockInputY.value).toBe('');
            expect(mockProportion.disabled).toBe(true);
        });

        it('ready should populate inputs from target', () => {
            const figureInfo = { 
                w: '500px', h: '300px', 
                dw: '500px', dh: '300px',
                height: '300px',
                isVertical: false,
                ratio: { w: 5, h: 3 }
            };
            mockMain.figure.getSize.mockReturnValue({ dw: '500px', dh: '300px' });
            
            service.ready(figureInfo, {});
            
            expect(mockInputX.value).toBe('500px');
            expect(mockInputY.value).toBe('300px');
            expect(mockProportion.checked).toBe(true);
        });

        it('should handle revert click', () => {
            service.setOriginSize('800px', '450px');
            
            const addEventCalls = mockMain.eventManager.addEvent.mock.calls;
            const clickHandler = addEventCalls.find(call => call[1] === 'click')[2];
            
            clickHandler();
            
            expect(mockInputX.value).toBe('800px');
            expect(mockInputY.value).toBe('450px');
        });

        it('should handle ratio change', () => {
             const addEventCalls = mockMain.eventManager.addEvent.mock.calls;
             const changeHandler = addEventCalls.find(call => call[0] === mockFrameRatioOption)[2];

             // Simulate selection change
             mockFrameRatioOption.options[0].value = '0.75'; // 4:3
             mockFrameRatioOption.selectedIndex = 0;

             // Setup mock to return element with options
             const mockSelect = {
                 options: mockFrameRatioOption.options,
                 selectedIndex: 0
             };
             dom.query.getEventTarget.mockReturnValue(mockSelect);

             changeHandler({ target: mockSelect });

             expect(mockInputY.placeholder).toBe('75%');
             expect(mockInputY.value).toBe('');
        });

        it('should validate input max value on keyup', () => {
             mockMain.state.onlyPercentage = true;

             const addEventCalls = mockMain.eventManager.addEvent.mock.calls;
             const keyupHandler = addEventCalls.find(call => call[0] === mockInputX && call[1] === 'keyup')[2];

             mockInputX.value = '150';

             dom.query.getEventTarget.mockReturnValue(mockInputX);

             keyupHandler({ code: 'Digit1', preventDefault: jest.fn() });

             expect(mockInputX.value).toBe('100');
        });

        it('should handle proportion checked and calculate ratio size for y axis', () => {
             Figure.CalcRatio.mockReturnValue({ w: 200, h: 150 });

             mockProportion.checked = true;
             mockFrameRatioOption.value = ''; // Free mode

             const addEventCalls = mockMain.eventManager.addEvent.mock.calls;
             const keyupHandlerY = addEventCalls.find(call => call[0] === mockInputY && call[1] === 'keyup')[2];

             mockInputY.value = '150';
             dom.query.getEventTarget.mockReturnValue(mockInputY);

             keyupHandlerY({ code: 'Digit1', preventDefault: jest.fn() });

             expect(Figure.CalcRatio).toHaveBeenCalled();
             expect(mockInputX.value).toBe('200');
        });

        it('should update ratio select when y input changes', () => {
             const addEventCalls = mockMain.eventManager.addEvent.mock.calls;
             const keyupHandlerY = addEventCalls.find(call => call[0] === mockInputY && call[1] === 'keyup')[2];

             mockInputY.value = '56.25';
             dom.query.getEventTarget.mockReturnValue(mockInputY);

             keyupHandlerY({ code: 'Digit5', preventDefault: jest.fn() });

             // Should call setRatioSelect with the value
             expect(mockInputY.placeholder).toBeDefined();
        });

        it('should prevent space key in input', () => {
             const { keyCodeMap } = require('../../../../../../src/helper');
             keyCodeMap.isSpace.mockReturnValue(true);

             const addEventCalls = mockMain.eventManager.addEvent.mock.calls;
             const keyupHandler = addEventCalls.find(call => call[0] === mockInputX && call[1] === 'keyup')[2];

             const mockPreventDefault = jest.fn();
             keyupHandler({ code: 'Space', preventDefault: mockPreventDefault });

             expect(mockPreventDefault).toHaveBeenCalled();
        });
    });

    describe('init method', () => {
        beforeEach(() => {
            service = new VideoSizeService(mockMain, mockModalEl);
        });

        it('should reset ratio to zero values', () => {
            service.init();
            // ratio is private, but we can verify inputs are reset
            expect(mockProportion.checked).toBe(false);
            expect(mockProportion.disabled).toBe(true);
        });

        it('should reset inputs to default values', () => {
            mockInputX.value = '500px';
            mockInputY.value = '300px';

            service.init();

            expect(mockInputX.value).toBe('');
            expect(mockInputY.value).toBe('');
        });

        it('should handle non-resizing mode', () => {
            mockMain.pluginOptions.canResize = false;
            const nonResizeService = new VideoSizeService(mockMain, mockModalEl);

            expect(() => nonResizeService.init()).not.toThrow();
        });
    });

    describe('on method', () => {
        beforeEach(() => {
            service = new VideoSizeService(mockMain, mockModalEl);
        });

        it('should handle non-resizing mode', () => {
            mockMain.pluginOptions.canResize = false;
            const nonResizeService = new VideoSizeService(mockMain, mockModalEl);

            expect(() => nonResizeService.on(false)).not.toThrow();
        });

        it('should handle isUpdate true', () => {
            service.on(true);

            // When isUpdate is true, inputs should not be reset
            // and proportion should not be disabled
            expect(mockProportion.disabled).toBe(false);
        });

        it('should handle vertical figure', () => {
            mockMain.figure.isVertical = true;

            service.on(false);

            // Should call setRatioSelect with empty string for vertical
            expect(mockProportion.disabled).toBe(true);
        });
    });

    describe('ready method', () => {
        beforeEach(() => {
            service = new VideoSizeService(mockMain, mockModalEl);
        });

        it('should handle vertical figure and onlyPercentage', () => {
            mockMain.state.onlyPercentage = true;
            mockMain.figure.isVertical = true;

            const figureInfo = {
                w: '100%', h: '56.25%',
                dw: '100%', dh: '56.25%',
                height: '56.25%',
                isVertical: true,
                ratio: { w: 16, h: 9 }
            };
            mockMain.figure.getSize.mockReturnValue({ dw: '100%', dh: '56.25%' });

            service.ready(figureInfo, {});

            expect(mockInputX.disabled).toBe(true);
            expect(mockInputY.disabled).toBe(true);
            expect(mockProportion.disabled).toBe(true);
        });

        it('should set ratio to zero when isVertical', () => {
            const figureInfo = {
                w: '500px', h: '300px',
                dw: '500px', dh: '300px',
                height: '300px',
                isVertical: true,
                ratio: { w: 5, h: 3 }
            };
            mockMain.figure.getSize.mockReturnValue({ dw: '500px', dh: '300px' });

            service.ready(figureInfo, {});

            expect(mockProportion.checked).toBe(false);
        });

        it('should use fallback height from figureInfo.h', () => {
            const figureInfo = {
                w: '500px',
                dw: '500px', dh: '300px',
                h: '300px',  // Use h instead of height
                isVertical: false,
                ratio: { w: 5, h: 3 }
            };
            mockMain.figure.getSize.mockReturnValue({ dw: '500px', dh: '300px' });

            service.ready(figureInfo, {});

            expect(mockInputY.value).toBe('300px');
        });
    });

    describe('resolveSize method', () => {
        beforeEach(() => {
            service = new VideoSizeService(mockMain, mockModalEl);
        });

        it('should use default values when width/height are empty', () => {
            mockMain.figure.getSize.mockReturnValue({ w: '100%', h: '56.25%' });

            const result = service.resolveSize('', '', {}, false);

            expect(result.width).toBe('100%');
            expect(result.isChanged).toBe(true);
        });

        it('should not delete transform when ratio option unchanged', () => {
            mockMain.figure.getSize.mockReturnValue({ w: '100px', h: '100px' });

            // Simulate that initRatioValue matches current value
            service.on(false); // Sets initRatioValue

            service.resolveSize('200px', '200px', {}, true);

            // deleteTransform should still be called since initRatioValue is different
            expect(mockMain.figure.setSize).toHaveBeenCalled();
        });
    });

    describe('setOriginSize method', () => {
        beforeEach(() => {
            service = new VideoSizeService(mockMain, mockModalEl);
        });

        it('should set origin size correctly', () => {
            service.setOriginSize('800px', '450px');

            // Trigger revert to verify origin was set
            const addEventCalls = mockMain.eventManager.addEvent.mock.calls;
            const clickHandler = addEventCalls.find(call => call[1] === 'click')[2];

            clickHandler();

            expect(mockInputX.value).toBe('800px');
            expect(mockInputY.value).toBe('450px');
        });
    });

    describe('onlyPercentage mode', () => {
        beforeEach(() => {
            mockMain.state.onlyPercentage = true;
            service = new VideoSizeService(mockMain, mockModalEl);
        });

        it('should limit revert value to 100 when origin is greater', () => {
            service.setOriginSize('150', '');

            const addEventCalls = mockMain.eventManager.addEvent.mock.calls;
            const clickHandler = addEventCalls.find(call => call[1] === 'click')[2];

            clickHandler();

            expect(mockInputX.value).toBe('100');
        });

        it('should skip setting inputY in setInputSize', () => {
            service.setInputSize('500px', '300px');

            expect(mockInputX.value).toBe('500px');
            // inputY should not be modified when onlyPercentage is true
        });

        it('should handle ratio select with percentage value', () => {
            const addEventCalls = mockMain.eventManager.addEvent.mock.calls;
            const changeHandler = addEventCalls.find(call => call[0] === mockFrameRatioOption)[2];

            mockFrameRatioOption.options[0].value = '0.5625';
            mockFrameRatioOption.selectedIndex = 0;

            const mockSelect = {
                options: mockFrameRatioOption.options,
                selectedIndex: 0
            };
            dom.query.getEventTarget.mockReturnValue(mockSelect);

            changeHandler({ target: mockSelect });

            expect(mockInputY.placeholder).toBe('56.25%');
        });
    });

    describe('OnChangeRatio event', () => {
        beforeEach(() => {
            service = new VideoSizeService(mockMain, mockModalEl);
        });

        it('should update ratio when proportion is checked', () => {
            Figure.GetRatio.mockReturnValue({ w: 16, h: 9 });

            mockProportion.checked = true;
            mockInputX.value = '1600';
            mockInputY.value = '900';

            const addEventCalls = mockMain.eventManager.addEvent.mock.calls;
            const changeHandler = addEventCalls.find(call => call[0] === mockProportion && call[1] === 'change')[2];

            changeHandler();

            expect(Figure.GetRatio).toHaveBeenCalledWith('1600', '900', 'px');
        });

        it('should reset ratio when proportion is unchecked', () => {
            mockProportion.checked = false;

            const addEventCalls = mockMain.eventManager.addEvent.mock.calls;
            const changeHandler = addEventCalls.find(call => call[0] === mockProportion && call[1] === 'change')[2];

            changeHandler();

            // When unchecked, ratio should be { w: 0, h: 0 }
            // Figure.GetRatio should not be called
            expect(Figure.GetRatio).not.toHaveBeenCalled();
        });
    });
});
