/**
 * @fileoverview Controller close paths — what a close (or a skipped close) must leave behind.
 *
 * - Esc on a selected image hands the deselect to the component — the component's focus guard is cleared first,
 *   so the deselect still fires the blur and resets `_preventFocus`.
 * - A click on an `isInsideForm` child's parent closes the child (the color picker over the table props).
 * - Closing the table's handle menu keeps the line breakers of the still-selected table.
 * - Pinning a row right after a cell click keeps the table selected — the strip's mousedown disables the focused
 *   wysiwyg, and the blur that follows used to deselect it (no menu either).
 * - Hovering a code block does not open its hover controller over a selected table (dot mode), which used to
 *   strip the table's key handling and deselect it on mouse-out.
 */
const { test, expect } = require('@playwright/test');

const PNG =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAQ0lEQVR42u3PMQ0AAAgDILV/51nBzwcSSAN9kqp9XQICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvwFDwABWv0u7AAAAABJRU5ErkJggg==';

const row = (p, n = 3) => `<tr>${Array.from({ length: n }, (_, i) => `<td><div>${p}${i}</div></td>`).join('')}</tr>`;

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ html: string, table?: object, plugins: string[] }} o
 */
async function make(page, { html, table = {}, plugins }) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined && window.suneditor, { timeout: 15000 });
	await page.evaluate(
		async ({ html, table, plugins }) => {
			const all = window.editor_root.$.plugins;
			const ctors = plugins.map((k) => all[k].constructor);
			window.editor_root.destroy();
			document.body.innerHTML = '<div id="e"></div>';
			window.__blurs = 0;
			window.__cEditor = window.suneditor.create('#e', {
				plugins: ctors,
				buttonList: [plugins],
				table,
				events: { onBlur: () => window.__blurs++ },
			});
			await new Promise((r) => setTimeout(r, 400));
			window.__cEditor.$.html.set(html);
			await new Promise((r) => setTimeout(r, 300));
		},
		{ html, table, plugins },
	);
}

/** Center of the first element matched in the wysiwyg (or of `form` inside a controller when given). */
async function clickIn(page, src) {
	const p = await page.evaluate((src) => {
		const el = new Function('$', `return ${src}`)(window.__cEditor.$);
		const b = el.getBoundingClientRect();
		return { x: Math.round((b.left + b.right) / 2), y: Math.round((b.top + b.bottom) / 2) };
	}, src);
	await page.mouse.click(p.x, p.y);
	await page.waitForTimeout(300);
	return p;
}

test('Esc on a selected image deselects it with the blur — the focus guard does not stick', async ({ page }) => {
	await make(page, { html: `<p>a</p><p><img src="${PNG}" style="width:64px;height:64px"></p>`, plugins: ['image'] });
	await clickIn(page, `$.frameContext.get('wysiwyg').querySelector('img')`);
	expect(await page.evaluate(() => window.__cEditor.$.component.isSelected)).toBe(true);
	const blursBefore = await page.evaluate(() => window.__blurs);

	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);

	const r = await page.evaluate(() => ({
		selected: window.__cEditor.$.component.isSelected,
		preventFocus: window.__cEditor.$.store.get('_preventFocus'),
		blurs: window.__blurs,
	}));
	expect(r.selected).toBe(false);
	expect(r.preventFocus).toBe(false);
	expect(r.blurs).toBe(blursBefore + 1);
});

test('a click on the table props closes the color picker opened over them (isInsideForm)', async ({ page }) => {
	await make(page, {
		html: `<p>before</p><table><tbody>${row('a')}${row('b')}</tbody></table><p>after</p>`,
		table: { tableControllerPosition: 'table', cellControllerPosition: 'table' },
		plugins: ['table'],
	});
	await clickIn(page, `$.frameContext.get('wysiwyg').querySelector('td')`);
	await page.waitForFunction(() => window.__cEditor.$.plugins.table.controller_table.isOpen, null, { timeout: 3000 });
	await clickIn(page, `$.plugins.table.controller_table.form.querySelector('[data-command="openTableProperties"]')`);
	await clickIn(
		page,
		`$.plugins.table.styleService.controller_props.form.querySelector('[data-command="props_onpalette"][data-value="font"]')`,
	);
	const style = 'window.__cEditor.$.plugins.table.styleService';
	expect(await page.evaluate(`${style}.controller_colorPicker.isOpen`)).toBe(true);

	await clickIn(
		page,
		`$.plugins.table.styleService.controller_props.form.querySelector('[data-command="props_align"]')`,
	);

	expect(await page.evaluate(`${style}.controller_colorPicker.isOpen`)).toBe(false);
	expect(await page.evaluate(`${style}.controller_props.isOpen`)).toBe(true);
});

test('closing the handle menu keeps the selected table’s line breaker', async ({ page }) => {
	await make(page, {
		html: `<table><tbody>${row('a', 4)}${row('b', 4)}${row('c', 4)}</tbody></table><p>after</p>`,
		plugins: ['table'],
	});
	const g = await page.evaluate(() => {
		const b = window.__cEditor.$.frameContext
			.get('wysiwyg')
			.querySelectorAll('tr')[1]
			.cells[1].getBoundingClientRect();
		return { x: Math.round((b.left + b.right) / 2), y: Math.round((b.top + b.bottom) / 2) };
	});
	const breaker = () => page.evaluate(() => window.__cEditor.$.frameContext.get('lineBreaker_t').style.display);

	// hover the cell to show the strips, then pin the row and open its menu
	await page.mouse.move(g.x + 20, g.y + 5);
	await page.mouse.move(g.x, g.y, { steps: 4 });
	await page.waitForTimeout(300);
	const hLeft = await page.evaluate(
		() => document.querySelector('.se-table-move-handle-row').getBoundingClientRect().left,
	);
	await page.mouse.click(Math.round(hLeft + 10), g.y);
	await page.waitForTimeout(300);
	const menu = 'window.__cEditor.$.plugins.table.gridService.selectMenu_row_handle';
	expect(await page.evaluate(`${menu}.isOpen`)).toBe(true);
	expect(await page.evaluate(() => window.__cEditor.$.component.isSelected)).toBe(true);
	expect(await breaker()).toBe('block');

	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);

	expect(await page.evaluate(`${menu}.isOpen`)).toBe(false);
	expect(await page.evaluate(() => window.__cEditor.$.component.isSelected)).toBe(true);
	expect(await breaker()).toBe('block');
});

test('a cell click, then a row pin: the table stays selected and the menu opens', async ({ page }) => {
	await make(page, {
		html: `<p>x</p><table><tbody>${row('a', 4)}${row('b', 4)}${row('c', 4)}</tbody></table><p>after</p>`,
		plugins: ['table'],
	});
	const g = await clickIn(page, `$.frameContext.get('wysiwyg').querySelectorAll('tr')[1].cells[1]`);
	await page.mouse.move(g.x + 20, g.y + 5);
	await page.mouse.move(g.x, g.y, { steps: 4 });
	await page.waitForTimeout(300);
	const hLeft = await page.evaluate(
		() => document.querySelector('.se-table-move-handle-row').getBoundingClientRect().left,
	);
	await page.mouse.click(Math.round(hLeft + 10), g.y);
	await page.waitForTimeout(300);

	const r = await page.evaluate(() => ({
		menu: window.__cEditor.$.plugins.table.gridService.selectMenu_row_handle.isOpen,
		selected: window.__cEditor.$.component.isSelected,
	}));
	expect(r).toEqual({ menu: true, selected: true });
});

test('hovering a code block leaves a selected table (dot mode) selected', async ({ page }) => {
	await make(page, {
		html: `<p>before</p><table><tbody>${row('a')}${row('b')}</tbody></table><pre>code</pre><p>after</p>`,
		plugins: ['table', 'codeBlock'],
	});
	await clickIn(page, `$.frameContext.get('wysiwyg').querySelector('td')`);
	expect(await page.evaluate(() => window.__cEditor.$.component.isSelected)).toBe(true);

	const pre = await page.evaluate(() => {
		const b = window.__cEditor.$.frameContext.get('wysiwyg').querySelector('pre').getBoundingClientRect();
		return { x: Math.round((b.left + b.right) / 2), y: Math.round((b.top + b.bottom) / 2) };
	});
	await page.mouse.move(pre.x, pre.y, { steps: 4 });
	await page.waitForTimeout(300);
	await page.mouse.move(pre.x, pre.y + 200, { steps: 4 });
	await page.waitForTimeout(300);

	const r = await page.evaluate(() => ({
		selected: window.__cEditor.$.component.isSelected,
		target: window.__cEditor.$.component.currentTarget?.nodeName,
	}));
	expect(r).toEqual({ selected: true, target: 'TABLE' });
});
