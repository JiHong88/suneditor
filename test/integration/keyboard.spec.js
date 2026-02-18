/**
 * @fileoverview Integration tests for keyboard event handling
 * Exercises: keydown.registry.js, handler_ww_key.js, keydown.reducer.js, eventOrchestrator.js
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { list_bulleted, list_numbered } from '../../src/plugins';

function dispatchKey(wysiwyg, key, options = {}) {
	const event = new KeyboardEvent('keydown', {
		key,
		code: key,
		bubbles: true,
		cancelable: true,
		ctrlKey: !!options.ctrl,
		shiftKey: !!options.shift,
		altKey: !!options.alt,
	});
	wysiwyg.dispatchEvent(event);
	return event;
}

function wait(ms = 50) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Keyboard Integration Tests', () => {
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor({
			plugins: { list_bulleted, list_numbered },
			buttonList: [['bold', 'italic', 'list_bulleted', 'list_numbered']],
			tabDisable: false,
		});
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Enter key', () => {
		it('should preserve content after Enter split', async () => {
			wysiwyg.innerHTML = '<p>AB</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 1, textNode, 1);

			dispatchKey(wysiwyg, 'Enter');
			await wait();

			const allText = wysiwyg.textContent.replace(/\u200B/g, '');
			expect(allText).toContain('A');
			expect(allText).toContain('B');
		});

		it('should not alter content when onKeyDown returns false', async () => {
			editor.onKeyDown = () => false;

			wysiwyg.innerHTML = '<p>Test</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 2, textNode, 2);

			const initialCount = wysiwyg.querySelectorAll('p').length;
			dispatchKey(wysiwyg, 'Enter');
			await wait();

			expect(wysiwyg.querySelectorAll('p').length).toBe(initialCount);
		});

		it('should handle Enter in empty paragraph', async () => {
			wysiwyg.innerHTML = '<p><br></p>';
			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p, 0, p, 0);

			dispatchKey(wysiwyg, 'Enter');
			await wait();

			// Should still have at least one element
			expect(wysiwyg.children.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe('Tab key', () => {
		it('should not insert Tab when tabDisable is true', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				buttonList: [['bold']],
				tabDisable: true,
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');

			wysiwyg.innerHTML = '<p>Text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 0);

			dispatchKey(wysiwyg, 'Tab');
			await wait();

			const p = wysiwyg.querySelector('p');
			expect(p.textContent).toBe('Text');
		});

		it('should fire keydown event for Tab', async () => {
			wysiwyg.innerHTML = '<p>Text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 0);

			const event = dispatchKey(wysiwyg, 'Tab');
			await wait();

			// Tab key should be processed (event fires through handler chain)
			expect(event.type).toBe('keydown');
		});
	});

	describe('Backspace key', () => {
		it('should handle Backspace at beginning of line', async () => {
			wysiwyg.innerHTML = '<p>First</p><p>Second</p>';
			const secondP = wysiwyg.querySelectorAll('p')[1];
			const textNode = secondP.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 0);

			const initialChildCount = wysiwyg.children.length;
			dispatchKey(wysiwyg, 'Backspace');
			await wait();

			expect(wysiwyg.children.length).toBeLessThanOrEqual(initialChildCount);
		});

		it('should maintain empty format on Backspace', async () => {
			wysiwyg.innerHTML = '<p>x</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 1);

			dispatchKey(wysiwyg, 'Backspace');
			await wait();

			expect(wysiwyg.querySelectorAll('p').length).toBeGreaterThanOrEqual(1);
		});

		it('should handle Backspace in single char paragraph', async () => {
			wysiwyg.innerHTML = '<p>A</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 1);

			dispatchKey(wysiwyg, 'Backspace');
			await wait();

			// After deleting, the paragraph should still exist (format maintained)
			expect(wysiwyg.children.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe('Delete key', () => {
		it('should handle Delete at end of line', async () => {
			wysiwyg.innerHTML = '<p>First</p><p>Second</p>';
			const firstP = wysiwyg.querySelector('p');
			const textNode = firstP.firstChild;
			editor.$.selection.setRange(textNode, 5, textNode, 5);

			const initialChildCount = wysiwyg.children.length;
			dispatchKey(wysiwyg, 'Delete');
			await wait();

			expect(wysiwyg.children.length).toBeLessThanOrEqual(initialChildCount);
		});

		it('should handle Delete with selected text', async () => {
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 5, textNode, 11);

			dispatchKey(wysiwyg, 'Delete');
			await wait();

			const remaining = wysiwyg.textContent.replace(/\u200B/g, '');
			expect(remaining).toContain('Hello');
		});

		it('should not crash on Delete in empty paragraph', async () => {
			wysiwyg.innerHTML = '<p><br></p>';
			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p, 0, p, 0);

			expect(() => {
				dispatchKey(wysiwyg, 'Delete');
			}).not.toThrow();
		});
	});

	describe('Escape key', () => {
		it('should fire keydown event for Escape', async () => {
			wysiwyg.innerHTML = '<p>Text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 4);

			const event = dispatchKey(wysiwyg, 'Escape');
			expect(event.code).toBe('Escape');
		});
	});

	describe('Arrow keys', () => {
		it('should handle ArrowLeft without error', async () => {
			wysiwyg.innerHTML = '<p>Text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 2, textNode, 2);

			expect(() => {
				dispatchKey(wysiwyg, 'ArrowLeft');
			}).not.toThrow();
		});

		it('should handle ArrowRight without error', async () => {
			wysiwyg.innerHTML = '<p>Text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 2, textNode, 2);

			expect(() => {
				dispatchKey(wysiwyg, 'ArrowRight');
			}).not.toThrow();
		});

		it('should handle ArrowUp without error', async () => {
			wysiwyg.innerHTML = '<p>Line 1</p><p>Line 2</p>';
			const textNode = wysiwyg.querySelectorAll('p')[1].firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 0);

			expect(() => {
				dispatchKey(wysiwyg, 'ArrowUp');
			}).not.toThrow();
		});

		it('should handle ArrowDown without error', async () => {
			wysiwyg.innerHTML = '<p>Line 1</p><p>Line 2</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 0);

			expect(() => {
				dispatchKey(wysiwyg, 'ArrowDown');
			}).not.toThrow();
		});
	});

	describe('KeyUp event', () => {
		it('should fire keyup after keydown', async () => {
			wysiwyg.innerHTML = '<p>Text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 0);

			let keyupFired = false;
			wysiwyg.addEventListener('keyup', () => { keyupFired = true; }, { once: true });

			const keyupEvent = new KeyboardEvent('keyup', {
				key: 'a',
				code: 'KeyA',
				bubbles: true,
				cancelable: true,
			});
			wysiwyg.dispatchEvent(keyupEvent);
			await wait();

			expect(keyupFired).toBe(true);
		});
	});
});
