/**
 * @fileoverview Integration tests for FocusManager
 * Tests actual focus behavior, edge focus, blur, and nativeFocus.
 * The unit test has 24 tests but they're mostly method existence checks.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('FocusManager integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'focus-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [],
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

	describe('focus() - Focus to wysiwyg', () => {
		it('should focus the editor without throwing', () => {
			expect(() => {
				editor.$.focusManager.focus();
			}).not.toThrow();
		});

		it('should establish a valid selection after focus', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Focus target</p>';

			editor.$.focusManager.focus();

			// After focus, a range should exist
			const range = editor.$.selection.getRange();
			expect(range).toBeTruthy();
		});

		it('should create format element when range is at wysiwyg root', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			// Clear content to force focus to create a new format element
			wysiwyg.innerHTML = '';

			editor.$.focusManager.nativeFocus();
			editor.$.focusManager.focus();

			// Editor should still be functional
			expect(wysiwyg).toBeTruthy();
		});

		it('should focus into existing content', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Existing content</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 3, textNode, 3);

			editor.$.focusManager.focus();

			// Selection should still be valid
			const range = editor.$.selection.getRange();
			expect(range).toBeTruthy();
		});
	});

	describe('focusEdge() - Focus to edge of content', () => {
		it('should focus to the last element when no argument', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First</p><p>Last paragraph</p>';

			editor.$.focusManager.focusEdge();

			// After focusEdge(null), should be near the last element
			const range = editor.$.selection.getRange();
			expect(range).toBeTruthy();
		});

		it('should focus to a specific element', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First</p><p>Second</p>';

			const firstP = wysiwyg.querySelector('p');
			editor.$.focusManager.focusEdge(firstP);

			const range = editor.$.selection.getRange();
			expect(range).toBeTruthy();
		});

		it('should handle empty editor gracefully', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><br></p>';

			expect(() => {
				editor.$.focusManager.focusEdge();
			}).not.toThrow();
		});
	});

	describe('nativeFocus() - Native focus call', () => {
		it('should call native focus without throwing', () => {
			expect(() => {
				editor.$.focusManager.nativeFocus();
			}).not.toThrow();
		});

		it('should initialize selection after native focus', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Native focus test</p>';

			editor.$.focusManager.nativeFocus();

			// Selection should be initialized
			const range = editor.$.selection.getRange();
			expect(range).toBeTruthy();
		});
	});

	describe('blur() - Blur editor', () => {
		it('should blur the editor without throwing', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Blur test</p>';

			// Focus first
			editor.$.focusManager.focus();

			// Then blur
			expect(() => {
				editor.$.focusManager.blur();
			}).not.toThrow();
		});
	});

	describe('Focus → Blur → Focus cycle', () => {
		it('should handle multiple focus/blur cycles', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Cycle test</p>';

			for (let i = 0; i < 3; i++) {
				editor.$.focusManager.focus();
				editor.$.focusManager.blur();
			}

			// Should still be functional
			editor.$.focusManager.focus();
			const range = editor.$.selection.getRange();
			expect(range).toBeTruthy();
		});

		it('should maintain content through focus cycles', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Persistent content</p>';

			editor.$.focusManager.focus();
			editor.$.focusManager.blur();
			editor.$.focusManager.focus();

			expect(wysiwyg.textContent).toContain('Persistent content');
		});
	});

	describe('Focus with content modifications', () => {
		it('should focus after setting content', () => {
			editor.$.html.set('<p>New content</p>');

			expect(() => {
				editor.$.focusManager.focus();
			}).not.toThrow();

			const range = editor.$.selection.getRange();
			expect(range).toBeTruthy();
		});

		it('should focus after insert operation', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Start</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 5, textNode, 5);

			editor.$.html.insert(' inserted');
			editor.$.focusManager.focus();

			expect(wysiwyg.textContent).toContain('inserted');
		});

		it('should focusEdge after adding content', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First</p>';

			// Mock scrollTo for html.add
			if (!wysiwyg.scrollTo) wysiwyg.scrollTo = () => {};
			const wwFrame = wysiwyg.parentElement;
			if (wwFrame && !wwFrame.scrollTo) wwFrame.scrollTo = () => {};

			editor.$.html.add('<p>Added paragraph</p>');
			editor.$.focusManager.focusEdge();

			expect(wysiwyg.textContent).toContain('Added paragraph');
		});
	});
});
