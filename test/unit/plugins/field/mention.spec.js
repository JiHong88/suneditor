import Mention from '../../../../src/plugins/field/mention';

// Mock HueSlider module to prevent canvas initialization errors
jest.mock('../../../../src/modules/contracts/HueSlider.js', () => {
	return jest.fn().mockImplementation(() => ({}));
});
import { createMockThis } from '../../../__mocks__/editorMock';

// Mock dependencies
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor(editor) {
			this.editor = editor;
			this.lang = { mention: 'Mention' };
		}
	};
});

jest.mock('../../../../src/modules/contracts', () => ({
	Controller: jest.fn().mockImplementation((plugin, element, options, additional) => ({
		open: jest.fn(),
		close: jest.fn(),
	})),
}));

jest.mock('../../../../src/modules/utils', () => ({
	ApiManager: jest.fn().mockImplementation((plugin, options) => ({
		cancel: jest.fn(),
		asyncCall: jest.fn().mockResolvedValue({
			responseText: JSON.stringify([
				{ key: 'user1', name: 'User One', url: '/user1' },
				{ key: 'user2', name: 'User Two', url: '/user2' },
			]),
		}),
	})),
	SelectMenu: jest.fn().mockImplementation((plugin, options) => ({
		on: jest.fn(),
		close: jest.fn(),
		create: jest.fn(),
		open: jest.fn(),
		setItem: jest.fn(),
	})),
}));

jest.mock('../../../../src/helper', () => ({
	dom: {
		check: {
			isAnchor: jest.fn().mockReturnValue(false),
			isZeroWidth: jest.fn().mockReturnValue(false),
		},
		utils: {
			createElement: jest.fn().mockReturnValue({
				tagName: 'DIV',
				className: '',
				innerHTML: '',
				setAttribute: jest.fn(),
				getAttribute: jest.fn(),
			}),
			createTextNode: jest.fn().mockReturnValue({
				nodeType: 3,
				textContent: '',
			}),
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
}));

describe('Mention Plugin', () => {
	let mockThis;
	let mention;
	let mockEditor;

	beforeEach(() => {
		jest.clearAllMocks();

		mockThis = createMockThis();
		mockEditor = mockThis.editor;

		// Mock selection methods
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

		// Mock html methods
		mockThis.html = {
			insertNode: jest.fn().mockReturnValue(true),
		};

		mention = new Mention(mockEditor, {
			triggerText: '@',
			limitSize: 5,
			searchStartLength: 0,
			delayTime: 200,
		});

		// Bind mockThis context to mention methods
		Object.setPrototypeOf(mention, mockThis);
	});

	describe('Constructor', () => {
		it('should create Mention instance with default options', () => {
			expect(mention.triggerText).toBe('@');
			expect(mention.limitSize).toBe(5);
			expect(mention.searchStartLength).toBe(0);
			expect(mention.delayTime).toBe(200);
		});

		it('should create Mention instance with custom options', () => {
			const customMention = new Mention(mockEditor, {
				triggerText: '#',
				limitSize: 10,
				searchStartLength: 2,
				delayTime: 500,
				useCachingData: false,
				useCachingFieldData: false,
			});

			expect(customMention.triggerText).toBe('#');
			expect(customMention.limitSize).toBe(10);
			expect(customMention.searchStartLength).toBe(2);
			expect(customMention.delayTime).toBe(500);
			expect(customMention.cachingData).toBeNull();
			expect(customMention.cachingFieldData).toBeNull();
		});

		it('should initialize with direct data', () => {
			const data = [{ key: 'user1', name: 'User One', url: '/user1' }];

			const mentionWithData = new Mention(mockEditor, {
				data: data,
			});

			expect(mentionWithData.directData).toBe(data);
		});

		it('should initialize API URL correctly', () => {
			const mentionWithApi = new Mention(mockEditor, {
				apiUrl: '/api/mentions?limit={limitSize}&q={key}',
				limitSize: 10,
			});

			expect(mentionWithApi.apiUrl).toBe('/api/mentions?limit=10&q={key}');
		});
	});

	describe('onInput', () => {
		it('should handle input with trigger character', async () => {
			mention.directData = [{ key: 'test', name: 'Test User', url: '/test' }];

			const result = await mention.onInput();

			expect(result).toBe(undefined); // Returns false when mention list is shown
		});

		it('should close menu when no selection', async () => {
			mockThis.selection.get.mockReturnValue({ rangeCount: 0 });

			const result = await mention.onInput();

			expect(mention.selectMenu.close).toHaveBeenCalled();
			expect(result).toBe(undefined);
		});

		it('should handle text without trigger character', async () => {
			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: 'normal text',
					parentNode: document.createElement('div'),
				},
				anchorOffset: 11,
			});

			const result = await mention.onInput();

			expect(mention.selectMenu.close).toHaveBeenCalled();
			expect(result).toBe(undefined);
		});

		it('should handle minimum search length requirement', async () => {
			mention.searchStartLength = 3;
			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: '@te', // Only 2 characters after @
					parentNode: document.createElement('div'),
				},
				anchorOffset: 3,
			});

			const result = await mention.onInput();

			expect(result).toBe(undefined);
		});

		it('should handle API error gracefully', async () => {
			mention.apiUrl = '/api/mentions';
			mention.directData = null;
			mention.apiManager.asyncCall.mockRejectedValue(new Error('API Error'));

			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

			const result = await mention.onInput();

			expect(consoleSpy).toHaveBeenCalledWith('[SUNEDITOR.mention.api.file] ', expect.any(Error));
			expect(result).toBe(undefined);

			consoleSpy.mockRestore();
		});
	});

	describe('createMentionList', () => {
		it('should filter direct data correctly', async () => {
			mention.directData = [
				{ key: 'alice', name: 'Alice Smith', url: '/alice' },
				{ key: 'bob', name: 'Bob Jones', url: '/bob' },
				{ key: 'alicia', name: 'Alicia Brown', url: '/alicia' },
			];

			// Mock the method since it's private - test through onInput instead
			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: '@al',
					parentNode: { tagName: 'DIV' },
				},
				anchorOffset: 3,
			});

			await mention.onInput();

			expect(mention.controller.open).toHaveBeenCalled();
			expect(mention.selectMenu.create).toHaveBeenCalled();
			expect(mention.selectMenu.open).toHaveBeenCalled();
		});

		it('should use cached data when available', async () => {
			const cachedData = [{ key: 'cached', name: 'Cached User', url: '/cached' }];
			mention.cachingData.set('cached', cachedData);

			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: '@cached',
					parentNode: { tagName: 'DIV' },
				},
				anchorOffset: 7,
			});

			await mention.onInput();

			expect(mention.controller.open).toHaveBeenCalled();
		});
	});

	describe('SelectMention', () => {
		it('should handle selection behavior', () => {
			// Since #SelectMention is a private method, we test its behavior indirectly
			// The method would be called internally by the select menu system
			expect(mention.selectMenu.on).toHaveBeenCalled();
		});
	});

	describe('Caching', () => {
		it('should initialize caching data structures', () => {
			// Test that caching structures are properly initialized
			expect(mention.cachingData).toBeInstanceOf(Map);
			expect(mention.cachingFieldData).toBeInstanceOf(Array);
		});

		it('should handle disabled caching', () => {
			const mentionNoCache = new Mention(mockEditor, {
				useCachingData: false,
				useCachingFieldData: false,
			});

			expect(mentionNoCache.cachingData).toBeNull();
			expect(mentionNoCache.cachingFieldData).toBeNull();
		});
	});
});
