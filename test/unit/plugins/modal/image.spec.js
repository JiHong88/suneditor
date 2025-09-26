import Image from '../../../../src/plugins/modal/image';

// Mock dependencies with minimal setup
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor() {
			this.lang = { image: 'Image', close: 'Close', submitButton: 'Submit' };
			this.icons = { cancel: '<svg>cancel</svg>' };
			this.eventManager = { addEvent: jest.fn() };
			this.plugins = { link: { pluginOptions: {} } };
			this.events = { onImageLoad: jest.fn(), onImageAction: jest.fn() };
			this.previewSrc = { style: {} };
			this.imgInputFile = { value: '' };
			this.imgUrlFile = { disabled: false };
			this.altText = { value: '' };
		}
	};
});

jest.mock('../../../../src/modules', () => ({
	Modal: jest.fn().mockImplementation(() => ({ open: jest.fn(), close: jest.fn() })),
	Figure: jest.fn().mockImplementation(() => ({ open: jest.fn() })),
	FileManager: jest.fn().mockImplementation(() => ({ getSize: jest.fn(), upload: jest.fn() })),
	ModalAnchorEditor: jest.fn().mockImplementation(() => ({ open: jest.fn(), close: jest.fn() }))
}));

// Add static methods to Modal
Object.assign(require('../../../../src/modules').Modal, {
	OnChangeFile: jest.fn(),
	CreateFileInput: jest.fn().mockReturnValue(''),
	CreateGallery: jest.fn().mockReturnValue('')
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		check: {
			isFigure: jest.fn().mockReturnValue(false),
			isComponentContainer: jest.fn().mockReturnValue(false),
			isAnchor: jest.fn().mockReturnValue(false)
		},
		utils: {
			createElement: jest.fn().mockReturnValue({
				querySelector: jest.fn().mockReturnValue({ value: '', files: [] })
			}),
			createTooltipInner: jest.fn().mockReturnValue('')
		}
	},
	numbers: { is: jest.fn(), get: jest.fn((val, def) => val || def) },
	env: { NO_EVENT: Symbol('NO_EVENT') },
	keyCodeMap: { key: { 13: 'Enter' } }
}));

describe('Image Plugin', () => {
	let mockEditor;

	beforeEach(() => {
		mockEditor = {
			lang: { image: 'Image', close: 'Close', submitButton: 'Submit' },
			icons: { cancel: '<svg>cancel</svg>' },
			plugins: {}
		};
	});

	describe('Constructor', () => {
		it('should create Image instance', () => {
			expect(() => new Image(mockEditor, {})).not.toThrow();
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Image.key).toBe('image');
			expect(Image.type).toBe('modal');
			expect(Image.className).toBe('');
		});
	});

	describe('Static methods', () => {
		it('should have component method', () => {
			expect(typeof Image.component).toBe('function');
		});

		it('should return image element if valid', () => {
			const mockElement = { nodeName: 'IMG' };
			const result = Image.component(mockElement);
			expect(result).toBe(mockElement);
		});

		it('should return null for non-image element', () => {
			const mockElement = { nodeName: 'DIV' };
			const result = Image.component(mockElement);
			expect(result).toBeNull();
		});
	});

	describe('Instance methods', () => {
		let image;

		beforeEach(() => {
			image = new Image(mockEditor, {});
		});

		it('should have required methods', () => {
			const methods = ['open', 'on', 'modalAction'];
			methods.forEach(method => {
				expect(typeof image[method]).toBe('function');
			});
		});

		it('should handle method calls without errors', () => {
			expect(() => image.open()).not.toThrow();
			// image.on calls this.anchor.on, so we mock it properly
			image.anchor = { on: jest.fn() };
			expect(() => image.on(false)).not.toThrow();
		});
	});
});