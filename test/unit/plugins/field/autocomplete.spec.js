import Autocomplete from '../../../../src/plugins/field/autocomplete';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';

// Mock HueSlider module to prevent canvas initialization errors
jest.mock('../../../../src/modules/contract/HueSlider.js', () => {
	return jest.fn().mockImplementation(() => ({}));
});

import { createMockThis } from '../../../__mocks__/editorMock';

// Mock dependencies
// Capture controller options to test initMethod
let capturedControllerOptions = null;
jest.mock('../../../../src/modules/contract', () => ({
	Controller: jest.fn().mockImplementation((plugin, element, options, additional) => {
		capturedControllerOptions = options;
		return {
			open: jest.fn(),
			close: jest.fn(),
		};
	}),
}));

jest.mock('../../../../src/modules/manager', () => ({
	ApiManager: jest.fn().mockImplementation((plugin, options) => ({
		cancel: jest.fn(),
		asyncCall: jest.fn().mockResolvedValue({
			responseText: JSON.stringify([
				{ key: 'user1', name: 'User One', url: '/user1' },
				{ key: 'user2', name: 'User Two', url: '/user2' },
			]),
		}),
	}))
}));

// Capture selectMenu callback to test #onSelectItem
let capturedSelectMenuCallback = null;
jest.mock('../../../../src/modules/ui', () => ({
	SelectMenu: jest.fn().mockImplementation((plugin, options) => ({
		on: jest.fn((element, callback) => {
			capturedSelectMenuCallback = callback;
		}),
		close: jest.fn(),
		create: jest.fn(),
		open: jest.fn(),
		setItem: jest.fn(),
	})),
}));

jest.mock('../../../../src/helper', () => {
	const mockIsAnchor = jest.fn().mockReturnValue(false);
	const mockIsZeroWidth = jest.fn().mockReturnValue(false);
	const mockCreateElement = jest.fn();
	const mockCreateTextNode = jest.fn();

	return {
		dom: {
			check: {
				isAnchor: mockIsAnchor,
				isZeroWidth: mockIsZeroWidth,
			},
			utils: {
				createElement: mockCreateElement,
				createTextNode: mockCreateTextNode,
			},
		},
		converter: {
			debounce: jest.fn().mockImplementation((fn) => fn),
		},
		env: {
			isTouchDevice: false,
			_w: global.window || {},
			ON_OVER_COMPONENT: 'data-se-on-over-component',
		},
	};
});

describe('Autocomplete Plugin', () => {
	let mockThis;
	let autocomplete;
	let kernel;
	let dom;

	beforeEach(() => {
		jest.clearAllMocks();

		const helper = require('../../../../src/helper');
		dom = helper.dom;

		dom.utils.createElement.mockImplementation(() => {
			const el = document.createElement('span');
			el.setAttribute = jest.fn();
			el.getAttribute = jest.fn();
			return el;
		});
		dom.utils.createTextNode.mockImplementation(() => document.createTextNode('\u00A0'));

		mockThis = createMockThis();
		kernel = mockThis.editor;

		mockThis.selection = {
			get: jest.fn().mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: '@test user',
					parentNode: document.createElement('div'),
				},
				anchorOffset: 5,
			}),
			setRange: jest.fn(),
		};

		mockThis.html = {
			insertNode: jest.fn().mockReturnValue(true),
		};

		autocomplete = new Autocomplete(kernel, {
			limitSize: 5,
			searchStartLength: 0,
			delayTime: 200,
			triggers: {
				'@': {
					data: [{ key: 'user1', name: 'User One', url: '/user1' }],
				},
			},
		});

		Object.setPrototypeOf(autocomplete, mockThis);
	});

	describe('Constructor', () => {
		it('should create Autocomplete instance with default global options', () => {
			const ctx = autocomplete.triggerContexts.get('@');
			expect(ctx.trigger).toBe('@');
			expect(ctx.limitSize).toBe(5);
			expect(ctx.searchStartLength).toBe(0);
		});

		it('should create Autocomplete instance with per-trigger overrides', () => {
			const custom = new Autocomplete(kernel, {
				limitSize: 5,
				triggers: {
					'#': {
						limitSize: 10,
						searchStartLength: 2,
						useCachingData: false,
						useCachingFieldData: false,
					},
				},
			});

			const ctx = custom.triggerContexts.get('#');
			expect(ctx.trigger).toBe('#');
			expect(ctx.limitSize).toBe(10);
			expect(ctx.searchStartLength).toBe(2);
			expect(ctx.cachingData).toBeNull();
			expect(ctx.cachingFieldData).toBeNull();
		});

		it('should initialize with direct data', () => {
			const data = [{ key: 'user1', name: 'User One', url: '/user1' }];

			const ac = new Autocomplete(kernel, {
				triggers: { '@': { data } },
			});

			expect(ac.triggerContexts.get('@').directData).toBe(data);
		});

		it('should initialize API URL correctly', () => {
			const ac = new Autocomplete(kernel, {
				triggers: {
					'@': {
						apiUrl: '/api/autocomplete?limit={limitSize}&q={key}',
						limitSize: 10,
					},
				},
			});

			expect(ac.triggerContexts.get('@').apiUrl).toBe('/api/autocomplete?limit=10&q={key}');
		});

		it('should sort triggers by length descending', () => {
			const ac = new Autocomplete(kernel, {
				triggers: {
					'@': {},
					'##': {},
					'#': {},
				},
			});

			expect(ac.sortedTriggers).toEqual(['##', '@', '#']);
		});
	});

	describe('Caching', () => {
		it('should initialize caching data structures per trigger', () => {
			const ctx = autocomplete.triggerContexts.get('@');
			expect(ctx.cachingData).toBeInstanceOf(Map);
			expect(ctx.cachingFieldData).toBeInstanceOf(Array);
		});

		it('should handle disabled caching', () => {
			const ac = new Autocomplete(kernel, {
				useCachingData: false,
				useCachingFieldData: false,
				triggers: { '@': {} },
			});

			const ctx = ac.triggerContexts.get('@');
			expect(ctx.cachingData).toBeNull();
			expect(ctx.cachingFieldData).toBeNull();
		});

		it('should allow per-trigger caching override', () => {
			const ac = new Autocomplete(kernel, {
				useCachingData: true,
				triggers: {
					'@': { useCachingData: false },
					'#': {},
				},
			});

			expect(ac.triggerContexts.get('@').cachingData).toBeNull();
			expect(ac.triggerContexts.get('#').cachingData).toBeInstanceOf(Map);
		});
	});

	describe('API URL construction', () => {
		it('should remove whitespace from API URL', () => {
			const ac = new Autocomplete(kernel, {
				triggers: {
					'@': {
						apiUrl: '  /api/autocomplete?limit={limitSize}  ',
						limitSize: 10,
					},
				},
			});

			expect(ac.triggerContexts.get('@').apiUrl).toBe('/api/autocomplete?limit=10');
		});

		it('should handle empty apiUrl', () => {
			const ac = new Autocomplete(kernel, {
				triggers: { '@': {} },
			});

			expect(ac.triggerContexts.get('@').apiUrl).toBe('');
		});
	});

	describe('SelectMenu callback', () => {
		it('should register selectMenu callback', () => {
			expect(autocomplete.selectMenu.on).toHaveBeenCalled();
		});
	});

	describe('Multiple triggers', () => {
		it('should create independent contexts for each trigger', () => {
			const ac = new Autocomplete(kernel, {
				triggers: {
					'@': { data: [{ key: 'a' }], limitSize: 3 },
					'#': { apiUrl: '/tags?q={key}', limitSize: 10 },
				},
			});

			const atCtx = ac.triggerContexts.get('@');
			const hashCtx = ac.triggerContexts.get('#');

			expect(atCtx.directData).toHaveLength(1);
			expect(atCtx.limitSize).toBe(3);
			expect(atCtx.apiManager).toBeNull();

			expect(hashCtx.directData).toBeNull();
			expect(hashCtx.limitSize).toBe(10);
			expect(hashCtx.apiManager).toBeTruthy();
		});

		it('should create separate apiManager per trigger with apiUrl', () => {
			const ac = new Autocomplete(kernel, {
				triggers: {
					'@': { apiUrl: '/users?q={key}' },
					'#': { apiUrl: '/tags?q={key}' },
				},
			});

			const atApi = ac.triggerContexts.get('@').apiManager;
			const hashApi = ac.triggerContexts.get('#').apiManager;

			expect(atApi).toBeTruthy();
			expect(hashApi).toBeTruthy();
			expect(atApi).not.toBe(hashApi);
		});
	});
});
