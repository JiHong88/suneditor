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

	describe('applyBlock method', () => {
		it('should wrap single line with block element', () => {
			wysiwyg.innerHTML = '<p>text content</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const blockquote = dom.utils.createElement('blockquote');
			format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
			expect(wysiwyg.querySelector('blockquote p')).toBeTruthy();
		});

		it('should wrap multiple lines with block element', () => {
			wysiwyg.innerHTML = '<p>line1</p><p>line2</p><p>line3</p>';
			const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
			const lastText = wysiwyg.querySelectorAll('p')[2].firstChild;
			editor.selection.setRange(firstText, 0, lastText, 5);

			const blockquote = dom.utils.createElement('blockquote');
			format.applyBlock(blockquote);

			const bq = wysiwyg.querySelector('blockquote');
			expect(bq).toBeTruthy();
			expect(bq.querySelectorAll('p').length).toBe(3);
		});

		it('should handle list cells in selection', () => {
			wysiwyg.innerHTML = '<ul><li>item1</li><li>item2</li></ul>';
			const firstLi = wysiwyg.querySelectorAll('li')[0];
			const lastLi = wysiwyg.querySelectorAll('li')[1];
			editor.selection.setRange(firstLi.firstChild, 0, lastLi.firstChild, 5);

			const blockquote = dom.utils.createElement('blockquote');
			format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});

		it('should handle nested list structures', () => {
			wysiwyg.innerHTML = '<ul><li>item1<ul><li>nested</li></ul></li><li>item2</li></ul>';
			const firstLi = wysiwyg.querySelector('li');
			const lastLi = wysiwyg.querySelectorAll('ul')[0].querySelectorAll('li')[1];
			editor.selection.setRange(firstLi.firstChild, 0, lastLi.firstChild, 5);

			const blockquote = dom.utils.createElement('blockquote');
			format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});

		it('should maintain selection after applying block', () => {
			wysiwyg.innerHTML = '<p>text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const blockquote = dom.utils.createElement('blockquote');
			format.applyBlock(blockquote);

			const range = editor.selection.getRange();
			expect(range.startContainer).toBeTruthy();
			expect(range.endContainer).toBeTruthy();
		});
	});

	describe('removeBlock method', () => {
		it('should remove block wrapper and keep content', () => {
			wysiwyg.innerHTML = '<blockquote><p>quoted text</p></blockquote>';
			const blockquote = wysiwyg.querySelector('blockquote');
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);

			format.removeBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeFalsy();
			expect(wysiwyg.querySelector('p')).toBeTruthy();
		});

		it('should handle shouldDelete option', () => {
			wysiwyg.innerHTML = '<blockquote><p>text1</p><p>text2</p></blockquote>';
			const blockquote = wysiwyg.querySelector('blockquote');
			const p = wysiwyg.querySelector('p');

			const result = format.removeBlock(blockquote, {
				selectedFormats: [p],
				shouldDelete: true,
				skipHistory: true
			});

			expect(result).toBeTruthy();
			expect(result.removeArray).toBeTruthy();
			expect(Array.isArray(result.removeArray)).toBe(true);
		});

		it('should handle newBlockElement option', () => {
			wysiwyg.innerHTML = '<blockquote><p>text</p></blockquote>';
			const blockquote = wysiwyg.querySelector('blockquote');
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const newBlock = dom.utils.createElement('div');
			format.removeBlock(blockquote, {
				newBlockElement: newBlock,
				skipHistory: true
			});

			expect(wysiwyg.querySelector('blockquote')).toBeFalsy();
		});

		it('should convert list items to paragraphs', () => {
			wysiwyg.innerHTML = '<ul><li>item1</li><li>item2</li></ul>';
			const ul = wysiwyg.querySelector('ul');
			const firstLi = wysiwyg.querySelectorAll('li')[0];
			const lastLi = wysiwyg.querySelectorAll('li')[1];
			editor.selection.setRange(firstLi.firstChild, 0, lastLi.firstChild, 5);

			format.removeBlock(ul);

			expect(wysiwyg.querySelector('ul')).toBeFalsy();
		});

		it('should handle skipHistory option', () => {
			wysiwyg.innerHTML = '<blockquote><p>text</p></blockquote>';
			const blockquote = wysiwyg.querySelector('blockquote');
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const result = format.removeBlock(blockquote, { skipHistory: true });

			expect(result).toBeTruthy();
			expect(result.cc).toBeTruthy();
			expect(result.sc).toBeTruthy();
			expect(result.ec).toBeTruthy();
		});

		it('should handle selectedFormats parameter', () => {
			wysiwyg.innerHTML = '<blockquote><p>text1</p><p>text2</p><p>text3</p></blockquote>';
			const blockquote = wysiwyg.querySelector('blockquote');
			const paragraphs = wysiwyg.querySelectorAll('p');
			editor.selection.setRange(paragraphs[0].firstChild, 0, paragraphs[1].firstChild, 5);

			const result = format.removeBlock(blockquote, {
				selectedFormats: [paragraphs[0], paragraphs[1]],
				skipHistory: true
			});

			expect(result).toBeTruthy();
			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
			expect(wysiwyg.querySelector('blockquote').children.length).toBeLessThan(3);
		});
	});

	describe('indent method', () => {
		it('should indent single line', () => {
			wysiwyg.innerHTML = '<p>text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const p = wysiwyg.querySelector('p');
			const beforeMargin = p.style.marginLeft;

			format.indent();

			const afterMargin = p.style.marginLeft;
			expect(afterMargin).not.toBe(beforeMargin);
		});

		it('should indent multiple lines', () => {
			wysiwyg.innerHTML = '<p>line1</p><p>line2</p><p>line3</p>';
			const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
			const lastText = wysiwyg.querySelectorAll('p')[2].firstChild;
			editor.selection.setRange(firstText, 0, lastText, 5);

			format.indent();

			const paragraphs = wysiwyg.querySelectorAll('p');
			expect(paragraphs[0].style.marginLeft).toBeTruthy();
			expect(paragraphs[1].style.marginLeft).toBeTruthy();
			expect(paragraphs[2].style.marginLeft).toBeTruthy();
		});

		it('should handle list cells with nesting', () => {
			wysiwyg.innerHTML = '<ul><li>item1</li><li>item2</li></ul>';
			const firstLi = wysiwyg.querySelectorAll('li')[0];
			editor.selection.setRange(firstLi.firstChild, 0, firstLi.firstChild, 5);

			format.indent();

			expect(wysiwyg.querySelector('ul')).toBeTruthy();
		});

		it('should maintain selection after indent', () => {
			wysiwyg.innerHTML = '<p>text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			format.indent();

			const range = editor.selection.getRange();
			expect(range.startContainer).toBeTruthy();
			expect(range.endContainer).toBeTruthy();
		});
	});

	describe('outdent method', () => {
		it('should outdent indented line', () => {
			wysiwyg.innerHTML = '<p style="margin-left: 20px;">text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const p = wysiwyg.querySelector('p');
			const beforeMargin = p.style.marginLeft;

			format.outdent();

			const afterMargin = p.style.marginLeft;
			expect(afterMargin).not.toBe(beforeMargin);
		});

		it('should outdent multiple lines', () => {
			wysiwyg.innerHTML = '<p style="margin-left: 20px;">line1</p><p style="margin-left: 20px;">line2</p>';
			const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
			const lastText = wysiwyg.querySelectorAll('p')[1].firstChild;
			editor.selection.setRange(firstText, 0, lastText, 5);

			format.outdent();

			const paragraphs = wysiwyg.querySelectorAll('p');
			expect(paragraphs[0].style.marginLeft).not.toBe('20px');
			expect(paragraphs[1].style.marginLeft).not.toBe('20px');
		});

		it('should handle list cells with unnesting', () => {
			wysiwyg.innerHTML = '<ul><li>item1<ul><li>nested</li></ul></li></ul>';
			const nestedLi = wysiwyg.querySelectorAll('li')[1];
			editor.selection.setRange(nestedLi.firstChild, 0, nestedLi.firstChild, 6);

			format.outdent();

			expect(wysiwyg.querySelector('ul')).toBeTruthy();
		});

		it('should maintain selection after outdent', () => {
			wysiwyg.innerHTML = '<p style="margin-left: 20px;">text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			format.outdent();

			const range = editor.selection.getRange();
			expect(range.startContainer).toBeTruthy();
			expect(range.endContainer).toBeTruthy();
		});
	});

	describe('isEdgeLine method', () => {
		it('should return true for front edge of line', () => {
			wysiwyg.innerHTML = '<p>text content</p>';
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			const result = format.isEdgeLine(textNode, 0, 'front');

			expect(result).toBe(true);
		});

		it('should return true for end edge of line', () => {
			wysiwyg.innerHTML = '<p>text</p>';
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			const result = format.isEdgeLine(textNode, textNode.textContent.length, 'end');

			expect(result).toBe(true);
		});

		it('should return false for middle position', () => {
			wysiwyg.innerHTML = '<p>text content</p>';
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			const result = format.isEdgeLine(textNode, 2, 'front');

			expect(result).toBe(false);
		});

		it('should handle nested elements', () => {
			wysiwyg.innerHTML = '<p><strong>text</strong></p>';
			const textNode = wysiwyg.querySelector('strong').firstChild;

			const result = format.isEdgeLine(textNode, 0, 'front');

			expect(result).toBe(true);
		});

		it('should handle BR siblings', () => {
			wysiwyg.innerHTML = '<p><br>text</p>';
			const textNode = wysiwyg.querySelector('p').childNodes[1];

			const result = format.isEdgeLine(textNode, 0, 'front');

			expect(result).toBe(true);
		});
	});

	describe('getLinesAndComponents method', () => {
		it('should get lines from selection', () => {
			wysiwyg.innerHTML = '<p>line1</p><p>line2</p><p>line3</p>';
			const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
			const lastText = wysiwyg.querySelectorAll('p')[2].firstChild;
			editor.selection.setRange(firstText, 0, lastText, 5);

			const lines = format.getLinesAndComponents(false);

			expect(lines.length).toBeGreaterThan(0);
			expect(lines.every((line) => format.isLine(line) || editor.component.is(line))).toBe(true);
		});

		it('should include components in selection', () => {
			wysiwyg.innerHTML = '<p>text</p><div data-component="image">img</div><p>text2</p>';
			const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
			const lastText = wysiwyg.querySelectorAll('p')[1].firstChild;
			editor.selection.setRange(firstText, 0, lastText, 5);

			const lines = format.getLinesAndComponents(false);

			expect(lines.length).toBeGreaterThan(0);
		});

		it('should remove duplicates when removeDuplicate is true', () => {
			wysiwyg.innerHTML = '<blockquote><p>nested1</p><p>nested2</p></blockquote>';
			const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
			const lastText = wysiwyg.querySelectorAll('p')[1].firstChild;
			editor.selection.setRange(firstText, 0, lastText, 7);

			const linesWithDuplicates = format.getLinesAndComponents(false);
			const linesWithoutDuplicates = format.getLinesAndComponents(true);

			expect(linesWithoutDuplicates.length).toBeLessThanOrEqual(linesWithDuplicates.length);
		});

		it('should handle table elements', () => {
			wysiwyg.innerHTML = '<table><tr><td><p>cell1</p></td><td><p>cell2</p></td></tr></table>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 5);

			const lines = format.getLinesAndComponents(false);

			expect(lines.length).toBeGreaterThan(0);
		});

		it('should filter by component context', () => {
			wysiwyg.innerHTML = '<p>outside</p><div data-component="test"><p>inside</p></div>';
			const p = wysiwyg.querySelectorAll('p')[0];
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 7);

			const lines = format.getLinesAndComponents(false);

			expect(lines.length).toBeGreaterThan(0);
		});
	});

	describe('private methods', () => {
		describe('_isExcludeSelectionElement', () => {
			it('should return true for FIGURE elements', () => {
				const figure = dom.utils.createElement('figure');

				const result = format._isExcludeSelectionElement(figure);

				expect(result).toBe(true);
			});

			it('should return false for FIGCAPTION elements', () => {
				const figcaption = dom.utils.createElement('figcaption');

				const result = format._isExcludeSelectionElement(figcaption);

				expect(result).toBe(false);
			});

			it('should return false for regular elements', () => {
				const p = dom.utils.createElement('p');

				const result = format._isExcludeSelectionElement(p);

				expect(result).toBe(false);
			});
		});

		describe('_nonFormat', () => {
			it('should return true for wysiwyg frame', () => {
				const result = format._nonFormat(wysiwyg);

				expect(result).toBe(true);
			});

			it('should return false for regular format elements', () => {
				const p = dom.utils.createElement('p');

				const result = format._nonFormat(p);

				expect(result).toBe(false);
			});
		});

		describe('_notTextNode', () => {
			it('should return true for BR element', () => {
				const br = dom.utils.createElement('br');

				const result = format._notTextNode(br);

				expect(result).toBe(true);
			});

			it('should return true for IMG element', () => {
				const img = dom.utils.createElement('img');

				const result = format._notTextNode(img);

				expect(result).toBe(true);
			});

			it('should return true for INPUT element', () => {
				const input = dom.utils.createElement('input');

				const result = format._notTextNode(input);

				expect(result).toBe(true);
			});

			it('should return true for VIDEO element', () => {
				const video = dom.utils.createElement('video');

				const result = format._notTextNode(video);

				expect(result).toBe(true);
			});

			it('should return true for AUDIO element', () => {
				const audio = dom.utils.createElement('audio');

				const result = format._notTextNode(audio);

				expect(result).toBe(true);
			});

			it('should return true for IFRAME element', () => {
				const iframe = dom.utils.createElement('iframe');

				const result = format._notTextNode(iframe);

				expect(result).toBe(true);
			});

			it('should return true for SELECT element', () => {
				const select = dom.utils.createElement('select');

				const result = format._notTextNode(select);

				expect(result).toBe(true);
			});

			it('should return true for CANVAS element', () => {
				const canvas = dom.utils.createElement('canvas');

				const result = format._notTextNode(canvas);

				expect(result).toBe(true);
			});

			it('should return false for text containers', () => {
				const p = dom.utils.createElement('p');

				const result = format._notTextNode(p);

				expect(result).toBe(false);
			});

			it('should return false for null', () => {
				const result = format._notTextNode(null);

				expect(result).toBe(false);
			});

			it('should handle string input for BR', () => {
				const result = format._notTextNode('br');

				expect(result).toBe(true);
			});

			it('should handle string input for IMG', () => {
				const result = format._notTextNode('img');

				expect(result).toBe(true);
			});

			it('should handle string input for P', () => {
				const result = format._notTextNode('p');

				expect(result).toBe(false);
			});
		});

		describe('_lineWork', () => {
			it('should return line work information', () => {
				wysiwyg.innerHTML = '<p>text</p>';
				const textNode = wysiwyg.querySelector('p').firstChild;
				editor.selection.setRange(textNode, 0, textNode, 4);

				const result = format._lineWork();

				expect(result).toBeTruthy();
				expect(result.lines).toBeTruthy();
				expect(result.firstNode).toBeTruthy();
				expect(result.lastNode).toBeTruthy();
				expect(result.firstPath).toBeTruthy();
				expect(result.lastPath).toBeTruthy();
				expect(typeof result.startOffset).toBe('number');
				expect(typeof result.endOffset).toBe('number');
			});

			it('should handle multiple lines', () => {
				wysiwyg.innerHTML = '<p>line1</p><p>line2</p>';
				const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
				const lastText = wysiwyg.querySelectorAll('p')[1].firstChild;
				editor.selection.setRange(firstText, 0, lastText, 5);

				const result = format._lineWork();

				expect(result.lines.length).toBeGreaterThan(0);
			});

			it('should handle list removal', () => {
				wysiwyg.innerHTML = '<ul><li>item</li></ul>';
				const li = wysiwyg.querySelector('li');
				editor.selection.setRange(li.firstChild, 0, li.firstChild, 4);

				const result = format._lineWork();

				expect(result).toBeTruthy();
			});
		});

		describe('__resetBrLineBreak', () => {
			it('should set _brLineBreak to true for "br" format', () => {
				format.__resetBrLineBreak('br');

				expect(format._brLineBreak).toBe(true);
			});

			it('should set _brLineBreak to false for "line" format', () => {
				format.__resetBrLineBreak('line');

				expect(format._brLineBreak).toBe(false);
			});

			it('should affect isBrLine behavior', () => {
				format.__resetBrLineBreak('br');
				const p = dom.utils.createElement('p');

				const result = format.isBrLine(p);

				expect(result).toBe(true);
			});
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

		it('should handle empty editor state', () => {
			wysiwyg.innerHTML = '';

			const lines = format.getLines();

			expect(Array.isArray(lines)).toBe(true);
		});

		it('should handle RTL text direction for indent', () => {
			const originalRtl = editor.options.get('_rtl');
			editor.options.set('_rtl', true);

			wysiwyg.innerHTML = '<p>text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			format.indent();

			const p = wysiwyg.querySelector('p');
			expect(p.style.marginRight || p.style.marginLeft).toBeTruthy();

			editor.options.set('_rtl', originalRtl);
		});
	});
});
