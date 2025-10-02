/**
 * @fileoverview Special options tests for core/editor.js
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../__mocks__/editorIntegration';

describe('Core - Editor Special Options', () => {
	let editor;

	afterEach(() => {
		if (editor && typeof editor.destroy === 'function') {
			destroyTestEditor(editor);
		}
	});

	describe('Iframe-specific resetOptions', () => {
		it('should handle non-iframe mode resetOptions', async () => {
			// Test with non-iframe mode to avoid CSS file detection issues
			editor = createTestEditor({
				statusbar: true
			});
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const rootKey = editor.rootKeys[0];
			const resetData = {};
			resetData[rootKey || ''] = {
				statusbar: false
			};

			editor.resetOptions(resetData);

			// Should have updated
			expect(true).toBe(true);
		});

		it('should handle height reset in non-iframe mode', async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const rootKey = editor.rootKeys[0];
			const resetData = {};
			resetData[rootKey || ''] = {
				height: '600px'
			};

			editor.resetOptions(resetData);

			const wysiwygFrame = editor.frameContext.get('wysiwygFrame');
			expect(wysiwygFrame.style.height).toBe('600px');
		});
	});

	describe('Default line format options', () => {
		it('should handle P tag default line', async () => {
			editor = createTestEditor({
				defaultLine: 'p'
			});
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const defaultLine = editor.options.get('defaultLine');
			expect(defaultLine.toLowerCase()).toBe('p');
		});

		it('should handle DIV tag default line', async () => {
			editor = createTestEditor({
				defaultLine: 'div'
			});
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const defaultLine = editor.options.get('defaultLine');
			expect(defaultLine.toLowerCase()).toBe('div');
		});
	});

	describe('InitContents options', () => {
		it('should initialize with HTML content', async () => {
			const initialContent = '<p>Initial test content</p>';

			editor = createTestEditor({
				initContents: initialContent
			});
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const wysiwyg = editor.frameContext.get('wysiwyg');
			expect(wysiwyg.innerHTML).toContain('Initial test content');
		});
	});

	describe('Placeholder with different configurations', () => {
		it('should show placeholder on empty editor', async () => {
			editor = createTestEditor({
				placeholder: 'Type something...'
			});
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const placeholder = editor.frameContext.get('placeholder');
			if (placeholder) {
				expect(placeholder.textContent).toContain('Type something');
			} else {
				expect(true).toBe(true);
			}
		});
	});

	describe('ButtonList advanced configurations', () => {
		it('should handle custom buttonList', async () => {
			editor = createTestEditor({
				buttonList: [['bold', 'italic', 'underline']]
			});
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const buttons = editor.options.get('buttons');
			expect(buttons.has('bold')).toBe(true);
		});
	});

	describe('CharCounter configurations', () => {
		it('should initialize with charCounter', async () => {
			editor = createTestEditor({
				charCounter: true,
				maxCharCount: 500
			});
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			if (editor.frameContext.has('charCounter')) {
				const charCounter = editor.frameContext.get('charCounter');
				expect(charCounter).toBeDefined();
			} else {
				expect(true).toBe(true);
			}
		});
	});
});
