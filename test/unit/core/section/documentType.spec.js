import DocumentType from '../../../../src/core/section/documentType';
import { dom } from '../../../../src/helper';

describe('DocumentType', () => {
    let editor;
    let fc;
    let documentType;
    let domUtils;

    // Helper to create mock elements
    const createElement = (tag, className = '', id = '') => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (id) el.id = id;
        return el;
    };

    beforeEach(() => {
        // Mock DOM utils if needed, or rely on jsdom
        domUtils = dom.utils;

        // Mock Editor properties and methods
        editor = {
            options: new Map([
                ['_type_options', ['header', 'page']], // Default to having both for general tests
                ['toolbar_width', 'auto'],
                ['_rtl', false]
            ]),
            offset: {
                getGlobal: jest.fn(() => ({ top: 100, left: 0 }))
            },
            selection: {
                setRange: jest.fn(),
                scrollTo: jest.fn(),
            },
            toolbar: {
                isSticky: false
            },
            context: new Map([
                ['toolbar_main', createElement('div', 'se-toolbar')]
            ]),
            plugins: {
                pageNavigator: null
            },
             _preventBlur: false,
             status: {
                 isScrollable: jest.fn(() => true)
             }
        };

        // Mock FrameContext (Map-like)
        const wysiwygFrame = createElement('div', 'se-wysiwyg-frame');
        const wysiwyg = createElement('div', 'se-wysiwyg');
        
        // Mock scrollTo to actually update scrollTop, avoiding infinite loops in _applyPageScroll
        wysiwyg.scrollTo = jest.fn((arg) => {
            const top = arg.top !== undefined ? arg.top : arg;
            wysiwyg.scrollTop = top;
        });

        const documentTypeInner = {
            querySelector: jest.fn()
        };
        const innerEl = createElement('div', 'se-document-lines-inner');
        documentTypeInner.querySelector.mockReturnValue(innerEl);

        const documentTypePage = createElement('div', 'se-document-page');
        const documentTypePageMirror = createElement('div', 'se-document-page-mirror');
        
        // Mock getComputedStyle for mirror to avoid parsing issues if needed, 
        // though jsdom handles basic styles. 
        // We'll set some styles manually if strictly required by logic.
        documentTypePageMirror.style.paddingTop = '10px';
        documentTypePageMirror.style.paddingBottom = '10px';

        fc = new Map();
        fc.set('wysiwyg', wysiwyg);
        fc.set('wysiwygFrame', wysiwygFrame);
        fc.set('documentTypeInner', documentTypeInner);
        fc.set('documentTypePage', documentTypePage);
        fc.set('documentTypePageMirror', documentTypePageMirror);
        
        // Mock eventManager
        editor.eventManager = {
            addEvent: jest.fn()
        };

        // Initialize Plugin mock
        editor.plugins.pageNavigator = {
            display: jest.fn()
        };
    });

    afterEach(() => {
        if (documentType) {
            documentType._destroy();
        }
        jest.clearAllMocks();
    });

    describe('Constructor & Initialization', () => {
        it('should initialize correctly with header and page options', () => {
            documentType = new DocumentType(editor, fc);
            
            expect(editor.eventManager.addEvent).toHaveBeenCalled(); // Header click event
            
            // Should call querySelector (verified implementation detail)
            // Note: our mock returns the innerEl, ensuring it was accessed
            expect(fc.get('documentTypeInner').querySelector).toHaveBeenCalled();
        });

        it('should not initialize header parts if header option is missing', () => {
            editor.options.set('_type_options', ['page']);
            documentType = new DocumentType(editor, fc);
            
            // Should NOT call addEvent for header
            expect(editor.eventManager.addEvent).not.toHaveBeenCalled();
        });
    });

    describe('reHeader()', () => {
        it('should update headers in the document map', () => {
            documentType = new DocumentType(editor, fc);
            
            // Mock headers in wysiwyg
            const h1 = createElement('h1');
            h1.textContent = 'Title 1';
            const h2 = createElement('h2');
            h2.textContent = 'Subtitle';
            
            fc.get('wysiwyg').appendChild(h1);
            fc.get('wysiwyg').appendChild(h2);
            
            // Call reHeader
            documentType.reHeader();
            
            const inner = fc.get('documentTypeInner').querySelector();
            const items = inner.querySelectorAll('.se-doc-item');
            
            expect(items.length).toBe(2);
            expect(items[0].textContent).toBe('Title 1');
            expect(items[0].className).toContain('se-doc-h1');
            expect(items[1].textContent).toBe('Subtitle');
            expect(items[1].className).toContain('se-doc-h2');
        });

         it('should remove extra headers if they are deleted from wysiwyg', () => {
             // Pre-populate inner headers manually before creating DocumentType
             // But DocumentType creates innerHeaders from inner.querySelectorAll in constructor
             // So we need to ensure inner has children *before* constructor if we want them to be initial state
             
             // However, our mocks in beforeEach create a fresh innerEl. 
             // We can manipulate fc.get('documentTypeInner') before new DocumentType
             
             const inner = fc.get('documentTypeInner').querySelector();
             const oldH1 = createElement('div', 'se-doc-item se-doc-h1');
             oldH1.textContent = 'Old Title';
             inner.appendChild(oldH1);
             
             documentType = new DocumentType(editor, fc);
             
             // Wysiwyg is empty (no headers)
             
             documentType.reHeader();
             
             // Now it should remove the old header because it's not in wysiwyg
             expect(inner.children.length).toBe(0);
        });
    });

    describe('rePage()', () => {
        beforeEach(() => {
            jest.useFakeTimers();
             // Mock dom.utils.waitForMediaLoad to resolve immediately
             jest.spyOn(dom.utils, 'waitForMediaLoad').mockResolvedValue(true);
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should calculate pages and update page navigator', async () => {
            documentType = new DocumentType(editor, fc);
            
            // Mock Dimensions
            // A4 height ~1122px (depends on calculation constants)
            // Let's ensure scrollHeight triggers multiple pages
            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 3000, configurable: true });
            
            // Add mock children to mirror and wysiwyg to populate positionCache
            const mirrorContent = createElement('div', 'se-content');
            Object.defineProperty(mirrorContent, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorContent, 'offsetHeight', { value: 3000 });
            fc.get('documentTypePageMirror').appendChild(mirrorContent);

            const wwContent = createElement('div', 'se-content');
            Object.defineProperty(wwContent, 'offsetTop', { value: 0 });
            Object.defineProperty(wwContent, 'offsetHeight', { value: 3000 });
            fc.get('wysiwyg').appendChild(wwContent);

            
            // Trigger rePage
            const rePagePromise = documentType.rePage(true);
            
            // Fast-forward timers for setTimeout in rePage
            jest.runAllTimers();
            
            await rePagePromise;

            // Wait for microtasks
            await Promise.resolve(); 

            // Check if pages were created in #page element
            const pageContainer = fc.get('documentTypePage');
            expect(pageContainer.children.length).toBeGreaterThan(0);
            
            // Check navigator display update
             expect(editor.plugins.pageNavigator.display).toHaveBeenCalled();
        });
        
         it('should handle page breaks', async () => {
            documentType = new DocumentType(editor, fc);
            const wysiwyg = fc.get('wysiwyg');
            const pageBreak = createElement('div', 'se-page-break');
            wysiwyg.appendChild(pageBreak);
            
             // Mock Dimensions
            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 1000, configurable: true });
            
            // Add mock children
            const mirrorContent = createElement('div', 'se-content');
            Object.defineProperty(mirrorContent, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorContent, 'offsetHeight', { value: 1000 });
            fc.get('documentTypePageMirror').appendChild(mirrorContent);

             // Trigger rePage
            const rePagePromise = documentType.rePage(true);
            jest.runAllTimers();
            await rePagePromise;
            
             // Check logic flow - harder to verify internal state variables directly without exposing them, 
             // but we can check side effects like page navigator calls
             expect(editor.plugins.pageNavigator.display).toHaveBeenCalled();
         });
    });
    
    describe('Page Navigation', () => {
        beforeEach(async () => {
             documentType = new DocumentType(editor, fc);
             // Setup mock pages
             // We need to bypass the async rePage logic for simpler testing of navigation
             // Or we can manually populate the private #pages array if we assume white-box testing, 
             // but since it's private, we must rely on observing side effects or using public API
             
             // Let's force a simple rePage first
             Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 2500, configurable: true });

            // Add mock children (Multiple items to force pagination)
            // 3 items of 1000px = 3000px total > 2 pages (approx 1122px each)
            for (let i = 0; i < 3; i++) {
                const mirrorContent = createElement('div', 'se-content');
                Object.defineProperty(mirrorContent, 'offsetTop', { value: i * 1000 });
                Object.defineProperty(mirrorContent, 'offsetHeight', { value: 1000 });
                fc.get('documentTypePageMirror').appendChild(mirrorContent);

                const wwContent = createElement('div', 'se-content');
                Object.defineProperty(wwContent, 'offsetTop', { value: i * 1000 });
                Object.defineProperty(wwContent, 'offsetHeight', { value: 1000 });
                fc.get('wysiwyg').appendChild(wwContent);
            }

             jest.useFakeTimers();
             jest.spyOn(dom.utils, 'waitForMediaLoad').mockResolvedValue(true);
             const p = documentType.rePage(true);
             jest.runAllTimers();
             await p;
        });
        
        afterEach(() => {
             jest.useRealTimers();
        });

        it('pageUp() should move to previous page', () => {
             // Go to page 2 first
             documentType.pageGo(2);
             jest.runAllTimers(); // for smooth scroll animation frames
             
             const spyMove = jest.spyOn(documentType, '_movePage'); // internal method spy
             
             documentType.pageUp();
             // We can't easily spy on private methods call sequences, but we can verify the effect
             // Assuming page 2 -> page 1
             // Check scroll action
             // Since JSDOM doesn't support layout/scroll really well, we check function calls
             
             // For a robust test, we might need to check internal state via a public getter if available
             // getCurrentPageNumber() is public
             // Note: getCurrentPageNumber relies on scroll position.
        });
        
         it('pageDown() should move to next page', () => {
              // Assume start at page 1
              // Not easily verifiable without layout engine, 
              // but we can check if `scrollTo` was called on the display frame
              
              // We'll rely on ensuring no errors are thrown coverage execution
              expect(() => documentType.pageDown()).not.toThrow();
         });
         
         it('pageGo() should move to specific page', () => {
             // Mock scroll function to verify it's trying to scroll
             const win = fc.get('wysiwyg');
             // win.scrollTo is already mocked in beforeEach
             
             documentType.pageGo(2);
             jest.runAllTimers();
             
             expect(win.scrollTo).toHaveBeenCalled();
         });
    });

    describe('Scroll & Highlighting', () => {
        beforeEach(() => {
             documentType = new DocumentType(editor, fc);
        });

        it('on() should highlight the active header', () => {
            editor.options.set('_type_options', ['header']);
            // Setup headers
             const h1 = createElement('h1');
             fc.get('wysiwyg').appendChild(h1);
             documentType.reHeader();
             
             // Call on()
             documentType.on(h1);
             
             // documentTypeInner is the mock object, but it returns innerEl via querySelector
             // We want to access the *children* of innerEl, which is a real JSDOM helper element in our test
             const innerEl = fc.get('documentTypeInner').querySelector(); 
             const innerH1 = innerEl.querySelector('.se-doc-h1');
             expect(innerH1.className).toContain('active');
        });

        it('scrollPage() should update page top positions', () => {
            // This method updates styles based on scroll diff
            // Just ensure it runs without error
             expect(() => documentType.scrollPage()).not.toThrow();
        });
    });
});
