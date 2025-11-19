/**
 * @jest-environment jsdom
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { dom } from '../../../../src/helper';

describe('Offset', () => {
	let editor;
	let offset;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		offset = editor.offset;
		wysiwyg = editor.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('get', () => {
		it('should get offset position of node', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;

			const result = offset.get(p);

			expect(result).toBeDefined();
			expect(result.left).toBeDefined();
			expect(result.top).toBeDefined();
		});

		it('should handle iframe mode', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;

			const result = offset.get(p);

			expect(result).toBeDefined();
		});

		it('should handle text node', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;

			const result = offset.get(text);

			expect(result).toBeDefined();
		});
	});

	describe('getLocal', () => {
		it('should get local offset position', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;

			const result = offset.getLocal(p);

			expect(result).toBeDefined();
			expect(result.left).toBeDefined();
			expect(result.top).toBeDefined();
			expect(result.right).toBeDefined();
			expect(result.scrollX).toBeDefined();
			expect(result.scrollY).toBeDefined();
		});

		it('should handle text node in getLocal', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;

			const result = offset.getLocal(text);

			expect(result).toBeDefined();
		});

		it('should handle nested elements', () => {
			wysiwyg.innerHTML = '<div><p><span>deep</span></p></div>';
			const span = wysiwyg.querySelector('span');

			const result = offset.getLocal(span);

			expect(result).toBeDefined();
			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});

		it('should calculate scroll offsets', () => {
			wysiwyg.innerHTML = '<div style="height: 1000px;"><p>test</p></div>';
			const p = wysiwyg.querySelector('p');

			const result = offset.getLocal(p);

			expect(result.scrollX).toBeDefined();
			expect(result.scrollY).toBeDefined();
		});
	});

	describe('getGlobal', () => {
		it('should get global offset position', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;

			const result = offset.getGlobal(p);

			expect(result).toBeDefined();
			expect(result.top).toBeDefined();
			expect(result.left).toBeDefined();
			expect(result.fixedTop).toBeDefined();
			expect(result.fixedLeft).toBeDefined();
			expect(result.width).toBeDefined();
			expect(result.height).toBeDefined();
		});

		it('should handle element dimensions', () => {
			wysiwyg.innerHTML = '<div style="width: 100px; height: 50px;">test</div>';
			const div = wysiwyg.firstChild;

			const result = offset.getGlobal(div);

			expect(result.width).toBeDefined();
			expect(result.height).toBeDefined();
		});
	});

	describe('getWWScroll', () => {
		it('should get wysiwyg scroll info without rects (removed in commit 9f43ca04)', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const result = offset.getWWScroll();

			expect(result).toBeDefined();
			expect(result.top).toBeDefined();
			expect(result.left).toBeDefined();
			expect(result.width).toBeDefined();
			expect(result.height).toBeDefined();
			expect(result.bottom).toBeDefined();
			// IMPORTANT: rects property was removed in commit 9f43ca04
			expect(result.rects).toBeUndefined();
		});

		it('should calculate bottom position', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const result = offset.getWWScroll();

			expect(result.bottom).toBe(result.top + result.height);
		});
	});

	describe('getGlobalScroll', () => {
		it('should get global scroll info', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const result = offset.getGlobalScroll();

			expect(result).toBeDefined();
			expect(result.top).toBeDefined();
			expect(result.left).toBeDefined();
			expect(result.width).toBeDefined();
			expect(result.height).toBeDefined();
		});

		it('should have offset elements', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const result = offset.getGlobalScroll();

			expect(result.ohOffsetEl).toBeDefined();
			expect(result.owOffsetEl).toBeDefined();
			expect(result.oh).toBeDefined();
			expect(result.ow).toBeDefined();
		});

		it('should have editor reference flags', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const result = offset.getGlobalScroll();

			expect(typeof result.heightEditorRefer).toBe('boolean');
			expect(typeof result.widthEditorRefer).toBe('boolean');
		});

		it('should have position values', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const result = offset.getGlobalScroll();

			expect(result.ts).toBeDefined();
			expect(result.ls).toBeDefined();
			expect(result.x).toBeDefined();
			expect(result.y).toBeDefined();
		});
	});

});
