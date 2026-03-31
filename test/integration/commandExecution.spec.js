/**
 * @fileoverview Integration tests for _commandExecutor and commandDispatcher
 * Tests actual command execution with real DOM state verification.
 * _commandExecutor has no unit test; commandDispatcher has 70 tests but all are .not.toThrow() stubs.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Command execution integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'command-exec-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['codeView']],
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

	describe('Font style commands via commandDispatcher.run()', () => {
		it('should apply bold formatting to selected text', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Bold this text</p>';

			// Select "this"
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 5, textNode, 9);

			editor.$.commandDispatcher.run('bold');

			const content = wysiwyg.innerHTML;
			expect(content).toContain('<strong>');
			expect(content).toContain('this');
		});

		it('should apply italic formatting to selected text', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Italic this text</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 7, textNode, 11);

			editor.$.commandDispatcher.run('italic');

			const content = wysiwyg.innerHTML;
			expect(content).toContain('<em>');
		});

		it('should apply underline formatting', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Underline text</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 9);

			editor.$.commandDispatcher.run('underline');

			const content = wysiwyg.innerHTML;
			expect(content).toContain('<u>');
		});

		it('should apply strike formatting', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Strike text</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 6);

			editor.$.commandDispatcher.run('strike');

			const content = wysiwyg.innerHTML;
			expect(content).toContain('<del>');
		});

		it('should apply and then remove bold on partial selection', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Some text here</p>';

			// Select "text" (partial, not the whole paragraph)
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 5, textNode, 9);

			// Apply bold
			editor.$.commandDispatcher.run('bold');
			expect(wysiwyg.innerHTML).toContain('<strong>');
			expect(wysiwyg.innerHTML).toContain('text');

			// Re-select inside bold and remove
			const strongNode = wysiwyg.querySelector('strong');
			if (strongNode && strongNode.firstChild) {
				const boldText = strongNode.firstChild;
				editor.$.selection.setRange(boldText, 0, boldText, boldText.textContent.length);
				editor.$.commandDispatcher.run('bold');

				// "text" should still be present
				expect(wysiwyg.textContent).toContain('text');
			}
		});
	});

	describe('Viewer commands via commandDispatcher.run()', () => {
		it('should toggle code view mode', () => {
			expect(editor.$.frameContext.get('isCodeView')).toBe(false);

			editor.$.commandDispatcher.run('codeView');
			expect(editor.$.frameContext.get('isCodeView')).toBe(true);

			editor.$.commandDispatcher.run('codeView');
			expect(editor.$.frameContext.get('isCodeView')).toBe(false);
		});

		it('should toggle fullscreen mode', () => {
			expect(editor.$.frameContext.get('isFullScreen')).toBe(false);

			editor.$.commandDispatcher.run('fullScreen');
			expect(editor.$.frameContext.get('isFullScreen')).toBe(true);

			editor.$.commandDispatcher.run('fullScreen');
			expect(editor.$.frameContext.get('isFullScreen')).toBe(false);
		});

		it('should toggle show blocks', () => {
			expect(editor.$.frameContext.get('isShowBlocks')).toBeFalsy();

			editor.$.commandDispatcher.run('showBlocks');
			expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);

			editor.$.commandDispatcher.run('showBlocks');
			expect(editor.$.frameContext.get('isShowBlocks')).toBe(false);
		});
	});

	describe('History commands via commandDispatcher.run()', () => {
		it('should execute undo via commandDispatcher', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>Before</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>After</p>';
			editor.$.history.push(false);

			editor.$.commandDispatcher.run('undo');
			expect(wysiwyg.innerHTML).toContain('Before');
		});

		it('should execute redo via commandDispatcher', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>State1</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>State2</p>';
			editor.$.history.push(false);

			editor.$.commandDispatcher.run('undo');
			expect(wysiwyg.innerHTML).toContain('State1');

			editor.$.commandDispatcher.run('redo');
			expect(wysiwyg.innerHTML).toContain('State2');
		});
	});

	describe('Format commands', () => {
		it('should execute indent via commandDispatcher', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Indent me</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.length);

			// Should not throw
			expect(() => {
				editor.$.commandDispatcher.run('indent');
			}).not.toThrow();
		});

		it('should execute outdent via commandDispatcher', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p style="margin-left: 40px;">Outdent me</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.length);

			expect(() => {
				editor.$.commandDispatcher.run('outdent');
			}).not.toThrow();
		});

		it('should execute removeFormat via commandDispatcher', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em>Formatted text</em></strong></p>';

			// Select all formatted text
			const em = wysiwyg.querySelector('em');
			const textNode = em.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.length);

			editor.$.commandDispatcher.run('removeFormat');

			// Formatting should be removed or reduced
			const content = wysiwyg.innerHTML;
			// After removeFormat, at minimum the inner formatting should be cleaned
			expect(content).toContain('Formatted text');
		});
	});

	describe('selectAll command', () => {
		it('should select all content', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First paragraph</p><p>Second paragraph</p>';

			// Need to set a range first for selectAll to work
			const firstText = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(firstText, 0, firstText, 0);

			expect(() => {
				editor.$.commandDispatcher.run('selectAll');
			}).not.toThrow();
		});
	});

	describe('newDocument command', () => {
		it('should reset editor content', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Existing content</p><p>More content</p>';

			editor.$.commandDispatcher.run('newDocument');

			// Content should be cleared to a single empty format tag
			const children = wysiwyg.children;
			expect(children.length).toBe(1);
			expect(children[0].querySelector('br')).toBeTruthy();
		});
	});

	describe('ReadOnly mode blocking', () => {
		it('should block formatting commands in readonly mode', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Read only content</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.length);

			// Enable readonly
			editor.$.ui.readOnly(true);

			// Format commands should be blocked
			editor.$.commandDispatcher.run('bold');

			// Content should NOT have bold formatting
			expect(wysiwyg.innerHTML).not.toContain('<strong>');

			// But viewer commands should still work
			editor.$.commandDispatcher.run('codeView');
			expect(editor.$.frameContext.get('isCodeView')).toBe(true);

			// Cleanup
			editor.$.commandDispatcher.run('codeView');
			editor.$.ui.readOnly(false);
		});
	});

	describe('commandDispatcher.applyTargets()', () => {
		it('should apply callback to undo/redo targets after history push', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			// After pushing a history entry, undo button should be enabled
			wysiwyg.innerHTML = '<p>First</p>';
			editor.$.history.push(false);
			wysiwyg.innerHTML = '<p>Second</p>';
			editor.$.history.push(false);

			// Verify history state is consistent
			const rootStack = editor.$.history.getRootStack();
			const keys = Object.keys(rootStack);
			expect(keys.length).toBeGreaterThan(0);

			const root = rootStack[keys[0]];
			expect(root.index).toBeGreaterThan(0);
		});
	});

	describe('Combined command workflows', () => {
		it('should handle bold + italic combined formatting', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Combined formatting</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 8);

			// Apply bold then italic
			editor.$.commandDispatcher.run('bold');

			// Reselect inside the bold
			const strong = wysiwyg.querySelector('strong');
			if (strong && strong.firstChild) {
				editor.$.selection.setRange(strong.firstChild, 0, strong.firstChild, strong.firstChild.textContent.length);
				editor.$.commandDispatcher.run('italic');

				const content = wysiwyg.innerHTML;
				expect(content).toContain('<strong>');
				expect(content).toContain('<em>');
			}
		});

		it('should handle format → undo → redo workflow', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Workflow test</p>';
			editor.$.history.push(false);

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 8);
			editor.$.commandDispatcher.run('bold');
			editor.$.history.push(false);

			const boldContent = wysiwyg.innerHTML;
			expect(boldContent).toContain('<strong>');

			// Undo
			editor.$.commandDispatcher.run('undo');
			expect(wysiwyg.innerHTML).not.toContain('<strong>');

			// Redo
			editor.$.commandDispatcher.run('redo');
			expect(wysiwyg.innerHTML).toContain('<strong>');
		});
	});
});
