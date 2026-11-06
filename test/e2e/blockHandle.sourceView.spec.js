const { test, expect } = require('@playwright/test');

// The block handle gutter belongs to the wysiwyg frame: code view and markdown view hide it
// so the source frame takes the full wrapper width.

async function setup(page) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate(() => window.editor_root.$.html.set('<p>alpha</p><p>bravo</p>'));
	await page.waitForTimeout(200);
}

const gutter = (page) =>
	page.evaluate(() => {
		const fc = window.editor_root.$.frameContext;
		const area = fc.get('blockHandleArea');
		return {
			exists: !!area,
			display: area && getComputedStyle(area).display,
			width: area && area.getBoundingClientRect().width,
		};
	});

for (const mode of ['codeView', 'markdownView']) {
	test(`${mode} hides the block handle gutter and wysiwyg restores it`, async ({ page }) => {
		await setup(page);

		const before = await gutter(page);
		expect(before.exists).toBe(true);
		expect(before.display).not.toBe('none');
		expect(before.width).toBeGreaterThan(0);

		await page.evaluate((m) => window.editor_root.$.viewer[m](true), mode);
		expect((await gutter(page)).display).toBe('none');

		await page.evaluate((m) => window.editor_root.$.viewer[m](false), mode);
		expect((await gutter(page)).display).toBe(before.display);
	});
}
