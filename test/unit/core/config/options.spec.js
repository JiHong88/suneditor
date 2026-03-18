/**
 * @fileoverview Unit tests for core/config/options.js
 */

import {
    DEFAULTS,
    OPTION_FRAME_FIXED_FLAG,
    OPTION_FIXED_FLAG
    // FrameOptionsMap, BaseOptionsMap moved to optionProvider service
} from '../../../../src/core/schema/options';

describe('Core Config - Options', () => {
    describe('DEFAULTS constant', () => {

        it('should have valid BUTTON_LIST structure', () => {
            expect(DEFAULTS.BUTTON_LIST).toEqual([
                ['undo', 'redo'],
                '|',
                ['bold', 'underline', 'italic', 'strike', '|', 'subscript', 'superscript'],
                '|',
                ['removeFormat'],
                '|',
                ['outdent', 'indent'],
                '|',
                ['fullScreen', 'showBlocks', 'codeView'],
                '|',
                ['preview', 'print']
            ]);
        });

        it('should have valid format constants', () => {
            expect(DEFAULTS.REQUIRED_FORMAT_LINE).toBe('div');
            expect(DEFAULTS.REQUIRED_ELEMENT_WHITELIST).toBe('br|div');
            expect(DEFAULTS.FORMAT_LINE).toBe('P|H[1-6]|LI|TH|TD|DETAILS');
            expect(DEFAULTS.FORMAT_BR_LINE).toBe('PRE');
            expect(DEFAULTS.FORMAT_CLOSURE_BR_LINE).toBe('');
            expect(DEFAULTS.FORMAT_BLOCK).toBe('BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|CAPTION|DETAILS');
            expect(DEFAULTS.FORMAT_CLOSURE_BLOCK).toBe('TH|TD');
        });

        it('should have valid whitelist strings', () => {
            const elementWhitelist = DEFAULTS.ELEMENT_WHITELIST;
            expect(elementWhitelist).toContain('p');
            expect(elementWhitelist).toContain('blockquote');
            expect(elementWhitelist).toContain('h1');
            expect(elementWhitelist).toContain('h2');
            expect(elementWhitelist).toContain('ol');
            expect(elementWhitelist).toContain('table');
            expect(elementWhitelist).toContain('thead');
            expect(elementWhitelist).toContain('tbody');

            const attributeWhitelist = DEFAULTS.ATTRIBUTE_WHITELIST;
            expect(attributeWhitelist).toContain('contenteditable');
            expect(attributeWhitelist).toContain('target');
            expect(attributeWhitelist).toContain('href');
            expect(attributeWhitelist).toContain('src');
            expect(attributeWhitelist).toContain('alt');
            expect(attributeWhitelist).toContain('width');
            expect(attributeWhitelist).toContain('controls');
        });

        it('should have valid scope selection tags', () => {
            expect(DEFAULTS.SCOPE_SELECTION_TAGS).toEqual([
                'td', 'table', 'li', 'ol', 'ul', 'pre',
                'figcaption', 'blockquote', 'dl', 'dt', 'dd'
            ]);
        });

        it('should have valid size units', () => {
            expect(DEFAULTS.SIZE_UNITS).toEqual(['px', 'pt', 'em', 'rem']);
        });

        it('should have valid style mode options', () => {
            expect(DEFAULTS.RETAIN_STYLE_MODE).toEqual(['repeat', 'always', 'none']);
        });

        it('should have class name regex patterns', () => {
            expect(DEFAULTS.CLASS_NAME).toBe('^__se__|^se-|^katex|^MathJax|^language-');
            expect(DEFAULTS.CLASS_MJX).toContain('mjx-container|mjx-math');
        });

        it('should have extra tag map configuration', () => {
            expect(DEFAULTS.EXTRA_TAG_MAP).toEqual({
                script: false,
                style: false,
                meta: false,
                link: false,
                '[a-z]+:[a-z]+': false
            });
        });

        it('should have comprehensive content styles', () => {
            const styles = DEFAULTS.CONTENT_STYLES;
            expect(styles).toContain('background');
            expect(styles).toContain('background-color');
            expect(styles).toContain('border');
            expect(styles).toContain('border-radius');
            expect(styles).toContain('font');
            expect(styles).toContain('font-family');
            expect(styles).toContain('font-size');
            expect(styles).toContain('margin');
            expect(styles).toContain('padding');
            expect(styles).toContain('text-align');
            expect(styles).toContain('text-decoration');
        });

        it('should have tag-specific styles', () => {
            const tableStyles = DEFAULTS.TAG_STYLES['table|th|td'];
            expect(tableStyles).toContain('border');
            expect(tableStyles).toContain('color');
            expect(tableStyles).toContain('background-color');
            expect(DEFAULTS.TAG_STYLES['ol|ul']).toBe('list-style-type');
            expect(DEFAULTS.TAG_STYLES['tr']).toBe('height');
            expect(DEFAULTS.TAG_STYLES['col']).toBe('width');
        });
    });

    // Note: FrameOptionsMap, BaseOptionsMap, and Integration tests have been moved to
    // test/unit/core/config/optionProvider.spec.js
});