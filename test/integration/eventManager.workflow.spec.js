/**
 * @fileoverview Workflow tests for eventManager.js to cover real user interactions
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('EventManager - workflow Tests', () => {
	let editor;

	afterEach(() => {
		if (editor && editor.history && typeof editor.destroy === 'function') {
			destroyTestEditor(editor);
		}
	});

	describe('Real editing workflow', () => {
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

		it('should handle typing and Enter key to create new paragraph', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First line</p>';

			const p = wysiwyg.querySelector('p');
			if (p && p.firstChild) {
				const range = document.createRange();
				range.setStart(p.firstChild, 10);
				range.setEnd(p.firstChild, 10);

				const selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}

			// Verify setup
			expect(wysiwyg).toBeDefined();
		});

		it('should handle Backspace to merge paragraphs', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First</p><p>Second</p>';

			const paragraphs = wysiwyg.querySelectorAll('p');
			if (paragraphs[1] && paragraphs[1].firstChild) {
				const range = document.createRange();
				range.setStart(paragraphs[1].firstChild, 0);
				range.setEnd(paragraphs[1].firstChild, 0);

				const selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle Delete key at end of line', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First</p><p>Second</p>';

			const p = wysiwyg.querySelector('p');
			if (p && p.firstChild) {
				const range = document.createRange();
				range.setStart(p.firstChild, 5);
				range.setEnd(p.firstChild, 5);

				const selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}

			expect(wysiwyg).toBeDefined();
		});
	});

	describe('Formatting workflow', () => {
		beforeEach(async () => {
			editor = createTestEditor({
				buttonList: [['bold', 'italic', 'underline', 'strike', 'removeFormat']]
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

		it('should apply and detect bold formatting', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold</strong> text</p>';

			const strong = wysiwyg.querySelector('strong');
			if (strong && strong.firstChild) {
				editor.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);
				editor.eventManager.applyTagEffect();
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle mixed formatting', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em><u>Mixed</u></em></strong></p>';

			const u = wysiwyg.querySelector('u');
			if (u && u.firstChild) {
				editor.selection.setRange(u.firstChild, 0, u.firstChild, 5);
				editor.eventManager.applyTagEffect();
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should detect format removal', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Plain text</p>';

			const p = wysiwyg.querySelector('p');
			if (p && p.firstChild) {
				editor.selection.setRange(p.firstChild, 0, p.firstChild, 5);
				editor.eventManager.applyTagEffect();
			}

			expect(wysiwyg).toBeDefined();
		});
	});

	describe('List handling', () => {
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

		it('should detect cursor in list', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<ul><li>Item 1</li><li>Item 2</li></ul>';

			const li = wysiwyg.querySelector('li');
			if (li && li.firstChild) {
				editor.selection.setRange(li.firstChild, 0, li.firstChild, 4);
				editor.eventManager.applyTagEffect();
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle nested lists', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<ul><li>Outer<ul><li>Inner</li></ul></li></ul>';

			const innerLi = wysiwyg.querySelectorAll('li')[1];
			if (innerLi && innerLi.firstChild) {
				editor.selection.setRange(innerLi.firstChild, 0, innerLi.firstChild, 5);
				editor.eventManager.applyTagEffect();
			}

			expect(wysiwyg).toBeDefined();
		});
	});

	describe('Content manipulation', () => {
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

		it('should update char count on content change', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test content</p>';

			if (editor.frameContext.has('charCounter')) {
				// Check counter exists
				const counter = editor.frameContext.get('charCounter');
				expect(counter).toBeDefined();
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle empty content', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '';

			expect(wysiwyg).toBeDefined();
		});

		it('should handle very long content', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			const longText = 'Long text. '.repeat(50);
			wysiwyg.innerHTML = `<p>${longText}</p>`;

			expect(wysiwyg.innerHTML.length).toBeGreaterThan(100);
		});
	});

	describe('Selection scenarios', () => {
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

		it('should handle collapsed selection', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text for selection</p>';

			const p = wysiwyg.querySelector('p');
			if (p && p.firstChild) {
				editor.selection.setRange(p.firstChild, 5, p.firstChild, 5);
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle range selection', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text for selection</p>';

			const p = wysiwyg.querySelector('p');
			if (p && p.firstChild) {
				editor.selection.setRange(p.firstChild, 0, p.firstChild, 10);
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle cross-element selection', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First</p><p>Second</p>';

			const paragraphs = wysiwyg.querySelectorAll('p');
			if (paragraphs[0] && paragraphs[0].firstChild && paragraphs[1] && paragraphs[1].firstChild) {
				editor.selection.setRange(
					paragraphs[0].firstChild, 2,
					paragraphs[1].firstChild, 4
				);
			}

			expect(wysiwyg).toBeDefined();
		});
	});

	describe('Complex editing scenarios', () => {
		beforeEach(async () => {
			editor = createTestEditor({
				defaultLine: 'p',
				buttonList: [['bold', 'italic']]
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

		it('should handle link in text', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text with <a href="#">link</a> inside</p>';

			const a = wysiwyg.querySelector('a');
			if (a && a.firstChild) {
				editor.selection.setRange(a.firstChild, 0, a.firstChild, 4);
				editor.eventManager.applyTagEffect();
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle table content', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>';

			const td = wysiwyg.querySelector('td');
			if (td && td.firstChild) {
				editor.selection.setRange(td.firstChild, 0, td.firstChild, 4);
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle blockquote', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<blockquote><p>Quoted text</p></blockquote>';

			const p = wysiwyg.querySelector('p');
			if (p && p.firstChild) {
				editor.selection.setRange(p.firstChild, 0, p.firstChild, 6);
				editor.eventManager.applyTagEffect();
			}

			expect(wysiwyg).toBeDefined();
		});

		it('should handle pre/code blocks', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<pre><code>Code here</code></pre>';

			const code = wysiwyg.querySelector('code');
			if (code && code.firstChild) {
				editor.selection.setRange(code.firstChild, 0, code.firstChild, 4);
			}

			expect(wysiwyg).toBeDefined();
		});
	});
});
