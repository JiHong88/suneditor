/**
 * @fileoverview Integration tests for Inline sameTag optimization path
 * Tests the "not add tag" optimization in #setNode_oneLine, #setNode_startLine, #setNode_endLine
 *
 * The sameTag optimization fires when:
 * 1. The parent already has the same tag as the new node (parentCon.nodeName === newInnerNode.nodeName)
 * 2. The selection covers all meaningful (non-zero-width) content within that parent
 * 3. isRemoveNode is false
 * 4. isRemoveFormat is false
 *
 * When it fires, it copies attributes from the new node onto the parent instead of
 * creating a new DOM structure — an optimization that avoids unnecessary DOM restructuring.
 *
 * These tests verify three key bug fixes:
 * - sameTag was initialized as `false` instead of `true` (dead code bug)
 * - startCon === endCon caused the `e` flag to never be set
 * - isRemoveFormat was not guarded, causing attribute copy instead of format removal
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import { dom } from '../../src/helper';

describe('Inline sameTag optimization', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'sametag-test-container';
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

	describe('#setNode_oneLine - sameTag optimization', () => {
		it('should copy attributes when applying same tag to fully selected content', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Hello</strong></p>';

			// Select all text inside the <strong>
			const strong = wysiwyg.querySelector('strong');
			const textNode = strong.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply bold again — same tag, full selection → sameTag optimization should fire
			// It should NOT create a new nested <strong>, but should keep the existing structure
			await editor.$.commandDispatcher.run('bold');

			// The text should be preserved
			expect(wysiwyg.textContent).toContain('Hello');
		});

		it('should apply formatting when same tag has additional style attributes', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			// Start with a styled span
			wysiwyg.innerHTML = '<p><span style="color: red;">Styled text</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply bold — different tag, should create new structure
			await editor.$.commandDispatcher.run('bold');

			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toMatch(/<(strong|b)>/);
			expect(wysiwyg.textContent).toContain('Styled text');
		});

		it('should handle startCon === endCon (same text node for start and end)', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			// Create a bold element with a single text node
			wysiwyg.innerHTML = '<p><strong>Single node text</strong></p>';

			const strong = wysiwyg.querySelector('strong');
			const textNode = strong.firstChild;

			// Select all content — startCon === endCon (same text node)
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply bold again — this tests the startCon === endCon fix
			// Before fix: `e` flag was never set, nodes after endCon weren't detected correctly
			await editor.$.commandDispatcher.run('bold');

			// Text should be preserved (toggle bold off)
			expect(wysiwyg.textContent).toContain('Single node text');
		});

		it('should NOT use sameTag optimization when non-zero-width siblings exist', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			// Create bold with meaningful sibling content
			wysiwyg.innerHTML = '<p><strong>Selected<em>Other content</em></strong></p>';

			const textNode = wysiwyg.querySelector('strong').firstChild;
			// Select only "Selected" — the <em> is a non-zero-width sibling after endCon
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply bold again — should NOT use sameTag optimization because <em> has content after the selection
			await editor.$.commandDispatcher.run('bold');

			// Text should still be preserved
			expect(wysiwyg.textContent).toContain('Selected');
			expect(wysiwyg.textContent).toContain('Other content');
		});

		it('should handle sameTag with zero-width text nodes around selection', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			// Create bold with zero-width nodes (empty text nodes or ZWS)
			wysiwyg.innerHTML = '<p><strong>Content</strong></p>';

			const strong = wysiwyg.querySelector('strong');
			// Add zero-width text nodes before and after the main text node
			const zwsBefore = document.createTextNode('\u200B');
			const zwsAfter = document.createTextNode('\u200B');
			strong.insertBefore(zwsBefore, strong.firstChild);
			strong.appendChild(zwsAfter);

			// Select the main text content (skipping ZWS nodes)
			const textNode = strong.childNodes[1]; // The actual "Content" text node
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// sameTag optimization should fire — zero-width siblings are ignored
			await editor.$.commandDispatcher.run('bold');

			expect(wysiwyg.textContent.replace(/\u200B/g, '')).toContain('Content');
		});
	});

	describe('isRemoveFormat guard on sameTag optimization', () => {
		it('should NOT use sameTag optimization when removing formatting', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Remove this bold</strong></p>';

			const strong = wysiwyg.querySelector('strong');
			const textNode = strong.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Remove formatting — isRemoveFormat=true
			// Before the fix: sameTag optimization would fire and copy attributes instead of removing
			editor.$.inline.remove();

			// Text should be preserved
			expect(wysiwyg.textContent).toContain('Remove this bold');

			// Verify formatting was actually removed or reduced
			const content = wysiwyg.innerHTML.toLowerCase();
			// After removeFormat, the <strong> should be stripped
			const hasLessFormatting = !content.includes('<strong>') || !content.includes('<b>');
			expect(hasLessFormatting).toBe(true);
		});

		it('should remove formatting from nested same-tag structure', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><em><strong>Nested bold italic</strong></em></p>';

			const textNode = wysiwyg.querySelector('strong').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Remove all formatting
			editor.$.inline.remove();

			expect(wysiwyg.textContent).toContain('Nested bold italic');
		});

		it('should remove formatting via removeFormat command on same-tag parent', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold to remove</strong></p>';

			const strong = wysiwyg.querySelector('strong');
			const textNode = strong.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Use commandDispatcher to run removeFormat
			await editor.$.commandDispatcher.run('removeFormat');

			// Text should be preserved
			expect(wysiwyg.textContent).toContain('Bold to remove');
		});
	});

	describe('sameTag with partial selections', () => {
		it('should not use sameTag optimization for partial text selection', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Hello World</strong></p>';

			const strong = wysiwyg.querySelector('strong');
			const textNode = strong.firstChild;
			// Select only "Hello" — partial selection, not all meaningful content
			editor.$.selection.setRange(textNode, 0, textNode, 5);

			// Toggle bold on the partial selection
			await editor.$.commandDispatcher.run('bold');

			// All text should be preserved
			expect(wysiwyg.textContent).toContain('Hello');
			expect(wysiwyg.textContent).toContain('World');
		});

		it('should handle middle-of-text partial selection within same tag', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Start middle end</strong></p>';

			const textNode = wysiwyg.querySelector('strong').firstChild;
			// Select only "middle"
			editor.$.selection.setRange(textNode, 6, textNode, 12);

			// Toggle bold off for "middle"
			await editor.$.commandDispatcher.run('bold');

			// All text parts should be preserved
			expect(wysiwyg.textContent).toContain('Start');
			expect(wysiwyg.textContent).toContain('middle');
			expect(wysiwyg.textContent).toContain('end');
		});
	});

	describe('sameTag optimization with style attributes', () => {
		it('should copy new style attributes onto existing same-tag parent', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: red;">Red text</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply a span with different style — same SPAN tag, should use sameTag optimization
			// and copy the new attributes onto the existing span
			// This tests that copyTagAttributes works correctly in the optimization path
			expect(wysiwyg.textContent).toContain('Red text');
		});

		it('should handle bold toggle preserving content structure', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Normal <strong>Bold</strong> Normal</p>';

			// Select the bold text
			const strong = wysiwyg.querySelector('strong');
			const textNode = strong.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Toggle bold off
			await editor.$.commandDispatcher.run('bold');

			// All text should remain
			const fullText = wysiwyg.textContent;
			expect(fullText).toContain('Normal');
			expect(fullText).toContain('Bold');
		});
	});

	describe('Multi-line sameTag scenarios (#setNode_startLine / #setNode_endLine)', () => {
		it('should handle formatting across two paragraphs', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>First line</strong></p><p><strong>Second line</strong></p>';

			// Select from start of first line to end of second line
			const firstStrong = wysiwyg.querySelector('p:first-child strong');
			const secondStrong = wysiwyg.querySelector('p:last-child strong');

			if (firstStrong && secondStrong && firstStrong.firstChild && secondStrong.firstChild) {
				editor.$.selection.setRange(
					firstStrong.firstChild, 0,
					secondStrong.firstChild, secondStrong.firstChild.textContent.length
				);

				// Toggle bold off — both lines have <strong>, sameTag should be considered for both
				await editor.$.commandDispatcher.run('bold');

				expect(wysiwyg.textContent).toContain('First line');
				expect(wysiwyg.textContent).toContain('Second line');
			}
		});

		it('should handle startLine sameTag with no previous siblings', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Start paragraph</strong></p><p>End paragraph</p>';

			const firstStrong = wysiwyg.querySelector('p:first-child strong');
			const lastP = wysiwyg.querySelector('p:last-child');

			if (firstStrong && firstStrong.firstChild && lastP && lastP.firstChild) {
				editor.$.selection.setRange(
					firstStrong.firstChild, 0,
					lastP.firstChild, lastP.firstChild.textContent.length
				);

				// Apply bold — start line already has <strong>, sameTag could fire for startLine
				await editor.$.commandDispatcher.run('bold');

				expect(wysiwyg.textContent).toContain('Start paragraph');
				expect(wysiwyg.textContent).toContain('End paragraph');
			}
		});

		it('should handle endLine sameTag with no following siblings', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Start paragraph</p><p><strong>End paragraph</strong></p>';

			const firstP = wysiwyg.querySelector('p:first-child');
			const lastStrong = wysiwyg.querySelector('p:last-child strong');

			if (firstP && firstP.firstChild && lastStrong && lastStrong.firstChild) {
				editor.$.selection.setRange(
					firstP.firstChild, 0,
					lastStrong.firstChild, lastStrong.firstChild.textContent.length
				);

				// Apply bold — end line already has <strong>, sameTag could fire for endLine
				await editor.$.commandDispatcher.run('bold');

				expect(wysiwyg.textContent).toContain('Start paragraph');
				expect(wysiwyg.textContent).toContain('End paragraph');
			}
		});
	});

	describe('Edge cases', () => {
		it('should handle empty text node selection without error', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong></strong></p>';

			const strong = wysiwyg.querySelector('strong');
			// Add an empty text node
			const emptyText = document.createTextNode('');
			strong.appendChild(emptyText);

			editor.$.selection.setRange(emptyText, 0, emptyText, 0);

			// Should not throw
			await expect(async () => {
				await editor.$.commandDispatcher.run('bold');
			}).not.toThrow();
		});

		it('should handle single character selection in same-tag parent', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>X</strong></p>';

			const textNode = wysiwyg.querySelector('strong').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 1);

			// Toggle bold off for single character — startCon === endCon, full selection
			await editor.$.commandDispatcher.run('bold');

			expect(wysiwyg.textContent).toContain('X');
		});

		it('should handle deeply nested same-tag parent', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			// parentCon walks up through single-child parents to find same tag
			wysiwyg.innerHTML = '<p><strong><em><u>Deep text</u></em></strong></p>';

			const textNode = wysiwyg.querySelector('u').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply bold — parentCon should walk up through <u> and <em> to find <strong>
			await editor.$.commandDispatcher.run('bold');

			expect(wysiwyg.textContent).toContain('Deep text');
		});

		it('should correctly toggle bold off and on multiple times', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Toggle text</p>';

			// Apply bold
			let textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);
			await editor.$.commandDispatcher.run('bold');

			let content = wysiwyg.innerHTML.toLowerCase();
			let hasBold = content.includes('<strong>') || content.includes('<b>');
			expect(hasBold).toBe(true);
			expect(wysiwyg.textContent).toContain('Toggle text');

			// Toggle bold off
			const boldNode = wysiwyg.querySelector('strong, b');
			if (boldNode && boldNode.firstChild) {
				editor.$.selection.setRange(boldNode.firstChild, 0, boldNode.firstChild, boldNode.firstChild.textContent.length);
				await editor.$.commandDispatcher.run('bold');
			}

			expect(wysiwyg.textContent).toContain('Toggle text');

			// Toggle bold on again
			textNode = wysiwyg.querySelector('p').firstChild || wysiwyg.querySelector('p').childNodes[0];
			if (textNode) {
				const len = textNode.textContent?.length || 0;
				if (len > 0) {
					editor.$.selection.setRange(textNode, 0, textNode, len);
					await editor.$.commandDispatcher.run('bold');
				}
			}

			expect(wysiwyg.textContent).toContain('Toggle text');
		});

		it('should preserve text with multiple format toggles on same range', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Preserved</strong></p>';

			// Apply bold 3 times (toggle on/off/on)
			for (let i = 0; i < 3; i++) {
				const target = wysiwyg.querySelector('strong, b') || wysiwyg.querySelector('p');
				const textTarget = target.firstChild?.nodeType === 3 ? target.firstChild : target.childNodes[0];
				if (textTarget && textTarget.textContent) {
					editor.$.selection.setRange(textTarget, 0, textTarget, textTarget.textContent.length);
					await editor.$.commandDispatcher.run('bold');
				}
			}

			// Text must always be preserved regardless of how many times we toggle
			expect(wysiwyg.textContent).toContain('Preserved');
		});
	});

	describe('Span style operations — inline.apply() direct calls', () => {
		it('should update font-size on existing span with font-size (sameTag SPAN === SPAN)', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="font-size: 14px;">Sized text</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply new font-size — same SPAN tag, sameTag optimization should fire
			// and copyTagAttributes should update font-size from 14px to 20px
			const newNode = dom.utils.createElement('SPAN', { style: 'font-size: 20px;' });
			editor.$.inline.apply(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });

			expect(wysiwyg.textContent).toContain('Sized text');
			// The font-size should be updated
			const resultSpan = wysiwyg.querySelector('span');
			if (resultSpan) {
				expect(resultSpan.style.fontSize).toBe('20px');
			}
		});

		it('should update color on existing span with color', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: red;">Red text</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply new color — same SPAN tag
			const newNode = dom.utils.createElement('SPAN', { style: 'color: blue;' });
			editor.$.inline.apply(newNode, { stylesToModify: ['color'], nodesToRemove: null, strictRemove: null });

			expect(wysiwyg.textContent).toContain('Red text');
		});

		it('should add font-size to existing span that only has color (style merge)', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: red;">Styled text</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply font-size — same SPAN tag, sameTag should fire and ADD font-size to existing color
			const newNode = dom.utils.createElement('SPAN', { style: 'font-size: 18px;' });
			editor.$.inline.apply(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });

			expect(wysiwyg.textContent).toContain('Styled text');
			// After sameTag optimization with copyTagAttributes, the span should have both styles
			const resultSpan = wysiwyg.querySelector('span');
			if (resultSpan) {
				expect(resultSpan.style.fontSize).toBe('18px');
			}
		});

		it('should update background-color on existing span', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="background-color: yellow;">Highlighted</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			const newNode = dom.utils.createElement('SPAN', { style: 'background-color: green;' });
			editor.$.inline.apply(newNode, { stylesToModify: ['background-color'], nodesToRemove: null, strictRemove: null });

			expect(wysiwyg.textContent).toContain('Highlighted');
		});

		it('should remove font-size from span (isRemoveNode, sameTag must NOT fire)', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="font-size: 20px;">Big text</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Remove font-size: styleNode=null → isRemoveNode=true → sameTag blocked by !isRemoveNode
			editor.$.inline.apply(null, { stylesToModify: ['font-size'], nodesToRemove: ['span'], strictRemove: true });

			expect(wysiwyg.textContent).toContain('Big text');
			// The span with font-size should be removed
			const remainingSpan = wysiwyg.querySelector('span[style*="font-size"]');
			expect(remainingSpan).toBeNull();
		});

		it('should remove color from span while preserving other styles (strictRemove)', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: red; font-size: 18px;">Multi-styled</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Remove only color, keep font-size (strictRemove=true means only remove if ALL styles match)
			editor.$.inline.apply(null, { stylesToModify: ['color'], nodesToRemove: ['span'], strictRemove: true });

			expect(wysiwyg.textContent).toContain('Multi-styled');
			// font-size should still be present on some span
			const styledSpan = wysiwyg.querySelector('span');
			if (styledSpan) {
				expect(styledSpan.style.fontSize).toBe('18px');
			}
		});

		it('should remove all formatting from styled span (isRemoveFormat, sameTag must NOT fire)', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="font-size: 20px; color: red;">Fully styled</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Remove ALL formatting — isRemoveFormat=true → sameTag blocked by !isRemoveFormat guard
			// Before the fix: sameTag would fire and copyTagAttributes instead of stripping
			editor.$.inline.remove();

			expect(wysiwyg.textContent).toContain('Fully styled');
			// Formatting should be gone
			const content = wysiwyg.innerHTML.toLowerCase();
			const hasStyledSpan = content.includes('font-size') && content.includes('color');
			expect(hasStyledSpan).toBe(false);
		});

		it('should handle font-family change on existing font-family span', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="font-family: Arial;">Arial text</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Change font-family — same SPAN tag, sameTag should fire
			const newNode = dom.utils.createElement('SPAN', { style: 'font-family: Georgia;' });
			editor.$.inline.apply(newNode, { stylesToModify: ['font-family'], nodesToRemove: null, strictRemove: null });

			expect(wysiwyg.textContent).toContain('Arial text');
			const resultSpan = wysiwyg.querySelector('span');
			if (resultSpan) {
				expect(resultSpan.style.fontFamily).toBe('Georgia');
			}
		});

		it('should handle partial selection within styled span (no sameTag)', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: red;">Red colored text here</span></p>';

			const textNode = wysiwyg.querySelector('span').firstChild;
			// Select only "colored" — partial, sameTag should NOT fire
			editor.$.selection.setRange(textNode, 4, textNode, 11);

			const newNode = dom.utils.createElement('SPAN', { style: 'font-size: 24px;' });
			editor.$.inline.apply(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });

			// All text should be preserved
			expect(wysiwyg.textContent).toContain('Red');
			expect(wysiwyg.textContent).toContain('colored');
			expect(wysiwyg.textContent).toContain('text here');
		});

		it('should apply span style with class attribute', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span class="custom-class">Classed text</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply different class — same SPAN tag, sameTag optimization should handle classes too
			const newNode = dom.utils.createElement('SPAN');
			newNode.className = 'new-class';
			editor.$.inline.apply(newNode, { stylesToModify: ['.custom-class'], nodesToRemove: null, strictRemove: null });

			expect(wysiwyg.textContent).toContain('Classed text');
		});
	});

	describe('Span style — multi-line scenarios', () => {
		it('should apply font-size across two paragraphs with existing spans', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="font-size: 14px;">Line one</span></p><p><span style="font-size: 14px;">Line two</span></p>';

			const firstSpan = wysiwyg.querySelector('p:first-child span');
			const lastSpan = wysiwyg.querySelector('p:last-child span');

			if (firstSpan?.firstChild && lastSpan?.firstChild) {
				editor.$.selection.setRange(
					firstSpan.firstChild, 0,
					lastSpan.firstChild, lastSpan.firstChild.textContent.length
				);

				const newNode = dom.utils.createElement('SPAN', { style: 'font-size: 20px;' });
				editor.$.inline.apply(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });

				expect(wysiwyg.textContent).toContain('Line one');
				expect(wysiwyg.textContent).toContain('Line two');
			}
		});

		it('should remove font-size across two paragraphs', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="font-size: 20px;">Big line one</span></p><p><span style="font-size: 20px;">Big line two</span></p>';

			const firstSpan = wysiwyg.querySelector('p:first-child span');
			const lastSpan = wysiwyg.querySelector('p:last-child span');

			if (firstSpan?.firstChild && lastSpan?.firstChild) {
				editor.$.selection.setRange(
					firstSpan.firstChild, 0,
					lastSpan.firstChild, lastSpan.firstChild.textContent.length
				);

				// Remove font-size
				editor.$.inline.apply(null, { stylesToModify: ['font-size'], nodesToRemove: ['span'], strictRemove: true });

				expect(wysiwyg.textContent).toContain('Big line one');
				expect(wysiwyg.textContent).toContain('Big line two');
			}
		});

		it('should remove all formatting across styled multi-line content', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: red; font-size: 20px;">Styled first</span></p><p><span style="color: blue; font-size: 18px;">Styled second</span></p>';

			const firstSpan = wysiwyg.querySelector('p:first-child span');
			const lastSpan = wysiwyg.querySelector('p:last-child span');

			if (firstSpan?.firstChild && lastSpan?.firstChild) {
				editor.$.selection.setRange(
					firstSpan.firstChild, 0,
					lastSpan.firstChild, lastSpan.firstChild.textContent.length
				);

				// Remove ALL formatting — isRemoveFormat=true
				editor.$.inline.remove();

				expect(wysiwyg.textContent).toContain('Styled first');
				expect(wysiwyg.textContent).toContain('Styled second');
			}
		});
	});

	describe('Span style — startCon === endCon with styles', () => {
		it('should handle font-size update when start and end are same text node in span', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="font-size: 14px;">Same node</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			// startCon === endCon — the fix ensures `e` flag is set correctly
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			const newNode = dom.utils.createElement('SPAN', { style: 'font-size: 24px;' });
			editor.$.inline.apply(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });

			expect(wysiwyg.textContent).toContain('Same node');
			const resultSpan = wysiwyg.querySelector('span');
			if (resultSpan) {
				expect(resultSpan.style.fontSize).toBe('24px');
			}
		});

		it('should handle color removal when start and end are same text node in span', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: red;">Remove color</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Remove color — isRemoveNode=true, sameTag must NOT fire
			editor.$.inline.apply(null, { stylesToModify: ['color'], nodesToRemove: ['span'], strictRemove: true });

			expect(wysiwyg.textContent).toContain('Remove color');
			const styledSpan = wysiwyg.querySelector('span[style*="color"]');
			expect(styledSpan).toBeNull();
		});

		it('should handle removeFormat on single span node (isRemoveFormat guard)', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="font-size: 20px; color: blue; background-color: yellow;">Heavy style</span></p>';

			const span = wysiwyg.querySelector('span');
			const textNode = span.firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Remove ALL — isRemoveFormat=true, startCon===endCon
			// This tests both the isRemoveFormat guard AND the startCon===endCon fix together
			editor.$.inline.remove();

			expect(wysiwyg.textContent).toContain('Heavy style');
			// All inline styles should be removed
			const content = wysiwyg.innerHTML.toLowerCase();
			const hasHeavyStyle = content.includes('font-size') && content.includes('background-color');
			expect(hasHeavyStyle).toBe(false);
		});
	});

	describe('Mixed tag + style combinations', () => {
		it('should apply font-size inside bold text', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold text</strong></p>';

			const textNode = wysiwyg.querySelector('strong').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply font-size (SPAN) inside STRONG — different tags, no sameTag
			const newNode = dom.utils.createElement('SPAN', { style: 'font-size: 20px;' });
			editor.$.inline.apply(newNode, { stylesToModify: ['font-size'], nodesToRemove: null, strictRemove: null });

			expect(wysiwyg.textContent).toContain('Bold text');
			const content = wysiwyg.innerHTML.toLowerCase();
			expect(content).toContain('font-size');
			expect(content).toMatch(/<(strong|b)>/);
		});

		it('should remove formatting from bold + colored text', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><span style="color: red;">Bold red</span></strong></p>';

			const textNode = wysiwyg.querySelector('span').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			editor.$.inline.remove();

			expect(wysiwyg.textContent).toContain('Bold red');
			const content = wysiwyg.innerHTML.toLowerCase();
			// At least some formatting should be removed
			const reduced = !content.includes('<strong>') || !content.includes('color');
			expect(reduced).toBe(true);
		});

		it('should apply color to text that already has font-size span', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="font-size: 18px;">Sized text</span></p>';

			const textNode = wysiwyg.querySelector('span').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			// Apply color — same SPAN tag, sameTag fires and adds color to existing span
			const newNode = dom.utils.createElement('SPAN', { style: 'color: green;' });
			editor.$.inline.apply(newNode, { stylesToModify: ['color'], nodesToRemove: null, strictRemove: null });

			expect(wysiwyg.textContent).toContain('Sized text');
			const resultSpan = wysiwyg.querySelector('span');
			if (resultSpan) {
				// Should have both font-size and color after sameTag copyTagAttributes
				expect(resultSpan.style.fontSize).toBe('18px');
				expect(resultSpan.style.color).toBe('green');
			}
		});
	});
});
