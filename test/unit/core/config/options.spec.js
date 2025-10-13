/**
 * @fileoverview Unit tests for core/config/options.js
 */

import {
    DEFAULTS,
    OPTION_FRAME_FIXED_FLAG,
    OPTION_FIXED_FLAG,
    FrameOptionsMap,
    BaseOptionsMap
} from '../../../../src/core/config/options';

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
            expect(DEFAULTS.CLASS_NAME).toBe('^__se__|^se-|^katex|^MathJax');
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


    describe('FrameOptionsMap function', () => {
        let mockEditor;
        let frameOptions;

        beforeEach(() => {
            const mockMap = new Map([
                ['width', '100%'],
                ['height', '300px'],
                ['iframe', false]
            ]);

            mockEditor = {
                __frameOptions: mockMap
            };

            frameOptions = FrameOptionsMap(mockEditor);
        });


        it('should get values correctly', () => {
            expect(frameOptions.get('width')).toBe('100%');
            expect(frameOptions.get('height')).toBe('300px');
            expect(frameOptions.get('iframe')).toBe(false);
            expect(frameOptions.get('nonexistent')).toBeUndefined();
        });

        it('should set values correctly', () => {
            frameOptions.set('maxWidth', '800px');
            expect(frameOptions.get('maxWidth')).toBe('800px');
        });

        it('should check existence correctly', () => {
            expect(frameOptions.has('width')).toBe(true);
            expect(frameOptions.has('height')).toBe(true);
            expect(frameOptions.has('nonexistent')).toBe(false);
        });

        it('should get all values as object', () => {
            const all = frameOptions.getAll();
            expect(all).toEqual({
                width: '100%',
                height: '300px',
                iframe: false
            });
        });

        it('should set many values at once', () => {
            frameOptions.setMany({
                minWidth: '200px',
                maxHeight: '500px',
                statusbar: true
            });

            expect(frameOptions.get('minWidth')).toBe('200px');
            expect(frameOptions.get('maxHeight')).toBe('500px');
            expect(frameOptions.get('statusbar')).toBe(true);
        });

        it('should reset with new map', () => {
            const newMap = new Map([['theme', 'dark'], ['mode', 'inline']]);
            frameOptions.reset(newMap);

            expect(frameOptions.get('theme')).toBe('dark');
            expect(frameOptions.get('mode')).toBe('inline');
            expect(frameOptions.get('width')).toBeUndefined(); // Old values should be gone
        });

        it('should clear all values', () => {
            frameOptions.clear();
            expect(frameOptions.getAll()).toEqual({});
            expect(frameOptions.has('width')).toBe(false);
        });
    });

    describe('BaseOptionsMap function', () => {
        let mockEditor;
        let baseOptions;

        beforeEach(() => {
            const mockMap = new Map([
                ['plugins', []],
                ['buttonList', ['bold', 'italic']],
                ['strictMode', true]
            ]);

            mockEditor = {
                __options: mockMap
            };

            baseOptions = BaseOptionsMap(mockEditor);
        });


        it('should get values correctly', () => {
            expect(baseOptions.get('plugins')).toEqual([]);
            expect(baseOptions.get('buttonList')).toEqual(['bold', 'italic']);
            expect(baseOptions.get('strictMode')).toBe(true);
            expect(baseOptions.get('nonexistent')).toBeUndefined();
        });

        it('should set values correctly', () => {
            baseOptions.set('theme', 'custom');
            expect(baseOptions.get('theme')).toBe('custom');
        });

        it('should check existence correctly', () => {
            expect(baseOptions.has('plugins')).toBe(true);
            expect(baseOptions.has('buttonList')).toBe(true);
            expect(baseOptions.has('nonexistent')).toBe(false);
        });

        it('should get all values as object', () => {
            const all = baseOptions.getAll();
            expect(all).toEqual({
                plugins: [],
                buttonList: ['bold', 'italic'],
                strictMode: true
            });
        });

        it('should set many values at once', () => {
            baseOptions.setMany({
                mode: 'balloon',
                lang: 'ko',
                shortcuts: { 'ctrl+b': 'bold' }
            });

            expect(baseOptions.get('mode')).toBe('balloon');
            expect(baseOptions.get('lang')).toBe('ko');
            expect(baseOptions.get('shortcuts')).toEqual({ 'ctrl+b': 'bold' });
        });

        it('should reset with new map', () => {
            const newMap = new Map([['elementWhitelist', 'p|div'], ['textDirection', 'rtl']]);
            baseOptions.reset(newMap);

            expect(baseOptions.get('elementWhitelist')).toBe('p|div');
            expect(baseOptions.get('textDirection')).toBe('rtl');
            expect(baseOptions.get('plugins')).toBeUndefined(); // Old values should be gone
        });

        it('should clear all values', () => {
            baseOptions.clear();
            expect(baseOptions.getAll()).toEqual({});
            expect(baseOptions.has('plugins')).toBe(false);
        });

        it('should handle complex data types', () => {
            const complexData = {
                array: [1, 2, 3],
                object: { a: 1, b: 2 },
                function: () => 'test',
                null: null,
                undefined: undefined
            };

            baseOptions.setMany(complexData);

            expect(baseOptions.get('array')).toEqual([1, 2, 3]);
            expect(baseOptions.get('object')).toEqual({ a: 1, b: 2 });
            expect(typeof baseOptions.get('function')).toBe('function');
            expect(baseOptions.get('null')).toBeNull();
            expect(baseOptions.get('undefined')).toBeUndefined();
        });
    });

    describe('Integration tests', () => {
        it('should work with both utilities on same editor', () => {
            const mockEditor = {
                __options: new Map([['mode', 'classic']]),
                __frameOptions: new Map([['width', '100%']])
            };

            const baseUtil = BaseOptionsMap(mockEditor);
            const frameUtil = FrameOptionsMap(mockEditor);

            expect(baseUtil.get('mode')).toBe('classic');
            expect(frameUtil.get('width')).toBe('100%');

            // Should not interfere with each other
            baseUtil.set('theme', 'dark');
            frameUtil.set('height', '400px');

            expect(baseUtil.get('theme')).toBe('dark');
            expect(frameUtil.get('height')).toBe('400px');
            expect(baseUtil.has('height')).toBe(false); // baseUtil shouldn't have frame option
            expect(frameUtil.has('theme')).toBe(false); // frameUtil shouldn't have base option
        });
    });
});