import { dom } from '../../../../src/helper';
// We need dynamic import for HueSlider to support resetModules
// import HueSlider from '../../../../src/modules/contract/HueSlider';

describe('HueSlider', () => {
    let HueSlider, Controller, editor, inst, hueSlider, contextMock;

    beforeEach(async () => {
        jest.resetModules();
        
        // Mock Canvas Context
        contextMock = {
            createImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
            putImageData: jest.fn(),
            fillRect: jest.fn(),
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            closePath: jest.fn(),
            stroke: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            drawImage: jest.fn(),
            getImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
            createLinearGradient: jest.fn().mockReturnValue({
                addColorStop: jest.fn()
            })
        };

        // Patch Canvas getContext globally
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => contextMock);

        // Mock dependencies
        jest.mock('../../../../src/modules/contract/Controller');
        jest.mock('../../../../src/modules/ui/_DragHandle', () => ({
            _DragHandle: {
                get: jest.fn().mockReturnValue(() => {}),
                set: jest.fn()
            }
        }));

        // Import module after setup
        HueSlider = (await import('../../../../src/modules/contract/HueSlider')).default;
        Controller = (await import('../../../../src/modules/contract/Controller')).default;

        const carrierWrapper = document.createElement('div');
        
        editor = {
            carrierWrapper: carrierWrapper,
            context: {
                element: {
                    carrierWrapper: carrierWrapper,
                    topArea: document.createElement('div')
                }
            },
            eventManager: {
                addEvent: jest.fn(),
                removeEvent: jest.fn(),
                addGlobalEvent: jest.fn(),
                removeGlobalEvent: jest.fn()
            },
            util: { isIE: false },
            opendControllers: [],
            currentControllerName: '',
            status: { hasFocus: true, onSelected: false },
             // CoreInjector required props
            history: {},
            events: {},
            plugins: {},
            frameContext: new Map(),
            frameOptions: {},
            options: { get: jest.fn() },
            icons: {},
            lang: {},
            frameRoots: new Map(),
            _w: window,
            _d: document
        };

        inst = {
            constructor: { key: 'colorPicker' },
            editor: editor
        };
        
        // Mock Controller instance behavior
        const mockControllerInstance = {
            open: jest.fn(),
            close: jest.fn(),
            hide: jest.fn(),
            show: jest.fn(),
            form: document.createElement('div')
        };
        Controller.mockImplementation(() => mockControllerInstance);

        hueSlider = new HueSlider(inst, {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Constructor & Initialization', () => {
        it('should initialize and create canvas', () => {
            expect(hueSlider).toBeTruthy();
        });
    });

    describe('attach()', () => {
        it('should append slider elements to the provided form', () => {
            const form = document.createElement('div');
            hueSlider.attach(form);
            expect(form.children.length).toBeGreaterThan(0);
            expect(contextMock.clearRect).toHaveBeenCalled(); 
        });
    });

    describe('open()', () => {
        it('should attach and open controller', () => {
            const target = document.createElement('div');
            const form = document.createElement('div');
            hueSlider.attach(form); // Attach first
            
            hueSlider.open(target);
            expect(hueSlider.controller.open).toHaveBeenCalledWith(target, null, expect.any(Object));
        });
    });
    
    describe('get()', () => {
        it('should return default color initially or updated color', () => {
            // Needed to ensure context is set up if get relies on it (it returns internal variable finalColor)
             hueSlider.attach(document.createElement('div')); 
             const color = hueSlider.get();
             expect(color).toBeDefined();
        });
    });

    describe('Mouse Interactions', () => {
        let wheel, gradientBar, mousedownHandler, mousemoveHandler, mouseupHandler;

        beforeEach(() => {
            const form = document.createElement('div');
            hueSlider.attach(form);
            
            wheel = form.querySelector('.se-hue-wheel');
            gradientBar = form.querySelector('.se-hue-gradient');
            
            // Capture handlers
            // Capture handlers
            const addGlobalCalls = editor.eventManager.addGlobalEvent.mock.calls;
            // Calls are like [type, handler, usage]
            mousedownHandler = addGlobalCalls.find(call => call[0] === 'mousedown')[1];
            mousemoveHandler = addGlobalCalls.find(call => call[0] === 'mousemove')[1];
            mouseupHandler = addGlobalCalls.find(call => call[0] === 'mouseup')[1];
            mousemoveHandler = addGlobalCalls.find(call => call[0] === 'mousemove')[1];
            mouseupHandler = addGlobalCalls.find(call => call[0] === 'mouseup')[1];
            
            // Mock getBoundingClientRect
            wheel.getBoundingClientRect = jest.fn().mockReturnValue({ left: 0, top: 0, width: 240, height: 240 });
            gradientBar.getBoundingClientRect = jest.fn().mockReturnValue({ left: 0, top: 0, width: 240, height: 28 });
        });

        it('should handle wheel interaction', () => {
             // MouseDown on Wheel
             mousedownHandler({ target: wheel, clientX: 120, clientY: 120 });
             
             // updatePointer_wheel -> wheelPickedColor -> createGradientBar -> fillRect
             expect(contextMock.fillRect).toHaveBeenCalled();
             
             // MouseMove
             contextMock.fillRect.mockClear();
             mousemoveHandler({ clientX: 130, clientY: 130 });
             expect(contextMock.fillRect).toHaveBeenCalled();
             
             // MouseUp
             mouseupHandler();
        });

        it('should handle gradient bar interaction', () => {
             // MouseDown on Gradient Bar
             mousedownHandler({ target: gradientBar, clientX: 10, clientY: 10 });
             
             // selectGradientColor -> drawColorWheel -> drawImage
             expect(contextMock.drawImage).toHaveBeenCalled();
             
             // MouseMove
             contextMock.drawImage.mockClear();
             mousemoveHandler({ clientX: 20, clientY: 10 });
             expect(contextMock.drawImage).toHaveBeenCalled();
        });
    });
});
