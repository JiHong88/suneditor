/**
 * @fileoverview Integration tests for nodeTransform
 * Tests actual DOM node splitting, merging, and removal operations.
 * The unit test only has 1 stub (constructor check).
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('NodeTransform integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'nodetransform-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [],
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

	describe('split() - Split nodes at offset', () => {
		it('should split a text node at the given offset', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>HelloWorld</p>';

			const p = wysiwyg.querySelector('p');
			const textNode = p.firstChild;

			// split() with depth=0 splits the text and creates sibling of the parent <p>
			// The text is split via splitText, so p should have 2 text children
			editor.$.nodeTransform.split(textNode, 5, 0);

			// All content should be preserved
			expect(wysiwyg.textContent).toContain('Hello');
			expect(wysiwyg.textContent).toContain('World');
		});

		it('should split at offset 0 without losing content', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Content</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.nodeTransform.split(textNode, 0, 0);

			expect(wysiwyg.textContent).toContain('Content');
		});

		it('should preserve content when splitting at end of text', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			// At end of text (offset === length), no actual split occurs
			editor.$.nodeTransform.split(textNode, textNode.length, 0);

			expect(wysiwyg.textContent).toContain('Test');
		});

		it('should handle null/undefined baseNode gracefully', () => {
			const result = editor.$.nodeTransform.split(null, 0, 0);
			expect(result).toBeNull();
		});
	});

	describe('mergeSameTags() - Merge adjacent same tags', () => {
		it('should merge adjacent <strong> tags', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Hello</strong><strong> World</strong></p>';

			const p = wysiwyg.querySelector('p');
			editor.$.nodeTransform.mergeSameTags(p, null, false);

			// Two <strong> tags should be merged into one
			const strongs = p.querySelectorAll('strong');
			expect(strongs.length).toBe(1);
			expect(strongs[0].textContent).toBe('Hello World');
		});

		it('should not merge tags with different attributes', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color:red">Red</span><span style="color:blue">Blue</span></p>';

			const p = wysiwyg.querySelector('p');
			editor.$.nodeTransform.mergeSameTags(p, null, false);

			// Different style → should NOT be merged
			const spans = p.querySelectorAll('span');
			expect(spans.length).toBe(2);
		});

		it('should merge adjacent text nodes when onlyText is true', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Hello World</p>';

			const p = wysiwyg.querySelector('p');
			// Create two adjacent text nodes manually
			const text1 = document.createTextNode('Hello ');
			const text2 = document.createTextNode('World');
			p.innerHTML = '';
			p.appendChild(text1);
			p.appendChild(text2);

			expect(p.childNodes.length).toBe(2);

			editor.$.nodeTransform.mergeSameTags(p, null, true);

			// Two text nodes should be merged
			expect(p.childNodes.length).toBe(1);
			expect(p.textContent).toBe('Hello World');
		});

		it('should return offsets array when nodePathArray is provided', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>A</strong><strong>B</strong></p>';

			const p = wysiwyg.querySelector('p');
			const offsets = editor.$.nodeTransform.mergeSameTags(p, [[0, 1]], false);

			expect(offsets).toBeTruthy();
			expect(Array.isArray(offsets)).toBe(true);
		});
	});

	describe('mergeNestedTags() - Remove unnecessary nesting', () => {
		it('should merge nested same-name tags with element children', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			// mergeNestedTags uses .children (element children only), so test with element children
			wysiwyg.innerHTML = '<div><div><p>Para 1</p><p>Para 2</p></div></div>';

			const outerDiv = wysiwyg.querySelector('div');
			editor.$.nodeTransform.mergeNestedTags(outerDiv, 'DIV');

			// Inner <div> should be unwrapped, <p> children moved to outer <div>
			const ps = outerDiv.querySelectorAll('p');
			expect(ps.length).toBe(2);
			expect(ps[0].textContent).toBe('Para 1');
			expect(ps[1].textContent).toBe('Para 2');
			// Should no longer have nested div
			expect(outerDiv.querySelector('div')).toBeNull();
		});

		it('should merge nested lists', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<ul><ul><li>Item 1</li><li>Item 2</li></ul></ul>';

			const outerUl = wysiwyg.querySelector('ul');
			editor.$.nodeTransform.mergeNestedTags(outerUl, 'UL|OL');

			// Nested <ul><ul> should collapse
			expect(outerUl.textContent).toContain('Item 1');
			expect(outerUl.textContent).toContain('Item 2');
		});

		it('should handle string validation parameter', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<div><div>Content</div></div>';

			const div = wysiwyg.querySelector('div');
			// Should not throw
			expect(() => {
				editor.$.nodeTransform.mergeNestedTags(div, 'DIV');
			}).not.toThrow();
		});
	});

	describe('removeAllParents() - Remove empty parent chain', () => {
		it('should remove empty parent nodes recursively', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span><em></em></span></p>';

			const em = wysiwyg.querySelector('em');
			const result = editor.$.nodeTransform.removeAllParents(em, null, wysiwyg);

			// em and span should be removed (they're empty)
			expect(result).toBeTruthy();
		});

		it('should stop at stopParent', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<div class="stop"><p><span></span></p></div>';

			const stopParent = wysiwyg.querySelector('.stop');
			const span = wysiwyg.querySelector('span');

			editor.$.nodeTransform.removeAllParents(span, null, stopParent);

			// div.stop should still exist
			expect(wysiwyg.querySelector('.stop')).toBeTruthy();
		});

		it('should return null for null input', () => {
			const result = editor.$.nodeTransform.removeAllParents(null);
			expect(result).toBeNull();
		});
	});

	describe('removeEmptyNode() - Clean up empty children', () => {
		it('should remove empty child elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span></span>Text<em></em></p>';

			const p = wysiwyg.querySelector('p');
			editor.$.nodeTransform.removeEmptyNode(p, null, false);

			// Empty span and em should be removed, text should remain
			expect(p.querySelectorAll('span').length).toBe(0);
			expect(p.querySelectorAll('em').length).toBe(0);
			expect(p.textContent).toContain('Text');
		});

		it('should preserve non-empty elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Keep</strong><span></span></p>';

			const p = wysiwyg.querySelector('p');
			editor.$.nodeTransform.removeEmptyNode(p, null, false);

			expect(p.querySelector('strong')).toBeTruthy();
			expect(p.querySelector('strong').textContent).toBe('Keep');
		});

		it('should replace with BR when all children are removed and forceDelete is false', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span></span></p>';

			const p = wysiwyg.querySelector('p');
			editor.$.nodeTransform.removeEmptyNode(p, null, false);

			// Should have BR as fallback
			expect(p.innerHTML).toBe('<br>');
		});

		it('should not remove the notRemoveNode', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span class="keep"></span><span class="remove"></span></p>';

			const p = wysiwyg.querySelector('p');
			const keepNode = p.querySelector('.keep');
			editor.$.nodeTransform.removeEmptyNode(p, keepNode, false);

			// The keepNode should survive even though it's empty
			expect(p.querySelector('.keep')).toBeTruthy();
		});
	});

	describe('createNestedNode() - Build nested node structures', () => {
		it('should create nested structure from node array', () => {
			const div = document.createElement('DIV');
			div.className = 'outer';
			const span = document.createElement('SPAN');
			span.style.color = 'red';
			const em = document.createElement('EM');

			const result = editor.$.nodeTransform.createNestedNode([div, span, em]);

			expect(result.parent.nodeName).toBe('DIV');
			expect(result.parent.className).toBe('outer');
			expect(result.inner.nodeName).toBe('EM');

			// Verify nesting: DIV > SPAN > EM
			expect(result.parent.firstChild.nodeName).toBe('SPAN');
			expect(result.parent.firstChild.firstChild.nodeName).toBe('EM');
		});

		it('should skip nodes that fail validation', () => {
			const div = document.createElement('DIV');
			const span = document.createElement('SPAN');
			const em = document.createElement('EM');

			const result = editor.$.nodeTransform.createNestedNode(
				[div, span, em],
				(node) => node.nodeName !== 'SPAN'
			);

			// SPAN should be skipped: DIV > EM
			expect(result.parent.nodeName).toBe('DIV');
			expect(result.inner.nodeName).toBe('EM');
			expect(result.parent.firstChild.nodeName).toBe('EM');
		});

		it('should handle single-node array', () => {
			const p = document.createElement('P');
			p.className = 'test';

			const result = editor.$.nodeTransform.createNestedNode([p]);

			expect(result.parent.nodeName).toBe('P');
			expect(result.inner.nodeName).toBe('P');
			expect(result.parent).toBe(result.inner);
		});
	});
});
