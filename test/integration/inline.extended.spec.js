/**
 * @fileoverview Integration tests for inline formatting
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { font, fontColor } from '../../src/plugins';

describe('Inline Format Extended Tests', () => {
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor({
			plugins: { font, fontColor },
			buttonList: [['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript']],
		});
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('apply bold', () => {
		it('should wrap selected text in strong tag', async () => {
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 5);

			await editor.$.commandDispatcher.run('bold');

			expect(wysiwyg.innerHTML).toContain('<strong>Hello</strong>');
		});

		it('should apply bold to partial selection', async () => {
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 6, textNode, 11);

			await editor.$.commandDispatcher.run('bold');

			expect(wysiwyg.innerHTML).toContain('<strong>World</strong>');
		});
	});

	describe('apply italic', () => {
		it('should wrap selected text in em tag', async () => {
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 5);

			await editor.$.commandDispatcher.run('italic');

			expect(wysiwyg.innerHTML).toContain('<em>Hello</em>');
		});
	});

	describe('apply underline', () => {
		it('should wrap selected text in u tag', async () => {
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 5);

			await editor.$.commandDispatcher.run('underline');

			expect(wysiwyg.innerHTML).toContain('<u>Hello</u>');
		});
	});

	describe('apply strikethrough', () => {
		it('should wrap selected text in del tag', async () => {
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 5);

			await editor.$.commandDispatcher.run('strike');

			expect(wysiwyg.innerHTML).toContain('<del>Hello</del>');
		});
	});

	describe('apply subscript', () => {
		it('should wrap selected text in sub tag', async () => {
			wysiwyg.innerHTML = '<p>H2O</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 1, textNode, 2);

			await editor.$.commandDispatcher.run('subscript');

			expect(wysiwyg.innerHTML).toContain('<sub>2</sub>');
		});
	});

	describe('apply superscript', () => {
		it('should wrap selected text in sup tag', async () => {
			wysiwyg.innerHTML = '<p>x2</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 1, textNode, 2);

			await editor.$.commandDispatcher.run('superscript');

			expect(wysiwyg.innerHTML).toContain('<sup>2</sup>');
		});
	});

	describe('nested formatting', () => {
		it('should apply bold inside italic', async () => {
			wysiwyg.innerHTML = '<p><em>Italic text</em></p>';
			const textNode = wysiwyg.querySelector('em').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 6);

			await editor.$.commandDispatcher.run('bold');

			expect(wysiwyg.querySelector('strong')).toBeTruthy();
			expect(wysiwyg.querySelector('em')).toBeTruthy();
		});
	});

	describe('text style node detection', () => {
		it('should detect STRONG as text style node', () => {
			const strong = document.createElement('strong');
			expect(editor.$.format.isTextStyleNode(strong)).toBe(true);
		});

		it('should detect EM as text style node', () => {
			const em = document.createElement('em');
			expect(editor.$.format.isTextStyleNode(em)).toBe(true);
		});

		it('should detect U as text style node', () => {
			const u = document.createElement('u');
			expect(editor.$.format.isTextStyleNode(u)).toBe(true);
		});

		it('should detect SPAN as text style node', () => {
			const span = document.createElement('span');
			expect(editor.$.format.isTextStyleNode(span)).toBe(true);
		});

		it('should not detect P as text style node', () => {
			const p = document.createElement('p');
			expect(editor.$.format.isTextStyleNode(p)).toBe(false);
		});
	});
});
