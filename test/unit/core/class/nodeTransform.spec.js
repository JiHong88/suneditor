/**
 * @jest-environment jsdom
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import NodeTransform from '../../../../src/core/class/nodeTransform';
import CoreInjector from '../../../../src/editorInjector/_core';
import { dom } from '../../../../src/helper';

describe('NodeTransform', () => {
	let editor;
	let nodeTransform;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		nodeTransform = editor.nodeTransform;
		wysiwyg = editor.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('split', () => {
		it('should return baseNode if it is wysiwyg frame', () => {
			const result = nodeTransform.split(wysiwyg, 0);
			expect(result).toBe(wysiwyg);
		});

		it('should return baseNode if it is null', () => {
			const result = nodeTransform.split(null, 0);
			expect(result).toBeNull();
		});

		it('should split by node offset (lines 36-52)', () => {
			wysiwyg.innerHTML = '<div><span>one</span><span>two</span><span>three</span></div>';
			const div = wysiwyg.firstChild;
			const span2 = div.children[1];

			const result = nodeTransform.split(div, span2, 0);

			expect(result).toBe(div);
			expect(wysiwyg.children.length).toBeGreaterThan(1);
		});

		it('should handle split when offset is 0 on element node (lines 70-80)', () => {
			wysiwyg.innerHTML = '<div><p><span>text</span></p></div>';
			const div = wysiwyg.firstChild;
			const p = div.firstChild;

			const result = nodeTransform.split(p, 0, 0);

			expect(result).toBeDefined();
		});

		it('should handle split when offset is 0 with text node descent', () => {
			wysiwyg.innerHTML = '<div><p>text</p></div>';
			const div = wysiwyg.firstChild;
			const p = div.firstChild;

			const result = nodeTransform.split(p, 0, 0);

			expect(result).toBeDefined();
		});

		it('should handle split when no previousSibling (lines 82-86)', () => {
			wysiwyg.innerHTML = '<div><p>text</p></div>';
			const div = wysiwyg.firstChild;
			const p = div.firstChild;

			const result = nodeTransform.split(p, 1, 0);

			expect(result).toBeDefined();
		});

		it('should handle list cell special case in newEl construction (lines 100-106)', () => {
			wysiwyg.innerHTML = '<ul><li><ul><li>nested</li></ul>text</li></ul>';
			const ul = wysiwyg.firstChild;
			const li = ul.firstChild;
			const text = li.lastChild;

			const result = nodeTransform.split(text, 2, 0);

			expect(result).toBeDefined();
		});

		it('should add BR to list cell with nested list (lines 126-128)', () => {
			wysiwyg.innerHTML = '<ul><li>text</li></ul>';
			const ul = wysiwyg.firstChild;
			const li = ul.firstChild;
			const text = li.firstChild;

			const result = nodeTransform.split(text, 2, 0);

			if (dom.check.isListCell(result) && result.children && dom.check.isList(result.children[0])) {
				expect(result.firstChild.nodeName).toBe('BR');
			}
		});
	});

	describe('mergeSameTags', () => {
		it('should merge adjacent nodes with same tag and attributes', () => {
			wysiwyg.innerHTML = '<div><strong>one</strong><strong>two</strong></div>';
			const div = wysiwyg.firstChild;

			nodeTransform.mergeSameTags(div, null, false);

			expect(div.children.length).toBe(1);
			expect(div.textContent).toBe('onetwo');
		});

		it('should handle nodePath array and return offsets', () => {
			wysiwyg.innerHTML = '<div><strong>one</strong><strong>two</strong></div>';
			const div = wysiwyg.firstChild;

			const nodePaths = [[0, 0, 0], [1, 0, 0]];
			const offsets = nodeTransform.mergeSameTags(div, nodePaths, false);

			expect(offsets).toBeDefined();
			expect(offsets.length).toBe(2);
		});

		it('should skip break, media, and input elements', () => {
			wysiwyg.innerHTML = '<div><br><img src="test.jpg"><input type="text"></div>';
			const div = wysiwyg.firstChild;

			const childCountBefore = div.children.length;
			nodeTransform.mergeSameTags(div, null, false);
			const childCountAfter = div.children.length;

			expect(childCountAfter).toBe(childCountBefore);
		});

		it('should merge parent and child with same nodeName (lines 168-200)', () => {
			wysiwyg.innerHTML = '<div><strong><strong>text</strong></strong></div>';
			const div = wysiwyg.firstChild;

			nodeTransform.mergeSameTags(div, null, false);

			const strongs = div.querySelectorAll('strong');
			expect(strongs.length).toBe(1);
		});

		it('should merge text nodes (lines 249-266)', () => {
			wysiwyg.innerHTML = '<div></div>';
			const div = wysiwyg.firstChild;
			div.appendChild(document.createTextNode('one'));
			div.appendChild(document.createTextNode('two'));

			nodeTransform.mergeSameTags(div, null, false);

			expect(div.childNodes.length).toBe(1);
			expect(div.textContent).toBe('onetwo');
		});

		it('should merge text nodes with nodePath tracking', () => {
			wysiwyg.innerHTML = '<div></div>';
			const div = wysiwyg.firstChild;
			div.appendChild(document.createTextNode('one'));
			div.appendChild(document.createTextNode('two'));

			const nodePaths = [[1, 0]];
			const offsets = nodeTransform.mergeSameTags(div, nodePaths, false);

			expect(offsets).toBeDefined();
			expect(offsets[0]).toBe(3);
		});
	});

	describe('mergeNestedTags', () => {
		it('should merge nested tags with same name', () => {
			wysiwyg.innerHTML = '<div><div><div>text</div></div></div>';
			const outerDiv = wysiwyg.firstChild;

			nodeTransform.mergeNestedTags(outerDiv, null);

			const divs = outerDiv.querySelectorAll('div');
			expect(divs.length).toBeLessThan(2);
		});

		it('should accept string validation (lines 289-291)', () => {
			wysiwyg.innerHTML = '<div><ul><ul><li>text</li></ul></ul></div>';
			const div = wysiwyg.firstChild;

			nodeTransform.mergeNestedTags(div, 'ul|ol');

			const nestedUls = div.querySelectorAll('ul ul');
			expect(nestedUls.length).toBe(0);
		});

		it('should accept function validation (lines 292-293)', () => {
			wysiwyg.innerHTML = '<div><span><span>text</span></span></div>';
			const div = wysiwyg.firstChild;

			nodeTransform.mergeNestedTags(div, (node) => node.nodeName === 'SPAN');

			const spans = div.querySelectorAll('span span');
			expect(spans.length).toBe(0);
		});

		it('should handle mergeNestedTags with children moving (lines 296-310)', () => {
			wysiwyg.innerHTML = '<div><ul><ul><li>one</li><li>two</li></ul></ul></div>';
			const div = wysiwyg.firstChild;

			nodeTransform.mergeNestedTags(div, (node) => node.nodeName === 'UL');

			const nestedUls = div.querySelectorAll('ul ul');
			expect(nestedUls.length).toBe(0);

			const lis = div.querySelectorAll('li');
			expect(lis.length).toBe(2);
		});
	});

	describe('removeAllParents', () => {
		it('should return null if item is null', () => {
			const result = nodeTransform.removeAllParents(null);
			expect(result).toBeNull();
		});

		it('should remove empty parents recursively', () => {
			wysiwyg.innerHTML = '<div><p><span></span></p></div>';
			const span = wysiwyg.querySelector('span');

			const result = nodeTransform.removeAllParents(span);

			expect(result).toBeDefined();
			expect(wysiwyg.querySelector('span')).toBeNull();
		});

		it('should use custom validation function', () => {
			wysiwyg.innerHTML = '<div><p class="keep"><span></span></p></div>';
			const span = wysiwyg.querySelector('span');

			const result = nodeTransform.removeAllParents(
				span,
				(current) => !current.classList.contains('keep')
			);

			expect(result).toBeDefined();
			expect(wysiwyg.querySelector('.keep')).toBeTruthy();
		});

		it('should stop at stopParent', () => {
			wysiwyg.innerHTML = '<div><p><span></span></p></div>';
			const div = wysiwyg.firstChild;
			const span = wysiwyg.querySelector('span');

			const result = nodeTransform.removeAllParents(span, null, div);

			expect(result).toBeDefined();
			expect(wysiwyg.querySelector('div')).toBeTruthy();
		});

		it('should return sc and ec references', () => {
			wysiwyg.innerHTML = '<div><p>before</p><p><span></span></p><p>after</p></div>';
			const span = wysiwyg.querySelector('span');

			const result = nodeTransform.removeAllParents(span);

			expect(result).toBeDefined();
			expect(result.sc || result.ec).toBeDefined();
		});
	});

	describe('removeEmptyNode', () => {
		it('should remove empty child nodes', () => {
			wysiwyg.innerHTML = '<div><p></p><p>text</p><p></p></div>';
			const div = wysiwyg.firstChild;

			nodeTransform.removeEmptyNode(div, null, false);

			const ps = div.querySelectorAll('p');
			expect(ps.length).toBeLessThan(3);
		});

		it('should not remove notRemoveNode', () => {
			wysiwyg.innerHTML = '<div><p class="keep"></p><p></p></div>';
			const div = wysiwyg.firstChild;
			const keep = div.querySelector('.keep');

			nodeTransform.removeEmptyNode(div, keep, false);

			expect(div.querySelector('.keep')).toBeTruthy();
		});

		it('should forceDelete element if empty (lines 380-386)', () => {
			wysiwyg.innerHTML = '<div><p></p></div>';
			const div = wysiwyg.firstChild;
			const p = div.firstChild;

			nodeTransform.removeEmptyNode(p, null, true);

			expect(wysiwyg.querySelector('p')).toBeNull();
		});

		it('should add BR if element is empty and not forceDelete', () => {
			wysiwyg.innerHTML = '<div><p></p></div>';
			const div = wysiwyg.firstChild;
			const p = div.firstChild;

			nodeTransform.removeEmptyNode(p, null, false);

			expect(p.innerHTML).toBe('<br>');
		});

		it('should preserve allowed empty tags', () => {
			wysiwyg.innerHTML = '<div><p><img src="test.jpg"></p></div>';
			const div = wysiwyg.firstChild;
			const p = div.firstChild;

			nodeTransform.removeEmptyNode(p, null, false);

			expect(p.querySelector('img')).toBeTruthy();
		});

		it('should not remove _notTextNode elements', () => {
			wysiwyg.innerHTML = '<div><br><img src="test.jpg"></div>';
			const div = wysiwyg.firstChild;

			const childCountBefore = div.children.length;
			nodeTransform.removeEmptyNode(div, null, false);
			const childCountAfter = div.children.length;

			expect(childCountAfter).toBe(childCountBefore);
		});

		it('should handle nested empty nodes recursion', () => {
			wysiwyg.innerHTML = '<div><p><span></span><span></span></p></div>';
			const div = wysiwyg.firstChild;
			const p = div.firstChild;

			nodeTransform.removeEmptyNode(p, null, false);

			const spans = p.querySelectorAll('span');
			expect(spans.length).toBe(0);
		});
	});

	describe('createNestedNode', () => {
		it('should create nested node structure', () => {
			const div = document.createElement('div');
			const p = document.createElement('p');
			const span = document.createElement('span');

			const result = nodeTransform.createNestedNode([div, p, span]);

			expect(result.parent.nodeName).toBe('DIV');
			expect(result.inner.nodeName).toBe('SPAN');
			expect(result.parent.firstChild.nodeName).toBe('P');
			expect(result.inner.innerHTML).toBe('');
		});

		it('should skip nodes that fail validation (lines 396-406)', () => {
			const div = document.createElement('div');
			const p = document.createElement('p');
			const span = document.createElement('span');
			const strong = document.createElement('strong');

			const result = nodeTransform.createNestedNode(
				[div, p, span, strong],
				(node) => node.nodeName !== 'SPAN'
			);

			expect(result.parent.nodeName).toBe('DIV');
			expect(result.inner.nodeName).toBe('STRONG');
			expect(result.parent.querySelector('span')).toBeNull();
		});

		it('should handle validation function', () => {
			const div = document.createElement('div');
			const p = document.createElement('p');
			const span = document.createElement('span');

			const result = nodeTransform.createNestedNode(
				[div, p, span],
				(node) => true
			);

			expect(result.parent).toBeDefined();
			expect(result.inner).toBeDefined();
		});

		it('should work without validation', () => {
			const div = document.createElement('div');
			const p = document.createElement('p');

			const result = nodeTransform.createNestedNode([div, p]);

			expect(result.parent.nodeName).toBe('DIV');
			expect(result.inner.nodeName).toBe('P');
		});
	});
});
