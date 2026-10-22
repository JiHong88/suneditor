/**
 * @fileoverview A click selection right after a hover selection opens the component's controller.
 *
 * `hoverSelect` marks its own `select()` with `ON_OVER_COMPONENT`. The marker used to stay until a deferred
 * tick, so a click's `select()` in between (the mouse arriving and clicking at once — common on a busy page)
 * read as a second hover: the component stayed hover-selected and its controller never opened.
 */
const { test, expect } = require('@playwright/test');

const PNG =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAQ0lEQVR42u3PMQ0AAAgDILV/51nBzwcSSAN9kqp9XQICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvwFDwABWv0u7AAAAABJRU5ErkJggg==';

test('select() in the same tick as a hover selection upgrades it and opens the controller', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined && window.suneditor, { timeout: 15000 });
	await page.evaluate(async (png) => {
		const { table, image } = window.editor_root.$.plugins;
		window.editor_root.destroy();
		document.body.innerHTML = '<div id="e"></div>';
		window.__hEditor = window.suneditor.create('#e', {
			plugins: [table.constructor, image.constructor],
			buttonList: [['table', 'image']],
			table: { tableControllerPosition: 'table', cellControllerPosition: 'table' },
		});
		await new Promise((r) => setTimeout(r, 400));
		window.__hEditor.$.html.set(
			`<table><tbody><tr><td><div>a</div></td><td><div>b</div></td></tr></tbody></table><p><img src="${png}" style="width:64px;height:64px"></p>`,
		);
		await new Promise((r) => setTimeout(r, 200));
		// the editor already has focus, as when the pointer comes back to it
		const td = window.__hEditor.$.frameContext.get('wysiwyg').querySelector('td div');
		window.__hEditor.$.selection.setRange(td.firstChild, 0, td.firstChild, 0);
		window.__hEditor.$.frameContext.get('wysiwyg').focus();
		await new Promise((r) => setTimeout(r, 100));
	}, PNG);

	const r = await page.evaluate(async () => {
		const $ = window.__hEditor.$;
		const t = $.plugins.table;
		const table = $.frameContext.get('wysiwyg').querySelector('table');
		const td = table.querySelector('td');

		$.component.hoverSelect(table);
		const hovered = $.component.isHoverSelected && !t.controller_table.isOpen;

		// the cell click's select, before the hover's deferred tick
		t.setState('fixedCell', td);
		t.setState('selectedCell', td);
		t._setController(td);

		await new Promise((r) => setTimeout(r, 100)); // controllers open asynchronously
		return { hovered, tableOpen: t.controller_table.isOpen, cellOpen: t.controller_cell.isOpen };
	});

	expect(r.hovered).toBe(true);
	expect(r.tableOpen).toBe(true);
	expect(r.cellOpen).toBe(true);
	expect(await page.evaluate(() => window.__hEditor.$.component.isHoverSelected)).toBe(false);
});
