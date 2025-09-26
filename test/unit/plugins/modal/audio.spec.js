import Audio from '../../../../src/plugins/modal/audio';

// Mock dependencies with minimal setup
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor() {
			this.lang = { audio: 'Audio', close: 'Close', submitButton: 'Submit' };
			this.icons = { cancel: '<svg>cancel</svg>' };
			this.eventManager = { addEvent: jest.fn() };
			this.events = { onAudioLoad: jest.fn(), onAudioAction: jest.fn() };
			this.preview = { style: {} };
			this.audioInputFile = { value: '' };
			this.audioUrlFile = { disabled: false };
		}
	};
});

jest.mock('../../../../src/modules', () => ({
	Modal: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		form: {
			querySelector: jest.fn().mockReturnValue({
				style: {},
				disabled: false,
				value: ''
			})
		}
	})),
	Controller: jest.fn().mockImplementation(() => ({ open: jest.fn(), close: jest.fn() })),
	FileManager: jest.fn().mockImplementation(() => ({ getSize: jest.fn(), upload: jest.fn() })),
	Figure: jest.fn().mockImplementation(() => ({ open: jest.fn() })),
	_DragHandle: { get: jest.fn() }
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
	env: { NO_EVENT: Symbol('NO_EVENT'), ON_OVER_COMPONENT: Symbol('ON_OVER_COMPONENT') }
}));

describe('Audio Plugin', () => {
	let mockEditor;

	beforeEach(() => {
		mockEditor = {
			lang: { audio: 'Audio', close: 'Close', submitButton: 'Submit' },
			icons: { cancel: '<svg>cancel</svg>' },
			plugins: {}
		};
	});

	describe('Constructor', () => {
		it('should create Audio instance', () => {
			expect(() => new Audio(mockEditor, {})).not.toThrow();
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Audio.key).toBe('audio');
			expect(Audio.type).toBe('modal');
			expect(Audio.className).toBe('');
		});
	});

	describe('Static methods', () => {
		it('should have component method', () => {
			expect(typeof Audio.component).toBe('function');
		});

		it('should return audio element if valid', () => {
			const mockElement = { nodeName: 'AUDIO' };
			const result = Audio.component(mockElement);
			expect(result).toBe(mockElement);
		});

		it('should return null for non-audio element', () => {
			const mockElement = { nodeName: 'DIV' };
			const result = Audio.component(mockElement);
			expect(result).toBeNull();
		});
	});

	describe('Instance methods', () => {
		let audio;

		beforeEach(() => {
			audio = new Audio(mockEditor, {});
		});

		it('should have required methods', () => {
			const methods = ['open', 'on', 'modalAction'];
			methods.forEach(method => {
				expect(typeof audio[method]).toBe('function');
			});
		});

		it('should handle method calls without errors', () => {
			expect(() => audio.open()).not.toThrow();
			expect(() => audio.on(false)).not.toThrow();
		});
	});
});