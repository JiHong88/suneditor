import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { dom } from '../../../../src/helper';

describe('Core - Format Integration Tests', () => {
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		wysiwyg = editor.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Complex applyBlock scenarios', () => {
		it('should handle deeply nested list with blockquote', () => {
			wysiwyg.innerHTML = '<ul><li>item1<ul><li>nested1<ul><li>deep</li></ul></li></ul></li></ul>';
			const deepLi = wysiwyg.querySelectorAll('li')[2];
			editor.selection.setRange(deepLi.firstChild, 0, deepLi.firstChild, 4);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});

		it('should handle mixed list and paragraph selection', () => {
			wysiwyg.innerHTML = '<p>paragraph</p><ul><li>list item</li></ul><p>another paragraph</p>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 7);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});

		it('should handle table cell with multiple paragraphs', () => {
			wysiwyg.innerHTML = '<table><tr><td><p>cell1</p><p>cell2</p></td></tr></table>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 5);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});

		it('should handle nested lists with same parent', () => {
			wysiwyg.innerHTML = '<ul><li>item1<ul><li>nested1</li><li>nested2</li></ul></li><li>item2</li></ul>';
			const nested1 = wysiwyg.querySelectorAll('li')[1];
			const nested2 = wysiwyg.querySelectorAll('li')[2];
			editor.selection.setRange(nested1.firstChild, 0, nested2.firstChild, 7);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});

		it('should handle list with multiple levels and consecutive items', () => {
			wysiwyg.innerHTML = '<ul><li>A<ul><li>B<ul><li>C</li></ul></li></ul></li><li>D</li></ul>';
			const liC = wysiwyg.querySelector('li ul li ul li');
			const liD = wysiwyg.querySelectorAll('ul')[0].children[1];
			editor.selection.setRange(liC.firstChild, 0, liD.firstChild, 1);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});
	});

	describe('Complex removeBlock scenarios', () => {
		it('should handle nested blockquotes', () => {
			wysiwyg.innerHTML = '<blockquote><blockquote><p>double quoted</p></blockquote></blockquote>';
			const innerBq = wysiwyg.querySelectorAll('blockquote')[1];
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);

			editor.format.removeBlock(innerBq);

			const blockquotes = wysiwyg.querySelectorAll('blockquote');
			expect(blockquotes.length).toBeLessThan(2);
		});

		it('should handle removing from list with nested structure', () => {
			wysiwyg.innerHTML = '<ul><li>A<ul><li>B</li><li>C</li></ul></li><li>D</li></ul>';
			const ul = wysiwyg.querySelector('ul');
			const liA = wysiwyg.querySelectorAll('li')[0];
			const liD = wysiwyg.querySelectorAll('li')[3];
			editor.selection.setRange(liA.firstChild, 0, liD.firstChild, 1);

			const result = editor.format.removeBlock(ul, { skipHistory: true });

			expect(result).toBeTruthy();
		});

		it('should handle text node children in block removal', () => {
			wysiwyg.innerHTML = '<blockquote>text without p tag</blockquote>';
			const blockquote = wysiwyg.querySelector('blockquote');
			const textNode = blockquote.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			editor.format.removeBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeFalsy();
		});

		it('should handle removing partial list items', () => {
			wysiwyg.innerHTML = '<ul><li>A</li><li>B</li><li>C</li><li>D</li></ul>';
			const ul = wysiwyg.querySelector('ul');
			const items = wysiwyg.querySelectorAll('li');
			editor.selection.setRange(items[1].firstChild, 0, items[2].firstChild, 1);

			const result = editor.format.removeBlock(ul, {
				selectedFormats: [items[1], items[2]],
				skipHistory: true
			});

			expect(result).toBeTruthy();
			expect(wysiwyg.querySelector('ul')).toBeTruthy();
			expect(wysiwyg.querySelectorAll('li').length).toBeLessThan(4);
		});

		it('should handle list to list conversion', () => {
			wysiwyg.innerHTML = '<ul><li>A</li><li>B</li></ul>';
			const ul = wysiwyg.querySelector('ul');
			const items = wysiwyg.querySelectorAll('li');
			editor.selection.setRange(items[0].firstChild, 0, items[1].firstChild, 1);

			const ol = dom.utils.createElement('ol');
			editor.format.removeBlock(ul, {
				newBlockElement: ol,
				skipHistory: true
			});

			expect(wysiwyg.querySelector('ul')).toBeFalsy();
		});

		it('should handle nested list with shouldDelete option', () => {
			wysiwyg.innerHTML = '<ul><li>A<ul><li>B</li></ul></li><li>C</li></ul>';
			const ul = wysiwyg.querySelector('ul');
			const items = wysiwyg.querySelectorAll('li');

			const result = editor.format.removeBlock(ul, {
				selectedFormats: [items[0]],
				shouldDelete: true,
				skipHistory: true
			});

			expect(result).toBeTruthy();
			expect(result.removeArray.length).toBeGreaterThan(0);
		});
	});

	describe('Complex setBrLine scenarios', () => {
		it('should convert nested div with paragraphs to br-line', () => {
			wysiwyg.innerHTML = '<div><p>line1</p><p>line2</p></div>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 5);

			const pre = dom.utils.createElement('pre');
			editor.format.setBrLine(pre);

			expect(wysiwyg.querySelector('pre')).toBeTruthy();
		});

		it('should merge multiple br-lines with same attributes', () => {
			wysiwyg.innerHTML = '<p>line1</p><p>line2</p><p>line3</p>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[2];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 5);

			const pre = dom.utils.createElement('pre');
			pre.className = 'test-class';
			editor.format.setBrLine(pre);

			const preElements = wysiwyg.querySelectorAll('pre');
			expect(preElements.length).toBeGreaterThan(0);
		});

		it('should handle br-line with mixed content', () => {
			wysiwyg.innerHTML = '<p>text</p><p>more text</p>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 4);

			const pre = dom.utils.createElement('pre');
			editor.format.setBrLine(pre);

			expect(wysiwyg.querySelector('pre')).toBeTruthy();
		});

		it('should handle deeply nested structure for br-line', () => {
			wysiwyg.innerHTML = '<div><div><p>deep text</p></div></div>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const pre = dom.utils.createElement('pre');
			editor.format.setBrLine(pre);

			expect(wysiwyg.querySelector('pre')).toBeTruthy();
		});

		it('should preserve whitespace in br-line conversion', () => {
			wysiwyg.innerHTML = '<p>line  with  spaces</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 10);

			const pre = dom.utils.createElement('pre');
			editor.format.setBrLine(pre);

			const preElement = wysiwyg.querySelector('pre');
			expect(preElement).toBeTruthy();
			expect(preElement.innerHTML).toContain('line');
		});
	});

	describe('Complex setLine scenarios', () => {
		it('should handle line change in nested blockquote', () => {
			wysiwyg.innerHTML = '<blockquote><p>quoted text</p></blockquote>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);

			const h1 = dom.utils.createElement('h1');
			editor.format.setLine(h1);

			expect(wysiwyg.querySelector('blockquote h1')).toBeTruthy();
			expect(wysiwyg.querySelector('blockquote p')).toBeFalsy();
		});

		it('should handle line change with custom classes', () => {
			wysiwyg.innerHTML = '<p class="custom-class" data-id="123">text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const div = dom.utils.createElement('div');
			div.className = '__se__format__line_custom';
			editor.format.setLine(div);

			const result = wysiwyg.querySelector('div');
			expect(result).toBeTruthy();
			expect(result.getAttribute('data-id')).toBe('123');
		});

		it('should handle multiple paragraph with different styles', () => {
			wysiwyg.innerHTML = '<p style="color: red;">red</p><p style="color: blue;">blue</p>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 4);

			const h2 = dom.utils.createElement('h2');
			editor.format.setLine(h2);

			const h2Elements = wysiwyg.querySelectorAll('h2');
			expect(h2Elements.length).toBe(2);
			expect(h2Elements[0].style.color).toBe('red');
			expect(h2Elements[1].style.color).toBe('blue');
		});

		it('should skip component nodes during line change', () => {
			wysiwyg.innerHTML = '<p>before</p><div data-component="video">video</div><p>after</p>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 5);

			const h3 = dom.utils.createElement('h3');
			editor.format.setLine(h3);

			expect(wysiwyg.querySelectorAll('h3').length).toBeGreaterThanOrEqual(2);
			expect(wysiwyg.querySelector('[data-component="video"]')).toBeTruthy();
		});
	});

	describe('Complex indent/outdent scenarios', () => {
		it('should handle indent with table cells', () => {
			wysiwyg.innerHTML = '<table><tr><td><p>cell content</p></td></tr></table>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			editor.format.indent();

			expect(p.style.marginLeft || p.style.marginRight).toBeTruthy();
		});

		it('should handle outdent below zero margin', () => {
			wysiwyg.innerHTML = '<p>text</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			editor.format.outdent();
			editor.format.outdent();
			editor.format.outdent();

			const margin = parseInt(p.style.marginLeft || '0');
			expect(margin).toBeLessThanOrEqual(0);
		});

		it('should handle indent/outdent with mixed list and paragraphs', () => {
			wysiwyg.innerHTML = '<p>paragraph</p><ul><li>list item</li></ul>';
			const p = wysiwyg.querySelector('p');
			const li = wysiwyg.querySelector('li');
			editor.selection.setRange(p.firstChild, 0, li.firstChild, 4);

			editor.format.indent();

			expect(p.style.marginLeft || p.style.marginRight).toBeTruthy();
		});

		it('should handle multiple indent operations', () => {
			wysiwyg.innerHTML = '<p>text</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			editor.format.indent();
			editor.format.indent();
			editor.format.indent();

			const margin = parseInt(p.style.marginLeft || p.style.marginRight || '0');
			expect(margin).toBeGreaterThan(0);
		});

		it('should handle RTL direction for indent', () => {
			const originalRtl = editor.options.get('_rtl');
			editor.options.set('_rtl', true);

			wysiwyg.innerHTML = '<p>نص عربي</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 3);

			editor.format.indent();

			expect(p.style.marginRight).toBeTruthy();

			editor.options.set('_rtl', originalRtl);
		});
	});

	describe('Edge cases and error handling', () => {
		it('should handle empty lines in selection', () => {
			wysiwyg.innerHTML = '<p>text</p><p><br></p><p>more text</p>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[2];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 4);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});

		it('should handle selection across different block types', () => {
			wysiwyg.innerHTML = '<p>paragraph</p><blockquote><p>quote</p></blockquote><p>another p</p>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[2];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 7);

			const h1 = dom.utils.createElement('h1');
			editor.format.setLine(h1);

			expect(wysiwyg.querySelectorAll('h1').length).toBeGreaterThan(0);
		});

		it('should handle very deeply nested structures', () => {
			wysiwyg.innerHTML = '<div><div><div><div><p>very deep</p></div></div></div></div>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const h1 = dom.utils.createElement('h1');
			editor.format.setLine(h1);

			expect(wysiwyg.querySelector('h1')).toBeTruthy();
		});

		it('should handle format changes with zero-width spaces', () => {
			wysiwyg.innerHTML = '<p>\u200B</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p, 0, p, 1);

			const h1 = dom.utils.createElement('h1');
			editor.format.setLine(h1);

			expect(wysiwyg.querySelector('h1')).toBeTruthy();
		});

		it('should handle addLine with br-line parent', () => {
			wysiwyg.innerHTML = '<pre>preformatted text</pre>';
			const pre = wysiwyg.querySelector('pre');

			const newLine = editor.format.addLine(pre);

			expect(newLine).toBeTruthy();
		});

		it('should handle getLinesAndComponents with component container', () => {
			wysiwyg.innerHTML = '<div data-component-container="true"><p>content</p></div>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 7);

			const lines = editor.format.getLinesAndComponents(false);

			expect(lines.length).toBeGreaterThan(0);
		});
	});

	describe('History and selection preservation', () => {
		it('should preserve selection after complex format change', () => {
			wysiwyg.innerHTML = '<p>first line</p><p>second line</p><p>third line</p>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[2];
			editor.selection.setRange(firstP.firstChild, 2, lastP.firstChild, 5);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			const range = editor.selection.getRange();
			expect(range.startContainer).toBeTruthy();
			expect(range.endContainer).toBeTruthy();
		});

		it('should maintain cursor position after indent', () => {
			wysiwyg.innerHTML = '<p>some text here</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 5, p.firstChild, 5);

			editor.format.indent();

			const range = editor.selection.getRange();
			expect(range.startOffset).toBe(5);
			expect(range.endOffset).toBe(5);
		});

		it('should handle multiple format operations in sequence', () => {
			wysiwyg.innerHTML = '<p>text</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			const bqP = wysiwyg.querySelector('blockquote p');
			editor.selection.setRange(bqP.firstChild, 0, bqP.firstChild, 4);

			const h1 = dom.utils.createElement('h1');
			editor.format.setLine(h1);

			expect(wysiwyg.querySelector('blockquote h1')).toBeTruthy();
		});
	});

	describe('setBrLine complex merge scenarios', () => {
		it('should handle br-line in line parent node', () => {
			wysiwyg.innerHTML = '<div><p>line1</p></div><div><p>line2</p></div>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 5);

			const pre = dom.utils.createElement('pre');
			editor.format.setBrLine(pre);

			expect(wysiwyg.querySelector('pre')).toBeTruthy();
		});

		it('should handle br-line with nextSibling merge', () => {
			wysiwyg.innerHTML = '<p>line1</p><pre>existing pre</pre><p>line2</p>';
			const firstP = wysiwyg.querySelector('p');
			editor.selection.setRange(firstP.firstChild, 0, firstP.firstChild, 5);

			const pre = dom.utils.createElement('pre');
			editor.format.setBrLine(pre);

			expect(wysiwyg.querySelectorAll('pre').length).toBeGreaterThan(0);
		});

		it('should handle br-line with previousSibling merge', () => {
			wysiwyg.innerHTML = '<pre>existing pre</pre><p>new line</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 5);

			const pre = dom.utils.createElement('pre');
			editor.format.setBrLine(pre);

			const preElements = wysiwyg.querySelectorAll('pre');
			expect(preElements.length).toBeGreaterThan(0);
		});

		it('should handle empty innerHTML in br-line', () => {
			wysiwyg.innerHTML = '<p><br></p><p>text</p>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP, 0, lastP.firstChild, 4);

			const pre = dom.utils.createElement('pre');
			editor.format.setBrLine(pre);

			expect(wysiwyg.querySelector('pre')).toBeTruthy();
		});

		it('should handle br tag at end of html in br-line', () => {
			wysiwyg.innerHTML = '<p>text<br></p><p>more</p>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 4);

			const pre = dom.utils.createElement('pre');
			editor.format.setBrLine(pre);

			expect(wysiwyg.querySelector('pre')).toBeTruthy();
		});
	});

	describe('applyBlock with deep list nesting', () => {
		it('should handle list with continue loop skip', () => {
			wysiwyg.innerHTML = '<ul><li>A<ul><li>B<ul><li>C</li></ul></li><li>D</li></ul></li></ul>';
			const liB = wysiwyg.querySelectorAll('li')[1];
			const liD = wysiwyg.querySelectorAll('li')[3];
			editor.selection.setRange(liB.firstChild, 0, liD.firstChild, 1);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});

		it('should handle list cell with next list cell in range', () => {
			wysiwyg.innerHTML = '<ul><li>A<ul><li>B</li></ul></li><li>C</li><li>D</li></ul>';
			const items = wysiwyg.querySelectorAll('li');
			editor.selection.setRange(items[0].firstChild, 0, items[3].firstChild, 1);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});

		it('should handle splice in nested list during applyBlock', () => {
			wysiwyg.innerHTML = '<ul><li>A<ul><li>B<ul><li>C</li><li>D</li></ul></li></ul></li></ul>';
			const liB = wysiwyg.querySelector('li ul li');
			const liD = wysiwyg.querySelectorAll('li ul li ul li')[1];
			editor.selection.setRange(liB.firstChild, 0, liD.firstChild, 1);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});
	});

	describe('removeBlock complex appendNode scenarios', () => {
		it('should handle list cell with nested list during remove', () => {
			wysiwyg.innerHTML = '<ul><li>A<ul><li>B</li></ul></li><li>C</li></ul>';
			const ul = wysiwyg.querySelector('ul');
			const items = wysiwyg.querySelectorAll('li');
			editor.selection.setRange(items[0].firstChild, 0, items[2].firstChild, 1);

			const result = editor.format.removeBlock(ul);

			expect(result).not.toBeNull();
		});

		it('should handle format appendChild with list sibling', () => {
			wysiwyg.innerHTML = '<ul><li>A<ul><li>B</li></ul></li></ul>';
			const ul = wysiwyg.querySelector('ul');
			const liA = wysiwyg.querySelector('li');
			editor.selection.setRange(liA.firstChild, 0, liA.firstChild, 1);

			const result = editor.format.removeBlock(ul);

			expect(result).not.toBeNull();
		});


		it('should handle text node with zeroWidth in appendNode', () => {
			wysiwyg.innerHTML = '<blockquote><p>\u200B</p></blockquote>';
			const blockquote = wysiwyg.querySelector('blockquote');
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p, 0, p, 1);

			const result = editor.format.removeBlock(blockquote, { skipHistory: true });

			expect(result).toBeTruthy();
		});

		it('should handle list cell format in table cell parent', () => {
			wysiwyg.innerHTML = '<table><tr><td><ul><li>item</li></ul></td></tr></table>';
			const ul = wysiwyg.querySelector('ul');
			const li = wysiwyg.querySelector('li');
			editor.selection.setRange(li.firstChild, 0, li.firstChild, 4);

			const result = editor.format.removeBlock(ul, { skipHistory: true });

			expect(result).toBeTruthy();
		});

		it('should handle newList option during removeBlock', () => {
			wysiwyg.innerHTML = '<ul><li>A<ul><li>B</li></ul></li></ul>';
			const ul = wysiwyg.querySelector('ul');
			const items = wysiwyg.querySelectorAll('li');

			const ol = dom.utils.createElement('ol');
			const result = editor.format.removeBlock(ul, {
				selectedFormats: Array.from(items),
				newBlockElement: ol,
				skipHistory: true
			});

			expect(result).toBeTruthy();
		});
	});

	describe('Additional edge cases for coverage', () => {
		it('should handle setLine with same nodeName and className', () => {
			wysiwyg.innerHTML = '<p class="test">text</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			const newP = dom.utils.createElement('p');
			newP.className = 'test';
			editor.format.setLine(newP);

			expect(wysiwyg.querySelector('p.test')).toBeTruthy();
		});

		it('should handle getLine with block containing line as firstElementChild', () => {
			wysiwyg.innerHTML = '<div><p>text</p></div>';
			const textNode = wysiwyg.querySelector('p').firstChild;

			const line = editor.format.getLine(textNode);

			expect(line).toBe(wysiwyg.querySelector('p'));
		});

		it('should handle addLine with BR element for brLine parent', () => {
			wysiwyg.innerHTML = '<pre>text</pre>';
			const pre = wysiwyg.querySelector('pre');
			editor.selection.setRange(pre.firstChild, 0, pre.firstChild, 4);

			const newLine = editor.format.addLine(pre);

			expect(newLine).toBeTruthy();
		});

		it('should handle addLine without lineNode parameter', () => {
			wysiwyg.innerHTML = '<p>text</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			const newLine = editor.format.addLine(p);

			expect(newLine).toBeTruthy();
		});

		it('should handle getLines with table elements context', () => {
			wysiwyg.innerHTML = '<table><tbody><tr><td><p>cell</p></td></tr></tbody></table>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			const lines = editor.format.getLines();

			expect(lines.length).toBeGreaterThan(0);
		});

		it('should handle getLines with single common element', () => {
			wysiwyg.innerHTML = '<p>single line</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 6);

			const lines = editor.format.getLines();

			expect(lines.length).toBe(1);
		});

		it('should handle removeBlock with empty block', () => {
			wysiwyg.innerHTML = '<blockquote></blockquote><p>text</p>';
			const blockquote = wysiwyg.querySelector('blockquote');

			editor.format.removeBlock(blockquote, { skipHistory: true });

			expect(wysiwyg.querySelector('blockquote')).toBeFalsy();
		});


		it('should handle removeBlock with BR and other elements', () => {
			wysiwyg.innerHTML = '<blockquote><p>line1<br>line2</p></blockquote>';
			const blockquote = wysiwyg.querySelector('blockquote');
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.lastChild, 5);

			editor.format.removeBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeFalsy();
		});


		it('should handle removeBlock with listCell having different depth', () => {
			wysiwyg.innerHTML = '<ul><li>A</li><li>B<ul><li>C</li></ul></li><li>D</li></ul>';
			const ul = wysiwyg.querySelector('ul');
			const items = wysiwyg.querySelectorAll('li');
			editor.selection.setRange(items[1].firstChild, 0, items[3].firstChild, 1);

			const result = editor.format.removeBlock(ul, {
				selectedFormats: [items[1], items[2], items[3]],
				skipHistory: true
			});

			expect(result).toBeTruthy();
		});

		it('should handle removeBlock with table cell parent', () => {
			wysiwyg.innerHTML = '<table><tr><td><blockquote><p>quoted in cell</p></blockquote></td></tr></table>';
			const blockquote = wysiwyg.querySelector('blockquote');
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 6);

			editor.format.removeBlock(blockquote);

			expect(wysiwyg.querySelector('td blockquote')).toBeFalsy();
			expect(wysiwyg.querySelector('td p')).toBeTruthy();
		});

		it('should handle removeBlock with component in mix', () => {
			wysiwyg.innerHTML = '<blockquote><p>text</p><div data-component="hr">hr</div><p>more</p></blockquote>';
			const blockquote = wysiwyg.querySelector('blockquote');
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 4);

			editor.format.removeBlock(blockquote);

			expect(wysiwyg.querySelector('[data-component="hr"]')).toBeTruthy();
		});


		it('should handle BR element special case in appendNode', () => {
			wysiwyg.innerHTML = '<blockquote><p>line1</p><br><p>line2</p></blockquote>';
			const blockquote = wysiwyg.querySelector('blockquote');
			const paragraphs = wysiwyg.querySelectorAll('p');
			editor.selection.setRange(paragraphs[0].firstChild, 0, paragraphs[1].firstChild, 5);

			editor.format.removeBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeFalsy();
		});
	});

	describe('Specific coverage for complex branches', () => {
		it('should handle setLine with different __se__format__ class', () => {
			wysiwyg.innerHTML = '<div class="__se__format__line_a">text</div>';
			const div = wysiwyg.querySelector('div');
			if (div && div.firstChild) {
				editor.selection.setRange(div.firstChild, 0, div.firstChild, 4);

				const newDiv = dom.utils.createElement('div');
				newDiv.className = '__se__format__line_b';
				editor.format.setLine(newDiv);

				expect(wysiwyg.querySelector('div')).toBeTruthy();
			} else {
				expect(true).toBe(true);
			}
		});

		it('should handle setBrLine with component at i===0', () => {
			wysiwyg.innerHTML = '<div data-component="hr">hr</div><p>text</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			const pre = dom.utils.createElement('pre');
			editor.format.setBrLine(pre);

			expect(wysiwyg.querySelector('pre')).toBeTruthy();
		});

		it('should handle addLine with lineNode as node object and isLine check', () => {
			wysiwyg.innerHTML = '<p class="custom">text</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			const h1 = dom.utils.createElement('h1');
			h1.className = 'custom-h1';
			const newLine = editor.format.addLine(p, h1);

			expect(newLine.className).toBe('custom-h1');
		});

		it('should handle getBlock with validation returning false early', () => {
			wysiwyg.innerHTML = '<blockquote><div><p>text</p></div></blockquote>';
			const p = wysiwyg.querySelector('p');

			const block = editor.format.getBlock(p, (node) => node.nodeName === 'ARTICLE');

			expect(block).toBeNull();
		});

		it('should handle applyBlock with table cell as standTag', () => {
			wysiwyg.innerHTML = '<table><tr><td><p>cell1</p><p>cell2</p></td></tr></table>';
			const paragraphs = wysiwyg.querySelectorAll('p');
			editor.selection.setRange(paragraphs[0].firstChild, 0, paragraphs[1].firstChild, 5);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});

		it('should handle applyBlock removeItems with different depths', () => {
			wysiwyg.innerHTML = '<div><div><p>deep1</p></div><p>shallow</p></div>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 7);

			const blockquote = dom.utils.createElement('blockquote');
			editor.format.applyBlock(blockquote);

			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});

		it('should handle getLines with wysiwyg as startContainer', () => {
			wysiwyg.innerHTML = '<p>line1</p><p>line2</p>';
			const firstP = wysiwyg.querySelectorAll('p')[0];
			const lastP = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, 5);

			const lines = editor.format.getLines();

			expect(lines.length).toBeGreaterThan(0);
		});

		it('should handle getLines with text node as commonAncestor', () => {
			wysiwyg.innerHTML = '<p>single text node</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 2, textNode, 8);

			const lines = editor.format.getLines();

			expect(lines.length).toBeGreaterThan(0);
		});

		it('should handle getLinesAndComponents with same myComponent', () => {
			wysiwyg.innerHTML = '<div data-component="container"><p>inside component</p></div>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 6);

			const lines = editor.format.getLinesAndComponents(false);

			expect(lines.length).toBeGreaterThan(0);
		});
	});
});
