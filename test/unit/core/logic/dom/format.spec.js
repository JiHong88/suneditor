/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import Format from '../../../../../src/core/logic/dom/format';
import { dom } from '../../../../../src/helper';

describe('Core Logic - Format', () => {
	let kernel;
	let format;
	let wysiwyg;

	beforeEach(() => {
		kernel = createMockEditor();
		format = new Format(kernel);
		wysiwyg = kernel.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		// Mock cleanup - no special teardown needed
		jest.clearAllMocks();
	});

	describe('isLine', () => {
		it('should return true for P element', () => {
			const p = dom.utils.createElement('p');
			expect(format.isLine(p)).toBe(true);
		});

		it('should return true for DIV element', () => {
			const div = dom.utils.createElement('div');
			expect(format.isLine(div)).toBe(true);
		});

		it('should return true for heading elements', () => {
			expect(format.isLine(dom.utils.createElement('h1'))).toBe(true);
			expect(format.isLine(dom.utils.createElement('h2'))).toBe(true);
			expect(format.isLine(dom.utils.createElement('h6'))).toBe(true);
		});

		it('should return true for LI element', () => {
			const li = dom.utils.createElement('li');
			expect(format.isLine(li)).toBe(true);
		});

		it('should return false for non-line elements', () => {
			const span = dom.utils.createElement('span');
			expect(format.isLine(span)).toBe(false);
		});

		it('should handle string tag names', () => {
			expect(format.isLine('P')).toBe(true);
			expect(format.isLine('p')).toBe(true);
			expect(format.isLine('SPAN')).toBe(false);
		});
	});

	describe('isBrLine', () => {
		it('should return true for PRE element', () => {
			const pre = dom.utils.createElement('pre');
			expect(format.isBrLine(pre)).toBeTruthy();
		});

		it('should return false for P element', () => {
			const p = dom.utils.createElement('p');
			expect(format.isBrLine(p)).toBe(false);
		});
	});

	describe('isBlock', () => {
		it('should return true for BLOCKQUOTE', () => {
			const bq = dom.utils.createElement('blockquote');
			expect(format.isBlock(bq)).toBe(true);
		});

		it('should return true for UL and OL', () => {
			expect(format.isBlock(dom.utils.createElement('ul'))).toBe(true);
			expect(format.isBlock(dom.utils.createElement('ol'))).toBe(true);
		});

		it('should return true for DL element', () => {
			const dl = dom.utils.createElement('dl');
			expect(format.isBlock(dl)).toBe(true);
		});

		it('should return false for non-block elements', () => {
			expect(format.isBlock(dom.utils.createElement('p'))).toBe(false);
			expect(format.isBlock(dom.utils.createElement('span'))).toBe(false);
		});
	});

	describe('isNormalLine', () => {
		it('should return true for normal P element', () => {
			const p = dom.utils.createElement('p');
			expect(format.isNormalLine(p)).toBe(true);
		});

		it('should return false for PRE element', () => {
			const pre = dom.utils.createElement('pre');
			expect(format.isNormalLine(pre)).toBeFalsy();
		});
	});

	describe('isClosureBlock', () => {
		it('should return true for TH and TD', () => {
			expect(format.isClosureBlock(dom.utils.createElement('td'))).toBe(true);
			expect(format.isClosureBlock(dom.utils.createElement('th'))).toBe(true);
		});

		it('should return false for other elements', () => {
			expect(format.isClosureBlock(dom.utils.createElement('p'))).toBe(false);
		});
	});

	describe('isTextStyleNode', () => {
		it('should return true for text style elements', () => {
			expect(format.isTextStyleNode('STRONG')).toBe(true);
			expect(format.isTextStyleNode('EM')).toBe(true);
			expect(format.isTextStyleNode('B')).toBe(true);
		});

		it('should return false for block elements', () => {
			expect(format.isTextStyleNode('P')).toBe(false);
			expect(format.isTextStyleNode('DIV')).toBe(false);
		});
	});

	describe('getLine', () => {
		it('should return null for null node', () => {
			const result = format.getLine(null);
			expect(result).toBeNull();
		});

		it('should return line element for text node', () => {
			wysiwyg.innerHTML = '<p>test content</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			const line = format.getLine(textNode);
			expect(line).toBeTruthy();
			expect(line.tagName.toLowerCase()).toBe('p');
		});

		it('should return line element itself if it is a line', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.querySelector('p');
			const line = format.getLine(p);
			expect(line).toBe(p);
		});

		it('should find parent line element', () => {
			wysiwyg.innerHTML = '<p><span>test</span></p>';
			const span = wysiwyg.querySelector('span');
			const line = format.getLine(span);
			expect(line.tagName.toLowerCase()).toBe('p');
		});
	});

	describe('getBlock', () => {
		it('should return null for null element', () => {
			const result = format.getBlock(null);
			expect(result).toBeNull();
		});

		it('should return block element', () => {
			wysiwyg.innerHTML = '<blockquote><p>test</p></blockquote>';
			const p = wysiwyg.querySelector('p');
			const block = format.getBlock(p);
			expect(block).toBeTruthy();
			expect(block.tagName.toLowerCase()).toBe('blockquote');
		});
	});

	describe('getBrLine', () => {
		it('should return null for null element', () => {
			const result = format.getBrLine(null);
			expect(result).toBeNull();
		});

		it('should find PRE element', () => {
			wysiwyg.innerHTML = '<pre>code</pre>';
			const preEl = wysiwyg.querySelector('pre');
			const brLine = format.getBrLine(preEl);
			expect(brLine).toBeTruthy();
		});
	});

	describe('addLine', () => {
		it('should return null for null element', () => {
			const result = format.addLine(null);
			expect(result).toBeNull();
		});
	});

	describe('setLine', () => {
		it('should throw error if element is not a line', () => {
			const span = dom.utils.createElement('span');
			expect(() => {
				format.setLine(span);
			}).toThrow();
		});
	});

	describe('setBrLine', () => {
		it('should throw error if element is not a brLine', () => {
			const p = dom.utils.createElement('p');
			expect(() => {
				format.setBrLine(p);
			}).toThrow();
		});
	});

	describe('isEdgeLine', () => {
		it('should detect edge of line', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			const isEdge = format.isEdgeLine(textNode, 0, 'front');
			expect(typeof isEdge).toBe('boolean');
		});
	});

	describe('_isNotTextNode', () => {
		it('should return false for text nodes', () => {
			const textNode = document.createTextNode('text');
			expect(format._isNotTextNode(textNode)).toBe(false);
		});

		it('should return true for element nodes', () => {
			const el = dom.utils.createElement('span');
			expect(typeof format._isNotTextNode(el)).toBe('boolean');
		});

		it('should return true for break elements', () => {
			expect(format._isNotTextNode('BR')).toBe(true);
			expect(format._isNotTextNode('IMG')).toBe(true);
		});
	});
});
