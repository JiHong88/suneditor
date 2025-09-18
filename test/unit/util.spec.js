import util from '../../src/lib/util';

describe('util', () => {
    beforeAll(() => {
        // Initialize properties for DOM-dependent functions
        util._propertiesInit();
    });

    describe('HTML conversion', () => {
        it('should convert HTML reserved characters', () => {
            expect(util._HTMLConvertor('&<>\'"')).toBe('&amp;&lt;&gt;&apos;&quot;');
            expect(util._HTMLConvertor('test & test')).toBe('test &amp; test');
        });

        it('should encode HTML special characters', () => {
            expect(util.HTMLEncoder('<div>test</div>')).toBe('$lt;div$gt;test$lt;/div$gt;');
            expect(util.HTMLEncoder('test > 5 < 10')).toBe('test $gt; 5 $lt; 10');
        });

        it('should decode HTML special characters', () => {
            expect(util.HTMLDecoder('$lt;div$gt;test$lt;/div$gt;')).toBe('<div>test</div>');
            expect(util.HTMLDecoder('test $gt; 5 $lt; 10')).toBe('test > 5 < 10');
        });
    });

    describe('case conversion', () => {
        it('should convert camelCase to kebab-case', () => {
            expect(util.camelToKebabCase('backgroundColor')).toBe('background-color');
            expect(util.camelToKebabCase('fontSize')).toBe('font-size');
            expect(util.camelToKebabCase(['backgroundColor', 'fontSize'])).toEqual(['background-color', 'font-size']);
        });

        it('should convert kebab-case to camelCase', () => {
            expect(util.kebabToCamelCase('background-color')).toBe('backgroundColor');
            expect(util.kebabToCamelCase('font-size')).toBe('fontSize');
        });
    });

    describe('zero width space handling', () => {
        it('should detect only zero width space', () => {
            expect(util.onlyZeroWidthSpace('')).toBe(true);
            expect(util.onlyZeroWidthSpace(util.zeroWidthSpace)).toBe(true);
            expect(util.onlyZeroWidthSpace(util.zeroWidthSpace + util.zeroWidthSpace)).toBe(true);
            expect(util.onlyZeroWidthSpace('test')).toBe(false);
            expect(util.onlyZeroWidthSpace('test' + util.zeroWidthSpace)).toBe(false);
        });

        it('should handle null/undefined values', () => {
            expect(util.onlyZeroWidthSpace(null)).toBe(false);
            expect(util.onlyZeroWidthSpace(undefined)).toBe(false);
        });
    });

    describe('object utilities', () => {
        it('should get object values', () => {
            const obj = { a: 1, b: 2, c: 3 };
            expect(util.getValues(obj)).toEqual([1, 2, 3]);
            expect(util.getValues(null)).toEqual([]);
            expect(util.getValues({})).toEqual([]);
        });

        it('should check object properties', () => {
            const obj = { a: 1, b: 2 };
            expect(util.hasOwn(obj, 'a')).toBe(true);
            expect(util.hasOwn(obj, 'c')).toBe(false);
        });
    });

    describe('number utilities', () => {
        it('should detect numbers', () => {
            expect(util.isNumber('123')).toBe(true);
            expect(util.isNumber('123.45')).toBe(true);
            expect(util.isNumber('-123')).toBe(true);
            expect(util.isNumber('-123.45')).toBe(true);
            expect(util.isNumber(123)).toBe(true);
            expect(util.isNumber('abc')).toBe(false);
            expect(util.isNumber('')).toBe(false);
        });

        it('should extract numbers', () => {
            expect(util.getNumber('123px')).toBe(123);
            expect(util.getNumber('123.45px')).toBe(123.45);
            expect(util.getNumber('-123px')).toBe(-123);
            expect(util.getNumber('abc')).toBe(0);
            expect(util.getNumber('')).toBe(0);
            expect(util.getNumber('123.456789', 2)).toBe(123.46);
            expect(util.getNumber('123.456789', 0)).toBe(123);
        });
    });

    describe('element type checking', () => {
        let element;

        beforeEach(() => {
            element = document.createElement('div');
        });

        it('should check if element is a list', () => {
            expect(util.isList('OL')).toBe(true);
            expect(util.isList('UL')).toBe(true);
            expect(util.isList('ol')).toBe(true);
            expect(util.isList('ul')).toBe(true);
            expect(util.isList('DIV')).toBe(false);

            const ol = document.createElement('ol');
            const ul = document.createElement('ul');
            const div = document.createElement('div');
            expect(util.isList(ol)).toBe(true);
            expect(util.isList(ul)).toBe(true);
            expect(util.isList(div)).toBe(false);
        });

        it('should check if element is a list cell', () => {
            expect(util.isListCell('LI')).toBe(true);
            expect(util.isListCell('li')).toBe(true);
            expect(util.isListCell('DIV')).toBe(false);

            const li = document.createElement('li');
            const div = document.createElement('div');
            expect(util.isListCell(li)).toBe(true);
            expect(util.isListCell(div)).toBe(false);
        });

        it('should check if element is a table', () => {
            expect(util.isTable('TABLE')).toBe(true);
            expect(util.isTable('THEAD')).toBe(true);
            expect(util.isTable('TBODY')).toBe(true);
            expect(util.isTable('TR')).toBe(true);
            expect(util.isTable('TH')).toBe(true);
            expect(util.isTable('TD')).toBe(true);
            expect(util.isTable('DIV')).toBe(false);
        });

        it('should check if element is a table cell', () => {
            expect(util.isCell('TD')).toBe(true);
            expect(util.isCell('TH')).toBe(true);
            expect(util.isCell('DIV')).toBe(false);
        });

        it('should check if element is a break', () => {
            expect(util.isBreak('BR')).toBe(true);
            expect(util.isBreak('br')).toBe(true);
            expect(util.isBreak('DIV')).toBe(false);
        });

        it('should check if element is an anchor', () => {
            expect(util.isAnchor('A')).toBe(true);
            expect(util.isAnchor('a')).toBe(true);
            expect(util.isAnchor('DIV')).toBe(false);
        });

        it('should check if element is media', () => {
            expect(util.isMedia('IMG')).toBe(true);
            expect(util.isMedia('IFRAME')).toBe(true);
            expect(util.isMedia('AUDIO')).toBe(true);
            expect(util.isMedia('VIDEO')).toBe(true);
            expect(util.isMedia('CANVAS')).toBe(true);
            expect(util.isMedia('DIV')).toBe(false);
        });

        it('should check if element is a figure', () => {
            expect(util.isFigures('FIGURE')).toBe(true);
            expect(util.isFigures('IMG')).toBe(true);
            expect(util.isFigures('VIDEO')).toBe(true);
            expect(util.isFigures('DIV')).toBe(false);
        });
    });

    describe('CSS class utilities', () => {
        let element;

        beforeEach(() => {
            element = document.createElement('div');
        });

        it('should check if element has class', () => {
            element.className = 'test-class another-class';
            expect(util.hasClass(element, 'test-class')).toBe(true);
            expect(util.hasClass(element, 'another-class')).toBe(true);
            expect(util.hasClass(element, 'missing-class')).toBe(false);
        });

        it('should add class to element', () => {
            util.addClass(element, 'new-class');
            expect(element.className).toBe('new-class');

            util.addClass(element, 'another-class');
            expect(element.className).toBe('new-class another-class');

            // Should not add duplicate classes
            util.addClass(element, 'new-class');
            expect(element.className).toBe('new-class another-class');
        });

        it('should remove class from element', () => {
            element.className = 'class1 class2 class3';
            util.removeClass(element, 'class2');
            expect(element.className.trim()).toBe('class1 class3');

            util.removeClass(element, 'class1');
            util.removeClass(element, 'class3');
            expect(element.hasAttribute('class')).toBe(false);
        });

        it('should toggle class on element', () => {
            expect(util.toggleClass(element, 'toggle-class')).toBe(true);
            expect(element.className).toBe(' toggle-class');

            expect(util.toggleClass(element, 'toggle-class')).toBe(false);
            expect(element.hasAttribute('class')).toBe(false);
        });
    });

    describe('array utilities', () => {
        it('should get array item based on validation', () => {
            const array = [1, 2, 3, 4, 5];
            const validation = (item) => item > 3;

            expect(util.getArrayItem(array, validation, false)).toBe(4);
            expect(util.getArrayItem(array, validation, true)).toEqual([4, 5]);
            expect(util.getArrayItem([], validation, false)).toBe(null);
            expect(util.getArrayItem([], validation, true)).toBe(null);
        });

        it('should check if array includes element', () => {
            const array = ['a', 'b', 'c'];
            expect(util.arrayIncludes(array, 'b')).toBe(true);
            expect(util.arrayIncludes(array, 'd')).toBe(false);
        });

        it('should get element index in array', () => {
            const array = ['a', 'b', 'c'];
            expect(util.getArrayIndex(array, 'b')).toBe(1);
            expect(util.getArrayIndex(array, 'd')).toBe(-1);
        });

        it('should get next index', () => {
            const array = ['a', 'b', 'c'];
            expect(util.nextIdx(array, 'b')).toBe(2);
            expect(util.nextIdx(array, 'c')).toBe(3);
            expect(util.nextIdx(array, 'd')).toBe(-1);
        });

        it('should get previous index', () => {
            const array = ['a', 'b', 'c'];
            expect(util.prevIdx(array, 'b')).toBe(0);
            expect(util.prevIdx(array, 'a')).toBe(-1);
            expect(util.prevIdx(array, 'd')).toBe(-1);
        });
    });

    describe('string utilities', () => {
        it('should escape string for regex', () => {
            expect(util.escapeStringRegexp('hello')).toBe('hello');
            expect(util.escapeStringRegexp('hello.world')).toBe('hello\\.world');
            expect(util.escapeStringRegexp('[test]')).toBe('\\[test\\]');
            expect(util.escapeStringRegexp('test-string')).toBe('test\\x2dstring');
        });

        it('should throw error for non-string input', () => {
            expect(() => util.escapeStringRegexp(123)).toThrow('Expected a string');
            expect(() => util.escapeStringRegexp(null)).toThrow('Expected a string');
        });
    });

    describe('text manipulation', () => {
        let element;

        beforeEach(() => {
            element = document.createElement('div');
            element.textContent = 'original text';
        });

        it('should change text content', () => {
            util.changeTxt(element, 'new text');
            expect(element.textContent).toBe('new text');

            // Should handle null/empty values
            util.changeTxt(element, null);
            expect(element.textContent).toBe('original text');
        });
    });

    describe('style utilities', () => {
        let element;

        beforeEach(() => {
            element = document.createElement('div');
        });

        it('should set style properties', () => {
            util.setStyle(element, 'color', 'red');
            expect(element.style.color).toBe('red');

            util.setStyle(element, 'fontSize', '16px');
            expect(element.style.fontSize).toBe('16px');
        });

        it('should remove style attribute when all styles are cleared', () => {
            element.style.color = 'red';
            util.setStyle(element, 'color', '');
            expect(element.hasAttribute('style')).toBe(false);
        });
    });

    describe('whitelist/blacklist utilities', () => {
        it('should create tags whitelist regex', () => {
            const regex = util.createTagsWhitelist('div|p|span');
            expect(regex.test('<div>test</div>')).toBe(false);
            expect(regex.test('<script>test</script>')).toBe(true);
        });

        it('should create tags blacklist regex', () => {
            const regex = util.createTagsBlacklist('script|style');
            expect(regex.test('<script>test</script>')).toBe(true);
            expect(regex.test('<div>test</div>')).toBe(false);
        });
    });

    describe('HTML utilities', () => {
        it('should remove whitespace from HTML', () => {
            const html = '<div>\n  <p>  test  </p>\n</div>';
            const cleaned = util.htmlRemoveWhiteSpace(html);
            expect(cleaned).not.toContain('\n');
        });

        it('should compress HTML', () => {
            const html = '<div>\n  <p>test</p>\n</div>';
            const compressed = util.htmlCompress(html);
            expect(compressed).toBe('<div>  <p>test</p>  </div>');
        });
    });

    describe('byte length calculation', () => {
        it('should calculate byte length of text', () => {
            expect(util.getByteLength('hello')).toBeGreaterThan(0);
            expect(util.getByteLength('')).toBe(0);
            expect(util.getByteLength(null)).toBe(0);
            expect(util.getByteLength('test\n')).toBeGreaterThan(4);
        });
    });

    describe('font value mapping', () => {
        it('should have font value mapping', () => {
            expect(util.fontValueMap['small']).toBe(3);
            expect(util.fontValueMap['medium']).toBe(4);
            expect(util.fontValueMap['large']).toBe(5);
        });
    });

    describe('DOM creation', () => {
        it('should create elements', () => {
            const div = util.createElement('div');
            expect(div.nodeName).toBe('DIV');
        });

        it('should create text nodes', () => {
            const textNode = util.createTextNode('test text');
            expect(textNode.nodeType).toBe(3);
            expect(textNode.textContent).toBe('test text');

            const emptyTextNode = util.createTextNode();
            expect(emptyTextNode.textContent).toBe('');
        });
    });
});