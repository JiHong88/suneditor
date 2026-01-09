import Controller from '../../../../src/modules/contract/Controller';
import { dom, keyCodeMap } from '../../../../src/helper';
import { _DragHandle } from '../../../../src/modules/ui/_DragHandle';
import { env } from '../../../../src/helper';

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
            uiManager: {
                setControllerOnDisabledButtons: jest.fn(),
                _visibleControllers: jest.fn(),
                onControllerContext: jest.fn(),
                offControllerContext: jest.fn(),
                opendControllers: [],
                currentControllerName: '',
                selectMenuOn: false
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
            expect(editor.uiManager.opendControllers).toContainEqual(expect.objectContaining({ form }));
        });

        it('should hide toolbar if balloon mode is enabled', async () => {
            editor.isBalloon = true;
            await controller.open(target);
            expect(editor.toolbar.hide).toHaveBeenCalled();
        });

        it('should set disabled buttons state if not focused', async () => {
             editor.status.hasFocus = false;
             await controller.open(target, null, { disabled: true });
             expect(editor.uiManager.setControllerOnDisabledButtons).toHaveBeenCalledWith(true);
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
            expect(editor.uiManager.opendControllers.length).toBe(0);
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
             
             // Setup editor.uiManager.opendControllers
             editor.uiManager.opendControllers = [{ inst: controller, fixed: true }];
             
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

    describe('open() edge cases', () => {
        it('should return early when _DragHandle __overInfo is ON_OVER_COMPONENT', async () => {
            // Set _DragHandle to simulate drag in progress
            _DragHandle.set('__overInfo', env.ON_OVER_COMPONENT);

            await controller.open(target);

            // Controller should NOT have opened
            expect(controller.isOpen).toBe(false);

            // Clean up
            _DragHandle.set('__overInfo', null);
        });

        it('should warn and return early when target is null or undefined', async () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            await controller.open(null);

            expect(warnSpy).toHaveBeenCalledWith('[SUNEDITOR.Controller.open.fail] The target element is required.');
            expect(controller.isOpen).toBe(false);

            warnSpy.mockRestore();
        });

        it('should set disabled buttons to false when not focused and disabled is false', async () => {
            editor.status.hasFocus = false;
            await controller.open(target, null, { disabled: false });
            expect(editor.uiManager.setControllerOnDisabledButtons).toHaveBeenCalledWith(false);
        });

        it('should hide subToolbar when isSubBalloon mode is enabled', async () => {
            editor.isSubBalloon = true;
            await controller.open(target);
            expect(editor.subToolbar.hide).toHaveBeenCalled();
        });
    });

    describe('Sibling Controller Positioning', () => {
        let siblingForm;

        beforeEach(() => {
            siblingForm = document.createElement('div');
            siblingForm.className = 'se-controller';
            siblingForm.style.display = 'block';
            Object.defineProperty(siblingForm, 'offsetHeight', { value: 40 });
        });

        it('should adjust position when sibling exists and not siblingMain', async () => {
            const siblingController = new Controller(inst, form, {
                position: 'bottom',
                sibling: siblingForm,
                siblingMain: false
            });

            // Mock setAbsPosition to return position info
            editor.offset.setAbsPosition.mockReturnValue({ position: 'bottom' });

            await siblingController.open(target);

            // The controller should be opened and positioned relative to sibling
            expect(siblingController.isOpen).toBe(true);
        });

        it('should handle sibling positioning with top position', async () => {
            const siblingController = new Controller(inst, form, {
                position: 'top',
                sibling: siblingForm,
                siblingMain: false
            });

            // Mock setAbsPosition to return top position
            editor.offset.setAbsPosition.mockReturnValue({ position: 'top' });

            await siblingController.open(target);

            expect(siblingController.isOpen).toBe(true);
        });

        it('should set sibling display to block if it was hidden', async () => {
            siblingForm.style.display = 'none';

            const siblingController = new Controller(inst, form, {
                position: 'bottom',
                sibling: siblingForm,
                siblingMain: false
            });

            await siblingController.open(target);

            // Sibling should be shown as part of positioning
            expect(siblingForm.style.display).toBe('block');
        });

        it('should not adjust position when siblingMain is true', async () => {
            const siblingController = new Controller(inst, form, {
                position: 'bottom',
                sibling: siblingForm,
                siblingMain: true
            });

            editor.offset.setAbsPosition.mockReturnValue({ position: 'bottom' });

            await siblingController.open(target);

            expect(siblingController.isOpen).toBe(true);
        });
    });

    describe('setControllerPosition returns false', () => {
        it('should call hide when setAbsPosition returns null/false', async () => {
            editor.offset.setAbsPosition.mockReturnValue(null);

            const hideSpy = jest.spyOn(controller, 'hide');
            await controller.open(target);

            // Controller should call hide when positioning fails
            expect(hideSpy).toHaveBeenCalled();
        });

        it('should call hide when setRangePosition returns false for Range target', async () => {
            // Mock selection.isRange to return true for the range
            editor.selection.isRange = jest.fn().mockReturnValue(true);
            editor.offset.setRangePosition.mockReturnValue(false);

            const hideSpy = jest.spyOn(controller, 'hide');

            const range = document.createRange();
            await controller.open(range);

            expect(hideSpy).toHaveBeenCalled();
        });
    });

    describe('shadowRoot event handling', () => {
        it('should add mousedown listener when editor has shadowRoot', async () => {
            editor.shadowRoot = document.createElement('div'); // simulate shadowRoot
            const addEventSpy = jest.spyOn(form, 'addEventListener');

            await controller.open(target);

            expect(addEventSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

            // Clean up
            editor.shadowRoot = null;
        });

        it('should remove mousedown listener on close when shadowRoot was used', async () => {
            editor.shadowRoot = document.createElement('div');

            await controller.open(target);

            const removeEventSpy = jest.spyOn(form, 'removeEventListener');
            controller.close();

            expect(removeEventSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

            editor.shadowRoot = null;
        });
    });

    describe('MouseEnter and MouseLeave handlers', () => {
        let mouseEnterHandler, mouseLeaveHandler;

        beforeEach(async () => {
            await controller.open(target);

            // Get the handlers from addEvent mock calls
            const mouseEnterCall = editor.eventManager.addEvent.mock.calls.find(c => c[1] === 'mouseenter');
            const mouseLeaveCall = editor.eventManager.addEvent.mock.calls.find(c => c[1] === 'mouseleave');

            mouseEnterHandler = mouseEnterCall[2];
            mouseLeaveHandler = mouseLeaveCall[2];
        });

        it('should update zIndex on mouse enter', () => {
            const mockEvent = { target: form };
            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(form);

            mouseEnterHandler(mockEvent);

            // zIndex should be updated
            expect(editor.uiManager.currentControllerName).toBe('testPlugin');
        });

        it('should not update zIndex when isInsideForm and has parents', () => {
            const parentForm = document.createElement('div');
            const childController = new Controller(inst, document.createElement('div'), {
                position: 'bottom',
                parents: [parentForm],
                isInsideForm: true
            });

            const childMouseEnterCall = editor.eventManager.addEvent.mock.calls
                .filter(c => c[1] === 'mouseenter')
                .pop();
            const childMouseEnterHandler = childMouseEnterCall[2];

            const mockEvent = { target: childController.form };
            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(childController.form);

            const initialZIndex = childController.form.style.zIndex;
            childMouseEnterHandler(mockEvent);

            // zIndex should remain unchanged for isInsideForm with parents
            expect(childController.form.style.zIndex).toBe(initialZIndex);
        });

        it('should reset zIndex on mouse leave', () => {
            const mockEvent = { target: form };
            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(form);

            mouseLeaveHandler(mockEvent);

            // zIndex should be reset to default
            expect(form.style.zIndex).toBeDefined();
        });
    });

    describe('#checkForm with isInsideForm', () => {
        it('should not close when target is inside parent form with isInsideForm', async () => {
            const parentForm = document.createElement('div');
            parentForm.className = 'se-controller';
            const childForm = document.createElement('div');
            childForm.className = 'se-controller';
            const targetEl = document.createElement('span');
            parentForm.appendChild(targetEl);

            const childController = new Controller(inst, childForm, {
                position: 'bottom',
                parents: [parentForm],
                isInsideForm: true
            });

            await childController.open(target);

            // Find the mousedown handler for this child controller (get the last one added)
            const mousedownCalls = editor.eventManager.addGlobalEvent.mock.calls.filter(c => c[0] === 'mousedown' || c[0] === 'click');
            const mousedownHandler = mousedownCalls[mousedownCalls.length - 1][1];

            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(targetEl);
            jest.spyOn(dom.query, 'getParentElement').mockReturnValue(parentForm);
            jest.spyOn(dom.check, 'isWysiwygFrame').mockReturnValue(false);
            jest.spyOn(dom.utils, 'hasClass').mockReturnValue(false);

            const spyClose = jest.spyOn(childController, 'close');

            mousedownHandler({ target: targetEl });

            // Should not close because target is inside parent form
            expect(spyClose).not.toHaveBeenCalled();
        });
    });

    describe('#CloseListener_keydown edge cases', () => {
        beforeEach(async () => {
            await controller.open(target);
        });

        it('should not close when selectMenuOn is true', () => {
            editor.uiManager.selectMenuOn = true;

            const keydownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'keydown');
            const keydownHandler = keydownCall[1];

            const escEvent = { code: 'Escape', target: document.body };
            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(document.body);

            const spyClose = jest.spyOn(controller, 'close');
            keydownHandler(escEvent);

            expect(spyClose).not.toHaveBeenCalled();

            editor.uiManager.selectMenuOn = false;
        });

        it('should not close on non-ESC key when target is inside form', () => {
            const keydownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'keydown');
            const keydownHandler = keydownCall[1];

            const insideEl = document.createElement('div');
            form.appendChild(insideEl);

            const keyEvent = { code: 'KeyA', target: insideEl };
            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(insideEl);

            const spyClose = jest.spyOn(controller, 'close');
            keydownHandler(keyEvent);

            expect(spyClose).not.toHaveBeenCalled();
        });

        it('should not close on non-ESC key when plugin matches fileManager regex', () => {
            // Create controller with kind that matches fileManager regex
            editor._fileManager = { pluginRegExp: /testPlugin/ };

            const keydownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'keydown');
            const keydownHandler = keydownCall[1];

            const keyEvent = { code: 'KeyA', target: document.body };
            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(document.body);

            const spyClose = jest.spyOn(controller, 'close');
            keydownHandler(keyEvent);

            expect(spyClose).not.toHaveBeenCalled();
        });

        it('should not close when Ctrl key is pressed', () => {
            const keydownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'keydown');
            const keydownHandler = keydownCall[1];

            const ctrlEvent = { code: 'KeyA', ctrlKey: true, target: document.body };
            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(document.body);

            const spyClose = jest.spyOn(controller, 'close');
            keydownHandler(ctrlEvent);

            expect(spyClose).not.toHaveBeenCalled();
        });

        it('should not close on ESC when children controller is open', async () => {
            // Create parent-child relationship
            const parentController = controller;
            const childForm = document.createElement('div');
            const childController = new Controller(inst, childForm, {
                position: 'bottom',
                parents: [parentController]
            });

            await childController.open(target);

            const keydownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'keydown');
            const keydownHandler = keydownCall[1];

            const escEvent = { code: 'Escape', target: document.body };
            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(document.body);

            const spyClose = jest.spyOn(parentController, 'close');
            keydownHandler(escEvent);

            // Parent should not close when child is open
            expect(spyClose).not.toHaveBeenCalled();
        });
    });

    describe('#CloseListener_mousedown edge cases', () => {
        beforeEach(async () => {
            await controller.open(target);
        });

        it('should set preventClose when target is inside inst._element', () => {
            const mousedownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'mousedown' || c[0] === 'click');
            const mousedownHandler = mousedownCall[1];

            const insideInstEl = document.createElement('span');
            inst._element.appendChild(insideInstEl);

            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(insideInstEl);

            const spyClose = jest.spyOn(controller, 'close');
            mousedownHandler({ target: insideInstEl });

            // Should not close immediately because it's inside inst._element
            expect(spyClose).not.toHaveBeenCalled();
        });

        it('should not close when target is on line-breaker-component', () => {
            const mousedownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'mousedown' || c[0] === 'click');
            const mousedownHandler = mousedownCall[1];

            const lineBreakerEl = document.createElement('div');
            lineBreakerEl.className = 'se-line-breaker-component';

            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(lineBreakerEl);
            jest.spyOn(dom.query, 'getParentElement').mockReturnValue(lineBreakerEl);

            const spyClose = jest.spyOn(controller, 'close');
            mousedownHandler({ target: lineBreakerEl });

            expect(spyClose).not.toHaveBeenCalled();
        });
    });

    describe('Parent-child childrenSync behavior', () => {
        let parentController, childController, parentForm2, childForm;

        beforeEach(() => {
            parentForm2 = document.createElement('div');
            parentForm2.className = 'se-controller';
            childForm = document.createElement('div');
            childForm.className = 'se-controller';

            parentController = new Controller(inst, parentForm2, { position: 'bottom' });
            childController = new Controller(inst, childForm, {
                position: 'bottom',
                parents: [parentController]
            });
        });

        it('should hide child when parent hides', async () => {
            await parentController.open(target);
            await childController.open(target);

            expect(childController.isOpen).toBe(true);

            parentController.hide();

            // Child should be hidden
            expect(childForm.style.display).toBe('none');
        });

        it('should hide child recursively when parent hides (childrenSync hide)', async () => {
            await parentController.open(target);
            await childController.open(target);

            // Verify child is shown first
            expect(childForm.style.display).toBe('block');

            // When parent hides, child should also hide via #childrenSync('hide')
            const childHideSpy = jest.spyOn(childController, 'hide');
            parentController.hide();

            expect(childHideSpy).toHaveBeenCalled();
            expect(childForm.style.display).toBe('none');
            expect(childForm.hasAttribute('data-se-hidden-by-parent')).toBe(true);
        });

        it('should close children when parent closes with force', async () => {
            await parentController.open(target);
            await childController.open(target);

            const childCloseSpy = jest.spyOn(childController, 'close');

            parentController.close(true);

            expect(childCloseSpy).toHaveBeenCalledWith(true);
        });
    });

    describe('_scrollReposition with children sync', () => {
        let parentController, childController, parentForm2, childForm;

        beforeEach(() => {
            parentForm2 = document.createElement('div');
            parentForm2.className = 'se-controller';
            childForm = document.createElement('div');
            childForm.className = 'se-controller';

            parentController = new Controller(inst, parentForm2, { position: 'bottom' });
            childController = new Controller(inst, childForm, {
                position: 'bottom',
                parents: [parentController]
            });
        });

        it('should sync children on successful reposition', async () => {
            await parentController.open(target);
            await childController.open(target);

            // Both should be visible
            expect(childForm.style.display).toBe('block');

            // Trigger scroll reposition - this should sync children
            parentController._scrollReposition();

            // Child should still be shown after successful reposition
            expect(childForm.style.display).toBe('block');
        });

        it('should not reposition when form has hidden-by-children attribute', async () => {
            // The _scrollReposition checks for data-se-hidden-by-children attribute
            // When set, it should return early and not attempt repositioning
            parentForm2.setAttribute('data-se-hidden-by-children', '1');

            // Don't open the controller - just test the guard clause
            parentController._scrollReposition();

            // Form should remain in its initial state (not repositioned)
            expect(parentForm2.style.visibility).not.toBe('hidden');
        });
    });

    describe('#controllerOn event cancellation', () => {
        it('should not add to opendControllers when onBeforeShowController returns false', async () => {
            // Reset the opendControllers array
            editor.uiManager.opendControllers = [];

            jest.spyOn(controller, 'triggerEvent').mockResolvedValue(false);

            await controller.open(target);

            // When event is cancelled, controller should not be added to opendControllers
            // Note: the controller does set form.style.display = 'block' before event check in #controllerOn
            // but it should NOT push to opendControllers if cancelled
            expect(editor.uiManager.opendControllers.length).toBe(0);
        });
    });

    describe('Action handler without command target', () => {
        it('should return early when getCommandTarget returns null', () => {
            const mockEvent = {
                stopPropagation: jest.fn(),
                preventDefault: jest.fn(),
                target: document.createElement('div')
            };

            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(mockEvent.target);
            jest.spyOn(dom.query, 'getCommandTarget').mockReturnValue(null);

            const clickHandler = editor.eventManager.addEvent.mock.calls.find(call => call[1] === 'click')[2];

            clickHandler(mockEvent);

            // Should not call controllerAction when no command target
            expect(inst.controllerAction).not.toHaveBeenCalled();
        });
    });

    describe('inst.controllerClose callback', () => {
        it('should call inst.controllerClose on close if defined', async () => {
            inst.controllerClose = jest.fn();

            await controller.open(target);
            controller.close();

            expect(inst.controllerClose).toHaveBeenCalled();
        });
    });

    describe('inst.controllerOn callback', () => {
        it('should call inst.controllerOn on open if defined', async () => {
            inst.controllerOn = jest.fn();

            await controller.open(target);

            expect(inst.controllerOn).toHaveBeenCalledWith(form, target);
        });
    });

    describe('#childrenSync show branch with data-se-hidden-by-children', () => {
        let parentController, childController, grandchildController;
        let parentForm2, childForm, grandchildForm;

        beforeEach(() => {
            parentForm2 = document.createElement('div');
            parentForm2.className = 'se-controller';
            childForm = document.createElement('div');
            childForm.className = 'se-controller';
            grandchildForm = document.createElement('div');
            grandchildForm.className = 'se-controller';

            parentController = new Controller(inst, parentForm2, { position: 'bottom' });
            childController = new Controller(inst, childForm, {
                position: 'bottom',
                parents: [parentController]
            });
            grandchildController = new Controller(inst, grandchildForm, {
                position: 'bottom',
                parents: [childController]
            });
        });

        it('should call childrenSync recursively when child has data-se-hidden-by-children', async () => {
            await parentController.open(target);
            await childController.open(target);
            await grandchildController.open(target);

            // Simulate the scenario where child is hidden by its grandchild
            childForm.setAttribute('data-se-hidden-by-children', '1');

            // Hide parent first to set up the hidden state
            parentController.hide();

            // Verify the grandchild is also hidden
            expect(grandchildForm.style.display).toBe('none');
        });

        it('should handle childrenSync show via _scrollReposition after hide', async () => {
            await parentController.open(target);
            await childController.open(target);

            // First hide to set up the hiddenByParents map
            parentController.hide();

            expect(childForm.style.display).toBe('none');
            expect(childForm.hasAttribute('data-se-hidden-by-parent')).toBe(true);

            // Remove the hidden-by-parent attribute since _scrollReposition checks for it
            parentForm2.removeAttribute('data-se-hidden-by-parent');
            parentForm2.removeAttribute('data-se-hidden-by-children');

            // The _scrollReposition method internally calls #setControllerPosition
            // which returns true on success, then triggers setTimeout with childrenSync('show')
            // This test verifies the integration works
            parentController._scrollReposition();

            // After reposition, the display should change via positioning logic
            expect(parentForm2.style.visibility).toBe('');
        });
    });

    describe('Additional keydown edge cases', () => {
        beforeEach(async () => {
            await controller.open(target);
        });

        it('should not close on non-response key (control key only)', () => {
            const keydownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'keydown');
            const keydownHandler = keydownCall[1];

            // ControlLeft is a non-response key
            const controlEvent = { code: 'ControlLeft', target: document.body };
            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(document.body);

            const spyClose = jest.spyOn(controller, 'close');
            keydownHandler(controlEvent);

            // Non-response keys should not trigger close
            expect(spyClose).not.toHaveBeenCalled();
        });

        it('should handle checkForm returning true for drag handle class', async () => {
            const mousedownCall = editor.eventManager.addGlobalEvent.mock.calls.find(c => c[0] === 'mousedown' || c[0] === 'click');
            const mousedownHandler = mousedownCall[1];

            const dragHandleEl = document.createElement('div');
            dragHandleEl.className = 'se-drag-handle';

            jest.spyOn(dom.query, 'getEventTarget').mockReturnValue(dragHandleEl);
            jest.spyOn(dom.utils, 'hasClass').mockReturnValue(true);
            jest.spyOn(dom.check, 'isWysiwygFrame').mockReturnValue(false);

            const spyClose = jest.spyOn(controller, 'close');
            mousedownHandler({ target: dragHandleEl });

            // Should not close when target has drag-handle class
            expect(spyClose).not.toHaveBeenCalled();
        });
    });
});
