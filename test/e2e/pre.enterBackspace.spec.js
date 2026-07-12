/**
 * @fileoverview Integration: Enter inside a PRE then Backspace removes the new empty row in one press.
 *
 * Enter in a PRE lands the caret on a bare <br> that begins an empty row. A deterministic backspace
 * handler (keydown.rule.backspace) removes that row, so it collapses in one press on every browser
 * (native backspace on a <br> caret is dead in Firefox). Runs on chromium for the real Enter→Backspace flow.
 */
const { test, expect } = require('@playwright/test');

test('Enter mid-PRE then Backspace removes the new empty row in one press', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => !!window.editor_root);

	await page.evaluate(() => window.editor_root.$.html.set('<pre>AAAA<br>BBBB</pre>'));
	await page.waitForTimeout(80);

	// native caret at the end of the first PRE row
	const pt = await page.evaluate(() => {
		const pre = document.querySelector('.se-wrapper-wysiwyg pre');
		const r = document.createRange();
		r.selectNodeContents(pre.firstChild); // "AAAA"
		const rect = r.getBoundingClientRect();
		return { x: Math.round(rect.right - 2), y: Math.round(rect.top + rect.height / 2) };
	});
	await page.mouse.click(pt.x, pt.y);
	await page.keyboard.press('End');
	await page.waitForTimeout(20);

	await page.keyboard.press('Enter');
	await page.waitForTimeout(80);
	const afterEnter = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg pre').querySelectorAll('br').length);
	expect(afterEnter).toBe(2); // a new <br> row was added

	await page.keyboard.press('Backspace');
	await page.waitForTimeout(80);

	const pre = await page.evaluate(() => {
		const p = document.querySelector('.se-wrapper-wysiwyg pre');
		return { brCount: p.querySelectorAll('br').length, text: p.textContent.replace(/​/g, '') };
	});
	expect(pre.brCount).toBe(1); // the empty row collapsed in ONE press
	expect(pre.text).toBe('AAAABBBB');
});
