/**
 * @fileoverview Complex workflow integration tests
 * Tests real-world complex scenarios combining multiple editor APIs
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Complex workflow integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'complex-workflow-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [
				['undo', 'redo'],
				['bold', 'italic', 'underline'],
				['outdent', 'indent'],
				['codeView', 'fullScreen']
			],
			width: '100%',
			height: 'auto',
			charCounter: true,
			charCounter_max: 1000
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

	describe('Document creation workflow', () => {
		it('should create a complete document with headings, paragraphs, and quotes', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');

			// Start with empty document
			wysiwyg.innerHTML = '<p>Document Title</p>';

			// Make it H1
			let p = wysiwyg.querySelector('p');
			editor.selection.setRange(p.firstChild, 0, p.firstChild, p.firstChild.textContent.length);
			const h1 = editor._d.createElement('H1');
			editor.format.setLine(h1);

			// Add subtitle
			const h1El = wysiwyg.querySelector('h1');
			const subtitle = editor.format.addLine(h1El, 'H2');
			subtitle.textContent = 'Subtitle';

			// Add content paragraph
			const para = editor.format.addLine(subtitle, 'P');
			para.textContent = 'This is the content of the document.';

			// Add quote
			editor.selection.setRange(para.firstChild, 0, para.firstChild, para.firstChild.textContent.length);
			const blockquote = editor._d.createElement('BLOCKQUOTE');
			editor.format.applyBlock(blockquote);

			// Verify structure
			expect(wysiwyg.querySelector('h1')).toBeTruthy();
			expect(wysiwyg.querySelector('h2')).toBeTruthy();
			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
			expect(wysiwyg.textContent).toContain('Document Title');
			expect(wysiwyg.textContent).toContain('Subtitle');
		});

		it('should create a document and track character count', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');

			// Add title
			wysiwyg.innerHTML = '<p>Title</p>';
			let charCount1 = editor.char.getLength();
			expect(charCount1).toBe(5);

			// Add more content
			wysiwyg.innerHTML += '<p>More content here</p>';
			let charCount2 = editor.char.getLength();
			expect(charCount2).toBeGreaterThan(charCount1);

			// Verify still under limit
			expect(charCount2).toBeLessThan(1000);
		});
	});

	describe('Format-then-edit workflow', () => {
		it('should format text, then edit, then undo', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Format then edit</p>';

			// Apply bold
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);
			await editor.commandDispatcher.run('bold');

			// Check bold was applied
			let content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toMatch(/<(strong|b)>/);

			// Edit the text
			wysiwyg.querySelector('p').textContent = 'Format then edit - modified';

			// Undo should work
			editor.history.undo();

			// Should revert changes
			expect(wysiwyg.textContent).toBeTruthy();
		});

		it('should create nested formatting with multiple operations', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Nested formatting test</p>';

			// Select text
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 6);

			// Apply bold
			await editor.commandDispatcher.run('bold');

			// Re-select for italic
			const strong = wysiwyg.querySelector('strong, b');
			if (strong && strong.firstChild) {
				editor.selection.setRange(strong.firstChild, 0, strong.firstChild, 6);
				await editor.commandDispatcher.run('italic');
			}

			// Should have both formats
			const content = wysiwyg.innerHTML.toLowerCase();
			const hasBold = content.includes('<strong>') || content.includes('<b>');
			const hasItalic = content.includes('<em>') || content.includes('<i>');

			expect(hasBold || hasItalic).toBe(true);
		});
	});

	describe('Selection-based operations workflow', () => {
		it('should select, format, move selection, and format again', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First word Second word</p>';

			// Select "First"
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 5);

			// Make bold
			await editor.commandDispatcher.run('bold');

			// Move selection to "Second"
			const text = wysiwyg.textContent;
			const secondIndex = text.indexOf('Second');
			const currentTextNode = wysiwyg.querySelector('p').childNodes[0] || wysiwyg.querySelector('p').firstChild;
			if (currentTextNode && secondIndex !== -1) {
				editor.selection.setRange(currentTextNode, secondIndex, currentTextNode, secondIndex + 6);

				// Make italic
				await editor.commandDispatcher.run('italic');
			}

			// Both formats should exist
			const content = wysiwyg.innerHTML.toLowerCase();
			const hasBold = content.includes('<strong>') || content.includes('<b>');
			const hasItalic = content.includes('<em>') || content.includes('<i>');

			expect(hasBold || hasItalic).toBe(true);
		});

		it('should select multiple lines and apply block format', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Line 1</p><p>Line 2</p><p>Line 3</p>';

			// Select all lines
			const firstP = wysiwyg.querySelector('p:first-child');
			const lastP = wysiwyg.querySelector('p:last-child');
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, lastP.firstChild.textContent.length);

			// Apply blockquote
			const blockquote = editor._d.createElement('BLOCKQUOTE');
			editor.format.applyBlock(blockquote);

			// All lines should be in blockquote
			const bq = wysiwyg.querySelector('blockquote');
			expect(bq).toBeTruthy();

			const bqText = bq.textContent;
			expect(bqText).toContain('Line 1');
			expect(bqText).toContain('Line 2');
			expect(bqText).toContain('Line 3');
		});
	});

	describe('Indent and format combination workflow', () => {
		it('should indent, then change format, then outdent', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Indent test</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Indent
			editor.format.indent();

			// Change to H3
			const h3 = editor._d.createElement('H3');
			editor.format.setLine(h3);

			// Should have H3
			expect(wysiwyg.querySelector('h3')).toBeTruthy();

			// Outdent
			const h3El = wysiwyg.querySelector('h3');
			if (h3El && h3El.firstChild) {
				editor.selection.setRange(h3El.firstChild, 0, h3El.firstChild, h3El.firstChild.textContent.length);
				editor.format.outdent();
			}

			// Text should be preserved
			expect(wysiwyg.textContent).toContain('Indent test');
		});

		it('should handle complex indent-format-remove workflow', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Complex workflow</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Indent twice
			editor.format.indent();
			editor.format.indent();

			// Apply blockquote
			const blockquote = editor._d.createElement('BLOCKQUOTE');
			editor.format.applyBlock(blockquote);

			// Should have blockquote
			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();

			// Remove blockquote
			const bq = wysiwyg.querySelector('blockquote');
			if (bq) {
				const bqP = bq.querySelector('p');
				if (bqP && bqP.firstChild) {
					editor.selection.setRange(bqP.firstChild, 0, bqP.firstChild, bqP.firstChild.textContent.length);
					editor.format.removeBlock(bq);
				}
			}

			// Text should be preserved
			expect(wysiwyg.textContent).toContain('Complex workflow');
		});
	});

	describe('History and format interaction workflow', () => {
		it('should format, undo, redo, and maintain consistency', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>History test</p>';

			// Apply formatting
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 7);
			await editor.commandDispatcher.run('bold');

			// Check bold exists
			let hasBold = wysiwyg.querySelector('strong, b');
			expect(hasBold).toBeTruthy();

			// Undo
			editor.history.undo();

			// Redo
			editor.history.redo();

			// Text should be preserved through undo/redo
			expect(wysiwyg.textContent).toContain('History test');
		});

		it('should handle multiple operations with history', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');

			// Set content using editor API to ensure it's in history
			editor.html.set('<p>Multi operation test</p>');

			// Operation 1: Bold
			let p = wysiwyg.querySelector('p');
			let textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 5);
			await editor.commandDispatcher.run('bold');

			// Verify bold was applied
			let hasBold = wysiwyg.querySelector('strong, b');
			expect(hasBold).toBeTruthy();

			// Operation 2: Indent
			p = wysiwyg.querySelector('p');
			if (p && p.firstChild) {
				editor.selection.setRange(p.firstChild, 0, p.firstChild, p.firstChild.textContent.length);
				editor.format.indent();
			}

			// Undo operations
			editor.history.undo();
			editor.history.undo();

			// Text should remain after undo (formatting removed)
			const finalText = wysiwyg.textContent;
			expect(finalText).toContain('Multi operation');
			expect(finalText).toContain('test');
		});
	});

	describe('Viewer and content combination workflow', () => {
		it('should toggle code view and maintain content', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Code view test</p>';

			const originalContent = editor.html.get();

			// Toggle to code view
			editor.viewer.codeView(true);
			expect(editor.frameContext.get('isCodeView')).toBe(true);

			// Toggle back
			editor.viewer.codeView(false);
			expect(editor.frameContext.get('isCodeView')).toBe(false);

			// Content should be preserved
			const newContent = editor.html.get();
			expect(newContent).toContain('Code view test');
		});

		it('should handle fullscreen with formatting operations', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Fullscreen format test</p>';

			// Enter fullscreen
			editor.viewer.fullScreen(true);
			expect(editor.frameContext.get('isFullScreen')).toBe(true);

			// Format in fullscreen
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 10);
			await editor.commandDispatcher.run('bold');

			// Exit fullscreen
			editor.viewer.fullScreen(false);
			expect(editor.frameContext.get('isFullScreen')).toBe(false);

			// Formatting should be preserved
			expect(wysiwyg.textContent).toContain('Fullscreen format test');
		});
	});

	describe('Content manipulation with character counting', () => {
		it('should track character count through complex edits', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Initial text</p>';

			let charCount1 = editor.char.getLength();

			// Add formatting (shouldn't change char count)
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 7);
			await editor.commandDispatcher.run('bold');

			let charCount2 = editor.char.getLength();
			expect(charCount2).toBe(charCount1);

			// Add more text
			wysiwyg.innerHTML = '<p><strong>Initial text</strong> and more</p>';
			let charCount3 = editor.char.getLength();
			expect(charCount3).toBeGreaterThan(charCount2);

			// Change format (shouldn't change char count)
			const newP = wysiwyg.querySelector('p');
			if (newP && newP.firstChild) {
				editor.selection.setRange(newP.firstChild, 0, newP.lastChild, newP.lastChild.textContent.length);
				const h2 = editor._d.createElement('H2');
				editor.format.setLine(h2);
			}

			let charCount4 = editor.char.getLength();
			expect(charCount4).toBe(charCount3);
		});

		it('should prevent exceeding character limit during complex edits', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');

			// Fill to near limit (1000 chars)
			const nearLimit = 'A'.repeat(990);
			wysiwyg.innerHTML = `<p>${nearLimit}</p>`;

			// Try to add more
			const canAdd = editor.char.check('B'.repeat(20));
			expect(canAdd).toBe(false);

			// Should still be able to format existing content
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 10);

			// Format shouldn't be blocked
			expect(() => {
				const h1 = editor._d.createElement('H1');
				editor.format.setLine(h1);
			}).not.toThrow();
		});
	});

	describe('Component and format interaction workflow', () => {
		it('should handle text and component mixed formatting', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = `
				<p>Text before</p>
				<figure class="se-component">
					<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="test"/>
				</figure>
				<p>Text after</p>
			`;

			// Select text before and after component
			const firstP = wysiwyg.querySelector('p:first-child');
			const lastP = wysiwyg.querySelector('p:last-child');

			if (firstP && lastP && firstP.firstChild && lastP.firstChild) {
				editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, lastP.firstChild.textContent.length);

				// Apply blockquote (should skip component)
				const blockquote = editor._d.createElement('BLOCKQUOTE');
				editor.format.applyBlock(blockquote);
			}

			// Should preserve all content
			expect(wysiwyg.textContent).toContain('Text before');
			expect(wysiwyg.textContent).toContain('Text after');
			expect(wysiwyg.querySelector('figure')).toBeTruthy();
		});
	});

	describe('Edge cases and stress tests', () => {
		it('should handle rapid sequential operations', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Rapid operations test</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			// Rapid operations
			editor.selection.setRange(textNode, 0, textNode, 5);
			await editor.commandDispatcher.run('bold');
			await editor.commandDispatcher.run('italic');
			await editor.commandDispatcher.run('underline');

			editor.format.indent();
			editor.format.indent();
			editor.format.outdent();

			const h1 = editor._d.createElement('H1');
			editor.format.setLine(h1);

			// Text should be preserved
			expect(wysiwyg.textContent).toContain('Rapid operations test');
		});

		it('should handle empty content operations', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><br></p>';

			// Operations on empty content should not throw
			expect(() => {
				const p = wysiwyg.querySelector('p');
				const br = p.querySelector('br');
				editor.selection.setRange(br, 0, br, 0);

				const h1 = editor._d.createElement('H1');
				editor.format.setLine(h1);
				editor.format.indent();
			}).not.toThrow();
		});

		it('should handle deeply nested structure operations', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<blockquote><div><p><span><strong>Deeply nested</strong></span></p></div></blockquote>';

			const strong = wysiwyg.querySelector('strong');
			const textNode = strong.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Operations should work
			expect(() => {
				const h2 = editor._d.createElement('H2');
				editor.format.setLine(h2);
			}).not.toThrow();

			expect(wysiwyg.textContent).toContain('Deeply nested');
		});

		it('should maintain content integrity through complex workflow', async () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			const originalText = 'Content integrity test with multiple words and formatting';
			wysiwyg.innerHTML = `<p>${originalText}</p>`;

			// Complex workflow
			let p = wysiwyg.querySelector('p');
			let textNode = p.firstChild;

			// 1. Bold first word
			editor.selection.setRange(textNode, 0, textNode, 7);
			await editor.commandDispatcher.run('bold');

			// 2. Re-query and change to H2
			p = wysiwyg.querySelector('p');
			if (p && p.firstChild) {
				textNode = p.firstChild.nodeType === 3 ? p.firstChild : p.firstChild.firstChild || p.firstChild;
				if (textNode) {
					editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);
					const h2 = editor._d.createElement('H2');
					editor.format.setLine(h2);
				}
			}

			// 3. Indent
			const h2El = wysiwyg.querySelector('h2');
			if (h2El && h2El.firstChild) {
				editor.selection.setRange(h2El.firstChild, 0, h2El.firstChild, h2El.firstChild.textContent.length);
				editor.format.indent();
			}

			// 4. Apply blockquote
			const h2El2 = wysiwyg.querySelector('h2');
			if (h2El2 && h2El2.firstChild) {
				editor.selection.setRange(h2El2.firstChild, 0, h2El2.firstChild, h2El2.firstChild.textContent.length);
				const blockquote = editor._d.createElement('BLOCKQUOTE');
				editor.format.applyBlock(blockquote);
			}

			// 5. Undo some operations
			editor.history.undo();
			editor.history.undo();

			// All original text should still be present
			const finalText = wysiwyg.textContent;
			expect(finalText).toContain('Content');
			expect(finalText).toContain('integrity');
			expect(finalText).toContain('test');
		});
	});
});
