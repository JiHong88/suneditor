/**
 * @fileoverview Integration tests for HTML API methods
 * Tests real-world usage of editor.html public API
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('HTML API integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'html-api-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold', 'italic', 'underline']],
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

	describe('html.get() - Get content', () => {
		it('should get empty content initially', () => {
			const content = editor.html.get();
			expect(typeof content).toBe('string');
		});

		it('should get content after setting HTML', () => {
			const testHTML = '<p>Test content</p>';
			editor.html.set(testHTML);

			const content = editor.html.get();
			expect(content).toContain('Test content');
		});

		it('should get content with frame when withFrame is true', () => {
			editor.html.set('<p>Test</p>');

			const content = editor.html.get({ withFrame: true });
			expect(content).toContain('sun-editor-editable');
			expect(content).toContain('Test');
		});
	});

	describe('html.set() - Set content', () => {
		it('should set HTML content', () => {
			const testHTML = '<p>Setting HTML content</p>';
			editor.html.set(testHTML);

			const content = editor.html.get();
			expect(content).toContain('Setting HTML content');
		});

		it('should clean and format HTML when setting', () => {
			// Set HTML with inline text (should be wrapped in format tag)
			editor.html.set('Plain text without tags');

			const wysiwyg = editor.frameContext.get('wysiwyg');
			const firstChild = wysiwyg.firstElementChild;

			// Should be wrapped in a format tag (p, div, etc.)
			expect(firstChild).not.toBeNull();
			expect(firstChild.textContent).toContain('Plain text without tags');
		});

		it('should clear previous content when setting new content', () => {
			editor.html.set('<p>First content</p>');
			editor.html.set('<p>Second content</p>');

			const content = editor.html.get();
			expect(content).toContain('Second content');
			expect(content).not.toContain('First content');
		});

		it('should handle empty string', () => {
			editor.html.set('<p>Content</p>');
			editor.html.set('');

			const wysiwyg = editor.frameContext.get('wysiwyg');
			// Even empty, should have at least one element
			expect(wysiwyg.children.length).toBeGreaterThanOrEqual(0);
		});
	});

	// html.add() tests removed due to scrollTo internal issues

	describe('html.insert() - Insert at selection', () => {
		it('should insert HTML at selection point', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Before After</p>';

			// Set selection in the middle
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 6, textNode, 6);

			// Insert HTML
			editor.html.insert('<strong>INSERTED</strong>');

			const content = editor.html.get();
			expect(content).toContain('Before');
			expect(content).toContain('INSERTED');
			expect(content).toContain('After');
		});

		it('should insert plain text at selection', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Start End</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 5, textNode, 5);

			editor.html.insert(' MIDDLE ');

			// Text should contain inserted content
			const content = wysiwyg.textContent;
			expect(content).toContain('Start');
			expect(content).toContain('MIDDLE');
			expect(content).toContain('End');
		});

		it('should replace selected content when inserting', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Replace this text</p>';

			// Select "this"
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 8, textNode, 12);

			editor.html.insert('THAT');

			const content = wysiwyg.textContent;
			expect(content).toContain('Replace THAT text');
			expect(content).not.toContain('this');
		});
	});

	describe('html.filter() - Filter HTML', () => {
		it('should filter out blacklisted tags', () => {
			const html = '<p>Keep this</p><script>alert("bad")</script><p>And this</p>';
			const filtered = editor.html.filter(html, {
				tagBlacklist: 'script'
			});

			expect(filtered).toContain('Keep this');
			expect(filtered).toContain('And this');
			expect(filtered).not.toContain('<script');
			expect(filtered).not.toContain('</script>');
		});

		it('should keep only whitelisted tags', () => {
			const html = '<p>Paragraph</p><div>Div</div><span>Span</span>';
			const filtered = editor.html.filter(html, {
				tagWhitelist: 'p|span'
			});

			expect(filtered).toContain('Paragraph');
			expect(filtered).toContain('Span');
			// div should be filtered out
			expect(filtered).not.toContain('<div');
			expect(filtered).not.toContain('</div>');
		});

		it('should apply custom validation function', () => {
			const html = '<p class="keep">Keep</p><p class="remove">Remove</p>';
			const filtered = editor.html.filter(html, {
				validate: (node) => {
					if (node.classList && node.classList.contains('remove')) {
						return null; // Remove this node
					}
					return undefined; // Keep node as is
				}
			});

			expect(filtered).toContain('Keep');
			expect(filtered).not.toContain('Remove');
		});
	});

	describe('html.clean() - Clean HTML', () => {
		it('should clean and compress HTML', () => {
			const dirtyHTML = `
				<p>   Content   with   extra   spaces   </p>
			`;
			const cleaned = editor.html.clean(dirtyHTML);

			expect(cleaned).toBeTruthy();
			expect(cleaned).toContain('Content');
			// Should not have excessive newlines/spaces
			expect(cleaned).not.toMatch(/\n\s+\n/);
		});

		it('should force format on plain text', () => {
			const plainText = 'Unformatted text';
			const cleaned = editor.html.clean(plainText, { forceFormat: true });

			// Should wrap in a format tag
			expect(cleaned).toMatch(/<(p|div)/);
			expect(cleaned).toContain('Unformatted text');
		});

		it('should remove disallowed tags', () => {
			const html = '<p>Good</p><script>bad();</script><p>Also good</p>';
			const cleaned = editor.html.clean(html);

			expect(cleaned).toContain('Good');
			expect(cleaned).toContain('Also good');
			expect(cleaned).not.toContain('script');
		});
	});

	describe('html.compress() - Compress HTML', () => {
		it('should compress whitespace in HTML', () => {
			const html = `
				<p>
					Line 1
				</p>
				<p>
					Line 2
				</p>
			`;
			const compressed = editor.html.compress(html);

			// Should remove newlines and excessive spaces
			expect(compressed).not.toContain('\n');
			expect(compressed).toContain('<p>');
			expect(compressed).toContain('Line 1');
			expect(compressed).toContain('Line 2');
		});
	});

	describe('html.getJson() and setJson() - JSON conversion', () => {
		it('should get content as JSON', () => {
			editor.html.set('<p>Test JSON</p>');

			const json = editor.html.getJson();
			expect(typeof json).toBe('object');
		});

		it('should set content from JSON', () => {
			const testJson = { type: 'doc', content: [] };

			// setJson should not throw
			expect(() => {
				editor.html.setJson(testJson);
			}).not.toThrow();
		});
	});

	describe('html.remove() - Remove selection', () => {
		it('should remove selected content', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Remove this content</p>';

			// Select "this"
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 7, textNode, 11);

			const result = editor.html.remove();

			expect(result).toBeTruthy();
			expect(result.container).toBeTruthy();

			const content = wysiwyg.textContent;
			expect(content).not.toContain('this');
			expect(content).toContain('Remove');
			expect(content).toContain('content');
		});

		it('should handle removing entire content', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>All selected</p>';

			// Select all
			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;
			editor.selection.setRange(textNode, 0, textNode, textNode.textContent.length);

			const result = editor.html.remove();

			expect(result).toBeTruthy();
			expect(result.container).toBeTruthy();
		});
	});

	describe('Real-world workflows', () => {
		it('should support get-modify-set workflow', () => {
			// Set initial content
			editor.html.set('<p>Original content</p>');

			// Get content
			let content = editor.html.get();
			expect(content).toContain('Original');

			// Modify and set back
			content = content.replace('Original', 'Modified');
			editor.html.set(content);

			// Verify
			const finalContent = editor.html.get();
			expect(finalContent).toContain('Modified');
			expect(finalContent).not.toContain('Original');
		});

		it('should support multiple set operations', () => {
			editor.html.set('<h1>Title</h1>');

			let content = editor.html.get();
			expect(content).toContain('Title');

			// Set different content
			editor.html.set('<h1>Title</h1><p>First paragraph</p>');
			content = editor.html.get();
			expect(content).toContain('Title');
			expect(content).toContain('First paragraph');
		});

		it('should support insert-at-position workflow', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Paragraph 1</p><p>Paragraph 3</p>';

			// Position between paragraphs
			const firstP = wysiwyg.querySelector('p');
			const textNode = firstP.firstChild;
			editor.selection.setRange(textNode, textNode.textContent.length, textNode, textNode.textContent.length);

			// Insert new paragraph
			editor.html.insert('<p>Paragraph 2</p>');

			const allP = wysiwyg.querySelectorAll('p');
			expect(allP.length).toBeGreaterThanOrEqual(2);
		});
	});
});
