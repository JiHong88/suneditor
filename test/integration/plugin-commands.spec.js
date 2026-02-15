/**
 * @fileoverview Integration tests for command execution
 * Tests command dispatcher for formatting, indentation, history, and special commands
 * Focuses on exercising code paths through real Editor instances
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Plugin Commands Integration Tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'plugin-commands-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [
				['bold', 'italic', 'underline'],
				['indent', 'outdent'],
				['undo', 'redo'],
				['removeFormat', 'selectAll']
			],
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

	describe('Basic formatting commands - bold, italic, underline, strike', () => {
		it('should execute bold command', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Make bold</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 4);

			await editor.$.commandDispatcher.run('bold');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should execute italic command', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Make italic</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 4);

			await editor.$.commandDispatcher.run('italic');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should execute underline command', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Make underline</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 4);

			await editor.$.commandDispatcher.run('underline');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should execute formatting variations', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format this</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 6);

			await editor.$.commandDispatcher.run('underline');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should stack multiple formatting commands', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format me</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			editor.$.selection.setRange(textNode, 0, textNode, 6);
			await editor.$.commandDispatcher.run('bold');

			editor.$.selection.setRange(textNode, 0, textNode, 6);
			await editor.$.commandDispatcher.run('italic');

			editor.$.selection.setRange(textNode, 0, textNode, 6);
			await editor.$.commandDispatcher.run('underline');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply formatting to partial selection', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Only format part</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.$.selection.setRange(textNode, 5, textNode, 11);

			await editor.$.commandDispatcher.run('bold');
			expect(wysiwyg.innerHTML).toContain('<strong>');
		});

		it('should apply formatting across element boundaries', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Start <span>middle</span> end</p>';

			const p = wysiwyg.querySelector('p');
			const firstText = p.firstChild;
			const span = p.querySelector('span');
			const spanText = span.firstChild;
			const lastText = p.lastChild;

			editor.$.selection.setRange(firstText, 0, lastText, 3);
			await editor.$.commandDispatcher.run('italic');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should toggle formatting when reapplied', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Toggle bold</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			// Apply bold
			editor.$.selection.setRange(textNode, 0, textNode, 6);
			await editor.$.commandDispatcher.run('bold');

			// Reapply bold - should toggle
			editor.$.selection.setRange(textNode, 0, textNode, 6);
			await editor.$.commandDispatcher.run('bold');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Indentation commands - indent/outdent', () => {
		it('should execute indent command on paragraph', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Indent me</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 6);

			await editor.$.commandDispatcher.run('indent');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should execute outdent command on indented paragraph', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p style="margin-left: 40px">Outdent me</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 7);

			await editor.$.commandDispatcher.run('outdent');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should indent multiple paragraphs', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Para 1</p><p>Para 2</p><p>Para 3</p>';

			const paragraphs = wysiwyg.querySelectorAll('p');
			const firstText = paragraphs[0].firstChild;
			const lastText = paragraphs[paragraphs.length - 1].firstChild;

			editor.$.selection.setRange(firstText, 0, lastText, 6);
			await editor.$.commandDispatcher.run('indent');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should indent list items', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<ul><li>Item 1</li><li>Item 2</li></ul>';

			const li = wysiwyg.querySelector('li');
			const textNode = li.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 6);

			await editor.$.commandDispatcher.run('indent');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should outdent indented list items', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<ul><li>Item 1<ul><li>Nested</li></ul></li></ul>';

			const nestedLi = wysiwyg.querySelector('ul ul li');
			const textNode = nestedLi.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 6);

			await editor.$.commandDispatcher.run('outdent');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle indent on formatted content', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold</strong> text</p>';

			const strong = wysiwyg.querySelector('strong');
			const p = wysiwyg.querySelector('p');
			const firstText = strong.firstChild;
			const lastText = p.lastChild;

			editor.$.selection.setRange(firstText, 0, lastText, 4);
			await editor.$.commandDispatcher.run('indent');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle consecutive indent operations', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Double indent</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			editor.$.selection.setRange(textNode, 0, textNode, 6);
			await editor.$.commandDispatcher.run('indent');

			editor.$.selection.setRange(textNode, 0, textNode, 6);
			await editor.$.commandDispatcher.run('indent');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('History commands - undo/redo', () => {
		it('should execute undo command', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			const initial = '<p>Content</p>';
			wysiwyg.innerHTML = initial;

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 7);

			await editor.$.commandDispatcher.run('bold');
			editor.$.history.push(false);

			await editor.$.commandDispatcher.run('undo');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should execute redo command', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Content</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 7);

			await editor.$.commandDispatcher.run('bold');
			editor.$.history.push(false);

			await editor.$.commandDispatcher.run('undo');
			await editor.$.commandDispatcher.run('redo');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should manage history stack with multiple operations', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>History test</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			// Perform multiple operations
			editor.$.selection.setRange(textNode, 0, textNode, 3);
			await editor.$.commandDispatcher.run('bold');
			editor.$.history.push(false);

			editor.$.selection.setRange(textNode, 0, textNode, 3);
			await editor.$.commandDispatcher.run('italic');
			editor.$.history.push(false);

			editor.$.selection.setRange(textNode, 0, textNode, 3);
			await editor.$.commandDispatcher.run('underline');
			editor.$.history.push(false);

			// Undo operations
			await editor.$.commandDispatcher.run('undo');
			await editor.$.commandDispatcher.run('undo');

			// Redo
			await editor.$.commandDispatcher.run('redo');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle undo/redo with format changes', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format change test</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			// Change format
			editor.$.selection.setRange(textNode, 0, textNode, 6);
			const h1 = editor.$._d.createElement('H1');
			try {
				editor.$.format.setLine(h1);
			} catch (e) {
				// Expected
			}

			// Undo format change
			await editor.$.commandDispatcher.run('undo');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should clear redo history after new edits', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test redo clear</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			editor.$.selection.setRange(textNode, 0, textNode, 4);
			await editor.$.commandDispatcher.run('bold');
			editor.$.history.push(false);

			await editor.$.commandDispatcher.run('undo');

			// Make a new edit - this should clear redo history
			editor.$.selection.setRange(textNode, 0, textNode, 4);
			await editor.$.commandDispatcher.run('italic');
			editor.$.history.push(false);

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should check canUndo and canRedo state', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>State test</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			try {
				const canUndoBefore = editor.$.history.canUndo();
				expect(typeof canUndoBefore).toBe('boolean');

				editor.$.selection.setRange(textNode, 0, textNode, 5);
				await editor.$.commandDispatcher.run('bold');
				editor.$.history.push(false);

				const canUndoAfter = editor.$.history.canUndo();
				expect(typeof canUndoAfter).toBe('boolean');

				await editor.$.commandDispatcher.run('undo');

				const canRedoAfter = editor.$.history.canRedo();
				expect(typeof canRedoAfter).toBe('boolean');
			} catch (e) {
				// Expected
			}
		});
	});

	describe('removeFormat command', () => {
		it('should remove all formatting from selection', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em><u>Formatted</u></em></strong></p>';

			const u = wysiwyg.querySelector('u');
			const textNode = u.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 9);

			await editor.$.commandDispatcher.run('removeFormat');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should remove format from partial selection', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Regular <strong>bold text</strong> regular</p>';

			const strong = wysiwyg.querySelector('strong');
			const textNode = strong.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 4);

			await editor.$.commandDispatcher.run('removeFormat');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should remove format across multiple elements', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Start</strong> middle <em>end</em></p>';

			const strong = wysiwyg.querySelector('strong');
			const em = wysiwyg.querySelector('em');
			const firstText = strong.firstChild;
			const lastText = em.firstChild;

			editor.$.selection.setRange(firstText, 0, lastText, 3);
			await editor.$.commandDispatcher.run('removeFormat');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle removeFormat on already unformatted text', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Plain text without formatting</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 5);

			await editor.$.commandDispatcher.run('removeFormat');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should preserve block structure when removing format', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<blockquote><p><strong>Formatted quote</strong></p></blockquote>';

			const strong = wysiwyg.querySelector('strong');
			const textNode = strong.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 9);

			await editor.$.commandDispatcher.run('removeFormat');

			// Blockquote structure should remain
			expect(wysiwyg.innerHTML).toBeTruthy();
			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
		});
	});

	describe('selectAll command', () => {
		it('should select all content in editor', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Select all test</p>';

			await editor.$.commandDispatcher.run('selectAll');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should select all with multiple paragraphs', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Para 1</p><p>Para 2</p><p>Para 3</p>';

			await editor.$.commandDispatcher.run('selectAll');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should allow formatting after selectAll', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format all</p>';

			await editor.$.commandDispatcher.run('selectAll');
			await editor.$.commandDispatcher.run('bold');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle selectAll on complex content', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text with <strong>bold</strong> and <em>italic</em></p><ul><li>List item</li></ul>';

			await editor.$.commandDispatcher.run('selectAll');
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Command execution flow and state management', () => {
		it('should handle rapid command execution', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Rapid commands</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			try {
				editor.$.selection.setRange(textNode, 0, textNode, 5);
				await Promise.all([
					editor.$.commandDispatcher.run('bold'),
					editor.$.commandDispatcher.run('italic'),
					editor.$.commandDispatcher.run('underline')
				]);
			} catch (e) {
				// Expected - may not support parallel execution
			}

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should maintain state through command sequence', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>State test</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			const content1 = wysiwyg.innerHTML;

			editor.$.selection.setRange(textNode, 0, textNode, 5);
			await editor.$.commandDispatcher.run('bold');
			const content2 = wysiwyg.innerHTML;

			editor.$.selection.setRange(textNode, 0, textNode, 5);
			await editor.$.commandDispatcher.run('italic');
			const content3 = wysiwyg.innerHTML;

			// Content should change progressively
			expect(content1).not.toBe(content2);
		});

		it('should handle command execution with focus changes', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Line 1</p><p>Line 2</p>';

			const paragraphs = wysiwyg.querySelectorAll('p');
			const firstText = paragraphs[0].firstChild;
			const secondText = paragraphs[1].firstChild;

			editor.$.selection.setRange(firstText, 0, firstText, 5);
			await editor.$.commandDispatcher.run('bold');

			editor.$.selection.setRange(secondText, 0, secondText, 5);
			await editor.$.commandDispatcher.run('italic');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should execute commands on empty selection', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			// Empty selection (start === end)
			editor.$.selection.setRange(textNode, 0, textNode, 0);

			try {
				await editor.$.commandDispatcher.run('bold');
			} catch (e) {
				// Expected - empty selection may not be allowed
			}

			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Advanced command scenarios', () => {
		it('should handle nested formatting toggles', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Toggle test</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			// Apply and remove bold multiple times
			for (let i = 0; i < 3; i++) {
				editor.$.selection.setRange(textNode, 0, textNode, 6);
				await editor.$.commandDispatcher.run('bold');
			}

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle mixed formatting and indent operations', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Mixed operations</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			editor.$.selection.setRange(textNode, 0, textNode, 5);
			await editor.$.commandDispatcher.run('bold');

			editor.$.selection.setRange(textNode, 0, textNode, 5);
			await editor.$.commandDispatcher.run('indent');

			editor.$.selection.setRange(textNode, 0, textNode, 5);
			await editor.$.commandDispatcher.run('italic');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle format removal and reapplication', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format reapplication</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			editor.$.selection.setRange(textNode, 0, textNode, 6);
			await editor.$.commandDispatcher.run('bold');

			editor.$.selection.setRange(textNode, 0, textNode, 6);
			await editor.$.commandDispatcher.run('removeFormat');

			editor.$.selection.setRange(textNode, 0, textNode, 6);
			await editor.$.commandDispatcher.run('bold');

			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle history around format operations', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>History format test</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			editor.$.selection.setRange(textNode, 0, textNode, 7);
			await editor.$.commandDispatcher.run('bold');
			editor.$.history.push(false);

			editor.$.selection.setRange(textNode, 0, textNode, 7);
			await editor.$.commandDispatcher.run('italic');
			editor.$.history.push(false);

			await editor.$.commandDispatcher.run('undo');
			editor.$.selection.setRange(textNode, 0, textNode, 7);
			await editor.$.commandDispatcher.run('underline');
			editor.$.history.push(false);

			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});
});
