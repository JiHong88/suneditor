/**
 * @fileoverview Tests for the shared CommandMenu module (src/modules/ui/CommandMenu.js),
 * used by both the BlockHandle action menu and the SlashCommand plugin.
 *
 * CommandMenu needs a live deps bag (`$`), so a minimal real editor supplies it; the menu is
 * then driven directly. `'bold'` is a basic command, so it resolves and registers without any
 * plugin loaded.
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../../__mocks__/editorIntegration';
import CommandMenu, { buildRowHTML, resolveIconHTML } from '../../../src/modules/ui/CommandMenu.js';
import { ResolveButton } from '../../../src/core/section/constructor';
import { align } from '../../../src/plugins';

// JSDOM has no layout — stub the rects the menu reads while positioning.
const mockRect = { top: 100, left: 100, bottom: 120, right: 200, width: 100, height: 20, x: 100, y: 100 };
if (!Range.prototype.getClientRects) Range.prototype.getClientRects = () => [mockRect];
if (!Range.prototype.getBoundingClientRect) Range.prototype.getBoundingClientRect = () => mockRect;

describe('CommandMenu', () => {
	describe('pure helpers', () => {
		it('resolveIconHTML returns raw HTML, icon-map lookups, or empty', () => {
			expect(resolveIconHTML('<svg>x</svg>', {})).toBe('<svg>x</svg>');
			expect(resolveIconHTML('bold', { bold: '<b></b>' })).toBe('<b></b>');
			expect(resolveIconHTML('missing', {})).toBe('');
			expect(resolveIconHTML('', {})).toBe('');
			expect(resolveIconHTML(undefined, {})).toBe('');
		});

		it('buildRowHTML renders icon + label, or a label-only row', () => {
			const withIcon = buildRowHTML('Heading', '<i>H</i>');
			expect(withIcon).toContain('button');
			expect(withIcon).toContain('se-cmd-row');
			expect(withIcon).toContain('se-block-menu-icon');
			expect(withIcon).toContain('Heading');

			const noIcon = buildRowHTML('Heading', '');
			expect(noIcon).toContain('se-block-menu-label-full');
			expect(noIcon).not.toContain('se-block-menu-icon');
		});
	});

	describe('with a live editor', () => {
		let editor;
		let $;
		let refer;

		beforeEach(async () => {
			editor = createTestEditor({ buttonList: [] });
			await waitForEditorReady(editor);
			$ = editor.$;
			refer = document.createElement('div');
			document.body.appendChild(refer);
		});

		afterEach(() => {
			refer.remove();
			destroyTestEditor(editor);
		});

		function makeMenu(items) {
			const menu = new CommandMenu(null, $, {
				items,
				resolveButton: ResolveButton,
				selectMenuParams: { position: 'bottom-left' },
			});
			menu.attach(refer, jest.fn());
			return menu;
		}

		const CUSTOM = () => [
			{ key: 'h1', title: 'Heading 1', keywords: ['header'], action: jest.fn() },
			{ key: 'quote', title: 'Quote', action: jest.fn() },
		];

		describe('getItems — kind resolution', () => {
			it('resolves custom objects to the "custom" kind with a searchable haystack', () => {
				const menu = makeMenu(CUSTOM());
				const items = menu.getItems();
				expect(items).toHaveLength(2);
				expect(items[0].kind).toBe('custom');
				expect(items[0].title).toBe('Heading 1');
				expect(items[0].search).toContain('heading 1');
				expect(items[0].search).toContain('header'); // keyword folded into the search text
			});

			it('resolves a basic-command string to the "plugin" kind', () => {
				const menu = makeMenu(['bold']);
				const items = menu.getItems();
				expect(items).toHaveLength(1);
				expect(items[0].kind).toBe('plugin');
				expect(items[0].name).toBe('bold');
				expect(items[0].command).toBe('bold');
			});

			it('drops unresolvable string entries', () => {
				const menu = makeMenu(['definitely-not-a-command', { title: 'Custom', action() {} }]);
				expect(menu.getItems()).toHaveLength(1);
			});

			it('caches the resolved list until setItems invalidates it', () => {
				const menu = makeMenu(CUSTOM());
				const first = menu.getItems();
				expect(menu.getItems()).toBe(first);
				menu.setItems([{ title: 'New', action() {} }]);
				expect(menu.getItems()).not.toBe(first);
				expect(menu.getItems()).toHaveLength(1);
			});
		});

		describe('filter', () => {
			it('matches a substring of the title', () => {
				const menu = makeMenu(CUSTOM());
				const out = menu.filter('quote');
				expect(out).toHaveLength(1);
				expect(out[0].title).toBe('Quote');
			});

			it('matches keywords as well as the title', () => {
				const menu = makeMenu(CUSTOM());
				expect(menu.filter('header')).toHaveLength(1); // "Heading 1" via its keyword
			});

			it('returns every item for an empty query and respects the limit', () => {
				const menu = makeMenu(CUSTOM());
				expect(menu.filter('')).toHaveLength(2);
				expect(menu.filter('', 1)).toHaveLength(1);
			});
		});

		describe('target registration lifecycle', () => {
			it('registers command targets on open and removes them on close', () => {
				const cd = $.commandDispatcher;
				const menu = makeMenu(['bold']);
				menu.createRows(menu.getItems());

				expect(cd.targets.has('bold')).toBe(false);
				menu.open();
				expect(cd.targets.has('bold')).toBe(true);

				menu.close();
				expect(cd.targets.has('bold')).toBe(false);
			});

			it('unregisters targets when the underlying SelectMenu closes directly (ESC / outside click)', () => {
				// Regression: ESC and outside-click close the SelectMenu without routing through
				// CommandMenu.close(), so the unregister has to live in the wrapped closeMethod or
				// the toolbar target map leaks the menu's detached rows.
				const cd = $.commandDispatcher;
				const menu = makeMenu(['bold']);
				menu.createRows(menu.getItems());
				menu.open();
				expect(cd.targets.has('bold')).toBe(true);

				menu.selectMenu.close(); // bypasses CommandMenu.close()
				expect(cd.targets.has('bold')).toBe(false);
			});
		});

		describe('dispatch', () => {
			it('invokes a custom item action with the deps bag and host context', () => {
				const menu = makeMenu(CUSTOM());
				const [custom] = menu.getItems();
				const ctx = { block: 'x' };
				menu.dispatch(custom, ctx);
				expect(custom.raw.action).toHaveBeenCalledWith($, ctx);
			});

			it('routes a built-in command through commandDispatcher.run', () => {
				const runSpy = jest.spyOn($.commandDispatcher, 'run').mockImplementation(() => {});
				const menu = makeMenu(['bold']);
				const [boldItem] = menu.getItems();
				menu.dispatch(boldItem);
				expect(runSpy).toHaveBeenCalledWith('bold', null, null);
				runSpy.mockRestore();
			});

			it('dispatches a submenu child through its owning plugin and pushes one history entry', () => {
				const menu = makeMenu(CUSTOM());
				const pushSpy = jest.spyOn($.history, 'push').mockImplementation(() => {});
				const result = menu.dispatch({ pluginName: 'bold', element: document.createElement('button') });
				expect(result).toBe(true);
				expect(pushSpy).toHaveBeenCalledWith(false);
				pushSpy.mockRestore();
			});

			it('ignores a null item', () => {
				const menu = makeMenu(CUSTOM());
				expect(menu.dispatch(null)).toBe(false);
			});
		});
	});

	describe('dropdown plugin resolution', () => {
		let editor;
		let refer;

		beforeEach(async () => {
			editor = createTestEditor({ plugins: { align }, buttonList: [['align']] });
			await waitForEditorReady(editor);
			refer = document.createElement('div');
			document.body.appendChild(refer);
		});

		afterEach(() => {
			refer.remove();
			destroyTestEditor(editor);
		});

		it('expands a dropdown plugin into an inline submenu with one child per option', () => {
			const menu = new CommandMenu(null, editor.$, {
				items: ['align'],
				resolveButton: ResolveButton,
				selectMenuParams: { position: 'bottom-left' },
			});
			menu.attach(refer, jest.fn());

			const items = menu.getItems();
			expect(items).toHaveLength(1);
			expect(items[0].kind).toBe('submenu');
			expect(items[0].name).toBe('align');
			expect(items[0].children.length).toBeGreaterThan(0);
		});
	});
});
