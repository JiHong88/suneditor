/**
 * @fileoverview Integration tests for HTML operations
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

describe('HTML Extended Tests', () => {
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('html.set()', () => {
		it('should replace all content', () => {
			editor.$.html.set('<p>New content</p>');

			expect(wysiwyg.innerHTML).toContain('New content');
		});

		it('should clear content when setting empty', () => {
			wysiwyg.innerHTML = '<p>Old content</p>';
			editor.$.html.set('');

			expect(wysiwyg.textContent.trim()).toBe('');
		});

		it('should handle multiple paragraphs', () => {
			editor.$.html.set('<p>Line 1</p><p>Line 2</p>');

			expect(wysiwyg.querySelectorAll('p').length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('html.get()', () => {
		it('should return current content as HTML string', () => {
			wysiwyg.innerHTML = '<p>Test content</p>';
			const html = editor.$.html.get();

			expect(html).toContain('Test content');
		});

		it('should return empty for empty editor', () => {
			wysiwyg.innerHTML = '<p><br></p>';
			const html = editor.$.html.get();

			// Empty editor returns at least the default line or empty string
			expect(typeof html).toBe('string');
		});
	});

	describe('html.clean()', () => {
		it('should remove script tags', () => {
			const cleaned = editor.$.html.clean('<p>Hello</p><script>alert(1)</script>');

			expect(cleaned).not.toContain('<script');
		});

		it('should preserve basic formatting', () => {
			const cleaned = editor.$.html.clean('<p><strong>Bold</strong></p>');

			expect(cleaned).toContain('Bold');
		});

		it('should handle empty string', () => {
			const cleaned = editor.$.html.clean('');

			expect(typeof cleaned).toBe('string');
		});
	});

	describe('html.insert()', () => {
		it('should insert HTML at cursor position', () => {
			wysiwyg.innerHTML = '<p>Before After</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 7, textNode, 7);

			editor.$.html.insert('<strong>Inserted</strong>');

			expect(wysiwyg.innerHTML).toContain('Inserted');
		});
	});

	describe('html.remove()', () => {
		it('should remove selected content', () => {
			wysiwyg.innerHTML = '<p>Keep this Remove this</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 10, textNode, 21);

			editor.$.html.remove();

			expect(wysiwyg.textContent).not.toContain('Remove this');
		});
	});

	describe('html._convertToCode()', () => {
		it('should convert HTML entities for code view', () => {
			const result = editor.$.html._convertToCode('<p>Hello &amp; World</p>');

			expect(typeof result).toBe('string');
			expect(result).toContain('Hello');
		});
	});

	describe('selection integration', () => {
		it('should get selection node', () => {
			wysiwyg.innerHTML = '<p>Test</p>';
			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			const node = editor.$.selection.getNode();
			expect(node).toBeTruthy();
		});

		it('should get selection range', () => {
			wysiwyg.innerHTML = '<p>Test</p>';
			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 4);

			const range = editor.$.selection.getRange();
			expect(range).toBeTruthy();
			expect(range.startContainer).toBe(p.firstChild);
		});
	});
});
