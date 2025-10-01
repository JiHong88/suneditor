import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { dom } from '../../../../src/helper';

describe('ListFormat Class - Integration Tests', () => {
	let editor;
	let wysiwyg;
	let listFormat;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		wysiwyg = editor.frameContext.get('wysiwyg');
		listFormat = editor.listFormat;
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Complex list creation scenarios', () => {
		it('should convert mixed content to list', () => {
			wysiwyg.innerHTML = '<p>Para 1</p><blockquote>Quote</blockquote><p>Para 2</p>';
			const p1 = wysiwyg.querySelector('p');
			const p2 = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(p1.firstChild, 0, p2.firstChild, 6);

			listFormat.apply('ul');

			expect(wysiwyg.querySelector('ul')).toBeTruthy();
			expect(wysiwyg.querySelectorAll('li').length).toBeGreaterThan(0);
		});

		it('should handle list conversion with undo/redo', () => {
			wysiwyg.innerHTML = '<p>Test paragraph</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			listFormat.apply('ul');
			expect(wysiwyg.querySelector('ul')).toBeTruthy();

			editor.history.undo();
			// After undo, content should be back
			expect(wysiwyg.textContent).toContain('Test');

			editor.history.redo();
			expect(wysiwyg.querySelector('ul')).toBeTruthy();
		});

		it('should handle nested list indentation', () => {
			wysiwyg.innerHTML = '<ul><li>One</li><li>Two</li></ul>';
			const li2 = wysiwyg.querySelectorAll('li')[1];

			editor.selection.setRange(li2.firstChild, 0, li2.firstChild, 3);
			listFormat.applyNested([li2], true);

			// After operation, content should be preserved
			expect(wysiwyg.textContent).toContain('One');
			expect(wysiwyg.textContent).toContain('Two');
		});

		it('should handle list type conversion (ul to ol)', () => {
			wysiwyg.innerHTML = '<ul><li>Item 1</li><li>Item 2</li></ul>';
			const li1 = wysiwyg.querySelector('li');
			const li2 = wysiwyg.querySelectorAll('li')[1];
			editor.selection.setRange(li1.firstChild, 0, li2.firstChild, 6);

			listFormat.apply('ol');

			expect(wysiwyg.querySelector('ol')).toBeTruthy();
			expect(wysiwyg.querySelector('ul')).toBeFalsy();
			expect(wysiwyg.querySelectorAll('li').length).toBe(2);
		});
	});

	describe('Complex list removal scenarios', () => {
		it('should remove list and preserve formatting', () => {
			wysiwyg.innerHTML = '<ul><li><strong>Bold item</strong></li><li><em>Italic item</em></li></ul>';
			const li1 = wysiwyg.querySelector('li');
			const li2 = wysiwyg.querySelectorAll('li')[1];
			editor.selection.setRange(li1.firstChild.firstChild, 0, li2.firstChild.firstChild, 6);
			const selectedCells = editor.format.getLinesAndComponents(false);

			listFormat.remove(selectedCells);

			expect(wysiwyg.querySelector('strong')).toBeTruthy();
			expect(wysiwyg.querySelector('em')).toBeTruthy();
			expect(wysiwyg.querySelectorAll('p').length).toBe(2);
		});

		it('should remove partial list and split', () => {
			wysiwyg.innerHTML = '<ul><li>One</li><li>Two</li><li>Three</li><li>Four</li></ul>';
			const li2 = wysiwyg.querySelectorAll('li')[1];
			const li3 = wysiwyg.querySelectorAll('li')[2];
			editor.selection.setRange(li2.firstChild, 0, li3.firstChild, 5);
			const selectedCells = editor.format.getLinesAndComponents(false);

			listFormat.remove(selectedCells);

			expect(wysiwyg.querySelectorAll('ul').length).toBe(2);
			expect(wysiwyg.querySelectorAll('p').length).toBe(2);
		});
	});

	describe('Nested list manipulation', () => {
		it('should handle deeply nested list structures', () => {
			wysiwyg.innerHTML = '<ul><li>L1<ul><li>L2<ul><li>L3</li></ul></li></ul></li></ul>';
			const l3 = wysiwyg.querySelectorAll('li')[2];

			listFormat.removeNested(l3);

			expect(wysiwyg.querySelectorAll('ul').length).toBeGreaterThan(1);
		});

		it('should indent and unindent multiple times', () => {
			wysiwyg.innerHTML = '<ul><li>One</li><li>Two</li></ul>';
			const li2 = wysiwyg.querySelectorAll('li')[1];

			listFormat.applyNested([li2], true);
			// After indenting
			expect(wysiwyg.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);

			const nestedLi = wysiwyg.querySelectorAll('li')[1] || wysiwyg.querySelector('li');
			if (nestedLi) {
				listFormat.removeNested(nestedLi);
			}

			expect(wysiwyg.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
		});

		it('should handle complex nested list with mixed types', () => {
			wysiwyg.innerHTML = '<ul><li>UL Item<ol><li>OL Item</li></ol></li></ul>';
			const olLi = wysiwyg.querySelector('ol li');
			editor.selection.setRange(olLi.firstChild, 0, olLi.firstChild, 7);

			listFormat.apply('ul');

			expect(wysiwyg.querySelector('ul')).toBeTruthy();
		});
	});

	describe('List merging scenarios', () => {
		it('should handle adjacent lists', () => {
			wysiwyg.innerHTML = '<ul><li>List 1</li></ul><ul><li>List 2</li></ul>';

			// Verify initial structure
			expect(wysiwyg.querySelectorAll('ul').length).toBe(2);
			expect(wysiwyg.querySelectorAll('li').length).toBe(2);
		});

		it('should merge with top and bottom lists', () => {
			wysiwyg.innerHTML = '<ul><li>Top</li></ul><p>Middle</p><ul><li>Bottom</li></ul>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 6);

			listFormat.apply('ul');

			expect(wysiwyg.querySelectorAll('ul').length).toBe(1);
			expect(wysiwyg.querySelectorAll('li').length).toBe(3);
		});
	});

	describe('List with components and special content', () => {
		it('should handle list with image components', () => {
			wysiwyg.innerHTML = '<p>Text</p><p><img src="test.jpg"></p>';
			const p1 = wysiwyg.querySelector('p');
			const p2 = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(p1.firstChild, 0, p2, 1);

			listFormat.apply('ul');

			expect(wysiwyg.querySelector('ul')).toBeTruthy();
			expect(wysiwyg.querySelector('img')).toBeTruthy();
		});

		it('should handle list with table', () => {
			wysiwyg.innerHTML = '<p>Before</p><table><tr><td>Cell</td></tr></table><p>After</p>';
			const p1 = wysiwyg.querySelector('p');
			const p2 = wysiwyg.querySelectorAll('p')[1];
			editor.selection.setRange(p1.firstChild, 0, p2.firstChild, 5);

			listFormat.apply('ul');

			expect(wysiwyg.querySelector('ul')).toBeTruthy();
			expect(wysiwyg.querySelector('table')).toBeTruthy();
		});

		it('should handle HR in list', () => {
			wysiwyg.innerHTML = '<p>Text</p><hr>';
			const p = wysiwyg.querySelector('p');
			const hr = wysiwyg.querySelector('hr');
			editor.selection.setRange(p.firstChild, 0, hr.parentNode, Array.from(hr.parentNode.childNodes).indexOf(hr) + 1);

			listFormat.apply('ul');

			expect(wysiwyg.querySelector('ul')).toBeTruthy();
			expect(wysiwyg.querySelector('hr')).toBeTruthy();
		});
	});

	describe('Edge cases with selection', () => {
		it('should handle collapsed selection in list', () => {
			wysiwyg.innerHTML = '<p>Text content</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 5, p.firstChild, 5);

			listFormat.apply('ul');

			expect(wysiwyg.querySelector('ul')).toBeTruthy();
		});

		it('should handle multiple list types', () => {
			wysiwyg.innerHTML = '<ul><li>UL</li></ul><ol><li>OL</li></ol>';

			// Verify different list types exist
			expect(wysiwyg.querySelector('ul')).toBeTruthy();
			expect(wysiwyg.querySelector('ol')).toBeTruthy();
		});

		it('should handle empty list items', () => {
			wysiwyg.innerHTML = '<ul><li>Item</li><li><br></li><li>Another</li></ul>';
			const li1 = wysiwyg.querySelector('li');
			const li3 = wysiwyg.querySelectorAll('li')[2];
			editor.selection.setRange(li1.firstChild, 0, li3.firstChild, 7);
			const selectedCells = editor.format.getLinesAndComponents(false);

			listFormat.remove(selectedCells);

			expect(wysiwyg.querySelectorAll('p').length).toBe(3);
		});
	});

	describe('List style type variations', () => {
		it('should apply different list style types', () => {
			wysiwyg.innerHTML = '<p>One</p><p>Two</p><p>Three</p>';
			const p1 = wysiwyg.querySelector('p');
			const p3 = wysiwyg.querySelectorAll('p')[2];
			editor.selection.setRange(p1.firstChild, 0, p3.firstChild, 5);

			listFormat.apply('ol:upper-roman');

			const ol = wysiwyg.querySelector('ol');
			expect(ol).toBeTruthy();
			expect(ol.style.listStyleType).toBe('upper-roman');
		});

		it('should handle list style types', () => {
			wysiwyg.innerHTML = '<ul style="list-style-type: disc"><li>Item</li></ul>';

			// Verify list style exists
			const ul = wysiwyg.querySelector('ul');
			expect(ul).toBeTruthy();
			expect(ul.style.listStyleType).toBe('disc');
		});
	});

	describe('Complex deletion scenarios', () => {
		it('should delete multiple list levels', () => {
			wysiwyg.innerHTML = '<ul><li>L1<ul><li>L2</li></ul></li><li>L1-2</li></ul>';
			const li1 = wysiwyg.querySelector('li');
			const li3 = wysiwyg.querySelectorAll('li')[2];
			editor.selection.setRange(li1.firstChild, 0, li3.firstChild, 4);
			const selectedCells = editor.format.getLinesAndComponents(false);

			listFormat.remove(selectedCells, true);

			expect(wysiwyg.innerHTML).toBe('');
		});

		it('should delete and preserve siblings', () => {
			wysiwyg.innerHTML = '<ul><li>Keep</li><li>Delete</li><li>Keep</li></ul>';
			const li2 = wysiwyg.querySelectorAll('li')[1];
			editor.selection.setRange(li2.firstChild, 0, li2.firstChild, 6);
			const selectedCells = [li2];

			listFormat.remove(selectedCells, true);

			expect(wysiwyg.querySelectorAll('li').length).toBe(2);
		});
	});

	describe('Real-world scenarios', () => {
		it('should handle copy-paste list content', () => {
			wysiwyg.innerHTML = '<ul><li>Existing</li></ul>';
			const li = wysiwyg.querySelector('li');

			const newLi = dom.utils.createElement('li');
			newLi.textContent = 'Pasted';
			li.parentNode.appendChild(newLi);

			expect(wysiwyg.querySelectorAll('li').length).toBe(2);
		});

		it('should handle rapid list operations', () => {
			wysiwyg.innerHTML = '<p>Text</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			listFormat.apply('ul');
			expect(wysiwyg.querySelector('ul')).toBeTruthy();

			const li = wysiwyg.querySelector('li');
			editor.selection.setRange(li.firstChild, 0, li.firstChild, 4);
			const selectedCells = [li];

			listFormat.remove(selectedCells);
			expect(wysiwyg.querySelector('p')).toBeTruthy();

			editor.selection.setRange(wysiwyg.querySelector('p').firstChild, 0, wysiwyg.querySelector('p').firstChild, 4);
			listFormat.apply('ol');
			expect(wysiwyg.querySelector('ol')).toBeTruthy();
		});

		it('should maintain selection after list operations', () => {
			wysiwyg.innerHTML = '<p>Test content here</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 5, p.firstChild, 12);

			listFormat.apply('ul');

			const range = editor.selection.getRange();
			expect(range).toBeTruthy();
		});
	});

	describe('Performance tests', () => {
		it('should handle large list efficiently', () => {
			let html = '';
			for (let i = 0; i < 50; i++) {
				html += `<p>Item ${i}</p>`;
			}
			wysiwyg.innerHTML = html;

			const first = wysiwyg.querySelector('p');
			const last = wysiwyg.querySelectorAll('p')[49];
			editor.selection.setRange(first.firstChild, 0, last.firstChild, 7);

			const startTime = Date.now();
			listFormat.apply('ul');
			const endTime = Date.now();

			expect(endTime - startTime).toBeLessThan(1000);
			expect(wysiwyg.querySelectorAll('li').length).toBe(50);
		});

		it('should handle deeply nested list efficiently', () => {
			let html = '<ul><li>L1';
			for (let i = 0; i < 10; i++) {
				html += '<ul><li>L' + (i + 2);
			}
			html += '</li>';
			for (let i = 0; i < 10; i++) {
				html += '</ul></li>';
			}
			wysiwyg.innerHTML = html;

			const deepestLi = wysiwyg.querySelectorAll('li')[10];

			const startTime = Date.now();
			listFormat.removeNested(deepestLi);
			const endTime = Date.now();

			expect(endTime - startTime).toBeLessThan(500);
		});
	});

	describe('_attachNested critical paths', () => {
		it('should handle applyNested merging with prev list', () => {
			wysiwyg.innerHTML = '<ul><li>one<ul><li>prev</li></ul></li><li>two</li><li>three</li></ul>';
			const li2 = wysiwyg.querySelectorAll('li')[2];
			const li3 = wysiwyg.querySelectorAll('li')[3];

			listFormat.applyNested([li2, li3], true);

			expect(wysiwyg.querySelectorAll('ul').length).toBeGreaterThan(1);
		});

		it('should handle applyNested merging with next list', () => {
			wysiwyg.innerHTML = '<ul><li>one</li><li>two</li><li>three<ul><li>next</li></ul></li></ul>';
			const li1 = wysiwyg.querySelector('li');
			const li2 = wysiwyg.querySelectorAll('li')[1];

			listFormat.applyNested([li1, li2], true);

			expect(wysiwyg.querySelectorAll('ul').length).toBeGreaterThan(1);
		});

		it('should handle applyNested with prev as list cell', () => {
			wysiwyg.innerHTML = '<ul><li>one<ul><li>nested</li></ul></li><li>two</li></ul>';
			const li2 = wysiwyg.querySelectorAll('li')[2];

			listFormat.applyNested([li2], true);

			expect(wysiwyg.querySelectorAll('ul').length).toBeGreaterThan(1);
		});

		it('should handle applyNested node path tracking', () => {
			wysiwyg.innerHTML = '<ul><li>one</li><li>two</li><li>three</li><li>four</li></ul>';
			const li2 = wysiwyg.querySelectorAll('li')[1];
			const li3 = wysiwyg.querySelectorAll('li')[2];
			const li4 = wysiwyg.querySelectorAll('li')[3];

			listFormat.applyNested([li2, li3, li4], true);

			const ul = wysiwyg.querySelector('ul');

			expect(ul).toBeTruthy();
			expect(wysiwyg.textContent).toContain('one');
			expect(wysiwyg.textContent).toContain('two');
			expect(wysiwyg.textContent).toContain('three');
			expect(wysiwyg.textContent).toContain('four');
		});

		it('should handle mergeSameTags and mergeNestedTags during attach', () => {
			wysiwyg.innerHTML = '<ul><li>one</li><li><span>two</span></li><li><span>three</span></li></ul>';
			const li2 = wysiwyg.querySelectorAll('li')[1];
			const li3 = wysiwyg.querySelectorAll('li')[2];

			listFormat.applyNested([li2, li3], true);

			expect(wysiwyg.querySelector('span')).toBeTruthy();
		});
	});

	describe('Early return paths', () => {
		it('should handle apply with empty selectedCells return early', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			listFormat.apply('ul', []);

			expect(wysiwyg.querySelector('p')).toBeTruthy();
		});

		it('should handle apply with selectedFormats length 0 after getRangeAndAddLine', () => {
			wysiwyg.innerHTML = '';
			wysiwyg.appendChild(document.createTextNode(''));

			listFormat.apply('ul');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});
});
