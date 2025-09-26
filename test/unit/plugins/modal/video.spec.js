import Video from '../../../../src/plugins/modal/video';

// Mock dependencies with minimal setup
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor() {
			this.lang = { video: 'Video', close: 'Close', submitButton: 'Submit' };
			this.icons = { cancel: '<svg>cancel</svg>' };
			this.eventManager = { addEvent: jest.fn() };
			this.events = { onVideoLoad: jest.fn(), onVideoAction: jest.fn() };
			// Add mock properties that video plugin uses
			this.inputX = { placeholder: '' };
			this.inputY = { placeholder: '' };
			this.frameRatioOption = { options: [] };
		}
	};
});

jest.mock('../../../../src/modules', () => ({
	Modal: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		form: {
			querySelector: jest.fn().mockImplementation((selector) => {
				if (selector === '.se-video-ratio-option') {
					return {
						querySelectorAll: jest.fn().mockReturnValue([]),
						length: 0
					};
				}
				return {
					querySelectorAll: jest.fn().mockReturnValue([]),
					length: 0,
					placeholder: '',
					value: ''
				};
			})
		}
	})),
	Figure: jest.fn().mockImplementation(() => ({ open: jest.fn() })),
	FileManager: jest.fn().mockImplementation(() => ({ getSize: jest.fn(), upload: jest.fn() }))
}));

// Add static methods to Modal
Object.assign(require('../../../../src/modules').Modal, {
	OnChangeFile: jest.fn(),
	CreateFileInput: jest.fn().mockReturnValue('')
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockReturnValue({
				querySelector: jest.fn().mockReturnValue({ value: '', files: [] })
			})
		}
	},
	numbers: { is: jest.fn(), get: jest.fn((val, def) => val || def) },
	env: { _w: global, NO_EVENT: Symbol('NO_EVENT') },
	converter: { debounce: jest.fn(fn => fn) },
	keyCodeMap: { key: { 13: 'Enter' } }
}));

describe('Video Plugin', () => {
	let mockEditor;

	beforeEach(() => {
		mockEditor = {
			lang: { video: 'Video', close: 'Close', submitButton: 'Submit' },
			icons: { cancel: '<svg>cancel</svg>' },
			plugins: {}
		};
	});

	describe('Constructor', () => {
		it('should create Video instance', () => {
			expect(() => new Video(mockEditor, {})).not.toThrow();
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Video.key).toBe('video');
			expect(Video.type).toBe('modal');
			expect(Video.className).toBe('');
		});
	});

	describe('Static methods', () => {
		it('should have component method', () => {
			expect(typeof Video.component).toBe('function');
		});

		it('should return video element if valid', () => {
			const mockElement = { nodeName: 'VIDEO' };
			const result = Video.component(mockElement);
			expect(result).toBe(mockElement);
		});

		it('should return null for non-video element', () => {
			const mockElement = { nodeName: 'DIV' };
			const result = Video.component(mockElement);
			expect(result).toBeNull();
		});
	});

	describe('Instance methods', () => {
		let video;

		beforeEach(() => {
			video = new Video(mockEditor, {});
		});

		it('should have required methods', () => {
			const methods = ['open', 'modalAction'];
			methods.forEach(method => {
				expect(typeof video[method]).toBe('function');
			});
		});

		it('should handle method calls without errors', () => {
			expect(() => video.open()).not.toThrow();
		});
	});
});