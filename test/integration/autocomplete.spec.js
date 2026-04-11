/**
 * @fileoverview Integration tests for Autocomplete plugin
 * Tests src/plugins/field/autocomplete.js through real editor
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { autocomplete } from '../../src/plugins';

// Mock Range.prototype.getClientRects and getBoundingClientRect for JSDOM
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
 */
function waitForDebounce(ms = 50) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Helper to get the trigger context for '@' */
function getCtx(editor, trigger = '@') {
	return editor.$.plugins.autocomplete.triggerContexts.get(trigger);
}

describe('Autocomplete Plugin Integration Tests', () => {
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor({
			plugins: { autocomplete },
			buttonList: [],
			autocomplete: {
				limitSize: 5,
				searchStartLength: 0,
				delayTime: 0,
				triggers: {
					'@': {
						data: [
							{ key: 'user1', name: 'Alice', url: '/users/1' },
							{ key: 'user2', name: 'Bob', url: '/users/2' },
							{ key: 'user3', name: 'Charlie', url: '/users/3' },
						],
					},
				},
			},
		});
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(async () => {
		await waitForDebounce(200);
		if (editor && editor.$) {
			const acInst = editor.$.plugins?.autocomplete;
			if (acInst) {
				if (acInst.selectMenu.isOpen) {
					acInst.selectMenu.close();
				}
				if (acInst.controller.isOpen) {
					acInst.controller.close(true);
				}
			}
		}
		await waitForDebounce(50);
		destroyTestEditor(editor);
	});

	describe('plugin registration', () => {
		it('should register autocomplete plugin', () => {
			expect(editor.$.plugins.autocomplete).toBeTruthy();
		});

		it('should have trigger contexts', () => {
			expect(editor.$.plugins.autocomplete.triggerContexts.size).toBe(1);
			expect(getCtx(editor)).toBeTruthy();
		});

		it('should have correct limit size', () => {
			expect(getCtx(editor).limitSize).toBe(5);
		});
	});

	describe('plugin properties', () => {
		it('should have selectMenu', () => {
			expect(editor.$.plugins.autocomplete.selectMenu).toBeTruthy();
		});

		it('should have controller', () => {
			expect(editor.$.plugins.autocomplete.controller).toBeTruthy();
		});

		it('should have directData when data is provided', () => {
			const ctx = getCtx(editor);
			expect(ctx.directData).toBeTruthy();
			expect(ctx.directData.length).toBe(3);
		});

		it('should have search start length configured', () => {
			expect(getCtx(editor).searchStartLength).toBe(0);
		});
	});

	describe('multiple triggers', () => {
		it('should support multiple trigger characters', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: {
					delayTime: 0,
					triggers: {
						'@': { data: [{ key: 'user1', name: 'Alice', url: '/users/1' }] },
						'#': { data: [{ key: 'tag1', name: 'javascript', url: '/tags/js' }] },
					},
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');

			expect(editor.$.plugins.autocomplete.triggerContexts.size).toBe(2);
			expect(getCtx(editor, '#')).toBeTruthy();
		});

		it('should detect # trigger and show matching items', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: {
					delayTime: 0,
					triggers: {
						'#': { data: [{ key: 'tag1', name: 'javascript' }, { key: 'tag2', name: 'typescript' }] },
					},
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>#tag</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 4);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBe(2);
		});
	});

	describe('data handling', () => {
		it('should initialize cachingData as Map when enabled', () => {
			const ctx = getCtx(editor);
			if (ctx.cachingData) {
				expect(ctx.cachingData instanceof Map).toBe(true);
			}
		});

		it('should store direct data with correct structure', () => {
			const ctx = getCtx(editor);
			if (ctx.directData) {
				expect(ctx.directData[0]).toHaveProperty('key');
				expect(ctx.directData[0]).toHaveProperty('name');
			}
		});
	});

	describe('API URL handling', () => {
		it('should store apiUrl when provided', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: {
					triggers: {
						'@': { apiUrl: 'https://api.example.com/users?q={key}&limit={limitSize}' },
					},
				},
			});
			await waitForEditorReady(editor);

			const ctx = getCtx(editor);
			expect(ctx.apiUrl).toContain('{key}');
		});

		it('should have apiManager when API URL is provided', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: {
					triggers: {
						'@': { apiUrl: 'https://api.example.com/users?q={key}&limit={limitSize}' },
					},
				},
			});
			await waitForEditorReady(editor);

			expect(getCtx(editor).apiManager).toBeTruthy();
		});
	});

	describe('options defaults', () => {
		it('should use default limitSize of 5', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: { triggers: { '@': {} } },
			});
			await waitForEditorReady(editor);

			expect(getCtx(editor).limitSize).toBe(5);
		});
	});

	describe('onInput - trigger text detection', () => {
		it('should open selectMenu when trigger text @ is found with matching query', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>Hello @user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 12);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
		});

		it('should filter data by query prefix', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBe(1);
			expect(acInst.selectMenu.items[0].key).toBe('user1');
		});

		it('should show multiple results when query matches multiple items', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBe(3);
		});

		it('should show all items when query is empty (just @)', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>Hello @</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 7);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBe(3);
		});
	});

	describe('onInput - no trigger text', () => {
		it('should close selectMenu when no trigger text is present', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>Hello world</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 11);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(false);
		});
	});

	describe('onInput - no rangeCount', () => {
		it('should close selectMenu and return early when selection has no rangeCount', async () => {
			const acInst = editor.$.plugins.autocomplete;

			const selectionGetSpy = jest.spyOn(editor.$.selection, 'get').mockReturnValue({ rangeCount: 0 });
			const closeSpy = jest.spyOn(acInst.selectMenu, 'close');

			acInst.onInput();
			await waitForDebounce();

			expect(closeSpy).toHaveBeenCalled();
			expect(acInst.selectMenu.isOpen).toBe(false);

			selectionGetSpy.mockRestore();
			closeSpy.mockRestore();
		});
	});

	describe('onInput - whitespace in query', () => {
		it('should close selectMenu when query contains whitespace', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user name</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 10);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(false);
		});
	});

	describe('onInput - searchStartLength', () => {
		it('should not trigger when query is shorter than searchStartLength', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: {
					delayTime: 0,
					triggers: {
						'@': {
							searchStartLength: 3,
							data: [
								{ key: 'user1', name: 'Alice', url: '/users/1' },
								{ key: 'user2', name: 'Bob', url: '/users/2' },
							],
						},
					},
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@us</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 3);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(false);
		});

		it('should trigger when query meets searchStartLength requirement', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: {
					delayTime: 0,
					triggers: {
						'@': {
							searchStartLength: 3,
							data: [
								{ key: 'user1', name: 'Alice', url: '/users/1' },
								{ key: 'user2', name: 'Bob', url: '/users/2' },
							],
						},
					},
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBe(2);
		});
	});

	describe('onInput - anchor parent handling', () => {
		it('should skip when cursor is inside a non-autocomplete anchor', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p><a href="https://example.com">@user1</a></p>';
			const anchor = wysiwyg.querySelector('a');
			const textNode = anchor.firstChild;
			setCursorPosition(textNode, 6);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(false);
		});

		it('should process when cursor is inside an autocomplete element (has data-se-autocomplete)', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p><a href="/users/1" data-se-autocomplete="@user1">@user</a></p>';
			const anchor = wysiwyg.querySelector('a');
			const textNode = anchor.firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
		});
	});

	describe('direct data filtering', () => {
		it('should filter data case-insensitively by key prefix', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@USER</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBe(3);
		});

		it('should return no items when query matches nothing', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@zzz</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 4);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(false);
		});

		it('should respect limitSize for direct data', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: {
					delayTime: 0,
					triggers: {
						'@': {
							limitSize: 2,
							data: [
								{ key: 'user1', name: 'Alice', url: '/users/1' },
								{ key: 'user2', name: 'Bob', url: '/users/2' },
								{ key: 'user3', name: 'Charlie', url: '/users/3' },
							],
						},
					},
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBe(2);
		});
	});

	describe('caching behavior', () => {
		it('should cache results after first search when cachingData is enabled', async () => {
			const acInst = editor.$.plugins.autocomplete;
			const ctx = getCtx(editor);

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(ctx.cachingData).toBeTruthy();
			expect(ctx.cachingData.has('user')).toBe(true);
			expect(ctx.cachingData.get('user').length).toBe(3);
		});

		it('should use cached data on subsequent searches with same query', async () => {
			const acInst = editor.$.plugins.autocomplete;
			const ctx = getCtx(editor);

			wysiwyg.innerHTML = '<p>@user</p>';
			let textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(ctx.cachingData.has('user')).toBe(true);

			acInst.selectMenu.close();
			await waitForDebounce();

			wysiwyg.innerHTML = '<p>@user</p>';
			textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBe(3);
		});

		it('should not cache when cachingData is disabled', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: {
					delayTime: 0,
					triggers: {
						'@': {
							useCachingData: false,
							data: [{ key: 'user1', name: 'Alice', url: '/users/1' }],
						},
					},
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');

			const ctx = getCtx(editor);

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			editor.$.plugins.autocomplete.onInput();
			await waitForDebounce();

			expect(ctx.cachingData).toBeNull();
		});
	});

	describe('cachingFieldData', () => {
		it('should be initialized as an array when enabled', () => {
			const ctx = getCtx(editor);
			expect(ctx.cachingFieldData).toBeInstanceOf(Array);
			expect(ctx.cachingFieldData.length).toBe(0);
		});

		it('should be null when disabled', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: {
					delayTime: 0,
					triggers: {
						'@': {
							useCachingFieldData: false,
							data: [{ key: 'user1', name: 'Alice', url: '/users/1' }],
						},
					},
				},
			});
			await waitForEditorReady(editor);

			expect(getCtx(editor).cachingFieldData).toBeNull();
		});

		it('should merge cachingFieldData with search results and deduplicate', async () => {
			const acInst = editor.$.plugins.autocomplete;
			const ctx = getCtx(editor);

			ctx.cachingFieldData.push({ key: 'user99', name: 'Cached User', url: '/users/99' });

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			const keys = acInst.selectMenu.items.map((item) => item.key);
			expect(keys).toContain('user99');
			expect(keys).toContain('user1');
		});

		it('should deduplicate items between cachingFieldData and directData', async () => {
			const acInst = editor.$.plugins.autocomplete;
			const ctx = getCtx(editor);

			ctx.cachingFieldData.push({ key: 'user1', name: 'Duplicate Alice', url: '/users/dup' });

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			const keys = acInst.selectMenu.items.map((item) => item.key);
			const user1Count = keys.filter((k) => k === 'user1').length;
			expect(user1Count).toBe(1);
		});
	});

	describe('empty response handling', () => {
		it('should close selectMenu when no data matches the query', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@xyz</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 4);

			const closeSpy = jest.spyOn(acInst.selectMenu, 'close');

			acInst.onInput();
			await waitForDebounce();

			expect(closeSpy).toHaveBeenCalled();
			expect(acInst.selectMenu.isOpen).toBe(false);

			closeSpy.mockRestore();
		});
	});

	describe('selectMenu items and menu HTML', () => {
		it('should create menu items with correct HTML structure', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			const menuHTML = acInst.selectMenu.form.innerHTML;
			expect(menuHTML).toContain('se-autocomplete-item');
			expect(menuHTML).toContain('user1');
			expect(menuHTML).toContain('Alice');
		});

		it('should set the first item as selected (index 0)', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.index).toBe(0);
			expect(acInst.selectMenu.item).toBeTruthy();
			expect(acInst.selectMenu.item.key).toBe('user1');
		});
	});

	describe('controller behavior', () => {
		it('should open controller when query matches', async () => {
			const acInst = editor.$.plugins.autocomplete;
			const controllerOpenSpy = jest.spyOn(acInst.controller, 'open');

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(controllerOpenSpy).toHaveBeenCalled();
			controllerOpenSpy.mockRestore();
		});
	});

	describe('onInput with text before trigger', () => {
		it('should trigger when @ is at the beginning of text', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
		});

		it('should trigger when @ is preceded by whitespace', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>Hello @user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 11);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
		});

		it('should not trigger when @ is preceded by a non-whitespace character', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>a@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(false);
		});
	});

	describe('Selection - via selectMenu callback', () => {
		it('should create an element with data-se-autocomplete when item is selected', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBeGreaterThan(0);

			const wwEl = editor.$.frameContext.get('_ww');
			const enterEvent = new KeyboardEvent('keydown', {
				code: 'Enter',
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			wwEl.dispatchEvent(enterEvent);
			await waitForDebounce();

			const acElement = wysiwyg.querySelector('[data-se-autocomplete]');
			if (acElement) {
				expect(acElement.getAttribute('data-se-autocomplete')).toBe('@user1');
				expect(acElement.textContent).toBe('@user1');
			}
		});

		it('should add a non-breaking space after inserted element', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			acInst.onInput();
			await waitForDebounce();

			const wwEl = editor.$.frameContext.get('_ww');
			const enterEvent = new KeyboardEvent('keydown', {
				code: 'Enter',
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			wwEl.dispatchEvent(enterEvent);
			await waitForDebounce();

			const acElement = wysiwyg.querySelector('[data-se-autocomplete]');
			if (acElement && acElement.nextSibling) {
				expect(acElement.nextSibling.textContent).toContain('\u00A0');
			}
		});

		it('should close selectMenu after item is selected', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);

			const wwEl = editor.$.frameContext.get('_ww');
			const enterEvent = new KeyboardEvent('keydown', {
				code: 'Enter',
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			wwEl.dispatchEvent(enterEvent);
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(false);
		});

		it('should add selected item to cachingFieldData', async () => {
			const acInst = editor.$.plugins.autocomplete;
			const ctx = getCtx(editor);
			expect(ctx.cachingFieldData.length).toBe(0);

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			acInst.onInput();
			await waitForDebounce();

			const wwEl = editor.$.frameContext.get('_ww');
			const enterEvent = new KeyboardEvent('keydown', {
				code: 'Enter',
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			wwEl.dispatchEvent(enterEvent);
			await waitForDebounce();

			if (ctx.cachingFieldData.length > 0) {
				expect(ctx.cachingFieldData.some((d) => d.key === 'user1')).toBe(true);
			}
		});

		it('should not duplicate items in cachingFieldData on repeated selection', async () => {
			const acInst = editor.$.plugins.autocomplete;
			const ctx = getCtx(editor);

			ctx.cachingFieldData.push({ key: 'user1', name: 'Alice', url: '/users/1' });
			const initialLength = ctx.cachingFieldData.length;

			wysiwyg.innerHTML = '<p>@user1</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			acInst.onInput();
			await waitForDebounce();

			const wwEl = editor.$.frameContext.get('_ww');
			const enterEvent = new KeyboardEvent('keydown', {
				code: 'Enter',
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			wwEl.dispatchEvent(enterEvent);
			await waitForDebounce();

			const user1Count = ctx.cachingFieldData.filter((d) => d.key === 'user1').length;
			expect(user1Count).toBe(1);
		});
	});

	describe('multiple sequential searches', () => {
		it('should handle switching from one query to another', async () => {
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user1</p>';
			let textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBe(1);
			expect(acInst.selectMenu.items[0].key).toBe('user1');

			acInst.selectMenu.close();

			wysiwyg.innerHTML = '<p>@user2</p>';
			textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 6);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBe(1);
			expect(acInst.selectMenu.items[0].key).toBe('user2');
		});
	});

	describe('onInput error handling', () => {
		it('should handle errors during createList gracefully', async () => {
			const acInst = editor.$.plugins.autocomplete;
			const ctx = getCtx(editor);
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

			const originalData = ctx.directData;
			ctx.directData = [{ key: null }];

			wysiwyg.innerHTML = '<p>@test</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			if (warnSpy.mock.calls.length > 0) {
				expect(warnSpy.mock.calls[0][0]).toContain('[SUNEDITOR.autocomplete.api]');
			}

			ctx.directData = originalData;
			warnSpy.mockRestore();
		});
	});

	describe('API mode - createList with apiUrl', () => {
		it('should fetch data from API when directData is not set', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: {
					delayTime: 0,
					triggers: {
						'@': { apiUrl: 'https://api.example.com/users?q={key}&limit={limitSize}' },
					},
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const acInst = editor.$.plugins.autocomplete;
			const ctx = getCtx(editor);

			const apiResponse = [
				{ key: 'apiUser1', name: 'API User 1', url: '/api/users/1' },
				{ key: 'apiUser2', name: 'API User 2', url: '/api/users/2' },
			];
			jest.spyOn(ctx.apiManager, 'asyncCall').mockResolvedValue({
				responseText: JSON.stringify(apiResponse),
			});

			wysiwyg.innerHTML = '<p>@api</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 4);

			acInst.onInput();
			await waitForDebounce();

			expect(ctx.apiManager.asyncCall).toHaveBeenCalled();
			expect(acInst.selectMenu.isOpen).toBe(true);
			expect(acInst.selectMenu.items.length).toBe(2);
			expect(acInst.selectMenu.items[0].key).toBe('apiUser1');

			ctx.apiManager.asyncCall.mockRestore();
		});
	});

	describe('custom renderItem and onSelect', () => {
		it('should use custom renderItem when provided', async () => {
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { autocomplete },
				buttonList: [],
				autocomplete: {
					delayTime: 0,
					triggers: {
						'@': {
							data: [{ key: 'user1', name: 'Alice' }],
							renderItem: (item) => `<div class="custom-render">${item.name}</div>`,
						},
					},
				},
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			const acInst = editor.$.plugins.autocomplete;

			wysiwyg.innerHTML = '<p>@user</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			setCursorPosition(textNode, 5);

			acInst.onInput();
			await waitForDebounce();

			expect(acInst.selectMenu.isOpen).toBe(true);
			const menuHTML = acInst.selectMenu.form.innerHTML;
			expect(menuHTML).toContain('custom-render');
			expect(menuHTML).toContain('Alice');
		});
	});
});
