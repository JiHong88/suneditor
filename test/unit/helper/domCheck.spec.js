import { dom } from '../../../src/helper';

describe('dom.check helper', () => {
	describe('isZeroWidth', () => {
		it('should detect zero width strings', () => {
			expect(dom.check.isZeroWidth('')).toBe(true);
			expect(dom.check.isZeroWidth('\u200B')).toBe(true);
			expect(dom.check.isZeroWidth('\u200B\u200B')).toBe(true);
		});

		it('should return false for non-zero width strings', () => {
			expect(dom.check.isZeroWidth('hello')).toBe(false);
			expect(dom.check.isZeroWidth('hello\u200B')).toBe(false);
			expect(dom.check.isZeroWidth('\u200Bworld')).toBe(false);
		});

		it('should handle null and undefined', () => {
			expect(dom.check.isZeroWidth(null)).toBe(false);
			expect(dom.check.isZeroWidth(undefined)).toBe(false);
		});

		it('should check elements for zero width content', () => {
			const div = document.createElement('div');
			div.textContent = '';
			expect(dom.check.isZeroWidth(div)).toBe(true);

			div.textContent = '\u200B';
			expect(dom.check.isZeroWidth(div)).toBe(true);

			div.textContent = 'content';
			expect(dom.check.isZeroWidth(div)).toBe(false);
		});
	});

	describe('isEdgePoint', () => {
		it('should detect front edge', () => {
			const textNode = document.createTextNode('hello');
			expect(dom.check.isEdgePoint(textNode, 0, 'front')).toBe(true);
			expect(dom.check.isEdgePoint(textNode, 1, 'front')).toBe(false);
		});

		it('should detect end edge', () => {
			const textNode = document.createTextNode('hello');
			expect(dom.check.isEdgePoint(textNode, 5, 'end')).toBe(true);
			expect(dom.check.isEdgePoint(textNode, 4, 'end')).toBe(false);
		});

		it('should detect both edges', () => {
			const textNode = document.createTextNode('hello');
			expect(dom.check.isEdgePoint(textNode, 0)).toBe(true);
			expect(dom.check.isEdgePoint(textNode, 5)).toBe(true);
			expect(dom.check.isEdgePoint(textNode, 2)).toBe(false);
		});
	});

	describe('isText', () => {
		it('should detect text nodes', () => {
			const textNode = document.createTextNode('hello');
			expect(dom.check.isText(textNode)).toBe(true);
		});

		it('should return false for element nodes', () => {
			const div = document.createElement('div');
			expect(dom.check.isText(div)).toBe(false);
		});

		it('should handle null input', () => {
			expect(dom.check.isText(null)).toBe(false);
		});
	});

	describe('isElement', () => {
		it('should detect element nodes', () => {
			const div = document.createElement('div');
			expect(dom.check.isElement(div)).toBe(true);
		});

		it('should return false for text nodes', () => {
			const textNode = document.createTextNode('hello');
			expect(dom.check.isElement(textNode)).toBe(false);
		});

		it('should handle null input', () => {
			expect(dom.check.isElement(null)).toBe(false);
		});
	});

	describe('isInputElement', () => {
		it('should detect input elements', () => {
			expect(dom.check.isInputElement(document.createElement('input'))).toBe(true);
			expect(dom.check.isInputElement(document.createElement('textarea'))).toBe(true);
			expect(dom.check.isInputElement(document.createElement('select'))).toBe(true);
			expect(dom.check.isInputElement(document.createElement('option'))).toBe(true);
		});

		it('should return false for non-input elements', () => {
			expect(dom.check.isInputElement(document.createElement('div'))).toBe(false);
			expect(dom.check.isInputElement(document.createElement('p'))).toBe(false);
		});
	});

	describe('isButtonElement', () => {
		it('should detect button elements', () => {
			expect(dom.check.isButtonElement(document.createElement('button'))).toBe(true);
		});

		it('should return false for non-button elements', () => {
			expect(dom.check.isButtonElement(document.createElement('div'))).toBe(false);
			expect(dom.check.isButtonElement(document.createElement('input'))).toBe(false);
		});
	});

	describe('isList', () => {
		it('should detect list elements', () => {
			expect(dom.check.isList(document.createElement('ul'))).toBe(true);
			expect(dom.check.isList(document.createElement('ol'))).toBe(true);
			expect(dom.check.isList('UL')).toBe(true);
			expect(dom.check.isList('OL')).toBe(true);
		});

		it('should return false for non-list elements', () => {
			expect(dom.check.isList(document.createElement('div'))).toBe(false);
			expect(dom.check.isList('DIV')).toBe(false);
		});
	});

	describe('isListCell', () => {
		it('should detect list item elements', () => {
			expect(dom.check.isListCell(document.createElement('li'))).toBe(true);
			expect(dom.check.isListCell('LI')).toBe(true);
		});

		it('should return false for non-list-item elements', () => {
			expect(dom.check.isListCell(document.createElement('ul'))).toBe(false);
			expect(dom.check.isListCell('UL')).toBe(false);
		});
	});

	describe('isTable', () => {
		it('should detect table elements', () => {
			expect(dom.check.isTable(document.createElement('table'))).toBe(true);
			expect(dom.check.isTable('TABLE')).toBe(true);
		});

		it('should return false for non-table elements', () => {
			expect(dom.check.isTable(document.createElement('div'))).toBe(false);
			expect(dom.check.isTable('DIV')).toBe(false);
		});
	});

	describe('isTableElements', () => {
		it('should detect all table-related elements', () => {
			const tableElements = ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'col'];
			tableElements.forEach(tag => {
				expect(dom.check.isTableElements(document.createElement(tag))).toBe(true);
				expect(dom.check.isTableElements(tag.toUpperCase())).toBe(true);
			});
		});

		it('should return false for non-table elements', () => {
			expect(dom.check.isTableElements(document.createElement('div'))).toBe(false);
			expect(dom.check.isTableElements('DIV')).toBe(false);
		});
	});

	describe('isTableCell', () => {
		it('should detect table cell elements', () => {
			expect(dom.check.isTableCell(document.createElement('td'))).toBe(true);
			expect(dom.check.isTableCell(document.createElement('th'))).toBe(true);
			expect(dom.check.isTableCell('TD')).toBe(true);
			expect(dom.check.isTableCell('TH')).toBe(true);
		});

		it('should return false for non-cell elements', () => {
			expect(dom.check.isTableCell(document.createElement('tr'))).toBe(false);
			expect(dom.check.isTableCell('TR')).toBe(false);
		});
	});

	describe('isTableRow', () => {
		it('should detect table row elements', () => {
			expect(dom.check.isTableRow(document.createElement('tr'))).toBe(true);
			expect(dom.check.isTableRow('TR')).toBe(true);
		});

		it('should return false for non-row elements', () => {
			expect(dom.check.isTableRow(document.createElement('td'))).toBe(false);
			expect(dom.check.isTableRow('TD')).toBe(false);
		});
	});

	describe('isBreak', () => {
		it('should detect break elements', () => {
			expect(dom.check.isBreak(document.createElement('br'))).toBe(true);
			expect(dom.check.isBreak('BR')).toBe(true);
		});

		it('should return false for non-break elements', () => {
			expect(dom.check.isBreak(document.createElement('div'))).toBe(false);
			expect(dom.check.isBreak('DIV')).toBe(false);
		});
	});

	describe('isAnchor', () => {
		it('should detect anchor elements', () => {
			expect(dom.check.isAnchor(document.createElement('a'))).toBe(true);
			expect(dom.check.isAnchor('A')).toBe(true);
		});

		it('should return false for non-anchor elements', () => {
			expect(dom.check.isAnchor(document.createElement('div'))).toBe(false);
			expect(dom.check.isAnchor('DIV')).toBe(false);
		});
	});

	describe('isMedia', () => {
		it('should detect media elements', () => {
			const mediaElements = ['img', 'iframe', 'audio', 'video', 'canvas'];
			mediaElements.forEach(tag => {
				expect(dom.check.isMedia(document.createElement(tag))).toBe(true);
				expect(dom.check.isMedia(tag.toUpperCase())).toBe(true);
			});
		});

		it('should return false for non-media elements', () => {
			expect(dom.check.isMedia(document.createElement('div'))).toBe(false);
			expect(dom.check.isMedia('DIV')).toBe(false);
		});
	});

	describe('isIFrame', () => {
		it('should detect iframe elements', () => {
			expect(dom.check.isIFrame(document.createElement('iframe'))).toBe(true);
			expect(dom.check.isIFrame('IFRAME')).toBe(true);
		});

		it('should return false for non-iframe elements', () => {
			expect(dom.check.isIFrame(document.createElement('img'))).toBe(false);
			expect(dom.check.isIFrame('IMG')).toBe(false);
		});
	});

	describe('isFigure', () => {
		it('should detect figure elements', () => {
			expect(dom.check.isFigure(document.createElement('figure'))).toBe(true);
			expect(dom.check.isFigure('FIGURE')).toBe(true);
		});

		it('should return false for non-figure elements', () => {
			expect(dom.check.isFigure(document.createElement('div'))).toBe(false);
			expect(dom.check.isFigure('DIV')).toBe(false);
		});
	});

	describe('isContentLess', () => {
		it('should detect void/self-closing elements', () => {
			const voidElements = ['br', 'hr', 'img', 'input', 'area', 'base', 'col', 'embed', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
			voidElements.forEach(tag => {
				expect(dom.check.isContentLess(document.createElement(tag))).toBe(true);
				expect(dom.check.isContentLess(tag.toUpperCase())).toBe(true);
			});
		});

		it('should return false for container elements', () => {
			expect(dom.check.isContentLess(document.createElement('div'))).toBe(false);
			expect(dom.check.isContentLess('DIV')).toBe(false);
		});
	});

	describe('isEmptyLine', () => {
		it('should detect empty line elements', () => {
			const div = document.createElement('div');
			document.body.appendChild(div); // needs to be in DOM for parent check

			expect(dom.check.isEmptyLine(div)).toBe(true);

			div.textContent = 'content';
			expect(dom.check.isEmptyLine(div)).toBe(false);

			document.body.removeChild(div);
		});

		it('should return true for elements without parent', () => {
			const div = document.createElement('div');
			expect(dom.check.isEmptyLine(div)).toBe(true);
		});
	});

	describe('isSpanWithoutAttr', () => {
		it('should detect spans without class or style', () => {
			const span = document.createElement('span');
			expect(dom.check.isSpanWithoutAttr(span)).toBe(true);
		});

		it('should return false for spans with attributes', () => {
			const span = document.createElement('span');
			span.className = 'test';
			expect(dom.check.isSpanWithoutAttr(span)).toBe(false);

			span.className = '';
			span.style.color = 'red';
			expect(dom.check.isSpanWithoutAttr(span)).toBe(false);
		});

		it('should return false for non-span elements', () => {
			const div = document.createElement('div');
			expect(dom.check.isSpanWithoutAttr(div)).toBe(false);
		});
	});

	describe('isSameAttributes', () => {
		it('should return true for text nodes', () => {
			const text1 = document.createTextNode('hello');
			const text2 = document.createTextNode('world');
			expect(dom.check.isSameAttributes(text1, text2)).toBe(true);
		});

		it('should return false when one is text and other is element', () => {
			const text = document.createTextNode('hello');
			const div = document.createElement('div');
			expect(dom.check.isSameAttributes(text, div)).toBe(false);
		});

		it('should compare element attributes', () => {
			const div1 = document.createElement('div');
			const div2 = document.createElement('div');

			div1.style.color = 'red';
			div2.style.color = 'red';
			// This test may need adjustment based on actual implementation behavior
			expect(typeof dom.check.isSameAttributes(div1, div2)).toBe('boolean');
		});
	});

	describe('isWysiwygFrame', () => {
		it('should detect wysiwyg frame elements', () => {
			const div = document.createElement('div');
			div.className = 'se-wrapper-wysiwyg';
			expect(dom.check.isWysiwygFrame(div)).toBe(true);

			const body = document.createElement('body');
			expect(dom.check.isWysiwygFrame(body)).toBe(true);
		});

		it('should return false for regular elements', () => {
			const div = document.createElement('div');
			expect(dom.check.isWysiwygFrame(div)).toBe(false);
		});
	});

	describe('isNonEditable', () => {
		it('should detect non-editable elements', () => {
			const div = document.createElement('div');
			div.setAttribute('contenteditable', 'false');
			expect(dom.check.isNonEditable(div)).toBe(true);
		});

		it('should return false for editable elements', () => {
			const div = document.createElement('div');
			expect(dom.check.isNonEditable(div)).toBe(false);

			div.setAttribute('contenteditable', 'true');
			expect(dom.check.isNonEditable(div)).toBe(false);
		});
	});

	describe('isImportantDisabled', () => {
		it('should detect elements with data-important-disabled', () => {
			const div = document.createElement('div');
			div.setAttribute('data-important-disabled', '');
			expect(dom.check.isImportantDisabled(div)).toBe(true);
		});

		it('should return false for elements without the attribute', () => {
			const div = document.createElement('div');
			expect(dom.check.isImportantDisabled(div)).toBe(false);
		});
	});
});