import Drawing from '../../../../src/plugins/modal/drawing';

// Mock dependencies with minimal setup
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor() {
			this.lang = { drawing: 'Drawing', close: 'Close', submitButton: 'Submit' };
			this.icons = { cancel: '<svg>cancel</svg>' };
			this.eventManager = { addEvent: jest.fn() };
			this.plugins = { image: { pluginOptions: {} } };
			this.carrierWrapper = { style: { color: '#000000' } };
		}
	};
});

jest.mock('../../../../src/modules', () => ({
	Modal: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		form: {
			querySelector: jest.fn().mockReturnValue({
				getContext: jest.fn().mockReturnValue({
					clearRect: jest.fn(),
					beginPath: jest.fn(),
					stroke: jest.fn()
				}),
				offsetWidth: 600,
				offsetHeight: 400,
				width: 600,
				height: 400
			})
		}
	}))
}));

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockReturnValue({
				querySelector: jest.fn().mockReturnValue({ value: '' })
			}),
			createTooltipInner: jest.fn().mockReturnValue('')
		}
	},
	env: {
		_w: {
			getComputedStyle: jest.fn().mockReturnValue({ color: '#000000' })
		}
	}
}));

global.console = { ...console, warn: jest.fn() };

describe('Drawing Plugin', () => {
	let mockEditor;

	beforeEach(() => {
		mockEditor = {
			lang: { drawing: 'Drawing', close: 'Close', submitButton: 'Submit' },
			icons: { cancel: '<svg>cancel</svg>' },
			plugins: {}
		};
	});

	describe('Constructor', () => {
		it('should create Drawing instance', () => {
			expect(() => new Drawing(mockEditor, {})).not.toThrow();
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Drawing.key).toBe('drawing');
			expect(Drawing.type).toBe('modal');
			expect(Drawing.className).toBe('');
		});
	});

	describe('Instance methods', () => {
		let drawing;

		beforeEach(() => {
			drawing = new Drawing(mockEditor, {});
		});

		it('should have required methods', () => {
			const methods = ['open'];
			methods.forEach(method => {
				expect(typeof drawing[method]).toBe('function');
			});
		});

		it('should handle method calls without errors', () => {
			expect(() => drawing.open()).not.toThrow();
		});
	});
});