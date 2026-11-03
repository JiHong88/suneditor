const { test, expect } = require('@playwright/test');

// Esc dismisses a balloon toolbar (main or subToolbar) without touching the selection;
// the next selection change shows it again.

const MODES = [
	{ name: 'balloon', options: { mode: 'balloon' }, key: 'toolbar_main' },
	{ name: 'balloon-always', options: { mode: 'balloon-always' }, key: 'toolbar_main', always: true },
	{
		name: 'subToolbar balloon',
		options: { subToolbar: { buttonList: [['bold']], mode: 'balloon' } },
		key: 'toolbar_sub_main',
	},
	{
		name: 'subToolbar balloon-always',
		options: { subToolbar: { buttonList: [['bold']], mode: 'balloon-always' } },
		key: 'toolbar_sub_main',
		always: true,
	},
];

async function setup(page, options) {
	// larger than the fixture body (1600x2200): a window scroll re-anchors the balloon and can hide it on its own
	await page.setViewportSize({ width: 1700, height: 2300 });
	await page.goto('/');
	await page.evaluate(async (options) => {
		await window.createBrowserEditor({ value: '<p>alpha bravo charlie</p>', ...options });
	}, options);
	await page.locator('.se-wrapper-wysiwyg').click();
	// the click defers its own balloon toggle past its async hooks; let it land before the keys run
	await page.waitForTimeout(150);
}

const toolbarShown = (page, key) =>
	page.evaluate((key) => {
		const toolbar = window.browserEditor.$.context.get(key);
		return toolbar.style.display !== 'none' && toolbar.offsetWidth > 0;
	}, key);

const selectedText = (page) => page.evaluate(() => window.browserEditor.$.selection.get().toString());

for (const { name, options, key, always } of MODES) {
	test(`${name}: Esc hides the toolbar and keeps the selection`, async ({ page }) => {
		await setup(page, options);
		await page.keyboard.press('End');
		await page.keyboard.press('Shift+Home');
		await expect.poll(() => toolbarShown(page, key)).toBe(true);

		await page.keyboard.press('Escape');
		// past the balloon-always show delay (250ms), so a pending or keyup re-show would have landed
		await page.waitForTimeout(400);
		expect(await toolbarShown(page, key)).toBe(false);
		expect(await selectedText(page)).toBe('alpha bravo charlie');

		await page.keyboard.press('Shift+ArrowRight');
		await expect.poll(() => toolbarShown(page, key)).toBe(true);
	});

	if (always) {
		test(`${name}: Esc hides the toolbar shown at a collapsed caret`, async ({ page }) => {
			await setup(page, options);
			await page.keyboard.press('End');
			await expect.poll(() => toolbarShown(page, key)).toBe(true);

			await page.keyboard.press('Escape');
			await page.waitForTimeout(400);
			expect(await toolbarShown(page, key)).toBe(false);

			await page.keyboard.press('ArrowLeft');
			await expect.poll(() => toolbarShown(page, key)).toBe(true);
		});
	}
}

for (const mode of ['balloon', 'balloon-always']) {
	test(`${mode}: Esc closes an open dropdown first, then the toolbar`, async ({ page }) => {
		await setup(page, { mode, withAlign: true });
		await page.keyboard.press('End');
		await page.keyboard.press('Shift+Home');
		await expect.poll(() => toolbarShown(page, 'toolbar_main')).toBe(true);
		await page.locator('.se-toolbar-balloon button[data-command="align"]').click();
		await expect.poll(() => page.evaluate(() => window.browserEditor.$.menu.currentDropdownName)).toBe('align');

		await page.keyboard.press('Escape');
		await page.waitForTimeout(400);
		expect(await page.evaluate(() => window.browserEditor.$.menu.currentDropdownName)).toBeFalsy();
		expect(await toolbarShown(page, 'toolbar_main')).toBe(true);

		await page.keyboard.press('Escape');
		await page.waitForTimeout(400);
		expect(await toolbarShown(page, 'toolbar_main')).toBe(false);
		expect(await selectedText(page)).toBe('alpha bravo charlie');
	});
}
