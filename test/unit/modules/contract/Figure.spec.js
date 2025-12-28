import Figure from '../../../../src/modules/contract/Figure';
import Controller from '../../../../src/modules/contract/Controller';
import { _DragHandle } from '../../../../src/modules/ui/_DragHandle';
import { dom } from '../../../../src/helper';

// Mock dependencies
jest.mock('../../../../src/modules/contract/Controller');
jest.mock('../../../../src/modules/ui/SelectMenu');
jest.mock('../../../../src/modules/ui/_DragHandle', () => ({
    _DragHandle: {
        get: jest.fn().mockReturnValue(() => {}),
        set: jest.fn()
    }
}));

describe('Figure', () => {
    let editor, inst, figure, wrapper, targetElement;

    beforeEach(() => {
        // Mock Editor and dependencies consistent with CoreInjector requirements
        const carrierWrapper = document.createElement('div');
        wrapper = document.createElement('div');
        
        editor = {
            // CoreInjector props
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
            util: { 
                isIE: false,
                copyTagAttributes: jest.fn()
            },
            history: {}, // Add history mock
            opendControllers: [],
            currentControllerName: '',
            status: { hasFocus: true, onSelected: false },
            
            // Figure specific props
            component: {
                isInline: jest.fn(),
                deselect: jest.fn(),
                __removeDragEvent: jest.fn(),
                select: jest.fn(), // Add select
                copy: jest.fn() // Add copy
            },
            ui: {
                _visibleControllers: jest.fn(),
                setControllerOnDisabledButtons: jest.fn()
            },
            offset: {
                getLocal: jest.fn().mockReturnValue({ top: 0, left: 0, scrollX: 0, scrollY: 0 }),
                setAbsPosition: jest.fn()
            },
            selection: {
                setRange: jest.fn(),
                insertNode: jest.fn()
            },
            html: {
                 remove: jest.fn().mockReturnValue({ container: document.createElement('div'), offset: 0 }),
                 get: jest.fn().mockReturnValue('html')
            },
            format: {},
            nodeTransform: {
                removeEmptyNode: jest.fn(),
                split: jest.fn().mockReturnValue(document.createElement('div'))
            },
            icons: {
                format_float_none: 'none-icon',
                format_float_left: 'left-icon',
                format_float_right: 'right-icon',
                format_float_center: 'center-icon',
                mirror_horizontal: 'mirror-icon'
            },
            lang: {
                controller: {
                    resize: 'Resize',
                    mirrorHorizontal: 'Mirror Horizontal'
                }
            },
            options: {
                get: jest.fn((key) => {
                    if (key === 'defaultLine') return 'p';
                    if (key === 'strictMode') return { formatFilter: false };
                    return null;
                }) 
            },
            frameContext: new Map([
                ['_figure', { main: document.createElement('div'), border: document.createElement('div'), display: document.createElement('div'), handles: [] }],
                ['wrapper', wrapper]
            ]),
            applyFrameRoots: jest.fn((cb) => {
                 cb(editor.frameContext);
            }),
            iframe: window,
            _w: window,
            _d: document
        };
        
        // Add drag handle to wrapper
        const dragHandle = document.createElement('div');
        dragHandle.className = 'se-drag-handle';
        wrapper.appendChild(dragHandle);

        inst = {
            constructor: { key: 'image' },
            editor: editor,
            _element: document.createElement('img')
        };
        
        targetElement = document.createElement('img');
        
        // Mock Controller instance
        Controller.mockClear();
        const mockControllerInstance = {
            open: jest.fn(),
            close: jest.fn(),
            hide: jest.fn(),
            show: jest.fn(),
            form: document.createElement('div')
        };
        Controller.mockImplementation(() => mockControllerInstance);
        
        // Pass fake controls to ensure CreateHTML_controller creates element and Controller is instantiated
        // Figure.js L158 checks controls || []
        // CreateHTML_controller implementation (not visible but likely checks length)
        // We can pass simple controls
        figure = new Figure(inst, [['mirror_h']], {});
    });

    describe('Constructor & Initialization', () => {
        it('should initialize correctly and create a Controller', () => {
             expect(Controller).toHaveBeenCalled();
             expect(figure.kind).toBe('image');
        });
    });

    describe('open()', () => {
        it('should calculate size and open controller', () => {
            // Setup DOM structure for Figure.GetContainer to work (target -> figure -> ... -> container)
            const container = document.createElement('div');
            container.className = 'se-component';
            const figureEl = document.createElement('figure');
            container.appendChild(figureEl);
            figureEl.appendChild(targetElement);
            
            const spySetFigureInfo = jest.spyOn(figure, 'getSize').mockReturnValue({ w: '100px', h: '100px' });
            
            figure.open(targetElement, {});
            
            expect(editor.opendControllers).toHaveLength(1);
            expect(figure.controller.open).toHaveBeenCalled();
        });
    });

    describe('setAlign()', () => {
        it('should set alignment class on container', () => {
            const container = document.createElement('div');
            container.className = 'se-component';
            const figureEl = document.createElement('figure');
            container.appendChild(figureEl);
            figureEl.appendChild(targetElement);
            
            figure.setAlign(targetElement, 'left');
            
            expect(container.classList.contains('__se__float-left')).toBe(true);
        });
    });
    
    describe('controllerAction', () => {
         let button, container, figureEl;
         
         beforeEach(() => {
              // Reset element and set mocks
              targetElement.style.transform = '';
              targetElement.style.width = '100px';
              targetElement.style.height = '100px';
              
              // Setup default container structure
              container = document.createElement('div');
              container.className = 'se-component';
              figureEl = document.createElement('figure');
              container.appendChild(figureEl);
              figureEl.appendChild(targetElement);
              
              // Set internal references directly since they are "protected" (underscore)
              figure._element = targetElement;
              figure._container = container;
              figure._cover = figureEl;
              
              // Fix mocks: modify existing editor properties so `figure` sees them (since figure was created with `editor`)
              // If `figure` copied references, we might need to update figure properties directly or recreate figure.
              // Assuming CoreInjector assigns `this.history = editor.history`.
              
              // We need to ensure editor.history exists and create push spy.
              // In outer beforeEach: editor.history is {}
              editor.history.push = jest.fn();
              
              editor.component.select = jest.fn();
              inst.componentDestroy = jest.fn();
              editor.component.copy = jest.fn();
              editor.html.get = jest.fn().mockReturnValue('html');
              // Ensure editor.util exists
              editor.util.copyTagAttributes = jest.fn();
              
              // Also assume Figure assigns copies of these tool references in constructor?
              // L149: this.selection = this.editor.selection;
              // So if we modify editor.selection methods, figure.selection should see them if it's the same object.
              // But if `this.history` is NOT assigned in constructor, it might come from CoreInjector.
              // If CoreInjector does `this.history = editor.history` in constructor, then:
              // `figure.history` refers to the original `{}` object from outer beforeEach.
              // So adding `.push` to that object is correct.
              
              // Verify history assignment workaround:
              // Just in case, assign to everything possible
              figure.history = editor.history;
              
              button = document.createElement('button');
         });

         it('should mirror horizontally', () => {
              button.setAttribute('data-command', 'mirror');
              button.setAttribute('data-value', 'h');
              
              figure.controllerAction(button);
              expect(targetElement.style.transform).toContain('rotateY(180deg)');
         });

         it('should rotate', () => {
              button.setAttribute('data-command', 'rotate');
              button.setAttribute('data-value', '90');
              
              figure.controllerAction(button);
              expect(targetElement.style.transform).toContain('rotate(90deg)');
         });
         
         it('should toggle caption', () => {
              button.setAttribute('data-command', 'caption');
              
              // Initial state: no caption.
              figure._caption = null;
              
              // For CreateCaption to work, we need `dom` helper to be working (it is imported/mocked?).
              // But CreateCaption uses `document.createElement`.
              // `dom` is imported from `../../../../src/helper`.
              // We didn't mock `dom` explicitly in outer block but `jest.mock` might have auto-mocked or it's real?
              // L5: import { dom } from ...
              // Real DOM helper: `createElement`, `query` etc.
              // If `Figure.CreateCaption` uses real DOM utils, they should work with JSDOM.
              
              figure.controllerAction(button);
              
              const figcaption = figureEl.querySelector('figcaption');
              expect(figcaption).not.toBeNull();
              expect(figure._caption).toBe(figcaption);
              
              // Toggle again to remove
              figure.controllerAction(button);
              expect(figureEl.querySelector('figcaption')).toBeNull();
              // After remove, _caption should be null?
              // L818: this._caption = !this._caption; -> sets it to boolean?
              // L814: dom.utils.removeItem(this._caption).
              // L818: `this._caption = !this._caption` implies it becomes boolean (false)?
              // If L818 sets it to false, next time `!this._caption` is true (lines 802).
              // The test should pass if logic holds.
         });
         
         it('should revert size', () => {
              button.setAttribute('data-command', 'revert');
              targetElement.setAttribute('data-se-size', '100px,100px');
              
              // Change size to 200px (this will save 100px to revertSize)
              figure.setFigureSize('200px', '200px');
              expect(targetElement.style.width).toBe('200px');
              
              figure.controllerAction(button);
              
              expect(targetElement.style.width).toBe('100px');
         });
         
         it('should remove component', () => {
             button.setAttribute('data-command', 'remove');
             
             figure.controllerAction(button);
             expect(inst.componentDestroy).toHaveBeenCalledWith(targetElement);
         });
         
         it('should copy component', () => {
             button.setAttribute('data-command', 'copy');
             editor.selection.insertNode = jest.fn();
             
             figure.controllerAction(button);
             expect(editor.component.copy).toHaveBeenCalled(); 
         });


         it('should rotate with different angles', () => {
              button.setAttribute('data-command', 'rotate');
              
              // 90
              button.setAttribute('data-value', '90');
              figure.controllerAction(button);
              expect(targetElement.style.transform).toContain('rotate(90deg)');
              
              // Reset for next test
              targetElement.style.transform = '';
              
              // -90
              button.setAttribute('data-value', '-90');
              figure.controllerAction(button);
              expect(targetElement.style.transform).toContain('rotate(-90deg)');
              
              // Test mirror vertical
              targetElement.style.transform = '';
              button.setAttribute('data-command', 'mirror');
              button.setAttribute('data-value', 'v');
              figure.isVertical = true; 
              figure.controllerAction(button);
         });
    });
    
    describe('retainFigureFormat', () => {
        beforeEach(() => {
             editor.format.isBlock = jest.fn().mockReturnValue(true);
             editor.format.isLine = jest.fn().mockReturnValue(false);
        });

        it('should replace origin element with container', () => {
             const origin = document.createElement('img');
             const container = document.createElement('div');
             container.className = 'se-component';
             const parent = document.createElement('div');
             parent.appendChild(origin);
             
             figure.retainFigureFormat(container, origin, null, null);
             
             expect(parent.contains(container)).toBe(true);
             expect(parent.contains(origin)).toBe(false); 
        });
        
        it('should handle list cell structure', () => {
             editor.format.isBlock.mockReturnValue(false); 
             jest.spyOn(dom.check, 'isListCell').mockReturnValue(true);
             const origin = document.createElement('img');
             const container = document.createElement('div');
             const cell = document.createElement('li');
             cell.appendChild(origin);
             
             // Mock getParentElement to return originEl for refer logic
             // logic: getParentElement(originEl, (current) => current.parentNode === cell) -> returns originEl
             // dom.query.getParentElement might function correctly without mock if imported 'real' helper
             // But if I mocked 'dom' module entirely? 
             // L5 import { dom } from ...
             // L38 dom.query = { ... } ? No.
             // editor.util is mocked. dom is imported.
             // If dom is real, it depends on JSDOM.
             // dom.query.getParentElement usage:
             // checks `check(element)` -> returns element.
             
             figure.retainFigureFormat(container, origin, null, null);
             
             expect(cell.contains(container)).toBe(true);
        });
    });

    describe('Size Management', () => {
         let container, figureEl;
         
         beforeEach(() => {
              container = document.createElement('div');
              container.className = 'se-component';
              figureEl = document.createElement('figure');
              container.appendChild(figureEl);
              figureEl.appendChild(targetElement);
              
              figure._element = targetElement;
              figure._container = container;
              figure._cover = figureEl;
         });
         
         it('should set size with pixels', () => {
              figure.setFigureSize('200px', '200px');
              expect(targetElement.style.width).toBe('200px');
              expect(targetElement.style.height).toBe('200px');
         });
         
         it('should set size with percent', () => {
              figure.setFigureSize('50%', 'auto');
              expect(container.style.width).toBe('50%');
         });
         
         it('should get size correctly', () => {
              targetElement.style.width = '100px';
              targetElement.style.height = '50px';
              
              const size = figure.getSize();
              expect(size.w).toBe('100px');
              expect(size.h).toBe('50px');
         });
         
         it('should display resize handles', () => {
              const handles = [document.createElement('div'), document.createElement('div')];
              const figureMain = document.createElement('div');
              const mockFigure = { hasOwnProperty: jest.fn(), handles: handles, main: figureMain };
              
              editor.frameContext = { get: jest.fn().mockReturnValue(mockFigure) };
              figure.frameContext = editor.frameContext;
              editor.eventManager.addGlobalEvent = jest.fn();
              figure.controller = { form: document.createElement('div') };
              
              figure._displayResizeHandles(true);
              expect(figure.controller.form.style.display).toBe('flex');
              
              figure._displayResizeHandles(false);
              expect(figure.controller.form.style.display).toBe('none');
         });
    });
    
    describe('Ratio & Alignment', () => {
         beforeEach(() => {
              // Setup basic figure properties with proper DOM structure for GetContainer
              targetElement.style.width = '100px';
              targetElement.style.height = '100px';
              
              const container = document.createElement('div');
              container.className = 'se-component';
              const cover = document.createElement('figure');
              
              container.appendChild(cover);
              cover.appendChild(targetElement);
              
              figure._element = targetElement;
              figure._container = container;
              figure._cover = cover;
         });

         it('should handle autoRatio in setFigureSize', () => {
             figure.autoRatio = { default: '56.25%', current: '' };
             // When w is '100%', h should be calculated via autoRatio?
             // _applySize logic: if autoRatio && !isVertical -> h = 100%? No.
             // L1108: sizeTarget.style.height = this.autoRatio && !this.isVertical ? '100%' : h;
             
             // Mock __setCoverPaddingBottom because it's called
             figure.__setCoverPaddingBottom = jest.fn();
             
             figure.setFigureSize('100%', 'auto');
             
             expect(figure._element.style.height).toBe('100%');
             expect(figure.__setCoverPaddingBottom).toHaveBeenCalled();
         });
         
         it('should set alignment', () => {
             // 'left'
             figure.setAlign(targetElement, 'left');
             expect(figure._container.className).toContain('__se__float-left');
             
             // 'center'
             figure.setAlign(targetElement, 'center');
             expect(figure._container.className).toContain('__se__float-center');
             
             // 'right'
             figure.setAlign(targetElement, 'right');
             expect(figure._container.className).toContain('__se__float-right');
             
             // 'none'
             figure.setAlign(targetElement, 'none');
             expect(figure._container.className).toContain('__se__float-none');
         });
    });

    describe('Resize Interaction', () => {
         let dragHandleMock;
         
         beforeEach(() => {
             // Mock _DragHandle interactions
             dragHandleMock = {
                 get: jest.fn(),
                 set: jest.fn()
             };
             
             _DragHandle.get.mockImplementation((key) => {
                 if (key === '__figureInst') return figure;
                 if (key === '__overInfo') return null; // L545
                 return jest.fn(); // return noop for others
             });
             
             // Need to ensure figure._cover / _element are set
             figure._element = targetElement;
             figure._cover = document.createElement('figure');
             figure._container = document.createElement('div');
         });

         it('should handle resize sequence', () => {
             // 1. Capture mousedown handler (OnResizeContainer)
             // It's added in constructor via eventManager.addEvent(handles, 'mousedown', ...)
             // We need to look at calls to addEvent
             const addEventCalls = editor.eventManager.addEvent.mock.calls;
             const mousedownCall = addEventCalls.find(call => call[1] === 'mousedown');
             expect(mousedownCall).toBeDefined();
             const onResizeHandler = mousedownCall[2];
             
             // 2. Mock event object
             const mousedownEvent = {
                 stopPropagation: jest.fn(),
                 preventDefault: jest.fn(),
                 clientX: 100,
                 clientY: 100,
                 target: { classList: ['br'] } // Bottom-Right resize
             };
             
             // 3. Mock dependencies used in OnResizeContainer
             // inst.frameContext.get('_figure').main
             // We need to ensure frameContext has _figure
             const mockFigureHandles = { 
                 main: { style: { float: '' }, offsetWidth: 10, offsetHeight: 10 }, 
                 display: { style: { display: 'none' } },
                 handles: [],
                 border: { style: {} }
             };
             editor.frameContext.get = jest.fn((key) => {
                 if (key === '_figure') return mockFigureHandles;
                 if (key === 'wysiwygFrame') return { clientWidth: 1000 };
                 if (key === 'wwComputedStyle') return { getPropertyValue: jest.fn().mockReturnValue('0px') };
                 return null;
             });
             
             // Mock ui methods
             figure.ui = { enableBackWrapper: jest.fn() };
             
             // Mock getSize / setPercentSize
             figure.getSize = jest.fn().mockReturnValue({ w: '100px', h: '100px', dw: '100', dh: '100' });
             figure._setPercentSize = jest.fn();
             figure._applySize = jest.fn();
             figure.setTransform = jest.fn();
             figure.history = { push: jest.fn() };
             figure.component.select = jest.fn();
             
             // 4. Trigger mousedown (OnResizeContainer)
             onResizeHandler(mousedownEvent);
             
             expect(figure.ui.enableBackWrapper).toHaveBeenCalled();
             
             // 5. Verify it attached mousemove/mouseup listeners
             // L1388: inst.eventManager.addGlobalEvent('mousemove', inst.__containerResizing);
             const addGlobalCalls = editor.eventManager.addGlobalEvent.mock.calls;
             const mousemoveCall = addGlobalCalls.find(call => call[0] === 'mousemove');
             const mouseupCall = addGlobalCalls.find(call => call[0] === 'mouseup');
             
             expect(mousemoveCall).toBeDefined();
             expect(mouseupCall).toBeDefined();
             
             const mousemoveHandler = mousemoveCall[1];
             const mouseupHandler = mouseupCall[1];
             
             // 6. Trigger mousemove (__containerResizing)
             const mousemoveEvent = { clientX: 150, clientY: 150 };
             mousemoveHandler(mousemoveEvent);
             
             // Check if size application was called
             // L1464: __resizing_p_wh check...
             // It calls _applySize or _setPercentSize
             // with 'br' direction, it should call one of them.
             // 7. Trigger mouseup (__containerResizingOff)
             const mouseupEvent = {};
             // We need to ensure _offResizeEvent mocks are ready
             figure.component.__removeDragEvent = jest.fn();
             editor.eventManager.removeGlobalEvent = jest.fn();
             figure.ui.offCurrentController = jest.fn();
             figure.ui.disableBackWrapper = jest.fn();
             figure._displayResizeHandles = jest.fn();
             
             mouseupHandler(mouseupEvent);
             
             expect(figure._applySize).toHaveBeenCalled();
             expect(editor.eventManager.removeGlobalEvent).toHaveBeenCalled();
         });
    });
});
