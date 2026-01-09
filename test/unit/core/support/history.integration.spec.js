import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('History - Integration Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor, 15000);
	}, 20000);

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Real Editor Integration', () => {
		it('should create history instance with real editor', () => {
			expect(editor.core.history).toBeDefined();
			expect(typeof editor.core.history.push).toBe('function');
			expect(typeof editor.core.history.undo).toBe('function');
			expect(typeof editor.core.history.redo).toBe('function');
		});

		it('should push history when content changes', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			const initialContent = wysiwyg.innerHTML;

			// Change content
			wysiwyg.innerHTML = '<p>Changed content</p>';

			// Push history
			editor.core.history.push(false);

			// Undo should restore original content
			editor.core.history.undo();

			expect(wysiwyg.innerHTML).not.toBe('<p>Changed content</p>');
		});

		it('should handle undo/redo operations', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			const initialContent = wysiwyg.innerHTML;

			// Make first change
			wysiwyg.innerHTML = '<p>First change</p>';
			editor.core.history.push(false);

			// Make second change
			wysiwyg.innerHTML = '<p>Second change</p>';
			editor.core.history.push(false);

			// Undo should go to first change
			editor.core.history.undo();
			expect(wysiwyg.innerHTML).toBe('<p>First change</p>');

			// Undo again should go to initial
			editor.core.history.undo();
			expect(wysiwyg.innerHTML).toBe(initialContent);

			// Redo should go forward
			editor.core.history.redo();
			expect(wysiwyg.innerHTML).toBe('<p>First change</p>');
		});

		it('should handle delayed history push', (done) => {
			const wysiwyg = editor.context.get('wysiwyg');

			wysiwyg.innerHTML = '<p>Delayed change</p>';
			editor.core.history.push(true); // Push with delay

			setTimeout(() => {
				// History should be pushed after delay
				editor.core.history.undo();
				expect(wysiwyg.innerHTML).not.toBe('<p>Delayed change</p>');
				done();
			}, 500);
		});

		it('should update undo/redo buttons', () => {
			const undoButton = editor.commandDispatcher.targets.get('undo')?.[0];
			const redoButton = editor.commandDispatcher.targets.get('redo')?.[0];

			if (undoButton && redoButton) {
				// Initially should be disabled
				expect(undoButton.disabled).toBe(true);
				expect(redoButton.disabled).toBe(true);

				// After making change and pushing history
				const wysiwyg = editor.context.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Button test</p>';
				editor.core.history.push(false);

				// Undo should be enabled
				expect(undoButton.disabled).toBe(false);
				expect(redoButton.disabled).toBe(true);

				// After undo, redo should be enabled
				editor.core.history.undo();
				expect(undoButton.disabled).toBe(true);
				expect(redoButton.disabled).toBe(false);
			}
		});

		it('should handle pause and resume', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Pause history
			editor.core.history.pause();

			wysiwyg.innerHTML = '<p>Paused change</p>';
			editor.core.history.push(false);

			// Should not be able to undo when paused
			editor.core.history.undo();
			expect(wysiwyg.innerHTML).toBe('<p>Paused change</p>');

			// Resume and try again
			editor.core.history.resume();
			editor.core.history.push(false);
			editor.core.history.undo();
			expect(wysiwyg.innerHTML).not.toBe('<p>Paused change</p>');
		});

		it('should handle reset operation', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Make some changes
			wysiwyg.innerHTML = '<p>Change 1</p>';
			editor.core.history.push(false);
			wysiwyg.innerHTML = '<p>Change 2</p>';
			editor.core.history.push(false);

			// Reset history
			editor.core.history.reset();

			// Should not be able to undo after reset
			const initialContent = wysiwyg.innerHTML;
			editor.core.history.undo();
			expect(wysiwyg.innerHTML).toBe(initialContent);

			// Buttons should be disabled
			const undoButton = editor.commandDispatcher.targets.get('undo')?.[0];
			const redoButton = editor.commandDispatcher.targets.get('redo')?.[0];

			if (undoButton && redoButton) {
				expect(undoButton.disabled).toBe(true);
				expect(redoButton.disabled).toBe(true);
			}
		});

		it('should handle overwrite operation', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			wysiwyg.innerHTML = '<p>Original</p>';
			editor.core.history.push(false);

			wysiwyg.innerHTML = '<p>Modified</p>';
			editor.core.history.overwrite();

			// Undo should go to modified content, not original
			editor.core.history.undo();
			expect(wysiwyg.innerHTML).toBe('<p>Modified</p>');
		});
	});

	describe('Error handling', () => {
		it('should handle invalid operations gracefully', () => {
			expect(() => {
				editor.core.history.undo(); // No history to undo
			}).not.toThrow();

			expect(() => {
				editor.core.history.redo(); // No history to redo
			}).not.toThrow();

			expect(() => {
				editor.core.history.push(false, 'invalid-frame');
			}).not.toThrow();
		});

		it('should handle destruction', () => {
			const history = editor.core.history;

			history.destroy();

			expect(() => {
				history.getRootStack();
			}).toThrow();
		});
	});

	describe('Events', () => {
		it('should trigger onChange event', () => {
			const onChangeMock = jest.fn();
			editor.onChanged = onChangeMock;

			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Event test</p>';
			editor.core.history.push(false);

			// onChange should be called during history operations
			expect(onChangeMock).toHaveBeenCalled();
		});
	});
});