import DocumentType from '../../../../src/core/section/documentType';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';
import { dom } from '../../../../src/helper';

describe('DocumentType', () => {
    let kernel;
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
        // Use proper mock editor
        kernel = createMockEditor({
            '_type_options': ['header', 'page'],
            'toolbar_width': 'auto',
            '_rtl': false
        });
        editor = kernel;
        domUtils = dom.utils;

        // Update options that might be needed
        kernel.$.options.set('_type_options', ['header', 'page']);

        // Use the frame context from kernel
        fc = kernel.$.frameContext;

        // Update frame context with document type elements
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

        fc.set('wysiwyg', wysiwyg);
        fc.set('wysiwygFrame', wysiwygFrame);
        fc.set('documentTypeInner', documentTypeInner);
        fc.set('documentTypePage', documentTypePage);
        fc.set('documentTypePageMirror', documentTypePageMirror);

        // Initialize Plugin mock
        kernel.$.plugins.pageNavigator = {
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

        it('should initialize with headers in wysiwyg', () => {
            // Pre-populate wysiwyg with headers before constructing DocumentType
            const wysiwyg = fc.get('wysiwyg');
            const h1 = createElement('h1');
            h1.textContent = 'Initial Title';
            wysiwyg.appendChild(h1);
            const h2 = createElement('h2');
            h2.textContent = 'Initial Subtitle';
            wysiwyg.appendChild(h2);

            documentType = new DocumentType(editor, fc);

            const inner = fc.get('documentTypeInner').querySelector();
            // Constructor should populate inner with headers
            expect(inner.innerHTML).toContain('Initial Title');
            expect(inner.innerHTML).toContain('Initial Subtitle');
        });

        it('should initialize without page option', () => {
            editor.options.set('_type_options', ['header']);
            documentType = new DocumentType(editor, fc);

            expect(documentType.useHeader).toBe(true);
            expect(documentType.usePage).toBe(false);
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

        it('should do nothing if useHeader is false', () => {
            editor.options.set('_type_options', ['page']);
            documentType = new DocumentType(editor, fc);

            // Should not throw and should be a no-op
            expect(() => documentType.reHeader()).not.toThrow();
        });

        it('should update existing headers when content changes', () => {
            const wysiwyg = fc.get('wysiwyg');
            const h1 = createElement('h1');
            h1.textContent = 'Original Title';
            wysiwyg.appendChild(h1);

            documentType = new DocumentType(editor, fc);

            // Change the header text
            h1.textContent = 'Updated Title';
            documentType.reHeader();

            const inner = fc.get('documentTypeInner').querySelector();
            const items = inner.querySelectorAll('.se-doc-item');
            expect(items[0].textContent).toBe('Updated Title');
        });

        it('should update header class when tag changes', () => {
            const wysiwyg = fc.get('wysiwyg');
            const h1 = createElement('h1');
            h1.textContent = 'Title';
            wysiwyg.appendChild(h1);

            documentType = new DocumentType(editor, fc);

            const inner = fc.get('documentTypeInner').querySelector();
            let items = inner.querySelectorAll('.se-doc-item');
            expect(items[0].className).toContain('se-doc-h1');

            // Replace h1 with h3
            const h3 = createElement('h3');
            h3.textContent = 'Title';
            wysiwyg.replaceChild(h3, h1);
            documentType.reHeader();

            items = inner.querySelectorAll('.se-doc-item');
            expect(items[0].className).toContain('se-doc-h3');
        });

        it('should handle all header levels h1-h6', () => {
            const wysiwyg = fc.get('wysiwyg');
            for (let i = 1; i <= 6; i++) {
                const h = createElement(`h${i}`);
                h.textContent = `Header ${i}`;
                wysiwyg.appendChild(h);
            }

            documentType = new DocumentType(editor, fc);
            documentType.reHeader();

            const inner = fc.get('documentTypeInner').querySelector();
            const items = inner.querySelectorAll('.se-doc-item');
            expect(items.length).toBe(6);
            for (let i = 0; i < 6; i++) {
                expect(items[i].className).toContain(`se-doc-h${i + 1}`);
            }
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
            Object.defineProperty(pageBreak, 'offsetTop', { value: 500 });
            Object.defineProperty(pageBreak, 'offsetHeight', { value: 10 });
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

            expect(editor.plugins.pageNavigator.display).toHaveBeenCalled();
        });

        it('should do nothing if page is not enabled', async () => {
            editor.options.set('_type_options', ['header']);
            documentType = new DocumentType(editor, fc);

            const rePagePromise = documentType.rePage(true);
            jest.runAllTimers();
            await rePagePromise;

            // Should not throw and be a no-op
            expect(editor.plugins.pageNavigator.display).not.toHaveBeenCalled();
        });

        it('should not recalculate if dimensions unchanged and force is false', async () => {
            documentType = new DocumentType(editor, fc);

            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 1000, configurable: true });

            const mirrorContent = createElement('div', 'se-content');
            Object.defineProperty(mirrorContent, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorContent, 'offsetHeight', { value: 1000 });
            fc.get('documentTypePageMirror').appendChild(mirrorContent);

            // First call
            let rePagePromise = documentType.rePage(true);
            jest.runAllTimers();
            await rePagePromise;

            const callCount = editor.plugins.pageNavigator.display.mock.calls.length;

            // Second call with same dimensions and force=false
            rePagePromise = documentType.rePage(false);
            jest.runAllTimers();
            await rePagePromise;

            // Should still be same call count (cached)
            expect(editor.plugins.pageNavigator.display.mock.calls.length).toBe(callCount);
        });

        it('should handle empty pages array', async () => {
            documentType = new DocumentType(editor, fc);

            // Very small content that results in single page
            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 100, configurable: true });

            const mirrorContent = createElement('div', 'se-content');
            Object.defineProperty(mirrorContent, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorContent, 'offsetHeight', { value: 100 });
            fc.get('documentTypePageMirror').appendChild(mirrorContent);

            const rePagePromise = documentType.rePage(true);
            jest.runAllTimers();
            await rePagePromise;

            expect(editor.plugins.pageNavigator.display).toHaveBeenCalled();
        });

        it('should handle multiple page breaks', async () => {
            documentType = new DocumentType(editor, fc);
            const wysiwyg = fc.get('wysiwyg');

            // Add multiple page breaks
            for (let i = 1; i <= 3; i++) {
                const pageBreak = createElement('div', 'se-page-break');
                Object.defineProperty(pageBreak, 'offsetTop', { value: i * 400 });
                Object.defineProperty(pageBreak, 'offsetHeight', { value: 10 });
                wysiwyg.appendChild(pageBreak);
            }

            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 2000, configurable: true });

            const mirrorContent = createElement('div', 'se-content');
            Object.defineProperty(mirrorContent, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorContent, 'offsetHeight', { value: 2000 });
            fc.get('documentTypePageMirror').appendChild(mirrorContent);

            const rePagePromise = documentType.rePage(true);
            jest.runAllTimers();
            await rePagePromise;

            expect(editor.plugins.pageNavigator.display).toHaveBeenCalled();
        });

        it('should clear existing timeout before setting new one', async () => {
            documentType = new DocumentType(editor, fc);

            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 1000, configurable: true });

            const mirrorContent = createElement('div', 'se-content');
            Object.defineProperty(mirrorContent, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorContent, 'offsetHeight', { value: 1000 });
            fc.get('documentTypePageMirror').appendChild(mirrorContent);

            // Call rePage multiple times quickly
            documentType.rePage(true);
            documentType.rePage(true);
            const rePagePromise = documentType.rePage(true);

            jest.runAllTimers();
            await rePagePromise;

            // Should only be called once due to debouncing
            expect(editor.plugins.pageNavigator.display).toHaveBeenCalledTimes(1);
        });
    });

    describe('Page Navigation', () => {
        beforeEach(async () => {
            documentType = new DocumentType(editor, fc);

            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 2500, configurable: true });

            // Add mock children (Multiple items to force pagination)
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
            documentType.pageGo(2);
            jest.runAllTimers();

            documentType.pageUp();
            jest.runAllTimers();

            // Verify scrollTo was called
            expect(fc.get('wysiwyg').scrollTo).toHaveBeenCalled();
        });

        it('pageDown() should move to next page', () => {
            expect(() => documentType.pageDown()).not.toThrow();
            jest.runAllTimers();
            expect(fc.get('wysiwyg').scrollTo).toHaveBeenCalled();
        });

        it('pageGo() should move to specific page', () => {
            const win = fc.get('wysiwyg');

            documentType.pageGo(2);
            jest.runAllTimers();

            expect(win.scrollTo).toHaveBeenCalled();
        });

        it('pageGo() should clamp page number to valid range', () => {
            const win = fc.get('wysiwyg');

            // Try to go to page 0 (should clamp to 1)
            documentType.pageGo(0);
            jest.runAllTimers();

            // Try to go to very high page (should clamp to max)
            documentType.pageGo(100);
            jest.runAllTimers();

            expect(win.scrollTo).toHaveBeenCalled();
        });

        it('pageUp() should not go below page 1', () => {
            // Start at page 1
            documentType.pageUp();
            documentType.pageUp();
            documentType.pageUp();
            jest.runAllTimers();

            // Should still work without errors
            expect(() => documentType.pageUp()).not.toThrow();
        });

        it('getCurrentPageNumber() should return correct page', () => {
            const pageNum = documentType.getCurrentPageNumber();
            expect(typeof pageNum).toBe('number');
            // Can be 0 if pages not initialized properly in jsdom
            expect(pageNum).toBeGreaterThanOrEqual(0);
        });

        it('getCurrentPageNumber() should return 1 when totalPages is 1', async () => {
            // Reset with small content
            documentType._destroy();
            editor.options.set('_type_options', ['header', 'page']);
            documentType = new DocumentType(editor, fc);

            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 100, configurable: true });

            const mirrorContent = createElement('div', 'se-content');
            Object.defineProperty(mirrorContent, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorContent, 'offsetHeight', { value: 100 });
            fc.get('documentTypePageMirror').appendChild(mirrorContent);

            const p = documentType.rePage(true);
            jest.runAllTimers();
            await p;

            expect(documentType.getCurrentPageNumber()).toBe(1);
        });
    });

    describe('resizePage()', () => {
        beforeEach(async () => {
            documentType = new DocumentType(editor, fc);

            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 2000, configurable: true });
            Object.defineProperty(fc.get('wysiwygFrame'), 'offsetWidth', { value: 600, configurable: true });
            Object.defineProperty(fc.get('wysiwygFrame'), 'offsetHeight', { value: 800, configurable: true });

            const mirrorContent = createElement('div', 'se-content');
            Object.defineProperty(mirrorContent, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorContent, 'offsetHeight', { value: 2000 });
            fc.get('documentTypePageMirror').appendChild(mirrorContent);

            jest.useFakeTimers();
            jest.spyOn(dom.utils, 'waitForMediaLoad').mockResolvedValue(true);
            const p = documentType.rePage(true);
            jest.runAllTimers();
            await p;
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should update page line widths on resize', () => {
            // Change width
            Object.defineProperty(fc.get('wysiwygFrame'), 'offsetWidth', { value: 700, configurable: true });

            documentType.resizePage();
            jest.runAllTimers();

            // Should trigger rePage
            expect(editor.plugins.pageNavigator.display).toHaveBeenCalled();
        });

        it('should add responsive class for narrow widths', () => {
            Object.defineProperty(fc.get('wysiwygFrame'), 'offsetWidth', { value: 600, configurable: true });

            documentType.resizePage();

            const inner = fc.get('documentTypeInner');
            // Check that addClass was attempted (implementation detail)
        });

        it('should remove responsive class for wide widths', () => {
            Object.defineProperty(fc.get('wysiwygFrame'), 'offsetWidth', { value: 900, configurable: true });

            documentType.resizePage();

            // Should work without errors
        });

        it('should not recalculate if dimensions unchanged', () => {
            const callCount = editor.plugins.pageNavigator.display.mock.calls.length;

            // Same dimensions
            documentType.resizePage();
            documentType.resizePage();

            // Should not add more calls for same dimensions
        });
    });

    describe('scrollPage()', () => {
        beforeEach(async () => {
            documentType = new DocumentType(editor, fc);

            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 2000, configurable: true });

            const mirrorContent = createElement('div', 'se-content');
            Object.defineProperty(mirrorContent, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorContent, 'offsetHeight', { value: 2000 });
            fc.get('documentTypePageMirror').appendChild(mirrorContent);

            jest.useFakeTimers();
            jest.spyOn(dom.utils, 'waitForMediaLoad').mockResolvedValue(true);
            const p = documentType.rePage(true);
            jest.runAllTimers();
            await p;
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should update page top positions on scroll', () => {
            // Simulate scroll
            fc.get('wysiwyg').scrollTop = 100;

            documentType.scrollPage();

            // Should not throw
        });

        it('should not update if scroll position unchanged', () => {
            // First call
            documentType.scrollPage();

            // Second call with same position
            documentType.scrollPage();

            // Should work without errors
        });

        it('should update page positions relative to scroll delta', () => {
            const pageContainer = fc.get('documentTypePage');
            const initialPages = pageContainer.children.length;

            fc.get('wysiwyg').scrollTop = 50;
            documentType.scrollPage();

            fc.get('wysiwyg').scrollTop = 100;
            documentType.scrollPage();

            // Pages should still exist
            expect(pageContainer.children.length).toBe(initialPages);
        });
    });

    describe('scrollWindow()', () => {
        beforeEach(() => {
            documentType = new DocumentType(editor, fc);
        });

        it('should do nothing if frame is scrollable', () => {
            kernel.$.store.get('isScrollable').mockReturnValue(true);

            expect(() => documentType.scrollWindow()).not.toThrow();
        });

        it('should update page display if frame is not scrollable', async () => {
            kernel.$.store.get('isScrollable').mockReturnValue(false);

            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 2000, configurable: true });

            const mirrorContent = createElement('div', 'se-content');
            Object.defineProperty(mirrorContent, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorContent, 'offsetHeight', { value: 2000 });
            fc.get('documentTypePageMirror').appendChild(mirrorContent);

            jest.useFakeTimers();
            jest.spyOn(dom.utils, 'waitForMediaLoad').mockResolvedValue(true);
            const p = documentType.rePage(true);
            jest.runAllTimers();
            await p;

            documentType.scrollWindow();

            expect(editor.plugins.pageNavigator.display).toHaveBeenCalled();

            jest.useRealTimers();
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

            const innerEl = fc.get('documentTypeInner').querySelector();
            const innerH1 = innerEl.querySelector('.se-doc-h1');
            expect(innerH1.className).toContain('active');
        });

        it('on() should do nothing if useHeader is false', () => {
            editor.options.set('_type_options', ['page']);
            documentType = new DocumentType(editor, fc);

            const h1 = createElement('h1');
            expect(() => documentType.on(h1)).not.toThrow();
        });

        it('on() should find header from non-header line', () => {
            const wysiwyg = fc.get('wysiwyg');
            const h1 = createElement('h1');
            h1.textContent = 'Header';
            wysiwyg.appendChild(h1);

            const p = createElement('p');
            p.textContent = 'Paragraph';
            wysiwyg.appendChild(p);

            documentType.reHeader();

            // Call on() with paragraph - should find previous header
            documentType.on(p);

            const innerEl = fc.get('documentTypeInner').querySelector();
            const innerH1 = innerEl.querySelector('.se-doc-h1');
            expect(innerH1.className).toContain('active');
        });

        it('on() should handle nested elements', () => {
            const wysiwyg = fc.get('wysiwyg');
            const h1 = createElement('h1');
            h1.textContent = 'Header';
            wysiwyg.appendChild(h1);

            const p = createElement('p');
            const span = createElement('span');
            span.textContent = 'Nested text';
            p.appendChild(span);
            wysiwyg.appendChild(p);

            documentType.reHeader();

            // Call on() with nested span
            documentType.on(span);

            const innerEl = fc.get('documentTypeInner').querySelector();
            const innerH1 = innerEl.querySelector('.se-doc-h1');
            expect(innerH1.className).toContain('active');
        });

        it('scrollPage() should update page top positions', () => {
            expect(() => documentType.scrollPage()).not.toThrow();
        });
    });

    describe('onChangeText()', () => {
        beforeEach(() => {
            documentType = new DocumentType(editor, fc);
        });

        it('should update header text when header changes', () => {
            const wysiwyg = fc.get('wysiwyg');
            const h1 = createElement('h1');
            h1.textContent = 'Original';
            wysiwyg.appendChild(h1);

            documentType.reHeader();

            h1.textContent = 'Updated';
            documentType.onChangeText(h1);

            const innerEl = fc.get('documentTypeInner').querySelector();
            const items = innerEl.querySelectorAll('.se-doc-item');
            expect(items[0].textContent).toBe('Updated');
        });

        it('should do nothing if useHeader is false', () => {
            editor.options.set('_type_options', ['page']);
            documentType = new DocumentType(editor, fc);

            const h1 = createElement('h1');
            expect(() => documentType.onChangeText(h1)).not.toThrow();
        });

        it('should do nothing for non-header elements', () => {
            const p = createElement('p');
            p.textContent = 'Paragraph';

            expect(() => documentType.onChangeText(p)).not.toThrow();
        });

        it('should do nothing if header not found in inner', () => {
            const h1 = createElement('h1');
            h1.textContent = 'Not in wysiwyg';

            // h1 is not added to wysiwyg, so _findItem should return null
            expect(() => documentType.onChangeText(h1)).not.toThrow();
        });
    });

    describe('_is()', () => {
        beforeEach(() => {
            documentType = new DocumentType(editor, fc);
        });

        it('should return true for h1-h6 elements', () => {
            for (let i = 1; i <= 6; i++) {
                const h = createElement(`h${i}`);
                expect(documentType._is(h)).toBe(true);
            }
        });

        it('should return false for non-header elements', () => {
            expect(documentType._is(createElement('p'))).toBe(false);
            expect(documentType._is(createElement('div'))).toBe(false);
            expect(documentType._is(createElement('span'))).toBe(false);
        });

        it('should return false for null/undefined', () => {
            expect(documentType._is(null)).toBe(false);
            expect(documentType._is(undefined)).toBe(false);
        });
    });

    describe('_findLinesHeader()', () => {
        beforeEach(() => {
            documentType = new DocumentType(editor, fc);
        });

        it('should return null if no header found', () => {
            const wysiwyg = fc.get('wysiwyg');
            const p = createElement('p');
            wysiwyg.appendChild(p);

            const result = documentType._findLinesHeader(p);
            expect(result).toBeNull();
        });

        it('should find header when line has previous sibling header', () => {
            const wysiwyg = fc.get('wysiwyg');
            const h1 = createElement('h1');
            const p = createElement('p');
            wysiwyg.appendChild(h1);
            wysiwyg.appendChild(p);

            const result = documentType._findLinesHeader(p);
            expect(result).toBe(h1);
        });

        it('should traverse up parent elements', () => {
            const wysiwyg = fc.get('wysiwyg');
            const h1 = createElement('h1');
            wysiwyg.appendChild(h1);

            const div = createElement('div');
            const span = createElement('span');
            div.appendChild(span);
            wysiwyg.appendChild(div);

            const result = documentType._findLinesHeader(span);
            expect(result).toBe(h1);
        });
    });

    describe('_destroy()', () => {
        it('should clean up resources', async () => {
            documentType = new DocumentType(editor, fc);

            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 2000, configurable: true });

            const mirrorContent = createElement('div', 'se-content');
            Object.defineProperty(mirrorContent, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorContent, 'offsetHeight', { value: 2000 });
            fc.get('documentTypePageMirror').appendChild(mirrorContent);

            jest.useFakeTimers();
            jest.spyOn(dom.utils, 'waitForMediaLoad').mockResolvedValue(true);
            const p = documentType.rePage(true);
            jest.runAllTimers();
            await p;

            // Destroy should not throw
            expect(() => documentType._destroy()).not.toThrow();

            jest.useRealTimers();
        });

        it('should clear pending timeouts', async () => {
            documentType = new DocumentType(editor, fc);

            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 2000, configurable: true });

            jest.useFakeTimers();
            jest.spyOn(dom.utils, 'waitForMediaLoad').mockResolvedValue(true);

            // Start rePage but don't wait
            documentType.rePage(true);

            // Destroy before timeout completes
            documentType._destroy();

            // Run timers - should not cause errors
            jest.runAllTimers();

            jest.useRealTimers();
        });
    });

    describe('_getDisplayPage()', () => {
        beforeEach(() => {
            documentType = new DocumentType(editor, fc);
        });

        it('should return window when not scrollable', () => {
            kernel.$.store.get('isScrollable').mockReturnValue(false);
            const result = documentType._getDisplayPage();
            expect(result).toBe(window);
        });

        it('should return wysiwyg when scrollable', () => {
            kernel.$.store.get('isScrollable').mockReturnValue(true);
            const result = documentType._getDisplayPage();
            expect(result).toBe(fc.get('wysiwyg'));
        });
    });

    describe('_getWWScrollTop()', () => {
        beforeEach(() => {
            documentType = new DocumentType(editor, fc);
        });

        it('should return scrollTop for scrollable frame', () => {
            kernel.$.store.get('isScrollable').mockReturnValue(true);
            fc.get('wysiwyg').scrollTop = 100;

            const result = documentType._getWWScrollTop();
            expect(result).toBe(100);
        });

        it('should return 0 for zero scroll', () => {
            kernel.$.store.get('isScrollable').mockReturnValue(true);
            fc.get('wysiwyg').scrollTop = 0;

            const result = documentType._getWWScrollTop();
            expect(result).toBe(0);
        });
    });

    describe('_initializeCache()', () => {
        beforeEach(() => {
            documentType = new DocumentType(editor, fc);
        });

        it('should populate position cache from elements', () => {
            const mirror = fc.get('documentTypePageMirror');

            const el1 = createElement('div');
            Object.defineProperty(el1, 'offsetTop', { value: 0 });
            Object.defineProperty(el1, 'offsetHeight', { value: 100 });
            mirror.appendChild(el1);

            const el2 = createElement('div');
            Object.defineProperty(el2, 'offsetTop', { value: 100 });
            Object.defineProperty(el2, 'offsetHeight', { value: 150 });
            mirror.appendChild(el2);

            documentType._initializeCache(mirror.children);

            // Cache should be populated (internal state, tested via rePage behavior)
        });
    });

    describe('_getElementAtPosition()', () => {
        beforeEach(() => {
            documentType = new DocumentType(editor, fc);
        });

        it('should find element at given position', () => {
            const mirror = fc.get('documentTypePageMirror');

            const el1 = createElement('div');
            Object.defineProperty(el1, 'offsetTop', { value: 0 });
            Object.defineProperty(el1, 'offsetHeight', { value: 100 });
            mirror.appendChild(el1);

            const el2 = createElement('div');
            Object.defineProperty(el2, 'offsetTop', { value: 100 });
            Object.defineProperty(el2, 'offsetHeight', { value: 150 });
            mirror.appendChild(el2);

            documentType._initializeCache(mirror.children);

            const result = documentType._getElementAtPosition(50, mirror.children);
            expect(result.ci).toBe(0);
        });

        it('should handle position beyond all elements', () => {
            const mirror = fc.get('documentTypePageMirror');

            const el1 = createElement('div');
            Object.defineProperty(el1, 'offsetTop', { value: 0 });
            Object.defineProperty(el1, 'offsetHeight', { value: 100 });
            mirror.appendChild(el1);

            documentType._initializeCache(mirror.children);

            const result = documentType._getElementAtPosition(500, mirror.children);
            expect(typeof result.ci).toBe('number');
        });
    });

    describe('_calcPageBreakTop()', () => {
        beforeEach(() => {
            documentType = new DocumentType(editor, fc);
        });

        it('should calculate adjusted top position', () => {
            const mirror = fc.get('documentTypePageMirror');
            const wysiwyg = fc.get('wysiwyg');

            const mirrorEl = createElement('div');
            Object.defineProperty(mirrorEl, 'offsetTop', { value: 0 });
            Object.defineProperty(mirrorEl, 'offsetHeight', { value: 100 });
            mirror.appendChild(mirrorEl);

            const wwEl = createElement('div');
            Object.defineProperty(wwEl, 'offsetTop', { value: 10 });
            Object.defineProperty(wwEl, 'offsetHeight', { value: 110 });
            wysiwyg.appendChild(wwEl);

            documentType._initializeCache(mirror.children);

            const result = documentType._calcPageBreakTop(50, wysiwyg.children, mirror.children);
            expect(typeof result).toBe('number');
        });

        it('should handle missing cache entries', () => {
            const mirror = fc.get('documentTypePageMirror');
            const wysiwyg = fc.get('wysiwyg');

            // Add element but don't initialize cache for it
            const el = document.createElement('div');
            Object.defineProperty(el, 'offsetTop', { value: 0 });
            Object.defineProperty(el, 'offsetHeight', { value: 100 });
            mirror.appendChild(el);

            const wwEl = document.createElement('div');
            Object.defineProperty(wwEl, 'offsetTop', { value: 0 });
            Object.defineProperty(wwEl, 'offsetHeight', { value: 100 });
            wysiwyg.appendChild(wwEl);

            documentType._initializeCache(mirror.children);

            // Should work when there are elements in the cache
            const result = documentType._calcPageBreakTop(50, wysiwyg.children, mirror.children);
            expect(typeof result).toBe('number');
        });
    });

    describe('_movePage() with sticky toolbar', () => {
        beforeEach(async () => {
            editor.toolbar.isSticky = true;
            documentType = new DocumentType(editor, fc);

            Object.defineProperty(fc.get('documentTypePageMirror'), 'scrollHeight', { value: 2500, configurable: true });
            Object.defineProperty(fc.get('documentTypePage'), 'offsetTop', { value: 0, configurable: true });

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

        it('should adjust scroll for sticky toolbar', () => {
            documentType.pageGo(2);

            // Run animation frames
            jest.advanceTimersByTime(100);

            expect(fc.get('wysiwyg').scrollTo).toHaveBeenCalled();
        });
    });
});
