import Embed from '../../../../src/plugins/modal/embed';

// Mock dependencies with minimal setup
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor() {
			this.lang = { embed: 'Embed', close: 'Close', submitButton: 'Submit' };
			this.icons = { cancel: '<svg>cancel</svg>' };
			this.eventManager = { addEvent: jest.fn() };
		}
	};
});

jest.mock('../../../../src/modules', () => ({
	Modal: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		form: { querySelector: jest.fn().mockReturnValue({ checked: true, value: '' }) }
	})),
	Figure: jest.fn().mockImplementation(() => ({ open: jest.fn() }))
}));

// Add static methods to Modal
Object.assign(require('../../../../src/modules').Modal, {
	OnChangeFile: jest.fn(),
	CreateFileInput: jest.fn().mockReturnValue(''),
	CreateGallery: jest.fn().mockReturnValue('')
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockReturnValue({
				querySelector: jest.fn().mockReturnValue({ value: '' })
			})
		}
	},
	numbers: { get: jest.fn((val, def) => val || def) },
	env: { _w: global, NO_EVENT: Symbol('NO_EVENT') },
	keyCodeMap: { key: { 13: 'Enter' } }
}));

describe('Embed Plugin', () => {
	let mockEditor;

	beforeEach(() => {
		mockEditor = {
			lang: { embed: 'Embed', close: 'Close', submitButton: 'Submit' },
			icons: { cancel: '<svg>cancel</svg>' },
			plugins: {}
		};
	});

	describe('Constructor', () => {
		it('should create Embed instance', () => {
			expect(() => new Embed(mockEditor, {})).not.toThrow();
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Embed.key).toBe('embed');
			expect(Embed.type).toBe('modal');
			expect(Embed.className).toBe('');
		});
	});

	describe('Instance methods', () => {
		let embed;

		beforeEach(() => {
			embed = new Embed(mockEditor, {});
		});

		it('should have required methods', () => {
			const methods = ['open', 'on', 'modalAction'];
			methods.forEach(method => {
				expect(typeof embed[method]).toBe('function');
			});
		});

		it('should handle method calls without errors', () => {
			expect(() => embed.open()).not.toThrow();
			expect(() => embed.on(false)).not.toThrow();
			expect(() => embed.init()).not.toThrow();
		});
	});
});