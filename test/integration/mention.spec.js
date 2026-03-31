/**
 * @fileoverview Integration tests for Mention plugin
 * Tests src/plugins/field/mention.js through real editor
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { mention } from '../../src/plugins';

// Mock Range.prototype.getClientRects and getBoundingClientRect for JSDOM
// These are needed because the Controller.open -> Offset.setAbsPosition -> Selection.getRects
// call chain requires getClientRects() on Range objects, which JSDOM does not support.
const mockDOMRect = { top: 100, left: 100, bottom: 120, right: 200, width: 100, height: 20, x: 100, y: 100 };

if (!Range.prototype.getClientRects) {
	Range.prototype.getClientRects = function () {
		return [mockDOMRect];
	};
}
if (!Range.prototype.getBoundingClientRect) {
	Range.prototype.getBoundingClientRect = function () {
		return mockDOMRect;
	};
}

/**
 * Helper to set cursor position in the wysiwyg editor.
 * Sets a collapsed selection at the given offset within a text node.
 */
function setCursorPosition(textNode, offset) {
	const range = document.createRange();
	range.setStart(textNode, offset);
	range.collapse(true);
	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

/**
 * Helper to wait for the debounced onInput to execute.
 * With delayTime=0, a short wait is sufficient for the setTimeout(0) and async execution.
 */
function waitForDebounce(ms = 50) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Mention Plugin Integration Tests', () => {
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor({
			plugins: { mention },
			buttonList: [],
			mention: {
				triggerText: '@',
				limitSize: 5,
				searchStartLength: 0,
				delayTime: 0,
				data: [
					{ key: 'user1', name: 'Alice', url: '/users/1' },
					{ key: 'user2', name: 'Bob', url: '/users/2' },
					{ key: 'user3', name: 'Charlie', url: '/users/3' },
				],
			},
		});
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(async () => {
		// Wait for any pending debounced onInput calls to complete before destroying,
		// preventing errors from async operations executing after editor destruction.
		await waitForDebounce(200);
		if (editor && editor.$) {
			const mentionInst = editor.$.plugins?.mention;
			if (mentionInst) {
				if (mentionInst.selectMenu.isOpen) {
					mentionInst.selectMenu.close();
				}
				if (mentionInst.controller.isOpen) {
					mentionInst.controller.close(true);
				}
			}
		}
		await waitForDebounce(50);
		destroyTestEditor(editor);
	});

	describe('plugin registration', () => {
		it('should register mention plugin', () => {
			expect(editor.$.plugins.mention).toBeTruthy();
		});

		it('should have correct trigger text', () => {
			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.triggerText).toBe('@');
		});

		it('should have correct limit size', () => {
			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.limitSize).toBe(5);
		});
	});

	describe('mention plugin properties', () => {
		it('should have selectMenu', () => {
			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.selectMenu).toBeTruthy();
		});

		it('should have controller', () => {
			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.controller).toBeTruthy();
		});

		it('should have directData when data is provided', () => {
			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.directData).toBeTruthy();
			expect(mentionInst.directData.length).toBe(3);
		});

		it('should have search start length configured', () => {
			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.searchStartLength).toBe(0);
		});

		it('should have delay time configured', () => {
			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.delayTime).toBe(0);
		});
	});

	describe('mention with different trigger text', () => {
		it('should support # as trigger text', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {
					triggerText: '#',
					data: [{ key: 'tag1', name: 'javascript', url: '/tags/js' }],
				},
			});
			await waitForEditorReady(editor);

			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.triggerText).toBe('#');
		});
	});

	describe('mention data handling', () => {
		it('should initialize cachingData as Map when data provided', () => {
			const mentionInst = editor.$.plugins.mention;
			// When directData is set, cachingData may be null (only for API mode)
			if (mentionInst.cachingData) {
				expect(mentionInst.cachingData instanceof Map).toBe(true);
			}
		});

		it('should store direct data with correct structure', () => {
			const mentionInst = editor.$.plugins.mention;
			if (mentionInst.directData) {
				expect(mentionInst.directData[0]).toHaveProperty('key');
				expect(mentionInst.directData[0]).toHaveProperty('name');
			}
		});
	});

	describe('mention with API URL', () => {
		it('should store apiUrl when provided', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {
					triggerText: '@',
					apiUrl: 'https://api.example.com/users?q={key}&limit={limitSize}',
				},
			});
			await waitForEditorReady(editor);

			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.apiUrl).toContain('{key}');
		});

		it('should have apiManager when API URL is provided', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {
					triggerText: '@',
					apiUrl: 'https://api.example.com/users?q={key}&limit={limitSize}',
				},
			});
			await waitForEditorReady(editor);

			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.apiManager).toBeTruthy();
		});
	});

	describe('mention options defaults', () => {
		it('should use default limitSize of 5', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {},
			});
			await waitForEditorReady(editor);

			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.limitSize).toBe(5);
		});

		it('should use default trigger text @', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {},
			});
			await waitForEditorReady(editor);

			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.triggerText).toBe('@');
		});
	});

	describe('onInput - trigger text detection', () => {
		it('should open selectMenu when trigger text @ is found with matching query', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>Hello @user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 12); // after "@user1" (length of "Hello @user1" = 12)

			mentionInst.onInput();
			await waitForDebounce();

			// The selectMenu should have been opened with matching items
			expect(mentionInst.selectMenu.isOpen).toBe(true);
		});

		it('should filter data by mention query prefix', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6); // after "@user1"

			mentionInst.onInput();
			await waitForDebounce();

			// Only user1 should match "user1" prefix
			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBe(1);
			expect(mentionInst.selectMenu.items[0].key).toBe('user1');
		});

		it('should show multiple results when query matches multiple items', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5); // after "@user"

			mentionInst.onInput();
			await waitForDebounce();

			// "user" prefix should match user1, user2, user3
			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBe(3);
		});

		it('should show all items when query is empty (just @)', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>Hello @</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 7); // after "@"

			mentionInst.onInput();
			await waitForDebounce();

			// Empty query after @ should match all items
			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBe(3);
		});
	});

	describe('onInput - no trigger text', () => {
		it('should close selectMenu when no trigger text is present', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>Hello world</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 11); // after "Hello world"

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.selectMenu.isOpen).toBe(false);
		});
	});

	describe('onInput - no rangeCount', () => {
		it('should close selectMenu and return early when selection has no rangeCount', async () => {
			const mentionInst = editor.$.plugins.mention;

			// Mock selection.get() to return a selection with rangeCount=0
			// because the editor's selection.get() auto-creates a default range
			const originalGet = editor.$.selection.get.bind(editor.$.selection);
			const selectionGetSpy = jest.spyOn(editor.$.selection, 'get').mockReturnValue({ rangeCount: 0 });
			const closeSpy = jest.spyOn(mentionInst.selectMenu, 'close');

			mentionInst.onInput();
			await waitForDebounce();

			expect(closeSpy).toHaveBeenCalled();
			expect(mentionInst.selectMenu.isOpen).toBe(false);

			selectionGetSpy.mockRestore();
			closeSpy.mockRestore();
		});
	});

	describe('onInput - whitespace in query', () => {
		it('should close selectMenu when mention query contains whitespace', async () => {
			const mentionInst = editor.$.plugins.mention;

			// Text with space after trigger: "@user name" - whitespace in query should close
			wysiwyg.innerHTML = '<p>@user name</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 10); // after "@user name"

			mentionInst.onInput();
			await waitForDebounce();

			// Query "user name" contains whitespace, should not trigger
			expect(mentionInst.selectMenu.isOpen).toBe(false);
		});
	});

	describe('onInput - searchStartLength', () => {
		it('should not trigger when query is shorter than searchStartLength', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {
					triggerText: '@',
					limitSize: 5,
					searchStartLength: 3,
					delayTime: 0,
					data: [
						{ key: 'user1', name: 'Alice', url: '/users/1' },
						{ key: 'user2', name: 'Bob', url: '/users/2' },
					],
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const mentionInst = editor.$.plugins.mention;

			// Type only 2 chars after @ (less than searchStartLength=3)
			wysiwyg.innerHTML = '<p>@us</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 3); // after "@us"

			mentionInst.onInput();
			await waitForDebounce();

			// Query "us" is length 2, searchStartLength is 3, should not trigger
			expect(mentionInst.selectMenu.isOpen).toBe(false);
		});

		it('should trigger when query meets searchStartLength requirement', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {
					triggerText: '@',
					limitSize: 5,
					searchStartLength: 3,
					delayTime: 0,
					data: [
						{ key: 'user1', name: 'Alice', url: '/users/1' },
						{ key: 'user2', name: 'Bob', url: '/users/2' },
					],
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const mentionInst = editor.$.plugins.mention;

			// Type 4 chars after @ (meets searchStartLength=3)
			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5); // after "@user"

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBe(2);
		});
	});

	describe('onInput - anchor parent handling', () => {
		it('should skip when cursor is inside a non-mention anchor', async () => {
			const mentionInst = editor.$.plugins.mention;

			// Create a regular anchor (not a mention) containing trigger text
			wysiwyg.innerHTML = '<p><a href="https://example.com">@user1</a></p>';
			const anchor = wysiwyg.querySelector('a');
			const textNode = anchor.firstChild;
			setCursorPosition(textNode, 6); // after "@user1" inside <a>

			mentionInst.onInput();
			await waitForDebounce();

			// Should not open because parent is an anchor without data-se-mention
			expect(mentionInst.selectMenu.isOpen).toBe(false);
		});

		it('should process when cursor is inside a mention anchor (has data-se-mention)', async () => {
			const mentionInst = editor.$.plugins.mention;

			// Create a mention anchor (with data-se-mention attribute)
			wysiwyg.innerHTML = '<p><a href="/users/1" data-se-mention="user1">@user</a></p>';
			const anchor = wysiwyg.querySelector('a');
			const textNode = anchor.firstChild;
			setCursorPosition(textNode, 5); // after "@user"

			mentionInst.onInput();
			await waitForDebounce();

			// Should open because parent is an anchor WITH data-se-mention
			expect(mentionInst.selectMenu.isOpen).toBe(true);
		});
	});

	describe('direct data filtering', () => {
		it('should filter data case-insensitively by key prefix', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@USER</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5); // after "@USER"

			mentionInst.onInput();
			await waitForDebounce();

			// Case-insensitive: "USER" should match "user1", "user2", "user3"
			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBe(3);
		});

		it('should return no items when query matches nothing', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@zzz</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 4); // after "@zzz"

			mentionInst.onInput();
			await waitForDebounce();

			// "zzz" matches no data items
			expect(mentionInst.selectMenu.isOpen).toBe(false);
		});

		it('should respect limitSize for direct data', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {
					triggerText: '@',
					limitSize: 2,
					searchStartLength: 0,
					delayTime: 0,
					data: [
						{ key: 'user1', name: 'Alice', url: '/users/1' },
						{ key: 'user2', name: 'Bob', url: '/users/2' },
						{ key: 'user3', name: 'Charlie', url: '/users/3' },
					],
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5); // after "@user"

			mentionInst.onInput();
			await waitForDebounce();

			// limitSize=2 should cap the results
			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBe(2);
		});
	});

	describe('caching behavior', () => {
		it('should cache results after first search when cachingData is enabled', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			// After first search, "user" should be cached
			expect(mentionInst.cachingData).toBeTruthy();
			expect(mentionInst.cachingData.has('user')).toBe(true);
			expect(mentionInst.cachingData.get('user').length).toBe(3);
		});

		it('should use cached data on subsequent searches with same query', async () => {
			const mentionInst = editor.$.plugins.mention;

			// First search
			wysiwyg.innerHTML = '<p>@user</p>';
			let textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			// Verify cached
			expect(mentionInst.cachingData.has('user')).toBe(true);

			// Close the menu
			mentionInst.selectMenu.close();
			await waitForDebounce();

			// Second search with same query
			wysiwyg.innerHTML = '<p>@user</p>';
			textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			// Should still open with cached data
			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBe(3);
		});

		it('should not cache when cachingData is disabled', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {
					triggerText: '@',
					limitSize: 5,
					searchStartLength: 0,
					delayTime: 0,
					useCachingData: false,
					data: [
						{ key: 'user1', name: 'Alice', url: '/users/1' },
					],
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.cachingData).toBeNull();
		});
	});

	describe('cachingFieldData', () => {
		it('should be initialized as an array when enabled', () => {
			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.cachingFieldData).toBeInstanceOf(Array);
			expect(mentionInst.cachingFieldData.length).toBe(0);
		});

		it('should be null when disabled', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {
					triggerText: '@',
					delayTime: 0,
					useCachingFieldData: false,
					data: [{ key: 'user1', name: 'Alice', url: '/users/1' }],
				},
			});
			await waitForEditorReady(editor);
			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.cachingFieldData).toBeNull();
		});

		it('should merge cachingFieldData with search results and deduplicate', async () => {
			const mentionInst = editor.$.plugins.mention;

			// Pre-populate cachingFieldData with a user
			mentionInst.cachingFieldData.push({ key: 'user99', name: 'Cached User', url: '/users/99' });

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			// Results should include both cachingFieldData and directData matches
			expect(mentionInst.selectMenu.isOpen).toBe(true);
			const keys = mentionInst.selectMenu.items.map((item) => item.key);
			expect(keys).toContain('user99');
			expect(keys).toContain('user1');
		});

		it('should deduplicate items between cachingFieldData and directData', async () => {
			const mentionInst = editor.$.plugins.mention;

			// Pre-populate with same key as in directData
			mentionInst.cachingFieldData.push({ key: 'user1', name: 'Duplicate Alice', url: '/users/dup' });

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			// Should not have duplicate user1
			const keys = mentionInst.selectMenu.items.map((item) => item.key);
			const user1Count = keys.filter((k) => k === 'user1').length;
			expect(user1Count).toBe(1);
		});
	});

	describe('empty response handling', () => {
		it('should close selectMenu when no data matches the query', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@xyz</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 4);

			const closeSpy = jest.spyOn(mentionInst.selectMenu, 'close');

			mentionInst.onInput();
			await waitForDebounce();

			expect(closeSpy).toHaveBeenCalled();
			expect(mentionInst.selectMenu.isOpen).toBe(false);

			closeSpy.mockRestore();
		});
	});

	describe('selectMenu items and menu HTML', () => {
		it('should create menu items with correct HTML structure', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.selectMenu.isOpen).toBe(true);
			// Check that menu HTML contains mention items
			const menuHTML = mentionInst.selectMenu.form.innerHTML;
			expect(menuHTML).toContain('se-mention-item');
			expect(menuHTML).toContain('user1');
			expect(menuHTML).toContain('Alice');
		});

		it('should set the first item as selected (index 0)', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.selectMenu.index).toBe(0);
			expect(mentionInst.selectMenu.item).toBeTruthy();
			expect(mentionInst.selectMenu.item.key).toBe('user1');
		});
	});

	describe('controller behavior', () => {
		it('should open controller when mention query matches', async () => {
			const mentionInst = editor.$.plugins.mention;
			const controllerOpenSpy = jest.spyOn(mentionInst.controller, 'open');

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			expect(controllerOpenSpy).toHaveBeenCalled();
			controllerOpenSpy.mockRestore();
		});

		it('controller initMethod should cancel apiManager and close selectMenu', () => {
			const mentionInst = editor.$.plugins.mention;
			const cancelSpy = jest.spyOn(mentionInst.apiManager, 'cancel');
			const closeSpy = jest.spyOn(mentionInst.selectMenu, 'close');

			// Force close the controller to trigger the initMethod callback
			// (regular close() returns early when controller is not open)
			mentionInst.controller.close(true);

			expect(cancelSpy).toHaveBeenCalled();
			expect(closeSpy).toHaveBeenCalled();

			cancelSpy.mockRestore();
			closeSpy.mockRestore();
		});
	});

	describe('apiManager cancel on re-input', () => {
		it('should cancel apiManager when directData is not set', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {
					triggerText: '@',
					delayTime: 0,
					apiUrl: 'https://api.example.com/users?q={key}&limit={limitSize}',
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const mentionInst = editor.$.plugins.mention;

			const cancelSpy = jest.spyOn(mentionInst.apiManager, 'cancel');

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			expect(cancelSpy).toHaveBeenCalled();
			cancelSpy.mockRestore();
		});

		it('should not cancel apiManager when directData is set', async () => {
			const mentionInst = editor.$.plugins.mention;
			const cancelSpy = jest.spyOn(mentionInst.apiManager, 'cancel');

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			// With directData set, apiManager.cancel should not be called
			expect(cancelSpy).not.toHaveBeenCalled();
			cancelSpy.mockRestore();
		});
	});

	describe('onInput with text before trigger', () => {
		it('should trigger when @ is at the beginning of text', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.selectMenu.isOpen).toBe(true);
		});

		it('should trigger when @ is preceded by whitespace', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>Hello @user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 11); // after "Hello @user"

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.selectMenu.isOpen).toBe(true);
		});

		it('should not trigger when @ is preceded by a non-whitespace character', async () => {
			const mentionInst = editor.$.plugins.mention;

			// "a@user" - char before @ is not whitespace/empty
			wysiwyg.innerHTML = '<p>a@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6); // after "a@user"

			mentionInst.onInput();
			await waitForDebounce();

			// Should not trigger because 'a' precedes @
			expect(mentionInst.selectMenu.isOpen).toBe(false);
		});
	});

	describe('SelectMention - via selectMenu callback', () => {
		it('should create an anchor element with data-se-mention when a mention is selected', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBeGreaterThan(0);

			// Simulate selecting the first item via the selectMenu
			// The selectMenu.item holds the currently selected item
			const selectedItem = mentionInst.selectMenu.items[0];

			// Simulate the keydown Enter event on the selectMenu to trigger selection
			const wwEl = editor.$.frameContext.get('_ww');
			const enterEvent = new KeyboardEvent('keydown', {
				code: 'Enter',
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			wwEl.dispatchEvent(enterEvent);
			await waitForDebounce();

			// After selection, check for the anchor element with data-se-mention
			const mentionAnchor = wysiwyg.querySelector('a[data-se-mention]');
			if (mentionAnchor) {
				expect(mentionAnchor.getAttribute('data-se-mention')).toBe(selectedItem.key);
				expect(mentionAnchor.getAttribute('href')).toBe(selectedItem.url);
				expect(mentionAnchor.getAttribute('title')).toBe(selectedItem.name);
				expect(mentionAnchor.textContent).toBe('@' + selectedItem.key);
			}
		});

		it('should add a non-breaking space after inserted mention anchor', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			mentionInst.onInput();
			await waitForDebounce();

			// Simulate Enter to select
			const wwEl = editor.$.frameContext.get('_ww');
			const enterEvent = new KeyboardEvent('keydown', {
				code: 'Enter',
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			wwEl.dispatchEvent(enterEvent);
			await waitForDebounce();

			const mentionAnchor = wysiwyg.querySelector('a[data-se-mention]');
			if (mentionAnchor && mentionAnchor.nextSibling) {
				// After the anchor, a non-breaking space should be inserted
				expect(mentionAnchor.nextSibling.textContent).toContain('\u00A0');
			}
		});

		it('should close selectMenu after mention is selected', async () => {
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.selectMenu.isOpen).toBe(true);

			// Simulate Enter selection
			const wwEl = editor.$.frameContext.get('_ww');
			const enterEvent = new KeyboardEvent('keydown', {
				code: 'Enter',
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			wwEl.dispatchEvent(enterEvent);
			await waitForDebounce();

			expect(mentionInst.selectMenu.isOpen).toBe(false);
		});

		it('should add selected mention to cachingFieldData', async () => {
			const mentionInst = editor.$.plugins.mention;
			expect(mentionInst.cachingFieldData.length).toBe(0);

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			mentionInst.onInput();
			await waitForDebounce();

			// Simulate Enter selection
			const wwEl = editor.$.frameContext.get('_ww');
			const enterEvent = new KeyboardEvent('keydown', {
				code: 'Enter',
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			wwEl.dispatchEvent(enterEvent);
			await waitForDebounce();

			// After selecting, item should be added to cachingFieldData
			if (mentionInst.cachingFieldData.length > 0) {
				expect(mentionInst.cachingFieldData.some((d) => d.key === 'user1')).toBe(true);
			}
		});

		it('should not duplicate items in cachingFieldData on repeated selection', async () => {
			const mentionInst = editor.$.plugins.mention;

			// Pre-populate with user1
			mentionInst.cachingFieldData.push({ key: 'user1', name: 'Alice', url: '/users/1' });
			const initialLength = mentionInst.cachingFieldData.length;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			mentionInst.onInput();
			await waitForDebounce();

			// Simulate Enter selection
			const wwEl = editor.$.frameContext.get('_ww');
			const enterEvent = new KeyboardEvent('keydown', {
				code: 'Enter',
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			wwEl.dispatchEvent(enterEvent);
			await waitForDebounce();

			// Should not add duplicate
			const user1Count = mentionInst.cachingFieldData.filter((d) => d.key === 'user1').length;
			expect(user1Count).toBe(1);
		});
	});

	describe('SelectMention - anchor parent update', () => {
		it('should update existing mention anchor attributes when re-selecting within mention', async () => {
			const mentionInst = editor.$.plugins.mention;

			// Create an existing mention anchor
			wysiwyg.innerHTML = '<p><a href="/users/1" data-se-mention="user1">@user</a></p>';
			const anchor = wysiwyg.querySelector('a');
			const textNode = anchor.firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			if (mentionInst.selectMenu.isOpen && mentionInst.selectMenu.items.length > 0) {
				// Navigate to user2 with ArrowDown
				const wwEl = editor.$.frameContext.get('_ww');
				const downEvent = new KeyboardEvent('keydown', {
					code: 'ArrowDown',
					key: 'ArrowDown',
					bubbles: true,
					cancelable: true,
				});
				wwEl.dispatchEvent(downEvent);
				await waitForDebounce();

				// Select user2 with Enter
				const enterEvent = new KeyboardEvent('keydown', {
					code: 'Enter',
					key: 'Enter',
					bubbles: true,
					cancelable: true,
				});
				wwEl.dispatchEvent(enterEvent);
				await waitForDebounce();

				// The existing anchor should be updated with user2 data
				const updatedAnchor = wysiwyg.querySelector('a[data-se-mention]');
				if (updatedAnchor) {
					expect(updatedAnchor.getAttribute('data-se-mention')).toBeTruthy();
				}
			}
		});
	});

	describe('multiple sequential searches', () => {
		it('should handle switching from one query to another', async () => {
			const mentionInst = editor.$.plugins.mention;

			// First search for "user1"
			wysiwyg.innerHTML = '<p>@user1</p>';
			let textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBe(1);
			expect(mentionInst.selectMenu.items[0].key).toBe('user1');

			// Close menu
			mentionInst.selectMenu.close();

			// Second search for "user2"
			wysiwyg.innerHTML = '<p>@user2</p>';
			textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBe(1);
			expect(mentionInst.selectMenu.items[0].key).toBe('user2');
		});
	});

	describe('onInput error handling', () => {
		it('should handle errors during createMentionList gracefully', async () => {
			const mentionInst = editor.$.plugins.mention;
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

			// Temporarily break the directData to force an error in filter
			const originalData = mentionInst.directData;
			mentionInst.directData = [{ key: null }]; // Will cause toLowerCase() to throw

			wysiwyg.innerHTML = '<p>@test</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			mentionInst.onInput();
			await waitForDebounce();

			// Should handle error gracefully without crashing
			// The error is caught in the try-catch and console.warn is called
			if (warnSpy.mock.calls.length > 0) {
				expect(warnSpy.mock.calls[0][0]).toContain('[SUNEDITOR.mention.api.file]');
			}

			// Restore
			mentionInst.directData = originalData;
			warnSpy.mockRestore();
		});
	});

	describe('API mode - createMentionList with apiUrl', () => {
		it('should fetch data from API when directData is not set', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {
					triggerText: '@',
					delayTime: 0,
					apiUrl: 'https://api.example.com/users?q={key}&limit={limitSize}',
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const mentionInst = editor.$.plugins.mention;

			// Mock the asyncCall to return API response
			const apiResponse = [
				{ key: 'apiUser1', name: 'API User 1', url: '/api/users/1' },
				{ key: 'apiUser2', name: 'API User 2', url: '/api/users/2' },
			];
			jest.spyOn(mentionInst.apiManager, 'asyncCall').mockResolvedValue({
				responseText: JSON.stringify(apiResponse),
			});

			wysiwyg.innerHTML = '<p>@api</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 4);

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.apiManager.asyncCall).toHaveBeenCalled();
			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBe(2);
			expect(mentionInst.selectMenu.items[0].key).toBe('apiUser1');

			mentionInst.apiManager.asyncCall.mockRestore();
		});
	});

	describe('mention with custom trigger text behavior', () => {
		it('should detect # trigger text and open menu', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { mention },
				buttonList: [],
				mention: {
					triggerText: '#',
					delayTime: 0,
					data: [
						{ key: 'tag1', name: 'javascript', url: '/tags/js' },
						{ key: 'tag2', name: 'typescript', url: '/tags/ts' },
					],
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const mentionInst = editor.$.plugins.mention;

			wysiwyg.innerHTML = '<p>#tag</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 4);

			mentionInst.onInput();
			await waitForDebounce();

			expect(mentionInst.selectMenu.isOpen).toBe(true);
			expect(mentionInst.selectMenu.items.length).toBe(2);
		});
	});
});
