/**
 * @fileoverview Regression for https://github.com/JiHong88/suneditor/issues/1731
 *
 * When the last styled character at the caret is deleted with Backspace, the styled element
 * leaves the DOM, so the toolbar's ancestor walk finds nothing and deactivates the style button.
 * The browser, however, keeps its pending typing style, and newly typed text is still styled.
 * The button must stay `active` for as long as typing would produce styled text.
 */
const { test, expect } = require('@playwright/test');

async function clickAtTextEnd(page) {
	await page.evaluate(() => {
		const p = document.querySelector('.se-wrapper-wysiwyg p').firstChild;
		window.editor_root.$.selection.setRange(p, p.length, p, p.length);
	});
}

async function buttonActive(page, command) {
	return page.evaluate((cmd) => document.querySelector(`button[data-command="${cmd}"]`).classList.contains('active'), command);
}

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate(() => window.editor_root.$.html.set('<p>Some plain text.</p>'));
	await clickAtTextEnd(page);
});

test('underline button stays active after deleting the typed text (#1731)', async ({ page }) => {
	await page.evaluate(() => document.querySelector('button[data-command="underline"]').click());
	await page.keyboard.type('hello', { delay: 20 });
	await expect(page.locator('button[data-command="underline"]').first()).toHaveClass(/active/);

	for (let i = 0; i < 5; i++) await page.keyboard.press('Backspace');
	await page.waitForTimeout(100);

	// the styled element is gone, but the browser still types underlined text
	await expect(page.locator('.se-wrapper-wysiwyg u').first()).toHaveCount(0);
	await expect(page.locator('button[data-command="underline"]').first()).toHaveClass(/active/);

	await page.keyboard.type('x');
	await expect(page.locator('.se-wrapper-wysiwyg u').first()).toHaveText('x');
});

test('bold button stays active after deleting the typed text (#1731)', async ({ page }) => {
	await page.evaluate(() => document.querySelector('button[data-command="bold"]').click());
	await page.keyboard.type('hello', { delay: 20 });
	await expect(page.locator('button[data-command="bold"]').first()).toHaveClass(/active/);

	for (let i = 0; i < 5; i++) await page.keyboard.press('Backspace');
	await page.waitForTimeout(100);

	await expect(page.locator('.se-wrapper-wysiwyg strong').first()).toHaveCount(0);
	await expect(page.locator('button[data-command="bold"]').first()).toHaveClass(/active/);

	await page.keyboard.type('x');
	const tag = await page.evaluate(() => {
		const p = document.querySelector('.se-wrapper-wysiwyg p');
		return p.lastElementChild ? p.lastElementChild.nodeName.toLowerCase() : null;
	});
	expect(['strong', 'b']).toContain(tag);
});

test('plain typing never activates the style buttons', async ({ page }) => {
	await page.keyboard.type('plain', { delay: 20 });
	await page.waitForTimeout(60);

	expect(await buttonActive(page, 'underline')).toBe(false);
	expect(await buttonActive(page, 'bold')).toBe(false);
	await expect(page.locator('.se-wrapper-wysiwyg u').first()).toHaveCount(0);
});
