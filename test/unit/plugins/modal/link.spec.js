import Link from '../../../../src/plugins/modal/link';

// Mock dependencies with minimal setup
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor() {
			this.lang = { link: 'Link', close: 'Close', submitButton: 'Submit' };
			this.icons = { cancel: '<svg>cancel</svg>' };
			this.eventManager = { addEvent: jest.fn() };
			this.anchor = { on: jest.fn() };
		}
	};
});

jest.mock('../../../../src/modules', () => ({
	Modal: jest.fn().mockImplementation(() => ({ open: jest.fn(), close: jest.fn() })),
	Controller: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		form: { querySelector: jest.fn().mockReturnValue({ href: '', textContent: '', title: '', target: '' }) }
	})),
	ModalAnchorEditor: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		set: jest.fn(),
		get: jest.fn().mockReturnValue({ url: '', text: '', title: '', newTab: false })
	}))
}));

jest.mock('../../../../src/helper', () => ({
	dom: {
		check: { isAnchor: jest.fn().mockReturnValue(false) },
		utils: { createElement: jest.fn().mockReturnValue({}), addClass: jest.fn(), removeClass: jest.fn() }
	},
	numbers: { get: jest.fn((val, def) => val || def) }
}));

describe('Link Plugin', () => {
	let mockEditor;

	beforeEach(() => {
		mockEditor = {
			lang: { link: 'Link', close: 'Close', submitButton: 'Submit' },
			icons: { cancel: '<svg>cancel</svg>' },
			plugins: {}
		};
	});

	describe('Constructor', () => {
		it('should create Link instance', () => {
			expect(() => new Link(mockEditor, {})).not.toThrow();
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Link.key).toBe('link');
			expect(Link.type).toBe('modal');
			expect(Link.className).toBe('se-icon-flip-rtl');
		});
	});

	describe('Instance methods', () => {
		let link;

		beforeEach(() => {
			link = new Link(mockEditor, {});
		});

		it('should have required methods', () => {
			const methods = ['open', 'active', 'on', 'modalAction'];
			methods.forEach(method => {
				expect(typeof link[method]).toBe('function');
			});
		});

		it('should handle method calls without errors', () => {
			expect(() => link.open()).not.toThrow();
			// link.on calls this.anchor.on, so we mock it properly
			link.anchor = { on: jest.fn() };
			expect(() => link.on(false)).not.toThrow();
		});
	});
});