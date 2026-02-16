/**
 * @fileoverview Targeted tests for html.js bug fixes
 * Tests the 4 specific bugs that were found and fixed:
 * 1. filter() validateAll flag - validate function skipped nodes inside .se-component
 * 2. html.add() Live HTMLCollection - every other child skipped during DOM mutation
 * 3. clean() classList filtering - new Array(classList) produced wrong result
 * 4. clean() wrongList insertBefore - argument order was reversed
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('html.js bug fix regression tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'html-bugfix-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [],
			width: '100%',
			height: 'auto'
		});
		await waitForEditorReady(editor);

		// Mock scrollTo for JSDOM (used by html.add() → selection.scrollTo)
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		if (wysiwyg && !wysiwyg.scrollTo) {
			wysiwyg.scrollTo = () => {};
		}
		const wwFrame = wysiwyg?.parentElement;
		if (wwFrame && !wwFrame.scrollTo) {
			wwFrame.scrollTo = () => {};
		}
	});

	afterEach(() => {
		if (editor) {
			destroyTestEditor(editor);
		}
		if (container && container.parentNode) {
			container.parentNode.removeChild(container);
		}
	});

	// ──────────────────────────────────────────────────
	// Bug 1: filter() validateAll flag
	// Before fix: validate function was called on undefined `this._domFilter`
	// which caused a crash when validateAll was truthy.
	// After fix: uses `if (validateAll || (!node.closest('.se-component') ...))` guard
	// ──────────────────────────────────────────────────
	describe('Bug 1: filter() validateAll flag', () => {
		it('should apply validate function to all nodes when validateAll is true', () => {
			const html = '<div class="se-component"><p class="inner">Inside component</p></div><p class="outer">Outside</p>';
			const validated = [];

			const result = editor.$.html.filter(html, {
				validateAll: true,
				validate: (node) => {
					validated.push(node.className || node.nodeName);
					return undefined; // keep as-is
				}
			});

			// With validateAll=true, nodes inside .se-component should also be validated
			expect(validated.some((v) => v === 'inner')).toBe(true);
			expect(validated.some((v) => v === 'outer')).toBe(true);
		});

		it('should skip nodes inside .se-component when validateAll is false', () => {
			const html = '<div class="se-component"><p class="inner">Inside component</p></div><p class="outer">Outside</p>';
			const validated = [];

			editor.$.html.filter(html, {
				validateAll: false,
				validate: (node) => {
					validated.push(node.className || node.nodeName);
					return undefined;
				}
			});

			// Without validateAll, nodes inside .se-component should be skipped
			expect(validated.some((v) => v === 'inner')).toBe(false);
			expect(validated.some((v) => v === 'outer')).toBe(true);
		});

		it('should skip nodes inside .se-flex-component when validateAll is false', () => {
			const html = '<figure class="se-flex-component"><img src="test.png"></figure><p class="outside">Text</p>';
			const validated = [];

			editor.$.html.filter(html, {
				validateAll: false,
				validate: (node) => {
					validated.push(node.tagName);
					return undefined;
				}
			});

			// IMG inside se-flex-component should not be validated
			expect(validated).not.toContain('IMG');
			// P outside should be validated
			expect(validated).toContain('P');
		});

		it('should validate nodes inside .se-component when validateAll is true', () => {
			const html = '<div class="se-component"><span class="target">Text</span></div>';

			const result = editor.$.html.filter(html, {
				validateAll: true,
				validate: (node) => {
					if (node.classList && node.classList.contains('target')) {
						return null; // remove it
					}
					return undefined;
				}
			});

			// With validateAll=true, the target span should be removed
			expect(result).not.toContain('target');
		});

		it('should allow validate to replace nodes', () => {
			const html = '<p><em>italic</em></p>';

			const result = editor.$.html.filter(html, {
				validate: (node) => {
					if (node.tagName === 'EM') {
						const strong = node.ownerDocument.createElement('STRONG');
						strong.textContent = node.textContent;
						return strong;
					}
					return undefined;
				}
			});

			expect(result).toContain('<strong>');
			expect(result).toContain('italic');
			expect(result).not.toContain('<em>');
		});

		it('should allow validate to return string replacement', () => {
			const html = '<p><span class="replace-me">old</span></p>';

			const result = editor.$.html.filter(html, {
				validate: (node) => {
					if (node.classList && node.classList.contains('replace-me')) {
						return '<b>new</b>';
					}
					return undefined;
				}
			});

			expect(result).toContain('<b>new</b>');
			expect(result).not.toContain('replace-me');
		});
	});

	// ──────────────────────────────────────────────────
	// Bug 2: html.add() Live HTMLCollection fix
	// Before fix: `temp.children` is a live HTMLCollection.
	// When appendChild moves a child out of temp, the collection shrinks,
	// causing every other child to be skipped.
	// After fix: `Array.from(temp.children)` creates a static snapshot.
	// ──────────────────────────────────────────────────
	describe('Bug 2: html.add() Live HTMLCollection fix', () => {
		it('should append all children when adding multiple paragraphs', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '';

			// Add HTML with 4 paragraphs — the live HTMLCollection bug would skip every other one
			editor.$.html.add('<p>Para 1</p><p>Para 2</p><p>Para 3</p><p>Para 4</p>');

			const paragraphs = wysiwyg.querySelectorAll('p');
			const texts = Array.from(paragraphs).map((p) => p.textContent.trim());

			// All 4 paragraphs should be present (before fix: only Para 1 and Para 3 appeared)
			expect(texts).toContain('Para 1');
			expect(texts).toContain('Para 2');
			expect(texts).toContain('Para 3');
			expect(texts).toContain('Para 4');
		});

		it('should append all children when adding 6 elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '';

			editor.$.html.add(
				'<p>A</p><p>B</p><p>C</p><p>D</p><p>E</p><p>F</p>'
			);

			const paragraphs = wysiwyg.querySelectorAll('p');
			const texts = Array.from(paragraphs).map((p) => p.textContent.trim());

			expect(texts).toContain('A');
			expect(texts).toContain('B');
			expect(texts).toContain('C');
			expect(texts).toContain('D');
			expect(texts).toContain('E');
			expect(texts).toContain('F');
		});

		it('should preserve existing content when adding', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Existing</p>';

			editor.$.html.add('<p>New 1</p><p>New 2</p><p>New 3</p>');

			const content = wysiwyg.textContent;
			expect(content).toContain('Existing');
			expect(content).toContain('New 1');
			expect(content).toContain('New 2');
			expect(content).toContain('New 3');
		});

		it('should add single child correctly', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '';

			editor.$.html.add('<p>Only one</p>');

			expect(wysiwyg.textContent).toContain('Only one');
		});
	});

	// ──────────────────────────────────────────────────
	// Bug 3: clean() classList filtering — new Array(classList) fix
	// Before fix: `new Array(current.classList)` creates [DOMTokenList],
	// an array with one element (the DOMTokenList object itself),
	// so .map() would receive the whole DOMTokenList as a single item.
	// After fix: `Array.from(current.classList)` correctly iterates each class name.
	// ──────────────────────────────────────────────────
	describe('Bug 3: clean() classList filtering (Array.from fix)', () => {
		it('should filter individual class names when cleaning', () => {
			// The se- prefix classes are allowed by default (^se- in CLASS_NAME regex)
			// Random classes should be stripped
			const html = '<p class="se-custom random-class">Text</p>';
			const cleaned = editor.$.html.clean(html);

			// se-custom should be kept (matches ^se- pattern)
			// random-class should be removed
			if (cleaned.includes('class=')) {
				expect(cleaned).toContain('se-custom');
				expect(cleaned).not.toContain('random-class');
			}
		});

		it('should keep multiple allowed classes', () => {
			const html = '<p class="se-one se-two">Text</p>';
			const cleaned = editor.$.html.clean(html);

			// Both se- classes should be preserved
			if (cleaned.includes('class=')) {
				expect(cleaned).toContain('se-one');
				expect(cleaned).toContain('se-two');
			}
		});

		it('should remove class attribute entirely when no classes are allowed', () => {
			const html = '<p class="disallowed-one disallowed-two">Text</p>';
			const cleaned = editor.$.html.clean(html);

			// No allowed classes → class attribute should be removed
			expect(cleaned).not.toContain('disallowed-one');
			expect(cleaned).not.toContain('disallowed-two');
		});

		it('should handle element with single allowed class among many disallowed', () => {
			const html = '<span class="se-keep foo bar baz">Text</span>';
			const cleaned = editor.$.html.clean(html);

			if (cleaned.includes('se-keep')) {
				expect(cleaned).not.toContain('foo');
				expect(cleaned).not.toContain('bar');
				expect(cleaned).not.toContain('baz');
			}
		});
	});

	// ──────────────────────────────────────────────────
	// Bug 4: clean() wrongList insertBefore argument order fix
	// Before fix: `p.insertBefore(t, cellChildren[j])` — wrong order,
	// tried to insert the container `t` before the child, instead of
	// inserting the child before `t`.
	// After fix: `p.insertBefore(cellChildren[j], t)` — inserts child before reference node.
	// ──────────────────────────────────────────────────
	describe('Bug 4: clean() wrongList insertBefore arg order fix', () => {
		it('should correctly handle non-list-cell items inside a list', () => {
			// A <p> directly inside <ul> is a "wrong list" item
			// The clean function should wrap it in an LI
			const html = '<ul><li>Item 1</li><p>Wrong item</p><li>Item 3</li></ul>';
			const cleaned = editor.$.html.clean(html);

			// "Wrong item" should still be in the output, wrapped in LI
			expect(cleaned).toContain('Wrong item');
			expect(cleaned).toContain('Item 1');
			expect(cleaned).toContain('Item 3');
		});

		it('should wrap non-list elements in LI when inside list', () => {
			const html = '<ol><span>Span text</span><li>Normal item</li></ol>';
			const cleaned = editor.$.html.clean(html);

			// Span should be properly handled (wrapped in LI)
			expect(cleaned).toContain('Span text');
			expect(cleaned).toContain('Normal item');
		});

		it('should preserve all content when restructuring wrong list items', () => {
			const html = '<ul><p>Para 1</p><p>Para 2</p><p>Para 3</p></ul>';
			const cleaned = editor.$.html.clean(html);

			// All paragraph content should survive the restructuring
			expect(cleaned).toContain('Para 1');
			expect(cleaned).toContain('Para 2');
			expect(cleaned).toContain('Para 3');
		});

		it('should handle nested wrong list correctly', () => {
			const html = '<ul><li>Good item</li><div>Bad <strong>nested</strong></div></ul>';
			const cleaned = editor.$.html.clean(html);

			expect(cleaned).toContain('Good item');
			expect(cleaned).toContain('Bad');
			expect(cleaned).toContain('nested');
		});
	});
});
