/**
 * @fileoverview Integration tests for history state management
 * Focuses on actual content state verification after undo/redo operations,
 * multi-edit sequences, and edge cases that the existing workflow tests don't cover.
 *
 * Bug regression: history.js had a bug where `root.value.splice(stackIndex + 1)`
 * used the global stackIndex on a per-root array instead of `root.index + 1`.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('History state verification tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'history-state-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [],
			width: '100%',
			height: 'auto',
			historyStackDelayTime: 0
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

	describe('Content state verification after undo', () => {
		it('should restore exact content after undo', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			// State 0: initial
			wysiwyg.innerHTML = '<p>Initial</p>';
			editor.$.history.push(false);

			// State 1: change to "Modified"
			wysiwyg.innerHTML = '<p>Modified</p>';
			editor.$.history.push(false);

			// Verify current state
			expect(wysiwyg.innerHTML).toContain('Modified');

			// Undo → should restore to "Initial"
			editor.$.history.undo();
			expect(wysiwyg.innerHTML).toContain('Initial');
			expect(wysiwyg.innerHTML).not.toContain('Modified');
		});

		it('should restore through multiple undo steps', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			// Push 3 states
			wysiwyg.innerHTML = '<p>State A</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>State B</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>State C</p>';
			editor.$.history.push(false);

			expect(wysiwyg.innerHTML).toContain('State C');

			// Undo once → State B
			editor.$.history.undo();
			expect(wysiwyg.innerHTML).toContain('State B');

			// Undo again → State A
			editor.$.history.undo();
			expect(wysiwyg.innerHTML).toContain('State A');
		});

		it('should redo correctly after undo', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>First</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>Second</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>Third</p>';
			editor.$.history.push(false);

			// Undo twice
			editor.$.history.undo();
			editor.$.history.undo();
			expect(wysiwyg.innerHTML).toContain('First');

			// Redo once → Second
			editor.$.history.redo();
			expect(wysiwyg.innerHTML).toContain('Second');

			// Redo again → Third
			editor.$.history.redo();
			expect(wysiwyg.innerHTML).toContain('Third');
		});
	});

	describe('History branching (undo then new edit)', () => {
		it('should discard redo stack when new edit happens after undo', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>Version 1</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>Version 2</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>Version 3</p>';
			editor.$.history.push(false);

			// Undo to Version 2
			editor.$.history.undo();
			expect(wysiwyg.innerHTML).toContain('Version 2');

			// Make new edit — should branch off, discarding Version 3
			wysiwyg.innerHTML = '<p>Version 2-alt</p>';
			editor.$.history.push(false);

			expect(wysiwyg.innerHTML).toContain('Version 2-alt');

			// Redo should do nothing (no future states)
			editor.$.history.redo();
			expect(wysiwyg.innerHTML).toContain('Version 2-alt');

			// Undo should go back to Version 2
			editor.$.history.undo();
			expect(wysiwyg.innerHTML).toContain('Version 2');
		});
	});

	describe('History pause/resume', () => {
		it('should not record changes while paused', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>Before pause</p>';
			editor.$.history.push(false);

			// Pause history
			editor.$.history.pause();

			// Changes during pause should not be recorded
			wysiwyg.innerHTML = '<p>During pause</p>';
			editor.$.history.push(false); // Should be ignored

			// Resume
			editor.$.history.resume();

			wysiwyg.innerHTML = '<p>After resume</p>';
			editor.$.history.push(false);

			// Undo should skip "During pause" and go to "Before pause"
			editor.$.history.undo();
			expect(wysiwyg.innerHTML).toContain('Before pause');
		});
	});

	describe('History reset', () => {
		it('should clear all history on reset', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>State 1</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>State 2</p>';
			editor.$.history.push(false);

			// Reset
			editor.$.history.reset();

			// Undo should not change content (no history)
			const contentBefore = wysiwyg.innerHTML;
			editor.$.history.undo();
			expect(wysiwyg.innerHTML).toBe(contentBefore);
		});
	});

	describe('History overwrite', () => {
		it('should overwrite current state without adding new entry', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>Original</p>';
			editor.$.history.push(false);

			wysiwyg.innerHTML = '<p>Changed</p>';
			editor.$.history.push(false);

			// Modify content and overwrite (not push)
			wysiwyg.innerHTML = '<p>Overwritten</p>';
			editor.$.history.overwrite();

			// Current should be "Overwritten"
			expect(wysiwyg.innerHTML).toContain('Overwritten');

			// Undo should go back to "Original" (not "Changed")
			editor.$.history.undo();
			expect(wysiwyg.innerHTML).toContain('Original');

			// Redo should go to "Overwritten" (the overwritten state, not "Changed")
			editor.$.history.redo();
			expect(wysiwyg.innerHTML).toContain('Overwritten');
		});
	});

	describe('getRootStack integrity', () => {
		it('should return root stack with correct structure', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>Content</p>';
			editor.$.history.push(false);

			const rootStack = editor.$.history.getRootStack();
			expect(rootStack).toBeDefined();
			expect(typeof rootStack).toBe('object');

			// Should have at least one root key
			const keys = Object.keys(rootStack);
			expect(keys.length).toBeGreaterThan(0);

			// Each root should have value array and index
			const root = rootStack[keys[0]];
			expect(Array.isArray(root.value)).toBe(true);
			expect(typeof root.index).toBe('number');
			expect(root.index).toBeGreaterThanOrEqual(0);

			// Each value entry should have content, s, e, frame
			const entry = root.value[root.index];
			expect(typeof entry.content).toBe('string');
			expect(entry.s).toBeDefined();
			expect(entry.e).toBeDefined();
			expect(entry.frame).toBeDefined();
		});
	});

	describe('Duplicate content prevention', () => {
		it('should not push duplicate content to stack', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>Same content</p>';
			editor.$.history.push(false);

			// Push same content again
			editor.$.history.push(false);

			const rootStack = editor.$.history.getRootStack();
			const keys = Object.keys(rootStack);
			const root = rootStack[keys[0]];

			// Should not have duplicate entries
			// (index should not have increased for same content)
			const lastIndex = root.index;
			editor.$.history.push(false);
			expect(root.index).toBe(lastIndex);
		});
	});

	describe('Rapid sequential operations', () => {
		it('should handle rapid push-undo-push cycles', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>Base</p>';
			editor.$.history.push(false);

			// Rapid sequence
			for (let i = 0; i < 5; i++) {
				wysiwyg.innerHTML = `<p>Edit ${i}</p>`;
				editor.$.history.push(false);
			}

			// Undo all
			for (let i = 0; i < 5; i++) {
				editor.$.history.undo();
			}
			expect(wysiwyg.innerHTML).toContain('Base');

			// Redo all
			for (let i = 0; i < 5; i++) {
				editor.$.history.redo();
			}
			expect(wysiwyg.innerHTML).toContain('Edit 4');
		});
	});
});
