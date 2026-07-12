/**
 * @fileoverview Regression: double-Enter on the LAST row of a PRE exits the brLine (creates a new
 * default line after it), and double-Enter in a MIDDLE row does not exit (stays in the PRE).
 *
 * Root cause guarded here: the Enter actions placed the caret on a zero-width Text node after the <br>
 * (a Firefox-backspace workaround). That extra zwsp broke the second Enter's exit-detection pattern, so
 * the PRE could not be exited. Backspace is now deterministic, so the zwsp was removed from the Enter
 * actions and the caret sits on the <br> again — restoring the exit.
 */
const { test, expect } = require('@playwright/test');

async function setContent(page, html) {
	await page.evaluate((h) => window.editor_root.$.html.set(h), html);
	await page.waitForTimeout(80);
}

async function caretAtEndOfRow(page, rowText) {
	const pt = await page.evaluate((t) => {
		const pre = document.querySelector('.se-wrapper-wysiwyg pre');
		const node = [...pre.childNodes].find((n) => n.nodeType === 3 && n.textContent === t);
		const r = document.createRange();
		r.selectNodeContents(node);
		const rect = r.getBoundingClientRect();
		return { x: Math.round(rect.right - 2), y: Math.round(rect.top + rect.height / 2) };
	}, rowText);
	await page.mouse.click(pt.x, pt.y);
	await page.keyboard.press('End');
	await page.waitForTimeout(20);
}

function childTags(page) {
	return page.evaluate(() => [...document.querySelector('.se-wrapper-wysiwyg').children].map((c) => c.nodeName));
}

test('Enter exits the PRE only on a second consecutive trailing empty row', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => !!window.editor_root);

	await setContent(page, '<pre>L1<br>L2<br>L3</pre>');
	await caretAtEndOfRow(page, 'L3');

	// A single trailing empty row must NOT exit (it can look like a blank line below, but the line
	// above it is content). First Enter → one empty row; second Enter → a *second* empty row, still
	// inside the PRE.
	await page.keyboard.press('Enter');
	await page.waitForTimeout(60);
	await page.keyboard.press('Enter');
	await page.waitForTimeout(60);
	expect(await childTags(page)).toEqual(['PRE']); // no premature exit

	// Now the caret is on the last empty row with an empty row above it (two consecutive) → exit.
	await page.keyboard.press('Enter');
	await page.waitForTimeout(60);
	expect(await childTags(page)).toEqual(['PRE', 'P']);

	// Exit must consume ONLY the caret's current row — the content and the empty row above it survive
	// (regression: exit used to strip every trailing empty row, wiping the lines above).
	const pre = await page.evaluate(() => {
		const p = document.querySelector('.se-wrapper-wysiwyg pre');
		return { text: p.textContent.replace(/​/g, ''), brCount: p.querySelectorAll('br').length };
	});
	expect(pre.text).toBe('L1L2L3');
	expect(pre.brCount).toBe(4); // L1<br>L2<br>L3<br><br> — one empty row preserved above the exit point
});

test('double-Enter in a middle PRE row stays inside the brLine', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => !!window.editor_root);

	await setContent(page, '<pre>L1<br>L2<br>L3</pre>');
	await caretAtEndOfRow(page, 'L2');
	await page.keyboard.press('Enter');
	await page.waitForTimeout(60);
	await page.keyboard.press('Enter');
	await page.waitForTimeout(60);

	expect(await childTags(page)).toEqual(['PRE']); // still one PRE, no exit
});
