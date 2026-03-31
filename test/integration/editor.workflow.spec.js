/**
 * @fileoverview Workflow tests for core/editor.js
 * These tests simulate real user interactions and browser behavior
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Core - Editor workflow Tests', () => {
	let editor;
	let container;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'w-editor-container';
		document.body.appendChild(container);

		editor = createTestEditor({ element: container, buttonList: [['codeView']] });
		await waitForEditorReady(editor);

		if (editor.$.ui) {
			editor.$.ui.showLoading = jest.fn();
			editor.$.ui.hideLoading = jest.fn();
			editor.$.ui.showToast = jest.fn();
			editor.$.ui.closeToast = jest.fn();
		}
		if (editor.$.viewer) {
			editor.$.viewer.print = jest.fn();
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
		it('should handle basic text input and history', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>Hello World</p>';
			editor.$.history.push(false);

			expect(wysiwyg.textContent).toContain('Hello World');
			expect(editor.isEmpty()).toBe(false);
		});

		it('should undo text deletion', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Delete me</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>Delete </p>';
			editor.$.history.push(false);

			await editor.$.commandDispatcher.run('undo');

			expect(wysiwyg.textContent).toContain('Delete me');
		});
	});

	describe('Direction change workflow', () => {
		it('should switch between LTR and RTL', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>مرحبا بالعالم</p>';

			await editor.$.commandDispatcher.run('dir_rtl');

			expect(editor.$.options.get('_rtl')).toBe(true);
			expect(wysiwyg.classList.contains('se-rtl')).toBe(true);

			await editor.$.commandDispatcher.run('dir_ltr');

			expect(editor.$.options.get('_rtl')).toBe(false);
			expect(wysiwyg.classList.contains('se-rtl')).toBe(false);
		});

		it('should preserve content when changing direction', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Hello World</p>';

			const originalContent = wysiwyg.textContent;

			editor.$.ui.setDir('rtl');
			editor.$.ui.setDir('ltr');

			expect(wysiwyg.textContent).toBe(originalContent);
		});
	});

	describe('View mode switching workflow', () => {
		it('should toggle code view', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Code view test</p>';

			await editor.$.commandDispatcher.run('codeView');
			expect(editor.$.frameContext.get('isCodeView')).toBe(true);

			await editor.$.commandDispatcher.run('codeView');
			expect(editor.$.frameContext.get('isCodeView')).toBe(false);
		});

		it('should toggle full screen', async () => {
			await editor.$.commandDispatcher.run('fullScreen');
			expect(editor.$.frameContext.get('isFullScreen')).toBe(true);

			await editor.$.commandDispatcher.run('fullScreen');
			expect(editor.$.frameContext.get('isFullScreen')).toBe(false);
		});

		it('should toggle show blocks', async () => {
			await editor.$.commandDispatcher.run('showBlocks');
			expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);

			await editor.$.commandDispatcher.run('showBlocks');
			expect(editor.$.frameContext.get('isShowBlocks')).toBe(false);
		});
	});

	describe('History workflow', () => {
		it('should handle newDocument command', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Content to clear</p>';

			await editor.$.commandDispatcher.run('newDocument');

			const defaultLine = editor.$.options.get('defaultLine');
			expect(wysiwyg.querySelector(defaultLine)).toBeTruthy();
		});
	});

	describe('Focus management workflow', () => {
		it('should handle focus and blur cycles', () => {
			editor.$.focusManager.focus();
			expect(editor.$.store.get('_preventBlur')).toBe(false);

			editor.$.focusManager.blur();

			editor.$.focusManager.focus();
			expect(editor.$.store.get('_preventBlur')).toBe(false);
		});
	});

	describe('Plugin interaction workflow', () => {
		it('should handle plugin registration and execution', () => {
			const MockPlugin = jest.fn(function (editor, options) {
				this.init = jest.fn();
				this.action = jest.fn();
			});
			MockPlugin.key = 'wPlugin';

			editor.$.plugins['wPlugin'] = MockPlugin;
			editor.$.pluginManager.register('wPlugin', null, {});

			expect(MockPlugin).toHaveBeenCalled();
		});

		it('should handle run method with plugin action', () => {
			const mockPlugin = {
				action: jest.fn()
			};
			editor.$.plugins['testAction'] = mockPlugin;

			const button = document.createElement('button');
			button.setAttribute('data-command', 'testAction');
			button.setAttribute('data-type', 'command');

			editor.$.commandDispatcher.run('testAction', 'command', button);

			expect(mockPlugin.action).toHaveBeenCalled();
		});
	});

	describe('Options update workflow', () => {
		it('should handle live options update', () => {
			editor.resetOptions({
				height: '450px',
				toolbar_hide: false
			});

			const newHeight = editor.$.frameContext.get('wysiwygFrame').style.height;
			expect(newHeight).toBe('450px');
		});

		it('should handle theme change', () => {
			jest.spyOn(editor.$.ui, 'setTheme');

			editor.resetOptions({ theme: 'custom-theme' });

			expect(editor.$.ui.setTheme).toHaveBeenCalledWith('custom-theme');
		});
	});

	describe('Error recovery workflow', () => {
		it('should recover from invalid selection', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test</p>';

			jest.spyOn(editor.$.selection, 'setRange').mockImplementationOnce(() => {
				throw new Error('Invalid range');
			});

			expect(() => {
				editor.$.focusManager.focus();
			}).not.toThrow();
		});
	});

	describe('Placeholder workflow', () => {
		it('should show/hide placeholder based on content', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			const placeholder = editor.$.frameContext.get('placeholder');

			if (!placeholder) return;

			wysiwyg.innerHTML = '<p><br></p>';
			Object.defineProperty(wysiwyg, 'innerText', {
				value: '\n',
				writable: true,
				configurable: true
			});
			editor.$.ui._updatePlaceholder(editor.$.frameContext);
			expect(placeholder.style.display).toBe('block');

			wysiwyg.innerHTML = '<p>Content</p>';
			editor.$.ui._updatePlaceholder(editor.$.frameContext);
			expect(placeholder.style.display).toBe('none');
		});
	});

	describe('Cleanup and destruction', () => {
		it('should clean up all resources on destroy', async () => {
			const testEditor = createTestEditor();
			await waitForEditorReady(testEditor);

			expect(testEditor.$.history).toBeDefined();
			expect(testEditor.$.eventManager).toBeDefined();

			const result = testEditor.destroy();

			expect(result).toBeNull();
		});
	});
});
