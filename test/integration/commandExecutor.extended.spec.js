/**
 * @fileoverview Extended integration tests for _commandExecutor.js
 * Tests commands not covered by existing commandExecutor.spec.js
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

describe('CommandExecutor Extended Tests', () => {
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['bold', 'italic', 'underline', 'strike', 'codeView', 'fullScreen', 'showBlocks', 'print']],
		});
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('codeView command', () => {
		it('should toggle code view mode on', async () => {
			await editor.$.commandDispatcher.run('codeView');

			expect(editor.$.frameContext.get('isCodeView')).toBe(true);
		});

		it('should toggle code view mode off', async () => {
			await editor.$.commandDispatcher.run('codeView');
			await editor.$.commandDispatcher.run('codeView');

			expect(editor.$.frameContext.get('isCodeView')).toBe(false);
		});

		it('should show code area when toggling on', async () => {
			await editor.$.commandDispatcher.run('codeView');

			const codeArea = editor.$.frameContext.get('code');
			if (codeArea) {
				expect(codeArea.style.display).not.toBe('none');
			}
		});
	});

	describe('fullScreen command', () => {
		it('should toggle full screen mode on', async () => {
			await editor.$.commandDispatcher.run('fullScreen');

			expect(editor.$.frameContext.get('isFullScreen')).toBe(true);
		});

		it('should toggle full screen mode off', async () => {
			await editor.$.commandDispatcher.run('fullScreen');
			await editor.$.commandDispatcher.run('fullScreen');

			expect(editor.$.frameContext.get('isFullScreen')).toBe(false);
		});
	});

	describe('showBlocks command', () => {
		it('should toggle show blocks on', async () => {
			await editor.$.commandDispatcher.run('showBlocks');

			expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);
		});

		it('should add se-show-block class to wysiwyg', async () => {
			await editor.$.commandDispatcher.run('showBlocks');

			expect(wysiwyg.classList.contains('se-show-block')).toBe(true);
		});

		it('should toggle show blocks off', async () => {
			await editor.$.commandDispatcher.run('showBlocks');
			await editor.$.commandDispatcher.run('showBlocks');

			expect(editor.$.frameContext.get('isShowBlocks')).toBe(false);
			expect(wysiwyg.classList.contains('se-show-block')).toBe(false);
		});
	});

	describe('undo/redo commands', () => {
		it('should undo content change', async () => {
			wysiwyg.innerHTML = '<p>Original</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>Modified</p>';
			editor.$.history.push(false);

			await editor.$.commandDispatcher.run('undo');

			expect(wysiwyg.textContent).toContain('Original');
		});

		it('should redo after undo', async () => {
			wysiwyg.innerHTML = '<p>Original</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>Modified</p>';
			editor.$.history.push(false);

			await editor.$.commandDispatcher.run('undo');
			await editor.$.commandDispatcher.run('redo');

			expect(wysiwyg.textContent).toContain('Modified');
		});
	});

	describe('read-only mode prevention', () => {
		it('should not apply bold in read-only mode', async () => {
			wysiwyg.innerHTML = '<p>Read only text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 4);

			editor.$.frameContext.set('isReadOnly', true);

			await editor.$.commandDispatcher.run('bold');

			expect(wysiwyg.querySelector('strong')).toBeNull();
			editor.$.frameContext.set('isReadOnly', false);
		});
	});

	describe('newDocument command', () => {
		it('should clear content and reset to default line', async () => {
			wysiwyg.innerHTML = '<p>Some content to clear</p>';
			editor.$.history.push(false);

			await editor.$.commandDispatcher.run('newDocument');

			const defaultLine = editor.$.options.get('defaultLine');
			expect(wysiwyg.querySelector(defaultLine)).toBeTruthy();
			expect(wysiwyg.textContent.trim()).toBe('');
		});
	});

	describe('selectAll command', () => {
		it('should select all content in wysiwyg', async () => {
			wysiwyg.innerHTML = '<p>Line 1</p><p>Line 2</p><p>Line 3</p>';

			await editor.$.commandDispatcher.run('selectAll');

			const selection = editor.$.selection.get();
			const range = selection.getRangeAt(0);
			expect(range.commonAncestorContainer).toBe(wysiwyg);
		});
	});

	describe('removeFormat command', () => {
		it('should remove bold formatting', async () => {
			wysiwyg.innerHTML = '<p><strong>Bold text</strong></p>';
			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p, 0, p, 1);

			await editor.$.commandDispatcher.run('removeFormat');

			expect(wysiwyg.querySelectorAll('strong').length).toBe(0);
		});

		it('should remove multiple formatting tags', async () => {
			wysiwyg.innerHTML = '<p><strong><em>Bold Italic</em></strong></p>';
			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p, 0, p, 1);

			await editor.$.commandDispatcher.run('removeFormat');

			expect(wysiwyg.querySelectorAll('strong').length).toBe(0);
			expect(wysiwyg.querySelectorAll('em').length).toBe(0);
		});
	});
});
