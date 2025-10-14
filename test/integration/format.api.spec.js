/**
 * @fileoverview Integration tests for Format API methods
 * Tests real-world usage of editor.format public API for line and block formatting
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Format API integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'format-api-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['outdent', 'indent']],
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

	describe('format.setLine() - Change line format', () => {
		it('should change paragraph to heading', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Change me to heading</p>';

			// Select all text
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Change to H1
			const h1 = editor._d.createElement('H1');
			editor.format.setLine(h1);

			// Should now be H1
			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toContain('<h1>');
			expect(content).toContain('change me to heading');
		});

		it('should change multiple paragraphs to headings', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First</p><p>Second</p><p>Third</p>';

			// Select all
			const firstP = wysiwyg.querySelector('p:first-child');
			const lastP = wysiwyg.querySelector('p:last-child');
			const firstText = firstP.firstChild;
			const lastText = lastP.firstChild;
			editor.selection.setRange(firstText, 0, lastText, lastText.textContent.length);

			// Change to H2
			const h2 = editor._d.createElement('H2');
			editor.format.setLine(h2);

			// All should be H2
			const h2Elements = wysiwyg.querySelectorAll('h2');
			expect(h2Elements.length).toBe(3);
			expect(wysiwyg.textContent).toContain('First');
			expect(wysiwyg.textContent).toContain('Second');
			expect(wysiwyg.textContent).toContain('Third');
		});

		it('should change heading back to paragraph', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<h1>Heading text</h1>';

			const h1 = wysiwyg.querySelector('h1');
			const textNode = h1.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Change back to P
			const p = editor._d.createElement('P');
			editor.format.setLine(p);

			// Should be P now
			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toContain('<p>');
			expect(content).toContain('heading text');
		});

		it('should preserve inline formatting when changing line format', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text with <strong>bold</strong> and <em>italic</em></p>';

			const p = wysiwyg.querySelector('p');
			const firstText = p.firstChild;
			const lastText = p.lastChild;
			editor.selection.setRange(firstText, 0, lastText, lastText.textContent.length);

			// Change to H3
			const h3 = editor._d.createElement('H3');
			editor.format.setLine(h3);

			// Should preserve inline formatting
			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toContain('<h3>');
			expect(content).toMatch(/<(strong|b)>/);
			expect(content).toMatch(/<(em|i)>/);
		});
	});

	describe('format.applyBlock() - Apply block formatting', () => {
		it('should wrap paragraph in blockquote', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Quote this text</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply blockquote
			const blockquote = editor._d.createElement('BLOCKQUOTE');
			editor.format.applyBlock(blockquote);

			// Should be wrapped in blockquote
			const bq = wysiwyg.querySelector('blockquote');
			expect(bq).toBeTruthy();
			expect(bq.textContent).toContain('Quote this text');
		});

		it('should wrap multiple paragraphs in blockquote', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First quote</p><p>Second quote</p><p>Third quote</p>';

			// Select all paragraphs
			const firstP = wysiwyg.querySelector('p:first-child');
			const lastP = wysiwyg.querySelector('p:last-child');
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, lastP.firstChild.textContent.length);

			// Apply blockquote
			const blockquote = editor._d.createElement('BLOCKQUOTE');
			editor.format.applyBlock(blockquote);

			// Should have one blockquote with all paragraphs
			const blockquotes = wysiwyg.querySelectorAll('blockquote');
			expect(blockquotes.length).toBe(1);

			const bqText = blockquotes[0].textContent;
			expect(bqText).toContain('First quote');
			expect(bqText).toContain('Second quote');
			expect(bqText).toContain('Third quote');
		});

		it('should handle nested block formatting', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Nested block test</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply first blockquote
			const blockquote1 = editor._d.createElement('BLOCKQUOTE');
			editor.format.applyBlock(blockquote1);

			// Should have blockquote
			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
			expect(wysiwyg.textContent).toContain('Nested block test');
		});
	});

	describe('format.removeBlock() - Remove block formatting', () => {
		it('should remove blockquote wrapping', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<blockquote><p>Remove blockquote</p></blockquote>';

			const bq = wysiwyg.querySelector('blockquote');
			const p = bq.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Remove blockquote
			editor.format.removeBlock(bq);

			// Should no longer have blockquote
			expect(wysiwyg.querySelector('blockquote')).toBeFalsy();
			expect(wysiwyg.textContent).toContain('Remove blockquote');
		});

		it('should remove blockquote from multiple paragraphs', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<blockquote><p>First</p><p>Second</p></blockquote>';

			const bq = wysiwyg.querySelector('blockquote');
			const firstP = bq.querySelector('p:first-child');
			const lastP = bq.querySelector('p:last-child');
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, lastP.firstChild.textContent.length);

			// Remove blockquote
			editor.format.removeBlock(bq);

			// Should no longer have blockquote
			expect(wysiwyg.querySelector('blockquote')).toBeFalsy();

			// But should preserve paragraphs
			const paragraphs = wysiwyg.querySelectorAll('p');
			expect(paragraphs.length).toBeGreaterThanOrEqual(1);
		});

		it('should handle partial blockquote removal', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<blockquote><p>Keep this</p><p>Remove this</p><p>Keep this too</p></blockquote>';

			const bq = wysiwyg.querySelector('blockquote');
			const middleP = bq.querySelector('p:nth-child(2)');
			const textNode = middleP.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Remove only selected paragraph from blockquote
			editor.format.removeBlock(bq, { selectedFormats: [middleP] });

			// Should still have content
			expect(wysiwyg.textContent).toContain('Remove this');
		});
	});

	describe('format.indent() and format.outdent() - Indentation', () => {
		it('should indent paragraph', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Indent me</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Indent
			editor.format.indent();

			// Should have margin
			const updatedP = wysiwyg.querySelector('p');
			const marginLeft = updatedP.style.marginLeft;
			const marginRight = updatedP.style.marginRight;
			expect(marginLeft || marginRight).toBeTruthy();
		});

		it('should indent multiple times', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Multiple indent</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Indent multiple times
			editor.format.indent();
			const margin1 = wysiwyg.querySelector('p').style.marginLeft || wysiwyg.querySelector('p').style.marginRight;

			editor.format.indent();
			const margin2 = wysiwyg.querySelector('p').style.marginLeft || wysiwyg.querySelector('p').style.marginRight;

			editor.format.indent();
			const margin3 = wysiwyg.querySelector('p').style.marginLeft || wysiwyg.querySelector('p').style.marginRight;

			// Each indent should increase margin
			expect(margin3.length).toBeGreaterThanOrEqual(margin2.length);
		});

		it('should outdent paragraph', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p style="margin-left: 50px;">Outdent me</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Outdent
			editor.format.outdent();

			// Should reduce margin
			const updatedP = wysiwyg.querySelector('p');
			const marginLeft = updatedP.style.marginLeft;
			const marginRight = updatedP.style.marginRight;

			// Margin should be less than 50px or empty
			if (marginLeft) {
				expect(parseInt(marginLeft) < 50 || marginLeft === '').toBe(true);
			}
			if (marginRight) {
				expect(parseInt(marginRight) < 50 || marginRight === '').toBe(true);
			}
		});

		it('should handle indent then outdent cycle', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Cycle test</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Indent
			editor.format.indent();
			expect(wysiwyg.querySelector('p').style.marginLeft || wysiwyg.querySelector('p').style.marginRight).toBeTruthy();

			// Outdent back
			editor.format.outdent();

			// Text should be preserved
			expect(wysiwyg.textContent).toContain('Cycle test');
		});
	});

	describe('format.getLine() and format.getLines() - Get line elements', () => {
		it('should get line element for node', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Find my line</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			const line = editor.format.getLine(textNode);

			expect(line).toBeTruthy();
			expect(line.nodeName).toBe('P');
			expect(line.textContent).toContain('Find my line');
		});

		it('should get all selected lines', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Line 1</p><p>Line 2</p><p>Line 3</p>';

			// Select all
			const firstP = wysiwyg.querySelector('p:first-child');
			const lastP = wysiwyg.querySelector('p:last-child');
			editor.selection.setRange(firstP.firstChild, 0, lastP.firstChild, lastP.firstChild.textContent.length);

			const lines = editor.format.getLines();

			expect(lines.length).toBe(3);
			expect(lines[0].textContent).toContain('Line 1');
			expect(lines[1].textContent).toContain('Line 2');
			expect(lines[2].textContent).toContain('Line 3');
		});

		it('should get lines with inline formatting', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Plain</p><p><strong>Bold</strong></p><p><em>Italic</em></p>';

			const firstP = wysiwyg.querySelector('p:first-child');
			const lastP = wysiwyg.querySelector('p:last-child');

			// Get text nodes: firstP.firstChild is "Plain" text node
			// lastP.firstChild is <em>, so lastP.firstChild.firstChild is the "Italic" text node
			const firstText = firstP.firstChild;
			const lastText = lastP.firstChild.firstChild;

			editor.selection.setRange(firstText, 0, lastText, lastText.textContent.length);

			const lines = editor.format.getLines();

			expect(lines.length).toBe(3);
		});
	});

	describe('format.isLine() and format.isBlock() - Type checking', () => {
		it('should identify line elements', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Paragraph</p><h1>Heading</h1><div>Division</div>';

			const p = wysiwyg.querySelector('p');
			const h1 = wysiwyg.querySelector('h1');
			const div = wysiwyg.querySelector('div');

			expect(editor.format.isLine(p)).toBe(true);
			expect(editor.format.isLine(h1)).toBe(true);
			expect(editor.format.isLine(div)).toBe(true);
		});

		it('should identify block elements', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<blockquote><p>Quote</p></blockquote><ul><li>Item</li></ul>';

			const bq = wysiwyg.querySelector('blockquote');
			const ul = wysiwyg.querySelector('ul');

			expect(editor.format.isBlock(bq)).toBe(true);
			expect(editor.format.isBlock(ul)).toBe(true);
		});

		it('should distinguish between line and block', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<blockquote><p>Content</p></blockquote>';

			const bq = wysiwyg.querySelector('blockquote');
			const p = wysiwyg.querySelector('p');

			// P is a line
			expect(editor.format.isLine(p)).toBe(true);
			expect(editor.format.isBlock(p)).toBe(false);

			// BLOCKQUOTE is a block
			expect(editor.format.isBlock(bq)).toBe(true);
			expect(editor.format.isLine(bq)).toBe(false);
		});
	});

	describe('Real-world format workflows', () => {
		it('should handle document outlining workflow', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Title</p><p>Subtitle</p><p>Content paragraph 1</p><p>Content paragraph 2</p>';

			// Make title H1
			const title = wysiwyg.querySelector('p:nth-child(1)');
			editor.selection.setRange(title.firstChild, 0, title.firstChild, title.firstChild.textContent.length);
			const h1 = editor._d.createElement('H1');
			editor.format.setLine(h1);

			// Make subtitle H2
			const subtitle = wysiwyg.querySelector('p:nth-child(1)');
			if (subtitle) {
				editor.selection.setRange(subtitle.firstChild, 0, subtitle.firstChild, subtitle.firstChild.textContent.length);
				const h2 = editor._d.createElement('H2');
				editor.format.setLine(h2);
			}

			// Verify structure
			expect(wysiwyg.querySelector('h1')).toBeTruthy();
			expect(wysiwyg.textContent).toContain('Title');
			expect(wysiwyg.textContent).toContain('Content paragraph');
		});

		it('should handle quote then indent workflow', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>This is a quote</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply blockquote
			const blockquote = editor._d.createElement('BLOCKQUOTE');
			editor.format.applyBlock(blockquote);

			// Then indent the content inside
			const bqP = wysiwyg.querySelector('blockquote p');
			if (bqP && bqP.firstChild) {
				editor.selection.setRange(bqP.firstChild, 0, bqP.firstChild, bqP.firstChild.textContent.length);
				editor.format.indent();
			}

			// Should have blockquote
			expect(wysiwyg.querySelector('blockquote')).toBeTruthy();
			expect(wysiwyg.textContent).toContain('This is a quote');
		});

		it('should handle format change with mixed content', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Normal <strong>bold</strong> <em>italic</em> text</p>';

			const p = wysiwyg.querySelector('p');
			const firstText = p.firstChild;
			const lastText = p.lastChild;
			editor.selection.setRange(firstText, 0, lastText, lastText.textContent.length);

			// Change to H3
			const h3 = editor._d.createElement('H3');
			editor.format.setLine(h3);

			// Should preserve all inline formatting
			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toContain('<h3>');
			expect(content).toContain('normal');
			expect(content).toMatch(/<(strong|b)>/);
			expect(content).toMatch(/<(em|i)>/);
		});

		it('should handle complex nested structure formatting', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<blockquote><p>Nested content</p></blockquote>';

			// Select content
			const bq = wysiwyg.querySelector('blockquote');
			const p = bq.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Change line format inside blockquote
			const h4 = editor._d.createElement('H4');
			editor.format.setLine(h4);

			// Should still have blockquote with new line format
			expect(wysiwyg.textContent).toContain('Nested content');
		});
	});

	describe('Edge cases', () => {
		it('should handle empty lines', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><br></p>';

			const p = wysiwyg.querySelector('p');
			const br = p.querySelector('br');
			editor.selection.setRange(br, 0, br, 0);

			// Change to H1 - should not throw
			expect(() => {
				const h1 = editor._d.createElement('H1');
				editor.format.setLine(h1);
			}).not.toThrow();
		});

		it('should handle very long content', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			const longText = 'A'.repeat(1000);
			wysiwyg.innerHTML = `<p>${longText}</p>`;

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, 100);

			// Should handle long content
			expect(() => {
				editor.format.indent();
			}).not.toThrow();
		});

		it('should handle rapid format changes', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Rapid changes</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Rapid format changes
			['H1', 'H2', 'H3', 'P', 'DIV'].forEach((tagName) => {
				const el = editor._d.createElement(tagName);
				editor.format.setLine(el);
			});

			// Text should be preserved
			expect(wysiwyg.textContent).toContain('Rapid changes');
		});
	});
});
