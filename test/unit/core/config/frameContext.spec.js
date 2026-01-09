/**
 * @fileoverview Unit tests for core/config/frameContext.js
 */

import {
    CreateFrameContext,
    UpdateStatusbarContext
    // FrameContextUtil moved to contextManager service
} from '../../../../src/core/config/frameContext';

// Mock the helper numbers module
jest.mock('../../../../src/helper/numbers', () => ({
    get: jest.fn((value, maxDec = 0) => {
        if (!value) return 0;

        const matched = (value + '').match(/-?\d+(\.\d+)?/);
        if (!matched || !matched[0]) return 0;

        const number = Number(matched[0]);
        return maxDec < 0 ? number : maxDec === 0 ? Math.round(number) : Number(number.toFixed(maxDec));
    })
}));

describe('Core Config - Frame Context', () => {
    let mockDOM;
    let mockEditorTarget;
    let mockOptions;

    beforeEach(() => {
        // Create mock options
        mockOptions = {
            mode: 'classic',
            iframe: false,
            width: '100%',
            height: '300px'
        };

        // Create mock DOM structure
        mockDOM = {
            top: document.createElement('div'),
            wwFrame: document.createElement('div'),
            codeWrapper: document.createElement('div'),
            codeFrame: document.createElement('textarea'),
            statusbar: document.createElement('div'),
            documentTypeInner: {
                inner: document.createElement('div'),
                page: document.createElement('div'),
                pageMirror: document.createElement('div')
            }
        };

        // Setup top area structure
        mockDOM.top.innerHTML = `
            <div class="se-container">
                <div class="se-wrapper"></div>
                <div class="se-line-breaker-component-t"></div>
                <div class="se-line-breaker-component-b"></div>
                <div class="se-toolbar-sticky-dummy"></div>
                <div class="se-toolbar-shadow"></div>
                <div class="se-placeholder">Enter text...</div>
            </div>
        `;

        // Setup code wrapper structure
        mockDOM.codeWrapper.innerHTML = '<textarea class="se-code-view-line"></textarea>';

        // Setup statusbar structure
        mockDOM.statusbar.innerHTML = `
            <div class="se-navigation"></div>
            <div class="se-char-counter-wrapper">
                <div class="se-char-counter">0</div>
            </div>
        `;

        // Setup wysiwyg frame with style
        mockDOM.wwFrame.style.minHeight = '100px';

        // Create mock editor target
        mockEditorTarget = {
            target: document.createElement('textarea'),
            options: mockOptions
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('CreateFrameContext function', () => {
        it('should create frame context with all basic elements', () => {
            const context = CreateFrameContext(
                mockEditorTarget,
                mockDOM.top,
                mockDOM.wwFrame,
                mockDOM.codeWrapper,
                mockDOM.codeFrame,
                mockDOM.statusbar,
                mockDOM.documentTypeInner,
                'testKey'
            );

            expect(context instanceof Map).toBe(true);

            // Check basic properties
            expect(context.get('key')).toBe('testKey');
            expect(context.get('options')).toBe(mockOptions);
            expect(context.get('originElement')).toBe(mockEditorTarget.target);
            expect(context.get('topArea')).toBe(mockDOM.top);
        });

        it('should set up DOM element references correctly', () => {
            const context = CreateFrameContext(
                mockEditorTarget,
                mockDOM.top,
                mockDOM.wwFrame,
                mockDOM.codeWrapper,
                mockDOM.codeFrame,
                mockDOM.statusbar,
                mockDOM.documentTypeInner,
                'testKey'
            );

            // Check container elements
            expect(context.get('container')).toBe(mockDOM.top.querySelector('.se-container'));
            expect(context.get('wrapper')).toBe(mockDOM.top.querySelector('.se-wrapper'));
            expect(context.get('wysiwygFrame')).toBe(mockDOM.wwFrame);
            expect(context.get('wysiwyg')).toBe(mockDOM.wwFrame);

            // Check code view elements
            expect(context.get('codeWrapper')).toBe(mockDOM.codeWrapper);
            expect(context.get('code')).toBe(mockDOM.codeFrame);
            expect(context.get('codeNumbers')).toBe(mockDOM.codeWrapper.querySelector('.se-code-view-line'));

            // Check UI utility elements
            expect(context.get('lineBreaker_t')).toBe(mockDOM.top.querySelector('.se-line-breaker-component-t'));
            expect(context.get('lineBreaker_b')).toBe(mockDOM.top.querySelector('.se-line-breaker-component-b'));
            expect(context.get('_stickyDummy')).toBe(mockDOM.top.querySelector('.se-toolbar-sticky-dummy'));
            expect(context.get('_toolbarShadow')).toBe(mockDOM.top.querySelector('.se-toolbar-shadow'));
        });

        it('should set up initial state flags correctly', () => {
            const context = CreateFrameContext(
                mockEditorTarget,
                mockDOM.top,
                mockDOM.wwFrame,
                mockDOM.codeWrapper,
                mockDOM.codeFrame,
                mockDOM.statusbar,
                mockDOM.documentTypeInner,
                'testKey'
            );

            // Check state flags
            expect(context.get('isCodeView')).toBe(false);
            expect(context.get('isFullScreen')).toBe(false);
            expect(context.get('isReadOnly')).toBe(false);
            expect(context.get('isDisabled')).toBe(false);
            expect(context.get('isChanged')).toBe(false);

            // Check history tracking
            expect(context.get('historyIndex')).toBe(-1);
            expect(context.get('savedIndex')).toBe(-1);
        });

        it('should set up document type elements', () => {
            const context = CreateFrameContext(
                mockEditorTarget,
                mockDOM.top,
                mockDOM.wwFrame,
                mockDOM.codeWrapper,
                mockDOM.codeFrame,
                mockDOM.statusbar,
                mockDOM.documentTypeInner,
                'testKey'
            );

            expect(context.get('documentTypeInner')).toBe(mockDOM.documentTypeInner.inner);
            expect(context.get('documentTypePage')).toBe(mockDOM.documentTypeInner.page);
            expect(context.get('documentTypePageMirror')).toBe(mockDOM.documentTypeInner.pageMirror);
        });

        it('should parse minHeight from style correctly', () => {
            const context = CreateFrameContext(
                mockEditorTarget,
                mockDOM.top,
                mockDOM.wwFrame,
                mockDOM.codeWrapper,
                mockDOM.codeFrame,
                mockDOM.statusbar,
                mockDOM.documentTypeInner,
                'testKey'
            );

            // Should parse '100px' to 100
            expect(context.get('_minHeight')).toBe(100);
        });

        it('should include placeholder when present', () => {
            const context = CreateFrameContext(
                mockEditorTarget,
                mockDOM.top,
                mockDOM.wwFrame,
                mockDOM.codeWrapper,
                mockDOM.codeFrame,
                mockDOM.statusbar,
                mockDOM.documentTypeInner,
                'testKey'
            );

            expect(context.get('placeholder')).toBe(mockDOM.top.querySelector('.se-placeholder'));
        });

        it('should handle missing placeholder gracefully', () => {
            // Remove placeholder from DOM
            const placeholder = mockDOM.top.querySelector('.se-placeholder');
            placeholder.remove();

            const context = CreateFrameContext(
                mockEditorTarget,
                mockDOM.top,
                mockDOM.wwFrame,
                mockDOM.codeWrapper,
                mockDOM.codeFrame,
                mockDOM.statusbar,
                mockDOM.documentTypeInner,
                'testKey'
            );

            expect(context.has('placeholder')).toBe(false);
        });

        it('should handle null statusbar', () => {
            const context = CreateFrameContext(
                mockEditorTarget,
                mockDOM.top,
                mockDOM.wwFrame,
                mockDOM.codeWrapper,
                mockDOM.codeFrame,
                null,
                mockDOM.documentTypeInner,
                'testKey'
            );

            // Should not have statusbar elements
            expect(context.has('statusbar')).toBe(false);
            expect(context.has('navigation')).toBe(false);
            expect(context.has('charWrapper')).toBe(false);
            expect(context.has('charCounter')).toBe(false);
        });
    });

    describe('UpdateStatusbarContext function', () => {
        let mockContext;

        beforeEach(() => {
            mockContext = new Map();
        });

        it('should add statusbar elements when statusbar is provided', () => {
            UpdateStatusbarContext(mockDOM.statusbar, mockContext);

            expect(mockContext.get('statusbar')).toBe(mockDOM.statusbar);
            expect(mockContext.get('navigation')).toBe(mockDOM.statusbar.querySelector('.se-navigation'));
            expect(mockContext.get('charWrapper')).toBe(mockDOM.statusbar.querySelector('.se-char-counter-wrapper'));
            expect(mockContext.get('charCounter')).toBe(mockDOM.statusbar.querySelector('.se-char-counter-wrapper .se-char-counter'));
        });

        it('should remove statusbar elements when statusbar is null', () => {
            // First add elements
            mockContext.set('statusbar', mockDOM.statusbar);
            mockContext.set('navigation', document.createElement('div'));
            mockContext.set('charWrapper', document.createElement('div'));
            mockContext.set('charCounter', document.createElement('div'));

            // Then remove with null
            UpdateStatusbarContext(null, mockContext);

            expect(mockContext.has('statusbar')).toBe(false);
            expect(mockContext.has('navigation')).toBe(false);
            expect(mockContext.has('charWrapper')).toBe(false);
            expect(mockContext.has('charCounter')).toBe(false);
        });

        it('should handle statusbar without expected child elements', () => {
            const emptyStatusbar = document.createElement('div');
            UpdateStatusbarContext(emptyStatusbar, mockContext);

            expect(mockContext.get('statusbar')).toBe(emptyStatusbar);
            expect(mockContext.has('navigation')).toBe(false);
            expect(mockContext.has('charWrapper')).toBe(false);
            expect(mockContext.has('charCounter')).toBe(false);
        });
    });

    // Note: FrameContextUtil and Integration tests have been moved to
    // test/unit/core/services/contextManager.spec.js
});