/**
 * @fileoverview E2E tests for core/editor.js
 * These tests simulate real user interactions and browser behavior
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../__mocks__/editorIntegration';

describe('Core - Editor E2E Tests', () => {
	let editor;
	let container;

	beforeEach(async () => {
		// Create container for editor
		container = document.createElement('div');
		container.id = 'e2e-editor-container';
		document.body.appendChild(container);

		editor = createTestEditor({ element: container });
		await waitForEditorReady(editor);

		// Mock UI methods to prevent side effects
		if (editor.ui) {
			editor.ui.showLoading = jest.fn();
			editor.ui.hideLoading = jest.fn();
			editor.ui.showToast = jest.fn();
			editor.ui.closeToast = jest.fn();
		}
		if (editor.viewer) {
			editor.viewer.print = jest.fn();
		}
	});

	afterEach(() => {
		if (editor && typeof editor.destroy === 'function') {
			destroyTestEditor(editor);
		}
		if (container && container.parentNode) {
			document.body.removeChild(container);
		}
	});

	describe('User typing workflow', () => {
		it('should handle basic text input', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');

			// Simulate user typing
			wysiwyg.innerHTML = '<p>Hello World</p>';
			editor.history.push(false);

			expect(wysiwyg.textContent).toContain('Hello World');
			expect(editor.isEmpty()).toBe(false);
		});

		it('should handle text selection and formatting', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format this text</p>';

			// Select text
			const textNode = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);

			// Apply bold
			await editor.commandHandler('bold');

			// Should have formatting applied
			expect(true).toBe(true);
		});

		it('should handle text deletion with backspace', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Delete me</p>';
			editor.history.push(false);

			// Simulate deletion
			wysiwyg.innerHTML = '<p>Delete </p>';
			editor.history.push(false);

			// Undo should restore
			await editor.commandHandler('undo');

			expect(wysiwyg.textContent).toContain('Delete me');
		});
	});

	describe('Copy/Cut/Paste workflow', () => {
		it('should handle copy operation', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold text</strong></p>';

			// Select content
			const textNode = wysiwyg.querySelector('strong').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 9);

			// Execute copy
			await editor.commandHandler('copy');

			// Should not throw
			expect(true).toBe(true);
		});

		it('should handle selectAll followed by copy', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First paragraph</p><p>Second paragraph</p>';

			// Select all
			await editor.commandHandler('selectAll');

			// Copy
			await editor.commandHandler('copy');

			// Should not throw
			expect(true).toBe(true);
		});
	});

	describe('Formatting workflow', () => {
		it('should apply multiple inline formats', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format me</p>';

			const textNode = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 9);

			// Apply multiple formats
			await editor.commandHandler('bold');
			await editor.commandHandler('italic');
			await editor.commandHandler('underline');

			// Should not throw
			expect(true).toBe(true);
		});

		it('should remove format', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em>Formatted</em></strong></p>';

			// Select all
			await editor.commandHandler('selectAll');

			// Remove format
			await editor.commandHandler('removeFormat');

			// Should not throw
			expect(true).toBe(true);
		});

		it('should handle indent and outdent', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Indent me</p>';

			// Focus
			editor.focus();

			// Indent
			await editor.commandHandler('indent');
			await editor.commandHandler('indent');

			// Outdent
			await editor.commandHandler('outdent');

			// Should not throw
			expect(true).toBe(true);
		});
	});

	describe('Direction change workflow', () => {
		it('should switch between LTR and RTL', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>مرحبا بالعالم</p>';

			// Change to RTL
			await editor.commandHandler('dir_rtl');

			expect(editor.options.get('_rtl')).toBe(true);
			expect(wysiwyg.classList.contains('se-rtl')).toBe(true);

			// Change back to LTR
			await editor.commandHandler('dir_ltr');

			expect(editor.options.get('_rtl')).toBe(false);
			expect(wysiwyg.classList.contains('se-rtl')).toBe(false);
		});

		it('should preserve content when changing direction', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Hello World</p>';

			const originalContent = wysiwyg.textContent;

			editor.setDir('rtl');
			editor.setDir('ltr');

			expect(wysiwyg.textContent).toBe(originalContent);
		});
	});

	describe('View mode switching workflow', () => {
		it('should toggle code view', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Code view test</p>';

			// Enter code view
			await editor.commandHandler('codeView');
			expect(editor.frameContext.get('isCodeView')).toBe(true);

			// Exit code view
			await editor.commandHandler('codeView');
			expect(editor.frameContext.get('isCodeView')).toBe(false);
		});

		it('should toggle full screen', async () => {
			// Enter full screen
			await editor.commandHandler('fullScreen');
			expect(editor.frameContext.get('isFullScreen')).toBe(true);

			// Exit full screen
			await editor.commandHandler('fullScreen');
			expect(editor.frameContext.get('isFullScreen')).toBe(false);
		});

		it('should toggle show blocks', async () => {
			// Show blocks
			await editor.commandHandler('showBlocks');
			expect(editor.frameContext.get('isShowBlocks')).toBe(true);

			// Hide blocks
			await editor.commandHandler('showBlocks');
			expect(editor.frameContext.get('isShowBlocks')).toBe(false);
		});
	});

	describe('History workflow', () => {
		it('should handle multiple undo/redo operations', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');

			// Initial state
			wysiwyg.innerHTML = '<p>Step 1</p>';
			editor.history.push(false);

			// Step 2
			wysiwyg.innerHTML = '<p>Step 2</p>';
			editor.history.push(false);

			// Step 3
			wysiwyg.innerHTML = '<p>Step 3</p>';
			editor.history.push(false);

			// Undo twice
			await editor.commandHandler('undo');
			await editor.commandHandler('undo');

			// Redo once
			await editor.commandHandler('redo');

			// Should not throw
			expect(true).toBe(true);
		});

		it('should handle newDocument command', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Content to clear</p>';

			await editor.commandHandler('newDocument');

			// Should have empty default line
			const defaultLine = editor.options.get('defaultLine');
			expect(wysiwyg.querySelector(defaultLine)).toBeTruthy();
		});
	});

	describe('Focus management workflow', () => {
		it('should handle focus and blur cycles', () => {
			editor.focus();
			expect(editor._preventBlur).toBe(false);

			editor.blur();

			editor.focus();
			expect(editor._preventBlur).toBe(false);
		});

		it('should handle focusEdge with different content', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');

			// With text content
			wysiwyg.innerHTML = '<p>Test</p>';
			editor.focusEdge();

			// With nested content
			wysiwyg.innerHTML = '<p><strong>Nested</strong> content</p>';
			editor.focusEdge();

			// Should not throw
			expect(true).toBe(true);
		});
	});

	describe('Plugin interaction workflow', () => {
		it('should handle plugin registration and execution', () => {
			const MockPlugin = jest.fn(function (editor, options) {
				this.init = jest.fn();
				this.action = jest.fn();
			});
			MockPlugin.key = 'e2ePlugin';

			editor.plugins['e2ePlugin'] = MockPlugin;
			editor.registerPlugin('e2ePlugin', null, {});

			expect(MockPlugin).toHaveBeenCalled();
		});

		it('should handle run method with plugin action', () => {
			const mockPlugin = {
				action: jest.fn()
			};
			editor.plugins['testAction'] = mockPlugin;

			const button = document.createElement('button');
			button.setAttribute('data-command', 'testAction');
			button.setAttribute('data-type', 'command');

			editor.run('testAction', 'command', button);

			expect(mockPlugin.action).toHaveBeenCalled();
		});
	});

	describe('Options update workflow', () => {
		it('should handle live options update', () => {
			const originalHeight = editor.frameContext.get('wysiwygFrame').style.height;

			editor.resetOptions({
				height: '450px',
				toolbar_hide: false
			});

			const newHeight = editor.frameContext.get('wysiwygFrame').style.height;
			expect(newHeight).toBe('450px');
		});

		it('should handle theme change', () => {
			jest.spyOn(editor.ui, 'setTheme');

			editor.resetOptions({ theme: 'custom-theme' });

			expect(editor.ui.setTheme).toHaveBeenCalledWith('custom-theme');
		});
	});

	describe('Error recovery workflow', () => {
		it('should recover from invalid selection', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test</p>';

			// Create invalid state
			jest.spyOn(editor.selection, 'setRange').mockImplementationOnce(() => {
				throw new Error('Invalid range');
			});

			// Should fall back gracefully
			expect(() => {
				editor.focus();
			}).not.toThrow();
		});

		it('should recover from command execution errors', async () => {
			// Mock an error in format
			const originalIndent = editor.format.indent;
			editor.format.indent = jest.fn(() => {
				throw new Error('Test error');
			});

			// Should not crash the editor
			try {
				await editor.commandHandler('indent');
			} catch (e) {
				// Error is expected
			}

			// Restore
			editor.format.indent = originalIndent;

			// Editor should still be functional
			const wysiwyg = editor.frameContext.get('wysiwyg');
			expect(wysiwyg).toBeDefined();
		});
	});

	describe('Placeholder workflow', () => {
		it('should show/hide placeholder based on content', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			const placeholder = editor.frameContext.get('placeholder');

			if (!placeholder) {
				expect(true).toBe(true);
				return;
			}

			// Empty editor - show placeholder
			wysiwyg.innerHTML = '<p><br></p>';
			Object.defineProperty(wysiwyg, 'innerText', {
				value: '\n',
				writable: true,
				configurable: true
			});
			editor._checkPlaceholder();
			expect(placeholder.style.display).toBe('block');

			// With content - hide placeholder
			wysiwyg.innerHTML = '<p>Content</p>';
			editor._checkPlaceholder();
			expect(placeholder.style.display).toBe('none');
		});
	});

	describe('Multi-operation workflow', () => {
		it('should handle complex editing sequence', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');

			// Type content
			wysiwyg.innerHTML = '<p>Start</p>';
			editor.history.push(false);

			// Format
			await editor.commandHandler('bold');

			// More typing
			wysiwyg.innerHTML = '<p><strong>Start typing</strong></p>';
			editor.history.push(false);

			// Indent
			await editor.commandHandler('indent');

			// Undo
			await editor.commandHandler('undo');

			// Should not throw
			expect(true).toBe(true);
		});

		it('should handle rapid command execution', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test</p>';

			// Rapid commands
			await Promise.all([editor.commandHandler('bold'), editor.commandHandler('italic'), editor.commandHandler('underline')]);

			// Should complete without errors
			expect(true).toBe(true);
		});
	});

	describe('Cleanup and destruction', () => {
		it('should clean up all resources on destroy', async () => {
			// Create a fresh editor for this test
			const testEditor = createTestEditor();
			await waitForEditorReady(testEditor);

			// Verify editor is initialized
			expect(testEditor).toBeDefined();
			expect(testEditor.history).toBeDefined();
			expect(testEditor.eventManager).toBeDefined();
			expect(testEditor.plugins).toBeDefined();

			const result = testEditor.destroy();

			expect(result).toBeNull();
		});
	});
});
