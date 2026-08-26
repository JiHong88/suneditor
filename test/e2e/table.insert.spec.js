const { test, expect } = require('@playwright/test');

// The picker only learns its size from `mousemove`. A click can still arrive before the pointer ever
// moved over the grid — it opens under a resting cursor when the menu is opened from the keyboard —
// and that used to insert a table with no rows and no columns.
const TABLE_BTN = '.se-btn-tray button[data-command="table"]';

async function setup(page) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 20000 });
	await page.evaluate(() => window.editor_root.$.html.set('<p><br></p>'));
	await page.waitForTimeout(400);
}

const grid = (page) =>
	page.evaluate(() => {
		const t = document.querySelector('.se-wrapper-wysiwyg table');
		if (!t) return null;
		return { rows: t.querySelectorAll('tr').length, cols: t.querySelectorAll('tr:first-child td').length };
	});

test('clicking the picker with no size hovered inserts the default table, not an empty one', async ({ page }) => {
	await setup(page);

	// measure where the grid lands, then close
	await page.locator(TABLE_BTN).first().click();
	await page.waitForTimeout(400);
	const box = await page.evaluate(() => {
		const r = document.querySelector('.se-table-size-picker').getBoundingClientRect();
		return { x: r.left + r.width / 3, y: r.top + r.height / 3 };
	});
	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);

	// park the pointer where the grid will appear, then open without moving it
	await page.mouse.move(box.x, box.y);
	await page.evaluate((sel) => document.querySelector(sel).click(), TABLE_BTN);
	await page.waitForTimeout(400);
	await page.mouse.down();
	await page.mouse.up();
	await page.waitForTimeout(500);

	expect(await grid(page)).toEqual({ rows: 3, cols: 3 });
});

test('the size picker still inserts the hovered size', async ({ page }) => {
	await setup(page);

	await page.locator(TABLE_BTN).first().click();
	await page.waitForTimeout(400);

	// hover the 2nd column / 2nd row cell of the 10x10 grid, then click there
	const box = await page.evaluate(() => {
		const r = document.querySelector('.se-table-size-picker').getBoundingClientRect();
		return { x: r.left + r.width * 0.15, y: r.top + r.height * 0.15, w: r.width, h: r.height };
	});
	await page.mouse.move(box.x, box.y);
	await page.waitForTimeout(200);
	const picked = await page.evaluate(() => document.querySelector('.se-table-size-display')?.textContent.trim());
	await page.mouse.down();
	await page.mouse.up();
	await page.waitForTimeout(500);

	const g = await grid(page);
	expect(picked).toBe(`${g.cols} x ${g.rows}`); // what the picker showed is what got inserted
	expect(g.rows).toBeGreaterThan(0);
});

test('table.insert() builds a table without going through the picker', async ({ page }) => {
	await setup(page);
	await page.locator('.se-wrapper-wysiwyg p').first().click();

	expect(await page.evaluate(() => window.editor_root.$.plugins.table.insert(4, 2))).toBe(true);
	await page.waitForTimeout(400);
	expect(await grid(page)).toEqual({ rows: 2, cols: 4 });
});
