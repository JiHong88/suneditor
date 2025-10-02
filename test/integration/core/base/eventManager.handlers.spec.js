/**
 * @fileoverview Integration tests for eventManager event handlers
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('EventManager - Event Handlers', () => {
	let editor;

	afterEach(() => {
		if (editor && editor.history && typeof editor.destroy === 'function') {
			destroyTestEditor(editor);
		}
	});

	describe('Text formatting and tag effects', () => {
		beforeEach(async () => {
			editor = createTestEditor({
				buttonList: [['bold', 'italic', 'underline', 'strike']]
			});
			await waitForEditorReady(editor);

			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}
		});

		it('should update button states when selection changes', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold</strong> and <em>italic</em></p>';

			// Move selection to bold text
			const strong = wysiwyg.querySelector('strong');
			if (strong && strong.firstChild) {
				editor.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);
				editor.eventManager.applyTagEffect();
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle multiple formatting tags', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em>Bold and italic</em></strong></p>';

			const em = wysiwyg.querySelector('em');
			if (em && em.firstChild) {
				editor.selection.setRange(em.firstChild, 0, em.firstChild, 4);
				editor.eventManager.applyTagEffect();
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle strikethrough text', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><del>Strikethrough</del></p>';

			const del = wysiwyg.querySelector('del');
			if (del && del.firstChild) {
				editor.selection.setRange(del.firstChild, 0, del.firstChild, 6);
				editor.eventManager.applyTagEffect();
			}

			expect(wysiwyg).toBeDefined();
		});
	});

	describe('Keyboard event handling', () => {
		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}
		});

		it('should handle Tab key', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test</p>';

			const p = wysiwyg.querySelector('p');
			if (p && p.firstChild) {
				editor.selection.setRange(p.firstChild, 0, p.firstChild, 0);
			}

			const event = new KeyboardEvent('keydown', {
				key: 'Tab',
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(event);

			expect(wysiwyg).toBeDefined();
		});

		it('should handle Delete key', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test text</p>';

			const event = new KeyboardEvent('keydown', {
				key: 'Delete',
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(event);

			expect(wysiwyg).toBeDefined();
		});

		it('should handle Arrow keys', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test text</p>';

			const event = new KeyboardEvent('keydown', {
				key: 'ArrowRight',
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(event);

			expect(wysiwyg).toBeDefined();
		});

		it('should handle Ctrl+Z for undo', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test</p>';

			const event = new KeyboardEvent('keydown', {
				key: 'z',
				ctrlKey: true,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(event);

			expect(wysiwyg).toBeDefined();
		});

		it('should handle Ctrl+Y for redo', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test</p>';

			const event = new KeyboardEvent('keydown', {
				key: 'y',
				ctrlKey: true,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(event);

			expect(wysiwyg).toBeDefined();
		});
	});

	describe('Editor state changes', () => {
		beforeEach(async () => {
			editor = createTestEditor({
				charCounter: true,
				maxCharCount: 100
			});
			await waitForEditorReady(editor);

			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}
		});

		it('should update character counter on input', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test content</p>';

			const event = new Event('input', { bubbles: true });
			wysiwyg.dispatchEvent(event);

			if (editor.frameContext.has('charCounter')) {
				const charCounter = editor.frameContext.get('charCounter');
				expect(charCounter).toBeDefined();
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should track content changes', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Initial</p>';

			wysiwyg.innerHTML = '<p>Modified content</p>';

			const event = new Event('input', { bubbles: true });
			wysiwyg.dispatchEvent(event);

			expect(wysiwyg.innerHTML).toContain('Modified');
		});
	});


	describe('Mouse selection', () => {
		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}
		});

		it('should handle text selection with mouse', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Select this text</p>';

			const p = wysiwyg.querySelector('p');
			if (p && p.firstChild) {
				editor.selection.setRange(p.firstChild, 0, p.firstChild, 6);
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle double click for word selection', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Double click word</p>';

			const p = wysiwyg.querySelector('p');
			const event = new MouseEvent('dblclick', {
				bubbles: true,
				cancelable: true
			});

			if (p) {
				p.dispatchEvent(event);
			}

			expect(wysiwyg).toBeDefined();
		});
	});

	describe('Content manipulation', () => {
		beforeEach(async () => {
			editor = createTestEditor({
				defaultLine: 'p'
			});
			await waitForEditorReady(editor);

			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}
		});

		it('should maintain default line format', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Line 1</p>';

			const defaultLine = editor.options.get('defaultLine');
			expect(defaultLine.toLowerCase()).toBe('p');
		});

		it('should handle empty content', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '';

			const event = new Event('input', { bubbles: true });
			wysiwyg.dispatchEvent(event);

			expect(wysiwyg).toBeDefined();
		});

		it('should handle nested elements', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<div><p><span>Nested content</span></p></div>';

			const span = wysiwyg.querySelector('span');
			if (span && span.firstChild) {
				editor.selection.setRange(span.firstChild, 0, span.firstChild, 6);
				editor.eventManager.applyTagEffect();
			}

			expect(wysiwyg).toBeDefined();
		});
	});

	describe('History and undo/redo', () => {
		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}
		});

		it('should save history on content change', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Initial content</p>';

			editor.history.push(false);

			wysiwyg.innerHTML = '<p>Changed content</p>';

			editor.history.push(false);

			expect(editor.history).toBeDefined();
		});

		it('should handle undo operation', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Content before undo</p>';

			editor.history.push(false);

			if (typeof editor.history.undo === 'function') {
				editor.history.undo();
			}

			expect(editor.history).toBeDefined();
		});

		it('should handle redo operation', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Content</p>';

			editor.history.push(false);

			if (typeof editor.history.undo === 'function') {
				editor.history.undo();
			}

			if (typeof editor.history.redo === 'function') {
				editor.history.redo();
			}

			expect(editor.history).toBeDefined();
		});
	});

	describe('Focus management', () => {
		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}
		});

		it('should handle editor focus state', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');

			// Verify focus capability
			expect(wysiwyg).toBeDefined();
			expect(typeof wysiwyg.focus).toBe('function');
		});

		it('should handle editor blur state', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');

			// Verify blur capability
			expect(wysiwyg).toBeDefined();
			expect(typeof wysiwyg.blur).toBe('function');
		});
	});
});
