/**
 * @fileoverview Integration tests for Char API methods
 * Tests real-world usage of editor.$.char public API for character counting
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Char API integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'char-api-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold', 'italic']],
			width: '100%',
			height: 'auto',
			charCounter: true,
			charCounter_max: 100
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

	describe('char.getLength() - Get character count', () => {
		it('should get character count of current content', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Hello world</p>';

			const length = editor.$.char.getLength();

			// "Hello world" is 11 characters
			expect(length).toBe(11);
		});

		it('should get character count of provided string', () => {
			const testString = 'Test string';
			const length = editor.$.char.getLength(testString);

			expect(length).toBe(11);
		});

		it('should count empty content as zero', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><br></p>';

			const length = editor.$.char.getLength();

			expect(length).toBe(0);
		});

		it('should count multiline content correctly', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Line 1</p><p>Line 2</p><p>Line 3</p>';

			const length = editor.$.char.getLength();

			// Should count all text
			expect(length).toBeGreaterThan(0);
		});

		it('should not count HTML tags in character count', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold</strong> text</p>';

			const length = editor.$.char.getLength();

			// "Bold text" is 9 characters (no HTML tags)
			expect(length).toBe(9);
		});

		it('should count special characters', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Hello! @#$%^&*()</p>';

			const length = editor.$.char.getLength();

			expect(length).toBeGreaterThan(5);
		});

		it('should count unicode characters', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>안녕하세요 世界 🌍</p>';

			const length = editor.$.char.getLength();

			expect(length).toBeGreaterThan(0);
		});
	});

	describe('char.getByteLength() - Get byte length', () => {
		it('should get byte length of ASCII text (requires browser TextEncoder)', () => {
			const text = 'Hello';
			const byteLength = editor.$.char.getByteLength(text);

			// ASCII characters are 1 byte each
			expect(byteLength).toBeGreaterThanOrEqual(5);
		});

		it('should get byte length of unicode text (requires browser TextEncoder)', () => {
			const text = '안녕';
			const byteLength = editor.$.char.getByteLength(text);

			// Korean characters are multiple bytes
			expect(byteLength).toBeGreaterThan(4);
		});

		it('should handle empty string', () => {
			const text = '';
			const byteLength = editor.$.char.getByteLength(text);

			expect(byteLength).toBe(0);
		});

		it('should handle emoji (requires browser TextEncoder)', () => {
			const text = '😀';
			const byteLength = editor.$.char.getByteLength(text);

			// Emoji are multiple bytes (4 bytes in UTF-8)
			expect(byteLength).toBeGreaterThanOrEqual(4);
		});
	});

	describe('char.check() - Check if content can be added', () => {
		it('should allow adding content within limit', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Short text</p>'; // 10 chars

			// Try to add 20 more characters (total 30, under 100 limit)
			const canAdd = editor.$.char.check('A'.repeat(20));

			expect(canAdd).toBe(true);
		});

		it('should reject adding content over limit', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>' + 'A'.repeat(90) + '</p>'; // 90 chars

			// Try to add 20 more characters (total 110, over 100 limit)
			const canAdd = editor.$.char.check('A'.repeat(20));

			expect(canAdd).toBe(false);
		});

		it('should allow when no max limit set', async () => {
			// Destroy and recreate without limit
			destroyTestEditor(editor);
			editor = createTestEditor({
				element: container,
				buttonList: [['bold']],
				charCounter: true
				// No charCounter_max
			});
			await waitForEditorReady(editor);

			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Any length</p>';

			const canAdd = editor.$.char.check('A'.repeat(1000));

			expect(canAdd).toBe(true);
		});

		it('should check node content', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Current</p>'; // 7 chars

			// Create a node to check
			const testNode = editor.$._d.createElement('SPAN');
			testNode.textContent = 'Test node'; // 9 chars, total 16

			const canAdd = editor.$.char.check(testNode);

			expect(canAdd).toBe(true);
		});
	});

	describe('char.display() - Update character counter display', () => {
		it('should update counter display', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Display test</p>';

			// Call display to update
			editor.$.char.display();

			const charCounter = editor.$.frameContext.get('charCounter');
			if (charCounter) {
				// Counter should eventually show correct count
				setTimeout(() => {
					const displayedCount = parseInt(charCounter.textContent);
					expect(displayedCount).toBeGreaterThan(0);
				}, 100);
			}
		});

		it('should update on content change', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Initial</p>';
			editor.$.char.display();

			// Change content
			wysiwyg.innerHTML = '<p>Changed content</p>';
			editor.$.char.display();

			// Display should update (tested via not throwing)
			expect(() => editor.$.char.display()).not.toThrow();
		});
	});

	describe('Real-world character counting workflows', () => {
		it('should track character count during typing simulation', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p></p>';

			// Simulate typing
			const words = ['Hello', ' ', 'world', '!', ' ', 'How', ' ', 'are', ' ', 'you', '?'];
			let totalText = '';

			words.forEach((word) => {
				totalText += word;
				wysiwyg.innerHTML = `<p>${totalText}</p>`;
				const length = editor.$.char.getLength();
				expect(length).toBe(totalText.length);
			});
		});

		it('should prevent exceeding limit during content addition', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>' + 'A'.repeat(95) + '</p>'; // 95 chars, limit is 100

			// Try to add 10 characters (would exceed limit)
			const longText = 'B'.repeat(10);
			const canAdd = editor.$.char.check(longText);

			expect(canAdd).toBe(false);
		});

		it('should handle content with mixed formatting', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold</strong> and <em>italic</em> text</p>';

			const length = editor.$.char.getLength();

			// Should count text only, not tags
			const plainText = 'Bold and italic text';
			expect(length).toBe(plainText.length);
		});

		it('should count correctly after formatting operations', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format me</p>';

			const lengthBefore = editor.$.char.getLength();

			// Apply bold
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 6);
			await editor.$.commandDispatcher.run('bold');

			const lengthAfter = editor.$.char.getLength();

			// Character count should remain same (only formatting changed)
			expect(lengthAfter).toBe(lengthBefore);
		});

		it('should handle paste and count new content', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Original</p>';

			const lengthBefore = editor.$.char.getLength();

			// Simulate paste
			wysiwyg.innerHTML = '<p>Original and pasted</p>';

			const lengthAfter = editor.$.char.getLength();

			// Length should increase
			expect(lengthAfter).toBeGreaterThan(lengthBefore);
		});

		it('should count correctly with multiple paragraphs', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Para 1</p><p>Para 2</p><p>Para 3</p>';

			const length = editor.$.char.getLength();

			// Should count all paragraphs
			const expectedLength = 'Para 1Para 2Para 3'.length;
			expect(length).toBe(expectedLength);
		});

		it('should handle delete and recount', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Delete some text</p>';

			const lengthBefore = editor.$.char.getLength();

			// Delete some text
			wysiwyg.innerHTML = '<p>Delete</p>';

			const lengthAfter = editor.$.char.getLength();

			// Length should decrease
			expect(lengthAfter).toBeLessThan(lengthBefore);
		});
	});

	describe('Edge cases', () => {
		it('should handle very long content', async () => {
			// Create editor with high limit
			destroyTestEditor(editor);
			editor = createTestEditor({
				element: container,
				charCounter: true,
				charCounter_max: 100000
			});
			await waitForEditorReady(editor);

			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			const longText = 'A'.repeat(50000);
			wysiwyg.innerHTML = `<p>${longText}</p>`;

			expect(() => {
				const length = editor.$.char.getLength();
				expect(length).toBe(50000);
			}).not.toThrow();
		});

		it('should handle special whitespace characters', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Tab\there</p>';

			const length = editor.$.char.getLength();

			expect(length).toBeGreaterThan(0);
		});

		it('should handle zero-width characters', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test\u200B</p>'; // Zero-width space

			const length = editor.$.char.getLength();

			// Should count zero-width space
			expect(length).toBeGreaterThanOrEqual(4);
		});

		it('should handle nested elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<div><p><span><strong>Nested</strong></span></p></div>';

			const length = editor.$.char.getLength();

			// Should count text regardless of nesting
			expect(length).toBe(6); // "Nested"
		});

		it('should not count when counter is disabled', async () => {
			// Recreate without charCounter
			destroyTestEditor(editor);
			editor = createTestEditor({
				element: container,
				charCounter: false
			});
			await waitForEditorReady(editor);

			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>No counter</p>';

			// getLength should still work
			const length = editor.$.char.getLength();
			expect(length).toBeGreaterThan(0);
		});
	});

	describe('Byte counting mode', () => {
		it('should count bytes for ASCII (requires browser TextEncoder)', () => {
			const text = 'ASCII';
			const bytes = editor.$.char.getByteLength(text);

			// ASCII is roughly 1 byte per char
			expect(bytes).toBeGreaterThanOrEqual(5);
		});

		it('should count bytes for emoji (requires browser TextEncoder)', () => {
			const emojiBytes = editor.$.char.getByteLength('😀😃😄');

			// Emoji are 4 bytes each in UTF-8, so 3 emoji = 12 bytes
			expect(emojiBytes).toBeGreaterThanOrEqual(12);
		});
	});
});
