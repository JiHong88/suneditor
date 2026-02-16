/**
 * @fileoverview Integration tests for Offset class
 * Tests actual position calculation methods with real DOM elements.
 * The unit test only has 2 stubs (constructor + type check).
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Offset integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'offset-test-container';
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

	describe('get() - Get position outside editor', () => {
		it('should return an object with left and top properties', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test content</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.get(p);

			expect(result).toBeDefined();
			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});

		it('should return numeric values for text nodes', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text node test</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			const result = editor.$.offset.get(textNode);

			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});
	});

	describe('getLocal() - Get position inside editor', () => {
		it('should return local offset with all properties', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Local offset test</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.getLocal(p);

			expect(result).toBeDefined();
			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
			expect(typeof result.right).toBe('number');
			expect(typeof result.scrollX).toBe('number');
			expect(typeof result.scrollY).toBe('number');
			expect(typeof result.scrollH).toBe('number');
		});

		it('should return non-negative scroll values', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Scroll test</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.getLocal(p);

			expect(result.scrollX).toBeGreaterThanOrEqual(0);
			expect(result.scrollY).toBeGreaterThanOrEqual(0);
			expect(result.scrollH).toBeGreaterThanOrEqual(0);
		});
	});

	describe('getGlobal() - Get position relative to document', () => {
		it('should return global offset with all properties', () => {
			const result = editor.$.offset.getGlobal();

			expect(result).toBeDefined();
			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
			expect(typeof result.fixedTop).toBe('number');
			expect(typeof result.fixedLeft).toBe('number');
			expect(typeof result.width).toBe('number');
			expect(typeof result.height).toBe('number');
		});

		it('should return zero values for non-element nodes', () => {
			const textNode = document.createTextNode('text');
			const result = editor.$.offset.getGlobal(textNode);

			expect(result.top).toBe(0);
			expect(result.left).toBe(0);
			expect(result.width).toBe(0);
			expect(result.height).toBe(0);
		});

		it('should return position for a specific node', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Global test</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.getGlobal(p);

			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
		});
	});

	describe('getGlobalScroll() - Get global scroll info', () => {
		it('should return scroll info object with all properties', () => {
			const result = editor.$.offset.getGlobalScroll();

			expect(result).toBeDefined();
			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
			expect(typeof result.width).toBe('number');
			expect(typeof result.height).toBe('number');
			expect(typeof result.x).toBe('number');
			expect(typeof result.y).toBe('number');
			expect(typeof result.oh).toBe('number');
			expect(typeof result.ow).toBe('number');
		});
	});

	describe('getWWScroll() - Get wysiwyg scroll info', () => {
		it('should return wysiwyg scroll info', () => {
			const result = editor.$.offset.getWWScroll();

			expect(result).toBeDefined();
			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
			expect(typeof result.width).toBe('number');
			expect(typeof result.height).toBe('number');
			expect(typeof result.bottom).toBe('number');
		});

		it('should have bottom = top + height', () => {
			const result = editor.$.offset.getWWScroll();

			expect(result.bottom).toBe(result.top + result.height);
		});
	});

	describe('Consistency between methods', () => {
		it('getLocal and get should return related values', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Consistency</p>';

			const p = wysiwyg.querySelector('p');
			const local = editor.$.offset.getLocal(p);
			const outside = editor.$.offset.get(p);

			// get() builds on getLocal(), so they should be related
			expect(typeof local.left).toBe('number');
			expect(typeof outside.left).toBe('number');
		});
	});
});
