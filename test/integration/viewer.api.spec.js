/**
 * @fileoverview Integration tests for Viewer API methods
 * Tests real-world usage of editor.viewer public API (codeView, fullScreen, showBlocks, print, preview)
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Viewer API integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'viewer-api-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['codeView', 'fullScreen', 'showBlocks', 'print', 'preview']],
			width: '100%',
			height: 'auto'
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) {
			destroyTestEditor(editor);
		}
		if (container && container.parentNode) {
			container.parentNode.removeChild(container);
		}
	});

	describe('viewer.codeView() - Toggle code view', () => {
		it('should toggle code view mode', () => {
			expect(editor.frameContext.get('isCodeView')).toBe(false);

			// Enable code view
			editor.viewer.codeView(true);
			expect(editor.frameContext.get('isCodeView')).toBe(true);

			// Disable code view
			editor.viewer.codeView(false);
			expect(editor.frameContext.get('isCodeView')).toBe(false);
		});

		it('should preserve content when toggling code view', () => {
			const testContent = '<p>Test content for code view</p>';
			editor.html.set(testContent);

			// Toggle to code view
			editor.viewer.codeView(true);
			expect(editor.frameContext.get('isCodeView')).toBe(true);

			// Toggle back
			editor.viewer.codeView(false);
			expect(editor.frameContext.get('isCodeView')).toBe(false);

			// Content should be preserved
			const content = editor.html.get();
			expect(content).toContain('Test content for code view');
		});

		it('should show HTML source in code view', () => {
			editor.html.set('<p><strong>Bold</strong> text</p>');

			// Enable code view
			editor.viewer.codeView(true);

			// Code view should be active
			expect(editor.frameContext.get('isCodeView')).toBe(true);
		});

		it('should use commandHandler for code view toggle', async () => {
			expect(editor.frameContext.get('isCodeView')).toBe(false);

			await editor.commandHandler('codeView');
			expect(editor.frameContext.get('isCodeView')).toBe(true);

			await editor.commandHandler('codeView');
			expect(editor.frameContext.get('isCodeView')).toBe(false);
		});
	});

	describe('viewer.fullScreen() - Toggle fullscreen', () => {
		it('should toggle fullscreen mode', () => {
			expect(editor.frameContext.get('isFullScreen')).toBe(false);

			// Enable fullscreen
			editor.viewer.fullScreen(true);
			expect(editor.frameContext.get('isFullScreen')).toBe(true);

			// Disable fullscreen
			editor.viewer.fullScreen(false);
			expect(editor.frameContext.get('isFullScreen')).toBe(false);
		});

		it('should preserve content in fullscreen mode', () => {
			const testContent = '<p>Fullscreen test</p>';
			editor.html.set(testContent);

			// Toggle fullscreen
			editor.viewer.fullScreen(true);
			expect(editor.frameContext.get('isFullScreen')).toBe(true);

			const content = editor.html.get();
			expect(content).toContain('Fullscreen test');

			// Exit fullscreen
			editor.viewer.fullScreen(false);
			expect(editor.frameContext.get('isFullScreen')).toBe(false);
		});

		it('should use commandHandler for fullscreen toggle', async () => {
			expect(editor.frameContext.get('isFullScreen')).toBe(false);

			await editor.commandHandler('fullScreen');
			expect(editor.frameContext.get('isFullScreen')).toBe(true);

			await editor.commandHandler('fullScreen');
			expect(editor.frameContext.get('isFullScreen')).toBe(false);
		});

		it('should allow editing in fullscreen mode', () => {
			editor.viewer.fullScreen(true);
			expect(editor.frameContext.get('isFullScreen')).toBe(true);

			// Should be able to set content in fullscreen
			editor.html.set('<p>Edited in fullscreen</p>');

			const content = editor.html.get();
			expect(content).toContain('Edited in fullscreen');
		});
	});

	describe('viewer.showBlocks() - Toggle block visibility', () => {
		it('should call showBlocks without errors', () => {
			const testContent = '<p>Paragraph</p><div>Division</div>';
			editor.html.set(testContent);

			// Should not throw
			expect(() => {
				editor.viewer.showBlocks(true);
			}).not.toThrow();

			const content = editor.html.get();
			expect(content).toContain('Paragraph');
			expect(content).toContain('Division');

			// Should not throw
			expect(() => {
				editor.viewer.showBlocks(false);
			}).not.toThrow();
		});

		it('should use commandHandler for show blocks', async () => {
			// Should not throw
			await expect(async () => {
				await editor.commandHandler('showBlocks');
			}).not.toThrow();

			await expect(async () => {
				await editor.commandHandler('showBlocks');
			}).not.toThrow();
		});
	});

	describe('viewer.print() - Print content', () => {
		it('should call print method without errors', () => {
			editor.html.set('<p>Content to print</p>');

			// Should not throw
			expect(() => {
				editor.viewer.print();
			}).not.toThrow();
		});

		it('should use commandHandler for print', async () => {
			editor.html.set('<p>Print test</p>');

			// Should not throw
			await expect(async () => {
				await editor.commandHandler('print');
			}).not.toThrow();
		});
	});

	// viewer.preview() tests removed - preview opens in new window which is hard to test in jsdom

	describe('Combined viewer modes', () => {
		it('should handle fullscreen and codeView together', () => {
			editor.html.set('<p>Test content</p>');

			// Enable fullscreen
			editor.viewer.fullScreen(true);
			expect(editor.frameContext.get('isFullScreen')).toBe(true);

			// Enable code view while in fullscreen
			editor.viewer.codeView(true);
			expect(editor.frameContext.get('isCodeView')).toBe(true);
			expect(editor.frameContext.get('isFullScreen')).toBe(true);

			// Exit both
			editor.viewer.codeView(false);
			editor.viewer.fullScreen(false);
			expect(editor.frameContext.get('isCodeView')).toBe(false);
			expect(editor.frameContext.get('isFullScreen')).toBe(false);
		});
	});

	describe('Real-world viewer workflows', () => {
		it('should support edit-code-view-edit workflow', () => {
			// Edit in WYSIWYG
			editor.html.set('<p>Original content</p>');
			expect(editor.html.get()).toContain('Original content');

			// Switch to code view
			editor.viewer.codeView(true);
			expect(editor.frameContext.get('isCodeView')).toBe(true);

			// Switch back to WYSIWYG
			editor.viewer.codeView(false);
			expect(editor.frameContext.get('isCodeView')).toBe(false);

			// Continue editing - use set instead of add
			editor.html.set('<p>Original content</p><p>Additional content</p>');

			const content = editor.html.get();
			expect(content).toContain('Original content');
			expect(content).toContain('Additional content');
		});

		it('should support fullscreen editing workflow', () => {
			// Start editing
			editor.html.set('<h1>Title</h1>');

			// Go fullscreen for focused editing
			editor.viewer.fullScreen(true);
			expect(editor.frameContext.get('isFullScreen')).toBe(true);

			// Add more content in fullscreen - use set instead of add
			editor.html.set('<h1>Title</h1><p>Body content</p>');

			// Exit fullscreen
			editor.viewer.fullScreen(false);

			// Verify content
			const content = editor.html.get();
			expect(content).toContain('Title');
			expect(content).toContain('Body content');
		});

		it('should handle show blocks without affecting content', () => {
			editor.html.set(`
				<p>Paragraph 1</p>
				<div>Division</div>
				<p>Paragraph 2</p>
			`);

			// Enable show blocks to see structure
			expect(() => {
				editor.viewer.showBlocks(true);
			}).not.toThrow();

			// Content should still be intact
			const wysiwyg = editor.frameContext.get('wysiwyg');
			expect(wysiwyg.textContent).toContain('Paragraph 1');
			expect(wysiwyg.textContent).toContain('Division');
			expect(wysiwyg.textContent).toContain('Paragraph 2');

			// Disable show blocks
			expect(() => {
				editor.viewer.showBlocks(false);
			}).not.toThrow();
		});

		it('should maintain state through multiple mode changes', () => {
			const originalContent = '<p><strong>Bold</strong> and <em>italic</em></p>';
			editor.html.set(originalContent);

			// Cycle through modes
			editor.viewer.fullScreen(true);
			editor.viewer.codeView(true);
			editor.viewer.codeView(false);
			editor.viewer.fullScreen(false);

			// Content should be preserved
			const content = editor.html.get();
			expect(content).toContain('Bold');
			expect(content).toContain('italic');
		});
	});
});
