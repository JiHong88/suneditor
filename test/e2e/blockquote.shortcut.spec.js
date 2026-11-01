/**
 * @fileoverview The blockquote text shortcut: typing `>` then Space at the start of a line turns the line into a
 * blockquote, like `1.` / `*.` + Space make a list. The keydown handler ignores untrusted events, so the real
 * keystroke path is only reachable with a native keyboard (jsdom cases: `test/integration/blockquote.shortcut.spec.js`).
 */
const { test, expect } = require('@playwright/test');

async function setContent(page, html) {
	await page.evaluate((h) => window.editor_root.$.html.set(h), html);
	await page.waitForTimeout(80);
}

/** Focuses the editor and puts the caret at `offset` in the first line (`-1`: its end). */
async function caretAt(page, offset) {
	const pos = await page.evaluate(() => {
		const r = document.querySelector('.se-wrapper-wysiwyg').children[0].getBoundingClientRect();
		return { x: Math.round(r.left + 4), y: Math.round(r.top + r.height / 2) };
	});
	await page.mouse.click(pos.x, pos.y);
	await page.evaluate((o) => {
		const line = document.querySelector('.se-wrapper-wysiwyg').children[0];
		const text = line.firstChild.nodeType === 3 ? line.firstChild : line;
		const at = o < 0 ? (text.nodeType === 3 ? text.length : 0) : o;
		window.editor_root.$.selection.setRange(text, at, text, at);
	}, offset);
	await page.waitForTimeout(30);
}

async function snapshot(page) {
	return await page.evaluate(() => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		const quote = ww.querySelector('blockquote');
		return {
			html: ww.innerHTML.replace(/​/g, '·'),
			lineHeight: quote?.firstElementChild ? Math.round(quote.firstElementChild.getBoundingClientRect().height) : 0,
		};
	});
}

test.describe('Blockquote text shortcut (">" + Space)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
		const ready = await page.evaluate(() => window.editor_root.$.shortcuts.keyMap.has('>'));
		expect(ready).toBe(true);
	});

	test('on an empty line: makes a visible blockquote and the typing after it lands inside', async ({ page }) => {
		await setContent(page, '<p><br></p>');
		await caretAt(page, 0);

		await page.keyboard.type('> ');
		await page.waitForTimeout(80);
		const s = await snapshot(page);
		expect(s.html).toMatch(/^<blockquote><p[^>]*>·?<br><\/p><\/blockquote>$/); // the dev page may mark an empty line as a placeholder
		expect(s.lineHeight).toBeGreaterThan(0); // an empty `<p></p>` collapses and the line disappears

		await page.keyboard.type('quote');
		await page.waitForTimeout(80);
		expect((await snapshot(page)).html).toMatch(/^<blockquote><p>·*quote(<br>)?<\/p><\/blockquote>$/); // `·`: zero-width spaces an empty line keeps, as with the toolbar button
	});

	test('before existing text: keeps the text and drops the ">"', async ({ page }) => {
		await setContent(page, '<p>abc</p>');
		await caretAt(page, 0);

		await page.keyboard.type('> ');
		await page.waitForTimeout(80);
		expect((await snapshot(page)).html).toBe('<blockquote><p>abc</p></blockquote>');
	});

	test('in the middle of a line: types ">" and a space as text', async ({ page }) => {
		await setContent(page, '<p>a</p>');
		await caretAt(page, -1);

		await page.keyboard.type('> ');
		await page.waitForTimeout(80);
		const s = await snapshot(page);
		expect(s.html).not.toContain('<blockquote>');
		expect(s.html).toMatch(/^<p>a&gt;(\s|&nbsp;)<\/p>$/);
	});
});
