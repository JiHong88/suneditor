/**
 * @fileoverview Extended integration tests for Format module
 * Tests src/core/logic/dom/format.js with real editor
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

describe('Format Extended Integration Tests', () => {
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['bold', 'italic']],
		});
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('format detection', () => {
		it('should detect P as a line format', () => {
			const p = document.createElement('p');
			expect(editor.$.format.isLine(p)).toBe(true);
		});

		it('should detect H1-H6 as line formats', () => {
			for (let i = 1; i <= 6; i++) {
				const h = document.createElement(`h${i}`);
				expect(editor.$.format.isLine(h)).toBe(true);
			}
		});

		it('should detect DIV as line format', () => {
			const div = document.createElement('div');
			expect(editor.$.format.isLine(div)).toBe(true);
		});

		it('should detect BLOCKQUOTE as block format', () => {
			const bq = document.createElement('blockquote');
			expect(editor.$.format.isBlock(bq)).toBe(true);
		});

		it('should detect UL as block format', () => {
			const ul = document.createElement('ul');
			expect(editor.$.format.isBlock(ul)).toBe(true);
		});

		it('should detect OL as block format', () => {
			const ol = document.createElement('ol');
			expect(editor.$.format.isBlock(ol)).toBe(true);
		});

		it('should detect PRE as brLine format', () => {
			const pre = document.createElement('pre');
			expect(editor.$.format.isBrLine(pre)).toBe(true);
		});

		it('should detect TABLE as block format', () => {
			const table = document.createElement('table');
			// TABLE is a block element in suneditor's format system
			expect(editor.$.format.isBlock(table)).toBe(true);
		});

		it('should detect LI as line format', () => {
			const li = document.createElement('li');
			expect(editor.$.format.isLine(li)).toBe(true);
		});
	});

	describe('isNormalLine', () => {
		it('should return true for P', () => {
			const p = document.createElement('p');
			expect(editor.$.format.isNormalLine(p)).toBe(true);
		});

		it('should return false for PRE', () => {
			const pre = document.createElement('pre');
			expect(editor.$.format.isNormalLine(pre)).toBe(false);
		});
	});

	describe('getLine', () => {
		it('should return parent line from text node', () => {
			wysiwyg.innerHTML = '<p>Test content</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			const line = editor.$.format.getLine(textNode);
			expect(line).toBeTruthy();
			expect(line.nodeName).toBe('P');
		});

		it('should return parent line from nested element', () => {
			wysiwyg.innerHTML = '<p><strong>Bold text</strong></p>';
			const strong = wysiwyg.querySelector('strong');
			const line = editor.$.format.getLine(strong);
			expect(line).toBeTruthy();
			expect(line.nodeName).toBe('P');
		});

		it('should return null for wysiwyg element itself', () => {
			const line = editor.$.format.getLine(wysiwyg);
			expect(line).toBeNull();
		});
	});

	describe('getBlock', () => {
		it('should return parent block from list item', () => {
			wysiwyg.innerHTML = '<ul><li>Item</li></ul>';
			const li = wysiwyg.querySelector('li');
			const block = editor.$.format.getBlock(li);
			expect(block).toBeTruthy();
			expect(block.nodeName).toBe('UL');
		});

		it('should return null when no block parent', () => {
			wysiwyg.innerHTML = '<p>Text</p>';
			const p = wysiwyg.querySelector('p');
			const block = editor.$.format.getBlock(p);
			expect(block).toBeNull();
		});
	});

	describe('getLines', () => {
		it('should return selected lines', () => {
			wysiwyg.innerHTML = '<p>Line 1</p><p>Line 2</p><p>Line 3</p>';
			const first = wysiwyg.querySelector('p').firstChild;
			const last = wysiwyg.querySelectorAll('p')[2].firstChild;
			editor.$.selection.setRange(first, 0, last, 6);

			const lines = editor.$.format.getLines();
			expect(lines.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe('addLine', () => {
		it('should add default line when wysiwyg is empty', () => {
			wysiwyg.innerHTML = '';
			editor.$.format.addLine(wysiwyg);
			const defaultLine = editor.$.options.get('defaultLine');
			expect(wysiwyg.querySelector(defaultLine)).toBeTruthy();
		});
	});

	describe('setLine', () => {
		it('should change P to H1', () => {
			wysiwyg.innerHTML = '<p>Heading</p>';
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 7);

			const h1 = document.createElement('h1');
			editor.$.format.setLine(h1);
			expect(wysiwyg.querySelector('h1')).toBeTruthy();
			expect(wysiwyg.querySelector('h1').textContent).toBe('Heading');
		});

		it('should change H1 back to P', () => {
			wysiwyg.innerHTML = '<h1>Title</h1>';
			const textNode = wysiwyg.querySelector('h1').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 5);

			const p = document.createElement('p');
			editor.$.format.setLine(p);
			expect(wysiwyg.querySelector('p')).toBeTruthy();
			expect(wysiwyg.querySelector('p').textContent).toBe('Title');
		});
	});

	describe('isTextStyleNode', () => {
		it('should return true for STRONG', () => {
			const el = document.createElement('strong');
			expect(editor.$.format.isTextStyleNode(el)).toBe(true);
		});

		it('should return true for EM', () => {
			const el = document.createElement('em');
			expect(editor.$.format.isTextStyleNode(el)).toBe(true);
		});

		it('should return true for SPAN', () => {
			const el = document.createElement('span');
			expect(editor.$.format.isTextStyleNode(el)).toBe(true);
		});

		it('should return true for U', () => {
			const el = document.createElement('u');
			expect(editor.$.format.isTextStyleNode(el)).toBe(true);
		});

		it('should return false for P', () => {
			const el = document.createElement('p');
			expect(editor.$.format.isTextStyleNode(el)).toBe(false);
		});

		it('should return false for DIV', () => {
			const el = document.createElement('div');
			expect(editor.$.format.isTextStyleNode(el)).toBe(false);
		});
	});

	describe('indent/outdent via margin', () => {
		it('should indent a line (add margin-left)', () => {
			wysiwyg.innerHTML = '<p>Indent me</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 9);

			editor.$.format.indent();
			const p = wysiwyg.querySelector('p');
			const marginLeft = parseInt(p.style.marginLeft, 10);
			expect(marginLeft).toBeGreaterThan(0);
		});

		it('should outdent a line (reduce margin-left)', () => {
			wysiwyg.innerHTML = '<p style="margin-left: 50px;">Outdent me</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 10);

			editor.$.format.outdent();
			const p = wysiwyg.querySelector('p');
			const marginLeft = parseInt(p.style.marginLeft, 10);
			expect(marginLeft).toBeLessThan(50);
		});

		it('should not outdent below 0', () => {
			wysiwyg.innerHTML = '<p>No outdent</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 10);

			editor.$.format.outdent();
			const p = wysiwyg.querySelector('p');
			const marginLeft = parseInt(p.style.marginLeft || '0', 10);
			expect(marginLeft).toBe(0);
		});
	});
});
