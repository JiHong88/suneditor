
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
    });
});
