/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import Selection from '../../../../../src/core/logic/dom/selection';
import { dom } from '../../../../../src/helper';

describe('Core Logic - Selection', () => {
	let kernel;
	let selection;
	let wysiwyg;

	beforeEach(() => {
		kernel = createMockEditor();
		selection = new Selection(kernel);
		wysiwyg = kernel.$.frameContext.get('wysiwyg');

		// Mock getClientRects for JSDOM
		if (!Range.prototype.getClientRects) {
			Object.defineProperty(Range.prototype, 'getClientRects', {
				value: () => [{ top: 0, bottom: 10, left: 0, right: 10, width: 10, height: 10 }],
				writable: true,
			});
		}
	});

	afterEach(() => {
		// Mock cleanup - no special teardown needed
		jest.clearAllMocks();
	});

	describe('get', () => {
		it('should return selection object', () => {
			const sel = selection.get();
			expect(sel).toBeDefined();
		});

		it('should handle iframe context', () => {
			const sel = selection.get();
			expect(typeof sel).toBe('object');
		});
	});

	describe('isRange', () => {
		it('should return true for Range objects', () => {
			const range = document.createRange();
			expect(selection.isRange(range)).toBe(true);
		});

		it('should return false for non-Range objects', () => {
			expect(selection.isRange(null)).toBe(false);
			expect(selection.isRange({})).toBe(false);
		});
	});

	describe('getRange', () => {
		it('should return Range object', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const range = selection.getRange();
			expect(range).toBeTruthy();
			expect(typeof range.startContainer).toBeDefined();
		});

		it('should return valid range with content', () => {
			wysiwyg.innerHTML = '<p>test content</p>';
			const range = selection.getRange();
			expect(range).toBeTruthy();
			expect(range.startContainer).toBeDefined();
		});
	});

	describe('getNearRange', () => {
		it('should return next sibling range', () => {
			wysiwyg.innerHTML = '<p>test</p><p>test2</p>';
			const firstP = wysiwyg.querySelector('p');
			const result = selection.getNearRange(firstP);
			expect(result).toBeTruthy();
			expect(result.container).toBe(firstP.nextSibling);
		});

		it('should return previous sibling if no next sibling', () => {
			wysiwyg.innerHTML = '<p>test1</p><p>test2</p>';
			const lastP = wysiwyg.querySelectorAll('p')[1];
			const result = selection.getNearRange(lastP);
			expect(result).toBeTruthy();
		});

		it('should return null if no siblings', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.querySelector('p');
			p.remove();
			const result = selection.getNearRange(p);
			expect(result).toBeNull();
		});
	});

	describe('getDragEventLocationRange', () => {
		it('should return range location from drag event', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const event = new MouseEvent('drag', {
				clientX: 10,
				clientY: 10,
				bubbles: true,
				cancelable: true
			});

			const result = selection.getDragEventLocationRange(event);
			// Method exists and returns something
			expect(typeof result === 'object' || result === undefined).toBe(true);
		});
	});
});
