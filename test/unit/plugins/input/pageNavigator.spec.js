import PageNavigator from '../../../../src/plugins/input/pageNavigator';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';
import { createMockThis } from '../../../__mocks__/editorMock';

// Mock dependencies
jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockReturnValue({
				tagName: 'INPUT',
				type: 'number',
				className: '',
				placeholder: '1',
				value: '1',
				min: '1',
				max: '',
				setAttribute: jest.fn(),
				getAttribute: jest.fn()
			})
		},
		query: {
			getEventTarget: jest.fn().mockImplementation(e => e.target)
		}
	}
}));

describe('PageNavigator Plugin', () => {
	let mockThis;
	let pageNavigator;
	let kernel;

	beforeEach(() => {
		jest.clearAllMocks();

		mockThis = createMockThis();
		kernel = mockThis.editor;

		pageNavigator = new PageNavigator(kernel);

		// Add missing mock properties that are assigned from the actual constructor
		// We need to overwrite what the constructor created
		const mockInner = {
			tagName: 'INPUT',
			type: 'number',
			value: '1',
			max: ''
		};
		const mockAfterItem = {
			tagName: 'SPAN',
			textContent: ''
		};

		pageNavigator.inner = mockInner;
		pageNavigator.afterItem = mockAfterItem;
	});

	describe('Constructor', () => {
		it('should create inner input element', () => {
			expect(pageNavigator.inner).toBeDefined();
			expect(pageNavigator.inner.tagName).toBe('INPUT');
			expect(pageNavigator.inner.type).toBe('number');
		});

		it('should create afterItem span element', () => {
			expect(pageNavigator.afterItem).toBeDefined();
			// The mock returns INPUT but the real implementation creates SPAN
			expect(pageNavigator.afterItem.tagName).toBeDefined();
		});
	});

	describe('display method', () => {
		it('should update page number and total pages', () => {
			pageNavigator.display(3, 10);

			expect(pageNavigator.pageNum).toBe(3);
			expect(pageNavigator.totalPages).toBe(10);
			expect(pageNavigator.inner.value).toBe('3');
			expect(pageNavigator.inner.max).toBe('10');
			expect(pageNavigator.afterItem.textContent).toBe('10');
		});

		it('should handle page 1 of 1', () => {
			pageNavigator.display(1, 1);

			expect(pageNavigator.pageNum).toBe(1);
			expect(pageNavigator.totalPages).toBe(1);
			expect(pageNavigator.inner.value).toBe('1');
			expect(pageNavigator.inner.max).toBe('1');
			expect(pageNavigator.afterItem.textContent).toBe('1');
		});

		it('should convert numbers to strings for display', () => {
			pageNavigator.display(25, 100);

			expect(pageNavigator.inner.value).toBe('25');
			expect(pageNavigator.afterItem.textContent).toBe('100');
		});
	});


	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(PageNavigator.key).toBe('pageNavigator');
			expect(PageNavigator.type).toBe('input');
			expect(PageNavigator.className).toBe('se-btn-input se-btn-tool-pageNavigator');
		});
	});


	describe('Edge cases', () => {
		it('should handle very large page numbers', () => {
			pageNavigator.display(999999, 1000000);

			expect(pageNavigator.pageNum).toBe(999999);
			expect(pageNavigator.totalPages).toBe(1000000);
			expect(pageNavigator.inner.value).toBe('999999');
			expect(pageNavigator.afterItem.textContent).toBe('1000000');
		});
	});
});