import PageNavigator from '../../../../src/plugins/input/pageNavigator';
import { createMockThis } from '../../../__mocks__/editorMock';

// Mock dependencies
jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockImplementation((tag, attrs) => {
				// Return a real-like element for span (afterItem)
				return {
					tagName: tag.toUpperCase(),
					type: attrs?.type || '',
					className: attrs?.class || '',
					placeholder: attrs?.placeholder || '',
					value: attrs?.value || '',
					min: attrs?.min || '',
					max: '',
					textContent: '',
					setAttribute: jest.fn(),
					getAttribute: jest.fn(),
				};
			}),
		},
		query: {
			getEventTarget: jest.fn().mockImplementation((e) => e.target || e),
		},
	},
}));

describe('PageNavigator Plugin', () => {
	let pageNavigator;
	let kernel;
	let capturedChangeHandler;

	beforeEach(() => {
		jest.clearAllMocks();

		const mockThis = createMockThis();
		kernel = mockThis.editor;

		// Ensure frameContext has the methods we need
		kernel.$.frameContext.has = jest.fn().mockReturnValue(false);
		kernel.$.frameContext.get = jest.fn().mockImplementation((key) => {
			if (key === 'documentType') {
				return { pageGo: jest.fn() };
			}
			return null;
		});

		pageNavigator = new PageNavigator(kernel);

		// Capture the change handler registered via eventManager.addEvent
		const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
		const changeCall = addEventCalls.find((call) => call[1] === 'change');
		capturedChangeHandler = changeCall ? changeCall[2] : null;
	});

	describe('Constructor', () => {
		it('should create inner input element', () => {
			expect(pageNavigator.inner).toBeDefined();
		});

		it('should create afterItem span element', () => {
			expect(pageNavigator.afterItem).toBeDefined();
		});

		it('should set initial page values', () => {
			expect(pageNavigator.pageNum).toBe(1);
			expect(pageNavigator.totalPages).toBe(1);
		});

		it('should register change event on inner element', () => {
			expect(capturedChangeHandler).toBeDefined();
			expect(typeof capturedChangeHandler).toBe('function');
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

	// ---------------------------------------------------------------------------
	// #OnChangeInner — the untested private handler (0% branch → 100%)
	// ---------------------------------------------------------------------------
	describe('#OnChangeInner (captured via eventManager.addEvent)', () => {
		it('should return early when frameContext does NOT have documentType_use_page', () => {
			kernel.$.frameContext.has.mockReturnValue(false);
			const mockPageGo = jest.fn();
			kernel.$.frameContext.get.mockImplementation((key) => {
				if (key === 'documentType') return { pageGo: mockPageGo };
				return null;
			});

			// Fire the change event with value "5"
			const event = { target: { value: '5' } };
			capturedChangeHandler(event);

			// pageGo should NOT be called because documentType_use_page is false
			expect(kernel.$.frameContext.has).toHaveBeenCalledWith('documentType_use_page');
			expect(mockPageGo).not.toHaveBeenCalled();
		});

		it('should call pageGo with numeric value when documentType_use_page is true', () => {
			kernel.$.frameContext.has.mockReturnValue(true);
			const mockPageGo = jest.fn();
			kernel.$.frameContext.get.mockImplementation((key) => {
				if (key === 'documentType') return { pageGo: mockPageGo };
				return null;
			});

			const event = { target: { value: '7' } };
			capturedChangeHandler(event);

			expect(mockPageGo).toHaveBeenCalledWith(7);
		});

		it('should fallback to 1 when value is non-numeric (Number returns NaN)', () => {
			kernel.$.frameContext.has.mockReturnValue(true);
			const mockPageGo = jest.fn();
			kernel.$.frameContext.get.mockImplementation((key) => {
				if (key === 'documentType') return { pageGo: mockPageGo };
				return null;
			});

			const event = { target: { value: 'abc' } };
			capturedChangeHandler(event);

			// Number('abc') is NaN, so || 1 fallback
			expect(mockPageGo).toHaveBeenCalledWith(1);
		});

		it('should fallback to 1 when value is empty string', () => {
			kernel.$.frameContext.has.mockReturnValue(true);
			const mockPageGo = jest.fn();
			kernel.$.frameContext.get.mockImplementation((key) => {
				if (key === 'documentType') return { pageGo: mockPageGo };
				return null;
			});

			const event = { target: { value: '' } };
			capturedChangeHandler(event);

			// Number('') is 0, so || 1 fallback
			expect(mockPageGo).toHaveBeenCalledWith(1);
		});

		it('should fallback to 1 when value is 0', () => {
			kernel.$.frameContext.has.mockReturnValue(true);
			const mockPageGo = jest.fn();
			kernel.$.frameContext.get.mockImplementation((key) => {
				if (key === 'documentType') return { pageGo: mockPageGo };
				return null;
			});

			const event = { target: { value: '0' } };
			capturedChangeHandler(event);

			// Number('0') is 0, so || 1 fallback
			expect(mockPageGo).toHaveBeenCalledWith(1);
		});

		it('should handle large page numbers correctly', () => {
			kernel.$.frameContext.has.mockReturnValue(true);
			const mockPageGo = jest.fn();
			kernel.$.frameContext.get.mockImplementation((key) => {
				if (key === 'documentType') return { pageGo: mockPageGo };
				return null;
			});

			const event = { target: { value: '999' } };
			capturedChangeHandler(event);

			expect(mockPageGo).toHaveBeenCalledWith(999);
		});
	});
});
