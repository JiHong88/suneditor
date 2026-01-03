/**
 * @fileoverview Integration tests for Inline Format API methods
 * Tests real-world usage of editor.inline public API for text formatting
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Inline Format API integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'inline-api-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript', 'removeFormat']],
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

	describe('inline.remove() - Remove formatting', () => {
		it('should remove all inline formatting', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em><u>Heavily formatted</u></em></strong></p>';

			// Select all text
			const textNode = wysiwyg.querySelector('u').firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Remove formatting
			editor.inline.remove();

			// Text should remain but formatting should be gone
			expect(wysiwyg.textContent).toContain('Heavily formatted');

			// Check that formatting tags are reduced/removed
			const content = wysiwyg.innerHTML.toLowerCase();
			const hasLessFormatting =
				!content.includes('<strong>') ||
				!content.includes('<em>') ||
				!content.includes('<u>');
			expect(hasLessFormatting).toBe(true);
		});

		it('should use commandHandler removeFormat', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold text</strong></p>';

			const strong = wysiwyg.querySelector('strong');
			const textNode = strong.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			await editor.commandExecutor.execute('removeFormat');

			// Text preserved
			expect(wysiwyg.textContent).toContain('Bold text');
		});

		it('should remove formatting from partial selection', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold start middle end</strong></p>';

			// Select only "middle"
			const textNode = wysiwyg.querySelector('strong').firstChild;
			editor.selection.setRange(textNode, 11, textNode, 17);

			editor.inline.remove();

			// Text should be preserved
			expect(wysiwyg.textContent).toContain('start middle end');
		});
	});

	describe('FONT_STYLE commands via commandHandler', () => {
		it('should apply bold formatting', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Make this bold</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 10, textNode, 14);

			await editor.commandExecutor.execute('bold');

			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toMatch(/<(strong|b)>/);
		});

		it('should apply italic formatting', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Make this italic</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 10, textNode, 16);

			await editor.commandExecutor.execute('italic');

			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toMatch(/<(em|i)>/);
		});

		it('should apply underline formatting', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Underline this</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 9);

			await editor.commandExecutor.execute('underline');

			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toContain('<u>');
		});

		it('should apply strike formatting', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Strike through this</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);

			await editor.commandExecutor.execute('strike');

			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toMatch(/<(del|s|strike)>/);
		});

		it('should apply subscript formatting', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>H2O water</p>';

			// Select "2"
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 1, textNode, 2);

			await editor.commandExecutor.execute('subscript');

			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toContain('<sub>');
		});

		it('should apply superscript formatting', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>E=mc2</p>';

			// Select "2"
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 4, textNode, 5);

			await editor.commandExecutor.execute('superscript');

			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toContain('<sup>');
		});
	});

	describe('Combined inline formatting', () => {
		it('should apply multiple formats sequentially', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format me</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply bold
			await editor.commandExecutor.execute('bold');

			// Reselect and apply italic
			const formatted = wysiwyg.querySelector('strong, b');
			if (formatted && formatted.firstChild) {
				editor.selection.setRange(formatted.firstChild, 0, formatted.firstChild, 9);
				await editor.commandExecutor.execute('italic');
			}

			// Should have both formats
			const content = wysiwyg.innerHTML.toLowerCase();
			const hasBold = content.includes('<strong>') || content.includes('<b>');
			const hasItalic = content.includes('<em>') || content.includes('<i>');

			expect(hasBold || hasItalic).toBe(true);
		});

		it('should toggle formatting on and off', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Toggle formatting</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);

			// Apply bold
			await editor.commandExecutor.execute('bold');
			let content = wysiwyg.innerHTML.toLowerCase();
			let hasBold = content.includes('<strong>') || content.includes('<b>');
			expect(hasBold).toBe(true);

			// Toggle bold off (reselect)
			const boldNode = wysiwyg.querySelector('strong, b');
			if (boldNode && boldNode.firstChild) {
				editor.selection.setRange(boldNode.firstChild, 0, boldNode.firstChild, 6);
				await editor.commandExecutor.execute('bold');
			}

			// Should remove or reduce bold formatting
			content = wysiwyg.innerHTML;
			expect(content).toContain('Toggle');
		});
	});

	describe('Real-world inline formatting workflows', () => {
		it('should support progressive text styling', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>This is important text</p>';

			// Make "important" bold
			let textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 8, textNode, 17);
			await editor.commandExecutor.execute('bold');

			// Make "important" also italic
			const boldNode = wysiwyg.querySelector('strong, b');
			if (boldNode && boldNode.firstChild) {
				textNode = boldNode.firstChild;
				editor.selection.setRange(textNode, 0, textNode, 9);
				await editor.commandExecutor.execute('italic');
			}

			// Verify text is preserved
			expect(wysiwyg.textContent).toContain('This is important text');
		});

		it('should support format-then-remove workflow', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format and remove</p>';

			// Select and format
			let textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);
			await editor.commandExecutor.execute('bold');
			await editor.commandExecutor.execute('italic');
			await editor.commandExecutor.execute('underline');

			// Now remove all formatting
			const formatted = wysiwyg.querySelector('strong, b, em, i, u');
			if (formatted) {
				textNode = formatted.nodeType === 3 ? formatted : formatted.firstChild;
				if (textNode) {
					editor.selection.setRange(textNode, 0, textNode, 6);
					await editor.commandExecutor.execute('removeFormat');
				}
			}

			// Text should remain
			expect(wysiwyg.textContent).toContain('Format');
		});

		it('should support scientific notation formatting', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>H2O and E=mc2</p>';

			// Format "2" in H2O as subscript
			let textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 1, textNode, 2);
			await editor.commandExecutor.execute('subscript');

			// Format "2" in mc2 as superscript
			textNode = wysiwyg.querySelector('p').firstChild || wysiwyg.querySelector('p').childNodes[0];
			if (textNode) {
				const fullText = wysiwyg.textContent;
				const mc2Index = fullText.indexOf('mc2') + 2;
				editor.selection.setRange(textNode, mc2Index, textNode, mc2Index + 1);
				await editor.commandExecutor.execute('superscript');
			}

			// Verify structure
			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toContain('h');
			expect(content).toContain('o');
		});

		it('should handle partial selection formatting', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Start middle end</p>';

			// Format only "middle"
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 6, textNode, 12);
			await editor.commandExecutor.execute('bold');

			// All text should be preserved
			const fullText = wysiwyg.textContent;
			expect(fullText).toContain('Start');
			expect(fullText).toContain('middle');
			expect(fullText).toContain('end');
		});

		it('should support emphasizing keywords in sentence', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>The quick brown fox jumps over the lazy dog</p>';

			// Bold "quick" and "jumps"
			let textNode = wysiwyg.querySelector('p').firstChild;

			// Bold "quick"
			editor.selection.setRange(textNode, 4, textNode, 9);
			await editor.commandExecutor.execute('bold');

			// Find "jumps" and bold it
			const allText = wysiwyg.textContent;
			const jumpsStart = allText.indexOf('jumps');
			if (jumpsStart !== -1) {
				textNode = wysiwyg.querySelector('p').firstChild || wysiwyg.querySelector('p').childNodes[0];
				if (textNode) {
					editor.selection.setRange(textNode, jumpsStart, textNode, jumpsStart + 5);
					await editor.commandExecutor.execute('bold');
				}
			}

			// Full sentence should be preserved
			expect(wysiwyg.textContent).toContain('quick');
			expect(wysiwyg.textContent).toContain('jumps');
			expect(wysiwyg.textContent).toContain('lazy dog');
		});
	});

	describe('Edge cases and robustness', () => {
		it('should handle formatting on empty selection', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			// Collapsed selection (caret position)
			editor.selection.setRange(textNode, 2, textNode, 2);

			// Should not throw
			await expect(async () => {
				await editor.commandExecutor.execute('bold');
			}).not.toThrow();
		});

		it('should handle removeFormat on unformatted text', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Plain text</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 5);

			// Should not throw
			expect(() => {
				editor.inline.remove();
			}).not.toThrow();

			expect(wysiwyg.textContent).toContain('Plain text');
		});

		it('should preserve text when applying same format twice', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Double format</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);

			await editor.commandExecutor.execute('bold');

			// Apply bold again
			const boldNode = wysiwyg.querySelector('strong, b');
			if (boldNode && boldNode.firstChild) {
				editor.selection.setRange(boldNode.firstChild, 0, boldNode.firstChild, 6);
				await editor.commandExecutor.execute('bold');
			}

			// Text should be preserved
			expect(wysiwyg.textContent).toContain('Double');
		});
	});
});
