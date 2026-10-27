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

			it('resolves a built-in custom item key that no plugin or command takes', () => {
				const menu = makeMenu(['h2', 'heading']);
				const [h2, heading] = menu.getItems();
				expect(h2).toEqual(expect.objectContaining({ kind: 'custom', name: 'h2', title: $.lang.tag_h + '2' }));
				expect(h2.search).toContain('h2');
				expect(heading.kind).toBe('submenu');
				expect(heading.children.map((c) => c.raw.key)).toEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
			});

			it('shows the paragraph and heading icons', () => {
				const [p, heading] = makeMenu(['p', 'heading']).getItems();
				expect(p.iconHTML).toBe($.icons.paragraph);
				expect(heading.iconHTML).toBe($.icons.heading);
				heading.children.forEach((c, i) => expect(c.iconHTML).toBe($.icons['heading_' + (i + 1)]));
				expect(heading.childMenus[2]).toContain('<svg');
			});

			it('keeps the canonical row for a built-in custom item when a custom renderer is given', () => {
				const renderCustomItem = jest.fn(() => '<b>custom</b>');
				const menu = new CommandMenu(null, $, {
					items: ['p', { title: 'Mine', action() {} }],
					resolveButton: ResolveButton,
					renderCustomItem,
					selectMenuParams: { position: 'bottom-left' },
				});
				const rows = menu.renderRows(menu.getItems());
				expect(rows[0]).toContain('se-cmd-row');
				expect(rows[1]).toBe('<b>custom</b>');
				expect(renderCustomItem).toHaveBeenCalledTimes(1);
			});

			it('drops unresolvable string entries', () => {
				const menu = makeMenu(['definitely-not-a-command', { title: 'Custom', action() {} }]);
				expect(menu.getItems()).toHaveLength(1);
			});

			it('resolves a custom item with children to a "submenu" of custom children', () => {
				const h1 = jest.fn();
				const menu = makeMenu([
					{
						title: 'Heading',
						children: [{ title: 'H1', icon: '<i>1</i>', action: h1 }, { title: 'No action' }],
					},
				]);
				const [item] = menu.getItems();
				expect(item.kind).toBe('submenu');
				expect(item.children).toHaveLength(1); // the child with no action is skipped
				expect(item.children[0].kind).toBe('custom');
				expect(item.childMenus[0]).toBe('<span class="se-block-submenu-item"><i>1</i><span>H1</span></span>');

				menu.dispatch(item.children[0], { block: null });
				expect(h1).toHaveBeenCalledWith($, { block: null });
			});

			it('drops a custom item whose children have no action', () => {
				const menu = makeMenu([{ title: 'Empty', children: [{ title: 'x' }] }]);
				expect(menu.getItems()).toHaveLength(0);
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
