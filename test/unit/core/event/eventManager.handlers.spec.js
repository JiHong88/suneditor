import EventManager from '../../../../src/core/event/eventManager';
import { createMockEditor } from '../../../__mocks__/editorMock';

describe('EventManager Handlers', () => {
    let mockEditor;
    let eventManager;
    let wysiwyg, statusbar;

    beforeEach(() => {
        mockEditor = createMockEditor();
        // Setup DOM elements
        wysiwyg = document.createElement('div');
        statusbar = document.createElement('div');
        
        const frameContextMap = new Map();
        mockEditor.frameContext = {
            get: jest.fn((key) => frameContextMap.get(key)),
            set: jest.fn((key, value) => frameContextMap.set(key, value)),
            delete: jest.fn((key) => frameContextMap.delete(key)),
            has: jest.fn((key) => frameContextMap.has(key))
        };
        
        // Setup options in frameContext
        const fcOptions = {
            get: jest.fn((key) => {
                if (key === 'iframe') return false;
                if (key === 'height') return '300'; // Satisfies /\d+/
                if (key === 'statusbar_resizeEnable') return true;
                return null;
            }),
            set: jest.fn()
        };
        mockEditor.frameContext.set('options', fcOptions);
        
        // Setup DOM elements
        wysiwyg = document.createElement('div');
        wysiwyg.className = 'se-wrapper-wysiwyg';
        statusbar = document.createElement('div');
        statusbar.className = 'se-status-bar';
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'se-resizing-bar';
        statusbar.appendChild(resizeHandle);
        
        mockEditor.frameContext.set('wysiwyg', wysiwyg);
        mockEditor.frameContext.set('statusbar', statusbar);
        mockEditor.frameContext.set('wrapper', document.createElement('div'));
        mockEditor.frameContext.get('wrapper').style.height = '300px';
        mockEditor.frameContext.set('wysiwygFrame', document.createElement('div'));
        mockEditor.frameContext.set('code', document.createElement('div'));
        mockEditor.frameContext.set('editor', document.createElement('div')); // Needed for contains check
        mockEditor.frameContext.set('topArea', document.createElement('div'));
        mockEditor.frameContext.set('isReadOnly', false);
        mockEditor.frameContext.set('isDisabled', false);
        
        // Mock context for toolbar items
        const contextMap = new Map();
        mockEditor.context = {
            get: jest.fn((key) => contextMap.get(key)),
            set: jest.fn((key, value) => frameContextMap.set(key, value)) // Typo frameContextMap? Should be contextMap logic or mixed?
        };
        // Reuse frameContextMap for context? No, they are different.
        // Let's make context use contextMap
        mockEditor.context = {
            get: jest.fn((key) => contextMap.get(key) || mockEditor.frameContext.get(key)), // sometimes falls back?
            element: {
                resizeBackground: document.createElement('div')
            }
        };
        contextMap.set('editor', mockEditor.frameContext.get('editor'));
        contextMap.set('toolbar_main', document.createElement('div'));
        contextMap.set('toolbar_sub_main', document.createElement('div'));
        
        mockEditor.ui = {
            showLoading: jest.fn(),
            hideLoading: jest.fn(),
            offCurrentModal: jest.fn(),
            offCurrentController: jest.fn(),
            enableBackWrapper: jest.fn(),
            disableBackWrapper: jest.fn(),
            resizeEditor: jest.fn()
        };
        
        mockEditor.toolbar = {
            hide: jest.fn(),
            _resetSticky: jest.fn(),
            _setResponsive: jest.fn(),
            resetResponsiveToolbar: jest.fn(),
            balloonOffset: { top: 0, left: 0 },
            inlineToolbarAttr: { isShow: false }
        };
        mockEditor.subToolbar = {
            balloonOffset: { top: 0, left: 0 },
            resetResponsiveToolbar: jest.fn()
        };
        
        mockEditor.options = {
            get: jest.fn((key) => {
               if (key === 'defaultLine') return 'P';
               if (key === '_defaultStyleTagMap') return { 'strong': 'B', 'em': 'I' };
               if (key === 'resizingBar') return true;
               return null;
            }),
            set: jest.fn(),
            has: jest.fn(() => false) // Mock as false for now
        };
        
        mockEditor.selection = {
            init: jest.fn(),
            setRange: jest.fn(),
            getRange: jest.fn().mockReturnValue({ collapsed: true })
        };
        
        // Mock helper env
        // env is imported in eventManager. If we need to mock it, we assume jsdom window is fine.
        
        // Mock visualViewport
        window.visualViewport = {
            height: 800,
            width: 1024,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };

        eventManager = new EventManager(mockEditor);
        eventManager._addCommonEvents();
        // Mocking/Stubbing internal methods if they are not the focus or cause issues?
        // But we want to test handlers attached by them.
        eventManager._addFrameEvents(eventManager.frameContext);
    });

    describe('Blur and Focus', () => {
        it('should handle wysiwyg blur', () => {
            eventManager.status.hasFocus = true;
            eventManager._inputFocus = false;
            
            const event = new Event('blur');
            wysiwyg.dispatchEvent(event);
            
            expect(eventManager.status.hasFocus).toBe(false);
            expect(mockEditor.ui.offCurrentController).toHaveBeenCalled();
        });

        it('should not blur if readOnly', () => {
            mockEditor.frameContext.set('isReadOnly', true);
            eventManager.status.hasFocus = true;
            
            const event = new Event('blur');
            wysiwyg.dispatchEvent(event);
            
            expect(eventManager.status.hasFocus).toBe(true);
        });

        it('should handle wysiwyg focus', () => {
            const event = new Event('focus');
            wysiwyg.dispatchEvent(event);
            
            expect(eventManager.status.hasFocus).toBe(true);
        });
    });

    describe('Statusbar Resize', () => {
        it('should handle statusbar mousedown (resize start)', () => {
             // Mock addGlobalEvent just in case
            const spy = jest.spyOn(eventManager, 'addGlobalEvent');
            const resizeHandle = statusbar.querySelector('.se-resizing-bar');
            
            const event = new MouseEvent('mousedown', { bubbles: true, clientY: 100 });
            resizeHandle.dispatchEvent(event);
            
            // Check if resize background is shown (common behavior in SunEditor resize)
            // Or just check if spy was called. 
            // If spy fails, maybe assertions on _resizeClientY
            expect(eventManager._resizeClientY).toBe(100);
            expect(spy).toHaveBeenCalled();
        });
    });
    
    describe('Window Resize/Scroll', () => {
         // Window events are global. We can simulate them on window.
         it('should handle window resize', () => {
             // Mock visualViewport
             window.visualViewport = { height: 800, width: 1024 };
             
             const spy = jest.spyOn(mockEditor.toolbar, 'hide');
             mockEditor.isBalloon = true;
             
             window.dispatchEvent(new Event('resize'));
             
             expect(spy).toHaveBeenCalled();
         });
         
         it('should handle window scroll', () => {
             // Mock options
             mockEditor.options.set('toolbar_sticky', 0);
             const spy = jest.spyOn(mockEditor.toolbar, '_resetSticky');
             
             window.dispatchEvent(new Event('scroll'));
             
             expect(spy).toHaveBeenCalled();
         });
    });
});
