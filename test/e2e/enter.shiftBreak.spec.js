/**
 * @fileoverview Regression: Shift+Enter must insert a soft line break (`<br>`) that the editor owns,
 * NOT delegate to the browser's native `insertLineBreak`.
 *
 * Root cause guarded here: Enter moved from `keydown` to `beforeinput`, and the Shift+Enter branch
 * relied on the browser's native `insertLineBreak`. That is inconsistent across browsers:
 *  - an empty line no-ops (nothing happens),
 *  - Safari fires `insertParagraph` for Shift+Enter (behaves like plain Enter / splits the block),
 *  - a held key (auto-repeat) fires only `keydown`, not `beforeinput`, so it stops after the first.
 * The fix determines Shift from the real keydown Shift key and inserts the `<br>` itself
 * (`enter.shift.br`). These only reproduce with a NATIVE caret + trusted keyboard, so this is e2e.
 */
const { test, expect } = require('@playwright/test');

async function setContent(page, html) {
	await page.evaluate((h) => window.editor_root.$.html.set(h), html);
	await page.waitForTimeout(80);
}

async function clickLine(page, index) {
	const pos = await page.evaluate((i) => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		const el = ww.children[i];
		const r = el.getBoundingClientRect();
		return { x: Math.round(r.left + Math.min(8, r.width / 2)), y: Math.round(r.top + r.height / 2) };
	}, index);
	await page.mouse.click(pos.x, pos.y);
	await page.waitForTimeout(30);
}

// Hook setRange to capture which enter effect ran.
async function hookEffect(page) {
	await page.evaluate(() => {
		const sel = window.editor_root.$.selection;
		window.__effect = null;
		const orig = sel.setRange.bind(sel);
		sel.setRange = function (sc, so, ec, eo) {
			const m = new Error().stack.match(/enter\.\w+\.\w+/);
			if (m) window.__effect = m[0];
			return orig(sc, so, ec, eo);
		};
	});
}

async function shiftEnter(page) {
	await page.keyboard.press('Shift+Enter');
	await page.waitForTimeout(80);
}

async function snapshot(page) {
	return await page.evaluate(() => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		const caretLine = window.editor_root.$.format.getLine(document.getSelection().getRangeAt(0).startContainer, null);
		return {
			html: ww.innerHTML.replace(/​/g, '·'),
			lineCount: ww.children.length,
			brCount: ww.children[0] ? ww.children[0].querySelectorAll('br').length : 0,
			effect: window.__effect,
			caretInFirstBlock: caretLine === ww.children[0],
		};
	});
}

test.describe('Shift+Enter inserts a soft line break (not native, not a paragraph split)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	});

	test('empty line: Shift+Enter adds a break in the SAME block (the reported bug)', async ({ page }) => {
		await setContent(page, '<p><br></p>');
		await clickLine(page, 0);
		await hookEffect(page);
		await shiftEnter(page);
		const s = await snapshot(page);

		expect(s.effect).toBe('enter.shift.br');
		expect(s.lineCount).toBe(1); // NOT split into two <p> (that would be plain-Enter behavior)
		expect(s.brCount).toBeGreaterThanOrEqual(2); // original <br> + the inserted soft break
	});

	test('bare <br> line: Shift+Enter inserts a real break (not nested in the <br>), caret sticks, repeat works', async ({ page }) => {
		// Regression: on a `<p><br></p>` line the caret sits ON the `<br>`. A raw Range.insertNode there
		// would nest the new `<br>` inside the old one; the effect re-anchors to the line so the break lands
		// as a sibling, and the block grows one rendered line per press.
		await setContent(page, '<p><br></p>');
		const h0 = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children[0].getBoundingClientRect().height);
		await clickLine(page, 0);

		await shiftEnter(page);
		const h1 = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children[0].getBoundingClientRect().height);
		expect(h1).toBeGreaterThan(h0); // one more rendered line

		// caret stuck on the new line — typing lands there, and a second break keeps growing
		await page.keyboard.type('x');
		await shiftEnter(page);
		await page.keyboard.type('y');
		await page.waitForTimeout(40);
		const text = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children[0].textContent.replace(/​/g, ''));
		expect(text).toBe('xy');
		const lineCount = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children.length);
		expect(lineCount).toBe(1); // still one block, just multiple soft-broken rows
	});

	test('text line end: Shift+Enter keeps one block, caret on the new line', async ({ page }) => {
		await setContent(page, '<p>AAA</p>');
		await clickLine(page, 0);
		await page.keyboard.press('End');
		await hookEffect(page);
		await shiftEnter(page);
		const s = await snapshot(page);

		expect(s.effect).toBe('enter.shift.br');
		expect(s.lineCount).toBe(1);
		expect(s.brCount).toBeGreaterThanOrEqual(1);
		expect(s.caretInFirstBlock).toBe(true);
	});

	test('mid-line: Shift+Enter splits the text within the same block', async ({ page }) => {
		await setContent(page, '<p>ABCD</p>');
		await clickLine(page, 0);
		await page.keyboard.press('Home');
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowRight'); // caret after "AB"
		await hookEffect(page);
		await shiftEnter(page);
		const s = await snapshot(page);

		expect(s.effect).toBe('enter.shift.br');
		expect(s.lineCount).toBe(1);
		// text split around the inserted <br>, still one paragraph
		expect(s.html).toMatch(/AB<br>.*CD/);
	});

	test('repeated Shift+Enter on empty lines adds ONE break each (no doubling)', async ({ page }) => {
		await setContent(page, '<p>AAA</p>');
		await clickLine(page, 0);
		await page.keyboard.press('End');
		await shiftEnter(page);
		await shiftEnter(page);
		await shiftEnter(page);
		const s = await snapshot(page);

		expect(s.lineCount).toBe(1); // never splits into multiple blocks
		expect(s.brCount).toBe(3); // exactly 3 soft breaks for 3 presses
	});

	test('plain Enter is unaffected: still splits into a new paragraph', async ({ page }) => {
		await setContent(page, '<p>AAA</p>');
		await clickLine(page, 0);
		await page.keyboard.press('End');
		await page.keyboard.press('Enter');
		await page.waitForTimeout(80);
		const lineCount = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children.length);

		expect(lineCount).toBe(2);
	});
});

/**
 * Regression: the soft-break `<br>` is anchored by a zero-width space so the caret sticks on the new
 * empty line (a caret on a bare `<br>` does not hold — the next Shift+Enter would collapse onto it).
 * A native Backspace/Delete would strip only that invisible anchor and leave the break in place, which
 * looks like "nothing happened". The editor removes the `<br>` + anchor so ONE press undoes ONE break.
 */
test.describe('Backspace / Delete on a soft line break removes it in one press', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	});

	async function brCount(page) {
		return await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children[0].querySelectorAll('br').length);
	}
	async function text(page) {
		return await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children[0].textContent.replace(/​/g, ''));
	}

	test('Shift+Enter then Backspace returns to the original text in one press', async ({ page }) => {
		await setContent(page, '<p>hello</p>');
		await clickLine(page, 0);
		await page.keyboard.press('End');
		await shiftEnter(page);
		expect(await brCount(page)).toBeGreaterThanOrEqual(1);

		await page.keyboard.press('Backspace');
		await page.waitForTimeout(60);
		expect(await brCount(page)).toBe(0);
		expect(await text(page)).toBe('hello');
	});

	test('Shift+Enter x2 then Backspace x2 removes one break each', async ({ page }) => {
		await setContent(page, '<p>hello</p>');
		await clickLine(page, 0);
		await page.keyboard.press('End');
		await shiftEnter(page);
		await shiftEnter(page);
		expect(await brCount(page)).toBe(2);

		await page.keyboard.press('Backspace');
		await page.waitForTimeout(60);
		expect(await brCount(page)).toBe(1);
		await page.keyboard.press('Backspace');
		await page.waitForTimeout(60);
		expect(await brCount(page)).toBe(0);
		expect(await text(page)).toBe('hello');
	});

	test('Delete at the end of the text before a soft break removes the break', async ({ page }) => {
		await setContent(page, '<p>hello</p>');
		await clickLine(page, 0);
		await page.keyboard.press('End');
		await shiftEnter(page);
		// put the caret back at the end of "hello" (just before the <br>)
		await page.evaluate(() => {
			const t = document.querySelector('.se-wrapper-wysiwyg').children[0].firstChild;
			window.editor_root.$.selection.setRange(t, t.textContent.length, t, t.textContent.length);
		});
		await page.waitForTimeout(20);
		await page.keyboard.press('Delete');
		await page.waitForTimeout(60);

		expect(await brCount(page)).toBe(0);
		expect(await text(page)).toBe('hello');
	});

	test('Delete still joins the next paragraph (soft-break guard does not steal a trailing <br>)', async ({ page }) => {
		await setContent(page, '<p>text<br></p><p>next</p>');
		await page.evaluate(() => {
			const t = document.querySelector('.se-wrapper-wysiwyg').children[0].firstChild;
			window.editor_root.$.selection.setRange(t, 4, t, 4);
		});
		await page.waitForTimeout(20);
		await page.keyboard.press('Delete');
		await page.waitForTimeout(60);

		const html = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').innerHTML);
		expect(html).toContain('textnext');
	});

	test('Backspace on a soft break at the line start keeps the caret usable (no detached selection)', async ({ page }) => {
		// Shift+Enter on an empty line puts the new <br> as the line's FIRST child, anchored by a zws:
		// <p><br>​<br></p>, caret in the zws. Backspace removes the anchor + leading <br>; because that <br>
		// has no previousSibling, the effect must fall back to the line start instead of leaving the caret
		// in the removed zws. If it doesn't, the next keystroke is lost / lands in a detached node.
		await setContent(page, '<p><br></p>');
		await clickLine(page, 0);
		await shiftEnter(page);
		expect(await brCount(page)).toBeGreaterThanOrEqual(2);

		await page.keyboard.press('Backspace');
		await page.waitForTimeout(60);
		await page.keyboard.type('x');
		await page.waitForTimeout(40);

		const lineCount = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children.length);
		expect(lineCount).toBe(1); // still one block
		expect(await text(page)).toBe('x'); // caret survived the merge: typing landed in this block
	});

	test('Backspace on a soft break after inline formatting removes only the break, not the <strong>', async ({ page }) => {
		// Concern: the effect deletes `zws.previousSibling`. That sibling is guaranteed by the rule to be
		// the soft-break <br>, never the preceding <strong>. So the bold text (any length) must survive —
		// only the <br> + zws anchor are removed, and the caret merges to the end of the bold text.
		// Place the caret AFTER the <strong> (end of the line) so Shift+Enter appends the <br> as a sibling
		// and anchors it with a zws → <p><strong>bold text</strong><br>​</p>, the shape that runs
		// backspace.softBreak.merge with the <strong> as its merge target.
		await setContent(page, '<p><strong>bold text</strong></p>');
		await page.evaluate(() => {
			const p = document.querySelector('.se-wrapper-wysiwyg').children[0];
			window.editor_root.$.selection.setRange(p, p.childNodes.length, p, p.childNodes.length);
		});
		await page.waitForTimeout(20);
		await shiftEnter(page);
		expect(await brCount(page)).toBeGreaterThanOrEqual(1);

		await page.keyboard.press('Backspace');
		await page.waitForTimeout(60);

		const strong = await page.evaluate(() => {
			const p = document.querySelector('.se-wrapper-wysiwyg').children[0];
			const els = p.querySelectorAll('strong');
			return { count: els.length, text: els[0] ? els[0].textContent.replace(/​/g, '') : null };
		});
		expect(strong.count).toBe(1); // the <strong> is not deleted
		expect(strong.text).toBe('bold text'); // every character survives
		expect(await brCount(page)).toBe(0); // only the soft break was removed

		// caret merged to the end of the bold text: typing extends it inside the <strong>
		await page.keyboard.type('!');
		await page.waitForTimeout(40);
		expect(await text(page)).toBe('bold text!');
	});

	test('Delete on a soft break at the line start keeps the caret usable (no detached selection)', async ({ page }) => {
		// Same <p><br>​<br></p> shape; move the caret to the START of the anchor (offset 0) so Delete's
		// case-2 fires (zws at offset 0 whose previousSibling is the leading <br>). The leading <br> has no
		// previousSibling, so the effect must fall back to the line start rather than orphan the caret.
		await setContent(page, '<p><br></p>');
		await clickLine(page, 0);
		await shiftEnter(page);

		const hasAnchor = await page.evaluate(() => {
			const p = document.querySelector('.se-wrapper-wysiwyg').children[0];
			const zws = Array.from(p.childNodes).find((n) => n.nodeType === 3);
			if (!zws) return false;
			window.editor_root.$.selection.setRange(zws, 0, zws, 0);
			return true;
		});
		expect(hasAnchor).toBe(true);
		await page.waitForTimeout(20);

		await page.keyboard.press('Delete');
		await page.waitForTimeout(60);
		await page.keyboard.type('y');
		await page.waitForTimeout(40);

		const lineCount = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children.length);
		expect(lineCount).toBe(1);
		expect(await text(page)).toBe('y'); // caret survived the merge: typing landed in this block
	});
});
