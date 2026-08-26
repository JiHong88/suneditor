const { test, expect } = require('@playwright/test');

/**
 * Opening a dropdown-free flyout (table, fontColor, ...) must leave the document untouched — exactly
 * like opening a native submenu does.
 *
 * It used to delete the typed `/query` at *open* time, because a flyout commits through the plugin's
 * own DOM rather than through `SelectMenu`'s select callback, so the pre-dispatch was pulled forward to
 * the only moment that was easy to reach. Two things fell out of that: a navigation key (the horizontal
 * arrow) silently mutated the document, and the controller's anchor text node was left detached — its
 * range reported zero client rects, so the next scroll repositioned the menu off a fallback that runs in
 * a different coordinate space and threw it to the top of the page.
 *
 * The trigger now comes out in `CommandMenu`'s `prepareCommit`, fired on the capture-phase gesture that
 * precedes the plugin's own `click` handler.
 */

const state = (page) =>
	page.evaluate(() => {
		const controller = window.editor_root.$.plugins.slashCommand.controller;
		const anchor = controller.currentPositionTarget;
		const range = window.editor_root.$.selection.getRange();
		return {
			text: window.editor_root.$.frameContext.get('wysiwyg').textContent,
			visible: !!document.querySelector('.se-slash-command-menu')?.offsetParent,
			subOpen: !!document.querySelector('.se-slash-command-menu .se-submenu-open'),
			anchorConnected: anchor && anchor.nodeType === 3 ? anchor.isConnected : null,
			rects: range ? range.getClientRects().length : 0,
		};
	});

async function openSlashMenu(page, query) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate(() => window.editor_root.$.html.set('<p><br></p>'));
	await page.waitForTimeout(200);
	await page.locator('.se-wrapper-wysiwyg').click();
	await page.waitForTimeout(100);
	await page.keyboard.type(query);
	await page.waitForTimeout(400);
}

for (const key of ['ArrowRight', 'Enter']) {
	test(`${key} opens the flyout without touching the document`, async ({ page }) => {
		await openSlashMenu(page, '/table');
		await page.keyboard.press(key);
		await page.waitForTimeout(400);

		const s = await state(page);
		expect(s.subOpen).toBe(true);
		expect(s.text).toBe('/table'); // the query survives — opening is navigation
		// the anchor stays live, so a scroll cannot fall back to the zero-rect path and jump
		expect(s.anchorConnected).toBe(true);
		expect(s.rects).toBeGreaterThan(0);
	});
}

test('opening then closing the flyout leaves the query intact', async ({ page }) => {
	await openSlashMenu(page, '/table');
	await page.keyboard.press('ArrowRight');
	await page.waitForTimeout(300);
	await page.keyboard.press('ArrowLeft');
	await page.waitForTimeout(300);

	const s = await state(page);
	expect(s.subOpen).toBe(false);
	expect(s.text).toBe('/table');
	expect(s.visible).toBe(true);
});

test('picking inside the flyout commits: the query goes, the table lands', async ({ page }) => {
	await openSlashMenu(page, '/table');
	await page.keyboard.press('ArrowRight');
	await page.waitForTimeout(400);

	const picker = page.locator('.se-slash-command-menu [class*="table-picker"]').first();
	const box = await picker.boundingBox();
	expect(box).not.toBeNull();
	await page.mouse.move(box.x + 40, box.y + 40);
	await page.waitForTimeout(120);
	await page.mouse.click(box.x + 40, box.y + 40);
	await page.waitForTimeout(600);

	const after = await page.evaluate(() => ({
		html: window.editor_root.$.frameContext.get('wysiwyg').innerHTML,
		text: window.editor_root.$.frameContext.get('wysiwyg').textContent,
		visible: !!document.querySelector('.se-slash-command-menu')?.offsetParent,
	}));
	expect(after.html).toContain('<table>');
	expect(after.text).not.toContain('/table'); // prepareCommit ran before the plugin acted
	expect(after.visible).toBe(false);
});

test('a plain plugin still drops the trigger on Enter', async ({ page }) => {
	await openSlashMenu(page, '/quo');
	await page.keyboard.press('Enter');
	await page.waitForTimeout(500);

	const html = await page.evaluate(() => window.editor_root.$.frameContext.get('wysiwyg').innerHTML);
	expect(html).toContain('<blockquote>');
	expect(html).not.toContain('/quo');
});
