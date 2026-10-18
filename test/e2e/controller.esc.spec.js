/**
 * @fileoverview Controller standard — Esc levels, input guard, close-all.
 *
 * - A child controller closes on Esc by itself (one level per press); the selection stays.
 * - An open select menu is a level too: Esc closes the menu, its controller and the selection stay.
 * - A base selection-UI controller leaves Esc to the component, which deselects in one press.
 * - Keys typed inside a controller's input belong to that input, never to the selected component.
 * - `ui.closeAllControllers()` / `escape: 'all'` close every level and end the selection at once.
 */
const { test, expect } = require('@playwright/test');

const PNG =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAQ0lEQVR42u3PMQ0AAAgDILV/51nBzwcSSAN9kqp9XQICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvwFDwABWv0u7AAAAABJRU5ErkJggg==';

/** A table-mode table editor (controllers above the table, no dots) plus the image plugin. */
async function make(page) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate((png) => {
		const { table, image } = window.editor_root.$.plugins;
		const el = document.createElement('div');
		document.body.prepend(el);
		window.__escEditor = window.suneditor.create(el, {
			plugins: [table.constructor, image.constructor],
			buttonList: [['table', 'image']],
			table: { tableControllerPosition: 'table', cellControllerPosition: 'table' },
			height: 'auto',
		});
		window.__png = png;
	}, PNG);
	await page.waitForTimeout(600);
	await page.evaluate(() => {
		const row = (p) => `<tr>${Array.from({ length: 3 }, (_, i) => `<td><div>${p}${i}</div></td>`).join('')}</tr>`;
		window.__escEditor.$.html.set(
			`<p>before</p><table><tbody>${row('a')}${row('b')}</tbody></table><p>middle</p><p><img src="${window.__png}" style="width:64px;height:64px"></p><p>after</p>`,
		);
		window.__escEditor.$.frameContext.get('topArea').scrollIntoView({ block: 'start' });
	});
	await page.waitForTimeout(300);
}

const state = (page) =>
	page.evaluate(() => {
		const $ = window.__escEditor.$;
		const t = $.plugins.table;
		const open = (c) => c.isOpen && c.form.style.display === 'block';
		return {
			table: open(t.controller_table),
			cell: open(t.controller_cell),
			props: open(t.styleService.controller_props),
			selected: $.component.isSelected,
			tableInDoc: !!$.frameContext.get('wysiwyg').querySelector('table'),
			imageInDoc: !!$.frameContext.get('wysiwyg').querySelector('img'),
		};
	});

async function clickAt(page, selector) {
	const p = await page.evaluate((selector) => {
		const el = window.__escEditor.$.frameContext.get('wysiwyg').querySelector(selector);
		el.scrollIntoView({ block: 'center' });
		const b = el.getBoundingClientRect();
		return { x: Math.round((b.left + b.right) / 2), y: Math.round((b.top + b.bottom) / 2) };
	}, selector);
	await page.waitForTimeout(100);
	await page.mouse.click(p.x, p.y);
	await page.waitForTimeout(300);
}

async function openTableProps(page) {
	await clickAt(page, 'td');
	await page.waitForFunction(() => window.__escEditor.$.plugins.table.controller_table.isOpen, null, {
		timeout: 3000,
	});
	const s = await state(page);
	expect(s.table).toBe(true);
	expect(s.selected).toBe(true);
	const btn = await page.evaluate(() => {
		const b = window.__escEditor.$.plugins.table.controller_table.form
			.querySelector('[data-command="openTableProperties"]')
			.getBoundingClientRect();
		return { x: Math.round((b.left + b.right) / 2), y: Math.round((b.top + b.bottom) / 2) };
	});
	await page.mouse.click(btn.x, btn.y);
	await page.waitForTimeout(300);
	expect((await state(page)).props).toBe(true);
}

test('table mode: Esc closes the props popup only, a second Esc ends the table selection', async ({ page }) => {
	await make(page);
	await openTableProps(page);

	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);
	let s = await state(page);
	expect(s.props).toBe(false);
	expect(s.table).toBe(true);
	expect(s.selected).toBe(true);

	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);
	s = await state(page);
	expect(s.table).toBe(false);
	expect(s.cell).toBe(false);
	expect(s.selected).toBe(false);
	expect(s.tableInDoc).toBe(true);
});

test('Esc on a select menu inside the props popup closes the menu only', async ({ page }) => {
	await make(page);
	await openTableProps(page);

	const btn = await page.evaluate(() => {
		const b = window.__escEditor.$.plugins.table.styleService.controller_props.form
			.querySelector('[data-command="props_onborder_style"]')
			.getBoundingClientRect();
		return { x: Math.round((b.left + b.right) / 2), y: Math.round((b.top + b.bottom) / 2) };
	});
	await page.mouse.click(btn.x, btn.y);
	await page.waitForTimeout(300);
	const menuOpen = () =>
		page.evaluate(() => window.__escEditor.$.plugins.table.styleService.selectMenu_props_border.isOpen);
	expect(await menuOpen()).toBe(true);

	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);
	expect(await menuOpen()).toBe(false);
	let s = await state(page);
	expect(s.props).toBe(true);
	expect(s.table).toBe(true);
	expect(s.selected).toBe(true);

	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);
	s = await state(page);
	expect(s.props).toBe(false);
	expect(s.table).toBe(true);
	expect(s.selected).toBe(true);
});

test('Backspace and Delete inside a props input edit the input, not the selected table', async ({ page }) => {
	await make(page);
	await openTableProps(page);

	const input = await page.evaluate(() => {
		const el =
			window.__escEditor.$.plugins.table.styleService.controller_props.form.querySelector('.__se_font_color');
		const b = el.getBoundingClientRect();
		return { x: Math.round((b.left + b.right) / 2), y: Math.round((b.top + b.bottom) / 2) };
	});
	await page.mouse.click(input.x, input.y);
	await page.keyboard.press('ControlOrMeta+a');
	await page.keyboard.press('Backspace');
	await page.keyboard.type('abc');
	await page.keyboard.press('Backspace');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('Delete');
	await page.waitForTimeout(200);

	const value = await page.evaluate(
		() =>
			window.__escEditor.$.plugins.table.styleService.controller_props.form.querySelector('.__se_font_color')
				.value,
	);
	expect(value).toBe('a');
	const s = await state(page);
	expect(s.tableInDoc).toBe(true);
	expect(s.props).toBe(true);
	expect(s.selected).toBe(true);
});

test('image: one Esc ends the selection together with its controller', async ({ page }) => {
	await make(page);
	await clickAt(page, 'img');
	const before = await page.evaluate(() => ({
		selected: window.__escEditor.$.component.isSelected,
		ctrl: window.__escEditor.$.ui.opendControllers.some((c) => !c.notInCarrier),
	}));
	expect(before).toEqual({ selected: true, ctrl: true });

	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);
	const after = await page.evaluate(() => ({
		selected: window.__escEditor.$.component.isSelected,
		ctrl: window.__escEditor.$.ui.opendControllers.some((c) => !c.notInCarrier),
	}));
	expect(after).toEqual({ selected: false, ctrl: false });
	expect((await state(page)).imageInDoc).toBe(true);
});

test('ui.closeAllControllers closes every level and ends the selection at once', async ({ page }) => {
	await make(page);
	await openTableProps(page);

	await page.evaluate(() => window.__escEditor.$.ui.closeAllControllers());
	await page.waitForTimeout(300);
	const s = await state(page);
	expect(s).toEqual(expect.objectContaining({ props: false, table: false, cell: false, selected: false }));
	expect(await page.evaluate(() => window.__escEditor.$.ui.opendControllers.length)).toBe(0);
});

test("a controller with escape: 'all' closes everything on one Esc", async ({ page }) => {
	await make(page);
	await openTableProps(page);
	await page.evaluate(() => {
		window.__escEditor.$.plugins.table.styleService.controller_props.escape = 'all';
	});

	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);
	const s = await state(page);
	expect(s).toEqual(expect.objectContaining({ props: false, table: false, cell: false, selected: false }));
});
