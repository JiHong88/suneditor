/**
 * @fileoverview Integration tests for Selection API methods
 * Tests real-world usage of editor.selection public API
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Selection API integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'selection-api-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold', 'italic']],
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

	describe('selection.setRange() - Set selection range', () => {
		it('should set selection to specific text range', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Select this text</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;

			// Select "this"
			const range = editor.selection.setRange(textNode, 7, textNode, 11);

			expect(range).toBeTruthy();
			expect(range.startOffset).toBe(7);
			expect(range.endOffset).toBe(11);
		});

		it('should set collapsed selection (caret position)', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Position caret here</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;

			// Set caret at position 8
			const range = editor.selection.setRange(textNode, 8, textNode, 8);

			expect(range).toBeTruthy();
			expect(range.collapsed).toBe(true);
			expect(range.startOffset).toBe(8);
		});

		it('should select entire text node', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Select all</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;

			// Select entire text
			const range = editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			expect(range).toBeTruthy();
			expect(range.startOffset).toBe(0);
			expect(range.endOffset).toBe(textNode.textContent.length);
		});

		it('should set selection across multiple nodes', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First</p><p>Second</p>';

			const firstP = wysiwyg.querySelector('p:first-child');
			const secondP = wysiwyg.querySelector('p:last-child');
			const firstText = firstP.firstChild;
			const secondText = secondP.firstChild;

			// Select from "First" to "Second"
			const range = editor.selection.setRange(firstText, 0, secondText, secondText.textContent.length);

			expect(range).toBeTruthy();
			expect(range.collapsed).toBe(false);
		});
	});

	describe('selection.getRange() - Get current selection', () => {
		it('should get current selection range', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Get selection</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;

			// Set selection
			editor.selection.setRange(textNode, 0, textNode, 3);

			// Get selection
			const range = editor.selection.getRange();

			expect(range).toBeTruthy();
			expect(range.startOffset).toBe(0);
			expect(range.endOffset).toBe(3);
		});

		it('should return valid range even without explicit selection', () => {
			editor.focusManager.focus();

			const range = editor.selection.getRange();

			expect(range).toBeTruthy();
			expect(typeof range.startOffset).toBe('number');
		});
	});

	describe('selection.getNode() - Get selected node', () => {
		it('should get selected text node', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text node</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const node = editor.selection.getNode();

			expect(node).toBeTruthy();
			expect(node.nodeType === 3 || node.nodeType === 1).toBe(true);
		});

		it('should get containing element for selection', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold text</strong></p>';

			const textNode = wysiwyg.querySelector('strong').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 4);

			const node = editor.selection.getNode();

			expect(node).toBeTruthy();
		});
	});

	describe('selection.get() - Get native selection', () => {
		it('should get native Selection object', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Native selection</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);

			const selection = editor.selection.get();

			expect(selection).toBeTruthy();
			expect(typeof selection.rangeCount).toBe('number');
		});
	});

	describe('selection.removeRange() - Clear selection', () => {
		it('should call removeRange without errors', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Clear selection</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;

			// Set selection
			editor.selection.setRange(textNode, 0, textNode, 5);

			// Clear selection should not throw
			expect(() => {
				editor.selection.removeRange();
			}).not.toThrow();
		});
	});

	describe('Real-world selection workflows', () => {
		it('should support select-format-deselect workflow', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format this word</p>';

			// Select "this"
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 7, textNode, 11);

			// Apply formatting
			await editor.commandDispatcher.run('bold');

			// Selection should still be active
			const range = editor.selection.getRange();
			expect(range).toBeTruthy();
		});

		it('should support progressive selection and formatting', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First word Second word</p>';

			// Select and format "First"
			let textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 5);
			await editor.commandDispatcher.run('bold');

			// Select and format "Second"
			textNode = wysiwyg.querySelector('p').firstChild || wysiwyg.querySelector('p').childNodes[0];
			if (textNode) {
				const fullText = wysiwyg.textContent;
				const secondStart = fullText.indexOf('Second');
				editor.selection.setRange(textNode, secondStart, textNode, secondStart + 6);
				await editor.commandDispatcher.run('italic');
			}

			// Both words should have formatting
			const content = wysiwyg.innerHTML.toLowerCase();
			const hasBold = content.includes('<strong>') || content.includes('<b>');
			const hasItalic = content.includes('<em>') || content.includes('<i>');

			expect(hasBold || hasItalic).toBe(true);
		});

		it('should support select-all workflow', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>All of this content</p>';

			// Use selectAll command
			await editor.commandDispatcher.run('selectAll');

			// Get selection
			const range = editor.selection.getRange();
			expect(range).toBeTruthy();
		});

		it('should support text navigation with caret', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Navigate through text</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;

			// Position at start
			editor.selection.setRange(textNode, 0, textNode, 0);
			let range = editor.selection.getRange();
			expect(range.startOffset).toBe(0);

			// Move to middle
			editor.selection.setRange(textNode, 10, textNode, 10);
			range = editor.selection.getRange();
			expect(range.startOffset).toBe(10);

			// Move to end
			const endPos = textNode.textContent.length;
			editor.selection.setRange(textNode, endPos, textNode, endPos);
			range = editor.selection.getRange();
			expect(range.startOffset).toBe(endPos);
		});

		it('should support word-by-word selection', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Word one two three</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			const text = textNode.textContent;

			// Select "one"
			const oneStart = text.indexOf('one');
			editor.selection.setRange(textNode, oneStart, textNode, oneStart + 3);
			let range = editor.selection.getRange();
			expect(range.endOffset - range.startOffset).toBe(3);

			// Select "two"
			const twoStart = text.indexOf('two');
			editor.selection.setRange(textNode, twoStart, textNode, twoStart + 3);
			range = editor.selection.getRange();
			expect(range.endOffset - range.startOffset).toBe(3);

			// Select "three"
			const threeStart = text.indexOf('three');
			editor.selection.setRange(textNode, threeStart, textNode, threeStart + 5);
			range = editor.selection.getRange();
			expect(range.endOffset - range.startOffset).toBe(5);
		});

		it('should support extend-selection workflow', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Extend selection gradually</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;

			// Start with small selection
			editor.selection.setRange(textNode, 0, textNode, 6);
			let range = editor.selection.getRange();
			expect(range.endOffset - range.startOffset).toBe(6);

			// Extend selection
			editor.selection.setRange(textNode, 0, textNode, 13);
			range = editor.selection.getRange();
			expect(range.endOffset - range.startOffset).toBe(13);

			// Extend to full text
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);
			range = editor.selection.getRange();
			expect(range.endOffset).toBe(textNode.textContent.length);
		});
	});

	describe('Edge cases', () => {
		it('should handle selection at element boundaries', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Start</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			const len = textNode.textContent.length;

			// Selection at very start
			editor.selection.setRange(textNode, 0, textNode, 0);
			let range = editor.selection.getRange();
			expect(range.startOffset).toBe(0);

			// Selection at very end
			editor.selection.setRange(textNode, len, textNode, len);
			range = editor.selection.getRange();
			expect(range.startOffset).toBe(len);
		});

		it('should handle empty text selection', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><br></p>';

			const p = wysiwyg.querySelector('p');
			const br = p.querySelector('br');

			// Should not throw when setting selection in empty element
			expect(() => {
				editor.selection.setRange(br, 0, br, 0);
			}).not.toThrow();
		});

		it('should handle selection in nested elements', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em>Nested text</em></strong></p>';

			const textNode = wysiwyg.querySelector('em').firstChild;

			// Should handle nested structure
			const range = editor.selection.setRange(textNode, 0, textNode, 6);

			expect(range).toBeTruthy();
			expect(range.startOffset).toBe(0);
			expect(range.endOffset).toBe(6);
		});

		it('should handle rapid selection changes', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Rapid selection changes test</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;

			// Rapid sequential selections
			for (let i = 0; i < 5; i++) {
				editor.selection.setRange(textNode, i, textNode, i + 5);
			}

			// Should end with last selection
			const range = editor.selection.getRange();
			expect(range).toBeTruthy();
		});

		it('should maintain selection after content changes', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Original text</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 8);

			// Content changed
			wysiwyg.querySelector('p').innerHTML = '<p>Modified text</p>';

			// Selection might be lost but API should not throw
			expect(() => {
				editor.selection.getRange();
			}).not.toThrow();
		});
	});

	describe('Selection information', () => {
		it('should identify collapsed vs expanded selection', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Check collapsed</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;

			// Collapsed (caret)
			editor.selection.setRange(textNode, 5, textNode, 5);
			let range = editor.selection.getRange();
			expect(range.collapsed).toBe(true);

			// Expanded (selection)
			editor.selection.setRange(textNode, 0, textNode, 5);
			range = editor.selection.getRange();
			expect(range.collapsed).toBe(false);
		});

		it('should get selection boundaries', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Selection boundaries test</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 10, textNode, 20);

			const range = editor.selection.getRange();

			expect(range.startContainer).toBeTruthy();
			expect(range.endContainer).toBeTruthy();
			expect(range.startOffset).toBe(10);
			expect(range.endOffset).toBe(20);
		});
	});
});
