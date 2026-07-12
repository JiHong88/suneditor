const { test, expect } = require('@playwright/test');

// Normalize &nbsp; (contenteditable renders typed spaces as U+00A0) to a plain space.
const text = (page) =>
	page.evaluate(() => (document.querySelector('.se-wrapper-wysiwyg p')?.textContent ?? '').replace(/\u00A0/g, " "));

async function setup(page) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate(() => window.editor_root.$.html.set('<p><br></p>'));
	await page.waitForTimeout(150);
	await page.locator('.se-wrapper-wysiwyg').click();
	await page.waitForTimeout(100);
}

test.describe('slashCommand — ESC dismiss', () => {
	test('ESC removes the typed "/query" and restores a clean caret', async ({ page }) => {
		await setup(page);
		await page.keyboard.type('/quo');
		await page.waitForTimeout(200);
		expect(await text(page)).toBe('/quo');

		await page.keyboard.press('Escape');
		await page.waitForTimeout(200);
		expect(await text(page)).toBe(''); // trigger + query removed

		// caret is back in place → subsequent typing and space work normally (no stuck menu)
		await page.keyboard.type('hi');
		await page.keyboard.press('Space');
		await page.waitForTimeout(150);
		expect(await text(page)).toBe('hi ');
	});

	test('bare "/" + ESC removes the trigger; space types normally afterwards', async ({ page }) => {
		await setup(page);
		await page.keyboard.type('/');
		await page.waitForTimeout(200);
		await page.keyboard.press('Escape');
		await page.waitForTimeout(150);
		expect(await text(page)).toBe('');

		await page.keyboard.press('Space');
		await page.keyboard.press('Space');
		await page.waitForTimeout(150);
		expect(await text(page)).toBe('  ');
	});
});
