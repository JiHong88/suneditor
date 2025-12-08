import Controller from '../../../../src/modules/contracts/Controller';
import { dom } from '../../../../src/helper';

describe('Controller', () => {
    let editor, inst, controller, form, target;

    beforeEach(() => {
        const carrierWrapper = document.createElement('div');
        
        // Mock Editor and dependencies
        editor = {
            toolbar: { hide: jest.fn(), show: jest.fn() },
            subToolbar: { hide: jest.fn(), show: jest.fn() },
            component: { 
                deselect: jest.fn(),
                __removeGlobalEvent: jest.fn(),
                isInline: jest.fn().mockReturnValue(false)
            },
            ui: { 
                setControllerOnDisabledButtons: jest.fn(), 
                _visibleControllers: jest.fn()  
            },
            selection: { 
                isRange: jest.fn().mockReturnValue(false) 
            },
            offset: { 
                setRangePosition: jest.fn(),
                setAbsPosition: jest.fn().mockReturnValue({ position: 'bottom' })
            },
            eventManager: {
                addEvent: jest.fn(),
                removeEvent: jest.fn(),
                addGlobalEvent: jest.fn().mockReturnValue('event-id'),
                removeGlobalEvent: jest.fn()
            },
            util: {
                isIE: false
            },
            opendControllers: [],
            currentControllerName: '',
            status: { hasFocus: true, onSelected: false },
            _fileManager: { pluginRegExp: /test-plugin/ },
            carrierWrapper: carrierWrapper,
            triggerEvent: jest.fn(),
            instanceCheck: { isRange: jest.fn() },
            context: {
                element: {
                    carrierWrapper: carrierWrapper,
                    topArea: document.createElement('div')
                }
            },
            // Add other CoreInjector requirements if needed, defaulting to null/empty
            history: {},
            events: {},
            plugins: {},
            frameContext: new Map([
                ['topArea', document.createElement('div')],
                ['lineBreaker_t', document.createElement('div')],
                ['lineBreaker_b', document.createElement('div')],
                ['wysiwyg', document.createElement('div')] // Often needed
            ]),
            frameOptions: {},
            options: { get: jest.fn() },
            icons: {},
            lang: {},
            frameRoots: new Map(),
            _w: window,
            _d: document
        };

        // Mock instance that controls the Controller (e.g., Image plugin instance)
        inst = {
            constructor: { key: 'testPlugin' },
            editor: editor,
            controllerAction: jest.fn(),
            _element: document.createElement('div')
        };
        // inst.editor is accessed in Controller constructor via super(inst.editor) -> CoreInjector
        // CoreInjector expects `editor` as argument.
        // Controller constructor: constructor(inst, element, params, _name)
        // super(inst.editor)
        
        form = document.createElement('div');
        form.className = 'se-controller';
        
        // Mock carrierWrapper which is used in CoreInjector and Controller
        editor.context = {
            element: {
                carrierWrapper: document.createElement('div'),
                topArea: document.createElement('div') // for frameContext.get('topArea')
            }
        };
        // CoreInjector uses this.editor.context.element.carrierWrapper
         
        target = document.createElement('span');

        controller = new Controller(inst, form, { position: 'bottom' });
    });

    describe('Constructor & Initialization', () => {
        it('should initialize correctly with default options', () => {
            expect(controller.kind).toBe('testPlugin');
            expect(controller.position).toBe('bottom');
            expect(controller.isWWTarget).toBe(true);
            expect(editor.eventManager.addEvent).toHaveBeenCalledWith(form, 'click', expect.any(Function));
        });

        it('should append form to carrierWrapper', () => {
            // carrierWrapper is a real DOM element in our mock
            // We can check if it has children
            expect(editor.carrierWrapper.children.length).toBeGreaterThan(0);
            expect(editor.carrierWrapper.children[0]).toBe(form);
        });
    });

    describe('open()', () => {
        it('should trigger onBeforeShowController and open logic', async () => {
            const spyTrigger = jest.spyOn(controller, 'triggerEvent').mockResolvedValue(true);
            
            await controller.open(target, null); // Async because open handles triggerEvent await

            expect(spyTrigger).toHaveBeenCalledWith('onBeforeShowController', expect.any(Object));
            expect(form.style.display).toBe('block');
            expect(controller.isOpen).toBe(true);
            expect(editor.opendControllers).toContainEqual(expect.objectContaining({ form }));
        });

        it('should hide toolbar if balloon mode is enabled', async () => {
            editor.isBalloon = true;
            await controller.open(target);
            expect(editor.toolbar.hide).toHaveBeenCalled();
        });

        it('should set disabled buttons state if not focused', async () => {
             editor.status.hasFocus = false;
             await controller.open(target, null, { disabled: true });
             expect(editor.ui.setControllerOnDisabledButtons).toHaveBeenCalledWith(true);
        });

         it('should set position using offset.setAbsPosition for elements', async () => {
             const spySetPos = editor.offset.setAbsPosition;
             await controller.open(target);
             expect(spySetPos).toHaveBeenCalled();
         });
         
         it('should set position using offset.setRangePosition for Ranges', async () => {
             editor.selection.isRange.mockReturnValue(true);
             const range = document.createRange();
             await controller.open(range);
             expect(editor.offset.setRangePosition).toHaveBeenCalled();
         });
    });

    describe('close()', () => {
        beforeEach(async () => {
            await controller.open(target);
        });

        it('should close the controller and reset state', () => {
            controller.close();
            expect(controller.isOpen).toBe(false);
            expect(form.style.display).toBe('none');
            expect(editor.opendControllers.length).toBe(0);
        });

        it('should remove global events', () => {
            const spyRemove = editor.eventManager.removeGlobalEvent;
            controller.close();
            expect(spyRemove).toHaveBeenCalled();
        });
        
        it('should call initMethod if provided', async () => {
            const initMock = jest.fn();
            await controller.open(target, null, { initMethod: initMock });
            controller.close();
            expect(initMock).toHaveBeenCalled();
        });
    });
    
    describe('Events', () => {
        it('should handle click event', () => {
            const mockEvent = {
                stopPropagation: jest.fn(),
                preventDefault: jest.fn(),
                target: document.createElement('button')
            };
            mockEvent.target.setAttribute('data-command', 'test');
            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(mockEvent.target); // mock global helper if needed or rely on impl
            jest.spyOn(dom.query, 'getCommandTarget').mockReturnValue(mockEvent.target);
            
            // Invoke private listener via public spy or simulating event if possible
            // Since #Action is private bound, we can simulate the event call if we know the handler is attached
            // We mocked addEvent, let's grab the handler
            const clickHandler = editor.eventManager.addEvent.mock.calls.find(call => call[1] === 'click')[2];
            
            clickHandler(mockEvent);
            
            expect(inst.controllerAction).toHaveBeenCalledWith(mockEvent.target);
        });
    });

    describe('Positioning', () => {
        it('should bring to top', () => {
            controller.bringToTop(true);
            expect(form.style.zIndex).toBe('2147483646'); // INDEX_00
            
            controller.bringToTop(false);
            expect(form.style.zIndex).toBe('2147483645'); // INDEX_0
        });
    });
    describe('Parent Handling', () => {
         let parentForm, parentController, childController;
         
         beforeEach(() => {
              parentForm = document.createElement('div');
              parentForm.className = 'se-controller';
              document.body.appendChild(parentForm);
              
              // Mock simple parent controller
              parentController = {
                   form: parentForm,
                   '#__childrenControllers__': [] // Mock private field access/structure if necessary (actually cannot mock private fields easily in integration test)
                   // But Controller constructor handles parents array.
                   // If we pass HTML elements as parents, it treats them as parent forms.
              };
              
              childController = new Controller(inst, form, { 
                   position: 'bottom',
                   parents: [parentForm],
                   parentsHide: true
              });
         });

         afterEach(() => {
              if(parentForm.parentNode) parentForm.parentNode.removeChild(parentForm);
         });

         it('should hide parent when opened', async () => {
              parentForm.style.display = 'block';
              await childController.open(target);
              expect(parentForm.style.display).toBe('none');
              expect(parentForm.getAttribute('data-se-hidden-by-children')).toBe('1');
         });
         
         it('should show parent when closed', async () => {
              parentForm.style.display = 'block';
              await childController.open(target);
              childController.close();
              expect(parentForm.style.display).toBe('block');
              expect(parentForm.hasAttribute('data-se-hidden-by-children')).toBe(false);
         });
    });

    describe('_scrollReposition', () => {
         it('should call setControllerPosition', async () => {
              // open first to set target
              await controller.open(target);
              
              const spySetPos = jest.spyOn(editor.offset, 'setAbsPosition');
              controller._scrollReposition();
              
              expect(spySetPos).toHaveBeenCalled();
         });
         
         it('should not reposition if hidden by parent', () => {
              form.setAttribute('data-se-hidden-by-parent', '1');
              const spySetPos = jest.spyOn(editor.offset, 'setAbsPosition');
              controller._scrollReposition();
              expect(spySetPos).not.toHaveBeenCalled();
         });
    });

    describe('Global Events (Close Listeners)', () => {
         beforeEach(async () => {
              await controller.open(target);
         });
         
         it('should close on ESC keydown', () => {
              // Simulate keydown event via handler
              // We need to access the handler passed to addGlobalEvent
              // editor.eventManager.addGlobalEvent was mocked.
              // Let's spy/capture the handler.
              // Re-create controller to spy properly if needed, OR just access the mock calls from beforeEach.
              
              // In `open()`, `#addGlobalEvent` is called.
              // `this.eventManager.addGlobalEvent('keydown', ...)`
              
              const keydownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'keydown');
              const keydownHandler = keydownCall[1];
              
              const escEvent = { 
                   code: 'Escape', 
                   target: document.body,
                   preventDefault: jest.fn(),
                   stopPropagation: jest.fn()
              };
              
              // Mock keyCodeMap
              jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(document.body);
              
              const spyClose = jest.spyOn(controller, 'close');
              keydownHandler(escEvent);
              
              expect(spyClose).toHaveBeenCalled();
         });
         
         it('should NOT close on ESC if fixed', () => {
             // Mock #checkFixed by setting conditions
             // controller.fixed is readonly prop? No, it's checked via #checkFixed().
             // If this controller is in opendControllers and has fixed=true.
             controller.fixed = true; // Inject property
             // We need to ensure inst matches.
             // controller.inst is set in constructor.
             // Controller checks: if (cont[i].inst === this && cont[i].fixed)
             
             // Setup editor.opendControllers
             editor.opendControllers = [{ inst: controller, fixed: true }];
             
             const keydownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'keydown');
             const keydownHandler = keydownCall[1];
             
             const escEvent = { code: 'Escape', target: document.body };
             const spyClose = jest.spyOn(controller, 'close');
             
             keydownHandler(escEvent);
             
             expect(spyClose).not.toHaveBeenCalled();
         });
         
         it('should close on mousedown outside', () => {
              const mousedownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'mousedown' || c[0] === 'click');
              const mousedownHandler = mousedownCall[1];
              
              const outsideEl = document.createElement('div');
              jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(outsideEl);
              
              const spyClose = jest.spyOn(controller, 'close');
              
              mousedownHandler({ target: outsideEl });
              
              expect(spyClose).toHaveBeenCalledWith(true);
         });
         
         it('should NOT close on mousedown inside controller', () => {
              const mousedownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'mousedown' || c[0] === 'click');
              const mousedownHandler = mousedownCall[1];
              
              const insideEl = document.createElement('div');
              form.appendChild(insideEl);
              jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(insideEl);
              
              const spyClose = jest.spyOn(controller, 'close');
              
              mousedownHandler({ target: insideEl });
              
              expect(spyClose).not.toHaveBeenCalled();
         });
    });
});
