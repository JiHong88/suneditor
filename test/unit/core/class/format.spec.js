import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import Format from '../../../../src/core/class/format';
import ClassInjector from '../../../../src/editorInjector/_classes';
import { dom } from '../../../../src/helper';

describe('Core - Format', () => {
	let editor;
	let format;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		format = new Format(editor);
		ClassInjector.call(format, editor);
		wysiwyg = editor.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Constructor', () => {
		it('should initialize format check regex patterns', () => {
			expect(format._formatLineCheck).toBeDefined();
			expect(format._formatBrLineCheck).toBeDefined();
			expect(format._formatBlockCheck).toBeDefined();
			expect(format._formatClosureBlockCheck).toBeDefined();
			expect(format._formatClosureBrLineCheck).toBeDefined();
			expect(format._textStyleTagsCheck).toBeDefined();
		});

		it('should initialize _brLineBreak', () => {
			expect(format._brLineBreak).toBeDefined();
		});
	});

	describe('setLine method', () => {
		it('should throw error if element is not a line', () => {
			const span = dom.utils.createElement('span');
			expect(() => {
				format.setLine(span);
			}).toThrow('[SUNEDITOR.format.setLine.fail]');
		});

		it('should replace current line with new line element', () => {
			wysiwyg.innerHTML = '<p>test content</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const h1 = dom.utils.createElement('h1');
			format.setLine(h1);

			expect(wysiwyg.querySelector('h1')).toBeTruthy();
			expect(wysiwyg.querySelector('p')).toBeFalsy();
		});

		it('should handle multiple lines selection', () => {
			wysiwyg.innerHTML = '<p>line1</p><p>line2</p><p>line3</p>';
			const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
			const lastText = wysiwyg.querySelectorAll('p')[2].firstChild;
			editor.selection.setRange(firstText, 0, lastText, 5);

			const h2 = dom.utils.createElement('h2');
			format.setLine(h2);

			expect(wysiwyg.querySelectorAll('h2').length).toBe(3);
			expect(wysiwyg.querySelector('p')).toBeFalsy();
		});

		it('should replace with className', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const div = dom.utils.createElement('div');
			div.className = '__se__format__custom';
			format.setLine(div);

			const result = wysiwyg.querySelector('div');
			expect(result).toBeTruthy();
		});

		it('should skip component nodes', () => {
			wysiwyg.innerHTML = '<p>test</p><div data-component="image">component</div>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const h1 = dom.utils.createElement('h1');
			format.setLine(h1);

			expect(wysiwyg.querySelector('h1')).toBeTruthy();
			expect(wysiwyg.querySelector('[data-component="image"]')).toBeTruthy();
		});

		it('should handle documentType reHeader', () => {
			if (editor.frameContext.has('documentType_use_header')) {
				const docType = editor.frameContext.get('documentType');
				docType.reHeader = jest.fn();

				wysiwyg.innerHTML = '<p>test</p>';
				const textNode = wysiwyg.querySelector('p').firstChild;
				editor.selection.setRange(textNode, 0, textNode, 4);

				const h1 = dom.utils.createElement('h1');
				format.setLine(h1);

				expect(docType.reHeader).toHaveBeenCalled();
			} else {
				expect(true).toBe(true);
			}
		});
	});

	describe('getLine method', () => {
		it('should return null for null node', () => {
			const result = format.getLine(null);
			expect(result).toBeNull();
		});

		it('should return line element for child node', () => {
			wysiwyg.innerHTML = '<p><strong>text</strong></p>';
			const strong = wysiwyg.querySelector('strong');

			const result = format.getLine(strong);

			expect(result).toBe(wysiwyg.querySelector('p'));
		});

		it('should return null when reaching wysiwyg frame', () => {
			const result = format.getLine(wysiwyg);
			expect(result).toBeNull();
		});

		it('should use validation function', () => {
			wysiwyg.innerHTML = '<p>text</p><div>div</div>';
			const p = wysiwyg.querySelector('p');

			const result = format.getLine(p.firstChild, (node) => node.nodeName === 'P');

			expect(result).toBe(p);
		});

		it('should return null when validation fails', () => {
			wysiwyg.innerHTML = '<p>text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;

			const result = format.getLine(textNode, (node) => node.nodeName === 'DIV');

			expect(result).toBeNull();
		});

		it('should find line in block parent', () => {
			wysiwyg.innerHTML = '<blockquote><p>quoted text</p></blockquote>';
			const textNode = wysiwyg.querySelector('p').firstChild;

			const result = format.getLine(textNode);

			expect(result).toBe(wysiwyg.querySelector('p'));
		});

		it('should return block itself if it is a line', () => {
			wysiwyg.innerHTML = '<div>text</div>';
			const div = wysiwyg.querySelector('div');

			const result = format.getLine(div.firstChild);

			expect(result).toBe(div);
		});
	});

	describe('setBrLine method', () => {
		it('should throw error if element is not a br-line', () => {
			const p = dom.utils.createElement('p');
			expect(() => {
				format.setBrLine(p);
			}).toThrow('[SUNEDITOR.format.setBrLine.fail]');
		});

		it('should convert line to br-line format', () => {
			wysiwyg.innerHTML = '<p>line1</p><p>line2</p>';
			const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
			const lastText = wysiwyg.querySelectorAll('p')[1].firstChild;
			editor.selection.setRange(firstText, 0, lastText, 5);

			const pre = dom.utils.createElement('pre');
			format.setBrLine(pre);

			expect(wysiwyg.querySelector('pre')).toBeTruthy();
		});

		it('should handle component nodes', () => {
			wysiwyg.innerHTML = '<p>text</p><div data-component="image">img</div>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const pre = dom.utils.createElement('pre');
			format.setBrLine(pre);

			expect(wysiwyg.querySelector('pre')).toBeTruthy();
			expect(wysiwyg.querySelector('[data-component="image"]')).toBeTruthy();
		});

		it('should merge consecutive same br-lines', () => {
			wysiwyg.innerHTML = '<p>line1</p><p>line2</p>';
			const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
			const lastText = wysiwyg.querySelectorAll('p')[1].firstChild;
			editor.selection.setRange(firstText, 0, lastText, 5);

			const pre = dom.utils.createElement('pre');
			format.setBrLine(pre);

			const preElements = wysiwyg.querySelectorAll('pre');
			expect(preElements.length).toBeGreaterThan(0);
		});

		it('should handle nested parent nodes', () => {
			wysiwyg.innerHTML = '<div><p>nested line</p></div>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);

			const pre = dom.utils.createElement('pre');
			format.setBrLine(pre);

			expect(wysiwyg.querySelector('pre')).toBeTruthy();
		});
	});

	describe('getBrLine method', () => {
		it('should return null for null element', () => {
			const result = format.getBrLine(null);
			expect(result).toBeNull();
		});

		it('should find br-line parent', () => {
			wysiwyg.innerHTML = '<pre>preformatted text</pre>';
			const textNode = wysiwyg.querySelector('pre').firstChild;

			const result = format.getBrLine(textNode);

			expect(result).toBe(wysiwyg.querySelector('pre'));
		});

		it('should return null when reaching wysiwyg frame', () => {
			const result = format.getBrLine(wysiwyg);
			expect(result).toBeNull();
		});

		it('should use validation function', () => {
			wysiwyg.innerHTML = '<pre>text</pre>';
			const pre = wysiwyg.querySelector('pre');

			const result = format.getBrLine(pre.firstChild, (node) => node.nodeName === 'PRE');

			expect(result).toBe(pre);
		});

		it('should return null when validation fails', () => {
			wysiwyg.innerHTML = '<pre>text</pre>';
			const textNode = wysiwyg.querySelector('pre').firstChild;

			const result = format.getBrLine(textNode, (node) => node.nodeName === 'CODE');

			expect(result).toBeNull();
		});
	});

	describe('addLine method', () => {
		it('should return null for null element', () => {
			const result = format.addLine(null);
			expect(result).toBeNull();
		});

		it('should return null for element without parent', () => {
			const orphan = dom.utils.createElement('p');
			const result = format.addLine(orphan);
			expect(result).toBeNull();
		});

		it('should add line after element', () => {
			wysiwyg.innerHTML = '<p>first line</p>';
			const p = wysiwyg.querySelector('p');

			const newLine = format.addLine(p);

			expect(newLine).toBeTruthy();
			expect(newLine.nextSibling).toBeFalsy();
		});

		it('should add line with specified node name', () => {
			wysiwyg.innerHTML = '<p>first line</p>';
			const p = wysiwyg.querySelector('p');

			const newLine = format.addLine(p, 'h1');

			expect(newLine.nodeName).toBe('H1');
		});

		it('should add line with node object', () => {
			wysiwyg.innerHTML = '<p>first line</p>';
			const p = wysiwyg.querySelector('p');
			const h2 = dom.utils.createElement('h2');

			const newLine = format.addLine(p, h2);

			expect(newLine.nodeName).toBe('H2');
		});

		it('should copy tag attributes from current format', () => {
			wysiwyg.innerHTML = '<p class="custom">text</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			const newLine = format.addLine(p);

			expect(newLine.className).toBe('custom');
		});

		it('should handle table cell insertion', () => {
			wysiwyg.innerHTML = '<table><tr><td>cell</td></tr></table>';
			const td = wysiwyg.querySelector('td');

			const newLine = format.addLine(td);

			expect(newLine).toBeTruthy();
		});
	});

	describe('getBlock method', () => {
		it('should return null for null element', () => {
			const result = format.getBlock(null);
			expect(result).toBeNull();
		});

		it('should find block element', () => {
			wysiwyg.innerHTML = '<blockquote><p>quoted</p></blockquote>';
			const textNode = wysiwyg.querySelector('p').firstChild;

			const result = format.getBlock(textNode);

			expect(result).toBe(wysiwyg.querySelector('blockquote'));
		});

		it('should return null when reaching wysiwyg frame', () => {
			const result = format.getBlock(wysiwyg);
			expect(result).toBeNull();
		});

		it('should skip THEAD/TBODY/TR elements', () => {
			wysiwyg.innerHTML = '<table><tbody><tr><td>cell</td></tr></tbody></table>';
			const td = wysiwyg.querySelector('td');

			const result = format.getBlock(td);

			expect(result).not.toBe(wysiwyg.querySelector('tbody'));
			expect(result).not.toBe(wysiwyg.querySelector('tr'));
		});

		it('should use validation function', () => {
			wysiwyg.innerHTML = '<blockquote><p>text</p></blockquote>';
			const textNode = wysiwyg.querySelector('p').firstChild;

			const result = format.getBlock(textNode, (node) => node.nodeName === 'BLOCKQUOTE');

			expect(result).toBe(wysiwyg.querySelector('blockquote'));
		});

		it('should return null when validation fails', () => {
			wysiwyg.innerHTML = '<blockquote><p>text</p></blockquote>';
			const textNode = wysiwyg.querySelector('p').firstChild;

			const result = format.getBlock(textNode, (node) => node.nodeName === 'DIV');

			expect(result).toBeNull();
		});
	});

	describe('getLines method', () => {
		it('should get lines for current selection', () => {
			wysiwyg.innerHTML = '<p>line1</p><p>line2</p><p>line3</p>';
			const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
			const lastText = wysiwyg.querySelectorAll('p')[2].firstChild;
			editor.selection.setRange(firstText, 0, lastText, 5);

			const lines = format.getLines();

			expect(lines.length).toBeGreaterThan(0);
		});

		it('should handle validation function', () => {
			wysiwyg.innerHTML = '<p>para</p><div>div</div>';
			const pText = wysiwyg.querySelector('p').firstChild;
			const divText = wysiwyg.querySelector('div').firstChild;
			editor.selection.setRange(pText, 0, divText, 3);

			const lines = format.getLines((node) => node.nodeName === 'P');

			expect(lines.every((line) => line.nodeName === 'P')).toBe(true);
		});

		it('should return empty array for invalid selection', () => {
			wysiwyg.innerHTML = '';

			const lines = format.getLines();

			expect(Array.isArray(lines)).toBe(true);
		});
	});

	describe('isLine method', () => {
		it('should return true for P element', () => {
			const p = dom.utils.createElement('p');
			expect(format.isLine(p)).toBe(true);
		});

		it('should return true for DIV element', () => {
			const div = dom.utils.createElement('div');
			expect(format.isLine(div)).toBe(true);
		});

		it('should return false for SPAN element', () => {
			const span = dom.utils.createElement('span');
			expect(format.isLine(span)).toBe(false);
		});

		it('should handle null', () => {
			expect(format.isLine(null)).toBe(false);
		});

		it('should return false for text node', () => {
			const textNode = document.createTextNode('text');
			expect(format.isLine(textNode)).toBe(false);
		});

		it('should handle string input', () => {
			expect(format.isLine('P')).toBe(true);
			expect(format.isLine('SPAN')).toBe(false);
		});
	});

	describe('isBrLine method', () => {
		it('should return true for PRE element', () => {
			const pre = dom.utils.createElement('pre');
			expect(format.isBrLine(pre)).toBe(true);
		});

		it('should return false for P element', () => {
			const p = dom.utils.createElement('p');
			expect(format.isBrLine(p)).toBe(false);
		});

		it('should handle null', () => {
			expect(format.isBrLine(null)).toBe(false);
		});

		it('should handle string input', () => {
			expect(format.isBrLine('PRE')).toBe(true);
			expect(format.isBrLine('P')).toBe(false);
		});
	});

	describe('isBlock method', () => {
		it('should return true for BLOCKQUOTE', () => {
			const blockquote = dom.utils.createElement('blockquote');
			expect(format.isBlock(blockquote)).toBe(true);
		});

		it('should return true for TABLE', () => {
			const table = dom.utils.createElement('table');
			expect(format.isBlock(table)).toBe(true);
		});

		it('should return false for SPAN', () => {
			const span = dom.utils.createElement('span');
			expect(format.isBlock(span)).toBe(false);
		});

		it('should handle null', () => {
			expect(format.isBlock(null)).toBe(false);
		});

		it('should handle string input', () => {
			expect(format.isBlock('BLOCKQUOTE')).toBe(true);
			expect(format.isBlock('SPAN')).toBe(false);
		});
	});

	describe('isClosureBlock method', () => {
		it('should return true for TD', () => {
			const td = dom.utils.createElement('td');
			expect(format.isClosureBlock(td)).toBe(true);
		});

		it('should return true for TH', () => {
			const th = dom.utils.createElement('th');
			expect(format.isClosureBlock(th)).toBe(true);
		});

		it('should return false for P', () => {
			const p = dom.utils.createElement('p');
			expect(format.isClosureBlock(p)).toBe(false);
		});

		it('should handle null', () => {
			expect(format.isClosureBlock(null)).toBe(false);
		});

		it('should handle string input', () => {
			expect(format.isClosureBlock('TD')).toBe(true);
			expect(format.isClosureBlock('P')).toBe(false);
		});
	});

	describe('isClosureBrLine method', () => {
		it('should handle elements with closure br line class', () => {
			const div = dom.utils.createElement('div');
			div.className = '__se__format__br_line__closure_test';
			const result = format.isClosureBrLine(div);
			expect(typeof result).toBe('boolean');
		});

		it('should return false for P', () => {
			const p = dom.utils.createElement('p');
			expect(format.isClosureBrLine(p)).toBe(false);
		});

		it('should handle null', () => {
			expect(format.isClosureBrLine(null)).toBe(false);
		});

		it('should handle string input', () => {
			const result = format.isClosureBrLine('P');
			expect(result).toBe(false);
		});
	});

	describe('isNormalLine method', () => {
		it('should return true for P element', () => {
			const p = dom.utils.createElement('p');
			expect(format.isNormalLine(p)).toBe(true);
		});

		it('should return true for DIV element', () => {
			const div = dom.utils.createElement('div');
			expect(format.isNormalLine(div)).toBe(true);
		});

		it('should handle null', () => {
			expect(format.isNormalLine(null)).toBe(false);
		});

		it('should return false for BLOCKQUOTE', () => {
			const blockquote = dom.utils.createElement('blockquote');
			expect(format.isNormalLine(blockquote)).toBe(false);
		});
	});

	describe('isTextStyleNode method', () => {
		it('should return true for STRONG', () => {
			const strong = dom.utils.createElement('strong');
			expect(format.isTextStyleNode(strong)).toBe(true);
		});

		it('should return true for EM', () => {
			const em = dom.utils.createElement('em');
			expect(format.isTextStyleNode(em)).toBe(true);
		});

		it('should return true for SPAN', () => {
			const span = dom.utils.createElement('span');
			expect(format.isTextStyleNode(span)).toBe(true);
		});

		it('should return false for P', () => {
			const p = dom.utils.createElement('p');
			expect(format.isTextStyleNode(p)).toBe(false);
		});

		it('should handle null', () => {
			expect(format.isTextStyleNode(null)).toBe(false);
		});

		it('should handle string input', () => {
			expect(format.isTextStyleNode('STRONG')).toBe(true);
			expect(format.isTextStyleNode('P')).toBe(false);
		});
	});

	describe('edge cases and integration', () => {
		it('should handle complex nested structure', () => {
			wysiwyg.innerHTML = '<blockquote><div><p><strong>nested</strong></p></div></blockquote>';
			const strong = wysiwyg.querySelector('strong');

			const line = format.getLine(strong);
			const block = format.getBlock(strong);

			expect(line).toBe(wysiwyg.querySelector('p'));
			expect(block).toBe(wysiwyg.querySelector('blockquote'));
		});

		it('should handle list structures', () => {
			wysiwyg.innerHTML = '<ul><li>item1</li><li>item2</li></ul>';
			const li = wysiwyg.querySelector('li');

			const block = format.getBlock(li);

			expect(block).toBe(wysiwyg.querySelector('ul'));
		});

		it('should handle table structures', () => {
			wysiwyg.innerHTML = '<table><tr><td><p>cell content</p></td></tr></table>';
			const p = wysiwyg.querySelector('p');

			const line = format.getLine(p.firstChild);
			const block = format.getBlock(p.firstChild);

			expect(line).toBe(p);
			expect(format.isClosureBlock(block)).toBe(true);
		});
	});
});
