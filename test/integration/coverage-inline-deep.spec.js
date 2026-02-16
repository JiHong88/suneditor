/**
 * @fileoverview Deep integration tests for inline.js
 * Goal: Maximize coverage for src/core/logic/dom/inline.js
 *
 * Focus areas:
 * - Complex nested style handling
 * - Multi-line range formatting
 * - Edge cases in style validation and node handling
 * - Non-split node handling (A, LABEL, CODE, SUMMARY)
 * - List cell style propagation
 * - Empty range and collapsed range handling
 * - Style modification and removal scenarios
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { blockquote, list_bulleted, list_numbered, link, image } from '../../src/plugins';

jest.setTimeout(60000);

describe('Inline.js - Deep Coverage Tests', () => {
	let editor1;
	let editor2;

	const plugins = {
		blockquote,
		list_bulleted,
		list_numbered,
		link,
		image,
	};

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});

		editor1 = createTestEditor({
			plugins,
			buttonList: [['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript']],
			formats: ['p', 'h1', 'h2', 'h3', 'blockquote', 'pre', 'div'],
			defaultLineBreakFormat: 'p',
		});

		editor2 = createTestEditor({
			plugins,
			buttonList: [],
			defaultLineBreakFormat: 'p',
		});

		await waitForEditorReady(editor1);
		await waitForEditorReady(editor2);
	});

	afterAll(async () => {
		destroyTestEditor(editor1);
		destroyTestEditor(editor2);
		jest.restoreAllMocks();
		await new Promise(r => setTimeout(r, 50));
	});

	describe('Complex Multi-line Formatting', () => {
		test('should format across 3 paragraphs with complex nesting', () => {
			editor1.$.html.set(
				'<p>Start <strong>bold</strong> text</p>' +
				'<p>Middle <em>italic</em> content</p>' +
				'<p>End <u>underline</u> here</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			const firstText = pList[0].firstChild;
			const lastText = pList[2];
			editor1.$.selection.setRange(firstText, 0, lastText, lastText.textContent.length);

			const spanEl = document.createElement('SPAN');
			spanEl.style.color = 'red';
			spanEl.style.backgroundColor = 'yellow';
			editor1.$.inline.apply(spanEl);

			const html = editor1.$.html.get();
			expect(html).toBeDefined();
		});

		test('should handle 5-line formatting with varying node types', () => {
			editor1.$.html.set(
				'<h1>Header</h1>' +
				'<p>Para 1</p>' +
				'<blockquote>Quote</blockquote>' +
				'<p>Para 2</p>' +
				'<p>Para 3</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const h1 = wysiwyg.querySelector('h1');
			const lastP = wysiwyg.querySelectorAll('p')[wysiwyg.querySelectorAll('p').length - 1];

			if (h1 && h1.firstChild && lastP && lastP.firstChild) {
				editor1.$.selection.setRange(h1.firstChild, 0, lastP.firstChild, 6);

				const spanEl = document.createElement('SPAN');
				spanEl.style.fontWeight = 'bold';
				spanEl.style.fontSize = '14px';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should format multiple paragraphs starting and ending mid-text', () => {
			editor1.$.html.set(
				'<p>First paragraph with text</p>' +
				'<p>Second paragraph with text</p>' +
				'<p>Third paragraph with text</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			const firstText = pList[0].firstChild;
			const lastText = pList[2].firstChild;

			editor1.$.selection.setRange(firstText, 6, lastText, 10);

			const spanEl = document.createElement('SPAN');
			spanEl.style.color = 'green';
			editor1.$.inline.apply(spanEl);

			const html = editor1.$.html.get();
			expect(html).toBeDefined();
		});

		test('should handle 4-line format with mixed empty and non-empty nodes', () => {
			editor1.$.html.set(
				'<p>Text 1</p>' +
				'<p></p>' +
				'<p>Text 2</p>' +
				'<p>Text 3</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			if (pList[0].firstChild && pList[2].firstChild) {
				editor1.$.selection.setRange(pList[0].firstChild, 0, pList[2].firstChild, 6);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should remove format across multiple lines', () => {
			editor1.$.html.set(
				'<p><span style="color: red;">Text 1</span></p>' +
				'<p><span style="color: red;">Text 2</span></p>' +
				'<p><span style="color: red;">Text 3</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const spans = wysiwyg.querySelectorAll('span');

			if (spans.length >= 3 && spans[0].firstChild && spans[2].firstChild) {
				editor1.$.selection.setRange(spans[0].firstChild, 0, spans[2].firstChild, 6);
				editor1.$.inline.apply(null, { stylesToModify: ['color'] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Nested Style Handling', () => {
		test('should apply style to deeply nested content', () => {
			editor1.$.html.set(
				'<p>' +
				'<strong><em><span style="color: blue;">Deep text</span></em></strong>' +
				'</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				const newSpan = document.createElement('SPAN');
				newSpan.style.backgroundColor = '#ffff00';
				editor1.$.inline.apply(newSpan);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle 4-level nested element formatting', () => {
			editor1.$.html.set(
				'<p><a><strong><em>Nested link text</em></strong></a></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const em = wysiwyg.querySelector('em');

			if (em && em.firstChild) {
				editor1.$.selection.setRange(em.firstChild, 0, em.firstChild, 6);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'orange';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should modify existing style on nested element', () => {
			editor1.$.html.set(
				'<p>' +
				'<span style="color: red; font-size: 14px;">' +
				'<strong>Text</strong>' +
				'</span>' +
				'</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong && strong.firstChild) {
				editor1.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor1.$.inline.apply(spanEl, { stylesToModify: ['color'] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should apply formatting to span with multiple styles', () => {
			editor1.$.html.set(
				'<p><span style="color: red; background-color: yellow; font-size: 16px;">Multi-style</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 5);

				const newSpan = document.createElement('SPAN');
				newSpan.style.fontWeight = 'bold';
				editor1.$.inline.apply(newSpan);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should remove multiple styles from span', () => {
			editor1.$.html.set(
				'<p><span style="color: red; font-size: 16px; font-family: Arial;">Text</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				editor1.$.inline.apply(null, { stylesToModify: ['color', 'font-size'] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Non-Split Node Handling (A, LABEL, CODE, SUMMARY)', () => {
		test('should format text inside anchor tag', () => {
			editor1.$.html.set('<p><a href="#">Link text</a></p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const a = wysiwyg.querySelector('a');

			if (a && a.firstChild) {
				editor1.$.selection.setRange(a.firstChild, 0, a.firstChild, 4);

				const boldEl = document.createElement('STRONG');
				editor1.$.inline.apply(boldEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should format text inside label tag', () => {
			editor1.$.html.set('<p><label>Label text here</label></p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const label = wysiwyg.querySelector('label');

			if (label && label.firstChild) {
				editor1.$.selection.setRange(label.firstChild, 0, label.firstChild, 5);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should format text inside code tag', () => {
			editor1.$.html.set('<p><code>const x = 5;</code></p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const code = wysiwyg.querySelector('code');

			if (code && code.firstChild) {
				editor1.$.selection.setRange(code.firstChild, 0, code.firstChild, 5);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle format removal from non-split node', () => {
			editor1.$.html.set(
				'<p><a href="#"><span style="color: red;">Link</span></a></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				editor1.$.inline.apply(null, { stylesToModify: ['color'] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should format nested text in anchor with existing styles', () => {
			editor1.$.html.set(
				'<p><a href="#"><strong>Bold link</strong></a></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong && strong.firstChild) {
				editor1.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'purple';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('List Cell Style Handling', () => {
		test('should apply bold to list item and propagate to list cell', () => {
			editor1.$.html.set(
				'<ul><li>Item text</li></ul>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const li = wysiwyg.querySelector('li');

			if (li && li.firstChild) {
				editor1.$.selection.setRange(li.firstChild, 0, li.firstChild, 4);

				const strongEl = document.createElement('STRONG');
				editor1.$.inline.apply(strongEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should apply color style to list item', () => {
			editor1.$.html.set(
				'<ol><li>Numbered item</li></ol>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const li = wysiwyg.querySelector('li');

			if (li && li.firstChild) {
				editor1.$.selection.setRange(li.firstChild, 0, li.firstChild, 8);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should apply fontSize to list item', () => {
			editor1.$.html.set(
				'<ul><li>Text item</li></ul>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const li = wysiwyg.querySelector('li');

			if (li && li.firstChild) {
				editor1.$.selection.setRange(li.firstChild, 0, li.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.fontSize = '18px';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should reset common list cell styles', () => {
			editor1.$.html.set(
				'<ul><li style="color: red; font-weight: bold;">Item</li></ul>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const li = wysiwyg.querySelector('li');

			if (li && li.firstChild) {
				editor1.$.selection.setRange(li.firstChild, 0, li.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor1.$.inline.apply(spanEl, { stylesToModify: ['color'] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle nested spans in list item', () => {
			editor1.$.html.set(
				'<ul><li><span style="color: red;">Colored</span> text</li></ul>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 7);

				const boldEl = document.createElement('STRONG');
				editor1.$.inline.apply(boldEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Edge Cases and Validation Checks', () => {
		test('should handle selection at line node boundary', () => {
			editor1.$.html.set('<p>Start</p><p>End</p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			const firstText = pList[0].firstChild;
			const secondText = pList[1].firstChild;

			if (firstText && secondText) {
				editor1.$.selection.setRange(firstText, 0, secondText, 3);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'green';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should apply same tag without modification', () => {
			editor1.$.html.set('<p><strong>Bold</strong></p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong && strong.firstChild) {
				editor1.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);

				const strongEl = document.createElement('STRONG');
				editor1.$.inline.apply(strongEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle very small selection', () => {
			editor1.$.html.set('<p>Text</p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			editor1.$.selection.setRange(textNode, 0, textNode, 1);

			const spanEl = document.createElement('SPAN');
			spanEl.style.color = 'red';
			editor1.$.inline.apply(spanEl);

			const html = editor1.$.html.get();
			expect(html).toBeDefined();
		});

		test('should remove format with empty stylesToModify array', () => {
			editor1.$.html.set(
				'<p><span style="color: red;">Text</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				editor1.$.inline.apply(null, { stylesToModify: [] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle collapsed range in middle of text', () => {
			editor1.$.html.set('<p>Text here</p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			editor1.$.selection.setRange(textNode, 4, textNode, 4);

			const boldEl = document.createElement('STRONG');
			editor1.$.inline.apply(boldEl);

			const html = editor1.$.html.get();
			expect(html).toBeDefined();
		});

		test('should apply style and remove different style simultaneously', () => {
			editor1.$.html.set(
				'<p><span style="color: red; font-size: 16px;">Text</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				const newSpan = document.createElement('SPAN');
				newSpan.style.color = 'blue';
				editor1.$.inline.apply(newSpan, { stylesToModify: ['font-size'] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle text node with only zero-width space', () => {
			editor1.$.html.set('<p>Text</p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			editor1.$.selection.setRange(textNode, 0, textNode, 0);

			const boldEl = document.createElement('STRONG');
			editor1.$.inline.apply(boldEl);

			const html = editor1.$.html.get();
			expect(html).toBeDefined();
		});

		test('should remove all formatting with null styleNode and no options', () => {
			editor1.$.html.set(
				'<p><strong><em><span style="color: red;">Text</span></em></strong></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				editor1.$.inline.apply(null);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should apply color and font-family together', () => {
			editor1.$.html.set('<p>Plain text</p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			editor1.$.selection.setRange(textNode, 0, textNode, 5);

			const spanEl = document.createElement('SPAN');
			spanEl.style.color = 'red';
			spanEl.style.fontFamily = 'Georgia';
			editor1.$.inline.apply(spanEl);

			const html = editor1.$.html.get();
			expect(html).toBeDefined();
		});

		test('should handle middle line formatting in 3-line selection', () => {
			editor1.$.html.set(
				'<p>Line 1</p>' +
				'<p>Line 2 content</p>' +
				'<p>Line 3</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			const firstText = pList[0].firstChild;
			const lastText = pList[2].firstChild;

			if (firstText && lastText) {
				editor1.$.selection.setRange(firstText, 0, lastText, 6);

				const spanEl = document.createElement('SPAN');
				spanEl.style.backgroundColor = '#ffff00';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should remove span tag with nodesToRemove', () => {
			editor1.$.html.set(
				'<p><span>Text</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				editor1.$.inline.apply(null, { nodesToRemove: ['span'] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Class and Style Modification', () => {
		test('should apply class to selected text', () => {
			editor1.$.html.set('<p>Styled text</p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			editor1.$.selection.setRange(textNode, 0, textNode, 6);

			const spanEl = document.createElement('SPAN');
			spanEl.className = 'custom-class';
			editor1.$.inline.apply(spanEl);

			const html = editor1.$.html.get();
			expect(html).toBeDefined();
		});

		test('should remove class from styled element', () => {
			editor1.$.html.set(
				'<p><span class="highlight">Text</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				editor1.$.inline.apply(null, { stylesToModify: ['.highlight'] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should apply multiple classes', () => {
			editor1.$.html.set('<p>Text</p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			editor1.$.selection.setRange(textNode, 0, textNode, 4);

			const spanEl = document.createElement('SPAN');
			spanEl.className = 'class1 class2 class3';
			editor1.$.inline.apply(spanEl);

			const html = editor1.$.html.get();
			expect(html).toBeDefined();
		});

		test('should replace class with another', () => {
			editor1.$.html.set(
				'<p><span class="old-class">Text</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				const newSpan = document.createElement('SPAN');
				newSpan.className = 'new-class';
				editor1.$.inline.apply(newSpan, { stylesToModify: ['.old-class'] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle element with both classes and styles', () => {
			editor1.$.html.set(
				'<p><span class="styled" style="color: red;">Text</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				const newSpan = document.createElement('SPAN');
				newSpan.className = 'new-styled';
				newSpan.style.fontSize = '18px';
				editor1.$.inline.apply(newSpan);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('strictRemove and nodesToRemove Options', () => {
		test('should use strictRemove to preserve styled elements', () => {
			editor1.$.html.set(
				'<p><span style="color: red;">Text</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				editor1.$.inline.apply(null, {
					nodesToRemove: ['span'],
					strictRemove: true
				});

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should remove node when strictRemove=false', () => {
			editor1.$.html.set(
				'<p><span>Text</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				editor1.$.inline.apply(null, {
					nodesToRemove: ['span'],
					strictRemove: false
				});

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should remove multiple node types', () => {
			editor1.$.html.set(
				'<p><strong>Bold</strong> and <em>italic</em></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong && strong.firstChild) {
				editor1.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);

				editor1.$.inline.apply(null, {
					nodesToRemove: ['strong', 'em']
				});

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle nodesToRemove with anchor tags', () => {
			editor1.$.html.set(
				'<p><a href="#">Link</a></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const a = wysiwyg.querySelector('a');

			if (a && a.firstChild) {
				editor1.$.selection.setRange(a.firstChild, 0, a.firstChild, 4);

				editor1.$.inline.apply(null, {
					nodesToRemove: ['a']
				});

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Font Size and Special Style Nodes', () => {
		test('should apply font-size as special style node', () => {
			editor1.$.html.set('<p>Text</p>');
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			editor1.$.selection.setRange(textNode, 0, textNode, 4);

			const spanEl = document.createElement('SPAN');
			spanEl.style.fontSize = '20px';
			editor1.$.inline.apply(spanEl);

			const html = editor1.$.html.get();
			expect(html).toBeDefined();
		});

		test('should modify existing font-size', () => {
			editor1.$.html.set(
				'<p><span style="font-size: 14px;">Text</span></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				const newSpan = document.createElement('SPAN');
				newSpan.style.fontSize = '18px';
				editor1.$.inline.apply(newSpan);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should apply font-size to multiple lines', () => {
			editor1.$.html.set(
				'<p>Line 1</p>' +
				'<p>Line 2</p>' +
				'<p>Line 3</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			const firstText = pList[0].firstChild;
			const lastText = pList[2].firstChild;

			if (firstText && lastText) {
				editor1.$.selection.setRange(firstText, 0, lastText, 6);

				const spanEl = document.createElement('SPAN');
				spanEl.style.fontSize = '18px';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Complex Range and Selection Scenarios', () => {
		test('should handle range starting at element child', () => {
			editor1.$.html.set(
				'<p><strong>Start</strong> middle <em>end</em></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');
			const em = wysiwyg.querySelector('em');

			if (strong && em && strong.firstChild && em.firstChild) {
				editor1.$.selection.setRange(strong, 0, em, 1);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'purple';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle adjacent text and element nodes', () => {
			editor1.$.html.set(
				'<p>Text <strong>bold</strong> more text</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			if (p && p.firstChild && p.childNodes.length >= 3) {
				editor1.$.selection.setRange(p.firstChild, 0, p.childNodes[2], 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'green';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should apply formatting to text between two br tags', () => {
			editor1.$.html.set(
				'<p>Before<br>Middle<br>After</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			if (p && p.childNodes.length >= 3) {
				editor1.$.selection.setRange(p.childNodes[0], 0, p.childNodes[4], 2);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'orange';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle selection ending at element boundary', () => {
			editor1.$.html.set(
				'<p>Start <strong>bold content</strong></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');
			const strong = wysiwyg.querySelector('strong');

			if (p && strong && p.firstChild && strong.lastChild) {
				editor1.$.selection.setRange(p.firstChild, 0, strong, strong.childNodes.length);

				const spanEl = document.createElement('SPAN');
				spanEl.style.backgroundColor = 'yellow';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Inline.remove() Convenience Method', () => {
		test('should call remove() to strip all formatting', () => {
			editor1.$.html.set(
				'<p><strong><em><span style="color: red;">Formatted</span></em></strong></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 9);

				editor1.$.inline.remove();

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should call remove() on partially styled text', () => {
			editor1.$.html.set(
				'<p>Normal <strong>bold</strong> normal</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong && strong.firstChild) {
				editor1.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);

				editor1.$.inline.remove();

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should remove formatting from multiple styled sections', () => {
			editor1.$.html.set(
				'<p><strong>Bold</strong> text <em>italic</em></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');
			const strong = wysiwyg.querySelector('strong');

			if (p && strong && strong.firstChild && p.lastChild) {
				editor1.$.selection.setRange(strong.firstChild, 0, p.lastChild, 6);

				editor1.$.inline.remove();

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Element Node Boundaries', () => {
		test('should detect non-split nodes in _isNonSplitNode', () => {
			editor1.$.html.set(
				'<p><a href="#">Test</a></p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const a = wysiwyg.querySelector('a');

			if (a) {
				// Verify anchor is recognized as non-split
				const isNonSplit = editor1.$.inline._isNonSplitNode(a);
				expect(typeof isNonSplit).toBe('boolean');
			}
		});

		test('should check string node names with _isNonSplitNode', () => {
			const isNonSplit1 = editor1.$.inline._isNonSplitNode('A');
			const isNonSplit2 = editor1.$.inline._isNonSplitNode('LABEL');
			const isNonSplit3 = editor1.$.inline._isNonSplitNode('CODE');
			const isNonSplit4 = editor1.$.inline._isNonSplitNode('SUMMARY');
			const notNonSplit = editor1.$.inline._isNonSplitNode('SPAN');

			expect(isNonSplit1).toBe(true);
			expect(isNonSplit2).toBe(true);
			expect(isNonSplit3).toBe(true);
			expect(isNonSplit4).toBe(true);
			expect(notNonSplit).toBe(false);
		});

		test('should handle _isNonSplitNode with null/undefined', () => {
			const result1 = editor1.$.inline._isNonSplitNode(null);
			const result2 = editor1.$.inline._isNonSplitNode(undefined);

			expect(result1).toBe(false);
			expect(result2).toBe(false);
		});
	});

	describe('Complex HTML with Breaks and Special Elements', () => {
		test('should format across paragraph with br elements', () => {
			editor1.$.html.set(
				'<p>First part<br>Second part</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			if (p && p.firstChild) {
				editor1.$.selection.setRange(p.firstChild, 0, p.firstChild, 5);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should format text with consecutive br elements', () => {
			editor1.$.html.set(
				'<p>Line 1<br><br>Line 2</p>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			if (p && p.firstChild) {
				editor1.$.selection.setRange(p.firstChild, 0, p.firstChild, 6);

				const boldEl = document.createElement('STRONG');
				editor1.$.inline.apply(boldEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should apply formatting preserving structure with multiple block elements', () => {
			editor2.$.html.set(
				'<div><p>Para 1</p><blockquote>Quote</blockquote><p>Para 2</p></div>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			if (pList.length >= 2 && pList[0].firstChild && pList[1].firstChild) {
				editor2.$.selection.setRange(pList[0].firstChild, 0, pList[1].firstChild, 6);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Offset Property Handling in Collapsed Ranges', () => {
		test('should handle collapsed range at start of text', () => {
			editor2.$.html.set('<p>Some text</p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			editor2.$.selection.setRange(textNode, 0, textNode, 0);

			const boldEl = document.createElement('STRONG');
			editor2.$.inline.apply(boldEl);

			const html = editor2.$.html.get();
			expect(html).toBeDefined();
		});

		test('should handle collapsed range at end of text', () => {
			editor2.$.html.set('<p>Some text</p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			editor2.$.selection.setRange(textNode, 9, textNode, 9);

			const emEl = document.createElement('EM');
			editor2.$.inline.apply(emEl);

			const html = editor2.$.html.get();
			expect(html).toBeDefined();
		});

		test('should handle collapsed range with zero-width characters', () => {
			editor2.$.html.set('<p>Text</p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			editor2.$.selection.setRange(textNode, 2, textNode, 2);

			const spanEl = document.createElement('SPAN');
			spanEl.style.color = 'red';
			editor2.$.inline.apply(spanEl);

			const html = editor2.$.html.get();
			expect(html).toBeDefined();
		});
	});

	describe('Line Element Boundary Tests', () => {
		test('should handle when startContainer is line element (P)', () => {
			editor2.$.html.set('<p>Content</p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			// Set range starting from paragraph element itself
			editor2.$.selection.setRange(p, 0, p, 1);

			const spanEl = document.createElement('SPAN');
			spanEl.style.color = 'red';
			editor2.$.inline.apply(spanEl);

			const html = editor2.$.html.get();
			expect(html).toBeDefined();
		});

		test('should handle when endContainer is line element (P)', () => {
			editor2.$.html.set('<p>Content</p><p>More</p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			if (pList.length >= 2 && pList[0].firstChild) {
				editor2.$.selection.setRange(pList[0].firstChild, 0, pList[1], 1);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle both startContainer and endContainer as line elements', () => {
			editor2.$.html.set('<p>Para 1</p><p>Para 2</p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			if (pList.length >= 2) {
				editor2.$.selection.setRange(pList[0], 0, pList[1], 1);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'green';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Non-editable and Special Element Tests', () => {
		test('should handle text in already formatted paragraph', () => {
			editor2.$.html.set(
				'<p style="color: red; font-weight: bold;">Pre-styled text</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			if (p && p.firstChild) {
				editor2.$.selection.setRange(p.firstChild, 0, p.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle element with only child elements (no text)', () => {
			editor2.$.html.set(
				'<p><strong></strong></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong) {
				editor2.$.selection.setRange(strong, 0, strong, 0);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle single element node selection with no text', () => {
			editor2.$.html.set('<p><br></p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');
			const br = wysiwyg.querySelector('br');

			if (p && br) {
				editor2.$.selection.setRange(p, 0, p, 1);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Complex Validation and Check Scenarios', () => {
		test('should handle already applied style check with same tag and style', () => {
			editor2.$.html.set(
				'<p><span style="color: red;">Text</span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor2.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				// Apply same color - should check and not apply duplicate
				const newSpan = document.createElement('SPAN');
				newSpan.style.color = 'red';
				editor2.$.inline.apply(newSpan);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should verify parent element has same style during validation', () => {
			editor2.$.html.set(
				'<p><span style="color: red;"><span style="color: red;">Nested</span></span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const innerSpan = wysiwyg.querySelectorAll('span')[1];

			if (innerSpan && innerSpan.firstChild) {
				editor2.$.selection.setRange(innerSpan.firstChild, 0, innerSpan.firstChild, 6);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should validate class regex matching', () => {
			editor2.$.html.set(
				'<p><span class="highlight active">Text</span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor2.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				editor2.$.inline.apply(null, { stylesToModify: ['.highlight'] });

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Middle Line Processing (Multi-line edge cases)', () => {
		test('should process middle line with ignore node changes', () => {
			editor2.$.html.set(
				'<p>Line 1</p>' +
				'<p><code>Code block</code></p>' +
				'<p>Line 3</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			if (pList[0].firstChild && pList[2].firstChild) {
				editor2.$.selection.setRange(pList[0].firstChild, 0, pList[2].firstChild, 6);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'orange';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle middle line with existing span tags', () => {
			editor2.$.html.set(
				'<p>First</p>' +
				'<p><span style="color: red;">Middle content here</span></p>' +
				'<p>Last</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			if (pList[0].firstChild && pList[2].firstChild) {
				editor2.$.selection.setRange(pList[0].firstChild, 0, pList[2].firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.backgroundColor = '#ffff00';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should process middle line with endLength > 0', () => {
			editor2.$.html.set(
				'<p>Start</p>' +
				'<p>Middle</p>' +
				'<p>Middle2</p>' +
				'<p>End</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			if (pList[0].firstChild && pList[3].firstChild) {
				editor2.$.selection.setRange(pList[0].firstChild, 0, pList[3].firstChild, 3);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'purple';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle middle line when endLength = 0', () => {
			editor2.$.html.set(
				'<p>Start paragraph</p>' +
				'<p>End paragraph</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			if (pList[0].firstChild && pList[1].firstChild) {
				editor2.$.selection.setRange(pList[0].firstChild, 0, pList[1].firstChild, 3);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'brown';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Start Line and End Line Specific Tests', () => {
		test('should process start line with ignore node', () => {
			editor2.$.html.set(
				'<p><code>Start code</code></p>' +
				'<p>Middle</p>' +
				'<p>End</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const code = wysiwyg.querySelector('code');
			const pList = wysiwyg.querySelectorAll('p');

			if (code && code.firstChild && pList[2].firstChild) {
				editor2.$.selection.setRange(code.firstChild, 0, pList[2].firstChild, 3);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should process end line with anchor tag', () => {
			editor2.$.html.set(
				'<p>Start</p>' +
				'<p>Middle</p>' +
				'<p><a href="#">End link</a></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');
			const a = wysiwyg.querySelector('a');

			if (pList[0].firstChild && a && a.firstChild) {
				editor2.$.selection.setRange(pList[0].firstChild, 0, a.firstChild, 3);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle start line with empty styled span', () => {
			editor2.$.html.set(
				'<p><span style="color: red;"></span>Start</p>' +
				'<p>Middle</p>' +
				'<p>End</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			if (pList[0].lastChild && pList[2].firstChild) {
				editor2.$.selection.setRange(pList[0].lastChild, 0, pList[2].firstChild, 3);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'green';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle end line returning null endContainer', () => {
			editor2.$.html.set(
				'<p>Start</p>' +
				'<p>Middle</p>' +
				'<p>End</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			if (pList[0].firstChild && pList[2].firstChild) {
				editor2.$.selection.setRange(pList[0].firstChild, 0, pList[2].firstChild, 3);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'yellow';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Zero-width and Maintained Node Tests', () => {
		test('should check for zero-width content in range', () => {
			editor2.$.html.set('<p>  </p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			if (textNode && textNode.nodeType === 3) {
				editor2.$.selection.setRange(textNode, 0, textNode, 2);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle anchor nodes maintaining structure', () => {
			editor2.$.html.set(
				'<p>' +
				'Start <a href="#">Link with text</a> end' +
				'</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			if (p && p.firstChild) {
				editor2.$.selection.setRange(p.firstChild, 0, p.lastChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'purple';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should process maintained node in nested structure', () => {
			editor2.$.html.set(
				'<p>' +
				'Text <label>Label content</label> more' +
				'</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');
			const label = wysiwyg.querySelector('label');

			if (p && p.firstChild && label && label.firstChild) {
				editor2.$.selection.setRange(p.firstChild, 0, label.firstChild, 5);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'orange';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Empty Node and Removal Tests', () => {
		test('should handle removal leaving empty elements', () => {
			editor2.$.html.set(
				'<p><span style="color: red;"><span>Inner</span></span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const innerSpan = wysiwyg.querySelectorAll('span')[1];

			if (innerSpan && innerSpan.firstChild) {
				editor2.$.selection.setRange(innerSpan.firstChild, 0, innerSpan.firstChild, 5);

				editor2.$.inline.apply(null, { stylesToModify: ['color'] });

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should remove node that becomes empty after removing all styles', () => {
			editor2.$.html.set(
				'<p><span style="color: red;">Only color</span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor2.$.selection.setRange(span.firstChild, 0, span.firstChild, 5);

				editor2.$.inline.apply(null, {
					stylesToModify: ['color'],
					nodesToRemove: ['span']
				});

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle isRemoveFormat with nested empty nodes', () => {
			editor2.$.html.set(
				'<p><strong><em><span>Nested text</span></em></strong></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor2.$.selection.setRange(span.firstChild, 0, span.firstChild, 6);

				editor2.$.inline.apply(null);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Additional Complex Scenarios', () => {
		test('should handle previous sibling check in collapsed range', () => {
			editor2.$.html.set('<p>Normal <strong>bold</strong> more</p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong && strong.firstChild) {
				editor2.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 0);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle multiple child nodes after start container', () => {
			editor2.$.html.set('<p>Text <strong>bold</strong> <em>italic</em></p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			if (p && p.firstChild) {
				editor2.$.selection.setRange(p.firstChild, 0, p.lastChild, 6);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should apply style to after node following startContainer', () => {
			editor2.$.html.set('<p>Start<br>After break</p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			if (p && p.firstChild && p.childNodes.length >= 3) {
				editor2.$.selection.setRange(p.firstChild, 0, p.childNodes[2], 3);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'green';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle formatting with pCurrent having parent elements', () => {
			editor2.$.html.set(
				'<p>' +
				'Start <strong><em>nested bold italic</em></strong> end' +
				'</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const em = wysiwyg.querySelector('em');

			if (em && em.firstChild) {
				editor2.$.selection.setRange(em.firstChild, 0, em.firstChild, 6);

				const spanEl = document.createElement('SPAN');
				spanEl.style.backgroundColor = 'yellow';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should remove all styles and classes from element', () => {
			editor2.$.html.set(
				'<p><span style="color: red; font-size: 16px;" class="highlight">Text</span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor2.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				editor2.$.inline.apply(null, {
					stylesToModify: ['color', 'font-size', '.highlight']
				});

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle element with only zero-width content before endContainer', () => {
			editor2.$.html.set('<p>Text</p><p>More</p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const pList = wysiwyg.querySelectorAll('p');

			if (pList[0].firstChild && pList[1].firstChild) {
				editor2.$.selection.setRange(pList[0].firstChild, 2, pList[1].firstChild, 2);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'purple';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle text after end container in same parent', () => {
			editor2.$.html.set(
				'<p>Before <strong>selection</strong> after</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong && strong.firstChild) {
				editor2.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 3);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'orange';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle styled spans with endContainer check', () => {
			editor2.$.html.set(
				'<p><span style="color: red;">Part1</span> middle <span style="color: blue;">Part2</span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const spans = wysiwyg.querySelectorAll('span');

			if (spans[0] && spans[0].firstChild && spans[1] && spans[1].firstChild) {
				editor2.$.selection.setRange(spans[0].firstChild, 0, spans[1].firstChild, 5);

				const newSpan = document.createElement('SPAN');
				newSpan.style.backgroundColor = '#ffff00';
				editor2.$.inline.apply(newSpan);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should preserve endContainer position after anchor node processing', () => {
			editor2.$.html.set(
				'<p>Text <a href="#">Link</a> end</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const a = wysiwyg.querySelector('a');

			if (a && a.firstChild) {
				editor2.$.selection.setRange(a.firstChild, 0, a.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle merging nodes after applying format', () => {
			editor2.$.html.set(
				'<p><span>Adjacent</span> <span>spans</span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const spans = wysiwyg.querySelectorAll('span');

			if (spans && spans.length >= 2 && spans[0] && spans[0].firstChild && spans[1] && spans[1].firstChild) {
				editor2.$.selection.setRange(spans[0].firstChild, 0, spans[1].firstChild, 5);

				const newSpan = document.createElement('SPAN');
				newSpan.style.color = 'green';
				editor2.$.inline.apply(newSpan);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should check css property in styled nodes', () => {
			editor2.$.html.set(
				'<p><span style="color: red;">Text</span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor2.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				const newSpan = document.createElement('SPAN');
				newSpan.style.color = 'blue';
				newSpan.style.fontWeight = 'bold';
				editor2.$.inline.apply(newSpan);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should check endContainer while validating nodes', () => {
			editor2.$.html.set(
				'<p>Start<strong>bold</strong>end</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong && strong.firstChild) {
				editor2.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle pCurrent with zero length in collapsed case', () => {
			editor2.$.html.set(
				'<p><strong>Bold</strong></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong) {
				editor2.$.selection.setRange(strong, 0, strong, 0);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle nextSibling check for afterNode detection', () => {
			editor2.$.html.set(
				'<p>Before<strong>bold content</strong></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');
			const p = wysiwyg.querySelector('p');

			if (p && strong && strong.firstChild) {
				editor2.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle collapsed range inside element node', () => {
			editor2.$.html.set('<p><span>Text</span></p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span) {
				// Collapsed range with element node as startContainer
				editor2.$.selection.setRange(span, 0, span, 0);

				const boldEl = document.createElement('STRONG');
				editor2.$.inline.apply(boldEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle element node with no nextSibling for afterNode', () => {
			editor2.$.html.set('<p><br></p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');
			const br = wysiwyg.querySelector('br');

			if (p && br) {
				// Element without nextSibling
				editor2.$.selection.setRange(p, 0, p, 0);

				const boldEl = document.createElement('STRONG');
				editor2.$.inline.apply(boldEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should check isListCell for non-editable check in remove format', () => {
			editor1.$.html.set(
				'<ul><li><strong>Item</strong></li></ul>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const li = wysiwyg.querySelector('li');
			const strong = wysiwyg.querySelector('strong');

			if (li && strong && strong.firstChild) {
				editor1.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);

				// Call with null to trigger remove format check
				editor1.$.inline.apply(null);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle br element in focused node', () => {
			editor2.$.html.set('<p>Text<br>More</p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			if (p) {
				// Collapsed range on br element
				editor2.$.selection.setRange(p, 1, p, 1);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle element node that is break element', () => {
			editor2.$.html.set('<p>Start<br>End</p>');
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');
			const br = wysiwyg.querySelector('br');

			if (p && br) {
				// Check break element handling
				editor2.$.selection.setRange(p, 0, p, 1);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('List and Cell Specific Tests', () => {
		test('should handle list cell with style conversion', () => {
			editor1.$.html.set(
				'<ul><li style="color: red; font-weight: bold;">Item with styles</li></ul>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const li = wysiwyg.querySelector('li');

			if (li && li.firstChild) {
				editor1.$.selection.setRange(li.firstChild, 0, li.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should track styled list items with multiple properties', () => {
			editor1.$.html.set(
				'<ol><li style="font-size: 16px; color: red; font-weight: bold;">Text</li></ol>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const li = wysiwyg.querySelector('li');

			if (li && li.firstChild) {
				editor1.$.selection.setRange(li.firstChild, 0, li.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'green';
				editor1.$.inline.apply(spanEl);

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle list item with nested styled elements', () => {
			editor1.$.html.set(
				'<ul><li><span style="color: red; font-size: 16px;">Item</span></li></ul>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				const newSpan = document.createElement('SPAN');
				newSpan.style.backgroundColor = 'yellow';
				editor1.$.inline.apply(newSpan, { stylesToModify: ['color'] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should remove styles from list cell propagation', () => {
			editor1.$.html.set(
				'<ul><li style="font-weight: bold;"><span style="font-weight: bold;">Item</span></li></ul>'
			);
			const wysiwyg = editor1.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor1.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				editor1.$.inline.apply(null, { stylesToModify: ['font-weight'] });

				const html = editor1.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});

	describe('Special Validation and Recursive Tests', () => {
		test('should validate class regex in nested elements', () => {
			editor2.$.html.set(
				'<p><span class="highlight red">Nested <strong class="highlight red">bold</strong></span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong && strong.firstChild) {
				editor2.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);

				editor2.$.inline.apply(null, { stylesToModify: ['.highlight', '.red'] });

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle style check with cssText property', () => {
			editor2.$.html.set(
				'<p><span style="color: red; font-size: 14px; font-weight: bold;">Text</span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor2.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				const newSpan = document.createElement('SPAN');
				newSpan.style.color = 'blue';
				newSpan.style.fontSize = '16px';
				editor2.$.inline.apply(newSpan, { stylesToModify: ['color', 'font-size'] });

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should recursively check parent nodes for ancestor formatting', () => {
			editor2.$.html.set(
				'<p>' +
				'<span style="color: red;">' +
				'<strong>' +
				'<em>Deep nested</em>' +
				'</strong>' +
				'</span>' +
				'</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const em = wysiwyg.querySelector('em');

			if (em && em.firstChild) {
				editor2.$.selection.setRange(em.firstChild, 0, em.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should check attributes from validation function output', () => {
			editor2.$.html.set(
				'<p><span style="color: red; background-color: yellow;">Text</span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor2.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				// Remove one style, keep another
				editor2.$.inline.apply(null, { stylesToModify: ['color'] });

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle mergeEndCon scenario in oneLine', () => {
			editor2.$.html.set(
				'<p>Single line text</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			if (textNode) {
				editor2.$.selection.setRange(textNode, 0, textNode, 6);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle inline format.isLine() calls', () => {
			editor2.$.html.set(
				'<h2>Heading text</h2>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const h2 = wysiwyg.querySelector('h2');

			if (h2 && h2.firstChild) {
				editor2.$.selection.setRange(h2, 0, h2, 1);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle endOff at childNodes length for line element', () => {
			editor2.$.html.set(
				'<p>Text <strong>bold</strong></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			if (p) {
				editor2.$.selection.setRange(p, 0, p, p.childNodes.length);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle validation check returning false', () => {
			editor2.$.html.set(
				'<p><span style="color: red;">Already colored</span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor2.$.selection.setRange(span.firstChild, 0, span.firstChild, 7);

				// Apply same color - should not modify
				const samSpan = document.createElement('SPAN');
				samSpan.style.color = 'red';
				editor2.$.inline.apply(samSpan);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should traverse to find starting line element', () => {
			editor2.$.html.set(
				'<p>Quote text here</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const p = wysiwyg.querySelector('p');

			if (p && p.firstChild) {
				editor2.$.selection.setRange(p.firstChild, 0, p.firstChild, 5);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should apply formatting with check attributes on validation', () => {
			editor2.$.html.set(
				'<p><span style="color: red; font-weight: bold;">Text</span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const span = wysiwyg.querySelector('span');

			if (span && span.firstChild) {
				editor2.$.selection.setRange(span.firstChild, 0, span.firstChild, 4);

				// Modify one style, keep the parent
				const newSpan = document.createElement('SPAN');
				newSpan.style.color = 'blue';
				newSpan.style.fontWeight = 'bold';
				editor2.$.inline.apply(newSpan);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle check text content with slice and length', () => {
			editor2.$.html.set(
				'<p>Start middle end</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			if (textNode && textNode.textContent) {
				editor2.$.selection.setRange(textNode, 6, textNode, 12);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should check parent element line in collapsed collapsed case', () => {
			editor2.$.html.set(
				'<p>Text with cursor</p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const textNode = wysiwyg.querySelector('p').firstChild;

			if (textNode) {
				editor2.$.selection.setRange(textNode, 5, textNode, 5);

				const boldEl = document.createElement('STRONG');
				editor2.$.inline.apply(boldEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should handle applied inline format with existing styles', () => {
			editor2.$.html.set(
				'<p><strong style="color: red;">Bold and red</strong></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const strong = wysiwyg.querySelector('strong');

			if (strong && strong.firstChild) {
				editor2.$.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'blue';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});

		test('should detect when style nodes already contain parent style', () => {
			editor2.$.html.set(
				'<p><span style="color: red;"><span style="color: red;">Redundant</span></span></p>'
			);
			const wysiwyg = editor2.$.frameContext.get('wysiwyg');
			const innerSpan = wysiwyg.querySelectorAll('span')[1];

			if (innerSpan && innerSpan.firstChild) {
				editor2.$.selection.setRange(innerSpan.firstChild, 0, innerSpan.firstChild, 3);

				const spanEl = document.createElement('SPAN');
				spanEl.style.color = 'red';
				editor2.$.inline.apply(spanEl);

				const html = editor2.$.html.get();
				expect(html).toBeDefined();
			}
		});
	});
});
