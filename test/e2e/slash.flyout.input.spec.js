const { test, expect } = require('@playwright/test');

// A dropdown-free flyout is appended into the menu's own form, so the form-level mousedown guard
// (which keeps the editor selection alive while a row is clicked) also covered the flyout's form
// controls — the color picker's hex box could never be focused or typed into.
async function openFontColorFlyout(page) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 20000 });
	await page.evaluate(() => window.editor_root.$.html.set('<p><br></p>'));
	await page.waitForTimeout(300);

	await page.locator('.se-wrapper-wysiwyg p').first().click();
	await page.keyboard.type('/color'); // trigger must start the line
	await page.waitForTimeout(500);
	await page.keyboard.press('ArrowDown');
	await page.waitForTimeout(150);
	await page.keyboard.press('Enter'); // dropdown-free -> opens the flyout
	await page.waitForTimeout(500);
}

const hexInput = '.se-slash-command-menu input';

test('the flyout hex input can be focused and typed into', async ({ page }) => {
	await openFontColorFlyout(page);
	expect(await page.locator(hexInput).count()).toBe(1);

	// mousedown must reach the browser so the control gets its default focus
	const prevented = await page.evaluate((sel) => {
		const ev = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
		document.querySelector(sel).dispatchEvent(ev);
		return ev.defaultPrevented;
	}, hexInput);
	expect(prevented).toBe(false);

	await page.locator(hexInput).click();
	expect(await page.evaluate((sel) => document.activeElement === document.querySelector(sel), hexInput)).toBe(true);

	// typing must not yank focus back into the wysiwyg on the first keystroke
	await page.keyboard.type('ff0000');
	expect(await page.evaluate((sel) => document.activeElement === document.querySelector(sel), hexInput)).toBe(true);
	expect(await page.locator(hexInput).inputValue()).toContain('ff0000');
});

test('committing from the hex form consumes the typed trigger', async ({ page }) => {
	await openFontColorFlyout(page);

	await page.locator(hexInput).click();
	await page.locator(hexInput).fill('');
	await page.keyboard.type('#ff0000'); // real keydowns — these must not commit

	// the field commits through its own submit button, so the trigger is still untouched here
	expect(await page.evaluate(() => window.editor_root.$.html.get())).toContain('/color');

	await page.locator('.se-slash-command-menu button[type="submit"]').first().click();
	await page.waitForTimeout(500);

	// `prepareCommit` ran on the commit gesture: the trigger text is gone and the color applied
	const html = await page.evaluate(() => window.editor_root.$.html.get());
	expect(html).not.toContain('/color');
	expect(html).toContain('color: #ff0000');
});
