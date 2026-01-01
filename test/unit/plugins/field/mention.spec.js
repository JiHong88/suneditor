import Mention from '../../../../src/plugins/field/mention';

// Mock HueSlider module to prevent canvas initialization errors
jest.mock('../../../../src/modules/contract/HueSlider.js', () => {
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

// Capture selectMenu callback to test #SelectMention
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
	// Create mock functions inside the factory
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

describe('Mention Plugin', () => {
	let mockThis;
	let mention;
	let mockEditor;
	let dom;

	// Helper to create mock anchor element
	const createMockAnchorElement = () => {
		const mockParent = document.createElement('div');
		const mockAnchor = document.createElement('a');
		mockParent.appendChild(mockAnchor);
		mockAnchor.setAttribute = jest.fn();
		mockAnchor.getAttribute = jest.fn();
		return mockAnchor;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		// Get the mocked module
		const helper = require('../../../../src/helper');
		dom = helper.dom;

		// Set up mock implementations for createElement and createTextNode
		dom.utils.createElement.mockImplementation(() => createMockAnchorElement());
		dom.utils.createTextNode.mockImplementation(() => document.createTextNode('\u00A0'));

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

	describe('Controller initMethod', () => {
		it('should cancel API manager and close select menu when controller init is called', () => {
			// The controller initMethod should cancel API requests and close the select menu
			expect(capturedControllerOptions).toBeDefined();
			expect(capturedControllerOptions.initMethod).toBeInstanceOf(Function);

			// Call the initMethod callback
			capturedControllerOptions.initMethod();

			// Verify API manager cancel was called
			expect(mention.apiManager.cancel).toHaveBeenCalled();
			// Verify select menu close was called
			expect(mention.selectMenu.close).toHaveBeenCalled();
		});
	});

	describe('onInput - anchor parent handling', () => {
		it('should skip mention creation when cursor is inside an existing anchor without data-se-mention', async () => {
			// Create an anchor element without data-se-mention attribute
			const anchorParent = document.createElement('a');
			anchorParent.href = 'https://example.com';
			anchorParent.getAttribute = jest.fn().mockReturnValue(null); // No data-se-mention

			// Mock isAnchor to return true for this test
			dom.check.isAnchor.mockReturnValue(true);

			// The text before @ must be empty or zero-width to pass the first check
			// Position cursor at offset 5 in " @test" (space before @)
			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: ' @test', // space before @ allows the mention query check to pass
					parentNode: anchorParent,
				},
				anchorOffset: 6,
			});

			mention.directData = [{ key: 'test', name: 'Test User', url: '/test' }];

			await mention.onInput();

			// Controller should NOT be opened - we return early because it's inside a non-mention anchor
			expect(mention.controller.open).not.toHaveBeenCalled();

			// Reset the mock for other tests
			dom.check.isAnchor.mockReturnValue(false);
		});

		it('should allow mention creation when cursor is inside an anchor WITH data-se-mention', async () => {
			// Create an anchor element with data-se-mention attribute
			const anchorParent = document.createElement('a');
			anchorParent.href = 'https://example.com';
			anchorParent.getAttribute = jest.fn().mockReturnValue('existingUser');

			// Mock isAnchor to return true
			dom.check.isAnchor.mockReturnValue(true);

			// space before @ allows the check to pass
			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: ' @test',
					parentNode: anchorParent,
				},
				anchorOffset: 6,
			});

			mention.directData = [{ key: 'test', name: 'Test User', url: '/test' }];

			await mention.onInput();

			// Controller should be opened since we're inside a mention anchor
			expect(mention.controller.open).toHaveBeenCalled();

			// Reset the mock for other tests
			dom.check.isAnchor.mockReturnValue(false);
		});
	});

	describe('API fetch and response parsing', () => {
		it('should fetch and parse API response correctly', async () => {
			// Configure mention to use API instead of direct data
			mention.directData = null;
			mention.apiUrl = '/api/mentions?q={key}';
			mention.cachingData = null; // Disable caching to force API call

			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: '@user',
					parentNode: { tagName: 'DIV' },
				},
				anchorOffset: 5,
			});

			await mention.onInput();

			// API should be called
			expect(mention.apiManager.asyncCall).toHaveBeenCalledWith({
				method: 'GET',
				url: '/api/mentions?q=user'
			});

			// Controller should be opened with parsed API response
			expect(mention.controller.open).toHaveBeenCalled();
			expect(mention.selectMenu.create).toHaveBeenCalled();
		});
	});

	describe('Empty response handling', () => {
		it('should close menu when API returns empty array', async () => {
			mention.directData = null;
			mention.apiUrl = '/api/mentions?q={key}';
			mention.cachingData = null;
			mention.cachingFieldData = null;

			// Mock empty API response
			mention.apiManager.asyncCall.mockResolvedValue({
				responseText: JSON.stringify([])
			});

			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: '@unknown',
					parentNode: { tagName: 'DIV' },
				},
				anchorOffset: 8,
			});

			await mention.onInput();

			// Menu should be closed due to empty response
			expect(mention.selectMenu.close).toHaveBeenCalled();
			// Controller should NOT be opened
			expect(mention.controller.open).not.toHaveBeenCalled();
		});

		it('should close menu when direct data filter returns no matches', async () => {
			mention.directData = [
				{ key: 'alice', name: 'Alice Smith', url: '/alice' },
				{ key: 'bob', name: 'Bob Jones', url: '/bob' },
			];
			mention.cachingFieldData = null;

			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: '@xyz', // No match for 'xyz'
					parentNode: { tagName: 'DIV' },
				},
				anchorOffset: 4,
			});

			await mention.onInput();

			// Menu should be closed since no data matches
			expect(mention.selectMenu.close).toHaveBeenCalled();
		});
	});

	describe('SelectMention callback', () => {
		beforeEach(() => {
			// Ensure we have a fresh mention instance with captured callback
			jest.clearAllMocks();
			mention = new Mention(mockEditor, {
				triggerText: '@',
				limitSize: 5,
			});
			Object.setPrototypeOf(mention, mockThis);
		});

		it('should return false when item is null or undefined', () => {
			expect(capturedSelectMenuCallback).toBeInstanceOf(Function);

			const result = capturedSelectMenuCallback(null);
			expect(result).toBe(false);

			const result2 = capturedSelectMenuCallback(undefined);
			expect(result2).toBe(false);
		});

		it('should update existing anchor element when parent is already a mention anchor', async () => {
			// Create a proper DOM structure with anchor inside a container
			const container = document.createElement('div');
			const anchorParent = document.createElement('a');
			container.appendChild(anchorParent);

			// Create a text node inside the anchor to represent the anchor node
			const textNode = document.createTextNode(' @old');
			anchorParent.appendChild(textNode);

			// Override setAttribute to track calls
			const setAttrSpy = jest.fn();
			anchorParent.setAttribute = setAttrSpy;
			anchorParent.getAttribute = jest.fn().mockReturnValue('oldUser');

			// We need to set the private fields by triggering onInput first
			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: textNode,
				anchorOffset: 5,
			});

			dom.check.isAnchor.mockReturnValue(true);

			mention.directData = [{ key: 'old', name: 'Old User', url: '/old' }];

			// Trigger onInput to set up the internal state
			await mention.onInput();

			// Now call the SelectMention callback
			const item = { key: 'newUser', name: 'New User', url: '/newuser' };
			capturedSelectMenuCallback(item);

			// Verify the anchor was updated
			expect(setAttrSpy).toHaveBeenCalledWith('data-se-mention', 'newUser');
			expect(setAttrSpy).toHaveBeenCalledWith('href', '/newuser');
			expect(setAttrSpy).toHaveBeenCalledWith('title', 'New User');

			dom.check.isAnchor.mockReturnValue(false);
		});

		it('should create new anchor element when parent is not an anchor', async () => {

			const divParent = document.createElement('div');
			const anchorNode = {
				textContent: '@test',
				parentNode: divParent,
			};

			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: anchorNode,
				anchorOffset: 5,
			});

			dom.check.isAnchor.mockReturnValue(false);
			mention.directData = [{ key: 'test', name: 'Test User', url: '/test' }];

			// Trigger onInput to set up internal state
			await mention.onInput();

			// Now call the SelectMention callback
			const item = { key: 'newUser', name: 'New User', url: '/newuser' };
			capturedSelectMenuCallback(item);

			// Verify selection.setRange was called
			expect(mockThis.selection.setRange).toHaveBeenCalled();

			// Verify createElement was called to create the anchor
			expect(dom.utils.createElement).toHaveBeenCalledWith(
				'A',
				expect.objectContaining({
					'data-se-mention': 'newUser',
					href: '/newuser',
					title: 'New User',
					target: '_blank'
				}),
				'@newUser'
			);

			// Verify html.insertNode was called
			expect(mockThis.html.insertNode).toHaveBeenCalled();
		});

		it('should return false when insertNode fails', async () => {

			const divParent = document.createElement('div');
			const anchorNode = {
				textContent: '@test',
				parentNode: divParent,
			};

			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: anchorNode,
				anchorOffset: 5,
			});

			dom.check.isAnchor.mockReturnValue(false);
			mockThis.html.insertNode.mockReturnValue(false); // Simulate failure
			mention.directData = [{ key: 'test', name: 'Test User', url: '/test' }];

			// Trigger onInput
			await mention.onInput();

			// Call SelectMention - should return false due to insertNode failure
			const item = { key: 'newUser', name: 'New User', url: '/newuser' };
			const result = capturedSelectMenuCallback(item);

			expect(result).toBe(false);
		});

		it('should add item to cachingFieldData if not already cached', async () => {
			// Create a proper DOM structure
			const divParent = document.createElement('div');
			const textNode = document.createTextNode(' @test');
			divParent.appendChild(textNode);

			// Create a mock anchor element that will be returned by createElement
			const mockAnchorParent = document.createElement('div');
			const mockAnchor = document.createElement('a');
			mockAnchorParent.appendChild(mockAnchor);

			dom.utils.createElement.mockReturnValue(mockAnchor);
			dom.check.isAnchor.mockReturnValue(false);
			mockThis.html.insertNode.mockReturnValue(true);

			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: textNode,
				anchorOffset: 6,
			});

			mention.directData = [{ key: 'test', name: 'Test User', url: '/test' }];
			mention.cachingFieldData = [];

			// Trigger onInput
			await mention.onInput();

			// Call SelectMention with a new item
			const item = { key: 'uniqueUser', name: 'Unique User', url: '/unique' };
			capturedSelectMenuCallback(item);

			// The item should be added to cachingFieldData
			expect(mention.cachingFieldData).toContainEqual(item);
		});

		it('should not duplicate items in cachingFieldData', async () => {
			// Create proper DOM structure
			const divParent = document.createElement('div');
			const textNode = document.createTextNode(' @test');
			divParent.appendChild(textNode);

			const mockAnchorParent = document.createElement('div');
			const mockAnchor = document.createElement('a');
			mockAnchorParent.appendChild(mockAnchor);

			dom.utils.createElement.mockReturnValue(mockAnchor);
			dom.check.isAnchor.mockReturnValue(false);
			mockThis.html.insertNode.mockReturnValue(true);

			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: textNode,
				anchorOffset: 6,
			});

			mention.directData = [{ key: 'test', name: 'Test User', url: '/test' }];
			// Pre-populate with an existing item
			mention.cachingFieldData = [{ key: 'existingUser', name: 'Existing', url: '/existing' }];

			// Trigger onInput
			await mention.onInput();

			// Call SelectMention with the same key that already exists
			const item = { key: 'existingUser', name: 'Existing', url: '/existing' };
			capturedSelectMenuCallback(item);

			// Should not duplicate - still only 1 item with that key
			const matchingItems = mention.cachingFieldData.filter(d => d.key === 'existingUser');
			expect(matchingItems.length).toBe(1);
		});

		it('should handle null cachingFieldData gracefully', async () => {
			// Create proper DOM structure
			const divParent = document.createElement('div');
			const textNode = document.createTextNode(' @test');
			divParent.appendChild(textNode);

			const mockAnchorParent = document.createElement('div');
			const mockAnchor = document.createElement('a');
			mockAnchorParent.appendChild(mockAnchor);

			dom.utils.createElement.mockReturnValue(mockAnchor);
			dom.check.isAnchor.mockReturnValue(false);
			mockThis.html.insertNode.mockReturnValue(true);

			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: textNode,
				anchorOffset: 6,
			});

			mention.directData = [{ key: 'test', name: 'Test User', url: '/test' }];
			mention.cachingFieldData = null; // Explicitly null

			// Trigger onInput
			await mention.onInput();

			// Should not throw when cachingFieldData is null
			const item = { key: 'user', name: 'User', url: '/user' };
			expect(() => capturedSelectMenuCallback(item)).not.toThrow();
		});
	});

	describe('CachingFieldData merge behavior', () => {
		it('should merge cachingFieldData with API response and deduplicate', async () => {
			mention.directData = null;
			mention.apiUrl = '/api/mentions?q={key}';
			mention.cachingData = null;
			// Pre-populate cachingFieldData with some items
			mention.cachingFieldData = [
				{ key: 'alice', name: 'Alice Local', url: '/alice-local' },
				{ key: 'bob', name: 'Bob Local', url: '/bob-local' },
			];

			// API returns overlapping and new users
			mention.apiManager.asyncCall.mockResolvedValue({
				responseText: JSON.stringify([
					{ key: 'alice', name: 'Alice API', url: '/alice-api' }, // duplicate key
					{ key: 'charlie', name: 'Charlie', url: '/charlie' },
				])
			});

			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: '@a', // matches 'alice'
					parentNode: { tagName: 'DIV' },
				},
				anchorOffset: 2,
			});

			await mention.onInput();

			// Should display list with deduplicated items
			expect(mention.selectMenu.create).toHaveBeenCalled();
			// The first call argument should be the deduplicated list
			const createCall = mention.selectMenu.create.mock.calls[0];
			const itemList = createCall[0];

			// Alice from cachingFieldData should take priority (first in concat)
			const aliceItem = itemList.find(item => item.key === 'alice');
			expect(aliceItem.name).toBe('Alice Local');
		});
	});

	describe('delayTime edge cases', () => {
		it('should handle delayTime of 0', () => {
			const mentionWithZeroDelay = new Mention(mockEditor, {
				delayTime: 0,
			});

			expect(mentionWithZeroDelay.delayTime).toBe(0);
		});

		it('should use default delayTime of 200 when not specified', () => {
			const mentionDefault = new Mention(mockEditor, {});

			expect(mentionDefault.delayTime).toBe(200);
		});
	});

	describe('API URL construction', () => {
		it('should remove whitespace from API URL', () => {
			const mentionWithSpaceyUrl = new Mention(mockEditor, {
				apiUrl: '  /api/mentions?limit={limitSize}  ',
				limitSize: 10,
			});

			expect(mentionWithSpaceyUrl.apiUrl).toBe('/api/mentions?limit=10');
		});

		it('should handle empty apiUrl', () => {
			const mentionNoApi = new Mention(mockEditor, {});

			expect(mentionNoApi.apiUrl).toBe('');
		});
	});

	describe('Mention query with whitespace', () => {
		it('should close menu when mention query contains whitespace', async () => {
			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: '@test user', // contains space in query
					parentNode: { tagName: 'DIV' },
				},
				anchorOffset: 10,
			});

			mention.directData = [{ key: 'testuser', name: 'Test User', url: '/test' }];

			await mention.onInput();

			// Should close menu because query 'test user' contains whitespace
			expect(mention.selectMenu.close).toHaveBeenCalled();
		});
	});

	describe('Zero-width character handling', () => {
		it('should allow mention after zero-width character', async () => {

			// Mock isZeroWidth to return true for the character before @
			dom.check.isZeroWidth.mockReturnValue(true);

			mockThis.selection.get.mockReturnValue({
				rangeCount: 1,
				anchorNode: {
					textContent: '\u200B@test', // zero-width space before @
					parentNode: { tagName: 'DIV' },
				},
				anchorOffset: 6,
			});

			mention.directData = [{ key: 'test', name: 'Test User', url: '/test' }];

			await mention.onInput();

			// Should create mention list
			expect(mention.controller.open).toHaveBeenCalled();

			// Reset
			dom.check.isZeroWidth.mockReturnValue(false);
		});
	});
});
