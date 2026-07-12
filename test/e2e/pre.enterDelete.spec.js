/**
 * @fileoverview Integration: Delete on an empty row inside a PRE (created by Enter) removes it in one
 * press, and Delete on an empty line directly before a PRE merges into the PRE.
 *
 * Enter in a PRE lands the caret on a bare <br> that ends an empty row. A deterministic delete handler
 * (keydown.rule.delete) removes that <br>, so the row collapses in one press on every browser (native
 * delete on a <br> caret is dead in Firefox). Runs on chromium for the real Enter→Delete flow.
 */
const { test, expect } = require('@playwright/test');

async function setContent(page, html) {
	await page.evaluate((h) => window.editor_root.$.html.set(h), html);
	await page.waitForTimeout(80);
}

test('Enter mid-PRE then Delete removes the new empty row in one press', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => !!window.editor_root);

	await setContent(page, '<pre>AAAA<br>BBBB</pre>');
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
	expect(await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg pre').querySelectorAll('br').length)).toBe(2);

	await page.keyboard.press('Delete');
	await page.waitForTimeout(80);

	const pre = await page.evaluate(() => {
		const p = document.querySelector('.se-wrapper-wysiwyg pre');
		return { brCount: p.querySelectorAll('br').length, text: p.textContent.replace(/​/g, '') };
	});
	expect(pre.brCount).toBe(1); // empty row collapsed in ONE press
	expect(pre.text).toBe('AAAABBBB');
});

test('Delete on an empty line before a PRE merges into the PRE', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => !!window.editor_root);

	await setContent(page, '<p>top</p><p>​<br></p><pre>code line 1<br>code line 2</pre>');
	// native caret in the empty middle <p>
	const pt = await page.evaluate(() => {
		const p = document.querySelectorAll('.se-wrapper-wysiwyg > p')[1];
		const r = p.getBoundingClientRect();
		return { x: Math.round(r.left + 6), y: Math.round(r.top + r.height / 2) };
	});
	await page.mouse.click(pt.x, pt.y);
	await page.waitForTimeout(20);

	await page.keyboard.press('Delete');
	await page.waitForTimeout(80);

	const state = await page.evaluate(() => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		const r = document.getSelection().getRangeAt(0);
		return {
			tags: [...ww.children].map((c) => c.nodeName),
			caretInPre: window.editor_root.$.format.getLine(r.startContainer, null)?.nodeName === 'PRE',
		};
	});
	expect(state.tags).toEqual(['P', 'PRE']); // the empty <p> was removed
	expect(state.caretInPre).toBe(true); // caret moved into the PRE
});

// Regression guard for the reported "새줄 delete 안됨": Enter makes a fresh empty normal line, and Delete on
// it pulls the next line up in one press. Also verifies the keydown restructure didn't break normal delete.
test('Enter then Delete on a normal empty line pulls the next line up in one press', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => !!window.editor_root);

	await setContent(page, '<p>AAA</p><p>BBB</p>');
	// native caret at end of AAA
	const pt = await page.evaluate(() => {
		const p = document.querySelector('.se-wrapper-wysiwyg p');
		const r = document.createRange();
		r.selectNodeContents(p.firstChild);
		const rect = r.getBoundingClientRect();
		return { x: Math.round(rect.right - 2), y: Math.round(rect.top + rect.height / 2) };
	});
	await page.mouse.click(pt.x, pt.y);
	await page.keyboard.press('End');
	await page.waitForTimeout(20);

	await page.keyboard.press('Enter'); // -> <p>AAA</p><p>(empty)</p><p>BBB</p>
	await page.waitForTimeout(60);
	expect(await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children.length)).toBe(3);

	await page.keyboard.press('Delete'); // pulls BBB up onto the empty line
	await page.waitForTimeout(60);

	const after = await page.evaluate(() => ({
		lines: document.querySelector('.se-wrapper-wysiwyg').children.length,
		text: document.querySelector('.se-wrapper-wysiwyg').textContent.replace(/​/g, ''),
	}));
	expect(after.lines).toBe(2);
	expect(after.text).toBe('AAABBB');
});
